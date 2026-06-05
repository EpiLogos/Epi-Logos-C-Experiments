# Wave-C M5' Epii Frontend Deep-Design Reconciliation Matrix

**Task ID:** wave-c-m5-epii-frontend
**Domain:** M5' (Epii / EBM-position-5' / paidagōgos) — per-extension widget UX (standalone `m5-epii` + ide-shell-hosted M5 chrome + `4-5-0` composition slot)
**Authored:** 2026-06-05
**Anti-greenfield:** `m5-epii` standalone is a minimal scaffold (Profile + Review counts only). Five M5-flavoured chrome widgets in `ide-shell-m0-m5/src/browser/` (`logos-atelier-widget`, `evidence-pane-widget`, `review-pane-widget`, `autoresearch-pane-widget`, `agentic-control-room-widget`) are landed. `plugin-integrated-4-5-0` extension landed. Wave-C audits + deepens + extends; never rebuilds.

## Sources

- Matrices: `plan.runs/wave-a-m5-reconciliation-matrix.md`, `plan.runs/wave-b-theia-shell-matrix.md`
- Tranches: `06-m5-epii-reconciliation.md` (6.1-6.10), `11-theia-shell-surface-hosting.md`, `12-agentic-layer-s4-s5.md` (12.1, 12.5, 12.14, 12.18-19), `15-ui-design-foundations.md` (15.2, 15.4, 15.11), `19-contemplation-surface-integration.md` (19.2, 19.6, 19.7, 19.9), `13-decision-register.md` (DR-M5-1/2/3, DR-MP-1/2/3, DR-S4-TECHNE, DR-TS-1/4, DR-B-2/3)
- Canon: `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md`, `M5-ARCHITECTURE.md`, `epii-operational-capacities/*.md` (6 files), `Idea/Pratibimba/System/Subsystems/epii/epii-ux-full-m5-branch.md` (§1-14), `Idea/Bimba/Seeds/M/M4'/mental-pole-mechanics.md` §1/§7/§10
- Substrate: `Body/M/epi-theia/extensions/{m5-epii, ide-shell-m0-m5, plugin-integrated-4-5-0, agentic-control-room, integrated-composition, contracts}`; preflight `07-t0` JSON L452 (`m5.epii.{reviewQueue, spineStateInspector, metaConversation}`)

## Standing-Invariant Honoring

- **DR-M5-1.** Pi (single harness) + Anima (dispatcher) + six Aletheia subagent techne-guardians (Anansi/Janus/Moirai/Mercurius/Agora/Zeithoven) in crystallisation-mode as sub-traces — NOT peer review actors. Legacy 7-constitutional-agents render as psyche-facet badges (DR-WC-M5-3 proposal).
- **DR-M5-3.** Library-pane is left-sidebar activity-bar in `ide-deep`, NOT an OmniPanel tab.
- **DR-MP-1/2/3.** M5' is **EBM-position-5'** — 72-dim resonance-vector predictor, energy `‖target − actual‖²`, gradient driving Möbius descent `q_p^(n+1) = q_p^(n) − log(9/8) · ∇E`. The OmniPanel Pi Chat (15.2) is M4' LLM voice; M5' widget is M5' EBM reasoning observatory. Three tritone-symmetric squares: Square A `[0+5]`, Square B `[1+4]`, Square C `[2+3]`.
- **DR-TS-4.** Six operational-capacity views are M5'-chrome / Pi-monitor — NOT new OmniPanel tabs.
- **DR-TS-1.** State (coordinate, session, profile generation, day-now) survives `daily-0-1` ↔ `ide-deep` and 0/1 toggles.
- **DR-B-2.** Pi exposes axiom-translation tool surface (philosophical-English ↔ formal-notation ↔ OWL ↔ SHACL) — not a UX downgrade.
- **Anima/Epii split (MEMORY).** Anima at S4' orchestrates; Epii at S5' is the knowledge/user-rep backend — M5' widget is deep-backend, NOT a chat clone of OmniPanel Pi Chat.
- **Aletheia mode-not-peer.** Aletheia subagents render as evidence lineage / dispatch sub-traces in crystallisation-mode, never as competing review actors.

## Four-Way Reconciliation Matrix

| # | Claim | Spec authority | Code / substrate | Theia surface | Status |
|---|---|---|---|---|---|
| WC-M5-1 | M5' deep widget shows EBM 72-dim resonance vector + three tritone-symmetric squares ((0,5)/(1,4)/(2,3)) as canonical reasoning surface (DR-MP-2; UX §4.2) | M5'-SPEC §1 (post-DR-MP-1 patch); mental-pole-mechanics §1; DR-MP-2 | Substrate gated on 6.8 `resonance_ebm/` + `MathemeResonance72Projection.learned_predictor_checkpoint_ref` per 10.M5 | Current `m5-epii-widget.tsx` renders Profile + Review counts only; NO 72-grid, NO Klein V₄ overlay, NO energy/gradient | **CODE-PENDING + SPEC-AHEAD** — Tranche 26.1 owns deep surface |
| WC-M5-2 | Six operational capacities each surface as discrete affordance (Anuttara-construction / Paramaśiva-CPT-RAG / Paraśakti-graph-relational / Mahāmāyā-process-reward / Nara-Anima-dialogic / Epii-on-Epii) (UX §M5-4; SPEC §M5'.4) | M5'-SPEC §M5'.4 names six capacity files; readiness criteria lists six end-to-end paths | `capacity_workflows.rs` landed (6.3 / 12.5); six capacity .md files landed; DR-MP-1 binds each to specific tranche | No widget surfaces six capacities; ACR Capability Tree renders capability-matrix (tools+skills), NOT capacity-workflows | **SPEC-AHEAD** — Tranche 26.2 (six capacity tabs in standalone widget) + cross-link 12.5 |
| WC-M5-3 | Logos Atelier hosts scent-following (root → cognate → drift → psychoid → pros-hen → Möbius write-back) over `etymology` namespace (UX §2.6) | M5'-SPEC row M5-5'; 6.2 (no-orphan-fill); 12.1 Aletheia-crystallisation-mode | `logos-atelier-widget.tsx` landed; six generic L0-L5 panes; uses `IDE_SHELL_WIDGET_IDS.LOGOS_ATELIER` | Stage tracking present; scent-following pipeline NOT modelled; etymology namespace NOT wired; Aletheia tools NOT invoked | **AUDIT + EXTEND** — Tranche 26.3 |
| WC-M5-4 | Evidence pane surfaces `MediatedRunEvidencePacket` with dispatch traces, tool streams, gate landings (UX §11; 15.2; 12.14) | 15.2 Evidence as OmniPanel landing surface; 15.11 dispatch genealogy first-class; 19.7 close-path | `evidence-pane-widget.tsx` landed; `EvidenceRecord` carries privacy gate + basic anchors | Generic `EvidenceRecord` strict subset of `MediatedRunEvidencePacket`; no dispatch-trace inline, no tool-stream cross-link | **AUDIT + EXTEND** — Tranche 26.4 |
| WC-M5-5 | Review pane is full pane (NOT modal — 15.2); IOD-17 three-way parity rendered (UX §11) | 15.2 "No modal review surfaces"; IOD-17 governance | `review-pane-widget.tsx` landed; `humanRequired` banner; consumes `s5'.review.inbox` | IOD-17 three-way parity NOT rendered; no triple-column readout; no dispatch-genealogy link | **AUDIT + EXTEND** — Tranche 26.5 |
| WC-M5-6 | Autoresearch pane surfaces what autoresearch IS + Möbius-pass + per-capacity filter (UX §11; 6.3) | M5'-SPEC §M5'.3 spine; 6.3 capacity views; 6.6 dry-run-only | `autoresearch-pane-widget.tsx` landed; `AutoresearchCandidate` + `s5'.improve.history` | No autoresearch-as-concept frame; no `recompose.rs` Möbius display; no per-capacity filter | **AUDIT + EXTEND** — Tranche 26.6 |
| WC-M5-7 | ACR renders Pi→Anima→Aletheia-subagent dispatch genealogy + capability tree (15.11; 12.1; 12.14) | 15.11 dispatch genealogy first-class; 12.1 collapses `AgenticActor` union; 12.14 ACR repurpose as Pi-monitor | `agentic-control-room-widget.tsx` T4 shell with capability tree; T8 host empty | T8 contents NOT landed; `constitutional_agents` renders legacy 7-agent roster (must collapse per DR-M5-1); 12.14 reframe owed | **AUDIT + EXTEND + DR-LANDING** — Tranche 26.7 |
| WC-M5-8 | Constitutional-roster surface (per DR-M5-1; cross-link 15.11) | DR-M5-1 ratified: audit as psyche-aspect rendering OR deprecate; Wave-A M5 claim 15 contradiction | `capability-matrix.json constitutional_agents=[anima,eros,logos,mythos,nous,psyche,sophia]`; `Body/S/S4/pi-agent/agents/{anima,nous,logos,eros,mythos,psyche,sophia}.md` | Surface absent — render as psyche-facet badges on Pi dispatch traces? | **DR-LANDING** — Tranche 26.8 |
| WC-M5-9 | Aletheia subagents surface as UX membrane in crystallisation-mode (DR-B-3; UX §2.5) | DR-M5-1 / DR-S4-TECHNE; 6.7 collapses `AgenticActor`; 12.18 Janus prospective/retrospective; 12.19 veto | `Body/S/S4/ta-onta/S4-5p-aletheia/` extension landed; six subagents in `accepted_deposits_from_anima` | Per-subagent surfacing absent; Janus prospective/retrospective panel + OracleSpread aliveness + veto banner all missing | **SPEC-AHEAD** — Tranche 26.9 |
| WC-M5-10 | `MediatedRunEvidencePacket` is canonical evidence shape (UX §11; 15.2) | 15.2 OmniPanel Evidence consumes it; 12.14 ACR repurpose; 19.7 close-path | Schema NOT defined in code; existing `EvidenceRecord` strict subset | Generic `EvidenceRecord` insufficient — must carry dispatch sequence, tool calls, gate landings, axiom-translation steps | **CODE-PENDING + AUDIT** — Tranche 26.10 lands schema in `integrated-composition/src/common/evidence-shapes.ts` |
| WC-M5-11 | M5' composes in `4-5-0` recognition-layer right slot (Mahamaya M3-codon at personal scale via Q_composed) (Track 15 §personal-side) | 15.4 composition-over-juxtaposition; 4-5-0 recognition seam (UX §7); `CanonRecognitionAnchor` (10.M5) | `plugin-integrated-4-5-0/` landed with M4+M5+M0+integrated-composition deps; `08-t0-composition-contract` | Composition slot for m5-epii NOT named; recognition-layer wire-up absent | **SPEC-AHEAD** — Tranche 26.11 |
| WC-M5-12 | ContemplationObjectViewer surfaces session ContemplationObject (kairos_at_open/close, tarot_psyche_anchor, q_composed_trajectory, codon_trace, vak_profile_pairs, m1_charge_state, m1_2_skeleton_events_fired, four_syntax_compliance_seeds[4]) (19.2/19.6/19.7) | 19.2 defines `M5_ContemplationObject`; 19.6 RPC; 19.7 close-path | Substrate gated on 19.x; m5-epii widget has NO viewer | Contemplation-object reading IS M5' surface at close — Möbius descent input + four-syntax-compliance + Q_composed geodesic + 7-8-9 spine (19.9) | **CODE-PENDING + SPEC-AHEAD** — Tranche 26.12 |
| WC-M5-13 | Wisdom_delta inspector + XOR closure visualisation (19.7) | 19.7 `m5_compose_contemplation_object` → `contemplate_session_close` → `m4_mobius_return(wisdom_delta XOR quintessence_hash[0..8])` | `m{4,5}.c` substrate landed; reasoning trail from LLM/EBM/Verifier joint operation per DR-MP-1 | Wisdom_delta reasoning trail + XOR-fold animation absent | **CODE-PENDING + SPEC-AHEAD** — Tranche 26.13 |
| WC-M5-14 | Anima/Epii split — M5' widget is EBM/knowledge backend; OmniPanel Pi Chat is Pi-as-membrane (MEMORY; DR-MP-1) | MEMORY "Anima/Epii split"; 15.2 OmniPanel = canonical Pi Chat; M5' standalone = backend EBM | M5' widget pkg desc: "Review queue and spine-state inspector" (backend framing aligned); OmniPanel `chat` tab spec'd | M5' widget shows only Profile + Review counts; EBM-backend identity NOT surfaced | **AUDIT + EXTEND** — Tranche 26.1 narrative |
| WC-M5-15 | 7-8-9 spine reading at M5' evaluation (action/octave/wholeness; VIRTUE_LUT[9] 9-bit witness) (19.9) | 19.9 spine reading + `VIRTUE_LUT[9]`; arch-9 `_Static_assert` m3.h:770 | Substrate landed; surface absent | M5' widget surfaces no virtue / 9-bit witness UI | **SPEC-AHEAD** — Tranche 26.13 augments WisdomDeltaInspector |
| WC-M5-16 | Backend Studio LSP for M5 (rust-analyzer for `epii-{review,agent,autoresearch}-core`; clangd for `epi-lib`; pylsp for `epi-gnostic`) (UX §2.3) | Tranche 6.4 Canon Studio + Backend Studio; 15 left-sidebar `Backend Studio` | Substrate landed; Backend Studio extension NOT landed (6.4 pending) | LSP wiring owed via 6.4 surfacing M5-flavoured cores by provenance | **CODE-PENDING (cross-track)** — no new Wave-C tranche; 26.7 cross-links Backend Studio click-through |
| WC-M5-17 | Pi tool-surface (DR-B-2 axiom-translation: phil-Eng ↔ formal-notation ↔ OWL ↔ SHACL) | DR-B-2; 12.1 Pi as harness with axiom-translation; M5'-SPEC §2.5 | `Body/S/S4/pi-agent/skills/anuttara-symbolic-parse/SKILL.md` per DR-MP-3 | Axiom-translation NOT rendered as discrete affordance | **SPEC-AHEAD** — Tranche 26.14 `PiAxiomTranslationInspector` |
| WC-M5-18 | M5'-chrome composes in Pi-runtime-monitor (12.14) — dispatch + tool stream + capacity workflows | 12.14 ACR repurpose (a) Pi-monitor; 12.5 not OmniPanel tabs; DR-TS-4 | `agentic-control-room` exists w/ legacy framing; 12.14 recommends rename `pi-runtime-monitor` | Three M5'-flavoured surfaces (standalone EBM + ide-shell governed-chrome + Pi-monitor) pattern not explicit | **DOC-AHEAD** — Tranche 26.15 |

## Anomalies

### CONTRADICTION (DR candidates)

- **DR-WC-M5-1 — Pi runtime monitoring widget rename execution.** Track 12.14 names the ACR repurpose decision; Wave-C must follow through. Option (a) rename extension to `pi-runtime-monitor` (recommended) OR (b) leave legacy name with documented reframe. Tranche 26.7 picks path. Cross-link 12.14, 15.2.
- **DR-WC-M5-2 — Where does 72-dim EBM resonance vector live as widget?** (a) M5' standalone widget primary surface (canonical per DR-MP-1, DR-TS-4); (b) kernel-bridge-readiness bottom-pane (rejected); (c) OmniPanel Diagnostics tab (rejected per DR-TS-4). Tranche 26.1 ratifies (a).
- **DR-WC-M5-3 — Constitutional-agent roster renders as psyche-facet badges on Pi dispatch traces (not peer agent rows); Sophia surfaces only as facet (negative-claim per Wave-A claim 16).** Tranche 26.8 lands this in Track 13. Resolution path: align Tranche 26.7 RunTree rendering with `capability-matrix.json constitutional_agents` array.

### CODE-PENDING (cross-track substrate gates)

- **CP-WC-M5-1** — `MediatedRunEvidencePacket` schema undefined. Wave-C tranche 26.10 lands in `integrated-composition/src/common/evidence-shapes.ts`. Gates 26.4, 26.5, 26.7.
- **CP-WC-M5-2** — `EpiiReviewWorkbenchProjection` + `CanonRecognitionAnchor` profile-bus projections (Tranche 10.M5). Gates 26.1 (read), 26.11 (recognition wire-up).
- **CP-WC-M5-3** — `MathemeResonance72Projection.learned_predictor_checkpoint_ref` field (DR-MP-2). Gates 26.1 EBM checkpoint label. Depends 6.8 + 6.10 + 10.M5.
- **CP-WC-M5-4** — `M5_ContemplationObject` struct + `contemplate_session_close` RPC. Gates 26.12 + 26.13. Depends 19.2 / 19.6 / 19.7.
- **CP-WC-M5-5** — Six-capacity-workflow surfacing payload from `capacity_workflows.rs`. Gates 26.2 (six tabs). Depends 6.3, 12.5.

### SPEC-AHEAD (surface absent for landed substrate)

- **SA-WC-M5-1** — Scent-following pipeline in Logos Atelier (Tranche 26.3 closes; etymology namespace + Aletheia tools landed; widget surfaces only generic L0-L5)
- **SA-WC-M5-2** — Dispatch-genealogy click-through across ACR / Evidence / Review / Source (15.11 first-class; substrate landed). Tranches 26.4 / 26.5 / 26.7.
- **SA-WC-M5-3** — Pi axiom-translation tool surface (DR-B-2; Pi-agent skill landed; widget absent). Tranche 26.14.
- **SA-WC-M5-4** — Six-capacity per-Mn surfacing inside Pi-monitor. Tranches 12.5 / 26.2 / 26.7.
- **SA-WC-M5-5** — Composition slot `m5.epii.recognitionLayer` inside `4-5-0` plugin (15.4 + 08 substrate). Tranche 26.11.

### AUDIT + EXTEND (existing M5-flavoured chrome in ide-shell-m0-m5)

- **AE-WC-M5-1** `logos-atelier-widget.tsx` → Tranche 26.3 scent-following retrofit
- **AE-WC-M5-2** `evidence-pane-widget.tsx` → Tranche 26.4 `MediatedRunEvidencePacket` + 19.7 close-path
- **AE-WC-M5-3** `review-pane-widget.tsx` → Tranche 26.5 IOD-17 parity + dispatch-genealogy
- **AE-WC-M5-4** `autoresearch-pane-widget.tsx` → Tranche 26.6 autoresearch-as-concept + Möbius + capacity filter
- **AE-WC-M5-5** `agentic-control-room-widget.tsx` → Tranche 26.7 T8 contents + DR-M5-1 roster collapse + 12.14 Pi-monitor reframe

### ALIGNED (no new tranche; consume as-is)

- **A-WC-M5-1** `bridge-gate.tsx` SharedBridgeAdapter readiness pattern
- **A-WC-M5-2** `08-t0-composition-contract-preflight` for `plugin-integrated-4-5-0`
- **A-WC-M5-3** privacy-class gate `isPrivacySafe`
- **A-WC-M5-4** `IdeShellBridgeGate` wrapper readiness-banner pattern
- **A-WC-M5-5** `MObservabilityPublisher` for `m5-epii`

## Proposed Cycle-3 Tranches (id space `26.x`)

| Tranche | Title | Classification | Sources | Gates / Cross-Links |
|---|---|---|---|---|
| **26.1** | M5'-as-EBM standalone widget deep design (72-dim resonance grid + three tritone-symmetric squares + energy/gradient/Möbius-descent) | code-pending-closure + audit | WC-M5-1/2/14; DR-WC-M5-2 | gates 6.8, 6.10, 10.M5; CR 15.4 |
| **26.2** | Six operational-capacity affordance in standalone widget | spec-ahead-integration | WC-M5-2/7 | gates 6.3, 12.5; CR DR-TS-4 |
| **26.3** | Logos Atelier scent-following retrofit (audit + extend) | audit-extend + no-orphan-fill | WC-M5-3, SA-WC-M5-1 | gates 6.2; CR 12.1 |
| **26.4** | Evidence pane deepening — `MediatedRunEvidencePacket` + dispatch-trace + 19.7 close-path | audit-extend | WC-M5-4, SA-WC-M5-2 | gates 26.10, 19.7; CR 15.2, 15.11 |
| **26.5** | Review pane deepening — IOD-17 three-way parity + dispatch-genealogy click-through | audit-extend | WC-M5-5, SA-WC-M5-2 | gates 26.10; CR 15.2, 15.11 |
| **26.6** | Autoresearch pane deepening — autoresearch-as-concept + Möbius-pass + per-capacity filter | audit-extend | WC-M5-6 | CR 6.3, 6.6 |
| **26.7** | ACR T8 contents + DR-M5-1 roster collapse + 12.14 Pi-monitor reframe | audit-extend + DR-landing + contradiction-decision | WC-M5-7/8, DR-WC-M5-1 | gates 6.7, 12.14; CR 15.11 |
| **26.8** | Constitutional-roster psyche-facet rendering decision (DR-WC-M5-3) | contradiction-decision | WC-M5-8 | gates DR-M5-1 / 6.5; CR 12.1 |
| **26.9** | Aletheia subagent (Anansi/Janus/Moirai/Mercurius/Agora/Zeithoven) surfacing in ACR + Logos Atelier | spec-ahead-integration | WC-M5-9 | CR 12.18, 12.19, 26.3 |
| **26.10** | `MediatedRunEvidencePacket` schema landing in `integrated-composition/src/common/evidence-shapes.ts` | code-pending-closure | WC-M5-10, CP-WC-M5-1 | gates 26.4/5/7; CR 15.2 |
| **26.11** | `m5.epii.recognitionLayer` composition slot in `plugin-integrated-4-5-0` | spec-ahead-integration | WC-M5-11 | gates 10.M5 `CanonRecognitionAnchor`; CR 15.4 |
| **26.12** | `ContemplationObjectViewer` widget service inside m5-epii | code-pending-closure + spec-ahead-integration | WC-M5-12 | gates 19.2/6/7 |
| **26.13** | `WisdomDeltaInspector` — 4'-5'-0' joint-composition + XOR-fold animation + 7-8-9 spine (VIRTUE_LUT[9]) | code-pending-closure + spec-ahead-integration | WC-M5-13/15 | gates 19.7, 19.9 |
| **26.14** | `PiAxiomTranslationInspector` — DR-B-2 axiom-translation surface | spec-ahead-integration | WC-M5-17, SA-WC-M5-3 | CR 12.1, 26.4, 26.7 |
| **26.15** | M5' surface-composition pattern doc — standalone vs ide-shell chrome vs Pi-monitor (canonical SharedBridgeAdapter binding per surface) | doc-ahead-landing | WC-M5-18 | CR 15.2, 12.14, 26.1, 26.4-7 |

## Summary

The M5' frontend deep-design field has **three M5'-flavoured surfaces** each addressing a different register:

1. **`m5-epii` standalone widget** = EBM-position-5' reasoning observatory (DR-MP-1/2/3). Renders 72-dim resonance grid, Klein V₄ tritone-symmetric squares, energy ‖target − actual‖², gradient ∇E, Möbius descent `q_p^(n+1) = q_p^(n) − log(9/8)·∇E`, six operational-capacity affordance, ContemplationObjectViewer + WisdomDeltaInspector + 7-8-9 spine reading. Activates `ide-deep`. Tranches 26.1/26.2/26.12/26.13.
2. **M5-flavoured chrome in `ide-shell-m0-m5`** (five widgets) = governed evidence + review + atelier crystallisation + capability-tree surface. Wave-C audits + extends each. Tranches 26.3-26.7, 26.9, 26.14.
3. **Composition slot in `plugin-integrated-4-5-0`** = Mahamaya recognition-layer at personal scale via Q_composed. Tranche 26.11.

Three DR entries (DR-WC-M5-1/2/3) + one new schema (`MediatedRunEvidencePacket`, Tranche 26.10) gate the chrome tranches. Five code-pending substrate gates (6.8 / 6.10 / 10.M5 / 19.2-7 / 6.3 / 12.5) gate the standalone deep render. One doc-landing (26.15) names the three-surface pattern. No greenfield rebuild; `m5-epii` standalone replaces widget body inside existing shell; five ide-shell widgets audited + extended; `plugin-integrated-4-5-0` consumed as-is with composition-slot delta.

**End of matrix.**
