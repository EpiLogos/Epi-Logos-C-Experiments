use std::error::Error;
use std::fmt;

use serde::{Deserialize, Serialize};

use crate::kernel::{ConjugateFormCharacter, ProfilePrivacyClass};
use crate::luts::planet_keplerian::{PLANET_COUNT, PLANET_KEPLERIAN_VELOCITY};
use crate::quaternion::{quat_mul, quat_normalize, Quaternion};

pub const PERSONAL_RESONANCE_MAJOR_THRESHOLD: f32 = 2.0 / 3.0;

/// DR-M4-2 axis_order = [w=Earth, x=Fire, y=Water, z=Air].
pub const CL42_PERSONAL_AXIS_ORDER: [Cl42AxisBinding; 4] = [
    Cl42AxisBinding {
        axis: Cl42QuaternionAxis::W,
        element: ElementalAxis::Earth,
    },
    Cl42AxisBinding {
        axis: Cl42QuaternionAxis::X,
        element: ElementalAxis::Fire,
    },
    Cl42AxisBinding {
        axis: Cl42QuaternionAxis::Y,
        element: ElementalAxis::Water,
    },
    Cl42AxisBinding {
        axis: Cl42QuaternionAxis::Z,
        element: ElementalAxis::Air,
    },
];

/// DR-M4-2 polarity: 0 = cosmic, 1 = personal.
pub const PERSONAL_CYMATIC_POLARITY: [PersonalCymaticPolarityBinding; 2] = [
    PersonalCymaticPolarityBinding {
        pole: 0,
        register: PersonalCymaticRegister::Cosmic,
    },
    PersonalCymaticPolarityBinding {
        pole: 1,
        register: PersonalCymaticRegister::Personal,
    },
];

pub const IDENTITY_HASH_MIGRATION_POLICY: IdentityHashMigrationPolicy =
    IdentityHashMigrationPolicy {
        phase: IdentityHashMigrationPhase::Cutover,
        accepts_legacy_birth_data_hash: true,
        accepts_quaternionic_signature_hash: true,
        final_state: IdentityHashKind::QuaternionicSignatureBlake3,
    };

pub const VAMA_LONG_PERIOD_REVIEW_POLICY: VamaClassifierPolicy = VamaClassifierPolicy {
    computed_mandatory_internal_long_period_review: true,
    user_visible_on_request: true,
    auto_raise_to_user: false,
};

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Cl42QuaternionAxis {
    W,
    X,
    Y,
    Z,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ElementalAxis {
    Earth,
    Fire,
    Water,
    Air,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Cl42AxisBinding {
    pub axis: Cl42QuaternionAxis,
    pub element: ElementalAxis,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum PersonalCymaticRegister {
    Cosmic,
    Personal,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PersonalCymaticPolarityBinding {
    pub pole: u8,
    pub register: PersonalCymaticRegister,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum IdentityHashMigrationPhase {
    Cutover,
    FinalQuaternionic,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum IdentityHashKind {
    LegacyBirthDataBlake3,
    QuaternionicSignatureBlake3,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct IdentityHashMigrationPolicy {
    pub phase: IdentityHashMigrationPhase,
    pub accepts_legacy_birth_data_hash: bool,
    pub accepts_quaternionic_signature_hash: bool,
    pub final_state: IdentityHashKind,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VamaClassifierPolicy {
    pub computed_mandatory_internal_long_period_review: bool,
    pub user_visible_on_request: bool,
    pub auto_raise_to_user: bool,
}

#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NatalPlanetPosition {
    pub planet_id: u8,
    pub degree: f32,
    pub retrograde: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KerykeionNatalChart {
    pub planets: [NatalPlanetPosition; PLANET_COUNT],
}

impl KerykeionNatalChart {
    pub fn from_json(json: &str) -> Result<Self, PersonalIdentityError> {
        let value: serde_json::Value = serde_json::from_str(json)
            .map_err(|err| PersonalIdentityError::InvalidKerykeionNatalJson(err.to_string()))?;
        let planets = value
            .get("planets")
            .and_then(|planets| planets.as_array())
            .ok_or(PersonalIdentityError::MissingPlanetsArray)?;

        let mut slots: [Option<NatalPlanetPosition>; PLANET_COUNT] = [None; PLANET_COUNT];
        for planet in planets {
            let planet_id = planet_id_from_value(planet)?;
            let degree = planet_degree_from_value(planet, planet_id)?;
            let retrograde = planet
                .get("retrograde")
                .or_else(|| planet.get("is_retrograde"))
                .or_else(|| planet.get("isRetrograde"))
                .and_then(|value| value.as_bool())
                .unwrap_or(false);
            let idx = planet_id as usize;
            if slots[idx].is_some() {
                return Err(PersonalIdentityError::DuplicateNatalPlanet {
                    planet: planet_name(planet_id).to_owned(),
                });
            }
            slots[idx] = Some(NatalPlanetPosition {
                planet_id,
                degree,
                retrograde,
            });
        }

        for planet_id in 0..PLANET_COUNT as u8 {
            if slots[planet_id as usize].is_none() {
                return Err(PersonalIdentityError::MissingNatalPlanet {
                    planet: planet_name(planet_id).to_owned(),
                });
            }
        }

        Ok(Self {
            planets: std::array::from_fn(|idx| slots[idx].expect("all natal planets checked")),
        })
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ElementalBalance {
    pub earth: f32,
    pub fire: f32,
    pub water: f32,
    pub air: f32,
}

impl ElementalBalance {
    fn from_raw_weights(raw: [f32; 4]) -> Result<Self, PersonalIdentityError> {
        let total = raw.iter().sum::<f32>();
        if !total.is_finite() || total <= f32::EPSILON {
            return Err(PersonalIdentityError::ZeroElementalWeight);
        }
        Ok(Self {
            earth: raw[0] / total,
            fire: raw[1] / total,
            water: raw[2] / total,
            air: raw[3] / total,
        })
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PersonalIdentityProfile {
    /// q_personal is the integrated Nara quintessence output.
    pub q_personal: Quaternion,
    /// Q_identity is the Kerykeion natal baseline component integrated by q_personal.
    pub q_identity: Quaternion,
    pub natal_chart_handle: String,
    pub elemental_balance: ElementalBalance,
    pub identity_hash: String,
    pub privacy_class: ProfilePrivacyClass,
}

impl PersonalIdentityProfile {
    pub fn from_kerykeion_json(
        natal_chart_handle: impl Into<String>,
        identity_hash: impl Into<String>,
        json: &str,
    ) -> Result<Self, PersonalIdentityError> {
        let chart = KerykeionNatalChart::from_json(json)?;
        Self::from_natal_chart(natal_chart_handle, identity_hash, &chart)
    }

    pub fn from_natal_chart(
        natal_chart_handle: impl Into<String>,
        identity_hash: impl Into<String>,
        chart: &KerykeionNatalChart,
    ) -> Result<Self, PersonalIdentityError> {
        let natal_chart_handle = required(natal_chart_handle.into(), "natal_chart_handle")?;
        let identity_hash = required_identity_hash(identity_hash.into())?;
        let raw = elemental_weights_from_chart(chart);
        let q_identity = quat_normalize(raw);
        Ok(Self {
            q_personal: integrate_nara_quintessence(q_identity, &[]),
            q_identity,
            natal_chart_handle,
            elemental_balance: ElementalBalance::from_raw_weights(raw)?,
            identity_hash,
            privacy_class: ProfilePrivacyClass::ProtectedLocalDerived,
        })
    }

    pub fn composed_quaternion(&self, q_transit: Quaternion, q_activity: Quaternion) -> Quaternion {
        compose_personal_quaternion(self.q_personal, q_transit, q_activity)
    }

    pub fn apply_identity_augment(&mut self, q_identity: Quaternion) {
        let q_identity = quat_normalize(q_identity);
        self.q_identity = q_identity;
        self.q_personal = integrate_nara_quintessence(q_identity, &[]);
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum IdentityAugmentProposalState {
    Proposed,
    Reviewed,
    Accepted,
    Rejected,
    Applied,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum IdentityAugmentReviewVerdict {
    Accept,
    Reject,
}

#[derive(Clone, Debug, PartialEq)]
pub struct IdentityAugmentProposal {
    pub proposal_handle: String,
    pub state: IdentityAugmentProposalState,
    pub summary: String,
    pub source_adapter_handle: String,
    pub created_at: String,
    pub reviewed_at: Option<String>,
    pub decided_at: Option<String>,
    pub applied_at: Option<String>,
    q_identity_candidate: Quaternion,
}

impl IdentityAugmentProposal {
    pub fn proposed(
        proposal_handle: impl Into<String>,
        summary: impl Into<String>,
        source_adapter_handle: impl Into<String>,
        created_at: impl Into<String>,
        q_identity_candidate: Quaternion,
    ) -> Result<Self, PersonalIdentityError> {
        Ok(Self {
            proposal_handle: required(proposal_handle.into(), "proposal_handle")?,
            state: IdentityAugmentProposalState::Proposed,
            summary: required(summary.into(), "summary")?,
            source_adapter_handle: required(source_adapter_handle.into(), "source_adapter_handle")?,
            created_at: required(created_at.into(), "created_at")?,
            reviewed_at: None,
            decided_at: None,
            applied_at: None,
            q_identity_candidate: quat_normalize(q_identity_candidate),
        })
    }

    pub fn view(&self) -> IdentityAugmentProposalView {
        IdentityAugmentProposalView {
            proposal_handle: self.proposal_handle.clone(),
            state: self.state,
            summary: self.summary.clone(),
            source_adapter_handle: self.source_adapter_handle.clone(),
            created_at: self.created_at.clone(),
            reviewed_at: self.reviewed_at.clone(),
        }
    }

    pub fn q_identity_candidate(&self) -> Quaternion {
        self.q_identity_candidate
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct IdentityAugmentProposalView {
    pub proposal_handle: String,
    pub state: IdentityAugmentProposalState,
    pub summary: String,
    pub source_adapter_handle: String,
    pub created_at: String,
    pub reviewed_at: Option<String>,
}

#[derive(Clone, Debug, Default, PartialEq)]
pub struct IdentityAugmentProposalAdapter {
    proposals: Vec<IdentityAugmentProposal>,
}

impl IdentityAugmentProposalAdapter {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn submit(
        &mut self,
        proposal: IdentityAugmentProposal,
    ) -> Result<IdentityAugmentProposalView, PersonalIdentityError> {
        if self
            .proposals
            .iter()
            .any(|existing| existing.proposal_handle == proposal.proposal_handle)
        {
            return Err(PersonalIdentityError::DuplicateIdentityAugmentProposal {
                proposal_handle: proposal.proposal_handle,
            });
        }
        let view = proposal.view();
        self.proposals.push(proposal);
        Ok(view)
    }

    pub fn pending_proposal_views(&self) -> Vec<IdentityAugmentProposalView> {
        self.proposals
            .iter()
            .filter(|proposal| {
                matches!(
                    proposal.state,
                    IdentityAugmentProposalState::Proposed | IdentityAugmentProposalState::Reviewed
                )
            })
            .map(IdentityAugmentProposal::view)
            .collect()
    }

    pub fn review(
        &mut self,
        proposal_handle: &str,
        reviewed_at: impl Into<String>,
    ) -> Result<IdentityAugmentProposalView, PersonalIdentityError> {
        let reviewed_at = required(reviewed_at.into(), "reviewed_at")?;
        let proposal = self.find_mut(proposal_handle)?;
        transition_identity_proposal(proposal, IdentityAugmentProposalState::Reviewed)?;
        proposal.reviewed_at = Some(reviewed_at);
        Ok(proposal.view())
    }

    pub fn decide(
        &mut self,
        proposal_handle: &str,
        verdict: IdentityAugmentReviewVerdict,
        decided_at: impl Into<String>,
    ) -> Result<IdentityAugmentProposalView, PersonalIdentityError> {
        let decided_at = required(decided_at.into(), "decided_at")?;
        let proposal = self.find_mut(proposal_handle)?;
        let next = match verdict {
            IdentityAugmentReviewVerdict::Accept => IdentityAugmentProposalState::Accepted,
            IdentityAugmentReviewVerdict::Reject => IdentityAugmentProposalState::Rejected,
        };
        transition_identity_proposal(proposal, next)?;
        proposal.decided_at = Some(decided_at);
        Ok(proposal.view())
    }

    pub fn apply(
        &mut self,
        proposal_handle: &str,
        profile: &mut PersonalIdentityProfile,
        applied_at: impl Into<String>,
    ) -> Result<IdentityAugmentProposalView, PersonalIdentityError> {
        let applied_at = required(applied_at.into(), "applied_at")?;
        let proposal = self.find_mut(proposal_handle)?;
        transition_identity_proposal(proposal, IdentityAugmentProposalState::Applied)?;
        profile.apply_identity_augment(proposal.q_identity_candidate);
        proposal.applied_at = Some(applied_at);
        Ok(proposal.view())
    }

    fn find_mut(
        &mut self,
        proposal_handle: &str,
    ) -> Result<&mut IdentityAugmentProposal, PersonalIdentityError> {
        self.proposals
            .iter_mut()
            .find(|proposal| proposal.proposal_handle == proposal_handle)
            .ok_or_else(|| PersonalIdentityError::UnknownIdentityAugmentProposal {
                proposal_handle: proposal_handle.to_owned(),
            })
    }
}

fn transition_identity_proposal(
    proposal: &mut IdentityAugmentProposal,
    next: IdentityAugmentProposalState,
) -> Result<(), PersonalIdentityError> {
    let allowed = matches!(
        (proposal.state, next),
        (
            IdentityAugmentProposalState::Proposed,
            IdentityAugmentProposalState::Reviewed
        ) | (
            IdentityAugmentProposalState::Reviewed,
            IdentityAugmentProposalState::Accepted
        ) | (
            IdentityAugmentProposalState::Reviewed,
            IdentityAugmentProposalState::Rejected
        ) | (
            IdentityAugmentProposalState::Accepted,
            IdentityAugmentProposalState::Applied
        )
    );
    if !allowed {
        return Err(PersonalIdentityError::InvalidIdentityAugmentTransition {
            from: proposal.state,
            to: next,
        });
    }
    proposal.state = next;
    Ok(())
}

pub fn integrate_nara_quintessence(
    q_identity: Quaternion,
    layer_quaternions: &[Quaternion],
) -> Quaternion {
    let mut q_personal = quat_normalize(q_identity);
    for layer in layer_quaternions {
        q_personal = quat_normalize(quat_mul(q_personal, quat_normalize(*layer)));
    }
    q_personal
}

#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PersonalResonance {
    pub signed_dot: f32,
    pub score: f32,
    pub conjugate_form_character: ConjugateFormCharacter,
}

impl PersonalResonance {
    pub fn from_quaternions(q_personal: Quaternion, q_cosmic: Quaternion) -> Self {
        let q_personal = quat_normalize(q_personal);
        let q_cosmic = quat_normalize(q_cosmic);
        let signed_dot = q_personal
            .iter()
            .zip(q_cosmic.iter())
            .map(|(a, b)| a * b)
            .sum::<f32>()
            .clamp(-1.0, 1.0);
        let score = signed_dot.abs().clamp(0.0, 1.0);
        let conjugate_form_character = if signed_dot < -f32::EPSILON {
            ConjugateFormCharacter::ShadowInversion
        } else if score >= PERSONAL_RESONANCE_MAJOR_THRESHOLD {
            ConjugateFormCharacter::Major
        } else {
            ConjugateFormCharacter::Minor
        };
        Self {
            signed_dot,
            score,
            conjugate_form_character,
        }
    }
}

pub fn compose_personal_quaternion(
    q_identity: Quaternion,
    q_transit: Quaternion,
    q_activity: Quaternion,
) -> Quaternion {
    quat_normalize(quat_mul(
        quat_mul(quat_normalize(q_identity), quat_normalize(q_transit)),
        quat_normalize(q_activity),
    ))
}

pub fn decompose_bioquaternion(q_composed: Quaternion) -> (Quaternion, Quaternion) {
    let q_b = quat_normalize(q_composed);
    let q_p = [q_b[0], -q_b[1], -q_b[2], -q_b[3]];
    (q_b, q_p)
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum PersonalIdentityError {
    EmptyField {
        field: &'static str,
    },
    InvalidKerykeionNatalJson(String),
    InvalidIdentityHash,
    MissingPlanetsArray,
    MissingNatalPlanet {
        planet: String,
    },
    DuplicateNatalPlanet {
        planet: String,
    },
    UnknownNatalPlanet,
    InvalidPlanetId(u64),
    InvalidPlanetDegree {
        planet: String,
        degree: String,
    },
    ZeroElementalWeight,
    DuplicateIdentityAugmentProposal {
        proposal_handle: String,
    },
    UnknownIdentityAugmentProposal {
        proposal_handle: String,
    },
    InvalidIdentityAugmentTransition {
        from: IdentityAugmentProposalState,
        to: IdentityAugmentProposalState,
    },
}

impl fmt::Display for PersonalIdentityError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::EmptyField { field } => write!(f, "{field} is required"),
            Self::InvalidKerykeionNatalJson(err) => {
                write!(f, "invalid kerykeion natal JSON: {err}")
            }
            Self::InvalidIdentityHash => {
                write!(
                    f,
                    "identity_hash must be a 64-character hexadecimal BLAKE3 digest"
                )
            }
            Self::MissingPlanetsArray => write!(f, "kerykeion natal JSON must contain planets"),
            Self::MissingNatalPlanet { planet } => write!(f, "missing natal planet: {planet}"),
            Self::DuplicateNatalPlanet { planet } => write!(f, "duplicate natal planet: {planet}"),
            Self::UnknownNatalPlanet => write!(f, "unknown natal planet in kerykeion payload"),
            Self::InvalidPlanetId(planet_id) => write!(f, "invalid natal planet id: {planet_id}"),
            Self::InvalidPlanetDegree { planet, degree } => {
                write!(f, "invalid natal degree for {planet}: {degree}")
            }
            Self::ZeroElementalWeight => write!(f, "natal elemental weights sum to zero"),
            Self::DuplicateIdentityAugmentProposal { proposal_handle } => {
                write!(
                    f,
                    "identity augment proposal already exists: {proposal_handle}"
                )
            }
            Self::UnknownIdentityAugmentProposal { proposal_handle } => {
                write!(f, "unknown identity augment proposal: {proposal_handle}")
            }
            Self::InvalidIdentityAugmentTransition { from, to } => {
                write!(
                    f,
                    "invalid identity augment proposal transition: {from:?} -> {to:?}"
                )
            }
        }
    }
}

impl Error for PersonalIdentityError {}

fn elemental_weights_from_chart(chart: &KerykeionNatalChart) -> [f32; 4] {
    let mut weights = [0.0f32; 4];
    for planet in chart.planets {
        let sign = (planet.degree / 30.0).floor() as u8;
        let component = component_for_sign(sign);
        let weight = PLANET_KEPLERIAN_VELOCITY[planet.planet_id as usize]
            * planet_dignity_multiplier(planet.planet_id, sign);
        weights[component] += weight;
    }
    weights
}

fn component_for_sign(sign: u8) -> usize {
    match sign % 12 {
        0 | 4 | 8 => 1,
        1 | 5 | 9 => 0,
        2 | 6 | 10 => 3,
        _ => 2,
    }
}

fn planet_dignity_multiplier(planet_id: u8, sign: u8) -> f32 {
    // Classical domicile/exaltation is used where settled; outer planets only
    // receive the common modern domicile/detriment adjustment.
    if is_domicile(planet_id, sign) {
        1.20
    } else if is_exaltation(planet_id, sign) {
        1.10
    } else if is_detriment(planet_id, sign) {
        0.90
    } else if is_fall(planet_id, sign) {
        0.85
    } else {
        1.00
    }
}

fn is_domicile(planet_id: u8, sign: u8) -> bool {
    matches!(
        (planet_id, sign % 12),
        (0, 4)
            | (1, 3)
            | (2, 2)
            | (2, 5)
            | (3, 1)
            | (3, 6)
            | (4, 0)
            | (4, 7)
            | (5, 8)
            | (5, 11)
            | (6, 9)
            | (6, 10)
            | (7, 10)
            | (8, 11)
            | (9, 7)
    )
}

fn is_detriment(planet_id: u8, sign: u8) -> bool {
    (0..12).any(|domicile_sign| {
        is_domicile(planet_id, domicile_sign) && sign % 12 == (domicile_sign + 6) % 12
    })
}

fn is_exaltation(planet_id: u8, sign: u8) -> bool {
    matches!(
        (planet_id, sign % 12),
        (0, 0) | (1, 1) | (2, 5) | (3, 11) | (4, 9) | (5, 3) | (6, 6)
    )
}

fn is_fall(planet_id: u8, sign: u8) -> bool {
    (0..12).any(|exaltation_sign| {
        is_exaltation(planet_id, exaltation_sign) && sign % 12 == (exaltation_sign + 6) % 12
    })
}

fn planet_id_from_value(value: &serde_json::Value) -> Result<u8, PersonalIdentityError> {
    if let Some(planet_id) = value
        .get("planet_id")
        .or_else(|| value.get("planetId"))
        .or_else(|| value.get("id"))
        .and_then(|value| value.as_u64())
    {
        return if planet_id < PLANET_COUNT as u64 {
            Ok(planet_id as u8)
        } else {
            Err(PersonalIdentityError::InvalidPlanetId(planet_id))
        };
    }

    value
        .get("name")
        .or_else(|| value.get("planet_name"))
        .or_else(|| value.get("planetName"))
        .and_then(|value| value.as_str())
        .and_then(planet_id_from_name)
        .ok_or(PersonalIdentityError::UnknownNatalPlanet)
}

fn planet_degree_from_value(
    value: &serde_json::Value,
    planet_id: u8,
) -> Result<f32, PersonalIdentityError> {
    let degree = value
        .get("degree")
        .or_else(|| value.get("abs_pos"))
        .or_else(|| value.get("absPos"))
        .or_else(|| value.get("position"))
        .and_then(|value| value.as_f64())
        .ok_or_else(|| PersonalIdentityError::InvalidPlanetDegree {
            planet: planet_name(planet_id).to_owned(),
            degree: "missing".to_owned(),
        })? as f32;

    if degree.is_finite() && (0.0..360.0).contains(&degree) {
        Ok(degree)
    } else {
        Err(PersonalIdentityError::InvalidPlanetDegree {
            planet: planet_name(planet_id).to_owned(),
            degree: degree.to_string(),
        })
    }
}

fn planet_id_from_name(name: &str) -> Option<u8> {
    match name.to_ascii_lowercase().trim_start_matches("the ") {
        "sun" => Some(0),
        "moon" => Some(1),
        "mercury" => Some(2),
        "venus" => Some(3),
        "mars" => Some(4),
        "jupiter" => Some(5),
        "saturn" => Some(6),
        "uranus" => Some(7),
        "neptune" => Some(8),
        "pluto" => Some(9),
        _ => None,
    }
}

fn planet_name(planet_id: u8) -> &'static str {
    match planet_id {
        0 => "Sun",
        1 => "Moon",
        2 => "Mercury",
        3 => "Venus",
        4 => "Mars",
        5 => "Jupiter",
        6 => "Saturn",
        7 => "Uranus",
        8 => "Neptune",
        9 => "Pluto",
        _ => "Unknown",
    }
}

fn required(value: String, field: &'static str) -> Result<String, PersonalIdentityError> {
    let trimmed = value.trim();
    if trimmed.is_empty() {
        Err(PersonalIdentityError::EmptyField { field })
    } else {
        Ok(trimmed.to_owned())
    }
}

fn required_identity_hash(value: String) -> Result<String, PersonalIdentityError> {
    let value = required(value, "identity_hash")?;
    if identity_hash_kinds_during_cutover(&value).is_some() {
        Ok(value)
    } else {
        Err(PersonalIdentityError::InvalidIdentityHash)
    }
}

pub fn identity_hash_kinds_during_cutover(value: &str) -> Option<[IdentityHashKind; 2]> {
    if IDENTITY_HASH_MIGRATION_POLICY.phase != IdentityHashMigrationPhase::Cutover {
        return None;
    }
    if value.len() == 64 && value.chars().all(|character| character.is_ascii_hexdigit()) {
        Some([
            IdentityHashKind::LegacyBirthDataBlake3,
            IdentityHashKind::QuaternionicSignatureBlake3,
        ])
    } else {
        None
    }
}

#[cfg(test)]
mod proposal_lifecycle {
    use super::*;

    const COMPLETE_NATAL: &str = include_str!("../tests/fixtures/kerykeion_natal_complete.json");
    const IDENTITY_HASH: &str = "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08";
    const NATAL_HANDLE: &str = "protected://nara/kairos/natal/proposal-lifecycle";

    #[test]
    fn proposed_reviewed_and_accepted_do_not_mutate_q_identity_until_applied() {
        let mut profile = PersonalIdentityProfile::from_kerykeion_json(
            NATAL_HANDLE,
            IDENTITY_HASH,
            COMPLETE_NATAL,
        )
        .expect("fixture should derive protected identity");
        let original_q_identity = profile.q_identity;
        let original_q_personal = profile.q_personal;
        let candidate_q_identity = [0.0, 1.0, 1.0, 0.0];

        let mut adapter = IdentityAugmentProposalAdapter::new();
        let submitted = adapter
            .submit(
                IdentityAugmentProposal::proposed(
                    "identity-proposal://birthdate-layer",
                    "Birthdate encoding layer ready for M5 review.",
                    "adapter://m4/identity-augment",
                    "2026-06-25T09:00:00.000Z",
                    candidate_q_identity,
                )
                .expect("proposal is valid"),
            )
            .expect("proposal submits");
        assert_eq!(submitted.state, IdentityAugmentProposalState::Proposed);
        assert_eq!(profile.q_identity, original_q_identity);

        let reviewed = adapter
            .review(
                "identity-proposal://birthdate-layer",
                "2026-06-25T09:01:00.000Z",
            )
            .expect("proposal reviews");
        assert_eq!(reviewed.state, IdentityAugmentProposalState::Reviewed);
        assert_eq!(profile.q_identity, original_q_identity);

        let accepted = adapter
            .decide(
                "identity-proposal://birthdate-layer",
                IdentityAugmentReviewVerdict::Accept,
                "2026-06-25T09:02:00.000Z",
            )
            .expect("proposal accepts");
        assert_eq!(accepted.state, IdentityAugmentProposalState::Accepted);
        assert_eq!(profile.q_identity, original_q_identity);
        assert_eq!(profile.q_personal, original_q_personal);

        let applied = adapter
            .apply(
                "identity-proposal://birthdate-layer",
                &mut profile,
                "2026-06-25T09:03:00.000Z",
            )
            .expect("accepted proposal applies");
        assert_eq!(applied.state, IdentityAugmentProposalState::Applied);
        assert_ne!(profile.q_identity, original_q_identity);
        assert_approx_quat(profile.q_identity, quat_normalize(candidate_q_identity));
        assert_eq!(
            profile.q_personal,
            integrate_nara_quintessence(profile.q_identity, &[])
        );
        assert!(adapter.pending_proposal_views().is_empty());
    }

    #[test]
    fn rejected_proposal_cannot_apply_or_mutate_q_identity() {
        let mut profile = PersonalIdentityProfile::from_kerykeion_json(
            NATAL_HANDLE,
            IDENTITY_HASH,
            COMPLETE_NATAL,
        )
        .expect("fixture should derive protected identity");
        let original_q_identity = profile.q_identity;

        let mut adapter = IdentityAugmentProposalAdapter::new();
        adapter
            .submit(
                IdentityAugmentProposal::proposed(
                    "identity-proposal://rejected",
                    "Reviewer should reject this candidate.",
                    "adapter://m4/identity-augment",
                    "2026-06-25T10:00:00.000Z",
                    [0.0, 0.0, 1.0, 1.0],
                )
                .expect("proposal is valid"),
            )
            .expect("proposal submits");
        adapter
            .review("identity-proposal://rejected", "2026-06-25T10:01:00.000Z")
            .expect("proposal reviews");
        adapter
            .decide(
                "identity-proposal://rejected",
                IdentityAugmentReviewVerdict::Reject,
                "2026-06-25T10:02:00.000Z",
            )
            .expect("proposal rejects");

        let err = adapter
            .apply(
                "identity-proposal://rejected",
                &mut profile,
                "2026-06-25T10:03:00.000Z",
            )
            .expect_err("rejected proposal is terminal");

        assert_eq!(profile.q_identity, original_q_identity);
        assert!(matches!(
            err,
            PersonalIdentityError::InvalidIdentityAugmentTransition {
                from: IdentityAugmentProposalState::Rejected,
                to: IdentityAugmentProposalState::Applied
            }
        ));
    }

    #[test]
    fn surface_view_is_read_only_and_does_not_serialize_candidate_quaternion() {
        let proposal = IdentityAugmentProposal::proposed(
            "identity-proposal://view",
            "Handle-only proposal view.",
            "adapter://m4/identity-augment",
            "2026-06-25T11:00:00.000Z",
            [0.0, 1.0, 0.0, 1.0],
        )
        .expect("proposal is valid");

        let view = proposal.view();
        let json = serde_json::to_string(&view).expect("view serializes");

        assert!(json.contains("identity-proposal://view"));
        assert!(!json.contains("qIdentity"));
        assert!(!json.contains("q_identity"));
        assert!(!json.contains("candidate"));
        assert_approx_quat(
            proposal.q_identity_candidate(),
            quat_normalize([0.0, 1.0, 0.0, 1.0]),
        );
    }

    fn assert_approx_quat(actual: [f32; 4], expected: [f32; 4]) {
        for (actual, expected) in actual.iter().zip(expected.iter()) {
            assert!((actual - expected).abs() < 1e-6, "{actual} != {expected}");
        }
    }
}

#[cfg(test)]
mod bioquaternion_decomposition {
    use super::*;

    #[test]
    fn dr_m4_2_ratified_bindings_are_executable() {
        assert_eq!(
            CL42_PERSONAL_AXIS_ORDER,
            [
                Cl42AxisBinding {
                    axis: Cl42QuaternionAxis::W,
                    element: ElementalAxis::Earth
                },
                Cl42AxisBinding {
                    axis: Cl42QuaternionAxis::X,
                    element: ElementalAxis::Fire
                },
                Cl42AxisBinding {
                    axis: Cl42QuaternionAxis::Y,
                    element: ElementalAxis::Water
                },
                Cl42AxisBinding {
                    axis: Cl42QuaternionAxis::Z,
                    element: ElementalAxis::Air
                },
            ]
        );
        assert_eq!(
            PERSONAL_CYMATIC_POLARITY,
            [
                PersonalCymaticPolarityBinding {
                    pole: 0,
                    register: PersonalCymaticRegister::Cosmic
                },
                PersonalCymaticPolarityBinding {
                    pole: 1,
                    register: PersonalCymaticRegister::Personal
                },
            ]
        );
        assert!(IDENTITY_HASH_MIGRATION_POLICY.accepts_legacy_birth_data_hash);
        assert!(IDENTITY_HASH_MIGRATION_POLICY.accepts_quaternionic_signature_hash);
        assert!(VAMA_LONG_PERIOD_REVIEW_POLICY.computed_mandatory_internal_long_period_review);
        assert!(VAMA_LONG_PERIOD_REVIEW_POLICY.user_visible_on_request);
        assert!(!VAMA_LONG_PERIOD_REVIEW_POLICY.auto_raise_to_user);
    }

    #[test]
    fn q_personal_integrates_q_identity_baseline_and_extra_layers() {
        let q_identity = [1.0, 0.0, 0.0, 0.0];
        let q_birthdate = [0.0, 1.0, 0.0, 0.0];
        let q_activity_history = [0.0, 0.0, 1.0, 0.0];

        let q_personal =
            integrate_nara_quintessence(q_identity, &[q_birthdate, q_activity_history]);
        let expected = compose_personal_quaternion(q_identity, q_birthdate, q_activity_history);

        assert_eq!(q_personal, expected);
    }

    #[test]
    fn identity_hash_cutover_accepts_one_digest_as_both_kinds() {
        let digest = "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08";
        assert_eq!(
            identity_hash_kinds_during_cutover(digest),
            Some([
                IdentityHashKind::LegacyBirthDataBlake3,
                IdentityHashKind::QuaternionicSignatureBlake3
            ])
        );
        assert_eq!(identity_hash_kinds_during_cutover("not-a-hash"), None);
    }

    #[test]
    fn bioquaternion_decomposition_reads_from_q_composed() {
        let q_identity = [0.5, 0.5, 0.5, 0.5];
        let q_transit = [0.0, 1.0, 0.0, 0.0];
        let q_activity_a = [0.0, 0.0, 1.0, 0.0];
        let q_activity_b = [0.0, 0.0, 0.0, 1.0];

        let q_composed_a = compose_personal_quaternion(q_identity, q_transit, q_activity_a);
        let q_composed_b = compose_personal_quaternion(q_identity, q_transit, q_activity_b);

        let (q_b_a, q_p_a) = decompose_bioquaternion(q_composed_a);
        let (q_b_b, q_p_b) = decompose_bioquaternion(q_composed_b);

        assert_eq!(q_b_a, q_composed_a);
        assert_eq!(
            q_p_a,
            [
                q_composed_a[0],
                -q_composed_a[1],
                -q_composed_a[2],
                -q_composed_a[3]
            ]
        );
        assert_eq!(q_b_b, q_composed_b);
        assert_eq!(
            q_p_b,
            [
                q_composed_b[0],
                -q_composed_b[1],
                -q_composed_b[2],
                -q_composed_b[3]
            ]
        );
        assert_ne!(q_b_a, q_b_b);
        assert_ne!(q_p_a, q_p_b);
    }
}
