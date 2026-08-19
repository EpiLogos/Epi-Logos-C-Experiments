pub use epi_pratibimba_bridge::{
    EpiPrimitiveSnapshot, NaraProtectedContext, EPI_SOURCE_REVISION, QL_PROVIDER_REVISION,
};

mod nara;
mod personal;
mod personal_application;

// EpiiReviewMode is a two-variant value object. Keeping it Copy lets the bridge
// choose explanatory wording and then preserve the exact requested mode in the
// returned packet without introducing a second runtime/state object.
impl Copy for personal::EpiiReviewMode {}

use epi_pratibimba_bridge::snapshot;
use nara::{
    read_daily_surface, resolve_selection, write_daily_surface, NaraSelectionRequest,
    NaraWriteRequest,
};
use personal::{
    form_proposal, orient_ground, review_selection, EpiiReviewRequest, PersonalGroundRequest,
    PersonalProposalRequest,
};
use personal_application::personal_application;
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
    EpiiReview,
    PersonalGround,
    PersonalProposal,
    PersonalApplication,
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
                    "epii-review" => Operation::EpiiReview,
                    "personal-ground" => Operation::PersonalGround,
                    "personal-proposal" => Operation::PersonalProposal,
                    "personal-application" => Operation::PersonalApplication,
                    other => return Err(format!("unknown operation `{other}`")),
                }
            }
            "--help" | "-h" => {
                println!(
                    "Usage: epi-pratibimba-bridge [--operation snapshot|nara-read|nara-write|nara-select|epii-review|personal-ground|personal-proposal|personal-application] [--timestamp-ms N] [--generation N] [--vak-file PATH] [--nara-context PATH] [--vault-root PATH]\n\nThe default snapshot operation emits the primitive reading. Protected Nara and Personal 4/5/0 operations require the protected Nara context and vault root. Requests are accepted on stdin so private text is never placed in process arguments. Personal review/ground/proposal operations re-resolve the exact current Nara selection. personal-application emits a body-free epi.personal.450 application descriptor over the current governed episode, including activity readiness, .0/.5 boundary expression, deep-open descriptors and the D eventRef binding socket. The process remains one-shot; it is not a daemon, chat runtime, EpiiRuntime or SessionSpace."
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
        Operation::EpiiReview => {
            let vault_root = required_vault_root(vault_root.as_ref())?;
            let request: EpiiReviewRequest = read_stdin_json()?;
            emit(&review_selection(vault_root, &observation, request)?)
        }
        Operation::PersonalGround => {
            let vault_root = required_vault_root(vault_root.as_ref())?;
            let request: PersonalGroundRequest = read_stdin_json()?;
            emit(&orient_ground(vault_root, &observation, request)?)
        }
        Operation::PersonalProposal => {
            let vault_root = required_vault_root(vault_root.as_ref())?;
            let request: PersonalProposalRequest = read_stdin_json()?;
            emit(&form_proposal(vault_root, &observation, request)?)
        }
        Operation::PersonalApplication => {
            let vault_root = required_vault_root(vault_root.as_ref())?;
            emit(&personal_application(vault_root, &observation)?)
        }
    }
}

fn required_vault_root(value: Option<&PathBuf>) -> Result<&std::path::Path, String> {
    value
        .map(PathBuf::as_path)
        .ok_or_else(|| "Nara/Personal operation requires --vault-root".to_owned())
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
