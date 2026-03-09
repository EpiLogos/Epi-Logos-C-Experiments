mod support;

use serde_json::json;
use support::{temp_env, TestGatewayClient};

#[tokio::test]
async fn connect_must_be_first_request() {
    let mut client = TestGatewayClient::connect(temp_env(), 8421).await;
    let err = client.request("chat.history", json!({})).await.unwrap_err();
    assert!(err.message.contains("connect"));
}
