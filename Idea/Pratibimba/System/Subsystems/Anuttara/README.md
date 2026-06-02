---
coordinate: "M0'"
c_4_artifact_role: "subsystem-architecture-index"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[M0'-SPEC]]"
  - "[[M'-SYSTEM-SPEC]]"
---

# Anuttara

[[Anuttara]] is the [[M0']] subsystem face: ground language, verifier, symbolic coordinate diagnostics, and source constraints for the Pratibimba System.

| Layer | Anchor |
| --- | --- |
| Canonical Seed spec | [[M0'-SPEC]] |
| UX/system surface | `Idea/Pratibimba/System/Subsystems/Anuttara` |
| Runtime extension | `Body/M/epi-theia/extensions/m0-anuttara` |
| S dependencies | [[S1]] / [[Hen]] for vault evidence, [[S2]] for graph-backed diagnostics |

## Architecture Focus

Track how Anuttara presents ground-language and coordinate verification in the Theia UX without turning the UI into the source of truth. Diagrams should link to the owning Seed architecture pack and show how verifier evidence travels through [[S1]], [[S2]], and the M0' extension.

## Next Local Files

- `ARCHITECTURE.md` for subsystem architecture once the M0' diagrams are split out.
- `UX.md` for inspector/browser interaction detail.
