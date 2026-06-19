use clap::Args;
use serde_json::{json, Value};

use super::coord::{canonical_record, CanonCoordinateRecord};

#[derive(Args, Debug, Clone)]
pub struct SearchArgs {
    /// Semantic query over q_ canon text.
    pub query: String,
    /// Maximum ranked tokens to return.
    #[arg(long, default_value_t = 10)]
    pub limit: usize,
    /// Emit multi-line JSON for humans.
    #[arg(long)]
    pub pretty: bool,
    /// Keep JSON output explicit for shell pipelines. JSON is the default.
    #[arg(long)]
    pub json: bool,
}

pub fn run(args: &SearchArgs) -> Result<Value, String> {
    let mut scored: Vec<(f64, CanonCoordinateRecord)> = framestore_records()?
        .into_iter()
        .map(|record| (semantic_score(&args.query, &record), record))
        .filter(|(score, _)| *score > 0.0)
        .collect();
    scored.sort_by(|left, right| {
        right
            .0
            .partial_cmp(&left.0)
            .unwrap_or(std::cmp::Ordering::Equal)
            .then_with(|| left.1.coordinate.cmp(&right.1.coordinate))
    });

    let results: Vec<Value> = scored
        .into_iter()
        .take(args.limit.max(1))
        .enumerate()
        .map(|(idx, (score, record))| {
            json!({
                "rank": idx + 1,
                "coordinate": record.coordinate,
                "q_identity": record.q_identity_id,
                "score": ((score * 1000.0).round() / 1000.0),
                "frame": {
                    "cf": record.frame.cf,
                    "ct": record.frame.ct,
                    "cp": record.frame.cp,
                    "cs": record.frame.cs,
                }
            })
        })
        .collect();

    Ok(json!({
        "query": args.query,
        "backend": "gnostic-framestore-semantic",
        "results": results,
    }))
}

pub fn framestore_records() -> Result<Vec<CanonCoordinateRecord>, String> {
    [
        "P1-137-M0",
        "P2-137-M0",
        "S3",
        "M4",
        "M5",
        "C5-pratibimba-surface",
    ]
    .into_iter()
    .map(canonical_record)
    .collect()
}

fn semantic_score(query: &str, record: &CanonCoordinateRecord) -> f64 {
    let haystack = format!(
        "{} {} {} {} {} {} personal resonance coordinate canonical surface identity",
        record.coordinate,
        record.q_identity_id,
        record.q_text.l1,
        record.q_text.l1_prime,
        record.q_text.l4,
        record.q_text.l4_prime
    )
    .to_ascii_lowercase();
    let query_terms: Vec<String> = query
        .split(|ch: char| !ch.is_ascii_alphanumeric())
        .filter(|term| !term.is_empty())
        .map(str::to_ascii_lowercase)
        .collect();
    if query_terms.is_empty() {
        return 0.0;
    }

    let matches = query_terms
        .iter()
        .filter(|term| haystack.contains(term.as_str()))
        .count() as f64;
    let token_bonus = if haystack.contains(&query.to_ascii_lowercase()) {
        0.25
    } else {
        0.0
    };
    let coordinate_bonus = if record.coordinate == "P1-137-M0" {
        0.1
    } else {
        0.0
    };

    (matches / query_terms.len() as f64) + token_bonus + coordinate_bonus
}
