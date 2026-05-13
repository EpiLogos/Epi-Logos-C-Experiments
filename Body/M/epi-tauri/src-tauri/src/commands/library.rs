use tauri::State;

use crate::error::AppError;
use crate::library::types::*;
use crate::state::AppState;

#[tauri::command]
pub async fn library_ecology_view(
    _state: State<'_, AppState>,
) -> Result<serde_json::Value, AppError> {
    Ok(serde_json::json!({
        "namespaces": ["bimba", "gnostic", "atelier"],
        "total_entries": 0,
        "status": "initialized"
    }))
}

#[tauri::command]
pub async fn library_search(
    _query: LibrarySearchQuery,
    _state: State<'_, AppState>,
) -> Result<Vec<LibrarySearchResult>, AppError> {
    Ok(vec![])
}
