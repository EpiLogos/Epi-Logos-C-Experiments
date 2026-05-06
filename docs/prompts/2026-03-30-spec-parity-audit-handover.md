# Handover: Spec-to-Code Parity Audit — Nara & Cosmic Clock

**Session this continues from:** `b3427ff3-3daa-469e-baa3-e35bd05f37c3`
**Session log file:** `/Users/admin/.claude/projects/-Users-admin-Documents-Epi-Logos-C-Experiments/b3427ff3-3daa-469e-baa3-e35bd05f37c3.jsonl`
**Current branch:** `claude/nara-clock-impl` (HEAD: bf717c2)
**Both test suites pass:** `make test` (all C suites) + `cargo test` (37 Rust suites, 0 failures)

---

## Context

The prior session completed a critical gap resolution sweep (`docs/plans/2026-03-30-critical-gap-resolution-plan.md`) covering 11 P0/P1 items across the Nara and Cosmic Clock subsystems. The work is committed and tests pass, but passing tests and building code are necessary but not sufficient conditions for spec fidelity. This session is the full parity audit: does the running system — C library, Rust CLI, gateway RPC, and portal TUI — actually embody what the specs say?

---

## Spec Corpus

The canonical spec set lives in two locations:

**`docs/plans/CLOCK-AND-NARA-SPECS/`** — 15 numbered spec files (00–15) plus `dataset-bridge/`:
- 00-canonical-invariants.md, 01-quintessence-hash, 02-16-lenses-backbone-temporal, 03-spanda-double-helix, 04-shadow-dynamics, 05-ql-7fold-vak, 06-vak-gap-analysis, 07-unified-architecture, 08-nous-earth, 09-cosmic-clock-tui-spec, 10-holographic-validation, 11-m1-m2-epogdoon-bridge, 12-anuttara-languification, 13-shadow-decans, 14-m3-knowing-dossier, 15-m2-vibrational-matrix
- `dataset-bridge/`: 5 files covering canonical dataset coordinates for all cross-layer lookups

**`docs/specs/M/`** — M0–M5 subsystem specs + cosmic clock architecture + UX arc + HMS quaternionic overlay

The parity audit should trace each spec's functional requirements through to their implementation: C structs/LUTs in `epi-lib/`, Rust logic in `epi-cli/src/nara/`, portal plugins in `epi-cli/src/portal/plugins/`, gateway RPCs in `epi-cli/src/gate/`, and CLI commands in `epi-cli/src/`.

Anything that is stubbed, zero-initialized, returns placeholder data, or is wired to `todo!()` / `unimplemented!()` / `None` where the spec requires a real value is a gap. Anything that computes a value without sourcing it from the canonical dataset path described in `dataset-bridge/` is a gap. Anything the spec says should be live (reading SharedClockState, oracle cast feedback, kairos planet degrees) but isn't reading live state is a gap.

---

## DepWire

Use DepWire to map the full dependency graph across C and Rust symbols. The goal is to surface: which spec-required symbols exist but are unreachable from their consumers; which data paths claim to go C→Rust FFI but the FFI binding is missing or incorrect; which portal plugin fields claim to read SharedClockState but don't hold a reference; which gateway RPCs are registered but dispatch to stubs. DepWire's cross-language symbol mapping is especially valuable here given the C library (`epi-lib/`) feeding into the Rust CLI via FFI.

---

## TUI Verification

The portal TUI is the lived experience of all of this. To enter the TUI:

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments"
cargo build --manifest-path epi-cli/Cargo.toml
epi-cli/target/debug/epi portal
# or: epi-cli/target/debug/epi portal --reset   (clears saved workspace state)
# or: epi-cli/target/debug/epi portal --tab structural
```

Tab 0 ("M4'-M5' Personal"): identity / flow / oracle panes
Tab 1 ("M0'-M3' Structural"): clock.cosmic / m3.knowing / m1.walk

Additional plugins available via pane split palette: m2.vibrational, m4.spine, m4.mini_clock, m4.medicine, m4.lens, m4.transform, m4.pratibimba, m5.logos, m5.chat, m5.fsm.

TUI verification means: does the plugin render meaningful data sourced from the spec-described data path, or does it render placeholder strings? Does SharedClockState propagate correctly from an oracle cast through to the clock display and vibrational matrix? Do kairos planet positions (from `epi kairos sync`) update the portal's live state? Does the Cosmic Clock torus move with the current degree position? Are all 8 chakra spine levels responsive to oracle decay?

The gateway is the other verification surface. Run `epi gate start` and test RPCs directly:
```bash
epi-cli/target/debug/epi gate start &
# then send WebSocket messages (port 18794) to verify nara.* methods
```

---

## Codex Worktree — Side-by-Side Comparison

There is a parallel Codex implementation at:

```
.worktrees/nara-clock-runtime-impl/   ←  branch: codex/nara-clock-runtime-impl (HEAD: 92f261e)
```

This worktree has `clock.rs`, `m2.rs`, `m3.rs` etc. but lacks `mini_clock.rs`, `spine.rs`, and the portal wiring changes from the current session. It represents an independent Codex-authored version of the same subsystems. Side-by-side comparison is valuable for:
- Finding implementations the Codex branch has that main is missing (or vice versa)
- Verifying that the canonical data paths were implemented consistently
- Identifying divergences in data model decisions (e.g. planet encoding, CLOCK_DEGREE_LUT field layout)

To enter the codex worktree directly:
```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments/.worktrees/nara-clock-runtime-impl"
```

It is a fully self-contained git worktree — you can build and test it independently without affecting the main working tree.

---

## Documentation

The audit should identify where spec-level knowledge is NOT captured in code comments, test assertions, or inline documentation — specifically:

- Where the `dataset-bridge/` canonical coordinate paths are traversed in code but not annotated with the source coordinate (e.g. `// #2-3-x → decan ruling_planet`)
- Where `_Static_assert` or equivalent compile-time invariants could encode spec structural laws but don't
- Where the `CLOCK_DEGREE_LUT` comment block or field docs don't reference the canonical spec sections that define them
- Where gateway RPC docstrings don't specify the JSON schema the spec defines

Documentation gaps here are also spec-parity gaps — if the code can't be read against the spec without a researcher mapping it by hand, the translation is incomplete.

---

## Starting Point

Read `docs/plans/2026-03-30-critical-gap-resolution-plan.md` to understand what was just completed, then read the spec files in `docs/plans/CLOCK-AND-NARA-SPECS/` in order. The canonical invariants file (`00-`) is the invariant ground — any violation of its constraints anywhere in the codebase is a P0 gap. The holographic validation matrix (`10-`) provides an existing cross-check structure worth comparing against actual code state.

The parity audit has no prescribed output format — it should result in whatever combination of code fixes, test additions, documentation, and gap reports gives the highest fidelity between the spec corpus and the living system.
