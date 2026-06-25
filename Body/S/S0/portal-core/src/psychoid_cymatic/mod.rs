//! Coordinate: [[S0]] / protected [[M4']] renderer-handle derivation.
//! Residency: `Body/S/S0/portal-core/src/psychoid_cymatic`.
//! Position (#n): #4 personal-Pratibimba field support.
//! Actualises: deterministic handle derivation from `MathemeHarmonicProfile.audio_octet[8]`
//! and `nodal_quartet[4]` for the protected psychoid-cymatic renderer.
//! Public surface: DR-IG-6 geometry metadata, solver strategy, and opaque renderer handle.
//! Does NOT own: raw cymatic field bodies, renderer allocation, S3 persistence, journal bodies,
//! or audio synthesis.
//! Contract: [[M4'-SPEC]] protected-local field; [[M2'-SPEC]] audio/nodal bus.

use serde::{Deserialize, Serialize};

use crate::kernel::{MathemeHarmonicProfile, MathemeNodalConstraint};

pub const PSYCHOID_CYMATIC_CONTRACT_VERSION: &str = "psychoid-cymatic.handle.v1";
pub const PSYCHOID_CYMATIC_GEOMETRY_LAW: &str = "DR-IG-6";
pub const PSYCHOID_CYMATIC_PRIVACY_CLASS: &str = "protected-local-handle-only";

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum PsychoidCymaticSolverStrategy {
    OptionF,
    OptionS,
}

impl PsychoidCymaticSolverStrategy {
    fn slug(self) -> &'static str {
        match self {
            Self::OptionF => "option-f",
            Self::OptionS => "option-s",
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum PsychoidCymaticGeometryRole {
    ApexPole,
    InterleavedBaseVertex,
    CentralAxisPoint,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PsychoidCymaticGeometryVertex {
    pub id: &'static str,
    pub role: PsychoidCymaticGeometryRole,
    pub x: f32,
    pub y: f32,
    pub z: f32,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PsychoidCymaticGeometry {
    pub law: &'static str,
    pub contract_note: &'static str,
    pub vertices: Vec<PsychoidCymaticGeometryVertex>,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PsychoidCymaticRendererHandle {
    pub contract_version: &'static str,
    pub renderer_handle: String,
    pub geometry_law: &'static str,
    pub geometry_handle: String,
    pub solver_strategy: PsychoidCymaticSolverStrategy,
    pub privacy_class: &'static str,
    pub tick: u64,
    pub tick12: u8,
    pub audio_bus_digest: String,
    pub nodal_digest: String,
}

pub fn build_psychoid_cymatic_renderer_handle(
    profile: &MathemeHarmonicProfile,
    solver_strategy: PsychoidCymaticSolverStrategy,
) -> PsychoidCymaticRendererHandle {
    let audio_bus_digest = digest_audio_octet(&profile.audio_octet);
    let nodal_digest = digest_nodal_quartet(&profile.nodal_quartet);
    let geometry_handle = geometry_handle();
    let renderer_digest = renderer_digest(
        profile.tick,
        profile.tick12,
        solver_strategy,
        &audio_bus_digest,
        &nodal_digest,
        &geometry_handle,
    );

    PsychoidCymaticRendererHandle {
        contract_version: PSYCHOID_CYMATIC_CONTRACT_VERSION,
        renderer_handle: format!(
            "psychoid-cymatic://renderer/dr-ig-6/{}/{}",
            solver_strategy.slug(),
            renderer_digest
        ),
        geometry_law: PSYCHOID_CYMATIC_GEOMETRY_LAW,
        geometry_handle,
        solver_strategy,
        privacy_class: PSYCHOID_CYMATIC_PRIVACY_CLASS,
        tick: profile.tick,
        tick12: profile.tick12,
        audio_bus_digest,
        nodal_digest,
    }
}

pub fn dr_ig_6_geometry() -> PsychoidCymaticGeometry {
    PsychoidCymaticGeometry {
        law: PSYCHOID_CYMATIC_GEOMETRY_LAW,
        contract_note: "apex-poles + interleaved-base + central-axis",
        vertices: vec![
            vertex("P5", PsychoidCymaticGeometryRole::ApexPole, 0.0, -1.0, 1.0),
            vertex("P5'", PsychoidCymaticGeometryRole::ApexPole, 0.0, 1.0, -1.0),
            vertex(
                "P1",
                PsychoidCymaticGeometryRole::InterleavedBaseVertex,
                std::f32::consts::FRAC_1_SQRT_2,
                -0.34,
                0.34,
            ),
            vertex(
                "P1'",
                PsychoidCymaticGeometryRole::InterleavedBaseVertex,
                0.0,
                0.34,
                0.78,
            ),
            vertex(
                "P2",
                PsychoidCymaticGeometryRole::InterleavedBaseVertex,
                0.0,
                -0.34,
                0.78,
            ),
            vertex(
                "P2'",
                PsychoidCymaticGeometryRole::InterleavedBaseVertex,
                -std::f32::consts::FRAC_1_SQRT_2,
                0.34,
                0.34,
            ),
            vertex(
                "P3",
                PsychoidCymaticGeometryRole::InterleavedBaseVertex,
                -std::f32::consts::FRAC_1_SQRT_2,
                -0.34,
                0.34,
            ),
            vertex(
                "P3'",
                PsychoidCymaticGeometryRole::InterleavedBaseVertex,
                0.0,
                0.34,
                -0.78,
            ),
            vertex(
                "P4",
                PsychoidCymaticGeometryRole::InterleavedBaseVertex,
                0.0,
                -0.34,
                -0.78,
            ),
            vertex(
                "P4'",
                PsychoidCymaticGeometryRole::InterleavedBaseVertex,
                std::f32::consts::FRAC_1_SQRT_2,
                0.34,
                0.34,
            ),
            vertex(
                "P0",
                PsychoidCymaticGeometryRole::CentralAxisPoint,
                0.0,
                0.0,
                0.08,
            ),
            vertex(
                "P0'",
                PsychoidCymaticGeometryRole::CentralAxisPoint,
                0.0,
                0.0,
                -0.08,
            ),
        ],
    }
}

fn vertex(
    id: &'static str,
    role: PsychoidCymaticGeometryRole,
    x: f32,
    y: f32,
    z: f32,
) -> PsychoidCymaticGeometryVertex {
    PsychoidCymaticGeometryVertex { id, role, x, y, z }
}

fn geometry_handle() -> String {
    let mut hasher = blake3::Hasher::new();
    hasher.update(PSYCHOID_CYMATIC_GEOMETRY_LAW.as_bytes());
    for vertex in dr_ig_6_geometry().vertices {
        hasher.update(vertex.id.as_bytes());
        hasher.update(&[vertex.role as u8]);
        hasher.update(&vertex.x.to_bits().to_le_bytes());
        hasher.update(&vertex.y.to_bits().to_le_bytes());
        hasher.update(&vertex.z.to_bits().to_le_bytes());
    }
    format!(
        "psychoid-cymatic://geometry/dr-ig-6/{}",
        hasher.finalize().to_hex()
    )
}

fn digest_audio_octet(audio_octet: &[f32; 8]) -> String {
    let mut hasher = blake3::Hasher::new();
    hasher.update(b"audio-octet:v1");
    for component in audio_octet {
        hasher.update(&component.to_bits().to_le_bytes());
    }
    hasher.finalize().to_hex().to_string()
}

fn digest_nodal_quartet(nodal_quartet: &[MathemeNodalConstraint; 4]) -> String {
    let mut hasher = blake3::Hasher::new();
    hasher.update(b"nodal-quartet:v1");
    for constraint in nodal_quartet {
        hasher.update(&[constraint.ql_position, constraint.m, constraint.n]);
        hasher.update(constraint.helix.as_bytes());
        hasher.update(&[0]);
    }
    hasher.finalize().to_hex().to_string()
}

fn renderer_digest(
    tick: u64,
    tick12: u8,
    solver_strategy: PsychoidCymaticSolverStrategy,
    audio_bus_digest: &str,
    nodal_digest: &str,
    geometry_handle: &str,
) -> String {
    let mut hasher = blake3::Hasher::new();
    hasher.update(PSYCHOID_CYMATIC_CONTRACT_VERSION.as_bytes());
    hasher.update(&tick.to_le_bytes());
    hasher.update(&[tick12]);
    hasher.update(solver_strategy.slug().as_bytes());
    hasher.update(audio_bus_digest.as_bytes());
    hasher.update(nodal_digest.as_bytes());
    hasher.update(geometry_handle.as_bytes());
    hasher.finalize().to_hex().to_string()
}
