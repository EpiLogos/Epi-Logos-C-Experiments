---
coordinate: "S1'"
c_4_artifact_role: "canonical-seed-spec"
c_1_ct_type: "CT1"
c_3_crystallised_at: "2026-06-02"
c_0_source_coordinates:
  - "[[S1-SPEC]]"
  - "[[S1-SHARD-INDEX]]"
  - "[[S1-TRACEABILITY-INDEX]]"
  - "[[ARCHITECTURE-DIAGRAM-PACK]]"
  - "[[S-SHARD-HARMONIZATION-PROTOCOL]]"
  - "[[FLOW-2026-06-03-HEN-ENTITY-CAPTURE-LIFECYCLE]]"
  - "[[FLOW-2026-06-03-C-LAYER-TYPOLOGY-AND-MOC-WORKFLOW]]"
---

# S1' Specification: Hen Compiler, Vault Write Law, And Residency

## Canonical Status

This file is the single authoritative S1' seed. S1 is the material Idea/Obsidian vault; S1' is Hen: canonical frontmatter, CT form law, residency resolution, wikilink-safe mutation, compiler ledger channels, semantic link suggestion, and graph-sync intent. Vendor compiler material is compatibility substrate; `Body/S/S1/hen-compiler-core` is the canonical Rust contract.

Diagram anchors consumed by this specification: [[ARCHITECTURE-DIAGRAM-PACK#Diagram 2 S S Deep Structure]] for S/S' pair law, [[ARCHITECTURE-DIAGRAM-PACK#Diagram And MOC Residency Protocol]] for [[Hen]] residency and MOC rules, and [[ARCHITECTURE-DIAGRAM-PACK#Diagram 4 Cross-System Coupling]] for [[Theia]], [[M']], and agent write/read consumption.

The VAK gate is `CPF=(4.0/1-4.4/5)`, `CT=CT1`, `CP=4.1->4.2`, `CF=(0/1) Logos with Eros verification`, `CFP=S1'`, `CS=CS1`.

## Submodules And Subcoordinates

| Coordinate | Canonical surface | Current substrate |
|---|---|---|
| `S1.0'` | vault zone and residency law | `hen-compiler-core/src/lib.rs` compile residency planning, S0 gateway Hen vault handlers, and [[S1-0'-SPEC]] |
| `S1.1'` | frontmatter and CT identity | `hen-compiler-core/src/lib.rs` frontmatter validation law, S0 vault frontmatter tests, and [[S1-1'-SPEC]] |
| `S1.2'` | template/write law | `epi-cli/src/vault/templates.rs`, Hen invocation contracts |
| `S1.3'` | compile/ledger/query/injection | `hen-compiler-core/src/lib.rs`, vendor compiler scripts |
| `S1.4'` | Day/NOW context materialisation | `epi-cli/src/vault/paths.rs`, `Idea/Empty/Present/{day}/{now}/now.md` |
| `S1.5'` | return, backlinks, graph-sync, promotion handoff | `hen-compiler-core/src/wikilinks.rs`, Smart Env suggestion intake, graph-sync intent tests |

## Internal QL 0-5 Provenance

| Internal coordinate | QL / build function | Canonical source anchor | Derivation status |
|---|---|---|---|
| [[S1.0']] | `init_ground`; vault zone, folder-ground, canonical residency | `Idea/Bimba/World/Types/Coordinates/S/S'/S1'/S1'.md` monadological API and C0 manifestation; [[P0]], [[CT0]], [[L0]] / [[L5']] | direct World ontology |
| [[S1.1']] | `parse_form`; frontmatter, [[CT]] identity, coordinate metadata | `S1'.md` monadological API and C2 manifestation; [[P1]], [[CT1]], [[L1]] / [[L4']] | direct World ontology plus seed crystallisation |
| [[S1.2']] | `structure_pattern`; template/write law, canvas/frozen-process pattern | `S1'.md` monadological API and C3 manifestation; [[P2]], [[CT2]], [[L2]] / [[L3']] | direct World ontology plus seed crystallisation |
| [[S1.3']] | compiler ledger, query, injection, World patterns and promotion flow | `S1'.md` `p3_patterns`; [[S1-SPEC]] Hen compiler sections | seed-side crystallisation from World pattern law |
| [[S1.4']] | `coordinate_context`; [[Day]], [[NOW]], context frames, type-local organisation | `S1'.md` monadological API plus C4/C5 manifestations; [[P4]], [[CT4a]], [[CT4b]], [[L4]] / [[L1']] | direct World ontology plus seed crystallisation |
| [[S1.5']] | `integrate_links`; backlinks, graph-sync intent, promotion handoff | `S1'.md` monadological API and `p5_integrations`; [[P5]], [[CT5]], [[L5]] / [[L0']] | direct World ontology |

## Public APIs And Gateway Methods

| Method family | Status | Owner rule |
|---|---|---|
| `s1'.vault.read_file`, `write_file`, `rename_file`, `move_file` | native in current gateway method list | S1' owns write safety and residency; S3 transports |
| `s1'.semantic.suggest_links` | native in method list | Hen/Smart Connections semantic suggestions; no private graph mutation |
| `s1'.entity.capture`, `classify`, `promote_to_type` | target-state | Hen owns dangling/root-created entity capture before type incubation |
| `s1'.type.classify_c_layer` | target-state | Hen resolves the owning C semantic authority before folder/type placement |
| `s1'.world.graduate` | target-state | Hen promotes stable type-local crystallisations to flat World forms |
| `s1.*` / `epi vault *` | mirror | S0 CLI exposes; S1/S1' own file law |
| `CompilerInvocation`, `SpineJob`, ledger append/query/injection | native seed contract, partial substrate | Hen owns contract; S4/S5 agents may execute bounded jobs |

## Lifecycle, Data Shapes, Privacy

| Shape/event | Privacy | Lifecycle |
|---|---|---|
| vault file envelope | mixed; inherits artifact frontmatter | resolve -> validate -> read/write/rename/move -> backlink check |
| `CompilerInvocation` | local operational; may cite protected sources by handle | source selection -> ledger channel -> dry-run plan -> review -> mutation if approved |
| Day/NOW material paths | public-current handles, protected bodies | day init -> now init -> session writes -> archive/promote |
| semantic link candidates | public-current or protected-local by source | index read -> candidate scoring -> human/agent selection -> write through Hen |
| entity candidates | public-current until source evidence requires protection | dangling wikilink/root loose note -> Empty candidate -> coordinate/type classification -> World/Types incubation -> flat World graduation |

S1' may store private artifacts, but it must expose only handles and privacy classes to M'/S5 unless consent/review permits deeper disclosure.

## Integration Seams

Calls in from S0 CLI/gateway mirrors, M' Theia filesystem reads, M5/Epii promotion requests, Anima/Aletheia crystallisation, and Nara Day/NOW writes. Calls out to S2 graph-sync intent, S3 temporal authority, S4 bounded executor selection, S5 review/autoresearch promotion, and Smart Connections vault semantic index. The seam invariant is writes-through-Hen; direct filesystem reads are allowed for Theia inspection but canonical mutations route through S1'.

## Cross-Cutting Participation

S1' participates in Day/NOW, vault, identity handles, Graphiti episode handles, capability-matrix mutation approval, consent gates, and canonical seed promotion. It is the durable artifact body for all runtime claims.

## Architecture Residency And Legacy Promotion

S1' gives agents a hard residency distinction:

- `Idea/Bimba/World/**` is the crystallised architecture surface. Flat `World/{Name}.md` files hold stable forms, definitions, coordinate synthesis documents, and canonical architecture statements. `World/Types/{Type}/{Type}.canvas` files hold type/MOC indexes and deeper canvas structure. `World/Forms/` is obsolete.
- `Idea/Bimba/Seeds/**` is the planning/spec/source surface. It holds shard specs, architecture packs, traceability indexes, source-route files, implementation plans promoted from `/docs`, and developmental material not yet crystallised into World.
- `/docs/specs`, `/docs/plans`, and `/docs/resources` are legacy/source strata. When they remain load-bearing, S1' should require a Seed-side mirror, pointer, or traceability entry so future agents can use vault wikilinks rather than raw filesystem search.

The operational protocol for moving from live evidence to [[Seeds]], [[World/Types]], flat [[World]], and [[S2]] graph-promotion intent is [[S1'-WORLD-TYPES-CRYSTALLIZATION-PROTOCOL]].

M-dev, Anima, Epii, and Hen-powered agents should use `epi core knowing` plus `epi vault read/search/search-content/link-suggest` before scoping cross-system work. The vault is the discovery surface; `rg` is a code/source fallback, not the primary architecture navigator.

## Empty Entity Capture And Wikilink Intelligence

S1' inherits the older [[Empty]] node-resolution canon and makes it explicit for Hen:

1. New or dangling `[[wikilinks]]` must not become anonymous graph nodes or ad hoc root files. Hen treats them as `entity_candidate` artifacts.
2. If Obsidian creates a loose note at the vault root, Hen should detect it and move it into `Idea/Empty/` or a day/session-local `Idea/Empty/Present/{DD-MM-YYYY}/entities/` inbox before further mutation.
3. Candidate frontmatter stays coordinate-lawful: `coordinate`, `c_4_artifact_role: "entity-candidate"`, `c_1_ct_type`, `c_0_source_coordinates`, `c_1_aliases`, `c_5_crystallisation_state`, `s_1_vault_path`, and review/provenance fields using canonical `{family}_{position}_{semantic}` keys.
4. Smart Connections / Smart Env is only a read-only ranking source. It suggests existing-note, alias, block, and source-neighbour evidence; Hen decides which wikilinks are written and which relation candidates are forwarded for review.
5. mdbase-style collections and Entity Notes-style aliases should be represented through canonical frontmatter and wikilink pages, not through tags as primary entities.
6. Classification promotes candidates into coordinate-native `Idea/Bimba/World/Types/Coordinates/**` incubation. It does not resurrect a top-level semantic `Types/Entities` authority unless a Seed protocol explicitly ratifies that root.
7. Stable forms graduate into flat `Idea/Bimba/World/{Name}.md`; the type-local file remains a MOC/source pointer with backlinks to the Empty candidate, Seed evidence, canvas path, and graph-promotion intent.

This lifecycle is specified in [[FLOW-2026-06-03-HEN-ENTITY-CAPTURE-LIFECYCLE]] and operationalised by [[S1'-WORLD-TYPES-CRYSTALLIZATION-PROTOCOL]].

## C-Layer Typology Authority

S1' treats `Idea/Bimba/World/Types/Coordinates/C/**` as the primary semantic typology for World/Types:

- [[C0]]: source/ground roots and namespaces.
- [[C1]]: forms, definitions, ideal markdown forms, and [[CT]] template law.
- [[C2]]: entity candidates, entities, aliases, properties, tags, and relation-field evidence.
- [[C3]]: MOC canvas forms, architecture diagram forms, workflows, process canvases, ideal canvas and diagram templates.
- [[C4]]: type authorities, context frames, folder MOC patterns, Dataview/query indexes, and residency classes.
- [[C5]]: World-form graduation, integration forms, graduation receipts, and Pratibimba/archive handoff.

Hen must classify artifacts through C before creating semantic type folders. Other coordinate families qualify the artifact after C establishes the category.

This workflow is specified in [[FLOW-2026-06-03-C-LAYER-TYPOLOGY-AND-MOC-WORKFLOW]].

## Open Decisions And Resolution Status

| Decision | Status | Current resolution |
|---|---|---|
| vendor compiler vs Rust Hen | resolved | Rust `hen-compiler-core` is canon; vendor Python remains probe/compatibility |
| non-dry-run compiler mutation | open | blocked until review/promotion law is complete |
| direct Theia vault writes | resolved canonically | reads may be direct; writes go through `s1'.vault.*`/Hen |
| dangling/root entity lifecycle | proposed | DR-S1-4 routes Empty capture, Smart Env suggestion, World/Types incubation, and flat World graduation |
| C-layer semantic typology | proposed | CCT-15 materialises C0-C5 semantic MOC structure and `s1'.type.classify_c_layer` |
| plan back-reference edits | blocked by scope | This seed supersedes newer plan fragments; docs/plans were not edited in this run |

## Source Coverage

| Source | mtime | Role |
|---|---:|---|
| `Idea/Bimba/Seeds/S/S1/S1'/Legacy/specs/S/S1-S1i-OBSIDIAN.md` | 2026-06-02 00:14:25 | newest formal S1/S1' spec update |
| `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-03-10-idea-tree-and-ct-templates.md` | 2026-03-15 00:30:08 | historical CT/vault plan |
| `Idea/Bimba/Seeds/S/S4/S4'/Legacy/plans/2026-05-19-hen-coordinate-graph-promotion.md` | 2026-05-19 16:31:26 | Hen graph-promotion decision |
| `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/06-zero-one-surface-evolution.md` | 2026-06-01 21:21:33 | Day/zero-one surface owner where S1' writes are consumed |
| `Idea/Bimba/Seeds/M/Legacy/plans/2026-05-31-mprime-and-sprime-implementation-tracks/13-s-sprime-modularity-and-s0-membrane-cleanup.md` | 2026-06-01 23:57:36 | S0/S' modularity pressure affecting S1' gateway surfacing |

## Substrate And Sibling Seeds

Body paths: `Body/S/S1/hen-compiler-core`, `Body/S/S1/hen-compiler`, `Body/S/S0/epi-cli/src/vault`, `Body/S/S0/epi-cli/src/gate/s1_hen.rs`, `Idea/Empty/Present`.

Sibling seeds: `S1-SPEC.md`, `S1-0-SPEC.md` through `S1-5-SPEC.md`, `S1-0'-SPEC.md` through `S1-5'-SPEC.md`, `S1-SHARD-INDEX.md`, `S1-TRACEABILITY-INDEX.md`.

## World Ontology Inclusion - 2026-06-02

`Idea/Bimba/World/Types/Coordinates/S/S'/S1'/S1'.md` mtime 2026-04-10 17:50:54 is now cited as load-bearing S1' ontology: monadological content API, `init_ground`, `parse_form`, `read_content`, `structure_pattern`, `coordinate_context`, and `integrate_links`. `Idea/Bimba/World/Types/Coordinates/S/S1/S1.md` mtime 2026-04-10 17:50:54 is the paired material vault ground. `Idea/Bimba/World/Daily-Note.md`, `NOW.md`, `Thought.md`, `Task-Spec.md`, `Pattern-Note.md`, `Prompt.md`, `Seed.md`, `FLOW.md`, and `Integration-Preview.md` are the related World artifact forms described by this layer.
