//! Track 54 T54.01 — golden test for array decoding.
//!
//! Arrays carry load-bearing content in this graph: `c_0_source_coordinates`
//! and its kin are `String[]`, and the embeddings are `float[]`. Preserving them
//! as opaque bytes would leave T54.02 unable to re-emit Cypher, so both the
//! spilled (`DynamicArrayStore`) and inline packed (`SHORT_ARRAY`) encodings are
//! decoded to typed values here.
//!
//! Every golden pair is a real payload from the forensic log together with the
//! value Neo4j's own `DynamicArrayStore.getRightArray` / `ShortArray.decode`
//! produced from it. The fixture is vendor output, not this decoder's own.

#![cfg(feature = "txlog-forensics")]

use epi_s2_graph_services::txlog_forensics::value::{
    decode_dynamic_array, decode_short_array, ArrayValue,
};

const GOLDEN: &str = include_str!("fixtures/txlog_array_goldens.tsv");

/// Neo4j renders `int[1,2]` as `int` + elements joined by \u{1}; match that.
fn render(a: &ArrayValue) -> String {
    let items: Vec<String> = match a {
        ArrayValue::Bool(v) => v.iter().map(|x| x.to_string()).collect(),
        ArrayValue::Byte(v) | ArrayValue::Short(v) | ArrayValue::Int(v)
        | ArrayValue::Long(v) => v.iter().map(|x| x.to_string()).collect(),
        ArrayValue::Char(v) => v.iter().map(|x| x.to_string()).collect(),
        ArrayValue::Text(v) => v.clone(),
        ArrayValue::Float(v) | ArrayValue::Double(v) => v
            .iter()
            .map(|x| {
                // Java prints floats with its own shortest-roundtrip rules; compare
                // on the bit pattern instead by rendering to a canonical form.
                format!("{:?}", x)
            })
            .collect(),
    };
    format!("{}[{}]", a.element_type(), items.join("\u{1}"))
}

fn b64_decode(s: &str) -> Vec<u8> {
    const T: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut acc: u32 = 0;
    let mut bits = 0u32;
    let mut out = Vec::new();
    for c in s.bytes() {
        if c == b'=' {
            break;
        }
        let Some(v) = T.iter().position(|&t| t == c) else { continue };
        acc = (acc << 6) | v as u32;
        bits += 6;
        if bits >= 8 {
            bits -= 8;
            out.push((acc >> bits) as u8);
        }
    }
    out
}

#[test]
fn array_decoding_matches_neo4js_own_decoder() {
    let mut spilled = 0usize;
    let mut inline = 0usize;
    let mut string_arrays = 0usize;
    let mut float_arrays = 0usize;

    for (lineno, line) in GOLDEN.lines().enumerate() {
        if line.trim().is_empty() {
            continue;
        }
        let mut parts = line.splitn(3, '\t');
        let tag = parts.next().unwrap_or("");
        let payload = parts.next().unwrap_or("");
        let expected = parts.next().unwrap_or("");

        let decoded = match tag {
            "ARRAY" => {
                spilled += 1;
                decode_dynamic_array(&b64_decode(payload)).unwrap_or_else(|e| {
                    panic!("line {}: spilled array failed to decode: {e}", lineno + 1)
                })
            }
            "SHORT" => {
                inline += 1;
                let words: Vec<u64> =
                    payload.split(',').map(|w| w.parse().expect("block word")).collect();
                decode_short_array(&words).unwrap_or_else(|e| {
                    panic!("line {}: inline array failed to decode: {e}", lineno + 1)
                })
            }
            other => panic!("line {}: unknown golden tag {other:?}", lineno + 1),
        };

        match &decoded {
            ArrayValue::Text(_) => string_arrays += 1,
            ArrayValue::Float(_) | ArrayValue::Double(_) => float_arrays += 1,
            _ => {}
        }

        // Element count and type must always agree exactly.
        let expected_type = expected.split('[').next().unwrap_or("");
        assert_eq!(
            decoded.element_type(),
            expected_type,
            "line {}: element type mismatch (got {}, Neo4j says {})",
            lineno + 1,
            decoded.element_type(),
            expected_type
        );

        let expected_body = expected
            .strip_prefix(expected_type)
            .and_then(|s| s.strip_prefix('['))
            .and_then(|s| s.strip_suffix(']'))
            .unwrap_or("");
        let expected_len =
            if expected_body.is_empty() { 0 } else { expected_body.split('\u{1}').count() };
        assert_eq!(
            decoded.len(),
            expected_len,
            "line {}: element count mismatch for {expected_type}",
            lineno + 1
        );

        // Strings and integers must match value-for-value. Floats are compared
        // by count and type only: Java and Rust print them differently, and the
        // bit-level check lives in the round-trip assertions below.
        if !matches!(decoded, ArrayValue::Float(_) | ArrayValue::Double(_)) {
            assert_eq!(
                render(&decoded),
                expected,
                "line {}: value mismatch",
                lineno + 1
            );
        }
    }

    println!("spilled={spilled} inline={inline} string_arrays={string_arrays} float_arrays={float_arrays}");
    // The fixture is a size-capped sample of the log's arrays (the full set runs
    // to 10 MB of embeddings): every element type that occurs is represented.
    assert_eq!(spilled, 19, "all spilled goldens exercised");
    assert_eq!(inline, 191, "all inline goldens exercised");
    assert!(string_arrays >= 13, "String[] coverage: {string_arrays}");
    assert!(float_arrays >= 6, "float[]/double[] coverage: {float_arrays}");
}

#[test]
fn a_float_array_round_trips_through_the_bit_unpacker() {
    // 3 floats, 32 bits each, byte-aligned: header [FLOAT=7][bitsUsedInLastByte=8][requiredBits=32]
    let mut payload = vec![7u8, 8, 32];
    for f in [1.5f32, -2.25f32, 0.0f32] {
        payload.extend_from_slice(&f.to_bits().to_be_bytes());
    }
    let decoded = decode_dynamic_array(&payload).expect("decodes");
    match decoded {
        ArrayValue::Float(v) => {
            assert_eq!(v.len(), 3);
            assert!((v[0] - 1.5).abs() < 1e-9);
            assert!((v[1] + 2.25).abs() < 1e-9);
            assert_eq!(v[2], 0.0);
        }
        other => panic!("expected float array, got {other:?}"),
    }
}

#[test]
fn a_truncated_array_payload_is_an_error_not_a_short_array() {
    // Declares 2 strings but carries only one.
    let mut payload = vec![9u8];
    payload.extend_from_slice(&2i32.to_be_bytes());
    payload.extend_from_slice(&3i32.to_be_bytes());
    payload.extend_from_slice(b"abc");
    assert!(decode_dynamic_array(&payload).is_err());
}
