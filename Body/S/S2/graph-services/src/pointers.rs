use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};

use crate::CoordinateArrayParser;

const FAMILIES: &[&str] = &["C", "P", "L", "S", "T", "M"];
const VAK_REFS: &[(&str, &str)] = &[
    ("cpf_ref", "S4-0'"),
    ("ct_ref", "S4-1'"),
    ("cp_ref", "S4-2'"),
    ("cf_ref", "S4-3'"),
    ("cfp_ref", "S4-4'"),
    ("cs_ref", "S4-5'"),
];
const VAK_NAMES: &[&str] = &["CPF", "CT", "CP", "CF", "CFP", "CS"];

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PointerWeb {
    pub coordinate: String,
    pub pointer_count: usize,
    pub primary_reflective_context: Option<String>,
    pub family_refs: BTreeMap<String, String>,
    pub reflective_refs: BTreeMap<String, String>,
    pub inversion_refs: BTreeMap<String, String>,
    pub position_refs: BTreeMap<String, String>,
    pub lens_refs: BTreeMap<String, String>,
    pub lens_inversion_refs: BTreeMap<String, String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct KernelAnchor {
    pub source: String,
    pub computation_layer: String,
    pub safe_projection: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct QvDataAnchor {
    pub source: String,
    pub coordinate: String,
    pub command: String,
    pub qvdata_layer: String,
    pub compiled_source: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct KernelCoordinateAnchor {
    pub coordinate: String,
    pub source_input: String,
    pub compatibility_property: Option<String>,
    pub projection_boundary: String,
    pub kernel: KernelAnchor,
    pub pointer_web: PointerWeb,
    pub qvdata: QvDataAnchor,
}

pub fn kernel_coordinate_anchor_for(coordinate: &str) -> Result<KernelCoordinateAnchor, String> {
    let resolution = resolve_coordinate_for_anchor(coordinate)?;
    kernel_coordinate_anchor_from_parts(
        &resolution.canonical,
        &resolution.input,
        resolution.compatibility_property,
    )
}

pub fn kernel_coordinate_anchor_from_parts(
    canonical_coordinate: &str,
    source_input: &str,
    compatibility_property: Option<String>,
) -> Result<KernelCoordinateAnchor, String> {
    let pointer_web = compute_pointer_web(canonical_coordinate)?;
    Ok(KernelCoordinateAnchor {
        coordinate: canonical_coordinate.to_owned(),
        source_input: source_input.to_owned(),
        compatibility_property,
        projection_boundary:
            "safe coordinate topology only; live kernel state and protected identity remain external"
                .to_owned(),
        kernel: KernelAnchor {
            source: "s0.kernel".to_owned(),
            computation_layer: "Body/S/S0/epi-lib + Body/S/S0/portal-core".to_owned(),
            safe_projection: "KernelTemporalProjection / KernelResonanceObservation".to_owned(),
        },
        pointer_web,
        qvdata: QvDataAnchor {
            source: "epi core knowing".to_owned(),
            coordinate: canonical_coordinate.to_owned(),
            command: format!("epi core knowing {canonical_coordinate} --json"),
            qvdata_layer: "S0'".to_owned(),
            compiled_source: "Body/S/S0/epi-lib/src/qv_data.c + qv overlay".to_owned(),
        },
    })
}

pub fn compute_pointer_web(coordinate: &str) -> Result<PointerWeb, String> {
    let parsed = CoordinateArrayParser::parse_one(coordinate)?;
    let ql_position = parsed.ql_position;
    let sixfold_position = ql_position.filter(|position| *position <= 5);
    let family = parsed.family.as_deref();
    let prime = if parsed.inverted { "'" } else { "" };
    let flipped_prime = if parsed.inverted { "" } else { "'" };

    let mut family_refs = BTreeMap::new();
    let mut inversion_refs = BTreeMap::new();
    if let Some(q) = sixfold_position {
        for family in FAMILIES {
            family_refs.insert(
                format!("{}_ref", family.to_ascii_lowercase()),
                format!("{family}{q}{prime}"),
            );
            inversion_refs.insert(
                format!("{}_inv_ref", family.to_ascii_lowercase()),
                format!("{family}{}{flipped_prime}", 5 - q),
            );
        }
    }

    let reflective_refs = VAK_REFS
        .iter()
        .map(|(key, value)| ((*key).to_owned(), (*value).to_owned()))
        .collect::<BTreeMap<_, _>>();

    let mut position_refs = BTreeMap::new();
    if let Some(family) = family {
        for p in 0..=5 {
            position_refs.insert(format!("p{p}_ref"), format!("{family}{p}{prime}"));
        }
    }

    let lens_refs = (0..=5)
        .map(|lens| (format!("l{lens}_ref"), format!("L{lens}")))
        .collect::<BTreeMap<_, _>>();
    let lens_inversion_refs = (0..=5)
        .map(|lens| (format!("l{lens}_inv_ref"), format!("L{}'", 5 - lens)))
        .collect::<BTreeMap<_, _>>();

    let pointer_count = family_refs.len()
        + reflective_refs.len()
        + inversion_refs.len()
        + position_refs.len()
        + lens_refs.len()
        + lens_inversion_refs.len();

    Ok(PointerWeb {
        coordinate: parsed.coordinate,
        pointer_count,
        primary_reflective_context: sixfold_position
            .and_then(|position| VAK_NAMES.get(position as usize))
            .map(|value| (*value).to_owned()),
        family_refs,
        reflective_refs,
        inversion_refs,
        position_refs,
        lens_refs,
        lens_inversion_refs,
    })
}

struct AnchorResolution {
    input: String,
    canonical: String,
    compatibility_property: Option<String>,
}

fn resolve_coordinate_for_anchor(input: &str) -> Result<AnchorResolution, String> {
    let trimmed = input.trim();
    let parsed = CoordinateArrayParser::parse_one(trimmed)?;
    let canonical = if trimmed == "#" {
        "M".to_owned()
    } else if trimmed.starts_with('#') && trimmed.len() == 2 {
        format!("M{}", parsed.ql_position.unwrap_or_default())
    } else {
        parsed.coordinate
    };
    let compatibility_property = trimmed
        .starts_with('#')
        .then(|| "bimbaCoordinate".to_owned());
    Ok(AnchorResolution {
        input: trimmed.to_owned(),
        canonical,
        compatibility_property,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn context_frame_seven_does_not_enter_sixfold_mirror_projection() {
        let pointer_web = compute_pointer_web("CF_MOBIUS").unwrap();

        assert_eq!(pointer_web.coordinate, "CF_MOBIUS");
        assert_eq!(pointer_web.pointer_count, 18);
        assert!(pointer_web.family_refs.is_empty());
        assert!(pointer_web.inversion_refs.is_empty());
        assert_eq!(pointer_web.primary_reflective_context, None);
    }
}
