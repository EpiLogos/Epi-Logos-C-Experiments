// Coordinate: M0' #0-4 :: 16-fold Void-Structure ring projection
// Residency: S0 kernel public-current profile projection
// Position (#n): Holographic Matrix lens carrier
// Actualises: CLOCK_LENSES_16 as an exact M0 profile payload.
// Public surface: M0VoidLensState, M0VoidLensProjection,
//   m0_void_structure_ring.
// Does NOT own: a second lens table, SVG geometry, branch selection, or
//   renderer-local labels/provenance.
// Contract: [[M0'-SPEC]] + rerun [[21-m0-anuttara-frontend-deep]] 21.15.

use serde::{Deserialize, Serialize};

use super::phase_space::CLOCK_LENSES_16;

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum M0VoidLensState {
    Canonical,
    CanonicalAbsent,
    Blocked,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct M0VoidLensProjection {
    pub lens_index: u8,
    pub coordinate: String,
    pub label: String,
    pub state: M0VoidLensState,
}

pub fn m0_void_structure_ring() -> [M0VoidLensProjection; 16] {
    std::array::from_fn(|index| M0VoidLensProjection {
        lens_index: index as u8,
        coordinate: format!("#0-4-{index}"),
        label: CLOCK_LENSES_16[index].name.to_owned(),
        state: M0VoidLensState::Canonical,
    })
}
