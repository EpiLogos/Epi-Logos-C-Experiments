# Track 23 — M2' Paraśakti Frontend Deep Design

This tranche closes the per-extension widget UX for the M2' Paraśakti surface — the harmonic-correspondential instrument made visible. Cycle 2 landed substrate; waves A and B routed the kernel-bridge and shell; tranches 11 and 15 set the foundation principles and the composition contract; tranche 03 routed the M2 substrate-side closures (klein_flip, F_routing, axis decoder, S2 adapter); tranche 19 ratified the M0/M2 parity LUT bridges. What remained silent was **how M2' shows up to the user**: the three-layer deep-widget design, the six-axis correspondence-tree filter, the vibrational-vs-psychoid view-switcher, the 72-fold breadcrumb, and — most load-bearing — the composition mount-point that lets M2' cymatic frequencies render ON the M1 K² torus surface per 15.4, not as a side-by-side pane.

Two roles, one tranche owns both:

1. **Standalone M2' deep widget in `ide-deep`** — the full three-layer inspector (Layer A 12×7 MEF matrix, Layer B six sacred-sonic cards, Layer C Chladni standing-wave plate surface). This is the pedagogical / developer surface (M2-ARCHITECTURE §9.7) where the instrument is taken apart and shown.
2. **M2' cymatic surface composed inside the cosmic-1-2-3 plugin** — the cymatic field rendered AS the K² played-torus surface texture (per 15.4 composition-pattern; per M2-ARCHITECTURE §7.6 "the cymatic IS the surface texture of the played torus"). The Bevy/wgpu renderer engine (DR-M1-2 `m1-paramasiva-played-torus`) owns the surface; M2' contributes the data via the typed `compositionMountPoint`. M2 owns the data, M1' owns the surface, M3 codon-rotation overlays the cells.

This tranche owns both, plus the shared substrates that bind them (per-card inline provenance per 15.6; bimba/pratibimba state-persistence per 15.7; tick-quantised choreography per 15.8/15.9; visual-regression bind per 15.12).

## Source Specs and Matrix

- **Canonical total-shape:** `Idea/Bimba/Seeds/M/M2'/M2-ARCHITECTURE.md` (§2 substrate map; §4 profile-bus contract + `parashakti_meaning` projection; §5 three-layer visual rendering contract; §6 tick choreography; §7 boundary contracts; §8 IDE integration; §10 test criteria)
- **Domain spec:** `Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md` (six 72-axes ratification; 9:8 epogdoon at `m2_epogdoon_compress`; Klein-flip semantics)
- **UX intent:** `Idea/Pratibimba/System/Subsystems/Parashakti/parashakti-ux-full-m2-branch.md` (§3 six addressing-axes; §6 Klein L↔L' meaning-flip; §8 Parashakti-serves-Nara)
- **Wave-C matrix:** `plan.runs/wave-c-m2-parashakti-frontend-matrix.md` (full row-level reconciliation; 22 rows; DR-WC-M2-1/2 + 15 CP-WC-M2 entries)
- **Substrate sibling:** `03-m2-parashakti-reconciliation.md` (cycle-3 substrate closures; tranche 3.1-3.9-M2)
- **Cross-link tranches:** `11-theia-shell-surface-hosting.md` (11.6 cross-layout state-identity acceptance; 11.10 canvas/Highlight stack), `15-ui-design-foundations.md` (15.4 composition pattern; 15.6 profile-tick + readiness inline; 15.7 state-persistence; 15.8/9 tick choreography; 15.12 visual-regression harness), `19-contemplation-surface-integration.md` (19.10 M0/M2 parity LUT bridges)

## Cycle 2 Substrate Inheritance

Consume as-is:

- **Extension scaffold** `Body/M/epi-theia/extensions/m2-parashakti/` (T0 landed). `package.json`, `lib/`, `src/common/{index.ts,meaning-packet.ts}`, `src/browser/{frontend-module.ts,m2-parashakti-widget.tsx}`, `style/`, `tsconfig.json`, `README.md`.
- **Three primary view IDs** declared at `src/common/index.ts:11` — `m2.parashakti.meaningPacket`, `m2.parashakti.cymaticEngine`, `m2.parashakti.correspondenceTree`. The view IDs are stable; only the second + third need widget-class registration (23.1).
- **Compact exports** for Track 08 composition (`index.ts:19-36`) — `M2MeaningPacketCard`, `M2CymaticMiniView`. These bind into `plugin-integrated-1-2-3` per the composition contract.
- **`M2PrimeMeaningPacket`** shape + `buildM2PrimeMeaningPacket` builder (`meaning-packet.ts:69-185`); contract version `'2026-06-01.07-T5'`. Surface consumes via `safePacket(profile)` (`m2-parashakti-widget.tsx:117-129`).
- **Deterministic Chladni reference** `renderM2CymaticFrame` + `buildStandingWavePoints` (`meaning-packet.ts:187-271`). 72-sample CPU reference; substrate of every Layer C variant (plate / torus / spheres).
- **Personal-Pratibimba scope-block** enforced at `meaning-packet.ts:213-217` — `personalScopeBlocked: scope === 'personal-pratibimba'`. The M2' extension itself never renders this register.
- **`ReadinessBanner`** + `SharedBridgeAdapter` consumer wiring from `@pratibimba/m-extension-runtime` already mounted at `m2-parashakti-widget.tsx:30-31, 47-65`.
- **Forbidden direct imports** (`index.ts:95`) — `Body/S/S0`, `Body/S/S2`, `Body/S/S3`, `@clockworklabs/spacetimedb-sdk`, `neo4j-driver`. All m2.h LUT reads cross through the kernel-bridge.
- **Cross-extension route contract** `m2.det-evidence-to-m3.codon-projection` (`index.ts:65-69`) routes DET evidence to M3'.
- **Observability events** declared (`index.ts:17`) — `m2.meaning_packet`, `m2.routing_trace`, `m2.klein_flip`. OmniPanel consumes these as dispatch-trace entries (per WC-M2.20).

Tranche 03 substrate closures inherited:

- **3.1-M2** (klein_flip): adds `klein_flip_state` to `MathemeHarmonicProfile`; M1' produces; M2 widget consumes. Unblocks Layer A cool/warm halo swap + Layer C self-fold animation + Layer B card valence inversion.
- **3.2-M2** (F_routing carrier): `Body/S/S0/portal-core/src/parashakti/f_routing.rs` chains all six LUTs against Kerykeion. Surfaces as `parashakti_meaning.routing_trace` on the bus. Unblocks Layer B routing cards (Shem-pair, maqam, mantra, asma) + the 72-fold breadcrumb (23.7).
- **3.3-M2** (six-axes decoder): `kernelBridge.m2.decodeAxisAt(address72, axis)` decodes per-LUT (no more `lensAnchorIndex` fanout). Unblocks Layer A glyph payload + correspondence-tree axis filter.
- **3.4-M2** (S2 adapter): `kernelBridge.s2.parashaktiCorrespondences(address72)` returns `{decanFace, sacredSonic, planetaryChakral, earthObserverHandle}`. Unblocks Layer B per-card provenance + shadow-decan graph extension.
- **3.5-M2** (DCC-03 ratified): Earth is the 10th planet as observer-centre; planet-LUT[10] canonical. Strips `planetCountDecision: 'pending-DCC-03'` from `meaning-packet.ts:145`.
- **3.6-M2** (six-axes canon): `M2AddressView['name']` enum splits `'shem-asma'` into `'shem'` + `'asma'`. Sonic overlays (mantra 100, Asma 99+1) live as TABS in the correspondence tree, not axis filters.

Tranche 19.10 substrate bridges inherited:

- **19.10a** `M0_M2_ZODIACAL_BRIDGE[12]` in m0.c — `{vak_symbol, m0_resonance_idx, m0_successor, element, mode, m2_sign_idx, decan_planets[3], first_decan_idx_72}`. Wires the breadcrumb (23.7) traversal from sign to first-decan-72.
- **19.10b** `PSYCHOID_PLANETARY_CORRESPONDENCE[7]` in m0.c — Jung-Pauli archetypal-meaning view of the same seven planets. Wires the vibrational↔psychoid view-switcher (23.6). Outer planets render `pending-psychoid-outer-planet`.
- **19.10c** `ALCHEMICAL_TO_TATTVIC[6]` in m0.c — Aether/Earth/Water/Air/Fire/Salt → Akasha/Vayu/Agni/Apas/Prithvi. Wires the prima/ultima Möbius element-throughline on the decan-face card (23.3).

## Surface Contracts

### `m2.parashakti.meaningPacket` (Layer A + Layer B inspector)

- **Container:** `M2ParashaktiWidget` (already mounted). Renames internally to the three-layer composition; keeps the registration ID.
- **Layer A — 12×7 MEF matrix grid (`MefGrid72Component`):** 12 lens-rows × 7 mode-columns scaffold; 12×6=72 active cells overlaid; lens-anchor row glow from `lens_mode.lens`; mode column trace from `lens_mode.mode`; helix-bit halo (warm `lens 0-5` / cool `lens 6-11`); tritone-mirror pair arc-connectors (faint SVG arcs Lens N ↔ Lens N+3, all six pairs); active-cell halo intensity from `audio_octet[0]` magnitude; Klein-flip swaps cool/warm and animates the active pair-arc bright (200ms fade).
- **Layer B — six sacred-sonic cards (`SacredSonicPanel`):** right-rail vertical stack — `DecanFaceCard` (element/sign/decan/face + Kerykeion degree + ruling-planet glyph) ‖ `ShemPairCard` (light Shem + shadow Shem, choir + position + Hebrew + meaning) ‖ `MaqamModeCard` (family + mode-in-family + 24-quarter-tone interval bar + planet-ruler) ‖ `MantraCard` (Sanskrit phoneme + frequency band 144→432 Hz + Matrika/Malini phase) ‖ `AsmaCard` (name + Jalal/Kamal/Jamal/Hidden group + 36-internal/64-projective routing badge) ‖ `PlanetaryChakralCard` (Cousto Hz + DR + chakra glyph + element + Keplerian velocity + day-of-week + vibrational↔psychoid switch via 23.6). Each card carries an inline `ProvenanceBadge` (variant per readiness taxonomy).
- **Provenance discipline:** every card sources via the kernel-bridge axis-decoder (Tranche 3.3-M2) + S2 correspondence (Tranche 3.4-M2); no LUT data ever reaches via direct import; pending badges render per the 9-id readiness taxonomy from `07-t0-extension-contract-preflight.json:59-109`.

### `m2.parashakti.cymaticEngine` (Layer C standing-wave)

- **Container:** `M2CymaticEngineWidget` (new widget class; 23.1 registers).
- **Surface variant default:** `plate` (square plate, free boundary, Bessel modes) — the classical Chladni figure. Variant switcher (per 23.16 transport) toggles between `plate` (deep-widget default) and `torus` (composition variant — rendered inside cosmic-1-2-3 plugin) and `spheres` (deferred to 23.9, daily-0-1 cosmic-side anchor).
- **Chladni evaluator:** `CymaticChladniSurface` consumes `audio_octet[8]` + `nodal_quartet[4]` + `address72` and evaluates `χ(x, y) = Σ_{i=0..7} a_i sin(m_i π x / L) sin(n_i π y / L) + b_i cos(m_i π x / L) cos(n_i π y / L)`. CPU reference is `buildStandingWavePoints`; SVG/Canvas renderer evaluates the full χ field for plate variant.
- **Colour-binary palette:** Akasha=violet · Vayu=cyan · Agni=vermilion · Apas=aquamarine · Prithvi=umber, keyed off `M2_PLANET_LUT[ruling_planet].elem_sig → ELEM_SIG_GET_ELEMENT(sig)`. Antinodal regions render in element colour; nodal regions render bright white; Klein-flip inverts the colour-binary.
- **Klein-flip self-fold:** one-shot 200ms transition when `klein_flip.flip_at_this_tick == true`; standing-wave pattern visibly redistributes as `surface_valence` toggles boundary parameter reading.
- **Transport:** `CymaticTransport` toolbar (23.16) — pause + scrub-to-tick + tick-snapshot scrub bar. Replay is deterministic (`buildStandingWavePoints` is a pure function of `(audio_octet, nodal_quartet, address72)`).
- **Personal-Pratibimba scope-block enforced** — widget calls `renderM2CymaticFrame({ scope: 'cosmic-public' })` only; `'personal-pratibimba'` scope-block remains M4'-only authority.
- **No sound output:** the M2' extension itself does NOT instantiate Web Audio. The audio bus is visual representation only (per M2-ARCHITECTURE §8.6 + 23.13 `AudioBusVisualiser`).

### `m2.parashakti.correspondenceTree` (six-axis browser + sonic-overlay tabs)

- **Container:** `M2CorrespondenceTreeWidget` (new widget class; 23.1 registers).
- **Structure:** ONE tree (per DR-WC-M2-1 / TS-16 resolution); six axis-filter chips at top — MEF·QL ‖ tattva-phase ‖ decan-face ‖ Shem ‖ maqam ‖ DET-projection. Activating a chip filters the 72 leaf nodes through the corresponding axis decoder (Tranche 3.3-M2). Multi-chip activation shows intersection.
- **Sonic-overlay tabs:** two TABS sit beside the axis-filter chips — `Mantra (100)` and `Asma (99+1)`. Selecting a tab swaps the tree from the 72-leaf invariant to the 100-cardinality mantra overlay (50 Matrika + 50 Malini, 144→432 Hz gradient) or the 99+1-cardinality Asma overlay (Jalal/Kamal/Jamal partition with `m2_is_internal` / `m2_is_projective` masks). Honours overlay-not-axis canon per DR-M2-2.
- **Planetary-keying side panel:** `M2_PLANET_LUT[10]` rendered alongside as keying (not an axis), with `decan_link → planet_ruler` arrows visible when a decan or Shem leaf is selected.
- **Outer-planet pending stubs** (per 23.10): Uranus/Neptune/Pluto rows render Cousto Hz / DR / chakra from `.rodata` directly + `s2.outerPlanetGraphNode: 'pending-dataset-2-5-8-9-10'` badge.
- **Shadow-decan extension** (per 23.11): when a decan leaf is selected, a `ShadowDecanSurface` reveals the 108-cardinality extension (36 primary + 36 light + 36 shadow) reading both `M2_DECAN_DESC[72]` for primary/light + S2-graph `#2-3` for shadow proper; flags `pending-shadow-decan-graph` if S2 absent.

### Composition mount-point (M2' → cosmic-1-2-3 plugin)

- **Contribution shape (typed):** `M2CymaticTextureContribution` at `m2-parashakti/src/common/composition.ts` — `{ chladniField: number[], colourBinary: ColourBinaryPalette, heatmap72: number[], surfaceVariant: 'torus' | 'plate' | 'spheres' }`.
- **Mount-point API:** `compositionMountPoint(): M2CymaticTextureContribution` exported from `m2-parashakti` and consumed by `plugin-integrated-1-2-3`. M2 contributes the DATA; the played-torus Bevy/wgpu engine (DR-M1-2; `m1-paramasiva-played-torus`) renders the SURFACE TEXTURE. M2 never imports Bevy.
- **Composition pattern** (per 15.4): M2 cymatic Layer C becomes the K² torus displacement + colour texture; 72-cell heatmap (Layer A) overlays as cell brightness on the lens-ring; M3 codon-rotation projects onto the lens-ring cells. One surface, three poles, one composition driven by profile-tick.
- **Personal composition (4-5-0):** `plugin-integrated-4-5-0` reads M2's `protected-m4` scoped variant for the personal-Pratibimba field at #4.4.4.4 — but that consumption lives in M4', NOT in this tranche. M2 only contributes the scope-aware mount-point.

## Tranches

1. **23.1 — Per-view widget class registration (cymaticEngine + correspondenceTree)** *(spec-ahead-integration)*

   The three primary view IDs are declared (`ALL_VIEW_IDS` at `src/common/index.ts:11`); only `m2.parashakti.meaningPacket` has a widget class. Author `M2CymaticEngineWidget` (ID `m2.parashakti.cymaticEngine`) and `M2CorrespondenceTreeWidget` (ID `m2.parashakti.correspondenceTree`) at `m2-parashakti/src/browser/` as sibling `ReactWidget` subclasses to `M2ParashaktiWidget`. Each subscribes the same `SharedBridgeAdapter` channels (`onReadiness`, `onProfile`, `onCoordinateContext`) and consumes the unified `M2PrimeMeaningPacket`. Register all three with `WidgetFactory` in `frontend-module.ts`. No new boundary; only widget-class lifting against landed primitives.

   Verification: `grep -n "M2CymaticEngineWidget\|M2CorrespondenceTreeWidget" Body/M/epi-theia/extensions/m2-parashakti/src/browser/` returns ≥2 hits; `pnpm --filter @pratibimba/m2-parashakti test:widget-registry` asserts all three view IDs resolve to mounted widgets; widget-id ↔ extension-contract validator (extension of `validate-extension-contract-preflight.test.mjs` per Wave-B 11.9 ledger) confirms all three IDs have owners.

2. **23.2 — Layer A: 72-cell MEF matrix grid scaffold (12×7 with 12×6 active overlay)** *(spec-ahead-integration; consumes Tranche 3.3-M2)*

   Author `Body/M/epi-theia/extensions/m2-parashakti/src/browser/components/MefGrid72Component.tsx`. SVG-based 12-row × 7-column grid (12 lens-anchors × 7 modes = the 84-state landscape M2-1' reads); overlays the 12×6=72-cell active MEF address. Per-cell payload from `kernelBridge.m2.decodeAxisAt(address72, 'mef')` returns `{lens, position, l_family_link, is_inverted, meaning_id}`. Cell glyph payload resolves via `kernelBridge.s2.meaningIdResolve(meaning_id)`. Active cell `(lens_mode.lens, position6)` carries bright halo from `audio_octet[0]` magnitude; lens-anchor row glows; mode column traces vertically. Helix-bit halo temperature — rows 0-5 warm amber / rows 6-11 cool indigo. Tritone-mirror pair arcs render as faint SVG arcs between Lens N and Lens N+3 cells (all six pairs); on Klein-flip (`klein_flip.flip_at_this_tick`), the active pair arc lights bright + cool/warm halos swap across all 72 cells (200ms fade). All animation rides `MathemeHarmonicProfile` tick advance per Tranche 15.6; no local clock.

   Verification: `test -f Body/M/epi-theia/extensions/m2-parashakti/src/browser/components/MefGrid72Component.tsx`; `pnpm --filter @pratibimba/m2-parashakti test:mef-grid` asserts (a) 12×7 grid scaffold renders; (b) 72 active cells have decoded glyphs from kernel-bridge mock; (c) lens-anchor row glow binds to `lens_mode.lens`; (d) helix halo swaps at tick boundary `tick % 12 == 6`; (e) tritone-mirror arc animation fires at simulated Klein-flip event.

3. **23.3 — Layer B: six sacred-sonic cards + alchemical-tattvic surface** *(spec-ahead-integration; consumes Tranches 3.3-M2, 3.4-M2, 19.10c)*

   Author six card components at `m2-parashakti/src/browser/components/cards/`:
   - `DecanFaceCard.tsx` — `M2_DECAN_DESC[address72]` via `kernelBridge.m2.decodeAxisAt(address72, 'decan-face')` → element/sign/decan/face/ruling_planet/meaning_id. Kerykeion degree readout from `parashakti_meaning.routing_trace.active_decan` (Tranche 3.2-M2). Ruling-planet glyph. Tattvic-glyph row beneath element using `kernelBridge.m0.alchemicalToTattvic()` (per 19.10c) with prima/ultima Möbius markers on Aether (index 0) and Salt (index 5) cells.
   - `ShemPairCard.tsx` — two Shem names per decan via `parashakti_meaning.routing_trace.shem_pair = (light_idx, shadow_idx)` (Tranche 3.2-M2). Each name: choir-glyph + position-in-choir + element + Hebrew text + meaning resolved via `kernelBridge.s2.meaningIdResolve`. Klein-flip swaps light/shadow primacy.
   - `MaqamModeCard.tsx` — `M2_MAQAM_DESC[address72]` via `kernelBridge.m2.decodeAxisAt(address72, 'maqam')` → family (0-9) + mode-in-family + 7-interval pattern visualised as 24 quarter-tone ticks on a 24-position octave bar + planet-ruler glyph. Klein-flip plays the tritone-mirror (Bayati↔Hijaz, Rast↔Saba — major/minor enharmonic flip).
   - `MantraCard.tsx` — `M2_MANTRA_LUT[parashakti_meaning.routing_trace.mantra_index]` via `kernelBridge.m2.mantraEntry(idx)` → Sanskrit phoneme glyph + frequency band readout (within 144→432 Hz range, with `M2_MANTRA_FREQ_BASE=256` as visual anchor) + Matrika (descent, indices 0-49) / Malini (ascent, indices 50-99) phase indicator + element badge. Klein-flip swaps Matrika/Malini phase indicator.
   - `AsmaCard.tsx` — `M2_ASMA_LUT[parashakti_meaning.routing_trace.asma_name]` via `kernelBridge.m2.asmaName(idx)` → name + group (Jalal/Kamal/Jamal/Hidden via `ASMA_HIDDEN_INDEX=99`) + DR + mirror_idx + 36-internal / 64-projective routing badge from `m2_is_internal(idx)` / `m2_is_projective(idx)` masks.
   - `PlanetaryChakralCard.tsx` — `M2_PLANET_LUT[parashakti_meaning.routing_trace.planetary_hour_ruler]` via `kernelBridge.m2.planetLUT(idx)` → Cousto Hz + DR + chakra glyph + element badge + Keplerian velocity + day-of-week. Hosts the Vibrational↔Psychoid switch (23.6).

   Each card renders `ProvenanceBadge` inline (variant per 23.14). All cards consume the `M2PrimeMeaningPacket` from `safePacket(profile)`; no direct profile or LUT access.

   Verification: `pnpm --filter @pratibimba/m2-parashakti test:sacred-sonic-cards` asserts each of the six cards renders with fixture meaning-packet input + each carries an inline provenance badge + Klein-flip transitions fire on `flip_at_this_tick`. `grep -rn "import.*Body/S/S0" Body/M/epi-theia/extensions/m2-parashakti/src/browser/components/cards/` returns empty (forbidden-import audit).

4. **23.4 — Layer C: CymaticChladniSurface (plate variant)** *(spec-ahead-integration; consumes M2-ARCHITECTURE §5.3)*

   Author `m2-parashakti/src/browser/components/CymaticChladniSurface.tsx`. Default `surfaceVariant = 'plate'` (square plate, free boundary, Bessel modes). Canvas-based χ-field renderer (SVG fallback for accessibility) evaluating `χ(x, y) = Σ_{i=0..7} a_i sin(m_i π x / L) sin(n_i π y / L) + b_i cos(m_i π x / L) cos(n_i π y / L)`. Inputs: `audio_octet[8]` for `a_i, b_i` (amplitude/phase from `Hz / max_hz`); `nodal_quartet[4]` for `m_i, n_i` (using `nodal_quartet[i % 4].{m, n}`); `address72` for phase offset `(address72 + i + 1) π / 36`. CPU reference for accessibility / pending-bus fallback is `buildStandingWavePoints` (72-sample wave already at `meaning-packet.ts:251-271`).

   Colour-binary palette (`m2-parashakti/src/browser/components/colourBinary.ts`):
   - Antinodal regions render in element colour from `M2_PLANET_LUT[ruling_planet].elem_sig → ELEM_SIG_GET_ELEMENT(sig)`: Akasha=violet · Vayu=cyan · Agni=vermilion · Apas=aquamarine · Prithvi=umber.
   - Nodal regions (χ ≈ 0) render bright white (the still-point).
   - On Klein-flip, antinodal↔nodal colour-binary inverts.

   72-cell projection overlay: faint 72-cell grid traced over the χ surface; active cell `(lens_mode.lens, position6)` highlighted bright. Klein-flip self-fold: 200ms one-shot when `klein_flip.flip_at_this_tick == true` — standing-wave pattern visibly folds through itself as `surface_valence` toggles boundary parameter reading.

   Tick choreography (15.9 alignment): cymatic surface rides the profile-tick clock; no local rAF clock. Tick-quantised re-evaluation snaps the χ field to each tick advance with interpolation between ticks (deterministic for any given `(tick, audio_octet, nodal_quartet, address72)` snapshot).

   Personal-Pratibimba register: widget calls `renderM2CymaticFrame({ scope: 'cosmic-public' })` only. Personal scope remains M4'-only authority.

   Verification: `pnpm --filter @pratibimba/m2-parashakti test:cymatic-plate` asserts (a) χ field renders for fixture `(audio_octet, nodal_quartet, address72)`; (b) colour-binary maps element correctly; (c) Klein-flip self-fold fires at simulated `flip_at_this_tick`; (d) determinism — identical inputs → identical render snapshot. `! grep -rn "new AudioContext\|<audio\|new Audio(\|new Oscillator\|OscillatorNode" Body/M/epi-theia/extensions/m2-parashakti/src/` (audio-safety per 23.13).

5. **23.5 — CorrespondenceTreeWidget: six-axis filter + two sonic-overlay tabs** *(spec-ahead-integration; resolves DR-WC-M2-1; consumes Tranches 3.3-M2, 3.6-M2)*

   Author `M2CorrespondenceTreeWidget` mounting at view ID `m2.parashakti.correspondenceTree`. ONE tree (TS-16 resolution: not split into six trees). Six axis-filter chips at the chrome — `MEF·QL`, `tattva-phase`, `decan-face`, `Shem`, `maqam`, `DET-projection`. Multi-chip selection shows axis intersection (e.g. tattva-phase + Shem highlights the 72 cells where both decoders agree). Two sonic-overlay TABS sit beside the chips — `Mantra (100)` (50 Matrika descent + 50 Malini ascent, frequency-gradient sorted 144→432 Hz) and `Asma (99+1)` (99 names + 1 hidden, with `m2_is_internal` / `m2_is_projective` mask routing badges). Selecting a TAB swaps the tree from the 72-leaf invariant to the 100- or 99+1-leaf overlay; the axis-filter chips grey out (overlays are not axes per DR-M2-2).

   Planetary-keying side panel hosts `M2_PLANET_LUT[10]` rendered alongside. When a decan or Shem leaf is selected, `decan_link → planet_ruler` arrows light. Outer planets (rows 7-9 Uranus/Neptune/Pluto) render with the pending-dataset badge per 23.10.

   Tree-leaf payload sources via the six axis decoders `kernelBridge.m2.decodeAxisAt(address72, axis)` (Tranche 3.3-M2). S2 enrichment via `kernelBridge.s2.parashaktiCorrespondences(address72)` (Tranche 3.4-M2).

   Verification: `pnpm --filter @pratibimba/m2-parashakti test:correspondence-tree-six-axis` asserts (a) six axis-filter chips render; (b) each chip filters tree to its decoder's view; (c) multi-chip selection intersects; (d) mantra tab swaps to 100-leaf overlay; (e) asma tab swaps to 99+1-leaf overlay; (f) planetary side panel renders 10 LUT rows with outer-planet pending badge; (g) `M2AddressView['name']` enum split (`'shem'` + `'asma'` separate; no residual `'shem-asma'`) is honoured.

6. **23.6 — Vibrational↔Psychoid view-switcher on planetary card** *(spec-ahead-integration; resolves DR-WC-M2-2; consumes 19.10b)*

   On `PlanetaryChakralCard` (from 23.3), author `PlanetaryViewModeSwitch.tsx` toggling between two modes:
   - **Vibrational** (default): reads `M2_PLANET_LUT[planet_id]` via `kernelBridge.m2.planetLUT(idx)` → Cousto Hz + chakra + element + DR + Keplerian velocity + day-of-week. The vibrational view per M2-ARCHITECTURE §2.4.
   - **Psychoid**: reads `PSYCHOID_PLANETARY_CORRESPONDENCE[7]` via `kernelBridge.m0.psychoidPlanetary(planet_id)` → Jung-Pauli archetypal-meaning view (L0'-0 Unity-Monad → Sun, L0'-1 Polarity-Dyad → Moon, … L0' parent 7th-Boundary → Saturn) per 19.10b. Different views, both true — neither collapses the other.

   For the seven inner planets (Sun..Saturn), both modes resolve fully. For the three outer planets (Uranus/Neptune/Pluto), vibrational mode resolves from `M2_PLANET_LUT` rows 7-9; psychoid mode renders `pending-psychoid-outer-planet` badge (per 19.10b: "Outer planets belong to M2-5 transpersonal extension; not in this LUT").

   View-mode survives the bimba/pratibimba toggle (per 23.15 state-persistence).

   Verification: `pnpm --filter @pratibimba/m2-parashakti test:planetary-view-switch` asserts (a) Vibrational mode renders Cousto Hz + chakra; (b) Psychoid mode renders Jung-Pauli archetypal-meaning; (c) view-mode toggle persists across simulated layout switch; (d) seven inner planets resolve in both modes; (e) three outer planets render psychoid-pending in psychoid mode while vibrational continues to resolve.

7. **23.7 — 72-fold bridge inspector (hexagram → half-decan → decan → planet → chakra → body-zone)** *(spec-ahead-integration; consumes Tranches 3.2-M2, 19.10a; cross-link Tracks 03, 05)*

   Author `m2-parashakti/src/browser/components/SeventyTwoFoldBreadcrumb.tsx`. Renders the full M2 path as a left-to-right glyph breadcrumb: `hexagram → half-decan → decan → planet → chakra → body-zone`. Six steps; each step shows the substrate citation + provenance + Cl(4,2) signature colour-binary tint at the breadcrumb-arrow.

   Step sources (via kernel-bridge):
   - **Step 1 hexagram**: from `mahamaya.m2VibrationIndex` (DET evidence handle); cross-link `kernelBridge.m3.hexagram(idx)` for the M3-side resolution.
   - **Step 2 half-decan**: `parashakti_meaning.routing_trace.active_decan / 2` from Tranche 3.2-M2 F_routing — the 72 → 36 half-cardinality compression at the half-decan layer.
   - **Step 3 decan**: `parashakti_meaning.routing_trace.active_decan` (0-71); `kernelBridge.m2.decodeAxisAt(address72, 'decan-face')` resolves the decan-face descriptor.
   - **Step 4 planet**: `M2_DECAN_DESC[active_decan].ruling_planet` via `kernelBridge.m2.planetLUT(planet_id)`.
   - **Step 5 chakra**: `M2_PLANET_LUT[planet_id].elem_sig` decoded via `ELEM_SIG_GET_CHAKRA(sig)` → chakra glyph from `M2_CHAKRA_LUT[chakra_id]`.
   - **Step 6 body-zone**: `CHAKRA_BODY_ZONES[chakra_id]` from `nara::medicine` (per MEMORY note) via `kernelBridge.m4.medicineChakraZones(chakra_id)`.

   Hexagram → half-decan compression visualises the 9:8 epogdoon at the leftmost arrow (the 64→72 expansion from M3 side; or 72→64 compression toward M3 — the same identity, two directions). Cl(4,2) signature colour-binary tints the arrows: cool indigo for `signature -1` (P0/P5 sin/cos), warm amber-vermilion for `signature +1` (P1-P4 tan/sec/cot/csc), per M2-ARCHITECTURE §9.3.

   For `address72` outside the F_routing path (e.g. tree-browser hover without routing context), the breadcrumb renders the first four steps deterministically from `M2_DECAN_DESC[address72]` + `M2_PLANET_LUT[ruling_planet]`; steps 5 + 6 render via the planet → chakra → body-zone chain without requiring routing context.

   Cross-link 19.10a `M0_M2_ZODIACAL_BRIDGE[12]`: when a sign is selected on the planetary card or correspondence tree, the breadcrumb prefills via `kernelBridge.m0.zodiacalBridge(sign).first_decan_idx_72` and traverses the three decans of that sign.

   Verification: `pnpm --filter @pratibimba/m2-parashakti test:bridge-72-fold` asserts (a) all six steps resolve for any address72 ∈ [0, 71]; (b) the hexagram → half-decan arrow visibly carries the 9:8 epogdoon indicator; (c) chakra → body-zone chain matches the `nara::medicine` LUTs without re-derivation; (d) zodiacal-bridge prefill works for all 12 signs; (e) Cl(4,2) signature colour-binary tints arrows correctly per `position6`.

8. **23.8 — 9:8 Epogdoon proof overlay + 9-tick bloom** *(spec-ahead-integration; consumes M2-ARCHITECTURE §5.4 + §6.6)*

   Author `m2-parashakti/src/browser/components/EpogdoonProofOverlay.tsx`. Developer/proof-mode toggle (parallel pattern to 15.8 raw/DR proof overlay on the M1 vortex matrices). Two render modes:

   - **Proof identity panel**: visible only in dev-mode (toggle `?epi-debug=m2-proof` query param or `epiLogos.m2Parashakti.devMode` Theia preference). Renders the integer identity `7/4 = (72 − 9) / 36` as a static equation card + the live `address72` decomposition `address72 = 9 × q + r` where `q ∈ [0, 7]` and `r ∈ [0, 8]` showing the current `(q, r)` from the live profile. Cross-link `m2_epogdoon_compress(val) = val * 8 / 9` from m2.h (citation only; no import).

   - **9-tick compression-pulse bloom**: a Venus-aesthetic warm-amber bloom on the DET-evidence card (in Layer B, see 23.3 — though the DET card is implicit in the planetary card; explicit DET card lands as a sub-surface). Bloom fires every `tick_counter % 9 == 0` — one-shot 250ms ease-out. Tick counter tracks `(profile.generation - first_observed_generation)`; resets cleanly on session restart.

   Both modes ride the profile-tick clock (15.6); no local timers. Bloom and proof-panel are independent.

   Verification: `pnpm --filter @pratibimba/m2-parashakti test:epogdoon-proof` asserts (a) proof-identity panel renders `7/4 = (72 − 9) / 36`; (b) `(q, r)` decomposition updates with `address72` advance; (c) 9-tick bloom fires at simulated tick 0, 9, 18, 27, …; (d) dev-mode toggle is gated by query param + preference.

9. **23.9 — Cymatic spheres (chakras) variant — deferred named surface** *(spec-ahead-integration; deferred named carrier)*

   The third Layer C variant — `CymaticSpheresSurface` (8 concentric spheres, one per chakra, spherical-harmonic modes per layer) — is named but not built in cycle-3 unless promoted. It is the daily-0-1 cosmic-side solar-system anchor view per UX §8.1 + M2-ARCHITECTURE §5.3.2. Composition target: composes inside `plugin-integrated-1-2-3` around the Earth-Sun pair anchor, with chakra-spheres rendering between Earth and the active planet from `parashakti_meaning.routing_trace.planetary_hour_ruler`.

   Substrate complete: `M2_CHAKRA_LUT[8]` in m2.h; `M2_PLANET_LUT[10]` + Earth observer-centre (per Tranche 3.5-M2 DCC-03 ratification — Earth is the 10th planet as observer-centre). The renderer engine for spheres-on-K² lives at composition level (within the plugin-integrated-1-2-3 composition geometry).

   This tranche names the carrier so it does not become an orphan; flag as deferred to a follow-on tranche unless promoted by user. Parallel to Tranche 3.7-M2 music-tech deferral.

   Verification: decision-register or follow-on tranche reference; named at `M2CymaticEngineWidget.surfaceVariantRegistry` as `'spheres' → 'deferred-23.9'` so the variant switcher can render a "pending — solar anchor variant" tile without crashing.

10. **23.10 — Three outer-planet (Uranus/Neptune/Pluto) stubs with pending-dataset badge** *(code-pending-closure; consumes M2-ARCHITECTURE §2.4 + DCC-03)*

    On `PlanetaryChakralCard` (23.3), `CorrespondenceTreeWidget` planetary-keying side panel (23.5), and `SeventyTwoFoldBreadcrumb` step 4 (23.7): when the planet at index 7 (Uranus), 8 (Neptune), or 9 (Pluto) is selected or traversed, the surface honestly renders:

    - **Substrate-present data** from `M2_PLANET_LUT[10]` rows 7-9 via `kernelBridge.m2.planetLUT(idx)` — Cousto Hz, DR, chakra, element, phase, Ananda row.
    - **Pending-dataset badge** flagging `s2.outerPlanetGraphNode: 'pending-dataset-2-5-8-9-10'` for the absent S2 graph nodes (per CLAUDE.md M2 dataset gap "3 outer planets missing from parashakti dataset (targets: #2-5-8/9/10)").
    - **Pending-psychoid extension** in psychoid view-mode (per 23.6) flagging `m2-5-transpersonal-extension` as the future home for outer-planet psychoid correspondence.

    Honesty discipline: never fake the missing data. Render what is present from `.rodata`; flag what is missing from the dataset.

    Verification: `pnpm --filter @pratibimba/m2-parashakti test:outer-planet-pending` asserts (a) Uranus/Neptune/Pluto cards render Cousto Hz from `.rodata`; (b) `pending-dataset-2-5-8-9-10` badge visible on outer-planet cards; (c) psychoid-mode renders `pending-psychoid-outer-planet` badge; (d) breadcrumb step 4 traverses outer planets without rendering folklore.

11. **23.11 — Shadow-decan surface (108 = 36 × 3)** *(code-pending-closure; consumes M2-ARCHITECTURE §2.2 + CLAUDE.md M2 canon)*

    Author `m2-parashakti/src/browser/components/ShadowDecanSurface.tsx`. Composes inside the `DecanFaceCard` (23.3) as a reveal panel: when a decan leaf is selected (in `CorrespondenceTreeWidget` 23.5) or the decan card is expanded, the shadow surface reveals the 108-cardinality decomposition:
    - **36 primary decans** (the structural decan-cells): from `M2_DECAN_DESC[72]` filtered by `face == 0` (light) + S2 graph at `coordinate: '#2-3-{0..35}'` for primary descriptors.
    - **36 light decans**: from `M2_DECAN_DESC[72]` with `face == 0`.
    - **36 shadow decans**: from `M2_DECAN_DESC[72]` with `face == 1` + S2 graph extension at `coordinate: '#2-3'` for the third (shadow proper) face descriptors per CLAUDE.md M2 canon ("Shadow decans: #2-3 is primary source").
    - **Tarot reversedMeaning cross-reference**: at `coordinate: '#3-4'` (M3'-owned per CLAUDE.md "#3-4 reversedMeaning is tarot expression"); cross-link via `kernelBridge.m3.tarotReversedMeaning(decan_idx)`.

    Honest pending: if S2 graph at `#2-3` shadow-proper or `#3-4` reversedMeaning is absent, render the available primary+light faces from `.rodata` directly and flag `pending-shadow-decan-graph` + `pending-tarot-reversed-meaning` per readiness taxonomy.

    Verification: `pnpm --filter @pratibimba/m2-parashakti test:shadow-decan` asserts (a) 72-cardinality light/shadow faces render from `M2_DECAN_DESC[72]` decoder; (b) 108 cells are exposed when S2 shadow-graph is present; (c) pending badges flag missing data cleanly; (d) reversed-tarot cross-reference resolves when M3' adapter is wired.

12. **23.12 — Composition mount-point: M2 cymatic on K² torus surface (per 15.4)** *(spec-ahead-integration; closes O-WC-M2.01; cross-link Tranche 11.5 / 15.4 / 07)*

    The load-bearing composition closure. Author `m2-parashakti/src/common/composition.ts` exporting:

    ```typescript
    export interface M2CymaticTextureContribution {
        readonly chladniField: readonly number[];           // χ field samples for the surface
        readonly colourBinary: ColourBinaryPalette;         // element-colour palette + nodal-white
        readonly heatmap72: readonly number[];              // 72-cell brightness overlay (Layer A heatmap)
        readonly surfaceVariant: 'torus' | 'plate' | 'spheres';
        readonly activeCellIndex: number;                   // (lens, position) → 0..71
        readonly kleinFlipPhase: 'primary' | 'inverted' | 'transitioning';
        readonly provenance: M2ProvenanceHandle;
    }

    export function buildM2CymaticTextureContribution(
        profile: MathemeHarmonicProfileBoundary,
        context: CoordinateContext,
        variant: 'torus' | 'plate' | 'spheres'
    ): M2CymaticTextureContribution;
    ```

    Update `index.ts` `TRACK_08_CONTRIBUTION` to declare the composition mount-point alongside the existing `M2MeaningPacketCard` + `M2CymaticMiniView` exports. The integrated-1-2-3 plugin (`plugin-integrated-1-2-3`) imports `M2CymaticTextureContribution` from `@pratibimba/m2-parashakti/common/composition` and passes it to the played-torus Bevy/wgpu renderer (DR-M1-2; lives in `m1-paramasiva-played-torus`). M2 contributes the DATA SHAPE; M1' renders the SURFACE TEXTURE on the K² mesh.

    The 8+4 audio bus drives K² surface displacement; the 72-cell heatmap (`heatmap72`) overlays as cell brightness on the lens-ring; M3 codon-rotation (via M3' contribution) projects onto the lens-ring cells. One surface, three poles, one composition driven by profile-tick. Per 15.4: composition over juxtaposition.

    Composition-contract preflight (`08-t0-composition-contract-preflight`) extends to declare `M2CymaticTextureContribution` as a shared shape under `Body/M/epi-theia/shared/`; validator asserts the contribution is consumed by `plugin-integrated-1-2-3` and never by the standalone M2' widget directly.

    Personal-side composition (4-5-0) consumes the same shape with `surfaceVariant = 'plate'` + `protected-m4` scope semantics — but that consumption lives in M4', not in this tranche.

    Verification: `test -f Body/M/epi-theia/extensions/m2-parashakti/src/common/composition.ts`; `grep -n "M2CymaticTextureContribution\|compositionMountPoint\|cymatic-mount" Body/M/epi-theia/extensions/plugin-integrated-1-2-3/src/`; `pnpm --filter @pratibimba/integrated-composition test` extended to assert M2's contribution-shape resolves; composition-contract validator passes; ! `grep -rn "bevy\|@bevy\|wgpu" Body/M/epi-theia/extensions/m2-parashakti/src/` (M2 never imports the renderer engine).

13. **23.13 — Audio-bus visual representation (NO sound output)** *(code-pending-closure; defers Tranche 3.7-M2 music-tech bridge)*

    Author `m2-parashakti/src/browser/components/AudioBusVisualiser.tsx`. Renders the 8-channel `audio_octet[8]` as a stacked frequency-bar (Hz numeric per channel + band glyph + element badge from the active planet's `elem_sig`). 144→432 Hz scale alignment matches the mantra band (per M2-ARCHITECTURE §2.3); Matrika/Malini phase indicator from `parashakti_meaning.routing_trace.mantra_index` (descent < 50, ascent ≥ 50).

    **No sound output** — the M2' extension itself does NOT instantiate Web Audio. No `AudioContext`, no `OscillatorNode`, no `<audio>` element. The audio bus is REPRESENTATION; the deferred music-tech bridge (Tranche 3.7-M2 MIDI 2.0 / MPE / MTS-ESP adapter at `Body/S/S0/portal-core/src/music_tech.rs`) is named as the future audio surface but not built in cycle-3.

    For users who want the maqam interval pattern represented audibly, the visual stack shows the 24-quarter-tone interval glyph on `MaqamModeCard` (23.3); when the music-tech bridge lands, the same data flows through MPE / MTS-ESP without any M2' widget change.

    Verification: `! grep -rn "new AudioContext\|<audio\|new Audio(\|new Oscillator\|OscillatorNode\|getUserMedia" Body/M/epi-theia/extensions/m2-parashakti/src/`; `pnpm --filter @pratibimba/m2-parashakti test:audio-bus-visual` asserts (a) 8 channels render with Hz numeric; (b) 144→432 Hz scale aligns with mantra band; (c) Matrika/Malini phase indicator binds to `mantra_index`; (d) no sound is produced.

14. **23.14 — Per-card inline provenance + readiness taxonomy bindings** *(spec-ahead-integration; consumes Tranche 15.6 + `07-t0-extension-contract-preflight.json:59-109` readiness taxonomy)*

    Author `m2-parashakti/src/browser/components/ProvenanceBadge.tsx`. Variant per the nine-id readiness taxonomy:
    - `ready_public_current` → green solid (full readiness)
    - `degraded_public_readonly` → green outlined (read-only / lower fidelity)
    - `profile_missing_field` → amber (profile gap, e.g. `kleinFlipState` pre-3.1-M2)
    - `s2_graph_blocked` → amber (S2 correspondence missing, pre-3.4-M2)
    - `s3_subscription_blocked` → amber (Kerykeion/world_clock missing, pre-3.x)
    - `bridge_unavailable` → red (kernel-bridge connection down)
    - `s5_review_blocked` → red (S5 review gate)
    - `m4_privacy_blocked` → blue (protected-m4 scope, personal-Pratibimba block)
    - `privacy_blocked` → blue (general privacy block)

    Every Layer B card (six in 23.3 + alchemical-tattvic row), every breadcrumb-step (six in 23.7), every grid-cell tooltip (Layer A in 23.2), every tree-leaf (Layer B in 23.5), and every χ-surface ruling-planet halo (Layer C in 23.4) surfaces a `ProvenanceBadge` inline. Per Tranche 15.6: provenance lives where the datum lives; no separate "errors" panel.

    The `M2PrimeMeaningPacket` already carries `provenance: readonly M2ProvenanceHandle[]` (at `meaning-packet.ts:85` + `meaning-packet.ts:303-315`) — wire it into per-card consumption via a typed selector `meaningPacketProvenanceFor(field: string): M2ProvenanceHandle` on the packet.

    Verification: `pnpm --filter @pratibimba/m2-parashakti test:provenance-inline` asserts (a) each of the nine readiness-taxonomy variants renders a distinct badge; (b) every Layer B card has a badge bound to its source provenance handle; (c) breadcrumb steps carry per-step provenance; (d) badge variant updates live when readiness snapshot changes.

15. **23.15 — Bimba/Pratibimba state persistence M2-side** *(spec-ahead-integration; consumes Tranche 15.7 `BimbaPratibimbaUiState`)*

    Author `m2-parashakti/src/browser/state/M2BimbaPratibimbaSelector.ts`. Exposes a typed selector that publishes the M2-side state slice into the shared `BimbaPratibimbaUiState` typed object (per Tranche 15.7). Fields preserved across `daily-0-1` ↔ `ide-deep` toggle AND across the 0/1 cosmic/personal face-switch:

    - `(profileGeneration, lens_mode, tick12, position6, address72, kleinFlip.surfaceValence)` — the six core profile coordinates
    - `layerAActiveCell: { lens: number; position: number }` — Layer A grid active-cell
    - `layerBCardScroll: number` — Layer B card-scroll offset
    - `layerCSurfaceVariant: 'plate' | 'torus' | 'spheres'` — Layer C surface choice
    - `layerCZoom: number` — Layer C zoom level
    - `lastRoutingTrace: FRoutingTraceHandle | null` — last F_routing trace (from 3.2-M2)
    - `correspondenceTreeAxisFilter: readonly AxisName[]` — active axis-filter chips
    - `correspondenceTreeSonicOverlay: 'none' | 'mantra' | 'asma'` — active sonic-overlay tab
    - `planetaryViewMode: 'vibrational' | 'psychoid'` — view-mode from 23.6
    - `epogdoonProofMode: boolean` — dev-mode proof overlay (23.8)

    All eleven fields participate in the kernel-bridge DI singleton contract from `layout-types.ts:7-12`. Cross-link Wave-B 11.6 acceptance-harness test which is extended to cover the M2-side state-identity assertion.

    Verification: extension of `Body/M/epi-theia/extensions/acceptance-harness/tests/topology.test.mjs` asserts all eleven M2-side state fields survive both the 0/1 toggle AND the layout switch; `pnpm --filter @pratibimba/acceptance-harness test:m2-state-persistence`.

16. **23.16 — Cymatic transport: pause + scrub-to-tick (accessibility)** *(spec-ahead-integration; consumes Tranche 15.6 profile-tick clock)*

    Author `m2-parashakti/src/browser/components/CymaticTransport.tsx`. Toolbar above the `CymaticChladniSurface` (23.4) with three controls:

    - **Pause**: freeze χ-field at current snapshot. Live `audio_octet` + `nodal_quartet` keep updating in the meaning-packet (and on the inspector cards), but the cymatic surface itself holds at the paused tick. Visual indicator: paused-tick badge in the chrome.
    - **Scrub-to-tick**: scrubs the cymatic surface back to a past tick (within the kernel-bridge profile snapshot cache window — typically the last 144 ticks = 12 spanda cycles). Deterministic replay since `buildStandingWavePoints` is a pure function of `(audio_octet, nodal_quartet, address72)`.
    - **Tick-snapshot bar**: horizontal scrubber showing tick history within the cache window, with Klein-flip event markers highlighted (so users can scrub directly to a self-fold moment).

    All three controls are accessibility-required (per M2-ARCHITECTURE §8.6 "pause/scrub of the tick for slow inspection" — explicitly mirrored at Tranche 15.9 visual-regression test "accessibility test allows pause/scrub of the tick for slow inspection"). Audio safety remains: pause/scrub never produces sound; the cymatic visual derives from the bus even when playback is disabled.

    Cache window dependency: the tick-snapshot cache lives in the kernel-bridge (named as out-of-scope for this tranche if cache is not present); if the cache is absent, the scrubber gracefully renders `pending-tick-snapshot-cache` and falls back to live-only.

    Verification: `pnpm --filter @pratibimba/m2-parashakti test:cymatic-transport` asserts (a) pause holds χ-field at snapshot; (b) scrub-to-tick replays deterministically; (c) Klein-flip markers visible on tick-snapshot bar; (d) tick-snapshot cache absence falls back gracefully without crashing.

17. **23.17 — Cymatic-determinism test + visual-regression harness binding** *(spec-ahead-integration; consumes Tranche 15.12 visual-regression harness)*

    Author `Body/M/epi-theia/extensions/m2-parashakti/test/cymatic-determinism.test.mjs` asserting that for identical `(audio_octet, nodal_quartet, address72)` inputs, `buildStandingWavePoints` produces byte-identical `wavePoints` arrays, and `CymaticChladniSurface` (23.4) renders byte-identical canvas output. This is M2-ARCHITECTURE §10 test 6 made executable.

    Visual-regression baseline storage at `acceptance-harness/fixtures/visual-regression/`:
    - `m2-cymatic-plate-tick-{0..11}.png` — the 12 spanda-cycle reference frames for the plate variant
    - `m2-cymatic-klein-flip-boundary.png` — the 200ms self-fold transition reference
    - `m2-mef-grid-tick-{0..11}.png` — Layer A grid pulse references
    - `m2-correspondence-tree-six-axes.png` — correspondence-tree six-axis filter reference
    - `m2-breadcrumb-72-fold.png` — breadcrumb traversal reference for each of 12 zodiacal sign starts

    Diff threshold: 1% per-frame pixel diff acceptable (deterministic-stylised wave has anti-aliasing variance). Klein-flip transition frames allowed 5% diff (during animation).

    Cross-link Tranche 15.12 binds the visual-regression suite into `acceptance-harness/tests/visual-regression-m2.test.mjs` invoked by `pnpm --filter @pratibimba/acceptance-harness test:visual -- --suite m2-parashakti`.

    Verification: `pnpm --filter @pratibimba/m2-parashakti test:cymatic-determinism && pnpm --filter @pratibimba/acceptance-harness test:visual -- --suite m2-parashakti`; baseline images committed under `acceptance-harness/fixtures/visual-regression/m2-*`.

## Cycle 2 Substrate Inheritance

Consume as-is — Theia `ReactWidget` + Inversify DI; `@pratibimba/m-extension-runtime` `SharedBridgeAdapter` + `ReadinessBanner` + `MExtensionReadinessSnapshot`; `@theia/core/lib/browser/widgets/react-widget`; `WidgetFactory` registration in `frontend-module.ts`; the entire `M2PrimeMeaningPacket` + `renderM2CymaticFrame` + `buildStandingWavePoints` chain at `meaning-packet.ts` (no rewrites; only consumers added). Repurpose — `M2MeaningPacketCard` + `M2CymaticMiniView` Track 08 compact exports for the cosmic-1-2-3 composition contribution (23.12 extends the contribution shape, does not rewrite). Extend — `m2-parashakti-widget.tsx` `M2ParashaktiWidget` becomes the three-layer-composing container while the cymaticEngine + correspondenceTree widget classes (23.1) handle their own surfaces.

## Anti-Greenfield Posture

All work in Tranche 23 either:

- Consumes Theia platform conventions (`ReactWidget`, Inversify DI, `WidgetFactory`, status-bar, activity-bar contributions)
- Consumes the landed `m2-parashakti` extension (`M2PrimeMeaningPacket` shape, `renderM2CymaticFrame`, `SharedBridgeAdapter` bindings, three view IDs already declared)
- Consumes the substrate-side closures from waves A/B and tranche 03 (klein_flip field, F_routing carrier, six-axes decoder, S2 adapter, six-axes canon split)
- Consumes 19.10 dataset bridges (M0_M2_ZODIACAL_BRIDGE, PSYCHOID_PLANETARY_CORRESPONDENCE, ALCHEMICAL_TO_TATTVIC) — none of which the M2 widget imports directly; all cross through the kernel-bridge
- Consumes Tranche 15 foundation principles (15.4 composition pattern; 15.6 inline provenance; 15.7 state persistence; 15.8/9 tick choreography; 15.12 visual-regression harness)
- First-builds component classes (`MefGrid72Component`, six Layer B card components, `CymaticChladniSurface`, `M2CymaticEngineWidget`, `M2CorrespondenceTreeWidget`, `SeventyTwoFoldBreadcrumb`, `PlanetaryViewModeSwitch`, `EpogdoonProofOverlay`, `ShadowDecanSurface`, `AudioBusVisualiser`, `ProvenanceBadge`, `CymaticTransport`, `M2BimbaPratibimbaSelector`) — ALLOWED because no Theia widget currently renders these per-axis decompositions; substrate is landed; first-builds are scoped per the canonical three-layer rendering contract (M2-ARCHITECTURE §5)

No greenfield substrate. No competing widget shell. No oscillator. No direct LUT import. No Bevy/wgpu in M2 widget tree. No re-derivation of profile bus fields. The standalone deep widget becomes what it always wanted to be; the composition mount-point lets M2' cymatic frequencies render where they belong — on the K² torus surface that M1' plays.

## Closing Formula

```text
M2-0′ guards the 72-invariant.
M2-1′ is Vimarśa — it reads the cloud and writes the audio bus.
M2-2′ is the element; M2-3′ is the decan-face.
M2-4′ is the sacred-sonic arena — the angels, the maqams, the mantras.
M2-5′ is the solar-chakral runtime and the 9:8 gate to Matter.

Layer A shows the 72-cell address.
Layer B shows the six tongues at the active cell.
Layer C shows frequency-becoming-form as the Chladni standing-wave.
The composition mount-point lets that standing-wave render on the K² torus surface
  — one substrate, one surface, three poles, one composition driven by profile-tick.
```

The 22-row matrix shows the substrate is largely landed; the genuine cycle-3 wave-C work is the three-layer deep-design build (23.2 + 23.3 + 23.4) + the correspondence-tree axis filter (23.5) + the composition mount-point for the K² torus (23.12) + the inline-provenance contract consumer (23.14). The deferred surfaces (23.9 spheres variant; 23.13 named-but-no-audio-bridge; Tranche 3.7-M2 music-tech bridge) are named explicitly so none become orphans, but none are built in cycle-3 unless promoted.

The instrument is ready to be made playable. What this tranche closes is **how the user sees it play**.

---

*Companion matrix: [`plan.runs/wave-c-m2-parashakti-frontend-matrix.md`](plan.runs/wave-c-m2-parashakti-frontend-matrix.md). Cross-references: [Track 03 — M2 substrate closures](03-m2-parashakti-reconciliation.md), [Track 11 — Theia shell hosting](11-theia-shell-surface-hosting.md), [Track 15 — UI foundations](15-ui-design-foundations.md), [Track 19 — contemplation surface integration](19-contemplation-surface-integration.md). Canonical total-shape: [`Idea/Bimba/Seeds/M/M2'/M2-ARCHITECTURE.md`](Idea/Bimba/Seeds/M/M2'/M2-ARCHITECTURE.md).*
