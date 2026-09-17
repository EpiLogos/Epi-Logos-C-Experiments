//! Track 54 T54.01 — golden test for inline node-label unpacking.
//!
//! A node's labels are packed into the 40-bit `labelField` of its record rather
//! than stored separately, so getting the bit layout wrong would silently
//! mislabel every recovered node — including which ones are `:Bimba`, the exact
//! set the wipe destroyed. The census test proves the *framing* is right; this
//! proves the *unpacking* is.
//!
//! The fixture is every distinct `labelField` value appearing in the real
//! forensic log (284 of them), each paired with the label set that Neo4j's own
//! `InlineNodeLabels` decodes from it. It is ground truth from the vendor's
//! implementation, not this decoder's own output blessed as correct, and it
//! needs no access to the forensic archive — so it runs in the normal suite.

#![cfg(feature = "txlog-forensics")]

use epi_s2_graph_services::txlog_forensics::record::NodeRecord;

const GOLDEN: &str = include_str!("fixtures/txlog_inline_label_fields.tsv");

#[test]
fn inline_label_unpacking_matches_neo4js_own_decoder() {
    let mut checked = 0usize;
    let mut multi_label = 0usize;

    for (lineno, line) in GOLDEN.lines().enumerate() {
        if line.trim().is_empty() {
            continue;
        }
        let (field_text, labels_text) = line.split_once('\t').unwrap_or((line, ""));
        let label_field: i64 = field_text
            .trim()
            .parse()
            .unwrap_or_else(|e| panic!("line {}: bad labelField {field_text:?}: {e}", lineno + 1));

        let expected: Vec<u32> = labels_text
            .trim()
            .split(',')
            .filter(|s| !s.is_empty())
            .map(|s| s.parse().expect("label id"))
            .collect();

        let node = NodeRecord { label_field, ..Default::default() };
        let actual = node
            .inline_labels()
            .unwrap_or_else(|| panic!("line {}: field {label_field} read as dynamic, but Neo4j decoded it inline", lineno + 1));

        assert_eq!(
            actual,
            expected,
            "line {}: labelField {label_field} unpacked to {actual:?}, Neo4j says {expected:?}",
            lineno + 1
        );

        if expected.len() > 1 {
            multi_label += 1;
        }
        checked += 1;
    }

    assert_eq!(checked, 284, "the whole golden table must be exercised");
    assert!(
        multi_label >= 160,
        "multi-label packings are where the bit layout actually matters; only {multi_label} covered"
    );
}

#[test]
fn a_dynamic_label_field_is_reported_as_dynamic_not_mis_unpacked() {
    // Bit 39 set => the body is a pointer into the dynamic label store, and
    // there are no inline labels to read.
    let node = NodeRecord { label_field: 0x80_0000_0000u64 as i64, ..Default::default() };
    assert!(node.inline_labels().is_none());
}
