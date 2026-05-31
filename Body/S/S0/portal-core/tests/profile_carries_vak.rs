use portal_core::{
    kernel_tick_from_epogdoon, CpfState, CsDirection, CsField, MathemeHarmonicProfile, VakAddress,
};

fn sample_vak() -> VakAddress {
    VakAddress {
        cpf: CpfState::Mechanistic,
        ct: vec!["CT4a".into()],
        cp: "CP4.4".into(),
        cf: "(4.0/1-4.4/5)".into(),
        cfp: "CFP0".into(),
        cs: CsField {
            code: "CS0".into(),
            direction: CsDirection::Day,
        },
    }
}

#[test]
fn profile_carries_vak_address_field() {
    let tick = kernel_tick_from_epogdoon(3, 6);
    let vak = sample_vak();
    let profile = MathemeHarmonicProfile::with_vak(tick, vak.clone());
    // tick.cycle = 3, sub_tick = 6 => stored tick = 3 * 12 + 6 = 42
    assert_eq!(profile.tick, 42);
    assert_eq!(profile.vak_address.as_ref().unwrap().cf, "(4.0/1-4.4/5)");
    assert_eq!(
        profile.vak_address.as_ref().unwrap().cs.direction,
        CsDirection::Day
    );
}

#[test]
fn profile_without_vak_serializes_without_address_field() {
    // Baseline: existing from_tick constructor must not emit vakAddress at all.
    let tick = kernel_tick_from_epogdoon(0, 7);
    let bare = MathemeHarmonicProfile::from_tick(tick);
    assert!(
        bare.vak_address.is_none(),
        "from_tick must leave vak_address None"
    );
    let bare_json = serde_json::to_string(&bare).unwrap();
    assert!(
        !bare_json.contains("vakAddress"),
        "skip_serializing_if must omit vakAddress when None, got: {}",
        bare_json
    );

    // And: with_vak constructor MUST serialise the field. Note camelCase rename.
    let with_json =
        serde_json::to_string(&MathemeHarmonicProfile::with_vak(tick, sample_vak())).unwrap();
    assert!(
        with_json.contains("\"vakAddress\""),
        "vakAddress present when set, got: {}",
        with_json
    );
}

#[test]
fn profile_vak_address_round_trips_through_serde() {
    let tick = kernel_tick_from_epogdoon(8, 3);
    let vak = sample_vak();
    let profile = MathemeHarmonicProfile::with_vak(tick, vak.clone());
    let json = serde_json::to_string(&profile).unwrap();
    let back: MathemeHarmonicProfile = serde_json::from_str(&json).unwrap();
    assert_eq!(back.vak_address.unwrap(), vak);
}
