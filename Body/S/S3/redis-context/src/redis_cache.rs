use redis::{aio::MultiplexedConnection, AsyncCommands, Client};

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

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct RedisKey {
    tier: CacheTier,
    logical_key: String,
    full_key: String,
}

impl RedisKey {
    fn from_full_key(full_key: impl Into<String>) -> Self {
        let full_key = full_key.into();
        let logical_key = full_key
            .strip_prefix("cache:")
            .unwrap_or(full_key.as_str())
            .to_owned();
        Self {
            tier: CacheTier::Active,
            logical_key,
            full_key,
        }
    }

    pub fn from_logical(tier: CacheTier, logical_key: impl Into<String>) -> Self {
        let logical_key = logical_key.into();
        let full_key = format!("{}:{}", tier.prefix(), logical_key);
        Self {
            tier,
            logical_key,
            full_key,
        }
    }

    pub fn session_now(session_id: &str) -> Self {
        Self::from_segments(
            CacheTier::Hot,
            "s3:gateway:temporal",
            &["session", session_id, "now", "md"],
        )
    }

    pub fn session_state(session_id: &str) -> Self {
        Self::from_segments(
            CacheTier::Hot,
            "s3:gateway:temporal",
            &["session", session_id, "state"],
        )
    }

    pub fn day_context(day_id: &str) -> Self {
        Self::from_segments(
            CacheTier::Warm,
            "s3:gateway:temporal",
            &["day", day_id, "context"],
        )
    }

    pub fn day_kairos(day_id: &str) -> Self {
        Self::from_segments(
            CacheTier::Hot,
            "s3:gateway:temporal",
            &["day", day_id, "kairos"],
        )
    }

    pub fn session_kairos(session_id: &str) -> Self {
        Self::from_segments(
            CacheTier::Hot,
            "s3:gateway:temporal",
            &["session", session_id, "kairos"],
        )
    }

    pub fn agent_orientation(agent_id: &str, session_id: &str) -> Self {
        Self::from_segments(
            CacheTier::Hot,
            "s3:gateway:temporal",
            &["agent", agent_id, "session", session_id, "orientation"],
        )
    }

    pub fn personal_orientation(anchor_id: &str) -> Self {
        Self::from_segments(
            CacheTier::Hot,
            "s3:gateway:temporal",
            &["personal", anchor_id, "orientation"],
        )
    }

    pub fn psyche_state(session_id: &str) -> Self {
        Self::from_segments(
            CacheTier::Active,
            "s3:gateway:psyche",
            &["session", session_id, "state"],
        )
    }

    pub fn kbase_ref(handle_id: &str) -> Self {
        Self::from_segments(CacheTier::Warm, "s5:kbase", &["ref", handle_id])
    }

    pub fn source_pool_ref(source_hash: &str) -> Self {
        Self::from_segments(CacheTier::Warm, "s5:source-pool", &["ref", source_hash])
    }

    pub fn coordinate_lookup_snapshot(graph_revision: &str, coordinate: &str) -> Self {
        Self::from_segments(
            CacheTier::Cold,
            "s2:coordinate",
            &["lookup", graph_revision, coordinate],
        )
    }

    pub fn semantic_retrieval_ref(graph_revision: &str, query_hash: &str) -> Self {
        Self::from_segments(
            CacheTier::Warm,
            "s2:graph:semantic",
            &["retrieval", graph_revision, query_hash],
        )
    }

    pub fn being_pattern_presence(entity_id: &str) -> Self {
        Self::from_segments(
            CacheTier::Live,
            "s3:being_pattern",
            &[entity_id, "presence"],
        )
    }

    pub fn being_pattern_state(entity_id: &str) -> Self {
        Self::from_segments(CacheTier::Active, "s3:being_pattern", &[entity_id, "state"])
    }

    pub fn being_pattern_stream_delta(generation: u64) -> Self {
        Self::from_full_key(format!("cache:stream:s3:being_pattern:{generation}:delta"))
    }

    pub fn being_pattern_review_candidate(candidate_id: &str) -> Self {
        Self::from_full_key(format!(
            "cache:review:s3:being_pattern:{candidate_id}:candidate"
        ))
    }

    pub fn aeon_eval_metric(
        day_id: &str,
        session_id: &str,
        turn_id: &str,
        coordinate: &str,
        metric: &str,
    ) -> Self {
        Self::from_segments(
            CacheTier::Hot,
            "epi",
            &[
                &sanitize_key_segment(day_id),
                &sanitize_key_segment(session_id),
                &sanitize_key_segment(turn_id),
                &sanitize_key_segment(coordinate),
                "eval",
                &sanitize_key_segment(metric),
            ],
        )
    }

    pub fn tier(&self) -> CacheTier {
        self.tier
    }

    pub fn logical_key(&self) -> &str {
        &self.logical_key
    }

    pub fn as_str(&self) -> &str {
        &self.full_key
    }

    fn from_segments(tier: CacheTier, namespace: &str, segments: &[&str]) -> Self {
        let mut logical_key = String::from(namespace);
        for segment in segments {
            logical_key.push(':');
            logical_key.push_str(segment);
        }
        Self::from_logical(tier, logical_key)
    }
}

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

pub struct RedisCache {
    conn: MultiplexedConnection,
}

impl RedisCache {
    pub async fn connect(config: &RedisConfig) -> Result<Self, redis::RedisError> {
        let client = Client::open(config.uri.as_str())?;
        let conn = client.get_multiplexed_async_connection().await?;
        Ok(Self { conn })
    }

    pub async fn health_check(&mut self) -> Result<bool, redis::RedisError> {
        let pong: String = redis::cmd("PING").query_async(&mut self.conn).await?;
        Ok(pong == "PONG")
    }

    pub async fn search_indexes(&mut self) -> Result<Vec<String>, redis::RedisError> {
        redis::cmd("FT._LIST").query_async(&mut self.conn).await
    }

    pub async fn get(&mut self, key: &str) -> Result<Option<String>, redis::RedisError> {
        self.conn.get(key).await
    }

    pub async fn get_key(&mut self, key: &RedisKey) -> Result<Option<String>, redis::RedisError> {
        self.get(key.as_str()).await
    }

    pub async fn set_tiered(
        &mut self,
        key: &str,
        value: &str,
        tier: CacheTier,
    ) -> Result<(), redis::RedisError> {
        self.set_key(&RedisKey::from_logical(tier, key), value)
            .await
    }

    pub async fn set_key(&mut self, key: &RedisKey, value: &str) -> Result<(), redis::RedisError> {
        self.conn
            .set_ex(key.as_str(), value, key.tier().ttl_seconds())
            .await
    }

    pub async fn set_with_ttl(
        &mut self,
        key: &str,
        value: &str,
        ttl_seconds: u64,
    ) -> Result<(), redis::RedisError> {
        self.conn.set_ex(key, value, ttl_seconds).await
    }

    pub async fn delete(&mut self, key: &str) -> Result<bool, redis::RedisError> {
        let count: i64 = self.conn.del(key).await?;
        Ok(count > 0)
    }

    pub async fn cache_coordinate(
        &mut self,
        bimba_coordinate: &str,
        json_value: &str,
        tier: CacheTier,
    ) -> Result<(), redis::RedisError> {
        let key = RedisKey::from_logical(
            tier,
            format!("s2:coordinate:lookup:legacy:{bimba_coordinate}"),
        );
        self.set_key(&key, json_value).await
    }

    pub async fn set_aeon_eval_records(
        &mut self,
        records: &[crate::AeonEvalRedisRecord],
    ) -> Result<(), redis::RedisError> {
        for record in records {
            self.set_key(&record.key, &record.value).await?;
        }
        Ok(())
    }
}

fn sanitize_key_segment(segment: &str) -> String {
    let sanitized = segment
        .chars()
        .map(|ch| match ch {
            ':' | '/' | '\\' | '\n' | '\r' | '\t' | ' ' => '_',
            _ => ch,
        })
        .collect::<String>();
    if sanitized.is_empty() {
        "unknown".to_owned()
    } else {
        sanitized
    }
}

#[cfg(test)]
mod tests {
    use super::*;

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
    }
}
