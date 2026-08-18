use epi_pratibimba_bridge::{snapshot, NaraProtectedContext};
use portal_core::VakAddress;
use serde::de::DeserializeOwned;
use std::env;
use std::fs;
use std::time::{SystemTime, UNIX_EPOCH};

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
            "--help" | "-h" => {
                println!(
                    "Usage: epi-pratibimba-bridge [--timestamp-ms N] [--generation N] [--vak-file PATH] [--nara-context PATH]\n\nEmits one JSON snapshot and exits. It is not a daemon or session runtime."
                );
                return Ok(());
            }
            other => return Err(format!("unknown argument `{other}`")),
        }
    }

    let timestamp_ms = timestamp_ms.unwrap_or(system_time_ms()?);
    let vak = read_optional_json::<VakAddress>(vak_file.as_deref())?;
    let nara = read_optional_json::<NaraProtectedContext>(nara_context_file.as_deref())?;
    let observation = snapshot(timestamp_ms, generation, vak, nara)?;
    let json = serde_json::to_string_pretty(&observation)
        .map_err(|error| format!("serialize primitive snapshot: {error}"))?;
    println!("{json}");
    Ok(())
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
