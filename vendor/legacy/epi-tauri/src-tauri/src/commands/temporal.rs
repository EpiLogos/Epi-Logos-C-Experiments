use tauri::State;

use crate::error::AppError;
use crate::state::AppState;
use crate::temporal::PortalRuntimeState;

#[tauri::command]
pub async fn temporal_get_runtime(
    state: State<'_, AppState>,
) -> Result<PortalRuntimeState, AppError> {
    Ok(state.runtime.read().await.clone())
}

#[tauri::command]
pub async fn temporal_set_day_id(
    day_id: String,
    state: State<'_, AppState>,
) -> Result<(), AppError> {
    state.runtime.write().await.day_id = day_id;
    Ok(())
}

#[tauri::command]
pub async fn temporal_set_now_path(
    now_path: String,
    state: State<'_, AppState>,
) -> Result<(), AppError> {
    state.runtime.write().await.now_path = now_path;
    Ok(())
}
