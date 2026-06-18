# AGENTS.md — graphiti-runtime

## Purpose
`epi-s3-graphiti-runtime`: "S3 Graphiti runtime adapter contracts and compatibility HTTP client" (Cargo.toml `description`). Physically resides at S3; conceptually actualises S5 world-return per the residency-vs-coordinate law (code envelopes carry `coordinate: S5/S5'`, `runtimeOwner: S3'`).
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S3-SPEC]] (world-return canon: [[S5-SPEC]]; see also [[S3-ARCHITECTURE]], [[S5-ARCHITECTURE]], [[S-SYSTEM-INDEX]])

## Ownership
- `Cargo.toml` — crate manifest (`epi_s3_graphiti_runtime` lib; depends on `epi-s3-gateway-contract` + `portal-core`).
- `src/lib.rs` — crate root / public surface: `EpisodeAttrs`/`EpisodeInsert` payloads, `GraphitiRuntimeConfig`/`GraphitiStatus`, deposit-payload builders (`session_memory_*`, `kernel_resonance_*`, `kernel_profile_observation_*`), CCT-21 public-safe BeingPattern provenance refs, and async HTTP adapter fns (`status`, `session_memory_search`, `*_deposit`, `fire_provenance`).
- `tests/episode_vak.rs` — contract tests for VAK-field serialisation on episode payloads.
- Does NOT own gateway protocol/method contract (delegated to sibling `gateway-contract`, [[S3-SPEC]]) or knowledge-graph storage ([[S2-SPEC]]); identity-affecting deposits are rejected here and routed through Epii review.

## Local Contracts
- Code Coordinate Header: `src/lib.rs` item doc-comments (no module-level `//!` header present); VAK field grammar documented on `EpisodeAttrs::with_vak`.
- Owning specs: [[S3-SPEC]], [[S3-ARCHITECTURE]]; world-return semantics [[S5-SPEC]].
- No CONTRACT.md at this level — see parent + Canon.

## Work Guidance
- Run `gitnexus_impact` on a symbol before editing it; respect HIGH/CRITICAL warnings.
- `[[wikilink]]` all coordinate/spec/carrier/agent references in agent-authored artifacts.
- Vault writes use coordinate-prefixed `c_n_*` frontmatter.

## Verification
- `cargo test --manifest-path Body/S/S3/graphiti-runtime/Cargo.toml --test being_pattern_protected_refs` for CCT-21; `cargo test -p epi-s3-graphiti-runtime` only in a workspace that includes this excluded crate; or `make rust-test` from repo root.

## Child DOX Index
- (leaf)
