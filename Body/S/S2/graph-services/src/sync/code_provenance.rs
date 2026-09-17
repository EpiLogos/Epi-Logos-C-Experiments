use std::collections::BTreeMap;

use epi_s2_graph_schema::{
    M_COMPONENT_PROPERTY, M_REPO_PATH_PROPERTY, M_SYMBOL_REFS_PROPERTY, S_COMPONENT_PROPERTY,
    S_DEPENDS_ON_PATHS_PROPERTY, S_EXECUTION_FLOW_REFS_PROPERTY, S_FILE_KIND_PROPERTY,
    S_OWNED_BY_COORDINATE_PROPERTY, S_REPO_PATH_PROPERTY, S_REPO_ROOT_PROPERTY,
    S_SYMBOL_REFS_PROPERTY,
};
use serde::{Deserialize, Serialize};
use serde_json::Value;

use super::plan::validate_promotion_coordinate;

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct CodeProvenanceEvidence {
    pub repo_path: String,
    pub repo_root: String,
    pub file_kind: String,
    pub component: String,
    pub symbol_refs: Vec<String>,
    pub execution_flow_refs: Vec<String>,
    pub depends_on_paths: Vec<String>,
    pub owned_by_coordinate: String,
}

pub fn plan_code_provenance_properties(
    coordinate: &str,
    evidence: &CodeProvenanceEvidence,
) -> Result<BTreeMap<String, Value>, String> {
    validate_promotion_coordinate(coordinate)?;
    if evidence.owned_by_coordinate != coordinate {
        return Err(format!(
            "code provenance owner {} does not match coordinate {coordinate}",
            evidence.owned_by_coordinate
        ));
    }

    let mut properties = BTreeMap::new();
    if coordinate.starts_with('M') {
        properties.insert(
            M_REPO_PATH_PROPERTY.to_owned(),
            Value::String(evidence.repo_path.clone()),
        );
        properties.insert(
            M_COMPONENT_PROPERTY.to_owned(),
            Value::String(evidence.component.clone()),
        );
        properties.insert(
            M_SYMBOL_REFS_PROPERTY.to_owned(),
            Value::Array(
                evidence
                    .symbol_refs
                    .iter()
                    .cloned()
                    .map(Value::String)
                    .collect(),
            ),
        );
    } else {
        properties.insert(
            S_REPO_PATH_PROPERTY.to_owned(),
            Value::String(evidence.repo_path.clone()),
        );
        properties.insert(
            S_REPO_ROOT_PROPERTY.to_owned(),
            Value::String(evidence.repo_root.clone()),
        );
        properties.insert(
            S_FILE_KIND_PROPERTY.to_owned(),
            Value::String(evidence.file_kind.clone()),
        );
        properties.insert(
            S_COMPONENT_PROPERTY.to_owned(),
            Value::String(evidence.component.clone()),
        );
        properties.insert(
            S_SYMBOL_REFS_PROPERTY.to_owned(),
            Value::Array(
                evidence
                    .symbol_refs
                    .iter()
                    .cloned()
                    .map(Value::String)
                    .collect(),
            ),
        );
        properties.insert(
            S_EXECUTION_FLOW_REFS_PROPERTY.to_owned(),
            Value::Array(
                evidence
                    .execution_flow_refs
                    .iter()
                    .cloned()
                    .map(Value::String)
                    .collect(),
            ),
        );
        properties.insert(
            S_DEPENDS_ON_PATHS_PROPERTY.to_owned(),
            Value::Array(
                evidence
                    .depends_on_paths
                    .iter()
                    .cloned()
                    .map(Value::String)
                    .collect(),
            ),
        );
        properties.insert(
            S_OWNED_BY_COORDINATE_PROPERTY.to_owned(),
            Value::String(evidence.owned_by_coordinate.clone()),
        );
    }
    Ok(properties)
}
