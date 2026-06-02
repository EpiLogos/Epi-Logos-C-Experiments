# Wave B — Kernel-bridge / Profile-contract Reconciliation Matrix

**Task ID:** `wave-b-kernel-bridge`
**Domain:** Cross-cutting — the shared data spine (`MathemeHarmonicProfile`, M2-1' audio bus, 84-state `(lens,mode)`, 72-invariant + six axes, 472-state `codonRotationProjection`, `resonance72`, `kleinFlipState`)
**Anti-greenfield posture:** All Rust profile/projection code in `Body/S/S0/portal-core` and the runtime bridge in `Body/S/S0/epi-cli/src/gate/kernel_bridge_runtime.rs` are landed substrate — every tranche below is phrased `consume as-is`, `audit/verify`, or `extend a named field/contract`. No greenfield rebuild.

## Sources consulted (narrow reads only)

- Spec authority (Wave A digest): the six matrices in `plan.runs/wave-a-m{0..5}-reconciliation-matrix.md` (consumed as authority; not re-read)
- Code substrate:
  - `Body/S/S0/portal-core/src/harmonic_profile.rs` (1–14) — public re-export façade
  - `Body/S/S0/portal-core/src/kernel.rs` (200–1265) — full `MathemeHarmonicProfile` struct + projections
  - `Body/S/S0/portal-core/src/events.rs` (1–130) — `RelationDescriptor.klein_flip`, `MPrimePerformanceEvent.klein_flip`
  - `Body/S/S0/portal-core/src/codon_rotation_projection.rs` (1–149) — `MathemeLensMode`, `CodonRotationProjection`, `CODON_ROTATION_SURFACE_COUNT=472`
  - `Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs` (1–80) — `VimarshaReading { audio_octet, nodal_quartet }`
  - `Body/S/S0/epi-cli/src/gate/kernel_bridge_runtime.rs` (580–646) — `m1_performance_event_from_profile`
  - `Body/S/S0/epi-cli/tests/kernel_bridge_runtime_contract.rs` (filename — contract test exists)
- Theia surface:
  - `Body/M/epi-theia/extensions/kernel-bridge/src/common/types.ts` (1–210)
  - `Body/M/epi-theia/extensions/kernel-bridge-readiness/src/common/readiness-types.ts` (1–65)
  - `Body/M/epi-theia/extensions/kernel-bridge/src/browser/m-extension-runtime-bridge.ts` (19–136)
  - `Body/M/epi-theia/extensions/m-extension-runtime/src/common/profile.ts` (1–30) — `MathemeHarmonicProfileBoundary`
  - `Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.json` (60–330)

## The four-way matrix — profile-field readiness ledger

For each load-bearing shared-spine field, status of doc-claim ↔ spec-authority ↔ code-substrate ↔ Theia-surface:

| Claim (UX/Wave-A digest) | Spec authority (M' Seed) | Code/substrate evidence | Theia surface | Status |
|---|---|---|---|---|
| `MathemeHarmonicProfile` is the single shared spine consumed by every M' surface | M'-PORTAL-SPEC; reaffirmed by every Mn' spec | `kernel.rs:346–387` struct definition; re-exported from `harmonic_profile.rs:8–14` | `MathemeHarmonicProfileBoundary` (opaque `payload: Record<string, unknown>`) in `m-extension-runtime/.../profile.ts:13–18`; `KernelBridgeCachedProfile.profile: unknown` at `kernel-bridge/.../types.ts:81–89` | **ALIGNED** (struct + bridge cache + opaque boundary all in place — narrowing is per-extension and intentionally deferred) |
| `audio_octet: [f32; 8]` audio bus carrier | M2'-SPEC §M2-1; alpha_quaternionic_integration | `kernel.rs:367`, populated from `vimarsha_reading.rs:13,27`; surfaced via `kernel_bridge_runtime.rs:620` as `harmonic.audioOctet` | Bridge mirror omits explicit narrowing — flows through `payload` only | **ALIGNED** (carrier landed at struct + bridge JSON; surface narrowing is per-extension work, not bridge work) |
| `nodal_quartet: [MathemeNodalConstraint; 4]` | M2'-SPEC §M2-1; alpha_quaternionic_integration | `kernel.rs:368`, populated from `vimarsha_reading.rs:14,35`; surfaced via `kernel_bridge_runtime.rs:621` as `harmonic.nodalQuartet` | Same as above — opaque payload narrowed per-extension | **ALIGNED** |
| 84-state `(lens, mode)` addressing | M1'-SPEC; M3'-SPEC | `codon_rotation_projection.rs:13` `MathemeLensMode { lens, mode }`; constructor enforces `lens<12, mode<7` at `:19`; stored at `kernel.rs:363` | `kernel_bridge_runtime.rs:632–638` emits `lensMode.{lens,mode,codonId,rotation,codonClass}` | **ALIGNED** |
| 72-invariant `resonance72` projection | M2'-SPEC §0/§8 (six addressing-axes of one 72); M1'-SPEC | `kernel.rs:366` field + `:605–628` `MathemeResonance72Projection` populated by `kernel_resonance_index` at `:1050` | Carried through `payload` and as `depositionAnchor.resonance72Index` at `kernel_bridge_runtime.rs:627` | **ALIGNED** (one-invariant landed; the six-axes-of-72 *addressing-view* is **SPEC-AHEAD** — extension-side decoder is the Wave A M2 tranche 3.3) |
| 472-state `codonRotationProjection` | M3'-SPEC; m3-prime-symbolic-transcription-research | `codon_rotation_projection.rs:9` `CODON_ROTATION_SURFACE_COUNT = 472`; `:58` struct; `:101` `codon_rotation_from_lens_mode`; populated at `kernel.rs:407,373` | Emitted via `lensMode.codonId/rotation/codonClass` at `kernel_bridge_runtime.rs:632–638` | **ALIGNED** (the *meaning* layer — Tarot/I-Ching/codon dict — is the M3 CODE-PENDING `dataset_lut_state = "pending-dataset-lut"`, NOT a bridge gap) |
| `kleinFlipState` as profile field | M1'-SPEC; Wave A M1 tranche 2.2; M2 tranche 3.1 | **NOT a field on `MathemeHarmonicProfile`**. `klein_flip: bool` lives only on `RelationDescriptor` (`events.rs:35`) and `MPrimePerformanceEvent` (`events.rs:80`); `m1_performance_event_from_profile` at `kernel_bridge_runtime.rs:588–646` does NOT emit a `klein_flip` field | Contract preflight `07-t0` `:315` explicitly lists `"kleinFlipState"` as blocker for M2 | **CODE-PENDING** — depends on Wave A M1 tranche 2.2 (`klein_flip: Option<KleinFlipEvent>` field on `MathemeHarmonicProfile` + emitter in `vimarsha_reading.rs`). Bridge-side closure (tranche 10.1) follows. |
| `pointerAnchor` shared anchor | M1'-SPEC; M' integrated-bimba | `kernel.rs:379` `pointer_anchor: MathemePointerAnchorProjection`; `:847–886` struct; `kernel_bridge_runtime.rs:623` emits `pointerAnchor` | `MathemeHarmonicProfileBoundary.pointerAnchor: string \| null` at `m-extension-runtime/.../profile.ts:15` — present, but typed as opaque string | **ALIGNED** (bridge contract carries it; boundary narrowing is per-extension) |
| `depositionAnchor` (M5 episodic deposit handle) | M5'-SPEC; Wave A M5 tranche `MathemeHarmonicProfile.depositionAnchor` listed as code-pending field | NOT a field on `MathemeHarmonicProfile`. Synthesized at the bridge JSON level only — `kernel_bridge_runtime.rs:625–631` builds `depositionAnchor` from `pointer_anchor.source_coordinate + resonance72.lens_anchor_index + mahamaya.mahamaya_address64 + s5.episodic.kernel_profile_observation.deposit` | Consumed via opaque payload | **SPEC-AHEAD** — the canonical-deposit-handle *carrier-shape* lives only as a JSON synthesis at the bridge edge; if M5/Nara want it as a typed struct on the profile, a `MathemePointerAnchorProjection`-sibling is needed. Otherwise the current bridge synthesis is sufficient and the doc should be downgraded to "synthesized at bridge". |
| `mahamaya` binary projection (separate from `binary`) | M3'-SPEC; IOD-04 dual-alias policy | `kernel.rs:372` `mahamaya: MathemeBinaryProjection` populated from same `MathemeBinaryProjection::from_clock` as `binary` at `:413,446–447`; compatibility policy declared at `:285–299` | Surfaced via payload + `depositionAnchor.mahamayaAddress64` at `kernel_bridge_runtime.rs:628` | **ALIGNED** (IOD-04 dual-alias landed; explicit migration policy declared in code) |
| `planetaryChakral` projection | M2'-SPEC §9 planet LUT (10) + non-72 keying | `kernel.rs:370` `planetary_chakral: MathemePlanetaryChakralProjection`; `:655–736` populated from `diatonic` (7-degree LUT — Earth..Pluto) | Carried through opaque `payload` | **ALIGNED at field level** — but the bridge populates only 7+Pluto-fallback (8 bodies), NOT 10. The 10-planet LUT is **CONTRADICTION** carried from Wave A M2 (DCC-03: planet-count + Earth-observer); cycle-3 decision-register entry. |
| `conjugate_form_character` (Major/Minor/ShadowInversion) | M1'-SPEC; m1-prime-paramasiva-instrument | `kernel.rs:376,1201–1207` populated from `lens_mode.mode`; `resonance`-conditional override at `:486–489` | Through payload | **ALIGNED** |
| `privacy_class` boundary discipline | M' privacy law | `kernel.rs:377,452,500–507` enum with 4 variants; `KernelBridgeCachedProfile.privacyClass` at `types.ts:86` mirrors as string; `KERNEL_BRIDGE_SAFE_PROFILE_PRIVACY = 'safe-public-current-kernel-tick'` at `types.ts:27` | Enforced in `KernelBridgeRuntimeEvent.privacyClass` at `types.ts:96`; readiness state `privacy_blocked` at `readiness-types.ts:15` | **ALIGNED** |
| `vakAddress` carrier | M' system spec | `kernel.rs:382` optional `vak_address: Option<VakAddress>`; `with_vak` constructor at `:475`; `VakAddress` re-exported from `kernel_bridge_runtime` | Typed mirror at `kernel-bridge/.../types.ts:61–73` (`VakAddress` + `KernelBridgeVakContext`) | **ALIGNED** |
| `s2_anchor` / `s3_anchor` future-anchor placeholders | Cycle-2 closure (substrate readiness ledger) | `kernel.rs:384,386` `Option<MathemeFutureAnchor>` both `None` at construction; struct at `:338–342` | Through payload | **ORPHAN at runtime** — fields exist as `Option::None` placeholders but no emitter ever populates them. Either downgrade to "documentation-only" or land a populator. Routes to **CODE-PENDING (low)** under tranche 10.5. |
| `dataset_lut_state = "pending-dataset-lut"` on `MathemeBinaryProjection` | M3'-SPEC LUT readiness | `kernel.rs:797` literal `"pending-dataset-lut"`; `:805` `"tarot/amino LUTs pending"` | Surfaced verbatim through payload | **CODE-PENDING** — Wave A M0 tranche 1.4 + M3 dataset reconciliation own this; bridge correctly transports the pending-state literal so the readiness widget can render it as `profile_missing_field` per `readiness-types.ts:11` |
| Runtime bridge emits `klein_flip` on M1 performance event | M1'-SPEC; Wave A M1 tranche 2.4 verifies this | **CODE-PENDING in bridge layer** — `events.rs:80,118` carries it on `MPrimePerformanceEvent`, but `m1_performance_event_from_profile` at `kernel_bridge_runtime.rs:588–646` builds JSON from the *profile* (which has no `klein_flip`); the field is NEVER read into the JSON | Contract test `Body/S/S0/epi-cli/tests/kernel_bridge_runtime_contract.rs` (existing) is the verification site | **CODE-PENDING** — closes after Wave A 2.2 lands `MathemeHarmonicProfile.klein_flip`; then add `"kleinFlip": profile.klein_flip` to the JSON object at `:615–622` |
| Single session-held `#` (Inversion_Operator) runtime carrier | Wave A M1 tranche 2.5 | Not present in `kernel.rs` (`hash_operator: "#"` literal at `:828` is descriptive only, not a runtime operator); no `Inversion_Operator` type in `events.rs` | Not surfaced | **CODE-PENDING** — Wave A M1 owns; bridge side waits for the carrier type to exist |
| Tuning-aware MIDI/MPE/MTS-ESP music-tech bridge | Wave A M2 tranche 3.7 | Not present in S0 substrate | Not present in `kernel-bridge` extension | **CODE-PENDING** — deferred per Wave A M2 (out of Wave B scope; flag forward) |
| Psychoid cymatic field solver | Wave A M4 tranche 5.5 | Not present; `audio_octet` + `nodal_quartet` are the input bus, solver is downstream | Not present in `kernel-bridge` extension | **CODE-PENDING** — Wave A M4 owns; bridge side ALREADY transports the input bus, so no bridge-side blocker |
| `KernelBridgeReadinessState` nine-state taxonomy | M' contract preflight 07.T0 | `readiness-types.ts:9–18` (nine states); `kernel_bridge_runtime.rs` exposes `readiness` field at runtime snapshot | Widget consumes via `KernelBridgeReadinessSource.fetch` at `readiness-types.ts:35–40`; `readiness-widget.tsx` renders | **ALIGNED** |
| Capability allow-list (7 capabilities) | M' bridge contract | `KERNEL_BRIDGE_CAPABILITIES` at `types.ts:174–182` (7 entries: readCurrentProfile, readPointerAnchor, readReadiness, subscribeObservability, invokeGatewayRpc, depositKernelObservation, requestReviewEvidence) | `m-extension-runtime-bridge.ts:43,105` consumes the allow-list | **ALIGNED** |
| `KernelBridgeStreamTable` three-table whitelist (world_clock, pratibimba_presence, shared_archetype_event) | M' S3 stream contract | `types.ts:150–170` typed; protocol constants at `:14–28` declare modes/sources | Consumed by frontend module | **ALIGNED** |

## Anomalies

### CONTRADICTION (decision-register entries needed)

- **DR-KB-1 (carry-forward from Wave A M2 DCC-03):** `MathemePlanetaryChakralProjection` LUT enumerates 8 bodies (Earth, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto fallback) via 7-degree diatonic; M2'-SPEC §9.5 requires 10-planet semantics with Earth-as-observer-ground. Bridge currently transports the 8-body shape verbatim. Cycle-3 must register the decision before any cycle-4 implementation expands the LUT.
- **DR-KB-2:** `depositionAnchor` is synthesized in the bridge JSON (`kernel_bridge_runtime.rs:625–631`) but is named as a profile *field* in Wave A M5 code-pending list. Decision: typed profile field, or formalize as bridge-synthesized DTO?

### CODE-PENDING (closure tranches below)

- **`MathemeHarmonicProfile.klein_flip`** — NOT a field on the profile struct. Lives only on `RelationDescriptor`/`MPrimePerformanceEvent`. Closure depends on Wave A M1 tranche 2.2 (struct field + emitter) BEFORE bridge JSON can carry it. (Carrier path: `events.rs` → `vimarsha_reading.rs` emit → `kernel.rs:419–464` populate → `kernel_bridge_runtime.rs:615–622` emit.)
- **`m1_performance_event_from_profile` does not emit `kleinFlip`** — even though `MPrimePerformanceEvent.klein_flip` exists. After Wave A 2.2 lands the profile field, add to JSON. Bridge-side single-line addition.
- **`dataset_lut_state = "pending-dataset-lut"`** + **`m3_codec_provenance = "tarot/amino LUTs pending"`** — bridge transports the literal correctly; the LUT itself is the M0/M3 dataset blocker.
- **`s2_anchor` / `s3_anchor`** — `Option<MathemeFutureAnchor>` fields exist but never populated. Either land an emitter or downgrade.

### ORPHAN (no-orphan-fill)

- **`MathemeHarmonicProfileBoundary.payload: Record<string, unknown>`** is intentionally opaque — every per-extension narrowing decision was deferred to the extension. This is policy-correct (per profile.ts:9–11 comment) but cycle-3 should record that ALL field-level surface narrowings are owned by their respective Mn extension (M1/M2/M3/M4/M5 surface tranches in Waves A), not by `kernel-bridge`.

### CROSS-CUTTING CONFIRMATION (Wave A claims verified against substrate)

- Wave A M1 2.2 claim `klein_flip absent from kernel.rs entirely` — **VERIFIED**. `grep` against `kernel.rs` returns zero matches for `klein_flip`.
- Wave A M2 3.1 same — **VERIFIED**.
- Wave A M0 1.4 `MathemeBedrockProjection.dataset_lut_state = 'pending-dataset-lut'` — **VERIFIED** at `kernel.rs:797` (note: literal lives on `MathemeBinaryProjection`, not `MathemeBedrockProjection` — Wave A digest may have mis-attributed the host struct; flag forward).
- Wave A M0 1.4 `MathemeBedrockProjection.m3_codec_provenance` — same: actually on `MathemeBinaryProjection` at `kernel.rs:805`. Cross-reference correction for cycle-3 decision register.

## Proposed Cycle-3 Closing Tranches (kernel-bridge domain, 10.x)

All tranches honor the anti-greenfield rule: they consume/audit/extend named existing carriers in landed Rust + landed Theia extensions. None propose a rebuild.

### 10.1 — Profile-field readiness ledger (this matrix as canonical deliverable)
- **Classification:** code-pending-closure
- **Deliverable:** this matrix file becomes the cycle-3 source-of-truth profile-field ledger; cross-referenced from `00-overview` and from every Mn tranche that depends on a profile field
- **Verification:** `test -f Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/plan.runs/wave-b-kernel-bridge-matrix.md`

### 10.2 — Land `MathemeHarmonicProfile.klein_flip` profile field + emitter (extends Wave A M1 2.2 to bridge)
- **Classification:** code-pending-closure (depends on Wave A M1 2.2 closing first)
- **Deliverable:** add `klein_flip: Option<KleinFlipEvent>` (or `bool` if degenerate) to `MathemeHarmonicProfile` at `kernel.rs:346–387`, populate in `from_tick` from `vimarsha_reading.rs`, then emit on the bridge JSON in `kernel_bridge_runtime.rs:615–622`. Update `KernelBridgeReadinessState::profile_missing_field` blocker list to drop `kleinFlipState`.
- **Verification:** `cargo check -p portal-core -p epi-cli` and `cargo test -p epi-cli --test kernel_bridge_runtime_contract`

### 10.3 — Decision-register entry DR-KB-1: planetary projection LUT cardinality
- **Classification:** contradiction-decision
- **Deliverable:** explicit cycle-3 decision-register row: 7-degree diatonic + Pluto fallback (current) vs 10-planet + Earth-observer (M2'-SPEC §9.5). Carries forward Wave A M2 DCC-03. Records the chosen shape so cycle-4 can extend `MathemePlanetaryChakralProjection::from_diatonic` at `kernel.rs:664–736`.
- **Verification:** decision-register file grep finds DR-KB-1 entry with user final-validation slot

### 10.4 — Decision-register entry DR-KB-2: `depositionAnchor` typed-field vs bridge-DTO
- **Classification:** contradiction-decision
- **Deliverable:** registers the choice — typed `MathemeDepositionAnchor` field on `MathemeHarmonicProfile` (parallels Wave A M5 code-pending list), or formalize the current bridge-synthesized JSON at `kernel_bridge_runtime.rs:625–631` as a contract DTO via the typed bridge mirror in `types.ts`. Either resolves the Wave A M5 ledger row.
- **Verification:** decision-register file grep finds DR-KB-2

### 10.5 — Audit `MathemeFutureAnchor` placeholder fields (`s2_anchor`, `s3_anchor`)
- **Classification:** code-pending-closure (low priority)
- **Deliverable:** audit memo — either land emitters that populate these in `MathemeHarmonicProfile::from_tick` (using the cycle-2 S2/S3 anchor registries), or downgrade the fields to `#[deprecated]` and remove from `kernel.rs:384,386`. No greenfield, just a one-way decision.
- **Verification:** `cargo check -p portal-core` and `grep -n 's2_anchor\|s3_anchor' Body/S/S0/portal-core/src/kernel.rs` shows either populated or removed

### 10.6 — Bridge contract test confirms the six-axes-of-72 carrier (consume + audit)
- **Classification:** spec-ahead-integration (audit existing test)
- **Deliverable:** verify `Body/S/S0/epi-cli/tests/kernel_bridge_runtime_contract.rs` exercises the M2 `resonance72` carrier shape (`legacy_resonance_index`, `lens_anchor_index`, `base_lens`, `helix_bit`, `lens_anchor`, `position`) — the six-axes-of-72 *decoder* lives in M2 extension (Wave A M2 3.3), but the bridge MUST be proved to transport the source projection intact. Extend test if a transport check is missing.
- **Verification:** `cargo test -p epi-cli --test kernel_bridge_runtime_contract` includes a resonance72-carrier round-trip case

### 10.7 — Audit four-scale Cl(4,2) one-algebra identity across kernel.rs (consume + audit; cross-cutting handoff with Wave A M3 4.7)
- **Classification:** spec-ahead-integration (audit)
- **Deliverable:** grep + read audit confirming the four scales (M1 ring · M3 codon · M4 personal · Kerykeion natal) consume ONE Cl(4,2) primitive — not four parallel implementations. Touch points: `q_cosmic` at `kernel.rs:374`, `codon_charge_quaternion` at `:410`, `BioQuaternionState` referenced at `events.rs:4`, `slash_flip_bimba_prime` at `kernel.rs:1038`. Report whether the algebra is shared or duplicated. No rebuild — outcome is a decision memo for Wave A M3 4.7 to consume.
- **Verification:** `grep -rn 'Cl(4,2)\|cl42\|clifford' Body/S/S0/portal-core/src/ --include='*.rs'` plus the audit memo

### 10.8 — Update contract preflight blocker list after 10.2 lands
- **Classification:** doc-ahead-landing (mechanical follow-on)
- **Deliverable:** after 10.2 ships `klein_flip` to bridge, edit `Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.json:315` to drop `"kleinFlipState fields"` from M2 blocker list. Add `kleinFlip` to the `MathemeHarmonicProfileBoundary` payload-narrowing examples.
- **Verification:** `grep -n 'kleinFlipState' Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.json` returns no hits (or only in changelog)

### 10.9 — Cross-reference correction: bridge struct-host of `dataset_lut_state` / `m3_codec_provenance`
- **Classification:** doc-ahead-landing (decision-register correction)
- **Deliverable:** Wave A M0 1.4 attributes `dataset_lut_state` to `MathemeBedrockProjection`, but the literal actually lives on `MathemeBinaryProjection` at `kernel.rs:797,805`. Cycle-3 decision-register notes the correction so M0/M3 closure tranches name the right struct.
- **Verification:** decision-register entry references `kernel.rs:797`

---

**Domain summary:** The shared spine is more solid than the Wave A digests suggest — the `MathemeHarmonicProfile` struct, the M1 performance bridge, the typed Theia mirror, the readiness taxonomy, the capability allow-list, and the 84/72/472 carriers are all landed substrate. The genuine kernel-bridge CODE-PENDING blocker count is **2** (klein_flip profile field + bridge JSON emit; future-anchor populators), plus **2** decision-register entries (DR-KB-1 planet-count, DR-KB-2 depositionAnchor shape). Most "pending" claims in Wave A digests are downstream dataset/extension work that the bridge correctly transports as opaque payload — those close inside the Mn extensions, not at the bridge.
