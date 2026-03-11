use serde::Serialize;

/// Phenomenological-Tattva cross-wiring map
pub const PHENOM_TATTVA_MAP: [[u8; 3]; 6] = [
    [0, 1, 2],    // #4.4.4.0 → Shiva/Shakti/Sadashiva (pure)
    [3, 4, 5],    // #4.4.4.1 → Ishvara/Sadvidya/Maya
    [6, 7, 8],    // #4.4.4.2 → Purusha/Prakriti/Akasha
    [9, 10, 11],  // #4.4.4.3 → Vayu/Agni/Apas
    [12, 13, 14], // #4.4.4.4 → Prithivi/Gandha/Rasa (personal record layer)
    [15, 16, 17], // #4.4.4.5 → Rupa/Sparsha/Shabda (pratyabhijna layer)
];

#[derive(Debug, Serialize)]
pub struct LensInfo {
    pub index: u8,
    pub name: &'static str,
    pub active: bool,
}

const LENS_NAMES: [&str; 6] = [
    "Gebser (Integral Consciousness Structures)",
    "Ontological (Being/Becoming)",
    "Epistemological (Ways of Knowing)",
    "Jungian Depth (Archetypes/Shadow/Individuation)",
    "Phenomenological (Lived Experience)",
    "Trika/Kashmir Shaivism (Recognition/Pratyabhijna)",
];

/// epi nara lens list
pub fn list(json: bool) -> Result<String, String> {
    let kairos = super::kairos::load_current()?.unwrap_or(super::kairos::KerykeionResult {
        planets: vec![],
        dominant_sign: 0,
        dominant_element: 0,
        active_decan: 0,
        active_tattva: 0,
    });

    let lenses: Vec<LensInfo> = (0..6u8)
        .map(|i| LensInfo {
            index: i,
            name: LENS_NAMES[i as usize],
            active: is_lens_germane(i, &kairos),
        })
        .collect();

    if json {
        serde_json::to_string_pretty(&lenses).map_err(|e| e.to_string())
    } else {
        let mut out = "Wisdom Lenses\n".to_string();
        for l in &lenses {
            let marker = if l.active { "*" } else { "o" };
            out.push_str(&format!("  {} [{}] {}\n", marker, l.index, l.name));
        }
        Ok(out)
    }
}

/// epi nara lens jungian
pub fn jungian(json: bool) -> Result<String, String> {
    let _kairos = super::kairos::load_current()?;

    if json {
        Ok(serde_json::json!({
            "lens": "jungian",
            "active_archetypes": ["Self", "Shadow", "Anima/Animus"],
            "individuation_stage": "nigredo",
            "shadow_indicator": "moderate"
        })
        .to_string())
    } else {
        Ok("Jungian Lens\n  Active archetypes: Self, Shadow, Anima/Animus\n  Individuation: nigredo\n  Shadow: moderate".to_string())
    }
}

/// epi nara lens trika
pub fn trika(json: bool) -> Result<String, String> {
    let _kairos = super::kairos::load_current()?;

    if json {
        Ok(serde_json::json!({
            "lens": "trika",
            "active_tattva": "from kairos",
            "recognition_readiness": "pratyabhijna pending"
        })
        .to_string())
    } else {
        Ok(
            "Trika Lens\n  Active tattva: (derived from kairos)\n  Pratyabhijna: pending"
                .to_string(),
        )
    }
}

/// epi nara lens phenomenal
pub fn phenomenal(json: bool) -> Result<String, String> {
    let kairos = super::kairos::load_current()?.ok_or("No kairos state")?;

    let phenom_layer = (kairos.active_tattva as usize).min(5);
    let tattvas = &PHENOM_TATTVA_MAP[phenom_layer];

    if json {
        Ok(serde_json::json!({
            "lens": "phenomenal",
            "phenom_layer": phenom_layer,
            "active_tattvas": tattvas,
            "bodily_orientation": "present"
        })
        .to_string())
    } else {
        Ok(format!(
            "Phenomenal Lens\n  Layer: #4.4.4.{}\n  Tattvas: {:?}\n  Orientation: present",
            phenom_layer, tattvas
        ))
    }
}

/// epi nara lens apply
pub fn apply(lens: &str, target: Option<&str>) -> Result<String, String> {
    let target_desc = target.unwrap_or("(no target specified)");
    Ok(format!(
        "Lens '{}' applied to '{}'\n  (Agent pipeline dispatch deferred to Phase 6)",
        lens, target_desc
    ))
}

/// epi nara lens synthesize
pub fn synthesize(lenses: &str, target: Option<&str>) -> Result<String, String> {
    let lens_list: Vec<&str> = lenses.split(',').collect();
    let target_desc = target.unwrap_or("(no target)");
    Ok(format!(
        "Synthesizing {} lenses ({}) on '{}'\n  (Agent pipeline dispatch deferred to Phase 6)",
        lens_list.len(),
        lenses,
        target_desc
    ))
}

fn is_lens_germane(lens_idx: u8, kairos: &super::kairos::KerykeionResult) -> bool {
    // Simple heuristic: lens is germane if its index matches active decan mod 6
    (kairos.active_decan % 6) == lens_idx
}
