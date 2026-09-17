# Track 45 — Bimba Map Repo-Level Indexing + DOX/OKF Unification (RERUN — target: pratibimba-app + substrate)

Source of truth for every tranche below: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/45-bimba-map-indexing-and-dox-okf-unification.md` — read the tranche's section IN FULL there before executing; this file carries only retarget + audit posture. Retarget law, resolved decisions, and verification law: `CHARTER.md`. Audit map: [[2026-07-03-cycle-3-recapture-register]] §2 (track 45). Original ledger statuses are CLAIMS about the dead Theia carrier, never truth about this one. Track 00 (verification harness) gates all closure here.

**⚑ Carrier (track 45) — build/verify HERE, never epi-theia:** SUBSTRATE — Bimba Map indexing / DOX-OKF (crystallisation upward Hen vs reflection downward Map projection never re-promotes; five cross-language normaliser impls must stay in sync; Hen is_valid_coordinate rejects depth>=2 — real gap). Coordinate rendering must use gateway-side normalisation, never a 6th local impl. §2 track 45.

1. **T0 — Absorb and retarget: 45-bimba-map-indexing-and-dox-okf-unification.md (law-only source)**

   Brief: read `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/45-bimba-map-indexing-and-dox-okf-unification.md` IN FULL. It carries binding law/design with no tranche list. Enumerate its unbuilt commitments against the current carrier (register §2 track 45 lists known gaps) as new numbered tranches appended to THIS file, then close this task with the enumeration as evidence.
   Depends on Track 00 Tranche 3.
   Verify: new tranches parse into the ledger (re-run the assess script and show the new task ids); each cites its original section.

---

## Enumerated tranches (T0 output — Track-45 L2 operative gaps)

*Enumerated from the source law (`../2026-06-02-m-prime-cycle-3-design-reconciliation/45-bimba-map-indexing-and-dox-okf-unification.md`, read in full) against [[2026-07-03-cycle-3-recapture-register]] §2 track 45 (`Idea/Bimba/Seeds/M/plans/2026-07-03-cycle-3-recapture-register.md:73-74`). The source's L1 layer (markdown projection + DOX/OKF nodes + `project-map-index.mjs` + `bimba-vault-validate` update, source §8 L1) landed in its authoring session and is NOT re-enumerated. These rows capture the source's L2 operative/code-reality deliverables (source §8 L2) that the register attributes to Track 45. The lower-priority L2.4 OKF bundle-export adapter (source §7, "low priority") is noted here and left unenumerated. Each row grounded with a 2026-07-10 receipt.*

2. **T45.1 — Extend Hen `is_valid_coordinate` to the full multi-level coordinate grammar (+ tests)**

   Brief: source §7 coordinate-grammar gap (`../2026-06-02-m-prime-cycle-3-design-reconciliation/45-bimba-map-indexing-and-dox-okf-unification.md:255-268`) + §8 L2.1 (`:286`) in full. Hen `is_valid_coordinate`/`is_valid_family_coordinate_base` (`Body/S/S1/hen-compiler-core/src/coordinate.rs:14-49`) accepts only depth 0–1 and REJECTS the ontology's own deep coordinates, so `/map` nodes at depth ≥ 2 cannot round-trip through the Rust compiler. Extend to the full multi-level grammar (`MX-Z-Y-A`, deep `#…`, context-frame parens, primes at any level) with tests. Central function — `gitnexus_impact` before editing + DOX/spec flag to [[S1-SPEC]]. Substrate work — carries unchanged per `CHARTER.md`. VERIFIED UNBUILT (2026-07-10: `is_valid_family_coordinate_base("M2-5-0")` → `split_once('-')` yields child `"5-0"`, `is_valid_position("5-0")` fails to parse as a single `u8` → REJECTED; `#0-2-9` rejected at coordinate.rs:20 by the same single-`u8` parse).
   Depends on Track 00 Tranche 3.
   Verify: `cargo test --manifest-path Body/S/S1/hen-compiler-core/Cargo.toml` covers deep coordinates — `is_valid_coordinate("M2-5-0")`, `is_valid_coordinate("#0-2-9")`, a context-frame `M0-4.(0/1)`, and a prime `M2-5-0'` all accepted; invalid over-range/over-depth still rejected; verifier ≠ closer.

3. **T45.2 — Graduate the map projector into a maintained Neo4j→repo sync direction (map-index freshness)**

   Brief: source §4.5 projector as "operative seed" (`../2026-06-02-m-prime-cycle-3-design-reconciliation/45-bimba-map-indexing-and-dox-okf-unification.md:213-221`) + §8 L2.2 (`:287-288`) + §6/§8 L2.3 M↔S reflection fill (`:249-251,289`) in full. The projector `project-map-index.mjs` is still a vault-side script; L2 graduates it into a maintained `graph_sync neo4j_to_obsidian` direction scoped to `map-index`, sourced from the live graph, so `/map` stays fresh as the graph changes (and the `Reflects/Resonates` M↔S section fills from live cross-namespace edges rather than curated seeds). Reflection-downward only — never re-promotes the data (source §3). Substrate work (S2 / bimba-mcp) — carries unchanged. Register-grounded PARTIAL (2026-07-10: `project-map-index.mjs` present vault-side; 7 `map-index`/`neo4j_to_obsidian` refs under `Body/S/S2/external/bimba-mcp/src` — scaffolding exists, the maintained scoped sync direction is unproven).
   Depends on Track 00 Tranche 3.
   Verify: `graph_sync neo4j_to_obsidian` scoped to `map-index` re-projects a changed graph node into its `/map` file idempotently (freshness proof); no re-promotion of map-index rows upward; verifier ≠ closer.

4. **T45.3 — Carrier coordinate rendering via gateway-side normalisation (guard against a 6th local impl)**

   Brief: source §3.3 coordinate-algebra normalisation + the five-impl cross-language parity note (`../2026-06-02-m-prime-cycle-3-design-reconciliation/45-bimba-map-indexing-and-dox-okf-unification.md:171-194`) + register §2 track 45 CARRIER ("coordinate rendering must use gateway-side normalisation — never a 6th local impl", `Idea/Bimba/Seeds/M/plans/2026-07-03-cycle-3-recapture-register.md:74`). The normalisation algorithm (`#`→`M`, context-frames parenthesised with the position-N `.` rule, `/`→`∕`) lives in five synchronised impls; the pratibimba-app carrier MUST render coordinates through the gateway-side normaliser and never add a sixth local copy. Wire carrier coordinate display through the gateway normalisation seam and add a guard test/lint that fails if a local `wrap_context_frames`-equivalent appears under `Body/M/pratibimba-app/src`. Carrier work per `CHARTER.md`. Register-grounded (2026-07-10: constraint currently HELD — 0 local normaliser impls on the carrier, only a `contextFrame` field at `Body/M/pratibimba-app/src/bridge/types.ts:504`; this row lands the forward-guard + gateway-normalised render path).
   Depends on Track 00 Tranche 3.
   Verify: carrier renders a deep/context-frame coordinate in canonical form sourced from the gateway (not a local transform); a guard test fails when a local normaliser is introduced under the carrier `src`; verifier ≠ closer.
