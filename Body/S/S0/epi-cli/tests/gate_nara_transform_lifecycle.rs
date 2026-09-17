//! Coordinate: S0/M4' (transform-container lifecycle proof - 25.T25.11)
//! Residency: Body/S/S0/epi-cli/tests
//! Position (#n): real gateway/filesystem verification boundary
//! Actualises: governed transform start/advance transitions, explicit
//!   back-step confirmation, contemplative artifacts, and active NOW state.
//! Public surface: `cargo test --test gate_nara_transform_lifecycle`.
//! Does NOT own: alchemical vocabulary, M4 carrier rendering, or YAML law.
//! Contract: [[S0-SPEC]] / [[S1-SPEC]] / [[S3-SPEC]] / [[M4'-SPEC]].

mod support;

use serde_json::json;
use std::fs;
use support::{TestEnv, TestGatewayClient};

#[tokio::test]
async fn transform_lifecycle_persists_canonical_transitions_and_requires_confirmed_backsteps() {
    let env = TestEnv::with_fake_pi();
    let now_path = env.root.join("session").join("now.md");
    fs::create_dir_all(now_path.parent().unwrap()).unwrap();
    fs::write(
        &now_path,
        "---\ncoordinate: M4\nc_4_artifact_role: session-now\n---\n\n# NOW\n",
    )
    .unwrap();
    let nara_home = env.root.join("nara");
    let env = env
        .with_env("EPI_NOW_PATH", now_path.to_string_lossy())
        .with_env("EPI_NARA_HOME", nara_home.to_string_lossy());
    let mut client = TestGatewayClient::connect(env, 18950).await;
    client.request("connect", json!({})).await.unwrap();

    let bohm = client
        .request(
            "nara.transform.start",
            json!({ "container": "bohm-dialogue" }),
        )
        .await
        .expect("Bohm transform should start through the real gateway");
    assert_eq!(bohm["container"], "bohm-dialogue");
    assert_eq!(bohm["stageIndex"], 0);
    assert_eq!(bohm["stage"]["id"], "bohm-suspension");
    assert_eq!(bohm["stage"]["alchemicalOp"], "nigredo");
    assert_eq!(bohm["stages"].as_array().unwrap().len(), 5);
    assert_eq!(bohm["transition"]["kind"], "contemplative");
    assert_eq!(bohm["transition"]["payload"]["fromStage"], "unstarted");
    assert_eq!(bohm["transition"]["payload"]["toStage"], "bohm-suspension");

    let advanced = client
        .request(
            "nara.transform.advance",
            json!({
                "container": "bohm-dialogue",
                "expectedStage": "bohm-suspension"
            }),
        )
        .await
        .expect("forward transition should advance");
    assert_eq!(advanced["stageIndex"], 1);
    assert_eq!(advanced["stage"]["id"], "bohm-proprioception");
    assert_eq!(advanced["stage"]["alchemicalOp"], "separatio");

    let refused = client
        .request(
            "nara.transform.advance",
            json!({
                "container": "bohm-dialogue",
                "direction": "regress",
                "expectedStage": "bohm-proprioception"
            }),
        )
        .await
        .expect_err("an unconfirmed back-step must fail closed");
    assert!(refused.message.contains("confirmedBackstep"));

    let regressed = client
        .request(
            "nara.transform.advance",
            json!({
                "container": "bohm-dialogue",
                "direction": "regress",
                "confirmedBackstep": true,
                "expectedStage": "bohm-proprioception"
            }),
        )
        .await
        .expect("an explicitly confirmed back-step should persist");
    assert_eq!(regressed["stage"]["id"], "bohm-suspension");
    assert_eq!(regressed["direction"], "regress");

    let mut operations = bohm["stages"]
        .as_array()
        .unwrap()
        .iter()
        .map(|stage| stage["alchemicalOp"].as_str().unwrap().to_owned())
        .collect::<std::collections::BTreeSet<_>>();
    for (container, stage_count, first_stage, first_op) in [
        ("talking-circle", 4, "circle-passage", "solutio"),
        ("diamond", 4, "diamond-essence", "fixatio"),
    ] {
        let started = client
            .request("nara.transform.start", json!({ "container": container }))
            .await
            .expect("canonical container should start");
        assert_eq!(started["container"], container);
        assert_eq!(started["stageCount"], stage_count);
        assert_eq!(started["stage"]["id"], first_stage);
        assert_eq!(started["stage"]["alchemicalOp"], first_op);
        operations.extend(
            started["stages"]
                .as_array()
                .unwrap()
                .iter()
                .map(|stage| stage["alchemicalOp"].as_str().unwrap().to_owned()),
        );
    }
    assert_eq!(
        operations,
        [
            "calcinatio",
            "coagulatio",
            "conjunctio",
            "fixatio",
            "nigredo",
            "separatio",
            "solutio",
            "sublimatio",
        ]
        .into_iter()
        .map(str::to_owned)
        .collect()
    );

    let persisted_now = fs::read_to_string(&now_path).unwrap();
    let frontmatter = persisted_now
        .strip_prefix("---\n")
        .unwrap()
        .split_once("\n---\n")
        .unwrap()
        .0;
    let yaml: serde_yaml::Value = serde_yaml::from_str(frontmatter).unwrap();
    assert_eq!(yaml["c_4_active_alchemical_op"], "fixatio");
    assert!(persisted_now.ends_with("# NOW\n"));

    let artifact_dir = now_path.parent().unwrap().join("transform-transitions");
    let mut artifacts = fs::read_dir(&artifact_dir)
        .expect("transition artifact directory should exist")
        .map(|entry| entry.unwrap().path())
        .collect::<Vec<_>>();
    artifacts.sort();
    assert_eq!(artifacts.len(), 5);
    let artifact = fs::read_to_string(&artifacts[1]).unwrap();
    assert!(artifact.contains("kind: contemplative"));
    assert!(artifact.contains("container: bohm-dialogue"));
    assert!(artifact.contains("fromStage: bohm-suspension"));
    assert!(artifact.contains("toStage: bohm-proprioception"));
    assert!(artifact.contains("alchemical_op: separatio"));

    let state: serde_json::Value = serde_json::from_str(
        &fs::read_to_string(nara_home.join("transform").join("active.json")).unwrap(),
    )
    .unwrap();
    assert_eq!(state["container"], "diamond");
    assert_eq!(state["stageIndex"], 0);
}
