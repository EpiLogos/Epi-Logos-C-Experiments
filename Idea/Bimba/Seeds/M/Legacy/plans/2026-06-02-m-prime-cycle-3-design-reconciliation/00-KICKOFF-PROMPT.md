# M' Cycle 3 — Design Reconciliation Kickoff Prompt

> **How to use this file.** This is the controller prompt for a deep subagent run that *authors* the cycle-3 plan set. Paste the "Controller Mission" block into a fresh `/m-dev`-style session (or a workflow controller). The run does NOT write feature code — its deliverable is the **cycle-3 plan set itself**: a contradiction-resolved, gap-explicit, code-grounded set of tranches ready for subsequent `/m-dev` execution. Cycle 1 built the S-stack; cycle 2 owned the M' surfaces over landed substrate; **cycle 3 drives the pedagogical/UX design to the bottom against the real code and Theia substrate.**

---

## Controller Mission

```
You are the cycle-3 controller. Author the M' cycle-3 design-reconciliation plan set by
orchestrating subagents over four corpora and synthesising their findings into m-dev tranches.

This is a DESIGN-RECONCILIATION cycle, not a feature-build cycle. The work product is the
plan set (numbered tranche docs + ledger), not application code. You are getting the design
to the bottom: every UX claim traced to a spec, every spec traced to code/substrate/Theia,
every gap and contradiction named, every cycle-3 closing-tranche defined.

Read .codex/m-dev-subagent-brief.md for the shared subagent protocol. Honor the standing
invariants below. Stay NOW-bound. Trust the ledger. Cut ceremony. Real evidence, no theater.

Plan folder (this cycle):
  Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/
```

### Step 0 — NOW-bind and assess

```bash
epi agent session init            # if no active session
epi vault day-init                # if no daily note
node .codex/scripts/m-dev-plan-assess.mjs --route --write --json --require-now \
  Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation
```

Anchor all work in `Idea/Empty/Present/{DD-MM-YYYY}/{sessionId}/now.md`.

---

## The Four Corpora to Reconcile

The whole point is the **four-way trace**. For every load-bearing design claim, follow it across all four and classify it:

```
(1) UX DOC          (2) M' SEED SPEC        (3) CODE / SUBSTRATE        (4) THEIA SURFACE
the pedagogical      the canonical domain    what is actually landed     the extension/shell
intent we wrote      authority + companions  in Body/S and Body/M        that renders it
```

### Corpus 1 — The six pedagogical/UX branch docs (the intent)

```
Idea/Pratibimba/System/Subsystems/Anuttara/anuttara-ux-full-m0-branch.md
Idea/Pratibimba/System/Subsystems/Paramasiva/paramasiva-ux-full-m1-branch.md
Idea/Pratibimba/System/Subsystems/Parashakti/parashakti-ux-full-m2-branch.md
Idea/Pratibimba/System/Subsystems/Mahamaya/mahamaya-ux-full-m3-branch.md
Idea/Pratibimba/System/Subsystems/Nara/nara-ux-full-m4-branch-update.md
Idea/Pratibimba/System/Subsystems/epii/epii-ux-full-m5-branch.md
```

### Corpus 2 — The M' Seed specs (the authority) + companions

```
Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md, M'-PORTAL-SPEC.md, M'-TAURI-PORT-SPEC.md
Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md   (+ Legacy/specs anuttara-language-architecture; m0-prime-anuttara-research)
Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md   (+ m1-prime-paramasiva-instrument; m1-prime-audio-generative-research)
Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md   (+ m2-prime-parashakti-cymatic-engine; m2-prime-frequency-meaning-research)
Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md   (+ m3-prime-symbolic-transcription-research; alpha_rasa_bridge_ql)
Idea/Bimba/Seeds/M/M4'/M4'-SPEC.md   (+ m4-prime-psychoid-cymatic-field-engine; nara-day-episodes-and-oracle-artifacts)
Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md   (+ m5-prime-system-shape-and-tauri-ide-canon; epii-operational-capacities/*)
Idea/Bimba/Seeds/M/alpha_quaternionic_integration_across_M_stack.md
Idea/Bimba/Map/datasets/anuttara-deep/anuttara-language-map.md   (M0 content language)
```

### Corpus 3 — The landed code / substrate (the truth)

```
Body/S/S0/epi-lib/**            (m0.h/m1.h/m2.h/m3.h + .c; the .rodata LUTs, invariants)
Body/S/S0/portal-core/**        (harmonic_profile.rs, kernel.rs, parashakti/vimarsha_reading.rs,
                                 codon_rotation_projection.rs, hopf.rs, quaternion.rs, spanda.rs)
Body/S/S2/graph-schema/**, graph-services/**   (relation + property registries; seed law)
Body/S/S3/gateway**, graphiti-runtime, epi-spacetime-module, redis-context
Body/S/S4/ta-onta/**, pi-agent/**, plugins/pleroma/capability-matrix.json
Body/S/S5/epii-*/**, epi-gnostic/**, epi-kbase/**, plugins/**
Neo4j bimba map (via graph-services; ~2000 nodes, M0-M5 branches, the two relation families)
```

### Corpus 4 — The Theia substrate (the surface)

```
Body/M/epi-theia/extensions/{m0-anuttara,m1-paramasiva,m2-parashakti,m3-mahamaya,m4-nara,m5-epii}/**
Body/M/epi-theia/extensions/{kernel-bridge,kernel-bridge-readiness,ide-shell-m0-m5,
                             integrated-composition,contracts}/**
Body/M/epi-theia/extensions/plugin-integrated-1-2-3/**, plugin-integrated-4-5-0/**
Body/M/epi-theia/theia-app/**, shared/**
Idea/Pratibimba/System/extensions/**   (design-surface mirror)
```

### Reference — cycle-2 plan set (what's planned/landed/pending; DO NOT redo)

```
Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-2-canonical/**
  (00 overview, 01 shell, 02-07 subsystems, 08-09 integrated plugins,
   10 ta-onta/agents/aletheia, 11-12 substrate closure, 13 gateway methods, 14 open decisions)
```

---

## The Reconciliation Method (every subagent applies this)

For each load-bearing claim in your domain, produce a row in a **4-way alignment matrix**:

```
| Claim (UX doc) | Spec authority (M' Seed) | Code/substrate evidence | Theia surface | Status |
```

Status is one of:
- **ALIGNED** — doc ↔ spec ↔ code ↔ Theia all agree; nothing to do but note it.
- **DOC-AHEAD** — UX doc asserts intent the spec/code doesn't yet carry → cycle-3 tranche to land it (or downgrade the doc claim).
- **SPEC-AHEAD** — spec defines a contract the Theia surface doesn't consume yet → integration tranche.
- **CODE-PENDING** — the kernel/profile/graph contract is a known `pending-*` / blocker → name it, classify as substrate gap (anti-greenfield: do NOT propose rebuild).
- **CONTRADICTION** — two sources disagree (e.g. the `+1` parent M0-vs-M1 wording; the "17th lens"; TCT/Nine-of-Wands; 72→64 uniqueness; the 72-invariant/six-axes framing) → decision-register entry for cycle-3.
- **ORPHAN** — a canonical surface/carrier/agent with no owner → no-orphan finding.

**Anti-greenfield rule (binding):** `Body/S/S0`–`S5`, `Idea/Pratibimba/System`, and `Body/M/epi-tauri` are landed/consumed substrate. Any tranche touching them must be phrased `consume as-is`, `audit/verify`, or `extend` — first-build ownership is only for an M' product surface, a named carrier/agent/subagent owner, a method-routing closure, or a concrete named integration blocker.

---

## Agent Fan-Out

Dispatch in two waves. Each subagent reads `.codex/m-dev-subagent-brief.md` first, owns a disjoint read/write scope, and returns the 4-way matrix + gaps + contradictions + proposed cycle-3 tranches (≤200 words prose + the matrix).

### Wave A — six subsystem reconciliation agents (parallel; disjoint scopes)

For each of M0…M5, one agent:

```
Owner: <id>. Mission: reconcile the <Mn> branch across all four corpora.
Read scope:
  - Corpus 1: the Mn UX branch doc
  - Corpus 2: Mn'-SPEC + its companions
  - Corpus 3: the Body/S substrate Mn consumes (name the specific files from the spec's
    "Canonical Substrate Anchors") + the Neo4j Mn-branch data
  - Corpus 4: the Body/M/epi-theia/extensions/mN-* extension + its contract
  - Reference: the cycle-2 tranches that own Mn (02.* M0, 03.* M1, 04.* M2, 05.* M3, 06.* M4, 07.* M5)
Return: 4-way alignment matrix; DOC-AHEAD / SPEC-AHEAD / CODE-PENDING / CONTRADICTION /
  ORPHAN findings; proposed cycle-3 tranches for this subsystem (id, deliverable, verification).
Specific lens: does the UX doc's pedagogical intent have a real contract + surface, or is it
  aspirational? What is the minimum cycle-3 work to make the doc true?
```

### Wave B — four cross-cutting agents (after Wave A; they consume Wave A findings)

1. **Kernel-bridge / profile-contract agent.** The shared data spine every M' surface depends on:
   `MathemeHarmonicProfile`, the M2-1' audio bus (`audio_octet[8]`/`nodal_quartet[4]`), the
   84-state `(lens,mode)`, the 72-invariant + six axes, the 472-state `codonRotationProjection`,
   `resonance72`, `kleinFlipState`. Where do these live, what's `pending`, what blocks readiness?
   This is where most CODE-PENDING blockers concentrate. Return the profile-field readiness ledger.
2. **Theia shell / substrate agent.** epi-theia shell, kernel-bridge, the `0/1` vs `4+2` vs `/`
   separation invariant, the two integrated plugins (1-2-3 cosmic engine, 4-5-0 recognition),
   extension-contract preflight. Does the shell host the six surfaces + two plugins as the docs
   describe? Map surface→extension→contract.
3. **Agentic layer agent (S4↔S5).** ta-onta carriers (Khora/Hen/Pleroma/Chronos/Anima/Aletheia),
   constitutional agents, Aletheia subagents, the Agentic Control Room (M5-4), the gnostic/kbase
   RAG, canon-as-context. Verify the S4↔S5 shared-intelligence seam the Epii/Nara docs assert.
   No carrier/agent/subagent may be ambient (inherit the cycle-2 no-ambient registry).
4. **Integrated-bimba-graph agent.** The M0' six data-layers, the one-substrate/three-rendering
   architecture, the solar-anchor design principle, the Neo4j relation-web (structural +
   correspondential families), image-assets-on-nodes, full-CRUD-under-governance. Does the graph
   substrate (S2) support the six-layer engagement system the Anuttara doc describes?

---

## Synthesis → the Cycle-3 Plan Set (controller deliverable)

Compose the Wave A + Wave B returns into the cycle-3 plan set in the m-dev tranche format,
written to the plan folder. Structure:

```
00-overview-and-design-reconciliation.md   framing; the 4-way method; anti-greenfield stance;
                                            the master alignment matrix; the execution sequence
01-09  per-domain reconciliation tranches   one track per subsystem (M0-M5) + integrated plugins,
                                            each: DOC-AHEAD landing tranches, SPEC-AHEAD integration
                                            tranches, CODE-PENDING blockers (classified, not rebuilt)
10     kernel-bridge / profile-contract     the shared-spine readiness ledger + closing tranches
11     theia-shell / surface-hosting        surface→extension→contract closure; 0/1·4+2·/ guard
12     agentic-layer (S4↔S5) ownership       carrier/agent/subagent owners; ACR; gnostic seam
13     decision register                     every CONTRADICTION as an explicit decision needing
                                            user final-validation (the +1 parent, 17th lens,
                                            72→64 uniqueness, TCT/Nine-of-Wands, etc.)
14     no-orphan audit + release gates       fail if any canonical surface/carrier/agent/contract
                                            or doc-claim lacks an owner or a decision
```

Each tranche carries: canonical source(s), `Cycle 2 substrate inheritance:` line, deliverables,
and **real verification commands** (cargo check on named crates; extension presence in
`Body/M/epi-theia/extensions/`; profile-field presence; graph query; contract test). The
reconciliation matrices themselves are deliverable docs → write to
`<plan_folder>/plan.runs/<task-id>-reconciliation-matrix.md` (the matrix IS the work product).

After authoring, register the ledger:

```bash
node .codex/scripts/m-dev-plan-assess.mjs --reset --write --json \
  Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation
```

---

## Standing Invariants (already true — honor, don't re-derive)

- S0 is the membrane (CLI/process/adapter). S1–S5 own service law.
- `/pratibimba/system` + `Body/M/epi-theia` is the M' Theia shell authority. `Body/M/epi-tauri` is deprecated migration-source only.
- The coordinate system is the modular system; convenience residency never overrides coordinate ownership.
- `Idea/Bimba/Seeds/**/Legacy` is canonical home for migrated specs/plans; new load-bearing specs live in the owning Seed coordinate.
- The matheme spine is `M1 (+1) → M2 (72) → M3 (64)`; the `+1` parent is M1-5, not M0 (flag residual M0-witness wording as a CONTRADICTION, don't propagate it).
- The 72 is **one invariant, six addressing-axes** (MEF×QL · tattva · decan · Shem angels · maqam · planetary) — this is the resolved framing the cycle-3 plan adopts.
- The shell separation is load-bearing: shell `0` (cosmic 1-2-3) · shell `1` (personal 4-5-0 + flow-writing) · `4+2` depth · `/` OmniPanel — never collapse them.
- Cl(4,2) runs at four scales (M1 ring · M3 codon · M4 personal · Kerykeion natal) — the binding thread; verify it is one algebra in code, not four.

---

## What "the bottom of the design" means for the exit criteria

The cycle is complete enough to constitute m-dev cycle 3 when:

1. Every load-bearing claim across the six UX docs has a row in a 4-way matrix with a status.
2. Every CONTRADICTION is a decision-register entry routed to user final-validation (per the ur-process: Human = Ontological Vision + Final Validation).
3. Every CODE-PENDING blocker is named with its owning spec and the contract that unblocks it — none silently assumed landed, none proposed as greenfield rebuild.
4. Every UX doc claim is either ALIGNED, has a landing tranche (DOC-AHEAD), or is explicitly downgraded with a reason.
5. The no-orphan audit passes: no canonical surface, carrier, agent, plugin, profile-field, or doc-claim is ownerless.
6. The plan set is route-able by `m-dev-plan-assess.mjs` and sequenced (subsystem reconciliation → cross-cutting closure → decisions → no-orphan gate).
```
