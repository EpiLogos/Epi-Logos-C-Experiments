//! M' Tauri command: harmonic profile response with VAK address.
//!
//! E4 introduces a Tauri-friendly wrapper around the kernel-side
//! [`MathemeHarmonicProfile`]. The wrapper exposes the optional
//! [`VakAddress`] field added in E3 (commit 23d700e) to the JS frontend
//! via a stable wire shape. When VAK is absent the field is omitted from
//! the JSON payload via `skip_serializing_if`, keeping the wire compact.
//!
//! The wrapper exists so the frontend has a single, narrow Tauri command
//! that mirrors `MathemeHarmonicProfile::with_vak` semantics without
//! coupling the UI to the much larger kernel struct directly.

use serde::{Deserialize, Serialize};
use tauri::State;

use crate::error::AppError;
use crate::state::AppState;
use portal_core::{kernel_tick_from_epogdoon, MathemeHarmonicProfile, VakAddress};

/// Wire-level response for the harmonic profile command.
///
/// `tick` mirrors `MathemeHarmonicProfile::tick`; `vak_address` carries
/// the optional VAK coordinate-state correlate. The full
/// `MathemeHarmonicProfile` is preserved under `profile` so the frontend
/// can still consume harmonic projections — the wrapper only adds VAK
/// surfacing, it does not hide existing data.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct HarmonicProfileResponse {
    pub tick: u64,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub profile: Option<MathemeHarmonicProfile>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub vak_address: Option<VakAddress>,
}

impl HarmonicProfileResponse {
    /// Construct a response from a tick and an optional VAK address.
    ///
    /// Used by unit tests and call sites that have already resolved a
    /// VAK address out-of-band. The `profile` field is left empty here;
    /// see [`Self::from_profile`] for the full-projection constructor.
    pub fn compose(tick: u64, vak: Option<VakAddress>) -> Self {
        Self {
            tick,
            profile: None,
            vak_address: vak,
        }
    }

    /// Construct a response from a full `MathemeHarmonicProfile`,
    /// lifting `profile.tick` and `profile.vak_address` into the
    /// top-level wire fields while still including the full profile.
    pub fn from_profile(profile: MathemeHarmonicProfile) -> Self {
        Self {
            tick: profile.tick,
            vak_address: profile.vak_address.clone(),
            profile: Some(profile),
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct HarmonicProfileInput {
    pub cycle: u64,
    pub sub_tick: u8,
}

/// Tauri command: derive a `HarmonicProfileResponse` from an epogdoon
/// (cycle, sub_tick) pair. VAK address defaults to `None` here — kernel
/// reasoners attach VAK via `MathemeHarmonicProfile::with_vak` when
/// publishing a coordinate-state correlate.
#[tauri::command]
pub async fn harmonic_profile_for_tick(
    input: HarmonicProfileInput,
    _state: State<'_, AppState>,
) -> Result<HarmonicProfileResponse, AppError> {
    let tick = kernel_tick_from_epogdoon(input.cycle, input.sub_tick);
    let profile = MathemeHarmonicProfile::from_tick(tick);
    Ok(HarmonicProfileResponse::from_profile(profile))
}
