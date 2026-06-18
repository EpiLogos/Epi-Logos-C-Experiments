# AGENTS.md — S4-0p-khora

## Purpose
Khora is the ta-onta carrier extension (S4-0', `coordinate: "S0/S0'"`) that is the bootstrap spine of every agent session — session identity, secrets materialisation, and canonical write authority. Per CONTRACT.md: "It is the ground layer that everything else stands on."
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S4-SPEC]] (carrier class) -> [[S0-SPEC]] / [[S0-ARCHITECTURE]] / [[S0-0-SPEC]] (actualised ground layer).

## Ownership
- `CONTRACT.md` — binding responsibility, tools, hook seams, invariants (read first)
- `extension.ts` — PI extension entry: tool/hook registration, flow-watcher + sophia-fire wiring, session lifecycle calls into the [[M4]] Nara protein bridge
- `spine-contribution.ts` — `khoraSpineContribution()` injection slot / ledger contribution (`coordinate: "S0/S0'"`)
- `modules/` — `flow-watcher.ts`, `sophia-fire.ts`, `z-phase-vak.ts` (phase/VAK address composition)
- `S0/` — S0-primitive layer: `cli/` (agent CLI capability prefs + wrappers), `tools.json`, session shell hooks
- `S0'/` — QL augmentation: `system-select.ts`, `cross-agent.ts`, `child-extension-propagation.ts`, `hooks/`, `cli-primitives.md`
- `tests/` — `sophia_disclosure_wire.test.ts`, `z_phase_vak.test.ts`
- Does NOT own: vault folder structure / templates / Day-NOW logic (Hen), agent routing (Anima), temporal scheduling (Chronos), knowledge crystallisation (Aletheia). Domain law for S0 ground lives in its owning [[S0-SPEC]], not redefined here.

## Local Contracts
- `CONTRACT.md` (this directory) — the binding interface: tools, hook seams, bootstrap-sequence order, write-authority invariant, secrets invariant
- Code coordinate: `spine-contribution.ts` declares `coordinate: "S0/S0'"`; `extension.ts` is the PI registration surface
- Owning spec: [[S4-SPEC]] (ta-onta carrier) and [[S0-SPEC]] / [[S0-ARCHITECTURE]] (ground layer Khora actualises)

## Work Guidance
- Run `gitnexus_impact` before editing any exported symbol (e.g. `khoraSpineContribution`, `composePhaseVakAddress`, the registered `khora_*` tools).
- All entity references in produced artifacts use [[wikilink]] syntax; vault writes use coordinate-prefixed `c_n_*` / `s_0_*` frontmatter.
- Bootstrap-sequence order and the `khora_write` write-authority invariant in CONTRACT.md are sacred — never skip, reorder, or bypass.
- No secrets in source: `op://` references via varlock only, never raw values.

## Verification
- `node --test Body/S/S4/ta-onta/S4-0p-khora/tests/*.test.ts` (TS tests under `tests/`: `sophia_disclosure_wire.test.ts`, `z_phase_vak.test.ts`, `now_fibonacci_ground.test.ts`)

## Child DOX Index
- (leaf)
