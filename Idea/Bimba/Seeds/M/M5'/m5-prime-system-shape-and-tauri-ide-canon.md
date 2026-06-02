---
coordinate: "M5'"
status: "active-canon-clarification-spec"
updated: "2026-05-31"
type: "shape-clarification"
companion_to: "[[M5'-SPEC]]"
consolidates_across:
  - "[[M'-SYSTEM-SPEC]]"
  - "[[M'-TAURI-PORT-SPEC]]"
  - "[[M5'-SPEC]]"
  - "[[m5-prime-autoresearch-self-improvement-loop]]"
  - "[[epii-operational-capacities]] family"
  - "[[m4-prime-psychoid-cymatic-field-engine]]"
depends_on:
  - "[[M5'-SPEC]]"
  - "[[m5-prime-autoresearch-self-improvement-loop]]"
  - "[[CLAUDE.md]] §II-VI"
---

# [[M5']] System Shape Clarification — S as Backend, M' as Frontend, Theia IDE as Shell

## The canon-setting consolidation of the system's app-architectural shape

**Status:** M5'-level canon-clarification spec. Consolidates architectural decisions surfaced through recent thinking-work into a coherent shape-canon that downstream specs reference rather than re-articulate.

**Reading order:** This is the foundational app-architecture canon for the M5'/M'/Tauri/IDE layer. Read after `M5'-SPEC.md` and `CLAUDE.md` §II-VI; before drafting or updating any spec that touches the Tauri-app architecture, the IDE shell, the plugin-app boundary, or the M5-2/3/4 trinitarian breakdown.

---

## §0 — Thesis

Recent specification work surfaced several architectural diffusions that this spec consolidates into clear canon:

1. The **M5-2/M5-3/M5-4 trinitarian breakdown** was hovering as abstract registers ("siva-backend", "-shakti-frontend", "siva-shakti-agentic") across the operational-capacity siblings. The clarification: **M5-2 IS the S-family stack itself; M5-3 IS the M'-family Tauri app itself; M5-4 IS the operational-capacities-and-agentic-mediation**. The Siva-Shakti polarity is not metaphor at the M5 sixfold — it is the literal S-as-Siva-infrastructure / M'-as-Shakti-rendered-surface co-implication.

2. The **app architecture** is **Theia as THE shell** — not Tauri-wrapped, not Tauri-with-Theia-summoned. Theia (Electron-equivalent for desktop; browser-mode optionally served by the Node backend for shared/headless deployment) IS the shell. The 0/1 + 4+2 layout discipline (per `m4-prime-psychoid-cymatic-field-engine.md` §2; `alpha_quaternionic_integration_across_M_stack.md` §0.2) lives as **two layout modes within the single Theia shell**: a lightweight 0/1 daily mode (the user's first-load, default workspace layout — journal, agent check-in, lightweight cymatic, status display) and a deep IDE mode (the full 4+2 layout with M0/M5 IDE chrome, six M-extensions, the two integrated plugins, agentic control room). The omni panel switches layouts; there is no second app, no Tauri webview, no surface-to-surface IPC across processes. The existing `Body/M/epi-tauri` work is migration source, not a permanent runtime surface.

3. The **IDE shell basis** is committed: **Theia**, not VSCode-fork, not Tauri-from-scratch. Theia is purpose-built for forking; Eclipse Foundation backing; modular extension API (Theia-native + VS Code Extension API for ecosystem reach). Resonant — *Ale-theia* names the disclosure-tracking agent in the M5-4 agentic register; the IDE shell that surfaces canon-development work carries the right name-correspondence. Theia is also explicitly designed as a UI shell over external language/tool processes, so the existing Rust gateway ([[Body/S/S3/gateway]]), C kernel ([[Body/S/S0/epi-lib]]), and Python hen-compiler ([[Body/S/S1/hen-compiler]] + [[Body/S/S1/hen-compiler-core]]) stay where they are — Theia connects to them via WebSocket/JSON-RPC + LSP (rust-analyzer for Rust editing; clangd for C; pylsp for Python). Language divergence stays at the substrate boundary and never leaks into the shell.

3a. The **S1 vault reach** is **direct-filesystem-read + Hen-gateway-write**, not via any Obsidian-runtime bridge. The vault root is at [[/Idea]] (carrying `Bimba/`, `Empty/`, `Pratibimba/` sub-roots); Theia reads it natively via its filesystem provider. Writes to the vault from Theia route through Hen via gateway (`s1'.vault.*` family) — Hen's [[Body/S/S1/hen-compiler-core/src/wikilinks.rs]] (163-LOC fence-aware wikilink parser) plus its compile-plan flow protect wikilink health, path integrity, and structural soundness before any write commits. The `obsidian-md-vsc` VS Code extension is NOT canonical — research revealed it is an Obsidian-app remote-control shim (via Advanced URI), not a vault renderer, and requires a running Obsidian app to function; it does not read `.obsidian/plugins/`, render wikilinks, or operate without Obsidian. The user's Obsidian app continues to run independently for authoring; Theia and Obsidian coexist via the shared vault filesystem, no IPC needed.

3b. **Smart Connections is the vault-resident semantic-input substrate** for M5-0. The user's Obsidian install ships [[Body/S/S1/hen-compiler/.obsidian/plugins/smart-connections]] v4.1.7 which produces local BGE-micro-v2 embeddings of vault content at `<vault>/.smart-env/multi/*.ajson`. Hen's [[Body/S/S1/hen-compiler-core/src/smart_env.rs]] (614 LOC) already reads this store and returns typed `LinkCandidateResponse` (ExplicitOutlink / SemanticSource / SemanticBlock with cosine scores + evidence + staleness). This is canonical input *to* the Gnostic pipeline (per §1.2 M5-0 row), not a substitute for it.

4. The **plugin-app granularity** within the IDE is a **6 + 2 architecture**: six individual M-extensions (one per subsystem, M0 through M5) plus two integrated plugins. The two integrated plugins inherit QL context-frame structure: **the integrated 1-2-3 plugin** (Mod 4 — Three-Plus-One; the full M1-M2-M3 manifestational substrate rendered together as the cosmic-engine surface) and **the integrated 4/5/0 plugin** (Mod 6 — Möbius-return; M4+M5+M0 rendered together as the user-experience integration, the system's 5→0 return at the app-architecture register).

5. The **kernel-bridge foundational extension** is what wires the actual C-library computation (M1' / M2' / M3' real engines at S0) through to every M-extension and integrated-plugin, so data underlying remains consistently available whether subsystems are rendered individually or together.

These five clarifications together resolve the diffusion. This spec is the canonical statement. Downstream specs reference it; updates flow from it.

---

## §1 — The S-as-Backend / M'-as-Frontend mapping

### §1.1 The Siva-Shakti polarity at the system/coordinate register

Per CLAUDE.md §VI, the Siva-Shakti polarity operates at the memory-arena register: `.rodata = Siva (immutable substrate)`, `Heap = Shakti (mutable instances)`, `Tensor = Prana (high-dim vector embeddings)`. This is the foundational pattern.

The same polarity operates at the **system/coordinate register**:

| Family | Polarity-role | Operative character |
|---|---|---|
| **S' Kernel** | **Siva-of-Siva — substrate-of-substrate** | The C-library kernel + Rust portal-core engine that computes m0–m5 substrate for the whole S-stack. Lives implementation-locally inside [[Body/S/S0/epi-lib]] + [[Body/S/S0/portal-core]] but is ontologically prior to S0 — the engine the whole S-family consumes from, not an S0 sub-layer. Carries: m0–m5 C kernel ([[Body/S/S0/epi-lib/src/m0.c]] … [[Body/S/S0/epi-lib/src/m5.c]]), [[Body/S/S0/epi-lib/src/m3_clock_lut.c]], [[Body/S/S0/epi-lib/src/pointer_web.c]], [[Body/S/S0/epi-lib/src/arena.c]], [[Body/S/S0/epi-lib/src/families.c]], [[Body/S/S0/epi-lib/src/kernel.c]], [[Body/S/S0/epi-lib/src/engine.c]], [[Body/S/S0/epi-lib/src/psychoid_numbers.c]]; Rust mirror at [[Body/S/S0/portal-core/src/kernel.rs]], [[Body/S/S0/portal-core/src/mahamaya.rs]], [[Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs]], [[Body/S/S0/portal-core/src/nara_journal.rs]], [[Body/S/S0/portal-core/src/personal_identity.rs]], [[Body/S/S0/portal-core/src/codon_rotation_projection.rs]], [[Body/S/S0/portal-core/src/events.rs]]. |
| **S (Stack)** | **Siva — infrastructure-substrate** | Immutable-by-build technology layers consuming the S' kernel: S0 Terminal/CLI/lib ([[Body/S/S0/epi-cli]]), **S1 Obsidian/vault** (canonical-knowledge filesystem at [[/Idea]]; **direct-filesystem-read** from Theia via its FS provider, **writes-through-Hen** via `s1'.vault.*` gateway methods so wikilink integrity and path soundness are preserved — Hen substrate at [[Body/S/S1/hen-compiler-core]] (carries `wikilinks.rs` parser + `smart_env.rs` Smart Connections reader + `relation_inference.rs` + `property_intelligence.rs` + `artifact_evidence.rs` + `graph_promotion.rs`) + [[Body/S/S1/hen-compiler]] Python infrastructure; **semantic neighbours via Smart Connections** read off `<vault>/.smart-env/multi/*.ajson` by `hen_compiler_core::smart_env::suggest_link_candidates`), S2 Neo4j/bimba-map ([[Body/S/S2/graph-schema]] + [[Body/S/S2/graph-services]]), S3 PAI/Gateway/SpaceTimeDB ([[Body/S/S3/gateway]] + [[Body/S/S3/gateway-contract]] + [[Body/S/S3/epi-spacetime-module]] + [[Body/S/S3/graphiti-runtime]] + [[Body/S/S3/redis-context]]), S4 Claude/agent-SDK ([[Body/S/S4/pi-agent]] + [[Body/S/S4/ta-onta]] + [[Body/S/S4/plugins/pleroma]]), **S5 Notion/canon-promotion + RAG-anything** ([[Body/S/S5/epii-autoresearch-core]] + [[Body/S/S5/epii-review-core]] + [[Body/S/S5/epii-agent-core]] + [[Body/S/S5/epii-agent]] + **[[Body/S/S5/epi-gnostic]] which IS the RAG-anything substrate** — production Python + Graphiti-integrated package with `cli.py`, `graphiti_service.py` (534 LOC), `wrapper.py`, `enrichment/`, `storage/`, `cypher/` queries, `Dockerfile.graphiti`, `uv.lock`, **not a future composition target** — plus [[Body/S/S5/epi-kbase]] + [[Body/S/S5/epi-kbase-core]] as kbase substrate). |
| **M' (Subsystem-Prime / Rendered)** | **Shakti — rendered-surface plane** | Mutable-by-state UI/rendering inside the single Theia shell: M0' Anuttara graph view, M1' Paramaśiva clock instrument, M2' Paraśakti cymatic engine, M3' Mahāmāyā wheel surface, M4' Nara psychoid-field surface, M5' Epii IDE workspace. Each M' surface consumes from the S' kernel + S-stack via the kernel-bridge. |

The M-family (without prime) carries the conceptual-archetypal subsystem identities (M0 Anuttara, M1 Paramaśiva, etc. — the canonical content); the M'-family carries those subsystems' **rendered playable surfaces** in the single Theia shell. The S-family carries the **technology infrastructure** the surfaces consume; the **S' kernel** is the engine substrate the S-family itself rests on.

So S'-kernel-and-S-stack-and-M'-together form the layered Siva-Shakti polarity: **S' kernel is the substrate-of-substrate engine; S supplies the infrastructure stack consuming it; M' surfaces the rendered engagement; together they are Epii's integrated operational unity at M5**. The kernel-bridge (§5) is the seam from S' kernel through S-stack into M' surfaces.

### §1.2 M5-2 = S-family; M5-3 = M'-family; M5-4 = operational-capacities + agentic mediation

The M5 sixfold structure (per `M5'-SPEC.md`) is:

| Sub-coord | Surface | Concrete identity (corrected canon) |
|---|---|---|
| **M5-0** Library / Gnostic Namespace | Documentary holding | Bimba pedagogy + Gnosis library + kbase integration + all subsystem documentation in queryable form. **The RAG-anything substrate IS [[Body/S/S5/epi-gnostic]]** — production Python + Graphiti-integrated package (`epi_gnostic/cli.py`, `epi_gnostic/graphiti_service.py` 534 LOC, `epi_gnostic/wrapper.py`, `enrichment/`, `storage/`, `cypher/` queries, `Dockerfile.graphiti`, `uv.lock`). Not a future composition target. Kbase substrate at [[Body/S/S5/epi-kbase]] + [[Body/S/S5/epi-kbase-core]]. **Smart Connections semantic-input substrate** read via `s1'.semantic.*` over [[Body/S/S1/hen-compiler-core/src/smart_env.rs]] feeds candidate links + neighbours into the gnostic pipeline (per §0.3b and `LinkCandidateResponse` shape). |
| **M5-1** Philosophy / Canon Studio | Theory canon | Epi-Logos philosophy files, worldview docs, foundational instructions, M5-1 developer-conversational mechanism |
| **M5-2** Backend Studio | **= The full S-family stack itself** | S0 (Terminal/kernel/CLI/lib), S1 (Obsidian/vault), S2 (Neo4j/bimba-map), S3 (PAI/Gateway/SpaceTimeDB), S4 (Claude/agent-SDK), S5 (Notion/canon-promotion). M5-2 is NOT a parallel-M-side backend; M5-2 IS Epii's view-into-and-operational-relationship-with the S-stack |
| **M5-3** Frontend Studio | **= The full M'-Theia shell itself** | M0'/M1'/M2'/M3'/M4'/M5' rendered surfaces inside the single Theia shell ([[/pratibimba/system]]), the 0/1 daily layout, the deep IDE layout, the omni-panel command surface, all six individual M-extensions + the two integrated plugins. M5-3 IS Epii's view-into-and-operational-relationship-with the M'-Theia-shell. Existing [[Body/M/epi-tauri]] work (60 TSX + 42 Rust files: clients, stores, M-domain pages, Tauri commands) is inheritance — typed clients become Theia services, M-domain components become contributions in the corresponding M-extensions, Tauri Rust commands either move into a Theia backend extension or reach the existing [[Body/S/S3/gateway]] directly. No work is lost; the architecture redistributes. |
| **M5-4** Agentic Control Room | **= Operational-capacities + Pi/Sophia/Anima/Aletheia + S5/S5' Pi-agent + S0/S0' CLI/library bridges** | The six sibling operational-capacities (Epii-on-Anuttara, Epii-on-Paramaśiva, etc.); the four agent roles (Sophia/Anima/Pi/Aletheia); the autoresearch spine; the bridges into S5/S5' Pi-agent endpoint and S0/S0' CLI/library |
| **M5-5** Logos Atelier | Etymological-archaeology engine | The scent-following method, word constellations, Logos-cycle FSM, archaeological verification work informing Anuttara articulation and all canon-evolution |

The corrected M5-2/3/4 attribution is the key clarification. The six operational-capacity siblings' "M5-2 Backend" and "M5-3 Frontend" sections were implicitly referring to S-stack and M'-Tauri work all along; this canon makes it explicit.

### §1.3 Operational implications

With this clarification:

- **Spec-writing discipline**: when an operational-capacity sibling specifies M5-2 work, it must enumerate the specific S-layer components involved (e.g., Mahāmāya's M5-2 work touches `Body/S/S0/epi-lib/include/m3.h` and `Body/S/S3/epi-spacetime-module/` for federated round coordination). When it specifies M5-3 work, it must enumerate the specific Tauri-app surface(s) involved (e.g., Paraśakti's M5-3 work touches the M2' cymatic-engine extension and the M0' graph-viewer's relational-overlay layer).
- **Architectural discipline**: when designing a new feature, the S-stack home and M'-Tauri home are determined first (these are infrastructure facts); the M5-2/3/4 attribution flows from where the feature lives in those substrates.
- **Reading discipline**: "M5-2 Backend Studio" in any spec means "Epii operating upon the S-stack at this specific point"; "M5-3 Frontend Studio" means "Epii operating upon the M'-Tauri app at this specific point"; "M5-4 Agentic Control Room" means "Epii's agentic-mediation layer linking the above through the operational-capacities".

---

## §2 — Code organisation: `/pratibimba/system` as the Theia shell

### §2.1 Single-directory structure

The repo carries **one shell-product directory**:

- **[[/pratibimba/system]]** — the Theia-based shell codebase (see §4). Holds the Theia application skeleton (`theia-app/` with electron-app and browser-app build targets per Theia conventions), the in-tree extensions tree (`extensions/`), shared cross-extension code (`shared/`), build scripts, and docs. This is the single user-facing artefact; there is no separate Tauri app, no separate lightweight surface product.

The existing `Body/M/epi-tauri` directory remains as **migration source** — its 60 TSX + 42 Rust files (typed service clients, M-domain rendering pages M0_Anuttara through M5_Epii, shell, OmniPanel, command palette, stores, Tauri Rust commands) are inherited into the Theia shell during the migration. After migration the directory's role is historical; the substrate (gateway, kernel, S-stack services) is untouched.

### §2.2 The pratibimba directory framing

The `/pratibimba/` directory name carries the right structural-meaning: pratibimba = reflection/mirror-image. The Theia shell is the **reflective surface** through which the user engages with the canonical bimba-map at depth — it mirrors the system back to the user as a structured engagement environment. The `/pratibimba/system/` sub-directory holds the shell codebase as the *systematic reflection* of the system back to the user.

This is consistent with the C-family ontological framing per CLAUDE.md §IIE: `C5 Pratibimba = Instance/Reflection`. The Theia shell IS a structured instance/reflection-surface; it sits at the pratibimba register architecturally.

### §2.3 One Theia shell, two layout modes, external substrate

The runtime model is:

- The Theia shell launches (Electron-equivalent for primary desktop; browser-mode optionally served by the Node backend for shared/headless deployment).
- The user lands in whichever Theia workspace layout last-used or default-on-fresh-install — typically the **0/1 daily layout** (lightweight: journal, agent check-in, lightweight cymatic, status display, OmniPanel-accessible).
- The user invokes the **deep IDE layout** via the omni panel / command palette / keybinding — Theia switches to the 4+2 workspace layout with M0/M5 IDE chrome, the bimba graph viewer, canon studio, agentic control room, coordinate tree, Logos Atelier, plus access to the six individual M-extensions and the two integrated plugins.
- Switching is **layout-level inside one process**, not surface-to-surface IPC across processes. Theia's existing multi-layout / multi-workspace mechanisms (`Layout Restorer`, `Workspace` service) carry this natively.
- The S-stack (gateway, graph, SpaceTimeDB, S5 cores, Graphiti) runs as **external out-of-process services**, exactly as it does today. Theia's Node backend connects to them via WebSocket / JSON-RPC. The C kernel and Rust portal-core stay behind the existing Rust gateway; the Theia frontend never speaks C or Rust directly — it speaks TS to the Theia Node backend, which speaks RPC to the Rust gateway, which is the substrate-of-substrate.
- Language divergence is therefore **bounded at the substrate boundary**: TS at the shell, Rust + C in the gateway/kernel, Python in the hen-compiler. Theia is explicitly designed for this — see §4.1.

---

## §3 — The single-Theia-shell two-layout-mode model

### §3.1 Layout-mode lifecycle

```
[Theia shell launches]
       ↓
[Workspace state restores OR fresh-install default]
       ↓
   ┌───┴────┐
   ▼        ▼
[0/1 daily layout    [Deep IDE layout
  workspace active]   workspace active]
       ↓                    ↓
       └────────┬───────────┘
                ▼
   [User invokes omni panel / command palette / keybinding]
                ↓
   [Theia Layout Restorer switches workspace layout]
                ↓
   [No process restart, no second app, no IPC across surfaces;
    selected coordinate / session / profile generation persist
    via Theia's workspace state + the kernel-bridge subscription
    cache; the omni panel itself rides the same Theia process]
                ↓
   [User closes Theia (or sends to OS-level dock/menubar
    where the host OS supports background apps)]
```

The lifecycle is **one Theia process, two Theia workspace layouts**. Theia's existing `Layout Restorer` and `Workspace` services carry layout persistence and switching natively. The deep IDE layout takes longer the first time it's invoked (its extensions activate); subsequent switches are warm-cache.

### §3.2 The 0/1 daily layout

The 0/1 layout is the **lightweight daily-use register inside Theia** — the default workspace layout the user lives in day-to-day:

- **0 side** (visual/contemplative engagement):
  - Personal cymatic field rendering (lightweight mode consuming the Track-12 cymatic-engine substrate via Theia frontend contribution; full physics-Option-F mode lives in the deep IDE layout)
  - Agent chat with Nara/Anima (conversational interface via the `epi gate dispatch anima-invoke` CLI bridge; ridden by a Theia frontend contribution)
  - Today's daily-note quick-view (Theia reads the vault file directly via its FS provider; writes go back through `s1'.vault.*` gateway methods → Hen wikilink/path protection)
  - Brief status display (current tick12, planetary state — read from the kernel-bridge subscription)
- **1 side** (writing/expression):
  - Open flow writing space with highlight system (dream / oracle / daily-note / reflection / personal-note / LLM-task / reminder tags) — markdown editor with QL/bimba-coordinate decorations
  - Cron-integrated reminder display
  - Quick journal-entry interface — writes into the vault, surfaces through the Nara write-path with privacy gates

The 0/1 layout is where the user **lives day-to-day**: morning journal, daily reflection, agent check-in, evening contemplation, oracle-cast if needed. It does NOT carry the full IDE complexity — no graph-explorer in full, no canon-studio in full, no deep agentic-orchestration, no integrated 1-2-3 / 4-5-0 plugin surfaces. Those live in the deep IDE layout (§3.3).

### §3.3 The deep IDE layout

The deep IDE layout is the **deep system-work register inside Theia**:

- The full 4+2 architectural depth
- The Theia shell with M0+M5 integrated as IDE chrome (per §4.2)
- The 6 + 2 plugin-app architecture (per §4.3-4.4) accessible by layout selection
- Multi-pane editor, custom bimba-coordinate-tree file-tree provider, command palette, terminal, settings, themes
- Where the user goes when **working ON the system** (developing canon, building subsystem capacities, doing contemplative-archaeological work, exploring deep subsystem state, running autoresearch loops, mediating M5-4 work)

### §3.4 The omni panel as cross-layout access mechanism

The **omni panel** is the canonical Theia command surface — a Spotlight/Raycast-style summonable command palette accessible from anywhere within the Theia shell via global keybinding:

- From the 0/1 layout: omni panel offers deep-IDE-layout-switching commands ("open M3 wheel surface", "open Anuttara graph view", "open agentic control room", "open canon studio")
- From the deep IDE layout: omni panel offers cross-plugin commands, file-search, agentic-engagement actions, switch-back-to-0/1-layout
- Cross-layout: omni panel actions can either fire-in-place (an action handles itself within the current layout) or switch-then-fire (Theia switches workspace layout, then dispatches the action)

Implementation: Theia's existing command/keybinding infrastructure carries this; the omni panel is implemented as a Theia frontend contribution that wraps the existing Command Registry with the Raycast-style UI. No native OS hotkey indirection across processes is needed — the keybinding is the same Theia keybinding wherever the user is in the shell.

The omni panel makes the **one-shell-two-layouts** architecture feel cohesive: the user never has to think about layout state — they invoke omni panel, the right action fires (with a layout switch if needed) inside one continuous process.

---

## §4 — Theia as IDE shell + the 6 + 2 plugin-app architecture

### §4.1 Theia chosen as the IDE shell basis

The IDE surface at `/pratibimba/system` is built on **Theia** (`https://theia-ide.org/`) — the Eclipse-Foundation-backed open-source IDE platform.

Rationale:

- **Purpose-built for forking**: Theia is explicitly designed as a framework for building custom IDEs, unlike VSCode which is a product (with extensions) that happens to be open-source. Forking VSCode requires maintaining a divergence from a fast-moving upstream; Theia's design assumes the fork-and-customise use-case.
- **Modular extension API**: Theia's extension model (both VS Code-compatible extensions AND Theia-native extensions) gives both ecosystem-compatibility AND deeper architectural integration than VSCode's API alone permits.
- **Eclipse Foundation backing**: institutional stability for a 5-10 year horizon.
- **Browser + desktop deployment**: same codebase deploys as desktop app (Electron-equivalent) AND browser-based IDE; useful for future server-rendered or shared-IDE-session use-cases.
- **The Ale-theia name-correspondence**: Aletheia is the disclosure-tracking agent in the M5-4 agentic register (the agent that tracks what becomes visible through articulation). The IDE shell that surfaces canon-development work carries the resonant name-correspondence. Not load-bearing technically; load-bearing aesthetically and pedagogically.

Alternatives considered and not chosen: VSCode-fork (excellent ecosystem but maintenance-cost of staying current with upstream; product-shape rather than framework-shape), Tauri-from-scratch with custom IDE features (full control but reinvents IDE-plumbing investment), Atom/Pulsar (community-driven but smaller and less actively-developed than Theia).

### §4.2 M0 + M5 integrated into the IDE shell itself

M0 (Anuttara) and M5 (Epii) are the **implicate-boundary positions** in the manifestational sequence — both are integrative-substrate registers rather than active-prehending domains. They naturally co-resident as the IDE's *integrated holding-and-development substrate*:

- **M0** holds the canonical content: the bimba-map graph, the Anuttara symbolic substrate, all the symbol+formulation_type properties at the node level, the OWL/SHACL inference layer
- **M5** holds the developmental capacity: the canon studio, the agentic-orchestration, the autoresearch spine, the IDE itself

Both are **what the IDE IS**, not what runs *in* the IDE. Concretely, the IDE shell exposes:

- **Bimba-map graph viewer as primary panel** — a custom webview using react-force-graph (or equivalent) with custom relation-family colouring, lens-rotation animation, pulse-on-world-clock-tick, click-to-inspect interactions. This IS the M0 surface; it's not "an extension you open" — it's part of the IDE's primary chrome.
- **Canon studio as primary editor** — markdown editing with custom decorations for QL/bimba-coordinate syntax, embedded notation rendering, formulation-validation. The canon-document-editing experience is integrated into the IDE's main editor area, not a separate plugin.
- **Agentic control room as side panel** — Sophia/Anima/Pi/Aletheia chat interface, review-inbox, spine-state inspector, deposit-flow controls. Always-available as a sidebar/panel.
- **Custom file-tree provider** — instead of (or alongside) the filesystem tree, a bimba-coordinate-tree showing the M-coordinate hierarchy as the primary navigation structure.
- **Logos Atelier as command-palette + dedicated workspace** — etymological-archaeology operations accessible via command palette; deep archaeological work in a dedicated workspace.

Together these are the IDE's *integrated implicit substrate*. The user opens the IDE and is immediately in an environment where M0 (the canonical bimba-map) and M5 (the developmental capacity) are co-resident affordances.

### §4.3 The 6 individual M-extensions

For pedagogical / exploratory engagement with each subsystem individually, six dedicated extensions:

| Extension | Target | Primary surfaces |
|---|---|---|
| **m0-anuttara** | M0 Anuttara | Anuttara language-map browser, OWL/SHACL inspector, R-virtue contemplative interface, archetypal-number-language explorer (with Kabbalah-Sephiroth parallel renderer) |
| **m1-paramasiva** | M1 Paramaśiva | Clock instrument (lens-mode 84-state landscape, K² topology visualisation, audio-genesis controls, Hopf-bundle inspector at M1-5) |
| **m2-parashakti** | M2 Paraśakti | Cymatic engine, planetary-chakral state, 72-fold correspondence-tree browser, MEF lens matrix, Klein-flip visualiser, Ficinian-Kerykeion routing |
| **m3-mahamaya** | M3 Mahāmāyā | Cosmic wheel (360°/720° SU(2)), codon-tarot navigator, 16+1 lens-stack inspector, three-matrix gauge-trio explorer, Janus-doorway temporal-orientation |
| **m4-nara** | M4 Nara | Personal cymatic field (full deep render), journal/flow with full Graphiti integration, identity inspector, Vāma-śakti contemplation, temporal-reading protocols (daily/weekly/period) |
| **m5-epii** | M5 Epii (meta) | Self-referential surfaces; spine-state inspector; review queue; canon-evolution browser; the recursive Epii-on-Epii engagement |

Each is its own Theia extension (or extension-bundle if granularity demands; see §4.5 on granularity).

The pedagogical/exploratory mode: a user can open the m3-mahamaya extension on its own, explore the codon-tarot navigator without invoking the integrated cosmic-engine plugin. Each extension surfaces its subsystem at depth, with full inspector capabilities and contemplative-engagement affordances. **This is the explorable/pedagogical individual register.**

### §4.4 The 2 integrated plugins (inheriting QL context-frame structure)

Beyond the individual extensions, two integrated plugins render multiple subsystems together. They inherit QL context-frame structure per CLAUDE.md §IIIC:

#### §4.4.A The integrated 1-2-3 plugin (Mod 4 — Three Plus One)

The **integrated 1-2-3 plugin** renders **M1 + M2 + M3 together as the full cosmic-engine substrate surface**. This inherits the QL Mod 4 context frame `(0/1/2/3)` — "Three Plus One: Media, Medium, Method".

What it renders:
- **The full tick-clock-solar-system surface** — M3-5 cosmic wheel with M2-5 planetary-chakral state overlaid with M1 audio-genesis tick driving everything
- **The M1-M2-M3 manifestational sequence visible** — Paramaśiva's toroidal recognition (M1-5) emitting the double-track that becomes Paraśakti's vibrational bridge (M2) and Mahāmāya's binary substrate (M3); the K² × T²_Mahāmāya double-torus at M3-5
- **The 16+1 Mahāmāya lens-stack as holographic backdrop** for the wheel
- **The cymatic field rendered at cosmic scale** (not personal scale — that's the M4 extension; here we see the matheme's standing-wave patterns at the system register)
- **The active (lens, mode) cell and (codon, rotation) state** highlighted in their interconnection
- **The Ficinian-Kerykeion routing visible** as live planetary-hour timing

This is the **system-engine view**: the user sees the live cosmic-engine in its full integrated state, where M1's foundational substrate, M2's vibrational play, and M3's symbolic transcription all operate together as one continuous engine. **This is the active-substrate register the user can contemplate as a unified surface.**

#### §4.4.B The integrated 4/5/0 plugin (Mod 6 — Möbius Return Complete)

The **integrated 4/5/0 plugin** renders **M4 + M5 + M0 together as the user-experience integration surface**. This inherits the QL Mod 6 context frame `(5/0)` — "Total synthesis; Möbius return complete".

What it renders:
- **The user-experience-integration surface** — the user's personal Pratibimba (M4 cymatic field) seen against the canonical Bimba (M0 graph as architectural backdrop) with the canon-evolution/Epii integration (M5) operative
- **The Jiva-is-Śiva recognition surface** (per `m4-prime-psychoid-cymatic-field-engine.md` §18.11) — foreground personal cymatic field + background canonical bimba-map + visible BEDROCK linkage + GDS-rendered activity-resonance making *tat tvam asi* possible to see
- **The Epii city-scape backdrop** as architectural-rendered form of the canonical bimba map (per cymatic-field paper §18.4)
- **The Logos Atelier integration** — when contemplative-archaeological work is in progress, the integration surface shows what's being etymologically uncovered
- **The autoresearch spine state** as visible operational continuity

This is the **user-stack integration view**: M4 (Nara as Jiva) and M0 (Anuttara as canonical ground) and M5 (Epii as Möbius return) rendered as one user-facing register. The architectural punchline is the *5→0 of the app itself*: the user's deep engagement with the system culminates in the recognition that the user-as-Nara IS the canonical bimba (Jiva-is-Śiva), with Epii as the return-vector. **This is the user-experience-integration register the user inhabits when working with the system as a whole.**

### §4.5 Granularity decision: each M as one extension; integrated plugins as bundles

Per user direction:

- **Each MX as one extension** (m0-anuttara, m1-paramasiva, ..., m5-epii). Single extension per subsystem keeps the pedagogical/exploratory affordance clean — one focused entity per subsystem the user can engage with individually.
- **The integrated plugins (1-2-3 and 4/5/0) are larger composed bundles** — they orchestrate the relevant individual extensions plus their integration-specific rendering. The 1-2-3 plugin composes m1-paramasiva + m2-parashakti + m3-mahamaya into the unified cosmic-engine surface; the 4/5/0 plugin composes m4-nara + m5-epii + m0-anuttara into the unified user-experience-integration surface.

The individual extensions can run alone (pedagogical mode); they can also be composed by the integrated plugins (active-substrate / user-experience modes). The composition is structural rather than file-system — the integrated plugins import data and surface-elements from the individual extensions and compose them with integration-specific rendering.

This gives the right granularity: not too fine (cymatic-engine + planetary-chakral + maqam-modal as separate plugins would be too granular) and not too coarse (one big "cosmic" plugin covering M1+M2+M3 would lose the individual pedagogical surfaces).

---

## §5 — The kernel-bridge foundational extension

### §5.1 The structural need

The actual engine of the system is the **C-library substrate** — M1', M2', M3' are real computation at `Body/S/S0/epi-lib/` (the `m0.h` / `m1.h` / `m2.h` / `m3.h` headers and their `.c` implementations). The Tauri app's M'-rendered surfaces consume from this engine.

Every M-extension and integrated-plugin needs access to:
- The live kernel profile (`MathemeHarmonicProfile`)
- Live SpaceTimeDB subscriptions (`world_clock`, `pratibimba_presence`, etc. per `alpha_quaternionic_integration_across_M_stack.md` §11)
- Gateway plane RPC (`s5'.improve.*`, `s5'.review.*`, `s5'.epii.*` per autoresearch spine spec §1)
- Direct kernel-trace data (calculation pathways from M3, audio bus from M1, cymatic-field state from M2, etc.)

Without a unified data-availability layer, each M-extension would re-implement its own kernel/SpaceTimeDB/gateway-bridge code, with all the consistency and maintenance problems that implies.

### §5.2 The kernel-bridge contribution

A **foundational Theia extension** named `kernel-bridge` (or equivalent) is the **first-loaded extension** in the IDE. Its responsibilities:

- **Subscribe to the live kernel profile** via the gateway (one subscription per IDE session)
- **Subscribe to SpaceTimeDB state** (`world_clock`, `pratibimba_presence`, `shared_archetype_event`, `coincidence` — per the spec'd tables at `alpha_quaternionic_integration_across_M_stack.md` §11.5; the WebSocket-shared gateway+SpaceTimeDB surface per §11.3)
- **Provide a unified TypeScript API** that all downstream M-extensions and integrated-plugins consume for kernel/state data
- **Cache and distribute** kernel-data updates to subscribers (using Theia's event-bus or equivalent reactive primitives)
- **Handle reconnection** and state-resync transparently
- **Surface the connection-state** in the IDE status bar so the user knows when kernel/SpaceTimeDB is connected/disconnected/resyncing
- **Provide kernel-command dispatch** for downstream extensions needing to invoke gateway RPCs

The kernel-bridge is structurally **the IDE's M5-2 access point**. Per §1.2 above, M5-2 = the S-stack itself; the kernel-bridge is how M5-3 (the Tauri/IDE frontend) reaches into M5-2 (the S-stack backend) for live data.

### §5.3 The downstream extensions consume from kernel-bridge

Each M-extension declares a dependency on `kernel-bridge` and consumes from it. Example interface (conceptual):

```typescript
// Conceptual; real implementation in concrete Theia extension API
interface KernelBridgeAPI {
  // Live profile subscription
  subscribeMathemeHarmonicProfile(callback: (profile: MathemeHarmonicProfile) => void): Disposable;
  
  // SpaceTimeDB table subscriptions
  subscribeWorldClock(callback: (state: WorldClockState) => void): Disposable;
  subscribePratibimbaPresence(callback: (state: PratibimbaPresenceState) => void): Disposable;
  subscribeSharedArchetypeEvents(callback: (events: SharedArchetypeEvent[]) => void): Disposable;
  
  // Gateway RPC dispatch
  invokeGatewayRpc<T>(method: string, args: any): Promise<T>;
  
  // Kernel-trace access (for Mahāmāyā plugin)
  subscribeKernelTraces(callback: (trace: KernelTrace) => void): Disposable;
  
  // Audio bus access (for Paramaśiva and Paraśakti plugins)
  subscribeAudioBus(callback: (bus: AudioBus) => void): Disposable;
  
  // Cymatic field state (for Paraśakti and Nara plugins)
  subscribeCymaticField(callback: (state: CymaticFieldState) => void): Disposable;
  
  // Connection state
  connectionStatus(): ConnectionStatus;
  onConnectionStatusChange(callback: (status: ConnectionStatus) => void): Disposable;
}
```

Each M-extension (m0/m1/m2/m3/m4/m5) and integrated-plugin (1-2-3, 4/5/0) imports this API and consumes the subset relevant to its rendering needs. The kernel-bridge handles the multiplexing, caching, reconnection, and error-recovery.

### §5.4 The kernel-bridge in the 0/1 surface

The 0/1 daily layout (the lightweight Theia workspace mode) **consumes from the same kernel-bridge** — with a lighter subscription footprint. The 0/1 layout needs:

- Current tick12 and planetary state (for the brief status display)
- Personal Pratibimba state (for the lightweight cymatic-field render)
- Cron-system state (for reminder display)
- Agent-chat dispatch (for Nara/Anima conversation via `epi gate dispatch anima-invoke`)

The 0/1 layout initialises the kernel-bridge with a `lite-mode` subscription set; switching to the deep IDE layout upgrades to the full-mode subscription set. Both subscription modes share the **same kernel-bridge instance** because there is one Theia process — no cross-app IPC, no Tauri-singleton-with-Theia-adapter hybrid, no dual host question. The kernel-bridge is owned by a first-loaded Theia extension whose backend module talks to the external Rust gateway via WebSocket/JSON-RPC.

### §5.5 The kernel-bridge is itself an autoresearch surfacing source

Per the autoresearch spine spec §3.2, observation-pipelines surface improvement candidates. The kernel-bridge is structurally well-positioned to be **the observability layer** for the spine's surfacing-phase:

- Every kernel-trace passing through the bridge can be checked for QL-coherence anomalies
- SpaceTimeDB subscription patterns reveal which subsystem-surfaces are most engaged
- Connection-state issues surface as Epii-on-Epii spine-self-observation events
- Cross-subsystem-relation queries reveal where graph-relational learning would benefit

The kernel-bridge's observation-stream feeds the spine's surfacing-pipelines (per spine spec §3.4 — Aletheia-disclosure pipeline pattern generalised). Per-subsystem surfacing pipelines (Anuttara-construction, Paramaśiva-derivational, etc.) implement specific pattern-detection over the kernel-bridge's observation stream.

---

## §6 — The QL context-frame inheritance pattern

This is worth naming explicitly because it makes the 6 + 2 architecture's structural-correctness visible:

Per CLAUDE.md §IIIC, the QL context frames are:

| Context Frame | QL Mode | Description | App-architecture inheritance |
|---|---|---|---|
| `(00/00)` | Mod % | Receptive Dynamism; Absolute Ground | — |
| `(0/1)` | Mod 2 | Non-dual binary layer | The 0/1 daily Theia workspace layout itself |
| `(0/1/2)` | Mod 3 | The Trika — User, Agent, Code | The conversational-default UX triad |
| `(0/1/2/3)` | Mod 4 | **Three Plus One — Media, Medium, Method** | **The integrated 1-2-3 plugin** (M1 medium + M2 medium + M3 method, against the prior 0 ground) |
| `(4.0/1-4.4/5)` | Mod 4/6 | Fractal doubling; Jung's Quaternity through #4 Lemniscate | The Nara internal nesting #4.4.4.4 |
| `(5/0)` | Mod 6 | **Total synthesis; Möbius return complete** | **The integrated 4/5/0 plugin** (M4 + M5 + M0; the Möbius return enacted as user-experience integration) |

The 6 + 2 plugin architecture is therefore **the QL context-frame structure made app-architectural**:

- **The 6 individual M-extensions** = the six positional manifestations (one per #-position in the M-family)
- **The integrated 1-2-3 plugin** = the QL Mod 4 context frame instantiated as the cosmic-engine substrate
- **The integrated 4/5/0 plugin** = the QL Mod 6 context frame instantiated as the user-experience integration

This is structurally elegant: the app inherits the matheme's own context-frame composition law. The user navigating the IDE moves between individual-pedagogical mode (opening one M-extension), integrated-substrate mode (opening the 1-2-3 plugin), and integrated-experience mode (opening the 4/5/0 plugin) — each move IS a Mod-change in the QL register.

---

## §7 — How this consolidates across existing specs

### §7.1 The recent specs needing updates

- `M5'-SPEC.md` — annotation that M5-2 IS S-family + S' kernel substrate, M5-3 IS the M'-Theia shell, M5-4 IS operational-capacities + agentic mediation (per §1.1, §1.2 above); plus wikilink-weave to the live `Body/S/S5/epi-gnostic`, `Body/S/S5/epi-kbase`, `Body/S/S5/epi-kbase-core`, `Body/S/S5/epii-autoresearch-core`, `Body/S/S5/epii-review-core`, `Body/S/S5/epii-agent-core`, `Body/S/S5/epii-agent` substrates so RAG-anything + kbase integration stays visible
- `M'-SYSTEM-SPEC.md` — annotation of the one-Theia-shell two-layout-mode model (drops the two-surface-two-app language); reference to this canon for the full architecture
- `M'-TAURI-PORT-SPEC.md` — **deprecate or rename**. The Tauri port is no longer the destination architecture; the existing `Body/M/epi-tauri` work is migration source into the Theia shell. Either retitle as `M'-THEIA-SHELL-SPEC.md` and rewrite around Theia, or mark deprecated with a pointer to this canon + Track 05/06 collapse
- The six operational-capacity sibling specs at `epii-operational-capacities/` — light updates making M5-2/3/4 attribution concrete (which S-stack components; which M'-Theia layouts/extensions)
- `m5-prime-autoresearch-self-improvement-loop.md` — annotation that the kernel-bridge is the observability substrate for the spine's surfacing phase; integration-phase mechanism table makes S'-kernel + S-stack attribution explicit
- `m4-prime-psychoid-cymatic-field-engine.md` — annotation that the cymatic field renders in the m4-nara extension within the deep IDE layout; the lightweight render lives in the 0/1 daily layout; both consume from the same Track 12 cymatic engine substrate
- All specs that previously referenced the Tauri-app layout — reference this canon's Theia-only architecture rather than re-articulating the discipline; existing Tauri-app code (`Body/M/epi-tauri`) framed as migration source not destination

### §7.2 Net effect on the spec family

After the updates, the spec family reads consistently:
- This canon-clarification spec is the foundational app-architecture statement
- M5'-SPEC, M'-SYSTEM-SPEC, M'-TAURI-PORT-SPEC inherit from it
- The six sibling capacity specs reference its M5-2/3/4 attribution
- The autoresearch spine spec references its kernel-bridge
- The cymatic field engine spec references its plugin-app placement
- Any new spec touching Tauri/IDE/M5-2/3/4 inherits its canon

The terminology unevenness flagged in the recent coherence-check resolves naturally: by anchoring the M5-2/3/4 attribution to concrete S-stack-and-M'-Tauri identities, the abstract-register hovering disappears.

---

## §8 — Implementation milestones (rough sequencing)

This is suggested ordering, not strict timing. Some milestones can proceed in parallel.

### Milestone 1: Code-structure setup

- Create `/pratibimba/system/` directory structure (Theia monorepo: `theia-app/electron-app/`, `theia-app/browser-app/`, `extensions/`, `shared/`, `docs/`, `scripts/`)
- Initialise Theia application skeleton; Electron is the canonical desktop deployment, browser-mode also built from the same codebase for headless/shared use
- Verify the build produces both the Electron desktop bundle (primary distribution) and the browser-mode artefact (for CI smoke tests + optional shared/headless deployment via Docker per Theia conventions)
- Identify which pieces of `Body/M/epi-tauri` migrate where: typed service clients (`gatewayClient`, `temporalClient`, `graphClient`, `naraClient`, `epiiClient`, `agentExecutionClient`, `kernelProjection`, `vaultClient`, `pratibimbaClient`) become Theia services; M-domain components (`M0_Anuttara`, `M1_Paramasiva`, `M2_Parashakti`, `M3_Mahamaya`, `M4_Nara`, `M5_Epii`, `MPrime_Subsystems`, `WorkspacePanel`, `ClockCosmos`) become contribution components in the matching M-extension; existing Tauri Rust commands (`agents`, `atelier`, `clock`, `gateway`, `graph`, `library`, `oracle`, `temporal`, `vault`) either migrate into Theia backend extensions or reach the existing `Body/S/S3/gateway` directly

### Milestone 2: Kernel-bridge foundational extension

- Implement `kernel-bridge` as the first-loaded Theia extension
- Wire SpaceTimeDB WebSocket subscription (per `alpha_quaternionic_integration_across_M_stack.md` §11.3 — first SpaceTimeDB milestone is the native-WebSocket subscription completion)
- Wire gateway RPC dispatch
- Wire MathemeHarmonicProfile subscription
- Define the KernelBridgeAPI interface and publish to downstream extensions
- Connect 0/1 surface to kernel-bridge in lite-mode

### Milestone 3: IDE shell with M0 + M5 integrated

- Bimba-map graph viewer as primary panel (react-force-graph webview)
- Canon studio markdown editor with QL/bimba-coordinate decorations
- Agentic control room as sidebar (chat with Sophia/Anima/Pi/Aletheia)
- Custom bimba-coordinate file-tree provider
- Omni-panel command surface

### Milestone 4: Omni panel + IDE summon mechanism

- Theia keybinding for omni-panel summoning (no native OS hotkey indirection required — same Theia process)
- Layout-switching commands from omni panel (0/1 ↔ deep IDE) via Theia's Layout Restorer / Workspace service
- Background mode if/when the host OS exposes it (OS-level dock/menubar — Electron makes this available where the platform supports it)
- Cross-layout state sharing — automatic, since both layouts ride the same kernel-bridge subscription cache + Theia workspace state

### Milestone 5: Individual M-extensions (parallel tranches)

- m0-anuttara extension
- m1-paramasiva extension
- m2-parashakti extension
- m3-mahamaya extension
- m4-nara extension (with full cymatic field engine per `m4-prime-psychoid-cymatic-field-engine.md`)
- m5-epii extension (self-referential meta-surface)

### Milestone 6: Integrated 1-2-3 plugin

- Composition of m1 + m2 + m3 extensions
- Full cosmic-engine surface rendering
- Tick-clock-solar-system as unified visualisation
- Ficinian-Kerykeion routing visible

### Milestone 7: Integrated 4/5/0 plugin

- Composition of m4 + m5 + m0 extensions
- User-experience-integration surface
- Jiva-is-Śiva recognition rendering with Epii city-scape backdrop
- Logos Atelier integration

### Milestone 8: 0/1 daily layout completion with lite-mode kernel-bridge

- 0/1 daily Theia workspace layout completes with kernel-bridge lite-mode consumption (status display, lightweight cymatic field via Track 12 substrate, agent chat dispatch via `epi gate dispatch anima-invoke`)
- Cron-system integration for reminders/daily-notes
- Highlight-system tagging integrated with Graphiti deposit path
- Vault read via Theia's filesystem provider against [[/Idea]]; vault writes routed through Hen via gateway `s1'.vault.*` methods so [[Body/S/S1/hen-compiler-core/src/wikilinks.rs]] + the broader hen-compiler-core write surface protect wikilink integrity on rename/move/restructure; semantic neighbours via `s1'.semantic.*` reading [[Body/S/S1/hen-compiler-core/src/smart_env.rs]] over `<vault>/.smart-env/multi/*.ajson`

### Milestone 9: Cross-layout intent routing inside the Theia shell

- 0/1 layout highlights can fire intents that switch to the deep IDE layout at the relevant focus (e.g., tagged "oracle" highlight switches to the deep IDE layout with `m3-mahamaya` extension active at the relevant codon)
- Deep IDE actions can publish back to 0/1 layout (e.g., agentic-suggestion surfaces as a Theia notification visible in the 0/1 layout when the user returns)
- All routing is intra-process via Theia's Command Registry — no deep-link URL scheme across apps needed; the typed `LayoutIntent` carries coordinate, artifact URI, review id, profile generation, privacy class, requested layout/extension

### Milestone 10: Autoresearch spine observability integration

- Kernel-bridge observability stream feeds spine surfacing-pipelines
- Per-subsystem surfacing-pattern detectors implement against kernel-bridge data
- Spine-state inspector renders in IDE M5-4 agentic control room (per `m5-prime-epii-on-epii-self-referential-capacity.md` §5.4)

---

## §9 — Open implementation questions

These are decisions to make during implementation, not philosophical-architectural questions:

1. **Theia version**: which Theia release branch should the fork start from? Pin to a recent stable Theia release for initial development; track upstream with deliberate cadence (e.g., quarterly).

2. **Extension-API approach**: Theia supports both Theia-native extensions (`@theia/core` + InversifyJS DI) and the VS Code Extension API for ecosystem reach. Decision: **Theia-native throughout for the M-extensions + integrated plugins + kernel-bridge + Canon Studio markdown editor + smart-connections-bridge sidebar + vault reach** for deepest architectural coherence. No strategic VS Code Extension API borrows currently committed (the `obsidian-md-vsc` borrow was reversed once research revealed the extension is an Obsidian-app remote-control shim rather than a vault renderer; S1 reach is now filesystem-direct-read + Hen-gateway-write per §0.3a and §1.1). The dual-extension-API capability stays available as an escape hatch for future ecosystem borrows that earn their place.

3. **Custom UI framework within extensions**: extensions can use React (Theia default), Vue, Lit, plain DOM, etc. Recommendation: React for the M-extension surfaces consistent with the migrated `Body/M/epi-tauri` rendering work; allow individual extensions to deviate when their rendering needs justify (e.g., the m2-parashakti cymatic engine + m4-nara personal field both consume the Track 12 cymatic substrate which wants Three.js + react-three-fiber).

4. **Backend service integration pattern**: Theia's Node backend is the JSON-RPC broker between renderer and the OS; it is not the kernel. The canonical pattern for an existing gateway-style Rust service (`Body/S/S3/gateway` already exposes WS + HTTP) is: external Rust process owns its lifecycle; a small Theia backend extension opens a connection to the gateway over local socket / WebSocket and either proxies frames to the renderer or exposes a typed JSON-RPC service to frontend contributions via Theia's `ConnectionHandler` / `WebSocketConnectionProvider`. The Rust gateway stays a standalone supervised process; Theia is a thin TS shell over it. This bounds language divergence at the substrate boundary.

5. **C / language tooling**: Rust editing via rust-analyzer LSP (trivial); C editing via clangd LSP; C/C++ debugging via DAP (gdb/lldb); Python (hen-compiler) via pylsp. C is kept behind the existing Rust wrapper (Body/S/S0/portal-core) rather than FFI-bridged through Node — the Rust wrapper is the cleanest seam between Theia and the C kernel.

6. **State persistence**: kernel-bridge state, workspace state, agentic-conversation history, etc. — use Theia's built-in workspace state + custom state-stores for specialised data; the Rust gateway holds canonical S5 review / autoresearch / session state; the Theia shell holds layout + UI state only.

7. **The Pratibimba directory deeper structure**: `/pratibimba/system/` contains the Theia shell codebase, but the broader `/pratibimba/` directory family might extend to other reflection-surfaces (`/pratibimba/personal/` for personal-Pratibimba data perhaps? — needs decision per privacy-model). Decision deferred to a future organisation-pass.

8. **Plugin/extension publishing model**: extensions developed in-tree at `/pratibimba/system/extensions/` for the first phase (kernel-bridge + ide-shell-m0-m5 + 6 M-extensions + 2 integrated plugins + smart-connections-bridge sidebar contribution + Canon Studio markdown-editor extension with QL/bimba-coordinate decoration + wikilink autocompletion merging explicit-outlink + Smart-Connections-neighbour suggestions); revisit when external plugin contributors become a real consideration.

9. **Optional headless / shared / Docker deployment**: the same Theia codebase builds to both Electron-desktop (primary) and browser-mode-served-by-Node-backend (secondary). The browser-mode build can be containerised per the canonical `theiaide` Docker pattern (used by Gitpod / Eclipse Che / Coder) for CI smoke tests or for shared/headless future deployments. Not blocking; not first-phase.

---

## §10 — What this canon delivers

1. **The M5-2/M5-3/M5-4 trinitarian breakdown is concrete**: M5-2 = S-family stack + S' kernel substrate; M5-3 = M'-Theia shell ([[/pratibimba/system]]); M5-4 = operational-capacities + agentic mediation + bridges to S5 Pi-agent and S0/S0' CLI/library. No more abstract-register hovering.
2. **The kernel moves from inside-S0 to S' level (substrate-of-substrate)**: the C kernel + Rust portal-core engine ([[Body/S/S0/epi-lib]] + [[Body/S/S0/portal-core]]) compute m0–m5 substrate for the whole S-stack and are ontologically prior to S0; S0 is now Terminal/CLI/lib only.
3. **The Siva-Shakti polarity is non-metaphorical at the system register, now triply layered**: S' kernel = substrate-of-substrate (Siva-of-Siva); S = infrastructure-substrate stack (Siva); M' = rendered-surface plane (Shakti) inside the Theia shell. Their integration at M5 is the operational unity.
4. **The app architecture is Theia-only**: one Theia shell ([[/pratibimba/system]]) with two layout modes (0/1 daily layout + deep IDE layout); no Tauri wrapper, no second app, no cross-process IPC for layout switching. Electron is canonical desktop deployment; browser-mode optionally served by the same Theia Node backend for headless/shared/CI use.
5. **The IDE shell basis is committed**: Theia, with the Ale-theia name-correspondence and the practical advantages (purpose-built for forking, dual extension API supporting Theia-native plus VS Code extensions as ecosystem escape-hatch — no strategic borrows committed today, the `obsidian-md-vsc` borrow was reversed once research revealed it as Obsidian-app remote-control rather than a vault renderer; Electron + browser deployment from one codebase; designed as a UI shell over external language/tool processes — so the existing Rust gateway + C kernel + Python hen-compiler + Python epi-gnostic RAG-anything substrate stay where they are; vault reach is filesystem-direct-read + Hen-gateway-write).
6. **The 6 + 2 plugin-app architecture is specified**: six individual Theia M-extensions (one per subsystem) + integrated 1-2-3 plugin (cosmic-engine substrate; QL Mod 4) + integrated 4/5/0 plugin (user-experience integration; QL Mod 6).
7. **M0 + M5 are integrated into the Theia shell itself**: bimba-map graph viewer, canon studio (Theia markdown editor + QL/bimba-coordinate decoration extension + wikilink autocompletion drawing on Smart Connections semantic neighbours + writes-through-Hen for wikilink integrity), agentic control room, custom bimba-coordinate file-tree, Logos Atelier, and the M5-0 Library/Gnostic surface (the RAG-anything substrate IS [[Body/S/S5/epi-gnostic]]; plus [[Body/S/S5/epi-kbase]] + [[Body/S/S5/epi-kbase-core]] kbase + Smart Connections semantic-input via `s1'.semantic.*`) — all parts of the IDE's primary chrome rather than separate plugins.
8. **The kernel-bridge wires the S' kernel substrate through the S-stack into all M' surfaces** — owned by a first-loaded Theia extension whose backend module connects to the external Rust gateway via WebSocket/JSON-RPC; multiplexing, caching, reconnection handling, and the autoresearch spine observability feed all live in one place; both Theia layouts (0/1 lite + deep IDE full) share the same bridge instance because there is one Theia process.
9. **Language divergence stays bounded at the substrate boundary**: TypeScript at the shell (Theia extensions, frontend, services); Rust + C in the gateway + kernel; Python in the hen-compiler. Theia speaks TS to its Node backend, which speaks RPC to the Rust gateway, which is the substrate-of-substrate. No language leaks across the boundary.
10. **The QL context-frame inheritance is structurally visible**: 6 + 2 architecture inherits Mod 4 (`0/1/2/3`) and Mod 6 (`5/0`) context-frame structure as load-bearing architectural-pattern.
11. **The spec family consolidates with consistent terminology**: existing diffusion resolves; downstream specs reference this canon rather than re-articulate; `M'-TAURI-PORT-SPEC.md` deprecates/retitles per §7.1.
12. **The implementation path is articulated**: ten ordered milestones from code-structure setup through cross-layout integration through spine observability.

This is the canonical statement. Downstream work — the implementation-track plan-set at `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/` (with Track 05/06 collapsing into one Theia-shell track and Track 11 PRD-01/02/03 simplifying) — proceeds against this canon.

---

## Sources

### Internal canon
- `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md` — canonical M5' sixfold structure (carries M5-0 Library/Gnostic Namespace wikilinks to [[Body/S/S5/epi-gnostic]] / [[Body/S/S5/epi-kbase]] / [[Body/S/S5/epi-kbase-core]] per §7.1 propagation)
- `Idea/Bimba/Seeds/M/M5'/m5-prime-autoresearch-self-improvement-loop.md` — autoresearch spine spec
- `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/` — six sibling capacity specs
- `Idea/Bimba/Seeds/M/M4'/m4-prime-psychoid-cymatic-field-engine.md` — M4 cymatic field engine + 0/1 + 4+2 layout discipline (consumed by Track 12 Cymatic Engine Substrate)
- `Idea/Bimba/Seeds/M/alpha_quaternionic_integration_across_M_stack.md` — α-quaternionic integration + SpaceTimeDB at S3' + WebSocket-shared gateway
- `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md`, `M'-PORTAL-SPEC.md` (M'-TAURI-PORT-SPEC deprecated per §7.1 — migration source not destination)
- `Idea/Bimba/Seeds/S/S5/S5-SPEC.md` — S5 master spec
- Live S' kernel + S-stack: [[Body/S/S0/epi-lib]] (12,160 LOC C kernel), [[Body/S/S0/portal-core]] (~4,500 LOC Rust mirror), [[Body/S/S2/graph-schema]] + [[Body/S/S2/graph-services]] (~15,800 LOC), [[Body/S/S3/gateway]] + [[Body/S/S3/gateway-contract]] + [[Body/S/S3/epi-spacetime-module]] + [[Body/S/S3/graphiti-runtime]], [[Body/S/S4/pi-agent]] + [[Body/S/S4/ta-onta]] + [[Body/S/S4/plugins/pleroma]], [[Body/S/S5/epii-autoresearch-core]] + [[Body/S/S5/epii-review-core]] + [[Body/S/S5/epii-agent-core]] + [[Body/S/S5/epii-agent]] + [[Body/S/S5/epi-gnostic]] + [[Body/S/S5/epi-kbase]] + [[Body/S/S5/epi-kbase-core]]
- `Body/M/epi-tauri/` — Theia migration source (60 TSX + 42 Rust files: typed clients, M-domain components, Tauri Rust commands, stores, shell, OmniPanel)
- `CLAUDE.md` §II-VI — coordinate architecture, context frames, Siva-Shakti polarity, memory arenas
- `docs/superpowers/plans/2026-05-22-vak-as-operational-substrate.md` — completed VAK substrate work (10 chips closed; three-way parity test-locked); see `Body/S/S4/plugins/pleroma/capability-matrix.json` as canonical agent-tool governance authority

### External
- Theia IDE: `https://theia-ide.org/`, `https://github.com/eclipse-theia/theia`, Theia docs at `https://theia-ide.org/docs/`
- Theia Docker reference: `theiaide` Docker Hub images + `https://github.com/eclipse-theia/theia-apps` (browser-mode containerisation pattern used by Gitpod / Eclipse Che / Coder)
- Aletheia (the agent name): the disclosure-tracking agent in M5-4 register
- SpaceTimeDB native WebSocket subscription path: live at [[Body/S/S0/epi-cli/src/gate/spacetimedb_bridge.rs]] (first SpaceTimeDB milestone per spine spec §11.7)

---

End of canon-clarification spec. Downstream work proceeds through the implementation-track plan-set at `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/` — Track 05/06 collapsing into one Theia-shell track, Track 11 PRD-01/02/03 simplifying, Track 01 carrying the kernel-as-S'-substrate framing, M5'-SPEC carrying the wikilink-weave to the M5-0 Library / RAG / kbase substrate.
