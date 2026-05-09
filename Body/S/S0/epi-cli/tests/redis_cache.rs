use epi_logos::graph::redis_cache::{CacheTier, RedisCache, RedisConfig};
use epi_s3_gateway_contract::RedisTemporalContextRole;

#[test]
fn test_cache_tier_ttls() {
    assert_eq!(CacheTier::Hot.ttl_seconds(), 300);
    assert_eq!(CacheTier::Warm.ttl_seconds(), 3600);
    assert_eq!(CacheTier::Cold.ttl_seconds(), 86400);
}

#[test]
fn test_cache_tier_prefixes() {
    assert_eq!(CacheTier::Hot.prefix(), "cache:hot");
    assert_eq!(CacheTier::Warm.prefix(), "cache:warm");
    assert_eq!(CacheTier::Cold.prefix(), "cache:cold");
}

#[test]
fn session_now_redis_key_is_s3_temporal_context_not_graph_cache() {
    let role = RedisTemporalContextRole::session_now();

    assert_eq!(
        role.session_now_key("test-session-123"),
        "s3:gateway:temporal:session:test-session-123:now:md"
    );
    assert_eq!(
        role.day_context_key("07-05-2026"),
        "s3:gateway:temporal:day:07-05-2026:context"
    );
    assert_eq!(
        role.agent_orientation_key("epii", "test-session-123"),
        "s3:gateway:temporal:agent:epii:session:test-session-123:orientation"
    );
    assert_eq!(role.ttl_seconds, CacheTier::Hot.ttl_seconds());
}

#[tokio::test]
#[ignore] // requires Docker
async fn test_redis_connect_and_health() {
    let config = RedisConfig::from_env();
    let mut cache = RedisCache::connect(&config).await.unwrap();
    assert!(cache.health_check().await.unwrap());
}

#[tokio::test]
#[ignore]
async fn test_redis_tiered_set_get() {
    let config = RedisConfig::from_env();
    let mut cache = RedisCache::connect(&config).await.unwrap();

    cache
        .set_tiered("test:coord", r#"{"name":"Ground"}"#, CacheTier::Cold)
        .await
        .unwrap();

    let val: Option<String> = cache.get("cache:cold:test:coord").await.unwrap();
    assert!(val.is_some());
    assert_eq!(val.unwrap(), r#"{"name":"Ground"}"#);

    // Cleanup
    cache.delete("cache:cold:test:coord").await.unwrap();
}

#[tokio::test]
#[ignore]
async fn test_redis_coordinate_cache() {
    let config = RedisConfig::from_env();
    let mut cache = RedisCache::connect(&config).await.unwrap();

    cache
        .cache_coordinate(
            "#4",
            r#"{"name":"Context","family":"NONE"}"#,
            CacheTier::Warm,
        )
        .await
        .unwrap();

    let val = cache.get("coord:#4").await.unwrap();
    assert!(val.is_some());

    // Cleanup
    cache.delete("coord:#4").await.unwrap();
}
