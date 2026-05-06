use clap::Subcommand;
use std::path::{Path, PathBuf};
use std::process::Command;

#[derive(Subcommand)]
pub enum AppCmd {
    /// Launch the EpiLogos Electron app
    Launch,
    /// Run the app in dev mode from source (npm run dev)
    Dev,
    /// Build the app from source (npm run build)
    Build,
}

pub fn dispatch(cmd: &AppCmd) {
    let repo_root = repo_root();

    match cmd {
        AppCmd::Launch => {
            let app_bundle = app_bundle_path(&repo_root);
            let app_launcher = app_launcher_path(&repo_root);
            let status = launch_command_for_repo(&repo_root).status();
            match status {
                Ok(s) if !s.success() => std::process::exit(s.code().unwrap_or(1)),
                Err(e) => {
                    eprintln!("epi app: failed to launch: {}", e);
                    eprintln!("  expected bundle: {}", app_bundle.display());
                    eprintln!("  expected launcher: {}", app_launcher.display());
                    std::process::exit(1);
                }
                _ => {}
            }
        }
        AppCmd::Dev => {
            let app_source = app_source_dir(&repo_root);
            let status = dev_command_for_repo(&repo_root).status();
            match status {
                Ok(s) if !s.success() => std::process::exit(s.code().unwrap_or(1)),
                Err(e) => {
                    eprintln!("epi app dev: failed to start: {}", e);
                    eprintln!("  source dir: {}", app_source.display());
                    std::process::exit(1);
                }
                _ => {}
            }
        }
        AppCmd::Build => {
            let app_source = app_source_dir(&repo_root);
            let status = build_command_for_repo(&repo_root).status();
            match status {
                Ok(s) if !s.success() => std::process::exit(s.code().unwrap_or(1)),
                Err(e) => {
                    eprintln!("epi app build: failed: {}", e);
                    eprintln!("  source dir: {}", app_source.display());
                    std::process::exit(1);
                }
                _ => {}
            }
        }
    }
}

fn repo_root() -> PathBuf {
    if let Some(path) = std::env::var_os("EPI_REPO_ROOT") {
        return PathBuf::from(path);
    }

    let mut current = Path::new(env!("CARGO_MANIFEST_DIR"));
    while let Some(parent) = current.parent() {
        if parent.join("Body/S/S0/epi-cli/Cargo.toml").exists() && parent.join("Idea").exists() {
            return parent.to_path_buf();
        }
        current = parent;
    }

    Path::new(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .unwrap_or_else(|| Path::new("."))
        .to_path_buf()
}

fn app_source_dir(repo_root: &Path) -> PathBuf {
    if let Some(path) = std::env::var_os("EPI_APP_SOURCE_DIR") {
        return PathBuf::from(path);
    }
    repo_root.join("Body/S/S3/epi-app")
}

fn app_bundle_path(repo_root: &Path) -> PathBuf {
    app_source_dir(repo_root).join("EpiLogos-Dev.app")
}

fn app_launcher_path(repo_root: &Path) -> PathBuf {
    if let Some(path) = std::env::var_os("EPI_UP_APP_LAUNCHER") {
        return PathBuf::from(path);
    }
    if let Some(path) = std::env::var_os("EPI_APP_LAUNCHER_PATH") {
        return PathBuf::from(path);
    }
    app_bundle_path(repo_root).join("Contents/MacOS/launcher")
}

fn should_wrap_node_commands_for_arm64() -> bool {
    cfg!(target_os = "macos") && cfg!(target_arch = "x86_64")
}

#[cfg(test)]
fn command_parts(program: &str, args: &[&str], wrap_arm64: bool) -> (String, Vec<String>) {
    if wrap_arm64 {
        let mut wrapped_args = vec!["-arm64".to_string(), program.to_string()];
        wrapped_args.extend(args.iter().map(|arg| arg.to_string()));
        ("arch".to_string(), wrapped_args)
    } else {
        (
            program.to_string(),
            args.iter().map(|arg| arg.to_string()).collect(),
        )
    }
}

fn shell_command_in_dir(dir: &Path, script: &str, wrap_arm64: bool) -> Command {
    let mut command = if wrap_arm64 {
        let mut command = Command::new("arch");
        command.arg("-arm64").arg("/bin/zsh").arg("-lc").arg(script);
        command
    } else {
        let mut command = Command::new("/bin/zsh");
        command.arg("-lc").arg(script);
        command
    };
    command.current_dir(dir);
    command
}

fn launcher_command(path: &Path, wrap_arm64: bool) -> Command {
    if wrap_arm64 {
        let mut command = Command::new("arch");
        command.arg("-arm64").arg("/bin/bash").arg(path);
        command
    } else {
        let mut command = Command::new("/bin/bash");
        command.arg(path);
        command
    }
}

pub fn launch_command_for_repo(repo_root: &Path) -> Command {
    launcher_command(
        &app_launcher_path(repo_root),
        should_wrap_node_commands_for_arm64(),
    )
}

pub fn dev_command_for_repo(repo_root: &Path) -> Command {
    shell_command_in_dir(
        &app_source_dir(repo_root),
        "npm run dev",
        should_wrap_node_commands_for_arm64(),
    )
}

pub fn build_command_for_repo(repo_root: &Path) -> Command {
    shell_command_in_dir(
        &app_source_dir(repo_root),
        "npm run build",
        should_wrap_node_commands_for_arm64(),
    )
}

#[cfg(test)]
fn command_for_program(program: &str, args: &[&str], wrap_arm64: bool) -> Command {
    let (command_program, command_args) = command_parts(program, args, wrap_arm64);
    let mut command = Command::new(command_program);
    command.args(command_args);
    command
}

#[cfg(test)]
mod tests {
    use super::{
        app_bundle_path, app_launcher_path, app_source_dir, command_for_program, command_parts,
        should_wrap_node_commands_for_arm64,
    };
    use std::path::Path;

    #[test]
    fn app_source_targets_repo_local_epi_app_copy() {
        let repo_root = Path::new(env!("CARGO_MANIFEST_DIR"))
            .parent()
            .expect("repo root");
        let app_source = app_source_dir(repo_root);
        assert!(
            app_source.ends_with("Body/S/S3/epi-app"),
            "expected repo-local epi-app source, got {}",
            app_source.display()
        );
    }

    #[test]
    fn app_launcher_targets_repo_local_bundle() {
        let repo_root = Path::new(env!("CARGO_MANIFEST_DIR"))
            .parent()
            .expect("repo root");
        let app_launcher = app_launcher_path(repo_root);
        assert!(
            app_launcher.ends_with("Body/S/S3/epi-app/EpiLogos-Dev.app/Contents/MacOS/launcher"),
            "expected repo-local launcher bundle, got {}",
            app_launcher.display()
        );
    }

    #[test]
    fn app_bundle_targets_repo_local_copy() {
        let repo_root = Path::new(env!("CARGO_MANIFEST_DIR"))
            .parent()
            .expect("repo root");
        let app_bundle = app_bundle_path(repo_root);
        assert!(
            app_bundle.ends_with("Body/S/S3/epi-app/EpiLogos-Dev.app"),
            "expected repo-local bundle, got {}",
            app_bundle.display()
        );
    }

    #[test]
    fn wraps_node_side_commands_with_arm64_when_requested() {
        let (program, args) = command_parts("npm", &["run", "build"], true);
        assert_eq!(program, "arch");
        assert_eq!(args, vec!["-arm64", "npm", "run", "build"]);
    }

    #[test]
    fn arm64_wrapper_probe_is_enabled_on_this_machine() {
        if cfg!(target_os = "macos") && cfg!(target_arch = "x86_64") {
            assert!(
                should_wrap_node_commands_for_arm64(),
                "expected arm64 wrapper probe to succeed for this x86_64 macOS build"
            );
        }
    }

    #[test]
    fn arm64_wrapper_runs_node_as_arm64() {
        if cfg!(target_os = "macos") && cfg!(target_arch = "x86_64") {
            let output = command_for_program("node", &["-p", "process.arch"], true)
                .output()
                .expect("run wrapped node");
            assert!(
                output.status.success(),
                "wrapped node failed: {}",
                String::from_utf8_lossy(&output.stderr)
            );
            assert_eq!(String::from_utf8_lossy(&output.stdout).trim(), "arm64");
        }
    }
}
