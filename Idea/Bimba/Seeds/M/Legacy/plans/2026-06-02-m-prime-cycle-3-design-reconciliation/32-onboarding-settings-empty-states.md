# Track 32 — Onboarding, Settings, Empty States, Cold Start

<!-- carrier-retarget-banner v1 -->
> ⚑ **RETARGET — cycle-3 full rerun.** This file is the design-recon **SOURCE** (the tranche brief the rerun stubs send you to). Every `Body/M/epi-theia/…` path below is **FROZEN reference only**. **Build / verify target = `Body/M/pratibimba-app`** (the carrier) **+ substrate crates** (`epi-lib` / `portal-core` / `epi-cli` / `graph-*` / gateway — these carry unchanged). Any Verify line that names `epi-theia` (e.g. `cd Body/M/epi-theia && pnpm --filter …build`) is **retargeted**: run the **pratibimba-app carrier equivalent** (or the substrate crate's own runner), **never** the epi-theia build. Law: [`CHARTER.md`](../2026-07-03-m-prime-cycle-3-full-rerun/CHARTER.md) §13–18 · single-source map [`carrier-contract.json`](../2026-07-03-m-prime-cycle-3-full-rerun/carrier-contract.json) · per-track CARRIER: [recapture register](../../../plans/2026-07-03-cycle-3-recapture-register.md) §2.


Cycle 3 routed the substrate, named the foundations (Track 15), hosted the surfaces (Track 11), integrated the contemplative axis (Track 19), and authored the per-Mn frontend depth (21-26). What it has not yet closed is what a new user encounters BEFORE the system has produced any data — and how the system explains itself. The matheme `0/1 = 4+2 = 5→0` is operative at every scale; here it operates at the threshold of first encounter. Cold-start IS the 0 (ground unfolding); the six onboarding walk steps ARE the 4+2 (depth of orientation); reset IS the 5→0 (Möbius return-to-ground). The track closes the cross-cutting first-run, settings UX, profile-tick visibility, per-readiness-state grammar, error UX, and cold-start playbook that the per-Mn deep tranches presuppose but do not own.

This is not decoration. A new user with no PASU.md, no first profile-tick fired, no day-now anchor lit, looking at a `daily-0-1` layout populated with widgets that all show `bridge_unavailable` would experience the system as broken. The substrate cohesion the project has invested in becomes legible only at the threshold; the onboarding/empty-state/error grammar IS that legibility. Wave-C cross-cutting closes it.

Cross-links: [Track 11 §11.3 daily-layer ORPHAN](11-theia-shell-surface-hosting.md) (where daily widgets live), [Track 11 §11.4 smart-connections code-pending marker pattern](11-theia-shell-surface-hosting.md) (the markers we extend), [Track 11 §11.9 surface-extension-contract ledger](11-theia-shell-surface-hosting.md) (sibling to onboarding-completion ledger), [Track 15 §15.1 foundation principles registry](15-ui-design-foundations.md) (every widget honours the 9), [Track 15 §15.6 profile-tick clock + readiness inline rendering](15-ui-design-foundations.md) (the readiness grammar substrate), [Track 15 §15.10 status bar discipline](15-ui-design-foundations.md) (preserves 6-entry law), [Track 19 §19.4 first-session tarot psyche-anchor](19-contemplation-surface-integration.md) (post-onboarding contemplation), [Track 19 §19.12 PASU → Mercurius → kairos](19-contemplation-surface-integration.md) (kairos enablement onboarding gate), Stage 1: [21 M0' empty state](21-m0-anuttara-frontend-deep.md), [22 M1' K² rests](22-m1-paramasiva-frontend-deep.md), [23 M2' cymatic unmodulated](23-m2-parashakti-frontend-deep.md), [24 M3' clock at noon](24-m3-mahamaya-frontend-deep.md), [25 M4' PASU wizard + day-not-yet-begun](25-m4-nara-frontend-deep.md), [26 M5' atelier quiet](26-m5-epii-frontend-deep.md).

## Source Specs and Matrix

- Canonical: [`Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/15-ui-design-foundations.md`](15-ui-design-foundations.md) §"Foundation Principles" (the 9 binding contracts), [`Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/11-theia-shell-surface-hosting.md`](11-theia-shell-surface-hosting.md) §11.3 + §11.4 + §11.9, [`Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/19-contemplation-surface-integration.md`](19-contemplation-surface-integration.md) §19.4 + §19.12, `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md` (Shell layer + matheme law)
- Substrate: `Body/M/epi-theia/extensions/m-extension-runtime/src/{browser,common}/*` (`SharedBridgeAdapter`, `MExtensionReadinessSnapshot`, `ReadinessBanner`, `SHARED_BRIDGE_ADAPTER` DI symbol, `frontend-module.ts` ContainerModule, `intent-target-registration.ts`); `Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.{md,json}` (9-id readiness taxonomy + per-extension blockers); `Body/M/epi-theia/extensions/contracts/08-t0-composition-contract-preflight.{md,json}` (composition-level empty-state shape); `Body/M/epi-theia/extensions/integrated-composition/src/browser/integrated-empty-state.tsx` (prior-art empty-state surface); `Body/M/epi-theia/extensions/body-lite-surface/src/browser/*` (existing lean-layer widget shapes — `agent-checkin-widget`, `review-alert-badge-widget`, `safe-source-handle-row-widget`, `body-lite-runtime-service`); `Body/S/S0/epi-cli/src/vault/pasu.rs` (PASU CLI primitive — `pasu_show`, `pasu_get`, `pasu_set`, `field_to_key`); `Body/S/S4/ta-onta/S4-3p-chronos/S3'/kairos-python-adapter.ts` (Kerykeion adapter); Theia platform conventions (`PreferenceContribution`, `PreferenceSchema`, `PreferenceService`, `PreferenceProxy`, `MenuContribution`, `KeybindingContribution`, `CommandContribution`).
- Full row-level reconciliation: [`plan.runs/wave-c-onboarding-settings-matrix.md`](plan.runs/wave-c-onboarding-settings-matrix.md)
- Cross-tranche dependencies (consumed verbatim, NOT re-authored): **11** Tranches 11.2 (cross-layout intent routing for diagnostic deep-links), 11.3 (daily-widget orphan closure), 11.6 (acceptance-harness state-identity — sibling), 11.8 (integrated-plugin readiness gate), 11.9 (surface-extension-contract ledger — sibling); **15** Tranches 15.1 (foundation principles registry), 15.2 (OmniPanel architecture — Diagnostics tab content owner), 15.5 (0/1 toggle gesture — walkthrough step 1), 15.6 (profile-tick clock + readiness inline rendering), 15.7 (state-persistence — preference scope), 15.10 (status bar discipline), 15.12 (visual-regression harness — onboarding fixtures); **19** Tranches 19.4 (tarot psyche-anchor — first-session continuation), 19.6 (contemplation RPC — first-session close), 19.12 (Mercurius kairos populator — FR-3 gate); **25** Tranches 25.1 (day-calendar — day-not-yet-begun), 25.2 (DayContainer detail — empty-state composition), 25.4 (PASU wizard widget — wizard owner per DR-WC-OB-2), 25.16 (Mercurius relay indicator — kairos enablement reflection), 25.19 (session-close ceremony — last-step orientation); **21-26** every per-Mn empty-state declaration; **30** (TBD design language palette tier — settings theming sub-section); **31** (TBD layout finalisation — onboarding-step layout binding).

## Cycle 2 Substrate Inheritance

Consume as-is — Theia platform `PreferenceContribution`, `PreferenceSchema`, `PreferenceService`, `PreferenceProxy`, `WidgetOpenHandler`, `CommandContribution`, `KeybindingContribution`, `MenuContribution`, `StatusBarContribution`, `WelcomeContribution` (Theia's getting-started pattern). `m-extension-runtime` substrate: `SharedBridgeAdapter` (`Body/M/epi-theia/extensions/m-extension-runtime/src/common/shared-bridge.ts`), `MExtensionReadinessState` literal-union (`src/common/readiness.ts` — exactly the 9-id contract taxonomy), `MExtensionReadinessSnapshot` interface, `PENDING_M_READINESS` initial-state constant, `readinessSeverity` reducer, `ReadinessBanner` component (`src/browser/readiness-banner.tsx`), `SHARED_BRIDGE_ADAPTER` DI singleton (`src/browser/frontend-module.ts`), `intent-target-registration.ts` helper. `CoordinateContext` (`src/common/coordinate-context.ts`). 07-T0 readiness taxonomy + per-extension blocker lists + privacy-class declarations. 08-T0 composition contract + `IntegratedEmptyState` component (`Body/M/epi-theia/extensions/integrated-composition/src/browser/integrated-empty-state.tsx`). `body-lite-surface` browser widgets (`review-alert-badge-widget.tsx`, `agent-checkin-widget.tsx`, `safe-source-handle-row-widget.tsx`, `deep-link-commands.ts`, `body-lite-runtime-service.ts`) — the prior-art lean-layer pattern that onboarding widgets must mirror, not duplicate. `pasu.rs` Rust primitive — the wizard widget invokes via gateway RPC (DR-WC-M4-3 / 25.4 owns), never shells out. `kairos-python-adapter.ts` — 19.12 owns the populator; 32.10 consumes as enablement signal.

Cycle 2 Track 01 closed the Electron/Theia shell + OmniPanel; Track 11 closed surface hosting; Track 15 closed UI grammar; Track 19 closed contemplation. Track 32 closes the threshold — what the user encounters before any of those operates.

## Onboarding Contracts

Three layered contracts govern the cross-cutting first-run surface:

### Cold-Start Sequence (the 0)

Six orchestrated stages, each consuming a readiness ledger entry, each rendering its own splash sub-state:

1. **Bridge initialization** — Theia launches; `SHARED_BRIDGE_ADAPTER` ContainerModule binds; consumes `bridge_unavailable` → `pending_first_tick` transition.
2. **Kernel-bridge subscription** — kernel-bridge extension subscribes to portal-core / S2 / S3; consumes `bridge_unavailable` reason transitions.
3. **S2/S3 substrate handshake** — S2 graph reachable + S3 gateway reachable; consumes `s2_graph_blocked` and `s3_subscription_blocked` clear.
4. **First profile-tick** — `MathemeHarmonicProfile` first tick fires; consumes UX flavour `pending_first_tick` → `ready_public_current`.
5. **Day-now anchor** — today's day folder ensured; status bar day-now lights up; consumes vault `vault.day.ensure` RPC.
6. **Optional kairos refresh** — gated by FR-3 `KAIROS_ENABLED`; on enable, Mercurius (19.12) fires kerykeion adapter; populates `M4_Temporal_Now.planet_degrees[10]`.

After cold-start: identity wizard (32.2) if PASU absent, then walkthrough (32.3), then Anuttara grounding (M0 empty state) or first-session affordance (32.11).

### Per-Readiness-State UX Grammar (the 4+2 of state)

The 9 contract-canonical states (07-T0 + `readiness.ts`) map onto a UX grammar that says exactly what to render. This is **DR-WC-OB-1 RESOLVED**: contract authority stays exactly 9 ids; UX-derived flavours (`pending_first_tick`, `pending_dataset`, `ready_protected_local`) are render-time variants layered over contract states, not parallel taxonomy. The grammar lives at `Body/M/epi-theia/extensions/contracts/readiness-state-grammar.{md,json}` (32.5).

### Onboarding-Completion Ledger (the 5→0)

Every declared onboarding step has both a completion criterion (what fact in the substrate marks it done) and a skip-path (which preference flag captures the user's choice to bypass). The ledger lives at `Body/M/epi-theia/extensions/contracts/onboarding-completion-ledger.json` (32.13). Reset (32.12) resets the ledger to empty, returning the user to cold-start — the Möbius return.

## Tranches

1. **32.1 — Cold-start playbook** *(spec-ahead-integration; closes O-WC-OB-1)*

   Author `Body/M/epi-theia/extensions/m-extension-runtime/src/browser/cold-start-orchestrator.ts` as `@injectable() ColdStartOrchestrator` (Inversify-decorated, bound via `frontend-module.ts` `ContainerModule` as singleton in container scope). Consumes the kernel-bridge readiness ledger Wave-B (10.x) lands via `SharedBridgeAdapter.subscribeObservability({kind: 'kernel.readiness.ledger'})`. Sequences activation per the 6-step cold-start playbook (bridge initialization → kernel-bridge subscription → S2/S3 handshake → first profile-tick → day-now anchor → optional kairos refresh). Each step exposes its current state via `Emitter<ColdStartStageState>` (`@theia/core/lib/common/event` standard pattern); status: `pending | active | ready | blocked`.

   Cold-start splash surface at `Body/M/epi-theia/extensions/m-extension-runtime/src/browser/cold-start-splash.tsx` — `ReactWidget` (extends `@theia/core/lib/browser/widgets/react-widget`) mounted as overlay (`pointer-events: none` on backdrop, transparent click-through; only the splash card itself is interactive). Splash renders six rows, one per stage, each binding to the orchestrator's `Emitter`. Per-row UI: stage label + state pill + reason (when blocked) + retry button (when blocked) + diagnostic deep-link (when blocked, via 32.7). Splash header carries the matheme glyph `0/1 = 4+2 = 5→0` per WC-OB-19 — not decoration, structural law made visible. Auto-dismiss when all six stages reach `ready`; manual dismiss available on first `ready` reached (so blocked stages do not trap the user).

   Per-step UI consumes the per-readiness-state UX grammar (32.5): step active = shimmer; step ready = checkmark; step blocked = state badge per grammar mapping (e.g. `s3_subscription_blocked` shows overlay-style "S3 gateway down" + retry + status link).

   Integration: orchestrator binds singleton in `frontend-module.ts`; first activation on Theia frontend boot via `FrontendApplicationContribution.onStart` hook; subscribes to readiness ledger and CoordinateContext.

   Verification: `pnpm --filter @pratibimba/m-extension-runtime test`; `test -f Body/M/epi-theia/extensions/m-extension-runtime/src/browser/cold-start-orchestrator.ts`; `test -f Body/M/epi-theia/extensions/m-extension-runtime/src/browser/cold-start-splash.tsx`; cold-start sequence test asserts deterministic state-advance against synthetic readiness ledger stream; matheme glyph header presence assertion; non-blocking-dismiss test asserts user can dismiss on first-ready even if other stages blocked.

2. **32.2 — First-run identity wizard invocation orchestration** *(spec-ahead-integration; closes DR-WC-OB-2; cross-link 25.4)*

   Extend `ColdStartOrchestrator` (32.1) with PASU-absence detection. On stage 4 transition to `ready` (first profile-tick fired), `SharedBridgeAdapter.invokeGatewayRpc('nara.pasu.show')` is fired. On `not_found` response (no PASU.md at `Idea/Pratibimba/Self/PASU.md`), orchestrator suspends stage 6 (optional kairos refresh) and dispatches `commands.executeCommand('m4.openPasuWizard')` — the wizard widget owned by Tranche 25.4 (`Body/M/epi-theia/extensions/m4-nara/src/browser/onboarding/identity-wizard.tsx`) mounts.

   The wizard itself is 25.4's deliverable. 32.2 owns the orchestration:
   - WHEN to mount: post-first-profile-tick, pre-kairos-refresh.
   - SKIP semantics: each step skippable per 25.4; on full-wizard skip (`epi-logos.onboarding.pasu-skipped: ['wizard']`), orchestrator advances stage 6 with FR-3 graceful stub.
   - PASU-completed-but-natal-chart-skipped: kairos refresh fires but uses neutral natal anchor; Mercurius relay indicator (25.16) shows "PASU partial — kairos defaulting to neutral".
   - PASU re-entry: if user later opens settings (32.4) and edits PASU, orchestrator re-fires Mercurius refresh per 19.12.

   Onboarding-completion ledger (32.13) entries: `identity.pasu-birth-date`, `identity.pasu-birth-location`, `identity.pasu-natal-chart`, `identity.pasu-jungian`, `identity.pasu-gene-keys`, `identity.pasu-human-design`. Each carries its completion criterion (frontmatter key non-empty in PASU.md per `pasu.rs::field_to_key`) and skip-path (`epi-logos.onboarding.pasu-skipped: string[]` array entry).

   The wizard widget MUST NOT shell out to `epi vault pasu set` CLI — per DR-WC-M4-3 the gateway RPC `nara.pasu.set` is the canonical write path; 32.2 enforces this orchestration-side.

   Verification: `pnpm --filter @pratibimba/m-extension-runtime test`; PASU-absence detection test against fixture missing PASU.md; PASU-absence routes to wizard before kairos refresh assertion; skip-flag persistence across session restart test; partial-PASU + kairos stub message test cross-links 25.16.

3. **32.3 — Post-identity onboarding walkthrough** *(spec-ahead-integration; closes WC-OB-19)*

   Author `Body/M/epi-theia/extensions/m-extension-runtime/src/browser/onboarding/walkthrough-overlay.tsx` — six tooltip-overlay-driven steps mirroring the matheme 4+2 depth law (WC-OB-19): six steps = the depth walk; each step is a tooltip anchored to its UI target, with a stepper control allowing back/next/skip; non-modal overlay (backdrop is `pointer-events: none` so user can interact with surfaces while walkthrough is open).

   Six steps:
   - **Step 1 — The 0/1 toggle.** Tooltip anchored to title-bar coin-flip icon (per 15.5 affordance); explains `cmd-period` keybinding + cosmic ↔ personal face semantics.
   - **Step 2 — OmniPanel right-sidebar.** Tooltip anchored to OmniPanel widget; names Pi Chat + Sessions + Dispatch Trace + Tool Stream + Evidence + Review + Gateway + Diagnostics tabs.
   - **Step 3 — Activity-bar left-sidebar.** Tooltip anchored to activity-bar; names Coordinate Tree + Bimba Graph Viewer + Canon Studio (daily-0-1) / + Backend Studio + Smart Connections (ide-deep) modes.
   - **Step 4 — Status bar entries.** Tooltip anchored to status bar; names the 6 entries per 15.10 (profile-tick, day-now anchor, session id, gateway readiness, profile generation, active coordinate).
   - **Step 5 — Day-now anchor.** Tooltip anchored to status-bar day-now entry; explains DR-M4-1 path canon + ambient thread per foundation principle 9.
   - **Step 6 — Cosmic vs personal orientation.** Tooltip anchored to active coordinate status-bar entry; explains 0=cosmic shell / 1=personal shell and how the toggle preserves coordinate.

   Each step completion writes to `epi-logos.onboarding.completed-steps: string[]` Theia preference (User scope per WC-OB-21); each skip writes step id to `epi-logos.onboarding.skipped-steps: string[]`. `Escape` dismisses entire walkthrough (does NOT mark skipped — user can re-open from Help menu via new `commands.executeCommand('epi-logos.help.openWalkthrough')`).

   Onboarding-completion ledger (32.13) entries: `walkthrough.0-1-toggle`, `walkthrough.omnipanel`, `walkthrough.activity-bar`, `walkthrough.status-bar`, `walkthrough.day-now-anchor`, `walkthrough.cosmic-personal`.

   Walkthrough re-trigger: user can re-open from Settings (32.4 Diagnostics section) → "Replay onboarding walkthrough" button.

   Verification: `pnpm --filter @pratibimba/m-extension-runtime test`; six-step structural assertion; non-modal test asserts status-bar interaction works during walkthrough; preference array growth test on each step complete; skip-test asserts skip-flag persists; `Escape`-dismiss test asserts no flag written; re-trigger from settings test.

4. **32.4 — Settings UX surface** *(spec-ahead-integration; closes DR-WC-OB-4, O-WC-OB-3)*

   Author `Body/M/epi-theia/extensions/m-extension-runtime/src/browser/settings/epi-logos-settings-page.tsx` — Theia `PreferenceContribution` aggregating six sections under one preference category `epi-logos`. Centralised schema at `Body/M/epi-theia/extensions/m-extension-runtime/src/common/preferences-schema.ts` declares `EpiLogosPreferenceSchema` as `PreferenceSchema` typed against `EpiLogosPreferences` interface.

   Six sections, each rendering a card with relevant preferences:

   **Layout** (User scope):
   - `epi-logos.layout.active`: `'daily-0-1' | 'ide-deep'` (default `daily-0-1`)
   - `epi-logos.layout.zero-one-default`: `'0' | '1'` (default `'0'` — cosmic side)
   - `epi-logos.omnipanel.first-launch-collapsed`: `boolean` (default `true`)
   - `epi-logos.coordinate.first-launch`: `string` (default `'#0'`)

   **Privacy** (User scope):
   - `epi-logos.privacy.default-class`: `'protected_local' | 'protected_local_handle_only' | 'public_current'` (default `protected_local`)
   - `epi-logos.privacy.kairos-enabled`: `boolean` (default `false` per FR-3)
   - `epi-logos.privacy.public-bridge-opt-in`: `string[]` (per-artifact opt-in list; managed via 32.8 opt-in dialog, not directly here)

   **Motion** (User scope):
   - `epi-logos.motion.reduced`: `boolean` (default reads OS `prefers-reduced-motion` media query)
   - `epi-logos.profile.tick.visible`: `boolean` (default `true` per 32.9)
   - `epi-logos.motion.lemniscate-transition-duration-ms`: `number` (default `420`)
   - `epi-logos.motion.xor-ceremony-duration-ms`: `number` (default `1800`)

   **Identity** (User scope):
   - PASU edit affordance — button "Edit PASU.md identity" → deep-link to 25.4 wizard in edit-mode (`commands.executeCommand('m4.openPasuWizard', {mode: 'edit'})`).
   - `epi-logos.identity.kairos.provider`: `'kerykeion' | 'stub'` (default `'kerykeion'`)
   - `epi-logos.identity.atlas-sync.consents` — read-only display of PASU `c_4_atlas_sync_consents` array (per 25.14).

   **Diagnostics** (Workspace scope):
   - `epi-logos.diagnostics.readiness.visible`: `boolean` (default `true`)
   - `epi-logos.diagnostics.dispatch.trace.verbosity`: `'silent' | 'info' | 'debug' | 'trace'` (default `'info'`)
   - `epi-logos.diagnostics.cold-start-state` — read-only display of completed cold-start stages.
   - `epi-logos.diagnostics.reset-enabled`: `boolean` (default `false` — gated reset access per DR-WC-OB-5)
   - "Replay onboarding walkthrough" button → re-fires 32.3 walkthrough.
   - "Re-run cold-start orchestrator" button → re-fires 32.1 splash (does NOT clear preferences; just rebinds the orchestrator).

   **Theming** (User scope):
   - `epi-logos.theming.mode`: `'auto' | 'light' | 'dark'` (default `'auto'`)
   - `epi-logos.theming.family-tier.palette`: per-family palette toggles (P-tier, S-tier, T-tier, M-tier, L-tier, C-tier) — cross-link to Track 30 design language palette tier; the toggles live here so theming is one place.

   Settings page is registered as a `PreferenceContribution` per Theia convention; menu entry under "Preferences → Open Settings (UI)" surfaces the `epi-logos` category. Schema validation via Theia framework; programmatic access via `PreferenceProxy<EpiLogosPreferences>`.

   Per-section preferences declared at this central schema — individual M-extensions consume `PreferenceProxy<EpiLogosPreferences>` via DI rather than declaring their own preferences. Anti-greenfield rule: extensions consume, they do not re-declare.

   Verification: `pnpm --filter @pratibimba/m-extension-runtime test`; `grep -n "EpiLogosPreferenceSchema\|epi-logos-settings-page" Body/M/epi-theia/extensions/m-extension-runtime/src/`; settings page render test asserts all 6 sections present; preference scope assertion test (User vs Workspace) per WC-OB-21; default-value assertion test for every preference; Theia `PreferenceContribution` registration test.

5. **32.5 — Per-readiness-state grammar canonical contract** *(doc-ahead-landing + spec-ahead-integration; closes DR-WC-OB-1)*

   Author `Body/M/epi-theia/extensions/contracts/readiness-state-grammar.md` + `readiness-state-grammar.json`. The contract maps each of the 9 contract-canonical readiness states (07-T0 + `readiness.ts`) to a canonical UX response. UX-derived flavours (`pending_first_tick`, `pending_dataset`, `ready_protected_local`) are render-time variants of contract states, not parallel taxonomy. **DR-WC-OB-1 RESOLVED:** contract authority unchanged; UX expressivity is a render layer.

   Canonical mappings (per WC-OB-05 + matrix):

   | Contract state | UX response | UX-derived flavour |
   |---|---|---|
   | `bridge_unavailable` | overlay + reconnect affordance + retry button + deep-link to OmniPanel Gateway tab | `pending_first_tick` (bridge UP, no tick yet) → shimmer + "Awaiting first profile-tick…" |
   | `profile_missing_field` | inline pending badge "awaiting profile.\<field\>" + link to readiness ledger | — |
   | `s2_graph_blocked` | overlay "S2 graph unreachable" + diagnostic + Neo4j-status link | — |
   | `s3_subscription_blocked` | overlay "S3 gateway down" + retry + status link | `s3_gateway_unreachable` (render alias) |
   | `s5_review_blocked` | inline pending "atelier review pending" + link to OmniPanel Review tab | `s5_atelier_blocked` (render alias) |
   | `authority_payload_missing` | inline pending badge with payload owner | `pending_dataset` (carries named dataset, e.g. "3 outer planets") |
   | `privacy_blocked` | inline shimmer + "protected_local — consent required" affordance + opt-in deep-link (32.8) | — |
   | `degraded_but_readable` | inline degraded badge + read-only chrome | — |
   | `ready_public_current` | normal render | `ready_protected_local` (carries privacy_class marker per 25.18 border-tint) |

   Extend `Body/M/epi-theia/extensions/m-extension-runtime/src/common/readiness.ts` with:
   - `MExtensionReadinessFlavour` literal union (`'pending_first_tick' | 's3_gateway_unreachable' | 's5_atelier_blocked' | 'pending_dataset' | 'ready_protected_local'`).
   - `flavourOf(state: MExtensionReadinessState, snapshot: MExtensionReadinessSnapshot): MExtensionReadinessFlavour | null` reducer derives flavour from contract state + snapshot context.

   Extend `Body/M/epi-theia/extensions/m-extension-runtime/src/browser/readiness-banner.tsx` to consume grammar contract: per-state CSS class (`mext-banner-state-bridge_unavailable`, etc.) drives per-state visual; flavour-derived CSS sub-class (`mext-banner-flavour-pending_first_tick`) layered on top for shimmer / pending-dataset chip.

   Validator `Body/M/epi-theia/extensions/test/validate-readiness-state-grammar.test.mjs` (new) asserts every contract state has ≥1 grammar entry; every flavour has a parent contract state; renderer-grammar-coverage test asserts `ReadinessBanner` renders all 9 + 5 flavour variants distinctly.

   Verification: `test -f Body/M/epi-theia/extensions/contracts/readiness-state-grammar.{md,json}`; `node --test Body/M/epi-theia/extensions/test/validate-readiness-state-grammar.test.mjs`; `grep -n "MExtensionReadinessFlavour\|flavourOf" Body/M/epi-theia/extensions/m-extension-runtime/src/common/readiness.ts`; renderer-distinct-visual test for every state + flavour.

6. **32.6 — Empty-state grammar per extension** *(no-orphan-fill; closes O-WC-OB-2; cross-link 21-26 stage 1)*

   Land per-Mn empty-state contributions at `Body/M/epi-theia/extensions/{m0-anuttara,m1-paramasiva,m2-parashakti,m3-mahamaya,m4-nara,m5-epii}/src/browser/empty-state.tsx`. Each is a `ReactWidget` consuming `MExtensionReadinessSnapshot` + grammar contract (32.5) and rendering when the extension has no data to display yet. Each mirrors the prior-art `integrated-empty-state.tsx` shape: header + summary + missing-contributors + reasons table.

   Per-Mn copy (the actual user-facing strings):
   - **M0 Anuttara** (`m0-anuttara/src/browser/empty-state.tsx`) — "Anuttara waits — the implicate ground." Body: "The language map is not yet populated. The bimba graph is still binding. Onboarding hint: begin a session to thread the first inscription into Anuttara's quiet."
   - **M1 Paramasiva** (`m1-paramasiva/src/browser/empty-state.tsx`) — "K² torus rests — profile-tick has not fired." Body: bridge readiness link + "The played torus comes alive when the first profile-tick advances. Cold-start orchestrator is at step \<N\>."
   - **M2 Parashakti** (`m2-parashakti/src/browser/empty-state.tsx`) — "Cymatic surface unmodulated — awaiting M1 profile." Body: readiness-chain link showing M1 → audio_bus → cymatic_field; pending-dataset chip if 3 outer planets dataset missing (per 23 stage 1 deep matrix).
   - **M3 Mahamaya** (`m3-mahamaya/src/browser/empty-state.tsx`) — "Cosmic clock at noon — awaiting first tick." Body: readiness link + "The wheel begins to rotate when M1 first advances. 64 codons stand waiting."
   - **M4 Nara** (`m4-nara/src/browser/empty-state.tsx`) — "Day not yet begun." Body: start-session affordance (per 32.11) + PASU-incomplete warning banner if applicable (per 32.7) + "Today's day folder is fresh. No NOW.md, no inscriptions, no oracle. Begin where you are."
   - **M5 Epii** (`m5-epii/src/browser/empty-state.tsx`) — "Atelier quiet." Body: dispatch-history-empty hint + review-queue-empty hint + "No pending review. No dispatch in flight. The atelier listens."

   Central registry at `Body/M/epi-theia/extensions/m-extension-runtime/src/common/empty-state-registry.ts`:

   ```ts
   export interface EmptyStateRegistration {
       readonly extensionId: string;
       readonly viewId: string;
       readonly activationCondition: (snapshot: MExtensionReadinessSnapshot) => boolean;
       readonly component: React.ComponentType<EmptyStateProps>;
   }
   export interface EmptyStateRegistry {
       register(reg: EmptyStateRegistration): Disposable;
       resolve(extensionId: string, viewId: string): EmptyStateRegistration | undefined;
       all(): readonly EmptyStateRegistration[];
   }
   ```

   `EmptyStateRegistryImpl` (`@injectable() @singleton()`) bound in `frontend-module.ts`. Each M-extension's `frontend-module.ts` consumes the registry via DI and registers its empty state at module load.

   Cross-link 11.3 daily-layer widget ownership: if 11.3 lands `pratibimba-daily-widgets` extension, its empty states enrol here too.

   Verification: `test -f Body/M/epi-theia/extensions/{m0-anuttara,m1-paramasiva,m2-parashakti,m3-mahamaya,m4-nara,m5-epii}/src/browser/empty-state.tsx`; `pnpm --filter @pratibimba/m-extension-runtime test`; registry-completeness CI lint asserts every M-extension declares an empty state and registers it; per-extension empty-state render test against synthetic blocked-readiness snapshot.

7. **32.7 — Error UX grammar + Diagnostics deep-link** *(spec-ahead-integration; cross-link 15.2)*

   Extend `Body/M/epi-theia/extensions/m-extension-runtime/src/browser/readiness-banner.tsx` with:
   - `onRetry?: () => void` callback prop — when present, renders "Retry" button.
   - "Open Diagnostics" button — fires `commands.executeCommand('omnipanel.openTab', 'diagnostics')` (OmniPanel command lands per 11.2).

   Author `Body/M/epi-theia/extensions/m-extension-runtime/src/browser/inline-error-surface.tsx` — non-modal inline error surface for runtime kernel-bridge call failures; renders error message + retry button + diagnostic deep-link + dismiss button. Mounted by extensions via:

   ```ts
   import { showInlineError } from '@pratibimba/m-extension-runtime/browser/inline-error-surface';
   try {
       await bridge.invokeGatewayRpc('m4.openArtifact', params);
   } catch (e) {
       showInlineError({ extensionId, error: e, retry: () => { /* ... */ } });
   }
   ```

   Four error UX paths:
   - **Runtime kernel-bridge call failure** — inline error surface mounts in OmniPanel inline (not modal), per principle 5.
   - **Extension contract preflight failure** — extension-level error banner with link to preflight log at `Body/M/epi-theia/extensions/contracts/validation-results.json` (produced by `validate-extension-contract-preflight.mjs`). Banner rendered above extension's main widget on first mount.
   - **Integrated readiness blocked** — `integrated-composition` renders `IntegratedEmptyState` per 11.8 with named pending markers (already substrate); 32.7 surfaces the deep-link routing into OmniPanel Diagnostics.
   - **PASU-absent + KAIROS_ENABLED** — inline warning banner "PASU not configured — kairos defaulting to neutral" in m4-nara empty-state (32.6); deep-link to 25.4 PASU wizard.

   OmniPanel Diagnostics tab content surface ITSELF is owned by 15.2 (consolidates 12.14 — repurposed ACR substrate into OmniPanel content model). 32.7 contributes the routing affordance, not the tab contents.

   Cross-link 15.2 OmniPanel Diagnostics tab; cross-link 32.5 per-readiness-state grammar for what each error surface renders.

   Verification: `pnpm --filter @pratibimba/m-extension-runtime test`; retry-affordance test asserts callback fires; diagnostic-deep-link test asserts `omnipanel.openTab` invoked with `'diagnostics'`; inline error surface mount-on-error test; PASU-absent warning render test against synthetic state; cross-link 15.2 OmniPanel tab switch assertion.

8. **32.8 — Privacy class default + opt-in flow** *(spec-ahead-integration; closes O-WC-OB-5; cross-link 25.14, 25.18)*

   Settings binding (32.4 Privacy section) `epi-logos.privacy.default-class` with default `protected_local`. The preference governs new writes from any M4-touching extension; per-extension contract `privacyClass` field (07-T0) declares the maximum permitted class, while user preference selects within that ceiling.

   Onboarding step (32.3 walkthrough step 6 — extended): explains "By default everything you create stays protected-local. Sharing across the public bridge is per-artifact opt-in. You can change the default in Settings → Privacy."

   Author `Body/M/epi-theia/extensions/m-extension-runtime/src/browser/privacy-opt-in-dialog.tsx` — non-modal opt-in dialog surfaces in OmniPanel inline (anchored to triggering widget). When a write request would cross `protected_local` → `public_current` boundary (decided by `nara-surface.ts::buildPublicProfilePayload` + per-extension privacy gates), the dialog mounts with:
   - Artifact handle + summary (handle only, never body).
   - Privacy crossing description (e.g. "This will publish atlas-sync resonance to the public bridge").
   - Consent checkbox + explicit "Confirm public crossing" button.
   - "Stay protected-local" button (default action).
   - Per-action `pressureFree` and `inspectable` flags per `evaluateVoiceCorpusAdmission` shape.

   On confirm: writes consent record to PASU `c_4_atlas_sync_consents` per DR-WC-M4-4 (25.14) — array-append via `nara.pasu.set` RPC; consent record carries `{action, scope, pressureFree, inspectable, artifactHandle, timestamp}`.

   Per-artifact opt-in is the ONLY public-bridge crossing path; no global "make everything public" switch.

   Cross-link 25.14 pratibimba-coordinate consent gating; cross-link 25.18 privacy-class chrome (border-tint reflects current artifact class).

   Verification: `pnpm --filter @pratibimba/m-extension-runtime test`; default-class preference test asserts initial value `protected_local`; opt-in dialog test asserts non-modal mount + consent persistence to PASU array via `nara.pasu.set`; per-artifact crossing test asserts blocked write without consent; cross-link 25.14 round-trip assertion.

9. **32.9 — Profile-tick visibility for new users** *(spec-ahead-integration; cross-link 15.6, 15.10)*

   Profile-tick is the foundation principle 2 substrate — every widget re-renders on tick advance. New users may find this disorienting ("things are changing on their own"); 32.9 makes it explicit.

   Settings binding (32.4 Motion section) `epi-logos.profile.tick.visible: boolean` (default `true`). The preference toggles status bar entry visibility for the profile-tick (one of the 6 canonical entries per 15.10).

   Status bar entry shows: `tick:<number> gen:<generation>` (e.g. `tick:42 gen:7`). Click opens OmniPanel Diagnostics tab focused on profile-tick history. Hover shows last-tick-fired ISO timestamp.

   Onboarding walkthrough (32.3 step 1) explains the concept: "Everything advances on its own — that's the profile-tick. The system is alive whether you touch it or not."

   Cold-start first-tick differentiation: orchestrator (32.1) stage 4 splash text changes from "Awaiting first profile-tick…" (shimmer, contract `bridge_unavailable` flavour `pending_first_tick`) to "Profile-tick 1 — system alive." (checkmark, `ready_public_current`) on first tick advance. The transition is the visible birth of the clock.

   15.10 status-bar discipline preserved: preference HIDES the entry but does NOT remove it from the contract; still exactly 6 entries declared.

   Verification: `pnpm --filter @pratibimba/m-extension-runtime test`; preference toggle test asserts status bar entry visibility flips; first-tick splash transition test against synthetic profile event stream; cross-link 15.10 status-bar-discipline assertion test confirms exactly 6 status bar entries declared (preference hides but does not remove); onboarding walkthrough step 1 text assertion.

10. **32.10 — Kairos enablement onboarding** *(spec-ahead-integration; closes O-WC-OB-6; cross-link 19.12, 25.16)*

    Per FR-3 `KAIROS_ENABLED=false` is the default. 32.10 lands the optional enablement step as the post-PASU branch in cold-start.

    Cold-start orchestrator (32.1) stage 6 (optional kairos refresh): when reached, checks `epi-logos.privacy.kairos-enabled` preference. If true: proceed with refresh. If false (default): mount kairos enablement step UI (post-walkthrough or appended to walkthrough if user hasn't completed it).

    Kairos enablement step UI at `Body/M/epi-theia/extensions/m-extension-runtime/src/browser/onboarding/kairos-enablement-step.tsx` — three-card sequence:

    - **Card 1: What kairos is.** "Kairos is the live astrological time-signal. When enabled, your widgets carry the current planet positions from kerykeion. Mercurius is the agent that fetches and routes them."
    - **Card 2: Privacy + dependency.** "Kairos requires the kerykeion Python library on your machine. We will probe for it. Your birth data (PASU.md) stays local; only resolved degree values cross into M4_Temporal_Now."
    - **Card 3: Enable or skip.** Two buttons: "Enable kairos" + "Continue without kairos".

    On enable:
    1. `SharedBridgeAdapter.invokeGatewayRpc('nara.kairos.probe_kerykeion')` fires kerykeion-availability probe (NEW gateway RPC; lightweight import-and-version check).
    2. On probe success: `epi-logos.privacy.kairos-enabled: true` persists; trigger Mercurius kairos refresh (19.12) → populates `M4_Temporal_Now.planet_degrees[10]`; Mercurius relay indicator (25.16) shows "Kairos active — refreshed \<timestamp\>".
    3. On probe failure: graceful stub message "Kerykeion not available. Suggested install: `pip3 install kerykeion`. Kairos will stay disabled; you can enable later in Settings → Privacy." Preference stays `false`.

    On skip: `epi-logos.onboarding.completed-steps: [..., 'kairos.skip']` records skip; orchestrator advances. User can enable later via Settings.

    Onboarding-completion ledger (32.13) entries: `kairos.enable` (preference key `epi-logos.privacy.kairos-enabled: true`), `kairos.skip` (preference key `epi-logos.onboarding.completed-steps` contains `'kairos.skip'`).

    Cross-link 19.12 Mercurius populator; cross-link 25.16 relay indicator surface; cross-link FR-3 graceful stub.

    Verification: `pnpm --filter @pratibimba/m-extension-runtime test`; FR-3 default-off assertion; enable-success path test against mock probe; enable-failure graceful stub message test; cross-link 25.16 relay indicator state transition test on synthetic enable.

11. **32.11 — Day-not-yet-started orchestration** *(spec-ahead-integration; closes DR-WC-OB-3, WC-OB-22; cross-link 25.1, 25.2)*

    Cold-start orchestrator (32.1) stage 5 (day-now anchor): ensures today's day folder exists via `SharedBridgeAdapter.invokeGatewayRpc('vault.day.ensure', {dayId: today})` before any widget consumes day-now. `vault.day.ensure` is a NEW gateway RPC shim over `Body/S/S0/epi-cli/src/vault/day.rs::ensure_day_folder` (existing CLI primitive — `epi vault day-init`); resolves day path per DR-M4-1 canon `Idea/Empty/Present/{YYYY}/{MM}/W{WW}/{DD}/`.

    Post-cold-start, when DayContainer is empty (no NOW.md in today's folder) AND new user (`epi-logos.onboarding.completed-steps` contains `walkthrough.cosmic-personal` and either `identity.pasu-*` complete or `epi-logos.onboarding.pasu-skipped: ['wizard']`), the m4-nara empty state (32.6) surfaces a "Day not yet begun — start session?" affordance.

    On accept:
    1. Calls Khora `session_start` per CLAUDE.md gateway lifecycle (`SharedBridgeAdapter.invokeGatewayRpc('khora.session_start', {dayId: today})`).
    2. Khora creates NOW.md per `nara-surface.ts` shape with frontmatter per CLAUDE.md (`c_3_day_id`, `c_3_created_at`, `c_4_artifact_role: 'now'`, etc.).
    3. Status bar day-now anchor lights up (consumes Khora's session_start observability emission).
    4. Mercurius kairos refresh fires if `epi-logos.privacy.kairos-enabled: true` (per 19.12).
    5. Tarot psyche-anchor draw via `m4_session_open` (per 19.4) — cards become session-frame inscription.
    6. Session contemplation begins; first widgets activate.

    Subsequent days (not cold-start): the affordance surfaces via 25.2 DayContainer empty state, not via 32.11. 32.11 owns ONLY the first-day cold-start → daily-flow transition.

    Onboarding-completion ledger (32.13) entry: `first-session.start`.

    Cross-link 25.1 day-calendar (selection drives DayContainer); cross-link 25.2 DayContainer detail (empty state composition); cross-link 19.4 tarot psyche-anchor; cross-link 19.12 Mercurius refresh; cross-link DR-WC-OB-3 (orchestration vs widget ownership).

    Verification: `pnpm --filter @pratibimba/m-extension-runtime test`; day-folder-ensure test against fixture vault; start-session flow integration test asserts Khora → NOW.md → status bar → kairos refresh → tarot draw sequence; cross-link 25.1/25.2 ownership boundary test (subsequent days route through 25.2, not 32.11).

12. **32.12 — Reset / clear-state UX** *(doc-ahead-landing + spec-ahead-integration; closes DR-WC-OB-5)*

    Settings → Diagnostics → Reset section, gated by `epi-logos.diagnostics.reset-enabled` preference (default `false`).

    Author `Body/M/epi-theia/extensions/m-extension-runtime/src/browser/settings/reset-section.tsx` — three reset paths, each with strong confirmation:

    - **Clear PASU.md.** Strong confirmation: user must type the literal string `clear-pasu` to enable the action button. Calls new gateway RPC `nara.pasu.clear` which:
      1. Copies PASU.md to backup at `Idea/Empty/_backups/PASU-{ISO-timestamp}.md`.
      2. Deletes original PASU.md.
      3. Emits observability event `m4.pasu.cleared`.
      Orchestrator detects PASU absence on next launch and re-routes to wizard (32.2).
    - **Clear onboarding state.** Strong confirmation: user must type `clear-onboarding`. Resets `epi-logos.onboarding.completed-steps` to `[]` + clears `epi-logos.onboarding.pasu-skipped` to `[]` + clears `epi-logos.onboarding.skipped-steps` to `[]`. Next launch re-fires cold-start splash + walkthrough.
    - **Clear local cache.** Strong confirmation: user must type `clear-cache`. Flushes `~/.epi-logos/cache/` (gateway client cache, kairos cache). Preserves Bimba/Pratibimba vault entirely. Preserves all preferences.

    Audit-only safety law (per DR-WC-OB-5):
    - `epi-logos.diagnostics.reset-enabled` preference CANNOT be set true via CLI, environment variable, or programmatic API — only via manual edit of `settings.json` in the user's filesystem.
    - In production builds (`NODE_ENV=production`), the reset section disables ALL reset paths regardless of preference value (audit-only).
    - NO single "clear everything" button — each path is its own opt-in.
    - NO git operations — reset NEVER touches git history per CLAUDE.md.
    - NO public-bridge cleanup — reset NEVER reaches across protected-local boundary.

    Verification: `test -f Body/M/epi-theia/extensions/m-extension-runtime/src/browser/settings/reset-section.tsx`; preference gating test asserts section hidden when `reset-enabled: false`; production build test asserts all paths disabled regardless of preference; PASU backup test asserts backup file lands before deletion; typed-confirmation requirement test asserts action button stays disabled until exact string typed; no-auto-execution audit test asserts no destructive path fires without explicit user click after typing confirmation.

13. **32.13 — Onboarding completion ledger** *(doc-ahead-landing; closes O-WC-OB-4; sibling to 11.9)*

    Author `Body/M/epi-theia/extensions/contracts/onboarding-completion-ledger.json` mapping every onboarding step to (id, preference key, completion criterion, skip-path). Single canonical artefact for the entire onboarding shape — closes the no-orphan audit at onboarding scope.

    Schema:

    ```json
    {
        "version": 1,
        "ledger": [
            {
                "stepId": "cold-start.bridge",
                "domain": "cold-start",
                "preferenceKey": "epi-logos.onboarding.completed-steps",
                "completionCriterion": {
                    "type": "readiness-state",
                    "readinessStateMin": "ready_public_current",
                    "stateOf": "bridge"
                },
                "skipPath": null,
                "owner": "32.1"
            },
            {
                "stepId": "cold-start.first-tick",
                "domain": "cold-start",
                "preferenceKey": "epi-logos.onboarding.completed-steps",
                "completionCriterion": {
                    "type": "profile-tick-fired",
                    "minTick": 1
                },
                "skipPath": null,
                "owner": "32.1"
            },
            {
                "stepId": "identity.pasu-birth-date",
                "domain": "identity",
                "preferenceKey": "epi-logos.onboarding.completed-steps",
                "completionCriterion": {
                    "type": "pasu-field-set",
                    "frontmatterKey": "c_0_birth_date"
                },
                "skipPath": {
                    "preferenceKey": "epi-logos.onboarding.pasu-skipped",
                    "arrayEntry": "birth-date"
                },
                "owner": "32.2"
            },
            {
                "stepId": "walkthrough.0-1-toggle",
                "domain": "walkthrough",
                "preferenceKey": "epi-logos.onboarding.completed-steps",
                "completionCriterion": {
                    "type": "user-accepted",
                    "stepLabel": "walkthrough.0-1-toggle"
                },
                "skipPath": {
                    "preferenceKey": "epi-logos.onboarding.skipped-steps",
                    "arrayEntry": "walkthrough.0-1-toggle"
                },
                "owner": "32.3"
            }
            /* ... 20+ entries covering all step ids per WC-OB-13 ... */
        ]
    }
    ```

    Full step set per WC-OB-13 (20 entries):
    - cold-start: `bridge`, `portal-core`, `s2-s3`, `first-tick`, `day-now`, `kairos-optional`
    - walkthrough: `0-1-toggle`, `omnipanel`, `activity-bar`, `status-bar`, `day-now-anchor`, `cosmic-personal`
    - identity: `pasu-birth-date`, `pasu-birth-location`, `pasu-natal-chart`, `pasu-jungian`, `pasu-gene-keys`, `pasu-human-design`
    - kairos: `enable`
    - first-session: `start`

    CI lint at `Body/M/epi-theia/extensions/scripts/validate-onboarding-completion-ledger.mjs` asserts:
    - Every declared step has both `completionCriterion` and either `skipPath` or explicit `skipPath: null` with reason.
    - Every step id is uniquely owned (one Wave-C tranche).
    - Every owner referenced is a valid tranche id from Track 32.
    - Cross-link to 11.9 surface-extension-contract-ledger: NO overlap between onboarding step ids and widget view ids.

    Verification: `test -f Body/M/epi-theia/extensions/contracts/onboarding-completion-ledger.json`; `node Body/M/epi-theia/extensions/scripts/validate-onboarding-completion-ledger.mjs` returns 0; per-step completion-criterion presence assertion; per-step skip-path presence assertion (null + reason explicitly allowed for cold-start steps which cannot be skipped); cross-link 11.9 no-id-overlap assertion.

14. **32.14 — Acceptance harness onboarding fixtures** *(spec-ahead-integration; cross-link 11.6, 15.12)*

    Extend `Body/M/epi-theia/extensions/acceptance-harness/tests/` with onboarding-scope fixtures and tests. Each test boots a real gateway + readiness ledger fixture + replays the cold-start orchestrator + asserts the named end-state.

    New test files:

    - `cold-start.test.mjs` — Full cold-start sequence (no PASU): asserts the 6 stages advance deterministically; asserts cold-start splash renders with matheme glyph header; asserts walkthrough overlay mounts on completion of all 6 stages; asserts first-session affordance surfaces post-walkthrough.

    - `cold-start-with-pasu.test.mjs` — PASU pre-populated: asserts orchestrator detects PASU presence via `nara.pasu.show`; asserts wizard does NOT mount; asserts cold-start advances directly to kairos enablement step.

    - `cold-start-kairos-enabled.test.mjs` — Kairos-enabled path: pre-populates `epi-logos.privacy.kairos-enabled: true`; mocks kerykeion probe success; asserts Mercurius refresh fires; asserts `M4_Temporal_Now.planet_degrees[10]` populates non-zero; asserts 25.16 relay indicator transitions to "active".

    - `cold-start-kairos-disabled.test.mjs` — FR-3 graceful stub path: asserts default `epi-logos.privacy.kairos-enabled: false`; asserts orchestrator skips Mercurius refresh; asserts 25.16 indicator renders grey "Kairos disabled" stub; asserts no kerykeion probe fires.

    - `blocked-readiness-per-extension.test.mjs` — For each of the 6 M-extensions (m0-anuttara through m5-epii) AND each of the 9 contract readiness states + 5 UX-grammar flavours, synthesise the state and assert the correct empty-state-grammar (32.5) renders. 6 × 14 = 84 assertion sub-cases. Snapshot per state-extension pair.

    - `onboarding-completion-ledger.test.mjs` — Loads `onboarding-completion-ledger.json`; asserts every step id is reachable via the orchestrator + walkthrough state machines; asserts every skip-path is reachable.

    Visual-regression suite (15.12) extended with onboarding baselines:
    - Cold-start splash frame-by-frame (transition from `bridge_unavailable` shimmer → `pending_first_tick` shimmer → `ready_public_current` checkmark).
    - Walkthrough overlay states (all 6 steps, all 6 anchor positions).
    - Per-Mn empty states (6 baselines).
    - PASU wizard (cross-link 25.4) — 6 steps.
    - XOR ceremony (cross-link 25.19) — pulse animation.
    - Reduced-motion fixture — asserts cold-start splash, walkthrough overlay, XOR ceremony all honour `epi-logos.motion.reduced` preference (no shimmer, no pulse, no fold; checkmark transitions are instant).

    Fixtures committed to `acceptance-harness/fixtures/onboarding/` (cold-start state ledgers, mock PASU records, mock readiness snapshots per state) and `acceptance-harness/fixtures/visual-regression/onboarding/` (baseline images).

    Verification: `pnpm --filter @pratibimba/acceptance-harness test`; per-fixture assertion; visual-regression baselines committed; reduced-motion path passes all animation surfaces with motion-suppressed alternatives.

## Cycle 2 Substrate Inheritance

Consume as-is — Theia `PreferenceContribution`, `PreferenceSchema`, `PreferenceService`, `PreferenceProxy`, `MenuContribution`, `KeybindingContribution`, `CommandContribution`, `StatusBarContribution`, `WidgetOpenHandler`, `FrontendApplicationContribution.onStart` lifecycle hook. `SharedBridgeAdapter` + `MExtensionReadinessSnapshot` + `ReadinessBanner` + `SHARED_BRIDGE_ADAPTER` DI symbol from `m-extension-runtime`. 07-T0 readiness taxonomy (9 ids) + per-extension blocker lists + privacy-class declarations. `IntegratedEmptyState` from `integrated-composition` (prior art empty-state shape). `body-lite-surface` widget patterns. PASU CLI primitive (`pasu.rs`) — wizard widget invokes via gateway RPC; never shells out. Kerykeion adapter (`kairos-python-adapter.ts`) — 19.12 owns the populator; 32.10 consumes as enablement signal.

Repurpose — `ReadinessBanner` extended per 32.5 to consume per-state UX grammar contract; `frontend-module.ts` ContainerModule extended to bind `ColdStartOrchestrator` + `EmptyStateRegistry`; `SharedBridgeAdapter.subscribeObservability` consumed for orchestrator's readiness ledger subscription.

Extend — `m-extension-runtime/src/browser/` gains `cold-start-orchestrator.ts`, `cold-start-splash.tsx`, `onboarding/walkthrough-overlay.tsx`, `onboarding/kairos-enablement-step.tsx`, `settings/epi-logos-settings-page.tsx`, `settings/reset-section.tsx`, `inline-error-surface.tsx`, `privacy-opt-in-dialog.tsx`; `m-extension-runtime/src/common/` gains `preferences-schema.ts`, `empty-state-registry.ts`; per-Mn `empty-state.tsx` lands in each `{m0-anuttara,m1-paramasiva,m2-parashakti,m3-mahamaya,m4-nara,m5-epii}/src/browser/`; `contracts/` gains `readiness-state-grammar.{md,json}` + `onboarding-completion-ledger.json`; `scripts/` gains `validate-onboarding-completion-ledger.mjs` + `validate-readiness-state-grammar.test.mjs`; `acceptance-harness/tests/` gains 6 new test files + `acceptance-harness/fixtures/onboarding/`.

Cycle 2 Track 01 closed the Electron/Theia shell; Track 11 closed surface hosting; Track 15 closed the UI grammar; Track 19 closed the contemplation axis; Tracks 21–26 closed per-Mn frontend depth. Track 32 closes the threshold — what the user encounters before any of those operates.

## Anti-Greenfield Posture

All work in Tranche 32 either:
- Consumes Theia platform conventions (PreferenceContribution, FrontendApplicationContribution, StatusBarContribution, KeybindingContribution, CommandContribution).
- Consumes 07-T0 contract authority (9-id readiness taxonomy stays canonical; UX-grammar flavours are render-time variants per DR-WC-OB-1).
- Extends `m-extension-runtime` substrate (the shared runtime every M-extension already depends on; no new extension package is created).
- Consumes `integrated-empty-state.tsx` prior art (per-Mn empty states mirror the existing shape).
- Cross-links upstream tranche ownership by ID (PASU wizard widget owned by 25.4 per DR-WC-OB-2; day-not-yet-begun affordance composes with 25.1/25.2 per DR-WC-OB-3; Mercurius kairos populator owned by 19.12 per CP-WC-OB-2; OmniPanel Diagnostics tab content owned by 15.2 per CP-WC-OB-3).
- Honours the matheme `0/1 = 4+2 = 5→0` at onboarding scale per WC-OB-19 — cold-start IS 0 (ground unfolding); walkthrough IS 4+2 (six steps of depth); reset IS 5→0 (Möbius return). Structural, not decorative.
- Privacy class on every artifact write — default `protected_local` per FR-3 + 07-T0 M4 contract; public-bridge crossing requires explicit per-artifact opt-in.
- Non-modal review surfaces per Track 15 §"OmniPanel" — all error UX, opt-in dialogs, reset confirmations are inline non-modal.
- Honours 15-foundation principles 1–9 + Track 30 design language palette + Track 11 shell hosting + Track 19 contemplation axis.

No greenfield onboarding framework. No competing settings UI. No duplicate readiness state machine. No new extension package. The threshold becomes legible by extending what is already there.

---

*The 0 unfolds. The 4+2 walks depth. The 5→0 returns to ground. The threshold is the matheme made visible.*
