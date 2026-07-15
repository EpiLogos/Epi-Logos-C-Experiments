//! Coordinate: S0/M4' (local Kairos adapter)
//! Residency: Body/S/S0/epi-cli/src/nara
//! Position (#n): S0 process/filesystem membrane for M4' temporal ingress
//! Actualises: local Kerykeion dependency probing, current-sky computation,
//!   cache persistence, and canonical ten-planet Kairos projection.
//! Public surface: KerykeionProbe, probe_kerykeion, sync/load/capture helpers.
//! Does NOT own: onboarding preferences, gateway routing, natal identity law,
//!   or the M4 temporal model.
//! Contract: [[S0-SPEC]] / [[M4'-SPEC]] / [[M'-AMBIENT-EPIGENETIC-TRANSFORM-SPEC]].

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

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KerykeionProbe {
    pub dependency: String,
    pub available: bool,
    pub python_available: bool,
    pub version: Option<String>,
    pub reason: Option<String>,
}

/// Probe the local Python dependency only. This never reads PASU or computes a
/// natal/current chart; onboarding can therefore ask for informed opt-in
/// without crossing the M4 identity boundary.
pub fn probe_kerykeion() -> KerykeionProbe {
    let script = r#"
import json
try:
    import kerykeion
    try:
        from importlib.metadata import version
        package_version = version("kerykeion")
    except Exception:
        package_version = getattr(kerykeion, "__version__", None)
    print(json.dumps({"available": True, "version": package_version, "reason": None}))
except Exception as error:
    print(json.dumps({"available": False, "version": None, "reason": str(error)}))
"#;

    let output = match Command::new("python3").args(["-c", script]).output() {
        Ok(output) => output,
        Err(error) => {
            return KerykeionProbe {
                dependency: "kerykeion".to_owned(),
                available: false,
                python_available: false,
                version: None,
                reason: Some(format!("python3 unavailable: {error}")),
            };
        }
    };

    if !output.status.success() {
        return KerykeionProbe {
            dependency: "kerykeion".to_owned(),
            available: false,
            python_available: true,
            version: None,
            reason: Some(String::from_utf8_lossy(&output.stderr).trim().to_owned()),
        };
    }

    let raw: serde_json::Value = match serde_json::from_slice(&output.stdout) {
        Ok(raw) => raw,
        Err(error) => {
            return KerykeionProbe {
                dependency: "kerykeion".to_owned(),
                available: false,
                python_available: true,
                version: None,
                reason: Some(format!("invalid Kerykeion probe response: {error}")),
            };
        }
    };

    KerykeionProbe {
        dependency: "kerykeion".to_owned(),
        available: raw
            .get("available")
            .and_then(serde_json::Value::as_bool)
            .unwrap_or(false),
        python_available: true,
        version: raw
            .get("version")
            .and_then(serde_json::Value::as_str)
            .map(ToOwned::to_owned),
        reason: raw
            .get("reason")
            .and_then(serde_json::Value::as_str)
            .map(ToOwned::to_owned),
    }
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
            let name = planet
                .get("name")
                .or_else(|| planet.get("planet_name"))
                .and_then(|n| n.as_str())
                .unwrap_or("");

            let degree_f = planet
                .get("degree")
                .or_else(|| planet.get("abs_pos"))
                .and_then(|d| d.as_f64())
                .unwrap_or(-1.0) as f32;

            let retrograde = planet
                .get("retrograde")
                .or_else(|| planet.get("is_retrograde"))
                .and_then(|r| r.as_bool())
                .unwrap_or(false);

            let idx = match name.to_lowercase().trim_start_matches("the ") {
                "sun" => Some(0usize),
                "moon" => Some(1),
                "mercury" => Some(2),
                "venus" => Some(3),
                "mars" => Some(4),
                "jupiter" => Some(5),
                "saturn" => Some(6),
                "uranus" => Some(7),
                "neptune" => Some(8),
                "pluto" => Some(9),
                _ => None,
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

/// Pure mapper: `KerykeionResult` → the ten canonical transit degrees
/// (Sun=0 … Pluto=9, ecliptic 0.0-360.0, fractional precision preserved).
/// Returns `Some` ONLY when all ten planets are present with finite degrees —
/// partial skies are refused rather than padded (honest `kairos_valid` law,
/// cosmic-clock §5.3).
pub fn planet_degrees_from_result(result: &KerykeionResult) -> Option<[f32; 10]> {
    let mut degrees = [f32::NAN; 10];
    for p in &result.planets {
        if let Some(slot) = degrees.get_mut(p.planet_id as usize) {
            if p.degree.is_finite() {
                *slot = p.degree.rem_euclid(360.0);
            }
        }
    }
    degrees.iter().all(|d| d.is_finite()).then_some(degrees)
}

/// Gated read for the S3 profile heartbeat: `Some` only when the kairos cache
/// is fresh (<24h) AND the sky is complete. Absence IS the "kairos pending"
/// state the renderers display; stale or partial data never reaches the
/// shared profile. Returns the canonical degrees plus per-planet retrograde
/// flags (both feed the profile's `planetDegrees` / `livePlanets` fields).
pub fn heartbeat_live_sky() -> Option<([f32; 10], [bool; 10])> {
    if !is_current_fresh() {
        return None;
    }
    let result = load_current().ok().flatten()?;
    let degrees = planet_degrees_from_result(&result)?;
    let mut retrograde = [false; 10];
    for p in &result.planets {
        if let Some(slot) = retrograde.get_mut(p.planet_id as usize) {
            *slot = p.retrograde;
        }
    }
    Some((degrees, retrograde))
}

/// Kairotic consultation window: 4 hours (mirrors the kernel
/// `M4_KAIROTIC_DEFAULT_TTL_NS`). After it, a captured kairotic sky decays back
/// to the daily realtime transit.
pub const KAIROTIC_TTL_SECS: u64 = 4 * 3600;

/// A captured oracle-consultation sky with its decay window. Distinct from the
/// daily `current.json` transit: this is the real sky at the moment of a
/// consultation, and it preempts realtime until it decays.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KairoticCapture {
    pub result: KerykeionResult,
    pub captured_at_epoch: u64, // unix seconds
    pub decays_at_epoch: u64,   // captured_at + KAIROTIC_TTL_SECS
}

/// Pure decay check (server-side mirror of the kernel `m4_planet_degrees_live_at`
/// deadline branch): a capture is live iff `now_epoch < decays_at_epoch`.
pub fn kairotic_is_live(now_epoch: u64, decays_at_epoch: u64) -> bool {
    now_epoch < decays_at_epoch
}

/// Capture the live sky at THIS moment as a kairotic (oracle-consultation) frame:
/// run kerykeion for the current datetime, stamp `captured_at` + `decays_at`
/// (=+4h), and persist to `kairotic.json`. This is what arms the kairotic tier
/// the kernel (`m4_temporal_now_capture_kairotic`) and the heartbeat preempt
/// realtime with. (Greenwich reference location as the daily transit uses;
/// PASU-location refinement is a follow-up.)
pub fn capture_kairotic() -> Result<String, String> {
    let now = chrono::Utc::now();
    let date = now.format("%Y-%m-%d").to_string();
    let time = now.format("%H:%M").to_string();
    let result = run_kerykeion_natal(&date, &time, 51.4772, 0.0)?;
    let captured_at_epoch = now.timestamp().max(0) as u64;
    let capture = KairoticCapture {
        result,
        captured_at_epoch,
        decays_at_epoch: captured_at_epoch + KAIROTIC_TTL_SECS,
    };
    let dir = kairos_dir();
    std::fs::create_dir_all(&dir).map_err(|e| format!("kairos: create dir error: {e}"))?;
    let path = dir.join("kairotic.json");
    let data = serde_json::to_string_pretty(&capture)
        .map_err(|e| format!("kairos: serialize error: {e}"))?;
    std::fs::write(&path, data).map_err(|e| format!("kairos: write error: {e}"))?;
    Ok(format!(
        "kairotic frame captured at {date} {time}Z; decays in 4h"
    ))
}

/// Read a non-decayed kairotic capture, if present. Returns canonical degrees +
/// retrograde flags + the decay deadline (unix seconds). `None` when no capture
/// exists or it has passed its 4h decay — the heartbeat then falls back to the
/// realtime daily transit.
pub fn kairotic_live_sky() -> Option<([f32; 10], [bool; 10], u64)> {
    let path = kairos_dir().join("kairotic.json");
    let data = std::fs::read_to_string(&path).ok()?;
    let capture: KairoticCapture = serde_json::from_str(&data).ok()?;
    let now_epoch = chrono::Utc::now().timestamp().max(0) as u64;
    if !kairotic_is_live(now_epoch, capture.decays_at_epoch) {
        return None; // decayed -> realtime takes over
    }
    let degrees = planet_degrees_from_result(&capture.result)?;
    let mut retrograde = [false; 10];
    for p in &capture.result.planets {
        if let Some(slot) = retrograde.get_mut(p.planet_id as usize) {
            *slot = p.retrograde;
        }
    }
    Some((degrees, retrograde, capture.decays_at_epoch))
}

/// Which live-sky tier won, published on the heartbeat so the carrier can show
/// `kairotic | realtime` and revert on decay.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum KairosTier {
    /// A non-decayed oracle-consultation capture; carries its decay deadline (unix s).
    Kairotic { decays_at_epoch: u64 },
    /// The daily transit (`heartbeat_live_sky`); no decay.
    Realtime,
}

/// Resolve the live sky with kairotic-over-realtime precedence — the server-side
/// mirror of the kernel `m4_planet_degrees_live`: a fresh kairotic capture wins
/// until it decays (4h), else the daily transit. `None` = "kairos pending".
pub fn heartbeat_live_sky_tiered() -> Option<([f32; 10], [bool; 10], KairosTier)> {
    if let Some((degrees, retrograde, decays_at_epoch)) = kairotic_live_sky() {
        return Some((
            degrees,
            retrograde,
            KairosTier::Kairotic { decays_at_epoch },
        ));
    }
    let (degrees, retrograde) = heartbeat_live_sky()?;
    Some((degrees, retrograde, KairosTier::Realtime))
}

/// Load natal kairos state from cache. Returns None if no natal chart cached.
pub fn load_natal() -> Result<Option<KerykeionResult>, String> {
    let path = kairos_dir().join("natal.json");
    if !path.exists() {
        return Ok(None);
    }
    let data =
        std::fs::read_to_string(&path).map_err(|e| format!("kairos: read natal error: {e}"))?;
    serde_json::from_str(&data)
        .map(Some)
        .map_err(|e| format!("kairos: parse natal error: {e}"))
}

#[cfg(test)]
mod kairos_parse_tests {
    use super::*;

    #[test]
    fn kairotic_ttl_is_four_hours() {
        assert_eq!(KAIROTIC_TTL_SECS, 4 * 3600);
    }

    #[test]
    fn kairotic_is_live_until_decay_boundary() {
        // Server-side mirror of the kernel decay: live until now >= decays_at.
        let captured = 1_700_000_000u64;
        let decays = captured + KAIROTIC_TTL_SECS;
        assert!(kairotic_is_live(captured, decays), "live at capture");
        assert!(
            kairotic_is_live(decays - 1, decays),
            "live one sec before decay"
        );
        assert!(!kairotic_is_live(decays, decays), "decayed at the deadline");
        assert!(!kairotic_is_live(decays + 1, decays), "decayed after");
    }

    #[test]
    fn kairos_tier_carries_the_decay_deadline() {
        let tier = KairosTier::Kairotic {
            decays_at_epoch: 42,
        };
        assert_eq!(
            tier,
            KairosTier::Kairotic {
                decays_at_epoch: 42
            }
        );
        assert_ne!(tier, KairosTier::Realtime);
    }

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
        assert_eq!(state.planets[0].degree, 10); // Sun
        assert_eq!(state.planets[7].degree, 80); // Uranus at index 7, not 8
        assert_eq!(state.planets[9].degree, 100); // Pluto at index 9
        assert!(state.valid);
    }

    #[test]
    fn parse_kerykeion_invalid_json_returns_err() {
        assert!(parse_kerykeion_to_kairos_state("not json").is_err());
    }

    fn full_result() -> KerykeionResult {
        KerykeionResult {
            planets: (0u8..10)
                .map(|id| PlanetPosition {
                    planet_id: id,
                    degree: 10.25 + id as f32 * 30.0,
                    degree_anchor: 0,
                    retrograde: false,
                })
                .collect(),
            dominant_sign: 0,
            dominant_element: 2,
            active_decan: 1,
            active_tattva: 0,
        }
    }

    #[test]
    fn planet_degrees_full_sky_maps_in_canonical_order_with_fractions() {
        let degrees = planet_degrees_from_result(&full_result()).expect("complete sky");
        assert_eq!(degrees[0], 10.25); // Sun keeps fractional precision (§13.4.4)
        assert_eq!(degrees[2], 70.25); // Mercury at canonical index 2
        assert_eq!(degrees[9], 280.25); // Pluto at index 9
    }

    #[test]
    fn planet_degrees_partial_sky_is_refused_not_padded() {
        let mut result = full_result();
        result.planets.remove(4); // drop Mars
        assert_eq!(planet_degrees_from_result(&result), None);
    }

    #[test]
    fn planet_degrees_normalises_out_of_range_and_refuses_non_finite() {
        let mut result = full_result();
        result.planets[0].degree = 370.5; // wraps to 10.5
        let degrees = planet_degrees_from_result(&result).expect("finite sky");
        assert!((degrees[0] - 10.5).abs() < 1e-4);

        result.planets[1].degree = f32::NAN;
        assert_eq!(planet_degrees_from_result(&result), None);
    }
}
