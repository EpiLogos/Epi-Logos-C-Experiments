use std::collections::HashSet;

use portal_core::{kernel_tick_from_epogdoon, MathemeHarmonicProfile, MathemeLensMode};

#[test]
fn vimarsha_reading_is_stable_positive_and_distinct_for_all_84_cells() {
    let tick = kernel_tick_from_epogdoon(34, 7);
    let mut readings = HashSet::new();

    for lens in 0..12 {
        for mode in 0..7 {
            let lens_mode = MathemeLensMode::new(lens, mode).expect("valid 84-cell address");
            let first = portal_core::parashakti::vimarsha_read_profile(tick, lens_mode);
            let second = portal_core::parashakti::vimarsha_read_profile(tick, lens_mode);

            assert_eq!(
                first, second,
                "reading must be deterministic for {lens}:{mode}"
            );
            assert!(first
                .audio_octet
                .iter()
                .all(|hz| hz.is_finite() && *hz > 0.0));
            assert_eq!(first.nodal_quartet.len(), 4);
            assert_eq!(first.nodal_quartet[0].ql_position, 0);
            assert_eq!(first.nodal_quartet[1].ql_position, 5);
            assert_eq!(first.nodal_quartet[2].ql_position, 0);
            assert_eq!(first.nodal_quartet[3].ql_position, 5);
            assert_eq!(first.nodal_quartet[0].helix, "bimba");
            assert_eq!(first.nodal_quartet[1].helix, "bimba");
            assert_eq!(first.nodal_quartet[2].helix, "pratibimba");
            assert_eq!(first.nodal_quartet[3].helix, "pratibimba");
            assert!(first
                .nodal_quartet
                .iter()
                .all(|node| (1..=12).contains(&node.m) && (1..=12).contains(&node.n)));

            let signature = reading_signature(&first);
            assert!(
                readings.insert(signature),
                "each of the 84 cells should produce a distinct Vimarsha reading; duplicate at {lens}:{mode}"
            );
        }
    }

    assert_eq!(readings.len(), 84);
}

#[test]
fn harmonic_profile_uses_the_public_vimarsha_reading_api() {
    let tick = kernel_tick_from_epogdoon(9, 10);
    let profile = MathemeHarmonicProfile::from_tick(tick);
    let reading = portal_core::parashakti::vimarsha_read_profile(tick, profile.lens_mode);

    assert_eq!(profile.audio_octet, reading.audio_octet);
    assert_eq!(profile.nodal_quartet, reading.nodal_quartet);
}

fn reading_signature(reading: &portal_core::parashakti::VimarshaReading) -> String {
    let audio = reading
        .audio_octet
        .iter()
        .map(|hz| format!("{:.3}", hz))
        .collect::<Vec<_>>()
        .join(",");
    let nodes = reading
        .nodal_quartet
        .iter()
        .map(|node| format!("{}:{}:{}:{}", node.ql_position, node.helix, node.m, node.n))
        .collect::<Vec<_>>()
        .join(",");
    format!("{audio}|{nodes}")
}
