#[test]
fn gateway_method_manifest_is_complete() {
    let methods = epi::gate::parity::method_names();
    assert!(methods.contains(&"chat.send"));
    assert!(methods.contains(&"skills.install"));
    assert!(methods.contains(&"sessions.compact"));
    assert_eq!(epi::gate::parity::TEST_GATEWAY_PORT, 8421);
}
