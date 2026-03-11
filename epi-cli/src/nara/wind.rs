use super::identity::{load_profile, nara_home, save_profile, LayerMeta, ProfileJson};
use super::kairos;
use std::collections::HashMap;
use std::time::{SystemTime, UNIX_EPOCH};

/// Result of a successful wind operation
#[derive(Debug, serde::Serialize)]
pub struct WoundState {
    pub wound: bool,
    pub layers_present: u8,
    pub quintessence_hash: String,
    pub torus_pos: u8,
    pub spanda_stage: u8,
    pub active_decan: u8,
    pub element: u8,
    pub message: String,
}

/// Full 9-step wind sequence
pub fn run(
    birth_date: Option<&str>,
    birth_time: Option<&str>,
    birth_lat: Option<f32>,
    birth_lon: Option<f32>,
    _from_profile: bool,
    force: bool,
    json: bool,
) -> Result<String, String> {
    let now_ts = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();

    // Check already-wound guard (unless --force)
    if !force {
        if let Ok(Some(ref profile)) = load_profile() {
            if let Some(last) = profile.last_wound {
                let elapsed = now_ts.saturating_sub(last);
                if elapsed < 86400 {
                    return Err("Already wound today. Use --force to override.".to_string());
                }
            }
        }
    }

    // === Step 1: Load profile -> decrypt present layers ===
    let mut profile = load_profile()?.unwrap_or_else(|| ProfileJson {
        version: 1,
        layers: HashMap::new(),
        layer_presence_mask: 0,
        hash_preview: String::new(),
        last_wound: None,
        kerykeion_version: None,
    });

    // === Step 2: Acquire missing inputs ===
    let date = birth_date.map(|s| s.to_string());

    let time = birth_time.unwrap_or("12:00");
    let lat = birth_lat.unwrap_or(0.0);
    let lon = birth_lon.unwrap_or(0.0);

    // === Step 3: Compute identity layers from birth data if provided ===
    let mut layer_presence: u8 = profile.layer_presence_mask;
    #[allow(unused_assignments)]
    let mut hash: u64 = 0;

    if let Some(ref date_str) = date {
        // Parse birth date
        let parts: Vec<&str> = date_str.split('-').collect();
        if parts.len() != 3 {
            return Err("birth_date must be YYYY-MM-DD format".to_string());
        }
        let year: u32 = parts[0].parse().map_err(|_| "invalid year".to_string())?;
        let month: u8 = parts[1].parse().map_err(|_| "invalid month".to_string())?;
        let day: u8 = parts[2].parse().map_err(|_| "invalid day".to_string())?;

        // Numerological layer (#4.0-0)
        let numerological_key = year + (month as u32) * 100 + day as u32;
        let _digit_sum = digit_reduce(numerological_key);
        let _life_path = life_path_number(year, month as u32, day as u32);

        layer_presence |= 0x01; // Layer 0 present
        profile.layers.insert(
            "0".to_string(),
            LayerMeta {
                present: true,
                source: "birth_date".to_string(),
                completeness: 3,
                set_at: Some(now_ts),
            },
        );

        // Store numerological data in profile metadata
        hash = simple_hash(numerological_key as u64, layer_presence);

        // === Step 4: Run kerykeion for current transits ===
        let today = chrono::Utc::now().format("%Y-%m-%d").to_string();
        match kairos::run_kerykeion_current(&today) {
            Ok(kairos_result) => {
                kairos::save_current(&kairos_result)?;

                // Also compute natal chart if we have birth data
                match kairos::run_kerykeion_natal(date_str, time, lat, lon) {
                    Ok(natal) => {
                        layer_presence |= 0x02; // Layer 1 (astrological) present
                        profile.layers.insert(
                            "1".to_string(),
                            LayerMeta {
                                present: true,
                                source: "kerykeion_natal".to_string(),
                                completeness: 4,
                                set_at: Some(now_ts),
                            },
                        );

                        // Save natal chart
                        let natal_path = kairos::kairos_dir().join("natal.json");
                        std::fs::create_dir_all(natal_path.parent().unwrap())
                            .map_err(|e| e.to_string())?;
                        std::fs::write(
                            &natal_path,
                            serde_json::to_string_pretty(&natal).map_err(|e| e.to_string())?,
                        )
                        .map_err(|e| e.to_string())?;

                        // Incorporate astrological data into hash
                        if let Some(sun) = natal.planets.iter().find(|p| p.planet_id == 0) {
                            hash ^= sun.degree_anchor as u64;
                        }

                        profile.kerykeion_version = Some("4.x".to_string());
                    }
                    Err(e) => {
                        eprintln!("Warning: natal chart computation failed: {e}");
                    }
                }
            }
            Err(e) => {
                eprintln!("Warning: kerykeion unavailable ({e}). Proceeding without kairos.");
            }
        }
    } else if profile.layer_presence_mask > 0 {
        // Use existing profile layers (no new birth data)
        hash = u64::from_str_radix(
            &profile.hash_preview.chars().take(16).collect::<String>(),
            16,
        )
        .unwrap_or(0);
    } else {
        return Err("No birth data provided and no existing profile. \
                    Use --birth-date YYYY-MM-DD"
            .to_string());
    }

    // === Step 5: Torus position from current sun degree ===
    let torus_pos = if let Ok(Some(k)) = kairos::load_current() {
        if let Some(sun) = k.planets.iter().find(|p| p.planet_id == 0) {
            ((sun.degree / 60.0) as u8).min(11)
        } else {
            0
        }
    } else {
        0
    };

    // === Step 6: M3 projection (stub — requires full FFI) ===
    let _m3_projection: u64 = 0;

    // === Step 7: Gateway publish (stub — requires running gateway) ===
    // SpacetimeBridge::publish_presence() — deferred to Phase 6

    // === Step 8: Write profile.json + quintessence.bin ===
    profile.layer_presence_mask = layer_presence;
    profile.hash_preview = format!("{:016x}", hash)[..8].to_string();
    profile.last_wound = Some(now_ts);
    save_profile(&profile)?;

    // Write quintessence.bin
    let identity_dir = nara_home().join("identity");
    std::fs::create_dir_all(&identity_dir).map_err(|e| e.to_string())?;
    std::fs::write(identity_dir.join("quintessence.bin"), hash.to_le_bytes())
        .map_err(|e| e.to_string())?;

    // === Step 9: Return wound state ===
    let kairos_state = kairos::load_current()?.unwrap_or_else(|| kairos::KerykeionResult {
        planets: vec![],
        dominant_sign: 0,
        dominant_element: 0,
        active_decan: 0,
        active_tattva: 0,
    });

    let state = WoundState {
        wound: true,
        layers_present: layer_presence,
        quintessence_hash: format!("{:016x}", hash),
        torus_pos,
        spanda_stage: 0,
        active_decan: kairos_state.active_decan,
        element: kairos_state.dominant_element,
        message: format!(
            "Nara wound. {} layer(s) present. Hash: {}",
            layer_presence.count_ones(),
            &format!("{:016x}", hash)[..8]
        ),
    };

    if json {
        serde_json::to_string_pretty(&state).map_err(|e| e.to_string())
    } else {
        Ok(state.message.clone())
    }
}

/// Simple hash for pre-FFI phase (will be replaced by BLAKE3 FFI)
fn simple_hash(seed: u64, presence: u8) -> u64 {
    let mut h = seed;
    h ^= (presence as u64) << 56;
    h = h.wrapping_mul(0x517cc1b727220a95);
    h ^= h >> 32;
    h
}

/// Reduce number to single digit (digital root)
fn digit_reduce(mut n: u32) -> u8 {
    while n > 9 {
        let mut sum = 0u32;
        while n > 0 {
            sum += n % 10;
            n /= 10;
        }
        n = sum;
    }
    n as u8
}

/// Life path number from birth date
fn life_path_number(year: u32, month: u32, day: u32) -> u8 {
    let y = digit_reduce(year);
    let m = digit_reduce(month);
    let d = digit_reduce(day);
    let sum = y as u32 + m as u32 + d as u32;
    // Master numbers: 11, 22, 33 — don't reduce
    if sum == 11 || sum == 22 || sum == 33 {
        sum as u8
    } else {
        digit_reduce(sum)
    }
}
