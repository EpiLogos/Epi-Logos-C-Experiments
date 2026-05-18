---
coordinate: "S/S'"
c_4_artifact_role: "spec"
c_1_ct_type: "CT1"
c_3_created_at: "2026-04-27T00:00:00Z"
c_0_source_coordinates:
  - "[[S-SYSTEM-INDEX]]"
  - "[[S-CODE-RESIDENCY-AUDIT]]"
  - "[[S-AD-HOC-ROADMAP]]"
  - "[[FLOW 2026 04 22 SYSTEMS RESIDENCY AND LATTICE NAMING]]"
  - "[[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]]"
---

# S/S' Code Residency Plan

## Status

This is the S-level source residency specification for the active codebase. It sits above the six level specs and tells implementation where code should live as the system moves from specification into development.

The core decision is a three-plane repo:

| Plane | Path | Role |
|---|---|---|
| Vault plane | `Idea/` | Markdown/canvas/spec/reflection/runtime note field. This remains mostly non-code. |
| Body plane | `Body/` | Active source-code embodiment of the S/S' system. |
| Runtime/tool plane | dot-directories and optional `Run/` | Generated state, tool compatibility shims, caches, logs, synced agent runtimes. |

This avoids polluting the vault with active packages while preserving vault residency as a meaningful philosophical and operational fact. `Idea/Pratibimba/Self` can still be the PI agent's reflected self-residency; it does not need to contain the actual TypeScript extension source. That embodied source belongs under `Body/S/S4/pi-agent`, with `.pi` retained only as a tool-facing source shim or generated sync root if needed.

## Residency Kinds

The earlier plans sometimes blurred three different meanings of residency. This spec separates them:

| Residency kind | Meaning | Example |
|---|---|---|
| Vault residency | Where the artifact's meaning is reflected in [[Idea]] | PI agent self-reflection in `Idea/Pratibimba/Self` |
| Source residency | Where active code packages live | `Body/S/S4/pi-agent` |
| Runtime residency | Where generated state, logs, sessions, caches, or synced copies live | `.epi/agents/<id>/agent`, `.epi/gate`, future `Run/` |

Rules:

- Vault residency records meaning, reflection, plans, specs, ledgers, and review artifacts.
- Source residency holds code that is built, tested, imported, or packaged.
- Runtime residency holds state that can be regenerated or is produced by running systems.
- Compatibility roots such as `.epi`, `.codex`, and `.omx` may remain at repo root while tools require them, but they must be classified as source, package, shim, or runtime. Root `.pi` and `plugins` are no longer source authorities after the Body move; their source/package homes are `Body/S/S4/pi-agent` and `Body/S/S4/plugins`.

## Body Target Layout

Recommended target source tree:

```text
Body/
  S/
    S0/
      epi-cli/
      epi-lib/
      portal-core/
      tools/
    S1/
      hen-compiler/
      vault-bridge/
    S2/
      graph-schema/
      graph-services/
      external/
        bimba-mcp/
    S3/
      gateway/
      redis-context/
      graphiti-runtime/
      epi-spacetime-module/
      epi-app/
    S4/
      agent-runtime/
      pi-agent/
      ta-onta/
        S4-0p-khora/
        S4-1p-hen/
        S4-2p-pleroma/
        S4-3p-chronos/
        S4-4p-anima/
        S4-5p-aletheia/
      plugins/
        pleroma/
    S5/
      epi-gnostic/
      plugins/
        epi-logos/
      autoresearch/
      nara/
      vimarsa/
      notebooklm/
```

This tree is not meant to force every code file into a different package immediately. It is the target map. Existing packages can move as packages first, then split internally only when tests and imports make the split honest. The important S4 correction is that [[ta-onta]] is not a generic PI source folder: it is the [[S4']] API/extension surface itself, internally differentiated as [[S4.0']] through [[S4.5']].

## Prime Internalization Rule

Every Sx' code area must preserve its internal `.0'` through `.5'` structure in its source layout, README map, or package manifest. Prime levels are not flat feature buckets.

Filesystem paths should avoid apostrophes where toolchains dislike them, so source folders may use `0p` through `5p` or `Sx-0p` through `Sx-5p`, with README frontmatter/wikilinks naming the real coordinate:

| Coordinate | Filesystem-safe form |
|---|---|
| `S4.0'` | `S4-0p-khora` |
| `S4.1'` | `S4-1p-hen` |
| `S4.2'` | `S4-2p-pleroma` |
| `S4.3'` | `S4-3p-chronos` |
| `S4.4'` | `S4-4p-anima` |
| `S4.5'` | `S4-5p-aletheia` |

This rule applies beyond S4'. S0' through S5' each need their own internal 0-5 articulation when implementation begins. The body tree should make that depth visible rather than hiding it in prose.

## Coordinate Homes

### S0 / S0'

Target source home: `Body/S/S0`.

Owns:

- `epi-cli` as command/control-plane package.
- `epi-lib` as C/M-family ground engine.
- `portal-core` as the shared Rust math/runtime mirror for portal, TUI, and future desktop surfaces.
- S0 tools and command helpers.
- Compatibility shims that make the rest of S executable.
- The first executable [[Kernel]] body: QL/MEF meta-layer math, bioquaternionic state, epogdoon tick law, harmonic ratios, resonance-vector indexing, and C/Rust/FFI exposure.

Current roots to migrate:

- `epi-cli/` -> `Body/S/S0/epi-cli/`
- `epi-lib/` -> `Body/S/S0/epi-lib/`
- `tools/` -> `Body/S/S0/tools/`, except tools with clearer Sx ownership.
- `src/qv_data.c` -> `Body/S/S0/epi-lib/` or retired into a non-code seed artifact after dependency proof.

Important nuance: `epi-cli` contains modules for every level. Its package residency is S0 because CLI is the executable return surface. Its internal modules must still be indexed by their owning coordinate: `gate` is S3, `agent` is S4, `graph` is S2, `nara` is S5/M4, and so on.

Kernel nuance: envelope/API/TypeScript contracts should not become a second kernel. They should expose the QL/MEF computational meta-layer that is actually computed in `epi-lib` and mirrored in Rust. The kernel's mathematical authority begins in the deep C substrate, passes through Rust/FFI/runtime surfaces, and only then appears as API/envelope shape.

### S1 / S1'

Target source home: `Body/S/S1`.

Owns:

- Hen compiler source.
- Vault bridge code.
- Frontmatter/schema implementation mirrors.
- CT template/residency compilers.

Current roots to migrate:

- `epi-dev-vault/` -> `Body/S/S1/hen-compiler/`, after renaming package identity away from `llm-personal-kb`.
- `Body/S/S0/epi-cli/src/vault/` may remain inside `epi-cli` initially, but its coordinate authority is S1/S1'.
- `Body/S/S4/ta-onta/S4-1p-hen/` is inhabited PI/ta-onta code, while Hen schema authority remains S1'.

Vault residency:

- `Idea/` remains S1's material vault.
- Active code should not be placed under `Idea/Pratibimba/System` merely because it is system-related. Use vault pointers, specs, manifests, and reflections there instead.

### S2 / S2'

Target source home: `Body/S/S2`.

Current post-move state: `Body/S/S2` contains `external/bimba-mcp` only. The real Parashakti/GraphRAG substrate exists, but it is still physically resident inside the S0 CLI package at `Body/S/S0/epi-cli/src/graph`. That is acceptable only as a first move: the code is coordinate-owned by S2/S2' even while package-resident under S0.

Owns:

- Graph schema authority.
- Neo4j service/bootstrap code.
- Coordinate graph query/retrieval law.
- External graph adapters.

Locked graph target:

- Node label: `:Bimba`.
- Embedding dimension: 3072.
- Historical labels/properties such as `:BimbaNode`, `:BimbaCoordinate`, `bimbaCoordinate`, and 768-dim indexes are migration/compatibility concerns only.

Current roots to migrate:

- `bimba-mcp/` has moved to `Body/S/S2/external/bimba-mcp/`.
- S2 graph schema is currently scattered in `Body/S/S0/epi-cli/src/graph`, `Body/S/S5/epi-gnostic/cypher`, and `Body/S/S2/external/bimba-mcp`; consolidate authority under `Body/S/S2/graph-schema/`.
- `Body/S/S0/epi-cli/src/graph/` may remain inside `epi-cli` physically during the first move, but its code must conform to the S2 graph authority and should later thin into CLI wrappers over S2 graph-service modules.

Redis rule:

- Redis is not treated as an S2 owner merely because graph workflows use cache.
- S2 can consume Redis-backed graph cache handles, but live session/context Redis belongs to S3'.

### S3 / S3'

Target source home: `Body/S/S3`.

Current post-move state: `Body/S/S3` contains `epi-app` and `epi-spacetime-module`. The gateway implementation is still physically resident at `Body/S/S0/epi-cli/src/gate`, and Graphiti compatibility controls are still there as well. Those are coordinate-owned by S3/S3' even while package-resident under S0.

Owns:

- Gateway control plane.
- Session, channel, transport, protocol, and parity surfaces.
- Redis-backed temporal/context state.
- Graphiti temporal runtime integration.
- Presence and live-state projection.
- App bridge surfaces where their primary function is gateway/client connectivity.

Current roots to migrate:

- `epi-spacetime-module/` has moved to `Body/S/S3/epi-spacetime-module/`.
- `epi-app/` has moved to `Body/S/S3/epi-app/` unless later split.
- `Body/S/S0/epi-cli/src/gate/` remains inside `epi-cli` at first but is coordinate-owned by S3 and should later thin into CLI wrappers over S3 gateway modules.
- Redis context code should move conceptually and then physically toward `Body/S/S3/redis-context/`.
- Graphiti target integration belongs under `Body/S/S3/graphiti-runtime/`; current HTTP wrapper and `epi gate graphiti` controls are compatibility adapters, not target architecture.

Runtime residency:

- `.epi/gate` is runtime state, not source.
- Future `Run/epi/gate` may be cleaner, but only if tooling can be migrated without churn.

### S4 / S4'

Target source home: `Body/S/S4`.

Current post-move state: root `.pi` and `plugins` shims have been removed. PI source is `Body/S/S4/pi-agent`; ta-onta source is `Body/S/S4/ta-onta`; package/plugin source is `Body/S/S4/plugins`.

Owns:

- PI agent embodied source.
- [[ta-onta]] operational package as the S4' API/base surface.
- Agent runtime, provider/model/auth shape, teams, skills, hooks, plugin packaging.
- Anima/VAK/Psyche source surfaces.

Current roots to migrate:

- `.pi/` has moved to `Body/S/S4/pi-agent/` as target source.
- `.pi/extensions/ta-onta/` has moved to `Body/S/S4/ta-onta/` with internal S4.0'-S4.5' module folders.
- `plugins/pleroma/` has moved to `Body/S/S4/plugins/pleroma/` as package/install surface.
- `Body/S/S0/epi-cli/src/agent/` remains inside `epi-cli` at first but is coordinate-owned by S4.

Compatibility:

- Keep root `.pi` as a shim, generated copy, or source mirror only while PI tooling requires `.pi` at repo root.
- Keep `.epi/agents` as runtime output only.
- Do not store active PI extension source in `Idea/Pratibimba/Self`; store reflection, session ledgers, review notes, and pointers there.

Pleroma nuance:

- Pleroma's wider analogy is S2/S2' operation, but inside ta-onta it is specifically [[S4.2']].
- It is the S4' skill/primitive/capability operation carrier.
- The intended Pleroma runtime lineage is the fork/raising of [[oh-my-codex]] into Epi-Logos form. `vendors/oh-my-codex/` remains the upstream/fork ancestor; `Body/S/S4/ta-onta/S4-2p-pleroma/` is where that lineage becomes canonical Pleroma rather than a loose adapter.
- External portable Pleroma packages may exist, including a Codex/OMX adapter at `Body/S/S4/plugins/pleroma/`, but the ta-onta Pleroma module is not an independent S2 source home and is not reducible to plugin packaging.

### S5 / S5'

Target source home: `Body/S/S5`.

Owns:

- Epii world-return and improvement spine.
- epi-logos plugin source.
- Gnosis/RAG-Anything/LightRAG service package.
- Nara/Epii-facing M' world-return surfaces.
- Vimarsa/kbase/NotebookLM bridges where retained.
- Autoresearch as Epii's self-improvement loop.
- Review inbox implementation.

Current roots to migrate:

- `epi-gnostic/` has moved to `Body/S/S5/epi-gnostic/`, while graph schema authority still needs extraction to S2.
- `vendors/autoresearch/` remains vendor source, but canonical Epii integration should live under `Body/S/S5/autoresearch/` as wrapper/config/tests.
- `_staging/epi-logos-plugin/` is only a sketch. The real target is `Body/S/S5/plugins/epi-logos/`, from the external plugin source when available.
- `Body/S/S0/epi-cli/src/nara/`, `Body/S/S0/epi-cli/src/vimarsa/`, `Body/S/S0/epi-cli/src/book/`, and `Body/S/S0/epi-cli/src/notebook/` remain CLI mirrors in the S0 package but are coordinate-owned by S5/M4/M5 surfaces.

Vault residency:

- Epii review, human validation gates, Sophia disclosures, Nara/PASU reflections, and promotion decisions should land in `Idea/Pratibimba/Self` and `Idea/Bimba/Seeds` as markdown artifacts.
- The active plugin and service code should live in `Body/S/S5`.

## Root Directory Disposition

| Current root | Target disposition |
|---|---|
| `Idea/` | Keep as vault. Mostly markdown/canvas/reflection/spec. |
| `epi-cli/` | Moved to `Body/S/S0/epi-cli`; root shim removed. |
| `epi-lib/` | Moved to `Body/S/S0/epi-lib`; root shim removed. |
| `epi-dev-vault/` | Moved/renamed to `Body/S/S1/hen-compiler`; root shim removed. |
| `bimba-mcp/` | Moved to `Body/S/S2/external/bimba-mcp`; root shim removed. |
| `epi-gnostic/` | Moved to `Body/S/S5/epi-gnostic`; graph schema code still needs extraction to S2. |
| `epi-spacetime-module/` | Moved to `Body/S/S3/epi-spacetime-module`; root shim removed. |
| `epi-app/` | Moved to `Body/S/S3/epi-app`; root shim removed. |
| `.pi/` | Source moved to `Body/S/S4/pi-agent`; root shim removed. |
| `.epi/` | Runtime state only; no source residency. |
| `plugins/` | Package/install surface moved under `Body/S/S4/plugins`; future S5 plugin packages live under `Body/S/S5/plugins`. |
| `tools/` | Move to `Body/S/S0/tools` or per-level tool folders. |
| `src/` | Remove as root source ambiguity after `qv_data.c` disposition. |
| `_staging/` | Salvage/retire; not a system home. |
| `_tmp_taonta_analysis/` | Archive/delete after confirming useful facts are absorbed. |
| `vendor/`, `vendors/` | External dependency/vendor basis; not coordinate embodiment except through wrappers under `Body`. |
| `.codex`, `.claude`, `.omx`, `.depwire`, `.gitnexus` | Tool/runtime support; not S/S' source residency. |

## First Implementation Wave

### 1. Create the Body skeleton

Create `Body/S/S0` through `Body/S/S5` plus `Body/README.md`.

Do not move packages yet. The first change establishes target space and README law so future moves have a declared home.

### 2. Add compatibility strategy

For each root expected by tools:

- `.pi`
- `.epi`
- `plugins`
- `epi-cli`
- `epi-app`
- `bimba-mcp`

decide one of:

- root remains source until package move is complete;
- root becomes symlink to `Body/...`;
- root becomes generated mirror;
- root remains runtime only.

### 3. Correct conformance before broad movement

The first real code corrections should be:

- S3 Redis/context ownership and naming.
- S2 graph schema conformance to `:Bimba` + 3072.
- S1 frontmatter Rust/TS parity.
- S4 `.pi` source/runtime/package lifecycle.
- S5 epi-logos plugin/autoresearch/review inbox scaffold.

### 4. Move packages in dependency order

Move in this order:

1. Low-dependency support: `tools`, `src/qv_data.c` disposition.
2. Leaf packages: `epi-spacetime-module`, `bimba-mcp`, `epi-dev-vault`.
3. App/service packages: `epi-app`, `epi-gnostic`.
4. Agent source/package: `Body/S/S4/pi-agent`, `Body/S/S4/plugins/pleroma`.
5. CLI last or with root shim: `epi-cli`, because it references everything.

Current status: this move order has been executed for the first package-level Body move. The next pass is not another root move; it is module extraction and path conformance inside the Body tree.

Every move must have before/after real tests. Mock-only tests do not prove residency.

## Design Consequence

`Body/` is not a new abstraction layer. It is the code-body of the existing S/S' system. It lets the vault stay clean while allowing source layout to mirror the coordinate system.

The ideal final repo reads as:

- `Idea/` tells what the system means.
- `Body/` holds how the system is built.
- runtime roots show what the system is doing now.
