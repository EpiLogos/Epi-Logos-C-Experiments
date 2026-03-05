# Design: `epi` — The Master CLI

**Date:** 2026-03-05
**Status:** Design Approved
**Language:** Rust
**Parent Spec:** `docs/specs/S/S_Series_Master_CLI_Architecture.md`
**Pillar I Source:** `docs/specs/PILLAR-I-CANONICAL.md`

---

## I. Architecture Overview

```
┌─────────────────────────────────────────────┐
│  epi (Rust binary)                          │
│  ├── clap — subcommand routing              │
│  ├── ratatui + crossterm — TUI engine       │
│  ├── serde_json — JSON output (--json)      │
│  └── FFI — extern "C" to libepilogos.so     │
│       ↓ dlopen at runtime                   │
│  libepilogos.so (C shared library)          │
│  └── .rodata psychoids (17 BIMBA entities)  │
│  └── arena allocator + families             │
│  └── torus engine                           │
└─────────────────────────────────────────────┘
```

**Build chain:**
1. C library → `libepilogos.so` (clang, -shared -fPIC)
2. Rust binary → `epi` (cargo build, links to libepilogos.so at runtime)

**Output modes:**
- Default: Rich TUI via ratatui (interactive, human exploration)
- `--json` flag: Structured JSON to stdout (agent/pipeline consumption)

---

## II. The Full Coordinate Data Model

The CLI must surface the entire coordinate system as first-class entities.

### Layer 0: The Inversion Act (#)

The `#` operator is both:
- A **function** (`Execute_Hash`) that toggles `inversion_state` on any coordinate
- An **addressable .rodata entity** (`Psychoid_Hash`, ql_position=0xFF)

CLI representation: `#` alone refers to the operator/entity. `X'` or `Xi` denotes the result of `#` applied to coordinate X.

### Layer 1: The Seven Psychoid-Numbers

| CLI Name | C Symbol | ql_position | Notes |
|----------|----------|-------------|-------|
| `#0` | `Psychoid_0` | 0 | Ground — self-referential (.c → self) |
| `#1` | `Psychoid_1` | 1 | Form |
| `#2` | `Psychoid_2` | 2 | Operation |
| `#3` | `Psychoid_3` | 3 | Pattern — .cf → #4 |
| `#4` | `Psychoid_4` | 4 | Context/Lemniscate — .cf → self |
| `#5` | `Psychoid_5` | 5 | Integration/Möbius — .c → #0 |
| `#` | `Psychoid_Hash` | 0xFF | The inversion act |

Plus 3 weave interleaves: `Weave_0_5`, `Weave_5_0`, `Weave_5_5`

### Layer 2: The Six Coordinate Families (36 coords)

Each family manifests #0-#5 through its domain:

| CLI Prefix | Family | Domain | Example |
|------------|--------|--------|---------|
| `P` | Position | Functional semantics | `P3` = Pattern |
| `S` | Stack | Technology layers | `S2` = Neo4j |
| `T` | Thought | Artifacts/cognition | `T5` = Insight |
| `M` | Map (Bimba) | Consciousness domains | `M1` = Paramasiva |
| `L` | Lens | Epistemic modes | `L4` = Paradigmatic |
| `C` | Category | Ontological foundation | `C0` = Bimba |

Notation: `M2.4'` = Subsystem family, position 2, nested at 4, inverted.

### Layer 3: The Six Reflective Coordinates

Held within the `()` operator as the execution matrix:

| CLI Name | Field | Associated CF | Current Wiring |
|----------|-------|---------------|----------------|
| `cpf` | `.cpf` | CF_01 (0/1) | Pending (NULL) |
| `ct` | `.ct` (Context-Type) | CF_012 (0/1/2) | Pending (NULL) |
| `cp` | `.cp` | CF_0123 (0/1/2/3) | Pending (NULL) |
| `cf` | `.cf` | CF_4x (Lemniscate) | **Wired** — #4 self-fold |
| `cfp` | `.cfp` | Custom | Pending (NULL) |
| `cs` | `.cs` (Context-Sequence) | Custom | **Wired** — position-5 peer |

### Layer CF: The Seven Context Frame Roots

| CLI Name | C Symbol | Context Mode | weave_state |
|----------|----------|-------------|-------------|
| `CF(0000)` | `CF_0000` | Mod% Receptive | 0.0f |
| `CF(01)` | `CF_01` | Mod 2 Binary | 0.1f |
| `CF(012)` | `CF_012` | Mod 3 Trika | 0.12f |
| `CF(0123)` | `CF_0123` | Mod 4 Quaternal | 0.123f |
| `CF(4x)` | `CF_4x` | Mod 4/6 Fractal | 4.05f |
| `CF(450)` | `CF_450` | Synthesis | 4.5f |
| `CF(50)` | `CF_50` | Mod 6 Möbius | 5.0f |

### Operators

The CLI must understand and display these as first-class relational operators:

| Operator | CLI Syntax | Tagged Pointer Bit | Function |
|----------|------------|-------------------|----------|
| `#` | `#` prefix or `epi core hash` | bit 63 `FLAG_INVERTED` | Inversion: X → X' |
| `'` / `i` | Suffix on any coord (`M2'`) | `inversion_state` field | Phase marker (result of #) |
| `.` | Dot in path (`M2.4`) | bit 62 `FLAG_NESTING` | Nesting — fractal descent via cf |
| `-` | Dash in path (`M2-3`) | bit 61 `FLAG_BRANCHING` | Branching — lateral relation |
| `()` | Parens around CF (`CF(012)`) | bit 60 `FLAG_EXECUTING` | Invocation — fires invoke_process |
| `/` | Slash in CF mode (`0/1/2`) | N/A (notation only) | Path separator within CF modes |

---

## III. Namespace Structure

### A. `epi core` — Bare-Metal QL (IMPLEMENTED)

| Command | Description |
|---------|-------------|
| `epi core inspect <coord>` | Inspect any coordinate: psychoid, family, CF root, weave |
| `epi core walk [--steps N] [--start <coord>]` | Torus walk visualization, step by step |
| `epi core verify` | Run boot_verify_web() — check all 17 BIMBA entities |
| `epi core hash <coord>` | Apply # to a coordinate, show before/after inversion |
| `epi core arena` | Show arena state: slot count, family layout, bedrock wiring |
| `epi core families` | Show all 36 family coordinates with cross-links |
| `epi core web <coord>` | Show the 12-pointer intra-openness web for a coordinate |
| `epi core operators` | Display operator table with tagged pointer bit layout |
| `epi core cf` | List all 7 CF roots with their properties |
| `epi core dump [--format json\|table]` | Dump entire .rodata bedrock |

**Coordinate query syntax:**
- Psychoids: `#0`, `#1`, ..., `#5`, `#` (Hash)
- Family coords: `P0`, `S3`, `M2`, `C5`, `L4'` (inverted)
- CF roots: `CF(0000)`, `CF(01)`, `CF(012)`, `CF(0123)`, `CF(4x)`, `CF(450)`, `CF(50)`
- Weaves: `W0.5`, `W5.0`, `W5.5`
- Path notation: `M2.4` (nesting), `M2-3` (branching)

### B. `epi vault` — Obsidian (STUB)

| Command | Description |
|---------|-------------|
| `epi vault status` | Show vault connection status |
| `epi vault read <coord>` | Read Obsidian note for coordinate |
| `epi vault write <coord> --content <text>` | Write/update Obsidian note |
| `epi vault search <query>` | Search vault by content |

### C. `epi graph` — Neo4j + Redis (STUB)

| Command | Description |
|---------|-------------|
| `epi graph status` | Show Neo4j/Redis connection status |
| `epi graph query <coord> [--depth N]` | Query graph neighborhood |
| `epi graph upsert <coord> --vector <data>` | Upsert coordinate with embedding |
| `epi graph provisional` | List all STATUS_PROVISIONAL nodes |

### D. `epi gate` — WebSocket Gateway (STUB)

| Command | Description |
|---------|-------------|
| `epi gate status` | Show gateway status |
| `epi gate listen [--port N]` | Start WebSocket listener |
| `epi gate send <message>` | Send message to connected clients |

### E. `epi agent` — LLM Orchestration (STUB)

| Command | Description |
|---------|-------------|
| `epi agent delegate --to <name> --task <desc>` | Spawn sub-agent task |
| `epi agent await --signatures <list> [--timeout ms]` | Wait for agent completions |
| `epi agent status` | Show active agent swarm |

### F. `epi sync` — n8n Webhooks (STUB)

| Command | Description |
|---------|-------------|
| `epi sync status` | Show n8n connection status |
| `epi sync trigger <webhook>` | Trigger a webhook |
| `epi sync list` | List configured webhooks |

### G. Global Flags

| Flag | Description |
|------|-------------|
| `--json` | Output structured JSON instead of TUI |
| `--provisional` | Force write even if C-engine rejects topology |
| `--signature <CF>` | Context Frame signature for parallel agent isolation |

---

## IV. TUI Design (ratatui)

### Main Dashboard (`epi core`)

```
┌────────────── epi core ── Pillar I: The Siva Ground ──────────────┐
│ ┌─ Psychoid Numbers ─────────┐ ┌─ Detail ────────────────────────┐│
│ │  #0  Ground         0.0    │ │ Psychoid_0                      ││
│ │  #1  Form           1.0    │ │ ql_position: 0                  ││
│ │  #2  Operation      2.0    │ │ family: FAMILY_NONE             ││
│ │▸ #3  Pattern        3.0    │ │ flags: 0x21 [BIMBA] [CANONICAL] ││
│ │  #4  Context        4.0    │ │ weave: 0.0                      ││
│ │  #5  Integration    5.0    │ │ inversion: normal               ││
│ │  #   Hash          0xFF    │ │                                  ││
│ │ ─── Weaves ───             │ │ Pointer Web:                    ││
│ │  W0.5  Ground→Integ  0.5   │ │  .c  → &Psychoid_0 (self)      ││
│ │  W5.0  Integ→Ground  5.0   │ │  .cf → (null)                  ││
│ │  W5.5  Pure Instance  5.5  │ │  .p  → P0 [BRANCH]             ││
│ │ ─── CF Roots ───           │ │  .s  → S0 [BRANCH]             ││
│ │  CF(0000) Receptive        │ │  .cs → #5 (sequence)             ││
│ │  CF(01)   Binary           │ │                                  ││
│ │  CF(012)  Trika            │ │ Bedrock: (raw psychoid, N/A)    ││
│ │  CF(0123) Quaternal        │ │ Invoke: Execute_Ground          ││
│ │  CF(4x)   Fractal          │ │                                  ││
│ │  CF(450)  Synthesis        │ └──────────────────────────────────┘│
│ │  CF(50)   Möbius           │                                    │
│ └────────────────────────────┘                                    │
│ ┌─ Torus Walk ────────────────────────────────────────────────────┐│
│ │  #0 ─→ #1 ─→ #2 ─→ #3 ─→ #4 ⊸ cf ─→ #5 ─→ #0 (Möbius) ↻   ││
│ │  Step: 3/6  Position: #3  Covering: Normal                     ││
│ └─────────────────────────────────────────────────────────────────┘│
│ ┌─ Operators ─────────────────────────────────────────────────────┐│
│ │  # Inversion (bit63)  . Nesting (bit62)  - Branch (bit61)      ││
│ │  () Execute (bit60)   ' Phase marker     / Path separator      ││
│ └─────────────────────────────────────────────────────────────────┘│
│ [q]uit  [w]alk  [h]ash  [v]erify  [a]rena  [f]amilies  [j]son   │
└───────────────────────────────────────────────────────────────────┘
```

### Family Explorer (`epi core families`)

```
┌─────────── Family Coordinates ── 36 Total ────────────────────────┐
│ ┌─ Family ──┐ ┌─ Positions ──────────────────────────────────────┐│
│ │▸ P Posit. │ │  P0 Ground   P1 Defn    P2 Oper   P3 Pattern    ││
│ │  S Stack  │ │  P4 Context  P5 Integ                            ││
│ │  T Thought│ │                                                   ││
│ │  M Map    │ │  Bedrock: P3 → Psychoid_3                       ││
│ │  L Lens   │ │  .cf → &Psychoid_4 (Lemniscate)                 ││
│ │  C Categ. │ │  .cs → P5 (sequence)                    ││
│ └───────────┘ │  .p → P3 (self) [NEST]  .s → S3 [NEST]         ││
│               │  .t → T3 [NEST]  .m → M3 [NEST]                ││
│               │  .l → L3 [NEST]  .c → mirror#3 [NEST]          ││
│               │                                                   ││
│               │  Reflective:                                      ││
│               │  .cpf → (null)  .ct → (null)  .cp → (null)      ││
│               │  .cf  → #4      .cfp → (null) .cs → P5          ││
│               └───────────────────────────────────────────────────┘│
└───────────────────────────────────────────────────────────────────┘
```

### Torus Walk Visualization (`epi core walk`)

```
┌─────────── Torus Walk ── Double Covering (720°) ──────────────────┐
│                                                                    │
│            ┌───#1───┐                                              │
│           /          \                                             │
│      #0 ●              #2                                          │
│       ↑  \            /                                            │
│       │   └───#3───┘                                               │
│       │        │                                                   │
│       │    #4 ⊸ cf (Lemniscate dive)                              │
│       │        │                                                   │
│       └────#5──┘ ← Möbius return                                  │
│                                                                    │
│  Covering 1/2 (Normal)  Step: 5/12  Position: #4                  │
│  Walk Context: steps=5, cycles=0, covering=normal                 │
│                                                                    │
│  [space] step  [r]un all  [c]overing toggle  [q]uit              │
└───────────────────────────────────────────────────────────────────┘
```

---

## V. FFI Layer Design

### C Shared Library Build

```makefile
libepilogos.so: src/psychoid_numbers.c src/engine.c src/arena.c src/families.c
	clang -std=c11 -shared -fPIC -O2 -I include -o libepilogos.so $^
```

### Rust FFI Bindings (`epi-ffi/src/lib.rs`)

```rust
// Opaque C types
#[repr(C)]
pub struct HolographicCoordinate {
    pub ql_position: u8,
    pub family: u8,
    pub inversion_state: u8,
    pub flags: u8,
    pub weave_state: f32,
    pub semantic_embedding: *mut f32,
    pub p: *mut HolographicCoordinate,
    pub s: *mut HolographicCoordinate,
    pub t: *mut HolographicCoordinate,
    pub m: *mut HolographicCoordinate,
    pub l: *mut HolographicCoordinate,
    pub c: *mut HolographicCoordinate,
    pub cpf: *mut HolographicCoordinate,
    pub ct: *mut HolographicCoordinate,
    pub cp: *mut HolographicCoordinate,
    pub cf: *mut HolographicCoordinate,
    pub cfp: *mut HolographicCoordinate,
    pub cs: *mut HolographicCoordinate,
    pub invoke_process: Option<extern "C" fn(*mut HolographicCoordinate, *mut c_void)>,
    pub payload: u64, // union, treat as opaque 8 bytes
}

extern "C" {
    // .rodata psychoids
    pub static Psychoid_0: HolographicCoordinate;
    pub static Psychoid_1: HolographicCoordinate;
    // ... etc for all 17 BIMBA entities

    // Arena operations
    pub fn arena_init(arena: *mut CoordinateArena, capacity: u32) -> c_int;
    pub fn arena_alloc(arena: *mut CoordinateArena) -> *mut HolographicCoordinate;
    pub fn arena_destroy(arena: *mut CoordinateArena);

    // Family operations
    pub fn families_init(arena: *mut CoordinateArena, mirrors: *mut *mut HolographicCoordinate) -> c_int;
    pub fn families_crosslink(arena: *mut CoordinateArena) -> c_int;
    pub fn families_wire_reflective(arena: *mut CoordinateArena) -> c_int;

    // Engine
    pub fn engine_torus_walk(start: *const HolographicCoordinate, ctx: *mut c_void, steps: u32);
    pub fn engine_double_covering(start: *const HolographicCoordinate, ctx: *mut c_void);

    // Hash
    pub fn Execute_Hash(self_: *mut HolographicCoordinate, ctx: *mut c_void);
}
```

### Tagged Pointer Helpers (Rust side)

```rust
const MASK_ADDRESS: usize = 0x0000_FFFF_FFFF_FFFF;
const FLAG_INVERTED: usize = 0x8000_0000_0000_0000;
const FLAG_NESTING: usize = 0x4000_0000_0000_0000;
const FLAG_BRANCHING: usize = 0x2000_0000_0000_0000;
const FLAG_EXECUTING: usize = 0x1000_0000_0000_0000;

fn get_ptr(tagged: *mut HolographicCoordinate) -> *mut HolographicCoordinate {
    (tagged as usize & MASK_ADDRESS) as *mut HolographicCoordinate
}

fn decode_tags(tagged: *mut HolographicCoordinate) -> TagInfo {
    let bits = tagged as usize;
    TagInfo {
        inverted: bits & FLAG_INVERTED != 0,
        nesting: bits & FLAG_NESTING != 0,
        branching: bits & FLAG_BRANCHING != 0,
        executing: bits & FLAG_EXECUTING != 0,
        family: ((bits >> 56) & 0xF) as u8,
        arch: ((bits >> 48) & 0xFF) as u8,
    }
}
```

---

## VI. Rust Project Structure

```
epi-cli/
├── Cargo.toml
├── build.rs              # Optional: verify libepilogos.so exists
├── src/
│   ├── main.rs           # clap CLI entry point
│   ├── ffi/
│   │   ├── mod.rs        # FFI bindings + safe wrappers
│   │   └── tagged.rs     # Tagged pointer decode helpers
│   ├── core/
│   │   ├── mod.rs        # epi core subcommands
│   │   ├── inspect.rs    # Coordinate inspection
│   │   ├── walk.rs       # Torus walk
│   │   ├── verify.rs     # Boot verification
│   │   ├── hash.rs       # # inversion
│   │   ├── arena.rs      # Arena state display
│   │   └── families.rs   # Family explorer
│   ├── vault/
│   │   └── mod.rs        # Stub: epi vault
│   ├── graph/
│   │   └── mod.rs        # Stub: epi graph
│   ├── gate/
│   │   └── mod.rs        # Stub: epi gate
│   ├── agent/
│   │   └── mod.rs        # Stub: epi agent
│   ├── sync/
│   │   └── mod.rs        # Stub: epi sync
│   ├── tui/
│   │   ├── mod.rs        # ratatui app state + event loop
│   │   ├── dashboard.rs  # Main dashboard layout
│   │   ├── walk_view.rs  # Torus walk TUI
│   │   └── family_view.rs # Family explorer TUI
│   └── json.rs           # --json output formatting
```

### Key Crates

| Crate | Purpose |
|-------|---------|
| `clap` (derive) | Subcommand parsing with all 6 namespaces |
| `ratatui` | TUI rendering |
| `crossterm` | Terminal backend for ratatui |
| `serde` + `serde_json` | JSON serialization for --json mode |
| `libc` | C FFI primitive types |
| `libloading` | dlopen for libepilogos.so at runtime |
| `color-eyre` | Error handling |

---

## VII. What's Buildable Now vs. Pending Pillar II

### Fully functional today (Pillar I data):
- All 17 BIMBA entities: inspect, dump, verify
- 36 family coordinates: browse, cross-link display, bedrock check
- Torus walk + double covering: step-by-step visualization
- # inversion: apply to any mutable coordinate
- Tagged pointer decode: show all 6 operator bits
- Arena state: slot usage, memory layout
- Operators table: display all with bit positions

### Shows NULL/pending (awaiting Pillar II):
- `cpf`, `ct`, `cp`, `cfp` reflective pointer fields (4 of 6)
- CF root → reflective coordinate wiring
- M-branch specific data structures (M0-M5 subsystem payloads)
- Tensor Arena vector content (semantic_embedding float data)

### Stub namespaces (future integration):
- `epi vault` — needs Obsidian vault path config
- `epi graph` — needs Neo4j connection
- `epi gate` — needs WebSocket server
- `epi agent` — needs LLM harness
- `epi sync` — needs n8n webhook config

---

## VIII. Implementation Priority

1. **C shared library** — build libepilogos.so from existing sources
2. **Rust FFI bindings** — repr(C) struct + extern declarations
3. **clap skeleton** — all 6 namespaces with stubs
4. **epi core inspect** — the foundational query command
5. **epi core verify** — boot verification display
6. **epi core dump** — full .rodata dump (JSON + table)
7. **TUI dashboard** — ratatui main view with psychoid list + detail panel
8. **epi core walk** — torus walk TUI with step-by-step
9. **epi core families** — family explorer TUI
10. **epi core hash** — # inversion interactive
11. **Stub all other namespaces** — clean "not yet implemented" messages
