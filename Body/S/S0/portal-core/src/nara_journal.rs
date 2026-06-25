use std::error::Error;
use std::fmt;

use serde::{Deserialize, Serialize};

use crate::{
    hopf_fiber, hopf_project, quat_normalize, ActivityStateEffect, EventPrivacyClass,
    NaraActivityEvent, NaraActivityKind, VamaShaktiClass,
};

const POSITIVE_VALENCE_KEYWORDS: &[&str] = &[
    "aligned",
    "bright",
    "calm",
    "clear",
    "ease",
    "grateful",
    "gratitude",
    "hopeful",
    "relief",
    "relieved",
    "steady",
    "warm",
];
const NEGATIVE_VALENCE_KEYWORDS: &[&str] = &[
    "afraid",
    "angry",
    "anxious",
    "confused",
    "exhausted",
    "fear",
    "grief",
    "heavy",
    "overwhelmed",
    "sad",
    "tense",
];
const PRIME_VARIANTS: &[char] = &['\u{2018}', '\u{2019}', '\u{2032}', '\u{02b9}', '\u{ff07}'];
const ORACLE_MARKERS: &[(&str, &str)] = &[
    ("tarot", "tarot"),
    ("i ching", "i-ching"),
    ("i-ching", "i-ching"),
    ("iching", "i-ching"),
    ("oracle", "oracle"),
    ("hexagram", "hexagram"),
    ("major arcana", "major-arcana"),
    ("coin cast", "coin-cast"),
    ("decan", "decan"),
];
const HIGHLIGHT_CATEGORIES: &[&str] = &[
    "daily-note",
    "oracle",
    "dream",
    "expand",
    "recognition",
    "prospective-surfacing",
    "retrospective-surfacing",
    "kairos-touch",
    "somatic-mark",
    "live-spread",
];

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct NaraJournalParseInput {
    pub event_id: String,
    pub kind: NaraActivityKind,
    pub coordinate: String,
    pub day_id: String,
    pub now_path: String,
    pub session_key: String,
    pub identity_ref: String,
    pub matheme_handle: String,
    pub raw_body_handle: String,
    pub body: String,
    pub category: Option<String>,
    pub source_ref: Option<String>,
    pub kairos_snapshot: Option<String>,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct NaraJournalDocument {
    kind: NaraActivityKind,
    normalized_body: String,
    word_count: usize,
    line_count: usize,
}

impl NaraJournalDocument {
    fn new(kind: NaraActivityKind, body: String) -> Result<Self, NaraJournalParseError> {
        let normalized_body = normalize_body(&body);
        let word_count = normalized_body
            .split_whitespace()
            .map(trim_token)
            .filter(|token| !token.is_empty())
            .count();
        let line_count = normalized_body
            .lines()
            .filter(|line| !line.trim().is_empty())
            .count();
        if word_count == 0 {
            return Err(NaraJournalParseError::EmptyBody);
        }
        Ok(Self {
            kind,
            normalized_body,
            word_count,
            line_count,
        })
    }

    fn body(&self) -> &str {
        &self.normalized_body
    }

    fn lower_body(&self) -> String {
        self.normalized_body.to_ascii_lowercase()
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum NaraObservationKind {
    HeuristicDerived,
    NoDerivedObservation,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum NaraEmotionalValenceHint {
    Positive,
    Negative,
    Mixed,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NaraSymbolicObservation {
    pub observation_kind: NaraObservationKind,
    pub detected_activity_kind: NaraActivityKind,
    pub word_count: usize,
    pub line_count: usize,
    pub mentioned_coordinates: Vec<String>,
    pub mentioned_lenses: Vec<u8>,
    pub mentioned_positions: Vec<u8>,
    pub mentioned_oracle_markers: Vec<String>,
    pub emotional_valence_hint: Option<NaraEmotionalValenceHint>,
    pub privacy_class: EventPrivacyClass,
    pub state_effect: ActivityStateEffect,
    pub confidence: f32,
    pub heuristic_basis: Vec<String>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NaraParsedActivity {
    pub activity_event: NaraActivityEvent,
    pub symbolic_observation: NaraSymbolicObservation,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NaraPeriodDayRange {
    pub start_day_id: String,
    pub end_day_id: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NaraPeriodGraphitiEpisode {
    pub episode_handle: String,
    pub day_id: String,
    pub chronos_handle: String,
    pub kairos_handle: String,
    pub history_handle: String,
    #[serde(skip, default = "identity_quaternion")]
    pub q_composed: [f32; 4],
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NaraHopfTrajectoryHandle {
    pub target_kind: String,
    pub handle: String,
    pub privacy: String,
}

impl NaraHopfTrajectoryHandle {
    fn new(period_id: &str) -> Self {
        Self {
            target_kind: "HopfProjectedQComposedTrajectory".to_owned(),
            handle: format!("protected://nara/period/{period_id}/hopf-trajectory"),
            privacy: "protected-local-derived".to_owned(),
        }
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NaraHopfTrajectoryPoint {
    pub sequence_index: usize,
    pub episode_handle: String,
    pub day_id: String,
    pub chronos_handle: String,
    pub kairos_handle: String,
    pub history_handle: String,
    pub hopf_degree: f64,
    pub hopf_fiber: u8,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NaraPeriodReadingInput {
    pub period_id: String,
    pub day_range: Option<NaraPeriodDayRange>,
    pub observations: Vec<NaraSymbolicObservation>,
    pub graphiti_episodes: Vec<NaraPeriodGraphitiEpisode>,
    pub chronos_handles: Vec<String>,
    pub kairos_handles: Vec<String>,
    pub history_handles: Vec<String>,
    pub include_vama_classifier: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NaraPeriodReading {
    pub period_id: String,
    pub day_range: Option<NaraPeriodDayRange>,
    pub observation_count: usize,
    pub graphiti_episode_count: usize,
    pub trajectory_observation_count: usize,
    pub chronos_handles: Vec<String>,
    pub kairos_handles: Vec<String>,
    pub history_handles: Vec<String>,
    pub hopf_trajectory_handle: NaraHopfTrajectoryHandle,
    pub hopf_projection: Vec<NaraHopfTrajectoryPoint>,
    pub reconstructed_from_persisted_handles: bool,
    pub protected_bodies_returned: bool,
    pub vama_classifier_computed: bool,
    pub vama_classifier_available_on_request: bool,
    pub visible_vama_classifier: Option<VamaShaktiClass>,
    pub recognition_basis: Vec<String>,
    #[serde(skip, default = "default_period_vama_classifier")]
    internal_vama_classifier: VamaShaktiClass,
}

impl NaraPeriodReading {
    pub fn internal_vama_classifier(&self) -> VamaShaktiClass {
        self.internal_vama_classifier
    }
}

fn default_period_vama_classifier() -> VamaShaktiClass {
    VamaShaktiClass::Sprite
}

fn identity_quaternion() -> [f32; 4] {
    [1.0, 0.0, 0.0, 0.0]
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum NaraJournalParseError {
    MissingField { field: &'static str },
    EmptyBody,
    InvalidInvariant(String),
}

impl fmt::Display for NaraJournalParseError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::MissingField { field } => write!(f, "{field} is required"),
            Self::EmptyBody => write!(f, "body is required"),
            Self::InvalidInvariant(message) => write!(f, "{message}"),
        }
    }
}

impl Error for NaraJournalParseError {}

pub fn period_reading(
    input: NaraPeriodReadingInput,
) -> Result<NaraPeriodReading, NaraJournalParseError> {
    let period_id = required(input.period_id, "period_id")?;
    let day_range = validate_day_range(input.day_range)?;
    if input.observations.is_empty() {
        return Err(NaraJournalParseError::InvalidInvariant(
            "period_reading requires at least one real observation".to_owned(),
        ));
    }
    let (internal_vama_classifier, recognition_basis) = classify_period_vama(&input.observations);
    let hopf_projection = reconstruct_hopf_projection(&input.graphiti_episodes)?;
    let chronos_handles = merge_handles(
        input.chronos_handles,
        hopf_projection
            .iter()
            .map(|point| point.chronos_handle.clone()),
    );
    let kairos_handles = merge_handles(
        input.kairos_handles,
        hopf_projection
            .iter()
            .map(|point| point.kairos_handle.clone()),
    );
    let history_handles = merge_handles(
        input.history_handles,
        hopf_projection
            .iter()
            .map(|point| point.history_handle.clone()),
    );
    let hopf_trajectory_handle = NaraHopfTrajectoryHandle::new(&period_id);
    Ok(NaraPeriodReading {
        period_id,
        day_range,
        observation_count: input.observations.len(),
        graphiti_episode_count: input.graphiti_episodes.len(),
        trajectory_observation_count: hopf_projection.len(),
        chronos_handles,
        kairos_handles,
        history_handles,
        hopf_trajectory_handle,
        hopf_projection,
        reconstructed_from_persisted_handles: true,
        protected_bodies_returned: false,
        vama_classifier_computed: true,
        vama_classifier_available_on_request: true,
        visible_vama_classifier: input
            .include_vama_classifier
            .then_some(internal_vama_classifier),
        recognition_basis,
        internal_vama_classifier,
    })
}

fn validate_day_range(
    day_range: Option<NaraPeriodDayRange>,
) -> Result<Option<NaraPeriodDayRange>, NaraJournalParseError> {
    let Some(day_range) = day_range else {
        return Ok(None);
    };
    let start_day_id = required(day_range.start_day_id, "day_range.start_day_id")?;
    let end_day_id = required(day_range.end_day_id, "day_range.end_day_id")?;
    if start_day_id > end_day_id {
        return Err(NaraJournalParseError::InvalidInvariant(
            "day_range.start_day_id must be <= day_range.end_day_id".to_owned(),
        ));
    }
    Ok(Some(NaraPeriodDayRange {
        start_day_id,
        end_day_id,
    }))
}

fn reconstruct_hopf_projection(
    episodes: &[NaraPeriodGraphitiEpisode],
) -> Result<Vec<NaraHopfTrajectoryPoint>, NaraJournalParseError> {
    let mut ordered = episodes.to_vec();
    ordered.sort_by(|left, right| {
        left.day_id
            .cmp(&right.day_id)
            .then_with(|| left.chronos_handle.cmp(&right.chronos_handle))
            .then_with(|| left.episode_handle.cmp(&right.episode_handle))
    });
    ordered
        .into_iter()
        .enumerate()
        .map(|(sequence_index, episode)| {
            let episode_handle = required(episode.episode_handle, "episode_handle")?;
            let day_id = required(episode.day_id, "day_id")?;
            let chronos_handle = required(episode.chronos_handle, "chronos_handle")?;
            let kairos_handle = required(episode.kairos_handle, "kairos_handle")?;
            let history_handle = required(episode.history_handle, "history_handle")?;
            let (hopf_degree, hopf_fiber) = hopf_project_q_composed(episode.q_composed);
            Ok(NaraHopfTrajectoryPoint {
                sequence_index,
                episode_handle,
                day_id,
                chronos_handle,
                kairos_handle,
                history_handle,
                hopf_degree,
                hopf_fiber,
            })
        })
        .collect()
}

fn hopf_project_q_composed(q_composed: [f32; 4]) -> (f64, u8) {
    let q = quat_normalize(q_composed);
    let w = q[0].clamp(-1.0, 1.0) as f64;
    let vector_norm = ((q[1] * q[1] + q[2] * q[2] + q[3] * q[3]) as f64).sqrt();
    let base_degree = (2.0 * w.acos()).to_degrees() % 360.0;
    let exact_degree_720 = if q[0] < -f32::EPSILON
        || (q[0].abs() <= f32::EPSILON && vector_norm > f64::EPSILON)
    {
        base_degree + 360.0
    } else {
        base_degree
    };
    (hopf_project(exact_degree_720), hopf_fiber(exact_degree_720))
}

fn merge_handles<I>(base: Vec<String>, extra: I) -> Vec<String>
where
    I: IntoIterator<Item = String>,
{
    let mut handles = Vec::new();
    for handle in base.into_iter().chain(extra) {
        let trimmed = handle.trim();
        if !trimmed.is_empty() {
            push_unique(&mut handles, trimmed.to_owned());
        }
    }
    handles
}

pub struct NaraJournalParser;

impl NaraJournalParser {
    pub fn parse(
        input: NaraJournalParseInput,
    ) -> Result<NaraParsedActivity, NaraJournalParseError> {
        let event_id = required(input.event_id, "event_id")?;
        let coordinate = required(input.coordinate, "coordinate")?;
        let day_id = required(input.day_id, "day_id")?;
        let now_path = required(input.now_path, "now_path")?;
        let session_key = required(input.session_key, "session_key")?;
        let identity_ref = required(input.identity_ref, "identity_ref")?;
        let matheme_handle = required(input.matheme_handle, "matheme_handle")?;
        let raw_body_handle = required(input.raw_body_handle, "raw_body_handle")?;
        let body = required_body(input.body)?;
        let source_ref = trim_optional(input.source_ref);
        let kairos_snapshot = trim_optional(input.kairos_snapshot);
        let category = normalize_highlight_category(input.kind, input.category)?;
        let document = NaraJournalDocument::new(input.kind, body)?;
        let symbolic_observation = derive_symbolic_observation(&document);
        let mut activity_event = NaraActivityEvent::new(
            event_id,
            input.kind,
            coordinate,
            day_id,
            now_path,
            session_key,
            EventPrivacyClass::ProtectedLocalBody,
            identity_ref,
            matheme_handle,
            raw_body_handle,
            symbolic_observation.state_effect.clone(),
        )
        .map_err(NaraJournalParseError::InvalidInvariant)?;
        activity_event.category = category;
        activity_event.source_ref = source_ref;
        activity_event.kairos_snapshot = kairos_snapshot;
        activity_event.derived_symbolic_observation = Some(symbolic_observation.clone());
        Ok(NaraParsedActivity {
            activity_event,
            symbolic_observation,
        })
    }
}

fn classify_period_vama(
    observations: &[NaraSymbolicObservation],
) -> (VamaShaktiClass, Vec<String>) {
    let mut coordinate_mentions = 0usize;
    let mut oracle_markers = 0usize;
    let mut lens_or_position_mentions = 0usize;
    let mut negative_or_mixed_valence = 0usize;
    let mut positive_valence = 0usize;
    let mut total_words = 0usize;

    for observation in observations {
        coordinate_mentions += observation.mentioned_coordinates.len();
        oracle_markers += observation.mentioned_oracle_markers.len();
        lens_or_position_mentions +=
            observation.mentioned_lenses.len() + observation.mentioned_positions.len();
        total_words += observation.word_count;
        match observation.emotional_valence_hint {
            Some(NaraEmotionalValenceHint::Negative | NaraEmotionalValenceHint::Mixed) => {
                negative_or_mixed_valence += 1;
            }
            Some(NaraEmotionalValenceHint::Positive) => {
                positive_valence += 1;
            }
            None => {}
        }
    }

    let mut basis = Vec::new();
    if coordinate_mentions > 0 {
        basis.push(format!("coordinate-mentions:{coordinate_mentions}"));
    }
    if oracle_markers > 0 {
        basis.push(format!("oracle-markers:{oracle_markers}"));
    }
    if lens_or_position_mentions > 0 {
        basis.push(format!(
            "lens-or-position-mentions:{lens_or_position_mentions}"
        ));
    }
    if negative_or_mixed_valence > 0 {
        basis.push(format!(
            "negative-or-mixed-valence:{negative_or_mixed_valence}"
        ));
    }
    if positive_valence > 0 {
        basis.push(format!("positive-valence:{positive_valence}"));
    }
    if total_words > 0 {
        basis.push(format!("word-count:{total_words}"));
    }

    let classifier = if oracle_markers >= 2 && oracle_markers >= coordinate_mentions {
        VamaShaktiClass::Mantra
    } else if negative_or_mixed_valence > 0 && lens_or_position_mentions > 0 {
        VamaShaktiClass::Daemon
    } else if coordinate_mentions >= 2 || observations.len() >= 3 {
        VamaShaktiClass::Egregore
    } else {
        VamaShaktiClass::Sprite
    };

    (classifier, basis)
}

fn derive_symbolic_observation(document: &NaraJournalDocument) -> NaraSymbolicObservation {
    let coordinates = extract_coordinates(document.body());
    let lenses = extract_lenses(document.body());
    let positions = extract_positions(document.body());
    let oracle_markers = extract_oracle_markers(&document.lower_body());
    let emotional_valence_hint = detect_valence(&document.lower_body());
    let state_effect = ActivityStateEffect::EphemeralContextOnly;

    let mut heuristic_basis = Vec::new();
    if !coordinates.is_empty() {
        heuristic_basis.push("coordinate-mentions".to_owned());
    }
    if !lenses.is_empty() {
        heuristic_basis.push("lens-mentions".to_owned());
    }
    if !positions.is_empty() {
        heuristic_basis.push("position-mentions".to_owned());
    }
    if !oracle_markers.is_empty() {
        heuristic_basis.push("oracle-markers".to_owned());
    }
    if emotional_valence_hint.is_some() {
        heuristic_basis.push("transparent-valence-keywords".to_owned());
    }

    let observation_kind = if heuristic_basis.is_empty() {
        NaraObservationKind::NoDerivedObservation
    } else {
        NaraObservationKind::HeuristicDerived
    };
    let confidence = if heuristic_basis.is_empty() {
        0.0
    } else {
        let mut score: f32 = 0.0;
        if !coordinates.is_empty() {
            score += 0.35;
        }
        if !lenses.is_empty() || !positions.is_empty() {
            score += 0.20;
        }
        if !oracle_markers.is_empty() {
            score += 0.25;
        }
        if emotional_valence_hint.is_some() {
            score += 0.20;
        }
        score.clamp(0.0, 1.0)
    };

    NaraSymbolicObservation {
        observation_kind,
        detected_activity_kind: document.kind,
        word_count: document.word_count,
        line_count: document.line_count,
        mentioned_coordinates: coordinates,
        mentioned_lenses: lenses,
        mentioned_positions: positions,
        mentioned_oracle_markers: oracle_markers,
        emotional_valence_hint,
        privacy_class: EventPrivacyClass::ProtectedLocalDerived,
        state_effect,
        confidence,
        heuristic_basis,
    }
}

fn extract_coordinates(body: &str) -> Vec<String> {
    let mut coordinates = Vec::new();
    for token in body.split_whitespace().map(trim_token) {
        if looks_like_coordinate(&token) {
            push_unique(&mut coordinates, token);
        }
    }
    coordinates
}

fn extract_lenses(body: &str) -> Vec<u8> {
    let tokens: Vec<String> = body
        .split_whitespace()
        .map(|token| trim_token(token).to_ascii_lowercase())
        .filter(|token| !token.is_empty())
        .collect();
    let mut lenses = Vec::new();
    for (index, token) in tokens.iter().enumerate() {
        if token == "lens" {
            if let Some(next) = tokens.get(index + 1) {
                if let Ok(value) = next.parse::<u8>() {
                    push_unique(&mut lenses, value);
                }
            }
            continue;
        }
        if let Some(value) = token
            .strip_prefix("lens-")
            .or_else(|| token.strip_prefix("lens"))
        {
            if let Ok(value) = value.parse::<u8>() {
                push_unique(&mut lenses, value);
            }
            continue;
        }
        if let Some(value) = token.strip_prefix('l') {
            if !value.is_empty() && value.chars().all(|ch| ch.is_ascii_digit()) {
                if let Ok(value) = value.parse::<u8>() {
                    push_unique(&mut lenses, value);
                }
            }
        }
    }
    lenses
}

fn extract_positions(body: &str) -> Vec<u8> {
    let tokens: Vec<String> = body
        .split_whitespace()
        .map(|token| trim_token(token).to_ascii_lowercase())
        .filter(|token| !token.is_empty())
        .collect();
    let mut positions = Vec::new();
    for (index, token) in tokens.iter().enumerate() {
        if token == "position" {
            if let Some(next) = tokens.get(index + 1) {
                if let Ok(value) = next.parse::<u8>() {
                    push_unique(&mut positions, value);
                }
            }
            continue;
        }
        if let Some(value) = token
            .strip_prefix("position-")
            .or_else(|| token.strip_prefix("position"))
        {
            if let Ok(value) = value.parse::<u8>() {
                push_unique(&mut positions, value);
            }
            continue;
        }
        if let Some(value) = token.strip_prefix('p') {
            if !value.is_empty() && value.chars().all(|ch| ch.is_ascii_digit()) {
                if let Ok(value) = value.parse::<u8>() {
                    push_unique(&mut positions, value);
                }
            }
        }
    }
    positions
}

fn extract_oracle_markers(lower_body: &str) -> Vec<String> {
    let mut markers = Vec::new();
    for (needle, canonical) in ORACLE_MARKERS {
        if lower_body.contains(needle) {
            push_unique(&mut markers, (*canonical).to_owned());
        }
    }
    markers
}

fn detect_valence(lower_body: &str) -> Option<NaraEmotionalValenceHint> {
    let positive = contains_any(lower_body, POSITIVE_VALENCE_KEYWORDS);
    let negative = contains_any(lower_body, NEGATIVE_VALENCE_KEYWORDS);
    match (positive, negative) {
        (true, true) => Some(NaraEmotionalValenceHint::Mixed),
        (true, false) => Some(NaraEmotionalValenceHint::Positive),
        (false, true) => Some(NaraEmotionalValenceHint::Negative),
        (false, false) => None,
    }
}

fn looks_like_coordinate(token: &str) -> bool {
    if token.len() < 2 {
        return false;
    }
    if let Some(rest) = token.strip_prefix('#') {
        return is_coordinate_tail(rest);
    }
    let Some(head) = token.chars().next() else {
        return false;
    };
    if !matches!(head, 'M' | 'S') {
        return false;
    }
    is_coordinate_tail(&token[1..])
}

fn is_coordinate_tail(token: &str) -> bool {
    let Some(stripped) = token.strip_suffix('\'').or(Some(token)) else {
        return false;
    };
    if stripped.is_empty() {
        return false;
    }
    let mut has_digit = false;
    for ch in stripped.chars() {
        if ch.is_ascii_digit() {
            has_digit = true;
            continue;
        }
        if matches!(ch, '-' | '.') {
            continue;
        }
        return false;
    }
    has_digit
}

fn normalize_body(body: &str) -> String {
    body.chars()
        .map(|ch| {
            if PRIME_VARIANTS.contains(&ch) {
                '\''
            } else {
                ch
            }
        })
        .collect()
}

fn trim_token(token: &str) -> String {
    token
        .trim_matches(|ch: char| !ch.is_ascii_alphanumeric() && !matches!(ch, '#' | '-' | '\''))
        .to_owned()
}

fn contains_any(body: &str, keywords: &[&str]) -> bool {
    keywords.iter().any(|keyword| body.contains(keyword))
}

fn push_unique<T: PartialEq>(items: &mut Vec<T>, value: T) {
    if !items.contains(&value) {
        items.push(value);
    }
}

fn required(value: String, field: &'static str) -> Result<String, NaraJournalParseError> {
    let trimmed = value.trim();
    if trimmed.is_empty() {
        Err(NaraJournalParseError::MissingField { field })
    } else {
        Ok(trimmed.to_owned())
    }
}

fn required_body(value: String) -> Result<String, NaraJournalParseError> {
    let trimmed = value.trim();
    if trimmed.is_empty() {
        Err(NaraJournalParseError::EmptyBody)
    } else {
        Ok(trimmed.to_owned())
    }
}

fn trim_optional(value: Option<String>) -> Option<String> {
    value.and_then(|value| {
        let trimmed = value.trim();
        if trimmed.is_empty() {
            None
        } else {
            Some(trimmed.to_owned())
        }
    })
}

fn normalize_highlight_category(
    kind: NaraActivityKind,
    category: Option<String>,
) -> Result<Option<String>, NaraJournalParseError> {
    let category = trim_optional(category);
    if kind != NaraActivityKind::Highlight {
        return if category.is_some() {
            Err(NaraJournalParseError::InvalidInvariant(
                "category is only valid for highlight activity".to_owned(),
            ))
        } else {
            Ok(None)
        };
    }

    let category = category.unwrap_or_else(|| "daily-note".to_owned());
    if HIGHLIGHT_CATEGORIES.contains(&category.as_str()) {
        Ok(Some(category))
    } else {
        Err(NaraJournalParseError::InvalidInvariant(format!(
            "unsupported highlight category: {category}"
        )))
    }
}
