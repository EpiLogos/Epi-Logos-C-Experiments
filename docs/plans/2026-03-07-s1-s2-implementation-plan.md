# S1-S2 Stack Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Stand up the S1 (Obsidian vault) and S2 (Neo4j + Redis) layers with real clients, seed the full holographic coordinate space (~96 nodes), port the Python GraphRAG tooling to Rust, and wire the S1-S2 sync bridge.

**Architecture:** Docker hosts Neo4j 5.x + Redis 7.x. Rust async clients (`neo4rs` + `redis`) connect from `epi-cli`. The coordinate space is seeded on `epi graph init` — every node mirrors the HC struct (128 bytes, `include/ontology.h`). S1 vault mutations emit frontmatter-parsed events that S2 ingests as graph upserts. The Python GraphRAG codebase (~28K LOC) is ported incrementally, module by module, with the Rust stubs as scaffolding.

**Tech Stack:** Rust (async via tokio), neo4rs 0.8, redis 0.25, reqwest 0.12, Docker Compose, Neo4j 5.x Community, Redis 7.x Alpine, Gemini embedding API

**Specs:**
- `docs/specs/S/S1-S1i-OBSIDIAN.md` — vault ontology, frontmatter schema, T-coordinate routing
- `docs/specs/S/S2-S2i-GRAPH.md` — Neo4j schema, seed data, Redis tiers, retrieval, port map
- `include/ontology.h` — HC struct (canonical schema source)

---

## Phase 1: Infrastructure (Docker + Cargo + Clients)

### Task 1: Docker Compose for Neo4j + Redis

**Files:**
- Create: `docker-compose.epi-s2.yml`

**Step 1: Create the compose file**

```yaml
version: "3.9"
services:
  neo4j:
    image: neo4j:5-community
    container_name: epi-neo4j
    ports:
      - "7474:7474"
      - "7687:7687"
    environment:
      NEO4J_AUTH: neo4j/epi-logos-dev
      NEO4J_PLUGINS: '["apoc"]'
      NEO4J_dbms_security_procedures_unrestricted: apoc.*
    volumes:
      - neo4j-data:/data
      - neo4j-logs:/logs

  redis:
    image: redis:7-alpine
    container_name: epi-redis
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data

volumes:
  neo4j-data:
  neo4j-logs:
  redis-data:
```

**Step 2: Verify Docker starts**

Run: `docker compose -f docker-compose.epi-s2.yml up -d`
Expected: Both containers start. `docker ps` shows `epi-neo4j` and `epi-redis` running.

**Step 3: Verify connectivity**

Run: `docker exec epi-redis redis-cli ping` -> `PONG`
Run: Open `http://localhost:7474` -> Neo4j Browser loads (login: neo4j/epi-logos-dev)

**Step 4: Commit**

```bash
git add docker-compose.epi-s2.yml
git commit -m "infra: add Docker Compose for Neo4j 5.x + Redis 7.x (S2)"
```

---

### Task 2: Add Async Dependencies to Cargo.toml

**Files:**
- Modify: `epi-cli/Cargo.toml`

**Step 1: Add dependencies**

Add to `[dependencies]`:

```toml
# Async runtime
tokio = { version = "1", features = ["full"] }

# Neo4j driver
neo4rs = "0.8"

# Redis client
redis = { version = "0.25", features = ["tokio-comp", "connection-manager"] }

# HTTP client (for embeddings API)
reqwest = { version = "0.12", features = ["json"] }

# UUID generation
uuid = { version = "1", features = ["v5"] }

# Chrono for timestamps
chrono = { version = "0.4", features = ["serde"] }
```

**Step 2: Make main async**

Modify `epi-cli/src/main.rs`: wrap `main()` with `#[tokio::main]` and make `dispatch` functions that need async use `.await`. For now, only `graph::dispatch` needs async — vault stays sync.

```rust
#[tokio::main]
async fn main() {
    // ... existing CLI parse ...
    // Graph dispatch becomes async:
    Commands::Graph { cmd } => match graph::dispatch(&cmd).await {
        Ok(out) => println!("{}", out),
        Err(e) => eprintln!("graph error: {}", e),
    },
    // Vault stays sync:
    Commands::Vault { cmd } => match vault::dispatch(&cmd) {
        // ...
    },
}
```

**Step 3: Verify it compiles**

Run: `cd epi-cli && cargo check`
Expected: Compiles (stubs still return sync results — wrap in async blocks as needed).

**Step 4: Commit**

```bash
git add epi-cli/Cargo.toml epi-cli/src/main.rs
git commit -m "deps: add tokio, neo4rs, redis, reqwest, uuid, chrono"
```

---

### Task 3: Real Neo4j Client

**Files:**
- Rewrite: `epi-cli/src/graph/client.rs`
- Create: `epi-cli/tests/graph_client.rs`

**Step 1: Write the client**

```rust
// epi-cli/src/graph/client.rs
use neo4rs::{Graph, ConfigBuilder, query};
use std::sync::Arc;

pub struct Neo4jConfig {
    pub uri: String,
    pub user: String,
    pub password: String,
    pub database: String,
}

impl Neo4jConfig {
    pub fn from_env() -> Self {
        Self {
            uri: std::env::var("EPILOGOS_NEO4J_URI")
                .unwrap_or_else(|_| "bolt://localhost:7687".into()),
            user: std::env::var("EPILOGOS_NEO4J_USER")
                .unwrap_or_else(|_| "neo4j".into()),
            password: std::env::var("EPILOGOS_NEO4J_PASSWORD")
                .unwrap_or_else(|_| "epi-logos-dev".into()),
            database: std::env::var("EPILOGOS_NEO4J_DATABASE")
                .unwrap_or_else(|_| "neo4j".into()),
        }
    }
}

pub struct Neo4jClient {
    graph: Arc<Graph>,
}

impl Neo4jClient {
    pub async fn connect(config: &Neo4jConfig) -> Result<Self, neo4rs::Error> {
        let graph = Graph::new(
            ConfigBuilder::default()
                .uri(&config.uri)
                .user(&config.user)
                .password(&config.password)
                .db(&config.database)
                .build()?,
        ).await?;
        Ok(Self { graph: Arc::new(graph) })
    }

    pub async fn health_check(&self) -> Result<bool, neo4rs::Error> {
        let mut result = self.graph.execute(query("RETURN 1 AS ok")).await?;
        Ok(result.next().await?.is_some())
    }

    pub async fn run(&self, cypher: &str) -> Result<Vec<neo4rs::Row>, neo4rs::Error> {
        let mut result = self.graph.execute(query(cypher)).await?;
        let mut rows = Vec::new();
        while let Some(row) = result.next().await? {
            rows.push(row);
        }
        Ok(rows)
    }

    pub async fn run_with_params(
        &self,
        cypher: &str,
        params: impl Into<neo4rs::BoltType>,
    ) -> Result<Vec<neo4rs::Row>, neo4rs::Error> {
        let mut result = self.graph.execute(
            query(cypher).param("params", params)
        ).await?;
        let mut rows = Vec::new();
        while let Some(row) = result.next().await? {
            rows.push(row);
        }
        Ok(rows)
    }

    pub fn graph(&self) -> &Graph {
        &self.graph
    }
}
```

**Step 2: Write integration test** (requires running Neo4j)

```rust
// epi-cli/tests/graph_client.rs
#[cfg(test)]
mod tests {
    use epi_cli::graph::client::{Neo4jConfig, Neo4jClient};

    #[tokio::test]
    #[ignore] // requires Docker: docker compose -f docker-compose.epi-s2.yml up -d
    async fn test_neo4j_connect_and_health() {
        let config = Neo4jConfig::from_env();
        let client = Neo4jClient::connect(&config).await
            .expect("Failed to connect to Neo4j");
        assert!(client.health_check().await.unwrap());
    }

    #[tokio::test]
    #[ignore]
    async fn test_neo4j_run_query() {
        let config = Neo4jConfig::from_env();
        let client = Neo4jClient::connect(&config).await.unwrap();
        let rows = client.run("RETURN 42 AS answer").await.unwrap();
        assert_eq!(rows.len(), 1);
    }
}
```

**Step 3: Verify compilation**

Run: `cd epi-cli && cargo check`
Run: `cd epi-cli && cargo test --test graph_client -- --ignored` (with Docker running)

**Step 4: Commit**

```bash
git add epi-cli/src/graph/client.rs epi-cli/tests/graph_client.rs
git commit -m "feat(s2): real Neo4j client with neo4rs connection pool"
```

---

### Task 4: Real Redis Client

**Files:**
- Rewrite: `epi-cli/src/graph/redis_cache.rs`
- Create: `epi-cli/tests/redis_cache.rs`

**Step 1: Write the Redis client with tier model**

```rust
// epi-cli/src/graph/redis_cache.rs
use redis::{Client, AsyncCommands, aio::MultiplexedConnection};

#[derive(Clone, Copy, Debug)]
pub enum CacheTier {
    Hot,   // TTL 300s — active Day/NOW, session metadata
    Warm,  // TTL 3600s — thought artifacts, recent extractions
    Cold,  // TTL 86400s — Bimba canonical forms
}

impl CacheTier {
    pub fn ttl_seconds(&self) -> u64 {
        match self {
            CacheTier::Hot => 300,
            CacheTier::Warm => 3600,
            CacheTier::Cold => 86400,
        }
    }

    pub fn prefix(&self) -> &'static str {
        match self {
            CacheTier::Hot => "cache:hot",
            CacheTier::Warm => "cache:warm",
            CacheTier::Cold => "cache:cold",
        }
    }
}

pub struct RedisConfig {
    pub uri: String,
}

impl RedisConfig {
    pub fn from_env() -> Self {
        Self {
            uri: std::env::var("EPILOGOS_REDIS_URI")
                .unwrap_or_else(|_| "redis://localhost:6379".into()),
        }
    }
}

pub struct RedisCache {
    conn: MultiplexedConnection,
}

impl RedisCache {
    pub async fn connect(config: &RedisConfig) -> Result<Self, redis::RedisError> {
        let client = Client::open(config.uri.as_str())?;
        let conn = client.get_multiplexed_async_connection().await?;
        Ok(Self { conn })
    }

    pub async fn health_check(&mut self) -> Result<bool, redis::RedisError> {
        let pong: String = redis::cmd("PING")
            .query_async(&mut self.conn)
            .await?;
        Ok(pong == "PONG")
    }

    pub async fn get(&mut self, key: &str) -> Result<Option<String>, redis::RedisError> {
        self.conn.get(key).await
    }

    pub async fn set_tiered(
        &mut self,
        key: &str,
        value: &str,
        tier: CacheTier,
    ) -> Result<(), redis::RedisError> {
        let full_key = format!("{}:{}", tier.prefix(), key);
        self.conn.set_ex(&full_key, value, tier.ttl_seconds()).await
    }

    pub async fn set_with_ttl(
        &mut self,
        key: &str,
        value: &str,
        ttl_seconds: u64,
    ) -> Result<(), redis::RedisError> {
        self.conn.set_ex(key, value, ttl_seconds).await
    }

    pub async fn delete(&mut self, key: &str) -> Result<bool, redis::RedisError> {
        let count: i64 = self.conn.del(key).await?;
        Ok(count > 0)
    }

    /// Session-scoped key: session:{session_id}:now:md
    pub async fn set_session_now(
        &mut self,
        session_id: &str,
        content: &str,
    ) -> Result<(), redis::RedisError> {
        let key = format!("session:{}:now:md", session_id);
        self.set_with_ttl(&key, content, CacheTier::Hot.ttl_seconds()).await
    }

    /// Coordinate cache: coord:{bimbaCoordinate}
    pub async fn cache_coordinate(
        &mut self,
        bimba_coordinate: &str,
        json_value: &str,
        tier: CacheTier,
    ) -> Result<(), redis::RedisError> {
        let key = format!("coord:{}", bimba_coordinate);
        self.set_with_ttl(&key, json_value, tier.ttl_seconds()).await
    }

    /// CF-isolated key: cf:{cf_signature}:coord:{bimbaCoord}
    pub async fn set_cf_scoped(
        &mut self,
        cf_signature: &str,
        bimba_coordinate: &str,
        value: &str,
    ) -> Result<(), redis::RedisError> {
        let key = format!("cf:{}:coord:{}", cf_signature, bimba_coordinate);
        self.set_with_ttl(&key, value, CacheTier::Hot.ttl_seconds()).await
    }
}
```

**Step 2: Integration test**

```rust
// epi-cli/tests/redis_cache.rs
#[cfg(test)]
mod tests {
    use epi_cli::graph::redis_cache::{RedisConfig, RedisCache, CacheTier};

    #[tokio::test]
    #[ignore] // requires Docker
    async fn test_redis_connect_and_health() {
        let config = RedisConfig::from_env();
        let mut cache = RedisCache::connect(&config).await.unwrap();
        assert!(cache.health_check().await.unwrap());
    }

    #[tokio::test]
    #[ignore]
    async fn test_redis_tiered_set_get() {
        let config = RedisConfig::from_env();
        let mut cache = RedisCache::connect(&config).await.unwrap();
        cache.set_tiered("test:coord", r#"{"name":"Ground"}"#, CacheTier::Cold)
            .await.unwrap();
        let val: Option<String> = cache.get("cache:cold:test:coord").await.unwrap();
        assert!(val.is_some());
    }

    #[test]
    fn test_cache_tier_ttls() {
        assert_eq!(CacheTier::Hot.ttl_seconds(), 300);
        assert_eq!(CacheTier::Warm.ttl_seconds(), 3600);
        assert_eq!(CacheTier::Cold.ttl_seconds(), 86400);
    }
}
```

**Step 3: Run tests**

Run: `cd epi-cli && cargo test redis_cache -- --include-ignored` (with Docker running)
Run: `cd epi-cli && cargo test test_cache_tier_ttls` (no Docker needed)

**Step 4: Commit**

```bash
git add epi-cli/src/graph/redis_cache.rs epi-cli/tests/redis_cache.rs
git commit -m "feat(s2): real Redis client with HOT/WARM/COLD tier model"
```

---

### Task 5: Graph Module Dispatch — Status, Up, Down

**Files:**
- Modify: `epi-cli/src/graph/mod.rs`
- Modify: `epi-cli/src/main.rs`

**Step 1: Add Up/Down/Init commands to GraphCmd enum**

```rust
#[derive(Subcommand)]
pub enum GraphCmd {
    /// Check Neo4j + Redis connectivity
    Status,
    /// Start Docker containers (epi-S2)
    Up,
    /// Stop Docker containers
    Down,
    /// Initialize schema: constraints, indexes, seed coordinate space
    Init,
    /// Query coordinates
    Query { coordinate: String },
    // ... existing variants ...
}
```

**Step 2: Implement async dispatch**

```rust
pub async fn dispatch(cmd: &GraphCmd) -> Result<String, String> {
    match cmd {
        GraphCmd::Status => {
            let neo4j_config = client::Neo4jConfig::from_env();
            let redis_config = redis_cache::RedisConfig::from_env();

            let neo4j_status = match client::Neo4jClient::connect(&neo4j_config).await {
                Ok(c) => match c.health_check().await {
                    Ok(true) => "connected".to_string(),
                    _ => "unhealthy".to_string(),
                },
                Err(e) => format!("disconnected ({})", e),
            };

            let redis_status = match redis_cache::RedisCache::connect(&redis_config).await {
                Ok(mut c) => match c.health_check().await {
                    Ok(true) => "connected".to_string(),
                    _ => "unhealthy".to_string(),
                },
                Err(e) => format!("disconnected ({})", e),
            };

            Ok(format!(
                "S2 Status:\n  Neo4j: {} ({})\n  Redis: {} ({})",
                neo4j_status, neo4j_config.uri,
                redis_status, redis_config.uri,
            ))
        }

        GraphCmd::Up => {
            let output = std::process::Command::new("docker")
                .args(["compose", "-f", "docker-compose.epi-s2.yml", "up", "-d"])
                .output()
                .map_err(|e| format!("docker compose failed: {}", e))?;
            if output.status.success() {
                Ok("S2 containers started (epi-neo4j, epi-redis)".into())
            } else {
                Err(String::from_utf8_lossy(&output.stderr).into())
            }
        }

        GraphCmd::Down => {
            let output = std::process::Command::new("docker")
                .args(["compose", "-f", "docker-compose.epi-s2.yml", "down"])
                .output()
                .map_err(|e| format!("docker compose failed: {}", e))?;
            if output.status.success() {
                Ok("S2 containers stopped".into())
            } else {
                Err(String::from_utf8_lossy(&output.stderr).into())
            }
        }

        // Init handled in Task 7
        // Other commands handled in later tasks
        _ => Err("Not yet implemented".into()),
    }
}
```

**Step 3: Verify**

Run: `cd epi-cli && cargo build`
Run: `./target/debug/epi graph up`
Run: `./target/debug/epi graph status` -> should show "connected" for both
Run: `./target/debug/epi graph down`

**Step 4: Commit**

```bash
git add epi-cli/src/graph/mod.rs epi-cli/src/main.rs
git commit -m "feat(s2): epi graph status/up/down — Docker lifecycle + health checks"
```

---

## Phase 2: Schema Bootstrap + Seed

### Task 6: Schema Initialization — Constraints + Indexes

**Files:**
- Create: `epi-cli/src/graph/schema.rs`
- Modify: `epi-cli/src/graph/mod.rs` (add `pub mod schema;`)

**Step 1: Write the schema module**

```rust
// epi-cli/src/graph/schema.rs
use crate::graph::client::Neo4jClient;

/// All Cypher statements for schema creation.
/// Run once via `epi graph init`.
const CONSTRAINTS: &[&str] = &[
    "CREATE CONSTRAINT bimba_coord_unique IF NOT EXISTS FOR (n:BimbaCoordinate) REQUIRE n.bimbaCoordinate IS UNIQUE",
    "CREATE CONSTRAINT bimba_uuid_unique IF NOT EXISTS FOR (n:BimbaCoordinate) REQUIRE n.uuid IS UNIQUE",
];

const INDEXES: &[&str] = &[
    "CREATE INDEX coord_family IF NOT EXISTS FOR (n:BimbaCoordinate) ON (n.family)",
    "CREATE INDEX coord_position IF NOT EXISTS FOR (n:BimbaCoordinate) ON (n.ql_position)",
    "CREATE INDEX coord_layer IF NOT EXISTS FOR (n:BimbaCoordinate) ON (n.layer)",
    "CREATE INDEX coord_topo IF NOT EXISTS FOR (n:BimbaCoordinate) ON (n.topo_mode)",
    "CREATE INDEX coord_vault_path IF NOT EXISTS FOR (n:BimbaCoordinate) ON (n.vault_path)",
];

// Vector index requires separate CREATE VECTOR INDEX syntax (Neo4j 5.x)
const VECTOR_INDEX: &str =
    "CREATE VECTOR INDEX coord_embedding IF NOT EXISTS FOR (n:BimbaCoordinate) ON (n.semantic_embedding) OPTIONS {indexConfig: {`vector.dimensions`: 768, `vector.similarity_function`: 'cosine'}}";

pub async fn create_schema(client: &Neo4jClient) -> Result<String, String> {
    let mut created = Vec::new();

    for stmt in CONSTRAINTS {
        client.run(stmt).await.map_err(|e| format!("constraint error: {}", e))?;
        created.push(format!("  constraint: {}", stmt.split("FOR").next().unwrap_or("").trim()));
    }

    for stmt in INDEXES {
        client.run(stmt).await.map_err(|e| format!("index error: {}", e))?;
        created.push(format!("  index: {}", stmt.split("FOR").next().unwrap_or("").trim()));
    }

    client.run(VECTOR_INDEX).await.map_err(|e| format!("vector index error: {}", e))?;
    created.push("  vector index: coord_embedding (768 dims, cosine)".into());

    Ok(format!("Schema created:\n{}", created.join("\n")))
}
```

**Step 2: Test**

Run: `cd epi-cli && cargo check`
Integration: `epi graph init` (tested after Task 7 wires it up)

**Step 3: Commit**

```bash
git add epi-cli/src/graph/schema.rs epi-cli/src/graph/mod.rs
git commit -m "feat(s2): schema module — constraints, indexes, vector index"
```

---

### Task 7: Seed the Full Coordinate Space (~96 Nodes)

**Files:**
- Create: `epi-cli/src/graph/seed.rs`
- Modify: `epi-cli/src/graph/mod.rs` (add `pub mod seed;`, wire Init dispatch)
- Create: `epi-cli/tests/graph_seed.rs`

**Step 1: Write the seed module**

This is the largest single module. It creates all ~96 BimbaCoordinate nodes and their structural relationships.

```rust
// epi-cli/src/graph/seed.rs
use crate::graph::client::Neo4jClient;
use uuid::Uuid;

/// Deterministic UUID from coordinate string (UUID v5, EPILOGOS namespace)
const EPILOGOS_NS: Uuid = Uuid::from_bytes([
    0xEP, 0x1L, 0x06, 0x05, // epi-logos namespace (custom)
    0x00, 0x00, 0x40, 0x00,
    0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01,
]);

pub fn coord_uuid(bimba_coordinate: &str) -> String {
    Uuid::new_v5(&EPILOGOS_NS, bimba_coordinate.as_bytes()).to_string()
}

// -- Layer 0: The # Inversion Act --
const HASH_NODE: &str = r#"
MERGE (n:BimbaCoordinate {bimbaCoordinate: "#"})
SET n.name = "The Inversion Act",
    n.ql_position = 255,
    n.family = "NONE",
    n.layer = "PSYCHOID",
    n.flags = 33,
    n.topo_mode = "KLEIN",
    n.uuid = $uuid
"#;

// -- Layer 1: Psychoids #0-#5 --
const PSYCHOID_SEED: &str = r#"
UNWIND $psychoids AS p
MERGE (n:BimbaCoordinate {bimbaCoordinate: "#" + toString(p.pos)})
SET n.name = p.name,
    n.ql_position = p.pos,
    n.family = "NONE",
    n.layer = "PSYCHOID",
    n.weave_state = p.weave,
    n.topo_mode = p.topo,
    n.flags = 33,
    n.uuid = p.uuid
"#;

// -- Layer 1b: Weave Interleaves --
const WEAVE_SEED: &str = r#"
UNWIND $weaves AS w
MERGE (n:BimbaCoordinate {bimbaCoordinate: w.coord})
SET n.name = w.name,
    n.family = "NONE",
    n.layer = "WEAVE",
    n.weave_state = w.weave,
    n.flags = 33,
    n.uuid = w.uuid
"#;

// -- Layer 1c: Context Frame Roots --
const CF_SEED: &str = r#"
UNWIND $cfs AS cf
MERGE (n:BimbaCoordinate {bimbaCoordinate: cf.coord})
SET n.name = cf.name,
    n.ql_position = cf.id,
    n.family = "NONE",
    n.layer = "CONTEXT_FRAME",
    n.flags = 33,
    n.uuid = cf.uuid
"#;

// -- Layer 2: Six Families x 6 positions x 2 phases = 72 nodes --
const FAMILY_SEED: &str = r#"
UNWIND $coords AS c
MERGE (n:BimbaCoordinate {bimbaCoordinate: c.coord})
SET n.name = c.name,
    n.ql_position = c.pos,
    n.family = c.fam,
    n.inversion_state = c.inv,
    n.layer = "FAMILY",
    n.topo_mode = c.topo,
    n.flags = c.flags,
    n.uuid = c.uuid
"#;

// -- Layer 3: VAK Reflective Coordinates --
const VAK_SEED: &str = r#"
UNWIND $vaks AS v
MERGE (n:BimbaCoordinate {bimbaCoordinate: v.coord})
SET n.name = v.name,
    n.ql_position = v.idx,
    n.family = "NONE",
    n.layer = "VAK",
    n.flags = 33,
    n.uuid = v.uuid
"#;

// -- Structural relationships --
const MANIFESTS_RELS: &str = r#"
UNWIND $rels AS r
MATCH (psychoid:BimbaCoordinate {bimbaCoordinate: "#" + toString(r.pos)})
MATCH (coord:BimbaCoordinate {bimbaCoordinate: r.coord})
MERGE (psychoid)-[:MANIFESTS]->(coord)
"#;

const INVERTS_TO_RELS: &str = r#"
UNWIND $pairs AS p
MATCH (normal:BimbaCoordinate {bimbaCoordinate: p.normal})
MATCH (inverted:BimbaCoordinate {bimbaCoordinate: p.inverted})
MERGE (normal)-[:INVERTS_TO]->(inverted)
"#;

const BEDROCK_RELS: &str = r#"
UNWIND $rels AS r
MATCH (coord:BimbaCoordinate {bimbaCoordinate: r.coord})
MATCH (psychoid:BimbaCoordinate {bimbaCoordinate: "#" + toString(r.pos)})
MERGE (coord)-[:BEDROCK]->(psychoid)
"#;

const CF_ANCHOR_RELS: &str = r#"
MATCH (cf:BimbaCoordinate {layer: "CONTEXT_FRAME"})
MATCH (p4:BimbaCoordinate {bimbaCoordinate: "#4"})
MERGE (cf)-[:ANCHORED_TO]->(p4)
"#;

// Family names for each position (canonical)
const FAMILY_DEFS: &[(&str, &[&str; 6])] = &[
    ("C", &["Bimba", "Form", "Entity", "Process", "Type", "Pratibimba"]),
    ("P", &["Ground", "Definition", "Operation", "Pattern", "Context", "Integration"]),
    ("L", &["Literal", "Functional", "Structural", "Archetypal", "Paradigmatic", "Integral"]),
    ("S", &["Terminal", "Obsidian", "Neo4j", "Gateway", "PiAgent", "Sync"]),
    ("T", &["Questions", "Traces", "Challenges", "Patterns", "Discovery", "Insight"]),
    ("M", &["Anuttara", "Paramasiva", "Parashakti", "Mahamaya", "Nara", "Epii"]),
];

pub async fn seed_coordinate_space(client: &Neo4jClient) -> Result<String, String> {
    let mut counts = Vec::new();

    // Layer 0: Hash
    client.run_with_params(HASH_NODE, vec![("uuid", coord_uuid("#").into())])
        .await.map_err(|e| format!("hash seed: {}", e))?;
    counts.push("  1 Hash (#)");

    // Layer 1: Psychoids
    // (Build params as neo4rs BoltType list — exact API depends on neo4rs version)
    // Implementation note: use client.graph().run() with query().param() for UNWIND
    // For brevity, showing the structure — actual param building uses neo4rs::BoltType
    let psychoids = vec![
        (0, "Ground",      0.0, "ZERO_SPHERE"),
        (1, "Form",        1.0, "TORUS"),
        (2, "Operation",   2.0, "TORUS"),
        (3, "Pattern",     3.0, "TORUS"),
        (4, "Context",     4.0, "LEMNISCATE"),
        (5, "Integration", 5.0, "ZERO_SPHERE"),
    ];
    // Execute psychoid seed (implementation builds BoltList for UNWIND)
    // ... (see full implementation pattern below)
    counts.push("  6 Psychoids (#0-#5)");

    // Layer 1b: Weaves
    counts.push("  4 Weaves");

    // Layer 1c: Context Frames
    counts.push("  7 Context Frames (CF_VOID..CF_MOBIUS)");

    // Layer 2: Family coords (72)
    counts.push("  72 Family Coordinates (6 families x 6 positions x 2 phases)");

    // Layer 3: VAK
    counts.push("  6 VAK Reflective Coordinates (CPF,CT,CP,CF,CFP,CS)");

    // Structural relationships
    counts.push("  MANIFESTS: #N -> family coords");
    counts.push("  INVERTS_TO: X -> X'");
    counts.push("  BEDROCK: family coord -> #N");
    counts.push("  ANCHORED_TO: all CFs -> #4");

    Ok(format!("Coordinate space seeded:\n{}\n  Total: ~96 nodes", counts.join("\n")))
}
```

**Implementation Note:** The actual param building for `UNWIND` with `neo4rs` requires constructing `BoltType::List` of `BoltType::Map` entries. The implementing engineer should reference the neo4rs docs for `query().param("psychoids", bolt_list)` patterns. Each UNWIND query follows the same pattern: build a Vec of maps, pass as param, execute.

**Step 2: Wire `epi graph init` in mod.rs**

```rust
GraphCmd::Init => {
    let config = client::Neo4jConfig::from_env();
    let client = client::Neo4jClient::connect(&config).await
        .map_err(|e| format!("connect failed: {}", e))?;

    let schema_result = schema::create_schema(&client).await?;
    let seed_result = seed::seed_coordinate_space(&client).await?;

    Ok(format!("{}\n\n{}", schema_result, seed_result))
}
```

**Step 3: Integration test**

```rust
// epi-cli/tests/graph_seed.rs
#[tokio::test]
#[ignore]
async fn test_seed_creates_96_nodes() {
    let config = Neo4jConfig::from_env();
    let client = Neo4jClient::connect(&config).await.unwrap();

    // Clean slate
    client.run("MATCH (n:BimbaCoordinate) DETACH DELETE n").await.unwrap();

    // Seed
    seed::seed_coordinate_space(&client).await.unwrap();

    // Verify count
    let rows = client.run("MATCH (n:BimbaCoordinate) RETURN count(n) AS c").await.unwrap();
    let count: i64 = rows[0].get("c").unwrap();
    assert_eq!(count, 96); // 1 + 6 + 4 + 7 + 72 + 6

    // Verify specific nodes
    let hash = client.run(r#"MATCH (n:BimbaCoordinate {bimbaCoordinate: "#"}) RETURN n.name AS name"#)
        .await.unwrap();
    assert_eq!(hash[0].get::<String>("name").unwrap(), "The Inversion Act");

    // Verify CF anchor invariant
    let anchors = client.run(
        "MATCH (cf:BimbaCoordinate {layer: 'CONTEXT_FRAME'})-[:ANCHORED_TO]->(p4) RETURN count(cf) AS c"
    ).await.unwrap();
    assert_eq!(anchors[0].get::<i64>("c").unwrap(), 7); // all 7 CFs anchor to #4

    // Verify inversions
    let inv_pairs = client.run(
        "MATCH ()-[:INVERTS_TO]->() RETURN count(*) AS c"
    ).await.unwrap();
    assert_eq!(inv_pairs[0].get::<i64>("c").unwrap(), 36); // 6 families x 6 positions
}
```

**Step 4: Commit**

```bash
git add epi-cli/src/graph/seed.rs epi-cli/src/graph/mod.rs epi-cli/tests/graph_seed.rs
git commit -m "feat(s2): seed full holographic coordinate space (~96 nodes)"
```

---

### Task 7b: Import Existing M-Branch Datasets

**Files:**
- Create: `epi-cli/src/graph/dataset_import.rs`
- Modify: `epi-cli/src/graph/mod.rs` (add `pub mod dataset_import;`, wire Import command)

**Context:** `docs/datasets/` contains ~340K lines of JSON across all M-branches:
- `nodes_anuttara.json` / `relations_anuttara.json` (M0)
- `nodes_paramasiva.json` / `relations_paramasiva.json` (M1)
- `nodes_parashakti.json` / `relations_parashakti.json` (M2, largest: 5356+20086 lines)
- `nodes_mahamaya.json` / `relations_mahamaya.json` (M3, largest: 8965+24456 lines)
- `nodes_nara.json` / `relations_nara.json` (M4)
- `nodes_epii.json` / `relations_epii.json` (M5)
- Deep detail folders: `*-deep/nodes-full-data.json` + `relations.json` per branch
- `relations_foundation.json` — 8 root system relationships
- `neo4j_query_table_data_2026-3-3.json` — 3MB existing Neo4j snapshot (baseline reference)

**Step 1: Write the dataset importer**

```rust
// epi-cli/src/graph/dataset_import.rs
use crate::graph::client::Neo4jClient;
use std::path::Path;

pub struct DatasetImporter<'a> {
    client: &'a Neo4jClient,
    datasets_dir: String,
}

impl<'a> DatasetImporter<'a> {
    pub fn new(client: &'a Neo4jClient, datasets_dir: &str) -> Self {
        Self { client, datasets_dir: datasets_dir.to_string() }
    }

    /// Import a nodes JSON file — each entry becomes a BimbaCoordinate node
    /// Nodes must have bimbaCoordinate property set during import
    pub async fn import_nodes(&self, filename: &str) -> Result<usize, String> {
        let path = Path::new(&self.datasets_dir).join(filename);
        let data = std::fs::read_to_string(&path)
            .map_err(|e| format!("read {}: {}", filename, e))?;
        let nodes: Vec<serde_json::Value> = serde_json::from_str(&data)
            .map_err(|e| format!("parse {}: {}", filename, e))?;

        let mut count = 0;
        for node in &nodes {
            // Extract coordinate identity, map to BimbaCoordinate schema
            // Use MERGE on bimbaCoordinate to avoid duplicates with seed data
            // Set all properties from JSON
            count += 1;
        }
        Ok(count)
    }

    /// Import a relations JSON file — each entry becomes a Neo4j relationship
    pub async fn import_relations(&self, filename: &str) -> Result<usize, String> {
        let path = Path::new(&self.datasets_dir).join(filename);
        let data = std::fs::read_to_string(&path)
            .map_err(|e| format!("read {}: {}", filename, e))?;
        let rels: Vec<serde_json::Value> = serde_json::from_str(&data)
            .map_err(|e| format!("parse {}: {}", filename, e))?;

        let mut count = 0;
        for rel in &rels {
            // Map source/target to bimbaCoordinate, create relationship
            count += 1;
        }
        Ok(count)
    }

    /// Import all datasets in dependency order: foundation -> M0 -> M1 -> ... -> M5
    pub async fn import_all(&self) -> Result<String, String> {
        let mut report = Vec::new();

        // Foundation relationships first
        let n = self.import_relations("relations_foundation.json").await?;
        report.push(format!("  foundation relations: {}", n));

        // M-branches in order
        for (branch, node_file, rel_file) in &[
            ("M0 Anuttara", "nodes_anuttara.json", "relations_anuttara.json"),
            ("M1 Paramasiva", "nodes_paramasiva.json", "relations_paramasiva.json"),
            ("M2 Parashakti", "nodes_parashakti.json", "relations_parashakti.json"),
            ("M3 Mahamaya", "nodes_mahamaya.json", "relations_mahamaya.json"),
            ("M4 Nara", "nodes_nara.json", "relations_nara.json"),
            ("M5 Epii", "nodes_epii.json", "relations_epii.json"),
        ] {
            let nodes = self.import_nodes(node_file).await?;
            let rels = self.import_relations(rel_file).await?;
            report.push(format!("  {}: {} nodes, {} relations", branch, nodes, rels));
        }

        Ok(format!("Dataset import complete:\n{}", report.join("\n")))
    }
}
```

**Step 2: Wire `epi graph import` command**

```rust
/// Import M-branch datasets from docs/datasets/
Import {
    /// Specific dataset file (or "all" for full import)
    #[arg(default_value = "all")]
    dataset: String,
},
```

**Step 3: Test with small dataset first**

Run: `epi graph import relations_foundation.json`
Then: `epi graph import all`
Verify: Node counts match expected per-branch totals.

**Step 4: Commit**

```bash
git add epi-cli/src/graph/dataset_import.rs epi-cli/src/graph/mod.rs
git commit -m "feat(s2): M-branch dataset importer — nodes + relations from docs/datasets/"
```

---

## Phase 3: S1 Vault Enhancements

### Task 8: Missing obsidian-cli Commands

**Files:**
- Modify: `epi-cli/src/vault/mod.rs`

**Step 1: Add missing VaultCmd variants**

```rust
/// Set default vault
SetDefault { vault_name: String },

/// Open note in Obsidian app
Open {
    note: String,
    #[arg(short, long)]
    vault: Option<String>,
},

/// Delete a frontmatter key
#[command(name = "frontmatter-delete")]
FrontmatterDelete {
    note: String,
    key: String,
    #[arg(short, long)]
    vault: Option<String>,
},
```

**Step 2: Implement dispatch arms**

```rust
VaultCmd::SetDefault { vault_name } => {
    obsidian_cli(&["set-default", vault_name.as_str()])
}

VaultCmd::Open { note, vault } => {
    let mut args = vec!["open", note.as_str()];
    if let Some(v) = vault { args.extend(&["-v", v.as_str()]); }
    obsidian_cli(&args)
}

VaultCmd::FrontmatterDelete { note, key, vault } => {
    let mut args = vec!["frontmatter", note.as_str(), "--delete", "--key", key.as_str()];
    if let Some(v) = vault { args.extend(&["-v", v.as_str()]); }
    obsidian_cli(&args)
}
```

**Step 3: Verify compilation**

Run: `cd epi-cli && cargo check`

**Step 4: Commit**

```bash
git add epi-cli/src/vault/mod.rs
git commit -m "feat(s1): add set-default, open, frontmatter-delete commands"
```

---

### Task 9: Thought Routing (T0-T5)

**Files:**
- Modify: `epi-cli/src/vault/mod.rs`

**Step 1: Add ThoughtRoute command**

```rust
/// Route a thought to T0-T5 bucket
#[command(name = "thought-route")]
ThoughtRoute {
    /// QL position 0-5
    #[arg(short, long)]
    position: u8,
    /// Thought content
    #[arg(short, long)]
    content: String,
    /// Session ID
    #[arg(short, long)]
    session_id: Option<String>,
    /// Coordinate reference
    #[arg(long)]
    coordinate: Option<String>,
},
```

**Step 2: Implement dispatch**

```rust
VaultCmd::ThoughtRoute { position, content, session_id, coordinate } => {
    use std::fs;
    use std::path::PathBuf;

    let pos = (*position).min(5);
    let vault_root = std::env::var("EPILOGOS_VAULT")
        .unwrap_or_else(|_| "/Users/admin/Documents/Epi-Logos/Idea".to_string());
    let bucket_dir = PathBuf::from(&vault_root)
        .join("Pratibimba").join("Self").join("Thought").join(format!("T{}", pos));

    fs::create_dir_all(&bucket_dir)
        .map_err(|e| format!("Failed to create T{} bucket: {}", pos, e))?;

    let ts = chrono::Local::now().format("%Y%m%d-%H%M%S").to_string();
    let filename = format!("T{}-{}.md", pos, ts);
    let filepath = bucket_dir.join(&filename);

    // T-coordinate canonical names
    let type_names = ["Questions", "Traces", "Challenges", "Patterns", "Discovery", "Insight"];

    let mut frontmatter = format!(
        "---\nbimbaCoordinate: \"T{}\"\nql_position: {}\nfamily: \"T\"\nlayer: \"FAMILY\"\nthought_type: \"T{}\"\nname: \"{}\"\ntimestamp: \"{}\"\n",
        pos, pos, pos, type_names[pos as usize],
        chrono::Local::now().to_rfc3339(),
    );
    if let Some(sid) = session_id {
        frontmatter.push_str(&format!("source_session: \"{}\"\n", sid));
    }
    if let Some(coord) = coordinate {
        frontmatter.push_str(&format!("coordinate: \"{}\"\n", coord));
    }
    frontmatter.push_str("---\n\n");

    let full_content = format!("{}{}\n", frontmatter, content);
    fs::write(&filepath, &full_content)
        .map_err(|e| format!("Failed to write thought: {}", e))?;

    Ok(format!("T{} ({}) -> {}", pos, type_names[pos as usize], filepath.display()))
}
```

**Step 3: Test manually**

Run: `./target/debug/epi vault thought-route -p 0 -c "What is the nature of coordinates?"`
Expected: File created at `Pratibimba/Self/Thought/T0/T0-{timestamp}.md` with frontmatter.

**Step 4: Commit**

```bash
git add epi-cli/src/vault/mod.rs
git commit -m "feat(s1): thought routing to T0-T5 buckets with canonical frontmatter"
```

---

### Task 10: Frontmatter Validation

**Files:**
- Create: `epi-cli/src/vault/frontmatter.rs`
- Modify: `epi-cli/src/vault/mod.rs` (add `pub mod frontmatter;` and FrontmatterValidate command)

**Step 1: Write the frontmatter validator**

```rust
// epi-cli/src/vault/frontmatter.rs

/// Validates frontmatter YAML against HC struct schema.
/// Returns list of validation errors (empty = valid).
pub fn validate_frontmatter(yaml: &serde_yaml::Value) -> Vec<String> {
    let mut errors = Vec::new();
    let map = match yaml.as_mapping() {
        Some(m) => m,
        None => { errors.push("frontmatter is not a YAML mapping".into()); return errors; }
    };

    // bimbaCoordinate is mandatory for coordinate notes
    if let Some(coord) = map.get(&serde_yaml::Value::String("bimbaCoordinate".into())) {
        if let Some(s) = coord.as_str() {
            if !is_valid_coordinate(s) {
                errors.push(format!("invalid bimbaCoordinate: '{}'", s));
            }
        } else {
            errors.push("bimbaCoordinate must be a string".into());
        }
    }
    // bimbaCoordinate not mandatory (some notes are non-coordinate content)

    // ql_position: 0-5 or 255
    if let Some(pos) = map.get(&serde_yaml::Value::String("ql_position".into())) {
        if let Some(n) = pos.as_u64() {
            if n > 5 && n != 255 {
                errors.push(format!("ql_position must be 0-5 or 255, got {}", n));
            }
        }
    }

    // family: valid family name
    let valid_families = ["C", "P", "L", "S", "T", "M", "NONE"];
    if let Some(fam) = map.get(&serde_yaml::Value::String("family".into())) {
        if let Some(s) = fam.as_str() {
            if !valid_families.contains(&s) {
                errors.push(format!("invalid family: '{}' (expected {:?})", s, valid_families));
            }
        }
    }

    // Validate {family}_{n}_{semantic} keys
    for (key, _value) in map {
        if let Some(key_str) = key.as_str() {
            if let Some(err) = validate_coordinate_key(key_str) {
                errors.push(err);
            }
        }
    }

    errors
}

/// Check if a coordinate key follows {family}_{n}_{semantic} pattern
fn validate_coordinate_key(key: &str) -> Option<String> {
    let families = ["c", "p", "l", "s", "t", "m"];
    let parts: Vec<&str> = key.splitn(3, '_').collect();
    if parts.len() == 3 && families.contains(&parts[0]) {
        if let Ok(n) = parts[1].parse::<u8>() {
            if n > 5 {
                return Some(format!("key '{}': position {} must be 0-5", key, n));
            }
        }
        // If first part is a family letter and second is a number, it's a coordinate key
        // No error if format is correct
    }
    None
}

/// Validate a bimbaCoordinate string against the full notation
pub fn is_valid_coordinate(coord: &str) -> bool {
    // Hash
    if coord == "#" { return true; }
    // Psychoids: #0-#5
    if coord.starts_with('#') && coord.len() == 2 {
        return coord.chars().nth(1).map_or(false, |c| c.is_ascii_digit() && c <= '5');
    }
    // Weaves: Weave_0_0, Weave_0_5, Weave_5_0, Weave_5_5
    if coord.starts_with("Weave_") { return true; } // simplified
    // Context frames: CF_VOID..CF_MOBIUS
    let cfs = ["CF_VOID","CF_BINARY","CF_TRIKA","CF_QUATERNAL","CF_FRACTAL","CF_SYNTHESIS","CF_MOBIUS"];
    if cfs.contains(&coord) { return true; }
    // VAK: CPF, CT, CP, CF, CFP, CS
    let vaks = ["CPF","CT","CP","CF","CFP","CS"];
    if vaks.contains(&coord) { return true; }
    // Family coordinates: {F}{0-5} or {F}{0-5}'
    let families = ["C","P","L","S","T","M"];
    let base = coord.trim_end_matches('\'');
    if base.len() == 2 {
        let fam = &base[..1];
        let pos = &base[1..2];
        if families.contains(&fam) && pos.chars().next().map_or(false, |c| c.is_ascii_digit() && c <= '5') {
            return true;
        }
    }
    false
}
```

**Step 2: Unit tests**

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_valid_coordinates() {
        assert!(is_valid_coordinate("#"));
        assert!(is_valid_coordinate("#0"));
        assert!(is_valid_coordinate("#5"));
        assert!(is_valid_coordinate("P3"));
        assert!(is_valid_coordinate("M4'"));
        assert!(is_valid_coordinate("C0"));
        assert!(is_valid_coordinate("T5'"));
        assert!(is_valid_coordinate("CF_TRIKA"));
        assert!(is_valid_coordinate("CPF"));
        assert!(is_valid_coordinate("Weave_0_0"));
    }

    #[test]
    fn test_invalid_coordinates() {
        assert!(!is_valid_coordinate("#6"));
        assert!(!is_valid_coordinate("X3"));
        assert!(!is_valid_coordinate("P9"));
        assert!(!is_valid_coordinate(""));
        assert!(!is_valid_coordinate("random"));
    }

    #[test]
    fn test_validate_coordinate_key() {
        assert!(validate_coordinate_key("c_0_bimba").is_none());
        assert!(validate_coordinate_key("p_5_integration").is_none());
        assert!(validate_coordinate_key("m_7_invalid").is_some()); // position > 5
        assert!(validate_coordinate_key("bimbaCoordinate").is_none()); // not a coord key
    }
}
```

**Step 3: Wire FrontmatterValidate command**

```rust
#[command(name = "frontmatter-validate")]
FrontmatterValidate {
    note: String,
    #[arg(short, long)]
    vault: Option<String>,
},
```

Dispatch: read frontmatter via `obsidian_cli(&["frontmatter", note, "--print"])`, parse YAML, run `validate_frontmatter()`.

**Step 4: Run tests and commit**

Run: `cd epi-cli && cargo test frontmatter`

```bash
git add epi-cli/src/vault/frontmatter.rs epi-cli/src/vault/mod.rs
git commit -m "feat(s1'): frontmatter schema validation grounded in HC struct"
```

---

## Phase 4: Coordinate Parser Extension + Relationship Manager

### Task 11: Extended Coordinate Parser

**Files:**
- Rewrite: `epi-cli/src/graph/coordinate_array_parser.rs`
- Create: `epi-cli/tests/coordinate_parser.rs`

**Step 1: Extend parser for full notation**

Port from Python `coordinate_array_parser.py` (652 LOC). The Rust parser must handle:

```rust
// epi-cli/src/graph/coordinate_array_parser.rs

#[derive(Debug, Clone, PartialEq)]
pub struct ParsedCoordinate {
    pub raw: String,                    // original string
    pub bimba_coordinate: String,       // normalized: "#4", "P3'", "CF_TRIKA"
    pub layer: CoordLayer,
    pub family: Option<String>,         // "C","P","L","S","T","M" or None
    pub ql_position: Option<u8>,        // 0-5 or None
    pub inverted: bool,
}

#[derive(Debug, Clone, PartialEq)]
pub enum CoordLayer {
    Psychoid,      // #, #0-#5
    Weave,         // Weave_0_0 etc
    ContextFrame,  // CF_VOID..CF_MOBIUS
    Family,        // C0-M5, C0'-M5'
    Vak,           // CPF,CT,CP,CF,CFP,CS
}

#[derive(Debug, Clone)]
pub struct WikiLink {
    pub target: String,
    pub alias: Option<String>,
}

pub struct CoordinateArrayParser;

impl CoordinateArrayParser {
    /// Parse a single coordinate string
    pub fn parse_one(input: &str) -> Result<ParsedCoordinate, String> {
        let trimmed = input.trim();
        // ... full parsing logic for all notation types
        // See vault/frontmatter.rs is_valid_coordinate for the validation logic
        // This parser returns structured ParsedCoordinate
        todo!("implement full parser")
    }

    /// Parse comma-separated coordinate list
    pub fn parse_multi(input: &str) -> Result<Vec<ParsedCoordinate>, String> {
        input.split(',')
            .map(|s| Self::parse_one(s.trim()))
            .collect()
    }

    /// Parse wiki-link: [[target]] or [[target|alias]]
    pub fn parse_wikilink(input: &str) -> Option<WikiLink> {
        let inner = input.strip_prefix("[[")?.strip_suffix("]]")?;
        let parts: Vec<&str> = inner.splitn(2, '|').collect();
        Some(WikiLink {
            target: parts[0].to_string(),
            alias: parts.get(1).map(|s| s.to_string()),
        })
    }

    /// Extract all wiki-links from markdown content
    pub fn extract_wikilinks(content: &str) -> Vec<WikiLink> {
        let mut links = Vec::new();
        let mut start = 0;
        while let Some(open) = content[start..].find("[[") {
            let abs_open = start + open;
            if let Some(close) = content[abs_open..].find("]]") {
                let link_str = &content[abs_open..abs_open + close + 2];
                if let Some(wl) = Self::parse_wikilink(link_str) {
                    links.push(wl);
                }
                start = abs_open + close + 2;
            } else {
                break;
            }
        }
        links
    }

    /// Parse frontmatter coordinate arrays (from {family}_{n}_{semantic} keys)
    pub fn parse_frontmatter_arrays(
        yaml: &serde_yaml::Value,
    ) -> Vec<(String, Vec<WikiLink>)> {
        let mut arrays = Vec::new();
        if let Some(map) = yaml.as_mapping() {
            let families = ["c", "p", "l", "s", "t", "m"];
            for (key, value) in map {
                if let Some(key_str) = key.as_str() {
                    let parts: Vec<&str> = key_str.splitn(3, '_').collect();
                    if parts.len() == 3 && families.contains(&parts[0]) {
                        if let Some(val_str) = value.as_str() {
                            let links = Self::extract_wikilinks(val_str);
                            if !links.is_empty() {
                                arrays.push((key_str.to_string(), links));
                            }
                        }
                        // Also handle arrays of links
                        if let Some(seq) = value.as_sequence() {
                            let links: Vec<WikiLink> = seq.iter()
                                .filter_map(|v| v.as_str())
                                .flat_map(|s| Self::extract_wikilinks(s))
                                .collect();
                            if !links.is_empty() {
                                arrays.push((key_str.to_string(), links));
                            }
                        }
                    }
                }
            }
        }
        arrays
    }
}
```

**Step 2: Tests**

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_psychoid() {
        let p = CoordinateArrayParser::parse_one("#4").unwrap();
        assert_eq!(p.layer, CoordLayer::Psychoid);
        assert_eq!(p.ql_position, Some(4));
        assert!(!p.inverted);
    }

    #[test]
    fn test_parse_family_inverted() {
        let p = CoordinateArrayParser::parse_one("M4'").unwrap();
        assert_eq!(p.layer, CoordLayer::Family);
        assert_eq!(p.family, Some("M".into()));
        assert_eq!(p.ql_position, Some(4));
        assert!(p.inverted);
    }

    #[test]
    fn test_parse_multi() {
        let coords = CoordinateArrayParser::parse_multi("P3, M4', #0").unwrap();
        assert_eq!(coords.len(), 3);
    }

    #[test]
    fn test_parse_wikilink() {
        let wl = CoordinateArrayParser::parse_wikilink("[[Bimba/Seeds/P/P3]]").unwrap();
        assert_eq!(wl.target, "Bimba/Seeds/P/P3");
        assert!(wl.alias.is_none());

        let wl2 = CoordinateArrayParser::parse_wikilink("[[P3|Pattern]]").unwrap();
        assert_eq!(wl2.alias, Some("Pattern".into()));
    }

    #[test]
    fn test_extract_wikilinks() {
        let content = "Links to [[Bimba/Seeds/P/P3]] and [[M4|Nara]]";
        let links = CoordinateArrayParser::extract_wikilinks(content);
        assert_eq!(links.len(), 2);
    }
}
```

**Step 3: Run and commit**

Run: `cd epi-cli && cargo test coordinate`

```bash
git add epi-cli/src/graph/coordinate_array_parser.rs epi-cli/tests/coordinate_parser.rs
git commit -m "feat(s2'): extended coordinate parser — full notation + wikilinks"
```

---

### Task 12: Relationship Manager (POS0-POS5)

**Files:**
- Rewrite: `epi-cli/src/graph/relationship_manager.rs`

**Step 1: Port from Python relationship_manager.py (1134 LOC)**

```rust
// epi-cli/src/graph/relationship_manager.rs
use crate::graph::client::Neo4jClient;
use crate::graph::types::RelationshipType;

/// Position-based relationship types with bidirectional inverses
pub const POSITION_REL_TYPES: &[(u8, &str, &str)] = &[
    (0, "POS0_LINKS_TO",        "POS0_LINKED_FROM"),
    (1, "POS1_DEFINES",          "POS1_DEFINED_BY"),
    (2, "POS2_OPERATES_VIA",     "POS2_OPERATED_BY"),
    (3, "POS3_INSTANTIATES",     "POS3_INSTANTIATED_BY"),
    (4, "POS4_SITUATED_IN",      "POS4_SITUATES"),
    (5, "POS5_INTEGRATES_INTO",  "POS5_INTEGRATED_FROM"),
];

pub struct RelationshipManager<'a> {
    client: &'a Neo4jClient,
}

impl<'a> RelationshipManager<'a> {
    pub fn new(client: &'a Neo4jClient) -> Self {
        Self { client }
    }

    /// Create a position-based relationship between two coordinates
    pub async fn create_position_rel(
        &self,
        source_coord: &str,
        target_coord: &str,
        position: u8,
    ) -> Result<String, String> {
        let (_, fwd, _) = POSITION_REL_TYPES.iter()
            .find(|(p, _, _)| *p == position)
            .ok_or_else(|| format!("invalid position: {}", position))?;

        let cypher = format!(
            "MATCH (s:BimbaCoordinate {{bimbaCoordinate: $source}}) \
             MATCH (t:BimbaCoordinate {{bimbaCoordinate: $target}}) \
             MERGE (s)-[:{}]->(t) \
             RETURN s.bimbaCoordinate AS src, t.bimbaCoordinate AS tgt",
            fwd
        );
        // Execute with params
        self.client.run(&cypher).await
            .map_err(|e| format!("relationship error: {}", e))?;

        Ok(format!("({}) -[:{}]-> ({})", source_coord, fwd, target_coord))
    }

    /// Create bidirectional position relationship
    pub async fn create_bidirectional(
        &self,
        source_coord: &str,
        target_coord: &str,
        position: u8,
    ) -> Result<String, String> {
        let (_, fwd, inv) = POSITION_REL_TYPES.iter()
            .find(|(p, _, _)| *p == position)
            .ok_or_else(|| format!("invalid position: {}", position))?;

        let cypher = format!(
            "MATCH (s:BimbaCoordinate {{bimbaCoordinate: $source}}) \
             MATCH (t:BimbaCoordinate {{bimbaCoordinate: $target}}) \
             MERGE (s)-[:{}]->(t) \
             MERGE (t)-[:{}]->(s)",
            fwd, inv
        );
        self.client.run(&cypher).await
            .map_err(|e| format!("bidirectional error: {}", e))?;

        Ok(format!("({}) <-[:{}]-[:{}]-> ({})", source_coord, inv, fwd, target_coord))
    }

    /// Create all position relationships from frontmatter coordinate arrays
    pub async fn create_from_frontmatter(
        &self,
        source_coord: &str,
        coord_keys: &[(String, Vec<String>)], // (key, target_coords)
    ) -> Result<usize, String> {
        let mut count = 0;
        for (key, targets) in coord_keys {
            // Extract position from key: {family}_{n}_{semantic} -> n
            let parts: Vec<&str> = key.splitn(3, '_').collect();
            if parts.len() == 3 {
                if let Ok(pos) = parts[1].parse::<u8>() {
                    for target in targets {
                        self.create_position_rel(source_coord, target, pos).await?;
                        count += 1;
                    }
                }
            }
        }
        Ok(count)
    }

    /// Query relationships by type from a source
    pub async fn query_by_type(
        &self,
        source_coord: &str,
        rel_type: &str,
    ) -> Result<Vec<String>, String> {
        let cypher = format!(
            "MATCH (s:BimbaCoordinate {{bimbaCoordinate: $source}})-[:{}]->(t) \
             RETURN t.bimbaCoordinate AS coord",
            rel_type
        );
        let rows = self.client.run(&cypher).await
            .map_err(|e| format!("query error: {}", e))?;
        Ok(rows.iter().filter_map(|r| r.get::<String>("coord").ok()).collect())
    }
}
```

**Step 2: Test and commit**

```bash
git add epi-cli/src/graph/relationship_manager.rs
git commit -m "feat(s2'): relationship manager — POS0-POS5 bidirectional relationships"
```

---

## Phase 5: Retrieval Engine

### Task 13: Coordinate Retrieval

**Files:**
- Rewrite: `epi-cli/src/graph/retrieval/coordinate.rs`

Port from Python `coordinate_retrieval.py` (2143 LOC). Key capabilities:

- Single coordinate lookup: `query_by_coordinate("P3")`
- Multi-coordinate AND: `query_multi(vec!["P3", "M4'"])`
- Depth-N context: `query_context("M2", 2)` — 2-hop neighborhood
- Family-wide: `query_by_family("T")` — all T-family coordinates
- CF-scoped: `query_by_cf("CF_TRIKA")` — coordinates in a context frame

```rust
// epi-cli/src/graph/retrieval/coordinate.rs
use crate::graph::client::Neo4jClient;
use crate::graph::coordinate_array_parser::{CoordinateArrayParser, ParsedCoordinate};

pub struct CoordinateRetrieval<'a> {
    client: &'a Neo4jClient,
}

impl<'a> CoordinateRetrieval<'a> {
    pub fn new(client: &'a Neo4jClient) -> Self {
        Self { client }
    }

    pub async fn query_by_coordinate(&self, coord: &str) -> Result<serde_json::Value, String> {
        let parsed = CoordinateArrayParser::parse_one(coord)?;
        let cypher = "MATCH (n:BimbaCoordinate {bimbaCoordinate: $coord}) RETURN n";
        // ... execute and return JSON
        todo!()
    }

    pub async fn query_multi(&self, coords: &[&str]) -> Result<Vec<serde_json::Value>, String> {
        let cypher = "MATCH (n:BimbaCoordinate) WHERE n.bimbaCoordinate IN $coords RETURN n";
        todo!()
    }

    pub async fn query_context(&self, coord: &str, depth: u32) -> Result<serde_json::Value, String> {
        let cypher = format!(
            "MATCH path = (n:BimbaCoordinate {{bimbaCoordinate: $coord}})-[*1..{}]-(m) RETURN path",
            depth
        );
        todo!()
    }

    pub async fn query_by_family(&self, family: &str) -> Result<Vec<serde_json::Value>, String> {
        let cypher = "MATCH (n:BimbaCoordinate {family: $family}) RETURN n ORDER BY n.ql_position";
        todo!()
    }

    pub async fn query_by_cf(&self, cf_name: &str) -> Result<Vec<serde_json::Value>, String> {
        let cypher = "MATCH (cf:BimbaCoordinate {bimbaCoordinate: $cf})-[:FRAMES]->(n) RETURN n";
        todo!()
    }
}
```

**Commit:** `feat(s2'): coordinate retrieval — single, multi, context, family, CF-scoped`

---

### Task 14: Hybrid Retrieval (RRF Fusion)

**Files:**
- Rewrite: `epi-cli/src/graph/retrieval/hybrid.rs`

Port from Python `hybrid_retrieval.py` (874 LOC):

```rust
// epi-cli/src/graph/retrieval/hybrid.rs

#[derive(Debug, Clone, Copy)]
pub enum RetrievalMode {
    VectorOnly,
    GraphOnly,
    HybridRrf,
    HybridWeighted,
}

#[derive(Debug, Clone)]
pub struct RetrievalResult {
    pub bimba_coordinate: String,
    pub score: f64,
    pub source: String, // "vector" or "graph"
    pub data: serde_json::Value,
}

pub struct HybridRetriever<'a> {
    client: &'a Neo4jClient,
    k: u32,  // RRF constant, default 60
    coordinate_boost: f64, // default 1.5
}

impl<'a> HybridRetriever<'a> {
    pub fn new(client: &'a Neo4jClient) -> Self {
        Self { client, k: 60, coordinate_boost: 1.5 }
    }

    /// RRF formula: RRF(d) = SUM(1 / (k + rank(d)))
    pub fn fusion_rrf(
        &self,
        vector_results: &[RetrievalResult],
        graph_results: &[RetrievalResult],
    ) -> Vec<RetrievalResult> {
        use std::collections::HashMap;
        let mut scores: HashMap<String, f64> = HashMap::new();
        let mut data_map: HashMap<String, serde_json::Value> = HashMap::new();

        for (rank, r) in vector_results.iter().enumerate() {
            let rrf = 1.0 / (self.k as f64 + rank as f64 + 1.0);
            *scores.entry(r.bimba_coordinate.clone()).or_default() += rrf;
            data_map.entry(r.bimba_coordinate.clone()).or_insert_with(|| r.data.clone());
        }

        for (rank, r) in graph_results.iter().enumerate() {
            let rrf = 1.0 / (self.k as f64 + rank as f64 + 1.0);
            *scores.entry(r.bimba_coordinate.clone()).or_default() += rrf * self.coordinate_boost;
            data_map.entry(r.bimba_coordinate.clone()).or_insert_with(|| r.data.clone());
        }

        let mut results: Vec<RetrievalResult> = scores.into_iter()
            .map(|(coord, score)| RetrievalResult {
                bimba_coordinate: coord.clone(),
                score,
                source: "hybrid".into(),
                data: data_map.remove(&coord).unwrap_or_default(),
            })
            .collect();

        results.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap_or(std::cmp::Ordering::Equal));
        results
    }
}
```

**Commit:** `feat(s2'): hybrid retrieval with RRF fusion`

---

### Task 15: GraphRAG Retriever (Progressive Disclosure)

**Files:**
- Rewrite: `epi-cli/src/graph/retrieval/graphrag.rs`

Port from Python `graphrag_retriever.py` (1293 LOC). Key: 6-level progressive disclosure:

```rust
// epi-cli/src/graph/retrieval/graphrag.rs

#[derive(Debug, Clone, Copy)]
pub enum DisclosureLevel {
    UuidOnly = 0,      // bimbaCoordinate, uuid
    Identity = 1,      // + name, family, ql_position, vault_path
    Summary = 2,       // + s0_pithy, position arrays
    Content = 3,       // + content summary, frontmatter
    Connected = 4,     // + 1-hop connected entities
    Complete = 5,      // + all properties, all relationships, embedding
}

pub struct GraphRAGRetriever<'a> {
    coord_retrieval: CoordinateRetrieval<'a>,
    hybrid: HybridRetriever<'a>,
}

impl<'a> GraphRAGRetriever<'a> {
    pub async fn progressive_disclosure(
        &self,
        coord: &str,
        level: DisclosureLevel,
    ) -> Result<serde_json::Value, String> {
        let fields = match level {
            DisclosureLevel::UuidOnly => "n.bimbaCoordinate, n.uuid",
            DisclosureLevel::Identity => "n.bimbaCoordinate, n.uuid, n.name, n.family, n.ql_position, n.vault_path",
            DisclosureLevel::Summary => "n.bimbaCoordinate, n.uuid, n.name, n.family, n.ql_position, n.vault_path, n.s0_pithy",
            // Higher levels need additional queries
            _ => "n",
        };
        // ... build and execute query with appropriate fields
        todo!()
    }
}
```

**Commit:** `feat(s2'): GraphRAG retriever with 6-level progressive disclosure`

---

## Phase 6: Embeddings + Link Enforcement

### Task 16: Gemini Embedding Client

**Files:**
- Rewrite: `epi-cli/src/graph/embeddings.rs`

Port from Python `embeddings.py` (598 LOC):

```rust
// epi-cli/src/graph/embeddings.rs
use reqwest::Client as HttpClient;

pub struct EmbeddingConfig {
    pub api_key: String,
    pub model: String,      // "text-embedding-004"
    pub dimensions: usize,  // 768, 1536, or 3072
}

impl EmbeddingConfig {
    pub fn from_env() -> Result<Self, String> {
        Ok(Self {
            api_key: std::env::var("GEMINI_API_KEY")
                .map_err(|_| "GEMINI_API_KEY not set")?,
            model: std::env::var("GEMINI_EMBED_MODEL")
                .unwrap_or_else(|_| "text-embedding-004".into()),
            dimensions: std::env::var("GEMINI_EMBED_DIMS")
                .ok()
                .and_then(|s| s.parse().ok())
                .unwrap_or(768),
        })
    }
}

pub struct GeminiEmbeddingClient {
    config: EmbeddingConfig,
    http: HttpClient,
}

impl GeminiEmbeddingClient {
    pub fn new(config: EmbeddingConfig) -> Self {
        Self { config, http: HttpClient::new() }
    }

    pub async fn embed(&self, text: &str) -> Result<Vec<f32>, String> {
        // POST to Gemini embedding endpoint
        // Return vector of config.dimensions length
        todo!()
    }

    pub async fn embed_batch(&self, texts: &[&str]) -> Result<Vec<Vec<f32>>, String> {
        // Batch embedding for efficiency
        todo!()
    }
}
```

**Commit:** `feat(s2'): Gemini embedding client (768/1536/3072 dims)`

---

### Task 17: Link Enforcement

**Files:**
- Rewrite: `epi-cli/src/graph/link_enforcement.rs`

Port from Python `link_enforcement.py` (1117 LOC):

```rust
// epi-cli/src/graph/link_enforcement.rs

pub struct LinkEnforcer<'a> {
    client: &'a Neo4jClient,
}

impl<'a> LinkEnforcer<'a> {
    /// Validate all wiki-links in content resolve to existing graph nodes
    pub async fn validate_content_links(
        &self,
        content: &str,
    ) -> Result<LinkValidationResult, String> {
        let links = CoordinateArrayParser::extract_wikilinks(content);
        let mut valid = Vec::new();
        let mut broken = Vec::new();

        for link in &links {
            let exists = self.node_exists(&link.target).await?;
            if exists {
                valid.push(link.target.clone());
            } else {
                broken.push(link.target.clone());
            }
        }

        Ok(LinkValidationResult { valid, broken })
    }

    async fn node_exists(&self, path_or_coord: &str) -> Result<bool, String> {
        let cypher = "MATCH (n:BimbaCoordinate) WHERE n.vault_path = $p OR n.bimbaCoordinate = $p RETURN count(n) > 0 AS exists";
        // ... execute
        todo!()
    }
}

pub struct LinkValidationResult {
    pub valid: Vec<String>,
    pub broken: Vec<String>,
}
```

**Commit:** `feat(s2'): link enforcement — validate wiki-links against graph`

---

## Phase 7: Sync Engine (S1 <-> S2 Bridge)

### Task 18: Sync Coordinator

**Files:**
- Rewrite: `epi-cli/src/graph/sync_coordinator.rs`
- Rewrite: `epi-cli/src/graph/sync.rs`
- Rewrite: `epi-cli/src/graph/bidirectional_sync.rs`

Port from Python sync stack (~3K LOC combined). This is the S1<->S2 bridge.

```rust
// epi-cli/src/graph/sync_coordinator.rs

use crate::graph::client::Neo4jClient;
use crate::graph::relationship_manager::RelationshipManager;
use crate::graph::coordinate_array_parser::CoordinateArrayParser;

pub struct SyncCoordinator<'a> {
    client: &'a Neo4jClient,
    rel_manager: RelationshipManager<'a>,
}

impl<'a> SyncCoordinator<'a> {
    pub fn new(client: &'a Neo4jClient) -> Self {
        Self {
            client,
            rel_manager: RelationshipManager::new(client),
        }
    }

    /// Sync a vault note to Neo4j (S1 -> S2)
    /// Reads frontmatter, upserts node, creates relationships
    pub async fn sync_from_vault(
        &self,
        vault_path: &str,
        frontmatter: &serde_yaml::Value,
        content: &str,
    ) -> Result<SyncResult, String> {
        // 1. Extract bimbaCoordinate from frontmatter
        let coord = frontmatter.get("bimbaCoordinate")
            .and_then(|v| v.as_str())
            .ok_or("no bimbaCoordinate in frontmatter")?;

        // 2. Validate coordinate
        if !crate::vault::frontmatter::is_valid_coordinate(coord) {
            return Err(format!("invalid coordinate: {}", coord));
        }

        // 3. Upsert node with frontmatter properties
        let cypher = r#"
            MERGE (n:BimbaCoordinate {bimbaCoordinate: $coord})
            SET n.vault_path = $path,
                n.updated_at = datetime()
            RETURN n.bimbaCoordinate AS coord
        "#;
        self.client.run(cypher).await
            .map_err(|e| format!("upsert error: {}", e))?;

        // 4. Parse coordinate arrays and create relationships
        let arrays = CoordinateArrayParser::parse_frontmatter_arrays(frontmatter);
        let mut rel_count = 0;
        for (key, links) in &arrays {
            let targets: Vec<String> = links.iter().map(|l| l.target.clone()).collect();
            let kv = vec![(key.clone(), targets)];
            rel_count += self.rel_manager.create_from_frontmatter(coord, &kv).await?;
        }

        Ok(SyncResult {
            coordinate: coord.to_string(),
            vault_path: vault_path.to_string(),
            relationships_created: rel_count,
        })
    }
}

pub struct SyncResult {
    pub coordinate: String,
    pub vault_path: String,
    pub relationships_created: usize,
}
```

```rust
// epi-cli/src/graph/bidirectional_sync.rs

#[derive(Debug, Clone)]
pub enum ConflictResolution {
    VaultWins,          // S1 overwrites S2
    GraphWins,          // S2 overwrites S1
    MostRecent,         // newer timestamp wins
    Manual,             // prompt user
    Merge,              // combine properties
    Skip,               // do nothing
}

pub struct BidirectionalSyncer<'a> {
    client: &'a Neo4jClient,
}

impl<'a> BidirectionalSyncer<'a> {
    /// Detect conflicts between vault and graph state
    pub async fn detect_conflicts(
        &self,
        coord: &str,
        vault_frontmatter: &serde_yaml::Value,
    ) -> Result<Vec<SyncConflict>, String> {
        // Compare vault frontmatter against Neo4j node properties
        todo!()
    }

    /// Resolve a conflict with the given strategy
    pub async fn resolve(
        &self,
        conflict: &SyncConflict,
        strategy: ConflictResolution,
    ) -> Result<(), String> {
        todo!()
    }
}

pub struct SyncConflict {
    pub coordinate: String,
    pub property: String,
    pub vault_value: String,
    pub graph_value: String,
}
```

**Commit:** `feat(s2'): sync engine — S1<->S2 bridge with conflict resolution`

---

### Task 19: Wire `epi graph sync` Command

**Files:**
- Modify: `epi-cli/src/graph/mod.rs`

**Step 1: Add Sync subcommand**

```rust
/// Sync vault note to graph
Sync {
    /// Vault path to sync
    path: String,
    #[arg(long, default_value = "vault-wins")]
    conflict_strategy: String,
},
```

**Step 2: Implement dispatch**

Read the vault note, parse YAML frontmatter, call `sync_coordinator.sync_from_vault()`.

**Step 3: Test end-to-end**

Run: `epi graph up && epi graph init`
Run: `epi graph sync "Bimba/Seeds/M/M4"`
Expected: Node upserted in Neo4j with M4's frontmatter properties.

**Step 4: Commit**

```bash
git commit -m "feat(s2'): epi graph sync — vault-to-graph sync command"
```

---

### Task 20: Wire `epi graph query` Command

**Files:**
- Modify: `epi-cli/src/graph/mod.rs`

```rust
/// Query coordinates
Query {
    /// Coordinate(s) to query: "#4", "P3,M4'", "--family T", "--cf CF_TRIKA"
    coordinate: String,
    /// Disclosure level 0-5
    #[arg(short, long, default_value = "1")]
    level: u8,
    /// Context depth (for --depth N)
    #[arg(short, long)]
    depth: Option<u32>,
},
```

**Commit:** `feat(s2'): epi graph query — coordinate lookup with progressive disclosure`

---

## Summary: Execution Order

| # | Task | Phase | Depends On |
|---|------|-------|-----------|
| 1 | Docker Compose | 1: Infra | - |
| 2 | Cargo.toml deps | 1: Infra | - |
| 3 | Neo4j client | 1: Infra | Task 2 |
| 4 | Redis client | 1: Infra | Task 2 |
| 5 | Graph dispatch (status/up/down) | 1: Infra | Tasks 3, 4 |
| 6 | Schema module | 2: Bootstrap | Task 3 |
| 7 | Seed coordinate space | 2: Bootstrap | Task 6 |
| 7b | Import M-branch datasets | 2: Bootstrap | Task 7 |
| 8 | S1 missing commands | 3: Vault | - |
| 9 | S1 thought routing | 3: Vault | - |
| 10 | S1 frontmatter validation | 3: Vault | - |
| 11 | Extended coord parser | 4: Parser | - |
| 12 | Relationship manager | 4: Parser | Tasks 3, 11 |
| 13 | Coordinate retrieval | 5: Retrieval | Tasks 3, 11 |
| 14 | Hybrid retrieval (RRF) | 5: Retrieval | Task 13 |
| 15 | GraphRAG retriever | 5: Retrieval | Tasks 13, 14 |
| 16 | Gemini embeddings | 6: Embed | Task 2 |
| 17 | Link enforcement | 6: Embed | Tasks 3, 11 |
| 18 | Sync coordinator | 7: Sync | Tasks 3, 10, 11, 12 |
| 19 | `epi graph sync` cmd | 7: Sync | Task 18 |
| 20 | `epi graph query` cmd | 7: Sync | Tasks 13, 15 |

**Parallelizable:** Tasks 1-2 (infra), Tasks 8-10 (vault, no graph dep), Tasks 11 (parser, no graph dep) can all run in parallel with Tasks 3-7.

**Total: 21 tasks across 7 phases.**

---

## Additional Port Sources Discovered

Background research agents identified additional S1' code beyond epi-claw:

**`/Epi-Logos/.pi/extensions/s/modules/obsidian/`** — S1 raw vault layer (TypeScript):
- `obsidian_cli.ts` — Core CRUD, frontmatter, search, Smart Connections access
- `obsidian_cli.test.ts` — 337+ lines of tests (vitest)

**`/Epi-Logos/.pi/extensions/s_i/modules/ql_obsidian/`** — S1' coordinate layer (TypeScript):
- `day_now.ts` (489 lines) — Day/NOW management, position-aware operations, POSITION_HEADERS
- `frontmatter_schema.ts` (344 lines) — 126+ canonical keys registry, deprecated pattern normalization
- `filesystem_ops.ts` — Canonical path resolution (Bimba/Seeds/World, Day/NOW, Thought routing)
- `bimba_pratibimba_forms.ts` — C0 form validation, C5->C1 lineage enforcement
- `canvas_moc.ts` — Canvas artifact enforcement

**`/Epi-Logos/Idea/Pratibimba/System/Subsystems/Paramasiva/obsidian/api.py`** (400 lines):
- Python ObsidianAPI client via Local REST API plugin (port 27123)
- Safe file operations, link extraction, backlink detection

These provide richer port sources for Tasks 8-10 than epi-claw alone. The `frontmatter_schema.ts` in particular has the full 126-key canonical registry that should ground Task 10.

**Dataset inventory (for Task 7b):**
- `docs/datasets/` — ~340K lines JSON across M0-M5 branches
- Deep detail folders: `*-deep/` with full-detail nodes (28K+ lines for Parashakti alone)
- Parashakti planets dataset: 25K lines
- Existing Neo4j export backup: 69K lines (3MB baseline reference)
