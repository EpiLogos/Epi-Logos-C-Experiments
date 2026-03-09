use epi::gate::omnipanel;

#[test]
fn electron_verification_targets_rust_gateway_on_8421() {
    let plan = omnipanel::electron_verification_plan();

    assert_eq!(plan.port, 8421);
    assert!(plan.required_flows.contains(&"session alias"));
    assert!(plan.required_flows.contains(&"subagent switch"));
    assert!(plan.required_flows.contains(&"skills surface"));
}
