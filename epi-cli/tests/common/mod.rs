use std::env;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::{Command, Output};
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{SystemTime, UNIX_EPOCH};

static NEXT_ID: AtomicU64 = AtomicU64::new(1);

#[derive(Debug)]
pub struct TestEnv {
    pub root: PathBuf,
    pub home: PathBuf,
    pub repo_root: PathBuf,
    pub fake_pi_log: PathBuf,
    extra_env: Vec<(String, String)>,
    path_prefixes: Vec<PathBuf>,
}

impl TestEnv {
    pub fn empty() -> Self {
        let root = unique_temp_dir("epi-agent-tests");
        let home = root.join("home");
        let repo_root = root.join("repo");
        fs::create_dir_all(&home).unwrap();
        fs::create_dir_all(&repo_root).unwrap();
        Self {
            root,
            home,
            repo_root,
            fake_pi_log: PathBuf::new(),
            extra_env: Vec::new(),
            path_prefixes: Vec::new(),
        }
    }

    pub fn repo_with_pi() -> Self {
        let env = Self::empty();
        fs::create_dir_all(env.repo_root.join(".pi/extensions")).unwrap();
        fs::create_dir_all(env.repo_root.join(".pi/prompts")).unwrap();
        fs::write(
            env.repo_root.join(".pi/README.md"),
            "# PI Agent Foundation\n",
        )
        .unwrap();
        fs::write(
            env.repo_root.join(".pi/composite-entry.ts"),
            "export async function main() {\n  await import(\"./extensions/epi-citta.ts\");\n  await import(\"./extensions/cross-agent.ts\");\n  await import(\"./extensions/subagent-widget.ts\");\n  await import(\"./extensions/agent-team.ts\");\n  await import(\"./extensions/agent-chain.ts\");\n  await import(\"./extensions/child-extension-propagation.ts\");\n  await import(\"./extensions/prompt-url-widget.ts\");\n  await import(\"./extensions/redraws.ts\");\n  await import(\"./extensions/themeMap.ts\");\n}\n",
        )
        .unwrap();
        for (name, content) in curated_extension_files() {
            fs::write(
                env.repo_root.join(format!(".pi/extensions/{name}")),
                content,
            )
            .unwrap();
        }
        fs::write(
            env.repo_root.join(".pi/prompts/epi-system.md"),
            "# Epi System\n",
        )
        .unwrap();
        fs::write(
            env.repo_root.join(".pi/prompts/epi-agent-help.md"),
            "# Epi Help\n",
        )
        .unwrap();
        env
    }

    pub fn repo_with_assets() -> Self {
        let env = Self::repo_with_pi();
        fs::create_dir_all(env.repo_root.join("skills/epi-cli")).unwrap();
        fs::create_dir_all(env.repo_root.join("skills/graph")).unwrap();
        fs::create_dir_all(env.repo_root.join("skills/vault")).unwrap();
        fs::create_dir_all(env.repo_root.join("commands")).unwrap();
        fs::create_dir_all(env.repo_root.join("hooks")).unwrap();
        fs::write(env.repo_root.join("skills/README.md"), "# Skills\n").unwrap();
        fs::write(
            env.repo_root.join("skills/epi-cli/SKILL.md"),
            "# Epi CLI Skill\n",
        )
        .unwrap();
        fs::write(
            env.repo_root.join("skills/graph/SKILL.md"),
            "# Graph Skill\n",
        )
        .unwrap();
        fs::write(
            env.repo_root.join("skills/vault/SKILL.md"),
            "# Vault Skill\n",
        )
        .unwrap();
        fs::write(env.repo_root.join("commands/README.md"), "# Commands\n").unwrap();
        fs::write(
            env.repo_root.join("commands/model-status.md"),
            "# Model Status\n",
        )
        .unwrap();
        fs::write(
            env.repo_root.join("commands/graph-context.md"),
            "# Graph Context\n",
        )
        .unwrap();
        fs::write(
            env.repo_root.join("commands/core-verify.md"),
            "# Core Verify\n",
        )
        .unwrap();
        fs::write(env.repo_root.join("hooks/README.md"), "# Hooks\n").unwrap();
        fs::write(
            env.repo_root.join("hooks/manifest.json"),
            "{\n  \"hooks\": [\"pre-agent-run\", \"post-agent-run\", \"pre-epi-command\", \"post-epi-command\"]\n}\n",
        )
        .unwrap();
        fs::write(
            env.repo_root.join("hooks/pre-agent-run.sh"),
            "#!/bin/sh\nexit 0\n",
        )
        .unwrap();
        fs::write(
            env.repo_root.join("hooks/post-agent-run.sh"),
            "#!/bin/sh\nexit 0\n",
        )
        .unwrap();
        fs::write(
            env.repo_root.join("hooks/pre-epi-command.sh"),
            "#!/bin/sh\nexit 0\n",
        )
        .unwrap();
        fs::write(
            env.repo_root.join("hooks/post-epi-command.sh"),
            "#!/bin/sh\nexit 0\n",
        )
        .unwrap();
        env
    }

    pub fn with_fake_pi() -> Self {
        let mut env = Self::repo_with_pi();
        let bin_dir = env.root.join("bin");
        fs::create_dir_all(&bin_dir).unwrap();
        let log_dir = env.root.join("fake-pi-log");
        fs::create_dir_all(&log_dir).unwrap();
        let script_path = bin_dir.join("pi");
        fs::write(
            &script_path,
            format!(
                "#!/bin/sh\nprintf '%s\n' \"$@\" > \"{argv}\"\nenv | sort > \"{envs}\"\n",
                argv = log_dir.join("argv.txt").display(),
                envs = log_dir.join("env.txt").display()
            ),
        )
        .unwrap();
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;

            let mut perms = fs::metadata(&script_path).unwrap().permissions();
            perms.set_mode(0o755);
            fs::set_permissions(&script_path, perms).unwrap();
        }
        env.fake_pi_log = log_dir;
        env.path_prefixes.push(bin_dir);
        env
    }

    pub fn with_env(mut self, key: impl Into<String>, value: impl Into<String>) -> Self {
        self.extra_env.push((key.into(), value.into()));
        self
    }
}

impl Drop for TestEnv {
    fn drop(&mut self) {
        if !self.root.as_os_str().is_empty() {
            let _ = fs::remove_dir_all(&self.root);
        }
    }
}

pub fn run_epi(args: &[&str], env: &TestEnv) -> TestOutput {
    let exe = env!("CARGO_BIN_EXE_epi");
    let mut command = Command::new(exe);
    command.args(args);
    command.current_dir(&env.repo_root);
    command.env("HOME", &env.home);
    command.env("EPI_REPO_ROOT", &env.repo_root);
    command.env_remove("EPI_AGENT_HOME");
    command.env_remove("EPI_AGENT_DIR");
    command.env_remove("PI_CODING_AGENT_DIR");

    if !env.path_prefixes.is_empty() {
        let mut path_entries: Vec<PathBuf> = env.path_prefixes.clone();
        if let Some(existing) = env::var_os("PATH") {
            path_entries.extend(env::split_paths(&existing));
        }
        let joined = env::join_paths(path_entries).unwrap();
        command.env("PATH", joined);
    }

    for (key, value) in &env.extra_env {
        command.env(key, value);
    }

    let output = command.output().unwrap();
    TestOutput::from(output)
}

pub fn read_to_string(path: impl AsRef<Path>) -> String {
    fs::read_to_string(path).unwrap()
}

pub fn write_file(path: impl AsRef<Path>, contents: &str) -> PathBuf {
    let path = path.as_ref().to_path_buf();
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).unwrap();
    }
    fs::write(&path, contents).unwrap();
    path
}

pub fn write_executable(path: impl AsRef<Path>, contents: &str) -> PathBuf {
    let path = write_file(path, contents);
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;

        let mut perms = fs::metadata(&path).unwrap().permissions();
        perms.set_mode(0o755);
        fs::set_permissions(&path, perms).unwrap();
    }
    path
}

#[derive(Debug, Clone)]
pub struct PluginFixture {
    pub root: PathBuf,
    pub skill_path: PathBuf,
    pub subagent_path: PathBuf,
    pub hooks_path: PathBuf,
    pub hook_script_path: PathBuf,
}

pub fn create_plugin_bundle(base_dir: impl AsRef<Path>, name: &str) -> PluginFixture {
    let root = base_dir.as_ref().join(name);
    let skill_path = write_file(
        root.join("skills/review/SKILL.md"),
        r#"---
name: review
description: Review code for correctness
allowed-tools:
  - Read
  - Bash
user-invocable: true
---

# Review

Inspect the codebase and report risks first.
"#,
    );
    let subagent_path = write_file(
        root.join("agents/reviewer.md"),
        r#"---
name: reviewer
description: Focused verification subagent
tools:
  - Read
  - Bash
model: sonnet
permissionMode: default
skills:
  - review
---

# Reviewer

Verify the requested change before completion.
"#,
    );
    let hook_script_path = write_executable(
        root.join("hooks/scripts/pre_tool_use.sh"),
        "#!/bin/sh\ncat > \"$HOOK_CAPTURE_PATH\"\nprintf '{\"continue\":true,\"decision\":\"allow\"}\\n'\n",
    );
    let hooks_path = write_file(
        root.join("hooks/hooks.json"),
        r#"{
  "hooks": [
    {
      "event": "PreToolUse",
      "hooks": [
        {
          "type": "command",
          "command": "./scripts/pre_tool_use.sh"
        }
      ]
    }
  ]
}
"#,
    );
    write_file(
        root.join(".claude-plugin/plugin.json"),
        &format!(
            "{{\n  \"name\": \"{name}\",\n  \"version\": \"0.1.0\",\n  \"description\": \"{name} plugin\"\n}}\n"
        ),
    );

    PluginFixture {
        root,
        skill_path,
        subagent_path,
        hooks_path,
        hook_script_path,
    }
}

pub struct TestOutput {
    pub status: std::process::ExitStatus,
    pub stdout: String,
    pub stderr: String,
}

impl From<Output> for TestOutput {
    fn from(output: Output) -> Self {
        Self {
            status: output.status,
            stdout: String::from_utf8_lossy(&output.stdout).to_string(),
            stderr: String::from_utf8_lossy(&output.stderr).to_string(),
        }
    }
}

fn unique_temp_dir(prefix: &str) -> PathBuf {
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    let unique = NEXT_ID.fetch_add(1, Ordering::Relaxed);
    let dir = env::temp_dir().join(format!(
        "{prefix}-{}-{timestamp}-{unique}",
        std::process::id()
    ));
    fs::create_dir_all(&dir).unwrap();
    dir
}

fn curated_extension_files() -> Vec<(&'static str, &'static str)> {
    vec![
        (
            "epi-citta.ts",
            "export function registerTool(name = \"epi_core_verify\") {\n  return { name };\n}\n",
        ),
        (
            "cross-agent.ts",
            "export function registerCrossAgent() {\n  return \"cross-agent\";\n}\n",
        ),
        (
            "subagent-widget.ts",
            "export function registerSubagentWidget() {\n  return \"subagent-widget\";\n}\n",
        ),
        (
            "agent-team.ts",
            "export function registerAgentTeam() {\n  return \"agent-team\";\n}\n",
        ),
        (
            "agent-chain.ts",
            "export function registerAgentChain() {\n  return \"agent-chain\";\n}\n",
        ),
        (
            "child-extension-propagation.ts",
            "export function propagateChildExtensions() {\n  return true;\n}\n",
        ),
        (
            "prompt-url-widget.ts",
            "export function registerPromptUrlWidget() {\n  return \"prompt-url-widget\";\n}\n",
        ),
        (
            "redraws.ts",
            "export function registerRedraws() {\n  return \"redraws\";\n}\n",
        ),
        (
            "themeMap.ts",
            "export const themeMap = {\n  dawn: \"sunrise\"\n};\n",
        ),
    ]
}
