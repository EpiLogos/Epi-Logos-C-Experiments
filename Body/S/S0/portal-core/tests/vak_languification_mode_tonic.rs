//! Coordinate: S0/M0 VAK languification modal projection.
//! Residency: Body/S/S0/portal-core/tests.
//! Position (#n): profile-bus contract verification.
//! Actualises: 36.T36.8 mode-tonic evidence on the Para-to-Vaikhari trace.
//! Public surface: `cargo test -p portal-core --test vak_languification_mode_tonic`.
//! Does NOT own: VAK evaluation, mode selection, or renderer presentation.
//! Contract: [[S0-SPEC]] / [[M0'-SPEC]] / [[07-c-prime-vak-grammar-layer]].

use portal_core::{
    kernel_tick_from_epogdoon, CpfState, CsDirection, CsField, MathemeHarmonicProfile, VakAddress,
    VakLanguificationTrace,
};

fn mechanistic_vak() -> VakAddress {
    VakAddress {
        cpf: CpfState::Mechanistic,
        ct: vec!["CT4".to_owned()],
        cp: "CP4.5".to_owned(),
        cf: "(4.0/1-4.4/5)".to_owned(),
        cfp: "CFP4".to_owned(),
        cs: CsField {
            code: "CS4".to_owned(),
            direction: CsDirection::Day,
            recognized: false,
        },
    }
}

#[test]
fn mode_tonic_cf_follows_the_kernel_mode_without_fabricating_ionian() {
    let expected = [
        None,
        Some("(0/1)"),
        Some("(0/1/2)"),
        Some("(0/1/2/3)"),
        Some("(4.0/1-4.4/5)"),
        Some("(4.5/0)"),
        Some("(5/0)"),
    ];

    for mode in 0..=6 {
        let mut profile =
            MathemeHarmonicProfile::with_vak(kernel_tick_from_epogdoon(0, 0), mechanistic_vak());
        profile.lens_mode.mode = mode;
        let trace = VakLanguificationTrace::from_profile(&profile, false)
            .expect("a profile carrying VAK emits a trace");
        assert_eq!(
            trace.mode_tonic_cf.as_deref(),
            expected[mode as usize],
            "mode {mode} must project its canonical CF tonic"
        );
    }
}
