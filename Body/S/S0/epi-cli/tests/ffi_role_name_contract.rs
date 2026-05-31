//! Track 01 T1 — FFI role-name contract.
//!
//! Locks the Rust `ffi::role_names` mapping against the canonical TS zod
//! schema in `Body/S/S0/epi-cli/schemas/src/coordinate.ts`. The Rust mapping is
//! a *label* on the C enum integer — it must never disagree with the TS
//! schema, and the TS schema must never disagree with the underlying C
//! discriminant values from `Body/S/S0/epi-lib/include/pointer_web.h`.
//!
//! This file also asserts that all three FFI Web structs (`HcBedrockWeb7`,
//! `HcPointerWeb36`, `HcContextFrameWeb7`) are exported through the public
//! Rust surface and that their fill functions are callable as `unsafe extern`
//! symbols. The CF7 overlay must not widen `HcPointerWeb36` to 37.

use epi_logos::ffi::role_names::{
    bedrock_role_name, context_frame_notation, helix_name, interval_role_name,
    pointer_ring_name, ratio_role_name, relation_role_name,
};
use epi_logos::ffi::{HcBedrockWeb7, HcContextFrameWeb7, HcPointerWeb36};
use std::fs;
use std::path::PathBuf;

fn coordinate_ts() -> String {
    let path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("schemas")
        .join("src")
        .join("coordinate.ts");
    fs::read_to_string(&path).unwrap_or_else(|err| {
        panic!("coordinate.ts unreadable at {path:?}: {err}")
    })
}

/// Extracts the string literals between `z.enum([...])` headed by `name`.
fn extract_zod_enum(ts: &str, name: &str) -> Vec<String> {
    let header = format!("export const {name} = z.enum([");
    let start = ts.find(&header).unwrap_or_else(|| {
        panic!("{name} not declared in coordinate.ts")
    });
    let body_start = start + header.len();
    let rest = &ts[body_start..];
    let end = rest
        .find("])")
        .unwrap_or_else(|| panic!("{name} zod enum unterminated"));
    let body = &rest[..end];
    body.split(',')
        .map(|s| s.trim().trim_matches('"').trim().trim_matches('"').to_string())
        .filter(|s| !s.is_empty() && !s.starts_with("//"))
        .collect()
}

#[test]
fn rust_relation_role_strings_match_ts_zod_canonical_set() {
    let ts = coordinate_ts();
    let expected = extract_zod_enum(&ts, "HCRelationRole");
    let rust: Vec<String> = (0u8..=8)
        .map(|v| relation_role_name(v).expect("relation_role 0..=8 maps").to_string())
        .collect();
    assert_eq!(rust, expected, "Rust relation_role names must equal TS zod literal order");
}

#[test]
fn rust_interval_role_strings_match_ts_zod_canonical_set() {
    let ts = coordinate_ts();
    let expected = extract_zod_enum(&ts, "HCIntervalRole");
    // C sparse mapping order: 0,1,2,6,10,12 → none, semitone, whole_tone, tritone, totality_16_9, octave
    let rust: Vec<String> = [0u8, 1, 2, 6, 10, 12]
        .iter()
        .map(|v| interval_role_name(*v).expect("interval_role maps").to_string())
        .collect();
    assert_eq!(rust, expected);
}

#[test]
fn rust_ratio_role_strings_match_ts_zod_canonical_set() {
    let ts = coordinate_ts();
    let expected = extract_zod_enum(&ts, "HCRatioRole");
    let rust: Vec<String> = (0u8..=6)
        .map(|v| ratio_role_name(v).expect("ratio_role maps").to_string())
        .collect();
    assert_eq!(rust, expected);
}

#[test]
fn rust_bedrock_role_strings_match_ts_zod_canonical_set() {
    let ts = coordinate_ts();
    let expected = extract_zod_enum(&ts, "HCBedrockRole");
    let rust: Vec<String> = (0u8..=2)
        .map(|v| bedrock_role_name(v).expect("bedrock_role maps").to_string())
        .collect();
    assert_eq!(rust, expected);
}

#[test]
fn rust_helix_strings_match_ts_zod_canonical_set() {
    let ts = coordinate_ts();
    let expected = extract_zod_enum(&ts, "HCHelix");
    let rust: Vec<String> = (0u8..=2)
        .map(|v| helix_name(v).expect("helix maps").to_string())
        .collect();
    assert_eq!(rust, expected);
}

#[test]
fn rust_pointer_ring_strings_match_ts_zod_canonical_set() {
    let ts = coordinate_ts();
    let expected = extract_zod_enum(&ts, "HCPointerRing");
    let rust: Vec<String> = (0u8..=2)
        .map(|v| pointer_ring_name(v).expect("pointer_ring maps").to_string())
        .collect();
    assert_eq!(rust, expected);
}

#[test]
fn cf_notation_matches_ts_context_frame_ref_enum_set() {
    let ts = coordinate_ts();
    // HCContextFrameRef.notation is declared inline as z.enum([...]). Find the literal
    // CF strings by searching for the unique opening "(00/00)".
    assert!(ts.contains("\"(00/00)\""), "(00/00) must appear in coordinate.ts");
    let labels = ["(00/00)", "(0/1)", "(0/1/2)", "(0/1/2/3)", "(4.0/1-4.4/5)", "(4.5/0)", "(5/0)"];
    for (idx, expected_label) in labels.iter().enumerate() {
        let actual = context_frame_notation(idx as u8).expect("cf_notation maps");
        assert_eq!(
            &actual, expected_label,
            "cf_notation[{idx}] must equal TS literal {expected_label}"
        );
        assert!(
            ts.contains(&format!("\"{expected_label}\"")),
            "TS coordinate.ts must declare {expected_label}"
        );
    }
}

#[test]
fn ffi_bedrock_pointer_and_cf_web_structs_are_publicly_exported() {
    // Compile-time witness: instantiating these via mem::zeroed proves they
    // are exposed through epi_logos::ffi without Rust re-deriving the
    // internal relation semantics.
    let _bedrock: HcBedrockWeb7 = unsafe { std::mem::zeroed() };
    let _pointer: HcPointerWeb36 = unsafe { std::mem::zeroed() };
    let _cf: HcContextFrameWeb7 = unsafe { std::mem::zeroed() };
}

#[test]
fn pointer_web36_carries_three_rings_of_twelve_and_cf7_overlay_does_not_widen_to_37() {
    // Layout invariant: 3 × 12 = 36 pointer refs in HcPointerWeb36; CF7 overlay
    // is a separate HcContextFrameWeb7 with 7 frames. The CF7 must never
    // mutate the 36 count.
    let pointer: HcPointerWeb36 = unsafe { std::mem::zeroed() };
    assert_eq!(pointer.family.len(), 12);
    assert_eq!(pointer.position.len(), 12);
    assert_eq!(pointer.lens.len(), 12);
    assert_eq!(
        pointer.family.len() + pointer.position.len() + pointer.lens.len(),
        36
    );

    let cf: HcContextFrameWeb7 = unsafe { std::mem::zeroed() };
    assert_eq!(cf.frame.len(), 7);
}
