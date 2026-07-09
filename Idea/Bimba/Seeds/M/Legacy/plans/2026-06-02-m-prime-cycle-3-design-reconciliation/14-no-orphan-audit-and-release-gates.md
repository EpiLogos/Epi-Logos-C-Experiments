# Track 14 — No-Orphan Audit + Release Gates

<!-- carrier-retarget-banner v1 -->
> ⚑ **RETARGET — cycle-3 full rerun.** This file is the design-recon **SOURCE** (the tranche brief the rerun stubs send you to). Every `Body/M/epi-theia/…` path below is **FROZEN reference only**. **Build / verify target = `Body/M/pratibimba-app`** (the carrier) **+ substrate crates** (`epi-lib` / `portal-core` / `epi-cli` / `graph-*` / gateway — these carry unchanged). Any Verify line that names `epi-theia` (e.g. `cd Body/M/epi-theia && pnpm --filter …build`) is **retargeted**: run the **pratibimba-app carrier equivalent** (or the substrate crate's own runner), **never** the epi-theia build. Law: [`CHARTER.md`](../2026-07-03-m-prime-cycle-3-full-rerun/CHARTER.md) §13–18 · single-source map [`carrier-contract.json`](../2026-07-03-m-prime-cycle-3-full-rerun/carrier-contract.json) · per-track CARRIER: [recapture register](../../../plans/2026-07-03-cycle-3-recapture-register.md) §2.


The cycle-3 closing gate. Cycle 3 does NOT close while any canonical surface, carrier, agent, plugin, profile-field, or doc-claim is ownerless OR routed to an unvalidated decision. This tranche IS the gate.

## Audit Targets

Inherit cycle-2's no-ambient registry (plan 14). Cycle 3 extends with:

- **M' product surfaces** declared in `pratibimba-layouts/src/common/layout-types.ts` `expectedWidgets` — every widget id maps to an owning extension or a code-pending marker (Tranche 11.9 produces `surface-extension-contract-ledger.json`).
- **Ta-onta carriers** (Khora, Hen, Pleroma, Chronos, Anima, Aletheia) — each has `CONTRACT.md` + `extension.ts` (audit: cycle-2 plan 10 verification).
- **Constitutional agents** (anima, eros, logos, mythos, nous, psyche, sophia + DR-B-1 outcome on pi) — each has a `.md` profile (Tranche 12.3 orphan-fill).
- **Aletheia subagent roster — 6 techne-guardians per DR-S4-TECHNE (cleanup 2026-06-03):**
  - 6 CF-coded Aletheia subagent techne-guardians — Anansi (CF0, guards coordinate-mapping techne), Janus (CF1, guards temporal-structure techne), Moirai (CF2, guards GraphRAG-distillation techne), Mercurius (CF3, guards Kairos-signal techne), Agora (CF4, guards skill-index techne), Zeithoven (CF5, guards creative-advance techne) — each has `.md` profile at `Body/S/S4/ta-onta/S4-5p-aletheia/S5'/agents/` (verified by Wave-B agentic + filesystem `ls`).
  - **Techne is NOT an agent** (per DR-S4-TECHNE ratification 2026-06-03). The S4 canon §14-Agent Roster mis-classification is corrected: Techne is **Pleroma's atomic-skills substrate** (Pleroma's second face alongside VAK), not a 7th Aletheia member. No `Techne-profile file` profile lands. The "Techne orphan" surfaced earlier is RESOLVED — Techne moves to Pleroma's CONTRACT.md §Techne section.
  - Aletheia-the-carrier (S4-5') hosts the crystallisation mode; Anima dispatches the 6 techne-guardians within it.
- **`MathemeHarmonicProfile` fields** — every spec-required field maps to ALIGNED / VALIDATED-decision / code-pending tranche (Tranche 10 readiness ledger).
- **Integration plugins** (`plugin-integrated-1-2-3`, `plugin-integrated-4-5-0`) — each owns its composition contract (Tranches 07, 08).
- **UX doc load-bearing claims** — every claim has a row in a four-way matrix (Tranches 01-06 matrix files) with status ALIGNED / DOC-AHEAD landing tranche / SPEC-AHEAD integration tranche / CODE-PENDING closure / CONTRADICTION decision-register entry / ORPHAN no-orphan-fill tranche.

## Closed Canonical Profile Fields

| Profile field | Canonical trace claims | Producer | Inspection / composition / recognition owners | Grounding witness | Routeability status |
|---|---|---|---|---|---|
| **`anuttara_pentadic_trace`** | `0/1->5`, paired Mahamaya `15 + 15`, `24x15=360`, `72*5=360`, and `360+24=384` line-change relation | `portal-core` / kernel bridge via **10.P5** + **36.1-36.2** | Physics/computation inspector: M3 Mahamaya (**36.3** / **24.18**); cosmic composition consumer: integrated 1-2-3 (**36.4** / **29.15**); personal recognition consumer: integrated 4-5-0 + M4/M5 (**36.5** / **25/26**); learning-loop consumer: M5 Epii (**36.6**) | M0 Anuttara grounding witness | **CLOSED by 36.7** — no orphan row remains for `0/1->5`, paired 15s, `24x15=360`, or the pentadic runtime trace. |

## Open Orphans Routed Through Cycle 3

| Orphan | Surface / claim | Owner-assignment route |
|---|---|---|
| **M0-X' four layers** | M0-1' QL-structure, M0-3' time/community, M0-4' personal, M0-5' pedagogy declared in UX §3 — m0-anuttara has three views only | Tranche **01.1** (extend m0-inspector + bridged routes into m4/m5) + **09.1** (per-layer routing model) |
| **Image-assets-on-nodes** | UX §6 asset handles; no `c_1_asset` property in schema | Tranches **01.6** + **09.3** |
| **F_routing carrier** | M2 chained traversal: planetary-hour → active-decan → Shem-pair → maqam → mantra → 72-state → DET → emissions; no function in portal-core | Tranche **03.2** (`Body/S/S0/portal-core/src/parashakti/f_routing.rs`) |
| **S2 graph-correspondence Theia adapter** | parashakti-deep dataset has 271 typed relations; no bridge method | Tranche **03.4** (`s2.parashaktiCorrespondences`) + **09.5** |
| **Nara voice adapter / QLoRA dialogic-voice carrier** | UX §3 + M4'-SPEC §7.12 + m5-prime-epii-on-nara-qlora — no carrier object | Cross-reference to **Tranche 12.1** parity audit; if Anima does not claim, escalate to user final-validation |
| **Psychoid cymatic field renderer surface** | Diamond-QL Vitruvian geometry, Hopf-linked tori, lens-ring backdrop | Tranche **05.5** (m4-nara extension first-build allowed: M' product surface) |
| **`anuttara_trace(output, sensitivity, depth)` API** | UX §2.3 named; M5-claimed with M0-substrate-owner requirement; read-only contemplative-offering only; M0 substrate writes via governed routed-write per DR-M0-1; no separate carrier lands | Tranche **06.6** (CLOSED 2026-06-15) |
| **Logos Atelier (M5-5) Theia extension** | Spec-canonical M5-5 surface with no Body/S/S5 dedicated core and no Theia extension | Tranche **06.2** (`logos-atelier` extension over Aletheia + epi-gnostic) |
| **Constitutional-agent profiles (nous, logos, eros, mythos, psyche, sophia)** | Only `anima.md` visible at `Body/S/S4/pi-agent/agents/` | Tranche **12.3** orphan-fill |
| **Daily-layer widgets (`pratibimba.daily.{journal, agent-checkin, cymatic-placeholder, status-display}`)** | Declared in `layout-types.ts:52-58`; no confirmed extension owner | Tranche **11.3** owner-trace + closure |
| **TillDone substrate residency** | `capability-matrix execution_backbone.body_path` declares `Body/S/S4/ta-onta/pleroma/S2/tilldone.ts`; existence audit needed | Tranche **12.11** |
| **`MathemeHarmonicProfileBoundary.payload` opacity** | Intentional opacity at `profile.ts:9-11`; per-extension narrowing is each Mn's responsibility | Tranche **10.1** records the policy (intentional ORPHAN — no work) |
| **ACR extension repurpose** | Per DR-M5-1, `agentic-control-room` substrate is tangent-development drift; needs repurpose as Pi-runtime monitoring surface OR deprecation; `constitutional_agents[]` array audit required | Tranche **12.14** (NEW) + **12.3** (constitutional_agents disposition) |
| **K² played-torus 3D extension** | DR-M1-2 ratified: full Bevy/wgpu extension required; no current owner | Tranche **02.6** (first-build allowed: M' product surface) |
| ~~**Earth observer handle**~~ **RESOLVED by DR-M2-1 / DR-KB-1** | Earth is the 10th planet / observer-centre inside `M2_PLANET_LUT[10]`; no separate profile-bus handle lands | RESOLVED — document Earth-at-centre semantics in Tranches **03.5**, **03.9**, **10.3** |
| **F_routing carrier** | DR-M2-3 method-routing closure at `portal-core/src/parashakti/f_routing.rs` | Tranche **03.2** + DR-M2-3 closure |
| **Hen vault-instance carrier** | DR-M1-4 Hen contract for vault-as-instance writes (M1-1') | Tranche **02.X** (Hen contract landing) + DR-M1-4 closure |
| **Hen entity-candidate lifecycle** | Dangling wikilinks and Obsidian root-created notes have Smart Env suggestions but no first-class Empty -> World/Types -> flat World lifecycle | Tranche **CCT-14** in [`16-cross-cutting-closures.md`](16-cross-cutting-closures.md) + DR-S1-4 |
| **C-layer semantic typology** | Semantic World/Types roots need coordinate-native homes under C0-C5 rather than top-level folder authorities | Tranche **CCT-15** in [`16-cross-cutting-closures.md`](16-cross-cutting-closures.md) + DR-S1-5 |
| **`K2SurfaceHandle` ownership** | Per INTEGRATED-1-2-3 composition: handle exposing K² geometry for M2/M3 mount-points | Tranche **02.6** + **07.X** (new — composition mount-point) |
| **`bedrock_link` computation** | CCT-6: kernel-substrate provenance chain proving profile-field values derive from `.rodata` | Tranche **CCT-6** in [`16-cross-cutting-closures.md`](16-cross-cutting-closures.md) |
| **`pattern_packet_handle` source-of-truth** | CCT-7: M4-3' day-episode evidence aggregator consumed across M4, M5, integrated 4-5-0 | Tranche **CCT-7** in [`16-cross-cutting-closures.md`](16-cross-cutting-closures.md) |
| **`cron_evening` Möbius hook scheduler** | M5-ARCHITECTURE.md §Möbius write-back: night-pass scheduler for Logos Atelier crystallisations; no scheduler owner | Tranche **12.9** (Moirai night-pass routing) extended |
| ~~**Techne profile (7th of "six Aletheia guardians")**~~ **RESOLVED 2026-06-03 by DR-S4-TECHNE** | Was: S4 canon §14-Agent Roster lists Techne as Aletheia-7 member. **Now: DR-S4-TECHNE ratified — Techne is NOT an agent; it is Pleroma's atomic-skills substrate (Pleroma's second face alongside VAK).** No agent profile lands. Techne moves to Pleroma CONTRACT.md §Techne section. The 6 Aletheia subagents are techne-guardians. | RESOLVED — see DR-S4-TECHNE in 13-decision-register.md |

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
- DR-S1-4
- DR-S1-5

## Release Gates

Cycle 3 is **route-able for m-dev** when:

1. **G1 — Overview routed.** `node .codex/scripts/m-dev-plan-assess.mjs --reset --write --json --require-now <plan_folder>` returns clean ledger with all active tranche files indexed. **Tranche-bearing files** (must appear in `plan.index.json`): 01-12, 15, 17-19, 21-32, 34, 36, 43 — note 24/25/29 use `### Tranche NN.x —` headings (format normalised 2026-06-09; bare `### NN.x —` headings are NOT parsed by the assessor) and 34 carries Tranches 34.1/34.2. **Planning handoffs** (intentionally NOT indexed; they amend parent docs instead): 33 (amendments applied to tracks 04/05/06/08/09/10/12/16/17 in the 2026-06-09 working tree) and 35 (amendments NOT yet applied; see its §2 numbering note before applying). Reference docs 13/14/16/20 are not tranche queues. CAUTION: `--reset` wipes task statuses — use plain `--write` for re-index unless a true reset is intended.
2. **G2 — Every matrix file present.** `for f in plan.runs/wave-{a-m{0,1,2,3,4,5},b-{kernel-bridge,theia-shell,agentic-layer,integrated-bimba}}-{reconciliation-,}matrix.md; do test -f "$f"; done` returns clean.
3. **G3 — Every load-bearing UX claim classified.** Per-subsystem matrix files account for every claim in each UX doc; orphan rows above route to a tranche.
4. **G4 — Every CONTRADICTION has a decision row.** Tranche 13 has 20+ rows covering every CONTRADICTION surfaced by Wave A or Wave B.
5. **G5 — Every CODE-PENDING has a closing tranche.** Tranches 10.x for profile-spine; per-subsystem tranches for domain-pending; Tranche 12 for agentic-layer pending; Tranche 09 for graph-substrate pending; Track 36 for `anuttara_pentadic_trace` and the 0/1->5 runtime hinge. No silent pending markers.
6. **G6 — Anti-greenfield posture verified.** No tranche touching `Body/S/S0`-`S5`, `Idea/Pratibimba/System`, or `Body/M/epi-tauri` is phrased as first-build except for explicitly allowed M' product surfaces (Logos Atelier, Canon Studio, Backend Studio, psychoid renderer, F_routing carrier, M1 played-K²-torus Bevy/wgpu extension per DR-M1-2, repurposed OmniPanel runtime per Tranche 15.2, daily-layer widgets if Tranche 11.3 chooses build-path).

7. **G7 — UI foundation principles registered.** Tranche 15.1 has authored `ui-foundation-principles.md`; every extension contributing to a shell slot references it. (See Tranche 15 release gates.)

8. **G8 — Visual-regression baselines committed.** Tranche 15.12 has produced frame-by-frame baselines for the lemniscate transition and tick choreography.

9. **G9 — Total-shape architecture docs landed and harmonised.** The eight Phase-A architecture documents (M0-M5 + two integrated plugins, plus the M1-2 exemplar) are present at canonical paths and verified by the Phase-B cross-boundary verifier (`plan.runs/phase-b-verification-report.md`). Every per-domain tranche references its arch doc.

10. **G10 — Cross-Cutting Closures complete.** All CCTs in [`16-cross-cutting-closures.md`](16-cross-cutting-closures.md), including CCT-14 Hen entity-candidate lifecycle and CCT-15 C-layer semantic typology, close or are explicitly downgraded.

11. **G11 — Phase-B DRs are consumed only after validation/downgrade.** The Phase-B DR rows (DR-IG-2..6, DR-M1-3..4, DR-M2-3, DR-M4-3, DR-M5-3) are either VALIDATED by user or explicitly downgraded before downstream tranche execution; no tranche begins work on an unvalidated DR-IG-* or DR-Mn-*.

12. **G12 — Repo-hygiene & navigability audit passes.** Per [`43-end-of-cycle-3-audit-protocol.md`](43-end-of-cycle-3-audit-protocol.md): the 43.1 immediate hygiene fixes are landed (verified: `git ls-files target/ Body/S/S0/epi-lib/test/bin | wc -l` → 0); the 43.1 gated legacy removals are closed with their parent tracks (11/02/12); the 43.2 Coordinate Header convention is registered with Hen via Track 40; 43.3 is applied across S/S'→M'; the 43.4 C-header invariant holds (`make test` green AND no `include/m*.h` larger than its sibling `src/m*.c`); the 43.5 forbidden-imports + header lint runs in CI; and **DR-HYGIENE-1, DR-HYGIENE-2, DR-HYGIENE-3** are VALIDATED in `13-decision-register.md`. Cycle 3 does not close while G12 is open.

## Decision-Register Gate (updated)

Cycle does not close until ALL DR rows listed in §Decision-Register Gate AND the Phase-B rows (DR-IG-2 through DR-M5-3) are VALIDATED or explicitly downgraded in `13-decision-register.md`.
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
  → Profile-spine (10 + 36.1-36.2)
    → Per-domain (01-06 + 36.3/36.5/36.6, parallel where decisions permit)
      → Integrated composition (07, 08, 09 + 36.4-36.5)
        → Shell + agentic closure (11, 12)
          → No-orphan audit re-run (14 + 36.7)
            → cycle-3 closed; cycle-4 inherits substrate
```
