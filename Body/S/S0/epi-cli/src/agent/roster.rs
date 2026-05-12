use crate::agent::RosterCmd;
use serde::Serialize;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct RosterReport {
    embodiments: Vec<EmbodimentReport>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct EmbodimentReport {
    agent_id: &'static str,
    coordinate: &'static str,
    default_session_key: &'static str,
    plugin_surface: &'static str,
    roles: Vec<RoleReport>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct RoleReport {
    id: &'static str,
    scope: &'static str,
}

pub fn run(cmd: &RosterCmd, json: bool) -> Result<String, String> {
    match cmd {
        RosterCmd::List => render(roster(), json),
    }
}

fn roster() -> RosterReport {
    RosterReport {
        embodiments: vec![
            EmbodimentReport {
                agent_id: "epii",
                coordinate: "S5/S5'",
                default_session_key: "agent:epii:main",
                plugin_surface: "Body/S/S5/plugins/epi-logos",
                roles: vec![
                    role("epii", "base Epii user-position and review surface"),
                    role("mef-diagnostician", "epi-logos plugin subagent"),
                    role("pi-writing-cartographer", "epi-logos plugin subagent"),
                    role("ql-cartographer", "epi-logos plugin subagent"),
                ],
            },
            EmbodimentReport {
                agent_id: "anima",
                coordinate: "S4/S4'",
                default_session_key: "agent:anima:main",
                plugin_surface: "Body/S/S4/plugins/pleroma",
                roles: vec![
                    role("anima", "base dispatch function"),
                    role("nous", "constitutional clearing role"),
                    role("logos", "constitutional form-giving role"),
                    role("eros", "constitutional operation role"),
                    role("mythos", "constitutional pattern role"),
                    role("psyche", "constitutional context role"),
                    role("sophia", "constitutional integration role"),
                    role("techne-helper", "technical helper role"),
                ],
            },
            EmbodimentReport {
                agent_id: "aletheia",
                coordinate: "S4.5'/S5 handoff",
                default_session_key: "agent:aletheia:main",
                plugin_surface: "Body/S/S4/ta-onta/S4-5p-aletheia",
                roles: vec![
                    role("aletheia", "base crystallisation and return bridge"),
                    role("agora", "collective disclosure role"),
                    role("anansi", "structural topology role"),
                    role("janus", "threshold and bifurcation role"),
                    role("mercurius", "translation and mediation role"),
                    role("moirai", "lineage and fate-thread role"),
                    role("zeithoven", "temporal composition role"),
                ],
            },
        ],
    }
}

fn role(id: &'static str, scope: &'static str) -> RoleReport {
    RoleReport { id, scope }
}

fn render(report: RosterReport, json: bool) -> Result<String, String> {
    if json {
        serde_json::to_string_pretty(&report).map_err(|err| err.to_string())
    } else {
        Ok(report
            .embodiments
            .into_iter()
            .map(|embodiment| {
                let roles = embodiment
                    .roles
                    .into_iter()
                    .map(|role| role.id)
                    .collect::<Vec<_>>()
                    .join(", ");
                format!(
                    "{} [{}] {} -> {}",
                    embodiment.agent_id, embodiment.coordinate, embodiment.plugin_surface, roles
                )
            })
            .collect::<Vec<_>>()
            .join("\n"))
    }
}
