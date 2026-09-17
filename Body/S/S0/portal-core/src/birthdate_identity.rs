use std::collections::BTreeMap;
use std::error::Error;
use std::fmt;

use chrono::{Datelike, NaiveDate};
use serde::{Deserialize, Serialize};

use crate::quaternion::quat_normalize;

const LENSES: [&str; 12] = [
    "L0", "L0p", "L1", "L1p", "L2", "L2p", "L3", "L3p", "L4", "L4p", "L5", "L5p",
];
const PITCHES: [&str; 12] = [
    "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#/Bb", "B",
];

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum IdentityDateRole {
    Birth,
    Reception,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct IdentityPacket {
    pub primary_name: String,
    pub date: NaiveDate,
    pub date_role: IdentityDateRole,
}

impl IdentityPacket {
    pub fn birth(primary_name: impl Into<String>, date: NaiveDate) -> Self {
        Self {
            primary_name: primary_name.into(),
            date,
            date_role: IdentityDateRole::Birth,
        }
    }

    pub fn reception(primary_name: impl Into<String>, date: NaiveDate) -> Self {
        Self {
            primary_name: primary_name.into(),
            date,
            date_role: IdentityDateRole::Reception,
        }
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BirthdateEncodingOutput {
    pub layer_id: String,
    pub layer_name: String,
    pub input: IdentityPacket,
    pub config: BirthdateEncodingConfig,
    pub pythagorean: PythagoreanReport,
    pub ql: QlReport,
    pub mef: MefReport,
    pub elemental: ElementalContribution,
    pub music_handoff: MusicHandoff,
    pub evidence_paths: Vec<EvidencePath>,
    pub warnings: Vec<String>,
}

impl BirthdateEncodingOutput {
    pub fn datum(&self, datum_id: &str) -> Option<&EvidencePath> {
        self.evidence_paths
            .iter()
            .find(|path| path.datum_id == datum_id)
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BirthdateEncodingConfig {
    pub y_policy: YPolicy,
    pub full_pass_factor: f32,
    pub anchor_factor: f32,
    pub inverse_factor: f32,
    pub square_factor: f32,
    pub mobius_factor: f32,
    pub spanda_factor: f32,
    pub tritone_factor: f32,
    pub position_element_factor: f32,
    pub lens_element_factor: f32,
    pub cap_factor: f32,
    pub direct_element_bonus: f32,
}

impl Default for BirthdateEncodingConfig {
    fn default() -> Self {
        Self {
            y_policy: YPolicy::Consonant,
            full_pass_factor: 0.35,
            anchor_factor: 1.00,
            inverse_factor: 0.50,
            square_factor: 0.25,
            mobius_factor: 0.40,
            spanda_factor: 0.35,
            tritone_factor: 0.30,
            position_element_factor: 1.00,
            lens_element_factor: 0.35,
            cap_factor: 1.00,
            direct_element_bonus: 1.50,
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum YPolicy {
    Consonant,
    Vowel,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PythagoreanReport {
    pub alphabet_map: BTreeMap<char, u8>,
    pub y_policy: YPolicy,
    pub totals: Vec<Datum>,
    pub inclusion_counts_1_to_9: BTreeMap<u8, u16>,
    pub letter_stream: Vec<LetterValue>,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LetterValue {
    pub letter: char,
    pub value: u8,
    pub word_index: usize,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Datum {
    pub datum_id: String,
    pub datum_role: String,
    pub raw_value: u32,
    pub weight: u8,
    pub compound: CompoundTrail,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CompoundTrail {
    pub raw: u32,
    pub steps: Vec<u32>,
    pub root9: u8,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub master_flag: Option<u8>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub karmic_debt_flag: Option<u8>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QlReport {
    pub datum_vectors: Vec<QlDatumVector>,
    pub position_scores: [f32; 6],
    pub inverse_axis_scores: InverseAxisScores,
    pub chromatic_scores: [f32; 12],
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QlDatumVector {
    pub datum_id: String,
    pub mod6: u8,
    pub inverse: u8,
    pub vector: String,
    pub mod12: u8,
    pub anchor_lens: String,
}

#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InverseAxisScores {
    pub axis05: f32,
    pub axis14: f32,
    pub axis23: f32,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MefReport {
    pub matrices: MefMatrices,
    pub dominant_cells: Vec<ScoredCell>,
    pub dominant_lenses: Vec<ScoredLens>,
    pub dominant_squares: Vec<ScoredSquare>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MefMatrices {
    pub full_pass: ResonanceMatrix,
    pub anchor_bias: ResonanceMatrix,
    pub square_diffuse: ResonanceMatrix,
    pub total: ResonanceMatrix,
}

pub type ResonanceMatrix = BTreeMap<String, [f32; 6]>;

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScoredCell {
    pub cell: String,
    pub score: f32,
    pub meaning: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScoredLens {
    pub lens: String,
    pub score: f32,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScoredSquare {
    pub square: String,
    pub score: f32,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ElementalContribution {
    pub raw: ElementalRawScores,
    pub normalized_quaternion: [f32; 4],
    pub dominant_elements: Vec<String>,
    pub caps: ElementalCaps,
}

#[derive(Clone, Copy, Debug, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ElementalRawScores {
    pub earth: f32,
    pub water: f32,
    pub fire: f32,
    pub air: f32,
    pub aether_gate: f32,
    pub mineral_cap: f32,
}

#[derive(Clone, Copy, Debug, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ElementalCaps {
    pub aether_gate: f32,
    pub mineral_cap: f32,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MusicHandoff {
    pub scale_beneath_candidates: Vec<ScaleCandidate>,
    pub cf_mode_candidates: Vec<ModeCandidate>,
    pub motif_vectors: Vec<String>,
    pub chromatic_anchors: Vec<ChromaticAnchor>,
    pub element_timbre_vector: ElementalContribution,
    pub unresolved_tensions: Vec<String>,
    pub healing_vectors: Vec<String>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScaleCandidate {
    pub source: String,
    pub c12: u8,
    pub pitch: String,
    pub lens: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ModeCandidate {
    pub source: String,
    pub position: u8,
    pub vector: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChromaticAnchor {
    pub c12: u8,
    pub pitch: String,
    pub lens: String,
    pub weight: f32,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EvidencePath {
    pub datum_id: String,
    pub datum_role: String,
    pub raw_value: u32,
    pub pythagorean: CompoundTrail,
    pub mod6: u8,
    pub inverse: u8,
    pub vector: String,
    pub mod12: u8,
    pub anchor_lens: String,
    pub anchor_pitch: String,
    pub direct_cell: String,
    pub direct_cell_meaning: String,
    pub full_pass_cells: Vec<String>,
    pub square: String,
    pub square_meaning: String,
    pub related_lenses: RelatedLenses,
    pub element_projection: ElementProjection,
    pub contribution: EvidenceContribution,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RelatedLenses {
    pub x_prime_partner: String,
    pub square_complement: String,
    pub mobius_return: String,
    pub tritone_mirror: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ElementProjection {
    pub position_element: String,
    pub lens_native_element: String,
    pub direct_alchemical: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EvidenceContribution {
    pub matrix_score: f32,
    pub elemental_score_delta: ElementalRawScores,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum IdentityLayerStatus {
    Resolved,
    Pending,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct IdentityLayerBranch {
    pub layer_id: String,
    pub layer_name: String,
    pub status: IdentityLayerStatus,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub output_ref: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub pending_reason: Option<String>,
    pub evidence_paths: Vec<String>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct M4IdentityBranch {
    pub branch_id: String,
    pub branch_name: String,
    pub layers: Vec<IdentityLayerBranch>,
}

impl M4IdentityBranch {
    pub fn from_birthdate_encoding(output: BirthdateEncodingOutput) -> Self {
        let output_ref = format!(
            "portal-core::birthdate_identity::{}:{}",
            output.layer_id,
            birthdate_output_hash(&output)
        );
        let evidence_paths = output
            .evidence_paths
            .iter()
            .map(|path| path.datum_id.clone())
            .collect();
        Self {
            branch_id: "M4-0".to_owned(),
            branch_name: "Identity-system evidence branch".to_owned(),
            layers: vec![
                IdentityLayerBranch {
                    layer_id: "M4-0-0".to_owned(),
                    layer_name: "Birthdate Encoding".to_owned(),
                    status: IdentityLayerStatus::Resolved,
                    output_ref: Some(output_ref),
                    pending_reason: None,
                    evidence_paths,
                },
                pending_layer("M4-0-1", "Astrological Chart Layer"),
                pending_layer("M4-0-2", "Jungian 16-Personality Layer"),
                pending_layer("M4-0-3", "Gene Keys Layer"),
                pending_layer("M4-0-4", "Human Design Layer"),
                pending_layer("M4-0-5", "Identity Quintessence Integration"),
            ],
        }
    }

    pub fn layer(&self, layer_id: &str) -> Option<&IdentityLayerBranch> {
        self.layers.iter().find(|layer| layer.layer_id == layer_id)
    }
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum BirthdateEncodingError {
    EmptyName,
    NoPythagoreanLetters,
}

impl fmt::Display for BirthdateEncodingError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::EmptyName => write!(f, "primary_name is required"),
            Self::NoPythagoreanLetters => {
                write!(f, "primary_name must contain at least one ASCII letter")
            }
        }
    }
}

impl Error for BirthdateEncodingError {}

pub fn run_m4_0_0_birthdate_encoding(
    packet: IdentityPacket,
) -> Result<BirthdateEncodingOutput, BirthdateEncodingError> {
    run_m4_0_0_birthdate_encoding_with_config(packet, BirthdateEncodingConfig::default())
}

pub fn run_m4_0_0_birthdate_encoding_with_config(
    packet: IdentityPacket,
    config: BirthdateEncodingConfig,
) -> Result<BirthdateEncodingOutput, BirthdateEncodingError> {
    if packet.primary_name.trim().is_empty() {
        return Err(BirthdateEncodingError::EmptyName);
    }

    let (letter_stream, inclusion_counts) = letter_stream(&packet, &config)?;
    let mut totals = pythagorean_datums(&packet, &letter_stream);
    let full_name_total = totals
        .iter()
        .find(|datum| datum.datum_id == "full_name")
        .map(|datum| datum.raw_value)
        .expect("full-name datum is always inserted");
    let date_digit_total = totals
        .iter()
        .find(|datum| datum.datum_id == "date_digit_total")
        .map(|datum| datum.raw_value)
        .expect("date datum is always inserted");
    totals.push(datum(
        "name_date_synthesis",
        "name_date_synthesis",
        full_name_total + date_digit_total,
        6,
    ));

    let mut matrices = MefMatrices {
        full_pass: init_matrix(),
        anchor_bias: init_matrix(),
        square_diffuse: init_matrix(),
        total: init_matrix(),
    };
    let mut evidence_paths = Vec::new();
    let mut ql_vectors = Vec::new();
    let mut position_scores = [0.0f32; 6];
    let mut chromatic_scores = [0.0f32; 12];

    for datum in &totals {
        let p = (datum.raw_value % 6) as u8;
        let p_inv = 5 - p;
        let c12 = (datum.raw_value % 12) as u8;
        let lens = LENSES[c12 as usize];
        let weight = datum.weight as f32;
        let related = RelatedLenses {
            x_prime_partner: x_prime_partner(lens).to_owned(),
            square_complement: square_complement(lens).to_owned(),
            mobius_return: mobius_return(lens).to_owned(),
            tritone_mirror: tritone_mirror(lens).to_owned(),
        };

        position_scores[p as usize] += weight;
        position_scores[p_inv as usize] += weight * config.inverse_factor;
        chromatic_scores[c12 as usize] += weight;

        for full_lens in LENSES {
            let affinity = role_lens_affinity(&datum.datum_role, full_lens);
            add_score(
                &mut matrices.full_pass,
                full_lens,
                p,
                weight * config.full_pass_factor * affinity,
            );
            add_score(
                &mut matrices.full_pass,
                full_lens,
                p_inv,
                weight * config.full_pass_factor * config.inverse_factor * affinity,
            );
        }

        add_score(
            &mut matrices.anchor_bias,
            lens,
            p,
            weight * config.anchor_factor,
        );
        add_score(
            &mut matrices.anchor_bias,
            lens,
            p_inv,
            weight * config.anchor_factor * config.inverse_factor,
        );

        for square_lens in square_lenses(lens) {
            add_score(
                &mut matrices.square_diffuse,
                square_lens,
                p,
                weight * config.square_factor,
            );
            add_score(
                &mut matrices.square_diffuse,
                square_lens,
                p_inv,
                weight * config.square_factor * config.inverse_factor,
            );
        }
        add_score(
            &mut matrices.square_diffuse,
            related.mobius_return.as_str(),
            p,
            weight * config.mobius_factor,
        );
        add_score(
            &mut matrices.square_diffuse,
            related.x_prime_partner.as_str(),
            p,
            weight * config.spanda_factor,
        );
        add_score(
            &mut matrices.square_diffuse,
            related.tritone_mirror.as_str(),
            p,
            weight * config.tritone_factor,
        );

        ql_vectors.push(QlDatumVector {
            datum_id: datum.datum_id.clone(),
            mod6: p,
            inverse: p_inv,
            vector: vector_label(p, p_inv),
            mod12: c12,
            anchor_lens: lens.to_owned(),
        });

        evidence_paths.push(EvidencePath {
            datum_id: datum.datum_id.clone(),
            datum_role: datum.datum_role.clone(),
            raw_value: datum.raw_value,
            pythagorean: datum.compound.clone(),
            mod6: p,
            inverse: p_inv,
            vector: vector_label(p, p_inv),
            mod12: c12,
            anchor_lens: lens.to_owned(),
            anchor_pitch: PITCHES[c12 as usize].to_owned(),
            direct_cell: cell_id(lens, p),
            direct_cell_meaning: cell_meaning(lens, p).to_owned(),
            full_pass_cells: full_pass_cells(p, p_inv),
            square: square_id(lens).to_owned(),
            square_meaning: square_meaning(lens).to_owned(),
            related_lenses: related,
            element_projection: ElementProjection {
                position_element: element_from_position(p).to_owned(),
                lens_native_element: lens_native_element(lens).to_owned(),
                direct_alchemical: lens == "L2p",
            },
            contribution: EvidenceContribution {
                matrix_score: 0.0,
                elemental_score_delta: ElementalRawScores::default(),
            },
        });
    }

    matrices.total = combine_matrices(&matrices);
    let elemental = extract_elemental(&matrices.total, &evidence_paths, &totals, &config);
    annotate_evidence_contributions(&mut evidence_paths, &matrices.total, &config);

    let music_handoff = derive_music_handoff(&evidence_paths, &elemental);
    Ok(BirthdateEncodingOutput {
        layer_id: "M4-0-0".to_owned(),
        layer_name: "Birthdate Encoding".to_owned(),
        input: packet,
        config: config.clone(),
        pythagorean: PythagoreanReport {
            alphabet_map: alphabet_map(),
            y_policy: config.y_policy,
            totals,
            inclusion_counts_1_to_9: inclusion_counts,
            letter_stream,
        },
        ql: QlReport {
            datum_vectors: ql_vectors,
            position_scores,
            inverse_axis_scores: inverse_axis_scores(position_scores),
            chromatic_scores,
        },
        mef: MefReport {
            dominant_cells: dominant_cells(&matrices.total),
            dominant_lenses: dominant_lenses(&matrices.total),
            dominant_squares: dominant_squares(&matrices.total),
            matrices,
        },
        elemental: elemental.clone(),
        music_handoff,
        evidence_paths,
        warnings: vec!["M4-0-0 is identity-system evidence, not the living user".to_owned()],
    })
}

fn pending_layer(layer_id: &str, layer_name: &str) -> IdentityLayerBranch {
    IdentityLayerBranch {
        layer_id: layer_id.to_owned(),
        layer_name: layer_name.to_owned(),
        status: IdentityLayerStatus::Pending,
        output_ref: None,
        pending_reason: Some("source evidence not supplied".to_owned()),
        evidence_paths: Vec::new(),
    }
}

fn letter_stream(
    packet: &IdentityPacket,
    config: &BirthdateEncodingConfig,
) -> Result<(Vec<LetterValue>, BTreeMap<u8, u16>), BirthdateEncodingError> {
    let mut stream = Vec::new();
    let mut counts = BTreeMap::from_iter((1u8..=9).map(|value| (value, 0u16)));
    for (word_index, word) in packet
        .primary_name
        .split(|c: char| c.is_whitespace() || c == '-')
        .enumerate()
    {
        for letter in word.chars().filter_map(normalize_letter) {
            let value = pythagorean_value(letter);
            *counts.entry(value).or_default() += 1;
            stream.push(LetterValue {
                letter,
                value,
                word_index,
            });
            if letter == 'Y' && config.y_policy == YPolicy::Vowel {
                // Y's numeric value is stable; the policy affects vowel/consonant
                // grouping, handled during total extraction.
            }
        }
    }
    if stream.is_empty() {
        Err(BirthdateEncodingError::NoPythagoreanLetters)
    } else {
        Ok((stream, counts))
    }
}

fn pythagorean_datums(packet: &IdentityPacket, stream: &[LetterValue]) -> Vec<Datum> {
    let full_name_total = stream.iter().map(|letter| letter.value as u32).sum::<u32>();
    let vowel_total = stream
        .iter()
        .filter(|letter| is_vowel(letter.letter))
        .map(|letter| letter.value as u32)
        .sum::<u32>();
    let consonant_total = full_name_total - vowel_total;
    let date_digit_total = date_digit_total(packet.date);
    vec![
        datum("full_name", "full_name", full_name_total, 5),
        datum("vowel_total", "vowel_total", vowel_total, 4),
        datum("consonant_total", "consonant_total", consonant_total, 3),
        datum("date_digit_total", "date_digit_total", date_digit_total, 5),
        datum("day", "day", packet.date.day(), 3),
        datum("month", "month", packet.date.month(), 2),
        datum(
            "year_digit_total",
            "year",
            digit_sum(packet.date.year().unsigned_abs()),
            2,
        ),
    ]
}

fn datum(id: &str, role: &str, raw_value: u32, weight: u8) -> Datum {
    Datum {
        datum_id: id.to_owned(),
        datum_role: role.to_owned(),
        raw_value,
        weight,
        compound: compound_trail(raw_value),
    }
}

fn compound_trail(raw: u32) -> CompoundTrail {
    let mut steps = vec![raw];
    let mut current = raw;
    while current > 9 {
        current = digit_sum(current);
        steps.push(current);
    }
    let master_flag = [11, 22, 33]
        .into_iter()
        .find(|master| steps.contains(master));
    let karmic_debt_flag = [13, 14, 16, 19]
        .into_iter()
        .find(|debt| steps.contains(debt));
    CompoundTrail {
        raw,
        steps,
        root9: current as u8,
        master_flag: master_flag.map(|value| value as u8),
        karmic_debt_flag: karmic_debt_flag.map(|value| value as u8),
    }
}

fn date_digit_total(date: NaiveDate) -> u32 {
    digit_sum(date.day()) + digit_sum(date.month()) + digit_sum(date.year().unsigned_abs())
}

fn digit_sum(mut value: u32) -> u32 {
    let mut sum = 0;
    while value > 0 {
        sum += value % 10;
        value /= 10;
    }
    sum
}

fn normalize_letter(character: char) -> Option<char> {
    let upper = character.to_ascii_uppercase();
    if upper.is_ascii_alphabetic() {
        Some(upper)
    } else {
        None
    }
}

fn pythagorean_value(letter: char) -> u8 {
    ((letter as u8 - b'A') % 9) + 1
}

fn is_vowel(letter: char) -> bool {
    matches!(letter, 'A' | 'E' | 'I' | 'O' | 'U')
}

fn alphabet_map() -> BTreeMap<char, u8> {
    ('A'..='Z')
        .map(|letter| (letter, pythagorean_value(letter)))
        .collect()
}

fn init_matrix() -> ResonanceMatrix {
    LENSES
        .into_iter()
        .map(|lens| (lens.to_owned(), [0.0f32; 6]))
        .collect()
}

fn add_score(matrix: &mut ResonanceMatrix, lens: &str, position: u8, score: f32) {
    if let Some(row) = matrix.get_mut(lens) {
        row[position as usize] += score;
    }
}

fn combine_matrices(matrices: &MefMatrices) -> ResonanceMatrix {
    let mut total = init_matrix();
    for matrix in [
        &matrices.full_pass,
        &matrices.anchor_bias,
        &matrices.square_diffuse,
    ] {
        for (lens, row) in matrix {
            for (position, score) in row.iter().enumerate() {
                add_score(&mut total, lens, position as u8, *score);
            }
        }
    }
    total
}

fn extract_elemental(
    total: &ResonanceMatrix,
    evidence_paths: &[EvidencePath],
    totals: &[Datum],
    config: &BirthdateEncodingConfig,
) -> ElementalContribution {
    let mut raw = ElementalRawScores::default();
    for (lens, row) in total {
        for (position, score) in row.iter().enumerate() {
            if *score <= f32::EPSILON {
                continue;
            }
            let direct_multiplier = if lens == "L2p" {
                config.direct_element_bonus
            } else {
                1.0
            };
            add_element_score(
                &mut raw,
                element_from_position(position as u8),
                score * config.position_element_factor * direct_multiplier,
                config.cap_factor,
            );
            add_element_score(
                &mut raw,
                lens_native_element(lens),
                score * config.lens_element_factor,
                config.cap_factor,
            );
        }
    }
    for path in evidence_paths
        .iter()
        .filter(|path| path.element_projection.direct_alchemical)
    {
        let weight = totals
            .iter()
            .find(|datum| datum.datum_id == path.datum_id)
            .map(|datum| datum.weight as f32)
            .unwrap_or(1.0);
        add_element_score(
            &mut raw,
            &path.element_projection.position_element,
            weight * config.anchor_factor * config.direct_element_bonus,
            config.cap_factor,
        );
    }

    let normalized_quaternion = quat_normalize([raw.earth, raw.water, raw.fire, raw.air]);
    ElementalContribution {
        raw,
        normalized_quaternion,
        dominant_elements: dominant_elements(raw),
        caps: ElementalCaps {
            aether_gate: raw.aether_gate,
            mineral_cap: raw.mineral_cap,
        },
    }
}

fn add_element_score(raw: &mut ElementalRawScores, element: &str, score: f32, cap_factor: f32) {
    match element {
        "Earth" => raw.earth += score,
        "Water" => raw.water += score,
        "Fire" => raw.fire += score,
        "Air" => raw.air += score,
        "Aether" => raw.aether_gate += score * cap_factor,
        "Salt" => raw.mineral_cap += score * cap_factor,
        _ => {}
    }
}

fn annotate_evidence_contributions(
    evidence_paths: &mut [EvidencePath],
    total: &ResonanceMatrix,
    config: &BirthdateEncodingConfig,
) {
    for path in evidence_paths {
        let score = total
            .get(&path.anchor_lens)
            .map(|row| row[path.mod6 as usize])
            .unwrap_or_default();
        let mut raw = ElementalRawScores::default();
        let direct_multiplier = if path.anchor_lens == "L2p" {
            config.direct_element_bonus
        } else {
            1.0
        };
        add_element_score(
            &mut raw,
            &path.element_projection.position_element,
            score * config.position_element_factor * direct_multiplier,
            config.cap_factor,
        );
        add_element_score(
            &mut raw,
            &path.element_projection.lens_native_element,
            score * config.lens_element_factor,
            config.cap_factor,
        );
        path.contribution = EvidenceContribution {
            matrix_score: score,
            elemental_score_delta: raw,
        };
    }
}

fn derive_music_handoff(
    evidence_paths: &[EvidencePath],
    elemental: &ElementalContribution,
) -> MusicHandoff {
    let chromatic_anchors = evidence_paths
        .iter()
        .map(|path| ChromaticAnchor {
            c12: path.mod12,
            pitch: path.anchor_pitch.clone(),
            lens: path.anchor_lens.clone(),
            weight: path.contribution.matrix_score,
        })
        .collect::<Vec<_>>();
    let scale_beneath_candidates = evidence_paths
        .iter()
        .take(5)
        .map(|path| ScaleCandidate {
            source: path.datum_id.clone(),
            c12: path.mod12,
            pitch: path.anchor_pitch.clone(),
            lens: path.anchor_lens.clone(),
        })
        .collect();
    let cf_mode_candidates = evidence_paths
        .iter()
        .map(|path| ModeCandidate {
            source: path.datum_id.clone(),
            position: path.mod6,
            vector: path.vector.clone(),
        })
        .collect();
    MusicHandoff {
        scale_beneath_candidates,
        cf_mode_candidates,
        motif_vectors: evidence_paths
            .iter()
            .map(|path| format!("{}:{}", path.datum_id, path.vector))
            .collect(),
        chromatic_anchors,
        element_timbre_vector: elemental.clone(),
        unresolved_tensions: evidence_paths
            .iter()
            .filter(|path| path.inverse == 4 || path.inverse == 5)
            .map(|path| path.datum_id.clone())
            .collect(),
        healing_vectors: evidence_paths
            .iter()
            .filter(|path| path.mod6 != path.inverse)
            .map(|path| path.vector.clone())
            .collect(),
    }
}

fn dominant_cells(total: &ResonanceMatrix) -> Vec<ScoredCell> {
    let mut cells = Vec::new();
    for (lens, row) in total {
        for (position, score) in row.iter().enumerate() {
            cells.push(ScoredCell {
                cell: cell_id(lens, position as u8),
                score: *score,
                meaning: cell_meaning(lens, position as u8).to_owned(),
            });
        }
    }
    cells.sort_by(|a, b| b.score.total_cmp(&a.score));
    cells.truncate(12);
    cells
}

fn dominant_lenses(total: &ResonanceMatrix) -> Vec<ScoredLens> {
    let mut lenses = total
        .iter()
        .map(|(lens, row)| ScoredLens {
            lens: lens.clone(),
            score: row.iter().sum(),
        })
        .collect::<Vec<_>>();
    lenses.sort_by(|a, b| b.score.total_cmp(&a.score));
    lenses.truncate(6);
    lenses
}

fn dominant_squares(total: &ResonanceMatrix) -> Vec<ScoredSquare> {
    let mut scores = BTreeMap::from([
        ("A".to_owned(), 0.0f32),
        ("B".to_owned(), 0.0f32),
        ("C".to_owned(), 0.0f32),
    ]);
    for (lens, row) in total {
        *scores.entry(square_id(lens).to_owned()).or_default() += row.iter().sum::<f32>();
    }
    let mut squares = scores
        .into_iter()
        .map(|(square, score)| ScoredSquare { square, score })
        .collect::<Vec<_>>();
    squares.sort_by(|a, b| b.score.total_cmp(&a.score));
    squares
}

fn dominant_elements(raw: ElementalRawScores) -> Vec<String> {
    let mut elements = vec![
        ("earth", raw.earth),
        ("water", raw.water),
        ("fire", raw.fire),
        ("air", raw.air),
    ];
    elements.sort_by(|a, b| b.1.total_cmp(&a.1));
    elements
        .into_iter()
        .filter(|(_, score)| *score > f32::EPSILON)
        .map(|(element, _)| element.to_owned())
        .collect()
}

fn inverse_axis_scores(position_scores: [f32; 6]) -> InverseAxisScores {
    InverseAxisScores {
        axis05: position_scores[0] + position_scores[5],
        axis14: position_scores[1] + position_scores[4],
        axis23: position_scores[2] + position_scores[3],
    }
}

fn full_pass_cells(p: u8, p_inv: u8) -> Vec<String> {
    LENSES
        .into_iter()
        .flat_map(|lens| [cell_id(lens, p), cell_id(lens, p_inv)])
        .collect()
}

fn cell_id(lens: &str, position: u8) -> String {
    format!("{lens}.P{position}")
}

fn vector_label(p: u8, p_inv: u8) -> String {
    format!("P{p}->P{p_inv}")
}

fn element_from_position(position: u8) -> &'static str {
    match position {
        0 => "Aether",
        1 => "Earth",
        2 => "Water",
        3 => "Air",
        4 => "Fire",
        _ => "Salt",
    }
}

fn lens_native_element(lens: &str) -> &'static str {
    match lens {
        "L1" | "L4" | "L4p" => "Earth",
        "L2" => "Air",
        "L3" | "L1p" => "Water",
        "L3p" => "Fire",
        _ => "Aether",
    }
}

fn cell_meaning(lens: &str, position: u8) -> &'static str {
    match (lens, position) {
        ("L0", 0) => "Why / presuppositional frame",
        ("L0", 1) => "What / identity definition",
        ("L0", 2) => "How / operational question",
        ("L0", 3) => "Whom / which / when pattern",
        ("L0", 4) => "Where / recursive condition",
        ("L0", 5) => "Why-so / analogical return",
        ("L1", 0) => "Svatantrya / absolute freedom causation",
        ("L1", 1) => "Material cause",
        ("L1", 2) => "Efficient cause",
        ("L1", 3) => "Formal cause",
        ("L1", 4) => "Final cause",
        ("L1", 5) => "Iccha Shakti / Will",
        ("L2", 0) => "Tetralemmaic ground",
        ("L2", 1) => "IS",
        ("L2", 2) => "IS-NOT",
        ("L2", 3) => "BOTH",
        ("L2", 4) => "NEITHER / void / ineffability",
        ("L2", 5) => "SILENCE",
        ("L3", 0) => "Concrescent desire",
        ("L3", 1) => "Actual occasion",
        ("L3", 2) => "Ingression",
        ("L3", 3) => "Eternal objects",
        ("L3", 4) => "Community integration",
        ("L3", 5) => "Satisfaction / perishing",
        ("L4", 0) => "Sein / Being",
        ("L4", 1) => "Geworfenheit / thrownness",
        ("L4", 2) => "Dasein / being-there",
        ("L4", 3) => "Zeit / temporality",
        ("L4", 4) => "Besorge / care",
        ("L4", 5) => "Gelassenheit / releasement",
        ("L5", 0) => "Anuttara / beyond speech",
        ("L5", 1) => "Para Vak",
        ("L5", 2) => "Pashyanti",
        ("L5", 3) => "Madhyama",
        ("L5", 4) => "Vaikhari",
        ("L5", 5) => "Matrika",
        ("L0p", 0) => "One / unity",
        ("L0p", 1) => "Two / polarity",
        ("L0p", 2) => "Three / mediation",
        ("L0p", 3) => "Four / quaternity",
        ("L0p", 4) => "Five / pentad",
        ("L0p", 5) => "Six / hexad",
        ("L1p", 0) => "Introversion",
        ("L1p", 1) => "Sensation",
        ("L1p", 2) => "Feeling",
        ("L1p", 3) => "Thinking",
        ("L1p", 4) => "Intuition",
        ("L1p", 5) => "Extroversion",
        ("L2p", 0) => "Aether",
        ("L2p", 1) => "Earth",
        ("L2p", 2) => "Water",
        ("L2p", 3) => "Air",
        ("L2p", 4) => "Fire",
        ("L2p", 5) => "Salt / lapis",
        ("L3p", 0) => "Spirit / Geist",
        ("L3p", 1) => "Spring / emergence",
        ("L3p", 2) => "Summer / fullness",
        ("L3p", 3) => "Autumn / harvest",
        ("L3p", 4) => "Winter / incubation",
        ("L3p", 5) => "Life / Aufhebung",
        ("L4p", 0) => "Observe / Questions",
        ("L4p", 1) => "Think / Traces",
        ("L4p", 2) => "Plan / Challenges",
        ("L4p", 3) => "Build / Patterns",
        ("L4p", 4) => "Execute / Discovery",
        ("L4p", 5) => "Verify / Insight",
        ("L5p", 0) => "Arche",
        ("L5p", 1) => "Apokalypsis",
        ("L5p", 2) => "Dynamis",
        ("L5p", 3) => "Sophia",
        ("L5p", 4) => "Parousia",
        ("L5p", 5) => "Epi-Logos",
        _ => "unmapped MEF cell",
    }
}

fn square_id(lens: &str) -> &'static str {
    match lens {
        "L0" | "L5" | "L5p" | "L0p" => "A",
        "L1" | "L4" | "L4p" | "L1p" => "B",
        _ => "C",
    }
}

fn square_meaning(lens: &str) -> &'static str {
    match square_id(lens) {
        "A" => "Speech-number articulation square",
        "B" => "Cause-experience encounter square",
        _ => "Logic-process becoming square",
    }
}

fn square_lenses(lens: &str) -> &'static [&'static str] {
    match square_id(lens) {
        "A" => &["L0", "L5", "L5p", "L0p"],
        "B" => &["L1", "L4", "L4p", "L1p"],
        _ => &["L2", "L3", "L3p", "L2p"],
    }
}

fn square_complement(lens: &str) -> &'static str {
    match lens {
        "L0" => "L5",
        "L5" => "L0",
        "L5p" => "L0p",
        "L0p" => "L5p",
        "L1" => "L4",
        "L4" => "L1",
        "L4p" => "L1p",
        "L1p" => "L4p",
        "L2" => "L3",
        "L3" => "L2",
        "L3p" => "L2p",
        _ => "L3p",
    }
}

fn x_prime_partner(lens: &str) -> &'static str {
    match lens {
        "L0" => "L0p",
        "L0p" => "L0",
        "L1" => "L1p",
        "L1p" => "L1",
        "L2" => "L2p",
        "L2p" => "L2",
        "L3" => "L3p",
        "L3p" => "L3",
        "L4" => "L4p",
        "L4p" => "L4",
        "L5" => "L5p",
        _ => "L5",
    }
}

fn mobius_return(lens: &str) -> &'static str {
    match lens {
        "L0" => "L5p",
        "L1" => "L4p",
        "L2" => "L3p",
        "L3" => "L2p",
        "L4" => "L1p",
        "L5" => "L0p",
        "L0p" => "L5",
        "L1p" => "L4",
        "L2p" => "L3",
        "L3p" => "L2",
        "L4p" => "L1",
        _ => "L0",
    }
}

fn tritone_mirror(lens: &str) -> &'static str {
    let idx = LENSES
        .iter()
        .position(|candidate| *candidate == lens)
        .unwrap_or(0);
    LENSES[(idx + 6) % 12]
}

fn role_lens_affinity(role: &str, lens: &str) -> f32 {
    match role {
        "full_name" => match lens {
            "L0" => 1.15,
            "L5" => 1.25,
            "L5p" => 1.20,
            "L0p" => 1.25,
            "L1" => 1.00,
            "L4" => 0.95,
            "L2p" => 1.00,
            _ => 0.80,
        },
        "vowel_total" => match lens {
            "L5" => 1.25,
            "L1p" => 1.20,
            "L4" => 1.15,
            "L3" => 1.05,
            "L2p" => 1.10,
            _ => 0.75,
        },
        "consonant_total" => match lens {
            "L1" => 1.20,
            "L4p" => 1.10,
            "L5" => 1.05,
            "L2p" | "L4" => 1.00,
            _ => 0.75,
        },
        "date_digit_total" => match lens {
            "L3p" => 1.25,
            "L3" => 1.20,
            "L1" => 1.05,
            "L4p" => 1.10,
            "L2p" => 1.05,
            _ => 0.75,
        },
        "day" => match lens {
            "L0" => 1.20,
            "L5p" => 1.10,
            "L2p" => 1.05,
            "L3p" => 0.95,
            _ => 0.70,
        },
        "month" => match lens {
            "L3p" => 1.20,
            "L4" | "L1p" => 1.05,
            _ => 0.70,
        },
        "year" => match lens {
            "L3p" => 1.20,
            "L4p" => 1.15,
            "L5p" => 1.05,
            _ => 0.70,
        },
        "name_date_synthesis" => match lens {
            "L2p" => 1.30,
            "L5" | "L5p" => 1.15,
            "L1" | "L3" => 1.05,
            _ => 0.85,
        },
        _ => 0.75,
    }
}

fn birthdate_output_hash(output: &BirthdateEncodingOutput) -> String {
    let mut hasher = blake3::Hasher::new();
    hasher.update(output.layer_id.as_bytes());
    hasher.update(output.input.primary_name.as_bytes());
    hasher.update(output.input.date.to_string().as_bytes());
    for path in &output.evidence_paths {
        hasher.update(path.datum_id.as_bytes());
        hasher.update(&path.raw_value.to_le_bytes());
        hasher.update(path.direct_cell.as_bytes());
    }
    hasher.finalize().to_hex().to_string()
}
