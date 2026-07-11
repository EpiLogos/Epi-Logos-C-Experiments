//! CCT-16 (iii) — at-least-once provenance: delivery retries through
//! transient failures and succeeds on a later attempt; a permanently
//! unreachable endpoint dead-letters the event (append-only JSONL with
//! the idempotency key) instead of dropping it invisibly.

use std::io::{Read, Write};
use std::net::TcpListener;
use std::sync::atomic::{AtomicU32, Ordering};
use std::sync::Arc;

use epi_s3_graphiti_runtime::{deliver_provenance_to, provenance_from_record};

fn respond(mut stream: std::net::TcpStream, status_line: &str) {
    let mut buf = [0u8; 4096];
    let _ = stream.read(&mut buf);
    let _ = stream.write_all(format!("{status_line}\r\ncontent-length: 0\r\n\r\n").as_bytes());
}

fn block_on<F: std::future::Future>(future: F) -> F::Output {
    tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
        .expect("tokio runtime")
        .block_on(future)
}

#[test]
fn delivery_retries_through_transient_failures_and_succeeds() {
    let listener = TcpListener::bind("127.0.0.1:0").expect("bind mock endpoint");
    let base_url = format!("http://{}", listener.local_addr().unwrap());
    let hits = Arc::new(AtomicU32::new(0));

    let server_hits = hits.clone();
    std::thread::spawn(move || {
        for stream in listener.incoming().flatten() {
            let attempt = server_hits.fetch_add(1, Ordering::SeqCst) + 1;
            // First two attempts fail transiently; the third succeeds.
            let status = if attempt < 3 {
                "HTTP/1.1 500 Internal Server Error"
            } else {
                "HTTP/1.1 200 OK"
            };
            respond(stream, status);
            if attempt >= 3 {
                break;
            }
        }
    });

    let event = provenance_from_record(
        "session_start",
        "session-e2e",
        "agent:epii:main",
        Some("chat"),
        Some("11-07-2026"),
        None,
    );
    let delivered_on = block_on(deliver_provenance_to(&base_url, &event, 5, None))
        .expect("delivery must succeed within the retry budget");
    assert_eq!(delivered_on, 3, "two transient failures then success");
    assert_eq!(hits.load(Ordering::SeqCst), 3);
}

#[test]
fn permanent_failure_dead_letters_the_event_with_its_idempotency_key() {
    // A port with no listener: every attempt fails.
    let dead_dir = std::env::temp_dir().join(format!(
        "provenance-dead-letter-{}-{}",
        std::process::id(),
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_nanos()
    ));
    let event = provenance_from_record(
        "session_start",
        "session-dead",
        "agent:epii:main",
        Some("chat"),
        Some("11-07-2026"),
        None,
    );

    let error = block_on(deliver_provenance_to(
        "http://127.0.0.1:9",
        &event,
        2,
        Some(dead_dir.clone()),
    ))
    .expect_err("unreachable endpoint must dead-letter");
    assert!(error.contains("dead-lettered"), "{error}");

    let dead_letter = dead_dir.join(".provenance-dead-letter.jsonl");
    let contents = std::fs::read_to_string(&dead_letter).expect("dead-letter file written");
    let lines: Vec<&str> = contents.lines().collect();
    assert_eq!(lines.len(), 1, "append-only single record");
    let record: serde_json::Value = serde_json::from_str(lines[0]).unwrap();
    assert_eq!(record["event"]["session_id"], "session-dead");
    assert!(record["idempotencyKey"]
        .as_str()
        .unwrap()
        .starts_with("session-dead:session_start:"));
    assert!(record["lastError"].as_str().unwrap().len() > 0);

    std::fs::remove_dir_all(&dead_dir).ok();
}
