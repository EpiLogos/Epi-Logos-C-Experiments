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
