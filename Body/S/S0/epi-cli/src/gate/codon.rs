//! Coordinate: S0 adapter over the M3 codon law.
//! Residency: Body/S/S0/epi-cli/src/gate
//! Position (#n): gateway membrane for design-language consumers
//! Actualises: `s2.codon.aa_lookup` from the C-backed portal-core LUT.
//! Public surface: aa_lookup.
//! Does NOT own: codon encoding, amino-acid identity, or presentation.
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
