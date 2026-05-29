pub mod commands;
pub mod error;
pub mod events;
pub mod state;

pub mod agents;
pub mod atelier;
pub mod clock;
pub mod gateway;
pub mod graph;
pub mod library;
pub mod oracle;
pub mod temporal;
pub mod vault;

use state::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app_state = AppState::new();

    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "epi_tauri=info".into()),
        )
        .init();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            commands::app::app_version,
            commands::app::app_platform,
            commands::app::app_get_settings,
            commands::app::app_update_settings,
            commands::vault::vault_get_today_note,
            commands::vault::vault_get_daily_note,
            commands::vault::vault_list_entries,
            commands::vault::vault_get_entry,
            commands::vault::vault_save_flow_entry,
            commands::vault::vault_get_flow_entry,
            commands::vault::vault_list_flow_versions,
            commands::vault::vault_get_flow_version,
            commands::vault::vault_get_file_tree,
            commands::vault::vault_get_file_content,
            commands::vault::vault_get_backlinks,
            commands::vault::vault_resolve_wikilink,
            commands::vault::vault_validate_frontmatter,
            commands::graph::graph_connect,
            commands::graph::graph_disconnect,
            commands::graph::graph_get_full,
            commands::graph::graph_get_node,
            commands::graph::graph_get_by_coordinate,
            commands::graph::graph_walk,
            commands::graph::graph_query_raw,
            commands::graph::graph_hexagonal_position,
            commands::graph::graph_batch_positions,
            commands::graph::graph_geometry_for,
            commands::graph::graph_set_geometry_override,
            commands::gateway::gateway_connect,
            commands::gateway::gateway_disconnect,
            commands::gateway::gateway_rpc,
            commands::gateway::gateway_send_raw,
            commands::gateway::gateway_is_connected,
            commands::harmonic_profile::harmonic_profile_for_tick,
            commands::clock::clock_get_state,
            commands::clock::clock_oracle_cast,
            commands::clock::clock_update_kairos,
            commands::clock::clock_update_quintessence,
            commands::clock::clock_get_walk_mode,
            commands::clock::clock_get_bifurcation,
            commands::temporal::temporal_get_runtime,
            commands::temporal::temporal_set_day_id,
            commands::temporal::temporal_set_now_path,
            commands::agents::agent_list,
            commands::agents::agent_invoke,
            commands::agents::agent_run_state,
            commands::agents::agent_abort,
            commands::atelier::atelier_session_start,
            commands::atelier::atelier_add_word,
            commands::atelier::atelier_dialogue_turn,
            commands::atelier::atelier_set_register,
            commands::atelier::atelier_set_ql_position,
            commands::atelier::atelier_crystallize,
            commands::atelier::atelier_list_words,
            commands::atelier::atelier_list_constellations,
            commands::library::library_ecology_view,
            commands::library::library_search,
            commands::mef::mef_list_lenses,
            commands::mef::mef_get_active_lens,
            commands::mef::mef_lens_commentary,
            commands::nara::nara_oracle_cast,
        ])
        .run(tauri::generate_context!())
        .expect("error while running epi-tauri");
}
