use serde::Serialize;

use super::medicine_frame::*;

// ─── Output Structs ──────────────────────────────────────────────────────────

#[derive(Debug, Serialize)]
pub struct ElementalBalance {
    pub fire: u8,
    pub water: u8,
    pub earth: u8,
    pub air: u8,
    pub dominant: String,
    pub deficient: String,
    pub triage_vector: String,
    pub chakra_state: u8,
    pub chakra_name: String,
    pub active_decan: u8,
    pub decan_body_zone: String,
}

#[derive(Debug, Serialize)]
pub struct ChakraState {
    pub id: u8,
    pub name: String,
    pub body_zones: Vec<String>,
    pub activation: u8,
    pub planetary_ruler: String,
    pub element: String,
    pub decan: u8,
    pub decan_body_zone: String,
}

#[derive(Debug, Serialize)]
pub struct MateriaRecord {
    pub decan: u8,
    pub sign: String,
    pub planetary_ruler: String,
    pub element: String,
    pub body_zone: String,
    pub primary_herb: String,
    pub chakra_id: u8,
    pub chakra_name: String,
    pub chakra_zones: Vec<String>,
}

// ─── CLI Functions ───────────────────────────────────────────────────────────

/// epi nara medicine balance
pub fn balance(json: bool) -> Result<String, String> {
    let kairos = super::kairos::require_temporal_authority()?;
    let _profile = super::identity::load_profile()?
        .ok_or("No identity profile. Run 'epi nara wind' first.")?;

    // dominant_element arrives in medicine.rs legacy ordering (from the kairos
    // python adapter); the medicine LUTs are L2'-canonical, so convert at entry.
    let elem = canonical_from_medicine_rs_legacy(kairos.dominant_element);
    let _sign = kairos.dominant_sign as usize;
    let decan = kairos.active_decan;

    // Derive elemental scores from sign distribution across planets.
    // Count how many planets occupy fire/earth/air/water signs.
    let mut fire_count: u8 = 0;
    let mut earth_count: u8 = 0;
    let mut air_count: u8 = 0;
    let mut water_count: u8 = 0;

    for planet in &kairos.planets {
        // Each planet has degree 0-360; sign = degree/30
        let p_sign = ((planet.degree / 30.0) as usize).min(11);
        let p_elem = SIGN_ELEMENT[p_sign]; // L2' canonical
        match p_elem {
            4 => fire_count = fire_count.saturating_add(30), // Fire
            1 => earth_count = earth_count.saturating_add(30), // Earth
            3 => air_count = air_count.saturating_add(30),   // Air
            2 => water_count = water_count.saturating_add(30), // Water
            _ => {}
        }
    }

    // If no planet data, fall back to dominant element emphasis
    if fire_count == 0 && earth_count == 0 && air_count == 0 && water_count == 0 {
        fire_count = 100;
        earth_count = 100;
        air_count = 100;
        water_count = 100;
        match elem {
            4 => fire_count = 200,  // Fire
            1 => earth_count = 200, // Earth
            3 => air_count = 200,   // Air
            2 => water_count = 200, // Water
            _ => {}
        }
    }

    // Deficient = elemental complement of the dominant (L2' canonical IDs).
    let deficient_elem = match elem {
        4 => 2u8, // Fire dominant → Water deficient
        2 => 4u8, // Water dominant → Fire deficient
        3 => 1u8, // Air dominant → Earth deficient
        1 => 3u8, // Earth dominant → Air deficient
        0 => 5u8, // Aether ↔ Salt (Möbius complement within L2')
        5 => 0u8,
        _ => 0u8,
    };

    let chakra_id = chakra_for_element(elem);
    let chakra_nm = chakra_name(chakra_id);

    // Triage: if dominant element matches active decan element (via canonical struct), "resonant"
    let decan_elem = zodiac_decan(decan).map(|d| d.element).unwrap_or(elem);
    let triage = if decan_elem == elem {
        "resonant — decan amplifies dominant element"
    } else {
        "bridging — decan provides elemental contrast"
    };

    let bal = ElementalBalance {
        fire: fire_count,
        water: water_count,
        earth: earth_count,
        air: air_count,
        dominant: element_name(elem),
        deficient: element_name(deficient_elem),
        triage_vector: triage.to_string(),
        chakra_state: chakra_id,
        chakra_name: chakra_nm.to_string(),
        active_decan: decan,
        decan_body_zone: body_zones_for_decan(decan).to_string(),
    };

    if json {
        serde_json::to_string_pretty(&bal).map_err(|e| e.to_string())
    } else {
        Ok(format!(
            "Elemental Balance\n\
             \x20 Fire: {fire}  Water: {water}  Earth: {earth}  Air: {air}\n\
             \x20 Dominant: {dom}  Deficient: {def}\n\
             \x20 Triage: {triage}\n\
             \x20 Chakra: {cname} (id={cid})\n\
             \x20 Active decan {decan}: {zone}",
            fire = bal.fire,
            water = bal.water,
            earth = bal.earth,
            air = bal.air,
            dom = bal.dominant,
            def = bal.deficient,
            triage = bal.triage_vector,
            cname = bal.chakra_name,
            cid = bal.chakra_state,
            decan = decan,
            zone = bal.decan_body_zone,
        ))
    }
}

/// epi nara medicine prescribe
/// Compute a medicine prescription grounded in the current kairos state.
///
/// `context`: practise context ("morning" | "evening" | "integration" | "crisis" | anything).
/// `is_shadow`: when `true`, the oracle payload phase = 1 (implicate/reversed). In shadow pole
///   the decan body zone annotation shifts to its `reversedMeaning` — the contra-indication /
///   shadow emphasis rather than the primary therapeutic direction. This flag MUST come from
///   `OraclePayload.phase` so the medicine chain is downstream of the oracle cast, not derived
///   independently.
///
/// Canonical data path:
///   OraclePayload.degree → decan (via degree/10)
///   OraclePayload.phase  → is_shadow (shadow pole annotation)
///   kairos.active_decan  → decan ruler, body zones, herbs (when no payload degree available)
pub fn prescribe(context: &str, is_shadow: bool) -> Result<String, String> {
    let kairos = super::kairos::require_temporal_authority()?;

    let practices: Vec<&str> = match context {
        "morning" => vec!["breathwork (4-7-8)", "sun salutation", "journaling"],
        "evening" => vec!["body scan", "gratitude practice", "dream incubation"],
        "integration" => vec![
            "walking meditation",
            "creative expression",
            "dialogical inquiry",
        ],
        "crisis" => vec![
            "grounding (5-4-3-2-1)",
            "cold water contact",
            "bilateral stimulation",
        ],
        _ => vec!["mindful breathing", "body awareness", "reflective writing"],
    };

    let decan = kairos.active_decan;
    let body_zone = body_zones_for_decan(decan);
    let herb = herb_for_decan(decan);
    let elem = canonical_from_medicine_rs_legacy(kairos.dominant_element);

    // Ruling planet: Chaldean decan ruler from ZODIAC_DECAN_TABLE (canonical).
    // This is the true decan ruler per GD/Thoth Chaldean assignment, not an approximation.
    let ruling_planet_id = zodiac_decan(decan).map(|d| d.ruling_planet).unwrap_or(0);

    let planet_nm = planet_name(ruling_planet_id);
    let ruling_chakra = PLANET_CHAKRA
        .get(ruling_planet_id as usize)
        .copied()
        .unwrap_or(0);

    let duration_min = 15u32 + (ruling_chakra as u32 * 5);

    // Shadow pole annotation: when is_shadow=true (OraclePayload.phase == 1),
    // the body zone reading shifts to reversedMeaning — the contra-indication /
    // shadow emphasis. This is the #2-3 → #3-4 reversedMeaning path per
    // CLOCK-AND-NARA-SPECS/13-shadow-decans-rotational-states.
    let shadow_note = if is_shadow {
        " [shadow pole — reversedMeaning active]"
    } else {
        ""
    };

    let mut out = format!("Medicine Prescription ({}){}\n", context, shadow_note);
    out.push_str(&format!(
        "\x20 Decan {}: {}{}\n",
        decan,
        body_zone,
        if is_shadow {
            " ⟵ shadow emphasis"
        } else {
            ""
        },
    ));
    out.push_str(&format!(
        "\x20 Element: {}  Planetary ruler: {} → {}\n",
        element_name(elem),
        planet_nm,
        chakra_name(ruling_chakra),
    ));
    out.push_str(&format!("\x20 Primary materia: {}\n", herb));
    if is_shadow {
        out.push_str(
            "\x20 Shadow note: Work WITH the contra-indicated zone; integrate rather than avoid.\n",
        );
    }
    out.push_str("\x20 Practices:\n");
    for p in &practices {
        out.push_str(&format!("    * {}\n", p));
    }
    out.push_str(&format!("\x20 Duration: {} min\n", duration_min));

    Ok(out)
}

/// epi nara medicine chakra
pub fn chakra(json: bool) -> Result<String, String> {
    let kairos = super::kairos::require_temporal_authority()?;

    // Primary chakra from dominant element (convert legacy → L2' canonical)
    let elem = canonical_from_medicine_rs_legacy(kairos.dominant_element);
    let primary_id = chakra_for_element(elem);
    let primary_nm = chakra_name(primary_id);

    // Secondary: chakra from active decan's Chaldean ruling planet (via ZODIAC_DECAN_TABLE).
    // Canonical path: decan → ruling_planet → PLANET_CHAKRA.
    let decan = kairos.active_decan;
    let decan_chakra = zodiac_decan(decan)
        .map(|d| {
            PLANET_CHAKRA
                .get(d.ruling_planet as usize)
                .copied()
                .unwrap_or(0)
        })
        .unwrap_or(0);

    // Activation level: 255 if primary == decan chakra (resonant), else 128
    let activation: u8 = if primary_id == decan_chakra { 255 } else { 192 };

    let zones: Vec<String> = body_zones_for_chakra(primary_id)
        .iter()
        .map(|s| s.to_string())
        .collect();

    // Planet whose chakra is primary
    let ruling_planet = PLANET_CHAKRA
        .iter()
        .position(|&c| c == primary_id)
        .map(|i| planet_name(i as u8))
        .unwrap_or("None");

    if json {
        let state = ChakraState {
            id: primary_id,
            name: primary_nm.to_string(),
            body_zones: zones,
            activation,
            planetary_ruler: ruling_planet.to_string(),
            element: element_name(elem),
            decan,
            decan_body_zone: body_zones_for_decan(decan).to_string(),
        };
        serde_json::to_string_pretty(&state).map_err(|e| e.to_string())
    } else {
        let zones_display: Vec<String> = body_zones_for_chakra(primary_id)
            .iter()
            .map(|s| s.to_string())
            .collect();
        Ok(format!(
            "Active Chakra: {} (id={}, activation={})\n\
             \x20 Element: {}  Planetary ruler: {}\n\
             \x20 Body zones: {}\n\
             \x20 Active decan {}: {}",
            primary_nm,
            primary_id,
            activation,
            element_name(elem),
            ruling_planet,
            zones_display.join(", "),
            decan,
            body_zones_for_decan(decan),
        ))
    }
}

/// epi nara medicine materia
pub fn materia(json: bool) -> Result<String, String> {
    let kairos = super::kairos::require_temporal_authority()?;
    let decan = kairos.active_decan;

    // All data from the canonical M0→M1→M2 struct — no ad-hoc derivations.
    let entry = zodiac_decan(decan).ok_or_else(|| format!("Invalid decan index: {}", decan))?;

    let sign_names = [
        "Aries",
        "Taurus",
        "Gemini",
        "Cancer",
        "Leo",
        "Virgo",
        "Libra",
        "Scorpio",
        "Sagittarius",
        "Capricorn",
        "Aquarius",
        "Pisces",
    ];
    let sign = sign_names.get(entry.sign as usize).copied().unwrap_or("?");
    let ruler = planet_name(entry.ruling_planet);
    let mode = MODE_NAMES.get(entry.mode as usize).copied().unwrap_or("?");

    // Canonical path: decan ruling_planet → PLANET_CHAKRA → chakra zones
    let chakra_id = PLANET_CHAKRA
        .get(entry.ruling_planet as usize)
        .copied()
        .unwrap_or(0);
    let chakra_nm = chakra_name(chakra_id);
    let chakra_zones: Vec<String> = body_zones_for_chakra(chakra_id)
        .iter()
        .map(|s| s.to_string())
        .collect();

    if json {
        let rec = MateriaRecord {
            decan,
            sign: sign.to_string(),
            planetary_ruler: ruler.to_string(),
            element: element_name(entry.element),
            body_zone: entry.body_part.to_string(),
            primary_herb: entry.herb.to_string(),
            chakra_id,
            chakra_name: chakra_nm.to_string(),
            chakra_zones,
        };
        serde_json::to_string_pretty(&rec).map_err(|e| e.to_string())
    } else {
        Ok(format!(
            "Materia Medica — Decan {} ({} {} / {}, ananda={})\n\
             \x20 Body zone: {}\n\
             \x20 Primary herb: {}\n\
             \x20 Element: {}  Mode: {}  Ruler: {}\n\
             \x20 Chakra: {} (id={})\n\
             \x20 Chakra zones: {}",
            decan,
            sign,
            entry.decan_in_sign + 1,
            mode,
            entry.ananda_harmonic,
            entry.body_part,
            entry.herb,
            element_name(entry.element),
            mode,
            ruler,
            chakra_nm,
            chakra_id,
            body_zones_for_chakra(chakra_id).join(", "),
        ))
    }
}
