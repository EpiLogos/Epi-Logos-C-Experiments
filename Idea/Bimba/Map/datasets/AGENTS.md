# AGENTS.md — Map/datasets (DEPRECATED SEED ARCHIVE)

## Purpose
`Idea/Bimba/Map/datasets/` is a **deprecated seed archive**. It holds the raw per-branch
dataset JSON (`{anuttara,paramasiva,parashakti,mahamaya,nara,epii}-deep/`, `low-detail/`),
enrichment docs, node/relation hashes, and the historical import/fetch/cypher scripts that
**were used, once, to seed the Neo4j Bimba graph**. Seeding is complete.

**The live Neo4j Bimba graph is now the authority.** These files are frozen provenance — a
record of what was imported, not a live source. See parent contract [[AGENTS]] (`Idea/Bimba/Map`)
and the reflection/crystallisation law in [[45-bimba-map-indexing-and-dox-okf-unification]].

## Ownership / Canon Boundary (non-negotiable)
- **Nothing may READ these files at runtime or in tests as a source of truth.** Runtime
  correspondence data (decan chains, asma names, planetary/chakral harmonics, maqam, …) comes
  from the live graph via the `Neo4jClient` seam, cross-checked bridge-side against the kernel
  LUTs. A test or adapter that serves a value out of `datasets/**` is a violation.
- The standing anti-leak guards live in the live-graph suites and assert the *negative* — that
  no `Idea/Bimba/Map/datasets` path and no `nodes-full-detail.json` string ever appears in a
  live artifact:
  - [[lut_graph_parity_live]] (`Body/S/S0/epi-cli/tests/lut_graph_parity_live.rs`) — the standing
    kernel-LUT ↔ live-graph parity sweep (36 `Decan`, 99+72 `DivineName`, `PlanetaryHarmonic` /
    `ChakralCenter`).
  - [[parashakti_correspondences_live_graph]]
    (`Body/S/S0/epi-cli/tests/parashakti_correspondences_live_graph.rs`) — the gold-standard live
    seam for `s2.parashaktiCorrespondences`.

## Sanctioned exceptions (only these two — do NOT widen)
1. **`dataset_import` is retained as historical seed tooling.** The importer
   (`Body/S/S2/graph-services/src/dataset_import/**`, `graph/dataset_import.rs`) and its scripts
   here remain so the seed run is reproducible from provenance. They are **seed-time tooling, not
   a runtime read path** — do not invoke them to satisfy a live query.
2. **The Vortex Modulae CSV is separately sanctioned spec-law.**
   `(0_1) Vortex Modulae - (0_1) x 12Fold and 8_9fold (mod12 and mod10) Archetypal Number
   Identities - Sheet1.csv` is the canonical 12×12 archetypal-number authority read by the kernel
   truth suite `m1_ananda_12x12_raw_fidelity_vs_vortex_modulae_csv`
   (`Body/S/S0/portal-core/tests/kernel_truth.rs`) — the expected-RED fidelity test for
   `m1_ananda_get` per the 00-verification-harness register §T4(e) / Track 10.10. This CSV is spec
   authority, not seed provenance, and is exempt from the no-read rule.

## Local Contracts
- No `CONTRACT.md` / crate here — frozen provenance + spec CSV.
- Projector `scripts/project-map-index.mjs` reads the seed JSON to regenerate the `M0/`–`M5/`
  navigation projection; that is a **repo-projection convenience over frozen provenance**, not a
  runtime data path, and it never re-promotes into the graph (reflection is downward-only).

## Work Guidance
- To change correspondence data, change the **live graph** (the authority) — never edit a
  `*-deep/` JSON expecting a runtime effect; nothing reads it.
- Do not add new runtime readers of `datasets/**`. If you think you need dataset data at runtime,
  you need a live-graph query plus a kernel-LUT cross-check instead (see the parity sweep).

## Verification
- Grep guard: `rg -l "Idea/Bimba/Map/datasets|nodes-full-detail.json" --type rust Body/`
  enumerates every code reference. The live correspondence suites (`lut_graph_parity_live`,
  `parashakti_correspondences_live_graph`) assert the **negative** (no-leak); the only sanctioned
  readers are the `dataset_import` seed tooling and the Vortex Modulae CSV test above. **No NEW
  positive runtime read may be added** — audit any addition against this boundary.
- `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test lut_graph_parity_live` (live
  Neo4j required) proves the LUTs mirror the graph without touching these files.

## Child DOX Index
- `*-deep/`, `low-detail/`, `migrations/`, `scripts/` — (leaves) frozen seed provenance + seed
  tooling; no nested AGENTS.md.
