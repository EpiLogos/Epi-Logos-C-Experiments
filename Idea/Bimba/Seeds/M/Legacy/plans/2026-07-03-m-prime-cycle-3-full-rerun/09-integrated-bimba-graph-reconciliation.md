# Track 09 — Integrated Bimba-Graph Reconciliation (RERUN — target: pratibimba-app + substrate)

Source of truth for every tranche below: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/09-integrated-bimba-graph-reconciliation.md` — read the tranche's section IN FULL there before executing; this file carries only retarget + audit posture. Retarget law, resolved decisions, and verification law: `CHARTER.md`. Audit map: [[2026-07-03-cycle-3-recapture-register]] §2 (track 09). Original ledger statuses are CLAIMS about the dead Theia carrier, never truth about this one. Track 00 (verification harness) gates all closure here.

**⚑ Carrier (track 09) — build/verify HERE, never epi-theia:** CARRIER: gnostic/graph panes + `epi know`/`epi canon` knowledge surfaces (none landed). SUBSTRATE: graph-services single :Bimba label + four namespaces, governed-route writes only. Zero done. §2 track 09.

1. **T9.1 — M0' six-layer surface contract — author per-layer routing model**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/09-integrated-bimba-graph-reconciliation.md` — Tranche 9.1 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: quarantine — verify or rebuild; never build on it unverified.
   Depends on Track 00 Tranche 3.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

2. **T9.2 — Two-relation-families schema discriminator**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/09-integrated-bimba-graph-reconciliation.md` — Tranche 9.2 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

3. **T9.3 — Image-assets-on-nodes schema slot + dataset-import path**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/09-integrated-bimba-graph-reconciliation.md` — Tranche 9.3 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

4. **T9.4 — Governed-route gateway posture**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/09-integrated-bimba-graph-reconciliation.md` — Tranche 9.4 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

5. **T9.5 — One-substrate / three-rendering integration plugin ownership**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/09-integrated-bimba-graph-reconciliation.md` — Tranche 9.5 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: quarantine — verify or rebuild; never build on it unverified.
   Verify: `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_temporal_context --test kernel_bridge_runtime_contract`; `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_temporal_context live_redis_temporal_context_hydration_uses_s3_namespace -- --ignored --exact`; `pnpm --dir Body/S/S0/epi-cli/schemas test`; `pnpm --dir Body/M/pratibimba-app exec vitest run src/bridge/gatewayClient.test.ts src/state/useProfileTick.test.tsx src/composition/compositionContract.test.ts scripts/live-wire.test.mjs`; `node Body/M/pratibimba-app/scripts/live-wire.mjs --profiles 8 --no-dump`. Verifier ≠ closer; evidence = fresh command output.

   **Ratified seam (Architect, 2026-07-16 — recorded in plan, no DR):**
   - The three renderings are the **M1/M2/M3 body poles** at their `-5` positions — M1 torus-knot/Klein `+1`, M2 72-cymatic, M3 64-codon — composing `137 = 64 + 72 + 1` (the track-07 arrangement already landed in `compositionMatheme.ts`). This is the canonical M2/M3 seam; the older wave-b "M0′ graph + M2′ solar + M3′ clock" phrasing is superseded.
   - **M0′ is the graph VIEW of the Bimba map** (its six data-layers: lang/ql/rel/time/pers/pedag) — the structural affordance over the SAME substrate, NOT a fourth pole. It re-reads the substrate like the body poles do.
   - **B-8 non-fork:** one Neo4j `:Bimba` graph under every rendering. **B-11/B-12 write path is governed-route** (DR-M0-1), never raw M0′ CRUD.

   **Landed + tested (this tranche) — B-12 wire, all 4 edges:**
   1. **Composition contract** — `Body/M/pratibimba-app/src/composition/compositionContract.ts` (+ test, 8 cases): declares `plugin-integrated-1-2-3` owns **B-8/B-9/B-12**, encodes the seam above, states the B-12 propagation law grounded in the single monotonic generation gate (no per-surface stale cache).
   2. **Kernel-bridge relay** — `graph_revision: Option<u64>` on `KernelBridgeCachedProfile` + `KernelBridgeProfileJsonShape`, read verbatim from the projection context (`safe_cached_profile_from_context`), serialized additively (`graphRevision`, skip-when-None). Test `kernel_bridge_relays_graph_revision_from_context_for_b12_propagation` (contract suite green, 26 pass).
   3. **Carrier consumption** — `graphRevision` on `bridge/types.ts KernelBridgeCachedProfile` + surfaced on the one re-render seam `useProfileTick().graphRevision`; `crossSurfacePropagation` fires on live data (useProfileTick suite green, 11 pass).

   4. **S3 gateway stamp** — `gate/temporal.rs` reads canonical [[S2]] `GraphMeta.graph_revision` with a bounded live Neo4j query and stamps hydrated `context["kernel"]["graphRevision"]`; `gate/server/mod.rs` reuses a reconnecting background metadata client and samples it into `profile.update` without putting graph latency on the 1 Hz heartbeat. The carrier lifts only non-negative safe integers. Real proof: the Docker-backed temporal test compares the stamped value with live `GraphMeta`; live-wire captured 8/8 profile frames with a non-negative, non-regressing revision and passed the complete projection manifest. B-12 is live end-to-end.

6. **T9.6 — M0-3' synchronic community + diachronic clock overlay**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/09-integrated-bimba-graph-reconciliation.md` — Tranche 9.6 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Landed: active-carrier `M0CommunityClockPanel` invokes the real S2 GDS tangent-overlay method for the shared coordinate and renders its synchronic status/privacy result beside the kernel-profile world clock and handle-only [[Graphiti]] references. No local clock, graph write, fabricated GDS result, or episode body enters the pane.
   Verify: `cargo test --offline --manifest-path Body/S/S2/graph-services/Cargo.toml gds`; `pnpm --dir Body/M/pratibimba-app exec vitest run src/panes/m0CommunityClockOverlay.test.ts`; `pnpm --dir Body/M/pratibimba-app exec playwright test tests/e2e/m0-community-clock.spec.ts --reporter=line`; `node .codex/scripts/lint-test-honesty.mjs`; then independent Track-00 verification (verifier ≠ closer).

7. **T9.7 — One-substrate / no-fork invariant codification**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/09-integrated-bimba-graph-reconciliation.md` — Tranche 9.7 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Landed: [[M0'-SPEC]], [[M2'-SPEC]], [[M3'-SPEC]], and the active `compositionContract.ts` comment cross-codify B-8 as one `:Bimba` label + one `coordinate` identity property + one [[Body/S/S2/graph-schema]] authority + one [[plugin-integrated-1-2-3]] composition seam. Documentation/comment-only; no executable shape changed.
   Verify: `for file in "Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md" "Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md" "Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md" Body/M/pratibimba-app/src/composition/compositionContract.ts; do rg -q ':Bimba' "$file" && rg -q 'coordinate' "$file" && rg -q 'graph-schema' "$file" && rg -q 'plugin-integrated-1-2-3' "$file" || exit 1; done`; `pnpm --dir Body/M/pratibimba-app exec vitest run src/composition/compositionContract.test.ts`; `node .codex/scripts/lint-test-honesty.mjs`; then independent Track-00 verification (verifier ≠ closer).

8. **T9.8 — Anuttara property naming round-trip**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/09-integrated-bimba-graph-reconciliation.md` — Tranche 9.8 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Landed: S2 maps the public Anuttara aliases to canonical `c_1_symbol` / `c_1_formulation_type` / `c_1_complete_formulation`, reads those properties in the node API, and names them in alias provenance; the active M0-0' field list requests only canonical keys and has a no-alias regression test.
   Verify: `cargo test --offline --manifest-path Body/S/S2/graph-services/Cargo.toml anuttara_property_mappings_round_trip`; `cargo test --offline --manifest-path Body/S/S2/graph-services/Cargo.toml --test ontology_bridge_contract`; `pnpm --dir Body/M/pratibimba-app exec vitest run src/panes/m0Layers.test.ts`; `node .codex/scripts/lint-test-honesty.mjs`; then independent Track-00 verification (verifier ≠ closer).

9. **T9.9 — M0' graph chrome ↔ M5-0' library chrome Klein seam**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/09-integrated-bimba-graph-reconciliation.md` — Tranche 9.9 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Landed: the existing Bimba graph host now embeds a coordinate-scoped [[M5-0']] Library pane that calls production `s5'.gnostic.etymology`, separates direct `bimba_coordinate` anchors from relationship-backed `bimba_resonances`, and discards entity bodies. Real Chromium walks to M1 and compares the pane with a separate gateway RPC using the repository `epi-gnostic` executable; no standalone graph viewer or generic view-mode ontology was added.
   Verify: `Body/S/S5/epi-gnostic/.venv/bin/python -m pytest Body/S/S5/epi-gnostic/tests/test_coordinate_tags.py Body/S/S5/epi-gnostic/tests/test_one_substrate_smoke.py -q`; `pnpm --dir Body/M/pratibimba-app exec vitest run src/panes/m0M5LibrarySeam.test.ts`; `pnpm --dir Body/M/pratibimba-app exec playwright test tests/e2e/m0-m5-library-seam.spec.ts --reporter=line`; `test ! -d Body/M/pratibimba-app/src/bimba-graph-viewer`; `node .codex/scripts/lint-test-honesty.mjs`; then independent Track-00 verification (verifier ≠ closer).

10. **T9.10 — S2 gateway exposure of graph methods**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/09-integrated-bimba-graph-reconciliation.md` — Tranche 9.10 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

11. **T9.11 — C-layer graph parser + retrieval intelligence**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/09-integrated-bimba-graph-reconciliation.md` — Tranche 9.11 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

12. **T9.12 — Hen graph-promotion C-first evidence contract**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/09-integrated-bimba-graph-reconciliation.md` — Tranche 9.12 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

13. **T9.13 — `epi canon coord` depth ladder + canon-CLI surface family**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/09-integrated-bimba-graph-reconciliation.md` — Tranche 9.13 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

14. **T9.14 — `/World` as 1st-class S2 namespace + `:Gnostic` label promotion**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/09-integrated-bimba-graph-reconciliation.md` — Tranche 9.14 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.
