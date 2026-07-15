# AGENTS.md — graphiti-runtime

## Purpose
`epi-s3-graphiti-runtime`: S3 Graphiti runtime adapter contracts with canonical `NativeLibraryClient` and deprecated HTTP compatibility client. Physically resides at S3; conceptually actualises S5 world-return per the residency-vs-coordinate law (code envelopes carry `coordinate: S5/S5'`, `runtimeOwner: S3'`).
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S3-SPEC]] (world-return canon: [[S5-SPEC]]; see also [[S3-ARCHITECTURE]], [[S5-ARCHITECTURE]], [[S-SYSTEM-INDEX]])

## Ownership
- `Cargo.toml` — crate manifest (`epi_s3_graphiti_runtime` lib; features `native_library_client` + `http_compatibility_client`; depends on `portal-core`).
- `src/lib.rs` — crate root / public surface: `GraphitiClient` transitional trait, canonical `NativeLibraryClient`, deprecated `HttpCompatibilityClient`, `EpisodeAttrs`/`EpisodeInsert` payloads, `NaraRelation*` relation carriers (`HAS_DAY`, `CONTAINS_DAILY_NOTE`, `PART_OF_DAY`, `NEXT_IN_ARC`), native `nara_insert_relation` + `nara_relations_for_episode`, `GraphitiRuntimeConfig`/`GraphitiStatus`, deposit-payload builders (`session_memory_*`, `kernel_resonance_*`, `kernel_profile_observation_*`, `nara_relation_payload`), CCT-21 public-safe BeingPattern provenance refs, and compatibility fns (`status`, `session_memory_search`, `*_deposit`, `fire_provenance`).
- `src/native.rs` — native transcript canonicalisation, Sophia extraction, in-memory episodic schema, idempotent Nara relation-edge insertion/read-back, ingest receipts, and query parity lifted from the Python Graphiti service.
- `src/sidecar-compat/mod.rs` — deprecated HTTP compatibility client; do not extend except for deletion-safe compatibility.
- `tests/parity_with_python_service.rs` — Rust parity checks for the former Python transcript ingest/query behavior.
- `tests/episode_vak.rs` — contract tests for VAK-field serialisation on episode payloads.
- `tests/nara_relations.rs` — behavior tests for all four Nara relation edge labels, protected-local privacy enforcement, native insertion/read-back, and idempotent replay.
- Does NOT own gateway protocol/method contract (delegated to sibling `gateway-contract`, [[S3-SPEC]]) or knowledge-graph storage ([[S2-SPEC]]); identity-affecting deposits are rejected here and routed through Epii review.

- CCT-16 (iii): `fire_provenance` is at-least-once — `deliver_provenance_to` retries with exponential backoff (max 5), carries an `x-idempotency-key` header `(session_id, event_type, timestamp)`, and dead-letters to `{day_dir}/.provenance-dead-letter.jsonl` (append-only) on final failure so dropped events are observable, never invisible.

## Local Contracts
- Code Coordinate Header: `src/lib.rs` module-level `//!` header; `src/sidecar-compat/mod.rs` deprecated compatibility header; VAK field grammar documented on `EpisodeAttrs::with_vak`.
- Owning specs: [[S3-SPEC]], [[S3-ARCHITECTURE]]; world-return semantics [[S5-SPEC]].
- No CONTRACT.md at this level — see parent + Canon.

## Work Guidance
- Run `gitnexus_impact` on a symbol before editing it; respect HIGH/CRITICAL warnings.
- `[[wikilink]]` all coordinate/spec/carrier/agent references in agent-authored artifacts.
- Vault writes use coordinate-prefixed `c_n_*` frontmatter.

## Verification
- `cargo check --manifest-path Body/S/S3/graphiti-runtime/Cargo.toml --no-default-features --features native_library_client`; `cargo test --manifest-path Body/S/S3/graphiti-runtime/Cargo.toml --test parity_with_python_service`; `cargo test --manifest-path Body/S/S3/graphiti-runtime/Cargo.toml --test nara_relations`; `cargo test --manifest-path Body/S/S3/graphiti-runtime/Cargo.toml --test being_pattern_protected_refs` for CCT-21; `cargo test -p epi-s3-graphiti-runtime` only in a workspace that includes this excluded crate; or `make rust-test` from repo root.

## Child DOX Index
- (leaf)
