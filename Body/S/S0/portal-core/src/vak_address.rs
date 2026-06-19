//! VAK C'-branch coordinate-language envelope — the canonical address every
//! emission in the system carries.
//!
//! # Coordinate-tagging IS compression (DR-VAK-7, DR-COMP-1)
//!
//! There is no five-stage VAK compression-cycle orchestrator and no symbolic
//! compressed-handle struct (an earlier cycle-3 draft proposed both; the draft
//! was collapsed — see Tranche 12.33). Compression is not a new operation bolted
//! on; it is what the system already does:
//!
//! - **Compression = coordinate-tagging.** Every emission that already carries a
//!   coordinate-language address is already compressed. The emission sites —
//!   Graphiti `EpisodeAttrs.{cpf, ct, cp, cf, cfp, cs_code, cs_direction}`, the
//!   Mercurius rating-state context tuple
//!   `(vak-cp-position, mef-lens, content-class, kairos-window, R-factor-slot)`,
//!   the M3 codon-trace `(codon_6bit, charge_pp/nn/np/pn, rotation_idx)`, the
//!   Sophia disclosure `q_proposal` envelope
//!   `(target_coordinate, q_key, qm_witness_*)`, the Hen entity-candidate
//!   `(c_layer, coordinate, c_5_birth_codon)`, and the kernel-bridge profile
//!   tick — ARE the C'-branch coordinate-language addresses. [`VakAddress`] is
//!   the canonical shape of that envelope (CPF / CT / CP / CF / CFP / CS).
//! - **Decompression = kernel forward-derivation.** Running the kernel forward
//!   from a coordinate rehydrates full context via the existing substrate
//!   (`portal-core/src/kernel.rs`, `graph-services/src/retrieval/`,
//!   `epi-lib/src/m0.c`) and the on-demand surfaces `s5'.gnostic.resolve(coord)`
//!   and `s0'.anuttara.trace(content, sensitivity, depth)`.
//!
//! # Lint discipline
//!
//! Every emission MUST carry this envelope. The lint lives at
//! `cargo test -p epi-s2-graph-services --test vak_envelope_required_on_emissions`
//! (also enforces that the C'-branch phase marker `'`/`_i_` is never erased on
//! emission — see [`crate::assert_coordinate_phase_preserved`]).
//!
//! # The spine-compositor truncation problem (DR-COMP-1)
//!
//! When the spine injection package exceeds `INJECT_CHAR_BUDGET = 18000`
//! (`spine/compositor.ts`), overflow slots are NOT silently dropped. Each
//! overflow slot is replaced by its canonical VAK-coordinate reference token,
//! which the model can later dereference via `s5'.gnostic.resolve`. The Rust
//! side renders that token from a full envelope via
//! [`VakAddress::compression_reference`]; the TS spine renders the
//! single-coordinate form via `phaseQualifiedVakToken`
//! ([`crate::phase_qualified_vak_token`]). Emit-the-coordinate-instead-of-the-bytes,
//! never a silent drop.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum CfPosition {
    Inner0,
    Inner1,
    Inner2,
    Inner3,
    Inner4,
    Inner5,
    Outer4Parent,
    LemniscateStage5,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum CpfState {
    #[serde(rename = "(00/00)")]
    Dialogical,
    #[serde(rename = "(4.0/1-4.4/5)")]
    Mechanistic,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum CsDirection {
    Day,
    #[serde(rename = "Night'")]
    Night,
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct CsField {
    pub code: String,
    pub direction: CsDirection,
}

/// The canonical VAK C'-branch coordinate-language envelope.
///
/// Carrying this envelope on an emission IS compression (DR-VAK-7): the six
/// reflective/contextual coordinates (CPF / CT / CP / CF / CFP / CS) address the
/// full content in coordinate-language so it need not be carried as bytes.
/// Kernel forward-derivation from these coordinates IS decompression. See the
/// module docs for the full recognition + the emission lint.
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct VakAddress {
    pub cpf: CpfState,
    pub ct: Vec<String>,
    pub cp: String,
    pub cf: String,
    pub cfp: String,
    pub cs: CsField,
}

impl VakAddress {
    /// Render the full C'-branch envelope as a self-describing reference token.
    ///
    /// This is the Rust side of the spine-compositor overflow resolution
    /// (DR-COMP-1): when an injection slot exceeds the char budget, emit this
    /// coordinate reference instead of the bytes. The model dereferences it on
    /// demand via `s5'.gnostic.resolve` / `s0'.anuttara.trace`. The token names
    /// every reflective coordinate so no part of the address is lost — never a
    /// silent drop.
    pub fn compression_reference(&self) -> String {
        let cpf = match self.cpf {
            CpfState::Dialogical => "(00/00)",
            CpfState::Mechanistic => "(4.0/1-4.4/5)",
        };
        let cs_direction = match self.cs.direction {
            CsDirection::Day => "Day",
            CsDirection::Night => "Night'",
        };
        format!(
            "<vak: cpf=\"{cpf}\", ct=\"{ct}\", cp=\"{cp}\", cf=\"{cf}\", cfp=\"{cfp}\", \
             cs=\"{cs_code}@{cs_direction}\", dereference=\"s5'.gnostic.resolve\">",
            ct = self.ct.join("/"),
            cp = self.cp,
            cf = self.cf,
            cfp = self.cfp,
            cs_code = self.cs.code,
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn sample() -> VakAddress {
        VakAddress {
            cpf: CpfState::Mechanistic,
            ct: vec!["0".to_owned(), "1".to_owned(), "2".to_owned()],
            cp: "4.0".to_owned(),
            cf: "(4.0/1-4.4/5)".to_owned(),
            cfp: "4.2".to_owned(),
            cs: CsField {
                code: "CS3".to_owned(),
                direction: CsDirection::Night,
            },
        }
    }

    #[test]
    fn compression_reference_carries_full_cprime_branch_envelope() {
        let token = sample().compression_reference();
        // Every reflective coordinate is named — no part of the address is lost.
        assert!(token.contains("cpf=\"(4.0/1-4.4/5)\""));
        assert!(token.contains("ct=\"0/1/2\""));
        assert!(token.contains("cp=\"4.0\""));
        assert!(token.contains("cf=\"(4.0/1-4.4/5)\""));
        assert!(token.contains("cfp=\"4.2\""));
        assert!(token.contains("cs=\"CS3@Night'\""));
    }

    #[test]
    fn compression_reference_is_dereferenceable_overflow_token() {
        let token = sample().compression_reference();
        // The model can rehydrate full context via kernel forward-derivation.
        assert!(token.starts_with("<vak:"));
        assert!(token.contains("dereference=\"s5'.gnostic.resolve\""));
        assert!(token.ends_with('>'));
    }
}

pub fn canonical_cf_position(cf_literal: &str) -> Option<CfPosition> {
    match cf_literal {
        "(00/00)" => Some(CfPosition::Inner0),
        "(0/1)" => Some(CfPosition::Inner1),
        "(0/1/2)" => Some(CfPosition::Inner2),
        "(0/1/2/3)" => Some(CfPosition::Inner3),
        "(4/5/0)" => Some(CfPosition::Inner4),
        "(5/0)" => Some(CfPosition::Inner5),
        "(4.0/1-4.4/5)" => Some(CfPosition::Outer4Parent),
        "(4.5/0)" => Some(CfPosition::LemniscateStage5),
        _ => None,
    }
}
