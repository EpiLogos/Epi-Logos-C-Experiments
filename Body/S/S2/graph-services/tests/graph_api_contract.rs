use epi_s2_graph_services::{
    graph_contract, schema, source_traceability_anchors, GraphMethodParams, GraphMethodService,
    GraphNodeRequest, GraphQueryRequest, GraphTraverseDirection, GraphTraverseRequest,
    KernelResonanceObservationRequest, Neo4jClient, Neo4jConfig, PointerWebRefreshRequest,
};
use serde_json::json;
use std::time::{SystemTime, UNIX_EPOCH};

#[test]
fn graph_method_requests_are_s2_owned_and_parameterized() {
    let query = GraphQueryRequest {
        cypher: "MATCH (n:Bimba {coordinate: $coord}) RETURN n.coordinate AS coordinate".into(),
        params: GraphMethodParams::from_json(json!({ "coord": "S2" })).unwrap(),
    };
    assert_eq!(query.params.get_string("coord"), Some("S2"));

    let rejected = GraphQueryRequest {
        cypher: "MATCH (n:Bimba {coordinate: 'S2'}) RETURN n".into(),
        params: GraphMethodParams::default(),
    }
    .validate();
    assert!(rejected.unwrap_err().contains("parameterized"));

    let node = GraphNodeRequest {
        coordinate: "S2".into(),
    };
    assert_eq!(node.validate().unwrap(), "S2");

    let traverse = GraphTraverseRequest {
        from: "S2".into(),
        edge_types: vec!["POS5_INTEGRATES_INTO".into()],
        direction: GraphTraverseDirection::Both,
        depth: 9,
    };
    assert_eq!(traverse.bounded_depth(), 4);
}

#[test]
fn coordinate_resolution_canonicalizes_hash_without_legacy_property() {
    let resolved = GraphMethodService::resolve_coordinate_string("#2").unwrap();
    assert_eq!(resolved.input, "#2");
    assert_eq!(resolved.canonical, "M2");
    assert!(resolved.compatibility_property.is_none());

    let root = GraphMethodService::resolve_coordinate_string("#").unwrap();
    assert_eq!(root.input, "#");
    assert_eq!(root.canonical, "#");
    assert!(root.compatibility_property.is_none());

    let resolved = GraphMethodService::resolve_coordinate_string("M4").unwrap();
    assert_eq!(resolved.canonical, "M4");
    assert!(resolved.compatibility_property.is_none());
}

#[test]
fn kernel_resonance_observation_plan_is_parameterized_and_coordinate_owned() {
    let plan =
        GraphMethodService::kernel_resonance_observation_plan(&KernelResonanceObservationRequest {
            source_coordinate: "#2".into(),
            session_key: "agent:epii:main".into(),
            timestamp_ms: 1_779_000_001_234,
            lens: 2,
            ascent_helix: true,
            position: 1,
            score: 0.875,
            kernel_tick: 9,
            graphiti_arc_id: Some(
                "day:20260517:session:agent:epii:main:namespace:pratibimba-test".into(),
            ),
        })
        .expect("valid kernel resonance graph plan");

    assert_eq!(plan.resolution.canonical, "M2");
    assert_eq!(plan.resonance_index, 31);
    assert_eq!(plan.tritone_square, 2);
    assert_eq!(plan.coordinate_anchor.coordinate, "M2");
    assert_eq!(plan.coordinate_anchor.kernel.source, "s0.kernel");
    assert_eq!(plan.coordinate_anchor.pointer_web.pointer_count, 36);
    assert_eq!(
        plan.coordinate_anchor
            .pointer_web
            .harmonic_relation_descriptors
            .len(),
        2
    );
    assert_eq!(
        plan.coordinate_anchor
            .pointer_web
            .harmonic_relation_descriptors[0]
            .reason_code,
        "inversion_spanda"
    );
    assert_eq!(
        plan.coordinate_anchor
            .pointer_web
            .harmonic_relation_descriptors[0]
            .privacy_policy,
        "public-coordinate-topology-only"
    );
    assert_eq!(
        plan.coordinate_anchor
            .pointer_web
            .family_refs
            .get("m_ref")
            .map(String::as_str),
        Some("M2")
    );
    assert_eq!(
        plan.coordinate_anchor
            .pointer_web
            .lens_inversion_refs
            .get("l2_inv_ref")
            .map(String::as_str),
        Some("L2'")
    );
    assert_eq!(plan.coordinate_anchor.qvdata.source, "epi core knowing");
    assert_eq!(plan.coordinate_anchor.qvdata.coordinate, "M2");
    let harmonic_pointer = plan
        .coordinate_anchor
        .harmonic_pointer
        .as_ref()
        .expect("sixfold coordinate should have harmonic pointer certification");
    assert_eq!(
        harmonic_pointer.source_profile,
        "portal-core::MathemeHarmonicProfile"
    );
    assert_eq!(harmonic_pointer.bedrock.psychoid_number, "#2");
    assert_eq!(harmonic_pointer.bedrock.inverted_psychoid_number, "#2'");
    assert_eq!(harmonic_pointer.pointer_anchor.lens_anchor, "L2");
    assert_eq!(harmonic_pointer.pointer_anchor.web_cardinality, 36);
    assert_eq!(harmonic_pointer.context_frames.frame_count, 7);
    assert_eq!(
        plan.params.get_string("coordinate_anchor_json").is_some(),
        true
    );
    assert!(plan
        .observation_coordinate
        .starts_with("S2.kernel.resonance.agent-epii-main.1779000001234.31"));
    assert!(plan
        .cypher
        .contains("MERGE (obs:Bimba:KernelResonanceObservation"));
    assert!(plan.cypher.contains("HAS_KERNEL_RESONANCE"));
    assert!(plan.cypher.contains("$source_coordinate"));
    assert!(plan.cypher.contains("$resonance_index"));
    assert_eq!(plan.params.get_string("source_coordinate"), Some("M2"));
    assert_eq!(plan.params.get_integer("resonance_index"), Some(31));
    assert_eq!(plan.params.get_integer("tritone_square"), Some(2));
    assert_eq!(plan.params.get_bool("ascent_helix"), Some(true));
    assert_eq!(plan.params.get_float("score"), Some(0.875));

    let err =
        GraphMethodService::kernel_resonance_observation_plan(&KernelResonanceObservationRequest {
            lens: 6,
            ..KernelResonanceObservationRequest {
                source_coordinate: "M2".into(),
                session_key: "agent:epii:main".into(),
                timestamp_ms: 1_779_000_001_234,
                lens: 2,
                ascent_helix: true,
                position: 1,
                score: 0.875,
                kernel_tick: 9,
                graphiti_arc_id: None,
            }
        })
        .unwrap_err();
    assert!(err.contains("lens"));
}

#[test]
fn pointer_web_refresh_plan_is_parameterized_and_coordinate_owned() {
    let plan = GraphMethodService::pointer_web_refresh_plan(&PointerWebRefreshRequest {
        coordinate: "#2".into(),
        timestamp_ms: 1_779_000_001_555,
    })
    .expect("valid pointer web refresh plan");

    assert_eq!(plan.resolution.canonical, "M2");
    assert_eq!(plan.pointer_web.coordinate, "M2");
    assert_eq!(plan.pointer_web.pointer_count, 36);
    assert_eq!(plan.pointer_web.harmonic_relation_descriptors.len(), 2);
    assert!(plan
        .pointer_web
        .harmonic_relation_descriptors
        .iter()
        .any(|descriptor| descriptor.reason_code == "lens_anchor"));
    let harmonic_pointer = plan
        .coordinate_anchor
        .harmonic_pointer
        .as_ref()
        .expect("sixfold coordinate should have harmonic pointer certification");
    assert_eq!(
        harmonic_pointer.pointer_anchor.provenance,
        "S0 Bedrock7/PointerWeb36/CF7 harmonic pointer contract"
    );
    assert_eq!(
        harmonic_pointer.pointer_anchor.relation_role,
        "position-identity"
    );
    assert_eq!(
        plan.pointer_web
            .family_refs
            .get("m_ref")
            .map(String::as_str),
        Some("M2")
    );
    assert_eq!(plan.params.get_string("pointer_web_json").is_some(), true);
    assert_eq!(plan.params.get_integer("pointer_count"), Some(36));
    assert!(plan
        .params
        .get_string("harmonic_pointer_anchor_json")
        .is_some());
    assert_eq!(plan.params.get_string("source_coordinate"), Some("M2"));
    assert!(plan.cypher.contains("MATCH (n:Bimba)"));
    assert!(plan
        .cypher
        .contains("c_5_pointer_web_json = $pointer_web_json"));
    assert!(plan.cypher.contains("c_5_pointer_count = $pointer_count"));
    assert!(plan
        .cypher
        .contains("c_5_pointer_family_refs = $family_refs"));
    assert!(plan
        .cypher
        .contains("c_5_harmonic_pointer_anchor_json = $harmonic_pointer_anchor_json"));
}

#[test]
fn graph_api_contract_envelope_carries_sources_namespace_gds_and_pointer_descriptors() {
    let resolved = GraphMethodService::resolve_coordinate_string("#2").unwrap();
    let contract = graph_contract("s2.graph.node", Some(&resolved));

    assert_eq!(contract["method"], "s2.graph.node");
    assert_eq!(contract["namespace"], "bimba");
    assert_eq!(contract["coordinateOwner"], "S2/S2'");
    assert_eq!(
        contract["sourceAnchors"]["code"],
        "Body/S/S2/graph-services/src/graph_api.rs"
    );
    assert_eq!(
        contract["gdsOverlay"]["canonicalWritePerformedByApiEnvelope"],
        false
    );
    assert_eq!(contract["disclosureDensity"], "public-coordinate-topology");
    let descriptors = contract["pointerWebDescriptors"].as_array().unwrap();
    assert_eq!(descriptors.len(), 2);
    assert_eq!(descriptors[0]["from_coordinate"], "M2");
    assert_eq!(
        descriptors[0]["deposition_policy"],
        "read-only descriptor; downstream evidence deposit is S5-governed"
    );
    assert_eq!(
        contract["residencyAuthority"]["diagramPack"],
        "Idea/Bimba/Seeds/ARCHITECTURE-DIAGRAM-PACK.md"
    );
    assert_eq!(
        contract["residencyAuthority"]["missingResidencyPolicy"],
        "canonical_absent; never synthesize renderer-local paths"
    );
}

#[test]
fn source_traceability_anchors_resolve_world_chain_without_renderer_registry() {
    let anchors = source_traceability_anchors("M0");

    assert_eq!(
        anchors["source"]["path"],
        "Idea/Bimba/Seeds/ARCHITECTURE-DIAGRAM-PACK.md"
    );
    assert_eq!(anchors["source"]["status"], "s2_resolved");
    assert_eq!(
        anchors["spec"]["path"],
        "Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md"
    );
    assert_eq!(anchors["policy"]["rendererLocalRegistryAllowed"], false);
    assert_eq!(anchors["policy"]["missingResidency"], "canonical_absent");

    let chain = anchors["residencyChain"]
        .as_array()
        .expect("residency chain");
    assert!(chain.iter().any(|entry| {
        entry["kind"] == "flat-world-form"
            && entry["path"] == "Idea/Bimba/World/M0.md"
            && entry["status"] == "canonical_absent"
    }));
    assert!(chain.iter().any(|entry| {
        entry["kind"] == "type-canvas-index"
            && entry["path"] == "Idea/Bimba/World/Types/Coordinates/M/M0/M0.canvas"
            && entry["status"] == "canonical_absent"
    }));
    assert!(chain.iter().any(|entry| {
        entry["kind"] == "coordinate-semantic-authority"
            && entry["path"] == "Idea/Bimba/World/Types/Coordinates"
            && entry["status"] == "s2_resolved"
    }));
}

#[tokio::test]
#[ignore] // requires Docker: docker compose -f docker-compose.epi-s2.yml up -d neo4j
async fn live_graph_methods_write_read_traverse_and_cleanup_test_owned_data() {
    let config = Neo4jConfig::from_env();
    let client = Neo4jClient::connect(&config).expect("connect to live Neo4j");
    schema::create_schema(&client).await.expect("create schema");
    let service = GraphMethodService::new(&client);
    let suffix = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    let source = format!("Weave_S2_GRAPH_METHOD_TEST_{suffix}");
    let target = format!("Weave_S2_GRAPH_METHOD_TARGET_{suffix}");
    let session_key = format!("agent:graph-method-live:{suffix}");

    let create = format!(
        "MERGE (a:Bimba:EpiGraphMethodTest {{coordinate: '{source}'}})
         SET a.c_2_uuid = 'uuid:{source}',
             a.c_1_name = 'Graph method source',
             a.c_4_family = 'S',
             a.c_4_layer = 'S2',
             a.c_4_ql_position = 2,
             a.c_1_ct_type = 'CT1',
             a.c_4_artifact_role = 'test'
         MERGE (b:Bimba:EpiGraphMethodTest {{coordinate: '{target}'}})
         SET b.c_2_uuid = 'uuid:{target}',
             b.c_1_name = 'Graph method target',
             b.c_4_family = 'S',
             b.c_4_layer = 'S2',
             b.c_4_ql_position = 2,
             b.c_1_ct_type = 'CT1',
             b.c_4_artifact_role = 'test'
         MERGE (a)-[r:POS5_INTEGRATES_INTO]->(b)
         SET r.c_0_source_coordinate = a.coordinate,
             r.c_0_target_coordinate = b.coordinate,
             r.c_1_relation_family = 'position',
             r.c_2_relation_type = 'POS5_INTEGRATES_INTO'
         RETURN a.coordinate AS source"
    );
    client.run(&create).await.expect("create test graph");

    let node = service
        .node(GraphNodeRequest {
            coordinate: source.clone(),
        })
        .await
        .expect("node method");
    assert_eq!(node["node"]["coordinate"], source);

    let refreshed = service
        .refresh_pointer_web(PointerWebRefreshRequest {
            coordinate: source.clone(),
            timestamp_ms: 1_779_000_001_555,
        })
        .await
        .expect("refresh pointer web");
    assert_eq!(refreshed["source"]["canonical"], source);
    assert_eq!(refreshed["pointerWeb"]["coordinate"], source);
    assert_eq!(refreshed["pointerWeb"]["pointer_count"], 18);
    assert_eq!(refreshed["rowCount"], 1);
    let pointer_rows = client
        .run(&format!(
            "MATCH (n:Bimba {{coordinate: '{source}'}})
             RETURN n.c_5_pointer_count AS pointer_count"
        ))
        .await
        .expect("read persisted pointer web fields");
    assert_eq!(
        pointer_rows
            .first()
            .and_then(|row| row.get::<i64>("pointer_count").ok()),
        Some(18)
    );

    let traversed = service
        .traverse(GraphTraverseRequest {
            from: source.clone(),
            edge_types: vec!["POS5_INTEGRATES_INTO".into()],
            direction: GraphTraverseDirection::Outbound,
            depth: 2,
        })
        .await
        .expect("traverse method");
    assert!(traversed["nodes"]
        .as_array()
        .unwrap()
        .iter()
        .any(|node| node["coordinate"] == target));

    let queried = service
        .query(GraphQueryRequest {
            cypher: "MATCH (n:Bimba {coordinate: $coord}) RETURN n.coordinate AS coordinate, n.c_1_name AS name".into(),
            params: GraphMethodParams::from_json(json!({ "coord": target })).unwrap(),
        })
        .await
        .expect("query method");
    assert_eq!(queried["rowCount"], 1);

    let resonance = service
        .record_kernel_resonance(KernelResonanceObservationRequest {
            source_coordinate: source.clone(),
            session_key: session_key.clone(),
            timestamp_ms: 1_779_000_001_234,
            lens: 2,
            ascent_helix: true,
            position: 1,
            score: 0.875,
            kernel_tick: 9,
            graphiti_arc_id: Some(format!(
                "day:20260517:session:{session_key}:namespace:pratibimba-test"
            )),
        })
        .await
        .expect("record kernel resonance observation");
    assert_eq!(resonance["observation"]["resonance_index"], 31);
    assert_eq!(resonance["observation"]["tritone_square"], 2);
    assert_eq!(resonance["source"]["canonical"], source);

    client
        .run(&format!(
            "MATCH (n:Bimba)
             WHERE n.coordinate IN ['{source}', '{target}'] OR n.s_3_session_key = '{session_key}'
             DETACH DELETE n"
        ))
        .await
        .expect("cleanup test graph");
}

#[tokio::test]
#[ignore] // requires Docker: docker compose -f docker-compose.epi-s2.yml up -d neo4j
async fn live_m0_inspector_payload_reads_anuttara_fields_from_s2_properties() {
    let config = Neo4jConfig::from_env();
    let client = Neo4jClient::connect(&config).expect("connect to live Neo4j");
    schema::create_schema(&client).await.expect("create schema");
    let service = GraphMethodService::new(&client);
    let suffix = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos()
        % 60_000;
    let coordinate = format!("M0-{suffix}");

    client
        .run_query(
            neo4rs::query(
                "MERGE (n:Bimba:EpiGraphMethodTest {coordinate: $coordinate})
                 SET n.c_2_uuid = $coordinate,
                     n.c_1_name = 'Anuttara contract test',
                     n.c_4_family = 'M',
                     n.c_4_layer = 'M0',
                     n.c_4_ql_position = 0,
                     n.c_1_symbol = '@0 = ##',
                     n.c_1_formulation_type = 'Anuttara syntax',
                     n.c_1_complete_formulation = '@0 = ## -- Being/Knowing Embodied/Implicit Memory - Library'
                 RETURN n.coordinate AS coordinate",
            )
            .param("coordinate", coordinate.clone()),
        )
        .await
        .expect("create anuttara test node");

    let payload = service
        .node(GraphNodeRequest {
            coordinate: coordinate.clone(),
        })
        .await
        .expect("node method");
    assert_eq!(payload["node"]["coordinate"], coordinate);
    assert_eq!(payload["node"]["anuttara"]["symbol"], "@0 = ##");
    assert_eq!(
        payload["node"]["anuttara"]["formulation_type"],
        "Anuttara syntax"
    );
    assert_eq!(
        payload["node"]["anuttara"]["provenance"]["symbol"]["source"],
        "s2.neo4j"
    );
    assert_eq!(
        payload["node"]["anuttara"]["provenance"]["symbol"]["property"],
        "c_1_symbol"
    );
    assert_eq!(
        payload["node"]["anuttara"]["provenance"]["symbol"]["status"],
        "s2_supplied"
    );
    assert_ne!(
        payload["node"]["anuttara"]["symbol"],
        "renderer-local-placeholder"
    );

    client
        .run_query(
            neo4rs::query(
                "MATCH (n:EpiGraphMethodTest)
                 WHERE n.coordinate = $coordinate OR n.coordinate STARTS WITH 'M0-ANUTTARA_CONTRACT_TEST_'
                 DETACH DELETE n",
            )
                .param("coordinate", coordinate),
        )
        .await
        .expect("cleanup anuttara test node");
}
