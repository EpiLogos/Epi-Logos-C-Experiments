//! The S2↔S3 Redis substrate declaration — a boundary fact neither layer owns alone.
//!
//! # Coordinate
//!
//! | Field | Value |
//! |-------|-------|
//! | Coordinate | S-root |
//! | Residency  | Body/S/epi-kernel-contract/src/redis_residency.rs |
//! | Position   | #0 — the shared substrate declaration beneath S2 and S3 |
//! | Actualises | [[S3-ARCHITECTURE]] Redis residency table, Track 53 T53.06 |
//!
//! # Why this lives below both
//!
//! One Redis server carries two disjoint namespaces: `s2:graph:semantic`
//! (S2's graph semantic cache) and `s3:gateway:temporal` (S3′'s living
//! context). [`RedisRuntimeRole`] is the statement *of that split*, so it
//! belongs to neither side of it — it was resident in `epi-s3-redis-context`,
//! which forced `epi-s2-graph-services` to declare an upward S2→S3 dependency
//! merely to name its own namespace. The same is true of the RedisVL bridge
//! script path (S3 hosts the script, S2 invokes it), the tier vocabulary
//! (both layers write with the same TTLs), and the connection descriptor
//! (both layers read the same `EPILOGOS_REDIS_URI`).
//!
//! # Public surface
//! * [`RedisRuntimeRole`] — who owns the runtime and which namespace is whose.
//! * [`CacheTier`] — the shared tier vocabulary: TTL and key prefix.
//! * [`RedisConfig`] — where Redis is, from one env var read in one place.
//! * [`REDISVL_SERVICE_RELATIVE_PATH`] / [`REDISVL_SETUP_RELATIVE_PATH`] and
//!   [`redisvl_service_script`] / [`redisvl_setup_script`] — the RedisVL
//!   bridge script residency.
//!
//! # Does NOT own
//! * The Redis client. Connecting, `PING`, `GET`/`SETEX` and `FT._LIST` are
//!   runtime, and this crate is deliberately runtime-free (no `redis`, no
//!   `tokio` in `[dependencies]`). `epi-s3-redis-context::RedisCache` is the
//!   S3′ client; S2 probes its own substrate with its own connection.
//! * `RedisKey`. Its constructors (`session_now`, `day_context`,
//!   `agent_orientation`, …) are S3′ temporal semantics and stay at S3.

use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};

pub const REDIS_RUNTIME_OWNER: &str = "S3";
pub const REDISVL_BRIDGE_OWNER: &str = "S3 Redis runtime substrate";
pub const S2_GRAPH_SEMANTIC_NAMESPACE: &str = "s2:graph:semantic";
pub const S3_TEMPORAL_NAMESPACE: &str = "s3:gateway:temporal";
pub const REDISVL_SERVICE_RELATIVE_PATH: &str =
    "Body/S/S3/redis-context/scripts/redisvl_cache_service/redisvl_cache_service.py";
pub const REDISVL_SETUP_RELATIVE_PATH: &str =
    "Body/S/S3/redis-context/scripts/redisvl_cache_service/setup.sh";

/// The residency declaration itself: S3 runs the Redis substrate, S2 and S3′
/// hold separate namespaces inside it.
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

/// The shared write vocabulary: how long a value lives and what prefix it
/// carries. Both namespaces write with these, so the tiers are one table.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum CacheTier {
    Live,   // TTL 30s — process liveness and heartbeat facts
    Active, // TTL 1800s — active session lifecycle state
    Hot,    // TTL 300s — NOW and agent-orientation facts
    Warm,   // TTL 3600s — recent day/source/retrieval context
    Cold,   // TTL 86400s — coordinate and manifest snapshots
}

impl CacheTier {
    pub fn ttl_seconds(&self) -> u64 {
        match self {
            CacheTier::Live => 30,
            CacheTier::Active => 1800,
            CacheTier::Hot => 300,
            CacheTier::Warm => 3600,
            CacheTier::Cold => 86400,
        }
    }

    pub fn prefix(&self) -> &'static str {
        match self {
            CacheTier::Live => "cache:live",
            CacheTier::Active => "cache:active",
            CacheTier::Hot => "cache:hot",
            CacheTier::Warm => "cache:warm",
            CacheTier::Cold => "cache:cold",
        }
    }
}

/// Where the shared Redis is. One env var, read in one place, so an S2 probe
/// and an S3′ write can never disagree about which server they mean.
pub struct RedisConfig {
    pub uri: String,
}

impl RedisConfig {
    pub fn from_env() -> Self {
        Self {
            uri: std::env::var("EPILOGOS_REDIS_URI")
                .unwrap_or_else(|_| "redis://localhost:6379".into()),
        }
    }
}

pub fn redisvl_service_script(repo_root: &Path) -> PathBuf {
    repo_root.join(REDISVL_SERVICE_RELATIVE_PATH)
}

pub fn redisvl_setup_script(repo_root: &Path) -> PathBuf {
    repo_root.join(REDISVL_SETUP_RELATIVE_PATH)
}

#[cfg(test)]
mod tests {
    use super::*;

    /// The declaration must keep naming both sides of the split; that is the
    /// whole reason it sits below both of them.
    #[test]
    fn the_role_names_both_namespaces_and_the_s3_runtime_owner() {
        let role = RedisRuntimeRole::local_runtime();
        assert_eq!(role.runtime_owner, "S3");
        assert_eq!(role.graph_semantic_namespace, "s2:graph:semantic");
        assert_eq!(role.temporal_namespace, "s3:gateway:temporal");
        assert!(role.description.contains("S3 Redis runtime substrate"));
    }

    /// The bridge script is S3-resident. S-root records where it lives; it
    /// does not relocate it, and it must never claim an S2 path.
    #[test]
    fn the_redisvl_bridge_script_stays_resident_at_s3() {
        assert!(REDISVL_SERVICE_RELATIVE_PATH.starts_with("Body/S/S3/redis-context/"));
        assert!(!REDISVL_SERVICE_RELATIVE_PATH.contains("Body/S/S2/"));
        assert_eq!(
            redisvl_service_script(Path::new("/repo")).to_string_lossy(),
            format!("/repo/{REDISVL_SERVICE_RELATIVE_PATH}")
        );
        assert_eq!(
            redisvl_setup_script(Path::new("/repo")).to_string_lossy(),
            format!("/repo/{REDISVL_SETUP_RELATIVE_PATH}")
        );
    }

    #[test]
    fn tier_ttls_and_prefixes_are_one_table_for_both_namespaces() {
        assert_eq!(CacheTier::Live.ttl_seconds(), 30);
        assert_eq!(CacheTier::Active.ttl_seconds(), 1800);
        assert_eq!(CacheTier::Hot.ttl_seconds(), 300);
        assert_eq!(CacheTier::Warm.ttl_seconds(), 3600);
        assert_eq!(CacheTier::Cold.ttl_seconds(), 86400);
        assert_eq!(CacheTier::Live.prefix(), "cache:live");
        assert_eq!(CacheTier::Active.prefix(), "cache:active");
        assert_eq!(CacheTier::Hot.prefix(), "cache:hot");
        assert_eq!(CacheTier::Warm.prefix(), "cache:warm");
        assert_eq!(CacheTier::Cold.prefix(), "cache:cold");
    }

    /// The env var and its default are frozen: an S2 doctor probe and an S3′
    /// hydration write must resolve the same server.
    #[test]
    fn the_connection_descriptor_reads_one_env_var_with_a_frozen_default() {
        let previous = std::env::var("EPILOGOS_REDIS_URI").ok();
        std::env::remove_var("EPILOGOS_REDIS_URI");
        assert_eq!(RedisConfig::from_env().uri, "redis://localhost:6379");
        std::env::set_var("EPILOGOS_REDIS_URI", "redis://example:6380");
        assert_eq!(RedisConfig::from_env().uri, "redis://example:6380");
        match previous {
            Some(value) => std::env::set_var("EPILOGOS_REDIS_URI", value),
            None => std::env::remove_var("EPILOGOS_REDIS_URI"),
        }
    }
}
