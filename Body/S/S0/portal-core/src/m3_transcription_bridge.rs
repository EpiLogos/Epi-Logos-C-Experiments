use std::os::raw::c_schar;

use serde::{Deserialize, Serialize};

use crate::codon::codon_to_amino_acid;
use crate::kernel::KernelTick;
use crate::transcription::transcribe_degree_from_lut;
use crate::vak_address::{canonical_cf_position, CfPosition, VakAddress};

use epi_lib as _;

pub type ClockDegree = u16;
pub type TickIndex = KernelTick;
pub type Codon6Bit = u8;
pub type AminoAcidIndex = u8;
pub type AnandaPosition = u8;

const DR_RING_MAHAMAYA: [u8; 6] = [1, 2, 4, 8, 7, 5];
const DR_RING_PARASHAKTI: [u8; 6] = [3, 6, 9, 3, 6, 9];

#[repr(C)]
#[derive(Clone, Copy, Debug)]
pub struct ClockDegreeEntry {
    pub degree_node_360: u16,
    pub exact_degree_720: f32,
    pub zodiac_sign: u8,
    pub zodiac_degree: u8,
    pub decan_idx: u8,
    pub decan_position: u8,
    pub is_backbone_node: u8,
    pub hexagram_id: u8,
    pub hexagram_line_active: u8,
    pub is_non_dual_codon: u8,
    pub codon_class: u8,
    pub codon_upper_pair: u8,
    pub codon_lower_pair: u8,
    pub tarot_card_id: u8,
    pub decan_planet: u8,
    pub decan_element: u8,
    pub decan_chakra: u8,
    pub tick12: u8,
    pub strand: u8,
    pub dr_ring: u8,
    pub m1_ananda_value: u8,
    pub m0_archetype: u8,
    pub shadow_degree: u16,
    pub polar_opposite: u16,
    pub enneadic_chamber: u8,
    pub chamber_day_night: u8,
}

extern "C" {
    fn m3_compute_charges_ffi(
        codon6bit: u8,
        pp_out: *mut c_schar,
        nn_out: *mut c_schar,
        np_out: *mut c_schar,
        pn_out: *mut c_schar,
    );
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum M3Error {
    UnknownCfMapping { cf: String },
}

impl std::fmt::Display for M3Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::UnknownCfMapping { cf } => write!(f, "unknown VAK CF mapping: {cf}"),
        }
    }
}

impl std::error::Error for M3Error {}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum DiatonicPosition {
    C,
    D,
    E,
    F,
    G,
    A,
    B,
    CPrime,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum CFMapping {
    Truth,
    Mind,
    Word,
    Logos,
    Decision,
    Love,
    Work,
    TruthReturn,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum Element {
    Water,
    Fire,
    Earth,
    Air,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
#[repr(u8)]
pub enum AnandaFamily {
    Bimba = 0,
    Pratibimba = 1,
    Sum = 2,
    DiffA = 3,
    DiffB = 4,
    Quintessence = 5,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QuaternionCharges {
    pub pp: i8,
    pub nn: i8,
    pub np: i8,
    pub pn: i8,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TaoEvaluation {
    pub yin_yang: i8,
    pub yang_yin: i8,
    pub four_x_invariant: i16,
    pub read: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MajorArcanaCard {
    pub card_id: u8,
    pub name: String,
    pub chromosome_pair: u8,
    pub amino_acid_index: AminoAcidIndex,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MinorArcanaCard {
    pub card_id: u8,
    pub suit: String,
    pub rank: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnandaProjection {
    pub route: String,
    pub position: AnandaPosition,
    pub family: AnandaFamily,
    pub mahamaya_dr_projection: u8,
    pub parashakti_dr_projection: u8,
    pub spanda_stage: u8,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct M3TranscriptionPacket {
    pub diatonic_position: DiatonicPosition,
    pub cf_mapping: CFMapping,
    pub epogdoon_step_count: u32,
    pub harmonic_ratios_active: [f32; 4],
    pub codon: Codon6Bit,
    pub amino_acid: AminoAcidIndex,
    pub charges: QuaternionCharges,
    pub tao_evaluation: TaoEvaluation,
    pub hexagram_id: u8,
    pub major_arcana: Option<MajorArcanaCard>,
    pub minor_arcana: Option<MinorArcanaCard>,
    pub suit_element: Option<Element>,
    pub ananda_position: AnandaPosition,
    pub ananda_family: AnandaFamily,
    pub mahamaya_dr_projection: u8,
    pub parashakti_dr_projection: u8,
    pub spanda_stage: u8,
}

pub fn m3_transcription_projection(
    vak_coord: &VakAddress,
    tick: TickIndex,
    clock_degree: ClockDegree,
) -> Result<M3TranscriptionPacket, M3Error> {
    let entry = clock_degree_entry(clock_degree);
    let cf = musical_cf_projection(vak_coord)?;
    let position6 = cf_position6(vak_coord)?;
    let ananda_position = ananda_position_for_tick(position6, tick.sub_tick);
    let ananda = ananda_projection_from_position_and_stage(ananda_position, position6);
    let codon = entry.hexagram_id & 0x3F;
    let charges = compute_charges(codon);

    Ok(M3TranscriptionPacket {
        diatonic_position: cf.0,
        cf_mapping: cf.1,
        epogdoon_step_count: tick.cycle as u32 * 12 + tick.sub_tick as u32,
        harmonic_ratios_active: harmonic_ratios_active(tick.harmonic_ratio, position6),
        codon,
        amino_acid: codon_to_amino_acid(codon),
        charges,
        tao_evaluation: tao_evaluation(charges),
        hexagram_id: entry.hexagram_id,
        major_arcana: major_arcana(codon),
        minor_arcana: minor_arcana(entry.tarot_card_id),
        suit_element: suit_element(entry.tarot_card_id),
        ananda_position: ananda.position,
        ananda_family: ananda.family,
        mahamaya_dr_projection: ananda.mahamaya_dr_projection,
        parashakti_dr_projection: ananda.parashakti_dr_projection,
        spanda_stage: ananda.spanda_stage,
    })
}

pub fn ananda_projection(vak_coord: &VakAddress) -> Result<AnandaProjection, M3Error> {
    let position = cf_position6(vak_coord)?;
    Ok(ananda_projection_from_position_and_stage(
        position, position,
    ))
}

pub fn clock_degree_entry(clock_degree: ClockDegree) -> ClockDegreeEntry {
    let degree = clock_degree % 360;
    let step = transcribe_degree_from_lut(degree);
    let tick12 = ((degree / 30) % 12) as u8;
    let decan_idx = (degree / 10) as u8;
    ClockDegreeEntry {
        degree_node_360: degree,
        exact_degree_720: degree as f32 * 2.0,
        zodiac_sign: (degree / 30) as u8,
        zodiac_degree: (degree % 30) as u8,
        decan_idx,
        decan_position: (degree % 10) as u8,
        is_backbone_node: ((degree % 15) == 0) as u8,
        hexagram_id: step.hexagram,
        hexagram_line_active: (degree % 6) as u8,
        is_non_dual_codon: is_non_dual_codon(step.codon) as u8,
        codon_class: codon_class(step.codon),
        codon_upper_pair: (step.codon >> 4) & 0x03,
        codon_lower_pair: step.codon & 0x03,
        tarot_card_id: minor_arcana_id_from_codon(step.codon).unwrap_or(0),
        decan_planet: decan_idx % 10,
        decan_element: decan_idx % 4,
        decan_chakra: decan_idx % 8,
        tick12,
        strand: (degree >= 180) as u8,
        dr_ring: (tick12 >= 6) as u8,
        m1_ananda_value: DR_RING_MAHAMAYA[(tick12 % 6) as usize],
        m0_archetype: tick12,
        shadow_degree: degree + 360,
        polar_opposite: (degree + 180) % 360,
        enneadic_chamber: (degree / 40) as u8,
        chamber_day_night: ((degree % 40) >= 20) as u8,
    }
}

fn compute_charges(codon: Codon6Bit) -> QuaternionCharges {
    let mut pp = 0;
    let mut nn = 0;
    let mut np = 0;
    let mut pn = 0;
    unsafe {
        m3_compute_charges_ffi(codon, &mut pp, &mut nn, &mut np, &mut pn);
    }
    QuaternionCharges { pp, nn, np, pn }
}

fn musical_cf_projection(vak_coord: &VakAddress) -> Result<(DiatonicPosition, CFMapping), M3Error> {
    let cf = canonical_cf_position(&vak_coord.cf).ok_or_else(|| M3Error::UnknownCfMapping {
        cf: vak_coord.cf.clone(),
    })?;
    Ok(match cf {
        CfPosition::Inner0 => (DiatonicPosition::C, CFMapping::Truth),
        CfPosition::Inner1 => (DiatonicPosition::D, CFMapping::Mind),
        CfPosition::Inner2 => (DiatonicPosition::E, CFMapping::Word),
        CfPosition::Inner3 => (DiatonicPosition::F, CFMapping::Logos),
        CfPosition::Inner4 => (DiatonicPosition::G, CFMapping::Decision),
        CfPosition::Inner5 => (DiatonicPosition::A, CFMapping::Love),
        CfPosition::LemniscateStage5 => (DiatonicPosition::B, CFMapping::Work),
        CfPosition::Outer4Parent => (DiatonicPosition::CPrime, CFMapping::TruthReturn),
    })
}

fn cf_position6(vak_coord: &VakAddress) -> Result<u8, M3Error> {
    let cf = canonical_cf_position(&vak_coord.cf).ok_or_else(|| M3Error::UnknownCfMapping {
        cf: vak_coord.cf.clone(),
    })?;
    Ok(match cf {
        CfPosition::Inner0 => 0,
        CfPosition::Inner1 => 1,
        CfPosition::Inner2 => 2,
        CfPosition::Inner3 => 3,
        CfPosition::Inner4 | CfPosition::Outer4Parent => 4,
        CfPosition::Inner5 | CfPosition::LemniscateStage5 => 5,
    })
}

fn ananda_position_for_tick(position6: u8, tick12: u8) -> u8 {
    let position = position6 % 6;
    if tick12 % 12 < 6 {
        position
    } else {
        11 - position
    }
}

fn ananda_projection_from_position_and_stage(position: u8, stage: u8) -> AnandaProjection {
    let stage = stage % 6;
    AnandaProjection {
        route: "s2.graph.ananda_position".to_owned(),
        position,
        family: ananda_family(stage),
        mahamaya_dr_projection: DR_RING_MAHAMAYA[stage as usize],
        parashakti_dr_projection: DR_RING_PARASHAKTI[stage as usize],
        spanda_stage: stage,
    }
}

fn ananda_family(stage: u8) -> AnandaFamily {
    match stage % 6 {
        0 => AnandaFamily::Bimba,
        1 => AnandaFamily::Pratibimba,
        2 => AnandaFamily::Sum,
        3 => AnandaFamily::DiffA,
        4 => AnandaFamily::DiffB,
        _ => AnandaFamily::Quintessence,
    }
}

fn harmonic_ratios_active(tick_ratio: f32, position6: u8) -> [f32; 4] {
    let mut ratios = [4.0 / 3.0, 3.0 / 4.0, 2.0 / 3.0, 3.0 / 2.0];
    ratios[(position6 % 4) as usize] *= tick_ratio;
    ratios
}

fn tao_evaluation(charges: QuaternionCharges) -> TaoEvaluation {
    TaoEvaluation {
        yin_yang: charges.np,
        yang_yin: charges.pn,
        four_x_invariant: charges.pp as i16
            + charges.nn as i16
            + charges.np as i16
            + charges.pn as i16,
        read: format!("0/1:{} <-> 1/0:{}", charges.np, charges.pn),
    }
}

fn major_arcana(codon: Codon6Bit) -> Option<MajorArcanaCard> {
    const MAJOR_ARCANA_NAMES: [&str; 22] = [
        "The Fool",
        "The Magician",
        "The High Priestess",
        "The Empress",
        "The Emperor",
        "The Hierophant",
        "The Lovers",
        "The Chariot",
        "Adjustment",
        "The Hermit",
        "Wheel of Fortune",
        "Lust",
        "The Hanged Man",
        "Death",
        "Art",
        "The Devil",
        "The Tower",
        "The Star",
        "The Moon",
        "The Sun",
        "Aeon",
        "The Universe",
    ];
    let amino_acid_index = codon_to_amino_acid(codon);
    if amino_acid_index == 10 || amino_acid_index >= MAJOR_ARCANA_NAMES.len() as u8 {
        return None;
    }
    Some(MajorArcanaCard {
        card_id: amino_acid_index,
        name: MAJOR_ARCANA_NAMES[amino_acid_index as usize].to_owned(),
        chromosome_pair: amino_acid_index + 1,
        amino_acid_index,
    })
}

fn minor_arcana(card_id: u8) -> Option<MinorArcanaCard> {
    if card_id >= 56 {
        return None;
    }
    let suit = card_id / 14;
    let rank = card_id % 14;
    Some(MinorArcanaCard {
        card_id,
        suit: suit_name(suit).to_owned(),
        rank: rank_name(rank).to_owned(),
    })
}

fn suit_element(card_id: u8) -> Option<Element> {
    if card_id >= 56 {
        return None;
    }
    match card_id / 14 {
        0 => Some(Element::Water),
        1 => Some(Element::Fire),
        2 => Some(Element::Earth),
        3 => Some(Element::Air),
        _ => None,
    }
}

fn minor_arcana_id_from_codon(codon: Codon6Bit) -> Option<u8> {
    const PRIMARY_CODONS_BY_CARD: [u8; 56] = [
        0, 3, 1, 10, 7, 12, 13, 15, 5, 4, 8, 11, 2, 9, 21, 20, 22, 31, 18, 24, 26, 16, 25, 17, 19,
        29, 27, 23, 42, 43, 41, 32, 46, 47, 45, 39, 37, 38, 40, 44, 63, 60, 62, 49, 56, 50, 48, 52,
        55, 61, 54, 51, 53, 57, 58, 59,
    ];
    PRIMARY_CODONS_BY_CARD
        .iter()
        .position(|candidate| *candidate == codon)
        .map(|idx| idx as u8)
}

fn is_non_dual_codon(codon: Codon6Bit) -> bool {
    ((codon >> 4) & 0x03) == (codon & 0x03)
}

fn codon_class(codon: Codon6Bit) -> u8 {
    let n1 = (codon >> 4) & 0x03;
    let n2 = (codon >> 2) & 0x03;
    let n3 = codon & 0x03;
    if n1 == n3 {
        if n1 == n2 {
            0
        } else {
            1
        }
    } else if n1 == n2 || n2 == n3 {
        2
    } else {
        3
    }
}

fn suit_name(suit: u8) -> &'static str {
    match suit {
        0 => "Cups",
        1 => "Wands",
        2 => "Pentacles",
        3 => "Swords",
        _ => "Unknown",
    }
}

fn rank_name(rank: u8) -> &'static str {
    match rank {
        0 => "Ace",
        1 => "Two",
        2 => "Three",
        3 => "Four",
        4 => "Five",
        5 => "Six",
        6 => "Seven",
        7 => "Eight",
        8 => "Nine",
        9 => "Ten",
        10 => "Page",
        11 => "Knight",
        12 => "Queen",
        13 => "King",
        _ => "Unknown",
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::kernel::kernel_tick_from_epogdoon;
    use crate::vak_address::{CpfState, CsDirection, CsField};

    fn vak(cf: &str) -> VakAddress {
        VakAddress {
            cpf: CpfState::Mechanistic,
            ct: vec!["CT3".to_owned()],
            cp: "4.3".to_owned(),
            cf: cf.to_owned(),
            cfp: "M3".to_owned(),
            cs: CsField {
                code: "CS0".to_owned(),
                direction: CsDirection::Day,
            },
        }
    }

    #[test]
    fn m3_transcription_projection_round_trip() {
        let degree = 45;
        let tick = kernel_tick_from_epogdoon(2, 8);
        let packet = m3_transcription_projection(&vak("(0/1/2/3)"), tick, degree).unwrap();
        let lut = clock_degree_entry(degree);

        assert_eq!(packet.codon, lut.hexagram_id & 0x3F);
        assert_eq!(packet.hexagram_id, lut.hexagram_id);
        assert_eq!(
            packet.minor_arcana.as_ref().map(|card| card.card_id),
            Some(lut.tarot_card_id)
        );
        assert_eq!(packet.ananda_position, 8);
        assert_eq!(packet.ananda_family, AnandaFamily::DiffA);
        assert_eq!(packet.spanda_stage, 3);
        assert_eq!(packet.mahamaya_dr_projection, 8);
        assert_eq!(packet.parashakti_dr_projection, 3);
        assert_eq!(packet.diatonic_position, DiatonicPosition::F);
        assert_eq!(packet.cf_mapping, CFMapping::Logos);
        assert_eq!(
            packet.tao_evaluation.four_x_invariant,
            4 * nucleotide_iching_value((packet.codon >> 4) & 0x03) as i16
        );
    }

    #[test]
    fn ananda_projection_uses_coordinate_position_without_tick_descent() {
        let projection = ananda_projection(&vak("(4/5/0)")).unwrap();

        assert_eq!(projection.route, "s2.graph.ananda_position");
        assert_eq!(projection.position, 4);
        assert_eq!(projection.family, AnandaFamily::DiffB);
        assert_eq!(projection.mahamaya_dr_projection, 7);
        assert_eq!(projection.parashakti_dr_projection, 6);
    }

    fn nucleotide_iching_value(nuc: u8) -> u8 {
        [6, 9, 7, 8][(nuc & 0x03) as usize]
    }
}
