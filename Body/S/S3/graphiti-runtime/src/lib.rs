use chrono::Utc;
use epi_s3_gateway_contract::{
    ProvenanceEvent, GRAPHITI_BASE_URL, GRAPHITI_INVOCATION_OWNER, GRAPHITI_PORT,
    GRAPHITI_RUNTIME_AUTHORITY,
};
use serde::Serialize;
use serde_json::{json, Value};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct GraphitiRuntimeConfig {
    pub base_url: &'static str,
    pub port: u16,
    pub runtime_authority: &'static str,
    pub invocation_owner: &'static str,
    pub compatibility_http_adapter: bool,
}

impl Default for GraphitiRuntimeConfig {
    fn default() -> Self {
        Self {
            base_url: GRAPHITI_BASE_URL,
            port: GRAPHITI_PORT,
            runtime_authority: GRAPHITI_RUNTIME_AUTHORITY,
            invocation_owner: GRAPHITI_INVOCATION_OWNER,
            compatibility_http_adapter: true,
        }
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GraphitiStatus {
    pub running: bool,
    pub url: String,
    pub health: Option<Value>,
}

pub fn fire_provenance(event: ProvenanceEvent) {
    tokio::spawn(async move {
        let client = reqwest::Client::new();
        let _ = client
            .post(format!("{GRAPHITI_BASE_URL}/provenance"))
            .json(&event)
            .timeout(std::time::Duration::from_secs(3))
            .send()
            .await;
    });
}

pub fn provenance_from_record(
    event_type: &str,
    session_id: &str,
    canonical_key: &str,
    channel: Option<&str>,
    day_id: Option<&str>,
    vault_now_path: Option<&str>,
) -> ProvenanceEvent {
    ProvenanceEvent {
        event_type: event_type.to_owned(),
        session_id: session_id.to_owned(),
        channel_id: canonical_key.to_owned(),
        channel_type: channel.unwrap_or("unknown").to_owned(),
        day_id: day_id.unwrap_or("").to_owned(),
        vault_now_path: vault_now_path.unwrap_or("").to_owned(),
        timestamp: iso8601_now(),
    }
}

pub fn session_memory_envelope(access: Value) -> Value {
    json!({
        "coordinate": "S5/S5'",
        "runtimeOwner": "S3'",
        "invocationOwner": "S5/S5'",
        "runtimeAuthority": GRAPHITI_RUNTIME_AUTHORITY,
        "invocationAuthority": GRAPHITI_INVOCATION_OWNER,
        "privacyBoundary": "protected-local-episodic-memory",
        "runtimeUrl": GRAPHITI_BASE_URL,
        "access": access,
    })
}

#[allow(clippy::too_many_arguments)]
pub fn session_memory_deposit_payload(
    source_agent: &str,
    content: &str,
    session_key: &str,
    namespace_ref: &str,
    day_id: &str,
    ql_position: &str,
    cp: &str,
    cpf: &str,
    identity_mutation: bool,
) -> Result<Value, String> {
    if identity_mutation {
        return Err("Graphiti session-memory deposit cannot mutate protected identity; route identity-affecting changes through Epii review".to_owned());
    }

    Ok(json!({
        "source": source_agent,
        "content": content,
        "ql_position": ql_position,
        "cp": cp,
        "cpf": cpf,
        "group_id": session_key,
        "arc_id": format!("day:{day_id}:session:{session_key}:namespace:{namespace_ref}"),
    }))
}

#[allow(clippy::too_many_arguments)]
pub fn kernel_resonance_deposit_payload(
    source_agent: &str,
    session_key: &str,
    namespace_ref: &str,
    day_id: &str,
    observation_coordinate: &str,
    source_coordinate: &str,
    resonance_index: u8,
    tritone_square: u8,
    score: f64,
    kernel_tick: u8,
    identity_mutation: bool,
) -> Result<Value, String> {
    if observation_coordinate.trim().is_empty() {
        return Err("observationCoordinate is required".into());
    }
    if source_coordinate.trim().is_empty() {
        return Err("sourceCoordinate is required".into());
    }
    if !score.is_finite() {
        return Err("kernel resonance score must be finite".into());
    }
    if !(0.0..=1.0).contains(&score) {
        return Err("kernel resonance score must be normalized between 0 and 1".into());
    }

    let content = format!(
        "Kernel resonance observation {observation_coordinate} links {source_coordinate} through resonance index {resonance_index}, tritone square {tritone_square}, score {score:.6}, kernel tick {}.",
        kernel_tick % 12
    );
    let mut payload = session_memory_deposit_payload(
        source_agent,
        &content,
        session_key,
        namespace_ref,
        day_id,
        "2/5",
        "S2.5",
        "kernel-resonance",
        identity_mutation,
    )?;
    payload["episode_type"] = Value::String("kernel_resonance".to_owned());
    payload["metadata"] = json!({
        "observation_coordinate": observation_coordinate,
        "source_coordinate": source_coordinate,
        "resonance_index": resonance_index,
        "tritone_square": tritone_square,
        "score": score,
        "kernel_tick": kernel_tick % 12,
        "runtime_owner": "S3'",
        "graph_owner": "S2",
        "invocation_owner": "S5/S5'",
    });
    Ok(payload)
}

#[allow(clippy::too_many_arguments)]
pub fn kernel_profile_observation_deposit_payload(
    source_agent: &str,
    session_key: &str,
    namespace_ref: &str,
    day_id: &str,
    vault_now_path: &str,
    source_coordinate: &str,
    tick12: u8,
    degree720: u16,
    resonance72_index: u8,
    mahamaya_address64: u8,
    coordinate_anchor: &Value,
    identity_mutation: bool,
) -> Result<Value, String> {
    if source_coordinate.trim().is_empty() {
        return Err("sourceCoordinate is required".into());
    }
    if vault_now_path.trim().is_empty() {
        return Err("vaultNowPath is required".into());
    }
    if !coordinate_anchor.is_object() {
        return Err("coordinateAnchor must be an object".into());
    }
    if let Some(key) = protected_kernel_state_key(coordinate_anchor) {
        return Err(format!(
            "coordinateAnchor cannot include protected kernel state key `{key}`"
        ));
    }

    let content = format!(
        "Kernel profile observation links {source_coordinate} at harmonic clock tick {}, degree720 {}, resonance72 index {}, Mahamaya address64 {}, with S2-certified coordinate anchor evidence.",
        tick12 % 12,
        degree720 % 720,
        resonance72_index % 72,
        mahamaya_address64 % 64
    );
    let mut payload = session_memory_deposit_payload(
        source_agent,
        &content,
        session_key,
        namespace_ref,
        day_id,
        "3/5",
        "S3.5",
        "kernel-profile-observation",
        identity_mutation,
    )?;
    payload["episode_type"] = Value::String("kernel_profile_observation".to_owned());
    payload["metadata"] = json!({
        "source_coordinate": source_coordinate,
        "tick12": tick12 % 12,
        "degree720": degree720 % 720,
        "resonance72_index": resonance72_index % 72,
        "mahamaya_address64": mahamaya_address64 % 64,
        "vault_now_path": vault_now_path,
        "coordinate_anchor": coordinate_anchor,
        "harmonic_medium": "portal-core::MathemeHarmonicProfile",
        "kernel_owner": "S0",
        "graph_owner": "S2",
        "runtime_owner": "S3'",
        "invocation_owner": "S5/S5'",
        "privacy_boundary": "protected-local-episodic-memory",
    });
    Ok(payload)
}

fn protected_kernel_state_key(value: &Value) -> Option<&'static str> {
    const PROTECTED_KEYS: &[&str] = &[
        "q_b",
        "q_p",
        "qB",
        "qP",
        "raw_state",
        "rawState",
        "bio_quaternion_state",
        "bioQuaternionState",
    ];

    match value {
        Value::Object(map) => {
            for (key, child) in map {
                if let Some(protected) = PROTECTED_KEYS.iter().find(|candidate| **candidate == key)
                {
                    return Some(*protected);
                }
                if let Some(protected) = protected_kernel_state_key(child) {
                    return Some(protected);
                }
            }
            None
        }
        Value::Array(values) => values.iter().find_map(protected_kernel_state_key),
        _ => None,
    }
}

pub fn compose_file_path() -> Result<String, String> {
    let candidates = [
        std::env::var("EPILOGOS_ROOT").unwrap_or_default(),
        std::env::current_dir()
            .unwrap_or_default()
            .display()
            .to_string(),
        std::env::var("HOME")
            .map(|h| format!("{h}/Documents/Epi-Logos C Experiments"))
            .unwrap_or_default(),
    ];
    for candidate in &candidates {
        if candidate.is_empty() {
            continue;
        }
        let path = std::path::Path::new(candidate).join("docker-compose.epi-s2.yml");
        if path.exists() {
            return Ok(path.display().to_string());
        }
    }
    Err("docker-compose.epi-s2.yml not found - set EPILOGOS_ROOT env var".into())
}

pub fn start(json_output: bool) -> Result<String, String> {
    let compose_file = compose_file_path()?;
    let output = std::process::Command::new("docker")
        .args([
            "compose",
            "-f",
            &compose_file,
            "up",
            "-d",
            "--build",
            "graphiti",
        ])
        .output()
        .map_err(|e| format!("docker compose failed: {e}"))?;

    if output.status.success() {
        let msg = "graphiti compatibility runtime started (epi-graphiti on port 37778)";
        if json_output {
            serde_json::to_string(&json!({"ok": true, "message": msg})).map_err(|e| e.to_string())
        } else {
            Ok(msg.to_string())
        }
    } else {
        Err(String::from_utf8_lossy(&output.stderr).into_owned())
    }
}

pub fn stop(json_output: bool) -> Result<String, String> {
    let compose_file = compose_file_path()?;
    let output = std::process::Command::new("docker")
        .args(["compose", "-f", &compose_file, "stop", "graphiti"])
        .output()
        .map_err(|e| format!("docker compose failed: {e}"))?;

    if output.status.success() {
        let msg = "graphiti compatibility runtime stopped";
        if json_output {
            serde_json::to_string(&json!({"ok": true, "message": msg})).map_err(|e| e.to_string())
        } else {
            Ok(msg.to_string())
        }
    } else {
        Err(String::from_utf8_lossy(&output.stderr).into_owned())
    }
}

pub async fn status(json_output: bool) -> Result<String, String> {
    let report = status_value().await;

    if json_output {
        serde_json::to_string_pretty(&report).map_err(|e| e.to_string())
    } else if report.running {
        Ok(format!(
            "graphiti: running at {} (port {GRAPHITI_PORT})",
            GRAPHITI_BASE_URL
        ))
    } else {
        Ok(format!(
            "graphiti: not running (expected at port {GRAPHITI_PORT})\n  compatibility start: epi gate graphiti start"
        ))
    }
}

pub async fn status_value() -> GraphitiStatus {
    let url = format!("{GRAPHITI_BASE_URL}/health");
    let result = reqwest::Client::new()
        .get(&url)
        .timeout(std::time::Duration::from_millis(750))
        .send()
        .await;

    let (running, health) = match result {
        Ok(resp) if resp.status().is_success() => {
            let body: Value = resp.json().await.unwrap_or(json!({"status": "ok"}));
            (true, Some(body))
        }
        _ => (false, None),
    };

    GraphitiStatus {
        running,
        url: GRAPHITI_BASE_URL.to_string(),
        health,
    }
}

pub async fn session_memory_search(params: &Value) -> Result<Value, String> {
    let query = required_str(params, "query")?;
    let agent_id = optional_str(params, "agentId").unwrap_or("epii");
    let session_key = required_str(params, "sessionKey")?;
    let namespace_ref = required_str(params, "namespaceRef")?;
    let day_id = required_str(params, "dayId")?;
    let limit = params
        .get("limit")
        .and_then(|value| value.as_u64())
        .unwrap_or(10)
        .clamp(1, 50);

    let mut envelope = session_memory_envelope(json!({
        "agentId": agent_id,
        "maySearch": true,
        "mayDeposit": matches!(agent_id, "epii" | "anima" | "aletheia"),
        "mayMutateIdentity": false,
        "requiresEpiiReviewForPromotion": true,
    }));
    envelope["method"] = Value::String("s5.episodic.search".to_owned());
    envelope["query"] = Value::String(query.to_owned());
    envelope["sessionKey"] = Value::String(session_key.to_owned());
    envelope["namespaceRef"] = Value::String(namespace_ref.to_owned());
    envelope["dayId"] = Value::String(day_id.to_owned());

    match reqwest::Client::new()
        .get(format!("{GRAPHITI_BASE_URL}/search"))
        .query(&[
            ("query", query.to_owned()),
            ("group_id", session_key.to_owned()),
            ("num_results", limit.to_string()),
        ])
        .timeout(graphiti_runtime_timeout())
        .send()
        .await
    {
        Ok(response) if response.status().is_success() => {
            let body = response.json::<Value>().await.unwrap_or_else(|_| json!({}));
            envelope["runtimeAvailable"] = Value::Bool(true);
            envelope["results"] = body["results"].clone();
            envelope["cache"] = body["cache"].clone();
        }
        Ok(response) => {
            envelope["runtimeAvailable"] = Value::Bool(false);
            envelope["error"] = json!({
                "kind": "graphiti-http-error",
                "status": response.status().as_u16(),
            });
            envelope["results"] = json!([]);
        }
        Err(error) => {
            envelope["runtimeAvailable"] = Value::Bool(false);
            envelope["error"] = json!({
                "kind": "graphiti-unavailable",
                "message": error.to_string(),
                "next": "Start the compatibility runtime with `epi gate graphiti start`, or replace it with the native S3 Graphiti runtime adapter."
            });
            envelope["results"] = json!([]);
        }
    }

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
        .and_then(|value| value.as_bool())
        .unwrap_or(false);

    let mut envelope = session_memory_envelope(json!({
        "sourceAgent": source_agent,
        "maySearch": true,
        "mayDeposit": true,
        "mayMutateIdentity": false,
        "requiresEpiiReview": true,
    }));
    envelope["method"] = Value::String("s5.episodic.deposit".to_owned());
    envelope["sessionKey"] = Value::String(session_key.to_owned());
    envelope["namespaceRef"] = Value::String(namespace_ref.to_owned());
    envelope["dayId"] = Value::String(day_id.to_owned());

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

    match reqwest::Client::new()
        .post(format!("{GRAPHITI_BASE_URL}/episode"))
        .json(&payload)
        .timeout(graphiti_runtime_timeout())
        .send()
        .await
    {
        Ok(response) if response.status().is_success() => {
            let body = response.json::<Value>().await.unwrap_or_else(|_| json!({}));
            envelope["runtimeAvailable"] = Value::Bool(true);
            envelope["episode"] = body;
        }
        Ok(response) => {
            envelope["runtimeAvailable"] = Value::Bool(false);
            envelope["error"] = json!({
                "kind": "graphiti-http-error",
                "status": response.status().as_u16(),
            });
        }
        Err(error) => {
            envelope["runtimeAvailable"] = Value::Bool(false);
            envelope["error"] = json!({
                "kind": "graphiti-unavailable",
                "message": error.to_string(),
                "next": "Start the compatibility runtime with `epi gate graphiti start`, or replace it with the native S3 Graphiti runtime adapter."
            });
        }
    }

    Ok(envelope)
}

pub async fn kernel_resonance_deposit(params: &Value) -> Result<Value, String> {
    let source_agent = optional_str(params, "sourceAgent").unwrap_or("anima");
    let session_key = required_str(params, "sessionKey")?;
    let namespace_ref = required_str(params, "namespaceRef")?;
    let day_id = required_str(params, "dayId")?;
    let observation_coordinate = required_str(params, "observationCoordinate")?;
    let source_coordinate = required_str(params, "sourceCoordinate")?;
    let resonance_index = required_u8(params, "resonanceIndex", 71)?;
    let tritone_square = required_u8(params, "tritoneSquare", 2)?;
    let score = required_score(params, "score")?;
    let kernel_tick = required_u8(params, "kernelTick", 11)?;
    let identity_mutation = params
        .get("identityMutation")
        .and_then(|value| value.as_bool())
        .unwrap_or(false);

    let payload = kernel_resonance_deposit_payload(
        source_agent,
        session_key,
        namespace_ref,
        day_id,
        observation_coordinate,
        source_coordinate,
        resonance_index,
        tritone_square,
        score,
        kernel_tick,
        identity_mutation,
    )?;

    let mut envelope = session_memory_envelope(json!({
        "sourceAgent": source_agent,
        "maySearch": true,
        "mayDeposit": true,
        "mayMutateIdentity": false,
        "requiresEpiiReview": true,
        "graphOwner": "S2",
    }));
    envelope["method"] = Value::String("s5.episodic.kernel_resonance.deposit".to_owned());
    envelope["sessionKey"] = Value::String(session_key.to_owned());
    envelope["namespaceRef"] = Value::String(namespace_ref.to_owned());
    envelope["dayId"] = Value::String(day_id.to_owned());
    envelope["deposit"] = payload.clone();

    match reqwest::Client::new()
        .post(format!("{GRAPHITI_BASE_URL}/episode"))
        .json(&payload)
        .timeout(graphiti_runtime_timeout())
        .send()
        .await
    {
        Ok(response) if response.status().is_success() => {
            let body = response.json::<Value>().await.unwrap_or_else(|_| json!({}));
            envelope["runtimeAvailable"] = Value::Bool(true);
            envelope["episode"] = body;
        }
        Ok(response) => {
            envelope["runtimeAvailable"] = Value::Bool(false);
            envelope["error"] = json!({
                "kind": "graphiti-http-error",
                "status": response.status().as_u16(),
            });
        }
        Err(error) => {
            envelope["runtimeAvailable"] = Value::Bool(false);
            envelope["error"] = json!({
                "kind": "graphiti-unavailable",
                "message": error.to_string(),
                "next": "Start the compatibility runtime with `epi gate graphiti start`, or replace it with the native S3 Graphiti runtime adapter."
            });
        }
    }

    Ok(envelope)
}

pub async fn kernel_profile_observation_deposit(params: &Value) -> Result<Value, String> {
    let source_agent = optional_str(params, "sourceAgent").unwrap_or("anima");
    let session_key = required_str(params, "sessionKey")?;
    let namespace_ref = required_str(params, "namespaceRef")?;
    let day_id = required_str(params, "dayId")?;
    let vault_now_path = required_str(params, "vaultNowPath")?;
    let source_coordinate = required_str(params, "sourceCoordinate")?;
    let tick12 = required_u8(params, "tick12", 11)?;
    let degree720 = required_u16(params, "degree720", 719)?;
    let resonance72_index = required_u8(params, "resonance72Index", 71)?;
    let mahamaya_address64 = required_u8(params, "mahamayaAddress64", 63)?;
    let coordinate_anchor = params
        .get("coordinateAnchor")
        .ok_or_else(|| "coordinateAnchor is required".to_owned())?;
    let identity_mutation = params
        .get("identityMutation")
        .and_then(|value| value.as_bool())
        .unwrap_or(false);

    let payload = kernel_profile_observation_deposit_payload(
        source_agent,
        session_key,
        namespace_ref,
        day_id,
        vault_now_path,
        source_coordinate,
        tick12,
        degree720,
        resonance72_index,
        mahamaya_address64,
        coordinate_anchor,
        identity_mutation,
    )?;

    let mut envelope = session_memory_envelope(json!({
        "sourceAgent": source_agent,
        "maySearch": true,
        "mayDeposit": true,
        "mayMutateIdentity": false,
        "requiresEpiiReview": true,
        "kernelOwner": "S0",
        "graphOwner": "S2",
        "dayNowPath": vault_now_path,
    }));
    envelope["method"] = Value::String("s5.episodic.kernel_profile_observation.deposit".to_owned());
    envelope["sessionKey"] = Value::String(session_key.to_owned());
    envelope["namespaceRef"] = Value::String(namespace_ref.to_owned());
    envelope["dayId"] = Value::String(day_id.to_owned());
    envelope["deposit"] = payload.clone();

    match reqwest::Client::new()
        .post(format!("{GRAPHITI_BASE_URL}/episode"))
        .json(&payload)
        .timeout(graphiti_runtime_timeout())
        .send()
        .await
    {
        Ok(response) if response.status().is_success() => {
            let body = response.json::<Value>().await.unwrap_or_else(|_| json!({}));
            envelope["runtimeAvailable"] = Value::Bool(true);
            envelope["episode"] = body;
        }
        Ok(response) => {
            envelope["runtimeAvailable"] = Value::Bool(false);
            envelope["error"] = json!({
                "kind": "graphiti-http-error",
                "status": response.status().as_u16(),
            });
        }
        Err(error) => {
            envelope["runtimeAvailable"] = Value::Bool(false);
            envelope["error"] = json!({
                "kind": "graphiti-unavailable",
                "message": error.to_string(),
                "next": "Start the compatibility runtime with `epi gate graphiti start`, or replace it with the native S3 Graphiti runtime adapter."
            });
        }
    }

    Ok(envelope)
}

fn iso8601_now() -> String {
    Utc::now().to_rfc3339()
}

fn graphiti_runtime_timeout() -> std::time::Duration {
    let millis = std::env::var("EPI_GRAPHITI_TIMEOUT_MS")
        .ok()
        .and_then(|value| value.parse::<u64>().ok())
        .unwrap_or(3_000);
    std::time::Duration::from_millis(millis.max(1_000))
}

fn required_str<'a>(params: &'a Value, key: &str) -> Result<&'a str, String> {
    optional_str(params, key).ok_or_else(|| format!("{key} is required"))
}

fn optional_str<'a>(params: &'a Value, key: &str) -> Option<&'a str> {
    params.get(key).and_then(|value| value.as_str())
}

fn required_u8(params: &Value, key: &str, max: u8) -> Result<u8, String> {
    let value = params
        .get(key)
        .and_then(|value| value.as_u64())
        .ok_or_else(|| format!("{key} is required"))?;
    if value > max as u64 {
        return Err(format!("{key} must be <= {max}"));
    }
    Ok(value as u8)
}

fn required_u16(params: &Value, key: &str, max: u16) -> Result<u16, String> {
    let value = params
        .get(key)
        .and_then(|value| value.as_u64())
        .ok_or_else(|| format!("{key} is required"))?;
    if value > max as u64 {
        return Err(format!("{key} must be <= {max}"));
    }
    Ok(value as u16)
}

fn required_score(params: &Value, key: &str) -> Result<f64, String> {
    let value = params
        .get(key)
        .and_then(|value| value.as_f64())
        .ok_or_else(|| format!("{key} is required"))?;
    if !value.is_finite() {
        return Err(format!("{key} must be finite"));
    }
    if !(0.0..=1.0).contains(&value) {
        return Err(format!("{key} must be normalized between 0 and 1"));
    }
    Ok(value)
}
