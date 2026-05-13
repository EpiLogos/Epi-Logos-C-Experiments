use crate::error::AppError;

#[tauri::command]
pub async fn nara_oracle_cast(
    kind: String,
    _context: Option<serde_json::Value>,
) -> Result<serde_json::Value, AppError> {
    Ok(serde_json::json!({
        "kind": kind,
        "status": "stub",
        "cast": null,
        "message": format!("{} oracle cast — not yet wired to engine", kind)
    }))
}
