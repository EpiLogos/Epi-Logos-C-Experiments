//! 12.T12.19: aletheia_veto_log persistence contract (host side).
//!
//! The veto primitive's persistence law: a facet veto reaches the
//! epi-spacetime-module `publish_aletheia_veto` reducer with the ten
//! arguments in the module's exact order, and the required identity
//! fields (veto_id, installation_id, gateway_id, session_key, facet)
//! are refused empty host-side before any wire attempt — mirroring the
//! reducer's own assert_nonempty set. Synthesis-blocking and the
//! miscalibration threshold live in gateway-contract::aletheia; this
//! test covers only the wire persistence seam.

use std::io::{Read, Write};
use std::net::TcpListener;
use std::thread;

use epi_s3_gateway::spacetime::SpacetimePresence;

/// Accept exactly one HTTP request, return (request_line, body), reply 200.
fn capture_one_request(listener: TcpListener) -> thread::JoinHandle<(String, String)> {
    thread::spawn(move || {
        let (mut stream, _) = listener.accept().expect("accept reducer call");
        let mut buf = Vec::new();
        let mut chunk = [0u8; 4096];
        loop {
            let n = stream.read(&mut chunk).expect("read request");
            buf.extend_from_slice(&chunk[..n]);
            let text = String::from_utf8_lossy(&buf);
            if let Some(header_end) = text.find("\r\n\r\n") {
                let content_length = text
                    .lines()
                    .find_map(|line| {
                        let (name, value) = line.split_once(':')?;
                        name.eq_ignore_ascii_case("content-length")
                            .then(|| value.trim().parse::<usize>().ok())?
                    })
                    .unwrap_or(0);
                if buf.len() >= header_end + 4 + content_length {
                    break;
                }
            }
            if n == 0 {
                break;
            }
        }
        stream
            .write_all(b"HTTP/1.1 200 OK\r\ncontent-length: 0\r\n\r\n")
            .expect("write response");
        let text = String::from_utf8_lossy(&buf).to_string();
        let request_line = text.lines().next().unwrap_or_default().to_owned();
        let body = text
            .split("\r\n\r\n")
            .nth(1)
            .unwrap_or_default()
            .to_owned();
        (request_line, body)
    })
}

#[test]
fn aletheia_veto_log_persists() {
    let listener = TcpListener::bind("127.0.0.1:0").expect("bind capture listener");
    let addr = listener.local_addr().expect("local addr");
    let capture = capture_one_request(listener);

    let client = SpacetimePresence::for_database(&format!("http://{addr}"), "epi-logos-runtime");
    client
        .publish_aletheia_veto(
            "veto-20260714-0001",
            "install-veto-test",
            "gateway-veto-test",
            "agent:anima:main",
            "dispatch-42",
            "janus",
            "prospective read forced onto a retrospective seam",
            "the session's closing face — what perishes today",
            0.3,
            "defer",
        )
        .expect("veto publish succeeds against capture listener");

    let (request_line, body) = capture.join().expect("capture thread");
    assert!(
        request_line.starts_with("POST /v1/database/epi-logos-runtime/call/publish_aletheia_veto"),
        "reducer path drifted: {request_line}"
    );
    // The ten args in the module reducer's exact positional order.
    let args: serde_json::Value = serde_json::from_str(&body).expect("json body");
    assert_eq!(
        args,
        serde_json::json!([
            "veto-20260714-0001",
            "install-veto-test",
            "gateway-veto-test",
            "agent:anima:main",
            "dispatch-42",
            "janus",
            "prospective read forced onto a retrospective seam",
            "the session's closing face — what perishes today",
            0.3f32, // widened f32→f64 on the wire, exactly as the client sends it
            "defer",
        ])
    );
}

#[test]
fn veto_publish_refuses_empty_identity_fields_before_any_wire_attempt() {
    // Unroutable port: reaching the wire would produce a connection error,
    // not a field-name error — so a field-name error proves the host-side
    // refusal fired first.
    let client = SpacetimePresence::for_database("http://127.0.0.1:1", "epi-logos-runtime");
    for (field, veto_id, facet, session_key) in [
        ("veto_id", "", "janus", "agent:anima:main"),
        ("facet", "veto-1", "", "agent:anima:main"),
        ("session_key", "veto-1", "janus", ""),
    ] {
        let err = client
            .publish_aletheia_veto(
                veto_id,
                "install",
                "gateway",
                session_key,
                "dispatch-1",
                facet,
                "reason",
                "missed",
                0.5,
                "re-dispatch",
            )
            .expect_err("empty required field must refuse");
        assert!(err.contains(field), "error {err:?} must name {field}");
    }
}
