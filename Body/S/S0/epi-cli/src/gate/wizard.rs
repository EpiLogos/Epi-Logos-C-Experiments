use std::fs;
use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
struct WizardState {
    active: bool,
    flow: String,
    step: usize,
}

pub fn start(state_root: impl AsRef<Path>, flow: &str) -> Result<Value, String> {
    let state = WizardState {
        active: true,
        flow: flow.to_owned(),
        step: 0,
    };
    save_state(state_root, &state)?;
    render(&state)
}

pub fn next(state_root: impl AsRef<Path>) -> Result<Value, String> {
    let mut state = load_state(&state_root)?;
    if state.active {
        state.step += 1;
    }
    save_state(state_root, &state)?;
    render(&state)
}

pub fn cancel(state_root: impl AsRef<Path>) -> Result<Value, String> {
    let mut state = load_state(&state_root)?;
    state.active = false;
    save_state(state_root, &state)?;
    render(&state)
}

pub fn status(state_root: impl AsRef<Path>) -> Result<Value, String> {
    render(&load_state(state_root)?)
}

fn render(state: &WizardState) -> Result<Value, String> {
    let steps = steps_for_flow(&state.flow);
    let current = steps.get(state.step).cloned().unwrap_or_else(|| {
        json!({
            "id": "complete",
            "coordinate": "S0'",
            "label": "Complete",
            "fields": [],
            "actions": []
        })
    });
    Ok(json!({
        "active": state.active,
        "flow": state.flow,
        "step": state.step,
        "totalSteps": steps.len(),
        "current": current,
        "steps": steps,
    }))
}

fn steps_for_flow(flow: &str) -> Vec<Value> {
    match flow {
        "gateway-setup" | "system-setup" => vec![
            json!({
                "id": "gateway",
                "coordinate": "S3",
                "label": "Gateway runtime",
                "fields": ["gateway.port", "gateway.bindMode", "gateway.authMode", "gateway.tlsEnabled"],
                "actions": ["config.schema", "config.apply", "gate.status"]
            }),
            secrets_step(),
            channels_step(),
            graph_step(),
            nara_identity_step(),
        ],
        "channels" | "channel-setup" => vec![secrets_step(), channels_step()],
        "graph" | "graph-setup" => vec![graph_step(), bimba_seed_step()],
        "nara" | "nara-identity" => vec![nara_identity_step()],
        _ => vec![json!({
            "id": "orientation",
            "coordinate": "S0'",
            "label": "Setup orientation",
            "fields": ["gateway.port", "gateway.bindMode"],
            "actions": ["wizard.start", "config.schema"]
        })],
    }
}

fn secrets_step() -> Value {
    json!({
        "id": "secrets",
        "coordinate": "S0'/S3",
        "label": "Secrets provider",
        "fields": [
            "gateway.secrets.provider",
            "gateway.secrets.envPrefix",
            "gateway.secrets.onePasswordVault",
            "gateway.secrets.varlockProfile"
        ],
        "actions": ["config.set", "config.patch", "channels.status"],
        "secretPolicy": "store references only; resolve values through env, 1Password, or varlock"
    })
}

fn channels_step() -> Value {
    json!({
        "id": "channels",
        "coordinate": "S3",
        "label": "Gateway channels",
        "fields": [
            "gateway.channels.telegram.enabled",
            "gateway.channels.telegram.secretRef",
            "gateway.channels.whatsapp.enabled",
            "gateway.channels.whatsapp.secretRef",
            "gateway.channels.slack.enabled",
            "gateway.channels.slack.secretRef",
            "gateway.channels.discord.enabled",
            "gateway.channels.discord.secretRef",
            "gateway.channels.google-drive.enabled",
            "gateway.channels.google-drive.secretRef"
        ],
        "actions": [
            "channels.status",
            "channels.send",
            "channels.files.list",
            "web.login.start",
            "web.login.wait",
            "channels.logout"
        ]
    })
}

fn graph_step() -> Value {
    json!({
        "id": "graph",
        "coordinate": "S2/S3",
        "label": "Neo4j and Redis services",
        "fields": [
            "EPILOGOS_NEO4J_URI",
            "EPILOGOS_NEO4J_USER",
            "EPILOGOS_NEO4J_PASSWORD",
            "EPILOGOS_SEMANTIC_CACHE_REDIS_URL"
        ],
        "actions": [
            "graph.bootstrap-dev",
            "graph.doctor",
            "graph.reconcile",
            "s2.graph.node",
            "s2.graph.traverse",
            "s2'.coordinate.resolve",
            "s2'.retrieve"
        ]
    })
}

fn bimba_seed_step() -> Value {
    json!({
        "id": "bimba-seed",
        "coordinate": "S2'",
        "label": "Bimba namespace seed",
        "fields": ["EPILOGOS_DATASETS"],
        "actions": ["graph.update", "graph.import.all", "graph.seed-nara"],
        "namespace": { "nodeLabel": "Bimba", "coordinateProperty": "coordinate", "embeddingDimensions": 3072 }
    })
}

fn nara_identity_step() -> Value {
    json!({
        "id": "nara-identity",
        "coordinate": "M4'/S3'",
        "label": "Nara identity matrix basis",
        "fields": [
            "c_0_birth_date",
            "c_0_birth_location",
            "c_0_natal_chart_path"
        ],
        "actions": [
            "vault.pasu.set.birth-date",
            "vault.pasu.set.birth-location",
            "vault.kairos.fetch",
            "gate.temporal.context"
        ],
        "minimumViableIdentity": "natal data: date and location"
    })
}

fn load_state(state_root: impl AsRef<Path>) -> Result<WizardState, String> {
    let path = state_path(state_root);
    if !path.exists() {
        return Ok(WizardState::default());
    }
    let content = fs::read_to_string(path).map_err(|err| err.to_string())?;
    serde_json::from_str(&content).map_err(|err| err.to_string())
}

fn save_state(state_root: impl AsRef<Path>, state: &WizardState) -> Result<(), String> {
    let path = state_path(state_root);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|err| err.to_string())?;
    }
    let content = serde_json::to_string_pretty(state).map_err(|err| err.to_string())?;
    fs::write(path, content).map_err(|err| err.to_string())
}

fn state_path(state_root: impl AsRef<Path>) -> PathBuf {
    state_root.as_ref().join("wizard.json")
}
