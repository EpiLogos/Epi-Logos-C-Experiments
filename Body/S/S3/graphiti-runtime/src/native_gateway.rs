//! Native Graphiti gateway operations.
//!
//! # Coordinate
//!
//! | Field | Value |
//! |-------|-------|
//! | Coordinate | S5/S5' |
//! | Residency | Body/S/S3/graphiti-runtime/src/native_gateway.rs (physically S3; conceptually S5 world-return) |
//! | Position | #3 - Native gateway invocation adapter |
//! | Actualises | [[S3-SPEC]], [[S3-ARCHITECTURE]], and [[S5-SPEC]] native episodic runtime |
//!
//! # Public surface
//! * Native implementations of the four `s5.episodic.*` gateway operations.
//!
//! # Does NOT own
//! * HTTP sidecar compatibility, S2 graph storage law, or S5 identity promotion.

use std::collections::BTreeSet;
use std::sync::{Mutex, OnceLock};

use serde_json::{json, Value};

use crate::{
    kernel_profile_observation_deposit_payload, kernel_resonance_deposit_payload,
    session_memory_deposit_payload, GraphitiClient, MemoryQueryResult, NativeLibraryClient,
};

static NATIVE_GATEWAY_CLIENT: OnceLock<Mutex<NativeLibraryClient>> = OnceLock::new();

pub async fn session_memory_search(params: &Value) -> Result<Value, String> {
    let query = required_str(params, "query")?;
    let agent_id = optional_str(params, "agentId").unwrap_or("epii");
    let session_key = required_str(params, "sessionKey")?;
    let namespace_ref = required_str(params, "namespaceRef")?;
    let day_id = required_str(params, "dayId")?;
    let limit = params
        .get("limit")
        .and_then(Value::as_u64)
        .unwrap_or(10)
        .clamp(1, 50) as usize;

    let mut envelope = memory_envelope(json!({
        "agentId": agent_id,
        "maySearch": true,
        "mayDeposit": matches!(agent_id, "epii" | "anima" | "aletheia"),
        "mayMutateIdentity": false,
        "requiresEpiiReviewForPromotion": true,
    }));
    envelope["method"] = Value::String("s5.episodic.search".to_owned());
    // Echo the query back. The HTTP sidecar this native path replaced did
    // (`lib.rs:745`) and callers read it to correlate a response with the
    // request that produced it; the 2026-07-18 port dropped it silently.
    envelope["query"] = Value::String(query.to_owned());
    envelope["sessionKey"] = Value::String(session_key.to_owned());
    envelope["namespaceRef"] = Value::String(namespace_ref.to_owned());
    envelope["dayId"] = Value::String(day_id.to_owned());
    envelope["runtimeAvailable"] = Value::Bool(true);
    envelope["adapter"] = Value::String("native-library".to_owned());
    envelope["results"] = serde_json::to_value(scoped_query(session_key, query, limit))
        .map_err(|error| format!("native Graphiti query serialisation failed: {error}"))?;
    Ok(envelope)
}

pub async fn session_memory_deposit(params: &Value) -> Result<Value, String> {
    let content = required_str(params, "content")?;
    let source_agent = optional_str(params, "sourceAgent").unwrap_or("epii");
    let session_key = required_str(params, "sessionKey")?;
    let namespace_ref = required_str(params, "namespaceRef")?;
    let day_id = required_str(params, "dayId")?;
    let ql_position = optional_str(params, "qlPosition").unwrap_or("5'");
    let cp = optional_str(params, "cp").unwrap_or("4.5");
    let cpf = optional_str(params, "cpf").unwrap_or("(5/0)");
    let identity_mutation = params
        .get("identityMutation")
        .and_then(Value::as_bool)
        .unwrap_or(false);
    let payload = session_memory_deposit_payload(
        source_agent,
        content,
        session_key,
        namespace_ref,
        day_id,
        ql_position,
        cp,
        cpf,
        identity_mutation,
    )?;

    let mut envelope = deposit_envelope(
        "s5.episodic.deposit",
        source_agent,
        session_key,
        namespace_ref,
        day_id,
    );
    envelope["episode"] = native_deposit(&payload)?;
    Ok(envelope)
}

pub async fn kernel_resonance_deposit(params: &Value) -> Result<Value, String> {
    let source_agent = optional_str(params, "sourceAgent").unwrap_or("anima");
    let session_key = required_str(params, "sessionKey")?;
    let namespace_ref = required_str(params, "namespaceRef")?;
    let day_id = required_str(params, "dayId")?;
    let identity_mutation = params
        .get("identityMutation")
        .and_then(Value::as_bool)
        .unwrap_or(false);
    let payload = kernel_resonance_deposit_payload(
        source_agent,
        session_key,
        namespace_ref,
        day_id,
        required_str(params, "observationCoordinate")?,
        required_str(params, "sourceCoordinate")?,
        required_u8(params, "resonanceIndex", 71)?,
        required_u8(params, "tritoneSquare", 2)?,
        required_score(params, "score")?,
        required_u8(params, "kernelTick", 11)?,
        identity_mutation,
    )?;

    let mut envelope = deposit_envelope(
        "s5.episodic.kernel_resonance.deposit",
        source_agent,
        session_key,
        namespace_ref,
        day_id,
    );
    envelope["graphOwner"] = Value::String("S2".to_owned());
    envelope["deposit"] = payload.clone();
    envelope["episode"] = native_deposit(&payload)?;
    Ok(envelope)
}

pub async fn kernel_profile_observation_deposit(params: &Value) -> Result<Value, String> {
    let source_agent = optional_str(params, "sourceAgent").unwrap_or("anima");
    let session_key = required_str(params, "sessionKey")?;
    let namespace_ref = required_str(params, "namespaceRef")?;
    let day_id = required_str(params, "dayId")?;
    let vault_now_path = required_str(params, "vaultNowPath")?;
    let coordinate_anchor = params
        .get("coordinateAnchor")
        .ok_or_else(|| "coordinateAnchor is required".to_owned())?;
    let identity_mutation = params
        .get("identityMutation")
        .and_then(Value::as_bool)
        .unwrap_or(false);
    let payload = kernel_profile_observation_deposit_payload(
        source_agent,
        session_key,
        namespace_ref,
        day_id,
        vault_now_path,
        required_str(params, "sourceCoordinate")?,
        required_u8(params, "tick12", 11)?,
        required_u16(params, "degree720", 719)?,
        required_u8(params, "resonance72Index", 71)?,
        required_u8(params, "mahamayaAddress64", 63)?,
        coordinate_anchor,
        identity_mutation,
    )?;

    let mut envelope = deposit_envelope(
        "s5.episodic.kernel_profile_observation.deposit",
        source_agent,
        session_key,
        namespace_ref,
        day_id,
    );
    envelope["kernelOwner"] = Value::String("S0".to_owned());
    envelope["graphOwner"] = Value::String("S2".to_owned());
    envelope["dayNowPath"] = Value::String(vault_now_path.to_owned());
    envelope["deposit"] = payload.clone();
    envelope["episode"] = native_deposit(&payload)?;
    Ok(envelope)
}

fn native_deposit(payload: &Value) -> Result<Value, String> {
    let content = required_str(payload, "content")?;
    let session_key = required_str(payload, "group_id")?;
    let source = optional_str(payload, "source").unwrap_or("epii");
    let transcript_ref = required_str(payload, "arc_id")?;
    let receipt = native_client()?
        .lock()
        .map_err(|_| "native Graphiti gateway store lock poisoned".to_owned())?
        .ingest_transcript(
            content,
            Some(session_key),
            Some(source),
            Some(transcript_ref),
        )?;
    serde_json::to_value(receipt)
        .map_err(|error| format!("native Graphiti receipt serialisation failed: {error}"))
}

fn scoped_query(session_key: &str, query: &str, limit: usize) -> MemoryQueryResult {
    let client = match native_client().and_then(|client| {
        client
            .lock()
            .map_err(|_| "native Graphiti gateway store lock poisoned".to_owned())
    }) {
        Ok(client) => client,
        Err(_) => return MemoryQueryResult::default(),
    };
    let mut result = client.query_graphiti(query, limit);
    result
        .episodes
        .retain(|episode| episode.session_id == session_key);
    let episode_ids = result
        .episodes
        .iter()
        .map(|episode| episode.uuid.clone())
        .collect::<BTreeSet<_>>();
    result.entities.retain(|entity| {
        episode_ids.contains(&entity.first_seen_episode)
            || episode_ids.contains(&entity.last_seen_episode)
    });
    let entity_ids = result
        .entities
        .iter()
        .map(|entity| entity.uuid.clone())
        .collect::<BTreeSet<_>>();
    result.relationships.retain(|edge| {
        entity_ids.contains(&edge.source_uuid) && entity_ids.contains(&edge.target_uuid)
    });
    result
}

fn native_client() -> Result<&'static Mutex<NativeLibraryClient>, String> {
    Ok(NATIVE_GATEWAY_CLIENT.get_or_init(|| Mutex::new(NativeLibraryClient::default())))
}

fn memory_envelope(access: Value) -> Value {
    json!({
        "coordinate": "S5/S5'",
        "runtimeOwner": "S3'",
        "invocationOwner": "S5/S5'",
        "privacyBoundary": "protected-local-episodic-memory",
        "access": access,
    })
}

fn deposit_envelope(
    method: &str,
    source_agent: &str,
    session_key: &str,
    namespace_ref: &str,
    day_id: &str,
) -> Value {
    let mut envelope = memory_envelope(json!({
        "sourceAgent": source_agent,
        "maySearch": true,
        "mayDeposit": true,
        "mayMutateIdentity": false,
        "requiresEpiiReview": true,
    }));
    envelope["method"] = Value::String(method.to_owned());
    envelope["sessionKey"] = Value::String(session_key.to_owned());
    envelope["namespaceRef"] = Value::String(namespace_ref.to_owned());
    envelope["dayId"] = Value::String(day_id.to_owned());
    envelope["runtimeAvailable"] = Value::Bool(true);
    envelope["adapter"] = Value::String("native-library".to_owned());
    envelope
}

fn required_str<'a>(params: &'a Value, key: &str) -> Result<&'a str, String> {
    optional_str(params, key).ok_or_else(|| format!("{key} is required"))
}

fn optional_str<'a>(params: &'a Value, key: &str) -> Option<&'a str> {
    params.get(key).and_then(Value::as_str)
}

fn required_u8(params: &Value, key: &str, max: u8) -> Result<u8, String> {
    let value = params
        .get(key)
        .and_then(Value::as_u64)
        .ok_or_else(|| format!("{key} is required"))?;
    if value > max as u64 {
        return Err(format!("{key} must be <= {max}"));
    }
    Ok(value as u8)
}

fn required_u16(params: &Value, key: &str, max: u16) -> Result<u16, String> {
    let value = params
        .get(key)
        .and_then(Value::as_u64)
        .ok_or_else(|| format!("{key} is required"))?;
    if value > max as u64 {
        return Err(format!("{key} must be <= {max}"));
    }
    Ok(value as u16)
}

fn required_score(params: &Value, key: &str) -> Result<f64, String> {
    let value = params
        .get(key)
        .and_then(Value::as_f64)
        .ok_or_else(|| format!("{key} is required"))?;
    if !value.is_finite() || !(0.0..=1.0).contains(&value) {
        return Err(format!("{key} must be normalized between 0 and 1"));
    }
    Ok(value)
}
