# System Dependencies

**Status**: Canonical dependency manifest for the Epi-Logos C Experiments monorepo
**Date**: 2026-05-02
**Mirrors**: [[S-SYSTEM-INDEX]] — same S0-S5 structure, but for packages rather than specs

This file is the truth about what the system needs to build and run. Every package root, external CLI, runtime service, and API key lives here. If something is missing from this file, it is either undocumented debt or not a real dependency.

---

## I. Runtime Prerequisites

### System Toolchain

| Tool | Min Version | Purpose | Install |
|---|---|---|---|
| **clang** | 15+ | C compilation (epi-lib, arena, families) | Xcode CLT / `brew install llvm` |
| **cargo** / **rustc** | 1.82+ | Rust compilation (epi-cli, S2 services, S3 gateway) | `rustup` |
| **node** | 22+ | TypeScript execution (ta-onta, depwire, bimba-mcp) | `nvm` / `brew install node` |
| **python3** | 3.12+ | Python packages (epi-gnostic, hen-compiler, autoresearch) | `pyenv` / system |
| **bun** | 1.2+ | Alternative TS runtime (pi-vs-claude-code, dev scripts) | `curl -fsSL https://bun.sh/install \| bash` |
| **make** | 3.81+ | C build orchestration | Xcode CLT |

### Package Managers

| Manager | Scope | Lockfile |
|---|---|---|
| **cargo** | Rust workspace | `Cargo.lock` |
| **npm** / **pnpm** | TypeScript workspace | `package-lock.json` / `pnpm-lock.yaml` |
| **pip** / **uv** | Python packages | `pyproject.toml` constraints |

### External CLI Tools

| Tool | Required By | Purpose | Install |
|---|---|---|---|
| **bkmr** | epi-kbase, kbase.sh | Bookmark manager + Gemini semantic search | `cargo install bkmr` |
| **pandoc** | kbase.sh (optional) | HTML→plaintext conversion for URL ingestion | `brew install pandoc` |
| **sqlite3** | kbase.sh | Project database queries | System (pre-installed on macOS) |
| **just** | pi-vs-claude-code | Task runner | `cargo install just` |
| **mcpb** | depwire | MCP bundle packaging | `npm install -g mcpb` |
| **spacetime** | epi-spacetime-module (stubbed) | SpacetimeDB CLI | spacetimedb.com |

### External Services

| Service | Connection | Required By | Environment Variables |
|---|---|---|---|
| **Neo4j** | `bolt://localhost:7687` | epi-cli, bimba-mcp, epi-app, epi-gnostic | `EPILOGOS_NEO4J_URI`, `EPILOGOS_NEO4J_USER`, `EPILOGOS_NEO4J_PASSWORD` |
| **Redis** | `redis://localhost:6379` | epi-cli, epi-gnostic, redisvl cache | `EPILOGOS_REDIS_URI`, `EPILOGOS_SEMANTIC_CACHE_REDIS_URL` |
| **Gemini API** | HTTPS | epi-gnostic, bkmr `--gemini` | `GEMINI_API_KEY` |
| **Anthropic API** | HTTPS | hen-compiler, oh-my-codex | `ANTHROPIC_API_KEY` |
| **SpacetimeDB** | (stubbed) | epi-spacetime-module | — |

---

## II. Package Roots by S-Level

### S0 — Terminal / CLI / Core Library

#### `Body/S/S0/epi-lib/` — C core library

| Dependency | Version | Type |
|---|---|---|
| libc (system) | — | Link: `-lm` |
| BLAKE3 (vendored) | portable | `Body/S/S0/vendor/blake3/` — no SIMD, C11 subset |

Build: `make` with `clang -std=c11 -Wall -Wextra -Werror -pedantic`
Sanitizers (debug): `-fsanitize=address,undefined`

#### `Body/S/S0/epi-cli/` — Rust CLI

| Dependency | Version | Purpose |
|---|---|---|
| tokio | ^1 (full) | Async runtime |
| clap | ^4 | CLI parsing |
| ratatui | 0.30 | TUI framework |
| crossterm | 0.29 | Terminal I/O |
| serde / serde_json / serde_yaml | 1 / 1 / 0.9 | Serialization |
| neo4rs | 0.9.0-rc.9 | Neo4j driver |
| redis | 0.25 (tokio-comp) | Redis client |
| reqwest | 0.12 (json) | HTTP client |
| blake3 | 1 | Hashing |
| sha2 | 0.10 | Hashing |
| chacha20poly1305 | 0.10 | Encryption |
| argon2 | 0.5 | Key derivation |
| rcgen | 0.13 | Certificate generation |
| uuid | 1 (v4, v5) | UUID generation |
| chrono | 0.4 (serde) | Timestamps |
| nalgebra | 0.33 | Linear algebra (torus projection) |
| tiny-skia | 0.12 | Offscreen rendering |
| ratatui-image | 10 | TUI images |
| image | 0.25 (png) | Image processing |
| ab_glyph | 0.2 | Glyph rasterization |
| dirs | 5 | Home directory |
| color-eyre | 0.6 | Error formatting |
| tokio-tungstenite | 0.24 | WebSocket |
| futures-util | 0.3 | Async utilities |
| libc | 0.2 | C interop |
| hex | 0.4 | Hex encoding |
| static_assertions | 1 | Compile-time checks |
| zeroize | 1 (derive) | Secure memory |
| rpassword | 7 | Password input |

Local path deps: `epi-s2-graph-schema`, `epi-s2-graph-services`, `epi-s3-gateway-contract`

#### `Body/S/S0/epi-cli/schemas/` — TS coordinate schemas

| Dependency | Version | Purpose |
|---|---|---|
| zod | ^3.24.0 | Schema validation |
| typescript | ^5.7.0 | Dev |
| vitest | ^3.0.0 | Dev |

#### `Body/S/S0/epi-cli/scripts/redisvl_cache_service/` — Python Redis vector cache

| Dependency | Purpose |
|---|---|
| redisvl | Redis vector library |
| sentence-transformers | Sentence embeddings |

---

### S1 — Vault / Hen Compiler

#### `Body/S/S1/hen-compiler/` — Python knowledge compiler

| Dependency | Version | Purpose |
|---|---|---|
| claude-agent-sdk | >=0.1.29 | Anthropic SDK |
| python-dotenv | >=1.0.0 | Environment variables |
| tzdata | >=2024.1 | Timezone data |

Requires: Python >=3.12

---

### S2 — Graph / Vector / Cache

#### `Body/S/S2/graph-schema/` — Rust graph schema contract

No external dependencies (pure type library).

#### `Body/S/S2/graph-services/` — Rust graph services

| Dependency | Version | Purpose |
|---|---|---|
| epi-s2-graph-schema | local | Schema contract |
| serde / serde_json | 1 / 1 | Serialization |

#### `Body/S/S2/external/bimba-mcp/` — TS Neo4j MCP server

| Dependency | Version | Purpose |
|---|---|---|
| @modelcontextprotocol/sdk | ^1.0.0 | MCP protocol |
| langchain | ^1.2.15 | LLM framework |
| neo4j-driver | ^5.28.0 | Neo4j client |
| zod | ^3.25.0 | Schema validation |
| typescript | ^5.7.0 | Dev |
| vitest | ^4.0.18 | Dev |

---

### S3 — Gateway / Sessions / App

#### `Body/S/S3/epi-app/` — Electron + React + Three.js app

| Dependency | Version | Purpose |
|---|---|---|
| react / react-dom | ^19.2.4 | UI framework |
| three | ^0.167.1 | 3D graphics |
| @react-three/fiber | ^9.5.0 | React Three.js bridge |
| @react-three/drei | ^10.7.7 | Three.js helpers |
| ogl | ^1.0.11 | WebGL |
| @tiptap/react + starter-kit | ^3.20.0 | Rich text editor |
| lucide-react | ^0.563.0 | Icons |
| tailwindcss | — | Styling |
| framer-motion | ^12.29.0 | Animation |
| react-force-graph-2d | ^1.29.0 | Graph visualization |
| react-markdown | ^9.0.1 | Markdown rendering |
| gray-matter | ^4.0.3 | Frontmatter parsing |
| neo4j-driver | ^6.0.1 | Neo4j client |
| zustand | ^4.4.7 | State management |
| date-fns | ^4.1.0 | Date utilities |
| react-router-dom | ^6.21.0 | Routing |

Dev: Electron, Playwright ^1.58.0, Vite, TypeScript, ESLint

#### `Body/S/S3/epi-spacetime-module/` — Rust SpacetimeDB WASM (stubbed)

| Dependency | Version | Purpose |
|---|---|---|
| spacetimedb | 2 | Database runtime |

**Status**: Stubbed. Requires `wasm32-unknown-unknown` target, rustup >=1.93.0, spacetime CLI.

#### `Body/S/S3/gateway-contract/` — Rust gateway protocol

| Dependency | Version | Purpose |
|---|---|---|
| serde / serde_json | 1 / 1 | Serialization |
| uuid | 1.18 (v4) | UUID generation |

---

### S4 — Agent Runtime / ta-onta

#### `Body/S/S4/ta-onta/` — TypeScript agent spine

No standalone package.json — modules are TS files consumed by the PI agent runtime.
Depends on the spine types defined in `spine/types.ts`.

Runtime deps (inherited from PI agent host):
- PI agent SDK / plugin runtime
- Node 22+

#### `Body/S/S4/pi-agent/` — PI agent composite entry

Same pattern — consumed by the host runtime.

---

### S5 — World Boundary / Gnosis / kbase / Epii

#### `Body/S/S5/epi-gnostic/` — Python Gnosis/Graphiti RAG pipeline

| Dependency | Version | Purpose |
|---|---|---|
| raganything | >=1.2.0 | RAG framework |
| lightrag-hku | >=1.0.0 | Light RAG |
| neo4j | >=5.0.0 | Neo4j driver |
| google-genai | >=1.0.0 | Gemini API client |
| python-dotenv | >=1.0.0 | Environment variables |
| numpy | >=1.24.0 | Numerical computing |
| graphiti-core | >=0.3.0 | Graph processing |
| fastapi | >=0.110.0 | Web framework |
| uvicorn | >=0.29.0 | ASGI server |
| redis | >=5.0.0 | Redis client |

Dev: pytest >=8.0, pytest-asyncio >=0.23
Requires: Python >=3.10
Entry points: `epi-gnostic` CLI, `epi-graphiti` service

Environment:
```
NEO4J_URI=bolt://localhost:7687
GEMINI_API_KEY=<key>
GNOSTIC_WORKSPACE=gnostic
GNOSTIC_WORKING_DIR=~/.epi-logos/gnostic/
GNOSTIC_EMBEDDING_DIM=3072
GNOSTIC_EMBEDDING_MODEL=gemini-embedding-2-preview
GNOSTIC_LLM_MODEL=gemini-3.1-flash-lite
```

#### `Body/S/S5/epi-kbase/` — TypeScript bounded resource context (S5.2')

| Dependency | Version | Purpose |
|---|---|---|
| (none — runtime) | — | Pure types + `child_process.execFile("bkmr")` |
| vitest | ^4.0.0 | Dev |
| typescript | ^5.8.0 | Dev |

External CLI: `bkmr` must be on PATH.
Environment: `BKMR_PROJECT` (optional, defaults to `epi-logos`).

#### `Body/S/S5/epi-kbase-core/` — Rust kbase foundations (S5.2')

| Dependency | Version | Purpose |
|---|---|---|
| serde | 1 (features: derive) | Serialization for facet types |
| dirs | 5 | Home directory resolution for script fallback |

Provides: `epi-s5-kbase-core` crate — canonical types (`FacetItem`, `KbaseFieldFacet`, `VimarsaFieldFacet`), script resolution, project scoping, search facet builders. Consumed by S0 epi-cli as local Cargo path dep.

#### `Body/S/S5/plugins/epi-logos-sketch/` — Plugin sketch

No package.json — resource files and skill definitions only.

---

## III. Vendor Packages

#### `vendors/oh-my-codex/` — Multi-agent orchestration

**TS side:**

| Dependency | Version | Purpose |
|---|---|---|
| @iarna/toml | ^2.2.5 | TOML parser |
| @modelcontextprotocol/sdk | ^1.26.0 | MCP protocol |
| zod | ^4.3.6 | Schema validation |
| @biomejs/biome | ^2.4.4 | Dev: formatter/linter |
| c8 | ^11.0.0 | Dev: coverage |
| typescript | ^5.7.0 | Dev |

**Rust side** (5-crate workspace):

| Crate | Key Deps |
|---|---|
| omx-runtime-core | fs2 0.4, serde 1, serde_json 1 |
| omx-mux | serde 1, serde_json 1 |
| omx-sparkshell | omx-mux (local) |
| omx-explore | (none) |

Mirrored at `.codex/omx-runtime/` (identical).

#### `vendors/autoresearch/` — Autonomous pretraining research

| Dependency | Version | Purpose |
|---|---|---|
| kernels | >=0.11.7 | Compute kernels |
| matplotlib | >=3.10.8 | Plotting |
| numpy | >=2.2.6 | Numerical |
| pandas | >=2.3.3 | Data frames |
| pyarrow | >=21.0.0 | Columnar data |
| requests | >=2.32.0 | HTTP |
| rustbpe | >=0.1.0 | Rust BPE tokenizer |
| tiktoken | >=0.11.0 | OpenAI tokenizer |
| torch | ==2.9.1 | PyTorch (CUDA 12.8) |

**Note**: Custom PyTorch index: `https://download.pytorch.org/whl/cu128`

#### `vendors/claw-code-parity/` — Claude Code parity harness (9-crate Rust workspace)

Common deps: tokio 1, serde 1, serde_json, regex 1, walkdir 2, sha2 0.10, reqwest 0.12 (rustls-tls), syntect 5, rustyline 15, pulldown-cmark 0.13, crossterm 0.28, glob 0.3.

Workspace lint: `forbid(unsafe_code)`, clippy pedantic.

#### `vendors/pi-vs-claude-code/` — PI agent extension playground

| Dependency | Version | Purpose |
|---|---|---|
| yaml | ^2.8.0 | YAML parser |

Build: `bun`, `just` task runner.

#### `vendors/claude-memory-compiler/` — Python memory compiler

Same deps as hen-compiler: claude-agent-sdk >=0.1.29, python-dotenv, tzdata.

---

## IV. Tooling / Infra Packages

#### `depwire/` — Dependency analyzer + MCP server

| Dependency | Version | Purpose |
|---|---|---|
| @modelcontextprotocol/sdk | 1.26.0 | MCP protocol |
| chalk | ^5.6.2 | Terminal colors |
| chokidar | 5.0.0 | File watching |
| commander | 14.0.3 | CLI parsing |
| d3 | ^7.9.0 | Graph visualization |
| express | 5.2.1 | HTTP server |
| graphology | 0.26.0 | Graph data structures |
| minimatch | ^10.2.4 | Glob patterns |
| open | 11.0.0 | Open URLs |
| simple-git | 3.31.1 | Git integration |
| web-tree-sitter | ^0.26.6 | Parser |
| ws | 8.19.0 | WebSocket |
| zod | 4.3.6 | Schema validation |

Dev: sharp 0.34.5, tree-sitter-c, tree-sitter-rust, tsup 8.5.1, typescript 5.9.3.

---

## V. Environment Variables (Complete)

### Required for Core Operations

| Variable | Service | Used By |
|---|---|---|
| `EPILOGOS_NEO4J_URI` | Neo4j | epi-cli |
| `EPILOGOS_NEO4J_USER` | Neo4j | epi-cli |
| `EPILOGOS_NEO4J_PASSWORD` | Neo4j | epi-cli |
| `EPILOGOS_REDIS_URI` | Redis | epi-cli |
| `GEMINI_API_KEY` | Gemini | epi-gnostic, bkmr |
| `ANTHROPIC_API_KEY` | Claude | hen-compiler, oh-my-codex |

### Optional / Defaults

| Variable | Default | Used By |
|---|---|---|
| `BKMR_PROJECT` | `epi-logos` | epi-kbase, kbase.sh |
| `EPI_KBASE_SCRIPT` | (auto-resolved) | epi-cli kbase module |
| `EPILOGOS_VAULT` | (from `.epi-logos.env`) | Vault path |
| `EPI_VAULT_NAME` | `Epi-Logos C Experiments` | Workspace identity |
| `GNOSTIC_WORKSPACE` | `gnostic` | epi-gnostic |
| `GNOSTIC_WORKING_DIR` | `~/.epi-logos/gnostic/` | epi-gnostic |
| `GNOSTIC_EMBEDDING_DIM` | `3072` | epi-gnostic |
| `GNOSTIC_EMBEDDING_MODEL` | `gemini-embedding-2-preview` | epi-gnostic |
| `GNOSTIC_LLM_MODEL` | `gemini-3.1-flash-lite` | epi-gnostic |
| `EPILOGOS_SEMANTIC_CACHE_REDIS_URL` | — | redisvl cache |
| `EPILOGOS_SEMANTIC_CACHE_ARCH` | `arm64` | redisvl cache |
| `EPILOGOS_SEMANTIC_CACHE_THRESHOLD` | `0.9` | redisvl cache |
| `NEO4J_URI` | `bolt://localhost:7687` | epi-gnostic, build scripts |
| `NEO4J_DATABASE` | `neo4j` | epi-gnostic |
| `NEO4J_PASSWORD` | — | build scripts |

---

## VI. Build Commands (Quick Reference)

| What | Command | Where |
|---|---|---|
| C core lib | `make` | `Body/S/S0/epi-lib/` |
| C tests | `make test` | `Body/S/S0/epi-lib/` |
| Rust CLI | `cargo build` | `Body/S/S0/epi-cli/` |
| Rust tests | `cargo test` | `Body/S/S0/epi-cli/` |
| TS schemas | `npm test` | `Body/S/S0/epi-cli/schemas/` |
| bimba-mcp | `npm install && npm run build` | `Body/S/S2/external/bimba-mcp/` |
| epi-app | `npm install && npm run dev` | `Body/S/S3/epi-app/` |
| epi-gnostic | `pip install -e .` | `Body/S/S5/epi-gnostic/` |
| epi-kbase | `npm test` (vitest) | `Body/S/S5/epi-kbase/` |
| depwire | `npm install && npm run build` | `depwire/` |
| oh-my-codex | `npm install && cargo build` | `vendors/oh-my-codex/` |
| autoresearch | `pip install -e .` | `vendors/autoresearch/` |
| LUT generation | `make lut` (needs Neo4j) | `Body/S/S0/epi-lib/` |

---

## VII. Dependency Architecture Notes

### Version Pins & Warnings

- **neo4rs 0.9.0-rc.9**: Pre-release Neo4j driver in epi-cli. Pin until stable release.
- **torch ==2.9.1**: Autoresearch pins PyTorch exactly with CUDA 12.8 wheels.
- **BLAKE3 vendored**: Portable C subset with no SIMD. Intentional for cross-platform.
- **spacetimedb 2**: Stubbed. Requires wasm32-unknown-unknown target + spacetime CLI.
- **arm64 semantic cache**: `EPILOGOS_SEMANTIC_CACHE_ARCH` hardcoded to arm64 in dev env.
- **oh-my-codex dual copies**: `vendors/oh-my-codex/` and `.codex/omx-runtime/` are identical. Keep in sync.

### Cross-Level Dependencies

```
S0 (epi-cli) ──uses──→ S2 (graph-schema, graph-services) [local Cargo path]
S0 (epi-cli) ──uses──→ S3 (gateway-contract) [local Cargo path]
S0 (epi-cli) ──uses──→ S5 (epi-kbase-core) [local Cargo path — types, script resolution, facet builders]
S4 (ta-onta) ──imports──→ S5 (epi-kbase) [TS module import]
S4 (ta-onta/aletheia) ──calls──→ S0 (kbase.sh via bkmr) [CLI exec]
S5 (epi-kbase) ──calls──→ bkmr CLI [child_process.execFile]
S5 (epi-gnostic) ──connects──→ Neo4j, Redis, Gemini API [network]
S2 (bimba-mcp) ──connects──→ Neo4j [network]
S3 (epi-app) ──connects──→ Neo4j [network]
```

### Service Startup Order

For a full local dev environment:

1. **Neo4j** — start first, everything reads graph
2. **Redis** — start second, cache and session state
3. **epi-gnostic** — optional, needed for Gnosis/RAG queries
4. **bkmr** — install binary, needed for kbase/sem-search
5. **epi-cli** — `cargo build` in S0
6. **epi-app** — `npm run dev` in S3 (optional, for UI)

### What's NOT Here

- **Obsidian plugins**: `Body/S/S1/hen-compiler/.obsidian/plugins/` and `Idea/.obsidian/plugins/` contain Obsidian community plugins (reveal.js, etc.). These are managed by Obsidian, not by this manifest.
- **`.worktrees/`**: Git worktree checkpoints. Same packages as main, different branches.
- **`node_modules/`**, **`.venv/`**: Installed artifacts, not source dependencies.
