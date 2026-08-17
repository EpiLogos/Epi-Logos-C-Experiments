---
coordinate: "M/Bimba/S2"
c_4_artifact_role: "bimba-authority-freeze"
c_1_ct_type: "CT1"
c_3_created_at: "2026-08-17"
---

# RECON-R1 Canonical Bimba Inventory

Pinned source head: `8608648f33e697dd5a8c5f499492619a02259af5`.

## 1. Identity law

**Bimba is the canonical M-coordinate semantic/topological field.** It is not identical to its current database or protocol body.

Current identity rules from `M0'-SPEC.md` (blob `92550a16cc77a71f498905b36b380fe4d9434622`) and `S2-SPEC.md` (blob `e8738138907b5711e5bafa13fcfb7223a890856c`):

- canonical subsystem/topology coordinates resolve on the M family;
- legacy `#` syntax remains accepted at search/selection/wikilink/parser compatibility boundaries;
- `#0..#5` resolve to `M0..M5`, and nested legacy coordinates resolve to the corresponding M nesting;
- `#` and `M` must not be materialised as competing semantic trees;
- M0' is a read/route/rendering affordance over Bimba, not the owner of the topology;
- storage/provider/protocol identity is separate: **Bimba ≠ Neo4j ≠ MCP**.

## 2. Checked-in map/source corpus

Canonical map corpus root: `Idea/Bimba/Map`, tree `cd4f4f77c13f27e2563c5a6753d2f8bf2b605f15`.

### Six deep branches

| Branch | Tree | Material evidence |
|---|---|---|
| Anuttara | `795de0d4a27004876270dbcb61bb2f75483c0845` | `anuttara-language-map.md` blob `22835042d4d2c4ba821c252bd4fbfe52f39712ef`; `nodes-full-data.json`; `relations.json`. |
| Paramasiva | `fc7703548d230d1f1f3dd7a4dd2f04ae3ad52c75` | deep QL/Spanda/Paramasiva material, `nodes-full-detail.json`, `relations.json`, Cypher update evidence. |
| Parashakti | `bf083dddd3d20ce50009d634f0f2cef1e4edb35c` | deep Parashakti node/relation corpus. |
| Mahamaya | `5829a0cd363b8601cea3509779cb86ddc3c14784` | deep Mahamaya node/relation corpus. |
| Nara | `3281e2ec7805ba1dbea806227d47b2a68b1f0769` | deep Nara node/relation corpus. |
| Epii | `0a8cfd677262f475ae70161fe7534d0f01628208` | deep Epii node/relation corpus. |

Low-detail compatibility/export corpus: tree `7593e19905da7f95d855975323676a69994a2365`, including:

- `nodes_anuttara.json` `993686e9933d00f85c95691085df453fa575c97d`
- `nodes_paramasiva.json` `431e371ba3efbea25b97877121b902d0e8ba90b0`
- `nodes_parashakti.json` `6da950a674b375676303a6ad9bbe148561eb095d`
- `nodes_mahamaya.json` `6e3f60210c0e862295bfbd854958c9edc622e2c6`
- `nodes_nara.json` `218da1ebccdd0f10e8b478c7d60ea98c5aa8472d`
- `nodes_epii.json` `99eb19bc5a297b1f0786031fa115a09091ab40ad`
- corresponding `relations_*.json` files plus `relations_foundation.json`.

The root hash/index snapshots are compatibility/export evidence, not the whole current map:

- `nodes_hash.json` blob `7a74948a1ddf4bfe723ed28091dc45bbc7c04a38`
- `relations_hash.json` blob `3dca5c553f84abe29a937d7945f65da74070d1b9`

The latter contains only root `CONTAINS` and `HAS_LENS` relations; it must not be mistaken for the complete relation registry.

## 3. Node / relation namespaces and provenance classes

Current graph materialisation authority is split between `Body/S/S2/graph-schema` and `Body/S/S2/graph-services`.

### Node identity

- canonical Neo4j label: `:Bimba`;
- legacy compatibility label/property: `:BimbaCoordinate` / `bimbaCoordinate` where migration support remains;
- canonical coordinate parsing/resolution is owned by S2 graph law, with deliberate `#`→M compatibility;
- Anuttara source fields include provenance-bearing language properties such as source `c_1_symbol` / `c_1_complete_formulation`, with normalized display fields still subject to schema convergence.

### Relation provenance classes

The M0' current relation inspector requires typed distinction among:

- `structural`
- `correspondential`
- `kernel_core`
- `inferred`
- `sync`
- `compatibility`

and preserves additional readiness/review states such as canonical dataset relations versus review-pending inference. Structural and correspondential edges must never be collapsed merely because they share a Neo4j relationship body.

The C/kernel side retains **65 core relation laws** as computational authority (`Body/S/S0/epi-lib/include/m0.h`, `src/m0.c`, `include/ontology.h`). S2 may carry a broader relation corpus. A mismatch inside the core-65 projection is a readiness/audit concern; broader S2 relation deltas are not automatically defects.

## 4. Current material graph store

Current factual store/body: **Neo4j** under S2.

Current S2 authorities:

- `Body/S/S2/graph-schema/src/lib.rs` blob `c644b8d83997f64807d0fb53198169db68bc95f3`
- `Body/S/S2/graph-services/src/lib.rs` blob `7218379c7cad9b104b48b940886e738c82e99c15`
- `Body/S/S2/graph-services/src/coordinate.rs` blob `fe2031c8d765ecde420913945711b4f82e3e2ce8`
- `Body/S/S2/graph-services/src/dataset_import.rs` blob `5bca9f64766068e0aa65a29e5bb2504eba5ce4c5`
- `Body/S/S2/graph-services/src/relationship_manager.rs` blob `5d99531e5a045185a7fc1283e48ad83b3e5af869`
- `Body/S/S2/graph-services/src/pointers.rs` blob `424e22f71261e868923d18850df7358e3b7f7a2e`
- retrieval authorities under `src/retrieval/*`.

Neo4j is the current persistence/query body. It does not define Bimba's semantic identity and may be replaceable behind the same domain/write contracts in later work.

Redis is not a second Bimba store. S2 owns graph semantic-cache law using Redis; S3/S3' owns the Redis runtime/live temporal-context residency.

## 5. Canonical write/mutation paths

| Mutation class | Write owner | Rule |
|---|---|---|
| Kernel/core M0 relation/ontology facts | S0 M0/ontology implementation | Compiled core facts change through their C/Rust source + tests, then project outward; graph/UI does not patch them. |
| Canonical graph schema/labels/properties/relation registry | S2 `graph-schema` | Schema contract change belongs in S2 and must retain coordinate/provenance/disclosure law. |
| Canonical graph data import/sync | S2 `graph-services` | Dataset import/sync owns Neo4j material mutation and compatibility normalization. |
| Vault/source material proposing graph promotion | S1'/Hen → S2 intent | S1' may emit graph-promotion/sync intent; S2 owns actual graph write. |
| M0' graph interaction | no canon write | M0' reads/routes/inspects; direct renderer mutation is forbidden. |
| Nara/M4 personal evidence | protected M4 + S1/S3 stores | Raw personal content does not become Bimba through ordinary graph/session connectivity. |
| Epii/M5 review candidate | S5' review → owning source path | Epii can review/propose; accepted mutation still goes through S1/S2/M owner, never direct hidden graph mutation. |

## 6. Current external MCP exposure

Current external adapter location:

`Body/S/S2/external/bimba-mcp`, tree `bfed27a5d4f2100ccb8ad212e6b6cee4bd77226b`.

Relevant current adapter/source files include:

- `src/index.ts` blob `d899777fed2c0a6cfbee4d084f4f462ae296f6c5`
- `src/api/graph.ts` blob `9d0f5899385ed5745d72f909955231b5630f0e0a`
- `src/api/sync.ts` blob `b52a175b623a1e3027e5a1fbfaf831cc160451a4`
- `src/db/neo4j.ts` blob `3774536ecc25c1d155b6d199d929fce767460f1e`
- `src/coordinates/parser.ts` blob `fc849e5be48ec75a807b7bd4803b1149f33622b7`
- `src/coordinates/syntax.ts` blob `32794dd226d19135663332835dd7f59f5531d78e`
- `src/schemas/graph.ts` blob `dd9a975e3291987b82c736928bd8927bc0a2c1da`
- `src/schemas/sync.ts` blob `6ba9e4dc9e61ef4a51db61c786981c77739e1342`
- reranking and embedding provider adapters under `src/reranking` / `src/embeddings`.

Conformance/test evidence in that adapter includes `src/coordinates/parser.test.ts`, `src/repo-paths.test.ts`, and `.github/workflows/inspector-tests.yml`.

**R1 disposition:** retain as current external provider/adapter. It is not the canonical internal Bimba semantic API and not the write owner by virtue of speaking MCP. Protocol modernisation/legacy compatibility is delegated to RECON-R3 (#5).

## 7. Who queries, writes, or interprets Bimba

| Consumer | Query/read | Write | Interpret |
|---|---|---|---|
| M0' | yes: graph/source/relation/pointer inspection | no direct canon write | structural readability and routing only |
| M1' | yes: relation traversal/pointer web | session walk state only | relation-as-interval/playable topology |
| M2' | yes: configurable correspondence/provenance | no direct graph canon write | correspondential/harmonic meaning over S2 law |
| M3' | yes: symbolic/correspondential anchors | no direct Bimba mutation | transcription/clock/codon rendering |
| M4' | public coordinate handles only | protected personal stores, not Bimba by default | lived/personal interpretation under privacy gates |
| M5' | yes: Bimba/Gnosis/etymology navigation | only through reviewed owning mutation paths | pedagogy, review, archaeology and return |
| S1' | source/vault side | emits sync/promotion intent | content/residency provenance |
| S2/S2' | canonical graph materialisation/query | **yes** for graph schema/data | graph/coordinate/retrieval law |
| S3/S3' | temporal handles/episode-coordinate refs | temporal state, not Bimba canon | time/session relation only |
| S4/S4' | through governed tool/capability surfaces | only if authorised through owner-specific capability | task/agent context, not graph sovereignty |
| S5/S5' | retrieval/review | reviewed promotions through owner path | world-return/pedagogy/review |
| external MCP clients | through adapter | only adapter-authorised sync operations | no semantic ownership |

## 8. Graph namespaces above the Bimba store

Current M5' application law distinguishes linkable namespaces:

- `bimba` — canonical M/Bimba topology and source/relation law;
- `gnosis` — document/library/RAG knowledge;
- `etymology` — Logos/word-root constellations;
- `pratibimba` — governed handles into personal/episodic evidence.

These may share graph infrastructure or cross-link by coordinate/source/review/session handles, but they must not flatten into one undifferentiated semantic plane.

## 9. Verification / conformance evidence

Current checked-in evidence includes:

- `Body/S/S2/graph-schema/tests/coordinate_prefix_properties.rs` blob `f02f5109e37e5c811ce042c9f0cede8ff2c618b3`
- `relationship_registry.rs` `c93b7a528655c553902abcf461f06b3376992adb`
- `property_registry.rs` `819a09dfc7c6269976d66b51ddeae4edccad2a89`
- `label_registry.rs` `2fb125243fab6c0ff20387f331b4ce8889f2aa61`
- `track_02_t1_convergence.rs` `35db92c9f58e99704748e8aa2e6496a4731d803b`
- S2 graph-services tests for coordinate query, dataset import and live/import contracts;
- bimba-mcp coordinate parser and inspector workflow tests.

R1 records these as current evidence surfaces; it does not claim to have re-run provider-backed Neo4j/MCP integration tests on this documentation branch.

## 10. Known replaceable coupling / R2 concerns

- Neo4j is current and real but is a material store/provider body, not Bimba itself.
- MCP is current external exposure but an adapter/protocol, not Bimba itself.
- Redis cache/runtime and embedding/reranking providers are auxiliary technical bodies.
- existing M0' Theia renderer code is historical/current-shell evidence, not future product-form authority.
- legacy `#` exports remain important compatibility/provenance material but canonical resolved identity is M-family.
- source field normalization and deterministic core-65 ↔ S2 projection audit remain concrete follow-up work; neither changes the frozen identity/write-owner model.
