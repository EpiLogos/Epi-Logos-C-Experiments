# S0/S0' — Terminal / CLI Core (Ground)

**Status:** ACTIVE — Primary development surface
**Coordinate:** S0 (explicit terminal), S0' (QL-augmented CLI)
**Implementation:** `Body/S/S0/epi-cli` (Rust CLI) + `Body/S/S0/epi-lib` (C library) + `Body/S/S0/portal-core` (shared Rust math)
**CLI Namespace:** `epi core`, `epi` (root router)

---

## Current State

S0' is the most mature layer. The `epi` CLI (Rust, clap) routes to the C library (`libepilogos`) via FFI.

### What Exists
- **Body/S/S0/epi-cli/src/**: command, gateway, graph, agent, Nara, portal, vault, and FFI mirrors over the S-layer services.
- **Body/S/S0/epi-lib/**: C M-family ground engine, psychoid numbers, arena/families, VAK dispatch, M0-M5, and the first bioquaternionic kernel primitives.
- **Body/S/S0/portal-core/**: shared Rust math for portal/TUI/future desktop surfaces, including the Rust mirror of the kernel primitives.
- **CLI commands**: `epi core {inspect, walk, verify, ring, m0, m1}`, `epi vault {CRUD, frontmatter, daily, now-read/write}`, stubs for graph/gate/agent/sync

### Architecture
```
epi (Rust CLI router)
  |-- core (FFI -> statically linked libepilogos)
  |-- vault (obsidian-cli wrapper -> S1)
  |-- graph (neo4j/redis client -> S2)
  |-- gate (gateway client -> S3)
  |-- agent (pi lifecycle -> S4)
  |-- sync (n8n/notion -> S5)
  |-- tui (ratatui dashboard)
  |-- ffi (C function bindings, including kernel math)
  |-- techne (build/test orchestration)
```

### S0 vs S0' Distinction
- **S0** = raw terminal primitives: process spawn, shell env, file I/O, CLI argument parsing
- **S0'** = QL-augmented: coordinate validation, topology-aware routing, the `epi` command grammar itself

### Integration Points
- Every other S-layer is accessed **through** S0' — the CLI is the universal substrate
- C library is compiled into the Rust CLI build and exposed through `ffi`; older dynamic-loading language should be treated as historical unless a future plugin boundary reintroduces it deliberately.
- All S1-S5 commands pass through the CLI router before reaching their layer

### Kernel / QL Meta-Layer

S0/S0' now owns the first executable body of the Epi-Logos kernel. This is not an API wrapper. It is the low-level computational matrix through which the QL/MEF matheme becomes real code.

Current kernel primitives:

- C source: `Body/S/S0/epi-lib/include/kernel.h`, `Body/S/S0/epi-lib/src/kernel.c`
- Rust mirror and portal state: `Body/S/S0/portal-core/src/kernel.rs`, `Body/S/S0/portal-core/src/types.rs`, `Body/S/S0/portal-core/src/state.rs`
- CLI FFI: `Body/S/S0/epi-cli/src/ffi/kernel.rs`
- TUI mirror: `Body/S/S0/epi-cli/src/portal/clock_state.rs`

Computed behavior now includes:

- 9/8 epogdoon ratio and `log(9/8)` tick quantum.
- 4/3, 3/4, 2/3, and 3/2 harmonic ratios.
- Unit-normalized `q_b` / `q_p` bioquaternionic state.
- Slash-flip quaternion conjugation from pratibimba to bimba-prime.
- Squared latent distance energy.
- 72-fold resonance indexing and X+Y=5 tritone-square emphasis.
- Decomposed energy arithmetic over bimba/pratibimba, lens, and R-energy terms.
- 12-epogdoon tick phasing into eight kernel elements.
- Canonical `KernelProjection` over tick, bioquaternion, energy, and tritone-square emphasis.
- Deterministic `HarmonicPulse` derivation over tick cycle, sub-tick, phase, element, integer ratio, tempo multiplier, and period multiplier.
- Live portal-clock recomputation after oracle casts, Kairos transit updates, and quintessence updates.
- S0 TUI data-panel rendering for kernel phase, element, harmonic ratio, pulse ratio, and total energy.
- DAY/NOW temporal surface fields for kernel generation, sub-tick, phase, element, ratio, and energy.
- Validated `KernelResonanceObservation` emission over source coordinate, session key, timestamp, lens, helix, position, score, resonance index, tritone square, and kernel tick.
- S0 gateway passthrough for `s2.graph.kernel_resonance.record` and `s5.episodic.kernel_resonance.deposit`, with S2/S3 retaining schema/runtime ownership.

Envelope, API, TypeScript, TUI, and future Tauri surfaces should expose this computed kernel state as the QL meta-layer. They must not duplicate it as independent schema-only logic.

### Reflected M0' / M1' Contract

S0/S0' is the upstream profile contract for M0' graph rendering and M1' relational movement. It exposes the shared `MathemeHarmonicProfile` substrate, safe kernel projection, tick / degree / helix / ratio state, and coordinate validation hooks consumed by graph, torus, clock, Nara, and Epii surfaces.

S0/S0' does not render the M0' graph view, compute filtered subgraphs, own GDS overlays, or synthesize the M2-1' Vimarśa audio bus locally. Those are downstream surface or S2/S3 responsibilities over the profile contract. `world_clock`-driven pulse behavior belongs to S3/SpaceTimeDB and downstream renderers; S0 may mirror or expose it through typed projection but must not create a second world-clock authority.

### Next Steps
- Carry kernel energy/resonance deltas toward S5 EBM/autoresearch surfaces and Epii review evidence.
- Push gateway/API/envelope schema fields all the way through the SpaceTimeDB projection once the safe-public kernel projection payload is final.
- Continue extracting S2/S3/S4/S5 authority while preserving S0 as the return surface.

### QV Pipeline (v0.2.0)

The Quintessential View pipeline manages self-knowledge data:
- **Overlay** (`~/.epi-logos/qv/overlay.json`) — staging tier for fast iteration
- **Bake** (`epi core knowing --bake`) — generates `src/qv_data.c` with static strings
- **Three-tier resolution** — overlay -> C library -> static Rust tables
- **Write gate** — session passphrase protects overlay modifications
- **Coverage** — `epi core knowing --coverage` reports population across 89 coordinate slots
- **Knowing dossier** — `epi core knowing <coord>` resolves essence, structural correspondences, relational field, KBase field, notebook pulse, and latest snapshot
- **Knowing actions** — `--project`, `--refresh`, `--open`, `--glow`, and `--tui` turn the command into a lightweight knowledge portal surface

See `docs/specs/S/S0-QV-PIPELINE-AND-PLUGIN.md` for full architecture.
