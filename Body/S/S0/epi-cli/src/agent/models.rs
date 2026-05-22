use crate::agent::{AgentLayout, ModelsCmd};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::BTreeMap;
use std::fs;
use std::process::Command;

/// PI-native models.json shape.
///
/// This file is custom provider configuration only. It is not a complete model
/// catalog, and this module must not reject defaults merely because PI-owned
/// providers/models are absent here.
#[derive(Serialize, Deserialize, Default)]
struct ModelsConfig {
    providers: BTreeMap<String, ProviderConfig>,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct ProviderConfig {
    #[serde(default)]
    name: String,
    #[serde(default)]
    base_url: String,
    #[serde(default)]
    api: String,
    #[serde(default)]
    api_key: String,
    #[serde(default)]
    models: Vec<ModelConfig>,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct ModelConfig {
    id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    input: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    context_window: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    max_tokens: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    compat: Option<Value>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ModelsStatus {
    default_model: Option<String>,
    availability_authority: &'static str,
    providers: Vec<ProviderStatus>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ProviderStatus {
    key: String,
    provider: String,
    api_base: String,
    api: String,
    api_key: String,
    models: Vec<String>,
}

pub fn run(cmd: &ModelsCmd, json: bool) -> Result<String, String> {
    match cmd {
        ModelsCmd::Init(selection) => init(selection.agent.as_deref(), json),
        ModelsCmd::AddProvider {
            selection,
            provider,
        } => add_provider(selection.agent.as_deref(), provider, json),
        ModelsCmd::SetDefault {
            selection,
            provider_model,
        } => set_default(selection.agent.as_deref(), provider_model, json),
        ModelsCmd::Status(selection) => status(selection.agent.as_deref(), json),
        ModelsCmd::List {
            selection,
            provider,
        } => list(selection.agent.as_deref(), provider.as_deref(), json),
    }
}

fn init(agent: Option<&str>, json: bool) -> Result<String, String> {
    let layout = AgentLayout::resolve(agent)?;
    layout.ensure_managed_layout()?;
    let config = load_models(&layout)?;
    save_models(&layout, &config)?;
    render_config(&layout, config, json)
}

fn add_provider(agent: Option<&str>, provider: &str, json: bool) -> Result<String, String> {
    let _ = (agent, json);
    Err(format!(
        "`epi agent models add-provider {provider}` is deprecated because PI owns model availability; write PI custom provider config directly or use `epi agent models set-default provider/model`"
    ))
}

fn set_default(agent: Option<&str>, provider_model: &str, json: bool) -> Result<String, String> {
    let layout = AgentLayout::resolve(agent)?;
    layout.ensure_managed_layout()?;
    let (provider, model) = parse_provider_model(provider_model)?;
    let config = load_models(&layout)?;
    save_default_settings(&layout, provider, model)?;
    render_config(&layout, config, json)
}

fn status(agent: Option<&str>, json: bool) -> Result<String, String> {
    let layout = AgentLayout::resolve(agent)?;
    render_config(&layout, load_models(&layout)?, json)
}

fn list(agent: Option<&str>, provider: Option<&str>, json: bool) -> Result<String, String> {
    let layout = AgentLayout::resolve(agent)?;
    layout.ensure_managed_layout()?;
    let mut command = Command::new("pi");
    command.arg("--list-models");
    if let Some(provider) = provider {
        command.arg(provider);
    }
    let output = command
        .current_dir(&layout.repo_root)
        .env("EPI_REPO_ROOT", &layout.repo_root)
        .env("EPI_AGENT_NAME", &layout.agent_id)
        .env("EPI_AGENT_ID", &layout.agent_id)
        .env("PI_CODING_AGENT_DIR", &layout.agent_dir)
        .env("EPI_AGENT_DIR", &layout.agent_dir)
        .env("EPI_AGENT_HOME", &layout.epi_home)
        .env("EPI_AGENT_PROMPTS_DIR", &layout.prompts_dir)
        .env("EPI_AGENT_PLUGIN_RUNTIME_PATH", &layout.plugin_runtime_path)
        .env("EPI_GATE_STATE_ROOT", &layout.gate_state_root)
        .env("CODEX_HOME", &layout.codex_home)
        .output()
        .map_err(|err| format!("failed to launch PI model discovery: {err}"))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    if json {
        serde_json::to_string_pretty(&serde_json::json!({
            "availabilityAuthority": "pi",
            "output": stdout,
        }))
        .map_err(|err| err.to_string())
    } else {
        Ok(stdout)
    }
}

fn load_models(layout: &AgentLayout) -> Result<ModelsConfig, String> {
    if !layout.models_path.exists() {
        return Ok(ModelsConfig::default());
    }
    let contents = fs::read_to_string(&layout.models_path).map_err(|err| err.to_string())?;
    serde_json::from_str(&contents).or_else(|_| Ok(ModelsConfig::default()))
}

fn save_models(layout: &AgentLayout, config: &ModelsConfig) -> Result<(), String> {
    fs::write(
        &layout.models_path,
        serde_json::to_string_pretty(config).map_err(|err| err.to_string())?,
    )
    .map_err(|err| err.to_string())
}

fn render_config(layout: &AgentLayout, config: ModelsConfig, json: bool) -> Result<String, String> {
    let default_model = load_default_model(layout);
    let status = ModelsStatus {
        default_model,
        availability_authority: "pi",
        providers: config
            .providers
            .iter()
            .map(|(key, provider)| ProviderStatus {
                key: key.clone(),
                provider: key.clone(),
                api_base: provider.base_url.clone(),
                api: provider.api.clone(),
                api_key: provider.api_key.clone(),
                models: provider
                    .models
                    .iter()
                    .map(|model| model.id.clone())
                    .collect(),
            })
            .collect(),
    };

    if json {
        serde_json::to_string_pretty(&status).map_err(|err| err.to_string())
    } else {
        Ok(format!(
            "providers: {}",
            status
                .providers
                .into_iter()
                .map(|provider| provider.key)
                .collect::<Vec<_>>()
                .join(", ")
        ))
    }
}

fn parse_provider_model(provider_model: &str) -> Result<(&str, &str), String> {
    let (provider, model) = provider_model
        .split_once('/')
        .ok_or_else(|| "default model must be in provider/model form".to_owned())?;
    if provider.trim().is_empty() || model.trim().is_empty() {
        return Err("default model must be in provider/model form".to_owned());
    }
    Ok((provider.trim(), model.trim()))
}

fn load_default_model(layout: &AgentLayout) -> Option<String> {
    let value = load_settings(layout).ok()?;
    let provider = value.get("defaultProvider")?.as_str()?;
    let model = value.get("defaultModel")?.as_str()?;
    Some(format!("{provider}/{model}"))
}

fn load_settings(layout: &AgentLayout) -> Result<Value, String> {
    if !layout.settings_path.exists() {
        return Ok(serde_json::json!({}));
    }
    let contents = fs::read_to_string(&layout.settings_path).map_err(|err| err.to_string())?;
    serde_json::from_str(&contents).or_else(|_| Ok(serde_json::json!({})))
}

fn save_default_settings(layout: &AgentLayout, provider: &str, model: &str) -> Result<(), String> {
    let mut settings = load_settings(layout)?;
    let object = settings
        .as_object_mut()
        .ok_or_else(|| "PI settings.json must be a JSON object".to_owned())?;
    object.insert("defaultProvider".to_owned(), serde_json::json!(provider));
    object.insert("defaultModel".to_owned(), serde_json::json!(model));
    fs::write(
        &layout.settings_path,
        serde_json::to_string_pretty(&settings).map_err(|err| err.to_string())?,
    )
    .map_err(|err| err.to_string())
}
