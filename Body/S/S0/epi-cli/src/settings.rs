//! `epi settings` — the S0 CLI membrane over the `epi-s0-settings` substrate.
//!
//! - Coordinate: S0 (CLI/process membrane) fronting the settings substrate and
//!   S0' cloud-opt-in authority.
//! - `status` reports key Present/Missing from the process environment (the
//!   user's shell exports keys; presence is never fetched over the gateway) plus
//!   each key's cloud opt-in state.
//! - `opt-in` records consent into the shared epi-logos config. It surfaces the
//!   privacy implication first — opt-in is frictional by design, never silent.

use clap::Subcommand;
use epi_s0_settings::{ApiKeyStore, CloudOptInStore, OptInStatus, PrivacyClass, SettingsManifest};
use serde_json::json;

#[derive(Subcommand, Debug)]
pub enum SettingsCmd {
    /// List all manifest keys with Present/Missing + cloud opt-in state
    Status,
    /// Record cloud opt-in for a key (surfaces the privacy implication first)
    #[command(name = "opt-in")]
    OptIn {
        /// Opt-in key id, e.g. `gemini_embedding`
        key: String,
        /// Consent scope recorded as provenance
        #[arg(long, default_value = "RETRIEVAL_DOCUMENT")]
        scope: String,
    },
}

pub fn run(cmd: &SettingsCmd, json_out: bool) -> Result<(), String> {
    match cmd {
        SettingsCmd::Status => status(json_out),
        SettingsCmd::OptIn { key, scope } => opt_in(key, scope, json_out),
    }
}

fn status(json_out: bool) -> Result<(), String> {
    let manifest = SettingsManifest::canonical();
    let keys = ApiKeyStore::from_env();
    let store = CloudOptInStore::from_default();

    let mut rows = Vec::new();
    for entry in manifest.entries() {
        let presence = keys.presence(entry.env_name);
        let opt_in = match entry.opt_in_key {
            Some(id) if entry.privacy == PrivacyClass::CloudOptIn => store
                .status(id)
                .map_err(|error| format!("read opt-in status for `{id}`: {error}"))?,
            _ => OptInStatus::NotRecorded,
        };
        rows.push((entry, presence, opt_in));
    }

    if json_out {
        let payload = json!({
            "config_path": store.path().display().to_string(),
            "keys": rows
                .iter()
                .map(|(entry, presence, opt_in)| json!({
                    "env_name": entry.env_name,
                    "opt_in_key": entry.opt_in_key,
                    "privacy": entry.privacy.as_str(),
                    "required": entry.required,
                    "presence": presence.as_str(),
                    "opt_in": opt_in.as_str(),
                }))
                .collect::<Vec<_>>(),
        });
        println!(
            "{}",
            serde_json::to_string_pretty(&payload).map_err(|error| error.to_string())?
        );
    } else {
        println!(
            "S0 settings — API key manifest ({})",
            store.path().display()
        );
        for (entry, presence, opt_in) in &rows {
            let opt = if entry.privacy == PrivacyClass::CloudOptIn {
                opt_in.as_str()
            } else {
                "n/a"
            };
            println!(
                "  {:<20} {:<8} {:<13} opt-in: {}",
                entry.env_name,
                presence.as_str(),
                entry.privacy.as_str(),
                opt
            );
        }
    }
    Ok(())
}

fn opt_in(key: &str, scope: &str, json_out: bool) -> Result<(), String> {
    let manifest = SettingsManifest::canonical();
    let entry = manifest.find_by_opt_in_key(key).ok_or_else(|| {
        let valid: Vec<&str> = manifest
            .entries()
            .iter()
            .filter_map(|entry| entry.opt_in_key)
            .collect();
        format!(
            "unknown opt-in key `{key}`; valid keys: {}",
            valid.join(", ")
        )
    })?;
    if entry.privacy != PrivacyClass::CloudOptIn {
        return Err(format!(
            "`{key}` is {}, no cloud opt-in applies",
            entry.privacy.as_str()
        ));
    }

    // Surface the privacy implication — opt-in is frictional by design.
    if !json_out {
        eprintln!(
            "Cloud opt-in — recording consent to dispatch content to the `{key}` cloud accessor.\n\
             Scope: {scope}. The key is read from your shell environment ({}), never sent over the gateway.",
            entry.env_name
        );
    }

    let consented_at = chrono::Utc::now().to_rfc3339();
    let store = CloudOptInStore::from_default();
    store
        .record(key, scope, &consented_at)
        .map_err(|error| format!("record opt-in for `{key}`: {error}"))?;

    if json_out {
        println!(
            "{}",
            serde_json::to_string_pretty(&json!({
                "opt_in_key": key,
                "consent_scope": scope,
                "consented_at": consented_at,
                "config_path": store.path().display().to_string(),
                "status": "recorded",
            }))
            .map_err(|error| error.to_string())?
        );
    } else {
        println!("Recorded cloud opt-in for `{key}` (scope {scope}) at {consented_at}.");
        println!("Written to {}.", store.path().display());
    }
    Ok(())
}
