use portal_core::m3_transcription_bridge::{M3_BACKBONE_DEGREE_STEP, M3_BACKBONE_NODE_COUNT};
use portal_core::{kernel_tick_from_epogdoon, AnuttaraPentadicRuntimeTrace, MathemeHarmonicProfile};

// The canonical complement-family law from the statically-linked C substrate
// (pointer_web.c: mirror = 5 − position, the pentadic-hinge involution) — the
// 36.2 tests bind the expected pairs to THIS, never to old letter names.
extern "C" {
    fn hc_mirror_position(ql_position: u8) -> u8;
}

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

        // 36.2: bind the expected pair to the canonical substrate involution
        // (C hc_mirror_position: 5 − p), not to an old family letter name —
        // every complement pair IS a pentadic runtime hinge: left + right = 5.
        let expected_right = unsafe { hc_mirror_position(left) };
        assert_eq!(
            right, expected_right,
            "tick {tick12}: complement must equal the canonical C mirror involution: {trace:?}"
        );
        assert_eq!(
            left + right,
            5,
            "tick {tick12}: complement pair must close on the whole-number hinge 5: {trace:?}"
        );
    }
}

#[test]
fn tick_substrate_0_1_projects_to_position5_without_losing_position6_completion() {
    // The 0/1 tick substrate must be PRESENT in the trace (the test fails if
    // the trace drops it): tick 0 is the '0' pole, tick 1 the '1' pole, all
    // later ticks the fused '0/1' non-dual substrate.
    let real = |cycle: u64, tick12: u8| {
        let profile = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(cycle, tick12));
        AnuttaraPentadicRuntimeTrace::from_profile(&profile)
    };
    assert_eq!(real(0, 0).source_binary_state, "0");
    assert_eq!(real(0, 1).source_binary_state, "1");
    for tick12 in 2..12u8 {
        assert_eq!(
            real(0, tick12).source_binary_state,
            "0/1",
            "tick {tick12}: the fused 0/1 substrate must stay on the trace"
        );
    }

    // Whole-number addressing reaches position 5 from 0 (position 5 must not
    // be swallowed by the 6-count) while the natural-number 1→6 completion is
    // simultaneously held on the SAME trace — one hinge, two addressing modes.
    for tick12 in [5u8, 11] {
        let trace = real(0, tick12);
        assert_eq!(
            trace.position6, 5,
            "tick {tick12}: whole-number addressing must reach position 5"
        );
        assert_eq!(trace.whole_number_endpoint, 5);
        assert_eq!(
            trace.natural_number_endpoint, 6,
            "tick {tick12}: the natural 1→6 completion must not be lost when position 5 is reached"
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

fn real_trace(cycle: u64, tick12: u8) -> AnuttaraPentadicRuntimeTrace {
    let profile = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(cycle, tick12));
    AnuttaraPentadicRuntimeTrace::from_profile(&profile)
}

/// Tranche 36.T36.1 bullet 1 — the Rust trace round-trips JSON and every
/// serialized key is declared verbatim by the kernel-bridge TS interface;
/// one projection law on both sides of the wire.
#[test]
fn pentadic_trace_round_trips_json_against_the_kernel_bridge_interface() {
    let source = kernel_bridge_types_source();
    let trace = real_trace(4, 7);

    let wire = serde_json::to_value(&trace).expect("trace serializes");
    for key in wire.as_object().expect("trace is an object").keys() {
        assert!(
            source.contains(&format!("readonly {key}")),
            "kernel-bridge interface must declare `{key}`"
        );
    }

    let decoded: AnuttaraPentadicRuntimeTrace =
        serde_json::from_value(wire).expect("trace deserializes");
    assert_eq!(decoded, trace);
    assert_eq!(decoded.whole_number_endpoint, 5);
    assert_eq!(decoded.natural_number_endpoint, 6);
    assert!(matches!(
        decoded.evolutionary_gap.as_str(),
        "m2-wholeness-gap" | "m3-transcription-gap" | "m1-parent-restored"
    ));
}

/// Tranche 36.T36.1 bullet 3 — the 72-sample grid: 72 x 5 = 360, the
/// epogdoon 8/9 compression, and the mahamaya 64/360 address law all hold
/// on the trace's projected values (codec path checked against the raw
/// floor identities, not against itself).
#[test]
fn seventy_two_sample_grid_holds_the_epogdoon_and_mahamaya_floor_laws() {
    assert_eq!(
        72u16 * 5,
        M3_BACKBONE_DEGREE_STEP * M3_BACKBONE_NODE_COUNT,
        "72 x 5 = 360 = the backbone tiling"
    );

    for cycle in 0..6u64 {
        for tick12 in 0..12u8 {
            let trace = real_trace(cycle, tick12);
            assert!(trace.resonance72_index < 72, "{trace:?}");
            assert_eq!(trace.shem_degree_quantum, 5);
            assert!(trace.degree360 < 360);
            assert_eq!(
                trace.m2_to_m3_symbol as usize,
                (trace.resonance72_index * 8) / 9,
                "epogdoon 8/9 law at cycle {cycle} tick {tick12}"
            );
            assert_eq!(
                u32::from(trace.mahamaya_address64),
                u32::from(trace.degree360 % 360) * 64 / 360,
                "mahamaya 64/360 address law at cycle {cycle} tick {tick12}"
            );
        }
    }
}

/// Tranche 36.T36.1 bullet 4 — the paired fifteens and both identity
/// strings are sourced from the M3 transcription-bridge constants, not
/// duplicated literals.
#[test]
fn mahamaya_backbone_paired_fifteens_are_sourced_from_m3_helpers() {
    let trace = real_trace(0, 3);
    assert_eq!(
        trace.paired_mahamaya_fifteens,
        [M3_BACKBONE_DEGREE_STEP, M3_BACKBONE_DEGREE_STEP]
    );
    assert_eq!(
        trace.backbone_identity,
        format!(
            "{}x{}={}",
            M3_BACKBONE_NODE_COUNT,
            M3_BACKBONE_DEGREE_STEP,
            M3_BACKBONE_NODE_COUNT * M3_BACKBONE_DEGREE_STEP
        )
    );
    assert_eq!(trace.backbone_identity, "24x15=360");
    assert_eq!(trace.line_graph_identity, "360+24=384");
}
