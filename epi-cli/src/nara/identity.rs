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
    /// BLAKE3 quintessence identity hash — canonical 32-byte representation.
    /// Source: 00-canonical-invariants.md §1
    #[serde(with = "hex_bytes_32")]
    pub quintessence_hash: [u8; 32],
    /// Derived hex preview string (first 8 hex chars = first 4 bytes).
    /// NOT stored separately — always derived from quintessence_hash on read.
    #[serde(skip)]
    pub quintessence_preview: String,
    pub computed: bool,
}

impl NaraIdentityMatrix {
    /// Full 64-char hex representation of the quintessence hash.
    pub fn hash_hex(&self) -> String {
        self.quintessence_hash.iter().map(|b| format!("{:02x}", b)).collect()
    }

    /// First 8 characters of the hash hex — preview form (first 4 bytes).
    pub fn hash_preview(&self) -> String {
        self.quintessence_hash[..4].iter().map(|b| format!("{:02x}", b)).collect()
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

/// Serde helper: serialize/deserialize [u8; 32] as a 64-char lowercase hex string.
mod hex_bytes_32 {
    use serde::{Deserialize, Deserializer, Serializer};

    pub fn serialize<S>(bytes: &[u8; 32], s: S) -> Result<S::Ok, S::Error>
    where S: Serializer
    {
        let hex: String = bytes.iter().map(|b| format!("{:02x}", b)).collect();
        s.serialize_str(&hex)
    }

    pub fn deserialize<'de, D>(d: D) -> Result<[u8; 32], D::Error>
    where D: Deserializer<'de>
    {
        let hex = String::deserialize(d)?;
        if hex.len() != 64 {
            return Err(serde::de::Error::custom("quintessence_hash must be 64 hex chars"));
        }
        let mut out = [0u8; 32];
        for (i, chunk) in hex.as_bytes().chunks(2).enumerate() {
            let hi = u8::from_str_radix(std::str::from_utf8(chunk).unwrap_or("00"), 16)
                .map_err(serde::de::Error::custom)?;
            out[i] = hi;
        }
        Ok(out)
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

// ─── PASU path ──────────────────────────────────────────────────────────────

/// Path to PASU.md user identity bootstrap file
fn pasu_path() -> std::path::PathBuf {
    dirs::home_dir()
        .unwrap_or_else(|| std::path::PathBuf::from("."))
        .join("Documents")
        .join("Epi-Logos C Experiments")
        .join("Idea")
        .join("Pratibimba")
        .join("Self")
        .join("PASU.md")
}

/// Simple hash for profile update (BLAKE3 FFI wired in wind.rs full phase)
fn simple_identity_hash(presence: u8) -> u64 {
    let mut h = presence as u64;
    h = h.wrapping_mul(0x517cc1b727220a95);
    h ^= h >> 32;
    h
}

// ─── CLI entry: identity set ─────────────────────────────────────────────────

/// Set an identity layer by key name.
/// Keys: birth-date, birth-location, natal-chart-path, jungian, gene-keys, human-design
pub fn set_layer(key: &str, value: &str) -> Result<String, String> {
    let now_ts = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();

    let mut profile = load_profile()?.unwrap_or_else(|| ProfileJson {
        version: 1,
        layers: HashMap::new(),
        layer_presence_mask: 0,
        hash_preview: String::new(),
        last_wound: None,
        kerykeion_version: None,
    });

    match key {
        "birth-date" => {
            // Validate YYYY-MM-DD format
            let parts: Vec<&str> = value.split('-').collect();
            if parts.len() != 3 || parts[0].len() != 4 {
                return Err("birth-date must be YYYY-MM-DD format".to_string());
            }
            let _year: u32 = parts[0].parse().map_err(|_| "invalid year")?;
            let _month: u8 = parts[1].parse().map_err(|_| "invalid month")?;
            let _day: u8 = parts[2].parse().map_err(|_| "invalid day")?;

            profile.layers.insert(
                "0".to_string(),
                LayerMeta {
                    present: true,
                    source: format!("birth-date:{value}"),
                    completeness: 3,
                    set_at: Some(now_ts),
                },
            );
            profile.layer_presence_mask |= 0x01;

            // Also write to PASU.md path if available
            let pp = pasu_path();
            if pp.exists() {
                let content = fs::read_to_string(&pp).unwrap_or_default();
                if !content.contains("c_0_birth_date") {
                    let _ = fs::write(&pp, format!("{content}\nc_0_birth_date: \"{value}\"\n"));
                }
            }
        }
        "birth-location" => {
            // Expect "lat,lon" format
            let parts: Vec<&str> = value.split(',').collect();
            if parts.len() != 2 {
                return Err(
                    "birth-location must be 'lat,lon' format (e.g. '51.5,-0.1')".to_string()
                );
            }
            let _lat: f32 = parts[0].trim().parse().map_err(|_| "invalid latitude")?;
            let _lon: f32 = parts[1].trim().parse().map_err(|_| "invalid longitude")?;

            profile.layers.insert(
                "1".to_string(),
                LayerMeta {
                    present: true,
                    source: format!("birth-location:{value}"),
                    completeness: 2,
                    set_at: Some(now_ts),
                },
            );
            profile.layer_presence_mask |= 0x02;
        }
        "natal-chart-path" => {
            profile.layers.insert(
                "1".to_string(),
                LayerMeta {
                    present: true,
                    source: format!("natal-chart-path:{value}"),
                    completeness: 5,
                    set_at: Some(now_ts),
                },
            );
            profile.layer_presence_mask |= 0x02;
        }
        "jungian" => {
            if value.len() != 4 {
                return Err(
                    "jungian value must be 4-letter MBTI type (e.g. INFJ)".to_string()
                );
            }
            profile.layers.insert(
                "2".to_string(),
                LayerMeta {
                    present: true,
                    source: format!("jungian:{value}"),
                    completeness: 3,
                    set_at: Some(now_ts),
                },
            );
            profile.layer_presence_mask |= 0x04;
        }
        "gene-keys" => {
            profile.layers.insert(
                "3".to_string(),
                LayerMeta {
                    present: true,
                    source: format!("gene-keys:{value}"),
                    completeness: 2,
                    set_at: Some(now_ts),
                },
            );
            profile.layer_presence_mask |= 0x08;
        }
        "human-design" => {
            profile.layers.insert(
                "4".to_string(),
                LayerMeta {
                    present: true,
                    source: format!("human-design:{value}"),
                    completeness: 2,
                    set_at: Some(now_ts),
                },
            );
            profile.layer_presence_mask |= 0x10;
        }
        _ => {
            return Err(format!(
                "Unknown identity key '{}'. Valid keys: birth-date, birth-location, natal-chart-path, jungian, gene-keys, human-design",
                key
            ));
        }
    }

    // Update hash preview from layer presence.
    // Derive from expanded 32-byte hash (same expansion strategy as wind.rs).
    // preview = first 8 hex chars = first 4 bytes of hash32.
    let h0 = simple_identity_hash(profile.layer_presence_mask);
    let h0_bytes = h0.to_le_bytes();
    // Use first 4 bytes of h0 for the preview — consistent with wind.rs hash32[..4].
    profile.hash_preview = h0_bytes[..4].iter().map(|b| format!("{:02x}", b)).collect();

    save_profile(&profile)?;
    Ok(format!(
        "Identity layer '{}' set. Layer presence: 0x{:02x}",
        key, profile.layer_presence_mask
    ))
}

// ─── Clock Position from Hash ─────────────────────────────────────────────

/// Derive clock position from a 32-byte quintessence hash.
///
/// degree = (hash[0] as u16 | (hash[1] as u16) << 8) % 360
/// tick12 = degree / 30
///
/// Returns (degree, tick12) — integer arithmetic only, no float cast.
pub fn hash_to_clock_position(hash: &[u8; 32]) -> (u16, u8) {
    let degree = ((hash[0] as u16) | ((hash[1] as u16) << 8)) % 360;
    let tick12 = (degree / 30) as u8;
    (degree, tick12)
}

/// Derive clock position from the stored 8-char hash_preview string (e.g. "ab12ef34").
///
/// Parses first 4 hex chars (bytes 0 and 1) and delegates to `hash_to_clock_position`.
/// Returns None if the preview is shorter than 4 chars or not valid hex.
pub fn hash_to_clock_position_from_preview(preview: &str) -> Option<(u16, u8)> {
    if preview.len() < 4 {
        return None;
    }
    let b0 = u8::from_str_radix(&preview[0..2], 16).ok()?;
    let b1 = u8::from_str_radix(&preview[2..4], 16).ok()?;
    let mut hash = [0u8; 32];
    hash[0] = b0;
    hash[1] = b1;
    Some(hash_to_clock_position(&hash))
}

/// Augment identity by layer index with raw data string
pub fn augment_layer(layer_idx: u8, data: &str) -> Result<String, String> {
    if layer_idx > 4 {
        return Err("Layer index must be 0-4".to_string());
    }
    let key = match layer_idx {
        0 => "birth-date",
        1 => "birth-location",
        2 => "jungian",
        3 => "gene-keys",
        4 => "human-design",
        _ => unreachable!(),
    };
    set_layer(key, data)
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn hash_zero_gives_degree_0_tick_0() {
        let hash = [0u8; 32];
        let (deg, tick) = hash_to_clock_position(&hash);
        assert_eq!(deg, 0);
        assert_eq!(tick, 0);
    }

    #[test]
    fn hash_to_clock_tick12_in_range() {
        // hash[0]=180, hash[1]=0 → degree = 180 % 360 = 180, tick12 = 6
        let mut hash = [0u8; 32];
        hash[0] = 180;
        let (deg, tick) = hash_to_clock_position(&hash);
        assert_eq!(deg, 180);
        assert_eq!(tick, 6);
    }

    #[test]
    fn hash_to_clock_wraps_at_360() {
        // hash[0]=0xFF, hash[1]=0x01 → raw = 0x01FF = 511, 511 % 360 = 151, tick12 = 5
        let mut hash = [0u8; 32];
        hash[0] = 0xFF;
        hash[1] = 0x01;
        let (deg, tick) = hash_to_clock_position(&hash);
        assert_eq!(deg, 151);
        assert_eq!(tick, 5);
    }

    #[test]
    fn hash_to_clock_from_preview_parses_bytes() {
        // preview "b400..." → b0=0xb4=180, b1=0x00 → degree=180, tick12=6
        let (deg, tick) = hash_to_clock_position_from_preview("b400").unwrap();
        assert_eq!(deg, 180);
        assert_eq!(tick, 6);
    }

    #[test]
    fn hash_to_clock_from_preview_returns_none_on_short() {
        assert!(hash_to_clock_position_from_preview("ab").is_none());
        assert!(hash_to_clock_position_from_preview("").is_none());
    }
}
