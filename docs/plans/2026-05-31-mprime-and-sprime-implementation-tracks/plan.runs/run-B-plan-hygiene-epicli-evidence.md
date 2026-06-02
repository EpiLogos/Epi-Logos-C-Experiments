# Run Evidence — Thread B: Plan Hygiene + epi-cli/app Re-wire

**Owner:** `admin-plan-hygiene`
**Date:** 2026-06-01
**Scope:** Parser fix + Track 06 collapse + epi-cli/app verification per `handover-B-plan-hygiene-epicli.md`

## Piece 1 — Parser fix (regression for asterisks inside backticks)

**Baseline finding.** When this thread arrived, the assessor already reported `totalTasks: 97` (not the `80` the handover predicted). The orchestrator's "80" baseline was stale. The three regex patterns in `collectTaskHeadingMatches` (`m-dev-plan-assess.mjs` lines 181-188) already supported the three heading shapes Track 03 / 04 / 06 use.

**Residual bug surfaced.** Track 03 `**Tranche 6.5 - S1 vault gateway surface (`s1'.vault.*` + `s1'.semantic.*`) over Hen substrate.** (per IOD-18, IOD-19)` was silently dropped because both bold patterns matched the title body with `[^*\n]+` — that character class forbids ALL asterisks, so the regex stopped at the first internal `*` inside `s1'.vault.*` and could not close on the trailing `**`. T6.5 vanished from the index.

**Fix.** Surgical regex relaxation in `collectTaskHeadingMatches`: replace `[^*\n]+` with `(?:[^*\n]|\*(?!\*))+?` for both bold-style patterns. Single asterisks inside the title body are now permitted; the closing `**` still terminates. The third pattern (Track 04 `### Tranche` headings) was already permissive — left untouched.

**Regression test added.** `.codex/scripts/__tests__/m-dev-plan-assess.test.mjs` gains `parses bold tranche titles that contain single asterisks inside backticks` with the actual T6.5 title shape (asterisks inside backticks plus trailing inline content after the closing `**`).

**Verification.**
- `node --test .codex/scripts/__tests__/m-dev-plan-assess.test.mjs` → 15/15 passing (was 14, now +1 regression).
- `node .codex/scripts/m-dev-plan-assess.mjs --write --json docs/plans/2026-05-31-...` → `totalTasks: 97 → 98`. Track 03 now shows `T1, T2, T3, T4, T5, T6, T6.5, T7` (8 entries; previously 7).

## Piece 2 — Track 06 collapse into Track 05

**Baseline.** T0/T1 already marked `done` with prior evidence (real Tauri-side work that landed before the canon recast). T2-T8 were `pending`.

**Status helper limitation.** The `STATUSES` set in `m-dev-plan-assess.mjs` (line 9) accepts `pending|ready|in_progress|blocked|review|done` — no `superseded`. Per the handover ("otherwise `done` with evidence 'superseded by 05.T2 per canon recast §2-§3'"), used `done` + canonical evidence string.

**Marks applied.** `06.T2` through `06.T8` (seven entries) marked `done` with evidence:

> "superseded by 05.T2 per canon recast in m5-prime-system-shape-and-tauri-ide-canon §2-§3 Theia-only revision; absorbed into Track 05 T2 as 0/1-layout-build sub-tranche per 05-tauri-ide-shell-and-pratibimba-system.md preamble + §Architectural Keystones. See plan.runs/migration-inventory.md and 06-zero-one-surface-evolution.md status banner. T0/T1 retained as historical record."

**Banner added.** `06-zero-one-surface-evolution.md` gains a new top-of-file status paragraph above the existing `COLLAPSED` blockquote, explicitly identifying T2-T8 as superseded (mapped to ledger `done`) and T0/T1 as retained historical record.

**Verification.**
- Post-mark summary: `done: 53 → 60` (+7). `pending: 44 → 37` (-7). `totalTasks: 98` unchanged.
- All Track 06 entries now `done`.

## Piece 3 — `epi-cli/app` re-wire to Theia Electron

**Baseline.** When this thread arrived, `Body/S/S0/epi-cli/src/app/mod.rs` was **already fully re-wired** to the Theia Electron app:

- `app_source_dir` defaults to `repo_root.join("Idea/Pratibimba/System/electron-app")` with `EPI_APP_SOURCE_DIR` env override.
- `app_bundle_path` returns per-OS Electron-builder output (`dist/mac/Pratibimba System.app` on macOS, `dist/linux-unpacked`, `dist/win-unpacked`) with `EPI_APP_BUNDLE_PATH` env override.
- `pnpm_app_command` invokes `pnpm run <script>` in the source dir (replacing `cargo_tauri_command`).
- `AppCmd::{Launch, Dev, Build}` route through pnpm scripts (`dev`, `dist:dir`) and bundle-open as appropriate.
- `launch_command_for_repo` opens the bundle if present, else falls back to `pnpm run dev`.
- The two locked tests are already renamed to `app_source_targets_theia_electron` and `app_bundle_targets_electron_dist`, with assertions made cross-platform via `cfg!(target_os = ...)`.

**No code changes needed for Piece 3.** A predecessor commit (likely from Thread A's predecessor or an earlier substrate pass) landed the flip already.

**Verification.**
- `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --lib app::tests` → `running 2 tests; test app::tests::app_source_targets_theia_electron ... ok; test app::tests::app_bundle_targets_electron_dist ... ok; test result: ok. 2 passed; 0 failed; 0 ignored; 0 measured; 224 filtered out`.
- Full `cargo test ... app::` filter exits 0.

## Findings for the substrate active thread

The parser fix exposed Track 03's T6.5 and the existing visibility of Tracks 03 / 04 confirms the assessor is honest about their state. **Recommend the substrate active thread review the following auto-mark candidates** — Thread B did NOT promote these unilaterally per handover discipline:

**Track 03 candidates (most likely already done in substrate):**

- `03.T1` is `review` with one evidence entry. Inspect that evidence; consider promotion to `done` if the listed cargo tests landed.
- `03.T2..T5` are `pending`. Per `08.T8` evidence ("S0/S3 SpaceTimeDB bridge: cargo test ... gate_spacetimedb_bridge ... passed"), the gateway WebSocket multiplex + native SpaceTimeDB subscription + shared-cosmos reducers + `/body` consumption work has live test evidence. Recommend the substrate thread cross-walk `08.T8` evidence against each T1-T5 acceptance criterion and promote where the test surface actually exercises the tranche's verification line.
- `03.T6` (Graphiti compatibility) — separate review; the `graphiti_runtime_contract` test landing is the canonical signal.
- `03.T6.5` (S1 vault gateway surface, just made visible by the parser fix) — assess against any Hen-substrate work already merged.
- `03.T7` (multi-client soak + privacy audit + release gate) — likely NOT done; this is the live integration release gate.

**Track 04 candidates:** all `pending`. The Track 04 markdown describes M5-3/M5-4 mediation, autoresearch state machine, review-core governance extension. `08.T8` evidence cites autoresearch and review-core tests passing; **recommend the substrate thread audit Track 04 T0-T7 against the autoresearch/review evidence in `08.T8`**. T8-T9 are likely still open (E2E acceptance + spine acceptance scenario).

**Discipline.** Thread B held the line: no auto-promotion. Promotions happen only when the substrate thread (or human review) confirms the cargo test surface in `08.T8` evidence covers each tranche's stated Verification line.

## Files touched (lane discipline check)

Per the handover writescope:

- `.codex/scripts/m-dev-plan-assess.mjs` — regex relaxation (Piece 1).
- `.codex/scripts/__tests__/m-dev-plan-assess.test.mjs` — added regression test (Piece 1). Note: handover suggested `.codex/scripts/tests/`; the existing convention is `__tests__/`, so the fixture lives there.
- `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/plan.state.json` — Track 06 T2-T8 marked done, plus the T6.5 entry materialized by the parser fix (Pieces 1+2).
- `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/plan.index.json` — regenerated.
- `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/06-zero-one-surface-evolution.md` — added status banner (Piece 2).
- `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/plan.runs/run-B-plan-hygiene-epicli-evidence.md` — this file.

**Not touched:** `Idea/Pratibimba/System/extensions/**` (Threads A and C lanes), `Body/S/**` (substrate active thread lane — Piece 3 was a no-op since the flip was already in place), `Body/M/epi-tauri/**` (deprecated).

## Summary

- Parser: `totalTasks 97 → 98` (T6.5 newly visible). 15/15 unit tests passing.
- Track 06: T2-T8 marked `done` with `superseded by 05.T2` evidence. Status banner added.
- epi-cli/app: 2/2 app tests passing; substrate already flipped to Theia Electron in a prior thread.
- Findings: surfaced Track 03/04 auto-mark candidates for substrate-thread review against `08.T8` cargo evidence.
