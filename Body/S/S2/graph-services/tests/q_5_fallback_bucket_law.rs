use epi_s2_graph_services::dataset_import::canonical_q_import_property_key;

#[test]
fn unknown_dataset_q_keys_fall_into_q_5_integration_bucket() {
    assert_eq!(
        canonical_q_import_property_key("paramadvaita", 1),
        "q_5_paramadvaita"
    );
    assert_eq!(
        canonical_q_import_property_key("siva_sakti_play", 4),
        "q_5_siva_sakti_play"
    );
    assert_eq!(
        canonical_q_import_property_key("unpositioned", 9),
        "q_5_unpositioned"
    );
}
