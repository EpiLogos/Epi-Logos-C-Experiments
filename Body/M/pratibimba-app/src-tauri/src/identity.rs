// Coordinate: M' / M4' (personal-pole local reads — Sprint-8 E6)
// Actualises: the DR-M4-3 privacy split. The natal 10-planet distribution is
// an identity BODY: it renders on the personal pole from a LOCAL read of the
// kairos natal cache (~/.epi-logos/nara/kairos/natal.json, written by
// `epi nara kairos sync`) and NEVER crosses the S3 gateway bus — the bus
// carries only the kernel's handle summary (profile.quintessence).
// Does NOT own: identity hashing (epi-cli nara/identity.rs), kairos law.

use serde::Deserialize;
use std::path::PathBuf;

#[derive(Deserialize)]
struct NatalPlanet {
    planet_id: u8,
    degree: f32,
}

#[derive(Deserialize)]
struct NatalCache {
    planets: Vec<NatalPlanet>,
}

/// Parse the kairos natal cache into the canonical mod-10 degree array.
/// None on malformed/incomplete data — an absent natal sky is honest, never
/// padded (same complete-or-None law as the live-sky heartbeat).
pub fn parse_natal_sky(json: &str) -> Option<[f32; 10]> {
    let cache: NatalCache = serde_json::from_str(json).ok()?;
    let mut degrees = [f32::NAN; 10];
    for planet in &cache.planets {
        if planet.planet_id < 10 && planet.degree.is_finite() {
            degrees[planet.planet_id as usize] = planet.degree.rem_euclid(360.0);
        }
    }
    if degrees.iter().all(|d| d.is_finite()) {
        Some(degrees)
    } else {
        None
    }
}

fn natal_cache_path() -> PathBuf {
    dirs::home_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join(".epi-logos")
        .join("nara")
        .join("kairos")
        .join("natal.json")
}

/// The natal sky for the personal-pole ring, or null when no natal chart is
/// cached (the surface says "natal pending — anchor birth data").
#[tauri::command]
pub fn natal_sky() -> Option<[f32; 10]> {
    let json = std::fs::read_to_string(natal_cache_path()).ok()?;
    parse_natal_sky(&json)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn cache_json(count: usize) -> String {
        let planets: Vec<String> = (0..count)
            .map(|i| format!("{{\"planet_id\":{i},\"degree\":{}.5,\"degree_anchor\":0,\"retrograde\":false}}", i * 30))
            .collect();
        format!(
            "{{\"planets\":[{}],\"dominant_sign\":0,\"dominant_element\":0,\"active_decan\":0,\"active_tattva\":0}}",
            planets.join(",")
        )
    }

    #[test]
    fn complete_natal_cache_parses_with_fractional_degrees() {
        let sky = parse_natal_sky(&cache_json(10)).expect("complete sky");
        assert_eq!(sky[0], 0.5);
        assert_eq!(sky[3], 90.5); // Venus at kernel index 3
        assert_eq!(sky[9], 270.5);
    }

    #[test]
    fn partial_or_malformed_caches_are_refused_never_padded() {
        assert_eq!(parse_natal_sky(&cache_json(7)), None);
        assert_eq!(parse_natal_sky("{"), None);
        assert_eq!(parse_natal_sky("{\"planets\":[]}"), None);
    }
}
