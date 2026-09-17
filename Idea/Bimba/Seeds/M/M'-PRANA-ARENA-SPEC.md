---
coordinate: "M'"
status: "kernel-canon"
updated: "2026-06-16"
domain: "prana-arena-memory-substrate"
description: "The Prana arena as the session-bound, VAK-aware live working-set of embeddings — the surface where the dense-vector register and the coordinate-language register, held apart everywhere else, are made one per act. Defines the three-arena axis (Siva/Shakti/Prana), its three cache registers (Neo4j cold / Redis warm / arena hot), VAK-awareness of arena entries, the recall/genesis cycle by which novel meaning earns its coordinate, and the Psyche/CT4b session binding. The memory substrate the JEPA-EBM kernel runs on."
depends_on:
  - "[[epi-logos-kernel-spec]]"
  - "[[M'-MODEL-SLOT-SPEC]]"
  - "[[M'-ML-SKILL-SURFACE-SPEC]]"
  - "[[M'-AGENTIC-RUNTIME-SPEC]]"
---

# The Prana Arena

## The Session-Bound Live VAK-Compression Substrate (Three-Arena Memory Actualised)

> **The kernel runs on the bimba map** ([[epi-logos-kernel-spec]] §0/1): the Neo4j typed graph IS the configuration space, not an external KB the kernel consults; "deposition back into it is how the system evolves." This spec defines the *memory substrate* that makes that navigation live — the Prana arena where the act actually computes, and where novel meaning earns the coordinate it is deposited under.

> **The unification claim.** The dense embedding is coordinate-*addressed* (hung on the `:Bimba` node, keyed by `coordinate`, in the `c_5_embedding` slot) but not coordinate-*encoded* (it is a dense Gemini vector, not composed of the 109+19 VAK alphabet). The EBM consumes two channels — `input_embeddings` (dense) and `lens_resonance_72` (coordinate-language-derived) — fused, neither a compression of the other. **The static store keeps these registers co-located but distinct; the Prana arena is the one place they are held together and operated on at once.** Static = co-located; lived = unified. The arena is where compress-to-VAK is made live.

---

## §0/1 — Threshold: What the Prana Arena Is

Per [[epi-logos-kernel-spec]] §VI and DR-ARENA-1, the system's memory is three arenas — an **ontological substrate axis**, not a cache-temperature axis:

| Arena | Nature | Kernel role | Persisted projection |
|---|---|---|---|
| **Siva** (`.rodata`, immutable archetypes #0–#5, `BIMBA=const`) | the frozen reasoning base + canonical bimba `q_b` (Prakāśa / target) | the *target* in JEPA context-target prediction | `:Bimba` canonical nodes |
| **Shakti** (mutable heap, `Coordinate_Arena`, PRATIBIMBA) | mutable instances + live proposals + parametric experts; pratibimba `q_p` (Vimarśa / prediction) | the *prediction* | `:World` / runtime nodes |
| **Prana** (`Tensor_Arena` / 3072-dim embeddings) | the representation manifold where energy `E = ‖q_b − q_p‖²` is scored | the *manifold* | 3072-dim vector layer + EBM-head substrate |

The Prana arena is **not** a generic cache and **not** a duplicate of Neo4j. It is the **lived (Vimarśa) register of the embedding manifold**: the bounded, coordinate-addressed working-set the act computes over, one per session-NOW, held by Psyche. It is where the kernel's bimba-projection (`q_b`, the canonical target, read from Neo4j) and the live pratibimba proposal (`q_p`) are both materialised in-process and compared by energy — and where novel meaning, having no coordinate yet, earns one by where it lands.

This spec is the memory-substrate companion to the kernel spec's operator: the kernel spec defines *one tick of the act*; this defines *the surface the act runs on per session*.

## §1 — The Three Registers of Prana (the orthogonal cache axis, per DR-ARENA-1)

Prana has three physical homes, all **coordinate-keyed**, distinguished by job — this is the HOT/WARM/COLD cache-temperature axis layered *over* Prana, which is **orthogonal to** and never conflated with the Siva/Shakti/Prana data-tier axis:

| Register | Job | Form |
|---|---|---|
| **Neo4j** (COLD / bimba) | durable truth + ANN similarity search — "which coordinates are relevant?" | `coordinate → c_5_embedding`, all coordinates |
| **Redis** (WARM) | cross-turn / cross-process coordination of the session's working embeddings | `epi:{day}:{session}:{turn}:{coordinate}:semantic:{embedding_id}` |
| **`Tensor_Arena`** (HOT / pratibimba) | in-process compute: EBM energy + kernel q-math over the bounded horizon | `(coordinate ↔ embedding)` SIMD-aligned working-set |

The arena is the **pratibimba (lived working-set) of Neo4j's bimba (recorded substrate)** — a cache-temperature projection, not a copy. The Redis `{day}:{session}:{turn}:{coordinate}:semantic` key (Track 39 Access Pattern 4) is the arena's **serialized warm shadow**: the same coordinate-keyed embeddings persisted across turns/processes. No register is redundant — Neo4j retrieves, Redis coordinates, the arena computes. (You would no more run the EBM over Redis than run a matmul over a database.)

**Hydration.** Read path: on coordinate-resolve, the act's neighborhood embeddings project Neo4j(COLD) → Redis(WARM) → `Tensor_Arena`(HOT). Write path: new/changed embeddings crystallize back on the Möbius return (#5→#0) via the existing CCT-16 `BidirectionalSyncer::MostRecent`. The EBM reads only the hot working-set — never all of Prana, only the act's neighborhood (Tranche 8.9 one-act-per-tick; CCT-22(b) "the substrate IS the lookup tool").

## §2 — VAK-Awareness: the arena entry is a triple, not a float

An arena entry is a **`(coordinate ↔ dense_embedding ↔ q_{n}_{semantic} discoverable)` triple**, not a bare vector. This is mandatory, not decoration, and it follows from two facts:

1. **The EBM's second channel is coordinate-derived.** Per [[M'-ML-SKILL-SURFACE-SPEC]] §1 and Tranche 6.8, the EBM consumes `(input_embeddings, lens_resonance_72)`. `lens_resonance_72` is read off the *coordinate's* position in the 72-fold Parashakti field — so the arena must carry coordinates, or the EBM's second input cannot be computed. An arena of naked vectors literally cannot feed the EBM.
2. **The kernel forward-derives meaning from coordinates.** Compress-to-VAK (DR-VAK-7, Tranche 12.33) = "the coordinate IS the compression code; decompression = kernel forward-run from the coordinate." The kernel side of the act operates on coordinates; the EBM side on vectors. The arena is the only surface where both are simultaneously live.

This **resolves the gap the canon explicitly leaves open** (the embedding↔coordinate-language relation is named nowhere). The resolution is correct *because* it places the unification in the lived act, not the static store: Neo4j rightly keeps the dense vector and the coordinate co-located-but-distinct; the arena rightly fuses them, transiently, for the duration of the act. **The Prana arena is the live VAK-compression surface.**

## §3 — The Two Directions: Recall and Genesis

The arena's VAK-awareness operates in two directions — the bimba/pratibimba cycle at the embedding register, the #5→#0 Möbius return made concrete:

- **(a) Recall — read-in, pre-addressed.** `s5'.gnostic.query_with_layers` projects the session's horizon from Neo4j; everything that lands arrives *already coordinate-tagged* (it came off addressed nodes). VAK-awareness here is inherited. This is the recall surface the EBM scores against.

- **(b) Genesis — write-out, addressed-by-imprint.** For *novel* content (a journal entry, a Sophia proposal, the session's new meaning) there is no coordinate yet; compress-to-VAK must *assign* one. Assignment is an embedding op against the bounded horizon: embed the new content → imprint it into the arena beside the pre-addressed horizon → derive its coordinate from its position/resonance (nearest coordinates + EBM energy-against-canon + lens resonance). **The arena imprint is the source of the address.** That derived coordinate-ancestry is precisely the input to Hen's **birth-codon** (CCT-14b: content + kairos + creator + *coordinate ancestry*), and the new `(coordinate, embedding)` pair crystallizes to Neo4j on the Möbius / night′ return. The arena is the genesis surface of new coordinates — where novel meaning earns its address, and ultimately its codon.

Recall is reflection of canon into the lived act; genesis is the lived act depositing new canon. Both are the arena being VAK-aware.

## §4 — Session Binding: an Anima session, a Psyche NOW

The arena is **session-scoped**, and the session IS the NOW, nested in a day. Per the Khora session model the path is `Empty/Present/{DD-MM-YYYY}/{session_id}/now.md` — the day folder is **flat** under `Empty/Present` (the rolling two-day presence window). The `{YYYY}/{MM}/W{WW}/{DD}` weekly nesting belongs **only** to the History archival tree, never to Present; archiving by year→month→week is a History concern, not a live-presence one. The `session_id` is the directory containing now.md; the NOW's coordinate is `M4-{session_id}`.

The session is an **Anima orchestration** at CF `(4.0/1–4.4/5)` — the fractal-doubling / Ralph-mode container; Anima always orchestrates at the higher level. Nested inside it, **Psyche** at CF `(4.5/0)` is the NOW-holder ("context window, session state, handoff") — the engaged subject that reasons over the arena. One arena per session-NOW.

> The `(4.5/0)` = Möbius return `(5/0)` is not incidental: it is structurally **why** Psyche owns the genesis write-back. Crystallization IS the #5→#0 return, and that return IS Psyche's frame. (Code — `dispatch-validate.ts`, `psyche-continuity.ts` — already carries Psyche = `(4.5/0)`; the `psyche.md` card's `(4.0/1–4.4/5)` is the error — that is *Anima's* frame — and is corrected to `(4.5/0)`.)

- **Symbolic horizon vs embedding horizon.** Psyche's `carryForward` (hard-capped at **12** items — the Schismogenesis guard) is the session's bounded *symbolic* working-set (artifacts). The Prana arena is the session's bounded *embedding* working-set. Same bound at two registers; the arena is the meaning-of-the-NOW as vectors-with-coordinates.
- **Population.** The horizon is sourced at the gnostic-notebook / kbase level: `session-workspace.json → gnostic_handles.active_notebooks[]` (Track 39 Access Pattern 2) names which `:Gnostic:Notebook` nodes scope the session; `query_with_layers` projects their embeddings into the arena.
- **Crystallization.** Session close (Möbius / night′ promotion) writes genesis-addressed meaning back to Neo4j via CCT-16 `MostRecent` — at Psyche's `(4.5/0)` Möbius position.

**Ownership:** the Khora session layer (S4-0') owns arena lifecycle within the Anima `(4.0/1–4.4/5)` orchestration; Psyche (S4-4', CF `(4.5/0)`) is the engaged subject that reasons over it and performs the Möbius crystallization.

## §5 — The EBM and Kernel both read the arena; the parametric experts do not

- **EBM (5' / Epii, representation space):** reads the arena's dual channels — `input_embeddings` (the dense vectors) + `lens_resonance_72` (the coordinate-derived resonance) — and scores energy `E = ‖q_b − q_p‖²`. The bioquaternion→embedding projection layer ([[M'-ML-SKILL-SURFACE-SPEC]], Tranche 6.8) projects the kernel's `BioQuaternionState` into the arena's input space.
- **Kernel (S0, C, configuration space):** forward-derives `q_b`/`q_p` and energy gradient from the arena's *coordinates*. The C `Tensor_Arena` and the EBM process's tensor are two register-instances of one horizon (different compute — quaternion math vs energy/gradient — over the same coordinate-addressed set); they are NOT a duplication to reconcile.
- **Parametric experts (4' / Nara, parameter space, DR-PARAM-1):** live in the *local LLM's weights*, not the arena. Canon-fact micro-experts modify Nara's final FFN; the arena is Epii's representation horizon. Keep these registers clean: experts = parameter-space carriage at 4'; arena = representation-space horizon at 5'.

## §6 — Structural vs Tunable

- **Structural (not tunable):** the three-arena axis; the bimba/pratibimba relation; VAK-awareness of arena entries; the session-NOW binding (Psyche/CT4b); the recall/genesis cycle; the read-in (`query_with_layers`) and write-out (Möbius/CCT-16) paths.
- **Cache-mechanics knobs only** (per Track 38 §2.4, the `[prana.arena]` row): projection granularity (`working_set_projection`) and write-back cadence (`write_back`) are **Class B** (research-driven, measured, rollback-able, like the EBM compression-equivalence knob); arena capacity and eviction policy (`eviction_policy`) are **Class C** (cache-TTL-class, Aletheia-self-tuned). Default `write_back = on_crystallize` IS the Möbius return.

Nothing about the arena's *role* is a tunability deferral — only its cache mechanics tune.

## §7 — Build Mapping (cycle-3 tranches)

| Piece | Status | Lands at |
|---|---|---|
| `Tensor_Arena` (SIMD float arena) | LANDED | `Body/S/S0/epi-lib/include/arena.h`, `src/arena.c` |
| Arena entry as `(coordinate ↔ embedding ↔ q_*)` triple | NEW (this spec) | arena struct extension carrying the coordinate + q_* handle alongside the float anchor |
| Session-scoped arena owned by Khora/Psyche | NEW (this spec) | Track 39 Access Pattern 2 `session-workspace.json` (+ `prana_arena_handle`); Psyche `operativeNotebook` extension |
| Recall (read-in) | SPEC-AHEAD | `s5'.gnostic.query_with_layers` (Track 39 / Tranche 12.2 EXPANDED) projects horizon → arena |
| Genesis (write-out, address-by-imprint) | NEW (this spec) | arena-position → coordinate derivation feeding Hen birth-codon (CCT-14b `coordinate ancestry`) |
| EBM dual-channel read from arena | SPEC-AHEAD | Tranche 6.8 (N-channel EBM head); `ebm_user_projection.py` |
| Warm shadow | SPEC-AHEAD | Redis `epi:{day}:{session}:{turn}:{coordinate}:semantic:*` (Track 39 Access Pattern 4) |
| Crystallization (write-back) | SPEC-AHEAD | Möbius / night′; CCT-16 `BidirectionalSyncer::MostRecent` |
| Capacity / eviction knobs | tunable | Track 38 §2.4 `[prana.arena]` Class C |

## §8 — Verification (acceptance shape)

- An arena entry round-trips as a `(coordinate, embedding, q_* handle)` triple, not a bare vector; the EBM can read both `input_embeddings` and `lens_resonance_72` from one arena without a second lookup.
- **Recall:** `query_with_layers` over a session's `active_notebooks[]` populates the arena with coordinate-tagged embeddings; the EBM scores energy against them.
- **Genesis:** a novel content imprint with no prior coordinate is assigned a coordinate from its arena position; that coordinate-ancestry feeds a Hen birth-codon; the new `(coordinate, embedding)` crystallizes to Neo4j on session close.
- **Isolation:** two concurrent sessions hold two arenas bound to two distinct NOW coordinates; neither sees the other's horizon.
- **Orthogonality:** an arena entry's cache temperature (HOT) is independent of its arena (Prana) — verified by a datum that is Prana-resident and COLD-cached simultaneously.

---

**Canonical decisions:** DR-ARENA-1 (three-arena axis), DR-PRANA-1 (this spec's ratification), DR-PARAM-1 (parametric experts — distinct register). **Cross-spec:** [[epi-logos-kernel-spec]] (the operator), [[M'-MODEL-SLOT-SPEC]] (Nara slot / parametric carriage), [[M'-ML-SKILL-SURFACE-SPEC]] (EBM head, dual-channel). **Cross-tranche:** Track 39 (ONE substrate, Access Patterns 2+4), Tranche 6.8 (EBM), Tranche 12.2 EXPANDED (`query_with_layers`), CCT-14b (birth-codon genesis), CCT-16 (crystallization), CCT-22 (substrate IS compression), Tranche 8.9 (one act per tick).
