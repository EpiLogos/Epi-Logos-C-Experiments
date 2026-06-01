# M-Dev Context Pack - 04.T7

Generated: 2026-06-01T21:43:54.830Z

## Task

- **ID:** 04.T7
- **Title:** M5-3 IDE/Workbench Contract Surface
- **Track:** 04-s5-autoresearch-and-review-extension.md
- **Computed status:** ready
- **Write scopes:** Body/S/S5/**

## Required Reading

Read these before implementation. Do not rely on the tranche summary alone.

- `Body/S/S5/`
- `Body/S/S5/epii-agent-core/src/lib.rs`
- `Body/S/S5/epii-agent-core/tests/`
- `Body/S/S5/epii-autoresearch-core/src/lib.rs`
- `Body/S/S5/epii-autoresearch-core/tests/`
- `Body/S/S5/epii-review-core/src/lib.rs`
- `Body/S/S5/epii-review-core/tests/`
- `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-anuttara-language-development.md`
- `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-epii-self-referential-capacity.md`
- `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-mahamaya-process-reward-rl.md`
- `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-nara-qlora-dialogic-voice.md`
- `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-paramasiva-ql-cpt-and-rag.md`
- `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-parashakti-graph-relational-ml.md`
- `Idea/Bimba/Seeds/M/M5'/m5-prime-agentic-ide-research.md`
- `Idea/Bimba/Seeds/M/M5'/m5-prime-autoresearch-self-improvement-loop.md`
- `Idea/Bimba/Seeds/S/S5/S5-SPEC.md`
- `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/04-s5-autoresearch-and-review-extension.md`
- `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/11-open-architectural-decisions.md`
- `docs/specs/S/S5-S5i-SYNC.md`
- `src/inbox.rs`
- `src/recompose.rs`

## Dependency Context

- 04.T6 - Epii Agent-Access and M5-4 Mediation Surface (04-s5-autoresearch-and-review-extension.md)

## Track Source Specs

- [[m5-prime-autoresearch-self-improvement-loop.md]] at `Idea/Bimba/Seeds/M/M5'/m5-prime-autoresearch-self-improvement-loop.md`: §1.1 "Live Rust cores at `Body/S/S5/`"; §2 "The spine's four operational phases"; §3.2 "The six surfacing pipelines"; §3.3 "The candidate-improvement record shape"; §4.1-§4.5 target/vector routing taxonomy; §5.1-§5.4 orchestration handoff and state model; §6.1-§6.4 integration and Hen residency; §7.2-§7.3 continuity; §8 promotion-destination type system; §11 open spec gaps; §13 implementation milestones.
- [[m5-prime-agentic-ide-research.md]] at `Idea/Bimba/Seeds/M/M5'/m5-prime-agentic-ide-research.md`: "M5' IDE Operational Surface Summary"; "Graph Namespace/File/Code/Agent Integration Model"; "Agentic Safety/Review/Promotion Flow"; "Implementation/Test Implications"; "Open Research Questions". This defines the M5-3 workbench contract that must consume real S5 review/autoresearch state.
- [[m5-prime-epii-on-anuttara-language-development.md]] at `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-anuttara-language-development.md`: §4 M5-2 OWL/SHACL/n10s construction; §5 M5-3 language inspector and trace rendering; §6 Sophia/Anima/Pi/Aletheia review workflow; §11 first-tranche construction, trace API, user-final validation.
- [[m5-prime-epii-on-paramasiva-ql-cpt-and-rag.md]] at `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-paramasiva-ql-cpt-and-rag.md`: §4 M5-2 CPT/RAG/GDS pipeline; §5 M5-3 corpus/checkpoint surfaces; §6 Sophia + Epii co-review; §11 corpus assembly, synthetic-proof, hot-reload, cross-subsystem trigger trajectories.
- [[m5-prime-epii-on-parashakti-graph-relational-ml.md]] at `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-parashakti-graph-relational-ml.md`: §4 M5-2 KGE/R-GCN/GDS/Lens-LoRA pipeline; §6 embedding-quality metrics; §7 M5-4 deployment workflow and autoresearch triggers; §12 first-tranche construction, Lens-LoRA, dashboard, topology-handling trajectories.
- [[m5-prime-epii-on-mahamaya-process-reward-rl.md]] at `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-mahamaya-process-reward-rl.md`: §4 M5-2 process-reward RL/federated/genetic/GDS/SHACL integration; §5 M5-3 pipeline monitors; §6 M5-4 governance, autoresearch routing, tier asymmetries; §11 pipeline, federation, synthesis, runtime-integration trajectories.
- [[m5-prime-epii-on-nara-qlora-dialogic-voice.md]] at `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-nara-qlora-dialogic-voice.md`: §4 M5-2 QLoRA/DPO/eval/inference path; §5 M5-3 curator surfaces; §6 Anima-primary mediation and five Anima gates; §10 autoresearch-spine triggers and anti-frequency-bias; §12 delivered constraints.
- [[m5-prime-epii-on-epii-self-referential-capacity.md]] at `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-epii-self-referential-capacity.md`: §4.1.C S5 review/autoresearch infrastructure; §4.3 autoresearch spine shape; §5.4 spine-state inspector; §6 recursive review loops and user-validation gate; §11 first-tranche construction, recursive protocols, pattern detection.
- [[S5-SPEC.md]] at `Idea/Bimba/Seeds/S/S5/S5-SPEC.md`: §A S5 services and current implementation state; §B `s5'.improve.*`, `s5'.epii.*`, and `s5'.review.*`; "Envelope Fields Populated"; "S5'Cx Projection"; "Current Implementation State"; "Gaps"; "Key Architectural Decisions". This is the authority for S5/S5' method families and the current live-core status.
- [[S5-S5i-SYNC.md]] at `docs/specs/S/S5-S5i-SYNC.md`: "Architectural Role"; "Current State in This Repo"; "Integration Architecture"; "Implementation Plan"; "Authority Documents". This remains a stubbed world-sync layer but names publication, n8n, notification, and canon-recognition surfaces that S5/S5' promotion must not bypass.
- Existing implementation surface: `Body/S/S5/epii-autoresearch-core/src/lib.rs`, `src/inbox.rs`, `src/recompose.rs`, and tests under `Body/S/S5/epii-autoresearch-core/tests/`; `Body/S/S5/epii-review-core/src/lib.rs` and tests under `Body/S/S5/epii-review-core/tests/`; `Body/S/S5/epii-agent-core/src/lib.rs` and tests under `Body/S/S5/epii-agent-core/tests/`.

## Task Body

### Tranche 7 — M5-3 IDE/Workbench Contract Surface

Deliverables:

- Define stable JSON DTOs for the review pane, autoresearch spine-state inspector, route queues, candidate details, continuity hints, and promotion dry-run results.
- Align artifact refs with the IDE research URI model: `vault://`, `repo://`, `graph://bimba/`, `gnosis://`, `etymology://`, `pratibimba://`, `run://`, `review://`, and `improvement://`.
- Add privacy-filtered read models so protected Pratibimba/Nara content is represented by handles, summaries, readiness, and review requirements only.
- Provide the minimum backend methods that M5-3 can call to render real review/autoresearch state before any Theia/CodeMirror/Monaco frontend surfaces are built.
- Document compatibility mapping for existing `gnostic`/`atelier` UI names to `gnosis`/`etymology` if the UI has not migrated yet.

Verification:

- DTO tests serialize realistic snapshots from real stores and assert stable field names for frontend consumers.
- Privacy tests prove protected fields are absent from M5-3 DTOs even when source records contain kernel trajectory, Graphiti arc, or Pratibimba handles.
- Artifact-ref tests prove URI parsing/validation rejects raw absolute paths where a namespace URI is required.
- End-to-end UI-contract test creates a file/graph/run/review/improvement artifact set and returns linked DTOs with no placeholder values.

## Track Open Decisions

- Should extended S5 state stay as multiple JSON files under the current state root, or move to a small embedded store once route queues, continuity, and orchestration records grow?
- Should `ReviewSource` expand with Sophia/Pi/Epii/Nara-specific variants, or should source remain coarse while actor and governance metadata carry the richer identity?
- What exact legacy migration policy applies when `direction: String` cannot be mapped cleanly to an `ImprovementVectorKind`?
- What are the canonical observation-fingerprint fields for each non-Aletheia pipeline?
- Which `PromotionDestination` variants are in the first production enum, and which remain reserved until their target subsystem has a real mutation contract?
- What exact operator workflow constitutes the deployment gate beyond current `requires_human` review resolution?
- When does a routine Paraśakti embedding retrain or Paramaśiva corpus refresh become load-bearing enough to require explicit user-final validation?
- How should Theia/OpenVSCode sidecars, if used by M5-3, return patch/evidence artifacts into Epii review without becoming a competing source of truth?
- Does `epii-agent/agent-contract.json` need to be versioned and updated in the same implementation tranche as `EpiiAgentAccess.gateway_methods()`, or should contract updates be a separate governance-reviewed artifact?
- Should Hen compile planning accept an explicit day/NOW timestamp from callers everywhere, or should S5 own a clock abstraction for deterministic tests and runtime calls?

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
| IOD-18 | Smart Connections via Hen `smart_env.rs` as canonical vault semantic-index reader | Implementation-owner | 03, 04, 05, 07, 09 |
| IOD-19 | Hen as canonical vault-write gatekeeper (wikilink integrity, path soundness) | Implementation-owner | 03, 05, 07, 09 |
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
- **What remains:** Electron build configuration (electron-builder for Squirrel/AppImage/dmg distributions); optional Docker browser-mode build for CI. **No strategic VS Code Extension API borrows currently committed** — the earlier `obsidian-md-vsc` borrow was reversed once research surfaced that the extension is an Obsidian-app remote-control shim (via Advanced URI) not a vault renderer, requires a running Obsidian, and does not render wikilinks / parse vault structure / serve Smart Connections. S1 vault reach is now filesystem-direct-read + Hen-gateway-write per IOD-19; Smart Connections via Hen `smart_env.rs` per IOD-18.

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
- **VS Code Extension API borrows — none currently committed.** Theia's dual-extension-API capability remains as an escape hatch but the earlier `obsidian-md-vsc` borrow was reversed (not a vault renderer; see IOD-19). M-extensions + integrated plugins + kernel-bridge + Canon Studio markdown editor + smart-connections-bridge sidebar + bimba-coordinate file-tree are all Theia-native. Future borrows must show clear ecosystem value before adoption.
- **Validation path:** Build `kernel-bridge` plus `m0-anuttara` as Theia-native slices; verify workbench command/layout service activation; record Theia version/package manager/update cadence ADR; verify any Theia-extension-hosted skills respect the skill-vs-tool invariant via the live `test_matrix_maps_real_agents_skills_and_hooks` check.
- **Consequence of delaying:** Track 07 package inventory and Track 08 composition contracts remain abstract and cannot be enforced by static checks.

## Execution Guidance

- Default to in-session execution unless the user explicitly requested subagents for this run.
- If subagents are used, give each subagent this context pack plus the exact source files it must read.
- Before editing code, verify the relevant source/spec files above have actually been read or searched for the sections cited in the plan.
- Verification must exercise real functionality; mock-only or placeholder proof does not satisfy the ledger.
