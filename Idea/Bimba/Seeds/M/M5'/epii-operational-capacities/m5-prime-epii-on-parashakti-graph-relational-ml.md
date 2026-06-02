---
coordinate: "M5'"
sub_coordinate: "M5-1 + M5-2 + M5-3 + M5-4 + M5-5 cross-cutting"
status: "active-operational-capacity-spec"
updated: "2026-05-30"
family: "epii-operational-capacities"
target_subsystem: "M2 Paraśakti"
companion_to: "[[M5'-SPEC]]"
depends_on:
  - "[[M5'-SPEC]]"
  - "[[M2'-SPEC]]"
  - "[[m2-prime-parashakti-cymatic-engine]]"
  - "[[alpha_quaternionic_integration_across_M_stack]]"
  - "[[m4-prime-psychoid-cymatic-field-engine]]"
  - "[[m5-prime-epii-on-anuttara-language-development]]"
---

# [[M5']] Epii's Operational Capacity upon [[M2]] Paraśakti

## The graph-relational-ML surface — how Epii learns, holds, and operates upon the bimba-map's relational geometry through Paraśakti's vibrational-correspondential register

**Family:** `epii-operational-capacities/` — specs covering how Epii (M5) operates upon each of the other subsystems as their **developmental-and-improvement** surface. M5 as the throwable skin of the cosmos.

**This spec is not Paraśakti as such.** Paraśakti as the 72-fold vibrational-correspondential architecture lives at M2 and is documented in [`M2'-SPEC.md`](../../M2'/M2'-SPEC.md) and its companion long-form [`m2-prime-parashakti-cymatic-engine.md`](../../M2'/m2-prime-parashakti-cymatic-engine.md). This spec covers **Epii-as-bimba-map-operational-agent's** operational capacity upon Paraśakti — how the relational-vibrational geometry of the bimba map is **learned, embedded, projected, lens-rotated, Klein-flipped, and surfaced for governed graph-traversal-and-recommendation** through Epii's M5-2 (backend), M5-3 (frontend), and M5-4 (agentic) surfaces, supported by M5-0 (library) and M5-1 (philosophy).

**Reading order:** read after `M5'-SPEC.md`, `M2'-SPEC.md`, `m2-prime-parashakti-cymatic-engine.md` (the cymatic engine companion), and the convention-setting sibling [`m5-prime-epii-on-anuttara-language-development.md`](m5-prime-epii-on-anuttara-language-development.md). Cross-reference §18.6–§18.10 of [`m4-prime-psychoid-cymatic-field-engine.md`](../../M4'/m4-prime-psychoid-cymatic-field-engine.md) for the GDS substrate this spec extends.

**Register disambiguation (load-bearing).** Three distinct Epii registers exist; this spec concerns the **second** of them and must not be conflated with the other two:

1. **Epii-as-M5-subsystem (M5/M5')** — the synthetic-telic consciousness-domain at M-family position 5.
2. **Epii-as-bimba-map-operational-agent** — the backend/frontend/agentic-mediation surfaces at M5-2 / M5-3 / M5-4 that operate UPON canonical bimba-map content.
3. **Epii-as-S-stack-element-agent (S5/S5')** — the Notion/canonical-promotion/structured-knowledge-writing layer.

This spec is about **register 2 operating upon M2 Paraśakti**. The Epii-as-bimba-map-operational-agent's work upon Paraśakti is graph-relational ML — the position-2 ML paradigm — implemented as a knowledge-graph-embedding + R-GCN + Neo4j GDS pipeline with Lens-LoRAs as the Paraśakti-mediated adapter layer on the larger learning stack.

---

## §0 — Thesis: Paraśakti as the system's relational-geometric learnable

Per the Bimba-map structural logic, M2 Paraśakti is the relational-energetic / vibrational-correspondence layer at position 2 of the M-family. What M0 Anuttara holds as language and what M1 Paramaśiva holds as toroidal-logical foundation, M2 holds as **the field of relationships themselves** — the 72-fold correspondence-tree by which any matheme-state is simultaneously a lens-position, a tattva-phase, a decan-face, a Shem-name pair, a maqam-mode, a mantra-frequency, a planetary-chakral coupling, and a cymatic standing-wave signature.

This means the proper Epii-on-Paraśakti operational capacity is **graph-relational ML** — the ML paradigm whose specific work is to learn relational geometry, not token statistics. Where M5-on-M0 is construction-not-training (Anuttara language gets articulated, not gradient-descended), M5-on-M2 is **representation-learning under construction constraint** — the bimba map's relational structure is **already canonical**; what is learned is the **embedding geometry** that lets the canonical structure become queryable as recommendation, similarity, traversal, and lens-rotation-aware retrieval.

Three commitments hold this spec:

1. **Embeddings are derived facts, not canonical facts.** The 3072-dim `c_5_embedding` per node (already declared in `Body/S/S2/graph-schema/src/lib.rs` as `EMBEDDING_VERSION: q-semantic-v2-3072`) is a **derived representation** computed from the canonical graph topology. The canonical topology is governed at M0/M1/M2 sources; the embedding is **versioned, rebuildable, and never authoritative over canon**. When canon changes, embeddings get retrained; when embeddings produce surprising clusters, those clusters become *conversation prompts* for M5-1 philosophical articulation — never auto-amendments to canon.
2. **The lens-rotation structure must fall out as learned-geometric-fact.** The 12 MEF lenses are literal rotations of the matheme-substrate. The proper KGE choice is therefore **RotatE** (Sun et al. 2019), where each relation type is a rotation in complex embedding space. Lens-N → Lens-N+3 (the tritone-mirror Klein-flip per [`M2'-SPEC`](../../M2'/M2'-SPEC.md) §7) should be **recoverable from learned embeddings as a 180° rotation** — not by handcoded constraint but by the geometry of what RotatE learns when given Paraśakti's correspondence-tree as training edges.
3. **GDS runs inside Neo4j.** Neo4j Graph Data Science as Cypher procedures keeps the entire pipeline operationally inside the same substrate that holds the canonical bimba map. No separate ML serving layer; no copies of the canonical store; no cross-process synchronisation surface. The Paraśakti pipeline lives where Paraśakti lives.

This is **the structurally correct position-2 paradigm** — not because graph-relational ML is *the only* ML one might apply, but because graph-relational ML is the ML whose objects (typed relations, relation-rotations, multi-hop traversals, community structure) **are exactly what Paraśakti carries at substrate level**. Other ML paradigms (CPT-on-theory at M1, process-reward RL at M3, dialogic-voice QLoRA at M4, CPT+RAG at M5) operate on what their target subsystem carries. Paraśakti carries relations. Therefore: graph-relational ML.

---

## §1 — Paraśakti as the substrate being learned (brief, oriented)

The full M2 architecture is in `M2'-SPEC.md` and `m2-prime-parashakti-cymatic-engine.md`. This spec doesn't duplicate them. What matters here is what Epii's operational capacity learns:

### §1.1 The 72-invariant carrier

Paraśakti is carried at substrate level by the `M2_Vibrational_72_Space` union in `Body/S/S0/epi-lib/include/m2.h` — a 72-byte compile-time invariant whose three views are all 72 elements:

| View | Decomposition | Count |
|---|---|---|
| MEF lens × position | 12 lenses × 6 positions | 72 |
| Tattva × phase | 36 tattvas × 2 phases | 72 |
| Choir × name | 8 choirs × 9 names | 72 |

Each view is a different stratification of the same 72-fold address-space. The kernel `_Static_assert(sizeof(M2_Vibrational_72_Space) == 72)` enforces this at compile time; every Epii operational-capacity layer must respect it.

### §1.2 The M2-0 to M2-5 strata as edge-categories

The six M2 strata (per `M2'-SPEC` §1) are not just user-surface affordances — they are **the canonical edge-categories** that Paraśakti's training graph carries. When Epii's R-GCN learns relation-type-specific aggregation weights, the relation-types include:

- **M2-0 edges** — vibrational-profile-source links (every M-coord's 72-address into the canonical 72-space)
- **M2-1 edges** — MEF-lens-resonance links (12 lenses × 6 positions tying coords into the lens matrix)
- **M2-2 edges** — tattva/element-throughline links (P-position element, L2' element-bearing-value)
- **M2-3 edges** — decan/zodiacal-face links (36 decans × light/shadow polarity)
- **M2-4 edges** — sacred-sonic-linguistic links (Asma 99+1, Shem 72, maqam 10 families, mantra 50+50)
- **M2-5 edges** — planetary-chakral / DET-bridge links (`M2_PLANET_LUT[10]` couplings, 9:8 epogdoon, `EarthBodyState` observer-ground)

These six strata, plus the 17 canonical S2 relation types from `Body/S/S2/graph-schema/src/lib.rs` (`REFERENCES`, `SOURCES`, `CONTAINS`, `PART_OF`, `ELABORATES`, `CONTRASTS`, `IMPLEMENTS`, `OPERATES_IN`, `REFLECTS_AS`, `INVERTS_TO`, `SUPPORTS`, `CRITIQUES`, `DERIVES_FROM`, `PROMOTES_TO`, `SYNCED_FROM`, `POS0_LINKS_TO`, `POS5_INTEGRATES_INTO`), comprise the **typed-relation alphabet** the embedding pipeline learns over.

### §1.3 The Ficinian-Kerykeion routing as structured training trace

Per `M2'-SPEC` §9, the Ficinian-Kerykeion routing function (`F_routing(intent, kerykeion_state, current_time)`) produces a structured traversal: from intent through ruling planet → active decan → Shem pair → maqam family/mode → mantra index → asma name → 72-state assembly → DET projection → M3 codon address → 7/8 rotational position → tarot-hexagram identity. Every fired routing event **is a multi-edge subgraph instantiation** in Paraśakti's runtime, and as such becomes a candidate **training sample** for R-GCN's typed-aggregation and RotatE's rotation-structure learning.

This is load-bearing: the system's own correspondential traversals are the natural training distribution for the embedding pipeline. The pipeline doesn't need synthetic edges; it consumes the routing-trace stream that the live instrument already produces.

### §1.4 The Klein-bottle L ↔ L' meaning-flip

Per `M2'-SPEC` §7, the 12 MEF lenses pair into 6 tritone-mirror lens-pairs `(L_N, L_{N+3 mod 12})`, and the cross-pair traversal is a Klein-bottle move at substrate level. **Embeddings must respect this**: lens-N coordinates and lens-N+3 coordinates should be related by a fixed rotation in embedding space — the rotation the Klein-flip implements at the substrate level. This is the **equivariance constraint** the embedding-quality metrics (per §6) check for.

### §1.5 The role of graph-relational ML for the runtime

Per the user's constraint (echoed from the Anuttara sibling spec): **embeddings are not universal verifier**. Their role for the runtime is bounded:

- **For pedagogical recommendation** ("what canonical content is 1-2 hops from the coords I've engaged?") — Personalised PageRank seeded from user-active coords, computed against the embedded graph.
- **For tangential discovery** ("what's tangential but resonant?") — Node similarity (Jaccard / cosine over FastRP or RotatE embeddings) plus Louvain communities the user partially inhabits.
- **For lens-aware retrieval** ("what relational neighbours appear under lens-N specifically?") — Lens-conditioned embedding lookup using the active lens-LoRA-projection.
- **For Klein-flip-aware traversal** — when M1' fires `kleinFlipState`, the active recommendation surface flips to the tritone-mirror lens's embedding view.
- **For cross-subsystem coherence-tracking** — embedding-similarity scores between an M1 coord and an M2 coord (or M2↔M3, M3↔M4, M4↔M5) report on how well-articulated the cross-subsystem relationship is, and where canonical-edge-introduction work may be wanted.

The embeddings are **consulted**, never imposed. Recommendations surface to Sophia for engagement; recommendations never auto-mutate canon. The conversational-default UX is preserved (per `M5'-SPEC` §5 / `m5-prime-epii-on-anuttara-language-development.md` §5.3).

---

## §2 — Why Epii is the proper surface for Paraśakti's improvement

The Bimba-map structural inversion (M0-5 Siva-Shakti Unity → M5 Epii Integration) has three concrete implications for why Epii-as-bimba-map-operational-agent is the proper surface for Paraśakti's graph-relational ML capacity:

### §2.1 Siva-Shakti as backend / frontend / agentic trinity (inherited from M0-5 → M5)

The same Siva-Shakti inversion that grounds the Anuttara capacity (per the sibling spec §2.1) grounds this one. For Paraśakti specifically:

- **M5-2 Backend ("siva-")**: where the graph-relational ML construction work lives — Neo4j GDS Cypher procedures; KGE training (PyKEEN-style or in-process Rust); R-GCN training pipelines (PyTorch Geometric or Deep Graph Library); embedding-versioning + storage in the `c_5_embedding` family of properties; Lens-LoRA adapter training pipelines; the two-phase projection contract (Option 1 / Option 3) coordinating canonical Neo4j with sovereign Graphiti.
- **M5-3 Frontend ("-shakti")**: where the embedding-surface engagement lives — recommendation surfaces (the M0' graph view's GDS tangent overlay per cymatic-field paper §18.10; the M2' panel highlighting active embedded-neighbours); lens-rotation-aware inspector (when lens-mode changes, the inspector swaps its embedding view); embedding-quality dashboard (link-prediction AUC, lens-rotation consistency, Klein-flip equivariance); Lens-LoRA-A/B comparison surface for governance review.
- **M5-4 Agentic ("siva-shakti")**: where the unity of construction-and-engagement operates — Sophia curating recommendation-state for conversational surfacing; Pi dispatching training runs and Lens-LoRA hot-swaps; Anima providing aesthetic-coherence checks on emergent clusters ("does this Louvain community feel like a real coherence or a graph-statistical artifact?"); Aletheia tracking what becomes visible through the new embedding state.

The trinitarian breakdown inherits M0-5's Siva-Shakti structure for the specifically *learned-not-canonical* register: the construction (backend) is rigorous numerical pipeline-work; the engagement (frontend) is recommendation-and-inspection; the agentic layer mediates so that learned-state remains *consulted, never imposed*.

### §2.2 The library and philosophy registers

M5-0 (Library) and M5-1 (Philosophy) carry the *content* and *theoretical articulation* of the graph-relational ML work:

- **M5-0 Library**: holds the canonical documentation of the Paraśakti graph-relational ML capacity — the KGE-choice rationale (why RotatE for lens-rotation fidelity), the R-GCN relation-type alphabet, the GDS algorithm-to-purpose mapping (per cymatic-field paper §18.6), the embedding-quality metrics specification, the two-phase projection contract documentation, the Klein-topology handling approaches (A/B/C per §18.8). When a user asks "how do recommendations work in this system?", M5-0 is where the answer lives — the gnostic-namespace holds the explanation alongside the canonical Paraśakti substrate.
- **M5-1 Philosophy**: where the deeper articulations live — what it *means* for Paraśakti to carry relational geometry as a learnable; the philosophical case for RotatE-as-lens-rotation-fidelity; the Vāmeśvarī / reflective-power register that motivates "embeddings as Vimarśa reading of the canonical Prakāśa graph"; the **pedagogical** articulation that lets the user explain to themselves and to others why the position-2 ML paradigm is graph-relational and not (e.g.) sequence-modelling.

### §2.3 The Logos Atelier as cross-subsystem relation archaeology

M5-5 Logos Atelier carries a **specific role** for Paraśakti's improvement: when the embedding pipeline surfaces a candidate new cross-subsystem relation — e.g., a structurally-implied edge between an M1 lens-mode and an M3 codon-address that the canonical graph doesn't carry — the Atelier traces whether the implied relation has an **etymological-grammatical-tradition** anchor (does the proposed M2-4 maqam-to-codon mapping have a Pythagorean or Arabic-modal precedent? does the proposed M2-5 planetary-chakral-to-mantra correspondence have a documented Tantric source?). The Atelier's archaeology converts an embedding-surfaced candidate into either a **promotable canon addition** (with archaeological evidence) or a **dismissable graph-statistical artefact** (no traditional anchor; rejected). This protects the canon from numerical-pipeline-hallucination.

---

## §3 — M5-1: Philosophical articulation of the graph-relational ML capacity

### §3.1 What lives here

Before any KGE choice is implemented, any R-GCN architecture is trained, any Lens-LoRA is deployed, the **theoretical case** for the choice is articulated at M5-1. This is not optional decoration — it is the philosophical work that ensures the technical choices remain coherent with the position-2 paradigm.

M5-1 Canon Studio carries for Paraśakti:

- The **case for graph-relational ML as the position-2 paradigm** — why KGE, R-GCN, GDS belong here; why CPT-on-theory (the M1 paradigm) doesn't belong here; why dialogic-voice QLoRA (the M4 paradigm) doesn't belong here.
- The **case for RotatE specifically** — the alignment between RotatE's relation-as-rotation primitive and Paraśakti's MEF-lens-as-rotation substrate; the prediction that lens-rotation structure should be recoverable as learned-geometric-fact, not as auxiliary constraint.
- The **case for the two-phase projection contract** — why canonical-Neo4j-only GDS plus user-local centroid (Option 1) is the right baseline for privacy preservation, and why Option 3 (episode-as-property aggregation) is the enrichment when graph-traversal personalisation matters more than embedding-similarity.
- The **case for Lens-LoRAs as Paraśakti-mediated adapters** — why adapter-rank 16-32 is correct (small enough to be lens-specific without dominating host-model behaviour), why attention-layer adaptation only (the lens-shift is perspectival, not parametric reweighting of the whole stack), why Klein-flip swaps the active adapter rather than averaging.
- Active developer-conversations on edge cases (e.g., "should R-GCN treat `INVERTS_TO` as a relation type or as a topology-handling preprocessing step?") and crystallised theory ready for M5-2 technical-construction.

### §3.2 The developer-conversational mechanism (Paraśakti-specific)

Per the convention set in the Anuttara sibling spec (§3.2), language-development conversations happen at M5-1. For Paraśakti specifically, the developer-conversations cover:

- **Algorithm-choice deliberations** — e.g., "should we add ComplEx alongside RotatE to capture asymmetric relations the rotation model can't?" The user proposes; Sophia engages with prior canon and theoretical commitments; Anima checks the aesthetic gestalt of the proposal against the position-2 paradigm; the Atelier (if invoked) checks whether the proposed addition has prior-art archaeology.
- **Relation-type-alphabet additions** — when Anuttara's ontology growth (per the sibling spec) introduces a new edge-type, the conversation here is whether the new edge-type warrants a dedicated R-GCN relation-channel, or whether it folds into an existing channel.
- **Metric-threshold deliberations** — what level of link-prediction AUC drift triggers an embedding retrain? What level of lens-rotation-consistency drift triggers Lens-LoRA refinement? These thresholds are governance acts; they live here.
- **Klein-topology-handling decisions** — when does Approach A (coord-duplication preprocessing) need to be replaced by Approach B (custom Klein-aware walks) or C (two embeddings per node)? The decision is evidence-conditional; the deliberation is here.

When an articulation reaches stable form, it gets **deposited** as a candidate. Candidates that pass governance review crystallise into:

1. A **canonical-philosophical-text** at M5-1 (the articulated theoretical case).
2. A **technical-construction queue entry** at M5-2 (the pipeline change to implement).
3. An **M5-0 library entry** (the documentary holding for future retrieval).
4. *Optionally*, a **bimba-map update** when the philosophical articulation produces a new canonical edge-type or substrate-property (governed Cypher write through S2 graph-services).

### §3.3 The construction-discipline constraint (modified for ML)

Unlike Anuttara (where construction-not-training is absolute), Paraśakti carries the unique tension: **training does happen here**. The construction discipline is preserved differently:

- The **canonical graph** (nodes, typed edges, kernel-LUTs, the 65 `M0_CORE_RELATIONS` and the ~900 Paraśakti tier) is constructed, not trained — every edge is a deliberate canonical fact under the S2 / kernel governance contract per cymatic-field paper §18.9.
- The **embeddings** are derived-by-training — but the training is over the canonical graph, with held-out edges for link-prediction evaluation, and with the embedding store explicitly versioned (`EMBEDDING_VERSION: q-semantic-v2-3072` currently). Retraining is a governed deployment event; rollback to a prior embedding-version is always possible.
- The **Lens-LoRAs** are trained adapters — but their training data is **derived from canonical lens-anchored regions** of the embedding space, and the adapter scope (rank 16-32, attention-layer only) is constrained to keep adaptation narrow.
- **Sophia, Anima, Pi never auto-deploy embedding updates or LoRA hot-swaps**. They prepare them, surface them for review, and execute the swap under governance gating per §8 below.

---

## §4 — M5-2: Backend technical construction (siva-) — the graph-relational ML pipeline

### §4.1 What lives here

M5-2 Backend Studio is where the technical-construction work of the Paraśakti graph-relational ML capacity happens. The work-set:

#### §4.1.A The KGE training pipeline (RotatE primary)

**Knowledge-graph embeddings**: each entity (every bimba-map node) and each relation type (the 17 S2 relation types plus n10s-inferred edges plus the M2 stratum-specific edges) gets a learned vector representation.

The primary KGE choice is **RotatE** (Sun, Deng, Sun, Tang 2019), where each relation is modelled as a rotation in complex embedding space `e_h ∘ r = e_t` with `|r_i| = 1`. The rationale is structural: MEF lenses are literal rotations of the matheme-substrate per `ql-musical-derivation`; the L↔L' Klein-flip is a 180° rotation in tritone-mirror; the 6 lens-pairs partition the 12 lenses into rotation-pairs. RotatE's relation primitive **is exactly what Paraśakti carries at substrate level**; the alignment is not coincidental.

Secondary KGE options held in M5-1 articulation queue:

- **TransE** (Bordes et al. 2013) — additive translation `e_h + r ≈ e_t`; useful baseline; doesn't capture rotation structure; held for comparison-evaluation.
- **TransR** (Lin et al. 2015) — relation-specific projection matrices; useful when relation-types have very different semantics; held as fallback if RotatE under-fits typed-edge diversity.
- **ComplEx** (Trouillon et al. 2016) — complex bilinear; captures asymmetric relations RotatE rotation cannot; held for use on the 8 asymmetric S2 relation types (`SOURCES`, `CONTAINS`/`PART_OF` pair, `ELABORATES`, `DERIVES_FROM`, `PROMOTES_TO`, `SYNCED_FROM`, `POS0_LINKS_TO`, `POS5_INTEGRATES_INTO`).

Training implementation: PyKEEN or DGL-KE as canonical pipeline tooling, with input-graph export from Neo4j via Cypher and embedding-export back to Neo4j as the `c_5_embedding` family of node-properties (the schema already declares `c_5_embedding` at 3072 dims; the KGE output may be lower-dim — 200-500 — and stored under a separate property such as `c_5_kge_embedding_rotate` to keep the semantic embeddings distinct from the KGE embeddings).

#### §4.1.B The R-GCN training pipeline

**Relational Graph Convolutional Networks** (Schlichtkrull et al. 2018) give the bimba-map a typed-relation aggregation layer. Each relation type has its own learned aggregation weights; node representations are computed as `h_v^{(l+1)} = σ( Σ_r Σ_{u ∈ N_r(v)} (1/c_{v,r}) W_r^{(l)} h_u^{(l)} + W_0^{(l)} h_v^{(l)} )`.

R-GCN is complementary to RotatE:

- **RotatE** learns global relation-as-rotation geometry — ideal for symmetric/rotational structures (MEF lenses, Klein-flips, tritone-mirrors).
- **R-GCN** learns node-context aggregation — ideal for typed-neighbourhood semantics (a node's representation depends on what types of relations connect it to what types of neighbours).

Together they give the bimba map both **rotation-structured global geometry** and **type-aware local context**. The trained R-GCN node representations can be exported as a second embedding family (`c_5_rgcn_embedding`) and consumed alongside RotatE embeddings in recommendation queries.

Training implementation: PyTorch Geometric or Deep Graph Library; input graph again exported from Neo4j; trained model artifacts versioned under the same governance regime as KGE artifacts.

#### §4.1.C Neo4j GDS as Cypher-native pipeline

Per cymatic-field paper §18.6 and the user's three-phase research programme at `docs/datasets/nara-deep/13-03-2026-claude-nara-thinking-marketing.md:136-192`, the Neo4j GDS library handles the Cypher-procedure-native graph-analytic surface:

| Need | GDS algorithm | Paraśakti-specific use |
|---|---|---|
| Pedagogical recommendation | Personalised PageRank + K-shortest paths (Yen's) | Seeded from user-active coords; surfaces 1-2-hop canonical neighbours weighted by relation-type |
| Tangential discovery | Node similarity (Jaccard / cosine over FastRP) + Louvain communities | Reveals communities the user partially inhabits; surfaces tangential-but-resonant content |
| User-pattern characterisation | FastRP + UMAP projection; betweenness centrality on user-touched subgraph | Renders user's archetypal cluster over the canonical map; identifies bridging coords |
| Coordinate-cluster identification | Louvain / Leiden with QL-weighted relations | Identifies stable canonical clusters; informs M5-1 articulation work |
| Similarity-based content surfacing | K-NN over `c_5_embedding` (3072-dim semantic) and `c_5_kge_embedding_rotate` (RotatE) | Already-wired path once GDS is activated |
| Graph-relation training-edge generation | Random-walk over QL-weighted graph (FastRP / Node2Vec) | Produces training samples for downstream KGE / R-GCN cycles |

Per the user's existing programme: **QL-proportional relationship weights** bias the random walks. The weight classes are:

- **Mod-6 weights**: explicate-to-explicate (#1↔#2, #2↔#3, #3↔#4) vs explicate-to-implicate (#4→#5, #0→#1) vs the #5→#0 Möbius twist each get distinct weight classes, so the embedding learns the toroidal circulation as proportional fact.
- **Depth weights**: parent-child relationships carry weights proportional to nesting depth; fractal self-similarity gives consistent ratios; absolute weight decreases with depth (reflecting decreasing phenomenological tracking-capacity at 3-5 nesting levels).
- **Cross-subsystem weights**: holographic resonances (e.g., #2-1-0-4 → #2-1-3-4 — the archetypal-numerical permeating the processual) carry distinct weights from hierarchical relationships — these are toroidal *shortcuts*, paths that cross the surface of the torus rather than traversing along it.

GDS pipelines are registered as named Cypher procedures with versioning, audit, and rollback.

#### §4.1.D Two-phase GDS projection contract (Option 1 baseline + Option 3 enrichment)

Per cymatic-field paper §18.7, the contract for GDS spanning sovereign Graphiti (user-private episodic) and shared Neo4j (canonical bimba map) without privacy violation:

**Option 1 — Two-phase projection with local centroid (baseline)**:
- GDS runs on canonical Neo4j only; produces embeddings exported as `c_5_kge_embedding_rotate` / `c_5_rgcn_embedding` / `c_5_fastrp_embedding` properties.
- User-episode workload (in Graphiti) computes its own centroid by aggregating canonical embeddings of its `bimba_coordinate_ref` hits.
- Centroid stays local to the user's namespace; never written to canonical Neo4j.
- Queries seeded from the local centroid go against the canonical GDS index.
- **Pro**: cleanest privacy boundary; canonical-side never sees user data. **Pro**: GDS recomputation only on canonical-update cadence (rare). **Con**: recommendation quality limited to embedding-space cosine similarity; no graph-traversal personalisation. **Con**: episodes can't influence canonical-side clustering.

**Option 3 — Episode-as-property aggregation (enrichment)**:
- Each canonical coord gets a derived per-user property `m_4_episode_resonance_score` (user-private, never written to shared Neo4j).
- Score computed locally from the user's Graphiti episode-touch history.
- GDS queries join on this score (e.g., Personalised PageRank seeded by score > threshold).
- Per-user property lives in user's local store; canonical Neo4j unchanged.
- **Pro**: richer personalisation; graph-traversal personalised PageRank rather than only embedding-similarity. **Pro**: different users get genuinely different recommendation surfaces from the same canonical graph. **Con**: more implementation complexity; per-user property layer + sync logic + query-time join. **Con**: requires careful API design to ensure user properties never leak into canonical store.

**This spec specifies Option 1 as the baseline; Option 3 as enrichment when recommendation quality demands graph-traversal personalisation rather than just embedding-similarity.** Both are spec'd here; the choice between Option-1-only and Option-1+Option-3 is deferred to deployment-time evidence (user feedback on recommendation generic-ness; A/B comparison of recommendation surfaces; pedagogical-outcome telemetry from M5-1 articulation work).

The two options compose — Option 1's structural embeddings remain useful even when Option 3's per-user scores are layered on top. They are not exclusive.

#### §4.1.E Möbius / Klein topology handling

Per cymatic-field paper §18.8, standard GDS random-walk algorithms (Node2Vec, FastRP, PageRank) don't natively handle the `INVERTS_TO` semantics — the Möbius-twist where traversing X → X' should flip an inversion-phase bit on the walk. Three approaches; both spec'd here:

**Approach A — Coord-duplication preprocessing (baseline)**:
- Duplicate every coord into (phase=0, phase=1) versions.
- `INVERTS_TO` becomes a regular edge between phase=0 and phase=1 copies.
- Run standard GDS on the doubled graph.
- Collapse phase=0 and phase=1 embeddings post-process via averaging or PCA.
- **Pro**: standard algorithms work unmodified. **Con**: doubles graph size; loses semantic meaning of "phase-flip on traverse".

**Approach B — Custom Klein-aware walks**:
- Implement custom walk that tracks phase-state and flips on `INVERTS_TO` traversal.
- Embeddings naturally encode the Klein topology.
- **Pro**: topologically honest. **Con**: implementation work; non-standard.

**Approach C — Two embeddings per node**:
- Run standard GDS but produce two embeddings per coord: one for phase=0 walks, one for phase=1 walks.
- Recommendation queries select embedding by current user-phase-state.
- **Pro**: simpler than custom walks; phase-aware queries are direct. **Con**: per-coord storage doubles; phase-selection logic needed at query-time.

**This spec specifies Approach A for the first prototype** (proves the principle works without custom GDS work; the doubled graph is materialisable as a Cypher projection); **Approach B or C is deferred to production** if Klein-topology effects on recommendations matter (evidence-conditional — measured via Klein-flip equivariance metric per §6 below). The Klein topology is load-bearing per `M1'-SPEC` §10 (K² double-cover of chromatic fifths); honest handling matters at scale but can be deferred for early prototypes.

#### §4.1.F The Lens-LoRAs as Paraśakti-mediated adapter layer

The 12 MEF lenses are perspectival-relational re-mappings of the same matheme-substrate. **Lens-LoRAs are low-rank adapters that implement the lens-shift on top of a host model**, conditioned on Paraśakti's relational embeddings.

The specification this spec gives (resolving the improvement-vector-map's flagged underspecification):

- **Host models**: BOTH Paramaśiva and Epii base models (different deployments). The Paramaśiva host carries the structural-logical foundation; the Epii host carries the synthetic-encyclopedic register. Both can be lens-shifted; both deployments train their own Lens-LoRA set.
- **Conditioning mechanism**: at inference, the active lens (from `MathemeHarmonicProfile.lensMode.lens` per `M2'-SPEC` §4) determines which Lens-LoRA adapter is applied. The active lens is read from the shared profile; the runtime swaps the adapter layer in single-millisecond order (LoRA hot-swap is cheap).
- **Training data**: lens-anchored regions of Paraśakti's relational embedding space. For each of the 12 lenses, the canonical relational-set the lens privileges (the 6-position column of the 12×6=72 MEF matrix anchored at that lens, plus the relational neighbourhoods at one-hop and two-hop, weighted by the relation-type's resonance with the lens's tattva/element/decan/Shem/maqam alignment). This is a derived training set — each Lens-LoRA's training data is computed from canonical bimba structure + canonical M2 lens-stratum data; no synthetic data; no scraped text.
- **Adapter scope**: rank 16-32 (small adapters). Attention-layer adaptation only (the lens-shift is perspectival, not a parametric reweighting of the whole stack). This keeps Lens-LoRAs cheap to train, cheap to swap, and cheap to compare for governance review.
- **Klein-flip behavior**: when M1' fires `kleinFlipState` (per `M2'-SPEC` §7), the active Lens-LoRA also flips — the Lens-N adapter swaps to the Lens-N+3 adapter (the tritone-mirror partner). The flip is atomic; the system displays the lens-pair currently active as part of the profile-visibility surface.

Lens-LoRA training pipeline: per-lens training run on canonical lens-anchored data; held-out validation against lens-conditioned link-prediction; adapter artifacts versioned under the same governance regime as KGE/R-GCN artifacts.

#### §4.1.G Embedding-store layout and versioning

The S2 schema (per `Body/S/S2/graph-schema/src/lib.rs`) already declares:

- `SEMANTIC_EMBEDDING_PROPERTY: "c_5_embedding"` (3072-dim, `EMBEDDING_VERSION: q-semantic-v2-3072`).

This spec specifies the additional embedding-property family Paraśakti's pipeline produces:

- `c_5_kge_embedding_rotate` — RotatE entity embedding (dim e.g. 200, complex-valued split into real/imaginary).
- `c_5_kge_relation_rotate` (on relationship objects) — RotatE relation-rotation embedding.
- `c_5_rgcn_embedding` — R-GCN final-layer node representation (dim e.g. 256).
- `c_5_fastrp_embedding` — FastRP linear-algebra embedding (dim e.g. 256).
- `c_5_kge_version`, `c_5_rgcn_version`, `c_5_fastrp_version` — per-embedding-family version strings, mirroring the existing `EMBEDDING_VERSION` pattern.

Each embedding family is independently versioned; retrains bump only the relevant version. Recommendation queries can specify which embedding family to query against, enabling A/B evaluation across embedding choices.

### §4.2 The construction-discipline summary for ML

The discipline preserved at M5-2 for Paraśakti's training pipeline:

- **No training without canonical graph in good standing.** Bimba map population is prerequisite — no graph, no embeddings. Sync with M5-1 (Anuttara ontology) work; only train when canonical graph state has reached a stable checkpoint.
- **No deployment without governance gate.** Every embedding family rebuild, every Lens-LoRA refresh is a governance event that surfaces to M5-4 review before hot-swap.
- **No silent drift.** Embedding-version is checked at every query; mismatch between query-expected-version and runtime-active-version surfaces immediately.
- **No recommendation-mutates-canon shortcut.** Recommendations are *conversation prompts* for M5-1 articulation work; canon changes follow the canonical M5-1 → M5-2 → bimba-map-write pathway, not the recommendation surface.
- **Full audit trail.** Every training run logs: input-graph version, hyperparameters, held-out edge set, evaluation metrics, output embedding-version, deployment timestamp, deploying agent (Sophia / Pi), governance-review record.

This is the structurally-correct discipline for the relational-energetic position 2's relationship to its own development at the M5 operational-capacity surface — *training does happen here*, but it happens under the same governance discipline that everywhere else in the system protects canon from numerical-pipeline-hallucination.

---

## §5 — M5-3: Frontend embedding-engagement surface (-shakti)

### §5.1 What lives here

M5-3 Frontend Studio carries the developer- and user-facing surfaces for the Paraśakti graph-relational ML capacity:

- **GDS tangent overlay on the M0' graph view** (per cymatic-field paper §18.10 item 5): 3 ring-arcs around any selected node showing top-3 GDS recommendations — pedagogical (solid arc), tangential (dashed arc), synchronistic (pulsing arc). Driven by the canonical embedding-store; lens-conditioned by the active profile lens.
- **The M2' MEF matrix highlighting** (per `M2'-SPEC` §6): each of the 72 cells in the 12 lens × 6 position matrix pulses by `resonance72` and current `(lens, mode)`. Behind the highlighting is the embedding-based neighbour surface — clicking a cell reveals its embedded neighbours, both within the lens-stratum and across the cross-subsystem holographic-resonance edges.
- **Lens-rotation-aware inspector**: when the user's `lensMode` changes (e.g., they engage a different MEF lens), the inspector's embedding view swaps — the same canonical node is now seen through the active Lens-LoRA's perspectival adapter, surfacing different relational neighbours weighted by the lens's tattva/element/decan/Shem alignment.
- **Klein-flip visualisation surface**: when M1' fires `kleinFlipState`, the inspector visibly inverts (per `M2'-SPEC` §7's enumerated surface-valence inversions), and the lens-conditioned embedding view also flips — the recommendations now surface the tritone-mirror lens's privileged relational neighbours.
- **Embedding-quality dashboard** (developer surface, M5-3 developer-mode): link-prediction AUC over the most-recent training cycle; per-relation-type AUC breakdown (which relation types are well-learned vs poorly-learned); lens-rotation consistency scores (per §6.2); Klein-flip equivariance scores (per §6.4); cross-subsystem-relation preservation scores (per §6.3). Used by M5-4 governance review to decide whether an embedding rebuild meets promotion threshold.
- **Lens-LoRA A/B comparison surface**: side-by-side display of two Lens-LoRA versions' recommendation outputs for governance review. Used at Lens-LoRA refresh moments.
- **Two-phase projection state visualisation**: shows whether queries are running under Option 1 (canonical-only GDS with local centroid) or Option 1+Option 3 (with episode-as-property aggregation layered on); shows where the user's local centroid currently sits in canonical embedding space.

### §5.2 Integration with the M0' graph view substrate

Per cymatic-field paper §18.10, the M0' graph view at `Body/M/epi-tauri/src/domains/M0_Anuttara/BimbaMap2D.tsx` and `BimbaMap3D.tsx` is the canonical Tauri-v2 graph-rendering substrate. M5-3 reuses this substrate in **developer mode** with embedding-overlay extensions:

- **Filtered-subgraph rendering**: consumes context-aware subgraph from the service (active coordinate + N-hop neighbours + GDS-recommended tangents + recent-episode-touched coords).
- **Relation-family colouring + glyph**: the 17 S2 relation types + n10s-inferred types + M2 stratum-specific edges get distinct edge styling; `INVERTS_TO` deserves curved/Möbius-arc rendering given its Klein-twist semantics.
- **Embedding-cluster colouring**: nodes can be coloured by their Louvain / Leiden community membership in the active embedding family; surfaces structural clustering as visible colour-field.
- **Lens-LoRA-conditioned rendering**: when the active lens changes, the visible subgraph re-weights — edges privileged by the active lens are emphasised; edges suppressed by the active lens fade.

### §5.3 Conversational-default UX preserved

Per `M5'-SPEC` §5 and the convention set in the Anuttara sibling spec (§5.3), the user doesn't arrive at the embedding-engagement surface confronted with all dashboards and overlays in full technical glory. They arrive to **converse about the system's own relational structure** — about what canonical neighbours are tangential to their active interest, about what cluster they're in, about what the active lens privileges. Sophia opens the relevant pane when the conversation surfaces it. The embedding dashboard is summonable for developer engagement and governance review; it is not always-on.

---

## §6 — Embedding-quality metrics (the M5-2/M5-3 measurement surface)

The improvement-vector map flagged embedding-quality metrics as currently underspecified. This spec defines them.

### §6.1 Link-prediction AUC on held-out edges (standard KGE metric)

For each embedding family (RotatE, R-GCN, FastRP), the standard held-out-edge link-prediction metric:

- Hold out 10% of the canonical edges (stratified by relation type to ensure all 17+ relation types are represented in the test set).
- Train embeddings on remaining 90%.
- For each held-out edge `(h, r, t)`, score it against `(h, r, t')` for all `t' ≠ t` in the entity set.
- Compute AUC: probability that the true tail `t` scores higher than a uniformly-random alternative `t'`.
- Report per-relation-type AUC breakdown alongside the global AUC.

Thresholds (provisional, calibrated against initial training runs):
- Global AUC ≥ 0.90 for promotion; < 0.85 triggers training-pipeline-review.
- Per-relation-type AUC ≥ 0.85 for promotion; relation types persistently below 0.80 surface to M5-1 as articulation prompts ("this relation type isn't well-learned; is its training-data thin, or is its semantics under-articulated?").

### §6.2 Lens-rotation consistency under RotatE

The load-bearing Paraśakti-specific metric. For each of the 6 tritone-mirror lens-pairs `(L_N, L_{N+3 mod 12})`:

- Identify the canonical relations carrying lens-N and lens-N+3 anchoring (via the M2-1 MEF-matrix stratum).
- The RotatE relation-rotation for "lens-N anchor relation" and the relation-rotation for "lens-N+3 anchor relation" should differ by 180° in complex embedding space.
- Compute: `angular_distance(r_{lens_N}, r_{lens_{N+3}}) - π` averaged across the 6 pairs.
- Report as a scalar deviation from the expected π (180°) rotation.

Thresholds (provisional):
- Mean angular deviation ≤ 0.05 rad (≈ 2.9°) for the trained-RotatE-lens-rotation-structure to count as having recovered the tritone-mirror constraint as learned-geometric-fact.
- Deviation > 0.20 rad triggers an articulation prompt: "the Klein-flip structure is not being recovered; either training data is insufficient or the RotatE model is mis-fit for this relation set."

This metric is **the empirical test of the position-2 paradigm's philosophical case** — if RotatE learns the lens-rotation structure from canonical data, it confirms graph-relational ML is the right paradigm for Paraśakti. If it doesn't, the philosophical articulation at M5-1 has to be revisited.

### §6.3 Cross-subsystem-relation preservation

For each of the cross-subsystem relation classes (M1↔M2, M2↔M3, M3↔M4, M4↔M5), hold out a designated subset of those edges and verify they are reconstructable from the trained embeddings:

- M1↔M2: lens-mode-to-MEF-position edges (the M1'-to-M2-1 wiring per `M2'-SPEC` §3).
- M2↔M3: DET-bridge edges (the 72→64 epogdoon projection per `M2'-SPEC` §9.5).
- M3↔M4: codon-quaternion-to-personal-Pratibimba edges (per cymatic-field paper §6.6).
- M4↔M5: review-promotion edges (the canonical promotion gates per `M5'-SPEC`).

For each held-out edge, the reconstruction probability (under RotatE or R-GCN) gives the cross-subsystem-relation preservation score. Per-class scores reported; thresholds calibrated per class given different edge densities.

This metric specifically measures **how well Paraśakti's embedding pipeline has learned the geometry of the system's internal relational structure** — the position where the cross-subsystem orchestration scaffold becomes a learnable object.

### §6.4 Klein-flip equivariance

For Approach A (coord-duplication preprocessing), the phase=0 and phase=1 versions of a coord should produce embeddings related by the same rotation that the Klein-flip implements at substrate level. For Approach B/C, the analogous equivariance check holds.

Specifically: for each lens-pair `(L_N, L_{N+3})`, the set of embeddings of lens-N-coordinates and the set of embeddings of lens-N+3-coordinates should be related by the same rotation as the lens-rotation-consistency metric reports (§6.2). The two metrics should agree; their disagreement flags pipeline error.

### §6.5 The drift-detection schedule

All four metric families are recomputed:

- On every embedding-family retrain (held-out evaluation as part of the training run).
- On every canonical-graph-major-update (e.g., > 50 new edges added; new edge-type introduced; new lens-mode added; new tritone-mirror discovered).
- On a regular cadence (weekly, against the current production embedding store) to detect drift from runtime use.

Drift below threshold triggers the autoresearch spine (§7) to fire a retrain candidate; Pi dispatches; governance reviews.

---

## §7 — M5-4: Agentic mediation (siva-shakti) — the autoresearch spine for Paraśakti

### §7.1 What lives here

M5-4 Agentic Control Room carries the agent-mediated orchestration of the Paraśakti graph-relational ML capacity:

- **Sophia** as the wisdom-curating agent: holds the long-arc of how the embedding store has evolved; tracks coherence between embedding-surfaced clusters and M5-1 philosophical articulation; surfaces tensions ("the new Louvain community at L4-5 doesn't match any articulated cluster — is this a discovery or an artifact?"); maintains the recommendation-quality narrative continuity.
- **Anima** as the aesthetic-coherence agent: provides the "does this cluster feel right?" check; flags embedded-clusters that violate the language's aesthetic gestalt without being formally inconsistent; especially load-bearing for the lens-rotation-consistency and Klein-flip-equivariance metrics — Anima notices when the embedded-rotation-structure doesn't quite *feel* like the canonical Klein structure even if it formally passes the AUC threshold.
- **Pi** as the dispatch agent: handles training-run dispatch (KGE training cycles, R-GCN training cycles, GDS pipeline recomputation, Lens-LoRA refresh cycles); routes between M5-1 (articulation queue) and M5-2 (construction queue); manages embedding hot-swaps; manages Lens-LoRA hot-swaps under governance gating.
- **Aletheia** as the disclosure-tracking agent: tracks what becomes visible through each embedding rebuild — which new clusters emerge, which previously-surfaced clusters disappear, which cross-subsystem coherence-edges become more or less learnable.
- **Logos Atelier specialist** (M5-5-mediated): invoked when an embedding-surfaced candidate cross-subsystem relation needs etymological-grammatical archaeology before being promoted as a canon-addition candidate.

### §7.2 The agentic review workflow for embedding deployment

When an embedding-family rebuild reaches the review stage, it passes through an agentic review workflow:

1. **Pi metrics-check** — all four metric families (§6) computed on the held-out evaluation set; results surfaced.
2. **Sophia coherence-review** — does the new embedding cohere with prior articulated clusters? Are there tensions with prior M5-1 canonical-philosophical-text?
3. **Anima aesthetic-review** — do the new clusters / new rotation-structure / new Klein-flip-equivariance feel right? Are there resonance-violations?
4. **User final-validation for load-bearing changes** — when the embedding rebuild changes lens-rotation-structure substantially (e.g., > 0.10 rad change in lens-rotation-consistency), explicit user approval required. Routine retrains (small canonical-graph changes; metrics within prior bands) can deploy under Pi's governance authority with audit-log notification to user.

The workflow doesn't auto-promote at the load-bearing threshold. Every step produces an annotation; the user has visibility into all annotations; the user decides whether to proceed for load-bearing changes.

### §7.3 The autoresearch spine: triggers for Paraśakti's improvement loop

The Epii autoresearch spine fires the Paraśakti improvement loop when:

- **Bimba map has grown materially** — new nodes added to canon by Anuttara's ontology-development work (per the sibling spec). Threshold: > 50 new nodes or > 500 new edges since last training.
- **New edge-type introduced** by Anuttara's ontology (OWL class additions; SHACL shape additions; n10s-inferred-relation additions per the Anuttara sibling §4.1.A-D). Any new edge-type triggers an R-GCN retrain with the new relation-channel.
- **New cross-subsystem relation instantiated** — e.g., a new lens-mode is added by M1' work; a new tritone-mirror discovered by `ql-musical-derivation` work; a new DET-bridge correspondence is articulated. Triggers a retrain that includes the new cross-subsystem edge class in the held-out evaluation set.
- **New Klein-flip pattern observed** — when runtime telemetry from M2-1' shows the user's `kleinFlipState` firing on a previously-unseen lens-pair, the autoresearch spine logs the observation and may queue an embedding refresh to ensure the new flip-pattern is well-represented in the trained embeddings.
- **Embedding-quality metrics drift below threshold** — per the §6.5 drift-detection schedule; below-threshold drift surfaces as a retrain candidate.

Epii (acting as autoresearch spine in its register-2 surface) routes these triggers to the M5-2 backend pipeline; governance gates promotion; M5-4 hot-swaps embedding store and Lens-LoRA adapters under audit; M5-0 library entries get updated with the new metric reports; M5-1 articulation queue gets new prompts when emergent clusters need theoretical articulation.

### §7.4 Cross-subsystem relational training as Paraśakti's specific work

This is the load-bearing observation that distinguishes Paraśakti's improvement loop from the other subsystems': **every M1↔M2, M2↔M3, M3↔M4, M4↔M5 relation that the orchestration scaffold instantiates is an edge-type in Paraśakti's training graph**. This is the position where the system's internal relational structure becomes a learnable object.

Concretely:

- When M3 codon-quaternion projects through M2-5 planetary-chakral state (via the DET projection per `M2'-SPEC` §9.5 and cymatic-field paper §6.4), that projection is an edge in Paraśakti's training graph. The codon-to-planetary-chakral edge type carries its own R-GCN aggregation weights; its own RotatE relation-rotation.
- When M4 Personal-Pratibimba state at #4.4.4.4 references canonical M0-M3 coordinates via `bimba_coordinate_ref` (per cymatic-field paper §6.7), those references are edges (registered through the M4↔M5 review-promotion path so they enter Paraśakti's training graph without leaking personal episode content).
- When M1' fires a Klein-flip and the runtime transitions lens-N to lens-N+3, that transition is an edge-type (the tritone-mirror transition relation) in Paraśakti's training graph.
- When M5-1 articulation crystallises a new philosophical-text bound to a bimba node, the articulation-binding is an edge.

Paraśakti's embeddings learn the geometry of all such cross-subsystem relationships. **This makes Paraśakti's improvement loop the position where the system improves its understanding of its own relational structure** — not by hand-coded edge-list maintenance but by representation-learning over the orchestration scaffold's runtime instantiations.

---

## §8 — The governance gate (M5-4 mediated)

Every embedding-family rebuild and every Lens-LoRA refresh is a governance act. The gating discipline:

### §8.1 Routine vs load-bearing classification

- **Routine retrains**: small canonical-graph changes (< 50 new nodes, < 500 new edges, no new edge-types); metrics within prior bands (no metric family drifts > 0.05 rad / 0.05 AUC); embedding-version bump is incremental (patch-level). Pi deploys under audit-log notification.
- **Load-bearing retrains**: large canonical-graph changes; new edge-types; metric drift > 0.05; lens-rotation-consistency or Klein-flip-equivariance changes; introduction of new Lens-LoRA. Explicit user final-validation required.

### §8.2 The hot-swap discipline

When an embedding-family rebuild passes governance:

1. New embedding store is staged at a versioned path (not yet pointed-at by query layer).
2. Pi runs final smoke-test queries against the staged store; results surfaced for spot-check.
3. On user approval (or Pi authority for routine), the query layer's active-version pointer atomically switches.
4. Old embedding store remains accessible for rollback (kept for the prior 3 versions before garbage collection).
5. The version-switch is logged in the audit trail with timestamp, deploying agent, governance-record.

Lens-LoRA hot-swaps follow the same discipline. The atomicity is straightforward (LoRA adapters are small; loaded into the host model in milliseconds), and the lens-pair hot-swap-on-Klein-flip is itself a sub-millisecond operation at runtime once the adapter set is loaded.

### §8.3 The runtime-consultation surface (the read-only side)

The embedding-store and Lens-LoRA-store are **consulted at runtime** by every operational surface that needs recommendation, similarity, or lens-conditioned retrieval. The consultation is **read-only** — runtime queries never mutate the embedding store. Improvements emerge from runtime observations (e.g., a pattern across many recommendation surfaces suggesting a new cluster) flow back as **conversation-proposals to M5-1**, not as direct mutations.

This is the structurally-correct discipline for the relational-energetic position 2's relationship to runtime use of its own learned representations — **training is governed; runtime use is read-only; improvements bubble back through articulation conversation**.

---

## §9 — M5-5: Logos Atelier — archaeological gating on candidate cross-subsystem relations

### §9.1 What lives here for Paraśakti

The Atelier's Paraśakti-specific work is the **archaeological verification of candidate cross-subsystem relations** that the embedding pipeline surfaces as structurally-implied.

When the R-GCN or RotatE pipeline surfaces a candidate edge between, say, an M2-4 maqam and an M3 codon — the embedding geometry suggests they belong together, but the canonical graph doesn't carry the edge — the Atelier traces:

- Is there a Pythagorean / Arabic-modal precedent for this maqam-codon correspondence?
- Is there a documented Tantric source for this planetary-chakral-mantra alignment?
- Does the implied Shem-name decanic correspondence have Hebraic-Kabbalistic precedent?
- Does the implied tattva-element-decan throughline have Trika or Saiva-Siddhanta source-text grounding?

When archaeology validates, the Mobius write-back happens: the validated candidate flows from M5-5 to M5-1 (philosophical articulation) to M5-2 (canonical edge addition via governed Cypher write); the Paraśakti improvement loop's next retrain includes the new edge in its training graph.

When archaeology dismisses, the candidate is recorded as a **graph-statistical artifact** with a reason; the embedding pipeline's known-rejected-candidates list is updated so the same artifact doesn't keep re-surfacing.

This is the Atelier's specific protection: **the bimba canon is never amended by raw embedding-pipeline output**; every embedding-surfaced candidate goes through philosophical-archaeological gating before becoming canon.

### §9.2 The 72-fold correspondence-tree as archaeology workbench

For Paraśakti specifically, the Atelier's archaeology often touches the 72-fold correspondence-tree — the maqam families, the Shem 72 names, the asma 99+1 with 36/64 split, the mantra 50+50 Matrika/Malini. Each addition or deletion proposed (whether by embedding pipeline or by direct M5-1 articulation) is checked against the canonical-source-tradition's internal logic. The Atelier's standard checks: does the proposed addition keep the 72-invariant intact? does it preserve the 8-choir × 9-name decomposition? does it respect the 9:8 epogdoon M2-M3 conjugation enacted at planetary-chakral bridge per `M2'-SPEC` §9.5?

---

## §10 — M5-0: Library — the gnostic-namespace holding for Paraśakti

### §10.1 What lives here

M5-0 Library carries the documentary holding of the Paraśakti graph-relational ML capacity as part of Epii's gnostic-namespace:

- The full `M2'-SPEC.md` and `m2-prime-parashakti-cymatic-engine.md` live as primary references.
- This spec itself lives as documentation of the operational-capacity.
- Each KGE / R-GCN / GDS / Lens-LoRA training run produces a **library entry** — the training-run report, the embedding-version, the metric scorecard, the deployment record, the governance-review annotations. These reports are queryable via the M5-0 RAG-anything / kbase substrate (per the Anuttara sibling spec §8.2).
- The **canon of embedding-versions** lives as a versioned, queryable corpus — both current production version and prior versions (kept for the prior 3 for rollback availability); each annotated with the canonical-graph-version it was trained against, the metric scorecard at training, the runtime-metric scorecard since deployment.
- The **canon of Lens-LoRA-versions** lives similarly, one entry per (lens, version) pair.
- The **embedding-quality-metric history** lives as a longitudinal record — each metric family's score over time; visible drift; visible retraining events.

### §10.2 Integration with RAG-anything and kbase

Per the Anuttara sibling spec §8.2, the M5-0 substrate is the existing RAG-anything and kbase. For Paraśakti, the library content is:

- Discoverable via standard knowledge-base queries (e.g., "what's the current RotatE embedding version?" returns the embedding-store version metadata).
- Indexable via the same 3072-dim semantic embedding family that all gnostic-namespace content uses (recursive — the Paraśakti embedding pipeline's documentation is itself indexed by the prior Paraśakti embedding family).
- Available to Sophia as conversational substrate (when a user asks "why are recommendations clustering this way?", Sophia consults the M5-0 library entries for the relevant embedding-family version, the metric scorecard, the prior governance-review annotations).

### §10.3 The gnostic-namespace as Epii's foundation for Paraśakti

The gnostic namespace (the `gnosis` graph namespace in S2 Neo4j per `M5'-SPEC` §3) holds Paraśakti's graph-relational-ML documentation as one of its primary content-categories. This makes the gnostic namespace **the foundation of Epii** for the position-2 paradigm — the documentation-and-canonical-record substrate that Epii's improvement-loop work operates against.

The Paraśakti improvement loop reads from the library when it fires (per §7.3) — checking prior metric scorecards, prior governance decisions, prior cluster-articulation pairings — and writes to the library when it completes (depositing new training-run reports, updated metric histories, new cluster-articulation pairings).

---

## §11 — The full operational capacity in one picture

```
                            M2 Paraśakti
                          (72-fold vibrational-correspondential substrate
                           + cross-subsystem orchestration scaffold)
                                  │
                                  │  carried at substrate level by
                                  │  M2_Vibrational_72_Space union
                                  │  + 17 S2 relation types
                                  │  + M2-0..M2-5 stratum edges
                                  │  + Ficinian-Kerykeion routing traces
                                  │  + Klein-bottle L↔L' tritone-mirrors
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
        ▼                         ▼                         ▼
   72-invariant            Lens-rotation              Cross-subsystem
   (12×6=36×2=8×9)         structure                  relational scaffold
                           (6 tritone pairs)          (M1↔M2↔M3↔M4↔M5)
                                  │
                                  │  is operated upon as
                                  │  graph-relational ML
                                  │  (KGE + R-GCN + GDS + Lens-LoRAs)
                                  │
                                  ▼
                          Epii-as-bimba-map-operational-agent
                          (operational capacity at M5-2/M5-3/M5-4)
                                  │
   ┌──────────┬───────────┬──────┴────┬─────────────┬──────────────┐
   ▼          ▼           ▼           ▼             ▼              ▼
M5-0       M5-1         M5-2        M5-3          M5-4          M5-5
Library    Philosophy   Backend     Frontend      Agentic       Logos
& Gnostic  (case for    (RotatE +   (embedding-   (autoresearch Atelier
Namespace  RotatE;      R-GCN +     overlay on    spine;        (archaeology
RAG-kbase  case for     GDS +       M0' graph;    governance    on candidate
versioned  Lens-LoRAs;  Lens-LoRAs; lens-rotation gating;       cross-system
embedding  metric-      embedding-  inspector;    Sophia/Anima/ relations
+ LoRA     threshold    store +     Klein-flip    Pi/Aletheia)  surfaced by
records    deliberation)versioning) viz; metric                 pipeline)
                                    dashboard)
   │           │            │            │             │             │
   └───────────┴────────────┴────────────┴─────────────┴─────────────┘
                                  │
                                  │  read-only at runtime;
                                  │  governed retrains feed back
                                  ▼
                          Embedding store + Lens-LoRA adapter set
                          (Paraśakti's learned-representation surface
                           consulted by all operational surfaces that
                           need recommendation / similarity / lens-aware
                           retrieval — never mutates canon)
```

---

## §12 — Open development trajectories

Genuine open work this spec leaves for future expansion:

### §12.1 First-tranche construction work

- Implement RotatE training pipeline on the canonical bimba map; produce initial `c_5_kge_embedding_rotate` property family at v0.1.
- Implement R-GCN training pipeline; produce initial `c_5_rgcn_embedding` at v0.1.
- Wire Neo4j GDS Cypher procedures for FastRP, Node2Vec, Louvain, Personalised PageRank, K-shortest paths.
- Implement Approach A coord-duplication preprocessing for Klein-topology baseline handling.
- Implement Option 1 two-phase projection contract; defer Option 3 to evidence-conditional later milestone.
- Compute initial values for all four metric families (§6); calibrate thresholds against measured baseline.

### §12.2 The Lens-LoRA tranche

- For each of the 12 lenses, derive the lens-anchored training-data subset from canonical M2-1 MEF-matrix + cross-stratum alignments.
- Train v0.1 Lens-LoRA adapter (rank 16 baseline) for each lens, against both Paramaśiva and Epii host models.
- Implement hot-swap mechanism; verify sub-millisecond swap latency.
- Implement Klein-flip-triggered swap (lens-N ↔ lens-N+3).
- Hold out lens-conditioned link-prediction edges; verify per-lens AUC matches global AUC band.

### §12.3 The embedding-quality dashboard

- Implement the four-metric-family dashboard at M5-3 developer-mode.
- Implement the drift-detection schedule (per-training-run + per-major-graph-update + weekly).
- Implement the per-relation-type AUC breakdown surface.
- Implement Anima's aesthetic-coherence-flag visualisation (clusters where Anima has flagged "doesn't feel right" overlaid on the cluster visualisation).

### §12.4 The autoresearch spine wiring

- Wire the five triggers (§7.3) — bimba growth, new edge-type, new cross-subsystem relation, new Klein-flip pattern, metric drift — to the Pi dispatch surface.
- Implement the governance-gate routing for routine vs load-bearing classification.
- Implement the audit-trail logging at every stage.

### §12.5 The Atelier archaeological gating

- Specify the Atelier-invocation API for embedding-surfaced candidate cross-subsystem relations.
- Define the archaeological-verification result format (validates / dismisses-with-reason / needs-deeper-investigation).
- Implement the known-rejected-candidates list to prevent re-surfacing.
- Implement the Mobius write-back from validated archaeology to M5-1 articulation queue.

### §12.6 The Option-3 enrichment tranche

When Option-1-only recommendation quality is judged insufficient (evidence-conditional, per §4.1.D), implement Option 3:

- Per-user `m_4_episode_resonance_score` property layer at the sovereign Graphiti store.
- GDS query-time join logic.
- Query-API design ensuring user properties never leak into canonical store.
- A/B evaluation surfaces comparing Option-1-only vs Option-1+Option-3 recommendation surfaces.

### §12.7 The Approach-B/C topology-handling tranche

When Klein-flip-equivariance metrics suggest Approach A's coord-duplication is losing too much information (evidence-conditional, per §4.1.E), implement Approach B (custom Klein-aware walks) or Approach C (two embeddings per node). The choice between B and C is itself a deliberation that returns to M5-1 articulation queue when the decision is needed.

### §12.8 The siblings to this spec (other operational capacities)

This spec is the second in the planned family at `epii-operational-capacities/`. Future siblings:

- `m5-prime-epii-on-paramasiva.md` — CPT-on-QL-theory pipeline, theory-corpus management, foundational-derivational training discipline.
- `m5-prime-epii-on-mahamaya.md` — process-reward RL + federated learning pipeline, calculation-pathway program synthesis.
- `m5-prime-epii-on-nara.md` — QLoRA pipeline, dialogic-voice curation, DPO refinement.
- `m5-prime-epii-on-epii.md` — CPT + RAG for synthetic-encyclopedic register, the self-referential meta-capacity.

These four plus the existing Anuttara spec and this Paraśakti spec cover Epii's operational capacities across all six subsystems.

---

## §13 — What this spec delivers

1. **Paraśakti as graph-relational learnable, not unverified** — preserves the user's constraint that embeddings are derived, never canonical; consulted for pedagogical / tangential / lens-aware / Klein-aware retrieval; conversation-prompts when surprising clusters emerge; never auto-mutate canon.
2. **The position-2 paradigm specified as KGE + R-GCN + Neo4j GDS** — not invented, not arbitrary; the canonical position-2 ML paradigm whose objects (typed relations, relation-rotations, multi-hop traversals, community structure) are exactly what Paraśakti carries at substrate.
3. **RotatE chosen with structural rationale** — the alignment between RotatE's relation-as-rotation primitive and MEF-lenses-as-rotations of the matheme-substrate; the lens-rotation-consistency metric (§6.2) as the empirical test of the philosophical case.
4. **The Lens-LoRAs fully specified** — host models (Paramaśiva and Epii); conditioning (via active lens from MathemeHarmonicProfile); training data (lens-anchored canonical regions); adapter scope (rank 16-32, attention-layer only); Klein-flip behaviour (adapter swap to tritone-mirror partner).
5. **The two-phase projection contract specified** — Option 1 (canonical-only GDS with local centroid) as baseline; Option 3 (episode-as-property aggregation) as enrichment; choice deferred to deployment-time evidence; both compose.
6. **The Möbius/Klein topology-handling specified** — Approach A (coord-duplication preprocessing) as baseline; Approach B/C deferred to evidence-conditional production work.
7. **The embedding-quality metric suite defined** — link-prediction AUC (global + per-relation-type); lens-rotation consistency under RotatE; cross-subsystem-relation preservation; Klein-flip equivariance; drift-detection schedule.
8. **Cross-subsystem relational training as Paraśakti's specific work** — the position where the system's internal relational structure (M1↔M2↔M3↔M4↔M5 orchestration scaffold) becomes a learnable object.
9. **Construction-discipline preserved for the ML register** — training does happen here, but under governance gating, with versioning, rollback, audit, and conversation-back-to-articulation as the only canon-mutation pathway.
10. **The autoresearch spine specified** — five triggers (bimba growth, new edge-type, new cross-subsystem relation, new Klein-flip pattern, metric drift) feeding Pi-dispatched retrain candidates through governance to hot-swap; the runtime improvement loop fully wired.
11. **The Atelier archaeological gate specified** — embedding-surfaced cross-subsystem candidates must pass etymological-grammatical-tradition archaeology before becoming canon; the canon is protected from numerical-pipeline-hallucination.
12. **The gnostic-namespace integration extended** — Paraśakti's documentation, embedding-version records, Lens-LoRA-version records, metric histories all live at M5-0 as RAG-kbase-queryable substrate; Sophia's conversational engagement uses this substrate when recommendation explanations are surfaced.

---

## Sources

- `Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md` (canonical M2' domain spec: 72-fold Paraśakti, cymatic engine, planetary-chakral LUT, Klein-flip, 12 MEF lenses, Ficinian-Kerykeion routing protocol)
- `Idea/Bimba/Seeds/M/M2'/m2-prime-parashakti-cymatic-engine.md` (companion long-form: per-stratum operational detail, C/Rust code anchors, m2_prime_* function signatures)
- `Idea/Bimba/Seeds/M/alpha_quaternionic_integration_across_M_stack.md` §6.2 (M2-0 Fibonacci ground beneath 72-fold invariant), §6.3 (M2-5 9:8 epogdoon planetary-chakral bridge)
- `Idea/Bimba/Seeds/M/M4'/m4-prime-psychoid-cymatic-field-engine.md` §18.6 (GDS algorithm-to-purpose mapping), §18.7 (two-phase GDS projection Option 1 / Option 3), §18.8 (Möbius/Klein topology handling A/B/C), §18.9 (kernel ↔ Neo4j sync contract), §18.10 (M0' graph view substrate)
- `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md` (canonical M5' sixfold structure: Library / Philosophy / Backend / Frontend / Agentic / Logos Atelier; conversational-default UX; graph namespace model)
- `Idea/Bimba/Seeds/M/M5'/epii-operational-capacities/m5-prime-epii-on-anuttara-language-development.md` (convention-setting sibling: frontmatter style, §0–§12 + Sources structure, Siva-Shakti trinitarian inheritance, construction-discipline framing)
- `Body/S/S0/epi-lib/include/m2.h`, `m2.c` (M2 kernel substrate: `M2_PLANET_LUT[10]`, `M2_Vibrational_72_Space` union, `EarthBodyState`, the compile-time 72-invariant, Cousto frequencies, chakra/element/phase assignments)
- `Body/S/S2/graph-schema/src/lib.rs` (S2 schema: 17 canonical relation types, label specs, property semantics; `c_5_embedding` 3072-dim with `EMBEDDING_VERSION: q-semantic-v2-3072`; the property-family this spec extends with `c_5_kge_embedding_rotate`, `c_5_rgcn_embedding`, `c_5_fastrp_embedding`)
- `Body/S/S2/graph-services/src/seed.rs` (BEDROCK / MANIFESTS / INVERTS_TO / ANCHORED_TO seed logic — the canonical edge types Paraśakti's training graph carries)
- `docs/datasets/nara-deep/13-03-2026-claude-nara-thinking-marketing.md:136-192` (user's three-phase GDS research programme — FastRP / Node2Vec / GraphSAGE / TDA with QL-proportional relationship weights: mod6 / depth / cross-subsystem weight classes)
- `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-03-08-knowing-graph-convergence-plan.md` (n10s integration deferrals that bear on R-GCN relation-type alphabet evolution)
- M5-0 / M5-0' improvement-vector map (subagent-produced sober positioning of ML/training work as one Epii capacity per subsystem — graph-relational ML located at position 2)
- KGE references: Bordes et al. 2013 (TransE); Lin et al. 2015 (TransR); Trouillon et al. 2016 (ComplEx); Sun et al. 2019 (RotatE)
- R-GCN reference: Schlichtkrull et al. 2018 (Modeling Relational Data with Graph Convolutional Networks)
- Neo4j GDS library reference: FastRP, Node2Vec, GraphSAGE, Louvain/Leiden, Personalised PageRank, Yen's K-shortest paths as Cypher procedures

---

End of operational-capacity spec. This is the second of six `epii-operational-capacities/` siblings, following the convention set by the Anuttara sibling. The four remaining siblings (Epii on Paramaśiva, Mahāmāyā, Nara, Epii-on-Epii) complete the family covering Epii-as-bimba-map-operational-agent's developmental-and-improvement work upon the other subsystems through M5's sixfold trinitarian-articulated surface architecture.
