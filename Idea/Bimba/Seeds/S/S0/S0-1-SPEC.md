---
coordinate: "S0.1"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S0-SPEC]]"
  - "[[S0-SHARD-INDEX]]"
  - "[[S0-SOURCE-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
---

# S0.1 Shard: Command Form

## Canonical Role

[[S0.1]] is the [[P1]] / [[CT1]] / [[L1]] form of [[S0]]: the visible `epi` grammar, root router, command family layout, arguments, aliases, and help surface. It gives executable form to the stack without confusing command nesting for coordinate ontology.

## Source And Diagram Anchors

Primary anchors: [[S0-SPEC]], [[S0'-SPEC]], [[S0-SHARD-INDEX]], [[S-SYSTEM-INDEX]], [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]], and [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]]. World/MOC anchors: [[S0]] plus `Idea/Bimba/World/Types/Coordinates/S/S0/S0.canvas`. Migrated sources: [[S0-S0i-CLI-CORE]], [[S_Series_Master_CLI_Architecture]], [[2026-03-05-epi-cli-design]], [[2026-03-05-epi-cli-expansion]], and historical [[S0-1]].

No diagram delta: Diagram 2 already states that [[S0]] is the command membrane and typed pass-through target for [[S1]]-[[S5]].

## Current Body Reality

The live root grammar is in `Body/S/S0/epi-cli/src/main.rs`. Its `Commands` enum currently exposes `core`, `vault`, `graph`, `gate`, `agent`, `sync`, `sesh`, `vimarsa`, `book`, `notebook`, `techne`, `app`, `up`, `code`, `nara`, `profile`, `portal`, and `help`. This proves [[S0.1]] is richer than the old March CLI map, but also shows why command presence is not semantic authority: `epi vault` is an [[S1]] adapter, `epi graph` is an [[S2]] adapter, `epi gate` is an [[S3]] adapter, and `epi agent` crosses [[S4]] / [[S5]] operator surfaces.

## Build Contract

- Keep command families discoverable through `epi --help` and tests.
- Every command family must state its coordinate owner when it is not native [[S0]] law.
- CLI aliases are allowed only when they do not hide supersession, such as legacy `--no-tmux` aliasing `--no-cmux`.
- Retired or temporary names must be marked in parity records, not silently fossilised as ontology.

## API / Envelope / Implementation Hooks

This shard feeds the global API/CLI parity manifest rather than a single runtime envelope field. Hooks: `main.rs`, `gate/parity.rs`, `portal/surfaces.rs`, `portal/topology.rs`, and `contract-inventory/s0-membrane-inventory.json`.

## Test Obligations

Use `gate_full_parity_contract.rs` to prevent S0-only route invention, `portal_surfaces_contract.rs` to ensure command surfaces are visible, and `up_command.rs` / `core_knowing.rs` / `techne_cmux_contract.rs` as live operator evidence. Add CLI help/addressability tests when a command family is promoted or retired.

## Open Gaps

The target coordinate-native API still includes names not fully mirrored by CLI/gateway shape. This is expected during [[S1]]-[[S5]] harmonisation. The weak spot is not command count but command provenance: each new `epi` subcommand needs an owner row, authority path, and test evidence.

## Boundaries

[[S0.1]] names and routes command form. [[S0.1']] maps form to coordinate law. [[S3]] owns gateway method classification. Higher layers own semantics behind their command mirrors.
