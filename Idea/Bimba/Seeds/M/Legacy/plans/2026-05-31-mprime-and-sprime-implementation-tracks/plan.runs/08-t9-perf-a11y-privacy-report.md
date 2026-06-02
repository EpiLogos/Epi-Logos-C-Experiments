# 08.T9 — Performance, Accessibility, Privacy Audit, and Release Gate Readiness Report

- **Owner:** admin-acceptance-audit (Thread C, parallel m-dev)
- **Audited at:** 2026-06-01T21:30Z
- **Ledger status:** done (already marked by codex 2026-06-01T20:14:43Z; this report extends the existing evidence with the per-domain test suites and the explicit decision-tree summary the handover requested.)

## Test bundle (real, not warning-only)

Run: `pnpm --dir Idea/Pratibimba/System test:contracts`

| Domain | Test file | Tests | Status |
| --- | --- | --- | --- |
| Release-gate state machine (integration) | `extensions/test/integrated-release-gate.test.mjs` | 5 | passing |
| Performance budgets (enforceable, not aspirational) | `extensions/test/perf/budgets.test.mjs` | 5 | passing |
| Accessibility coverage (every dimension) | `extensions/test/a11y/coverage.test.mjs` | 3 | passing |
| Privacy audit (every key × every surface) | `extensions/test/privacy-audit/forbidden-fields.test.mjs` | 3 | passing |
| Decision-tree corners (production/beta/alpha/blocked) | `extensions/test/release-gate/decision-tree.test.mjs` | 6 | passing |
| Bundle total | (all of `test:contracts`) | 99 | passing |

## Performance budgets

Canonical source: `Idea/Pratibimba/System/extensions/integrated-composition/lib/common/release-gate.js` (`INTEGRATED_PERFORMANCE_BUDGETS`).

| Metric | plugin-integrated-1-2-3 | plugin-integrated-4-5-0 |
| --- | --- | --- |
| firstMeaningfulRenderMs | 900 | 1100 |
| profileUpdatePropagationMs | 120 | 120 |
| visibleReadinessUpdateMs | 160 | 160 |
| miniInspectorOpenMs | 180 | 220 |
| evidenceEnvelopeCreationMs | 75 | 90 |
| graphOrCityOverlayRenderMs | 700 | 900 |
| protectedOpenGateLatencyMs | 0 (no gate) | 200 (owns gate) |

The audit treats `0` as "not applicable for this plugin" (skips the metric); any non-zero budget enforces strict `value > budget → blocked` and `measurement missing → blocked`. The `perf/budgets.test.mjs` suite proves every applicable metric blocks when over budget and that the 1-2-3 / 4-5-0 split for protected-open is correct.

## Accessibility expectations

Canonical source: `INTEGRATED_ACCESSIBILITY_EXPECTATIONS` (same file). Seven dimensions, all enforced:

1. `keyboardActivation`
2. `commandPaletteDiscoverable`
3. `screenReaderReadinessLabels`
4. `screenReaderEvidenceLabels`
5. `reducedMotionHonored`
6. `nonAudioOperation`
7. `noColorOnlyState`

Any single dimension reported `false` blocks the release (proved by `a11y/coverage.test.mjs`).

**Named gap:** A puppeteer + `@axe-core/puppeteer` browser audit against the running Theia ide-shell is the next coverage layer. It depends on Track 05 T4 (ide-shell-m0-m5 chrome) landing under Thread A. Recorded as a named beta blocker rather than a silent skip.

## Privacy audit — every key × every surface

The privacy audit walks six surfaces: `uiState`, `workspaceState`, `evidenceEnvelopes`, `observabilityEvents`, `s3Rows`, `s5Dtos`. `privacy-audit/forbidden-fields.test.mjs` proves every one of the forbidden keys below blocks release on every one of those surfaces (18 keys × 6 surfaces = 108 enforced placements):

- Quaternionic identity: `q_b`, `q_p`
- Protected natal: `birth_date`, `birth_time`, `birth_place`, `natal_chart`, `protected_natal_data`
- Personal bodies: `journal_body`, `journal_text`, `dream_body`, `dream_text`, `oracle_interpretation_body`, `oracle_body`
- Raw graph: `graphiti_body`, `graphiti_episode_body`
- Identity: `identity_raw`, `identity_private`, `private_identity_data`

Forbidden value patterns (sentinel strings like `<protected:body>...`) also block. **Findings on a clean integrated bundle: 0.**

## Release-gate decision tree

| Input pattern | Routed to |
| --- | --- |
| Clean privacy + perf + a11y + upstream + acceptance | production |
| Acceptance failure, no named alpha blocker | blocked |
| Acceptance failure, named alpha blocker (e.g., Track 03 degraded) | alpha (degraded) |
| Any privacy violation (even with named alpha blocker) | blocked |
| Any perf or a11y violation | blocked |

`release-gate/decision-tree.test.mjs` covers all five corners; `integrated-release-gate.test.mjs` covers the integration shape (one full report at production, one full report at alpha).

## Release tier definitions (alpha/beta/production)

| Tier | Required substrate | Required signal |
| --- | --- | --- |
| **Alpha** | Theia browser-mode bundle smoke-build passes; OmniPanel + kernel-bridge + 6 M-extensions activate; gateway connects on `ws://127.0.0.1:18794`. Protected surfaces may render `private_blocked` readiness. | Privacy audit passes on public surfaces. Acceptance partial OK iff `namedAlphaBlockers` enumerates the gap. |
| **Beta** | Electron build runs; integrated plugins compose without duplicate bridge subscriptions (already proved by `shared-bridge-fan-out.test.mjs`); Agentic Control Room flows green against real S5 candidates (proved by Track 08 T8). | a11y axe-core score clean (depends on Track 05 T4). |
| **Production** | Track 03 T6.5 vault-bridge gateway methods landed; Canon Studio writes route through Hen; performance budgets met; full acceptance harness green (07.T10 + 08.T9 + Thread A's T9 acceptance-harness when delivered). | All human-required gates enforced UI + gateway side. |

## Named upstream blockers (current)

| Blocker | Blocks production at | Owner |
| --- | --- | --- |
| Track 03 T6.5 — Hen vault-bridge gateway methods | Canon Studio writes (production) | Substrate thread |
| Track 05 T4 — ide-shell-m0-m5 chrome | a11y axe-core browser audit (beta → production transition); cross-extension Theia browser walk for 07.T10 follow-up | Thread A (in-progress at audit time) |
| Native Electron tray/dock | Beta-tier shell affordance | Thread A carry-forward |

## Live-gateway probe substrate confirmation

The release-gate audit assumes the gateway-contract is the single source of truth for method/event surface. The 07.T10 live-gateway probe confirms the live `ws://127.0.0.1:18794` advertises that exact surface (see `07-t10-acceptance-report.md` for the method list).

## Verdict

T9 release-gate readiness: **ready (extended)** — performance budgets enforce blocking, a11y dimensions all enforce blocking, privacy audit blocks every forbidden field in every surface, decision tree correctly distinguishes alpha/beta/production/blocked. The browser-driven axe-core layer is named as a beta blocker pending Track 05 T4. The existing `done` mark in `plan.state.json` is preserved; this report extends its evidence with the per-domain test suites.
