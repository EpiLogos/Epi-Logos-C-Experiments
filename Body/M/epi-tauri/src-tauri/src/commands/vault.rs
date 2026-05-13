use tauri::State;

use crate::error::AppError;
use crate::state::AppState;
use crate::vault::{backlinks, daily, flow, frontmatter, tree};

#[tauri::command]
pub async fn vault_get_today_note(
    state: State<'_, AppState>,
) -> Result<Option<daily::DailyNote>, AppError> {
    let vault = state.vault.clone();
    let today = daily::today_string();
    daily::create_daily_note_if_absent(&vault, &today)?;
    daily::get_daily_note(&vault, &today)
}

#[tauri::command]
pub async fn vault_get_daily_note(
    date: String,
    state: State<'_, AppState>,
) -> Result<Option<daily::DailyNote>, AppError> {
    daily::get_daily_note(&state.vault, &date)
}

#[tauri::command]
pub async fn vault_list_entries(
    state: State<'_, AppState>,
) -> Result<Vec<tree::EntryMetadata>, AppError> {
    tree::list_entries(&state.vault)
}

#[tauri::command]
pub async fn vault_get_entry(
    entry_path: String,
    state: State<'_, AppState>,
) -> Result<Option<String>, AppError> {
    tree::get_file_content(&state.vault, &entry_path)
}

#[tauri::command]
pub async fn vault_save_flow_entry(
    date: String,
    content: String,
    metadata: flow::FlowMetadata,
    state: State<'_, AppState>,
) -> Result<(), AppError> {
    flow::save_flow_entry(&state.vault, &date, &content, &metadata)
}

#[tauri::command]
pub async fn vault_get_flow_entry(
    date: String,
    state: State<'_, AppState>,
) -> Result<Option<flow::FlowEntry>, AppError> {
    flow::get_flow_entry(&state.vault, &date)
}

#[tauri::command]
pub async fn vault_list_flow_versions(
    date: String,
    state: State<'_, AppState>,
) -> Result<Vec<u32>, AppError> {
    flow::list_flow_versions(&state.vault, &date)
}

#[tauri::command]
pub async fn vault_get_flow_version(
    date: String,
    version: u32,
    state: State<'_, AppState>,
) -> Result<Option<flow::FlowEntry>, AppError> {
    flow::get_flow_version(&state.vault, &date, version)
}

#[tauri::command]
pub async fn vault_get_file_tree(
    state: State<'_, AppState>,
) -> Result<Vec<tree::FileTreeNode>, AppError> {
    tree::get_file_tree(&state.vault, 5)
}

#[tauri::command]
pub async fn vault_get_file_content(
    path: String,
    state: State<'_, AppState>,
) -> Result<Option<String>, AppError> {
    tree::get_file_content(&state.vault, &path)
}

#[tauri::command]
pub async fn vault_get_backlinks(
    path: String,
    state: State<'_, AppState>,
) -> Result<backlinks::BacklinksData, AppError> {
    backlinks::get_backlinks(&state.vault, &path)
}

#[tauri::command]
pub async fn vault_resolve_wikilink(
    link_text: String,
    state: State<'_, AppState>,
) -> Result<Option<String>, AppError> {
    backlinks::resolve_wikilink(&state.vault, &link_text)
}

#[tauri::command]
pub async fn vault_validate_frontmatter(
    content: String,
) -> Result<(), AppError> {
    let (fm, _) = frontmatter::parse_frontmatter(&content)?;
    match fm {
        Some(fm) => frontmatter::validate_frontmatter(&fm),
        None => Err(AppError::Vault("no frontmatter found".into())),
    }
}
