//! Tranche 03.T3.10 — the Asma mirror overlay rides the kernel phase-flip
//! law. `RoutingTrace.asma` carries the mirror metadata; `cymatic_invert`
//! carries the phase; the address is conserved across the flip — the
//! double-cover discipline: phase changes, `address72` does not.

use portal_core::{
    cymatic_invert, f_routing, kernel_tick_from_epogdoon, CymaticPhase, KerykeionRoutingState,
};

const COMPLETE_NATAL: &str = include_str!("fixtures/kerykeion_natal_complete.json");

#[test]
fn routing_trace_asma_carries_mirror_metadata_on_the_wire() {
    let kerykeion =
        KerykeionRoutingState::from_json(COMPLETE_NATAL).expect("fixture is valid Kerykeion state");
    let trace = f_routing("clarity", &kerykeion, kernel_tick_from_epogdoon(4, 9));

    let wire = serde_json::to_value(&trace).expect("routing trace serializes");
    let asma = &wire["asma"];
    for key in ["nameIdx", "group", "indexInGroup", "mirrorIdx", "hasMirror"] {
        assert!(
            !asma[key].is_null(),
            "RoutingTrace.asma must carry `{key}` on the wire: {asma}"
        );
    }

    // mirror_idx = 0xFF is explicit absence, not an error — the trace
    // serializes it verbatim rather than nulling or dropping it.
    let mirror_idx = asma["mirrorIdx"].as_u64().expect("mirrorIdx is numeric");
    let has_mirror = asma["hasMirror"].as_bool().expect("hasMirror is boolean");
    if has_mirror {
        assert!(mirror_idx < 100, "declared mirrors resolve inside the LUT");
    } else {
        assert_eq!(mirror_idx, 0xFF, "absence stays explicit");
    }
}

#[test]
fn cymatic_invert_flips_phase_and_conserves_the_address() {
    // Pick an address whose selected Asma name declares a mirror, so the
    // tick-7 boundary is a real flip candidate.
    let address72 = (0..72u8)
        .find(|&addr| cymatic_invert(addr, "clarity", 2, 7).asma.has_mirror)
        .expect("some address must select a mirrored Asma name");

    let primary = cymatic_invert(address72, "clarity", 2, 5);
    let inverted = cymatic_invert(address72, "clarity", 2, 7);

    // Phase changes at the flip boundary...
    assert_eq!(primary.phase, CymaticPhase::Primary);
    assert_eq!(inverted.phase, CymaticPhase::Inverted);
    // ...the address does not (double-cover discipline).
    assert_eq!(primary.address72, address72);
    assert_eq!(inverted.address72, address72);
    // ...and the Asma selection is the same name read in the other phase,
    // not a different name.
    assert_eq!(primary.asma.name_idx, inverted.asma.name_idx);

    // The overlay contract fields ride the state verbatim.
    assert_eq!(inverted.mirror_relation, "domain_mirror");
    assert_eq!(inverted.phase_law, "#/inversion_spanda");
    assert_eq!(
        inverted.mirror_name_idx,
        Some(inverted.asma.mirror_idx),
        "a flipped mirrored name exposes its conjugate index"
    );
}

#[test]
fn unmirrored_names_do_not_flip_even_at_the_boundary() {
    // 0xFF absence means the tick-7 boundary is NOT a flip candidate: the
    // phase stays primary and no conjugate is invented.
    if let Some(address72) =
        (0..72u8).find(|&addr| !cymatic_invert(addr, "clarity", 2, 7).asma.has_mirror)
    {
        let state = cymatic_invert(address72, "clarity", 2, 7);
        assert_eq!(state.phase, CymaticPhase::Primary);
        assert_eq!(state.mirror_name_idx, None);
        assert_eq!(state.address72, address72);
    }
}
