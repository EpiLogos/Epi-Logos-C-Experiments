use epi_s3_gateway::protocol::{connect_result, error, hello_ok, success};
use serde_json::json;

#[test]
fn gateway_protocol_frames_are_s3_owned_and_match_contract_constants() {
    let hello = hello_ok();
    assert_eq!(hello.kind, "hello-ok");
    assert_eq!(hello.protocol, epi_s3_gateway_contract::PROTOCOL_VERSION);
    assert!(hello.features.methods.contains(&"connect"));
    assert!(hello.features.events.contains(&"heartbeat"));

    let connect = connect_result();
    assert_eq!(connect["ok"], true);
    assert_eq!(
        connect["protocol"],
        epi_s3_gateway_contract::PROTOCOL_VERSION
    );
}

#[test]
fn gateway_response_frames_preserve_product_rpc_shape() {
    let ok = success(7, json!({"done": true}));
    assert_eq!(ok.kind, "res");
    assert_eq!(ok.id, 7);
    assert_eq!(ok.result.unwrap()["done"], true);
    assert!(ok.error.is_none());

    let err = error(8, "bad-request", "missing sessionKey");
    assert_eq!(err.kind, "res");
    assert_eq!(err.id, 8);
    assert_eq!(err.error.unwrap().code, "bad-request");
    assert!(err.result.is_none());
}
