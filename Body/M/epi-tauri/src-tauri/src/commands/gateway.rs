use tauri::State;

use crate::error::AppError;
use crate::state::AppState;

#[tauri::command]
pub async fn gateway_connect(state: State<'_, AppState>) -> Result<String, AppError> {
    let settings = state.settings.read().await;
    let conn = crate::gateway::GatewayConnection::connect(
        &settings.gateway_url,
        settings.gateway_token.as_deref(),
        settings.gateway_password.as_deref(),
    )
    .await?;
    let session_key = conn.session_key.clone();
    *state.gateway.write().await = Some(conn);
    Ok(session_key)
}

#[tauri::command]
pub async fn gateway_disconnect(state: State<'_, AppState>) -> Result<(), AppError> {
    *state.gateway.write().await = None;
    Ok(())
}

#[tauri::command]
pub async fn gateway_rpc(
    method: String,
    params: serde_json::Value,
    state: State<'_, AppState>,
) -> Result<(), AppError> {
    let guard = state.gateway.read().await;
    let conn = guard
        .as_ref()
        .ok_or_else(|| AppError::Gateway("not connected".into()))?;
    conn.rpc(&method, params).await
}

#[tauri::command]
pub async fn gateway_send_raw(
    msg: String,
    state: State<'_, AppState>,
) -> Result<(), AppError> {
    let guard = state.gateway.read().await;
    let conn = guard
        .as_ref()
        .ok_or_else(|| AppError::Gateway("not connected".into()))?;
    conn.send_raw(&msg).await
}

#[tauri::command]
pub async fn gateway_is_connected(state: State<'_, AppState>) -> Result<bool, AppError> {
    Ok(state.gateway.read().await.is_some())
}
