//! Live-gateway contemplation surface test (S0 side — companion to
//! `Body/S/S3/gateway/tests/contemplation_rpc_dispatches.rs`).
//!
//! The S3 companion file is a *pure-helper* test: it hands a hand-built
//! `ContemplationObject { deterministic_mock: true, .. }` to the
//! `epi_s3_gateway::dispatch::contemplate_session_close` function and asserts
//! the composed `wisdom_delta` / triplet. That function is never reached over a
//! WebSocket — no live surface drives it. It also asserts the *route law* via
//! `classify_method`, which is genuine (the S3 route table recognises the
//! method), but route recognition is not the same as an executable adapter.
//!
//! This test closes that gap by driving `nara.contemplate_session_close` over
//! the ACTUAL gateway WebSocket dispatch loop (the same `TestGatewayClient`
//! harness `gate_chat.rs` / `gate_runtime_handler_owner.rs` use). It pins the
//! honest live state per `dispatch.rs:160` ("It remains a Nara extension route,
//! so the gateway can expose the surface without expanding the product method
//! table before the upstream S0/S4/S5 executors land their live adapters"):
//!
//!   * The `nara.*` extension route is genuinely live — a KNOWN-wired sibling
//!     (`nara.session_open`) returns its real protein-handle envelope through
//!     the same dispatch loop, so a failure here is "gateway down", never a
//!     false green.
//!   * `nara.contemplate_session_close` has NO executable in-process adapter in
//!     the S0 gateway yet, so the live surface returns the honest
//!     `unimplemented` error — it can NEVER emit the synthetic `wisdom_delta`
//!     the S3 pure-helper test composes. That is the fake this sweep removes.
//!
//! If the day arrives that an S0/S4/S5 executor wires this method, THIS test
//! must be converted from an Err-expectation into a real success-envelope
//! assertion over the live surface (drive it, read the wisdom_delta the wire
//! actually returns) — do not delete it back into a pure-helper unit test.

mod support;

use epi_s3_gateway::dispatch::{
    classify_method, GatewayDispatchClass, GatewayDispatchOwner, CONTEMPLATE_SESSION_CLOSE_METHOD,
};
use serde_json::json;
use support::TestGatewayClient;

#[tokio::test]
async fn contemplation_close_over_live_gateway_has_no_executable_adapter_yet() {
    let mut client = TestGatewayClient::connected_with_temp_store(18941).await;

    // ── Liveness anchor ──────────────────────────────────────────────────
    // A genuinely-wired `nara.*` extension method must return its real
    // envelope over the live WS dispatch loop. This proves the gateway is up
    // AND the `nara.*` extension route (dispatch_nara) is serving — so the
    // unimplemented result below is "adapter not landed", not "gateway dead".
    // route_nara_session_open is pure (portal_core LUT + request fields), so
    // this needs no vault/graph preconditions.
    let opened = client
        .request(
            "nara.session_open",
            json!({ "session_id": "contemplation-live-probe", "kairos": 1_700_000_000_000u64 }),
        )
        .await
        .expect("nara.session_open must dispatch live over the nara extension route");
    assert_eq!(
        opened["ok"], true,
        "live nara.session_open must return a real protein-handle envelope"
    );
    assert!(
        opened["protein_handle"].as_str().is_some_and(
            |handle| handle.starts_with("m4-protein://session/contemplation-live-probe/")
        ),
        "live nara.session_open must mint the real m4-protein handle, got {:?}",
        opened["protein_handle"]
    );
    assert!(
        opened["start_codon"].is_number(),
        "live nara.session_open must carry a real start_codon"
    );

    // ── Route law (S3 table) ─────────────────────────────────────────────
    // The S3 route table recognises the contemplation method as a Nara
    // extension owned by the S4/S5 domain adapter. Recognition is real; an
    // executable adapter is not — the two together are the honest whole.
    let route = classify_method(CONTEMPLATE_SESSION_CLOSE_METHOD)
        .expect("contemplation close must classify as a routed nara extension method");
    assert_eq!(route.owner, GatewayDispatchOwner::S4S5DomainAdapter);
    assert_eq!(route.class, GatewayDispatchClass::NaraExtension);
    assert_eq!(route.coordinate_owner, "M4'/S4");
    assert_eq!(route.agent_access_owner, "S4/S5");

    // ── The contemplation close, driven over the REAL WebSocket ──────────
    // Sent with a real contemplation payload (session_id + non-empty
    // trajectory + engaged coordinates — the shape the pure helper requires),
    // so if/when an adapter lands, the drive is already well-formed.
    let result = client
        .request(
            CONTEMPLATE_SESSION_CLOSE_METHOD,
            json!({
                "session_id": "contemplation-live-probe",
                "q_nara": "q_Nara",
                "engaged_coordinates": [
                    { "coordinate": "M3.COMP", "target_resonance_vector": [0.2, 0.4, 0.6] }
                ],
                "trajectory": [
                    { "tick_id": "t0", "gauge": "COMP", "actual_resonance": [0.2, 0.4, 0.6], "codon": "I" }
                ]
            }),
        )
        .await;

    let error = result.expect_err(
        "the live S0 gateway has NO executable contemplate_session_close adapter yet — \
         it must NOT fabricate the synthetic contemplation envelope the S3 pure-helper test composes",
    );

    // Routed through the nara extension dispatcher (dispatch_nara), not a
    // generic unknown-method 404: the error names the method and reports it as
    // an unimplemented nara method.
    assert!(
        error.message.contains(CONTEMPLATE_SESSION_CLOSE_METHOD),
        "unimplemented error must name the contemplation method, got: {}",
        error.message
    );
    assert!(
        error.message.contains("not a known nara method"),
        "live surface must report the contemplation method has no executable adapter, got: {}",
        error.message
    );

    // Anti-fake core: the real surface can never emit the synthetic wisdom
    // delta the S3 pure-helper composes from a deterministic_mock object.
    assert!(
        !error.message.contains("4'-5'-0'") && !error.message.contains("gauge-trio"),
        "live surface must not surface the synthetic wisdom_delta tokens, got: {}",
        error.message
    );
}
