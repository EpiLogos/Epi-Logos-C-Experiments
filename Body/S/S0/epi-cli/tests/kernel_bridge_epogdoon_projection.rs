//! Behavioral coverage for the `kernelBridge.m2.epogdoonProjection(address72)`
//! bridge-contract edge (Track 37.T37.1).
//!
//! These tests drive the *epi-cli bridge edge* — the typed-JSON functions that
//! the Theia / pratibimba-app `EpogdoonBridgeEngine` consumes — and prove the
//! edge surfaces the C epogdoon law (`apply_epogdoon_compression` /
//! `is_evolutionary_gap` / `m3_epogdoon_expand` in epi-lib m2.c/m3.c) *verbatim*
//! through portal-core FFI. Nothing is recomputed at the edge: the projection
//! JSON must equal the serialized portal-core projection (which runs the C
//! functions), and the C result must equal the canonical integer 9:8 law.
//!
//! Contract shape (DR-KB-1 typed edge): `{ compressedCodon, isEvolutionaryGap,
//! expandedBack }`, camelCase at the JSON boundary.

use epi_logos::gate::kernel_bridge_runtime::{
    m2_epogdoon_projection, typed_json_m2_epogdoon_lattice, typed_json_m2_epogdoon_projection,
    KERNEL_BRIDGE_M2_EPOGDOON_PROJECTION,
};
use portal_core::EpogdoonBridgeProjection;
use serde_json::Value;

const M2_ADDRESS_COUNT: u16 = 72;
const M3_CODON_COUNT: u16 = 64;

/// Canonical integer 9:8 compression law, re-derived independently of the C
/// implementation so the assertion cross-checks the FFI output rather than
/// echoing it.
fn law_compress(address72: u16) -> u16 {
    (address72 * 8) / 9
}

fn law_expand(codon: u16) -> u16 {
    (codon * 9) / 8
}

/// The bridge edge surfaces the C epogdoon law for every M2 vibrational address
/// (0..71): each JSON cell carries exactly `{ compressedCodon, isEvolutionaryGap,
/// expandedBack }`, and every value equals what the C functions compute (which
/// in turn equals the canonical integer 9:8 law). This is the tranche's
/// "projection round-trips against the C functions for all 72 indices" edge
/// proof — run at the JSON boundary the frontend actually reads.
#[test]
fn bridge_edge_round_trips_against_c_for_all_72_indices() {
    for address in 0..M2_ADDRESS_COUNT {
        let address72 = address as u8;
        let edge = typed_json_m2_epogdoon_projection(address72);
        let object = edge.as_object().expect("projection JSON is an object");

        // The edge carries EXACTLY the three contract fields — no leakage, no
        // renderer-side extras.
        let mut keys: Vec<&String> = object.keys().collect();
        keys.sort();
        assert_eq!(
            keys,
            vec![
                &"compressedCodon".to_owned(),
                &"expandedBack".to_owned(),
                &"isEvolutionaryGap".to_owned()
            ],
            "address {address}: contract fields are exactly compressedCodon/isEvolutionaryGap/expandedBack"
        );

        let compressed = object["compressedCodon"].as_u64().unwrap() as u16;
        let expanded = object["expandedBack"].as_u64().unwrap() as u16;
        let is_gap = object["isEvolutionaryGap"].as_bool().unwrap();

        // The C law (surfaced through FFI) equals the canonical integer 9:8 law.
        assert_eq!(
            compressed,
            law_compress(address),
            "address {address}: compressedCodon = (i*8)/9"
        );
        assert!(
            compressed < M3_CODON_COUNT,
            "address {address}: codon stays in 0..63"
        );
        assert_eq!(
            expanded,
            law_expand(compressed),
            "address {address}: expandedBack = (codon*9)/8"
        );
        // is_evolutionary_gap ⇔ the 9:8 round-trip does not return to i.
        assert_eq!(
            is_gap,
            expanded != address,
            "address {address}: isEvolutionaryGap ⇔ round-trip failure"
        );

        // The JSON edge equals the serialized portal-core projection byte-for-byte
        // (structurally): the edge does not recompute or reshape the C result.
        let direct: Value =
            serde_json::to_value(EpogdoonBridgeProjection::from_address72(address72))
                .expect("EpogdoonBridgeProjection serializes");
        assert_eq!(
            edge, direct,
            "address {address}: bridge edge == portal-core projection"
        );
    }
}

/// The gap count the C authority actually reports is 64, not the tranche's
/// "exactly 9". `is_evolutionary_gap(i)` flags every address whose 9:8 round-trip
/// fails; only the 8 multiples of nine (0,9,18,27,36,45,54,63) round-trip cleanly.
/// The structurally meaningful "missing states" count is 8 (matching the M3
/// `M3_RES_MATRIX` 8-gap invariant and the 72→64 collision count), and 9 is the
/// epogdoon *denominator*, never a fold-point cardinality. This test pins the C
/// authority so no downstream surface silently re-asserts a false 9.
/// See finding 37.T37.1 / proposed DR-37-6.
#[test]
fn bridge_edge_gap_count_is_c_authoritative_64_not_9() {
    let mut gap_count = 0u16;
    let mut clean_round_trip: Vec<u16> = Vec::new();
    for address in 0..M2_ADDRESS_COUNT {
        let projection = m2_epogdoon_projection(address as u8);
        if projection.is_evolutionary_gap {
            gap_count += 1;
        } else {
            clean_round_trip.push(address);
        }
    }
    assert_eq!(
        gap_count, 64,
        "C is_evolutionary_gap flags 64/72 addresses (round-trip failures) — not 9"
    );
    assert_eq!(
        clean_round_trip,
        vec![0, 9, 18, 27, 36, 45, 54, 63],
        "exactly the 8 multiples of nine round-trip cleanly"
    );
}

/// The lattice edge carries the bridge-contract identifier and the full
/// address-ordered descent so the frontend never rebuilds the 72→64 table
/// locally. Every cell equals the single-address projection.
#[test]
fn bridge_edge_lattice_carries_contract_identifier_and_all_72_cells() {
    let lattice = typed_json_m2_epogdoon_lattice();
    assert_eq!(
        lattice["contract"], KERNEL_BRIDGE_M2_EPOGDOON_PROJECTION,
        "lattice carries the ratified bridge-contract id"
    );
    assert_eq!(
        lattice["addressCount"], 72,
        "addressCount is the Parashakti 72-invariant"
    );

    let cells = lattice["cells"].as_array().expect("cells is an array");
    assert_eq!(cells.len(), 72, "lattice carries all 72 address cells");
    for (address, cell) in cells.iter().enumerate() {
        let direct = typed_json_m2_epogdoon_projection(address as u8);
        assert_eq!(cell, &direct, "cell {address} == single-address projection");
    }
}

/// The projector is total over any caller-supplied u8: the address is taken
/// modulo 72, so address 72 aliases address 0 and 143 aliases 71.
#[test]
fn bridge_edge_projection_is_total_via_modulo_72() {
    assert_eq!(
        typed_json_m2_epogdoon_projection(72),
        typed_json_m2_epogdoon_projection(0),
        "address 72 wraps to 0"
    );
    assert_eq!(
        typed_json_m2_epogdoon_projection(143),
        typed_json_m2_epogdoon_projection(71),
        "address 143 wraps to 71"
    );
}
