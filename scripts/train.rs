//! Rust-native training-plan verifier for the Parashakti EBM head.
//!
//! This binary is intentionally dependency-light so it can be compiled by rustc
//! during skill verification. It refuses missing `[ml.parashakti_ebm_head]`
//! keys rather than pinning loss weights or training hyperparameters in code.

use std::collections::BTreeMap;
use std::env;
use std::fs;
use std::path::PathBuf;

const REQUIRED_KEYS: &[&str] = &[
    "lambda_square",
    "lambda_mirror",
    "lambda_cross_channel",
    "latent_dim",
    "channel_encoder_width",
    "attention_width",
    "learning_rate",
    "batch_size",
    "architecture_variant_id",
];

fn main() {
    match run() {
        Ok(report) => println!("{report}"),
        Err(err) => {
            eprintln!("{err}");
            std::process::exit(2);
        }
    }
}

fn run() -> Result<String, String> {
    let path = env::args()
        .nth(1)
        .map(PathBuf::from)
        .or_else(|| env::var("EPI_LOGOS_CONFIG").ok().map(PathBuf::from))
        .or_else(|| env::var("HOME").ok().map(|home| PathBuf::from(home).join(".epi-logos/config.toml")))
        .ok_or_else(|| "HOME or EPI_LOGOS_CONFIG is required".to_owned())?;
    let text = fs::read_to_string(&path).map_err(|err| format!("failed to read {}: {err}", path.display()))?;
    let section = parse_section(&text, "ml.parashakti_ebm_head")?;
    for key in REQUIRED_KEYS {
        let value = section
            .get(*key)
            .ok_or_else(|| format!("missing config.ml.parashakti_ebm_head.{key}"))?;
        if value.trim().is_empty() {
            return Err(format!("empty config.ml.parashakti_ebm_head.{key}"));
        }
    }
    Ok(format!(
        "{{\"status\":\"ready\",\"loss\":\"MSE + lambda_square*square_emphasis_loss + lambda_mirror*mirror_consistency_loss + lambda_cross_channel*cross_channel_coherence_loss\",\"architectureVariantId\":\"{}\"}}",
        json_escape(section.get("architecture_variant_id").expect("checked"))
    ))
}

fn parse_section(text: &str, name: &str) -> Result<BTreeMap<String, String>, String> {
    let mut current = String::new();
    let mut out = BTreeMap::new();
    for raw in text.lines() {
        let line = raw.trim();
        if line.is_empty() || line.starts_with('#') {
            continue;
        }
        if let Some(section) = line.strip_prefix('[').and_then(|value| value.strip_suffix(']')) {
            current = section.to_owned();
            continue;
        }
        if current == name {
            if let Some((key, value)) = line.split_once('=') {
                out.insert(key.trim().to_owned(), value.trim().trim_matches('"').to_owned());
            }
        }
    }
    if out.is_empty() {
        Err(format!("missing [{name}] section"))
    } else {
        Ok(out)
    }
}

fn json_escape(value: &str) -> String {
    value.replace('\\', "\\\\").replace('"', "\\\"")
}
