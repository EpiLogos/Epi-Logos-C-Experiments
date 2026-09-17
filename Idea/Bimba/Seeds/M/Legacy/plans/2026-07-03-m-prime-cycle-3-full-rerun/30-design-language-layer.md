# Track 30 — Design Language Layer (RERUN — target: pratibimba-app + substrate)

Source of truth for every tranche below: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md` — read the tranche's section IN FULL there before executing; this file carries only retarget + audit posture. Retarget law, resolved decisions, and verification law: `CHARTER.md`. Audit map: [[2026-07-03-cycle-3-recapture-register]] §2 (track 30). Original ledger statuses are CLAIMS about the dead Theia carrier, never truth about this one. Track 00 (verification harness) gates all closure here.

**⚑ Carrier (track 30) — build/verify HERE, never epi-theia:** CARRIER: the ENTIRE design-token bundle + 15-primitive shelf + consumption lint, re-homed to CSS vars/TS for React/Tauri. Token law = 30.8 derivation-backed tiers; motion = ratified DR-UI-4 (400/240/320). DR-WC-DL-1 (family palette) still open — re-decide for carrier. §2 track 30.

1. **T30.1 — Typography scale contract**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md` — Tranche 30.1 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: done — verify or rebuild; never build on it unverified.
   Depends on Track 00 Tranche 3.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

2. **T30.2 — Coordinate-derived chromatic system**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md` — Tranche 30.2 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

3. **T30.3 — Motion grammar**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md` — Tranche 30.3 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

4. **T30.4 — Light/dark theme mapping**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md` — Tranche 30.4 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

5. **T30.5 — Accessibility contracts**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md` — Tranche 30.5 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: quarantine — verify or rebuild; never build on it unverified. REBUILT from the spec against the live carrier; nothing was inherited from the quarantined claim.
   Landed (rerun, 2026-07-27) — the contract as EXECUTABLE law, not prose. Carrier retarget of the frozen `extensions/contracts/ui-accessibility.{ts,md}`: `Body/M/pratibimba-app/src/ui/accessibility.ts` (executable half) + `ACCESSIBILITY-CONTRACT.md` (prose half), 28 tests in `src/ui/accessibility.test.ts`.
   - **Focus ring**: `FOCUS_RING_MIN_PX` = 2. Named gap, disclosed not restyled: `.face-toggle-button` / `.m0-coordinate-summary-card-open` / `.m4-nara-floating-menu button` express focus as a 1px `border-color` swap with `outline: none` — a real indicator but below the minimum. Those surfaces belong to 15.10 / 21.T21.17 / 25.x; a focus sweep is their owners' visual change to make.
   - **Reduced motion (DR-WC-DL-4)**: `MOTION_KIND` classifies each channel continuous vs discrete and `reducedMotionDurationMs()` resolves it — continuous stops (0ms), discrete is PRESERVED as a `REDUCED_MOTION_SNAP_MS` (100ms) snap because removing it would remove the state-change semantics; layout switch is the one canon makes instantaneous.
   - **Screen reader**: `coordinateAriaLabel` speaks coordinate + family tier + archetype (`M4-3` → "M4 dash 3, subsystem family, nara") reusing `ui/coordinateNames.ts` as the naming authority, now wired into the `CoordinateString` primitive; `cl42SignatureAriaLabel`; `createTickAnnouncer` rate-limits the `aria-live` region to one announcement per second (the heartbeat pulses at 1Hz). `CodonString` already met the contract — it reads the real gateway codon lookup.
   - **BOUNDED, not invented** (same discipline as 28.T28.4's frontmatter key-shape law): `HexagramString`'s name component needs I-Ching hexagram NAMES = M3 kernel law, and `SymbolicCoordinateString`'s decomposition needs the verifier-authored M0/Anuttara grammar. Neither has a carrier-reachable surface, and a 64-entry name table in `src/ui/` would put kernel law in M'. Each primitive announces what it can verify instead of a name it guessed; the fix shape is a read method, which `CodonString` already demonstrates.
   - **Contrast**: `WCAG_AA` (4.5 body / 3 large / 3 UI) + a real sRGB `contrastRatio()` proven against WCAG's published extremes (black-on-white = 21:1) and asserted green over BOTH shipped themes' ink/ground pairs. An unparseable colour (a `var(--…)` reference) returns null and `meetsContrast` fails it — a pair that cannot be asserted must never read as one that passed. The lint enumerating every declared pair stays 30.11's (`lint-carrier-tokens`); this contract supplies the threshold and the ratio function.
   - **Keybindings**: `A11Y_KEYBINDINGS` declares space / shift-left / shift-right; registration + scrub transport belong to the tick-choreography owner.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output. UF proof: `tests/e2e/accessibility-contract.spec.ts` — real Chromium with `prefers-reduced-motion` emulated both ways, asserting the discrete transition survives at exactly the contract's snap and the face still inverts, and that the unreduced path runs longer.

6. **T30.6 — Empty / loading / pending / blocked state grammar**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md` — Tranche 30.6 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

7. **T30.7 — Highlight category register canonical set**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md` — Tranche 30.7 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: quarantine — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

8. **T30.8 — Family-letter palette derivation**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md` — Tranche 30.8 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

9. **T30.9 — Iconography system**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md` — Tranche 30.9 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

10. **T30.10 — Provenance / coordinate-string / state design primitives canonical land**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md` — Tranche 30.10 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: quarantine — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

11. **T30.11 — Design tokens emission and consume-not-fork lint**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md` — Tranche 30.11 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

12. **T30.12 — Composition design rules**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md` — Tranche 30.12 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: audit_required — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

13. **T30.13 — Coordinate-string rendering convention**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md` — Tranche 30.13 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: quarantine — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.

14. **T30.14 — Visual regression baseline catalog**

   Brief: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md` — Tranche 30.14 in full (that section IS the spec; owning Mn'/Sn specs are law above it). Retarget per `CHARTER.md` (substrate work unchanged; Theia surfaces → carrier panes/engine carriers; epi-theia frozen).
   Original ledger status: quarantine — verify or rebuild; never build on it unverified.
   Verify: real behavioral/live-wire proof per Track 00 (verify-all green, honesty-lint clean; bus/gateway claims via live-wire harness); verifier ≠ closer; evidence = fresh command output.
