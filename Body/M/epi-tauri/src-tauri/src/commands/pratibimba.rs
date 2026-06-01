//! Track 05 T2 — Pratibimba IDE summon/dismiss commands.
//!
//! Implements the multi-webview composition (ADR-05-002 recommended default):
//! `/body` lives in the primary webview; the `/pratibimba/system` Theia IDE
//! lives in a second WebviewWindow opened on demand via
//! `pratibimba_summon_ide` and closed via `pratibimba_dismiss_ide`.
//!
//! The IDE bundle is served by the `pratibimba://` custom URI scheme protocol
//! registered in `lib.rs`. The protocol reads files directly from
//! `Idea/Pratibimba/System/theia-app/lib/frontend/` so the browser-mode
//! Theia bundle loads in Tauri's Wry/WebKit webview without an external
//! server — closes ADR-05-001 for the browser-mode-in-webview path.

use serde::Serialize;
use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};

use crate::error::AppError;

pub const PRATIBIMBA_IDE_WINDOW: &str = "pratibimba-ide";

/// Read-only snapshot returned to the renderer describing IDE window state.
#[derive(Clone, Debug, Serialize)]
pub struct PratibimbaIdeStatus {
    pub window_open: bool,
    pub window_label: &'static str,
    pub uri: String,
    pub bridge_shared_with_body: bool,
}

#[tauri::command]
pub async fn pratibimba_summon_ide(app: AppHandle) -> Result<PratibimbaIdeStatus, AppError> {
    if let Some(existing) = app.get_webview_window(PRATIBIMBA_IDE_WINDOW) {
        existing
            .show()
            .map_err(|e| AppError::Io(format!("show pratibimba IDE window: {e}")))?;
        existing
            .set_focus()
            .map_err(|e| AppError::Io(format!("focus pratibimba IDE window: {e}")))?;
        return Ok(PratibimbaIdeStatus {
            window_open: true,
            window_label: PRATIBIMBA_IDE_WINDOW,
            uri: existing.url().map(|u| u.to_string()).unwrap_or_default(),
            bridge_shared_with_body: true,
        });
    }

    // Pratibimba bundle is served by the custom protocol registered in lib.rs.
    let url = WebviewUrl::CustomProtocol(
        "pratibimba://localhost/index.html"
            .parse()
            .map_err(|e| AppError::Io(format!("parse pratibimba URL: {e}")))?,
    );

    let window = WebviewWindowBuilder::new(&app, PRATIBIMBA_IDE_WINDOW, url)
        .title("Pratibimba System (M5-3 IDE)")
        .inner_size(1600.0, 1000.0)
        .min_inner_size(1280.0, 800.0)
        .resizable(true)
        .decorations(true)
        .visible(true)
        .focused(true)
        .build()
        .map_err(|e| AppError::Io(format!("build pratibimba IDE window: {e}")))?;

    Ok(PratibimbaIdeStatus {
        window_open: true,
        window_label: PRATIBIMBA_IDE_WINDOW,
        uri: window.url().map(|u| u.to_string()).unwrap_or_default(),
        bridge_shared_with_body: true,
    })
}

#[tauri::command]
pub async fn pratibimba_dismiss_ide(app: AppHandle) -> Result<PratibimbaIdeStatus, AppError> {
    if let Some(window) = app.get_webview_window(PRATIBIMBA_IDE_WINDOW) {
        window
            .close()
            .map_err(|e| AppError::Io(format!("close pratibimba IDE window: {e}")))?;
    }
    Ok(PratibimbaIdeStatus {
        window_open: false,
        window_label: PRATIBIMBA_IDE_WINDOW,
        uri: String::new(),
        bridge_shared_with_body: true,
    })
}

#[tauri::command]
pub async fn pratibimba_ide_status(app: AppHandle) -> Result<PratibimbaIdeStatus, AppError> {
    let window = app.get_webview_window(PRATIBIMBA_IDE_WINDOW);
    let is_open = window
        .as_ref()
        .and_then(|w| w.is_visible().ok())
        .unwrap_or(false);
    let uri = window
        .and_then(|w| w.url().ok())
        .map(|u| u.to_string())
        .unwrap_or_default();
    Ok(PratibimbaIdeStatus {
        window_open: is_open,
        window_label: PRATIBIMBA_IDE_WINDOW,
        uri,
        bridge_shared_with_body: true,
    })
}
