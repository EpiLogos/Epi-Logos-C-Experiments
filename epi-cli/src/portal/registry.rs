// Plugin registry — wraps ratatui_hypertile_extras::Registry with
// a convenience builder that registers all portal plugin types.

use ratatui_hypertile_extras::Registry;
use super::plugins::{shared, m0, m1, m2, m3, m4, m5};

/// Build the portal plugin registry with all available plugin types.
/// Each plugin type is registered by name (e.g., "m4.identity", "shared.help").
pub fn build_registry() -> Registry {
    let mut reg = Registry::default();

    // Shared
    reg.register_plugin_type("shared.help", || shared::HelpPlugin::new());
    reg.register_plugin_type("shared.status", || shared::StatusPlugin::new());

    // M0
    reg.register_plugin_type("m0.dashboard", || m0::M0DashboardPlugin::new());
    reg.register_plugin_type("m0.families", || m0::M0FamiliesPlugin::new());

    // M1
    reg.register_plugin_type("m1.walk", || m1::M1WalkPlugin::new());

    // M2
    reg.register_plugin_type("m2.vibrational", || m2::M2VibrationalPlugin::new());

    // M3
    reg.register_plugin_type("m3.knowing", || m3::M3KnowingPlugin::new());

    // M4
    reg.register_plugin_type("m4.identity", || m4::M4IdentityPlugin::new());
    reg.register_plugin_type("m4.flow", || m4::M4FlowPlugin::new());
    reg.register_plugin_type("m4.oracle", || m4::M4OraclePlugin::new());
    reg.register_plugin_type("m4.medicine", || m4::M4MedicinePlugin::new());
    reg.register_plugin_type("m4.transform", || m4::M4TransformPlugin::new());
    reg.register_plugin_type("m4.lens", || m4::M4LensPlugin::new());
    reg.register_plugin_type("m4.pratibimba", || m4::M4PratibimbaPlugin::new());

    // M5
    reg.register_plugin_type("m5.logos", || m5::M5LogosPlugin::new());
    reg.register_plugin_type("m5.chat", || m5::M5ChatPlugin::new());
    reg.register_plugin_type("m5.fsm", || m5::M5FsmPlugin::new());

    reg
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn build_registry_has_all_plugins() {
        let reg = build_registry();
        let types: Vec<&str> = reg.registered_types().collect();
        let expected = vec![
            "shared.help", "shared.status",
            "m0.dashboard", "m0.families",
            "m1.walk",
            "m2.vibrational",
            "m3.knowing",
            "m4.identity", "m4.flow", "m4.oracle",
            "m4.medicine", "m4.transform", "m4.lens", "m4.pratibimba",
            "m5.logos", "m5.chat", "m5.fsm",
        ];
        for name in &expected {
            assert!(types.contains(name), "Registry missing plugin: {}", name);
        }
        assert_eq!(types.len(), expected.len(), "Unexpected extra plugin types");
    }

    #[test]
    fn can_instantiate_all_plugins() {
        let reg = build_registry();
        for name in reg.registered_types() {
            let plugin = reg.instantiate_plugin(name);
            assert!(plugin.is_ok(), "Failed to instantiate plugin: {}", name);
        }
    }
}
