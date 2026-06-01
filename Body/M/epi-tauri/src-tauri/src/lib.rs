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
        // Track 05 T2 — `pratibimba://` custom URI scheme serves the Theia
        // browser-mode IDE bundle from Idea/Pratibimba/System/theia-app/lib/frontend/
        // directly to a second WebviewWindow. No external server; ADR-05-001
        // browser-mode-in-Wry path.
        .register_uri_scheme_protocol("pratibimba", pratibimba_protocol_handler)
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
            commands::pratibimba::pratibimba_summon_ide,
            commands::pratibimba::pratibimba_dismiss_ide,
            commands::pratibimba::pratibimba_ide_status,
        ])
        .run(tauri::generate_context!())
        .expect("error while running epi-tauri");
}

/// Track 05 T2 protocol handler — serves `Idea/Pratibimba/System/theia-app/lib/frontend/`
/// as the `pratibimba://` origin so Theia browser-mode loads in Wry.
///
/// Resolution order:
///   1. Env override `EPI_PRATIBIMBA_FRONTEND_DIR` (used by tests and dev).
///   2. Workspace-relative `Idea/Pratibimba/System/theia-app/lib/frontend/`
///      computed from `CARGO_MANIFEST_DIR` at compile time.
///
/// Any path traversal (`..` components) is rejected with HTTP 403.
fn pratibimba_protocol_handler(
    _ctx: tauri::UriSchemeContext<'_, tauri::Wry>,
    request: tauri::http::Request<Vec<u8>>,
) -> tauri::http::Response<Vec<u8>> {
    use std::path::PathBuf;

    let frontend_dir = std::env::var("EPI_PRATIBIMBA_FRONTEND_DIR")
        .map(PathBuf::from)
        .unwrap_or_else(|_| {
            PathBuf::from(env!("CARGO_MANIFEST_DIR"))
                .join("../../../Idea/Pratibimba/System/theia-app/lib/frontend")
        });

    // request.uri() looks like `pratibimba://localhost/index.html` — strip the
    // scheme+authority to get the path. Default to index.html for `/`.
    let uri = request.uri();
    let raw_path = uri.path();
    let stripped = raw_path.trim_start_matches('/');
    let rel = if stripped.is_empty() {
        "index.html"
    } else {
        stripped
    };

    if rel.contains("..") {
        return tauri::http::Response::builder()
            .status(403)
            .body(b"forbidden: path traversal".to_vec())
            .unwrap_or_default();
    }

    let path = frontend_dir.join(rel);
    match std::fs::read(&path) {
        Ok(bytes) => {
            let mime = match path.extension().and_then(|e| e.to_str()) {
                Some("html") => "text/html; charset=utf-8",
                Some("js") => "application/javascript; charset=utf-8",
                Some("mjs") => "application/javascript; charset=utf-8",
                Some("css") => "text/css; charset=utf-8",
                Some("json") => "application/json; charset=utf-8",
                Some("svg") => "image/svg+xml",
                Some("png") => "image/png",
                Some("jpg") | Some("jpeg") => "image/jpeg",
                Some("woff") => "font/woff",
                Some("woff2") => "font/woff2",
                Some("ttf") => "font/ttf",
                Some("eot") => "application/vnd.ms-fontobject",
                Some("map") => "application/json",
                _ => "application/octet-stream",
            };
            tauri::http::Response::builder()
                .status(200)
                .header("Content-Type", mime)
                .header("Cache-Control", "no-store")
                .body(bytes)
                .unwrap_or_default()
        }
        Err(_) => tauri::http::Response::builder()
            .status(404)
            .body(format!("not found: {}", rel).into_bytes())
            .unwrap_or_default(),
    }
}
