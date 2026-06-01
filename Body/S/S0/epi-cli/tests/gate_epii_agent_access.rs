mod support;

use epi_s3_gateway_contract::GRAPHITI_BASE_URL;
use serde_json::json;
use support::{TestEnv, TestGatewayClient};

fn unique_live_graphiti_token() -> String {
    let millis = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .expect("system clock should be after unix epoch")
        .as_millis();
    format!("livegraphitiruntimeproof{millis}")
}

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
                "day_id": "12-05-2026",
                "now_path": "Idea/Empty/Present/12-05-2026/NOW.md",
                "session_key": "agent:aletheia:12-05-2026",
                "vault_root": "Idea",
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
    assert_eq!(
        receipt["inbox_surface"]["inbox_path"],
        serde_json::Value::String("Idea/Empty/Present/12-05-2026/".to_owned())
    );
    assert_eq!(
        receipt["inbox_surface"]["session_key"],
        serde_json::Value::String("agent:aletheia:12-05-2026".to_owned())
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
    assert_eq!(
        orientation["pratibimba"]["privacy"],
        "protected-reference-only"
    );
    assert_eq!(
        orientation["pratibimba"]["layerPresenceSummary"]["presentCount"],
        2
    );
    assert!(
        orientation["pratibimba"]
            .get("identityHashPreview")
            .is_none(),
        "Epii orientation must not publish protected profile hash detail"
    );
    assert!(
        orientation["pratibimba"].get("layerPresenceMask").is_none(),
        "Epii orientation must not publish protected layer mask detail"
    );
    assert!(
        orientation["pratibimba"].get("layerCount").is_none(),
        "Epii orientation must keep layer detail inside the count-only summary"
    );
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
async fn s5_epii_runtime_context_resolves_gateway_session_and_projection_readiness() {
    let mut client = TestGatewayClient::connected_with_temp_store(18918).await;
    client
        .request(
            "chat.send",
            json!({"sessionKey": "agent:main:main", "message": "seed propagated session"}),
        )
        .await
        .expect("chat send should create the gateway session");
    client
        .request(
            "sessions.patch",
            json!({
                "sessionKey": "agent:main:main",
                "dayId": "08-05-2026",
                "vaultNowPath": "/vault/Empty/Present/08-05-2026/session-main/now.md",
                "activeAgentId": "anima",
                "resourceLoaderId": "loader://anima/plugin-runtime",
                "runtimeCwd": "/repo"
            }),
        )
        .await
        .expect("session patch should establish propagated identity");

    let context = client
        .request(
            "s5'.epii.runtime.context",
            json!({
                "sessionKey": "agent:main:main",
                "agentId": "anima"
            }),
        )
        .await
        .expect("bounded runtime context should resolve through gateway");

    assert_eq!(context["coordinate"], "S5/S5'");
    assert_eq!(context["runtimeOwner"], "S3'");
    assert_eq!(context["session"]["canonicalKey"], "agent:main:main");
    assert_eq!(context["session"]["activeAgentId"], "anima");
    assert_eq!(
        context["session"]["resourceLoaderId"],
        "loader://anima/plugin-runtime"
    );
    assert_eq!(context["temporal"]["dayId"], "08-05-2026");
    assert_eq!(
        context["temporal"]["nowPath"],
        "/vault/Empty/Present/08-05-2026/session-main/now.md"
    );
    assert_eq!(
        context["projection"]["sessionSurfaceTable"],
        "session_surface"
    );
    assert_eq!(
        context["temporal"]["kernel"]["privacy"],
        "safe-public-current-kernel-tick"
    );
    assert_eq!(
        context["temporal"]["kernel"]["computationSource"],
        "portal-core::KernelProjection"
    );
    assert!(
        context["temporal"]["kernel"]["tick"]["subTick"]
            .as_u64()
            .unwrap()
            <= 11
    );
    assert!(
        context["temporal"]["kernel"]["harmonicProfile"]["chromatic"]["note"]
            .as_str()
            .unwrap()
            .len()
            > 0
    );
    assert_eq!(
        context["temporal"]["kernel"]["harmonicProfile"]["profileSchemaVersion"],
        1
    );
    assert_eq!(
        context["temporal"]["kernel"]["harmonicProfile"]["binary"],
        context["temporal"]["kernel"]["harmonicProfile"]["mahamaya"]
    );
    assert_eq!(
        context["temporal"]["kernel"]["harmonicProfile"]["binary"]["transcriptionState"],
        "provisional-gap"
    );
    assert!(
        context["temporal"]["kernel"].get("bioquaternion").is_none(),
        "Epii/Anima runtime context must not expose protected bioquaternion state"
    );
    assert!(context["projection"]["spacetimedb"].is_object());
    assert_eq!(context["access"]["mayMutateIdentity"], false);
    assert_eq!(context["access"]["mayDepositReviewRequest"], true);
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

    let kernel_deposit = client
        .request(
            "s5.episodic.kernel_resonance.deposit",
            json!({
                "sourceAgent": "anima",
                "sessionKey": "agent:main:main",
                "dayId": "07-05-2026",
                "namespaceRef": "pratibimba-test",
                "observationCoordinate": "S2.kernel.resonance.agent-main-main.1779000001234.31",
                "sourceCoordinate": "M2",
                "resonanceIndex": 31,
                "tritoneSquare": 2,
                "score": 0.875,
                "kernelTick": 9
            }),
        )
        .await
        .expect("kernel resonance Graphiti deposit should return an honest runtime envelope");

    assert_eq!(kernel_deposit["coordinate"], "S5/S5'");
    assert_eq!(kernel_deposit["runtimeOwner"], "S3'");
    assert_eq!(kernel_deposit["invocationOwner"], "S5/S5'");
    assert_eq!(
        kernel_deposit["method"],
        "s5.episodic.kernel_resonance.deposit"
    );
    assert_eq!(kernel_deposit["access"]["sourceAgent"], "anima");
    assert_eq!(kernel_deposit["access"]["requiresEpiiReview"], true);
    assert_eq!(
        kernel_deposit["deposit"]["metadata"]["source_coordinate"],
        "M2"
    );
    assert!(kernel_deposit["runtimeAvailable"].is_boolean());

    let profile_deposit = client
        .request(
            "s5.episodic.kernel_profile_observation.deposit",
            json!({
                "sourceAgent": "anima",
                "sessionKey": "agent:main:main",
                "dayId": "19-05-2026",
                "namespaceRef": "pratibimba-test",
                "vaultNowPath": "Idea/Empty/Present/19-05-2026/20260519-120000-main/now.md",
                "sourceCoordinate": "M2",
                "tick12": 10,
                "degree720": 600,
                "resonance72Index": 64,
                "mahamayaAddress64": 42,
                "coordinateAnchor": {
                    "coordinate": "M2",
                    "coordinate_anchor": {
                        "harmonic_pointer": {
                            "source_profile": "portal-core::MathemeHarmonicProfile",
                            "source_contract": "S0 Bedrock7/PointerWeb36/CF7",
                            "pointer_anchor": {
                                "lens_anchor": "L2",
                                "web_cardinality": 36
                            }
                        }
                    }
                }
            }),
        )
        .await
        .expect("kernel profile observation deposit should return an honest runtime envelope");

    assert_eq!(profile_deposit["coordinate"], "S5/S5'");
    assert_eq!(profile_deposit["runtimeOwner"], "S3'");
    assert_eq!(
        profile_deposit["method"],
        "s5.episodic.kernel_profile_observation.deposit"
    );
    assert_eq!(
        profile_deposit["deposit"]["metadata"]["coordinate_anchor"]["coordinate_anchor"]
            ["harmonic_pointer"]["pointer_anchor"]["lens_anchor"],
        "L2"
    );
    assert!(profile_deposit["runtimeAvailable"].is_boolean());
}

#[tokio::test]
async fn s5_graphiti_session_memory_requires_propagated_session_identity() {
    let mut client = TestGatewayClient::connected_with_temp_store(18919).await;

    let error = client
        .request(
            "s5.episodic.deposit",
            json!({
                "sourceAgent": "aletheia",
                "content": "This should not enter memory without a propagated session identity."
            }),
        )
        .await
        .expect_err("Graphiti deposit must require propagated session identity");

    assert!(error.message.contains("sessionKey is required"));
}

#[tokio::test]
#[ignore = "requires live Neo4j, Redis, Graphiti adapter on port 37778, and a real GEMINI_API_KEY"]
async fn live_graphiti_runtime_round_trips_session_memory_through_gateway() {
    let mut client = TestGatewayClient::connected_with_temp_store(18937).await;
    let token = unique_live_graphiti_token();
    let session_key = format!("agent:live-graphiti-proof:{token}");
    let namespace_ref = "pratibimba-live-proof";
    let content = format!(
        "Live Graphiti runtime proof token {token}. Aletheia deposits this session memory for Epii review."
    );

    let deposit = client
        .request(
            "s5.episodic.deposit",
            json!({
                "sourceAgent": "aletheia",
                "sessionKey": session_key,
                "dayId": "08-05-2026",
                "namespaceRef": namespace_ref,
                "content": content,
                "qlPosition": "5'",
                "cp": "4.5",
                "cpf": "(5/0)"
            }),
        )
        .await
        .expect("live Graphiti deposit should return through the gateway");

    assert_eq!(deposit["coordinate"], "S5/S5'");
    assert_eq!(deposit["runtimeOwner"], "S3'");
    assert_eq!(deposit["invocationOwner"], "S5/S5'");
    assert_eq!(deposit["runtimeAvailable"], true);
    assert_eq!(deposit["sessionKey"], session_key);
    assert_eq!(deposit["namespaceRef"], namespace_ref);

    let search = client
        .request(
            "s5.episodic.search",
            json!({
                "query": "session memory Epii review",
                "agentId": "epii",
                "sessionKey": session_key,
                "dayId": "08-05-2026",
                "namespaceRef": namespace_ref,
                "limit": 5
            }),
        )
        .await
        .expect("live Graphiti search should return through the gateway");

    assert_eq!(search["runtimeAvailable"], true);
    let results = search["results"]
        .as_array()
        .expect("live Graphiti search should return a results array");
    assert!(
        !results.is_empty(),
        "live Graphiti search should recover facts from the deposited session namespace"
    );

    let episodes = reqwest::Client::new()
        .get(format!("{GRAPHITI_BASE_URL}/episodes"))
        .query(&[("group_id", session_key.as_str())])
        .send()
        .await
        .expect("live Graphiti episodes endpoint should respond")
        .json::<serde_json::Value>()
        .await
        .expect("live Graphiti episodes endpoint should return json");
    assert!(
        episodes["episodes"].to_string().contains(&token),
        "live Graphiti episode storage should preserve the exact proof token; episodes={episodes:#?}"
    );
}

#[tokio::test]
async fn s5_gnosis_context_retrieval_uses_distinct_anima_and_epii_capability_envelopes() {
    let env = TestEnv::with_fake_pi();
    let gnosis_root = env.home.join(".epi-logos/gnosis");
    std::fs::create_dir_all(&gnosis_root).unwrap();
    std::fs::write(
        gnosis_root.join("documents.json"),
        r#"[{
          "id":"doc-gnosis-1",
          "title":"session-source.md",
          "source_path":"session-source.md",
          "source_type":"Canonical",
          "notebook":"Research",
          "ingested_at":"2026-05-05T00:00:00Z",
          "chunks":[{"chunk_index":0,"section_heading":"Runtime","text":"propagated runtime identity lets Anima deposit work while Epii governs interpretation"}]
        }]"#,
    )
    .unwrap();

    let mut client = TestGatewayClient::connect(env, 18920).await;
    client.request("connect", json!({})).await.unwrap();

    let anima = client
        .request(
            "s5'.gnosis.context.retrieve",
            json!({
                "query": "runtime identity",
                "agentId": "anima",
                "sessionKey": "agent:main:main",
                "limit": 2
            }),
        )
        .await
        .expect("Anima should retrieve bounded gnosis context");
    let epii = client
        .request(
            "s5'.gnosis.context.retrieve",
            json!({
                "query": "governs interpretation",
                "agentId": "epii",
                "sessionKey": "agent:main:main",
                "limit": 2
            }),
        )
        .await
        .expect("Epii should retrieve governed gnosis context");

    assert_eq!(anima["coordinate"], "S5/S5'");
    assert_eq!(anima["storageSubstrate"], "S2");
    assert_eq!(anima["governanceOwner"], "S5'");
    assert_eq!(anima["access"]["agentId"], "anima");
    assert_eq!(anima["access"]["mayPromoteInterpretation"], false);
    assert_eq!(anima["access"]["requiresEpiiReview"], true);
    assert_eq!(anima["results"][0]["title"], "session-source.md");

    assert_eq!(epii["access"]["agentId"], "epii");
    assert_eq!(epii["access"]["mayPromoteInterpretation"], true);
    assert_eq!(epii["access"]["requiresHumanForIdentityMutation"], true);
    assert_eq!(epii["results"][0]["source_type"], "Canonical");
}
