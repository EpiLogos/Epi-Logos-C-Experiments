---
coordinate: "S0.1"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S0-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
---

# S0.1 Shard: Command Form

## Intent

Own the `epi` command grammar, root router, subcommand layout, argument contracts, and help surface.

## Build Scope

- Keep the live command tree discoverable and stable.
- Separate operator ergonomics from coordinate ontology.
- Preserve command aliases only when they do not obscure ownership.

## API / Envelope / TS

- Mirrors coordinate API methods where local execution is appropriate.
- Feeds the global API/CLI parity manifest.

## Implementation Hooks

- `epi-cli` Clap command tree.
- Existing command families: `core`, `vault`, `graph`, `gate`, `agent`, `nara`, `vimarsa`, `book`, `notebook`, `techne`, `app`, `up`.

## Test Obligations

- Verify documented command families remain addressable.
- Verify help text does not advertise retired ontology as canonical.

## Boundaries

Command nesting is not ontology. For example, `epi gate graphiti` may be ergonomic while [[Graphiti]] architecture belongs to [[S3']].
