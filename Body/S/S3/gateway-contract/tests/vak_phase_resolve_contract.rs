use epi_s3_gateway_contract::{method_dispatch_plan_entry, method_names, MethodDispatchKind};
use portal_core::{assert_coordinate_phase_preserved, resolve_phase_qualified_coordinate};

#[test]
fn gnostic_resolve_method_is_registered_as_s5_prime_governance() {
    assert!(method_names().contains(&"s5'.gnostic.resolve"));
    let entry = method_dispatch_plan_entry("s5'.gnostic.resolve")
        .expect("s5'.gnostic.resolve dispatch row");
    assert_eq!(entry.kind, MethodDispatchKind::S5GovernanceAdapter);
    assert!(entry.authority_path.contains("Body/S/S5/epi-gnostic"));
}

#[test]
fn anuttara_trace_method_is_registered_as_s0_prime_trace() {
    assert!(method_names().contains(&"s0'.anuttara.trace"));
    let entry =
        method_dispatch_plan_entry("s0'.anuttara.trace").expect("s0'.anuttara.trace dispatch row");
    assert_eq!(entry.kind, MethodDispatchKind::S0ProductAdapter);
    assert!(entry.authority_path.contains("Body/S/S0"));
}

#[test]
fn gnostic_resolve_distinguishes_prime_and_unprimed_handles() {
    let prime = resolve_phase_qualified_coordinate("C3'").expect("prime resolves");
    let direct = resolve_phase_qualified_coordinate("C3").expect("direct resolves");
    assert_eq!(prime.phase, "prime");
    assert_eq!(direct.phase, "direct");
    assert_ne!(prime.handle, direct.handle);
    assert_coordinate_phase_preserved("C3'", &prime.raw).expect("prime round-trip preserved");
}
