use serde::{Deserialize, Serialize};
use tauri::State;

use crate::error::AppError;
use crate::state::AppState;

pub type MefLensId = u8;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct MefLens {
    pub id: MefLensId,
    pub name: String,
    pub description: String,
    pub color: String,
}

const CANONICAL_LENSES: &[(u8, &str, &str, &str)] = &[
    (0, "Literal", "Direct surface-level reading", "#94a3b8"),
    (1, "Functional", "Operational and behavioral analysis", "#a78bfa"),
    (2, "Structural", "Pattern and relationship mapping", "#f472b6"),
    (3, "Archetypal", "Universal symbolic resonance", "#fb923c"),
    (4, "Paradigmatic", "Framework and worldview analysis", "#4ade80"),
    (5, "Integral", "Holistic synthesis across all lenses", "#38bdf8"),
];

#[tauri::command]
pub async fn mef_list_lenses() -> Result<Vec<MefLens>, AppError> {
    Ok(CANONICAL_LENSES
        .iter()
        .map(|(id, name, desc, color)| MefLens {
            id: *id,
            name: name.to_string(),
            description: desc.to_string(),
            color: color.to_string(),
        })
        .collect())
}

#[tauri::command]
pub async fn mef_get_active_lens(
    _state: State<'_, AppState>,
) -> Result<MefLens, AppError> {
    let lens = CANONICAL_LENSES[0];
    Ok(MefLens {
        id: lens.0,
        name: lens.1.to_string(),
        description: lens.2.to_string(),
        color: lens.3.to_string(),
    })
}

#[tauri::command]
pub async fn mef_lens_commentary(
    coordinate: String,
    lens: MefLensId,
) -> Result<serde_json::Value, AppError> {
    Ok(serde_json::json!({
        "coordinate": coordinate,
        "lens": lens,
        "commentary": format!("MEF lens {} commentary for {} — not yet generated", lens, coordinate),
        "status": "stub"
    }))
}
