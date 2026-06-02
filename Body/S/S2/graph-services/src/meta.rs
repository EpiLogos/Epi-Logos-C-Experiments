use neo4rs::query;
use sha2::{Digest, Sha256};
use std::fs;
use std::io::Read;
use std::path::{Path, PathBuf};

use crate::Neo4jClient;

pub use epi_s2_graph_schema::{EMBEDDING_VERSION, GRAPH_ID, Q_SCHEMA_VERSION};

#[derive(Debug, Clone, Default)]
pub struct GraphMeta {
    pub graph_id: String,
    pub schema_version: String,
    pub seed_source_hash: String,
    pub dataset_source_hash: String,
    pub relation_registry_hash: String,
    pub kernel_source_hash: String,
    pub embedding_version: String,
    pub q_schema_version: String,
    pub ontology_version_iri: String,
    pub ontology_turtle_sha256: String,
    pub gds_projection_version: String,
    pub graph_revision: i64,
}

fn sha256_hex(bytes: &[u8]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(bytes);
    format!("{:x}", hasher.finalize())
}

pub fn seed_source_hash() -> String {
    sha256_hex(include_str!("seed.rs").as_bytes())
}

pub fn relation_registry_hash() -> String {
    sha256_hex(include_str!("../../graph-schema/src/lib.rs").as_bytes())
}

pub fn kernel_source_hash() -> String {
    let mut hasher = Sha256::new();
    hasher.update(include_str!("../../../S0/epi-lib/include/m0.h").as_bytes());
    hasher.update(include_str!("../../../S0/epi-lib/include/ontology.h").as_bytes());
    hasher.update(include_str!("../../../S0/epi-lib/include/pointer_web.h").as_bytes());
    format!("{:x}", hasher.finalize())
}

fn default_repo_root() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("../../../../")
        .components()
        .collect()
}

fn dataset_hash_paths(root: &Path) -> Vec<PathBuf> {
    fn walk(dir: &Path, files: &mut Vec<PathBuf>) {
        let Ok(entries) = fs::read_dir(dir) else {
            return;
        };
        let mut entries = entries
            .filter_map(Result::ok)
            .map(|entry| entry.path())
            .collect::<Vec<_>>();
        entries.sort();
        for path in entries {
            if path.is_dir() {
                walk(&path, files);
            } else {
                files.push(path);
            }
        }
    }

    let mut files = Vec::new();
    walk(&root.join("Idea/Bimba/Map/datasets"), &mut files);
    files.push(root.join("Idea/Bimba/Map/datasets/deep-property-map.md"));
    files.push(
        root.join("Idea/Bimba/Map/datasets/migrations/2026-05-17-bimba-scaffold-to-bimba.cypher"),
    );
    files.sort();
    files.dedup();
    files
}

pub fn dataset_source_hash() -> String {
    let root = default_repo_root();
    let mut hasher = Sha256::new();
    let mut saw_any = false;

    for path in dataset_hash_paths(&root) {
        if !path.is_file() {
            continue;
        }
        saw_any = true;
        hasher.update(
            path.strip_prefix(&root)
                .unwrap_or(&path)
                .to_string_lossy()
                .as_bytes(),
        );
        let mut file = match fs::File::open(&path) {
            Ok(file) => file,
            Err(_) => continue,
        };
        let mut buf = [0_u8; 8192];
        loop {
            let read = match file.read(&mut buf) {
                Ok(read) => read,
                Err(_) => break,
            };
            if read == 0 {
                break;
            }
            hasher.update(&buf[..read]);
        }
    }

    if !saw_any {
        return sha256_hex(b"dataset-source-unavailable");
    }

    format!("{:x}", hasher.finalize())
}

pub async fn is_bootstrapped(client: &Neo4jClient) -> Result<bool, String> {
    let rows = client
        .run("MATCH (n:Bimba) RETURN count(n) AS c")
        .await
        .map_err(|e| format!("bootstrap check failed: {}", e))?;
    let count: i64 = rows
        .first()
        .and_then(|row| row.get("c").ok())
        .unwrap_or_default();
    Ok(count > 0)
}

pub async fn read_graph_meta(client: &Neo4jClient) -> Result<Option<GraphMeta>, String> {
    let rows = client
        .run_query(
            query(
                "MATCH (m:GraphMeta {graph_id: $graph_id})
                 RETURN m.graph_id AS graph_id,
                        m.schema_version AS schema_version,
                        m.seed_source_hash AS seed_source_hash,
                        m.dataset_source_hash AS dataset_source_hash,
                        m.relation_registry_hash AS relation_registry_hash,
                        m.kernel_source_hash AS kernel_source_hash,
                        m.embedding_version AS embedding_version,
                        m.q_schema_version AS q_schema_version,
                        m.epi_ontology_version_iri AS ontology_version_iri,
                        m.epi_ontology_sha256 AS ontology_turtle_sha256,
                        m.gds_projection_version AS gds_projection_version,
                        m.graph_revision AS graph_revision",
            )
            .param("graph_id", GRAPH_ID),
        )
        .await
        .map_err(|e| format!("graph meta read failed: {}", e))?;

    let Some(row) = rows.first() else {
        return Ok(None);
    };

    Ok(Some(GraphMeta {
        graph_id: row.get("graph_id").unwrap_or_else(|_| GRAPH_ID.to_string()),
        schema_version: row.get("schema_version").unwrap_or_default(),
        seed_source_hash: row.get("seed_source_hash").unwrap_or_default(),
        dataset_source_hash: row.get("dataset_source_hash").unwrap_or_default(),
        relation_registry_hash: row.get("relation_registry_hash").unwrap_or_default(),
        kernel_source_hash: row.get("kernel_source_hash").unwrap_or_default(),
        embedding_version: row.get("embedding_version").unwrap_or_default(),
        q_schema_version: row.get("q_schema_version").unwrap_or_default(),
        ontology_version_iri: row.get("ontology_version_iri").unwrap_or_default(),
        ontology_turtle_sha256: row.get("ontology_turtle_sha256").unwrap_or_default(),
        gds_projection_version: row.get("gds_projection_version").unwrap_or_default(),
        graph_revision: row.get("graph_revision").unwrap_or_default(),
    }))
}

pub async fn write_graph_meta(client: &Neo4jClient, meta: &GraphMeta) -> Result<(), String> {
    client
        .run_query(
            query(
                "MERGE (m:GraphMeta {graph_id: $graph_id})
                 SET m.schema_version = $schema_version,
                     m.seed_source_hash = $seed_source_hash,
                     m.dataset_source_hash = $dataset_source_hash,
                     m.relation_registry_hash = $relation_registry_hash,
                     m.kernel_source_hash = $kernel_source_hash,
                     m.embedding_version = $embedding_version,
                     m.q_schema_version = $q_schema_version,
                     m.epi_ontology_version_iri = $ontology_version_iri,
                     m.epi_ontology_sha256 = $ontology_turtle_sha256,
                     m.gds_projection_version = $gds_projection_version,
                     m.graph_revision = $graph_revision,
                     m.updated_at = datetime()",
            )
            .param("graph_id", meta.graph_id.as_str())
            .param("schema_version", meta.schema_version.as_str())
            .param("seed_source_hash", meta.seed_source_hash.as_str())
            .param("dataset_source_hash", meta.dataset_source_hash.as_str())
            .param(
                "relation_registry_hash",
                meta.relation_registry_hash.as_str(),
            )
            .param("kernel_source_hash", meta.kernel_source_hash.as_str())
            .param("embedding_version", meta.embedding_version.as_str())
            .param("q_schema_version", meta.q_schema_version.as_str())
            .param("ontology_version_iri", meta.ontology_version_iri.as_str())
            .param(
                "ontology_turtle_sha256",
                meta.ontology_turtle_sha256.as_str(),
            )
            .param(
                "gds_projection_version",
                meta.gds_projection_version.as_str(),
            )
            .param("graph_revision", meta.graph_revision),
        )
        .await
        .map_err(|e| format!("graph meta write failed: {}", e))?;
    Ok(())
}

pub fn desired_meta(schema_version: &str, next_revision: i64) -> GraphMeta {
    GraphMeta {
        graph_id: GRAPH_ID.to_string(),
        schema_version: schema_version.to_string(),
        seed_source_hash: seed_source_hash(),
        dataset_source_hash: dataset_source_hash(),
        relation_registry_hash: relation_registry_hash(),
        kernel_source_hash: kernel_source_hash(),
        embedding_version: EMBEDDING_VERSION.to_string(),
        q_schema_version: Q_SCHEMA_VERSION.to_string(),
        ontology_version_iri: crate::EPI_ONTOLOGY_VERSION_IRI.to_string(),
        ontology_turtle_sha256: crate::epi_ontology_sha256(),
        gds_projection_version: crate::GDS_OPTION1_PROJECTION_VERSION.to_string(),
        graph_revision: next_revision,
    }
}

pub fn applied_meta(
    schema_version: &str,
    next_revision: i64,
    current: Option<&GraphMeta>,
) -> GraphMeta {
    let desired = desired_meta(schema_version, next_revision);
    let mut applied = desired.clone();
    if let Some(current) = current {
        applied.dataset_source_hash = current.dataset_source_hash.clone();
        applied.ontology_version_iri = current.ontology_version_iri.clone();
        applied.ontology_turtle_sha256 = current.ontology_turtle_sha256.clone();
        applied.gds_projection_version = current.gds_projection_version.clone();
    } else {
        applied.dataset_source_hash.clear();
        applied.ontology_version_iri.clear();
        applied.ontology_turtle_sha256.clear();
        applied.gds_projection_version.clear();
    }
    applied
}

pub fn applied_meta_with_dataset(
    schema_version: &str,
    next_revision: i64,
    current: Option<&GraphMeta>,
) -> GraphMeta {
    let desired = desired_meta(schema_version, next_revision);
    let mut applied = applied_meta(schema_version, next_revision, current);
    applied.dataset_source_hash = desired.dataset_source_hash;
    applied
}

pub fn structural_state_aligned(live: Option<&GraphMeta>, desired: &GraphMeta) -> bool {
    let Some(live) = live else {
        return false;
    };

    live.schema_version == desired.schema_version
        && live.seed_source_hash == desired.seed_source_hash
        && live.relation_registry_hash == desired.relation_registry_hash
        && live.kernel_source_hash == desired.kernel_source_hash
        && live.embedding_version == desired.embedding_version
        && live.q_schema_version == desired.q_schema_version
}

pub fn manual_drift_fields(live: Option<&GraphMeta>, desired: &GraphMeta) -> Vec<&'static str> {
    let Some(live) = live else {
        return vec!["dataset", "ontology", "gds"];
    };

    let mut drift = Vec::new();
    if live.dataset_source_hash != desired.dataset_source_hash {
        drift.push("dataset");
    }
    if live.ontology_version_iri != desired.ontology_version_iri
        || live.ontology_turtle_sha256 != desired.ontology_turtle_sha256
    {
        drift.push("ontology");
    }
    if live.gds_projection_version != desired.gds_projection_version {
        drift.push("gds");
    }
    drift
}
