//! Coordinate: S0/M5-3' (tunability gateway adapter — 38.T06.8).
//! Residency: Body/S/S0/epi-cli/src/gate.
//! Position (#n): live gateway membrane over the portal-core tunable registry.
//! Actualises: registry reads, validated developer writes, append-only audit
//!   reads, and local lock state for `s5'.tune.*`.
//! Public surface: `list`, `get`, `set`, `audit_read`, `lock_toggle`, `propose`,
//! `proposals_list`, `proposals_resolve`.
//! Does NOT own: tunable schema metadata, range validation, or Tier-2 proposal
//!   lifecycle; those belong to portal-core and [[S5]] respectively.
//! Contract: [[S0-SPEC]] / [[S3-SPEC]] / [[M5'-SPEC]] / [[DR-TUNE-1]].

use std::collections::BTreeSet;
use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use epi_s5_epii_autoresearch_core::tuning_review::{
    submit_tuning_proposal, TuningProposalDisposition, TuningProposalRequest,
};
use epi_s5_epii_review_core::{
    ReviewDecision, ReviewInboxFilter, ReviewInboxItem, ReviewResolveRequest, ReviewStore,
};
use portal_core::tunable::registry::parse_value_against_type_public;
use portal_core::tunable::{
    Actor, AuditEntry, AuditWriter, TripletVerdict, Tunable, TunableRegistry, TunableValue,
};
use serde_json::{json, Value};

const LOCKS_SUBPATH: [&str; 3] = ["s5", "tunable", "locks.json"];

pub fn list(state_root: impl AsRef<Path>) -> Result<Value, String> {
    let registry = registry()?;
    let locks = read_locks(state_root)?;
    let knobs = registry
        .iter()
        .map(|(key, metadata)| knob_view(key, metadata, &registry, &locks))
        .collect::<Result<Vec<_>, _>>()?;
    Ok(json!({ "knobs": knobs }))
}

pub fn get(state_root: impl AsRef<Path>, params: &Value) -> Result<Value, String> {
    let key = required_key(params)?;
    let registry = registry()?;
    let locks = read_locks(state_root)?;
    let metadata = registry
        .get(key)
        .ok_or_else(|| format!("unknown tunable key {key}"))?;
    knob_view(key, metadata, &registry, &locks)
}

pub fn set(state_root: impl AsRef<Path>, params: &Value) -> Result<Value, String> {
    let key = required_key(params)?;
    let registry_before = registry()?;
    let metadata = registry_before
        .get(key)
        .ok_or_else(|| format!("unknown tunable key {key}"))?;
    if metadata.structural_invariant {
        return Err(format!(
            "{key} is a structural invariant and cannot be tuned"
        ));
    }
    if read_locks(&state_root)?.contains(key) {
        return Err(format!("{key} is locked"));
    }

    let raw_value = params
        .get("value")
        .ok_or_else(|| "value is required".to_owned())?;
    let toml_value = json_to_toml(raw_value)?;
    let _typed_value = parse_value_against_type_public(&toml_value, metadata.value_type)
        .ok_or_else(|| {
            format!(
                "value does not match {} for {key}",
                metadata.value_type.as_str()
            )
        })?;
    let actor: Actor = serde_json::from_value(
        params
            .get("actor")
            .cloned()
            .unwrap_or_else(|| json!("user")),
    )
    .map_err(|error| format!("invalid tuning actor: {error}"))?;
    let evidence: Vec<String> = params
        .get("evidence")
        .cloned()
        .map(serde_json::from_value)
        .transpose()
        .map_err(|error| format!("evidence must be an array of strings: {error}"))?
        .unwrap_or_default();
    let tier = params.get("tier").and_then(Value::as_u64).unwrap_or(1) as u8;
    if !(1..=3).contains(&tier) {
        return Err("tier must be 1, 2, or 3".to_owned());
    }
    if tier != 1 || !matches!(actor, Actor::User) {
        return Err(
            "registry.set is a Tier-1 user-only mutation; Tier-2 changes must use s5'.tune.propose"
                .to_owned(),
        );
    }

    let from_value = registry_before
        .value(key)
        .ok_or_else(|| format!("missing current value for {key}"))?;
    let next_registry = persist_value(key, toml_value)?;
    let to_value = next_registry
        .value(key)
        .ok_or_else(|| format!("persisted value missing for {key}"))?;
    let entry = AuditEntry {
        timestamp: unix_timestamp(),
        knob_key: key.to_owned(),
        from_value,
        to_value,
        actor,
        tier,
        risk_class: metadata.tuning_risk_class.as_str().to_owned(),
        proposing_evidence: evidence,
        triplet_verdict: None,
        user_disposition: None,
        user_disposition_evidence_handle: None,
        rollback_handle: format!("tune:{}:{}", key, unix_timestamp()),
        kairos_snapshot: None,
    };
    AuditWriter::new(audit_dir())
        .append(&entry)
        .map_err(|error| error.to_string())?;
    serde_json::to_value(entry).map_err(|error| error.to_string())
}

pub fn audit_read(params: &Value) -> Result<Value, String> {
    let key = required_key(params)?;
    let entries = AuditWriter::new(audit_dir())
        .read(key)
        .map_err(|error| error.to_string())?;
    Ok(json!({ "entries": entries }))
}

pub fn lock_toggle(state_root: impl AsRef<Path>, params: &Value) -> Result<Value, String> {
    let key = required_key(params)?;
    if registry()?.get(key).is_none() {
        return Err(format!("unknown tunable key {key}"));
    }
    let locked = params
        .get("locked")
        .and_then(Value::as_bool)
        .ok_or_else(|| "locked must be a boolean".to_owned())?;
    let mut locks = read_locks(&state_root)?;
    if locked {
        locks.insert(key.to_owned());
    } else {
        locks.remove(key);
    }
    write_locks(state_root, &locks)?;
    Ok(json!({ "key": key, "locked": locked }))
}

pub fn propose(state_root: impl AsRef<Path>, params: &Value) -> Result<Value, String> {
    let key = required_key(params)?;
    let registry_before = registry()?;
    let metadata = registry_before
        .get(key)
        .ok_or_else(|| format!("unknown tunable key {key}"))?
        .clone();
    reject_locked(&state_root, key)?;
    let raw_value = params
        .get("to_value")
        .ok_or_else(|| "to_value is required".to_owned())?;
    let toml_value = json_to_toml(raw_value)?;
    let to_value =
        parse_value_against_type_public(&toml_value, metadata.value_type).ok_or_else(|| {
            format!(
                "to_value does not match {} for {key}",
                metadata.value_type.as_str()
            )
        })?;
    let from_value = registry_before
        .value(key)
        .ok_or_else(|| format!("missing current value for {key}"))?;
    let proposing_evidence = required_string_array(params, "proposing_evidence")?;
    let tier = required_tier(params)?;
    let triplet_verdict = optional_triplet_verdict(params)?;
    let recent_application_count = recent_tier_two_application_count(key)?;
    let request = TuningProposalRequest {
        metadata: metadata.clone(),
        from_value: from_value.clone(),
        to_value,
        proposing_evidence: proposing_evidence.clone(),
        tier,
        triplet_verdict: triplet_verdict.clone(),
        recent_application_count,
    };
    let receipt = submit_tuning_proposal(&review_store(&state_root), request)?;
    let mut result = serde_json::to_value(&receipt).map_err(|error| error.to_string())?;
    if matches!(receipt.disposition, TuningProposalDisposition::AutoApply) {
        let audit_entry = apply_governed_change(
            &state_root,
            &metadata,
            &from_value,
            raw_value,
            Actor::AnamnesisProposer,
            tier,
            proposing_evidence,
            triplet_verdict,
            None,
            None,
        )?;
        result["audit_entry"] =
            serde_json::to_value(audit_entry).map_err(|error| error.to_string())?;
    }
    Ok(result)
}

pub fn proposals_list(state_root: impl AsRef<Path>) -> Result<Value, String> {
    let items = review_store(state_root)
        .inbox(ReviewInboxFilter::default())?
        .items
        .into_iter()
        .filter(is_tuning_proposal)
        .collect::<Vec<_>>();
    Ok(json!({ "items": items }))
}

pub fn proposals_resolve(state_root: impl AsRef<Path>, params: &Value) -> Result<Value, String> {
    let request: ReviewResolveRequest =
        serde_json::from_value(params.clone()).map_err(|error| error.to_string())?;
    let store = review_store(&state_root);
    let item = store
        .inbox(ReviewInboxFilter::default())?
        .items
        .into_iter()
        .find(|item| item.item_id == request.item_id)
        .ok_or_else(|| format!("review item not found: {}", request.item_id))?;
    if !is_tuning_proposal(&item) {
        return Err(format!(
            "review item {} is not a tuning proposal",
            item.item_id
        ));
    }

    let decision = request.decision;
    let resolution = store.resolve(request)?;
    let audit_entry = if decision == ReviewDecision::Approve {
        store.approved_human_resolution(&item.item_id)?;
        Some(apply_approved_proposal(&state_root, &item, params)?)
    } else {
        None
    };
    Ok(json!({ "resolution": resolution, "audit_entry": audit_entry }))
}

fn registry() -> Result<TunableRegistry, String> {
    TunableRegistry::load_with_overrides(&schema_dir(), Some(&config_path()))
        .map_err(|error| error.to_string())
}

fn review_store(state_root: impl AsRef<Path>) -> ReviewStore {
    ReviewStore::new(super::review::review_store_path(state_root))
}

fn is_tuning_proposal(item: &ReviewInboxItem) -> bool {
    item.proposed_action
        .as_ref()
        .is_some_and(|action| action.kind == "tuning_proposal")
}

fn apply_approved_proposal(
    state_root: impl AsRef<Path>,
    item: &ReviewInboxItem,
    params: &Value,
) -> Result<AuditEntry, String> {
    let action = item
        .proposed_action
        .as_ref()
        .ok_or_else(|| format!("tuning proposal {} lacks an action", item.item_id))?;
    let key = action
        .target
        .as_ref()
        .and_then(|target| target.get("knob_key"))
        .and_then(Value::as_str)
        .ok_or_else(|| format!("tuning proposal {} lacks a knob key", item.item_id))?;
    let payload = action
        .payload
        .as_ref()
        .ok_or_else(|| format!("tuning proposal {} lacks a payload", item.item_id))?;
    let from_value: TunableValue = serde_json::from_value(
        payload
            .get("from_value")
            .cloned()
            .ok_or_else(|| format!("tuning proposal {} lacks from_value", item.item_id))?,
    )
    .map_err(|error| format!("invalid proposal from_value: {error}"))?;
    let to_value = payload
        .get("to_value")
        .ok_or_else(|| format!("tuning proposal {} lacks to_value", item.item_id))?;
    let triplet_verdict = payload
        .get("triplet_verdict")
        .filter(|value| !value.is_null())
        .cloned()
        .map(serde_json::from_value)
        .transpose()
        .map_err(|error| format!("invalid proposal triplet_verdict: {error}"))?;
    let proposing_evidence: Vec<String> = serde_json::from_value(
        item.coordinate_context
            .get("proposing_evidence")
            .cloned()
            .ok_or_else(|| format!("tuning proposal {} lacks proposing evidence", item.item_id))?,
    )
    .map_err(|error| format!("invalid proposal evidence: {error}"))?;
    let metadata = registry()?
        .get(key)
        .ok_or_else(|| format!("unknown tunable key {key}"))?
        .clone();
    let disposition_evidence_handle = params
        .get("user_disposition_evidence_handle")
        .filter(|value| !value.is_null())
        .cloned()
        .map(serde_json::from_value)
        .transpose()
        .map_err(|error| format!("invalid user_disposition_evidence_handle: {error}"))?;

    apply_governed_change(
        state_root,
        &metadata,
        &from_value,
        to_value,
        Actor::User,
        2,
        proposing_evidence,
        triplet_verdict,
        Some("approved".to_owned()),
        disposition_evidence_handle,
    )
}

#[allow(clippy::too_many_arguments)]
fn apply_governed_change(
    state_root: impl AsRef<Path>,
    metadata: &Tunable,
    expected_from_value: &TunableValue,
    raw_value: &Value,
    actor: Actor,
    tier: u8,
    proposing_evidence: Vec<String>,
    triplet_verdict: Option<TripletVerdict>,
    user_disposition: Option<String>,
    user_disposition_evidence_handle: Option<String>,
) -> Result<AuditEntry, String> {
    reject_locked(&state_root, &metadata.key)?;
    let registry_before = registry()?;
    let current_value = registry_before
        .value(&metadata.key)
        .ok_or_else(|| format!("missing current value for {}", metadata.key))?;
    if current_value != *expected_from_value {
        return Err(format!(
            "{} changed since this governed proposal was created; submit a new proposal",
            metadata.key
        ));
    }
    let toml_value = json_to_toml(raw_value)?;
    parse_value_against_type_public(&toml_value, metadata.value_type).ok_or_else(|| {
        format!(
            "value does not match {} for {}",
            metadata.value_type.as_str(),
            metadata.key
        )
    })?;
    let next_registry = persist_value(&metadata.key, toml_value)?;
    let to_value = next_registry
        .value(&metadata.key)
        .ok_or_else(|| format!("persisted value missing for {}", metadata.key))?;
    let timestamp = unix_timestamp();
    let entry = AuditEntry {
        timestamp: timestamp.clone(),
        knob_key: metadata.key.clone(),
        from_value: current_value,
        to_value,
        actor,
        tier,
        risk_class: metadata.tuning_risk_class.as_str().to_owned(),
        proposing_evidence,
        triplet_verdict,
        user_disposition,
        user_disposition_evidence_handle,
        rollback_handle: format!("tune:{}:{timestamp}", metadata.key),
        kairos_snapshot: None,
    };
    AuditWriter::new(audit_dir())
        .append(&entry)
        .map_err(|error| error.to_string())?;
    Ok(entry)
}

fn reject_locked(state_root: impl AsRef<Path>, key: &str) -> Result<(), String> {
    if read_locks(state_root)?.contains(key) {
        return Err(format!("{key} is locked"));
    }
    Ok(())
}

fn required_string_array(params: &Value, field: &str) -> Result<Vec<String>, String> {
    let values: Vec<String> = serde_json::from_value(
        params
            .get(field)
            .cloned()
            .ok_or_else(|| format!("{field} is required"))?,
    )
    .map_err(|error| format!("{field} must be an array of strings: {error}"))?;
    if values.is_empty() || values.iter().any(|value| value.trim().is_empty()) {
        return Err(format!("{field} must contain non-empty strings"));
    }
    Ok(values)
}

fn required_tier(params: &Value) -> Result<u8, String> {
    let tier = params
        .get("tier")
        .and_then(Value::as_u64)
        .ok_or_else(|| "tier is required".to_owned())?;
    u8::try_from(tier).map_err(|_| "tier must fit in u8".to_owned())
}

fn optional_triplet_verdict(params: &Value) -> Result<Option<TripletVerdict>, String> {
    params
        .get("triplet_verdict")
        .filter(|value| !value.is_null())
        .cloned()
        .map(serde_json::from_value)
        .transpose()
        .map_err(|error| format!("invalid triplet_verdict: {error}"))
}

fn recent_tier_two_application_count(key: &str) -> Result<usize, String> {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    Ok(AuditWriter::new(audit_dir())
        .read(key)
        .map_err(|error| error.to_string())?
        .into_iter()
        .filter(|entry| {
            entry.tier == 2
                && matches!(entry.actor, Actor::AnamnesisProposer)
                && entry
                    .timestamp
                    .parse::<u64>()
                    .is_ok_and(|timestamp| now.saturating_sub(timestamp) <= 86_400)
        })
        .count())
}

fn knob_view(
    key: &str,
    metadata: &Tunable,
    registry: &TunableRegistry,
    locks: &BTreeSet<String>,
) -> Result<Value, String> {
    let mut object = serde_json::to_value(metadata)
        .map_err(|error| error.to_string())?
        .as_object()
        .cloned()
        .ok_or_else(|| "tunable metadata must serialize to an object".to_owned())?;
    let current = registry
        .value(key)
        .ok_or_else(|| format!("missing current value for {key}"))?;
    object.insert(
        "current".to_owned(),
        serde_json::to_value(&current).map_err(|error| error.to_string())?,
    );
    object.insert(
        "is_default".to_owned(),
        Value::Bool(current == metadata.default),
    );
    object.insert("locked".to_owned(), Value::Bool(locks.contains(key)));
    Ok(Value::Object(object))
}

fn persist_value(key: &str, value: toml::Value) -> Result<TunableRegistry, String> {
    let path = config_path();
    let mut table = if path.exists() {
        fs::read_to_string(&path)
            .map_err(|error| format!("read {}: {error}", path.display()))?
            .parse::<toml::Value>()
            .map_err(|error| format!("parse {}: {error}", path.display()))?
            .as_table()
            .cloned()
            .ok_or_else(|| format!("{} must contain a TOML table", path.display()))?
    } else {
        toml::Table::new()
    };
    insert_dotted(&mut table, key, value)?;
    let serialized =
        toml::to_string(&toml::Value::Table(table)).map_err(|error| error.to_string())?;
    let parent = path
        .parent()
        .ok_or_else(|| "config path has no parent".to_owned())?;
    fs::create_dir_all(parent).map_err(|error| error.to_string())?;
    let pending = parent.join(format!("config.toml.pending-{}", unix_timestamp()));
    fs::write(&pending, serialized).map_err(|error| error.to_string())?;
    let loaded = TunableRegistry::load_with_overrides(&schema_dir(), Some(&pending));
    match loaded {
        Ok(registry) => {
            fs::rename(&pending, &path).map_err(|error| error.to_string())?;
            Ok(registry)
        }
        Err(error) => {
            let _ = fs::remove_file(&pending);
            Err(error.to_string())
        }
    }
}

fn insert_dotted(table: &mut toml::Table, key: &str, value: toml::Value) -> Result<(), String> {
    let mut parts = key.split('.').peekable();
    let mut current = table;
    while let Some(part) = parts.next() {
        if parts.peek().is_none() {
            current.insert(part.to_owned(), value);
            return Ok(());
        }
        let next = current
            .entry(part.to_owned())
            .or_insert_with(|| toml::Value::Table(toml::Table::new()));
        current = next
            .as_table_mut()
            .ok_or_else(|| format!("{part} is not a TOML table while setting {key}"))?;
    }
    Err("tunable key must not be empty".to_owned())
}

fn json_to_toml(value: &Value) -> Result<toml::Value, String> {
    match value {
        Value::Null => Err("tunable values cannot be null".to_owned()),
        Value::Bool(value) => Ok(toml::Value::Boolean(*value)),
        Value::Number(value) if value.is_i64() => Ok(toml::Value::Integer(value.as_i64().unwrap())),
        Value::Number(value) => value
            .as_f64()
            .map(toml::Value::Float)
            .ok_or_else(|| "invalid numeric tuning value".to_owned()),
        Value::String(value) => Ok(toml::Value::String(value.clone())),
        Value::Array(values) => values
            .iter()
            .map(json_to_toml)
            .collect::<Result<Vec<_>, _>>()
            .map(toml::Value::Array),
        Value::Object(values) => values
            .iter()
            .map(|(key, value)| Ok((key.clone(), json_to_toml(value)?)))
            .collect::<Result<toml::Table, String>>()
            .map(toml::Value::Table),
    }
}

fn required_key(params: &Value) -> Result<&str, String> {
    params
        .get("key")
        .and_then(Value::as_str)
        .filter(|key| !key.trim().is_empty())
        .ok_or_else(|| "key must be a non-empty string".to_owned())
}

fn schema_dir() -> PathBuf {
    std::env::var_os("EPI_TUNABLE_SCHEMA_DIR")
        .map(PathBuf::from)
        .unwrap_or_else(|| {
            PathBuf::from(env!("CARGO_MANIFEST_DIR"))
                .join("..")
                .join("portal-core")
                .join("tunable-schema")
        })
}

fn config_dir() -> PathBuf {
    std::env::var_os("HOME")
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from("."))
        .join(".epi-logos")
}

fn config_path() -> PathBuf {
    config_dir().join("config.toml")
}

fn audit_dir() -> PathBuf {
    config_dir().join("tunable-audit")
}

fn locks_path(state_root: impl AsRef<Path>) -> PathBuf {
    let mut path = state_root.as_ref().to_path_buf();
    for part in LOCKS_SUBPATH {
        path.push(part);
    }
    path
}

fn read_locks(state_root: impl AsRef<Path>) -> Result<BTreeSet<String>, String> {
    let path = locks_path(state_root);
    if !path.exists() {
        return Ok(BTreeSet::new());
    }
    serde_json::from_str(&fs::read_to_string(&path).map_err(|error| error.to_string())?)
        .map_err(|error| format!("parse {}: {error}", path.display()))
}

fn write_locks(state_root: impl AsRef<Path>, locks: &BTreeSet<String>) -> Result<(), String> {
    let path = locks_path(state_root);
    let parent = path
        .parent()
        .ok_or_else(|| "locks path has no parent".to_owned())?;
    fs::create_dir_all(parent).map_err(|error| error.to_string())?;
    fs::write(
        &path,
        serde_json::to_vec_pretty(locks).map_err(|error| error.to_string())?,
    )
    .map_err(|error| error.to_string())
}

fn unix_timestamp() -> String {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
        .to_string()
}
