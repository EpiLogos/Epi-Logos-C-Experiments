use crate::{
    coordinate_prefix_family_spec, node_property_spec, relationship_property_spec,
    COORDINATE_PROPERTY, NODE_PROPERTY_SPECS, RELATIONSHIP_PROPERTY_SPECS,
};

pub fn coordinate_prefix_property_key(
    prefix: &str,
    position: u8,
    semantic_suffix: &str,
) -> Result<String, String> {
    coordinate_prefix_property_key_for_axis(prefix, position, false, semantic_suffix)
}

pub fn coordinate_prefix_property_key_for_axis(
    prefix: &str,
    position: u8,
    inverted: bool,
    semantic_suffix: &str,
) -> Result<String, String> {
    coordinate_prefix_family_spec(prefix)
        .ok_or_else(|| format!("unsupported coordinate-prefix property family: {prefix}"))?;
    if position > 5 {
        return Err(format!(
            "coordinate-prefix property has invalid position: {prefix}_{position}_{semantic_suffix}"
        ));
    }
    if semantic_suffix.is_empty()
        || semantic_suffix.split('_').any(|part| {
            part.is_empty()
                || !part
                    .chars()
                    .all(|ch| ch.is_ascii_lowercase() || ch.is_ascii_digit())
        })
    {
        return Err(format!(
            "coordinate-prefix property missing semantic suffix: {prefix}_{position}_{semantic_suffix}"
        ));
    }

    let key = if inverted {
        format!("{prefix}_{position}_i_{semantic_suffix}")
    } else {
        format!("{prefix}_{position}_{semantic_suffix}")
    };
    validate_coordinate_prefix_property(&key)?;
    Ok(key)
}

pub fn canonical_property_key(key: &str) -> Result<&'static str, String> {
    match key {
        "bimbaCoordinate" | "bimba_coordinate" => Ok(COORDINATE_PROPERTY),
        canonical
            if node_property_spec(canonical).is_some()
                || relationship_property_spec(canonical).is_some() =>
        {
            Ok(NODE_PROPERTY_SPECS
                .iter()
                .chain(RELATIONSHIP_PROPERTY_SPECS.iter())
                .find(|spec| spec.key == canonical)
                .map(|spec| spec.key)
                .unwrap_or(COORDINATE_PROPERTY))
        }
        prefixed if validate_coordinate_prefix_property(prefixed).is_ok() => Err(format!(
            "dynamic coordinate-prefix property requires registry review: {prefixed}"
        )),
        other => Err(format!("unknown graph property key: {other}")),
    }
}

pub fn validate_coordinate_prefix_property(key: &str) -> Result<(), String> {
    if let Some(rest) = key.strip_prefix("q_").or_else(|| key.strip_prefix("qm_")) {
        return validate_q_register_property(rest, key);
    }
    let mut parts = key.split('_');
    let prefix = parts
        .next()
        .ok_or_else(|| "coordinate-prefix property is empty".to_owned())?;
    if coordinate_prefix_family_spec(prefix).is_none() {
        return Err(format!(
            "unsupported coordinate-prefix property family: {prefix}"
        ));
    }

    let position = parts
        .next()
        .ok_or_else(|| format!("coordinate-prefix property missing position: {key}"))?;
    if !matches!(position, "0" | "1" | "2" | "3" | "4" | "5") {
        return Err(format!(
            "coordinate-prefix property has invalid position: {key}"
        ));
    }

    let mut semantic_parts = parts.collect::<Vec<_>>();
    if semantic_parts.first() == Some(&"i") {
        semantic_parts.remove(0);
    }
    if semantic_parts.is_empty()
        || semantic_parts.iter().any(|part| {
            part.is_empty()
                || matches!(*part, "prime" | "inverted" | "inversion")
                || !part
                    .chars()
                    .all(|ch| ch.is_ascii_lowercase() || ch.is_ascii_digit())
        })
    {
        return Err(format!(
            "coordinate-prefix property missing semantic suffix: {key}"
        ));
    }

    Ok(())
}

/// The q-register family is OPEN: only the key *shape* is fixed — position 0-5, an
/// optional inverted-phase prime `'`, an optional interior numeric slot, then a
/// lower_snake_case facet suffix. The facet slug itself is free; there is no closed
/// vocabulary. The long-standing quickview slots remain registered in
/// `NODE_PROPERTY_SPECS` for typing/disclosure, but any well-formed q_/qm_ key is valid.
fn validate_q_register_property(rest: &str, key: &str) -> Result<(), String> {
    let position = rest
        .chars()
        .next()
        .ok_or_else(|| format!("q-register property missing position: {key}"))?;
    if !matches!(position, '0'..='5') {
        return Err(format!("q-register property has invalid position: {key}"));
    }
    let mut offset = position.len_utf8();
    if rest[offset..].starts_with('\'') {
        offset += 1; // inverted-phase prime marker
    }
    let after_position = rest[offset..]
        .strip_prefix('_')
        .ok_or_else(|| format!("q-register property missing semantic suffix: {key}"))?;

    // Optional interior numeric slot, then a lower_snake_case semantic suffix.
    let mut slot_split = after_position.splitn(2, '_');
    let first = slot_split
        .next()
        .ok_or_else(|| format!("q-register property missing semantic suffix: {key}"))?;
    let suffix = if !first.is_empty() && first.chars().all(|ch| ch.is_ascii_digit()) {
        slot_split
            .next()
            .ok_or_else(|| format!("q-register property missing semantic suffix: {key}"))?
    } else {
        after_position
    };

    if suffix.is_empty()
        || suffix.split('_').any(|segment| {
            segment.is_empty()
                || !segment
                    .chars()
                    .all(|ch| ch.is_ascii_lowercase() || ch.is_ascii_digit())
        })
    {
        return Err(format!(
            "q-register property missing semantic suffix: {key}"
        ));
    }
    Ok(())
}
