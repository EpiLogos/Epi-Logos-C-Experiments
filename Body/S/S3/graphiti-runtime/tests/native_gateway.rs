use epi_s3_graphiti_runtime::{session_memory_deposit, session_memory_search};
use serde_json::json;

fn block_on<F: std::future::Future>(future: F) -> F::Output {
    tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
        .expect("tokio runtime")
        .block_on(future)
}

#[test]
fn native_gateway_deposit_and_scoped_search_need_no_sidecar() {
    block_on(async {
        let session_key = "native-gateway-session";
        let token = "NativeGraphitiGatewayProof";
        let deposit = session_memory_deposit(&json!({
            "content": format!("Persist {token} through the native Graphiti gateway."),
            "sourceAgent": "epii",
            "sessionKey": session_key,
            "namespaceRef": "pratibimba-native-gateway",
            "dayId": "18-07-2026",
        }))
        .await
        .expect("native deposit should succeed without an HTTP runtime");
        assert_eq!(deposit["adapter"], "native-library");
        assert_eq!(deposit["runtimeAvailable"], true);

        let search = session_memory_search(&json!({
            "query": token,
            "agentId": "epii",
            "sessionKey": session_key,
            "namespaceRef": "pratibimba-native-gateway",
            "dayId": "18-07-2026",
        }))
        .await
        .expect("native search should succeed without an HTTP runtime");
        assert_eq!(search["adapter"], "native-library");
        assert!(
            search["results"].to_string().contains(token),
            "native search must recall the deposited token: {search}"
        );
    });
}

#[test]
fn native_gateway_search_does_not_return_another_sessions_episode() {
    block_on(async {
        let token = "NativeGraphitiSessionBoundaryProof";
        session_memory_deposit(&json!({
            "content": format!("Persist {token} only for session alpha."),
            "sourceAgent": "epii",
            "sessionKey": "native-gateway-alpha",
            "namespaceRef": "pratibimba-native-gateway",
            "dayId": "18-07-2026",
        }))
        .await
        .expect("alpha deposit should succeed");

        let search = session_memory_search(&json!({
            "query": token,
            "agentId": "epii",
            "sessionKey": "native-gateway-beta",
            "namespaceRef": "pratibimba-native-gateway",
            "dayId": "18-07-2026",
        }))
        .await
        .expect("native search should succeed");
        assert_eq!(search["results"]["episodes"], json!([]));
        assert_eq!(search["results"]["entities"], json!([]));
    });
}
