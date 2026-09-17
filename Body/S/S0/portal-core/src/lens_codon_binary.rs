// Coordinate: M3' symbolic transcription through the S0 kernel bridge (24.T24.20).
// Residency: Body/S/S0/portal-core.
// Position (#n): #3 process / transcription.
// Actualises: one complete authority packet for the primary Fibonacci Ground
//   lens and its 16 derived apertures: 3x2-bit codon, charge/quaternion/X
//   witness, canonical class, six line hops, and compiled RNA capability.
// Public surface: lens_codon_binary_projection and its serialized packet types.
// Does NOT own: Fibonacci/Pisano law, the 16 division table, element
//   normalization, profile cadence, or renderer choreography.
// Contract: [[M3'-SPEC]], [[S0-ARCHITECTURE]], and Track 37.8 / 24.T24.20.

use serde::{Deserialize, Serialize};

use crate::kernel::projections::phase_space::{
    ClockDegreeNode, PhaseSpaceAddress, CLOCK_LENSES_16, PRIMARY_GROUND_LENS_ID,
};
use crate::luts::mahamaya::line_change_operator;
use crate::m3_transcription_bridge::{
    bioquaternion_transcription, BioquaternionTranscription, ChargeIdentity, QuaternionCharges,
};

use epi_lib as _;

extern "C" {
    fn get_iching_value(nucleotide: u8) -> u8;
    fn m3_codon_is_rna_capable(codon6bit: u8) -> i32;
}

pub const M3_LENS_DIVISION_COUNT: u8 = 16;
pub const M3_PRIMARY_GROUND_LENS_ID: u8 = PRIMARY_GROUND_LENS_ID;
pub const M3_FUNCTIONAL_LENS_COUNT: u8 = M3_LENS_DIVISION_COUNT + 1;
pub const M3_LENS_CODON_BINARY_SOURCE: &str = "CLOCK_DEGREE_LUT[360]";

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum M3LensRole {
    PrimaryGround,
    DerivedAperture,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LensCodonBinaryLineHop {
    pub line: u8,
    pub operator_address: u16,
    pub from_hexagram_id: u8,
    pub to_hexagram_id: u8,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LensCodonBinaryDegree {
    pub degree360: u16,
    pub exact_degree720: f32,
    pub codon_upper: u8,
    pub codon_middle: u8,
    pub codon_lower: u8,
    pub codon_pairs: [u8; 3],
    pub codon_pair_bits: [String; 3],
    pub codon6_bit: u8,
    pub codon_class: u8,
    pub codon_class_label: String,
    pub charges: QuaternionCharges,
    pub quaternion: [f32; 4],
    pub charge_identity: [ChargeIdentity; 4],
    pub four_x: i16,
    pub x_logic_invariant: bool,
    /// M3 decan scheme D. The epi-cli bridge replaces this private edge field
    /// with canonical-B `elementCanonical` before the packet reaches clients.
    pub element_m3_decan: u8,
    pub hexagram_id: u8,
    pub line_change_operator: u8,
    pub line_change_hops: [LensCodonBinaryLineHop; 6],
    pub rna_capable: bool,
    pub tick12: u8,
    /// Address supplied by the primary Fibonacci Ground lens. Every derived
    /// aperture record carries this address; it is not optional decoration.
    pub fibonacci_position: u8,
    pub fibonacci_digit: u8,
    pub fibonacci_phase01: f32,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LensCodonBinaryProjection {
    pub lens_id: u8,
    pub lens_role: M3LensRole,
    /// Stable pointer from every derived aperture back to its operative ground.
    pub grounding_lens_id: u8,
    pub source: String,
    /// Boundary degrees for the selected existing clock division. For a lens
    /// with slice S and N sections this is exactly [0*S, 1*S, ... (N-1)*S].
    pub segment: Vec<u16>,
    pub per_degree: Vec<LensCodonBinaryDegree>,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct LensCodonBinaryError {
    pub lens_id: u8,
}

impl std::fmt::Display for LensCodonBinaryError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "lensId {} outside functional M3 lenses 0..16",
            self.lens_id
        )
    }
}

impl std::error::Error for LensCodonBinaryError {}

pub fn lens_codon_binary_projection(
    lens_id: u8,
) -> Result<LensCodonBinaryProjection, LensCodonBinaryError> {
    let (lens_role, slice, sections) = if lens_id == M3_PRIMARY_GROUND_LENS_ID {
        (M3LensRole::PrimaryGround, 6, 60)
    } else {
        let lens = CLOCK_LENSES_16
            .get(lens_id as usize)
            .ok_or(LensCodonBinaryError { lens_id })?;
        (M3LensRole::DerivedAperture, lens.slice, lens.sections)
    };
    let mut segment = Vec::with_capacity(sections as usize);
    let mut per_degree = Vec::with_capacity(sections as usize);

    for section in 0..sections {
        let degree360 = section * slice;
        let clock = ClockDegreeNode::from_degree360(degree360);
        let transcription = bioquaternion_transcription(clock.hexagram_id & 0x3f);
        segment.push(degree360);
        per_degree.push(project_degree(clock, transcription));
    }

    Ok(LensCodonBinaryProjection {
        lens_id,
        lens_role,
        grounding_lens_id: M3_PRIMARY_GROUND_LENS_ID,
        source: M3_LENS_CODON_BINARY_SOURCE.to_owned(),
        segment,
        per_degree,
    })
}

fn project_degree(
    clock: ClockDegreeNode,
    transcription: BioquaternionTranscription,
) -> LensCodonBinaryDegree {
    let ground = PhaseSpaceAddress::from_degree720(clock.degree360).fibonacci_ground;
    let codon = clock.hexagram_id & 0x3f;
    let codon_upper = (codon >> 4) & 0x03;
    let codon_middle = (codon >> 2) & 0x03;
    let codon_lower = codon & 0x03;
    let codon_pairs = [codon_upper, codon_middle, codon_lower];
    let codon_class = crate::codon::classify_codon(codon);
    let charge_sum = i16::from(transcription.charges.pp)
        + i16::from(transcription.charges.nn)
        + i16::from(transcription.charges.np)
        + i16::from(transcription.charges.pn);
    let four_x = 4 * i16::from(unsafe { get_iching_value(codon_upper) });
    LensCodonBinaryDegree {
        degree360: clock.degree360,
        exact_degree720: clock.exact_degree720,
        codon_upper,
        codon_middle,
        codon_lower,
        codon_pairs,
        codon_pair_bits: codon_pairs.map(|pair| format!("{pair:02b}")),
        codon6_bit: codon,
        codon_class: codon_class as u8,
        codon_class_label: codon_class.label().to_owned(),
        charges: transcription.charges,
        quaternion: transcription.quaternion,
        charge_identity: transcription.charge_identity,
        four_x,
        x_logic_invariant: charge_sum == four_x,
        element_m3_decan: clock.decan_element,
        hexagram_id: clock.hexagram_id,
        line_change_operator: clock.hexagram_line_active,
        line_change_hops: std::array::from_fn(|line| {
            let line = line as u8;
            LensCodonBinaryLineHop {
                line,
                operator_address: line_change_operator(codon, line),
                from_hexagram_id: codon,
                to_hexagram_id: codon ^ (1u8 << line),
            }
        }),
        rna_capable: unsafe { m3_codon_is_rna_capable(codon) != 0 },
        tick12: clock.degree_tick12,
        fibonacci_position: ground.position,
        fibonacci_digit: ground.digit,
        fibonacci_phase01: ground.phase01,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn every_projection_uses_the_existing_clock_lens_boundaries() {
        for lens_id in 0..M3_LENS_DIVISION_COUNT {
            let lens = CLOCK_LENSES_16[lens_id as usize];
            let projection = lens_codon_binary_projection(lens_id).unwrap();
            assert_eq!(projection.segment.len(), lens.sections as usize);
            assert_eq!(projection.per_degree.len(), lens.sections as usize);
            for (section, degree) in projection.segment.iter().enumerate() {
                assert_eq!(*degree, section as u16 * lens.slice);
            }
        }
    }
}
