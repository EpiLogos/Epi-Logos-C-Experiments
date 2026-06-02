---
coordinate: "S1.0"
c_4_artifact_role: "shard-spec"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S1-SPEC]]"
  - "[[S1-SHARD-INDEX]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
  - "[[S1]]"
  - "[[S1']]"
  - "[[S-SYSTEM-INDEX]]"
---

# S1.0 Shard: Vault Ground

## Canonical Role

[[S1.0]] is the material vault ground: the place where [[Idea]] becomes a concrete filesystem root, where [[Obsidian]] state is discoverable, and where vault-relative paths are normalized before higher layers claim meaning. In [[P0]] / [[CT0]] terms it is the root-contact shard for [[S1]]: it does not decide [[Hen]] residency law, [[Graphiti]] temporal meaning, or [[S2]] graph truth, but it must make every later claim addressable.

## Source And Diagram Anchors

| Anchor | Role |
|---|---|
| [[S1-SPEC]] | Umbrella vault/compiler law for [[S1]] / [[S1']] |
| [[S1-SHARD-INDEX]] | Local shard map and gate order |
| [[S-SHARD-HARMONIZATION-PROTOCOL]] | Required evidence/linking contract for all S/S' shards |
| [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]] | Shows [[S1]] as vault material plane paired with [[S1']] [[Hen]] law |
| [[ARCHITECTURE-DIAGRAM-PACK#Diagram And MOC Residency Protocol]] | Places [[World]], [[World/Types]], [[Seeds]], and MOC/canvas residency under S1/S1' law |
| [[S1]] | World coordinate definition and type-local MOC canvas at `Idea/Bimba/World/Types/Coordinates/S/S1/S1.canvas` |
| [[S1']] | Prime partner: [[Hen]] compiler/write law |
| [[S1-S1i-OBSIDIAN]] | Migrated legacy spec for vault ontology and S1/S1' path law |
| [[2026-02-22-bimba-data-foundation-harmonization]] | Migrated legacy system law for [[World]], [[Seeds]], [[World/Types]], diagrams, and path subsets |

## Current Body Reality

The live executable mirror of [[S1.0]] is mostly in `Body/S/S0/epi-cli/src/vault/mod.rs` and `Body/S/S0/epi-cli/src/vault/paths.rs`. The CLI exposes `epi vault status`, `read`, `search`, `search-content`, `set-default`, `open`, `day-init`, `now-init`, `now-path`, `flow-init`, `thought-route`, `archive-day`, and related helpers. This is an [[S0]] command membrane over [[S1]] material law, not a reason to re-home vault authority into [[S0]].

The current CLI needs an explicit default vault for `epi vault` discovery. In this session, `epi core knowing "S1'" --json` worked as coordinate orientation, while `epi vault search-content "docs/plans"` failed until a vault default is configured. That is evidence for this shard: vault-root configuration is not optional ceremony; it is the precondition for using the vault as the discovery surface.

`Body/S/S0/epi-cli/src/vault/mod.rs` also records the current boundary audit: direct `obsidian-cli` helpers are deprecated for agentic/Theia use, while governed-local bootstrap writes remain local fast paths. Canonical mutation of existing wikilink-bearing content routes through [[S1']] gateway methods.

## Build Contract

- Resolve the active `/Idea` root.
- Read `.obsidian` configuration where relevant without treating app workspace state as canonical ontology.
- Normalize vault-relative paths for [[Bimba]], [[Empty]], [[Pratibimba]], [[World]], [[World/Types]], and [[Seeds]].
- Preserve the corrected residency distinction: flat `Idea/Bimba/World/{Name}.md` for crystallised forms, `Idea/Bimba/World/Types/**` for type/MOC canvases, and `Idea/Bimba/Seeds/**` for specs/plans/source traces.
- Refuse or flag stale `World/Forms`, `/Bimba/Forms`, and orphan `/docs/specs` / `/docs/plans` authority paths unless they are explicitly cited through [[LEGACY-DOCS-MIGRATION-INDEX]].

## API / Envelope / TS

- Supports material read/search roots surfaced by `epi vault read`, `search`, and `search-content`.
- Feeds `s_1_target_vault_zone`, `s_1_source_path`, and path-normalization fields used by [[S1']] residency law.
- Does not own `s1'.vault.write_file`, `rename_file`, or `move_file`; those are [[S1']] / [[Hen]] mutations transported through [[S3]].

## Implementation Hooks

- `Body/S/S0/epi-cli/src/vault/mod.rs`
- `Body/S/S0/epi-cli/src/vault/paths.rs`
- `Body/S/S0/epi-cli/src/vault/templates.rs`
- `Idea/.obsidian/**` as app-local state, not ontology.
- `Idea/Bimba/World/Types/Coordinates/S/S1/S1.canvas` as the type-local S1 MOC.

## Test Obligations

- Read/write real markdown in a test vault.
- Reject path traversal outside the vault.
- Prove `set-default` or explicit vault-root behavior before `epi vault search-content` is treated as a discovery surface.
- Verify deprecated path strings are warnings or errors, not silent canon.
- Verify [[World/Types]] canvas paths remain valid after migration of specs/plans into [[Seeds]].

## Boundaries

[[S1.0]] owns material pathing; [[S1.0']] owns residency law; [[S3']] / [[Chronos]] owns temporal meaning; [[S2]] / [[S2']] owns graph truth; [[S5]] / [[S5']] owns review and world-return evaluation. [[M']] and [[Theia]] may read public-safe vault material directly, but governed writes must route through [[Hen]].

## Open Gaps

- The vault default is not consistently configured for agent sessions, so `epi vault search/search-content/link-suggest` can fail even when coordinate orientation works.
- Some test and operator docs still mention historical `docs/plans/**` outputs; these need follow-up cleanup or explicit archive classification.
- Directory moves such as day archive still need a Hen directory-move surface to reconcile inbound wikilinks.
