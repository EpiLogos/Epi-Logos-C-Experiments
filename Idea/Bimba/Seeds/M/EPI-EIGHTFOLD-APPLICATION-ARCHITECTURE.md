---
title: "Epi Eightfold Application Architecture — 3:3 Parent Products, 4+2 Deep Instruments, and Native O:I Composition"
status: "canonical-application-architecture"
created: 2026-08-19
coordinate: "M / M′ application field"
authority_relation: >-
  Canonical application/product-scale architecture for the Epi M′ experience.
  It consumes EPI-EIGHTFOLD-EXPERIENTIAL-VISION.md and the existing M′ source
  corpus. It is authoritative for the distinction between parent 3:3 products,
  deep M′ products, parent/deep transitions, and O:I hosting. Per-M′ specs remain
  authoritative for each domain's semantics and internal 4+2 dynamics. The
  integrated 1/2/3 and 4/5/0 architecture files remain authoritative source
  evidence for their semantic compositions, except where an older renderer sketch
  conflates parent-scale composition with deep-instrument rendering; this document
  owns that product-scale separation.
depends_on:
  - "EPI-EIGHTFOLD-EXPERIENTIAL-VISION.md"
  - "M'-SYSTEM-SPEC.md"
  - "INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md"
  - "INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md"
  - "M0'/M0-ARCHITECTURE.md"
  - "M1'/M1-ARCHITECTURE.md"
  - "M2'/M2-ARCHITECTURE.md"
  - "M3'/M3-ARCHITECTURE.md"
  - "M4'/M4-ARCHITECTURE.md"
  - "M5'/M5-ARCHITECTURE.md"
external_host:
  - "EpiLogos/O-I docs/OI-DESKTOP-APPLICATION-SPEC.md"
  - "EpiLogos/O-I docs/OI-DESKTOP-AGENT-NATIVE-PROTOCOL.md"
---

# Epi Eightfold Application Architecture

## 0. Architectural claim

Epi has **eight product-scale experiential surfaces** built from six semantic M′ domains:

```text
PARENT 3:3 PRODUCTS

  epi.cosmic.123      M1 + M2 + M3
  epi.personal.450    M4 + M5 + M0

DEEP 4+2 PRODUCTS

  epi.deep.m0         M0′ Anuttara
  epi.deep.m1         M1′ Paramaśiva
  epi.deep.m2         M2′ Paraśakti
  epi.deep.m3         M3′ Mahāmāyā
  epi.deep.m4         M4′ Nara
  epi.deep.m5         M5′ Epii
```

This is an application/product ontology, not a new M-coordinate ontology.

The parent products are **compositions among M domains**. The deep products are **recursive compositions within one M′ domain**.

The distinction is load-bearing because it prevents two opposite degradations:

1. flattening the parent products into shallow dashboard cards because the deep instruments seem too complex to host; and
2. forcing the complete internal 4+2 dynamics of every M′ domain into the everyday parent product until the basic lived experience becomes unusable.

---

## 1. Product identities and stable semantic state

### 1.1 Current event / subject state

The eight product surfaces may project one shared current relation. That relation is not presentation state.

The current architecture uses the following conceptual split:

```text
EPI SEMANTIC STATE
    eventRef / protected subject ref
    M/M′ coordinate + relation lineage
    DAY/NOW / source / provider revisions
    operative current state
    readiness / provenance / privacy

WORKBENCH STATE
    SessionSpaceRef
    AgentSessionRef
    selected subject / effective Context
    available native Surfaces / Actions

PRESENTATION STATE
    active 0/1 face
    open deep instrument
    tab / split / focus
    camera / zoom / internal renderer mode
```

Opening depth, changing tabs, moving a Surface or toggling Cosmic↔Personal must not mint a new semantic event merely because presentation changed.

### 1.2 Surface identity

A native Epi SurfaceRef SHOULD be able to express at least:

```text
surfaceRef
productId               # one of the eight product surfaces
subjectRef | eventRef
owner                    # Epi semantic owner; host/provider may differ
coordinateRoot           # where applicable
bodyKind / bodyRequirements
readings
canonical Actions
selection model
privacy / disclosure
readiness / degradation
provenance
alternate native projections
```

The domain descriptor MUST NOT encode desktop tab/split coordinates as semantic identity.

---

## 2. Parent product A — `epi.cosmic.123`

### 2.1 Product purpose

The Cosmic parent is the **current situated cosmic world**: M1 current act, M2 current world-condition and M3 current inscription composed into one current event.

It is not a mini-version of all three deep instruments and not three cards.

### 2.2 Required semantic contributions

```text
M1
  current act / QL position / tick / inversion
  accepted K² / SU(2) / Hopf orientation
  source and coordinate lineage

M2
  live-world observation/provenance where available
  current solar / planetary / decan / correspondence state
  current 72-address / harmonic field
  source and coordinate lineage

M3
  same-event 72→64 reception
  codon / hexagram / tarot / line / rotation / transcription state as ready
  360°/720° clock / current inscription
  source and coordinate lineage
```

### 2.3 Parent-scale visual law

The parent must expose the **actual current relation** in a compressed but complete form.

Current source-grounded direction:

- M1 contributes a compact current topological/oscillatory centre rather than the entire played-torus laboratory;
- M2 contributes the live solar/harmonic/correspondential world rather than forcing the dense cymatic laboratory into the parent surface;
- M3 contributes the clocked symbolic body/state-signature rather than requiring the full transcription workbench to be open.

The precise spatial rendering remains revisable, but any implementation MUST preserve:

- one event and one temporal current;
- geometric/causal composition rather than horizontal juxtaposition;
- native inspectability of every displayed relation;
- deep-open refs into M1′/M2′/M3′;
- truthful degradation when a rich provider/body is unavailable.

### 2.4 Candidate parent-scale spatial synthesis

The current authored design direction is:

```text
M3 clock / inscription field
    spans the current celestial relation

M2 solar / correspondence field
    live planetary objects + current relation edges

Earth / observer-centre
    anchors the situated event

M1 K² / Hopf / QL current act
    compact oscillatory/topological centre at Earth
```

A deterministic M3 glyph/sigil may provide a compact projection of the same current clock/inscription state when useful. This is a design direction, not permission for renderer-local symbolic invention: identical current M3 state must resolve to identical glyph state under the same versioned projection law.

---

## 3. Parent product B — `epi.personal.450`

### 3.1 Product purpose

The Personal parent is the **everyday lived Epi environment** around one governed Personal subject/current event.

Its product vocabulary is activity-first rather than subsystem-first:

```text
journal / write / note
DAY / NOW dashboard or canvas
kanban / flow / activity organization
selection and reflection
canonical Epii dialogue
oracle / reading
review / Explain / History / provenance
Bimba/source/canon reveal
proposal / recognised return
```

Each activity may open a purpose-built native UI while remaining part of the same Personal product.

### 3.2 M4 / M5 / M0 application relation

```text
M4 Nara
    lived subject, writing, episode, day, activity, oracle/body/current-state relation

M5 Epii
    canonical situated Agent, pedagogy, review, explanation, canon/source traversal,
    proposal/recognition return

M0 Anuttara/Bimba
    source / coordinate / relation / world-ground orientation
```

The product does NOT require M4, M5 and M0 to remain visible as three permanent regions in one renderer.

Their unity is co-reference and action continuity.

### 3.3 Native activity Surfaces

Representative native Personal Surfaces may include:

```text
Nara Day Canvas
Nara Journal / Writing Surface
Nara Flow / Kanban Surface
Nara Oracle Surface
Nara Reading / Reflection Surface
Epii canonical AgentSession conversation
Epii summoned pedagogy / Logos reading
Bimba/source/coordinate reading
Personal Explain / History / provenance
proposal/return Action result
```

The O:I host decides current region placement from native Surface/Application contracts. Epi owns the meaning and domain-specific body.

### 3.4 Deep M4 is not the Personal parent

The complete psychoid/quaternionic/chakra field belongs to `epi.deep.m4`.

The parent may show compact, truthful readings from it — current resonance, body/chakra indicators, elemental/field effects, trajectory/status, deep-open affordance — but does not need to keep the entire psychoid solver/renderer active during ordinary writing or dialogue.

This permits the parent to remain calm and useful while deep M4 becomes more ambitious.

---

## 4. The six deep products

### 4.1 `epi.deep.m0` — Anuttara / Bimba world instrument

Owns the complete M0′ six-layer reading of the Bimba world:

- language/syntax;
- QL structure;
- structural + correspondential relations;
- community/time/episodic overlays;
- protected Personal traversal handles;
- pedagogical/cartographic return.

The deep product may use full graph/world/spatial renderings and native source/provenance inspectors.

Parent projection: orienting Bimba/source ground, current anchor/path/constellation/city relation, deep-open.

### 4.2 `epi.deep.m1` — Paramaśiva played QL instrument

Owns the complete played K² / Ananda / QL music-theoretic field:

- canonical source/proof;
- active walk/session instance;
- Ananda matrix families;
- Spanda/tick/inversion;
- QL positions/lenses;
- K²/Hopf/SU(2) topology and 720° identity return;
- audio/generative interfaces where ready.

Parent projection: compact current act/topological pulse with exact state/deep-open refs.

### 4.3 `epi.deep.m2` — Paraśakti harmonic/cymatic instrument

Owns the complete 72-space and frequency/meaning laboratory:

- six 72 addressing axes;
- Vimarśā audio genesis;
- elemental medium parameters;
- decanic field;
- Shem/maqam/mantra/Asma sonic/correspondential arena;
- live solar-chakral runtime;
- dense standing-wave / cymatic / particle render where available;
- L↔L′ meaning-flip;
- 72→64 DET evidence.

Parent projection: current live harmonic/celestial/correspondential relation and deep-open.

### 4.4 `epi.deep.m3` — Mahāmāyā symbolic-genetic clock instrument

Owns the full clock/transcription field:

- 360°/720° geometry;
- 64 codon/hexagram substrate;
- 384 line-change space;
- 472 rotational surface;
- Tarot / I-Ching / codon cross-projection;
- OracleFrame / transcription chain;
- symbolic protein/sequence views where ready;
- source-backed angular relation graph;
- coupling/measurement inspector where its rigor state permits.

Parent projection: current clock/inscription/state glyph and deep-open.

### 4.5 `epi.deep.m4` — Nara psychoid/lived-field instrument

Owns the full protected M4′ organism:

- identity-system evidence and provenance;
- q_identity / q_personal baseline;
- q_transit / somatic / current-world condition;
- q_activity / transformation/pattern integration;
- Q_composed and #4.4.4.4 living Personal Pratibimba;
- body/chakra/sushumna/elemental field;
- Hopf-linked tori / psychoid-cymatic dynamics;
- journal/dream/episode trajectory;
- oracle and Mahāmāyā packet integration;
- review/proposal lifecycle and Epii relay.

Parent projection: ordinary Personal activity Surfaces plus compact current-state/deep-open readings as useful.

### 4.6 `epi.deep.m5` — Epii pedagogical/agentic self-articulation instrument

Owns the complete Epii sixfold:

- Gnostic/library ground;
- Canon Studio;
- Backend/developer studio relations;
- frontend/Epi application self-inspection where semantically appropriate;
- Pi/Anima/Epii agentic/runtime evidence views through current native agency contracts;
- Logos Atelier / scent-following / governed return.

The modern O:I architecture owns generic workbench/AgentSession mechanics; deep M5 must therefore consume rather than reconstruct those primitives.

Parent projection: canonical Epii Agent encounter, situated source/canon reveal, pedagogy/review/recognition and deep-open.

---

## 5. The `.0/.5` boundary-expression contract

The repeated 4+2 architecture is interpreted product-wise as:

```text
           parent contribution
                ▲       ▲
                │       │
              M#.0     M#.5
             ground    return
                \       /
                 \     /
              M#.1-.4
          differentiated field
                 │
                 ▼
             deep M#′
```

### 5.1 `.0` obligation

The parent contribution MUST retain or be able to resolve the domain's current authoritative ground: source, invariant, identity, reception state, canonical ref or equivalent domain-specific basis.

### 5.2 `.5` obligation

The parent contribution MUST retain or be able to resolve the domain's current totalised/return expression: renderer seam, integration, topology, current-world runtime, pedagogical return or equivalent domain-specific closure.

### 5.3 `.1-.4` availability

Inner dynamics MAY appear in parent activity Surfaces when the task actually crosses them. They MUST NOT be flattened into generic dashboard fields merely because they exist.

The deep product is where the whole differentiated field can be composed intentionally.

### 5.4 Domain-specific verification

Every M′ implementation MUST document:

```text
what .0 grounds in the current product
what .5 returns/exposes in the current product
which .1-.4 capabilities are parent-summonable
which .1-.4 capabilities are deep-only in this release
how parent→deep preserves event/subject identity
```

This makes the boundary-expression law executable instead of decorative.

---

## 6. O:I desktop composition contract

### 6.1 Host law

O:I is the privileged local application/composition host. It does not acquire M semantics.

Epi publishes:

- resources;
- Readings;
- Actions;
- SurfaceRefs;
- body/provider requirements;
- semantic selection/ref models;
- privacy/disclosure law;
- readiness/provenance.

O:I/AIKit/current providers resolve:

- Canvas mount;
- tab/split/focus;
- AgentSession sidecar;
- generic Navigator/Knowledge;
- Search/Command;
- Inspector/History;
- terminal/lower material depth;
- effective native body/provider.

### 6.2 Eightfold desktop disposition

```text
epi.cosmic.123       CANVAS

epi.personal.450     CANVAS + native activity Surfaces
                      with Epii canonical SIDECAR and Bimba NAVIGATOR/KNOWLEDGE

epi.deep.m0          CANVAS | ALTERNATE-NATIVE
epi.deep.m1          CANVAS | ALTERNATE-NATIVE
epi.deep.m2          CANVAS | ALTERNATE-NATIVE
epi.deep.m3          CANVAS | ALTERNATE-NATIVE
epi.deep.m4          CANVAS | ALTERNATE-NATIVE, protected
epi.deep.m5          CANVAS | SIDECAR-linked | ALTERNATE-NATIVE
```

A disposition is not ownership. The same M0 ref may appear in Navigator, a parent Canvas and deep M0 without becoming three semantic objects.

### 6.3 Parent→deep application operation

The generic operation is conceptually:

```text
openDeep(
    eventRef | subjectRef,
    MCoordinateRef,
    requestedProductId = epi.deep.m#,
    optionalSelectionRef
)
```

The returned Surface opens in the current/new tab or split according to workbench presentation policy.

The semantic result MUST preserve co-reference to the origin event/subject.

---

## 7. Agent-native law

Human and Agent must be able to address the same eightfold products without screen scraping.

For representative current states, a canonical Epi Agent must be able to:

- resolve the current parent product subject/event;
- inspect the same M refs the human selected;
- invoke domain Actions;
- request an oracle/read/write/review operation under current policy;
- open/focus a deep M′ Surface through native application services;
- receive structured readiness/provenance/degradation;
- never infer private Nara disclosure merely from visible UI selection.

A rich renderer is one projection of the domain contract, not the API.

---

## 8. Prompt programme allocation

### 8.1 Prompt C — Personal parent product

C owns the first native `epi.personal.450` realization.

C SHOULD implement/consume:

- Nara journal/writing/day/flow activity Surfaces needed for the first lived vertical;
- canonical Epii AgentSession/dialogue relation;
- oracle/read/review where current C source already supports it;
- Bimba/source ground through native Knowledge/navigation;
- one stable protected subject across those activities;
- Personal proposal/return through current Central authority;
- deep-open descriptors for M0′/M4′/M5′ without pretending to have completed those deep products.

C MUST NOT make the full M4 psychoid instrument an acceptance blocker unless a bounded element is necessary to prove operative current state. Deep M4 belongs to E.

### 8.2 Prompt D — Current Situated Matheme + Cosmic parent product

D owns:

1. one Current Situated Matheme / eventRef binding the current M1/M2/M3 and operative Personal state;
2. the first native `epi.cosmic.123` parent realization;
3. same-event binding between Cosmic and the corrected C Personal parent;
4. stable deep-open contracts into M1′/M2′/M3′ and corrected C's M0′/M4′/M5′ refs.

D SHOULD render/host the parent-scale M1/M2/M3 expression and MUST NOT claim completion of the complete deep instruments.

### 8.3 Prompt E — six deep instruments

E is the dedicated **4+2 deep-instrument programme**.

It owns the six `epi.deep.m#` products as a coordinated family while preserving per-domain ownership and allowing staged implementation.

E must begin from the parent products and Current Situated Matheme rather than rebuilding them.

Its core acceptance law is:

> each deep instrument opens from the same current event/subject/coordinate relation, expands the native internal 4+2 field, uses the appropriate technical body, and returns to the parent without semantic drift.

E may stage the six instruments independently according to source/runtime readiness; “E complete” must therefore distinguish the common deep-instrument protocol from each domain's actual implemented depth.

---

## 9. C/D/E non-overlap table

| Concern | C | D | E |
|---|---:|---:|---:|
| Personal daily/write/dialogue/oracle product | **owns** | consumes/binds | consumes |
| canonical Epii AgentSession relation | **owns first binding** | consumes | deep M5 extends without forking |
| Current Situated Matheme eventRef | compatible input | **owns** | consumes |
| Cosmic parent | no | **owns** | consumes |
| complete deep M0′ | descriptor/ground only | descriptor/ground only | **owns** |
| complete deep M1′ | no | descriptor + parent contribution | **owns** |
| complete deep M2′ | no | descriptor + parent contribution | **owns** |
| complete deep M3′ | no | descriptor + parent contribution | **owns** |
| complete deep M4′ psychoid instrument | bounded readings only | operative state binding | **owns** |
| complete deep M5′ | canonical Agent/pedagogy relation only | consumes | **owns** |
| parent/deep identity protocol | proves Personal side | proves event + Cosmic | **exercises all six** |

---

## 10. Documentation ontology and precedence

The M root now has four distinct documentation roles:

```text
EPI-EIGHTFOLD-EXPERIENTIAL-VISION.md
    authored product meaning / why the distinction exists

EPI-EIGHTFOLD-APPLICATION-ARCHITECTURE.md
    product-scale architecture / eightfold / parent-deep law / host relation

INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md
INTEGRATED-4-5-0-RECOGNITION-ARCHITECTURE.md
    semantic composition source + Cycle-3 rendering/interaction evidence

M0′/ ... M5′/ specs + architecture + UX/research
    per-domain semantic and deep-instrument authority
```

When documents appear to disagree, first identify **which level of claim** they are making.

- per-M′ semantics are not overridden by application placement;
- parent-product architecture may revise an older composition renderer without rewriting the meaning of the contributing M domains;
- current code determines what is implemented, not what the product ultimately means;
- returned implementation evidence may require this architecture to be revised explicitly.

---

## 11. Acceptance invariants for the eightfold architecture

Any implementation claiming conformance must preserve all of the following:

1. exactly two parent 3:3 product identities and six deep M′ product identities; no invented M6/M7 semantics;
2. Personal 4/5/0 remains usable without the full deep M4′ renderer permanently mounted;
3. Cosmic 1/2/3 remains one composition, not three cards;
4. deep M′ surfaces preserve their own 4+2 internal architecture;
5. `.0/.5` boundary expression is explicitly documented per M′;
6. inner `.1-.4` dynamics remain summonable rather than flattened;
7. parent→deep preserves event/subject/coordinate/provenance identity;
8. presentation state never becomes semantic event identity;
9. Epi Agents and humans can address the same refs/Actions;
10. protected Nara bodies remain protected across all projections;
11. rich/native bodies may be heterogeneous and degrade truthfully;
12. O:I hosts/composes Epi without acquiring Epi semantic ownership;
13. Explore/shared-world projection remains explicit rather than implied by local addressability;
14. C, D and E remain separable execution programmes with the ownership boundaries in §9.
