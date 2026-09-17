# Track 06 — M5 Epii Reconciliation (RERUN — target: pratibimba-app + substrate)

Source of truth for every tranche below: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/06-m5-epii-reconciliation.md` — read the tranche's section IN FULL there before executing; this file carries only retarget + audit posture. Retarget law, resolved decisions, and verification law: `CHARTER.md`. Audit map: [[2026-07-03-cycle-3-recapture-register]] §2 (track 06). Original ledger statuses are CLAIMS about the dead Theia carrier, never truth about this one. Track 00 (verification harness) gates all closure here.

**⚑ Carrier (track 06) — build/verify HERE, never epi-theia:** CARRIER: M5' EBM observatory (72-grid, Klein-V4 tritone squares, Logos Atelier) in pratibimba-app. SUBSTRATE: epii-autoresearch-core resonance_ebm + portal-core. §2 track 06/26.

1. **T6.1 — Register `s5'.gnostic.*` over production epi-gnostic — EXPANDED to ONE substrate layer**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/06-m5-epii-reconciliation.md` — Tranche 6.1 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: done — verify or rebuild; never build on it unverified.
   Depends on Track 00 Tranche 3.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

2. **T6.2 — Activate Atelier as etymological-cluster lens on m0-anuttara graph viewer + OmniPanel commands**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/06-m5-epii-reconciliation.md` — Tranche 6.2 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: quarantine — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

3. **T6.3 — Six operational-capacity panes over `capacity_workflows.rs`**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/06-m5-epii-reconciliation.md` — Tranche 6.3 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: quarantine — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

4. **T6.4 — Canon Studio + Backend Studio Theia extensions**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/06-m5-epii-reconciliation.md` — Tranche 6.4 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

5. **T6.5 — Execute DR-M5-1 + DR-M5-2 register cleanup**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/06-m5-epii-reconciliation.md` — Tranche 6.5 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Verify: `python3 -m pytest Body/S/S4/plugins/pleroma/tests/test_capability_matrix.py`; `pnpm --dir Body/M/pratibimba-app exec vitest run src/panes/omni/omnipanelCapabilities.test.ts src/panes/omni/omnipanelCapabilities.live.test.ts src/engine/compositionMatheme.test.ts src/panes/KleinTopologyPane.test.tsx`; `node .codex/scripts/lint-test-honesty.mjs`; `node -e "const fs=require('fs'),p=require('path');const root='Idea/Bimba/Seeds/M';const bad=/M0.*witness-axis|M0 Anuttara witness/;const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()&&!['Legacy','plans'].includes(e.name)?walk(p.join(d,e.name)):e.isFile()&&e.name.endsWith('.md')?[p.join(d,e.name)]:[]);const hits=walk(root).filter(f=>bad.test(fs.readFileSync(f,'utf8')));if(hits.length){console.error(hits.join('\n'));process.exit(1)}"`. Verifier ≠ closer; evidence = fresh command output.

6. **T6.6 — `anuttara_trace` orphan-fill referral**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/06-m5-epii-reconciliation.md` — Tranche 6.6 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: quarantine — verify or rebuild; never build on it unverified.
   Verify: `node -e "const fs=require('fs');const s=fs.readFileSync('Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/14-no-orphan-audit-and-release-gates.md','utf8');const row=s.split('\\n').find(l=>l.includes('anuttara_trace(output, sensitivity, depth)'));const required=['M5-claimed','M0-substrate-owner requirement','read-only contemplative-offering only','governed routed-write per DR-M0-1','no separate carrier lands','CLOSED / REVERIFIED 2026-07-16'];if(!row||required.some(x=>!row.includes(x))){console.error(row||'missing anuttara_trace row');process.exit(1)}"`; `node .codex/scripts/lint-test-honesty.mjs`; class-W verifier reruns gateway/live-wire proof per Track 00; verifier != closer; evidence = fresh command output.

7. **T6.7 — DR-M5-1 implementation landing tranche**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/06-m5-epii-reconciliation.md` — Tranche 6.7 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Verify: `python3 -m pytest Body/S/S4/plugins/pleroma/tests/test_capability_matrix.py`; `pnpm --dir Body/M/pratibimba-app exec vitest run src/panes/omni/omnipanelCapabilities.test.ts src/panes/omni/omnipanelCapabilities.live.test.ts src/panes/m5ReviewGate.test.ts`; `node --test Body/S/S4/ta-onta/S4-2p-pleroma/tests/terminal_tools.test.ts`; `node .codex/scripts/lint-test-honesty.mjs`; class-W verifier reruns gateway/live-wire proof per Track 00; verifier != closer; evidence = fresh command output.

8. **T6.8 — EBM-Epii position 5' resonance-vector predictor module (72-dim N-channel head, Rust-native)**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/06-m5-epii-reconciliation.md` — Tranche 6.8 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Verify: `cargo check --offline --manifest-path Body/S/S5/epii-autoresearch-core/Cargo.toml --features resonance_ebm`; `cargo test --offline --manifest-path Body/S/S5/epii-autoresearch-core/Cargo.toml --features resonance_ebm --test resonance_ebm_runtime`; `cargo test --offline --manifest-path Body/S/S5/epii-autoresearch-core/Cargo.toml --features resonance_ebm resonance_ebm::mirror_consistency_loss`; `cargo test --offline --manifest-path Body/S/S5/epii-autoresearch-core/Cargo.toml --features resonance_ebm --test anuttara_pentadic_feature`; `node .codex/scripts/lint-test-honesty.mjs`; class-W verifier reruns gateway/live-wire proof per Track 00; verifier != closer; evidence = fresh command output.

9. **T6.9 — `pi train-ebm` + `pi export-ebm-state` CLI commands**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/06-m5-epii-reconciliation.md` — Tranche 6.9 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Verify: `cargo test --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml --test pi_ebm_commands`; `cargo test --offline --manifest-path Body/S/S5/epii-autoresearch-core/Cargo.toml --features resonance_ebm exported_checkpoint_round_trips_into_resonance_ebm_runtime --lib`; `cargo test --offline --manifest-path Body/S/S5/epii-autoresearch-core/Cargo.toml resonance_corpus --features resonance_ebm`; `node .codex/scripts/lint-test-honesty.mjs`; class-W verifier reruns gateway/live-wire proof per Track 00; verifier != closer; evidence = fresh command output.

10. **T6.10 — EBM kernel-runtime integration + Möbius descent step (Riemannian-quaternion gradient pipeline, per-element-tick invocation)**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/06-m5-epii-reconciliation.md` — Tranche 6.10 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: done — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

11. **T6.11 — `kernel.rs` total_energy formula + E_4 parameter restructure (canonical 4:5:6 weighting)**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/06-m5-epii-reconciliation.md` — Tranche 6.11 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: done — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

12. **T6.12 — Wisdom curation loop: Epii M5'-self-referential autoresearch + ML at M5-4' + VAK-gated pair-development surface**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/06-m5-epii-reconciliation.md` — Tranche 6.12 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: done — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.
