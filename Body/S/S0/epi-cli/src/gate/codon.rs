// S0 ADAPTER: Body/S/S0/portal-core (M3 codon law) — gateway membrane for design-language consumers; the codon algebra lives in portal-core.
//! Coordinate: S0 adapter over the M3 codon law.
//! Residency: Body/S/S0/epi-cli/src/gate
//! Position (#n): gateway membrane for design-language consumers
//! Actualises: `s2.codon.aa_lookup` from the C-backed portal-core LUT, and
//!   `s2.codon.scalar_ref.read` — the scalar-ref resolver the M3' surfaces
//!   read through. A scalar ref is scalar BY CONSTRUCTION (portal-core's
//!   `NaraScalarRef` carries no body field), so this method resolves an
//!   identity to its public scalar facts and can never smuggle a private
//!   interpretation body across the wire.
//! Public surface: aa_lookup, scalar_ref_read.
//! Does NOT own: codon encoding, amino-acid identity, the hexagram body
//!   dataset (`nara::oracle_identity::HEXAGRAM_BODY_DYNAMICS`), the decan
//!   dataset (`nara::medicine_frame::ZODIAC_DECAN_TABLE`), or presentation.
//! Contract: [[S0-SPEC]] / [[M3'-SPEC]].

use portal_core::codon_to_amino_acid;
use portal_core::transcription::{is_start_codon, is_stop_codon, AMINO_ACID_NAMES};
use serde_json::{json, Value};

fn encode_codon(raw: &str) -> Result<u8, String> {
    let normalized = raw.trim().to_ascii_uppercase().replace('U', "T");
    if normalized.len() != 3 {
        return Err("codon must contain exactly three A/U/T/C/G bases".to_owned());
    }
    normalized.bytes().try_fold(0u8, |encoded, base| {
        let bits = match base {
            b'A' => 0,
            b'T' => 1,
            b'C' => 2,
            b'G' => 3,
            _ => return Err("codon must contain only A/U/T/C/G bases".to_owned()),
        };
        Ok((encoded << 2) | bits)
    })
}

pub fn aa_lookup(params: &Value) -> Result<Value, String> {
    let requested = params
        .get("codon")
        .and_then(Value::as_str)
        .ok_or_else(|| "codon is required".to_owned())?;
    let encoded = encode_codon(requested)?;
    let amino_acid_index = codon_to_amino_acid(encoded);
    let amino_acid = AMINO_ACID_NAMES
        .get(amino_acid_index as usize)
        .copied()
        .ok_or_else(|| "kernel codon LUT returned an unknown amino-acid index".to_owned())?;
    let rna_codon = requested.trim().to_ascii_uppercase().replace('T', "U");
    Ok(json!({
        "codon": rna_codon,
        "encoded": encoded,
        "aminoAcidIndex": amino_acid_index,
        "aminoAcid": amino_acid,
        "isStart": is_start_codon(encoded),
        "isStop": is_stop_codon(encoded),
        "authority": "portal-core::transcription"
    }))
}

// ---------------------------------------------------------------------------
// s2.codon.scalar_ref.read — 24.T24.7 / 24.T24.8 scalar-ref resolution
// ---------------------------------------------------------------------------

use crate::nara::{
    ananda_harmonic_for_decan, body_zones_for_decan, herb_for_decan, hexagram_body_lookup,
    mode_for_decan, zodiac_decan,
};

/// Scalar-ref kinds portal-core declares (`NaraScalarRefKind`, kebab-case over
/// the wire). Named here so an unknown kind is refused rather than silently
/// treated as unresolvable — a typo and an unlanded producer are different
/// answers and the caller needs to tell them apart.
const SCALAR_REF_KINDS: &[&str] = &[
    "m3-codon",
    "tarot",
    "i-ching",
    "decan",
    "line-change",
    "chronos",
    "kairos",
];

fn scalar_ref_index(raw: &Value) -> Result<u8, String> {
    let value = match raw {
        Value::Number(number) => number
            .as_u64()
            .ok_or_else(|| "scalarRef must be a non-negative integer".to_owned())?,
        Value::String(text) => text
            .trim()
            .parse::<u64>()
            .map_err(|_| "scalarRef must parse as a non-negative integer".to_owned())?,
        _ => return Err("scalarRef must be a number or a numeric string".to_owned()),
    };
    u8::try_from(value).map_err(|_| "scalarRef is out of range for this ref kind".to_owned())
}

/// Resolve a scalar M3 reference to its public facts.
///
/// Three kinds resolve today, each straight off a landed dataset. The rest are
/// declared kinds with no scalar producer yet; they answer `resolved: false`
/// with the reason and the owning tranche, because a surface that is told
/// "not yet, and here is who owns it" can render honestly, while one handed an
/// error cannot tell a missing producer from a broken call.
pub fn scalar_ref_read(params: &Value) -> Result<Value, String> {
    let ref_kind = params
        .get("refKind")
        .and_then(Value::as_str)
        .ok_or_else(|| "refKind is required".to_owned())?
        .trim();
    let scalar_ref = params
        .get("scalarRef")
        .ok_or_else(|| "scalarRef is required".to_owned())?;

    if !SCALAR_REF_KINDS.contains(&ref_kind) {
        return Err(format!(
            "unknown refKind '{ref_kind}' — portal-core declares {SCALAR_REF_KINDS:?}"
        ));
    }

    let scalar_ref_text = match scalar_ref {
        Value::String(text) => text.trim().to_owned(),
        other => other.to_string(),
    };

    let pending = |reason: &str, owner: &str| {
        Ok(json!({
            "refKind": ref_kind,
            "scalarRef": scalar_ref_text,
            "resolved": false,
            "reason": reason,
            "ownerTranche": owner
        }))
    };

    match ref_kind {
        "i-ching" => {
            let hexagram = scalar_ref_index(scalar_ref)?;
            let Some(entry) = hexagram_body_lookup(hexagram) else {
                return Err("i-ching scalarRef must be a King Wen number 1..=64".to_owned());
            };
            Ok(json!({
                "refKind": ref_kind,
                "scalarRef": scalar_ref_text,
                "resolved": true,
                "entry": {
                    "hexagramId": entry.hexagram_number,
                    "primaryChakraId": entry.primary_chakra,
                    // The dataset carries ONE secondary chakra per hexagram; it
                    // is emitted as a single-element list because the consuming
                    // contract reads a list, and a hexagram whose secondary
                    // equals its primary is what the dataset says, not a bug to
                    // deduplicate away.
                    "secondaryChakraIds": [entry.secondary_chakra],
                    "bodyZones": entry.body_zones,
                    "dynamic": entry.dynamics
                },
                "authority": "epi-cli::nara::oracle_identity::HEXAGRAM_BODY_DYNAMICS"
            }))
        }
        "decan" => {
            let decan = scalar_ref_index(scalar_ref)?;
            let Some(entry) = zodiac_decan(decan) else {
                return Err("decan scalarRef must be an index 0..=35".to_owned());
            };
            Ok(json!({
                "refKind": ref_kind,
                "scalarRef": scalar_ref_text,
                "resolved": true,
                "entry": {
                    "decanIndex": decan,
                    "sign": entry.sign,
                    "decanInSign": entry.decan_in_sign,
                    "rulingPlanet": entry.ruling_planet,
                    "element": entry.element,
                    "mode": entry.mode,
                    "modeName": mode_for_decan(decan),
                    "anandaHarmonic": ananda_harmonic_for_decan(decan),
                    "bodyZones": body_zones_for_decan(decan),
                    "herb": herb_for_decan(decan)
                },
                "authority": "epi-cli::nara::medicine_frame::ZODIAC_DECAN_TABLE"
            }))
        }
        "m3-codon" => {
            // The codon kind resolves through the SAME LUT read `aa_lookup`
            // serves, rather than a second decode path beside it.
            let codon = scalar_ref
                .as_str()
                .ok_or_else(|| "m3-codon scalarRef must be a three-base string".to_owned())?;
            let entry = aa_lookup(&json!({ "codon": codon }))?;
            Ok(json!({
                "refKind": ref_kind,
                "scalarRef": scalar_ref_text,
                "resolved": true,
                "entry": entry,
                "authority": "portal-core::transcription"
            }))
        }
        "tarot" => pending(
            "no scalar tarot producer has landed; the deck identity lives in the oracle cast path",
            "24.T24.6",
        ),
        "line-change" => pending(
            "line-change scalars are carried on the oracle envelope, not resolvable standalone",
            "24.T24.9",
        ),
        "chronos" | "kairos" => pending(
            "temporal scalars resolve through the kairos producer, not this M3 read",
            "32.T32.10",
        ),
        other => Err(format!("unhandled refKind '{other}'")),
    }
}
