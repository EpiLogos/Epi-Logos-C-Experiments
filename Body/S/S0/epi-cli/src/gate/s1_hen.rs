//! `s1'.q_articulation.accept` — the one `s1'.*` method that is not S1's alone.
//!
//! Every other `s1'.*` handler moved to `epi-s1-hen-compiler-core::s1_handlers`
//! in Track 53 T53.04, because their law is Hen's. This one stayed, and the
//! reason is structural rather than incidental: it requires human approval
//! (S5 review), then graph verification and sync (S2), and only then the vault
//! write (S1). S1 may import neither S2 nor S5, so there is no legal
//! single-crate home for it.
//!
//! It therefore composes HERE, at the composition root, which is the one place
//! licensed to depend on all three coordinates. The alternative — moving it into
//! `graph-services` because S2→S1 happens to be legal — would relocate S1's
//! vault-write law into the graph crate to dodge a wiring problem, which is the
//! exact substitution Track 53 exists to undo.

use std::fs;
use std::path::Path;

use epi_s1_hen_compiler_core::s1_handlers::{
    atomic_replace, canonical_bimba_relative_path, resolve_vault_root,
};
use epi_s1_hen_compiler_core::{plan_q_articulation_amendment, QArticulationAmendmentRequest};
use serde_json::{json, Value};

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct QArticulationAcceptParams {
    coordinate: String,
    q_key: String,
    q_value_candidate: String,
    expected_graph_revision: u64,
    accepted_review_ref: String,
    opens_questions: Vec<String>,
    source_artifacts: Vec<String>,
}

/// `s1'.q_articulation.accept` — persist an accepted Sophia proposal only
/// after S2 has read and diagnosed the reviewed canonical Bimba target.
pub async fn q_articulation_accept(
    state_root: impl AsRef<Path>,
    params: &Value,
) -> Result<Value, String> {
    let request: QArticulationAcceptParams =
        serde_json::from_value(params.clone()).map_err(|error| error.to_string())?;
    crate::gate::review::require_human_approval(state_root, &request.accepted_review_ref)?;
    let vault_root = resolve_vault_root(params)?;
    let client = epi_s2_graph_services::Neo4jClient::connect(
        &epi_s2_graph_services::Neo4jConfig::from_env(),
    )
    .map_err(|error| format!("Q articulation graph connection failed: {error}"))?;
    let verification = epi_s2_graph_services::verify_bimba_q_articulation(
        &client,
        &request.coordinate,
        &request.q_key,
        request.expected_graph_revision,
    )
    .await?;
    let relative_path = canonical_bimba_relative_path(&verification.vault_path)?;
    let absolute_path = vault_root.join(&relative_path);
    let source = fs::read_to_string(&absolute_path).map_err(|error| {
        format!(
            "Q articulation canonical note `{}` could not be read: {error}",
            relative_path.display()
        )
    })?;
    let review_epoch = verification
        .graph_revision
        .checked_add(1)
        .ok_or_else(|| "Q articulation review epoch overflow".to_owned())?;
    let plan = plan_q_articulation_amendment(
        &source,
        QArticulationAmendmentRequest {
            q_key: request.q_key,
            q_value: request.q_value_candidate,
            review_epoch,
            accepted_review_ref: request.accepted_review_ref,
            opens_questions: request.opens_questions,
            source_artifacts: request.source_artifacts,
        },
    )?;
    atomic_replace(&absolute_path, plan.markdown.as_bytes())?;
    let frontmatter = epi_s2_graph_services::parse_yaml_frontmatter(&plan.markdown)
        .ok_or_else(|| "Hen Q amendment produced no YAML frontmatter".to_owned())?;
    epi_s2_graph_services::SyncCoordinator::new(&client)
        .sync_from_vault(&verification.vault_path, &frontmatter, &plan.markdown)
        .await?;
    let actual_revision = u64::try_from(
        epi_s2_graph_services::read_graph_meta(&client)
            .await?
            .ok_or_else(|| "Q articulation sync removed graph metadata".to_owned())?
            .graph_revision,
    )
    .map_err(|_| "Q articulation sync returned a negative graph revision".to_owned())?;
    if actual_revision != review_epoch {
        return Err(format!(
            "Q articulation sync revision changed concurrently: stamped {review_epoch}, graph is now {actual_revision}; review must be re-run"
        ));
    }
    Ok(json!({
        "coordinate": verification.coordinate,
        "q_key": plan.q_key,
        "review_epoch_key": plan.review_epoch_key,
        "review_epoch": review_epoch,
        "accepted_review_ref": plan.accepted_review_ref,
        "source_artifacts": plan.source_artifacts,
        "anuttara_diagnostic": verification.anuttara_diagnostic,
        "graph_revision": actual_revision,
        "canonical_path": relative_path,
    }))
}
