//! Coordinate: S0/M2-5' (solar-chakral cymatic projection)
//! Residency: Body/S/S0/portal-core/src/kernel/projections
//! Position (#n): M2-5' typed profile projection.
//! Actualises: the eight canonical M2 chakra identities, Earth observer-centre,
//!   Sun anchor, active planetary-hour ruler, and profile-resolved spherical modes.
//! Public surface: CymaticSpheresProjection, cymatic_spheres_from_routing.
//! Does NOT own: Kerykeion ingress, profile generation, Three.js geometry, or
//!   browser-side planet/chakra correspondence.
//! Contract: [[M2'-SPEC]] §9.5; [[M2-ARCHITECTURE]] §5.3.2; [[DR-M2-1]].

use serde::{Deserialize, Serialize};

use crate::kernel::{LivePlanetProjection, MathemeNodalConstraint};

const CHAKRA_NAMES: [&str; 8] = [
    "Earth/Ground",
    "Muladhara",
    "Svadhisthana",
    "Manipura",
    "Anahata",
    "Vishuddha",
    "Ajna",
    "Sahasrara",
];

// Exact M2_CHAKRA_LUT[8] mirror. 0xff is represented as None on the wire.
const CHAKRA_ELEMENT_IDS: [Option<u8>; 8] = [
    None,
    Some(4),
    Some(3),
    Some(2),
    Some(1),
    Some(0),
    None,
    None,
];
const CHAKRA_TATTVA_INDICES: [Option<u8>; 8] = [
    None,
    Some(35),
    Some(34),
    Some(33),
    Some(32),
    Some(31),
    None,
    None,
];
const PLANET_NAMES: [&str; 10] = [
    "Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
];

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SphericalHarmonicProjection {
    pub degree: u8,
    pub order: u8,
    pub amplitude_hz: f32,
    pub ql_position: u8,
    pub helix: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CymaticChakraProjection {
    pub chakra_id: u8,
    pub name: String,
    pub element_id: Option<u8>,
    pub tattva_index: Option<u8>,
    pub meaning_id: u16,
    pub harmonic: SphericalHarmonicProjection,
    pub provenance: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EarthObserverCentreProjection {
    pub ordinal: u8,
    pub name: String,
    pub role: String,
    pub position: [f32; 3],
    pub provenance: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CymaticPlanetAnchorProjection {
    pub planet_id: u8,
    pub name: String,
    pub degree: f32,
    pub retrograde: bool,
    pub element_id: u8,
    pub provenance: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CymaticSpheresProjection {
    pub chakras: Vec<CymaticChakraProjection>,
    pub earth_observer: EarthObserverCentreProjection,
    pub sun: CymaticPlanetAnchorProjection,
    pub active_planet: CymaticPlanetAnchorProjection,
    pub epogdoon_ratio: String,
    pub provenance: String,
}

fn planet_anchor(planet: LivePlanetProjection) -> Option<CymaticPlanetAnchorProjection> {
    let name = *PLANET_NAMES.get(planet.planet_id as usize)?;
    planet
        .degree
        .is_finite()
        .then_some(CymaticPlanetAnchorProjection {
            planet_id: planet.planet_id,
            name: name.to_owned(),
            degree: planet.degree,
            retrograde: planet.retrograde,
            element_id: planet.element_id,
            provenance: "M2_PLANET_LUT[10] + Kerykeion live sky".to_owned(),
        })
}

pub fn cymatic_spheres_from_routing(
    live_planets: &[LivePlanetProjection; 10],
    active_planet_id: u8,
    audio_octet: &[f32; 8],
    nodal_quartet: &[MathemeNodalConstraint; 4],
) -> Option<CymaticSpheresProjection> {
    if audio_octet
        .iter()
        .any(|amplitude| !amplitude.is_finite() || *amplitude <= 0.0)
    {
        return None;
    }
    let sun = planet_anchor(live_planets[0])?;
    let active_planet = planet_anchor(*live_planets.get(active_planet_id as usize)?)?;
    let chakras = (0..8)
        .map(|index| {
            let nodal = &nodal_quartet[index % nodal_quartet.len()];
            CymaticChakraProjection {
                chakra_id: index as u8,
                name: CHAKRA_NAMES[index].to_owned(),
                element_id: CHAKRA_ELEMENT_IDS[index],
                tattva_index: CHAKRA_TATTVA_INDICES[index],
                meaning_id: 0x0380 + index as u16,
                harmonic: SphericalHarmonicProjection {
                    degree: nodal.m.max(nodal.n),
                    order: nodal.m.min(nodal.n),
                    amplitude_hz: audio_octet[index],
                    ql_position: nodal.ql_position,
                    helix: if nodal.helix == "pratibimba" {
                        "pratibimba".to_owned()
                    } else {
                        "bimba".to_owned()
                    },
                },
                provenance: "M2_CHAKRA_LUT[8] + profile audioOctet/nodalQuartet".to_owned(),
            }
        })
        .collect();

    Some(CymaticSpheresProjection {
        chakras,
        earth_observer: EarthObserverCentreProjection {
            ordinal: 10,
            name: "Earth".to_owned(),
            role: "observer-centre".to_owned(),
            position: [0.0, 0.0, 0.0],
            provenance: "EarthBodyState + DR-M2-1/DCC-03".to_owned(),
        },
        sun,
        active_planet,
        epogdoon_ratio: "9:8".to_owned(),
        provenance: "portal-core::f_routing + M2 substrate projection".to_owned(),
    })
}
