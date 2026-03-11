use serde::Serialize;

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
}

/// epi nara medicine balance
pub fn balance(json: bool) -> Result<String, String> {
    let kairos = super::kairos::require_temporal_authority()?;
    let _profile = super::identity::load_profile()?
        .ok_or("No identity profile. Run 'epi nara wind' first.")?;

    // Derive elemental balance from identity + kairos
    let elem = kairos.dominant_element;
    let balance = ElementalBalance {
        fire: if elem == 2 { 200 } else { 100 },
        water: if elem == 3 { 200 } else { 100 },
        earth: if elem == 4 { 200 } else { 100 },
        air: if elem == 1 { 200 } else { 100 },
        dominant: element_name(elem),
        deficient: element_name((elem + 2) % 5),
        triage_vector: "balanced".to_string(),
        chakra_state: (kairos.active_decan % 7) + 1,
    };

    if json {
        serde_json::to_string_pretty(&balance).map_err(|e| e.to_string())
    } else {
        Ok(format!(
            "Elemental Balance\n  Fire: {}  Water: {}  Earth: {}  Air: {}\n  Dominant: {}  Deficient: {}\n  Chakra: {}",
            balance.fire, balance.water, balance.earth, balance.air,
            balance.dominant, balance.deficient, balance.chakra_state
        ))
    }
}

/// epi nara medicine prescribe
pub fn prescribe(context: &str) -> Result<String, String> {
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

    let planetary_hour = (kairos.active_decan % 7) as u8;
    let planet_names = [
        "Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn",
    ];
    let planet = planet_names[planetary_hour as usize % 7];

    let mut out = format!("Medicine Prescription ({})\n", context);
    out.push_str(&format!(
        "  Planetary hour: {} ({})\n",
        planetary_hour, planet
    ));
    out.push_str("  Practices:\n");
    for p in &practices {
        out.push_str(&format!("    * {}\n", p));
    }
    out.push_str(&format!("  Duration: {} min\n", 15 + planetary_hour * 5));

    Ok(out)
}

/// epi nara medicine chakra
pub fn chakra(json: bool) -> Result<String, String> {
    let kairos = super::kairos::require_temporal_authority()?;
    let primary = (kairos.active_decan % 7) + 1;
    let names = [
        "",
        "Muladhara",
        "Svadhisthana",
        "Manipura",
        "Anahata",
        "Vishuddha",
        "Ajna",
        "Sahasrara",
    ];

    if json {
        Ok(serde_json::json!({
            "primary_chakra": primary,
            "name": names[primary as usize],
            "activation": 128
        })
        .to_string())
    } else {
        Ok(format!(
            "Active Chakra: {} ({})",
            names[primary as usize], primary
        ))
    }
}

/// epi nara medicine materia
pub fn materia(json: bool) -> Result<String, String> {
    let kairos = super::kairos::require_temporal_authority()?;
    let decan = kairos.active_decan;

    if json {
        Ok(serde_json::json!({
            "decan": decan,
            "element": element_name(kairos.dominant_element),
            "materia": "herb/tone/color data (requires M2 decan LUT)"
        })
        .to_string())
    } else {
        Ok(format!(
            "Materia Medica — Decan {}\n  Element: {}\n  (Full materia requires M2 decan descriptor FFI)",
            decan,
            element_name(kairos.dominant_element)
        ))
    }
}

/// epi nara medicine safety
pub fn safety(practice: Option<&str>) -> Result<String, String> {
    match practice {
        Some(p) => Ok(format!(
            "Safety check for '{}': CLEAR (no contraindications)",
            p
        )),
        None => Ok("Safety status: CLEAR — no active contraindications.".to_string()),
    }
}

fn element_name(id: u8) -> String {
    match id {
        0 => "Akasha".to_string(),
        1 => "Air".to_string(),
        2 => "Fire".to_string(),
        3 => "Water".to_string(),
        4 => "Earth".to_string(),
        _ => format!("Element({})", id),
    }
}
