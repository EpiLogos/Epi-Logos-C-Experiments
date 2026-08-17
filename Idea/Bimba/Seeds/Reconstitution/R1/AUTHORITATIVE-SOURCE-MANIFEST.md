---
coordinate: "M'/S/S'/Bimba"
c_4_artifact_role: "reconstitution-source-manifest"
c_1_ct_type: "CT1"
c_3_created_at: "2026-08-17"
c_0_source_coordinates:
  - "[[M'-SYSTEM-SPEC]]"
  - "[[S-SYSTEM-INDEX]]"
  - "[[Bimba]]"
---

# RECON-R1 Authoritative Source Manifest

Issue: #3, parent #2.

This manifest freezes the source field used for RECON-R1 before capability interpretation. It is pinned to repository `EpiLogos/Epi-Logos-C-Experiments` default-branch head:

- repository head: `8608648f33e697dd5a8c5f499492619a02259af5`
- root tree: `79eb8ac8771326fa8422275edfbdcb6497a9256b`
- `Idea/` tree: `a5e2181b29d844cbe60ae5f59c5bd7bef5870432`
- `Idea/Bimba/` tree: `10d8d9978e52497b03a6ed2fd52c0d7ffb9db7c1`
- `Idea/Pratibimba/` tree: `6b40a59a653430c07e680e505c9f580649210545`
- `Body/` tree: `1fc2c680f770b97e1dc902026a14552c28ac87b5`

All paths below are interpreted at that pinned head unless an explicit blob/tree revision is given.

## 1. Source-precedence rule for this freeze

For RECON-R1, conflicts are resolved in this order:

1. active/current M/M' domain specifications and their current deep development material;
2. current Bimba map/schema/contracts and source-of-truth implementation;
3. current tested implementation evidence;
4. current architecture/design documentation;
5. developmental plans and research material;
6. explicitly legacy/historical material.

A lower-precedence implementation body does not become a domain requirement merely because it exists. In particular, Theia/Tauri, Neo4j, MCP, Redis, Graphiti, gateway/process topology, and other runtime choices are inventoried as bodies/providers/adapters unless a current higher-precedence specification assigns them semantic ownership.

## 2. Repository ontology / navigation authorities

| Source | Revision | Role in R1 |
|---|---|---|
| `repo-ontology.md` | blob `a56acae95640a26944ee4fbbb30ec2903703a09c` | Current repository authority separating executable `Body/` from reflective `Idea/`; establishes `Idea/Bimba/Seeds` as planning/spec source surface and `Idea/Bimba/World` as crystallised form surface. |
| `Idea/Pratibimba/System/Subsystems/README.md` | blob `bc2a0e879198c9982b6753d73cd8939fda6b20a4` | M' subsystem index and source-pointer document. Useful for provenance; its Theia runtime-authoring sentence is not treated as a future product-form requirement. |
| `Idea/Bimba/Seeds/ARCHITECTURE-DIAGRAM-PACK.md` | blob `35a6bd2328248413a291bf72a25213dd76078f89` | Current cross-system diagram/source navigation pack. |

## 3. M / M' domain authority

The authoritative six-system domain field is the M/M' family. `M` is the canonical Bimba coordinate image/topology; `M'` is its Pratibimba/lived-reflected operational expression. S/S' supplies technical bodies and protocols; it is not the six-domain naming family.

### Parent specifications

| Source | Revision | Status / role |
|---|---|---|
| `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md` | blob `489e0eccabe66c94f38292577e14b710b52de988` | `active-system-spec`, updated 2026-05-31; parent M' domain/system authority. |
| `Idea/Bimba/Seeds/M/M'-PORTAL-SPEC.md` | blob `f174b559efc1a2617201b6119c7b561ab20b5709` | Current portal/surface contract source. |
| `Idea/Bimba/Seeds/M/M-M-prime-coordinate-mapping-inaugural.md` | blob `eb2f506aa56a041cb5af70638c5eef26e14c34b5` | M↔M' coordinate/reflection source. |
| `Idea/Bimba/Seeds/M/M-SYSTEM-INDEX.md` | blob `51543009f052269dfc52935050686232fdc3cfa6` | M-family navigation index. |
| `Idea/Bimba/Seeds/M/M-SYMBOLIC-LANGUAGE-ARCHITECTURE.md` | blob `641104d716678b09eb1f37772cf81474c331d84f` | Current cross-M symbolic/transcription architecture. |

`Idea/Bimba/Seeds/M/M'-TAURI-PORT-SPEC.md` (blob `e5be1969f3fbbdfc8d2ba84327e2eb425d2471f3`) is retained as implementation/migration evidence, not as future shell authority in R1.

### Six active M' domain specifications

| Domain coordinate | Canonical name | Active spec | Revision |
|---|---|---|---|
| `M0'` | Anuttara / Bimba-map ground surface | `Idea/Bimba/Seeds/M/M0'/M0'-SPEC.md` | blob `92550a16cc77a71f498905b36b380fe4d9434622` |
| `M1'` | Paramasiva | `Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md` | blob `c2d1551e91e29dc3bb31f64564f2ad38c95df7ab` |
| `M2'` | Parashakti | `Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md` | blob `50f8df19da5a4d9d85e40e8b10f0dff7591ea0a3` |
| `M3'` | Mahamaya | `Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md` | blob `7b6f751d8b7efaf11da0ed884ce46fe6a722e296` |
| `M4'` | Nara | `Idea/Bimba/Seeds/M/M4'/M4'-SPEC.md` | blob `83eaeb176fe1542812a59573cd9ec5741207fdc8` |
| `M5'` | Epii | `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md` | blob `bc196255cb9f61d5c457057e2867abed5807adce` |

The corresponding current deep-development trees are:

- M0': tree `9ba1676e4e5104ac25eb623491b025b19f6e92e3`
- M1': tree `818e63f9f9a313669c5313d7fbc2c32f171d6185`
- M2': tree `55a7fd00a14e3b7d5221a6211061d51eb9a44aea`
- M3': tree `c03de9c6f33358975c6ec5bd6b93194e5d225060`
- M4': tree `1839c4a9e0ca6fc94c11aae1aa76afbf27dd1a19`
- M5': tree `9400a627f793de3c76e33464f206926e7cafbac9`

These trees contain the per-domain architecture documents, current prime research/development material, migration deltas, and experiments used to distinguish canonical/current/planned/research status in the capability inventory.

## 4. S / S' technical-stack authority

The current technical-stack authority is `Idea/Bimba/Seeds/S/S-SYSTEM-INDEX.md`, blob `2ce3685d47beec17e8e0264e1cda51360fadfefc`. It explicitly defines S0-S5 as technical/runtime strata and the prime side as Epi-Logos-aware augmentation/semantic law over those bodies.

| Stack | Current master spec | Spec revision | Level tree | Prime/conjugate tree |
|---|---|---|---|---|
| S0/S0' | `Idea/Bimba/Seeds/S/S0/S0-SPEC.md` | `8c25e45ec071d91c59198c80d8d4bf49424efa7e` | `e25f7afa6f1b395da057b0631caef1ea4cd39b8a` | `a8326a14c4904655802c091c8399a89cabef5ef6` |
| S1/S1' | `Idea/Bimba/Seeds/S/S1/S1-SPEC.md` | `177b9fe9145ef881087425e5daa8100ec7f73746` | `a5e93f2905d529ea9ff25878c6643014813cbd84` | `f63f87893e58b3954c9acb37da1a3f2e06e41e59` |
| S2/S2' | `Idea/Bimba/Seeds/S/S2/S2-SPEC.md` | `e8738138907b5711e5bafa13fcfb7223a890856c` | `01da3dafb7cf2d593de81f57fcce727b0381dbf8` | `39be9faedf804e648c8003f34217a66565cfc142` |
| S3/S3' | `Idea/Bimba/Seeds/S/S3/S3-SPEC.md` | `33a6f9eed0a867684f8f693fe63c4c8253cac7c4` | `0125b7aed26f6f7bd3513e83d9679ae641782db5` | `d4c16c405b509197dfd656e9b0cbccf25d8764bd` |
| S4/S4' | `Idea/Bimba/Seeds/S/S4/S4-SPEC.md` | `62ecb0c4e9f8d267ce60700624928197430b3631` | `244f13c1ebc5f79f374aa9fd6ea2638224c4ae48` | `e45141a6fe26336cbcb72425c75c8c6dadf0903c` |
| S5/S5' | `Idea/Bimba/Seeds/S/S5/S5-SPEC.md` | `067d0deb1dfa054b4500468c2e7ee194c7a9297d` | `a65ddb0d59fee42c3579065bb0e1cd5d2bd1e0eb` | `9728bc5bbcc7c486247710d895080c8c9184de77` |

The top-level `Idea/Bimba/Seeds/S/S'` directory is only a placeholder (`.gitkeep`, blob `e69de29bb2d1d6434b8b29ae775ad8c2e48c5391`). The substantive prime/conjugate specifications live under each level's `Sx/Sx'` tree. R1 therefore inventories those per-level trees rather than treating the empty top-level directory as missing semantics.

### Cross-stack contract / residency authorities

| Source | Revision |
|---|---|
| `Idea/Bimba/Seeds/S/PROTOCOL-S-COORDINATE-MODULE-SPEC-BUILD.md` | `25f08a8cf0c33811d3fc268075b71b919b542e29` |
| `Idea/Bimba/Seeds/S/S-CODE-RESIDENCY-AUDIT.md` | `c88b3f4fe36f6eca2bed6a9fa9d4ef8a7064c40a` |
| `Idea/Bimba/Seeds/S/S-CODE-RESIDENCY-PLAN.md` | `8a416230d8d22dfb3788c371f8de857b45745610` |
| `Idea/Bimba/Seeds/S/S-SOURCE-TRACEABILITY-INDEX.md` | `d4c7f66f32d27785771139acd3252a232b6ee97d` |
| `Idea/Bimba/Seeds/S/S-SHARDING-TASK-LIST.md` | `dd1d2ab355a0b404ab716f5aa01391fcc60671b4` |
| `Idea/Bimba/Seeds/S/FLOW-2026-04-11-S-COORDINATE-LATTICE-SCAFFOLD.md` | `ad9dd022a7ff0148822243bc1bde865952b895fe` |
| `Idea/Bimba/Seeds/S/FLOW-2026-04-11-S-COORDINATE-LATTICE-SCAFFOLD.csv` | `e37f01f8606a771ebe554de8bdf4110a2a0637e6` |
| `Idea/Bimba/Seeds/S/FLOW-2026-04-22-ENVELOPE-FIELD-SCHEMA.md` | `708ae56d799952dc636ee3311939158f276ea381` |
| `Idea/Bimba/Seeds/S/FLOW-2026-04-22-SYSTEMS-RESIDENCY-AND-LATTICE-NAMING.md` | `53ce7ded61bd1b103a61aaf8ec002cd19d8a560e` |
| `Idea/Bimba/Seeds/S/FLOW-2026-05-08-HERMES-AGENT-PARITY-MATRIX.md` | `46398b40de5a07e09526050ff2dd327e2f6b346c` |

## 5. Bimba / map authority

The current checked-in Bimba map corpus is rooted at `Idea/Bimba/Map`, tree `cd4f4f77c13f27e2563c5a6753d2f8bf2b605f15`.

| Source | Revision | R1 use |
|---|---|---|
| `Idea/Bimba/Map/deep-property-map.md` | `e954d2b4b9d11ca275d9043db1ea75f1d9888232` | Deep property/field map evidence. |
| `Idea/Bimba/Map/hashtag_node_data.md` | `bd71ea8c13b6c09d4fe53bac0c9fe5dc5265dd07` | Legacy-`#` / coordinate node evidence. |
| `Idea/Bimba/Map/nodes_hash.json` | `7a74948a1ddf4bfe723ed28091dc45bbc7c04a38` | Deterministic checked-in node hash/index evidence. |
| `Idea/Bimba/Map/relations_hash.json` | `3dca5c553f84abe29a937d7945f65da74070d1b9` | Deterministic checked-in relation hash/index evidence. |
| `Idea/Bimba/Map/fetch_bimba.py` | `42ff8929319713de26775c99a17543f54d8d49db` | Material-store export/fetch evidence; not Bimba semantic identity. |

Deep map subtrees:

- Anuttara: `795de0d4a27004876270dbcb61bb2f75483c0845`
- Paramasiva: `fc7703548d230d1f1f3dd7a4dd2f04ae3ad52c75`
- Parashakti: `bf083dddd3d20ce50009d634f0f2cef1e4edb35c`
- Mahamaya: `5829a0cd363b8601cea3509779cb86ddc3c14784`
- Nara: `3281e2ec7805ba1dbea806227d47b2a68b1f0769`
- Epii: `0a8cfd677262f475ae70161fe7534d0f01628208`
- map migrations: `defda872392c0dcdc06cd5355f00cff712b79402`
- map scripts: `49fe2f6f770a9e9c4df2c3b1b437bb68084485f8`

R1 treats `M`/Bimba semantic coordinate identity separately from Neo4j storage and from MCP exposure. Storage/protocol implementations are implementation evidence and provider/adapter dependencies unless the current semantic specifications say otherwise.

## 6. Known source-language conflict recorded, not guessed away

Issue #3's prose calls the six named Epi-Logos systems `S0`-`S5`. That wording conflicts with the current active corpus:

- `M'-SYSTEM-SPEC.md` assigns the six named Epi-Logos domains to `M0'`-`M5'`;
- `S-SYSTEM-INDEX.md` assigns `S0`-`S5` to technical/runtime layers and their prime augmentations.

RECON-R1 follows the current active specifications: **M/M' is the six-domain Epi-Logos field; S/S' is the technical/runtime stack.** The issue wording is retained as ticket provenance but is not allowed to overwrite the repository's active coordinate law.

A second, lower-precedence conflict is the Subsystems README's statement that runtime work belongs in `Body/M/epi-theia`. Current `repo-ontology.md` and `S-SYSTEM-INDEX.md` instead identify Body-native `Body/S/Sx/...` roots as active code authorities and root/older paths as migration debt. R1 therefore treats Theia as historical/current-shell implementation evidence to classify, not as the reconstituted architecture boundary.

## 7. Freeze rule

Every substantive capability record produced after this manifest must cite one or more paths above (or an implementation/test path at the same pinned repository head), preserve the distinction between canonical semantic ownership and technical materialisation, and explicitly mark unresolved evidence rather than filling it from memory.
