//! Tranche 6.12 §(iii) acceptance: the `m5.q_review` TUI portal pane renders
//! the S5 QReviewQueue as a card stack and honours the VAK context-frame (cf)
//! filter. The queue here is produced by the real detector pipeline
//! (`epii_self_referential_read`) over a seeded corpus, so this is a genuine
//! substrate → pane proof, not a hand-mocked fixture.

use epi_logos::portal::plugins::m5::M5QReviewPlugin;
use epi_s5_epii_autoresearch_core::{
    epii_self_referential_read, BimbaNodeSnapshot, CorpusSnapshot, QDetectorConfig, QReviewQueue,
    QReviewReasonClass, ResonanceEdgeSnapshot,
};
use ratatui::buffer::Buffer;
use ratatui::layout::Rect;
use ratatui_hypertile_extras::HypertilePlugin;
use std::collections::BTreeMap;

fn embedding(seed: f64) -> Vec<f64> {
    (0..3072)
        .map(|i| if i % 2 == 0 { seed } else { 1.0 - seed })
        .collect()
}

fn node(
    coordinate: &str,
    family: &str,
    position: &str,
    lens: &str,
    q: &[(&str, &str)],
    review_epoch: u64,
) -> BimbaNodeSnapshot {
    let mut review_epochs = BTreeMap::new();
    review_epochs.insert("qm_5_i0_review_epoch".to_owned(), review_epoch);
    BimbaNodeSnapshot {
        coordinate: coordinate.to_owned(),
        namespace: "bimba".to_owned(),
        c_4_family: family.to_owned(),
        c_4_ql_position: position.to_owned(),
        c_4_lens: lens.to_owned(),
        q_values: q
            .iter()
            .map(|(k, v)| ((*k).to_owned(), (*v).to_owned()))
            .collect(),
        review_epochs,
        embedding_3072: embedding(0.7),
    }
}

fn detector_config() -> QDetectorConfig {
    QDetectorConfig {
        articulation_gap_peer_ratio: 0.75,
        contradiction_vector_disagreement_threshold: 0.35,
        resonance_promotion_confidence_threshold: 0.85,
        stale_revision_threshold: 100,
        priority_order: vec![
            QReviewReasonClass::ArticulationGap,
            QReviewReasonClass::PromotionCandidate,
            QReviewReasonClass::ContradictionCandidate,
            QReviewReasonClass::StaleByNonRevisit,
        ],
    }
}

/// Seeded corpus that deterministically yields exactly two candidates on two
/// distinct VAK context frames: an articulation gap on `(4.5/0)` and a
/// resonance-promotion candidate on `(5/0)`.
fn seeded_queue() -> QReviewQueue {
    let corpus = CorpusSnapshot {
        day_id: "07-05-2026".to_owned(),
        graph_revision: 20,
        nodes: vec![
            // Cluster peer carrying the full key set.
            node(
                "M0-0",
                "M",
                "0",
                "L0",
                &[
                    ("q_2_i0_operational_logic", "held in ground discipline"),
                    ("q_5_i0_integration_template", "ground returns to source"),
                ],
                20,
            ),
            // Same cluster, strict subset of the peer's keys -> exactly one
            // articulation gap (missing q_5_i0_integration_template).
            node(
                "M0-1",
                "M",
                "0",
                "L0",
                &[("q_2_i0_operational_logic", "held")],
                20,
            ),
        ],
        canonical_relations: vec![],
        resonance_edges: vec![ResonanceEdgeSnapshot {
            source_coordinate: "M2-3".to_owned(),
            target_coordinate: "gnosis://epii/vibrational-pattern".to_owned(),
            confidence: 0.93,
            has_canonical_bimba_relation: false,
            source_namespace: "bimba".to_owned(),
            target_namespace: "gnosis".to_owned(),
        }],
    };
    let queue = epii_self_referential_read(corpus, 20, &detector_config())
        .expect("seeded corpus produces a queue");
    // Sanity: the fixture yields the two expected mixed-reason candidates.
    assert!(queue
        .entries
        .iter()
        .any(|e| e.reason_class == QReviewReasonClass::ArticulationGap
            && e.target_coordinate == "M0-1"));
    assert!(queue
        .entries
        .iter()
        .any(|e| e.reason_class == QReviewReasonClass::PromotionCandidate
            && e.target_coordinate == "M2-3"));
    queue
}

fn render_to_string(plugin: &M5QReviewPlugin, width: u16, height: u16) -> String {
    let area = Rect::new(0, 0, width, height);
    let mut buf = Buffer::empty(area);
    plugin.render(area, &mut buf, true);
    let mut out = String::new();
    for y in 0..area.height {
        for x in 0..area.width {
            out.push_str(buf[(x, y)].symbol());
        }
        out.push('\n');
    }
    out
}

#[test]
fn m5_q_review_pane_renders_queue_as_card_stack() {
    let plugin = M5QReviewPlugin::with_queue(seeded_queue());
    let content = render_to_string(&plugin, 100, 24);

    // Header + day binding.
    assert!(content.contains("Q-Review Queue"), "pane title present");
    assert!(content.contains("07-05-2026"), "day binding rendered");
    assert!(
        content.contains("2 candidate(s)"),
        "candidate count rendered"
    );

    // Both candidate cards: target coordinate + reason_class + action.
    assert!(
        content.contains("M0-1"),
        "articulation-gap target coordinate"
    );
    assert!(
        content.contains("articulation_gap"),
        "articulation reason class"
    );
    assert!(content.contains("M2-3"), "promotion target coordinate");
    assert!(
        content.contains("promotion_candidate"),
        "promotion reason class"
    );
    assert!(
        content.contains("open_in_pair_composition"),
        "pair-composition action offered on the card"
    );
    // The existing q_* articulation is surfaced for editing.
    assert!(
        content.contains("q_5_i0_integration_template"),
        "q key surfaced"
    );
}

#[test]
fn m5_q_review_pane_filters_by_active_context_frame() {
    // Filter to the promotion surface `(5/0)`: only the promotion candidate
    // must remain; the articulation-gap card (cf `(4.5/0)`) is hidden.
    let plugin = M5QReviewPlugin::with_queue_filtered(seeded_queue(), "(5/0)");
    let content = render_to_string(&plugin, 100, 24);

    assert!(
        content.contains("1 candidate(s)"),
        "cf filter narrows the stack"
    );
    assert!(
        content.contains("M2-3"),
        "promotion candidate on (5/0) visible"
    );
    assert!(
        content.contains("cf-filter: (5/0)"),
        "active cf reported in footer"
    );
    assert!(
        !content.contains("articulation_gap"),
        "articulation gap on (4.5/0) is filtered out"
    );
    assert!(!content.contains("M0-1"), "filtered-out coordinate absent");
}

#[test]
fn m5_q_review_pane_renders_honest_empty_state() {
    let plugin = M5QReviewPlugin::new();
    let content = render_to_string(&plugin, 100, 12);
    assert!(
        content.contains("no Q-review queue for this day"),
        "empty pane is honest, not fabricated"
    );
}
