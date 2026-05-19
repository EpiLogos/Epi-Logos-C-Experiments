---
coordinate: "M1'"
status: "active-domain-spec"
updated: "2026-05-19"
depends_on:
  - "[[M'-SYSTEM-SPEC]]"
  - "[[M'-TAURI-PORT-SPEC]]"
  - "[[M1-paramasiva-mathematical-dna]]"
  - "[[2026-05-19-kernel-mprime-harmonic-clock-integration-plan]]"
---

# [[M1']] Domain Spec

[[M1']] is relational movement: torus/path traversal, coordinate walking, and relation inspection. It renders [[Paramaśiva]]'s 12-state integer ring and 720-degree SU(2) double cover as lived movement through graph law.

## User-Facing Surface

- Torus/path workspace for walking from the selected M0' coordinate through S2 relation families.
- Relation inspector showing family, mirror, lens, inversion, VAK/CF, qvdata/source/spec/code/test, and harmonic relation descriptors.
- Traversal timeline showing the active tick, position6, helix face, degree720, and relation movement.
- Route preview: before moving, the user can see which relations are live and what the next coordinate would inherit from the active profile.

## Backend Contract Consumed

- [[S2]] pointer web is the relation law of record.
- [[S0]] kernel profile provides tick12, degree720, SU(2) layer, phase, position6, chromatic substrate, ratio role, and square mirror law.
- [[S3]] temporal projection provides session/DAY/NOW context for traversal records and optional deposition.
- M1' never uses animation frame count as clock authority.

## Required `MathemeHarmonicProfile` Fields

- `tick`: absolute tick handle, cycle, `tick12`, `degree720`, `degree360`, `su2Layer`, `phase`, `position6`.
- `harmonic`: chromatic pitch class, X/X' pair, X+Y=5 mirror, square span, ratio role, sounded/nodal role.
- `pointerAnchor`: current coordinate, relation descriptors, mirror refs, family refs, lens refs, inversion refs, CF/VAK refs.
- `diatonic`: context-frame projection for mode-aware movement labels.
- `depositionAnchor`: traversal record handles when movement is deposited.

## Privacy Boundary

M1' can expose route and relation metadata but not private traversal motives, raw bioquaternion state, private journal bodies, or protected Graphiti text. Traversal deposition must carry coordinate, tick address, relation law, and session handle without absorbing private content into canonical S2 graph topology.

## Visual / Audio Interaction Model

- Visual: torus/path line advances according to profile tick and pointer relation law; selected path segments are colored by relation category and helix phase.
- Audio: movement can be rendered as intervallic traversal where relation changes map to profile ratio roles; M1' uses backend profile pitch/ratio fields only.
- Interaction: user stepping or agent stepping requests the next coordinate through S2 and receives a new or updated profile; no local hidden clock is created.

## Readiness / Test Criteria

- Traversal tests use real graph service responses or contract fixtures generated from real responses, not mock-only logic.
- Tests prove all displayed tick, degree, helix, mirror, and relation labels come from the shared profile/S2 response.
- Tests prove route deposition carries DAY/NOW/session handles and does not include private journal or raw quaternion fields.
- Readiness is blocked until S2 returns typed harmonic pointer relation descriptors, not only string refs.
