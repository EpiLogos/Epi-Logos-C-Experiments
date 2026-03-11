//! Nara Identity Matrix — safe Rust wrapper + profile.json I/O
//!
//! NaraIdentityMatrix is the safe (non-FFI) representation of the user's
//! personal identity layers. Stored as profile.json in ~/.epi-logos/nara/.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use zeroize::Zeroize;

// ─── Safe Layer Types (Serialize/Deserialize, NOT repr(C)) ──────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Zeroize)]
#[zeroize(drop)]
pub struct NumerologicalLayer {
    pub numerological_key: u32,
    pub sixfold_difference: u8,
    pub sixfold_sum: u8,
    pub life_path: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize, Zeroize)]
#[zeroize(drop)]
pub struct AstrologicalLayer {
    pub sun_degree_anchor: u16,
    pub moon_degree_anchor: u16,
    pub asc_degree_anchor: u16,
    pub mc_degree_anchor: u16,
    pub planet_degrees: [u16; 10],
    pub dominant_sign: u8,
    pub dominant_element: u8,
    pub dominant_modality: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize, Zeroize)]
#[zeroize(drop)]
pub struct JungianLayer {
    pub adenine_water: u8,
    pub thymine_fire: u8,
    pub cytosine_earth: u8,
    pub guanine_air: u8,
    pub mbti_raw: u8,
    pub dominant_function: u8,
    pub auxiliary_function: u8,
    pub enneagram_type: u8,
    pub enneagram_wing: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize, Zeroize)]
#[zeroize(drop)]
pub struct GeneKeysLayer {
    pub gene_keys_activation: u64,
    pub shadow_mask: u64,
    pub gift_mask: u64,
    pub siddhi_mask: u64,
    pub life_work_hex: u8,
    pub evolution_hex: u8,
    pub radiance_hex: u8,
    pub purpose_hex: u8,
    pub attraction_hex: u8,
    pub iq_hex: u8,
    pub eq_hex: u8,
    pub sq_hex: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize, Zeroize)]
#[zeroize(drop)]
pub struct HumanDesignLayer {
    pub hd_type: u8,
    pub hd_authority: u8,
    pub hd_profile: [u8; 2],
    pub hd_definition: u8,
    pub incarnation_cross: u8,
    pub defined_channels: u16,
    pub defined_gates: [u32; 2],
}

// ─── NaraIdentityMatrix ─────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Zeroize)]
#[zeroize(drop)]
pub struct NaraIdentityMatrix {
    pub layer_presence: u8,
    pub layer_0: Option<NumerologicalLayer>,
    pub layer_1: Option<AstrologicalLayer>,
    pub layer_2: Option<JungianLayer>,
    pub layer_3: Option<GeneKeysLayer>,
    pub layer_4: Option<HumanDesignLayer>,
    pub quintessence_hash: u64,
    pub computed: bool,
}

impl NaraIdentityMatrix {
    /// Full 16-char hex representation of the quintessence hash.
    pub fn hash_hex(&self) -> String {
        format!("{:016x}", self.quintessence_hash)
    }

    /// First 8 characters of the hash hex — preview form.
    pub fn hash_preview(&self) -> String {
        self.hash_hex()[..8].to_string()
    }

    /// Minimum viable identity requires layer 0 (numerological) present.
    pub fn is_minimum_viable(&self) -> bool {
        self.layer_presence & 0x01 != 0
    }

    /// Population count of layer_presence bitmask.
    pub fn layer_count(&self) -> u8 {
        self.layer_presence.count_ones() as u8
    }
}

// ─── Profile JSON Types ─────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize)]
pub struct ProfileJson {
    pub version: u32,
    pub layers: HashMap<String, LayerMeta>,
    pub layer_presence_mask: u8,
    pub hash_preview: String,
    pub last_wound: Option<u64>,
    pub kerykeion_version: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LayerMeta {
    pub present: bool,
    pub source: String,
    pub completeness: u8,
    pub set_at: Option<u64>,
}

// ─── Filesystem I/O ─────────────────────────────────────────────────────────

/// Returns ~/.epi-logos/nara
pub fn nara_home() -> PathBuf {
    dirs::home_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join(".epi-logos")
        .join("nara")
}

/// Load profile.json from nara_home(), returning None if it does not exist.
pub fn load_profile() -> Result<Option<ProfileJson>, String> {
    let path = nara_home().join("profile.json");
    if !path.exists() {
        return Ok(None);
    }
    let data = fs::read_to_string(&path).map_err(|e| format!("read profile: {}", e))?;
    let profile: ProfileJson =
        serde_json::from_str(&data).map_err(|e| format!("parse profile: {}", e))?;
    Ok(Some(profile))
}

/// Save profile.json to nara_home(), creating directories as needed.
pub fn save_profile(profile: &ProfileJson) -> Result<(), String> {
    let dir = nara_home();
    fs::create_dir_all(&dir).map_err(|e| format!("create nara home: {}", e))?;
    let path = dir.join("profile.json");
    let data =
        serde_json::to_string_pretty(profile).map_err(|e| format!("serialize profile: {}", e))?;
    fs::write(&path, data).map_err(|e| format!("write profile: {}", e))?;
    Ok(())
}

// ─── CLI entry: identity show ───────────────────────────────────────────────

pub fn show(json: bool) -> Result<String, String> {
    match load_profile()? {
        None => Ok("No profile. Run 'epi nara wind'.".to_string()),
        Some(profile) => {
            if json {
                serde_json::to_string_pretty(&profile).map_err(|e| e.to_string())
            } else {
                let mut out = String::new();
                out.push_str(&format!(
                    "Nara Identity \u{2014} hash: {}\n",
                    profile.hash_preview
                ));
                out.push_str(&format!(
                    "  Layers: {}/5 present (mask: 0x{:02x})\n",
                    profile.layer_presence_mask.count_ones(),
                    profile.layer_presence_mask
                ));
                let mut keys: Vec<&String> = profile.layers.keys().collect();
                keys.sort();
                for idx in &keys {
                    if let Some(meta) = profile.layers.get(*idx) {
                        let mark = if meta.present { "\u{2713}" } else { "\u{2717}" };
                        out.push_str(&format!(
                            "  [{}] {} \u{2014} completeness: {}/5\n",
                            idx, mark, meta.completeness
                        ));
                    }
                }
                if let Some(ts) = profile.last_wound {
                    out.push_str(&format!("  Last wound: {}\n", ts));
                }
                Ok(out)
            }
        }
    }
}
