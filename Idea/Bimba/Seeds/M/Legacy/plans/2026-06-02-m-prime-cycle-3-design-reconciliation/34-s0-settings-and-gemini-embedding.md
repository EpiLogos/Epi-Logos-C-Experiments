---
title: "Track 34 — S0 Settings Infrastructure + Gemini Embedding 2 Accessor"
type: cycle-3-tranche
status: planned
created: 2026-06-08
coordinate: "S0"
sub_coordinate: "S0 (settings substrate) + S0 (gemini-embedding accessor)"
c_0_source_coordinates:
  - "S0"
  - "M'"
  - "M5'"
c_0_related_coordinates:
  - "S2"
  - "S3"
  - "S4'"
  - "S5"
  - "M0'"
dev_decisions:
  - "Stream E lands as a NEW tranche file (not a sub-tranche of 17-s-stack-modularisation.md) because 17 is a pure-modularisation campaign (`pub use` re-export discipline; no functionality added). Stream E adds new functionality (settings subsystem + cloud-class API accessor) and therefore does not fit 17's anti-greenfield discipline."
  - "Canonical API-key source is the user's `~/.zshenv`. The S0 settings subsystem reads from process environment; the user is responsible for exporting keys in `~/.zshenv`."
  - "Cloud-opt-in policy per [[M'-MODEL-SLOT-SPEC]] applies to ANY cloud-class accessor. The Gemini Embedding 2 accessor refuses to issue cloud calls unless the corresponding opt-in is recorded in `~/.epi-logos/config.toml` `[cloud_opt_in]`."
  - "All rate-limit thresholds, retry counts, back-off parameters, and jitter ranges are read from `~/.epi-logos/config.toml` at accessor construction. NO hardcoded numeric defaults in implementation."
  - "Embedding cache key includes model-version + document-hash + matryoshka-dim so that re-truncation does not invalidate the full-resolution cached vector."
dev_relations:
  - { type: implements, target: "[[M'-MODEL-SLOT-SPEC]]" }
  - { type: implements, target: "[[frontier-confirmations-and-refinements]]" }
  - { type: depends_on, target: "[[33-harmonic-energy-channel-handoff]]" }
  - { type: blocks, target: "[[12-agentic-layer-s4-s5]]" }
  - { type: blocks, target: "[[06-m5-epii-reconciliation]]" }
dev_changed_paths: []
---

# Track 34 — S0 Settings Infrastructure + Gemini Embedding 2 Accessor

Scope captured from [[33-harmonic-energy-channel-handoff]] §2.5 (Stream E). This tranche lands two new components at S0 that are prerequisites for the N-channel EBM head training pipeline (Stream C, [[12-agentic-layer-s4-s5]] Tranche 12.24 Phase 2 + [[06-m5-epii-reconciliation]] Tranche 6.8): a cloud-opt-in-gated settings subsystem, and a Gemini Embedding 2 accessor that consumes the settings to fetch and cache unified-multimodal embeddings.

## §0 — Home-file decision

This scope does NOT fit [[17-s-stack-modularisation]]: that tranche is a modularisation campaign with strict anti-greenfield / `pub use`-re-export discipline (per its §"What this tranche does NOT touch": "No new functionality"). Stream E adds new functionality. The right home is a new tranche file at next-available number — Track 34.

## Tranche 34.1 — Component A: S0 settings infrastructure

**Physical residency:** `Body/S/S0/settings/` (new crate; verify against existing crate layout at execution time — the existing S0 crates are `epi-cli`, `epi-lib`, `portal-core`, plus `vendor`). If the crate-vs-module decision shifts at execution time (e.g., a thin module inside an existing crate is preferred), record the decision and proceed; the spec invariant is the API surface and policy enforcement, not the crate boundary.

**Conceptual coordinate:** S0 (filesystem + process + command substrate) with S0' coordinate authority over cloud-opt-in policy lookup. Gateway methods land under the `s0'.settings.*` namespace.

**Scope bullets (from handoff §2.5 A):**

- `ApiKeyStore` — reads required and optional API keys from process environment. The canonical user-side source is `~/.zshenv`; the store does not parse zshenv directly, it relies on the user's shell having exported the keys into the process environment. Keys named per provider convention (e.g., `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`). The store reports `Present` / `Missing` per key without exposing the value beyond the accessor that needs it.
- `CloudOptInPolicy` — per-key, mandatory check before any cloud-class use. The policy reads `~/.epi-logos/config.toml` `[cloud_opt_in]` section and returns `OptIn::Recorded { consented_at, consent_scope }` or `OptIn::NotRecorded`. Any cloud-class accessor calls `CloudOptInPolicy::require(key_name, dispatch_class)` at entry and refuses with a typed error if not recorded.
- `SettingsManifest` — declares the set of required and optional keys + their privacy class (local-only / cloud-opt-in). Drives `epi settings status` rendering.
- Gateway methods:
  - `s0'.settings.api_key_status(name)` — returns `{ present: bool, opt_in: OptInStatus }` for the named key. Never returns the value.
  - `s0'.settings.opt_in(name)` — records cloud opt-in for the named key, writing the timestamp + consent scope to `~/.epi-logos/config.toml` `[cloud_opt_in]`.
- CLI:
  - `epi settings status` — lists all manifest keys with `Present/Missing` + opt-in state.
  - `epi settings opt-in <key>` — invokes the gateway method to record opt-in; surfaces the consent-scope UI gate language from [[M'-MODEL-SLOT-SPEC]] (the frictional surface is intentional — the command should not silently record opt-in without surfacing the privacy implication).
- Opt-in record format in `~/.epi-logos/config.toml`:
  ```toml
  [cloud_opt_in.gemini_embedding]
  consented_at = "<ISO-8601 timestamp>"
  consent_scope = "<scope-name per M'-MODEL-SLOT-SPEC>"
  ```
- Refusal semantics: any cloud-class accessor without recorded opt-in returns a typed error whose message points at the exact CLI command needed (`epi settings opt-in <key>`). No silent fall-through to cloud.

## Tranche 34.2 — Component B: Gemini Embedding 2 accessor (depends on Tranche 34.1 `CloudOptInPolicy`)

**Physical residency:** `Body/S/S0/gemini-embedding/` (new crate) OR a module inside an existing S0 crate; decide at execution time per the same principle as §1 above. Verify the latest model identifier (`gemini-embedding-2-preview` at handoff time) at execution; the API surface uses the identifier as a configurable input, not a hardcoded constant.

**Conceptual coordinate:** S0 (cloud-class accessor primitive). Consumed by Stream C (EBM training pipeline at S5) and any other surface that ingests documents through Gemini Embedding 2.

**Scope bullets (from handoff §2.5 B):**

- Model identifier: `gemini-embedding-2-preview` (verify at execution time; passed in by config, never hardcoded as a constant).
- Document chunking: native 3072-dim handling. Chunk only beyond the canonical context limit declared by Gemini Embedding 2 at the time of build; the accessor MUST NOT prematurely chunk content that fits in one call.
- Cache:
  - Path: `~/.epi-logos/cache/embeddings/{model-version}/{document-hash}.{matryoshka-dim}`
  - Key components: model-version (so version drift invalidates without manual cleanup), document-hash (BLAKE3 of canonical document bytes), matryoshka-dim (so re-truncation does not invalidate the full-resolution cache entry).
  - Read-through: cache hit returns the stored vector; cache miss issues the API call, persists at full resolution (3072), and serves the requested matryoshka-dim from that full-resolution write.
- Matryoshka truncation: support 3072 / 1536 / 768. The accessor accepts a `target_dim` parameter and returns a slice of the full-resolution vector (per MRL semantics — early dimensions carry the critical semantic information; truncation is resolution-reduction not content-loss; see [[frontier-confirmations-and-refinements]] §2.2).
- Rate limiting + back-off + retry with jitter: parameters from `~/.epi-logos/config.toml` `[gemini_embedding]` section. NO hardcoded thresholds or retry counts in implementation. The config section names (e.g., `max_rpm`, `max_concurrent`, `backoff_initial_ms`, `backoff_factor`, `jitter_ratio`, `max_retries`) are established by the tranche during planning; concrete values are user-tunable.
- Privacy class: cloud-opt-in. The accessor calls `CloudOptInPolicy::require("gemini_embedding", "RETRIEVAL_DOCUMENT" | "SEMANTIC_SIMILARITY" | ...)` at entry. Refuses with a typed error pointing at `epi settings opt-in gemini_embedding` if not recorded.
- Mock-API mode for CI: a feature-flagged backend that returns deterministic synthetic vectors keyed by document-hash, so CI never issues outbound calls. Live-API smoke test stays manual.

## §3 — Verification

- `cargo check -p <settings-crate>` clean.
- `cargo check -p <gemini-embedding-crate>` clean.
- `epi settings status` runs and renders all manifest keys.
- `epi settings opt-in gemini_embedding` round-trip writes `~/.epi-logos/config.toml` `[cloud_opt_in.gemini_embedding]` and the next gateway-method call reflects the recorded state.
- Mock-API mode CI test: a small fixture document is embedded twice; the second call is a cache hit (no mock backend invocation).
- Refusal contract: with opt-in absent, any cloud-class entry returns a typed error whose message names `epi settings opt-in gemini_embedding`. No silent fall-through.
- Existing Gemini surfaces under S2 (`Body/S/S2/graph-services/src/embeddings.rs`, `Body/S/S2/external/bimba-mcp/src/embeddings/gemini.ts`) are NOT in scope for this tranche; coordination with those surfaces (whether they migrate to the new S0 accessor) is a downstream cleanup, captured separately if needed.

## §4 — Dependencies

- **Upstream blocking:** none. Stream E execution is independent.
- **Downstream blocked:**
  - Stream C — N-channel EBM head training pipeline ([[12-agentic-layer-s4-s5]] Tranche 12.24 Phase 2 + [[06-m5-epii-reconciliation]] Tranche 6.8). The EBM training corpus fetch requires Gemini Embedding 2 access per [[33-harmonic-energy-channel-handoff]] §2.3 (final bullet).
- **Canon prerequisite:** none. [[M'-MODEL-SLOT-SPEC]] already commits to cloud-opt-in policy; no Thread A amendment is required for this tranche.

## §5 — What this tranche does NOT touch

- Does not implement any settings or embedding-accessor code (this is plan-only).
- Does not hardcode rate-limit thresholds, retry counts, back-off parameters, or jitter ranges in scope text or implementation.
- Does not migrate the existing S2 Gemini surfaces; that is a separate, later cleanup.
- Does not parse `~/.zshenv` directly; relies on the user's shell having exported keys into the process environment.
- Does not record opt-in silently; the CLI command surfaces the consent-scope language from [[M'-MODEL-SLOT-SPEC]].
