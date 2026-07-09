//! Track 02.T2.5 — the single session-held `#` (Inversion_Operator) carrier.
//!
//! M1'-SPEC §14: "The (0/1) wired into every coordinate is the same (0/1)."
//! Every walked-to coordinate carries an `invert` field pointing at the ONE
//! session-held inversion operator — not a per-coordinate fork. This proves the
//! invocation reaches the single session-held operator: profiles at different
//! ticks/coordinates carry the identical `inversionOperator` handle, and it
//! serialises under the carrier-read `inversionOperator` key. Kills the orphan
//! `InversionOperatorHandle` (defined + fixture-tested, never produced).

use portal_core::{kernel_tick_from_epogdoon, MathemeHarmonicProfile};

#[test]
fn invert_reaches_the_single_session_held_operator() {
    // Walk three different coordinates/ticks across the ring + cycles.
    let a = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(4, 2));
    let b = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(4, 6));
    let c = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(9, 9));

    // The (0/1) at every coordinate is the SAME (0/1): no per-coordinate forks.
    assert_eq!(
        a.inversion_operator, b.inversion_operator,
        "invert must reach the same session-held operator across coordinates"
    );
    assert_eq!(b.inversion_operator, c.inversion_operator);

    // It is the single session-held `#` operator (M1'-SPEC §14 / fixture law).
    assert_eq!(a.inversion_operator.operator, "matheme-shell-toggle");
    assert_eq!(a.inversion_operator.handle, "m1://inversion/operator");
    assert!(
        !a.inversion_operator.provenance.is_empty(),
        "the operator carries S0 provenance"
    );
}

#[test]
fn profile_serializes_inversion_operator_under_the_carrier_key() {
    let profile = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(4, 6));
    let wire = serde_json::to_value(&profile).expect("profile serializes");
    let op = &wire["inversionOperator"];
    assert_eq!(op["operator"], "matheme-shell-toggle");
    assert_eq!(op["handle"], "m1://inversion/operator");
    assert!(op["provenance"].is_string(), "carrier reads the operator provenance");

    // Survives the wire round-trip alongside the rest of the profile.
    let decoded: MathemeHarmonicProfile =
        serde_json::from_str(&serde_json::to_string(&profile).expect("serializes"))
            .expect("profile round-trips");
    assert_eq!(decoded.inversion_operator.handle, "m1://inversion/operator");
}
