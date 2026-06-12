use portal_core::{kernel_tick_from_epogdoon, MathemeHarmonicProfile};

#[derive(Debug)]
struct AnuttaraPentadicRuntimeTraceProbe {
    tick: u64,
    tick12: u8,
    position6: u8,
    whole_number_endpoint: u8,
    natural_number_endpoint: u8,
    family_b_complement: [u8; 2],
    line_change_operator: u16,
    backbone_identity: &'static str,
    line_graph_identity: &'static str,
}

impl AnuttaraPentadicRuntimeTraceProbe {
    fn from_profile(profile: &MathemeHarmonicProfile) -> Self {
        Self {
            tick: profile.tick,
            tick12: profile.tick12,
            position6: profile.position6,
            whole_number_endpoint: 5,
            natural_number_endpoint: 6,
            family_b_complement: [profile.position6, profile.chromatic.mirror_position],
            line_change_operator: profile.binary.line_change_operator_address,
            backbone_identity: "24x15=360",
            line_graph_identity: "360+24=384",
        }
    }
}

fn trace_for(cycle: u64, tick12: u8) -> AnuttaraPentadicRuntimeTraceProbe {
    let profile = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(cycle, tick12));
    AnuttaraPentadicRuntimeTraceProbe::from_profile(&profile)
}

fn kernel_bridge_types_source() -> String {
    let path = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("../../../M/epi-theia/extensions/kernel-bridge/src/common/types.ts");
    std::fs::read_to_string(&path)
        .unwrap_or_else(|err| panic!("failed to read {}: {err}", path.display()))
}

#[test]
fn anuttara_family_b_complement_pairs_are_pentadic_runtime_hinges() {
    let source = kernel_bridge_types_source();
    assert!(
        source.contains(
            "readonly familyBComplement: readonly [0 | 1 | 2 | 3 | 4 | 5, 0 | 1 | 2 | 3 | 4 | 5];"
        ),
        "AnuttaraPentadicRuntimeTrace must expose the bounded familyBComplement pair"
    );

    for tick12 in 0..12 {
        let trace = trace_for(0, tick12);
        let [left, right] = trace.family_b_complement;

        assert!(
            left <= 5 && right <= 5,
            "tick {tick12} complement endpoints must stay in the 0..5 pentadic hinge space: {trace:?}"
        );
        assert_ne!(
            (left + right) % 6,
            0,
            "tick {tick12} must be a genuine complement pair, not a mod-6 self-pair: {trace:?}"
        );
    }
}

#[test]
fn whole_number_five_and_natural_number_six_are_the_same_hinge_in_two_addressing_modes() {
    let source = kernel_bridge_types_source();
    assert!(source.contains("readonly wholeNumberEndpoint: 5;"));
    assert!(source.contains("readonly naturalNumberEndpoint: 6;"));

    for tick12 in 0..12 {
        let trace = trace_for(0, tick12);
        assert_eq!(trace.whole_number_endpoint, 5);
        assert_eq!(trace.natural_number_endpoint, 6);
    }
}

#[test]
fn tick_substrate_0_through_11_yields_valid_position6_and_hinge() {
    for tick12 in 0..12 {
        let trace = trace_for(0, tick12);
        assert_eq!(trace.tick12, tick12);
        assert_eq!(trace.position6, tick12 % 6);
        assert!(trace.position6 <= 5);
        assert!(trace.line_change_operator < 384);
    }

    let before_wrap = trace_for(0, 11);
    let after_wrap = trace_for(1, 0);
    assert_eq!(before_wrap.tick, 11);
    assert_eq!(before_wrap.tick12, 11);
    assert_eq!(before_wrap.position6, 5);
    assert_eq!(after_wrap.tick, 12);
    assert_eq!(after_wrap.tick12, 0);
    assert_eq!(after_wrap.position6, 0);
    assert!(before_wrap.line_change_operator < 384);
    assert!(after_wrap.line_change_operator < 384);
}

#[test]
fn backbone_identity_24x15_equals_360_and_360_plus_24_equals_384() {
    let source = kernel_bridge_types_source();
    assert!(source.contains("readonly backboneIdentity: '24x15=360';"));
    assert!(source.contains("readonly lineGraphIdentity: '360+24=384';"));

    let trace = trace_for(0, 0);
    assert_eq!(trace.backbone_identity, "24x15=360");
    assert_eq!(trace.line_graph_identity, "360+24=384");
}
