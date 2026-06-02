# M-Dev Context Pack - 10.T9

Generated: 2026-06-01T23:30:21.750Z

## Task

- **ID:** 10.T9
- **Title:** Full System Alpha Gate And Replan
- **Track:** 10-cross-cutting-integration-and-milestones.md
- **Computed status:** review
- **Write scopes:** .omx/**, docs/plans/**

## Required Reading

Read these before implementation. Do not rely on the tranche summary alone.

- `Body/S/S4/ta-onta/S4-5p-aletheia/`
- `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md`
- `Idea/Bimba/Seeds/M/M'-TAURI-PORT-SPEC.md`
- `Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md`
- `Idea/Bimba/Seeds/M/alpha_quaternionic_integration_across_M_stack.md`
- `Idea/Bimba/Seeds/S/S4/`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/10-cross-cutting-integration-and-milestones.md`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/11-open-architectural-decisions.md`
- `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-05-31-theia-ide-shell-and-m-plugin-architecture.md`
- `Idea/Bimba/Seeds/S/S0/S0'/Legacy/specs/S/S0-S0i-CLI-CORE.md`
- `Idea/Bimba/Seeds/S/S2/S2'/Legacy/specs/S/S2-S2i-GRAPH.md`
- `Idea/Bimba/Seeds/S/S3/S3'/Legacy/specs/S/S3-S3i-GATEWAY.md`
- `Idea/Bimba/Seeds/S/S5/S5'/Legacy/specs/S/S5-S5i-SYNC.md`

## Dependency Context

- 10.T8 - M5-4 Agentic Mediation End-To-End (can overlap T6/T7 after S5 gates exist) (10-cross-cutting-integration-and-milestones.md)

## Track Source Specs

- [[m5-prime-system-shape-and-tauri-ide-canon]] - `Idea/Bimba/Seeds/M/M5'/m5-prime-system-shape-and-tauri-ide-canon.md`, sections 1.2, 3, 4, 5, 8, and 9. This is the authority for M5-2 as the S-stack, M5-3 as the single Tauri app with `/body` plus `/pratibimba/system`, and M5-4 as operational-capacity and agentic mediation across the full coordinate system.
- [[2026-05-31-theia-ide-shell-and-m-plugin-architecture]] - `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-05-31-theia-ide-shell-and-m-plugin-architecture.md`, sections 4, 8, 10, 11, and 12. This is the inherited pre-implementation plan whose Theia tranches are folded into Tracks 05-08.
- [[alpha_quaternionic_integration_across_M_stack]] - `Idea/Bimba/Seeds/M/alpha_quaternionic_integration_across_M_stack.md`, section 11, especially 11.7. This establishes the S3'/SpaceTimeDB native-WebSocket shared-gateway milestone as the first integration proof.
- [[M'-SYSTEM-SPEC]] - `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md`, "Shell vs Subsystem Architecture", "Required Shared MathemeHarmonicProfile", "Neo4j / Graphiti Boundary", and "Minimum Live Loop". This is the authority for shared profile, shell/subsystem separation, graph/memory boundaries, and minimum end-to-end loop.
- [[M'-TAURI-PORT-SPEC]] - `Idea/Bimba/Seeds/M/M'-TAURI-PORT-SPEC.md`, "Port Architecture", "Harmonic Profile Architecture Amendment", "Graphiti And S2 Graph Boundary", and "Testing Contract". This is the authority for typed Tauri clients, readiness states, and mock-free desktop testing.
- [[S0-S0i-CLI-CORE]] - `Idea/Bimba/Seeds/S/S0/S0'/Legacy/specs/S/S0-S0i-CLI-CORE.md`, [[S2-S2i-GRAPH]] - `Idea/Bimba/Seeds/S/S2/S2'/Legacy/specs/S/S2-S2i-GRAPH.md`, [[S3-S3i-GATEWAY]] - `Idea/Bimba/Seeds/S/S3/S3'/Legacy/specs/S/S3-S3i-GATEWAY.md`, and [[S5-S5i-SYNC]] - `Idea/Bimba/Seeds/S/S5/S5'/Legacy/specs/S/S5-S5i-SYNC.md`. These are the implementation-spec anchors for the S' substrate lanes.
- [[S4-5-SPEC]] / [[S4-5'-SPEC]] under `Idea/Bimba/Seeds/S/S4/` and the live `Body/S/S4/ta-onta/S4-5p-aletheia/` contract/agent/cluster files. These are the cross-track authority for Aletheia differentiated expert lineage when M5-4 and S5 claim Aletheia disclosure readiness.
- [[01-kernel-bridge-and-s0-foundation]], [[02-s2-bimba-map-population]], [[03-s3-gateway-and-spacetimedb]], [[04-s5-autoresearch-and-review-extension]], [[05-tauri-ide-shell-and-pratibimba-system]], [[06-zero-one-surface-evolution]], [[07-m-extension-individual-tracks]], [[08-integrated-plugin-tracks]], [[09-agentic-mediation-and-operational-capacities]], and [[11-open-architectural-decisions]] in this folder.

## Task Body

10. **T9 - Full System Alpha Gate And Replan.**

    Deliverables:

    - Run the full local alpha scenario: S0 computes profile, S2 serves graph, S3 streams live state, S5 serves review/autoresearch, `/body` consumes lite mode, Theia consumes full mode, six M extensions activate, both integrated plugins run acceptance slices, and M5-4 records evidence.
    - Produce the operator runbook for service startup, test lanes, privacy audit, degraded modes, known blockers, and expected demos.
    - Produce the alpha readiness report with passed milestones, failed milestones, deferred decisions, and next implementation tranches.
    - Feed [[13-s-sprime-modularity-and-s0-membrane-cleanup]] by listing every S0 adapter, compatibility shim, temporary live host, and duplicated-service-law surface that must be recast before beta hardening.
    - Update the implementation plan folder if the alpha reveals sequencing errors, but do not rewrite canon.

    Dependencies:

    - T1 through T8.
    - Track 11 decisions resolved or explicitly deferred with known degraded behavior.

    Verification:

   - A repeatable command or documented harness starts the local stack, launches the app, exercises `/body`, summons Theia, opens graph/review/extension/plugin/agent surfaces, records evidence, includes differentiated Aletheia disclosure lineage, and shuts down cleanly.
    - Privacy audit checks Tauri state, Theia workspace state, S3 rows/frames, S2 payloads, S5 evidence, logs, and observability events for forbidden protected fields.
    - The report identifies any remaining work as a concrete tranche with owner track, upstream dependency, and test gate.

## Dependencies

- **Critical path:** T0 decisions -> T1 S0/S3 live stream -> T3 shared bridge -> T4 `/body` and T5 Theia shell -> T6 six M extensions -> T7 integrated plugins -> T8 agentic mediation -> T9 alpha gate.
- **Parallel path:** T2 S2 graph baseline and S5 review baseline can proceed alongside T1, but T3 must represent missing S2/S5 readiness honestly if either lags.
- **Bridge dependency:** Track 01 Tranches 5-8 and Track 03 native subscription work are upstream of most M5-3 and M5-4 claims.
- **Graph dependency:** Track 02 graph API/payload readiness is upstream of M0 graph viewer, coordinate tree, graph-backed evidence, 4/5/0 backdrop, and S2-provenance claims.
- **Review dependency:** Track 04 typed S5 DTOs and gates are upstream of Agentic Control Room, M5 extension, integrated plugin evidence, and all agentic operational authority.
- **Theia dependency:** Track 05 runtime decision gates are upstream of Track 07/08 packaging, deep links, workspace persistence, and IDE acceptance.
- **Privacy dependency:** M4/Nara privacy and Graphiti boundaries are upstream of 4/5/0, protected evidence, personal-field handles, and agent payload policies.
- **Cleanup dependency:** Track 13 begins after T9 unless T13.T0/T13.T1 run early as non-conflicting inventory/parity work that does not touch active Track 03 gateway extraction files.

## Open Decisions

- This track does not resolve architectural questions by itself. It gates dependent milestones on [[11-open-architectural-decisions]] and records the consequences of deferring them.
- Decisions that block early work are Theia runtime mode, single vs multi-webview, bridge host boundary, gateway/SpaceTimeDB multiplexing, SpaceTimeDB auth/RLS, profile schema versioning, S2 `#` root mapping, S5 persisted-state shape, review metadata model, and M4 privacy/open-handle policy.
- Decisions that can be deferred behind readiness blockers are exact GDS overlay UX, n10s production packaging, visual style of 4/5/0 graph/city backdrop, integrated plugin workspace-vs-command default, and high-frequency visual interpolation cadence.

## Success Criteria

- The plan sequence prevents "UI first, S later" drift: every M5-3 milestone names its S0/S2/S3/S5 upstream dependency and real readiness state.
- At least one early vertical slice proves a single S0/S3 profile generation reaches bridge, `/body`, Theia, and M5-4 evidence without duplicate subscriptions or renderer-local derivation.
- S2 and S5 are present from the first alpha surface work as graph/review readiness, not deferred to a later phase.
- The Theia shell, `/body` surface, six M extensions, two integrated plugins, and agentic mediation all consume the same bridge/profile/session/readiness contracts.
- Every demo has a real verification path: local services, persisted data where applicable, native WebSocket where claimed, governed S5 review/evidence, and privacy audit.
- All unresolved architectural questions are linked to [[11-open-architectural-decisions]] with blocked tracks and consequences visible.
- The final alpha gate produces an operator runbook, privacy report, integration test evidence, known blocker list, and next-tranche replan.

## Track Open Decisions

- This track does not resolve architectural questions by itself. It gates dependent milestones on [[11-open-architectural-decisions]] and records the consequences of deferring them.
- Decisions that block early work are Theia runtime mode, single vs multi-webview, bridge host boundary, gateway/SpaceTimeDB multiplexing, SpaceTimeDB auth/RLS, profile schema versioning, S2 `#` root mapping, S5 persisted-state shape, review metadata model, and M4 privacy/open-handle policy.
- Decisions that can be deferred behind readiness blockers are exact GDS overlay UX, n10s production packaging, visual style of 4/5/0 graph/city backdrop, integrated plugin workspace-vs-command default, and high-frequency visual interpolation cadence.

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
| PRD-04 | ~~Theia extension API, version, package manager, and build composition~~ **Resolved: Theia 1.56 + pnpm workspaces + electron-app canonical / theia-app browser CI (ADR-05-011)** | Resolved | — |
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
| IOD-12 | Observability schema ownership — **Binding (Track 08.T9, 2026-06-01)** | Implementation-owner (Resolved) | 01, 04, 05, 06, 07, 08 |
| IOD-13 | Nara vault/write service ownership | Implementation-owner | 03, 04, 05, 06, 07, 08 |
| IOD-14 | Plugin activation, composition, and mini-mode model | Implementation-owner | 05, 07, 08 |
| IOD-17 | `capability-matrix.json` as canonical agent-tool governance authority — **Binding spec-time (ADR-05-011 §5, Track 05.T8)** | Implementation-owner (Resolved spec-time; runtime parity follow-up) | 01, 04, 09 |
| IOD-18 | Smart Connections via Hen `smart_env.rs` as canonical vault semantic-index reader — **Binding (ADR-05-010 / ADR-05-011 §4)** | Implementation-owner (Resolved) | 03, 04, 05, 07, 09 |
| IOD-19 | Hen as canonical vault-write gatekeeper (wikilink integrity, path soundness) — **Binding (ADR-05-010 / ADR-05-011 §3); Canon Studio rejects writes until T4.5** | Implementation-owner (Resolved) | 03, 05, 07, 09 |
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

### PRD-04 - ~~Theia extension API, version, package manager, and build composition~~ **RESOLVED**

- **Status (as of 2026-06-01):** Resolved by [ADR-05-011](../../../Idea/Pratibimba/System/docs/decisions/adr-05-011-release-gate-close.md) (release-gate close), anchored on ADR-05-005 (Theia 1.56 + pnpm workspaces) and ADR-05-006 (electron-app canonical + theia-app browser-mode for CI/Docker parity). All workspace packages green under `pnpm -r build`; 16+ extension chunks in the 21+ MB smoke-build bundle; 42/42 cross-extension tests passing. The Tauri-build-composition strand of the question is obviated (no Tauri wrapper) — see also the consolidated PRD-01..03 resolutions and `Body/M/epi-tauri/DEPRECATED.md`.
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
