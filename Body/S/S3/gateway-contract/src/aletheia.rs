use serde::{Deserialize, Serialize};

// =================== 12.T12.19 Aletheia subagent veto contract ===================
//
// This module lands the canonical veto primitive described in Track 12.19 and the
// M4' Prospective/Retrospective Canvas Spec §5. Per DR-M5-1, Anima is the dispatcher
// and the only synthesis authority; the six Aletheia subagent techne-guardians
// (Anansi CF0, Janus CF1, Moirai CF2, Mercurius CF3, Agora CF4, Zeithoven CF5)
// are facet-shaped by design intent. The veto primitive is the formal recognition
// that under Klein topology, no single facet can speak for the whole — the whole is
// non-orientable.
//
// A veto blocks the current synthesis from being written as the recognition.
// Anima receives the veto and may: (i) re-dispatch the facet-set with the veto
// noted, (ii) defer synthesis to the next return (orbit lengthens), or
// (iii) escalate to the user as a retrospective-surfacing highlight.
//
// Veto patterns persist in CONTINUATION.md and in the SpacetimeDB
// `aletheia_veto_log` table so subsequent runs see recurring gaps.

/// The canonical six Aletheia subagent techne-guardian facet identifiers.
/// Per Track 12.1 + DR-S4-TECHNE: these are Anima-dispatched specialists
/// during Aletheia-crystallisation-mode, each stewarding specific techne
/// classes within Pleroma-Techne.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum FacetId {
    /// CF0 — guards coordinate-mapping / blueprint / Darshana-REPL techne
    Anansi,
    /// CF1 — guards temporal-structure / bhedabheda-threshold techne
    Janus,
    /// CF2 — guards GraphRAG-distillation (Klotho/Lachesis/Atropos) techne
    Moirai,
    /// CF3 — guards Kairos-signal / qualitative-temporal-pattern techne
    Mercurius,
    /// CF4 — guards plugin-absorption / skill-index / multi-channel-aggregation techne
    Agora,
    /// CF5 — guards creative-advance / skill-and-agent-creation techne
    Zeithoven,
}

impl FacetId {
    pub fn label(&self) -> &'static str {
        match self {
            Self::Anansi => "Anansi",
            Self::Janus => "Janus",
            Self::Moirai => "Moirai",
            Self::Mercurius => "Mercurius",
            Self::Agora => "Agora",
            Self::Zeithoven => "Zeithoven",
        }
    }

    pub fn cf_label(&self) -> &'static str {
        match self {
            Self::Anansi => "CF0",
            Self::Janus => "CF1",
            Self::Moirai => "CF2",
            Self::Mercurius => "CF3",
            Self::Agora => "CF4",
            Self::Zeithoven => "CF5",
        }
    }
}

/// A citation providing evidence for a facet disclosure.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Citation {
    pub source: String,
    pub passage: String,
    pub coordinate: Option<String>,
}

/// Return type from any dispatched Aletheia guardian facet.
///
/// A facet may either:
/// - `disclosure`: an angle disclosed with supporting evidence — never a conclusion.
/// - `veto`: a formal block indicating the facet's angle cannot be spoken for by
///   the emerging synthesis, with what is missed named explicitly.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", tag = "kind")]
pub enum FacetReturn {
    #[serde(rename = "disclosure")]
    Disclosure {
        facet: FacetId,
        angle: String,
        evidence: Vec<Citation>,
    },
    #[serde(rename = "veto")]
    Veto {
        facet: FacetId,
        reason: String,
        what_is_missed: String,
    },
}

impl FacetReturn {
    pub fn is_veto(&self) -> bool {
        matches!(self, FacetReturn::Veto { .. })
    }

    pub fn is_disclosure(&self) -> bool {
        matches!(self, FacetReturn::Disclosure { .. })
    }

    pub fn facet(&self) -> FacetId {
        match self {
            FacetReturn::Disclosure { facet, .. } => *facet,
            FacetReturn::Veto { facet, .. } => *facet,
        }
    }
}

/// Anima's disposition following veto receipt. Per Track 12.19 §5.2:
/// - `re_dispatch`: re-dispatch the facet-set with the veto noted.
/// - `defer`: defer synthesis to the next return (orbit lengthens).
/// - `escalate`: escalate to the user as a retrospective-surfacing highlight.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum VetoDisposition {
    ReDispatch,
    Defer,
    Escalate,
}

/// The set of facet returns collected from a single Anima dispatch round.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FacetRoundResult {
    pub session_key: String,
    pub dispatch_id: String,
    pub returns: Vec<FacetReturn>,
    pub synthesis_allowed: bool,
    pub disposition: Option<VetoDisposition>,
}

impl FacetRoundResult {
    /// True when no facet returned a veto — synthesis may proceed.
    pub fn synthesis_allowed(&self) -> bool {
        !self.returns.iter().any(|r| r.is_veto())
    }

    /// Count how many vetoes each facet has cast in this set of returns.
    pub fn veto_counts_by_facet(&self) -> Vec<(FacetId, usize)> {
        let mut counts: Vec<(FacetId, usize)> = Vec::new();
        for r in &self.returns {
            if r.is_veto() {
                let fid = r.facet();
                match counts.iter_mut().find(|(f, _)| *f == fid) {
                    Some((_, c)) => *c += 1,
                    None => counts.push((fid, 1)),
                }
            }
        }
        counts
    }
}

/// A single veto log entry recorded in SpacetimeDB and CONTINUATION.md.
/// Persisted so subsequent runs can see recurring gaps and inform dispatch.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VetoLogEntry {
    pub veto_id: String,
    pub session_key: String,
    pub dispatch_id: String,
    pub facet: FacetId,
    pub reason: String,
    pub what_is_missed: String,
    pub klein_weighting_prospective: f32,
    pub disposition: VetoDisposition,
    pub recorded_at: u64,
}

/// The miscalibration threshold constant: if any single facet issues 3+ vetoes
/// in a single session, an `aletheia.dispatch.miscalibrated` observability event
/// fires. This threshold is per Track 12.19 §5.5(6).
pub const VETO_MISCALIBRATION_THRESHOLD: usize = 3;

/// Observability event emitted when the miscalibration threshold is exceeded.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AletheiaDispatchMiscalibratedEvent {
    pub event_kind: String,
    pub session_key: String,
    pub facet: FacetId,
    pub veto_count_in_session: usize,
    pub threshold: usize,
    pub recorded_at: u64,
}

impl AletheiaDispatchMiscalibratedEvent {
    pub fn new(
        session_key: String,
        facet: FacetId,
        veto_count_in_session: usize,
        recorded_at: u64,
    ) -> Self {
        Self {
            event_kind: "aletheia.dispatch.miscalibrated".to_string(),
            session_key,
            facet,
            veto_count_in_session,
            threshold: VETO_MISCALIBRATION_THRESHOLD,
            recorded_at,
        }
    }
}

/// Helper: check whether a set of veto log entries for a session triggers
/// the miscalibration observability event for any facet.
pub fn check_veto_miscalibration(
    session_key: &str,
    log_entries: &[VetoLogEntry],
    now_ms: u64,
) -> Vec<AletheiaDispatchMiscalibratedEvent> {
    let mut counts: std::collections::HashMap<FacetId, usize> = std::collections::HashMap::new();
    for entry in log_entries {
        if entry.session_key == session_key {
            *counts.entry(entry.facet).or_insert(0) += 1;
        }
    }
    counts
        .into_iter()
        .filter(|(_, count)| *count >= VETO_MISCALIBRATION_THRESHOLD)
        .map(|(facet, count)| {
            AletheiaDispatchMiscalibratedEvent::new(session_key.to_string(), facet, count, now_ms)
        })
        .collect()
}

// SpacetimeDB table name for aletheia veto log persistence.
pub const SPACETIME_ALETHEIA_VETO_LOG_TABLE: &str = "aletheia_veto_log";

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn facet_return_disclosure_serde_round_trip() {
        let fr = FacetReturn::Disclosure {
            facet: FacetId::Anansi,
            angle: "coordinate-mapping at 4.2".to_string(),
            evidence: vec![Citation {
                source: "Idea/Bimba/World/4.2.md".to_string(),
                passage: "The coordinate stabilises...".to_string(),
                coordinate: Some("4.2".to_string()),
            }],
        };
        let json = serde_json::to_string(&fr).unwrap();
        let back: FacetReturn = serde_json::from_str(&json).unwrap();
        assert_eq!(fr, back);
        assert!(back.is_disclosure());
        assert!(!back.is_veto());
    }

    #[test]
    fn facet_return_veto_serde_round_trip() {
        let fr = FacetReturn::Veto {
            facet: FacetId::Janus,
            reason: "The temporal horizon this assertion presupposes is not yet present"
                .to_string(),
            what_is_missed: "The retrospective face of this coordinate is ignored".to_string(),
        };
        let json = serde_json::to_string(&fr).unwrap();
        let back: FacetReturn = serde_json::from_str(&json).unwrap();
        assert_eq!(fr, back);
        assert!(back.is_veto());
        assert!(!back.is_disclosure());
        assert_eq!(back.facet(), FacetId::Janus);
    }

    #[test]
    fn veto_blocks_synthesis() {
        let returns = vec![
            FacetReturn::Disclosure {
                facet: FacetId::Anansi,
                angle: "angle at 4.2".to_string(),
                evidence: vec![],
            },
            FacetReturn::Veto {
                facet: FacetId::Janus,
                reason: "temporal gap".to_string(),
                what_is_missed: "retrospective face".to_string(),
            },
        ];
        let result = FacetRoundResult {
            session_key: "s1".to_string(),
            dispatch_id: "d1".to_string(),
            returns,
            synthesis_allowed: false,
            disposition: None,
        };
        assert!(!result.synthesis_allowed());
        let counts = result.veto_counts_by_facet();
        assert_eq!(counts.len(), 1);
        assert_eq!(counts[0], (FacetId::Janus, 1));
    }

    #[test]
    fn all_disclosures_allow_synthesis() {
        let returns = vec![
            FacetReturn::Disclosure {
                facet: FacetId::Anansi,
                angle: "angle a".to_string(),
                evidence: vec![],
            },
            FacetReturn::Disclosure {
                facet: FacetId::Moirai,
                angle: "angle b".to_string(),
                evidence: vec![],
            },
            FacetReturn::Disclosure {
                facet: FacetId::Mercurius,
                angle: "angle c".to_string(),
                evidence: vec![],
            },
        ];
        let result = FacetRoundResult {
            session_key: "s1".to_string(),
            dispatch_id: "d1".to_string(),
            returns,
            synthesis_allowed: true,
            disposition: None,
        };
        assert!(result.synthesis_allowed());
    }

    #[test]
    fn miscalibration_event_fires_on_three_vetoes_same_facet() {
        let session_key = "miscal-test-session";
        let now = 1_000_000;
        let entries = vec![
            VetoLogEntry {
                veto_id: "v1".into(),
                session_key: session_key.into(),
                dispatch_id: "d1".into(),
                facet: FacetId::Anansi,
                reason: "r1".into(),
                what_is_missed: "m1".into(),
                klein_weighting_prospective: 0.5,
                disposition: VetoDisposition::ReDispatch,
                recorded_at: now,
            },
            VetoLogEntry {
                veto_id: "v2".into(),
                session_key: session_key.into(),
                dispatch_id: "d2".into(),
                facet: FacetId::Anansi,
                reason: "r2".into(),
                what_is_missed: "m2".into(),
                klein_weighting_prospective: 0.5,
                disposition: VetoDisposition::Defer,
                recorded_at: now,
            },
            VetoLogEntry {
                veto_id: "v3".into(),
                session_key: session_key.into(),
                dispatch_id: "d3".into(),
                facet: FacetId::Anansi,
                reason: "r3".into(),
                what_is_missed: "m3".into(),
                klein_weighting_prospective: 0.5,
                disposition: VetoDisposition::Escalate,
                recorded_at: now,
            },
        ];
        let events = check_veto_miscalibration(session_key, &entries, now + 1);
        assert_eq!(events.len(), 1);
        assert_eq!(events[0].facet, FacetId::Anansi);
        assert_eq!(events[0].veto_count_in_session, 3);
        assert_eq!(events[0].event_kind, "aletheia.dispatch.miscalibrated");
    }

    #[test]
    fn no_miscalibration_below_threshold() {
        let session_key = "safe-session";
        let now = 1_000_000;
        let entries = vec![
            VetoLogEntry {
                veto_id: "v1".into(),
                session_key: session_key.into(),
                dispatch_id: "d1".into(),
                facet: FacetId::Anansi,
                reason: "r1".into(),
                what_is_missed: "m1".into(),
                klein_weighting_prospective: 0.5,
                disposition: VetoDisposition::ReDispatch,
                recorded_at: now,
            },
            VetoLogEntry {
                veto_id: "v2".into(),
                session_key: session_key.into(),
                dispatch_id: "d2".into(),
                facet: FacetId::Janus,
                reason: "r2".into(),
                what_is_missed: "m2".into(),
                klein_weighting_prospective: 0.5,
                disposition: VetoDisposition::Defer,
                recorded_at: now,
            },
        ];
        let events = check_veto_miscalibration(session_key, &entries, now + 1);
        assert!(events.is_empty());
    }
}
