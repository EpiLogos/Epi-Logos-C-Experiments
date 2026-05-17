use crate::Neo4jClient;
use serde_json::{Map, Value};

pub use epi_s2_graph_schema::{
    node_property_spec, relationship_property_spec, GraphPropertyCardinality,
    GraphPropertyDisclosure, GraphPropertyOwner, GraphPropertySpec, GraphPropertyType, CONSTRAINTS,
    GRAPHITI_ARC_ID_PROPERTY, INDEXES, KERNEL_RESONANCE_HELIX_PROPERTY,
    KERNEL_RESONANCE_INDEX_PROPERTY, KERNEL_RESONANCE_LABEL, KERNEL_RESONANCE_LENS_PROPERTY,
    KERNEL_RESONANCE_POSITION_PROPERTY, KERNEL_RESONANCE_RELATION, KERNEL_RESONANCE_SCORE_PROPERTY,
    KERNEL_RESONANCE_SQUARE_PROPERTY, KERNEL_TICK_PROPERTY, NODE_PROPERTY_SPECS,
    RELATIONSHIP_INDEXES, RELATIONSHIP_PROPERTY_SPECS, SCHEMA_VERSION, SESSION_KEY_PROPERTY,
    VECTOR_INDEX,
};

pub fn coordinate_node_property_specs() -> &'static [GraphPropertySpec] {
    NODE_PROPERTY_SPECS
}

pub fn coordinate_relationship_property_specs() -> &'static [GraphPropertySpec] {
    RELATIONSHIP_PROPERTY_SPECS
}

pub fn validate_node_properties(properties: &Map<String, Value>) -> Result<(), String> {
    validate_properties(properties, GraphPropertyOwner::Node)
}

pub fn validate_relationship_properties(properties: &Map<String, Value>) -> Result<(), String> {
    validate_properties(properties, GraphPropertyOwner::Relationship)
}

fn validate_properties(
    properties: &Map<String, Value>,
    owner: GraphPropertyOwner,
) -> Result<(), String> {
    let unknown = properties
        .keys()
        .filter(|key| match owner {
            GraphPropertyOwner::Node => node_property_spec(key).is_none(),
            GraphPropertyOwner::Relationship => relationship_property_spec(key).is_none(),
        })
        .cloned()
        .collect::<Vec<_>>();

    if unknown.is_empty() {
        Ok(())
    } else {
        Err(format!(
            "unregistered coordinate graph propert{} for {:?}: {}",
            if unknown.len() == 1 { "y" } else { "ies" },
            owner,
            unknown.join(", ")
        ))
    }
}

/// Create all schema elements in Neo4j and return a human-readable summary.
pub async fn create_schema(client: &Neo4jClient) -> Result<String, String> {
    let mut created = Vec::new();

    for cypher in CONSTRAINTS {
        client
            .run(cypher)
            .await
            .map_err(|err| format!("constraint failed: {err}"))?;
    }
    created.push(format!("{} constraints", CONSTRAINTS.len()));

    for cypher in INDEXES {
        client
            .run(cypher)
            .await
            .map_err(|err| format!("index failed: {err}"))?;
    }
    created.push(format!("{} indexes", INDEXES.len()));

    for cypher in RELATIONSHIP_INDEXES {
        client
            .run(cypher)
            .await
            .map_err(|err| format!("relationship index failed: {err}"))?;
    }
    created.push(format!(
        "{} relationship indexes",
        RELATIONSHIP_INDEXES.len()
    ));

    client
        .run(VECTOR_INDEX)
        .await
        .map_err(|err| format!("vector index failed: {err}"))?;
    created.push("1 vector index".to_owned());

    Ok(format!("Schema created: {}", created.join(", ")))
}
