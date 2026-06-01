use epi_s2_graph_services::{
    ontology_import_plan, record_ontology_bridge_facts, Neo4jClient, Neo4jConfig,
    EPI_ONTOLOGY_TURTLE, OWL2_RL_PROFILE, SHACL_REPORTING_MODE,
};

#[test]
fn epi_ontology_artifact_carries_anuttara_and_coordinate_semantics_without_family_labels() {
    assert!(EPI_ONTOLOGY_TURTLE.contains("@prefix epi:"));
    assert!(EPI_ONTOLOGY_TURTLE.contains("epi:AnuttaraNode"));
    assert!(EPI_ONTOLOGY_TURTLE.contains("epi:hasSymbol"));
    assert!(EPI_ONTOLOGY_TURTLE.contains("c_1_symbol"));
    assert!(EPI_ONTOLOGY_TURTLE.contains("c_1_formulation_type"));
    assert!(EPI_ONTOLOGY_TURTLE.contains("c_1_complete_formulation"));
    assert!(EPI_ONTOLOGY_TURTLE.contains("owl:TransitiveProperty"));
    assert!(EPI_ONTOLOGY_TURTLE.contains("sh:NodeShape"));
    assert!(
        !EPI_ONTOLOGY_TURTLE.contains("Family_C"),
        "family identity belongs in properties such as c_4_family, not ontology-backed node labels"
    );
}

#[test]
fn ontology_import_plan_uses_n10s_inline_import_and_records_readiness_facts() {
    let plan = ontology_import_plan();

    assert_eq!(plan.source_format, "Turtle");
    assert_eq!(plan.anuttara_properties.len(), 3);
    assert!(plan.turtle_sha256.len() == 64);
    assert!(plan.import_cypher.contains("n10s.rdf.import.inline"));
    assert!(plan.import_cypher.contains("$rdf"));
    assert!(plan.import_cypher.contains("$format"));
    assert!(plan.export_cypher.contains("n10s.rdf.export.cypher"));
    assert!(plan.export_cypher.contains("$cypher"));
    assert!(plan.export_cypher.contains("$format"));
    assert!(plan.shacl_report_cypher.contains("n10s.validation.shacl"));
    assert!(
        !plan.import_cypher.contains(EPI_ONTOLOGY_TURTLE),
        "ontology RDF must be passed as a query parameter, not interpolated into Cypher"
    );
    assert!(plan.fact_cypher.contains("epi_ontology_sha256"));
    assert!(plan.fact_cypher.contains("owl2_rl_profile"));
    assert!(plan.fact_cypher.contains("shacl_reporting_mode"));
    assert_eq!(OWL2_RL_PROFILE, "OWL2_RL");
    assert_eq!(SHACL_REPORTING_MODE, "n10s-validation-or-blocked");

    let symbol = plan
        .anuttara_properties
        .iter()
        .find(|mapping| mapping.alias == "symbol")
        .expect("symbol mapping");
    assert_eq!(symbol.neo4j_property, "c_1_symbol");
    assert_eq!(symbol.ontology_property, "epi:hasSymbol");
    assert_eq!(symbol.disclosure, "public-s2-supplied");
}

#[tokio::test]
#[ignore] // requires Docker: docker compose -f docker-compose.epi-s2.yml up -d neo4j
async fn live_ontology_bridge_records_owl_and_shacl_facts_in_graph_meta() {
    let client = Neo4jClient::connect(&Neo4jConfig::from_env()).expect("connect to live Neo4j");
    record_ontology_bridge_facts(&client)
        .await
        .expect("record ontology bridge facts");

    let rows = client
        .run(
            "MATCH (m:GraphMeta {graph_id: 'primary'})
             RETURN m.epi_ontology_uri AS ontology_uri,
                    m.epi_ontology_sha256 AS turtle_sha256,
                    m.owl2_rl_profile AS owl2_rl_profile,
                    m.shacl_reporting_mode AS shacl_reporting_mode,
                    m.anuttara_property_contract AS anuttara_property_contract",
        )
        .await
        .expect("read graph meta ontology facts");
    let row = rows.first().expect("graph meta row");
    assert_eq!(
        row.get::<String>("ontology_uri").unwrap(),
        "https://epi-logos.org/ontology#"
    );
    assert_eq!(
        row.get::<String>("owl2_rl_profile").unwrap(),
        OWL2_RL_PROFILE
    );
    assert_eq!(
        row.get::<String>("shacl_reporting_mode").unwrap(),
        SHACL_REPORTING_MODE
    );
    assert_eq!(row.get::<String>("turtle_sha256").unwrap().len(), 64);
    assert!(row
        .get::<String>("anuttara_property_contract")
        .unwrap()
        .contains("c_1_symbol"));
}
