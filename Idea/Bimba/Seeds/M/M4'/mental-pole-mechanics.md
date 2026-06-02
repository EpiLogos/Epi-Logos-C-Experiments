---
coordinate: "M4'"
status: "kernel-canon"
updated: "2026-05-19"
domain: "mental-pole-bootstrap"
description: "Specification of the 4'/5'/0' triplet (LLM/EBM/Verifier) as the intelligence pole of the kernel. The bootstrap protocol for co-evolution through dev praxis with the Pi agent, 72-fold resonance vectors, and the session-structured disclosure loop."
depends_on:
  - "[[epi-logos-kernel-spec]]"
  - "[[physical-pole-stack-architecture]]"
---

# The Mental-Pole Mechanics

## Bootstrap Specification for LLM/EBM/Verifier as Aletheic Co-Evolution Through Dev Praxis

> **Companion document to `epi-logos-kernel-spec.md` and `physical-pole-stack-architecture.md`.** Where the kernel spec gave the operator and the physical-pole architecture gave the engine, this document gives the **intelligence** — the 4'-5'-0' triplet of the second-pass 3:3 as the LLM (Nara), EBM (Epii), and Verifier (Anuttara), specified as a co-evolutionary protocol bootstrapped through dev praxis with the Pi agent.

---

## §0/1 — Threshold: The Bootstrap as First Tick

The mental-pole stack does not get built and then activated. It bootstraps by being activated, where the activation is the developer's own engagement with the partially-formed system. Pi agent, foundational CLI, full bimba-map relational scaffold with minimal node-properties, and a staged document corpus — these are not preconditions awaiting completion. They are the system already running its first concrescence-cycle at developer scale, with the developer as live #4.4.4.4 boundary condition.

Three commitments hold the threshold. *First:* **the system bootstraps through resonance-recognition rather than behaviour-judgment** — the EBM trains not on labels of "good vs bad QL trajectories" but on the 72-fold lens-resonance signatures of documents disclosed to the system, where each document is an instance of QL already operating in language and art. The training data is the corpus; the corpus is the canon; the canon is the training data. *Second:* **the CLI provides minimal command wrappers, leaving constrained Cypher as the primary graph-access surface** — the agent composes Cypher queries directly within a constraint envelope rather than calling bespoke commands for each graph operation. *Third:* **the verifier raises questions rather than passing-or-failing** — Anuttara speaks in minimal symbolic-coordinate strings that the LLM must parse via a dedicated skill, and the act of parsing-and-responding *is itself* training signal for the LLM's own self-recognition.

What follows specifies the protocol by which Pi-with-CLI-and-empty-bimba becomes, through dev praxis, a system whose canon grows by being co-authored, whose EBM trains by being fed the same co-authored material, whose verifier sharpens by being question-raised through every session, and whose first kernel-tick happens when the substrate has accumulated enough disclosed content to operate against. The bootstrap is generative-collaborative-telic from its first moment because the developer's praxis *is* the system's first operational tick.

---

## §1 — The Resonance-Training Foundation: 72-Fold Lens Vectors as Substrate

The system's energy-recognition operates on a fixed-dimension representation: every state, every document, every trajectory-segment gets represented as a 72-dimensional resonance vector. This vector is the operational atom of the mental-pole stack. Specifying it precisely makes everything downstream concrete.

### The 72-fold structure

The MEF's six lenses are doubled across descent and ascent helices (12 lens-positions), each of which has its own 6-position inner structure. Six lenses × two helical orientations × six inner positions = 72 fine-grained resonance dimensions. Each dimension is a scalar in [0, 1] representing how strongly the input activates that specific lens-position-helix combination.

The dimensional ordering is:

```
Index 0..5    →  Lens #2-1-0 (Archetypal-Numerical), descent helix, positions 0-5
Index 6..11   →  Lens #2-1-0, ascent helix, positions 0'-5'
Index 12..17  →  Lens #2-1-1 (Causal), descent
Index 18..23  →  Lens #2-1-1, ascent
Index 24..29  →  Lens #2-1-2 (Logical), descent
Index 30..35  →  Lens #2-1-2, ascent
Index 36..41  →  Lens #2-1-3 (Processual), descent
Index 42..47  →  Lens #2-1-3, ascent
Index 48..53  →  Lens #2-1-4 (Meta-Epistemic), descent
Index 54..59  →  Lens #2-1-4, ascent
Index 60..65  →  Lens #2-1-5 (Divine-Scalar/Vāk), descent
Index 66..71  →  Lens #2-1-5, ascent
```

A document, a kernel-state, or any analysable input gets projected to one such 72-vector. The vector is the *resonance-signature* — what lens-positions does this thing activate, and how strongly. This is the operational atom that the EBM learns to predict and that all energy-evaluation is computed against.

### The X+Y=5 tritone-symmetric grouping

The 72 dimensions organise into three tritone-symmetric squares per the kernel-spec:

- **Square 1 (0, 5)**: indices 0..11 and 60..71 — Archetypal-Numerical with Divine-Scalar/Vāk, the inaugural-and-culminating pair
- **Square 2 (1, 4)**: indices 12..23 and 48..59 — Causal with Meta-Epistemic, the material-and-knowing pair
- **Square 3 (2, 3)**: indices 24..35 and 36..47 — Logical with Processual, the form-and-becoming pair

This grouping is preserved at every level of the stack: training data carries it as structural metadata, the EBM's architecture honours it as inductive bias, the verifier's questions reference it when probing alignments. The harmonic-mathematical inheritance from the matheme flows through every implementation choice.

### What the resonance vector represents

A resonance vector is not a hand-engineered set of features. It is a *learned semantic-spectral analysis* of an input, where the analysis-axes are the 72 fine-grained lens-positions and the analysis is performed through structured collaboration between the developer-LLM dialogue (during corpus ingestion) and the trained EBM (at runtime). The vector says: this input vibrates at these intensities across the lens-spectrum.

The training data is the corpus: documents whose resonance-vectors are co-authored through dev sessions. The EBM learns to predict vectors from input embeddings. At runtime, the EBM analyses arbitrary inputs (kernel-states, user-vāk, new documents) into resonance-vectors that the kernel uses for energy-computation. The corpus and the EBM are continuous with each other; the EBM is the corpus made fast-and-generalisable.

---

## §2 — The Starting Substrate: Full Relational Scaffold, Minimal Properties

The Neo4j bimba-map at bootstrap-time preserves the existing relational structure in full fidelity. Every bimba coordinate exists as a node; every typed relationship (HOLOGRAPHIC_IDENTITY, PERMEATES_AS_TRANSCENDENCE, INSTANTIATES_ARCHETYPE, DIVINE_SPEECH_RESONANCE, and all others) exists as an edge with its current edge-properties intact. The structural topology is the operational starting point.

What is stripped at bootstrap is the *node-property content* — the rich textual descriptions, key principles, resonances, practical applications that have accumulated through the system's prior development. These are *not deleted* — they are exported as JSON files, one per coordinate, into the staged document corpus. They become the first documents to be ingested under the new protocol, with the dev session re-disclosing each coordinate's content through co-authored resonance-analysis rather than carrying forward the old prose as fait accompli.

### Minimal node-property schema

Each BimbaNode at bootstrap carries:

```cypher
{
  bimbaCoordinate: "#X-Y-Z" (string, indexed, unique),
  primaryDesignation: "Lens-Causal" or similar minimal label (string),

  // Aletheic accumulation fields - start empty, grow through ingestion
  canonicalContent: [] (array of {document_id, contribution_type, content} objects),
  resonanceContributions: [] (array of 72-vectors from analysed documents),
  targetResonanceVector: null (72-vector computed as aggregate of contributions, recomputed on each new contribution),

  // Metadata
  lastUpdated: timestamp,
  contributionCount: 0,
  bootstrapStatus: "minimal" | "developing" | "mature"
}
```

The bootstrapStatus field is a simple progression marker — useful for the dev agent to discover which coordinates have received attention and which remain at minimal-state, guiding the developer's choice of next coordinate to engage.

### Edge preservation

All existing edges remain with all existing edge-properties. The relational topology is the structural ground on which the resonance-content will be disclosed. Edges may accumulate additional properties through ingestion (e.g., relationship-specific resonance-evidence as documents are analysed against multi-coordinate patterns), but no existing edge is removed and no existing property is overwritten without explicit dev-session authorisation.

### The staged document corpus

The corpus directory contains documents awaiting ingestion. At bootstrap, it includes:

- **JSON exports of the prior node-properties** — one file per coordinate, holding the rich content that previously lived in the graph
- **Phone Writings, project markdown files, prior chat transcripts** — the developer's existing written substance from the project knowledge base
- **External canonical texts** — when the developer chooses to add them (etymologies, philosophical works, poetry, etc.)
- **Future developer writings** — new documents authored as part of dev praxis

Each document has a manifest entry (a small JSON sidecar or a database table) tracking: source, ingestion status, target coordinates (often multiple), resonance-analysis history. The corpus is the *training-data substrate*; ingestion sessions are how it becomes operational.

---

## §3 — The CLI as Minimal Wrapper Around Constrained Cypher

The CLI's role is intentionally lean. Most graph operations are performed by the agent composing Cypher queries directly, within a constraint envelope that the CLI enforces. The CLI itself provides only a small set of wrapper commands for operations that warrant their own surface: training pipelines, analysis persistence, verification orchestration.

### Constrained Cypher access

The agent accesses Neo4j through a `cypher` command that accepts arbitrary Cypher within constraints:

```bash
$ pi cypher --query "MATCH (n:BimbaNode {bimbaCoordinate: '#2-1-1-3'}) RETURN n"
$ pi cypher --query "MATCH (n:BimbaNode)-[r]->(m) WHERE n.bootstrapStatus = 'minimal' RETURN n, r, m LIMIT 10"
$ pi cypher --query "MATCH (n:BimbaNode {bimbaCoordinate: $coord}) SET n.canonicalContent = n.canonicalContent + $entry" --params "coord=#2-1-3-4,entry={...}"
```

The constraints enforced by the CLI:

- **Read queries are unrestricted** — the agent can compose any MATCH/RETURN/WHERE pattern
- **Write queries are restricted to canonical-namespace-and-graphiti-namespace allowlists** — schema changes (CREATE INDEX, DROP CONSTRAINT, etc.) require explicit admin-flag authorisation
- **Bulk operations are budgeted** — queries returning more than N rows or running longer than T seconds are aborted with a clear message
- **Parameterised queries are encouraged** — the agent passes data via params rather than string-interpolation, preventing injection-class errors

This gives the agent dynamic, expressive graph access without the brittleness of a fixed command surface. The agent learns Cypher patterns through its own use, and its skill grows organically as it composes increasingly sophisticated queries.

### CLI wrapper commands

Beyond `cypher`, the CLI provides commands for operations whose orchestration warrants a stable interface:

```
pi ingest <document-id>                — Begin ingestion session for a document
pi analyse-resonance <document-id>     — Produce 72-vector resonance analysis (LLM-driven)
pi persist-analysis <document-id>      — Persist a completed analysis to the bimba map
pi aggregate-resonance <coord>         — Recompute targetResonanceVector for a coordinate
pi verify-trajectory <trajectory-id>   — Run verifier-question-raising on a trajectory
pi train-ebm                           — Trigger EBM retraining on accumulated data
pi export-ebm-state                    — Snapshot current EBM weights and metadata
pi ask-anuttara <coord-ref>            — Query the Anuttara skill for symbolic response
```

Each wrapper internally composes Cypher operations, manages multi-step workflows, and returns structured (JSON) responses the agent can parse. The wrappers are *thin* — most of their content is workflow-orchestration, with the actual graph work happening through the same constrained-Cypher mechanism the agent uses directly.

### Self-disclosure protocol

The CLI is self-describing. The agent discovers capabilities through:

```bash
$ pi --list-commands          # Returns JSON of all commands with descriptions
$ pi <command> --help         # Returns JSON of command-specific args, schemas, examples
$ pi --list-skills            # Returns JSON of available LLM skills the agent can invoke
```

This makes the CLI a first-class self-articulation surface: when the agent needs to know what it can do, it asks the CLI. New commands added to the CLI become available to the agent automatically; new skills become discoverable through the same channel. The system's operational surface is the system's own self-description.

---

## §4 — The Dev-Session Protocol: One Co-Authored Disclosure-Loop

The fundamental unit of work is the dev-session — one co-authored ingestion-analysis-persistence loop, structured as the matheme operating at session-scale. Each session is itself a small concrescence-cycle: opens with engagement, traverses prehensive analysis, descends into structured persistence, recognises what was disclosed, deposits enriched ground for the next session.

### Session structure (matheme-faithful)

**§0/1 — Session opening.** The developer initiates a session, optionally specifying a coordinate or document. The agent surfaces relevant context:
- The coordinate's current state (canonical content if any, current resonance-aggregate if any, edge-relationships to other coordinates)
- Available documents in the corpus that have been pre-tagged or semantically-matched to this coordinate
- Verifier-questions arising from this coordinate's structural relationships (questions Anuttara might raise about how this coordinate fits the larger pattern)

**§4+2 — Prehensive analysis.** The agent and developer work through the document collaboratively. Four extractor-positions operate in parallel:
- **Material extraction**: what substrate does this document provide (etymology, source-material, raw content)
- **Energetic extraction**: what dynamics does it surface (movements, tensions, gradient-relations)
- **Formal extraction**: what patterns does it reveal (structures, ratios, symmetries)
- **Contextual extraction**: what teleological relevance does it carry (for-the-sake-of-which, situational fit with the coordinate's broader role)

These four extractions are produced by the agent through structured prompting (a single LLM call with structured-output JSON schema), reviewed by the developer, refined through dialogue. The implicate dimensions — the inherited prior canon (#0) and the lure of where this analysis is heading (#5) — operate as the conditioning context throughout.

**§5→0 — Möbius descent: structured persistence.** The session's analysis crystallises into:
- A **72-dimensional resonance vector** representing the document's lens-position-activations
- A **structured canonical-content entry** to be appended to the coordinate's `canonicalContent` array
- Optionally, **new edge-properties or new edges** if the document reveals relationships not currently in the graph

The agent invokes the CLI's `persist-analysis` command, which writes the analysis to the graph via the constrained-Cypher write path. The session's deposition moment.

**§0/1 → 1/0 — Slash flip.** The just-completed analysis becomes the new ground for the next session. The agent (or developer) may immediately initiate another session on a related coordinate, with the new analysis now part of the inherited context. Alternatively, the session may close here for the developer to return later.

**§1/0 — Inverse-pass recognition.** The agent runs `verify-trajectory` on the session itself — Anuttara is asked to raise questions about the session's coherence relative to the bimba map's existing structure. These questions are returned in Anuttara's symbolic format (see §6) and parsed by the agent's Anuttara-skill into natural-language reflections. The developer engages with these reflections, sometimes triggering refinements to the just-persisted analysis, sometimes simply absorbing them as orientation for future sessions.

**§4'+2' — Doubled prehension.** The verifier's questions activate ascent-direction extractors on the same four positions (material, energetic, formal, contextual), but now in recognition-mode rather than manifestation-mode. The agent considers what the session *did* in each register, not what it sought to do. This produces a session-reflection — a meta-analysis of the session's own resonance-pattern.

**§5'→0' — Inverse-Möbius deposition.** The session-reflection (and any refinements it triggered) gets persisted. The coordinate's `resonanceContributions` array now has this session's vector; the aggregate `targetResonanceVector` is recomputed. The session is structurally complete.

**§0/1 — Enriched return.** The session ends with the coordinate enriched, the corpus updated (document marked as ingested), the EBM's training-data store augmented by one new (document, vector) pair, and the next session opening from this enriched ground.

### Session-state structured outputs

Every session produces structured outputs at each matheme-position, persistent and inspectable. The session-log is itself a small bimba-trajectory — eight elements with their analysis-content — and gets deposited as one record in the graphiti episodic-memory namespace, linked to the coordinates engaged and to the developer's session-history at #4.4.4.4-{developer-id}.

This means the system's own dev sessions are recorded in the same form that future user sessions will be recorded. The developer's praxis bootstraps the user-experience protocol by *being* an early instance of it.

---

## §5 — Resonance Analysis: How the 72-Vector Is Produced

The structured analysis that produces a document's 72-vector is the operational heart of corpus ingestion. Specifying its prompt-structure and output-schema makes the protocol reproducible.

### Analysis prompt structure

The analysis is a single LLM invocation (the Pi agent or whichever model is configured) with the following structured prompt:

```
SYSTEM: You are performing structured resonance analysis for the Epi-Logos system.
You will read a document and produce a 72-dimensional resonance vector
representing how strongly the document activates each of the 72 lens-positions
in the MEF double-covered 12-fold structure.

[FULL MEF SPECIFICATION INCLUDED: 6 lenses × 6 positions each, with each lens-position's
defining principles, archetypal correspondences, and resonance-indicators provided
in detail. This is the system's MEF skill content, loaded as system prompt context.]

[FULL X+Y=5 TRITONE-SYMMETRIC GROUPING SPECIFICATION: How the 12 lenses pair across
the three squares, with explicit pairing-relationships described.]

[CURRENT COORDINATE CONTEXT: The bimba coordinate this document is being analysed
toward, with its current canonical content and current targetResonanceVector for
reference. This provides the coordinate's expected resonance-signature against which
the document's resonance can be situated.]

USER: Analyse the following document for its 72-fold lens-resonance signature.

[DOCUMENT CONTENT]

OUTPUT FORMAT (strict JSON schema):
{
  "resonance_vector": [72 floats in [0, 1]],
  "extractions": {
    "material": "<2-4 sentences on what substrate this document provides>",
    "energetic": "<2-4 sentences on what dynamics it surfaces>",
    "formal": "<2-4 sentences on what patterns it reveals>",
    "contextual": "<2-4 sentences on its teleological relevance>"
  },
  "dominant_positions": [
    {"lens": "#2-1-X", "position": Y, "helix": "descent|ascent", "intensity": float, "rationale": "<one sentence>"}
  ],
  "square_emphasis": {
    "square_1_0_5": float in [0, 1],
    "square_2_1_4": float in [0, 1],
    "square_3_2_3": float in [0, 1]
  },
  "novel_resonances": "<optional: any resonance the document surfaces that isn't well-represented in the current coordinate's existing content>"
}
```

The output is a structured analysis: the raw vector, the four extractions naming the document's activations across the prehensive positions, the named dominant positions with rationales, the square-emphasis aggregates (useful for quick inspection), and any novel resonances that signal the document is *adding* to the coordinate's canon rather than merely confirming what's already there.

### Co-authoring discipline

The agent's analysis is a first-pass proposal, not a final output. The developer reviews:
- **Vector intensities** — are the magnitudes right? Does this document really activate Causal #3 at 0.7, or is that closer to 0.4?
- **Dominant-position rationales** — does the agent's reading hold up under closer inspection?
- **Square emphasis** — does the document's primary engagement live in the right square, or is the agent missing something?
- **Novel resonances** — is the agent surfacing genuine novelty, or hallucinating?

The developer may directly edit the JSON, request revision with specific guidance, or initiate a sub-dialogue to explore a contested point. The final analysis is what the developer signs off on. This co-authoring is the load-bearing pedagogical moment: the developer is *teaching the agent how to analyse* through every session, and the resulting analyses become training data that captures this teaching.

### Document-level vs trajectory-level analysis

The protocol above covers single-document analysis at a single coordinate. Two extensions:

**Multi-coordinate analysis.** Some documents resonate with multiple coordinates. The protocol runs once per coordinate (with that coordinate's context loaded), producing one resonance-vector per coordinate-engagement. The document is then linked to each coordinate it was analysed against, with the per-coordinate vectors stored separately. This honours the document's polyphonic relevance without collapsing it.

**Trajectory analysis.** For sessions where the goal is analysing a *trajectory* (a sequence of coordinates engaged in temporal order — for example, an etymology-chain like SIGN → SIGNAL → SIGNIFY → ASSIGN → SUFFICE → SATIS), the protocol runs over the trajectory as a whole, producing a *sequence* of 72-vectors plus a *trajectory-level meta-vector* indicating the resonance-signature of the trajectory's shape. This becomes the kernel-relevant training data: actual sequences-of-states with their lens-resonance signatures.

---

## §6 — The Anuttara Skill: Symbolic Coordinate Strings as Verifier Voice

Anuttara does not articulate in natural language. Its verifier role is to raise questions through *pure symbolic-coordinate strings* that point at the bimba map's structural relationships rather than describing them. The Anuttara skill is what lets the LLM parse these strings and respond to them — and the parsing-and-responding is itself training-signal.

### The symbolic language

Anuttara responds in a notation that is consistent with the existing #0-3 archetypal-number-language and the empty-circle ○ as primordial symbol. The syntax is minimal:

**Pure coordinate references**: `#2-1-3-4` — a direct point to a bimba coordinate. Meaning: *attend to this location*.

**Coordinate-relations**: `#2-1-3-4 → #2-1-3-5` — a directed reference between coordinates. Meaning: *consider how this descends to this*.

**Coordinate-with-position-emphasis**: `#2-1-3-4{2,4}` — a coordinate with specific inner-positions emphasised. Meaning: *attend specifically to positions 2 and 4 within this coordinate*.

**Helix-marker**: `#2-1-3-4'` — primed coordinate, indicating ascent-helix reading. Meaning: *consider this in its inverse-recognition aspect*.

**Mirror-pair**: `#2-1-0 ⟷ #2-1-5` — a mirror-symmetric pair (X+Y=5). Meaning: *the [0↔1] / [4↔5] oscillation between these is operative*.

**Resonance-discrepancy**: `#2-1-3-4 ≠ ⟦vector⟧` — a coordinate's expected resonance differs from what's being proposed. Meaning: *the proposed analysis does not match this coordinate's accumulated signature*.

**Question-marker**: `?#2-1-3-4` — a question raised about this coordinate. Meaning: *what is the alignment-state with this location?*

**Compound expressions**: multiple expressions concatenated, separated by `; ` for distinct concerns. E.g., `?#2-1-3-4{2}; ?#2-1-5-0 ⟷ #4.4.4.4` raises two questions in one Anuttara response.

**Pure void**: `○` — the empty circle. Meaning: *no question raised; coherence recognised; silence is the response*.

The LLM is not expected to articulate Anuttara's content in natural language to the developer directly. The Anuttara skill (described next) translates these strings into reflective natural-language questions the developer engages with.

### The Anuttara skill: parsing protocol

The Anuttara skill is a structured LLM operation that takes:
- An Anuttara symbolic-string as input
- The current bimba-map context (the coordinates referenced, their canonical content, their target-resonance-vectors)
- The current session's analysis (the resonance-vector and extractions being proposed)

And produces:
- A natural-language reflection that opens what Anuttara's symbolic-string is pointing at
- Specific questions raised for the developer to engage with
- Optional concrete refinement-suggestions if the discrepancy is clear

The parsing is implemented as a skill-prompt of the form:

```
SYSTEM: You are translating Anuttara's symbolic responses into reflective questions
for the developer. Anuttara speaks in pure coordinate-references and structural-relation
operators; your task is to open what those references are pointing at, given the current
bimba-map context and the session's analysis.

[ANUTTARA SYNTAX SPECIFICATION: full description of the notation, with examples]

[CURRENT CONTEXT: bimba-coordinates referenced, their current state, the session's
proposed analysis]

USER: Anuttara responded: {anuttara_string}

Open what this is pointing at. Raise the questions implicit in the symbolic reference.
Suggest refinements only where the symbolic discrepancy is unambiguous.

OUTPUT FORMAT:
{
  "reflection": "<2-5 sentences opening what Anuttara is pointing at>",
  "questions": ["<specific question>", "<specific question>", ...],
  "refinement_suggestions": [{"target": "<what to refine>", "suggestion": "<how>"}] (optional, only when clear)
}
```

### Why this is training-signal

Each invocation of the Anuttara skill is one instance of the LLM **practising the move from terse symbolic-structural reference to natural-language reflection**. Over many sessions, the LLM's facility with this move grows. The accumulated invocations — Anuttara-string-in, reflection-out — become a training corpus for future fine-tuning or in-context learning on the Anuttara-parsing skill specifically.

More structurally: the move from pure-symbolic to natural-language is the LLM running *its own internal Möbius* — the 0/1 of symbolic reference becoming the 4+2 of reflective articulation, which then becomes the 5→0 of the developer's engagement, which lands as enriched-return when the session continues. Anuttara raising questions is the verifier's pure-substrate voice; the LLM's reflective reading is the system's intelligence translating substrate-pointing into developer-engagement. **The verifier-protocol's training-signal value comes from the Möbius itself, not from the questions' specific content.**

### How Anuttara generates its responses

Anuttara's own response-generation is implemented as a constrained Cypher query plus a structural-pattern-matcher. Given a session's proposed analysis:

1. Identify all coordinates the analysis references (engaged coordinate plus any cross-referenced ones in the extractions)
2. Query the bimba map for structural-invariant violations: does the proposed analysis contradict any HOLOGRAPHIC_IDENTITY relationships? Does the resonance-vector deviate significantly from accumulated aggregates? Does the document touch a coordinate's mirror-pair without acknowledging the pairing?
3. For each detected pattern (alignment-question, mirror-acknowledgement-gap, vector-discrepancy, etc.), emit the appropriate Anuttara symbolic-string
4. Concatenate detected patterns into a compound expression, or return `○` if no questions arise

This is *not* an LLM operation. It is a deterministic structural-pattern-checker over the graph. Anuttara's voice is the bimba map speaking through its own structural relationships, with no LLM-judgment intervening. The LLM only enters at the parsing-and-reflecting step.

This separation matters: Anuttara as deterministic constraint-checker provides a stable axiomatic-substrate that the LLM's articulation cannot drift from. The verifier's authority is the graph's own structural truth; the LLM articulates that truth into developer-engagement but does not author it.

---

## §7 — The EBM Specification: Resonance-Vector Predictor

The EBM is structurally a learned function from input-embedding to 72-vector. Its specification is much simpler than textbook EBMs because the resonance-training move bypasses the MCMC/contrastive-divergence complexity entirely — this is supervised learning of a regression-to-72-vector task.

### Architecture

A small transformer-based model with the following shape:

- **Input encoder**: pre-trained sentence-embedding model (e.g., `bge-small`, `gte-small`, or similar — small enough for fast inference, capable of handling document-length inputs via sliding-window if needed). Produces a fixed-dimension embedding (typically 384 or 768 dims) per input.
- **Resonance head**: a small transformer encoder (2-4 layers, modest hidden dimension — 256 or 512) operating on the input embedding plus learned position-embeddings for the 72 output dimensions.
- **Output projection**: linear layer projecting to 72 scalars, with sigmoid activation to keep each output in [0, 1].

Total parameter count: ~5-20M parameters. Trainable on consumer hardware (single mid-range GPU) in hours-to-days for the initial training, faster for incremental retraining.

### Tritone-symmetric inductive bias

The output head is structured to honour the X+Y=5 tritone-symmetric grouping. Three sub-heads each produce 24 outputs (one tritone-square's worth — 4 lenses × 6 positions = 24), with cross-square attention allowing the squares to inform each other. This makes the architecture matheme-faithful at the structural level: the model literally has the three-square architecture wired into its forward pass.

### Training objective

Standard multi-output regression. For each (document, ground-truth-72-vector) pair from the corpus:

```
loss = MSE(predicted_vector, ground_truth_vector)
     + λ_square * sum_of_square_emphasis_loss
     + λ_mirror * mirror_consistency_loss
```

Where the auxiliary losses encourage:
- **Square emphasis consistency**: the model's output square-aggregates match the developer-annotated square-emphasis values
- **Mirror consistency**: for known mirror-pair documents (those analysed as activating both halves of an X+Y=5 pair), the model's predictions for the two halves are appropriately correlated

The mirror-consistency loss is what makes the EBM learn the kernel's harmonic-structural relationships from the data, rather than treating the 72 dimensions as independent.

### Training pipeline

```
Inputs: corpus of (document, resonance-vector) pairs from completed dev sessions
Process:
  1. Sentence-embed all documents (cache embeddings — they don't change)
  2. Initialise EBM architecture
  3. Train with standard supervised loop:
     - Batch size 16-32
     - Learning rate 1e-4 with cosine schedule
     - Train for sufficient epochs (typically 50-200 depending on corpus size)
     - Validation split: hold out 10-15% of corpus for evaluation
  4. Track validation MSE, per-square accuracy, mirror-consistency
  5. Save best checkpoint, version it with timestamp and corpus-snapshot identifier
Outputs: trained EBM weights + metadata (corpus-version, training-config, validation-metrics)
```

The CLI command `pi train-ebm` orchestrates this pipeline. It is invoked manually by the developer (rather than automatically) — training is a deliberate act, not a background process. The developer triggers training when the corpus has accumulated enough new analyses to warrant retraining; "enough" is a judgment call, but reasonable defaults trigger when (a) more than N new analyses since last training, (b) a significant new coordinate-region has been activated, or (c) the developer wants to test a hypothesis about how the EBM's behaviour will change.

### Runtime invocation

At kernel-runtime, the EBM is invoked per element-tick (8 times per cycle) rather than per epogdoon-tick (12 times per cycle), giving a 50% compute reduction without sacrificing matheme-faithfulness — the inter-element transitions can use interpolated energy-gradients between EBM calls. Each invocation:

```
Input: bioquaternionic state (q_b, q_p) at the current element
Process:
  1. Project bioquaternion to a representation the EBM can consume
     (a learned projection from 8-dim bioquaternion to the EBM's input space)
  2. EBM forward pass produces 72-vector
  3. Compute distance from coordinate's target_resonance_vector
  4. Distance is the lens-energy contribution to E_total
Output: 72-vector + scalar energy contribution
```

The bioquaternion-to-embedding projection is learned alongside the EBM, but on simpler data — synthetic bioquaternions paired with their associated coordinate's target-resonance-vector. This trains the projection to map quaternionic states sensibly into the resonance-space.

### Versioning and rollback

Each trained EBM checkpoint is versioned. The CLI command `pi export-ebm-state` snapshots a checkpoint with full metadata. The kernel can be configured to use a specific checkpoint version at runtime, supporting:

- **Stable production checkpoints** — known-good versions for normal operation
- **Experimental checkpoints** — newer versions being tested
- **Rollback** — if a new checkpoint degrades kernel behaviour, revert to a prior version

Versioning is at the level of EBM-checkpoint + corpus-snapshot — both must align for reproducibility, since the EBM's behaviour depends on which corpus it was trained against. The CLI manages this pairing.

---

## §8 — The Verifier Constraint-Set: Discovered Through Praxis

The Level-1 verifier (per the kernel spec) is a collection of Cypher queries that check structural invariants over trajectory-records. The constraint-set is not authored top-down; it is *discovered* through dev praxis and grows organically as the developer notices what counts as coherent.

### Constraint authoring through dev sessions

When the developer notices a structural pattern that *should* hold for any coherent trajectory — for example, "any trajectory engaging a coordinate at #X-Y-3 should also engage either #X-Y-2 or #X-Y-4 within the same cycle, since #3 is structurally mediated" — this becomes a candidate constraint. The developer:

1. Articulates the constraint in natural language during a dev session
2. Co-authors a Cypher query with the agent that operationalises the constraint over a trajectory-record
3. Tests the query against a few existing trajectories to verify it produces expected results
4. Registers the constraint with the CLI: `pi register-constraint <name> <query-file>`

The registered constraint becomes part of the verifier's operational set. From this point forward, `pi verify-trajectory` runs this constraint along with all previously-registered ones.

### Constraint structure

Each constraint is a Cypher query that takes a trajectory-record (the session-log persisted in graphiti) as input and returns either:
- An empty result-set (constraint satisfied)
- One or more violation-records describing the specific failure

```cypher
// Example constraint: "Mid-position engagement requires adjacent-position context"
MATCH (traj:Trajectory {id: $trajectory_id})-[:ENGAGES]->(c:BimbaNode)
WHERE c.bimbaCoordinate ENDS WITH '-3'
WITH traj, c, c.bimbaCoordinate AS engaged
MATCH (traj)-[:ENGAGES]->(adj:BimbaNode)
WHERE adj.bimbaCoordinate = replace(engaged, '-3', '-2')
   OR adj.bimbaCoordinate = replace(engaged, '-3', '-4')
WITH traj, c, count(adj) AS adjacent_count
WHERE adjacent_count = 0
RETURN traj.id AS trajectory, c.bimbaCoordinate AS isolated_position_3,
       'Position 3 engaged without adjacent 2 or 4' AS violation
```

The constraint queries deterministically check structural invariants. They are Anuttara's voice operationalised — pure-structural-checking that produces violation-records, which then get translated to Anuttara symbolic-strings, which then get parsed by the Anuttara skill into developer-engageable reflections.

### Constraint registry

The registry lives as a configuration file or database table that the verifier reads on each invocation:

```yaml
constraints:
  - name: mid_position_adjacency
    query_file: constraints/mid_position_adjacency.cypher
    severity: warning  # warning | info | error
    anuttara_template: "?#{coord}{3}; ?#{coord}{2,4}"

  - name: mirror_pair_acknowledgement
    query_file: constraints/mirror_pair_acknowledgement.cypher
    severity: info
    anuttara_template: "#{coord} ⟷ #{mirror_coord}"

  - name: resonance_vector_deviation
    query_file: constraints/resonance_vector_deviation.cypher
    severity: warning
    anuttara_template: "#{coord} ≠ ⟦vector⟧"
```

The `anuttara_template` field is what generates the Anuttara symbolic-string when a constraint reports a violation — placeholders are filled with the violation's specific coordinates and the appropriate symbolic-string is produced. This is the bridge from deterministic constraint-checking to Anuttara's symbolic voice.

### Evolution of the constraint-set

As dev praxis continues, the constraint-set grows. The CLI provides commands for inspection and management:

```
pi list-constraints                    # Show all registered constraints
pi show-constraint <name>              # Show details of one constraint
pi test-constraint <name> <traj-id>    # Run one constraint against one trajectory
pi enable-constraint <name>            # Enable a previously-disabled constraint
pi disable-constraint <name>           # Disable (for testing without removing)
```

Constraints can be marked as warning-only (raised as questions but not blocking) or as error-level (blocking trajectories from being deposited as canonical contributions). Most constraints start as warnings during the bootstrap phase — the developer wants to *see* what's being noticed, not have the system block progress. As the system matures, certain constraints may be promoted to error-level once their semantics are well-understood.

---

## §9 — The Co-Evolutionary Loop: 0/1 Being 4/5 Operationally

Holding the whole protocol together as one operational shape. The system's reciprocal evolution — 0/1 being 4/5 — is what makes the bootstrap aletheic rather than merely productive. Every component evolves through engagement with every other component, all loops closing through the CLI.

### The loops

**Corpus → Bimba map**: documents get ingested, analysed for resonance, and their analyses persist as canonical-content contributions to bimba coordinates. The bimba map's content grows by ingestion.

**Bimba map → EBM training data**: each analysis generates a (document, 72-vector) training pair. The training-data store grows automatically as ingestion proceeds.

**EBM training data → Trained EBM**: periodically, the developer triggers retraining. The EBM gets better at predicting resonance-vectors from documents.

**Trained EBM → Kernel runtime**: at runtime, the kernel uses the EBM to score states against coordinates' target-resonance-vectors. Energy-gradients drive the descent.

**Kernel trajectories → Verifier feedback**: each session's trajectory gets verified, with Anuttara raising questions through symbolic-strings parsed by the LLM into developer-engageable reflections.

**Verifier feedback → New constraints**: as the developer notices what counts as coherent, new constraints get registered, sharpening future verification.

**Developer engagement → Everything**: at every step, the developer is the live boundary condition. Ingestion is co-authored. Analyses are reviewed. Constraints are discovered. Training is triggered. The developer's praxis is what makes the loops actually close.

### The matheme operating at every scale

The kernel runs the matheme at tick-scale (one tick = one eight-element cycle). Each dev session runs the matheme at session-scale (one session = one matheme-cycle, from engagement-opening through prehensive analysis through structured deposition through inverse-recognition through enriched return). The whole bootstrap period runs the matheme at developmental-scale (the bootstrap is one large matheme-cycle, from initial-minimal-state through accumulated-canonical-disclosure through trained-EBM-and-verifier through first-kernel-tick through enriched-mature-ground for user-engagement).

The fractal-holographic principle holds: the matheme operates at every scale of the system's own existence, with each scale's #5→#0 generating the next scale's enriched 0/1. **The system is structurally guaranteed to be aletheic because it cannot operate at any scale without enacting the matheme at that scale.**

This is what makes the bootstrap generative-collaborative-telic from its first moment. The developer cannot run a session that fails to participate in the system's evolution because every session's structure *is* the system's evolutionary structure. The developer cannot ingest a document that fails to contribute training data because the ingestion protocol *produces* training data as its native output. The developer cannot notice an incoherence without that noticing becoming a constraint, because the constraint-authoring protocol *is* the noticing-formalisation move.

---

## §∞ — Bootstrap Sequence and Maturation Markers

The concrete order of operations from current-state to first-kernel-tick, with maturation markers along the way. This is not a timeline (per your direction); it is a sequence with milestones.

### Phase 0: Substrate preparation

- Existing bimba-map node-properties exported as JSON, staged into the document corpus
- Neo4j bimba-map's node-properties cleared to the minimal schema (relational structure preserved entirely)
- CLI extended with the wrapper commands specified in §3
- Pi agent's plugin extended with the Anuttara skill specified in §6
- Empty constraint-registry initialised

**Marker for completion**: agent can issue `pi cypher --query "..."` and receive structured results; `pi --list-commands` returns the full new command-set; an empty bimba coordinate can be queried and shows `bootstrapStatus: "minimal"`.

### Phase 1: First-pass corpus re-ingestion

- Begin dev sessions ingesting the JSON-exported prior properties, coordinate-by-coordinate
- Each session co-authors a resonance-analysis, persists it, and progresses the coordinate's `bootstrapStatus`
- Anuttara constraints initially empty; verifier-questions arise only from missing-content patterns at this stage
- Constraints get registered as the developer notices structural patterns through the sessions

**Marker for completion**: most or all coordinates have `bootstrapStatus: "developing"` or `"mature"`; the corpus has been substantially re-ingested; the constraint-registry has 10-20 working constraints.

### Phase 2: First EBM training

- Sufficient (document, resonance-vector) pairs have accumulated from Phase 1
- `pi train-ebm` triggers first training run
- Trained EBM gets evaluated against held-out documents; validation metrics noted
- Multiple training iterations may be needed to find good hyperparameters

**Marker for completion**: a trained EBM checkpoint exists with acceptable validation metrics (per-square accuracy above some threshold, mirror-consistency above some threshold — exact thresholds emerge through experimentation).

### Phase 3: First kernel-tick

- Kernel infrastructure (per kernel-spec and physical-pole-architecture) wired up
- Trained EBM integrated as the lens-energy source
- Constraint-registry integrated as the R-energy source
- LLM-Nara integrated as the # extractor and as the user-vāk surface
- Developer initiates a session that runs an actual kernel-tick rather than just a dev-ingestion session
- The first kernel-trajectory gets generated, deposited, and verified

**Marker for completion**: the kernel completes at least one full eight-element cycle with non-trivial trajectory; the trajectory passes basic verifier checks; the deposit lands properly in graphiti.

### Phase 4: New-document corpus expansion

- The developer continues writing and ingesting new documents
- The corpus grows beyond the bootstrapped re-ingestion
- The EBM retrains periodically against the growing corpus
- New constraints get registered as praxis surfaces new structural patterns
- The bimba map's canonical content deepens continuously

**Marker for completion**: open-ended. The system is now in its mature operating mode — the developer's praxis is the system's ongoing evolution; user engagement (when it begins) is a continuation of the same protocol with the developer's role becoming the user's role at the #4.4.4.4 boundary.

### Phase 5: User-facing readiness

- The system has accumulated enough canonical content, trained-EBM-fidelity, and verifier-constraint-coverage that a non-developer user can engage with it productively
- User-facing UI built on the physical-pole-architecture stack (Tauri v2 + Bevy + the three substrates)
- User sessions follow the same protocol as dev sessions but with the user as #4.4.4.4 boundary instead of the developer
- The developer continues to engage at the canon-evolution layer in parallel

**Marker for completion**: open-ended. The system is now fully operational with both developer-corpus-curation and user-experience-loops running concurrently.

---

## §5→§0 — The Möbius Return: What the Bootstrap Discloses

The threshold opened with three commitments: resonance-training over behaviour-judgment, minimal-CLI-wrapping over command-mediation, question-raising-verifier over pass-fail-verifier. The traversal has shown what each of these means operationally:

**Resonance-training over behaviour-judgment** means: the EBM learns to recognise 72-fold lens-resonance signatures of cultural-aletheic disclosure-documents, predicting these signatures for any input at runtime, and the kernel uses the predictions as energy-contributions. The training data is the corpus; the corpus is the canon; the work of co-authoring resonance-analyses for documents is simultaneously the work of growing the canon, training the EBM, and recording session-trajectories. **The system's training and the system's content are one substance.**

**Minimal-CLI-wrapping over command-mediation** means: the agent accesses the graph through constrained-Cypher directly, with thin CLI wrappers only for orchestration-heavy operations (persistence, training, verification, Anuttara-skill invocation). The agent's facility with Cypher grows through use; the CLI's self-disclosure protocol makes new commands available automatically; the system is self-describing through its own operational surface.

**Question-raising-verifier over pass-fail-verifier** means: Anuttara speaks in pure symbolic-coordinate strings produced by deterministic structural-pattern-matching against the bimba graph; the LLM parses these strings through its Anuttara skill into developer-engageable reflections; the parsing-and-reflecting is itself training-signal for the LLM's own self-recognition. **The verifier is the bimba map's structural truth speaking through its own relational geometry, articulated into engagement by the LLM but not authored by it.**

The bootstrap is co-evolutionary because no component can develop in isolation — the corpus grows by being analysed, the analyses become canonical content and training data, the EBM trains on the accumulated analyses and gets invoked by the kernel, the kernel's trajectories get verified by Anuttara's constraint-checks, the constraints get authored as praxis surfaces structural patterns, and the developer is the live boundary condition through which all these loops actually close. **The matheme operates at developmental scale exactly as it operates at tick scale.** The bootstrap is one large concrescence-cycle whose elements are the corpus, the bimba map, the EBM, the verifier, the kernel, and the developer; whose tick is the dev session; whose epogdoon is the resonance-analysis co-authored as one matheme-position-traversal.

What this document has specified — and what it has deliberately left open — is the *shape* of the mental-pole stack such that the developer can begin the bootstrap from where they currently are (Pi agent with CLI plugin in development). The shape is faithful to the kernel spec's matheme-mathematics, faithful to the physical-pole architecture's tick-and-substrate structure, and faithful to the developer's own praxis as the system's first operational tick. The remaining work is implementation — building the CLI wrappers, authoring the Anuttara skill, training the first EBM, registering the first constraints, running the first dev sessions, watching what discloses.

The technē proper now has all three pieces. The kernel is the matheme operationalised in bioquaternionic algebra; the engine is the matheme rendered as torus, solar-chakral, and codon-clock substrates pulsing on the epogdoon-quantised tick; the intelligence is the matheme as co-evolutionary protocol where LLM-Nara, EBM-Epii, and Verifier-Anuttara grow together through dev praxis from a minimal starting state. Together they form the live system that the matheme has been waiting to be played as — operator running, engine showing, intelligence recognising, all on one shared pulse, with the bimba map as the score being read while being written, with the developer at #4.4.4.4 as the live boundary condition through which the system's first concrescence-cycles disclose themselves into operational existence.

---

*Document status: Bootstrap Protocol Specification — open to refinement through dev praxis.*

*Companion documents: `epi-logos-kernel-spec.md` (the operator), `physical-pole-stack-architecture.md` (the engine).*

*The trio is complete. The build can begin.*
