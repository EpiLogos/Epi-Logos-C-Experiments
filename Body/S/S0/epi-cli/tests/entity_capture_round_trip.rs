//! CCT-14 CLI parity — an orphan entity captured via the CLI follows the
//! same lifecycle as one captured via the gateway: `epi entity capture`
//! calls the SAME `gate::s1_hen::entity_capture` handler the gateway
//! dispatch arm calls, so the receipt, the candidate file, and the graph
//! promotion intent are identical by construction (DR-S5-ONE-1).

use std::fs;
use std::path::PathBuf;

use epi_logos::entity::{dispatch as entity_dispatch, EntityCmd};
// T53.04: the s1'.* handlers live at their coordinate now.
use epi_s1_hen_compiler_core::s1_handlers as s1_hen;
use serde_json::{json, Value};

fn fixture_vault() -> PathBuf {
    let unique = format!(
        "epi-entity-capture-{}-{}",
        std::process::id(),
        uuid::Uuid::new_v4().simple()
    );
    let root = std::env::temp_dir().join(unique);
    fs::create_dir_all(&root).expect("create fixture vault root");
    root
}

#[test]
fn entity_capture_round_trip() {
    let vault = fixture_vault();
    // This test file is its own process: the env-based vault root stays
    // hermetic to this test binary.
    std::env::set_var("EPILOGOS_VAULT", &vault);

    // A loose root note (Obsidian-created, no frontmatter) to capture.
    fs::write(
        vault.join("Loose Thought.md"),
        "A loose root note that mentions [[Anima]].\n",
    )
    .unwrap();

    // 1. Capture via the CLI command surface.
    let out = entity_dispatch(
        &EntityCmd::Capture {
            source: "Loose Thought.md".to_owned(),
            day: Some("10-07-2026".to_owned()),
            creator: Some("hen".to_owned()),
        },
        true,
    )
    .expect("epi entity capture succeeds");
    let cli_receipt: Value = serde_json::from_str(&out).unwrap();
    assert_eq!(
        cli_receipt["candidatePath"],
        "Idea/Empty/Present/10-07-2026/entities/Loose Thought.md"
    );
    assert_eq!(cli_receipt["candidateState"], "candidate");
    assert_eq!(cli_receipt["birthCodonState"], "provisional");
    let cli_codon = cli_receipt["birthCodon"].as_u64().unwrap();
    assert!(cli_codon < 64);

    // The candidate file landed with lifecycle + birth-codon frontmatter,
    // body carried over.
    let candidate_abs = vault.join("Idea/Empty/Present/10-07-2026/entities/Loose Thought.md");
    let written = fs::read_to_string(&candidate_abs).unwrap();
    assert!(written.contains("candidate_state: candidate"));
    assert!(written.contains("crystallisation_state: entity_candidate"));
    assert!(written.contains(&format!("c_5_birth_codon: {cli_codon}")));
    assert!(written.contains("birth_codon_state: provisional"));
    assert!(written.contains("A loose root note that mentions [[Anima]]."));

    // 2. Gateway parity: the same capture through the handler the gateway
    //    dispatch arm calls produces an identical receipt (same codon —
    //    same body, same day, same creator, same coordinate path).
    let gateway_receipt = s1_hen::entity_capture(&json!({
        "source": "Loose Thought.md",
        "dayId": "10-07-2026",
        "creatorIdentity": "hen",
        "vaultRoot": vault.to_string_lossy(),
    }))
    .expect("gateway-path capture succeeds");
    assert_eq!(gateway_receipt, cli_receipt);

    // 3. The candidate continues the lifecycle: classify via CLI.
    let out = entity_dispatch(
        &EntityCmd::Classify {
            candidate_id: "Idea/Empty/Present/10-07-2026/entities/Loose Thought.md".to_owned(),
            c_layer: Some("C2".to_owned()),
        },
        true,
    )
    .expect("epi entity classify succeeds");
    let classify_receipt: Value = serde_json::from_str(&out).unwrap();
    assert_eq!(classify_receipt["typeCoordinate"], "C2");
    assert_eq!(classify_receipt["birthCodonState"], "provisional");

    // 4. The review surface lists the candidate with its codon.
    let out = entity_dispatch(
        &EntityCmd::List {
            state: Some("candidate".to_owned()),
            day: Some("10-07-2026".to_owned()),
        },
        true,
    )
    .expect("epi entity list succeeds");
    let list: Value = serde_json::from_str(&out).unwrap();
    let entries = list["entries"].as_array().unwrap();
    assert_eq!(entries.len(), 1);
    assert_eq!(entries[0]["state"], "candidate");
    assert_eq!(entries[0]["title"], "Loose Thought");
    assert!(entries[0]["birthCodon"].as_u64().unwrap() < 64);

    fs::remove_dir_all(&vault).ok();
}

#[test]
fn dangling_wikilink_capture_creates_a_stub_candidate() {
    let vault = fixture_vault();

    // Bare wikilink target (no source file): handler path with explicit
    // vaultRoot so this test does not touch process env.
    let receipt = s1_hen::entity_capture(&json!({
        "source": "Kairos Bell",
        "dayId": "10-07-2026",
        "vaultRoot": vault.to_string_lossy(),
    }))
    .expect("dangling-link capture succeeds");
    assert_eq!(
        receipt["candidatePath"],
        "Idea/Empty/Present/10-07-2026/entities/Kairos Bell.md"
    );
    let written =
        fs::read_to_string(vault.join("Idea/Empty/Present/10-07-2026/entities/Kairos Bell.md"))
            .unwrap();
    assert!(written.contains("Captured entity candidate for [[Kairos Bell]]."));

    fs::remove_dir_all(&vault).ok();
}
