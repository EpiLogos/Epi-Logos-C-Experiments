use std::path::Path;

use epi_s3_redis_context::{
    redisvl_service_script, redisvl_setup_script, RedisRuntimeRole, REDISVL_SERVICE_RELATIVE_PATH,
    REDISVL_SETUP_RELATIVE_PATH,
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
