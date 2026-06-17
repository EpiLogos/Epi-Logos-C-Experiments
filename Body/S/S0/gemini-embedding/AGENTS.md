# AGENTS.md — gemini-embedding

## Purpose
Rust crate `gemini-embedding`: a Gemini embedding accessor — `TaskType`-scoped async API over an `EmbeddingBackend`, Matryoshka dims `[3072, 1536, 768]`, BLAKE3 document hashing, rate limiting, and a cloud opt-in policy gate.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S-SYSTEM-INDEX]] -> [[S0-SPEC]] / [[S0-ARCHITECTURE]]

## Ownership
- `Cargo.toml` — crate manifest (`name = "gemini-embedding"`); `default` + `mock-api` features; deps `blake3`, `reqwest`, `serde`, `tokio`, `toml`
- `src/lib.rs` — crate root / public surface: `GeminiEmbeddingAccessor`, `EmbeddingBackend` trait, `LiveGeminiEmbeddingBackend`, `MockGeminiEmbeddingBackend`, `EmbeddingConfig`, `CloudOptInPolicy`, `RateLimitConfig`, `TaskType`, `EmbeddingResult`, `EmbeddingError`, `document_hash`, and `ACCESSOR_NAME` / `FULL_RESOLUTION_DIM` / `SUPPORTED_MATRYOSHKA_DIMS` consts
- `tests/accessor_contract.rs` — contract tests (caching/opt-in/backend-call accounting via a `CountingBackend`)
- Does NOT own graph storage, vector indexes, or coordinate semantics — those live in [[S2]] (graph substrate) and the gnostic RAG pipeline; this crate is only the embedding client primitive at S0.

## Local Contracts
- (no local CONTRACT.md) — the binding interface is the Coordinate Header in `src/lib.rs` (public trait `EmbeddingBackend` + accessor surface) plus `Cargo.toml`
- Owning spec: [[S0-SPEC]] / [[S0-ARCHITECTURE]]

## Work Guidance
- Run `gitnexus_impact({target, direction:"upstream"})` before editing any public symbol (`EmbeddingBackend`, `GeminiEmbeddingAccessor`, `EmbeddingConfig`); warn on HIGH/CRITICAL.
- Reference all coordinates/specs/crates as `[[wikilink]]`; vault writes use coordinate-prefixed `c_n_*` frontmatter.
- Cloud calls go through `CloudOptInPolicy::require`; do not bypass the opt-in gate when adding backends.

## Verification
- `cargo test -p gemini-embedding` (use `--features mock-api` for offline/mock paths).

## Child DOX Index
- (leaf)
