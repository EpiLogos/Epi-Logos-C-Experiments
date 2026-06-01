# M-Dev Context Pack - 02.T7

Generated: 2026-06-01T17:18:20.941Z

## Task

- **ID:** 02.T7
- **Title:** Coordinate-native graph API parity
- **Track:** 02-s2-bimba-map-population.md
- **Computed status:** ready
- **Write scopes:** Body/S/S2/**

## Required Reading

Read these before implementation. Do not rely on the tranche summary alone.

- `Body/S/S2/external/bimba-mcp/`
- `Body/S/S2/graph-schema/src/lib.rs`
- `Body/S/S2/graph-services/src/dataset_import.rs`
- `Body/S/S2/graph-services/src/graph_api.rs`
- `Body/S/S2/graph-services/src/seed.rs`
- `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md`
- `Idea/Bimba/Seeds/M/M'-TAURI-PORT-SPEC.md`
- `Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md`
- `Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md`
- `Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md`
- `Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md`
- `Idea/Bimba/Seeds/M/M4'/M4'-SPEC.md`
- `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md`
- `Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md`
- `Idea/Bimba/Seeds/S/S2/S2-SPEC.md`
- `docs/datasets`
- `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/02-s2-bimba-map-population.md`
- `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/11-open-architectural-decisions.md`
- `docs/specs/S/S2-S2i-GRAPH.md`

## Dependency Context

- 02.T6 - GDS baseline projections and tangent overlays (gated by T2/T4) (02-s2-bimba-map-population.md)

## Track Source Specs

- [[m5-prime-system-shape-and-tauri-ide-canon]] - `Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md`, especially "Section 1.2 M5-2 = S-family; M5-3 = M'-family; M5-4 = operational-capacities + agentic mediation", "Section 4.2 M0 + M5 integrated into the IDE shell itself", "Section 5.2 The kernel-bridge contribution", "Section 8 Implementation milestones", and "Section 9 Open implementation questions". Load-bearing commitment: M5-2 is the full S-stack, M5-3 is the Tauri/Theia app, and M5-4 is the operational-capacity/agentic mediation layer.
- [[S2-SPEC]] - `Idea/Bimba/Seeds/S/S2/S2-SPEC.md`, especially "Status", "Current code reality", "Planning consequence", "A. S2 - Graph Body Base Technology", "B. S2' - QL Augmentation", "C. Cross-References", "Gaps", and "D. Key Architectural Decisions". Load-bearing commitment: S2 is raw Neo4j/graph/cache substrate; S2' is coordinate-aware graph/retrieval law.
- [[S2-S2i-GRAPH]] - `docs/specs/S/S2-S2i-GRAPH.md`, especially "Architectural Role", "S2' Neosemantics, GDS, And Topology Contract", "Implementation Plan / Phase 8: n10s / GDS / Topology Enrichment", and "Verification Additions". Load-bearing commitment: every semantic vector is coordinate-anchored, n10s/OWL and GDS are graph law rather than UI garnish, and tests must prove real Neo4j/GDS behavior.
- [[M'-SYSTEM-SPEC]] - `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md`, especially "Domain Language", "Canonical 0/1/4+2 Layout Discipline", "Minimum Live Loop", "Neo4j / Graphiti Boundary", and "Minimum Evolutionary Basis". Load-bearing commitment: M' reflects the M/Bimba topology without becoming a parallel coordinate system; Neo4j is canonical coordinate topology and Graphiti is episodic/protected memory.
- [[M0'-SPEC]] - `Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md`, especially "Backend Contract Consumed", "Anuttara As Pre-Math Node Language", "Section M0'-3 Graph-Inference-GDS Delta", and "Readiness / Test Criteria". M0' needs S2 node facts, `symbol`/`formulation_type` provenance, OWL/SHACL/GDS readiness, and legacy `#` to M-family resolution.
- [[M1'-SPEC]] - `Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md`, especially "Section 3 Backend Contract Consumed", "Section 13.1 Profile-to-Performance Stream", and "Section 14 Readiness / Test Criteria". M1' needs typed S2 relation traversal and harmonic pointer relation descriptors.
- [[M2'-SPEC]] - `Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md`, especially "Section 3 Backend Contract Consumed", "Section 9.6 Routing Traces as Epii Learning Evidence", and "Section 10 Readiness / Test Criteria". M2' needs S2-governed correspondence provenance and graph-relational evidence without renderer constants.
- [[M3'-SPEC]] - `Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md`, especially "Section 2 Backend Contract Consumed", "Section 7 The 472-State Modal-Inversion Landscape", and "Section 8.14 App Surface and Pipeline Hooks". M3' needs the graph/wheel surfaces to share canonical Neo4j substrate and backend-supplied symbolic/profile provenance.
- [[M4'-SPEC]] - `Idea/Bimba/Seeds/M/M4'/M4'-SPEC.md`, especially "Backend Contract Consumed", "Section 6.7 Cross-M Interface Seams And Promotion Law", "Section 7.11 Day Episodes, Artifact Graph, And Temporal Trajectory", and "Section 8 Readiness / Test Criteria". M4' needs public S2 coordinate anchors without leaking protected Nara/Graphiti bodies.
- [[M5'-SPEC]] - `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md`, especially "Graph Namespace Model", "Backend Contract Consumed", "Relationship To Portal 0/1 And The 4+2 Layer", and "Readiness / Test Criteria". M5' needs namespace-aware graph access across `bimba`, `gnosis`, `etymology`, and governed protected handles.
- [[M'-TAURI-PORT-SPEC]] - `Idea/Bimba/Seeds/M/M'-TAURI-PORT-SPEC.md`, especially "0-Side Graph Affordance", "Port Architecture", "Harmonic Profile Architecture Amendment", "Graphiti And S2 Graph Boundary", "Current-State Gap Table", and "Testing Contract". M5-3 needs S2-backed graph clients, profile/pointer anchors, and real local service tests.
- Current implementation surface: `Body/S/S2/graph-schema/src/lib.rs` owns the schema constants, property registry, relationship registry, constraints, indexes, vector index, and compatibility law; `Body/S/S2/graph-services/src/seed.rs` owns coordinate-space seeding; `Body/S/S2/graph-services/src/dataset_import.rs` owns `docs/datasets` imports; `Body/S/S2/graph-services/src/graph_api.rs` owns parameterized graph methods, pointer-web refresh, and kernel-resonance writes; `Body/S/S2/external/bimba-mcp/` remains the external MCP-facing graph interface.

## Task Body

8. **T7 - Coordinate-native graph API parity.**
   Deliverables: make the Rust S2 graph-service methods and S0 `epi graph` adapter line up with the canonical API names; expose `s2.graph.query`, `s2.graph.node`, `s2.graph.traverse`, `s2.graph.pointer_web.compute`, `s2.graph.pointer_web.refresh`, `s2'.coordinate.resolve`, `s2'.retrieve`, `s2'.rerank`, and `s2'.enrich` through the chosen gateway boundary; include source/spec/code/test anchors, pointer-web descriptors, ontology readiness, GDS overlay handles, disclosure density, and namespace in response envelopes.
   Verification: live API tests use Neo4j data seeded and imported by T3/T4; coordinate resolution, node lookup, relation traversal, GraphRAG retrieval, hybrid rerank, and enrichment all return real graph data with provenance; raw Cypher remains parameterized and read-only by default; M5-4 retrieval tests show Anima/Pi/Aletheia/Sophia can request coordinate pools without calling `bimba-mcp` as an internal dependency.

## Track Open Decisions

- Should production seed relationships expand the schema registry to include current seed relation types, or should `seed.rs` migrate to the smaller canonical relation set? Current tests intentionally reject ad hoc relationship types, while current seed code emits several unregistered graph-structural relationships.
- What is the exact canonical handling of the root `#` node after `#0..#5` map into `M0..M5`? Current code preserves a `#` seed root while import/API migration paths convert `#` to `M`; this must be made explicit before dataset population is treated as canonical.
- Which property names are canonical for Anuttara language fields: public aliases (`symbol`, `formulation_type`, `complete_formulation`) or coordinate-prefixed registry keys (`c_1_symbol`, `c_1_formulation_type`, `c_1_complete_formulation`)? M0' can display aliases, but S2 must own the storage/provenance contract.
- Will the local Neo4j topology include n10s and GDS in the same service used by engineers, or should ontology/GDS run in optional profiles? The plan assumes doctor can report `blocked` honestly when plugins are absent.
- Does S2 persist GDS outputs as derived nodes/properties, return them as ephemeral API overlays, or both? Canon says recommendations must not become canonical relations automatically.
- When does Option 3 GDS enrichment supersede Option 1, and what evidence is required? Build Option 1 first unless a later canon decision changes the privacy boundary.
- Which topology approach is production for non-orientable traversal: Approach A coordinate-duplication/preprocessing, or deferred B/C graph modeling? Build Approach A first unless contradicted by a companion architecture decision.
- Is `bimba-mcp` staying purely external/MCP-facing, or must it be refactored to consume the Rust S2 graph-service contract to avoid divergent coordinate parser/schema behavior? Current TS parser still documents `#` syntax as deprecated/invalid, while Rust resolves `#` intentionally.
- What is the destructive rebuild policy for local/dev graph population? Engineers need a safe, explicit path for wiping test-owned graph data without risking shared or user data.
- What exact Graphiti/pratibimba handles may appear in S2 responses before S5 review? The line between public safe handles and protected-local episode data must be encoded before M5-4 agent retrieval is enabled.

## Decision Register Excerpt

| ID | Decision | Category | Primary affected tracks |
| --- | --- | --- | --- |
| UFV-01 | Privacy and consent copy | User-final validation | 04, 05, 06, 07, 08 |
| UFV-02 | User-final validation threshold for recursive or corpus-affecting changes | User-final validation | 04, 05, 07, 08 |
| UFV-03 | Menubar/background lifecycle semantics | User-final validation | 05, 06, 08 |
| UFV-04 | Daily-flow review interruption and default lightweight agent | User-final validation | 04, 06, 07, 08 |
| PRD-01 | ~~Theia browser-mode in Tauri versus local-server/Electron fallback~~ **Resolved: Theia-only, Electron-primary (no Tauri wrapper)** | Resolved | — |
| PRD-02 | ~~Single-webview navigation versus multi-webview persistence~~ **Resolved: Theia Layout Restorer / Workspace service handles layout switching inside one process** | Resolved | — |
| PRD-03 | ~~Kernel-bridge host boundary~~ **Resolved: first-loaded Theia extension; backend module connects to external Rust gateway via WS/JSON-RPC** | Resolved | — |
| PRD-04 | Theia extension API, version, package manager, and build composition | Prototype-resolved | 05, 07, 08 |
| IOD-01 | S3 single WebSocket surface: physical multiplexing versus app-level manager | Implementation-owner | 01, 03, 05, 06, 07, 08 |
| IOD-02 | SpaceTimeDB auth/RLS and privacy discipline | Implementation-owner | 03, 04, 05, 06, 08 |
| IOD-03 | `world_clock` source of truth and cadence | Implementation-owner | 01, 03, 05, 06, 08 |
| IOD-04 | Profile versioning and `binary`/`mahamaya` compatibility | Implementation-owner | 01, 05, 06, 07, 08 |
| IOD-05 | S2 canonical `#` root mapping | Implementation-owner | 02, 05, 06, 07, 08 |
| IOD-06 | Anuttara field naming and provenance contract | Implementation-owner | 02, 04, 05, 07, 08 |
| IOD-07 | n10s/GDS packaging and GDS output persistence | Implementation-owner | 02, 05, 07, 08 |
| IOD-08 | Graphiti runtime boundary | Implementation-owner | 02, 03, 04, 05, 06, 08 |
| IOD-09 | S5 state storage and `ReviewSource` metadata | Implementation-owner | 04, 05, 06, 07, 08 |
| IOD-10 | Deep-link URI grammar and intent acknowledgement | Implementation-owner | 05, 06, 07, 08 |
| IOD-11 | Shell chrome versus individual extension ownership | Implementation-owner | 05, 07, 08 |
| IOD-12 | Observability schema ownership | Implementation-owner | 01, 04, 05, 06, 07, 08 |
| IOD-13 | Nara vault/write service ownership | Implementation-owner | 03, 04, 05, 06, 07, 08 |
| IOD-14 | Plugin activation, composition, and mini-mode model | Implementation-owner | 05, 07, 08 |
| IOD-17 | `capability-matrix.json` as canonical agent-tool governance authority | Implementation-owner | 01, 04, 09 |
| DSD-01 | Live local-service harness and CI sequencing | Dependency and sequencing | 01, 02, 03, 04, 05, 06, 07, 08 |
| DSD-02 | Track 01-04 contract readiness before UI hardening | Dependency and sequencing | 05, 06, 07, 08 |
| DSD-03 | Non-dry-run promotion waits for compiler mutation law | Dependency and sequencing | 04, 05, 07, 08 |
| DSD-04 | SpaceTimeDB schema source, migration, and table compatibility | Dependency and sequencing | 01, 03, 05, 06, 08 |
| DSD-05 | Protected Nara/Graphiti substrate before M4 and 4/5/0 readiness | Dependency and sequencing | 02, 03, 04, 06, 07, 08 |
| DSD-06 | M2/M3 authority payload readiness before full 1-2-3 readiness | Dependency and sequencing | 01, 02, 07, 08 |
| DCC-01 | M0 versus M1 `+1` attribution | Deferred canon contradiction | 07, 08, M5' canon |
| DCC-02 | M3 `16+1` / "17th lens" language | Deferred canon contradiction | 07, 08 |
| DCC-03 | M2 planet count and Earth-observer semantics | Deferred canon contradiction | 07, 08 |
| DCC-04 | M4 identity quaternion naming, axis order, and 0/1 polarity | Deferred canon contradiction | 06, 07, 08 |
| DCC-05 | Audio bus and cymatic derivation ownership wording | Deferred canon contradiction | 01, 07, 08 |
| DCC-06 | Alpha section cross-reference drift | Deferred canon contradiction | 07, 08 |

### UFV-01 - Privacy and consent copy

- **Question:** What exact user-facing language explains protected-local data, derived handles, opt-in shared archetype events, audio playback consent, private projection blocks, and review visibility?
- **Why it matters:** Tracks 06 and 08 can only enforce privacy if users understand what is local, what is shared as an opaque handle, and what is explicitly published.
- **Affected tracks:** 04, 05, 06, 07, 08.
- **Options:** Minimal technical labels in readiness UI; full consent copy in `/body` plus Theia; staged consent with short prompts and inspectable detail panes.
- **Recommended default if safe:** Staged consent: concise default copy in `/body`, detailed reviewable privacy explanation in Theia/M5, and no shared archetype publishing or protected-open action without explicit user action.
- **Validation path:** Privacy-copy review by the user; UI tests that block publishing without consent; privacy audit over Tauri events, SpaceTimeDB rows, S2 payloads, S5 DTOs, observability events, workspace state, and DOM text.
- **Consequence of delaying:** M4, 4/5/0, shared archetype, audio, and review surfaces must remain in blocked or local-only mode even if backend contracts are available.

### UFV-02 - User-final validation threshold for recursive or corpus-affecting changes

- **Question:** When do Paraśakti embedding retrains, Paramaśiva corpus refreshes, Anuttara grammar changes, Mahāmāyā runtime-learning updates, Nara voice/corpus shifts, and Epii-on-Epii recursive changes require explicit user-final validation?
- **Why it matters:** S5 can encode gates, but only a user-final policy can say which changes are routine maintenance and which are canon-, identity-, or governance-affecting.
- **Affected tracks:** 04, 05, 07, 08.
- **Options:** Require human validation for all non-read-only changes; require it only for promotion/mutation; require it by target-specific risk class.
- **Recommended default if safe:** Use target-specific risk classes with a conservative rule: any recursive self-modification, deployment gate, protected-personal corpus change, canon publication, or model/profile behavior change that affects future outputs requires human approval.
- **Validation path:** S5 tests proving agents may defer but cannot approve/reject/revise/promote human-required items; review fixtures for each target subsystem; user acceptance of the gate taxonomy.
- **Consequence of delaying:** S5 dry-run promotion can exist, but operational M5-4 actions must stay read-only or deposit-only.

### UFV-03 - Menubar/background lifecycle semantics

- **Question:** What should close, quit, sleep, wake, auto-start, notification permission, global hotkey conflict, crash recovery, and "IDE closed but `/body` lives" mean to the user?
- **Why it matters:** The one-app/two-surface law depends on user trust that the app is neither secretly running too much nor losing session state when the IDE is summoned or dismissed.
- **Affected tracks:** 05, 06, 08.
- **Options:** Always quit on close; minimize to tray by default; ask once and persist preference; expose explicit "sleep app" and "quit app" commands.
- **Recommended default if safe:** Ask once on first close after IDE summon, persist the preference, and always expose visible connection/readiness state plus explicit sleep and quit commands.
- **Validation path:** Desktop e2e for close/foreground/background/wake flows; bridge subscription upgrade/downgrade tests; reconnect tests after gateway/SpaceTimeDB restart while backgrounded.
- **Consequence of delaying:** Track 06 T7 and deep-link/session continuity cannot be finalized, and multi-webview behavior remains only a prototype claim.

### UFV-04 - Daily-flow review interruption and default lightweight agent

- **Question:** Which actor appears in Shell `1` by default, and which review alerts interrupt daily flow versus staying passive?
- **Why it matters:** `/body` must not imply an agent governance model that S5 has not implemented, and review notifications can become either useful safety signals or ambient noise.
- **Affected tracks:** 04, 06, 07, 08.
- **Options:** Default to Nara; default to Anima; default to Epii; use a neutral "agent check-in" affordance that routes after S5/gateway context is known. Alerts may be all passive, priority-based, or always interrupting for human-required gates.
- **Recommended default if safe:** Neutral "agent check-in" entry with S5-routed actor resolution, and priority-based alerts where human-required/security/privacy/deployment gates can interrupt while routine evidence stays passive.
- **Validation path:** S5 DTO tests for alert category/priority; `/body` UX tests for passive versus interrupting alerts; human-gate tests proving no agent approval affordance appears for human-required reviews.
- **Consequence of delaying:** Shell `1` can show safe review counts and readiness, but should not expose default agent promises or interruption behavior as final UX.

### PRD-01 - ~~Theia browser-mode in Tauri versus local-server/Electron fallback~~ **RESOLVED**

- **Resolution:** Theia-only as THE shell. No Tauri wrapper. Electron is canonical desktop deployment (confirmed by Theia documentation and ecosystem reference architectures — Gitpod, Eclipse Che, Coder); browser-mode is built from the same Theia codebase and optionally containerised per the canonical `theiaide` Docker pattern for headless/CI/shared deployment. Decision recorded in `m5-prime-system-shape-and-tauri-ide-canon.md` §0 thesis points 2-3, §2-§3.
- **What this collapses:** Tauri composition prototype (Track 05 T2); single-vs-multi-webview question across surfaces (PRD-02); kernel-bridge host hybrid question (PRD-03); CSP-in-Tauri-webview verification; deep-link URL-scheme cross-app routing.
- **What remains:** Electron build configuration (electron-builder for Squirrel/AppImage/dmg distributions); optional Docker browser-mode build for CI; the strategic VS Code Extension API borrow for `obsidian-md-vsc` per IOD-17.

### PRD-02 - ~~Single-webview navigation versus multi-webview persistence~~ **RESOLVED**

- **Resolution:** Obviated by PRD-01. Single Theia process, two workspace layout modes (0/1 daily + deep IDE), switched via Theia's built-in `Layout Restorer` / `Workspace` service. No cross-webview persistence problem because there's no webview-across-apps split. Inside the deep IDE layout, Theia handles its own multi-pane / multi-editor / multi-window UX natively.

### PRD-03 - ~~Kernel-bridge host boundary~~ **RESOLVED**

- **Resolution:** Kernel-bridge is a first-loaded Theia extension. Its frontend module publishes `KernelBridgeAPI` through Theia DI to all M-extensions and integrated plugins. Its backend module connects to the external [[Body/S/S3/gateway]] Rust process via WebSocket/JSON-RPC (the canonical Theia pattern for backend services — same as every LSP integration). Both the 0/1 daily layout and the deep IDE layout share the same bridge instance because there is one Theia process. The Rust gateway is the substrate-of-substrate and stays where it is; the bridge is the thin TS proxy.
- **What this resolves:** No Tauri-singleton hybrid; no cross-process subscription multiplexing; no `/body`-vs-Theia bridge-host ambiguity; one subscription source fans out via Theia DI inside one process. Language divergence stays at the substrate boundary (TS at shell, Rust + C in gateway/kernel).

### PRD-04 - Theia extension API, version, package manager, and build composition

- **Question:** Which Theia release, extension API style, package manager, and Tauri build composition are production for `/pratibimba/system`?
- **Why it matters:** All six individual extensions and two integrated plugins depend on a stable build and contribution model before package skeletons, activation tests, and CI can be meaningful.
- **Affected tracks:** 05, 07, 08.
- **Options:** Recent stable Theia with Theia-native extensions; VS Code Extension API for compatibility; Yarn workspaces per Theia convention; `pnpm` per repo convention; isolated package manager; bundled static assets or supervised local server.
- **Recommended default if safe:** Recent stable Theia, Theia-native extensions for `kernel-bridge` and M surfaces, in-tree `Idea/Pratibimba/System/extensions`, and a package-manager choice made by the Tauri/Theia prototype rather than assumed.
- **Skill-vs-tool invariant (from VAK-as-Operational-Substrate landing):** Within the agent-capability layer (`Body/S/S4/plugins/pleroma/capability-matrix.json`), `vak_profile` is a skill-level concept: every `skills[]` entry has a matching `skills/<name>/SKILL.md` directory enforced by `test_matrix_maps_real_agents_skills_and_hooks`. `dispatch_tools[]` entries are tools not skills and carry no `vak_profile`. Theia extensions hosting skills (under `Idea/Pratibimba/System/extensions/*/skills/*/SKILL.md`) inherit this invariant; new agent capabilities added through Theia extensions must respect skill-vs-tool distinction at matrix-authoring time. See `IOD-17` for the broader governance authority.
- **Validation path:** Build `kernel-bridge` plus `m0-anuttara` as Theia-native slices; verify workbench command/layout service activation; record Theia version/package manager/update cadence ADR; verify any Theia-extension-hosted skills respect the skill-vs-tool invariant via the live `test_matrix_maps_real_agents_skills_and_hooks` check.
- **Consequence of delaying:** Track 07 package inventory and Track 08 composition contracts remain abstract and cannot be enforced by static checks.

## Execution Guidance

- Default to in-session execution unless the user explicitly requested subagents for this run.
- If subagents are used, give each subagent this context pack plus the exact source files it must read.
- Before editing code, verify the relevant source/spec files above have actually been read or searched for the sections cited in the plan.
- Verification must exercise real functionality; mock-only or placeholder proof does not satisfy the ledger.
