# AGENTS.md — ontology

## Purpose
The S2 coordinate Turtle ontology: a single OWL2-RL/SHACL file declaring "Epi-Logos S2 coordinate ontology" — coordinate classes, relation families, provenance anchors, and public Anuttara language fields.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S2-SPEC]]

## Ownership
- `epi.ttl` — the ontology (`epi:` namespace `https://epi-logos.org/ontology#`, OWL2 RL profile). Declares classes (`epi:BimbaNode`, `epi:CoordinateNode`, `epi:AnuttaraNode`, `epi:SourceAnchor`/`SpecAnchor`/`CodeAnchor`/`TestAnchor`, `epi:RelationFamily`, `epi:KernelCoreRelation`), object properties (`epi:contains`/`partOf`/`integratesInto`/`hasLens`/`inIdentityChainWith`), datatype properties mapped to Neo4j keys via `epi:neo4jProperty` (`c_1_symbol`, `c_1_formulation_type`, `c_1_complete_formulation`), the paraconsistent `epi:reflectiveDistinction` annotation, and `epi:AnuttaraNodeShape` (SHACL).
- Does NOT own its consumer: this file is `include_str!`-embedded as `EPI_ONTOLOGY_TURTLE` by sibling `graph-services/src/ontology.rs` — the loader/bridge logic lives there, not here. Coordinate domain law lives in this layer's owning spec, not in [[S0-SPEC]]/[[M0'-SPEC]] by convenience.

## Local Contracts
- The ontology IS the contract: `epi.ttl` (class/property/shape declarations) is the binding interface for the S2 coordinate bridge.
- Owning specs: [[S2-SPEC]], [[S2-ARCHITECTURE]].
- No CONTRACT.md at this level — see parent `Body/S/S2/AGENTS.md` + Canon.

## Work Guidance
- `epi.ttl` is embedded at compile time by `graph-services/src/ontology.rs` (`include_str!("../../ontology/epi.ttl")`) — editing this file changes the compiled crate; run `gitnexus_impact` on affected `ontology.rs` symbols before changing class/property IRIs.
- Keep `epi:neo4jProperty` mappings aligned with the `c_n_*` coordinate-prefixed property keys used by graph-schema/graph-services.
- `[[wikilink]]` all coordinate/spec/carrier references in agent-authored artifacts.

## Verification
- `cargo test -p epi-s2-graph-services` (exercises `ontology.rs`, which embeds and parses this file); or `make rust-test`.

## Child DOX Index
- (leaf)
