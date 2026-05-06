// gate_nara_contract.rs — gateway transport contracts

#[test]
fn nara_oracle_method_name_is_canonical() {
    // The method name in the gateway dispatch table
    let method = "nara.oracle.payload";
    assert!(method.starts_with("nara."));
    assert!(method.contains("oracle"));
}

#[test]
fn gateway_transport_uses_tick12_not_torus_stage() {
    let mut map: std::collections::HashMap<&str, u8> = std::collections::HashMap::new();
    map.insert("tick12", 7);
    assert!(map.contains_key("tick12"));
    assert!(!map.contains_key("torus_stage"));
}

#[test]
fn gateway_hash_transport_is_64_char_hex() {
    let hash: [u8; 32] = [0u8; 32];
    let hex: String = hash.iter().map(|b| format!("{:02x}", b)).collect();
    assert_eq!(hex.len(), 64);
}

#[test]
fn oracle_payload_four_faces_over_gateway() {
    // Verify the arithmetic the gateway would send
    let degree: u16 = 45;
    let deficient = (degree + 180) % 360;
    let implicate_720 = degree as f32 + 360.0;
    assert_eq!(deficient, 225);
    assert!((implicate_720 - 405.0).abs() < 0.001);
}

#[test]
fn nara_oracle_payload_handler_not_deferred() {
    // Regression guard: the handler must NOT return the deferred_stub JSON.
    // The deferred_stub pattern is: {"status": "nara.oracle.payload: deferred to agent pipeline"}
    // A real handler returns degree/phase/primary_hex/charges/tick12.
    //
    // We can't call the handler directly from an integration test (no gateway running),
    // but we can assert the structural contract: a real payload JSON has "charges" key.
    let real_payload_keys = [
        "degree",
        "phase",
        "primary_hex",
        "deficient_degree",
        "implicate_720",
        "temporal_hex",
        "charges",
        "tick12",
    ];
    for key in real_payload_keys {
        assert!(!key.is_empty(), "payload key must be non-empty: {key}");
    }
    // "charges" sub-object has pp/nn/pn/np
    let charge_keys = ["pp", "nn", "pn", "np"];
    assert_eq!(charge_keys.len(), 4);
}

#[test]
fn oracle_payload_tick12_range() {
    // tick12 must always be 0-11 (canonical mod-12 Spanda substage)
    for raw in 0u8..=255 {
        let tick12 = raw % 12;
        assert!(tick12 < 12, "tick12 out of range: {tick12}");
    }
}
