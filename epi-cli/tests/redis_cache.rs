use epi_logos::graph::redis_cache::{CacheTier, RedisCache, RedisConfig};

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
async fn test_redis_session_now() {
    let config = RedisConfig::from_env();
    let mut cache = RedisCache::connect(&config).await.unwrap();

    cache
        .set_session_now("test-session-123", "# NOW\nTest content")
        .await
        .unwrap();

    let val = cache.get("session:test-session-123:now:md").await.unwrap();
    assert!(val.is_some());

    // Cleanup
    cache
        .delete("session:test-session-123:now:md")
        .await
        .unwrap();
}

#[tokio::test]
#[ignore]
async fn test_redis_coordinate_cache() {
    let config = RedisConfig::from_env();
    let mut cache = RedisCache::connect(&config).await.unwrap();

    cache
        .cache_coordinate("#4", r#"{"name":"Context","family":"NONE"}"#, CacheTier::Warm)
        .await
        .unwrap();

    let val = cache.get("coord:#4").await.unwrap();
    assert!(val.is_some());

    // Cleanup
    cache.delete("coord:#4").await.unwrap();
}
