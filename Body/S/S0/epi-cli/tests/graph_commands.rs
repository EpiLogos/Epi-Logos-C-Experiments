use epi_logos::graph::client::{Neo4jClient, Neo4jConfig};
use epi_logos::graph::retrieval::graphrag::{GraphRAGRetriever, QueryType};
use epi_logos::graph::retrieval::hybrid::{HybridRetriever, RetrievalMode};
use epi_logos::graph::{self, GraphCmd};
mod common;
use common::{run_epi, TestEnv};

static LIVE_MUTEX: std::sync::Mutex<()> = std::sync::Mutex::new(());

fn live_lock() -> std::sync::MutexGuard<'static, ()> {
    LIVE_MUTEX
        .lock()
        .unwrap_or_else(|poisoned| poisoned.into_inner())
}

fn workspace_root() -> String {
    std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .unwrap()
        .display()
        .to_string()
}

async fn teardown(client: &Neo4jClient) {
    client.run("MATCH (n:Bimba) DETACH DELETE n").await.unwrap();
    client
        .run("MATCH (m:GraphMeta) DETACH DELETE m")
        .await
        .unwrap();
}

/// Track 13 T5 — assert the S0 graph compatibility re-exports resolve
/// to `epi_s2_graph_services`. The named six graph-law surface families
/// (graph retrieval, semantic cache, dataset import, doctor,
/// relationship manager, sync coordinator) plus the T5 moves (cypher
/// guard, constraint registry, deterministic analyser, Anuttara
/// reflection) must all live in S2. If any of these starts resolving
/// to a local S0 type, the S0 membrane has accreted graph law.
#[test]
fn t5_s0_graph_facade_re_exports_resolve_to_epi_s2_graph_services() {
    use epi_logos::graph;

    // (a) Graph retrieval
    assert!(std::any::type_name::<graph::retrieval::coordinate::CoordinateRetrieval<'static>>()
        .contains("epi_s2_graph_services"));
    assert!(std::any::type_name::<graph::retrieval::graphrag::GraphRAGRetriever<'static>>()
        .contains("epi_s2_graph_services"));
    assert!(std::any::type_name::<graph::retrieval::hybrid::HybridRetriever<'static>>()
        .contains("epi_s2_graph_services"));

    // (b) Semantic cache
    assert!(std::any::type_name::<graph::semantic_cache::SemanticCacheConfig>()
        .contains("epi_s2_graph_services"));
    assert!(std::any::type_name::<graph::semantic_cache::GraphRedisRole>()
        .contains("epi_s2_graph_services"));

    // (c) Dataset import
    assert!(std::any::type_name::<graph::dataset_import::DatasetImporter<'static>>()
        .contains("epi_s2_graph_services"));

    // (d) Doctor
    assert!(
        std::any::type_name::<graph::doctor::DoctorReport>().contains("epi_s2_graph_services")
    );

    // (e) Relationship manager
    assert!(std::any::type_name::<graph::relationship_manager::RelationshipManager>()
        .contains("epi_s2_graph_services"));

    // (f) Sync coordinator
    assert!(std::any::type_name::<graph::sync_coordinator::SyncCoordinator<'static>>()
        .contains("epi_s2_graph_services"));

    // T5 moves: cypher guard, constraint registry, analyser, anuttara
    assert!(
        std::any::type_name::<graph::cypher::CypherMode>().contains("epi_s2_graph_services")
    );
    assert!(std::any::type_name::<graph::cypher::CypherGuardOutcome>()
        .contains("epi_s2_graph_services"));
    assert!(
        std::any::type_name::<graph::constraint::Registry>().contains("epi_s2_graph_services")
    );
    assert!(std::any::type_name::<graph::analyse::DeterministicAnalyser>()
        .contains("epi_s2_graph_services"));
    assert!(std::any::type_name::<graph::anuttara::AnuttaraReflectionRequest>()
        .contains("epi_s2_graph_services"));

    // Lifecycle evidence re-export — surfaced via `crate::graph` for the
    // S0 reconcile arm.
    assert!(std::any::type_name::<graph::LiveGraphBackedEvidence>()
        .contains("epi_s2_graph_services"));
}

#[test]
fn graphrag_classifies_and_extracts_coordinate_queries() {
    let query_type = GraphRAGRetriever::classify_query("How does #4 relate to CF_FRACTAL?");
    assert_eq!(query_type, QueryType::HowDoes);

    let coords =
        GraphRAGRetriever::extract_coordinate_mentions("How does #4 relate to CF_FRACTAL and C4'?");
    assert_eq!(coords, vec!["#4", "CF_FRACTAL", "C4'"]);

    let inferred = GraphRAGRetriever::infer_positions("How does the foundation context integrate?");
    assert_eq!(inferred, vec![0, 4, 5]);
}

#[test]
fn bootstrap_dev_dry_run_reports_paths_and_env_contract() {
    let env = TestEnv::empty().with_env("EPILOGOS_ROOT", workspace_root());
    let out = run_epi(
        ["--json", "graph", "bootstrap-dev", "--dry-run"].as_slice(),
        &env,
    );
    assert!(
        out.status.success(),
        "stdout={} stderr={}",
        out.stdout,
        out.stderr
    );

    let payload: serde_json::Value = serde_json::from_str(&out.stdout).unwrap();
    assert_eq!(payload["ok"], true);
    assert_eq!(payload["dryRun"], true);
    assert!(payload["composeFile"]
        .as_str()
        .unwrap()
        .ends_with("docker-compose.epi-s2.yml"));
    assert!(payload["redisvlSetupScript"]
        .as_str()
        .unwrap()
        .ends_with("Body/S/S3/redis-context/scripts/redisvl_cache_service/setup.sh"));
    assert!(payload["envFile"]
        .as_str()
        .unwrap()
        .ends_with(".env.graph-dev"));
    assert_eq!(
        payload["environment"]["EPILOGOS_SEMANTIC_CACHE_REDIS_URL"],
        "redis://127.0.0.1:6379"
    );
}

#[test]
fn doctor_json_reports_graph_and_semantic_sections() {
    let env = TestEnv::empty().with_env("EPILOGOS_ROOT", workspace_root());
    let out = run_epi(["--json", "graph", "doctor"].as_slice(), &env);
    assert!(
        out.status.success(),
        "stdout={} stderr={}",
        out.stdout,
        out.stderr
    );

    let payload: serde_json::Value = serde_json::from_str(&out.stdout).unwrap();
    assert!(payload["ok"].is_boolean());
    assert!(payload["neo4j"].is_object());
    assert!(payload["redis"].is_object());
    assert!(payload["redisStack"].is_object());
    assert!(payload["semanticCache"].is_object());
    assert!(payload["graph"].is_object());
    assert!(payload["graph"]["semanticIndexedNodes"].is_number());
    assert!(payload["graph"]["staleSemanticNodes"].is_number());
    assert!(payload["graph"]["managedVersions"].is_object());
    assert!(payload["graph"]["managedVersions"]["desired"].is_object());
    assert!(payload["graph"]["managedVersions"]["live"].is_object());
    assert!(payload["graph"]["managedVersions"]["drift"].is_object());
    assert!(payload["graph"]["managedVersions"]["desired"]["datasetSourceHash"].is_string());
    assert!(payload["graph"]["managedVersions"]["desired"]["relationRegistryHash"].is_string());
    assert!(payload["graph"]["managedVersions"]["desired"]["kernelSourceHash"].is_string());
    assert!(payload["graph"]["managedVersions"]["desired"]["ontologyVersionIri"].is_string());
    assert!(payload["graph"]["managedVersions"]["desired"]["gdsProjectionVersion"].is_string());
}

#[test]
fn graph_agent_planning_commands_expose_s2_rules_without_backend() {
    let env = TestEnv::empty().with_env("EPILOGOS_ROOT", workspace_root());

    let policy = run_epi(
        [
            "--json",
            "graph",
            "promotion-policy",
            "Idea/Bimba/Seeds/S/S2/S2'/Legacy/specs/S/S2-S2i-GRAPH.md",
        ]
        .as_slice(),
        &env,
    );
    assert!(
        policy.status.success(),
        "stdout={} stderr={}",
        policy.stdout,
        policy.stderr
    );
    let policy_json: serde_json::Value = serde_json::from_str(&policy.stdout).unwrap();
    assert_eq!(policy_json["class"], "TechnicalCoordinateDoc");
    assert_eq!(policy_json["target_surface"], "Neo4jCoordinateGraph");
    assert_eq!(
        policy_json["coordinate_property_families"],
        serde_json::json!(["c", "p", "l", "s", "t", "m", "q"])
    );

    let rules = run_epi(["--json", "graph", "property-rules"].as_slice(), &env);
    assert!(
        rules.status.success(),
        "stdout={} stderr={}",
        rules.stdout,
        rules.stderr
    );
    let rules_json: serde_json::Value = serde_json::from_str(&rules.stdout).unwrap();
    assert!(rules_json
        .as_array()
        .unwrap()
        .iter()
        .any(|rule| rule["frontmatter_key"] == "source_coordinates"));

    let semantics = run_epi(["--json", "graph", "coordinate-semantics"].as_slice(), &env);
    assert!(
        semantics.status.success(),
        "stdout={} stderr={}",
        semantics.stdout,
        semantics.stderr
    );
    let semantics_json: serde_json::Value = serde_json::from_str(&semantics.stdout).unwrap();
    assert_eq!(
        semantics_json["property_law"]["identity_property"],
        "coordinate"
    );
    assert_eq!(
        semantics_json["property_law"]["inverted_key_pattern"],
        "{family}_{position}_i_{semantic_suffix}"
    );
    assert!(semantics_json["families"]
        .as_array()
        .unwrap()
        .iter()
        .any(|family| family["prefix"] == "s"
            && family["family_name"].as_str().unwrap().contains("System")));

    let graphiti = run_epi(
        [
            "--json",
            "graph",
            "graphiti-plan",
            "Idea/Empty/Present/22-05-2026/session/now.md",
            "--coordinate",
            "C0/T5",
        ]
        .as_slice(),
        &env,
    );
    assert!(
        graphiti.status.success(),
        "stdout={} stderr={}",
        graphiti.stdout,
        graphiti.stderr
    );
    let graphiti_json: serde_json::Value = serde_json::from_str(&graphiti.stdout).unwrap();
    assert_eq!(graphiti_json["target_surface"], "graphiti_episode");
    assert_eq!(
        graphiti_json["runtime_authority"],
        "S3 graphiti runtime adapter"
    );
    assert_eq!(
        graphiti_json["invocation_owner"],
        "S5 episodic invocation and arc governance"
    );
    assert_eq!(graphiti_json["gateway_method"], "s5.episodic.deposit");
    assert_eq!(graphiti_json["creates_neo4j_coordinate_node"], false);
}

#[test]
fn graph_promote_intent_dry_run_validates_s2_plan_without_backend() {
    let env = TestEnv::empty().with_env("EPILOGOS_ROOT", workspace_root());
    let intent_path = std::env::temp_dir().join(format!(
        "epi-s2-promotion-intent-{}.json",
        std::process::id()
    ));
    std::fs::write(
        &intent_path,
        serde_json::json!({
            "node": {
                "coordinate": "S2",
                "identity_property": "coordinate",
                "vault_path": "Idea/Bimba/Seeds/S/S2/S2'/Legacy/specs/S/S2-S2i-GRAPH.md",
                "requested_label_hints": [],
                "properties": {
                    "coordinate": "S2",
                    "vault_path": "Idea/Bimba/Seeds/S/S2/S2'/Legacy/specs/S/S2-S2i-GRAPH.md",
                    "artifact_kind": "vault_markdown",
                    "content_hash": "sha256:s2-dry-run",
                    "coordinate_prefix": "S2",
                    "coordinate_depth": 1,
                    "s_4_function_role": "S2 graph schema and promotion authority"
                }
            },
            "link_evidence": [],
            "frontmatter_evidence": [],
            "property_proposals": [{
                "key": "s_4_function_role",
                "value": "S2 graph schema and promotion authority",
                "evidence_kind": "content_synthesis",
                "evidence_text": "The S2 graph spec presents this coordinate as the schema and promotion authority.",
                "source_path": "Idea/Bimba/Seeds/S/S2/S2'/Legacy/specs/S/S2-S2i-GRAPH.md",
                "source_line": 1,
                "proposed_by": "pi:pleroma",
                "reasoning": "The property is derived by Pi-agent reasoning over the technical coordinate doc, not by a CLI heuristic."
            }],
            "relation_candidates": [],
            "content_hash": "sha256:s2-dry-run",
            "markdown_body_hash": "sha256:s2-dry-run-body",
            "compatibility_source_label": null,
            "compatibility_source_property": null,
            "compatibility_source_coordinate": null,
            "promotion_source": "pi_agent",
            "sync_version": "s2-agent-promotion-v1"
        })
        .to_string(),
    )
    .unwrap();

    let out = run_epi(
        [
            "--json",
            "graph",
            "promote-intent",
            intent_path.to_str().unwrap(),
            "--dry-run",
        ]
        .as_slice(),
        &env,
    );
    let _ = std::fs::remove_file(intent_path);

    assert!(
        out.status.success(),
        "stdout={} stderr={}",
        out.stdout,
        out.stderr
    );
    let payload: serde_json::Value = serde_json::from_str(&out.stdout).unwrap();
    assert_eq!(payload["coordinate"], "S2");
    assert_eq!(payload["node_action"], "planned_upsert");
    assert_eq!(payload["validation_errors"], serde_json::json!([]));
}

#[tokio::test]
#[ignore] // requires Docker: docker compose -f docker-compose.epi-s2.yml up -d
async fn live_graph_commands_suite() {
    let _lock = live_lock();
    let config = Neo4jConfig::from_env();
    let client = Neo4jClient::connect(&config).expect("connect failed");
    teardown(&client).await;

    let bootstrap = graph::dispatch(&GraphCmd::Bootstrap).await.unwrap();
    assert!(bootstrap.contains("bootstrapped") || bootstrap.contains("Bootstrap"));

    let init_err = graph::dispatch(&GraphCmd::Init).await.unwrap_err();
    assert!(init_err.contains("graph is not empty") || init_err.contains("non-empty"));
    assert!(init_err.contains("graph update") || init_err.contains("graph reconcile"));

    let reconcile = graph::dispatch(&GraphCmd::Reconcile).await.unwrap();
    assert!(reconcile.contains("reconcile") || reconcile.contains("aligned"));

    let retriever = GraphRAGRetriever::new(&client);

    let response = retriever
        .retrieve("How does context work?", Some(2), Some(5))
        .await
        .unwrap();
    assert_eq!(response["query_type"], "how_does");
    assert!(!response["results"].as_array().unwrap().is_empty());
    assert!(response["results"]
        .as_array()
        .unwrap()
        .iter()
        .any(|item| item["coordinate"] == "#4" || item["coordinate"] == "P4"));

    let hybrid = HybridRetriever::new(&client);
    let results = hybrid
        .retrieve("integration", RetrievalMode::GraphOnly, Some(5))
        .await
        .unwrap();
    assert!(!results.is_empty());
    assert!(results.iter().all(|item| item.score > 0.0));
    assert!(results
        .iter()
        .any(|item| item.coordinate == "#5" || item.coordinate == "P5"));

    let retrieve = graph::dispatch(&GraphCmd::Retrieve {
        coordinate: "#4".to_string(),
        nested: true,
    })
    .await
    .unwrap();
    assert!(!retrieve.contains("Retrieving #4 (nested: true)"));
    assert!(retrieve.contains("#4"));

    let graphrag = graph::dispatch(&GraphCmd::GraphRAG {
        query: "How does context work?".to_string(),
        depth: Some(2),
    })
    .await
    .unwrap();
    assert!(!graphrag.contains("GraphRAG query:"));
    assert!(graphrag.contains("results") || graphrag.contains("#4"));

    let hybrid = graph::dispatch(&GraphCmd::Hybrid {
        query: "integration".to_string(),
        top_k: Some(5),
    })
    .await
    .unwrap();
    assert!(!hybrid.contains("Hybrid query:"));
    assert!(hybrid.contains("score") || hybrid.contains("#5"));

    teardown(&client).await;
}

#[test]
#[ignore]
fn live_graph_doctor_reports_backend_readiness() {
    let _lock = live_lock();
    let env = TestEnv::empty()
        .with_env("EPILOGOS_ROOT", workspace_root())
        .with_env(
            "EPILOGOS_SEMANTIC_CACHE_REDIS_URL",
            "redis://127.0.0.1:6379",
        )
        .with_env(
            "EPILOGOS_SEMANTIC_CACHE_SCRIPT",
            format!(
                "{}/Body/S/S3/redis-context/scripts/redisvl_cache_service/redisvl_cache_service.py",
                workspace_root()
            ),
        )
        .with_env(
            "EPILOGOS_SEMANTIC_CACHE_PYTHON",
            format!(
                "{}/Body/S/S3/redis-context/scripts/redisvl_cache_service/.venv/bin/python3",
                workspace_root()
            ),
        )
        .with_env("EPILOGOS_SEMANTIC_CACHE_ARCH", "arm64");
    let out = run_epi(["--json", "graph", "doctor"].as_slice(), &env);
    assert!(
        out.status.success(),
        "stdout={} stderr={}",
        out.stdout,
        out.stderr
    );

    let payload: serde_json::Value = serde_json::from_str(&out.stdout).unwrap();
    assert_eq!(payload["neo4j"]["ok"], true);
    assert_eq!(payload["redis"]["ok"], true);
    assert_eq!(payload["redisStack"]["ok"], true);
    assert_eq!(payload["semanticCache"]["ok"], true);
}

#[test]
#[ignore]
fn live_bootstrap_dev_writes_env_file() {
    let _lock = live_lock();
    let env = TestEnv::empty()
        .with_env("EPILOGOS_ROOT", workspace_root())
        .with_env("HOME", std::env::var("HOME").unwrap());
    let out = run_epi(["--json", "graph", "bootstrap-dev"].as_slice(), &env);
    assert!(
        out.status.success(),
        "stdout={} stderr={}",
        out.stdout,
        out.stderr
    );

    let payload: serde_json::Value = serde_json::from_str(&out.stdout).unwrap();
    let env_file = payload["envFile"].as_str().unwrap();
    assert!(std::path::Path::new(env_file).exists());
    assert_eq!(
        payload["environment"]["EPILOGOS_SEMANTIC_CACHE_REDIS_URL"],
        "redis://127.0.0.1:6379"
    );
}
