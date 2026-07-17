//! Coordinate: S0 -> S0'
//! Residency: Body/S/S0/epi-cli/src/gate/verifier.rs
//! Position (#n): #0' -- live gateway adapter for the compiled Anuttara verifier.
//! Actualises: `s0'.verifier.*` product methods over the M0 verifier substrate.
//! Public surface: JSON-RPC result builders used by `gate::server::dispatch_rpc`.
//! Does NOT own: verifier law, the language registry, or OWL storage.
//! Contract: [[S0-SPEC]] -> [[M0'-SPEC]].

use epi_lib::m0_verifier::{evaluate_state, is_language_member, M0VerifierStateInput};
use epi_s3_gateway_contract::{
    M0VerifierKernelState, M0VerifierMembershipRequest, M0VerifierOwlQuery,
};
use serde_json::{json, Value};

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
