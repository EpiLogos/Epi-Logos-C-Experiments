---
coordinate: "S0/S0'"
c_4_artifact_role: "seed-spec"
c_1_ct_type: "CT1"
c_3_ctx_frame: "4.0/1-4.4/5"
c_3_created_at: "2026-05-19T00:00:00Z"
c_0_source_coordinates:
  - "[[S0-SPEC]]"
  - "[[S0-SOURCE-INDEX]]"
  - "[[S0-SHARD-INDEX]]"
  - "[[2026-05-18-bimba-pointer-web-and-integration-spec]]"
  - "[[ql-musical-derivation]]"
  - "[[Coordinate Type System: Foundational & Reflection Families]]"
---

# S0 Harmonic Pointer Web36 Specification

## Status

This seed makes the pointer web an S0 / S0' kernel concern before it is a graph concern. S2 may project the web into Neo4j relationships, M' may render it as a musical and visual instrument, and S3/S5 may use it in session and agent protocols, but the law of the pointer web belongs first to the C ontology carried by `epi-lib`.

The previous graph-side pointer spec correctly identified the importance of the 36-fold complement, but its category language still mixed several operations that must now be separated:

- X/X' inversion is the cross-helix spanda relation at the same QL position.
- X+Y=5 mirror is the within-helix square relation between complementary QL positions.
- The Square-B mirror is the tritone specifically; tritone is not the generic name for inversion.
- The 5 -> 0 return is a Mobius/enriched-return relation, not a normal same-position pointer.

This seed is the authority for the next S0 implementation pass.

## VAK Gate

- CPF: `(4.0/1-4.4/5)` - autonomous reflective lattice, because this seed defines the dispatchable relation field.
- CT: `CT1` - specification / law.
- CP: `4.1 Definition` moving toward `4.2 Operation`.
- CF: `(0/1)` with `(4.0/1-4.4/5)` as the governing context-frame, because the pointer web is the form-giving law of recursive context.
- CFP: S0/S0' ground with C/epi-lib authority.
- CS: `CS0` full traverse, because every higher coordinate layer consumes this relation field.

## A. Intent

The pointer web is the holographic relational substrate of the coordinate system. A coordinate is not complete because it stores content; it is complete when its place in the family, positional, lens, inversion, mirror, and context-frame fields can be computed without ambiguity.

The pointer web is not the absolute bottom of the system. It is derived from the raw psychoid bedrock:

```text
Bedrock7 = # + (#0, #1, #2, #3, #4, #5)
Web36    = Bedrock6 manifested through family, position, and lens rings
CF7      = Bedrock6 contextualized through #4 as diatonic/lemniscatic grammar
```

`#` is the inversion act itself. It is not a seventh QL position and not a fourth pointer-web ring. The six psychoid numbers are the archetypal organizing principles from which family coordinates receive their bedrock identity.

S0's job is to make this real in C:

- compact enough to stay in the hot coordinate representation;
- explicit enough to prevent graph, UI, and agent layers from inventing private semantics;
- testable as real pointer and relation behavior, not just string generation;
- harmonically typed so the kernel tick can become musical, cymatic, graphable, and inspectable through one shared law.

## B. Current C Ground

The current `Holographic_Coordinate` is intentionally small:

```c
struct Holographic_Coordinate {
    uint8_t ql_position;
    uint8_t family;
    uint8_t inversion_state;
    uint8_t flags;
    float weave_state;
    float* semantic_embedding;

    Holographic_Coordinate* c;
    Holographic_Coordinate* p;
    Holographic_Coordinate* l;
    Holographic_Coordinate* s;
    Holographic_Coordinate* t;
    Holographic_Coordinate* m;

    Holographic_Coordinate* cpf;
    Holographic_Coordinate* ct;
    Holographic_Coordinate* cp;
    Holographic_Coordinate* cf;
    Holographic_Coordinate* cfp;
    Holographic_Coordinate* cs;

    Context_Execution_Operator invoke_process;
    union { ... } payload;
};
```

The 128-byte / two-cache-line shape is a feature. The next implementation should not inflate every coordinate with 36 raw inline pointers. The correct shape is:

```text
12 hot inline pointers in Holographic_Coordinate
+ derived HC_PointerWeb36 view
+ derived HC_ContextFrameWeb7 overlay
```

The hot coordinate remains the execution object. The 36-fold web is a typed, derived relation view computed from it and from canonical tables.

## C. Bedrock7: Raw Psychoid Foundation

Before the 36-fold web, S0 exposes the kernel foundation:

```text
HC_BedrockWeb7
  hash       = Psychoid_Hash / # / 0xFF
  psychoid[] = Psychoid_0 .. Psychoid_5
  successor[] = kernel torus/Mobius successor law
  inversion[] = same-position X -> X' potential opened by #
```

### Hash / Inversion Operator

`Psychoid_Hash` is the raw `#` / `0/1` operator:

```text
ql_position = 0xFF
family = FAMILY_NONE
c  -> Psychoid_0
cf -> Psychoid_4
invoke_process = Execute_Hash
```

It toggles `inversion_state` on mutable coordinates and marks the same-position cross-helix relation in derived views:

```text
Xq -> Xq'
pc -> pc + 1 mod 12
```

The raw `.rodata` psychoids are not mutated. Their inversion potential is represented as relation metadata because the bedrock is canonical BIMBA.

### Six Psychoid Numbers

The raw numbers are:

| Psychoid | Role | Kernel successor | Harmonic pc |
|---|---|---|---:|
| `#0` | Ground | `#1` | 0 |
| `#1` | Form | `#2` | 2 |
| `#2` | Operation | `#3` | 4 |
| `#3` | Pattern | `#4` | 6 |
| `#4` | Context / lemniscate | `#5` | 8 |
| `#5` | Integration / Mobius | `#0'` | 10 |

The first five successor edges are epogdoon ticks. The final successor is the Mobius return:

```text
#0 -> #1 -> #2 -> #3 -> #4 -> #5 -> #0'
```

This is the foundation that lets the 36 pointer web be self-containing without being self-originating: it contains the 5->0 return because it is generated from the Bedrock7 kernel law.

### Family Coordinates As Bedrock Manifestations

Every family coordinate remains a manifestation of a raw psychoid:

```text
BEDROCK(Cq/Pq/Lq/Sq/Tq/Mq) = Psychoid_q
```

Therefore no downstream surface should treat `M3`, `L3`, or `P3` as foundational by itself. Each is a family expression of `#3`.

## D. Canonical 36 Shape

The full harmonic pointer web is:

```text
36 = 12 coordinate-family ring
   + 12 QL-position ring
   + 12 MEF-lens ring
```

Each ring is a chromatic 12:

```text
12 = 6 bimba + 6 pratibimba
```

### Ring 1: Coordinate-Family Ring

The family ring gives the coordinate's relation to the six foundational coordinate families and their primed/implicate counterparts:

| Index | Bimba | Pratibimba |
|---:|---|---|
| 0 | C | C' |
| 1 | P | P' |
| 2 | L | L' |
| 3 | S | S' |
| 4 | T | T' |
| 5 | M | M' |

The existing inline fields `c,p,l,s,t,m` are the hot bimba family sextet. The primed sextet is generated by applying the inversion operator to the same family slot.

### Ring 2: QL-Position Ring

The position ring gives the six QL positions and their cross-helix counterparts:

| Index | Bimba | Pratibimba |
|---:|---|---|
| 0 | P0 | P0' |
| 1 | P1 | P1' |
| 2 | P2 | P2' |
| 3 | P3 | P3' |
| 4 | P4 | P4' |
| 5 | P5 | P5' |

This ring is where the kernel's sixfold positional law becomes computable pointer topology. Each position contains both converse and inverse potential:

- inverse potential: `PX -> PX'` through `#` / 0/1;
- mirror potential: `PX -> P(5-X)` through X+Y=5;
- return potential: `P5 -> P0'` as Mobius/enriched return.

### Ring 3: MEF-Lens Ring

The lens ring gives the full 12 MEF anchors:

| Index | Bimba lens | Pratibimba lens |
|---:|---|---|
| 0 | L0 | L0' |
| 1 | L1 | L1' |
| 2 | L2 | L2' |
| 3 | L3 | L3' |
| 4 | L4 | L4' |
| 5 | L5 | L5' |

The graph-side "day lens" and "night lens" categories should migrate to this cleaner 12-lens ring. The Mobius pairings remain real, but they are relation metadata over the ring, not the definition of priming itself.

## E. Seven Context Frames Are Overlay, Not Extra 36 Slots

The seven context frames are not a fourth 12-ring. They are the lemniscatic/diatonic context overlay opened through the #4 / `cf` gateway:

| CF | Notation | Function | Diatonic role |
|---:|---|---|---|
| CF0 | `(00/00)` | Nous / Para Vak | tonic ground |
| CF1 | `(0/1)` | Logos / Madhyama-as-nomos | first articulation |
| CF2 | `(0/1/2)` | Eros / Madhyama-as-chreia | triadic circulation |
| CF3 | `(0/1/2/3)` | Mythos / Pashyanti | tetradic closure |
| CF4 | `(4.0/1-4.4/5)` | Anima/Psyche / Oikonomia | perfect fifth / fractal executive |
| CF5 | `(4.5/0)` | Psyche bridge / partial Aletheia | bridge stewardship |
| CF6 | `(5/0)` | Sophia / Spanda-Shakti | leading-tone return |

The 36-fold web is chromatic/helical. The sevenfold CF overlay is diatonic/modal. The two must be related but not collapsed.

Computationally:

```text
HC_PointerWeb36     = chromatic relation substrate
HC_ContextFrameWeb7 = diatonic/contextual interpretation overlay
```

### Identity Claim: The Diatonic IS The CF-Grammar Made Audible

The CF overlay is not an analogy to the diatonic; **the seven CFs at their positions ARE the matheme's relational grammar made audible**. Each unique diatonic note is one CF configuration enacted at the harmonic register:

- C = `(00/00)` (inner-0, tonic ground / Nous-Parā)
- D = `(0/1)` (inner-1, first articulation / Logos-nomos)
- E = `(0/1/2)` (inner-2, triadic circulation / Eros-chreia)
- F = `(0/1/2/3)` (inner-3, tetradic closure / Mythos-Paśyantī)
- G = `(4.0/1-4.4/5)` (outer-#4 parent, perfect fifth / Anima-oikonomia executive)
- A = `(4.5/0)` (lemniscate-stage, bridge stewardship / Psyche partial-Aletheia)
- B = `(5/0)` (inner-5, leading-tone / Sophia-Spanda)
- C' = `(00/00)` enriched (next-register tonic, the §5→§0' return)

The perfect-fifth's harmonic primacy (3/2, generator of the chromatic cycle, most consonant interval after the octave) IS Anima's executive seat — the dispatch-function rendered audible. The leading-tone's directional pull IS Sophia's Spanda-pulse — surge-and-return-as-one-pulsation as melodic resolution. The seven modal rotations are the seven CF-anchorings of the same scale; each mode's character is the agent-archetype-and-Vāk-level at the tonic position.

**This makes the harmonic profile a dispatchable contract, not a decorative overlay.** Downstream consumers (Tauri M' surface, S2 graph pointer certification, S3 deposition anchors, Aletheia rehear-phase, Epii autoresearch recompose) all read the same vocabulary because the canonical positional law lives in [[05-ql-7fold-law-and-vak-c-substrate]] and the CF→diatonic mapping lives here.

See [[07-c-prime-vak-grammar-layer]] §Diatonic-Interpretation for the per-degree role table and modal-rotation law. See [[2026-05-19-kernel-mprime-harmonic-clock-integration-plan]] for the `MathemeHarmonicProfile` runtime contract that carries this through M1 tick math, M2 72-fold vibration, M3 64-fold transcription, S2 pointer certification, S3 deposition, and M' techne rendering. See [[2026-05-19-vak-musical-execution-z-thread]] for the Z-thread closed loop (compose → perform → rehear → recompose) where this vocabulary becomes a musical performance trace.

## F. Required Operators

S0 must make these operations explicit in C. Macro names below are illustrative; the behavior is normative.

### Inversion / Spanda

```text
hc_invert(Xq) = Xq'
```

This is the `#` / 0/1 operator. It preserves QL position and crosses helix:

```text
q  -> q'
pc -> pc + 1 mod 12
```

This relation is a minor-second / semitone spanda pulse.

### Epogdoon Tick

```text
hc_tick(Xq) = X(q+1 mod 6)
```

Within a helix, the tick advances by one whole tone:

```text
pc(q) = 2q mod 12
pc(q+1) = pc(q) + 2 mod 12
```

The ratio role is `9/8`.

### X+Y=5 Mirror

```text
hc_mirror(Xq) = X(5-q)
```

This preserves helix and applies the square mirror. The three unique spans are:

| Pair | Semitones | Whole tones | Role |
|---|---:|---:|---|
| 2 <-> 3 | 2 | 1 | epogdoon mirror |
| 1 <-> 4 | 6 | 3 | tritone / Square-B mirror |
| 0 <-> 5 | 10 | 5 | 16/9 totality mirror, missing +1 epogdoon |

The tritone is only the `1 <-> 4` mirror.

### Mobius Return

```text
hc_return(P5) = P0'
```

The 5 -> 0 relation is not an ordinary reset. It is enriched return: the completed synthesis re-enters ground through inversion.

## G. Harmonic Coordinate Formulas

Using 12-TET for operational closure:

```text
bimba_pc(q)      = (2 * q) mod 12
pratibimba_pc(q) = (2 * q + 1) mod 12
```

For any lens anchor `a`:

```text
lens_bimba_pc(a, q)      = (a + 2q) mod 12
lens_pratibimba_pc(a, q) = (a + 2q + 1) mod 12
```

Pure ratio roles:

| Ratio | Pointer role |
|---|---|
| `1/1` | same-position identity / anchor |
| `9/8` | epogdoon tick / whole-tone step |
| `4/3` | fourth / lower tetrachord closure |
| `3/2` | fifth / fractal-executive bridge |
| `16/9` | Square-A totality mirror |
| `2/1` | octave closure, reached by the missing epogdoon |

The closure law remains:

```text
(16 / 9) * (9 / 8) = 2 / 1
```

### Kernel-Side Audio-Genesis: the 8+4 Bus

The shared `MathemeHarmonicProfile` carries the matheme's audio-genesis as two kernel-computed arrays. These are computed once per tick at the kernel layer and consumed by every M' surface; M' renderers do not re-derive them.

```text
profile.audio_octet[8]   -- eight explicate-sung frequencies (Hz)
profile.nodal_quartet[4] -- four implicate-nodal Chladni boundary parameters (m, n)
```

Per the [[ql-musical-derivation]] §6.5 8+4 partition:

| Profile slot | QL position | Helix | Role |
|--------------|-------------|-------|------|
| `audio_octet[0]` | #1  | bimba | inner-tetrachord first epogdoon |
| `audio_octet[1]` | #2  | bimba | inner-tetrachord major third |
| `audio_octet[2]` | #3  | bimba | inner-tetrachord tritone-pivot |
| `audio_octet[3]` | #4  | bimba | inner-tetrachord context closure |
| `audio_octet[4]` | #1' | pratibimba | conjugate inner-tetrachord first epogdoon |
| `audio_octet[5]` | #2' | pratibimba | conjugate inner-tetrachord major third |
| `audio_octet[6]` | #3' | pratibimba | conjugate inner-tetrachord tritone-pivot |
| `audio_octet[7]` | #4' | pratibimba | conjugate inner-tetrachord context closure |
| `nodal_quartet[0]` | #0  | bimba | bimba ground (m, n) Chladni boundary |
| `nodal_quartet[1]` | #5  | bimba | bimba synthesis (m, n) Chladni boundary |
| `nodal_quartet[2]` | #0' | pratibimba | pratibimba ground (m, n) Chladni boundary |
| `nodal_quartet[3]` | #5' | pratibimba | pratibimba synthesis (m, n) Chladni boundary |

The audio-genesis math lives here, in S0 / `portal-core`. The M' surfaces — M1' walk-as-melody, M2' cymatic standing-wave rendering, M3' codon-pulse and clock display — all read these arrays from the shared profile. None of them computes the bus locally. This is the **single audio-genesis authority** for the entire Epi-Logos stack.

The companion long-form specs at `Idea/Bimba/Seeds/M/M1'/m1-prime-paramasiva-instrument.md` and `Idea/Bimba/Seeds/M/M2'/m2-prime-parashakti-cymatic-engine.md` were drafted with the framing that M1' owned the bus; the corrected M1'-SPEC and M2'-SPEC re-locate ownership to this layer. Implementation must match this corrected framing: `profile_audio_octet()` and `profile_nodal_quartet()` are kernel APIs over `MathemeHarmonicProfile`.

### The (0/1) Inversion Act and the Tauri Shell Split

The raw `#` inversion act defined above (§C, `Psychoid_Hash`) is the same single `(0/1)` that the Tauri app surfaces at its primary user split. Per `M'-SYSTEM-SPEC` Shell vs Subsystem Architecture:

- **Shell 0 (Cosmic)** = the 0-face of the matheme at the user surface — structural-Prakāśa preview
- **Shell 1 (Personal)** = the 1-face of the matheme at the user surface — lived-Vimarśa preview
- **Subsystem pages M0..M5** = the 4+2 explicate development of (0/1) as deep workspaces

Toggling between Shell 0 and Shell 1 invokes the same `Inversion_Operator` that lives at every `Holographic_Coordinate.invert` field — the user-facing 0/1 split is the matheme's raw `#` operating at the UI scale. Opening a subsystem page from a shell is the `.` nesting operator (the lemniscate at #4) firing.

This means the S0 pointer-web is not abstract substrate underneath an unrelated UI layer; the UI's primary architecture IS the pointer-web's inversion-act made user-engageable. The C code's `invert` function-pointer and the Tauri app's shell-toggle are the same operation at different scales of the same matheme.

## G. C Contract Shape

The next C implementation should introduce small typed descriptors rather than widening `Holographic_Coordinate`.

Illustrative shape:

```c
typedef enum {
    HC_POINTER_RING_FAMILY = 0,
    HC_POINTER_RING_POSITION = 1,
    HC_POINTER_RING_LENS = 2
} HC_PointerRing;

typedef enum {
    HC_HELIX_BIMBA = 0,
    HC_HELIX_PRATIBIMBA = 1,
    HC_HELIX_CROSS = 2
} HC_Helix;

typedef enum {
    HC_REL_IDENTITY = 0,
    HC_REL_INVERSION_SPANDA = 1,
    HC_REL_EPOGDOON_TICK = 2,
    HC_REL_MIRROR_XY5 = 3,
    HC_REL_MOBIUS_RETURN = 4,
    HC_REL_CONTEXT_FRAME = 5,
    HC_REL_LENS_ANCHOR = 6
} HC_RelationRole;

typedef enum {
    HC_INTERVAL_NONE = 0,
    HC_INTERVAL_SEMITONE = 1,
    HC_INTERVAL_WHOLE_TONE = 2,
    HC_INTERVAL_TRITONE = 6,
    HC_INTERVAL_TOTALITY_16_9 = 10,
    HC_INTERVAL_OCTAVE = 12
} HC_IntervalRole;

typedef struct {
    Holographic_Coordinate* target;
    uint8_t ring;
    uint8_t index;          /* 0..11 within ring */
    uint8_t ql_position;    /* 0..5 */
    uint8_t helix;          /* HC_Helix */
    uint8_t relation_role;  /* HC_RelationRole */
    uint8_t interval_role;  /* HC_IntervalRole */
    uint8_t ratio_role;     /* compact enum, not float */
} HC_PointerRef;

typedef struct {
    HC_PointerRef family[12];
    HC_PointerRef position[12];
    HC_PointerRef lens[12];
} HC_PointerWeb36;
```

The context overlay should be a separate sevenfold table:

```c
typedef struct {
    uint8_t cf_index;        /* 0..6 */
    const char* notation;    /* stable rodata string */
    uint8_t diatonic_degree; /* 1..7 */
    uint8_t mode_anchor;     /* 0..6 */
    uint8_t ql_position;
    uint8_t helix;
    uint8_t relation_role;
} HC_ContextFrameRef;

typedef struct {
    HC_ContextFrameRef frame[7];
} HC_ContextFrameWeb7;
```

These structs can be stack-returned, arena-backed, or filled into caller-provided memory. The important law is that the hot coordinate remains compact while the complete relation field is available as a typed C contract.

## H. Build Path

### Phase 1: Spec-Locked C Authority

- Add C enums for pointer rings, helices, relation roles, interval roles, and ratio roles.
- Add a derived `HC_PointerWeb36` fill function.
- Add a derived `HC_ContextFrameWeb7` fill function.
- Preserve `sizeof(Holographic_Coordinate) == 128`.

### Phase 2: Real Tests

Tests must allocate real coordinates through the existing arena/family setup and prove:

- the coordinate struct remains exactly 128 bytes;
- each coordinate can derive 36 pointer refs as 3 rings x 12;
- every 12 ring decomposes as 6 bimba + 6 pratibimba;
- `hc_invert(q)` preserves `q` and flips helix;
- `hc_mirror(q)` maps to `5-q` and produces spans 1/3/5 whole tones;
- `hc_return(5)` reaches `0'` as Mobius return;
- CF7 is reachable through the context overlay and does not mutate the 36 count;
- the 12 MEF lenses are first-class anchors, not six day lenses plus an ambiguous "inversion refs" bucket.

Mock-only tests are invalid here. The tests must use actual C structs, actual tagged pointer rules, and actual arena-allocated/family-linked coordinates.

### Phase 3: Rust / TS Surface

After C passes, Rust/TS mirrors may consume the C authority:

- Rust FFI should expose a stable pointer-web snapshot, not rederive private semantics.
- TypeScript schemas should validate the snapshot shape.
- M' and portal services should read harmonic metadata from the shared profile.

### Phase 4: S2 Graph Projection

S2 should project this S0 authority into graph relationships:

- `POINTER_FAMILY`
- `POINTER_POSITION`
- `POINTER_LENS`
- `POINTER_CONTEXT_FRAME`
- `INVERTS_TO`
- `MIRRORS_XY5`
- `RETURNS_MOBIUS`
- `TICKS_EPOGDOON`

The graph may store coordinate strings, but the relation descriptors must preserve the S0 operation roles.

## I. Migration Note For Existing Graph Pointer Spec

The older 36 category layout:

```text
family refs + reflective refs + inversion refs + position refs + lens refs + lens inversion refs
```

is useful as an S2 storage-era snapshot, but it is not the final S0 law. The S0 law is:

```text
family ring 12 + position ring 12 + lens ring 12
+ CF7 overlay
```

The old `inversion_refs = 5-Q prime` rule should be renamed or split:

- `X -> X'` is inversion/spanda;
- `X -> 5-X` is mirror;
- `X -> (5-X)'` is a composite mirror-prime relation, not primitive inversion.

This distinction is required for the musical and kernel contracts to stay true.

## J. Boundaries

S0 owns the C relation law. It does not own:

- Neo4j storage policy, except as a consumer contract for S2;
- UI rendering details, except as a consumer contract for M';
- agent dispatch policy, except through the VAK/CF metadata it exposes;
- audio synthesis, except through harmonic relation metadata.

The test of success is simple: given any coordinate, the kernel can compute its 36-fold harmonic relation web and 7-fold context overlay without asking the graph, UI, or agent layers what those relations mean.
