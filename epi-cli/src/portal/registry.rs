// Plugin registry — convenience builder for standalone testing.
// Delegates to the same registration logic used by the workspace.

use ratatui_hypertile_extras::{HypertileRuntimeBuilder, WorkspaceRuntime};

/// Build a standalone workspace with all portal plugin types registered.
/// Used by tests that need a registry without launching the full portal.
pub fn build_registry_workspace() -> WorkspaceRuntime {
    let mut ws = WorkspaceRuntime::new(|| HypertileRuntimeBuilder::default());
    super::register_all_plugins(ws.active_runtime_mut());
    ws
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn build_registry_has_all_plugins() {
        let ws = build_registry_workspace();
        let reg = ws.active_runtime().registry();
        let types: Vec<&str> = reg.registered_types().collect();
        let expected = vec![
            "shared.help",
            "shared.status",
            "m0.dashboard",
            "m0.families",
            "m1.walk",
            "m2.vibrational",
            "m3.knowing",
            "m4.identity",
            "m4.flow",
            "m4.oracle",
            "m4.medicine",
            "m4.transform",
            "m4.lens",
            "m4.pratibimba",
            "m5.logos",
            "m5.chat",
            "m5.fsm",
        ];
        for name in &expected {
            assert!(types.contains(name), "Registry missing plugin: {}", name);
        }
        // WorkspaceRuntime builder may add a default "block" placeholder type
        assert!(
            types.len() >= expected.len(),
            "Missing plugin types: got {}, expected at least {}",
            types.len(),
            expected.len()
        );
    }

    #[test]
    fn can_instantiate_all_plugins() {
        let ws = build_registry_workspace();
        let reg = ws.active_runtime().registry();
        for name in reg.registered_types() {
            let plugin = reg.instantiate_plugin(name);
            assert!(plugin.is_ok(), "Failed to instantiate plugin: {}", name);
        }
    }
}
