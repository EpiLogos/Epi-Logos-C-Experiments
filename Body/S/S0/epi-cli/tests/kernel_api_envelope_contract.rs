use std::fs;
use std::path::PathBuf;

fn workspace() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .ancestors()
        .nth(4)
        .unwrap()
        .to_path_buf()
}

#[test]
fn flow_api_envelope_and_ts_contract_name_kernel_temporal_projection() {
    let root = workspace();
    let envelope = fs::read_to_string(
        root.join("Idea/Bimba/Seeds/S/FLOW-2026-04-22-ENVELOPE-FIELD-SCHEMA.md"),
    )
    .expect("envelope schema should be readable");
    let api = fs::read_to_string(
        root.join("Idea/Bimba/Seeds/S/S4/S4'/FLOW-2026-04-24-PI-AGENT-API-v0.1.md"),
    )
    .expect("PI agent API should be readable");
    let ts = fs::read_to_string(
        root.join("Idea/Bimba/Seeds/S/S4/S4'/FLOW-2026-04-25-TS-INTERFACE-DEFINITIONS.md"),
    )
    .expect("TS interface definitions should be readable");
    // The legacy epi-tauri carrier is git-history-only (Body/M/AGENTS.md,
    // DR-FACE-4); the living projection mirror is portal-core kernel.rs.
    let kernel_rs = fs::read_to_string(root.join("Body/S/S0/portal-core/src/kernel.rs"))
        .expect("portal-core kernel projection source should be readable");

    for expected in [
        "c_0_kernel_projection",
        "c_3_kernel_tick",
        "c_2_kernel_harmonic_pulse",
        "c_5_kernel_energy",
        "c_0_kernel_computation_source",
        "c_0_kernel_privacy_class",
        "safe-public-current-kernel-tick",
        "portal-core::KernelProjection",
    ] {
        assert!(
            envelope.contains(expected),
            "envelope schema should declare {expected}"
        );
    }

    for expected in [
        "kernel: KernelTemporalProjection | null",
        "KernelTemporalProjection",
        "s3'.temporal.context",
        "safe-public-current-kernel-tick",
    ] {
        assert!(
            api.contains(expected),
            "PI agent API should declare {expected}"
        );
        assert!(
            ts.contains(expected),
            "FLOW TS definitions should declare {expected}"
        );
    }

    for expected in [
        "pub struct KernelTemporalProjection",
        "safe-public-current-kernel-tick",
        "pub coordinate_owner: String",
    ] {
        assert!(
            kernel_rs.contains(expected),
            "portal-core kernel projection mirror should declare {expected}"
        );
    }
}
