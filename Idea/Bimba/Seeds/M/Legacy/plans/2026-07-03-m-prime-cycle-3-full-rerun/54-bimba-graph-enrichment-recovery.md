# Track 54 — Bimba graph enrichment recovery from the transaction log

**This track is hand-authored and self-contained** — each tranche carries its full brief inline. Verification law: `CHARTER.md`. Track 00 gates all closure here.

**⚑ Carrier (track 54):** SUBSTRATE only — the forensic archive at `~/bimba-forensic/`, the live `epi-neo4j` instance, and a throwaway Neo4j for every experiment. No pratibimba-app surface. Class **W** (live-wire): the acceptance is a live graph read.

---

## What happened, so it is on the record

On **2026-07-28 ~19:42 BST** `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml -- --ignored` was run against the live development Neo4j. `Body/S/S0/epi-cli/tests/graph_seed.rs:14` executed `MATCH (n:Bimba) DETACH DELETE n` as a "clean slate", `seed::seed_coordinate_space` wrote its 102-node bootstrap scaffold, and the test then died at `:69` on `missing [gemini_embedding].canonical_context_limit_bytes` — **after the wipe, before any re-seed**. The `:Bimba` namespace (~2,800 nodes) was replaced by 102 seed nodes. `:Entity` (575), `:Episodic` (374), `:Coordinate` (73) were untouched.

Two recovery paths were then lost and must not be re-attempted: the APFS snapshot `com.apple.TimeMachine.2026-07-28-185859.local` (43 min pre-wipe) was purged when 52 GB of `target/` was deleted on a 97%-full disk, and `Docker.raw` is `[Excluded]` from Time Machine by default so no TM backup exists.

**A base restore has already landed** (2026-07-28, same day): `epi graph import all` over `Idea/Bimba/Map/datasets` returned 1,912 `:Bimba` nodes / 11,862 relationships, verified at **996/996 Map coordinates present, zero missing**, with `graph-live` PASS. A first-pass enrichment layer from session transcripts brought q/qm registers to 270.

**What this track recovers is the remainder** — the deep node detail and property enrichment written between the 2026-05-17 dataset ingestion and the wipe, which neither the datasets nor the Map projection carry.

---

## The asset

`~/bimba-forensic/neo4j-data-forensic-20260728.tar.gz` (60 MB), frozen from the live volume **after** the wipe but **before** any other action.

| Component | Verified state |
|---|---|
| `transactions/neo4j/neostore.transaction.db.0` | **118 MB live data**, header `lastCommittedTxId = 1` → covers from DB birth 2026-03-07. Version `.0`: **never rotated, never pruned.** |
| `neostore.propertystore.db.index.keys` | **6,282** property-key tokens, incl. **732** `q_*`/`qm_*` — `strings`-derived, superseded by T54.01, see below |
| `neostore.labeltokenstore.db.names` | **460** labels |
| `neostore.relationshiptypestore.db.names` | **1,536** relationship types |

**Corrected by T54.01 (2026-07-29).** The counts above were read with `strings` and are wrong in *both* directions, for the same reason gotcha 4 gives: `strings` cannot see record structure. Decoded properly from the token commands in the log itself, the real figures are **5,930** distinct property keys (incl. **788** `q_*`/`qm_*`), **463** labels, **1,421** relationship types — independently agreed by this track's Rust decoder and by Neo4j's own `LogEntryReader`. The store's apparent surplus is fragmentation: 1,066 of its `strings` hits are truncated payloads carrying a leading record-header byte (`(c_1_mirror_component_inheritan`, `\m_1_processual_topology_substr`), not token names. In the other direction `strings` missed **687** real names outright, including every `__org.neo4j.SchemaRule.*` internal key. **The log is the decoder ring, not the store** — it runs from database birth, so every token creation is in it, and it needs no post-wipe store file to resolve an id.

Tokens are never deleted, so the decoder ring for the log's numeric IDs survived the wipe intact. Destroyed content is provably inside the log: `Picatrix` ×11, `Ficino` ×52, `decan` ×570, `"ethical interiorisation"` ×3, `M2-3` ×14, plus coherent multi-paragraph q-register prose.

`~/bimba-forensic/neo4j-RESTORED-20260728.tar.gz` (64 MB) is the post-restore state.

---

## Gotchas — read before writing a line of this track

1. **`query.log` is empty and always will be.** Cypher query logging is Enterprise-only in Neo4j 5 Community. There is no log of executed statements. The **transaction log** is the record, and it is a different file — do not confuse them or conclude "there is no log".
2. **Neo4j cannot rebuild a store from logs alone.** Tested: empty `databases/neo4j/`, keep `transactions/`, start `neo4j:5.26.21` → `RuntimeException: Fail to start 'neo4j' since transaction logs were found, while database files are missing`. `db.recovery.fail_on_missing_files=false` **was applied** (confirmed at `neo4j.conf:356`) and does not override it. Do not spend a session re-discovering this.
3. **Store-file carving is dead.** `neostore.propertystore.db.strings` has **zero** hits for `Picatrix`/`decan` — the delete's pages were reclaimed. The transaction log is the only source.
4. **`strings` extraction massively undercounts.** It yields ~205 coordinate-shaped strings because Neo4j **inlines** short strings (`M2-3`, 4 chars) as packed bits inside the property record. A binary parser must decode the inline encoding; anything less silently loses most coordinates.
5. **The Map is NOT a substitute and must not be bulk-merged.** `Idea/Bimba/Map/` carries the relational structure and a q-register projection — not deep node detail or the full property set. Worse, the `l_*` family and the M′ coordinates are **nodes, not properties**; treating them as a property map to merge is a category error. Use the Map only to *verify* coverage.
6. **The base restore already happened.** Do not re-run `epi graph import all` expecting it to fix enrichment — it restores the 2026-05-17 ingestion state and nothing later.
7. **Never point a destructive or experimental run at `bolt://localhost:7687`.** Every experiment runs against a throwaway instance on another port, restored from the forensic tarball.
8. **T54.01 decodes every property encoding except `TEMPORAL` and `GEOMETRY`.** Those are carried through losslessly as `PropertyValue::Unsupported { kind, blocks }` — the raw block words survive intact and a test pins that — but they are *not* interpreted into datetimes/points. Temporal values are common (timestamps like `c_3_created_at`), so **T54.02 must decode them before emitting Cypher**, or every reconstructed node loses its timestamps. This is a named gap, not an oversight: the T54.01 brief asks for short-string, packed-array and dynamic-chain decoding and stops there.
9. **`verify-tranche` executes every backticked command-shaped fragment on a `Verify:` line.** A prose warning that quoted an unscoped ignored-test sweep was therefore *run* against the repo root on 2026-07-29 during T54.01 verification. It did no damage — `epi-cli` is a separate workspace, so the `graph_seed.rs` wipe was not in the root workspace's test set, and the live graph was confirmed intact at 1,978 `:Bimba` afterwards — but the near-miss is on the record. Never write a command-shaped backtick on a Verify line except as a command you intend to be executed.

---

1. **T54.01 — Decode the transaction log into a typed command stream**

   Brief: The log is Neo4j **5.26.21**, `record-aligned` format, log header version 9. Entries are `[version byte][type byte][payload]` with types `TX_START`, `COMMAND`, `TX_COMMIT`, `CHUNK_START`/`CHUNK_END`. Commands carry **both before- and after-images**, which is the entire basis of recovery: the mass-delete transaction's commands contain the full before-image of every destroyed node, property and relationship.
   Build: a decoder (Rust, in a dev-only crate or `Body/S/S2/graph-services` behind a feature) that walks `neostore.transaction.db.0` and emits a typed stream of `NodeCommand` / `PropertyCommand` / `RelationshipCommand` / `RelationshipGroupCommand` / token commands, each with its transaction id and both record images. Resolve numeric ids through the surviving token stores. Decode inline short-string and packed-array encodings, and follow `DynamicRecord` chains for long values.
   Depends on Track 00 Tranche 3.
   Verify: real behavioral proof per Track 00 — the decoder reports a transaction count and a per-command-type census over the real 118 MB log; a round-trip test asserts a known destroyed value is decoded verbatim (`M2-3.q_2b_ethical_interiorisation` must contain both "Picatrix" and "Ficino"); the last `TX_COMMIT` is identified and any incomplete trailing transaction is refused rather than half-applied. verifier ≠ closer; evidence = fresh command output.
   Verify: `cargo test --offline --manifest-path Body/S/S2/graph-services/Cargo.toml --features txlog-forensics` (unit tests plus the golden suites: array decoding and inline node-label unpacking, both asserted against fixtures produced by Neo4j's own decoders) and `cargo test --offline --manifest-path Body/S/S2/graph-services/Cargo.toml --features txlog-forensics --test txlog_forensics_real_log -- --ignored --test-threads=1`. The second needs the forensic archive extracted to `~/bimba-forensic/work` (`tar xzf ~/bimba-forensic/neo4j-data-forensic-20260728.tar.gz -C ~/bimba-forensic/work ./transactions/neo4j/neostore.transaction.db.0`); it is `--ignored` because the 60 MB archive is evidence and is deliberately not in the repo. Always name the single `--test` target, as above. Never satisfy this by sweeping a whole crate's ignored tests — an unscoped ignored-test sweep is the command shape that caused this incident, and `verify-tranche` executes every backticked command-shaped fragment on a Verify line, so such a fragment must never be written here even as a warning.

2. **T54.02 — Reconstruct the pre-wipe graph state and emit reviewable Cypher**

   Brief: Replay the decoded stream forward from the log's start, maintaining in-memory nodes, properties and relationships, and **stop at the transaction immediately before the mass delete**. Identify that transaction by its size (~2,800 `:Bimba` node deletions in one tx) and confirm it by checking the next transaction is the seeder's 102 `MERGE`s. That state is the graph as it stood at 19:42 BST on 2026-07-28.
   Build: `recovered-bimba.cypher` — `MERGE` on `coordinate` for nodes, `SET` for properties, typed `MERGE` for relationships, plus a JSON audit carrying each value's originating transaction id. Emit a diff against the CURRENT live graph so the reviewable artifact is the *delta*, not a full dump nobody can read.
   Depends on `54.T54.01`.
   Verify: real behavioral proof per Track 00 — reconstructed `:Bimba` count is reported against the ~2,800 expectation and against the 1,912 the base restore produced; **every one of the 996 `Idea/Bimba/Map` coordinates appears** (that check already exists as a shell one-liner in this track's history and must be automated here); the reconstruction is loaded into a THROWAWAY instance and `Idea/Bimba/Map` regeneration is re-run against it, with `git diff` on the Map reported as the fidelity measure. verifier ≠ closer; evidence = fresh command output.

3. **T54.03 — Apply to the live graph behind a backup, and prove the enrichment landed**

   Brief: Only after `54.T54.02`'s throwaway verification passes. The live graph currently holds the base restore plus a first-pass transcript enrichment (270 q/qm registers). This tranche brings it to the reconstructed state.
   Build: take a fresh offline volume tar first (`docker run --rm -v epi-logoscexperiments_neo4j-data:/data ... tar czf`, since `neo4j-admin database dump` needs a stopped DB on Community and will fail otherwise). Apply the delta. Record before/after counts for nodes, relationships, distinct `q_*`/`qm_*` keys, and distinct `l_*`/`m_*`/`p_*`/`s_*`/`t_*` keys.
   Depends on `54.T54.02`.
   Verify: real behavioral/live-wire proof per Track 00 — `node .codex/scripts/graph-live.mjs` PASS; distinct q/qm registers reported against the **732** tokens in the forensic store as the ceiling and the 270 currently live as the floor; `Body/S/S0/epi-cli/tests/lut_graph_parity_live.rs` and `parashakti_correspondences_live_graph.rs` green against the restored instance. verifier ≠ closer; evidence = fresh command output.

4. **T54.04 — Session-log cross-validation, independent of the log parser**

   Brief: A second source that does not share the parser's failure modes. bimba-mcp calls are recorded verbatim in Claude and Codex transcripts. Measured surface: **3,091 transcript files**; actual tool invocations are `graph_cypher` ×350 (of which only **1** is a write — the `2026-06-17-position4-frame-coordinate-canon` migration, already in `datasets/migrations/`), `graph_set_property` ×62, `graph_sync` ×4, `graph_upsert_node` ×1. Graph **read-backs** in `tool_result` blocks are the richer seam: each is a point-in-time snapshot of a node's full property map.
   Build: a hardened extractor over both harnesses. Three bugs already cost silent data loss and must not recur — (a) never `json.dumps` a record before unescaping, it re-escapes what you are stripping; (b) never pre-filter on the literal `"coordinate"`, escaped payloads spell it `\"coordinate\"`; (c) the property window must be **bidirectional**, since a serialised node map does not always place `coordinate` first (M2-3's `q_3` sits before its anchor). Existing first-pass scripts are in this session's scratchpad and recovered 855 properties / 74 coordinates / 316 q-registers.
   Depends on `54.T54.01`.
   Verify: real behavioral proof per Track 00 — the extractor's output is diffed against `54.T54.02`'s reconstruction and **every disagreement is enumerated**, not summarised; agreement rate reported per property family. verifier ≠ closer; evidence = fresh command output.

5. **T54.05 — Backups, so this is a five-minute inconvenience next time**

   Brief: There was no backup. That is the root cause of the severity, independent of the test that fired.
   Build: a scheduled offline volume snapshot of `epi-logoscexperiments_neo4j-data` to a host path **outside** `Docker.raw`; remove that path from Time Machine exclusions (`Docker.raw` itself is excluded by default, which is why TM held nothing); retain N days. Document restore in a runbook next to the backup, including that `neo4j-admin database dump` requires a stopped database on Community edition.
   Depends on `54.T54.03`.
   Verify: real behavioral proof per Track 00 — a backup is taken, the live graph is restored **from that backup into a throwaway instance**, and node/relationship/q-register counts match the source. A backup never restored is not a backup. verifier ≠ closer; evidence = fresh command output.
