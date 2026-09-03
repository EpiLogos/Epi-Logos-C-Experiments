use serde::{Deserialize, Serialize};

use crate::mahamaya_score::M3PrimarySelectionEvidence;

pub const M3_ELEMENTAL_PRIMARY_SELECTOR_SCHEMA: &str = "epi.m3.elemental-primary-selector.v1";
pub const M3_ELEMENTAL_PRIMARY_SELECTOR_REF: &str =
    "Idea/Bimba/Seeds/M/M3'/M3-ELEMENTAL-PRIMARY-SELECTION-LOCK.md";
pub const M3_ELEMENTAL_PRIMARY_SELECTOR_MATRIX_REF: &str =
    "Idea/Bimba/Seeds/M/M3'/M3-MAHAMAYA-DEEP-CAPABILITY-COORDINATE-MATRIX.md";
pub const M3_ELEMENTAL_PRIMARY_SELECTOR_C_REF: &str = "Body/S/S0/epi-lib/include/m3.h";
pub const M3_L2_PRIME_PROFILE_REF: &str = "Body/S/S0/portal-core/src/kernel.rs";

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[repr(u8)]
#[serde(rename_all = "UPPERCASE")]
pub enum M3Nucleotide {
    A = 0,
    T = 1,
    C = 2,
    G = 3,
}

impl M3Nucleotide {
    pub const ALL: [Self; 4] = [Self::A, Self::T, Self::C, Self::G];

    pub const fn bits(self) -> u8 {
        self as u8
    }

    pub const fn symbol(self) -> &'static str {
        match self {
            Self::A => "A",
            Self::T => "T",
            Self::C => "C",
            Self::G => "G",
        }
    }

    pub const fn l2_prime_element(self) -> &'static str {
        match self {
            Self::A => "Water",
            Self::T => "Fire",
            Self::C => "Earth",
            Self::G => "Air",
        }
    }

    /// Resolve the already-authored L2′ material fourfold into the canonical
    /// M3 two-bit nucleotide alphabet.
    ///
    /// This intentionally accepts only the four determinate material elements.
    /// `Aether` and `Mineral` are boundary/implicate readings in the current
    /// profile and are not silently coerced into a nucleotide.
    pub fn from_l2_prime_element(element: &str) -> Result<Self, String> {
        match element.trim() {
            "Water" => Ok(Self::A),
            "Fire" => Ok(Self::T),
            "Earth" => Ok(Self::C),
            "Air" => Ok(Self::G),
            other => Err(format!(
                "L2′ element {other:?} does not determine an M3 nucleotide; expected one of Water/Fire/Earth/Air"
            )),
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct M3L2PrimeElementEvidence {
    pub element: String,
    pub source_ref: String,
}

impl M3L2PrimeElementEvidence {
    pub fn new(element: impl Into<String>, source_ref: impl Into<String>) -> Self {
        Self {
            element: element.into(),
            source_ref: source_ref.into(),
        }
    }

    fn validate(&self, field: &str) -> Result<(), String> {
        require_ref(&format!("{field}.source_ref"), &self.source_ref)?;
        if self.element.trim().is_empty() {
            return Err(format!("{field}.element must be non-empty"));
        }
        Ok(())
    }
}

/// Source-backed three-site material reading sufficient to select one 6-bit
/// Mahāmāyā address.
///
/// This is deliberately downstream of the unresolved continuous/composed
/// quaternion -> qualitative L2′ material-reading problem. Callers must supply
/// three resolved site readings with provenance; this type does not manufacture
/// those readings from Q_entity/Q_composed.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct M3ElementalPrimarySelectionInput {
    pub outer: M3L2PrimeElementEvidence,
    pub middle: M3L2PrimeElementEvidence,
    pub inner: M3L2PrimeElementEvidence,
    pub source_entity_or_event_ref: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub m2_source_ref: Option<String>,
    #[serde(default)]
    pub provenance_refs: Vec<String>,
}

impl M3ElementalPrimarySelectionInput {
    fn validate(&self) -> Result<(), String> {
        self.outer.validate("outer")?;
        self.middle.validate("middle")?;
        self.inner.validate("inner")?;
        require_ref(
            "source_entity_or_event_ref",
            &self.source_entity_or_event_ref,
        )?;
        validate_optional_ref("m2_source_ref", self.m2_source_ref.as_deref())?;
        validate_refs("provenance_refs", &self.provenance_refs)
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct M3ElementalPrimaryAddressSelection {
    pub schema: String,
    pub address64: u8,
    pub nucleotide_bits: [u8; 3],
    pub nucleotide_symbols: [String; 3],
    pub l2_prime_elements: [String; 3],
    pub site_source_refs: [String; 3],
    pub source_entity_or_event_ref: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub m2_source_ref: Option<String>,
    pub selection_derivation_ref: String,
    pub upstream_quaternion_inverse_state: String,
    pub provenance_refs: Vec<String>,
}

impl M3ElementalPrimaryAddressSelection {
    /// Derive the primary 64-address only from three already-resolved L2′
    /// material sites.
    ///
    /// Canonical M3 encoding is outer<<4 | middle<<2 | inner. The element ->
    /// nucleotide relation is the existing M3 law:
    /// Water=A=00, Fire=T=01, Earth=C=10, Air=G=11.
    pub fn derive(input: M3ElementalPrimarySelectionInput) -> Result<Self, String> {
        input.validate()?;
        let outer = M3Nucleotide::from_l2_prime_element(&input.outer.element)?;
        let middle = M3Nucleotide::from_l2_prime_element(&input.middle.element)?;
        let inner = M3Nucleotide::from_l2_prime_element(&input.inner.element)?;
        let nucleotide_bits = [outer.bits(), middle.bits(), inner.bits()];
        let address64 = (nucleotide_bits[0] << 4)
            | (nucleotide_bits[1] << 2)
            | nucleotide_bits[2];

        let mut provenance_refs = vec![
            M3_ELEMENTAL_PRIMARY_SELECTOR_MATRIX_REF.to_owned(),
            M3_ELEMENTAL_PRIMARY_SELECTOR_C_REF.to_owned(),
            M3_L2_PRIME_PROFILE_REF.to_owned(),
        ];
        provenance_refs.extend(input.provenance_refs);

        Ok(Self {
            schema: M3_ELEMENTAL_PRIMARY_SELECTOR_SCHEMA.to_owned(),
            address64,
            nucleotide_bits,
            nucleotide_symbols: [
                outer.symbol().to_owned(),
                middle.symbol().to_owned(),
                inner.symbol().to_owned(),
            ],
            l2_prime_elements: [
                input.outer.element,
                input.middle.element,
                input.inner.element,
            ],
            site_source_refs: [
                input.outer.source_ref,
                input.middle.source_ref,
                input.inner.source_ref,
            ],
            source_entity_or_event_ref: input.source_entity_or_event_ref,
            m2_source_ref: input.m2_source_ref,
            selection_derivation_ref: M3_ELEMENTAL_PRIMARY_SELECTOR_REF.to_owned(),
            upstream_quaternion_inverse_state:
                "unresolved-q-entity-q-composed-to-three-l2-prime-sites".to_owned(),
            provenance_refs,
        })
    }

    /// Carry a resolved elemental address into the existing reciprocal-score
    /// evidence type while keeping line, M2 vibration, RNA phase and optional
    /// rotation as independent evidence.
    pub fn into_score_evidence(
        self,
        runtime: M3PrimarySelectionRuntimeEvidence,
    ) -> M3PrimarySelectionEvidence {
        let mut provenance_refs = self.provenance_refs;
        provenance_refs.extend(self.site_source_refs.iter().cloned());
        if let Some(m2_source_ref) = &self.m2_source_ref {
            provenance_refs.push(m2_source_ref.clone());
        }
        provenance_refs.extend(runtime.provenance_refs);

        M3PrimarySelectionEvidence {
            address64: self.address64,
            selection_derivation_ref: self.selection_derivation_ref,
            source_entity_or_event_ref: self.source_entity_or_event_ref,
            line_index: runtime.line_index,
            m2_vibration_index: runtime.m2_vibration_index,
            rna_phase: runtime.rna_phase,
            rotation: runtime.rotation,
            rotation_derivation_ref: runtime.rotation_derivation_ref,
            temporal_context_ref: runtime.temporal_context_ref,
            provenance_refs,
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct M3PrimarySelectionRuntimeEvidence {
    pub line_index: u8,
    pub m2_vibration_index: usize,
    pub rna_phase: bool,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub rotation: Option<u8>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub rotation_derivation_ref: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub temporal_context_ref: Option<String>,
    #[serde(default)]
    pub provenance_refs: Vec<String>,
}

fn require_ref(field: &str, value: &str) -> Result<(), String> {
    if value.trim().is_empty() {
        Err(format!("{field} must be a non-empty stable reference"))
    } else {
        Ok(())
    }
}

fn validate_optional_ref(field: &str, value: Option<&str>) -> Result<(), String> {
    match value {
        Some(value) => require_ref(field, value),
        None => Ok(()),
    }
}

fn validate_refs(field: &str, values: &[String]) -> Result<(), String> {
    for value in values {
        require_ref(field, value)?;
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::mahamaya_score::M3Score;

    fn site(nucleotide: M3Nucleotide, label: &str) -> M3L2PrimeElementEvidence {
        M3L2PrimeElementEvidence::new(
            nucleotide.l2_prime_element(),
            format!("L2′:site:{label}"),
        )
    }

    fn input(
        outer: M3Nucleotide,
        middle: M3Nucleotide,
        inner: M3Nucleotide,
    ) -> M3ElementalPrimarySelectionInput {
        M3ElementalPrimarySelectionInput {
            outer: site(outer, "outer"),
            middle: site(middle, "middle"),
            inner: site(inner, "inner"),
            source_entity_or_event_ref: "M4:episode:elemental-selector-test".to_owned(),
            m2_source_ref: Some("M2:relation-plan:elemental-selector-test".to_owned()),
            provenance_refs: vec!["test:elemental-selector".to_owned()],
        }
    }

    #[test]
    fn canonical_l2_prime_elements_map_to_the_existing_two_bit_nucleotides() {
        assert_eq!(M3Nucleotide::from_l2_prime_element("Water").unwrap(), M3Nucleotide::A);
        assert_eq!(M3Nucleotide::from_l2_prime_element("Fire").unwrap(), M3Nucleotide::T);
        assert_eq!(M3Nucleotide::from_l2_prime_element("Earth").unwrap(), M3Nucleotide::C);
        assert_eq!(M3Nucleotide::from_l2_prime_element("Air").unwrap(), M3Nucleotide::G);
        assert_eq!(M3Nucleotide::A.bits(), 0b00);
        assert_eq!(M3Nucleotide::T.bits(), 0b01);
        assert_eq!(M3Nucleotide::C.bits(), 0b10);
        assert_eq!(M3Nucleotide::G.bits(), 0b11);
    }

    #[test]
    fn three_resolved_material_sites_select_the_canonical_six_bit_address() {
        let selection = M3ElementalPrimaryAddressSelection::derive(input(
            M3Nucleotide::A,
            M3Nucleotide::T,
            M3Nucleotide::C,
        ))
        .unwrap();
        assert_eq!(selection.nucleotide_symbols, ["A", "T", "C"]);
        assert_eq!(selection.nucleotide_bits, [0, 1, 2]);
        assert_eq!(selection.address64, 0b00_01_10);
        assert_eq!(selection.address64, 6);
        assert_eq!(
            selection.upstream_quaternion_inverse_state,
            "unresolved-q-entity-q-composed-to-three-l2-prime-sites"
        );
    }

    #[test]
    fn all_material_triples_cover_the_full_64_address_field_exactly_once() {
        let mut seen = [false; 64];
        for outer in M3Nucleotide::ALL {
            for middle in M3Nucleotide::ALL {
                for inner in M3Nucleotide::ALL {
                    let selection = M3ElementalPrimaryAddressSelection::derive(input(
                        outer, middle, inner,
                    ))
                    .unwrap();
                    assert!(!seen[selection.address64 as usize]);
                    seen[selection.address64 as usize] = true;
                }
            }
        }
        assert!(seen.into_iter().all(|value| value));
    }

    #[test]
    fn implicate_or_unresolved_material_readings_are_not_coerced_into_nucleotides() {
        for element in ["Aether", "Mineral", "Ether/structure", ""] {
            assert!(M3Nucleotide::from_l2_prime_element(element).is_err());
        }
    }

    #[test]
    fn resolved_elemental_address_enters_score_hinge_without_guessing_rotation_or_clock() {
        let selection = M3ElementalPrimaryAddressSelection::derive(input(
            M3Nucleotide::G,
            M3Nucleotide::C,
            M3Nucleotide::A,
        ))
        .unwrap();
        assert_eq!(selection.address64, 56);
        let evidence = selection.into_score_evidence(M3PrimarySelectionRuntimeEvidence {
            line_index: 2,
            m2_vibration_index: 48,
            rna_phase: false,
            rotation: None,
            rotation_derivation_ref: None,
            temporal_context_ref: Some("S3:world-clock:episode-test".to_owned()),
            provenance_refs: vec!["runtime:elemental-selector-test".to_owned()],
        });
        let score = M3Score::from_primary_selection(evidence).unwrap();
        assert_eq!(score.primary_codec.address64, 56);
        assert!(score.explicit_rotation.is_none());
        assert!(score.clock_position.is_none());
        assert_eq!(
            score.primary_selection_ref,
            M3_ELEMENTAL_PRIMARY_SELECTOR_REF
        );
    }
}
