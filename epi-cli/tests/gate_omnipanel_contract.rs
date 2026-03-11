use std::fs;

use epi_logos::gate::{omnipanel, parity};

#[test]
fn omnipanel_contract_surfaces_alias_and_active_agent_metadata() {
    let hello = omnipanel::hello_contract();

    assert!(hello.features.methods.contains(&"sessions.resolve"));
    assert!(hello.features.methods.contains(&"agent"));
    assert!(hello.features.methods.contains(&"health"));
    assert!(hello.features.methods.contains(&"status"));
    assert!(hello.features.methods.contains(&"wake"));
    assert!(hello.session_metadata.contains(&"alias"));
    assert!(hello.session_metadata.contains(&"activeAgentId"));
    assert!(hello.session_metadata.contains(&"subagentLineage"));
    assert!(hello.session_metadata.contains(&"workspaceRoot"));
    assert!(hello.session_metadata.contains(&"bootstrapScope"));
}

#[test]
fn rust_manifest_covers_required_methods_declared_by_electron_panel_parity() {
    let parity_path = "/Users/admin/Documents/Epi-Logos/Idea/Pratibimba/System/src/renderer/components/omni/contracts/panelRpcParity.ts";
    let content =
        fs::read_to_string(parity_path).expect("panel parity contract should be readable");
    let methods = parity::method_names();

    for method in extract_methods(&content) {
        assert!(
            methods.contains(&method.as_str())
                || matches!(
                    method.as_str(),
                    "status.summary" | "health.snapshot" | "presence.list"
                ),
            "missing rust gateway method for omnipanel contract: {method}"
        );
    }
}

fn extract_methods(content: &str) -> Vec<String> {
    let mut methods = Vec::new();
    let mut collecting = false;

    for line in content.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with("required:") || trimmed.starts_with("optional:") {
            collecting = true;
        }
        if collecting {
            let mut start = 0;
            while let Some(open) = trimmed[start..].find('\'') {
                let open = start + open + 1;
                let Some(close_rel) = trimmed[open..].find('\'') else {
                    break;
                };
                let close = open + close_rel;
                let value = &trimmed[open..close];
                if value.contains('.') {
                    methods.push(value.to_owned());
                }
                start = close + 1;
            }
        }
        if collecting && trimmed.contains(']') {
            collecting = false;
        }
    }
    methods
}
