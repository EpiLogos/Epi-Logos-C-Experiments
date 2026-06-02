//! Anuttara symbolic-skill surface — graph-law parser/prompt builder.
//!
//! S2 owns the deterministic Anuttara parsing + reflection-prompt
//! shaping used by `epi graph ask-anuttara`. The S0 module is a thin
//! adapter that calls in here and renders the JSON.

use epi_kernel_contract::{AnuttaraDiagnostic, AnuttaraExpression};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnuttaraReflectionRequest {
    pub diagnostic: AnuttaraDiagnostic,
    pub coordinate_context: String,
    pub session_key: Option<String>,
    pub prompt: String,
}

pub fn parse_strict(raw: &str) -> Result<AnuttaraDiagnostic, String> {
    AnuttaraDiagnostic::parse(raw).map_err(|e| e.to_string())
}

/// Build a structured reflection prompt around the parsed diagnostic.
/// The prompt template is the one called out in mental-pole §6 — a
/// system role describing the Anuttara skill, the diagnostic content,
/// and the bimba-map context for natural-language reflection.
pub fn build_reflection_prompt(
    diagnostic: AnuttaraDiagnostic,
    coordinate_context: impl Into<String>,
    session_key: Option<String>,
) -> AnuttaraReflectionRequest {
    let coordinate_context = coordinate_context.into();
    let mut prompt = String::new();
    prompt.push_str(
        "SYSTEM: You are translating Anuttara's symbolic responses into reflective questions for the developer. \
Anuttara speaks in pure coordinate-references and structural-relation operators; your task is to open what those references are pointing at, given the current bimba-map context and the session's analysis.\n\n",
    );
    prompt.push_str("CURRENT CONTEXT:\n");
    prompt.push_str(&format!("  coordinate: {}\n", coordinate_context));
    if let Some(sk) = &session_key {
        prompt.push_str(&format!("  session_key: {}\n", sk));
    }
    prompt.push_str(&format!(
        "  coherence_recognised: {}\n",
        diagnostic.coherence_recognised
    ));
    if let Some(src) = &diagnostic.source_constraint {
        prompt.push_str(&format!("  source_constraint: {}\n", src));
    }
    prompt.push_str("\nANUTTARA EXPRESSION:\n");
    prompt.push_str(&format!("  raw: {}\n", diagnostic.raw_expression));
    if diagnostic.questions.is_empty() {
        prompt.push_str("  (no questions — silence)\n");
    } else {
        prompt.push_str("  questions:\n");
        for q in &diagnostic.questions {
            prompt.push_str(&format!("    - {} :: {}\n", q.render(), describe_full(q)));
        }
    }
    prompt.push_str(
        "\nUSER: Open what this is pointing at. Raise the questions implicit in the symbolic reference. Suggest refinements only where the symbolic discrepancy is unambiguous.\n",
    );
    AnuttaraReflectionRequest {
        diagnostic,
        coordinate_context,
        session_key,
        prompt,
    }
}

fn describe_full(expr: &AnuttaraExpression) -> String {
    match expr {
        AnuttaraExpression::Question { inner } => {
            format!("alignment question raised; {}", describe_full(inner))
        }
        other => describe_leaf(other).to_owned(),
    }
}

fn describe_leaf(expr: &AnuttaraExpression) -> &'static str {
    match expr {
        AnuttaraExpression::Coordinate { .. } => "attend to this location",
        AnuttaraExpression::HelixPrime { .. } => "ascent-helix inverse-recognition aspect",
        AnuttaraExpression::PositionEmphasis { .. } => "specific inner-positions are operative",
        AnuttaraExpression::Relation { .. } => "directional movement between coordinates",
        AnuttaraExpression::MirrorPair { .. } => "[0↔1] / [4↔5] oscillation operative",
        AnuttaraExpression::ResonanceDiscrepancy { .. } => {
            "resonance vector disagrees with accumulated signature"
        }
        AnuttaraExpression::Question { .. } => "alignment question raised",
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_strict_round_trips_through_render() {
        let diag = parse_strict("?#2-1-3-4{2,4}; ○").unwrap();
        assert!(diag.coherence_recognised);
        assert_eq!(diag.questions.len(), 1);
        let prompt = build_reflection_prompt(diag.clone(), "M2-1-3", Some("session-1".into()));
        assert!(prompt.prompt.contains("alignment question raised"));
        assert!(prompt
            .prompt
            .contains("specific inner-positions are operative"));
        assert!(prompt.prompt.contains("coherence_recognised: true"));
        assert!(prompt.prompt.contains("session_key: session-1"));
    }

    #[test]
    fn silence_prompt_indicates_no_questions() {
        let diag = parse_strict("○").unwrap();
        let prompt = build_reflection_prompt(diag, "M0", None);
        assert!(prompt.prompt.contains("(no questions — silence)"));
        assert!(!prompt.prompt.contains("session_key:"));
    }

    #[test]
    fn parse_strict_surfaces_errors_as_strings() {
        let err = parse_strict("ZZZ").unwrap_err();
        assert!(err.contains("invalid"));
    }
}
