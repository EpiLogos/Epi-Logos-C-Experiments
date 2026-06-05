# CCT-14 Ledger — Hen Entity-Candidate Lifecycle

## Finding

Cycle 3 landed the Hen / Smart Env seam for link suggestions, but the full entity lifecycle was still implicit. Older vault canon describes Empty node resolution and loose working forms, while current S1' docs define World/Types crystallisation. The missing bridge is a first-class Hen lifecycle for dangling wikilinks and Obsidian-created loose notes.

## Canonical Resolution

Hen owns the Pi/vault entity-candidate compiler:

1. Dangling `[[wikilinks]]`, unresolved Smart Env targets, and root-created loose notes enter `Idea/Empty/` or `Idea/Empty/Present/{day}/entities/` as `entity_candidate` artifacts.
2. Smart Env remains a read-only suggestion pool.
3. mdbase/entity-note intelligence is represented through coordinate-lawful frontmatter, aliases, and wikilinks.
4. Reviewed candidates promote into coordinate-native `Idea/Bimba/World/Types/Coordinates/**` incubation.
5. Stable definitions graduate flat into `Idea/Bimba/World/{Name}.md`; type-local files remain MOC/source pointers.
6. S2 graph sync consumes Hen-accepted vault state only.

SwarmVault remains a Codex/Claude development-ledger sidecar and is not the Pi/Hen canonical entity compiler.

## Spec Anchors

- `Idea/Bimba/Seeds/S/S1/S1'/FLOW-2026-06-03-HEN-ENTITY-CAPTURE-LIFECYCLE.md`
- `Idea/Bimba/Seeds/S/S1/S1'/S1'-SPEC.md`
- `Idea/Bimba/Seeds/S/S1/S1'/S1'-WORLD-TYPES-CRYSTALLIZATION-PROTOCOL.md`
- `Idea/Bimba/Seeds/S/S4/S4'/S4-1'-SPEC.md`
- `Idea/Bimba/Seeds/S/S1/S1-ARCHITECTURE.md`

## Cycle 3 Hooks

- Decision: DR-S1-4
- Closure: CCT-14
- Release gate: G10 cross-cutting closures

## Implementation Targets

- `s1'.entity.capture`
- `s1'.entity.classify`
- `s1'.entity.promote_to_type`
- `s1'.world.graduate`
- `s1'.semantic.neighbors_of`
- `s1'.semantic.by_block`
- `s1'.semantic.search`

## Verification Shape

Future implementation should add real fixture tests for:

- root loose note moved into Empty candidate residency;
- dangling wikilink capture creates/updates candidate without graph mutation;
- Smart Env suggestions remain read-only evidence;
- candidate promotion creates coordinate-native World/Types incubation;
- flat World graduation leaves a type-local MOC pointer;
- graph-promotion intent includes candidate state, aliases, type source path, and accepted wikilinks.
