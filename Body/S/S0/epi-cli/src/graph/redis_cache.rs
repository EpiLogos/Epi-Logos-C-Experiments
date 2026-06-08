// DEPRECATED: Redis access now canonical through S3 gateway
// (Body/S/S3/gateway/src/session_store.rs). The gateway owns session-state
// persistence with tiered caching (Hot/Warm/Cold).
//
// Direct CLI Redis access is retained for backward compatibility with
// graph/dev.rs which still consumes these types. Migration path:
// graph/dev.rs should route through gateway RPC instead.
//
// When graph/dev.rs is migrated, remove this file and the
// epi-s3-redis-context dependency from the CLI Cargo.toml.
pub use epi_s3_redis_context::{CacheTier, RedisCache, RedisConfig};
