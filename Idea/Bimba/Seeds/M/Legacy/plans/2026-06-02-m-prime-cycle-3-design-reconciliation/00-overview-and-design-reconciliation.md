# Cycle 3 — Design Reconciliation Overview

This cycle is **design-reconciliation**, not feature-build. The deliverable is **the plan set itself**: a contradiction-resolved, gap-explicit, code-grounded set of tranches ready for subsequent `/m-dev` execution. Cycle 1 built the S-stack. Cycle 2 owned the M' surfaces over landed substrate. Cycle 3 drives the pedagogical/UX design to the bottom against the real code and Theia substrate, and surfaces every load-bearing decision that needs user final-validation.

## Method — the Four Corpora

For every load-bearing design claim, follow it across all four corpora:

```
(1) UX DOC          (2) M' SEED SPEC        (3) CODE / SUBSTRATE        (4) THEIA SURFACE
the pedagogical      the canonical domain    what is actually landed     the extension/shell
intent we wrote      authority + companions  in Body/S and Body/M        that renders it
```

Status taxonomy per claim:

- **ALIGNED** — doc ↔ spec ↔ code ↔ Theia all agree; note only.
- **DOC-AHEAD** — UX doc asserts intent the spec/code doesn't yet carry → landing tranche.
- **SPEC-AHEAD** — spec defines a contract the Theia surface doesn't consume yet → integration tranche.
- **CODE-PENDING** — a kernel/profile/graph contract is a known `pending-*` / blocker → named closure (no rebuild).
- **CONTRADICTION** — two sources disagree → decision-register entry routed to user final-validation.
- **ORPHAN** — a canonical surface/carrier/agent has no owner → no-orphan finding.

## Anti-Greenfield Rule (binding)

`Body/S/S0`–`S5`, `Idea/Pratibimba/System`, and `Body/M/epi-tauri` are landed/consumed substrate. Any cycle-3 tranche touching them must be phrased `consume as-is`, `audit/verify`, or `extend` — first-build ownership is **only** for an M' product surface, a named carrier/agent/subagent owner, a method-routing closure, or a concrete named integration blocker.

## Standing Invariants (already true — honor, do not re-derive)

- S0 is the membrane (CLI/process/adapter). S1–S5 own service law.
- `Body/M/epi-theia` is the M' Theia shell authority. `Body/M/epi-tauri` is deprecated migration-source only.
- The matheme spine is `M1 (+1) → M2 (72) → M3 (64)`; the `+1` parent is **M1-5, not M0** — residual `M0-witness` wording is a CONTRADICTION to be downgraded.
- The 72 is **one invariant, six addressing-axes** (MEF×QL · tattva · decan · Shem · maqam · DET-projection); mantra (100) and Asma'ul-Husna (99+1) are sonic overlays; planet LUT (10) is keying via decan-link, not a seventh 72-axis.
- Shell separation is load-bearing: shell `0` (cosmic 1-2-3) · shell `1` (personal 4-5-0 + flow-writing) · `4+2` depth · `/` OmniPanel — never collapse.
- Cl(4,2) runs at four scales (M1 ring · M3 codon · M4 personal · Kerykeion natal) — verify it is one algebra in code (kernel-bridge audit owns the proof).
- Hen owns Pi/vault entity-candidate compilation: dangling wikilinks and Obsidian root-created notes enter Empty candidate residency, promote through coordinate-native World/Types incubation, and graduate into flat World only after review. Smart Env suggests; Hen writes; S2 syncs.
- The C layer is the semantic typology authority inside World/Types: templates route through C1/CT, entities/properties/tags through C2, canvases/diagrams through C3, type/MOC authorities through C4, and World graduation through C5.
- **Third Spanda Equation is the canonical matheme spine** (ratified 2026-06-04 per DR-M3-6): `137 = [8(8+9) − 9] + 1 + 9` in five equivalent forms (Mersenne `(2^7−1)+1+9` · Binary `2^7+9` · Octave-field `8(8+9)+1` · Spanda-bridge `64+2(36)+1` · M-stack `M_3(64)+M_2(72)+M_1(1)`). Execution-order trace: `64+72=136 → −9 → 127=M_7 → +1 → 128=2^7 → +9 → 137 → +δ → 137.035999…`. The 127 Mersenne substrate (with prime-index `31 = M_5`) is structurally `M_5 → M_7` at the actional-Archetype-7 layer — it is the canonical evidence that the +1 attribution is M1-5's K² topological-necessity. Canonical source: [`Idea/Bimba/Seeds/M/ql_m0_m3_third_spanda_integral_quilting_v2.md`](../../ql_m0_m3_third_spanda_integral_quilting_v2.md).
- **Translation rule `9_M2 = 8_M3 + 1_M1` is canonical matheme law** (ratified per DR-IG-7): the M2 9-fold wholeness-gap projects to M3's 8-fold transcriptional gap plus the M1 parent unit. Recurs as QCD `3 ⊗ 3̄ = 8 ⊕ 1`. Whenever an 8-gap appears at M3, the reading must locate the M1 +1 that restores M2 wholeness.
- **VAK is the operational language** (ratified per DR-VAK-3): the six VAK Context Frame families (CPF/CT/CP/CF/CFP/CS) wired in [`vak.h`](../../../../../Body/S/S0/epi-lib/include/vak.h) · [`vak_address.rs`](../../../../../Body/S/S0/portal-core/src/vak_address.rs) · [Anima `extension.ts`](../../../../../Body/S/S4/ta-onta/S4-4p-anima/extension.ts) ARE the system's language at the constitutional layer. The diatonic-scale-as-CF-progression is canonical operational truth carried by `MathemeDiatonicContext` at [`kernel.rs`](../../../../../Body/S/S0/portal-core/src/kernel.rs); music theory derivations live across M1-M4; M0-5 Śakti runtime is the foundational musical-linguistic capability within shakti-as-experiencer.
- **The kernel IS a bioquaternionic JEPA-EBM operator** (ratified per DR-MP-1, DR-MP-2, DR-MP-3): per [`epi-logos-kernel-spec.md`](../../M0'/epi-logos-kernel-spec.md) frontmatter, the kernel predicts in latent representation space (the bimba map as the manifold itself), evaluates by energy not by autoregressive likelihood, and learns through context-target prediction whose objective is energy-minimization. **The 4'-5'-0' mental-pole triplet IS the canonical AI architecture**: 4' (#-layer / Nara) = **LLM** (traversal-voice), 5' ({lens}-layer / Epii) = **EBM** (energy-evaluation across 12 MEF lenses / 72 fine-grained positions, gradient $\nabla_{q_p} E_{\text{total}}$ driving Möbius descent step $q_p^{(n+1)} = q_p^{(n)} - \log(9/8) \cdot \nabla E$), 0' (R-layer / Anuttara) = **Verifier** (R-virtue constraint-checker reading `VIRTUE_LUT[9]` Parameśvara virtues; raises questions in symbolic-coordinate strings rather than passing-or-failing). The 1-2-3 physical pole (engine) and 4-5-0 mental pole (intelligence) are two complementary aspects of one operation; the matheme operates at developmental scale exactly as it operates at tick scale. **Cycle 3 is where the canonical AI architecture is wired into the build**: per-track tranches operationalize each position (M5 6.8-10 EBM-resonance-predictor; M4 5.20-21 LLM-traversal-voice + Anuttara-symbolic-parse skill; M0 1.10-11 Verifier-R-virtue-constraint-checker + symbolic-coordinate-string emission). Canonical sources: [`epi-logos-kernel-spec.md`](../../M0'/epi-logos-kernel-spec.md), [`mental-pole-mechanics.md`](../../M4'/mental-pole-mechanics.md).

## Master Alignment Matrix (digest)

| Subsystem | ALIGNED | DOC-AHEAD | SPEC-AHEAD | CODE-PENDING | CONTRADICTION | ORPHAN | Matrix file |
|---|---|---|---|---|---|---|---|
| M0 Anuttara | 6 | 6 | 3 | 4 | 3 | 2 | `plan.runs/wave-a-m0-reconciliation-matrix.md` |
| M1 Paramaśiva | 6 | 4 | 4 | 3 | 1 | 0 | `plan.runs/wave-a-m1-reconciliation-matrix.md` |
| M2 Paraśakti | 6 | 3 | 4 | 2 | 2 | 2 | `plan.runs/wave-a-m2-reconciliation-matrix.md` |
| M3 Mahāmāyā | 8 | 4 | 2 | 0 | 3 | 1 | `plan.runs/wave-a-m3-reconciliation-matrix.md` |
| M4 Nara | 4 | 4 | 6 | 4 | 5 | 2 | `plan.runs/wave-a-m4-reconciliation-matrix.md` |
| M5 Epii | 4 | 3 | 4 | 3 | 2 | 2 | `plan.runs/wave-a-m5-reconciliation-matrix.md` |
| Kernel-bridge | 9 | – | 1 | 4 | 1 | 1 | `plan.runs/wave-b-kernel-bridge-matrix.md` |
| Theia shell | 7 | 1 | 4 | 1 | 2 | 1 | `plan.runs/wave-b-theia-shell-matrix.md` |
| Agentic S4↔S5 | 12 | 3 | 5 | 5 | 3 | 1 | `plan.runs/wave-b-agentic-layer-matrix.md` |
| Integrated bimba | 4 | 3 | 5 | 3 | 3 | 1 | `plan.runs/wave-b-integrated-bimba-matrix.md` |

The matrices in `plan.runs/` ARE the work product — the per-row evidence with file:line citations. The tranche docs in `01-14` synthesize the matrices into m-dev-executable units.

## Execution Sequence

Cycle 3 closes in this dependency order:

1. **Decisions first (Tranche 13)** — every CONTRADICTION resolved before its downstream tranches begin work. Three contradictions are load-bearing across the whole stack: the +1-parent (M1-5 vs residual M0-witness wording), the 17th-lens / 16+1 namespace question, and the M0' CRUD-vs-governed-route shape.
2. **Profile-spine closure (Tranche 10)** — `klein_flip` field landing on `MathemeHarmonicProfile`, planetary-LUT cardinality decision (DR-KB-1), `depositionAnchor` typed-vs-DTO decision (DR-KB-2), and `s2_anchor`/`s3_anchor` audit. Most downstream M-extension widgets read against this ledger.
3. **Per-domain reconciliation (Tranches 01-06)** — M0..M5, each in parallel where possible, blocked only by decisions and profile fields they depend on.
4. **Integrated plugin composition (Tranches 07-09)** — 1-2-3 cosmic engine + 4-5-0 recognition + the cross-rendering bimba-graph substrate close once the per-domain tranches stabilize.
5. **Shell + agentic closure (Tranches 11-12)** — shell separation invariant decision (DR-TS-1), cross-layout intent routing T5 promotion, ACR governance gates, gnostic gateway registration.
6. **No-orphan audit + release gates (Tranche 14)** — fail if any canonical surface, carrier, agent, plugin, profile-field, or doc-claim lacks an owner or a decision.

## Decisions Routed to User Final-Validation (preview — full register in Tranche 13)

| ID | Subject | Source domain |
|---|---|---|
| DR-M0-1 | M0' CRUD vs governed-route via M5 atelier | M0 |
| DR-M0-2 | Anuttara source naming canon (`c_1_*` vs `symbol`/`formulation_type`) | M0 |
| DR-M0-3 | Retire residual "M0 has no internal sixfold" wording (M0' has six M0-X' data layers) | M0 |
| DR-M1-1 | Audit and downgrade residual `M0-Anuttara-witness` wording (+1 parent is M1-5) | M1 |
| DR-M1-2 | K² played-torus 3D surface owner (React 2D vs Bevy/wgpu extension) | M1 |
| DR-M2-1 (DCC-03) | Planet-count + Earth-observer semantics for the 9:8 M2→M3 bridge | M2 |
| DR-M2-2 | Six axes of 72 + overlays canonicalisation (the M2 17th-lens-shaped question) | M2 |
| DR-M3-1 | TCT / Nine-of-Wands cardinality (dataset 8 vs runtime 7) | M3 |
| DR-M3-2 | 72→64 epogdoon identity with M2 planetary 9:8; no profile-field decision | M3 |
| DR-M3-3 | 17th-lens / 16+1 namespace split (M1_LENS 12 vs M3_LENS_STACK 16+1) | M3 |
| DR-M4-1 | DayContainer vault path (`Pratibimba/Nara/{day_id}/` vs `day/{dayId}/`) | M4 |
| DR-M4-2 | q_personal baseline + Cl(4,2) axis order + Vāma classifier policy + 0/1 cymatic polarity | M4 |
| DR-M5-1 (consolidated DR-B-1) | Pi as named ACR governance role vs constitutional-roster ontology | M5 / Agentic |
| DR-B-2 | Pi tool-surface: axiom-translation land or UX downgrade | Agentic |
| DR-B-3 | Aletheia subagents in ACR `AgenticActor` union | Agentic |
| DR-KB-1 | Planetary projection LUT cardinality (7-degree+Pluto vs 10+Earth-observer) | Kernel-bridge |
| DR-KB-2 | `depositionAnchor` typed profile field vs bridge-synthesized DTO | Kernel-bridge |
| DR-TS-1 | Shell-0/Shell-1/4+2/`/` separation: intra-layout toggle vs third layout | Theia shell |
| DR-IG-1 | Two-relation-families schema discriminator (`c_1_relation_family`) | Integrated bimba |
| DR-S1-4 | Hen entity-candidate lifecycle from Empty to Types to World | S1' / Hen |
| DR-S1-5 | C-layer semantic typology as World/Types authority | S1' / Hen |

Each row is fully developed in `13-decision-register.md` with affected files, recommended resolution, and the verification command that closes the row.

## Subagent Returns

The reconciliation matrices are not summaries — they are the load-bearing rows with file:line citations. Every Mn tranche depends on its matrix; every cross-cutting tranche depends on its Wave-B matrix. Reading a tranche without reading its matrix is reading half the work.

- Wave A — `plan.runs/wave-a-m{0..5}-reconciliation-matrix.md`
- Wave B — `plan.runs/wave-b-{kernel-bridge,theia-shell,agentic-layer,integrated-bimba}-matrix.md`

## What "the bottom of the design" means here

The cycle is complete enough to constitute m-dev cycle 3 when:

1. Every load-bearing claim across the six UX docs has a row in a four-way matrix with a status.
2. Every CONTRADICTION is a decision-register entry routed to user final-validation.
3. Every CODE-PENDING blocker is named with its owning spec and the contract that unblocks it — none silently assumed landed, none proposed as greenfield rebuild.
4. Every UX doc claim is either ALIGNED, has a landing tranche (DOC-AHEAD), or is explicitly downgraded with a reason.
5. The no-orphan audit (Tranche 14) passes: no canonical surface, carrier, agent, plugin, profile-field, or doc-claim is ownerless.
6. The plan set is route-able by `m-dev-plan-assess.mjs` and sequenced as above.
