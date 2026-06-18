use std::collections::BTreeMap;
use std::fmt;
use std::path::{Path, PathBuf};

use super::metadata::{RawTunable, Tunable, TunableFile, TunableRange, TunableType, TunableValue};

#[derive(Clone, Debug, PartialEq)]
pub struct TunableRegistry {
    tunables: BTreeMap<String, Tunable>,
    values: BTreeMap<String, TunableValue>,
}

#[derive(Clone, Debug, PartialEq)]
pub enum LoadError {
    Io(String),
    Toml(String),
    Validation(ValidationError),
}

#[derive(Clone, Debug, PartialEq)]
pub enum ValidationError {
    DuplicateKey(String),
    InvalidKey(String),
    TypeMismatch {
        key: String,
        expected: TunableType,
        actual: String,
    },
    OutOfRange {
        key: String,
        value: String,
        range: TunableRange,
    },
    InvalidEnumValue {
        key: String,
        value: String,
        allowed: Vec<String>,
    },
    MissingEnumRange(String),
    StructuralWithoutWarrant {
        key: String,
    },
    SumToOnNonTriplet {
        key: String,
    },
}

impl TunableRegistry {
    pub fn load_from_dir(schema_dir: &Path) -> Result<Self, LoadError> {
        let mut paths = std::fs::read_dir(schema_dir)
            .map_err(|e| LoadError::Io(format!("read {}: {e}", schema_dir.display())))?
            .map(|entry| entry.map(|entry| entry.path()))
            .collect::<Result<Vec<_>, _>>()
            .map_err(|e| LoadError::Io(format!("read {}: {e}", schema_dir.display())))?;
        paths.retain(|path| {
            path.file_name()
                .and_then(|name| name.to_str())
                .is_some_and(|name| name.ends_with(".tunable.toml"))
        });
        paths.sort();

        let mut tunables = BTreeMap::new();
        let mut values = BTreeMap::new();
        for path in paths {
            let parsed = parse_tunable_file(&path)?;
            for raw in parsed.tunable {
                let tunable = build_tunable(raw)?;
                let key = tunable.key.clone();
                if tunables.contains_key(&key) {
                    return Err(LoadError::Validation(ValidationError::DuplicateKey(key)));
                }
                values.insert(key.clone(), tunable.default.clone());
                tunables.insert(key, tunable);
            }
        }

        Ok(Self { tunables, values })
    }

    pub fn load_with_overrides(
        schema_dir: &Path,
        config_path: Option<&Path>,
    ) -> Result<Self, LoadError> {
        let mut registry = Self::load_from_dir(schema_dir)?;
        let Some(config_path) = config_path else {
            return Ok(registry);
        };
        if !config_path.exists() {
            return Ok(registry);
        }

        let content = std::fs::read_to_string(config_path)
            .map_err(|e| LoadError::Io(format!("read {}: {e}", config_path.display())))?;
        let root: toml::Value = toml::from_str(&content)
            .map_err(|e| LoadError::Toml(format!("parse {}: {e}", config_path.display())))?;
        for (key, tunable) in &registry.tunables {
            if let Some(raw_value) = lookup_dotted_value(&root, key) {
                let value = typed_value(key, tunable.value_type, raw_value)
                    .map_err(LoadError::Validation)?;
                validate_value(key, &value, tunable.range.as_ref())
                    .map_err(LoadError::Validation)?;
                registry.values.insert(key.clone(), value);
            }
        }
        Ok(registry)
    }

    pub fn value(&self, key: &str) -> Option<TunableValue> {
        self.values.get(key).cloned()
    }

    pub fn get(&self, key: &str) -> Option<&Tunable> {
        self.tunables.get(key)
    }

    pub fn tunable(&self, key: &str) -> Option<&Tunable> {
        self.tunables.get(key)
    }

    pub fn iter(&self) -> impl Iterator<Item = (&str, &Tunable)> {
        self.tunables
            .iter()
            .map(|(key, value)| (key.as_str(), value))
    }

    pub fn validate(&self) -> Result<(), ValidationError> {
        for (key, tunable) in &self.tunables {
            if tunable.structural_invariant && tunable.warrant_constants.is_empty() {
                return Err(ValidationError::StructuralWithoutWarrant { key: key.clone() });
            }
            if tunable
                .range
                .as_ref()
                .is_some_and(|range| range.sum_to.is_some())
                && tunable.value_type != TunableType::F32Triplet
            {
                return Err(ValidationError::SumToOnNonTriplet { key: key.clone() });
            }
            validate_value(key, &tunable.default, tunable.range.as_ref())?;
        }
        Ok(())
    }

    pub fn len(&self) -> usize {
        self.tunables.len()
    }

    pub fn is_empty(&self) -> bool {
        self.tunables.is_empty()
    }
}

impl fmt::Display for LoadError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Io(msg) | Self::Toml(msg) => f.write_str(msg),
            Self::Validation(err) => write!(f, "{err}"),
        }
    }
}

impl std::error::Error for LoadError {}

impl fmt::Display for ValidationError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::DuplicateKey(key) => write!(f, "duplicate tunable key {key}"),
            Self::InvalidKey(key) => write!(f, "invalid tunable key {key}"),
            Self::TypeMismatch {
                key,
                expected,
                actual,
            } => write!(f, "{key} expected {expected:?}, got {actual}"),
            Self::OutOfRange { key, value, range } => {
                write!(f, "{key} value {value} outside range {range:?}")
            }
            Self::InvalidEnumValue {
                key,
                value,
                allowed,
            } => write!(f, "{key} enum value {value} not in {allowed:?}"),
            Self::MissingEnumRange(key) => write!(f, "{key} enum tunable requires enum_values"),
            Self::StructuralWithoutWarrant { key } => {
                write!(
                    f,
                    "{key} structural_invariant=true requires warrant_constants"
                )
            }
            Self::SumToOnNonTriplet { key } => {
                write!(f, "{key} range.sum_to is only valid for f32_triplet")
            }
        }
    }
}

impl std::error::Error for ValidationError {}

fn parse_tunable_file(path: &PathBuf) -> Result<TunableFile, LoadError> {
    let content = std::fs::read_to_string(path)
        .map_err(|e| LoadError::Io(format!("read {}: {e}", path.display())))?;
    toml::from_str(&content).map_err(|e| LoadError::Toml(format!("parse {}: {e}", path.display())))
}

fn build_tunable(raw: RawTunable) -> Result<Tunable, LoadError> {
    if raw.key.trim().is_empty() || raw.key.split('.').any(str::is_empty) {
        return Err(LoadError::Validation(ValidationError::InvalidKey(raw.key)));
    }
    let default =
        typed_value(&raw.key, raw.value_type, &raw.default).map_err(LoadError::Validation)?;
    validate_value(&raw.key, &default, raw.range.as_ref()).map_err(LoadError::Validation)?;

    Ok(Tunable {
        key: raw.key,
        value_type: raw.value_type,
        default,
        residency_class: raw.residency_class,
        scope_class: raw.scope_class,
        tuning_risk_class: raw.tuning_risk_class,
        ml_trainable: raw.ml_trainable,
        privacy_class: raw.privacy_class,
        structural_invariant: raw.structural_invariant,
        owning_subsystem: raw.owning_subsystem,
        owning_carrier: raw.owning_carrier,
        authoritative_doc: raw.authoritative_doc,
        warrant_constants: raw.warrant_constants,
        description: raw.description,
        range: raw.range,
    })
}

fn lookup_dotted_value<'a>(root: &'a toml::Value, dotted_key: &str) -> Option<&'a toml::Value> {
    let mut current = root;
    for part in dotted_key.split('.') {
        current = current.as_table()?.get(part)?;
    }
    Some(current)
}

pub fn parse_value_against_type_public(
    raw: &toml::Value,
    value_type: TunableType,
) -> Option<TunableValue> {
    typed_value("<override>", value_type, raw).ok()
}

fn typed_value(
    key: &str,
    value_type: TunableType,
    raw: &toml::Value,
) -> Result<TunableValue, ValidationError> {
    match value_type {
        TunableType::Bool => raw
            .as_bool()
            .map(TunableValue::Bool)
            .ok_or_else(|| type_mismatch(key, value_type, raw)),
        TunableType::F32 => match raw {
            toml::Value::Float(v) => Ok(TunableValue::F32(*v as f32)),
            toml::Value::Integer(v) => Ok(TunableValue::F32(*v as f32)),
            _ => Err(type_mismatch(key, value_type, raw)),
        },
        TunableType::U32 => raw
            .as_integer()
            .and_then(|v| u32::try_from(v).ok())
            .map(TunableValue::U32)
            .ok_or_else(|| type_mismatch(key, value_type, raw)),
        TunableType::U64 => raw
            .as_integer()
            .and_then(|v| u64::try_from(v).ok())
            .map(TunableValue::U64)
            .ok_or_else(|| type_mismatch(key, value_type, raw)),
        TunableType::U32Lut => raw
            .as_integer()
            .and_then(|v| u32::try_from(v).ok())
            .map(TunableValue::U32)
            .ok_or_else(|| type_mismatch(key, value_type, raw)),
        TunableType::String => raw
            .as_str()
            .map(|v| TunableValue::String(v.to_owned()))
            .ok_or_else(|| type_mismatch(key, value_type, raw)),
        TunableType::Enum => raw
            .as_str()
            .map(|v| TunableValue::Enum(v.to_owned()))
            .ok_or_else(|| type_mismatch(key, value_type, raw)),
        TunableType::F32Triplet => {
            let table = raw
                .as_table()
                .ok_or_else(|| type_mismatch(key, value_type, raw))?;
            let m1 = table
                .get("m1")
                .and_then(toml_number_as_f32)
                .ok_or_else(|| type_mismatch(key, value_type, raw))?;
            let m2 = table
                .get("m2")
                .and_then(toml_number_as_f32)
                .ok_or_else(|| type_mismatch(key, value_type, raw))?;
            let m3 = table
                .get("m3")
                .and_then(toml_number_as_f32)
                .ok_or_else(|| type_mismatch(key, value_type, raw))?;
            Ok(TunableValue::F32Triplet { m1, m2, m3 })
        }
        TunableType::StringArray => raw
            .as_array()
            .and_then(|values| {
                values
                    .iter()
                    .map(|value| value.as_str().map(str::to_owned))
                    .collect::<Option<Vec<_>>>()
            })
            .map(TunableValue::StringArray)
            .ok_or_else(|| type_mismatch(key, value_type, raw)),
    }
}

fn toml_number_as_f32(value: &toml::Value) -> Option<f32> {
    match value {
        toml::Value::Float(v) => Some(*v as f32),
        toml::Value::Integer(v) => Some(*v as f32),
        _ => None,
    }
}

fn type_mismatch(key: &str, expected: TunableType, raw: &toml::Value) -> ValidationError {
    ValidationError::TypeMismatch {
        key: key.to_owned(),
        expected,
        actual: raw.type_str().to_owned(),
    }
}

fn validate_value(
    key: &str,
    value: &TunableValue,
    range: Option<&TunableRange>,
) -> Result<(), ValidationError> {
    let Some(range) = range else {
        return match value {
            TunableValue::Enum(_) => Err(ValidationError::MissingEnumRange(key.to_owned())),
            _ => Ok(()),
        };
    };

    match value {
        TunableValue::F32(v) => validate_numeric_range(key, *v as f64, range),
        TunableValue::U32(v) => validate_numeric_range(key, *v as f64, range),
        TunableValue::U64(v) => validate_numeric_range(key, *v as f64, range),
        TunableValue::F32Triplet { m1, m2, m3 } => {
            for value in [*m1, *m2, *m3] {
                validate_numeric_range(key, value as f64, range)?;
            }
            if let Some(sum_to) = range.sum_to {
                let sum = *m1 as f64 + *m2 as f64 + *m3 as f64;
                if (sum - sum_to).abs() > 0.0001 {
                    return Err(ValidationError::OutOfRange {
                        key: key.to_owned(),
                        value: sum.to_string(),
                        range: range.clone(),
                    });
                }
            }
            Ok(())
        }
        TunableValue::Enum(v) => {
            if range.enum_values.is_empty() {
                return Err(ValidationError::MissingEnumRange(key.to_owned()));
            }
            if range.enum_values.iter().any(|allowed| allowed == v) {
                Ok(())
            } else {
                Err(ValidationError::InvalidEnumValue {
                    key: key.to_owned(),
                    value: v.clone(),
                    allowed: range.enum_values.clone(),
                })
            }
        }
        TunableValue::Bool(_) | TunableValue::String(_) | TunableValue::StringArray(_) => Ok(()),
    }
}

fn validate_numeric_range(
    key: &str,
    value: f64,
    range: &TunableRange,
) -> Result<(), ValidationError> {
    let above_min = range.min.map_or(true, |min| value >= min);
    let below_max = range.max.map_or(true, |max| value <= max);
    if above_min && below_max {
        Ok(())
    } else {
        Err(ValidationError::OutOfRange {
            key: key.to_owned(),
            value: value.to_string(),
            range: range.clone(),
        })
    }
}
