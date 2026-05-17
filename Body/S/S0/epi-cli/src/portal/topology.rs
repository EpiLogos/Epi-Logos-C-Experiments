#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum PortalDomain {
    StructuralClock,
    CommandReturn,
    PersonalWorldReturn,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct PortalDomainSpec {
    pub key: &'static str,
    pub domain: PortalDomain,
    pub label: &'static str,
    pub coordinates: &'static [&'static str],
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct SlashCommandSurface {
    pub id: &'static str,
    pub coordinate: &'static str,
    pub label: &'static str,
    pub command_hint: &'static str,
    pub proves_raw_service_health: bool,
    pub proves_agent_access_separately: bool,
    pub config_fields: &'static [PortalConfigField],
    pub actions: &'static [PortalAction],
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct PortalConfigField {
    pub key: &'static str,
    pub label: &'static str,
    pub coordinate: &'static str,
    pub editable: bool,
    pub apply_command: Option<&'static [&'static str]>,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum PortalActionKind {
    Inspect,
    EditConfig,
    RunCommand,
    ApplyChanges,
    Verify,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct PortalAction {
    pub id: &'static str,
    pub label: &'static str,
    pub kind: PortalActionKind,
    pub command: Option<&'static [&'static str]>,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct CoordinateSurface {
    pub id: &'static str,
    pub label: &'static str,
    pub applies_to_stack_instantiation: bool,
    pub applies_to_visualisation: bool,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct CoordinateCatalog {
    pub s_layers: &'static [CoordinateSurface],
    pub m_layers: &'static [CoordinateSurface],
}

const STRUCTURAL_COORDINATES: &[&str] = &["M0'", "M1'", "M2'", "M3'"];
const COMMAND_COORDINATES: &[&str] = &["S0", "S0'", "S1", "S2", "S3", "S4", "S5"];
const RETURN_COORDINATES: &[&str] = &["M4'", "M5'"];

const S_COORDINATES: &[CoordinateSurface] = &[
    CoordinateSurface {
        id: "S0",
        label: "CLI / shell return",
        applies_to_stack_instantiation: true,
        applies_to_visualisation: false,
    },
    CoordinateSurface {
        id: "S0'",
        label: "Tool topology / bootstrap law",
        applies_to_stack_instantiation: true,
        applies_to_visualisation: false,
    },
    CoordinateSurface {
        id: "S1",
        label: "Vault / artifact body",
        applies_to_stack_instantiation: true,
        applies_to_visualisation: false,
    },
    CoordinateSurface {
        id: "S1'",
        label: "Hen compiler law",
        applies_to_stack_instantiation: true,
        applies_to_visualisation: false,
    },
    CoordinateSurface {
        id: "S2",
        label: "Graph / embeddings / Redis cache",
        applies_to_stack_instantiation: true,
        applies_to_visualisation: false,
    },
    CoordinateSurface {
        id: "S2'",
        label: "Graph retrieval law",
        applies_to_stack_instantiation: true,
        applies_to_visualisation: false,
    },
    CoordinateSurface {
        id: "S3",
        label: "Gateway / runtime bridge",
        applies_to_stack_instantiation: true,
        applies_to_visualisation: false,
    },
    CoordinateSurface {
        id: "S3'",
        label: "Temporal/session protocol",
        applies_to_stack_instantiation: true,
        applies_to_visualisation: true,
    },
    CoordinateSurface {
        id: "S4",
        label: "PI agent runtime",
        applies_to_stack_instantiation: true,
        applies_to_visualisation: false,
    },
    CoordinateSurface {
        id: "S4'",
        label: "Anima / VAK dispatch",
        applies_to_stack_instantiation: true,
        applies_to_visualisation: true,
    },
    CoordinateSurface {
        id: "S5",
        label: "Gnosis / Nara / world return",
        applies_to_stack_instantiation: true,
        applies_to_visualisation: true,
    },
    CoordinateSurface {
        id: "S5'",
        label: "Epii / review / autoresearch",
        applies_to_stack_instantiation: true,
        applies_to_visualisation: true,
    },
];

const M_COORDINATES: &[CoordinateSurface] = &[
    CoordinateSurface {
        id: "M0'",
        label: "Ground / structural source",
        applies_to_stack_instantiation: false,
        applies_to_visualisation: true,
    },
    CoordinateSurface {
        id: "M1'",
        label: "Torus walk / relation vector",
        applies_to_stack_instantiation: false,
        applies_to_visualisation: true,
    },
    CoordinateSurface {
        id: "M2'",
        label: "Vibrational matrix",
        applies_to_stack_instantiation: false,
        applies_to_visualisation: true,
    },
    CoordinateSurface {
        id: "M3'",
        label: "Aletheia / knowing surface",
        applies_to_stack_instantiation: false,
        applies_to_visualisation: true,
    },
    CoordinateSurface {
        id: "M4'",
        label: "Nara / PASU evolution",
        applies_to_stack_instantiation: false,
        applies_to_visualisation: true,
    },
    CoordinateSurface {
        id: "M5'",
        label: "Epii / developer return",
        applies_to_stack_instantiation: false,
        applies_to_visualisation: true,
    },
];

const GATEWAY_PORT_APPLY: &[&str] = &["epi", "gate", "config", "set", "gateway.port"];
const GATEWAY_BIND_APPLY: &[&str] = &["epi", "gate", "config", "set", "gateway.bindMode"];
const SECRET_PROVIDER_APPLY: &[&str] =
    &["epi", "gate", "config", "set", "gateway.secrets.provider"];
const TELEGRAM_ENABLED_APPLY: &[&str] = &[
    "epi",
    "gate",
    "config",
    "set",
    "gateway.channels.telegram.enabled",
];
const WHATSAPP_ENABLED_APPLY: &[&str] = &[
    "epi",
    "gate",
    "config",
    "set",
    "gateway.channels.whatsapp.enabled",
];
const SLACK_ENABLED_APPLY: &[&str] = &[
    "epi",
    "gate",
    "config",
    "set",
    "gateway.channels.slack.enabled",
];
const DISCORD_ENABLED_APPLY: &[&str] = &[
    "epi",
    "gate",
    "config",
    "set",
    "gateway.channels.discord.enabled",
];
const GOOGLE_DRIVE_ENABLED_APPLY: &[&str] = &[
    "epi",
    "gate",
    "config",
    "set",
    "gateway.channels.google-drive.enabled",
];
const GRAPH_UP: &[&str] = &["epi", "graph", "up"];
const GRAPH_DOCTOR: &[&str] = &["epi", "graph", "doctor"];
const GATEWAY_STATUS: &[&str] = &["epi", "gate", "status"];
const CHANNELS_STATUS: &[&str] = &["epi", "gate", "rpc", "channels.status"];
const CHANNELS_SEND: &[&str] = &["epi", "gate", "rpc", "channels.send"];
const CHANNELS_FILES_LIST: &[&str] = &["epi", "gate", "rpc", "channels.files.list"];
const AGENT_STATUS: &[&str] = &["epi", "agent", "status"];
const EPII_STATUS: &[&str] = &["epi", "gate", "rpc", "s5'.epii.status"];
const EPI_UP: &[&str] = &["epi", "up"];

const SETUP_FIELDS: &[PortalConfigField] = &[];
const SETUP_ACTIONS: &[PortalAction] = &[
    PortalAction {
        id: "setup.run",
        label: "Run setup",
        kind: PortalActionKind::RunCommand,
        command: Some(EPI_UP),
    },
    PortalAction {
        id: "setup.verify",
        label: "Verify readiness",
        kind: PortalActionKind::Verify,
        command: Some(EPI_UP),
    },
];

const CONFIG_FIELDS: &[PortalConfigField] = &[
    PortalConfigField {
        key: "gateway.port",
        label: "Gateway port",
        coordinate: "S3",
        editable: true,
        apply_command: Some(GATEWAY_PORT_APPLY),
    },
    PortalConfigField {
        key: "gateway.bindMode",
        label: "Gateway bind mode",
        coordinate: "S3",
        editable: true,
        apply_command: Some(GATEWAY_BIND_APPLY),
    },
    PortalConfigField {
        key: "gateway.secrets.provider",
        label: "Secret provider",
        coordinate: "S0'/S3",
        editable: true,
        apply_command: Some(SECRET_PROVIDER_APPLY),
    },
    PortalConfigField {
        key: "gateway.secrets.onePasswordVault",
        label: "1Password vault",
        coordinate: "S0'/S3",
        editable: true,
        apply_command: None,
    },
    PortalConfigField {
        key: "gateway.secrets.varlockProfile",
        label: "Varlock profile",
        coordinate: "S0'/S3",
        editable: true,
        apply_command: None,
    },
    PortalConfigField {
        key: "gateway.channels.telegram.enabled",
        label: "Telegram channel",
        coordinate: "S3",
        editable: true,
        apply_command: Some(TELEGRAM_ENABLED_APPLY),
    },
    PortalConfigField {
        key: "gateway.channels.telegram.secretRef",
        label: "Telegram secret",
        coordinate: "S3",
        editable: true,
        apply_command: None,
    },
    PortalConfigField {
        key: "gateway.channels.telegram.accountHint",
        label: "Telegram account",
        coordinate: "S3",
        editable: true,
        apply_command: None,
    },
    PortalConfigField {
        key: "gateway.channels.whatsapp.enabled",
        label: "WhatsApp channel",
        coordinate: "S3",
        editable: true,
        apply_command: Some(WHATSAPP_ENABLED_APPLY),
    },
    PortalConfigField {
        key: "gateway.channels.whatsapp.secretRef",
        label: "WhatsApp secret",
        coordinate: "S3",
        editable: true,
        apply_command: None,
    },
    PortalConfigField {
        key: "gateway.channels.whatsapp.workspace",
        label: "WhatsApp phone number id",
        coordinate: "S3",
        editable: true,
        apply_command: None,
    },
    PortalConfigField {
        key: "gateway.channels.slack.enabled",
        label: "Slack channel",
        coordinate: "S3",
        editable: true,
        apply_command: Some(SLACK_ENABLED_APPLY),
    },
    PortalConfigField {
        key: "gateway.channels.slack.secretRef",
        label: "Slack secret",
        coordinate: "S3",
        editable: true,
        apply_command: None,
    },
    PortalConfigField {
        key: "gateway.channels.slack.accountHint",
        label: "Slack default channel",
        coordinate: "S3",
        editable: true,
        apply_command: None,
    },
    PortalConfigField {
        key: "gateway.channels.discord.enabled",
        label: "Discord channel",
        coordinate: "S3",
        editable: true,
        apply_command: Some(DISCORD_ENABLED_APPLY),
    },
    PortalConfigField {
        key: "gateway.channels.discord.secretRef",
        label: "Discord secret",
        coordinate: "S3",
        editable: true,
        apply_command: None,
    },
    PortalConfigField {
        key: "gateway.channels.discord.accountHint",
        label: "Discord default channel",
        coordinate: "S3",
        editable: true,
        apply_command: None,
    },
    PortalConfigField {
        key: "gateway.channels.google-drive.enabled",
        label: "Google Drive channel",
        coordinate: "S3",
        editable: true,
        apply_command: Some(GOOGLE_DRIVE_ENABLED_APPLY),
    },
    PortalConfigField {
        key: "gateway.channels.google-drive.secretRef",
        label: "Google Drive secret",
        coordinate: "S3",
        editable: true,
        apply_command: None,
    },
];

const CONFIG_ACTIONS: &[PortalAction] = &[
    PortalAction {
        id: "config.inspect",
        label: "Inspect schema",
        kind: PortalActionKind::Inspect,
        command: Some(&["epi", "gate", "config", "schema"]),
    },
    PortalAction {
        id: "config.edit",
        label: "Edit selected field",
        kind: PortalActionKind::EditConfig,
        command: None,
    },
    PortalAction {
        id: "config.apply",
        label: "Apply staged change",
        kind: PortalActionKind::ApplyChanges,
        command: Some(&["epi", "gate", "config", "apply"]),
    },
];

const GRAPH_ACTIONS: &[PortalAction] = &[
    PortalAction {
        id: "graph.up",
        label: "Start graph stack",
        kind: PortalActionKind::RunCommand,
        command: Some(GRAPH_UP),
    },
    PortalAction {
        id: "graph.doctor",
        label: "Check graph health",
        kind: PortalActionKind::Verify,
        command: Some(GRAPH_DOCTOR),
    },
];

const GATEWAY_ACTIONS: &[PortalAction] = &[
    PortalAction {
        id: "gateway.status",
        label: "Check gateway status",
        kind: PortalActionKind::Verify,
        command: Some(GATEWAY_STATUS),
    },
    PortalAction {
        id: "channels.status",
        label: "Check channel readiness",
        kind: PortalActionKind::Verify,
        command: Some(CHANNELS_STATUS),
    },
    PortalAction {
        id: "channels.send",
        label: "Send channel message",
        kind: PortalActionKind::RunCommand,
        command: Some(CHANNELS_SEND),
    },
    PortalAction {
        id: "channels.files.list",
        label: "List Drive files",
        kind: PortalActionKind::RunCommand,
        command: Some(CHANNELS_FILES_LIST),
    },
];

const AGENT_ACTIONS: &[PortalAction] = &[PortalAction {
    id: "agent.status",
    label: "Check agent access",
    kind: PortalActionKind::Verify,
    command: Some(AGENT_STATUS),
}];

const EPII_ACTIONS: &[PortalAction] = &[PortalAction {
    id: "epii.status",
    label: "Check Epii status",
    kind: PortalActionKind::Verify,
    command: Some(EPII_STATUS),
}];

const RETURN_ACTIONS: &[PortalAction] = &[PortalAction {
    id: "return.help",
    label: "Show CLI help",
    kind: PortalActionKind::Inspect,
    command: Some(&["epi", "--help"]),
}];

pub fn portal_domains() -> Vec<PortalDomainSpec> {
    vec![
        PortalDomainSpec {
            key: "0",
            domain: PortalDomain::StructuralClock,
            label: "Structural Clock",
            coordinates: STRUCTURAL_COORDINATES,
        },
        PortalDomainSpec {
            key: "/",
            domain: PortalDomain::CommandReturn,
            label: "Command Return",
            coordinates: COMMAND_COORDINATES,
        },
        PortalDomainSpec {
            key: "1",
            domain: PortalDomain::PersonalWorldReturn,
            label: "Personal / World Return",
            coordinates: RETURN_COORDINATES,
        },
    ]
}

pub fn slash_command_surfaces() -> Vec<SlashCommandSurface> {
    vec![
        SlashCommandSurface {
            id: "setup.readiness",
            coordinate: "S0'",
            label: "Setup / Readiness",
            command_hint: "epi up",
            proves_raw_service_health: true,
            proves_agent_access_separately: true,
            config_fields: SETUP_FIELDS,
            actions: SETUP_ACTIONS,
        },
        SlashCommandSurface {
            id: "config.schema",
            coordinate: "S0'",
            label: "Config Schema",
            command_hint: "epi gate config",
            proves_raw_service_health: false,
            proves_agent_access_separately: false,
            config_fields: CONFIG_FIELDS,
            actions: CONFIG_ACTIONS,
        },
        SlashCommandSurface {
            id: "s2.graph",
            coordinate: "S2",
            label: "Graph / Cache",
            command_hint: "epi graph doctor",
            proves_raw_service_health: true,
            proves_agent_access_separately: false,
            config_fields: &[],
            actions: GRAPH_ACTIONS,
        },
        SlashCommandSurface {
            id: "s3.gateway",
            coordinate: "S3",
            label: "Gateway / Runtime",
            command_hint: "epi gate status",
            proves_raw_service_health: true,
            proves_agent_access_separately: false,
            config_fields: &[],
            actions: GATEWAY_ACTIONS,
        },
        SlashCommandSurface {
            id: "s4.agent",
            coordinate: "S4",
            label: "Agent Access",
            command_hint: "epi agent",
            proves_raw_service_health: false,
            proves_agent_access_separately: true,
            config_fields: &[],
            actions: AGENT_ACTIONS,
        },
        SlashCommandSurface {
            id: "s5.epii",
            coordinate: "S5",
            label: "Epii / World Return",
            command_hint: "epi gate rpc s5'.epii.status",
            proves_raw_service_health: true,
            proves_agent_access_separately: true,
            config_fields: &[],
            actions: EPII_ACTIONS,
        },
        SlashCommandSurface {
            id: "s0.return",
            coordinate: "S0",
            label: "Return Proof",
            command_hint: "epi --help",
            proves_raw_service_health: false,
            proves_agent_access_separately: false,
            config_fields: &[],
            actions: RETURN_ACTIONS,
        },
    ]
}

pub fn coordinate_catalog() -> CoordinateCatalog {
    CoordinateCatalog {
        s_layers: S_COORDINATES,
        m_layers: M_COORDINATES,
    }
}
