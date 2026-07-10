//! CCT-14b — universal entity birth-codon at Hen promotion.
//!
//! Every Hen-promoted canonical entity receives a `c_5_birth_codon` (0..63)
//! derived deterministically from content + creation kairos + creator
//! identity + coordinate ancestry, plus the derived `c_5_birth_*` family
//! resolved through the M3 kernel authority (portal-core seams over the C
//! kernel: `classify_codon`, `codon_transcript_class`,
//! `codon_governance_role`, `bioquaternion_transcription`, `major_arcana`).
//!
//! Tunability surface (DR-ENTITY-CODON-1): seed composition order and
//! derivation policy are explicit knobs; defaults here are the
//! conservative-first recommended composition. Collisions in a 6-bit space
//! are expected and meaningful — the default policy is warn-and-allow
//! (chromosomal-territory clustering is an ontological signal, not a bug).

use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};

use portal_core::codon::classify_codon;
use portal_core::luts::transcription::{codon_governance_role, codon_transcript_class};
use portal_core::m3_transcription_bridge::{bioquaternion_transcription, major_arcana};
use portal_core::types::CodonClass;

/// Recommended default seed composition, in priority order. Reordering
/// changes determinism behaviour; this array IS the canonical default.
pub const SEED_COMPOSITION_DEFAULT: [&str; 4] = [
    "content_hash",
    "kairos",
    "creator_identity",
    "coordinate_path",
];

/// Bit-extraction policy from the BLAKE3 seed hash. Each is deterministic;
/// they distribute entropy differently across the 64-codon space.
#[derive(Clone, Copy, Debug, Default, Eq, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum DerivationPolicy {
    /// First 6 bits of the BLAKE3 digest (default).
    #[default]
    Blake3First6Bits,
    /// First digest byte modulo 64 — theoretically more uniform for
    /// non-uniform seed-byte distributions.
    Blake3Modulo64,
    /// XOR-fold the full 32-byte digest down to 6 bits.
    Blake3XorFold,
}

/// Candidate codons in `Idea/Empty/` are provisional; promotion into
/// `World/Types/` ratifies. Graduation to flat `World/{Name}.md` carries the
/// ratified codon forward unchanged.
#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum BirthCodonState {
    Provisional,
    Ratified,
}

impl BirthCodonState {
    pub fn as_str(self) -> &'static str {
        match self {
            BirthCodonState::Provisional => "provisional",
            BirthCodonState::Ratified => "ratified",
        }
    }
}

/// The seed components, already resolved by the caller (Hen promotion reads
/// them from artifact evidence — never from the wall clock, so derivation
/// stays reproducible).
#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
pub struct BirthCodonSeed {
    pub content_hash: String,
    pub kairos: String,
    pub creator_identity: String,
    pub coordinate_path: String,
}

impl BirthCodonSeed {
    fn component(&self, name: &str) -> &str {
        match name {
            "content_hash" => &self.content_hash,
            "kairos" => &self.kairos,
            "creator_identity" => &self.creator_identity,
            "coordinate_path" => &self.coordinate_path,
            _ => "",
        }
    }

    /// Compose the seed string per the composition order. Components are
    /// length-prefixed so distinct component splits can never collide on
    /// the same concatenation.
    pub fn compose(&self, composition: &[&str]) -> String {
        composition
            .iter()
            .map(|name| {
                let value = self.component(name);
                format!("{name}:{}:{value}", value.len())
            })
            .collect::<Vec<_>>()
            .join("|")
    }
}

/// Derive the 6-bit birth codon from a seed under a policy.
pub fn derive_birth_codon(seed: &BirthCodonSeed, policy: DerivationPolicy) -> u8 {
    derive_birth_codon_with_composition(seed, policy, &SEED_COMPOSITION_DEFAULT)
}

pub fn derive_birth_codon_with_composition(
    seed: &BirthCodonSeed,
    policy: DerivationPolicy,
    composition: &[&str],
) -> u8 {
    let digest = blake3::hash(seed.compose(composition).as_bytes());
    let bytes = digest.as_bytes();
    match policy {
        DerivationPolicy::Blake3First6Bits => bytes[0] >> 2,
        DerivationPolicy::Blake3Modulo64 => bytes[0] % 64,
        DerivationPolicy::Blake3XorFold => {
            let folded = bytes.iter().fold(0u8, |acc, byte| acc ^ byte);
            folded & 0x3F
        }
    }
}

/// The full derived `c_5_birth_*` family for one entity. Every field is a
/// pure function of the codon, resolved through the M3 kernel authority.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct BirthCodonRecord {
    pub codon: u8,
    /// Major Arcana name (chromosomal territory); STOP codons carry none.
    pub chromosome: Option<String>,
    pub rotational_class: String,
    pub transcript_class: String,
    pub governance_role: String,
    pub pp: i8,
    pub nn: i8,
    pub np: i8,
    pub pn: i8,
}

impl BirthCodonRecord {
    pub fn from_codon(codon: u8) -> Self {
        let codon = codon & 0x3F;
        let charges = bioquaternion_transcription(codon).charges;
        Self {
            codon,
            chromosome: major_arcana(codon).map(|card| card.name),
            rotational_class: rotational_class_name(classify_codon(codon)).to_owned(),
            transcript_class: transcript_class_name(codon_transcript_class(codon)).to_owned(),
            governance_role: governance_role_name(codon_governance_role(codon)).to_owned(),
            pp: charges.pp,
            nn: charges.nn,
            np: charges.np,
            pn: charges.pn,
        }
    }

    pub fn derive(seed: &BirthCodonSeed, policy: DerivationPolicy) -> Self {
        Self::from_codon(derive_birth_codon(seed, policy))
    }

    /// The `c_5_birth_*` family as frontmatter/graph property pairs, plus
    /// `birth_codon_state`.
    pub fn properties(&self, state: BirthCodonState) -> Vec<(String, serde_json::Value)> {
        let mut props = vec![(
            "c_5_birth_codon".to_owned(),
            serde_json::Value::Number(self.codon.into()),
        )];
        if let Some(chromosome) = &self.chromosome {
            props.push((
                "c_5_birth_chromosome".to_owned(),
                serde_json::Value::String(chromosome.clone()),
            ));
        }
        props.push((
            "c_5_birth_rotational_class".to_owned(),
            serde_json::Value::String(self.rotational_class.clone()),
        ));
        props.push((
            "c_5_birth_transcript_class".to_owned(),
            serde_json::Value::String(self.transcript_class.clone()),
        ));
        props.push((
            "c_5_birth_governance_role".to_owned(),
            serde_json::Value::String(self.governance_role.clone()),
        ));
        for (key, value) in [
            ("c_5_birth_pp", self.pp),
            ("c_5_birth_nn", self.nn),
            ("c_5_birth_np", self.np),
            ("c_5_birth_pn", self.pn),
        ] {
            props.push((key.to_owned(), serde_json::Value::Number(value.into())));
        }
        props.push((
            "birth_codon_state".to_owned(),
            serde_json::Value::String(state.as_str().to_owned()),
        ));
        props
    }
}

fn rotational_class_name(class: CodonClass) -> &'static str {
    match class {
        CodonClass::Dual => "dual",
        CodonClass::PerfectPalindromic => "non-dual-perfect",
        CodonClass::ImperfectPalindromic => "non-dual-imperfect",
        CodonClass::NonPalindromicNonDual => "non-dual-non-palindromic",
    }
}

fn transcript_class_name(class: std::os::raw::c_uint) -> &'static str {
    // M3_TRANSCRIPT_CLASS_SHARED = 0, M3_TRANSCRIPT_CLASS_TRANSCRIBABLE = 1
    if class == 1 {
        "transcribable"
    } else {
        "shared"
    }
}

fn governance_role_name(role: std::os::raw::c_uint) -> &'static str {
    // M3_GOVERNANCE_ROLE_NONE = 0, START = 1, STOP = 2
    match role {
        1 => "start",
        2 => "stop",
        _ => "none",
    }
}

/// Warn-and-allow collision ledger. Collisions ARE expected in a 6-bit
/// space; both entities ratify, the ledger counts territory occupancy so
/// reviewers can observe clustering.
#[derive(Clone, Debug, Default, Eq, PartialEq, Serialize, Deserialize)]
pub struct BirthCodonLedger {
    occupancy: BTreeMap<u8, Vec<String>>,
}

#[derive(Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
pub struct CollisionOutcome {
    pub codon: u8,
    pub collision: bool,
    pub occupancy: usize,
    /// Present exactly when a collision occurred — warn-and-allow, never
    /// refuse.
    pub warning: Option<String>,
}

impl BirthCodonLedger {
    pub fn record(&mut self, codon: u8, entity: impl Into<String>) -> CollisionOutcome {
        let codon = codon & 0x3F;
        let entities = self.occupancy.entry(codon).or_default();
        entities.push(entity.into());
        let occupancy = entities.len();
        let collision = occupancy > 1;
        CollisionOutcome {
            codon,
            collision,
            occupancy,
            warning: collision.then(|| {
                format!(
                    "birth-codon collision on codon {codon}: {occupancy} entities share this chromosomal territory (warn-and-allow)"
                )
            }),
        }
    }

    pub fn entities_for(&self, codon: u8) -> &[String] {
        self.occupancy
            .get(&(codon & 0x3F))
            .map(Vec::as_slice)
            .unwrap_or(&[])
    }
}
