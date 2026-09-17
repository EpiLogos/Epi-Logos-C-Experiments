# Track 00 — Verification-Harness Hardening Ledger (gap audit → hardening tranches)

**Companion to:** `00-verification-harness.md` (the T1–T7 harness spec). This file is the **gap ledger**: the
full set of places the Track-00 test suite does NOT yet live up to the scope of the system it gates, each paired
with the concrete hardening that closes it. It extends Track 00 with tranches **T8+**; it decides nothing new
about the system — it makes the harness exercise what the specs already demand.

**Why this exists.** Track 00 is the *universal gate*: every track 01–49 (including 43-audit and 14-release-gates)
routes its `Verify` line **through Track 00** — "verify-all green, honesty-lint clean, bus/gateway claims via
live-wire." Therefore the harness's *coverage* is the ceiling on how trustworthy every `done` claim in the rerun
can be. Cycle 3 died of proxy tests; a harness that runs a sliver of the real system re-opens that exact door
under a green table. The audit below is scoped to the **full real backend S0–S5 + the `pratibimba-app` carrier**
(the Theia replacement); **epi-theia stays frozen** and is out of scope.

**Reading rail:** `CHARTER.md` (verification law) · `00-verification-harness.md` (T1–T7) ·
[[2026-07-03-cycle-3-recapture-register]] §4/§5 (known computational violations) · the owning
`[[Sn-SPEC]]`/`[[Mn'-SPEC]]` above both.

---

## 0. Execution status (2026-07-06 — P0 tranches LANDED · full gate GREEN)

**Banked baseline (2026-07-06, `verify-all` GREEN in 186.1s):** harness-selftest 76 · epi-lib 8642 ·
portal-core 275 · epi-cli 739 · schemas 98 · kernel-contract 37 · s0-settings 2 · gemini-embedding 4 ·
hen-compiler-core 66 · graph-schema 22 · graph-services 221 · gateway 79 · gateway-contract 78 ·
redis-context 10 · graphiti-runtime 12 · **ta-onta 406** · epii-agent-core 12 · epii-review-core 9 ·
epii-autoresearch-core 78 · app-typecheck/test/build (123) · live-wire · gateway-methods · honesty-lint ·
kernel-truth — **all PASS**. (A concurrent protocol-rebuild session is extending the gate further —
app-smoke + app-ui-flow Playwright suites registered after this run; their green is that session's to bank.)

**Banked P1 pass (2026-07-06, protocol-rebuild session):** the gate is now **31 suites** (+`app-smoke` 1 ·
`app-ui-flow` — Playwright/Chromium, real spawned gateway, real-fs vault sidecar; grew 3 → 6 specs with the T17
integrated loop · `gnostic-offline` 15 · `spacetime` 11 · `lint-boundaries`). Full 28-suite gate GREEN in 388.4s
(recorded verbatim in `plan.runs/verifications/00.T1.md`); post-P1 integration run GREEN in 55.8s
(harness-selftest · schemas 108 · live-wire 26-entry manifest · app-test 123 · app-ui-flow 6 · gnostic-offline ·
spacetime · lint-boundaries · honesty-lint). The close path is now mechanical: `verify-tranche --owner` records
verifier identity and `m-dev-plan-assess --mark done` fails closed (receipt · verifier ≠ closer · DR machine-check ·
K/W/UF/D class proof · quarantine propagation · daily token budget) — see the charter Verification law + root
`AGENTS.md`.

| Tranche | Status | Landed as |
|---|---|---|
| **T8** | **DONE** | 13 backend crates as verify-all suites. First honest run found **4 reds the ungated corpus was hiding**: kernel-contract (test fixtures drifted off the canonical E4/E5/E6 `EnergyDecomposition` — fixed), graph-services (missing test import + non-hermetic env test — fixed), gateway (`being_pattern` test asserted the pre-37.T37.9 flat `planetaryLensAspect` contract — updated to the typed edge classes; the repaired T9 cross-walk then exposed 3 contract methods dispatched nowhere, now allowlisted as build-backlog with owning tracks 40/48), epii-autoresearch-core (**implementation regression, cycle-3 fraud pattern live**: 17.T17.4 "split — accepted" never wrote `runner.rs`, follow-up deleted the public surface — 1,343 lines restored verbatim from git history, tests untouched). autoresearch suite runs `--features resonance_ebm` per crate law. Break-propagation proven (planted red → exit 1). |
| **T9** | **DONE** | `ta-onta` suite: `node --test 'Body/S/S4/**/*.test.ts' 'Body/S/S4/**/*.test.mjs'`, cwd MUST be repo root (tests read `Body/S/S5/...` fixtures root-relative). First-ever run of the dark corpus: **406/406 green**. ESM marker `Body/S/S4/package.json`. Break-propagation proven. |
| **T11** | **DONE** | `gateway-methods` suite → `.codex/scripts/gateway-method-gate.mjs`: reruns the T5 probe against a REAL spawned gateway + holds the **expected-present ratchet** (`plan.runs/gateway-method-expected-present.json`, seeded with the 44 present; a done-claimed method may never go absent; present-but-unclaimed warns). False-claim proof: planted `s5'.tune.get` → stage RED. |
| **T14** | **DONE** | C1: `mobius_descent_step_size_is_the_untunable_epogdoon_log` (green) + expected-red `mobius_descent_operator_compiled_into_gate_build` (operator feature-gated dark, Track 33). C2: expected-red `c_engine_kernel_energy_total_carries_456_weighted_channels` via FFI (C engine still sums unweighted, Track 33; Rust `canonical_total_energy` law landed, E5/E6 channels still red). C4: `bell_octet_offsets_and_8_plus_4_tiling_pinned` (green; role behaviors stay Track 49). C6: `q_composed_carries_identity_transit_activity_order` (green). C7: `test_suit_integral_runtime_tarot_partition` in epi-lib M3 suite (green — 64-codon cover + 4×{84,96,88,92} runtime). Manifest now **7 reds**, kernel-truth stage GREEN (all stand). |
| **T16** | **DONE** | `harness-selftest` suite runs FIRST (58 self-tests). Honesty lint now polyglot: Rust `assert!(true)` / self-equal constant / blanket `#[ignore]` (781 files swept; every live `#[ignore]` in `Body/S` now carries its live-infra reason); Python `assert True` / reasonless skip; C literal-true. Self-equal **calls** (determinism idiom) deliberately exempt. Planted-fixture rejections proven in the self-tests. |
| **T10** | **DONE** (2026-07-06) | `gnostic-offline` suite (`.venv` python, `SKIP_NEO4J_TESTS=true pytest` — 15 passed/16 skipped; LIVE lane documented at the suite definition: `docker compose -f docker-compose.epi-s2.yml up -d` then pytest without the skip env) + `spacetime` suite (`Body/S/S3/epi-spacetime-module`, 11 real tests — arena tables, reducers, being-pattern projection; rustc 1.93.0 pin). verify-all gained per-suite `env` support (behaviorally self-tested). |
| **T12** | **DONE** (2026-07-06) | live-wire manifest **7 → 26 entries**; the 44 fields on the live wire = 26 law-covered / 18 justified-EXEMPT (a stale exemption FAILS) / 8 DECLARED_NOT_EMITTED (pasuBeingPattern, anuttaraWitness, vakLanguificationTrace, cosmicCompositionState, personalPole, psychoidField, canonRecognitionStream, vakAddress). `z.unknown()` replaced with real Zod in `schemas/src/kernel-bridge.ts` + new `gateway-bus.ts` (anandaVortex, harmonicGrammar, bedrock, graph/deposition/future anchors, readinessLedger, context-frame web, pointer anchors). Quintessence handle-only per DR-M4-3: 8-key allow-list, ≥16-hex digest in any string FAILS (64-hex leak proven rejected), unit-quaternion norm, `quintessenceWeight` the one scalar. Corrupt-replay rejection proven. Wire-law findings: harmonicGrammar pratibimba pairs are complementary `L{p}/L{5-p}` (mirrors `harmonic_grammar.rs`); `readinessLedger` facts are snake_case on the wire; `contextFrames` is always one struct. Remaining `z.record` gaps EXEMPT-tracked: chromatic, elements, planetaryChakral, binary, codonRotationProjection. |
| **T13** | **DONE** (2026-07-06) | 6 channels captured + strict-parsed (`profile.update`, `m123.chime`, `tick`, `health`, `heartbeat`, `connect.challenge`); declared-silent WS channels printed (`cron.fired/cron.error/chat/agent/s3'.subscription.lifecycle`); 9 bridge-internal event kinds reported never-raw-WS; an unknown/unschematized captured channel = FAIL. World-clock independence check honestly BLOCKED — the chime binding is gateway-heartbeat synthesis, pinned by a `subscriptionMode==='gateway-heartbeat'` tripwire that forces the rewrite when a real `s3.world_clock` subscription lands. |
| **T17** | **DONE** (2026-07-06) | `tests/e2e/integrated-loop.spec.ts` — one spec, five layers: real WS frames (≥2, strictly increasing generations, wire↔store↔DOM congruence) → OraclePane cast → the REAL `epi nara oracle cast --yes` under an isolated `$HOME` with its own `history.jsonl` gaining exactly one matching line → vault disk bytes with typed frontmatter (`c_4_artifact_role: "oracle-cast"`) → reload rehydration. Negative tests prove the cut-points (invalid cast leaves the ledger byte-identical; severed vault read 404s). Finding: the app's cast path is Tauri→CLI, NOT gateway-dispatched — `nara.oracle.cast` exists live on the gateway (unadvertised); the rewire is rerun work. |
| **T18** | **PARTIAL** (2026-07-06) | (a) `lint-boundaries` suite wired (Track 43 lint, `Body/M/epi-theia/extensions/scripts/lint-boundaries.mjs`, green). (b) `carrier-tokens` lint landed AND wired (2026-07-06, same day): the 23 violations were tokenized value-neutrally into `Body/M/pratibimba-app/src/ui/tokens.ts` (JS-side token source alongside `styles.css`; `FAMILY_HUES` moved there and flagged OPEN per DR-WC-DL-1 — naming values is not deciding the palette); test files exempt from the consumption lint (they assert produced values); suite `carrier-tokens` in the gate, lint GREEN, app tests + 6 e2e specs green after migration. (c) canon parity (data-spine §5.2): probe written (`.codex/scripts/canon-parity-probe.mjs`) and run live — **0/18 byte-identical**. Architect caveat (2026-07-06): a DIFFERENT Neo4j database was live during the probe, so the byte-level content comparison is NOT authoritative — re-run the probe against the canonical Bimba DB before treating content divergence as fact. What stands regardless of DB content: the two surfaces are **shape-disjoint** (CLI ladder `{coordinate,depth,q_identity,square,…}` vs resolver `{canonical,compatibility_property,input}`) and the gateway resolver **errors on `#2'`** where the CLI resolves — both structural. Full parity additionally needs the bimba-mcp `spec_retrieve` comparand the gateway does not expose. Tracks 17/09 work order, probe = the acceptance instrument. |
| T15 | OPEN (P1) | Kernel-truth reach + manifest reconciliation — deliberately left with the concurrent session that owns the kernel-truth manifest (spanda reds landing there 2026-07-06). |

Full-gate shakedown finding (2026-07-06): the first 23-suite run caught the in-flight Sprint-8 §5.3 law change —
`planetDegrees`/`livePlanets` became kairos-gated (`Option`, attached by the heartbeat only when the kairos cache
is fresh; absence = the renderers' honest "kairos pending" state). The live-wire manifest was updated from the
stale unconditional law to the §5.3 conditional law: **pair-consistency asserted every frame** (both attached or
neither — a split pair fails), full 10-body validity + mirror/decan checks whenever present. verify-all's
quiet-mode failure tail was also widened beyond cargo patterns (node:test `✖`/`not ok`, live-wire/gateway-gate
FAIL lines) so a failing suite always names its tests.

Second shakedown catch: `gate_epii_agent_access.rs` hard-pinned `transcriptionState == "provisional-gap"` — a
tick-derived value that is "resolved" on the 8 exact multiples of 9 of the m2 vibration index (a ~1-in-9
wall-clock lottery; luts/mahamaya.rs `is_evolutionary_gap`). Rewritten to assert the LAW (state matches the
frame's own `evolutionaryGap` flag), the same shape `gate_temporal_context.rs:383` already used.

Third shakedown catch (the run-#1 ta-onta 404/406 transient, named by the widened tail on run #3):
`result_artifact_wake.test.ts` raced Khora's fs-watcher wake against a 2-second wall-clock timer — under
23-suite gate load the wake arrived after the timer (observed 2012ms). The law is "the wake ARRIVES", not
"arrives within 2s on an idle box": timer widened to 15s + a 100ms watcher-arming pause before the artifact
write; assertions unchanged.

---

## 1. What the gate runs today (baseline)

`verify-all` (`.codex/scripts/verify-all.mjs`) = **10 suites**: `epi-lib` (C `make test`), `portal-core`
(`cargo test`), `epi-cli` (`cargo test`), `schemas` (`pnpm test`), `app-typecheck` / `app-test` / `app-build`
(pratibimba-app), `live-wire` (T2), `honesty-lint` (T3), `kernel-truth` (T4). Also present but **NOT in the
gate**: `gateway-method-audit.mjs` (T5, probes 205 methods) and `verify-tranche.mjs` (T6, per-tranche verifier).

What that baseline already does well (so hardening does not re-litigate it):
- **Live gateway coverage exists on the S0 side** and *is* gated: `epi-cli/tests/gate_*.rs` spawn a real
  WebSocket server (`spawn_test_server` + `connect_async`) and exercise `connect`, `health`, `chat.send/abort/
  history`, `sessions.*`, `s1'.vault.*` (`gate_s1_vault_surface.rs`), `s4'` coordinate surfaces
  (`gate_s4_coordinate_surfaces.rs`), khora (`gate_khora_integration.rs`), epii review/improve, subscriptions.
- **The deep-computational corpus is broad and green** (portal-core `tests/{phase_space,planet_degrees,
  ananda_vortex,klein_flip,f_routing,modal_resonator}_*.rs` + epi-lib `test/{m0,m1,m2,m3,m4,engine}/`): 22+
  spec invariants have real tests (§4.C below).
- The T1 runner is itself behaviourally tested (`__tests__/verify-all.test.mjs`, real subprocesses) incl. the
  "a suite that cannot run is a FAIL, never a silent skip" law.

The gap is therefore **not** "no real tests exist" — it is **which real surfaces the gate refuses to look at**,
and **which spec-mandated invariants/frames have no assertion at all**.

---

## 2. The gap in one screen

| Axis | The hole | Magnitude |
|---|---|---|
| **A** Suite breadth | Backend crates S1–S5 not in the gate | **~660 offline Rust tests / 13 crates** ungated; S4 `ta-onta` (~336 cases) **has no runner at all** |
| **B** Live-wire depth | M'-side carrier→gateway path barely exercised; envelope under-asserted | live-wire sends only `connect`; **~40 of ~52 profile fields** unasserted; **10 event types → 2 captured**; `gateway-method-audit` ungated |
| **C** Kernel truth | ~8 load-bearing computational laws untested; manifest ≠ inventory | Möbius descent, χ-solver, 4:5:6 energy (C/Rust divergence), K²/annulus geometry all untested/render-only |
| **D** Per-track Verify | 27 of 49 tracks are automatable-unwired | **8 COV · 27 AUTO · 10 LOOP · 4 THEIA · 1 LAW** |
| **E** Integration | No end-to-end kernel→gateway→carrier→graph assertion | 0 cross-layer flow tests |
| **F** Harness self-integrity | Gate doesn't run its own unit tests; honesty-lint blind to Rust/C/Py; 3 spec-named reds never authored | 5 self-test files, **0 executed by the gate** |

---

## 3. Axis A — Suite breadth (backend crates the gate refuses to run)

Source: backend test-surface inventory. Every module below is confirmed **absent** from `verify-all`'s `SUITES`.

**A-Gate-Now — ~660 offline Rust tests, zero-risk (live-infra paths already fenced behind `#[ignore]` /
`Reachability::Unreachable`):**

| crate | path | cmd | ~tests |
|---|---|---|---|
| epi-kernel-contract | `Body/S/epi-kernel-contract` | `cargo test` | 37 |
| S1 hen-compiler-core | `Body/S/S1/hen-compiler-core` | `cargo test` | 66 |
| S2 graph-schema | `Body/S/S2/graph-schema` | `cargo test` | 22 |
| S2 graph-services | `Body/S/S2/graph-services` | `cargo test` | 221 (+11 `#[ignore]` live) |
| S3 gateway | `Body/S/S3/gateway` | `cargo test` | 79 |
| S3 gateway-contract | `Body/S/S3/gateway-contract` | `cargo test` | 78 |
| S3 redis-context | `Body/S/S3/redis-context` | `cargo test` | 10 (+3 `#[ignore]`) |
| S3/S5 graphiti-runtime | `Body/S/S3/graphiti-runtime` | `cargo test` | 12 |
| S5 epii-agent-core | `Body/S/S5/epii-agent-core` | `cargo test` | 12 |
| S5 epii-review-core | `Body/S/S5/epii-review-core` | `cargo test` | 9 |
| S5 epii-autoresearch-core | `Body/S/S5/epii-autoresearch-core` | `cargo test` | 78 |
| S0 settings / gemini-embedding | `Body/S/S0/{settings,gemini-embedding}` | `cargo test` | 2 / 4 |

_Spot-verified (real runs, this audit):_ `S2/graph-schema` → all green offline (0 failed / 0 ignored); `S3/
gateway-contract` → **78 passed / 0 failed / 0 ignored** offline, exit 0. The "gate now, zero-risk" claim holds
behaviorally on the sample; T8 should run the full 13 once to bank the baseline table.

**A-Needs-Wiring — real tests exist but cannot run as-is:**
- **S4 `ta-onta` (~336 `it()` across 49 `.test.ts`) + `pi-agent` (8) have NO committed runner** — `node:test`
  files that import `../spine/*.ts` with `.ts` extensions; no `package.json`, no vitest, no make target
  anywhere up-tree. This is the single largest untested body in the system. Wiring a runner
  (`node --test --experimental-strip-types`, or add `tsx`) is a prerequisite tranche.
- **S5 `epi-gnostic` (31 pytest fns / 10 files)** — `SKIP_NEO4J_TESTS` defaults `false`, so tests hit
  `bolt://localhost:7687` and **fail offline**; gate as `pytest` behind an env-guarded step (`SKIP_NEO4J_TESTS=
  true` for the offline lane; a separate live lane with Neo4j + GEMINI key).
- **`epi-spacetime-module` (11)** — `cdylib` / `spacetimedb 2.2.0`, pins toolchain 1.93.0 + `wasm32` target;
  confirm a plain host `cargo test` builds in the harness toolchain before trusting it.

No tests present (skip): `m1-cpt-trainer`, `S4/plugins`, `epi-kbase-core`.

---

## 4. Axis B — Live-wire depth (the M'-side / envelope holes)

### 4.A Gateway RPC surface
Real dispatch = `Body/S/S0/epi-cli/src/gate/server/dispatch.rs` (big `match frame.method`; unknown → `unimplemented`
at :1295/:1311). `gateway-method-audit.json`: **probed 205, present 44, absent 161.**
- **The M'-side carrier exercises ~0 methods live.** `live-wire.mjs:294` sends only `connect`; `boot-smoke.mjs`
  adds `health`. `gateway-method-audit.mjs` probes all 205 but is **wired into no gate** (pratibimba-app
  `package.json` has no `verify-all`). `gatewayClient.live.test.ts` exists but is stranded behind the `smoke`
  script (`EPI_LIVE_SMOKE=1`), outside `verify-all`.
- Of the 44 present methods, the ~ dozen exercised live are **all in the Rust S0 suite**; every `s2.graph.*`,
  `s5'.gnostic.*`, `s5'.review.*`, `s5'.improve.*`, `s4'.mediation.*`, `nara.*` (beyond payload-shape),
  `s1'.vault.*` handler is unexercised from the carrier's own client.
- **161 absent methods** are the build backlog the gate should *track* (T5 audit) so no track can claim a method
  works that the dispatch does not implement: whole families `s5'.tune.*` (12), `s5'.canon_update.*` (5),
  `s1'.entity.*`, `s1'.base.ensure`, `m4.arena.*` (9), `s0'.verifier.*` (3), `s0'.settings.*`, `s3.world_clock.*`,
  `s2.codon.*`, `nara.pasu.*`, `contemplate_session_close` (handler exists in S3, unwired).

### 4.B Profile / envelope assertion depth
`MathemeHarmonicProfile` (`Body/S/S0/epi-cli/schemas/src/kernel-bridge.ts:776-857`) has **~52 top-level fields**;
the 7-entry `PROJECTION_MANIFEST` deep-asserts **~12**. `profile.strict-parse` safe-parses the whole payload, but
most fields are `.optional()`/`z.record`, so a **silently-absent** field passes — the exact "silent skip" the
harness header forbids. Worst holes — **typed AND unit-tested but never live-verified**:
`pasuBeingPattern` (:842), `anuttaraWitness` (:843), `vakLanguificationTrace` (:851), `graphHandle` (:808),
`bedrock` (:832), `depositionAnchor` (:807), `s2Anchor`/`s3Anchor` (:852-853); and **typed as `z.unknown()`**
(untyped on the wire, unasserted): `kleinFlip` (:839 — real `KleinFlipEvent`, 3 variants,
`portal-core/src/events/flip_events.rs:14`), `anandaVortex` (:840), `harmonicGrammar` (:841).

Event channels: `KernelBridgeEvent` declares **10 types** (`kernel-bridge.ts:39-50`: profile, world_clock,
presence, shared_archetype_event, kernel_trace, audio_bus, cymatic_field, connection_status, gateway_rpc,
observability); live-wire captures **2** (`profile.update`, `m123.chime`). No capture of `world_clock`,
`presence`, `cymatic_field`, `audio_bus`, `kernel_trace`, session/run lifecycle. HONESTY NOTE from
`gate/server/mod.rs:114`: the chime's `worldClockBinding` is *synthesized from the same tick arithmetic*, not an
independent `s3.world_clock` subscription — a coherence hole the current frame-parse cannot detect.

Envelope: the 12-layer / **124-field** envelope schema (`FLOW-2026-04-22-ENVELOPE-FIELD-SCHEMA.md:357-375`) is a
*wider, largely disjoint* contract; only Layer-12 kernel-projection sub-fields overlap the profile bus. Layers
1–11 (~108 fields: transport/runtime/temporal/coordinate/residency/context-economy/…) have **zero** live-wire
representation.

---

## 5. Axis C — Deep computational truth

The `kernel-truth` **manifest is not an inventory** — by design it lists only the 5 standing reds. The real
computational corpus is broad and green (22 invariants: transcription 27+37+1+3, DR-R0 route words `0x5FC1`,
canonical-B element order, codon class 4+12+24+24, planet mod-10, decan36, ananda axiom `pratibimba−bimba≡+1`,
ananda vortex, klein-flip tritone-once-per-cycle, 720 phase-space + Fibonacci-ground Pisano-60, f_routing 72-fold,
quintessence BLAKE3, dipyramid 6+6, q_cosmic normalization, M2 aspects, birthdate encoding, medicine decan…).
The gaps are **concentrated and load-bearing**:

**C-Untested (author these):** *(2026-07-06 computational-core truth session — every row now discharged or owned; full audit at [[00-computational-core-truth-ledger]])*
| # | law | spec src | why it matters | 2026-07-06 status |
|---|---|---|---|---|
| C1 | **Möbius descent `q_p -= log(9/8)·∇E_total`** | epi-logos-kernel-spec.md:158 | the kernel's core *learning* operator — **no test at all**; step-size non-tunability + gradient direction unverified | CLOSED by T14 (step-size green; operator-darkness red; direction law authored behind `resonance_ebm_runtime`) |
| C2 | **Canonical `(4·E4+5·E5+6·E6)/15` energy** | epi-logos-kernel-spec.md:144 | manifest-red on Rust; the C engine `epi-lib/test/engine/test_kernel.c` asserts a *different* latent/lens/r decomposition — **no green test anywhere**, and kernel-truth is blind to the C side | CLOSED by T14 (both reds manifested, Track 33) |
| C3 | Cymatic χ-solver `Σ aᵢ·sin·sin + bᵢ·cos·cos` | M2-ARCH:368 | exists only as renderer GLSL; no tested kernel reference impl, so octet-drives/quartet-constrains can't be checked vs the bus | CLOSED — `portal-core/tests/cymatic_chi_reference.rs` (octet-drives/quartet-constrains/determinism vs the real from_tick bus) + the app's tested `cymaticField.ts` twin |
| C4 | Bell-partial roles + octet offsets `[2,4,6,8,3,5,7,9]` | m123-bell-kernel-spec.md:79 | octet==bus is tested; the 8 partial roles + offset values are not | CLOSED by T14 (`bell_octet_offsets_and_8_plus_4_tiling_pinned`); role behaviors stay Track 49 |
| C5 | K² torus `R/r=9/8`, codon annulus `2π/64` geometry | M1-ARCH:269 | render-only; no kernel/reference assertion | CLOSED — `portal-core/tests/k2_geometry_reference.rs` (annulus floor-law all 720°, 2π/64 cell widths, Rust↔C Hopf mirror, torus-surface pin). NOTE: the aspect question is RESOLVED 2026-07-06 by ql-musical-derivation-v3 register law (M1'-SPEC §13.6): R/r = 16/9 with R+r=1; the epogdoon's seats are the tick step and 2r/R = 72/64 = 9/8. Test upgraded to `k2_torus_carries_the_standing_identity_as_its_body_proportions` |
| C6 | `Q_composed=(Q_id·Q_transit)·Q_activity` left-assoc order | M4-ARCH:139 | resonance tested; **composition order not asserted** | CLOSED by T14 (`q_composed_carries_identity_transit_activity_order`) |
| C7 | Suit integrals Σ=360 at **runtime** | m3.h:520 | only a compile-time `_Static_assert` — a runtime break would pass the suite | CLOSED by T14 (`test_suit_integral_runtime_tarot_partition`) |
| C8 | cymatic_signature `[f32;64]` 8×8; `M2_TO_M3_CYMATIC_PROJECTION[72]` DET masks | INTEGRATED-4-5-0:275 | handle/privacy tested, the 64-float law + 72 masks are not | CLOSED — DET masks: `epogdoon_bridge_mirror.rs` (OR-superposition law via FFI) + EL `test_det_coverage`; cymatic_signature: expected-red `psychoid_field_projection_carries_cymatic_signature_64_as_8x8_spectrum` (Track 08) |

**C-Manifest completeness:** the T4 spec named **6** red categories; the manifest holds **5**. Never authored as
reds: **element-ID canonical-B M2↔M3 round-trip** (partly green as C4 above — reconcile), **DR-R0 route words**
(actually green-pinned — spec is stale, note it), **transcription constants** (green-pinned — stale). The genuine
missing red is the **64-codon cross-check** half of the charges assertion (manifest has `sum(pp)==360` only).
Action: reconcile the T4 spec list against the green corpus so the manifest's "5 reds" are provably the *only*
open computational violations — today that claim is unaudited.

*(2026-07-06 truth-session update: the manifest now holds **14 reds** — the 7 above plus the six Track-02 T2.11
Spanda-oscillator laws (T4.g, previously "unwritten") and the Track-08 psychoid `cymatic_signature[64]` law. The
complete law-by-law audit — every quaternionic-core law GREEN-named or RED-owned — is
[[00-computational-core-truth-ledger]]. New green corpus: `spanda_involutions`, `k2_geometry_reference`,
`epogdoon_bridge_mirror` (Rust↔C FFI mirrors), `cymatic_chi_reference`, `resonance72_address_law`,
`matheme_harmonic_ratio_laws`, `entity_computation_end_to_end` (the natal→archetype integration test). Wire:
`kleinFlip` typed (T12 partial discharge — `anandaVortex` stays gated on 10.10, `harmonicGrammar` stays P1);
live-wire manifest +2 (`mahamayaBridgeLaws`, `kleinFlip`).)*

---

## 6. Axis D — Per-track Verify coverage

Every track's `Verify` (from the originals in `…/2026-06-02-…design-reconciliation/`) classified against the
current harness. Class: **COV** covered/pinned · **AUTO** automatable-unwired (a real kernel/gateway/lint proof
that should be in the gate but isn't) · **LOOP** drivable-loop-only (needs the mounted app observed by the
Architect) · **THEIA** frozen (contract survives as a pratibimba-app surface, Verify targets dead widgets) ·
**LAW** law-only.

| # | class | core Verify → surface it needs |
|---|---|---|
| 01 | COV | DR-R0 `0x5FC1` route words → kernel-truth green pin |
| 02 | AUTO | K²/klein-tritone; **Spanda dual-oscillator** → portal-core `spanda_hkb_antiphase`,`tick12_from_hkb` (*T4.g reds AUTHORED 2026-07-06 — six manifested expected-reds in kernel_truth.rs; see [[00-computational-core-truth-ledger]]*) |
| 03 | AUTO | `f_routing` det trace; `index72` 6-axis round-trip → portal-core + bridge `m2.decodeAxisAt` |
| 04 | COV | transcription 27+37+1+3 → kernel-truth green pin |
| 05 | AUTO | session open/close emits ATG/STOP protein → epi-lib + gateway `nara.session` round-trip |
| 06 | AUTO | night' corpus → ≥5 q_-gap candidates e2e → epii-autoresearch-core `self_referential_read_seeded_corpus` |
| 07 | THEIA | `parentAttribution==='M1-5'`; 137=64+72+1 → pratibimba CosmicEngine composition |
| 08 | AUTO | q_personal refusal + q_5 template pass → gateway `s4'.mediation.route` frame + privacy scrub |
| 09 | AUTO | `epi canon coord`==bimba-mcp byte-identical → epi-cli parity vs `spec_retrieve` |
| 10 | COV(part) | `resonance72` shape; ananda 12×12 CSV → kernel-truth (expected-**red**, owns fix) |
| 11 | THEIA | daily-0/1 layout partition → dead Theia layout; no carrier pane |
| 12 | AUTO | session-safety harness; `s4'.mediation.route` chains Moirai → gateway frames + terminal-lease e2e |
| 13 | LAW | decision register (all DR law → register §3) |
| 14 | AUTO | release gates G1–G14; open-orphan registry → no-orphan script + gate assertions |
| 15 | LOOP | 2 motion primitives; 0/1 toggle keeps 6 globals → mounted app |
| 16 | AUTO | klein-flip retunes 3 surfaces same-frame; sync ack<3s → gateway `fire_provenance`+`MostRecent`+`graph_revision` |
| 17 | AUTO | `epi canon coord`==bimba-mcp (6 coords×3 depths) → epi-cli/bimba-mcp parity |
| 18 | COV(part) | no `Record<string,unknown>` at boundaries → schemas Zod parity (live-wire strict-parse) |
| 19 | AUTO | `contemplate_session_close→wisdom_delta`; 72→12 LUT → gateway `contemplate_*` + portal-core routing |
| 20 | AUTO | forbidden-imports (no S0/S2/S3/S5 leaks) → lint (carrier needs own row) |
| 21 | LOOP | forbidden-imports enforced; M0 one-widget/6-panel → M0' pane (absent) |
| 22 | LOOP | Spanda-walk scrub; Cl(4,2)+Mersenne proof → M1' strata panes (absent) |
| 23 | LOOP | 72-cell MEF grid; χ-field determinism; descent 72→64→56 → M2' panes (absent) |
| 24 | LOOP | 18 apertures; 9 walks; tarot no-`Math.random` → M3' inspectors (needs 18-shape kernel) |
| 25 | LOOP | 23 widget contracts; PASU wizard; oracle 4h decay → M4' surface + gateway `nara.pasu.*` |
| 26 | LOOP | 72-grid+3 tritone squares; wisdom-delta XOR → M5' EBM pane (evidence serde unit-extractable) |
| 27 | THEIA | 8 `/`-membrane tabs → pratibimba membrane (3 of 8) |
| 28 | THEIA | activity-bar 3+5 modes; bimba anchor → dead Theia chrome |
| 29 | LOOP | geometric-slot arbitration; juxtaposition hard-fails → composition-coordinator (mounted slots) |
| 30 | AUTO | consumption lint (no raw hex/font/duration) → token file + lint (CSS vars) |
| 31 | THEIA | 6 status entries; cmd-shift-0..5 chords → Theia strip; no-modal lint portable |
| 32 | LOOP | 6-stage cold-start; 9+5 readiness `flavourOf()` → app boot |
| 33 | COV(part) | `kernel_energy` E₄/E₅/E₆ 4:5:6; oracle via kernel → kernel-truth (both **red**, owns) |
| 34 | AUTO | opt-in refusal; keys from env not gateway → S0 settings crate + `s0'.settings.*` |
| 35 | AUTO | `CLOCK_BACKBONE[24]`; NOW fib-stamps; KairosFrame triple → portal-core LUT + vault-service |
| 36 | AUTO | `m2ToM3==floor(res·8/9)`, `addr64==floor(deg·64/360)` → Rust/TS mirror property tests |
| 37 | AUTO | **11 kernel projections round-trip C fns** (9 gaps, pp/nn/np/pn, canonical-B) → bridge round-trips |
| 38 | AUTO | ~15 invariants non-tunable; locked-knob refuses → gateway `s5'.tune.*` + TOML write-through |
| 39 | AUTO | 10-step gnostic e2e; no op bypasses gateway → `s5'.gnostic.*` + `epi gnostic` parity |
| 40 | AUTO | CU markers in target files → gateway `s5'.canon_update.*` + CU-ledger lint |
| 41 | AUTO | determinism hash in==out; dialogue-only gate → portal-core `vama_shakti.rs` + `m4.arena.*` |
| 42 | AUTO | envelope serde round-trip; symlink-not-copy → `HarnessTurnEvent` serde + skill-store symlink |
| 43 | AUTO | coordinate headers; `.h`<`.c`; forbidden-imports → header lint + size check |
| 44 | LOOP | block schema-validated; verdict/annotate loop → block-kit renderer + `s3'.temporal.subscribe` |
| 45 | AUTO | `wrap_context_frames` 5 impls in sync; Hen rejects depth≥2 → cross-lang normaliser parity |
| 46 | AUTO | Z-thread CFP1→2→3→loop under Verify gate → Z state machine + eval-ledger→Redis/Graphiti |
| 47 | AUTO | `cron::check_due_and_fire` in heartbeat; consent-gated → gateway `cron` + heartbeat due-check |
| 48 | AUTO | `s1'.base.ensure` idempotent; `list_by_filter` view → gateway `s1'.base.ensure`+`s2.graph.list_by_filter` |
| 49 | COV(part) | coherence gate blocks chime on M1/M2/M3 disagree → live-wire `event:m123.chime` (core done; 49.6/7 unwired) |

**Tally:** COV 8 (01,04,18,33,49 + pins) · **AUTO 27** · LOOP 10 (15,21–26,29,32,44) · THEIA 4 (07,11,27,28 — all
contracts survive as carrier surfaces) · LAW 1 (13).

**Highest-ROI automatable-unwired (fold into the tranches):** **T37** 11 kernel-projection round-trips (biggest
ROI — pure kernel, becomes live-wire manifest entries) → **T12/T14** · **T39/06** gnostic 10-step e2e (named tests
exist, unrun) → **T10/T11** · **T12/08** `s4'.mediation.route` frame (already live) → **T11/T12** · **T17/09** `epi
canon coord`==bimba-mcp byte-identity (closes two AR-heavy infra tracks + data-spine §5.2) → **T18** · **T16**
sync-ack + `MostRecent` + `graph_revision` → **T13/T17** · **T02** Spanda dual-oscillator reds (harness **T4.g** — authored + manifested 2026-07-06) → **T14** · **T35** `CLOCK_BACKBONE[24]` + KairosFrame → **T14** · **T30/43**
consumption + coordinate-header/`.h`<`.c` lints → **T18**.

The 10 LOOP tracks are the M0'–M5' inspector panes + block-kit — genuinely mount-and-observe per charter §5; none
landed in the carrier yet. Their *sub-invariants* (evidence serde 26, χ-field determinism 23, PASU round-trip 25)
are unit-extractable and should migrate to AUTO as those panes land.

---

## 7. Axis E — Full-system integration

No test spans **kernel → gateway → carrier store → graph**. `live-wire` is the closest (kernel→gateway→Zod
parse) but stops at parse: it never asserts the carrier's stores ingested the frame, and never touches the graph
(S2) or vault (S1) side. The `INTEGRATED-1-2-3` (cosmic engine) and `INTEGRATED-4-5-0` (recognition) specs +
Track 09 (bimba-graph integration) define cross-layer flows that no single suite exercises end to end. Hardening
here is one **thin** integrated smoke: cast → profile frame → assert store mutation → assert a graph/vault write,
in one spawned-real-system test.

---

## 8. Axis F — Harness self-integrity

- **F1 — the gate does not run its own unit tests.** `.codex/scripts/__tests__/{verify-all,kernel-truth,
  lint-test-honesty,verify-tranche,m-dev-plan-assess}.test.mjs` exist (`node:test`) but **no suite executes
  them** — they are honesty-*linted*, never run. A regression in the harness itself ships green.
- **F2 — honesty-lint is blind outside JS/TS-in-app.** `lint-test-honesty.mjs` `TEST_ROOTS` = pratibimba-app
  `{src,scripts}` + `.codex/scripts/__tests__` only. The ~660 backend Rust tests, the C corpus, the Python
  corpus, and (once wired) the ta-onta corpus get **no** honesty check — `assert!(true)`, asserting a const
  equals itself, or blanket `#[ignore]` would pass unseen.
- **F3 — kernel-truth watches only 3 Rust test files** (portal-core `kernel_truth`, epi-cli `kernel_truth_oracle`,
  `portal_clock_state`); it cannot see the C-engine energy divergence (C2) or the broad green portal-core corpus,
  so "every expected red stands" is a claim over an arbitrary 3-file slice, not the computational surface.
- **F4 — inventory drift:** `verify-all.test.mjs` hard-codes the 10-suite membership; adding backend suites must
  update it (and that membership assertion is a legitimate allowlisted structural check — `test-honesty-allowlist.json`
  is currently `[]`).

---

## 9. Hardening tranches (T8+)

Each tranche states the gap, the **real** test (behavioral, per charter §3), the surface, where it wires, and its
verify. Priority: **P0** = closes a "green table over untested system" hole that gates other tracks now.

- **T8 — Gate the offline backend (Axis A, P0).** Add the ~13 A-Gate-Now crates to `verify-all` `SUITES` as
  `cargo test` entries (workspace-aware; keep live-infra tests behind their existing `#[ignore]`). Update
  `verify-all.test.mjs` membership + allowlist justification.
  Verify: `node .codex/scripts/verify-all.mjs` shows the new rows green; deliberately break one hen/graph-services
  test and show exit≠0.

- **T9 — Wire the S4 `ta-onta`/`pi-agent` runner (Axis A, P0-blocker).** Add an executable runner (a
  `package.json` with `node --test --experimental-strip-types 'Body/S/S4/**/*.test.ts'`, or `tsx`); register as a
  `verify-all` suite. Until this lands, ~336 tests are dark.
  Verify: runner executes the 49 files; count reported; one deliberate failure propagates to the gate.

- **T10 — Env-guarded Python + spacetime lanes (Axis A, P1).** `epi-gnostic` `pytest` behind an offline lane
  (`SKIP_NEO4J_TESTS=true`) + a documented live lane; confirm `epi-spacetime-module` host `cargo test` builds.
  Verify: offline `pytest` green in the gate; live lane documented + runnable on demand.

- **T11 — Active gateway-method probe in the gate (Axis B, P0).** Wire `gateway-method-audit.mjs` (T5) into
  `verify-all` as a stage that spawns the real gateway and records the 205-method present/absent table to
  `plan.runs/gateway-method-audit.json`; **fail the stage if a method a track marks `done` is absent.** This is
  recon-before-build made a gate.
  Verify: table regenerates; flip one method to "expected present" and show the stage catches its absence.

- **T12 — Grow the live-wire projection manifest to the typed surface (Axis B, P1).** Add manifest entries
  asserting **presence + shape** for every typed-but-unwired projection: `pasuBeingPattern`, `anuttaraWitness`,
  `vakLanguificationTrace`, `graphHandle`, `bedrock`, `depositionAnchor`, `s2Anchor`/`s3Anchor`; **type**
  `kleinFlip`/`anandaVortex`/`harmonicGrammar` (replace `z.unknown()` with real Zod, then assert). Enforce the
  header law "absence of declared coverage is a FAIL" by failing when a profile field has no manifest entry.
  Verify: manifest covers ≥ the ~52 fields (present-or-explicitly-exempt); corrupt one field in replay → reject.

- **T13 — Capture the declared event channels (Axis B, P1).** Extend live-wire to subscribe/capture the
  `KernelBridgeEvent` types the system emits beyond `profile.update`/`m123.chime` (world_clock, presence,
  cymatic_field, audio_bus…), and add the world-clock-independence check (assert an independent `s3.world_clock`
  source, not tick-synthesis).
  Verify: each declared+emitted channel captured & strict-parsed; a dropped channel fails.

- **T14 — Author the untested kernel laws (Axis C, P0 for C1/C2).** Real tests: **C1** Möbius descent
  (step-size + gradient direction) in portal-core/epi-lib; **C2** canonical `(4·E4+5·E5+6·E6)/15` as one law
  asserted on **both** the Rust projection and the C engine (kill the `test_kernel.c` divergence or record it as
  a red); **C3** χ-solver reference impl; **C4** bell-partial offsets; **C6** Q_composed order; **C7** runtime
  suit-integral Σ=360. Register the still-broken ones in the kernel-truth manifest with owning tracks.
  Verify: each new test runs under the suite; reds carry an owning track; C2 asserted identically on both engines.

- **T15 — Extend kernel-truth's reach + reconcile the manifest (Axis C/F, P1).** Point `kernel-truth.mjs` at the
  full computational corpus (incl. the C engine), and reconcile the T4 spec's 6 named categories vs the 5-red
  manifest so the manifest is provably the complete set of open computational violations (fix stale spec rows:
  DR-R0 + transcription are green; add the 64-codon cross-check red).
  Verify: manifest audit shows no unmanifested red across the extended corpus.

- **T16 — Run + honesty-lint the harness's own tests (Axis F, P0-cheap).** Add a `harness-selftest` suite
  (`node --test .codex/scripts/__tests__/`) to `verify-all`; extend `lint-test-honesty.mjs` with language-aware
  checks (Rust `assert!(true)` / self-equal const / blanket `#[ignore]` without an expected-red manifest entry;
  Python equivalents) across the backend + C + Python trees.
  Verify: self-tests run in the gate; a planted `assert!(true)`-only Rust test and a self-grep JS test are both
  rejected.

- **T17 — One end-to-end integrated smoke (Axis E, P1).** A single spawned-real-system test: cast → `profile.update`
  frame → assert carrier store mutation → assert a graph (S2) or vault (S1) write. Names the cross-layer flow so a
  future regression in *wiring* (not just a unit) is caught.
  Verify: the flow asserts a state change at each layer; cutting any layer fails it.

- **T18 — Parity + mechanical-lint gates (Axis D, P1; cheap, high track count).** (a) `epi canon coord … --depth`
  == bimba-mcp `spec_retrieve` **byte-identical** (6 coords × 3 depths) as a gated epi-cli test — closes Tracks
  17 + 09 and data-spine §5.2 in one assertion. (b) Consumption lint (no raw hex/font/duration in carrier CSS,
  Track 30) + coordinate-header presence & `.h`<`.c` size check across the carrier (Track 43) as `verify-all`
  lint stages — the anti-fraud/anti-drift posture Track 00 already embodies, extended to the surfaces Axis D
  flagged.
  Verify: parity test green on the current basis, perturb one coord's output and show it fails; a raw-hex fixture
  and an oversized `.h` fixture both fail the lint.

---

## 10. Sequencing

P0 first (they unblock trustworthy closure of the whole rerun): **T8** (gate offline backend, ~660 tests) ·
**T9** (ta-onta runner, ~336 dark tests) · **T11** (gateway-method probe in gate) · **T14 C1/C2** (Möbius +
4:5:6) · **T16** (harness self-tests + honesty reach). Then P1 depth: **T10, T12, T13, T15, T17, T18**. The 27
automatable-unwired tracks (§6) fold into the nearest tranche: kernel round-trips (37/02/35/36) → T12/T14;
gateway-family frames (08/12/16/19/34/38/39/40/47/48) → T11/T13; parity + lints (09/17/30/43) → T18; gnostic/
autoresearch e2e (06/39/46) → T10. Each closed tranche should annotate the recapture-register row it discharges.

## 11. What stays a drivable loop (honesty about limits)

Per charter §5, some Verify commitments genuinely need the app launched and observed by the Architect (motion
timings DR-UI-4, palette/engraved-atlas rendering, playable-84 feel, onboarding empty-states). These are marked
DRIVABLE-LOOP-ONLY in §6 and are **not** forced into auto-assertion; the harness gates their *substrate*
(kernel/gateway/contract) while the surface stays a human-observed loop. Naming them here prevents a false "100%
automated" claim — itself a form of the fraud Track 00 exists to stop.
