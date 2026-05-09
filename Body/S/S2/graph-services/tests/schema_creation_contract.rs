use epi_s2_graph_services::schema::{create_schema, CONSTRAINTS, INDEXES, VECTOR_INDEX};

#[test]
fn schema_creation_entrypoint_and_cypher_are_s2_owned() {
    let function_name = std::any::type_name_of_val(&create_schema);

    assert!(function_name.contains("epi_s2_graph_services"));
    assert_eq!(CONSTRAINTS.len(), 2);
    assert_eq!(INDEXES.len(), 5);
    assert!(VECTOR_INDEX.contains("FOR (n:Bimba)"));
    assert!(VECTOR_INDEX.contains("3072"));
}
