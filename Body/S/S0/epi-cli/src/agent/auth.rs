use crate::agent::{AgentLayout, AuthCmd};
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use std::fs;

#[derive(Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
struct AuthProfiles {
    profiles: BTreeMap<String, StoredAuthProfile>,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct StoredAuthProfile {
    provider: String,
    api_key: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct AuthStatusReport {
    default_model: Option<String>,
    profiles: BTreeMap<String, RedactedAuthProfile>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct RedactedAuthProfile {
    provider: String,
    redacted: bool,
}

pub fn run(cmd: &AuthCmd, json: bool) -> Result<String, String> {
    match cmd {
        AuthCmd::Set {
            selection,
            provider,
            api_key,
        } => set(selection.agent.as_deref(), provider, api_key, json),
        AuthCmd::Status(selection) => status(selection.agent.as_deref(), json),
    }
}

fn set(agent: Option<&str>, provider: &str, api_key: &str, json: bool) -> Result<String, String> {
    let layout = AgentLayout::resolve(agent)?;
    layout.ensure_managed_layout()?;
    let mut profiles = load_profiles(&layout)?;
    profiles.profiles.insert(
        format!("{provider}:default"),
        StoredAuthProfile {
            provider: provider.to_owned(),
            api_key: api_key.to_owned(),
        },
    );
    save_profiles(&layout, &profiles)?;
    status(agent, json)
}

fn status(agent: Option<&str>, json: bool) -> Result<String, String> {
    let layout = AgentLayout::resolve(agent)?;
    let profiles = load_profiles(&layout)?;
    let default_model = load_default_model(&layout);
    let redacted_profiles = profiles
        .profiles
        .into_iter()
        .map(|(name, profile)| {
            (
                name,
                RedactedAuthProfile {
                    provider: profile.provider,
                    redacted: true,
                },
            )
        })
        .collect::<BTreeMap<_, _>>();
    let report = AuthStatusReport {
        default_model,
        profiles: redacted_profiles,
    };
    if json {
        serde_json::to_string_pretty(&report).map_err(|err| err.to_string())
    } else {
        Ok(report
            .profiles
            .keys()
            .cloned()
            .collect::<Vec<_>>()
            .join("\n"))
    }
}

fn load_profiles(layout: &AgentLayout) -> Result<AuthProfiles, String> {
    if !layout.auth_profiles_path.exists() {
        return Ok(AuthProfiles::default());
    }
    let contents = fs::read_to_string(&layout.auth_profiles_path).map_err(|err| err.to_string())?;
    serde_json::from_str(&contents).or_else(|_| Ok(AuthProfiles::default()))
}

fn save_profiles(layout: &AgentLayout, profiles: &AuthProfiles) -> Result<(), String> {
    fs::write(
        &layout.auth_profiles_path,
        serde_json::to_string_pretty(profiles).map_err(|err| err.to_string())?,
    )
    .map_err(|err| err.to_string())
}

fn load_default_model(layout: &AgentLayout) -> Option<String> {
    let contents = fs::read_to_string(&layout.models_path).ok()?;
    let parsed = serde_json::from_str::<serde_json::Value>(&contents).ok()?;
    parsed.get("defaultModel")?.as_str().map(str::to_owned)
}
