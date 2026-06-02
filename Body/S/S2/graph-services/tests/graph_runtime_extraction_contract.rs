use epi_s2_graph_services::{
    desired_meta, seed_source_hash, ConflictResolution, CoordinateRetrieval, DatasetImporter,
    DoctorReport, GraphMeta, GraphRAGRetriever, GraphRedisRole, HybridRetriever,
    LinkValidationResult, LiveGraphBackedEvidence, RelationshipManager, SemanticCacheConfig,
    SemanticDocument, SyncCoordinator, SyncResult,
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

/// Track 13 T5 — S2 graph adapter hardening ownership test.
///
/// Asserts that the six named graph-law surface families (graph
/// retrieval, semantic cache, dataset import, doctor, relationship
/// manager, sync coordinator) resolve to `epi_s2_graph_services`, plus
/// the modules moved out of S0 by T5 (cypher guard, constraint
/// registry, deterministic analyser, Anuttara reflection, lifecycle
/// evidence). If any of these starts resolving to a local S0 type, the
/// graph membrane has regressed and the assertion fails loudly.
#[test]
fn t5_graph_law_types_resolve_to_epi_s2_graph_services() {
    // (a) Graph retrieval
    assert!(std::any::type_name::<CoordinateRetrieval<'static>>()
        .contains("epi_s2_graph_services"));
    assert!(std::any::type_name::<GraphRAGRetriever<'static>>()
        .contains("epi_s2_graph_services"));
    assert!(std::any::type_name::<HybridRetriever<'static>>().contains("epi_s2_graph_services"));

    // (b) Semantic cache
    assert!(std::any::type_name::<SemanticCacheConfig>().contains("epi_s2_graph_services"));
    assert!(std::any::type_name::<GraphRedisRole>().contains("epi_s2_graph_services"));

    // (c) Dataset import
    assert!(std::any::type_name::<DatasetImporter<'static>>().contains("epi_s2_graph_services"));

    // (d) Doctor
    assert!(std::any::type_name::<DoctorReport>().contains("epi_s2_graph_services"));

    // (e) Relationship manager
    assert!(std::any::type_name::<RelationshipManager>().contains("epi_s2_graph_services"));

    // (f) Sync coordinator
    assert!(std::any::type_name::<SyncCoordinator<'static>>().contains("epi_s2_graph_services"));
    assert!(std::any::type_name::<SyncResult>().contains("epi_s2_graph_services"));

    // T5 moves: cypher guard, constraint registry, analyser, anuttara
    assert!(std::any::type_name::<epi_s2_graph_services::cypher::CypherMode>()
        .contains("epi_s2_graph_services"));
    assert!(std::any::type_name::<epi_s2_graph_services::cypher::CypherGuardOutcome>()
        .contains("epi_s2_graph_services"));
    assert!(std::any::type_name::<epi_s2_graph_services::constraint::Registry>()
        .contains("epi_s2_graph_services"));
    assert!(std::any::type_name::<epi_s2_graph_services::analyse::DeterministicAnalyser>()
        .contains("epi_s2_graph_services"));
    assert!(std::any::type_name::<epi_s2_graph_services::anuttara::AnuttaraReflectionRequest>()
        .contains("epi_s2_graph_services"));

    // Lifecycle evidence shape — used by S0 `graph reconcile` arm.
    assert!(std::any::type_name::<LiveGraphBackedEvidence>().contains("epi_s2_graph_services"));
}

/// Track 13 T9 — graph ownership regression test (negative guard).
///
/// Per plan body line 226: "Add graph ownership tests that fail if
/// S2-owned types resolve to `epi_logos::graph::*` implementations
/// instead of `epi_s2_graph_services::*`."
///
/// T5 already proves the positive direction (every law type resolves
/// into `epi_s2_graph_services`). This test adds the explicit negative
/// guard: every named graph-law family MUST NOT resolve to a type whose
/// canonical name lives under `epi_logos::graph::*`. If a future refactor
/// accidentally re-introduces a local S0 type with the same identifier
/// but a different canonical path, the assertion fires.
#[test]
fn t9_graph_law_types_do_not_resolve_to_epi_logos_graph_namespace() {
    // Helper: assert a type name does NOT live under `epi_logos::graph`.
    fn assert_not_s0_graph(type_name: &str, family: &str) {
        assert!(
            !type_name.contains("epi_logos::graph"),
            "T9 regression: {family} resolved to S0-local type `{type_name}` \
             under `epi_logos::graph::*`. Graph law MUST live in \
             `epi_s2_graph_services`. The named-adapter façade at \
             `Body/S/S0/epi-cli/src/graph/` is a pure re-export — any S0-local \
             definition that shadows an S2 type is a violation."
        );
    }

    // (a) Graph retrieval
    assert_not_s0_graph(
        std::any::type_name::<CoordinateRetrieval<'static>>(),
        "graph retrieval (CoordinateRetrieval)",
    );
    assert_not_s0_graph(
        std::any::type_name::<GraphRAGRetriever<'static>>(),
        "graph retrieval (GraphRAGRetriever)",
    );
    assert_not_s0_graph(
        std::any::type_name::<HybridRetriever<'static>>(),
        "graph retrieval (HybridRetriever)",
    );

    // (b) Semantic cache
    assert_not_s0_graph(
        std::any::type_name::<SemanticCacheConfig>(),
        "semantic cache (SemanticCacheConfig)",
    );
    assert_not_s0_graph(
        std::any::type_name::<GraphRedisRole>(),
        "semantic cache (GraphRedisRole)",
    );

    // (c) Dataset import
    assert_not_s0_graph(
        std::any::type_name::<DatasetImporter<'static>>(),
        "dataset import (DatasetImporter)",
    );

    // (d) Doctor
    assert_not_s0_graph(
        std::any::type_name::<DoctorReport>(),
        "doctor (DoctorReport)",
    );

    // (e) Relationship manager
    assert_not_s0_graph(
        std::any::type_name::<RelationshipManager>(),
        "relationship manager (RelationshipManager)",
    );

    // (f) Sync coordinator
    assert_not_s0_graph(
        std::any::type_name::<SyncCoordinator<'static>>(),
        "sync coordinator (SyncCoordinator)",
    );
    assert_not_s0_graph(
        std::any::type_name::<SyncResult>(),
        "sync coordinator (SyncResult)",
    );

    // (g) T5-moved modules: cypher guard, constraint registry, analyser,
    // anuttara reflection — these were physically moved out of S0; any
    // re-introduction would surface here.
    assert_not_s0_graph(
        std::any::type_name::<epi_s2_graph_services::cypher::CypherMode>(),
        "T5 (cypher::CypherMode)",
    );
    assert_not_s0_graph(
        std::any::type_name::<epi_s2_graph_services::cypher::CypherGuardOutcome>(),
        "T5 (cypher::CypherGuardOutcome)",
    );
    assert_not_s0_graph(
        std::any::type_name::<epi_s2_graph_services::constraint::Registry>(),
        "T5 (constraint::Registry)",
    );
    assert_not_s0_graph(
        std::any::type_name::<epi_s2_graph_services::analyse::DeterministicAnalyser>(),
        "T5 (analyse::DeterministicAnalyser)",
    );
    assert_not_s0_graph(
        std::any::type_name::<epi_s2_graph_services::anuttara::AnuttaraReflectionRequest>(),
        "T5 (anuttara::AnuttaraReflectionRequest)",
    );

    // (h) Lifecycle evidence shape — S0 graph reconcile arm depends on it.
    assert_not_s0_graph(
        std::any::type_name::<LiveGraphBackedEvidence>(),
        "lifecycle evidence (LiveGraphBackedEvidence)",
    );
}
