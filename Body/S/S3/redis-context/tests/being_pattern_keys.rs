use epi_s3_redis_context::RedisKey;

#[test]
fn being_pattern_keys_use_namespace_shaped_families() {
    assert_eq!(
        RedisKey::being_pattern_presence("entity:user").as_str(),
        "cache:live:s3:being_pattern:entity:user:presence"
    );
    assert_eq!(
        RedisKey::being_pattern_state("entity:user").as_str(),
        "cache:active:s3:being_pattern:entity:user:state"
    );
    assert_eq!(
        RedisKey::being_pattern_stream_delta(42).as_str(),
        "cache:stream:s3:being_pattern:42:delta"
    );
    assert_eq!(
        RedisKey::being_pattern_review_candidate("candidate-1").as_str(),
        "cache:review:s3:being_pattern:candidate-1:candidate"
    );
}
