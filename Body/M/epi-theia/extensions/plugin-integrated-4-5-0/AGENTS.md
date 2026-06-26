# AGENTS.md — plugin-integrated-4-5-0

## Purpose
The `@pratibimba/plugin-integrated-4-5-0` Theia extension — "Jiva-Siva integrated plugin — Privacy-first composition: M4 protected-local field + M5 review/consent + M0 prior-ground graph. Jiva-is-Siva recognition surface with hard protected-local boundary" (per `package.json`).
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[M'-SYSTEM-SPEC]] (per-coordinate: [[M4'-SPEC]], [[M5'-SPEC]], [[M0'-SPEC]]).

## Ownership
- `src/common/index.ts` — public surface / contract constants (`PLUGIN_ID`, `RANGE_ID` `4-5-0`, `NAMED_LAYOUT_ID` `jiva-siva.integrated`, `CONTRIBUTOR_IDS` = m4-nara/m5-epii/m0-anuttara); generated from `../contracts/08-t0-composition-contract-preflight.json`.
- `src/browser/frontend-module.ts` — Theia DI module (command + view-contribution + widget factory); also contract-generated.
- `src/browser/plugin-integrated-4-5-0-widget.tsx` — primary `ReactWidget` (hand-extended 08.T5 slice; scaffolder no longer overwrites).
- `src/browser/personal-recognition-composition.tsx`, `src/browser/contemplation-flow-director.tsx` — four-slot personal 4/5/0 editor composition: M4 journal left, M4 personal cymatic center field, M5 recognition right blocker surface, M0 grounding under-layer, plus contemplation-close slot updates for the LLM/EBM/Verifier flow. No local M4 tables or raw protected bodies.
- `src/browser/recognition-handoff.tsx` (36.T36.5) — read-only trace→recognition handoff: M4 hands `qComposedHandle` forward → M5 consumes the `AnuttaraPentadicRuntimeTrace` (kernel-bridge, same trace as [[plugin-integrated-1-2-3]]'s pentadic-trace-overlay) as `epii-ebm-position-5` feature context → M0 grounding displays the unified recognition. Purely presentational, single `useCompositionProfile` subscription, stale-generation rejection; no 72/64 conversion, no quaternion math, no protected body. Mounted into the right (M5) and under (M0) slots of `personal-recognition-composition.tsx`.
- `src/browser/jiva-siva-panes.tsx`, `recognition-layer-slot.tsx`, `epii-review-panel.tsx` — retained mini-inspector panes / Mahamaya recognition slot helpers / Epii review surface. No local M4 tables or raw protected bodies.
- `src/browser/deposit-handle-reception.ts`, `identity-augment-review-routing.ts`, `m5-m0-pedagogical-return.ts` — deposit/handle, M5-review-gate routing, M5→M0 pedagogical-return logic (each with co-located `*.test.mjs`).
- `style/index.css` — widget styling; `lib/` — tsc build output.
- Does NOT own: composition arbitration / shared command + layout constants (delegated to `@pratibimba/integrated-composition`), bridge runtime (delegated to `@pratibimba/m-extension-runtime` → [[S3-SPEC]] gate), or the per-coordinate M4/M5/M0 domain law (lives in `m4-nara`/`m5-epii`/`m0-anuttara`).

## Local Contracts
- Code Coordinate Header: `src/common/index.ts` (contract constants) + the `jiva-siva-panes.tsx` privacy-discipline header.
- Owning composition contract: `../contracts/08-t0-composition-contract-preflight.{json,md}` (Track 08).
- Owning spec: [[M'-SYSTEM-SPEC]] and [[M4'-SPEC]] / [[M5'-SPEC]] / [[M0'-SPEC]].

## Work Guidance
- Run `gitnexus_impact` before editing any exported symbol; honour the d=1 WILL-BREAK rule.
- [[wikilink]] all coordinate/spec/agent/tool references in any authored artifact.
- Protected-local boundary is hard law: panes/slots MUST render only backend-supplied handle/summary/visual-state fields — no local M4 personal-field tables, identity-quaternion bodies, Nara journal samples, or Graphiti episode bodies; deep bodies stay behind the `ConsentGate`.
- Do not open profile subscriptions in plugin browser code; composition and mini-inspector renders consume `CompositionProfileProvider` / `useCompositionProfile()` from `@pratibimba/integrated-composition`.
- Do not hand-edit `src/common/index.ts` / `src/browser/frontend-module.ts` (contract-generated from `08-t0-composition-contract-preflight.json`).

## Verification
`pnpm --filter @pratibimba/plugin-integrated-4-5-0 test` (runs `tsc -b` then the `node --test` slice + co-located `*.test.mjs`); workspace-wide `pnpm test:contracts` from `Body/M/epi-theia`.

## Child DOX Index
- (leaf)
