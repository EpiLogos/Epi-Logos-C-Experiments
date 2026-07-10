# Wave C — Frontend Depth Overview (RERUN — target: pratibimba-app + substrate)

Source of truth for every tranche below: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/20-wave-c-frontend-deep-overview.md` — read the tranche's section IN FULL there before executing; this file carries only retarget + audit posture. Retarget law, resolved decisions, and verification law: `CHARTER.md`. Audit map: [[2026-07-03-cycle-3-recapture-register]] §2 (track 20). Original ledger statuses are CLAIMS about the dead Theia carrier, never truth about this one. Track 00 (verification harness) gates all closure here.

**⚑ Carrier (track 20) — build/verify HERE, never epi-theia:** CARRIER: Wave-C cross-cutting design system (the Track-D source) in pratibimba-app. 'the matheme is the architecture; the widgets are how the matheme shows up to a user.' §2 track 20.

1. **T0 — Absorb and retarget: 20-wave-c-frontend-deep-overview.md (law-only source)**

   Brief: read `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/20-wave-c-frontend-deep-overview.md` IN FULL. It carries binding law/design with no tranche list. Enumerate its unbuilt commitments against the current carrier (register §2 track 20 lists known gaps) as new numbered tranches appended to THIS file, then close this task with the enumeration as evidence.
   Depends on Track 00 Tranche 3.
   Verify: new tranches parse into the ledger (re-run the assess script and show the new task ids); each cites its original section.

---

## Enumerated tranches (T0 output — Wave-C overview-owned commitments)

*Enumerated from the source law (`../2026-06-02-m-prime-cycle-3-design-reconciliation/20-wave-c-frontend-deep-overview.md`, read in full) against [[2026-07-03-cycle-3-recapture-register]] §2 track 20 (`Idea/Bimba/Seeds/M/plans/2026-07-03-cycle-3-recapture-register.md:121-122`). Track 20 is the Wave-C meta-overview: its 192 per-surface tranches are delegated to Tracks 21–32 and are NOT re-enumerated here. These rows capture only the cross-cutting commitments Track 20 itself owns as "the Track-D source" — the wave-C decision set, the cross-cutting design-system manifest, and the wave-C completion/route-ability audit. Substrate/carrier retarget per `CHARTER.md`; each row grounded with a 2026-07-10 grep receipt.*

2. **T20.1 — Land the 36 DR-WC-* decisions into the Track-13 register**

   Brief: source §"Decisions Routed to User Final-Validation (wave-C preview)" (`../2026-06-02-m-prime-cycle-3-design-reconciliation/20-wave-c-frontend-deep-overview.md:93-140`) + §"What changes for the rest of cycle 3" (`:149-153`) in full. The 36 `DR-WC-*` rows (DR-WC-M0-1..M5-3, plus the OP / IS / IP / DL / CC / OB families) are the "decisions first" gate of the wave-C execution sequence (`:73-76`) — no wave-C tranche works an unvalidated decision. Absorb the 36 rows into `13-decision-register.md` from the source table (subject + source-matrix per row), each carrying affected files + recommended resolution + verification command per the existing cycle-3 DR shape. Register-grounded UNBUILT (2026-07-10: only 4 `DR-WC-` refs present in `13-decision-register.md`; 32 of 36 absent). Doc-only canon edit — routes through the register, not a substrate crate; Track 13 is the consuming home.
   Depends on Track 00 Tranche 3.
   Verify: `grep -cE "DR-WC-" Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md` returns ≥36 with all 36 distinct ids present; each row names its source matrix; assess re-index green; verifier ≠ closer.

3. **T20.2 — Wave-C cross-cutting design-system manifest (the Track-D source) on the carrier**

   Brief: source §"Standing invariants honored (carry forward + wave-C additions)" (`../2026-06-02-m-prime-cycle-3-design-reconciliation/20-wave-c-frontend-deep-overview.md:36-50`) + §Master Alignment Matrix (`:52-69`) + register §2 track 20/30 CARRIER (`Idea/Bimba/Seeds/M/plans/2026-07-03-cycle-3-recapture-register.md:113,122`) in full. Land the wave-C cross-cutting design-system manifest — the one index the per-surface tracks 27–32 enforce against — mapping each of the ten widget-layer standing invariants (coordinate-as-primary-nav · profile-tick-as-clock · provenance-always-visible · composition-over-juxtaposition · no-modal · activity-bar · privacy-class-flow-through · tokens-consumed-not-forked · chrome-catalogued · slerp/lemniscate-only-motion) to its enforcing track + lint id (27.0 / 28.17 / 30.10 / 29.6 / 31.8 / 28.2+31.4 / 32.8 / 30.11 / 31.12+31.13 / 15.9+15.5). Carrier work per `CHARTER.md` — the manifest is the pratibimba-app "Track-D source" the token bundle + primitives + lints re-home into (register `:113`). Register-grounded UNBUILT (2026-07-10: 0 wave-c / useProfileTick / consume-not-fork / chrome-contributions-catalog refs under `Body/M/pratibimba-app/src`).
   Depends on Track 00 Tranche 3.
   Verify: manifest artifact lists all ten invariants, each with owning track + enforcement id + a source `:line` citation; no invariant unowned; assess re-index green; verifier ≠ closer.

4. **T20.3 — Wave-C completion-criteria + route-ability audit (Track-14 wave-C extension)**

   Brief: source §"Execution sequence" wave-C completion criteria (`../2026-06-02-m-prime-cycle-3-design-reconciliation/20-wave-c-frontend-deep-overview.md:85-91`) + §"What changes …" Track-14 scope extension (`:152`) in full. Assert the six wave-C completion criteria against the current ledger: every load-bearing UX claim has a matrix row; every CONTRADICTION is a `DR-WC-*`; every CODE-PENDING names its unblocking contract; every UX claim is ALIGNED / has-a-landing-tranche / downgraded-with-reason; the Track-14 no-orphan audit extended to wave-C scope (widget ids, named services, chrome contributions, ledger entries, design tokens, onboarding steps) finds no ownerless surface; and the wave-C set is route-able by `m-dev-plan-assess.mjs`. Emit the exception list to `<plan_folder>/plan.runs/20-wave-c-completion-audit.md`. Extends Track 14's audit; does not re-run the per-surface work.
   Depends on 20.T20.1.
   Verify: audit file carries one row per completion criterion with CLOSED/OPEN + evidence pointer; `node .codex/scripts/m-dev-plan-assess.mjs --write --json` re-indexes all wave-C tranche ids; honesty-lint clean; verifier ≠ closer.
