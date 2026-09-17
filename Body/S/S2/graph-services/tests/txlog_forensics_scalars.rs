//! Track 54 T54.01 — golden test for inline scalar decoding.
//!
//! Scalars are the bulk of the destroyed properties, and each type packs its
//! value into the block header differently: `LONG` has a flag bit choosing
//! between a 35-bit inlined value and a spilled second word, `BOOL` lives in a
//! single bit, `SHORT_STRING` is bit-packed through one of eleven codecs. Every
//! pair below is a real property block from the forensic log with the value
//! Neo4j's own `PropertyType.value(...)` produced from it.
//!
//! `TEMPORAL` is deliberately *not* claimed as decoded — see the final test.

#![cfg(feature = "txlog-forensics")]

use std::collections::BTreeMap;

use epi_s2_graph_services::txlog_forensics::value::{decode_block, PropertyValue};

const GOLDEN: &str = include_str!("fixtures/txlog_scalar_goldens.tsv");

fn rows() -> impl Iterator<Item = (&'static str, Vec<u64>, &'static str)> {
    GOLDEN.lines().filter(|l| !l.trim().is_empty()).map(|line| {
        let mut parts = line.splitn(3, '\t');
        let kind = parts.next().unwrap_or("");
        let words: Vec<u64> = parts
            .next()
            .unwrap_or("")
            .split(',')
            .map(|w| w.parse().expect("block word"))
            .collect();
        let expected = parts.next().unwrap_or("");
        (kind, words, expected)
    })
}

#[test]
fn inline_scalar_decoding_matches_neo4js_own_decoder() {
    let mut seen: BTreeMap<&str, usize> = BTreeMap::new();

    for (kind, words, expected) in rows() {
        if kind == "TEMPORAL" {
            continue; // covered by its own test below
        }
        let decoded = decode_block(&words, &[])
            .unwrap_or_else(|e| panic!("{kind} block {words:?} failed to decode: {e}"));
        *seen.entry(kind).or_default() += 1;

        let actual = match (&decoded.value, kind) {
            (PropertyValue::Bool(b), _) => b.to_string(),
            (PropertyValue::Int(i), _) => i.to_string(),
            // Java prints 0.5 as "0.5" and 0.0 as "0.0"; Rust's Debug matches.
            (PropertyValue::Float(f), _) => format!("{f:?}"),
            (PropertyValue::Text(t), _) => t.clone(),
            (other, _) => panic!("{kind}: unexpected decoded form {other:?}"),
        };

        assert_eq!(
            actual, expected,
            "{kind} block {words:?}: decoded {actual:?}, Neo4j says {expected:?}"
        );
    }

    println!("scalar goldens by type: {seen:?}");
    assert_eq!(seen.get("SHORT_STRING").copied().unwrap_or(0), 400);
    assert_eq!(seen.get("LONG").copied().unwrap_or(0), 35);
    assert_eq!(seen.get("DOUBLE").copied().unwrap_or(0), 18);
    assert_eq!(seen.get("INT").copied().unwrap_or(0), 6);
    assert_eq!(seen.get("BOOL").copied().unwrap_or(0), 4);
}

#[test]
fn long_covers_both_the_inlined_and_the_spilled_encoding() {
    // The 35-bit inline flag is the subtle one: reading it the wrong way makes
    // every large timestamp silently wrong rather than obviously broken.
    let mut inlined = 0;
    let mut spilled = 0;
    for (kind, words, _) in rows() {
        if kind != "LONG" {
            continue;
        }
        if words.len() > 1 {
            spilled += 1;
        } else {
            inlined += 1;
        }
    }
    assert!(inlined > 0, "golden set must exercise the inlined LONG encoding");
    assert!(spilled > 0, "golden set must exercise the spilled LONG encoding");
}

#[test]
fn temporal_is_preserved_verbatim_rather_than_claimed_as_decoded() {
    // T54.01 does not decode temporal values — the brief asks for short-string,
    // packed-array and dynamic-chain decoding, and stops there. What matters is
    // that they are carried losslessly rather than dropped, so T54.02 can
    // interpret them without going back to the log. Any silent loss here would
    // be invisible until a reconstructed node came out missing its timestamps.
    let mut checked = 0;
    for (kind, words, _) in rows() {
        if kind != "TEMPORAL" {
            continue;
        }
        let decoded = decode_block(&words, &[]).expect("temporal blocks still parse");
        match &decoded.value {
            PropertyValue::Unsupported { kind, blocks } => {
                assert_eq!(*kind, "TEMPORAL");
                assert_eq!(blocks, &words, "raw words must survive intact");
            }
            other => panic!("expected preserved TEMPORAL, got {other:?}"),
        }
        checked += 1;
    }
    assert_eq!(checked, 6, "temporal goldens exercised");
}
