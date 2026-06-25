# AGENTS.md — acceptance-harness

## Purpose
`@pratibimba/acceptance-harness`: "Track 05 T9 — Full Theia-shell acceptance harness and release gate" — a Node-driven acceptance script that boots/attaches real services (gateway, SpaceTimeDB, Neo4j/Redis, S5 stores), launches the Theia shell, exercises the kernel-bridge + OmniPanel + ide-shell-m0-m5 + agentic-control-room surfaces, shuts down cleanly, and emits a release-gate receipt (per `package.json` `description`).
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[M'-SYSTEM-SPEC]].

## Ownership
- `src/common/acceptance-plan.ts` — the data-not-code acceptance recipe (services + steps) both the script and Theia contribution interpret.
- `src/common/index.ts` — common barrel; `EXTENSION_ID`, `ACCEPTANCE_WIDGET_IDS`, `ACCEPTANCE_HANDLE_PREFIX` (`[ACCEPTANCE:`).
- `src/browser/` — Theia-side contribution: `acceptance-runner.ts`, `frontend-module.ts` (binds runner, `pratibimba.acceptance-harness.run` command), `harness-control-widget.tsx`.
- `scripts/acceptance.mjs` — the executable acceptance driver (boots/attaches services, parses step handles from stdout, verifies invariants, prints JSON receipt); `scripts/run-visual-regression-suite.mjs` dispatches focused visual suites such as `--suite m2-parashakti`.
- `tests/` — `node --test` suite (`topology`, `cold-start*`, `onboarding-*`, `visual-regression*`, `acceptance-plan`, `blocked-readiness-per-extension`).
- `fixtures/` — onboarding + visual-regression fixtures (each with local `README.md`; 15.12 PNG baselines live under `fixtures/visual-regression/*/screenshots/`, and the 23.17 M2 cymatic baseline family lives as root-level `fixtures/visual-regression/m2-*` PNGs plus `m2-parashakti-manifest.json`); `lib/` is the `tsc` build output.
- Does NOT own: the surfaces it drives (kernel-bridge, pratibimba-layouts, m-extension-runtime, ide-shell-m0-m5, agentic-control-room — all `workspace:*` deps), or the gateway runtime (delegated to [[S3-SPEC]] gate at port 18794 via `@pratibimba/kernel-bridge`).

## Local Contracts
- Code Coordinate Header: `src/common/index.ts` and `src/common/acceptance-plan.ts` `//**` doc-comments.
- Owning spec: [[M'-SYSTEM-SPEC]] (Canon: [[ARCHITECTURE-DIAGRAM-PACK]]).
- (no local CONTRACT.md yet — see parent `../AGENTS.md` + Canon.)

## Work Guidance
- Run `gitnexus_impact` before editing any exported symbol; honour the d=1 WILL-BREAK rule.
- [[wikilink]] all coordinate/spec/agent/tool references in any authored artifact.
- The acceptance script defaults to ATTACHING to operator-started services — do not change it to spawn `cargo run` etc. without the `--auto-boot` opt-in.
- Theia-side steps communicate completion ONLY via the `[ACCEPTANCE:<step-id>:<key>=<value>]` stdout handle the script parses.

## Verification
`pnpm --filter @pratibimba/acceptance-harness test` (runs `pnpm build` then `node --test tests/*.test.mjs ../test/validate-extension-contract-preflight.test.mjs`). Visual suite: `pnpm --filter @pratibimba/acceptance-harness test:visual`. Workspace-wide: `pnpm test:contracts` from `Body/M/epi-theia`.

## Child DOX Index
- (leaf)
