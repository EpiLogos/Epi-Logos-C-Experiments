# Track 53 — S-Stack Residency Restoration: every method at its coordinate

**This track is hand-authored and self-contained — each tranche carries its full brief inline** (there is no 2026-06-02 design-reconciliation source; do not look for one). Retarget law + verification law: `CHARTER.md`. Track 00 (verification harness) gates all closure here.

**The law being restored.** The coordinate system IS the modular system (`CLAUDE.md` §0): domain law belongs to its owning coordinate module and is never relocated for convenience. `S3` is the Gateway Control Plane; `S2` is the GraphDB substrate; `S0` is the membrane — CLI, process, adapter. The machine form of that law is `rustSStackBoundary` in `Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.json`: **no layer may import a layer above it.**

**What actually happened, so it is on the record and cannot be re-litigated by the next agent.**

- The S-stack extraction crates were built and are real: `Body/S/S3/gateway` is 8,042 lines across 25 modules; `Body/S/S2/graph-services`, `Body/S/S3/redis-context`, `Body/S/S3/graphiti-runtime`, `Body/S/S3/gateway-contract` all exist and carry law.
- **The source was never drained.** At the residency baseline (`c3f39763`, 2026-05-06) `Body/S/S0/epi-cli/src/gate/` held 41 files and `Body/S/S3/gateway/src/` held 0. Today `src/gate/` holds **59 files / 21,954 lines** — 2.7× the crate that is supposed to own it — and `src/graph/` holds 28 files of S2 law. It grew after the extraction, not before it.
- **Track 17 ("S-Stack Modularisation Campaign") read "modularisation" as file size, not coordinate residency.** All 28 tranches split large files into smaller ones (`T17.2 — Split epi-cli/src/gate/server.rs (3,235 LOC)`), closed 28/28 done, and moved nothing to its coordinate. Splitting `gate/server.rs` into `gate/server/*.rs` is part of why the file count rose. Its own header calls it "S-stack facade-split discipline" and "Worst-audited infra track."
- **The deferral was agent-authored and never ratified.** `Idea/Bimba/Seeds/S/S-CODE-RESIDENCY-PLAN.md:211` states `epi-cli/src/gate/` "remains inside epi-cli at first … and should later thin into CLI wrappers", and `:185` says the same for `src/graph/`. Neither file carries an Architect ratification marker. That prose became de-facto permission to defer the architecture indefinitely.
- **The allowlist made it invisible.** `legacyForbiddenImportAllowlist` in `scripts/lint-boundaries.mjs` is a boolean permit with no magnitude, owner, or expiry, so 41 → 59 files never once turned a gate red.

**Acceptance for the whole track is one line: `legacyForbiddenImportAllowlist` is EMPTY and the mechanism is deleted.** Not smaller. Empty. There is no acceptable non-zero count, and no tranche here may add an entry.

**⚑ Carrier (track 53) — build/verify HERE, never epi-theia:** SUBSTRATE only — `Body/S/epi-kernel-contract`, `Body/S/S0/epi-cli`, `Body/S/S1/hen-compiler-core`, `Body/S/S2/{graph-schema,graph-services}`, `Body/S/S3/{gateway,gateway-contract,redis-context,graphiti-runtime}`, `Body/S/S5/{epii-agent-core,epii-autoresearch-core,epii-review-core,epi-kbase-core}`. No pratibimba-app surface: the gateway wire is unchanged by this track and the app must not notice. Class **W** (live-wire).

---

## Gotchas — read before writing a line of this track

These are the traps that produced the current state. Each has already been walked into once.

1. **"Just move `gate/` into `Body/S/S3/gateway`" DOES NOT WORK, and will hand you a fresh pile of violations.** `rustSStackBoundary` forbids S3 from importing S4 and S5. The gateway dispatches `s5'.improve.*`, `s5'.tune.*`, `s5'.epii.*`, `s4'.mediation.route`. Move those handler bodies to S3 and the lint goes red on S3→S5 instead of S0→S5. **A universal dispatcher cannot legally live in any layer.** The resolution is inversion (`53.T53.01`): the port lives at S-root where every layer may depend on it downward, each layer implements handlers for its own coordinate, and S3 routes by name without importing any implementation.
2. **Splitting a file is not moving it.** This is the Track 17 failure verbatim. A tranche here is done when code lives at its coordinate, never when a file got smaller. If a tranche's diff is mostly `mod` statements and no crate boundary was crossed, it has not started.
3. **The `lib`/`bin` split comes LAST (`53.T53.02`, after the drain), not first — the original ordering was measured against the tree and does not hold.** `epi-logos` is simultaneously a library (`src/lib.rs`) and the `epi` binary (`src/main.rs`), and the library does carry the upward edges, including the `pub use epi_s5_*::*` re-export blocks in `lib.rs`. But "split first" fails on three measured facts (Architect ruling 2026-07-28, after `53.T53.01`):
   - **The split cannot produce a meaningful library before the drain.** A library crate must be closed under reference: if it holds `X`, it must hold everything `X` names. Seeding from the 78 files carrying upward edges and taking the closure pulls **20 of 28 top-level modules / 69,478 LOC** into the binary (`app`→`gate`, `world`→`gate`, `entity`→`gate`, `techne`→`gate`, `canon`→`graph`, `sesh`→`agent`+`vault`, `code`→`agent`). What is left is a 4,681-LOC rump.
   - **Nothing consumes `epi_logos` as a library.** No other crate in the repo declares it as a dependency; its only consumers are this crate's own **166 integration tests** under `tests/`, which reach internals as `epi_logos::…`. A Rust integration test cannot import a `[[bin]]`-only crate, so the fat crate must keep its `[lib]` target no matter what — the "split" cannot move code out from under those tests.
   - **The claim that nothing else can pass without it is false.** The Verify lines of `53.T53.04`/`05`/`07` ask for named manifest edges to disappear and for live-wire round trips to be unchanged. None of that needs the split. Once the drain removes the edges, `epi-cli` has zero upward dependencies and the S0 library row is clean **with no split at all**.

   The trap this ordering avoids: the cheap way to satisfy a split-first `53.T53.02` is to declare `epi-cli` a composition root with empty `forbiddenImports`, which deletes 11 of the 13 allowlist entries **without moving one line of law** — Track 17's failure mode exactly (the metric moves, the architecture does not), and gotcha 6 one step removed. Draining first keeps the ratchet live: every allowlist entry that disappears was earned by code that actually changed coordinate.
4. **CLI wrappers are legitimate; handlers are not.** `epi graph …`, `epi gate …`, `epi vault …` staying in epi-cli is correct — that is the executable return surface. What must leave is the *law*: dispatch bodies, graph queries, schema, sync orchestration. The test is: does this code decide anything a coordinate owns, or does it only parse argv and print?
5. **Do not add an allowlist entry to make a tranche pass.** The mechanism is deleted in `53.T53.09`. Any tranche that needs a new entry is a tranche that has mis-designed its move; fix the design.
6. **Do not "fix" this by re-classifying epi-cli as exempt.** Declaring the whole crate a composition root and moving on would leave 21,954 lines of S3 law in S0 with a green light on top. The binary is the composition root; the gateway is not part of the binary.
7. **The wire is frozen.** Method names, envelope shapes, and event kinds do not change in this track. Every tranche's live-wire proof is that the *same* gateway calls return the *same* results from the new residency. If a wire change looks necessary, stop and raise it — it belongs to another track.
8. **`epi-cli/src/gate/kernel_bridge_runtime.rs` is genuinely S0.** The kernel bridge is portal-core/kernel law, which is S0's own ground. Do not move it up. Confirm each module's owner before moving it; the coordinate header and the AGENTS.md line for the module are the evidence.

---

1. **T53.01 — The method-handler port at S-root, and the inversion that makes residency possible**

   Brief: A gateway that serves `s1'.*`, `s2.*`, `s3'.*`, `s4'.*`, `s5'.*` must reach every layer, and the boundary rule forbids any layer from reaching upward. The only structure that satisfies both is dependency inversion against a port that sits *below* everyone. `Body/S/epi-kernel-contract` is already ratified as the S-stack root contract crate ("parent of all S layers, not an S0 sibling", DR-S0-1) and is the correct home. This tranche defines the port only; no handler moves yet.
   Build: in `Body/S/epi-kernel-contract/src/`, a `method_handler` module declaring the `MethodHandler` trait (method name → params → result/error), the `MethodRegistry` (name → handler, refusing duplicate registration by name), and the shared request/response/error envelope types the handlers exchange. It depends on nothing above S-root. Registration is by explicit call, never by inventory scan, so a handler that is not wired is absent rather than silently defaulted.
   Depends on Track 00 Tranche 3.
   Verify: real behavioral proof per Track 00 — `cargo test --manifest-path Body/S/epi-kernel-contract/Cargo.toml` green, including a duplicate-registration refusal and a dispatch-by-name round trip over two fake handlers; `node Body/M/epi-theia/extensions/scripts/lint-boundaries.mjs` still green. verifier ≠ closer; evidence = fresh command output.

2. **T53.02 — Split `epi-logos` into a composition-root binary and a clean S0 library**

   Brief: **Re-sequenced to run after the drain (`53.T53.08`), per gotcha 3 and the Architect ruling of 2026-07-28.** By the time this tranche runs, `53.T53.03`–`53.T53.08` have moved the handler law to its coordinates and every `epi-cli` upward edge is already gone; the S0 library row is clean on the merits rather than by licence. What remains here is to make the composition root explicit rather than accidental, and to remove the vestigial re-export surface.
   Build: delete the `pub use epi_s5_*::*` re-export blocks (`hen`, `epii_review`, `epii_autoresearch`, `epii_agent` modules in `src/lib.rs`) — consumers import from the owning crate. Then state the structure the drain produced: declare in `rustSStackBoundary` which crate is the composition root (the `epi` binary target composes every layer; it is not a layer), so the licence is written in the contract rather than assumed. If, after the drain, `epi-cli` retains no upward dependency at all, record that a separate binary crate is **not** required and say so in the contract note — the split existed to buy a clean library row, and the drain bought it outright. Do not manufacture a crate boundary that nothing consumes: no other crate depends on `epi_logos`, and its 166 integration tests bind to the `[lib]` target.
   Depends on `53.T53.08`.
   Verify: real behavioral/live-wire proof per Track 00 — `cargo build` + `cargo test` green from `Body/S/S0/epi-cli` (all 166 integration tests still compile against the `[lib]` target); the boundary lint reports the S0 library row with zero forbidden edges, and each of the 11 `epi-cli` allowlist entries is gone because the code moved, not because the row was licensed; `epi --help` and one live gateway call still work. verifier ≠ closer; evidence = fresh command output.

3. **T53.03 — S3 takes its own control plane: protocol, routing, session, subscription**

   Brief: `epi-cli/src/gate/server/{dispatch,subscription,websocket,mod}.rs` plus `session_store.rs` and `verifier.rs` are the gateway control plane — S3's by name and by canon. `dispatch.rs` alone is 2,019 lines and already borrows `epi_s3_gateway::dispatch::{classify_method, dispatch_plan_entry}` and `transcripts::append_orchestration_trace`, which is the seam this tranche completes. After it, S3 owns routing end to end and resolves handlers through the T53.1 registry, importing no implementation.
   Build: move the control-plane modules into `Body/S/S3/gateway/src/`, replacing the per-method match arms with registry lookup by method name. The method→coordinate classification already lives in S3 (`classify_method`, `METHOD_DISPATCH_PLAN`) and becomes the routing authority. epi-cli retains only `epi gate …` CLI wrappers that spawn/talk to the gateway.
   Depends on `53.T53.01`.
   Verify: real behavioral/live-wire proof per Track 00 — the live-wire harness spawns the gateway and every currently-served method still answers identically (no wire change, gotcha 7); `plan.runs/gateway-method-audit.json` shows no method regressing from present to absent. verifier ≠ closer; evidence = fresh command output.

4. **T53.04 — S1 handlers return to S1**

   Brief: `epi-cli/src/gate/s1_hen.rs` implements `s1'.*` — governed vault reads/writes/moves, `s1'.base.ensure`, `s1'.q_articulation.accept`. Its own AGENTS.md line already calls it "a thin gateway adapter" whose law is Hen's; the adapter is the part that must live with Hen. Also drains the `epi_s1_hen_compiler_core` uses in `vault/frontmatter.rs`, `vault/mod.rs`, `nara/medicine_route.rs`, `nara/transform/lifecycle.rs`.
   Build: an `s1_handlers` module in `Body/S/S1/hen-compiler-core` implementing the T53.1 port for the `s1'.*` methods; epi-cli's copy deleted. `vault/frontmatter.rs` becomes a mirror/compatibility reader over Hen's schema authority rather than a second one.
   Depends on `53.T53.03`.
   Verify: real behavioral/live-wire proof per Track 00 — live gateway `s1'.*` round trips unchanged; `cargo test` green in `Body/S/S1/hen-compiler-core`; the epi-cli→`epi-s1-hen-compiler-core` edge is gone from the manifest. verifier ≠ closer; evidence = fresh command output.

5. **T53.05 — S2 takes the graph: 28 files of substrate plus its handlers**

   Brief: The largest single relocation. `epi-cli/src/graph/**` is 28 files and ~31 of the `epi_s2_graph_services` references — client, schema, cypher, sync orchestration, retrieval, embeddings, alignment, doctor. This is Parashakti/GraphRAG law resident in the CLI. `gate/graph.rs` is its gateway face. The Seeds audit already flags the schema drift here (`src/graph/schema.rs` creating an old 768-dim index against a 3072-dim canon) — moving it to the S2 authority is what lets that stop being two schemas.
   Build: move `src/graph/**` law into `Body/S/S2/graph-services/src/` (consolidating schema under `Body/S/S2/graph-schema` per the S2 locked target); `gate/graph.rs` becomes an `s2_handlers` module in graph-services implementing the port; epi-cli keeps `epi graph …` argv-and-print wrappers only. Drains `epi_s2_graph_schema` (`graph/mod.rs`, `graph/meta.rs`) and the `core/knowing` graph uses.
   Depends on `53.T53.03`.
   Verify: real behavioral/live-wire proof per Track 00 — `graph-live` suite green against real Neo4j; live `s2.*` methods unchanged; `cargo test --manifest-path Body/S/S2/graph-services/Cargo.toml` green; both epi-cli→S2 edges gone. verifier ≠ closer; evidence = fresh command output.

6. **T53.06 — S3′ temporal, Redis and Graphiti handlers return to S3**

   Brief: `gate/temporal.rs`, `gate/graphiti.rs`, and the `epi_s3_redis_context` consumers in `graph/redis_cache.rs` + `graph/dev.rs` are S3′ living-context law. Canon is explicit that Redis-backed live context is S3′ (session, NOW, Day, kairos, arc) and that Graphiti's target is the S3 runtime library rather than the `epi gate graphiti` HTTP compatibility wrapper. Also closes the two S2→S3 edges (`graph-services/src/sync/graphiti_episode.rs` → gateway-contract, and `lib.rs`/`doctor.rs` → redis-context), which are 6 references total.
   Build: `s3_handlers` in `Body/S/S3/gateway` for the temporal/graphiti methods; Redis consumers move to `Body/S/S3/redis-context`; the graph-services→S3 uses are inverted to the port or removed. The Graphiti HTTP wrapper is retired in favour of `Body/S/S3/graphiti-runtime`.
   Depends on `53.T53.05`.
   Verify: real behavioral/live-wire proof per Track 00 — live `s3'.temporal.*` and Graphiti round trips unchanged; the two `Body/S/S2/graph-services/Cargo.toml` allowlist entries deleted, not re-pointed. verifier ≠ closer; evidence = fresh command output.

7. **T53.07 — S5 handlers return to S5**

   Brief: `gate/{improve,review,tuning,epii}.rs` implement `s5'.improve.*`, `s5'.review.*`, `s5'.tune.*` and the Epii deposit path; `core/knowing/{kbase,types,vimarsa}.rs` and `vimarsa/mod.rs` consume `epi_s5_kbase_core`; `portal/plugins/m5.rs` consumes autoresearch. Every one of these AGENTS.md lines already says the law is S5-owned and the module is "a thin membrane" — this tranche makes the membrane live where its law does. This is the tranche that would be *impossible* without T53.1, since S3 may not import S5 (gotcha 1).
   Build: `s5_handlers` modules in `epii-autoresearch-core`, `epii-review-core`, `epii-agent-core` and `epi-kbase-core` implementing the port for their own methods; epi-cli copies deleted; `core/knowing` + `vimarsa` call the S5 crates through the binary's composition or move outright.
   Depends on `53.T53.03`.
   Verify: real behavioral/live-wire proof per Track 00 — live `s5'.*` round trips unchanged; `cargo test` green in each S5 crate; all four epi-cli→S5 edges gone from the manifest. verifier ≠ closer; evidence = fresh command output.

8. **T53.08 — The remaining tail: agent, bimba, portal, nara, tui**

   Brief: What is left after the two clusters — `agent/{team,chain,tmux,subagents}.rs` and `bimba.rs`, `nara/arena.rs`, `portal/surfaces.rs` on `epi_s3_gateway_contract`/`epi_s3_gateway`, and `tui/knowing.rs` on graph-services. Roughly 24 references. Most are type-only uses of the gateway *contract* (envelopes, event kinds), which is the one case where the honest fix may be to move the shared type into `epi-kernel-contract` rather than to move the caller.
   Build: per site, either (a) the type moves down to `epi-kernel-contract` where both sides may see it, or (b) the caller moves to its coordinate, or (c) the call goes through the registry. Record which of the three each site took and why — a one-line note per site in the tranche evidence, because this is the tail where "it was easier" silently becomes the next allowlist.
   Depends on `53.T53.07`.
   Verify: real behavioral/live-wire proof per Track 00 — `cargo test` green across the workspace; `epi` CLI surfaces (agent, bimba, nara arena, portal, tui) still function live; zero remaining epi-cli→S1/S2/S3/S5 edges. verifier ≠ closer; evidence = fresh command output.

9. **T53.09 — Delete the allowlist and the escape hatch**

   Brief: The acceptance criterion for the whole track. `legacyForbiddenImportAllowlist` (13 entries) and the `--no-legacy-allowlist` flag are removed from `scripts/lint-boundaries.mjs` entirely, so `lint-boundaries` fails on **any** forbidden edge with no way to record an exception. A mechanism that can hold a permit is a mechanism that will hold one again.
   Build: delete the `Set`, the `options.allowLegacyGaps` branch, the CLI flag and its usage text; the forbidden-import check becomes unconditional. Update the lint's own header comment to state that exceptions are not representable by design.
   Depends on `53.T53.02`.
   Verify: real behavioral proof per Track 00 — `node Body/M/epi-theia/extensions/scripts/lint-boundaries.mjs` green with zero allowlisted forbidden-import gaps reported; injection-proven — re-adding one upward dependency to any layer manifest turns it red and naming the edge, then removing it returns green. verifier ≠ closer; evidence = fresh command output.

10. **T53.10 — Make the confusion unrepeatable: canon, DOX, and the runbook**

    Brief: The architecture was not lost to a bad decision; it was lost to three documents that permitted deferral and one track that mistook splitting for placing. Fix the documents so no future agent can cite them the way this one was cited.
    Build: (a) in `Idea/Bimba/Seeds/S/S-CODE-RESIDENCY-PLAN.md` and `S-CODE-RESIDENCY-AUDIT.md`, strike the "may remain inside epi-cli"/"should later thin" language and record that it was agent-authored, never ratified, and is superseded by this track — the docs keep their history but lose their permission. (b) In `Body/S/S0/epi-cli/AGENTS.md`, replace the module inventory's implication that `gate/` and `graph/` live here with the CLI-wrapper law and a pointer to the owning crates. (c) Add the runbook line agents actually need: **to add a gateway method, implement the handler in the owning coordinate's crate and register it — never in `epi-cli`** (this replaces the current "adding a method touches ~9 places in `epi-cli/src/gate/server/dispatch.rs`" folk knowledge). (d) Note in `CHARTER.md` that Track 17 was scoped as facade-splitting and did not perform residency, so its 28 done marks are not evidence of relocation.
    Depends on `53.T53.09`.
    Verify: real behavioral proof per Track 00 — a grep-proven check that neither Seeds doc still carries the deferral phrasing as live guidance; `epi-cli/AGENTS.md` names the owning crates; verify-all green, honesty-lint clean. verifier ≠ closer; evidence = fresh command output.

11. **T53.11 — The structural guard that replaces vigilance**

    Brief: Documents do not enforce. After the move, nothing but a test stops the next agent from adding `gate/handlers_for_something.rs` to epi-cli, because that is still the shortest path from a task to a working method. This tranche makes the shortest path the correct one and the wrong one fail loudly.
    Build: a test in the epi-cli crate asserting that `src/gate/` contains only CLI wrappers and `src/graph/` only argv-and-print surfaces — concretely, that no file under them imports an S1/S2/S3/S5 crate, and that neither directory declares a gateway method handler. Pair it with the boundary lint (now hatch-free) so the two fail independently: the lint catches the manifest edge, the test catches a handler that sneaks in through the composition root. Prove it RED on an injected handler and GREEN on removal, per the house pattern (`src/ui/layoutId.test.ts`).
    Depends on `53.T53.10`.
    Verify: real behavioral proof per Track 00 — the guard proven in both directions against the real tree; verify-all green including `lint-boundaries`; verifier ≠ closer; evidence = fresh command output.
