# Track 08 — Integrated 4-5-0 Recognition Reconciliation

Reconciles the integrated `4-5-0` recognition plugin across the four corpora. This plugin composes [[M4']] + [[M5']] + [[M0']] through the kernel-bridge profile-tick + Nara protected-local handles — the personal stratum of *Jiva-is-Śiva* recognition. The plugin package is landed; cycle-3 work is the privacy-class composition contract, the M4 deposit-handle handoff (from M2 F_routing), and the M0' deep-link return for pedagogical anchoring. Anti-greenfield throughout.

## Total-Shape Architecture (Phase A)

Canonical composition-architecture document: [`Idea/Bimba/Seeds/M/INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md`](Idea/Bimba/Seeds/M/INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md) (838 lines). Profile-bus projections are `PersonalPoleProjection` (per DR-M4-3 / Tranche 10.M4) plus `canon_recognition_stream: Vec<CanonRecognitionEvent>` (per INTEGRATED §4.3.2), not raw personal bodies. DR-IG-6 is VALIDATED with corrected dipyramid + Hopf-linked-tori geometry. Composition contract: M4 protected-local + M5 Logos Atelier + M0-5' pedagogy on three composition slots, opaque handles only across boundaries. PatternPacket chain owner: CCT-7. Möbius write-back to M0 routes via governed-route (DR-M0-1).

**Out-of-scope seam:** M5-0' Library/Gnostic Namespace placement is owned by Tranches 06.1 / 06.4 / 15.3 per DR-M5-3 (left-sidebar activity-bar mode in `ide-deep`, NOT an OmniPanel tab). The 4-5-0 plugin consumes M5-0' only through the summonable M5-5' Logos Atelier drawer and M0 backdrop.

## Source Specs and Matrix

- Canonical: `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md` (shell-1 personal 4-5-0 + flow-writing invariant), `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md` (recognition / Jiva-is-Śiva surface)
- Companions: M4'/M5'/M0' specs, `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-2-canonical/09-integrated-4-5-0-recognition-plugin.md` (cycle-2 owner)
- Cross-references: Wave-A M4 (Tranches 05.1, 05.3, 05.5, 05.8, 05.9), M5 (Tranches 06.2, 06.3), M0 (Tranches 01.1, 01.5, 01.6); Wave-B agentic-layer (Tranche 12.4 recursive-self-review gate)

## Cycle 2 Substrate Inheritance

Consume as-is — `Body/M/epi-theia/extensions/plugin-integrated-4-5-0` package; `@pratibimba/integrated-composition` shared `LayoutClaim`; `08-t0-composition-contract-preflight`. Cycle 2 Track 09 named the plugin; cycle 3 closes its privacy-first composition seam and the M4→M0 pedagogical return.

## Tranches

1. **8.1 — Privacy-first composition contract (no raw bodies cross plugin)** *(spec-ahead-integration)*

   Composition contract asserts per DR-M4-3: M4 `ProtectedPersonalFieldInput` (`qIdentity`/`qTransit`/`qActivity`/`qComposed`) MUST cross to M5 review surfaces only as **opaque handles** with provenance-state — never raw quaternions, never audio_octet bodies. Cross-link to M4 Tranche 05.5 psychoid-cymatic renderer-handle invariant.

   Verification: `pnpm --filter @pratibimba/plugin-integrated-4-5-0 test`; contract test asserts plugin rejects raw `q_personal` payload at composition boundary.

2. **8.2 — M2 → M4 deposit-handle reception** *(spec-ahead-integration; depends on Tranche 03.8)*

   Plugin receives the M4' deposit handle emitted by M2 F_routing (Tranche 03.2 → 03.8) and routes it into Nara journal via `nara_journal::deposit`. Privacy-class verified at handoff.

   Verification: integration test M4' journal receives the handle on synthetic F_routing trace; `grep -n 'deposit_handle' Body/M/epi-theia/extensions/plugin-integrated-4-5-0/src/`.

3. **8.3 — M5 recursive-self-review gate consumption** *(spec-ahead-integration; cross-link to Tranche 12.4)*

   Plugin surfaces identity-augment proposals (Tranche 05.9) through M5 review widget; Pi review-routing gate from Tranche 12.4 must gate `applied` verdict on user final-validation when actor is `sophia`/`anima`/`pi`/`aletheia`. Here `aletheia` means the mode/carrier in the review lineage, not the six subagent techne-guardians; those surface as Anima-dispatch sub-traces.

   Verification: ACR contract test (`agentic-control-room/tests`) asserts `enforceHumanGate({decision:'approve', humanRequired:false, actorIsHuman:false, recursiveSelfReview:true, actor:'sophia'}).ok === false`; plugin integration test routes proposals through this gate.

4. **8.4 — M5 → M0 pedagogical return (Möbius write-back)** *(doc-ahead-landing; cross-link to Tranches 06.2, 01.1)*

   Plugin owns the personal → pedagogical return path: recognized patterns crystallize through Logos Atelier (Tranche 06.2) into M0' M0-5' pedagogy layer (Tranche 01.1 M0-5' bridged route). No canon mutation — read-only contemplative offering anchored to M0 nodes.

   Verification: integration test asserts pedagogical return surfaces in M0-5' deep-link without mutating canon; `grep -n 'pedagogy\|atelier-return' Body/M/epi-theia/extensions/plugin-integrated-4-5-0/src/`.

5. **8.5 — Plugin layout claim against shell-1 (personal) decision** *(spec-ahead-integration; cross-link to Tranche 11.1 DR-TS-1)*

   Plugin's `LayoutClaim` for shell-1 personal + flow-writing surface must match DR-TS-1 (VALIDATED 2026-06-02): personal is the 1-side of the `daily-0-1` intra-layout toggle; no third layout.

   Verification: `pnpm --filter @pratibimba/plugin-integrated-4-5-0 test` asserts layout-claim against ratified shell shape; OMNIPANEL_TABS cross-layout availability honored.

6. **8.6 — 0/1 cymatic polarity consumer** *(spec-ahead-integration; cross-link to Tranche 05.7 DR-M4-2)*

   Plugin consumes the ratified personal-cymatic polarity from DR-M4-2 clause 5: **0=cosmic, 1=personal**. Wire that polarity through `MathemeHarmonicProfile.audio_octet` rendering boundary and ensure Track 11.1 inherits the same sweep.

   Verification: widget render-test asserts polarity matches ratified canon; `grep -n 'cymatic_polarity\|psychoid_polarity' Body/M/epi-theia/extensions/plugin-integrated-4-5-0/src/`.

7. **8.7 — Dipyramid renderer enforces DR-IG-6 corrected 6+6 geometry** *(spec-ahead-integration; DR-IG-6 VALIDATED)*

   The psychoid renderer at M4-5' MUST render P5/P5' as apex poles, P1-P4 plus P1'-P4' as interleaved base vertices, and P0/P0' as the central axis-point projected through the poles. It must not render "6 vertices = 6 QL positions" or collapse the inverted base into the top square. Sweep psychoid-cymatic-field-engine §7.1 and M4-ARCHITECTURE §5.3.1 to match.

   Verification: visual fixture labels the full 6+6 P/P' mapping; `grep -rn 'dipyramid.*6 vertices\|6 vertices.*QL' Idea/Bimba/Seeds/M/M4' Idea/Bimba/Seeds/M/INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md` returns no live wrong-count attribution.

## Track 19 Cross-Reference — Contemplation Surface

Track 19 is the sibling integration that lands the **agentic-intelligence closure** of the 4/5/0 axis specified in this track. Where Track 08 closes the plugin-composition seam (privacy contracts, deposit-handle handoff, layout claim, dipyramid renderer), Track 19 closes the **contemplation seam** where the kernel-composed `M5_ContemplationObject` carrying the session's lived bioquaternion trajectory is dispatched to a headless PI instance (Nous + Moirai + Sophia/Psyche as relevant), read against the matheme `0/1 = 4+2 = 5→0`, and the LLM-composed wisdom_delta XOR-folds into `quintessence_hash` via `m4_mobius_return`. Three cross-points:

- **T19.7** wires the close path through agentic intelligence — `m5_execute_mobius_return` calls `contemplate_session_close()` before `m4_mobius_return` consumes the wisdom_delta. The personal → pedagogical return (this track's 8.4) carries the contemplation-corrected pattern back through M5 Logos Atelier into M0-5'.
- **T19.6** adds the gateway RPC `contemplate_session_close(ContemplationObject) → wisdom_delta` reading the Q_composed trajectory through S³ against five questions (gauge-trio coverage, 4-charge invariant, geodesic Möbius return, tarot psyche-anchor coherence, four-syntax witness). The recursive-self-review gate (this track's 8.3) routes through this surface when actor is `sophia` / `anima` / `pi` / `aletheia`.
- **T19.9** patches [`INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md`](../../INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md) with the 3-5-7-9 syntax-layer reading (Arch 3 speech, 5 relationship, 7 action, 9 completion) and which constitutional sub-agents carry which contemplation seed.

The canonical integration plan at [`4-5-0-CONTEMPLATION-INTEGRATION-PLAN.md`](../../4-5-0-CONTEMPLATION-INTEGRATION-PLAN.md) holds the full architecture (including alpha-quaternionic threading: `137 = 64 + 72 + 1`, bioquaternion as M4↔M1-2-3 coupling, gauge-trio coherence across physical / symbolic / personal / temporal registers). See [`19-contemplation-surface-integration.md`](19-contemplation-surface-integration.md).
