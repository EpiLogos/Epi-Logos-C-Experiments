mod common;

use common::{run_epi, write_file, TestEnv};
use epi_logos::techne::gnosis::{
    config::GnosisConfig,
    ingest::{chunk_markdown, ingest_path, ChunkingOptions},
    query::{query_local_report, DisclosureLevel, QueryOptions},
};

#[test]
fn chunker_keeps_section_context() {
    let content = "# Intro\nalpha beta gamma\n\n## Detail\nbeta gamma delta epsilon";
    let chunks = chunk_markdown(content, &ChunkingOptions::for_tests(4, 1));

    assert!(chunks.len() >= 2);
    assert_eq!(chunks[0].section_heading.as_deref(), Some("Intro"));
    assert!(chunks
        .iter()
        .any(|chunk| chunk.section_heading.as_deref() == Some("Detail")));
    assert!(chunks[1].text.contains("gamma"));
}

#[test]
fn gnosis_notebook_ingest_query_and_book_commands_use_local_store() {
    let env = TestEnv::repo_with_assets()
        .with_env("EPILOGOS_VAULT", env_path_placeholder())
        .with_env("EPILOGOS_ROOT", "/tmp")
        .with_env("EPI_GNOSIS_CHUNK_WORDS", "4")
        .with_env("EPI_GNOSIS_OVERLAP_WORDS", "1");

    let source = write_file(
        env.repo_root.join("fixtures/source.md"),
        "# Intro\nalpha beta gamma delta\n\n## Detail\nbeta gamma delta epsilon\n",
    );

    let create = run_epi(
        ["techne", "gnosis", "notebook", "create", "Research"].as_slice(),
        &env,
    );
    assert!(create.stdout.contains("Research"));

    let ingest = run_epi(
        [
            "techne",
            "gnosis",
            "ingest",
            source.to_str().unwrap(),
            "--notebook",
            "Research",
            "--source-type",
            "Books",
        ]
        .as_slice(),
        &env,
    );
    assert!(ingest.stdout.contains("stored"));

    let docs = run_epi(
        [
            "techne",
            "gnosis",
            "document",
            "list",
            "--notebook",
            "Research",
        ]
        .as_slice(),
        &env,
    );
    assert!(docs.stdout.contains("source.md"));

    let query = run_epi(
        [
            "techne",
            "gnosis",
            "query",
            "gamma epsilon",
            "--notebook",
            "Research",
        ]
        .as_slice(),
        &env,
    );
    assert!(query.stdout.contains("Detail"));

    let book_ingest = run_epi(
        ["book", "ingest", source.to_str().unwrap()].as_slice(),
        &env,
    );
    assert!(book_ingest.stdout.contains("Books"));

    let book_list = run_epi(["book", "list"].as_slice(), &env);
    assert!(book_list.stdout.contains("source.md"));

    let book_status = run_epi(["book", "status"].as_slice(), &env);
    assert!(book_status.stdout.contains("books:"));

    let book_ask = run_epi(
        ["book", "ask", "gamma epsilon", "--book", "source.md"].as_slice(),
        &env,
    );
    assert!(book_ask.stdout.contains("Detail"));
}

#[test]
fn gnosis_query_report_proves_s5_world_return_over_s2_substrate() {
    let env = TestEnv::repo_with_assets()
        .with_env("EPI_GNOSIS_CHUNK_WORDS", "4")
        .with_env("EPI_GNOSIS_OVERLAP_WORDS", "1");
    let _guard = env.apply_to_process();
    let config = GnosisConfig::from_env();

    let canonical = write_file(
        env.repo_root.join("fixtures/canonical.md"),
        "# Canon\nalpha beta gamma delta\n\n## Disclosure\nshared alpha source\n",
    );
    let book = write_file(
        env.repo_root.join("fixtures/book.md"),
        "# Book\nalpha epsilon zeta\n",
    );

    ingest_path(
        &config,
        canonical.to_str().unwrap(),
        Some("Research"),
        "Canonical",
    )
    .expect("canonical source should ingest");
    ingest_path(&config, book.to_str().unwrap(), None, "Books").expect("book source should ingest");

    let report = query_local_report(
        &config,
        "alpha",
        QueryOptions {
            notebook: Some("Research"),
            source_type: Some("Canonical"),
            title: None,
            top_k: 5,
        },
        DisclosureLevel::SourceSummary,
    )
    .expect("query report should be built from real local storage");

    assert_eq!(report.coordinate, "S5");
    assert_eq!(report.service, "gnosis");
    assert_eq!(report.storage_substrate, "S2");
    assert_eq!(report.governance_owner, "S5'");
    assert_eq!(report.disclosure_level, DisclosureLevel::SourceSummary);
    assert_eq!(
        report.source_selection.notebook.as_deref(),
        Some("Research")
    );
    assert_eq!(
        report.source_selection.source_type.as_deref(),
        Some("Canonical")
    );
    assert_eq!(report.hits.len(), 2);
    assert!(report.hits.iter().all(|hit| hit.source_type == "Canonical"));
    assert!(report
        .hits
        .iter()
        .all(|hit| hit.notebook.as_deref() == Some("Research")));
    assert!(report
        .hits
        .iter()
        .all(|hit| hit.disclosure.contains("Canonical")));
    assert!(!report.hits.iter().any(|hit| hit.title == "book.md"));
}

fn env_path_placeholder() -> String {
    "/tmp/gnosis-vault".to_string()
}
