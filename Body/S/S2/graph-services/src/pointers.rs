use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};

use crate::CoordinateArrayParser;

const FAMILIES: &[&str] = &["C", "P", "L", "S", "T", "M"];
const HC_WEB_RING_SIZE: u8 = 12;
const HC_WEB_HELIX_SIZE: u8 = 6;
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
    pub harmonic_pointer: Option<HarmonicPointerAnchor>,
    pub pointer_web: PointerWeb,
    pub qvdata: QvDataAnchor,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct HarmonicPointerAnchor {
    pub source_profile: String,
    pub source_contract: String,
    pub coordinate: String,
    pub ql_position: u8,
    pub helix: String,
    pub bedrock: HarmonicBedrockAnchor,
    pub pointer_anchor: HarmonicPointerWebAnchor,
    pub context_frames: HarmonicContextFrameAnchor,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct HarmonicBedrockAnchor {
    pub hash_operator: String,
    pub psychoid_number: String,
    pub inverted_psychoid_number: String,
    pub successor_psychoid_number: String,
    pub successor_relation: String,
    pub inversion_relation: String,
    pub bimba_pitch_class: u8,
    pub inversion_pitch_class: u8,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct HarmonicPointerWebAnchor {
    pub source_coordinate: String,
    pub ql_position: u8,
    pub helix: String,
    pub web_index: u8,
    pub bedrock_index: u8,
    pub family_ring_size: u8,
    pub position_ring_size: u8,
    pub lens_ring_size: u8,
    pub web_cardinality: u8,
    pub lens_anchor: String,
    pub relation_role: String,
    pub pitch_class: u8,
    pub provenance: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct HarmonicContextFrameAnchor {
    pub frame_count: u8,
    pub active_frame_index: Option<u8>,
    pub active_frame: Option<String>,
    pub active_agent: Option<String>,
    pub projection: String,
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
    let harmonic_pointer = compute_harmonic_pointer_anchor(canonical_coordinate)?;
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
        harmonic_pointer,
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

pub fn compute_harmonic_pointer_anchor(
    coordinate: &str,
) -> Result<Option<HarmonicPointerAnchor>, String> {
    let parsed = CoordinateArrayParser::parse_one(coordinate)?;
    let Some(position) = parsed.ql_position.filter(|position| *position <= 5) else {
        return Ok(None);
    };
    let tick12 = if parsed.inverted {
        position + HC_WEB_HELIX_SIZE
    } else {
        position
    };
    let helix = if parsed.inverted {
        "pratibimba"
    } else {
        "bimba"
    };
    let pitch_class = if parsed.inverted {
        pratibimba_pitch_class(position)
    } else {
        bimba_pitch_class(position)
    };
    let successor = (position + 1) % HC_WEB_HELIX_SIZE;
    let diatonic = diatonic_context_for_pitch_class(pitch_class);

    Ok(Some(HarmonicPointerAnchor {
        source_profile: "portal-core::MathemeHarmonicProfile".to_owned(),
        source_contract: "S0 Bedrock7/PointerWeb36/CF7".to_owned(),
        coordinate: parsed.coordinate,
        ql_position: position,
        helix: helix.to_owned(),
        bedrock: HarmonicBedrockAnchor {
            hash_operator: "#".to_owned(),
            psychoid_number: format!("#{position}"),
            inverted_psychoid_number: format!("#{position}'"),
            successor_psychoid_number: format!("#{successor}"),
            successor_relation: if position == 5 {
                "mobius-return"
            } else {
                "epogdoon-tick"
            }
            .to_owned(),
            inversion_relation: "inversion-spanda".to_owned(),
            bimba_pitch_class: bimba_pitch_class(position),
            inversion_pitch_class: pratibimba_pitch_class(position),
        },
        pointer_anchor: HarmonicPointerWebAnchor {
            source_coordinate: "S0/QL-meta".to_owned(),
            ql_position: position,
            helix: helix.to_owned(),
            web_index: tick12,
            bedrock_index: position,
            family_ring_size: 12,
            position_ring_size: 12,
            lens_ring_size: 12,
            web_cardinality: 36,
            lens_anchor: lens_anchor_label(tick12),
            relation_role: if parsed.inverted {
                "inversion-spanda"
            } else {
                "position-identity"
            }
            .to_owned(),
            pitch_class,
            provenance: "S0 Bedrock7/PointerWeb36/CF7 harmonic pointer contract".to_owned(),
        },
        context_frames: HarmonicContextFrameAnchor {
            frame_count: 7,
            active_frame_index: diatonic.as_ref().map(|context| context.0),
            active_frame: diatonic.as_ref().map(|context| context.1.to_owned()),
            active_agent: diatonic.as_ref().map(|context| context.2.to_owned()),
            projection: "CF7 diatonic lemniscate overlay".to_owned(),
        },
    }))
}

pub fn compute_pointer_web(coordinate: &str) -> Result<PointerWeb, String> {
    let parsed = CoordinateArrayParser::parse_one(coordinate)?;
    let ql_position = parsed.ql_position;
    let sixfold_position = ql_position.filter(|position| *position <= 5);
    let family = parsed.family.as_deref();
    let prime = if parsed.inverted { "'" } else { "" };
    let inverted_prime = if parsed.inverted { "" } else { "'" };

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
                format!("{family}{q}{inverted_prime}"),
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
        .map(|lens| (format!("l{lens}_inv_ref"), format!("L{lens}'")))
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

fn bimba_pitch_class(position: u8) -> u8 {
    (2 * (position % HC_WEB_HELIX_SIZE)) % HC_WEB_RING_SIZE
}

fn pratibimba_pitch_class(position: u8) -> u8 {
    (bimba_pitch_class(position) + 1) % HC_WEB_RING_SIZE
}

fn lens_anchor_label(tick12: u8) -> String {
    let position = tick12 % HC_WEB_HELIX_SIZE;
    if tick12 < HC_WEB_HELIX_SIZE {
        format!("L{position}")
    } else {
        format!("L{position}'")
    }
}

fn diatonic_context_for_pitch_class(pitch_class: u8) -> Option<(u8, &'static str, &'static str)> {
    match pitch_class % HC_WEB_RING_SIZE {
        0 => Some((0, "00/00", "Nous")),
        2 => Some((1, "0/1", "Logos")),
        4 => Some((2, "0/1/2", "Eros")),
        5 => Some((3, "0/1/2/3", "Mythos")),
        7 => Some((4, "4.0/1-4.4/5", "Anima/Psyche")),
        9 => Some((5, "4.5/0", "Psyche")),
        11 => Some((6, "5/0", "Sophia")),
        _ => None,
    }
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
    Ok(AnchorResolution {
        input: trimmed.to_owned(),
        canonical,
        compatibility_property: None,
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

    #[test]
    fn inversion_refs_are_same_position_prime_not_xy5_mirror() {
        let pointer_web = compute_pointer_web("M2").unwrap();

        assert_eq!(
            pointer_web
                .inversion_refs
                .get("m_inv_ref")
                .map(String::as_str),
            Some("M2'")
        );
        assert_ne!(
            pointer_web
                .inversion_refs
                .get("m_inv_ref")
                .map(String::as_str),
            Some("M3'")
        );
    }

    #[test]
    fn lens_inversion_refs_are_full_twelve_lens_ring() {
        let pointer_web = compute_pointer_web("M2").unwrap();

        assert_eq!(
            pointer_web
                .lens_inversion_refs
                .get("l2_inv_ref")
                .map(String::as_str),
            Some("L2'")
        );
        assert_eq!(
            pointer_web
                .lens_inversion_refs
                .get("l5_inv_ref")
                .map(String::as_str),
            Some("L5'")
        );
    }
}
