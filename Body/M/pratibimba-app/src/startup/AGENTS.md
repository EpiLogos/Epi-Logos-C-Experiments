# AGENTS.md — startup

## Purpose
`src/startup` composes native supervisor, gateway protocol, first-profile, and vault receipts into the truthful [[M']] workbench reveal boundary. Canon: [[ARCHITECTURE-DIAGRAM-PACK]] → [[M'-SYSTEM-SPEC]].

## Ownership
- `nativeStartup.ts` owns the pure typed phase/receipt derivation.
- `NativeStartupGate.tsx` owns the compact pre-workbench repair surface.
- `nativeStartup.test.ts` owns behavioral phase and receipt coverage.
- Does not own binary resolution or process supervision (`src-tauri/src/supervisor.rs`), gateway transport (`src/bridge/`), profile production ([[S0]]/[[S3]]), vault law ([[S1]]), or workbench composition (`src/workbench/`).

## Local Contracts
- [[M'-SYSTEM-SPEC]] — active carrier and native startup law.
- [[06-redesign-brief]] — Phase A runtime contract.
- [[13-phase-a-b-foundation-receipt]] — current implementation boundary and receipts.

## Work Guidance
- Add a readiness phase only when a real producer supplies a typed receipt; never infer readiness from mounted renderer state.
- Required startup failures stay visible and actionable. Optional service degradation belongs in Organism Health, not in a fabricated ready receipt.

## Verification
- `pnpm vitest run src/startup/nativeStartup.test.ts`
- `node scripts/tauri-boot-smoke.mjs`

## Child DOX Index
- (leaf)
