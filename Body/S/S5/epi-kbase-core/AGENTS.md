# AGENTS.md — epi-kbase-core

## Purpose
Rust crate `epi-s5-kbase-core`: "S5.2' kbase foundations — bounded resource context, project scoping, search facets" (`Cargo.toml`).
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S5-SPEC]] / [[S5-ARCHITECTURE]]

## Ownership
- `src/lib.rs` — crate root; re-exports the six modules below.
- `src/kbase.rs` — `build_kbase_field` / `selected_item_path`: shells `kbase.sh search <coord>` under `BKMR_PROJECT`, returns `KbaseFieldFacet`.
- `src/vimarsa.rs` — `build_vimarsa_field` / `selected_item_path`: aperture-aware project mapping + 1500ms timeout, returns `VimarsaFieldFacet`.
- `src/project.rs` — `DEFAULT_PROJECT` + `aperture_project_for_coord` (coordinate-family → bkmr namespace).
- `src/parse.rs` — `extract_path_candidate` (path parsing of search lines).
- `src/script.rs` — `resolve_kbase_script` / `resolve_vimarsa_script` locators.
- `src/types.rs` — `FacetItem`, `KbaseFieldFacet`, `VimarsaFieldFacet` serde shapes.
- `scripts/kbase.sh` — the bkmr-backed search script invoked at runtime.
- Does NOT own coordinate semantics, kernel shapes, or the Epii agent contract — those live in their owning modules/specs and `Body/S/epi-kernel-contract`, not duplicated here.

## Local Contracts
- No local `CONTRACT.md` / `README.md`. Coordinate Header = module doc-comments in `src/kbase.rs` and `src/vimarsa.rs`.
- Owning specs: [[S5-SPEC]], [[S5-ARCHITECTURE]], [[S-SYSTEM-INDEX]].
- Layer baseline: `Body/S/S5/contract-inventory/track-04-t0-baseline.md` (see parent [[S5]] AGENTS.md).

## Work Guidance
- Run `gitnexus_impact` on a symbol before editing it; respect HIGH/CRITICAL warnings.
- `[[wikilink]]` all coordinate/spec/carrier/agent references in agent-authored artifacts.
- Vault writes use coordinate-prefixed `c_n_*` frontmatter.

## Verification
- `cargo test -p epi-s5-kbase-core` (or `make rust-test`).

## Child DOX Index
- (leaf)
