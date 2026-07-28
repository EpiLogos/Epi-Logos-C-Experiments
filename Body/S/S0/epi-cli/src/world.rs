//! CCT-14 CLI parity — `epi world graduate|list_entities`.
//!
//! Per DR-S5-ONE-1 + DR-WORLD-1: graduation of a stable type-local
//! definition into flat `World/{Name}.md` (type-local file retained as a
//! MOC/source pointer, birth-codon carried unchanged) rides the SAME
//! `gate::s1_hen` handler the `s1'.world.graduate` gateway route uses.

use clap::Subcommand;
use serde_json::json;

use crate::entity::render;
// T53.04: the CLI surface reaches S1 law at its coordinate. This is the
// membrane doing its job — a passthrough, not a second implementation.
use epi_s1_hen_compiler_core::s1_handlers as s1_hen;

#[derive(Subcommand)]
pub enum WorldCmd {
    /// Graduate a type-local entity flat into World/{Name}.md
    Graduate {
        /// Vault-relative path under Idea/Bimba/World/Types/
        type_path: String,
    },
    /// List graduated flat World entities
    #[command(name = "list_entities")]
    ListEntities {
        /// Filter by type coordinate (e.g. C2)
        #[arg(long)]
        coordinate: Option<String>,
    },
}

pub fn dispatch(cmd: &WorldCmd, json_output: bool) -> Result<String, String> {
    let value = match cmd {
        WorldCmd::Graduate { type_path } => {
            s1_hen::world_graduate(&json!({ "typePath": type_path }))?
        }
        WorldCmd::ListEntities { coordinate } => {
            let mut params = json!({});
            if let Some(coordinate) = coordinate {
                params["coordinate"] = json!(coordinate);
            }
            s1_hen::world_list_entities(&params)?
        }
    };
    render(value, json_output)
}
