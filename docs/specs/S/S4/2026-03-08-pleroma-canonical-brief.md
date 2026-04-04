# Pleroma Canonical Brief

**Date:** 2026-03-08
**Status:** Canonical briefing for the real-port tranche
**Scope:** Pleroma identity, S4' body, and interpretation guardrails before implementation

## Authority Order

> **Updated 2026-04-03 — OMX fork base supersedes superpowers lineage.**
> The runtime substrate is now `vendors/oh-my-codex/` (OMX) and claw-rust.
> Full authority split: `docs/specs/S/S4/2026-04-03-omx-pleroma-claw-authority-matrix.md`
> Port routing decisions: `docs/specs/S/S4/2026-04-03-omx-pleroma-port-matrix.md`

1. **ta-onta specs** (`.pi/extensions/ta-onta/pleroma/`, `docs/specs/S/S4/`) — semantic authority
2. **VAK-SUPERPOWERS-INTEGRATION-SPEC.md** (archived) — original philosophical ground; semantics still authoritative, packaging superpowers lineage is NOT
3. **OMX** (`vendors/oh-my-codex/`) — Codex runtime/workflow layer; replaces `obra/superpowers` fork base
4. Execution-ground documents:
   - `docs/plans/2026-04-03-omx-pleroma-claw-runtime-migration.md` (primary)
   - `docs/specs/S/S4/2026-04-03-omx-pleroma-port-matrix.md`
   - `docs/specs/S/S4/S4i-PLEROMA-PORT-MATRIX.md`

Interpretation rule: OMX runtime docs answer packaging, loading, and Codex runtime fit. They do not redefine what Pleroma means. ta-onta specs remain telos-grounding.

## Pleroma Identity

Pleroma is the executive S4' layer that ports the high-value Superpowers workflow body into Ta Onta / Epi-Logos form. In the VAK spec, VAK, Ta Onta, and Epi-Logos are one reality in three registers; Pleroma is the executive movement inside that larger body, not an isolated utility plugin.

In canonical planning, named modules are functions within one integral system, not separate sovereign systems. Pleroma therefore should not become a parallel runtime. It should be the executive package that makes the S4-0' through S4-5' body operational while Rust and `.pi` remain substrate.

## Fork Base

> **Updated 2026-04-03:** The fork base is now `vendors/oh-my-codex/` (OMX v0.11.12).
> `obra/superpowers` is no longer the packaging base; it is archived reference only.
> See `docs/provenance/2026-04-03-oh-my-codex-vendor.md`.

~~The intended fork base is `obra/superpowers v4.3.0` per the VAK integration spec.~~
The `obra/superpowers` clone captured in Phase 1 (`a98c5dfc9de0df5318f4980d91d24780a566ee60`, `v4.2.0`) remains in `vendor/obra-superpowers-v4.2.0` as read-only reference. It is not the delivery substrate.

## Atomic vs VAK Skill Taxonomy

The atomic vs VAK skill taxonomy is binding and must survive the port as a real behavioral distinction, not just a documentation convention.

The VAK distinction is binding:

- Atomic skills are bounded operations over one tool or one substrate surface. Examples from upstream/local evidence: `tmux`, `mprocs`, `repl`, `notebooklm`, `pleroma-skill-proxy`, `technē-spawn`, `technē-relay`, `technē-list`, `technē-close`.
- VAK/orchestration skills are coordinate-bearing executive skills that interpret and route work through the S4' grammar. Examples: `vak-evaluate`, `vak-coordinate-frame`, `anima-orchestration`, `day-night-pass`, `ouroboros`.

Atomic skills are not allowed to silently grow into constitutional routers. VAK/orchestration skills may compose atomic skills, but they must remain traceable to the six reflection layers.

## Constitutional Agent Routing

The VAK spec makes the constitutional routing table non-negotiable:

- `(00/00)` → `nous`
- `(0/1)` → `logos`
- `(0/1/2)` → `eros`
- `(0/1/2/3)` → `mythos`
- `(4.0/1-4.4/5)` → `anima` — **active execution / Ralph mode**
- `(4.5/0)` → `psyche` — session synthesis / contemplative subject
- `(5/0)` → `sophia`

**CANONICAL CORRECTION (2026-04-04):** `(4.0/1-4.4/5)` → `anima` (active execution). `(4.5/0)` → `psyche` (session subject/synthesis). These are distinct agents. Any document that maps `(4.0-4.4/5)` or `(4.0/1-4.4/5)` to `psyche` is incorrect and must be treated as stale.

`nous` is a fresh-perspective resetter, not a normal executor. `anima` is the active execution coordinator (Ralph mode). `psyche` holds the session subject and synthesises. `sophia` closes and synthesizes across the Möbius return. This routing must be realized through plugin agents plus substrate dispatch, not via free-floating prompt conventions.

## Day/Night' Topology

Day/Night' is not optional ornament. Day is forward synthesis across the CP lattice. Night' is reverse analysis with different questions, not a simple review pass. The Möbius return from P5' insight to P0' questions is part of the canonical closure law, and any closure/eval surface must preserve it.

## Ouroboros Role

Ouroboros is a workflow protocol, not merely a script bundle. In VAK terms it corresponds to the user-engaged CPF path and to explicit collaboration loops between architect/patient and surgeon/executor. It should remain an orchestration surface over atomic primitives such as `ralph-tui`, `tmux`, and git discipline, not collapse into substrate mechanics.

## Klein Implications

Klein semantics belong to S4-5' closure and inversion. They are part of the target executive body, but the current local upstream evidence does not provide a finished installed skill artifact that can be ported directly. Klein-mode therefore remains canonically required but not yet a true port.

## Technē Role

Technē is substrate/helper-surface logic, not a separate constitutional sovereign. The `technē-*` family governs bounded external-agent workshop lifecycle: configure progeny, spawn, relay, enumerate, close. It belongs under Pleroma as atomic executive tooling over substrate primitives.

## Constitutional Progeny Principle

The VAK spec's constitutional progeny principle is binding. External CLI agents are not subcontractors; they must inherit:

- canonical skill files
- CF identity
- session capture / lineage surface
- bounded recursion and policy constraints

This principle strongly supports a single `plugins/pleroma/` executive package with provider forks underneath, rather than multiple sovereign external-agent plugins.

## Non-Negotiables

- `plugins/pleroma/` is the executive package.
- Rust and `.pi` remain substrate, not rival authoring surfaces.
- True ports must be traceable to upstream artifacts.
- Capabilities with no direct upstream artifact may still be canonically required, but they must be labeled `fresh-design`, not `port`.
- Atomic vs VAK skill taxonomy from the VAK spec is binding.
- Constitutional progeny is binding.
- Technē is helper substrate, not a sovereign agent.

## Ambiguities That Remain

- The concrete local Superpowers provenance is `v4.2.0`, while the intended fork base is `v4.3.0`.
- Klein-mode is conceptually required but lacks a finished installed upstream skill artifact.
- The exact surfacing of Moirai as one agent with internal roles versus separate surfaced subagents remains an implementation choice constrained by canonical semantics.
- Ouroboros must remain faithful to the CPF/user-engaged telos, but its final plugin packaging still needs reconciliation against current runtime constraints.
