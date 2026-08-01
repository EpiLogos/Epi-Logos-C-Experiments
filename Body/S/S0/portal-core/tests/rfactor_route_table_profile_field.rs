//! 25.T25.23 — the R-factor route table + virtue lamps ride the profile wire.
//!
//! The fretboard is a pure consumer; these tests hold the producer half of
//! that contract: the projected table IS `R_FACTOR_DISTRIBUTION` (itself
//! pinned to the C `R_FACTOR_ROUTE_TABLE` words by `kernel_truth.rs`), the
//! virtue lamps ARE the compiled `VIRTUE_LUT`, and the wire keys are the
//! camelCase names the carrier reads.

use portal_core::profile_projections::RFactorRouteTableProjection;
use portal_core::rfactor::{Base, R_FACTOR_DISTRIBUTION, R5_POSITIONLESS};
use portal_core::{kernel_tick_from_epogdoon, MathemeHarmonicProfile};

fn live_table() -> RFactorRouteTableProjection {
    let profile = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(3, 7));
    profile
        .rfactor_route_table
        .expect("every heartbeat profile carries the compiled route table")
}

#[test]
fn every_profile_tick_carries_the_route_table_on_the_camel_case_wire_key() {
    let profile = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(1, 4));
    let wire = serde_json::to_value(&profile).expect("profile serialises");
    let table = &wire["rfactorRouteTable"];
    assert!(table.is_object(), "rfactorRouteTable must ride the wire");
    assert_eq!(table["routes"].as_array().map(Vec::len), Some(7));
    assert_eq!(table["positionless"], 7);
    assert_eq!(table["bandTurnSymbol"], "(@#)");
    assert_eq!(table["virtues"].as_array().map(Vec::len), Some(9));
    // Row shape: camelCase keys, six positions.
    let row = &table["routes"][0];
    assert_eq!(row["baseRoute"], "O#");
    assert!(row["mColumn"].is_u64());
    assert_eq!(row["positions"].as_array().map(Vec::len), Some(6));
}

#[test]
fn the_projected_matrix_is_the_kernel_distribution_position_by_position() {
    let table = live_table();
    assert_eq!(
        table.routes.iter().map(|r| r.base_route.as_str()).collect::<Vec<_>>(),
        vec!["O#", "X#", "N#", "M#", "Nara", "Siva", "Shakti"],
    );
    for (row, route) in table.routes.iter().enumerate() {
        assert_eq!(
            route.positions, R_FACTOR_DISTRIBUTION[row],
            "route {} must project its kernel row verbatim",
            route.base_route
        );
        assert_eq!(route.m_column, Base::ALL[row].m_column());
    }
}

#[test]
fn the_dr_r0_and_r5_laws_hold_on_the_wire_shape() {
    let table = live_table();
    // R0 confines to the upper-triad strings (O#/X#/N#): rows 3.. carry the
    // positionless sentinel in column 0.
    for (row, route) in table.routes.iter().enumerate() {
        let r0 = route.positions[0];
        if row < 3 {
            assert_ne!(r0, R5_POSITIONLESS, "{} carries the R0 drone", route.base_route);
        } else {
            assert_eq!(r0, R5_POSITIONLESS, "{} must NOT carry R0", route.base_route);
        }
        // R5 is positionless everywhere — a fretless open string.
        assert_eq!(route.positions[5], R5_POSITIONLESS);
    }
}

#[test]
fn the_virtue_lamps_are_the_compiled_lut_with_meta_rows_unmapped() {
    let table = live_table();
    for (index, virtue) in table.virtues.iter().enumerate() {
        assert_eq!(virtue.virtue_index, index as u8);
        let expected = if index >= 3 { Some(index as u8 - 3) } else { None };
        assert_eq!(virtue.r_factor, expected, "virtue {index} R mapping");
        assert!(!virtue.symbol.is_empty() && !virtue.name.is_empty());
    }
    // The 0R lamp is the drone signature — pin its symbol head so a
    // re-ordered LUT cannot pass as a re-labelling.
    assert!(table.virtues[3].symbol.starts_with("0R"));
}
