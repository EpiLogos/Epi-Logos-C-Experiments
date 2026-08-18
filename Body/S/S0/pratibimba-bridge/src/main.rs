pub use epi_pratibimba_bridge::{
    EpiPrimitiveSnapshot, NaraProtectedContext, EPI_SOURCE_REVISION, QL_PROVIDER_REVISION,
};

mod nara;

use epi_pratibimba_bridge::snapshot;
use nara::{
    read_daily_surface, resolve_selection, write_daily_surface, NaraSelectionRequest,
    NaraWriteRequest,
};
use portal_core::VakAddress;
use serde::de::DeserializeOwned;
use serde::Serialize;
use std::env;
use std::fs;
use std::io::{self, Read};
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
enum Operation {
    Snapshot,
    NaraRead,
    NaraWrite,
    NaraSelect,
}

fn main() {
    if let Err(error) = run() {
        eprintln!("epi-pratibimba-bridge: {error}");
        std::process::exit(1);
    }
}

fn run() -> Result<(), String> {
    let mut timestamp_ms = None;
    let mut generation = 0u64;
    let mut vak_file = None;
    let mut nara_context_file = None;
    let mut vault_root = None;
    let mut operation = Operation::Snapshot;
    let mut args = env::args().skip(1);

    while let Some(arg) = args.next() {
        match arg.as_str() {
            "--timestamp-ms" => {
                let value = args.next().ok_or("--timestamp-ms requires a value")?;
                timestamp_ms = Some(value.parse::<u64>().map_err(|_| "invalid --timestamp-ms")?);
            }
            "--generation" => {
                let value = args.next().ok_or("--generation requires a value")?;
                generation = value.parse::<u64>().map_err(|_| "invalid --generation")?;
            }
            "--vak-file" => vak_file = Some(args.next().ok_or("--vak-file requires a path")?),
            "--nara-context" => {
                nara_context_file = Some(args.next().ok_or("--nara-context requires a path")?)
            }
            "--vault-root" => {
                vault_root = Some(PathBuf::from(
                    args.next().ok_or("--vault-root requires a path")?,
                ))
            }
            "--operation" => {
                operation = match args.next().ok_or("--operation requires a value")?.as_str() {
                    "snapshot" => Operation::Snapshot,
                    "nara-read" => Operation::NaraRead,
                    "nara-write" => Operation::NaraWrite,
                    "nara-select" => Operation::NaraSelect,
                    other => return Err(format!("unknown operation `{other}`")),
                }
            }
            "--help" | "-h" => {
                println!(
                    "Usage: epi-pratibimba-bridge [--operation snapshot|nara-read|nara-write|nara-select] [--timestamp-ms N] [--generation N] [--vak-file PATH] [--nara-context PATH] [--vault-root PATH]\n\nThe default snapshot operation emits the Prompt-A primitive reading. Nara operations require the protected Nara context and vault root. nara-write and nara-select accept their JSON request on stdin so private text is never placed in process arguments. The process remains one-shot; it is not a daemon or session runtime."
                );
                return Ok(());
            }
            other => return Err(format!("unknown argument `{other}`")),
        }
    }

    let timestamp_ms = timestamp_ms.unwrap_or(system_time_ms()?);
    let vak = read_optional_json::<VakAddress>(vak_file.as_deref())?;
    let nara_context = read_optional_json::<NaraProtectedContext>(nara_context_file.as_deref())?;
    let observation = snapshot(timestamp_ms, generation, vak, nara_context)?;

    match operation {
        Operation::Snapshot => emit(&observation),
        Operation::NaraRead => {
            let vault_root = required_vault_root(vault_root.as_ref())?;
            emit(&read_daily_surface(vault_root, &observation)?)
        }
        Operation::NaraWrite => {
            let vault_root = required_vault_root(vault_root.as_ref())?;
            let request: NaraWriteRequest = read_stdin_json()?;
            emit(&write_daily_surface(
                vault_root,
                &observation,
                timestamp_ms,
                request,
            )?)
        }
        Operation::NaraSelect => {
            let vault_root = required_vault_root(vault_root.as_ref())?;
            let request: NaraSelectionRequest = read_stdin_json()?;
            emit(&resolve_selection(vault_root, &observation, request)?)
        }
    }
}

fn required_vault_root(value: Option<&PathBuf>) -> Result<&std::path::Path, String> {
    value
        .map(PathBuf::as_path)
        .ok_or_else(|| "Nara operation requires --vault-root".to_owned())
}

fn emit<T: Serialize>(value: &T) -> Result<(), String> {
    let json = serde_json::to_string_pretty(value)
        .map_err(|error| format!("serialize bridge response: {error}"))?;
    println!("{json}");
    Ok(())
}

fn read_stdin_json<T: DeserializeOwned>() -> Result<T, String> {
    let mut content = String::new();
    io::stdin()
        .read_to_string(&mut content)
        .map_err(|error| format!("read operation JSON from stdin: {error}"))?;
    if content.trim().is_empty() {
        return Err("operation requires a JSON request on stdin".to_owned());
    }
    serde_json::from_str(&content).map_err(|error| format!("parse operation JSON from stdin: {error}"))
}

fn read_optional_json<T: DeserializeOwned>(path: Option<&str>) -> Result<Option<T>, String> {
    let Some(path) = path else {
        return Ok(None);
    };
    let content = fs::read_to_string(path).map_err(|error| format!("read {path}: {error}"))?;
    serde_json::from_str(&content)
        .map(Some)
        .map_err(|error| format!("parse {path}: {error}"))
}

fn system_time_ms() -> Result<u64, String> {
    let duration = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|error| format!("system clock is before UNIX epoch: {error}"))?;
    u64::try_from(duration.as_millis()).map_err(|_| "system time exceeds u64 milliseconds".into())
}
