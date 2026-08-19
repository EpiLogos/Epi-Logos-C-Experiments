# Prompt E — Six Deep M′ Product Readiness Receipt

**Status:** first E application-contract tranche; not a claim of full deep-instrument completion  
**Programme:** Epi #20 · QL-MEF #73 · O:I #115  
**Source/product authority:** Epi PR #19, head `ab018033252a3e8d5d3c06cc8c3ddcbcec17823a` at tranche cut  
**Contract implementation:** Epi PR #21 / `agent/epi-pratibimba-e-deep-contracts`

## 1. Returned parent state actually available

The requested corrected parent owners are still open at this cut:

```text
C — epi.personal.450
    Epi #18
    O:I #112

D — Current Situated Matheme + epi.cosmic.123
    QL-MEF #69
    Epi #17
    O:I #101
```

Therefore this tranche does **not** claim that the corrected C or D parent runtime has returned. It consumes the corrected parent law only as a caller-owned seam:

```text
parentProductId
+ existing eventRef and/or subjectRef
+ exact MCoordinateRef
+ existing provenance
```

Historical Prompt-C and Prompt-D implementations remain evidence, not substitutes for the current owners. In particular, old Personal and Cosmic provider/host branches prove useful identity/privacy/current-profile relations but their presentation assumptions are not revived here.

PRE-D source/parity ground already returned through QL-MEF and remains usable as coordinate/relation evidence. It does not make C or D application-ready by itself.

## 2. Common parent → deep → parent protocol

Canonical Epi Actions:

```text
epi.action.deep.open
epi.action.deep.focus
epi.action.deep.return
```

Deep open is resolved by `m-extension-runtime/src/common/deep-products.ts`.

Invariant:

```text
existing parent event/subject + MCoordinateRef
        ↓ epi.action.deep.open
source-derived deep product descriptor
        ↓
native body chosen from declared body/provider field
        ↓ host binds presentation-only surfaceRef
same semantic anchor
        ↓ epi.action.deep.return
exact parent anchor
```

The resolver rejects:

- missing parent event/subject;
- wrong parent product;
- wrong M′ coordinate;
- missing provenance;
- undeclared native body;
- deep M4 without protected-local authority.

It does not mint event, subject or provenance identity. `surfaceRef` is presentation identity supplied by the application host.

## 3. Agent-native parity

`deep-agent-native.ts` fixes one shared semantic/action field:

```text
human → native Surface
Agent → structured native Action
```

Both address the same parent anchor, same M′ product, same readiness and provenance, and same open/focus/return Actions. DOM scraping is not part of the contract.

Selection never confers disclosure. This is load-bearing for M4 and remains true for every domain.

## 4. Per-M boundary expression and current body

| Product | Parent | `.0` parent ground | `.5` parent return/exposure | `.1-.4` parent-summonable cut | Deep-only composition in this release | Native body/provider field | Status |
|---|---|---|---|---|---|---|---|
| `epi.deep.m0` Anuttara | `epi.personal.450` | M0-0′ Bimba language/source ground | M0-5′ pedagogy/cartography/Möbius return | QL structure; typed relations; current community/time reading; Personal bridge | full six-layer graph/cartography; governed mutation; GDS/community exploration | graph/declarative: `m0-anuttara`, S2 graph-services/schema | **PARTIAL** |
| `epi.deep.m1` Paramaśiva | `epi.cosmic.123` | M1-0′ immutable harmonic/QL canon | M1-5′ played topology, Hopf/SU(2), 4π recognition | current walk; selected Ananda/harmonic relation; Spanda tick; QL/lens flowering | full Ananda vortex field; K² played torus; quaternionic/Hopf/720° world | declarative + GPU/audio: `m1-paramasiva`, `m1-paramasiva-played-torus`, portal-core Hopf/harmonic providers | **PARTIAL** |
| `epi.deep.m2` Paraśakti | `epi.cosmic.123` | M2-0′ canonical 72 vibrational source | M2-5′ solar-chakral runtime + 72→64 DET gate | current resonance/audio readiness; element; decan; selected sacred-sonic correspondence | full 72-space/six-axis field; material cymatics; tuning-aware sacred-sonic performance lab | audio/cymatic/GPU: `m2-parashakti`, Vimarśā + M2 LUT providers | **PARTIAL** |
| `epi.deep.m3` Mahāmāyā | `epi.cosmic.123` | M3-0′ 72→64 reception/matter address | M3-5′ K²×T² world-clock / totalised inscription | current rotation; lens-mode projection; current clock; selected Tarot/I-Ching/transcription ref | full 472 field; 360/720 + 384 line-change graph; double-torus and measurement/coupling depth | clock/symbolic/GPU: `m3-mahamaya`, codon projection, clock LUT, Mahāmāyā providers | **PARTIAL** |
| `epi.deep.m4` Nara | `epi.personal.450` | M4-0′ stable protected identity/source evidence | M4-5′ Personal integration + Epii/Sophia review relay | safe somatic reading; oracle; flow/trajectory; protected journal/Graphiti handles | raw Q_identity/Q_transit/Q_activity/Q_composed; #4.4.4.4; sushumna/chakra/elemental/Hopf-linked psychoid-cymatic field; raw protected traversal | protected-local + GPU/declarative: `m4-nara`, `personal_identity`, `nara_journal`, Graphiti | **PARTIAL** |
| `epi.deep.m5` Epii | `epi.personal.450` | M5-0′ gnostic/canon/library ground | M5-5′ Logos/recognition/Möbius return | canon/philosophy; bounded backend explain; bounded Surface explain; canonical Epii dialogue/review | full backend and frontend studios; full agentic control/autoresearch workbench; full Logos Atelier | agentic/editor/graph: `m5-epii`, S5 gnostic/review/Epii providers; generic Agency/session machinery remains Actuation/AIKit-owned | **PARTIAL** |

`PARTIAL` means: real computational/domain bodies and contribution/test contracts exist, but the corrected eightfold parent→deep host relation is not yet operative/accepted. No row is upgraded merely because historical Theia composition or older Prompt-C/D host code exists.

## 5. Evidence by category

### Source evidence

Each descriptor records the eightfold authority pair plus its own M′ SPEC and architecture. The `.0/.5`, summonable and deep-only cuts are not cloned from a generic template; they are separate source-derived statements.

### Coordinate evidence

PRE-D has already returned a granular source-conformant M-coordinate/relation field. It proves source existence is distinct from implementation/provider/readiness. The deep descriptors consume exact M′ root and sub-coordinate spelling rather than inventing a new deep namespace.

### Relation evidence

The existing shared M-extension contribution contract already proves all six bodies share CoordinateContext, profile/readiness, privacy/provenance and explicit cross-extension routes. Prompt E adds the parent/deep relation above that body without reinterpreting route choreography as Bimba semantics.

### Operational evidence

Existing M packages and computational providers are real current source. Examples include:

- M0 graph/inspector package and S2 graph services/schema;
- M1 clock instrument, played-torus package, Hopf and harmonic providers;
- M2 Vimarśā reading and 72-space data;
- M3 codon-rotation/clock/Mahāmāyā substrate;
- M4 protected identity/journal/Graphiti providers;
- M5 gnostic/review/agent-oriented S5 providers.

Prompt-E tests are added in `extensions/test/deep-product-contract.test.mjs` and a focused workflow is added at `.github/workflows/epi-deep-products.yml`.

At the time of this receipt, no hosted workflow result has been observed for the new head. The tests are therefore **authored but not yet hosted-green evidence**. Do not upgrade this statement until an actual run or equivalent local receipt exists.

### Experiential evidence

No deep M′ product is marked `EXPERIENTIALLY_ACCEPTED` by this tranche.

Historical Nara/Personal/Cosmic surfaces supply useful experiential and integration evidence for bounded parent/depth relations. They do not constitute experiential acceptance of the complete deep M0′…M5′ instruments under the current eightfold architecture.

## 6. Parent identity tests

The new acceptance contract proves:

```text
parent eventRef / subjectRef
    == deep resolution eventRef / subjectRef
    == bound deep Surface semantic anchor
    == return eventRef / subjectRef
```

It also proves:

- subject-only parent input remains subject-only;
- provenance array is preserved, not regenerated;
- parent or coordinate drift is rejected;
- the native body must be declared by the requested M′ product;
- M4 fails closed for a public privacy class;
- Agent addressing retains the same anchor object and ActionRef field.

This is application-contract evidence only. Full cross-repository parent→O:I host→native body→parent acceptance remains pending the corrected C/D and O:I host line.

## 7. Surface Ledger cut

The current honest O:I disposition is:

| Product | Human Surface disposition | Agent disposition | Current ledger state |
|---|---|---|---|
| M0′ | NAVIGATOR / CANVAS / ALTERNATE-NATIVE graph | structured deep Action + refs | PARTIAL; host row pending O:I #115 integration |
| M1′ | CANVAS / ALTERNATE-NATIVE GPU/audio | structured deep Action + refs | PARTIAL; host row pending O:I #115 integration |
| M2′ | CANVAS / ALTERNATE-NATIVE audio/cymatic/GPU | structured deep Action + refs | PARTIAL; provider degradation explicit |
| M3′ | CANVAS / ALTERNATE-NATIVE clock/world renderer | structured deep Action + refs | PARTIAL; full renderer/provider convergence pending |
| M4′ | protected CANVAS / ALTERNATE-NATIVE local | protected structured Action + opaque handles only | PARTIAL; selection != disclosure |
| M5′ | SIDECAR + CANVAS / ALTERNATE-NATIVE editor | canonical Epi Agent/Agency + same deep Actions | PARTIAL; consumes Actuation/AIKit rather than duplicating session/runtime |

O:I #105 still owns the stable professional host frame. Prompt E must not implement missing generic tabs/splits/SessionSpace/AgentSession/Search/Navigator mechanics inside Epi.

## 8. Returned reality and architecture revision

No returned implementation fact in this tranche requires repudiating the Eightfold Vision or Application Architecture.

It does sharpen three implementation readings which should remain explicit:

1. the six historical M extension packages are substantial reusable native-body evidence, but the historical Theia shell is not the current generic host owner;
2. all six deep products are currently **PARTIAL**, not symmetrically complete; M3 has especially rich substrate, M0 still names a six-layer surface gap, M2 material audio/cymatic readiness remains degradable, and M4/M5 have governance/provider boundaries that are part of the product rather than polish;
3. corrected C/D parent runtime acceptance has not yet returned, so E can contract and deepen bodies independently but cannot truthfully claim complete parent→deep→parent operational or experiential acceptance yet.

If later C/D return a different parent identity or authority shape, that is a real architecture revision signal and this contract must be changed explicitly rather than adapting silently.
