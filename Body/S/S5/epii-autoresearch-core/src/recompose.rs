// ============================================================
// C6 — recompose_pass: the Möbius seam closure
//
// Iterates every pending entry in the inbox and emits a
// `RecomposeOutput` per entry. Each output carries a
// `NextComposeHint` (session_seed + proposed_p0_questions
// generated from improvement_vectors + challenger_artifacts
// carried from the entry's artifacts) and a `RecomposeDecision`.
// First-pass policy: every entry defaults to
// `RecomposeDecision::HumanReview` — explicit human gating is
// required before any autoresearch hint seeds the next
// Z-cycle's compose phase.
// ============================================================

use serde::{Deserialize, Serialize};

use crate::inbox::InboxStore;
use crate::ContinuityHint;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct NextComposeHint {
    /// session_id of the originating session.
    pub session_seed: String,
    /// One generated P0 question per improvement_vector.
    pub proposed_p0_questions: Vec<String>,
    /// Artifacts to revisit, carried from the entry's artifacts list.
    pub challenger_artifacts: Vec<String>,
    /// Generalized continuity hints that can be joined with full
    /// CrossCycleContinuity without replacing this Aletheia-specific hint.
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub continuity_hints: Vec<ContinuityHint>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct RecomposeOutput {
    pub entry_id: String,
    pub next_compose_hint: NextComposeHint,
    pub decision: RecomposeDecision,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum RecomposeDecision {
    Keep(String),
    Discard(String),
    HumanReview(String),
}

/// Produce a NextComposeHint per pending inbox entry — the Möbius seam
/// closure that seeds the next Z-cycle's compose phase from today's
/// Aletheia-routed autoresearch witness.
///
/// First-pass policy: every entry defaults to `RecomposeDecision::HumanReview`.
/// Future passes may learn to Keep/Discard autonomously, but the first
/// recompose pass requires an explicit human gate.
pub fn recompose_pass(store: &InboxStore) -> Result<Vec<RecomposeOutput>, String> {
    let entries = store.list_pending()?;
    let mut out = Vec::with_capacity(entries.len());
    for stored in entries {
        let entry_id = stored.id.clone();
        let proposed_p0_questions: Vec<String> = stored
            .entry
            .improvement_vectors
            .iter()
            .map(|v| format!("What if we {v}?"))
            .collect();
        out.push(RecomposeOutput {
            entry_id,
            next_compose_hint: NextComposeHint {
                session_seed: stored.entry.session_id.clone(),
                proposed_p0_questions,
                challenger_artifacts: stored.entry.artifacts.clone(),
                continuity_hints: vec![ContinuityHint {
                    kind: "aletheia_next_compose".to_owned(),
                    summary: format!(
                        "carry {} improvement vector(s) from {} into next compose",
                        stored.entry.improvement_vectors.len(),
                        stored.id
                    ),
                    candidate_id: None,
                    route_id: None,
                    orchestration_id: None,
                }],
            },
            decision: RecomposeDecision::HumanReview(
                "first recompose pass requires human gate".to_owned(),
            ),
        });
    }
    Ok(out)
}
