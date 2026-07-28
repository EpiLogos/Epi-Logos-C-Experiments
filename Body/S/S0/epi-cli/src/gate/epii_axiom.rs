// S0 ADAPTER: Body/S/S5 (epii axiom-translation authority) — physically S0, conceptually S5'. The producer and its persisted store answer to Epii; this file is the gateway membrane over them.
//! Coordinate: S0 gateway membrane for M5' (26.T26.14 axiom-translation producer)
//! Residency: Body/S/S0/epi-cli/src/gate — physical S0, conceptual S5' (epii).
//! Position (#n): the Pi axiom-translation producer + its persisted store.
//! Actualises: `s5'.epii.axiom_translate` runs a candidate canonical
//!   articulation through the DR-B-2 chain — Philosophical English → Formal
//!   Notation → OWL → SHACL — one model invocation per step over the PI harness
//!   (the provider-agnostic selector; never a bespoke provider client, per the
//!   epi-gnostic anti-pattern the M1' spec forbids), persists the session, and
//!   returns it; `s5'.epii.axiom_translation_history` reads the persisted
//!   sessions. Each step is verified `pi`; the session stays `pending` until a
//!   human final-validates (CLAUDE.md ur-process: Human = Vision + Final
//!   Validation).
//! Public surface: AxiomForm, AxiomTranslationStep, AxiomTranslationSession,
//!   translate, pi_harness_invoke, persist, history.
//! Does NOT own: model choice (the slot CLI resolves it, DR-MODEL-1) or the
//!   carrier inspector (`PiAxiomTranslationInspector`, a strict read consumer).
//! Contract: [[M5'-SPEC]], [[S0-SPEC]], [[S3-SPEC]].

use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum AxiomForm {
    #[serde(rename = "philosophical-english")]
    PhilosophicalEnglish,
    #[serde(rename = "formal-notation")]
    FormalNotation,
    #[serde(rename = "owl")]
    Owl,
    #[serde(rename = "shacl")]
    Shacl,
}

impl AxiomForm {
    fn label(self) -> &'static str {
        match self {
            AxiomForm::PhilosophicalEnglish => "philosophical English",
            AxiomForm::FormalNotation => "formal logical notation",
            AxiomForm::Owl => "OWL (Web Ontology Language)",
            AxiomForm::Shacl => "SHACL shapes",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AxiomTranslationStep {
    pub id: String,
    pub from_form: AxiomForm,
    pub to_form: AxiomForm,
    pub input_text: String,
    pub output_text: String,
    pub reasoning_trace: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub verified_by: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AxiomTranslationSession {
    pub id: String,
    pub initiating_dispatch_node_id: String,
    pub steps: Vec<AxiomTranslationStep>,
    pub verified_by: String,
}

/// The DR-B-2 translation chain: three ordered transitions.
const CHAIN: [(AxiomForm, AxiomForm); 3] = [
    (AxiomForm::PhilosophicalEnglish, AxiomForm::FormalNotation),
    (AxiomForm::FormalNotation, AxiomForm::Owl),
    (AxiomForm::Owl, AxiomForm::Shacl),
];

/// Injectable per-step model invocation `(prompt, slot) -> (output_text, trace)`.
/// Production wires `pi_harness_invoke`; tests inject a deterministic translator.
pub type StepInvoke<'a> = dyn Fn(&str, &str) -> Result<(String, String), String> + 'a;

fn build_prompt(from: AxiomForm, to: AxiomForm, input: &str) -> String {
    format!(
        "You are translating one canonical axiom between representations. \
         Translate the following {} into {}. Return only the translated form, no preface.\n\n{}",
        from.label(),
        to.label(),
        input
    )
}

/// Run the articulation through the full chain, one injected invocation per step.
/// The output of each step feeds the next; a session is `pending` until human-verified.
pub fn translate(
    articulation: &str,
    dispatch_node_id: &str,
    session_id: &str,
    slot: &str,
    invoke: &StepInvoke,
) -> Result<AxiomTranslationSession, String> {
    if articulation.trim().is_empty() {
        return Err("axiom translation requires a non-empty articulation".to_string());
    }
    let mut steps = Vec::with_capacity(CHAIN.len());
    let mut input = articulation.trim().to_string();
    for (index, (from, to)) in CHAIN.iter().enumerate() {
        let (output, trace) = invoke(&build_prompt(*from, *to, &input), slot)?;
        let output = output.trim().to_string();
        if output.is_empty() {
            return Err(format!("model returned an empty {} translation", to.label()));
        }
        steps.push(AxiomTranslationStep {
            id: format!("{}-step-{}", session_id, index),
            from_form: *from,
            to_form: *to,
            input_text: input.clone(),
            output_text: output.clone(),
            reasoning_trace: trace,
            verified_by: Some("pi".to_string()),
        });
        input = output;
    }
    Ok(AxiomTranslationSession {
        id: session_id.to_string(),
        initiating_dispatch_node_id: dispatch_node_id.to_string(),
        steps,
        verified_by: "pending".to_string(),
    })
}

/// Real per-step invocation — rides the EXISTING PI harness (the one
/// provider-agnostic local+cloud selector). Resolve the model via the slot CLI
/// (`epi slot show --json <slot>`), then invoke `pi -p --model <provider>/<model>`.
/// Raises loudly when the slot has no usable model or PI is unavailable — never a
/// stub, never a fabricated completion (mirrors blindfolded_teacher, Track 12.22).
pub fn pi_harness_invoke(prompt: &str, slot: &str) -> Result<(String, String), String> {
    use std::process::Command;
    let epi_bin = std::env::var("EPI_BIN")
        .ok()
        .filter(|value| !value.is_empty())
        .unwrap_or_else(|| "epi".to_string());
    let show = Command::new(&epi_bin)
        .args(["slot", "show", "--json", slot])
        .output()
        .map_err(|err| format!("epi CLI not found for slot resolution: {err}"))?;
    if !show.status.success() {
        return Err(format!(
            "`epi slot show --json {slot}` failed: {}",
            String::from_utf8_lossy(&show.stderr).trim()
        ));
    }
    let resolved: serde_json::Value =
        serde_json::from_slice(&show.stdout).map_err(|err| err.to_string())?;
    let model = &resolved["model"];
    let provider = model["provider"].as_str().unwrap_or_default();
    let model_id = model["model"].as_str().unwrap_or_default();
    let state = model["state"].as_str().unwrap_or("null");
    if state == "null" || provider.is_empty() || model_id.is_empty() {
        return Err(format!(
            "slot '{slot}' resolves to no usable model (state={state}); configure it with \
             `epi slot model set` — no hard-lock (DR-MODEL-1)."
        ));
    }
    let model_ref = format!("{provider}/{model_id}");
    let pi_bin = std::env::var("PI_BIN")
        .ok()
        .filter(|value| !value.is_empty())
        .unwrap_or_else(|| "pi".to_string());
    let proc = Command::new(&pi_bin)
        .args(["-p", "--model", &model_ref, prompt])
        .output()
        .map_err(|err| format!("pi harness not available (the producer rides PI): {err}"))?;
    if !proc.status.success() {
        return Err(format!(
            "`pi -p --model {model_ref}` failed (exit {:?}): {}",
            proc.status.code(),
            String::from_utf8_lossy(&proc.stderr).trim()
        ));
    }
    let output = String::from_utf8_lossy(&proc.stdout).trim().to_string();
    Ok((output, format!("pi:{model_ref}:{state}")))
}

fn store_dir(state_root: &Path) -> PathBuf {
    state_root.join("epii").join("axiom-translations")
}

/// Persist one session as `<state_root>/epii/axiom-translations/<id>.json`.
pub fn persist(state_root: &Path, session: &AxiomTranslationSession) -> Result<PathBuf, String> {
    let dir = store_dir(state_root);
    std::fs::create_dir_all(&dir).map_err(|err| err.to_string())?;
    let path = dir.join(format!("{}.json", session.id));
    let body = serde_json::to_string_pretty(session).map_err(|err| err.to_string())?;
    std::fs::write(&path, body).map_err(|err| err.to_string())?;
    Ok(path)
}

/// Read every persisted session, sorted by id (an absent store is an empty history).
pub fn history(state_root: &Path) -> Result<Vec<AxiomTranslationSession>, String> {
    let dir = store_dir(state_root);
    if !dir.exists() {
        return Ok(Vec::new());
    }
    let mut sessions = Vec::new();
    for entry in std::fs::read_dir(&dir).map_err(|err| err.to_string())? {
        let path = entry.map_err(|err| err.to_string())?.path();
        if path.extension().and_then(|ext| ext.to_str()) == Some("json") {
            let text = std::fs::read_to_string(&path).map_err(|err| err.to_string())?;
            let session: AxiomTranslationSession =
                serde_json::from_str(&text).map_err(|err| format!("{}: {err}", path.display()))?;
            sessions.push(session);
        }
    }
    sessions.sort_by(|a, b| a.id.cmp(&b.id));
    Ok(sessions)
}

fn now_millis() -> u128 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|delta| delta.as_millis())
        .unwrap_or(0)
}

/// Gateway handler: `s5'.epii.axiom_translation_history` — the persisted sessions.
pub fn history_value(state_root: impl AsRef<Path>) -> Result<serde_json::Value, String> {
    let sessions = history(state_root.as_ref())?;
    Ok(serde_json::json!({ "sessions": sessions }))
}

/// Gateway handler: `s5'.epii.axiom_translate` — runs the chain over the PI
/// harness, persists the session, and returns it. `slot` defaults to the epii
/// reasoning slot; `sessionId` may be supplied for deterministic addressing.
pub fn translate_and_persist(
    state_root: impl AsRef<Path>,
    params: &serde_json::Value,
) -> Result<serde_json::Value, String> {
    let articulation = params
        .get("articulation")
        .and_then(|value| value.as_str())
        .ok_or_else(|| "missing required param 'articulation'".to_string())?;
    let dispatch_node = params
        .get("initiatingDispatchNodeId")
        .and_then(|value| value.as_str())
        .unwrap_or("adhoc");
    let slot = params
        .get("slot")
        .and_then(|value| value.as_str())
        .unwrap_or("epii_judge");
    let session_id = params
        .get("sessionId")
        .and_then(|value| value.as_str())
        .map(|value| value.to_string())
        .unwrap_or_else(|| format!("axiom-{}", now_millis()));
    let session = translate(articulation, dispatch_node, &session_id, slot, &pi_harness_invoke)?;
    persist(state_root.as_ref(), &session)?;
    serde_json::to_value(&session).map_err(|err| err.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Deterministic translator: labels each output by its target form so the
    /// chain + persistence can be asserted without a live model.
    fn deterministic() -> impl Fn(&str, &str) -> Result<(String, String), String> {
        |prompt: &str, slot: &str| {
            let form = if prompt.contains("formal logical notation") {
                "FORMAL"
            } else if prompt.contains("OWL") {
                "OWL"
            } else {
                "SHACL"
            };
            Ok((format!("{form}::translated"), format!("stub-trace:{slot}")))
        }
    }

    fn test_root(tag: &str) -> PathBuf {
        let dir = std::env::temp_dir().join(format!("epi-axiom-test-{}-{}", tag, std::process::id()));
        let _ = std::fs::remove_dir_all(&dir);
        dir
    }

    #[test]
    fn translate_walks_the_full_english_formal_owl_shacl_chain() {
        let invoke = deterministic();
        let session = translate("All beings return to the ground.", "dispatch-7", "axiom-1", "epii_judge", &invoke)
            .unwrap();
        assert_eq!(session.id, "axiom-1");
        assert_eq!(session.initiating_dispatch_node_id, "dispatch-7");
        assert_eq!(session.verified_by, "pending", "human-final verification not yet done");
        assert_eq!(session.steps.len(), 3);
        let forms: Vec<(AxiomForm, AxiomForm)> =
            session.steps.iter().map(|s| (s.from_form, s.to_form)).collect();
        assert_eq!(
            forms,
            vec![
                (AxiomForm::PhilosophicalEnglish, AxiomForm::FormalNotation),
                (AxiomForm::FormalNotation, AxiomForm::Owl),
                (AxiomForm::Owl, AxiomForm::Shacl),
            ]
        );
        // Each step feeds the next; the first consumes the articulation.
        assert_eq!(session.steps[0].input_text, "All beings return to the ground.");
        assert_eq!(session.steps[1].input_text, session.steps[0].output_text);
        assert_eq!(session.steps[2].input_text, session.steps[1].output_text);
        for step in &session.steps {
            assert_eq!(step.verified_by.as_deref(), Some("pi"));
            assert!(step.id.starts_with("axiom-1-step-"));
        }
    }

    #[test]
    fn translate_refuses_empty_articulation_and_empty_model_output() {
        let ok = deterministic();
        assert!(translate("   ", "d", "s", "epii_judge", &ok).is_err());
        let empty = |_p: &str, _s: &str| Ok((String::new(), "t".to_string()));
        assert!(translate("real axiom", "d", "s", "epii_judge", &empty).is_err());
    }

    #[test]
    fn persist_and_history_round_trip() {
        let root = test_root("roundtrip");
        assert!(history(&root).unwrap().is_empty(), "absent store is empty history");
        let invoke = deterministic();
        for id in ["axiom-a", "axiom-b"] {
            let session = translate("axiom", "d", id, "epii_judge", &invoke).unwrap();
            persist(&root, &session).unwrap();
        }
        let sessions = history(&root).unwrap();
        assert_eq!(sessions.len(), 2);
        assert_eq!(sessions[0].id, "axiom-a");
        assert_eq!(sessions[1].id, "axiom-b");
        assert_eq!(sessions[0].steps.len(), 3);
        // The persisted JSON uses the carrier's camelCase + kebab-form contract.
        let raw = std::fs::read_to_string(store_dir(&root).join("axiom-a.json")).unwrap();
        assert!(raw.contains("\"fromForm\": \"philosophical-english\""));
        assert!(raw.contains("\"toForm\": \"shacl\""));
        assert!(raw.contains("\"verifiedBy\": \"pending\""));
        let _ = std::fs::remove_dir_all(&root);
    }
}
