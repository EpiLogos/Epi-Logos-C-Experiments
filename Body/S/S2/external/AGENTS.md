# AGENTS.md — external

## Purpose
Vendored external integrations for the S2 GraphDB substrate: the `bimba-mcp` Node MCP server ("MCP server for Bimba coordinate system and Neo4j knowledge graph access").
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S2-SPEC]]

## Ownership
- `bimba-mcp/` — vendored Node/TypeScript MCP server (`package.json` name `bimba-mcp`); `src/index.ts` is the server entry ("Model Context Protocol server for accessing the Bimba coordinate system and Neo4j knowledge graph. Provides tools for coordinate resolution, semantic search, and context retrieval"). Subsurfaces: `src/{api,chunking,coordinates,db,embeddings,llm,reranking,schemas,telegram,validation}/`, `src/schemas.ts`, `src/repo-paths.ts`; `evals/`, `dist/` build output, `CLAUDE_CODE_MCP.md` + `TELEGRAM_MCP.md` integration docs.
- Does NOT own coordinate semantics or the graph contracts: schema/registry law lives in sibling `graph-schema/` (`epi-s2-graph-schema`); the Neo4j+Redis service surface lives in sibling `graph-services/`; the Turtle ontology lives in sibling `ontology/`. This is a thin external consumer of that layer's law — domain law stays in S2's owning spec, not duplicated here.

## Local Contracts
- Code Coordinate Header: `bimba-mcp/src/index.ts` (`/** Bimba MCP Server ... */` doc-header) and `bimba-mcp/src/schemas.ts` (tool/IO schemas).
- Owning specs: [[S2-SPEC]], [[S2-ARCHITECTURE]].
- No CONTRACT.md at this level — see parent ([[../AGENTS.md]] not a coordinate) + Canon.

## Work Guidance
- Run `gitnexus_impact` on a symbol before editing it; respect HIGH/CRITICAL warnings.
- `[[wikilink]]` all coordinate/spec/carrier/agent references in agent-authored artifacts.
- `bimba-mcp` requires `node >=20.0.0`; build via `npm run build` (tsc) before running `dist/index.js`.

## Verification
- `npm test` (vitest) in `bimba-mcp/`; `npm run typecheck` (`tsc --noEmit`) for type-only checks.

## Child DOX Index
- (leaf)
