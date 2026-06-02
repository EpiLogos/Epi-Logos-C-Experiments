use epi_s2_graph_services::{
    desired_meta, seed_source_hash, ConflictResolution, CoordinateRetrieval, DatasetImporter,
    DoctorReport, GraphMeta, GraphRAGRetriever, GraphRedisRole, HybridRetriever,
    LinkValidationResult, RelationshipManager, SemanticDocument, SyncResult,
};
use epi_s3_redis_context::CacheTier;

#[test]
fn graph_cache_semantics_are_s2_owned_over_s3_redis_runtime() {
    let role = GraphRedisRole::semantic_cache();
    assert_eq!(role.coordinate_owner, "S2");
    assert_eq!(role.redis_namespace, "s2:graph:semantic");

    assert_eq!(CacheTier::Hot.ttl_seconds(), 300);
    assert_eq!(CacheTier::Warm.prefix(), "cache:warm");
    assert_eq!(CacheTier::Cold.prefix(), "cache:cold");
}

#[test]
fn graph_meta_and_sync_contracts_are_s2_owned() {
    let meta = desired_meta("test-schema", 7);
    assert_eq!(meta.graph_id, epi_s2_graph_schema::GRAPH_ID);
    assert_eq!(meta.schema_version, "test-schema");
    assert_eq!(meta.graph_revision, 7);
    assert!(!seed_source_hash().is_empty());
    assert!(!meta.dataset_source_hash.is_empty());
    assert!(!meta.relation_registry_hash.is_empty());
    assert!(!meta.kernel_source_hash.is_empty());
    assert_eq!(
        meta.ontology_version_iri,
        epi_s2_graph_services::EPI_ONTOLOGY_VERSION_IRI
    );
    assert_eq!(
        meta.gds_projection_version,
        epi_s2_graph_services::GDS_OPTION1_PROJECTION_VERSION
    );

    let explicit = GraphMeta {
        graph_id: "test".into(),
        schema_version: "schema".into(),
        seed_source_hash: "hash".into(),
        dataset_source_hash: "dataset".into(),
        relation_registry_hash: "registry".into(),
        kernel_source_hash: "kernel".into(),
        embedding_version: "embedding".into(),
        q_schema_version: "q".into(),
        ontology_version_iri: "ontology".into(),
        ontology_turtle_sha256: "ttl".into(),
        gds_projection_version: "gds".into(),
        graph_revision: 1,
    };
    assert_eq!(explicit.embedding_version, "embedding");
    assert_eq!(explicit.dataset_source_hash, "dataset");

    let sync = SyncResult {
        coordinate: "M5".into(),
        vault_path: "Idea/Test.md".into(),
        relationships_created: 2,
    };
    assert_eq!(sync.coordinate, "M5");
}

#[test]
fn relationship_and_link_contracts_are_s2_owned() {
    assert_eq!(RelationshipManager::position_rel_types().len(), 6);
    assert_eq!(
        RelationshipManager::rel_type_for_position(5).unwrap().1,
        "POS5_INTEGRATES_INTO"
    );

    let result = LinkValidationResult {
        valid: vec!["M5".into()],
        broken: vec!["Missing".into()],
    };
    assert_eq!(result.valid.len() + result.broken.len(), 2);
}

#[test]
fn bidirectional_sync_conflict_strategy_is_s2_owned() {
    assert!(matches!(
        ConflictResolution::from_str("vault-wins"),
        ConflictResolution::VaultWins
    ));
    assert!(matches!(
        ConflictResolution::from_str("unknown"),
        ConflictResolution::Skip
    ));
}

#[test]
fn retrieval_execution_types_are_s2_owned() {
    let coordinate_type = std::any::type_name::<CoordinateRetrieval<'static>>();
    let graph_rag_type = std::any::type_name::<GraphRAGRetriever<'static>>();
    let hybrid_type = std::any::type_name::<HybridRetriever<'static>>();

    assert!(coordinate_type.contains("epi_s2_graph_services"));
    assert!(graph_rag_type.contains("epi_s2_graph_services"));
    assert!(hybrid_type.contains("epi_s2_graph_services"));
}

#[test]
fn semantic_doctor_and_dataset_import_types_are_s2_owned() {
    let semantic_type = std::any::type_name::<SemanticDocument>();
    let doctor_type = std::any::type_name::<DoctorReport>();
    let importer_type = std::any::type_name::<DatasetImporter<'static>>();

    assert!(semantic_type.contains("epi_s2_graph_services"));
    assert!(doctor_type.contains("epi_s2_graph_services"));
    assert!(importer_type.contains("epi_s2_graph_services"));
}
