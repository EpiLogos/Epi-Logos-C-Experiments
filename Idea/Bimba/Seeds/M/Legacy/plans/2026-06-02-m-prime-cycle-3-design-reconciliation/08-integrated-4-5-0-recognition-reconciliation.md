# Track 08 — Integrated 4-5-0 Recognition Reconciliation

Reconciles the integrated `4-5-0` recognition plugin across the four corpora. This plugin composes [[M4']] + [[M5']] + [[M0']] through the kernel-bridge profile-tick + Nara protected-local handles — the personal stratum of *Jiva-is-Śiva* recognition. The plugin package is landed; cycle-3 work is the privacy-class composition contract, the M4 deposit-handle handoff (from M2 F_routing), and the M0' deep-link return for pedagogical anchoring. Anti-greenfield throughout.

## Source Specs and Matrix

- Canonical: `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md` (shell-1 personal 4-5-0 + flow-writing invariant), `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md` (recognition / Jiva-is-Śiva surface)
- Companions: M4'/M5'/M0' specs, `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-2-canonical/09-integrated-4-5-0-recognition-plugin.md` (cycle-2 owner)
- Cross-references: Wave-A M4 (Tranches 05.1, 05.3, 05.5, 05.8, 05.9), M5 (Tranches 06.2, 06.3), M0 (Tranches 01.1, 01.5, 01.6); Wave-B agentic-layer (Tranche 12.4 recursive-self-review gate)

## Cycle 2 Substrate Inheritance

Consume as-is — `Body/M/epi-theia/extensions/plugin-integrated-4-5-0` package; `@pratibimba/integrated-composition` shared `LayoutClaim`; `08-t0-composition-contract-preflight`. Cycle 2 Track 09 named the plugin; cycle 3 closes its privacy-first composition seam and the M4→M0 pedagogical return.

## Tranches

1. **8.1 — Privacy-first composition contract (no raw bodies cross plugin)** *(spec-ahead-integration)*

   Composition contract asserts: M4 `ProtectedPersonalFieldInput` (`qIdentity`/`qTransit`/`qActivity`/`qComposed`) MUST cross to M5 review surfaces only as **opaque handles** with provenance-state — never raw quaternions, never audio_octet bodies. Cross-link to M4 Tranche 05.5 psychoid-cymatic renderer-handle invariant.

   Verification: `pnpm --filter @pratibimba/plugin-integrated-4-5-0 test`; contract test asserts plugin rejects raw `q_personal` payload at composition boundary.

2. **8.2 — M2 → M4 deposit-handle reception** *(spec-ahead-integration; depends on Tranche 03.8)*

   Plugin receives the M4' deposit handle emitted by M2 F_routing (Tranche 03.2 → 03.8) and routes it into Nara journal via `nara_journal::deposit`. Privacy-class verified at handoff.

   Verification: integration test M4' journal receives the handle on synthetic F_routing trace; `grep -n 'deposit_handle' Body/M/epi-theia/extensions/plugin-integrated-4-5-0/src/`.

3. **8.3 — M5 recursive-self-review gate consumption** *(spec-ahead-integration; cross-link to Tranche 12.4)*

   Plugin surfaces identity-augment proposals (Tranche 05.9) through M5 review widget; ACR `enforceHumanGate` extended with `recursiveSelfReview` flag per Tranche 12.4 must gate `applied` verdict on user final-validation when actor is `sophia`/`anima`/`pi`/`aletheia`.

   Verification: ACR contract test (`agentic-control-room/tests`) asserts `enforceHumanGate({decision:'approve', humanRequired:false, actorIsHuman:false, recursiveSelfReview:true, actor:'sophia'}).ok === false`; plugin integration test routes proposals through this gate.

4. **8.4 — M5 → M0 pedagogical return (Möbius write-back)** *(doc-ahead-landing; cross-link to Tranches 06.2, 01.1)*

   Plugin owns the personal → pedagogical return path: recognized patterns crystallize through Logos Atelier (Tranche 06.2) into M0' M0-5' pedagogy layer (Tranche 01.1 M0-5' bridged route). No canon mutation — read-only contemplative offering anchored to M0 nodes.

   Verification: integration test asserts pedagogical return surfaces in M0-5' deep-link without mutating canon; `grep -n 'pedagogy\|atelier-return' Body/M/epi-theia/extensions/plugin-integrated-4-5-0/src/`.

5. **8.5 — Plugin layout claim against shell-1 (personal) decision** *(spec-ahead-integration; cross-link to Tranche 11.1 DR-TS-1)*

   Plugin's `LayoutClaim` for shell-1 personal + flow-writing surface must match the DR-TS-1 resolution. If DR-TS-1 ratifies daily-0-1 intra-layout toggle, plugin's contribution must declare its `availableInLayouts` cleanly. No build until DR-TS-1 ratified.

   Verification: `pnpm --filter @pratibimba/plugin-integrated-4-5-0 test` asserts layout-claim against ratified shell shape; OMNIPANEL_TABS cross-layout availability honored.

6. **8.6 — 0/1 cymatic polarity consumer** *(spec-ahead-integration; cross-link to Tranche 05.7 DR-M4-2)*

   Plugin consumes the personal-cymatic 0/1 polarity decision from DR-M4-2 (clause 5: psychoid-engine 1-side personal / 0-side cosmic vs m5-prime-system-shape 0-side personal). Wire the chosen polarity through `MathemeHarmonicProfile.audio_octet` rendering boundary.

   Verification: DR-M4-2 clause 5 ratified; widget render-test asserts polarity matches ratified canon; `grep -n 'cymatic_polarity\|psychoid_polarity' Body/M/epi-theia/extensions/plugin-integrated-4-5-0/src/`.
