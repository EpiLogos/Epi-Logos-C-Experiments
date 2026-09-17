---
coordinate: "S2"
c_0_source_coordinates:
  - "[[S2-ARCHITECTURE]]"
  - "[[13-decision-register]]"
  - "[[ql-musical-derivation-v3]]"
  - "[[Relations]]"
c_1_ct_type: "CT1"
c_3_created_at: "2026-07-25T00:00:00+01:00"
c_4_artifact_role: "derivation"
c_5_crystallisation_state: "proposed"
---

# `c_1_relation_family` — Canon Derivation

**Status:** PROPOSED — derivation complete, three decisions reserved for the Architect (§6).
**Scope:** how each Bimba relationship type maps to a `c_1_relation_family` value.
**Method:** canon quoted verbatim with `file:line`; every graph claim backed by live read-only Cypher against the Bimba Neo4j instance on 2026-07-25.

> **Headline finding.** The v3 musical derivation does **not** determine `c_1_relation_family`. It determines a *different, orthogonal* axis — the psychoid harmonic grammar (A/B/C + D). The 43 edges currently carrying `A`/`B`/`C`/`D` in the `c_1_relation_family` column are there because of a **column-collision bug** at `graph_api.rs:943`, not because of a musical encoding. The correct derivation of relation family is from the **epistemic kind of the relata**, which is formulaic and is stated in §3.

---

## 0. Ground truth — the live graph

All figures from read-only Cypher, 2026-07-25.

| Measure | Value |
|---|---|
| Total edges in database | **12,263** |
| `(:Bimba)-[]->(:Bimba)` edges (the vocabulary in scope) | **11,295** |
| Non-Bimba edges (Graphiti episodic: `Episodic-MENTIONS->Entity` 712, `Entity-RELATES_TO->Entity` 256) | **968** — out of scope |
| Distinct relationship types over Bimba-Bimba | **1,411** |
| Types occurring exactly once | **970** (8.6% of edges, 68.7% of types) |
| Edges already carrying `c_1_relation_family` | **43** |

**The long tail is the reason this must be a rule, not a table.** Cumulative coverage by rank: top-40 = 7,112 edges (63.0%), top-60 = 7,972 (70.6%), top-100 = 8,780 (77.7%), top-200 = 9,568 (84.7%), top-400 = 10,243 (90.7%). Reaching 95% by enumeration requires roughly 700 hand-authored rows. §4 therefore gives explicit rows for the top 45 types and a **closed rule that classifies 100% of the 11,295 edges with zero residue**.

Node-side facts that the derivation depends on:

- `#0`–`#5` carry a literal **`:Psychoid`** label in the live graph, with `c_4_family = 'NONE'`: `#0 Ground`, `#1 Form`, `#2 Operation`, `#3 Pattern`, `#4 Context`, `#5 Integration`. There are 7 `:Psychoid` nodes (see §6.4 for the 7th, a data defect).
- 1,882 of 2,098 Bimba nodes carry `c_3_dataset_branch` (`mahamaya-deep`, `parashakti-deep`, `anuttara-deep`, `nara-deep`, `paramasiva-deep`, `epii-deep`, `low-detail/*`). The remaining **216** are the coordinate skeleton: `:Coordinate`, `:ContextFrame`, `:VakCoordinate`, `:Psychoid`, `:Root`. This 1,882/216 split is the epistemic partition the whole derivation turns on.
- `HAS_KERNEL_RESONANCE` — the sole trigger for `kernel_core` in current code — has **zero edges** in the graph.
- `POS0_LINKS_TO` / `POS5_INTEGRATES_INTO` — the sole triggers for `compatibility` — have **zero edges** in the graph.

---

## 1. The six families, defined from canon

### 1.1 The ratified enum

`Body/S/S2/graph-schema/src/relationships/rel.rs:9-23`:

```rust
pub const RELATION_FAMILY_PROPERTY: &str = "c_1_relation_family";
pub const RELATION_FAMILY_STRUCTURAL: &str = "structural";
pub const RELATION_FAMILY_CORRESPONDENTIAL: &str = "correspondential";
pub const RELATION_FAMILY_KERNEL_CORE: &str = "kernel_core";
pub const RELATION_FAMILY_INFERRED: &str = "inferred";
pub const RELATION_FAMILY_SYNC: &str = "sync";
pub const RELATION_FAMILY_COMPATIBILITY: &str = "compatibility";
pub const RELATION_FAMILY_VALUES: &[&str] = &[
    RELATION_FAMILY_STRUCTURAL,
    RELATION_FAMILY_CORRESPONDENTIAL,
    RELATION_FAMILY_KERNEL_CORE,
    RELATION_FAMILY_INFERRED,
    RELATION_FAMILY_SYNC,
    RELATION_FAMILY_COMPATIBILITY,
];
```

The ratifying decision, `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/13-decision-register.md:370-378`, in full:

> ## DR-IG-1 — Two-relation-families schema discriminator
>
> **Status:** VALIDATED  ·  **Validated:** 2026-06-02  ·  **By:** user  ·  **Resolution:** Extend schema with `c_1_relation_family` enum `{structural, correspondential, kernel_core, inferred, sync, compatibility}` (6 members ok). Populate via `dataset_import` + `sync_coordinator`.
>
> **Action:** Add `c_1_relation_family` to `RELATIONSHIP_PROPERTY_SPECS` at `Body/S/S2/graph-schema/src/lib.rs`. Populate during dataset import; backfill via sync_coordinator.
>
> **Verification:** `cargo check -p epi-s2-graph-schema && cargo test -p epi-s2-graph-schema relation_family_enum_present`.
>
> **Depends:** Tranche **09.2**.

Note the title says **two** families; the enum has six. "(6 members ok)" is the entire epistemic justification on record.

### 1.2 There are no prose definitions in canon — this is a finding

**A full-repo search found no document that defines what the six family names MEAN epistemically.** Every occurrence is one of: the bare six-member set restated, a rendering rule, or a filter predicate. `rel.rs` has no doc comments; the property spec at `Body/S/S2/graph-schema/src/properties.rs:2330-2340` has none either. `S2-SPEC.md` and `S2-0-SPEC.md` … `S2-5-SPEC.md` contain **zero** hits for `relation_family`, `correspondential`, or `kernel_core`.

The definitions below are therefore **reconstructed** from the four fragments of canon that do carry content, plus the operational behaviour of the classifier. They are proposed, not quoted.

### 1.3 The one substantive source: the two-family origin

`Idea/Pratibimba/System/Subsystems/Anuttara/anuttara-ux-full-m0-branch.md:79-86`:

> ## 3.1 The M0-2′ relation layer is two relation-families
>
> "The relations in their types and properties in full" means **both** registries:
>
> - **Structural skeleton** (`graph-schema/src/lib.rs`): `CONTAINS`, `FAMILY_CONTAINS`, `ANCHORED_TO`, `BEDROCK`, `MANIFESTS`, `INVERTS_TO`, `REFLECTS_AS`, `DERIVES_FROM`, `HAS_LENS`, `HAS_KERNEL_RESONANCE` — the system's own ontological wiring.
> - **Correspondential web** (parashakti dataset): `Decan-Level Divine Correspondence`, `Spanda Rhythmic Pulsation`, `Quantum Field Operation`, `Modal-Harmonic Resonance`, `Chaldean Decan Rulership`, `Ananda Vortex Spirit Axis`, `Traditional Planetary Rulership`, `Psycho-Ontological Resonance`, `Mono-Poly Expression`, and more.
>
> The second family is "the angels etc." rendered as **edges, not hardcoded tables.**

The motive, `Idea/Bimba/Seeds/S/S2/S2-ARCHITECTURE.md:95`:

> The correspondential family (e.g. `HAS_DECAN`, `HAS_MAQAM_FAMILY`, `RULED_BY`, `VORTEX_SPIRIT_AXIS`) currently lands via `DatasetImporter::sanitize_rel_type` without an entry in `RELATIONSHIP_TYPE_SPECS`. This is the load-bearing gap DR-IG-1 closes by adding a `c_1_relation_family` discriminator instead of bloating the type registry.

Purpose statements for `sync` and `kernel_core`, same file:

> `:270` — The `c_1_relation_family = 'sync'` discriminator is the operational filter that prevents recognition writes from polluting canonical seed reads.
> `:266` — composable through a single graph traverse with `c_1_relation_family = 'kernel_core'` filter once DR-IG-1 lands.
> `:427` — GDS Option 1 projection can filter `WHERE r.c_1_relation_family IN ['structural', 'correspondential']` to exclude inferred/sync overlays from algorithm input.

The only characterisation of `compatibility` anywhere, `Idea/Bimba/Seeds/M/THEIA-UI-PATTERNS-ARCHITECTURE.md:195`:

> **Default state**: all four `structural | correspondential | kernel_core | inferred` checked; `sync` and `compatibility` unchecked (they are migration / cross-extension debt and noise in canonical view; user can enable).

And `:134`:

> **Relation family** (`c_1_relation_family` six-enum per DR-IG-1 …) — multi-select; shows only edges in the selected families. **The `inferred` family is rendered with a dashed stroke; `sync` and `compatibility` use 40% opacity**; the visual asymmetry mirrors the ontological asymmetry.

### 1.4 The six families — proposed definitions

Each names *what kind of epistemic relation the edge asserts*, which follows from *what its two relata are*.

| Family | Epistemic relation it names | The relata that produce it |
|---|---|---|
| **`structural`** | The system's own ontological wiring. The edge is part of the coordinate lattice — containment, residency, position-order, scope. It asserts *where something sits in the system*, and is true by construction. | At least one endpoint is a **coordinate-skeleton** node (`:Coordinate`/`:ContextFrame`/`:VakCoordinate`/`:Root` — a node with no `c_3_dataset_branch`). |
| **`correspondential`** | A mapping across two independently-constituted symbolic domains. "The angels etc. rendered as edges." It asserts *that this means that*, and is true by witness of a tradition, not by construction. | **Both** endpoints are imported dataset content (both carry `c_3_dataset_branch`). |
| **`kernel_core`** | The bedrock spine. The edge relates a pre-categorical psychoid archetype to its manifestations, or psychoids to one another. It is the `.rodata` layer of the graph — immutable, prior to both lattice and content. | At least one endpoint is a **`:Psychoid`** node (`#0`–`#5`, `#`). |
| **`inferred`** | A claim proposed by a model, not yet witnessed by canon or a dataset. Defeasible; renders dashed. | Any relata; determined by **provenance**, not relata: `evidence_kind = 'llm_inference'`. |
| **`sync`** | A projection of vault state into the graph — a recognition write, not a canonical assertion. Exists to be filtered out of canonical reads. | Any relata; determined by **provenance**: `evidence_kind ∈ {frontmatter, wikilink}`. |
| **`compatibility`** | Migration / cross-extension debt. A legacy alias retained so old readers do not break. | Determined by **type identity** alone: the type is flagged `compatibility: true` in the registry. |

The three provenance families (`inferred`, `sync`, `compatibility`) and `kernel_core` are **overrides**; `structural` vs `correspondential` is the **base epistemic axis**. This ordering is what makes the rule deterministic (§3).

### 1.5 What the current code actually does

`Body/S/S2/graph-schema/src/relationships/mod.rs:26-45`:

```rust
pub fn relation_family_for_relationship_type(rel_type: &str) -> &'static str {
    if rel_type == KERNEL_RESONANCE_RELATION {
        return RELATION_FAMILY_KERNEL_CORE;
    }
    if let Some(spec) = RELATIONSHIP_TYPE_SPECS
        .iter()
        .find(|spec| spec.rel_type == rel_type)
    {
        if spec.compatibility {
            return RELATION_FAMILY_COMPATIBILITY;
        }
        return match spec.source_family {
            "llm-inference" => RELATION_FAMILY_INFERRED,
            "sync" => RELATION_FAMILY_SYNC,
            "kernel-resonance" => RELATION_FAMILY_KERNEL_CORE,
            _ => RELATION_FAMILY_STRUCTURAL,
        };
    }
    RELATION_FAMILY_CORRESPONDENTIAL
}
```

Read plainly, this function says: **registry membership decides the family.** A type in `RELATIONSHIP_TYPE_SPECS` (35 entries, 33 non-compatibility) is `structural` unless its `source_family` says otherwise; anything not in the registry falls through to `correspondential` at line 44.

Four defects in it, all load-bearing for this derivation:

1. **The `"kernel-resonance"` arm is dead code.** No spec carries that `source_family`. `kernel_core` can only ever arise from the early return at line 27.
2. **`correspondential` is defined negatively** — "not a known rel_type". It is an absence, not a property.
3. **The function is type-only.** It cannot see the edge's endpoints or its provenance, so it cannot express a family that depends on either. This is the structural reason it mis-classifies `OPERATES_IN` (§3.4).
4. `relationship_spec()` at `mod.rs:19-24` filters `!spec.compatibility`, so the two `compatibility` types are unreachable via `RelationshipWritePlan::new` — the `compatibility` family can never be written by the sync path.

---

## 2. The v3 musical derivation — what it actually says, and what it does not decide

### 2.1 What it says

The operative canon excerpt, `Body/S/S5/plugins/epi-logos/resources/canon/ql-musical-derivation-v3.md:12-20`:

> ## Lens-Harmonic-Position Triangle
>
> The corrected grammar is triangular, not flat:
>
> - **Positions (P/P') = 0** — the substance, the twelve archetypal points with Name/Power content.
> - **Lenses (L/L') = /** — the refraction, how substance becomes epistemically accessible.
> - **Harmonics (A/B/C + D) = 1** — the relation, how refracted positions stand in mutual determination.
>
> This is the QL form of integral projected interdependence. Positions are not inert notes, lenses are not metadata, and harmonics are not generic tags.

`:22-30`:

> ## Corrected Families
>
> | Family | Register | Pair Law | Semantic Relation |
> |---|---|---|---|
> | A | Being | `(0,1), (2,3), (4,5)` | `ADJACENTLY_ARTICULATES` |
> | B | Becoming | `(0,5), (1,4), (2,3)` | `MIRRORS_COMPLEMENT` |
> | C | Knowing-Unknowing | `(1,2), (3,4), (5,0)` | `CROSSES_KNOWING_LIMIT` |
>
> `L2/L3` is both A and B: adjacent Being and mirror Becoming at the midpoint of the hexad. This is the hinge where logic and process are one structure seen from two faces.

`:32-40`:

> ## D As Inversion Operator
>
> D is not a fourth peer family. D is the 3-but-1 inversion operator:
>
> - `D_LEFT` / `D←` = `X'/Y`
> - `D_RIGHT` / `D→` = `X/Y'`
> - `D_BOTH` / `D↔` = `X'/Y'`
>
> Depth 2 is the Day dyad, depth 3 is one Night lens entering, and depth 4 is the full pair inversion.

The full seed authority, `Idea/Bimba/Seeds/M/M5'/ql-musical-derivation-v3.md:1135-1139`:

> The three relation-families are:
>
> - **A** — **Being / adjacent-identity**: local articulation, the natural dyad of neighboring positions
> - **B** — **Becoming / converse-mirror**: complement-recognition, the X+Y=5 mirror-progression
> - **C** — **Knowing-Unknowing / offset-transition**: crossing, the threshold where inquiry moves between neighborhoods

### 2.2 Its scope is the P/L triangle over the hexad — and nothing wider

`Idea/Bimba/Seeds/M/M5'/ql-musical-derivation-v3.md:1125`:

> The pairing-grammar is the matheme's *how-of-relation* — the rules by which matheme-positions stand in dyadic-relation to each other.

The universality claim is over *musical content levels*, not over graph edges — `:1233-1243`:

> **The pairing-grammar is universal because it derives from the matheme's positional-architecture, not from any particular content-derivation.** The six families are the matheme's universal-relational-syntax at every level of musical-content. What varies across content-levels is *which specific intervals the families produce*; the structural-relational-rules are invariant.

Every pair law is an integer pair drawn from `{0,1,2,3,4,5}` and its primed conjugate. The one graph-facing sentence is scoped to *harmonic* relation only — `canon/ql-musical-derivation-v3.md:51`:

> This is why the graph and code should use semantic relation types rather than one generic harmonic-relation edge.

### 2.3 Verdict: it does NOT determine `c_1_relation_family`

Exact-string counts across all three copies of the derivation (`Body/S/S5/.../non-dual-binary/` 2008 lines, `Idea/Bimba/Seeds/M/M5'/` 2008 lines, `Body/S/S5/.../canon/` 59 lines):

| String | non-dual-binary | M5' seed | canon excerpt |
|---|---|---|---|
| `relation_family` | 0 | 0 | 0 |
| `c_1_relation_family` | 0 | 0 | 0 |
| `correspondential` | 0 | 1 (frontmatter, unrelated sense) | 0 |
| `kernel_core` | 0 | 0 | 0 |
| `inferred` | 0 | 0 | 0 |
| `sync` | 0 | 0 | 0 |
| `compatibility` | 0 | 0 | 0 |
| `structural` | 74 (adjective only) | 74 (adjective only) | 0 |

`HAS_INTERNAL_COMPONENT`, `OPERATES_IN`, `CONTAINS`, `RESOLVES_TO`: **not found** in any copy.

**The v3 musical derivation does not know the `c_1_relation_family` typology exists.** It defines no rule, default, or procedure for typing any relationship type outside the position-pair grammar. Stating this plainly, as instructed: *the v3 derivation is not the source of the relation-family formula.* What it is the source of is a **different axis** — the psychoid harmonic grammar, which belongs in `c_4_harmonic_family` and already lives there.

### 2.4 On 16/9, 9/8, epogdoon, R+r=1

These govern **position/step/descent energetics**, never relation typing. `Body/S/S5/.../non-dual-binary/ql-musical-derivation-v3.md:864-866`:

> | **16/9** | QL totality / doubled-fourth | Matheme's totality-ratio, one-epogdoon-short-of-octave |
> | **9/8** | Epogdoon / tick / whole-tone | Matheme's tick-quantum, the generative-incompleteness-residue |
> | **2/1** | Octave | Cyclic-closure, approached but structurally-deferred |

`:889-891`:

> $$\boxed{\frac{16}{9} \times \frac{9}{8} = \frac{2}{1}}$$
> The matheme totalises at 16/9; the octave is at 2/1; the difference is one epogdoon-tick.

`R+r=1` and `2r/R`: **not found** in any copy of the derivation (they live at `Body/S/S0/portal-core/tests/k2_geometry_reference.rs:16,19`). There is no passage in which a ratio selects or determines a relation family, and none in which a relation family is derived from a ratio. This confirms the prior register law — 9/8 is step/double-cover, never aspect — and it means the ratios contribute nothing to relation-family assignment.

### 2.5 The psychoid harmonic families are a real typology — just not this one

`Idea/Bimba/World/Types/Psychoids/#/Relations/Relations.md:15`:

> This MOC roots the **archetypal grammar of harmonic relations** between psychoid wells. The relation families are lifted from [[ql-musical-derivation-v3]] and named so they can be re-used wherever psychoid pairings recur … The families are the *grammar*; the music derivation is only one expressive substrate over them.

`:34-37`:

> - **A / B / C** — within-pass, **physical-pole-trinity**, carry matheme positions **1, 2, 3** (the explicate three). They constitute the bimba helix's internal grammar.
> - **D1 / D2 / D3** — cross-pass and inverse-pass, **mental-pole-trinity**, carry matheme positions **4, 5, 0** (the implicate three). …
>
> This is not a stylistic grouping — it is the matheme-position-grammar each family carries when invoked.

Status is explicitly **not promoted** — `Idea/Bimba/World/Types/Coordinates/C/C2/Entities-Properties-Tags/Relation-Fields/Psychoid-Harmonics/Psychoid-Harmonics.md:23`:

> no schema becomes a graph label until [[S2]] review approves it.

**So there are two relation typologies, and they are orthogonal:**

| Axis | Property | Types by | Domain | Status |
|---|---|---|---|---|
| DR-IG-1 six | `c_1_relation_family` | provenance + epistemic kind of relata | all 11,295 Bimba edges | ratified |
| Psychoid harmonic | `c_4_harmonic_family` | matheme pair law over `{#0…#5} ∪ {#0'…#5'}` | 36 P×L edges | candidate |

Both can and should coexist on the same edge. They answer different questions: *what kind of claim is this?* versus *which harmonic dyad is this?*

### 2.6 On "psychoid relators"

The Architect's intuition is correct in substance, with one precision. Canon nowhere says relations *are* psychoid entities — "relator" appears in this repo only in the algebraic-topology sense (`aba⁻¹b⁻¹ = 1`). What canon says is that relations *among psychoids* are archetypally graded, and that the psychoid layer contains the **relation archetype itself**. From the live graph, the `#` node's `q_1_root_and_slash` register:

> As inner symbol 0/1, it is the slash itself: **not punctuation between two terms but the live act of relating them,** the operation by which a field comes to be at all.

And `#2 Operation`, `q_2_the_live_relating`:

> Operation is the energetic-relational position as such — the how. It is the slash taken as live operation … the dynamics that pass between terms …

`Body/S/S0/epi-lib/include/psychoid_numbers.h:2-8`:

> ```
>  * psychoid_numbers.h — The Promises of the Bedrock
>  *
>  * Extern declarations for the seven psychoid-numbers (#0-#5 + Hash),
>  * four weave interleaves, and seven context frame roots.
>  * These are the pre-categorical foundation — FAMILY_NONE.
>  * C0-C5 are C-family MANIFESTATIONS, not these.
>  */
> ```

`Idea/Bimba/World/Types/Psychoids/Psychoids.md:16`:

> Psychoids are the source-wells. They are the "0" layer of the Epi-Logos coordinate ontology … **they are charges.** Each well already carries a definite dimensional character, a definite Day-Night polarity, and **a definite grammatical position in the hexadic-relation field.**

**Operative consequence for this derivation:** psychoid-touching edges are not ordinary lattice edges. They are the bedrock spine — `#n MANIFESTS→ {C,P,L,S,T,M}{n}` and its inverse `BEDROCK`. In the live graph the psychoid edge vocabulary is exactly seven types: `MANIFESTS` (72), `BEDROCK` (72), `ENTANGLES` (18), `INTERLEAVES` (12), `ANCHORED_TO` (7), `GENERATES` (6), `MOBIUS_RETURN` (2) — 189 edge-endpoints, 188 distinct edges. §3 assigns these to `kernel_core`; §6.1 flags that this specific assignment is a **decision**, not something canon already states.

---

## 3. The formula

Stated as a rule a program can apply. Input: an edge `e` of type `T` from node `a` to node `b`. Output: exactly one of the six families.

```
family(e, T, a, b):

  # ---- Stage 1: type-identity overrides ----
  1. if T == "HAS_KERNEL_RESONANCE":                         -> kernel_core
  2. if spec(T).compatibility == true:                       -> compatibility
        # currently exactly {POS0_LINKS_TO, POS5_INTEGRATES_INTO}

  # ---- Stage 2: provenance overrides (per-EDGE, not per-type) ----
  3. if e.evidence_kind == "llm_inference":                  -> inferred
  4. if e.evidence_kind in {"frontmatter", "wikilink"}
        or T in {"PROMOTES_TO", "SYNCED_FROM", "REFERENCES"}: -> sync

  # ---- Stage 3: the epistemic relata test ----
  5. if a:Psychoid or b:Psychoid:                            -> kernel_core
  6. if a.c_3_dataset_branch IS NULL
        or b.c_3_dataset_branch IS NULL:                     -> structural
  7. otherwise (both endpoints are dataset content):         -> correspondential
```

### 3.1 Why this is the right shape

The three stages encode a precedence that follows from what the families mean.

- **Stage 1** is type identity: a relationship type that *is* the kernel-resonance relation, or *is* a legacy alias, carries its family in its name. Nothing about its endpoints can change that.
- **Stage 2** is provenance: `inferred` and `sync` are claims about *how the edge came to exist*, not about what it relates. A model-proposed `PART_OF` and a canonical `PART_OF` relate the same kinds of thing but are not the same kind of claim. This is why they must override the relata test.
- **Stage 3** is the epistemic test the Architect specified: *the family of a relation is a function of what the related nodes actually are.* Three node kinds, three answers:
  - a **psychoid** (`#0`–`#5`) is pre-categorical — prior to both lattice and content — so an edge touching one is bedrock: `kernel_core`;
  - a **skeleton** node (`:Coordinate`, `:ContextFrame`, `:VakCoordinate`, `:Root` — operationally, no `c_3_dataset_branch`) is the system's own wiring, so an edge touching one asserts position-in-the-system: `structural`;
  - two **dataset content** nodes are two independently-constituted symbolic domains, so an edge between them asserts a correspondence witnessed by a tradition: `correspondential`.

The skeleton test uses `c_3_dataset_branch IS NULL` rather than a label list because labels are incomplete: `OPERATES_IN` targets `:ContextFrame` nodes (`CF_MOBIUS`, `CF_BINARY`, `CF_FRACTAL`) which are skeleton but not `:Coordinate`. Provenance-absence is the robust test.

### 3.2 It closes 100% of the graph

Applying the rule to all 11,295 Bimba-Bimba edges:

| Family | Edges | % |
|---|---|---|
| `correspondential` | 9,941 | 88.01% |
| `structural` | 1,133 | 10.03% |
| `kernel_core` | 188 | 1.66% |
| `inferred` | 26 | 0.23% |
| `sync` | 7 | 0.06% |
| `compatibility` | 0 | 0.00% |
| **Total** | **11,295** | **100%** |

No residue, no unclassified edge, no type-by-type enumeration required.

### 3.3 It agrees with the existing code 95.8% of the time

The existing `relation_family_for_relationship_type` decides `structural`/`correspondential` by registry membership. The proposed rule decides it by relata kind. These are *independent* signals — one reads a Rust table, the other reads the graph — so their agreement is a real validation.

| existing (registry) | proposed (relata) | edges | verdict |
|---|---|---|---|
| correspondential | correspondential | 9,930 | AGREE |
| structural | structural | 895 | AGREE |
| correspondential | structural | 271 | differ |
| structural | kernel_core | 188 | refinement |
| structural | correspondential | 11 | differ |

**Agreement: 10,825 / 11,295 = 95.8%.** Counting the 188 `kernel_core` as a refinement the registry cannot express (it has no way to reach `kernel_core` at all), agreement is **97.5%**. Only **282 edges (2.5%)** genuinely differ.

### 3.4 Where they differ, the relata rule is right

The 271 "registry says correspondential, relata says structural" edges are lattice types that were simply never added to `RELATIONSHIP_TYPE_SPECS`:

`HAS_COORDINATE_SCOPE` (124), `HAS_INTERNAL_POSITION` (36), `MEDIATES_PROTOCOL_LAYER` (28), `QL_COMPLEMENTS` (12), `READ_THROUGH_LENS_POSITION` (12), `QL_NEXT` (12), `INTERPRETS_QL_POSITION` (12), `QL_PREVIOUS` (12), `REPRESENTS_LENS` (6), `GOVERNS_COORDINATE_FAMILY` (3), `EXPOSED_AS_M_PRIME_AFFORDANCE` (3), and a tail of 2s and 1s.

Every one of these is obviously coordinate-lattice wiring. The registry is a **lagging proxy**; the relata test corrects it. This is the strongest argument for the Architect's framing: derive from what the nodes are, and the registry's gaps stop mattering.

The 11 in the other direction (`CONTAINS` 7, `GENERATES` 2, `MANIFESTS` 1, `REFLECTS_AS` 1) are generic type names reused *inside* dataset content — a `CONTAINS` between two `parashakti-deep` nodes is domain composition, not lattice wiring. Again the relata test is right and the type name is misleading.

**One important case the existing code gets wrong on its own terms:** `OPERATES_IN` is registered with `source_family: "llm-inference"`, so `relation_family_for_relationship_type` returns `inferred` for all **596** of its edges. But only 26 edges in the entire graph carry `evidence_kind = 'llm_inference'`, and none of them is an `OPERATES_IN`. These 596 came from dataset import and anchor content into `:ContextFrame` nodes. They are `structural`. The bug is structural in the code: **family is a per-edge property, and a per-type function cannot express it.**

---

## 4. Proposed mapping

### 4.1 Explicit rows — top 45 types by edge count

Covering 7,397 edges (65.5%). "Rule" cites the numbered step from §3.

| # | Relationship type | Edges | Family | Rule |
|---|---|---|---|---|
| 1 | `HAS_INTERNAL_COMPONENT` | 828 | correspondential | 7 |
| 2 | `OPERATES_IN` | 596 | **structural** | 6 — targets `:ContextFrame` |
| 3 | `LINE_CHANGE` | 383 | correspondential | 7 — mahamaya↔mahamaya |
| 4 | `FLOWS_CLOCKWISE` | 360 | correspondential | 7 |
| 5 | `GOVERNS_DEGREE_ARC` | 360 | correspondential | 7 |
| 6 | `ANCHORED_BY` | 360 | correspondential | 7 |
| 7 | `POLAR_OPPOSITE` | 360 | correspondential | 7 |
| 8 | `CAUSAL_RESONANCE` | 336 | correspondential | 7 — parashakti content |
| 9 | `YIELDS_CODON` | 322 | correspondential | 7 |
| 10 | `USES_PAIR` | 282 | correspondential | 7 |
| 11 | `HAS_DECAN` | 252 | correspondential | 7 — named in canon §1.3 |
| 12 | `RESOLVES_TO` | 184 | correspondential | 7 |
| 13 | `IS_CLASSIFIED_AS` | 183 | correspondential | 7 |
| 14 | `INITIATES` | 182 | correspondential | 7 |
| 15 | `CONTAINS` | 125 | structural (118) / correspondential (7) | 6 / 7 |
| 16 | `HAS_COORDINATE_SCOPE` | 124 | **structural** | 6 — registry gap |
| 17 | `HOLOGRAPHIC_PATTERN` | 102 | correspondential | 7 |
| 18 | `FINITE_MANIFESTATION_OF_INFINITE` | 102 | correspondential | 7 |
| 19 | `LINGUISTIC_CORRESPONDENCE` | 99 | correspondential | 7 — anuttara→parashakti |
| 20 | `GRAMMATICAL_CORRESPONDENCE` | 99 | correspondential | 7 — anuttara→parashakti |
| 21 | `DIGITAL_ARCHETYPAL_RESONANCE` | 99 | correspondential | 7 — parashakti→anuttara |
| 22 | `MIRROR_COMPLEMENT_CORRESPONDENCE` | 98 | correspondential | 7 |
| 23 | `MANIFESTS_THROUGH` | 83 | correspondential | 7 |
| 24 | `BELONGS_TO_AJNAS_FAMILY` | 81 | correspondential | 7 |
| 25 | `EXPRESSES_SPIRITUAL_STATION` | 76 | correspondential | 7 |
| 26 | `EXPRESSES_THROUGH` | 74 | correspondential | 7 |
| 27 | `MANIFESTS` | 73 | **kernel_core** (72) / corresp. (1) | 5 / 7 |
| 28 | `HAS_INTERNAL_POSITION` | 72 | structural (36) / correspondential (36) | 6 / 7 |
| 29 | `BEDROCK` | 72 | **kernel_core** | 5 |
| 30 | `CONTAINS_DIVINE_NAME` | 72 | correspondential | 7 |
| 31 | `FAMILY_CONTAINS` | 72 | structural | 6 |
| 32 | `HAS_ASPECT` | 72 | correspondential | 7 |
| 33 | `TRUTH_SYNTHESIS_OF_APPEARANCES` | 69 | correspondential | 7 |
| 34 | `LIGHT_SYNTHESIS_OF_PERCEPTION` | 69 | correspondential | 7 |
| 35 | `UNITY_SYNTHESIS_OF_MULTIPLICITY` | 69 | correspondential | 7 |
| 36 | `DOMINANT_PLANETARY_RESONANCE` | 65 | correspondential | 7 |
| 37 | `TRANSLATES_TO` | 65 | correspondential | 7 |
| 38 | `HAS_UPPER_TRIGRAM` | 64 | correspondential | 7 |
| 39 | `HAS_LOWER_TRIGRAM` | 64 | correspondential | 7 |
| 40 | `INTEGRAL_SYMMETRY` | 64 | correspondential | 7 |
| 41 | `GOVERNS_TAROT_EXPRESSION` | 64 | correspondential | 7 |
| 42 | `REFLECTS_DNA_FORM` | 64 | correspondential | 7 |
| 43 | `TONIC_PLANETARY_RESONANCE` | 62 | correspondential | 7 |
| 44 | `FLOWS_TO` | 48 | correspondential | 7 |
| 45 | `RULED_BY` | 47 | correspondential | 7 — named in canon §1.3 |

Note rows 15, 27 and 28: **the same type yields different families on different edges.** This is not an inconsistency — it is the rule working correctly. `CONTAINS` between two coordinates is lattice wiring; `CONTAINS` between two `parashakti-deep` entities is domain composition. `HAS_INTERNAL_POSITION` splits exactly 36/36 on the same test. Any mapping expressed as `type → family` cannot represent this, which is the second reason the classifier must become per-edge (§6.3).

### 4.2 The remaining 34.5% — closed by rule

The 1,366 types below rank 45 (3,898 edges, 970 of them singletons) are **not enumerated**, by design. Every one of them is classified by §3 from its endpoints and provenance. Their aggregate distribution:

| Family | Edges below rank 45 |
|---|---|
| correspondential | 3,634 |
| structural | 187 |
| kernel_core | 44 |
| inferred | 26 |
| sync | 7 |
| **Total** | **3,898** |

Two anti-patterns to avoid when implementing:

- **Do not match on substrings.** `CAUSAL_RESONANCE` (336) contains `RESONANCE` but is parashakti domain content, not kernel. Only the exact type `HAS_KERNEL_RESONANCE` triggers `kernel_core` by name.
- **Do not infer `correspondential` from the type name.** `MIRROR_COMPLEMENT_CORRESPONDENCE` (98) is intra-branch, and it is correspondential because of its relata, not because of the word in its name. Conversely `LINE_CHANGE` carries no such word and is equally correspondential.

---

## 5. The existing 43 values: what A/B/C/D meant, and what to do

### 5.1 What they are

The 43 edges break into two groups:

| Group | Count | Stored value | Types |
|---|---|---|---|
| Harmonic P×L edges | 36 | `A` (3), `B` (3), `C` (3), `D` (27) | `ADJACENTLY_ARTICULATES`, `MIRRORS_COMPLEMENT`, `CROSSES_KNOWING_LIMIT`, `INVERTS_THROUGH_FIRST/SECOND/PAIR` |
| Vault frontmatter edges | 7 | `sync` | `SOURCES` (C0…C5 → C, C1 → CT) |

All 36 harmonic edges run **`:Coordinate` P-family → `:Coordinate` L-family** — `P0→L1`, `P2→L3`, `P0'→L5'` and so on. They are exactly the P/L triangle of §2.1, generated by `Body/S/S2/graph-services/src/pointers.rs:324-408` (`canonical_harmonic_bimba_relations`).

### 5.2 A/B/C/D is not an encoding — it is a column collision

`Body/S/S2/graph-services/src/graph_api.rs:939-948`:

```rust
fn harmonic_relation_set_clause(edge: &str) -> String {
    [
        format!("{edge}.c_0_source_coordinate = source.coordinate"),
        format!("{edge}.c_0_target_coordinate = target.coordinate"),
        format!("{edge}.c_1_relation_family = rel.harmonic_family"),   // <-- line 943, the bug
        format!("{edge}.c_2_relation_type = rel.relation_type"),
        format!("{edge}.c_2_edge_id = rel.edge_id"),
        format!("{edge}.c_3_created_at = datetime({{epochMillis: $timestamp_ms}})"),
        format!("{edge}.c_4_harmonic_family = rel.harmonic_family"),   // <-- line 947, correct
        ...
```

Line 943 writes `rel.harmonic_family` into `c_1_relation_family`. Line 947 writes **the same value** into `c_4_harmonic_family`. `harmonic_family` is `"A"|"B"|"C"|"D"|"NONE"` (`Body/S/S0/epi-lib/src/pointer_web.c:187-201`). None of those is a member of `RELATION_FAMILY_VALUES`, so line 943 writes out-of-enum values into an enum-typed column — and the enum is not enforced at raw-Cypher write sites.

**Verified on every one of the 36 edges: `c_1_relation_family == c_4_harmonic_family`.** The value is fully duplicated in its correct home.

### 5.3 Disposition

| Group | Action | Justification |
|---|---|---|
| **36 harmonic edges** | **Overwrite.** Set `c_1_relation_family` per §3. Delete line 943. | Zero information loss — `c_4_harmonic_family` already holds the identical value on all 36. The A/B/C/D grammar is preserved intact in its own column. |
| **7 `SOURCES` edges** | **Preserve.** | `sync` is a valid enum member, and §3 step 4 independently derives `sync` for these (`evidence_kind = 'frontmatter'`). Rule and stored value agree. |

Under §3 the 36 harmonic edges become `structural` (step 6 — both endpoints are skeleton `:Coordinate` nodes with no dataset branch). See §6.2: whether the P/L harmonic edges are better read as `correspondential` is a genuine judgement call reserved for the Architect.

**Nothing here should be translated.** A/B/C/D and the DR-IG-1 six are orthogonal axes (§2.5); there is no meaning-preserving map from one to the other, and inventing one would be exactly the fabricated derivation link this document is meant to prevent.

---

## 6. Open questions — for the Architect

Derived above; decided here. Six items, in descending load-bearing order.

### 6.1 Is `kernel_core` the psychoid spine? — **DECISION**

§3 step 5 assigns all 188 psychoid-touching edges (`MANIFESTS` 72, `BEDROCK` 72, `ENTANGLES` 18, `INTERLEAVES` 12, `ANCHORED_TO` 7, `GENERATES` 6, `MOBIUS_RETURN` 2) to `kernel_core`. **Canon does not state this.** `kernel_core` is currently reachable only via `HAS_KERNEL_RESONANCE`, which has zero edges — so the family is empty in practice and its intended extension is unrecorded.

The proposal rests on: the psychoids are `.rodata`, pre-categorical, `FAMILY_NONE`, the bedrock from which every family coordinate derives (`psychoid_numbers.h:2-8`); and `S2-ARCHITECTURE.md:266` wants `kernel_core` to be traversable as a single filtered subgraph, which the bedrock spine exactly is.

**Alternatives:** (a) psychoid edges are `structural` and `kernel_core` stays reserved for kernel-resonance scoring; (b) `kernel_core` means the C-kernel's own resonance edges only. Please pick.

### 6.2 Are the 36 P×L harmonic edges `structural` or `correspondential`? — **DECISION**

Both endpoints are skeleton coordinates, so §3 step 6 says `structural`. But a P→L edge relates two *different coordinate families* — position and lens — and `ql-musical-derivation-v3.md:14-20` calls the harmonic corner "the relation, how refracted positions stand in mutual determination", which reads as correspondence rather than containment. An earlier draft of the rule that tested cross-coordinate-family produced `correspondential` for exactly these 36 plus 6 `INTERPRETS_QL_POSITION`. Low blast radius (42 edges); genuinely ambiguous.

### 6.3 Should the classifier become per-edge? — **DECISION with a code consequence**

The current function is `fn(rel_type) -> family`. §3 needs `fn(rel_type, edge_props, node_a, node_b) -> family`. Without the change, three things stay broken: `OPERATES_IN`'s 596 edges are mis-typed `inferred` (§3.4); the same type cannot take different families on different edges (§4.1 rows 1/15/27); and `evidence_kind` — which is the actual provenance truth, present on only 69 edges — cannot be consulted at all.

This is a contract-surface change to `Body/S/S2/graph-schema/src/relationships/mod.rs` and its two call sites (`relationship_manager.rs:52`, `dataset_import/property_mapping.rs:458`). Per the DOX rail it needs Architect sign-off and a canon flag on `[[S2-ARCHITECTURE]]`, so it is **not** actioned here.

### 6.4 Defects found — confirm each is a bug, not intent

| # | Defect | Location | Proposed |
|---|---|---|---|
| 1 | `c_1_relation_family = rel.harmonic_family` writes out-of-enum A/B/C/D | `graph_api.rs:943` | Delete the line; §3 supplies the value |
| 2 | `"kernel-resonance"` match arm is dead code — no spec has that `source_family` | `relationships/mod.rs:41` | Remove, or wire it |
| 3 | `compatibility` unreachable — `relationship_spec()` filters `!spec.compatibility` before the write plan sees it | `relationships/mod.rs:19-24` | Confirm intended |
| 4 | `sync` written as a raw string literal, not the constant | `relationship_manager.rs:305-309` | Use `RELATION_FAMILY_SYNC` |
| 5 | Test fixture writes `c_1_relation_family = 'position'` — out of enum | `graph_api_contract.rs:511` | Fix fixture |
| 6 | Node `M2-3-1-51000` carries a `:Psychoid` label but is a `:VaultArtifact` with no `coordinate`/`c_4_family` | live graph | Strip the label — it makes step 5 mis-fire |
| 7 | `S2-ARCHITECTURE.md:49` points at `graph-schema/src/lib.rs:229-380`; specs moved to `relationships/rel.rs` | `S2-ARCHITECTURE.md:49` | Update path |

### 6.5 Canon inconsistency: B/C are swapped between two live sources — **NEEDS RESOLUTION**

`Idea/Bimba/World/Types/Psychoids/#/Relations/Relations.md:21-23` (created 2026-06-03) reads:

> - [[Family B — Offset-Transition]] — `{(1,2),(3,4),(5,0)}`
> - [[Family C — Converse-Mirror]] — `{(0,5),(1,4),(2,3)}`

The v3 correction of 2026-06-11 reversed exactly this — `canon/ql-musical-derivation-v3.md:44-49`:

> The former B/C labels are remapped:
>
> - Old C mirror squares are now **B-family / Becoming** squares.
> - Old B offset-transition squares are now **C-family / Knowing-Unknowing** squares.

`pointers.rs:325-344` and `pointer_web.c` follow the **corrected** grammar (B = `(0,5),(1,4),(2,3)` = `MIRRORS_COMPLEMENT` = Becoming). So `Relations.md` and its eight family pages carry pre-correction labels and were not swept. Additionally `Idea/Bimba/Seeds/M/M5'/ql-musical-derivation-v3.md:1214-1218` still carries the old pair assignment inside its own interval table, and `:1225` still reads "at **C and D1**" while the bullet beneath it was corrected.

This does not affect `c_1_relation_family` — but it will corrupt `c_4_harmonic_family` the moment the psychoid-harmonic schemas are promoted. Flagging for a canon sweep of `Idea/Bimba/World/Types/Psychoids/#/Relations/` and `M5'` §II-2.7.

Separately: `Relations.md` names **eight** families (A, B, C, D1, D2-Transform, D2-Require, D2-Complete, D3) while `pointers.rs` implements **A/B/C + D with three faces**. Confirm which granularity is canonical before promotion.

### 6.6 Definitions need ratifying — **DECISION**

§1.4 proposes prose definitions for all six families. No such definitions exist anywhere in canon (§1.2). If §1.4 is accepted it should be lifted into `[[S2-ARCHITECTURE]]` as the definitional home, with `rel.rs` carrying doc comments that point at it.

### The derived/decided boundary

| Derived from canon + graph — not open | Decided by the Architect — open |
|---|---|
| v3 does not determine relation family (§2.3, exact-string verified) | Whether psychoid edges are `kernel_core` (6.1) |
| A/B/C/D is a column collision, safely overwritable (§5.2) | Whether the 36 P×L edges are structural or correspondential (6.2) |
| `structural` vs `correspondential` turns on skeleton-vs-content relata (§3, 95.8% agreement) | Whether the classifier becomes per-edge (6.3) |
| The rule closes 100% of edges with no residue (§3.2) | Ratification of the §1.4 definitions (6.6) |
| `HAS_KERNEL_RESONANCE` and both `compatibility` types have zero edges (§0) | B/C swap resolution and 4-vs-8 family granularity (6.5) |
| Registry membership is a lagging proxy; relata correct it (§3.4) | |

---

## Provenance

Graph reads: `mcp__bimba-mcp__graph_cypher`, read-only (`write:false`) throughout, 2026-07-25. No write was issued to the graph. No code was modified. Every count in this document is reproducible from the Cypher shown or described inline.

Canon read: `rel.rs`, `relationships/mod.rs`, `properties.rs`, `graph_api.rs`, `pointers.rs`, `pointer_web.c`, `psychoid_numbers.h`, `13-decision-register.md`, `S2-ARCHITECTURE.md`, `anuttara-ux-full-m0-branch.md`, `THEIA-UI-PATTERNS-ARCHITECTURE.md`, all three copies of `ql-musical-derivation-v3.md`, `Psychoids/#/Relations/*`, `Psychoid-Harmonics.md`.
