use std::collections::BTreeMap;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::sync::Arc;

use neo4rs::{query, Graph, Query};
use serde::{Deserialize, Serialize};

pub mod analyse;
pub mod anuttara;
pub mod bidirectional_sync;
pub mod constraint;
pub mod consumption;
mod coordinate;
pub mod cypher;
pub mod dataset_import;
pub mod doctor;
pub mod embeddings;
pub mod gds;
pub mod graph_api;
pub mod lifecycle;
pub mod link_enforcement;
pub mod meta;
pub mod ontology;
pub mod pointers;
pub mod relationship_manager;
pub mod retrieval;
mod retrieval_query;
pub mod schema;
pub mod seed;
pub mod semantic;
pub mod sync_coordinator;
pub mod types;
pub mod vault;

pub use bidirectional_sync::{BidirectionalSyncer, ConflictResolution, SyncConflict};
pub use consumption::{
    m5_handoff_consumption_contract, FORBIDDEN_CLIENT_DERIVATIONS, M5_HANDOFF_CONTRACT_VERSION,
};
pub use coordinate::{
    cf_node_for_frame, convert_hash_to_m_family, extract_context_frames, wrap_context_frames,
    CoordLayer, CoordinateArrayParser, ParsedCoordinate, WikiLink,
};
pub use dataset_import::DatasetImporter;
pub use doctor::{
    collect_report, render_human, render_status, DoctorReport, GraphState, Owl2RlReadiness,
    PrivacyProjectionReadiness, ProcedureReadiness, RedisStackStatus, SchemaReadiness,
    SemanticCacheStatus, ServiceStatus,
};
pub use embeddings::{EmbeddingConfig, GeminiEmbeddingClient};
pub use gds::{
    algorithm_descriptors, blocked_overlay_payload, gds_procedure_count, option1_projection_plan,
    GdsAlgorithmDescriptor, GdsOverlayNode, GdsOverlayPayload, GdsOverlayRequest,
    GdsProjectionPlan, GDS_ALGORITHM_VERSIONS, GDS_EXCLUDED_LABELS, GDS_OPTION1_PROJECTION_NAME,
    GDS_OPTION1_PROJECTION_VERSION, GDS_PRIVACY_BOUNDARY,
};
pub use graph_api::{
    graph_contract, source_traceability_anchors, CoordinateResolution, GraphMethodParams,
    GraphMethodService, GraphNodeRequest, GraphParamValue, GraphQueryRequest,
    GraphTraverseDirection, GraphTraverseRequest, KernelResonanceObservationPlan,
    KernelResonanceObservationRequest, PointerWebRefreshPlan, PointerWebRefreshRequest,
};
pub use lifecycle::{
    live_graph_backed_evidence, maybe_refresh_semantic_embeddings, LiveGraphBackedEvidence,
};
pub use link_enforcement::{LinkEnforcer, LinkValidationResult};
pub use meta::{
    applied_meta, applied_meta_with_dataset, dataset_source_hash, desired_meta, is_bootstrapped,
    kernel_source_hash, manual_drift_fields, read_graph_meta, relation_registry_hash,
    seed_source_hash, structural_state_aligned, write_graph_meta, GraphMeta,
};
pub use ontology::{
    anuttara_property_mappings, epi_ontology_sha256, import_epi_ontology_with_n10s,
    ontology_import_plan, record_ontology_bridge_facts, OntologyImportPlan,
    OntologyPropertyMapping, EPI_ONTOLOGY_FORMAT, EPI_ONTOLOGY_TURTLE, EPI_ONTOLOGY_URI,
    EPI_ONTOLOGY_VERSION_IRI, OWL2_RL_PROFILE, SHACL_REPORTING_MODE,
};
pub use pointers::{
    compute_pointer_web, kernel_coordinate_anchor_for, kernel_coordinate_anchor_from_parts,
    HarmonicBedrockAnchor, HarmonicContextFrameAnchor, HarmonicPointerAnchor,
    HarmonicPointerRelationDescriptor, HarmonicPointerWebAnchor, KernelAnchor,
    KernelCoordinateAnchor, PointerWeb, QvDataAnchor,
};
pub use relationship_manager::{RelationshipManager, RelationshipWritePlan, POSITION_REL_TYPES};
pub use retrieval::{CoordinateRetrieval, GraphRAGRetriever, HybridRetriever};
pub use retrieval_query::{
    classify_query, disclosure_for_query_type, extract_coordinate_mentions, fusion_rrf_results,
    fusion_weighted_results, infer_positions, tokenize_query, CoordinateSearchScope,
    DisclosureLevel, GraphRetrievalQuery, HybridFusionConfig, QueryType, RetrievalMode,
    RetrievalResult,
};
pub use semantic::SemanticDocument;
pub use sync_coordinator::{
    CodeProvenanceEvidence, FrontmatterPropertyRule, FrontmatterPropertyRuleKind,
    GraphPromotionSyncReport, GraphitiEpisodePlan, PromotionClass, PromotionFrontmatterEvidence,
    PromotionLinkEvidence, PromotionNodeIntent, PromotionPlan, PromotionPolicyDecision,
    PromotionRelationCandidate, PromotionTargetSurface, PropertyProposal, PropertySchemaStatus,
    S2GraphPromotionIntent, S2GraphPromotionNode, SyncCoordinator, SyncResult,
};
pub use types::{EdgeRef, GraphResult, NodeRef, PathResult, RelationshipType};
pub use vault::{
    parse_yaml_frontmatter, EntityMapper, GraphAPI, QLAlignmentValidator, SyncOrchestrator,
};

pub const SEMANTIC_REDIS_NAMESPACE: &str = "s2:graph:semantic";
pub const SEMANTIC_CACHE_NAME: &str = "epi_semantic_cache";

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct GraphRedisRole {
    pub coordinate_owner: &'static str,
    pub redis_namespace: &'static str,
    pub cache_name: &'static str,
    pub embedding_dimensions: usize,
    pub embedding_version: &'static str,
    pub q_schema_version: &'static str,
    pub description: &'static str,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Neo4jGraphRole {
    pub coordinate_owner: &'static str,
    pub graph_id: &'static str,
    pub node_label: &'static str,
    pub coordinate_property: &'static str,
    pub semantic_embedding_dimensions: usize,
    pub vector_index_name: &'static str,
    pub compatibility_labels: &'static [&'static str],
    pub compatibility_properties: &'static [&'static str],
}

impl Neo4jGraphRole {
    pub fn primary_bimba() -> Self {
        Self {
            coordinate_owner: "S2",
            graph_id: epi_s2_graph_schema::GRAPH_ID,
            node_label: epi_s2_graph_schema::BIMBA_LABEL,
            coordinate_property: epi_s2_graph_schema::COORDINATE_PROPERTY,
            semantic_embedding_dimensions: epi_s2_graph_schema::SEMANTIC_EMBEDDING_DIMENSIONS,
            vector_index_name: epi_s2_graph_schema::SEMANTIC_EMBEDDING_INDEX,
            compatibility_labels: epi_s2_graph_schema::COMPAT_LABELS,
            compatibility_properties: epi_s2_graph_schema::COMPAT_COORDINATE_PROPERTIES,
        }
    }
}

#[derive(Debug, Clone)]
pub struct Neo4jConfig {
    pub uri: String,
    pub user: String,
    pub password: String,
}

impl Neo4jConfig {
    pub fn from_env() -> Self {
        Self {
            uri: std::env::var("EPILOGOS_NEO4J_URI")
                .unwrap_or_else(|_| "bolt://localhost:7687".into()),
            user: std::env::var("EPILOGOS_NEO4J_USER").unwrap_or_else(|_| "neo4j".into()),
            password: std::env::var("EPILOGOS_NEO4J_PASSWORD").unwrap_or_else(|_| String::new()),
        }
    }
}

pub struct Neo4jClient {
    graph: Arc<Graph>,
}

impl Neo4jClient {
    pub fn connect(config: &Neo4jConfig) -> Result<Self, neo4rs::Error> {
        let graph = Graph::new(&config.uri, &config.user, &config.password)?;
        Ok(Self {
            graph: Arc::new(graph),
        })
    }

    pub async fn health_check(&self) -> Result<bool, neo4rs::Error> {
        let mut result = self.graph.execute(query("RETURN 1 AS ok")).await?;
        Ok(result.next().await?.is_some())
    }

    pub async fn run(&self, cypher: &str) -> Result<Vec<neo4rs::Row>, neo4rs::Error> {
        let mut result = self.graph.execute(query(cypher)).await?;
        let mut rows = Vec::new();
        while let Some(row) = result.next().await? {
            rows.push(row);
        }
        Ok(rows)
    }

    pub async fn run_query(&self, q: Query) -> Result<Vec<neo4rs::Row>, neo4rs::Error> {
        let mut result = self.graph.execute(q).await?;
        let mut rows = Vec::new();
        while let Some(row) = result.next().await? {
            rows.push(row);
        }
        Ok(rows)
    }

    pub fn graph(&self) -> &Graph {
        &self.graph
    }
}

impl GraphRedisRole {
    pub fn semantic_cache() -> Self {
        Self {
            coordinate_owner: "S2",
            redis_namespace: SEMANTIC_REDIS_NAMESPACE,
            cache_name: SEMANTIC_CACHE_NAME,
            embedding_dimensions: epi_s2_graph_schema::SEMANTIC_EMBEDDING_DIMENSIONS,
            embedding_version: epi_s2_graph_schema::EMBEDDING_VERSION,
            q_schema_version: epi_s2_graph_schema::Q_SCHEMA_VERSION,
            description:
                "Redis Stack semantic cache for S2 graph retrieval over Neo4j/Bimba coordinates",
        }
    }
}

#[derive(Debug, Clone)]
pub struct SemanticCacheConfig {
    pub redis_url: String,
    pub redis_namespace: String,
    pub python_bin: PathBuf,
    pub script_path: PathBuf,
    pub cache_name: String,
    pub similarity_threshold: f64,
    pub ttl_seconds: Option<u64>,
    pub arch: Option<String>,
}

impl SemanticCacheConfig {
    pub fn from_env() -> Result<Self, String> {
        let redis_url = std::env::var("EPILOGOS_SEMANTIC_CACHE_REDIS_URL")
            .map_err(|_| "EPILOGOS_SEMANTIC_CACHE_REDIS_URL not set".to_string())?;
        let script_path = std::env::var("EPILOGOS_SEMANTIC_CACHE_SCRIPT")
            .map(PathBuf::from)
            .unwrap_or_else(|_| default_script_path());

        Ok(Self::from_parts(redis_url, script_path))
    }

    pub fn from_env_optional() -> Result<Option<Self>, String> {
        match std::env::var("EPILOGOS_SEMANTIC_CACHE_REDIS_URL") {
            Ok(_) => Self::from_env().map(Some),
            Err(_) => Ok(None),
        }
    }

    pub fn for_local_dev(repo_root: &Path) -> Self {
        Self::from_script_path(epi_s3_redis_context::redisvl_service_script(repo_root))
    }

    pub fn from_script_path(script_path: PathBuf) -> Self {
        let redis_url = std::env::var("EPILOGOS_SEMANTIC_CACHE_REDIS_URL")
            .unwrap_or_else(|_| "redis://127.0.0.1:6379".into());
        Self::from_parts(redis_url, script_path)
    }

    fn from_parts(redis_url: String, script_path: PathBuf) -> Self {
        let role = GraphRedisRole::semantic_cache();
        Self {
            redis_url,
            redis_namespace: std::env::var("EPILOGOS_SEMANTIC_CACHE_REDIS_NAMESPACE")
                .unwrap_or_else(|_| role.redis_namespace.into()),
            python_bin: resolve_python_bin(&script_path),
            script_path,
            cache_name: std::env::var("EPILOGOS_SEMANTIC_CACHE_NAME")
                .unwrap_or_else(|_| role.cache_name.into()),
            similarity_threshold: std::env::var("EPILOGOS_SEMANTIC_CACHE_THRESHOLD")
                .ok()
                .and_then(|value| value.parse().ok())
                .unwrap_or(0.9),
            ttl_seconds: std::env::var("EPILOGOS_SEMANTIC_CACHE_TTL_SECONDS")
                .ok()
                .and_then(|value| value.parse().ok()),
            arch: std::env::var("EPILOGOS_SEMANTIC_CACHE_ARCH")
                .ok()
                .or_else(default_arch_override),
        }
    }

    pub fn environment_contract(&self) -> BTreeMap<String, String> {
        let mut env = BTreeMap::new();
        env.insert(
            "EPILOGOS_SEMANTIC_CACHE_REDIS_URL".into(),
            self.redis_url.clone(),
        );
        env.insert(
            "EPILOGOS_SEMANTIC_CACHE_REDIS_NAMESPACE".into(),
            self.redis_namespace.clone(),
        );
        env.insert(
            "EPILOGOS_SEMANTIC_CACHE_SCRIPT".into(),
            self.script_path.display().to_string(),
        );
        env.insert(
            "EPILOGOS_SEMANTIC_CACHE_PYTHON".into(),
            self.python_bin.display().to_string(),
        );
        env.insert(
            "EPILOGOS_SEMANTIC_CACHE_NAME".into(),
            self.cache_name.clone(),
        );
        env.insert(
            "EPILOGOS_SEMANTIC_CACHE_THRESHOLD".into(),
            self.similarity_threshold.to_string(),
        );
        env.insert(
            "EPILOGOS_SEMANTIC_CACHE_EMBEDDING_VERSION".into(),
            epi_s2_graph_schema::EMBEDDING_VERSION.into(),
        );
        env.insert(
            "EPILOGOS_SEMANTIC_CACHE_Q_SCHEMA_VERSION".into(),
            epi_s2_graph_schema::Q_SCHEMA_VERSION.into(),
        );
        if let Some(ttl_seconds) = self.ttl_seconds {
            env.insert(
                "EPILOGOS_SEMANTIC_CACHE_TTL_SECONDS".into(),
                ttl_seconds.to_string(),
            );
        }
        if let Some(arch) = &self.arch {
            env.insert("EPILOGOS_SEMANTIC_CACHE_ARCH".into(), arch.clone());
        }
        env
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum SemanticCacheMatchStrategy {
    Exact,
    Semantic,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchPayload {
    pub prompt: String,
    pub attributes: BTreeMap<String, String>,
    pub similarity_threshold: f64,
    pub strategies: Vec<SemanticCacheMatchStrategy>,
}

impl SearchPayload {
    pub fn new(
        prompt: impl Into<String>,
        attributes: BTreeMap<String, String>,
        similarity_threshold: f64,
        strategies: Vec<SemanticCacheMatchStrategy>,
    ) -> Self {
        Self {
            prompt: prompt.into(),
            attributes,
            similarity_threshold,
            strategies,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StorePayload {
    pub prompt: String,
    pub response: String,
    pub attributes: BTreeMap<String, String>,
}

impl StorePayload {
    pub fn new(
        prompt: impl Into<String>,
        response: impl Into<String>,
        attributes: BTreeMap<String, String>,
    ) -> Self {
        Self {
            prompt: prompt.into(),
            response: response.into(),
            attributes,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResult {
    pub hit: bool,
    pub response: Option<String>,
    pub entry_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SemanticCacheHealth {
    pub ok: bool,
    pub python: String,
    pub redis_url: String,
    pub cache_name: String,
    pub redis_namespace: String,
    pub redis_ping: bool,
    pub redis_stack: bool,
    pub search_indexes: Vec<String>,
    pub filterable_fields: Vec<String>,
    pub error: Option<String>,
}

pub struct SemanticCacheClient {
    config: SemanticCacheConfig,
}

impl SemanticCacheClient {
    pub fn new(config: SemanticCacheConfig) -> Self {
        Self { config }
    }

    pub async fn search(
        &self,
        prompt: &str,
        attributes: BTreeMap<String, String>,
        strategies: Vec<SemanticCacheMatchStrategy>,
    ) -> Result<Option<SearchResult>, String> {
        let payload = SearchPayload::new(
            prompt,
            attributes,
            self.config.similarity_threshold,
            strategies,
        );
        let result: SearchResult = self.invoke("search", &payload)?;
        if result.hit {
            Ok(Some(result))
        } else {
            Ok(None)
        }
    }

    pub async fn store(
        &self,
        prompt: &str,
        response: &str,
        attributes: BTreeMap<String, String>,
    ) -> Result<(), String> {
        let payload = StorePayload::new(prompt, response, attributes);
        let _: serde_json::Value = self.invoke("store", &payload)?;
        Ok(())
    }

    pub async fn flush(&self) -> Result<(), String> {
        let _: serde_json::Value = self.invoke("flush", &serde_json::json!({}))?;
        Ok(())
    }

    pub async fn health(&self) -> Result<SemanticCacheHealth, String> {
        self.invoke("health", &serde_json::json!({}))
    }

    fn invoke<T: Serialize, R: for<'de> Deserialize<'de>>(
        &self,
        command: &str,
        payload: &T,
    ) -> Result<R, String> {
        let payload = serde_json::to_vec(payload).map_err(|e| e.to_string())?;
        let venv_dir = self
            .config
            .script_path
            .parent()
            .map(|dir| dir.join(".venv"))
            .unwrap_or_else(|| PathBuf::from(".venv"));
        let python_path = site_packages_path(&venv_dir);

        let mut command_builder = if let Some(arch) = &self.config.arch {
            let mut cmd = Command::new("arch");
            cmd.arg(format!("-{}", arch))
                .arg(&self.config.python_bin)
                .arg(&self.config.script_path)
                .arg(command);
            cmd
        } else {
            let mut cmd = Command::new(&self.config.python_bin);
            cmd.arg(&self.config.script_path).arg(command);
            cmd
        };
        command_builder
            .env(
                "EPILOGOS_SEMANTIC_CACHE_REDIS_URL",
                self.config.redis_url.as_str(),
            )
            .env(
                "EPILOGOS_SEMANTIC_CACHE_REDIS_NAMESPACE",
                self.config.redis_namespace.as_str(),
            )
            .env(
                "EPILOGOS_SEMANTIC_CACHE_NAME",
                self.config.cache_name.as_str(),
            )
            .env(
                "EPILOGOS_SEMANTIC_CACHE_THRESHOLD",
                self.config.similarity_threshold.to_string(),
            )
            .env(
                "EPILOGOS_SEMANTIC_CACHE_TTL_SECONDS",
                self.config
                    .ttl_seconds
                    .map(|value| value.to_string())
                    .unwrap_or_default(),
            )
            .env(
                "EPILOGOS_SEMANTIC_CACHE_EMBEDDING_VERSION",
                epi_s2_graph_schema::EMBEDDING_VERSION,
            )
            .env(
                "EPILOGOS_SEMANTIC_CACHE_Q_SCHEMA_VERSION",
                epi_s2_graph_schema::Q_SCHEMA_VERSION,
            )
            .env("VIRTUAL_ENV", &venv_dir)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped());
        if let Some(path) = python_path {
            command_builder.env("PYTHONPATH", path);
        }

        let mut child = command_builder
            .spawn()
            .map_err(|e| format!("semantic cache service launch failed: {e}"))?;

        use std::io::Write;
        child
            .stdin
            .as_mut()
            .ok_or("semantic cache service stdin unavailable")?
            .write_all(&payload)
            .map_err(|e| format!("semantic cache service stdin write failed: {e}"))?;

        let output = child
            .wait_with_output()
            .map_err(|e| format!("semantic cache service execution failed: {e}"))?;

        if !output.status.success() {
            return Err(format!(
                "semantic cache service error: {}",
                String::from_utf8_lossy(&output.stderr)
            ));
        }

        serde_json::from_slice(&output.stdout)
            .map_err(|e| format!("semantic cache response parse failed: {e}"))
    }
}

fn default_script_path() -> PathBuf {
    let manifest_root = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let repo_candidate = manifest_root
        .parent()
        .and_then(Path::parent)
        .and_then(Path::parent)
        .map(epi_s3_redis_context::redisvl_service_script);
    if let Some(candidate) = repo_candidate {
        if candidate.exists() {
            return candidate;
        }
    }

    let manifest_candidate = epi_s3_redis_context::redisvl_service_script(&manifest_root);
    if manifest_candidate.exists() {
        return manifest_candidate;
    }

    if let Ok(exe) = std::env::current_exe() {
        if let Some(root) = exe.parent().and_then(Path::parent) {
            let candidate = epi_s3_redis_context::redisvl_service_script(root);
            if candidate.exists() {
                return candidate;
            }
        }
    }

    manifest_candidate
}

fn resolve_python_bin(script_path: &Path) -> PathBuf {
    if let Ok(explicit) = std::env::var("EPILOGOS_SEMANTIC_CACHE_PYTHON") {
        return PathBuf::from(explicit);
    }

    let venv_python = script_path
        .parent()
        .map(|dir| dir.join(".venv").join("bin").join("python3"))
        .unwrap_or_else(|| PathBuf::from("python3"));
    if venv_python.exists() {
        venv_python
    } else {
        PathBuf::from("python3")
    }
}

fn site_packages_path(venv_dir: &Path) -> Option<String> {
    let lib_dir = venv_dir.join("lib");
    let mut matches: Vec<PathBuf> = std::fs::read_dir(&lib_dir)
        .ok()?
        .filter_map(|entry| entry.ok())
        .map(|entry| entry.path().join("site-packages"))
        .filter(|path| path.exists())
        .collect();
    matches.sort();
    matches
        .into_iter()
        .next()
        .map(|path| path.to_string_lossy().into_owned())
}

fn default_arch_override() -> Option<String> {
    if !cfg!(target_os = "macos") {
        return None;
    }

    let arm64_capable = Command::new("sysctl")
        .args(["-in", "hw.optional.arm64"])
        .output()
        .ok()
        .filter(|output| output.status.success())
        .map(|output| String::from_utf8_lossy(&output.stdout).trim().to_string())
        .map(|value| value == "1")
        .unwrap_or(false);
    if arm64_capable {
        return Some("arm64".into());
    }

    let output = Command::new("uname").arg("-m").output().ok()?;
    if !output.status.success() {
        return None;
    }

    let machine = String::from_utf8_lossy(&output.stdout).trim().to_string();
    if machine == "arm64" {
        Some("arm64".into())
    } else {
        None
    }
}
