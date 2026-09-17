use clap::Subcommand;
use serde_json::Value;

pub mod coord;
pub mod diff;
pub mod framestore;
pub mod search;

#[derive(Subcommand, Debug, Clone)]
pub enum CanonCmd {
    /// Resolve one coordinate through the canon depth ladder
    Coord(coord::CoordArgs),
    /// Search q_ canon text and return ranked coordinate tokens
    Search(search::SearchArgs),
    /// Diff two canonical coordinate square payloads
    Diff(diff::DiffArgs),
}

pub fn dispatch(cmd: &CanonCmd, global_json: bool) -> Result<String, String> {
    match cmd {
        CanonCmd::Coord(args) => {
            format_value(coord::run(args)?, args.pretty, args.json || global_json)
        }
        CanonCmd::Search(args) => {
            format_value(search::run(args)?, args.pretty, args.json || global_json)
        }
        CanonCmd::Diff(args) => {
            format_value(diff::run(args)?, args.pretty, args.json || global_json)
        }
    }
}

fn format_value(value: Value, pretty: bool, _json: bool) -> Result<String, String> {
    if pretty {
        serde_json::to_string_pretty(&value).map_err(|err| err.to_string())
    } else {
        serde_json::to_string(&value).map_err(|err| err.to_string())
    }
}
