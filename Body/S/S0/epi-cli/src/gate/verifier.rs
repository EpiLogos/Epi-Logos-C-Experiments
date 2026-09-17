// S0 ADAPTER: Body/S/epi-kernel-contract (constraint + VerifierReport law) over Body/S/S0/epi-lib (the compiled Anuttara verifier) — this file builds JSON-RPC results from those shapes; the verification law is not here.
//! Coordinate: S0 -> S0'
//! Residency: Body/S/S0/epi-cli/src/gate/verifier.rs
//! Position (#n): #0' -- live gateway adapter for the compiled Anuttara verifier.
//! Actualises: `s0'.verifier.*` product methods over the M0 verifier substrate.
//! Public surface: JSON-RPC result builders used by `gate::server::dispatch_rpc`.
//! Does NOT own: verifier law, the language registry, or OWL storage.
//! Contract: [[S0-SPEC]] -> [[M0'-SPEC]].

use epi_lib::m0_verifier::{evaluate_state, is_language_member, M0VerifierStateInput};
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::Path;

use chrono::Utc;
use epi_s3_gateway::runtime::GatewayRuntimeState;
use epi_s3_gateway::verifier::parse_verifier_symbolic_coordinate;
use epi_s3_gateway_contract::{
    M0VerifierKernelState, M0VerifierMembershipRequest, M0VerifierOwlQuery,
    M0VerifierRespondQuestionReceipt, M0VerifierRespondQuestionRequest,
};
use serde_json::{json, Value};
use uuid::Uuid;

fn state(params: &Value) -> Result<M0VerifierStateInput, String> {
    let source = params.get("state").unwrap_or(params);
    let source: M0VerifierKernelState = serde_json::from_value(source.clone())
        .map_err(|err| format!("invalid verifier state: {err}"))?;
    Ok(M0VerifierStateInput {
        committed_virtue_mask: source.committed_virtue_mask,
        virtue_evidence: source.virtue_evidence,
        observed_core_relation_count: source.observed_core_relation_count,
        syntax_layer_mask: source.syntax_layer_mask,
        active_archetype: source.active_archetype,
        active_tct_position: source.active_tct_position,
        slot_privacy_boundary_compliance: source.slot_privacy_boundary_compliance,
    })
}

pub fn check_state(params: &Value) -> Result<Value, String> {
    let report = evaluate_state(&state(params)?)?;
    Ok(json!({
        "virtueWitnessVector": report.virtue_witness_vector,
        "virtueScores": report.virtue_scores,
        "unsatisfiedConstraints": report.unsatisfied_constraints,
        "coherenceScore": report.coherence_score,
        "slotPrivacyBoundaryCompliance": report.slot_privacy_boundary_compliance,
    }))
}

pub fn emit_query(params: &Value) -> Result<Value, String> {
    let report = evaluate_state(&state(params)?)?;
    let query = report
        .typed_queries
        .first()
        .ok_or_else(|| "compiled M0 verifier raised no typed query for this state".to_owned())?;
    Ok(json!({
        "surface": "full-7-laws",
        "lawFamily": format!("coordinate-language-law-{}", query.law_family),
        "symbolicCoordinateString": query.symbolic_coordinate_string,
        "query": query.query_kind,
    }))
}

pub fn respond_question(
    state_root: &Path,
    runtime: &GatewayRuntimeState,
    peer_is_loopback: bool,
    params: &Value,
) -> Result<Value, String> {
    if !peer_is_loopback {
        return Err("protected-local verifier responses require a loopback peer".to_owned());
    }
    let request: M0VerifierRespondQuestionRequest = serde_json::from_value(params.clone())
        .map_err(|err| format!("invalid verifier response request: {err}"))?;
    let response_text = request.response_text.trim();
    if response_text.is_empty() {
        return Err("responseText must be non-empty".to_owned());
    }
    if response_text.len() > 8_192 {
        return Err("responseText exceeds the 8192-byte protected-local limit".to_owned());
    }
    if request.source_extension_id != "m0-anuttara" {
        return Err("sourceExtensionId must be m0-anuttara".to_owned());
    }
    if request.session_key.trim().is_empty() {
        return Err("sessionKey must be non-empty".to_owned());
    }
    let parse = parse_verifier_symbolic_coordinate(&request.coordinate_string)?;
    let profile_generation = request.profile_generation.ok_or_else(|| {
        "profileGeneration must identify the emitted verifier question".to_owned()
    })?;
    if !runtime.is_recent_verifier_question(profile_generation, &request.coordinate_string) {
        return Err(format!(
            "coordinateString is not an active verifier question for profile generation {profile_generation}"
        ));
    }

    let response_id = Uuid::new_v4().to_string();
    let persisted_at = Utc::now().to_rfc3339();
    let receipt = M0VerifierRespondQuestionReceipt {
        accepted: true,
        response_id: response_id.clone(),
        response_status: "responded".to_owned(),
        reverified: false,
        privacy_class: "protected_local".to_owned(),
        parse: parse.clone(),
        profile_generation: request.profile_generation,
        persisted_at: persisted_at.clone(),
    };

    let record = json!({
        "responseId": response_id,
        "coordinateString": request.coordinate_string,
        "responseText": response_text,
        "claimedSourceExtensionId": request.source_extension_id,
        "claimedSessionKey": request.session_key,
        "profileGeneration": request.profile_generation,
        "parse": parse,
        "responseStatus": "responded",
        "reverified": false,
        "privacyClass": "protected_local",
        "persistedAt": persisted_at,
        "provenance": {
            "trust": "loopback-client-claim",
            "validatedAgainstProfileGeneration": profile_generation,
            "sourceMethod": "s0'.verifier.respond_question",
        },
    });
    persist_response(state_root, &receipt.response_id, &record)?;
    serde_json::to_value(receipt).map_err(|err| err.to_string())
}

fn persist_response(state_root: &Path, response_id: &str, record: &Value) -> Result<(), String> {
    let response_root = state_root.join("verifier-responses");
    ensure_private_directory(&response_root)?;
    let destination = response_root.join(format!("{response_id}.json"));
    let temporary = response_root.join(format!(".{response_id}.tmp"));
    if destination.exists() {
        return Err("verifier response id collision".to_owned());
    }
    let bytes = serde_json::to_vec_pretty(record)
        .map_err(|err| format!("serialize verifier response: {err}"))?;
    let mut options = OpenOptions::new();
    options.write(true).create_new(true);
    #[cfg(unix)]
    {
        use std::os::unix::fs::OpenOptionsExt;
        options.mode(0o600);
    }
    let mut file = options
        .open(&temporary)
        .map_err(|err| format!("create verifier response: {err}"))?;
    file.write_all(&bytes)
        .map_err(|err| format!("write verifier response: {err}"))?;
    file.sync_all()
        .map_err(|err| format!("sync verifier response: {err}"))?;
    drop(file);
    fs::rename(&temporary, &destination)
        .map_err(|err| format!("commit verifier response: {err}"))?;
    #[cfg(unix)]
    {
        use std::os::unix::fs::{MetadataExt, PermissionsExt};

        fs::set_permissions(&destination, fs::Permissions::from_mode(0o600))
            .map_err(|err| format!("protect verifier response: {err}"))?;
        if fs::metadata(&destination)
            .map_err(|err| format!("inspect verifier response: {err}"))?
            .mode()
            & 0o777
            != 0o600
        {
            return Err("verifier response permissions are not 0600".to_owned());
        }
    }
    Ok(())
}

fn ensure_private_directory(path: &Path) -> Result<(), String> {
    if let Ok(metadata) = fs::symlink_metadata(path) {
        if metadata.file_type().is_symlink() {
            return Err("verifier response store must not be a symlink".to_owned());
        }
        if !metadata.is_dir() {
            return Err("verifier response store is not a directory".to_owned());
        }
    } else {
        #[cfg(unix)]
        {
            use std::os::unix::fs::DirBuilderExt;

            let mut builder = fs::DirBuilder::new();
            builder.recursive(true).mode(0o700);
            builder
                .create(path)
                .map_err(|err| format!("create verifier response store: {err}"))?;
        }
        #[cfg(not(unix))]
        fs::create_dir_all(path).map_err(|err| format!("create verifier response store: {err}"))?;
    }
    #[cfg(unix)]
    {
        use std::os::unix::fs::{MetadataExt, PermissionsExt};

        fs::set_permissions(path, fs::Permissions::from_mode(0o700))
            .map_err(|err| format!("protect verifier response store: {err}"))?;
        if fs::metadata(path)
            .map_err(|err| format!("inspect verifier response store: {err}"))?
            .mode()
            & 0o777
            != 0o700
        {
            return Err("verifier response store permissions are not 0700".to_owned());
        }
    }
    Ok(())
}

pub fn validate_membership(params: &Value) -> Result<Value, String> {
    let request: M0VerifierMembershipRequest = serde_json::from_value(params.clone())
        .map_err(|err| format!("invalid membership request: {err}"))?;
    if request.registry_cardinality != 128 {
        return Err(format!(
            "Anuttara registry cardinality must be 128, got {}",
            request.registry_cardinality
        ));
    }
    Ok(json!({
        "languageElement": request.language_element,
        "registryCardinality": request.registry_cardinality,
        "member": is_language_member(&request.language_element)?,
    }))
}

pub fn owl_query(params: &Value) -> Result<Value, String> {
    let request: M0VerifierOwlQuery = serde_json::from_value(params.clone())
        .map_err(|err| format!("invalid OWL query request: {err}"))?;
    Err(format!(
        "s0'.verifier.owl_query requires a configured S2 ontology adapter; reasoner {} was not invoked for query {:?}",
        request.reasoner, request.query
    ))
}

#[cfg(test)]
mod tests {
    use super::respond_question;
    use epi_s3_gateway::runtime::GatewayRuntimeState;
    use serde_json::json;

    #[test]
    fn protected_local_response_refuses_non_loopback_peer() {
        let error = respond_question(
            std::path::Path::new("/unused"),
            &GatewayRuntimeState::default(),
            false,
            &json!({
                "coordinateString": "#R0-0/1/A-T7-pending?",
                "responseText": "must not persist",
                "sourceExtensionId": "m0-anuttara",
                "sessionKey": "m0-anuttara-symbolic",
                "profileGeneration": 1
            }),
        )
        .expect_err("non-loopback clients must not write protected-local responses");

        assert!(error.contains("loopback"));
    }
}
