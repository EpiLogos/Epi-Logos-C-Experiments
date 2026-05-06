use std::path::Path;

use super::config;

pub fn render(state_root: impl AsRef<Path>) -> Result<String, String> {
    let config = config::load_document(state_root)?;

    Ok(format!(
        "Gateway Config TUI\n\nDomains\n- gateway\n\nCurrent Values\n- gateway.port = {}\n- gateway.bindMode = {}\n- gateway.authMode = {}\n- gateway.tlsEnabled = {}\n- gateway.bootstrapRoot = {}\n- gateway.workspaceRoot = {}\n\nActions\n- apply staged changes\n- cancel staged changes\n- patch gateway values\n- inspect schema\n",
        config.gateway.port,
        config.gateway.bind_mode.as_str(),
        config.gateway.auth_mode,
        config.gateway.tls_enabled,
        config.gateway.bootstrap_root.as_deref().unwrap_or("<unset>"),
        config.gateway.workspace_root.as_deref().unwrap_or("<unset>")
    ))
}
