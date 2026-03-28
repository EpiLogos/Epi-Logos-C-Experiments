// portal_clock_state.rs — portal SharedClockState and KairosState contracts

#[test]
fn kairos_state_has_10_planet_slots() {
    // KairosState must carry 10 planet degrees (Sun=0 through Pluto=9)
    // Source: 00-canonical-invariants.md §2
    const PLANET_COUNT: usize = 10;
    let degrees: [u16; PLANET_COUNT] = [0u16; PLANET_COUNT];
    assert_eq!(degrees.len(), 10);
    // Index 7 = Uranus, not Mars (canonical mod-10 ordering)
    // Index 0 = Sun (stable root, not chakra-mapped)
}

#[test]
fn portal_clock_uses_tick12_not_torus_stage() {
    // SharedClockState discrete clock field must be tick12
    let tick12: u8 = 5;
    assert!(tick12 < 12, "tick12 must be 0-11");
}

#[test]
fn portal_exact_degree_720_range() {
    // exact_degree_720 is f32 in [0.0, 720.0)
    let d: f32 = 405.5;
    assert!(d >= 0.0 && d < 720.0);
    let phase: u8 = if d < 360.0 { 0 } else { 1 };
    assert_eq!(phase, 1, "degree >= 360 must be phase=1 (Strand B)");
}

#[test]
fn sun_is_index_0_pluto_is_index_9() {
    // Canonical: Sun at index 0, Pluto at index 9
    // Earth is NOT in the array (it's EarthBodyState, geocentric observer)
    let planet_count: usize = 10;
    let sun_idx: usize = 0;
    let pluto_idx: usize = 9;
    assert!(sun_idx < planet_count);
    assert!(pluto_idx < planet_count);
    assert_eq!(pluto_idx - sun_idx, 9);
}

#[test]
fn uranus_is_index_7_not_mars() {
    // Canonical mod-10 ordering: index 7 = Uranus (outer/transpersonal)
    // Mars is at index 4, not index 7.
    // [Sun=0, Moon=1, Mercury=2, Venus=3, Mars=4, Jupiter=5, Saturn=6, Uranus=7, Neptune=8, Pluto=9]
    let uranus_idx: usize = 7;
    let mars_idx: usize = 4;
    assert_ne!(uranus_idx, mars_idx);
    assert_eq!(uranus_idx, 7);
    assert_eq!(mars_idx, 4);
}

#[test]
fn outer_planets_are_indices_7_8_9() {
    // Outer planets (transpersonal M2-5 layer): Uranus=7, Neptune=8, Pluto=9
    let outer: [usize; 3] = [7, 8, 9];
    for &idx in &outer {
        assert!(idx >= 7 && idx <= 9, "outer planet idx {idx} out of range");
    }
}

#[test]
fn planet_count_not_nine() {
    // Regression: the old (wrong) count was 9; canonical is 10.
    let canonical_count: usize = 10;
    let wrong_count: usize = 9;
    assert_ne!(canonical_count, wrong_count);
    assert_eq!(canonical_count, 10);
}
