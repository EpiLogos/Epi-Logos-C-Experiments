use serde::{Deserialize, Serialize};

use crate::mahamaya::MahamayaCodecProjection;

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MathemeBinaryProjection {
    pub mahamaya_address64: Option<u8>,
    pub codon: Option<String>,
    pub hexagram: Option<String>,
    pub line_change_operator: Option<String>,
    pub hexagram_id: u8,
    /// King Wen ordinal (1..=64) of `hexagram_id` (Fu-Xi address64). King Wen
    /// ordering is a distinct permutation, translated by the kernel-owned
    /// `KING_WEN_FROM_ADDRESS64` LUT — the bus carries BOTH orderings so a
    /// carrier can label/light either honestly.
    pub king_wen: u8,
    pub upper_trigram: u8,
    pub lower_trigram: u8,
    pub codon_id: u8,
    pub nucleotide_bits: [u8; 3],
    pub dna_rna_phase: String,
    pub line_index: u8,
    pub line_change_operator_address: u16,
    pub m2_vibration_index: usize,
    pub m2_to_m3_symbol: u8,
    pub round_trip_loss: bool,
    pub tarot_minor_id: Option<u8>,
    pub tarot_shadow_codon: Option<u8>,
    pub amino_acid_code: Option<String>,
    pub dataset_lut_state: String,
    pub transcription_state: String,
    pub frame_breathing_role: String,
    pub m3_codec_provenance: String,
}

impl MathemeBinaryProjection {
    pub(in crate::kernel) fn from_clock(
        degree360: u16,
        position: u8,
        m2_vibration_index: usize,
        rna_phase: bool,
    ) -> Self {
        let codec =
            MahamayaCodecProjection::from_clock(degree360, position, m2_vibration_index, rna_phase);
        Self {
            mahamaya_address64: Some(codec.address64),
            codon: Some(codec.codon),
            hexagram: Some(format!("H{:02}", codec.hexagram_id + 1)),
            line_change_operator: Some(format!(
                "H{:02}.{}",
                codec.hexagram_id + 1,
                codec.line_index + 1
            )),
            hexagram_id: codec.hexagram_id,
            king_wen: codec.king_wen,
            upper_trigram: codec.upper_trigram,
            lower_trigram: codec.lower_trigram,
            codon_id: codec.codon_id,
            nucleotide_bits: codec.nucleotide_bits,
            dna_rna_phase: codec.dna_rna_phase,
            line_index: codec.line_index,
            line_change_operator_address: codec.line_change_operator,
            m2_vibration_index: codec.m2_vibration_index,
            m2_to_m3_symbol: codec.m2_to_m3_symbol,
            round_trip_loss: codec.round_trip_loss,
            tarot_minor_id: None,
            tarot_shadow_codon: None,
            amino_acid_code: None,
            dataset_lut_state: "pending-dataset-lut".to_owned(),
            transcription_state: codec.transcription_state,
            frame_breathing_role: match position {
                0 | 5 => "sq1-boundary-totality",
                1 | 4 => "sq2-active-tritone",
                _ => "sq3-inner-epogdoon",
            }
            .to_owned(),
            m3_codec_provenance: "portal-core::mahamaya address law; tarot/amino LUTs pending"
                .to_owned(),
        }
    }
}
