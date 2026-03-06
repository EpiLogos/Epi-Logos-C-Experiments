use crate::agent::{AgentLayout, ModelsCmd};
use serde::{Deserialize, Serialize};
use std::fs;

#[derive(Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
struct ModelsConfig {
    default_model: Option<String>,
    providers: Vec<ProviderConfig>,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct ProviderConfig {
    key: String,
    provider: String,
    api_base: String,
    models: Vec<String>,
    aliases: Vec<String>,
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
    }
}

fn init(agent: Option<&str>, json: bool) -> Result<String, String> {
    let layout = AgentLayout::resolve(agent)?;
    layout.ensure_managed_layout()?;
    let config = load_models(&layout)?;
    save_models(&layout, &config)?;
    render_config(config, json)
}

fn add_provider(agent: Option<&str>, provider: &str, json: bool) -> Result<String, String> {
    let layout = AgentLayout::resolve(agent)?;
    layout.ensure_managed_layout()?;
    let mut config = load_models(&layout)?;
    let provider_config = supported_provider(provider)?;
    if !config
        .providers
        .iter()
        .any(|entry| entry.key == provider_config.key)
    {
        config.providers.push(provider_config);
        config
            .providers
            .sort_by(|left, right| left.key.cmp(&right.key));
    }
    save_models(&layout, &config)?;
    render_config(config, json)
}

fn set_default(agent: Option<&str>, provider_model: &str, json: bool) -> Result<String, String> {
    let layout = AgentLayout::resolve(agent)?;
    layout.ensure_managed_layout()?;
    let mut config = load_models(&layout)?;
    config.default_model = Some(provider_model.to_owned());
    save_models(&layout, &config)?;
    render_config(config, json)
}

fn status(agent: Option<&str>, json: bool) -> Result<String, String> {
    let layout = AgentLayout::resolve(agent)?;
    render_config(load_models(&layout)?, json)
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

fn render_config(config: ModelsConfig, json: bool) -> Result<String, String> {
    if json {
        serde_json::to_string_pretty(&config).map_err(|err| err.to_string())
    } else {
        Ok(format!(
            "providers: {}",
            config
                .providers
                .into_iter()
                .map(|provider| provider.key)
                .collect::<Vec<_>>()
                .join(", ")
        ))
    }
}

fn supported_provider(provider: &str) -> Result<ProviderConfig, String> {
    match provider {
        "kimi" => Ok(ProviderConfig {
            key: "kimi".to_owned(),
            provider: "moonshot".to_owned(),
            api_base: "https://api.moonshot.ai/v1".to_owned(),
            models: vec!["kimi-k2".to_owned(), "kimi-latest".to_owned()],
            aliases: vec!["moonshot".to_owned()],
        }),
        "minimax" => Ok(ProviderConfig {
            key: "minimax".to_owned(),
            provider: "minimax".to_owned(),
            api_base: "https://api.minimax.chat/v1".to_owned(),
            models: vec!["minimax-m1".to_owned()],
            aliases: vec!["mini-max".to_owned()],
        }),
        "glm" => Ok(ProviderConfig {
            key: "glm".to_owned(),
            provider: "zai".to_owned(),
            api_base: "https://open.bigmodel.cn/api/paas/v4".to_owned(),
            models: vec!["glm-4.5".to_owned()],
            aliases: vec!["zai".to_owned(), "bigmodel".to_owned()],
        }),
        other => Err(format!("unsupported provider: {other}")),
    }
}
