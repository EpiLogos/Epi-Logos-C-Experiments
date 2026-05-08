use serde::Deserialize;
use std::collections::BTreeMap;
use std::path::{Path, PathBuf};

use crate::gate::parity::{coordinate_parity_records, CoordinateParityStatus};
use crate::portal::registry::PORTAL_PLUGIN_TYPE_IDS;
use crate::portal::topology::{slash_command_surfaces, PortalActionKind};
use epi_s3_gateway_contract::gateway_session_operation_contracts;
use serde_json::Value;

#[derive(Clone, Debug, Eq, PartialEq)]
pub enum PortalSurfaceKind {
    CliCommand,
    GatewayMethod,
    ConfigField,
    ExtensionTool,
    PortalPlugin,
    PluginPackage,
    AgentContract,
    CapabilityGate,
    ReadinessCheck,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub enum PortalSurfaceSource {
    Topology,
    GatewayParity,
    GatewaySessionContract,
    ExtensionManifest,
    PortalRegistry,
    PluginManifest,
    AgentContract,
    CapabilityMatrix,
    ReadinessManifest,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PortalSurfaceAction {
    pub id: String,
    pub label: String,
    pub kind: PortalActionKind,
    pub command: Vec<String>,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PortalSurfaceConfigField {
    pub key: String,
    pub label: String,
    pub coordinate: String,
    pub editable: bool,
    pub apply_command: Vec<String>,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PortalSurface {
    pub id: String,
    pub coordinate: String,
    pub kind: PortalSurfaceKind,
    pub label: String,
    pub command_hint: String,
    pub proves_raw_service_health: bool,
    pub proves_agent_access_separately: bool,
    pub config_fields: Vec<PortalSurfaceConfigField>,
    pub actions: Vec<PortalSurfaceAction>,
    pub source: PortalSurfaceSource,
    pub metadata: Vec<String>,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub enum PortalReadinessBucket {
    RawService,
    AgentAccess,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PortalReadinessResult {
    pub id: String,
    pub coordinate: String,
    pub label: String,
    pub bucket: PortalReadinessBucket,
    pub ok: Option<bool>,
    pub status: String,
    pub detail: String,
    pub command_hint: String,
}

#[derive(Clone, Debug, Eq, PartialEq, Default)]
pub struct PortalReadinessReport {
    pub raw_service_results: Vec<PortalReadinessResult>,
    pub agent_access_results: Vec<PortalReadinessResult>,
}

pub trait PortalSurfaceProvider {
    fn surfaces(&self) -> Vec<PortalSurface>;
}

pub struct SurfaceRegistry {
    providers: Vec<Box<dyn PortalSurfaceProvider>>,
}

impl SurfaceRegistry {
    pub fn from_providers(providers: Vec<Box<dyn PortalSurfaceProvider>>) -> Self {
        Self { providers }
    }

    pub fn surfaces(&self) -> Vec<PortalSurface> {
        let mut surfaces: Vec<PortalSurface> = self
            .providers
            .iter()
            .flat_map(|provider| provider.surfaces())
            .collect();
        surfaces.sort_by(|left, right| {
            left.coordinate
                .cmp(&right.coordinate)
                .then_with(|| left.id.cmp(&right.id))
        });
        surfaces
    }
}

pub struct TopologyProvider;

impl PortalSurfaceProvider for TopologyProvider {
    fn surfaces(&self) -> Vec<PortalSurface> {
        slash_command_surfaces()
            .into_iter()
            .map(|surface| PortalSurface {
                id: format!("topology.{}", surface.id),
                coordinate: surface.coordinate.to_string(),
                kind: PortalSurfaceKind::CliCommand,
                label: surface.label.to_string(),
                command_hint: surface.command_hint.to_string(),
                proves_raw_service_health: surface.proves_raw_service_health,
                proves_agent_access_separately: surface.proves_agent_access_separately,
                config_fields: surface
                    .config_fields
                    .iter()
                    .map(|field| PortalSurfaceConfigField {
                        key: field.key.to_string(),
                        label: field.label.to_string(),
                        coordinate: field.coordinate.to_string(),
                        editable: field.editable,
                        apply_command: field
                            .apply_command
                            .map(command_vec)
                            .unwrap_or_else(Vec::new),
                    })
                    .collect(),
                actions: surface
                    .actions
                    .iter()
                    .map(|action| PortalSurfaceAction {
                        id: action.id.to_string(),
                        label: action.label.to_string(),
                        kind: action.kind,
                        command: action.command.map(command_vec).unwrap_or_else(Vec::new),
                    })
                    .collect(),
                source: PortalSurfaceSource::Topology,
                metadata: vec!["topology seed".to_string()],
            })
            .collect()
    }
}

pub struct GatewayParityProvider;

impl PortalSurfaceProvider for GatewayParityProvider {
    fn surfaces(&self) -> Vec<PortalSurface> {
        coordinate_parity_records()
            .iter()
            .map(|record| {
                let representative_method = representative_gateway_method(
                    record.canonical_method,
                    record.live_gateway_method,
                );
                let command = representative_method
                    .as_ref()
                    .map(|method| {
                        vec![
                            "epi".to_string(),
                            "gate".to_string(),
                            "rpc".to_string(),
                            method.clone(),
                        ]
                    })
                    .or_else(|| record.cli_mirror.map(split_command))
                    .unwrap_or_default();
                let status = format!("{:?}", record.status);

                PortalSurface {
                    id: format!("gateway.{}", record.canonical_method),
                    coordinate: coordinate_for(record.canonical_method, record.owner),
                    kind: PortalSurfaceKind::GatewayMethod,
                    label: format!("{} ({})", record.canonical_method, status),
                    command_hint: record
                        .live_gateway_method
                        .or(record.cli_mirror)
                        .unwrap_or(record.canonical_method)
                        .to_string(),
                    proves_raw_service_health: record.status != CoordinateParityStatus::Missing,
                    proves_agent_access_separately: is_agent_access_record(record.canonical_method),
                    config_fields: Vec::new(),
                    actions: vec![PortalSurfaceAction {
                        id: format!("gateway.{}.inspect", record.canonical_method),
                        label: "Inspect / invoke method".to_string(),
                        kind: PortalActionKind::Inspect,
                        command,
                    }],
                    source: PortalSurfaceSource::GatewayParity,
                    metadata: vec![
                        format!("owner: {}", record.owner),
                        format!("body: {}", record.body_path),
                        format!("tests: {}", record.test_evidence.join(", ")),
                    ],
                }
            })
            .collect()
    }
}

pub struct SessionOperationsProvider;

impl PortalSurfaceProvider for SessionOperationsProvider {
    fn surfaces(&self) -> Vec<PortalSurface> {
        gateway_session_operation_contracts()
            .iter()
            .map(|contract| PortalSurface {
                id: format!("session-op.{}", contract.operation_id),
                coordinate: contract.coordinate_owner.to_string(),
                kind: PortalSurfaceKind::GatewayMethod,
                label: format!("{} session operation", contract.operation_id),
                command_hint: contract.gateway_method.to_string(),
                proves_raw_service_health: true,
                proves_agent_access_separately: true,
                config_fields: Vec::new(),
                actions: vec![PortalSurfaceAction {
                    id: format!("session-op.{}.invoke", contract.operation_id),
                    label: "Invoke session operation".to_string(),
                    kind: PortalActionKind::RunCommand,
                    command: vec![
                        "epi".to_string(),
                        "gate".to_string(),
                        "rpc".to_string(),
                        contract.gateway_method.to_string(),
                    ],
                }],
                source: PortalSurfaceSource::GatewaySessionContract,
                metadata: vec![
                    format!("gateway_method: {}", contract.gateway_method),
                    format!("agent_access_owner: {}", contract.agent_access_owner),
                    format!("projection: {}", contract.projection_table),
                    format!("request: {}", contract.request_keys.join(", ")),
                    format!("response: {}", contract.response_keys.join(", ")),
                ],
            })
            .collect()
    }
}

pub struct ReadinessProvider;

impl PortalSurfaceProvider for ReadinessProvider {
    fn surfaces(&self) -> Vec<PortalSurface> {
        readiness_specs()
            .iter()
            .map(|spec| PortalSurface {
                id: format!("readiness.{}", spec.id),
                coordinate: spec.coordinate.to_string(),
                kind: PortalSurfaceKind::ReadinessCheck,
                label: spec.label.to_string(),
                command_hint: spec.command.join(" "),
                proves_raw_service_health: spec.proves_raw_service_health,
                proves_agent_access_separately: spec.proves_agent_access_separately,
                config_fields: Vec::new(),
                actions: vec![PortalSurfaceAction {
                    id: format!("readiness.{}.verify", spec.id),
                    label: "Verify readiness".to_string(),
                    kind: PortalActionKind::Verify,
                    command: spec
                        .command
                        .iter()
                        .map(|part| (*part).to_string())
                        .collect(),
                }],
                source: PortalSurfaceSource::ReadinessManifest,
                metadata: vec![
                    format!("readiness_layer: {}", spec.layer),
                    format!("proof_kind: {}", spec.proof_kind),
                ],
            })
            .collect()
    }
}

#[derive(Clone, Debug)]
pub struct ExtensionToolsProvider {
    coordinate: String,
    label: String,
    manifest_path: PathBuf,
}

impl ExtensionToolsProvider {
    pub fn from_manifest(
        coordinate: impl Into<String>,
        label: impl Into<String>,
        manifest_path: impl AsRef<Path>,
    ) -> Self {
        Self {
            coordinate: coordinate.into(),
            label: label.into(),
            manifest_path: manifest_path.as_ref().to_path_buf(),
        }
    }
}

impl PortalSurfaceProvider for ExtensionToolsProvider {
    fn surfaces(&self) -> Vec<PortalSurface> {
        let Ok(contents) = std::fs::read_to_string(&self.manifest_path) else {
            return Vec::new();
        };
        let Ok(manifest) = serde_json::from_str::<ToolsManifest>(&contents) else {
            return Vec::new();
        };

        manifest
            .tools
            .into_iter()
            .map(|tool| PortalSurface {
                id: format!("extension.{}", tool.name),
                coordinate: self.coordinate.clone(),
                kind: PortalSurfaceKind::ExtensionTool,
                label: format!("{} / {}", self.label, tool.name),
                command_hint: tool.command.clone(),
                proves_raw_service_health: false,
                proves_agent_access_separately: true,
                config_fields: Vec::new(),
                actions: vec![PortalSurfaceAction {
                    id: format!("extension.{}.run", tool.name),
                    label: "Run tool command".to_string(),
                    kind: PortalActionKind::RunCommand,
                    command: split_command(&tool.command),
                }],
                source: PortalSurfaceSource::ExtensionManifest,
                metadata: vec![self.manifest_path.display().to_string()],
            })
            .collect()
    }
}

#[derive(Clone, Debug)]
pub struct PortalRegistryProvider {
    registered_types: Vec<String>,
}

impl PortalRegistryProvider {
    pub fn from_registered_types<I, S>(registered_types: I) -> Self
    where
        I: IntoIterator<Item = S>,
        S: Into<String>,
    {
        Self {
            registered_types: registered_types.into_iter().map(Into::into).collect(),
        }
    }
}

#[derive(Clone, Debug)]
pub struct PluginManifestProvider {
    coordinate: String,
    manifest_path: PathBuf,
}

impl PluginManifestProvider {
    pub fn from_manifest(coordinate: impl Into<String>, manifest_path: impl AsRef<Path>) -> Self {
        Self {
            coordinate: coordinate.into(),
            manifest_path: manifest_path.as_ref().to_path_buf(),
        }
    }
}

impl PortalSurfaceProvider for PluginManifestProvider {
    fn surfaces(&self) -> Vec<PortalSurface> {
        let Ok(contents) = std::fs::read_to_string(&self.manifest_path) else {
            return Vec::new();
        };
        let Ok(manifest) = serde_json::from_str::<PluginManifest>(&contents) else {
            return Vec::new();
        };

        vec![PortalSurface {
            id: format!("package.{}", manifest.name),
            coordinate: self.coordinate.clone(),
            kind: PortalSurfaceKind::PluginPackage,
            label: manifest
                .description
                .clone()
                .unwrap_or_else(|| format!("Plugin package {}", manifest.name)),
            command_hint: format!("epi agent plugin inspect {}", manifest.name),
            proves_raw_service_health: false,
            proves_agent_access_separately: true,
            config_fields: Vec::new(),
            actions: vec![PortalSurfaceAction {
                id: format!("package.{}.inspect", manifest.name),
                label: "Inspect package manifest".to_string(),
                kind: PortalActionKind::Inspect,
                command: vec![
                    "epi".to_string(),
                    "agent".to_string(),
                    "plugin".to_string(),
                    "inspect".to_string(),
                    manifest.name,
                ],
            }],
            source: PortalSurfaceSource::PluginManifest,
            metadata: vec![self.manifest_path.display().to_string()],
        }]
    }
}

#[derive(Clone, Debug)]
pub struct AgentContractProvider {
    manifest_path: PathBuf,
}

impl AgentContractProvider {
    pub fn from_manifest(manifest_path: impl AsRef<Path>) -> Self {
        Self {
            manifest_path: manifest_path.as_ref().to_path_buf(),
        }
    }
}

impl PortalSurfaceProvider for AgentContractProvider {
    fn surfaces(&self) -> Vec<PortalSurface> {
        let Ok(contents) = std::fs::read_to_string(&self.manifest_path) else {
            return Vec::new();
        };
        let Ok(contract) = serde_json::from_str::<AgentContractManifest>(&contents) else {
            return Vec::new();
        };

        contract
            .gateway_methods
            .into_iter()
            .map(|method| PortalSurface {
                id: format!("agent.{}.{}", contract.agent_id, method),
                coordinate: coordinate_for(&method, &contract.coordinate),
                kind: PortalSurfaceKind::AgentContract,
                label: format!("{} method {}", contract.agent_id, method),
                command_hint: format!("epi gate rpc {method}"),
                proves_raw_service_health: true,
                proves_agent_access_separately: true,
                config_fields: Vec::new(),
                actions: vec![PortalSurfaceAction {
                    id: format!("agent.{}.{}.invoke", contract.agent_id, method),
                    label: "Invoke agent method".to_string(),
                    kind: PortalActionKind::RunCommand,
                    command: vec![
                        "epi".to_string(),
                        "gate".to_string(),
                        "rpc".to_string(),
                        method,
                    ],
                }],
                source: PortalSurfaceSource::AgentContract,
                metadata: vec![
                    format!("agent_kind: {}", contract.agent_kind),
                    format!("resource_package: {}", contract.resource_package),
                    self.manifest_path.display().to_string(),
                ],
            })
            .collect()
    }
}

#[derive(Clone, Debug)]
pub struct CapabilityMatrixProvider {
    manifest_path: PathBuf,
}

impl CapabilityMatrixProvider {
    pub fn from_manifest(manifest_path: impl AsRef<Path>) -> Self {
        Self {
            manifest_path: manifest_path.as_ref().to_path_buf(),
        }
    }
}

impl PortalSurfaceProvider for CapabilityMatrixProvider {
    fn surfaces(&self) -> Vec<PortalSurface> {
        let Ok(contents) = std::fs::read_to_string(&self.manifest_path) else {
            return Vec::new();
        };
        let Ok(matrix) = serde_json::from_str::<CapabilityMatrixManifest>(&contents) else {
            return Vec::new();
        };

        matrix
            .agent_capability_gates
            .into_iter()
            .flat_map(|(agent, gate)| {
                let manifest_path = self.manifest_path.display().to_string();
                let package_role = matrix.package_role.clone();
                let skills = gate.skills.join(", ");
                gate.tools.into_iter().map(move |tool| PortalSurface {
                    id: format!("capability.{agent}.{tool}"),
                    coordinate: "S4'".to_string(),
                    kind: PortalSurfaceKind::CapabilityGate,
                    label: format!("{agent} tool gate: {tool}"),
                    command_hint: tool.clone(),
                    proves_raw_service_health: false,
                    proves_agent_access_separately: true,
                    config_fields: Vec::new(),
                    actions: vec![PortalSurfaceAction {
                        id: format!("capability.{agent}.{tool}.inspect"),
                        label: "Inspect capability gate".to_string(),
                        kind: PortalActionKind::Inspect,
                        command: Vec::new(),
                    }],
                    source: PortalSurfaceSource::CapabilityMatrix,
                    metadata: vec![
                        format!("package_role: {package_role}"),
                        format!("skills: {skills}"),
                        manifest_path.clone(),
                    ],
                })
            })
            .collect()
    }
}

impl PortalSurfaceProvider for PortalRegistryProvider {
    fn surfaces(&self) -> Vec<PortalSurface> {
        self.registered_types
            .iter()
            .map(|plugin_id| PortalSurface {
                id: format!("plugin.{plugin_id}"),
                coordinate: plugin_coordinate(plugin_id),
                kind: PortalSurfaceKind::PortalPlugin,
                label: format!("TUI plugin {plugin_id}"),
                command_hint: format!("epi portal --plugin {plugin_id}"),
                proves_raw_service_health: false,
                proves_agent_access_separately: plugin_id.starts_with("s0."),
                config_fields: Vec::new(),
                actions: vec![PortalSurfaceAction {
                    id: format!("plugin.{plugin_id}.inspect"),
                    label: "Inspect plugin".to_string(),
                    kind: PortalActionKind::Inspect,
                    command: vec![
                        "epi".to_string(),
                        "portal".to_string(),
                        "--plugin".to_string(),
                        plugin_id.clone(),
                    ],
                }],
                source: PortalSurfaceSource::PortalRegistry,
                metadata: vec!["ratatui hypertile registry".to_string()],
            })
            .collect()
    }
}

pub fn portal_surfaces() -> Vec<PortalSurface> {
    default_surface_registry().surfaces()
}

pub fn default_surface_registry() -> SurfaceRegistry {
    let root = workspace_root();
    SurfaceRegistry::from_providers(vec![
        Box::new(TopologyProvider),
        Box::new(ReadinessProvider),
        Box::new(GatewayParityProvider),
        Box::new(SessionOperationsProvider),
        Box::new(ExtensionToolsProvider::from_manifest(
            "S0'",
            "Khora CLI tools",
            root.join("Body/S/S4/ta-onta/S4-0p-khora/S0/tools.json"),
        )),
        Box::new(ExtensionToolsProvider::from_manifest(
            "S1'",
            "Hen tools",
            root.join("Body/S/S4/ta-onta/S4-1p-hen/S1/tools.json"),
        )),
        Box::new(ExtensionToolsProvider::from_manifest(
            "S5'",
            "Aletheia tools",
            root.join("Body/S/S4/ta-onta/S4-5p-aletheia/S5/tools.json"),
        )),
        Box::new(PluginManifestProvider::from_manifest(
            "S4'",
            root.join("Body/S/S4/plugins/pleroma/.claude-plugin/plugin.json"),
        )),
        Box::new(PluginManifestProvider::from_manifest(
            "S5'",
            root.join("Body/S/S5/plugins/epi-logos/.claude-plugin/plugin.json"),
        )),
        Box::new(AgentContractProvider::from_manifest(
            root.join("Body/S/S5/epii-agent/agent-contract.json"),
        )),
        Box::new(CapabilityMatrixProvider::from_manifest(
            root.join("Body/S/S4/plugins/pleroma/capability-matrix.json"),
        )),
        Box::new(PortalRegistryProvider::from_registered_types(
            PORTAL_PLUGIN_TYPE_IDS.iter().copied(),
        )),
    ])
}

struct ReadinessSpec {
    id: &'static str,
    coordinate: &'static str,
    label: &'static str,
    layer: &'static str,
    proof_kind: &'static str,
    command: &'static [&'static str],
    proves_raw_service_health: bool,
    proves_agent_access_separately: bool,
}

fn readiness_specs() -> &'static [ReadinessSpec] {
    &[
        ReadinessSpec {
            id: "s2.neo4j",
            coordinate: "S2",
            label: "Neo4j graph substrate",
            layer: "raw service",
            proof_kind: "connectivity/schema",
            command: &["epi", "graph", "doctor"],
            proves_raw_service_health: true,
            proves_agent_access_separately: false,
        },
        ReadinessSpec {
            id: "s2.redis-cache",
            coordinate: "S2",
            label: "Redis graph semantic cache",
            layer: "raw service",
            proof_kind: "cache/index",
            command: &["epi", "graph", "redis", "status"],
            proves_raw_service_health: true,
            proves_agent_access_separately: false,
        },
        ReadinessSpec {
            id: "s3.gateway",
            coordinate: "S3",
            label: "Gateway control plane",
            layer: "raw service",
            proof_kind: "gateway/process",
            command: &["epi", "gate", "status"],
            proves_raw_service_health: true,
            proves_agent_access_separately: false,
        },
        ReadinessSpec {
            id: "s3.spacetimedb-registration",
            coordinate: "S3'",
            label: "SpaceTimeDB registration plane",
            layer: "live projection",
            proof_kind: "gateway/agent/client registration",
            command: &["epi", "gate", "rpc", "health.snapshot"],
            proves_raw_service_health: true,
            proves_agent_access_separately: false,
        },
        ReadinessSpec {
            id: "s3.spacetimedb-subscription",
            coordinate: "S3'",
            label: "SpaceTimeDB projection subscription",
            layer: "live projection",
            proof_kind: "TUI/desktop subscription readiness",
            command: &["epi", "gate", "rpc", "health.snapshot"],
            proves_raw_service_health: false,
            proves_agent_access_separately: true,
        },
        ReadinessSpec {
            id: "s3.graphiti-runtime",
            coordinate: "S3'",
            label: "Graphiti temporal runtime",
            layer: "runtime adapter",
            proof_kind: "temporal episodic architecture",
            command: &["epi", "gate", "temporal", "context"],
            proves_raw_service_health: true,
            proves_agent_access_separately: false,
        },
        ReadinessSpec {
            id: "s4.pi-agent-access",
            coordinate: "S4",
            label: "PI agent invocation access",
            layer: "agent access",
            proof_kind: "runtime/plugin/capability",
            command: &["epi", "agent", "status"],
            proves_raw_service_health: false,
            proves_agent_access_separately: true,
        },
        ReadinessSpec {
            id: "s5.gnosis-world-return",
            coordinate: "S5",
            label: "Gnosis world-return service",
            layer: "world return",
            proof_kind: "query/source disclosure",
            command: &["epi", "techne", "gnosis", "status"],
            proves_raw_service_health: true,
            proves_agent_access_separately: false,
        },
        ReadinessSpec {
            id: "s5.epii-review-autoresearch",
            coordinate: "S5'",
            label: "Epii review and autoresearch access",
            layer: "agent access",
            proof_kind: "review/autoresearch",
            command: &["epi", "gate", "rpc", "s5'.epii.status"],
            proves_raw_service_health: false,
            proves_agent_access_separately: true,
        },
    ]
}

#[derive(Deserialize)]
struct ToolsManifest {
    tools: Vec<ToolEntry>,
}

#[derive(Deserialize)]
struct ToolEntry {
    name: String,
    command: String,
}

#[derive(Deserialize)]
struct PluginManifest {
    name: String,
    description: Option<String>,
}

#[derive(Deserialize)]
struct AgentContractManifest {
    agent_id: String,
    coordinate: String,
    agent_kind: String,
    resource_package: String,
    gateway_methods: Vec<String>,
}

#[derive(Deserialize)]
struct CapabilityMatrixManifest {
    package_role: String,
    agent_capability_gates: BTreeMap<String, CapabilityGateManifest>,
}

#[derive(Deserialize)]
struct CapabilityGateManifest {
    tools: Vec<String>,
    #[serde(default)]
    skills: Vec<String>,
}

fn command_vec(command: &[&str]) -> Vec<String> {
    command.iter().map(|part| (*part).to_string()).collect()
}

fn split_command(command: &str) -> Vec<String> {
    command
        .split_whitespace()
        .map(|part| part.to_string())
        .collect()
}

fn representative_gateway_method(
    canonical_method: &str,
    live_gateway_method: Option<&str>,
) -> Option<String> {
    let live = live_gateway_method?;
    let methods: Vec<&str> = live
        .split('/')
        .map(str::trim)
        .filter(|method| !method.is_empty())
        .collect();
    let prefix = canonical_method.trim_end_matches('*');

    methods
        .iter()
        .copied()
        .find(|method| method.ends_with(".status"))
        .or_else(|| {
            methods
                .iter()
                .copied()
                .find(|method| method.starts_with(prefix) && !method.ends_with(".*"))
        })
        .or_else(|| methods.first().copied())
        .map(|method| method.to_string())
}

fn coordinate_for(canonical_method: &str, owner: &str) -> String {
    if let Some(prefix) = canonical_method.split('.').next() {
        if let Some(coord) = s_coordinate_from_prefix(prefix) {
            return coord.to_string();
        }
    }

    owner
        .split(|ch: char| ch.is_whitespace() || ch == '/')
        .find_map(|part| {
            let trimmed = part.trim_matches(|ch: char| !ch.is_ascii_alphanumeric() && ch != '\'');
            s_coordinate_from_prefix(trimmed)
        })
        .unwrap_or("S0")
        .to_string()
}

fn s_coordinate_from_prefix(prefix: &str) -> Option<&'static str> {
    match prefix {
        "s0" | "S0" => Some("S0"),
        "s0'" | "S0'" => Some("S0'"),
        "s1" | "S1" => Some("S1"),
        "s1'" | "S1'" => Some("S1'"),
        "s2" | "S2" => Some("S2"),
        "s2'" | "S2'" => Some("S2'"),
        "s3" | "S3" => Some("S3"),
        "s3'" | "S3'" => Some("S3'"),
        "s4" | "S4" => Some("S4"),
        "s4'" | "S4'" => Some("S4'"),
        "s5" | "S5" => Some("S5"),
        "s5'" | "S5'" => Some("S5'"),
        _ => None,
    }
}

pub fn readiness_report_from_health_and_agent_status(
    health: &Value,
    agent_status: Option<&Value>,
) -> PortalReadinessReport {
    let readiness_surfaces = ReadinessProvider.surfaces();
    let mut report = PortalReadinessReport::default();

    for surface in readiness_surfaces {
        let result = readiness_result_for_surface(&surface, health, agent_status);
        if result.bucket == PortalReadinessBucket::RawService {
            report.raw_service_results.push(result);
        } else {
            report.agent_access_results.push(result);
        }
    }

    report
}

fn readiness_result_for_surface(
    surface: &PortalSurface,
    health: &Value,
    agent_status: Option<&Value>,
) -> PortalReadinessResult {
    let (ok, status, detail) = match surface.id.as_str() {
        "readiness.s2.neo4j" => readiness_from_path(
            health,
            &["checks", "graph", "report", "neo4j"],
            "Neo4j graph substrate",
        )
        .or_else_unknown(|| {
            readiness_from_path(health, &["checks", "graph"], "Neo4j graph substrate")
        }),
        "readiness.s2.redis-cache" => readiness_from_path(
            health,
            &["checks", "graph", "report", "redis"],
            "Redis semantic cache",
        )
        .or_else_unknown(|| {
            readiness_from_path(
                health,
                &["checks", "graph", "report", "semantic_cache"],
                "Redis semantic cache",
            )
        }),
        "readiness.s3.gateway" => {
            let ok = health.get("checks").is_some() || health.get("ok").is_some();
            (
                Some(ok),
                if ok { "ready" } else { "unknown" }.to_string(),
                if ok {
                    "gateway health snapshot available".to_string()
                } else {
                    "gateway health snapshot unavailable".to_string()
                },
            )
        }
        "readiness.s3.spacetimedb-registration" => readiness_from_path(
            health,
            &["checks", "spacetimedb"],
            "SpaceTimeDB registration",
        ),
        "readiness.s3.spacetimedb-subscription" => spacetimedb_subscription_result(health),
        "readiness.s3.graphiti-runtime" => graphiti_runtime_result(agent_status),
        "readiness.s4.pi-agent-access" => {
            let ok = agent_status
                .and_then(|value| value.get("agent_id"))
                .and_then(Value::as_str)
                .is_some();
            (
                Some(ok),
                if ok { "ready" } else { "unavailable" }.to_string(),
                agent_status
                    .and_then(|value| value.get("agent_id"))
                    .and_then(Value::as_str)
                    .map(|agent| format!("agent access status visible through {agent}"))
                    .unwrap_or_else(|| "agent access status not loaded".to_string()),
            )
        }
        "readiness.s5.gnosis-world-return" => world_return_result(agent_status, "gnosis"),
        "readiness.s5.epii-review-autoresearch" => epii_review_autoresearch_result(agent_status),
        _ => (
            None,
            "unknown".to_string(),
            "no readiness mapping for surface".to_string(),
        ),
    };

    PortalReadinessResult {
        id: surface.id.clone(),
        coordinate: surface.coordinate.clone(),
        label: surface.label.clone(),
        bucket: if surface.proves_raw_service_health {
            PortalReadinessBucket::RawService
        } else {
            PortalReadinessBucket::AgentAccess
        },
        ok,
        status,
        detail,
        command_hint: surface.command_hint.clone(),
    }
}

fn readiness_from_path(
    health: &Value,
    path: &[&str],
    label: &str,
) -> (Option<bool>, String, String) {
    let Some(value) = value_at_path(health, path) else {
        return (
            None,
            "unknown".to_string(),
            format!("{label} health not present in snapshot"),
        );
    };
    let ok = value.get("ok").and_then(Value::as_bool).unwrap_or(false);
    let status = if ok { "ready" } else { "degraded" }.to_string();
    let detail = value
        .get("reason")
        .or_else(|| value.get("error"))
        .or_else(|| value.get("rawServiceHealth"))
        .and_then(Value::as_str)
        .map(ToOwned::to_owned)
        .unwrap_or_else(|| format!("{label} ok={ok}"));
    (Some(ok), status, detail)
}

trait ReadinessFallback {
    fn or_else_unknown(
        self,
        fallback: impl FnOnce() -> (Option<bool>, String, String),
    ) -> (Option<bool>, String, String);
}

impl ReadinessFallback for (Option<bool>, String, String) {
    fn or_else_unknown(
        self,
        fallback: impl FnOnce() -> (Option<bool>, String, String),
    ) -> (Option<bool>, String, String) {
        if self.0.is_some() {
            self
        } else {
            fallback()
        }
    }
}

fn spacetimedb_subscription_result(health: &Value) -> (Option<bool>, String, String) {
    let spacetime = value_at_path(health, &["checks", "spacetimedb"]);
    let mode = spacetime
        .and_then(|value| value.get("subscriptionMode"))
        .and_then(Value::as_str)
        .unwrap_or("disabled");
    let detail = spacetime
        .and_then(|value| value.get("subscriptionReadiness"))
        .and_then(Value::as_str)
        .unwrap_or("SpaceTimeDB subscription readiness not present")
        .to_string();

    if mode == "native-websocket" {
        (Some(true), "ready".to_string(), detail)
    } else if mode == "http-sql-poll" {
        (Some(false), "transitional".to_string(), detail)
    } else {
        (Some(false), "disabled".to_string(), detail)
    }
}

fn graphiti_runtime_result(agent_status: Option<&Value>) -> (Option<bool>, String, String) {
    let graphiti = agent_status
        .and_then(|value| value.get("world_return"))
        .and_then(|value| value.get("graphiti"));
    let Some(graphiti) = graphiti else {
        return (
            None,
            "unknown".to_string(),
            "Graphiti runtime status not loaded".to_string(),
        );
    };
    let running = graphiti
        .get("running")
        .and_then(Value::as_bool)
        .unwrap_or(false);
    let detail = graphiti
        .get("url")
        .and_then(Value::as_str)
        .map(|url| format!("Graphiti runtime running={running} at {url}"))
        .unwrap_or_else(|| format!("Graphiti runtime running={running}"));
    (
        Some(running),
        if running { "ready" } else { "offline" }.to_string(),
        detail,
    )
}

fn world_return_result(agent_status: Option<&Value>, key: &str) -> (Option<bool>, String, String) {
    let world = agent_status
        .and_then(|value| value.get("world_return"))
        .and_then(|value| value.get(key));
    let Some(world) = world else {
        return (
            None,
            "unknown".to_string(),
            format!("{key} world-return status not loaded"),
        );
    };
    let ok = world
        .get("available")
        .and_then(Value::as_bool)
        .unwrap_or(false);
    (
        Some(ok),
        if ok { "ready" } else { "unavailable" }.to_string(),
        format!("{key} available={ok}"),
    )
}

fn epii_review_autoresearch_result(agent_status: Option<&Value>) -> (Option<bool>, String, String) {
    let Some(agent_status) = agent_status else {
        return (
            None,
            "unknown".to_string(),
            "Epii review/autoresearch status not loaded".to_string(),
        );
    };
    let review_open = agent_status
        .pointer("/review/open_count")
        .and_then(Value::as_u64)
        .unwrap_or(0);
    let active = agent_status
        .pointer("/improvement/active_count")
        .and_then(Value::as_u64)
        .unwrap_or(0);
    (
        Some(true),
        "ready".to_string(),
        format!("review open={review_open}; autoresearch active={active}"),
    )
}

fn value_at_path<'a>(value: &'a Value, path: &[&str]) -> Option<&'a Value> {
    let mut cursor = value;
    for key in path {
        cursor = cursor.get(*key)?;
    }
    Some(cursor)
}

fn is_agent_access_record(canonical_method: &str) -> bool {
    canonical_method.starts_with("s4")
        || canonical_method.starts_with("s5'")
        || canonical_method.starts_with("s5.m")
}

fn plugin_coordinate(plugin_id: &str) -> String {
    let coordinate = if plugin_id.starts_with("m0.") {
        "M0'"
    } else if plugin_id.starts_with("m1.") {
        "M1'"
    } else if plugin_id.starts_with("m2.") {
        "M2'"
    } else if plugin_id.starts_with("m3.") {
        "M3'"
    } else if plugin_id.starts_with("m4.") {
        "M4'"
    } else if plugin_id.starts_with("m5.") {
        "M5'"
    } else if plugin_id.starts_with("clock.") {
        "M0'"
    } else if plugin_id.starts_with("s0.") {
        "S0'"
    } else {
        "S0"
    };
    coordinate.to_string()
}

fn workspace_root() -> PathBuf {
    let manifest = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    manifest
        .ancestors()
        .nth(4)
        .map(Path::to_path_buf)
        .unwrap_or(manifest)
}
