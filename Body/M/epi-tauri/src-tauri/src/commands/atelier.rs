use crate::atelier::types::*;
use crate::error::AppError;

#[tauri::command]
pub async fn atelier_session_start(
    user_id_hash: String,
) -> Result<AtelierSession, AppError> {
    Ok(AtelierSession {
        session_id: format!("ses-{}", user_id_hash.chars().take(8).collect::<String>()),
        user_id_hash,
        started_at: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs(),
        words_explored: vec![],
        constellations_formed: vec![],
        aphorisms_crystallised: vec![],
    })
}

#[tauri::command]
pub async fn atelier_add_word(
    _session_id: String,
    word: String,
) -> Result<AtelierWord, AppError> {
    Ok(AtelierWord {
        id: format!("w-{}", word.to_lowercase().replace(' ', "-")),
        word,
        pie_root: None,
        definition: None,
        register: None,
        confidence: None,
        cited_source: None,
    })
}

#[tauri::command]
pub async fn atelier_dialogue_turn(
    session_id: String,
    _user_message: String,
    _ql_hint: Option<u8>,
) -> Result<crate::agents::AgentRunHandle, AppError> {
    Ok(crate::agents::AgentRunHandle {
        run_id: format!("atelier-turn-{}", session_id),
        status: "pending".to_string(),
    })
}

#[tauri::command]
pub async fn atelier_set_register(
    _session_id: String,
    _word_a: String,
    _word_b: String,
    _register: WordRegister,
    _confidence: Confidence,
    _cited_source: Option<String>,
) -> Result<(), AppError> {
    Ok(())
}

#[tauri::command]
pub async fn atelier_set_ql_position(
    _session_id: String,
    _word: String,
    _ql_position: u8,
    _essence: String,
) -> Result<(), AppError> {
    Ok(())
}

#[tauri::command]
pub async fn atelier_crystallize(
    _session_id: String,
    constellation_name: String,
    _aphorism_text: String,
    _aphorism_type: String,
) -> Result<serde_json::Value, AppError> {
    Ok(serde_json::json!({
        "constellation_id": format!("con-{}", constellation_name.to_lowercase().replace(' ', "-")),
        "aphorism_id": "pending",
        "status": "crystallizing"
    }))
}

#[tauri::command]
pub async fn atelier_list_words() -> Result<Vec<AtelierWord>, AppError> {
    Ok(vec![])
}

#[tauri::command]
pub async fn atelier_list_constellations() -> Result<Vec<AtelierConstellation>, AppError> {
    Ok(vec![])
}
