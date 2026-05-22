use std::collections::BTreeMap;
use std::fs;
use std::path::Path;

use serde::Deserialize;
use serde_json::{json, Value};

use crate::agent::AgentLayout;

use super::config;

pub fn list(state_root: impl AsRef<Path>) -> Result<Value, String> {
    let doc = config::load_document(state_root)?;
    let inventory = GatewayModelInventory::load().unwrap_or_default();
    let models = inventory
        .to_value_models(&doc.gateway.auth_mode)
        .into_iter()
        .collect::<Vec<_>>();

    Ok(json!({
        "models": models,
        "defaultModel": inventory.default_model,
        "defaultProvider": inventory.default_provider().or_else(|| Some(doc.gateway.auth_mode)),
        "availabilityAuthority": "pi",
    }))
}

#[derive(Debug, Default, Deserialize)]
struct AgentModelsConfig {
    #[serde(default)]
    providers: BTreeMap<String, AgentProviderConfig>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct AgentProviderConfig {
    #[serde(default)]
    api: String,
    #[serde(default)]
    models: Vec<AgentModelConfig>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct AgentModelConfig {
    id: String,
}

#[derive(Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
struct AuthProfiles {
    #[serde(default)]
    profiles: BTreeMap<String, StoredAuthProfile>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct StoredAuthProfile {
    provider: String,
}

#[derive(Debug, Default)]
struct GatewayModelInventory {
    default_model: Option<String>,
    providers: Vec<GatewayProviderInventory>,
    auth_providers: Vec<String>,
}

#[derive(Debug)]
struct GatewayProviderInventory {
    key: String,
    provider: String,
    models: Vec<String>,
}

impl GatewayModelInventory {
    fn load() -> Result<Self, String> {
        let layout = AgentLayout::resolve(None)?;
        let providers = load_models(&layout)?
            .providers
            .into_iter()
            .map(|(key, provider)| GatewayProviderInventory {
                provider: upstream_provider_for(&key, &provider.api),
                key,
                models: provider.models.into_iter().map(|model| model.id).collect(),
            })
            .collect::<Vec<_>>();
        let auth_providers = load_auth_profiles(&layout)?
            .profiles
            .into_values()
            .map(|profile| profile.provider)
            .collect::<Vec<_>>();

        Ok(Self {
            default_model: load_default_model(&layout),
            providers,
            auth_providers,
        })
    }

    fn default_provider(&self) -> Option<String> {
        self.default_model
            .as_deref()
            .and_then(parse_provider_model)
            .map(|(provider, _)| provider.to_owned())
            .or_else(|| self.auth_providers.first().cloned())
            .or_else(|| self.providers.first().map(|provider| provider.key.clone()))
    }

    fn to_value_models(&self, fallback_provider: &str) -> Vec<Value> {
        let mut items = self
            .providers
            .iter()
            .flat_map(|provider| {
                provider.models.iter().map(|model| {
                    let configured_id = format!("{}/{}", provider.key, model);
                    json!({
                        "id": configured_id,
                        "provider": provider.key,
                        "upstreamProvider": provider.provider,
                        "transport": "gateway",
                        "default": self.default_model.as_deref() == Some(configured_id.as_str()),
                        "authenticated": self.auth_providers.iter().any(|entry| entry == &provider.provider || entry == &provider.key),
                    })
                })
            })
            .collect::<Vec<_>>();

        if items.is_empty() {
            if let Some(default_model) = &self.default_model {
                if let Some((provider, _)) = parse_provider_model(default_model) {
                    items.push(json!({
                        "id": default_model,
                        "provider": provider,
                        "transport": "gateway",
                        "default": true,
                        "authenticated": self.auth_providers.iter().any(|entry| entry == provider),
                    }));
                }
            }
            if items.is_empty() {
                items.push(json!({
                    "id": "pi.default",
                    "provider": fallback_provider,
                    "transport": "gateway",
                    "default": true,
                    "authenticated": false,
                }));
            }
        }

        items
    }
}

fn load_default_model(layout: &AgentLayout) -> Option<String> {
    let contents = fs::read_to_string(&layout.settings_path).ok()?;
    let parsed = serde_json::from_str::<Value>(&contents).ok()?;
    let provider = parsed.get("defaultProvider")?.as_str()?;
    let model = parsed.get("defaultModel")?.as_str()?;
    Some(format!("{provider}/{model}"))
}

fn load_models(layout: &AgentLayout) -> Result<AgentModelsConfig, String> {
    if !layout.models_path.exists() {
        return Ok(AgentModelsConfig::default());
    }

    let contents = fs::read_to_string(&layout.models_path).map_err(|err| err.to_string())?;
    serde_json::from_str(&contents).map_err(|err| err.to_string())
}

fn load_auth_profiles(layout: &AgentLayout) -> Result<AuthProfiles, String> {
    if !layout.auth_profiles_path.exists() {
        return Ok(AuthProfiles::default());
    }

    let contents = fs::read_to_string(&layout.auth_profiles_path).map_err(|err| err.to_string())?;
    serde_json::from_str(&contents).map_err(|err| err.to_string())
}

fn parse_provider_model(value: &str) -> Option<(&str, &str)> {
    let (provider, model) = value.split_once('/')?;
    if provider.trim().is_empty() || model.trim().is_empty() {
        return None;
    }
    Some((provider.trim(), model.trim()))
}

fn upstream_provider_for(provider: &str, fallback: &str) -> String {
    let _ = fallback;
    provider.to_owned()
}
