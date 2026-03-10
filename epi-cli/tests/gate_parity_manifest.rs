#[test]
fn gateway_method_manifest_is_complete() {
    let methods = epi_logos::gate::parity::method_names();
    assert!(methods.contains(&"chat.send"));
    assert!(methods.contains(&"skills.install"));
    assert!(methods.contains(&"sessions.compact"));
    assert_eq!(epi_logos::gate::parity::TEST_GATEWAY_PORT, 18794);
}
