# Track 07 — Integrated 1-2-3 Cosmic Engine Reconciliation

Reconciles the integrated `1-2-3` cosmic engine plugin across the four corpora. This plugin composes [[M1']] + [[M2']] + [[M3']] through the kernel-bridge profile-tick — the cosmic stratum of the `137 = 64 + 72 + 1` matheme (M1 +1 → M2 72 → M3 64). The plugin package is landed; cycle-3 work is composition contract + readiness gating against Wave-A pending profile-field markers. Anti-greenfield throughout.

## Source Specs and Matrix

- Canonical: `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md` (shell-0 cosmic 1-2-3 invariant), `Idea/Bimba/Seeds/M/alpha_quaternionic_integration_across_M_stack.md` (137 architecture)
- Companions: M1'/M2'/M3' specs (the three poles being composed), `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-2-canonical/08-integrated-1-2-3-cosmic-engine-plugin.md` (cycle-2 owner)
- Cross-references: Wave-B kernel-bridge matrix; Wave-A M1 (Tranches 02.2, 02.3, 02.4), M2 (Tranches 03.2, 03.3, 03.4), M3 (Tranche 04.2)

## Cycle 2 Substrate Inheritance

Consume as-is — `Body/M/epi-theia/extensions/plugin-integrated-1-2-3` package (deps wire to the three M-extensions); `@pratibimba/integrated-composition` for shared `LayoutClaim` arbitration; `08-t0-composition-contract-preflight` inherits `07-t0`'s bridge/forbidden-import discipline. Cycle 2 Track 08 named the plugin; cycle 3 closes its readiness contract and composition seam.

## Tranches

1. **7.1 — Integrated readiness gate against Wave-A pending profile fields** *(spec-ahead-integration; cross-link to Wave-B Tranche 11.8)*

   `plugin-integrated-1-2-3` declares typed `IntegratedReadiness` blocked-states consuming Wave-A pending markers (`klein_flip_state` from M1 02.2 / kernel-bridge 10.2; `resonance72` from kernel-bridge; six-axes-of-72 decoding from M2 03.3; `audio_octet[8]` / `nodal_quartet[4]` aligned but conditional on M1' performance event 02.4) via the shared `integrated-composition` contract. Extend, no rebuild.

   Verification: `pnpm --filter @pratibimba/integrated-composition test`; `pnpm --filter @pratibimba/plugin-integrated-1-2-3 test`; fixture parity with kernel-bridge readiness ledger (`plan.runs/wave-b-kernel-bridge-matrix.md`).

2. **7.2 — 137 = 64 + 72 + 1 composition assertion** *(spec-ahead-integration)*

   Add composition-contract assertion that the plugin's stratification preserves the matheme spine: M3 codon (64) + M2 invariant (72) + M1-5 (+1) = 137. The `+1` parent attribution rendered in topology slot `parentAttribution` must read `M1-5`, **not** `M0-Anuttara-witness`. Cross-link to DR-M1-1 / DR-M5-2.

   Verification: widget render-test asserts `parentAttribution === 'M1-5'`; `grep -n parentAttribution Body/M/epi-theia/extensions/plugin-integrated-1-2-3/src/` shows correct binding.

3. **7.3 — Solar-anchor design principle integration** *(doc-ahead-landing; cross-link to Tranche 09.5)*

   Plugin owns the **B-8 / B-9 / B-12** composition seam from Wave-B integrated-bimba: solar anchor + planetary placement + cross-surface edit propagation listener via kernel-bridge profile-tick events. Authored as the composition contract in `plugin-integrated-1-2-3/src/common/composition-contract.ts`.

   Verification: `ls Body/M/epi-theia/extensions/plugin-integrated-1-2-3/`; `cd Body/M/epi-theia/extensions/plugin-integrated-1-2-3 && yarn build`; `test -f package.json && grep -n 'solar\|planetary\|propagation' src/common/composition-contract.ts`.

4. **7.4 — Cl(4,2) one-algebra cross-pole assertion** *(aligned-only-note; cross-link to Tranches 02.7, 04.7, 10.7)*

   Plugin contract notes that M1 ring quaternion, M3 codon quaternion, and M4 personal quaternion share **one Cl(4,2) algebra** at `Body/S/S0/portal-core/src/quaternion.rs`. Cross-rendering integrity depends on this. Audit owned by Tranches 02.7 / 10.7; this note encodes the dependency.

   Verification: `grep -rn 'Quaternion\|cl_4_2\|cl42' Body/S/S0/portal-core/src/` returns one canonical type; plugin contract references the audit memo.

5. **7.5 — Plugin layout claim against shell-0 (cosmic) decision** *(spec-ahead-integration; cross-link to Tranche 11.1 DR-TS-1)*

   Plugin's `LayoutClaim` for shell-0 must match the DR-TS-1 resolution (intra-`daily-0-1`-toggle or third layout). No build until DR-TS-1 ratified.

   Verification: DR-TS-1 row in `13-decision-register.md` marked validated; `pnpm --filter @pratibimba/plugin-integrated-1-2-3 test` asserts layout-claim against ratified shell shape.
