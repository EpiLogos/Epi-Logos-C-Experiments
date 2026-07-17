//! Coordinate: S2 (Bimba Q-articulation amendment verification)
//! Residency: Body/S/S2/graph-services/src
//! Position (#n): read-only canonical-target preflight
//! Actualises: a pure-Cypher check that an accepted Q proposal targets an
//!   existing Bimba node, plus an Anuttara diagnostic for the human review.
//! Public surface: QArticulationVerification, `verify_bimba_q_articulation`,
//!   `validate_q_articulation_key`, and `q_articulation_review_epoch_key`.
//! Does NOT own: review decisions, frontmatter mutation, graph writes, or sync.
//! Contract: [[S2-SPEC]] / [[S2-ARCHITECTURE]].

use epi_kernel_contract::AnuttaraDiagnostic;
use neo4rs::query;
use serde::{Deserialize, Serialize};

use crate::{read_graph_meta, CoordinateArrayParser, FrontmatterKeyResolution, Neo4jClient};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct QArticulationVerification {
    pub coordinate: String,
    pub q_key: String,
    pub review_epoch_key: String,
    pub current_value: Option<String>,
    pub vault_path: String,
    pub graph_revision: u64,
    pub anuttara_diagnostic: AnuttaraDiagnostic,
}

pub fn validate_q_articulation_key(q_key: &str) -> Result<(), String> {
    if !q_key.starts_with("q_") || q_key.starts_with("q_personal_") {
        return Err("Q articulation key must be a public canonical q_* field".to_owned());
    }
    match crate::resolve_frontmatter_key(q_key) {
        FrontmatterKeyResolution::Canonical(canonical) if canonical == q_key => Ok(()),
        FrontmatterKeyResolution::Canonical(_) => Err(format!(
            "Q articulation key `{q_key}` must use canonical graph spelling"
        )),
        _ => Err(format!("malformed Q articulation key `{q_key}`")),
    }
}

pub fn q_articulation_review_epoch_key(q_key: &str) -> Result<String, String> {
    validate_q_articulation_key(q_key)?;
    let rest = q_key.strip_prefix("q_").expect("validated q prefix");
    let mut chars = rest.chars();
    let position = chars.next().expect("validated position");
    let suffix = chars
        .as_str()
        .strip_prefix('_')
        .expect("validated semantic suffix");
    Ok(format!("qm_{position}_review_epoch_{suffix}"))
}

/// Read-only preflight for an accepted Q amendment.
///
/// `expected_graph_revision` makes the proposal conditional on the graph that
/// the user actually reviewed. It is deliberately not a boolean approval: the
/// result carries the current value and an Anuttara question for the reviewer.
pub async fn verify_bimba_q_articulation(
    client: &Neo4jClient,
    coordinate: &str,
    q_key: &str,
    expected_graph_revision: u64,
) -> Result<QArticulationVerification, String> {
    CoordinateArrayParser::parse_one(coordinate)
        .map_err(|_| format!("invalid canonical Bimba coordinate `{coordinate}`"))?;
    validate_q_articulation_key(q_key)?;
    let review_epoch_key = q_articulation_review_epoch_key(q_key)?;
    let graph_revision = u64::try_from(
        read_graph_meta(client)
            .await?
            .ok_or_else(|| "Q articulation verification requires graph metadata".to_owned())?
            .graph_revision,
    )
    .map_err(|_| "Q articulation verification graph revision must be non-negative".to_owned())?;
    if graph_revision != expected_graph_revision {
        return Err(format!(
            "Q articulation review is stale: expected graph revision {expected_graph_revision}, found {graph_revision}"
        ));
    }

    let rows = client
        .run_query(
            query(
                "MATCH (n:Bimba {coordinate: $coordinate})
                 RETURN coalesce(toString(n[$q_key]), '') AS current_value,
                        coalesce(toString(n.s_1_vault_path), '') AS vault_path",
            )
            .param("coordinate", coordinate)
            .param("q_key", q_key),
        )
        .await
        .map_err(|error| format!("Q articulation canonical-target query failed: {error}"))?;
    let row = rows.first().ok_or_else(|| {
        format!(
            "Q articulation amendment refused: canonical Bimba node `{coordinate}` does not exist"
        )
    })?;
    let current_value = row.get::<String>("current_value").unwrap_or_default();
    let vault_path = row.get::<String>("vault_path").unwrap_or_default();
    if vault_path.trim().is_empty() {
        return Err(format!(
            "Q articulation amendment refused: canonical Bimba node `{coordinate}` has no S1 vault path"
        ));
    }
    let anuttara_diagnostic = AnuttaraDiagnostic::parse(&format!("?{coordinate}"))
        .map_err(|error| {
            format!("Q articulation verification cannot form Anuttara diagnostic: {error}")
        })?
        .with_source_constraint(format!("bimba_q_articulation:{coordinate}:{q_key}"));

    Ok(QArticulationVerification {
        coordinate: coordinate.to_owned(),
        q_key: q_key.to_owned(),
        review_epoch_key,
        current_value: (!current_value.is_empty()).then_some(current_value),
        vault_path,
        graph_revision,
        anuttara_diagnostic,
    })
}
