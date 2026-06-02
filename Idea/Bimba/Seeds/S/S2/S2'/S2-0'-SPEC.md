---
coordinate: "S2.0'"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S2'-SPEC]]"
  - "[[S2-SPEC]]"
  - "[[S2-SHARD-INDEX]]"
  - "[[S2'-TRACEABILITY-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
  - "[[S2']]"
---

# S2.0' Shard: Coordinate Substrate Law

## Canonical Role

[[S2.0']] is the [[P0']] / [[CT0]] / [[L0']] ground of [[S2']] graph law: coordinate identity, namespace normalization, legacy `#` compatibility, and graph-backed entity addressability. It makes the first lawful move from raw [[S2]] substrate to coordinate-aware [[QL Graph]] without turning [[VAK]] intent or [[Hen]] vault form into graph parser concerns.

## Source And Diagram Anchors

Primary anchors: [[S2'-SPEC]], [[S2-SPEC]], [[S2-SHARD-INDEX]], [[S2'-TRACEABILITY-INDEX]], [[S2']], [[S2]], [[S2'Cx]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], and [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]]. World/MOC surfaces: `Idea/Bimba/World/Types/Coordinates/S/S'/S2'/S2'.md` and `Idea/Bimba/World/Types/Coordinates/S/S'/S2'/S2'.canvas`. Legacy anchors: [[S2-0']], [[S2']], and [[S2-S2i-GRAPH]].

## Current Body Reality

`Body/S/S2/graph-services/src/coordinate.rs` defines `CoordinateArrayParser`, `ParsedCoordinate`, `CoordLayer`, and support for family roots, prime inversion, lens coordinates, context frames, [[VAK]] names, `Weave_*`, and psychoid `#` coordinates. `Body/S/S2/graph-services/src/graph_api.rs` exposes `GraphMethodService::resolve_coordinate_string`, currently canonicalizing `#2` to `M2` while leaving bare `#` as root. `Body/S/S2/graph-services/tests/coordinate_query_contract.rs` and `graph_api_contract.rs` verify this behavior.

## Build Contract

Every graph-facing coordinate input must be parsed before graph lookup or write planning. Legacy `#0`-`#5` must resolve into [[M]] family projections with provenance rather than being rejected as random invalid syntax. Ambiguous coordinate writes must fail before they hit [[Neo4j]]. Parser support for prime, lens, context-frame, and [[VAK]] tokens must be intentional and test-backed.

## Test Obligations

Run `Body/S/S2/graph-services/tests/coordinate_query_contract.rs`, `graph_api_contract.rs`, and `Body/S/S0/epi-cli/tests/coordinate_parser.rs`. Tests must include canonical family coordinates, prime coordinates, legacy `#` inputs, context-frame tokens, wikilink frontmatter arrays, invalid families/positions, and graph method request validation.

## Open Gaps

The `coordinate` versus `bimbaCoordinate` naming drift is still open. The current parser resolves old forms, but graph writes still need full provenance fields wherever compatibility source labels or properties are involved.

## Boundaries

[[S2.0]] owns raw service ground. [[S2.1']] owns relation/type law after identity is established. [[S0']] owns runtime schemas and CLI validation surfaces. [[S4']] owns [[VAK]] dispatch intent. [[Hen]] and [[S1']] own vault/frontmatter coordinate production before graph promotion.
