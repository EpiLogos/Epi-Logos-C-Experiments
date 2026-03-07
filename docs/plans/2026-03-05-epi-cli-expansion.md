# EPI-CLI Expansion Implementation Plan

**Date:** 2026-03-05
**Status:** Ready for Implementation
**Coordinate:** S4 (CLI surface) expansion

---

## Overview

Expand the `epi` Rust CLI with three command families:
1. `epi vault` — Obsidian vault operations (obsidian-cli wrapper)
2. `epi graph` — GraphRAG operations (Parashakti port from Python to Rust)
3. `epi agent` — PI agent lifecycle (pi CLI wrapper)

---

## Phase 1: `epi vault` — Obsidian CLI Wrapper

### Dependencies
```toml
# Add to Cargo.toml
[dependencies]
serde_yaml = "0.9"  # For frontmatter parsing
```

### Implementation

**File:** `src/vault/mod.rs` (expand from 14 lines to ~300)

```rust
use clap::Subcommand;
use std::process::Command;
use serde_json::{Value, json};

#[derive(Subcommand)]
pub enum VaultCmd {
    /// Show vault connection status
    Status,
    /// Create a new note
    Create {
        note: String,
        #[arg(short, long)]
        content: Option<String>,
        #[arg(short, long)]
        vault: Option<String>,
    },
    /// Read a note
    Read {
        note: String,
        #[arg(short, long)]
        vault: Option<String>,
    },
    /// Search note titles
    Search {
        query: String,
        #[arg(short, long)]
        vault: Option<String>,
    },
    /// Search note content
    SearchContent {
        query: String,
        #[arg(short, long)]
        vault: Option<String>,
    },
    /// Create/open daily note
    Daily {
        #[arg(short, long)]
        vault: Option<String>,
    },
    /// Get YAML frontmatter
    FrontmatterGet {
        note: String,
        #[arg(short, long)]
        key: Option<String>,
        #[arg(short, long)]
        vault: Option<String>,
    },
    /// Set YAML frontmatter
    FrontmatterSet {
        note: String,
        key: String,
        value: String,
        #[arg(short, long)]
        vault: Option<String>,
    },
    /// Move/rename note (updates wikilinks)
    Move {
        note: String,
        new_path: String,
        #[arg(short, long)]
        vault: Option<String>,
    },
    /// Delete a note
    Delete {
        note: String,
        #[arg(short, long)]
        vault: Option<String>,
    },
    /// Epi-Logos: Read NOW.md
    NowRead,
    /// Epi-Logos: Write NOW.md
    NowWrite {
        content: String,
    },
}

fn obsidian_cli(args: &[&str]) -> Result<String, String> {
    let output = Command::new("obsidian-cli")
        .args(args)
        .output();

    match output {
        Ok(out) => {
            if out.status.success() {
                Ok(String::from_utf8_lossy(&out.stdout).to_string())
            } else {
                Err(String::from_utf8_lossy(&out.stderr).to_string())
            }
        }
        Err(e) => Err(format!("Failed to execute obsidian-cli: {}", e)),
    }
}

pub fn dispatch(cmd: &VaultCmd) -> Result<String, String> {
    match cmd {
        VaultCmd::Status => {
            match obsidian_cli(&["print-default"]) {
                Ok(vault) => Ok(format!("Default vault: {}", vault)),
                Err(e) => Err(e),
            }
        }

        VaultCmd::Create { note, content, vault } => {
            let mut args = vec!["create", note];
            if let Some(v) = vault { args.extend(&["-v", v]); }
            if let Some(c) = content { args.extend(&["-c", c]); }
            obsidian_cli(&args)
        }

        VaultCmd::Read { note, vault } => {
            let mut args = vec!["print", note];
            if let Some(v) = vault { args.extend(&["-v", v]); }
            obsidian_cli(&args)
        }

        VaultCmd::Search { query, vault } => {
            let mut args = vec!["search", query];
            if let Some(v) = vault { args.extend(&["-v", v]); }
            obsidian_cli(&args)
        }

        VaultCmd::SearchContent { query, vault } => {
            let mut args = vec!["search-content", query];
            if let Some(v) = vault { args.extend(&["-v", v]); }
            obsidian_cli(&args)
        }

        VaultCmd::Daily { vault } => {
            let mut args = vec!["daily"];
            if let Some(v) = vault { args.extend(&["-v", v]); }
            obsidian_cli(&args)
        }

        VaultCmd::FrontmatterGet { note, key, vault } => {
            let mut args = vec!["frontmatter", note, "--print"];
            if let Some(k) = key { args.extend(&["--key", k]); }
            if let Some(v) = vault { args.extend(&["-v", v]); }
            obsidian_cli(&args)
        }

        VaultCmd::FrontmatterSet { note, key, value, vault } => {
            let mut args = vec!["frontmatter", note, "--edit", "--key", key, "--value", value];
            if let Some(v) = vault { args.extend(&["-v", v]); }
            obsidian_cli(&args)
        }

        VaultCmd::Move { note, new_path, vault } => {
            let mut args = vec!["move", note, new_path];
            if let Some(v) = vault { args.extend(&["-v", v]); }
            obsidian_cli(&args)
        }

        VaultCmd::Delete { note, vault } => {
            let mut args = vec!["delete", note];
            if let Some(v) = vault { args.extend(&["-v", v]); }
            obsidian_cli(&args)
        }

        VaultCmd::NowRead => {
            // Direct filesystem read of NOW.md
            use std::fs;
            use std::path::PathBuf;

            let vault_root = std::env::var("EPILOGOS_VAULT")
                .unwrap_or_else(|_| "/Users/admin/Documents/Epi-Logos/Idea".to_string());
            let now_path = PathBuf::from(vault_root)
                .join("Empty")
                .join("Present")
                .join("NOW.md");

            match fs::read_to_string(&now_path) {
                Ok(content) => Ok(content),
                Err(e) => Err(format!("Failed to read NOW.md: {}", e)),
            }
        }

        VaultCmd::NowWrite { content } => {
            use std::fs;
            use std::path::PathBuf;

            let vault_root = std::env::var("EPILOGOS_VAULT")
                .unwrap_or_else(|_| "/Users/admin/Documents/Epi-Logos/Idea".to_string());
            let present_dir = PathBuf::from(vault_root)
                .join("Empty")
                .join("Present");
            let now_path = present_dir.join("NOW.md");

            // Ensure directory exists
            fs::create_dir_all(&present_dir)
                .map_err(|e| format!("Failed to create Present directory: {}", e))?;

            match fs::write(&now_path, content) {
                Ok(_) => Ok(format!("Wrote {} bytes to NOW.md", content.len())),
                Err(e) => Err(format!("Failed to write NOW.md: {}", e)),
            }
        }
    }
}
```

---

## Phase 2: `epi graph` — Parashakti GraphRAG Port

### Dependencies
```toml
[dependencies]
neo4j = "0.10"
redis = "0.25"
reqwest = { version = "0.12", features = ["json"] }
serde_yaml = "0.9"
```

### File Structure (COMPLETE — 16 Python files → 16 Rust modules)

```
src/graph/
├── mod.rs                    # Command dispatch, exports
├── types.rs                  # Shared types (NodeRef, EdgeRef, PathResult, GraphResult, RelationshipType)
├── client.rs                 # Neo4jClient port from client.py
├── mapper.rs                 # EntityMapper, path_to_labels port from mapper.py
│
├── api.rs                    # GraphAPI port from ../graph_api.py (core API)
│
├── sync.rs                   # GraphSync port from sync.py
├── sync_coordinator.rs       # SyncCoordinator port from sync_coordinator.py
├── sync_orchestrator.rs      # SyncOrchestrator port from sync_orchestrator.py
├── bidirectional_sync.rs     # BidirectionalSync port from bidirectional_sync.py
│
├── embeddings.rs             # GeminiEmbeddingClient port from embeddings.py
├── redis_cache.rs            # RedisCache port from redis_cache.py
│
├── retrieval/
│   ├── mod.rs                # Retrieval module exports
│   ├── coordinate.rs         # CoordinateRetrieval port from coordinate_retrieval.py
│   ├── graphrag.rs           # GraphRAGRetriever port from graphrag_retriever.py
│   └── hybrid.rs             # HybridRetriever port from hybrid_retrieval.py
│
├── alignment_validator.rs    # QLAlignmentValidator port from alignment_validator.py
├── coordinate_array_parser.rs # CoordinateArrayParser port from coordinate_array_parser.py
├── link_enforcement.rs       # LinkEnforcement port from link_enforcement.py
└── relationship_manager.rs   # RelationshipManager port from relationship_manager.py
```

**Python source files being ported:**
1. `../graph_api.py` (942 lines) → `api.rs`
2. `graph/client.py` → `client.rs`
3. `graph/mapper.py` → `mapper.rs`
4. `graph/sync.py` → `sync.rs`
5. `graph/sync_coordinator.py` → `sync_coordinator.rs`
6. `graph/sync_orchestrator.py` → `sync_orchestrator.py`
7. `graph/bidirectional_sync.py` → `bidirectional_sync.rs`
8. `graph/embeddings.py` → `embeddings.rs`
9. `graph/redis_cache.py` → `redis_cache.rs`
10. `graph/coordinate_retrieval.py` → `retrieval/coordinate.rs`
11. `graph/graphrag_retriever.py` → `retrieval/graphrag.rs`
12. `graph/hybrid_retrieval.py` → `retrieval/hybrid.rs`
13. `graph/alignment_validator.py` → `alignment_validator.rs`
14. `graph/coordinate_array_parser.py` → `coordinate_array_parser.rs`
15. `graph/link_enforcement.py` → `link_enforcement.rs`
16. `graph/relationship_manager.py` → `relationship_manager.rs`

### Core Types (`types.rs`)

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NodeRef {
    pub uuid: String,
    pub labels: Vec<String>,
    pub properties: serde_json::Value,
    pub file_path: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EdgeRef {
    pub source_uuid: String,
    pub target_uuid: String,
    pub rel_type: String,
    pub properties: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PathResult {
    pub nodes: Vec<NodeRef>,
    pub edges: Vec<EdgeRef>,
    pub length: usize,
    pub coordinate: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraphResult {
    pub nodes: Vec<NodeRef>,
    pub edges: Vec<EdgeRef>,
    pub coordinate: Option<NodeRef>,
    pub path: Option<Vec<PathResult>>,
    pub sync_status: Option<serde_json::Value>,
    pub query: Option<String>,
    pub execution_time_ms: Option<f64>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RelationshipType {
    Pos0LinksTo,
    Pos1Defines,
    Pos2OperatesVia,
    Pos3Instantiates,
    Pos4SituatedIn,
    Pos5IntegratesInto,
    BimbaRef,
    ThoughtType,
    Coordinate,
    InstanceOf,
}

impl RelationshipType {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Pos0LinksTo => "POS0_LINKS_TO",
            Self::Pos1Defines => "POS1_DEFINES",
            Self::Pos2OperatesVia => "POS2_OPERATES_VIA",
            Self::Pos3Instantiates => "POS3_INSTANTIATES",
            Self::Pos4SituatedIn => "POS4_SITUATED_IN",
            Self::Pos5IntegratesInto => "POS5_INTEGRATES_INTO",
            Self::BimbaRef => "BIMBA_REF",
            Self::ThoughtType => "THOUGHT_TYPE",
            Self::Coordinate => "COORDINATE",
            Self::InstanceOf => "INSTANCE_OF",
        }
    }
}
```

### Neo4j Client (`client.rs`)

```rust
use neo4j::{graph, Node, BoltType, Config, Courier};
use std::collections::HashMap;

pub struct Neo4jClient {
    courier: Courier,
}

pub struct Neo4jConfig {
    pub uri: String,
    pub user: String,
    pub password: String,
}

impl Neo4jClient {
    pub fn new(config: Neo4jConfig) -> Result<Self, Box<dyn std::error::Error>> {
        let courier = Courier::open(
            Config::new()
                .uri(&config.uri)
                .user(&config.user)
                .password(&config.password)
        )?;
        Ok(Self { courier })
    }

    pub fn run(&self, query: &str, params: HashMap<String, BoltType>) -> Result<Vec<HashMap<String, BoltType>>, Box<dyn std::error::Error>> {
        let mut result = self.courier.run(
            query,
            Some(params.into_iter().map(|(k, v)| (k, v)).collect())
        )?;

        let mut rows = Vec::new();
        while let Some(row) = result.next() {
            let row = row?;
            let mut map = HashMap::new();
            for (key, value) in row.columns() {
                map.insert(key.to_string(), value.clone());
            }
            rows.push(map);
        }
        Ok(rows)
    }
}
```

### GraphAPI (`api.rs` — core port from graph_api.py)

```rust
use super::{types::*, client::Neo4jClient};

pub struct GraphAPI {
    neo4j: Option<Neo4jClient>,
    vault_path: String,
}

impl GraphAPI {
    pub fn new(neo4j_client: Option<Neo4jClient>, vault_path: Option<String>) -> Self {
        Self {
            neo4j: neo4j_client,
            vault_path: vault_path.unwrap_or_else(||
                std::env::var("EPILOGOS_VAULT")
                    .unwrap_or("/Users/admin/Documents/Epi-Logos/Idea".to_string())
            ),
        }
    }

    // Coordinate-to-label mapping (QL-aware)
    fn coordinate_to_labels(&self, coordinate: &str) -> Vec<String> {
        match coordinate {
            "#0" => vec![":M0_Anuttara".to_string()],
            "#1" => vec![":M1_Paramasiva".to_string()],
            "#2" => vec![":M2_Parashakti".to_string()],
            "#3" => vec![":M3_Mahamaya".to_string()],
            "#4" => vec![":M4_Nara".to_string()],
            "#5" => vec![":M5_Epii".to_string()],
            _ => vec![":Entity".to_string()],
        }
    }

    pub fn query_by_coordinate(&self, coordinate: &str) -> GraphResult {
        let start = std::time::Instant::now();

        match &self.neo4j {
            Some(client) => {
                let labels = self.coordinate_to_labels(coordinate);
                let query = format!("MATCH (n:{}) RETURN n", labels.join(":"));

                match client.run(&query, std::collections::HashMap::new()) {
                    Ok(rows) => {
                        let nodes: Vec<NodeRef> = rows.into_iter().filter_map(|row| {
                            row.get("n").and_then(|n| self.node_from_bolt(n))
                        }).collect();

                        GraphResult {
                            nodes,
                            edges: Vec::new(),
                            coordinate: None,
                            path: None,
                            sync_status: None,
                            query: Some(query),
                            execution_time_ms: Some(start.elapsed().as_secs_f64() * 1000.0),
                            error: None,
                        }
                    }
                    Err(e) => GraphResult {
                        nodes: Vec::new(),
                        edges: Vec::new(),
                        query: Some(query),
                        execution_time_ms: Some(start.elapsed().as_secs_f64() * 1000.0),
                        error: Some(e.to_string()),
                        ..Default::default()
                    }
                }
            }
            None => GraphResult {
                nodes: Vec::new(),
                edges: Vec::new(),
                error: Some("Neo4j client not initialized".to_string()),
                ..Default::default()
            }
        }
    }

    fn node_from_bolt(&self, value: &BoltType) -> Option<NodeRef> {
        // Extract node data from BoltType
        // Implementation depends on neo4j crate specifics
        None // Placeholder
    }
}

impl Default for GraphResult {
    fn default() -> Self {
        Self {
            nodes: Vec::new(),
            edges: Vec::new(),
            coordinate: None,
            path: None,
            sync_status: None,
            query: None,
            execution_time_ms: None,
            error: None,
        }
    }
}
```

### Command Dispatch (`mod.rs`)

```rust
use clap::Subcommand;

#[derive(Subcommand)]
pub enum GraphCmd {
    /// Show Neo4j/Redis connection status
    Status,
    /// Query by QL coordinate (#0-#5)
    Query {
        coordinate: String,
    },
    /// Sync vault to graph
    Sync {
        path: Option<String>,
    },
    /// Coordinate-based retrieval
    Retrieve {
        coordinate: String,
        #[arg(short, long)]
        nested: bool,
    },
    /// GraphRAG retrieval
    GraphRAG {
        query: String,
        #[arg(short, long)]
        depth: Option<usize>,
    },
    /// Hybrid vector + graph retrieval
    Hybrid {
        query: String,
        #[arg(short, long)]
        top_k: Option<usize>,
    },
}

pub fn dispatch(cmd: &GraphCmd) -> Result<String, String> {
    match cmd {
        GraphCmd::Status => {
            // Check Neo4j + Redis connectivity
            Ok("Graph status: Neo4j (connecting...), Redis (connecting...)".to_string())
        }

        GraphCmd::Query { coordinate } => {
            // Use GraphAPI to query by coordinate
            Ok(format!("Querying coordinate: {}", coordinate))
        }

        GraphCmd::Sync { path } => {
            // Trigger sync coordinator
            Ok(format!("Syncing path: {:?}", path))
        }

        GraphCmd::Retrieve { coordinate, nested } => {
            // Coordinate retrieval
            Ok(format!("Retrieving {} (nested: {})", coordinate, nested))
        }

        GraphCmd::GraphRAG { query, depth } => {
            // GraphRAG retrieval
            Ok(format!("GraphRAG query: {} (depth: {:?})", query, depth))
        }

        GraphCmd::Hybrid { query, top_k } => {
            // Hybrid retrieval
            Ok(format!("Hybrid query: {} (top_k: {:?})", query, top_k))
        }
    }
}
```

---

## Phase 3: `epi agent` — PI CLI Wrapper

### Implementation

**File:** `src/agent/mod.rs` (expand from 14 lines to ~150)

```rust
use clap::Subcommand;
use std::process::Command;
use std::path::PathBuf;

#[derive(Subcommand)]
pub enum AgentCmd {
    /// Install PI agent locally
    Install,
    /// Show PI version and status
    Status,
    /// List installed extensions
    ExtensionsList,
    /// Spawn a new PI agent session
    Spawn { prompt: Option<String> },
    /// Attach to existing session
    Attach { session_id: String },
    /// Run PI command directly
    Run { args: Vec<String> },
}

fn pi_cli(args: &[&str]) -> Result<String, String> {
    let output = Command::new("pi")
        .args(args)
        .output();

    match output {
        Ok(out) => {
            if out.status.success() {
                Ok(String::from_utf8_lossy(&out.stdout).to_string())
            } else {
                Err(String::from_utf8_lossy(&out.stderr).to_string())
            }
        }
        Err(e) => Err(format!("Failed to execute pi: {}", e)),
    }
}

pub fn dispatch(cmd: &AgentCmd) -> Result<String, String> {
    match cmd {
        AgentCmd::Install => {
            // Install PI locally via npm
            let output = Command::new("npm")
                .args(["install", "-g", "@mariozechner/pi"])
                .output();

            match output {
                Ok(out) if out.status.success() => {
                    Ok(String::from_utf8_lossy(&out.stdout).to_string())
                }
                Ok(out) => {
                    Err(format!("Install failed: {}",
                        String::from_utf8_lossy(&out.stderr)))
                }
                Err(e) => Err(format!("Failed to run npm: {}", e)),
            }
        }

        AgentCmd::Status => {
            pi_cli(&["--version"])
        }

        AgentCmd::ExtensionsList => {
            pi_cli(&["extensions", "list"])
        }

        AgentCmd::Spawn { prompt } => {
            if let Some(p) = prompt {
                pi_cli(&["spawn", "--prompt", p])
            } else {
                pi_cli(&["spawn"])
            }
        }

        AgentCmd::Attach { session_id } => {
            pi_cli(&["attach", session_id])
        }

        AgentCmd::Run { args } => {
            pi_cli(&args.iter().map(|s| s.as_str()).collect::<Vec<_>>())
        }
    }
}
```


---

## Build & Test Sequence

```bash
# 1. Update dependencies
cd epi-cli
cargo add serde_yaml dirs
cargo add neo4j --optional
cargo add redis --optional

# 2. Build
cargo build --release

# 3. Test each command
./target/release/epi vault status
./target/release/epi vault search "coordinate"
./target/release/epi vault now-read

./target/release/epi graph status
./target/release/epi graph query "#2"

./target/release/epi agent status
./target/release/epi agent install
```

---

## Summary

| Phase | Files | Lines | Complexity |
|-------|-------|-------|------------|
| Vault | `src/vault/mod.rs` | ~300 | Low (CLI wrapper) |
| Graph | `src/graph/*.rs` (16 modules) | ~3500 | Medium (Python→Rust port) |
| Agent | `src/agent/mod.rs` | ~100 | Low (CLI wrapper) |
| **Total** | | **~3900** | |

**Primary work:** Phase 2 (GraphRAG port) — 16 Python modules ported to Rust while preserving QL semantics.

**Note:** PI extensions will be manually copied from `epi-claw/.pi/extensions/` to `~/.pi/extensions/` once — no command needed.
