use crate::gate::sessions::{SessionPatch, SessionRecord, SessionStore};
use crate::sesh::session::AgentSessionRuntime;
use serde_json::{json, Value};
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum GatewaySessionPropagationOperation {
    SessionStart,
    New,
    Resume {
        source_session_key: Option<String>,
    },
    Fork {
        source_session_key: String,
        parent_session_key: Option<String>,
    },
    Import {
        source_session_key: String,
        source_session_kind: Option<String>,
    },
    ResourceReload,
    CloseCompact,
}

#[derive(Debug, Clone)]
pub struct GatewaySessionPropagation {
    pub state_root: PathBuf,
    pub operation: GatewaySessionPropagationOperation,
    pub target_session_key: Option<String>,
    pub label: Option<String>,
}

pub fn propagate_agent_session_runtime(
    runtime: &AgentSessionRuntime,
    propagation: GatewaySessionPropagation,
) -> Result<SessionRecord, String> {
    let store = SessionStore::new(&propagation.state_root)?;
    let canonical_key = propagation
        .target_session_key
        .clone()
        .unwrap_or_else(|| default_agent_gateway_session_key(&runtime.pi_session.agent_id));
    let record = store.ensure(&canonical_key)?;

    store.patch(
        &record.canonical_key,
        SessionPatch {
            aliases: Some(runtime_aliases(&record, runtime)),
            label: Some(Some(
                propagation
                    .label
                    .clone()
                    .unwrap_or_else(|| default_runtime_label(runtime)),
            )),
            session_id: Some(runtime.context.session_id.clone()),
            day_id: Some(Some(runtime.context.day_id.clone())),
            active_agent_id: Some(runtime.pi_session.agent_id.clone()),
            parent_session_key: parent_session_key(&propagation.operation),
            source_session_key: source_session_key(&propagation.operation),
            source_session_kind: source_session_kind(&propagation.operation),
            vault_now_path: Some(Some(runtime.context.now_path.display().to_string())),
            runtime_cwd: Some(Some(runtime.effective_cwd.display().to_string())),
            vault_root: Some(Some(runtime.vault_root.display().to_string())),
            resource_loader_id: Some(Some(runtime.pi_session.resource_loader_id.clone())),
            diagnostics: Some(runtime_diagnostics(
                &record,
                runtime,
                &propagation.operation,
            )),
            model_override: runtime.pi_session.default_model.clone().map(Some),
            ..Default::default()
        },
    )
}

pub fn default_agent_gateway_session_key(agent_id: &str) -> String {
    format!("agent:{agent_id}:main")
}

pub fn default_gateway_state_root() -> PathBuf {
    if let Some(root) = std::env::var_os("EPI_GATE_STATE_ROOT") {
        return PathBuf::from(root);
    }
    dirs::home_dir()
        .unwrap_or_else(|| Path::new(".").to_path_buf())
        .join(".epi")
        .join("gate")
}

fn runtime_aliases(record: &SessionRecord, runtime: &AgentSessionRuntime) -> Vec<String> {
    let mut aliases = record.aliases.clone();
    push_unique(&mut aliases, runtime.context.session_id.clone());
    push_unique(&mut aliases, format!("DAY-{}", runtime.context.day_id));
    aliases
}

fn runtime_diagnostics(
    record: &SessionRecord,
    runtime: &AgentSessionRuntime,
    operation: &GatewaySessionPropagationOperation,
) -> Vec<Value> {
    let mut diagnostics = record.diagnostics.clone();
    push_unique_value(
        &mut diagnostics,
        json!({
            "severity": "info",
            "message": format!("PI runtime propagated through gateway session operation '{}'", operation_kind(operation)),
            "source": "khora.agent_session_runtime"
        }),
    );
    for diagnostic in &runtime.diagnostics {
        push_unique_value(
            &mut diagnostics,
            json!({
                "severity": diagnostic.severity,
                "message": diagnostic.message,
                "source": "khora.agent_session_runtime"
            }),
        );
    }
    diagnostics
}

fn default_runtime_label(runtime: &AgentSessionRuntime) -> String {
    format!(
        "{} / {} / {}",
        runtime.context.day_id, runtime.context.session_id, runtime.pi_session.agent_id
    )
}

fn parent_session_key(operation: &GatewaySessionPropagationOperation) -> Option<Option<String>> {
    match operation {
        GatewaySessionPropagationOperation::Fork {
            parent_session_key, ..
        } => Some(parent_session_key.clone()),
        _ => None,
    }
}

fn source_session_key(operation: &GatewaySessionPropagationOperation) -> Option<Option<String>> {
    match operation {
        GatewaySessionPropagationOperation::Resume { source_session_key } => {
            Some(source_session_key.clone())
        }
        GatewaySessionPropagationOperation::Fork {
            source_session_key, ..
        }
        | GatewaySessionPropagationOperation::Import {
            source_session_key, ..
        } => Some(Some(source_session_key.clone())),
        _ => None,
    }
}

fn source_session_kind(operation: &GatewaySessionPropagationOperation) -> Option<Option<String>> {
    match operation {
        GatewaySessionPropagationOperation::Resume { .. } => Some(Some("resume".to_owned())),
        GatewaySessionPropagationOperation::Fork { .. } => Some(Some("fork".to_owned())),
        GatewaySessionPropagationOperation::Import {
            source_session_kind,
            ..
        } => Some(Some(
            source_session_kind
                .clone()
                .unwrap_or_else(|| "import".to_owned()),
        )),
        _ => None,
    }
}

fn operation_kind(operation: &GatewaySessionPropagationOperation) -> &'static str {
    match operation {
        GatewaySessionPropagationOperation::SessionStart => "session_start",
        GatewaySessionPropagationOperation::New => "new",
        GatewaySessionPropagationOperation::Resume { .. } => "resume",
        GatewaySessionPropagationOperation::Fork { .. } => "fork",
        GatewaySessionPropagationOperation::Import { .. } => "import",
        GatewaySessionPropagationOperation::ResourceReload => "resource_reload",
        GatewaySessionPropagationOperation::CloseCompact => "close_compact",
    }
}

fn push_unique(items: &mut Vec<String>, value: String) {
    if !items.iter().any(|item| item == &value) {
        items.push(value);
    }
}

fn push_unique_value(items: &mut Vec<Value>, value: Value) {
    if !items.iter().any(|item| item == &value) {
        items.push(value);
    }
}
