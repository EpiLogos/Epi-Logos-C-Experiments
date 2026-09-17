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
//! * The S2↔S3 residency declaration itself. `RedisRuntimeRole`, the tier
//!   vocabulary, the connection descriptor and the RedisVL bridge script path
//!   are statements *about* the boundary between S2's `s2:graph:semantic`
//!   namespace and S3′'s `s3:gateway:temporal` namespace, so per Track 53
//!   T53.06 they moved down to `epi_kernel_contract::redis_residency`, where
//!   S2 may see them without declaring an upward S2→S3 dependency. They are
//!   re-exported here unchanged, so every existing import path still resolves.

pub mod aeon_eval;
pub mod redis_cache;

pub use aeon_eval::{
    aeon_eval_ledger_from_transcript, AeonEvalContext, AeonEvalGraphitiEpisode, AeonEvalLedger,
    AeonEvalMetrics, AeonEvalRedisRecord,
};
pub use epi_kernel_contract::redis_residency::{
    redisvl_service_script, redisvl_setup_script, CacheTier, RedisConfig, RedisRuntimeRole,
    REDISVL_BRIDGE_OWNER, REDISVL_SERVICE_RELATIVE_PATH, REDISVL_SETUP_RELATIVE_PATH,
    REDIS_RUNTIME_OWNER, S2_GRAPH_SEMANTIC_NAMESPACE, S3_TEMPORAL_NAMESPACE,
};
pub use redis_cache::{RedisCache, RedisKey, GNOSTIC_SUBSTRATE_HIERARCHY};
