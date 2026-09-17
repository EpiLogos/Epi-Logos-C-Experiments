use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PhaseQualifiedCoordinate {
    pub raw: String,
    pub family: String,
    pub position: String,
    pub phase: String,
    pub handle: String,
}

pub fn resolve_phase_qualified_coordinate(coord: &str) -> Result<PhaseQualifiedCoordinate, String> {
    let raw = coord.trim();
    if raw.is_empty() {
        return Err("coordinate is required".to_owned());
    }

    if let Some(parsed) = parse_property_coordinate(raw) {
        return Ok(parsed);
    }

    let mut chars = raw.chars();
    let family = chars
        .next()
        .ok_or_else(|| "coordinate is required".to_owned())?;
    if !matches!(family, 'C' | 'P' | 'L' | 'S' | 'T' | 'M') {
        return Err(format!("unsupported coordinate family `{family}`"));
    }

    let rest: String = chars.collect();
    let (position, phase) = if let Some(stripped) = rest.strip_prefix('\'') {
        (stripped.to_owned(), "prime")
    } else if let Some(stripped) = rest.strip_suffix('\'') {
        (stripped.to_owned(), "prime")
    } else {
        (rest, "direct")
    };

    Ok(PhaseQualifiedCoordinate {
        raw: raw.to_owned(),
        family: family.to_string(),
        position,
        phase: phase.to_owned(),
        handle: format!("vak://{phase}/{raw}"),
    })
}

pub fn assert_coordinate_phase_preserved(source: &str, emitted: &str) -> Result<(), String> {
    let source = resolve_phase_qualified_coordinate(source)?;
    let emitted = resolve_phase_qualified_coordinate(emitted)?;
    if source.family == emitted.family
        && source.position == emitted.position
        && source.phase != "direct"
        && emitted.phase == "direct"
    {
        return Err(format!(
            "phase-erasing coordinate emission: {} ({}) collapsed to {} ({})",
            source.raw, source.phase, emitted.raw, emitted.phase
        ));
    }
    Ok(())
}

pub fn phase_qualified_vak_token(method: &str, coord: &str) -> Result<String, String> {
    let resolved = resolve_phase_qualified_coordinate(coord)?;
    Ok(format!(
        "<vak: method=\"{}\" coord=\"{}\" phase=\"{}\" handle=\"{}({})\">",
        method, resolved.raw, resolved.phase, method, resolved.raw
    ))
}

fn parse_property_coordinate(raw: &str) -> Option<PhaseQualifiedCoordinate> {
    let parts: Vec<&str> = raw.split('_').collect();
    if parts.len() < 3 {
        return None;
    }
    let family = parts[0];
    let position = parts[1];
    if family.len() != 1 || !family.chars().all(|c| c.is_ascii_alphabetic()) {
        return None;
    }
    if !position.chars().all(|c| c.is_ascii_digit()) {
        return None;
    }
    let phase = if parts.get(2) == Some(&"i") {
        "inverted_property"
    } else {
        "direct"
    };
    Some(PhaseQualifiedCoordinate {
        raw: raw.to_owned(),
        family: family.to_owned(),
        position: position.to_owned(),
        phase: phase.to_owned(),
        handle: format!("vak://{phase}/{raw}"),
    })
}
