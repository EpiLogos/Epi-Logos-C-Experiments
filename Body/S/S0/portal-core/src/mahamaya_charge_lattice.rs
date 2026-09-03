use serde::{Deserialize, Serialize};

use crate::codon_rotation_projection::codon_charge_quaternion;
use crate::mahamaya_primary_selection::M3Nucleotide;

pub const M3_CHARGE_LATTICE_SCHEMA: &str = "epi.m3.charge-lattice.v1";
pub const M3_CHARGE_LATTICE_REF: &str =
    "Idea/Bimba/Seeds/M/M3'/M3-CHARGE-LATTICE-INVERSE-LOCK.md";
pub const M3_CHARGE_C_REF: &str = "Body/S/S0/epi-lib/include/m3.h";
pub const M3_CHARGE_MATRIX_REF: &str =
    "Idea/Bimba/Seeds/M/M3'/M3-MAHAMAYA-DEEP-CAPABILITY-COORDINATE-MATRIX.md";
pub const M3_NORMALIZED_CHARGE_REF: &str =
    "Body/S/S0/portal-core/src/codon_rotation_projection.rs";

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct M3RawChargeEvaluation {
    pub pp: i16,
    pub mm: i16,
    pub mp: i16,
    pub pm: i16,
}

impl M3RawChargeEvaluation {
    pub fn from_address(address64: u8) -> Result<Self, String> {
        if address64 >= 64 {
            return Err(format!("M3 address must be in 0..63, got {address64}"));
        }
        let outer = iching_value((address64 >> 4) & 0x03);
        let middle = iching_value((address64 >> 2) & 0x03);
        let inner = iching_value(address64 & 0x03);
        Ok(Self::from_site_values(outer, middle, inner))
    }

    pub const fn from_site_values(outer: i16, middle: i16, inner: i16) -> Self {
        Self {
            pp: outer + middle + inner,
            mm: outer - middle - inner,
            mp: outer - middle + inner,
            pm: outer + middle - inner,
        }
    }

    /// Exact inverse of the current four-charge transform.
    ///
    /// The transform is Hadamard-like and yields:
    /// X = (pp + mm + mp + pm) / 4
    /// Y = (pp - mm - mp + pm) / 4
    /// Z = (pp - mm + mp - pm) / 4
    ///
    /// A charge tuple resolves only when all three recovered values are exact
    /// integers in the canonical M3 I-Ching alphabet {6,9,7,8}. No rounding or
    /// nearest-value selection is allowed.
    pub fn resolve_address(self) -> Result<M3ChargeLatticeResolution, String> {
        let x4 = self.pp + self.mm + self.mp + self.pm;
        let y4 = self.pp - self.mm - self.mp + self.pm;
        let z4 = self.pp - self.mm + self.mp - self.pm;
        for (name, value) in [("outer", x4), ("middle", y4), ("inner", z4)] {
            if value % 4 != 0 {
                return Err(format!(
                    "raw M3 charge tuple is off the exact lattice: {name} inverse numerator {value} is not divisible by 4"
                ));
            }
        }

        let site_values = [x4 / 4, y4 / 4, z4 / 4];
        let outer = nucleotide_from_iching_value(site_values[0])?;
        let middle = nucleotide_from_iching_value(site_values[1])?;
        let inner = nucleotide_from_iching_value(site_values[2])?;
        let nucleotide_bits = [outer.bits(), middle.bits(), inner.bits()];
        let address64 = (nucleotide_bits[0] << 4)
            | (nucleotide_bits[1] << 2)
            | nucleotide_bits[2];

        Ok(M3ChargeLatticeResolution {
            schema: M3_CHARGE_LATTICE_SCHEMA.to_owned(),
            address64,
            nucleotide_bits,
            nucleotide_symbols: [
                outer.symbol().to_owned(),
                middle.symbol().to_owned(),
                inner.symbol().to_owned(),
            ],
            iching_values: site_values,
            raw_charges: self,
            derivation_ref: M3_CHARGE_LATTICE_REF.to_owned(),
            provenance_refs: vec![
                M3_CHARGE_C_REF.to_owned(),
                M3_CHARGE_MATRIX_REF.to_owned(),
            ],
        })
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct M3ChargeLatticeResolution {
    pub schema: String,
    pub address64: u8,
    pub nucleotide_bits: [u8; 3],
    pub nucleotide_symbols: [String; 3],
    pub iching_values: [i16; 3],
    pub raw_charges: M3RawChargeEvaluation,
    pub derivation_ref: String,
    pub provenance_refs: Vec<String>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct M3NormalizedChargeRecognition {
    pub schema: String,
    pub candidates: Vec<u8>,
    pub candidate_codons: Vec<String>,
    pub recognition_state: String,
    pub tolerance: f32,
    pub derivation_ref: String,
    pub provenance_refs: Vec<String>,
}

/// Recognise an already-normalized M3 charge quaternion only when it lies on
/// the existing 64-codon unit-charge lattice within an explicit tolerance.
///
/// This is not nearest-neighbour selection: candidates outside the tolerance
/// are ignored and an arbitrary quaternion can legitimately return no match.
/// Multiple exact lattice candidates remain multiple. In particular, the four
/// homogeneous codons share one normalized direction because normalization
/// removes their distinct charge magnitudes.
pub fn recognize_normalized_charge_quaternion(
    normalized_charge: [f32; 4],
    tolerance: f32,
) -> Result<M3NormalizedChargeRecognition, String> {
    if !tolerance.is_finite() || tolerance <= 0.0 {
        return Err("charge recognition tolerance must be finite and > 0".to_owned());
    }
    if normalized_charge.iter().any(|value| !value.is_finite()) {
        return Err("normalized charge quaternion must contain only finite values".to_owned());
    }

    let mut candidates = Vec::new();
    for address64 in 0..64u8 {
        let candidate = codon_charge_quaternion(address64);
        if components_within(normalized_charge, candidate, tolerance) {
            candidates.push(address64);
        }
    }
    let candidate_codons = candidates.iter().map(|&address| codon_string(address)).collect();
    let recognition_state = match candidates.len() {
        0 => "off-charge-lattice",
        1 => "unique-exact-lattice-candidate",
        _ => "ambiguous-exact-lattice-candidates",
    }
    .to_owned();

    Ok(M3NormalizedChargeRecognition {
        schema: M3_CHARGE_LATTICE_SCHEMA.to_owned(),
        candidates,
        candidate_codons,
        recognition_state,
        tolerance,
        derivation_ref: M3_CHARGE_LATTICE_REF.to_owned(),
        provenance_refs: vec![
            M3_NORMALIZED_CHARGE_REF.to_owned(),
            M3_CHARGE_C_REF.to_owned(),
            M3_CHARGE_MATRIX_REF.to_owned(),
        ],
    })
}

const fn iching_value(nucleotide: u8) -> i16 {
    match nucleotide & 0x03 {
        0 => 6,
        1 => 9,
        2 => 7,
        _ => 8,
    }
}

fn nucleotide_from_iching_value(value: i16) -> Result<M3Nucleotide, String> {
    match value {
        6 => Ok(M3Nucleotide::A),
        9 => Ok(M3Nucleotide::T),
        7 => Ok(M3Nucleotide::C),
        8 => Ok(M3Nucleotide::G),
        other => Err(format!(
            "recovered M3 site value {other} is outside canonical I-Ching nucleotide values 6/9/7/8"
        )),
    }
}

fn components_within(left: [f32; 4], right: [f32; 4], tolerance: f32) -> bool {
    left.into_iter()
        .zip(right)
        .all(|(a, b)| (a - b).abs() <= tolerance)
}

fn codon_string(address64: u8) -> String {
    [
        (address64 >> 4) & 0x03,
        (address64 >> 2) & 0x03,
        address64 & 0x03,
    ]
    .into_iter()
    .map(|bits| match bits {
        0 => 'A',
        1 => 'T',
        2 => 'C',
        _ => 'G',
    })
    .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn all_64_raw_charge_tuples_round_trip_exactly() {
        for address64 in 0..64u8 {
            let charges = M3RawChargeEvaluation::from_address(address64).unwrap();
            let resolved = charges.resolve_address().unwrap();
            assert_eq!(resolved.address64, address64);
        }
    }

    #[test]
    fn off_lattice_raw_charge_tuple_is_rejected_without_rounding() {
        let off_lattice = M3RawChargeEvaluation {
            pp: 22,
            mm: -8,
            mp: 6,
            pm: 4,
        };
        assert!(off_lattice.resolve_address().is_err());
    }

    #[test]
    fn normalized_homogeneous_codons_remain_explicitly_ambiguous() {
        let q = codon_charge_quaternion(0); // AAA
        let recognized = recognize_normalized_charge_quaternion(q, 1.0e-6).unwrap();
        assert_eq!(recognized.recognition_state, "ambiguous-exact-lattice-candidates");
        assert_eq!(recognized.candidates, vec![0, 21, 42, 63]);
        assert_eq!(recognized.candidate_codons, vec!["AAA", "TTT", "CCC", "GGG"]);
    }

    #[test]
    fn normalized_nonhomogeneous_charge_can_resolve_uniquely_without_nearest_neighbor() {
        let address64 = 6; // ATC
        let q = codon_charge_quaternion(address64);
        let recognized = recognize_normalized_charge_quaternion(q, 1.0e-6).unwrap();
        assert_eq!(recognized.recognition_state, "unique-exact-lattice-candidate");
        assert_eq!(recognized.candidates, vec![address64]);
        assert_eq!(recognized.candidate_codons, vec!["ATC"]);
    }

    #[test]
    fn arbitrary_unit_quaternion_can_remain_off_lattice() {
        let recognized = recognize_normalized_charge_quaternion([1.0, 0.0, 0.0, 0.0], 1.0e-6).unwrap();
        assert_eq!(recognized.recognition_state, "off-charge-lattice");
        assert!(recognized.candidates.is_empty());
    }
}
