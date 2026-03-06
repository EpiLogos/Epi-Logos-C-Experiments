use crate::agent::AgentLayout;
use serde::Serialize;
use std::process::Command;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct InstallReport {
    status: String,
    agent_id: String,
    agent_dir: String,
    pi_binary_present: bool,
    next_action: String,
}

pub fn run(agent: Option<&str>, json: bool) -> Result<String, String> {
    let layout = AgentLayout::resolve(agent)?;
    layout.ensure_managed_layout()?;

    let pi_present = pi_binary_present();
    let report = InstallReport {
        status: if pi_present {
            "ready".to_owned()
        } else {
            "missing-prerequisite".to_owned()
        },
        agent_id: layout.agent_id,
        agent_dir: layout.agent_dir.display().to_string(),
        pi_binary_present: pi_present,
        next_action: if pi_present {
            "Run `epi agent doctor --json` to confirm sync and provider status.".to_owned()
        } else {
            "Install the `pi` binary locally, then rerun `epi agent install --json`.".to_owned()
        },
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
