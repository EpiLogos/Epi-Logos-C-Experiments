# AGENTS.md — S3

## Purpose
The S3 Gateway Control Plane implementation tree: gateway RPC + session authority + runtime control, plus the runtime adapters (Redis, Graphiti, SpacetimeDB) that physically reside here.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S3-SPEC]] (see also [[S3-ARCHITECTURE]], [[S-SYSTEM-INDEX]])

## Ownership
- `gateway/` — `epi-s3-gateway`: "S3 gateway runtime primitives for sessions, transcripts, workspace scope, and product gateway parity".
- `gateway-contract/` — `epi-s3-gateway-contract`: "S3 gateway protocol and method contract for Epi-Logos".
- `redis-context/` — `epi-s3-redis-context`: "S3 Redis runtime context and RedisVL bridge residency contract".
- `graphiti-runtime/` — `epi-s3-graphiti-runtime`: S3 Graphiti runtime adapter contracts, canonical `NativeLibraryClient`, and deprecated HTTP compatibility client. (Physically at S3; conceptually actualises S5 world-return per the residency-vs-coordinate law.)
- `epi-spacetime-module/` — `epi-spacetime-module`: "SpacetimeDB WASM module for Epi-Logos gateway/client/agent registration".
- `spacetime-context/` — declarative SpacetimeDB schema artifacts for S3/S3' persistence surfaces not yet housed in the Rust module table declarations.
- `epi-app/` — deprecated `epi-electron` legacy parity reference only (RETIRING — see Child DOX Index); M' shell authority lives at `Body/M/epi-theia`.
- `../S0/epi-cli/src/gate/server/mod.rs` — physically S0-resident [[S3]] heartbeat membrane. Tranche 23.T23.9 transports the additive typed `harmonicProfile.cymaticSpheres` projection on the existing `profile.update` generation clock; no new RPC method or gateway-contract registry entry is introduced. Canon update flag: [[S3-SPEC]], [[S0-SPEC]], [[M2'-SPEC]].
- Does NOT own coordinate semantics or domain law for other layers, and does NOT own M' shell authority: agent dispatch lives at [[S4-SPEC]], knowledge graph at [[S2-SPEC]], world-return canon at [[S5-SPEC]], and the active M' shell at [[M'-SYSTEM-SPEC]] / `Body/M/pratibimba-app`. The S-coordinate is the conceptual law; physical residency here is convenience.

## Local Contracts
- Code Coordinate Headers: the Cargo.toml `description` of each crate above (no `src/lib.rs //!` headers present).
- Owning specs: [[S3-SPEC]], [[S3-ARCHITECTURE]].
- No CONTRACT.md exists at this level — see per-crate children + Canon.

## Work Guidance
- Run `gitnexus_impact` on a symbol before editing it; respect HIGH/CRITICAL warnings.
- `[[wikilink]]` all coordinate/spec/carrier/agent references in agent-authored artifacts.
- Vault writes use coordinate-prefixed `c_n_*` frontmatter.

## Verification
- `cargo test -p epi-s3-gateway` / `-p epi-s3-gateway-contract` / `-p epi-s3-redis-context` / `-p epi-s3-graphiti-runtime` per crate; or `make rust-test` from repo root.

## Child DOX Index
- `gateway/AGENTS.md` — `epi-s3-gateway`: session/transcript/workspace runtime primitives + product gateway parity.
- `gateway-contract/AGENTS.md` — `epi-s3-gateway-contract`: gateway protocol + method contract (protocol, session, temporal, verifier, release).
- `epi-spacetime-module/AGENTS.md` — `epi-spacetime-module`: SpacetimeDB WASM module for gateway/client/agent registration.
- `spacetime-context/AGENTS.md` — declarative SpacetimeDB schema artifacts for S3/S3' runtime persistence surfaces.
- `graphiti-runtime/AGENTS.md` — `epi-s3-graphiti-runtime`: Graphiti runtime adapter contracts + native client, with deprecated HTTP compatibility path (resides S3, actualises S5).
- `redis-context/AGENTS.md` — `epi-s3-redis-context`: Redis runtime context + RedisVL bridge residency contract.
- `epi-app/AGENTS.md` — deprecated `epi-electron` legacy parity reference. RETIRING — do not build on this; active M' shell authority is `Body/M/pratibimba-app`.
