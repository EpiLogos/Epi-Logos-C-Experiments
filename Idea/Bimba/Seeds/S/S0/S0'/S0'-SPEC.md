---
coordinate: "S0'"
c_4_artifact_role: "canonical-seed-spec"
c_1_ct_type: "CT1"
c_3_crystallised_at: "2026-06-02"
c_0_source_coordinates:
  - "[[S0-SPEC]]"
  - "[[S0-SHARD-INDEX]]"
  - "[[S0-SOURCE-INDEX]]"
  - "[[S0-HARMONIC-POINTER-WEB36-SPEC]]"
  - "[[S0-CODON-ROTATION-PROJECTION-SPEC]]"
---

# S0' Specification: Command Law, Kernel Mirror, And Executable Return

## Canonical Status

This file is the single authoritative S0' seed. S0 is the material CLI/process ground; S0' is the reflective command law that turns the whole stack back into executable, typed, inspectable operator surfaces. Older S0' shard files remain historical support material. Current canon is: S0' mirrors and validates, but it does not own vault, graph, gateway, agent, or review domain law.

The VAK gate for this layer is `CPF=(4.0/1-4.4/5)`, `CT=CT1`, `CP=4.1`, `CF=(0/1) Logos`, `CFP=S0'`, `CS=CS0-return`.

## Submodules And Subcoordinates

| Coordinate | Canonical surface | Current substrate |
|---|---|---|
| `S0.0'` | preferred-tool and environment law | `Body/S/S4/ta-onta/S4-0p-khora/S0'/system-select.ts`, `Body/S/S0/epi-cli/src/main.rs` |
| `S0.1'` | command/request schemas | `Body/S/S0/epi-cli/schemas`, `Body/S/S3/gateway-contract/src/lib.rs` |
| `S0.2'` | structured execution and permission boundary | `Body/S/S0/epi-cli/src/gate`, `Body/S/S0/portal-core` |
| `S0.3'` | terminal/session topology | `epi agent tmux`, `epi sesh`, `Body/S/S0/epi-cli/src/sesh` |
| `S0.4'` | kernel/profile mirror | `Body/S/S0/portal-core/src/kernel.rs`, `Body/S/S0/epi-lib` |
| `S0.5'` | bootstrap/return/audit surface | `epi up`, `epi portal`, `Body/S/S0/epi-cli/tests` |

## Public APIs And Gateway Methods

| Method family | Status | Owner rule |
|---|---|---|
| `s0.command.exec`, `s0.command.completion` | native gateway methods in `METHOD_NAMES` | S0' owns command shape; S3 gateway carries transport |
| `exec.approval.*` | S4' permission mirror used by S0 surfaces | S0 may request; S4' owns approval state |
| `browser.request`, `web.login.*`, `logs.tail`, `update.run`, `wizard.*` | setup/operator gateway surface | compatibility across S0/S3 setup, not domain ownership |
| CLI command families under `epi` | mirror | coordinate authority remains with S1-S5/S' owners |

Canonical request/response contracts are structured args, cwd, env, timeout, stdout, stderr, exit code, completion candidates, profile-generation handles, readiness status, and permission receipts. S0' never accepts stringly shell concatenation as a canonical contract.

## Lifecycle, Data Shapes, Privacy

| Shape/event | Privacy | Lifecycle |
|---|---|---|
| `S0ExecRequest` / `S0ExecResponse` | local operational; may contain sensitive env/cwd | request -> approval -> spawn -> stream -> exit -> audit |
| command-completion envelope | public-current except cwd-specific suggestions | prompt -> registry lookup -> capability filter -> completion |
| `KernelTemporalProjection` and profile mirrors | public-current projection only | S0/S3 observe -> portal/bridge consume -> S5 may cite as evidence |
| setup wizard state | local operational with redacted secrets | schema -> patch/apply -> readiness -> channel handoff |

Forbidden leakage: raw secrets, raw private profile fields, raw Nara identity, raw journal bodies, and unredacted environment values.

## Integration Seams

Calls in from humans, PI agents, M' OmniPanel, kernel-bridge, test harnesses, and setup wizards. Calls out to S1 vault commands, S2 graph commands, S3 gateway runtime, S4 agent/permission surfaces, S5 review/autoresearch surfaces, and M' kernel/profile consumers. The seam invariant is that S0' exposes pass-through and readiness; it must not absorb domain semantics just because a command is executable here.

## Cross-Cutting Participation

S0' participates in clock/profile projection, identity-safe kernel mirrors, Day/NOW path display, capability-matrix checks, Graphiti runtime readiness, vault path resolution, and consent/approval gates. It is the return membrane for every S layer.

## Open Decisions And Resolution Status

| Decision | Status | Current resolution |
|---|---|---|
| S0 monolith risk | open cleanup, resolved canonically | S0 routes typed contracts; domain law lives in S1-S5/S' modules |
| `coordinate` vs `bimbaCoordinate` drift | open validation | S0' may expose naming diagnostics; S2/S1 own schema correction |
| provider setup and secret posture | active | `env`, `1password`, and `varlock` must resolve for real and redact outputs |
| plan back-reference edits | blocked by scope | This seed supersedes newer plan fragments; docs/plans were not edited in this run by hard constraint |

## Source Coverage

| Source | mtime | Role |
|---|---:|---|
| `docs/specs/S/S0-S0i-CLI-CORE.md` | 2026-05-31 16:35:19 | newest formal S0/S0' CLI core spec |
| `docs/specs/S/S0-QV-PIPELINE-AND-PLUGIN.md` | 2026-03-10 12:20:50 | historical QV/plugin command context |
| `docs/specs/S/S_Series_Master_CLI_Architecture.md` | 2026-03-15 00:27:10 | S-series CLI bridge |
| `docs/plans/2026-03-05-epi-cli-design.md` | 2026-03-05 14:45:32 | historical CLI design |
| `docs/plans/2026-03-05-epi-cli-expansion.md` | 2026-03-05 15:56:24 | historical CLI expansion |
| `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/01-kernel-bridge-and-s0-foundation.md` | 2026-05-31 20:57:23 | nominal m-dev S0/kernel bridge owner |
| `docs/plans/2026-05-31-mprime-and-sprime-implementation-tracks/13-s-sprime-modularity-and-s0-membrane-cleanup.md` | 2026-06-01 23:57:36 | newest S0 membrane cleanup decision track |

## Substrate And Sibling Seeds

Body paths: `Body/S/S0/epi-cli`, `Body/S/S0/portal-core`, `Body/S/S0/epi-lib`, `Body/S/epi-kernel-contract`, `Body/S/S4/ta-onta/S4-0p-khora`, `Body/S/S3/gateway-contract`.

Sibling seeds: `S0-SPEC.md`, `S0-0-SPEC.md` through `S0-5-SPEC.md`, `S0-SHARD-INDEX.md`, `S0-SOURCE-INDEX.md`, `S0-HARMONIC-POINTER-WEB36-SPEC.md`, `S0-CODON-ROTATION-PROJECTION-SPEC.md`.

## World Ontology Inclusion - 2026-06-02

`Idea/Bimba/World/Types/Coordinates/S/S'/S0'/S0'.md` mtime 2026-04-10 17:50:37 is now cited as load-bearing S0' ontology: reflective command, typing, routing, topology, QV, and agent-facing API law. `Idea/Bimba/World/Types/Coordinates/S/S0/S0.md` mtime 2026-04-10 17:50:37 is the paired executable ground. The shared `P/P'`, `CT`, and `L/L'` World corpora are enumerated in [[S-SYSTEM-INDEX]] and govern this file's VAK/position/lens language.
