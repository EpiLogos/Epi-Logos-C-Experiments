//! epi-s3-redis-context — Redis runtime context, key families, and eval-ledger payloads.
//!
//! # Coordinate
//!
//! | Field | Value |
//! |-------|-------|
//! | Coordinate | S3 |
//! | Residency  | Body/S/S3/redis-context/src/lib.rs |
//! | Position   | #3 - Gateway Control Plane Redis context |
//! | Actualises | [[S3-SPEC]], [[S3-ARCHITECTURE]], and 46.T46.5 Aeon eval ledger |
//!
//! # Public surface
//! * `RedisRuntimeRole` - Redis/RedisVL residency declaration.
//! * `RedisKey`, `RedisCache`, `RedisConfig`, `CacheTier` - tiered Redis runtime keys and client helpers.
//! * `AeonEvalLedger`, `AeonEvalMetrics`, `aeon_eval_ledger_from_transcript` - harness-neutral transcript metrics and promotion payloads.
//!
//! # Does NOT own
//! * Harness transcript writing, Aletheia tool registration, Graphiti sidecar transport, or S5 domain interpretation.

use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};

pub mod aeon_eval;
pub mod redis_cache;

pub use aeon_eval::{
    aeon_eval_ledger_from_transcript, AeonEvalContext, AeonEvalGraphitiEpisode, AeonEvalLedger,
    AeonEvalMetrics, AeonEvalRedisRecord,
};
pub use redis_cache::{CacheTier, RedisCache, RedisConfig, RedisKey};

pub const REDIS_RUNTIME_OWNER: &str = "S3";
pub const REDISVL_BRIDGE_OWNER: &str = "S3 Redis runtime substrate";
pub const S2_GRAPH_SEMANTIC_NAMESPACE: &str = "s2:graph:semantic";
pub const S3_TEMPORAL_NAMESPACE: &str = "s3:gateway:temporal";
pub const REDISVL_SERVICE_RELATIVE_PATH: &str =
    "Body/S/S3/redis-context/scripts/redisvl_cache_service/redisvl_cache_service.py";
pub const REDISVL_SETUP_RELATIVE_PATH: &str =
    "Body/S/S3/redis-context/scripts/redisvl_cache_service/setup.sh";

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RedisRuntimeRole {
    pub runtime_owner: &'static str,
    pub redisvl_bridge_owner: &'static str,
    pub graph_semantic_namespace: &'static str,
    pub temporal_namespace: &'static str,
    pub description: &'static str,
}

impl RedisRuntimeRole {
    pub fn local_runtime() -> Self {
        Self {
            runtime_owner: REDIS_RUNTIME_OWNER,
            redisvl_bridge_owner: REDISVL_BRIDGE_OWNER,
            graph_semantic_namespace: S2_GRAPH_SEMANTIC_NAMESPACE,
            temporal_namespace: S3_TEMPORAL_NAMESPACE,
            description:
                "S3 Redis runtime substrate; S2 graph semantic cache and S3 temporal context use separate namespaces",
        }
    }
}

pub fn redisvl_service_script(repo_root: &Path) -> PathBuf {
    repo_root.join(REDISVL_SERVICE_RELATIVE_PATH)
}

pub fn redisvl_setup_script(repo_root: &Path) -> PathBuf {
    repo_root.join(REDISVL_SETUP_RELATIVE_PATH)
}
