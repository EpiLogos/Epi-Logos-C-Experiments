//! FFI struct mirrors for M4 (Nara) C types — field-for-field #[repr(C)]

use static_assertions::assert_eq_size;

/// Mirror of C M4_Numerological_Layer — 8 bytes
#[repr(C)]
#[derive(Debug, Clone, Copy)]
pub struct M4NumerologicalLayer {
    pub numerological_key: u32,
    pub sixfold_difference: u8,
    pub sixfold_sum: u8,
    pub life_path: u8,
    pub _pad: u8,
}

assert_eq_size!(M4NumerologicalLayer, [u8; 8]);

/// Mirror of C M4_Astrological_Layer — 32 bytes
#[repr(C)]
#[derive(Debug, Clone, Copy)]
pub struct M4AstrologicalLayer {
    pub sun_degree_anchor: u16,
    pub moon_degree_anchor: u16,
    pub asc_degree_anchor: u16,
    pub mc_degree_anchor: u16,
    pub planet_degrees: [u16; 10],
    pub dominant_sign: u8,
    pub dominant_element: u8,
    pub dominant_modality: u8,
    pub _pad: u8,
}

assert_eq_size!(M4AstrologicalLayer, [u8; 32]);

/// Mirror of C nucleotide_balance inner struct (within M4_Jungian_Layer)
#[repr(C)]
#[derive(Debug, Clone, Copy)]
pub struct NucleotideBalance {
    pub adenine_water: u8,
    pub thymine_fire: u8,
    pub cytosine_earth: u8,
    pub guanine_air: u8,
}

assert_eq_size!(NucleotideBalance, [u8; 4]);

/// Mirror of C M4_Jungian_Layer — 12 bytes
#[repr(C)]
#[derive(Debug, Clone, Copy)]
pub struct M4JungianLayer {
    pub nucleotide_balance: NucleotideBalance,
    pub mbti_raw: u8,
    pub dominant_function: u8,
    pub auxiliary_function: u8,
    pub enneagram_type: u8,
    pub enneagram_wing: u8,
    pub _pad: [u8; 3],
}

assert_eq_size!(M4JungianLayer, [u8; 12]);

/// Mirror of C M4_GeneKeys_Layer — 40 bytes
#[repr(C)]
#[derive(Debug, Clone, Copy)]
pub struct M4GeneKeysLayer {
    pub gene_keys_activation: u64,
    pub shadow_mask: u64,
    pub gift_mask: u64,
    pub siddhi_mask: u64,
    pub life_work_hex: u8,
    pub evolution_hex: u8,
    pub radiance_hex: u8,
    pub purpose_hex: u8,
    pub attraction_hex: u8,
    pub iq_hex: u8,
    pub eq_hex: u8,
    pub sq_hex: u8,
}

assert_eq_size!(M4GeneKeysLayer, [u8; 40]);

/// Mirror of C M4_HumanDesign_Layer — 20 bytes
#[repr(C)]
#[derive(Debug, Clone, Copy)]
pub struct M4HumanDesignLayer {
    pub hd_type: u8,
    pub hd_authority: u8,
    pub hd_profile: [u8; 2],
    pub hd_definition: u8,
    pub incarnation_cross: u8,
    pub defined_channels: u16,
    pub defined_gates: [u32; 2],
    pub _pad: [u8; 4],
}

assert_eq_size!(M4HumanDesignLayer, [u8; 20]);

/// Mirror of C M4_Medicine_Triage — 16 bytes
#[repr(C)]
#[derive(Debug, Clone, Copy)]
pub struct M4MedicineTriage {
    pub fire: u8,
    pub water: u8,
    pub earth: u8,
    pub air: u8,
    pub dominant_element: u8,
    pub deficient_element: u8,
    pub primary_chakra: u8,
    pub triage_vector: u8,
    pub planetary_hour: u32,
    pub safety_mask: u8,
    pub _pad: [u8; 3],
}

assert_eq_size!(M4MedicineTriage, [u8; 16]);

/// Mirror of C M4_Transform_State — 16 bytes
#[repr(C)]
#[derive(Debug, Clone, Copy)]
pub struct M4TransformState {
    pub current_op: u8,
    pub stroke_phase: u8,
    pub cycle_count_today: u8,
    pub container_active: u8,
    pub cycle_id: u32,
    pub opened_at: u32,
    pub decan_recipe_idx: u8,
    pub arousal_level: u8,
    pub safety_threshold: u8,
    pub _pad: u8,
}

assert_eq_size!(M4TransformState, [u8; 16]);

/// Mirror of C M4_Canonical_Tag — 8 bytes (with padding)
#[repr(C)]
#[derive(Debug, Clone, Copy)]
pub struct M4CanonicalTag {
    pub tag_id: u16,
    pub tradition: u8,
    pub nucleotide: u8,
    pub element: u8,
    pub _pad: u8,
    pub degree: u16,
}

assert_eq_size!(M4CanonicalTag, [u8; 8]);

/// Mirror of C M4_Oracle_Draw — 128 bytes
#[repr(C)]
#[derive(Debug, Clone, Copy)]
pub struct M4OracleDraw {
    pub system: u8,
    pub draw_count: u8,
    pub drawn: [u8; 12],
    pub reversal_mask: u8,
    pub hexagram_primary: u8,
    pub hexagram_relating: u8,
    pub changing_mask: u8,
    pub cast_degree: u16,
    pub cast_epoch: u32,
    pub consent_granted: u8,
    pub hygiene_status: u8,
    pub _pad: [u8; 2],
    pub canonical_tags: [M4CanonicalTag; 12],
    pub canonical_tag_count: u8,
    pub _pad2: [u8; 3],
}

assert_eq_size!(M4OracleDraw, [u8; 128]);
