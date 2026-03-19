//! NaraWeights — tunable oracle/medicine resonance weight system
//!
//! Weights stored in ~/.epi-logos/config.toml [nara.weights] section.
//! Two weight groups:
//!   - body_* weights (sum to 1.0): body-natal, body-transit, body-oracle
//!   - oracle_* weights (sum to 1.0): oracle-pp, oracle-nn, oracle-mp, oracle-pm
//!
//! Defaults derived from nucleotide per-suit integrals:
//!   A=84(Water/Cups), T=96(Fire/Wands), C=88(Earth/Pentacles), G=92(Air/Swords)
//!   Total = 360 (M3_INTEGRAL_INVARIANT)

use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// Default body weight: natal contribution (stable layer)
pub const DEFAULT_BODY_NATAL: f32 = 0.50;
/// Default body weight: transit contribution (live planetary hour)
pub const DEFAULT_BODY_TRANSIT: f32 = 0.30;
/// Default body weight: oracle canonical tags contribution
pub const DEFAULT_BODY_ORACLE: f32 = 0.20;

/// Default oracle resonance weight for pp (convergent, Fire/T=96/360)
pub const DEFAULT_ORACLE_PP: f32 = 0.40;
/// Default oracle resonance weight for nn (shadow, Water/A=84/360)
pub const DEFAULT_ORACLE_NN: f32 = 0.15;
/// Default oracle resonance weight for mp (ascending, Air/G=92/360)
pub const DEFAULT_ORACLE_MP: f32 = 0.25;
/// Default oracle resonance weight for pm (descending, Earth/C=88/360)
pub const DEFAULT_ORACLE_PM: f32 = 0.20;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NaraWeights {
    /// Body zone temporal layer weights (must sum to 1.0)
    pub body_natal: f32,
    pub body_transit: f32,
    pub body_oracle: f32,

    /// Oracle resonance quaternionic charge weights (must sum to 1.0)
    pub oracle_pp: f32, // convergent (Yang)
    pub oracle_nn: f32, // shadow (Yin)
    pub oracle_mp: f32, // ascending (Air)
    pub oracle_pm: f32, // descending (Earth)
}

impl Default for NaraWeights {
    fn default() -> Self {
        Self {
            body_natal: DEFAULT_BODY_NATAL,
            body_transit: DEFAULT_BODY_TRANSIT,
            body_oracle: DEFAULT_BODY_ORACLE,
            oracle_pp: DEFAULT_ORACLE_PP,
            oracle_nn: DEFAULT_ORACLE_NN,
            oracle_mp: DEFAULT_ORACLE_MP,
            oracle_pm: DEFAULT_ORACLE_PM,
        }
    }
}

impl NaraWeights {
    /// Validate that both weight groups sum to approximately 1.0
    pub fn validate(&self) -> Result<(), String> {
        let body_sum = self.body_natal + self.body_transit + self.body_oracle;
        if (body_sum - 1.0).abs() > 0.01 {
            return Err(format!(
                "body weights sum to {:.3}, must be 1.0",
                body_sum
            ));
        }
        let oracle_sum = self.oracle_pp + self.oracle_nn + self.oracle_mp + self.oracle_pm;
        if (oracle_sum - 1.0).abs() > 0.01 {
            return Err(format!(
                "oracle weights sum to {:.3}, must be 1.0",
                oracle_sum
            ));
        }
        Ok(())
    }

    /// Normalize body weights to sum to 1.0
    pub fn normalize_body(&mut self) {
        let sum = self.body_natal + self.body_transit + self.body_oracle;
        if sum > 0.0 {
            self.body_natal /= sum;
            self.body_transit /= sum;
            self.body_oracle /= sum;
        }
    }

    /// Normalize oracle weights to sum to 1.0
    pub fn normalize_oracle(&mut self) {
        let sum = self.oracle_pp + self.oracle_nn + self.oracle_mp + self.oracle_pm;
        if sum > 0.0 {
            self.oracle_pp /= sum;
            self.oracle_nn /= sum;
            self.oracle_mp /= sum;
            self.oracle_pm /= sum;
        }
    }
}

// ─── Config I/O ────────────────────────────────────────────────────────────

fn config_path() -> PathBuf {
    dirs::home_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join(".epi-logos")
        .join("config.toml")
}

/// Load NaraWeights from config.toml, returning defaults if absent.
pub fn load_weights() -> Result<NaraWeights, String> {
    let path = config_path();
    if !path.exists() {
        return Ok(NaraWeights::default());
    }
    let content = std::fs::read_to_string(&path).map_err(|e| format!("read config: {e}"))?;

    // Parse TOML manually for [nara.weights] section
    let weights = parse_weights_from_toml(&content);
    Ok(weights)
}

/// Save NaraWeights to config.toml [nara.weights] section.
pub fn save_weights(weights: &NaraWeights) -> Result<(), String> {
    let path = config_path();
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| format!("create config dir: {e}"))?;
    }

    // Read existing config or start fresh
    let existing = if path.exists() {
        std::fs::read_to_string(&path).unwrap_or_default()
    } else {
        String::new()
    };

    // Remove existing [nara.weights] section
    let cleaned = remove_toml_section(&existing, "nara.weights");

    // Append new section
    let new_section = format!(
        "\n[nara.weights]\nbody_natal = {:.4}\nbody_transit = {:.4}\nbody_oracle = {:.4}\noracle_pp = {:.4}\noracle_nn = {:.4}\noracle_mp = {:.4}\noracle_pm = {:.4}\n",
        weights.body_natal,
        weights.body_transit,
        weights.body_oracle,
        weights.oracle_pp,
        weights.oracle_nn,
        weights.oracle_mp,
        weights.oracle_pm
    );

    std::fs::write(&path, format!("{cleaned}{new_section}"))
        .map_err(|e| format!("write config: {e}"))
}

/// Parse [nara.weights] section from TOML string.
fn parse_weights_from_toml(toml: &str) -> NaraWeights {
    let mut w = NaraWeights::default();
    let mut in_section = false;

    for line in toml.lines() {
        let trimmed = line.trim();
        if trimmed == "[nara.weights]" {
            in_section = true;
            continue;
        }
        if in_section {
            if trimmed.starts_with('[') {
                break; // Next section
            }
            if let Some((key, val)) = trimmed.split_once('=') {
                let key = key.trim();
                let val: f32 = val.trim().parse().unwrap_or(0.0);
                match key {
                    "body_natal" => w.body_natal = val,
                    "body_transit" => w.body_transit = val,
                    "body_oracle" => w.body_oracle = val,
                    "oracle_pp" => w.oracle_pp = val,
                    "oracle_nn" => w.oracle_nn = val,
                    "oracle_mp" => w.oracle_mp = val,
                    "oracle_pm" => w.oracle_pm = val,
                    _ => {}
                }
            }
        }
    }
    w
}

/// Remove a TOML section and all its key-value pairs.
fn remove_toml_section(toml: &str, section: &str) -> String {
    let section_header = format!("[{section}]");
    let mut result = String::new();
    let mut in_target = false;

    for line in toml.lines() {
        let trimmed = line.trim();
        if trimmed == section_header {
            in_target = true;
            continue;
        }
        if in_target && trimmed.starts_with('[') {
            in_target = false;
        }
        if !in_target {
            result.push_str(line);
            result.push('\n');
        }
    }
    result
}

// ─── Calibration ───────────────────────────────────────────────────────────

/// Auto-calibrate oracle weights from identity nucleotide_balance.
/// Maps A/T/C/G values to oracle resonance weights via per-suit integrals.
///
/// Per-suit integrals: A=84(nn), T=96(pp), G=92(mp), C=88(pm). Total=360.
pub fn calibrate_from_nucleotide_balance(
    adenine: u8,  // Water/Cups/A
    thymine: u8,  // Fire/Wands/T
    cytosine: u8, // Earth/Pentacles/C
    guanine: u8,  // Air/Swords/G
) -> NaraWeights {
    // Per-suit integrals as scaling factors
    const A_INTEGRAL: f32 = 84.0; // nn (shadow)
    const T_INTEGRAL: f32 = 96.0; // pp (convergent)
    const C_INTEGRAL: f32 = 88.0; // pm (descending)
    const G_INTEGRAL: f32 = 92.0; // mp (ascending)

    // Scale nucleotide values by per-suit integrals
    let nn_raw = (adenine as f32 / 255.0) * A_INTEGRAL;
    let pp_raw = (thymine as f32 / 255.0) * T_INTEGRAL;
    let pm_raw = (cytosine as f32 / 255.0) * C_INTEGRAL;
    let mp_raw = (guanine as f32 / 255.0) * G_INTEGRAL;

    let total = nn_raw + pp_raw + pm_raw + mp_raw;

    let (oracle_nn, oracle_pp, oracle_pm, oracle_mp) = if total > 0.0 {
        (
            nn_raw / total,
            pp_raw / total,
            pm_raw / total,
            mp_raw / total,
        )
    } else {
        (
            DEFAULT_ORACLE_NN,
            DEFAULT_ORACLE_PP,
            DEFAULT_ORACLE_PM,
            DEFAULT_ORACLE_MP,
        )
    };

    NaraWeights {
        body_natal: DEFAULT_BODY_NATAL,
        body_transit: DEFAULT_BODY_TRANSIT,
        body_oracle: DEFAULT_BODY_ORACLE,
        oracle_pp,
        oracle_nn,
        oracle_mp,
        oracle_pm,
    }
}

// ─── CLI Commands ────────────────────────────────────────────────────────────

/// epi nara weights show
pub fn show(json: bool) -> Result<String, String> {
    let w = load_weights()?;
    if json {
        serde_json::to_string_pretty(&w).map_err(|e| e.to_string())
    } else {
        Ok(format!(
            "NaraWeights\n  Body: natal={:.3} transit={:.3} oracle={:.3}\n  Oracle: pp={:.3} nn={:.3} mp={:.3} pm={:.3}",
            w.body_natal, w.body_transit, w.body_oracle,
            w.oracle_pp, w.oracle_nn, w.oracle_mp, w.oracle_pm
        ))
    }
}

/// epi nara weights set <key> <value>
pub fn set_weight(key: &str, value: f32) -> Result<String, String> {
    let mut w = load_weights()?;

    match key {
        "body-natal" => {
            w.body_natal = value;
            let remaining = 1.0 - value;
            let other_total = w.body_transit + w.body_oracle;
            if other_total > 0.0 {
                let ratio = remaining / other_total;
                w.body_transit *= ratio;
                w.body_oracle *= ratio;
            }
        }
        "body-transit" => {
            w.body_transit = value;
            let remaining = 1.0 - value;
            let other_total = w.body_natal + w.body_oracle;
            if other_total > 0.0 {
                let ratio = remaining / other_total;
                w.body_natal *= ratio;
                w.body_oracle *= ratio;
            }
        }
        "body-oracle" => {
            w.body_oracle = value;
            let remaining = 1.0 - value;
            let other_total = w.body_natal + w.body_transit;
            if other_total > 0.0 {
                let ratio = remaining / other_total;
                w.body_natal *= ratio;
                w.body_transit *= ratio;
            }
        }
        "oracle-pp" => {
            w.oracle_pp = value;
            let remaining = 1.0 - value;
            let other_total = w.oracle_nn + w.oracle_mp + w.oracle_pm;
            if other_total > 0.0 {
                let ratio = remaining / other_total;
                w.oracle_nn *= ratio;
                w.oracle_mp *= ratio;
                w.oracle_pm *= ratio;
            }
        }
        "oracle-nn" => {
            w.oracle_nn = value;
            let remaining = 1.0 - value;
            let other_total = w.oracle_pp + w.oracle_mp + w.oracle_pm;
            if other_total > 0.0 {
                let ratio = remaining / other_total;
                w.oracle_pp *= ratio;
                w.oracle_mp *= ratio;
                w.oracle_pm *= ratio;
            }
        }
        "oracle-mp" => {
            w.oracle_mp = value;
            let remaining = 1.0 - value;
            let other_total = w.oracle_pp + w.oracle_nn + w.oracle_pm;
            if other_total > 0.0 {
                let ratio = remaining / other_total;
                w.oracle_pp *= ratio;
                w.oracle_nn *= ratio;
                w.oracle_pm *= ratio;
            }
        }
        "oracle-pm" => {
            w.oracle_pm = value;
            let remaining = 1.0 - value;
            let other_total = w.oracle_pp + w.oracle_nn + w.oracle_mp;
            if other_total > 0.0 {
                let ratio = remaining / other_total;
                w.oracle_pp *= ratio;
                w.oracle_nn *= ratio;
                w.oracle_mp *= ratio;
            }
        }
        _ => {
            return Err(format!(
                "Unknown weight key '{}'. Valid: body-natal, body-transit, body-oracle, oracle-pp, oracle-nn, oracle-mp, oracle-pm",
                key
            ));
        }
    }

    w.validate()?;
    save_weights(&w)?;
    Ok(format!(
        "Weight '{}' set to {:.3} (siblings renormalized)",
        key, value
    ))
}

/// epi nara weights reset
pub fn reset() -> Result<String, String> {
    let w = NaraWeights::default();
    save_weights(&w)?;
    Ok("Weights reset to defaults".to_string())
}

/// epi nara weights calibrate
pub fn calibrate() -> Result<String, String> {
    // Load identity profile to get nucleotide balance
    let profile = super::identity::load_profile()?;

    let profile = profile.ok_or("No identity profile. Run 'epi nara wind' first.")?;

    // Try to load jungian layer data from profile source
    // Layer 2 source has format "jungian:MBTI" or similar
    let jungian_meta = profile.layers.get("2");

    // Default nucleotide balance from profile sources
    let (adenine, thymine, cytosine, guanine) = if let Some(meta) = jungian_meta {
        // Parse MBTI from source field if available
        if meta.source.starts_with("jungian:") {
            let mbti = &meta.source["jungian:".len()..];
            mbti_to_nucleotides(mbti)
        } else {
            (84u8, 96u8, 88u8, 92u8) // Defaults (per-suit integral values normalized)
        }
    } else {
        (84u8, 96u8, 88u8, 92u8)
    };

    let w = calibrate_from_nucleotide_balance(adenine, thymine, cytosine, guanine);
    save_weights(&w)?;

    Ok(format!(
        "Weights calibrated from identity\n  oracle: pp={:.3} nn={:.3} mp={:.3} pm={:.3}",
        w.oracle_pp, w.oracle_nn, w.oracle_mp, w.oracle_pm
    ))
}

/// Derive nucleotide balance from MBTI type
fn mbti_to_nucleotides(mbti: &str) -> (u8, u8, u8, u8) {
    let mbti = mbti.to_uppercase();
    // E/I → F/T dominance affects A/G balance
    // S/N → affects C/T balance
    // T/F → direct G (Thinking/Air) vs A (Feeling/Water)
    // J/P → affects rhythm

    let feeling = mbti.contains('F');
    let intuition = mbti.contains('N');
    let extrovert = mbti.contains('E');

    let adenine = if feeling { 140u8 } else { 60u8 }; // Water/Cups/Feeling
    let thymine = if intuition { 140u8 } else { 60u8 }; // Fire/Wands/Intuition
    let cytosine = if !intuition { 120u8 } else { 80u8 }; // Earth/Pentacles/Sensation
    let guanine = if !feeling { 140u8 } else { 60u8 }; // Air/Swords/Thinking

    // Extraversion shifts toward Fire (T)
    let thymine = if extrovert {
        thymine.saturating_add(20)
    } else {
        thymine
    };
    let adenine = if !extrovert {
        adenine.saturating_add(20)
    } else {
        adenine
    };

    (adenine, thymine, cytosine, guanine)
}
