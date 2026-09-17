//! Slot configuration surface for [[M'-MODEL-SLOT-SPEC]].

use clap::{Args, Subcommand, ValueEnum};
use serde::Serialize;
use std::collections::{BTreeMap, BTreeSet};
use std::fmt;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

const CONFIG_ENV: &str = "EPI_SLOT_CONFIG_PATH";
const CLOUD_CONFIRMATION: &str = "I understand";
const PRIVACY_MISMATCH_VIOLATION: &str = "harness-model-privacy-mismatch";

#[derive(Subcommand, Debug)]
pub enum SlotCmd {
    /// List model slots and orthogonal harness slots.
    List,
    /// Show the composed model + harness state for one slot.
    Show(SlotNameArgs),
    /// Configure the model-slot namespace.
    Model {
        #[command(subcommand)]
        cmd: ModelSlotCmd,
    },
    /// Configure the harness-slot namespace.
    Harness {
        #[command(subcommand)]
        cmd: HarnessSlotCmd,
    },
    /// Disable both namespaces for a slot by setting model and harness to null.
    Disable(SlotNameArgs),
    /// Test model + harness composition reachability and verifier coherence.
    Test(SlotNameArgs),
}

#[derive(Subcommand, Debug)]
pub enum ModelSlotCmd {
    /// Set a model slot state/provider/model in ~/.epi-logos/config.toml.
    Set(ModelSetArgs),
}

#[derive(Subcommand, Debug)]
pub enum HarnessSlotCmd {
    /// Set a harness slot state/provider in ~/.epi-logos/config.toml.
    Set(HarnessSetArgs),
}

#[derive(Args, Debug)]
pub struct SlotNameArgs {
    pub name: String,
}

#[derive(Args, Debug)]
pub struct ModelSetArgs {
    pub name: String,
    #[arg(long, value_enum)]
    pub state: SlotState,
    #[arg(long)]
    pub provider: String,
    #[arg(long)]
    pub model: String,
    /// Required as --confirm "I understand" when enabling cloud routing for a local-default slot.
    #[arg(long)]
    pub confirm: Option<String>,
}

#[derive(Args, Debug)]
pub struct HarnessSetArgs {
    pub name: String,
    #[arg(long, value_enum)]
    pub state: SlotState,
    #[arg(long)]
    pub provider: String,
    /// Required as --confirm "I understand" when enabling cloud routing for a local-default slot.
    #[arg(long)]
    pub confirm: Option<String>,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize, ValueEnum)]
#[serde(rename_all = "kebab-case")]
#[value(rename_all = "kebab-case")]
pub enum SlotState {
    LocalDefault,
    CloudOptIn,
    Null,
}

impl SlotState {
    pub fn as_str(self) -> &'static str {
        match self {
            SlotState::LocalDefault => "local-default",
            SlotState::CloudOptIn => "cloud-opt-in",
            SlotState::Null => "null",
        }
    }

    fn parse(value: &str) -> Result<Self, String> {
        match value {
            "local-default" => Ok(SlotState::LocalDefault),
            "cloud-opt-in" => Ok(SlotState::CloudOptIn),
            "null" => Ok(SlotState::Null),
            other => Err(format!(
                "invalid slot state {other:?}; expected local-default, cloud-opt-in, or null"
            )),
        }
    }
}

impl fmt::Display for SlotState {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(self.as_str())
    }
}

#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize)]
#[serde(rename_all = "kebab-case")]
pub enum SlotNamespace {
    Model,
    Harness,
}

#[derive(Clone, Debug, Eq, PartialEq)]
struct SlotDefinition {
    name: &'static str,
    model_state: SlotState,
    model_provider: &'static str,
    model: &'static str,
    model_consent_scope: Option<&'static str>,
    harness_state: SlotState,
    harness_provider: &'static str,
    harness_consent_scope: Option<&'static str>,
    local_privacy_implication: &'static str,
}

#[derive(Clone, Debug, Eq, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SlotDimension {
    pub state: SlotState,
    pub provider: Option<String>,
    pub model: Option<String>,
    pub consent_scope: Option<String>,
    pub fallback: Option<String>,
}

#[derive(Clone, Debug, Eq, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SlotComposition {
    pub slot_name: String,
    pub model: SlotDimension,
    pub harness: SlotDimension,
    pub verifier_status: String,
    pub fallback_action: String,
}

#[derive(Clone, Debug, Eq, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SlotListRow {
    pub name: String,
    pub model_state: SlotState,
    pub model_provider: Option<String>,
    pub model: Option<String>,
    pub harness_state: SlotState,
    pub harness_provider: Option<String>,
    pub verifier_status: String,
}

#[derive(Clone, Debug, Default, Eq, PartialEq)]
pub struct DispatchContext {
    pub content_class: Option<String>,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PiSlotResolveRequest {
    pub slot_name: String,
    pub dispatch_context: DispatchContext,
}

#[derive(Clone, Debug, Eq, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PiSlotResolved {
    pub slot_name: String,
    pub model_ref: Option<String>,
    pub harness_ref: Option<String>,
    pub state: SlotState,
    pub fallback_action: String,
}

#[derive(Clone, Debug, Eq, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SlotTestReport {
    pub slot_name: String,
    pub reachable: bool,
    pub model_reachable: bool,
    pub harness_reachable: bool,
    pub verifier_status: String,
    pub fallback_action: String,
    pub diagnostics: Vec<String>,
}

#[derive(Clone, Debug, Default, Eq, PartialEq)]
struct SlotConfig {
    model_slots: BTreeMap<String, BTreeMap<String, String>>,
    harness_slots: BTreeMap<String, BTreeMap<String, String>>,
}

pub fn dispatch(cmd: &SlotCmd, json: bool) -> Result<String, String> {
    let path = config_path()?;
    match cmd {
        SlotCmd::List => {
            let config = SlotConfig::load(&path)?;
            let rows = list_slots(&config)?;
            if json {
                serde_json::to_string_pretty(&rows).map_err(|err| err.to_string())
            } else {
                Ok(format_slot_list(&rows))
            }
        }
        SlotCmd::Show(args) => {
            let config = SlotConfig::load(&path)?;
            let composition =
                resolve_composition(&config, &args.name, &DispatchContext::default())?;
            if json {
                serde_json::to_string_pretty(&composition).map_err(|err| err.to_string())
            } else {
                Ok(format_slot_composition(&composition))
            }
        }
        SlotCmd::Model {
            cmd: ModelSlotCmd::Set(args),
        } => set_model_slot(&path, args, json),
        SlotCmd::Harness {
            cmd: HarnessSlotCmd::Set(args),
        } => set_harness_slot(&path, args, json),
        SlotCmd::Disable(args) => disable_slot(&path, &args.name, json),
        SlotCmd::Test(args) => {
            let config = SlotConfig::load(&path)?;
            let report = test_slot_composition(&config, &args.name)?;
            if json {
                serde_json::to_string_pretty(&report).map_err(|err| err.to_string())
            } else if report.reachable {
                Ok(format_slot_test(&report))
            } else {
                Err(format_slot_test(&report))
            }
        }
    }
}

pub fn pi_slot_resolve(request: PiSlotResolveRequest) -> Result<PiSlotResolved, String> {
    let path = config_path()?;
    let config = SlotConfig::load(&path)?;
    let composition = resolve_composition(&config, &request.slot_name, &request.dispatch_context)?;
    Ok(PiSlotResolved {
        slot_name: composition.slot_name,
        model_ref: model_ref(&composition.model),
        harness_ref: harness_ref(&composition.harness),
        state: composition.model.state,
        fallback_action: composition.fallback_action,
    })
}

fn set_model_slot(path: &Path, args: &ModelSetArgs, json: bool) -> Result<String, String> {
    let definition = slot_definition(&args.name)?;
    require_cloud_confirmation(
        SlotNamespace::Model,
        definition,
        args.state,
        args.provider.as_str(),
        args.confirm.as_deref(),
    )?;

    let mut config = SlotConfig::load(path)?;
    let mut table = BTreeMap::new();
    table.insert("state".to_owned(), args.state.as_str().to_owned());
    table.insert("provider".to_owned(), args.provider.clone());
    table.insert("model".to_owned(), args.model.clone());
    if let Some(scope) = consent_scope_for_model(definition, args.state) {
        table.insert("consent_scope".to_owned(), scope.to_owned());
    }
    if args.state == SlotState::LocalDefault {
        table.insert("fallback".to_owned(), "null".to_owned());
    }
    config.model_slots.insert(args.name.clone(), table);
    config.save(path)?;
    render_mutation("model", &args.name, args.state, path, json)
}

fn set_harness_slot(path: &Path, args: &HarnessSetArgs, json: bool) -> Result<String, String> {
    let definition = slot_definition(&args.name)?;
    validate_harness_provider(&args.provider)?;
    require_cloud_confirmation(
        SlotNamespace::Harness,
        definition,
        args.state,
        args.provider.as_str(),
        args.confirm.as_deref(),
    )?;

    let mut config = SlotConfig::load(path)?;
    let mut table = BTreeMap::new();
    table.insert("state".to_owned(), args.state.as_str().to_owned());
    table.insert("provider".to_owned(), args.provider.clone());
    if let Some(scope) = consent_scope_for_harness(definition, args.state) {
        table.insert("consent_scope".to_owned(), scope.to_owned());
    }
    if args.state == SlotState::LocalDefault {
        table.insert("fallback".to_owned(), "null".to_owned());
    }
    config.harness_slots.insert(args.name.clone(), table);
    config.save(path)?;
    render_mutation("harness", &args.name, args.state, path, json)
}

fn disable_slot(path: &Path, name: &str, json: bool) -> Result<String, String> {
    slot_definition(name)?;
    let mut config = SlotConfig::load(path)?;
    config
        .model_slots
        .insert(name.to_owned(), null_table(SlotNamespace::Model));
    config
        .harness_slots
        .insert(name.to_owned(), null_table(SlotNamespace::Harness));
    config.save(path)?;
    render_mutation("slot", name, SlotState::Null, path, json)
}

fn null_table(namespace: SlotNamespace) -> BTreeMap<String, String> {
    let mut table = BTreeMap::new();
    table.insert("state".to_owned(), SlotState::Null.as_str().to_owned());
    table.insert(
        "disabled_namespace".to_owned(),
        match namespace {
            SlotNamespace::Model => "model",
            SlotNamespace::Harness => "harness",
        }
        .to_owned(),
    );
    table
}

fn render_mutation(
    namespace: &str,
    name: &str,
    state: SlotState,
    path: &Path,
    json: bool,
) -> Result<String, String> {
    let payload = serde_json::json!({
        "namespace": namespace,
        "name": name,
        "state": state,
        "configPath": path.display().to_string(),
    });
    if json {
        serde_json::to_string_pretty(&payload).map_err(|err| err.to_string())
    } else {
        Ok(format!(
            "{namespace} {name} set to {state} in {}",
            path.display()
        ))
    }
}

fn list_slots(config: &SlotConfig) -> Result<Vec<SlotListRow>, String> {
    let mut names: BTreeSet<String> = known_slot_names().into_iter().map(str::to_owned).collect();
    names.extend(config.model_slots.keys().cloned());
    names.extend(config.harness_slots.keys().cloned());

    names
        .into_iter()
        .map(|name| {
            let composition = resolve_composition(config, &name, &DispatchContext::default())?;
            Ok(SlotListRow {
                name,
                model_state: composition.model.state,
                model_provider: composition.model.provider,
                model: composition.model.model,
                harness_state: composition.harness.state,
                harness_provider: composition.harness.provider,
                verifier_status: composition.verifier_status,
            })
        })
        .collect()
}

fn resolve_composition(
    config: &SlotConfig,
    name: &str,
    context: &DispatchContext,
) -> Result<SlotComposition, String> {
    let definition = slot_definition(name)?;
    let model = resolve_dimension(
        config.model_slots.get(name),
        SlotNamespace::Model,
        definition,
    )?;
    let harness = resolve_dimension(
        config.harness_slots.get(name),
        SlotNamespace::Harness,
        definition,
    )?;
    validate_composition(name, &model, &harness, context)?;
    Ok(SlotComposition {
        slot_name: name.to_owned(),
        fallback_action: fallback_action(&model, &harness),
        verifier_status: "ok".to_owned(),
        model,
        harness,
    })
}

fn resolve_dimension(
    configured: Option<&BTreeMap<String, String>>,
    namespace: SlotNamespace,
    definition: &SlotDefinition,
) -> Result<SlotDimension, String> {
    let default_state = match namespace {
        SlotNamespace::Model => definition.model_state,
        SlotNamespace::Harness => definition.harness_state,
    };
    let default_provider = match namespace {
        SlotNamespace::Model => Some(definition.model_provider),
        SlotNamespace::Harness => Some(definition.harness_provider),
    };
    let default_model = match namespace {
        SlotNamespace::Model => Some(definition.model),
        SlotNamespace::Harness => None,
    };
    let default_scope = match namespace {
        SlotNamespace::Model => definition.model_consent_scope,
        SlotNamespace::Harness => definition.harness_consent_scope,
    };

    let state = configured
        .and_then(|table| table.get("state"))
        .map(|value| SlotState::parse(value))
        .transpose()?
        .unwrap_or(default_state);
    let provider = configured
        .and_then(|table| table.get("provider"))
        .cloned()
        .or_else(|| default_provider.map(str::to_owned))
        .filter(|_| state != SlotState::Null);
    let model = configured
        .and_then(|table| table.get("model"))
        .cloned()
        .or_else(|| default_model.map(str::to_owned))
        .filter(|_| state != SlotState::Null);
    let consent_scope = configured
        .and_then(|table| table.get("consent_scope"))
        .cloned()
        .or_else(|| default_scope.map(str::to_owned))
        .filter(|_| state == SlotState::CloudOptIn);
    let fallback = configured.and_then(|table| table.get("fallback")).cloned();

    Ok(SlotDimension {
        state,
        provider,
        model,
        consent_scope,
        fallback,
    })
}

fn validate_composition(
    name: &str,
    model: &SlotDimension,
    harness: &SlotDimension,
    context: &DispatchContext,
) -> Result<(), String> {
    if model.state == SlotState::LocalDefault && harness.state == SlotState::CloudOptIn {
        return Err(format!(
            "{PRIVACY_MISMATCH_VIOLATION}: slot.{name}.state = \"local-default\" cannot compose with harness.{name}.state = \"cloud-opt-in\""
        ));
    }
    if model.state == SlotState::LocalDefault && model.fallback.as_deref() == Some("cloud-opt-in") {
        return Err(format!(
            "slot_fallback_compliance: slot.{name}.state = \"local-default\" must not fallback to cloud-opt-in"
        ));
    }
    if harness.state == SlotState::LocalDefault
        && harness.fallback.as_deref() == Some("cloud-opt-in")
    {
        return Err(format!(
            "slot_fallback_compliance: harness.{name}.state = \"local-default\" must not fallback to cloud-opt-in"
        ));
    }
    if let Some(content_class) = context.content_class.as_deref() {
        if model.state == SlotState::CloudOptIn
            && !scope_covers(model.consent_scope.as_deref(), content_class)
        {
            return Err(format!(
                "slot_privacy_boundary_compliance: content class {content_class:?} is not covered by model consent scope {:?}",
                model.consent_scope
            ));
        }
        if harness.state == SlotState::CloudOptIn
            && !scope_covers(harness.consent_scope.as_deref(), content_class)
        {
            return Err(format!(
                "slot_privacy_boundary_compliance: content class {content_class:?} is not covered by harness consent scope {:?}",
                harness.consent_scope
            ));
        }
    }
    Ok(())
}

fn test_slot_composition(config: &SlotConfig, name: &str) -> Result<SlotTestReport, String> {
    match resolve_composition(config, name, &DispatchContext::default()) {
        Ok(composition) => {
            let mut diagnostics = Vec::new();
            let model_reachable =
                dimension_reachable(SlotNamespace::Model, &composition.model, &mut diagnostics);
            let harness_reachable = dimension_reachable(
                SlotNamespace::Harness,
                &composition.harness,
                &mut diagnostics,
            );
            Ok(SlotTestReport {
                slot_name: name.to_owned(),
                reachable: model_reachable && harness_reachable,
                model_reachable,
                harness_reachable,
                verifier_status: composition.verifier_status,
                fallback_action: composition.fallback_action,
                diagnostics,
            })
        }
        Err(err) => Ok(SlotTestReport {
            slot_name: name.to_owned(),
            reachable: false,
            model_reachable: false,
            harness_reachable: false,
            verifier_status: err.clone(),
            fallback_action: "refuse-dispatch".to_owned(),
            diagnostics: vec![err],
        }),
    }
}

fn dimension_reachable(
    namespace: SlotNamespace,
    dimension: &SlotDimension,
    diagnostics: &mut Vec<String>,
) -> bool {
    match dimension.state {
        SlotState::Null => {
            diagnostics.push(format!(
                "{namespace:?} namespace is null; dispatch will fail-soft"
            ));
            false
        }
        SlotState::LocalDefault => {
            let provider = match dimension.provider.as_deref() {
                Some(provider) => provider,
                None => {
                    diagnostics.push(format!("{namespace:?} local-default has no provider"));
                    return false;
                }
            };
            match provider {
                "pi" => {
                    diagnostics.push("pi harness is in-process and reachable".to_owned());
                    true
                }
                "ollama" if namespace == SlotNamespace::Model => {
                    let Some(model) = dimension.model.as_deref() else {
                        diagnostics.push("ollama model slot has no model".to_owned());
                        return false;
                    };
                    command_succeeds("ollama", &["show", model], diagnostics)
                }
                "ollama" => command_succeeds("ollama", &["--version"], diagnostics),
                other => command_succeeds(other, &["--version"], diagnostics),
            }
        }
        SlotState::CloudOptIn => {
            let provider = dimension.provider.as_deref().unwrap_or_default();
            if cloud_provider_available(provider) {
                diagnostics.push(format!(
                    "{provider} cloud credential or local CLI is available"
                ));
                true
            } else {
                diagnostics.push(format!(
                    "{provider} cloud route is configured but no credential/CLI was found"
                ));
                false
            }
        }
    }
}

fn command_succeeds(command: &str, args: &[&str], diagnostics: &mut Vec<String>) -> bool {
    match Command::new(command).args(args).output() {
        Ok(output) if output.status.success() => {
            diagnostics.push(format!("{command} {} succeeded", args.join(" ")));
            true
        }
        Ok(output) => {
            let stderr = String::from_utf8_lossy(&output.stderr);
            diagnostics.push(format!(
                "{command} {} exited with {}: {}",
                args.join(" "),
                output.status,
                stderr.trim()
            ));
            false
        }
        Err(err) => {
            diagnostics.push(format!(
                "{command} {} failed to start: {err}",
                args.join(" ")
            ));
            false
        }
    }
}

fn cloud_provider_available(provider: &str) -> bool {
    let env_key = match provider {
        "anthropic" | "claude" => "ANTHROPIC_API_KEY",
        "openai" | "codex" => "OPENAI_API_KEY",
        "google" | "gemini" => "GOOGLE_API_KEY",
        other => {
            let key = format!("{}_API_KEY", other.to_ascii_uppercase().replace('-', "_"));
            return std::env::var_os(key).is_some() || command_available(other);
        }
    };
    std::env::var_os(env_key).is_some() || command_available(provider)
}

fn command_available(command: &str) -> bool {
    Command::new(command)
        .arg("--version")
        .output()
        .map(|output| output.status.success())
        .unwrap_or(false)
}

fn model_ref(dimension: &SlotDimension) -> Option<String> {
    match (&dimension.provider, &dimension.model) {
        (Some(provider), Some(model)) if dimension.state != SlotState::Null => {
            Some(format!("{provider}:{model}"))
        }
        _ => None,
    }
}

fn harness_ref(dimension: &SlotDimension) -> Option<String> {
    dimension
        .provider
        .as_ref()
        .filter(|_| dimension.state != SlotState::Null)
        .cloned()
}

fn fallback_action(model: &SlotDimension, harness: &SlotDimension) -> String {
    if model.state == SlotState::Null || harness.state == SlotState::Null {
        "fail-soft-null".to_owned()
    } else {
        "dispatch".to_owned()
    }
}

fn scope_covers(scope: Option<&str>, content_class: &str) -> bool {
    let Some(scope) = scope else {
        return false;
    };
    let content_class = content_class.trim();
    scope == content_class
        || scope == "raw-content-journal-dream"
        || (scope == "vector-only-derived-signal"
            && matches!(
                content_class,
                "vector-only" | "derived-signal" | "vector-only-derived-signal"
            ))
        || (scope == "vector-only-graphrag-context"
            && matches!(
                content_class,
                "vector-only" | "derived-signal" | "vector-only-graphrag-context"
            ))
        || (scope == "skill-design-no-user-content"
            && matches!(
                content_class,
                "non-sensitive" | "skill-design-no-user-content"
            ))
        || (scope == "judge-loop-only" && content_class == "vector-only-derived-signal")
}

fn require_cloud_confirmation(
    namespace: SlotNamespace,
    definition: &SlotDefinition,
    requested: SlotState,
    provider: &str,
    confirm: Option<&str>,
) -> Result<(), String> {
    let default_state = match namespace {
        SlotNamespace::Model => definition.model_state,
        SlotNamespace::Harness => definition.harness_state,
    };
    if requested != SlotState::CloudOptIn || default_state != SlotState::LocalDefault {
        return Ok(());
    }
    if confirm == Some(CLOUD_CONFIRMATION) {
        return Ok(());
    }
    Err(format!(
        "Enabling cloud routing for {} means {} will be sent to {provider}. Type {CLOUD_CONFIRMATION:?} with --confirm to confirm.",
        definition.name, definition.local_privacy_implication
    ))
}

fn consent_scope_for_model(definition: &SlotDefinition, state: SlotState) -> Option<&'static str> {
    if state == SlotState::CloudOptIn {
        definition.model_consent_scope
    } else {
        None
    }
}

fn consent_scope_for_harness(
    definition: &SlotDefinition,
    state: SlotState,
) -> Option<&'static str> {
    if state == SlotState::CloudOptIn {
        definition
            .harness_consent_scope
            .or(definition.model_consent_scope)
    } else {
        None
    }
}

fn validate_harness_provider(provider: &str) -> Result<(), String> {
    match provider {
        "pi" | "claude" | "codex" | "aider" | "ollama" => Ok(()),
        other => Err(format!(
            "unknown harness provider {other:?}; expected pi, claude, codex, aider, or ollama"
        )),
    }
}

impl SlotConfig {
    fn load(path: &Path) -> Result<Self, String> {
        let raw = match fs::read_to_string(path) {
            Ok(raw) => raw,
            Err(err) if err.kind() == std::io::ErrorKind::NotFound => String::new(),
            Err(err) => return Err(format!("read {}: {err}", path.display())),
        };
        Ok(parse_slot_config(&raw))
    }

    fn save(&self, path: &Path) -> Result<(), String> {
        let existing = match fs::read_to_string(path) {
            Ok(raw) => raw,
            Err(err) if err.kind() == std::io::ErrorKind::NotFound => String::new(),
            Err(err) => return Err(format!("read {}: {err}", path.display())),
        };
        let mut updates = BTreeMap::new();
        for (name, table) in &self.model_slots {
            updates.insert(format!("slot.{name}"), table.clone());
        }
        for (name, table) in &self.harness_slots {
            updates.insert(format!("harness.{name}"), table.clone());
        }
        let rendered = render_config_with_updates(&existing, &updates);
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)
                .map_err(|err| format!("create {}: {err}", parent.display()))?;
        }
        fs::write(path, rendered).map_err(|err| format!("write {}: {err}", path.display()))
    }
}

fn parse_slot_config(raw: &str) -> SlotConfig {
    let mut config = SlotConfig::default();
    let mut current: Option<(SlotNamespace, String)> = None;

    for line in raw.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with('[') && trimmed.ends_with(']') {
            let section = trimmed.trim_start_matches('[').trim_end_matches(']');
            current = if let Some(name) = section.strip_prefix("slot.") {
                Some((SlotNamespace::Model, name.to_owned()))
            } else {
                section
                    .strip_prefix("harness.")
                    .map(|name| (SlotNamespace::Harness, name.to_owned()))
            };
            continue;
        }

        let Some((namespace, name)) = current.as_ref() else {
            continue;
        };
        if trimmed.is_empty() || trimmed.starts_with('#') {
            continue;
        }
        let Some((key, value)) = parse_key_value(trimmed) else {
            continue;
        };
        let target = match namespace {
            SlotNamespace::Model => &mut config.model_slots,
            SlotNamespace::Harness => &mut config.harness_slots,
        };
        target
            .entry(name.clone())
            .or_default()
            .insert(key.to_owned(), value);
    }

    config
}

fn parse_key_value(line: &str) -> Option<(&str, String)> {
    let (key, raw_value) = line.split_once('=')?;
    let key = key.trim();
    let value = strip_inline_comment(raw_value.trim()).trim();
    if key.is_empty() || value.is_empty() {
        return None;
    }
    Some((key, parse_toml_scalar(value)))
}

fn strip_inline_comment(value: &str) -> &str {
    let mut in_quotes = false;
    for (idx, ch) in value.char_indices() {
        match ch {
            '"' => in_quotes = !in_quotes,
            '#' if !in_quotes => return &value[..idx],
            _ => {}
        }
    }
    value
}

fn parse_toml_scalar(value: &str) -> String {
    let value = value.trim();
    if value.starts_with('"') && value.ends_with('"') && value.len() >= 2 {
        value[1..value.len() - 1].replace("\\\"", "\"")
    } else {
        value.to_owned()
    }
}

fn render_config_with_updates(
    existing: &str,
    updates: &BTreeMap<String, BTreeMap<String, String>>,
) -> String {
    let mut out = Vec::new();
    let mut skip = false;
    let mut seen = BTreeSet::new();

    for line in existing.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with('[') && trimmed.ends_with(']') {
            let section = trimmed.trim_start_matches('[').trim_end_matches(']');
            if updates.contains_key(section) {
                skip = true;
                seen.insert(section.to_owned());
                continue;
            }
            skip = false;
        }
        if !skip {
            out.push(line.to_owned());
        }
    }

    while out
        .last()
        .map(|line| line.trim().is_empty())
        .unwrap_or(false)
    {
        out.pop();
    }

    for (section, table) in updates {
        if !out.is_empty() {
            out.push(String::new());
        }
        out.push(format!("[{section}]"));
        for (key, value) in table {
            out.push(format!("{key} = {}", render_toml_string(value)));
        }
        seen.insert(section.clone());
    }

    let mut rendered = out.join("\n");
    rendered.push('\n');
    rendered
}

fn render_toml_string(value: &str) -> String {
    let escaped = value.replace('\\', "\\\\").replace('"', "\\\"");
    format!("\"{escaped}\"")
}

fn config_path() -> Result<PathBuf, String> {
    if let Some(path) = std::env::var_os(CONFIG_ENV) {
        return Ok(PathBuf::from(path));
    }
    dirs::home_dir()
        .map(|home| home.join(".epi-logos").join("config.toml"))
        .ok_or_else(|| "HOME is required to locate ~/.epi-logos/config.toml".to_owned())
}

fn slot_definition(name: &str) -> Result<&'static SlotDefinition, String> {
    known_slots()
        .iter()
        .find(|definition| definition.name == name)
        .ok_or_else(|| {
            format!(
                "unknown slot {name:?}; known slots: {}",
                known_slot_names().join(", ")
            )
        })
}

fn known_slot_names() -> Vec<&'static str> {
    known_slots()
        .iter()
        .map(|definition| definition.name)
        .collect()
}

fn known_slots() -> &'static [SlotDefinition] {
    &[
        SlotDefinition {
            name: "nara_parser",
            model_state: SlotState::LocalDefault,
            model_provider: "ollama",
            model: "gemma3:12b-q4_K_M",
            model_consent_scope: Some("raw-content-journal-dream"),
            harness_state: SlotState::LocalDefault,
            harness_provider: "ollama",
            harness_consent_scope: Some("raw-content-journal-dream"),
            local_privacy_implication: "your journal entries and dream content",
        },
        SlotDefinition {
            name: "epii_judge",
            model_state: SlotState::CloudOptIn,
            model_provider: "anthropic",
            model: "claude-opus-4-7",
            model_consent_scope: Some("vector-only-derived-signal"),
            harness_state: SlotState::CloudOptIn,
            harness_provider: "claude",
            harness_consent_scope: Some("judge-loop-only"),
            local_privacy_implication: "derived judge-loop signal",
        },
        SlotDefinition {
            name: "gnostic_extractor",
            model_state: SlotState::LocalDefault,
            model_provider: "ollama",
            model: "gemma3:12b-q4_K_M",
            model_consent_scope: Some("raw-corpus-extraction"),
            harness_state: SlotState::LocalDefault,
            harness_provider: "ollama",
            harness_consent_scope: Some("raw-corpus-extraction"),
            local_privacy_implication: "raw corpus extraction content",
        },
        SlotDefinition {
            name: "anuttara_verifier",
            model_state: SlotState::LocalDefault,
            model_provider: "ollama",
            model: "qwen2.5-7b-instruct-q5",
            model_consent_scope: Some("kernel-substrate-local"),
            harness_state: SlotState::LocalDefault,
            harness_provider: "pi",
            harness_consent_scope: Some("kernel-substrate-local"),
            local_privacy_implication: "kernel-substrate verifier content",
        },
        SlotDefinition {
            name: "aletheia.anansi",
            model_state: SlotState::LocalDefault,
            model_provider: "ollama",
            model: "gemma3:e4b",
            model_consent_scope: Some("coordinate-mapping"),
            harness_state: SlotState::LocalDefault,
            harness_provider: "pi",
            harness_consent_scope: Some("coordinate-mapping"),
            local_privacy_implication: "coordinate-mapping context",
        },
        SlotDefinition {
            name: "aletheia.janus",
            model_state: SlotState::LocalDefault,
            model_provider: "ollama",
            model: "gemma3:12b-q4_K_M",
            model_consent_scope: Some("threshold-logic"),
            harness_state: SlotState::LocalDefault,
            harness_provider: "pi",
            harness_consent_scope: Some("threshold-logic"),
            local_privacy_implication: "threshold-logic context",
        },
        SlotDefinition {
            name: "aletheia.moirai",
            model_state: SlotState::CloudOptIn,
            model_provider: "anthropic",
            model: "claude-opus-4-7",
            model_consent_scope: Some("vector-only-graphrag-context"),
            harness_state: SlotState::CloudOptIn,
            harness_provider: "claude",
            harness_consent_scope: Some("vector-only-graphrag-context"),
            local_privacy_implication: "GraphRAG-derived vector context",
        },
        SlotDefinition {
            name: "aletheia.mercurius",
            model_state: SlotState::LocalDefault,
            model_provider: "ollama",
            model: "gemma3:12b-q4_K_M",
            model_consent_scope: Some("kairos-elo-bookkeeping"),
            harness_state: SlotState::LocalDefault,
            harness_provider: "pi",
            harness_consent_scope: Some("kairos-elo-bookkeeping"),
            local_privacy_implication: "kairos and Elo bookkeeping context",
        },
        SlotDefinition {
            name: "aletheia.agora",
            model_state: SlotState::LocalDefault,
            model_provider: "ollama",
            model: "gemma3:e4b",
            model_consent_scope: Some("skill-index"),
            harness_state: SlotState::LocalDefault,
            harness_provider: "pi",
            harness_consent_scope: Some("skill-index"),
            local_privacy_implication: "skill-index context",
        },
        SlotDefinition {
            name: "aletheia.zeithoven",
            model_state: SlotState::CloudOptIn,
            model_provider: "anthropic",
            model: "claude-opus-4-7",
            model_consent_scope: Some("skill-design-no-user-content"),
            harness_state: SlotState::CloudOptIn,
            harness_provider: "claude",
            harness_consent_scope: Some("skill-design-no-user-content"),
            local_privacy_implication: "skill-design context",
        },
    ]
}

fn format_slot_list(rows: &[SlotListRow]) -> String {
    let mut out = String::from(
        "slot\tmodel_state\tmodel\tmodel_provider\tharness_state\tharness_provider\tverifier\n",
    );
    for row in rows {
        out.push_str(&format!(
            "{}\t{}\t{}\t{}\t{}\t{}\t{}\n",
            row.name,
            row.model_state,
            row.model.as_deref().unwrap_or("-"),
            row.model_provider.as_deref().unwrap_or("-"),
            row.harness_state,
            row.harness_provider.as_deref().unwrap_or("-"),
            row.verifier_status
        ));
    }
    out
}

fn format_slot_composition(composition: &SlotComposition) -> String {
    format!(
        "slot: {}\nmodel: {} {} {}\nharness: {} {}\nverifier: {}\nfallback_action: {}",
        composition.slot_name,
        composition.model.state,
        composition.model.provider.as_deref().unwrap_or("-"),
        composition.model.model.as_deref().unwrap_or("-"),
        composition.harness.state,
        composition.harness.provider.as_deref().unwrap_or("-"),
        composition.verifier_status,
        composition.fallback_action
    )
}

fn format_slot_test(report: &SlotTestReport) -> String {
    let mut out = format!(
        "slot: {}\nreachable: {}\nmodel_reachable: {}\nharness_reachable: {}\nverifier: {}\nfallback_action: {}\n",
        report.slot_name,
        report.reachable,
        report.model_reachable,
        report.harness_reachable,
        report.verifier_status,
        report.fallback_action
    );
    for diagnostic in &report.diagnostics {
        out.push_str("- ");
        out.push_str(diagnostic);
        out.push('\n');
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::{SystemTime, UNIX_EPOCH};

    #[test]
    fn slot_list_round_trip() {
        let path = temp_config_path("slot-list-round-trip");
        let model_args = ModelSetArgs {
            name: "gnostic_extractor".to_owned(),
            state: SlotState::LocalDefault,
            provider: "ollama".to_owned(),
            model: "gemma3:e4b".to_owned(),
            confirm: None,
        };
        set_model_slot(&path, &model_args, true).expect("model slot writes");

        let harness_args = HarnessSetArgs {
            name: "gnostic_extractor".to_owned(),
            state: SlotState::LocalDefault,
            provider: "pi".to_owned(),
            confirm: None,
        };
        set_harness_slot(&path, &harness_args, true).expect("harness slot writes");

        let config = SlotConfig::load(&path).expect("config loads");
        let rows = list_slots(&config).expect("slot list resolves");
        let gnostic = rows
            .iter()
            .find(|row| row.name == "gnostic_extractor")
            .expect("gnostic_extractor listed");

        assert_eq!(gnostic.model_state, SlotState::LocalDefault);
        assert_eq!(gnostic.model.as_deref(), Some("gemma3:e4b"));
        assert_eq!(gnostic.model_provider.as_deref(), Some("ollama"));
        assert_eq!(gnostic.harness_state, SlotState::LocalDefault);
        assert_eq!(gnostic.harness_provider.as_deref(), Some("pi"));

        let rendered = fs::read_to_string(path).expect("config was written");
        assert!(rendered.contains("[slot.gnostic_extractor]"));
        assert!(rendered.contains("[harness.gnostic_extractor]"));
        assert!(rendered.contains("model = \"gemma3:e4b\""));
    }

    #[test]
    fn cloud_opt_in_gate_fires_for_local_default_slot() {
        let path = temp_config_path("cloud-opt-in-gate");
        let args = ModelSetArgs {
            name: "nara_parser".to_owned(),
            state: SlotState::CloudOptIn,
            provider: "anthropic".to_owned(),
            model: "claude-opus-4-7".to_owned(),
            confirm: None,
        };

        let err =
            set_model_slot(&path, &args, false).expect_err("gate refuses missing confirmation");
        assert!(err.contains("journal entries and dream content"));
        assert!(err.contains("--confirm"));

        let confirmed = ModelSetArgs {
            confirm: Some(CLOUD_CONFIRMATION.to_owned()),
            ..args
        };
        set_model_slot(&path, &confirmed, false).expect("confirmed opt-in writes");
    }

    #[test]
    fn harness_model_privacy_mismatch_blocks_resolve() {
        let path = temp_config_path("harness-model-privacy-mismatch");
        set_model_slot(
            &path,
            &ModelSetArgs {
                name: "nara_parser".to_owned(),
                state: SlotState::LocalDefault,
                provider: "ollama".to_owned(),
                model: "gemma3:12b-q4_K_M".to_owned(),
                confirm: None,
            },
            true,
        )
        .expect("local model writes");
        set_harness_slot(
            &path,
            &HarnessSetArgs {
                name: "nara_parser".to_owned(),
                state: SlotState::CloudOptIn,
                provider: "claude".to_owned(),
                confirm: Some(CLOUD_CONFIRMATION.to_owned()),
            },
            true,
        )
        .expect("cloud harness writes after confirmation");

        let config = SlotConfig::load(&path).expect("config loads");
        let err = resolve_composition(&config, "nara_parser", &DispatchContext::default())
            .expect_err("local model plus cloud harness is refused");
        assert!(err.contains(PRIVACY_MISMATCH_VIOLATION));
    }

    fn temp_config_path(label: &str) -> PathBuf {
        let stamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("system time")
            .as_nanos();
        std::env::temp_dir().join(format!(
            "epi-slot-{label}-{}-{stamp}.toml",
            std::process::id()
        ))
    }
}
