use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct TunableMetadata {
    pub key: String,
    #[serde(rename = "type")]
    pub value_type: TunableType,
    pub default: TunableValue,
    #[serde(default)]
    pub residency_class: ResidencyClass,
    #[serde(default)]
    pub scope_class: ScopeClass,
    #[serde(default)]
    pub tuning_risk_class: TuningRiskClass,
    #[serde(default)]
    pub ml_trainable: bool,
    #[serde(default)]
    pub privacy_class: PrivacyClass,
    #[serde(default)]
    pub structural_invariant: bool,
    pub owning_subsystem: String,
    #[serde(default)]
    pub owning_carrier: Option<String>,
    pub authoritative_doc: String,
    #[serde(default)]
    pub warrant_constants: Vec<String>,
    #[serde(default)]
    pub description: Option<String>,
    #[serde(default)]
    pub range: Option<TunableRange>,
}

pub type Tunable = TunableMetadata;

#[derive(Clone, Copy, Debug, Deserialize, Serialize, PartialEq, Eq)]
pub enum TunableType {
    #[serde(rename = "bool")]
    Bool,
    #[serde(rename = "f32")]
    F32,
    #[serde(rename = "u32")]
    U32,
    #[serde(rename = "u64")]
    U64,
    #[serde(rename = "string")]
    String,
    #[serde(rename = "enum")]
    Enum,
    #[serde(rename = "f32_triplet")]
    F32Triplet,
    #[serde(rename = "string_array")]
    StringArray,
    #[serde(rename = "u32_lut")]
    U32Lut,
}

impl TunableType {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Bool => "bool",
            Self::F32 => "f32",
            Self::U32 => "u32",
            Self::U64 => "u64",
            Self::String => "string",
            Self::Enum => "enum",
            Self::F32Triplet => "f32_triplet",
            Self::StringArray => "string_array",
            Self::U32Lut => "u32_lut",
        }
    }
}

impl PartialEq<&str> for TunableType {
    fn eq(&self, other: &&str) -> bool {
        self.as_str() == *other
    }
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum TunableValue {
    Bool(bool),
    U32(u32),
    U64(u64),
    F32(f32),
    String(String),
    Enum(String),
    F32Triplet { m1: f32, m2: f32, m3: f32 },
    StringArray(Vec<String>),
}

#[derive(Clone, Debug, Default, Deserialize, Serialize, PartialEq)]
pub struct TunableRange {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub min: Option<f64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub max: Option<f64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub sum_to: Option<f64>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub enum_values: Vec<String>,
}

#[derive(Clone, Copy, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
pub enum ResidencyClass {
    HotReload,
    FreezeOnSessionStart,
    RestartRequired,
}

impl ResidencyClass {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::HotReload => "hot-reload",
            Self::FreezeOnSessionStart => "freeze-on-session-start",
            Self::RestartRequired => "restart-required",
        }
    }
}

impl Default for ResidencyClass {
    fn default() -> Self {
        Self::FreezeOnSessionStart
    }
}

#[derive(Clone, Copy, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
pub enum ScopeClass {
    Global,
    PerPasu,
    PerSession,
}

impl ScopeClass {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Global => "global",
            Self::PerPasu => "per-pasu",
            Self::PerSession => "per-session",
        }
    }
}

impl Default for ScopeClass {
    fn default() -> Self {
        Self::Global
    }
}

#[derive(Clone, Copy, Debug, Deserialize, Serialize, PartialEq, Eq)]
pub enum TuningRiskClass {
    A,
    B,
    C,
}

impl TuningRiskClass {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::A => "A",
            Self::B => "B",
            Self::C => "C",
        }
    }
}

impl Default for TuningRiskClass {
    fn default() -> Self {
        Self::A
    }
}

#[derive(Clone, Copy, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
pub enum PrivacyClass {
    LocalOnly,
    NonSensitive,
    VectorDerived,
    ProtectedLocalDerived,
}

impl PrivacyClass {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::LocalOnly => "local-only",
            Self::NonSensitive => "non-sensitive",
            Self::VectorDerived => "vector-derived",
            Self::ProtectedLocalDerived => "protected-local-derived",
        }
    }
}

impl Default for PrivacyClass {
    fn default() -> Self {
        Self::NonSensitive
    }
}

#[derive(Debug, Deserialize)]
pub(crate) struct TunableFile {
    #[serde(default)]
    pub tunable: Vec<RawTunable>,
}

#[derive(Debug, Deserialize)]
pub(crate) struct RawTunable {
    pub key: String,
    #[serde(rename = "type")]
    pub value_type: TunableType,
    pub default: toml::Value,
    #[serde(default)]
    pub residency_class: ResidencyClass,
    #[serde(default)]
    pub scope_class: ScopeClass,
    #[serde(default)]
    pub tuning_risk_class: TuningRiskClass,
    #[serde(default)]
    pub ml_trainable: bool,
    #[serde(default)]
    pub privacy_class: PrivacyClass,
    #[serde(default)]
    pub structural_invariant: bool,
    pub owning_subsystem: String,
    #[serde(default)]
    pub owning_carrier: Option<String>,
    pub authoritative_doc: String,
    #[serde(default)]
    pub warrant_constants: Vec<String>,
    #[serde(default)]
    pub description: Option<String>,
    #[serde(default)]
    pub range: Option<TunableRange>,
}
