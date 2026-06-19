use clap::Args;
use serde_json::{json, Value};

use super::coord::{canonical_record, square_poles};

#[derive(Args, Debug, Clone)]
pub struct DiffArgs {
    /// Source coordinate token.
    pub from_coord: String,
    /// Target coordinate token.
    pub to_coord: String,
    /// Emit multi-line JSON for humans.
    #[arg(long)]
    pub pretty: bool,
    /// Keep JSON output explicit for shell pipelines. JSON is the default.
    #[arg(long)]
    pub json: bool,
}

pub fn run(args: &DiffArgs) -> Result<Value, String> {
    let from = canonical_record(&args.from_coord)?;
    let to = canonical_record(&args.to_coord)?;
    let from_poles = square_poles(&from);
    let to_poles = square_poles(&to);
    let changed_poles: Vec<Value> = from_poles
        .into_iter()
        .zip(to_poles)
        .filter(|(before, after)| before.ql_text != after.ql_text)
        .map(|(before, after)| {
            json!({
                "pole": before.pole,
                "before": {
                    "coordinate": from.coordinate,
                    "ql_text": before.ql_text,
                    "refractions": {
                        "l1": before.refractions.l1,
                        "l1_prime": before.refractions.l1_prime,
                        "l4": before.refractions.l4,
                        "l4_prime": before.refractions.l4_prime,
                    }
                },
                "after": {
                    "coordinate": to.coordinate,
                    "ql_text": after.ql_text,
                    "refractions": {
                        "l1": after.refractions.l1,
                        "l1_prime": after.refractions.l1_prime,
                        "l4": after.refractions.l4,
                        "l4_prime": after.refractions.l4_prime,
                    }
                }
            })
        })
        .collect();

    Ok(json!({
        "from": from.coordinate,
        "to": to.coordinate,
        "backend": "canonical-framestore-structural-diff",
        "changed_poles": changed_poles,
    }))
}
