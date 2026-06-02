---
coordinate: "S1/S1'"
c_4_artifact_role: "spec"
c_1_ct_type: "CT1"
c_3_created_at: "2026-04-25T00:00:00Z"
c_0_source_coordinates:
  - "[[PROTOCOL S COORDINATE MODULE SPEC BUILD]]"
  - "[[S0-SPEC]]"
  - "[[FLOW 2026 04 24 PI AGENT API v0.1]]"
  - "[[FLOW 2026 04 25 TS INTERFACE DEFINITIONS]]"
  - "[[FLOW 2026 04 22 ENVELOPE FIELD SCHEMA]]"
  - "[[FLOW 2026 04 22 SYSTEMS RESIDENCY AND LATTICE NAMING]]"
  - "[[FLOW 2026 04 25 PI AGENT API AUDIT]]"
  - "[[S-SYSTEM-INDEX]]"
  - "[[S-SOURCE-TRACEABILITY-INDEX]]"
  - "[[S1]]"
  - "[[S1']]"
  - "[[S1'Cx]]"
---

# S1/S1' Specification: Vault Ground and Compiler Law

## Status

This is the consolidated S1-level master specification. It replaces the older scattered [[S1]], [[S1']], [[S1'Cx]], and S1-y/S1-y' files as the build reference for the vault layer.

S1 is the material [[Obsidian]] / filesystem substrate of [[Idea]]. It owns addressability: markdown files, folders, canvases, attachments, frontmatter text, wikilinks, and the concrete residency zones under [[Bimba]], [[Empty]], and [[Pratibimba]].

S1' is [[Hen]] as vault law. It owns the content contract: [[CT]] templates, canonical frontmatter, residency resolution, type-to-form movement, canvas/MOC generation, compiler ledgers, and retrieval/injection surfaces that let the vault participate in the wider [[Envelope]] without becoming merely a folder tree.

This level is being built around the compiler vendor as a foundation, not as an afterthought. The `Body/S/S1/hen-compiler/` compiler substrate, forked from `vendors/claude-memory-compiler/`, is the present local vendor basis for S1' work: its hook -> ledger -> compile -> inject spine, compile/query/lint scripts, and index-guided retrieval discipline are the starting material from which the canonical [[Hen]] compiler spine must be clarified. The target is not to preserve the vendor folder topology unchanged; the target is to keep its working four-seam body while raising it into typed ledger channels, CT-aware residency, API parity, and [[Envelope]] integration.

The decisive lift is residency. Vendor `daily/` is only a compatibility alias for canonical [[Day]] source material under `Idea/Empty/Present/{DD-MM-YYYY}/`, especially `daily-note.md` and session `now.md` artifacts. Vendor `knowledge/` is only a compatibility alias for compiled thought/crystallisation output under `Idea/Pratibimba/Self/Thought/T/T0` through `T5` and their prime inversions. Hen and [[Khora]] therefore outmatch the vendor by giving the compiler real vault law: source, compilation, query, and injection all resolve through S1 residency rather than through private vendor directories.

The vendor's use of the [[Claude Agent SDK]] is also a compatibility executor, not the canonical executor. The canonical S1' compiler invocation should be able to request enrichment from bounded PI agents. [[Hen]] supplies the job contract: canonical source paths, ledger channel, CT/frontmatter law, target residency, expected artifact form, review policy, and dry-run/mutation mode. [[Anima]] or [[Epii]] supplies the agentic executor according to the job's purpose. `vendor_claude_sdk` remains useful for Claude Code sessions; `pi_agent` is the target in-house route.

This means compiler build work should define a `SpineJob` / `CompilerInvocation` contract before non-dry-run enrichment is implemented. That contract must make executor kind, target agent, required plugin/skill body, tool boundary, and review destination explicit.

Canonical executable anchor: `Body/S/S1/hen-compiler-core` is now the Rust S1' Hen contract crate. It ports the Python dry-run planner with fidelity: canonical Day source resolution, T-lane artifact output, 12 ledger channels, QL-first compiler order, `CompilerInvocation`, `pi_agent` as canonical executor, [[Anima]] / [[Pleroma]] and [[Epii]] / [[epi-logos plugin]] target selection, and `vendor_claude_sdk` as compatibility-only. It also owns the first executable frontmatter validation law for coordinate keys, metadata keys, temporal thought requirements, legacy compatibility warnings, and L-alignment checks; compiled artifacts can now be validated against the exact residency plan and invocation kind that produced them, including T-lane coordinate, day identity, and source provenance. `Body/S/S0/epi-cli/src/vault/frontmatter.rs` now delegates to and re-exports this S1' authority. Finally, it owns a pure graph-sync intent contract so compiler output can request canonical `:Bimba` writes or legacy `:BimbaCoordinate` migration from S2 without touching live Neo4j. The Python files in `Body/S/S1/hen-compiler/scripts/hen_*` remain useful vendor-adjacent compatibility/probe material, but they are no longer the target authority for S1' law.

The S0/S0' conclusion applies here: `epi vault` is S1/S1' made executable through [[S0]], but S1/S1' is not reducible to its current command surface. The live CLI is real evidence; the canonical API, [[Envelope]], and [[Hen]] law decide the target shape.

## M' Consumer Surfaces

S1/S1' is the writable vault body behind [[M4'-SPEC]], [[M5'-SPEC]], and the shell-level continuity named in [[M'-SYSTEM-SPEC]]. The most direct substrate anchors for those consumers are [[Body/S/S1/hen-compiler-core/src/lib.rs]], [[Body/S/S1/hen-compiler-core/src/wikilinks.rs]], and [[Body/S/S1/hen-compiler-core/src/graph_promotion.rs]].

## VAK Gate

- CPF: `(4.0/1-4.4/5)` - full reflective lattice held as one dispatch field.
- CT: `CT1` - specification / form-giving law.
- CP: `4.1 Definition` moving toward `4.2 Operation`.
- CF: `(0/1)` primary [[Logos]] with [[Eros]] execution/verification.
- CFP: S-family, S1/S1' vault/compiler layer.
- CS: `CS1` with dependency on [[S0]] and upstream service to [[S2]], [[S3]], [[S4]], and [[S5]].

Manual dispatch result: [[Logos]] owns the consolidated subcoordinate mapping; [[Eros]] owns the real `epi vault` and test implications; [[Hen]] is the named S1' augmentation module; [[Khora]] remains the write edge for S1 mutations.

## Preflight. Derivation Notes

### Old S-file carry-forward

The older [[S1]] files correctly identify this level as the vault/material container: file system ground, frontmatter, templates, world patterns, context frames, and wikilinks. The older [[S1']] files correctly preserve the monadological intuition: each file/form can function as a content monad with identity, relations, context, and integration.

The old subcoordinate sequence remains structurally useful:

| Old base coordinate | Carry-forward intuition |
|---|---|
| [[S1.0]] File System Ground | Vault root, folders, markdown, canvas, assets, `.obsidian` state |
| [[S1.1]] Frontmatter Structure | YAML metadata and coordinate keys |
| [[S1.2]] Template Operations | Templated file birth and repeatable write patterns |
| [[S1.3]] World Patterns | Forms, types, canvases, MOCs, and patterning structures |
| [[S1.4]] Context Frames | Day/NOW/context binders and navigational frames |
| [[S1.5]] Wiki-Link Integration | Wikilinks, backlinks, graph-facing integration |

The older [[S1']] monad sequence also survives as a design pressure, but its names are re-expressed in the current API:

| Old prime coordinate | Current expression |
|---|---|
| [[S1.0']] Cosmic Monad | Vault schema/residency law and zone resolution |
| [[S1.1']] Substantial Monad | Form contract, CT identity, frontmatter validation |
| [[S1.2']] Relational Monad | Template/write law, wikilink/frontmatter relations |
| [[S1.3']] Dynamic Monad | Compiler passes, canvas generation, ledger append |
| [[S1.4']] Contextual Monad | [[Day]], [[NOW]], [[Context Economy]], CT4a/CT4b distinction |
| [[S1.5']] Synthesizing Monad | Graduation, promotion, crystallisation, return to graph/world |

### Corrections / re-homing

The old `World/Forms/` assumption is obsolete. The corrected [[S1'Cx]] mapping is:

- Forms live flat under `Idea/Bimba/World/{Name}.md`.
- Types live under `Idea/Bimba/World/Types/{Name}/`.
- Type MOCs/canvases live at `Idea/Bimba/World/Types/{Name}/{Name}.canvas`.
- Daily/NOW context belongs materially in [[S1]], but its temporal truth is homed in [[S3']] / [[Chronos]].
- Graph synchronisation is triggered from S1 integration, but graph authority belongs to [[S2]] / [[S2']].
- Gnosis, [[Graphiti]], [[NotebookLM]], [[Vimarsa]], and world-return knowledge services consume S1 artifacts but are not S1 systems.

### Current code reality

The live implementation is mostly `Body/S/S0/epi-cli/src/vault/` plus the compiler-vendor substrate in `Body/S/S1/hen-compiler/`.

Live `epi vault` commands already cover real file operations, frontmatter validation/mutation, template invocation, [[Day]] and [[NOW]] creation, flow initialization, thought routing, archive planning/forcing, default vault resolution, and pass-through calls to `obsidian-cli`.

Current implementation gaps:

- The coordinate-native API methods `s1.read`, `s1.write`, `s1.search`, and related `s1.*` methods are represented by CLI commands, not yet by a unified gateway method implementation.
- `s1.backlinks` and `s1.sync.flush` are designed in the TS/API audit, but not visibly exposed as live `epi vault` commands.
- S1' type/form/canvas/residency methods are not yet complete as command/API surfaces.
- `Body/S/S1/hen-compiler` is the foundation vendor fork for this level's compiler work, but it is not yet the canonical 12-layer S1' compiler spine with typed ledgers and API parity.
- S0 thought routing now writes to the canonical Hen T-family path `Pratibimba/Self/Thought/T/Tn/...`; `epi vault thought-route` rejects positions outside T0-T5 rather than silently clamping. Older `Pratibimba/Self/Thought/Tn/...` paths are compatibility history, not current output law.
- `obsidian-cli` is a real dependency of current `epi vault` pass-through behavior and should be recorded in S0' preferred-tool law.

### Planning consequence

The shard/build pass for S1/S1' must not merely add more vault commands. It must clarify three separable surfaces:

- Material file operations under [[S1]].
- [[Hen]] law operations under [[S1']] for CT templates, frontmatter, residency, and type/form lifecycles.
- Integration edges to [[S2]], [[S3']], [[S4]], and [[S5]] through explicit APIs and [[Envelope]] fields.

## A. S1 - Vault Base Technology

### What It Is

S1 is the objective vault technology of [[Epi-Logos]]. It is the material layer where content has an address, a file representation, and local editability.

Current canonical S1 base technology:

- `Idea/` Obsidian vault in the C Experiments workspace.
- `Idea/Bimba/World/` as the form/type residency zone.
- `Idea/Bimba/World/Types/` as the type mirror.
- `Idea/Empty/Present/` as active [[Day]], [[NOW]], FLOW, prompt, and protocol space.
- `Idea/Pratibimba/` as reflected self/action/thought/archive space.
- Markdown, YAML frontmatter, Obsidian wikilinks, canvases, and attachments.
- `epi-cli/src/vault/` as the current Rust command surface.

### Services, Binaries, Processes

| Component | Coordinate | Language | Runtime / Port | Role |
|---|---:|---|---|---|
| `Idea/` vault | [[S1]] | Filesystem / Markdown | Local disk | Canonical material content substrate |
| Obsidian app | [[S1.0]] | Desktop app | Local GUI | Human vault editing and navigation |
| `obsidian-cli` | [[S1.0]] / [[S0']] | CLI binary | Local process | Current pass-through backend for `epi vault` commands |
| `epi vault` | [[S1]] / [[S1']] via [[S0]] | Rust | Local CLI | Vault read/write/template/frontmatter/day/NOW/thought/archive surface |
| `Body/S/S1/hen-compiler-core/` | [[S1']] canonical Hen contract | Rust | Local crate | Compiler invocation, residency, ledger channel, and vendor-compatibility law |
| `Body/S/S1/hen-compiler/` | [[S1.3']] / [[S5']] compiler vendor fork | Python | Local scripts | Foundation substrate and compatibility/probe material for compiler/query/flush/lint memory tooling |

S1 itself does not own graph storage, temporal semantics, constitutional routing, or world-return evaluation. It owns the material vault substrate those layers write to, read from, and compile through.

### API Methods Homed Here

#### `s1.read`

Reads vault content by path.

Request type: `S1ReadRequest`

```typescript
interface S1ReadRequest {
  path: string;
  format?: "raw" | "parsed";
}
```

Response type: `S1ReadResponse`

```typescript
interface S1ReadResponse {
  content: string;
  frontmatter?: Record<string, unknown>;
  body?: string;
  ct_type?: string;
  coordinate?: string;
}
```

Build implications:

- Paths are vault-relative unless explicitly resolved by `s1'.residency.resolve`.
- `parsed` mode must use a real frontmatter parser, not ad hoc string splitting.
- Deprecated keys such as `bimbaCoordinate`, `ql_position`, and `pos_*` must be surfaced as validation findings, not silently normalized.

#### `s1.write`

Writes vault content through the authorized S1/Khora write path.

Request type: `S1WriteRequest`

```typescript
interface S1WriteRequest {
  path: string;
  content: string;
  frontmatter?: Record<string, unknown>;
  sync_queue?: boolean;
}
```

Response type: `S1WriteResponse`

```typescript
interface S1WriteResponse {
  ok: boolean;
  sync_queued: boolean;
}
```

Build implications:

- All writes go through [[Khora]] as write-edge authority, even when Hen decides the path or schema.
- `sync_queue` must feed the [[S2]] sync queue, not perform untracked background mutation.
- Frontmatter is canonicalized before write.

#### `s1.search`

Searches vault files.

Request type: `S1SearchRequest`

```typescript
interface S1SearchRequest {
  query: string;
  scope?: string[];
  ct_type?: string;
  coordinate?: string;
  limit?: number;
}
```

Response type: `VaultSearchResult[]`

```typescript
interface VaultSearchResult {
  path: string;
  title?: string;
  excerpt?: string;
  score?: number;
  frontmatter?: Record<string, unknown>;
}
```

Build implications:

- Search may use filesystem/text search locally, but the result contract must stay stable for gateway/API parity.
- Coordinate and CT filters should use parsed frontmatter, not filename guessing.

#### `s1.template`

Renders a [[CT]] template.

Request type: `S1TemplateRequest`

```typescript
interface S1TemplateRequest {
  name: string;
  params: Record<string, unknown>;
}
```

Response type: `S1TemplateResponse`

```typescript
interface S1TemplateResponse {
  rendered: string;
  path: string;
}
```

Build implications:

- Vault templates under `Idea/Bimba/World/` outrank builtins.
- Builtins must emit `coordinate`, not deprecated `bimbaCoordinate`.
- CT4a integration preview and CT4b daily/NOW context must remain distinct.

#### `s1.frontmatter.validate`

Validates canonical frontmatter.

Request type: `S1FrontmatterValidateRequest`

```typescript
interface S1FrontmatterValidateRequest {
  frontmatter: Record<string, unknown>;
  artifact_role?: string;
}
```

Response type: `S1FrontmatterValidateResponse`

```typescript
interface S1FrontmatterValidateResponse {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
```

Build implications:

- Must enforce canonical coordinate key `coordinate`.
- Coordinate-prefixed keys follow `{family}_{n}_{semantic}`.
- Temporal artifacts require their temporal identifiers.

#### `s1.frontmatter.get`

Reads frontmatter from a vault file.

Request type: `S1FrontmatterGetRequest`

```typescript
interface S1FrontmatterGetRequest {
  path: string;
  key?: string;
}
```

Response type: `S1FrontmatterGetResponse`

```typescript
interface S1FrontmatterGetResponse {
  frontmatter: Record<string, unknown>;
  value?: unknown;
}
```

#### `s1.frontmatter.set`

Updates frontmatter on a vault file.

Request type: `S1FrontmatterSetRequest`

```typescript
interface S1FrontmatterSetRequest {
  path: string;
  key: string;
  value: unknown;
}
```

Response type: `S1FrontmatterSetResponse`

```typescript
interface S1FrontmatterSetResponse {
  ok: boolean;
}
```

#### `s1.backlinks`

Returns vault backlinks for a path.

Request type: `S1BacklinksRequest`

```typescript
interface S1BacklinksRequest {
  path: string;
  include_unresolved?: boolean;
}
```

Response type: `S1BacklinksResponse`

```typescript
interface S1BacklinksResponse {
  backlinks: Array<{ path: string; context?: string }>;
}
```

Build implications:

- This is currently a designed API addition; live CLI support is not yet evident.
- It should operate over real wikilinks and embeds, not only grep of literal filenames.

#### `s1.sync.flush`

Flushes the Khora sync queue into graph integration.

Request type: `S1SyncFlushRequest`

```typescript
interface S1SyncFlushRequest {
  limit?: number;
  dry_run?: boolean;
}
```

Response type: `S1SyncFlushResponse`

```typescript
interface S1SyncFlushResponse {
  flushed: number;
  remaining: number;
  errors: string[];
}
```

Build implications:

- This is the critical S1 -> [[S2]] integration edge.
- The API audit records the current `khora_sync_queue_flush` path as stubbed; this must become a real queue drain with idempotency and error reporting.

### Envelope Fields Populated

S1 contributes most directly to Residency, Coordinate, Context, Crystallisation, and Improvement layers:

| Envelope field | Coordinate home | Producer | Notes |
|---|---:|---|---|
| `s_1_target_vault_zone` | [[S1.0']] | [[Hen]] residency law | Target zone such as Bimba, Empty/Present, Pratibimba |
| `s_1_target_residency_class` | [[S1.0']] | [[Hen]] | Residency class for artifact placement |
| `s_1_artifact_ct_type` | [[S1.1']] | [[Hen]] template/frontmatter law | CT0-CT5 identity |
| `s_1_typification_state` | [[S1.0']] / [[S1.1']] | [[Hen]] + [[Aletheia]] | Whether content is seed, form, type, promoted, crystallised |
| `c_0_source_coordinates` | [[S1.0']] / [[C]] | Frontmatter law | Source coordinate lineage |
| `s_1_graduation_path` | [[S1.5']] | [[Hen]] return law | Movement from active work to durable residency |
| `s_1_promoted_artifacts` | [[S1.5']] / [[S5']] | Crystallisation pass | Promoted vault artifacts |
| `s_1_promotion_destination` | [[S1.5']] | Improvement loop | Destination for promoted content |

Temporal fields materially anchored in S1 but semantically owned by [[S3']] include:

| Envelope field | Coordinate home | S1 role |
|---|---:|---|
| `s_3_day_id` | [[S3']] / [[Chronos]] | Stored in [[Day]] frontmatter/path |
| `s_4_now_id` | [[S4]] / [[S3']] bridge | Stored in [[NOW]] frontmatter/path |
| `s_4_now_path` | [[S1]] + [[S4]] | Material vault path for NOW |

### CLI Commands

S1/S1' is currently surfaced through `epi vault`.

| Live command | Primary coordinate home | Notes |
|---|---:|---|
| `epi vault status` | [[S1.0]] / [[S0']] | Delegates to `obsidian-cli print-default`; proves current CLI dependency |
| `epi vault create` | [[S1.2]] | File creation via Obsidian CLI pass-through |
| `epi vault read` | [[S1.0]] / [[S1.1]] | Reads content |
| `epi vault search` / `search-content` | [[S1.5]] | Vault search surface |
| `epi vault daily` | [[S1.4]] + [[S3']] | Obsidian daily note surface |
| `epi vault day-init` | [[S1.4]] + [[S3']] | Creates day folder and daily note |
| `epi vault now-init` | [[S1.4]] + [[S3']] + [[S4]] | Creates NOW directory and `now.md` |
| `epi vault now-read` / `now-write` / `now-path` | [[S1.4]] + [[S4]] | NOW material operations |
| `epi vault flow-init` | [[S1.4]] | Creates day FLOW artifact |
| `epi vault frontmatter-get/set/delete/validate` | [[S1.1]] / [[S1.1']] | Canonical metadata surface |
| `epi vault template-invoke` | [[S1.2]] / [[S1.2']] | CT template rendering |
| `epi vault thought-route` | [[S1.5]] / [[Pratibimba]] | Routes thought into reflected thought space |
| `epi vault archive-day` | [[S1.5]] + [[S3']] | Moves completed day into action history |
| `epi vault open` / `set-default` | [[S1.0]] / [[S0]] | Operator affordance |
| `epi vault move` / `delete` | [[S1.2]] | Material file mutation |
| `epi vault pasu` / `kairos` | [[PASU]] / [[Kairos]] via [[S1]] | Material anchors for identity/timing facts owned elsewhere |

CLI parity law: `epi vault` should remain the local operator mirror of canonical `s1.*` and `s1'.*` methods. Where live commands are practical names, future API sharding should decide aliases without erasing the coordinate-native method contract.

### Current Implementation State

Current Rust files:

- `epi-cli/src/vault/mod.rs` - command enum, Obsidian CLI delegation, day/NOW/flow/thought/archive operations.
- `epi-cli/src/vault/frontmatter.rs` - canonical frontmatter validation and mutation helpers.
- `epi-cli/src/vault/templates.rs` - CT template rendering and precedence rules.
- `epi-cli/src/vault/paths.rs` - day, NOW, thought, and archive path builders.

Current compiler-vendor files:

- `Body/S/S1/hen-compiler/scripts/flush.py` - session/daily memory flush prototype.
- `Body/S/S1/hen-compiler/scripts/compile.py` - old-style memory compiler prototype.
- `Body/S/S1/hen-compiler/scripts/query.py` - retrieval/query prototype.
- `Body/S/S1/hen-compiler-core/src/lib.rs` - canonical Rust Hen contract for timestamp, residency, channels, compile planning, agent invocation, frontmatter validation, compiled-artifact validation, and graph-sync intent.
- `Body/S/S1/hen-compiler/scripts/hen_residency.py` - Python compatibility/probe facade proving canonical Day/Thought residency while preserving vendor aliases.
- `Body/S/S1/hen-compiler/scripts/hen_compile_plan.py` - Python compatibility/probe dry-run compile planner over canonical source/output paths.

Current test evidence:

- `epi-cli/tests/vault_commands.rs` covers real command execution for template, day, NOW, canonical T-family thought routing, invalid T-position rejection, flow initialization, and archive behavior.
- `epi-cli/tests/vault_frontmatter.rs` covers canonical coordinate/frontmatter validation and deprecated-key rejection.
- `epi-cli/tests/vault_paths_templates.rs` covers path builders, template precedence, CT4a/CT4b distinctions, and canonical `coordinate` emission.
- `epi-cli/tests/vault_cli_contact.rs` proves `epi vault status` prefers `obsidian-cli` over `obsidian`.
- `Body/S/S1/hen-compiler-core/tests/compile_plan.rs` is the canonical Rust proof for dry-run compile planning over real files, including source existence, artifact destination, ledger channel selection, unknown-channel rejection, Anima/Epii target selection, and vendor executor compatibility.
- `Body/S/S1/hen-compiler-core/tests/frontmatter.rs` is the canonical Rust proof for frontmatter validation law, including compiled-artifact validation against residency and invocation.
- `Body/S/S1/hen-compiler-core/tests/graph_sync_intent.rs` is the canonical Rust proof for S1-to-S2 graph write/migration intent without live graph mutation.
- `Body/S/S1/hen-compiler/tests/test_hen_residency.py` and `Body/S/S1/hen-compiler/tests/test_hen_compile_plan.py` are retained as Python compatibility/probe tests against the vendor-shaped scaffold.

Current gap note: these tests are meaningful and file-backed, but they do not yet prove gateway/API parity for `s1.*`, a real S1 -> S2 sync flush, non-dry-run compilation, or agent invocation through S4 Hen.

### Internal 0-5 Breakdown

| Coordinate | Current ownership |
|---|---|
| [[S1.0]] Vault filesystem ground | Vault root discovery, folder/file/canvas/attachment addressability, Obsidian local state, `obsidian-cli` contact |
| [[S1.1]] Vault form layer | Markdown body and YAML frontmatter as material form |
| [[S1.2]] Vault write operations | Create/read/write/move/delete/template-render material operations |
| [[S1.3]] Vault compilation passes | Local compile/query/flush passes over vault artifacts; currently prototype in `epi-dev-vault` |
| [[S1.4]] Vault temporal context | Day/NOW/FLOW files and paths as material anchors for [[Chronos]] and [[Anima]] |
| [[S1.5]] Vault integration surface | Wikilinks, backlinks, sync queue, thought routing, archive/graduation, graph-facing handoff |

## B. S1' - QL Augmentation

### What It Is

S1' is the [[Hen]] augmentation of the vault. It makes the vault lawful: not just files, but forms with CT identity, coordinate provenance, residency class, promotion path, and compiler participation.

Hen does not replace [[Khora]]. Khora writes. Hen decides how content should be formed, named, typed, templated, and placed. [[Chronos]] supplies temporal facts for [[Day]], [[NOW]], and [[Kairos]]. [[Anima]] and [[Psyche]] consume NOW as session context. [[Aletheia]] and [[Epii]] consume promoted artifacts for world-return validation and gnosis.

### Ta-onta Module

S1' module: [[Hen]].

Responsibilities:

- CT template law for CT0 through CT5.
- Canonical frontmatter and coordinate key law.
- Vault residency resolver.
- Type/form birth and graduation.
- Canvas/MOC structure law.
- Compiler ledger channel law.
- Injection/query bridge for context retrieval.

### API Methods Homed Here

#### `s1'.type.create`

Creates or updates a vault Type.

Request type: `S1PrimeTypeCreateRequest`

```typescript
interface S1PrimeTypeCreateRequest {
  name: string;
  coordinate?: string;
  description?: string;
  canvas?: boolean;
}
```

Response type: `S1PrimeTypeCreateResponse`

```typescript
interface S1PrimeTypeCreateResponse {
  path: string;
  canvas_path?: string;
  created: boolean;
}
```

Build implications:

- Type residency is `Idea/Bimba/World/Types/{Name}/`.
- Canvas/MOC residency is `Idea/Bimba/World/Types/{Name}/{Name}.canvas`.
- This must not recreate the obsolete `World/Forms/` layout.

#### `s1'.type.list`

Lists vault Types.

Request type: `S1PrimeTypeListRequest`

```typescript
interface S1PrimeTypeListRequest {
  scope?: string;
}
```

Response type: `S1PrimeTypeListResponse`

```typescript
interface S1PrimeTypeListResponse {
  types: Array<{ name: string; path: string; coordinate?: string }>;
}
```

#### `s1'.form.birth`

Creates a new Form.

Request type: `S1PrimeFormBirthRequest`

```typescript
interface S1PrimeFormBirthRequest {
  name: string;
  type?: string;
  coordinate?: string;
  ct_type?: string;
  content?: string;
}
```

Response type: `S1PrimeFormBirthResponse`

```typescript
interface S1PrimeFormBirthResponse {
  path: string;
  created: boolean;
}
```

Build implications:

- Form residency is flat `Idea/Bimba/World/{Name}.md`.
- Type relation is metadata/wikilink/canvas relation, not folder nesting.

#### `s1'.form.graduate`

Graduates content from active/working space into durable form/type residency.

Request type: `S1PrimeFormGraduateRequest`

```typescript
interface S1PrimeFormGraduateRequest {
  source_path: string;
  destination?: string;
  type?: string;
  promote?: boolean;
}
```

Response type: `S1PrimeFormGraduateResponse`

```typescript
interface S1PrimeFormGraduateResponse {
  source_path: string;
  destination_path: string;
  promoted: boolean;
}
```

Build implications:

- Graduation is the S1' expression of `s_1_graduation_path`.
- Promotion may trigger [[S5']] crystallisation, but S1' owns the vault move/name/schema law.

#### `s1'.form.list`

Lists forms.

Request type: `S1PrimeFormListRequest`

```typescript
interface S1PrimeFormListRequest {
  type?: string;
  coordinate?: string;
}
```

Response type: `S1PrimeFormListResponse`

```typescript
interface S1PrimeFormListResponse {
  forms: Array<{ name: string; path: string; type?: string; coordinate?: string }>;
}
```

#### `s1'.canvas.create`

Creates a canvas/MOC.

Request type: `S1PrimeCanvasCreateRequest`

```typescript
interface S1PrimeCanvasCreateRequest {
  name: string;
  type?: string;
  nodes?: Array<{ id: string; label: string; path?: string }>;
}
```

Response type: `S1PrimeCanvasCreateResponse`

```typescript
interface S1PrimeCanvasCreateResponse {
  path: string;
  created: boolean;
}
```

Build implications:

- Canvas JSON must be valid Obsidian canvas format.
- Canvas generation should preserve wikilink/material file identity for later [[S2]] graph sync.

#### `s1'.residency.resolve`

Resolves where an artifact belongs.

Request type: `S1PrimeResidencyResolveRequest`

```typescript
interface S1PrimeResidencyResolveRequest {
  artifact_role: string;
  ct_type?: string;
  coordinate?: string;
  family?: string;
  title?: string;
}
```

Response type: `S1PrimeResidencyResolveResponse`

```typescript
interface S1PrimeResidencyResolveResponse {
  vault_zone: string;
  residency_class: string;
  path: string;
  reasons: string[];
}
```

Build implications:

- Populates `s_1_target_vault_zone` and `s_1_target_residency_class`.
- Must account for [[Bimba]], [[Empty]], [[Pratibimba]], [[Day]], [[NOW]], and promotion destinations.

#### `s1'.compile`

Runs a vault compiler pass.

Request type: `S1PrimeCompileRequest`

```typescript
interface S1PrimeCompileRequest {
  source_paths?: string[];
  channel?: LedgerChannel;
  since?: string;
  dry_run?: boolean;
  executor_kind?: "pi_agent" | "service" | "vendor_claude_sdk";
  target_agent?: "anima" | "epii";
  required_skill?: string;
  review_policy?: "none" | "epii_inbox" | "human_required";
}
```

Response type: `S1PrimeCompileResponse`

```typescript
interface S1PrimeCompileResponse {
  compiled: number;
  ledger_entries: string[];
  artifacts: string[];
  errors: string[];
}
```

Build implications:

- The current `Body/S/S1/hen-compiler` compiler is the vendor foundation for this work, not the final contract.
- The final compiler must understand the 12 ledger channels: transport, runtime, temporal, coordinate, residency, context, environs, execution, episodic, crystallisation, improvement, and ql.
- QL compilation must happen before dependent layers consume the artifact.
- `pi_agent` is the target executor for agentic enrichment. `vendor_claude_sdk` is compatibility for the original compiler vendor shape.
- Agentic compiler jobs must declare whether output returns directly to residency, to [[Anima]] execution, or to the [[Epii]] review inbox.

#### `s1'.ledger.append`

Appends a compiler ledger entry.

Request type: `S1PrimeLedgerAppendRequest`

```typescript
interface S1PrimeLedgerAppendRequest {
  channel: LedgerChannel;
  artifact_path: string;
  event: string;
  payload?: Record<string, unknown>;
}
```

Response type: `S1PrimeLedgerAppendResponse`

```typescript
interface S1PrimeLedgerAppendResponse {
  ledger_path: string;
  entry_id: string;
}
```

#### `s1'.query`

Queries compiled vault context.

Request type: `S1PrimeQueryRequest`

```typescript
interface S1PrimeQueryRequest {
  query: string;
  channel?: LedgerChannel;
  limit?: number;
}
```

Response type: `S1PrimeQueryResponse`

```typescript
interface S1PrimeQueryResponse {
  results: VaultSearchResult[];
  compiled_context?: string;
}
```

#### `s1'.injection`

Returns vault-derived context for an agent/session.

Request type: `S1PrimeInjectionRequest`

```typescript
interface S1PrimeInjectionRequest {
  coordinate?: string;
  now_path?: string;
  query?: string;
  max_tokens?: number;
}
```

Response type: `S1PrimeInjectionResponse`

```typescript
interface S1PrimeInjectionResponse {
  context: string;
  sources: string[];
}
```

Build implications:

- Injection must cite source paths so [[Psyche]] can preserve session provenance.
- It should integrate with [[S4]] context needs without giving S4 direct file-law authority.

### Envelope Fields Populated

S1' populates the residency/compiler law fields named above, and participates in:

| Envelope layer | S1' role |
|---|---|
| [[Coordinate Layer]] | Enforces coordinate fields and source-coordinate lineage |
| [[Residency Layer]] | Decides vault zone, residency class, CT type, typification state |
| [[Context Economy]] | Provides Day/NOW material context and injection sources |
| [[Crystallisation Layer]] | Records promoted artifacts and graduation paths |
| [[Improvement Layer]] | Records promotion destinations for future loops |
| QL / compiler layer | Compiles ledger entries and schema law before wider consumption |

### S1'Cx Projection

The corrected C-family projection:

| C coordinate | S1'Cx meaning | Canonical residency |
|---|---|---|
| C0 | Folder ground / cosmic container | `Idea/Bimba/{Domain}/`, `Idea/Empty/Present/`, `Idea/Pratibimba/` |
| C1 | Flat Form | `Idea/Bimba/World/{Name}.md` |
| C2 | Relational metadata | YAML frontmatter, wikilinks, CT fields, coordinate keys |
| C3 | Dynamic canvas | `{Name}.canvas` / Obsidian canvas relation surface |
| C4 | Type/MOC context | `Idea/Bimba/World/Types/{Name}/{Name}.canvas` and type folder |
| C5 | Reflection / promotion | `Idea/Pratibimba/...`, thought routes, archive, synthesis/graduation |

Decision: the S1'Cx projection is no longer allowed to imply `World/Forms/`. Forms are flat; Types hold folders/canvases.

### Current Implementation State

S1' is partially embodied in current code:

- `frontmatter.rs` implements much of [[S1.1']] law.
- `templates.rs` implements part of [[S1.2']] CT law.
- `paths.rs` and `mod.rs` implement material parts of [[S1.4]]/[[S1.4']] for Day/NOW.
- Archive and thought routing implement early [[S1.5]]/[[S1.5']] return behavior.

S1' is not yet complete:

- No complete `s1'.type.*` API surface is visible.
- No complete `s1'.form.*` API surface is visible.
- No complete `s1'.canvas.create` surface is visible.
- No complete `s1'.residency.resolve` API surface is visible.
- No canonical ledger-channel compiler is visible.

### Internal 0-5 Breakdown

| Coordinate | Current ownership |
|---|---|
| [[S1.0']] Vault schema law | Vault zones, residency classes, path law, typification state |
| [[S1.1']] Vault form contract | Canonical frontmatter, CT identity, coordinate metadata, deprecation law |
| [[S1.2']] Vault write law | Template law, Khora write edge, idempotent create/update semantics |
| [[S1.3']] Vault compiler spine | Ledger channels, compiler passes, query/injection compiled context |
| [[S1.4']] Vault context economy | CT4a/CT4b, Day/NOW materialization, context binder law |
| [[S1.5']] Vault return law | Backlinks, sync flush, graduation, promotion, archive, S2/S5 handoff |

## C. Cross-References

### Depends On

- [[S0]] / [[S0']] for `epi vault`, process execution, PATH resolution, and `obsidian-cli` tool law.
- [[Khora]] for authorized writes and sync queue mutation.
- [[Chronos]] / [[S3']] for day, NOW, kairos, and temporal truth.
- [[Bimba]], [[Empty]], and [[Pratibimba]] as vault residency zones.

### Consumed By

- [[S2]] / [[S2']] consumes S1 wikilinks, frontmatter, and sync flush output for graph/Neo4j integration.
- [[S3]] / [[S3']] consumes Day/NOW paths and temporal anchor files.
- [[S4]] / [[S4']] consumes NOW and injection context for [[Anima]], [[Psyche]], [[VAK]], and constitutional agent sessions.
- [[S5]] / [[S5']] consumes promoted artifacts, compiled knowledge, [[Gnosis]], [[Graphiti]], [[NotebookLM]], and [[Vimarsa]] sources.
- [[Nara]] and [[M']] consume S1 material context where personal/world-boundary operations need durable vault references.

### Envelope Layers Served

S1/S1' serves these [[Envelope]] layers:

- [[Coordinate Layer]]
- Residency Layer
- [[Context Economy]]
- Temporal Layer, as material anchor only
- [[Crystallisation Layer]]
- [[Improvement Layer]]
- QL/compiler layer

### Gaps

- Build real gateway/API parity for all `s1.*` and `s1'.*` methods.
- Implement or expose `s1.backlinks`.
- Implement real `s1.sync.flush` over the Khora queue and graph handoff.
- Keep `Body/S/S1/hen-compiler-core` as the canonical Rust S1' ledger/compiler contract, and let `Body/S/S1/hen-compiler` remain the vendor foundation/compatibility substrate unless a specific backend enrichment feature requires it.
- Add S1' type/form/canvas/residency commands with tests that create real files and valid canvases.
- Add integration tests proving S1 -> S2 sync behavior against a real or test Neo4j/Redis substrate where appropriate.
- Record `obsidian-cli` in S0' preferred-tool resolution so the S1 dependency is explicit.

## D. Key Architectural Decisions

1. S1 is the vault material substrate; S1' is Hen's compiler/schema/residency law.
2. The old monadological reading survives as a conceptual interpretation of files/forms, but the build contract is now API/envelope/compiler based.
3. `World/Forms/` is obsolete. Forms are flat in `World`; Types own folders/canvases under `World/Types`.
4. Day/NOW files are S1 material artifacts but S3'/Chronos owns their temporal semantics.
5. `epi vault` is the current executable mirror, not the whole ontology.
6. The compiler vendor is the foundation for S1' build work, but canonical Hen law now lives in the Rust `Body/S/S1/hen-compiler-core` contract; vendor Python scripts are compatibility/probe material until explicitly promoted behind that contract.
7. Wikilinks and backlinks are not decorative: they are the S1.5/S1.5' integration surface that prepares vault material for graph, context, and world-return systems.

## Canonical Source Lock - 2026-06-02

S1 is the material vault/form substrate; S1' is Hen compiler, schema, and residency law. `Idea/Bimba/World/**` is not optional background here: it is the active form/type residency corpus this layer describes.

| Required coverage | Canonical citations |
|---|---|
| World ontology | `Idea/Bimba/World/Types/Coordinates/S/S1/S1.md` mtime 2026-04-10 17:50:54; `Idea/Bimba/World/Types/Coordinates/S/S'/S1'/S1'.md` mtime 2026-04-10 17:50:54; `Idea/Bimba/World/Daily-Note.md`, `NOW.md`, `Thought.md`, `Task-Spec.md`, `Pattern-Note.md`, `Prompt.md`, `Seed.md`, `FLOW.md`, `Integration-Preview.md` mtime range 2026-03-10..2026-04-11 |
| docs/specs | `docs/specs/S/S1-S1i-OBSIDIAN.md` mtime 2026-06-02 00:14:25; `docs/specs/S/S-STACK-INTEGRATION.md` mtime 2026-03-07 01:51:35; `docs/specs/S/S_Series_Master_CLI_Architecture.md` mtime 2026-03-15 00:27:10 |
| docs/plans | `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/11-open-architectural-decisions.md` mtime 2026-06-02 00:14:24; `13-s-sprime-modularity-and-s0-membrane-cleanup.md` mtime 2026-06-01 23:57:36 |
| Body substrate | `Body/S/S1/hen-compiler-core/**`, `Body/S/S1/hen-compiler/**`, `Body/S/S0/epi-cli/src/vault/**`, `Body/S/S0/epi-cli/src/gate/s1_hen.rs`, `Idea/Empty/Present/**`, `Idea/Bimba/World/**` |
| sibling seeds | `S1-0-SPEC.md`..`S1-5-SPEC.md`, `S1'/S1'-SPEC.md`, `S1'/S1-0'-SPEC.md`..`S1'/S1-5'-SPEC.md`, `S1-SHARD-INDEX.md`, `S1-TRACEABILITY-INDEX.md`, `S1'/S1'-TRACEABILITY-INDEX.md` |
| nominal tracks | no standalone S1 track in the current m-dev ledger; Track 13.T8 audits the S1/Hen boundary; Track 09 consumes Hen for mediation |
| open decisions | IOD-18 Smart Connections resolved; IOD-19 Hen vault-write gatekeeper resolved; remaining open work is API parity, `s1.sync.flush`, and vault-to-graph queue drain |

Supersession rule: any `World/Forms/` plan fragment is historical. Current canon is flat `Idea/Bimba/World/{Name}.md` forms plus `Idea/Bimba/World/Types/{Name}/` type folders/canvases.
