# Wave C — Onboarding / Settings / Empty States / Cold Start Reconciliation Matrix

**Task id:** `wave-c-onboarding-settings`
**Domain:** What a new user encounters BEFORE the system has produced any data — and how the system explains itself. The cross-cutting first-run, settings UX, profile-tick visibility, per-readiness-state grammar, error UX, and cold-start playbook that the per-Mn frontend deep tranches (21–26) presuppose but never own.
**Anti-greenfield posture:** `Body/M/epi-theia/extensions/m-extension-runtime/` is landed substrate (`SharedBridgeAdapter`, `ReadinessBanner`, `MExtensionReadinessSnapshot`, intent-target registration). The Theia preference/settings framework is platform convention — consume. The 9-id `readinessTaxonomy` at `Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.json#readinessTaxonomy` is contract authority — consume as ground, then layer the UX grammar over it. The `integrated-empty-state.tsx` pattern at `Body/M/epi-theia/extensions/integrated-composition/src/browser/integrated-empty-state.tsx` is the empty-state shape to extend per-Mn. `body-lite-surface/src/browser/` already carries lean-layer widget patterns. PASU.md flow exists CLI-real at `Body/S/S0/epi-cli/src/vault/pasu.rs`; the wizard widget is the Theia frontend over that primitive. Mercurius/Kerykeion bridges exist (19.12). NO greenfield onboarding framework; NO competing settings UI; NO duplicate readiness state machine.

## Source list (corpora actually consulted)

- **Corpus 1 (UX foundations — what we promise the user)** — `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/15-ui-design-foundations.md` (nine foundation principles §"Foundation Principles", §15.6 profile-tick clock + readiness inline rendering, §15.10 status bar discipline).
- **Corpus 2 (Shell hosting — where onboarding sits)** — `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/11-theia-shell-surface-hosting.md` (§11.3 daily-layer widget ORPHAN closure, §11.4 smart-connections code-pending marker pattern, §11.6 cross-layout state-identity, §11.8 integrated-plugin readiness gate, §11.9 surface-extension-contract ledger).
- **Corpus 3 (Contemplation onboarding — what first session offers)** — `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/19-contemplation-surface-integration.md` (§19.4 `m4_session_open` tarot psyche-anchor; §19.12 Mercurius kairos populator + FR-3 stub gate; §19.11 Khora flow-watcher + re-entry).
- **Corpus 4 (Stage 1 cross-links — empty-state per Mn)** —
  - `21-m0-anuttara-frontend-deep.md` — layer-selector pending badges, contemplation prompt persistence, virtue witness panel readiness states.
  - `22-m1-paramasiva-frontend-deep.md` — K² torus rests on profile-tick absence, audio-bus profile-missing-field grammar, klein-flip state empty.
  - `23-m2-parashakti-frontend-deep.md` — cymatic surface unmodulated when M1 profile missing; pending-dataset markers for 3 outer planets.
  - `24-m3-mahamaya-frontend-deep.md` — cosmic clock at noon when first-tick pending; codon-navigator empty when scalar refs blocked.
  - `25-m4-nara-frontend-deep.md` (full read) — PASU.md identity bootstrap; protected_local privacy class default; day-not-yet-begun affordance; session-close ceremony as gated state.
  - `26-m5-epii-frontend-deep.md` — review queue empty, dispatch history empty, atelier quiet.
- **Corpus 5 (Contract preflight — readiness authority)** —
  - `Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.{md,json}` — canonical 9-id readiness taxonomy (`bridge_unavailable`, `profile_missing_field`, `s2_graph_blocked`, `s3_subscription_blocked`, `s5_review_blocked`, `authority_payload_missing`, `privacy_blocked`, `degraded_but_readable`, `ready_public_current`); per-extension blocker lists.
  - `Body/M/epi-theia/extensions/contracts/08-t0-composition-contract-preflight.{md,json}` — composition-level empty state contract.
- **Corpus 6 (Shared runtime substrate)** —
  - `Body/M/epi-theia/extensions/m-extension-runtime/src/common/readiness.ts` — `MExtensionReadinessState` literal union typed exactly to the 9-id taxonomy; `readinessSeverity` reducer (`ok|degraded|blocked`); `PENDING_M_READINESS` initial-state constant.
  - `Body/M/epi-theia/extensions/m-extension-runtime/src/browser/readiness-banner.tsx` — `ReadinessBanner` component rendering `severity`, declared blockers, runtime blockers, evidence handles, M5 review affordance.
  - `Body/M/epi-theia/extensions/m-extension-runtime/src/browser/frontend-module.ts` — `SHARED_BRIDGE_ADAPTER` DI symbol bound as singleton ContainerModule.
  - `Body/M/epi-theia/extensions/m-extension-runtime/src/browser/intent-target-registration.ts` — cross-layout intent target registration helper.
  - `Body/M/epi-theia/extensions/m-extension-runtime/src/common/shared-bridge.ts` — `SharedBridgeAdapter` class (capabilities fan-out).
  - `Body/M/epi-theia/extensions/m-extension-runtime/src/common/coordinate-context.ts` — `CoordinateContext` typed envelope.
- **Corpus 7 (Body-lite-surface — lean-layer existing patterns)** —
  - `Body/M/epi-theia/extensions/body-lite-surface/src/browser/{review-alert-badge-widget.tsx, agent-checkin-widget.tsx, safe-source-handle-row-widget.tsx, deep-link-commands.ts, body-lite-runtime-service.ts, frontend-module.ts}` — existing lean-layer widget shapes that the new onboarding widgets must extend, not duplicate.
- **Corpus 8 (Integrated-composition empty state)** —
  - `Body/M/epi-theia/extensions/integrated-composition/src/browser/integrated-empty-state.tsx` — `IntegratedEmptyState` component with `view.overall`, `missingContributors`, `reasons[].(contributorId, readinessState, ownerTrack, humanReason)` — the prior-art empty-state surface that the per-extension empty states must mirror.
- **Corpus 9 (PASU primitive surface)** —
  - `Body/S/S0/epi-cli/src/vault/pasu.rs` — `pasu_show`, `pasu_get`, `pasu_set`, `field_to_key` mapping (`birth-date → c_0_birth_date`, `birth-location → c_0_birth_location`, `natal-chart-path → c_0_natal_chart_path`); PASU residency `Pratibimba/Self/PASU.md`.
  - `Body/S/S4/ta-onta/S4-3p-chronos/S3'/kairos-python-adapter.ts` — Kerykeion adapter exists for 19.12.
- **Corpus 10 (Cycle 2 substrate inheritance)** — Theia `PreferenceContribution`, `PreferenceSchema`, `PreferenceService`, `PreferenceProxy`, `MenuContribution`, `KeybindingContribution`, `CommandContribution`, `WidgetOpenHandler` — platform conventions. Theia welcome/getting-started preference schema as the pattern for first-run state persistence.
- **Cross-link corpora (consumed for boundary law, NOT re-authored)** —
  - Stage 1 frontend depth: 21 / 22 / 23 / 24 / 25 / 26 — per-Mn empty-state cross-references.
  - Stage 2 closures: 27 (TBD onboarding-adjacent — error grammar), 30 (TBD design language palette tier — settings theming), 31 (TBD layout finalisation — onboarding-step layout binding).
  - Track 11 (shell) — onboarding mounts on shell scaffold; first-run ⇆ daily-0-1 transition.
  - Track 15 (foundations) — every onboarding widget honours principles 1–9.
  - Track 19 (contemplation) — first-session contemplation (19.4) is the post-identity onboarding milestone.
  - Track 10 (kernel-bridge) — readiness ledger Wave-B output feeds onboarding error UX directly.

---

## Master 4-way matrix

| # | Claim (UX intent: foundations + stage 1) | Spec authority (M' Seed + contract preflight) | Code/substrate evidence | Theia surface (onboarding-side) | Status |
|---|---|---|---|---|---|
| WC-OB-01 | A cold-start user sees the system explain itself step-by-step: bridge → portal-core → S2/S3 → profile-tick first fire → day-now → optional kairos → Anuttara grounding (per Track 15 §"Foundation principle 9 day-now as ambient thread" + 11 shell substrate) | Track 11 + Track 15 + 07-T0 readiness taxonomy: every step must surface a named blocker if it stalls; no opaque "loading…" | `m-extension-runtime/src/browser/` exists but has NO `cold-start-orchestrator.ts`; `frontend-module.ts` binds singletons but never sequences activation; the Theia shell boots widgets in dependency order silently | **No cold-start splash, no per-step UI, no readiness-state-advance tracking.** Each extension stalls invisibly during boot. | **CODE-PENDING (cross-cutting surface)** — Wave-C 32.1 lands `ColdStartOrchestrator` as a new browser module under `m-extension-runtime` that subscribes to the readiness ledger Wave-B (10.x) lands and renders a cold-start splash showing each step's state advance. |
| WC-OB-02 | First-run identity wizard collects PASU.md fields per 25-m4 cross-link before personal coordinate computes | 25-m4 §25.4 PASU wizard (DR-WC-M4-3); MEMORY.md `c_0_birth_date`, `c_0_birth_location`, `c_0_natal_chart_path`, `c_2_jungian`, `c_3_gene_keys`, `c_4_human_design`; FR-3 KAIROS_ENABLED gate | `pasu.rs` exposes set/get/show CLI primitives + field_to_key mapper (birth-date / birth-location / natal-chart-path); `kairos-python-adapter.ts` exists for kerykeion; **the wizard widget surface itself is gated to 25.4 and described as cross-link target for cold start** | 25.4 owns the wizard widget in `m4-nara/src/browser/onboarding/identity-wizard.tsx`; Wave-C cross-cutting owns the COLD-START INVOCATION (when to mount it, what to do if user skips, how skip persists) | **SPEC-AHEAD (orchestration; widget owned by 25.4)** — Wave-C 32.2 owns the orchestration: cold-start orchestrator detects PASU.md absence and routes the user to 25.4's wizard before Mercurius kairos fetch fires (per 19.12 FR-3 graceful stub fallback when KAIROS_ENABLED=false or wizard skipped). |
| WC-OB-03 | Post-identity onboarding walks the new user through the 0/1 toggle, OmniPanel, activity-bar, status bar, day-now anchor, cosmic vs personal split | Track 15 §"Foundation Principles" 1–9 + Track 11 shell layer | No onboarding walkthrough exists in substrate. `body-lite-surface` lands the daily-0-1 layer widgets but no walkthrough overlay system. | **No walkthrough overlay, no tooltip-overlay system, no completion-step persistence.** | **CODE-PENDING (cross-cutting surface)** — Wave-C 32.3 lands a 6-step minimal walk under `m-extension-runtime/src/browser/onboarding/walkthrough-overlay.tsx`; each step is tooltip-overlay-driven, skippable; completion persisted in `epi-logos.onboarding.completed-steps` Theia preference. |
| WC-OB-04 | Settings UX surface for Epi-Logos preferences (layout, privacy, motion, identity, diagnostics, theming) | Theia platform `PreferenceContribution` / `PreferenceSchema`; FR-3 KAIROS_ENABLED preference; cycle 2 `epi-logos.layout.active` preference referenced in TS-24 (Wave-B theia-shell) | `pratibimba-layouts/src/browser/` references `epi-logos.layout.active` preference; **NO consolidated `EpiLogosSettingsPage`**; preferences scattered across extensions. | **No single preference contribution surface; settings split across extensions with no umbrella page.** Theia's default Preferences view shows them under random sections. | **CODE-PENDING (cross-cutting surface)** — Wave-C 32.4 lands `epi-logos-settings-page.tsx` under `m-extension-runtime` with six named sections (Layout / Privacy / Motion / Identity / Diagnostics / Theming) bound to a centralised `EpiLogosPreferenceSchema`. |
| WC-OB-05 | Per-readiness-state grammar is canonical and consistent across every M-extension empty state | 07-T0 readiness taxonomy (9 ids); Track 15 §"Foundation principle 3 provenance always visible" | `readiness.ts` types the 9 states; `readiness-banner.tsx` renders 3 severities (ok/degraded/blocked) but **does not differentiate per-state UX grammar** (e.g. overlay vs inline-badge vs shimmer); each extension reimplements its empty state ad-hoc per 21–26. | **No canonical per-state UX grammar; each Mn-extension empty state diverges.** | **DOC-AHEAD + CODE-PENDING (canonical contract)** — Wave-C 32.5 lands `Body/M/epi-theia/extensions/contracts/readiness-state-grammar.md` + `readiness-state-grammar.json` mapping each of the 9 contract states + 5 UX-grammar derived states (pending_first_tick, pending_dataset, ready_protected_local, atelier_blocked, gateway_unreachable) to canonical UX response (overlay / inline-badge / shimmer / retry-affordance / diagnostic-deep-link). |
| WC-OB-06 | Empty-state grammar per extension when no data has been produced yet | Track 11.3 daily-widget ownership trace; 21–26 stage 1 deep designs each declare per-widget empty state | `integrated-empty-state.tsx` is the prior art for plugin-level empty state. **Per-extension empty states are inconsistent**: M4 has DayContainer dl that renders "Nara is awaiting kernel data" string; others have no explicit empty state. | **No `EmptyStateRegistry`; no per-extension first-render empty contract.** | **CODE-PENDING + DOC-AHEAD** — Wave-C 32.6 lands per-Mn empty-state contributions under `Body/M/epi-theia/extensions/{m0-anuttara,...,m5-epii}/src/browser/empty-state.tsx` + a central `EmptyStateRegistry` in `m-extension-runtime/src/common/empty-state-registry.ts`. M0 quiet ground, M1 K² rests, M2 cymatic unmodulated, M3 clock at noon, M4 day not begun, M5 atelier quiet. |
| WC-OB-07 | Error UX uses non-modal inline display with retry + diagnostic deep-link to Diagnostics tab in OmniPanel | Track 15 §"Foundation principle 5 OmniPanel as `/` operator membrane" + Track 15 §"No modal review surfaces" | `ReadinessBanner` shows blockers but **no retry affordance, no diagnostic deep-link**. | **No retry, no diagnostic deep-link, no inline error surface.** | **CODE-PENDING (cross-cutting surface)** — Wave-C 32.7 extends `ReadinessBanner` with retry-action and diagnostic deep-link to OmniPanel Diagnostics tab; lands `inline-error-surface.tsx` for extension contract preflight failures, integrated readiness failures, PASU-absent warnings. |
| WC-OB-08 | Privacy class defaults to `protected_local` for M4-touching writes; public-bridge crossing is per-artifact opt-in | 07-T0 per-extension privacyClass field; FR-3; 25-m4 protected-local-handle-only; 19.10 PASU consent records | M4 contract declares `protected_local_handle_only`; M0 declares `public_current_with_graph_provenance`; M5 declares `governed_review_metadata_only`. **No user-facing default-class preference; no per-artifact opt-in flow.** | **No privacy-class settings UX, no opt-in flow.** | **CODE-PENDING + DOC-AHEAD** — Wave-C 32.8 lands the privacy-class default preference under settings (`epi-logos.privacy.default-class`) + an onboarding step explaining protected-local + per-artifact opt-in dialog (NON-MODAL — surfaces in OmniPanel inline). |
| WC-OB-09 | Profile-tick is the global UI clock; new users see it advance | Track 15 §"Foundation principle 2 profile-tick as primary clock"; §15.6 profile-tick clock; §15.10 status bar discipline includes profile-tick | `MathemeHarmonicProfile` ticks are subscribed via `SharedBridgeAdapter.onMathemeHarmonicProfile`; status bar consumes per 15.10; **no settings to toggle visibility, no onboarding explanation, no first-tick splash differentiation** | **First-tick is invisible to new user; profile-tick is unexplained as concept.** | **CODE-PENDING + DOC-AHEAD** — Wave-C 32.9 lands `epi-logos.profile.tick.visible` preference (default `true`) + status bar entry shows tick number + generation + onboarding step explains the concept. |
| WC-OB-10 | Kairos enablement is opt-in (FR-3 default false); on enable, fetch kerykeion availability; populate `M4_Temporal_Now.planet_degrees[10]` | FR-3 KAIROS_ENABLED default false; 19.12 `mercurius_kairos_now` populator + graceful stub | `kairos-python-adapter.ts` exists; 19.12 declares the populator wiring; **no settings UX for KAIROS_ENABLED; no onboarding step for kairos enablement; no kerykeion-availability probe surface** | **No user-facing kairos enable; no onboarding flow.** | **CODE-PENDING + DOC-AHEAD** — Wave-C 32.10 lands kairos enablement onboarding step (post-PASU) + settings binding for KAIROS_ENABLED + kerykeion-availability probe via gateway RPC; graceful stub messaging on failure. |
| WC-OB-11 | When current day_id has no NOW.md, m4-nara surfaces "Day not yet begun — start session?" affordance | 25-m4 §25.1 day-calendar + DR-M4-1 day path canon `Idea/Empty/Present/{YYYY}/{MM}/W{WW}/{DD}/`; Khora `session_start` per CLAUDE.md | `pratibimba/m4-nara/src/browser/m4-nara-widget.tsx` renders DayContainer dl but **no day-not-yet-begun affordance**; Khora is upstream | **No start-session affordance; new user has no UI path to begin first session.** | **CODE-PENDING (cross-cutting orchestration; widget owned by 25)** — Wave-C 32.11 lands the orchestration: when DayContainer empty + new user + cold-start orchestrator complete + PASU complete (or skipped), surface a "Day not yet begun" prompt that on accept calls Khora `session_start` → creates NOW.md → fires Mercurius kairos refresh (if enabled) → triggers tarot psyche-anchor (19.4) → opens session contemplation. |
| WC-OB-12 | Reset / clear-state UX exists for development mode but is gated in production | Anti-greenfield discipline; CLAUDE.md "Never run destructive git commands unless explicit"; equivalent law for user data | **No reset surface exists.** | **No reset surface.** | **DOC-AHEAD + CODE-PENDING (gated)** — Wave-C 32.12 lands a Reset section under Settings → Diagnostics with strong confirmation; disabled by default (preference `epi-logos.diagnostics.reset-enabled` defaults `false`); audit-only — never auto-executes destructive resets. |
| WC-OB-13 | Every declared onboarding step has both completion criterion and skip-path | Anti-orphan posture; Track 11.9 surface-extension-contract ledger pattern; Track 14 no-orphan audit | No onboarding ledger exists. | **No onboarding-completion ledger.** | **DOC-AHEAD (canonical contract)** — Wave-C 32.13 lands `Body/M/epi-theia/extensions/contracts/onboarding-completion-ledger.json` mapping every onboarding step to (preference key, completion criterion, skip-path); CI lint asserts every declared onboarding step has both. |
| WC-OB-14 | Acceptance harness exercises full cold-start, kairos-enabled and disabled paths, blocked-readiness per-extension | Track 11.6 acceptance-harness state-identity; Track 15 §15.12 visual-regression harness | `acceptance-harness/tests/topology.test.mjs` exists per Wave-B; **no onboarding fixtures** | **No onboarding acceptance fixtures.** | **CODE-PENDING (cross-cutting test)** — Wave-C 32.14 extends acceptance harness with cold-start full sequence (no PASU), cold-start with PASU pre-populated, kairos-enabled onboarding, kairos-disabled onboarding, blocked-readiness state per-extension. |
| WC-OB-15 | Cold-start orchestrator must consume the canonical 9-id readiness taxonomy AND expose UX-grammar derived states (pending_first_tick, pending_dataset, ready_protected_local) per §15.6 | 07-T0 contract authority; 15.6 profile-tick + readiness inline rendering; the prompt's expressive set | `readiness.ts` is canonical 9-id; the UX grammar set referenced in the prompt is a SUPERSET that includes UX-derived flavours not in the contract (e.g. `pending_first_tick`, `pending_dataset`, `ready_protected_local`) | **No clear mapping between contract-canonical 9 states and UX-derived expressive flavours.** | **DOC-AHEAD (canonical contract; cross-links 32.5)** — Wave-C 32.5 (the readiness-state-grammar contract) explicitly maps contract-canonical 9 states to UX-derived flavours: `pending_first_tick` is a flavour of `bridge_unavailable` (bridge UP but no tick yet); `pending_dataset` is a flavour of `authority_payload_missing` (named dataset, e.g. 3 outer planets); `ready_protected_local` is a flavour of `ready_public_current` carrying privacy_class marker. The 9 contract states stay canonical; the UX flavours are render-time variants. |
| WC-OB-16 | OmniPanel Diagnostics tab is the central error/readiness destination | Track 15 §"OmniPanel" §"Diagnostics: kernel-bridge-readiness summary, profile-field pending markers" | OmniPanel widget exists; Diagnostics tab is one of 8 declared tabs; **the tab's content surface is not yet authored per 15.2 (consolidates 12.14)** | **Diagnostics tab declared but contents pending.** | **CODE-PENDING (cross-link 15.2)** — Wave-C 32.7 cross-links to 15.2: the error UX deep-links into OmniPanel Diagnostics tab; that tab's content surface is owned by 15.2 (and downstream Wave-B `omnipanel-shell` work). Wave-C contributes the routing affordance, not the tab contents. |
| WC-OB-17 | New-user-defaults: layout = `daily-0-1` (cosmic side); active coordinate = M0' Anuttara grounding; OmniPanel collapsed | Track 11 §"Cycle 2 Substrate Inheritance"; Track 15 §"Cosmic-side of `daily-0-1`" + 21-m0 §"M0 Anuttara grounding empty state"; CLAUDE.md `0 = cosmic shell` | `pratibimba-layouts/src/common/layout-types.ts` declares `daily-0-1` as first-mounted; no first-launch defaults declared for coordinate or OmniPanel collapse-state | **No first-launch coordinate default; no OmniPanel collapse default.** | **DOC-AHEAD (preference defaults)** — Wave-C 32.4 settings page declares these as the default preferences: `epi-logos.layout.active: 'daily-0-1'`, `epi-logos.coordinate.first-launch: '#0'`, `epi-logos.omnipanel.first-launch-collapsed: true`. |
| WC-OB-18 | Reduced-motion preference honoured throughout (tick choreography, lemniscate transition, XOR ceremony) | Track 15 §15.9 tick choreography accessibility pause/scrub; OS-level reduced-motion respect | Reduced-motion not yet surfaced as Epi-Logos preference; OS-level prefers-reduced-motion media query may be honoured ad-hoc | **No central reduced-motion preference; no audit that all animation surfaces honour it.** | **DOC-AHEAD + CODE-PENDING** — Wave-C 32.4 declares `epi-logos.motion.reduced` preference (default reads OS); the visual-regression harness (15.12) extended in 32.14 fixtures asserts reduced-motion path passes all animation surfaces. |
| WC-OB-19 | The matheme's `(0/1) = 4+2 = 5→0` topology is honoured at onboarding scale: cold-start is 0 (ground/no data), settings is 1 (Anuttara naming), the 6 onboarding steps are 4+2 (depth walk), reset is 5→0 (Möbius return) | CLAUDE.md core matheme + Track 19 §"The matheme is the question" | The matheme is structural law throughout the substrate (compile-time `_Static_assert` at m3.h:770, m5_execute_mobius_return). **Onboarding does NOT structurally consume the matheme — it's just steps.** | **Onboarding is procedural rather than mathemic.** | **DOC-AHEAD (philosophical structuring)** — Wave-C 32.1 cold-start playbook + 32.3 walkthrough structured AS the matheme: cold-start splash IS the 0 (ground unfolding); walkthrough IS the 4+2 (six steps of depth); reset IS the 5→0 (Möbius return-to-ground). Not decorative — structural. The cold-start orchestrator literally counts through 6 stages matching the 4+2 depth law, and the splash header carries the matheme glyph. |
| WC-OB-20 | Wave-C onboarding work targets ALL six M-extensions plus integrated plugins; no extension is exempt | Anti-orphan posture; Track 14 no-orphan audit; per-Mn frontend depth tranches 21–26 each declare empty-state references | Per-Mn empty state references are scattered through stage 1 tranches with no consolidating registry. | **No central empty-state registry; ORPHAN risk if any extension is missed.** | **DOC-AHEAD + CODE-PENDING** — Wave-C 32.6 + 32.13 close the ORPHAN: 32.6 lands per-Mn empty-state.tsx files enrolled in the EmptyStateRegistry; 32.13 onboarding-completion ledger lists every extension's first-render path; CI lint asserts every M-extension contract declares its empty-state surface id. |
| WC-OB-21 | Settings preferences must persist across `daily-0-1` ↔ `ide-deep` layout switch and across session restarts | Track 15.7 BimbaPratibimbaUiState; Theia `PreferenceService` scope `User \| Workspace` | Preferences are user-scope by default via Theia framework; **no audit that all Epi-Logos preferences are correctly scoped** | **Preference scope not asserted.** | **DOC-AHEAD (contract)** — Wave-C 32.4 settings page schema declares per-preference scope: layout/privacy/motion/identity/theming = User; diagnostics/cold-start-state = Workspace (session-scoped). |
| WC-OB-22 | Day-now anchor is global state; new users on first day land on today's empty day folder | DR-M4-1 day path canon; CLAUDE.md day folder path mandatory `Empty/Present/{YYYY}/{MM}/W{WW}/{DD}/` | `vault/day.rs` ensures day folder; `vault/pasu.rs` ensures PASU folder; **no first-launch day-folder creation step** | **First-day folder may not exist on cold-start.** | **CODE-PENDING (orchestration)** — Wave-C 32.11 cold-start orchestrator step 4 ensures today's day folder exists via `SharedBridgeAdapter.invokeGatewayRpc('vault.day.ensure', {dayId: today})` before any widget that consumes day-now mounts. |

---

## Anomalies

### CONTRADICTIONS (decision-register candidates)

- **DR-WC-OB-1** — **9-id contract taxonomy vs 9-id UX expressive set divergence.** The 07-T0 contract authority declares 9 ids (`bridge_unavailable, profile_missing_field, s2_graph_blocked, s3_subscription_blocked, s5_review_blocked, authority_payload_missing, privacy_blocked, degraded_but_readable, ready_public_current`). The prompt's UX-grammar set (likewise 9) substitutes `s3_gateway_unreachable, s5_atelier_blocked, pending_dataset, pending_first_tick, ready_protected_local` for some of the contract states. **Decision:** Keep contract canonical (`readiness.ts` literal union stays exactly 9 ids); land UX-derived flavour states as RENDER-TIME variants in 32.5's `readiness-state-grammar.json` — each contract state maps to ≥1 UX-grammar flavour with explicit render rules. Contract authority unchanged; UX expressivity layered on top.

- **DR-WC-OB-2** — **Wizard ownership: cold-start (Wave-C 32.2) vs m4-nara (25.4).** Both tranches reference the PASU identity wizard. **Decision:** 25.4 OWNS the wizard widget (`m4-nara/src/browser/onboarding/identity-wizard.tsx` — extension residency aligns with the M4 surface that consumes PASU); 32.2 OWNS the cold-start orchestration that decides WHEN to mount it, what skip means, how skip persists. Two roles, one widget — same pattern as 25-m4 §"single React component, two compose sites" disciplinary law.

- **DR-WC-OB-3** — **Day-not-yet-begun affordance: cold-start (Wave-C 32.11) vs day-calendar (25.1) vs m4-nara widget (25.2).** All three reference the user's first-session start. **Decision:** 25.1 owns the day-calendar widget; 25.2 owns the DayContainer detail empty state per-session; 32.11 owns the COLD-START ROUTING that orchestrates first-session start as a transition from cold-start → daily flow. The orchestration is post-cold-start, pre-daily; the widgets continue to own per-day empty states for normal flow.

- **DR-WC-OB-4** — **Settings page location: under `m-extension-runtime` vs new dedicated `epi-logos-settings` extension.** Theia convention is to scatter preferences per extension; the prompt asks for a consolidated `epi-logos-settings-page.tsx`. **Decision:** Consolidate under `m-extension-runtime/src/browser/settings/` — it is the shared substrate every M-extension already depends on, and adding a new extension would violate the anti-greenfield rule. Per-section preferences are still declared in their owning extension's package.json (each M-extension declares its own preferences); the settings page is a CONSUMER that aggregates them into a single UI under one preference contribution category.

- **DR-WC-OB-5** — **Reset-UX safety law.** Reset / clear-state must NEVER auto-execute, must NEVER touch git, must NEVER cross protected-local boundary. **Decision (already aligned with CLAUDE.md "Never run destructive git commands unless explicit"):** Reset surface lives in Settings → Diagnostics, gated by `epi-logos.diagnostics.reset-enabled` preference (default `false`), requires strong textual confirmation (typed extension id), audit-only in production builds. Clear-PASU-data is its own gated path with separate confirmation. NO single button clears everything.

### CODE-PENDING (cross-link only — Wave-C does not own these)

- **CP-WC-OB-1 (cross-link 25.4)** — PASU wizard widget owned by 25.4; Wave-C 32.2 orchestrates invocation.
- **CP-WC-OB-2 (cross-link 19.12)** — Mercurius kairos populator + FR-3 graceful stub owned by 19.12; Wave-C 32.10 orchestrates enablement onboarding.
- **CP-WC-OB-3 (cross-link 15.2)** — OmniPanel Diagnostics tab content surface owned by 15.2; Wave-C 32.7 routes errors into it.
- **CP-WC-OB-4 (cross-link 10.x Wave-B kernel-bridge)** — Readiness ledger is Wave-B output; Wave-C 32.1 cold-start orchestrator subscribes to it.
- **CP-WC-OB-5 (cross-link 11.3)** — Daily-layer widget ownership trace; if 11.3 lands a `pratibimba-daily-widgets` extension, Wave-C 32.6 EmptyStateRegistry must enrol it.
- **CP-WC-OB-6 (cross-link 11.9)** — Surface-extension-contract ledger; Wave-C 32.13 onboarding-completion ledger is sibling.
- **CP-WC-OB-7 (cross-link 21–26 stage 1)** — Each per-Mn deep design declares its own first-render empty state; Wave-C 32.6 consolidates them into the EmptyStateRegistry.
- **CP-WC-OB-8 (cross-link 15.10)** — Status bar discipline owns profile-tick + day-now + session id + gateway readiness + profile generation + active coordinate (6 entries); Wave-C 32.9 surfaces the tick-visibility settings preference but does NOT alter status bar entry count.

### ORPHAN (Wave-C closes)

- **O-WC-OB-1** — Cold-start UX is unowned; no extension declares first-launch orchestration. Wave-C 32.1 closes by landing `ColdStartOrchestrator` under `m-extension-runtime`.
- **O-WC-OB-2** — Empty-state per-Mn pattern is unowned outside `integrated-empty-state.tsx`; per-extension first-render is ad-hoc. Wave-C 32.6 closes by landing `empty-state.tsx` per extension + `EmptyStateRegistry`.
- **O-WC-OB-3** — Reduced-motion preference is unowned; OS-level only. Wave-C 32.4 closes by landing the preference and 32.14 closes by asserting it in visual-regression harness.
- **O-WC-OB-4** — Onboarding-completion ledger is unowned; no skip/complete tracking. Wave-C 32.13 closes by landing the ledger contract.
- **O-WC-OB-5** — Privacy-class default preference is unowned; per-extension contracts declare class but no user setting exists. Wave-C 32.8 closes by landing the default-class preference + opt-in flow.
- **O-WC-OB-6** — Kairos enablement onboarding step is unowned; FR-3 declares default-false but no UX path exists. Wave-C 32.10 closes by landing the enablement step + settings binding.

---

## Proposed Cycle-3 Closing Tranches (onboarding-settings domain — id space `32.x`)

> All tranches obey the anti-greenfield rule: every one extends `m-extension-runtime` substrate, consumes Theia preference framework, mirrors `integrated-empty-state.tsx` per-Mn, consumes 07-T0 readiness taxonomy as contract authority, and cross-links upstream tranches by ID rather than re-authoring them.

### 32.1 — Cold-start playbook *(spec-ahead-integration; closes O-WC-OB-1)*

- **Classification:** `spec-ahead-integration`
- **Source:** WC-OB-01, WC-OB-19, DR-WC-OB-1
- **Deliverable:** `Body/M/epi-theia/extensions/m-extension-runtime/src/browser/cold-start-orchestrator.ts` (new) — `@injectable() ColdStartOrchestrator` consumes the readiness ledger Wave-B (10.x) lands; sequences activation per the 6-step playbook (bridge → portal-core → S2/S3 → profile-tick first fire → day-now → optional kairos); renders cold-start splash via `cold-start-splash.tsx` (new) showing each step's readiness-state advance. Splash carries the matheme glyph header per WC-OB-19.
- **Verification:** `pnpm --filter @pratibimba/m-extension-runtime test`; `grep -n "ColdStartOrchestrator\|cold-start-splash" Body/M/epi-theia/extensions/m-extension-runtime/src/browser/`; cold-start sequence test asserts deterministic state-advance from `bridge_unavailable` → `pending_first_tick` → `ready_public_current`.

### 32.2 — First-run identity wizard invocation orchestration *(spec-ahead-integration; cross-link 25.4)*

- **Classification:** `spec-ahead-integration` (orchestration only; widget owned by 25.4)
- **Source:** WC-OB-02, DR-WC-OB-2, CP-WC-OB-1, CP-WC-OB-2
- **Deliverable:** Extend `ColdStartOrchestrator` (32.1) with PASU-absence detection via `SharedBridgeAdapter.invokeGatewayRpc('nara.pasu.show')` returning a `not_found` discriminator; on absence, route to 25.4's wizard widget via `commands.executeCommand('m4.openPasuWizard')`. Skip handling: persist `epi-logos.onboarding.pasu-skipped: true` in user preferences; subsequent kairos refresh fires with FR-3 graceful stub (19.12); Mercurius relay indicator (25.16) shows "PASU not configured" until completed.
- **Verification:** `pnpm --filter @pratibimba/m-extension-runtime test`; integration test asserts cold-start with PASU-absent routes to wizard before Mercurius kairos refresh fires; skip-path persistence test asserts skip-flag persists across session restart.

### 32.3 — Post-identity onboarding walkthrough *(spec-ahead-integration; closes WC-OB-19)*

- **Classification:** `spec-ahead-integration`
- **Source:** WC-OB-03, WC-OB-19
- **Deliverable:** `Body/M/epi-theia/extensions/m-extension-runtime/src/browser/onboarding/walkthrough-overlay.tsx` (new) — six tooltip-overlay-driven steps (matheme 4+2 depth law per WC-OB-19): (1) the 0/1 toggle (`cmd-period` per 15.5); (2) OmniPanel right-sidebar; (3) activity-bar left-sidebar; (4) status bar entries; (5) day-now anchor; (6) cosmic vs personal orientation. Each step skippable; completion persisted in `epi-logos.onboarding.completed-steps: string[]` Theia preference. Walkthrough surface mounts above shell as overlay (not modal — uses `pointer-events: none` on backdrop with anchored tooltips); `escape` dismisses; never blocks the user from interacting with surfaces.
- **Verification:** `pnpm --filter @pratibimba/m-extension-runtime test`; step completion test asserts preference array grows on each step accept; skip-test asserts skip persists; non-modal-test asserts user can interact with status bar while walkthrough overlay is open.

### 32.4 — Settings UX surface *(spec-ahead-integration; closes DR-WC-OB-4, O-WC-OB-3)*

- **Classification:** `spec-ahead-integration`
- **Source:** WC-OB-04, WC-OB-17, WC-OB-18, WC-OB-21, DR-WC-OB-4
- **Deliverable:** `Body/M/epi-theia/extensions/m-extension-runtime/src/browser/settings/epi-logos-settings-page.tsx` (new) — Theia `PreferenceContribution` aggregating six sections:
  - **Layout:** `epi-logos.layout.active` (`daily-0-1` default), `epi-logos.layout.zero-one-default` (`0` cosmic | `1` personal), `epi-logos.omnipanel.first-launch-collapsed` (`true` default).
  - **Privacy:** `epi-logos.privacy.default-class` (`protected_local` default per 07-T0 M4 contract), `epi-logos.privacy.kairos-enabled` (`false` default per FR-3), `epi-logos.privacy.public-bridge-opt-in: boolean[]` per-artifact list.
  - **Motion:** `epi-logos.motion.reduced` (default reads OS prefers-reduced-motion), `epi-logos.profile.tick.visible` (`true` default).
  - **Identity:** PASU edit affordance (deep-link to 25.4 wizard in edit mode), `epi-logos.identity.kairos.provider` (`kerykeion` default).
  - **Diagnostics:** `epi-logos.diagnostics.readiness.visible` (`true` default), `epi-logos.diagnostics.dispatch.trace.verbosity` (`info` default), `epi-logos.diagnostics.reset-enabled` (`false` default — gated reset access per DR-WC-OB-5).
  - **Theming:** `epi-logos.theming.mode` (`auto | light | dark`), `epi-logos.theming.family-tier.palette` (per 30.4 cross-link family-tier palettes).
  Each preference declares scope per WC-OB-21 (Layout/Privacy/Motion/Identity/Theming = `User`; Diagnostics = `Workspace`). Each section declares its preferences via a centralised `EpiLogosPreferenceSchema` at `m-extension-runtime/src/common/preferences-schema.ts`.
- **Verification:** `pnpm --filter @pratibimba/m-extension-runtime test`; `grep -n "EpiLogosPreferenceSchema\|epi-logos-settings-page" Body/M/epi-theia/extensions/m-extension-runtime/src/`; settings page renders all 6 sections; preference scope assertion test confirms User vs Workspace bindings per WC-OB-21.

### 32.5 — Per-readiness-state grammar canonical contract *(doc-ahead-landing + spec-ahead-integration; closes DR-WC-OB-1)*

- **Classification:** `doc-ahead-landing` (contract) + `spec-ahead-integration` (renderer)
- **Source:** WC-OB-05, WC-OB-15, DR-WC-OB-1
- **Deliverable:**
  - `Body/M/epi-theia/extensions/contracts/readiness-state-grammar.md` + `readiness-state-grammar.json` — maps each of the 9 contract states + 5 UX-derived flavour states to canonical UX response:
    - `bridge_unavailable` → overlay + reconnect affordance + retry button + deep-link to Gateway tab in OmniPanel
    - `profile_missing_field` → inline pending badge "awaiting profile.<field>" + link to readiness ledger
    - `s2_graph_blocked` → overlay "S2 graph unreachable" + diagnostic + Neo4j-status link
    - `s3_subscription_blocked` → overlay "S3 gateway down" + retry + status link (UX flavour: `s3_gateway_unreachable` is render-time alias)
    - `s5_review_blocked` → inline pending "atelier review pending" + link to Review tab in OmniPanel (UX flavour: `s5_atelier_blocked` is render-time alias)
    - `authority_payload_missing` → inline pending badge with payload owner (UX flavour: `pending_dataset` is render-time alias with named dataset, e.g. "3 outer planets")
    - `privacy_blocked` → inline shimmer + "protected_local — consent required" affordance
    - `degraded_but_readable` → inline degraded badge + read-only chrome
    - `ready_public_current` → normal render (UX flavours: `ready_protected_local` carries privacy_class chrome marker; `pending_first_tick` is contract `bridge_unavailable` with bridge reachable but no tick yet — initial loading shimmer).
  - Extend `Body/M/epi-theia/extensions/m-extension-runtime/src/browser/readiness-banner.tsx` to consume the grammar contract and render per-state visuals (not just severity).
  - Extend `Body/M/epi-theia/extensions/m-extension-runtime/src/common/readiness.ts` with `MExtensionReadinessFlavour` type (the 5 UX-derived flavours) + `flavourOf(state, snapshot)` reducer.
- **Verification:** `test -f Body/M/epi-theia/extensions/contracts/readiness-state-grammar.{md,json}`; `node --test Body/M/epi-theia/extensions/test/validate-readiness-state-grammar.test.mjs` (new) asserts every contract state has ≥1 grammar entry; renderer-grammar-coverage test asserts `ReadinessBanner` renders all 9 + 5 flavour variants distinctly.

### 32.6 — Empty-state grammar per extension *(no-orphan-fill; closes O-WC-OB-2, O-WC-OB-6)*

- **Classification:** `no-orphan-fill`
- **Source:** WC-OB-06, WC-OB-20, CP-WC-OB-7
- **Deliverable:**
  - Per-Mn empty-state contributions: `Body/M/epi-theia/extensions/m0-anuttara/src/browser/empty-state.tsx` ("Anuttara waits — the implicate ground" + start-session affordance link), `m1-paramasiva/.../empty-state.tsx` ("K² torus rests — profile-tick has not fired" + bridge readiness link), `m2-parashakti/.../empty-state.tsx` ("Cymatic surface unmodulated — awaiting M1 profile" + readiness chain link), `m3-mahamaya/.../empty-state.tsx` ("Cosmic clock at noon — awaiting first tick" + readiness link), `m4-nara/.../empty-state.tsx` ("Day not yet begun" + start-session affordance + PASU-incomplete warning), `m5-epii/.../empty-state.tsx` ("Atelier quiet" + dispatch-history-empty hint + review-queue-empty hint).
  - Central `Body/M/epi-theia/extensions/m-extension-runtime/src/common/empty-state-registry.ts` — `EmptyStateRegistry` interface mapping `extensionId → emptyStateComponent + viewId + activationCondition`.
  - Per-extension `frontend-module.ts` registers its empty state contribution against the registry.
  - Each empty state mirrors the prior-art `integrated-empty-state.tsx` shape: header + summary + missing-contributors + reasons table.
- **Verification:** `test -f Body/M/epi-theia/extensions/{m0-anuttara,m1-paramasiva,m2-parashakti,m3-mahamaya,m4-nara,m5-epii}/src/browser/empty-state.tsx`; `pnpm --filter @pratibimba/m-extension-runtime test`; registry-completeness test asserts every M-extension declares an empty state; per-extension empty-state render test against synthetic blocked-readiness snapshot.

### 32.7 — Error UX grammar + Diagnostics deep-link *(spec-ahead-integration; cross-link 15.2)*

- **Classification:** `spec-ahead-integration`
- **Source:** WC-OB-07, WC-OB-16, CP-WC-OB-3
- **Deliverable:**
  - Extend `Body/M/epi-theia/extensions/m-extension-runtime/src/browser/readiness-banner.tsx` with `onRetry?: () => void` callback + diagnostic deep-link button (`Open Diagnostics`) that fires `commands.executeCommand('omnipanel.openTab', 'diagnostics')`.
  - `Body/M/epi-theia/extensions/m-extension-runtime/src/browser/inline-error-surface.tsx` (new) — non-modal inline error surface mounted by extensions on kernel-bridge call failure; renders error message + retry + deep-link to Diagnostics.
  - Extension contract preflight failure: extension-level error banner with link to preflight log (`Body/M/epi-theia/extensions/contracts/validation-results.json` — produced by `validate-extension-contract-preflight.mjs`).
  - Integrated readiness blocked: integrated-composition renders `IntegratedEmptyState` per 11.8 with named pending markers (already substrate; this tranche surfaces the deep-link routing).
  - PASU-absent + KAIROS_ENABLED: inline warning banner "PASU not configured — kairos defaulting to neutral" in m4-nara empty-state (32.6).
- **Verification:** `pnpm --filter @pratibimba/m-extension-runtime test`; retry-affordance test asserts callback fires on click; diagnostic-deep-link test asserts OmniPanel switches to Diagnostics tab; inline error surface test asserts mount-on-error and dismiss; PASU-absent warning test against synthetic state.

### 32.8 — Privacy class default + opt-in flow *(spec-ahead-integration; closes O-WC-OB-5)*

- **Classification:** `spec-ahead-integration`
- **Source:** WC-OB-08, DR-WC-OB-5
- **Deliverable:**
  - Settings binding (32.4 Privacy section) `epi-logos.privacy.default-class: 'protected_local' | 'protected_local_handle_only' | 'public_current'` (default `protected_local`).
  - Onboarding step (32.3 step 6) explains protected-local default + public-bridge opt-in semantics.
  - Per-artifact opt-in: `Body/M/epi-theia/extensions/m-extension-runtime/src/browser/privacy-opt-in-dialog.tsx` (new) — non-modal opt-in dialog surfaces in OmniPanel inline (anchored to triggering widget) when a write request would cross protected-local → public-bridge boundary; user confirms with explicit checkbox + records to PASU `c_4_atlas_sync_consents` per DR-WC-M4-4 (25.14).
  - Cross-link 25-m4 privacy enforcement: every M4 write path checks default-class preference + per-artifact consent record before allowing public-bridge crossing.
- **Verification:** `pnpm --filter @pratibimba/m-extension-runtime test`; default-class preference test asserts initial value `protected_local`; opt-in dialog test asserts non-modal mount + consent persistence to PASU array; per-artifact crossing test asserts blocked write without consent.

### 32.9 — Profile-tick visibility for new users *(spec-ahead-integration; cross-link 15.6, 15.10)*

- **Classification:** `spec-ahead-integration`
- **Source:** WC-OB-09, CP-WC-OB-8
- **Deliverable:**
  - Settings binding (32.4 Motion section) `epi-logos.profile.tick.visible: boolean` (default `true`).
  - Status bar entry (per 15.10 discipline — profile-tick is one of the 6 canonical entries) shows tick number + profile generation; preference toggle hides/shows the entry.
  - Onboarding step (32.3 step 1) introduces the tick concept: "everything advances on its own — that's the profile-tick."
  - First-tick splash differentiation: cold-start orchestrator (32.1) shows "Awaiting first profile-tick…" with shimmer until the first tick fires; on first tick, splash transitions to "Profile-tick 1 — system alive."
- **Verification:** `pnpm --filter @pratibimba/m-extension-runtime test`; preference toggle test asserts status bar entry visibility flips; first-tick splash transition test against synthetic profile event stream; cross-link 15.10 status-bar-discipline assertion test confirms exactly 6 status bar entries remain (preference hides but does not remove).

### 32.10 — Kairos enablement onboarding *(spec-ahead-integration; closes O-WC-OB-6; cross-link 19.12)*

- **Classification:** `spec-ahead-integration`
- **Source:** WC-OB-10, CP-WC-OB-2
- **Deliverable:**
  - Optional kairos enablement onboarding step (32.3 step 7 — appended after PASU completes if PASU set successfully): explains FR-3 default-off, opt-in semantics.
  - On enable: `SharedBridgeAdapter.invokeGatewayRpc('nara.kairos.probe_kerykeion')` fires kerykeion-availability check; on success, persists `epi-logos.privacy.kairos-enabled: true` + triggers Mercurius kairos refresh (19.12) → populates `M4_Temporal_Now.planet_degrees[10]`.
  - On failure (kerykeion missing): graceful stub message per FR-3 + suggests `pip3 install kerykeion`; preference stays `false`.
  - Mercurius relay indicator (25.16) reflects state transitions.
- **Verification:** `pnpm --filter @pratibimba/m-extension-runtime test`; FR-3 default-off assertion; enable-success path test against mock kerykeion availability; enable-failure graceful stub test; cross-link 25.16 relay indicator state transition test.

### 32.11 — Day-not-yet-started orchestration *(spec-ahead-integration; closes DR-WC-OB-3, WC-OB-22; cross-link 25.1, 25.2)*

- **Classification:** `spec-ahead-integration`
- **Source:** WC-OB-11, WC-OB-22, DR-WC-OB-3
- **Deliverable:**
  - `ColdStartOrchestrator` step 5 ensures today's day folder exists via `SharedBridgeAdapter.invokeGatewayRpc('vault.day.ensure', {dayId: today})` before any widget mounting consumes day-now.
  - On post-cold-start, when DayContainer is empty + new user + PASU complete (or skipped), m4-nara empty state (32.6) surfaces "Day not yet begun — start session?" affordance.
  - On accept: calls Khora `session_start` (per CLAUDE.md gateway lifecycle) → NOW.md created → day-now anchor lights up in status bar → Mercurius kairos refresh fires if enabled (19.12) → tarot psyche-anchor draw (19.4) → session contemplation begins.
  - Subsequent days surface the same affordance via 25.2 DayContainer empty state, not via cold-start orchestrator.
- **Verification:** `pnpm --filter @pratibimba/m-extension-runtime test`; day-folder-ensure test against fixture vault; start-session flow integration test asserts Khora → NOW.md → status bar → kairos refresh → tarot draw sequence; cross-link 25.1 day-calendar selection drives DayContainer (25.2) which surfaces empty state on days without NOW.md.

### 32.12 — Reset / clear-state UX *(doc-ahead-landing + spec-ahead-integration; closes DR-WC-OB-5)*

- **Classification:** `doc-ahead-landing` (safety law) + `spec-ahead-integration` (surface)
- **Source:** WC-OB-12, DR-WC-OB-5
- **Deliverable:**
  - Settings → Diagnostics → Reset section, gated by `epi-logos.diagnostics.reset-enabled` preference (default `false`).
  - Three reset paths, each with strong confirmation (typed extension id):
    - Clear PASU.md — strong confirmation; calls `nara.pasu.clear` RPC (NEW; deletes the file with backup to `Idea/Empty/_backups/PASU-{timestamp}.md`).
    - Clear onboarding state — resets `epi-logos.onboarding.completed-steps` to empty array + clears `epi-logos.onboarding.pasu-skipped` flag.
    - Clear local cache — flushes `~/.epi-logos/cache/` (gateway client cache, kairos cache); preserves Bimba/Pratibimba vault entirely.
  - Audit-only in production builds — preference `reset-enabled` cannot be set true via CLI or programmatic path; user must manually edit `settings.json`.
  - No "clear everything" button.
- **Verification:** `test -f Body/M/epi-theia/extensions/m-extension-runtime/src/browser/settings/reset-section.tsx`; preference gating test asserts section hidden when `reset-enabled: false`; PASU backup test asserts backup file landed before deletion; confirmation requirement test asserts typed extension id required; no-auto-execution test asserts no destructive path fires without explicit user click.

### 32.13 — Onboarding completion ledger *(doc-ahead-landing; closes O-WC-OB-4; sibling to 11.9)*

- **Classification:** `doc-ahead-landing`
- **Source:** WC-OB-13, WC-OB-20, CP-WC-OB-6
- **Deliverable:**
  - `Body/M/epi-theia/extensions/contracts/onboarding-completion-ledger.json` mapping every onboarding step to:
    - Step id (`cold-start.bridge`, `cold-start.portal-core`, `cold-start.s2-s3`, `cold-start.first-tick`, `cold-start.day-now`, `cold-start.kairos-optional`, `walkthrough.0-1-toggle`, `walkthrough.omnipanel`, `walkthrough.activity-bar`, `walkthrough.status-bar`, `walkthrough.day-now-anchor`, `walkthrough.cosmic-personal`, `identity.pasu-birth-date`, `identity.pasu-birth-location`, `identity.pasu-natal-chart`, `identity.pasu-jungian`, `identity.pasu-gene-keys`, `identity.pasu-human-design`, `kairos.enable`, `first-session.start`)
    - Preference key carrying its completion state (per step in `epi-logos.onboarding.completed-steps[]`)
    - Completion criterion (e.g. `pasu-birth-date` complete when `c_0_birth_date` is non-empty in PASU.md)
    - Skip-path (e.g. `pasu-jungian` skip persists `epi-logos.onboarding.pasu-skipped: 'jungian'` array entry).
  - CI lint at `Body/M/epi-theia/extensions/scripts/validate-onboarding-completion-ledger.mjs` (new) asserts every declared onboarding step has both completion criterion and skip-path; every step id is uniquely owned.
- **Verification:** `test -f Body/M/epi-theia/extensions/contracts/onboarding-completion-ledger.json`; `node Body/M/epi-theia/extensions/scripts/validate-onboarding-completion-ledger.mjs` returns 0; per-step completion-criterion presence assertion; per-step skip-path presence assertion.

### 32.14 — Acceptance harness onboarding fixtures *(spec-ahead-integration; cross-link 11.6, 15.12)*

- **Classification:** `spec-ahead-integration`
- **Source:** WC-OB-14, CP-WC-OB-3
- **Deliverable:** Extend `Body/M/epi-theia/extensions/acceptance-harness/tests/` with:
  - `cold-start.test.mjs` — full sequence test (no PASU): bridge → portal-core → S2/S3 → first-tick → day-now → walkthrough → first-session.
  - `cold-start-with-pasu.test.mjs` — PASU pre-populated path: PASU detection skips wizard; cold-start advances to kairos enablement step.
  - `cold-start-kairos-enabled.test.mjs` — kairos-enabled onboarding path: kerykeion probe succeeds; Mercurius refresh fires; `M4_Temporal_Now.planet_degrees[10]` populates non-zero.
  - `cold-start-kairos-disabled.test.mjs` — FR-3 graceful stub path: Mercurius indicator renders grey "Kairos disabled" stub.
  - `blocked-readiness-per-extension.test.mjs` — for each of the 6 M-extensions, synthesise each of the 9 contract readiness states + 5 UX-grammar flavours and assert the correct empty-state-grammar (32.5) renders.
  - Reduced-motion fixture in visual-regression suite (15.12) — asserts cold-start splash, walkthrough overlay, and XOR ceremony (25.19) honour reduced-motion preference.
- **Verification:** `pnpm --filter @pratibimba/acceptance-harness test`; per-fixture assertion + visual-regression baselines committed to `acceptance-harness/fixtures/onboarding/`.

---

**End of matrix.** The onboarding-settings-empty-states-cold-start domain is **CODE-PENDING at substrate level**: the readiness taxonomy is contract-canonical (07-T0 + `readiness.ts`); the shared bridge + readiness banner are landed; the integrated-empty-state pattern is prior art. What is missing is (a) the cold-start orchestration layer, (b) the consolidated settings page, (c) the per-readiness-state grammar contract, (d) per-Mn empty states + central registry, (e) the onboarding-completion ledger, (f) the acceptance fixtures. Wave-C 32.1–32.14 close those gaps without re-authoring any landed substrate; the wizard widget itself stays with 25.4 per DR-WC-OB-2, the day-not-yet-begun affordance composes with 25.1/25.2 per DR-WC-OB-3, and Mercurius/Kerykeion stays with 19.12 per CP-WC-OB-2. The matheme `0/1 = 4+2 = 5→0` structures the onboarding shape itself per WC-OB-19, not as decoration but as topological law.
