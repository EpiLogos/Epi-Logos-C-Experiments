---
date: 2026-05-09
status: design
authority: build-ready
supersedes: none
extends:
  - "[[M'-TAURI-PORT-SPEC]]"
  - "[[M'-PORTAL-SPEC]]"
  - "[[S-AD-HOC-ROADMAP]]"
references:
  - "Body/S/S3/epi-app/ (current Electron app)"
  - "Idea/Bimba/Map/M0'.md through M5'.md"
  - "docs/plans/CLOCK-AND-NARA-SPECS/"
---

# Epi-Logos Tauri v2 Port — Build-Ready Design

## Overture

This is the complete build spec for porting the Electron `epi-app` at `Body/S/S3/epi-app` to a Tauri v2 desktop application that mirrors the TUI portal grammar (`0` / `/` / `1`) at the contract level while preserving — and substantially deepening — the renderer breadth across all six M' consciousness domains.

The aim is a single-session-buildable specification: thorough enough that parallel implementation agents can each take a self-contained module from this document and produce working code without further design questions. Where the existing seed specs (`M'-TAURI-PORT-SPEC`, `M'-PORTAL-SPEC`) define the *what* and *why*, this document defines the *how* — full Rust struct definitions, every Tauri command signature, every renderer service contract, and the topology of the parallelisable build itself.

This is not a roadmap. It is the build.

---

## Part I — Vision and Scope

### 1.1 What we are building

A native desktop application — `epi-tauri` — that:

1. **Replaces Electron main-process authority** with Rust-backed Tauri commands while preserving the full React 19 renderer codebase.
2. **Mirrors the TUI portal grammar** so `0` (structural Bimba map / clock / topology), `/` (OmniPanel command centre), and `1` (Nara/Epii personal/world return) consume the same gateway, session, temporal, and SpaceTimeDB projections as `epi portal` TUI.
3. **Surfaces the whole M' set** — not just three super-panels. Every coordinate from M0' through M5' has a real workspace; every inner stratum (0'–5') has a working surface (no placeholder text where there should be a visualisation).
4. **Implements the integrated solar/Chronos clock** at M3-5' as the live, shared `PortalClockState` driving torus rotation, oracle quaternion, kairos planetary state, and Nara walkabout entry — backed by SpaceTimeDB subscription where available, polling fallback otherwise.
5. **Implements the Cymascope** at M2-5' as a real WebGL planetary sequencer with cymatic patterns, not a placeholder card.
6. **Implements the Bimba map** at M0-5' as the canonical structural ground — the desktop `0` viewport.
7. **Implements the etymological Atelier** at M5-5' with the staged conversational → community → backend resonance / MEF / sedimentation workflow.
8. **Replaces `window.sPrime` preload assumptions** with typed renderer service clients (`gatewayClient`, `temporalClient`, `naraClient`, `epiiClient`, `agentExecutionClient`).
9. **Establishes the typed VAK / Anima / Aletheia / Epii agent execution surface** — the page where bounded agent invocation, run trees, and inbox deposits become explicit.
10. **Preserves all Zustand state, TipTap editor with HighlightMark + FloatingMenu, ForceGraphPower, and component decomposition** that already work in the Electron renderer.

### 1.2 What we are not building

- A new ontology of surfaces (the M' grammar is canonical and unchanged).
- A backend session model parallel to S3 gateway (we read and mutate gateway sessions).
- A separate desktop-local store of vault truth (we route through S1/S1' contracts).
- A standalone clock plugin (the clock is the M3' face of the shared `PortalClockState`).
- Marketing chrome, splash screens, or onboarding (the operator opens it and uses it).

### 1.3 Single-session buildability

A single session here means a focused multi-hour implementation run, with parallel sub-agents each owning a self-contained module. The spec is structured so that:

- Each Rust command module (`gateway.rs`, `vault.rs`, `graph.rs`, `temporal.rs`, `agents.rs`, `inbox.rs`) has a complete, copyable signature contract and can be implemented without reading the others.
- Each M' domain workspace has its own self-contained section in this document with full UI behaviour, state shape, service-client wiring, and per-stratum acceptance criteria.
- The OmniPanel section enumerates every panel, every gateway method binding, every store action — so panel implementation work parallelises cleanly.
- The PortalClockState contract is a single self-contained section with full struct definitions and update semantics — clock work does not need to read the OmniPanel section, and vice versa.

Critical path (cannot parallelise): Tauri scaffolding → command spine plumbing → renderer service-client codegen. Everything else fans out from there.

### 1.4 Authority model

| Layer | Authority | Reads/Writes |
|---|---|---|
| `epi-tauri` (this spec) | Renderer surfaces + Rust command spine + service clients | Tauri IPC only |
| S3 gateway (port 18794) | Live session, channel, skill, cron, config truth | WebSocket JSON-RPC |
| S2 graph services (Neo4j) | Bimba/Pratibimba canonical graph | Bolt or HTTP via Rust |
| S1/S1' compiler + vault | Markdown, frontmatter, file tree, backlinks, daily/flow notes | Rust `std::fs` + `walkdir` |
| SpaceTimeDB | Live `session_surface`, `kairos_surface` projection | Native WebSocket subscription or HTTP SQL polling |
| Khora session runtime | Agent-runtime session id, NOW write authority | Through gateway `epi agent session init` |

The Tauri app **never** invents a parallel authority for any of these. It is a typed, fast, native-feeling lens on the same shared truth.

---

## Part II — Architecture

### 2.1 Repository layout

The new app lives under `Body/S/S3/epi-tauri/` and replaces `Body/S/S3/epi-app/` once tests pass. During the build, both coexist; once parity is proven, the Electron tree moves to `Body/S/S3/_legacy-epi-app/` and the Tauri tree takes the canonical path.

```
Body/S/S3/epi-tauri/
├── Cargo.toml                    # Workspace root for the Rust side
├── package.json                  # Root JS package (orchestrates pnpm workspace)
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── tsconfig.base.json
│
├── src-tauri/                    # Tauri v2 backend (Rust)
│   ├── Cargo.toml                # Crate manifest
│   ├── tauri.conf.json           # Tauri app config
│   ├── build.rs                  # tauri-build hook
│   ├── icons/
│   ├── capabilities/             # Tauri permission capabilities
│   │   └── default.json
│   └── src/
│       ├── main.rs               # Entry point
│       ├── lib.rs                # Library exports for tests
│       ├── state.rs              # AppState, mutex-guarded shared state
│       ├── error.rs              # Unified error types (thiserror)
│       ├── events.rs             # Event emission helpers (gateway, clock, inbox, agent)
│       │
│       ├── commands/             # Tauri #[command] handlers (the IPC spine)
│       │   ├── mod.rs
│       │   ├── app.rs            # version, platform
│       │   ├── gateway.rs        # S3 gateway RPC methods
│       │   ├── vault.rs          # S1/S1' file/journal/backlinks/wikilinks
│       │   ├── graph.rs          # S2 Neo4j queries
│       │   ├── temporal.rs       # PortalClockState + Kairos + DAY/NOW
│       │   ├── agents.rs         # S4/S5 bounded agent invocation
│       │   └── inbox.rs          # Epii/Nara review inbox over gateway/session/task
│       │
│       ├── gateway/              # Native Rust S3' gateway client
│       │   ├── mod.rs
│       │   ├── connection.rs     # WebSocket client with handshake, auth, reconnect
│       │   ├── rpc.rs            # JSON-RPC 2.0 protocol (Request/Response/Event frames)
│       │   ├── session.rs        # SessionRecord, GatewaySessionRow, canonical key handling
│       │   └── events.rs         # Event subscription, gap detection, passthrough list
│       │
│       ├── clock/                # PortalClockState and Kairos
│       │   ├── mod.rs
│       │   ├── state.rs          # PortalClockState struct + Arc<Mutex<>> wrapper
│       │   ├── quaternion.rs     # Quaternion math (4 charges → w/x/y/z)
│       │   ├── oracle.rs         # OracleFaces (primary/deficient/implicate + temporal hex)
│       │   ├── kairos.rs         # KairosState (10 planets + hour + active chakra)
│       │   ├── degree.rs         # Hexagram, tarot, chakra mapping per degree
│       │   └── tick.rs           # tick12 quantization, branch lens, transform/logos stages
│       │
│       ├── temporal/             # SpaceTimeDB + Redis temporal projection
│       │   ├── mod.rs
│       │   ├── spacetime.rs      # Subscription client (native WebSocket + HTTP SQL fallback)
│       │   ├── session_surface.rs
│       │   ├── kairos_surface.rs
│       │   └── runtime_state.rs  # PortalRuntimeState (DAY/NOW/vault root/session lineage)
│       │
│       ├── graph/                # Neo4j client
│       │   ├── mod.rs
│       │   ├── client.rs         # neo4rs wrapper
│       │   └── queries.rs        # Curated cypher (getGraph, getNodeById, backlinks)
│       │
│       ├── vault/                # S1/S1' filesystem and Obsidian conventions
│       │   ├── mod.rs
│       │   ├── paths.rs          # resolveIdeaRoot, resolvePresentRoot, daily-note paths
│       │   ├── tree.rs           # File tree with bimba/pratibimba/empty section detection
│       │   ├── frontmatter.rs    # YAML frontmatter parsing (gray-matter equivalent)
│       │   ├── flow.rs           # Flow entry save with versioning (FLOW-YYYY-MM-DD.md)
│       │   ├── backlinks.rs      # Wiki-link resolution + backlink scan
│       │   └── daily.rs          # Daily note resolution (today/dated)
│       │
│       └── agents/               # S4/S5 bounded agent invocation
│           ├── mod.rs
│           ├── vak.rs            # VAK evaluation (CPF, CT, CP, CF, CFP, CS)
│           ├── envelope.rs       # Typed invocation envelope (NOT slash strings)
│           ├── execution.rs      # Run tree, tool stream, diagnostics
│           └── inbox.rs          # Aletheia/Anima deposit ingestion
│
├── src/                          # React 19 + TypeScript renderer (Vite)
│   ├── main.tsx                  # React root
│   ├── App.tsx                   # Top-level layout + portal grammar shell
│   ├── index.css
│   │
│   ├── shell/                    # 0 / / / 1 portal shell
│   │   ├── PortalShell.tsx       # Three-pane shell with hotkey-driven transitions
│   │   ├── LeftSide.tsx          # Integrated clock-cosmos (M1/M2/M3 fused, always running)
│   │   ├── RightSide.tsx         # Switchable workspace among M4 / M5 / M0
│   │   ├── OmniPanelOverlay.tsx  # ESC-summoned universal overlay
│   │   ├── InfoPoolSlideOut.tsx  # Cmd+I KBase info-pool from right edge
│   │   ├── Sidebar.tsx           # M0'-M5' domain switcher (preserves existing)
│   │   ├── Header.tsx
│   │   ├── TopBar.tsx
│   │   ├── BottomDock.tsx        # Clock pulse, NOW indicator, gateway status
│   │   ├── CommandPalette.tsx    # Cmd+K, dispatches to `/` registry
│   │   └── hotkeys/
│   │       ├── registry.ts       # parseHotkey, matchesHotkey (preserved)
│   │       └── bindings.ts       # Cmd+Shift+{1,2,3} emphasis · Cmd+Shift+{4,5,0} right workspace · Cmd+Opt+{0,1} side full-screen · Cmd+I info-pool · ESC OmniPanel
│   │
│   ├── services/                 # Typed Tauri command clients (replaces window.sPrime)
│   │   ├── invoke.ts             # Thin wrapper around @tauri-apps/api/core invoke
│   │   ├── events.ts             # listen() helpers
│   │   ├── gatewayClient.ts      # All S3 gateway RPC methods
│   │   ├── temporalClient.ts     # PortalClockState reads, kairos subscriptions
│   │   ├── vaultClient.ts        # S1/S1' file/journal/backlinks
│   │   ├── graphClient.ts        # S2 graph queries
│   │   ├── naraClient.ts         # Journal/flow/highlight/modality records
│   │   ├── epiiClient.ts         # Pedagogy/archaeology/library/inbox
│   │   ├── agentExecutionClient.ts  # VAK + Anima/Aletheia dispatch
│   │   └── types.ts              # Shared TS types mirroring Rust structs (codegen target)
│   │
│   ├── stores/                   # Zustand stores (mostly preserved from Electron renderer)
│   │   ├── domainStore.ts        # Current M-domain + inner stratum
│   │   ├── panelStore.ts         # OmniPanel visibility + active panel
│   │   ├── layoutStore.ts        # Pane sizes, breakpoints
│   │   ├── themeStore.ts         # Theme selection
│   │   ├── flowStore.ts          # Flow entries (Nara journal substrate)
│   │   ├── highlightsStore.ts    # Highlight selections + categories
│   │   ├── editorStore.ts        # TipTap editor state
│   │   ├── observabilityStore.ts # Logs, traces
│   │   ├── gatewayStore.ts       # Replaces epiClawGatewayStore — same shape, Tauri-backed
│   │   ├── clockStore.ts         # Mirror of PortalClockState in renderer for React
│   │   └── inboxStore.ts         # Epii/Nara inbox entries
│   │
│   ├── domains/                  # M0'-M5' workspaces (six full sections; see Part VII)
│   │   ├── DomainPlaceholder.tsx
│   │   ├── M0_Anuttara/          # Bimba map / coordinate ground
│   │   ├── M1_Paramasiva/        # Topology / Spanda torus / topological eye
│   │   ├── M2_Parashakti/        # Cymatics / Cymascope / 36-tattva matrix
│   │   ├── M3_Mahamaya/          # Chronos clock / hexagrams / tarot / quaternions
│   │   ├── M4_Nara/              # Journal/Daily/Dream/Oracle + identity matrix
│   │   └── M5_Epii/              # Library / Atelier / VAK execution / inbox
│   │
│   ├── components/               # Cross-cutting components
│   │   ├── omni/                 # OmniPanel orchestrator + 14 panels
│   │   ├── powers/               # Reusable: ForceGraphPower, MarkdownViewer, ClockFace
│   │   ├── editor/               # TipTap editor + HighlightMark + FloatingMenu
│   │   ├── three/                # Three.js helpers (TorusMesh, OrbitControls config)
│   │   └── ui/                   # Buttons, inputs, dialogs (shadcn/ui style)
│   │
│   ├── theme/                    # Theme tokens, domain colors
│   ├── utils/                    # linkRouter, coordinate helpers
│   └── shared/                   # Re-exports of types from src/services/types.ts
│
├── tests/
│   ├── e2e/                      # Playwright (renderer)
│   │   ├── shell.spec.ts
│   │   ├── omnipanel-parity.spec.ts
│   │   ├── nara-flow.spec.ts
│   │   ├── chronos-clock.spec.ts
│   │   └── m0-bimba-map.spec.ts
│   ├── fixtures/                 # Sample vault, sample sessions
│   └── setup-vitest.ts
│
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── playwright.config.ts
└── vitest.config.ts
```

### 2.2 Process model

Tauri 2 has a clean two-process model:

- **Backend (Rust)**: a single Tauri main process holding `AppState` (gateway connection, clock state, runtime state), exposing Tauri commands, listening on a shared S3' WebSocket, polling/subscribing to SpaceTimeDB, mediating Neo4j and filesystem.
- **Frontend (Vite)**: the renderer process — React 19 + TS — using `@tauri-apps/api/core invoke()` for synchronous-ish RPC and `@tauri-apps/api/event listen()` for backend-pushed events.

There is no preload bridge in Tauri. There is no `contextBridge`. The renderer talks to Rust through `invoke('command_name', { args })`. Tauri's capability system replaces Electron's IPC whitelisting.

### 2.3 Data flow at a glance

```
┌────────────────────────────────────────────────────────────────────┐
│ Renderer (React 19)                                                │
│  ┌──────────┐ ┌──────────┐ ┌────────────┐ ┌──────────┐ ┌────────┐  │
│  │ M0' Map  │ │ M3' Clk  │ │ OmniPanel  │ │  Nara    │ │  Epii  │  │
│  └────┬─────┘ └────┬─────┘ └─────┬──────┘ └────┬─────┘ └───┬────┘  │
│       │            │             │             │           │        │
│       └────────────┴─────────────┴─────────────┴───────────┘        │
│                              │                                      │
│              services/* (typed Tauri command clients)               │
└──────────────────────────────┼──────────────────────────────────────┘
                               │ invoke / listen
                               ▼
┌────────────────────────────────────────────────────────────────────┐
│ Tauri Backend (Rust)                                               │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  AppState (Arc<Mutex<...>>): gateway, clock, runtime, db    │   │
│  └─────────────┬───────────────────────────────────────────────┘   │
│                │                                                   │
│   ┌────────────┴─────────────┐                                     │
│   │ commands/* (Tauri RPC)   │                                     │
│   └────┬───────┬────────┬────┘                                     │
│        │       │        │                                          │
│   ┌────▼───┐ ┌─▼──────┐ ┌───▼──────┐ ┌─────────┐ ┌─────┐ ┌──────┐  │
│   │gateway │ │ clock  │ │ temporal │ │  graph  │ │vault│ │agents│  │
│   └───┬────┘ └────────┘ └────┬─────┘ └────┬────┘ └──┬──┘ └──────┘  │
└──────┼─────────────────────┬─┴──────────┬─┴─────────┼──────────────┘
       │                     │            │           │
       ▼                     ▼            ▼           ▼
   S3 Gateway          SpaceTimeDB   Neo4j Bolt   Vault FS
   (WS:18794)          (WS or HTTP) (Bolt:7687)   (~/.../Idea, Present)
```

### 2.4 Tech stack

**Backend:**
- Tauri 2.x (`tauri = "2"`)
- Tokio for async runtime
- `tokio-tungstenite` for WebSocket (gateway + SpaceTimeDB native)
- `reqwest` for HTTP fallback (SpaceTimeDB SQL polling)
- `neo4rs` for Neo4j Bolt protocol (or `reqwest` against Neo4j HTTP API as fallback)
- `serde` + `serde_json` for JSON frame handling
- `gray_matter` for YAML frontmatter (or hand-rolled with `serde_yaml`)
- `walkdir` + `globset` for vault traversal
- `notify` (optional) for vault file watching
- `chrono` for DAY/NOW timestamps
- `nalgebra` for quaternion math (or hand-rolled — quaternion is simple enough)
- `uuid` for session/runtime IDs
- `thiserror` for unified error types
- `tracing` for structured logging

**Frontend:**
- React 19.2
- TypeScript 5.x
- Vite 6.x
- Zustand 4.x with `persist` middleware (preserved from Electron)
- TipTap 3.x (preserved: StarterKit + custom HighlightMark + FloatingMenuExtension)
- TanStack Query (new — for backend command caching)
- `@tauri-apps/api` 2.x
- `react-force-graph-2d` (preserved) for Bimba map at M0-5'
- `@react-three/fiber` + `@react-three/drei` + `@react-three/postprocessing` (preserved) for Spanda torus (M1-3'), Chronos clock 3D layer (M3-5'), Cymascope (M2-5')
- `three` 0.167+
- `d3` 7.x for 720° wheel layout in Chronos clock (M3-5')
- `framer-motion` 12.x for transitions (preserved)
- `lucide-react` for iconography (preserved)
- `tailwindcss` 3.x + `tailwindcss-animate` (preserved)
- `react-resizable-panels` for shell pane sizing
- `react-router-dom` 6.x (preserved)
- `react-markdown` + `remark-gfm` (preserved) for note rendering

### 2.5 Configuration & env

| Env var | Default | Used by |
|---|---|---|
| `EPI_GATEWAY_URL` | `ws://127.0.0.1:18794` | gateway/connection.rs |
| `EPI_GATEWAY_TOKEN` | `(empty)` | gateway/connection.rs |
| `EPI_GATEWAY_PASSWORD` | `(empty)` | gateway/connection.rs |
| `EPI_NEO4J_URL` | `bolt://127.0.0.1:7687` | graph/client.rs |
| `EPI_NEO4J_USER` | `neo4j` | graph/client.rs |
| `EPI_NEO4J_PASSWORD` | `(empty)` | graph/client.rs |
| `EPI_VAULT_IDEA_ROOT` | `~/Documents/Epi-Logos C Experiments/Idea` | vault/paths.rs |
| `EPI_VAULT_PRESENT_ROOT` | `~/Documents/Epi-Logos C Experiments/Idea/Empty/Present` | vault/paths.rs |
| `EPI_SPACETIME_URL` | `ws://127.0.0.1:3000/v1` | temporal/spacetime.rs |
| `EPI_SPACETIME_SUBSCRIPTION_MODE` | `polling` | temporal/spacetime.rs |
| `EPI_SPACETIME_POLL_MS` | `1000` | temporal/spacetime.rs |
| `EPI_LOG_LEVEL` | `info` | tracing init |

Env is read at startup; settings UI in OmniPanel `Settings` panel can override at runtime via `app.update_config` command (writes to a `settings.json` adjacent to vault root, persisted across runs).

---

## Part III — Tauri Backend (`src-tauri/`)

### 3.1 Cargo manifest

```toml
[package]
name = "epi-tauri"
version = "0.1.0"
edition = "2021"
build = "build.rs"
default-run = "epi-tauri"

[lib]
name = "epi_tauri_lib"
crate-type = ["staticlib", "cdylib", "rlib"]

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
# Tauri
tauri = { version = "2", features = ["protocol-asset"] }
tauri-plugin-shell = "2"
tauri-plugin-dialog = "2"
tauri-plugin-fs = "2"
tauri-plugin-window-state = "2"

# Async / IO
tokio = { version = "1", features = ["full"] }
tokio-tungstenite = { version = "0.24", features = ["native-tls"] }
futures-util = "0.3"
reqwest = { version = "0.12", features = ["json", "rustls-tls"], default-features = false }

# Data / serialization
serde = { version = "1", features = ["derive"] }
serde_json = "1"
serde_yaml = "0.9"
gray_matter = "0.2"

# Filesystem / paths
dirs = "5"
walkdir = "2"
globset = "0.4"
notify = { version = "6", optional = true }

# Time
chrono = { version = "0.4", default-features = false, features = ["clock", "serde"] }

# Math
nalgebra = "0.33"

# Graph
neo4rs = "0.7"

# Identifiers
uuid = { version = "1", features = ["v4", "serde"] }

# Errors / logging
thiserror = "2"
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["env-filter"] }

# Optional: Redis for hot temporal context (if needed in v1)
redis = { version = "0.27", features = ["tokio-comp"], optional = true }

[features]
default = ["watcher"]
watcher = ["dep:notify"]
redis-temporal = ["dep:redis"]

[dev-dependencies]
tempfile = "3"
mockito = "1"
```

### 3.2 `tauri.conf.json`

```json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "Epi-Logos",
  "version": "0.1.0",
  "identifier": "com.epi-logos.desktop",
  "build": {
    "frontendDist": "../dist",
    "devUrl": "http://127.0.0.1:5173",
    "beforeDevCommand": "pnpm dev:renderer",
    "beforeBuildCommand": "pnpm build:renderer"
  },
  "app": {
    "windows": [
      {
        "title": "Epi-Logos",
        "width": 1520,
        "height": 960,
        "minWidth": 1200,
        "minHeight": 720,
        "resizable": true,
        "transparent": true,
        "decorations": true,
        "titleBarStyle": "Overlay",
        "hiddenTitle": true
      }
    ],
    "security": {
      "csp": "default-src 'self'; img-src 'self' data: asset: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-eval'; connect-src 'self' ipc: ws://127.0.0.1:18794 ws://127.0.0.1:3000 bolt://127.0.0.1:7687; font-src 'self' data:",
      "assetProtocol": {
        "enable": true,
        "scope": ["**"]
      }
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": ["icons/32x32.png", "icons/128x128.png", "icons/icon.icns", "icons/icon.ico"]
  }
}
```

### 3.3 `capabilities/default.json`

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Capability for the main window",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "shell:allow-open",
    "dialog:allow-open",
    "dialog:allow-save",
    "fs:default",
    "window-state:default"
  ]
}
```

### 3.4 `AppState`

```rust
// src-tauri/src/state.rs

use std::sync::Arc;
use tokio::sync::{Mutex, RwLock};

use crate::clock::PortalClockState;
use crate::gateway::GatewayConnection;
use crate::graph::Neo4jClient;
use crate::temporal::PortalRuntimeState;
use crate::vault::VaultPaths;

pub struct AppState {
    pub gateway: Arc<RwLock<Option<GatewayConnection>>>,
    pub clock: Arc<Mutex<PortalClockState>>,
    pub runtime: Arc<RwLock<PortalRuntimeState>>,
    pub neo4j: Arc<RwLock<Option<Neo4jClient>>>,
    pub vault: Arc<VaultPaths>,
    pub settings: Arc<RwLock<Settings>>,
}

#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct Settings {
    pub gateway_url: String,
    pub gateway_token: Option<String>,
    pub neo4j_url: String,
    pub spacetime_mode: SpacetimeMode,
    pub theme: String,
}

#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub enum SpacetimeMode {
    Polling { interval_ms: u64 },
    NativeWebSocket,
    Disabled,
}
```

### 3.5 Tauri command spine — full signature contract

The renderer **only** invokes these commands. Anything else is a bug. Each command is a `#[tauri::command]` async fn returning `Result<T, AppError>` where `AppError: Serialize`.

#### 3.5.1 `commands/app.rs`

```rust
#[tauri::command]
pub async fn app_version() -> Result<String, AppError>;

#[tauri::command]
pub async fn app_platform() -> Result<String, AppError>;

#[tauri::command]
pub async fn app_get_settings(state: State<'_, AppState>) -> Result<Settings, AppError>;

#[tauri::command]
pub async fn app_update_settings(
    settings: Settings,
    state: State<'_, AppState>,
) -> Result<(), AppError>;
```

#### 3.5.2 `commands/gateway.rs` — replaces all `epiclaws:*` IPC handlers

Every method below corresponds to one of the 35+ S3 gateway RPC methods catalogued in the audit. The Tauri command name uses snake_case; the underlying gateway method is the dotted form.

```rust
// Connection lifecycle
#[tauri::command]
pub async fn gateway_is_connected(state: State<'_, AppState>) -> Result<bool, AppError>;

#[tauri::command]
pub async fn gateway_connection_state(state: State<'_, AppState>) -> Result<ConnectionState, AppError>;

#[tauri::command]
pub async fn gateway_configure(
    config: GatewayConfig,
    state: State<'_, AppState>,
) -> Result<(), AppError>;

#[tauri::command]
pub async fn gateway_connect(state: State<'_, AppState>) -> Result<HelloOk, AppError>;

#[tauri::command]
pub async fn gateway_disconnect(state: State<'_, AppState>) -> Result<(), AppError>;

// Generic RPC
#[tauri::command]
pub async fn gateway_request(
    method: String,
    params: Option<serde_json::Value>,
    state: State<'_, AppState>,
) -> Result<serde_json::Value, AppError>;

// Chat
#[tauri::command]
pub async fn chat_history(
    session_key: String,
    limit: Option<u32>,
    cursor: Option<String>,
    state: State<'_, AppState>,
) -> Result<ChatHistory, AppError>;

#[tauri::command]
pub async fn chat_send(
    session_key: String,
    message: String,
    attachments: Option<Vec<ChatAttachment>>,
    deliver: Option<DeliveryMode>,
    state: State<'_, AppState>,
) -> Result<ChatSendResponse, AppError>;

#[tauri::command]
pub async fn chat_abort(
    session_key: String,
    run_id: Option<String>,
    state: State<'_, AppState>,
) -> Result<AbortResponse, AppError>;

// Sessions (canonical key contract — fixes the sessionKey/key drift)
#[tauri::command]
pub async fn sessions_list(
    filters: SessionFilters,
    state: State<'_, AppState>,
) -> Result<SessionsListResponse, AppError>;

#[tauri::command]
pub async fn sessions_resolve(
    session_key: String,
    state: State<'_, AppState>,
) -> Result<SessionRecord, AppError>;

#[tauri::command]
pub async fn sessions_preview(
    session_key: String,
    state: State<'_, AppState>,
) -> Result<SessionPreview, AppError>;

#[tauri::command]
pub async fn sessions_patch(
    session_key: String,
    patch: SessionPatch,
    state: State<'_, AppState>,
) -> Result<SessionRecord, AppError>;

#[tauri::command]
pub async fn sessions_delete(
    session_key: String,
    delete_transcript: Option<bool>,
    state: State<'_, AppState>,
) -> Result<DeleteResponse, AppError>;

#[tauri::command]
pub async fn sessions_reset(
    session_key: String,
    state: State<'_, AppState>,
) -> Result<SessionRecord, AppError>;

#[tauri::command]
pub async fn sessions_compact(
    session_key: String,
    state: State<'_, AppState>,
) -> Result<CompactResponse, AppError>;

#[tauri::command]
pub async fn sessions_fork(
    session_key: String,
    label: Option<String>,
    state: State<'_, AppState>,
) -> Result<SessionRecord, AppError>;

#[tauri::command]
pub async fn sessions_resume(
    session_key: String,
    state: State<'_, AppState>,
) -> Result<SessionRecord, AppError>;

#[tauri::command]
pub async fn sessions_import(
    source: ImportSource,
    state: State<'_, AppState>,
) -> Result<SessionRecord, AppError>;

#[tauri::command]
pub async fn sessions_tree(
    state: State<'_, AppState>,
) -> Result<SessionTree, AppError>;

// Channels
#[tauri::command]
pub async fn channels_status(
    probe: Option<bool>,
    state: State<'_, AppState>,
) -> Result<ChannelsStatusSnapshot, AppError>;

#[tauri::command]
pub async fn channels_logout(
    channel: String,
    state: State<'_, AppState>,
) -> Result<(), AppError>;

#[tauri::command]
pub async fn web_login_start(
    channel: String,
    force: Option<bool>,
    state: State<'_, AppState>,
) -> Result<LoginStart, AppError>;

#[tauri::command]
pub async fn web_login_wait(state: State<'_, AppState>) -> Result<LoginWait, AppError>;

// Skills
#[tauri::command]
pub async fn skills_status(state: State<'_, AppState>) -> Result<SkillsReport, AppError>;

#[tauri::command]
pub async fn skills_update(
    skill_key: String,
    enabled: Option<bool>,
    api_key: Option<String>,
    state: State<'_, AppState>,
) -> Result<(), AppError>;

#[tauri::command]
pub async fn skills_install(
    skill_key: String,
    name: String,
    install_id: String,
    state: State<'_, AppState>,
) -> Result<(), AppError>;

// Cron
#[tauri::command]
pub async fn cron_status(state: State<'_, AppState>) -> Result<CronStatus, AppError>;

#[tauri::command]
pub async fn cron_list(
    only_enabled: Option<bool>,
    state: State<'_, AppState>,
) -> Result<Vec<CronJob>, AppError>;

#[tauri::command]
pub async fn cron_add(input: CronAddInput, state: State<'_, AppState>) -> Result<CronJob, AppError>;

#[tauri::command]
pub async fn cron_update(
    id: String,
    patch: CronPatch,
    state: State<'_, AppState>,
) -> Result<CronJob, AppError>;

#[tauri::command]
pub async fn cron_run(id: String, mode: CronRunMode, state: State<'_, AppState>) -> Result<(), AppError>;

#[tauri::command]
pub async fn cron_remove(id: String, state: State<'_, AppState>) -> Result<(), AppError>;

#[tauri::command]
pub async fn cron_runs(job_id: String, state: State<'_, AppState>) -> Result<Vec<CronRun>, AppError>;

// Config
#[tauri::command]
pub async fn config_get(state: State<'_, AppState>) -> Result<serde_json::Value, AppError>;

#[tauri::command]
pub async fn config_schema(state: State<'_, AppState>) -> Result<serde_json::Value, AppError>;

#[tauri::command]
pub async fn config_set(
    raw: String,
    base_hash: Option<String>,
    state: State<'_, AppState>,
) -> Result<ConfigSetResponse, AppError>;

#[tauri::command]
pub async fn config_apply(
    apply_session_key: Option<String>,
    state: State<'_, AppState>,
) -> Result<(), AppError>;

#[tauri::command]
pub async fn update_run(state: State<'_, AppState>) -> Result<UpdateResponse, AppError>;

// Presence / debug / logs / nodes / health (signatures elided for brevity — same pattern;
// see Part VIII for full panel-by-panel binding map.)
```

#### 3.5.3 `commands/vault.rs` — S1/S1' file/journal/backlinks

```rust
#[tauri::command]
pub async fn vault_get_today_note(state: State<'_, AppState>) -> Result<Option<DailyNote>, AppError>;

#[tauri::command]
pub async fn vault_get_daily_note(
    date: String, // YYYY-MM-DD
    state: State<'_, AppState>,
) -> Result<Option<DailyNote>, AppError>;

#[tauri::command]
pub async fn vault_list_entries(state: State<'_, AppState>) -> Result<Vec<EntryMetadata>, AppError>;

#[tauri::command]
pub async fn vault_get_entry(
    entry_path: String,
    state: State<'_, AppState>,
) -> Result<Option<EntryData>, AppError>;

#[tauri::command]
pub async fn vault_save_flow_entry(
    date: String,
    content: String,
    metadata: FlowMetadata,
    state: State<'_, AppState>,
) -> Result<(), AppError>;

#[tauri::command]
pub async fn vault_get_flow_entry(
    date: String,
    state: State<'_, AppState>,
) -> Result<Option<FlowEntry>, AppError>;

#[tauri::command]
pub async fn vault_list_flow_versions(
    date: String,
    state: State<'_, AppState>,
) -> Result<Vec<u32>, AppError>;

#[tauri::command]
pub async fn vault_get_flow_version(
    date: String,
    version: u32,
    state: State<'_, AppState>,
) -> Result<Option<FlowEntry>, AppError>;

#[tauri::command]
pub async fn vault_get_file_tree(state: State<'_, AppState>) -> Result<Vec<FileTreeNode>, AppError>;

#[tauri::command]
pub async fn vault_get_file_content(
    path: String,
    state: State<'_, AppState>,
) -> Result<Option<FileContent>, AppError>;

#[tauri::command]
pub async fn vault_get_backlinks(
    path: String,
    state: State<'_, AppState>,
) -> Result<Option<BacklinksData>, AppError>;

#[tauri::command]
pub async fn vault_resolve_wikilink(
    link_text: String,
    state: State<'_, AppState>,
) -> Result<Option<String>, AppError>;
```

#### 3.5.4 `commands/graph.rs` — S2 Neo4j

```rust
#[tauri::command]
pub async fn graph_get_graph(state: State<'_, AppState>) -> Result<Option<GraphData>, AppError>;

#[tauri::command]
pub async fn graph_get_node(
    node_id: String,
    state: State<'_, AppState>,
) -> Result<Option<GraphNode>, AppError>;

#[tauri::command]
pub async fn graph_get_neighbors(
    node_id: String,
    depth: u32,
    state: State<'_, AppState>,
) -> Result<GraphData, AppError>;

#[tauri::command]
pub async fn graph_query(
    cypher: String,
    params: Option<serde_json::Value>,
    state: State<'_, AppState>,
) -> Result<serde_json::Value, AppError>;

// Coordinate-aware queries (M0' map workspace)
#[tauri::command]
pub async fn graph_get_by_coordinate(
    coordinate: String, // "M2-5'", "C4'", etc.
    state: State<'_, AppState>,
) -> Result<Option<GraphNode>, AppError>;

#[tauri::command]
pub async fn graph_walk(
    start_coordinate: String,
    walk_kind: WalkKind, // Topological, Semantic, Temporal
    max_depth: u32,
    state: State<'_, AppState>,
) -> Result<GraphWalkResult, AppError>;
```

#### 3.5.5 `commands/temporal.rs` — PortalClockState + Kairos + DAY/NOW

```rust
#[tauri::command]
pub async fn clock_get_state(state: State<'_, AppState>) -> Result<PortalClockState, AppError>;

#[tauri::command]
pub async fn clock_subscribe(
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<(), AppError>; // emits "clock:state" events on tick

#[tauri::command]
pub async fn clock_oracle_cast(
    coordinate: String,
    primary_degree: Option<u16>,
    state: State<'_, AppState>,
) -> Result<OracleFaces, AppError>;

#[tauri::command]
pub async fn clock_set_branch_lens(
    lens: u8, // 0=Literal..5=KS
    state: State<'_, AppState>,
) -> Result<(), AppError>;

#[tauri::command]
pub async fn clock_set_natal(
    natal: NatalChart,
    state: State<'_, AppState>,
) -> Result<(), AppError>;

#[tauri::command]
pub async fn temporal_get_runtime(state: State<'_, AppState>) -> Result<PortalRuntimeState, AppError>;

#[tauri::command]
pub async fn temporal_get_day_now(state: State<'_, AppState>) -> Result<DayNow, AppError>;

#[tauri::command]
pub async fn temporal_subscribe(
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<(), AppError>; // emits "temporal:runtime" events
```

#### 3.5.6 `commands/agents.rs` — VAK / Anima / Aletheia / Epii

```rust
#[tauri::command]
pub async fn agent_list(state: State<'_, AppState>) -> Result<Vec<AgentDescriptor>, AppError>;

#[tauri::command]
pub async fn agent_vak_evaluate(
    payload: VakPayload,
    state: State<'_, AppState>,
) -> Result<VakEvaluation, AppError>;

#[tauri::command]
pub async fn agent_invoke(
    envelope: InvocationEnvelope,
    state: State<'_, AppState>,
) -> Result<AgentRunHandle, AppError>; // returns run_id; events stream via "agent:run:{id}"

#[tauri::command]
pub async fn agent_run_state(
    run_id: String,
    state: State<'_, AppState>,
) -> Result<AgentRunState, AppError>;

#[tauri::command]
pub async fn agent_abort(
    run_id: String,
    state: State<'_, AppState>,
) -> Result<(), AppError>;

#[tauri::command]
pub async fn agent_continue(
    run_id: String,
    decision: ContinueDecision,
    state: State<'_, AppState>,
) -> Result<(), AppError>;
```

#### 3.5.7 `commands/inbox.rs`

```rust
#[tauri::command]
pub async fn inbox_list(
    filter: InboxFilter,
    state: State<'_, AppState>,
) -> Result<Vec<InboxItem>, AppError>;

#[tauri::command]
pub async fn inbox_get(
    item_id: String,
    state: State<'_, AppState>,
) -> Result<Option<InboxItem>, AppError>;

#[tauri::command]
pub async fn inbox_review(
    item_id: String,
    decision: InboxDecision, // Accept | Reject | Continue { note }
    state: State<'_, AppState>,
) -> Result<(), AppError>;

#[tauri::command]
pub async fn inbox_subscribe(
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<(), AppError>; // emits "inbox:added", "inbox:updated"
```

### 3.6 Event channels (backend → renderer)

The backend pushes events via `app.emit("channel", payload)`. Renderer subscribes via `listen("channel", handler)`.

| Channel | Payload | Source |
|---|---|---|
| `gateway:hello` | `HelloOk` | gateway/connection.rs on connect |
| `gateway:disconnected` | `{ code, reason }` | gateway/connection.rs on close |
| `gateway:event:{event_name}` | gateway event frame | gateway/events.rs forward |
| `clock:state` | `PortalClockState` | clock tick (1Hz default) |
| `clock:oracle_cast` | `OracleFaces` | after `clock_oracle_cast` |
| `temporal:runtime` | `PortalRuntimeState` | spacetime subscription |
| `temporal:kairos` | `KairosState` | spacetime kairos_surface delta |
| `agent:run:{run_id}` | `AgentRunEvent` | agents/execution.rs streaming |
| `inbox:added` | `InboxItem` | inbox/aletheia deposit |
| `inbox:updated` | `InboxItem` | review state change |
| `vault:changed` | `{ paths }` | vault watcher (feature-gated) |

The full passthrough list from the OmniPanel audit (chat, chat.delta, chat.final, chat.error, chat.aborted, agent, device.pair.requested, device.pair.resolved, channels.updated, skills.updated, cron.job.updated, cron.job.executed, config.updated, config.applied) all flow through `gateway:event:{event_name}`.

### 3.7 Gateway connection — handshake, auth, reconnect

`src-tauri/src/gateway/connection.rs` reproduces the existing handshake protocol from `main/s3-gateway-client.ts` exactly:

```rust
pub struct GatewayConnection {
    config: GatewayConfig,
    socket: Option<WsStream>,
    state: ConnectionState,
    pending: Arc<Mutex<HashMap<String, oneshot::Sender<Result<Value, GatewayError>>>>>,
    event_tx: broadcast::Sender<EventFrame>,
    seq_by_event: Arc<Mutex<HashMap<String, u64>>>,
    retry_count: u32,
    instance_id: String,
}

impl GatewayConnection {
    pub async fn connect(&mut self) -> Result<HelloOk, GatewayError> {
        // 1. Open WebSocket to config.url
        // 2. Wait 750ms (or until challenge frame arrives)
        // 3. Send connect request frame:
        //    { type: "req", id: uuid, method: "connect", params: ConnectParams { ... } }
        // 4. Await response frame with same id
        // 5. On ok: mark connected, start ping loop (30s interval), spawn read loop
        // 6. On error: schedule reconnect (exponential 1,2,4,8,16,30s; max 5 retries)
        //    Non-retryable codes: 1008, 4001, 4003, 4008, 4401, 4403
    }

    pub async fn request(&self, method: &str, params: Option<Value>) -> Result<Value, GatewayError> {
        let id = Uuid::new_v4().to_string();
        let (tx, rx) = oneshot::channel();
        self.pending.lock().await.insert(id.clone(), tx);
        self.send_frame(Frame::Request { id: id.clone(), method: method.into(), params }).await?;
        tokio::time::timeout(Duration::from_secs(30), rx).await??
    }

    fn handle_frame(&mut self, frame: Frame) {
        match frame {
            Frame::Response { id, ok, payload, error } => {
                if let Some(tx) = self.pending.lock().await.remove(&id) {
                    let _ = tx.send(if ok { Ok(payload.unwrap_or(Value::Null)) } else { Err(GatewayError::from(error)) });
                }
            }
            Frame::Event { event, seq, payload, .. } => {
                self.check_gap(&event, seq);
                let _ = self.event_tx.send(EventFrame { event, seq, payload });
            }
            Frame::Challenge { nonce } => {
                // optional auth challenge, respond with hashed nonce
            }
        }
    }
}
```

The `connect` request payload mirrors the audit:

```rust
#[derive(Serialize)]
pub struct ConnectParams {
    pub min_protocol: u32,    // 3
    pub max_protocol: u32,    // 3
    pub client: ClientInfo,
    pub role: String,         // "operator"
    pub scopes: Vec<String>,  // ["operator.admin", "operator.approvals", "operator.pairing"]
    pub caps: Vec<String>,
    pub auth: Option<AuthCreds>,
    pub user_agent: String,   // "epi-tauri"
    pub locale: String,       // "en-US"
}
```

Event subscription handles passthrough events automatically on `connect`:

```rust
const PASSTHROUGH_EVENTS: &[&str] = &[
    "chat", "chat.delta", "chat.final", "chat.error", "chat.aborted",
    "agent",
    "device.pair.requested", "device.pair.resolved",
    "channels.updated", "skills.updated",
    "cron.job.updated", "cron.job.executed",
    "config.updated", "config.applied",
];
```

### 3.8 SpaceTimeDB integration

`src-tauri/src/temporal/spacetime.rs` provides two modes selected by `EPI_SPACETIME_SUBSCRIPTION_MODE`:

**Polling mode** (`polling`, default): Periodic `reqwest` POST to `{EPI_SPACETIME_URL}/sql` with cached cypher-like queries against `session_surface` and `kairos_surface`, parsed to `PortalRuntimeState` and `KairosState`, emitted to renderer via `temporal:runtime` and `temporal:kairos` events.

**Native mode** (`native-websocket`): Open WebSocket to `{EPI_SPACETIME_URL}/v1.json.spacetimedb`, subscribe to the two tables, apply reducer-shaped deltas to in-memory state, emit on every change.

**Disabled mode** (`disabled`): No-op. `temporal_get_runtime` returns last hydrated value. Useful for offline development.

```rust
pub trait SpacetimeSource: Send + Sync {
    async fn start(&mut self, app: AppHandle, state: Arc<RwLock<PortalRuntimeState>>) -> Result<(), TemporalError>;
    async fn stop(&mut self) -> Result<(), TemporalError>;
}

pub struct PollingSource { url: String, interval: Duration, /* ... */ }
pub struct NativeWebsocketSource { url: String, /* ... */ }
pub struct DisabledSource;
```

The `runtime_state.rs` defines:

```rust
#[derive(Clone, Serialize, Deserialize)]
pub struct PortalRuntimeState {
    pub day_id: String,           // YYYY-MM-DD
    pub now_path: String,         // canonical NOW vault path
    pub vault_root: PathBuf,
    pub bootstrap: HashMap<String, String>,
    pub kairos_session_id: Option<String>,
    pub pi_active_agent: Option<String>,
    pub model_override: Option<String>,
    pub diagnostics: Vec<RuntimeDiagnostic>,
    pub session_lineage: SessionLineage,
}
```

### 3.9 Neo4j client

`src-tauri/src/graph/client.rs` wraps `neo4rs`:

```rust
pub struct Neo4jClient {
    graph: neo4rs::Graph,
}

impl Neo4jClient {
    pub async fn new(url: &str, user: &str, password: &str) -> Result<Self, GraphError> {
        let graph = neo4rs::Graph::new(url, user, password).await?;
        Ok(Self { graph })
    }

    pub async fn get_full_graph(&self) -> Result<GraphData, GraphError> {
        // MATCH (n) RETURN n LIMIT 500
        // MATCH (a)-[r]->(b) RETURN a, r, b LIMIT 1000
    }

    pub async fn get_node_by_id(&self, id: &str) -> Result<Option<GraphNode>, GraphError> {
        // MATCH (n) WHERE elementId(n) = $id RETURN n
    }

    pub async fn get_by_coordinate(&self, coord: &str) -> Result<Option<GraphNode>, GraphError> {
        // MATCH (n) WHERE n.coordinate = $coord OR n.bimba_coordinate = $coord RETURN n LIMIT 1
    }

    pub async fn walk(&self, start: &str, kind: WalkKind, depth: u32) -> Result<GraphWalkResult, GraphError> {
        // Coordinate walk per WalkKind:
        //   Topological: relations marked relation_type IN ['contains','member_of','sibling','parent']
        //   Semantic:    relations marked semantic OR mef_lens
        //   Temporal:    relations with timestamp filtering, ordered chronologically
    }
}
```

Falls back to `Option<Neo4jClient>` in `AppState`; if Neo4j is unreachable, graph commands return empty results with a `lastError` field rather than failing the renderer.

### 3.10 Vault filesystem

`src-tauri/src/vault/` mirrors the existing `main/repo-paths.ts` and `main/main.ts` filesystem behavior in Rust:

- **paths.rs** — env-driven root resolution (`EPI_VAULT_IDEA_ROOT`, `EPI_VAULT_PRESENT_ROOT`)
- **tree.rs** — recursive `walkdir` traversal; section detection (`bimba`/`pratibimba`/`empty`/`other`) by path prefix
- **frontmatter.rs** — `gray_matter` parsing → `QlFrontmatter` (preserves all coordinate, ql_position, thought_lane, template_id, template_version, primitive_class, source_session, artifact_type, version_lineage, ct_frame, pos_* fields per the canonical `ql-frontmatter` skill)
- **flow.rs** — versioned flow entry persistence: `FLOW-YYYY-MM-DD.md` plus `FLOW-YYYY-MM-DD.v{N}.md` archive on each save
- **backlinks.rs** — full-vault scan for `[[wikilink]]` references; resolved by filename match (case-insensitive)
- **daily.rs** — today/dated daily note paths: tries `YYYY-MM-DD/YYYY-MM-DD.md`, then `YYYY-MM-DD.md`

Optional `notify` watcher (feature-gated `watcher`) emits `vault:changed` events on file mutations.

### 3.11 Error model

```rust
// src-tauri/src/error.rs
#[derive(thiserror::Error, Debug, serde::Serialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum AppError {
    #[error("gateway error: {0}")]
    Gateway(String),
    #[error("graph error: {0}")]
    Graph(String),
    #[error("vault error: {0}")]
    Vault(String),
    #[error("temporal error: {0}")]
    Temporal(String),
    #[error("agent error: {0}")]
    Agent(String),
    #[error("io error: {0}")]
    Io(String),
    #[error("config error: {0}")]
    Config(String),
    #[error("not found: {0}")]
    NotFound(String),
    #[error("unauthorized: {0}")]
    Unauthorized(String),
}
```

Every command returns `Result<T, AppError>`. Tauri serializes the error for renderer consumption.

---

## Part III.5 — Storage Topology

There are exactly four stores. The vault is the system of record; the canonical knowledge graph is one Neo4j instance with three integrated namespaces; user episodic memory lives in Graphiti; pedagogical retrieval over the canonical corpus is RAG-Anything. Notion is a minimal write-only crystallisation target — nothing more.

### 3.5.1 The four stores

| # | Store | Role |
|---|---|---|
| 1 | **Vault** (markdown in `Idea/`) | System of record for everything human-readable — daily notes, flow files, dream/oracle logs, entries, NOW subfolders, canonical wisdom packets, Bimba seed/world/map source documents. Canonical truth; every other store is a derived index. |
| 2 | **Neo4j** (single instance, Community Edition) | The unified canonical knowledge graph. Three namespaces share the database, with cross-namespace relationships native and atomic: <br>• `:Bimba` — the canonical Bimba map (coordinate ontology, MEF lenses, structural relations, P/S/T/L/C/M families). Read-mostly, system-curated. <br>• `:Gnostic` — canonical sources and essays (the corpus the Library serves pedagogically). System-curated; the operator can extend. <br>• `:Atelier_*` — etymology. The linguistic *soil* of all meaning. Words, constellations, aphorisms, register/confidence, Möbius seeds, archaeology sessions. Operator-authored. |
| 3 | **Graphiti** (S3' temporal runtime, S5/S5' governs use) | User episodic memory — the live trace of what *happened* in the operator's sessions. Episode nodes live in the `:Pratibimba` plane, anchored at the PersonalNexus. Per the envelope schema (FLOW-2026-04-22 §9 Episodic Reporting), Graphiti is published by S3' as runtime episode IDs / state / arc tracking, and S5/S5' governs interpretation. |
| 4 | **Notion** (external, minimal) | Write-only crystallisation surface for explicitly-shared artifacts. The operator decides what to crystallise; the system writes. **No bidirectional sync, no auto-ingest from Notion back into the Library.** |

That's all. **RAG-Anything** is the retrieval engine over the `:Gnostic` namespace and sedimented vault corpus; it is not a separate store, it operates on top of Neo4j + the vault. Together with **bimba-mcp** (canonical Bimba retrieval), **Graphiti** (episodic recall), and **kbase** (project-scoped context boundary), it forms the **Context-Economy substrate** (envelope schema §6) from which the agent's info pools are assembled. There is no Qdrant. There is no MongoDB. There is no SQLite for the Atelier.

### 3.5.2 The three namespaces in one Neo4j (canonical labels per real code)

The single Neo4j instance integrates Bimba, Gnostic, and Atelier in coexisting label spaces. The canonical node labels are simple — `:Bimba`, `:Gnostic`, `:Pratibimba`, plus the three Atelier classes (`:Atelier_Word` / `:Atelier_Constellation` / `:Atelier_Aphorism`) for ergonomic Cypher. Cross-namespace edges are first-class Cypher relationships, fully transactional, fully indexed:

```cypher
// ─── Canonical Bimba map (coordinate ontology) ──────────────────────────
(:Bimba {
    coordinate:           "M3",                          // canonical address; UNIQUE
    c_1_name:             "Mahamaya",
    c_4_family:           "M",                           // P | S | T | M | L | C
    c_4_ql_position:      3,
    c_4_ql_category:      "explicate",                   // 'implicate' | 'explicate' | 'both'
    c_3_context_frame:    "(0/1/2/3)",
    // frontmatter properties per the canonical {family}_{n}_{semantic} law
    // (see envelope schema FLOW-2026-04-22 for the full field taxonomy)
    ...
})

// Relationships within the Bimba namespace
(:Bimba)-[:POS0_LINKS_TO|POS1_LINKS_TO|...|VIEWED_THROUGH]-(:Bimba)

// ─── Pratibimba (reflection plane — episodes, personal nexus, etc.) ─────
(:Pratibimba { ... })
(:Pratibimba)-[:BEDROCK]->(:Bimba)                       // PersonalNexus → coordinate anchor

// ─── Canonical sources & essays (Gnostic corpus) ─────────────────────────
(:Gnostic {
    source_id:            "...",
    kind:                 "source" | "essay" | "reference",
    vault_path:           "Idea/Bimba/World/...",
    c_4_family:           "...",                          // when applicable
    ...
})

// ─── Etymology: Atelier — user's linguistic work ────────────────────────
// The three Atelier classes carry distinct labels for ergonomic Cypher;
// they share the Atelier conceptual namespace.
(:Atelier_Word          { word: "HEART", pie_root: "*kerd-", ... })
(:Atelier_Constellation { constellation_id: ULID, name: ..., fold: 6, ... })
(:Atelier_Aphorism      { aphorism_id: ULID, text: ..., ... })

(:Atelier_Word)-[:MEMBER_OF { ordinal: 0, ql_position: 3, essence: "..." }]->(:Atelier_Constellation)
(:Atelier_Word)-[:PATTERNS_WITH {
    constellation_id: "...",
    register:         "constitutional" | "situational",
    confidence:       "certain" | "probable" | "speculative",
    cited_source:     "Etymonline"
}]->(:Atelier_Word)
(:Atelier_Aphorism)-[:CRYSTALLISES]->(:Atelier_Constellation)
(:Atelier_Aphorism)-[:INCORPORATES]->(:Atelier_Word)
(:Atelier_Aphorism)-[:SEEDS]->(:Atelier_Constellation)

// ─── Cross-namespace edges (the integration mesh) ───────────────────────
// Edges carry provenance properties per the canonical {family}_{n}_{semantic} law:
//   c_3_created_at, c_4_confidence (0.0–1.0), c_4_method, c_5_source_ref

(:Gnostic)-[:MAPS_TO_COORDINATE { c_4_confidence, c_4_method, ... }]->(:Bimba)
(:Gnostic)-[:RESONATES_WITH    { ... }]->(:Bimba)
(:Bimba)-[:EXPRESSED_IN        { ... }]->(:Gnostic)

(:Atelier_Aphorism)-[:RESONATES_WITH  { c_4_confidence, c_4_method, ... }]->(:Bimba)
(:Atelier_Constellation)-[:RESONATES_WITH { ... }]->(:Bimba)
(:Atelier_Word)-[:DERIVES_FROM]->(:Gnostic)
```

Single-node ecology in the Atelier is enforced by `MERGE` on `:Atelier_Word { word }`. Bimba nodes are enforced UNIQUE on `coordinate`.

Why this works cleanly on Community Edition: **there is no separate database**. The three label spaces coexist in the single user database that Community gives us. Multi-database (Enterprise) is not needed. Cross-namespace queries are ordinary Cypher.

### 3.5.3 Why this layout

- **Cross-namespace integration is native.** An Atelier aphorism that resonates with a Bimba coordinate is a real `[:RESONATES_WITH]` edge — atomic, transactional, traversable in either direction. No foreign keys, no caches, no consistency dance.
- **Etymology as soil.** The `:Atelier_*` namespace is structurally beneath both Bimba (which it sources via `[:DERIVES_FROM]→:Gnostic` and resonates with via `[:RESONATES_WITH]→:Bimba`) and Gnostic (which often quotes etymological roots). This matches the operator's framing: linguistic meaning is the soil from which canonical structure grows.
- **Graphiti is the integration plane.** User episodic data is where Bimba + Gnostic + Atelier all touch lived experience. An episode in Graphiti can reference any node in the canonical graph; the canonical graph itself does not need to know about episodes. The two-Neo4j operational cost (Graphiti on its own port) is paid once and bought us clean separation between *the system's knowledge* and *what happened to this operator*.
- **No multi-store federation.** Earlier drafts that introduced Qdrant + MongoDB + SQLite were not in the canonical model; removed. RAG-Anything operates over `:Gnostic` + the vault corpus directly; it does not need a separate vector store nor a separate metadata store.

### 3.5.4 Canonical retrieval flow

```
                          ┌────────────────────┐
                          │  Renderer          │
                          │  (React + r3f)     │
                          └─────────┬──────────┘
                                    │
                      (Tauri commands; service clients)
                                    │
       ┌───────────────────┬────────┴────────┬───────────────────┐
       │                   │                 │                   │
  graphClient         naraClient (vault)  graphitiClient   epiiClient.library
       │                   │                 │              (RAG-Anything)
       ▼                   ▼                 ▼                   ▼
  ┌──────────────────────────────┐  ┌──────────────────┐   ┌──────────────────┐
  │  Neo4j (one instance)        │  │  Graphiti        │   │  RAG-Anything    │
  │  ┌─────────────────────────┐ │  │  (S3' temporal   │   │  retriever       │
  │  │ :Bimba    (canonical)   │ │  │   runtime;       │   │  over            │
  │  │ :Gnostic  (corpus)      │ │  │   S5/S5' govern  │   │  :Gnostic        │
  │  │ :Atelier_* (etymology)  │ │  │   use)           │   │  + vault corpus  │
  │  └─────────────────────────┘ │  └──────────────────┘   └──────────────────┘
  │  cross-namespace edges       │
  │  are atomic                  │
  └──────────────────────────────┘

           ┌────────────────────────┐
           │  Vault filesystem      │   (system of record)
           │  (Idea/, FLOW-/DAILY-/ │
           │   ENTRY-/DREAM-/ORACLE-│
           │   + NOW subfolders)    │
           └────────────────────────┘

           ┌────────────────────────┐
           │  Notion (write-only)   │   (operator-curated crystallisation only)
           └────────────────────────┘
```

### 3.5.5 Lifecycle, migration, sync

- **Vault is the source.** Neo4j and Graphiti can be rebuilt from the vault if corrupted (slow but possible). Each store records `last_full_rebuild_at` and `vault_revision_synced` so we know when a delta-sync versus full-rebuild is needed.
- **Neo4j migrations** are coordinated by the gateway (S3) and applied as Cypher migrations on the Neo4j side. Desktop binaries pin to a graph schema version and refuse to start on incompatible mismatch.
- **Graphiti migrations** are coordinated by the Graphiti service itself; desktop reads via API and never writes schema-level facts.
- **Vault → derived sync** is one-directional. The vault file watcher (Rust `notify` feature) emits `vault:changed` events; the canonical-graph indexer ingests changed `:Gnostic` source files; Graphiti ingests new flow/oracle/dream entries as episodes via its own pipeline.
- **Notion writes** happen only on explicit operator action (an explicit "crystallise" command). There is no scheduled sync, no read-back.

### 3.5.6 Required Rust crates (extending Part III.1)

```toml
# In src-tauri/Cargo.toml [dependencies] — additions over Part III.1

# Single Neo4j driver (Bimba/Gnostic/Atelier all use it)
neo4rs = "0.7"

# Graphiti has its own service; talked to via its HTTP API
reqwest = { version = "0.12", features = ["json", "rustls-tls"], default-features = false }

# (No SQLite, no Qdrant, no MongoDB. Removed from earlier drafts.)
```

---

## Part III.6 — Envelope Schema Compliance

The Tauri app is one surface on the **canonical 12-layer envelope** defined in `Idea/Bimba/Seeds/S/FLOW-2026-04-22-ENVELOPE-FIELD-SCHEMA.md`. It must not invent local authority for facts the envelope owns. This Part is a thin alignment note — the envelope spec itself is the canon.

### 3.6.1 The twelve layers

| # | Layer | Owner | What it carries |
|---|---|---|---|
| 1 | **Transport** | S3 | session_key, request_id, channel, target_agent, protocol_version |
| 2 | **Runtime** | S0 + S4 (Khora) | bootstrap_context, workspace_root, tool_surface, permission_boundary |
| 3 | **Temporal** | S3' + S4.3' (Chronos) | day_id, now_id, now_path, session_start, kairos_tick, arc_membership |
| 4 | **Coordinate** | S4' (Anima) + C' law | primary_family, primary_coordinate, cpf, ct, cp, cf, cfp, cs |
| 5 | **Residency** | S1.0' (Hen) | target_vault_zone, residency_class, artifact_ct_type, source_coordinates, sync_destination |
| 6 | **Context-Economy** | S2' + S5' | **source_set, retrieval_mode, scope_coordinates, kbase_pool_id, redis context_key, graph_region_handles, episodic_handles, anansi_web** |
| 7 | **Lived-Environs** | S4.4 (Psyche) | active_context_pack, operative_notebook, current_task, current_subtasks, team_composition |
| 8 | **Execution** | S4.4' (Anima) | intent_class, operative_goal, execution_mode (CPF frame), vak_frame, agent_sequence_position, write_surface |
| 9 | **Episodic Reporting** | S3.4' (Graphiti) + T-family | episode_id, episode_state, live_trace_stream, interim_summary, t_lane_activations, arc_id |
| 10 | **Crystallisation** | S5' (Aletheia + Sophia + subagents) | crystallisation_state, yield_types, sophia_disclosure, anansi_placement, janus_threshold, moirai_weave_targets, zeithoven_next_form, promoted_artifacts, **review_inbox_item** |
| 11 | **Improvement** | S5.4' (Sophia / Darshana / Zeithoven) | improvement_mode, target_family, baseline_artifact, challenger_artifact, evaluation_surface, keep_discard_rule, sophia_vector |
| 12 | **QL Process** | C' + S4.4' | ql_schema_version, ql_modal, ctx_frame_variant, inversion_state, topological_mode, ql_cycle_position, bimba_anchor, pratibimba_mirror, ql_extension_fields |

Every cross-cutting Tauri concern (a save, a query, a cast, a promotion, a coordinate selection) maps to a slice of this envelope. The Tauri app populates the *hot* fields at session start (61 of 118 total fields) and consumes *warm* / *cold* fields on demand.

### 3.6.2 Frontmatter key law — `{family}_{n}_{semantic}`

All vault frontmatter (and all envelope fields) use the canonical `{family}_{n}_{semantic}` form (e.g. `c_4_family`, `s_3_day_id`, `m_3_quaternionic_signature`). This is the same law that governs envelope fields, applied to vault artifacts. Special identifiers outside the scheme: `coordinate`, `c_4_artifact_role`, `c_1_ct_type`, `c_3_ctx_frame`, `c_3_created_at`, `c_3_day_id`, `c_0_source_coordinates`.

The Tauri app validates frontmatter before any vault write through a Hen-compliant validator wrapped as `vault_validate_frontmatter`. Unknown keys are errors, not warnings.

### 3.6.3 Vault residency law (CT taxonomy)

| CT | CF frame | Use | Vault residency |
|---|---|---|---|
| CT0 | `(00/00)` | seed | `Idea/Bimba/Seeds/` |
| CT1 | `(0/1)` | prompt/spec | `Idea/Empty/Present/` |
| CT2 | `(0/1/2)` | task-spec | `Idea/Empty/Present/{DD-MM-YYYY}/{session-id}/tasks/` |
| CT3 | `(0/1/2/3)` | pattern-note | `Idea/Empty/Present/{DD-MM-YYYY}/{session-id}/patterns/` |
| CT4a | `(4.0/1-4.4/5)` | flow / phenomenological journalling | `Idea/Empty/Present/{DD-MM-YYYY}/` (day-folder level) |
| CT4b' | `(4.0/1-4.4/5)` | daily-note + NOW operative notebook | day-folder `daily-note.md` + `{session-id}/now.md` |
| CT5 | `(5/0)` | thought / synthesis | `Idea/Pratibimba/Self/Thought/T{0-5}/` |

The day folder (`Idea/Empty/Present/{DD-MM-YYYY}/`) hosts both:
- **Operator quilt-points** at the top level — daily note, flow, dream, oracle (these are Nara's surfaces)
- **NOW subfolders** `{session-id}/` for each agent task execution thread (these are Anima/Psyche's surfaces; `s_4_operative_notebook` lives at `vault:Empty/Present/{NOW}`)

Nara surfaces and Anima task-execution surfaces share the day folder but **do not mix** — distinct files, distinct authority, distinct purposes.

### 3.6.4 Frontmatter mandatory for any Tauri-side vault write

Per the envelope schema's hot-field requirements:

| Field | Source | Notes |
|---|---|---|
| `coordinate` | operator selection or implicit anchor | required |
| `c_1_ct_type` | mapped from artifact role | required (CT0..CT5) |
| `c_4_artifact_role` | e.g. `"flow"`, `"daily-note"`, `"oracle-log"`, `"now-spec"`, `"entry"` | required |
| `c_3_day_id` | from envelope Layer 3 Temporal | required |
| `c_3_created_at` | ISO 8601 | required |
| `c_3_ctx_frame` | per CT (e.g. `"5/0"` for crystallisation) | required |
| `c_0_source_coordinates` | array of upstream specs (envelope Layer 5) | required (empty if none) |

Session-scoped or agent-authored artifacts additionally carry `s_3_day_id`, `s_4_now_id`, `s_4_now_path`, and (when applicable) `s_4_permission_boundary` per the envelope schema layers 2 and 3.

### 3.6.5 Compliance acceptance criteria

- Every vault write passes through `vault_validate_frontmatter` before persistence; the validator implements the canonical `{family}_{n}_{semantic}` law.
- Day folder is created at `Idea/Empty/Present/{DD-MM-YYYY}/` on first activity of the day, with daily note populated.
- NOW subfolders are created at `{session-id}/` inside the day folder (canonical per envelope `s_4_now_path`); they host `now.md` plus `tasks/ patterns/ thinking/ thoughts/`.
- `thinking/` is task-local and cleared on task close; `thoughts/` survives and is routed by Aletheia's night pass to `Pratibimba/Self/Thought/T{n}/`.
- The 12-layer envelope's hot fields are populated at session start; warm/cold fields are assembled on demand per their cost tier.

---

## Part IV — PortalClockState (M3' authority)

The clock is not a feature. It is the heartbeat. Every other M' surface reads from it.

### 4.1 The full struct

```rust
// src-tauri/src/clock/state.rs

use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct PortalClockState {
    // Identity anchor
    pub session_hash: [u8; 32],

    // Quaternion layer (drives torus rotation across all M' visualisations)
    pub live_quaternion: [f32; 4],          // From oracle charges (pp/nn/np/pn -> w/x/y/z)
    pub quintessence_quaternion: [f32; 4],  // Weighted elemental average from natal data

    // Oracle layer
    pub current_degree: u16,                // 0-359
    pub tick12: u8,                         // Canonical M1 tick: 0-11 (discrete SPANDA)
    pub last_cast: Option<OracleFaces>,
    pub last_cast_timestamp: u64,

    // Branch state (#4.1-#4.5 — Lemniscate fractal doubling)
    pub earth_body: EarthBodyState,
    pub chakra_levels: [f32; 7],            // Root .. Crown
    pub active_branch_lens: u8,             // 0=Literal..5=KS
    pub transform_stage: u8,                // 0..5 SEED..META
    pub logos_stage: u8,                    // 0..5 A-Logos..An-a-Logos

    // Kairos layer (full live planetary state)
    pub kairos: KairosState,                // 10 planets + current_hour + active_chakra

    // Multiplayer anchor (for SpaceTimeDB)
    pub orbital_position: [f32; 3],         // 3D position on the canonical torus
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct OracleFaces {
    pub primary_degree: u16,
    pub deficient_degree: u16,    // (primary + 180) % 360
    pub implicate_degree: u16,    // antipodal spinor: same degree, opposite phase
    pub temporal_hex: u8,         // primary_hex with changing_lines applied
    pub primary_hex: u8,
    pub changing_lines_mask: u8,  // 6-bit
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct PlanetState {
    pub degree: u16,              // 0-359; 0xFFFF = unavailable
    pub is_retrograde: bool,
    pub is_resonance: bool,       // transiting decan it rules
    pub transiting_hex: u8,
    pub transiting_tarot: u8,
    pub transiting_chakra: u8,
    pub is_transpersonal: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct KairosState {
    pub planets: [PlanetState; 10],   // Sun(0)..Pluto(9)
    pub current_hour: u8,             // 0-23 planetary hour
    pub hour_planet: u8,              // PlanetId ruling this hour
    pub active_chakra: u8,            // 0..6
    pub timestamp: u64,
    pub valid: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct EarthBodyState {
    pub element: u8,                  // 0=Earth..3=Water
    pub modality: u8,                 // 0=Cardinal,1=Fixed,2=Mutable
    pub house: u8,                    // 1..12
}
```

### 4.2 Quaternion derivation from oracle

The four oracle faces map onto quaternion axes:

```
pp (primary positive)    -> w   (real axis)
nn (deficient negative)  -> x
np (implicate positive)  -> y
pn (temporal-shift)      -> z
```

The "charges" are computed from the cast: `pp` is the unitary intensity of the primary degree's hexagram-line agreement; `nn` is the structural complement's; `np` is the antipodal (opposite-phase) spinor; `pn` is the temporal-shift after applying `changing_lines_mask`.

```rust
// src-tauri/src/clock/quaternion.rs
pub fn quaternion_from_oracle(faces: &OracleFaces) -> [f32; 4] {
    // Compute four scalar charges from the OracleFaces structure
    let pp = degree_to_unit_charge(faces.primary_degree);
    let nn = degree_to_unit_charge(faces.deficient_degree);
    let np = degree_to_unit_charge(faces.implicate_degree);
    let pn = hex_shift_charge(faces.primary_hex, faces.temporal_hex, faces.changing_lines_mask);

    // Normalize (w,x,y,z) into a unit quaternion
    let mag = (pp * pp + nn * nn + np * np + pn * pn).sqrt().max(1e-6);
    [pp / mag, nn / mag, np / mag, pn / mag]
}

pub fn quintessence_from_natal(natal: &NatalChart) -> [f32; 4] {
    // Weighted elemental average across natal placements:
    // - sun, moon, ascendant given highest weight
    // - other personal planets medium
    // - transpersonal planets low
    // Maps elemental sum (fire,earth,air,water) -> (w,x,y,z) and normalizes.
    // ...
}
```

### 4.3 Tick semantics

The clock has two distinct ticking schedules:

- **Continuous live_quaternion** updates every `clock_tick_ms` (default 50ms — 20Hz) via interpolation between oracle casts. Drives smooth torus rotation.
- **Discrete tick12** quantized to 0–11 representing the canonical M1 SPANDA position. Updates when the live degree crosses a 30° boundary. Quantized **integer** — never exposed as a float to renderers.
- **Kairos refresh** every 60 seconds via the configured astrology source (Kerykeion or stored ephemeris). On refresh, planet states update and `current_hour` may roll over.
- **State emit** to renderer: every change to `tick12`, `kairos.current_hour`, or after any oracle cast. Renderers should also subscribe to a 1Hz heartbeat for `live_quaternion` interpolation if they need live torus rotation.

### 4.4 Renderer mirror — `clockStore.ts`

```typescript
// src/stores/clockStore.ts
import { create } from 'zustand';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import type { PortalClockState, OracleFaces } from '@/services/types';

interface ClockStore {
  state: PortalClockState | null;
  loading: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  subscribe: () => Promise<() => void>;
  oracleCast: (coordinate: string, primaryDegree?: number) => Promise<OracleFaces>;
  setBranchLens: (lens: 0 | 1 | 2 | 3 | 4 | 5) => Promise<void>;
}

export const useClockStore = create<ClockStore>((set, get) => ({
  state: null, loading: false, error: null,
  async hydrate() {
    set({ loading: true });
    try {
      const state = await invoke<PortalClockState>('clock_get_state');
      set({ state, loading: false, error: null });
    } catch (e) {
      set({ loading: false, error: String(e) });
    }
  },
  async subscribe() {
    await invoke('clock_subscribe');
    const un = await listen<PortalClockState>('clock:state', (e) => set({ state: e.payload }));
    return un;
  },
  async oracleCast(coordinate, primaryDegree) {
    const faces = await invoke<OracleFaces>('clock_oracle_cast', { coordinate, primaryDegree });
    await get().hydrate();
    return faces;
  },
  async setBranchLens(lens) {
    await invoke('clock_set_branch_lens', { lens });
    await get().hydrate();
  },
}));
```

The store hydrates on mount, then `subscribe()` keeps it live. M2', M3', M4', M5' surfaces all read from this single store. **There is no per-domain clock state.**

---

## Part IV.5 — Hopf Fibration Clock Architecture

The clock is not a 2D dial with planets painted on. It is a **discretised Hopf fibration S³ → S²** with the user (Earth, M4.4.4.4 PersonalNexus) at the geocentric origin. Every visualisation in the system that involves time, kairos, or user-on-earth — the Chronos clock at M3-5', the orbital position of Bimba nodes in M0-5'/M1-5', the Cymascope's quaternion-rotated canvas at M2-5', the Spanda torus at M1-3', the chakra spine at M4-1', the multiplayer presence on the shared clock plane — consumes the same Hopf-fibration substrate.

This Part is the canonical contract. It supersedes any naive torus rendering and is drawn from `Idea/Bimba/Seeds/S/S4/S4'/Legacy/superpowers/specs/2026-04-03-cosmic-clock-hopf-renderer-design.md` (canonical), the existing Rust implementation in `Body/S/S0/epi-cli/src/portal/clock_state.rs`, and the dynamicmath.xyz Hopf fibration reference for Three.js fibre rendering.

### 4.5.1 The mathematical setup

```
    Total space S³  =  unit quaternions {(w,x,y,z) ∈ R⁴ : w²+x²+y²+z² = 1}
    Base space  S²  =  ecliptic 2-sphere of kairos states
    Fibre       S¹  =  spanda ring of phase angles (0..τ, quantised to tick12 = 0..11)

    Hopf map h: S³ → S²   (q ↦ q·i·q⁻¹  or equivalently the spinor formula below)

    Stereographic projection π: S³ → R³   (for rendering, omitting north pole)
        π(x₁,x₂,x₃,x₄) = (x₁/(1-x₄), x₂/(1-x₄), x₃/(1-x₄))
```

**Geocentric frame.** Earth (the user, M4.4.4.4 PersonalNexus anchor) sits at the origin of R³ — not on the surface of the projected total space. Everything orbits this origin: planets, oracle markers, other users' fibres. The user is *inside* the fibration, not on it.

**The torus IS the Hopf fibration's natural visualisation.** The canonical embedding uses ecliptic longitude θ as the major-circle coordinate (the S² base direction selected by the sun's position) and spanda substage φ as the minor-circle coordinate (the S¹ fibre angle):

```
Parametric surface:
    x = (R + r·cos φ) · cos θ
    y = (R + r·cos φ) · sin θ
    z =  r · sin φ

with:
    R / r       = 16 / 9      (epogdoon squared-fourth ratio — canonical)
    θ           = degree · τ / 360
    φ           = tick12 · τ / 12
    tick12      = round( ( atan2(y, x) + π ) / τ · 12 ) % 12
```

**385 nodes on the torus surface:** 360 degree nodes (one per ecliptic degree) + 24 backbone nodes (amino-acid-aligned spine ring) + 1 central Axis Mundi at the origin (Earth/user).

**720° double-cover (SU(2)).** A unit quaternion's antipode `-q` represents the same rotation but a different point in S³. The clock surface encodes Strand A (explicate, 0–359°). Strand B (implicate, 360–719°) is the same surface with inverted phase, rendered as a dimmed ghost duplicate at high resolution levels. This is the visual realisation of the SU(2) → SO(3) double cover.

**Spinor / fibre parametrisation** (matches the dynamicmath.xyz pipeline):

```
Given a base point p = (nx, ny, nz) on S²:
    z₁ = √((1 + nz) / 2)
    z₂ = (nx + i·ny) / (2·z₁)

The fibre over p is the circle:
    F_p(θ) = (z₁·e^(iθ), z₂·e^(iθ))   for θ ∈ [0, 2π)

Stereographic projection of each fibre point to R³ gives the rendered Villarceau-linked circle.
```

Two distinct points on S² yield two fibres in S³ that, after stereographic projection to R³, become **linked Villarceau circles**. This is the linking property that makes multiplayer visually meaningful: every two users on the clock plane, at distinct kairos positions, have linked trajectories — visibly intertwined without merging.

**The lift singularity (and how we handle it).** The standard fibre lift `q₀(p) = (1+nz)/√(2(1+nz)) · ...` degenerates as `p → (0,0,-1)` (the south pole of S²). The Hopf bundle is non-trivial — there is no global product chart on S³ — so this is mathematically unavoidable, not an implementation defect. **Architectural decision:** we park the singularity at a designated "null state" never assigned to a real user — specifically the `(0,0,-1)` point reserves the canonical `pratibimba_coordinate = "M0.0.0.0"` (the apophatic ground, never a user). When a user's `composed_quaternion` would project arbitrarily close to the south pole (within `ε = 1e-3` of `nz = -1`), the backend nudges by a tiny rotation around `i` and emits a `clock:nudge` diagnostic. In practice this region is unreachable from natal-derived quintessence data; the safeguard is paranoia, not regular flow.

This also justifies the canonical wire format: each user broadcasts the **full quaternion** (4× f32 = 16 bytes) rather than `(p, θ)` separately. Sending the quaternion directly avoids the lift convention on the wire entirely; remote clients reconstruct `(p, θ)` only when they need it for UI display, using their local copy of the lift convention. The `composed_quaternion` field in `clock_presence` is therefore the *canonical* presence broadcast; `orbital_position` and `fibre_phase` are derived and sent alongside only as a transport-level cache (saves remote clients one quat-multiply + one stereographic projection per remote user per frame). On a slow link a backend can drop those cache fields and remote clients re-derive cheaply.

### 4.5.2 The three composing quaternions

Three quaternions compose to drive the live view. Each has a distinct provenance, lifecycle, and meaning. **They are not interchangeable.** This is the operating substrate; everything else is downstream.

| Quaternion | Provenance | Update trigger | Meaning |
|---|---|---|---|
| `quintessence_quaternion` | Identity profile (natal chart + 5 augmented identity layers, BLAKE3-hashed) | `epi nara identity augment` | Stable orientation — *who you are*. Constant across a session unless identity is augmented. |
| `transit_quaternion` | Kerykeion ephemeris elemental distribution (sun/moon/mercury... mapped to fire/earth/air/water weights) | Every 60s kairos sync (or on `epi nara kairos sync`) | Current sky — *when it is*. Slow drift over hours/days. |
| `live_quaternion` | Oracle cast charges (pp / nn / np / pn) | Every oracle cast (`epi nara oracle cast`) | Active engagement — *what you're doing*. Discrete jumps on cast. |

**Composition** is quaternion product:

```
composed = normalize(quintessence ⊗ transit ⊗ live)
```

The composed quaternion is the user's current point in S³ — the unique Hopf preimage of their current kairos-and-engagement state. Its projection under h gives a point on the kairos sphere (S²); under stereographic projection it gives the user's position in the rendered R³ scene.

**View quaternion** (camera control, user-driven via mouse/keyboard) is applied *on top* of `composed` and does not feed back into the data layer:

```
final_view_rotation = view_quaternion ⊗ composed
```

This is critical: rotating the camera is presentation, not state. Casting an oracle changes `live_quaternion` and therefore changes the structure; rotating with the mouse only changes the angle from which you see it.

### 4.5.3 Walk modes are the Hopf symmetry generators

The four canonical walk modes are not labels — they are the generators of the Hopf fibration's symmetry group, mapped to the four quaternion components:

| Walk | Dominant component | Movement | Element |
|---|---|---|---|
| `GROUND` | w | Stay put on the current fibre and base point | EARTH |
| `TORUS` | x | Advance θ along the major circle (S² base sweep) | FIRE |
| `FIBER` | y | Flip φ along the minor circle (S¹ fibre traversal — the # operator) | WATER |
| `SPANDA` | z | Advance θ + flip φ simultaneously (double-helix) | AIR |

Walk mode is a renderer + agent-execution input. When the operator is in `TORUS` walk, oracle casts and pedagogy sessions advance their base coordinate; in `FIBER` walk, casts toggle the inversion (the # operator); in `SPANDA` walk, casts traverse the double-helix (both at once).

### 4.5.4 The full `PortalClockState` (canonical, supersedes Part IV)

This struct is identical to the Rust struct in `Body/S/S0/epi-cli/src/portal/clock_state.rs` plus the multiplayer extensions. Every Tauri renderer reads from a mirror of this state.

```rust
// src-tauri/src/clock/state.rs (Tauri port — mirrors S0 CLI implementation)

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct PortalClockState {
    /// Identity anchor — BLAKE3(quintessence_hash || session_start_u64). 32 bytes.
    /// Routes SpacetimeDB presence and locks the user's M4.4.4.4 Pratibimba anchor.
    pub session_hash: [u8; 32],

    /// Quaternion layer
    pub quintessence_quaternion: [f32; 4],   // [w=EARTH, x=FIRE, y=WATER, z=AIR] — stable identity
    pub transit_quaternion: [f32; 4],        // From kerykeion ephemeris
    pub live_quaternion: [f32; 4],           // From last oracle cast charges (pp/nn/np/pn)
    pub composed_quaternion: [f32; 4],       // = normalize(quintessence ⊗ transit ⊗ live)

    /// Oracle layer (degree-and-tick projection of the composed quaternion onto S²)
    pub current_degree: u16,                 // 0–359 ecliptic
    pub tick12: u8,                          // 0–11 spanda substage
    pub last_cast: Option<OracleFaces>,
    pub last_cast_timestamp: u64,

    /// Branch state (#4.1–#4.5 — Lemniscate fractal doubling)
    pub earth_body: EarthBodyState,          // Element/modality/house anchor
    pub chakra_levels: [f32; 7],             // Root..Crown, derived from composed quaternion
    pub active_branch_lens: u8,              // 0..5 (which MEF lens is active)
    pub transform_stage: u8,                 // 0..5 SEED..META (#4.3 cycle)
    pub logos_stage: u8,                     // 0..5 A-Logos..An-a-Logos (#4.5)
    pub walk_mode: WalkMode,                 // GROUND | TORUS | FIBER | SPANDA

    /// Kairos layer (full live planetary state)
    pub kairos: KairosState,                 // 10 PlanetState + hour + active chakra

    /// Hopf rendering anchor
    pub orbital_position: [f32; 3],          // Stereographic projection of composed_quaternion to R³
    pub fibre_phase: f32,                    // S¹ phase ∈ [0, τ) — drives micro-orbit animation
    pub bifurcation_lambda: f32,             // 0.0..1.0 → resolution cascade (6 / 12 / 36 / 72)

    /// Pratibimba anchor
    pub pratibimba_coordinate: String,       // canonically "M4.4.4.4" — locked at session start
}
```

The `composed_quaternion` and `orbital_position` are derived (not stored as ground truth in earlier specs) — promoting them to first-class fields is intentional: it lets the renderer mirror exactly what the backend computed, eliminating drift between Rust math and JS math.

**Chakra derivation from composed quaternion** (preserved from the existing `M4SpinePlugin`):

```rust
pub fn chakras_from_composed(q: [f32; 4]) -> [f32; 7] {
    let [w, x, y, z] = q;
    [
        (w * 0.8 + z * 0.2).clamp(0.0, 1.0),  // Root:    Earth + Air
        (y * 0.9 + w * 0.1).clamp(0.0, 1.0),  // Sacral:  Water
        (w * 0.6 + x * 0.4).clamp(0.0, 1.0),  // Solar:   Earth + Fire
        (z * 0.6 + y * 0.4).clamp(0.0, 1.0),  // Heart:   Air + Water
        (z * 0.8 + x * 0.2).clamp(0.0, 1.0),  // Throat:  Air
        (x * 0.5 + y * 0.5).clamp(0.0, 1.0),  // Ajna:    Fire + Water
        (x * 0.9 + z * 0.1).clamp(0.0, 1.0),  // Crown:   Fire
    ]
}
```

If chakra variance is `< 0.02`, the system is in **Quintessence state** — render with the central ◉ marker and skip the per-chakra colouring (all chakras balanced).

### 4.5.5 The M4.4.4.4 PersonalNexus anchor

The user-on-earth coordinate `M4.4.4.4` is the canonical Pratibimba anchor — the bodily nexus of the user inside the Hopf fibration. It is **not a render position** (that's `orbital_position`); it is the **identity-locked Neo4j anchor** to which every personal artifact attaches and through which every multiplayer interaction is mediated.

QL coordinate breakdown:

```
#4         raw Context/Type archetype (Lemniscate domain)
.4         first nesting → Personal/Nara (M4)
.4.4       second nesting → fourfold sub-branches of M4 (Identity, Flow, Oracle, Medicine)
.4.4.4     third nesting → quaternary frame (the four oracle charges pp/nn/np/pn)
.4.4.4.4   fourth nesting → integration through the (4.0/1 ↔ 4.4/5) fractal doubling
```

The four-deep recursion expresses the Lemniscate's self-fold: the Context archetype turning inward through nested 4-fold doublings until it locates the unique bodily anchor where *this user, here, now* is embedded in the Hopf structure.

**Initialisation** (`epi nara pratibimba init`):
1. Compute `quintessence_hash` = BLAKE3 of birth chart + 5 identity layers
2. Compute `session_hash` = BLAKE3(quintessence_hash || current_unix_seconds)
3. Open Neo4j connection; `MERGE` a `PersonalNexus` node with `coordinate: "M4.4.4.4"` and `session_hash` property
4. Lock the anchor for the session — every artifact (flow entry, oracle cast, journal highlight, atelier word, library aphorism) attaches `[:ANCHORED_TO]→PersonalNexus` for retrieval-by-self-reflection

**Tauri commands:**

```rust
#[tauri::command]
pub async fn pratibimba_init(state: State<'_, AppState>) -> Result<PersonalNexus, AppError>;

#[tauri::command]
pub async fn pratibimba_excavate(
    term: String,
    max_depth: u32,
    state: State<'_, AppState>,
) -> Result<Vec<NexusPath>, AppError>; // BFS from PersonalNexus through personal episodic graph

#[tauri::command]
pub async fn pratibimba_record_cycle(
    cycle_id: String,
    transformation: TransformationCycle,
    state: State<'_, AppState>,
) -> Result<(), AppError>;

#[tauri::command]
pub async fn pratibimba_atlas_sync(
    state: State<'_, AppState>,
) -> Result<AtlasSyncResult, AppError>; // anonymise + push patterns to shared atlas
```

### 4.5.6 SpaceTimeDB multiplayer schema — the shared clock plane

Multiple users share a single rendered clock plane. Each user contributes a presence row; the renderer subscribes and draws every other user's fibre alongside the local user's. Linked Villarceau circles in the projection visually express co-presence-without-merging.

**SpaceTimeDB tables (canonical):**

```sql
-- session_surface: live gateway/session/temporal projection (per Part III.8)
-- already exists; extended with clock-plane fields

CREATE TABLE clock_presence (
    session_hash         BLOB(32) PRIMARY KEY,           -- user identity
    pratibimba_coord     TEXT     NOT NULL,              -- "M4.4.4.4" canonical
    visibility           TEXT     NOT NULL,              -- 'public' | 'circle' | 'private'
    composed_quaternion  BLOB(16) NOT NULL,              -- 4× f32 little-endian
    current_degree       INT      NOT NULL,              -- 0..359
    tick12               TINYINT  NOT NULL,              -- 0..11
    walk_mode            TINYINT  NOT NULL,              -- 0=GROUND..3=SPANDA
    orbital_position     BLOB(12) NOT NULL,              -- 3× f32 (stereographic projection)
    fibre_phase          FLOAT    NOT NULL,              -- S¹ phase
    last_cast_timestamp  BIGINT   NULL,
    label                TEXT     NULL,                  -- optional display name
    updated_at           BIGINT   NOT NULL               -- unix ms
);

CREATE TABLE clock_aspect (
    -- Live aspects between users (conjunction/sextile/square/trine/opposition
    -- when their kairos sphere positions form astrological angles)
    user_a               BLOB(32) NOT NULL,
    user_b               BLOB(32) NOT NULL,
    aspect_kind          TINYINT  NOT NULL,              -- 0=conj..4=opp
    orb                  FLOAT    NOT NULL,              -- degrees
    formed_at            BIGINT   NOT NULL,
    PRIMARY KEY (user_a, user_b, aspect_kind)
);

CREATE TABLE kairos_surface (
    -- Singleton: the shared kairos snapshot (planetary positions)
    snapshot_at          BIGINT   PRIMARY KEY,
    planet_states        BLOB     NOT NULL,              -- bincode of [PlanetState; 10]
    hour_planet          TINYINT  NOT NULL,
    current_hour         TINYINT  NOT NULL
);
```

**Reducers** (SpaceTimeDB-side; Rust `#[reducer]`):

```rust
#[reducer]
fn clock_presence_upsert(ctx: ReducerContext, presence: ClockPresenceUpsert) {
    // Authenticated by ctx.sender; session_hash must match the sender's identity bind.
}

#[reducer]
fn clock_presence_delete(ctx: ReducerContext) {
    // Removes the sender's presence row.
}

#[reducer]
fn kairos_surface_publish(ctx: ReducerContext, snapshot: KairosSnapshot) {
    // Privileged: only the gateway can publish kairos snapshots.
}
```

**Subscription model:**

The Tauri renderer subscribes on app start:

```typescript
// src/services/temporalClient.ts (extended)
export const temporalClient = {
  // ... existing ...
  subscribeClockPresence: (cb: (rows: ClockPresenceRow[]) => void) => {
    // Returns full table snapshot + delta updates as backend emits 'temporal:clock_presence'
    return listen<ClockPresenceRow[]>('temporal:clock_presence', e => cb(e.payload));
  },
  publishLocalPresence: (presence: LocalPresence) =>
    invoke<void>('clock_publish_presence', { presence }),
};
```

The backend runs a continuous publisher (60Hz max, debounced to 2Hz when no movement) pushing the local user's `composed_quaternion`, `orbital_position`, `walk_mode`, and `fibre_phase` to SpaceTimeDB. The renderer mirrors all rows into a `clockPresenceStore` and the Chronos clock + M3-5' scene render every other user's fibre alongside the local user's.

**Visibility:**
- `public` — visible to everyone on the same gateway
- `circle` — visible to a user-defined trust circle (managed via OmniPanel Settings → Clock circle)
- `private` — your presence is not published; you still see public/circle members but you appear as "self only"

### 4.5.7 Renderer architecture (Tauri + React + react-three-fiber)

The clock scene is one `<Canvas>` (react-three-fiber) per surface that needs it (M3-5' Chronos clock, M2-5' Cymascope quaternion overlay, M1-3' Spanda torus). All instances read from `clockStore` and `clockPresenceStore`.

#### Scene composition for M3-5' Chronos clock

```
<Canvas>
  <Stars />                            // background (subtle)
  <ambientLight intensity={0.2} />
  <directionalLight position={[10, 10, 10]} intensity={0.6} />

  <HopfTorus
     R={1.0} r={9/16}
     resolutionLambda={state.bifurcation_lambda}
     composedQuaternion={state.composed_quaternion}
     viewQuaternion={camera.quaternion}
   />

  <DegreeRing nodeCount={360} />        // 360 degree nodes
  <BackboneRing nodeCount={24} />       // 24 amino-aligned spine
  <AxisMundi />                         // central marker (Earth/user)

  <PlanetMarkers planets={state.kairos.planets} natalGhosts={natalChart} />
  <ZodiacGlyphs />                      // 12 sign markers at 30° intervals

  <OracleCastMarker
     primary={faces.primary_degree}
     deficient={faces.deficient_degree}
     implicate={faces.implicate_degree}
     temporal={faces.temporal_degree}
   />

  <UserFibre                            // local user's Hopf fibre
     point={state.orbital_position}
     phase={state.fibre_phase}
     emphasis="strong"
   />

  {presenceRows.map(p => (
     <UserFibre                          // remote users' fibres
        key={p.session_hash}
        point={p.orbital_position}
        phase={p.fibre_phase}
        emphasis={p.aspect_to_local ? "aspected" : "ambient"}
        label={p.label}
     />
  ))}

  {liveAspects.map(a => <AspectLine key={a.id} {...a} />)}

  <OrbitControls enablePan={false} />
</Canvas>
```

#### `<HopfTorus>` implementation notes

- Geometry: `THREE.TorusGeometry(R, r, radialSegments, tubularSegments)` where segments scale with `bifurcation_lambda` (6 → 12 → 36 → 72 minor segments; tubular segments scale with major).
- Material: custom `ShaderMaterial` with vertex shader that *rotates the torus by the composed quaternion* (passed as a uniform), so the torus tilt encodes elemental balance.
- Surface coloring: per-vertex element-coded — fragments at angle θ get red/green/blue/violet weighting from the quaternion components projected onto that θ-bin.
- Tick12 highlight: a uniform `u_active_tick12` causes the current minor segment to be brightened.
- 720° double-cover ghost: a second pass renders the same torus with the quaternion antipode (`-composed_quaternion`) applied, opacity 0.2, additive blending.

#### `<UserFibre>` implementation notes

This is the heart of the multiplayer aesthetic. Each fibre is a Villarceau circle in the stereographic projection.

```typescript
// Given a base point on S² (which is the user's kairos sphere position derived from their
// composed_quaternion under h: S³→S²), compute the fibre's full 3D parametrisation:

function userFibreCurve(s2Point: [number, number, number], phaseOffset: number): THREE.Curve<THREE.Vector3> {
  const [nx, ny, nz] = s2Point;
  const z1Mag = Math.sqrt((1 + nz) / 2);
  // z₁ = z1Mag (real part; imaginary part 0 by gauge)
  // z₂ = (nx + i·ny) / (2·z1Mag)
  return new THREE.Curve<THREE.Vector3>().setFromCallback((t: number) => {
    const theta = (t + phaseOffset) * 2 * Math.PI;
    const cos = Math.cos(theta), sin = Math.sin(theta);
    // (z₁·e^(iθ), z₂·e^(iθ)) in C² = (a+bi, c+di) in R⁴
    const a = z1Mag * cos;
    const b = z1Mag * sin;
    const z2Re = nx / (2 * z1Mag);
    const z2Im = ny / (2 * z1Mag);
    const c = z2Re * cos - z2Im * sin;
    const d = z2Re * sin + z2Im * cos;
    // Stereographic projection of (a,b,c,d) ∈ S³ to R³, omitting north pole singularity:
    const k = 1 / (1 - d);
    return new THREE.Vector3(a * k, b * k, c * k);
  });
}
```

Render the fibre as a `TubeGeometry` along this curve (radius scales with emphasis: 0.005 ambient, 0.012 aspected, 0.020 local user). Apply a glowing material with element-coded colour from the user's composed quaternion.

The `phaseOffset` parameter (animated by the user's `fibre_phase` over time) makes the tube *flow* — visually conveying that the user's trajectory is moving along their fibre even when their kairos sphere position is stable.

**Linking property** is automatic: any two fibres with distinct base points on S² produce two stereographically-projected circles in R³ that are linked **with linking number ±1** (this is the Hopf invariant — it cannot be larger and is never zero between distinct fibres). No special code is needed; it falls out of the geometry.

**Frame construction for tubes** uses **rotation-minimising (Bishop) frames** rather than Frenet frames. Frenet frames degenerate where the curve's curvature flips; Bishop frames are stable along the entire fibre. We compute frames CPU-side once per `(s2_point, phase_offset)` configuration, cache them in a `THREE.BufferGeometry` per-instance attribute, and update only when the user's S² position drifts substantially (not on every phase tick). Reference: <https://research.microsoft.com/en-us/um/people/hoppe/ribbon.pdf>.

**Performance budget** (M-series macOS, 1920×1200, react-three-fiber + WebGL2):

| Tube count | N (longitudinal) | M (radial) | Sustained fps |
|---|---|---|---|
| 5,000 | 64 | 6 | 60 |
| 1,500 | 128 | 12 | 60 (smooth) |
| 500 | (fat-line) | n/a | 60 |
| Highlighted "hero" fibres (local + aspected) | 256 | 16 | overhead negligible alongside ambient |

For our case the budget is generous: typically 1 local user + ≤30 remote presences = ≤31 hero fibres + maybe a few hundred ambient direction-sample fibres for the kairos-sphere texture. Comfortable at 60fps with `bifurcation_lambda = 0.5`. At λ = 1.0 (72-fold) and 100 concurrent users the renderer will autoscale via the adaptive λ feedback in §4.5.7.

#### Resolution cascade (`bifurcation_lambda`)

Following the canonical cascade:

| λ | Minor segments | Render cost | Visible structure |
|---|---|---|---|
| 0.00–0.25 | 6 | low | QL positions only (the six P-positions) |
| 0.25–0.50 | 12 | medium | Base + fibre (full spanda 12-fold) |
| 0.50–0.75 | 36 | medium-high | Decan subdivisions visible |
| 0.75–1.00 | 72 | high | Half-decan resolution |

`bifurcation_lambda` is exposed as a slider in the M3-5' control panel; default 0.33 (12-fold). Adaptive: if frame time exceeds 33ms (under 30fps), backend nudges λ down by 0.1 and emits `clock:state`; if under 16ms (over 60fps), nudges up by 0.05.

### 4.5.8 Tauri command additions

```rust
// src-tauri/src/commands/temporal.rs (extended)

#[tauri::command]
pub async fn clock_compose_quaternion(state: State<'_, AppState>) -> Result<[f32; 4], AppError>;
// Returns composed = normalize(quintessence ⊗ transit ⊗ live)

#[tauri::command]
pub async fn clock_set_walk_mode(
    mode: WalkMode,
    state: State<'_, AppState>,
) -> Result<(), AppError>;

#[tauri::command]
pub async fn clock_set_bifurcation(
    lambda: f32,
    state: State<'_, AppState>,
) -> Result<(), AppError>;

#[tauri::command]
pub async fn clock_set_view_quaternion(
    view: [f32; 4],
    state: State<'_, AppState>,
) -> Result<(), AppError>; // user-driven camera rotation; persisted across launches

#[tauri::command]
pub async fn clock_publish_presence(
    visibility: PresenceVisibility,
    label: Option<String>,
    state: State<'_, AppState>,
) -> Result<(), AppError>;

#[tauri::command]
pub async fn clock_subscribe_presence(
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<(), AppError>; // emits 'temporal:clock_presence' on every update

#[tauri::command]
pub async fn clock_get_active_aspects(
    state: State<'_, AppState>,
) -> Result<Vec<ClockAspect>, AppError>;
```

### 4.5.9 Walkabout — clock as navigator

A "Nara walkabout" is a guided journey through the Bimba coordinate graph **seeded by current clock state**. The torus rotation acts as a 4D slice filter — coordinates aligned with the user's elemental state (composed quaternion) surface first.

**Entry:** From M3-5' Chronos clock the operator clicks the Walkabout panel and chooses one of:

1. **Coordinate walkabout** — current `(degree, tick12)` resolves to a Bimba coordinate (via the canonical 720° → coordinate-space lookup table). System jumps to M0-5' (2D Bimba) or M1-5' (3D Bimba) with that coordinate selected and the camera oriented along the composed quaternion. From there the operator follows edges; the clock continues running in the background.

2. **Modality walkabout (Nara)** — opens M4 with the current cast pre-loaded as journal context. The active `walk_mode` determines the modality: `GROUND` → Daily Note, `TORUS` → Journal, `FIBER` → Dream Journal, `SPANDA` → Oracle.

3. **Pedagogy walkabout (Epii)** — opens M5-1' with a pedagogy session keyed off `active_branch_lens` and seeded by the current cast's hexagram interpretation.

4. **Library walkabout** — opens M5-0' filtered to constellations whose `geometry_class` is currently active (e.g. if the operator is in `SPANDA` walk mode, surface 12-fold double-hexagon constellations first).

The walkabout always returns to M3-5' on close; clock state persists across walkabouts (the operator can cast oracle from a deep walkabout, and the clock updates accordingly even if M3-5' is not the foreground surface).

### 4.5.10 Acceptance criteria — Hopf clock architecture

1. `composed_quaternion` is recomputed and emitted whenever any of `quintessence`, `transit`, `live` mutate; magnitude is exactly 1.0 ± 1e-6 after normalisation.
2. `chakras_from_composed(q)` returns values in [0, 1]; chakra variance < 0.02 yields the Quintessence ◉ marker.
3. The Hopf torus renders at ≥30fps with `bifurcation_lambda = 0.5` (36-fold) on M-series macOS at 1920×1200.
4. A second user joining the gateway and publishing presence appears as a linked fibre in the local user's M3-5' canvas within 1 second of their reducer call.
5. Local user's fibre and remote user's fibre are visibly linked (their projected circles do not pass through one another's interior — verifiable via Linking-Number test in a Playwright fixture with two known kairos positions).
6. Switching `walk_mode` from GROUND to FIBER changes the visible emphasis on the minor circle; oracle casts in FIBER mode toggle the antipodal coordinate, verifiable via degree change of (180°) on cast.
7. `pratibimba_init` produces a Neo4j PersonalNexus node with `coordinate = "M4.4.4.4"` and `session_hash` matching `BLAKE3(quintessence_hash || session_start)`.
8. Adaptive λ tuning: backend nudges λ down within 5 frames when sustained frame time > 33ms.
9. The 720° double-cover ghost renders at λ ≥ 0.5 and is 20% opacity.
10. Camera rotation (view_quaternion) does not feed back into composed_quaternion under any operation.

### 4.5.11 Reference implementations & canonical sources

**Internal canonical sources** (port these directly):

- `Body/S/S0/epi-cli/src/portal/clock_state.rs` — `PortalClockState`, `OracleFaces`, `KairosState`, quaternion composition. The Tauri `src-tauri/src/clock/state.rs` is a direct port.
- `Body/S/S0/epi-cli/src/portal/clock_renderer.rs` — TUI Hopf renderer (braille-canvas raymarched torus). The Tauri renderer replaces this with react-three-fiber but the geometry math is identical.
- `Body/S/S0/epi-cli/src/portal/plugins/clock.rs` — CosmicClockPlugin (structural tab); the canonical 720° degree-ring + 24-backbone + 1-axis-mundi layout.
- `Body/S/S0/epi-cli/src/portal/plugins/spine.rs` — M4SpinePlugin (chakra spine driven by composed quaternion). Renderer mirrors the chakra-derivation formula in §4.5.4.
- `Body/S/S0/epi-cli/src/nara/oracle.rs` — oracle cast logic + 4-face reading (pp/nn/np/pn → quaternion charges).
- `Body/S/S0/epi-cli/src/nara/kairos.rs` — Kerykeion Python subprocess + KairosState parsing.
- `Body/S/S0/epi-cli/src/nara/identity.rs` — quintessence_hash computation (BLAKE3 over natal + 5 augmented identity layers).
- `Body/S/S0/epi-cli/src/nara/pratibimba.rs` — PersonalNexus Neo4j initialisation; the M4.4.4.4 anchor.
- `Body/S/S0/epi-cli/src/gate/spacetimedb_bridge.rs` — SpaceTimeDB sync for live presence + temporal projection.
- `Idea/Bimba/Seeds/S/S4/S4'/Legacy/superpowers/specs/2026-04-03-cosmic-clock-hopf-renderer-design.md` — canonical Hopf-renderer design (this Part IV.5 supersedes for Tauri context but matches mathematically).
- `Idea/Bimba/Seeds/M/M4'/Legacy/plans/CLOCK-AND-NARA-SPECS/09-cosmic-clock-plugin-tui-spec.md` — full TUI plugin spec; informs M3-5' panel layout.
- `Idea/Bimba/Seeds/S/S3/S3'/Legacy/plans/2026-03-10-nara-runtime-full-plan.md` — CLI command reference (oracle / kairos / identity / pratibimba / portal commands).

**External canonical sources:**

- **dynamicmath.xyz Hopf fibration app** — <https://www.dynamicmath.xyz/hopf-fibration/app/> — Three.js, real-time, the exact spinor → fibre → stereographic-projection pipeline; the `<UserFibre>` algorithmic recipe in §4.5.7 mirrors theirs.
- **Niles Johnson's Hopf fibration page** — <https://nilesjohnson.net/hopf.html> — canonical visual reference; the symmetric fibre formula in §4.5.1 is from this exposition.
- **David W. Lyons, "An Elementary Introduction to the Hopf Fibration"**, Mathematics Magazine 76 (2003), 87–98 — pedagogical canon for the math; cite if anyone questions a formula.
- **John Baez, "The Hopf bundle"** — <https://math.ucr.edu/home/baez/week141.html> — gauge-theoretic interpretation; useful for the connection-1-form / Berry-phase semantics if we ever want trajectory-based holonomy as a feature.
- **Wikipedia: Hopf fibration & Villarceau circles** — <https://en.wikipedia.org/wiki/Hopf_fibration>, <https://en.wikipedia.org/wiki/Villarceau_circles> — quick-reference formulae and figures.

**Renderer libraries:**

- `@react-three/fiber` 9.x — canvas + scene graph
- `@react-three/drei` — `<OrbitControls>`, `<TrackballControls>`, `<Tube>`, `<Line2>`, `<Instances>`
- `meshline` (pmndrs) — fat-line geometry for ambient direction-sample fibres if tubes are over-budget
- `three.js` 0.167+ — TubeGeometry, BufferGeometry, ShaderMaterial

---

## Part V — Renderer service clients (replaces `window.sPrime`)

### 5.1 Invoke wrapper

```typescript
// src/services/invoke.ts
import { invoke as tauriInvoke } from '@tauri-apps/api/core';

export async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  try {
    return await tauriInvoke<T>(cmd, args);
  } catch (e) {
    // Normalize { kind, payload? } shape to a typed AppError
    throw normalizeError(e);
  }
}
```

### 5.2 Service clients (one per concern)

Each service is a thin namespace over `invoke()` — no business logic, just typed bindings. This is the new replacement for `window.sPrime.*`.

```typescript
// src/services/gatewayClient.ts
import { invoke } from './invoke';
import type * as T from './types';

export const gatewayClient = {
  isConnected: () => invoke<boolean>('gateway_is_connected'),
  connectionState: () => invoke<T.ConnectionState>('gateway_connection_state'),
  configure: (config: T.GatewayConfig) => invoke<void>('gateway_configure', { config }),
  connect: () => invoke<T.HelloOk>('gateway_connect'),
  disconnect: () => invoke<void>('gateway_disconnect'),
  request: (method: string, params?: unknown) =>
    invoke<unknown>('gateway_request', { method, params }),

  chat: {
    history: (sessionKey: string, limit?: number, cursor?: string) =>
      invoke<T.ChatHistory>('chat_history', { sessionKey, limit, cursor }),
    send: (sessionKey: string, message: string, attachments?: T.ChatAttachment[], deliver?: T.DeliveryMode) =>
      invoke<T.ChatSendResponse>('chat_send', { sessionKey, message, attachments, deliver }),
    abort: (sessionKey: string, runId?: string) =>
      invoke<T.AbortResponse>('chat_abort', { sessionKey, runId }),
  },

  sessions: {
    list: (filters: T.SessionFilters) => invoke<T.SessionsListResponse>('sessions_list', { filters }),
    resolve: (sessionKey: string) => invoke<T.SessionRecord>('sessions_resolve', { sessionKey }),
    preview: (sessionKey: string) => invoke<T.SessionPreview>('sessions_preview', { sessionKey }),
    patch: (sessionKey: string, patch: T.SessionPatch) =>
      invoke<T.SessionRecord>('sessions_patch', { sessionKey, patch }),
    delete: (sessionKey: string, deleteTranscript?: boolean) =>
      invoke<T.DeleteResponse>('sessions_delete', { sessionKey, deleteTranscript }),
    reset: (sessionKey: string) => invoke<T.SessionRecord>('sessions_reset', { sessionKey }),
    compact: (sessionKey: string) => invoke<T.CompactResponse>('sessions_compact', { sessionKey }),
    fork: (sessionKey: string, label?: string) =>
      invoke<T.SessionRecord>('sessions_fork', { sessionKey, label }),
    resume: (sessionKey: string) => invoke<T.SessionRecord>('sessions_resume', { sessionKey }),
    import: (source: T.ImportSource) => invoke<T.SessionRecord>('sessions_import', { source }),
    tree: () => invoke<T.SessionTree>('sessions_tree'),
  },

  channels: {
    status: (probe?: boolean) => invoke<T.ChannelsStatusSnapshot>('channels_status', { probe }),
    logout: (channel: string) => invoke<void>('channels_logout', { channel }),
    loginStart: (channel: string, force?: boolean) =>
      invoke<T.LoginStart>('web_login_start', { channel, force }),
    loginWait: () => invoke<T.LoginWait>('web_login_wait'),
  },

  skills: {
    status: () => invoke<T.SkillsReport>('skills_status'),
    update: (skillKey: string, enabled?: boolean, apiKey?: string) =>
      invoke<void>('skills_update', { skillKey, enabled, apiKey }),
    install: (skillKey: string, name: string, installId: string) =>
      invoke<void>('skills_install', { skillKey, name, installId }),
  },

  cron: {
    status: () => invoke<T.CronStatus>('cron_status'),
    list: (onlyEnabled?: boolean) => invoke<T.CronJob[]>('cron_list', { onlyEnabled }),
    add: (input: T.CronAddInput) => invoke<T.CronJob>('cron_add', { input }),
    update: (id: string, patch: T.CronPatch) => invoke<T.CronJob>('cron_update', { id, patch }),
    run: (id: string, mode: T.CronRunMode) => invoke<void>('cron_run', { id, mode }),
    remove: (id: string) => invoke<void>('cron_remove', { id }),
    runs: (jobId: string) => invoke<T.CronRun[]>('cron_runs', { jobId }),
  },

  config: {
    get: () => invoke<unknown>('config_get'),
    schema: () => invoke<unknown>('config_schema'),
    set: (raw: string, baseHash?: string) => invoke<T.ConfigSetResponse>('config_set', { raw, baseHash }),
    apply: (applySessionKey?: string) => invoke<void>('config_apply', { applySessionKey }),
  },

  update: {
    run: () => invoke<T.UpdateResponse>('update_run'),
  },

  presence: {
    list: () => invoke<T.PresenceEntry[]>('presence_list'),
  },

  devices: {
    list: () => invoke<T.DevicesList>('device_pair_list'),
    approve: (requestId: string) => invoke<void>('device_pair_approve', { requestId }),
    reject: (requestId: string) => invoke<void>('device_pair_reject', { requestId }),
    rotateToken: (deviceId: string, role: string, scopes?: string[]) =>
      invoke<T.DeviceTokenInfo>('device_token_rotate', { deviceId, role, scopes }),
    revokeToken: (deviceId: string, role: string) =>
      invoke<void>('device_token_revoke', { deviceId, role }),
  },

  debug: {
    status: () => invoke<T.StatusSnapshot>('status_summary'),
    health: () => invoke<T.HealthSnapshot>('health_snapshot'),
    call: (method: string, params?: unknown) => gatewayClient.request(method, params),
  },

  logs: {
    tail: (limit?: number, cursor?: string, level?: T.LogLevel, logger?: string) =>
      invoke<T.LogsResponse>('logs_tail', { limit, cursor, level, logger }),
  },

  nodes: {
    list: () => invoke<T.NodeInfo[]>('node_list'),
  },
};
```

```typescript
// src/services/temporalClient.ts
import { invoke } from './invoke';
import { listen } from '@tauri-apps/api/event';
import type * as T from './types';

export const temporalClient = {
  getRuntime: () => invoke<T.PortalRuntimeState>('temporal_get_runtime'),
  getDayNow: () => invoke<T.DayNow>('temporal_get_day_now'),
  subscribe: () => invoke<void>('temporal_subscribe'),
  onRuntime: (cb: (s: T.PortalRuntimeState) => void) =>
    listen<T.PortalRuntimeState>('temporal:runtime', (e) => cb(e.payload)),
  onKairos: (cb: (k: T.KairosState) => void) =>
    listen<T.KairosState>('temporal:kairos', (e) => cb(e.payload)),
};
```

```typescript
// src/services/vaultClient.ts
import { invoke } from './invoke';
import type * as T from './types';

export const vaultClient = {
  getTodayNote: () => invoke<T.DailyNote | null>('vault_get_today_note'),
  getDailyNote: (date: string) => invoke<T.DailyNote | null>('vault_get_daily_note', { date }),
  listEntries: () => invoke<T.EntryMetadata[]>('vault_list_entries'),
  getEntry: (entryPath: string) => invoke<T.EntryData | null>('vault_get_entry', { entryPath }),
  saveFlow: (date: string, content: string, metadata: T.FlowMetadata) =>
    invoke<void>('vault_save_flow_entry', { date, content, metadata }),
  getFlow: (date: string) => invoke<T.FlowEntry | null>('vault_get_flow_entry', { date }),
  listFlowVersions: (date: string) => invoke<number[]>('vault_list_flow_versions', { date }),
  getFlowVersion: (date: string, version: number) =>
    invoke<T.FlowEntry | null>('vault_get_flow_version', { date, version }),
  getFileTree: () => invoke<T.FileTreeNode[]>('vault_get_file_tree'),
  getFileContent: (path: string) => invoke<T.FileContent | null>('vault_get_file_content', { path }),
  getBacklinks: (path: string) => invoke<T.BacklinksData | null>('vault_get_backlinks', { path }),
  resolveWikilink: (linkText: string) => invoke<string | null>('vault_resolve_wikilink', { linkText }),
};
```

```typescript
// src/services/graphClient.ts
import { invoke } from './invoke';
import type * as T from './types';

export const graphClient = {
  getGraph: () => invoke<T.GraphData | null>('graph_get_graph'),
  getNode: (nodeId: string) => invoke<T.GraphNode | null>('graph_get_node', { nodeId }),
  getNeighbors: (nodeId: string, depth: number) =>
    invoke<T.GraphData>('graph_get_neighbors', { nodeId, depth }),
  query: (cypher: string, params?: unknown) =>
    invoke<unknown>('graph_query', { cypher, params }),
  getByCoordinate: (coordinate: string) =>
    invoke<T.GraphNode | null>('graph_get_by_coordinate', { coordinate }),
  walk: (startCoordinate: string, walkKind: T.WalkKind, maxDepth: number) =>
    invoke<T.GraphWalkResult>('graph_walk', { startCoordinate, walkKind, maxDepth }),
};
```

```typescript
// src/services/naraClient.ts
import { vaultClient } from './vaultClient';
import { agentExecutionClient } from './agentExecutionClient';
import type * as T from './types';

export const naraClient = {
  // Re-uses vault for journal data
  getTodayJournal: vaultClient.getTodayNote,
  getDailyNote: vaultClient.getDailyNote,
  saveFlow: vaultClient.saveFlow,
  getFlow: vaultClient.getFlow,

  // Highlight / sendoff produces typed VAK envelope (not slash strings)
  sendoff: async (highlight: T.FlowHighlight, modality: 'oracle' | 'dream' | 'expand' | 'daily-note', sessionKey: string) => {
    const envelope: T.InvocationEnvelope = {
      kind: 'nara_highlight',
      modality,
      session_key: sessionKey,
      payload: {
        text: highlight.text,
        category: highlight.category,
        from: highlight.from,
        to: highlight.to,
        timestamp: highlight.timestamp,
      },
      day_now: await temporalClient.getDayNow(),
      coordinate: 'M4-4\'',
    };
    return agentExecutionClient.invoke(envelope);
  },

  // Identity matrix surface (M4-0')
  getIdentityMatrix: () => invoke<T.IdentityMatrix>('nara_identity_matrix'),
  saveIdentityMatrix: (matrix: T.IdentityMatrix) =>
    invoke<void>('nara_save_identity_matrix', { matrix }),

  // Oracle suite (M4-2')
  oracleCast: (kind: 'tarot' | 'iching' | 'dream', context?: unknown) =>
    invoke<T.OracleResult>('nara_oracle_cast', { kind, context }),
};
```

```typescript
// src/services/epiiClient.ts
import { invoke } from './invoke';
import { vaultClient } from './vaultClient';
import { graphClient } from './graphClient';
import type * as T from './types';

export const epiiClient = {
  // ─── Library (M5-0' Geometric Folio) ──────────────────────────────
  library: {
    listConstellations: (filter: T.ConstellationFilter) =>
      invoke<T.ConstellationSummary[]>('library_list_constellations', { filter }),
    getConstellation: (constellationId: string) =>
      invoke<T.ConstellationDetail>('library_get_constellation', { constellationId }),
    listAphorisms: (filter: T.AphorismFilter) =>
      invoke<T.AphorismSummary[]>('library_list_aphorisms', { filter }),
    ecologyView: () => invoke<T.EcologyGraph>('library_ecology_view'),
    gapDetection: () => invoke<T.GapInsight[]>('library_gap_detection'),
    openMobius: (aphorismId: string) =>
      invoke<T.AtelierSession>('library_open_mobius', { aphorismId }),
    projectCreate: (name: string, description: string) =>
      invoke<T.Project>('library_project_create', { name, description }),
    publish: (artifactKind: T.ArtifactKind, artifactId: string, visibility: T.Visibility) =>
      invoke<void>('library_publish', { artifactKind, artifactId, visibility }),
    // Vault-backed canonical content (wisdom packets from Idea/Bimba/World/)
    getCanonicalArtifacts: () => vaultClient.getFileTree(),
    getCanonicalFile: (path: string) => vaultClient.getFileContent(path),
  },

  // ─── Atelier (M5-5' Strata Excavator) ─────────────────────────────
  atelier: {
    sessionStart: (userIdHash: string) =>
      invoke<T.AtelierSession>('atelier_session_start', { userIdHash }),
    addWord: (sessionId: string, word: string) =>
      invoke<T.WordNode>('atelier_add_word', { sessionId, word }),
    dialogueTurn: (sessionId: string, userMessage: string, qlHint?: number) =>
      invoke<T.AgentRunHandle>('atelier_dialogue_turn', { sessionId, userMessage, qlHint }),
    setRegister: (sessionId: string, wordA: string, wordB: string,
                  register: T.Register, confidence: T.Confidence, citedSource?: string) =>
      invoke<void>('atelier_set_register', { sessionId, wordA, wordB, register, confidence, citedSource }),
    setQlPosition: (sessionId: string, word: string, qlPosition: number, essence: string) =>
      invoke<void>('atelier_set_ql_position', { sessionId, word, qlPosition, essence }),
    crystallize: (sessionId: string, constellationName: string,
                  aphorismText: string, aphorismType: T.AphorismType) =>
      invoke<T.CrystallizationResult>('atelier_crystallize', {
        sessionId, constellationName, aphorismText, aphorismType,
      }),
  },

  // ─── Pedagogy (M5-1') ─────────────────────────────────────────────
  pedagogy: {
    listTopics: () => invoke<T.PedagogyTopic[]>('epii_pedagogy_topics'),
    startGuided: (topicId: string) => invoke<string>('epii_pedagogy_start', { topicId }),
  },

  // ─── Bimba map exploration (re-uses graph) ────────────────────────
  bimbaWalk: graphClient.walk,
  bimbaByCoordinate: graphClient.getByCoordinate,
  bimbaGeometry: (coordinate: string) =>
    invoke<T.SubGraphGeometry>('graph_geometry_for', { coordinate }),
  bimbaSetGeometryOverride: (coordinate: string, class_: T.GeometryClass) =>
    invoke<void>('graph_set_geometry_override', { coordinate, class: class_ }),

  // ─── Bimba Update System (M5-4' sacred operations) ────────────────
  bimbaUpdate: {
    queueChange: (coordinate: string, property: string, newValue: unknown) =>
      invoke<T.QueuedChange>('bimba_queue_change', { coordinate, property, newValue }),
    reviewQueue: () => invoke<T.QueuedChange[]>('bimba_review_queue'),
    applyQueue: () => invoke<T.BimbaUpdateResult>('bimba_apply_queue'),
    rejectChange: (changeId: string) =>
      invoke<void>('bimba_reject_change', { changeId }),
  },

  // ─── Notion crystallisation (M5-4') ───────────────────────────────
  notionCrystal: {
    crystallize: (artifactKind: T.ArtifactKind, artifactId: string) =>
      invoke<T.NotionCrystal>('epii_crystallize_to_notion', { artifactKind, artifactId }),
    review: (crystalId: string, decision: T.CrystalDecision) =>
      invoke<void>('epii_review_crystal', { crystalId, decision }),
  },

  // ─── MEF lens registry (M5-2') ────────────────────────────────────
  mef: {
    listLenses: () => invoke<T.MefLens[]>('mef_list_lenses'),
    getActiveLens: () => invoke<T.MefLens>('mef_get_active_lens'),
    lensHistory: () => invoke<T.MefLensHistoryEntry[]>('mef_lens_history'),
    lensCommentaryFor: (coordinate: string, lens: T.MefLensId) =>
      invoke<T.MefLensCommentary>('mef_lens_commentary', { coordinate, lens }),
  },

  // ─── Autoresearch (M5-3') ────────────────────────────────────────
};
```

```typescript
// src/services/agentExecutionClient.ts
import { invoke } from './invoke';
import { listen } from '@tauri-apps/api/event';
import type * as T from './types';

export const agentExecutionClient = {
  list: () => invoke<T.AgentDescriptor[]>('agent_list'),
  vakEvaluate: (payload: T.VakPayload) => invoke<T.VakEvaluation>('agent_vak_evaluate', { payload }),
  invoke: (envelope: T.InvocationEnvelope) =>
    invoke<T.AgentRunHandle>('agent_invoke', { envelope }),
  runState: (runId: string) => invoke<T.AgentRunState>('agent_run_state', { runId }),
  abort: (runId: string) => invoke<void>('agent_abort', { runId }),
  continue: (runId: string, decision: T.ContinueDecision) =>
    invoke<void>('agent_continue', { runId, decision }),
  onRunEvent: (runId: string, cb: (e: T.AgentRunEvent) => void) =>
    listen<T.AgentRunEvent>(`agent:run:${runId}`, (e) => cb(e.payload)),
};
```

### 5.3 Type bridge

`src/services/types.ts` is the canonical TS mirror of every Rust struct exposed across the IPC boundary. It is hand-maintained for now, but the long-term path is `ts-rs` codegen from Rust:

```rust
// In Rust:
#[derive(Serialize, Deserialize, ts_rs::TS)]
#[ts(export, export_to = "../src/services/types/")]
pub struct PortalClockState { /* ... */ }
```

For the initial build we hand-write the file — but the spec mandates that it stays in sync with the Rust definitions, and CI should run a contract check (build Rust types, dump JSON Schema, compare against TS types). For first cut: hand-write, schedule codegen migration as follow-up.

### 5.6 Agent-Ready Frontend stack (the dual to the Tauri command spine)

The Tauri command spine (Parts III.5 + V.1–V.5) handles **synchronous data plumbing**: filesystem, Neo4j Cypher reads/writes, native dialogs, OS-level IO. That spine stays.

A **parallel agent loop** runs alongside it so that every UI surface — Library, Bimba graph, journal, oracle, atelier, M5-4' VAK panel, inbox — is bidirectionally observable and controllable by agents. The canonical stack is:

| Layer | Choice | Role |
|---|---|---|
| **Wire** | AG-UI (Agent–User Interaction protocol) | Typed event stream between agent backend and Tauri frontend over SSE/HTTP+WS. Canonical event taxonomy: lifecycle / text / tool calls / state / activity / reasoning / custom. |
| **Frontend hooks** | CopilotKit (`useCopilotReadable`, `useCopilotAction`) | React primitives that mark UI state agent-readable and UI affordances agent-callable. The `render` prop on `useCopilotAction` is the seam for "agent paints into this surface". |
| **Generative artifacts** | A2UI (Google's declarative generative UI v0.9) | When the agent needs to author a *novel-shaped* artifact (not pre-designed), it emits an A2UI JSON tree against a client-side catalog of trusted React components. Rides over AG-UI. |
| **Sandboxed third-party widgets** | MCP Apps (Jan 2026 standard) | Iframe-sandboxed widgets exposed by external MCP servers via `ui://` resources. Used only for untrusted/external surfaces. |
| **Voice surface (optional)** | OpenAI Realtime API | Bidirectional speech for oracle voice mode and journal dictation. Tool calls bridge into AG-UI actions. Not the spine — only mounted when activated. |

This stack aligns with the gateway's existing AG-UI surface (the WebSocket service that already carries skill ↔ UI events). The Tauri app speaks AG-UI over that same wire, with CopilotKit as the React-side adapter.

**Explicitly rejected for v1:**
- **WebMCP** (`navigator.modelContext`) — Chromium-Canary-only, not in Tauri's WKWebView; track for future.
- **Anthropic Computer Use** — screenshot-and-input pattern is the wrong shape (drives an existing UI rather than building an agent-native one).
- **Vercel AI SDK RSC `streamUI`** — officially paused; use AI Elements only as supplementary chat-rendering primitives if needed.

#### 5.6.1 AG-UI as the canonical wire

The Tauri renderer talks to the agent runtime over an AG-UI endpoint exposed by the gateway/runtime sidecar (currently port 3033; will be canonicalised into the Tauri sidecar). Events flow:

**Inbound (frontend → agent):** HTTP POST `RunAgentInput`:

```json
{
  "threadId": "session-anchor-uuid",
  "runId": "run-uuid",
  "messages": [...],
  "tools": [ /* every useCopilotAction registered, schema-shaped */ ],
  "context": [ /* every useCopilotReadable surface */ ],
  "state": { /* shared state slice */ },
  "forwardedProps": { /* surface_id, mef_lens, walk_mode, ... */ }
}
```

**Outbound (agent → frontend):** SSE stream of typed AG-UI events. The canonical taxonomy we use:

| Category | Events | Purpose |
|---|---|---|
| Lifecycle | `RunStarted`, `RunFinished`, `RunError`, `StepStarted`, `StepFinished` | Run/step bookkeeping for the M5-4' VAK execution panel and the live tool stream |
| Text | `TextMessageStart` / `Content` / `End` / `Chunk` | Chat tokens streaming into chat surfaces |
| Tool calls | `ToolCallStart` / `ToolCallArgs` / `ToolCallEnd` / `ToolCallResult` / `ToolCallChunk` | Agent invocations of frontend tools (UI affordances) |
| State | `StateSnapshot`, `StateDelta` (RFC 6902 JSON Patch), `MessagesSnapshot` | Shared agent ↔ UI store; the Bimba selection, MEF lens, walk mode, branch lens, active session all live here |
| Activity | `ActivitySnapshot`, `ActivityDelta` | UI-only structured payloads (queued runs, inbox cards, progress widgets); *not* echoed back to LLM context so they don't pollute it |
| Reasoning | `ReasoningStart` / `Content` / `End` / `Chunk` / `MessageStart` / `MessageEnd` / `EncryptedValue` | Optional reasoning trace surface for Developmental-mode introspection |
| Special | `Raw`, `Custom { name, value }`, `MetaEvent` | Escape hatch for domain events: `oracle.card-drawn`, `atelier.crystal-suggested`, `bimba.coordinate-walkabout`, `inbox.deposit` |

Custom events are governed by a typed registry at `src/services/ag_ui/custom_events.ts` so the escape hatch doesn't sprawl.

#### 5.6.2 CopilotKit hooks per surface

Each M' surface mounts its own `useCopilotReadable` and `useCopilotAction` hooks. The agent receives the *union* of all surface contexts and the *union* of all surface affordances. Surface-scoped state and surface-scoped tools — the agent sees a coherent map of the whole app.

**Readable surfaces** (`useCopilotReadable` — what the agent observes):

```typescript
// M0-5' Bimba map 2D
useCopilotReadable({
  description: 'Currently selected Bimba coordinate in the 2D explorer',
  value: { coordinate: selected, fold: detectedFold, qlPosition }
});

// M3-5' Chronos clock
useCopilotReadable({
  description: 'Current clock state — composed quaternion, kairos, last cast',
  value: { composed_quaternion, tick12, kairos, last_cast, walk_mode, branch_lens }
});

// M4-4' Nara flow
useCopilotReadable({
  description: 'Current flow file cursor + recent highlights',
  value: { day_id, cursor_offset, recent_highlights: highlights.slice(-5) }
});

// M5-0' Library
useCopilotReadable({
  description: 'Library view — current corpus filter, selected entry, mode',
  value: { filter, selected_entry, retrieval_kind }
});

// M5-5' Atelier
useCopilotReadable({
  description: 'Atelier session — current Logos Cycle position, working words',
  value: { session_id, current_ql_pos, words, register_edges }
});

// M5-4' VAK execution
useCopilotReadable({
  description: 'Current VAK evaluation + agent execution state',
  value: { vak, routing, payload, runs: runs.map(toSummary) }
});
```

**Actionable surfaces** (`useCopilotAction` — what the agent can invoke):

```typescript
// Bimba navigator
useCopilotAction({
  name: 'bimba.set_branch_lens',
  description: 'Set the active MEF lens (0..5) for Bimba interpretation',
  parameters: [{ name: 'lens', type: 'number', description: '0..5' }],
  handler: async ({ lens }) => clockStore.setBranchLens(lens as 0|1|2|3|4|5),
});

useCopilotAction({
  name: 'bimba.walkabout_to',
  description: 'Navigate the Bimba explorer to a coordinate',
  parameters: [{ name: 'coordinate', type: 'string' }],
  handler: async ({ coordinate }) => bimbaStore.selectAndCenter(coordinate),
});

// Oracle recording
useCopilotAction({
  name: 'oracle.record_iching',
  description: 'Record an operator-drawn I-Ching cast',
  parameters: [
    { name: 'primary_hex', type: 'number' },
    { name: 'changing_lines_mask', type: 'number' },
  ],
  handler: async (args) => oracleClient.recordIching(args),
  // optional render: paints the cast into M4-2' as it's recorded
  render: ({ args }) => <RecordedCast {...args} />,
});

// Atelier curation
useCopilotAction({
  name: 'atelier.suggest_etymology',
  description: 'Suggest an etymological connection for the current word in the Atelier',
  parameters: [
    { name: 'word', type: 'string' },
    { name: 'cognates', type: 'string[]' },
    { name: 'register', type: 'string' },
  ],
  handler: async (args) => atelierStore.queueSuggestion(args),
  // render mounts a card in the Atelier curation sidebar
  render: ({ args, status }) => <EtymologySuggestionCard {...args} status={status} />,
});

// Library curation (operator-curated; the agent can only *suggest* entries)
useCopilotAction({
  name: 'library.suggest_entry',
  description: 'Suggest a vault file or Atelier aphorism for the operator to add to the Library',
  parameters: [
    { name: 'artifact_kind', type: 'string' },
    { name: 'artifact_id', type: 'string' },
    { name: 'reason', type: 'string' },
  ],
  handler: async (args) => libraryStore.queueSuggestion(args),
  render: ({ args }) => <SuggestedEntryCard {...args} />,
});

// Inbox deposit (M5-4' Epii inbox)
useCopilotAction({
  name: 'inbox.deposit',
  description: 'Deposit a reviewable item into the Epii inbox',
  parameters: [
    { name: 'item_type', type: 'string' }, // 'promotion' | 'execution' | 'crystallisation' | 'improvement'
    { name: 'evidence', type: 'object' },
    { name: 'recommendation', type: 'object' },
  ],
  handler: async (args) => inboxStore.addPending(args),
  render: ({ args }) => <InboxDepositCard {...args} />, // mounts in the inbox surface
});
```

Every render prop **mounts inside the surface where its hook lives**. The Inbox panel hosts the `inbox.deposit` action; when the agent calls it, the card mounts in the inbox automatically. The Atelier curation sidebar hosts `atelier.suggest_etymology`; the suggestion card mounts there. The agent never targets a surface by id — surface placement is a consequence of where the hook is mounted.

#### 5.6.3 A2UI for free-form generative artifacts

When the agent must compose a **novel-shaped artifact** (not pre-designed — e.g. a new kind of MEF lens reading layout, an unexpected etymology diagram, a multi-card oracle interpretation), it emits an A2UI JSON document against a registered component catalog.

```typescript
// src/agui/a2ui_catalog.ts
export const A2UI_CATALOG = {
  Card,
  OracleDraw,
  EtymologyTree,
  CoordinatePill,
  CitationBlock,
  PassagePreview,
  WalkaboutPath,
  // ...
};
```

The agent emits:

```json
{
  "type": "Card", "props": { "title": "Reading for 2026-05-10" },
  "children": [
    { "type": "OracleDraw", "props": { "deck": "thoth", "spread": "three-card", "cards": [...] } },
    { "type": "CitationBlock", "props": { "coordinate": "M3-5'", "sources": [...] } }
  ]
}
```

Routed via an AG-UI `Custom { name: 'a2ui.render', value: { surface_id, document } }` event. The target surface's A2UI renderer reads its catalog and mounts the tree natively (no HTML/JS over the wire — security boundary).

Use A2UI sparingly. For 95% of cases the surface-scoped `useCopilotAction` with a `render` prop is simpler and more typed.

#### 5.6.4 MCP Apps for sandboxed third-party widgets

When an external MCP server returns a widget via a `ui://` resource (e.g. a third-party tarot deck visualiser, an external Bimba lens), the Tauri app mounts it as a sandboxed iframe via `@modelcontextprotocol/ext-apps` AppBridge.

```typescript
// in the M5-4' VAK execution panel or wherever an external widget is appropriate
<MCPAppHost
  resourceUri="ui://external-server/widget-id"
  onToolCall={(call) => /* route via host channel */}
/>
```

Iframe sandbox is the security boundary; postMessage JSON-RPC is the channel. Used only for content from MCP servers the operator has explicitly enabled; not for the app's own UI.

#### 5.6.5 Tauri integration — two channels coexist

The Tauri command spine (`invoke` / `listen`) and the AG-UI wire run side by side:

```
┌─────────────────────────────────────────────────────────────────┐
│ Renderer (React + CopilotKit)                                   │
│ ┌─────────────────────────┐  ┌────────────────────────────────┐ │
│ │ Sync command spine      │  │ Agent loop                     │ │
│ │ invoke('vault_save_*')  │  │ useCopilotReadable             │ │
│ │ listen('clock:state')   │  │ useCopilotAction               │ │
│ │ — for filesystem, graph │  │ AG-UI events (SSE)             │ │
│ │   reads, dialogs, IO    │  │ — for agent observation/action │ │
│ └────────────┬────────────┘  └────────────────┬───────────────┘ │
└──────────────┼────────────────────────────────┼─────────────────┘
               │                                │
               ▼                                ▼
   ┌───────────────────┐         ┌──────────────────────────────┐
   │ Tauri Rust core   │         │ Agent runtime (sidecar)      │
   │ (commands.rs)     │◀───────▶│ AG-UI service (port 3033)     │
   │                   │  bridge │ — speaks AG-UI to renderer   │
   │ neo4j, vault, fs, │         │ — invokes Tauri commands     │
   │ tarot, kairos     │         │   under the hood when needed │
   └───────────────────┘         └──────────────────────────────┘
```

**Cross-talk**: the agent can invoke Tauri commands either by calling a `useCopilotAction` that internally wraps `invoke`, or directly via a Rust `ag-ui` SDK adapter in the agent runtime. Conversely, when the vault watcher in the Rust core emits a `vault:changed` event, the agent can be notified via an AG-UI `StateDelta` from the runtime side.

The CopilotRuntime can be:
- **Inlined into the existing 3033 service** (preferred — reduces port count)
- **Spawned as a Tauri sidecar** under `src-tauri/binaries/copilot-runtime`
- **Run as part of the gateway** (S3' provides AG-UI endpoint natively)

#### 5.6.6 Tauri commands exposed to agents

A subset of Tauri commands are wrapped as `useCopilotAction`s so the agent can invoke them as if they were functions:

| Tauri command | Wrapped action name | Used by |
|---|---|---|
| `vault_get_today_now_folder` | `vault.today_folder` | Library, Atelier (to find current corpus) |
| `vault_get_flow_entry` | `vault.read_flow` | Agent reads operator's writing |
| `clock_get_state` | `clock.read_state` | Agent observes current kairos |
| `clock_set_branch_lens` | `clock.set_branch_lens` | Agent suggests lens shift |
| `graph_get_by_coordinate` | `bimba.read_coordinate` | Agent looks up canonical content |
| `coordinate_wisdom_packet` | `bimba.wisdom_packet` | Agent retrieves full coordinate context |
| `atelier_query_constellation` | `atelier.read_constellation` | Agent reads operator's etymological work |
| `oracle_correspond` | `oracle.correspond` | Agent runs computational pass over a recorded cast |
| `library_curate_promote` | (operator-only — agent suggests via `library.suggest_entry`) | (not wrapped) |

Read commands are freely wrapped; write commands that affect canonical state are wrapped only as **suggestions** — the operator confirms. The operator's curation authority is preserved (see §M5-0').

#### 5.6.7 Acceptance criteria — agent-ready frontend

- AG-UI endpoint at canonical path (`/agui`) on the gateway/sidecar emits the documented event taxonomy.
- Every M' surface defined in Part VII mounts at least one `useCopilotReadable`.
- Every UI action the agent should be able to invoke is registered via `useCopilotAction`.
- `atelier.suggest_etymology` renders a card in the Atelier curation sidebar within one frame of the agent's `ToolCallStart`.
- `inbox.deposit` renders a card in the M5-4' Epii inbox within one frame.
- A `Custom { name: 'a2ui.render' }` event with a valid A2UI document targeting a known surface mounts the catalog-rendered tree.
- Write-affecting Tauri commands are NOT wrapped as actions; agent reach into canonical state goes through suggestion-and-confirm flows.
- Sync command spine (`invoke`) continues to work for non-agent operations without disruption.

#### 5.6.8 Migration sketch from the existing 3033 service

The existing AG-UI service emits ad-hoc events; we canonicalise:

1. Map current progress events → `ActivityDelta`
2. Map current suggestion events → `Custom { name: 'suggestion.applied', value }`
3. Map current completion events → `RunFinished`
4. Adopt `@ag-ui/encoder` (or Rust equivalent) for type-safety on the wire
5. Wrap the React app in `<CopilotKit runtimeUrl="http://127.0.0.1:3033/agui">` (port may move; treat as config)
6. Convert one surface at a time (start with Bimba navigator → Inbox → Atelier sidebar → ... → full coverage)
7. Add A2UI catalog only when free-form generative artifacts arrive

---

## Part VI — Shell and navigation

### 6.1 The 1:3 split — visualisation | agentic-personal

The shell is a binary split between **the integrated clock-cosmos visualisation** (left, always running) and **a switchable agentic/personal workspace** (right, defaults to M4 Nara). OmniPanel is a universal overlay invoked from anywhere. KBase info-pool is a slide-out rail from the right edge when needed.

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Header — kairos hour · DAY · NOW · gateway dot · selected coordinate       │
├─────────────────────────────────────────┬──────────────────────────────────┤
│                                         │                                  │
│   LEFT — Integrated Clock-Cosmos        │   RIGHT — Agentic / Personal     │
│   (visualisation; always running)       │   (switchable workspace)         │
│                                         │                                  │
│   M3 clock + symbolic DNA               │   ┌─ active among ────────────┐  │
│   M1 spanda tick OF the clock           │   │ M4 Nara   (default)        │  │
│   M2 vibrational web AROUND the clock   │   │ M5 Epii                    │  │
│                                         │   │ M0 Bimba (2D/3D explorer)  │  │
│   Emphasis-layer toggle:                │   └────────────────────────────┘  │
│   [all · tick · vibrational · DNA]      │                                  │
│                                         │                                  │
│                                         │                                  │
├─────────────────────────────────────────┴──────────────────────────────────┤
│ BottomDock — tick12 ring · branch lens · active chakra · readiness dots    │
└────────────────────────────────────────────────────────────────────────────┘

OmniPanel (`/`) ─ ESC-summoned universal overlay; no side allegiance
KBase info-pool ─ Cmd+I slide-out from right edge; follows coordinate selection
```

**Left side: one integrated visualisation, not three sub-tabs.** The Chronos clock IS the integration of M1+M2+M3 — the spanda tick is *of* the clock (rendered as the tick12 ring on the clock surface), the vibrational web is the solar-system imagery and decan/maqamat correspondences *drawn about* the clock, and the symbolic DNA (hexagrams, tarot, quaternions) sits in the clock's structure. The operator looks at one fused figure. An emphasis-layer toggle lets them highlight one register without losing the others (`all` is the default and what the system actually is).

**Right side: three switchable workspaces.** The operator engages here — writes flow (M4 default), curates Library / Atelier (M5), navigates the Bimba map (M0). Switching is a workspace swap; the clock-cosmos keeps running on the left throughout. M4 internally has its own three-panel dashboard (left tree / centre flow editor / right highlights) — when M4 is the active right-side workspace, that three-panel internal shape fills the right viewport.

**Why this side allegiance.** Per the QL inversion: 1-2-3 are operative (Pro-/Co-/Axio-Logos — doing / relating / patterning) and 4-5-0 are integrative (Dia-/Epi-/Proto-Logos — through / over / before). M0 sits with M4 and M5 because all three *operate upon* rather than *carry out*: M4 is the user instance moving through 1-2-3; M5 is the system reflecting over 1-2-3; M0 is the generative basis beneath 1-2-3. The Bimba map is the navigational ground M4 and M5 anchor to.

### 6.2 Side ratio and persistence

50/50 by default; operator-resizable; persisted per layout-name. Two named layouts ship out of the box:

- `default` — 50/50, right-side workspace = M4
- `bimba-walk` — 40/60 (right slightly wider), right-side workspace = M0

The operator can save additional layouts via OmniPanel Settings → Layouts. Persistence file mirrors the TUI's persist pattern at `~/.epi-logos/portal/workspace.json`.

### 6.3 Hotkey grammar

The existing canonical navigation grammar from `shared/navigationConfig.ts` is preserved, with the 1:3 split adding side-aware semantics on top:

| Hotkey | Action |
|---|---|
| **Side and overlay focus** | |
| `Cmd+Opt+0` | Full-screen pin LEFT side (clock-cosmos) |
| `Cmd+Opt+1` | Full-screen pin RIGHT side |
| `ESC` | Toggle OmniPanel overlay (universal) |
| `Cmd+I` | Toggle KBase info-pool slide-out |
| `Cmd+K` | Command palette |
| `Cmd+Shift+P` | Command palette (alt) |
| **Right-side workspace switching (M4/M5/M0)** | |
| `Cmd+Shift+4` | RIGHT → M4 Nara |
| `Cmd+Shift+5` | RIGHT → M5 Epii |
| `Cmd+Shift+0` | RIGHT → M0 Bimba |
| **Left-side emphasis layer (M1/M2/M3)** | |
| `Cmd+Shift+1` | Emphasis → spanda tick layer (M1) |
| `Cmd+Shift+2` | Emphasis → vibrational web layer (M2) |
| `Cmd+Shift+3` | Emphasis → clock + symbolic DNA layer (M3) |
| `Cmd+E` | Cycle emphasis: all → tick → vibrational → DNA → all |
| **Inner stratum (within focused side's active surface)** | |
| `Cmd+{0..5}` | Direct stratum jump (0'..5') |
| `Cmd+>` | Next inner stratum |
| `Cmd+<` | Previous inner stratum |
| **Curated jumps** | |
| `Cmd+Opt+T` | Jump to M3-5' Chronos clock (left-side, M3 emphasis, stratum 5') |
| `Cmd+Opt+C` | Jump to M2-5' Cymascope (left-side, M2 emphasis, stratum 5') |
| `Cmd+Opt+S` | Jump to M1-3' Spanda torus (left-side, M1 emphasis, stratum 3') |
| `Cmd+Opt+L` | Jump to M5-0' Library (right-side → M5, stratum 0') |
| `Cmd+Opt+A` | Jump to M5-5' Atelier (right-side → M5, stratum 5') |
| `Cmd+Opt+N` | Jump to M4-4' Nara Lens Library (right-side → M4, stratum 4') |
| `Cmd+Opt+B` | Jump to M0-5' Bimba Explorer 2D (right-side → M0, stratum 5') |

The stratum-jump grammar (`Cmd+{0..5}`) operates on the **focused side** — if focus is left, it jumps within the integrated clock-cosmos to a specific M-stratum sub-view (e.g. `Cmd+5` with M3 emphasis = M3-5' Chronos full clock; with M2 emphasis = M2-5' Cymascope focused; with M1 emphasis = M1-5' Topological Eye); if focus is right, it jumps within the currently-active right workspace (M4/M5/M0).

User-defined custom commands load from `~/.epi-logos/navigation-config.yaml` at startup; they can target either side and either an M-domain or a specific (domain, stratum) pair.

### 6.4 Canonical cross-side pairings

Three pairings are worth naming explicitly because they fall out as natural defaults:

| Layout | Left | Right | Operator activity |
|---|---|---|---|
| **Flow with context** | Clock-cosmos (all emphasis) | M4 Nara | Daily journalling with live kairos visible |
| **Coordinate-anchored exploration** | Clock-cosmos (M3 emphasis) | M0 Bimba | Walking the map alongside the clock; selections on either side propagate to the info-pool |
| **Linguistic crystallisation** | Clock-cosmos (M2 emphasis — vibrational web foregrounded) | M5 Epii (Atelier active) | Etymological work while resonance correspondences are visible on the left |

These are not modes — just named layouts. The operator can mix freely.

### 6.5 Cross-side coordination

Two flows tie the sides together without coupling them:

1. **Coordinate selection bridge.** Selecting a coordinate on either side propagates to `bimbaStore.selectedCoordinate` and triggers the KBase info-pool (Cmd+I) to refresh against the new selection. A coordinate selected on the left's M3 clock (e.g. clicking the hexagram corona's hex #47) becomes the right side's pre-loaded inspector target when the operator opens M0 Bimba or starts a M5 Atelier session.

2. **Clock-cosmos → Nara walkabout.** From M3 Chronos clock (left), the walkabout panel can dispatch the current cast into M4 Nara (right): the right side opens with the cast pre-loaded as a journal context, the highlight registry seeded, ready for the operator to write. The clock keeps running while the operator writes.

These coordination paths are typed envelopes — no slash strings, no implicit state coupling — and pass through `agentExecutionClient.invoke` per the agent-ready stack (Part V.6).

### 6.6 Header

Top-of-shell strip showing: gateway connection dot, current `s_3_day_id`, truncated current `s_4_now_path`, current kairos hour, currently selected Bimba coordinate. Clickable: coordinate shortcut opens the info-pool; NOW path opens a path picker; gateway dot opens OmniPanel Overview.

### 6.7 Bottom dock

Always visible. Reads from `clockStore` and `temporalClient`:

- **tick12 indicator** — 12-segment ring, current segment lit
- **Kairos hour** — planet glyph + planetary hour (e.g. `☉ 14:00`)
- **Active chakra dot** — colored dot for current active chakra
- **NOW path** — truncated canonical NOW path
- **Three readiness dots** — service / agent-access / human-gate (per envelope readiness invariants)
- **Branch lens chip** — cycles 0..5 (Literal..KS)
- **DAY indicator** — clickable `YYYY-MM-DD`, opens daily-note in M4

The dock is **not** another side — it is shell chrome, always present beneath both sides.

---

## Part VII — M' Domain surfaces (the substantial bit)

For each M' coordinate we specify: which side of the shell it lives on, the canonical visualisation, all six inner stratum surfaces, the data contracts, and per-surface acceptance criteria.

**Side allegiance recap (per Part VI):**

| Coordinate | Side | Role |
|---|---|---|
| **M1' Paramasiva** | LEFT (integrated) | Spanda tick — the rhythmic layer *of* the clock-cosmos |
| **M2' Parashakti** | LEFT (integrated) | Vibrational web — solar imagery and decan/maqamat correspondences *around* the clock-cosmos |
| **M3' Mahamaya** | LEFT (integrated) | Clock + symbolic DNA — the canonical wheel that integrates the other two layers |
| **M4' Nara** | RIGHT (workspace) | User as personal instance across 1-2-3; default right-side workspace |
| **M5' Epii** | RIGHT (workspace) | System self-pedagogy across 1-2-3; Library + Atelier + VAK execution |
| **M0' Anuttara** | RIGHT (workspace) | Bimba map as generative basis beneath; 2D + 3D coordinate explorer |

**M1 / M2 / M3 are not separable workspaces.** They are three integrated layers of one clock-cosmos visualisation on the left side. The per-stratum spec sections below describe each domain's six inner stratum views (`{0..5}'`) — but at the top-level shell, they fuse. The operator interacts with M1 through the clock's tick12 ring, with M2 through the planetary/decan/maqamat correspondences drawn about the clock, and with M3 through the wheel itself and its hexagram corona — all simultaneously visible. The emphasis-layer toggle (Part VI.3) lets them foreground one layer without losing the others. Drilling into a specific inner stratum (`Cmd+{0..5}` while left is focused) opens that stratum's focused view within the integrated visualisation.

**M0 / M4 / M5 are switchable right-side workspaces.** The operator selects which is active via `Cmd+Shift+{0, 4, 5}`. Each workspace has its own internal layout: M4 NaraDashboard's three-panel (tree / editor / highlights), M5's Library + Atelier + VAK / Inbox structure, M0's Bimba 2D/3D explorer with selection inspector.

The substrate of every Bimba-related visualisation is the **Bimba Geometry Framework** (Part VII.0 below).

### 7.0 Bimba Geometry Framework — the canonical 6-fold + higher-order extension

The Bimba graph is geometrised through a **6-fold hexagonal baseline** with **fractal nesting** and **typed extension hooks** for sub-graphs whose coordination structure exceeds the 6-fold frame. This framework is the substrate; M0-5' (2D), M1-3' (Spanda torus), M1-5' (Topological Eye), M3-5' (Chronos Clock), M5-0' (Library ecology view) all consume it.

#### 7.0.1 Hexagonal coordinate → spatial position

Every Bimba coordinate (`#`, `#0`, `#0-1`, `#2-3-5`, etc.) maps deterministically to a position in 2D or 3D space via fractal nested hexagons:

```rust
// src-tauri/src/graph/geometry.rs

pub const BIMBA_BASE_RADIUS: f32 = 1200.0;
pub const BIMBA_RADIUS_DECAY: f32 = 0.3;
pub const BIMBA_Z_OSCILLATION: f32 = 20.0;
pub const HEX_ANGLE_OFFSET: f32 = -std::f32::consts::FRAC_PI_6; // -30°
pub const HEX_ANGLE_STEP: f32 = std::f32::consts::FRAC_PI_3;    // 60°

#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
pub struct BimbaPosition {
    pub x: f32,
    pub y: f32,
    pub z: f32,
}

/// Map a Bimba coordinate string to a spatial position.
/// Examples:
///   "#"        -> (0, 0, 0)
///   "#0"       -> (1200·cos(-30°), 1200·sin(-30°), +20) ≈ (1039, -600, 20)
///   "#5"       -> (1200·cos(270°), 1200·sin(270°), +20) ≈ (0, -1200, 20)
///   "#0-1"     -> #0 + 360·(cos(30°), sin(30°), -20)  ≈ (1351, -420, 0)
///   "#2-3-5"   -> #2 + 360·(cos(150°)) + 108·(cos(270°)) ...
pub fn calculate_hexagonal_position(coordinate: &str) -> BimbaPosition {
    if coordinate == "#" {
        return BimbaPosition { x: 0.0, y: 0.0, z: 0.0 };
    }
    let body = coordinate.trim_start_matches('#');
    let segments: Vec<&str> = body.split(|c| c == '-' || c == '.').collect();

    let mut pos = BimbaPosition { x: 0.0, y: 0.0, z: 0.0 };
    let mut radius = BIMBA_BASE_RADIUS;

    for (level_idx, segment) in segments.iter().enumerate() {
        let value: i32 = segment.parse().unwrap_or(0);
        let hex_pos = ((value % 6) + 6) % 6; // wrap negatives to 0..5
        let angle = (hex_pos as f32) * HEX_ANGLE_STEP + HEX_ANGLE_OFFSET;

        pos.x += radius * angle.cos();
        pos.y += radius * angle.sin();
        pos.z += if level_idx % 2 == 0 { BIMBA_Z_OSCILLATION } else { -BIMBA_Z_OSCILLATION };

        radius *= BIMBA_RADIUS_DECAY;
    }

    pos
}
```

The renderer reads this through `graphClient.getCanonicalLayout()` (a thin command wrapper that takes a list of coordinates and returns positions, used to seed force-graph initial state).

The angle formula `(hex_pos * π/3) - π/6` produces the canonical hexagon orientation — vertices at -30°, 30°, 90°, 150°, 210°, 270°. This puts position #0 in the lower-right and goes counterclockwise. **Do not rotate** — the orientation is canonical and downstream visualisations (Chronos clock, Spanda torus, Cymascope) align to it.

#### 7.0.2 Mapped vs unmapped nodes

Every Bimba node is one of two classes:

**Mapped** — has a `bimbaCoordinate` property. Rendered at `calculate_hexagonal_position(coordinate)`. In force-graph terms: `fx`/`fy`/`fz` set, physics ignored. These are the canonical structural anchors.

**Unmapped** — no Bimba coordinate (e.g. user-created notes, ad-hoc relationships). Free-floating in a force field with **orbital constraint** to their parent (the nearest mapped ancestor). Position computed dynamically per the orbital force config below.

#### 7.0.3 2D layout — `M0_Anuttara` ownership

Renderer: `<BimbaMap2D>` using `react-force-graph-2d` (preserved from Electron and v0).

Force config (from `subsystems/0_anuttara/.../physicsConfig.ts` — preserve exactly):

```typescript
export const PHYSICS_2D = {
  cooldownTicks: Infinity,
  warmupTicks: 100,
  d3AlphaDecay: 0.005,
  d3VelocityDecay: 0.1,
  d3AlphaMin: 0.0005,
  numDimensions: 2,
} as const;
```

Mapped node init: set `fx, fy` from `calculateHexagonalPosition(coord)`; do not unset.

Unmapped node init (children of a parent in 2D):

```typescript
function calculateOrbitalPosition2D(node, parent, childDepth, siblings) {
  const baseDistance = 150;
  const distance = baseDistance * Math.pow(1.2, childDepth - 2);
  const siblingIdx = siblings.indexOf(node.id);
  const angle = (siblingIdx / siblings.length) * 2 * Math.PI;
  return {
    x: parent.x + distance * Math.cos(angle),
    y: parent.y + distance * Math.sin(angle),
    vx: -Math.sin(angle) * 0.5 / Math.sqrt(distance),
    vy:  Math.cos(angle) * 0.5 / Math.sqrt(distance),
    // fx/fy left undefined so physics applies
  };
}
```

Rendering: each node draws a hexagon glyph (canvas `nodeCanvasObject`), not a circle. Hexagon path:

```typescript
function hexagonPath(size: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    pts.push(`${size * Math.cos(a)},${size * Math.sin(a)}`);
  }
  return `M${pts.join('L')}Z`;
}
```

Edge styling: greyed (`rgba(180,180,180,0.3)`) by default; pulse-modulated when highlighted; directional particle for relationship type.

Initial camera: `centerAt(rootNode.x, rootNode.y, 1000)`, `zoom(0.08, 1000)` for 12× zoom-out establishing shot.

#### 7.0.4 3D layout — `M1_Paramasiva` ownership

Renderer: `<BimbaMap3D>` using `react-force-graph-3d` (preserved). Topology is **layered hexagons with continuous orbital motion** — *not* a torus embedding. Mapped nodes pin at 3D hex positions with Z-oscillation; unmapped nodes orbit in continuous flow.

Force config:

```typescript
export const PHYSICS_3D = {
  cooldownTicks: Infinity,
  numDimensions: 3,
  d3AlphaDecay: 0.00001,    // ultra-slow decay
  d3VelocityDecay: 0.01,    // very low friction
  d3AlphaMin: 0,            // never stops naturally
  d3AlphaTarget: 0.1,       // continuous motion target
} as const;
```

Four custom forces (preserved from v0; preserve names exactly so debug tooling continues to work):

1. **`keepMappedNodesFixed`** — pulls mapped nodes back toward `__originalFx/Fy/Fz` with strength scaling on distance²:
   ```
   strength = (0.1 + min(0.2, dist² / 5000)) * alpha
   ```

2. **`keepUnmappedNodesConnected`** — when an unmapped node drifts beyond `distanceThreshold = 1000` from the weighted center of its connections, pull it back at `0.1 * (excess / 200) * alpha`. Add a perpendicular orbital velocity at `0.01 * alpha`.

3. **`parentGravity`** — pull each unmapped node toward its parent at `0.08 * alpha`. Mapped parents get 2× weight.

4. **`orbitalMotion`** — maintain `targetDistance = 50 + virtualDepth * 20` from parent; correct radial error at `0.03 * alpha`; add tangential orbital velocity at `0.1 * alpha / sqrt(virtualDepth)`; add subtle `sin(time/2000) * 0.01 * alpha` oscillation in orbital plane.

These four forces produce the characteristic flowing orbital structure where mapped nodes form the canonical hexagonal lattice and unmapped nodes weave around them in continuous gentle motion.

Initial camera: after 600ms physics-warmup delay, animate to `(x, |z|·7.777, z·5)` looking at origin with 2.5s tween — gives the canonical 60° downward tilt + 400% zoom-out establishing shot.

#### 7.0.5 Higher-order topology extension

The 6-fold baseline is right for the vast majority of Bimba structure (the system *is* mod-6). But two cases exceed it:

- **12-fold sub-graphs** — twin intertwined 6-fold loops (necessity ↔ desire patterns, per the Atelier constellation specs). Render as two co-axial hexagonal rings rotated 30° relative to one another, optionally bridged with cross-edges showing the "intertwining".
- **Other-fold sub-graphs** — when a sub-graph has a coordination class that is genuinely 3-fold (Trika), 4-fold (Quaternary), 8-fold (Octahedral), or higher (Icosahedral, etc.), the renderer should not pretend it's 6-fold-with-leftovers.

The framework introduces a **Geometry Class registry** that the renderer consults per sub-graph. The default class is `Hexagonal6Fold`. Explicit classes available at v1:

```rust
// src-tauri/src/graph/geometry.rs

#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
pub enum GeometryClass {
    /// Default. Canonical 6-fold mod-6 hexagonal layout per §7.0.1.
    Hexagonal6Fold,

    /// Twin 6-fold loops 30° offset; bridged by detected "intertwining" relations.
    DoubleHexagon12Fold { offset_degrees: f32 },

    /// Equilateral triangle (Trika): thesis-antithesis-synthesis at 0°/120°/240°.
    Triangular3Fold,

    /// Square / quaternity (Jung): 4 corners at 0°/90°/180°/270°.
    Square4Fold,

    /// Octahedron (8-fold): 6 vertices in 3D + 8 face-centers, used when
    /// coordination genuinely exceeds 6 with strong symmetry.
    Octahedral,

    /// Icosahedron (20-fold via 12 vertices), for richly connected sub-graphs.
    Icosahedral,

    /// Higher-genus torus surface (genus-N): when the relational structure
    /// has multiple non-contractible loops. Used sparingly.
    TorusGenusN { genus: u8 },

    /// Klein bottle: non-orientable surface for sub-graphs containing genuine
    /// orientation-reversal (e.g. Möbius cycles in Atelier→Library).
    KleinBottle,

    /// Operator override / experimental.
    Custom { id: String },
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SubGraphGeometry {
    pub root_coordinate: String,         // anchor of the sub-graph
    pub class: GeometryClass,
    pub orientation_quaternion: [f32; 4], // align to live PortalClockState if desired
    pub scale: f32,                       // local scale multiplier
    pub source: GeometrySource,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum GeometrySource {
    /// Detected automatically from coordination number + symmetry analysis.
    Detected { confidence: f32 },
    /// Set in the node's frontmatter (`preferred_geometry: octahedral`).
    Frontmatter,
    /// Operator manually overrode in the inspector.
    Manual,
}
```

**Detection heuristic** (Rust): for a candidate sub-graph rooted at coordinate `C`, examine `C`'s direct children + the edges among them. Coordination number, symmetry group, and presence of cross-edges select the class. Default to `Hexagonal6Fold` whenever ambiguous — explicit override always wins. Result is cached on `SubGraphGeometry` and re-evaluated on graph mutation.

**Tauri command:**

```rust
#[tauri::command]
pub async fn graph_geometry_for(
    coordinate: String,
    state: State<'_, AppState>,
) -> Result<SubGraphGeometry, AppError>;

#[tauri::command]
pub async fn graph_set_geometry_override(
    coordinate: String,
    class: GeometryClass,
    state: State<'_, AppState>,
) -> Result<(), AppError>;
```

**Renderer responsibility:** every `<BimbaMap2D>` and `<BimbaMap3D>` instance asks `graphClient.geometryFor(rootCoordinate)` before laying out a sub-graph. It then dispatches to the matching layout function (hexagonal for 6-fold default; geometric solid vertex placement for octahedral/icosahedral; toroidal embedding for `TorusGenusN`; etc.). The default-hex implementation in §7.0.1 is the *only* required v1 implementation; the others are stubs that fall back to hexagonal-with-warning until proper layout functions ship in follow-up. The data contract is the important thing — the render path is presaged and typed even where the implementation is staged.

The point of v1 is: **never silently lie about the structure**. If a sub-graph is actually 8-fold and the renderer falls back to hex, the inspector shows a warning chip "geometry: hexagonal (8-fold detected; layout not yet implemented)". This honesty is the spec's load-bearing principle for higher-order topology.

#### 7.0.6 Color, material, strata expression

QL position colors (preserved from `shared/types.ts`):

```typescript
export const QL_POSITION_COLORS: Record<string, string> = {
  p0: '#ef4444', // red    — Ground/Presence
  p1: '#f59e0b', // amber  — Definition/Form
  p2: '#10b981', // emerald — Operation/Process
  p3: '#06b6d4', // cyan   — Pattern/Symbol
  p4: '#8b5cf6', // violet — Context/Embodiment
  p5: '#ec4899', // pink   — Integration/Synthesis
};
```

3D node materials use a `MeshPhysicalMaterial` with glass-like properties:

```typescript
const glassNodeMaterial = new THREE.MeshPhysicalMaterial({
  transparent: true,
  opacity: 0.7,
  roughness: 0.1,
  metalness: 0.1,
  transmission: 0.5,
  thickness: 0.5,
  envMapIntensity: 1,
});
```

Highlight glow uses `MeshBasicMaterial` with `AdditiveBlending` and `depthWrite: false` for halo effect.

Strata expression: nesting depth maps to:
- **2D**: shrinking radius (0.3× per level) and slight Z-offset for stereo separation in pseudo-3D canvas.
- **3D**: alternating ±20 Z-offset per level + smaller node size at depth.

Pulsation: every node receives a `pulsationFactor` (0..1) from `clockStore.tick12` interpolation. When the active stratum matches a node's coordinate, the pulse is amplified — visually marking which stratum the operator is currently engaged with.

#### 7.0.7 Acceptance criteria for the geometry framework

- `calculate_hexagonal_position("#0")` returns `(1039.23, -600.0, 20.0)` ± 0.01.
- `calculate_hexagonal_position("#0-1")` matches the v0 reference output exactly.
- 2D `BimbaMap2D` renders 100 mapped + 200 unmapped nodes at ≥45fps on M-series.
- 3D `BimbaMap3D` runs the four custom forces continuously without stalling alpha (`alphaTarget` keeps it alive).
- Geometry detection on a sub-graph with coordination number 8 returns `class: Octahedral, source: Detected { confidence: ... }` — *not* hex with leftovers.
- Frontmatter override `preferred_geometry: triangular3fold` takes precedence over detection.
- Operator override via `graph_set_geometry_override` persists for the session.

### 7.0.8 KBase info-pool inspector — coordinate-anchored context

When the operator selects a coordinate anywhere in the app (2D Bimba map, 3D Bimba map, OmniPanel coordinate jump, walkabout from the Chronos clock, anchor link in a flow file, atelier resonance click), the right-rail inspector surfaces the **assembled info-pool** for that coordinate — the Layer 6 Context-Economy of the envelope schema, scoped to the selection.

Per envelope §6, this pool is assembled by **`bimba-mcp` + `epi-gnostic` + `Graphiti` + `kbase`** together, identified by `s_2_kbase_pool_id`, cached at `s_3_context_key` in Redis across turns. The Tauri inspector reads the same pool the agent reads. Operator and agent see the same field.

```
┌── Info-Pool ── coordinate: M3-5'  (s_2_kbase_pool_id: kbase://...) ────┐
│                                                                         │
│ ## Canonical (bimba-mcp)                                                │
│   Name:         Mahamaya — Chronos                                      │
│   c_4_family:   M    c_4_ql_position: 3.5'                              │
│   c_3_ctx_frame: (0/1/2/3)                                              │
│                                                                         │
│ ## Sources / essays (epi-gnostic, RAG-Anything)                        │
│   ✓ <:Gnostic source> ...                                              │
│   ✓ <:Gnostic essay>  ...                                              │
│                                                                         │
│ ## Episodic (Graphiti) — `s_3_episodic_handles`                        │
│   📌 episode at this coordinate · arc_id · ql · cpf                    │
│                                                                         │
│ ## Atelier resonances                                                  │
│   🔗 <:Atelier_Word | :Atelier_Aphorism> → coordinate                  │
│                                                                         │
│ ## Related coordinates  (graph 1-hop)                                  │
│   → adjacent :Bimba nodes                                              │
│                                                                         │
│ Retrieval mode: [kbase | semantic | episodic | hybrid]                  │
│ Density: [minimal | standard | rich]    Project horizon: ...           │
└─────────────────────────────────────────────────────────────────────────┘
```

The inspector is the operator-facing view of the same fields the envelope carries: `s_2_source_set`, `s_2_retrieval_mode`, `s_2_scope_coordinates`, `s_2_disclosure_density`, `s_2_project_horizon`, `s_2_kbase_pool_id`, `s_3_context_key`, `s_3_episodic_handles`, `s_5_anansi_web`.

#### Tauri command

```rust
// src-tauri/src/commands/kbase.rs

#[tauri::command]
pub async fn kbase_pool_for_coordinate(
    coordinate: String,                        // "M3-5'", "#4", "C0"
    retrieval_mode: Option<RetrievalMode>,     // kbase | semantic | episodic | hybrid (default hybrid)
    disclosure_density: Option<DisclosureDensity>, // minimal | standard | rich
    project_horizon: Option<String>,           // optional kbase project boundary
    state: State<'_, AppState>,
) -> Result<KBasePool, AppError>;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct KBasePool {
    pub kbase_pool_id: String,                 // s_2_kbase_pool_id
    pub context_key: Option<String>,           // s_3_context_key (Redis pointer)
    pub source_set: Vec<PoolSource>,           // assembled by bimba-mcp + epi-gnostic + Graphiti + kbase
    pub retrieval_mode: RetrievalMode,         // s_2_retrieval_mode
    pub disclosure_density: DisclosureDensity, // s_2_disclosure_density
    pub scope_coordinates: Vec<String>,        // s_2_scope_coordinates
    pub graph_region_handles: Vec<String>,     // s_2_graph_region_handles
    pub episodic_handles: Vec<String>,         // s_3_episodic_handles
    pub anansi_web: Option<AnansiWeb>,         // s_5_anansi_web — wikilink orientation when active
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "kind")]
pub enum PoolSource {
    Canonical { coordinate: String, properties: serde_json::Value },     // direct :Bimba node
    Gnostic   { source_id: String, kind: String, snippet: String,
                vault_path: Option<String>, c_4_confidence: f32, c_4_method: String },
    Episode   { episode_id: String, ql_position: String, cpf: String,
                arc_id: Option<String>, snippet: String },
    Atelier   { artifact_kind: String, artifact_id: String, display: String,
                c_4_confidence: f32, c_4_method: String },
}
```

The fan-out is one call, parallel across the four sources, with provenance preserved per item so the operator can see exactly *which substrate* surfaced *which fact*.

#### Layout integration

The info-pool inspector is a **slide-out rail from the right edge of the shell**, invoked via `Cmd+I` (per Part VI.3). It is not a permanent pane — the operator summons it when needed and dismisses it when done. It re-fetches whenever `bimbaStore.selectedCoordinate` changes, so the same coordinate selection (whether made on the left clock-cosmos, the right workspace, or via OmniPanel jump) drives a single coherent inspector. The pool identifier (`s_2_kbase_pool_id`) is exposed in the panel header so the operator can see they are looking at the same pool the agent is currently using for this coordinate.

#### Acceptance criteria (info-pool inspector)

- Selecting a coordinate in M0-5' (2D) populates the inspector within 200ms.
- Switching from M0-5' to M1-5' keeps the same coordinate pinned and the same pool visible.
- Changing `retrieval_mode` or `disclosure_density` re-fans-out with the new params; the pool identifier updates.
- The `source_set` items carry source-level provenance (`:Gnostic`, `:Bimba`, episode, `:Atelier_*`) and per-edge `c_4_confidence` / `c_4_method` properties from the envelope's edge schema.

### 7.1 M0' Anuttara — Bimba map / Coordinate Ground

The structural ground. M0' is the desktop `0` surface: when the user enters `0` mode without a more specific override, this is what they see.

#### Workspace shell
`<AnuttaraWorkspace>` lays out as: left rail with stratum chips (0'..5'), main viewport, right rail with selection inspector (currently selected coordinate's metadata, source files, backlinks).

#### Inner strata

| Stratum | Surface | Implementation |
|---|---|---|
| M0-0' | 4-Fold Zero | Apophatic ground viewport: pulsing solid black circle on void background; shows `(00)/00` glyph; clicking opens a markdown read-only of `Idea/Bimba/Map/M0-0.md`. |
| M0-1' | 8-Fold Zero-Zero | 8-fold spiral (SVG) animated from a single dual-spiral pulse at center outward; reads from `useClockStore.tick12` to drive pulse rate. |
| M0-2' | Equative Bridge | Equation display `(00) × 00 = 9` rendered as animated math; opens a ContextNote panel showing the virtue table. |
| M0-3' | Archetypal Numerology | **Real surface (already partly implemented)**: 3×3 grid of numbers 1–9. Click → expand to the principle, archetype, generative pattern, and any linked Bimba coordinates (graph lookup via `graphClient.getByCoordinate("C0-{n}")`). High priority — keep existing implementation but route data through `graphClient`. |
| M0-4' | Linguistic Mapping | Translation grid: technical term ↔ archetypal vocabulary; hand-curated source loaded from `Idea/Bimba/World/Types/Coordinates/Linguistic.md`. |
| M0-5' | Siva-Shakti Unity / **2D Bimba Explorer (Meta2D)** | **The desktop `0` primary 2D surface**, owned by M0 per v0 subsystem ownership. Full-viewport 2D Bimba map per §7.0.3 (hexagonal lattice for mapped nodes, orbital force for unmapped, hexagon glyph rendering). Data source: `graphClient.getGraph()` + `graphClient.geometryFor(rootCoordinate)`. Node click → selects coordinate, populates right rail with metadata (frontmatter, backlinks, source paths, last_modified, ql_position, geometry class). Double-click → opens the file in a viewer pane. Coordinate-aware: pressing `Cmd+G` then typing `M2-5'` jumps the camera to that node. **Toggle button** "→ 3D" jumps to M1-5' with the same selected coordinate preserved. |

#### Specific behaviours

- **Selection state** persists across surface switches (selected coordinate available in `clockStore.selectedCoordinate`)
- **Wikilink resolution**: clicking a `[[link]]` in any inspector calls `vaultClient.resolveWikilink(linkText)`; if it resolves to a coordinate node, jumps the M0-5' graph; if it resolves to a file, opens in the viewer.
- **Backlinks panel** (right rail): `vaultClient.getBacklinks(selectedCoordinatePath)` populates a list with file titles and surrounding context.

#### Acceptance criteria

- Pressing `Cmd+Shift+0` switches the right-side workspace to M0 Bimba; M0-5' force graph is M0's default stratum on opening.
- Force graph nodes are colored by `qlPosition` per `QL_POSITION_COLORS` constant.
- Clicking a node populates the right inspector within 100ms.
- Switching to M0-3' from M0-5' loads the numerology grid without losing the previously-selected coordinate.

### 7.2 M1' Paramasiva — Topology

Topological logic: relational walks, torus, double-covering, six-position framework.

| Stratum | Surface | Implementation |
|---|---|---|
| M1-0' | Bimba Ground | `0/1` glyph pulsing at the live `tick12` cadence; minimal informational view. |
| M1-1' | Pratibimba Reflection | Mirror of M1-0' — animated reflection across a vertical axis demonstrating `1/0` inversion. |
| M1-2' | Ananda Matrices | 3×6 grid of named matrices (Baseline / Synthesis / Harmony / Resonance / Coherence / Unity); each click opens a small modal with a matrix definition page (markdown). |
| M1-3' | **Spanda Process** ★ | **Real 3D Genus-0 → Genus-1 torus morph using `@react-three/fiber`.** A sphere (genus-0) animates into a torus (genus-1) and back, driven by `live_quaternion` from `clockStore`. Camera orbits via OrbitControls. The morph progresses on `tick12` increments — at tick=0 the sphere is fully closed, at tick=11 the torus is fully formed. Pulse intensity reads from current `chakra_levels` for the active chakra. |
| M1-4' | QL Flowering | Six-petal rosette (SVG path) with each petal labelled `pos0..pos5` and colored from `QL_POSITION_COLORS`. Petal click → selects that QL position globally (sets `panelStore.qlFilter`). Affects which coordinates surface in M0-5' and graph queries. |
| M1-5' | **Topological Eye / 3D Bimba Explorer (Meta3D)** ★ | **The desktop's primary 3D Bimba surface**, owned by M1 per v0 subsystem ownership. Full-viewport 3D Bimba map per §7.0.4 — `react-force-graph-3d` with the four custom forces (`keepMappedNodesFixed`, `keepUnmappedNodesConnected`, `parentGravity`, `orbitalMotion`), continuous flowing orbital structure, layered hexagons with Z-oscillation, glass-like physical materials, coordinate-driven anchoring. Plus the **Topological Eye** overlay: the operator picks a 3D slice plane (defaults to `live_quaternion` from `clockStore`, so the slice rotates with the system); nodes within ε of the plane stay full-opacity, others dim — letting the operator inspect dimensional cuts. **Toggle button** "← 2D" jumps to M0-5' with selected coordinate preserved. ML backend extension point: `graphClient.walk` with a learned weighting model can highlight resonance paths (extension stub for v1). |

#### Acceptance criteria

- M1-3' torus visibly morphs as the user casts an oracle (changes `tick12`); at tick=0 it's a sphere, at tick=11 it's a torus.
- M1-3' rotates smoothly at 60fps when `live_quaternion` interpolates.
- M1-4' petal selection persists across surface changes and visually updates the M0-5' graph rendering.

### 7.3 M2' Parashakti — Vibrational

The vibratory web; semantic correspondence; the cymatic surface.

| Stratum | Surface | Implementation |
|---|---|---|
| M2-0' | Vibrational Ground | 36-cell grid (6×6) showing the 36×2 double-covering. Each cell pulses at a frequency derived from its index × 1.777 base ratio. Hovering plays a tone (Web Audio API) at that frequency. |
| M2-1' | Meta-Logikon (MEF) | 6-lens kaleidoscope: six tabs labeled the MEF lens names. Each lens is a transformer applied to the currently-selected coordinate — clicking a lens calls `epiiClient.bimbaByCoordinate(selectedCoordinate)` and re-renders the result through that lens's filter (e.g. Archetypal lens shows the numerological + tarot correspondence; Causal lens shows upstream/downstream graph walks). |
| M2-2' | Ontological Architecture | 36-Tattva descent ladder: vertical scrolling list with three sections (Pure/Mixed/Impure). Selecting a tattva opens its associated Bimba node in the side panel. |
| M2-3' | Modulation Matrix | 36-Decan circular wheel (SVG): four quadrants for elements, nine decans per element. Live planetary positions from `kairos.planets[]` overlay as small glyphs at their current degrees. Click a decan → shows that decan's metadata + the planet ruling it. |
| M2-4' | Reality Actualization | 72-Maqamat scrollable cards with audio playback (Web Audio); each maqam pairs with a Name of God and a Bija mantra. Clicking a card invokes the maqam's frequency through the audio engine and, if the engine connects to the cymascope, triggers a cymatic pattern. |
| M2-5' | **Cymascope** ★ | **The big one for M2': WebGL planetary sequencer.** A `@react-three/fiber` canvas with a custom shader that renders cymatic interference patterns from the currently-active planetary positions. The shader takes 10 planet degrees + amplitudes as uniforms and draws a 2D Chladni-pattern equivalent. A control panel below lets the operator: (1) select a "current chord" of planets to amplify, (2) play maqam frequencies routed to a tone generator, (3) export the rendered pattern as a `Signature` to Epii (deposits to inbox). Quaternion overlay: `live_quaternion` rotates the entire canvas slowly. |

#### Cymascope shader sketch

The shader is a fragment shader using superposed sine waves at frequencies derived from each planet's degree (mapped via 9:8 epogdoon harmonic ratio). Pseudo-shader:

```glsl
// fragment shader
uniform float u_planetDegrees[10];
uniform float u_planetAmps[10];
uniform float u_time;
uniform vec4 u_quaternion;
uniform float u_freqBase;  // base frequency, e.g. 432.0

void main() {
  vec2 uv = (gl_FragCoord.xy / u_resolution.xy) * 2.0 - 1.0;
  // Apply quaternion rotation to uv
  uv = rotateByQuat(uv, u_quaternion);

  float intensity = 0.0;
  for (int i = 0; i < 10; i++) {
    float deg = u_planetDegrees[i];
    float amp = u_planetAmps[i];
    if (deg > 359.5) continue; // unavailable
    float freq = u_freqBase * pow(9.0/8.0, deg / 30.0); // epogdoon stepping
    float wave = sin(uv.x * freq + u_time * 0.001) * sin(uv.y * freq + u_time * 0.001);
    intensity += amp * wave;
  }
  intensity = abs(intensity);

  vec3 color = mix(vec3(0.04, 0.06, 0.12), vec3(0.92, 0.42, 0.66), intensity);
  gl_FragColor = vec4(color, 1.0);
}
```

#### Acceptance criteria

- M2-5' renders a stable cymatic pattern at 60fps with 10 planet uniforms updating from `kairos.planets`.
- Hovering M2-0' cells plays an audible tone via Web Audio.
- M2-1' lens selection re-renders inspector content within 200ms of click.

### 7.4 M3' Mahamaya — Chronos clock (the heart)

The Time-Oracle. M3' is where the integrated solar/kairos clock lives — and it is the live surface of the shared `PortalClockState`.

| Stratum | Surface | Implementation |
|---|---|---|
| M3-0' | SU(2) & Quaternions | 720° rotation visualization: a Mobius-like band rotating in 3D, twice around per cycle. Shows the live `live_quaternion` numerically and as an interactive sphere (drag to rotate; click to lock). |
| M3-1' | I-Ching Explorer | 8×8 hexagram grid (64 hexagrams). Each hex has a small visual glyph (six lines, broken/unbroken). Current `oracle.primary_hex` highlights. Clicking selects a hex; shows its name, judgement, image, lines text (loaded from `Idea/Bimba/Map/I-Ching/{hexNum}.md`). |
| M3-2' | Genetic Code | 4×4×4 codon table; clicking a codon shows its associated hexagram (DNA-Iching isomorphism mapping). |
| M3-3' | Transcription Dynamics | T → U gateway: animation showing nucleotide T transmuting to U; conceptual visual demo. |
| M3-4' | Tarot Matrix | 78-card spread (4 suits × Court + 22 Major). Current planetary positions overlay the cards (e.g. Sun at 14° Leo highlights the Strength card). Click → shows card meaning + current planetary modifier. |
| M3-5' | **Chronos Clock** ★★ | **THE primary M3' surface — integrated solar/kairos clock as live operating substrate.** See full sub-spec below. |

#### M3-5' Chronos Clock — full sub-spec

A composite visualization combining:

1. **720° wheel** (D3.js zoomable layout, outer ring): zodiac degrees 0–720 with double-covering. Tick marks at every 30° for signs; finer ticks at every 1°. Color gradient mapped to the four elements.
2. **Planet positions** (overlay): 10 small glyphs placed at their current degrees, rendered with retrograde indicator (small `R` badge) and resonance highlight (pulsing glow when `is_resonance=true`).
3. **Oracle cast indicator**: an arrow at `current_degree` on the inner ring; a smaller arrow at `deficient_degree` (180° opposite); a translucent arrow at `implicate_degree`.
4. **Hexagram corona**: at the four cardinal positions of the wheel, the four "faces" hexagrams (primary / deficient / implicate / temporal) render in their six-line glyph form.
5. **Solar torus** (center): a 3D `@react-three/fiber` torus that rotates by `live_quaternion`. Color modulated by `active_chakra`. Size pulses on `tick12` increments.
6. **Tick12 ring**: 12 segments around the inner edge, current segment lit in domain color (M3' amber).
7. **Kairos hour panel** (bottom-left of clock): glyph for `hour_planet`, hour number 0–23, active chakra dot.
8. **Branch lens selector** (bottom-right): six small chips 0..5 (Literal / Functional / Structural / Archetypal / Phenomenological / KS); clicking changes `active_branch_lens`. The current lens' visual influence: changes the wheel's secondary text from raw degree to interpretive labels (e.g. Archetypal lens shows tarot cards; Functional shows planet rulers; Structural shows hexagram numbers; Phenomenological shows decanic phrases).
9. **Cast button**: prominent button labeled "CAST". Clicking calls `naraClient.oracleCast({ kind: 'iching' })` (or the user can invoke from M4-2'); on result, the clock's cast indicators update; an event ripples through the wheel as a brief flash.
10. **Walkabout button**: clicking opens a side rail with three options:
    - **Coordinate walkabout** — based on current degree, surface the most resonant Bimba coordinate via `graphClient.getByCoordinate` and offer a guided journey through M0-5' graph.
    - **Nara modality walkabout** — open M4 with the current cast pre-loaded as journal context.
    - **Pedagogy walkabout** — open M5-1' with a pedagogy session keyed off the current branch lens.

The clock is **live**: it updates continuously from the renderer mirror of `PortalClockState` via the `clockStore` subscription. Switching away from M3-5' and back doesn't reset state — the clock is the system, not a view of it.

#### Acceptance criteria

- Switching to M3-5' renders the clock within 500ms with current planetary positions visible.
- Casting an oracle from the clock visibly updates the cast arrows; the temporal hexagram changes if `changing_lines_mask != 0`.
- Branch lens chip click changes the wheel's secondary labels within one frame.
- Walkabout selection routes correctly: coordinate walkabout switches to M0-5' with the resonant node selected; modality walkabout switches to M4 with `panelStore.activePanel='nara'` and the cast injected as a journal entry seed.
- Closing and reopening the app preserves the last cast (via `last_cast` in PortalClockState which is itself persisted on the backend).

### 7.5 M4' Nara — Lived modalities

The personal flow surface. M4 is the desktop `1` primary panel by default.

#### Workspace
`<NaraDashboard>` (preserved from existing — extended): three-pane (left rail / center / right rail). Center is the TipTap editor. Left rail has the modality switcher (Journal / Daily Note / Dream Journal / Oracle) + search + task list + clock walkabout entry. Right rail has highlights summary + pending sendoffs + currently-cast oracle.

| Stratum | Surface | Implementation |
|---|---|---|
| M4-0' | Identity Matrix | 6-position personality grid based on natal data + journaled patterns. Reads from `naraClient.getIdentityMatrix()`. Editable cells per QL position. Saves on blur via `naraClient.saveIdentityMatrix`. |
| M4-1' | Sympathetic Med | Health/body integration: a body diagram (SVG) with chakra dots wired to `clockStore.chakra_levels`. Each chakra opens a side panel with both Eastern (TCM organ network) and Western (anatomy) annotations. Pulses according to `active_chakra`. |
| M4-2' | Oracle Suite | Tarot / I-Ching / Dream tabs. Tarot draws via `naraClient.oracleCast({kind:'tarot'})`; I-Ching via `{kind:'iching'}`. Result displays the card/hex with full interpretation; "Send to Journal" button injects a typed envelope into the current journal entry. |
| M4-3' | Alchemical Tracking | Two-stroke phase indicator (manifestation ↔ integration): visual showing recent journal entries colored by which phase they sit in. Calls `vaultClient.listEntries()` with phase filter. |
| M4-4' | **Lens Library / Daily Journal** ★ | **The primary M4' hub — full TipTap editor + flow substrate.** See full sub-spec below. |
| M4-5' | Learning Comp | Insight distillation surface: shows recent journal entries with the operator's marked insights extracted. Insights flow into M4-0' Identity Matrix and bridge to M5-0' Library. |

#### M4 canonical flow document model — NOW folder, Daily Note, Flow file, Highlight registry

This is the **clean canonical schema** that the Tauri port establishes. It supersedes the messy organisation in the current Electron app, where:
- `flowStore` and `highlightsStore` had parallel/duplicate schemas
- Highlight categories were a hardcoded enum (`'daily-note' | 'oracle' | 'dream' | 'expand'`)
- Slash-string dispatch was hardcoded (`/oracle "{text}"`, `/analyze_dream`, `/expand`)
- The canonical `Idea/Bimba/World/Daily-Note.md` template was *ignored* — the app read/wrote no QL frontmatter
- `PRESENT_PATH` was flat: `FLOW-YYYY-MM-DD.md` siblings, no per-day folders
- Tarot/I-Ching were UI stubs with no card/hexagram models, no cast operation, no result capture
- Two highlight stores fought over overlapping data with no synchronisation
- Daily notes had no auto-creation, no relationship to flow file, no task index

The canonical model below fixes all of these.

##### Day folder — minimal Nara files + NOW subfolders for Anima

The day folder is intentionally minimal. The apportioning of dream/oracle/journal/insight/question/prompt material happens through **Graphiti episodes** spawned from highlight-send actions in the flow file — not through proliferating per-modality vault files. The flow IS the single phenomenological surface; differentiation reaches through it into Graphiti.

```
Idea/Empty/Present/{DD-MM-YYYY}/                  # day folder (envelope s_3_day_id residency)
│
│  ─── NARA surface (operator-authored, top-level) ───
├── daily-note.md                                  # CT4b' Day scope — governing quilt point
├── daily-note.canvas                              # optional MOC canvas
├── FLOW-{YYYY-MM-DD}.md                           # CT4a — the single phenomenological surface
├── FLOW-{YYYY-MM-DD}-v{N}.md                      # flow versions
│
│  ─── ANIMA surfaces (NOW subfolders — agent task-execution threads) ───
├── {session-id}/                                  # NOW; envelope s_4_now_path
│   ├── now.md                                     # CT4b' Session scope — Psyche's operative notebook
│   ├── now.canvas
│   ├── tasks/                                     # CT2 task-spec artifacts (Anima-authored)
│   ├── patterns/                                  # CT3 pattern outputs
│   ├── thinking/                                  # ephemeral; cleared on task close
│   └── thoughts/                                  # distilled → Aletheia night pass → T-bucket
│
└── {session-id-2}/                                # multiple NOWs per day are normal
```

**No `DREAM-{date}.md`. No `ORACLE-{date}.md`. No per-modality file proliferation.** Dream entries, oracle casts, journal notes, agent prompts, questions, insights, patterns — all are *kinds of Graphiti episode*, spawned from highlight-send actions in the flow. The operator's "dream journal" is a filtered episodic timeline (`arc_type: dream`) across all days. The operator's "oracle log" is the same filtered query against oracle-arc episodes. These are *Nara dashboard panels backed by Graphiti queries*, not vault files.

**Nara surface (top-level).** Two files only:
- `daily-note.md` — the day's governing CT4b' frame with structured `p0_grounds` … `p5_synthesis` slots. A small number of *day-structural* highlight categories (`task`, `daily-note`) write into this file's slots in addition to spawning an episode; everything else flows to episodes only.
- `FLOW-{YYYY-MM-DD}.md` — the single phenomenological surface (CT4a). Open, infinite-page, stream-of-consciousness. The operator stays here at all times. Highlighting is the second-pass differentiation; **highlight-send creates the typed Graphiti episode** (see "Highlight → episode dispatch" below).

**Anima surfaces (NOW subfolders).** Agent task-execution substrate at `vault:Empty/Present/{DD-MM-YYYY}/{session-id}/` per envelope `s_4_now_path`. Operator-readable NOW label lives in `now.md` frontmatter (`c_1_name`), not the path. Inside each NOW:
- `now.md` — operative notebook (envelope §7 `s_4_operative_notebook`, Psyche's seam)
- `tasks/` — CT2 task-spec artifacts
- `patterns/` — CT3 pattern outputs
- `thinking/` — ephemeral, cleared on task close
- `thoughts/` — survives close; Aletheia night pass routes to `Pratibimba/Self/Thought/T{0..5}/`

The operator does not edit inside a NOW; the agent does not write at the day-folder top level. They share the DAY context but never share files.

**End-of-day archive.** Closed NOWs archive into `Idea/Pratibimba/Self/Action/History/{YYYY-MM}/{DD-MM-YYYY}/{session-id}/`. The two Nara files stay in `Empty/Present/{DD-MM-YYYY}/` until the day rotates out of present working scope.

The vault watcher emits `vault:changed` for the day folder. Graphiti ingests Nara highlights (flow → episodes) and Anima activity (now/tasks/patterns) as distinct episode streams per envelope §9.

##### Highlight → Graphiti episode dispatch — the canonical Nara mechanism

The flow file is the operator's only writing surface. **Highlighting + send-action creates a typed Graphiti episode** carrying the highlighted text plus the envelope §9 (Episodic Reporting) fields, anchored at the operator's `:PersonalNexus` via `[:HAS_EPISODE]`. The flow highlight retains the episode UUID as back-reference (the mark's attribute carries `episode_id`). The flow stays whole; the system's capacities reach through.

**Per the canonical envelope §9 field set, each highlight-send populates:**

| Envelope field | Value at send-time |
|---|---|
| `t_3_episode_id` | new Graphiti UUID, written back onto the flow highlight |
| `t_3_episode_state` | `open` (transitions per modality lifecycle) |
| `t_1_live_trace_stream` | the highlighted text content |
| `t_3_arc_id` / `t_3_arc_type` | per category — see mapping table below |
| `t_3_t_lane_activations` | T-lanes implied by the category |
| `s_3_graphiti_node_ids` | episode + LLM-extracted entity nodes (Graphiti-managed) |
| `c_0_bimba_anchor` | optional Bimba coordinate (stamped if a coordinate was selected at send-time) |
| `c_3_cpf` | per category — see mapping below |
| `c_1_ct` | `0` (operator-originated) or `1` (if send kicks off agent work) |
| `tick12`, `sun_decan` | stamped from current `PortalClockState` |
| `c_3_cs` | `day` |

**Category → episode shape mapping:**

| Highlight category | arc_type | cpf | ct | T-lane(s) | Side-effects beyond episode |
|---|---|---|---|---|---|
| `oracle` | `oracle:{cast_uuid}` | `(0/1/2/3)` quaternity | 0 | T3, T5 | oracle module's correspondence pass runs; `PortalClockState.last_cast` updated |
| `dream` | `dream:{day_id}` | `(4.0/1-4.4/5)` lemniscate | 0 | T2, T3 | — |
| `journal-entry` | `day:{day_id}` | `(00/00)` void | 0 | T0, T1 | — |
| `pattern` | `pattern:{crystal_uuid}` | `(0/1/2/3)` | 0 | T3 | Atelier crystallisation seed routed |
| `question` | `question:{uuid}` | `(0/1)` binary | 0 | T0 | — |
| `insight` | `insight:{uuid}` | `(5/0)` Möbius | 0 | T5 | — |
| `prompt` | `prompt:{run_id}` | `(4.0/1-4.4/5)` | 1 | varies | Anima invocation (separate AG-UI run handle) |
| `expand` | `prompt:{run_id}` | `(4.0/1-4.4/5)` | 1 | T1 | inline anima rewrite |
| `task` | `day:{day_id}` (day-structural) | `(0/1)` | 0 | T1 | daily-note `p1_tasks_defined` append |
| `daily-note` | `day:{day_id}` (day-structural) | per slot | 0 | per slot | daily-note `p{n}_*` slot append |
| `custom:{slug}` | `custom:{slug}:{uuid}` | configurable | 0 | configurable | operator-defined (registry-driven) |

**Filtered Nara views (M4-4' Dashboard panels) are Graphiti queries, not file readers:**

- **Dream Journal panel** → `graphitiClient.search({ arc_type_prefix: 'dream' })` over configurable date range
- **Oracle Log panel** → `graphitiClient.search({ arc_type_prefix: 'oracle' })`
- **Journal Stream panel** → `graphitiClient.search({ arc_type_prefix: 'day', ct: '0' })`
- **Question Inbox panel** → `graphitiClient.search({ t_lane: 'T0' })`
- **Insight Archive panel** → `graphitiClient.search({ t_lane: 'T5' })`
- **Pattern Crystals panel** → `graphitiClient.search({ arc_type_prefix: 'pattern' })`
- **Prompt History panel** → `graphitiClient.search({ arc_type_prefix: 'prompt' })`

Each panel renders episode cards. Clicking an episode card jumps the flow editor to the source highlight in the originating flow file (the highlight's stored `episode_id` round-trips). The operator never leaves the flow as primary surface, but every modality is queryable as a coherent timeline across all days.

**Bimba-anchoring for episodes.** When a coordinate was selected in M0/M1 (or surfaced by the Chronos clock) at the moment of highlight-send, the resulting episode carries `c_0_bimba_anchor: <coordinate>` per envelope §12. The info-pool inspector (§7.0.8) for that coordinate then surfaces the episode via `s_3_episodic_handles`. Coordinate selection → highlight-send → episode anchored → inspector shows it back. Round-trip closes.

**Why this works:** the envelope schema was designed for this. Episodic reporting is Layer 9; the typed-arc fields exist precisely to carry per-modality semantics. Graphiti is the runtime substrate. PersonalNexus + `[:HAS_EPISODE]` is canonical. We're not inventing modality plumbing — we're using the canonical episodic plane *as the modality plane* and dropping the file-per-modality redundancy.

##### Daily note as governing file

The daily note implements the canonical template at `Idea/Bimba/World/Daily-Note.md` — full QL frontmatter + 6-position structured body. The Tauri port is the first implementation that *actually honours* this template.

**Frontmatter schema** (auto-populated on creation):

```yaml
---
coordinate: ""                              # optional Bimba anchor
c_4_artifact_role: "daily-note"             # locks artifact identity
c_1_ct_type: "CT4b"                         # CT type for daily-governance role
c_3_ctx_frame: "4.0/1-4.4/5"                # Lemniscate fractal-doubling context frame
c_4_invocation_profile: "day_parent"        # this is the day's governing artifact
c_4_invocation_kind: "cron"                 # auto-generated by daily cron (or first-touch)
c_3_day_id: "2026-05-10"                    # the day's canonical id
c_3_created_at: "2026-05-10T00:00:00Z"
c_0_source_coordinates: []                   # populated as the day's artifacts attach
c_5_reflection_complete: false              # set true when end-of-day reflection finishes

# P-coordinates (semantic position slots — populated during the day)
p0_grounds:                                  # raw input; what's present at start
p0_adjacencies:                              # what borders today's work
p1_tasks_defined:                            # task index for the day (governs Entry-NNN)
p1_intentions:                               # what the operator wants from today
p2_sessions: []                              # references to flow versions, oracle casts, agent runs
p2_operations:                               # what happened (manual + agent)
p2_manual_activity:
p3_patterns:                                 # observations crystallised
p3_observations:
p3_connections:
p4_temporals:                                # time markers (DAY/NOW/Kairos)
p4_files_touched: []                         # files mutated today
p4_people_mentioned:
p4_concepts_engaged:
p5_learnings:                                # synthesis
p5_synthesis:
p5_tomorrow_focus:
---
```

**Body sections** (matching the frontmatter QL positions, written by the operator over the day):

```markdown
# {YYYY-MM-DD}

## #0 Ground — Capture
Raw input, brain-dump, residue from yesterday's reflection.

## #1 Definition — Tasks
- [ ] Must do
- [ ] Should do
- [ ] Could do

## #2 Operation — Sessions
What happened (Claude sessions, manual activity, agent runs, oracle casts).

## #3 Pattern — Observations
Themes that emerged. Connections noticed.

## #4 Context — Structure
Files touched. People mentioned. Concepts engaged. Temporal markers.

## #5 Synthesis — Crystallisation
Key learnings. Blockers. Tomorrow's focus.
```

**Auto-creation lifecycle**:
- On portal startup, if `Idea/Empty/Present/{today}/{today}.md` does not exist, the backend creates the folder + the daily note from the canonical template, with frontmatter populated.
- On first-touch (operator opens M4-4'), the system advances `c_4_invocation_kind` from `cron` to `interactive` if there's any operator-authored content yet.
- At end-of-day (configurable, default 03:00 the following morning), an Aletheia process runs reflection: distills the day's flow/oracle/dream files into the daily note's `p5_*` slots, sets `c_5_reflection_complete: true`, archives any `Entry-{NNN}` folders to `Idea/Pratibimba/Self/Action/History/{YYYY-MM}/`.
- The daily note's `p1_tasks_defined` block IS the **task index for the NOW context** — operators (and agents) read it as the source of truth for "what's the day asking of me?".

##### Flow file as phenomenological brain-dump

The flow file is for **open-ended phenomenological journalling** — first-pass writing where the operator just lets stream-of-consciousness land on the page. No required structure. No prompts. No interruptions from the system. Frontmatter + body.

This is the *first pass*. **Highlighting is the second pass.** The operator re-reads what they wrote and picks out, from the throng of material, what's differentiable as this-or-that kind of writing — *this paragraph is dream material, this fragment is a question for the oracle, this sentence is a task, this phrase wants to expand, this passage is a pattern worth crystallising*. The highlight category is the act of differentiation; the highlighted span is what's been pulled out of the flow.

Most highlights are just markers — semantic differentiation of stream-of-consciousness material. Some highlights are *also* sent to agents (the typed `InvocationEnvelope` path); some are promoted to entries via a NOW subfolder; some end up nowhere except as differentiation in the flow. The act of highlighting *is* the work; further routing is opt-in per highlight.

Flow file frontmatter holds the full `FlowMetadata`:

```yaml
---
date: "2026-05-10"
created: "2026-05-10T08:14:23Z"
updated: "2026-05-10T15:42:18Z"
version: 7
word_count: 2841
day_id: "2026-05-10"
session_lineage:
  - "session:abc123"
  - "session:def456"
highlights:
  - id: "01HKE..."
    category: "oracle"
    from: 1024
    to: 1156
    original_text: "..."
    label: "evening cast"
    color: null
    timestamp: 1747842138000
    provenance:
      flow_version: 7
    envelope_kind: "oracle_call"
    run_id: "run:xyz789"
  - id: "01HKF..."
    category: "dream"
    ...
---

# Flow

(operator's free-form writing — paragraphs, fragments, whatever)
```

**Versioning**:
- New version is created on every save where `word_count` differs by ≥ 50 from the most recent version.
- Versions are numbered monotonically: `FLOW-2026-05-10-v1.md`, `-v2.md`, ...
- Current version is always `FLOW-2026-05-10.md` (no `-v{N}` suffix); previous versions are renamed/copied.
- Restore: operator can pick any prior version from a panel; that version becomes current; the prior current is preserved as `-v{N+1}.md`.

##### Unified Highlight data model (one type, one store)

This replaces the two parallel stores (`flowStore`, `highlightsStore`) with one canonical `Highlight` shape. The Tauri renderer has one Zustand store (`flowStore`); highlights live as a sub-collection on the active flow entry.

```rust
// src-tauri/src/vault/highlight.rs

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Highlight {
    pub id: String,                          // ULID
    pub category: HighlightCategoryId,       // canonical or custom; see registry below
    pub from: u32,                           // byte offset in flow body
    pub to: u32,
    pub original_text: String,               // selected text at highlight time (immutable record)
    pub label: Option<String>,
    pub color: Option<String>,               // hex; nullable → uses category default
    pub timestamp: u64,                      // unix ms
    pub provenance: HighlightProvenance,
    pub envelope: Option<InvocationEnvelope>, // typed agent invocation if sent off
    pub run_id: Option<String>,              // back-link to agent run
    pub result_path: Option<String>,         // vault path of resulting artifact (e.g. ENTRY-NNN/CONTEXT.md)
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct HighlightProvenance {
    pub flow_version: u32,
    pub session_id: Option<String>,
    pub day_now_path: String,
}

pub type HighlightCategoryId = String;       // resolved via registry
```

##### Highlight category registry (extensible, not hardcoded)

The hardcoded enum in the Electron app (`'daily-note' | 'oracle' | 'dream' | 'expand'`) is replaced by a runtime registry in the Tauri backend. Canonical categories ship with the binary; users add custom ones at runtime.

```rust
// src-tauri/src/vault/highlight_registry.rs

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct HighlightCategory {
    pub id: HighlightCategoryId,             // canonical: 'daily-note', 'oracle', 'dream', 'expand', 'pattern', 'question', 'insight', 'task'
                                              // custom: 'custom:{slug}'
    pub display_name: String,
    pub default_color: String,
    pub description: String,
    pub envelope_template: EnvelopeTemplate, // typed template; replaces slash-string dispatch
    pub output_target: OutputTarget,         // where the resulting artifact lands
    pub is_custom: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum EnvelopeTemplate {
    Inline { kind: String },                  // e.g. 'expand' — runs inline in the editor
    OracleCall,                                // routes to oracle module with cast type
    DreamAnalysis,                             // routes to dream-interpretation skill
    DailyNoteAppend { section: String },      // appends to daily note's p{n} section
    EntryCreate { template: EntryTemplate },  // crystallises into ENTRY-NNN/CONTEXT.md
    AnimaInvocation { skill: String },        // bounded skill call
    AletheiaCrystallise,                       // promotes to T-coordinate thought archive
    Custom { handler: String },                // user-defined
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum OutputTarget {
    InlineRewrite,                             // result replaces or annotates the highlighted text
    DailyNoteSection { p: u8 },               // appends to daily note p{n}_* slot
    OracleLog,                                 // appends to ORACLE-YYYY-MM-DD.md
    DreamLog,                                  // appends to DREAM-YYYY-MM-DD.md
    EntryFolder,                               // creates Entry-NNN/CONTEXT.md
    Inbox,                                     // deposits into Epii inbox for review
    External { channel: String },             // routes to gateway channel (e.g. send to chat)
}
```

**Canonical categories shipped with the binary** (registered at startup):

| Category id | Default color | Differentiation meaning | Optional sendoff (operator-triggered) |
|---|---|---|---|
| `daily-note` | `#10b981` (emerald) | belongs in the day's daily-note quilt point | append to a daily-note `p{n}_*` section |
| `oracle` | `#f59e0b` (amber) | wants oracle attention (in-person draw, or computational lookup) | route to oracle module for relational analysis |
| `dream` | `#8b5cf6` (violet) | dream material — surfaces in the Dream Journal panel | Graphiti episode `arc_type: dream:{day_id}`, CPF `(4.0/1-4.4/5)`, T2/T3 lanes |
| `expand` | `#06b6d4` (cyan) | wants expansion (anima rewrite/elaboration) | inline anima invocation |
| `pattern` | `#ec4899` (pink) | crystallisation candidate — pattern across material | route to atelier as crystallisation seed |
| `question` | `#ef4444` (red) | open question — wants clarification or investigation | optional anima/sophii invocation |
| `insight` | `#fbbf24` (yellow) | something worth keeping as standalone insight | promote to entry (in a NOW subfolder) |
| `task` | `#3b82f6` (blue) | actionable — belongs in the daily-note task index | append to daily-note `p1_tasks_defined` |

The category's *meaning* is differentiation. The *sendoff* (envelope + output target) is opt-in per highlight — the operator decides whether a given highlighted span should also fire its associated routing.

**Custom categories** are persisted in `~/.epi-logos/highlight_registry.json` and survive across sessions. The OmniPanel Settings panel exposes a UI for creating them: pick a slug, color, and (optionally) an envelope template + output target.

##### Highlight sendoff — typed invocation, only when operator chooses

When the operator chooses to route a highlight (via FloatingMenu "send" action or keybinding), the renderer:

1. Looks up the category in the registry → gets envelope template + output target
2. Constructs a typed `InvocationEnvelope` (no string manipulation, no `/oracle "..."` slash strings)
3. Calls `agentExecutionClient.invoke(envelope)` → gets `AgentRunHandle { run_id, ... }`
4. Stores `run_id` on the `Highlight` for back-linking
5. Subscribes to `agent:run:{run_id}` to track progress
6. On completion, the result is written to the configured `OutputTarget`
7. The highlight's `result_path` is updated to point at the output artifact

Highlights without a sendoff just stay in the flow file as differentiation markers — that is the *primary* mode; sendoff is the secondary, opt-in mode.

##### Tarot + I-Ching — Oracle as computational / relational work

Casting is fundamentally a **live operator gesture** — pulling a physical card, throwing physical coins, sorting yarrow stalks. The Tauri app is **not** the agent of the cast. The operator does the cast in person; the app is where the operator records what they drew and where the oracle module does the *computational and relational* work — looking up correspondences, threading the cast through current kairos, finding resonant Bimba coordinates, surfacing related aphorisms from the Atelier, providing interpretive scaffolding.

There is also a **randomness generation engine** available for purely computational casts when the operator wants one (e.g. for an automated daily card or to seed an experiment), but it is opt-in, not the default. **Live operator casting is the canonical path.**

The data structures hold both deck/hexagram knowledge and recorded casts:

```rust
// src-tauri/src/oracle/tarot.rs

pub struct TarotCard {
    pub id: u8,                              // 0..77 across the canonical 78
    pub name: &'static str,
    pub arcana: Arcana,                      // Major | Minor
    pub suit: Option<Suit>,
    pub rank: Option<Rank>,
    pub keywords: &'static [&'static str],
    pub element: Option<Element>,
    pub planet: Option<Planet>,
    pub hebrew_letter: Option<&'static str>, // for Major Arcana
    pub kabbalistic_path: Option<u8>,
}

pub const RIDER_WAITE_DECK: [TarotCard; 78] = [ /* full 78-card definitions */ ];

pub struct TarotCast {
    pub cast_id: String,                     // ULID
    pub spread: TarotSpread,                 // 'single' | 'three-card' | 'celtic-cross' | custom
    pub cards: Vec<DrawnCard>,               // one per spread position — entered by the operator
    pub origin: CastOrigin,                  // LiveDraw | RandomnessEngine
    pub timestamp: u64,
    pub kairos_at_cast: KairosState,         // sky at the moment recorded
    pub composed_quaternion_at_cast: [f32; 4],
    pub source_highlight_id: Option<String>, // if the cast was prompted by a highlight
    pub interpretation: Option<String>,      // populated by oracle module / sophii after recording
    pub correspondences: OracleCorrespondences, // computational/relational analysis output
}

pub struct DrawnCard {
    pub position: u8,                        // spread position index
    pub position_meaning: String,            // e.g. "Past" / "Present" / "Future" for three-card
    pub card_id: u8,                         // index into RIDER_WAITE_DECK
    pub reversed: bool,
}

pub enum CastOrigin {
    /// The operator drew physically and recorded the cards in the app — canonical path.
    LiveDraw,
    /// The operator asked the app to draw computationally (rare; for automation/experiment).
    RandomnessEngine { seed: u64 },
}

pub struct OracleCorrespondences {
    /// Resonant Bimba coordinates surfaced by Cypher pattern match against the cards' attributes.
    pub bimba_resonances: Vec<BimbaCoordinateRef>,
    /// User's own aphorisms touching this cast's themes (Atelier query).
    pub atelier_aphorism_echoes: Vec<AtelierAphorismRef>,
    /// Astrological correspondences with current kairos (planet under transit, etc.).
    pub kairos_correspondences: Vec<KairosCorrespondence>,
    /// MEF lens commentaries on the cast through each lens.
    pub mef_lens_readings: Vec<MefLensReading>,
}
```

```rust
// src-tauri/src/oracle/iching.rs

pub struct IChingHexagram {
    pub id: u8,                              // 1..64 (King Wen sequence)
    pub name: &'static str,
    pub trigrams: (Trigram, Trigram),
    pub binary: u8,                          // six-bit, broken=0/solid=1
    pub judgement: &'static str,
    pub image: &'static str,
    pub line_texts: [&'static str; 6],
}

pub const KING_WEN_SEQUENCE: [IChingHexagram; 64] = [ /* full 64-hexagram definitions */ ];

pub struct IChingCast {
    pub cast_id: String,
    pub primary_hex: u8,                     // 1..64 — entered by the operator (or computed)
    pub changing_lines_mask: u8,             // 6-bit; 1 = changing — entered by the operator (or computed)
    pub temporal_hex: u8,                    // derived: primary with changing lines flipped
    pub method: CastMethod,                  // 'three-coin' | 'yarrow-stalks' | 'recorded-only'
    pub origin: CastOrigin,                  // LiveDraw | RandomnessEngine
    pub timestamp: u64,
    pub kairos_at_cast: KairosState,
    pub composed_quaternion_at_cast: [f32; 4],
    pub source_highlight_id: Option<String>,
    pub interpretation: Option<String>,
    pub correspondences: OracleCorrespondences,
}
```

**Recording flow** (the canonical path):

1. The operator does the cast in person — physical cards/coins/stalks.
2. They open the M4-2' surface and either:
   - For Tarot: pick the spread, then for each position pick the card from a searchable picker and toggle reversed/upright.
   - For I-Ching: enter the six lines (broken/solid + changing/static) one at a time, or directly enter the primary hexagram + changing-lines mask.
3. The operator clicks "Record cast." The Tauri command creates a Graphiti episode (`arc_type: oracle:{cast_uuid}`, CPF `(0/1/2/3)`, T3+T5 lanes) carrying the `TarotCast` / `IChingCast` payload as episode content, anchored at PersonalNexus via `[:HAS_EPISODE]`. The oracle module's correspondence pass runs against the episode.
4. The oracle module runs **computational/relational work**: queries Cypher for related Bimba coordinates (e.g. cards with matching planets, hexagrams with matching ruling decans), queries `:Atelier_*` for echoing aphorisms, threads the cast through current kairos, applies the active MEF lens. Result populates `correspondences`.
5. Sophii (optional) writes interpretive prose drawing on the `correspondences` payload. The operator can edit, accept, or reject.
6. The cast updates `PortalClockState.last_cast` so the Chronos clock visualises the new oracle position.

**Randomness engine path** (opt-in, used sparingly):

When the operator explicitly asks the app to draw, `oracle_random_cast` invokes the `RandomnessEngine` (a cryptographically-seeded RNG with optional `composed_quaternion`-derived entropy as a flavour input). Origin is recorded as `RandomnessEngine { seed }` so it's never confused with a live cast.

**Both casts create Graphiti episodes** carrying the full cast payload as episode content, with provenance marked clearly. The episode shape (illustrative — the actual Graphiti episode is JSON-encoded under the canonical `:Pratibimba:Episodic` schema, not a markdown file):

```yaml
---
casts:
  - cast_id: "01HKE..."
    kind: "tarot"
    spread: "three-card"
    origin: "live_draw"                     # operator drew physically
    timestamp: 1747842138000
    composed_quaternion_at_cast: [0.512, 0.281, 0.734, 0.342]
    source_highlight_id: "01HKE..."         # if prompted by a flow highlight
    cards:
      - position: 0
        position_meaning: "Past"
        card_id: 0                          # The Fool
        reversed: false
      - position: 1
        position_meaning: "Present"
        card_id: 14                         # Temperance
        reversed: true
      - position: 2
        position_meaning: "Future"
        card_id: 21                         # The World
        reversed: false
    correspondences:
      bimba_resonances: [...]
      atelier_aphorism_echoes: [...]
      kairos_correspondences: [...]
      mef_lens_readings: [...]
    interpretation: "..."                   # operator + sophii pass
  - cast_id: "01HKF..."
    kind: "iching"
    method: "three-coin"
    origin: "live_draw"
    timestamp: ...
    primary_hex: 11                         # T'ai / Peace
    changing_lines_mask: 0b001010           # lines 2, 4 changing
    temporal_hex: 28                        # Ta Kuo / Preponderance of the Great
    ...
---

# Oracle — 2026-05-10

## 14:42 — Tarot Three-Card (live draw, from highlight #01HKE...)

**Past:** The Fool …
**Present:** Temperance (reversed) …
**Future:** The World …

> Correspondences: <Bimba M3-4', Atelier "Ship of Relations", Sun-in-Aries decan-2>
> Interpretation (operator + sophii): …

## 16:05 — I-Ching (live draw, three-coin)

**Primary:** ䷊ T'ai / Peace …
**Changing lines:** 2, 4
**Temporal:** ䷛ Ta Kuo / Preponderance of the Great …

> Correspondences: …
> Interpretation: …
```

**Cast recording UI (M4-2'):**

- Top: kind toggle (Tarot | I-Ching) + origin toggle (`Live draw` default | `Random`)
- Center (Tarot live draw): spread picker (single / three-card / celtic-cross), then for each position a searchable card picker + reversed/upright toggle
- Center (I-Ching live draw): six-line entry pad (broken/solid × static/changing per line), or direct primary-hex + changing-lines-mask entry
- Center (Random origin): single "Draw" button that uses the randomness engine and reveals the result
- Right: live correspondences panel — populates as the cast is recorded (Bimba resonances, Atelier echoes, Kairos correspondences, MEF lens readings)
- Bottom: interpretation panel — operator writes their own reading; "Ask Sophii" button runs the optional sophii pass which threads the correspondences into prose
- "Save cast" → creates the Graphiti oracle-arc episode and updates `PortalClockState.last_cast`; the Oracle Log panel (filtered Graphiti view) immediately shows the new cast
- "Note in flow" → appends a quote block to today's flow file with `category: "oracle"` highlight pre-applied at the inserted span

##### Concurrency protection

Two saves racing on the same flow file are detected via the `version` frontmatter field:

```rust
pub async fn vault_save_flow_entry(
    date: String,
    content: String,
    metadata: FlowMetadata,
    expected_version: u32,                   // CAS guard
    state: State<'_, AppState>,
) -> Result<FlowEntry, AppError>;
```

The save returns `AppError::ConcurrentEdit { current_version, your_version, conflict_diff }` if the on-disk version is ahead of what the renderer thought. The renderer surfaces a non-modal banner: "Your flow file was edited elsewhere — review changes" with a side-by-side diff.

##### Frontmatter validation

`gray_matter` parses; a `FlowFrontmatterValidator` enforces the canonical schema and surfaces clear errors on mismatch (rather than silently dropping metadata as the Electron app does). Validation runs on every save and on every load; load-time errors prompt a "repair frontmatter" dialog.

##### Tauri commands (replacing `journal:*` IPC handlers)

```rust
#[tauri::command]
pub async fn vault_get_today_now_folder(state: State<'_, AppState>) -> Result<NowFolder, AppError>;
// Returns the day's folder path + presence of each canonical artifact (daily note, flow, dream, oracle, entries)

#[tauri::command]
pub async fn vault_ensure_daily_note(state: State<'_, AppState>) -> Result<DailyNote, AppError>;
// Creates from canonical template if absent; idempotent.

#[tauri::command]
pub async fn vault_get_daily_note(date: String, state: State<'_, AppState>) -> Result<Option<DailyNote>, AppError>;

#[tauri::command]
pub async fn vault_save_daily_note(
    date: String,
    frontmatter: DailyNoteFrontmatter,
    body: String,
    state: State<'_, AppState>,
) -> Result<(), AppError>;

#[tauri::command]
pub async fn vault_get_flow_entry(date: String, state: State<'_, AppState>) -> Result<Option<FlowEntry>, AppError>;

#[tauri::command]
pub async fn vault_save_flow_entry(
    date: String, content: String, metadata: FlowMetadata, expected_version: u32,
    state: State<'_, AppState>,
) -> Result<FlowEntry, AppError>; // CAS-checked

#[tauri::command]
pub async fn vault_list_flow_versions(date: String, state: State<'_, AppState>) -> Result<Vec<u32>, AppError>;

#[tauri::command]
pub async fn vault_get_flow_version(date: String, version: u32, state: State<'_, AppState>) -> Result<Option<FlowEntry>, AppError>;

#[tauri::command]
pub async fn vault_save_dream_entry(date: String, content: String, state: State<'_, AppState>) -> Result<(), AppError>;

#[tauri::command]
pub async fn vault_save_oracle_cast(date: String, cast: OracleCast, state: State<'_, AppState>) -> Result<(), AppError>;

#[tauri::command]
pub async fn vault_promote_highlight_to_entry(
    highlight_id: String, template: EntryTemplate, state: State<'_, AppState>,
) -> Result<EntryMetadata, AppError>; // creates Entry-NNN/CONTEXT.md

#[tauri::command]
pub async fn highlight_registry_list(state: State<'_, AppState>) -> Result<Vec<HighlightCategory>, AppError>;

#[tauri::command]
pub async fn highlight_registry_register(category: HighlightCategory, state: State<'_, AppState>) -> Result<(), AppError>;

// Operator records a live tarot draw — canonical path
#[tauri::command]
pub async fn oracle_record_tarot(
    spread: TarotSpread,
    cards: Vec<DrawnCard>,                   // operator-entered draws
    source_highlight_id: Option<String>,
    state: State<'_, AppState>,
) -> Result<TarotCast, AppError>;
// Writes the cast, runs computational/relational correspondence pass, updates last_cast.

// Operator records a live I-Ching cast — canonical path
#[tauri::command]
pub async fn oracle_record_iching(
    method: CastMethod,
    primary_hex: u8,                         // operator-entered
    changing_lines_mask: u8,                 // operator-entered
    source_highlight_id: Option<String>,
    state: State<'_, AppState>,
) -> Result<IChingCast, AppError>;

// Randomness-engine cast — explicit, opt-in (not canonical)
#[tauri::command]
pub async fn oracle_random_tarot(spread: TarotSpread, state: State<'_, AppState>) -> Result<TarotCast, AppError>;

#[tauri::command]
pub async fn oracle_random_iching(method: CastMethod, state: State<'_, AppState>) -> Result<IChingCast, AppError>;

// Run the computational/relational correspondence pass on an existing cast
#[tauri::command]
pub async fn oracle_correspond(
    cast_id: String,
    state: State<'_, AppState>,
) -> Result<OracleCorrespondences, AppError>;

// Optional sophii interpretation pass over the correspondences
#[tauri::command]
pub async fn oracle_sophii_interpret(
    cast_id: String,
    state: State<'_, AppState>,
) -> Result<AgentRunHandle, AppError>;       // streams via agent:run:{run_id}
```

##### Acceptance criteria (canonical flow document model)

- On any new day, the daily note folder + file are created with canonical frontmatter before the operator opens M4-4'.
- Saving the flow file with a stale `expected_version` returns `ConcurrentEdit`; the renderer surfaces the banner.
- Selecting text and clicking "Oracle" produces a typed `InvocationEnvelope` (verifiable in the inbox/run list) — never a `/oracle "..."` slash string.
- Highlight registry is editable at runtime; a custom category persists across launches.
- A live tarot draw recorded by the operator creates a Graphiti episode (`arc_type: oracle:{cast_uuid}`, `origin: live_draw`) with full provenance (timestamp, composed_quaternion at cast, source_highlight_id) and a populated `correspondences` payload. The episode is anchored at PersonalNexus and visible in the Oracle Log panel via filtered query.
- A randomness-engine cast appends with `origin: random` and a recorded seed; never confused with a live draw.
- An I-Ching cast (either origin) updates `PortalClockState.last_cast` (verifiable via `clock_get_state`).
- Running `oracle_correspond` on a recorded cast returns Bimba resonances + Atelier echoes + Kairos correspondences + MEF lens readings without re-doing the cast itself.
- The end-of-day Aletheia reflection sets `c_5_reflection_complete: true` and populates `p5_*` slots.
- Two highlight categories with the same id reject the second registration with a clear error.

#### M4-4' Lens Library — full sub-spec

This is the most complex M4' surface. It is the existing `NaraDashboard` + `NaraEditor`, ported intact, deepened.

**Layout:**
```
┌──────────┬──────────────────────────────┬────────────┐
│ Left     │ Center: TipTap editor        │ Right rail │
│ rail     │  - Today's flow              │            │
│ - Journal│  - Auto-save 2s debounce     │ Highlights │
│ - Daily  │  - HighlightMark extension   │ list       │
│ - Dream  │  - FloatingMenu on selection │            │
│ - Oracle │    -> Chat / Oracle / Dream / │ Pending    │
│ - Search │       Expand actions         │ sendoffs   │
│ - Tasks  │  - Lens chip toolbar         │            │
│ - Walk   │    (6 lenses; affects view)  │ Current    │
│   about  │                              │ cast       │
└──────────┴──────────────────────────────┴────────────┘
```

**Editor stack:**
- TipTap StarterKit (preserved)
- `Placeholder` extension (preserved)
- `CustomKeybindings` extension (preserved): Mod-B/I/K/U
- `HighlightMark` (custom mark — preserved): stores category + id + label + color in attributes; renders with category-specific class
- `FloatingMenuExtension` (custom — preserved): on selection, opens `<FloatingMenu>` with four action buttons (Chat / Oracle / Dream / Expand)

**Highlight categories:** `daily-note`, `oracle`, `dream`, `expand` (preserved). Plus new: `pattern` (CT3-aligned), `question`, `insight`.

**Sendoff replacement** — this is the critical change from Electron:

In Electron, FloatingMenu actions wrote a slash-command string (`/oracle ...`) and dispatched. In Tauri, FloatingMenu actions call `naraClient.sendoff(highlight, modality, sessionKey)` which constructs a typed `InvocationEnvelope`:

```typescript
{
  kind: 'nara_highlight',
  modality: 'oracle' | 'dream' | 'expand' | 'daily-note',
  session_key: string,
  payload: {
    text: string,           // selected text
    category: string,
    from: number,
    to: number,
    timestamp: number,
  },
  day_now: { day: '2026-05-09', now: 'Idea/Empty/Present/2026-05-09/...' },
  coordinate: 'M4-4\'',
}
```

The envelope is `agent_invoke`d. The result is an `AgentRunHandle` (run_id). The renderer subscribes via `agentExecutionClient.onRunEvent(runId, ...)` and shows the run's progress in the right rail "pending sendoffs" panel. Once complete, the result lands in `inboxStore` for review.

**Daily Note** (`daily-note` modality):
Reads `vaultClient.getTodayNote()`. If absent, calls `vaultClient.getDailyNote(today)` first; if still absent, creates a new daily note via the standard frontmatter template (the `ql-frontmatter` skill provides the canonical schema). Daily notes are tied to `temporalClient.getDayNow()` — DAY/NOW context is auto-stamped into the frontmatter on save.

**Dream Journal** (`dream` modality):
Same editor instance but with the `dream` highlight category default; entries persist as a separate flow file (`DREAM-YYYY-MM-DD.md`) with version retention. Highlights here surface for CT3-pattern processing in M5'.

**Oracle modality**:
The editor is dimmed; a card overlay displays the current oracle cast with full interpretation. "Apply to Journal" stamps a typed quote block into today's journal with the cast's lineage in frontmatter.

**Lens chip toolbar** (top of editor):
Six chips (Phenomenological / Archetypal / Temporal / Somatic / Relational / Integrative). Active lens does NOT change content — it changes how the editor renders highlights. Phenomenological lens shows raw highlight categories; Archetypal shows the highlight's tarot/numerological correspondence; Temporal shows DAY/NOW lineage; etc.

#### Acceptance criteria

- TipTap editor loads existing today's flow within 200ms of M4-4' mount.
- Selecting text shows the FloatingMenu within one frame.
- Clicking Oracle in FloatingMenu produces a typed envelope (verifiable in `inboxStore.pending`) — never a slash string.
- Auto-save fires 2s after last keystroke; saved version visible via `vaultClient.listFlowVersions(today)` increments.
- Switching modality (Daily ↔ Dream ↔ Journal) preserves draft (auto-saves before swap).

### 7.6 M5' Epii — Integrative workbench

The system / pedagogy / archaeology surface. M5 is the desktop `1` deeper return. M5 owns the **Möbius cycle** between Atelier (M5-5') and Library (M5-0') — synthesis becomes new ground for the next inquiry.

The strata together implement the Epi-Logos integrative position. Per the v0 architecture (`/Users/admin/Documents/early-epi/Epi-Logos_Seed_Files/epii_app/friendly-file-front/src/subsystems/5_epii/`) and the strata-app spec (`/Users/admin/Documents/early-epi/strata-app/`), M5 has six surfaces with strong identity:

#### Workspace shell
Tabbed primary surface (Library | Atelier | Pedagogy | Siva | Shakti | Integration), with VAK Execution and Inbox accessible as right-side panels from any tab. The Möbius cycle is **explicit in the UI** — the Atelier has a "→ Library" arrow, the Library has a "→ Atelier (Möbius Seeds)" panel.

| Stratum | Surface | Implementation |
|---|---|---|
| M5-0' | **Library — Geometric Folio** ★ | **MÖBIUS END.** See full sub-spec below. Recursive folio of constellations, aphorisms, ecology view, projects, and published artifacts. Möbius seeds detected from each aphorism feed the next Atelier session. |
| M5-1' | Epi-Logos Philosophy | Pedagogy guided learning. Sessions (`epiiClient.pedagogy.startGuided`) walk the operator through a topic keyed to `active_branch_lens` — Quaternal Logic, CON-SCIRE principle, the Möbius structure of consciousness, etc. The conversation is streamed via `agentExecutionClient.invoke` with a typed pedagogy envelope. |
| M5-2' | **Siva Layer (Backend)** | System/backend monitoring AND the canonical reference surface for backend architecture. Live: gateway health, presence, channel status, neo4j connectivity (Bimba), spacetime mode + last hydration timestamp, vault watcher status, Notion sync state (Pratibimba). Reference panels: MEF lens framework registry (see §7.6.6), QL pipeline diagram, Bimba-Pratibimba data flow visualisation. Useful for debugging *and* for understanding how the system thinks. |
| M5-3' | **Shakti Layer (Frontend)** | Functional specs and Kinetic Logos planning surface — the operator's creative-agency canvas (Shakti as active force, not literal UI frontend). Operator drafts feature seeds, marks them with QL position + branch lens, sketches functional specs for the system itself. There is no autonomous autoresearch loop writing into the Library; the operator's drafting *is* the work here. |
| M5-4' | **Siva-Shakti Integration / Epii Mode** ★ | **The 5/0 Domain.** The agent control room AND the Bimba Update System AND the Notion Crystallization Pipeline AND VAK execution. See full sub-spec below. This is where Notion (Pratibimba reflection) and Neo4j (Bimba original) dance in unity — the single transcendent surface of the system. |
| M5-5' | **Atelier — Strata Excavator** ★ | **MÖBIUS START.** Etymological archaeology surface implementing the 6-position Logos Cycle as invisible infrastructure under contemplative dialogue with **Sophii** (the AI etymological archaeologist). See full sub-spec below. |

#### M5-4' VAK execution surface — full sub-spec

A dedicated page where every agentic invocation becomes explicit and inspectable. Layout:

```
┌──────────────────────────────────────────────────────────────────┐
│ VAK Evaluation Panel                                             │
│ - CPF: [select coordinate field-frame]                           │
│ - CT:  [select content type frame]                               │
│ - CP:  [select context-position]                                 │
│ - CF:  [select context frame — Lemniscate anchor]                │
│ - CFP: [select frame-position composition]                       │
│ - CS:  [select system context]                                   │
├──────────────────────────────────────────────────────────────────┤
│ Routing Panel                                                    │
│ - Mode: ○ Anima (dispatch)  ○ Aletheia (mode of Anima)           │
│ - Agent / Team / Chain selector                                  │
│ - Bounded tools: [list of allowed tools, checkboxes]             │
│ - Bounded skills: [list, checkboxes]                             │
├──────────────────────────────────────────────────────────────────┤
│ Payload Panel                                                    │
│ - Selected text from any source (Nara highlight, file selection) │
│ - Coordinate (optional)                                          │
│ - Session lineage (DAY/NOW + parent session if forking)          │
│ - Attachments                                                    │
├──────────────────────────────────────────────────────────────────┤
│ Execution Panel (live, streaming)                                │
│ - Run tree (collapsible nodes)                                   │
│ - Tool events (each tool call as a row, expandable to args/result)│
│ - Diagnostics (any errors, retries, gateway events)              │
│ - Buttons: Retry / Abort / Continue / Reset                      │
├──────────────────────────────────────────────────────────────────┤
│ Inbox Panel (deposits)                                           │
│ - Items requiring Epii or user validation                        │
│ - Approve / Reject / Continue with note buttons                  │
└──────────────────────────────────────────────────────────────────┘
```

The VAK panel calls `agentExecutionClient.vakEvaluate({...})` to compute the recommended invocation envelope, but the operator can override any field. On invoke, `agentExecutionClient.invoke(envelope)` returns a run handle; the execution panel listens to `agent:run:{run_id}` events and streams.

This surface is **not** a "twelve agent cards dashboard" — it is the unified invocation grammar. Aletheia is a **mode** of Anima (radio button), not a peer agent.

#### M5-5' Atelier — Strata Excavator (full sub-spec)

The Atelier is the primary working surface for etymological archaeology. It implements the **6-position Logos Cycle** as **invisible infrastructure** under a contemplative dialogue with **Sophii**, the AI etymological archaeologist. The user experiences free-flowing exploration; the system ensures that every session traverses the canonical inquiry rhythm and crystallises real insight. **Invisible rigor, visible poetry.**

##### The 6-position Logos Cycle (the engine under the dialogue)

| QL pos | Greek term | Atelier expression | Cycle character |
|---|---|---|---|
| #0 | Ἄλογος (Alogos) | Contemplative opening — Sophii: *"What words are present in your mind right now?"* | Silent receptivity, pre-verbal potential |
| #1 | Προ-λόγος (Pro-logos) | First differentiation — initial PIE root traces, etymology stream begins | Participatory emergence |
| #2 | Δια-λόγος (Dia-logos) | Relational mapping — constellation forms, cross-domain connections, QL community crystallisation | Mythic narrative, relational networks |
| #3 | Λόγος (Logos) | Articulated clarity — systematic synthesis, constitutional chains verified, register labelled | Peak rational differentiation |
| #4 | Ἐπι-λόγος (Epi-logos) | Meta-reflection — quality validation, alternative perspectives offered, limitations acknowledged | Reflexive turn, nesting threshold |
| #5 | Ἀνά-λογος (Ana-logos) | Proportional recognition — aphorism crystallisation, **Möbius seeds detected** (adjacent territories), synthesis becomes new ground | Quilted synthesis, creative advance, return → #0 |

The cycle is **not exposed in the UI as labels** — Sophii's prompting and the constellation's progression embody it. But the agent invocation envelope tags every turn with its current QL position so the system can detect when a stage is incomplete (e.g. user wants to crystallise an aphorism without a real `dia-logos` constellation; Sophii pushes back).

##### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ Atelier Toolbar                                                  │
│ [Session: "Ship of Relations"] [Lens: Phenomenological ▼]        │
│ [→ Library]  [Save Constellation]                                │
├──────────┬─────────────────────────────────────┬─────────────────┤
│          │                                     │                 │
│ Curation │  Sophii Chat (center, streaming)    │ Live Constella- │
│ sidebar  │                                     │ tion Graph      │
│          │  Sophii: "What words are present    │                 │
│ + Add    │   in your mind right now?"          │ ┌─────────────┐ │
│   Word   │                                     │ │  MUST  LUST │ │
│ - Remove │  User: MASK, MIST, MUST, LUST       │ │   ◇    ◇    │ │
│   Word   │                                     │ │ MASK   MUSE │ │
│          │  Sophii [streaming]: Let me trace…  │ │   ◇    ◇    │ │
│ Reposit. │   MASK from PIE *mesg- (weave mesh) │ │             │ │
│  in QL   │   MUST from *med- (measure)…        │ │  hex/twin-  │ │
│          │                                     │ │  hex/triadic│ │
│ Register │  [more PIE traces, cross-domain     │ │  per geometry│ │
│ toggle:  │   connections, register notes]      │ │  class      │ │
│  ○ const │                                     │ │             │ │
│  ○ situ  │  [User: Hmm, MUST and LUST mirror?] │ │ click node →│ │
│          │  Sophii: They phonetically mirror   │ │  inspector  │ │
│ Confid:  │   /mʌst/ vs /lʌst/. Necessity vs    │ │             │ │
│  ○ certn │   unmeasured desire.                │ └─────────────┘ │
│  ○ probb │                                     │                 │
│  ○ specu │  [Crystallize Aphorism →]           │ Constellation   │
│          │                                     │ name field      │
│ Session  │                                     │ Fold detection: │
│ history  │                                     │  3/4/6/12       │
│          │                                     │                 │
└──────────┴─────────────────────────────────────┴─────────────────┘
```

##### Components

**Sophii chat stream** (center)
- Real-time SSE streaming via `agentExecutionClient.invoke` with envelope `kind: 'atelier_dialogue'`. First-token latency target <500ms.
- Conversational, not informational — Sophii is a **fellow archaeologist** in CON-SCIRE partnership, not an oracle.
- Embedded analysis: PIE root traces, phonemic patterns, QL essence analysis surface inline as marked-up spans (clickable for detail).
- GraphRAG context **invisible but operative**: Sophii sees the user's full ecology via `epiiClient.bimbaWalk`/`semanticSearch` tools (see §7.6.4 below). The user never types `/analyze etymology` — Sophii just knows.

**Live constellation graph** (right)
- Force-directed layout via `react-force-graph-2d`, **layout class selected by graph structure**: 3-fold (triangular), 4-fold (square), 6-fold (hexagonal), 12-fold (double-hexagon) per §7.0.5.
- Nodes are words; positioned by **semantic essence** (assigned QL position 0–5), not ordinal calculation.
- Edge styling encodes **register**: solid line = constitutional (documented etymology), dashed = situational (phonemic/resonant). Edge color encodes confidence: certain (saturated), probable (medium), speculative (faint).
- Node click → opens etymology detail in the curation sidebar.
- Constellation auto-saves to Neo4j as the dialogue proceeds.

**Curation sidebar** (left)
- Add/Remove word controls (entry triggers next dialogue turn keyed to `pro-logos`).
- Reposition word in QL frame (manual override of Sophii's ql_essence assignment).
- Register toggle (constitutional/situational) + confidence (certain/probable/speculative).
- Session history list (current + previous sessions in this user ecology).
- Lens selector (six lenses — see MEF in §7.6.6); selecting a lens re-renders Sophii's framing for subsequent turns.

##### Data shape — Atelier as `:Atelier_*` namespace in the canonical Neo4j

The Atelier is the **etymology layer** of the canonical Neo4j (Part III.5). Atelier nodes share the database with `:Bimba` and `:Gnostic`; cross-namespace edges are first-class Cypher relationships. There is no separate store, no SQLite, no foreign-key gymnastics. Linguistic meaning is the soil; the canonical graph grows out of it.

```cypher
// Words — single-node ecology enforced by MERGE on canonical form
(:Atelier_Word {
    word:             STRING,         // canonical UPPERCASE form, primary key by MERGE
    pie_root:         STRING?,
    language_family:  STRING?,
    created_at:       DATETIME
})

// Constellations — the user's living patterns
(:Atelier_Constellation {
    constellation_id: STRING,         // ULID
    name:             STRING,
    fold:             INTEGER,        // 3 | 4 | 6 | 12
    geometry_class:   STRING,         // 'Hexagonal6Fold' | 'DoubleHexagon12Fold' | ...
    visibility:       STRING,         // 'private' | 'shared' | 'public'
    created_at:       DATETIME,
    updated_at:       DATETIME
})

// Aphorisms — the crystallisations
(:Atelier_Aphorism {
    aphorism_id:      STRING,         // ULID
    text:             STRING,
    type:             STRING,         // 'proper' | 'poetic' | 'symbolic' | 'question-seed'
    ql_position:      INTEGER,        // 0..5
    visibility:       STRING,
    created_at:       DATETIME
})

// Word membership in constellation + QL position assignment
(:Atelier_Word)-[:MEMBER_OF {
    ordinal:          INTEGER,        // 0..11 for 12-fold, etc.
    ql_position:      INTEGER,        // 0..5
    essence:          STRING          // "void/concealment", "measure", "desire", ...
}]->(:Atelier_Constellation)

// Edges between words within a constellation — the relational mesh
(:Atelier_Word)-[:PATTERNS_WITH {
    constellation_id: STRING,
    register:         STRING,         // 'constitutional' | 'situational'
    confidence:       STRING,         // 'certain' | 'probable' | 'speculative'
    cited_source:     STRING?,
    notes:            STRING?,
    created_at:       DATETIME
}]->(:Atelier_Word)

// Aphorism → constellation it crystallises
(:Atelier_Aphorism)-[:CRYSTALLISES]->(:Atelier_Constellation)

// Aphorism → words it incorporates
(:Atelier_Aphorism)-[:INCORPORATES]->(:Atelier_Word)

// Möbius seeds — adjacent territories detected from a fresh aphorism
(:Atelier_Aphorism)-[:SEEDS {
    seed_text:        STRING          // the candidate territory word/phrase
}]->(:Atelier_Constellation)          // null target until the territory is started

// Sessions (the Sophii dialogue runs)
(:Atelier_Session {
    session_id:       STRING,         // ULID
    starter_word:     STRING?,
    current_ql_pos:   INTEGER,        // 0..5 — which Logos Cycle position the dialogue has reached
    status:           STRING,         // 'open' | 'crystallised' | 'archived'
    created_at:       DATETIME,
    updated_at:       DATETIME
})
(:Atelier_Session)-[:PRODUCED]->(:Atelier_Constellation)

// CROSS-NAMESPACE EDGES — atomic, transactional, native Cypher

// Etymological resonance with the canonical Bimba map
(:Atelier_Aphorism)-[:RESONATES_WITH {
    similarity:       FLOAT,          // 0..1
    detected_via:     STRING,         // 'mef_lens' | 'embedding' | 'manual'
    detected_at:      DATETIME,
    notes:            STRING?
}]->(:Bimba)

(:Atelier_Constellation)-[:RESONATES_WITH { ... }]->(:Bimba)

// Etymological lineage — words deriving from gnostic source material
(:Atelier_Word)-[:DERIVES_FROM {
    cited_in:         STRING          // citation in source
}]->(:Gnostic)
```

**Single-node ecology** is enforced by `MERGE`:

```cypher
MERGE (w:Atelier_Word { word: $word })
ON CREATE SET w.created_at = datetime(),
              w.pie_root = $pie_root,
              w.language_family = $language_family
```

The same word `HEART` appearing in three constellations is one node with three `[:MEMBER_OF]` outgoing relationships. The Library ecology view (§M5-0' below) walks these to surface single-node-across-many-constellations cross-references.

**Indexes** (created on first run via Cypher migration):

```cypher
CREATE INDEX FOR (w:Atelier_Word) ON (w.word);
CREATE INDEX FOR (c:Atelier_Constellation) ON (c.constellation_id);
CREATE INDEX FOR (a:Atelier_Aphorism) ON (a.aphorism_id);
CREATE FULLTEXT INDEX atelier_word_fts FOR (w:Atelier_Word) ON EACH [w.word, w.pie_root];
CREATE FULLTEXT INDEX atelier_aphorism_fts FOR (a:Atelier_Aphorism) ON EACH [a.text];
```

**Traversal examples** — these are ordinary Cypher, no recursive CTE needed:

```cypher
// All words within 2 hops of a target word in a constellation
MATCH (start:Atelier_Word { word: $starter })
MATCH (start)-[:PATTERNS_WITH*1..2 { constellation_id: $constellation }]-(neighbour:Atelier_Word)
RETURN DISTINCT neighbour.word

// All Bimba coordinates that resonate with the user's aphorisms
MATCH (a:Atelier_Aphorism)-[r:RESONATES_WITH]->(b:Bimba)
RETURN b.id, count(a) AS resonance_count, avg(r.similarity) AS avg_similarity
ORDER BY resonance_count DESC, avg_similarity DESC

// Etymological derivation chain for a constellation
MATCH (c:Atelier_Constellation { constellation_id: $cid })
MATCH (w:Atelier_Word)-[:MEMBER_OF]->(c)
OPTIONAL MATCH (w)-[:DERIVES_FROM]->(g:Gnostic)
RETURN w.word, collect(g.source_id) AS sources
```

**Cross-namespace integrity.** Because everything lives in one Neo4j instance, there is no foreign-key drift, no cache invalidation problem, no opaque ID strings. An `[:RESONATES_WITH]` edge from `:Atelier_Aphorism` to `:Bimba` is an actual graph edge — atomic, traversable, and indexable.

##### Sophii's toolset (typed Tauri commands, Cypher-backed)

All Atelier mutations are Cypher writes to the canonical Neo4j (in the `:Atelier_*` namespace). Cross-namespace queries against `:Bimba` and `:Gnostic` are ordinary Cypher — no separate service to consult, no opaque foreign keys.

```rust
#[tauri::command]
pub async fn atelier_session_start(state: State<'_, AppState>) -> Result<AtelierSession, AppError>;
// CREATE (:Atelier_Session); returns ULID session_id with current_ql_pos = 0

#[tauri::command]
pub async fn atelier_add_word(
    session_id: String,
    word: String,                            // canonical-cased
    state: State<'_, AppState>,
) -> Result<WordNode, AppError>;
// MERGE (w:Atelier_Word { word: $word }) — single-node ecology

#[tauri::command]
pub async fn atelier_dialogue_turn(
    session_id: String,
    user_message: String,
    ql_hint: Option<u8>,
    state: State<'_, AppState>,
) -> Result<AgentRunHandle, AppError>; // streams Sophii response via agent:run:{id}

#[tauri::command]
pub async fn atelier_set_register(
    constellation_id: String,
    word_a: String,
    word_b: String,
    register: Register,                      // Constitutional | Situational
    confidence: Confidence,                  // Certain | Probable | Speculative
    cited_source: Option<String>,
    notes: Option<String>,
    state: State<'_, AppState>,
) -> Result<EdgeRecord, AppError>;
// MERGE (a)-[r:PATTERNS_WITH { constellation_id }]->(b)  with the supplied properties

#[tauri::command]
pub async fn atelier_set_ql_position(
    constellation_id: String,
    word: String,
    ordinal: u8,
    ql_position: u8,
    essence: String,
    state: State<'_, AppState>,
) -> Result<(), AppError>;
// MERGE (w)-[m:MEMBER_OF]->(c) SET m.ordinal=$ordinal, m.ql_position=$ql_position, m.essence=$essence

#[tauri::command]
pub async fn atelier_crystallize(
    session_id: String,
    constellation_name: String,
    fold: u8,
    geometry_class: GeometryClass,
    aphorism_text: String,
    aphorism_type: AphorismType,
    state: State<'_, AppState>,
) -> Result<CrystallizationResult, AppError>;
// Single Cypher transaction:
//  1. CREATE (:Atelier_Constellation { ... })
//  2. For each session word: MERGE (w)-[:MEMBER_OF]->(c) with collected ql_position+essence
//  3. CREATE (:Atelier_Aphorism { ... })-[:CRYSTALLISES]->(c)
//  4. For each word in aphorism: MATCH (w)…CREATE (a)-[:INCORPORATES]->(w)
//  5. Detected Möbius seeds: CREATE (a)-[:SEEDS { seed_text }]->()  (target null until territory started)
//  6. Detected Bimba resonance: MATCH (b:Bimba)… CREATE (a)-[:RESONATES_WITH { ... }]->(b)
//  7. SET session.status = 'crystallised'

#[tauri::command]
pub async fn atelier_query_constellation(
    constellation_id: String,
    state: State<'_, AppState>,
) -> Result<ConstellationDetail, AppError>;
// MATCH (c)<-[:MEMBER_OF]-(w), (a)-[:CRYSTALLISES]->(c), (a)-[r:RESONATES_WITH]->(b:Bimba)…

#[tauri::command]
pub async fn atelier_walk_from_word(
    word: String,
    constellation_id: Option<String>,        // None = walk across all user constellations
    max_depth: u32,
    state: State<'_, AppState>,
) -> Result<Vec<WalkPath>, AppError>;
// MATCH (start)-[:PATTERNS_WITH*1..$max_depth]-(neighbour) RETURN paths
```

**Sophii's tool calls** (used by the agent runtime to populate the `:Atelier_*` namespace, not by the renderer directly):

- `query_atelier_ecology` — reads user's existing words/constellations/aphorisms via Cypher; cross-constellation patterns surface naturally
- `semantic_search` — Neo4j fulltext index `atelier_word_fts` / `atelier_aphorism_fts` MATCH; "gap detection" finds words mentioned in flow files but not yet `MEMBER_OF` any constellation
- `etymology_analysis` — PIE reconstruction, root tracing, Gnostic source citation; writes back via `SET w.pie_root = ...` and creates `[:DERIVES_FROM]→:Gnostic` edges
- `ql_essence_analysis` — assigns QL position 0..5 via `atelier_set_ql_position`
- `mobius_seed_detection` — scans crystallised aphorism for adjacent territories; creates `[:SEEDS]` edges
- `bimba_resonance_detect` — direct Cypher pattern matching `:Atelier_Aphorism` against `:Bimba` via shared etymological roots and MEF-lens commentary; creates `[:RESONATES_WITH { detected_via: 'embedding' | 'manual' }]` edges
- `mef_lens_analysis` — applies the active MEF lens (a `:Bimba` node) to the crystallised constellation; creates `[:RESONATES_WITH { detected_via: 'mef_lens' }]` edges

##### Acceptance criteria (Atelier)

- Sophii first-token latency <500ms from `atelier_dialogue_turn`.
- Adding 3 words produces a constellation graph node-state within one frame.
- Setting register on an edge updates the visual style (solid ↔ dashed) within one frame.
- Crystallisation refuses if the dialogue has not yet reached `dia-logos` (#2) — Sophii prompts: *"Let's first see how these words relate before we crystallise an aphorism."*
- Detected `mobius_seeds` populate a "next session" panel in the right rail with the seed words highlighted.
- Closing the Atelier and reopening preserves the session via Neo4j persistence.

#### M5-0' Library — Geometric Folio (full sub-spec)

The Library is the operator's **curated knowledge hub** — the *Möbius End* where Atelier excavations and other crystallisations come to rest, and the *Möbius Start* from which next inquiry sets out. **The operator decides what enters the Library.** Library entries are operator-curated, not auto-deposited by background processes.

The Library is also a **pedagogical surface**: the operator reads back through the canonical corpus (the `:Gnostic` namespace — system-curated essays, Bimba seed/world docs, MEF lens commentaries) and through their own crystallised work, with **RAG-Anything** providing retrieval over that corpus. Reading is the pedagogy; the Library is where it happens. Coordinate-aware retrieval surfaces material relevant to a selected Bimba coordinate; Möbius-seed-aware retrieval surfaces material relevant to where the operator is mid-exploration.

The retrieval substrate is exactly four pieces, all already established in Part III.5:

- **The canonical Neo4j graph** (`:Bimba`, `:Gnostic`, `:Atelier_*` together) — direct Cypher queries for coordinate-anchored navigation, cross-namespace traversal, and structural inspection
- **RAG-Anything** — multimodal retrieval over the `:Gnostic` namespace and the vault corpus (replaces what earlier drafts called LightRAG)
- **Graphiti** — episodic memory queries (the operator's own past sessions on adjacent topics) when explicitly requested
- **The vault** — markdown source for any Library item; reading material lives there

There is no dual-mode UX. There is no autoresearch loop writing into the Library. There is no Notion bidirectional sync. The Library is the operator's curated reading room.

##### The Möbius cycle (Library's role in the loop)

The Library is the **personal knowledge hub** where every Atelier excavation is crystallised, organised, and recursively accessed. It is the **Möbius End** of the cycle — and it is also the **starting ground** for the next Atelier session via Möbius seed detection. The folio organises knowledge in nested recursive topology (genus-1 surface conceptually; visualised as a recursive tree + ecology graph).

##### Conceptual structure

```
Library (Root — Möbius End)
├── Personal Constellations
│   ├── "Ship of Relations" (#6-fold)
│   │   ├── Words: MASK, MIST, MUST, LUST, MUSE, SHIP
│   │   ├── Aphorisms: "MUST and LUST both sail the same SHIP"
│   │   └── Möbius Seeds: [CAPTAIN, CREW, SAIL] → next exploration
│   ├── "Heart-House" (#6-fold)
│   └── "Quiet-Quid-Code" (#5-fold)
│
├── Aphorism Gallery
│   ├── Chronological view (newest first)
│   ├── Thematic view (grouped by source constellation)
│   └── Type filter: proper | poetic | symbolic | question-seed | definition
│
├── Cross-Constellation Map (the unified ecology)
│   ├── Single-Node Ecology graph (HEART visible across multiple constellations)
│   ├── Gap Detection ("you've explored HEART but not CARDIAC")
│   └── Semantic Resonances (auto-detected thematic clusters)
│
├── Projects (curated collections)
│   ├── "Recovery"
│   └── "Cosmic Roots"
│
└── Published Artifacts (opt-in)
    ├── Public Constellations (forks, discussions)
    ├── Public Aphorisms (with attribution)
    └── Shared Projects (collaborative)
```

##### Layout

```
┌───────────────────────────────────────────────────────────────────┐
│ [All Constellations] [Aphorism Gallery] [Ecology] [Projects] [Pub]│
├──────────────────┬────────────────────────────────────────────────┤
│ Recursive tree   │ Detail pane (selection-driven)                 │
│                  │                                                │
│ 🔍 [_______]     │ Selected: "Ship of Relations"                  │
│ Filter ▼         │                                                │
│                  │ ┌─────────────────────────────────────────┐    │
│ 📍 Constella.    │ │  [Constellation graph — embedded        │    │
│  ├ 🌊 Ship of    │ │   geometric folio per Part VII.0]       │    │
│  │  Relations    │ │   MUST ───── LUST                       │    │
│  │  ├ MUST       │ │    │ const     │ situ                   │    │
│  │  ├ LUST       │ │   MASK   ─   MUSE                       │    │
│  │  ├ Aph: …     │ │  hex/twin-hex/triadic geometry          │    │
│  │  └ 🔄 Seeds:  │ └─────────────────────────────────────────┘    │
│  │   CAPTAIN,    │                                                │
│  │   CREW, SAIL  │ Etymology summary: [PIE traces per word]       │
│  │               │ Register: 4 constitutional, 2 situational      │
│  ├ ❤ Heart-House │                                                │
│  └ + New const.  │ Aphorisms (1):                                 │
│                  │  • "MUST and LUST both sail the same SHIP"     │
│ 📚 Aphorisms     │    Incorporates: MUST, LUST, SHIP              │
│  └ All (12)      │    🔄 Möbius seeds: CAPTAIN, CREW, SAIL        │
│                  │    [Open in Atelier as next session]           │
│ 🎯 Projects      │                                                │
│  ├ Recovery      │ Actions:                                       │
│  └ Cosmic Roots  │  [Edit] [Publish] [Share] [Export] [Delete]    │
│                  │                                                │
│ 🌐 Published     │ ─────────────────────────────────────────────  │
│  └ (filtered)    │ Cross-constellation insights:                  │
│                  │  HEART appears in: Heart-House, Recovery       │
│                  │  Gap: SHIP unexplored alone                    │
└──────────────────┴────────────────────────────────────────────────┘
```

##### Five primary views

**1. All Constellations (recursive tree)** — expandable hierarchy. Each constellation shows fold, word count, aphorism count, register summary, Möbius seeds, visibility. Click → expand to words/aphorisms/relationships. Single-node awareness: a word appearing in multiple constellations shows cross-references inline.

**2. Aphorism Gallery** — chronological / thematic / type-filtered. Each card shows text, source constellation, source words, detected Möbius seeds, type, date. Click → opens detail with INCORPORATES traceback. **Möbius action**: every aphorism has an "Open in Atelier as next session" button that pre-seeds an Atelier session with the Möbius seed territories.

**3. Cross-Constellation Map (Ecology view)** — full ecology graph using the same `<BimbaMap2D>` (or 3D variant) as the M0/M1 surfaces, but coloured by **constellation membership** rather than QL position. Single-node duplicates highlight strongly. Two side panels:
- **Gap Detection**: words used but never explored alone; cross-constellation resonances unlinked.
- **Semantic Resonances**: auto-detected thematic clusters via embedding similarity.

**4. Projects** — user-curated groupings. Each project card shows name, description, included constellations, collaboration status, word + aphorism counts. Actions: Add/Remove constellation, Rename, Share, Publish, Export.

**5. Published Artifacts** — discoverable constellations and aphorisms (opt-in). Shows author, fork count, discussion threads. Social actions: Fork, Discuss, Share to channel.

##### Tauri commands

```rust
#[tauri::command]
pub async fn library_list_constellations(
    user_id_hash: String,
    filter: ConstellationFilter,
    state: State<'_, AppState>,
) -> Result<Vec<ConstellationSummary>, AppError>;

#[tauri::command]
pub async fn library_get_constellation(
    constellation_id: String,
    state: State<'_, AppState>,
) -> Result<ConstellationDetail, AppError>;

#[tauri::command]
pub async fn library_list_aphorisms(
    user_id_hash: String,
    filter: AphorismFilter,        // by date, type, constellation, has_mobius_seeds
    state: State<'_, AppState>,
) -> Result<Vec<AphorismSummary>, AppError>;

#[tauri::command]
pub async fn library_ecology_view(
    user_id_hash: String,
    state: State<'_, AppState>,
) -> Result<EcologyGraph, AppError>; // returns nodes/edges with constellation_membership[]

#[tauri::command]
pub async fn library_gap_detection(
    user_id_hash: String,
    state: State<'_, AppState>,
) -> Result<Vec<GapInsight>, AppError>;

#[tauri::command]
pub async fn library_open_mobius(
    aphorism_id: String,
    state: State<'_, AppState>,
) -> Result<AtelierSession, AppError>; // seeds next Atelier session with Möbius seeds

#[tauri::command]
pub async fn library_project_create(
    user_id_hash: String,
    name: String,
    description: String,
    state: State<'_, AppState>,
) -> Result<Project, AppError>;

#[tauri::command]
pub async fn library_publish(
    artifact_kind: ArtifactKind,    // Constellation | Aphorism | Project
    artifact_id: String,
    visibility: Visibility,
    state: State<'_, AppState>,
) -> Result<(), AppError>;
```

##### Retrieval — Cypher, RAG-Anything, Graphiti, vault

The Library's `epiiClient.library.*` namespace exposes four kinds of read:

```rust
// src-tauri/src/library/retrieval.rs

#[derive(Serialize, Deserialize)]
pub struct LibraryRetrievalRequest {
    pub query: String,                        // natural-language query
    pub coordinate: Option<String>,           // optional Bimba coordinate anchor (e.g. "M5-2-1.4")
    pub kind: LibraryRetrievalKind,
    pub limit: u32,                           // default 20
}

#[derive(Serialize, Deserialize)]
pub enum LibraryRetrievalKind {
    /// Direct Cypher against the canonical Neo4j (Bimba/Gnostic/Atelier in one query
    /// when needed via cross-namespace traversal).
    Cypher { cypher: String, params: serde_json::Value },

    /// Coordinate-anchored: start from a Bimba coordinate, walk outward over the
    /// canonical graph, surface :Gnostic / :Gnostic / :Atelier_Aphorism
    /// nodes connected via [:EXPRESSED_IN], [:EXPRESSES], [:RESONATES_WITH].
    CoordinateAnchored,

    /// RAG-Anything retrieval over the :Gnostic_* namespace + vault corpus.
    RagAnything,

    /// Graphiti episodic — operator's past sessions on this topic; opt-in,
    /// operator chooses to include their lived history in the read.
    Episodic { filters: GraphitiFilters },
}

#[derive(Serialize, Deserialize)]
pub struct LibraryRetrievalResult {
    pub items: Vec<LibraryItem>,
}

#[derive(Serialize, Deserialize)]
pub struct LibraryItem {
    pub item_id: String,
    pub title: String,
    pub summary: String,
    pub body_path: Option<String>,            // vault path if applicable
    pub bimba_ref: Option<String>,            // anchor coordinate when known
    pub kind: LibraryItemKind,                // GnosticSource | GnosticEssay | AtelierAphorism | Episode
    pub similarity: Option<f32>,
    pub mobius_seeds: Vec<String>,             // adjacent territories detected for Atelier items
}
```

##### RAG-Anything integration (the canonical retrieval over corpus)

RAG-Anything is the canonical retrieval engine over the `:Gnostic` namespace and the corresponding markdown corpus in the vault. It replaces what earlier drafts called LightRAG; treat any prior LightRAG mention in source-of-truth specs as superseded by RAG-Anything for this build.

```rust
pub async fn rag_anything_query(
    query: &str,
    coordinate_anchor: Option<&str>,          // restrict to neighbourhood of a Bimba coordinate
    limit: u32,
) -> Result<Vec<RagItem>, AppError>;

pub async fn rag_anything_ingest(
    path: &Path,
    bimba_anchor: Option<&str>,
) -> Result<IngestResult, AppError>;
```

The corpus is populated by:

- All canonical wisdom packets from `Idea/Bimba/World/` (auto-ingested on startup; re-ingested on `vault:changed`)
- All Bimba seed/map docs from `Idea/Bimba/Seeds/` and `Idea/Bimba/Map/`
- Operator-curated Library entries (when the operator promotes an Atelier aphorism, a flow excerpt, or another vault file into the Library, it is RAG-Anything-ingested with a Bimba anchor)
- External pedagogical texts the operator imports via OmniPanel Settings → Library Corpus → Import

##### Graphiti integration (opt-in episodic recall)

Graphiti runs on its own port (37778). The Library queries it only when the operator explicitly asks to bring lived experience into the read — for example, "show me Library material on courage *plus* my past sessions on this":

```rust
pub async fn graphiti_episodic_search(
    query: &str,
    filters: GraphitiFilters,
) -> Result<Vec<Episode>, AppError>;

#[derive(Serialize, Deserialize)]
pub struct GraphitiFilters {
    pub ql_position: Option<String>,
    pub cpf: Option<CpfType>,
    pub sun_decan: Option<String>,
    pub tick12: Option<u8>,
    pub arc_id: Option<String>,
    pub arc_type: Option<String>,
    pub date_range: Option<(u64, u64)>,
}
```

##### Curation — the operator decides what enters the Library

A vault file or Atelier aphorism only becomes a Library entry when the operator explicitly promotes it. There is no background ingestion that auto-files content into the Library based on agent activity. The Library is the operator's curated reading room.

```rust
#[tauri::command]
pub async fn library_curate_promote(
    artifact_kind: ArtifactKind,              // VaultFile | AtelierAphorism | AtelierConstellation
    artifact_id: String,                      // path or id
    bimba_anchor: Option<String>,
    state: State<'_, AppState>,
) -> Result<LibraryEntry, AppError>;
// Promotes the artifact into the Library: indexes via RAG-Anything,
// creates a :Library_Entry node in the canonical Neo4j with edges back to source.

#[tauri::command]
pub async fn library_curate_demote(entry_id: String, state: State<'_, AppState>) -> Result<(), AppError>;
// Removes from the Library (un-indexes from RAG-Anything; removes the :Library_Entry node).
```

##### Notion (write-only, on operator demand)

The single Notion command is `epii_crystallize_to_notion` (defined in M5-4'). It writes one artifact to Notion when the operator runs it. There is no scheduled sync, no read-back, no auto-ingest of Notion changes. Notion is a publication target, not a synchronisation peer.

##### Acceptance criteria (Library)

- Library tree loads within 1s with 50 constellations.
- Selecting an aphorism's "Open in Atelier" button launches a fresh Atelier session pre-seeded with the Möbius seed words.
- Ecology view renders all words across all constellations in one graph; single-node duplicates are visually distinct.
- Gap Detection panel shows at least three insights for any user with > 5 constellations.
- Publishing an aphorism (visibility: public) makes it discoverable in the Published Artifacts view.
- A `Cypher`-kind retrieval against the canonical Neo4j returns the queried nodes.
- A `RagAnything`-kind retrieval over the corpus returns items with `kind: GnosticSource` / `GnosticEssay`, ordered by similarity.
- A `CoordinateAnchored` retrieval rooted at a Bimba coordinate returns adjacent `:Gnostic` items + any `:Atelier_Aphorism` with `[:RESONATES_WITH]` edges to that coordinate.
- An `Episodic` retrieval (operator-opted-in) returns Graphiti episodes filtered per the requested CPF/QL/decan/tick filters.
- Operator promoting a vault file to the Library indexes it via RAG-Anything and creates a `:Library_Entry` node; demoting reverses both.

#### The Möbius cycle (binding M5-5' ↔ M5-0')

The Atelier and Library form the canonical Möbius loop of the system:

```
   ┌──────────────── Atelier (M5-5') ────────────────┐
   │  Excavation: 6-position Logos Cycle             │
   │  Sophii dialogue + constellation crystallisation │
   └───────────────────┬──────────────────────────────┘
                       │
                       ▼ (aphorism + Möbius seeds)
   ┌─────────────────────────────────────────────────┐
   │            Library (M5-0')                       │
   │  Crystallisation surface — recursive folio       │
   │  Aphorism Gallery shows seeds → next territories │
   └───────────────────┬──────────────────────────────┘
                       │
                       ▼ ("Open in Atelier as next session")
   ┌─────────────────────────────────────────────────┐
   │   Next Atelier session (new ground)              │
   │   Pre-seeded with Möbius seed words              │
   │   ⟲ cycle continues                             │
   └──────────────────────────────────────────────────┘
```

The cycle is **non-orientable**: synthesis at #5 of one cycle becomes ground at #0 of the next. The geometry framework's `KleinBottle` class (§7.0.5) is the right canonical embedding for this when the operator wishes to visualise the cycle directly.

#### M5-4' Siva-Shakti Integration / Epii Mode (full sub-spec) ★

The 5/0 Domain. Where Notion (Pratibimba reflection) and Neo4j (Bimba original) dance in unity. Four sub-systems coexist on this surface:

##### 1. Bimba Update System (sacred operations)

Global change tracking across coordinate selections. The operator can select multiple coordinates, queue property changes, then **review all queued changes in a Sacred Review Modal** before they apply. Modal shows: per-coordinate diffs (old → new), affected relationships, and an explicit "Apply" or "Reject" gate. Updates are precise — only modified properties hit Neo4j, never whole-node rewrites. Multi-coordinate transactions are atomic.

```rust
#[tauri::command]
pub async fn bimba_queue_change(
    coordinate: String,
    property: String,
    new_value: serde_json::Value,
    state: State<'_, AppState>,
) -> Result<QueuedChange, AppError>;

#[tauri::command]
pub async fn bimba_review_queue(
    state: State<'_, AppState>,
) -> Result<Vec<QueuedChange>, AppError>;

#[tauri::command]
pub async fn bimba_apply_queue(
    state: State<'_, AppState>,
) -> Result<BimbaUpdateResult, AppError>; // atomic Cypher transaction over the canonical Neo4j

#[tauri::command]
pub async fn bimba_reject_change(
    change_id: String,
    state: State<'_, AppState>,
) -> Result<(), AppError>;
```

##### 2. AG-UI Integration (real-time agent ↔ UI)

A direct WebSocket-style channel for skill ↔ UI communication during agent runs. Skills can:
- Push real-time progress reports during execution.
- Auto-populate form fields in the renderer ("suggestion application").
- Bulk-delete suggestions with state persistence.

Implementation: Tauri events under `ag_ui:*` channel. Skills emit on the gateway side; backend forwards as Tauri events; renderer subscribes per active surface.

```typescript
// renderer subscribes
listen<AgUiEvent>('ag_ui:suggestion', (e) => applyToForm(e.payload));
listen<AgUiEvent>('ag_ui:progress', (e) => updateProgressBar(e.payload));
```

##### 3. Notion Crystallisation Pipeline

Each constellation, aphorism, or document becomes a "crystal" in Notion. The pipeline:
1. Document analysis (parse, extract structure)
2. Payload preparation (constellation name, words, QL positions, aphorisms, etymology sources)
3. Coordinate resolution (which Bimba nodes link to which Notion blocks?)
4. Structured content transformation (markdown → Notion blocks)
5. Review overlay (operator approves before sync)
6. One-way sync to Notion + back-link in Neo4j

```rust
#[tauri::command]
pub async fn epii_crystallize_to_notion(
    artifact_kind: ArtifactKind,
    artifact_id: String,
    state: State<'_, AppState>,
) -> Result<NotionCrystal, AppError>;

#[tauri::command]
pub async fn epii_review_crystal(
    crystal_id: String,
    decision: CrystalDecision,
    state: State<'_, AppState>,
) -> Result<(), AppError>;
```

##### 4. VAK execution surface

The dedicated VAK page per Part XII Wave 5 brief — the same agent control room previously specified, now anchored here as M5-4'. The full VAK / routing / payload / execution / inbox panels render in this stratum. Aletheia is a **mode** of Anima (radio button), not a peer agent.

##### 5. Deep Crystallisation Search (planned, v1+ extension)

Integration of advanced search (Perplexity-style or DeepResearch) against the crystallised Notion corpus. Allows querying for deep reports on specific coordinates. Stub command exists in v1; full integration is follow-up.

##### Acceptance criteria (M5-4')

- Sacred Review Modal must show all queued changes before applying — no silent writes.
- AG-UI `ag_ui:suggestion` events populate the right form field within one frame.
- Notion crystallisation produces a structured Notion page with all source words + aphorism + provenance back-link.
- VAK execution streams live tool events with <500ms lag.

#### M5-2' Siva Layer additions — MEF lens registry ★

The MEF (Meta-Epistemic Framework) is the **six-lens kaleidoscope** that operates as a first-class registry on this surface AND drives M2-1' Meta-Logikon's lens analysis.

| Lens | Name | Operation |
|---|---|---|
| L0 | Archetypal-Numerical | Void / foundational structures; what number-form does this carry? |
| L1 | Causal Framework | *quid?* — material causes; what is it made of? |
| L2 | Logical Tetralemma | dialectical movement, paradox; affirmation/negation/both/neither |
| L3 | Processual Framework | organic unfolding, formal causes; how does it become? |
| L4 | Meta-Epistemic | reflexive knowing, context; how do we know we know? |
| L5 | Divine-Scalar | emanation/return, non-duality; the integrative scale |

The active branch lens (`active_branch_lens` field of `PortalClockState` per Part IV) is one of these six. M5-2' shows the registry, the active lens, lens history (which casts have been done in which lenses), and per-lens commentary on the current selected coordinate.

#### M5' workspace acceptance criteria (overall)

- M5-0' library tree loads within 1s of mount.
- M5-5' Atelier "Crystallise" refuses unless dialogue has reached dia-logos position.
- Möbius cycle: clicking "Open in Atelier" on an aphorism in the Library produces a new Atelier session with the seed words pre-loaded.
- M5-4' VAK execution streams live tool events with <500ms lag from gateway events.
- M5-4' Bimba Update System Sacred Review Modal opens before any Neo4j write.
- M5-2' MEF lens registry reflects `active_branch_lens` from PortalClockState live.
- M5-3' Shakti Layer renders the operator's drafted feature seeds with QL position and branch-lens marks; saves persist to the vault.

---

## Part VIII — OmniPanel `/` (the command centre)

OmniPanel is the desktop `/` surface. It is summoned with ESC; it overlays from the right edge with a translucent backdrop. Internally it preserves the existing 14-panel structure exactly.

### 8.1 Panel registry

```typescript
// src/components/omni/registry.ts
export const PRIMARY_PANELS = [
  { id: 'chat',       label: 'Chat' },
  { id: 'workspace',  label: 'Workspace' },
  { id: 'overview',   label: 'Overview' },
  { id: 'channels',   label: 'Channels' },
  { id: 'sessions',   label: 'Sessions' },
] as const;

export const ADVANCED_PANELS = [
  { id: 'config',     label: 'Config' },
  { id: 'instances',  label: 'Instances' },
  { id: 'nodes',      label: 'Nodes' },
  { id: 'debug',      label: 'Debug' },
  { id: 'logs',       label: 'Logs' },
] as const;

// Workspace sub-tabs
export const WORKSPACE_SECTIONS = [
  { id: 'cron',     label: 'Cron' },
  { id: 'models',   label: 'Models' },
  { id: 'skills',   label: 'Skills' },
  { id: 'settings', label: 'Settings' },
] as const;
```

### 8.2 Panel-to-method binding map

This is the canonical contract. Every panel uses *only* these gateway methods (via `gatewayClient`).

| Panel | Gateway methods used | Store actions |
|---|---|---|
| Chat | `chat.history`, `chat.send`, `chat.abort`, `sessions.patch`, `sessions.list`; events: `chat`, `chat.delta`, `chat.final`, `chat.error`, `chat.aborted`, `agent` | `setSessionKey`, `setChatDraft`, `sendMessage`, `abortChat`, `loadChatHistory`, `removeQueuedChatMessage` |
| Overview | (none directly; triggers downstream loaders) | `loadSessions`, `loadChannels`, `loadSkills`, `loadCronJobs`, `loadPresence`, `loadDebugStatus`, `loadLogs`, `loadNodes`, `loadDevices` |
| Sessions | `sessions.list`, `sessions.patch`, `sessions.delete`, `sessions.resolve`, `sessions.preview`, `sessions.reset`, `sessions.compact`, `sessions.fork`, `sessions.resume`, `sessions.import`, `sessions.tree` | `loadSessions`, `patchSession`, `deleteSession`, `resetSession`, `compactSession`, `forkSession`, `resumeSession`, `importSession` |
| Channels | `channels.status`, `web.login.start`, `web.login.wait`, `channels.logout`, `config.get`, `config.set`, `config.apply`; events: `channels.updated` | `loadChannels`, `startWhatsAppLogin`, `waitWhatsAppLogin`, `logoutWhatsApp` |
| Instances (Presence) | `presence.list` | `loadPresence` |
| Workspace | (delegates to sub-panels) | (delegates) |
| Cron | `cron.status`, `cron.list`, `cron.add`, `cron.update`, `cron.run`, `cron.remove`, `cron.runs`; events: `cron.job.updated`, `cron.job.executed` | `loadCronJobs`, `toggleCronJob`, `addCronJob`, `runCronJob`, `removeCronJob`, `loadCronRuns` |
| Skills | `skills.status`, `skills.update`, `skills.install`; events: `skills.updated` | `loadSkills`, `toggleSkill`, `setSkillEdit`, `saveSkillApiKey`, `installSkill` |
| Nodes | `device.pair.list`, `device.pair.approve`, `device.pair.reject`, `device.token.rotate`, `device.token.revoke`; events: `device.pair.requested`, `device.pair.resolved` | `loadNodes`, `loadDevices`, `approveDevicePairing`, `rejectDevicePairing`, `rotateDeviceToken`, `revokeDeviceToken` |
| Config | `config.get`, `config.schema`, `config.set`, `config.apply`, `update.run`; events: `config.updated`, `config.applied` | `loadConfig`, `loadConfigSchema`, `saveConfig`, `applyConfig`, `runUpdate`, `setConfigRaw`, `setConfigApplySessionKey`, `setConfigPanelMode`, `setConfigSearchQuery`, `setConfigActiveSection`, `setConfigActiveSubsection` |
| Debug | `status.summary`, `health.snapshot`, (arbitrary RPC) | `loadDebugStatus`, `loadDebugHealth`, `callDebugMethod` |
| Logs | `logs.tail` | `loadLogs` |
| Settings | (UI-only + connection management) | `setUiTheme`, `setChatFocusMode`, `setChatShowThinking`, `setChatSplitRatio`, `setNavCollapsed`, `setSkillsFilter`, `setGatewayUrl`, `setGatewayToken`, `setGatewayPassword`, `connect`, `disconnect` |
| Models | `config.get`, `config.set`, `config.apply`, `config.schema` (filtered to model section) | `loadConfig`, `saveConfig`, `applyConfig`, `setConfigRaw` |

### 8.3 `gatewayStore.ts` (replaces `epiClawGatewayStore`)

Same shape as the existing 1093-line Electron store, but each backend call goes through `gatewayClient` (Tauri invoke) rather than `window.sPrime.epiClaw`. Persistence still via `zustand/middleware/persist` to `localStorage`. The store's connection state machine, message queue, event handler dispatch, and session resolution helper all transfer unchanged.

### 8.4 Canonical session-key contract

The Tauri port **must not** propagate the `{ key }` vs `{ session, sessionKey }` drift identified in the audit. Every session-mutating call uses the exact field name `sessionKey: string` at the IPC boundary. The Rust side accepts only `session_key: String` (serde rename to camelCase or kebab-case as appropriate for the wire format consistently). The store helper `Controllers.ts` (preserved) is updated to use `sessionKey` everywhere.

### 8.5 Panel sub-spec deltas vs Electron

Most panels port intact. Specific deltas:

- **Chat** — adds tool-event verbose toggle controls a session-level flag (calls `sessions_patch` with `{ verboseLevel: 'on'|'off' }`). Already implemented in Electron; preserved.
- **Channels** — WhatsApp QR rendering: `web_login_wait` returns a QR data URL; the panel renders it in an `<img>` tag. The existing placeholder for QR rendering becomes real.
- **Skills** — preserves the existing skills surface (status / update / install / API key edit). Marketplace browser sub-tab is out of scope for v1 of the port (the existing manual install via name+installId form is sufficient and matches current gateway capabilities).
- **Cron** — adds a cron-expression validator helper using a Rust crate (`cron` 0.13) exposed via `gateway_request("cron.validate", { expr })` — fallback to client-side parsing if gateway doesn't expose it.
- **Config** — structured-mode form builder uses the JSON schema; renders as collapsible sections per top-level key.
- **Debug** — RPC method auto-complete: hello.features.methods (when gateway returns it) populates the dropdown.
- **Logs** — adds live streaming via `gateway:event:logs` subscription (if gateway supports it; otherwise polling).

---

## Part IX — Configuration and persistence

### 9.1 Settings file

Persisted JSON at `~/.epi-logos/settings.json` (overridable via `EPI_SETTINGS_PATH`):

```json
{
  "gatewayUrl": "ws://127.0.0.1:18794",
  "gatewayToken": null,
  "neo4jUrl": "bolt://127.0.0.1:7687",
  "neo4jUser": "neo4j",
  "vault": {
    "ideaRoot": "~/Documents/Epi-Logos C Experiments/Idea",
    "presentRoot": "~/Documents/Epi-Logos C Experiments/Idea/Empty/Present"
  },
  "spacetime": {
    "mode": "polling",
    "url": "ws://127.0.0.1:3000/v1",
    "pollMs": 1000
  },
  "ui": {
    "theme": "system",
    "chatFocusMode": false,
    "chatShowThinking": true,
    "chatSplitRatio": 0.55,
    "navCollapsed": false
  },
  "natal": null,
  "branchLens": 0
}
```

### 9.2 Window state

Tauri's `window-state` plugin persists size/position/maximized/devtools-open across runs to `~/.epi-logos/window-state.json`.

### 9.3 Renderer persistence

Zustand stores use `persist` middleware to localStorage with a custom storage adapter that writes through Tauri to `~/.epi-logos/store/{storeName}.json` for portability and inspectability. Stores:

- `gatewayStore` — connection config, session preferences, UI flags
- `domainStore` — last active domain + stratum
- `themeStore` — theme selection
- `flowStore`, `highlightsStore`, `editorStore`, `observabilityStore` — runtime state, not always persisted

---

## Part X — Testing contract

The full testing contract from `M'-TAURI-PORT-SPEC` is reproduced and extended. The port is not complete until **every** test below passes.

### 10.1 Backend (Rust integration)

Run with `cargo test --manifest-path src-tauri/Cargo.toml -- --test-threads=1`:

- `gateway_handshake_against_real_gateway` — boots a real gateway-compatible test harness on a free port; verifies connect handshake, hello, subscribe, RPC roundtrip, gap detection.
- `gateway_session_canonical_key_contract` — verifies sessions.patch and sessions.delete accept `session_key` and reject `key`.
- `vault_today_note_resolution` — reads from a temp vault fixture; verifies `vault_get_today_note` returns the right path for both `YYYY-MM-DD/YYYY-MM-DD.md` and bare `YYYY-MM-DD.md` layouts.
- `vault_flow_versioning` — saves twice, asserts version 1 + 2 exist; gets version 1 returns the original.
- `vault_backlinks_scan` — fixture has `B.md` containing `[[A]]`; `vault_get_backlinks(A)` returns B with the line context.
- `graph_full_query` — boots an embedded Neo4j (or mocked driver via `mockito`); asserts `graph_get_graph` returns the seeded nodes.
- `clock_quaternion_from_oracle` — given known OracleFaces, asserts the resulting quaternion has unit magnitude and matches expected axis weights.
- `clock_tick12_quantization` — degree 359 → tick=11; degree 0 → tick=0; never returns a non-integer.
- `clock_oracle_cast_persists` — casting updates `last_cast` and `last_cast_timestamp`; subsequent `clock_get_state` returns the same values.
- `temporal_polling_hydration` — mocks the SpaceTimeDB SQL endpoint; asserts `temporal_get_runtime` returns hydrated state after one poll.
- `temporal_native_subscription` — mocks the SpaceTimeDB WebSocket; asserts emitted `temporal:runtime` events match feed deltas.
- `agent_invoke_envelope_typing` — invoke with a `nara_highlight` envelope; assert it emits the right event channel and run state transitions.
- `inbox_review_decision` — accept/reject decisions update the inbox item state and emit `inbox:updated`.
- `geometry_hex_position_canonical` — `calculate_hexagonal_position("#0")` returns `(1039.23, -600.0, 20.0)` ± 0.01; nested coordinate `"#2-3"` matches v0 reference.
- `geometry_class_detection` — fixture sub-graph with coordination 8 returns `GeometryClass::Octahedral` with non-zero confidence.
- `geometry_frontmatter_override` — node frontmatter `preferred_geometry: triangular3fold` takes precedence over detection.
- `atelier_crystallize_gating` — calling `atelier_crystallize` before any `dia-logos` (#2) dialogue turn returns an error with code `ATELIER_PREMATURE_CRYSTALLIZATION`.
- `atelier_register_persistence` — setting register Constitutional + Confidence Certain on a word pair persists; subsequent `library_get_constellation` returns the edge with the same fields.
- `library_mobius_open` — `library_open_mobius(aphorism_id)` produces a fresh `AtelierSession` whose `seed_words` field equals the aphorism's `mobius_seeds`.
- `library_ecology_single_node` — fixture with HEART in two constellations: `library_ecology_view` returns one HEART node with `constellation_membership: [c1, c2]`.
- `bimba_review_queue_atomic` — queue 3 changes; `bimba_apply_queue` either applies all or none; mid-failure rolls back.
- `mef_lens_registry_active` — setting `clock_set_branch_lens(lens=2)` then reading `mef_get_active_lens` returns `LogicalTetralemma`.
- `hopf_quaternion_composition_normalised` — composing `quintessence ⊗ transit ⊗ live` with arbitrary unit-input quaternions yields a unit-magnitude `composed_quaternion` (||q|| − 1.0 < 1e-6).
- `hopf_lift_singularity_guard` — when `composed_quaternion` would project to within ε of S² south pole, backend nudges and emits `clock:nudge`; resulting `orbital_position` is finite (no NaN/inf).
- `hopf_linking_number` — given two distinct unit quaternions `q1, q2` with `h(q1) ≠ h(q2)`, the projected fibres in R³ have linking number ±1 (verified by Gauss-integral approximation in the test).
- `hopf_stereographic_correctness` — `π(σ⁻¹(v)) = v` for sample points in R³ (round-trip identity).
- `pratibimba_anchor_blake3` — `pratibimba_init` produces `session_hash = BLAKE3(quintessence_hash || session_start_u64)` matching expected reference vectors.
- `clock_presence_publish_subscribe` — backend A publishes presence; backend B (subscriber) receives `temporal:clock_presence` event with the same `composed_quaternion` bytes within 100ms.
- `clock_walk_mode_oracle_effect` — in `FIBER` walk mode, an oracle cast inverts the current degree by exactly 180°.
- `vault_now_folder_creation` — opening the app on a new day creates `Idea/Empty/Present/{today}/` with the daily note populated from the canonical template and full QL frontmatter.
- `vault_flow_cas_guard` — saving with stale `expected_version` returns `ConcurrentEdit` with a non-empty `conflict_diff`.
- `vault_flow_versioning` — saving twice with word-count delta > 50 produces `FLOW-...-v1.md`; with delta < 50 only updates the current.
- `highlight_registry_persistence` — registering a custom category, restarting the backend, listing categories returns the custom one.
- `highlight_envelope_typed` — clicking "Oracle" on a flow highlight produces an `InvocationEnvelope` (no slash string anywhere in the agent run record).
- `tarot_cast_determinism` — same composed_quaternion + same spread + same timestamp → identical drawn cards.
- `iching_cast_three_coin` — cast produces a six-line hexagram + changing-lines mask + temporal hexagram with mask applied (verifiable for known seeds).
- `oracle_episode_created` — a recorded cast creates a `:Pratibimba:Episodic` node with `arc_type: oracle:{cast_uuid}`, `[:HAS_EPISODE]` edge from PersonalNexus, and the full cast payload as episode content; the Oracle Log filtered query returns it.
- `atelier_single_node_ecology_cypher` — `MERGE`ing the same word twice across two constellations leaves one `:Atelier_Word` node and two `[:MEMBER_OF]` relationships.
- `atelier_cross_namespace_resonance` — creating a `[:RESONATES_WITH]` edge from `:Atelier_Aphorism` to `:Bimba` is atomic; both endpoints traversable from the other in one hop.
- `library_cypher_retrieval` — a `Cypher`-kind retrieval against the canonical Neo4j returns the queried nodes correctly.
- `library_rag_anything_retrieval` — a `RagAnything`-kind retrieval over the corpus returns items with `kind: GnosticSource` / `GnosticEssay`, ordered by similarity.
- `library_coordinate_anchored_retrieval` — `CoordinateAnchored` retrieval rooted at a Bimba coordinate returns adjacent `:Gnostic` items + any `:Atelier_Aphorism` with `[:RESONATES_WITH]` edges to that coordinate.
- `library_episodic_filter` — `Episodic` retrieval with `cpf: CF_MOBIUS` returns only synthesis-tagged episodes from the test fixture.
- `library_curate_round_trip` — `library_curate_promote` indexes via RAG-Anything and creates a `:Library_Entry` node; `library_curate_demote` reverses both.

### 10.2 Renderer (Vitest unit + Testing Library)

- `gatewayClient.ts` — every method is a thin invoke wrapper; mock invoke and verify args.
- `clockStore.ts` — hydrate sets state; subscribe updates on emitted events; oracleCast triggers re-hydrate.
- `naraClient.sendoff` — produces a typed `InvocationEnvelope` (not a slash string) for each modality.
- `M0_Anuttara/M0-3View` — clicking number 5 expands to "Quintessence" content; coordinate link routes to graph.
- `M3_Mahamaya/ChronosClock` — given mocked `clockStore.state`, renders 10 planet glyphs at correct degrees.
- `M5_Epii/Atelier` — adding 3 words and reaching `dia-logos` enables the Crystallize action; before that, action is disabled.
- `M5_Epii/Atelier` — register toggle on an edge changes line style from solid to dashed.
- `M5_Epii/Library` — clicking "Open in Atelier" on an aphorism with Möbius seeds navigates to Atelier with `atelierStore.session.seedWords` populated.
- `M5_Epii/EcologyView` — given fixture with HEART in two constellations, the ecology graph renders one HEART node with multi-constellation chip.
- `M0_Anuttara/BimbaMap2D` — node click selects coordinate; toggle "→ 3D" preserves selection when navigating to M1-5'.
- `M1_Paramasiva/BimbaMap3D` — four custom forces apply to the simulation (verifiable via `simulation.force(name)` returning a function).
- `M5_Epii/EpiiMode` — `bimba_apply_queue` requires the Sacred Review Modal to have been confirmed (renderer state flag).
- `M4_Nara/NaraEditor` — selecting text shows FloatingMenu; clicking Oracle calls `naraClient.sendoff` with `modality: 'oracle'`.

### 10.3 E2E (Playwright)

- `shell.spec.ts` — `Cmd+Opt+0` full-screens the left clock-cosmos; `Cmd+Opt+1` full-screens the right workspace; `ESC` toggles OmniPanel overlay; `Cmd+I` toggles info-pool slide-out; `Cmd+Shift+3` sets left-side emphasis to M3; `Cmd+Shift+4` switches right-side workspace to M4; selection on either side propagates to the info-pool.
- `omnipanel-parity.spec.ts` — for each of the 14 panels: open it, confirm it loads data via the right method, verify a state mutation hits the gateway.
- `nara-flow.spec.ts` — type into editor → auto-saves; select text → FloatingMenu → Oracle → sendoff envelope appears in pending list.
- `chronos-clock.spec.ts` — Cmd+Opt+T opens M3-5'; cast button updates indicators; walkabout → coordinate routes to M0-5'.
- `m0-bimba-map.spec.ts` — Cmd+0 default opens M0-5'; clicking a node populates inspector; wikilink resolves.

### 10.4 Spec-level acceptance

- The current Electron app's typecheck remains clean before and after each port step (no regression in `Body/S/S3/epi-app/`).
- The Tauri app builds for the dev platform with `pnpm tauri build` and produces a working binary.
- Cold-start time: under 1.5s from launch to first paint on the dev machine (M-series macOS).
- Memory: under 200MB resident for the renderer at idle; under 400MB with all major surfaces visited once.

---

## Part XI — Build, dev, run

### 11.1 Bootstrap

```bash
# From Body/S/S3/epi-tauri:
pnpm install
cargo build --manifest-path src-tauri/Cargo.toml

# Dev:
pnpm tauri dev

# Tests:
pnpm vitest run
cargo test --manifest-path src-tauri/Cargo.toml -- --test-threads=1
pnpm playwright test

# Production build:
pnpm tauri build
```

### 11.2 Dev workflow

`pnpm tauri dev` does two things in one process:
1. Starts Vite dev server on port 5173 (renderer).
2. Compiles `src-tauri` and launches the Tauri binary which loads the Vite dev URL.

Hot reload works on the renderer; Rust changes require a full Tauri restart (Tauri v2's hot-reload is RFC-stage).

### 11.3 Required services

For full functionality during development:
- **S3 gateway** (`epi gate up`) on port 18794
- **Neo4j** (Docker or Desktop) on port 7687
- **SpaceTimeDB** (`spacetime start`) on port 3000 — optional for first cut; polling mode works without
- **Vault** at `~/Documents/Epi-Logos C Experiments/Idea` (must exist)

If the gateway or Neo4j is down, the app starts and reports the disconnection in the bottom dock; surfaces gracefully degrade (M0-5' shows "graph unavailable", chat shows "gateway disconnected", clock falls back to local-only kairos).

---

## Part XII — Single-session implementation plan

### 12.1 Parallelisable task graph

The build decomposes into modules with explicit dependencies. The critical path is **Tauri scaffold → AppState + invoke wrapper → service-clients skeleton**. Once that exists, almost everything else fans out.

```
                    ┌──────────────────────────┐
                    │ T0  Scaffold workspace   │  ← critical path
                    │ (Cargo, Vite, tsconfig,  │
                    │  tauri.conf, capabilities)│
                    └────────────┬─────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │ T1  AppState + error +   │  ← critical path
                    │ event emission helpers   │
                    └────────────┬─────────────┘
                                 │
                                 │
        ┌──────────────┬─────────┼──────────┬─────────────┐
        │              │         │          │             │
   ┌────▼─────┐  ┌─────▼────┐  ┌─▼──────┐ ┌─▼─────┐ ┌─────▼─────┐
   │ T2 Vault │  │ T3 Graph │  │T4 Gtwy │ │T5 Clk │ │T6 Temporal│
   │ commands │  │ commands │  │connect │ │ state │ │ spacetime │
   │ + tests  │  │ + tests  │  │ + RPC  │ │ + qrt │ │ + tests   │
   └────┬─────┘  └─────┬────┘  │+ tests │ │ tests │ └─────┬─────┘
        │              │       └────┬───┘ └───┬───┘       │
        │              │            │         │           │
        └──────────────┴────────────┴─────────┴───────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │ T7 Service clients       │  (TS — all 6)
                    │ + types.ts + invoke      │
                    └────────────┬─────────────┘
                                 │
        ┌──────┬──────┬──────────┼──────────┬─────────┬───────┐
        │      │      │          │          │         │       │
   ┌────▼┐ ┌──▼──┐ ┌──▼──┐ ┌─────▼────┐ ┌───▼───┐ ┌───▼──┐ ┌──▼──┐
   │T8   │ │T9   │ │T10  │ │T11 Shell │ │T12 M0 │ │T13 M1│ │T14  │
   │Omni │ │Stores│ │Hot- │ │+ portal  │ │Anutta │ │Param │ │M2   │
   │Panel│ │     │ │keys │ │grammar   │ │ra+M0-5│ │ +M1-3│ │Cyma │
   └─────┘ └─────┘ └─────┘ └──────────┘ └───────┘ └──────┘ └─────┘
                                                               │
                          ┌───────────┬───────────┬────────────┴──┐
                          │           │           │                │
                       ┌──▼──┐    ┌───▼───┐   ┌───▼───┐       ┌────▼───┐
                       │T15  │    │T16    │   │T17    │       │T18     │
                       │M3   │    │M4 Nara│   │M5 Epii│       │Agents +│
                       │Clock│    │+M4-4' │   │+5-0   │       │Inbox + │
                       │     │    │       │   │+5-5'  │       │VAK exec│
                       └─────┘    └───────┘   └───────┘       └────────┘
                                       │
                              ┌────────┴────────┐
                              │ T19 E2E specs   │
                              │ T20 spec self-  │
                              │     review      │
                              └─────────────────┘
```

### 12.2 Subagent allocation

For a single-session build with parallel subagents, dispatch in waves:

**Wave 1 (sequential, ~30 min):**
- T0 Scaffold (one agent)
- T1 AppState + error + events (one agent, after T0)

**Wave 2 (parallel, ~90 min, 9 agents):**
- T2 Vault commands + canonical NOW folder structure + Daily Note auto-creation from canonical template + flow versioning with CAS guard + frontmatter validator + concurrency banner; tests
- T2.5 **Highlight registry + Tarot/I-Ching modules** — `vault/highlight_registry.rs` with canonical category bootstrap; `oracle/tarot.rs` with full 78-card RIDER_WAITE_DECK + spreads; `oracle/iching.rs` with KING_WEN_SEQUENCE + cast methods; deterministic cast-from-quaternion; tests for registry persistence and cast determinism
- T3 Graph commands + tests (incl. Neo4j wrapper)
- T3.5 **Bimba Geometry Framework** — `graph/geometry.rs` with `calculate_hexagonal_position`, `GeometryClass`, `SubGraphGeometry`, detection heuristic, override commands + tests
- T3.7 **Atelier as `:Atelier_*` Neo4j namespace** — Cypher migration creating node-label indexes + fulltext indexes (`atelier_word_fts`, `atelier_aphorism_fts`); `atelier/repo.rs` with all `MERGE`/`MATCH` write paths; cross-namespace `[:RESONATES_WITH]→:Bimba` and `[:DERIVES_FROM]→:Gnostic` edges; full unit tests including single-node-ecology and cross-namespace traversal
- T4 Gateway connect + RPC + tests
- T5 **PortalClockState** — port `clock_state.rs` from `Body/S/S0/epi-cli/src/portal/` with `OracleFaces`, `KairosState`, three-quaternion composition (`composed = quintessence ⊗ transit ⊗ live`), chakra derivation, walk-mode generators, tick12 quantisation, BLAKE3 session_hash; full unit tests
- T5.5 **Hopf substrate** — `clock/hopf.rs` with the spinor lift `q₀(p)`, fibre parametrisation, stereographic projection `π: S³→R³`, lift-singularity null-state guard, Bishop-frame computation; pratibimba_init for the M4.4.4.4 PersonalNexus anchor; SpaceTimeDB schema (`clock_presence`, `clock_aspect`, `kairos_surface`) + reducers; `clock_publish_presence` + `clock_subscribe_presence` Tauri commands; full unit tests including linking-number-1 verification
- T6 Temporal SpaceTimeDB plumbing (subscription client + polling fallback) + tests
- T6.5 **Library retrieval** — `library/rag_anything_client.rs` (HTTP client to RAG-Anything service), `library/graphiti_client.rs` (HTTP API for episodic search with QL/CPF filters), `library/cypher.rs` for direct Neo4j retrieval, `library/curate.rs` for promote/demote; tests with mocked services

**Wave 3 (sequential gate, ~20 min):**
- T7 Service clients TS + types.ts including `library*`, `atelier*`, `bimba*`, `ag_ui*`, `mef*` types (one agent, depends on T2–T6 + T3.5 signatures)

**Wave 4 (parallel, ~90 min, 8 agents):**
- T8 OmniPanel (14 panels)
- T9 Stores (gatewayStore + clockStore + atelierStore + libraryStore + others)
- T10 Hotkeys + command palette (incl. Cmd+Opt+A → Atelier, Cmd+Opt+L → Library, Cmd+Opt+T → Chronos clock)
- T11 Shell + 1:3 split layout (PortalShell, LeftSide integrated clock-cosmos, RightSide switchable workspace, OmniPanelOverlay, InfoPoolSlideOut); hotkey grammar per Part VI.3
- T12 M0 Anuttara — all 6 strata + **2D Bimba Explorer (Meta2D) at M0-5'** consuming the geometry framework
- T13 M1 Paramasiva — Spanda torus (M1-3') + **3D Bimba Explorer (Meta3D) at M1-5'** with the four custom forces and Topological Eye slice overlay
- T14 M2 Parashakti — Cymascope (M2-5') + MEF kaleidoscope (M2-1') consuming the lens registry from M5-2'
- T14.5 **2D ↔ 3D Bimba toggle plumbing** — selected-coordinate persistence across surface switches; geometry-class warning chips when detected coordination exceeds default hex

**Wave 5 (parallel, ~135 min, 7 agents):**
- T15a **Chronos clock (M3-5') Hopf renderer** — `<HopfTorus>`, `<UserFibre>`, `<DegreeRing>`, `<BackboneRing>`, `<AxisMundi>`, `<PlanetMarkers>`, `<ZodiacGlyphs>`, `<OracleCastMarker>`, multiplayer presence rendering (linked Villarceau circles), camera controls, walkabout panel; consumes T5.5 `clockStore` mirror; ≥30fps acceptance test
- T15b M3 supporting strata — M3-0' SU(2)/Quaternions interactive sphere, M3-1' I-Ching grid (64), M3-2' codon table, M3-3' T→U animation, M3-4' tarot matrix
- T16 M4 Nara + dashboard + editor + all 6 modality views; M4-1' chakra spine reads from `clockStore.chakra_levels` (the same derivation as M5SpinePlugin)
- T17a M5 — Library (M5-0') Geometric Folio: recursive tree, aphorism gallery, ecology view, projects, published artifacts, **Möbius open-in-atelier flow**
- T17b M5 — **Atelier (M5-5') Strata Excavator**: Sophii dialogue (streaming via `agent:run:{id}`), live constellation graph using `GeometryClass`, curation sidebar, register/confidence editing, crystallisation flow with QL-position gating
- T17c M5 — **Epii Mode (M5-4')**: Bimba Update System with Sacred Review Modal, AG-UI event integration, Notion crystallisation pipeline, VAK execution surface
- T18 M5 — Pedagogy (M5-1'), Siva Layer with MEF registry (M5-2'), Shakti Layer with operator-drafted feature-seed canvas (M5-3') + agents/inbox commands

**Wave 6 (sequential, ~60 min):**
- T19 E2E Playwright specs (one or two agents)
- T20 Spec self-review against this document; fix any contract drift; verify Möbius cycle round-trip works end-to-end (Atelier → crystallise → Library shows aphorism → "Open in Atelier" → fresh session pre-seeded with Möbius seeds)

Total estimated parallel-time: ~6.5h with 8-way parallelism in waves 4–5. Without parallelism, ~28–35h of focused work.

### 12.3 Per-task self-contained briefs

Each task brief is a one-page slice of this document. A subagent dispatched on T15 (M3 Chronos clock) reads:
- Part IV (PortalClockState contract)
- Part V.2 (`clockStore`)
- Part VII.4 (M3' workspace + M3-5' sub-spec)
- Part X.2 (renderer tests)

…and can implement without reading anything else.

Similarly T8 (OmniPanel) reads:
- Part V.2 (`gatewayClient`)
- Part VII (`gatewayStore`)
- Part VIII (entire OmniPanel section with the binding map)
- Part X.3 (`omnipanel-parity.spec.ts` requirements)

This spec is structured so that no two tasks need to read overlapping non-trivial sections — only this overview and the relevant focused sub-spec.

### 12.4 Risks and mitigations

| Risk | Mitigation |
|---|---|
| Gateway protocol drift between Electron port-of and Tauri implementation | Rust gateway/connection.rs reproduces the existing handshake exactly; `gateway_handshake_against_real_gateway` test boots a real gateway harness and verifies. |
| TipTap + React 19 incompatibility | Already validated in Electron app (React 19.2 + TipTap 3.20). Same versions ported. |
| Three.js performance for Cymascope shader | Shader is simple sine-superposition; 60fps confirmed on M-series in similar shader pattern. Provide a `EPI_CYMASCOPE_MODE=low` env to reduce iteration count. |
| SpaceTimeDB native subscription wire format unstable | Default to polling mode; native is opt-in via env. |
| Neo4j unavailable during dev | Gracefully degrade; M0-5' shows "graph unavailable" overlay; commands return empty results. |
| Tauri capability/permission boundary issues | Capabilities pre-declared in `default.json`; CSP allow-list is explicit. |
| Renderer state divergence from `PortalClockState` | Single `clockStore` is the only renderer source; no per-domain duplicate state. Subscription is the only update path. |

### 12.5 Definition of done

The port is done when:

1. All 36 inner stratum surfaces render their intended visualisation (no placeholder text where this spec mandates a real surface).
2. M3-5' Chronos clock is live, casting from it works, walkabouts route correctly.
3. M2-5' Cymascope renders a stable cymatic pattern from live planetary positions.
4. **M0-5' 2D Bimba Explorer (Meta2D)** loads from real Neo4j data with hexagonal lattice, hexagon glyph rendering, mapped/unmapped force separation.
5. **M1-5' 3D Bimba Explorer (Meta3D)** runs all four custom forces (`keepMappedNodesFixed`, `keepUnmappedNodesConnected`, `parentGravity`, `orbitalMotion`) with continuous orbital motion.
6. **2D ↔ 3D toggle** preserves selected coordinate across surface switches.
7. **Bimba geometry framework** detects coordination class for sub-graphs and shows a warning chip when a non-default class is detected but layout falls back to hex.
8. M4-4' journal sendoff produces typed envelopes verified by an inbox entry.
9. **M5-5' Atelier** enforces the 6-position Logos Cycle: Sophii dialogue progresses through stages; crystallisation refuses before `dia-logos`; aphorism creation produces real `mobius_seeds`.
10. **M5-0' Library** displays all constellations + aphorisms + ecology view + projects; "Open in Atelier" on an aphorism produces a Möbius-seeded fresh Atelier session (the cycle round-trips end-to-end).
11. **M5-4' Epii Mode** Sacred Review Modal opens for any Bimba update; AG-UI events drive UI suggestions; Notion crystallisation produces a structured page.
12. **M5-2' MEF lens registry** reflects `active_branch_lens` from PortalClockState.
13. OmniPanel parity test passes for all 14 panels.
14. Backend Rust tests pass with `--test-threads=1` (incl. all geometry, atelier, library, bimba-update tests).
15. E2E Playwright specs all pass on a clean machine with running gateway + Neo4j.
16. **Hopf clock correct**: `composed_quaternion` is unit-magnitude; chakra derivation matches the canonical formula; M3-5' renders the Hopf torus at ≥30fps with `bifurcation_lambda = 0.5`; walkabout routes correctly.
17. **Multiplayer linked-fibres**: a second user joining the gateway and publishing presence appears as a Villarceau-linked fibre in the local user's M3-5' canvas within 1s of their reducer call. Linking-number test passes between any two distinct fibres.
18. **M4.4.4.4 Pratibimba anchor** is created on session start in Neo4j; every personal artifact (flow entry, oracle cast, journal highlight, atelier word, library aphorism) has `[:ANCHORED_TO]→PersonalNexus`.
19. **Storage topology correct**: vault is system of record; one Neo4j with three namespaces (`:Bimba`, `:Gnostic`, `:Atelier_*`) and atomic cross-namespace edges; Graphiti runs separately on its own port; RAG-Anything indexes the gnostic corpus on startup; Notion is write-only.
20. **Canonical day folder + NOW subfolders**: `Idea/Empty/Present/{YYYY-MM-DD}/` holds the day's quilt points (daily note, flow, dream, oracle) at top level; NOW subfolders host agent task execution threads; multiple NOWs per day work cleanly.
21. **Unified Highlight model**: one type, one store, registry-driven categories (canonical 8 + custom); highlighting is differentiation-first; sendoff is operator-triggered, never default; typed envelopes everywhere (no slash strings).
22. **Tarot + I-Ching live-recording canonical, randomness opt-in**: operator-recorded live draws create Graphiti oracle-arc episodes with `origin: live_draw`; randomness-engine path is a separate, explicit command; both populate `correspondences` (Bimba resonances + Atelier echoes + kairos + MEF lens readings) and update `PortalClockState.last_cast`. The Oracle Log panel queries Graphiti by `arc_type_prefix: 'oracle'`.
23. **Library is operator-curated**: only the operator promotes content into the Library; no autonomous loop deposits entries; RAG-Anything indexes promoted content under the relevant Bimba anchor; Graphiti episodic recall is opt-in per query.
24. Cold start under 1.5s; idle memory under 200MB.

---

## Part XIII — Authority and traceability

This document is the single build authority for the Tauri port. It does not replace the canonical seeds — it operationalises them.

**Canonical seeds (consult before changing this document):**
- `Idea/Bimba/Seeds/M/M'-TAURI-PORT-SPEC.md`
- `Idea/Bimba/Seeds/M/M'-PORTAL-SPEC.md`
- `Idea/Bimba/Seeds/M/M-SYSTEM-INDEX.md`
- `Idea/Bimba/Seeds/S/S-AD-HOC-ROADMAP.md`
- `Idea/Bimba/Seeds/S/S0/S0-SPEC.md`
- `Idea/Bimba/Seeds/M/M4'/Legacy/plans/CLOCK-AND-NARA-SPECS/09-cosmic-clock-plugin-tui-spec.md`
- `Idea/Bimba/Seeds/S/S3/S3'/Legacy/plans/2026-03-10-nara-runtime-full-plan.md`
- Old Bimba map seeds: `/Users/admin/Documents/Epi-Logos/Idea/Bimba/Map/M0'.md` through `M5'.md`

**Source-truth references for renderer behaviour (current Electron app):**
- `Body/S/S3/epi-app/renderer/components/OmniPanel.tsx` (panel orchestration)
- `Body/S/S3/epi-app/renderer/stores/epiClawGatewayStore.ts` (store contract)
- `Body/S/S3/epi-app/renderer/domains/M0_Anuttara/ui/GraphWorkspace.tsx` (force graph)
- `Body/S/S3/epi-app/renderer/domains/M4_Nara/ui/NaraDashboard.tsx` (Nara layout)
- `Body/S/S3/epi-app/renderer/domains/M4_Nara/ui/NaraEditor.tsx` (editor stack)
- `Body/S/S3/epi-app/renderer/domains/M4_Nara/editor/components/FloatingMenu.tsx` (highlight sendoff)
- `Body/S/S3/epi-app/shared/types.ts` (SPrimeAPI contract)
- `Body/S/S3/epi-app/shared/innerStrata.ts` (36-stratum spec)
- `Body/S/S3/epi-app/shared/navigationConfig.ts` (hotkey grammar)
- `Body/S/S3/epi-app/main/main.ts` (34 IPC handlers — port reference)
- `Body/S/S3/epi-app/main/s3-gateway-client.ts` (handshake protocol — port reference)
- `Body/S/S3/epi-app/main/epi-claw-client.ts` (JSON-RPC layer — port reference)

**v0 system source references (Bimba geometry, M5 surfaces):**
- `/Users/admin/Documents/early-epi/Epi-Logos_Seed_Files/epii_app/friendly-file-front/src/subsystems/0_anuttara/1_utils/geometryUtils.ts` — `calculateHexagonalPosition`, hexagon path generation
- `/Users/admin/Documents/early-epi/Epi-Logos_Seed_Files/epii_app/friendly-file-front/src/subsystems/0_anuttara/3_visualization/Meta2DVisualization.tsx` — 2D Bimba canonical
- `/Users/admin/Documents/early-epi/Epi-Logos_Seed_Files/epii_app/friendly-file-front/src/subsystems/1_paramasiva/3_visualization/Meta3DVisualization.tsx` — 3D Bimba canonical
- `/Users/admin/Documents/early-epi/Epi-Logos_Seed_Files/epii_app/friendly-file-front/src/subsystems/1_paramasiva/0_foundation/physicsConfig.ts` — `PHYSICS_3D` config + four custom forces
- `/Users/admin/Documents/early-epi/Epi-Logos_Seed_Files/epii_app/friendly-file-front/src/subsystems/3_mahamaya/2_hooks/useGraphStylingFunctions.ts` — color/material/pulsation
- `/Users/admin/Documents/early-epi/Epi-Logos_Seed_Files/epii_app/friendly-file-front/src/subsystems/5_epii/README.md` — Epii Mode (Bimba Update System, AG-UI, Notion crystallisation)

**strata-app source references (Atelier + Library):**
- `/Users/admin/Documents/early-epi/strata-app/app-identity/01-etymological-archaeology.md` — scent-following method, three-fold movement, aphorism as quilting point
- `/Users/admin/Documents/early-epi/strata-app/app-identity/02-logos-cycle-canonical.md` — full 6-position Logos Cycle specification (Ἄλογος → Ἀνά-λογος)
- `/Users/admin/Documents/early-epi/strata-app/app-identity/03-ql-mef-strata.md` — QL/MEF framework
- `/Users/admin/Documents/early-epi/strata-app/docs/architecture.md` — Neo4j schema (WordNode, Constellation, Aphorism, OCCUPIES_QL, PATTERNS_WITH, INCORPORATES, SEEDS)
- `/Users/admin/Documents/early-epi/strata-app/docs/ux-design-specification.md` — Atelier and Library UX patterns
- `/Users/admin/Documents/early-epi/strata-app/docs/prd.md` — functional requirements

**Tauri reference implementation (architecture inspiration only):**
- `/Users/admin/Documents/Antichrist Project/apps/desktop/src-tauri/` (working v2 layout, Cargo deps pattern)

---

## Closing

This is the build. No further design questions need answering before implementation.

The Tauri port preserves what works — every M' surface renderer, the TipTap editor, the OmniPanel shape, the Zustand state, the navigation grammar — and replaces what should not have been Electron-shaped to begin with: the main-process authority over gateway, vault, graph, and temporal projection.

It deepens what was placeholder: the Spanda torus becomes a real morph; the Cymascope becomes a real shader; the Chronos clock becomes the live operating substrate; the Atelier enforces the staged etymology; the highlight sendoff becomes typed.

It mirrors at the contract level — not the widget level — the TUI portal grammar so the desktop and TUI both consume the same gateway, the same SpaceTimeDB projection, the same `PortalClockState`, the same canonical session keys.

The implementation is parallelisable per the wave structure in Part XII. A focused single-session run with 5–7 parallel agents brings the build to "definition of done" in roughly 5 hours of wall-clock time.

— spec ends —
