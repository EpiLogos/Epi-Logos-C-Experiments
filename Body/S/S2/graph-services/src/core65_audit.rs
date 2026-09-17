use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use crate::GraphMethodParams;

pub const CORE65_AUDIT_METHOD: &str = "s2.graph.core65.audit";
pub const KERNEL_CORE_RELATION_FAMILY: &str = "kernel_core";
pub const KERNEL_CORE_SOURCE_TOKEN: &str = "M0_CORE_RELATIONS";
pub const KERNEL_CORE_SOURCE_PATH: &str = "Body/S/S0/epi-lib/include/m0.h";

const M0_HEADER: &str = include_str!("../../../S0/epi-lib/include/m0.h");

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Core65AuditPlan {
    pub method: String,
    pub kernel_declared_count: usize,
    pub kernel_source_path: String,
    pub relation_family: String,
    pub cypher: String,
    pub params: GraphMethodParams,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Core65AuditSummary {
    pub kernel_declared_count: usize,
    pub neo4j_observed_count: usize,
    pub missing_count: usize,
    pub extra_count: usize,
    pub mismatch_count: usize,
    pub relation_family: String,
    pub relation_types: Vec<String>,
    pub neo4j_types: Vec<String>,
    pub source_coordinates: Vec<String>,
    pub target_coordinates: Vec<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct M0GraphReadinessFact {
    pub id: String,
    pub label: String,
    pub state: String,
    pub summary: String,
    pub canonical: bool,
    pub provenance: String,
}

pub fn kernel_declared_core_relation_count() -> Result<usize, String> {
    M0_HEADER
        .lines()
        .find_map(|line| {
            let trimmed = line.trim();
            let value = trimmed
                .strip_prefix("#define M0_CORE_RELATIONS_COUNT")?
                .trim()
                .trim_end_matches('u')
                .trim_end_matches('U');
            value.parse::<usize>().ok()
        })
        .ok_or_else(|| {
            "M0_CORE_RELATIONS_COUNT missing from Body/S/S0/epi-lib/include/m0.h".to_owned()
        })
}

pub fn core_65_audit_plan() -> Result<Core65AuditPlan, String> {
    let declared_count = kernel_declared_core_relation_count()?;
    let params = GraphMethodParams::from_json(json!({
        "relation_family": KERNEL_CORE_RELATION_FAMILY,
        "kernel_source_token": KERNEL_CORE_SOURCE_TOKEN,
        "declared_count": declared_count as i64,
    }))?;
    let cypher = "\
MATCH ()-[r]->()
WHERE r.c_1_relation_family = $relation_family
   OR toString(coalesce(r.c_4_provenance, '')) CONTAINS $kernel_source_token
WITH count(r) AS observed_count,
     collect(DISTINCT type(r)) AS neo4j_types,
     collect(DISTINCT coalesce(r.c_2_relation_type, type(r))) AS relation_types,
     collect(DISTINCT coalesce(r.c_0_source_coordinate, startNode(r).coordinate)) AS source_coordinates,
     collect(DISTINCT coalesce(r.c_0_target_coordinate, endNode(r).coordinate)) AS target_coordinates
RETURN $declared_count AS declared_count,
       observed_count,
       neo4j_types,
       relation_types,
       source_coordinates,
       target_coordinates"
        .to_owned();

    Ok(Core65AuditPlan {
        method: CORE65_AUDIT_METHOD.to_owned(),
        kernel_declared_count: declared_count,
        kernel_source_path: KERNEL_CORE_SOURCE_PATH.to_owned(),
        relation_family: KERNEL_CORE_RELATION_FAMILY.to_owned(),
        cypher,
        params,
    })
}

impl Core65AuditSummary {
    pub fn from_observation(
        kernel_declared_count: usize,
        neo4j_observed_count: usize,
        relation_types: Vec<String>,
        neo4j_types: Vec<String>,
        source_coordinates: Vec<String>,
        target_coordinates: Vec<String>,
    ) -> Self {
        let missing_count = kernel_declared_count.saturating_sub(neo4j_observed_count);
        let extra_count = neo4j_observed_count.saturating_sub(kernel_declared_count);
        Self {
            kernel_declared_count,
            neo4j_observed_count,
            missing_count,
            extra_count,
            mismatch_count: missing_count + extra_count,
            relation_family: KERNEL_CORE_RELATION_FAMILY.to_owned(),
            relation_types,
            neo4j_types,
            source_coordinates,
            target_coordinates,
        }
    }

    pub fn is_ready_public_current(&self) -> bool {
        self.mismatch_count == 0
    }
}

pub fn kernel_core_readiness_fact(summary: &Core65AuditSummary) -> M0GraphReadinessFact {
    let canonical = summary.is_ready_public_current();
    let summary_text = if canonical {
        format!(
            "kernel-core {}/{}; zero kernel-core mismatches",
            summary.neo4j_observed_count, summary.kernel_declared_count
        )
    } else {
        format!(
            "kernel-core {}/{}; {} missing, {} extra",
            summary.neo4j_observed_count,
            summary.kernel_declared_count,
            summary.missing_count,
            summary.extra_count
        )
    };

    M0GraphReadinessFact {
        id: "kernel-core".to_owned(),
        label: "Kernel-core relation audit".to_owned(),
        state: if canonical { "canonical" } else { "blocked" }.to_owned(),
        summary: summary_text,
        canonical,
        provenance: format!(
            "S2 graph-services core65Audit; {KERNEL_CORE_SOURCE_PATH}:M0_CORE_RELATIONS_COUNT; Neo4j c_1_relation_family={KERNEL_CORE_RELATION_FAMILY}"
        ),
    }
}

pub fn core_65_audit_payload(contract: Value, summary: Core65AuditSummary) -> Value {
    let fact = kernel_core_readiness_fact(&summary);
    let readiness_status = if summary.is_ready_public_current() {
        "ready_public_current"
    } else {
        "s2_graph_blocked"
    };

    json!({
        "contract": contract,
        "method": CORE65_AUDIT_METHOD,
        "audit": summary,
        "readiness": {
            "status": readiness_status,
            "kernel_core": fact,
        },
        "m0GraphReadinessFacts": [fact],
    })
}
