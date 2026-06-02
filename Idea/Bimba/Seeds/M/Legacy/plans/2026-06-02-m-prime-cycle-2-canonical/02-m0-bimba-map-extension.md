# Track 02 - M0' Bimba Map Extension

This track owns [[M0']] as the full Bimba-map subsystem: readable graph, source traceability, inferential language, map-to-action routing, and technical inspector depth.

## Source Specs

- `Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md`
- `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md`
- `Idea/Bimba/Seeds/S/S2/S2'/S2'-SPEC.md`
- `Idea/Bimba/Seeds/S/S2/S2-SPEC.md`

## Tranches

1. **T0 - Readable Graph And Summonable Inspector**

   Canonical source: `Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md`
   Cycle 1 substrate inheritance: extends cycle 1 Bimba-map population and M0 extension skeleton.

   Dependencies:

   - `01.T0` Electron / Theia runtime boundary must be locked before subsystem-page ownership is executed.

   Deliverables:

   - Own the readable graph surface and summonable technical inspector for M0.
   - Keep readable defaults primary and deep graph metadata summonable.
   - Define the public/current versus deeper technical inspector boundary.

   Verification:

   - M0 extension tests in `Idea/Pratibimba/System/extensions/m0-anuttara`
   - graph payload tests against live S2 services

2. **T1 - Source Traceability And Coordinate Ground**

   Canonical source: `Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md`
   Cycle 1 substrate inheritance: extends cycle 1 coordinate baseline and source-anchor work already landed through S2.

   Deliverables:

   - Own coordinate ground, source traceability, and map-to-source navigation.
   - Keep every surfaced node linked back to canonical source anchors and graph provenance.
   - Surface the diagram/MOC residency chain from `Idea/Bimba/Seeds/ARCHITECTURE-DIAGRAM-PACK.md` through flat `Idea/Bimba/World/{Name}.md` forms and `Idea/Bimba/World/Types/{Type}/{Type}.canvas` type indexes without inventing renderer-local registries.

   Verification:

   - source-traceability payload tests
   - coordinate navigation tests
   - M0 graph/source inspector proves diagram/MOC backlinks resolve through S1/S2-provided provenance, not hardcoded UI paths

3. **T2 - Anuttara Node Language, Symbol, And Formulation Surface**

   Canonical source: `Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md`
   Cycle 1 substrate inheritance: extends cycle 1 Anuttara symbol/formulation work already landed in the graph schema.

   Deliverables:

   - Own Anuttara symbol and formulation rendering inside M0.
   - Keep it tied to S2 node/property truth instead of duplicated UI registries.

   Verification:

   - Anuttara node payload tests
   - M0 rendering tests for symbol/formulation fields

4. **T3 - Graph Inference And GDS Delta**

   Canonical source: `Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md`
   Cycle 1 substrate inheritance: extends cycle 1 SHACL/GDS/overlay substrate without pretending the M0 surface is already complete.

   Deliverables:

   - Own M0-facing graph inference and GDS overlay consumption.
   - Define what M0 may render from public-only overlays and what remains backend-only.

   Verification:

   - GDS overlay tests
   - M0 consumer tests over blocked/ready overlay states

5. **T4 - M0 Routing Into Action And Deep Links**

   Canonical source: `Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md`, `Idea/Bimba/Seeds/M/M'-PORTAL-SPEC.md`
   Cycle 1 substrate inheritance: cycle 1 landed deep-link surfaces in shell/OmniPanel but did not give M0 routing explicit ownership.

   Deliverables:

   - Own how M0 nodes route into subsystem pages, OmniPanel commands, graph searches, and M5 workbench actions.
   - Keep action routing provenance-bearing and namespace-aware.

   Verification:

   - M0 deep-link tests
   - route provenance tests into M5 and integrated plugins
