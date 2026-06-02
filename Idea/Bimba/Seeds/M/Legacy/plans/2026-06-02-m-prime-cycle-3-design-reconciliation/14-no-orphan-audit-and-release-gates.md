# Track 14 — No-Orphan Audit + Release Gates

The cycle-3 closing gate. Cycle 3 does NOT close while any canonical surface, carrier, agent, plugin, profile-field, or doc-claim is ownerless OR routed to an unvalidated decision. This tranche IS the gate.

## Audit Targets

Inherit cycle-2's no-ambient registry (plan 14). Cycle 3 extends with:

- **M' product surfaces** declared in `pratibimba-layouts/src/common/layout-types.ts` `expectedWidgets` — every widget id maps to an owning extension or a code-pending marker (Tranche 11.9 produces `surface-extension-contract-ledger.json`).
- **Ta-onta carriers** (Khora, Hen, Pleroma, Chronos, Anima, Aletheia) — each has `CONTRACT.md` + `extension.ts` (audit: cycle-2 plan 10 verification).
- **Constitutional agents** (anima, eros, logos, mythos, nous, psyche, sophia + DR-B-1 outcome on pi) — each has a `.md` profile (Tranche 12.3 orphan-fill).
- **Aletheia subagents** (Anansi, Moirai, Janus, Mercurius, Agora, Zeithoven) — each has `.md` profile (verified by Wave-B agentic).
- **`MathemeHarmonicProfile` fields** — every spec-required field maps to ALIGNED / VALIDATED-decision / code-pending tranche (Tranche 10 readiness ledger).
- **Integration plugins** (`plugin-integrated-1-2-3`, `plugin-integrated-4-5-0`) — each owns its composition contract (Tranches 07, 08).
- **UX doc load-bearing claims** — every claim has a row in a four-way matrix (Tranches 01-06 matrix files) with status ALIGNED / DOC-AHEAD landing tranche / SPEC-AHEAD integration tranche / CODE-PENDING closure / CONTRADICTION decision-register entry / ORPHAN no-orphan-fill tranche.

## Open Orphans Routed Through Cycle 3

| Orphan | Surface / claim | Owner-assignment route |
|---|---|---|
| **M0-X' four layers** | M0-1' QL-structure, M0-3' time/community, M0-4' personal, M0-5' pedagogy declared in UX §3 — m0-anuttara has three views only | Tranche **01.1** (extend m0-inspector + bridged routes into m4/m5) + **09.1** (per-layer routing model) |
| **Image-assets-on-nodes** | UX §6 asset handles; no `c_1_asset` property in schema | Tranches **01.6** + **09.3** |
| **F_routing carrier** | M2 chained traversal: planetary-hour → active-decan → Shem-pair → maqam → mantra → 72-state → DET → emissions; no function in portal-core | Tranche **03.2** (`Body/S/S0/portal-core/src/parashakti/f_routing.rs`) |
| **S2 graph-correspondence Theia adapter** | parashakti-deep dataset has 271 typed relations; no bridge method | Tranche **03.4** (`s2.parashaktiCorrespondences`) + **09.5** |
| **Nara voice adapter / QLoRA dialogic-voice carrier** | UX §3 + M4'-SPEC §7.12 + m5-prime-epii-on-nara-qlora — no carrier object | Cross-reference to **Tranche 12.1** parity audit; if Anima does not claim, escalate to user final-validation |
| **Psychoid cymatic field renderer surface** | Diamond-QL Vitruvian geometry, Hopf-linked tori, lens-ring backdrop | Tranche **05.5** (m4-nara extension first-build allowed: M' product surface) |
| **`anuttara_trace(output, sensitivity, depth)` API** | UX §2.3 named; no carrier | Tranche **06.6** (referred to M0 substrate owner; escalate to user final-validation if unclaimed) |
| **Logos Atelier (M5-5) Theia extension** | Spec-canonical M5-5 surface with no Body/S/S5 dedicated core and no Theia extension | Tranche **06.2** (`logos-atelier` extension over Aletheia + epi-gnostic) |
| **Constitutional-agent profiles (nous, logos, eros, mythos, psyche, sophia)** | Only `anima.md` visible at `Body/S/S4/pi-agent/agents/` | Tranche **12.3** orphan-fill |
| **Daily-layer widgets (`pratibimba.daily.{journal, agent-checkin, cymatic-placeholder, status-display}`)** | Declared in `layout-types.ts:52-58`; no confirmed extension owner | Tranche **11.3** owner-trace + closure |
| **TillDone substrate residency** | `capability-matrix execution_backbone.body_path` declares `Body/S/S4/ta-onta/pleroma/S2/tilldone.ts`; existence audit needed | Tranche **12.11** |
| **`MathemeHarmonicProfileBoundary.payload` opacity** | Intentional opacity at `profile.ts:9-11`; per-extension narrowing is each Mn's responsibility | Tranche **10.1** records the policy (intentional ORPHAN — no work) |
| **ACR extension repurpose** | Per DR-M5-1, `agentic-control-room` substrate is tangent-development drift; needs repurpose as Pi-runtime monitoring surface OR deprecation; `constitutional_agents[]` array audit required | Tranche **12.14** (NEW) + **12.3** (constitutional_agents disposition) |
| **K² played-torus 3D extension** | DR-M1-2 ratified: full Bevy/wgpu extension required; no current owner | Tranche **02.6** (first-build allowed: M' product surface) |

## Decision-Register Gate

The cycle does not close until ALL of the following are **VALIDATED** in `13-decision-register.md`:

- DR-M0-1, DR-M0-2, DR-M0-3
- DR-M1-1, DR-M1-2
- DR-M2-1, DR-M2-2 (DR-M2-1 consolidates into DR-KB-1)
- DR-M3-1, DR-M3-2, DR-M3-3
- DR-M4-1, DR-M4-2 (all five clauses)
- DR-M5-1 (consolidates DR-B-1), DR-M5-2 (sibling of DR-M1-1; corpus-wide sweep)
- DR-B-2, DR-B-3
- DR-KB-1, DR-KB-2
- DR-TS-1
- DR-IG-1

## Release Gates

Cycle 3 is **route-able for m-dev** when:

1. **G1 — Overview routed.** `node .codex/scripts/m-dev-plan-assess.mjs --reset --write --json --require-now <plan_folder>` returns clean ledger with all 16 tranches indexed (00-overview plus 01-15).
2. **G2 — Every matrix file present.** `for f in plan.runs/wave-{a-m{0,1,2,3,4,5},b-{kernel-bridge,theia-shell,agentic-layer,integrated-bimba}}-{reconciliation-,}matrix.md; do test -f "$f"; done` returns clean.
3. **G3 — Every load-bearing UX claim classified.** Per-subsystem matrix files account for every claim in each UX doc; orphan rows above route to a tranche.
4. **G4 — Every CONTRADICTION has a decision row.** Tranche 13 has 20+ rows covering every CONTRADICTION surfaced by Wave A or Wave B.
5. **G5 — Every CODE-PENDING has a closing tranche.** Tranches 10.x for profile-spine; per-subsystem tranches for domain-pending; Tranche 12 for agentic-layer pending; Tranche 09 for graph-substrate pending. No silent pending markers.
6. **G6 — Anti-greenfield posture verified.** No tranche touching `Body/S/S0`-`S5`, `Idea/Pratibimba/System`, or `Body/M/epi-tauri` is phrased as first-build except for explicitly allowed M' product surfaces (Logos Atelier, Canon Studio, Backend Studio, psychoid renderer, F_routing carrier, M1 played-K²-torus Bevy/wgpu extension per DR-M1-2, repurposed OmniPanel runtime per Tranche 15.2, daily-layer widgets if Tranche 11.3 chooses build-path).

7. **G7 — UI foundation principles registered.** Tranche 15.1 has authored `ui-foundation-principles.md`; every extension contributing to a shell slot references it. (See Tranche 15 release gates.)

8. **G8 — Visual-regression baselines committed.** Tranche 15.12 has produced frame-by-frame baselines for the lemniscate transition and tick choreography.
7. **G7 — Decision validation pre-condition.** Tranches depending on a DR-row must declare it in their `Depends:` / cross-link line. No tranche begins work on an unvalidated decision.

## Verification Commands

```bash
# G1
node .codex/scripts/m-dev-plan-assess.mjs --reset --write --json \
  Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation

# G2
for f in plan.runs/wave-a-m{0,1,2,3,4,5}-reconciliation-matrix.md \
         plan.runs/wave-b-{kernel-bridge,theia-shell,agentic-layer,integrated-bimba}-matrix.md; do
  test -f "Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/$f" \
    && echo "OK  $f" || echo "MISSING  $f"
done

# G4 (decision row count)
grep -c "^## DR-" Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md

# G6 (anti-greenfield smell-test)
grep -rn "greenfield\|rebuild\|first-build" \
  Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/0*.md \
  Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/1*.md
# Any "first-build" hit must be in the allow-list of M' product surfaces above.
```

## Closing the Cycle

When all gates pass and every DR-row is VALIDATED, the cycle-3 plan set is ready for `/m-dev` execution. Tranches execute in the dependency order named in `00-overview-and-design-reconciliation.md §Execution Sequence`:

```
Decisions (13)
  → Profile-spine (10)
    → Per-domain (01-06, parallel where decisions permit)
      → Integrated composition (07, 08, 09)
        → Shell + agentic closure (11, 12)
          → No-orphan audit re-run (14)
            → cycle-3 closed; cycle-4 inherits substrate
```
