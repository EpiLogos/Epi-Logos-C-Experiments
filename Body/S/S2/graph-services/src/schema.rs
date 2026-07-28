use crate::Neo4jClient;
use serde_json::{Map, Value};

pub use epi_s2_graph_schema::{
    classify_relationship_type, node_property_spec, relationship_property_spec, relationship_spec,
    relationship_types, validate_coordinate_prefix_property, GraphPropertyCardinality,
    GraphPropertyDisclosure, GraphPropertyOwner, GraphPropertySpec, GraphPropertyType,
    RelationshipTypeClass, CONSTRAINTS, CRYSTALLISATION_STATE_PROPERTY,
    C_LAYER_AUTHORITY_MIGRATION, C_LAYER_ROLE_PROPERTY, C_MOC_EVIDENCE_PATHS_PROPERTY,
    GRAPHITI_ARC_ID_PROPERTY, INDEXES, KERNEL_RESONANCE_HELIX_PROPERTY,
    KERNEL_RESONANCE_INDEX_PROPERTY, KERNEL_RESONANCE_LABEL, KERNEL_RESONANCE_LENS_PROPERTY,
    KERNEL_RESONANCE_POSITION_PROPERTY, KERNEL_RESONANCE_RELATION, KERNEL_RESONANCE_SCORE_PROPERTY,
    KERNEL_RESONANCE_SQUARE_PROPERTY, KERNEL_TICK_PROPERTY, NODE_PROPERTY_SPECS,
    POINTER_COUNT_PROPERTY, POINTER_FAMILY_REFS_PROPERTY, POINTER_HARMONIC_ANCHOR_JSON_PROPERTY,
    POINTER_INVERSION_REFS_PROPERTY, POINTER_LENS_INVERSION_REFS_PROPERTY,
    POINTER_LENS_REFS_PROPERTY, POINTER_POSITION_REFS_PROPERTY, POINTER_REFLECTIVE_REFS_PROPERTY,
    POINTER_REFRESHED_AT_PROPERTY, POINTER_WEB_JSON_PROPERTY, RELATIONSHIP_INDEXES,
    RELATIONSHIP_PROPERTY_SPECS, SCHEMA_VERSION, SEMANTIC_AUTHORITY_PROPERTY, SESSION_KEY_PROPERTY,
    VECTOR_INDEX, WORLD_TYPE_PATH_PROPERTY,
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
            GraphPropertyOwner::Node => {
                node_property_spec(key).is_none()
                    && validate_coordinate_prefix_property(key).is_err()
            }
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

/// Neo4j's error when the schema element you asked for is already there under a
/// different name — i.e. exactly the postcondition `create_schema` promises.
///
/// Every DDL statement here says `IF NOT EXISTS`, which makes them idempotent
/// *sequentially*: the check is by NAME, so re-running is a no-op. It does not
/// make them idempotent *concurrently*. Two callers can both pass the
/// not-exists check and both issue the create; one wins and the other gets this
/// error — which is how the live contract tests failed when they ran in
/// parallel threads against a shared database, while each statement passed
/// perfectly well on its own.
///
/// Treating it as success is not papering over a failure. The caller asked for
/// the schema to exist; it exists. Refusing here would mean `create_schema`
/// reports failure for a database that is in exactly the requested state.
fn is_already_satisfied(error: &str) -> bool {
    error.contains("EquivalentSchemaRuleAlreadyExists")
        || error.contains("ConstraintAlreadyExists")
        || error.contains("IndexAlreadyExists")
}

/// Run one DDL statement, tolerating "it already exists" as the success it is.
async fn run_ddl(client: &Neo4jClient, cypher: &str, kind: &str) -> Result<(), String> {
    match client.run(cypher).await {
        Ok(_) => Ok(()),
        Err(err) => {
            let message = err.to_string();
            if is_already_satisfied(&message) {
                Ok(())
            } else {
                Err(format!("{kind} failed: {message}"))
            }
        }
    }
}

/// Create all schema elements in Neo4j and return a human-readable summary.
pub async fn create_schema(client: &Neo4jClient) -> Result<String, String> {
    let mut created = Vec::new();

    for cypher in CONSTRAINTS {
        run_ddl(client, cypher, "constraint").await?;
    }
    created.push(format!("{} constraints", CONSTRAINTS.len()));

    for cypher in INDEXES {
        run_ddl(client, cypher, "index").await?;
    }
    created.push(format!("{} indexes", INDEXES.len()));

    for cypher in RELATIONSHIP_INDEXES {
        run_ddl(client, cypher, "relationship index").await?;
    }
    created.push(format!(
        "{} relationship indexes",
        RELATIONSHIP_INDEXES.len()
    ));

    run_ddl(client, VECTOR_INDEX, "vector index").await?;
    created.push("1 vector index".to_owned());

    Ok(format!("Schema created: {}", created.join(", ")))
}

#[cfg(test)]
mod concurrency_idempotence_tests {
    use super::*;

    /// The three Neo4j codes that mean "the state you asked for already holds".
    #[test]
    fn already_exists_errors_are_recognised_as_satisfied() {
        for message in [
            "Neo4j error `Neo.ClientError.Schema.EquivalentSchemaRuleAlreadyExists`: An equivalent index already exists, 'Index( id=79, name='coord_c_layer_role' )'.",
            "Neo.ClientError.Schema.ConstraintAlreadyExists",
            "Neo.ClientError.Schema.IndexAlreadyExists",
        ] {
            assert!(
                is_already_satisfied(message),
                "must be treated as success: {message}"
            );
        }
    }

    /// A real failure must still fail. This is the line between tolerating a
    /// race and swallowing a broken schema.
    #[test]
    fn genuine_schema_errors_are_not_swallowed() {
        for message in [
            "Neo.ClientError.Statement.SyntaxError: Invalid input",
            "connection refused",
            "Neo.ClientError.Security.Unauthorized",
            "Neo.DatabaseError.Schema.ConstraintCreationFailed",
        ] {
            assert!(
                !is_already_satisfied(message),
                "must still be an error: {message}"
            );
        }
    }
}
