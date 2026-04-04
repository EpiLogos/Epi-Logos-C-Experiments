use crate::agent::AgentLayout;
use serde::Serialize;
use std::process::Command;

const PI_PACKAGE: &str = "@mariozechner/pi-coding-agent";

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct InstallReport {
    status: String,
    agent_id: String,
    canonical_pi_agent_dir: String,
    managed_epi_agent_dir: String,
    interactive_launch_mode: String,
    pi_binary_present: bool,
    next_action: String,
}

pub fn run(agent: Option<&str>, json: bool) -> Result<String, String> {
    let layout = AgentLayout::resolve(agent)?;
    layout.ensure_managed_layout()?;

    let mut next_action =
        "Run `epi agent doctor --json` to confirm sync and provider status.".to_owned();

    let pi_present = if pi_binary_present() {
        true
    } else {
        match install_pi_binary() {
            Ok(()) if pi_binary_present() => true,
            Ok(()) => {
                next_action = format!(
                    "Installed `{PI_PACKAGE}` but `pi` is still not on PATH. Add your npm global bin to PATH, then rerun `epi agent install --json`."
                );
                false
            }
            Err(err) => {
                next_action = err;
                false
            }
        }
    };

    let report = InstallReport {
        status: if pi_present {
            "ready".to_owned()
        } else {
            "missing-prerequisite".to_owned()
        },
        agent_id: layout.agent_id,
        canonical_pi_agent_dir: layout.canonical_pi_agent_dir.display().to_string(),
        managed_epi_agent_dir: layout.managed_epi_agent_dir.display().to_string(),
        interactive_launch_mode: "claw".to_owned(),
        pi_binary_present: pi_present,
        next_action,
    };

    if json {
        serde_json::to_string_pretty(&report).map_err(|err| err.to_string())
    } else {
        Ok(format!("{}: {}", report.status, report.next_action))
    }
}

fn pi_binary_present() -> bool {
    Command::new("pi")
        .arg("--version")
        .output()
        .map(|output| output.status.success())
        .unwrap_or(false)
}

fn install_pi_binary() -> Result<(), String> {
    let output = Command::new("npm")
        .args(["install", "-g", PI_PACKAGE])
        .output()
        .map_err(|err| {
            format!(
                "Failed to install `{PI_PACKAGE}` automatically: {err}. Install npm, or install the package manually and rerun `epi agent install --json`."
            )
        })?;

    if output.status.success() {
        Ok(())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_owned();
        let detail = if stderr.is_empty() {
            format!("npm exited with status {}", output.status)
        } else {
            stderr
        };
        Err(format!(
            "Automatic install of `{PI_PACKAGE}` failed: {detail}. Fix npm/global install settings, then rerun `epi agent install --json`."
        ))
    }
}
