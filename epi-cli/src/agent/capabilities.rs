//! Capability registry: maps primitive names to execution policies.
//! Used for bounded primitive validation.

use serde::{Deserialize, Serialize};

/// Execution mode for a bounded primitive.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "kebab-case")]
pub enum ExecutionMode {
    Bounded,
    Interactive,
    Background,
}

/// A registered primitive capability.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PrimitiveDef {
    pub name: String,
    pub description: String,
    pub allow_child_extension: bool,
    pub execution_mode: ExecutionMode,
}

/// The in-memory capability registry. Holds a set of known primitives.
#[derive(Debug, Clone, Default)]
pub struct CapabilityRegistry {
    primitives: Vec<PrimitiveDef>,
}

impl CapabilityRegistry {
    /// Create a registry pre-loaded with the Pleroma primitive set.
    pub fn pleroma_defaults() -> Self {
        Self {
            primitives: vec![
                PrimitiveDef {
                    name: "tmux".to_owned(),
                    description: "Terminal multiplexer session management".to_owned(),
                    allow_child_extension: true,
                    execution_mode: ExecutionMode::Interactive,
                },
                PrimitiveDef {
                    name: "cmux".to_owned(),
                    description: "Claude-managed terminal multiplexer".to_owned(),
                    allow_child_extension: true,
                    execution_mode: ExecutionMode::Interactive,
                },
                PrimitiveDef {
                    name: "mprocs".to_owned(),
                    description: "Multi-process workshop manager".to_owned(),
                    allow_child_extension: true,
                    execution_mode: ExecutionMode::Background,
                },
                PrimitiveDef {
                    name: "bkmr_kbase".to_owned(),
                    description: "Knowledge base retrieval".to_owned(),
                    allow_child_extension: false,
                    execution_mode: ExecutionMode::Bounded,
                },
                PrimitiveDef {
                    name: "onecontext".to_owned(),
                    description: "Session context management".to_owned(),
                    allow_child_extension: false,
                    execution_mode: ExecutionMode::Bounded,
                },
                PrimitiveDef {
                    name: "ralph_tui".to_owned(),
                    description: "Task orchestration TUI".to_owned(),
                    allow_child_extension: true,
                    execution_mode: ExecutionMode::Interactive,
                },
                PrimitiveDef {
                    name: "gitbutler".to_owned(),
                    description: "Virtual branch management".to_owned(),
                    allow_child_extension: false,
                    execution_mode: ExecutionMode::Bounded,
                },
                PrimitiveDef {
                    name: "worktrunk".to_owned(),
                    description: "Worktree lifecycle management".to_owned(),
                    allow_child_extension: true,
                    execution_mode: ExecutionMode::Bounded,
                },
                PrimitiveDef {
                    name: "notebooklm".to_owned(),
                    description: "Notebook query and source management".to_owned(),
                    allow_child_extension: false,
                    execution_mode: ExecutionMode::Bounded,
                },
            ],
        }
    }

    /// Look up a primitive by name.
    pub fn get(&self, name: &str) -> Option<&PrimitiveDef> {
        self.primitives.iter().find(|p| p.name == name)
    }

    /// List all registered primitive names.
    pub fn list(&self) -> Vec<&str> {
        self.primitives.iter().map(|p| p.name.as_str()).collect()
    }

    /// Register a new primitive. Returns an error if the name is already taken.
    pub fn register(&mut self, def: PrimitiveDef) -> Result<(), String> {
        if self.get(&def.name).is_some() {
            return Err(format!("primitive '{}' already registered", def.name));
        }
        self.primitives.push(def);
        Ok(())
    }
}
