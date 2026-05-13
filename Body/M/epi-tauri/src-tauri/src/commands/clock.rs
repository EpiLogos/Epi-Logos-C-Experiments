use serde::Deserialize;
use tauri::State;

use crate::error::AppError;
use crate::state::AppState;
use portal_core::{KairosState, PortalClockState, WalkMode};

#[tauri::command]
pub async fn clock_get_state(state: State<'_, AppState>) -> Result<PortalClockState, AppError> {
    Ok(state.clock.lock().await.clone())
}

#[derive(Deserialize)]
pub struct OracleCastInput {
    pub pp: f32,
    pub nn: f32,
    pub np: f32,
    pub pn: f32,
    pub degree: u16,
    pub primary_hex: u8,
    pub temporal_hex: u8,
    pub changing_lines_mask: u8,
    pub timestamp: u64,
}

#[tauri::command]
pub async fn clock_oracle_cast(
    input: OracleCastInput,
    state: State<'_, AppState>,
) -> Result<PortalClockState, AppError> {
    let mut clock = state.clock.lock().await;
    portal_core::update_from_cast(
        &mut clock,
        input.pp,
        input.nn,
        input.np,
        input.pn,
        input.degree,
        input.primary_hex,
        input.temporal_hex,
        input.changing_lines_mask,
        input.timestamp,
    );
    Ok(clock.clone())
}

#[tauri::command]
pub async fn clock_update_kairos(
    kairos: KairosState,
    state: State<'_, AppState>,
) -> Result<PortalClockState, AppError> {
    let mut clock = state.clock.lock().await;
    portal_core::update_kairos_full(&mut clock, kairos);
    Ok(clock.clone())
}

#[tauri::command]
pub async fn clock_update_quintessence(
    profiles: [[f32; 4]; 5],
    state: State<'_, AppState>,
) -> Result<PortalClockState, AppError> {
    let mut clock = state.clock.lock().await;
    portal_core::update_quintessence_quaternion(&mut clock, &profiles);
    Ok(clock.clone())
}

#[tauri::command]
pub async fn clock_get_walk_mode(
    state: State<'_, AppState>,
) -> Result<WalkMode, AppError> {
    let clock = state.clock.lock().await;
    Ok(portal_core::derive_walk_mode(clock.quintessence_quaternion))
}

#[tauri::command]
pub async fn clock_get_bifurcation(state: State<'_, AppState>) -> Result<(f32, u8), AppError> {
    let clock = state.clock.lock().await;
    Ok(portal_core::derive_bifurcation(clock.quintessence_quaternion))
}
