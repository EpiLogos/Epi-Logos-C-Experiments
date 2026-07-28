use redis::{aio::MultiplexedConnection, AsyncCommands, Client};

// Track 53 T53.06: the tier vocabulary and the connection descriptor are the
// shared S2↔S3 substrate facts and now live at `epi_kernel_contract::
// redis_residency`. `RedisKey` and `RedisCache` — the S3′ key semantics and
// the live client — stay here.
pub use epi_kernel_contract::redis_residency::{CacheTier, RedisConfig};

/// 12.T12.2 (d), DR-S5-ONE-1: the mandated hierarchical layout for
/// gnostic-substrate keys. `{day}:{session}:{turn}:{coordinate}` LEADS the
/// key segments so session-start cache warming (`{day}:{session}:*`),
/// turn-scoped evidence aggregation (`{day}:{session}:{turn}:*`), and
/// coordinate-conditional dispatch reads all stay prefix SCANs. No
/// gnostic-substrate key may be flat-namespaced.
pub const GNOSTIC_SUBSTRATE_HIERARCHY: &str = "{day}:{session}:{turn}:{coordinate}";

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

    /// 12.T12.2 (d): coordinate snapshot under the mandated
    /// [`GNOSTIC_SUBSTRATE_HIERARCHY`] — day/session/turn/coordinate lead
    /// the key, the lookup leaf and graph revision trail it.
    pub fn coordinate_lookup_snapshot(
        graph_revision: &str,
        day: &str,
        session: &str,
        turn: &str,
        coordinate: &str,
    ) -> Self {
        Self::from_segments(
            CacheTier::Cold,
            "s2:coordinate",
            &[day, session, turn, coordinate, "lookup", graph_revision],
        )
    }

    /// Generic gnostic-substrate key under [`GNOSTIC_SUBSTRATE_HIERARCHY`].
    pub fn gnostic_substrate(
        tier: CacheTier,
        day: &str,
        session: &str,
        turn: &str,
        coordinate: &str,
        leaf: &str,
    ) -> Self {
        Self::from_segments(tier, "s5:gnostic", &[day, session, turn, coordinate, leaf])
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
    #[ignore = "live-infra: requires running Redis (RedisConfig::from_env)"]
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
