# Bimba application contract and MCP compatibility boundary

Status: implementation contract for RECON-R3 / issue #5  
Bimba semantic implementation: `src/api/graph.ts` + existing coordinate/schema modules  
Application boundary: `src/application/`  
Modern adapter: `src/modern.ts` + `src/mcp/modern-server.ts`  
Legacy adapter: `src/legacy.ts` -> preserved v1 implementation in `src/index.ts`

## 1. Constitutional cut

Bimba is a domain/application service. MCP is one projection of it.

```text
Bimba identity / query / mutation / provenance
                  |
        BimbaApplicationService
           /                 \
MCP 2026-07-28           explicit legacy MCP
  curated tools         deployed 2025-era catalog
```

The application contract contains no JSON-RPC request id, MCP session id, tool name, HTTP route, or client runtime identifier. Future AIKit, Pi, DeepSeek Harness, and O:I/Cradle integrations should call this seam directly (or a language-neutral projection of it) rather than instantiate an internal MCP client.

This does **not** redesign the Bimba ontology. The existing coordinate syntax, canonical `:Bimba` graph label, UUID/name/property translation, search semantics, relationship vocabulary, and graph implementation remain the domain source of truth.

## 2. Pinned protocol evidence

The implementation was audited against the final official MCP 2026-07-28 specification and the official TypeScript SDK.

- Specification repository: `modelcontextprotocol/modelcontextprotocol`
- Dated specification tree: `docs/specification/2026-07-28/`
- Pinned spec-tree evidence commit: `db4bfcff3d60f5df01a21bdf6b78f7012cac4634` (2026-07-28)
- Official schema constant: `LATEST_PROTOCOL_VERSION = "2026-07-28"`
- Official TypeScript SDK repository: `modelcontextprotocol/typescript-sdk`
- Pinned protocol-version documentation evidence: `faa7e2b47090219060c0699bfe49ebe011516bce`
- Modern server package: `@modelcontextprotocol/server@2.0.0`
- Modern client conformance package: `@modelcontextprotocol/client@2.0.0`
- Existing legacy SDK resolved by the repository before this change: `@modelcontextprotocol/sdk@1.25.3`; it is now pinned rather than left behind `^1.0.0`.

Protocol consequences applied here:

1. `2024-10-07` through `2025-11-25` are the initialize/session-era family (the SDK calls it `legacy`).
2. `2026-07-28` is the stateless/self-contained era (the SDK calls it `modern`).
3. Modern requests carry protocol version and client capabilities in per-request `_meta`; no prior request is authority for the next one.
4. `server/discover` is the modern discovery surface. It is optional for clients but is the normal SDK negotiation probe.
5. `serveStdio(factory)` is the v2 stdio entrypoint for the modern era. This server uses `{ legacy: 'reject' }` deliberately.
6. An unsupported modern protocol revision is `-32022`; HTTP header/body routing disagreement is `-32020` and HTTP 400.
7. Client identity metadata is self-reported and is not an authorization primitive.
8. Extensions are opt-in through per-request capability declarations and server discovery. This adapter declares no extensions.

## 3. Actual legacy contract found in this repository

The live project-level client fixture is root `.mcp.json`. Before RECON-R3 it launched `dist/index.js` over stdio with Neo4j environment settings. No repository callers naming Bimba MCP tools were found, so this checked-in launch configuration plus the server's advertised catalog is the concrete compatibility contract.

The pre-change package resolved `@modelcontextprotocol/sdk@1.25.3`. The preserved server advertises these 19 legacy tools:

```text
resolve_coordinate
semantic_search
get_context
list_coordinates
graph_query
graph_traverse
graph_traverse_positions
graph_context
spec_retrieve
graph_search
graph_embed
graph_validate
graph_sync
graph_chunk
graph_rerank
telegram_send_message
telegram_get_recent_messages
telegram_reply
graph_admin
```

`tests/legacy-client.mjs` launches the explicit legacy adapter with the pinned v1 client and proves that exact catalog.

Root `.mcp.json` now launches `dist/legacy.js`. It gives the historical project-local client an explicit principal and explicit read/write/admin grant, preserving the formerly unrestricted local behavior as an authorization decision rather than as an accidental property of being connected.

Unconfigured adapters default to `bimba:read` only.

## 4. Language-neutral Bimba application surface

### BimbaRef

```text
coordinate(value)
uuid(value)
name(value)
```

A Bimba ref has Bimba meaning only. It never contains an MCP request id, transport session, HTTP path, model id, or harness id.

### Authority

```text
BimbaAuthority {
  runtimePrincipal
  permissions: bimba:read | bimba:write | bimba:admin
  agentIdentity?       # lineage/provenance only
}
```

Invariant:

```text
runtime principal != Agent identity
Agent identity does not grant permissions
```

### Query

Current canonical operations exposed by the seam:

```text
get(BimbaRef.coordinate, query options, authority)
search(query, search options, authority)
```

Both require `bimba:read`.

### Mutation

The first mutation admitted through the seam is deliberately narrow:

```text
storeEmbedding(BimbaRef.uuid, text/task/dimensions, authority)
```

It requires `bimba:write` before the Neo4j backend is invoked. This represents a currently existing legal Bimba mutation rather than inventing a generic graph write API.

Administrative graph operations are not automatically promoted to canonical application mutations.

### Provenance

Every application result carries:

```text
source = bimba
operation
runtimePrincipal
agentIdentity?          # descriptive lineage
observedAt
promotion = none
```

`promotion = none` is load-bearing: returned graph material is not automatically AIKit Context, Project Canon, or any other higher-order accepted truth.

## 5. Modern MCP 2026-07-28 projection

The modern adapter exposes only:

```text
bimba_get
bimba_search
bimba_store_embedding
```

There are no modern Bimba resources or prompts at this stage and no extensions are declared. The SDK therefore discovers only the capability actually implemented.

The modern stdio executable is:

```text
dist/modern.js
```

It is intentionally strict-modern. A 2025 initialize-era client is rejected rather than silently reinterpreted.

Authorization for local stdio is supplied out of band by the launcher environment, consistent with the MCP authorization guidance for stdio. The connection itself is not authority.

## 6. Explicit legacy projection

The legacy executable is:

```text
dist/legacy.js
```

It is a protocol/authorization adapter in front of the preserved v1 implementation (`dist/index.js`). The old server code and its 19 tool definitions remain intact.

The adapter rejects:

- `server/discover` on the legacy route;
- any request explicitly declaring `2026-07-28` in modern request metadata.

It returns `-32022` with the supported legacy revision family instead of allowing hybrid interpretation.

Before forwarding `tools/call`, it classifies required Bimba authority:

```text
graph_admin                         -> bimba:admin
graph_sync                          -> bimba:write
graph_chunk                         -> bimba:write
telegram_send_message               -> bimba:write
telegram_reply                      -> bimba:write
graph_embed + store_for             -> bimba:write
other legacy tools                  -> bimba:read
```

This preserves discoverability without equating discoverability with authorization.

## 7. Security invariants

The implementation and tests preserve:

```text
MCP connection != Bimba read authority
Bimba read != Bimba write
tool discoverable != Action authorised
runtime principal != Agent identity
returned Bimba material != AIKit Context/canon
modern protocol != legacy protocol
```

The adapters also avoid reflecting backend/provider exceptions across the modern MCP tool surface because such exceptions may contain connection/provider detail. Neo4j's connection manager already exposes a password-free configuration view; protocol errors do not serialize environment credentials.

## 8. Future direct integrations

### AIKit

Implement a `KnowledgeProvider`/Context-source adapter over `BimbaApplicationService` (or its later stable library package). It should convert selected Bimba results into AIKit evidence/context only through AIKit's own trust/promotion rules.

### Pi

Implement a Pi extension which calls the direct application seam. MCP remains available for external/general hosts; Pi does not need to impersonate an MCP client inside the same product boundary.

### DeepSeek Harness

Implement a harness component that accepts the same `BimbaRef`, authority and result/provenance envelopes. Model identity may be recorded as lineage but must not become write authority.

### O:I / Cradle

Consume the language-neutral service as a project/domain capability. Cradle contribution/admission remains a separate authority boundary: a Bimba return is not contribution admission and a Bimba mutation permission is not Cradle authority.

## 9. Conformance evidence

Automated tests cover:

- application/domain tests independent of MCP;
- representative read;
- representative authorised write;
- unauthorised write denial before backend invocation;
- no hidden authorization state after a prior privileged call;
- agent identity cannot produce authority;
- modern discovery/version negotiation via the official v2 client;
- exact modern curated tool list;
- no modern resource/prompt capability where none is implemented;
- modern HTTP protocol/header substitution rejection;
- undeclared extension capability cannot alter Bimba discovery;
- malformed modern request does not dispatch Bimba;
- legacy era detection and modern/legacy isolation policy;
- mutation/tool substitution classification;
- exact 19-tool legacy fixture via the pinned v1 SDK client.

The root repository CI workflow `bimba-mcp-conformance.yml` is the release gate for this work. Issue #5 should remain open unless the receipt-bearing branch head passes that workflow.
