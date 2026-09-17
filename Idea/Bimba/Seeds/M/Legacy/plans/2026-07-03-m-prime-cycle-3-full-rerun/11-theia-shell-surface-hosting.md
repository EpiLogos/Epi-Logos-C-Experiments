# Track 11 — Theia Shell / Surface Hosting (RERUN — target: pratibimba-app + substrate)

Source of truth for every tranche below: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/11-theia-shell-surface-hosting.md` — read the tranche's section IN FULL there before executing; this file carries only retarget + audit posture. Retarget law, resolved decisions, and verification law: `CHARTER.md`. Audit map: [[2026-07-03-cycle-3-recapture-register]] §2 (track 11). Original ledger statuses are CLAIMS about the dead Theia carrier, never truth about this one. Track 00 (verification harness) gates all closure here.

**⚑ Carrier (track 11) — build/verify HERE, never epi-theia:** CARRIER: pratibimba-app IDE shell / face partition (the `/` membrane crosses both faces = `#` itself); 10 highlight categories, ambient strip + tuning bar -> NOW frontmatter via khora_write. §2 track 11.

1. **T11.0 — Electron target package parity gate**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/11-theia-shell-surface-hosting.md` — Tranche 11.0 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: done — verify or rebuild; never build on it unverified.
   Depends on Track 00 Tranche 3.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

2. **T11.1 — Shell-0/Shell-1/4+2/`/` separation reading (clarification, not contradiction)**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/11-theia-shell-surface-hosting.md` — Tranche 11.1 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: done — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

3. **T11.2 — Cross-layout intent routing T5 promotion**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/11-theia-shell-surface-hosting.md` — Tranche 11.2 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: done — verify or rebuild; never build on it unverified.
   Verify: `pnpm --dir Body/M/pratibimba-app exec vitest run src/panes/omni/omnipanelRuntime.test.ts src/commands/crossLayoutIntent.test.ts src/App.test.tsx`; `pnpm --dir Body/M/pratibimba-app typecheck`; `pnpm --dir Body/M/pratibimba-app test`; `pnpm --dir Body/M/pratibimba-app build`; `pnpm --dir Body/M/pratibimba-app exec playwright test tests/e2e/medicine-view.spec.ts --reporter=line` (real Chromium + spawned gateway); honesty-lint clean; verifier ≠ closer; evidence = fresh command output.

4. **T11.3 — Daily-layer widget ownership trace + ORPHAN closure**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/11-theia-shell-surface-hosting.md` — Tranche 11.3 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: done — verify or rebuild; never build on it unverified.
   Active-carrier disposition: `journal` active at `JournalTimelinePane`; `agent-checkin` retired (Pi Chat/Logs are observation successors, not active-run snapshot/control); `cymatic-placeholder` superseded by `CosmicEngine`; `status-display` active at `StatusStrip`; Library lens active on `FileTreePane`; Atelier cluster lens active inside `GraphExplorerPane`. Authority: `Body/M/pratibimba-app/src/ui/dailySurfaceOwnership.ts` + [[M'-PORTAL-SPEC]] implementation foothold.
   Verify: `pnpm --dir Body/M/pratibimba-app exec vitest run src/ui/dailySurfaceOwnership.test.ts src/panes/libraryProjection.test.ts src/panes/FileTreePane.test.tsx src/components/StatusStrip.test.tsx`; `pnpm --dir Body/M/pratibimba-app typecheck`; `pnpm --dir Body/M/pratibimba-app test`; `pnpm --dir Body/M/pratibimba-app build`; `pnpm --dir Body/M/pratibimba-app exec playwright test tests/e2e/daily-surface-ownership.spec.ts --reporter=line` (real Chromium + spawned gateway + real-filesystem vault sidecar); `node .codex/scripts/lint-test-honesty.mjs`; `test ! -d Body/M/epi-theia/extensions/library-surface`; `test ! -d Body/M/epi-theia/extensions/logos-atelier`; `test ! -d Body/M/epi-theia/extensions/scent-following-workspace`; verifier ≠ closer; evidence = fresh command output.

5. **T11.4 — `smart-connections-sidebar` layout-claim code-pending marker**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/11-theia-shell-surface-hosting.md` — Tranche 11.4 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: done — verify or rebuild; never build on it unverified.
   Active-carrier disposition: `Body/M/pratibimba-app/src/ui/layoutClaims.ts` holds the `ide-deep` claim as `code-pending` with no receiver, gate 03.T6.5, delivery owner 28.T28.12, and a provenance cross-link to frozen `Body/M/epi-theia/extensions/MIGRATION-SOURCES.md`. `App.tsx` tolerates and diagnoses that pending state; it fails closed for a falsely-landed missing receiver. No Smart Connections pane or factory registration exists.
   Verify: `pnpm --dir Body/M/pratibimba-app exec vitest run src/ui/layoutClaims.test.ts src/App.test.tsx`; `pnpm --dir Body/M/pratibimba-app typecheck`; `pnpm --dir Body/M/pratibimba-app test`; `pnpm --dir Body/M/pratibimba-app build`; `pnpm --dir Body/M/pratibimba-app exec playwright test tests/e2e/pending-layout-claim.spec.ts --reporter=line` (real Chromium + spawned gateway + real-filesystem vault sidecar); `node .codex/scripts/lint-test-honesty.mjs`; verifier ≠ closer; evidence = fresh command output.

6. **T11.5 — Forbidden-direct-import lint enforcement against six M-extension source trees**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/11-theia-shell-surface-hosting.md` — Tranche 11.5 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: done — verify or rebuild; never build on it unverified.
   Active-carrier disposition: no live six-package extension topology exists, so none was invented. `Body/M/pratibimba-app/scripts/lint-import-boundaries.mjs` reads the frozen 07-t0 JSON authority and AST-checks the unified active `src` graph for all prohibited executable module edges, including relative paths resolving into forbidden S-stack trees. It is wired into `pnpm test` before Vitest.
   Verify: `pnpm --dir Body/M/pratibimba-app lint:imports`; `pnpm --dir Body/M/pratibimba-app exec vitest run scripts/import-boundaries.test.mjs`; `pnpm --dir Body/M/pratibimba-app typecheck`; `pnpm --dir Body/M/pratibimba-app test`; `pnpm --dir Body/M/pratibimba-app build`; `node .codex/scripts/lint-test-honesty.mjs`; verifier ≠ closer; evidence = fresh command output.

7. **T11.6 — Acceptance-harness cross-layout state-identity preservation assertion**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/11-theia-shell-surface-hosting.md` — Tranche 11.6 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: done — verify or rebuild; never build on it unverified.
   Active-carrier disposition: `Body/M/pratibimba-app` reads the exact six-field identity around every production cross-layout mutation, rejects drift, and exposes an immutable rendered receipt without adding a state container. Unit integration and real Chromium prove M3 codon daily → deep and M0 personal deep → daily with live gateway profile/session plus filesystem DAY/NOW.
   Verify: `pnpm --dir Body/M/pratibimba-app exec vitest run src/crossLayoutStateIdentity.test.tsx`; `pnpm --dir Body/M/pratibimba-app typecheck`; `pnpm --dir Body/M/pratibimba-app test`; `pnpm --dir Body/M/pratibimba-app build`; `pnpm --dir Body/M/pratibimba-app exec playwright test tests/e2e/cross-layout-state-identity.spec.ts --reporter=line`; `node .codex/scripts/lint-test-honesty.mjs`; verifier ≠ closer; evidence = fresh command output.

8. **T11.7 — Spec-side stale `Tauri implementation` wording audit**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/11-theia-shell-surface-hosting.md` — Tranche 11.7 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: done — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

9. **T11.8 — Integrated-plugin readiness gate against Wave-A profile-field pending markers**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/11-theia-shell-surface-hosting.md` — Tranche 11.8 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: done — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

10. **T11.9 — Surface → extension → contract closure ledger**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/11-theia-shell-surface-hosting.md` — Tranche 11.9 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: done — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

11. **T11.10 — Theia canvas-as-input port for M4-Nara: Tiptap mount + Inversify HighlightService + HighlightMark port**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/11-theia-shell-surface-hosting.md` — Tranche 11.10 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: done — verify or rebuild; never build on it unverified.
   Landed: active-carrier Tiptap 3 Markdown canvas, protected-local highlight mark/service/floating menu, frontmatter-preserving real vault write-back, and the existing journal real-filesystem/reload Playwright flow retargeted from CodeMirror to the canvas.
   Verify: `pnpm --dir Body/M/pratibimba-app exec vitest run src/panes/m4NaraCanvas.test.tsx src/panes/NowPane.test.tsx`; `pnpm --dir Body/M/pratibimba-app typecheck`; `pnpm --dir Body/M/pratibimba-app build`; `pnpm --dir Body/M/pratibimba-app exec playwright test tests/e2e/journal.spec.ts --reporter=line`; `node .codex/scripts/lint-test-honesty.mjs`.

12. **T11.11 — Agent inscription highlight categories + visual register**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/11-theia-shell-surface-hosting.md` — Tranche 11.11 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: done — verify or rebuild; never build on it unverified.
   Landed: six agent categories with distinct typed visual registers and CSS accents; `inscribeAgentMark` wraps an existing Tiptap range non-destructively with `protected_local` / `agent-chat` / `sourceFacet`; portal-core already carries all ten categories plus file-cycle variants.
   Verify: `pnpm --dir Body/M/pratibimba-app exec vitest run src/panes/m4NaraCanvas.test.tsx src/panes/NowPane.test.tsx`; `pnpm --dir Body/M/pratibimba-app typecheck`; `cargo test --offline --manifest-path Body/S/S0/portal-core/Cargo.toml --test nara_journal_parser dream_oracle_and_highlight_inputs_remain_distinguished`; `node .codex/scripts/lint-carrier-tokens.mjs`; `node .codex/scripts/lint-test-honesty.mjs`.

13. **T11.12 — Ambient state strip + Tuning bar widgets on m4-nara surface**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/11-theia-shell-surface-hosting.md` — Tranche 11.12 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: done — verify or rebuild; never build on it unverified.
   Landed: compact ambient/tuning bands above the canvas; strict optional Medicine/spread reads with explicit pending states; latest-session NOW discovery; structured YAML writes for the three canonical tuning keys; keyboard mode shortcuts; real Chromium/filesystem proof.
   Verify: `pnpm --dir Body/M/pratibimba-app exec vitest run src/panes/NaraAmbientTuning.test.tsx src/panes/NowPane.test.tsx`; `pnpm --dir Body/M/pratibimba-app typecheck`; `pnpm --dir Body/M/pratibimba-app exec playwright test tests/e2e/nara-tuning.spec.ts --reporter=line`; `node .codex/scripts/lint-carrier-tokens.mjs`; `node .codex/scripts/lint-test-honesty.mjs`.
