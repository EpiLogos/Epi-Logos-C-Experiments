use epi_s2_graph_services::{
    m5_handoff_consumption_contract, FORBIDDEN_CLIENT_DERIVATIONS, M5_HANDOFF_CONTRACT_VERSION,
};
use serde_json::Value;

#[test]
fn m5_handoff_contract_publishes_every_consumer_fixture_from_s2_sources() {
    let contract = m5_handoff_consumption_contract().expect("handoff contract");

    assert_eq!(contract["contractVersion"], M5_HANDOFF_CONTRACT_VERSION);
    assert_eq!(contract["publishedBy"], "Body/S/S2/graph-services");
    assert_eq!(
        contract["sourceAnchors"]["code"],
        "Body/S/S2/graph-services/src/consumption.rs"
    );
    assert_eq!(
        contract["sourceAnchors"]["graphApi"],
        "Body/S/S2/graph-services/src/graph_api.rs"
    );

    let fixtures = contract["sampleResponseFixtures"]
        .as_array()
        .expect("fixture array");
    let fixture_ids = fixtures
        .iter()
        .map(|fixture| fixture["id"].as_str().unwrap())
        .collect::<Vec<_>>();
    assert_eq!(
        fixture_ids,
        vec![
            "m0_node_anuttara_gds",
            "m1_pointer_relation_walk",
            "m2_correspondence_provenance",
            "m3_graph_wheel_dual",
            "m5_namespace_viewer",
            "m54_agent_context_pool"
        ]
    );

    let consumers = contract["consumerContracts"].as_array().unwrap();
    for surface in ["M0'", "M1'", "M2'", "M3'", "M5'", "M5-4"] {
        assert!(
            consumers
                .iter()
                .any(|consumer| consumer["surface"].as_str() == Some(surface)),
            "missing consumer contract for {surface}"
        );
    }
}

#[test]
fn m0_fixture_carries_s2_owned_anuttara_gds_and_source_anchors() {
    let fixture = fixture_by_id("m0_node_anuttara_gds");
    let payload = &fixture["payload"];

    assert_eq!(payload["resolution"]["input"], "#2");
    assert_eq!(payload["resolution"]["canonical"], "M2");
    assert_eq!(payload["node"]["anuttara"]["symbol"], "@2");
    assert_eq!(
        payload["node"]["anuttara"]["provenance"]["symbol"]["source"],
        "s2.neo4j"
    );
    assert_eq!(
        payload["node"]["anuttara"]["provenance"]["symbol"]["property"],
        "c_1_symbol"
    );
    assert_eq!(payload["gdsOverlay"]["status"], "blocked");
    assert_eq!(payload["gdsOverlay"]["canonicalWritePerformed"], false);
    assert_eq!(
        payload["contract"]["sourceAnchors"]["spec"],
        "Idea/Bimba/Seeds/S/S2/S2'/Legacy/specs/S/S2-S2i-GRAPH.md"
    );
    assert_eq!(
        payload["contract"]["gdsOverlay"]["canonicalWritePerformedByApiEnvelope"],
        false
    );
}

#[test]
fn m1_and_m2_fixtures_reuse_pointer_descriptors_without_family_labels() {
    let m1 = fixture_by_id("m1_pointer_relation_walk");
    let pointer = &m1["payload"]["pointerWeb"];

    assert_eq!(pointer["coordinate"], "M2");
    assert_eq!(pointer["pointer_count"], 36);
    assert_eq!(pointer["family_refs"]["m_ref"], "M2");
    assert!(
        pointer.get("labels").is_none(),
        "family must not move into labels"
    );

    let steps = m1["payload"]["relationWalk"]["steps"].as_array().unwrap();
    assert_eq!(steps.len(), 2);
    assert!(steps.iter().any(|step| {
        step["reason_code"] == "inversion_spanda"
            && step["privacy_policy"] == "public-coordinate-topology-only"
    }));

    let m2 = fixture_by_id("m2_correspondence_provenance");
    assert_eq!(
        m2["payload"]["provenance"]["clientMappingPolicy"],
        "render-only"
    );
    assert_eq!(
        m2["payload"]["relationDescriptors"][0]["deposition_policy"],
        "read-only descriptor; downstream evidence deposit is S5-governed"
    );
}

#[test]
fn m5_4_context_pool_preserves_namespace_boundaries_and_protected_handles() {
    let fixture = fixture_by_id("m54_agent_context_pool");
    let payload = &fixture["payload"];

    assert_eq!(payload["contract"]["method"], "s2'.retrieve");
    assert_eq!(payload["agentPermissions"]["writeCanonicalGraph"], false);
    assert_eq!(payload["agentPermissions"]["protectedBodyAccess"], false);
    assert_eq!(
        payload["namespaceBoundaries"]["protected-local"]["disclosure"],
        "opaque-handle-only"
    );
    assert_eq!(
        payload["namespaceBoundaries"]["protected-local"]["bodyAllowed"],
        false
    );

    let context_pool = payload["contextPool"].as_array().unwrap();
    assert!(context_pool
        .iter()
        .any(|item| item["namespace"] == "bimba"
            && item["disclosure"] == "public-coordinate-topology"));
    assert!(context_pool.iter().any(|item| {
        item["namespace"] == "protected-local" && item["disclosure"] == "opaque-handle-only"
    }));
    assert!(
        !json_contains_string(payload, "journal body")
            && !json_contains_string(payload, "graphiti episode body")
            && !json_contains_string(payload, "nara body"),
        "protected-local bodies must not leak into S2 handoff fixtures"
    );
}

#[test]
fn kernel_bridge_expectations_forbid_local_graph_law_derivation() {
    let contract = m5_handoff_consumption_contract().expect("handoff contract");
    let forbidden = contract["kernelBridgeGraphClient"]["forbiddenClientDerivations"]
        .as_array()
        .unwrap()
        .iter()
        .map(|value| value.as_str().unwrap())
        .collect::<Vec<_>>();

    assert_eq!(forbidden, FORBIDDEN_CLIENT_DERIVATIONS);
    for forbidden_item in [
        "graph_relations",
        "owl_inference",
        "gds_recommendations",
        "codon_mapping",
        "tarot_mapping",
        "planetary_mapping",
        "hash_to_m_resolution",
    ] {
        assert!(forbidden.contains(&forbidden_item));
    }

    for fixture in contract["sampleResponseFixtures"].as_array().unwrap() {
        assert!(
            !json_contains_string(fixture, "renderer-local")
                && !json_contains_string(fixture, "client-computed")
                && !json_contains_string(fixture, "placeholder"),
            "handoff fixtures must not bless renderer-local derivation markers: {fixture}"
        );
    }
}

fn fixture_by_id(id: &str) -> Value {
    m5_handoff_consumption_contract().expect("handoff contract")["sampleResponseFixtures"]
        .as_array()
        .unwrap()
        .iter()
        .find(|fixture| fixture["id"].as_str() == Some(id))
        .cloned()
        .unwrap_or_else(|| panic!("missing fixture {id}"))
}

fn json_contains_string(value: &Value, needle: &str) -> bool {
    match value {
        Value::String(value) => value.contains(needle),
        Value::Array(items) => items.iter().any(|item| json_contains_string(item, needle)),
        Value::Object(items) => items
            .values()
            .any(|item| json_contains_string(item, needle)),
        _ => false,
    }
}
