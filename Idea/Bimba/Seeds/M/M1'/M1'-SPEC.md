---
coordinate: "M1'"
status: "active-domain-spec"
updated: "2026-05-22"
depends_on:
  - "[[M'-SYSTEM-SPEC]]"
  - "[[M'-TAURI-PORT-SPEC]]"
  - "[[M1-paramasiva-mathematical-dna]]"
  - "[[2026-05-19-kernel-mprime-harmonic-clock-integration-plan]]"
  - "[[S0-HARMONIC-POINTER-WEB36-SPEC]]"
  - "[[ql-musical-derivation]]"
companion_spec: "[[m1-prime-paramasiva-instrument]]"
---

# [[M1']] Domain Spec — Paramaśiva as Instrument

> **M ↔ M' distinction.** M1 is the engine — what [[Paramaśiva]] IS (the mathematical DNA, the 12×12 Ananda matrices, the SU(2) double-cover, the 720° tick mathematics). M1' is the instrument — how that engine becomes *playable*: the techne surface where the matheme can be walked, struck, heard, and seen as movement.

> **Authority boundary.** Audio-genesis math lives at `S0` / `portal-core` via `MathemeHarmonicProfile`. M1' is the **primary techne renderer** that turns the shared profile into graph-traversal-as-melody. It does not own the audio bus; it sounds it. The 8+4 `audio_octet[8]` and `nodal_quartet[4]` fields are kernel-side; M1' consumes them.

> **Companion long-form.** The deep architectural derivation lives at [`m1-prime-paramasiva-instrument.md`](m1-prime-paramasiva-instrument.md). This spec is the canonical M1' domain authority; the companion is the philosophical-mathematical derivation that grounds it. Where they disagree, this spec is authoritative.

## §0/1 — What [[M1']] Is

[[M1']] is **relational movement as the audible face of [[Paramaśiva]]**. It renders the kernel's 12-state integer ring and 720° SU(2) double-cover as lived movement through graph law: torus/path traversal, coordinate walking, relation inspection, the walked path made into melody.

The walk is the matheme. Selecting a coordinate and stepping to its neighbour through an S2 pointer-web relation is the same act as striking a tone on a scale — the relation is the interval, the position is the pitch, the traversal is the phrase. M1' is what makes that identity feel real to the user.

Three commitments hold this domain:

1. **M1' never invents pitch.** Every sounded frequency, every interval, every modal selection comes from the shared `MathemeHarmonicProfile`. M1' is the renderer that walks the matheme through the graph; the kernel is what computes the matheme.
2. **The (0/1) wired into every coordinate is the same (0/1).** Every walked-to coordinate carries an `invert: Inversion_Operator` field pointing at the single session-held `Psychoid_Hash` (per `S0-HARMONIC-POINTER-WEB36-SPEC`). When the user requests the relational inverse of any position, it is *this single # operator* acting locally at that position. Walking is therefore always the matheme's own inversion-act playing out at the user-experience scale.
3. **The 84-state playing landscape is the shared coordinate.** `(lens, mode)` = 12 MEF lens-anchorings × 7 context-frame modes = 84 distinct playing-states. M1' exposes this as the navigable surface for the walk: which lens is the active substrate, which mode is the active CF-progression, which (lens, mode) cell on the 84-grid is currently sounding.

## §1 — The Six M1-0' to M1-5' Strata (1:1 with M1 bimba)

Per the M1' inner-stratum table in `Idea/Bimba/Map/M1'.md`, each M1' sub-stratum is the techne-reflection of its M1 sub-coordinate:

| M1 (bimba) | M1' (techne) | What M1 is | What M1' does in this domain |
|------------|--------------|-----------|--------------|
| **M1-0** Bimba (Original) | **M1-0'** Canonical Source | .rodata matrix archetypes (`ANANDA_BIMBA`, Cl(4,2), Hopf LUTs) | Read-only API serving immutable harmonic data to the walker |
| **M1-1** Pratibimba (Offset) | **M1-1'** Instance Manager | The +1 offset matrix, reflection that creates dynamism | Mutable session-state: current walk, current (lens, mode), current coordinate |
| **M1-2** Ananda (12-Matrix Vortex) | **M1-2'** Harmonic Engine | Six core matrices + six DR reflections (kernel-resident) | Reads ratio cells from kernel profile and exposes them as walk-step intervals |
| **M1-3** Spanda (Rhythmic Pulsation) | **M1-3'** Spanda Core | Primordial pulse; equation-transformation of (0/1) | Phase accumulator at settable rate; binds (0/1) to every coordinate's invert |
| **M1-4** Quaternal Logic (Flowering) | **M1-4'** QL Flowering | The 16:9 cascade, the position-set | Position-walker + lens-as-scale-composer applied at the graph-traversal layer |
| **M1-5** Toroidal Recognition | **M1-5'** Topology Analyzer | The 720° double-cover, π₁(T²) = Z⊕Z, Hopf bundle | Played visual torus — quaternionic TDA finding the shape of the active walk |

M1' is the same six positions re-read as how-it-walks rather than what-it-is. The companion file gives the full per-stratum operational/computational mapping; this spec carries the domain-level identity, contract, and readiness law.

## §2 — User-Facing Surface

- **Torus/path workspace** for walking from the selected M0' coordinate through S2 relation families. The walk is the audible-and-visible expression of the matheme.
- **Relation inspector** showing family, mirror, lens, inversion, VAK/CF, qvdata/source/spec/code/test anchors, and harmonic relation descriptors per traversed edge.
- **Traversal timeline** showing the active tick, position6, helix face, degree720, and relation movement of the walk in progress.
- **Route preview** before stepping: which relations are live from the current coordinate, what (lens, mode) the next step would inherit, what interval the step would sound as.
- **(lens, mode) selector** — the 84-state playing surface exposed as the matheme-navigation panel. Changing lens transposes the chromatic substrate (which note is the matheme-tonic); changing mode rotates the CF-progression (which relational-grammar colours the walk).
- **Möbius-return indicator** at the moment of P5 → P0' rollover — the visible enharmonic-flip when the walk crosses the matheme's totalisation point.

## §3 — Backend Contract Consumed

- [[S2]] pointer web is the relation law of record. Every walk-step is an S2 relation traversal.
- [[S0]] kernel profile (`MathemeHarmonicProfile`) provides tick12, degree720, SU(2) layer, phase, position6, chromatic substrate, ratio role, square mirror law, 8+4 `audio_octet`/`nodal_quartet`, diatonic CF/VAK projection, and resonance72. **M1' uses `audio_octet` to sound the current coordinate; it never computes pitch locally.**
- [[S3]] temporal projection provides session/DAY/NOW context for traversal records and optional deposition.
- M1' never uses animation frame count as clock authority. The walk-tempo is settable but always references the kernel-tick rate, not wall-clock frames.

## §4 — Required `MathemeHarmonicProfile` Fields

- `tick`: absolute tick handle, cycle, `tick12`, `degree720`, `degree360`, `su2Layer`, `phase`, `position6`.
- `harmonic`: chromatic pitch class, X/X' pair, X+Y=5 mirror, square span, ratio role, sounded/nodal role, `audio_octet[8]`, `nodal_quartet[4]`.
- `pointerAnchor`: current coordinate, relation descriptors, mirror refs, family refs, lens refs, inversion refs, CF/VAK refs.
- `diatonic`: context-frame projection for mode-aware movement labels; lens-anchor identifier; mode-anchor CF.
- `depositionAnchor`: traversal record handles when movement is deposited.
- `lensMode`: explicit `(lens, mode)` pair identifying the active 84-state cell.

## §5 — Privacy Boundary

M1' can expose route and relation metadata but not private traversal motives, raw bioquaternion state, private journal bodies, or protected Graphiti text. Traversal deposition must carry coordinate, tick address, relation law, and session handle without absorbing private content into canonical S2 graph topology.

## §6 — Visual / Audio Interaction Model

- **Visual:** torus/path line advances according to profile tick and pointer relation law; selected path segments are coloured by relation category, helix phase, and current (lens, mode) anchoring; the played torus surface (M1-5' Topology Analyzer) renders the walk as motion on a genus-1 surface with Klein-bottle flip-visualisation at tritone-mirror crossings.
- **Audio:** movement is rendered as intervallic traversal where relation changes map to profile ratio roles; M1' uses backend `audio_octet` and `harmonic.ratio_role` only. The walked sequence becomes a melody whose intervals are exactly the relation-types of the traversed graph edges.
- **Interaction:** user stepping or agent stepping requests the next coordinate through S2 and receives an updated profile; no local hidden clock is created. Striking a node by direct selection (skipping the relation traversal) sounds the node's profile pitch without producing a walk-step.

### Klein-Flip Visibility on Tritone Crossing

When the walk crosses a Lens N ↔ Lens N+3 (tritone-mirror) boundary, M1' must visibly enact the **Klein-bottle enharmonic flip**: the same pitch is re-read with opposite emotional valence, the played torus appears to fold through itself, the relation inspector flips its lens-prime display from L to L' or back. This is not a transition animation; it is the structural acknowledgement that the matheme has crossed its meaning-translator surface. M1' is the *origin point* of the Klein flip in the M' stack; M2' consumes M1''s flip-signal to render the opposite surface valence on its cymatic substrate.

## §7 — The 84-State `(lens, mode)` Playing Landscape

M1' exposes the 84-cell navigable surface — the same coordinate that all M' surfaces share:

```text
12 MEF lenses (Lens 0..Lens 5 = bimba-anchored on WT-0;
              Lens 0'..Lens 5' = pratibimba-anchored on WT-1)
×
7 context-frame modes (CF1=Nous..CF7=Sophia per ql-musical-derivation §6.75)
=
84 distinct playing-states
```

Each cell is one matheme-perspective. Changing the lens IS the chromatic-substrate-anchoring (which of the 12 chromatic notes is the matheme-tonic); changing the mode IS the CF-progression-traversal-rule (which relational-grammar the walk enacts). The 84-state landscape is the shared coordinate that M2' (cymatic surface valence), M3' (codon-rotation projection), M0' (graph-walk substrate), and M4' (journal-context-binding) all address.

The bidirectional `(lens, mode) ↔ (codon, rotation)` map at the M1'-M3' boundary is the codon-rotation projection of every 84-state cell into one of the 472 (codon, rotation) positions on M3''s codon surface. See `M3'-SPEC` §7 for the canonical mapping spec.

## §8 — MEF as Scale-Composer, Not Cell-Annotator

The 12 MEF lenses do not annotate individual matrix cells. Each lens is a **position-anchored re-mapping of the entire 12-note matheme** (per `ql-musical-derivation` §6). For lens N:

- The lens-anchor note (per the 12-anchor table in the musical derivation) becomes the matheme's new #0
- The full 12-note arrangement regenerates from the anchor via epogdoon-stacking within each helix
- The bimba and pratibimba helices swap orientation for primed (Night) lenses N'

Applied to the **chromatic** substrate, a lens acts as **mode-selector** (which 7-of-12 are foregrounded as the diatonic projection). Applied to a **diatonic mode**, the lens acts as **key-selector** (where the tonic sits on the chromatic ring). Applied to a **note cluster** (chord), the lens acts as **cluster-composer** (which co-active cells sound at one tick).

M1' implements this by reading `profile.lensMode` and traversing the 84-state grid; the per-lens-substrate generation lives in the kernel as part of the shared profile computation.

## §9 — Readiness / Test Criteria

- Traversal tests use real graph service responses or contract fixtures generated from real responses, not mock-only logic.
- Tests prove all displayed tick, degree, helix, mirror, and relation labels come from the shared profile / S2 response — not from M1'-local computation.
- Tests prove route deposition carries DAY/NOW / session handles and does not include private journal or raw quaternion fields.
- Tests prove the `audio_octet` and `nodal_quartet` consumed by M1' audio match the kernel profile values exactly (no M1' re-synthesis).
- Tests prove the Klein-flip indicator fires precisely at Lens N ↔ Lens N+3 crossings and not at other lens transitions.
- Tests prove the 84-state `(lens, mode)` selector round-trips: every cell is reachable, no cell is duplicated, all 84 are distinguishable in the profile signature.
- Tests prove (0/1) wiring: when the user inverts the current coordinate, the invocation reaches the single session-held inversion-operator and produces the X/X' partner per `S0-HARMONIC-POINTER-WEB36-SPEC` §F.
- Readiness is blocked until S2 returns typed harmonic pointer relation descriptors, not only string refs.

## §10 — Implementation Notes

The companion file [`m1-prime-paramasiva-instrument.md`](m1-prime-paramasiva-instrument.md) gives the per-stratum operational detail, the C/Rust code anchors, the proposed `m1_prime_*` function signatures (which should be re-namespaced to `profile_*` where they compute audio-octet/nodal-quartet, since those are kernel-owned per §3 above), and the implementation order. Treat the companion as the architectural derivation; treat this canonical SPEC as the domain authority.

The harmonisation pass of 2026-05-22 corrected three framing issues from the long-form companion:

1. **Audio-genesis ownership**: M1' is a *renderer*, not the engine. The 8+4 bus lives in the kernel profile, consumed identically by M1', M2', M3'.
2. **(0/1) = raw # identity** is named at every coordinate the walk touches, not only at M1-3' Spanda Core. Every walked coordinate's `invert` field points at the same single session-held operator.
3. **84-state landscape** is the shared coordinate that all M' surfaces address, not an M1'-internal feature.

These corrections are now load-bearing law for M1' and propagate to the broader M' set via this spec's authority.
