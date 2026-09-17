# AGENTS.md — bimba-mcp

## Purpose
The `bimba-mcp` Node/TypeScript **MCP server**: the tool surface through which agents read, search, traverse, and (CRUD) mutate the **Bimba coordinate graph** held in Neo4j. It is a thin external *consumer* of the S2 GraphDB substrate that exposes coordinate semantics over the raw store — i.e. it actualises **S2'** (semantic graph access) on top of the S2' Neo4j substrate; it does not define graph law.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] → [[S2-SPEC]] → [[S2-ARCHITECTURE]]. Substrate/registry law lives in sibling `graph-schema/` + `graph-services/`, never restated here.

## Ownership
- `src/index.ts` — server entry; registers **30 tools** (21 curated + 9 raw) + resources + the Neo4j connection lifecycle. On startup it hydrates `GEMINI_API_KEY`/`GEMINI_EMBEDDING_MODEL`/`GEMINI_EMBEDDING_OPT_IN` from the user's login shell (`$SHELL -lic`) so a key exported in `~/.zshrc` is picked up even though GUI launchers don't inherit it; a present key auto-enables opt-in. Curated: `resolve_coordinate`, `list_coordinates`, `get_context`, `graph_query`, `graph_traverse`, `graph_traverse_positions`, `graph_context`, `graph_search`, `semantic_search`, `spec_retrieve`, `graph_disclosure`, `graph_embed`, `graph_embed_batch`, `graph_chunk`, `graph_sync`, `graph_validate`, `graph_admin`, `graph_rerank`, telegram_*. Raw/open-schema (escape hatch): `graph_cypher`, `graph_schema`, `graph_upsert_node`, `graph_set_property`, `graph_add_label`, `graph_remove_label`, `graph_create_relationship`, `graph_delete_relationship`, `graph_delete_node`.
- `src/db/neo4j.ts` — `Neo4jConnectionManager` singleton (`getNeo4jConnectionManager`, `executeRead`/`executeWrite`, session pooling, retry, health).
- `src/api/graph.ts` — query/traverse/context/spec/search/disclosure/embed/chunk/admin implementations + `mapNeo4jNode` node serializer.
- `src/api/graph-crud.ts` + `src/schemas/graph-crud.ts` — the raw Cypher + CRUD + introspection layer (`runCypher`, `upsertNode`, `setProperty`, `setLabels`, `createRelationship`, `deleteRelationship`, `deleteNode`, `graphSchema`) and its pure, unit-tested guards (`sanitizeIdentifier`, `screenReadOnly`, `serializeValue`, `buildLocator` — see `graph-crud.test.ts`). Values are always `$param`-bound; only allowlisted identifiers are interpolated. Added 2026-06-17.
- `src/coordinates/{parser,syntax}.ts` — coordinate string parsing/validation. `src/schemas/` — zod IO contracts. `src/{chunking,embeddings,llm,reranking,validation,telegram}/`.
- Does **NOT** own coordinate semantics or graph contracts: the canonical relationship registry + schema law is `Body/S/S2/graph-schema/src/lib.rs` (`RELATIONSHIP_TYPE_SPECS`); the service surface is `graph-services/`. This crate is a consumer of that law, not a second copy of it.

## Local Contracts
- **Startup MUST connect.** `main()` calls `getNeo4jConnectionManager().connect()` (wrapped, non-fatal) **before** `server.connect(transport)`. Without it the driver stays `null`, `isConnected()` is `false`, and every tool throws `"Not connected to Neo4j"`. This is a regression guard — do not remove. (Restored 2026-06-17.)
- **`coordinate` is the one exempt unprefixed property** = the Bimba ground reference. Every other node property is `{family}_{n}_{semantic}` (e.g. `c_1_name`, `c_2_uuid`, `c_1_description`, `c_4_family`, `c_4_ql_position`). See the frontmatter key law in [[CLAUDE]].
- **Relationship taxonomy is named & correspondential, not positional.** The live graph carries ~1,400 semantic rel types (`HAS_INTERNAL_COMPONENT`, `OPERATES_IN`, `LINE_CHANGE`, `MANIFESTS`, `BEDROCK`, `FAMILY_CONTAINS`, `INVERTS_TO`, `REFLECTS_AS`, `MOBIUS_RETURN`…). The `POS0_LINKS_TO`…`POS5_INTEGRATES` scheme is **fictional / retired** — canon ([[S2-ARCHITECTURE]], `graph-schema/src/lib.rs` `relationship_spec`) marks `POSn_*` `compatibility:true` and rejects it as a canonical output. Never traverse or bucket by `POSn_*`.
- Owning specs: [[S2-SPEC]], [[S2-ARCHITECTURE]]. No CONTRACT.md at this level — see parent [[../AGENTS.md]] + canon.
- Code Coordinate Header: `src/index.ts` doc-header + `src/schemas/*.ts` IO schemas.

## Dev Intent — Open-Schema Doctrine
The Bimba graph is the **source of truth; the code's assumptions are not.** This MCP is a surface for *exploring and honing access patterns over time* across many coordinate / property / relation types — not a frozen curated API. When changing tools, lead with this intent:

1. **Discover, never assume.** Read the live schema (`graph_admin` schema ops, `CALL db.labels()`, `CALL db.relationshipTypes()`, `keys(n)`) before encoding any label, property key, or relationship type. The cautionary tale: the original `POSn_*` traversal matched **0 edges** because it was invented, never written by the importer.
2. **Prefix-agnostic retrieval; prefix stays load-bearing.** Resolve core roles (name/description/uuid/content) by exact key *then* by suffix regardless of `{family}_{n}_` prefix, so the prefix never *gates* a lookup — yet it remains present (grouped views, family tie-break) for structured/intelligent use. The prefix is a lens, not a lock.
3. **Favor raw CRUD + Cypher.** Prefer thin schema-agnostic primitives (`graph_cypher`, upsert/set-property/label/relationship/delete, `graph_schema`) that let an operator reach any property/label/relationship and mutate freely, over narrow curated readers that bake in a guessed shape. Curated tools = shaped reads of *known* coordinates; raw tools = exploration + mutation.
4. **Coordinate-prefix law available, not enforced.** Locate/merge by `coordinate` by default and teach the convention via examples, but never reject a property key for not matching it. Exploration must not be blocked.
5. **Don't relocate graph law here.** Relationship/schema semantics belong to [[S2-ARCHITECTURE]] + `graph-schema`. Surface them; don't fork them.

**Code style:** always bind **values** as `$params` — never string-interpolate user input; only *identifiers* (labels, rel types, property keys) may be interpolated and only through a strict `/^[A-Za-z_][A-Za-z0-9_]*$/` allowlist. One connection-manager singleton. Register tools via `server.tool(name, desc, ZodSchema.shape, handler)` returning `{content:[{type:'text', text: JSON.stringify(...)}]}`; throw `McpError`. Schema changes are **additive** — preserve the synthesized back-compat keys (`uuid`/`title`/`coordinate`/`file_path`) that `index.ts` reads.

## Schema-drift remediation (live graph: 2387 nodes, 2091 coordinate-bearing, 330 labels, ~1,417 rel types)

**Fixed 2026-06-17:**
- **Connection** — `main()` now calls `connect()` before serving (was the "can't connect" root cause).
- **Read-path crashes (made M-coordinate lookup impossible on Neo4j 5):** `LIMIT $param` now wraps `neo4j.int()` everywhere (JS numbers marshalled as floats → rejected); `coordinateToFilter` no longer mis-reads `M1-0` as the illegal range `[1-0]` (paths are prefix-matched); variable-length `[rel:*1..N]` → valid `[rel*1..N]` in `context`/`traverse`/`spec`/`getFullContext`.
- **Open-schema property access** — `buildNodeRef` + `src/api/property-roles.ts` resolve name/description/uuid prefix-agnostically and attach `roles` + `by_family` views; the ~8 duplicated coalesce blocks now route through it. (`title` from `c_1_name`, rich `c_*`/`t_*`/`l_*` data surfaced instead of buried.)
- **Rel-type traversal** — the fictional `POSn_*` scheme is gone. `graph_context` groups neighbors by actual `type(rel)` + accepts a `rel_types` filter (entity-match OR now parenthesized so the filter binds); `graph_traverse_positions` takes a `rel_type_sequence`; `graph_disclosure` L4 groups by real rel type; the `bimba://schema/relationships` resource documents the real named/correspondential families.
- **`graph_validate`** — rewritten: scoped to `:Bimba`, prefix-aware uuid/title reads, Cypher-5 `IS NOT NULL` (no `EXISTS()` crash), dropped the bogus relationship-type allowlist (vocabulary is open), recognizes `Family_*`/`Weave_*` structural coords, and a single embedding-coverage summary instead of a per-node flood. On the live graph: passed, 0 errors, 0 warnings, surfaces genuine orphan nodes.
- **`graph_admin stats`** — valid Cypher (`UNWIND labels(n)` / implicit grouping; no `GROUP BY`); counts returned as JS numbers (not Integer objects). `create_index` now targets `:Bimba`.
- **`spec()`** — coordinate extraction reads the real `coordinate` string (no phantom `properties['C']`); marked `@deprecated` (the `spec_retrieve` tool routes to the canon adapter).
- **`#`-coords** — `queryByCoordinate` no longer rewrites `#`/`#0..#5` to `M`, so the raw archetype nodes are reachable by their literal coordinate and `#` ≠ `M` is preserved.
- **`graph_chunk`** — chunk nodes inherit the parent's canonical `coordinate` string instead of phantom `c.C`/`c.P`/… numeric props.
- **Embedding pipeline aligned to canon + standalone (2026-06-17).** The MCP now reads/writes the real embedding scheme — **`:Bimba.c_5_embedding`, 3072-dim, the `coord_embedding` cosine index** — parallel to (not coupled with) the epi-gnostic pipeline:
  - `graph_embed` writes `c_5_embedding` as a NATIVE float list via `db.create.setNodeVectorProperty` (was a JSON string on `embedding`); default dims 3072; metadata on `c_5_embedding_*`.
  - `graph_search`/`semantic_search` do TRUE vector search: embed the query (same Gemini client) → `db.index.vector.queryNodes('coord_embedding', …)`. `vector_only` is pure cosine; `hybrid_rrf`/`hybrid_weighted` RRF-fuse vector + graph (degrade to graph if embeddings/API unavailable). Also fixed `size(()--(node))` → `COUNT { (node)--() }` (Neo4j-5 removed the former, so graph/hybrid search threw).
  - `graph_admin create_index` defaults to recreating `coord_embedding` on `c_5_embedding` @ 3072.
  - **`graph_embed_batch`** embeds focused node sets standalone — by coordinate branch (`coordinate_prefix`, e.g. `"M1"`), by `label`, and/or `only_missing` — composing each node's embedding text from its resolved name/description + rich `{family}_{n}_` string fields. Re-runnable (`only_missing` skips done nodes); bounded by `limit` (≤500). This is the MCP's own population path, parallel to epi-gnostic.
  - **Portable**: key auto-resolved from the login shell at startup, or via env — `GEMINI_API_KEY` + `GEMINI_EMBEDDING_MODEL` (+ implicit opt-in). No `~/.epi-logos/config.toml` required (retry/limit params default; BLAKE3 hashing falls back to SHA-256 on Node builds without blake3). `GEMINI_EMBEDDING_BACKEND=mock` for offline/dev. **You must export `GEMINI_EMBEDDING_MODEL`** (the key alone isn't enough) — set it to the same model used for the canonical vectors so query/doc embeddings stay compatible.
  - Verified live: the 84 pre-embedded nodes are queryable (self-query ~1.0); full embed→store→`vector_only` round-trip returns the node at cosine 1.0; `graph_embed_batch` embeds a branch into native 3072 `c_5_embedding` lists and `only_missing` re-runs cleanly.

**Still open (data, not code):**
- **Bulk population**: only ~84/2090 `:Bimba` nodes are embedded. Fill the rest by running `graph_embed_batch` per branch (with a real `GEMINI_API_KEY` + `GEMINI_EMBEDDING_MODEL`) or the epi-gnostic pipeline. No `:Chunk` nodes exist yet, so chunk-aware search stays empty until that pipeline runs.

## Work Guidance
- Run `gitnexus_impact` on a symbol before editing it; respect HIGH/CRITICAL warnings. `[[wikilink]]` all coordinate/spec/carrier/agent references in agent-authored artifacts.
- Requires `node >=20.0.0`. Build with `npm run build` (tsc) before running `dist/index.js`; **the Claude Desktop MCP loads `dist/`, so restart the app to pick up a rebuild.**
- Live DB recon (read-only, AUTH=none on the docker container): `docker exec epi-neo4j cypher-shell --format plain "<CYPHER>"`. The container maps `7474:7474` + `7687:7687`; the MCP env points at `bolt://127.0.0.1:7687` with empty password (correct for `NEO4J_AUTH=none`).

## Verification
- `npm test` (vitest) and `npm run typecheck` (`tsc --noEmit`) in this dir.
- Smoke-check connectivity after a change: rebuild, then confirm `dist/index.js` logs `[bimba-mcp] Connected to Neo4j at bolt://…` on startup (or the explicit WARNING if the DB is down).

## Child DOX Index
- (leaf)
