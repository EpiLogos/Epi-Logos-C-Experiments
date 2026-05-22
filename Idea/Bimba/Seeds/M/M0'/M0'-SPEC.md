---
coordinate: "M0'"
status: "active-domain-spec"
updated: "2026-05-19"
depends_on:
  - "[[M'-SYSTEM-SPEC]]"
  - "[[M'-PORTAL-SPEC]]"
  - "[[M'-TAURI-PORT-SPEC]]"
  - "[[2026-05-18-bimba-pointer-web-and-integration-spec]]"
  - "[[2026-05-19-kernel-mprime-harmonic-clock-integration-plan]]"
---

# [[M0']] Domain Spec

[[M0']] is the playable [[Bimba]] graph field. It is the first structural surface of [[M']], where a coordinate becomes visible as graph node, harmonic address, source trace, relation field, and route into deeper M1'-M3' surfaces.

## User-Facing Surface

- Full-window graph/map explorer for canonical [[M]] / [[Bimba]] coordinates.
- Coordinate search and selection with legacy `#` coordinate compatibility.
- Node inspector showing label, coordinate, source/spec/code/test anchors, pointer-web summary, profile readiness, and available routes into [[M1']], [[M2']], [[M3']], [[M4']], and [[M5']].
- Playable graph affordance: selecting or traversing a node can sound or pulse the current profile, but it never computes its own clock.
- Structural status badges distinguish planned, implemented, tested, live, and review-pending nodes.

## Backend Contract Consumed

- [[S2]] graph services are the graph authority: canonical nodes, typed relations, pointer web, graph geometry, and source traceability.
- [[S0]] / [[S3]] expose the shared `MathemeHarmonicProfile` for the active tick and selected coordinate.
- [[S2]] pointer law binds the profile to the selected coordinate: family refs, mirror refs, lens refs, inversion refs, VAK/CF refs, and harmonic relation metadata.
- [[S3]] deposition anchor gives DAY/NOW/session context when the selected coordinate has live observations or Graphiti episodes.

## Required `MathemeHarmonicProfile` Fields

- `tick`: `cycle`, `tick12`, `degree720`, `degree360`, `su2Layer`, `phase`, `position6`.
- `harmonic`: pitch class, note, X/X' semitone partner, X+Y=5 mirror partner, square mirror span, ratio role, 8+4 rendering role.
- `diatonic`: degree, mode, mode-anchor CF, VAK register, context agent/function where available.
- `resonance72`: both `legacyResonanceIndex` and `lensAnchorIndex`.
- `pointerAnchor`: selected coordinate, QL position, relation descriptors, source/spec/code/test anchors, and graph-law provenance.
- `depositionAnchor`: safe DAY/NOW/session and episode handle references only.

## Privacy Boundary

M0' may show public-current graph topology and safe profile facts. It must not expose raw `q_b`, raw `q_p`, private Nara identity, private journal text, unreconciled Graphiti episode bodies, or protected local personal graph facts. Graphiti handles may be shown only as protected-local references with governed opening actions.

## Visual / Audio Interaction Model

- Visual: canonical graph layout with harmonic overlays driven by profile fields; selected-node pulse follows `tick12`, `degree720`, helix, square, and resonance72.
- Audio: optional node audition uses profile pitch, ratio, and rendering role; outer 4 nodal positions shape boundary/standing-wave behavior rather than sounding as independent tones.
- Interaction: graph traversal is a profile-aware route, not a renderer-local recomputation. M0' may request a coordinate profile or relation profile from S2/S3; it may not derive codons, planetary correspondences, or profile tick math locally.

## Readiness / Test Criteria

- Selecting a coordinate fetches canonical S2 node data and safe profile data from real services.
- Pointer summary names the graph-law source and relation descriptor provenance.
- Tests prove graph selection does not mutate tick state and does not compute private codon, hexagram, planetary, or chakra mappings in renderer code.
- Tests prove protected Graphiti or Nara payloads are absent from public graph/profile projections.
- Visual/audio readiness states distinguish `missing_profile`, `ready_public_current`, `blocked_private_projection`, and `blocked_pointer_law`.
