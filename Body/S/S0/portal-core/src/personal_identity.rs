use std::error::Error;
use std::fmt;

use serde::{Deserialize, Serialize};

use crate::kernel::{ConjugateFormCharacter, ProfilePrivacyClass};
use crate::quaternion::{quat_mul, quat_normalize};

pub const PERSONAL_RESONANCE_MAJOR_THRESHOLD: f32 = 2.0 / 3.0;

const PLANET_COUNT: usize = 10;
// Mirrors M2_PLANET_LUT.keplerian_vel in epi-lib/include/m2.h (arcsec/day x 10).
const PLANET_KEPLERIAN_VELOCITY: [f32; PLANET_COUNT] = [
    35_999.0, 47_270.0, 14_739.0, 3_600.0, 1_886.0, 299.0, 120.0, 42.0, 21.0, 14.0,
];

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
    pub q_personal: [f32; 4],
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
        Ok(Self {
            q_personal: quat_normalize(raw),
            natal_chart_handle,
            elemental_balance: ElementalBalance::from_raw_weights(raw)?,
            identity_hash,
            privacy_class: ProfilePrivacyClass::ProtectedLocalDerived,
        })
    }

    pub fn composed_quaternion(&self, q_transit: [f32; 4], q_activity: [f32; 4]) -> [f32; 4] {
        compose_personal_quaternion(self.q_personal, q_transit, q_activity)
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PersonalResonance {
    pub signed_dot: f32,
    pub score: f32,
    pub conjugate_form_character: ConjugateFormCharacter,
}

impl PersonalResonance {
    pub fn from_quaternions(q_personal: [f32; 4], q_cosmic: [f32; 4]) -> Self {
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
    q_identity: [f32; 4],
    q_transit: [f32; 4],
    q_activity: [f32; 4],
) -> [f32; 4] {
    quat_normalize(quat_mul(
        quat_mul(quat_normalize(q_identity), quat_normalize(q_transit)),
        quat_normalize(q_activity),
    ))
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum PersonalIdentityError {
    EmptyField { field: &'static str },
    InvalidKerykeionNatalJson(String),
    InvalidIdentityHash,
    MissingPlanetsArray,
    MissingNatalPlanet { planet: String },
    DuplicateNatalPlanet { planet: String },
    UnknownNatalPlanet,
    InvalidPlanetId(u64),
    InvalidPlanetDegree { planet: String, degree: String },
    ZeroElementalWeight,
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
    if value.len() == 64 && value.chars().all(|character| character.is_ascii_hexdigit()) {
        Ok(value)
    } else {
        Err(PersonalIdentityError::InvalidIdentityHash)
    }
}
