use std::path::Path;

use epi_s3_redis_context::{
    redisvl_service_script, redisvl_setup_script, CacheTier, RedisCache, RedisConfig, RedisKey,
    RedisRuntimeRole, REDISVL_SERVICE_RELATIVE_PATH, REDISVL_SETUP_RELATIVE_PATH,
};

#[test]
fn redis_runtime_contract_places_redisvl_bridge_under_s3_redis_context() {
    let role = RedisRuntimeRole::local_runtime();

    assert_eq!(role.runtime_owner, "S3");
    assert_eq!(role.redisvl_bridge_owner, "S3 Redis runtime substrate");
    assert_eq!(role.graph_semantic_namespace, "s2:graph:semantic");
    assert_eq!(role.temporal_namespace, "s3:gateway:temporal");
    assert!(role.description.contains("separate namespaces"));
}

#[test]
fn redisvl_bridge_paths_resolve_from_repo_root_without_s2_residency() {
    let repo_root = Path::new("/repo");

    assert_eq!(
        redisvl_service_script(repo_root).to_string_lossy(),
        format!("/repo/{REDISVL_SERVICE_RELATIVE_PATH}")
    );
    assert_eq!(
        redisvl_setup_script(repo_root).to_string_lossy(),
        format!("/repo/{REDISVL_SETUP_RELATIVE_PATH}")
    );
    assert!(REDISVL_SERVICE_RELATIVE_PATH.starts_with("Body/S/S3/redis-context/"));
    assert!(!REDISVL_SERVICE_RELATIVE_PATH.contains("Body/S/S2/"));
}

/// The live Redis client is S3 runtime property and stays here. Track 53
/// T53.06 split the *descriptor* off from the *client*: `RedisConfig` (which
/// server) and `CacheTier` (which TTL) are facts S2's semantic cache and S3′'s
/// temporal context must agree on, so they now sit at S-root where S2 can read
/// them without an upward S2→S3 dependency; `RedisCache` — connecting, PING,
/// SETEX — is runtime and the root contract is deliberately runtime-free.
///
/// Both halves are asserted here, so neither can drift back: the client must
/// stay at S3, the descriptor must sit below S3, and NEITHER may land in S2.
#[test]
fn raw_redis_cache_client_and_tiers_are_s3_runtime_owned() {
    let cache_type = std::any::type_name::<RedisCache>();
    let config_type = std::any::type_name::<RedisConfig>();
    let tier_type = std::any::type_name::<CacheTier>();

    assert!(cache_type.contains("epi_s3_redis_context"));
    assert!(config_type.contains("epi_kernel_contract"));
    assert!(tier_type.contains("epi_kernel_contract"));
    assert!(!cache_type.contains("epi_s2_"));
    assert!(!config_type.contains("epi_s2_"));
    assert!(!tier_type.contains("epi_s2_"));
    // The descriptor is re-exported here unchanged, so every S3 import path
    // still resolves and the S3 surface is unaltered by the move.
    assert_eq!(
        config_type,
        std::any::type_name::<epi_s3_redis_context::RedisConfig>()
    );
    assert_eq!(CacheTier::Hot.ttl_seconds(), 300);
    assert_eq!(CacheTier::Warm.ttl_seconds(), 3600);
    assert_eq!(CacheTier::Cold.ttl_seconds(), 86400);
    assert_eq!(CacheTier::Warm.prefix(), "cache:warm");
}

#[test]
fn canonical_runtime_key_builders_make_tier_and_namespace_explicit() {
    assert_eq!(CacheTier::Live.prefix(), "cache:live");
    assert_eq!(CacheTier::Active.prefix(), "cache:active");

    assert_eq!(
        RedisKey::session_now("20260608-120000-main").as_str(),
        "cache:hot:s3:gateway:temporal:session:20260608-120000-main:now:md"
    );
    assert_eq!(
        RedisKey::day_context("08-06-2026").as_str(),
        "cache:warm:s3:gateway:temporal:day:08-06-2026:context"
    );
    assert_eq!(
        RedisKey::day_kairos("08-06-2026").as_str(),
        "cache:hot:s3:gateway:temporal:day:08-06-2026:kairos"
    );
    assert_eq!(
        RedisKey::session_kairos("20260608-120000-main").as_str(),
        "cache:hot:s3:gateway:temporal:session:20260608-120000-main:kairos"
    );
    assert_eq!(
        RedisKey::agent_orientation("anima", "20260608-120000-main").as_str(),
        "cache:hot:s3:gateway:temporal:agent:anima:session:20260608-120000-main:orientation"
    );
    assert_eq!(
        RedisKey::psyche_state("20260608-120000-main").as_str(),
        "cache:active:s3:gateway:psyche:session:20260608-120000-main:state"
    );
    assert_eq!(
        RedisKey::kbase_ref("gnosis-pack-42").as_str(),
        "cache:warm:s5:kbase:ref:gnosis-pack-42"
    );
    assert_eq!(
        RedisKey::source_pool_ref("sha256-deadbeef").as_str(),
        "cache:warm:s5:source-pool:ref:sha256-deadbeef"
    );
    // 12.T12.2 (d): hierarchical {day}:{session}:{turn}:{coordinate} leads the
    // key so turn-scoped SCANs and session-start cache warming stay prefix reads.
    assert_eq!(
        RedisKey::coordinate_lookup_snapshot(
            "graph-rev-17",
            "14-07-2026",
            "20260714-001500-1a58f7",
            "t3",
            "M4.4.4.4"
        )
        .as_str(),
        "cache:cold:s2:coordinate:14-07-2026:20260714-001500-1a58f7:t3:M4.4.4.4:lookup:graph-rev-17"
    );
    assert_eq!(
        RedisKey::gnostic_substrate(
            CacheTier::Warm,
            "14-07-2026",
            "20260714-001500-1a58f7",
            "t3",
            "M2-1",
            "evidence"
        )
        .as_str(),
        "cache:warm:s5:gnostic:14-07-2026:20260714-001500-1a58f7:t3:M2-1:evidence"
    );
    assert_eq!(
        epi_s3_redis_context::GNOSTIC_SUBSTRATE_HIERARCHY,
        "{day}:{session}:{turn}:{coordinate}"
    );
    assert_eq!(
        RedisKey::semantic_retrieval_ref("graph-rev-17", "query-sha").as_str(),
        "cache:warm:s2:graph:semantic:retrieval:graph-rev-17:query-sha"
    );
}

#[test]
fn tiered_runtime_keys_round_trip_the_same_full_key_for_set_and_get() {
    let key = RedisKey::from_logical(
        CacheTier::Hot,
        "s3:gateway:temporal:session:20260608-120000-main:state",
    );

    assert_eq!(
        key.as_str(),
        "cache:hot:s3:gateway:temporal:session:20260608-120000-main:state"
    );
    assert_eq!(
        key.logical_key(),
        "s3:gateway:temporal:session:20260608-120000-main:state"
    );
    assert_eq!(key.tier(), CacheTier::Hot);
}
