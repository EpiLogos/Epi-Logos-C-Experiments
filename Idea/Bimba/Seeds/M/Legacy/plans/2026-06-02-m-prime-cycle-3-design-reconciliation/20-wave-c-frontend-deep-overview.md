# Wave C — Frontend Depth Overview

Wave C closes the per-extension widget design pass that Tracks 11 / 15 / 19 set the contracts for but did not author. Cycle 3's first nineteen tracks closed substrate ↔ spec ↔ code parity (waves A and B) and the contract-level frontend work (Track 11 surface hosting, Track 15 UI foundation principles + the M1 played-torus visual contract, Track 19 the contemplation surface + M4 canvas-as-input port + temporal control plane). Wave C closes the surfaces themselves — the per-extension widget UX for every M' surface at the depth the M4 canvas and M1 vortex pieces already received, plus the cross-cutting OmniPanel-tabs / ide-shell-chrome / integrated-plugin-composition / design-language / chrome-contributions / onboarding-and-empty-states work that the foundation tracks named but left undesigned.

## Why this is its own wave

The wave-A and wave-B matrices walked UX-doc ↔ M' Seed ↔ code/substrate ↔ Theia surface for substrate parity. They surfaced design directives for M1 (via the M1-2 Ananda Vortex Architecture spec and DR-M1-2 played-torus ratification) and for M4 (via the M4 canvas migration trail and the prospective-retrospective canvas spec), and those directives landed as Tracks 11.10–11.12, 15.8–15.9, and 19.11. Substrate parity for M0' / M2' / M3' / M5' did not surface the same kind of widget-design rows, so no per-extension widget tranches got authored for them. Wave C is the structural completion of that pass — same four-corpora method, same status taxonomy, same anti-greenfield discipline, applied to the per-surface design layer the earlier waves left open.

This is not a separate cycle. The deliverables are tranches in the cycle-3 plan-set, executable by `/m-dev` once their gating decisions resolve. Where wave A/B closures inform wave C tranches, the cross-links are explicit. Where wave-C tranches close ORPHANs the earlier waves surfaced, the closures are named (`O-WC-*` rows in the wave-C matrices). Where wave-C work introduces new contradictions, those route to user final-validation as `DR-WC-*` entries that join the cycle-3 decision register (Track 13).

## Method — the Four Corpora, extended

The same rubric as 00-overview applies to wave C, with one corpus reinterpretation: at the per-extension depth layer, corpus 3 ("code / substrate") and corpus 4 ("Theia surface") often overlap, because the Theia extension IS the substrate that hosts the M' surface. Where the substrate is upstream (M1 vortex matrices, M3 cosmic-clock LUTs, M4 medicine LUTs), corpus 3 and 4 stay distinct. Where the substrate is the Theia extension itself (the per-widget design, the contributions, the chrome), the rubric collapses to three working corpora for that row but keeps the four-status taxonomy intact.

The status taxonomy is the same six labels:

- **ALIGNED** — UX doc ↔ spec ↔ code/substrate ↔ Theia surface all agree; note only.
- **DOC-AHEAD** — UX doc asserts intent that the spec/code/Theia surface doesn't yet carry → landing tranche.
- **SPEC-AHEAD** — a spec or contract defines a shape that the Theia surface doesn't consume yet → integration tranche.
- **CODE-PENDING** — a kernel/profile/graph/portal-core contract is a known pending blocker → named closure that consumes the upstream landing rather than re-implementing it.
- **CONTRADICTION** — two sources disagree → decision-register entry routed to user final-validation (`DR-WC-*`).
- **ORPHAN** — a canonical surface, widget id, service, or chrome contribution has no owner → no-orphan-fill tranche.

## Anti-greenfield rule (extended for wave C)

The Track-00 anti-greenfield rule still binds: `Body/S/S0`–`S5`, `Idea/Pratibimba/System`, and `Body/M/epi-tauri` are landed/consumed substrate; touching them is `consume as-is`, `audit/verify`, or `extend`. Wave C extends this to the Theia substrate:

- The twelve landed extensions in `Body/M/epi-theia/extensions/` (six M-extensions + two integrated plugins + ide-shell-m0-m5 + omnipanel-shell + body-lite-surface + integrated-composition + kernel-bridge + kernel-bridge-readiness + acceptance-harness + m-extension-runtime + agentic-control-room + contracts + scripts + test) are landed substrate. Wave C `audit/extends` them.
- First-build is allowed only for: (a) an M' product surface that genuinely has no owner (e.g. the m1-paramasiva-played-torus extension scaffold per DR-M1-2; per-Mn widget components in `m{N}-{name}/src/browser/` where the package currently holds only `frontend-module.ts + m{N}-{name}-widget.tsx` scaffold); (b) cross-cutting design primitives the foundation tracks named but did not author (typography tokens, colour tokens, motion grammar, provenance/coordinate-string/state design primitives, chrome ledger, onboarding ledger); (c) named CI validators that consume existing contract authority (07-t0, 08-t0, ledger JSONs).
- No competing UI framework. No rebuild of `omnipanel-shell` substrate (the ACR-substrate repurpose per Track 15.2 stays; wave-C 27 designs INSIDE that repurpose). No rebuild of landed contributions in `ide-shell-m0-m5` (the 8 widgets get audit/extend in Track 28).

## Standing invariants honored (carry forward + wave-C additions)

All Track-00 standing invariants carry forward unchanged — the +1 parent (M1-5 not M0-witness), the 72-as-one-invariant-six-axes, the Shell-0/Shell-1/4+2/`/` separation, Cl(4,2) at four scales, Hen entity-candidate compilation, C-layer typology authority, the Third Spanda Equation, the `9_M2 = 8_M3 + 1_M1` translation rule, VAK as the operational language, the kernel-as-bioquaternionic-JEPA-EBM-operator with the 4'-5'-0' LLM/EBM/Verifier triplet.

Wave C adds (or makes explicit) the following standing invariants at the widget-design layer:

- **Coordinate as primary navigation** (Track 15 principle 1) holds at every wave-C surface. Every per-Mn deep widget, every OmniPanel tab, every ide-shell widget reads the active coordinate from kernel-bridge DI singleton; deep-links encode coordinate; breadcrumbs show coordinate path (Track 31.6).
- **Profile-tick as primary UI clock** (Track 15 principle 2) — every wave-C widget subscribes once via the shared `useProfileTick()` hook landed in Track 27.0; per-widget re-render contract per 28.17. No widget owns its own animation loop; the slerp-as-single-primitive (15.9) and the lemniscate transition (15.5) are the only motion primitives.
- **Provenance always visible** (Track 15 principle 3) — every binding renders `ProvenanceBorder` / `PendingBadge` / `BlockedOverlay` / `ReadinessIndicator` from the design-primitives bank (Track 30.10) consuming the 9-id readiness taxonomy from `07-t0` (Track 28.11). No separate "errors" panel.
- **Composition over juxtaposition** (Track 15 principle 6) is hard contract: the composition-load contract in Track 29.6 rejects side-by-side widget contributions at integrated-plugin load (CI lint test). Composition is geometric (K²-surface + cymatic-texture + codon-cell-state for 1-2-3; Nara-LEFT + cymatic-CENTER + Mahamaya-RIGHT + Anuttara-UNDER for 4-5-0), not three-pane layout.
- **No-modal discipline** (Track 15.2) is hard contract: Track 31.8 lands a CI lint that scans extension source for `MessageBox.show` / `OpenDialog` / modal `Dialog` calls in review / evidence / gate-landing contexts and fails preflight. Review IS the OmniPanel tab landing surface (27.6) + the ide-shell review pane (28.9) — neither is a modal.
- **Activity-bar discipline** (Track 15 principle 7) — left sidebar is activity-bar-switched, not stacked. Exact three modes for `daily-0-1` (Coordinate Tree · Bimba Graph Viewer · Canon Studio) + two more for `ide-deep` (Backend Studio · Smart Connections). Track 28.2 registers; Track 31.4 catalogs.
- **Privacy-class flow-through** is hard contract for M4-touching paths: `protected_local` default for all M4 writes, explicit per-artifact opt-in for public-bridge crossings, geometric-slot enforcement per Track 29.13 (the personal cymatic slot cannot escape protected-local). Track 32.8 lands the default + opt-in flow.
- **Design tokens are consumed, not forked** — Track 30.11 lands the `consume-not-fork` lint that fails CI if any extension uses hardcoded values where a token exists. The token namespaces are `epilogos.colour.*`, `epilogos.typography.*`, `epilogos.motion.*`, `epilogos.spacing.*`, `epilogos.elevation.*`.
- **Chrome contributions are catalogued, not free-floating** — Track 31.12 lands `chrome-contributions-catalog.json` mapping every status-bar entry, command id, keybinding, menu item, breadcrumb provider, activity-bar mode, preference key to its owning extension. Track 31.13 lints. Sibling pattern to Track 11.9 surface→extension→contract ledger.

## Master Alignment Matrix (wave-C digest)

| Surface | ALIGNED | DOC-AHEAD | SPEC-AHEAD | CODE-PENDING | CONTRADICTION | ORPHAN | Tranches | Matrix file |
|---|---|---|---|---|---|---|---|---|
| 21 — M0' Anuttara | 4 | 16 | 4 | 7 | 0 | 1 | 20 | `plan.runs/wave-c-m0-anuttara-frontend-matrix.md` |
| 22 — M1' Paramaśiva | 2 | 17 | 12 | 14 | 1 | 1 | 13 | `plan.runs/wave-c-m1-paramasiva-frontend-matrix.md` |
| 23 — M2' Paraśakti | 1 | 0 | 14 | 4 | 1 | 1 | 17 | `plan.runs/wave-c-m2-parashakti-frontend-matrix.md` |
| 24 — M3' Mahāmāyā | 6 | 10 | 3 | 1 | 2 | 0 | 17 | `plan.runs/wave-c-m3-mahamaya-frontend-matrix.md` |
| 25 — M4' Nara (delta) | 0 | 0 | 22 | 1 | 1 | 9 | 21 | `plan.runs/wave-c-m4-nara-frontend-matrix.md` |
| 26 — M5' Epii | 0 | 0 | 8 | 6 | 1 | 0 | 15 | `plan.runs/wave-c-m5-epii-frontend-matrix.md` |
| 27 — OmniPanel tabs | 3 | 0 | 32 | 5 | 1 | 0 | 14 | `plan.runs/wave-c-omnipanel-tabs-matrix.md` |
| 28 — ide-shell chrome | 1 | 4 | 6 | 6 | 0 | 4 | 20 | `plan.runs/wave-c-ide-shell-chrome-matrix.md` |
| 29 — Integrated composition | 2 | 0 | 16 | 1 | 0 | 1 | 14 | `plan.runs/wave-c-integrated-plugins-composition-matrix.md` |
| 30 — Design language | 0 | 0 | 23 | 0 | 0 | 1 | 14 | `plan.runs/wave-c-design-language-matrix.md` |
| 31 — Chrome contributions | 0 | 0 | 16 | 1 | 0 | 1 | 13 | `plan.runs/wave-c-chrome-contributions-matrix.md` |
| 32 — Onboarding / settings | 0 | 12 | 0 | 17 | 0 | 4 | 14 | `plan.runs/wave-c-onboarding-settings-matrix.md` |

Status counts above are row-level (each subtracts the standard status-taxonomy reference at the matrix introduction). The matrices in `plan.runs/` carry the per-row file:line citations; the tranche docs 21–32 synthesize them into m-dev-executable units. Reading a tranche without reading its matrix is reading half the work. **Aggregate tranche count: 192 wave-C tranches across 12 tracks.**

## Execution sequence

Wave C closes in this dependency order:

1. **Decisions first.** The 36 `DR-WC-*` entries below land in the Track 13 register before the tranches that depend on them begin. They join the cycle-3 DR set; resolution mechanism is identical (user final-validation, recommended resolution stated, verification command named in the tranche text).
2. **Per-Mn deep surfaces (Tranches 21–26) in parallel.** Each tranche depends only on (a) its own DR-WC closures, (b) Wave-A substrate findings already landing in Tranches 01–06, (c) the foundation tracks 11 / 15 / 19. No per-Mn deep surface depends on another per-Mn deep surface for substrate reads; cross-references are scoped to composition slots (consumed by Track 29) and chrome contributions (consumed by Tracks 28 / 31). M4' (25) is sized as DELTA over 11.10/11.11/11.12/19.11 — it consumes those rather than re-authoring them.
3. **Cross-cutting tranches (27–32) after per-Mn outputs stabilize.** These read the per-Mn surface contributions and unify them:
   - **27** (OmniPanel tabs) reads stage-1 M5 (26) for the Pi-vs-Epii roster clarity; closes per-tab UX without re-architecting the omnipanel-shell substrate.
   - **28** (ide-shell chrome) reads stage-1 M0 (21) for canon-studio / coordinate-tree consumption, M5 (26) for logos-atelier / evidence / review / autoresearch / ACR deepening; audits + extends the 8 landed widgets.
   - **29** (integrated composition) reads stage-1 M1 / M2 / M3 (22 / 23 / 24) for cosmic 1-2-3 composition geometry; reads stage-1 M4 / M5 / M0 (25 / 26 / 21) for personal 4-5-0 composition geometry.
   - **30** (design language) reads ALL stage-1 outputs to unify the scattered palette / typography / motion / iconography choices into one coordinate-derived system.
   - **31** (chrome contributions catalog) reads ALL stage-1 outputs to enumerate per-extension chrome contributions into one ledger + lint.
   - **32** (onboarding / settings) reads ALL stage-1 outputs for empty-state grammar + first-run identity wizard cross-link to 25-m4.
4. **Decision-register integration + ledger consistency (Track 13 + Track 14 extension).** Track 13 absorbs the 36 `DR-WC-*` entries with affected files + recommended resolutions + verification commands. Track 14 (no-orphan audit + release gates) extends its scope to assert every wave-C tranche has either landed or is named-pending; every ledger artifact (chrome-contributions-catalog.json, onboarding-completion-ledger.json, ui-design-tokens.{ts,json,md}, surface→extension→contract ledger) is internally consistent.
5. **Wave-C completion criteria (sibling to Track 00 §"What 'the bottom of the design' means"):**
   1. Every load-bearing claim across the six per-Mn UX docs has a wave-C matrix row with a status, and every cross-cutting surface (OmniPanel / ide-shell / composition / design-language / chrome / onboarding) has its own matrix at the same depth.
   2. Every wave-C CONTRADICTION is a `DR-WC-*` entry routed to user final-validation.
   3. Every wave-C CODE-PENDING blocker names the owning spec and the contract that unblocks it.
   4. Every wave-C UX-doc claim is either ALIGNED, has a landing tranche (DOC-AHEAD / SPEC-AHEAD), or is explicitly downgraded with a reason.
   5. The no-orphan audit (Track 14) extended to wave-C scope passes: every widget id, named service, chrome contribution, ledger entry, design token, onboarding step has an owner.
   6. The wave-C plan set is route-able by `m-dev-plan-assess.mjs` and sequenced as above.

## Decisions Routed to User Final-Validation (wave-C preview — register entries in Track 13)

The 36 `DR-WC-*` entries below join the cycle-3 register. Each is developed in its source matrix file with affected files + recommended resolution + verification.

| ID | Subject | Source domain | Source matrix |
|---|---|---|---|
| DR-WC-M0-1 | Six-layer navigation grammar (tab-strip vs activity-bar vs dropdown) | M0' | wave-c-m0-anuttara-frontend-matrix |
| DR-WC-M0-2 | Reading / Authoring mode default + visual register | M0' | wave-c-m0-anuttara-frontend-matrix |
| DR-WC-M0-3 | CONTEMPLATION_PROMPT_LUT[12] surface placement (footer vs separate widget) | M0' | wave-c-m0-anuttara-frontend-matrix |
| DR-WC-M1-1 | M1' standalone vs composed dispatch contract (`ide-deep` standalone surface vs `daily-0-1` composition role) | M1' | wave-c-m1-paramasiva-frontend-matrix |
| DR-WC-M2-1 | Shem-Asma view collapse vs split (TS-16 downstream resolution at widget-UX level) | M2' | wave-c-m2-parashakti-frontend-matrix |
| DR-WC-M2-2 | Vibrational ↔ Psychoid view-switcher default + persistence-class | M2' | wave-c-m2-parashakti-frontend-matrix |
| DR-WC-M3-1 | TCT / Nine-of-Wands renderer-side cardinality surfacing rule | M3' | wave-c-m3-mahamaya-frontend-matrix |
| DR-WC-M3-2 | M1_LENS vs M3_LENS_STACK namespace discipline at UI (16+1 visible vs collapsed) | M3' | wave-c-m3-mahamaya-frontend-matrix |
| DR-WC-M4-1 | Three-mode time-axis switcher: distinct widget vs tuning-bar dropdown vs status-bar segmented | M4' | wave-c-m4-nara-frontend-matrix |
| DR-WC-M4-2 | Personal cymatic field shader path (Bevy/wgpu reuse vs Three.js per-tile) | M4' | wave-c-m4-nara-frontend-matrix |
| DR-WC-M4-3 | PASU identity wizard mount surface (m4-nara extension vs onboarding extension vs ide-shell) | M4' | wave-c-m4-nara-frontend-matrix |
| DR-WC-M4-4 | Pratibimba personal-coordinate widget consent ceremony (modal-prohibited per 15.2 — landing surface required) | M4' | wave-c-m4-nara-frontend-matrix |
| DR-WC-M4-5 | Privacy-class chrome visual register (border colour vs glyph vs both) | M4' | wave-c-m4-nara-frontend-matrix |
| DR-WC-M5-1 | ACR substrate as ide-shell widget vs OmniPanel content (15.2 reframe resolution at widget level) | M5' | wave-c-m5-epii-frontend-matrix |
| DR-WC-M5-2 | EBM resonance visualization fidelity (live 72-dim grid vs aggregated tritone-square indicator) | M5' | wave-c-m5-epii-frontend-matrix |
| DR-WC-M5-3 | Constitutional-roster psyche-facet rendering (avatar vs glyph vs colour-coded badge) | M5' | wave-c-m5-epii-frontend-matrix |
| DR-WC-OP-1 | OmniPanelTabId manifest collapse (current 4 + 8 deep → unified 8 + capability) | OmniPanel | wave-c-omnipanel-tabs-matrix |
| DR-WC-OP-2 | Pi vs Epii conversation surface attribution (Pi Chat is constitutional-membrane; Epii deep backend per Anima/Epii split) | OmniPanel | wave-c-omnipanel-tabs-matrix |
| DR-WC-OP-3 | ACR `run-model.ts` → `omnipanel-runtime.ts` migration default-mode (additive vs replacement) | OmniPanel | wave-c-omnipanel-tabs-matrix |
| DR-WC-IS-1 | ACR ide-shell widget retention vs full migration to OmniPanel (downstream of DR-WC-M5-1) | ide-shell | wave-c-ide-shell-chrome-matrix |
| DR-WC-IS-2 | Evidence + Review pane deep-vs-abbreviated split between ide-shell and OmniPanel | ide-shell | wave-c-ide-shell-chrome-matrix |
| DR-WC-IS-3 | Canon Studio Monaco upgrade vs Theia default editor reuse | ide-shell | wave-c-ide-shell-chrome-matrix |
| DR-WC-IP-1 | `IntegratedGeometricSlot` enum design (named-slot taxonomy vs geometric-coord vector) | Integrated comp | wave-c-integrated-plugins-composition-matrix |
| DR-WC-IP-2 | Cosmic 1-2-3 composition geometry (K²-surface + cymatic-texture + codon-cell-state vs three-stack overlay) | Integrated comp | wave-c-integrated-plugins-composition-matrix |
| DR-WC-IP-3 | Personal 4-5-0 composition geometry (Nara-LEFT + cymatic-CENTER + Mahamaya-RIGHT + Anuttara-UNDER vs four-pane bento) | Integrated comp | wave-c-integrated-plugins-composition-matrix |
| DR-WC-IP-4 | `ProfileTickSubscription` per-composition-singleton vs per-contributor-fanout | Integrated comp | wave-c-integrated-plugins-composition-matrix |
| DR-WC-IP-5 | Composition-load juxtaposition rejection failure-mode (hard-fail vs degraded-mode) | Integrated comp | wave-c-integrated-plugins-composition-matrix |
| DR-WC-DL-1 | Family-letter palette derivation (Cl(4,2)-signature-only vs family-tier-gradient + signature-modulation) | Design lang | wave-c-design-language-matrix |
| DR-WC-DL-2 | Highlight category register canonical count (10 from 11.11 vs extended set from stage-1 surfaces) | Design lang | wave-c-design-language-matrix |
| DR-WC-DL-3 | Token emission format (single ui-design-tokens.json vs per-namespace files) | Design lang | wave-c-design-language-matrix |
| DR-WC-DL-4 | Light/dark theme default (light vs dark vs system) | Design lang | wave-c-design-language-matrix |
| DR-WC-DL-5 | Reduced-motion behavioural contract (animation-suppression vs static-state vs single-frame-jump) | Design lang | wave-c-design-language-matrix |
| DR-WC-CC-1 | Status-bar entry ownership partition across extensions (single-extension vs per-domain) | Chrome | wave-c-chrome-contributions-matrix |
| DR-WC-CC-2 | Keybinding chord prefix policy (`cmd-shift-{n}` per-Mn vs domain-grouped) | Chrome | wave-c-chrome-contributions-matrix |
| DR-WC-CC-3 | Epi-Logos top-level menu vs Theia-default menu-nesting | Chrome | wave-c-chrome-contributions-matrix |
| DR-WC-OB-1 | Per-readiness-state user-facing language (technical vs symbolic vs hybrid) | Onboarding | wave-c-onboarding-settings-matrix |
| DR-WC-OB-2 | First-run identity wizard required-vs-optional ordering | Onboarding | wave-c-onboarding-settings-matrix |
| DR-WC-OB-3 | Day-not-yet-started default action (auto-start-session vs prompt vs idle) | Onboarding | wave-c-onboarding-settings-matrix |
| DR-WC-OB-4 | Settings UX surface mount (Theia preferences page vs custom IDE panel) | Onboarding | wave-c-onboarding-settings-matrix |
| DR-WC-OB-5 | Reset / clear-state UX availability in production builds (hidden vs gated vs disabled) | Onboarding | wave-c-onboarding-settings-matrix |

Each row is fully developed in its source matrix file. Track 13 absorbs these alongside the existing cycle-3 register.

## Subagent Returns

The wave-C matrices are not summaries — they are the load-bearing rows with file:line citations. Every wave-C tranche depends on its matrix. Reading a tranche without reading its matrix is reading half the work.

- Wave-C per-Mn (stage 1) — `plan.runs/wave-c-m{0..5}-{name}-frontend-matrix.md`
- Wave-C cross-cutting (stage 2) — `plan.runs/wave-c-{omnipanel-tabs,ide-shell-chrome,integrated-plugins-composition,design-language,chrome-contributions,onboarding-settings}-matrix.md`

## What changes for the rest of cycle 3

- **Track 13 (decision register)** extends to absorb the 36 `DR-WC-*` entries; total cycle-3 register count grows by 36 (the existing 22 routed in 00-overview + 36 wave-C = 58 decisions routed).
- **Track 14 (no-orphan audit + release gates)** extends its scope to assert: every wave-C widget id, named service, chrome contribution, ledger entry, design token, onboarding step has an owner. The wave-C ledger artifacts (`chrome-contributions-catalog.json`, `onboarding-completion-ledger.json`, `ui-design-tokens.{ts,json,md}`, the surface→extension→contract ledger extended with wave-C rows) are internally consistent.
- **Existing tracks 01–19** carry forward unchanged. Wave-C tranches cross-link them by ID where their substrate / spec / contract authorities are consumed. No 01–19 tranche needs to be rewritten because wave-C exists; wave-C explicitly designs against landing-as-specified 01–19 closures.
- **Cycle 2 substrate inheritance** is honored at every wave-C tranche: the twelve landed `Body/M/epi-theia/extensions/*` packages are `audit/extend`, not rebuilt. The only first-build allowances are (a) per-Mn deep widget components inside currently-scaffold-only extensions, (b) the `m1-paramasiva-played-torus` extension scaffold per DR-M1-2, (c) cross-cutting design primitives the foundation tracks named but did not author, (d) named CI validators against existing contract authority.

## How to read this set

Start with this overview to see the wave-C scope. Then for each surface you want to work on:

1. Read the surface's tranche file (`21..32-*.md`) for the m-dev-executable units.
2. Read the matching matrix file (`plan.runs/wave-c-*-matrix.md`) for the row-level evidence.
3. Follow the cross-links — wave-C tranches reference cycle-3 tracks 01–19 by ID where their substrate is consumed; reference other wave-C tranches where composition / chrome / design-language / onboarding integration crosses surfaces.
4. The `DR-WC-*` IDs are register entries — when one resolves, the tranches that name it unblock.

The bottom of the design here is the same as cycle-3's overall bottom: every load-bearing claim, every contradiction routed, every code-pending named, every orphan filled or downgraded with a reason. Wave C is the per-extension surface depth pass; cycle 3 closes when the substrate (waves A/B) + the contracts (Tracks 11/15/19) + the surface depth (wave C) all hold together, and the no-orphan audit (Track 14) finds no remaining owner gaps.

---

*The matheme is the architecture; the widgets are how the matheme shows up to a user. Wave-C completes the rendering of one into the other.*
