mod support;

use serde_json::json;
use support::{TestEnv, TestGatewayClient};

#[tokio::test]
async fn s5_epii_gateway_exposes_agent_status_over_real_stores() {
    let mut client = TestGatewayClient::connected_with_temp_store(18913).await;

    client
        .request(
            "s5'.review.submit",
            json!({
                "source": "anima",
                "title": "Review Anima output",
                "body": "Anima asks Epii to make sense of the dispatch output.",
                "priority": "high",
                "coordinate_context": {"coordinate": "S4/S4' -> S5/S5'"},
                "requires_human": false
            }),
        )
        .await
        .expect("review state should be persisted");

    let proposed = client
        .request(
            "s5'.improve.propose",
            json!({
                "target_family": "S",
                "target_coordinate": "S5/S5'",
                "direction": "prove Epii agent gateway status reads improvement state",
                "baseline": {"path": "Idea/Bimba/Seeds/S/S5/S5-SPEC.md"}
            }),
        )
        .await
        .expect("improvement proposal should persist");

    let status = client
        .request("s5'.epii.status", json!({}))
        .await
        .expect("Epii status should read review and improvement stores");

    assert_eq!(status["agent_id"], "epii");
    assert_eq!(status["coordinate"], "S5/S5'");
    assert_eq!(status["relation_to_anima"], "peer_pi_agent");
    assert_eq!(status["review"]["open_count"], 1);
    assert_eq!(status["improvement"]["active_count"], 1);
    assert_eq!(status["improvement"]["total_runs"], 1);
    assert_eq!(
        proposed["run"]["run_id"],
        status["improvement"]["active_vectors"][0]["run_id"]
    );
}

#[tokio::test]
async fn s5_epii_gateway_deposit_links_aletheia_improvement_to_review_item() {
    let mut client = TestGatewayClient::connected_with_temp_store(18914).await;

    let receipt = client
        .request(
            "s5'.epii.deposit",
            json!({
                "source_agent": "aletheia",
                "source_coordinate": "S4.5'",
                "deposit_type": "improvement_request",
                "title": "Improve evidence source capture",
                "body": "Aletheia requests source-aware autoresearch evidence.",
                "artifact": {
                    "path": "Idea/Bimba/Seeds/S/S5/S5-SPEC.md",
                    "coordinate": "S5.4'",
                    "kind": "seed_spec"
                },
                "requires_human": false
            }),
        )
        .await
        .expect("Epii deposit should create linked review and improvement state");

    let item_id = receipt["review_item"]["item_id"].as_str().unwrap();
    assert_eq!(receipt["review_item"]["source"], "aletheia");
    assert_eq!(
        receipt["improvement_run"]["source_review_item_id"],
        serde_json::Value::String(item_id.to_owned())
    );

    let status = client
        .request("s5'.epii.status", json!({}))
        .await
        .expect("Epii status should include deposit-created state");

    assert_eq!(status["review"]["open_count"], 1);
    assert_eq!(status["improvement"]["active_count"], 1);
}

#[tokio::test]
async fn s5_epii_gateway_status_observes_gnosis_nara_and_graphiti_without_mutation() {
    let env = TestEnv::with_fake_pi().with_env("EPILOGOS_NEO4J_URI", "bolt://neo4j.test:7687");
    let gnosis_root = env.home.join(".epi-logos/gnosis");
    std::fs::create_dir_all(&gnosis_root).unwrap();
    std::fs::write(
        gnosis_root.join("notebooks.json"),
        r#"[{"name":"Research","created_at":"2026-05-05T00:00:00Z"}]"#,
    )
    .unwrap();
    std::fs::write(
        gnosis_root.join("documents.json"),
        r#"[{"id":"doc-1","title":"source.md","source_path":"source.md","source_type":"Canonical","notebook":"Research","ingested_at":"2026-05-05T00:00:00Z","chunks":[]}]"#,
    )
    .unwrap();

    let mut client = TestGatewayClient::connect(env, 18915).await;
    client
        .request("connect", json!({}))
        .await
        .expect("connect handshake should succeed");

    let status = client
        .request("s5'.epii.status", json!({}))
        .await
        .expect("Epii status should include read-only world-return surfaces");

    assert_eq!(status["world_return"]["gnosis"]["available"], true);
    assert_eq!(status["world_return"]["gnosis"]["coordinate"], "S5");
    assert_eq!(status["world_return"]["gnosis"]["service"], "gnosis");
    assert_eq!(status["world_return"]["gnosis"]["storage_substrate"], "S2");
    assert_eq!(status["world_return"]["gnosis"]["governance_owner"], "S5'");
    assert_eq!(status["world_return"]["gnosis"]["documents_count"], 1);
    assert_eq!(status["world_return"]["gnosis"]["notebooks_count"], 1);
    assert_eq!(
        status["world_return"]["gnosis"]["neo4j_uri"],
        "bolt://neo4j.test:7687"
    );

    assert_eq!(status["world_return"]["nara"]["available"], true);
    assert_eq!(status["world_return"]["nara"]["method"], "nara.status");
    assert!(status["world_return"]["nara"]["snapshot"].is_object());

    assert_eq!(
        status["world_return"]["graphiti"]["runtime_authority"],
        "S3 graphiti runtime adapter"
    );
    assert_eq!(
        status["world_return"]["graphiti"]["invocation_owner"],
        "S5 episodic invocation and arc governance"
    );
    assert_eq!(
        status["world_return"]["graphiti"]["runtime_coordinate"],
        "S3'"
    );
    assert_eq!(
        status["world_return"]["graphiti"]["usage_governance_coordinate"],
        "S5/S5'"
    );
    assert_eq!(
        status["world_return"]["graphiti"]["url"],
        "http://127.0.0.1:37778"
    );
    assert!(status["world_return"]["graphiti"]["running"].is_boolean());
}

#[tokio::test]
async fn s5_epii_user_orientation_reads_kairos_and_pratibimba_without_identity_mutation() {
    let env = TestEnv::with_fake_pi();
    let nara_root = env.home.join(".epi-logos").join("nara");
    std::fs::create_dir_all(nara_root.join("kairos")).unwrap();
    std::fs::write(
        nara_root.join("profile.json"),
        r#"{
  "version": 1,
  "layers": {},
  "layer_presence_mask": 5,
  "hash_preview": "facefeed",
  "last_wound": null,
  "kerykeion_version": "test"
}"#,
    )
    .unwrap();
    std::fs::write(
        nara_root.join("kairos").join("current.json"),
        r#"{
  "planets": [
    {"planet_id": 0, "degree": 55.0, "degree_anchor": 55, "retrograde": false}
  ],
  "dominant_sign": 1,
  "dominant_element": 4,
  "active_decan": 18,
  "active_tattva": 2
}"#,
    )
    .unwrap();

    let mut client = TestGatewayClient::connect(env, 18916).await;
    client
        .request("connect", json!({}))
        .await
        .expect("connect handshake should succeed");

    let orientation = client
        .request("s5'.epii.user.orientation", json!({}))
        .await
        .expect("Epii should expose bounded user orientation");

    assert_eq!(orientation["coordinate"], "S5/S5'");
    assert_eq!(orientation["pratibimba"]["coordinate"], "M4.4.4.4");
    assert_eq!(orientation["pratibimba"]["anchorId"], "pratibimba-facefeed");
    assert_eq!(orientation["kairos"]["available"], true);
    assert_eq!(orientation["kairos"]["activeDecan"], 18);
    assert_eq!(
        orientation["access"]["s4Access"],
        "read temporal orientation and deposit review requests; no identity mutation"
    );
    assert_eq!(
        orientation["graphiti"]["namespaceSource"],
        "M4.4.4.4 PersonalNexus protected anchor"
    );
}

#[tokio::test]
async fn s5_graphiti_session_memory_methods_are_bounded_and_runtime_honest() {
    let mut client = TestGatewayClient::connected_with_temp_store(18917).await;

    let search = client
        .request(
            "s5.episodic.search",
            json!({
                "query": "session compact evidence",
                "agentId": "anima",
                "sessionKey": "agent:main:main",
                "dayId": "07-05-2026",
                "namespaceRef": "pratibimba-test",
                "limit": 3
            }),
        )
        .await
        .expect("bounded Graphiti search should return an honest runtime envelope");

    assert_eq!(search["coordinate"], "S5/S5'");
    assert_eq!(search["runtimeOwner"], "S3'");
    assert_eq!(search["invocationOwner"], "S5/S5'");
    assert_eq!(search["access"]["agentId"], "anima");
    assert_eq!(search["access"]["mayMutateIdentity"], false);
    assert!(search["runtimeAvailable"].is_boolean());
    assert_eq!(search["query"], "session compact evidence");

    let deposit = client
        .request(
            "s5.episodic.deposit",
            json!({
                "sourceAgent": "aletheia",
                "sessionKey": "agent:main:main",
                "dayId": "07-05-2026",
                "namespaceRef": "pratibimba-test",
                "content": "Aletheia crystallised a session summary for Epii review.",
                "qlPosition": "5'",
                "cp": "4.5",
                "cpf": "(5/0)"
            }),
        )
        .await
        .expect("bounded Graphiti deposit should return an honest runtime envelope");

    assert_eq!(deposit["coordinate"], "S5/S5'");
    assert_eq!(deposit["runtimeOwner"], "S3'");
    assert_eq!(deposit["invocationOwner"], "S5/S5'");
    assert_eq!(deposit["access"]["sourceAgent"], "aletheia");
    assert_eq!(deposit["access"]["requiresEpiiReview"], true);
    assert_eq!(
        deposit["privacyBoundary"],
        "protected-local-episodic-memory"
    );
    assert!(deposit["runtimeAvailable"].is_boolean());
}
