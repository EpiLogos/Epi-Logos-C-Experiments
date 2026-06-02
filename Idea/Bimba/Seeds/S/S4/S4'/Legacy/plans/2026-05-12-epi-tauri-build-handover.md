---
date: 2026-05-12
status: handover
authority: implementation-brief
home: "Body/M/epi-tauri/"
references:
  - "[[2026-05-09 epi-tauri port design]]"
  - "[[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]]"
  - "[[FLOW 2026 04 24 PI AGENT API v0.1]]"
  - "[[FLOW 2026 04 25 TS INTERFACE DEFINITIONS]]"
  - "[[FLOW 2026 04 25 PI AGENT API AUDIT]]"
---

# Epi-Tauri Build Handover

You are picking up the implementation of the **Epi-Logos Tauri v2 desktop application**. The design is complete; this brief orients you to the canonical authorities, the home location, the discipline expected, and the first moves.

---

## 1. Mission

Build the Tauri v2 desktop app per the design spec at:

```
/Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-05-09-epi-tauri-port-design.md
```

That document is ~5500 lines and covers every architectural decision. It is the build target. If anything in it contradicts a canonical authority (Section 2 below), the canonical authority wins and the spec needs amending — flag it before proceeding.

## 2. Home location

The app lives under the **M-coordinate body root**, not under S/S3 where its Electron predecessor sat:

```
/Users/admin/Documents/Epi-Logos C Experiments/Body/M/epi-tauri/
```

`Body/M/` is the M-coordinate body — the implementation home for M' surface artefacts. The Tauri app IS the M' surface in implementation, so it belongs here. Create the directory if absent.

The Electron predecessor at `Body/S/S3/epi-app/` is now a *reference implementation only* — read it for component patterns, do not modify it, do not extend it. Once Tauri reaches parity, the Electron tree archives to `Body/S/S3/_legacy-epi-app/`.

## 3. Canonical authority — what wins on conflict

These documents are higher authority than the design spec. If you read the design spec and it says something different from these, **the canonical authority wins**:

| Document | Authority over |
|---|---|
| `Idea/Bimba/Seeds/S/FLOW-2026-04-22-ENVELOPE-FIELD-SCHEMA.md` | The 12-layer envelope shape; the `{family}_{n}_{semantic}` frontmatter key law; which fields are hot/warm/cold; layer ownership (S0..S5 / Khora / Hen / Pleroma / Chronos / Anima / Aletheia / Sophia) |
| `Idea/Bimba/Seeds/S/S4/S4'/FLOW-2026-04-24-PI-AGENT-API-v0.1.md` | Coordinate-native API method shapes; what the gateway exposes; how agents are invoked |
| `Idea/Bimba/Seeds/S/S4/S4'/FLOW-2026-04-25-TS-INTERFACE-DEFINITIONS.md` | Canonical TypeScript types — use these directly in `src/services/types.ts`. Do not invent parallel type names |
| `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/FLOW-2026-04-25-PI-AGENT-API-AUDIT.md` | Notes on which API methods are real vs aspirational |
| `Idea/Bimba/Map/M0'.md` through `M5'.md` | The canonical M' coordinate seeds — what each domain *means* |
| `Idea/Bimba/World/Daily-Note.md` | Canonical daily-note template with full QL frontmatter |

Read **all of these** before writing any code. Especially the envelope schema — it is the single most load-bearing document in the system. Every Tauri command, every vault write, every frontmatter field maps to a slot in the envelope.

## 4. Source-truth references — what to preserve / mirror at the contract level

These exist as running code or canonical seed material. Mirror them at the *contract* level (data shapes, math, behaviour). Do not pull their file layouts or naming as authority — use the design spec's layout.

| Path | What's there | Use for |
|---|---|---|
| `Body/S/S0/epi-cli/src/portal/clock_state.rs` | The canonical Rust `PortalClockState`, `OracleFaces`, `KairosState`, quaternion composition | Direct port to `src-tauri/src/clock/state.rs` — the math is canonical |
| `Body/S/S0/epi-cli/src/portal/clock_renderer.rs` | TUI Hopf-renderer (braille canvas) | Geometry is canonical; replace braille with react-three-fiber per Part IV.5 |
| `Body/S/S0/epi-cli/src/portal/plugins/spine.rs` | M4 chakra spine derivation from composed quaternion | Port the derivation formula verbatim |
| `Body/S/S0/epi-cli/src/nara/` | Oracle / Kairos / identity / pratibimba CLI logic | Contract reference for command shapes; the Tauri commands wrap these patterns |
| `Body/S/S3/epi-app/renderer/` | Working Electron renderer components | Component patterns for M0-5' force-graph, M4 NaraDashboard + TipTap editor, OmniPanel structure |
| `Body/S/S3/epi-app/main/main.ts` | 34 IPC handlers grouped by S-layer | Reference for which gateway methods to wrap as Tauri commands |
| `Body/S/S3/epi-app/shared/types.ts` | `MPRIME_DOMAINS`, `SPrimeAPI` shape | Type shapes — but use canonical TS interfaces from FLOW-2026-04-25 first |
| `Body/S/S3/epi-app/shared/innerStrata.ts` | 36-stratum spec with priority labels | Canonical inner-stratum catalogue |
| `Body/S/S3/epi-app/shared/navigationConfig.ts` | Hotkey grammar (parseHotkey, matchesHotkey) | Preserve; the new 1:3 hotkey grammar in design Part VI.3 extends this |

**Do not pull `Body/S/S5/epi-gnostic/` or `early-epi/` material as authority.** They contain old labels (`:BimbaNode` compound, lowercase `:gnostic`, 3072-dim assumptions, port 37778 hard-pinned) that have been superseded. The design spec lists the canonical labels (`:Bimba`, `:Gnostic`, `:Pratibimba`, `:Atelier_Word/Constellation/Aphorism`).

## 5. Architectural disciplines — non-negotiable

These are positions the design spec landed on after sustained iteration. Don't relitigate them unless you find a canonical-authority conflict.

1. **One Neo4j with `:Bimba`, `:Gnostic`, `:Pratibimba`, `:Atelier_*` namespaces.** Cross-namespace edges are first-class Cypher. No SQLite for Atelier. No Qdrant. No MongoDB.
2. **Vault is the system of record.** Markdown in `Idea/` is canonical truth; Neo4j and Graphiti are derived indices.
3. **Frontmatter uses the canonical `{family}_{n}_{semantic}` key law.** Unknown keys are errors, not warnings. Validate before every vault write via a Hen-compliant validator.
4. **Day folder is minimal.** `daily-note.md` + `FLOW-{date}.md` + NOW subfolders. No `DREAM-{date}.md`, no `ORACLE-{date}.md` — dream/oracle/journal material lives as **typed Graphiti episodes** spawned from highlight-send actions in the flow file.
5. **Oracle casts are live operator gestures**, recorded by the operator. The randomness engine is opt-in (`oracle_random_*`), never the default. Computational/relational pass runs over the recorded cast.
6. **Library is operator-curated.** No autonomous deposit. No autoresearch loop writing into Library. No Notion bidirectional sync — Notion is write-only on explicit operator command.
7. **AG-UI is the canonical agent-frontend wire** (Part V.6). CopilotKit is the React adapter. Tauri `invoke`/`listen` stays as the synchronous command spine; AG-UI carries the agent loop in parallel.
8. **Shell is 1:3** (Part VI): left = integrated clock-cosmos (M1+M2+M3 fused), right = switchable M4/M5/M0 workspace, OmniPanel = ESC overlay, KBase info-pool = `Cmd+I` slide-out. **M1/M2/M3 are not separable sub-tabs** — they're layers of one fused visualisation.
9. **Constitutional agents and Aletheia subagents are envelope data, not UI panels.** They appear as `p_3_agent_sequence_position`, `s_5_anansi_placement`, `s_5_janus_threshold` etc. Don't build a "roster" panel.
10. **TUI is authority reference, not visual template.** It declares the same envelope/topology/readiness; its pane arrangement is parallel implementation, not a layout to copy.

## 6. Build approach

Follow the wave structure in design spec **Part XII §12.1–12.5**. Six waves; waves 2 / 4 / 5 are parallelisable with 5–8 subagents each. Estimated wall-clock with parallelism: ~6.5 hours.

**Wave 1 (sequential, ~30 min):**
- T0 Scaffold `Body/M/epi-tauri/` workspace (Cargo, Vite, tsconfig, tauri.conf, capabilities)
- T1 AppState + error + event-emission helpers

**Wave 2 (parallel, ~90 min, 9 agents):** vault / graph / geometry / atelier / gateway / clock / hopf / temporal / library-retrieval. See Part XII for each task brief.

**Wave 3 (sequential gate, ~20 min):** T7 service clients + types.ts.

**Wave 4 (parallel, ~90 min, 8 agents):** OmniPanel / stores / hotkeys / shell-1:3-split / M0 Anuttara workspace / M1+M2+M3 integrated clock-cosmos / M2 emphasis layer / 2D-3D toggle plumbing.

**Wave 5 (parallel, ~120 min, 6 agents):** M3 Chronos clock Hopf renderer / M3 supporting strata / M4 Nara dashboard / M5 Library / M5 Atelier / M5-4' Epii Mode.

**Wave 6 (sequential, ~60 min):** T19 E2E Playwright specs / T20 spec self-review.

Subagent briefs per task are in Part XII §12.3 — each is a self-contained slice of the spec.

## 7. Test discipline

- **Rust tests with `--test-threads=1`** to avoid SQLite/Neo4j contention.
- **Test-first** for every backend repository, frontend state model, agent surface.
- **Real integration tests over mocks** where feasible (real Neo4j in Docker, real fixture vault).
- **Frontmatter validation tests** — every vault-write path must round-trip through `vault_validate_frontmatter`.
- **Linking-number-1 verification** for Hopf fibre pairs (Part IV.5 §4.5.10 acceptance criterion).
- **Cold-start under 1.5s**, **idle memory under 200MB** (DoD §12.5).

## 8. First moves

1. Read this brief, the design spec (at least Parts I–VI), and the four FLOW canonical authorities listed in §3.
2. `mkdir -p Body/M/epi-tauri/` and create the workspace scaffold per design spec Part II §2.1.
3. Read `Body/S/S3/epi-app/main/main.ts` and `Body/S/S3/epi-app/renderer/components/Shell.tsx` to ground in the current Electron shape.
4. Begin Wave 1 — scaffold + AppState. Do not start Wave 2 until Wave 1 is green.
5. After each wave, run the design spec's per-wave acceptance checks before fanning out the next.

## 9. Communication discipline

- When a canonical-authority document conflicts with the design spec, **stop, flag in chat, propose the resolution**. Don't silently choose one.
- When you make a build-time decision the spec doesn't cover, **annotate the choice in your wave summary** and reference the spec section it elaborates.
- When you find old code that uses superseded names (`:BimbaNode`, lowercase `:gnostic`, `bimbaCoordinate`, slash-string dispatch, `DREAM-{date}.md`, etc.), **do not preserve them**. The design spec lists the canonical replacements.
- When you spawn subagents for parallel waves, **hand each one a focused slice of the design spec plus this brief**. Do not let them re-litigate disciplines from §5.

## 10. Definition of done

The full DoD is in design spec §12.5 (24 criteria). At minimum, on Wave 6 close:

- All 36 inner stratum surfaces render their intended visualisation (no placeholder text where real surface is mandated)
- M3-5' Chronos clock live, casts integrate with PortalClockState
- M0-5' Bimba 2D explorer loads from real Neo4j
- M4-4' Nara journal sendoff produces typed envelopes → Graphiti episodes
- OmniPanel parity passes for all 14 panels
- Backend Rust tests pass with `--test-threads=1`
- E2E Playwright passes on a clean machine with running gateway + Neo4j
- Cold start < 1.5s, idle < 200MB

---

**This brief is self-contained.** Combined with the design spec and the four FLOW canonical authorities, you have everything you need to build. If you find a gap, flag it before invention. The system has been over-iterated enough that genuine gaps are rare — what looks like a gap is more often a canonical authority you haven't read yet.

Begin.
