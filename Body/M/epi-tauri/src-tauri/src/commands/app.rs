use tauri::State;

use crate::error::AppError;
use crate::state::{AppState, Settings};

#[tauri::command]
pub async fn app_version() -> Result<String, AppError> {
    Ok(env!("CARGO_PKG_VERSION").to_string())
}

#[tauri::command]
pub async fn app_platform() -> Result<String, AppError> {
    Ok(std::env::consts::OS.to_string())
}

#[tauri::command]
pub async fn app_get_settings(state: State<'_, AppState>) -> Result<Settings, AppError> {
    let settings = state.settings.read().await;
    Ok(settings.clone())
}

#[tauri::command]
pub async fn app_update_settings(
    settings: Settings,
    state: State<'_, AppState>,
) -> Result<(), AppError> {
    let mut current = state.settings.write().await;
    *current = settings;
    Ok(())
}
