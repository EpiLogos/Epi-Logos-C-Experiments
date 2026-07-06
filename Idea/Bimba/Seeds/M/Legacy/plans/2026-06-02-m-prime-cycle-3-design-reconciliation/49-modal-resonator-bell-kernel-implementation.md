# Modal Resonator Bell Kernel Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Land the modal-resonator / bell-kernel contract from [[m123-modal-resonator-bell-kernel-spec]] as the final Cycle 3 tranche, preserving the existing `audio_octet[8]` + `nodal_quartet[4]` authority while making the full M1'/M2'/M3' chime frame explicit and testable.

**Architecture:** S0 remains the profile-bus authority. `ModalResonatorProfile` is an additive profile projection over the existing bus, and `M123ChimeFrame` is an additive event/frame that references existing M1 K2, M2 cymatic, and M3 codon/world-clock handles instead of replacing them. Theia consumes typed bridge surfaces and may label, digest, render, or block on the chime, but it must not recompute pitch, nodal constraints, or protected personal field bodies.

**Tech Stack:** Rust (`portal-core`, `epi-logos` / epi-cli kernel bridge), TypeScript/Zod (`@epi-logos/ql-schema`, `@pratibimba/kernel-bridge`, `@pratibimba/m-extension-runtime`, M1/M2/M3/integrated Theia extensions), JSON contract inventory, existing Node/Vitest/Theia package tests, existing portal-core and epi-cli cargo tests.

---

## Source And Closure Rules

**Source spec:** [[m123-modal-resonator-bell-kernel-spec]]

**Resolved contradictions this plan must preserve:**

| Apparent conflict | Binding resolution |
|---|---|
| Bell framing vs `audio_octet[8]` / `nodal_quartet[4]` | Bell framing is an interpretation and operational contract over the existing 8+4 bus. It never replaces or renames the bus. |
| 8+4 vs 7+5 | 8+4 is the carrier/boundary bus. 7+5 is a diatonic/silent partition over the 12-slot chromatic body. These labels are orthogonal and may overlap. |
| `lensMode` vs `address72` | `lensMode` is 12 lenses x 7 modes (`lens * 7 + mode`). M2 72-address is `m2Address72.address72`, sourced from `resonance72.lensAnchorIndex`, currently `tick12 * 6 + position`. |
| `m1-paramasiva-played-torus` is live evidence but retiring | Consume its current K2/profile-bus handle as evidence only. New modal/K2 ownership targets the active M1 composition mount or confirmed successor. |
| `M123ChimeFrame` vs existing integrated proof handles | `M123ChimeFrame` is additive and references `K2SurfaceHandle`, `M2CymaticTextureContribution`, and `M3CodonRotationProjectionForLensRing`; it does not replace existing blockers. |
| Schema v1 vs v2 | `modalResonator` ships as optional additive v1 unless an existing field becomes mandatory or changes shape/meaning. |
| snake_case vs camelCase | Rust owns snake_case internals; serialized bridge/profile JSON owns camelCase. Ingestion may accept snake_case aliases where current consumers already do. |
| Public chime vs protected personal cymatics | Public-current modal/chime surfaces may carry handles, digests, and bus facts; raw protected M4 field bodies must not cross the boundary. |

**Execution order:**

1. 49.1 S0 modal projection and real profile tests.
2. 49.2 bridge/profile schema parity and casing.
3. 49.3 kernel-bridge capability/event parity.
4. 49.4 M2 packet/cymatic integration.
5. 49.5 M3 world-clock/codon binding.
6. 49.6 integrated 1-2-3 readiness and Wave-A markers.
7. 49.7 privacy/audio/determinism guards.
8. 49.8 canon and release-gate closure.

---

## Tranche 49.1 — S0 `ModalResonatorProfile` Projection

**Files:**
- Create: `Body/S/S0/portal-core/src/kernel/projections/modal_resonator.rs`
- Modify: `Body/S/S0/portal-core/src/kernel/projections/mod.rs`
- Modify: `Body/S/S0/portal-core/src/kernel/profile.rs`
- Test: `Body/S/S0/portal-core/tests/modal_resonator_profile.rs`
- Update generated fixture: `Body/S/S0/portal-core/contract-inventory/baseline-profile.json`

**Step 1: Write the failing Rust profile test**

Create `Body/S/S0/portal-core/tests/modal_resonator_profile.rs`:

```rust
use portal_core::{kernel_tick_from_epogdoon, MathemeHarmonicProfile};

#[test]
fn modal_resonator_preserves_exact_8_plus_4_bus() {
    let profile = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(3, 5));
    let modal = profile
        .modal_resonator
        .as_ref()
        .expect("generated profiles carry modalResonator");

    assert_eq!(modal.live_octet.len(), 8);
    assert_eq!(modal.nodal_quartet.len(), 4);
    for (index, carrier) in modal.live_octet.iter().enumerate() {
        assert_eq!(carrier.octet_index, index as u8);
        assert_eq!(carrier.hz, profile.audio_octet[index]);
        assert_eq!(modal.bell_partials[index].octet_index, index as u8);
    }
    for (index, anchor) in modal.nodal_quartet.iter().enumerate() {
        assert_eq!(anchor.quartet_index, index as u8);
        assert_eq!(anchor.constraint, profile.nodal_quartet[index]);
    }
}

#[test]
fn modal_resonator_separates_lens_mode_from_m2_address72() {
    let profile = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(4, 2));
    let modal = profile.modal_resonator.as_ref().expect("modal profile");

    assert_eq!(modal.lens_mode.lens_mode_index, modal.lens_mode.lens as usize * 7 + modal.lens_mode.mode as usize);
    assert_eq!(modal.m2_address72.address72, profile.resonance72.lens_anchor_index);
    assert_eq!(modal.m2_address72.address72, profile.tick12 as usize * 6 + profile.position6 as usize);
}

#[test]
fn modal_resonator_chromatic_body_supports_orthogonal_labels() {
    let profile = MathemeHarmonicProfile::from_tick(kernel_tick_from_epogdoon(5, 4));
    let modal = profile.modal_resonator.as_ref().expect("modal profile");

    assert_eq!(modal.chromatic_body.len(), 12);
    assert_eq!(modal.diatonic_set.len(), 7);
    assert_eq!(modal.silent_complement.len(), 5);

    let diatonic_slots: std::collections::BTreeSet<u8> =
        modal.diatonic_set.iter().map(|role| role.pitch_class).collect();
    let silent_slots: std::collections::BTreeSet<u8> =
        modal.silent_complement.iter().map(|anchor| anchor.pitch_class).collect();

    assert_eq!(diatonic_slots.len() + silent_slots.len(), 12);
    assert!(diatonic_slots.is_disjoint(&silent_slots));
    assert!(modal.chromatic_body.iter().any(|slot| slot.is_diatonic && !slot.octet_indices.is_empty()));
}
```

**Step 2: Run the failing test**

Run:

```bash
cargo test --manifest-path Body/S/S0/portal-core/Cargo.toml --test modal_resonator_profile
```

Expected: FAIL because `modal_resonator` and projection types do not exist.

**Step 3: Implement the projection module**

Add `modal_resonator.rs` with serializable structs:

- `ModalResonatorProfile`
- `ModalLensModeRef`
- `ModalM2Address72`
- `ModalChromaticSlot`
- `ModalOctetCarrier`
- `ModalNodalAnchor`
- `ModalDiatonicRole`
- `ModalSilentAnchor`
- `BellPartialRole`
- `ModalCymaticMaterialProfile`

Implementation constraints:

- `#[serde(rename_all = "camelCase")]` for all public JSON structs.
- `live_octet[i].hz == profile.audio_octet[i]`.
- `nodal_quartet[i].constraint == profile.nodal_quartet[i]`.
- `lens_mode.lens_mode_index == profile.lens_mode.index()`.
- `m2_address72.address72 == profile.resonance72.lens_anchor_index`.
- `chromatic_body` has exactly 12 slots and uses orthogonal flags/arrays, not a one-of enum.

**Step 4: Export and attach to `MathemeHarmonicProfile`**

Modify `projections/mod.rs` to export the projection types. Modify `MathemeHarmonicProfile`:

```rust
#[serde(default, skip_serializing_if = "Option::is_none")]
pub modal_resonator: Option<ModalResonatorProfile>,
```

Populate it inside `MathemeHarmonicProfile::from_tick` after `vimarsha_reading`, `chromatic`, `diatonic`, and `resonance72` are available.

**Step 5: Regenerate or update the baseline profile from real S0 generation**

Use the existing baseline-generation path if present. If no helper exists, add a small test-only fixture writer under the existing contract-inventory pattern rather than hand-editing JSON.

**Step 6: Verify**

Run:

```bash
cargo test --manifest-path Body/S/S0/portal-core/Cargo.toml --test modal_resonator_profile
cargo test --manifest-path Body/S/S0/portal-core/Cargo.toml --test psychoid_cymatic_handle
```

Expected: PASS. `psychoid_cymatic_handle` must continue to digest the original 8+4 bus without raw protected field exposure.

---

## Tranche 49.2 — Profile JSON, Zod, TypeScript, And Casing Parity

**Files:**
- Modify: `Body/S/S0/epi-cli/schemas/src/kernel-bridge.ts`
- Modify: `Body/S/S0/epi-cli/schemas/tests/kernel-bridge.test.ts`
- Modify: `Body/M/epi-theia/extensions/kernel-bridge/src/common/types.ts`
- Modify: `Body/M/epi-theia/extensions/m-extension-runtime/src/common/profile.ts`
- Modify: `Body/M/epi-theia/extensions/integrated-composition/src/common/integrated-readiness.ts`
- Test fixture: `Body/S/S0/portal-core/contract-inventory/baseline-profile.json`

**Step 1: Write failing schema tests**

Extend `Body/S/S0/epi-cli/schemas/tests/kernel-bridge.test.ts` to assert:

- `MathemeHarmonicProfile.parse(baselineProfile)` accepts `modalResonator`.
- `lensMode.lens` accepts `0..11`, rejects `12`.
- `lensMode.mode` accepts `0..6`, rejects `7`.
- `modalResonator.m2Address72.address72` equals `resonance72.lensAnchorIndex`.
- Wrong `liveOctet` length and wrong `nodalQuartet` length fail.
- `modal_resonator` is not the canonical serialized key.

**Step 2: Run the failing schema test**

Run:

```bash
pnpm --dir Body/S/S0/epi-cli/schemas vitest run tests/kernel-bridge.test.ts
```

Expected: FAIL because Zod has no `modalResonator` schema and currently has inverted lens/mode bounds.

**Step 3: Add Zod schemas**

Add strict schemas:

- `ModalChromaticSlot`
- `ModalOctetCarrier`
- `ModalNodalAnchor`
- `ModalDiatonicRole`
- `ModalSilentAnchor`
- `BellPartialRole`
- `ModalResonatorProfile`

Patch `MathemeHarmonicProfile` so `modalResonator` is optional in schema v1.

**Step 4: Patch TS bridge/runtime types**

Mirror the same interfaces in:

- `Body/M/epi-theia/extensions/kernel-bridge/src/common/types.ts`
- `Body/M/epi-theia/extensions/m-extension-runtime/src/common/profile.ts`

Add alias-aware field checking in `integrated-readiness.ts` for `modal_resonator` / `modalResonator`, while keeping camelCase canonical for serialized profile JSON.

**Step 5: Verify**

Run:

```bash
pnpm --dir Body/S/S0/epi-cli/schemas vitest run tests/kernel-bridge.test.ts
pnpm --dir Body/M/epi-theia --filter @pratibimba/kernel-bridge build
pnpm --dir Body/M/epi-theia --filter @pratibimba/m-extension-runtime test
```

Expected: PASS. No Theia runtime type consumer should require snake_case as the only profile spelling.

---

## Tranche 49.3 — Kernel-Bridge Capability, Envelope, And `M123ChimeFrame`

**Files:**
- Modify: `Body/S/S0/epi-cli/src/gate/kernel_bridge_runtime.rs`
- Test: `Body/S/S0/epi-cli/tests/kernel_bridge_modal_chime.rs`
- Modify: `Body/S/S0/epi-cli/schemas/src/kernel-bridge.ts`
- Modify: `Body/S/S0/epi-cli/schemas/tests/kernel-bridge.test.ts`
- Modify: `Body/M/epi-theia/extensions/kernel-bridge/src/common/types.ts`
- Modify: `Body/M/epi-theia/extensions/m-extension-runtime/src/common/bridge-api.ts`
- Modify: `Body/M/epi-theia/extensions/kernel-bridge/src/browser/kernel-bridge-api.ts`
- Modify: `Body/M/epi-theia/extensions/kernel-bridge/src/browser/m-extension-runtime-bridge.ts`
- Modify: `Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.json`

**Step 1: Write failing Rust bridge tests**

Create `kernel_bridge_modal_chime.rs` asserting:

- `capability_names()` includes `kernelBridge.m2.epogdoonProjection(address72)`.
- `typed_json_performance_event_from_profile` or the new sibling helper emits an `m123.chime` frame.
- `M123ChimeFrame.m2.modalResonator.liveOctet` exactly matches profile audio octet after JSON round-trip.
- stale/missing session/VAK envelope paths reject rather than silently dispatch.

**Step 2: Run the failing Rust bridge test**

Run:

```bash
cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test kernel_bridge_modal_chime
```

Expected: FAIL because the capability and chime event do not exist across the runtime surface yet.

**Step 3: Implement the Rust bridge shape**

Add typed serializable shapes for:

- `KernelBridgeModalResonatorJsonShape`
- `KernelBridgeM123ChimeFrameJsonShape`
- `KernelBridgeWorldClockBindingJsonShape`

Keep `pitch_authority` and `nodal_constraint_authority` pointing to:

```text
portal_core::MathemeHarmonicProfile.audio_octet
portal_core::MathemeHarmonicProfile.nodal_quartet
```

Do not derive pitch/nodal state from renderer inputs.

**Step 4: Fix capability parity**

Add `kernelBridge.m2.epogdoonProjection(address72)` to all of:

- Rust runtime allow-list.
- Zod `KernelBridgeCapabilityName`.
- Theia `KERNEL_BRIDGE_CAPABILITIES`.
- `KernelBridgeAPI`.
- Browser bridge adapter methods.
- Contract preflight required capabilities.

Also reconcile request/event envelopes before adding new chime methods:

- `sessionKey` must not be empty when Rust requires `session_key`.
- VAK context and route lineage cannot be silently `null` where Rust rejects it.
- Runtime event envelope names must agree or have an explicit adapter layer for `kind`/`emittedAtMs` vs `type`/`emittedAt`.

**Step 5: Verify**

Run:

```bash
cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test kernel_bridge_modal_chime
pnpm --dir Body/S/S0/epi-cli/schemas vitest run tests/kernel-bridge.test.ts
pnpm --dir Body/M/epi-theia --filter @pratibimba/kernel-bridge test
pnpm --dir Body/M/epi-theia --filter @pratibimba/m-extension-runtime test
node Body/M/epi-theia/extensions/scripts/validate-extension-contract-preflight.mjs
```

Expected: PASS. `EpogdoonBridgeEngine` is no longer bridge-down due to missing capability registration.

---

## Tranche 49.4 — M2 Packet, Cymatic Digest, And Modal Labels

**Files:**
- Modify: `Body/M/epi-theia/extensions/m2-parashakti/src/common/meaning-packet.ts`
- Modify: `Body/M/epi-theia/extensions/m2-parashakti/src/common/cymatic-chladni.ts`
- Modify: `Body/M/epi-theia/extensions/m2-parashakti/src/browser/components/AudioBusVisualiser.tsx`
- Modify: `Body/M/epi-theia/extensions/m2-parashakti/src/browser/components/CymaticChladniSurface.tsx`
- Test: `Body/M/epi-theia/extensions/m2-parashakti/test/cymatic-determinism.test.mjs`
- Test: `Body/M/epi-theia/extensions/test/m2-parashakti-meaning-packet.test.mjs`
- Test: `Body/M/epi-theia/extensions/m2-parashakti/test/audio-bus-visual.test.mjs`

**Step 1: Write failing M2 tests**

Add assertions that:

- `M2PrimeMeaningPacket` carries `modalResonatorDigest` or `modalResonatorRef`.
- `M2CymaticFrame` carries only a digest/ref plus exact `audioOctetHz` and `nodalQuartet`.
- `renderM2CymaticFrame` throws or blocks if asked to synthesize modal data locally.
- deterministic byte hash changes only when the authoritative 8+4 bus or declared modal digest changes.
- `AudioBusVisualiser` remains `data-audio-output="none"` and still rejects browser audio APIs.

**Step 2: Run failing M2 tests**

Run:

```bash
pnpm --dir Body/M/epi-theia --filter @pratibimba/m2-parashakti test:cymatic-determinism
pnpm --dir Body/M/epi-theia --filter @pratibimba/m2-parashakti test:audio-bus-visual
node --test Body/M/epi-theia/extensions/test/m2-parashakti-meaning-packet.test.mjs
```

Expected: FAIL only for new modal/digest assertions.

**Step 3: Implement M2 packet integration**

Add modal digest/ref fields to `M2PrimeMeaningPacket`. Keep `M2CymaticFrame` constrained to:

- exact `audioOctetHz`
- exact `nodalQuartet`
- `modalResonatorDigest` or `modalResonatorRef`
- deterministic `wavePoints`
- `exactProfileBus: true`

Do not add browser audio synthesis or oscillator code.

**Step 4: Verify**

Run:

```bash
pnpm --dir Body/M/epi-theia --filter @pratibimba/m2-parashakti test
```

Expected: PASS, including existing byte-identical Chladni/cymatic determinism and no-audio-output tests.

---

## Tranche 49.5 — M3 World-Clock And Codon Chime Binding

**Files:**
- Modify: `Body/M/epi-theia/extensions/m3-mahamaya/src/common/codon-wheel.ts`
- Modify: `Body/M/epi-theia/extensions/m3-mahamaya/src/browser/services/m3-renderer-service.ts`
- Test: `Body/M/epi-theia/extensions/m3-mahamaya/test/codon-wheel.test.ts`
- Test: `Body/M/epi-theia/extensions/test/m3-mahamaya-codon-wheel.test.mjs`
- Test: `Body/M/epi-theia/extensions/test/m3-mahamaya-profile-tick-readiness.test.mjs`

**Step 1: Write failing M3 tests**

Assert that the M3 chime surface carries:

- `codonRotationProjection`, not only `codonId`.
- `worldClockBinding.state`.
- `worldClockHandle`, `generation`, `source`, `subscriptionMode`, `tick`, `degree720`.
- explicit `tickMatchesProfile` and `degree720MatchesProfile`.
- a readiness blocker when either match flag is false.

**Step 2: Run failing M3 tests**

Run:

```bash
pnpm --dir Body/M/epi-theia --filter @pratibimba/m3-mahamaya test
```

Expected: FAIL on new chime/world-clock binding assertions.

**Step 3: Implement M3 binding**

Extend the M3 projection surface so it can consume `M123ChimeFrame.m3.worldClockBinding` when present. The existing world-clock mismatch logic remains the authority. A chime frame with stale tick or stale degree cannot be rendered as coherent.

**Step 4: Verify**

Run:

```bash
pnpm --dir Body/M/epi-theia --filter @pratibimba/m3-mahamaya test
```

Expected: PASS. Existing TCT/Nine-of-Wands and world-clock drift tests remain green.

---

## Tranche 49.6 — Integrated 1-2-3 Readiness And Wave-A Markers

**Files:**
- Modify: `Body/M/epi-theia/extensions/plugin-integrated-1-2-3/src/common/wave-a-markers.ts`
- Modify: `Body/M/epi-theia/extensions/plugin-integrated-1-2-3/src/browser/cosmic-engine-composition.tsx`
- Modify: `Body/M/epi-theia/extensions/integrated-composition/src/common/profile-field-checker.ts`
- Modify: `Body/M/epi-theia/extensions/integrated-composition/src/common/integrated-readiness.ts`
- Test: `Body/M/epi-theia/extensions/plugin-integrated-1-2-3/tests/cosmic-engine-composition.test.mjs`
- Test: `Body/M/epi-theia/extensions/integrated-composition/tests/composition-load.test.mjs`
- Test: `Body/M/epi-theia/extensions/test/integrated-state-coordinator.test.mjs`

**Step 1: Write failing integrated readiness tests**

Add tests proving:

- `modalResonator` and `m123ChimeFrame` markers exist.
- Existing markers remain: `klein_flip`, `resonance72`, six-axes-of-72, `audio_octet[8]`, `nodal_quartet[4]`.
- `pending-modal-resonator` and `pending-m123-chime-frame` appear when those fields are absent.
- Existing blockers are preserved: `pending-k2-surface`, `pending-cymatic-mount-point`, `pending-codon-rotation-export`, `pending-ananda-vortex`.
- readiness fails when M1/M2/M3 generations, tick, degree720, M2 address, or world-clock binding disagree.

**Step 2: Run failing integrated tests**

Run:

```bash
pnpm --dir Body/M/epi-theia --filter @pratibimba/plugin-integrated-1-2-3 test
node --test Body/M/epi-theia/extensions/integrated-composition/tests/composition-load.test.mjs
node --test Body/M/epi-theia/extensions/test/integrated-state-coordinator.test.mjs
```

Expected: FAIL on new marker/chime coherency assertions.

**Step 3: Implement additive composition proof**

Update the integrated composition model so `M123ChimeFrame` references current proof handles:

- `K2SurfaceHandle`
- `M2CymaticTextureContribution`
- `M3CodonRotationProjectionForLensRing`

Do not replace the existing proof objects. Add modal/chime blockers only as additional readiness blockers.

**Step 4: Verify**

Run:

```bash
pnpm --dir Body/M/epi-theia --filter @pratibimba/plugin-integrated-1-2-3 test
node --test Body/M/epi-theia/extensions/integrated-composition/tests/composition-load.test.mjs
node --test Body/M/epi-theia/extensions/test/integrated-state-coordinator.test.mjs
```

Expected: PASS. Integrated 1-2-3 only treats a chime as coherent when all contributors agree on generation/tick/degree/M2 address/world-clock binding.

---

## Tranche 49.7 — Privacy, Audio, And Drift Guards

**Files:**
- Test: `Body/S/S0/portal-core/tests/psychoid_cymatic_handle.rs`
- Test: `Body/S/S0/portal-core/tests/modal_resonator_privacy.rs`
- Test: `Body/M/epi-theia/extensions/test/m4-nara-personal-cymatic-field.test.mjs`
- Test: `Body/M/epi-theia/extensions/plugin-integrated-4-5-0/src/browser/personal-recognition-composition.test.mjs`
- Test: `Body/M/epi-theia/extensions/integrated-composition/tests/being-pattern-field.test.mjs`
- Test: `Body/M/epi-theia/extensions/m2-parashakti/test/audio-bus-visual.test.mjs`
- Test: `Body/S/S0/epi-cli/schemas/tests/kernel-bridge.test.ts`

**Step 1: Write failing privacy/drift tests**

Add tests that serialize `ModalResonatorProfile` and `M123ChimeFrame` and assert the encoded output does not contain:

- `fieldBody`
- `rawField`
- raw personal cymatic payload keys
- protected M4 body material

Also assert:

- public-current fields may include bus values already exposed by profile contract.
- protected personal field body remains handle/digest-only.
- `AudioBusVisualiser` continues to contain no browser audio APIs.
- drift guard fails if `lensMode` bounds/order or `m2Address72` derivation are changed.

**Step 2: Run failing guard tests**

Run:

```bash
cargo test --manifest-path Body/S/S0/portal-core/Cargo.toml --test modal_resonator_privacy
cargo test --manifest-path Body/S/S0/portal-core/Cargo.toml --test psychoid_cymatic_handle
pnpm --dir Body/S/S0/epi-cli/schemas vitest run tests/kernel-bridge.test.ts
pnpm --dir Body/M/epi-theia --filter @pratibimba/m2-parashakti test:audio-bus-visual
node --test Body/M/epi-theia/extensions/test/m4-nara-personal-cymatic-field.test.mjs
node --test Body/M/epi-theia/extensions/plugin-integrated-4-5-0/src/browser/personal-recognition-composition.test.mjs
node --test Body/M/epi-theia/extensions/integrated-composition/tests/being-pattern-field.test.mjs
```

Expected: FAIL only where the new modal/chime serialization guard is not yet implemented.

**Step 3: Implement privacy and drift guards**

Keep protected local bodies out of public-current modal/chime JSON. Where a personal/protected reference is needed, use handle/digest fields only.

Add parity checks for:

- `lensMode.lens` 0..11.
- `lensMode.mode` 0..6.
- `lensModeIndex == lens * 7 + mode`.
- `m2Address72.address72 == resonance72.lensAnchorIndex`.
- `kernelBridge.m2.epogdoonProjection(address72)` present across Rust/Zod/TS/preflight.

**Step 4: Verify**

Run the commands from Step 2 again.

Expected: PASS. No privacy or audio-output regression.

---

## Tranche 49.8 — Canon Updates And Release Gate

**Files:**
- Modify: `Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md`
- Modify: `Idea/Bimba/Seeds/M/M'-PORTAL-SPEC.md`
- Modify: `Idea/Bimba/Seeds/M/INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md`
- Modify: `Idea/Bimba/Seeds/M/M1'/M1'-SPEC.md`
- Modify: `Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md`
- Modify: `Idea/Bimba/Seeds/M/M3'/M3'-SPEC.md`
- Modify: `Idea/Bimba/Seeds/M/M4'/M4'-SPEC.md`
- Modify: `Idea/Bimba/Seeds/M/M5'/M5'-SPEC.md`
- Optional modify: `Idea/Bimba/Seeds/M/M5'/ql-musical-derivation-v3.md`
- Modify if release gate tracks changed: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/14-no-orphan-audit-and-release-gates.md`
- Modify if audit protocol changed: `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/43-end-of-cycle-3-audit-protocol.md`

**Step 1: Patch canon after implementation lands**

Add concise canon notes:

- `ModalResonatorProfile` is the standing modal/bell projection over the profile bus.
- `M123ChimeFrame` is the additive M1/M2/M3 chime proof event.
- 8+4 and 7+5 are compatible cuts through the same 12-slot body.
- `lensMode` and M2 address are separate.
- `m1-paramasiva-played-torus` is evidence/current-retiring only.
- M4 protected field bodies remain handle/digest-only.
- M5 review owns chime coherence evidence, not bus derivation.

**Step 2: Run no-orphan and vault checks that are available in this workspace**

At minimum:

```bash
node -e "const fs=require('fs'); JSON.parse(fs.readFileSync('Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.index.json','utf8')); console.log('plan.index.json ok')"
rg -n "ModalResonatorProfile|M123ChimeFrame|m2Address72|audio_octet|nodal_quartet" Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md Idea/Bimba/Seeds/M/M'-PORTAL-SPEC.md Idea/Bimba/Seeds/M/INTEGRATED-1-2-3-COSMIC-ENGINE-ARCHITECTURE.md
```

If `bimba-vault-validate` is available as a runnable skill/command in the implementation session, run it over touched frontmatter-bearing specs. If it remains instruction-only, perform manual frontmatter validation and state that clearly in the evidence string.

**Step 3: Run final implementation verification**

Run the full modal/chime verification set:

```bash
cargo test --manifest-path Body/S/S0/portal-core/Cargo.toml --test modal_resonator_profile
cargo test --manifest-path Body/S/S0/portal-core/Cargo.toml --test modal_resonator_privacy
cargo test --manifest-path Body/S/S0/portal-core/Cargo.toml --test psychoid_cymatic_handle
cargo test --manifest-path Body/S/S0/epi-cli/Cargo.toml --test kernel_bridge_modal_chime
pnpm --dir Body/S/S0/epi-cli/schemas vitest run tests/kernel-bridge.test.ts
pnpm --dir Body/M/epi-theia --filter @pratibimba/kernel-bridge test
pnpm --dir Body/M/epi-theia --filter @pratibimba/m-extension-runtime test
pnpm --dir Body/M/epi-theia --filter @pratibimba/m2-parashakti test
pnpm --dir Body/M/epi-theia --filter @pratibimba/m3-mahamaya test
pnpm --dir Body/M/epi-theia --filter @pratibimba/plugin-integrated-1-2-3 test
node Body/M/epi-theia/extensions/scripts/validate-extension-contract-preflight.mjs
```

Expected: PASS. Any failing command blocks marking Track 49 done.

---

## Track 49 Acceptance Gate

Track 49 is complete only when:

- `ModalResonatorProfile` is generated from a real S0 profile and transported as optional schema-v1 `modalResonator`.
- `M123ChimeFrame` is emitted for a real profile tick and references existing M1/M2/M3 proof handles.
- `audio_octet[8]` and `nodal_quartet[4]` remain the pitch/nodal authority.
- 7+5 diatonic/silent partition exists without fighting the 8+4 carrier/boundary bus.
- `lensMode` 12x7 and `m2Address72` 72-address are separated and guarded.
- `kernelBridge.m2.epogdoonProjection(address72)` is registered across all bridge surfaces that consume it.
- M2 deterministic cymatic tests remain byte-stable unless authoritative inputs change.
- Integrated 1-2-3 blocks incoherent generation/tick/degree/M2-address/world-clock state.
- Public-current modal/chime JSON carries no raw protected M4 personal field body.
- Canon specs name the new surfaces and preserve the non-replacement law.
