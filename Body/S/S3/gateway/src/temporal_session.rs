//! S3′ living-context law: terminal projection, Redis hydration, graph-revision stamping.
//!
//! # Coordinate
//!
//! | Field | Value |
//! |-------|-------|
//! | Coordinate | S3′ |
//! | Residency  | Body/S/S3/gateway/src/temporal_session.rs |
//! | Position   | #3 — Gateway Control Plane, living context |
//! | Actualises | [[S3-SPEC]] / [[S3-ARCHITECTURE]] temporal surface, Track 53 T53.06 |
//!
//! # What came home
//!
//! This is the law that stood in `epi-cli/src/gate/temporal.rs`. Canon is
//! explicit that Redis-backed living context — session, NOW, Day, kairos, arc
//! — is S3′, and none of it was S0's to hold. Relocated verbatim: the terminal
//! metadata projection and its privacy classification, the Redis hydration
//! orchestration (mode, blocking bridge, terminal-metadata write-through), and
//! the best-effort graph-revision stamp.
//!
//! [`temporal_context`] already carried the *shape* of the context envelope;
//! what lived at S0 was the *session-facing* layer around it. The two are
//! separate modules because they answer different questions: `temporal_context`
//! builds the projection from a record, `temporal_session` resolves the record,
//! attaches terminal state, and hydrates the result into Redis.
//!
//! # The one seam
//!
//! Two fields of [`TemporalContextInputs`] — `kairos` and `pratibimba` — are
//! computed from `epi-cli`'s Nara modules (`nara::kairos`, `nara::identity`),
//! which are M4 identity law and are NOT S3's to hold. They were already
//! *injected* values on the S3 side, so this module names that injection as a
//! port ([`TemporalSurfaces`]) instead of importing upward. The composition
//! root supplies it.
//!
//! # Public surface
//! * [`TemporalSurfaces`] — the two surfaces S3 cannot compute for itself.
//! * [`context_value`] / [`context_for_record`] — the S3′ temporal context.
//! * [`hydrate_redis_from_context`] / [`hydrate_redis_from_context_blocking`] /
//!   [`hydrate_redis_for_record_on_propagation`] / [`redis_hydration_mode`].
//! * [`current_graph_revision`] / [`graph_revision_from_client`].
//! * [`terminal_redis_payload_from_context`] — the redacted terminal payload.
//!
//! # Does NOT own
//! * Kairos transits or the Pratibimba identity anchor (see [`TemporalSurfaces`]).
//! * Session creation. `SessionStore::resolve` is read-only here; the
//!   local-bootstrap `create`/`ensure` wrapper stays at the composition root
//!   because it knows the CLI's current-session snapshot.
//! * The context envelope's field layout — that is [`temporal_context`].

use std::path::{Path, PathBuf};

use serde_json::{json, Value};

use epi_s3_gateway_contract::{
    SessionRecord, TerminalBinding, TerminalCaptureMode, TerminalCapturePolicy, TerminalStatus,
};
use epi_s3_redis_context::{CacheTier, RedisCache, RedisConfig};

use crate::session_store::SessionStore;
use crate::temporal_context::{self, TemporalContextInputs};

/// The two surfaces S3′ folds into the temporal context but cannot compute.
///
/// Kairos is the current transit snapshot (`nara::kairos`); Pratibimba is the
/// protected personal anchor reference (`nara::identity`). Both are M4 identity
/// law resident above this crate's import boundary, and both were already
/// injected `Value`s on [`TemporalContextInputs`] — so this trait states the
/// dependency that was always there rather than creating a new one.
pub trait TemporalSurfaces: Send + Sync {
    /// The Kairos surface for `day_id`. `"unknown-day"` when the record has none.
    fn kairos_surface(&self, day_id: &str) -> Value;
    /// The protected Pratibimba anchor reference surface.
    fn pratibimba_surface(&self) -> Value;
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RedisHydrationMode {
    Off,
    BestEffort,
    Required,
}

pub fn context_value(
    state_root: &Path,
    store: &SessionStore,
    session_key: &str,
    agent_id: &str,
    surfaces: &dyn TemporalSurfaces,
) -> Result<Value, String> {
    let record = store.resolve(session_key)?;
    Ok(context_for_record(state_root, &record, agent_id, surfaces))
}

pub fn context_for_record(
    state_root: &Path,
    record: &SessionRecord,
    agent_id: &str,
    surfaces: &dyn TemporalSurfaces,
) -> Value {
    let mut context = temporal_context::context_for_record(
        state_root,
        record,
        agent_id,
        TemporalContextInputs {
            kairos: surfaces.kairos_surface(record.day_id.as_deref().unwrap_or("unknown-day")),
            pratibimba: surfaces.pratibimba_surface(),
            kernel: temporal_context::kernel_surface_value(),
            vault_root: vault_root_from_env(),
        },
    );
    attach_terminal_context(&mut context, record);
    context
}

pub fn hydrate_redis_for_record_on_propagation(
    state_root: &Path,
    record: &SessionRecord,
    agent_id: &str,
    surfaces: &dyn TemporalSurfaces,
) -> Result<Option<Value>, String> {
    match redis_hydration_mode() {
        RedisHydrationMode::Off => Ok(None),
        RedisHydrationMode::BestEffort => {
            let mut context = context_for_record(state_root, record, agent_id, surfaces);
            if let Err(error) = hydrate_redis_from_context_blocking(&mut context) {
                context["redis"]["hydrationError"] = json!(error);
            }
            Ok(Some(context))
        }
        RedisHydrationMode::Required => {
            let mut context = context_for_record(state_root, record, agent_id, surfaces);
            hydrate_redis_from_context_blocking(&mut context)?;
            Ok(Some(context))
        }
    }
}

pub fn redis_hydration_mode() -> RedisHydrationMode {
    match std::env::var("EPI_GATE_SESSION_REDIS_HYDRATION") {
        Ok(value) => match value.trim().to_ascii_lowercase().as_str() {
            "required" | "strict" | "1" | "true" | "yes" => RedisHydrationMode::Required,
            "best-effort" | "best_effort" | "best" => RedisHydrationMode::BestEffort,
            "off" | "false" | "0" | "no" | "" => RedisHydrationMode::Off,
            _ => RedisHydrationMode::Off,
        },
        Err(_) => RedisHydrationMode::Off,
    }
}

pub fn hydrate_redis_from_context_blocking(context: &mut Value) -> Result<(), String> {
    let context_value = context.clone();
    let hydrated = if tokio::runtime::Handle::try_current().is_ok() {
        std::thread::spawn(move || hydrate_redis_context_on_new_runtime(context_value))
            .join()
            .map_err(|_| "Redis hydration worker thread panicked".to_string())??
    } else {
        hydrate_redis_context_on_new_runtime(context_value)?
    };
    *context = hydrated;
    Ok(())
}

fn hydrate_redis_context_on_new_runtime(mut context: Value) -> Result<Value, String> {
    let runtime = tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
        .map_err(|err| err.to_string())?;
    runtime.block_on(async {
        stamp_graph_revision_best_effort(&mut context).await;
        temporal_context::hydrate_redis_from_context(&mut context).await?;
        hydrate_terminal_metadata_from_context(&mut context).await
    })?;
    Ok(context)
}

pub async fn hydrate_redis_from_context(context: &mut Value) -> Result<(), String> {
    stamp_graph_revision_best_effort(context).await;
    temporal_context::hydrate_redis_from_context(context).await?;
    hydrate_terminal_metadata_from_context(context).await
}

pub async fn current_graph_revision() -> Result<Option<u64>, String> {
    let client = epi_s2_graph_services::Neo4jClient::connect(
        &epi_s2_graph_services::Neo4jConfig::from_env(),
    )
    .map_err(|err| format!("graph metadata connection failed: {err}"))?;
    graph_revision_from_client(&client).await
}

pub async fn graph_revision_from_client(
    client: &epi_s2_graph_services::Neo4jClient,
) -> Result<Option<u64>, String> {
    let meta = tokio::time::timeout(
        std::time::Duration::from_millis(750),
        epi_s2_graph_services::read_graph_meta(client),
    )
    .await
    .map_err(|_| "graph metadata read timed out".to_owned())??;
    meta.map(|meta| {
        u64::try_from(meta.graph_revision).map_err(|_| {
            format!(
                "graph revision must be non-negative, got {}",
                meta.graph_revision
            )
        })
    })
    .transpose()
}

async fn stamp_graph_revision_best_effort(context: &mut Value) {
    match current_graph_revision().await {
        Ok(Some(revision)) => context["kernel"]["graphRevision"] = json!(revision),
        Ok(None) => {}
        Err(error) => eprintln!("[gate] graph revision unavailable during hydration: {error}"),
    }
}

pub fn terminal_redis_payload_from_context(context: &Value) -> Option<Value> {
    let terminal = context.get("terminal")?;
    if !terminal
        .get("terminalBacked")
        .and_then(Value::as_bool)
        .unwrap_or(false)
    {
        return None;
    }

    Some(json!({
        "sessionKey": terminal
            .get("attachedSessionKey")
            .cloned()
            .unwrap_or_else(|| context["session"]["canonicalKey"].clone()),
        "provider": terminal["provider"].clone(),
        "status": terminal["status"].clone(),
        "leaseExpiresAtMs": terminal["leaseExpiresAtMs"].clone(),
        "captureHandleRef": terminal["captureHandleRef"].clone(),
        "capturePolicy": terminal["capturePolicy"].clone(),
        "rawPaneBodyStored": false,
        "privacy": "terminal-live-metadata-only",
    }))
}

async fn hydrate_terminal_metadata_from_context(context: &mut Value) -> Result<(), String> {
    let Some(key) = context
        .pointer("/redis/terminalMetadataKey")
        .and_then(Value::as_str)
        .map(str::to_owned)
    else {
        return Ok(());
    };
    let Some(payload) = terminal_redis_payload_from_context(context) else {
        return Ok(());
    };

    let mut cache = RedisCache::connect(&RedisConfig::from_env())
        .await
        .map_err(|err| err.to_string())?;
    cache
        .set_with_ttl(&key, &payload.to_string(), CacheTier::Hot.ttl_seconds())
        .await
        .map_err(|err| err.to_string())?;
    context["redis"]["terminalMetadataHydrated"] = json!(true);
    Ok(())
}

fn attach_terminal_context(context: &mut Value, record: &SessionRecord) {
    let terminal = terminal_metadata_for_record(record, context);
    if let Some(key) = terminal
        .get("redisMetadataKey")
        .and_then(Value::as_str)
        .filter(|key| !key.is_empty())
    {
        context["redis"]["terminalMetadataKey"] = json!(key);
    }
    if let Some(handle) = terminal
        .get("captureHandleRef")
        .and_then(Value::as_str)
        .filter(|handle| !handle.is_empty())
    {
        context["redis"]["terminalCaptureHandleRef"] = json!(handle);
    }
    context["terminal"] = terminal;
}

fn terminal_metadata_for_record(record: &SessionRecord, context: &Value) -> Value {
    let session_id = context
        .pointer("/session/sessionId")
        .and_then(Value::as_str)
        .unwrap_or(&record.session_id);
    let Some(binding) = record.terminal_binding.as_ref() else {
        return json!({
            "terminalBacked": false,
            "provider": Value::Null,
            "status": "unbound",
            "privacy": "terminal-live-metadata-only",
        });
    };

    let provider = terminal_provider(binding);
    let status = binding
        .terminal_status
        .map(terminal_status_value)
        .unwrap_or_else(|| "unknown".to_owned());
    let lease_expires_at_ms = binding
        .lease
        .as_ref()
        .and_then(|lease| lease.lease_expires_at_ms);
    let redis_metadata_key = terminal_metadata_key(session_id);
    let capture_handle_ref = terminal_capture_handle_ref(session_id);
    let capture_policy = capture_policy_value(binding.capture_policy.as_ref());
    let status_projection_allowed = terminal_status_projection_allowed(binding);
    let binding_value = json!({
        "provider": provider,
        "terminalIdentifier": binding.terminal_identifier,
        "sessionAnchor": binding.session_anchor,
        "tmuxPaneId": binding.tmux_pane_id,
        "attachedSessionKey": binding.attached_session_key,
        "terminalStatus": status,
        "leaseExpiresAtMs": lease_expires_at_ms,
        "capturePolicy": capture_policy,
        "captureHandleRef": capture_handle_ref,
        "commandAuthority": "sessions.patch-or-bounded-agent-tmux-only",
        "rawPaneBodyIncluded": false,
        "privacy": "terminal-binding-redacted-metadata",
    });
    let status_fragment = status_projection_allowed.then(|| {
        json!({
            "terminalBacked": true,
            "provider": provider,
            "status": binding_value["terminalStatus"].clone(),
            "leaseExpiresAtMs": lease_expires_at_ms,
            "captureHandleRef": binding_value["captureHandleRef"].clone(),
            "capturePolicy": binding_value["capturePolicy"].clone(),
            "rawPaneBodyIncluded": false,
            "privacy": "terminal-status-redacted-metadata",
        })
    });

    json!({
        "terminalBacked": true,
        "provider": provider,
        "status": binding_value["terminalStatus"].clone(),
        "terminalIdentifier": binding.terminal_identifier,
        "sessionAnchor": binding.session_anchor,
        "tmuxPaneId": binding.tmux_pane_id,
        "attachedSessionKey": binding.attached_session_key,
        "leaseExpiresAtMs": lease_expires_at_ms,
        "capturePolicy": binding_value["capturePolicy"].clone(),
        "captureHandleRef": binding_value["captureHandleRef"].clone(),
        "redisMetadataKey": redis_metadata_key,
        "statusProjectionAllowed": status_projection_allowed,
        "statusFragment": status_fragment,
        "binding": binding_value,
        "rawPaneBodyIncluded": false,
        "privacy": "terminal-live-metadata-only",
    })
}

fn terminal_provider(binding: &TerminalBinding) -> &'static str {
    if binding.tmux_pane_id.is_some()
        || binding
            .terminal_identifier
            .as_deref()
            .map(|identifier| identifier.starts_with("tmux:"))
            .unwrap_or(false)
    {
        "tmux"
    } else {
        "unknown"
    }
}

fn terminal_status_value(status: TerminalStatus) -> String {
    serde_json::to_value(status)
        .ok()
        .and_then(|value| value.as_str().map(ToOwned::to_owned))
        .unwrap_or_else(|| "unknown".to_owned())
}

fn capture_policy_value(policy: Option<&TerminalCapturePolicy>) -> Value {
    let mode = policy
        .map(|policy| capture_mode_value(policy.mode))
        .unwrap_or_else(|| capture_mode_value(TerminalCaptureMode::MetadataOnly));
    json!({
        "mode": mode,
        "maxLines": policy.and_then(|policy| policy.max_lines),
        "redactionPolicy": policy
            .and_then(|policy| policy.redaction_policy.as_ref())
            .map(|_| "configured")
            .unwrap_or("metadata-only"),
    })
}

fn capture_mode_value(mode: TerminalCaptureMode) -> String {
    serde_json::to_value(mode)
        .ok()
        .and_then(|value| value.as_str().map(ToOwned::to_owned))
        .unwrap_or_else(|| "metadataOnly".to_owned())
}

fn terminal_status_projection_allowed(binding: &TerminalBinding) -> bool {
    match binding.capture_policy.as_ref() {
        None => true,
        Some(policy) if policy.mode == TerminalCaptureMode::MetadataOnly => true,
        Some(policy) => policy
            .redaction_policy
            .as_deref()
            .map(|value| !value.trim().is_empty())
            .unwrap_or(false),
    }
}

fn terminal_metadata_key(session_id: &str) -> String {
    format!("cache:hot:s3:gateway:temporal:session:{session_id}:terminal:metadata")
}

fn terminal_capture_handle_ref(session_id: &str) -> String {
    format!("s3:gateway:temporal:session:{session_id}:terminal:capture-handle")
}

fn vault_root_from_env() -> Option<PathBuf> {
    std::env::var("EPILOGOS_VAULT")
        .ok()
        .filter(|value| !value.is_empty())
        .map(PathBuf::from)
}

#[cfg(test)]
mod tests {
    use super::*;
    use epi_s3_gateway_contract::{TerminalLease, TerminalStatus};

    /// Stand-in for the composition root's Nara-backed surfaces. Its whole
    /// point is that S3 never names where the values come from.
    struct FakeSurfaces;

    impl TemporalSurfaces for FakeSurfaces {
        fn kairos_surface(&self, day_id: &str) -> Value {
            json!({ "available": true, "dayId": day_id })
        }

        fn pratibimba_surface(&self) -> Value {
            json!({ "available": true, "anchorId": "pratibimba-abcd1234" })
        }
    }

    /// A real record from a real store — the projection reads many fields, and
    /// a hand-rolled struct literal would drift from the contract.
    fn record_with_binding(name: &str, binding: Option<TerminalBinding>) -> SessionRecord {
        let mut root = std::env::temp_dir();
        root.push(format!(
            "epi-s3-temporal-session-{name}-{}",
            std::process::id()
        ));
        if root.exists() {
            std::fs::remove_dir_all(&root).unwrap();
        }
        let store = SessionStore::new(&root).unwrap();
        let mut record = store
            .create_with_context(
                "agent:main:main",
                crate::session_store::CreateSessionContext {
                    session_id: Some("20260608-120000-main".to_owned()),
                    day_id: Some("06-08-2026".to_owned()),
                    ..Default::default()
                },
            )
            .unwrap();
        record.terminal_binding = binding;
        record
    }

    fn tmux_binding() -> TerminalBinding {
        TerminalBinding {
            terminal_identifier: Some("tmux:%17".to_owned()),
            session_anchor: Some("epi".to_owned()),
            tmux_pane_id: Some("%17".to_owned()),
            attached_session_key: Some("agent:main:main".to_owned()),
            terminal_status: Some(TerminalStatus::Attached),
            lease: Some(TerminalLease {
                lease_expires_at_ms: Some(1_780_000_000_000),
                ..Default::default()
            }),
            capture_policy: None,
        }
    }

    /// The seam is real: the injected surfaces land in the envelope untouched,
    /// and S3 picks the day id off the record exactly as S0 did.
    #[test]
    fn the_injected_surfaces_land_in_the_context_and_carry_the_records_day_id() {
        let record = record_with_binding("surfaces", None);
        let context = context_for_record(Path::new("/state"), &record, "anima", &FakeSurfaces);

        assert_eq!(context["kairos"]["dayId"], json!("06-08-2026"));
        assert_eq!(context["pratibimba"]["anchorId"], json!("pratibimba-abcd1234"));
        assert_eq!(context["coordinateOwner"], json!("S3'"));
    }

    /// An unbound session must project the honest "unbound" shape and MUST NOT
    /// publish a terminal Redis key — there is nothing to hydrate.
    #[test]
    fn an_unbound_session_projects_unbound_and_publishes_no_terminal_key() {
        let record = record_with_binding("unbound", None);
        let context = context_for_record(Path::new("/state"), &record, "anima", &FakeSurfaces);

        assert_eq!(context["terminal"]["terminalBacked"], json!(false));
        assert_eq!(context["terminal"]["status"], json!("unbound"));
        assert!(context.pointer("/redis/terminalMetadataKey").is_none());
        assert!(terminal_redis_payload_from_context(&context).is_none());
    }

    /// A tmux-backed session projects redacted metadata only. The privacy
    /// classification and the `rawPaneBody*: false` flags are the contract —
    /// no pane body ever reaches the projection or the Redis payload.
    #[test]
    fn a_tmux_bound_session_projects_redacted_metadata_and_a_hydratable_key() {
        let record = record_with_binding("tmux", Some(tmux_binding()));
        let context = context_for_record(Path::new("/state"), &record, "anima", &FakeSurfaces);

        assert_eq!(context["terminal"]["terminalBacked"], json!(true));
        assert_eq!(context["terminal"]["provider"], json!("tmux"));
        assert_eq!(context["terminal"]["rawPaneBodyIncluded"], json!(false));
        assert_eq!(
            context["terminal"]["privacy"],
            json!("terminal-live-metadata-only")
        );
        assert_eq!(
            context["redis"]["terminalMetadataKey"],
            json!("cache:hot:s3:gateway:temporal:session:20260608-120000-main:terminal:metadata")
        );
        assert_eq!(
            context["redis"]["terminalCaptureHandleRef"],
            json!("s3:gateway:temporal:session:20260608-120000-main:terminal:capture-handle")
        );

        let payload =
            terminal_redis_payload_from_context(&context).expect("a bound session hydrates");
        assert_eq!(payload["provider"], json!("tmux"));
        assert_eq!(payload["rawPaneBodyStored"], json!(false));
        assert_eq!(payload["privacy"], json!("terminal-live-metadata-only"));
        assert_eq!(payload["leaseExpiresAtMs"].as_u64(), Some(1_780_000_000_000));
    }

    /// A capture policy that asks for more than metadata and declares no
    /// redaction must NOT be projected into the status fragment.
    #[test]
    fn a_capture_policy_without_redaction_refuses_status_projection() {
        let mut binding = tmux_binding();
        binding.capture_policy = Some(TerminalCapturePolicy {
            mode: TerminalCaptureMode::Transcript,
            max_lines: Some(40),
            redaction_policy: None,
        });
        let record = record_with_binding("policy-refused", Some(binding));
        let context = context_for_record(Path::new("/state"), &record, "anima", &FakeSurfaces);

        assert_eq!(context["terminal"]["statusProjectionAllowed"], json!(false));
        assert_eq!(context["terminal"]["statusFragment"], Value::Null);

        let mut allowed = tmux_binding();
        allowed.capture_policy = Some(TerminalCapturePolicy {
            mode: TerminalCaptureMode::Transcript,
            max_lines: Some(40),
            redaction_policy: Some("redact-secrets".to_owned()),
        });
        let record = record_with_binding("policy-allowed", Some(allowed));
        let context = context_for_record(Path::new("/state"), &record, "anima", &FakeSurfaces);
        assert_eq!(context["terminal"]["statusProjectionAllowed"], json!(true));
        assert_eq!(
            context["terminal"]["statusFragment"]["privacy"],
            json!("terminal-status-redacted-metadata")
        );
    }

    /// The hydration mode vocabulary is env-driven and fails CLOSED: anything
    /// unrecognised is `Off`, never an implicit write to Redis.
    #[test]
    fn the_hydration_mode_vocabulary_defaults_closed() {
        let previous = std::env::var("EPI_GATE_SESSION_REDIS_HYDRATION").ok();

        std::env::remove_var("EPI_GATE_SESSION_REDIS_HYDRATION");
        assert_eq!(redis_hydration_mode(), RedisHydrationMode::Off);
        for value in ["required", "strict", "1", "true", "yes", " REQUIRED "] {
            std::env::set_var("EPI_GATE_SESSION_REDIS_HYDRATION", value);
            assert_eq!(redis_hydration_mode(), RedisHydrationMode::Required, "{value}");
        }
        for value in ["best-effort", "best_effort", "best"] {
            std::env::set_var("EPI_GATE_SESSION_REDIS_HYDRATION", value);
            assert_eq!(
                redis_hydration_mode(),
                RedisHydrationMode::BestEffort,
                "{value}"
            );
        }
        for value in ["off", "false", "0", "no", "", "nonsense"] {
            std::env::set_var("EPI_GATE_SESSION_REDIS_HYDRATION", value);
            assert_eq!(redis_hydration_mode(), RedisHydrationMode::Off, "{value}");
        }

        match previous {
            Some(value) => std::env::set_var("EPI_GATE_SESSION_REDIS_HYDRATION", value),
            None => std::env::remove_var("EPI_GATE_SESSION_REDIS_HYDRATION"),
        }
    }
}
