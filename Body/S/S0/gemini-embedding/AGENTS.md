# AGENTS.md — gemini-embedding

## Purpose
Rust crate `gemini-embedding`: a Gemini embedding accessor — `TaskType`-scoped async API over an `EmbeddingBackend`, Matryoshka dims `[3072, 1536, 768]`, BLAKE3 document hashing, rate limiting, and a cloud opt-in policy gate.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S-SYSTEM-INDEX]] -> [[S0-SPEC]] / [[S0-ARCHITECTURE]]

## Ownership
- `Cargo.toml` — crate manifest (`name = "gemini-embedding"`); `default` + `mock-api` features; deps `blake3`, `reqwest`, `serde`, `tokio`, `toml`
- `src/lib.rs` — crate root / public surface: `GeminiEmbeddingAccessor`, `EmbeddingBackend` trait, `LiveGeminiEmbeddingBackend`, `MockGeminiEmbeddingBackend`, `EmbeddingConfig`, `CloudOptInPolicy`, `RateLimitConfig` (+ `Default`), `TaskType`, `EmbeddingResult`, `EmbeddingError`, `document_hash`, and `ACCESSOR_NAME` / `FULL_RESOLUTION_DIM` / `SUPPORTED_MATRYOSHKA_DIMS` / `DEFAULT_*` consts
- `config.example.toml` — annotated template for the `[gemini_embedding]` + `[cloud_opt_in.gemini_embedding]` sections of `~/.epi-logos/config.toml`. A template only; nothing reads it at runtime. `tests/config_defaults.rs` asserts it loads and that its documented values match the `DEFAULT_*` consts, so it cannot drift.
- `tests/accessor_contract.rs` — contract tests (caching/opt-in/backend-call accounting via a `CountingBackend`)
- `tests/config_defaults.rs` — config-loading contract: tuning keys default, explicit values still validated, template stays honest
- `tests/config_model_version_required.rs` — the identity-key refusal; its own binary because it must unset ambient `$GEMINI_EMBEDDING_MODEL`
- Does NOT own graph storage, vector indexes, or coordinate semantics — those live in [[S2]] (graph substrate) and the gnostic RAG pipeline; this crate is only the embedding client primitive at S0.

## Local Contracts
- (no local CONTRACT.md) — the binding interface is the Coordinate Header in `src/lib.rs` (public trait `EmbeddingBackend` + accessor surface) plus `Cargo.toml`
- Owning spec: [[S0-SPEC]] / [[S0-ARCHITECTURE]]

## Work Guidance
- Run `gitnexus_impact({target, direction:"upstream"})` before editing any public symbol (`EmbeddingBackend`, `GeminiEmbeddingAccessor`, `EmbeddingConfig`); warn on HIGH/CRITICAL.
- Reference all coordinates/specs/crates as `[[wikilink]]`; vault writes use coordinate-prefixed `c_n_*` frontmatter.
- Cloud calls go through `CloudOptInPolicy::require`; do not bypass the opt-in gate when adding backends.
- **Config keys: identity refuses, tuning defaults.** `model_version` and `GEMINI_API_KEY` decide what a vector *means*, so they stay required and their errors must name the file plus a pasteable block. Every other `[gemini_embedding]` key gets a documented `DEFAULT_*` const, because a missing tuning key must never abort a caller that has already started side-effecting work — on 2026-07-28 a missing `canonical_context_limit_bytes` did exactly that to a graph seed run. When adding a key, decide which side of that line it falls on and add it to `config.example.toml`.
- Rate-limit defaults are deliberately identical to the sibling TypeScript reader of the same config section (`Body/S/S2/external/bimba-mcp/src/embeddings/gemini.ts`). Change one, change both, or a config that works for the MCP silently fails for the Rust accessor.

## Verification
- `cargo test -p gemini-embedding` (use `--features mock-api` for offline/mock paths).

## Child DOX Index
- (leaf)
