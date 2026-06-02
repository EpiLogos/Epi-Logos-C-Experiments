use tauri::State;

use crate::agents::{AgentDescriptor, AgentRunHandle, InvocationEnvelope};
use crate::error::AppError;
use crate::state::AppState;

#[tauri::command]
pub async fn agent_list(state: State<'_, AppState>) -> Result<Vec<AgentDescriptor>, AppError> {
    Ok(state.agents.list())
}

#[tauri::command]
pub async fn agent_invoke(
    envelope: InvocationEnvelope,
    state: State<'_, AppState>,
) -> Result<AgentRunHandle, AppError> {
    Ok(state.agents.invoke(envelope))
}

#[tauri::command]
pub async fn agent_run_state(
    run_id: String,
    state: State<'_, AppState>,
) -> Result<Option<AgentRunHandle>, AppError> {
    Ok(state.agents.run_state(&run_id))
}

#[tauri::command]
pub async fn agent_abort(
    run_id: String,
    state: State<'_, AppState>,
) -> Result<bool, AppError> {
    Ok(state.agents.abort(&run_id))
}
