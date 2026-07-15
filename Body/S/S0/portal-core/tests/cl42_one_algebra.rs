use portal_core::{
    codon_charge_quaternion, compose_personal_quaternion, quat_mul, quat_normalize,
    AnandaVortexProjection, Quaternion,
};

fn assert_quaternion_close(actual: Quaternion, expected: Quaternion) {
    for (component, expected_component) in actual.into_iter().zip(expected) {
        assert!(
            (component - expected_component).abs() < 1.0e-6,
            "quaternion mismatch: actual={actual:?}, expected={expected:?}"
        );
    }
}

#[test]
fn m1_ring_and_m3_codon_compose_through_the_m4_personal_algebra() {
    let m1_ring: Quaternion = AnandaVortexProjection::from_tick(2, 2, 120).ring_quaternion;
    let m3_codon: Quaternion = codon_charge_quaternion(42);
    let identity: Quaternion = [1.0, 0.0, 0.0, 0.0];

    let through_m4 = compose_personal_quaternion(m1_ring, m3_codon, identity);
    let through_shared_operator = quat_normalize(quat_mul(m1_ring, m3_codon));

    assert_quaternion_close(through_m4, through_shared_operator);
}
