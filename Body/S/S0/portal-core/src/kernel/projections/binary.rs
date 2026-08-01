use serde::{Deserialize, Serialize};

use crate::m3_transcription_bridge::{major_arcana, minor_arcana_id_from_codon};
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
    /// Minor-arcana card id (0..=55) of `codon_id`, from the kernel-owned
    /// 56-card primary-codon cover (`m3.h M3_MINOR_ARCANA_COUNT`, mirrored by
    /// `m3_transcription_bridge::minor_arcana_id_from_codon`). `None` is the
    /// honest "this codon is not a minor-arcana primary" answer — 56 of the 64
    /// codons carry a card; the other 8 are the exact-cover remainder
    /// ([[M3'-SPEC]] §8.7 `56 + 8`), not a missing producer.
    pub tarot_minor_id: Option<u8>,
    /// WC-M3-SA-2 (24.T24.6) — major-arcana card id (0..=21) of `codon_id`,
    /// mirroring the kernel authority `m3_major_arcana_from_codon` (m3.c) via
    /// `m3_transcription_bridge::major_arcana`. `None` is the STOP-codon answer
    /// (the C util's `0xFF`): STOP codons carry no arcana, so the renderer shows
    /// honest-pending for the active card rather than inventing one.
    pub tarot_major_arcana_card_id: Option<u8>,
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
            // 24.T24.6 — both tarot ids are now MIRRORED off the kernel LUTs
            // rather than stubbed. They were `None` because nothing wired them,
            // not because the law was missing: the 56-card cover and the
            // codon→amino-acid→arcana transcription have been kernel-owned since
            // m3.c. A stub here made the whole tarot lane read as unlanded.
            tarot_minor_id: minor_arcana_id_from_codon(codec.codon_id),
            tarot_major_arcana_card_id: major_arcana(codec.codon_id).map(|card| card.card_id),
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
            m3_codec_provenance:
                "portal-core::mahamaya address law; tarot ids from m3_transcription_bridge \
                 (kernel m3.c parity); amino LUT pending"
                    .to_owned(),
        }
    }
}
