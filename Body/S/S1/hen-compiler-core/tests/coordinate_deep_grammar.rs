//! Track 45.T45.1 — Hen `is_valid_coordinate` must accept the full multi-level
//! coordinate grammar so the Neo4j→repo `/map` reflection can round-trip the deep
//! coordinates the ontology actually holds (`M2-5-0`, `#0-2-9`, `M0-4.(0/1)`,
//! `M2-5-0'`), while still rejecting over-range bases and malformed segments.
//!
//! Grammar reference: graph-services `CoordinateArrayParser::parse_one`
//! (Body/S/S2/graph-services/src/coordinate.rs). The deep coordinate corpus these
//! cases are drawn from lives under Idea/Bimba/Map/datasets/*-deep/.

use epi_s1_hen_compiler_core::{is_valid_coordinate, is_valid_umbrella_designator};

#[test]
fn accepts_multi_level_dash_coordinates() {
    // The core gap: a depth>=2 dash chain used to parse the post-head remainder as a
    // single u8 and get rejected. Sub-positions are unconstrained (decan/codon/tarot).
    for coord in [
        "M2-5-0",
        "M2-5-7",       // sub-position beyond the QL 0-5 ideal
        "M2-3-0-360",   // decan-degree sub-position
        "#3-1-0-0",     // 4-level legacy psychoid tag from mahamaya-deep
        "#3-1-0-7",
        "#0-2-9",
        "M0-2-4",
    ] {
        assert!(is_valid_coordinate(coord), "{coord} should be accepted");
    }
}

#[test]
fn accepts_context_frame_and_lemniscate_forms() {
    for coord in [
        "M0-4.(0/1)",          // canonical position-4 context frame
        "M2-5-(0/1)-6",        // canonical frame mid-path
        "M0-4.(0/1/2/3)-5",
        "M0-4.(4.0/1-4.4/5)",  // Mod 4/6 fractal-doubling frame (dash inside parens)
        "M4.0",                // lemniscate dot after base position 4
        "M4.5",
        // raw pre-normalisation dataset forms (bare frames / dot-frames) also validate
        "#1-3-4.0/1",
        "#1-3-4.0/1/2/3",
        "#1-3-4.0000",
        "#2-3-5/0",
        "#2-4.0-0/1-0-32",
    ] {
        assert!(is_valid_coordinate(coord), "{coord} should be accepted");
    }
}

#[test]
fn accepts_lens_coordinates() {
    // Legacy lens tags `#-0`..`#-4` are the `M-0` lens form and must round-trip.
    for coord in ["#-0", "#-1", "#-4", "M-0", "M-3"] {
        assert!(is_valid_coordinate(coord), "{coord} should be accepted");
    }
}

#[test]
fn accepts_primes_at_the_exposed_level() {
    for coord in ["S1'", "S5'", "M2'", "M2-5'", "M2-5-0'", "#0-2-9'"] {
        assert!(is_valid_coordinate(coord), "{coord} should be accepted");
    }
}

#[test]
fn preserves_existing_shallow_and_special_domain() {
    for coord in [
        "#", "#0", "#5", "C0", "M5", "S1'", "M2", "M2-5", "M4.5", "CF_MOBIUS", "CPF",
        "CT", "CS", "Weave_0_0", "Weave_5_5",
    ] {
        assert!(is_valid_coordinate(coord), "{coord} should remain accepted");
    }
}

#[test]
fn still_rejects_over_range_bases() {
    // Base QL position stays bounded 0-5 even though sub-positions are unconstrained.
    for coord in ["#6", "M6", "C9", "M6-5", "M9-0-0", "X0", "X9"] {
        assert!(!is_valid_coordinate(coord), "{coord} must be rejected");
    }
}

#[test]
fn still_rejects_malformed_segments() {
    for coord in [
        "",
        "M0-",           // trailing separator, empty tail
        "M0--",          // empty segment
        "M0-abc",        // non-numeric bare token
        "M2-5-(0/1",     // unbalanced paren
        "M2-5-0/1)",     // unbalanced paren
        "random_string",
        "CF_WRONG",
        "#",             // handled elsewhere as valid — sanity: '#' alone IS valid, exclude below
    ]
    .into_iter()
    .filter(|c| *c != "#")
    {
        assert!(!is_valid_coordinate(coord), "{coord} must be rejected");
    }
}

// ── umbrella designators (`Sn/Sn'`) ───────────────────────────────────────
//
// Every umbrella spec in `Seeds/S/**` carries `coordinate: "Sn/Sn'"` — one
// document owning both a coordinate and its inversion. All six failed
// `epi vault frontmatter-validate` because the grammar knew no such form.
//
// It is deliberately NOT folded into `is_valid_coordinate`: an umbrella names
// TWO coordinates and is not itself a node, so widening the coordinate grammar
// would make it eligible for graph promotion/sync and would break the
// five-parser parity note with `graph-services::coordinate`.

#[test]
fn accepts_the_umbrella_pair_every_s_spec_carries() {
    for coord in ["S0/S0'", "S1/S1'", "S2/S2'", "S3/S3'", "S4/S4'", "S5/S5'", "M2/M2'"] {
        assert!(
            is_valid_umbrella_designator(coord),
            "{coord} is the umbrella form an owning spec carries"
        );
    }
}

#[test]
fn an_umbrella_is_not_itself_a_coordinate() {
    // The whole point of the split: the graph grammar must still reject it.
    for coord in ["S0/S0'", "S4/S4'"] {
        assert!(
            !is_valid_coordinate(coord),
            "{coord} must stay out of the coordinate grammar (promotion/sync read it)"
        );
    }
}

#[test]
fn rejects_a_pair_that_is_not_a_coordinate_and_its_own_inversion() {
    for coord in [
        "S4/S4",    // right side is not primed
        "S4/M2'",   // right side is a different coordinate
        "S4/S4''",  // double prime
        "M6/M6'",   // base is out of QL range
        "S4/",      // empty right
        "/S4'",     // empty left
        "S4",       // not a pair at all
    ] {
        assert!(
            !is_valid_umbrella_designator(coord),
            "{coord} must be rejected as an umbrella designator"
        );
    }
}
