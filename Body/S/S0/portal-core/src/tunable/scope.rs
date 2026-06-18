use std::collections::HashMap;
use std::path::PathBuf;

use super::metadata::{ScopeClass, TunableValue};
use super::registry::{parse_value_against_type_public, TunableRegistry};

#[derive(Debug, Default, Clone)]
pub struct ResolutionContext {
    pub global_config: Option<PathBuf>,
    pub pasu_config: Option<PathBuf>,
    pub session_overrides: HashMap<String, TunableValue>,
}

pub struct ScopeResolver<'a> {
    registry: &'a TunableRegistry,
    ctx: ResolutionContext,
    global_overrides: HashMap<String, TunableValue>,
    pasu_overrides: HashMap<String, TunableValue>,
}

impl<'a> ScopeResolver<'a> {
    pub fn new(registry: &'a TunableRegistry, ctx: ResolutionContext) -> Self {
        let global_overrides = ctx
            .global_config
            .as_ref()
            .map(|path| load_overrides(registry, path, None))
            .unwrap_or_default();
        let pasu_overrides = ctx
            .pasu_config
            .as_ref()
            .map(|path| load_overrides(registry, path, Some(ScopeClass::PerPasu)))
            .unwrap_or_default();

        Self {
            registry,
            ctx,
            global_overrides,
            pasu_overrides,
        }
    }

    pub fn value(&self, key: &str) -> Option<TunableValue> {
        if let Some(value) = self.ctx.session_overrides.get(key) {
            return Some(value.clone());
        }
        if let Some(value) = self.pasu_overrides.get(key) {
            return Some(value.clone());
        }
        if let Some(value) = self.global_overrides.get(key) {
            return Some(value.clone());
        }
        self.registry.value(key)
    }
}

fn load_overrides(
    registry: &TunableRegistry,
    path: &PathBuf,
    scope_filter: Option<ScopeClass>,
) -> HashMap<String, TunableValue> {
    if !path.exists() {
        return HashMap::new();
    }
    let Ok(text) = std::fs::read_to_string(path) else {
        return HashMap::new();
    };
    let Ok(root) = text.parse::<toml::Value>() else {
        return HashMap::new();
    };

    let mut values = HashMap::new();
    for (key, tunable) in registry.iter() {
        if let Some(scope_class) = scope_filter {
            if tunable.scope_class != scope_class {
                continue;
            }
        }
        if let Some(raw) = lookup_dotted_value(&root, key) {
            if let Some(value) = parse_value_against_type_public(raw, tunable.value_type) {
                values.insert(key.to_owned(), value);
            }
        }
    }
    values
}

fn lookup_dotted_value<'a>(root: &'a toml::Value, dotted_key: &str) -> Option<&'a toml::Value> {
    let mut current = root;
    for part in dotted_key.split('.') {
        current = current.as_table()?.get(part)?;
    }
    Some(current)
}
