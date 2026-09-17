pub const TEMPORAL_REDIS_NAMESPACE: &str = "s3:gateway:temporal";

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RedisTemporalContextRole {
    pub coordinate_owner: &'static str,
    pub redis_namespace: &'static str,
    pub ttl_seconds: u64,
    pub description: &'static str,
}

impl RedisTemporalContextRole {
    pub fn session_now() -> Self {
        Self {
            coordinate_owner: "S3",
            redis_namespace: TEMPORAL_REDIS_NAMESPACE,
            ttl_seconds: 300,
            description: "Redis temporal context for gateway sessions, NOW markdown, presence, and heartbeat state",
        }
    }

    pub fn session_now_key(&self, session_id: &str) -> String {
        format!(
            "cache:hot:{}:session:{}:now:md",
            self.redis_namespace, session_id
        )
    }

    pub fn day_context_key(&self, day_id: &str) -> String {
        format!("cache:warm:{}:day:{}:context", self.redis_namespace, day_id)
    }

    pub fn day_kairos_key(&self, day_id: &str) -> String {
        format!("cache:hot:{}:day:{}:kairos", self.redis_namespace, day_id)
    }

    pub fn session_kairos_key(&self, session_id: &str) -> String {
        format!(
            "cache:hot:{}:session:{}:kairos",
            self.redis_namespace, session_id
        )
    }

    pub fn personal_orientation_key(&self, anchor_id: &str) -> String {
        format!(
            "cache:hot:{}:personal:{}:orientation",
            self.redis_namespace, anchor_id
        )
    }

    pub fn agent_orientation_key(&self, agent_id: &str, session_id: &str) -> String {
        format!(
            "cache:hot:{}:agent:{}:session:{}:orientation",
            self.redis_namespace, agent_id, session_id
        )
    }
}
