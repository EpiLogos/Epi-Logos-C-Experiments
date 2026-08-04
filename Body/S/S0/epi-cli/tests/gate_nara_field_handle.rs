//! 25.T25.6 — `nara.field.handle` serves the OPAQUE psychoid-cymatic
//! renderer handle (DR-IG-6 / DR-M4-3): handle strings and digests only,
//! never renderer state, never a raw body. The profile digested is built
//! from the live spanda anchor the heartbeat installed — the same clock the
//! `profile.update` stream samples.

mod support;

use serde_json::json;
use support::TestGatewayClient;

#[tokio::test]
async fn field_handle_serves_the_opaque_dr_ig_6_handle_off_the_live_anchor() {
    let mut client = TestGatewayClient::connected_with_temp_store(18986).await;

    let reply = client
        .request("nara.field.handle", json!({}))
        .await
        .expect("nara.field.handle should be gateway-callable");

    assert_eq!(reply["contractVersion"], "psychoid-cymatic.handle.v1");
    assert_eq!(reply["geometryLaw"], "DR-IG-6");
    assert_eq!(reply["privacyClass"], "protected-local-handle-only");
    assert_eq!(reply["solverStrategy"], "option-f");
    assert_eq!(reply["sessionKey"], "agent:main:main");
    assert_eq!(reply["foregroundedHandle"], serde_json::Value::Null);

    let renderer = reply["rendererHandle"]
        .as_str()
        .expect("rendererHandle string");
    assert!(
        renderer.starts_with("psychoid-cymatic://renderer/dr-ig-6/option-f/"),
        "opaque scheme, got {renderer}"
    );
    let geometry = reply["geometryHandle"]
        .as_str()
        .expect("geometryHandle string");
    assert!(geometry.starts_with("psychoid-cymatic://geometry/dr-ig-6/"));

    // Handle-only law: digests cross, bodies do not. No key of the reply may
    // carry vertex arrays, quaternion components, or field bodies.
    let keys: Vec<&str> = reply
        .as_object()
        .unwrap()
        .keys()
        .map(String::as_str)
        .collect();
    for forbidden in [
        "vertices",
        "loci",
        "field",
        "qPersonal",
        "quaternion",
        "body",
    ] {
        assert!(
            !keys.iter().any(|k| k.eq_ignore_ascii_case(forbidden)),
            "reply must not carry '{forbidden}' — the handle is opaque"
        );
    }
    assert!(reply["tick"].is_u64() && reply["tick12"].is_u64());
}

#[tokio::test]
async fn field_handle_honours_and_polices_the_foregrounded_handle() {
    let mut client = TestGatewayClient::connected_with_temp_store(18987).await;

    // 25.17's three axes are the whole vocabulary.
    for name in ["qIdentityHandle", "qTransitHandle", "qActivityHandle"] {
        let reply = client
            .request("nara.field.handle", json!({ "foregroundedHandle": name }))
            .await
            .expect("a declared axis must be accepted");
        assert_eq!(reply["foregroundedHandle"], name);
    }

    let refused = client
        .request(
            "nara.field.handle",
            json!({ "foregroundedHandle": "qShadowHandle" }),
        )
        .await;
    assert!(
        refused.is_err(),
        "an undeclared axis must be refused, got {refused:?}"
    );
}
