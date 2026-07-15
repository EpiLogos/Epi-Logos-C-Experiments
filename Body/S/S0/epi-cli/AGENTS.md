# AGENTS.md — epi-cli

## Purpose
Rust crate `epi-logos` (lib `epi_logos`, bin `epi`): "The Master CLI for the Epi-Logos coordinate system — ontology-is-code" — the master command surface + TUI that drives every S-layer over FFI and the gateway.
Canon: [[ARCHITECTURE-DIAGRAM-PACK]] -> [[S-SYSTEM-INDEX]] -> [[S0-SPEC]] / [[S0-ARCHITECTURE]]

## Ownership
- `Cargo.toml` / `src/lib.rs` — crate root: re-exports command modules and bridges sibling crates (`hen` <- `epi-s1-hen-compiler-core`, `epii_*` <- `epi-s5-*-core`)
- `src/main.rs` — `clap` entrypoint for the `epi` binary
- `build.rs` — compiles `../epi-lib` C sources via `cc` (the C FFI bridge); links BLAKE3 from `../vendor/blake3`
- `src/` command families — `gate/` (gateway RPC/control, including [[M4]] Nara session protein bridge commands and `s4'.psyche.update` bounded Psyche patches with renderer state), `canon/` (`epi canon coord/search/diff` depth-ladder distribution surface over [[S5']] gnostic canon and [[Bimba]] coordinate payloads), `nara/` ([[M4]] personal, including [[Vama Shakti]] arena admin commands and the `epi nara train-lora` local-only membrane into the S4-x Nara skill family), `portal/` + `tui/` (ratatui-hypertile), `vault/`, `agent/` + `techne/` (agent/gateway lifecycle), `graph/`, `know.rs` (`epi know` unified coordinate-knowing packet), `slot.rs` (Pi-Agent model-slot + harness-slot config), `skill.rs` ([[Agora]] skill registry / [[Aletheia]] retrain-review CLI), `sync/`, `ffi/`, `core/`, `notebook/`, `profile/`, `book/`, `code/`, `sesh/`, `up.rs`, `vimarsa/`; `src/main.rs` also hosts the thin `pi train-ebm` / `pi export-ebm-state` S0 membrane over S5 resonance-corpus law.
- `src/gate/s1_hen.rs` — thin gateway adapter for governed [[S1]] vault reads/writes/moves; rename integrity and literal rewrite semantics are delegated to `hen-compiler-core::wikilinks::reconcile_rename`, never reimplemented in [[S0]].
- `src/nara/kairos.rs` + `src/gate/nara.rs` — local [[Kerykeion]]/Kairos process adapter and `nara.kairos.*` gateway membrane. `nara.kairos.probe_kerykeion` is dependency-only: it reports Python/import/version availability and never reads [[PASU]] or natal fields; Track 32.T32.10 uses it before persisting opt-in.
- `src/nara/medicine_frame.rs` + `src/nara/medicine_route.rs` + `src/gate/nara.rs` — canonical Medicine LUT projection through `nara.medicine.snapshot` and the explicit `nara.medicine.pin` adapter. Snapshot is read-only evidence; pin accepts only a canonical decan herb and atomically replaces the active `EPI_NOW_PATH` after S1 Hen mutates `c_4_pinned_materia`. Canon update flag: [[S0-SPEC]] / [[M4'-SPEC]].
- `src/entity.rs` + `src/world.rs` — CCT-14 CLI parity (`epi entity capture/classify/promote_to_type/list`, `epi world graduate/list_entities`) per [[DR-S5-ONE-1]]: both call the SAME `src/gate/s1_hen.rs` handlers the gateway `s1'.entity.*`/`s1'.world.*` dispatch arms use (lifecycle LAW lives in `hen-compiler-core::entity_lifecycle`; birth-codon per CCT-14b).
- `tests/` — extensive contract/integration suites (gate_*, nara_*, vault_*, agent_*, portal_*, kernel_*; `entity_capture_round_trip` + `world_graduate_via_cli` cover CCT-14 CLI↔gateway parity)
- `schemas/` (TS dataset validator), `contract-inventory/` (`s0-membrane-inventory.json`), `scripts/`, `assets/`, `vendor/`
- Does NOT own coordinate semantics it merely invokes — graph law lives in [[S2]], gateway/session law in [[S3]], agent runtime in [[S4]]; domain law stays in its owning module, not pulled into [[S0-SPEC]] by convenience.

## Local Contracts
- (no local CONTRACT.md; no `//!` header in `src/lib.rs`) — binding surface is the `clap` command tree in `src/main.rs`, the C FFI declarations in `src/ffi/`, and `contract-inventory/s0-membrane-inventory.json`
- Owning spec: [[S0-SPEC]] / [[S0-ARCHITECTURE]]

## Work Guidance
- Run `gitnexus_impact({target, direction:"upstream"})` before editing any symbol; warn the user on HIGH/CRITICAL risk.
- C/FFI invariant: `GET_PTR(ptr)` before every dereference; the HC struct stays 128 bytes.
- Reference all coordinates/specs/crates/agents as `[[wikilink]]`; vault writes use coordinate-prefixed `c_n_*` frontmatter.
- `src/gate/kernel_bridge_runtime.rs` must enforce [[DR-M4-4]] q-partition checks before caching or serialising safe profile payloads: private `q_personal` / `q_identity` / `q_activity` / `q_composed` snake-case keys and derivatives are refused; public `q_*` / `qm_*` carrier keys must match the 0-5 allowlist.
- Bell kernel ([[m123-modal-resonator-bell-kernel-spec]] §§5–6): `src/gate/kernel_bridge_runtime.rs` owns `M123ChimeFrameJsonShape` + `m123_chime_frame_from_profile` (contract `S0.kernel-bridge.m123-chime-frame`); the heartbeat in `src/gate/server/mod.rs` publishes it as a 1 Hz `m123.chime` SIBLING of `profile.update` — additive, never a replacement. World-clock tick/degree mismatch → `worldClockBinding.state: "stale"` + incoherent frame; consumers block readiness. `kernelBridge.m2.epogdoonProjection(address72)` and `kernelBridge.m3.lensCodonBinary(lensId)` are guarded C-backed capabilities; the latter is on-demand over the real gateway (not a 1 Hz profile payload), addresses the primary [[Fibonacci Ground]] as functional lens 16 and the 16 derived divisions as ids 0..15, and makes every derived packet carry `groundingLensId: 16`. Rust, S3 method registry, and active [[Pratibimba]] TypeScript preflight remain exact peers. The Zod mirrors live in `schemas/src/kernel-bridge.ts` (lensMode law: lens 0..11, mode 0..6 — never swap back; public-current payloads reject raw field/personal-cymatic/[[M4]] body keys).
- Zod surface growth 2026-07-06 (Track 00.T12/T13): `schemas/src/kernel-bridge.ts` + new `schemas/src/gateway-bus.ts` now type the previously-`z.unknown()` profile projections (anandaVortex, harmonicGrammar, bedrock, graph/deposition/future anchors, readinessLedger — snake_case on the wire, context-frame web, pointer anchors) and 4 gateway bus event channels; these TYPE what the kernel already emits (conforming, not inventing). Quintessence is handle-only per [[DR-M4-3]]: 8-key allow-list, no ≥16-hex digests in string values, unit-quaternion norm, `quintessenceWeight` the one resonance scalar. Live-wire (`Body/M/pratibimba-app/scripts/live-wire.mjs`) enforces field-coverage: every wire field is manifest-covered, justified-EXEMPT, or DECLARED_NOT_EMITTED — an uncovered field FAILS. Still-`z.record` gaps (EXEMPT-tracked): chromatic, elements, planetaryChakral, binary, codonRotationProjection. Owning canon flag: [[S0-SPEC]]/kernel-bridge contract docs should absorb the typed-surface inventory on the next harmonisation pass.
- `epi app dev` / `epi app launch` must preflight the local gateway before launching the Pratibimba Electron surface; `epi app dev` passes `EPI_GATEWAY_URL` into Theia so `kernel-bridge` and OmniPanel use the managed gateway instead of a stale or absent process.
- Gateway liveness records must describe a real bound listener: write `status.json` only after bind/registration succeeds, and clear stale status/PID files when preflight cannot probe a gateway.

## Verification
- `cargo test -p epi-logos` (Rust). FFI bridge to the C layer: `make rust-test` at the repo root.
- `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml nara_session_dispatch_cli_bridge_returns_protected_handle --lib` for the [[M4]] Nara session dispatch CLI bridge.
- `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml slot_list_round_trip` for `epi slot` model/harness config round-tripping.
- `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test pi_ebm_commands` for the `pi train-ebm` / `pi export-ebm-state` S0 mirror.
- `cargo test --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml --test nara_train_lora_cli` for the real binary-to-local-skill corpus/checkpoint path.
- `cargo test --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml --test cli_canon_coord_depth_ladder`; `--test cli_canon_search_semantic`; `--test cli_canon_diff_structural` for `epi canon` surfaces.
- `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test kernel_bridge_m123_chime_frame` for the bell-kernel chime frame; `cd schemas && npx vitest run` for Zod contract parity (parses the real generated baseline profile incl. `modalResonator`).
- Governed [[S1]] rename: `cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_s1_vault_surface --test vault_hen_boundary_audit` (real temp filesystem plus spawned WebSocket gateway).
- Kairos dependency probe: `cargo test --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_nara_kairos_probe` (real Python process plus WebSocket gateway; no identity fixture).
- Medicine snapshot + governed pin: `cargo test --offline --manifest-path Body/S/S0/epi-cli/Cargo.toml --test gate_nara_medicine_snapshot` (real WebSocket gateway plus real filesystem NOW mutation).

## Child DOX Index
- (leaf)
