// Plugin registry — wraps ratatui_hypertile_extras::Registry with
// a convenience builder that registers all portal plugin types.

use ratatui_hypertile_extras::Registry;

/// Build the portal plugin registry with all available plugin types.
/// Each plugin type is registered by name (e.g., "m4.identity", "shared.help").
pub fn build_registry() -> Registry {
    let reg = Registry::default();
    // Plugins will be registered here as they're implemented in subsequent tasks.
    // Example (uncommented when plugin exists):
    // reg.register_plugin_type("shared.help", || shared::HelpPlugin::new());
    reg
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn build_registry_returns_empty_registry() {
        let reg = build_registry();
        assert_eq!(reg.instance_count(), 0);
    }
}
