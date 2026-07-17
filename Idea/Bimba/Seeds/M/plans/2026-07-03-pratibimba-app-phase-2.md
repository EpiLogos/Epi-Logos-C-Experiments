---
coordinate: "M'"
status: "superseded"
created: "2026-07-03"
superseded_by: "[[2026-07-03-m-prime-cycle-3-full-rerun]]"
depends_on:
  - "[[2026-07-03-cycle-3-recapture-register]]"
  - "[[2026-07-02-pratibimba-app-phase-1]]"
  - "[[M'-SURFACE-REENVISIONING-2026-07-01]]"
  - "[[SEED-HARMONISATION-PROTOCOL]]"
---

# Pratibimba App — Phase 2: Recapture, Design Language, Deep Integration

> **SUPERSEDED (2026-07-03, Architect correction):** curating tracks was the wrong shape — the WHOLE of cycle 3 is the target. The active plan set is `Idea/Bimba/Seeds/M/Legacy/plans/2026-07-03-m-prime-cycle-3-full-rerun/` (586 tasks: every original tranche retargeted at the carrier, gated behind the Track-00 verification harness). This file's Track D folded into rerun tracks 30/31/32/15; Track I into 37/36/35/07/23/24/33; Track R into Track 00 + the recapture register. Kept as feeder material only.

**VAK Topology:** CPF=(0/1) | CT=CT1,CT3 | CP=4.2 | CF=(4.0/1-4.4/5) -> Anima | CFP=CFP2 | CS=Day

Three interleaved tracks over one carrier. The [[2026-07-03-cycle-3-recapture-register]] is this plan's evidence base — every task cites its plan-file/DR authority there. **Binding protocol: identical to [[2026-07-02-pratibimba-app-phase-1]]** (verifier ≠ closer · behavioral proof only · gates are drivable loops · cited decisions quoted and VALIDATED · recon-before-build on every gateway/kernel surface · done status is a CLAIM until independently verified). Status markers: `[ ]` pending · `[~]` implemented-unverified · `[x]` verified.

**Sequencing law:** D0–D2 (token system) gate all new *surface* work; Track I continues the Sprint-8 engine arc and is not blocked by D; Track R verification runs continuously and gates anything that *builds on* a cycle-3 claim.

---

## Track D — Design Language for the Carrier

The substance exists (Track 30/31/32/15 + UI-PATTERNS, recaptured in the register §2); it was never unified or landed. Phase-1 shipped ad-hoc violet-temple tokens + the engraved-ephemeris direction (E5). This track makes ONE token law before more surfaces exist.

- [ ] **D0 Design brief (Architect eyes-gate).** A visual design-direction brief: (a) agentic-app layout grammar survey (Linear/Raycast/Cursor-class conventions mapped onto the carrier's existing rails: six-entry strip, `/` pull-out, palette, panes); (b) the Track-30 token system rendered as swatches/scales against the current engraved-atlas direction; (c) the DR-WC-DL-1 palette decision presented as concrete alternatives (30.8 derivation tiers vs UI-PATTERNS flat hues vs current element-chroma-only). Gate: Architect picks the palette law + layout register. *(Register §3.3)*
- [ ] **D1 Token bundle.** `src/ui/tokens.ts` + CSS custom properties (`--epilogos-*`), W3C token format with derivation citations: the 11 colour sub-namespaces (exact hex per register §2/30 where minted; family-36/elevation/mode-chip minted per D0 decision), typography scale (incl. `mono.coordinate` family-tinted, `mono.codon`, `mono.hexagram`, `matheme`), motion tokens per ratified DR-UI-4 (0/1 400ms cubic-out · Klein 240ms linear · Möbius 320ms smoothstep; `profile-tick.duration` READ from the bus, never a constant), spacing/bento. Polarity-preservation invariant tested (cool stays cool across theme inversion). Existing styles.css migrated.
- [ ] **D2 Primitive shelf.** `src/ui/primitives/`: `ProvenanceBadge` (7-state per DR-UI-3), readiness chip (9-id + 5 UX flavours via `flavourOf()` reducer), `PendingBadge`/`BlockedOverlay`, the lemniscate transition (one Bernoulli shader, three configs), engraved-chip + coordinate-string components tokenized. Behavioral tests per primitive.
- [ ] **D3 Consumption lint.** `scripts/lint-design-tokens.mjs`: forbid raw hex / hardcoded font-size / hardcoded durations / `setTimeout|setInterval|requestAnimationFrame` outside tokens+primitives+engine (the engine's single rAF is the sanctioned exception). Wire into `pnpm test`.
- [ ] **D4 Layout grammar.** Chord registry through the command system (cmd-period face · cmd-shift-{0..5} subsystem reveals · cmd-1..8 membrane folds as they land); slot policy (left rail reserved for coordinate tree; right exclusive to `/`; no three-pane juxtaposition in main); cold-start six-stage non-modal splash + per-surface empty-state copy (32's canon lines); breadcrumb law family→archetype→position. *(31/32 law, register §2)*
- [ ] **D5 GATE (Architect, observed):** the app restyled under the token law — one chromatic system, one motion grammar, provenance inline everywhere — with the lint green. Spec write-backs: a carrier design-language foothold in [[M'-SYSTEM-SPEC]]; DR-WC-DL-1 resolution recorded in the register; [[THEIA-UI-PATTERNS-ARCHITECTURE]] §1.3 conflict noted superseded.

## Track I — Deep Integration (the engine keeps being an engine)

Continues the Sprint-8 arc. Every task: recon the kernel/gateway surface first; renderer never computes law; live-wire proof required.

- [ ] **I1 S5.5b + playable-84.** On the Architect's (a)/(b) decision: land the lens-mode surface (recommended (a): `profileAtLensMode` projection over `vimarsha_read_profile`), then E7's playable half — audition a chosen (lens,mode) against the tick's, with the 84-state landscape navigable. *(Phase-1 carry)*
- [x] **I2 Aperture cardinality reconciliation.** User correction 2026-07-15 retains the landed 16 divisions plus separately-carried Fibonacci Ground. Zod continues to reject row 16; engine cycling remains 16-fold; the proposed no-frame Operator row and 18-stack are withdrawn as parallel topology. *(Register §3.2 closed.)*
- [ ] **I3 Epogdoon bridge.** Verify/land `kernelBridge.m2.epogdoonProjection` end-to-end (37.1; capability parity across Rust/Zod/app — the standing S6.3 open); mark the 9 evolutionary fold-points on the wheel; descent readout 72→64→56 with the 8 RES-matrix gaps (23.18 law).
- [ ] **I4 MonoPoly cymatics.** `m2.cymaticMonoPolyState` (37.3) recon→land→consume: the shader's behaviour state (mono / actually-many / actualising-one WARNING / monopoly bloom) becomes kernel-classified, never renderer-inferred; shared `MonoPolyState` enum with the future M0 surface.
- [ ] **I5 Elemental + aspect projections.** Verify the 2026-06-28 kernel landings of `lensOrbiterRelations` (37.9) + land `planetaryElementalWeights` (37.2) consumption: planet↔aperture aspect edges rendered in the atlas; four-element weights feed (PASU handoff stays downstream/protected).
- [ ] **I6 Transcription totality.** `m3.bioquaternionTranscription` (37.11) + the transcription-engine surface (24.20 law, consuming `lensCodonBinary` 37.8 — verify its ratified kernel landing): degree → codon → charges(pp/nn/np/pn) → quaternion → element(canonical-B) → amino → hexagram → tarot as ONE typed object; charge-identity asserts (`pp+nn+np+pn=4X`, sum(pp)=360) on the wire.
- [ ] **I7 Kernel charge authority fix.** The register §5.1 violation: route `oracle.rs` charges through `m3_compute_charges` FFI with boot asserts; retire the Rust reimplementation. *(Kernel-side; gates I6 honesty)*
- [ ] **I8 VAK traces.** Gated on DR-VAK-4/5/6 ratification: `AnuttaraPentadicRuntimeTrace` + `VakLanguificationTrace` (36.1/36.8) as additive profile projections; carrier consumes as a pentadic inspector + vakLevel/m0Address strip chips. **This is where "deep VAK kernel updates are really captured" becomes live-wire fact.**
- [ ] **I9 KairosFrame triple.** Natal/realtime/kairotic discriminated frame + 4h kairotic decay (35 law) through gateway→app; natal-Sun gold ring vs live-Sun silver dot on the Fibonacci ring; cardinal-zero + zodiacal-five anchors.
- [ ] **I10 4-5-0 recognition engine (S6.5 carried).** Read [[INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE]] gates; dipyramid with corrected DR-IG-6 geometry (P5/P5' apices · interleaved P1-4/P1'-4' · P0/P0' axis-point) + Hopf-linked tori; E₄/E₅/E₆ readout as its energy face (33 law; requires the kernel energy restructure — verify first); privacy scrubber (DR-M4-4 regexes) at the bridge edge before any personal field renders.
- [ ] **I11 Chime coherence gate.** 49.6: block the bell strike when M1/M2/M3 generations/tick/degree720/m2Address72/world-clock disagree; readiness strip shows the incoherence honestly.
- [ ] **I12 GATE (Architect, observed + live wire):** the engine under modulation with the new strata — fold-points marked, MonoPoly state classifying, transcription object inspectable, traces flowing — every datum provably kernel-sourced (`source:'kernel'` law extended to the new frames).

## Track R — Recapture Verification + Structural Carry

The audit discipline: nothing builds on a cycle-3 claim until verified. Runs continuously; ordered by register §4.

- [ ] **R1 Gateway method audit.** One recon pass: every method family the register names (s5'.gnostic.* / s1'.entity.* / s5'.tune.* / s5'.canon_update.* / m4.arena.* / s2.graph.{gds,promotion,list_by_filter} / s0'.verifier.* / s0'.settings.*) grepped against `dispatch.rs`/gateway-contract — one existence table, recorded here. (The Sprint-4 verifier already corrected three wrong absence-claims; assume nothing.)
- [ ] **R2 Kernel spot-audit.** Register §4.7 list: charges FFI callers · element converters (37.10) · DR-R0 route words · transcription constants · `m1_ananda_get` CSV fidelity · `kernel_energy_evaluate` E₄. Each: run the named check, record output, file the fix task if red.
- [ ] **R3 Block contract, natively.** Re-derive Track 44's Block law for React/Tauri spec-first: `Block{id,type,ctx,coordinate?,privacyClass,provenance,data,affordances}` + registry + catalog handshake + block-doc persistence in Present scope; verdict/annotate loop deferred to the review/mediation seam. *(Largest structural carry; gates M4/M5 lived-surface depth)*
- [ ] **R4 Membrane growth.** `/` pull-out grows toward the 8-fold law (27): dispatch-trace + tool-stream next (they ride existing observability events), then evidence/review (needs R3), gateway/diagnostics (capability + readiness data already flowing); slash-verb grammar in the chat pane.
- [ ] **R5 Bases pane.** Coordinate-keyed query-view (48 §13.D API) over `s2.graph.query`/`list_by_filter` (per R1 finding), table/cards modes, rows publish to the coordinate store; doubles as the CU-ledger review surface.
- [ ] **R6 Carrier hygiene.** Coordinate headers on pratibimba-app named units (43.2 convention); a forbidden-imports row for the carrier; the design lint (D3) joined to it. **Git safety: commit `Body/M/pratibimba-app/` as a tracked baseline (Architect call), dispose the ~30 modified files in the frozen epi-theia + epi-cli.**
- [ ] **R7 No-orphan registry.** Phase-2's own Track-14: every carrier surface → owner + gateway/CLI seam + spec authority; orphans surface to the Architect, never silently absorbed.

## Architect Decision Queue

Register §3, in one place: **S5.5b** (recommend a) · **aperture-17 confirm** · **palette law (D0)** · **planet: address** · **batch-DR posture** (recommend: substance stands, implementations re-verify) · **DR-VAK-4/5/6 + DR-M3-TRANSCRIPT-1 + DR-ENTITY-CODON-1 + DR-TUNE-1..4 ratifications** · **roster mis-count canon correction** (CLAUDE.md/S4-SPEC) · **pratibimba-app git baseline** · carried gates (E5 eyes, S6.4/S5.4).

## Out of scope for Phase 2 (do not drift into)

Vama-Shakti arena UI (until Track-41 substrate verifies); tunability UI (until DR-TUNE ratifies); model-slot/MoE dispatch surfaces; Graphiti UI; WebGPU rewrites of working three.js strata; any epi-theia modification (frozen reference only); canon writes outside the CU-ledger/Hen law.
