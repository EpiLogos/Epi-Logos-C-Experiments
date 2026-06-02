mod support;

use serde_json::json;
use std::path::PathBuf;
use support::{TestEnv, TestGatewayClient};

fn repo_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .ancestors()
        .nth(4)
        .expect("epi-cli crate should live under Body/S/S0")
        .to_path_buf()
}

async fn connected_client(port: u16) -> TestGatewayClient {
    let env = TestEnv::with_fake_pi().with_env("EPI_REPO_ROOT", repo_root().display().to_string());
    let mut client = TestGatewayClient::connect(env, port).await;
    client
        .request("connect", json!({}))
        .await
        .expect("connect handshake should succeed");
    client
}

#[tokio::test]
async fn s4_prime_gateway_exposes_anima_pleroma_vak_and_orchestration_access() {
    let mut client = connected_client(18855).await;

    let vak_result = client
        .request(
            "s4'.vak.evaluate",
            json!({
                "task": "Implement the bounded Pleroma skill invocation proof",
            }),
        )
        .await
        .expect("VAK evaluation should be gateway-callable");

    assert_eq!(vak_result["owner"], "S4'");
    assert_eq!(vak_result["agent"], "anima");
    assert_eq!(vak_result["capability"]["plugin"], "pleroma");
    assert_eq!(vak_result["capability"]["skill"], "vak-evaluate");
    assert_eq!(vak_result["coordinates"]["cf"], "(4.0/1-4.4/5)");
    assert!(vak_result["capability"]["skillPath"]
        .as_str()
        .expect("skill path")
        .ends_with("Body/S/S4/plugins/pleroma/skills/vak-evaluate/SKILL.md"));
    assert_eq!(
        vak_result["authority"]["forbidden"][0],
        "resolve_epii_review_gate"
    );

    let orchestrate_result = client
        .request(
            "s4'.orchestrate",
            json!({
                "cf": "(0/1/2)",
                "task": "Write tests for the compiler gate",
            }),
        )
        .await
        .expect("orchestration should be gateway-callable");

    assert_eq!(orchestrate_result["owner"], "S4'");
    assert_eq!(orchestrate_result["agent"], "eros");
    assert_eq!(orchestrate_result["capability"]["plugin"], "pleroma");
    assert_eq!(
        orchestrate_result["capability"]["skill"],
        "anima-orchestration"
    );
    assert_eq!(orchestrate_result["authority"]["mayDepositToEpii"], true);
    assert_eq!(
        orchestrate_result["authority"]["mayResolveEpiiReview"],
        false
    );

    // Track-13.T6: assert the S4 authority-origin tag is stamped onto
    // every Anima adapter payload — proves S0 is mirroring S4 canon, not
    // acting as a second authority store.
    let origin_tag = vak_result["authority"]["s4AuthorityOrigin"]
        .as_str()
        .expect("s4AuthorityOrigin tag present on vak.evaluate");
    assert!(
        origin_tag.starts_with("Body/S/S4"),
        "authority origin must point at the S4 source tree, got: {origin_tag}"
    );
    let origin_tag_o = orchestrate_result["authority"]["s4AuthorityOrigin"]
        .as_str()
        .expect("s4AuthorityOrigin tag present on orchestrate");
    assert_eq!(origin_tag, origin_tag_o);
}

/// Track-13.T6: proves S0 rejects dispatch tools lacking upstream
/// `vak-evaluate` evidence while S4 (capability-matrix.json:dispatch_tools)
/// owns the rule source. The rejection happens at the S0 gateway edge
/// before the call reaches the S4 plugin, but the rule itself is the
/// `upstream_required: ["vak-evaluate"]` declaration on every entry in
/// `Body/S/S4/plugins/pleroma/capability-matrix.json:dispatch_tools`.
#[tokio::test]
async fn s0_mediation_adapter_rejects_dispatch_tools_without_upstream_vak_evidence() {
    let mut client = connected_client(18856).await;

    // Envelope with a dispatch tool BUT no upstreamEvidence/upstreamRequired.
    // Per the S4 capability-matrix.json contract, every dispatch_tool entry
    // declares `upstream_required: ["vak-evaluate"]` — the S0 adapter must
    // refuse to route this call.
    let result = client
        .request(
            "s4'.mediation.route",
            json!({
                "envelope": {
                    "taskText": "dispatch without VAK ground",
                    "artifactRefs": ["docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/13-s-sprime-modularity-and-s0-membrane-cleanup.md"],
                    "coordinateContext": { "source": "13.T6", "track": "13.T6" },
                    "declaredWriteScope": ["Body/S/S4/**"],
                    "actorRequest": { "actor": "admin", "intent": "test ungrounded dispatch" },
                    "sessionKey": "agent:anima:13t6",
                    "dayId": "2026-06-02",
                    "nowPath": "Idea/Empty/Present/02-06-2026/session/now.md",
                    "profileGeneration": 13,
                    "readinessSnapshot": { "status": "ready_public_current" },
                    "privacyClass": "public_runtime",
                    "requestedCapacityProfile": { "model": "gpt-5" },
                    "dispatchTool": "dispatch_agent",
                },
                "evaluatedVak": {
                    "cpf": "(4.0/1-4.4/5)",
                    "ct": ["CT4b"],
                    "cp": "CP4.4",
                    "cf": "(0/1)",
                    "cfp": "CFP0",
                    "cs": { "code": "CS0", "direction": "Day" },
                    "source": "s4'.vak.evaluate"
                }
                // NB: upstreamEvidence/upstreamRequired DELIBERATELY ABSENT
            }),
        )
        .await;

    let err = result.expect_err(
        "S0 adapter must reject dispatch_agent without upstream vak-evaluate evidence",
    );
    assert!(
        err.message.contains("upstream"),
        "rejection message must cite upstream evidence requirement; got: {}",
        err.message
    );
    assert!(
        err.message.contains("vak-evaluate"),
        "rejection message must cite vak-evaluate as the required upstream; got: {}",
        err.message
    );
}
