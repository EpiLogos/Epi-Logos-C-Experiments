use epi_s2_graph_services::collect_report;

fn repo_root() -> std::path::PathBuf {
    std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .ancestors()
        .nth(3)
        .expect("graph-services lives under Body/S/S2")
        .to_path_buf()
}

#[tokio::test]
async fn doctor_reports_separate_plugin_and_projection_readiness_without_stubs() {
    let report = collect_report(&repo_root()).await;
    let payload = serde_json::to_value(&report).expect("doctor report serializes");

    for field in [
        "neo4j",
        "schema",
        "apoc",
        "n10s",
        "owl2Rl",
        "gds",
        "privacyProjection",
    ] {
        assert!(
            payload[field].is_object(),
            "doctor JSON must expose separate {field} readiness: {payload}"
        );
        assert!(
            payload[field]["ok"].is_boolean(),
            "{field}.ok must be explicit boolean readiness: {payload}"
        );
        assert!(
            payload[field]["status"].is_string(),
            "{field}.status must be explicit ready/blocked state: {payload}"
        );
    }

    for field in ["apoc", "n10s", "gds"] {
        assert_eq!(payload[field]["required"], true);
        assert!(
            payload[field]["procedurePrefix"]
                .as_str()
                .unwrap()
                .ends_with('.'),
            "{field} must name the actual Neo4j procedure namespace it checked"
        );
        assert!(
            payload[field]["checkedQuery"]
                .as_str()
                .unwrap()
                .starts_with("SHOW PROCEDURES"),
            "{field} must use a live Neo4j procedure check, not a stub"
        );
        if payload[field]["ok"] == false {
            assert_eq!(payload[field]["status"], "blocked");
            assert!(
                payload[field]["fallback"].is_string(),
                "{field} absence must provide an explicit fallback/blocking explanation"
            );
        }
    }

    assert_eq!(
        payload["privacyProjection"]["projectionStrategy"],
        "gds-option-1-public-coordinate-overlay"
    );
    assert_eq!(payload["privacyProjection"]["requiresGds"], true);
    assert!(
        payload["privacyProjection"]["excludedLabels"]
            .as_array()
            .unwrap()
            .iter()
            .any(|label| label == "GraphitiEpisode"),
        "privacy projection must exclude protected Graphiti/Nara labels"
    );
}
