use epi_logos::agent::vak::{cf_to_agent, evaluate_vak};

#[test]
fn vak_evaluation_assigns_six_layers() {
    let task = "Write a function that parses frontmatter";
    let result = evaluate_vak(task);
    assert!(result.cpf.is_some(), "CPF required");
    assert!(result.ct.is_some(), "CT required");
    assert!(result.cp.is_some(), "CP required");
    assert!(result.cf.is_some(), "CF required");
    assert!(result.cfp.is_some(), "CFP required");
    assert!(result.cs.is_some(), "CS required");
}

#[test]
fn vak_evaluation_returns_valid_cf_codes() {
    let valid_cf_codes = [
        "(0/1)",
        "(0/1/2)",
        "(0/1/2/3)",
        "(4.0/1-4.4/5)",
        "(4.5/0)",
        "(5/0)",
        "(00/00)",
    ];
    let task = "Design the overall architecture";
    let result = evaluate_vak(task);
    let cf = result.cf.as_deref().unwrap_or("");
    assert!(
        valid_cf_codes.contains(&cf),
        "CF code must be canonical, got: {cf}"
    );
}

#[test]
fn cf_to_agent_maps_all_codes() {
    assert_eq!(cf_to_agent("(0/1)"), "logos");
    assert_eq!(cf_to_agent("(0/1/2)"), "eros");
    assert_eq!(cf_to_agent("(0/1/2/3)"), "mythos");
    assert_eq!(cf_to_agent("(4.0/1-4.4/5)"), "anima");
    assert_eq!(cf_to_agent("(4.5/0)"), "psyche");
    assert_eq!(cf_to_agent("(5/0)"), "sophia");
    assert_eq!(cf_to_agent("(00/00)"), "nous");
    assert_eq!(cf_to_agent("unknown"), "psyche"); // default
}

#[test]
fn vak_test_tasks_route_to_eros() {
    let result = evaluate_vak("Write tests for the archive_day function");
    assert_eq!(
        result.cf.as_deref(),
        Some("(0/1/2)"),
        "test tasks should route to eros"
    );
}

#[test]
fn vak_review_tasks_route_to_sophia() {
    let result = evaluate_vak("Review and summarize today's work");
    assert_eq!(
        result.cf.as_deref(),
        Some("(5/0)"),
        "review tasks should route to sophia"
    );
}
