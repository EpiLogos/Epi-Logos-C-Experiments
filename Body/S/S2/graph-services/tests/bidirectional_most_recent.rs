//! CCT-16 (iv) — the `MostRecent` conflict floor: ISO timestamps compare
//! lexicographically, a timestamped side beats a bare side, and two bare
//! sides are a refusal — never a guess. This is the graph → vault
//! return-path floor the wisdom-curation and canon-CLI tranches stand on.

use epi_s2_graph_services::{most_recent_winner, ConflictResolution, MostRecentWinner};

#[test]
fn newer_timestamp_wins_on_either_side() {
    assert_eq!(
        most_recent_winner(Some("2026-07-11T10:00:00Z"), Some("2026-07-10T10:00:00Z")).unwrap(),
        MostRecentWinner::Vault
    );
    assert_eq!(
        most_recent_winner(Some("2026-07-10T10:00:00Z"), Some("2026-07-11T10:00:00Z")).unwrap(),
        MostRecentWinner::Graph
    );
    // Ties go to the graph side — the canonical store is not overwritten
    // by an equally-old vault copy.
    assert_eq!(
        most_recent_winner(Some("2026-07-11T10:00:00Z"), Some("2026-07-11T10:00:00Z")).unwrap(),
        MostRecentWinner::Graph
    );
}

#[test]
fn a_timestamped_side_beats_a_bare_side() {
    assert_eq!(
        most_recent_winner(Some("2026-07-11T10:00:00Z"), None).unwrap(),
        MostRecentWinner::Vault
    );
    assert_eq!(
        most_recent_winner(None, Some("2026-07-11T10:00:00Z")).unwrap(),
        MostRecentWinner::Graph
    );
}

#[test]
fn both_sides_bare_is_a_refusal_never_a_guess() {
    let error = most_recent_winner(None, None).unwrap_err();
    assert!(error.contains("dcterms_modified"), "{error}");
}

#[test]
fn most_recent_strategy_parses_from_the_cli_flag() {
    assert!(matches!(
        ConflictResolution::from_str("most-recent"),
        ConflictResolution::MostRecent
    ));
}
