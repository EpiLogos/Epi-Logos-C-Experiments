use epi_s5_epii_agent_core::EpiiAgentAccess;

const IMPROVEMENT_FIXTURE: &str =
    include_str!("../../fixtures/track-04-t0/s5-improvement-state.json");
const REVIEW_FIXTURE: &str = include_str!("../../fixtures/track-04-t0/s5-review-state.json");

#[test]
fn tranche_04_t0_agent_snapshot_reads_fixture_state_without_placeholders() {
    let root = temp_root("baseline-agent-fixture");
    let review_root = root.join("s5/epii-review");
    let improvement_root = root.join("s5/epii-autoresearch");
    std::fs::create_dir_all(&review_root).expect("review root");
    std::fs::create_dir_all(&improvement_root).expect("improvement root");
    std::fs::write(review_root.join("s5-review-state.json"), REVIEW_FIXTURE)
        .expect("write review fixture");
    std::fs::write(
        improvement_root.join("s5-improvement-state.json"),
        IMPROVEMENT_FIXTURE,
    )
    .expect("write improvement fixture");

    let snapshot = EpiiAgentAccess::new(&root)
        .snapshot()
        .expect("snapshot should read real fixture state");

    assert_eq!(snapshot.review.open_count, 1);
    assert_eq!(snapshot.review.human_required_count, 1);
    assert_eq!(snapshot.review.resolved_count, 1);
    assert_eq!(snapshot.improvement.total_runs, 2);
    assert_eq!(snapshot.improvement.keep_count, 1);
    assert_eq!(snapshot.improvement.active_count, 1);
    assert!(snapshot
        .gateway_methods
        .contains(&"s5'.epii.deposit".to_owned()));
}

fn temp_root(name: &str) -> std::path::PathBuf {
    let root =
        std::env::temp_dir().join(format!("epi-s5-epii-agent-{name}-{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&root);
    std::fs::create_dir_all(&root).expect("temp root");
    root
}
