use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::process::Command;

use crate::portal::clock_state::{KairosState, PlanetState};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KerykeionResult {
    pub planets: Vec<PlanetPosition>,
    pub dominant_sign: u8,
    pub dominant_element: u8,
    pub active_decan: u8,
    pub active_tattva: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlanetPosition {
    pub planet_id: u8,
    pub degree: f32,        // 0.0-360.0 ecliptic longitude
    pub degree_anchor: u16, // 0-719 SU(2) mapped
    pub retrograde: bool,
}

/// Natal chart computation via kerykeion
pub fn run_kerykeion_natal(
    date: &str,
    time: &str,
    lat: f32,
    lon: f32,
) -> Result<KerykeionResult, String> {
    let python_script = format!(
        r#"
import json, sys
try:
    from kerykeion import AstrologicalSubject
except ImportError:
    print(json.dumps({{"error": "kerykeion not installed"}}))
    sys.exit(1)

parts = "{date}".split("-")
year, month, day = int(parts[0]), int(parts[1]), int(parts[2])
time_parts = "{time}".split(":")
hour, minute = int(time_parts[0]), int(time_parts[1]) if len(time_parts) > 1 else 0

subject = AstrologicalSubject("nara", year, month, day, hour, minute, lat={lat}, lng={lon})

planets = []
planet_names = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"]
planet_ids = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]  # canonical mod-10: Sun=0..Pluto=9

for i, name in enumerate(planet_names):
    p = getattr(subject, name, None)
    if p:
        planets.append({{
            "planet_id": planet_ids[i],
            "degree": p.abs_pos if hasattr(p, 'abs_pos') else p.position,
            "degree_anchor": 0,
            "retrograde": getattr(p, 'retrograde', False)
        }})

# Dominant element from sun sign
element_map = {{"Fire": 2, "Earth": 4, "Air": 1, "Water": 3}}
dom_elem = element_map.get(getattr(subject.sun, 'element', 'Fire'), 2)

# Sun sign index (0-11)
sign_names = ["Ari","Tau","Gem","Can","Leo","Vir","Lib","Sco","Sag","Cap","Aqu","Pis"]
dom_sign = 0
for i, s in enumerate(sign_names):
    if hasattr(subject.sun, 'sign') and s in str(subject.sun.sign)[:3]:
        dom_sign = i
        break

# Active decan from sun degree (0-35)
sun_deg = subject.sun.abs_pos if hasattr(subject.sun, 'abs_pos') else subject.sun.position
active_decan = int(sun_deg / 10) % 36

# Active tattva (simplified: element-based)
tattva_from_elem = {{2: 0, 4: 1, 1: 2, 3: 3, 0: 4}}
active_tattva = tattva_from_elem.get(dom_elem, 0)

result = {{
    "planets": planets,
    "dominant_sign": dom_sign,
    "dominant_element": dom_elem,
    "active_decan": active_decan,
    "active_tattva": active_tattva
}}
print(json.dumps(result))
"#
    );

    let output = Command::new("python3")
        .args(["-c", &python_script])
        .output()
        .map_err(|e| format!("kairos: python3 unavailable: {e}"))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("kairos: python3/kerykeion error: {stderr}"));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let raw: serde_json::Value = serde_json::from_str(&stdout)
        .map_err(|e| format!("kairos: invalid JSON from kerykeion: {e}"))?;

    if let Some(err) = raw.get("error") {
        return Err(format!(
            "kairos: {}",
            err.as_str().unwrap_or("unknown error")
        ));
    }

    // Parse planets with degree_anchor mapping
    let mut result: KerykeionResult =
        serde_json::from_value(raw).map_err(|e| format!("kairos: parse error: {e}"))?;

    // Apply degree anchor mapping
    for p in &mut result.planets {
        p.degree_anchor = longitude_to_anchor_natal(p.degree);
    }

    Ok(result)
}

/// Current transit computation (date only, no birth data)
pub fn run_kerykeion_current(date: &str) -> Result<KerykeionResult, String> {
    // For current transits, use a default location (Greenwich)
    run_kerykeion_natal(date, "12:00", 51.4772, 0.0)
}

/// Natal: day phase only (explicate, 0-359)
pub fn longitude_to_anchor_natal(lon: f32) -> u16 {
    (lon.round() as u16) % 360
}

/// Live: check if SU(2) implicate applies (retrograde)
pub fn longitude_to_anchor_live(lon: f32, retrograde: bool) -> u16 {
    let base = (lon.round() as u16) % 360;
    if retrograde {
        base + 360
    } else {
        base
    }
}

/// Path to kairos state files
pub fn kairos_dir() -> PathBuf {
    super::identity::nara_home().join("kairos")
}

/// Convert a `KerykeionResult` (from kerykeion Python output) into a `KairosState`
/// usable by the portal clock.  `planet_id` is the canonical mod-10 index
/// (Sun=0 … Pluto=9).  Missing planets are left as degree=0xFFFF (sentinel).
///
/// Canonical mod-10 ordering — spec: 00-canonical-invariants §2
pub fn kerykeion_result_to_kairos_state(result: &KerykeionResult) -> KairosState {
    let mut planets: [PlanetState; 10] = std::array::from_fn(|_| PlanetState {
        degree: 0xFFFF,
        ..Default::default()
    });
    for pos in &result.planets {
        let idx = pos.planet_id as usize;
        if idx < 10 {
            planets[idx] = PlanetState {
                degree: (pos.degree as u32 % 360) as u16,
                ..Default::default()
            };
        }
    }
    KairosState {
        planets,
        valid: true,
        ..Default::default()
    }
}

/// Load current kairos state from cache
pub fn load_current() -> Result<Option<KerykeionResult>, String> {
    let path = kairos_dir().join("current.json");
    if !path.exists() {
        return Ok(None);
    }
    let data = std::fs::read_to_string(&path).map_err(|e| format!("kairos: read error: {e}"))?;
    serde_json::from_str(&data)
        .map(Some)
        .map_err(|e| format!("kairos: parse error: {e}"))
}

/// Save kairos state to cache
pub fn save_current(result: &KerykeionResult) -> Result<(), String> {
    let dir = kairos_dir();
    std::fs::create_dir_all(&dir).map_err(|e| format!("kairos: create dir error: {e}"))?;
    let path = dir.join("current.json");
    let data = serde_json::to_string_pretty(result)
        .map_err(|e| format!("kairos: serialize error: {e}"))?;
    std::fs::write(&path, data).map_err(|e| format!("kairos: write error: {e}"))
}

/// Check if kairos state is fresh (less than 24h old)
pub fn is_current_fresh() -> bool {
    let path = kairos_dir().join("current.json");
    if let Ok(meta) = std::fs::metadata(&path) {
        if let Ok(modified) = meta.modified() {
            if let Ok(elapsed) = modified.elapsed() {
                return elapsed.as_secs() < 86400;
            }
        }
    }
    false
}

/// Temporal authority check — HARD error if kairos unavailable
pub fn require_temporal_authority() -> Result<KerykeionResult, String> {
    if !is_current_fresh() {
        return Err("temporal authority unavailable: run 'epi nara kairos sync' first".to_string());
    }
    load_current()?.ok_or_else(|| {
        "temporal authority unavailable: run 'epi nara kairos sync' first".to_string()
    })
}

/// CLI: epi nara kairos [--json] [--planets]
pub fn show(json: bool, planets: bool) -> Result<String, String> {
    let result =
        load_current()?.ok_or("No kairos state. Run 'epi nara wind' or 'epi nara kairos sync'.")?;

    if json {
        return serde_json::to_string_pretty(&result).map_err(|e| e.to_string());
    }

    let mut out = String::new();
    out.push_str("Kairos Temporal State\n");
    out.push_str(&format!("  Active decan: {}\n", result.active_decan));
    out.push_str(&format!(
        "  Dominant element: {}\n",
        result.dominant_element
    ));
    out.push_str(&format!("  Dominant sign: {}\n", result.dominant_sign));
    out.push_str(&format!("  Active tattva: {}\n", result.active_tattva));

    if planets {
        out.push_str("  Planets:\n");
        let names = [
            "Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune",
            "Pluto",
        ];
        for p in &result.planets {
            let name = names.get(p.planet_id as usize).unwrap_or(&"?");
            out.push_str(&format!(
                "    {} — {:.2} anchor:{} {}\n",
                name,
                p.degree,
                p.degree_anchor,
                if p.retrograde { "(R)" } else { "" }
            ));
        }
    }

    Ok(out)
}

/// CLI: epi nara kairos sync
pub fn sync_current() -> Result<String, String> {
    let today = chrono::Utc::now().format("%Y-%m-%d").to_string();
    let result = run_kerykeion_current(&today)?;
    save_current(&result)?;
    Ok(format!(
        "Kairos synced for {today}: decan={}, element={}",
        result.active_decan, result.dominant_element
    ))
}

/// Parse kerykeion JSON output into a canonical KairosState with mod-10 planet ordering.
/// The JSON is expected to have a `planets` array where each planet has a `name` string
/// and a `degree` (or similar) float.
/// Returns Err if JSON is invalid or missing required fields.
pub fn parse_kerykeion_to_kairos_state(json: &str) -> Result<KairosState, String> {
    use serde_json::Value;
    let v: Value = serde_json::from_str(json).map_err(|e| e.to_string())?;

    let mut planets = std::array::from_fn(|_| PlanetState {
        degree: 0xFFFF,
        ..Default::default()
    });

    if let Some(arr) = v.get("planets").and_then(|p| p.as_array()) {
        for planet in arr {
            let name = planet.get("name")
                .or_else(|| planet.get("planet_name"))
                .and_then(|n| n.as_str())
                .unwrap_or("");

            let degree_f = planet.get("degree")
                .or_else(|| planet.get("abs_pos"))
                .and_then(|d| d.as_f64())
                .unwrap_or(-1.0) as f32;

            let retrograde = planet.get("retrograde")
                .or_else(|| planet.get("is_retrograde"))
                .and_then(|r| r.as_bool())
                .unwrap_or(false);

            let idx = match name.to_lowercase().trim_start_matches("the ") {
                "sun"     => Some(0usize),
                "moon"    => Some(1),
                "mercury" => Some(2),
                "venus"   => Some(3),
                "mars"    => Some(4),
                "jupiter" => Some(5),
                "saturn"  => Some(6),
                "uranus"  => Some(7),
                "neptune" => Some(8),
                "pluto"   => Some(9),
                _         => None,
            };

            if let Some(i) = idx {
                if degree_f >= 0.0 {
                    planets[i].degree = degree_f as u16;
                    planets[i].is_retrograde = retrograde;
                }
            }
        }
    }

    Ok(KairosState {
        planets,
        valid: true,
        ..Default::default()
    })
}

#[cfg(test)]
mod kairos_parse_tests {
    use super::*;

    #[test]
    fn parse_kerykeion_places_sun_at_index_0() {
        let json = r#"{"planets":[{"name":"Sun","degree":247.5},{"name":"Moon","degree":33.2}]}"#;
        let state = parse_kerykeion_to_kairos_state(json).unwrap();
        assert_eq!(state.planets[0].degree, 247u16);
        assert_eq!(state.planets[1].degree, 33u16);
        assert_eq!(state.planets[2].degree, 0xFFFF); // Mercury unavailable
    }

    #[test]
    fn parse_kerykeion_canonical_mod10_all_planets() {
        let json = r#"{"planets":[
            {"name":"Sun","degree":10.0},
            {"name":"Moon","degree":20.0},
            {"name":"Mercury","degree":30.0},
            {"name":"Venus","degree":40.0},
            {"name":"Mars","degree":50.0},
            {"name":"Jupiter","degree":60.0},
            {"name":"Saturn","degree":70.0},
            {"name":"Uranus","degree":80.0},
            {"name":"Neptune","degree":90.0},
            {"name":"Pluto","degree":100.0}
        ]}"#;
        let state = parse_kerykeion_to_kairos_state(json).unwrap();
        assert_eq!(state.planets[0].degree, 10);  // Sun
        assert_eq!(state.planets[7].degree, 80);  // Uranus at index 7, not 8
        assert_eq!(state.planets[9].degree, 100); // Pluto at index 9
        assert!(state.valid);
    }

    #[test]
    fn parse_kerykeion_invalid_json_returns_err() {
        assert!(parse_kerykeion_to_kairos_state("not json").is_err());
    }
}
