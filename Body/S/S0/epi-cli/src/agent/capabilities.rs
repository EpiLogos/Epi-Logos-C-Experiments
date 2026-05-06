use std::collections::BTreeSet;

#[derive(Debug, Clone)]
pub struct CapabilityRegistry {
    allowed: BTreeSet<&'static str>,
}

impl Default for CapabilityRegistry {
    fn default() -> Self {
        Self {
            allowed: BTreeSet::from([
                "Bash",
                "Edit",
                "Glob",
                "Grep",
                "LS",
                "MultiEdit",
                "NotebookEdit",
                "Read",
                "Task",
                "WebFetch",
                "Write",
                "epi_agent_help",
                "epi_core_inspect",
                "epi_core_verify",
                "epi_graph_query",
                "epi_vault_read",
            ]),
        }
    }
}

impl CapabilityRegistry {
    pub fn validate_tools(&self, tools: &[String]) -> Vec<String> {
        tools
            .iter()
            .filter(|tool| !self.is_allowed(tool))
            .map(|tool| format!("unknown tool capability `{tool}`"))
            .collect()
    }

    fn is_allowed(&self, tool: &str) -> bool {
        self.allowed.contains(tool) || tool.starts_with("mcp__")
    }
}
