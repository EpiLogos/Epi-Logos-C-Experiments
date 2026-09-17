use crate::personal_identity::compose_personal_quaternion;
use crate::quaternion::{quat_mul, quat_normalize};
use crate::vak_address::VakAddress;
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use std::fmt;
use std::str::FromStr;

#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize, PartialOrd, Ord)]
#[serde(rename_all = "snake_case")]
pub enum VamaShaktiClass {
    Egregore = 0x01,
    Sprite = 0x02,
    Daemon = 0x03,
    Mantra = 0x04,
}

impl VamaShaktiClass {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Egregore => "egregore",
            Self::Sprite => "sprite",
            Self::Daemon => "daemon",
            Self::Mantra => "mantra",
        }
    }
}

impl fmt::Display for VamaShaktiClass {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(self.as_str())
    }
}

impl FromStr for VamaShaktiClass {
    type Err = VamaShaktiError;

    fn from_str(value: &str) -> Result<Self, Self::Err> {
        match value.trim().to_ascii_lowercase().as_str() {
            "egregore" => Ok(Self::Egregore),
            "sprite" => Ok(Self::Sprite),
            "daemon" => Ok(Self::Daemon),
            "mantra" => Ok(Self::Mantra),
            other => Err(VamaShaktiError::InvalidClass(other.to_owned())),
        }
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VamaShaktiEssentialIdentity {
    pub vama_shakti_quintessence_hash: [u8; 32],
    pub vama_shakti_q_identity: [f32; 4],
    pub vama_shakti_clock_position: f32,
    pub vama_shakti_coordinate: VakAddress,
    pub vama_shakti_class: VamaShaktiClass,
    pub psyche_template_revision: [u8; 32],
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RupaSpecializationHandle {
    pub handle: String,
    pub vama_shakti_class: VamaShaktiClass,
    pub psyche_template_revision: [u8; 32],
    pub specialization_hash: [u8; 32],
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QActivityAccumulator {
    pub vama_shakti_class: VamaShaktiClass,
    pub q_activity_accumulator: [f32; 4],
    pub turn_count: u64,
    pub perturbation_hash: [u8; 32],
    pub last_turn_kairos_delta: f32,
}

impl QActivityAccumulator {
    pub fn new(vama_shakti_class: VamaShaktiClass) -> Self {
        Self {
            vama_shakti_class,
            q_activity_accumulator: [1.0, 0.0, 0.0, 0.0],
            turn_count: 0,
            perturbation_hash: blake3_hash_bytes(&[vama_shakti_class as u8]),
            last_turn_kairos_delta: 0.0,
        }
    }

    pub fn apply_turn(
        &mut self,
        turn_vak_address: &VakAddress,
        turn_kairos_delta: f32,
        cited_coordinates: &[VakAddress],
    ) {
        self.q_activity_accumulator = perturb_q_activity(
            self.q_activity_accumulator,
            turn_vak_address,
            turn_kairos_delta,
            cited_coordinates,
            self.vama_shakti_class,
        );
        self.turn_count += 1;
        self.last_turn_kairos_delta = turn_kairos_delta;
        let mut hasher = blake3::Hasher::new();
        hasher.update(&self.perturbation_hash);
        hasher.update(&self.turn_count.to_le_bytes());
        hasher.update(&turn_kairos_delta.to_le_bytes());
        hasher.update(&canonical_vak_bytes(turn_vak_address));
        for coord in cited_coordinates {
            hasher.update(&canonical_vak_bytes(coord));
        }
        self.perturbation_hash = hasher.finalize().into();
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WarmVamaShakti {
    pub identity_handle: String,
    pub coordinate_label: String,
    pub essential_identity: VamaShaktiEssentialIdentity,
    pub q_activity_accumulator: QActivityAccumulator,
    pub rupa_specialization: RupaSpecializationHandle,
    pub warmed_at_ms: u64,
    pub last_seen_at_ms: u64,
    pub released_at_ms: Option<u64>,
    pub release_reason: Option<VamaShaktiReleaseReason>,
}

impl WarmVamaShakti {
    pub fn is_active(&self) -> bool {
        self.released_at_ms.is_none()
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum VamaShaktiReleaseReason {
    Gc,
    Promote,
}

impl FromStr for VamaShaktiReleaseReason {
    type Err = VamaShaktiError;

    fn from_str(value: &str) -> Result<Self, Self::Err> {
        match value.trim().to_ascii_lowercase().as_str() {
            "gc" => Ok(Self::Gc),
            "promote" => Ok(Self::Promote),
            other => Err(VamaShaktiError::InvalidReleaseReason(other.to_owned())),
        }
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PrewarmVamaShaktiRequest {
    pub coordinate_label: String,
    pub coordinate: VakAddress,
    pub canonical_form_digest: [u8; 32],
    pub archetypal_sattva: String,
    pub vama_shakti_class: VamaShaktiClass,
    pub psyche_template_md: String,
    pub entity_form_md: String,
    pub psyche_template_revision: [u8; 32],
    pub now_ms: u64,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ArenaPresence {
    pub scene_key: String,
    pub identity_handle: String,
    pub vama_shakti_class: VamaShaktiClass,
    pub q_activity_accumulator: [f32; 4],
    pub q_composed_at_now: [f32; 4],
    pub psyche_template_revision: [u8; 32],
    pub psyche_template_revision_drift: bool,
    pub accumulated_turns_observed: u64,
    pub rupa_specialization: RupaSpecializationHandle,
}

#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WarmVamaShaktiFilter {
    pub coordinate: Option<String>,
    pub vama_shakti_class: Option<VamaShaktiClass>,
    pub age_gte_ms: Option<u64>,
    pub now_ms: u64,
}

#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WarmVamaShaktiRegistry {
    pub warm: BTreeMap<String, WarmVamaShakti>,
}

impl WarmVamaShaktiRegistry {
    pub fn prewarm(&mut self, req: PrewarmVamaShaktiRequest) -> WarmVamaShakti {
        let essential = derive_vama_shakti_essential_identity(
            &req.coordinate,
            &req.canonical_form_digest,
            &req.archetypal_sattva,
            req.vama_shakti_class,
            req.psyche_template_revision,
        );
        let identity_handle = hex_digest(&essential.vama_shakti_quintessence_hash);
        let rupa_specialization = rupa_specialization_handle(
            &req.psyche_template_md,
            &req.entity_form_md,
            &req.coordinate,
            req.vama_shakti_class,
            req.psyche_template_revision,
        );
        let row = WarmVamaShakti {
            identity_handle: identity_handle.clone(),
            coordinate_label: req.coordinate_label,
            essential_identity: essential,
            q_activity_accumulator: QActivityAccumulator::new(req.vama_shakti_class),
            rupa_specialization,
            warmed_at_ms: req.now_ms,
            last_seen_at_ms: req.now_ms,
            released_at_ms: None,
            release_reason: None,
        };
        self.warm.insert(identity_handle, row.clone());
        row
    }

    pub fn apply_turn(
        &mut self,
        identity_handle: &str,
        turn_vak_address: &VakAddress,
        turn_kairos_delta: f32,
        cited_coordinates: &[VakAddress],
        now_ms: u64,
    ) -> Result<[f32; 4], VamaShaktiError> {
        let row = self.active_row_mut(identity_handle)?;
        row.q_activity_accumulator.apply_turn(
            turn_vak_address,
            turn_kairos_delta,
            cited_coordinates,
        );
        row.last_seen_at_ms = now_ms;
        Ok(row.q_activity_accumulator.q_activity_accumulator)
    }

    pub fn summon_warm(
        &mut self,
        scene_key: impl Into<String>,
        identity_handle: &str,
        q_transit_at_now: [f32; 4],
        current_psyche_template_md: &str,
        current_entity_form_md: &str,
        current_psyche_template_revision: [u8; 32],
        now_ms: u64,
    ) -> Result<ArenaPresence, VamaShaktiError> {
        let scene_key = scene_key.into();
        let row = self.active_row_mut(identity_handle)?;
        let drift =
            row.essential_identity.psyche_template_revision != current_psyche_template_revision;
        if drift {
            row.essential_identity.psyche_template_revision = current_psyche_template_revision;
            row.rupa_specialization = rupa_specialization_handle(
                current_psyche_template_md,
                current_entity_form_md,
                &row.essential_identity.vama_shakti_coordinate,
                row.essential_identity.vama_shakti_class,
                current_psyche_template_revision,
            );
        }
        row.last_seen_at_ms = now_ms;
        let q_activity = row.q_activity_accumulator.q_activity_accumulator;
        let q_composed_at_now =
            compose_vama_shakti_q_at_now(&row.essential_identity, q_transit_at_now, q_activity);
        Ok(ArenaPresence {
            scene_key,
            identity_handle: row.identity_handle.clone(),
            vama_shakti_class: row.essential_identity.vama_shakti_class,
            q_activity_accumulator: q_activity,
            q_composed_at_now,
            psyche_template_revision: row.essential_identity.psyche_template_revision,
            psyche_template_revision_drift: drift,
            accumulated_turns_observed: row.q_activity_accumulator.turn_count,
            rupa_specialization: row.rupa_specialization.clone(),
        })
    }

    pub fn list_warm(&self, filter: &WarmVamaShaktiFilter) -> Vec<WarmVamaShakti> {
        self.warm
            .values()
            .filter(|row| row.is_active())
            .filter(|row| {
                filter
                    .coordinate
                    .as_ref()
                    .map(|coord| row.coordinate_label == *coord)
                    .unwrap_or(true)
            })
            .filter(|row| {
                filter
                    .vama_shakti_class
                    .map(|class| row.essential_identity.vama_shakti_class == class)
                    .unwrap_or(true)
            })
            .filter(|row| {
                filter
                    .age_gte_ms
                    .map(|age| filter.now_ms.saturating_sub(row.warmed_at_ms) >= age)
                    .unwrap_or(true)
            })
            .cloned()
            .collect()
    }

    pub fn release(
        &mut self,
        identity_handle: &str,
        reason: VamaShaktiReleaseReason,
        now_ms: u64,
    ) -> Result<WarmVamaShakti, VamaShaktiError> {
        let row = self
            .warm
            .get_mut(identity_handle)
            .ok_or_else(|| VamaShaktiError::UnknownIdentity(identity_handle.to_owned()))?;
        row.released_at_ms = Some(now_ms);
        row.release_reason = Some(reason);
        row.last_seen_at_ms = now_ms;
        Ok(row.clone())
    }

    fn active_row_mut(
        &mut self,
        identity_handle: &str,
    ) -> Result<&mut WarmVamaShakti, VamaShaktiError> {
        let row = self
            .warm
            .get_mut(identity_handle)
            .ok_or_else(|| VamaShaktiError::UnknownIdentity(identity_handle.to_owned()))?;
        if row.released_at_ms.is_some() {
            return Err(VamaShaktiError::ReleasedIdentity(
                identity_handle.to_owned(),
            ));
        }
        Ok(row)
    }
}

pub fn derive_vama_shakti_essential_identity(
    coordinate: &VakAddress,
    canonical_form_digest: &[u8; 32],
    archetypal_sattva: &str,
    vama_shakti_class: VamaShaktiClass,
    psyche_template_revision: [u8; 32],
) -> VamaShaktiEssentialIdentity {
    let mut hasher = blake3::Hasher::new();
    hasher.update(&canonical_vak_bytes(coordinate));
    hasher.update(canonical_form_digest);
    hasher.update(archetypal_sattva.as_bytes());
    hasher.update(&[vama_shakti_class as u8]);
    let vama_shakti_quintessence_hash = hasher.finalize().into();
    let vama_shakti_clock_position = clock_position_from_hash(&vama_shakti_quintessence_hash);
    let vama_shakti_q_identity =
        quaternion_from_clock_degree(vama_shakti_clock_position, &vama_shakti_quintessence_hash);

    VamaShaktiEssentialIdentity {
        vama_shakti_quintessence_hash,
        vama_shakti_q_identity,
        vama_shakti_clock_position,
        vama_shakti_coordinate: coordinate.clone(),
        vama_shakti_class,
        psyche_template_revision,
    }
}

pub fn compose_vama_shakti_q_at_now(
    essential: &VamaShaktiEssentialIdentity,
    q_transit: [f32; 4],
    q_activity: [f32; 4],
) -> [f32; 4] {
    compose_personal_quaternion(essential.vama_shakti_q_identity, q_transit, q_activity)
}

pub fn rupa_specialization_handle(
    psyche_template_md: &str,
    entity_form_md: &str,
    entity_coordinate: &VakAddress,
    vama_shakti_class: VamaShaktiClass,
    psyche_template_revision: [u8; 32],
) -> RupaSpecializationHandle {
    let mut hasher = blake3::Hasher::new();
    hasher.update(psyche_template_md.as_bytes());
    hasher.update(entity_form_md.as_bytes());
    hasher.update(&canonical_vak_bytes(entity_coordinate));
    hasher.update(&[vama_shakti_class as u8]);
    hasher.update(&psyche_template_revision);
    let specialization_hash: [u8; 32] = hasher.finalize().into();
    RupaSpecializationHandle {
        handle: format!(
            "protected://nara/vama/rupa/{}/{}",
            vama_shakti_class,
            hex_digest(&specialization_hash)
        ),
        vama_shakti_class,
        psyche_template_revision,
        specialization_hash,
    }
}

pub fn perturb_q_activity(
    current_q_activity: [f32; 4],
    turn_vak_address: &VakAddress,
    turn_kairos_delta: f32,
    cited_coordinates: &[VakAddress],
    vama_shakti_class: VamaShaktiClass,
) -> [f32; 4] {
    let hash = perturbation_input_hash(turn_vak_address, turn_kairos_delta, cited_coordinates);
    let cited_count = cited_coordinates.len() as f32;
    let user_coord_count = cited_coordinates
        .iter()
        .filter(|coord| coordinate_reads_userish(coord))
        .count() as f32;
    let delta = turn_kairos_delta.abs().min(8.0);
    let threshold_crossing = ((turn_kairos_delta * 12.0).round() as i32).rem_euclid(4) == 0;
    let (angle, axis_salt) = match vama_shakti_class {
        VamaShaktiClass::Egregore => (0.0125 + cited_count * 0.004 + delta * 0.002, 0xE9),
        VamaShaktiClass::Sprite => (0.0300 + delta * 0.035, 0x57),
        VamaShaktiClass::Daemon => (
            0.0180 + user_coord_count * 0.014 + cited_count * 0.002,
            0xDA,
        ),
        VamaShaktiClass::Mantra => (
            0.0160 + if threshold_crossing { 0.021 } else { 0.006 } + delta * 0.004,
            0x44,
        ),
    };
    let axis = axis_from_hash(&hash, axis_salt);
    let perturbation = quaternion_from_axis_angle(axis, angle);
    quat_normalize(quat_mul(quat_normalize(current_q_activity), perturbation))
}

pub fn transit_quaternion_at_millis(now_ms: u64) -> [f32; 4] {
    const DAY_MS: u64 = 86_400_000;
    let day_fraction = (now_ms % DAY_MS) as f32 / DAY_MS as f32;
    quaternion_from_axis_angle([0.0, 1.0, 0.0], std::f32::consts::TAU * day_fraction)
}

pub fn hash_revision(content: &str) -> [u8; 32] {
    blake3_hash_bytes(content.as_bytes())
}

pub fn hex_digest(bytes: &[u8; 32]) -> String {
    const HEX: &[u8; 16] = b"0123456789abcdef";
    let mut out = String::with_capacity(64);
    for byte in bytes {
        out.push(HEX[(byte >> 4) as usize] as char);
        out.push(HEX[(byte & 0x0f) as usize] as char);
    }
    out
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum VamaShaktiError {
    InvalidClass(String),
    InvalidReleaseReason(String),
    UnknownIdentity(String),
    ReleasedIdentity(String),
    Serialization(String),
}

impl fmt::Display for VamaShaktiError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::InvalidClass(class) => write!(
                f,
                "invalid Vama Shakti class `{class}` (expected egregore, sprite, daemon, or mantra)"
            ),
            Self::InvalidReleaseReason(reason) => {
                write!(
                    f,
                    "invalid release reason `{reason}` (expected gc or promote)"
                )
            }
            Self::UnknownIdentity(identity) => write!(f, "unknown warm Vama Shakti `{identity}`"),
            Self::ReleasedIdentity(identity) => {
                write!(f, "warm Vama Shakti `{identity}` has already been released")
            }
            Self::Serialization(err) => write!(f, "Vama Shakti serialization error: {err}"),
        }
    }
}

impl std::error::Error for VamaShaktiError {}

fn canonical_vak_bytes(coordinate: &VakAddress) -> Vec<u8> {
    serde_json::to_vec(coordinate).unwrap_or_else(|_| {
        format!(
            "{:?}|{:?}|{}|{}|{}|{}|{:?}",
            coordinate.cpf,
            coordinate.ct,
            coordinate.cp,
            coordinate.cf,
            coordinate.cfp,
            coordinate.cs.code,
            coordinate.cs.direction
        )
        .into_bytes()
    })
}

fn perturbation_input_hash(
    turn_vak_address: &VakAddress,
    turn_kairos_delta: f32,
    cited_coordinates: &[VakAddress],
) -> [u8; 32] {
    let mut hasher = blake3::Hasher::new();
    hasher.update(&canonical_vak_bytes(turn_vak_address));
    hasher.update(&turn_kairos_delta.to_le_bytes());
    for coord in cited_coordinates {
        hasher.update(&canonical_vak_bytes(coord));
    }
    hasher.finalize().into()
}

fn coordinate_reads_userish(coordinate: &VakAddress) -> bool {
    let haystack = format!(
        "{}|{}|{}|{}",
        coordinate.cp, coordinate.cf, coordinate.cfp, coordinate.cs.code
    )
    .to_ascii_lowercase();
    haystack.contains("user") || haystack.contains("personal") || haystack.contains("m4")
}

fn clock_position_from_hash(hash: &[u8; 32]) -> f32 {
    let mut bytes = [0u8; 4];
    bytes.copy_from_slice(&hash[0..4]);
    let value = u32::from_le_bytes(bytes);
    (value as f64 / u32::MAX as f64 * 360.0) as f32
}

fn quaternion_from_clock_degree(degree: f32, hash: &[u8; 32]) -> [f32; 4] {
    let axis = axis_from_hash(hash, 0xA5);
    quaternion_from_axis_angle(axis, degree.to_radians())
}

fn quaternion_from_axis_angle(axis: [f32; 3], angle: f32) -> [f32; 4] {
    let half = angle / 2.0;
    let sin = half.sin();
    quat_normalize([half.cos(), axis[0] * sin, axis[1] * sin, axis[2] * sin])
}

fn axis_from_hash(hash: &[u8; 32], salt: u8) -> [f32; 3] {
    let x = hash[0] ^ salt;
    let y = hash[11].wrapping_add(salt);
    let z = hash[23].wrapping_sub(salt);
    let raw = [
        (x as f32 / 127.5) - 1.0,
        (y as f32 / 127.5) - 1.0,
        (z as f32 / 127.5) - 1.0,
    ];
    let mag = (raw[0] * raw[0] + raw[1] * raw[1] + raw[2] * raw[2]).sqrt();
    if mag < f32::EPSILON {
        [1.0, 0.0, 0.0]
    } else {
        [raw[0] / mag, raw[1] / mag, raw[2] / mag]
    }
}

fn blake3_hash_bytes(bytes: &[u8]) -> [u8; 32] {
    blake3::hash(bytes).into()
}
