use serde_json::Value;

use super::session_store::{SessionRecord, SessionStore};

#[derive(Debug, Clone)]
pub struct SubagentLaunchContext {
    pub spawned_by: String,
    pub subagent_lineage: Vec<String>,
    pub vault_now_path: Option<String>,
    pub delivery_context: Option<Value>,
    pub channel: Option<String>,
    pub thread_id: Option<String>,
    pub group_id: Option<String>,
    pub group_channel: Option<String>,
    pub group_space: Option<String>,
}

pub fn is_subagent_session_key(session_key: &str) -> bool {
    parse_agent_session_key(session_key)
        .map(|(_, rest)| rest.to_ascii_lowercase().starts_with("subagent:"))
        .unwrap_or(false)
}

pub fn parse_agent_session_key(session_key: &str) -> Option<(String, String)> {
    let raw = session_key.trim();
    if raw.is_empty() {
        return None;
    }
    let parts = raw.split(':').collect::<Vec<_>>();
    if parts.len() < 3 || parts.first().copied() != Some("agent") {
        return None;
    }
    let agent_id = parts.get(1)?.trim();
    let rest = parts[2..].join(":");
    if agent_id.is_empty() || rest.is_empty() {
        return None;
    }
    Some((agent_id.to_owned(), rest))
}

pub fn validate_spawned_by_patch(
    record: &SessionRecord,
    spawned_by: Option<&str>,
) -> Result<(), String> {
    match spawned_by {
        None => {
            if record.spawned_by.is_some() {
                return Err("spawnedBy cannot be cleared once set".to_owned());
            }
        }
        Some(raw) => {
            let trimmed = raw.trim();
            if trimmed.is_empty() {
                return Err("invalid spawnedBy: empty".to_owned());
            }
            if !is_subagent_session_key(&record.canonical_key) {
                return Err("spawnedBy is only supported for subagent:* sessions".to_owned());
            }
            if let Some(existing) = record.spawned_by.as_deref() {
                if existing != trimmed {
                    return Err("spawnedBy cannot be changed once set".to_owned());
                }
            }
        }
    }

    Ok(())
}

pub fn resolve_agent_launch_context(
    store: &SessionStore,
    session_key: &str,
    requested_spawned_by: Option<&str>,
) -> Result<Option<SubagentLaunchContext>, String> {
    let existing = store.resolve(session_key).ok();
    let requested_spawned_by = requested_spawned_by
        .map(str::trim)
        .filter(|value| !value.is_empty());

    if !is_subagent_session_key(session_key) {
        if requested_spawned_by.is_some() {
            return Err("spawnedBy is only supported for subagent:* sessions".to_owned());
        }
        return Ok(None);
    }

    let effective_spawned_by = requested_spawned_by
        .map(str::to_owned)
        .or_else(|| {
            existing
                .as_ref()
                .and_then(|record| record.spawned_by.clone())
        })
        .ok_or_else(|| "spawnedBy is required for subagent sessions".to_owned())?;

    if is_subagent_session_key(&effective_spawned_by) {
        return Err("subagent sessions cannot spawn subagent sessions".to_owned());
    }

    let parent = store.ensure(&effective_spawned_by)?;
    let child_agent_id = parse_agent_session_key(session_key)
        .map(|(agent_id, _)| agent_id)
        .unwrap_or_else(|| session_key.to_owned());
    let subagent_lineage = derive_subagent_lineage(&parent, &child_agent_id);

    Ok(Some(SubagentLaunchContext {
        spawned_by: effective_spawned_by,
        subagent_lineage,
        vault_now_path: parent.vault_now_path.clone(),
        delivery_context: parent.delivery_context.clone(),
        channel: parent.channel.clone(),
        thread_id: parent.thread_id.clone(),
        group_id: parent.group_id.clone(),
        group_channel: parent.group_channel.clone(),
        group_space: parent.group_space.clone(),
    }))
}

fn derive_subagent_lineage(parent: &SessionRecord, child_agent_id: &str) -> Vec<String> {
    let mut lineage = if parent.subagent_lineage.is_empty() {
        let parent_agent = lineage_segment(parent);
        if parent_agent.is_empty() {
            Vec::new()
        } else {
            vec![parent_agent]
        }
    } else {
        parent.subagent_lineage.clone()
    };

    if lineage.last().map(|entry| entry.as_str()) != Some(child_agent_id) {
        lineage.push(child_agent_id.to_owned());
    }

    lineage
}

fn lineage_segment(record: &SessionRecord) -> String {
    let active = record.active_agent_id.trim();
    if !active.is_empty() && !active.contains(':') {
        return active.to_owned();
    }

    parse_agent_session_key(&record.canonical_key)
        .map(|(agent_id, _)| agent_id)
        .unwrap_or_else(|| record.canonical_key.clone())
}
