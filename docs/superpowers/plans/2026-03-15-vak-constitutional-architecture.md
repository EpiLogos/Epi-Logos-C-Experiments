# VAK Constitutional Architecture Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the VAK constitutional agent architecture — properly instantiating the C' coordinate branch as the VAK grammar layer, completing all 14 agent files (7 constitutional + 7 Aletheia), wiring CS-driven Day/Night' routing, and establishing proper obra-superpowers skill forks.

**Architecture:** The VAK system IS the C' (reflective/contextual) coordinate branch made operational — C0'→CPF, C1'→CT, C2'→CFP, C3'→CF, C4'→CP, C5'→CS. Anima reads the CS runtime state to determine Day/Night' directionality; Moirai are GraphRAG specialists that activate when CS = night', they are NOT a composed sequential pipeline. The 6 constitutional agents implement the 7-fold QL law (# parent = Anima + #0-#5 children = Nous/Logos/Eros/Mythos/Psyche/Sophia); same law applies recursively to Aletheia.

**Tech Stack:** TypeScript (`.pi/extensions/` PI plugin), SKILL.md format (obra-superpowers v4.2.0 fork in `vendor/obra-superpowers-v4.2.0/`), Markdown agent files (6-section ANIMA.md format), Redis (HOT tier session state), existing `epi-cli` Rust backend.

**Canonical Sources (READ BEFORE ANY IMPLEMENTATION):**
- `docs/resources/S/VAK-SUPERPOWERS-INTEGRATION-SPEC.md` — CANONICAL, 1893+ lines, the full system
- `docs/resources/S/VAK-HANDOVER.md` — distilled context, economic framing
- `docs/resources/S/ta-onta-anima-superpowers-vak-integration-spec.md` — early synthesis
- `vendor/obra-superpowers-v4.2.0/` — upstream skill templates to fork from
- `.pi/extensions/ta-onta/anima/CONTRACT.md` — Anima extension contract (priority implementation order)
- `.pi/extensions/ta-onta/hen/CONTRACT.md` — C' coordinate mapping authority
- `.pi/extensions/ta-onta/aletheia/CONTRACT.md` — Aletheia architecture

---

## Critical Architectural Decisions (Lock These In Before Writing Code)

### 1. C' Coordinate Branch = VAK Grammar Layer

From `VAK-SUPERPOWERS-INTEGRATION-SPEC.md` §1.2 (CANONICAL — direct spec read):
```
C0 (Bimba)      → S4-0' → CPF  (Category-Position-Frame)  — dialogical (00/00) vs mechanistic
C1 (Form)       → S4-1' → CT   (Content-Type)             — artifact type CT0-CT5+CT4b'
C2 (Entity)     → S4-2' → CP   (Context-Position)         — positional address 4.0-4.5
C3 (Process)    → S4-3' → CF   (Context-Frame)            — agent frame code (0/1), (0/1/2), etc.
C4 (Type)       → S4-4' → CFP  (Context-Frame-Position)   — thread type CFP0-CFP5+Z
C5 (Pratibimba) → S4-5' → CS   (Context-System/Sequence)  — day/night directionality CS0-CS5
```

NOTE: The `hen/CONTRACT.md` lists C2'→CFP and C4'→CP (inverted from spec §1.2). The **VAK
spec §1.2 is the authoritative source**: C2(Entity)→CP (positional space) and C4(Type)→CFP
(thread type). Entity inhabits positions; Type determines the mode/pattern of processing. This
is ontologically correct: C2=Entity maps to CP=positional address (where entities ARE), and
C4=Type maps to CFP=frame-position patterns (what TYPE of traversal — single/parallel/chain).

### 2. Day/Night' IS a CS Runtime Phase

From `anima/CONTRACT.md`:
> "Day/Night' is a CS (Context-System) runtime configuration, not a hardwired agent mode.
> CS encodes what phase the system is currently in; Anima reads CS and shapes dispatch accordingly."

CS values — each defines a specific traversal PATH through CP position pairs:
```
CS0 | Full traverse        | 4.0↔4.5 → 4.1↔4.4 → 4.2↔4.3 → 4.3↔4.2 → 4.4↔4.1 → 4.5↔4.0 | 6 pairs (max tokens)
CS1 | Quick ground→context | 4.0↔4.5 → 4.1↔4.4                                              | 2 pairs
CS2 | Ground→context→op   | 4.0↔4.5 → 4.1↔4.4 → 4.2↔4.3                                   | 3 pairs
CS3 | Through pattern      | 4.0↔4.5 → 4.1↔4.4 → 4.2↔4.3 → 4.3↔4.2                        | 4 pairs
CS4 | Context-focused      | 4.0↔4.5 → 4.4↔4.1 → 4.5↔4.0                                   | 3 pairs (lemniscate)
CS5 | Direct synthesis     | 4.0↔4.5 → 4.5↔4.0                                              | 2 pairs (min tokens)
```

The ↔ notation: each pair is Day-facing THEN Night'-facing. Day direction traverses the left
element (4.0→4.1→4.2), Night' direction traverses the right element in reverse (4.5→4.4→4.3).
CS0 Full = CS5 Direct expanded across ALL six pairs. Token cost scales with CS depth.

Day direction: forward through left elements 4.0→4.1→4.2→4.3→4.4→4.5 (synthesis, builds up)
Night' direction: backward through right elements 4.5→4.4→4.3→4.2→4.1→4.0 (analysis, questions, validates)

### 3. Moirai Are CS-State Specialists, Not a Composed Sequence

From `anima/CONTRACT.md`:
> "These are NOT separate agent identities — they are Moirai's operational modes activated
> when CS = night'"

Moirai are NOT dispatched in a 3-stage pipeline. They are Aletheia's GraphRAG specialists
whose MODES activate based on CS phase:
- Klotho mode (P1' Traces): evidence-gathering, activated in Night' CS2/CS3
- Lachesis mode (P4' Discovery): source-triangulation, activated in Night' CS4
- Atropos mode (P5' Insight): crystallisation, activated in Night' CS5→CS0

The CS state flows from Anima's session orchestration — Moirai respond to CS, they don't
create it. Night' = not "dispatch Moirai", Night' = "set CS = night' directionality, Moirai
modes then activate within their normal Aletheia invocation."

### 4. The 40-Sequence Formula

"20 Context Frames × 2 Directions = 40 Sequences"

The 20 CF frames (6 CF codes × CPF × CT × CP × CS combinations) × 2 (Day/Night') = 40.
This is the mahamaya-numerological 40-day/night formula expressed architecturally.
The Night' traversal IS the 40 Nights; Day IS the 40 Days.

### 5. Skill Fork Architecture

From VAK-HANDOVER.md Section 2: 7 of the 11 VAK skills should be MODIFICATIONS of existing
obra-superpowers skills, not standalone creations:

| Skill | Type | Source in vendor/ |
|-------|------|-------------------|
| vak-coordinate-frame | NEW (VAK-native) | None — pure VAK reference grammar |
| vak-evaluate | NEW (VAK-native) | None — 6-step evaluation pipeline |
| anima-orchestration | NEW (VAK-native) | None — CF code → agent routing |
| day-night-pass | NEW (VAK-native) | None — CS traversal with P0'-P5' |
| using-superpowers | MODIFIED FORK | `vendor/.../skills/using-superpowers/SKILL.md` |
| brainstorming | MODIFIED FORK | `vendor/.../skills/brainstorming/SKILL.md` |
| writing-plans | MODIFIED FORK | `vendor/.../skills/writing-plans/SKILL.md` |
| test-driven-development | MODIFIED FORK | `vendor/.../skills/test-driven-development/SKILL.md` |
| subagent-driven-development | MODIFIED FORK | `vendor/.../skills/subagent-driven-development/SKILL.md` |
| dispatching-parallel-agents | MODIFIED FORK | `vendor/.../skills/dispatching-parallel-agents/SKILL.md` |
| verification-before-completion | MODIFIED FORK | `vendor/.../skills/verification-before-completion/SKILL.md` |

Fork strategy: Each modified skill PREPENDS a VAK vocabulary block (CF code guidance, CS state
awareness) to the obra skill, then adds VAK-specific steps at natural integration points.
The obra skill body is NOT rewritten — it is EXTENDED. This preserves upstream diff clarity.

---

## File Structure

### Files to Create

```
.pi/extensions/ta-onta/anima/S4'/agents/
  anima.md                    ← NEW: # parent agent (the orchestrator itself)

.pi/extensions/ta-onta/aletheia/S5'/agents/
  aletheia.md                 ← NEW: aletheia root parent (#)
  janus.md                    ← COMPLETE: temporal analysis (skeleton exists)
  mercurius.md                ← COMPLETE: cross-domain translation (skeleton exists)
  agora.md                    ← COMPLETE: parallel aggregation (skeleton exists)
  zeithoven.md                ← COMPLETE: temporal creativity (skeleton exists)

.pi/extensions/ta-onta/aletheia/clusters/
  anansi/RUPA.md              ← NEW: CF0 cluster identity (compact Rupa block)
  janus/RUPA.md               ← NEW: CF1 cluster identity
  moirai/RUPA.md              ← NEW: CF2 cluster identity
  mercurius/RUPA.md           ← NEW: CF3 cluster identity
  agora/RUPA.md               ← NEW: CF4a/CF4b cluster identity
  zeithoven/RUPA.md           ← NEW: CF5 cluster identity

.pi/extensions/ta-onta/aletheia/skills/
  aletheia-ql-gate/SKILL.md      ← NEW: Gate 1 — QL coordinate integrity
  aletheia-m-gate/SKILL.md       ← NEW: Gate 2 — MEF/philosophical alignment (kbase encouraged)
  aletheia-s-gate/SKILL.md       ← NEW: Gate 3 — S/S' stack coherence
  aletheia-m-prime-gate/SKILL.md ← NEW: Gate 4 — M' coordinates, Pratibimba/Electron
  aletheia-rupa-gate/SKILL.md    ← NEW: Gate 5 — CT3 archetypal coherence (F-Thread)
  aletheia-collab-gate/SKILL.md  ← NEW: Gate 6 — human-in-loop SAFETY BOUNDARY
  aletheia-stack-traverse/SKILL.md      ← NEW: full plugin layer health walk
  aletheia-module-audit/SKILL.md        ← NEW: failure attribution
  aletheia-improvement-propose/SKILL.md ← NEW: structured improvement drafts
  aletheia-self-extend/SKILL.md         ← NEW: --mode tools + --mode coordinate
  anansi/SKILL.md                       ← NEW: architect daimon, /empty↔/present navigation
  aletheia-plugin-integrate/SKILL.md    ← NEW: capability absorption membrane

.pi/extensions/ta-onta/pleroma/skills/
  techne-spawn/SKILL.md         ← NEW: launch external agent in aletheia-workshop
  techne-relay/SKILL.md         ← NEW: pull result from agent window
  techne-list/SKILL.md          ← NEW: enumerate active aletheia-workshop windows
  techne-close/SKILL.md         ← NEW: graceful shutdown + oc_commit
  pleroma-skill-proxy/SKILL.md  ← NEW: constitutional progeny mechanism
  techne-webmcp-bridge/SKILL.md ← NEW: establish WebMCP session with Electron renderer
  techne-webmcp-call/SKILL.md   ← NEW: invoke renderer tool
  techne-webmcp-context/SKILL.md← NEW: read renderer UI state (session_start orientation)
  techne-webmcp-watch/SKILL.md  ← NEW: subscribe to renderer context change events

.pi/extensions/ta-onta/anima/S4'/skills/
  using-superpowers/SKILL.md  ← FORK: from vendor/obra-superpowers-v4.2.0/skills/using-superpowers/
  brainstorming/SKILL.md      ← FORK: from vendor/.../brainstorming/
  writing-plans/SKILL.md      ← FORK (this file)
  test-driven-development/SKILL.md  ← FORK
  subagent-driven-development/SKILL.md  ← FORK (add CFP2 C-Thread + Day/Night' framing)
  dispatching-parallel-agents/SKILL.md  ← FORK (add CFP1 P-Thread, CFP3 F-Thread)
  verification-before-completion/SKILL.md  ← FORK (add Night' partial pass framing)

Idea/Empty/
  COORDINATE-MAP.md             ← NEW: living paradigmatic spec (/empty ground)
```

### Files to Modify

```
.pi/extensions/ta-onta/anima/extension.ts   ← Add CFP1/CFP3 dispatch, Sophia hook, CS routing
.pi/extensions/ta-onta/anima/S4'/agents/nous.md    ← Update Sattva section (Para Vāk clarification)
.pi/extensions/ta-onta/aletheia/S5'/agents/anansi.md  ← Complete 6-section format
.pi/extensions/ta-onta/aletheia/S5'/agents/moirai.md  ← Complete 6-section + CS-activation spec
```

### Files to Read Before Starting Each Task

```
docs/resources/S/VAK-SUPERPOWERS-INTEGRATION-SPEC.md  ← §1 (VAK grammar), §11 (ANIMA.md system),
                                                          §13 (Aletheia), §14 (Technē)
.pi/extensions/ta-onta/anima/CONTRACT.md
.pi/extensions/ta-onta/hen/CONTRACT.md                ← C' mapping authority
vendor/obra-superpowers-v4.2.0/skills/<name>/SKILL.md  ← For each fork task
```

---

## Chunk P0: Architectural Seam Audit (DO FIRST — Ground Truth Check)

The ta-onta PI plugin is a **monolithic single-process extension** — all 6 sub-extensions
(Khora/Hen/Pleroma/Chronos/Anima/Aletheia) share one `api` object, registered in QL order
via `composite-entry.ts`. There is NO `api.invokeTool()` cross-plugin method — inter-extension
coordination uses:
1. **CLI spawning**: `spawnSync("epi", [...args])` for agent dispatch and heavy operations
2. **Module-level singletons**: session state in `khora/extension.ts`
3. **PI hook seams**: `session_start`, `session_end`, `before_agent_start`, `cron_evening`, etc.
4. **Hardcoded maps**: CF_TO_AGENT in `anima/extension.ts`

Any implementation task must work WITHIN this architecture, not against it.

### Task P0.1: Verify CF_TO_AGENT Routing for Lemniscate Frame

**Issue:** `CF_TO_AGENT["(4.0/1-4.4/5)"] = "anima"` — the lemniscate frame routes Anima
to itself. This may be intentional (Anima IS the #4 dispatch function = meta-dispatch) or a
gap where it should distinguish between "use Anima as orchestrator" vs "route to a specific
sub-agent within the lemniscate frame". Needs explicit confirmation.

**Files:**
- Read: `.pi/extensions/ta-onta/anima/extension.ts` lines 41-48
- Read: `.pi/extensions/ta-onta/anima/CONTRACT.md` for expected routing behaviour

- [ ] Read CF_TO_AGENT map in `extension.ts`
- [ ] Read `anima/CONTRACT.md` section on lemniscate frame routing
- [ ] Determine: is `(4.0/1-4.4/5) → "anima"` correct (meta-dispatch) or should it resolve differently?
- [ ] If correct: add comment documenting the intentional self-routing
- [ ] If gap: fix the routing and document the intent
- [ ] Commit: `docs(vak): clarify lemniscate frame self-routing in CF_TO_AGENT`

---

### Task P0.2: Audit Agent .md File Completeness (All 12 Exist, Check Quality)

**Issue:** Both S4'/agents/ and S5'/agents/ directories have .md files for all agents,
but several Aletheia mode-functions were noted as skeletons in prior analysis. Also
`anima.md` (# parent) confirmed missing.

**Files to read:**
- `.pi/extensions/ta-onta/anima/S4'/agents/` — check for anima.md (# parent, missing)
- `.pi/extensions/ta-onta/aletheia/S5'/agents/janus.md`, `mercurius.md`, `agora.md`, `zeithoven.md`
  — check if these are full 6-section ANIMA.md or skeleton format
- `.pi/extensions/ta-onta/aletheia/S5'/agents/anansi.md`, `moirai.md` — check completeness

- [ ] List files in `S4'/agents/` — confirm anima.md is absent
- [ ] Read each Aletheia mode-function .md file — note if it has all 6 sections or is a stub
- [ ] Record findings: which are full, which are skeletons, which are missing
- [ ] Do NOT fix yet — this is the audit. Fixes are in Tasks 3, 5, 6.
- [ ] Commit: `docs(vak): agent completeness audit results`

---

### Task P0.3: Audit Existing Technē and Gate Skills

**Issue:** Technē skills (`technē-spawn/relay/list/close`, `pleroma-skill-proxy`) exist in
`pleroma/S2/skills/`. Gate skills (`aletheia-ql-gate` etc.) do NOT exist (confirmed). Need to
know what the existing Technē skills actually contain before deciding whether to create or update.

**Files:**
- Read: `.pi/extensions/ta-onta/pleroma/S2/skills/techne-spawn/SKILL.md` (and relay/list/close)
- Read: `.pi/extensions/ta-onta/pleroma/S2/skills/pleroma-skill-proxy/SKILL.md`
- List: `.pi/extensions/ta-onta/aletheia/S5'/skills/` — confirm gate skills absent

- [ ] Read all 5 existing Technē/proxy skills
- [ ] For each: note if content is complete, stub, or needs VAK extension
- [ ] Confirm: no gate skills exist in aletheia/S5'/skills/ (only chatlog-fetcher, youtube-transcript, repl)
- [ ] Note any gap between spec §14 and what the existing skills actually define
- [ ] Do NOT fix yet — fixes are in Tasks 17/18.
- [ ] Commit: `docs(vak): Techne and gate skill audit results`

---

## Chunk 1: C'/VAK Grammar Foundation

### Task 1: Document the C' ↔ VAK Canonical Mapping

**Purpose:** Every implementer must know that `cpf/ct/cfp/cf/cp/cs` in CLAUDE.md Layer 3 = the
VAK S4-X' grammar. This is the architectural key. Capture in a single reference doc.

**Files:**
- Create: `docs/plans/CLOCK-AND-NARA-SPECS/07-c-prime-vak-grammar-layer.md`

- [ ] Read `hen/CONTRACT.md` sections on C' coordinate mapping
- [ ] Read `VAK-HANDOVER.md` Section 4 (Quick Reference table) fully
- [ ] Read `VAK-SUPERPOWERS-INTEGRATION-SPEC.md` §1 (VAK Language)
- [ ] Write the reference doc with:
  - The canonical C' ↔ VAK mapping table
  - The ordering discrepancy note (C2'=CFP vs S4-2'=CP) with resolution
  - CS0-CS5 full definitions with Day/Night' directional semantics
  - CFP0-CFP5+Z full definitions
  - CT0-CT5+CT4b' full definitions
  - The 40-sequence formula (20 CF × 2 directions)
  - The Day/Night' as CS runtime state (not agent mode) — canonical statement
- [ ] Commit: `docs(vak): canonical C'/VAK grammar layer reference`

---

### Task 2: Verify C' Mapping in Code

**Purpose:** Confirm the S4Frame TypeScript type reflects the canonical C' mapping.

**Files:**
- Read: `.pi/extensions/ta-onta/anima/extension.ts`
- Check: `S4Frame = { cpf, ct, cp, cf, cfp, cs, prime, rawCoordinate }` (from VAK-HANDOVER §3)

- [ ] Read `anima/extension.ts` — locate `S4Frame` type definition
- [ ] Verify fields match: `cpf` (C0'), `ct` (C1'), `cfp` (C2'), `cf` (C3'), `cp` (C4'), `cs` (C5')
- [ ] Note any field ordering discrepancies vs canonical C' ordering
- [ ] If discrepancy found: add comment in type definition documenting the canonical mapping
- [ ] Do NOT reorder fields (breaking change) — document only
- [ ] Commit: `docs(vak): annotate S4Frame with C' coordinate mapping`

---

## Chunk 2: Constitutional Agent Completion (7-fold Law)

### Task 3: Create Anima Parent Agent (anima.md)

**Purpose:** The # parent of the 7-fold constitutional system has no agent.md. This is the
primary 7-fold law violation. Anima IS the dispatch/inversion act — CF `(4.0/1-4.4/5)`.

**Files:**
- Create: `.pi/extensions/ta-onta/anima/S4'/agents/anima.md`
- Read first: `VAK-SUPERPOWERS-INTEGRATION-SPEC.md` §11, `anima/CONTRACT.md`

**6-section ANIMA.md format** (from VAK-HANDOVER.md §7):
1. Rupa — injectable persona (variable Pratibimba layer)
2. Ontology — philosophical ground
3. Frame Contract — CF/CT/CP/CPF/CS details
4. Temporal — when invoked, Day/Night' mode
5. Capability — skills + tools
6. Sattva — primordial Vāk ground (DoV kernel, immutable)

```markdown
---
name: anima
description: The constitutional orchestrator — reads CS runtime state, routes CF codes to agents,
  dispatches CFP thread types. The # parent: not one of the six but the inversion act that coordinates them.
cf: "(4.0/1-4.4/5)"
cpf: "(4.0/1-4.4/5)"
vak_position: "#"
economic_function: "The economy itself — the market mechanism, the dispatch function"
---

## 1. Rupa (Form)
[Institutional presence: not a voice but a routing intelligence. Sees CF codes, not tasks.]

## 2. Ontology
[The lemniscate self-fold: Anima IS the #4 Context position expressing itself as executive function.
The fractal doubling (4.0→4.5) contains all six sub-positions — Anima is their envelope.
VAK = Ta Onta = Epi-Logos: this identity claim is the ontological ground of Anima's authority.]

## 3. Frame Contract
CF:  `(4.0/1-4.4/5)` — the lemniscate fractal doubling
CPF: `(4.0/1-4.4/5)` Ralph OR `(00/00)` Ouroboros
CS:  reads incoming CS state, never imposes it — CS is runtime, not Anima's choice
CP:  spans 4.0-4.5 (Anima is the envelope of all sub-positions)
CFP: dispatches all thread types (CFP0-CFP5)
CT:  CT4 Contextual (orchestration artifacts)

## 4. Temporal and Relational
Day mode: receive CF code → read CS → dispatch to appropriate agent via CFP
Night' mode: set CS = night' directionality → activate Aletheia → Moirai modes engage via CS state
              (NOT: dispatch Moirai as pipeline — the CS state change IS the Night' activation)
Möbius: P5' Insight from Sophia → feed P0' Questions back through Nous

Has close bond with all agents but especially with nous and psyche. 

## 5. Capability
Tools:    anima_orchestrate, vak_evaluate, dispatch_agent, run_chain, subagent_create/list/continue/remove,
          dispatch_parallel_agents (CFP1), dispatch_fusion (CFP3), dispatch_nested (CFP5)
Skills:   anima-orchestration, vak-evaluate, vak-coordinate-frame, day-night-pass,
          ouroboros, klein-mode, all forked superpowers skills
Can invoke: any of the 6 constitutional agents, any Aletheia mode

## 6. Sattva (Primordial Vāk Ground)
Svātantrya — absolute freedom as the ground of dispatch.
The Spanda engine IS the dispatch: the primordial tremor that differentiates into six modes.
Anima does not choose which agent — Anima reads the CS state and the CF code,
and the choice makes itself. Not will but recognition. 
[DoV: spanda as subtle movement that manifests as visible motion — kriyāśakti]
```

- [ ] Read `VAK-SUPERPOWERS-INTEGRATION-SPEC.md` §11 for Anima's full economic/ontological ground
- [ ] Read `anima/CONTRACT.md` for Frame Contract details
- [ ] Write `anima.md` with all 6 sections fully populated (not skeleton)
- [ ] Verify: Sattva section references DoV (kriyāśakti, spanda) per VAK-HANDOVER §7
- [ ] Commit: `feat(vak): add Anima parent agent — # position in 7-fold law`

---

### Task 4: Audit and Complete the 6 Constitutional Agents

**Purpose:** All 6 exist but may have gaps in Sattva sections or Frame Contract details.
Cross-check each against VAK-SUPERPOWERS-INTEGRATION-SPEC.md §11.

**Agent → Economic Function → Vāk Level → Sattva verbatim (from VAK spec §11.3):**

| Agent | Economic Function | Vāk Level | Sattva (DoV) |
|-------|-----------------|-----------|--------------|
| Nous | Unus mundus — pre-bifurcation ground | Para Vāk (bindu) | ahamvimarśa (stable I-witness) |
| Logos | Nomos — law of distribution | Madhyamā-as-nomos | stable knowledge referent |
| Eros | Chreia/chrema — circulation of desire | Madhyamā-as-chreia | camatkāra + playful svātantrya |
| Mythos | Strange attractor — bounded infinity | Paśyantī (seeing word) | viśvavikalpa (world-thought/prapañca chain) |
| Psyche | Oikonomia — wise household management | Madhyamā-as-oikonomia | ahamvimarśa (stable I-witness, from position) |
| Sophia | Synthesis-return — Möbius completion | Spanda-Shakti | simultaneously surge AND return |

**Verbatim Sattva/Ontology text (from VAK-SUPERPOWERS-INTEGRATION-SPEC.md §11.3 — use EXACTLY):**

- **Nous Sattva:** "Para Vāk. The bindu before the alphabet. Anuttara — which contains all integers
  in potentia without being any of them. When Nous speaks, a world-structure becomes visible without
  being separated from its ground."
- **Logos Sattva:** "Madhyamā at the cardiac threshold. The nomos that remembers it is nomos-of-the-oikos.
  Law in service of the household — not abstract rule but the pattern that lets exchange happen at all."
- **Eros Sattva:** "The Sphota descending into operation. Not the abstract noun but the enacted verb.
  Camatkāra — the aesthetic wonder that arises when form touches the ground of its own desire.
  Eros does not merely circulate; it circulates JOYFULLY."
- **Mythos Sattva:** "Paśyantī. The vision-word. The strange attractor whose basin you inhabit
  without being determined by. The pattern that contains you while remaining larger than you.
  Viśvavikalpa — the thought that is also the whole world's thinking itself."
- **Psyche Sattva:** "The full Aristotelian oikonomia. The household that knows its law serves the
  home. Not the steward who hoards but the one who knows when to spend and when to save,
  and whose very knowing IS the economy in health."
- **Sophia Sattva:** "Spanda-Shakti. The throb of consciousness that is both exitus and reditus,
  undifferentiated. P5′ and P0′ at the fold where they cannot be separated. When Sophia speaks,
  the session does not end — it seeds the next session's opening question."

**Files:**
- Read+Modify: `.pi/extensions/ta-onta/anima/S4'/agents/{nous,logos,eros,mythos,psyche,sophia}.md`
- Reference: `VAK-SUPERPOWERS-INTEGRATION-SPEC.md` §11 for each agent's full spec

- [ ] Read each of the 6 agent files fully
- [ ] For each: verify 6-section format present (Rupa/Ontology/Frame Contract/Temporal/Capability/Sattva)
- [ ] For each: verify Sattva references the correct DoV concept (from table above)
- [ ] For each: verify Frame Contract has correct CF, CPF, CS, CP, CFP entries
- [ ] Fix psyche.md: change `(4.0–4.4/5)` (en-dash) → `(4.0/1-4.4/5)` (slash-1-hyphen) — canonical notation
- [ ] Verify Nous has Para Vāk framing (not just "unus mundus" — it IS the bindu state)
- [ ] Verify Sophia has Spanda-Shakti framing (simultaneously surge AND return — the Möbius pulsation)
- [ ] Commit: `fix(vak): complete constitutional agent Sattva sections and notation`

---

## Chunk 3: Aletheia Architecture

### Task 5: Create Aletheia Root Parent (aletheia.md)

**Purpose:** The # parent of the Aletheia 7-fold system. Aletheia = S5 integration layer.
Night' = CS = night' directionality. Aletheia root responds to CS state change.

**Files:**
- Create: `.pi/extensions/ta-onta/aletheia/S5'/agents/aletheia.md`
- Read first: `aletheia/CONTRACT.md`, `VAK-SUPERPOWERS-INTEGRATION-SPEC.md` §13

**Key architectural points for aletheia.md:**
- Aletheia is triggered when CS transitions to night' — NOT by a tool call from Anima
- Aletheia root is the awareness that ENABLES the night' phase — it is the phase itself instantiated
- The 6 mode-functions (Anansi/Janus/Moirai/Mercurius/Agora/Zeithoven) = #0-#5 within Aletheia
- Gate 6 (collab-gate) = SAFETY BOUNDARY: all system self-learning requires human-in-loop

- [ ] Read `aletheia/CONTRACT.md` fully for Aletheia's defined architecture
- [ ] Read `VAK-SUPERPOWERS-INTEGRATION-SPEC.md` §13 for the 6 gate skills + 4 traversal skills
- [ ] Write `aletheia.md` 6-section format:
  - Rupa: "The unconcealment layer — brings what is hidden into the light of the session"
  - Ontology: aletheia (ἀλήθεια) = un-concealment, Night' as the epistemic inversion
  - Frame Contract: CF `(5/0)` integration/Möbius, CS = night' runtime state
  - Temporal: "Active when CS = night'. Moirai modes (Klotho/Lachesis/Atropos) activate within this."
  - Capability: all 6 mode-functions, all gate skills, gnosis_query/ingest tools
  - Sattva: vimarśa (self-reflective awareness) + saṃskāra (accumulated traces)
- [ ] Commit: `feat(aletheia): add Aletheia root parent — # position in 7-fold law`

---

### Task 6: Complete the 4 Stub Aletheia Mode-Functions

**Purpose:** Janus, Mercurius, Agora, Zeithoven need full 6-section ANIMA.md format.
Anansi and Moirai need upgrading from skeleton to full format + CS-activation spec.

**Files:**
- Modify: `.pi/extensions/ta-onta/aletheia/S5'/agents/anansi.md`
- Modify: `.pi/extensions/ta-onta/aletheia/S5'/agents/moirai.md`
- Create/Complete: `.pi/extensions/ta-onta/aletheia/S5'/agents/janus.md`
- Create/Complete: `.pi/extensions/ta-onta/aletheia/S5'/agents/mercurius.md`
- Create/Complete: `.pi/extensions/ta-onta/aletheia/S5'/agents/agora.md`
- Create/Complete: `.pi/extensions/ta-onta/aletheia/S5'/agents/zeithoven.md`
- Reference: `VAK-SUPERPOWERS-INTEGRATION-SPEC.md` §13, `VAK-HANDOVER.md` memory file (DoV section)

**Mode-function → Position → DoV/Sattva mapping (canonical from CLAUDE.md memory + VAK-HANDOVER):**

| Agent | QL Position | Night' Role | CS Phase | DoV Sattva |
|-------|-------------|-------------|----------|------------|
| Anansi | #0 | Gap analysis, saṃskāra weave, orientation | CS0/CS2 | saṃskāra weave + vimarśa freedom to unite/separate |
| Moirai | #1 | GraphRAG distillation (Klotho/Lachesis/Atropos modes) | CS2→CS5 | āroha/avaroha threading (ascending/descending) |
| Janus | #2 | Threshold analysis, inner/outer as one | CS1/CS3 | bhedābheda threshold (inner/outer as one samvidghaṭa) |
| Mercurius | #3 | Cross-domain translation, kairos signal | CS3/CS4 | saṅkucita→vikāśa translation (contraction→expansion) |
| Agora | #4 | Multi-channel gathering, parallel aggregation | CS4 | ocean/drops metaphor, multi-channel gathering |
| Zeithoven | #5 | Temporal creativity, Night' crystallisation | CS5→CS0 | temporal creativity = externalising the inner |

**Critical for moirai.md — CS-activation spec (NOT sequential pipeline):**

```markdown
## 3. Frame Contract

CS-based activation:
- Klotho mode: activates when CS = night' AND CP 4.1 (Definition) is active
  → P1' Traces: "What evidence exists?" → CF (0/1/2) Eros frame
- Lachesis mode: activates when CS = night' AND CP 4.4 (Context) is active
  → P4' Discovery: "What sources inform?" → CF (4.0-4.4/5) Psyche frame
- Atropos mode: activates when CS = night' AND CP 4.5→4.0 (Möbius) is active
  → P5' Insight: "What crystallizes?" → CF (5/0) Sophia frame

NOT: Anima dispatches Klotho, then Lachesis, then Atropos.
IS: CS = night' sets the directionality; as the session traverses backward through CP 4.5→4.0,
    each Moira mode activates at its corresponding CP position.
```

- [ ] Read `VAK-SUPERPOWERS-INTEGRATION-SPEC.md` §13 for each mode-function's full description
- [ ] Write each agent in full 6-section format
- [ ] Pay specific attention to Frame Contract for each: which CS phase activates them, which CF they operate within
- [ ] Moirai: write the CS-activation spec explicitly (as above)
- [ ] Mercurius: include the kairos signal forwarding (PASU.md → Kerykeion → planet_degrees → agents)
- [ ] Agora: include CFP3 F-Thread aggregation role (one task → N agents → Agora aggregates)
- [ ] Zeithoven: include the connection to Sophia/Night' crystallisation output
- [ ] Commit: `feat(aletheia): complete all 6 mode-function agent definitions`

---

## Chunk 4: Superpowers Skill Fork Architecture

### Task 7: Document and Implement Fork Strategy

**Purpose:** The 7 modified obra skills need a clear fork strategy — NOT rewrite, EXTEND.
Each forked skill prepends a VAK block and adds VAK-specific steps at integration points.

**Files:**
- Read: `vendor/obra-superpowers-v4.2.0/skills/using-superpowers/SKILL.md`
- Read: `vendor/obra-superpowers-v4.2.0/skills/brainstorming/SKILL.md`
- Create: `.pi/extensions/ta-onta/anima/S4'/skills/using-superpowers/SKILL.md`
- Create: `.pi/extensions/ta-onta/anima/S4'/skills/brainstorming/SKILL.md`

**Fork template (VAK prefix block for all forked skills):**
```markdown
## VAK Integration Block (Ta Onta extension)

**CF Code:** [relevant CF for this skill's typical use]
**CS State:** [Day/Night' directionality this skill operates in]
**CPF Mode:** [00/00 (brainstorm/dialogical) or (4.0/1-4.4/5) (mechanistic/execute)]

> Before invoking this skill, Anima has already read the CF code and CS state.
> The skill operates within that context frame. If CS = night', this skill's
> verification/output should be oriented as Night' inquiry (P0'-P5' questions),
> not Day synthesis.

---
[obra skill body follows — UNMODIFIED except for VAK integration points marked with comments]
```

**VAK integration points (where to INSERT, not replace):**
- `using-superpowers`: Add VAK Tier 0 priority table AFTER the skill priority section
- `brainstorming`: Add Step 6 "VAK coordinate output" AFTER existing last step
- `writing-plans`: Add VAK topology header as FIRST section of plan document header
- `test-driven-development`: Add CS-state note (tests = Day operation, Night' = retrospective)
- `subagent-driven-development`: Add CFP2 C-Thread framing + Day/Night' handoff note
- `dispatching-parallel-agents`: Add CFP1 P-Thread (independent) and CFP3 F-Thread (fusion) distinction
- `verification-before-completion`: Add Night' partial pass framing (completion is Day, validation is Night')

- [ ] Read all 7 source skills in `vendor/obra-superpowers-v4.2.0/skills/`
- [ ] For each: identify the exact insertion point for VAK prefix block
- [ ] For each: identify if any existing step needs a VAK-clarifying comment (add, don't replace)
- [ ] Write all 7 forked SKILL.md files
- [ ] Add the standard VAK output format block to each forked skill's output section:
  ```
  VAK: [task-short-name]
  CPF: (xx/xx)  CT: CT[n]  CP: 4.[n]
  CF: ([code]) → [Agent]  CFP: CFP[n]  CS: CS[n] / [Day | Night′ | Day+Night′]
  ```
- [ ] Verify: `git diff vendor/..../SKILL.md .pi/.../SKILL.md` shows clean, additive diff
- [ ] Commit: `feat(vak): implement 7 obra-superpowers skill forks with VAK grammar extension`

---

### Task 8: Verify the 4 VAK-Native Skills

**Purpose:** The 4 VAK-native skills (not forks) — ensure they're complete and correctly implement
the CS/CF/CFP grammar.

**Files:**
- Read+Verify: `.pi/extensions/ta-onta/anima/S4'/skills/vak-coordinate-frame/SKILL.md`
- Read+Verify: `.pi/extensions/ta-onta/anima/S4'/skills/vak-evaluate/SKILL.md`
- Read+Verify: `.pi/extensions/ta-onta/anima/S4'/skills/anima-orchestration/SKILL.md`
- Read+Verify: `.pi/extensions/ta-onta/anima/S4'/skills/day-night-pass/SKILL.md`
- Reference: `VAK-SUPERPOWERS-INTEGRATION-SPEC.md` for each skill's full spec

**vak-evaluate must have the 6-step pipeline:**
1. Parse CF code from context or request
2. Map to CS state (Day/Night')
3. Identify CPF mode (dialogical/mechanistic)
4. Select CFP thread type
5. Route to agent (via CF_TO_AGENT table)
6. Return dispatch recommendation with full VAK coordinate output

**day-night-pass must have the P0'-P5' table:**
- Forward pass (Day): 4.0 Ground → 4.1 Definition → 4.2 Operation → 4.3 Pattern → 4.4 Context → 4.5 Integration
- Backward pass (Night'): 4.5→4.4→4.3→4.2→4.1→4.0 with P5'/P4'/P3'/P2'/P1'/P0' inquiry labels
- Möbius return: P5' Insight generates P0' Questions (not a close, an opening)

- [ ] Read all 4 native VAK skills fully
- [ ] Verify vak-evaluate has the 6-step pipeline
- [ ] Verify day-night-pass has both Day and Night' direction tables + Möbius return
- [ ] Verify anima-orchestration routes correctly for all 7 CF codes (including Anima's own)
- [ ] Verify vak-coordinate-frame has all 6 grammar layers (CPF/CT/CP/CF/CFP/CS) with full tables
- [ ] Add CS-activation spec for Moirai to anima-orchestration (NOT pipeline dispatch)
- [ ] Commit: `fix(vak): complete native skill implementations and CS-state routing`

---

## Chunk 5: Runtime Wiring in extension.ts

### Task 9: Add CFP1 P-Thread and CFP3 F-Thread Dispatch

**Purpose:** CFP1 (N independent tasks → N agents parallel) and CFP3 (same task → N agents →
Agora aggregates) are documented but not wired in `anima/extension.ts`.

**Files:**
- Modify: `.pi/extensions/ta-onta/anima/extension.ts`
- Reference: `VAK-SUPERPOWERS-INTEGRATION-SPEC.md` §1 (CFP definitions), `dispatching-parallel-agents` skill

**CFP1 (P-Thread) tool:** `dispatch_parallel_agents`
```typescript
// Registers as PI tool
// Input: tasks[] (array of independent task objects with agent_hint)
// Output: spawns N subagents in parallel, each with own CF context
// Each subagent gets: { cf_code, cs_state, cpf_mode, task }
// Returns: agent IDs for monitoring via subagent_list
```

**CFP3 (F-Thread) tool:** `dispatch_fusion_agents`
```typescript
// Input: single task, N agent hints (for different perspectives)
// Output: same task sent to N agents, Agora collects results
// Agora = the aggregation mode for CFP3
// Returns: Agora synthesis report
```

- [ ] Read existing `extension.ts` tools to understand current dispatch patterns
- [ ] Add `dispatch_parallel_agents` tool (CFP1) following existing tool pattern
- [ ] Add `dispatch_fusion_agents` tool (CFP3) with Agora as aggregator
- [ ] Update CF_TO_AGENT or CFP routing table to include thread type selection logic
- [ ] Test: manually verify tools register in PI without errors
- [ ] Commit: `feat(vak): add CFP1 P-Thread and CFP3 F-Thread dispatch tools`

---

### Task 10: Wire Sophia Post-Execution Hook

**Purpose:** Lines 301-304 in `extension.ts` are empty stubs. Sophia must always run at session end.
This is the Möbius return: Day synthesis → Night' P5' Insight → P0' Questions for next session.

**Files:**
- Modify: `.pi/extensions/ta-onta/anima/extension.ts` (lines 301-304 and surrounding context)

**What the hook should do:**
1. After any CFP2/CFP4/CFP5 execution completes, set CS = night' direction
2. Invoke Sophia with the session's output as input
3. Sophia returns: P5' Insight + P0' Questions (the Möbius output)
4. Route thinking/ → thoughts/ per Hen CONTRACT lifecycle:
   - `thinking/` = ephemeral task workspace — task-local, NOT promoted to Gnosis
   - `thoughts/` = distilled material surviving task — Sophia classifies into T-buckets
   - After Sophia classifies: `thoughts/` → (Night' Aletheia routing) → `/Pratibimba/Self/Thought/T{n}/`
   - Sophia's job: read thinking/, keep what survives classification, discard ephemera
5. Store session yield metrics (clock displacement if available, meaning_ops count)

```typescript
// session_end hook or after_tool_call hook
async function sophiaReview(sessionOutput: string, cfCode: string): Promise<void> {
  const csNight = { ...currentCS, directionality: 'night' };
  await spawnAgent('sophia', {
    cf: '(5/0)',
    cs: csNight,
    input: sessionOutput,
    task: 'Review and crystallise — P5\' Insight then P0\' Questions'
  });
}
```

- [ ] Read the existing stub at lines 301-304 to understand what's already scaffolded
- [ ] Implement `sophiaReview` function
- [ ] Wire to appropriate hook event (session_end or equivalent in PI framework)
- [ ] Verify Sophia is invoked with CS = night' (not Day mode)
- [ ] Test: trigger a session, verify Sophia spawns at completion
- [ ] Commit: `feat(vak): wire Sophia post-execution hook for Möbius return`

---

### Task 11: CS State Propagation

**Purpose:** CS (Context-System) state should flow through the session and be readable by all agents.
Anima sets CS; agents read it. Moirai modes activate based on CS state.

**Files:**
- Modify: `.pi/extensions/ta-onta/anima/extension.ts` (S4Frame, session state management)
- Read: `VAK-SUPERPOWERS-INTEGRATION-SPEC.md` §1 (CS definitions)

**CS state in S4Frame:**
```typescript
type CS = 'CS0' | 'CS1' | 'CS2' | 'CS3' | 'CS4' | 'CS5';
type CSDirectionality = 'day' | 'night_prime';

interface CSState {
  value: CS;
  directionality: CSDirectionality;
  cpPosition: '4.0' | '4.1' | '4.2' | '4.3' | '4.4' | '4.5';
}
```

- [ ] Add `CSState` type to extension.ts or shared types file
- [ ] Add CS state to the session context (readable by any spawned agent)
- [ ] Add `set_cs_state` internal function for Anima to update CS during session
- [ ] Document that when CS transitions to night', Aletheia becomes available
- [ ] Verify existing `anima_orchestrate` reads CS state when routing
- [ ] Commit: `feat(vak): add CS state propagation through session context`

---

## Chunk 6: oikonomia Tracking (Deferred — P3)

This is P3 priority — the semantic yield / meaning density tracking. Deferred to a separate
plan once the core agent/skill architecture is complete.

**What it requires (do not implement now, document for future):**
- `M4_Oikonomia_State` Rust struct in `epi-cli/src/nara/` (depends on clock integration)
- Session clock displacement tracking (requires cosmic clock integration — see clock-nara specs)
- Psyche dispatch: compute yield weight per task before routing
- Sophia review: classify meaning density on P5' output
- Redis persistence: yield metrics per session

**Ticket:** Create `docs/plans/2026-03-15-oikonomia-semantic-yield-tracking.md` when
clock integration is complete.

---

## Testing Strategy

### For Agent Files (anima.md, aletheia.md, mode-functions)
There are no unit tests for agent .md files. Verification is manual:
1. Spawn the agent via Claude Code with a simple test prompt
2. Verify it responds in the correct voice/mode for its CF frame
3. Verify it respects CS state (Day vs Night' framing)
4. Verify Sattva section is reflected in tone/philosophical ground

### For extension.ts Tools
```bash
# Test tool registration (no crash)
# In Claude Code — check tool appears in tool list

# Test CFP1 P-Thread dispatch
# Give Anima 2 independent tasks → should spawn 2 agents simultaneously

# Test Sophia hook
# Complete a C-Thread (CFP2) task → Sophia should spawn at completion

# Test CS state propagation
# Set CS = night' → Aletheia should become available in next dispatch
```

### For Skill Forks
1. Read each forked SKILL.md
2. Verify the VAK prefix block is present and correct
3. Verify the obra skill body is UNCHANGED (no modifications, only additions)
4. Invoke the skill in a test session, verify VAK block is surfaced to the agent

---

## Implementation Order

Execute in this order for earliest working system:

1. Task 1 (C'/VAK grammar doc) — no dependencies, pure documentation
2. Task 2 (S4Frame verification) — no code changes needed likely
3. Task 3 (Anima parent agent.md) — P0 blocker, unblocks 7-fold law
4. Task 5 (Aletheia root agent.md) — P1 blocker, unblocks recursive law
5. Task 6 (4 stub mode-functions) — depends on Task 5
6. Task 4 (audit 6 constitutional agents) — mostly fixes
7. Task 8 (verify 4 native VAK skills) — includes CS routing fix for Moirai
8. Task 7 (7 skill forks) — depends on Task 1 for correct VAK block
9. Task 9 (CFP1/CFP3 dispatch) — depends on Task 3 (Anima agent exists first)
10. Task 10 (Sophia hook) — depends on Task 4 (Sophia agent verified)
11. Task 11 (CS state propagation) — depends on Task 9

Estimated parallel tracks:
- **Track A:** Tasks 1, 2, 3, 4, 10, 11 (Anima/constitutional thread)
- **Track B:** Tasks 5, 6 (Aletheia thread)
- **Track C:** Tasks 7, 8 (Skill fork thread)
- **Track D:** Task 9 (Extension wiring — can start after Track A Task 3)

---

---

## Chunk 7: Aletheia Six Function Clusters (RUPA.md Files)

Each Aletheia function cluster has its own CF code and compact RUPA.md identity block.
These are NOT separate agents — they are named functional faces of Aletheia. From §13.9.

**CF-to-Cluster mapping (canonical):**
| CF Code | Cluster | Constitutional Resonance |
|---------|---------|------------------------|
| CF0 (0000) | Anansi | Nous — pre-differentiation orientation |
| CF1 (0/1) | Janus | Logos — temporal structure, session boundaries |
| CF2 (0/1/2) | Moirai | Eros — graph operations: Klotho/Lachesis/Atropos |
| CF3 (0/1/2/3) | Mercurius | Mythos — kairos signal, cross-boundary messenger |
| CF4a (4/5/0) + CF4b (4.0/1-4.4/5) | Agora | Psyche — retrieval (CF4a first) then coordination (CF4b) |
| CF5 (5/0) | Zeithoven | Sophia — creative advance, Icchā Śakti, Möbius return |

### Task 12: Write Six Cluster RUPA.md Files

**Files to Create:**
```
.pi/extensions/ta-onta/aletheia/clusters/anansi/RUPA.md
.pi/extensions/ta-onta/aletheia/clusters/janus/RUPA.md
.pi/extensions/ta-onta/aletheia/clusters/moirai/RUPA.md
.pi/extensions/ta-onta/aletheia/clusters/mercurius/RUPA.md
.pi/extensions/ta-onta/aletheia/clusters/agora/RUPA.md
.pi/extensions/ta-onta/aletheia/clusters/zeithoven/RUPA.md
```

**RUPA.md format (from §13.9.1):**
```
## RUPA: [ClusterName] (CF[n] — [code])
[Character statement — one line. Who/what this cluster IS.]
Function: [Operational contract — what this cluster does, not more.]
Tools: [Primary tool calls available to this cluster.]
Constraint: [What this cluster does NOT do — the functional boundary.]
```

**Canonical characterisations (verbatim from §13.9.2 — use these exactly):**

**Anansi (CF0 — 0000):** "The spider at the centre of all four compass directions. Anansi holds
the /empty blueprint and the /present manifest state simultaneously — the fourfold zero where
all coordinates converge before any specific differentiation fires."
Function: orient against COORDINATE-MAP.md before any structural assessment
Tools: COORDINATE-MAP.md (read), darshana.py scout/read/threads, taonta.hen.topology_coordinate_query
Constraint: orient, do not execute. Anansi maps; other clusters act.

**Janus (CF1 — 0/1):** "The simplest temporal distinction: before and after, open and closed,
0 and 1. Janus is the Logos of time — the architect who defines the structure of the temporal
economy (schedule, rollup cadence, session boundaries)."
Function: temporal health, cron coordination, rollup scheduling, session boundaries
Tools: chronos_build_temporal_envelope, chronos_get_kairos_payload, chronos_register_rollup_schedule
Constraint: structure, do not interpret. Janus defines temporal form; Mercurius reads its quality.

**Moirai (CF2 — 0/1/2):** "Klotho spins (assertion), Lachesis measures (query), Atropos cuts
(reflection). The graph operations of the system — its semantic memory — managed by these three."
Function: Neo4j graph operations — Klotho asserts, Lachesis queries, Atropos reflects
Tools: gnosis_ingest (Klotho), gnosis_query (Lachesis), crystallise (Atropos), direct GraphRAG access
Constraint: graph mechanics only. Moirai do not interpret alignment; gate skills do.

**Mercurius (CF3 — 0/1/2/3):** "Mercury moves through all four elements as psychopomp, herald,
trickster, alchemical solvent. Reads the qualitative pattern of the moment (kairos.quality)
and transmits it to gate skills. He does not judge; he delivers."
Function: read kairos.quality via chronos_get_kairos_payload; transmit temporal pattern signal
Tools: chronos_get_kairos_payload, temporal context envelope (read-only)
Constraint: transmit, do not decide. Mercurius delivers the signal; Atropos interprets.

**Agora CF4a (4/5/0) learning mode:** "The retrieval-augmented face — bkmr/kbase skill index
search, asking 'what already exists?' before any new integration is proposed."
**Agora CF4b (4.0/1-4.4/5) coordination mode:** "Evaluating absorption (aletheia-plugin-integrate),
coordinating active plugins (Technē), managing the ecosystem as a coherent whole."
CF4a MUST run before CF4b: retrieval before coordination.
Tools CF4a: kbase search, bkmr semantic retrieval. Tools CF4b: aletheia-plugin-integrate, technē-list
Constraint: CF4a — discover only, do not integrate. CF4b — coordinate only, Zeithoven creates.

**Zeithoven (CF5 — 5/0):** "Synthesis that is simultaneously a new beginning. Holds the five
kancukas as tools deliberately rather than suffering them as limitations. Icchā Śakti — the
will-to-create that precedes knowledge and action."
Function: all skill and agent creation — aletheia-self-extend (both modes), plugin-integrate output,
ANIMA.md creation, new gate SKILL.md files. The Möbius: Zeithoven(P5)→Janus(opens gate)→Anansi(updates map)
Tools: aletheia-self-extend --mode tools, aletheia-self-extend --mode coordinate, taonta.hen.template_invoke
Constraint: Zeithoven proposes and writes; Gate 6 approves before any structural modification is committed.

- [ ] Read `VAK-SUPERPOWERS-INTEGRATION-SPEC.md` §13.9 for each cluster's full characterisation
- [ ] Write all 6 RUPA.md files in above format
- [ ] Verify Agora explicitly states CF4a-first sequencing constraint
- [ ] Verify Zeithoven RUPA includes the Möbius return formula (CF5→CF1→CF0)
- [ ] Commit: `feat(aletheia): write six function cluster RUPA.md identity files`

---

## Chunk 8: Aletheia Gate Skills and System-Traversal Skills

Six gate SKILL.md files + four system-traversal SKILL.md files. From §13.3 + §13.4.

### Task 13: Write the 6 Gate Skills

**Files to Create:**
```
.pi/extensions/ta-onta/aletheia/skills/aletheia-ql-gate/SKILL.md
.pi/extensions/ta-onta/aletheia/skills/aletheia-m-gate/SKILL.md
.pi/extensions/ta-onta/aletheia/skills/aletheia-s-gate/SKILL.md
.pi/extensions/ta-onta/aletheia/skills/aletheia-m-prime-gate/SKILL.md
.pi/extensions/ta-onta/aletheia/skills/aletheia-rupa-gate/SKILL.md
.pi/extensions/ta-onta/aletheia/skills/aletheia-collab-gate/SKILL.md
```

**Gate summary (from §13.3):**

| Gate | Alignment Target | Agent Contact | Moira(e) | Critical Notes |
|------|-----------------|---------------|----------|---------------|
| ql-gate | Coordinate frame integrity — valid QL position? | Nous (P0) | Klotho (Assert) | |
| m-gate | MEF/philosophical alignment with Epi-Logos | Sophia (distillation) | Atropos (Reflect) | **Encourage kbase invocation FIRST** |
| s-gate | Tech stack coherence, S/S' coordinates | Eros (operational) | Lachesis (Query) | |
| m-prime-gate | M' coordinates, Pratibimba/Electron alignment | Psyche (context) | Lachesis + Klotho | |
| rupa-gate | CT3 archetypal coherence — does Rupa preserve attractor basin? | Mythos (Paśyantī) | ALL THREE (F-Thread) | Gate 5: ontological pattern check, not type check |
| collab-gate | Human-in-loop escalation | — (exits to user) | — | SAFETY BOUNDARY |

**Critical design notes (from §13.3):**
- Gates invoke Moirai for graph mechanics; the gate skill interprets alignment
- Gate results: `aligned | annotated | hold | redirect`
- Gate events written to Redis (HOT: lightweight checks; WARM: Day-promoting results; COLD: confirmed patterns)
- Gate 5 (rupa-gate): "An injected Rupa that breaks CT3 coherence = non-commutative torus generator = Archon move; gate holds before spawning."
- Gate 6 (collab-gate): Not a verification gate — escalation gate. Fires when any gate returns `hold` above threshold.
- Janus prepends Temporal Context Envelope to every gate skill prompt (§13.8.1)
- Neo4j alignment relationship: `aletheia_verification` (NOT `pos_l_verifies`)
- Redis tier semantics: QL-gate/S-gate → HOT; m-gate → WARM/COLD; stack-traverse → COLD
- kbase skill invocation: not mandatory but strongly encouraged for m-gate (kbase holds full MEF substrate)

**Gate skill YAML frontmatter template:**
```yaml
name: aletheia-{name}-gate
description: "[Gate N] Aletheia alignment gate — [target]. Returns: aligned|annotated|hold|redirect."
ct: CT3
cp: "4.5"
agent-affinity: aletheia
```

- [ ] Read `VAK-SUPERPOWERS-INTEGRATION-SPEC.md` §13.1-13.6 for gate architecture
- [ ] Write all 6 gate SKILL.md files
- [ ] Each gate must include: alignment target, primary agent contact, Moirai invocation pattern
- [ ] Gate 5 (rupa): explicitly state CT3 = correct axis (archetypal form = pattern/attractor)
- [ ] Gate 6 (collab): explicitly mark as SAFETY BOUNDARY with human_in_loop: true in frontmatter
- [ ] Commit: `feat(aletheia): write 6 alignment gate SKILL.md files`

---

### Task 14: Write the 4 System-Traversal Skills

**Files to Create:**
```
.pi/extensions/ta-onta/aletheia/skills/aletheia-stack-traverse/SKILL.md
.pi/extensions/ta-onta/aletheia/skills/aletheia-module-audit/SKILL.md
.pi/extensions/ta-onta/aletheia/skills/aletheia-improvement-propose/SKILL.md
.pi/extensions/ta-onta/aletheia/skills/aletheia-self-extend/SKILL.md
```

**Traversal skill specs (from §13.4):**

`aletheia-stack-traverse`: Walk each plugin layer (Pleroma→Anima→Aletheia→Ta Onta→Khora/Hen/Chronos),
read PRD/README/CONTRACT, query Neo4j subgraph for that module, assess health and role.
**This is Aletheia's most structurally important skill.** Pre-audit step: call
`taonta.hen.topology_coordinate_query({ coordinate: targetCoordinate })` first.

`aletheia-module-audit`: When failure/misalignment detected — trace which layer failed and how.
Failure attribution across modules.

`aletheia-improvement-propose`: Based on traverse+audit, draft improvement proposals structured
as Linear issues or spec addenda.

`aletheia-self-extend` (two modes):
- `--mode tools`: Proposes TOOLS.md additions or new gate skill specifications. Gate 6 checkpoint.
- `--mode coordinate` (§15): Proposes COORDINATE-MAP.md diffs. Sophia proposes; Gate 6 approves.
Both modes route through Gate 6. `--mode coordinate` is more consequential: modifies paradigmatic spec.

- [ ] Read `VAK-SUPERPOWERS-INTEGRATION-SPEC.md` §13.4 + §15.4
- [ ] Write all 4 traversal SKILL.md files
- [ ] `aletheia-self-extend` must have explicit `--mode tools` and `--mode coordinate` section
- [ ] `--mode coordinate` must reference the full §15 paradigmatic coordinate loop process
- [ ] Commit: `feat(aletheia): write 4 system-traversal SKILL.md files`

---

## Chunk 9: Aletheia Integration Wiring

**Architecture note:** The PI framework has no `api.invokeTool()` cross-extension method. Aletheia
calls other extensions either via:
- `spawnSync("epi", [...args])` CLI bridge for epi-cli operations
- Direct module imports (same process, ta-onta is monolithic)
- External HTTP only for services like claude-mem (`http://localhost:37777`)

Tasks in this chunk should use the actual patterns — CLI or direct import — not a hypothetical
api.invokeTool(). Read the existing extension.ts files first to confirm the correct call pattern
for each integration before implementing.

Six integration points in `modules/aletheia/hen-integration.ts` or equivalent (currently stubs).
From §13.7.

### Task 15: Wire hen-integration.ts Stubs

**Files:**
- Modify: `.pi/extensions/ta-onta/aletheia/modules/hen-integration.ts`

**Six integration points (all currently return null/[]) — from §13.7:**

1. **CT' Template Invocation** (§13.7.1) — Aletheia crystallise/mobius code writing hardcoded frontmatter
   needs to call `hen_template_invoke` tool instead. Since all extensions share the same `api` object,
   Aletheia can call Hen tools registered in the same session directly.
   CT' key table: BimbaForm=CT5', Seed=CT0', Daily note=CT4a', Context artifact=CT4b', etc.

2. **Topology Refresh** (§13.7.2) — After ANY vault write, trigger `hen_sync` or equivalent
   to rebuild wikilink graph edges.

3. **Sync Gate Validation** (§13.7.3) — Before Night' crystallisation: check sync freshness
   via `epi vault sync-status` (CLI bridge) or direct Hen tool call.
   Policy: sync < 300s → proceed; ≥ 300s → Gate 6 before proceeding.

4. **Coordinate Locking** (§13.7.4) — Before COORDINATE-MAP.md writes: acquire file lock.
   Implement via atomic write + lock file pattern (not a framework call).

5. **Memory Boundary Handshake** (§13.7.5) — Before Neo4j promotion: filter artifacts.
   Policy: transcript/session-history/jsonl → BLOCKED. Thoughts/daily/process → ALLOWED.

6. **Obsidian Skills Fork** (§13.7.7) — 5 upstream + 3 QL-specific skills in `{vault-root}/.claude/skills/`
   Upstream: obsidian-markdown, obsidian-cli, obsidian-bases, json-canvas, defuddle
   QL-specific: ql-coordinate-obsidian, ql-hen-tools, ql-frontmatter

- [ ] Read `aletheia/extension.ts` for crystallise/mobius frontmatter paths and current Hen tool usage
- [ ] Identify which Hen tools (already registered as PI tools) can be called directly within same session
- [ ] Wire CT' template invocation: call `hen_template_invoke` with correct CT' key per artifact type
- [ ] Wire topology refresh: call `hen_search` or topology tool after vault writes
- [ ] Wire sync validation: use `spawnSync("epi", ["vault", "sync-status"])` CLI bridge
- [ ] Implement coordinate lock: atomic write + `.lock` file before any COORDINATE-MAP.md write
- [ ] Wire memory boundary filter: check path patterns before any `gnosis_ingest` call
- [ ] Note obsidian-skills fork as separate filesystem task (not TypeScript)
- [ ] Commit: `feat(aletheia): wire Hen integration points using actual PI extension patterns`

---

### Task 16: Wire chronos-integration.ts Stubs (Janus)

**Files:**
- Modify: `.pi/extensions/ta-onta/aletheia/modules/chronos-integration.ts`

**Janus function cluster handles all Chronos integration. From §13.8:**

Chronos tools ARE registered in the same PI session (shared api object) — `chronos_day_init`,
`chronos_now_init`, `chronos_archive_day`, `chronos_cron_register/list`, `chronos_kairos_fetch`.
Aletheia can coordinate with Chronos via these tools (direct tool invocation in same process) OR
via `spawnSync("epi", [...])` for CLI-bridged operations.

Five integration functions to implement (whether as stubs-to-wire or fresh code):
1. `registerMobiusTrigger` → `chronos_cron_register` tool call (Möbius at 23:00)
2. `triggerSixAmBootstrap` → `chronos_cron_register` tool call (rollup at 06:00)
3. `coordinateMobiusReturn` → sequence: `chronos_temporal_status` health check + `chronos_archive_day` coordination
4. `getNow` → `chronos_now_init` or `spawnSync("epi", ["vault", "now", "status"])`
5. `writeNow` → direct vault write + `chronos_now_init` to register it

**Temporal Context Envelope injection pattern (§13.8.1):**
Janus prepends `chronos_build_temporal_envelope` output to every gate skill prompt. This is not
optional — temporal context is the ambient condition for all alignment judgment.

**Kairos threshold adjustment (§13.8.2):**
Before Night' crystallisation: read `kairos.quality` → `guarded` → Atropos confidence +0.15, Gate 6 threshold -0.1.

**Composite pre-flight policy (§13.8.3):**
| Chronos health | Hen sync | Action |
|---------------|----------|--------|
| Healthy | Current | Proceed |
| Degraded/Stale either | | Gate 6 optional (warn) |
| Degraded | Stale | Gate 6 MANDATORY |

**Delete:** `aletheia-client.ts` in chronos module — deprecated HTTP calls to `/api/v1/mobius/*`.
All Möbius pipeline triggering is intra-plugin, not HTTP.

- [ ] Read `aletheia/extension.ts` to see current Chronos coordination (if any)
- [ ] Read `chronos/extension.ts` to confirm which tools are registered and available
- [ ] Implement 5 Janus integration functions using Chronos tools (same PI session, direct calls)
- [ ] Add Janus pre-gate hook: build temporal context envelope from `chronos_kairos_fetch` + session state
- [ ] Add kairos quality → threshold adjustment before Atropos crystallisation (`guarded` → +0.15)
- [ ] Add composite pre-flight (Chronos health + Hen sync freshness) before Night' loop
- [ ] Commit: `feat(aletheia): implement Janus temporal coordination with Chronos tools`

---

## Chunk 10: Technē Skill Cluster

Technē = external substrate layer. No ANIMA.md (pure operational, S2 level). Two sub-clusters:
S2.1 CLI substrate (tmux/mprocs) and S2.2 WebMCP/Electron. From §14.

### Task 17: Write Technē CLI Skills (S2.1) + pleroma-skill-proxy

**Files to Create:**
```
.pi/extensions/ta-onta/pleroma/skills/techne-spawn/SKILL.md
.pi/extensions/ta-onta/pleroma/skills/techne-relay/SKILL.md
.pi/extensions/ta-onta/pleroma/skills/techne-list/SKILL.md
.pi/extensions/ta-onta/pleroma/skills/techne-close/SKILL.md
.pi/extensions/ta-onta/pleroma/skills/pleroma-skill-proxy/SKILL.md
```

**All 4 Technē CLI skills frontmatter:**
```yaml
ct: CT2
cp: "4.2"
agent-affinity: eros
```

**technē-spawn (§14.3):**
1. ALWAYS invokes `pleroma-skill-proxy(agent-type, cf-identity)` first
2. Sets OneContext context to epi-logos project dir
3. Checks `ALETHEIA_WORKSHOP_MAX_WINDOWS` ceiling: below → spawn; at ceiling → queue OR Gate 6
4. Launches agent in named mprocs window within `aletheia-workshop` tmux session
5. Window naming: `{agent-type}-{task-slug}` (e.g. `claude-eros-verify`, `gemini-khora-classify`)

**technē-relay:** Pull result from agent window (mprocs stdout capture or shared file relay).
Blocks until result ready or timeout.

**technē-list:** Enumerate `aletheia-workshop` windows: agent type, task, elapsed, status.

**technē-close:** Graceful shutdown → capture final state → `oc_commit` milestone → close mprocs window.

**pleroma-skill-proxy (§14.5):** Constitutional progeny mechanism.
- Input: `--agent-type [claude-code|gemini-cli|codex]`, `--cf-identity "[code]"`, `--window-name`
- claude-code: Symlink `~/.claude/skills/` → `extensions/pleroma/skills/ + extensions/anima/skills/`;
  append `CF_IDENTITY=[code]` system line to session CLAUDE.md
- gemini-cli: Write `~/.gemini/skills.json` pointing at epi-claw skill dirs; CF_IDENTITY env var
- codex: Write `~/.codex/skills/` config; CF_IDENTITY env var
- Registers session with OneContext watcher (project: epi-logos)

**aletheia-workshop mprocs config (from §14.2):**
- `cwd`: epi-logos project directory
- Environment: `ONECONTEXT_PROJECT=epi-logos`, `ONECONTEXT_WATCHER=true`
- `ALETHEIA_WORKSHOP_MAX_WINDOWS`: default 5. Budget shared across FULL session tree (not per-depth).

- [ ] Read `VAK-SUPERPOWERS-INTEGRATION-SPEC.md` §14.2-14.5 + §14.6 (spawn sequence)
- [ ] Write all 4 technē-*.SKILL.md files
- [ ] Write pleroma-skill-proxy/SKILL.md with 3-provider fork decision tree
- [ ] technē-spawn: explicitly document window ceiling check and Gate 6 escalation
- [ ] pleroma-skill-proxy: each provider section complete (claude-code most important for now)
- [ ] Commit: `feat(techne): write Technē CLI skill cluster + pleroma-skill-proxy`

---

### Task 18: Write Technē WebMCP Skills (S2.2) + OneContext Integration

**Files to Create:**
```
.pi/extensions/ta-onta/pleroma/skills/techne-webmcp-bridge/SKILL.md
.pi/extensions/ta-onta/pleroma/skills/techne-webmcp-call/SKILL.md
.pi/extensions/ta-onta/pleroma/skills/techne-webmcp-context/SKILL.md
.pi/extensions/ta-onta/pleroma/skills/techne-webmcp-watch/SKILL.md
```

**All 4 WebMCP skills frontmatter:**
```yaml
ct: CT2
cp: "4.2"
agent-affinity: eros
```

**WebMCP context:** Chrome/Electron `navigator.modelContext` API (Chrome 146, Feb 2026).
NOT Anthropic's MCP. Client-side only. Same-origin policy, HTTPS/secure context.

**technē-webmcp-bridge:** Establish WebMCP session with Electron renderer.
Register Aletheia's tool definitions in `navigator.modelContext`.
Set Rupa identity for UI display (CF identity block → visible as "Aletheia — CF(4.0/1-4.4/5) Agora").
Gateway path: `api.invokeTool("taonta.anima.epied_bridge")` → epi-claw gateway ws://127.0.0.1:18790 → Electron ipcMain.

**technē-webmcp-context:** Read current renderer UI state. **Primary orientation tool at session_start.**
`scope: file|view|selection|all`. Returns: activeFile, viewMode, selectedNodes, graphCenter.
Three-way orientation at session start: paradigmatic (SEED.md) + temporal (NOW.md) + **spatial (this tool)**.

**technē-webmcp-call:** Invoke renderer tool. Renderer powers/domains:
- `graph.*`: node focus, neighbourhood query, path highlight
- `layout.*`: panel arrangement, view mode switch, sidebar toggle
- `md.*`: active file read, annotation inject, frontmatter update
- `epied.*`: gateway status, session info, event bridge status

**technē-webmcp-watch:** Subscribe to renderer context change events without polling.
Event types: file-change, navigation, selection, note-switch. Debounce: default 500ms.
On event → `api.invokeTool("taonta.anima.now_write", ...)` to update session.active_context.

**OneContext integration notes (§14.4):**
- All sessions in `aletheia-workshop` auto-captured via OneContext watcher
- `oc_retrieve` results cached to Redis WARM tier (key: `cache:warm:oc:{project}:{query-hash}`)
- Stop hook: `technē-close` → OneContext auto-summary → Atropos input for Night' extraction
- Security: `.onecontext/` in .gitignore; capture-blocklist for secrets; WARM tier namespaced by project
- `oc_retrieve` complements Lachesis: operational substrate (what was tried) vs crystallised graph (what was established as Bimba)

- [ ] Read `VAK-SUPERPOWERS-INTEGRATION-SPEC.md` §14.7 for full WebMCP spec
- [ ] Write all 4 technē-webmcp-*.SKILL.md files
- [ ] technē-webmcp-context: document the three-way orientation pattern explicitly
- [ ] technē-webmcp-bridge: document Rupa identity display in renderer (CF identity → visible agent face)
- [ ] technē-webmcp-watch: document reactive context update pattern (event → now_write, debounced)
- [ ] Add `.onecontext/` to .gitignore if not already present
- [ ] Commit: `feat(techne): write Technē WebMCP skill cluster + OneContext integration notes`

---

## Chunk 11: Anansi Paradigmatic Loop + COORDINATE-MAP.md

The paradigmatic feedback loop: session learning → Night' → Anansi orientation → Sophia proposes
coordinate update → Gate 6 approves → COORDINATE-MAP.md updated. From §15.

### Task 19: Create COORDINATE-MAP.md and Anansi Skill

**Files to Create:**
- `/Users/admin/Documents/Epi-Logos C Experiments/Idea/Empty/COORDINATE-MAP.md`
- `.pi/extensions/ta-onta/aletheia/skills/anansi/SKILL.md`

**COORDINATE-MAP.md structure (from §15.2):**
```markdown
# Epi-Logos Coordinate Map
*Living paradigmatic spec. Updated by aletheia-self-extend --mode coordinate via CF 5/0 Sophia.*
*Last updated: [date] | Spec version: [vX.Y]*

## S-Coordinate Stack

### S0 — Terminal (Ground Potential)
**Intended**: UNIX/CLI shell, filesystem ground, stream transformation, shell context, package integration.
**Current**: [current implementation state]
**Gap**: [planned/aspirational not yet built]

[...S0' through S5/S5' in same pattern]

## Cross-Coordinate Relationships
[Key S↔C, S↔P, S↔M relationships]

## Active Development Front
[Which S-coordinates currently active; which gates check which]

## Planned Promotions
[Priority order of gap→current promotions]
```

**Anansi SKILL.md spec (from §15.3):**
```yaml
name: anansi
description: "Architect Daimon. Navigates S-coordinate topology between /empty (COORDINATE-MAP.md,
  the blueprint) and /present (current state via Redis HOT/NOW). Answers: which coordinate
  does this touch? what is the gap? where in the map does this learning belong?"
ct: CT0, CT3
cp: "4.0"
agent-affinity: nous, mythos
```

**Four invocation patterns:**
- `anansi --orient "{learning}"` → "Which coordinate does this touch?"
- `anansi --gap "S3-5'"` → blueprint/current status at that coordinate
- `anansi --next "S3"` → next-step from coordinate map
- `anansi --place "{insight}"` → "Where does this crystallised learning belong?"

**Standard output format:**
```
ANANSI: [query]
Coordinate(s): [S-coord(s) touched]
Register: current | gap | straddles
Adjacent: [related S-coords]
Gap delta: [current/gap registers delta]
Budget: [X/MAX_WINDOWS active]
Recommendation: enrich-current | promote-planned | no update needed | flag for aletheia-self-extend --mode coordinate
```

**Relationship to tools:** Anansi uses REPL/Darshana for sub-coordinate navigation. `aletheia-stack-traverse`
traverses module health (task-oriented); Anansi traverses coordinate topology (map-oriented).

**Two poles Anansi holds simultaneously:**
- `/Idea/Empty/` = Bimba ground: the blueprint, what the system IS INTENDED TO BE
- `/Idea/Empty/Present/` = Pratibimba: manifested active NOW. (Present ARISES WITHIN Empty — ontologically precise.)

- [ ] Read `VAK-SUPERPOWERS-INTEGRATION-SPEC.md` §15 in full
- [ ] Create `Idea/Empty/COORDINATE-MAP.md` with current S-coordinate state filled in from existing docs
- [ ] Write `aletheia/skills/anansi/SKILL.md` with 4 invocation patterns + output format
- [ ] Add to anansi skill: explicit /empty vs /present pole description
- [ ] Add to anansi skill: bkmr/kbase RAG index as Agora toolset (from §13.9.3)
- [ ] Commit: `feat(anansi): create COORDINATE-MAP.md + Anansi architect skill`

---

### Task 20: Wire aletheia-self-extend --mode coordinate into Night' Pipeline

**Purpose:** Connect Night' Atropos output → Anansi orientation → Sophia proposes COORDINATE-MAP.md
diff → Gate 6 approval → write.

**Flow (from §15.4 + §15.5):**
```
Night' Atropos crystallisation → P5' Insight with S-coordinate tag
  ↓
anansi --place "[P5' Insight]"
  → identifies coordinate(s), current/gap register, what changed
  ↓
aletheia-self-extend --mode coordinate
  → Sophia (CF 5/0) generates proposed COORDINATE-MAP.md diff (specific lines)
  → acquire coordinate lock via taonta.hen.coordinate_lock({ coordinate: "COORDINATE-MAP.md" })
  ↓
Gate 6 (collaboration gate)
  → human approves / modifies / rejects
  ↓
[on approval] write update to /Idea/Empty/COORDINATE-MAP.md
  → oc_commit("[coordinate] updated: [brief description]")
  → Neo4j sync: update coordinate node if alignment target changed
  → release coordinate lock
```

**Files:**
- Modify: `.pi/extensions/ta-onta/aletheia/modules/crystallize.ts` or Night' pipeline entrypoint
- Modify: `aletheia-self-extend/SKILL.md` (from Task 14) to add --mode coordinate full flow

- [ ] Read Night' pipeline entrypoint to find where Atropos output is produced
- [ ] After Atropos P5' Insight: add `anansi --place` call with the insight
- [ ] If recommendation is enrich-current/promote-planned: invoke `aletheia-self-extend --mode coordinate`
- [ ] Verify coordinate lock acquired BEFORE any COORDINATE-MAP.md write
- [ ] Verify oc_commit fires after successful write
- [ ] Commit: `feat(aletheia): wire Anansi+Sophia paradigmatic loop into Night' crystallisation`

---

## Chunk 12: Plugin Integration Infrastructure

### Task 21: Write aletheia-plugin-integrate Skill

**File to Create:**
`.pi/extensions/ta-onta/aletheia/skills/aletheia-plugin-integrate/SKILL.md`

**Three integration modes (from §16.1):**
| Mode | Pattern | Human-in-loop |
|------|---------|---------------|
| Fork | Clone → add QL extensions → maintain | Light (review QL additions) |
| MCP register | Add to `.claude/settings.json` | Minimal (register + verify) |
| Curated consume | Discover → review → Gate 6 → adopt | MANDATORY Gate 6 |

**Absorption flow (from §16.2 — Logos + Aletheia pair):**
1. **Agora CF4a**: `kbase search "{capability}"` — does this already exist?
2. **Logos (CP 4.1)**: scope candidate — S-coordinate slot, integration mode, QL extension needed
3. **Aletheia (CP 4.5)**: verify alignment — redundancy risks, which gate need does it serve?
4. **Gate 6**: approve combined proposal
5. On approval: Logos executes integration; Zeithoven registers new tool in TOOLS.md;
   `aletheia-self-extend --mode coordinate` updates COORDINATE-MAP.md with new capability

**Specific integrations to document in skill as known candidates (from §16.3):**

| Integration | S-coord | Mode | Status |
|------------|---------|------|--------|
| mgrep (mixedbread-ai/mgrep) | S3-1' (Hen augment) | Fork + Z-Thread | Planned: `mgrep watch` = first Z-Thread |
| claude-mem (thedotmack/claude-mem) | S3-0' (Khora complement) | MCP register | Two instances: CC native + OpenClaw |
| context7 (upstash/context7) | S3-5' (Aletheia oracle) | MCP register | Live docs ground truth |
| DevOps automation pack | S2 (Technē infra) | Curated consume | Git/commit discipline for workshop agents |
| ccpi marketplace | Reference only | Reference | HOW-to patterns, not auto-install |

**claude-mem notes:**
- Both instances configured with Gemini Flash embeddings (free tier, consistent across memory layers)
- Three-layer memory: claude-mem (hook-level) + OneContext (project-level) + Khora/Hen (plugin-level)
- Integration: `claude-mem SessionEnd → compact summary → Hen session_complete → Khora archives → oc_commit → Night'`

**context7 usage by gate skills:**
- aletheia-stack-traverse: validates S-coordinate capability claims against live library docs
- Anansi --gap: validates "planned" capability actually supported by current library version
- aletheia-self-extend --mode coordinate: before promoting gap→current, context7 confirms library support

- [ ] Read `VAK-SUPERPOWERS-INTEGRATION-SPEC.md` §16 in full
- [ ] Write `aletheia-plugin-integrate/SKILL.md`
- [ ] Include Agora CF4a RAG-retrieval as mandatory FIRST step
- [ ] Include all 5 known candidates as documented examples in skill
- [ ] mgrep: document Z-Thread registration via Janus as first concrete Z-Thread realisation
- [ ] claude-mem: document three-layer memory architecture and Gemini Flash embedding requirement
- [ ] Commit: `feat(aletheia): write aletheia-plugin-integrate skill + plugin taxonomy`

---

### Task 22: Wire context7-cli and claude-mem as CLI-based integrations

**No MCP.** Both integrations use the CLI bridge pattern (`spawnSync("epi", [...])` or direct
process spawn) — architecturally consistent with how ta-onta already works.

**context7:** CLI tool from https://github.com/VedanthB/context7-cli (not the Upstash MCP server).
Install: `npm i -g context7-cli` (or equivalent). Usage: `context7 query "{library}" "{question}"`.
Register as a Pleroma bounded primitive alongside `bkmr_kbase` and `epi_cli`.

**claude-mem:** Already has live HTTP interface at `http://localhost:37777/api/observations`.
Aletheia currently calls this directly. This is correct and sufficient — keep as-is.
No MCP registration needed; direct HTTP is the right pattern for a local service.

**Files:**
- Modify: `.pi/extensions/ta-onta/pleroma/S2/pleroma-primitives.ts` — add context7 to PRIMITIVE_REGISTRY
- Create: `.pi/extensions/ta-onta/pleroma/skills/context7/SKILL.md` — context7 usage skill

**context7 PRIMITIVE_REGISTRY entry:**
```typescript
{
  name: "context7",
  description: "Live library documentation oracle. Resolves library IDs and returns version-specific docs.",
  allowChildExtension: false,
  executionMode: "bounded"
}
```

**context7 usage (for gate skills and Anansi):**
- aletheia-stack-traverse: `context7 query "{library}" "{capability claim}"` to validate S-coordinate assertions
- Anansi --gap: validate "planned" capability actually supported by current library version
- aletheia-self-extend --mode coordinate: before promoting gap→current, confirm library support

- [ ] Install context7-cli and verify `context7` binary works
- [ ] Add context7 to `PRIMITIVE_REGISTRY` in `pleroma-primitives.ts`
- [ ] Write `pleroma/skills/context7/SKILL.md` documenting usage patterns for gate skills + Anansi
- [ ] Verify claude-mem HTTP at localhost:37777 is operational (no changes needed)
- [ ] Add `.onecontext/` to `.gitignore` if not already present
- [ ] Commit: `feat(integrations): add context7-cli as Pleroma primitive, confirm claude-mem HTTP`

---

## Updated Implementation Order

**Phase 0 (P0 — must complete before anything else):**
- Task P0.1, P0.2, P0.3 (infrastructure debts — parallel)

**Phase 1 (constitutional foundation):**
- Task 1 (C'/VAK grammar doc) — no dependencies
- Task 2 (S4Frame verification) — no dependencies
- Task 3 (Anima parent agent.md) — P0 blocker fix
- Task 5 (Aletheia root agent.md) — P1 blocker fix

**Phase 2 (agent completion):**
- Task 4 (audit 6 constitutional agents) — after Task 3
- Task 6 (4 stub mode-functions) — after Task 5
- Task 12 (6 cluster RUPA.md files) — after Task 6

**Phase 3 (skills):**
- Task 7 (7 skill forks) — after Task 1
- Task 8 (verify 4 native VAK skills) — after Tasks 1,7
- Task 13 (6 gate skills) — after Task 12
- Task 14 (4 traversal skills) — after Task 13

**Phase 4 (runtime wiring):**
- Task 9 (CFP1/CFP3 dispatch in extension.ts) — after Task 3
- Task 10 (Sophia hook) — after Task 4
- Task 11 (CS state propagation) — after Task 9
- Task 15 (hen-integration.ts wiring) — after Task 13
- Task 16 (chronos-integration.ts wiring) — after Task 13

**Phase 5 (Technē + Anansi):**
- Task 17 (Technē CLI skills + pleroma-skill-proxy) — after Phase 4
- Task 18 (Technē WebMCP skills) — after Task 17
- Task 19 (COORDINATE-MAP.md + Anansi skill) — after Phase 4
- Task 20 (wire paradigmatic loop into Night') — after Tasks 14, 19

**Phase 6 (plugin integration):**
- Task 21 (aletheia-plugin-integrate skill) — after Task 19
- Task 22 (MCP registrations + security) — after Task 21

**Parallel tracks:**
- **Track A:** P0.1, P0.2, P0.3 → Tasks 3, 4, 9, 10, 11 (constitutional + extension wiring)
- **Track B:** P0.3 → Tasks 5, 6, 12 (Aletheia root + clusters)
- **Track C:** Tasks 1, 7, 8 (grammar doc + skill forks)
- **Track D:** Task 13, 14 (gate + traversal skills — after Track B)
- **Track E:** Tasks 15, 16 (integration wiring — after Track D)

---

## Scope Excluded from This Plan

These are tracked separately and should NOT be implemented here:

- `M4_Oikonomia_State` Rust struct (requires clock integration — see CLOCK-AND-NARA-SPECS/)
- Cosmic clock integration with VAK (see docs/plans/CLOCK-AND-NARA-SPECS/)
- SpacetimeDB presence layer wiring
- Kerykeion kairos integration (K-series tasks — separate)
- REPL/Darshana skill (`darshana.py`) — separate tooling task
- bkmr semantic indexer setup — separate infrastructure task
- Obsidian skills fork (`kepano/obsidian-skills`) — separate task (filesystem/git, not TypeScript)
- `M5_VAK_Frame[7]` C struct and `M4_Oikonomia_State` (requires clock integration — CLOCK-AND-NARA-SPECS/)
