use redis::{aio::MultiplexedConnection, AsyncCommands, Client};

#[derive(Clone, Copy, Debug)]
pub enum CacheTier {
    Hot,  // TTL 300s — active graph retrieval artifacts
    Warm, // TTL 3600s — recent graph extractions
    Cold, // TTL 86400s — Bimba canonical forms
}

impl CacheTier {
    pub fn ttl_seconds(&self) -> u64 {
        match self {
            CacheTier::Hot => 300,
            CacheTier::Warm => 3600,
            CacheTier::Cold => 86400,
        }
    }

    pub fn prefix(&self) -> &'static str {
        match self {
            CacheTier::Hot => "cache:hot",
            CacheTier::Warm => "cache:warm",
            CacheTier::Cold => "cache:cold",
        }
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

    pub async fn set_tiered(
        &mut self,
        key: &str,
        value: &str,
        tier: CacheTier,
    ) -> Result<(), redis::RedisError> {
        let full_key = format!("{}:{}", tier.prefix(), key);
        self.conn.set_ex(&full_key, value, tier.ttl_seconds()).await
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

    pub async fn set_session_now(
        &mut self,
        session_id: &str,
        content: &str,
    ) -> Result<(), redis::RedisError> {
        let role = epi_s3_gateway_contract::RedisTemporalContextRole::session_now();
        let key = role.session_now_key(session_id);
        self.set_with_ttl(&key, content, role.ttl_seconds).await
    }

    pub async fn cache_coordinate(
        &mut self,
        bimba_coordinate: &str,
        json_value: &str,
        tier: CacheTier,
    ) -> Result<(), redis::RedisError> {
        let key = format!("coord:{}", bimba_coordinate);
        self.set_with_ttl(&key, json_value, tier.ttl_seconds())
            .await
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
