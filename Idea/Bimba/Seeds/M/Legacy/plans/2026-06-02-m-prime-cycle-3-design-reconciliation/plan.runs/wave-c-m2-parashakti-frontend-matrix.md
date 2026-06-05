# Wave C — M2' Paraśakti Frontend Deep-Design Reconciliation Matrix

**Task id:** `wave-c-m2-parashakti-frontend`
**Domain:** Per-extension widget UX for M2' Paraśakti — the harmonic-correspondential instrument. Both the standalone `ide-deep` deep widget (cymatic engine + correspondence tree + sacred-sonic inspector) and the M2' contribution to the cosmic-1-2-3 composition (cymatic frequencies rendered on the K² torus surface per 15.4).
**Anti-greenfield posture:** `Body/M/epi-theia/extensions/m2-parashakti/` is landed cycle-2 substrate. Layer A 72-grid, Layer B sacred-sonic panel, Layer C cymatic surface, dual cymatic registers (cosmic-public vs `protected-m4` personal), `m2.parashakti.{meaningPacket,cymaticEngine,correspondenceTree}` view IDs, `M2MeaningPacketCard` + `M2CymaticMiniView` Track 08 compact exports, the `M2PrimeMeaningPacket` shape, `renderM2CymaticFrame` deterministic CPU reference, and the `forbiddenImports` set are all already on disk. Every tranche below is `consume as-is`, `audit/verify`, `extend`, or a named per-axis decoder + provenance binding closure. **No first-build of an already-scaffolded widget.** Cross-extension wiring (M1 K² composition surface; M4' personal-scope; M3' DET reception; M5' routing-trace) routes through landed plugin-integrated extensions and the kernel-bridge.

## Source list (corpora actually consulted)

- **Corpus 1 (UX intent)** — `Idea/Pratibimba/System/Subsystems/Parashakti/parashakti-ux-full-m2-branch.md` (§2 six M2-X' strata, §3 six addressing-axes, §5 relation-web, §6 Klein L↔L' flip, §7 Ficinian-Kerykeion routing, §8 Parashakti-serves-Nara, §8.2 germane-axis UX discipline)
- **Corpus 2 (M' Seed authority)**
  - `Idea/Bimba/Seeds/M/M2'/M2-ARCHITECTURE.md` (the canonical total-shape — §2 substrate map, §4 profile-bus contract + `parashakti_meaning` projection, §5 three-layer visual contract, §6 tick choreography, §7 boundary contracts, §8 IDE integration, §10 test criteria)
  - `Idea/Bimba/Seeds/M/M2'/M2'-SPEC.md` (companion canonical domain spec; six 72-axes ratification, 9:8 epogdoon at `m2_epogdoon_compress`, Klein-flip semantics)
  - `Idea/Bimba/Seeds/M/M2'/m2-prime-parashakti-cymatic-engine.md` (Chladni equation derivation, GPU frame contract)
  - `Idea/Bimba/Seeds/M/M2'/m2-prime-frequency-meaning-research.md` (M2PrimeMeaningPacket canonical shape)
- **Corpus 3 (substrate truth — read-only references; M2' widget never imports these)**
  - `Body/S/S0/epi-lib/include/m2.h` six `[72]` LUTs + `M2_PLANET_LUT[10]` + `M2_MANTRA_LUT[100]` + `M2_ASMA_LUT[100]` + `M2_TO_M3_CYMATIC_PROJECTION[72]` + `m2_epogdoon_compress`
  - `Body/S/S0/portal-core/src/parashakti/vimarsha_reading.rs` M2-1' kernel writing `audio_octet[8]` + `nodal_quartet[4]`
  - `Body/S/S0/portal-core/src/kernel.rs` `MathemeHarmonicProfile` (`audio_octet`, `nodal_quartet`, `resonance72`, `lens_mode`, `elements`, `planetary_chakral`, `binary`/`mahamaya`)
  - `Idea/Bimba/Map/datasets/parashakti-deep/{relations,nodes-full-detail,parashakti-planets}.json` (248 typed relations)
  - `Body/S/S0/epi-lib/src/m0.c` ALCHEMICAL_TO_TATTVIC[6], PSYCHOID_PLANETARY_CORRESPONDENCE[7], M0_M2_ZODIACAL_BRIDGE[12] (per 19.10 cross-link)
- **Corpus 4 (Theia surface — the wave-C focus)**
  - `Body/M/epi-theia/extensions/m2-parashakti/src/browser/m2-parashakti-widget.tsx` (130 LOC; ReactWidget subscribing `bridge.onReadiness` / `onProfile` / `onCoordinateContext`; renders ReadinessBanner + the M2PrimeMeaningPacket `<dl>`)
  - `Body/M/epi-theia/extensions/m2-parashakti/src/browser/frontend-module.ts`
  - `Body/M/epi-theia/extensions/m2-parashakti/src/common/index.ts` (EXTENSION_ID, PRIVACY_CLASS, ALL_VIEW_IDS, DECLARED_BLOCKERS, TRACK_08_CONTRIBUTION with M2MeaningPacketCard + M2CymaticMiniView)
  - `Body/M/epi-theia/extensions/m2-parashakti/src/common/meaning-packet.ts` (375 LOC; `buildM2PrimeMeaningPacket`, six `M2AddressView` stubs, `renderM2CymaticFrame`, `M2CymaticScope`, `personalScopeBlocked` gate)
  - `Body/M/epi-theia/extensions/contracts/07-t0-extension-contract-preflight.{md,json}` (m2 entries 254-308; readiness taxonomy 9 ids; SharedBridgeAdapter capability set; forbiddenDirectImports)
  - `Body/M/epi-theia/extensions/plugin-integrated-1-2-3/` (composes M1+M2+M3 per 15.4 composition pattern)
  - `Body/M/epi-theia/extensions/plugin-integrated-4-5-0/` (composes M4+M5+M0; personal-Pratibimba cymatic at #4.4.4.4)
  - `Body/M/epi-theia/extensions/integrated-composition/` (shared composition shapes)
  - `Body/M/epi-theia/shared/` (cross-extension types)
- **Cross-reference (sibling waves)**
  - Wave-A M2: `plan.runs/wave-a-m2-reconciliation-matrix.md` (DR-M2-1 planet+Earth-observer, DR-M2-2 six-axes-plus-overlays, 3.1-M2 klein_flip, 3.2-M2 F_routing carrier, 3.3-M2 per-axis decoder, 3.4-M2 S2 adapter)
  - Wave-B theia shell: `plan.runs/wave-b-theia-shell-matrix.md` (TS-16 correspondenceTree shem-asma collapse; TS-22 forbidden-import lint; 11.x tranche IDs)
  - Cycle-3 tranche 15: editor-area composition (15.4), profile-tick + readiness inline (15.6), bimba/pratibimba state-persistence (15.7), tick choreography across M1-2 (15.8, 15.9), visual-regression harness (15.12)
  - Cycle-3 tranche 19: `M0_M2_ZODIACAL_BRIDGE` (19.10a), `PSYCHOID_PLANETARY_CORRESPONDENCE[7]` (19.10b vibrational-vs-psychoid bridge), `ALCHEMICAL_TO_TATTVIC[6]` (19.10c)
  - Cycle-3 tranche 03 substrate-side: T3.1–T3.9 M2 closures (klein_flip, F_routing carrier, six-axes decoder, S2 adapter, DCC-03 ratification, six-axes canon, music-tech deferred, Nara deposit, §9.8 cleanup)

## Standing invariants honoured (not re-derived)

- **One 72-invariant, six addressing-axes** (MEF×QL · tattva-phase · decan-face · Shem · maqam · DET-projection). Mantra (100) + Asma (99+1) are sonic overlays onto the 72; planetary LUT (10) is keying via decan-link, not a seventh axis. This is DR-M2-2 canon (already ratified in M2-ARCHITECTURE §2.2-§2.4).
- **9:8 epogdoon** bridges 72→64 (`m2_epogdoon_compress(val) = val*8/9`); Venus carries the ratio at the planet-LUT row; 9-cancellation `7/4 = (72−9)/36` is the integer-arithmetic identity.
- **M2-1' Vimarśa kernel is the SOLE audio-writer** (M1↔M2 contract from M2-ARCHITECTURE §7.1). Renderer never re-synthesises; widget consumes `profile.audioOctet[8]` + `profile.nodalQuartet[4]` exactly.
- **Personal-Pratibimba cymatic register blocks outside `protected-m4`** (`renderM2CymaticFrame` enforces this at `meaning-packet.ts:213-217`).
- **M2 = frequency-space; M3 = matter; M3'/M3'-SPEC classifies codons** — `meaning-packet.ts:150` declares `finalClassificationAuthority: 'M3/M3-prime'`.
- **Composition over juxtaposition** (15.4): M2 cymatic frequencies render ON the M1 K² torus surface as displacement + colour texture, not as a side-by-side pane.
- **Bevy/wgpu played-torus is M1' authority** (DR-M1-2); M2' contributes cymatic field + 72-cell heatmap overlay, never re-renders the topology.
- **SharedBridgeAdapter only** — `m2-parashakti/src/common/index.ts:95` declares `forbiddenImports: ['Body/S/S0', 'Body/S/S2', 'Body/S/S3', '@clockworklabs/spacetimedb-sdk', 'neo4j-driver']`.
- **Profile-tick is the global UI clock** (15.6); no local rAF clocks; no animation-frame-count fallbacks. Tick replay is deterministic from `(tick12, address72, audio_octet, nodal_quartet)`.
- **Privacy class** per `index.ts:16`: `public_current_with_pending_private_projection_blocks` — protected projections stay blocked until M4'-scope.

---

## The Four-Way Alignment Matrix (Frontend Depth)

| # | Claim (UX + total-shape) | Spec authority (M2-ARCHITECTURE / M2'-SPEC) | Code/widget evidence | Frontend-design status | Status |
|---|---|---|---|---|---|
| WC-M2.01 | Three primary views: `m2.parashakti.{meaningPacket, cymaticEngine, correspondenceTree}` register Layer A 72-grid + Layer B sacred-sonic + Layer C Chladni standing-wave in `ide-deep` | M2-ARCHITECTURE §5 three-layer rendering contract; §8.1 three primary view IDs | `index.ts:11` declares `ALL_VIEW_IDS` exactly: `meaningPacket`, `cymaticEngine`, `correspondenceTree`; preflight JSON lines 254-260 mirror | Only `m2.parashakti.meaningPacket` is mounted by `frontend-module.ts` + `M2ParashaktiWidget` (single ReactWidget renders the whole packet `<dl>`). `cymaticEngine` and `correspondenceTree` view IDs are declared but no per-view widget classes exist yet. | **SPEC-AHEAD** — three views named; one widget shipped. Closing 23.1 lands per-view widget classes. |
| WC-M2.02 | Layer A 72-cell MEF matrix renders 12×7 grid scaffold (lens × mode = 84-state landscape M2-1' reads) overlaid with 12×6=72-cell active MEF address; lens-anchor row glows; mode column traces; helix bit halo-colours rows 0-5 warm / 6-11 cool; tritone-mirror lens-pair arcs animate on Klein-flip | M2-ARCHITECTURE §5.1 grid scaffold + per-cell substrate citations from `M2_MEF_DESC[72]` payload (`lens`, `position`, `l_family_link`, `is_inverted`, `meaning_id`) | Current widget shows no grid — only a `<dl>` listing `address72`, `audioOctetHz`, `detEvidence`, `pendingFields`, `kleinFlip.surfaceValence`. `M2_MEF_DESC` data flows through `kernelBridge.m2.decodeAxisAt('mef', address72)` once Tranche 3.3-M2 lands per-axis decoders. | Widget shape (`mef-grid-12x7.tsx`) absent. Profile fields `lens_mode.{lens,mode}` + `helix_bit` + `resonance72.lensAnchorIndex` already on bus. | **SPEC-AHEAD** — substrate complete; named component absent. Closing 23.2 lands `MefGrid72Component`. |
| WC-M2.03 | Layer B sacred-sonic right-rail with 6 cards: decan-face, Shem-pair (light/shadow), maqam-mode (24-TET interval bar), mantra (Sanskrit phoneme + 144→432 Hz band), Asma (99+1 with Jalal/Kamal/Jamal badge), planetary-chakral (Cousto Hz + chakra) | M2-ARCHITECTURE §5.2; per-card LUT bindings; provenance handle badges per card | None of these six cards render in the widget. Data flow exists but the React tree shows a flat `<dl>`. `sacredSonicFrame` is a pending generic record (`frameOrPending`). | All six card data sources reach the widget via the meaning-packet but no `SacredSonicCard*.tsx` components exist. | **SPEC-AHEAD** — closing 23.3 lands six card components + sacred-sonic panel container. |
| WC-M2.04 | Layer C Chladni standing-wave surface — three render targets: plate (2D, default deep-widget view), torus (composition with K² per 15.4), spheres (8 chakras stacked, solar-anchor view) | M2-ARCHITECTURE §5.3.1 Chladni equation (single primitive); §5.3.2 three-surface table; §5.3.3 Klein-flip self-fold; §5.3.4 colour-binary palette | `renderM2CymaticFrame` produces the deterministic 72-sample wave at `buildStandingWavePoints` (lines 251-271); current widget never visualises it — only logs the audio bus values. Wave-points cross the boundary but no canvas / WebGL / SVG renderer exists. | The three surface render variants (plate/torus/spheres) are net-new component work explicitly named in M2-ARCHITECTURE §9.3 "Net-new" exceptions to anti-greenfield (renderer-side surface choice). | **SPEC-AHEAD** — closing 23.4 lands `CymaticChladniSurface` (plate variant) + `CymaticSurfaceVariant` enum + composition mount-point for K² torus variant; spheres variant deferred to 23.9. |
| WC-M2.05 | Six-axis correspondence-tree browser with axis filter (TS-16 resolution: ONE tree, axis filter — the six addressing-axes of 72 + two sonic overlays) | DR-M2-2 ratified at M2-ARCHITECTURE §2.3 (six axes vs overlays); Wave-B TS-16 names the widget id `m2.parashakti.correspondenceTree` (NOT `correspondenceBrowser`) | Widget id declared (`ALL_VIEW_IDS[2]`); no widget renders the tree; `M2AddressView` enum currently has six entries with `shem-asma` collapsed; Tranche 3.6-M2 splits it into `shem` and `asma` | Tree-browser surface (`CorrespondenceTreeWidget.tsx`) absent. The split (`'shem-asma'` → `'shem'` + `'asma'`) is a substrate-side change inherited from 03/3.6-M2. | **SPEC-AHEAD** — closing 23.5 lands `CorrespondenceTreeWidget` with six-axis filter + two sonic-overlay tabs (mantra 100 + asma 99+1) + planetary-keying surface. Honours TS-16: ONE tree, axis filter (not split). |
| WC-M2.06 | Vibrational-vs-Psychoid view-switcher: same seven planets, two readings — Cousto vibrational frequency (M2-ARCHITECTURE §2.4 PLANET_LUT[10]) vs Jung-Pauli archetypal-meaning (PSYCHOID_PLANETARY_CORRESPONDENCE[7] per 19.10b) | 19.10b: "Jung-Pauli archetypal-meaning correspondence (committed; coexists with the Cousto frequency mapping at M2-ARCHITECTURE §2.4 as the *vibrational* view of the same seven planets — different views, both true)" | `M2_PLANET_LUT[10]` is in m2.h; `PSYCHOID_PLANETARY_CORRESPONDENCE[7]` is on disk in m0.c per 19.10b. Both reach the widget via S2 graph-services or via the `kernelBridge.m0.psychoidPlanetary()` adapter (not yet wired). | View-switcher UI not present. Bridge adapter for psychoid view not wired. | **CONTRADICTION (downstream)** — owned by 19.10b which ratifies both readings as canonical. Wave-C provides the view-switcher widget that surfaces the two readings honestly. Closing 23.6. |
| WC-M2.07 | 72-fold bridge inspector: visual breadcrumb traversal hexagram → half-decan → decan → planet → chakra → body-zone (the full M2 path per CLAUDE.md §M2 canon "72-fold bridge canonical Spec 11") | M2-ARCHITECTURE §2.4 path: decan→planet→chakra; medicine.rs already has CHAKRA_BODY_ZONES[8] + DECAN_BODY_PARTS[36] (per MEMORY.md). Bridge crosses M3 (hexagrams) + M2 (decans/planets) + M4 (chakra/body zones via shared `nara::medicine` LUTs). | The full path lives in Rust LUTs across m2.h + m3.h + nara::medicine. No frontend breadcrumb component renders the chain. | Tracer-surface (`SeventyTwoFoldBreadcrumb.tsx`) net-new; consumes `parashakti_meaning.routing_trace` from 3.2-M2 F_routing carrier. | **DOC-AHEAD** — closing 23.7 lands the inspector; honours composition with M3 and M4 surfaces, no greenfield substrate. |
| WC-M2.08 | 9-cancellation proof overlay (`7/4 = (72−9)/36`) visible in dev mode; 9:8 epogdoon compression-pulse rendered as Venus-aesthetic warm-amber bloom every 9 ticks | M2-ARCHITECTURE §6.6 "9:8 epogdoon as a visible event"; §5.4 dev/proof overlay (parallel to 15.8 raw/DR proof overlay on M1 vortex matrices) | `m2_epogdoon_compress` lives in m2.h; profile carries `mahamaya.m2VibrationIndex` (the DET evidence). Tick counter for the 9-cycle bloom is derivable from `tick12` + cumulative tick history (not yet exposed). | No proof-overlay toggle in widget. The 9-tick bloom needs a one-shot animation primitive driven by tick advance % 9 == 0. | **SPEC-AHEAD** — closing 23.8 lands `EpogdoonProofOverlay` (dev-mode toggle) + the 9-tick warm-amber bloom on the DET card. |
| WC-M2.09 | Mantra (100) + Asma'ul-Husna (99+1) sonic-overlay tab — overlays the 72 invariant, NOT a 7th axis. Mantra: 50 Matrika (descent) + 50 Malini (ascent), 144→432 Hz chakra gradient. Asma: 99 names + 1 hidden (Al-Ism al-A'zham), Jalal/Kamal/Jamal partition with 36-internal/64-projective mask routing | M2-ARCHITECTURE §2.3 two sonic overlays + §5.2 Layer B mantra/asma cards; DR-M2-2 explicitly: overlays NOT axes | `M2_MANTRA_LUT[100]` + `M2_ASMA_LUT[100]` complete in m2.h. `ASMA_36_INTERNAL_MASK` and `ASMA_64_PROJECTIVE_MASK` baked. Frontend has zero rendering of either. | Sonic-overlay surface (`SonicOverlayPanel.tsx`) net-new; honours overlay-not-axis semantics. | **SPEC-AHEAD** — closing 23.5 owns the placement (sonic-overlay TABS within the CorrespondenceTreeWidget, not separate axis filters). |
| WC-M2.10 | Three outer-planet stubs (Uranus/Neptune/Pluto at coordinates #2-5-8/9/10) render with "pending dataset" badge per the `pending-*` readiness taxonomy (MEMORY note: "3 outer planets missing from parashakti dataset") | M2-ARCHITECTURE §2.4 Planet LUT[10] rows 7-9 are Uranus/Neptune/Pluto with Cousto Hz; CLAUDE.md M2 dataset note flags missing graph nodes at #2-5-8/9/10 | `M2_PLANET_LUT[10]` includes the three outer planets in `.rodata`; parashakti-deep dataset is missing the graph nodes. Frontend has no per-outer-planet card or pending-stub. | Outer-planet card stubs render Cousto Hz from PLANET_LUT but flag dataset-pending status via `s2.outerPlanetGraphNode: 'pending-dataset-2-5-8-9-10'`. | **CODE-PENDING** — closing 23.10 honestly surfaces both: substrate-present rendering (Cousto Hz / DR / chakra from `.rodata`) + dataset-pending badge. No fake completion. |
| WC-M2.11 | Shadow-decan surface visualised as `108 = 36 × 3` (primary + light + shadow per CLAUDE.md correction: "Shadow decans: #2-3 is primary source, #3-4 reversedMeaning is tarot expression") | M2-ARCHITECTURE §2.2 `M2_DECAN_DESC[72]` carries `face (0=light/1=shadow)`; the 108 = 36 primary + 36 light + 36 shadow split is dataset-side at #2-3 (primary) with M3 tarot reversedMeaning at #3-4 | `M2_DECAN_DESC[72]` is 72 face entries (36 decans × 2 faces). The third (shadow proper) face is at `#2-3` dataset only, not yet at the [72] union (per matrix wave-A m2 row M2.16 footnote on 108-cardinality). Frontend has no shadow-surface render. | Component (`ShadowDecanSurface.tsx`) consumes both decan-face from `M2_DECAN_DESC[72]` and shadow extension from S2 graph at `coordinate: '#2-3'`. | **CODE-PENDING** — closing 23.11 honestly renders the 72-cardinality decan-face + the 108-cardinality shadow extension via S2 graph; flags any gap as `pending-shadow-decan-graph`. |
| WC-M2.12 | Cl(4,2) signature carrier on M2 surface: decan-rotation as quaternion advance (per kernel.rs Cl(4,2) algebra at four scales — M1 ring / M3 codon / M4 personal / Kerykeion natal — UX §8.1) | `alpha_quaternionic_integration_across_M_stack.md §6.2-§6.3, §7.3` (the φ-rooted recursive proportion under 72-invariant); M2-ARCHITECTURE §5.3.4 colour-binary by `elem_sig` packed (element + chakra + phase) | `kernel.rs` carries `MathemeHarmonicProfile.planetary_chakral` with `elem_sig`-derived fields; decan-rotation as Cl(4,2) advance is verified at Wave-B kernel-bridge level (one algebra at four scales). Frontend renders no quaternion visualisation. | The colour-binary palette (Akasha=violet / Vayu=cyan / Agni=vermilion / Apas=aquamarine / Prithvi=umber) carries the Cl(4,2) signature visibly — M2-ARCHITECTURE §9.3 names this as renderer-side aesthetic choice. | **SPEC-AHEAD** — closing 23.4 (Layer C palette) + 23.7 (breadcrumb quaternion advance) carry the signature; no separate widget. |
| WC-M2.13 | Composition rule: M2 cymatic frequencies render ON K² torus surface inside cosmic-1-2-3 plugin per 15.4 composition-over-juxtaposition (NOT a side-by-side widget) | 15.4: "Geometric composition (cosmic 1-2-3 over the K² torus; personal 4-5-0 over the psychoid field) is normative"; M2-ARCHITECTURE §5.3.2 "Torus: T² with chromatic-longitude φ × fifths-meridian θ; modes are torus harmonics"; §7.6 "the cymatic IS the surface texture of the played torus" | `M2CymaticMiniView` is the cycle-2 compact export for Track 08 composition (declared at `index.ts:30-35`). Integrated plugin reads it via `currentStateSelectors` (`currentProfile`, `readiness`, `coordinateContext`). The actual K² texture-displacement binding does NOT exist; M2 only contributes the `M2CymaticMiniView` card. | M2 exposes a `composition-mount-point` API (named at M2-ARCHITECTURE Test 16; `grep -n "compositionMountPoint\|cymatic-mount" Body/M/epi-theia/extensions/plugin-integrated-1-2-3/src/`). The composition contract (`08-t0-composition-contract-preflight`) governs the integration. | **SPEC-AHEAD** — closing 23.12 lands the composition mount-point + the cymatic shader contribution shape; the renderer ENGINE lives in `m1-paramasiva-played-torus` (DR-M1-2 Bevy/wgpu), M2 contributes the texture data + the 72-cell heatmap overlay. |
| WC-M2.14 | Cousto frequency player — sonic output of decan/sign frequencies (privacy-class consideration: the M2' extension itself does NOT make sound; the audio bus is REPRESENTATION; actual audio rendering is owned by an upstream music-tech surface, deferred to 3.7-M2) | M2-ARCHITECTURE §8.6 audio-safety: "the M2' extension itself does NOT make sound. The audio bus is a *representation* of frequency; actual audio rendering (when enabled) is owned by an upstream music-tech surface (Tranche 3.7-M2 / CP-M2.13 — MIDI 2.0 / MPE / MTS-ESP adapter, deferred)" | `m2.h` `M2_MAQAM_DESC[72]` carries 24-TET interval patterns; no music-tech adapter on S0 (per Tranche 3.7-M2 deferred status). Widget cannot play audio — substrate gap is honoured. | Frontend provides a `Cousto frequency readout` (Hz display + chakra-glyph) on the planetary card AND a visual frequency-band indicator on the mantra card; **no audio output**. | **CODE-PENDING (deferred)** — closing 23.13 honestly surfaces the audio bus as visual representation + names the deferred music-tech bridge as the audio surface. M2' widget never instantiates an oscillator. |
| WC-M2.15 | Vibrational decanic surface vs psychoid-archetypal (Jung-Pauli) surface per 19.10b PSYCHOID_PLANETARY_CORRESPONDENCE — distinct view-modes on the same seven planets | 19.10b explicitly: "different views, both true". M2-ARCHITECTURE §2.4 is the Cousto vibrational view; 19.10b is the Jung-Pauli psychoid view. | `m0.c` PSYCHOID_PLANETARY_CORRESPONDENCE[7] + `m2.c` `M2_PLANET_LUT[10]` (first 7 rows Sun..Saturn + outer planets) are landed. Both bridge through `kernelBridge.m0.psychoidPlanetary(planet_id)` and `kernelBridge.m2.planetLUT(planet_id)`. | A Vibrational↔Psychoid switcher (`PlanetaryViewModeSwitch.tsx`) toggles between Cousto Hz (vibrational) and Jung-Pauli archetypal-meaning (psychoid). Same seven planets, two readings, no collapse. | **SPEC-AHEAD** — closing 23.6 lands the switcher. Outer-planet psychoid extension is open question (Uranus/Neptune/Pluto as M2-5 transpersonal extension per 19.10b) — surface as `pending-psychoid-outer-planet`. |
| WC-M2.16 | Cymatic spheres (chakras) render in solar-system spatial anchor view per UX §8.1; 8 concentric spheres, one per chakra, spherical-harmonic modes per layer | M2-ARCHITECTURE §5.3.2 "Spheres (chakras): 8 concentric spheres, one per chakra, spherical-harmonic modes per layer ... Solar-system spatial anchor view (per UX §8.1); chakras render around Earth-Sun pair" | M2_CHAKRA_LUT[8] in m2.h; `m2_epogdoon_compress` for the 8-cell projection. No spheres renderer in the m2 extension; UX §8.1 describes daemon-over-Earth-Sun pair as the cosmic anchor view. | The spheres variant of `CymaticChladniSurface` is the daily-0-1 cosmic-side anchor view — composition contribution to `plugin-integrated-1-2-3`, NOT a standalone widget. | **SPEC-AHEAD (deferred to 23.9)** — composition-side spheres rendering is part of the M1+M2+M3 composition geometry; deferred but named. |
| WC-M2.17 | ALCHEMICAL_TO_TATTVIC[6] surface (per 19.10c): Aether/Earth/Water/Air/Fire/Salt → Akasha/Vayu/Agni/Apas/Prithvi mapping; Aether and Salt both route to Akasha (prima materia / ultima materia Möbius return) | 19.10c: "L2' Alchemical-Elemental (Aether/Earth/Water/Air/Fire/**Salt**) to M2 tattvic (Akasha/Vayu/Agni/Apas/Prithvi). Aether and Salt both route to Akasha but at different cycle points — Aether is *prima materia*, Salt is *ultima materia*" | `ALCHEMICAL_TO_TATTVIC[6]` lands in m0.c per 19.10c; reaches M2 widget via `kernelBridge.m0.alchemicalToTattvic()`. Element constant at index 5 must be `M_ELEM_SALT` (not `MINERAL`). | The L2' alchemical-tattvic bridge is rendered on the elemental-card sub-surface (closing 23.3 owns Layer B; element-throughline visualised inside the decan-face card). | **CODE-PENDING** — closing 23.3 surfaces the bridge as the tattvic-glyph row on the decan-face card; the prima/ultima Möbius is rendered as a special-case marker on the Aether and Salt cells. |
| WC-M2.18 | Provenance discipline: every Layer B card carries a provenance handle visible inline; `pendingFields` array lists every blocked pathway; per Tranche 15.6 inline provenance | M2-ARCHITECTURE §8.4; per Tranche 15.6 "provenance lives where the datum lives — no separate 'errors' panel"; per readiness taxonomy 9 ids (`bridge_unavailable`, `profile_missing_field`, `s2_graph_blocked`, `s3_subscription_blocked`, `s5_review_blocked`, `m4_privacy_blocked`, `privacy_blocked`, `degraded_public_readonly`, `ready_public_current`) | Current widget surfaces `pendingFields` as comma-separated `<dd>`; `ReadinessBanner` (from `@pratibimba/m-extension-runtime`) carries the typed snapshot. Per-card provenance badges NOT rendered. | Inline-provenance MUST render on every Layer B card (per Tranche 15.6); current widget has chrome-level banner only. | **SPEC-AHEAD** — closing 23.3 (Layer B cards) + 23.14 (provenance contract) land per-card inline provenance. |
| WC-M2.19 | Bimba/Pratibimba state persistence across `daily-0-1` ↔ `ide-deep` toggle: `(profileGeneration, lens_mode, tick12, position6, address72, klein_flip.surface_valence)` + Layer A scroll/active-cell + Layer B card scroll + Layer C surface choice (plate/torus/spheres) + zoom + last F_routing trace | M2-ARCHITECTURE §8.5; Tranche 15.7 `BimbaPratibimbaUiState` contract | `M2ParashaktiWidget` keeps `readiness`, `profile`, `context` in instance state — destroyed on widget close. Cross-layout state-identity test absent. | The seven M2'-specific state fields must register with `BimbaPratibimbaUiState` and survive the 0/1 + layout toggles. | **SPEC-AHEAD** — closing 23.15 lands M2-side state-persistence contract; integrates with Wave-B 11.6 acceptance-harness test. |
| WC-M2.20 | OmniPanel has NO M2 visualisation — only dispatch-trace entries for M2 runtime monitoring (subscription latency, Klein-flip event counts, Vimarśa bus pending markers) | M2-ARCHITECTURE §8.2 "OmniPanel (right sidebar): NO M2 visualisation. The OmniPanel hosts Pi/Anima/subagent surfaces. M2 runtime monitoring renders as dispatch-trace entries." | OmniPanel observability is wired via the kernel-bridge `subscribeObservability`; `m2.meaning_packet`, `m2.routing_trace`, `m2.klein_flip` events declared at `index.ts:17`. | OmniPanel-side rendering is OmniPanel-owned (closing 15.x / 11.x). M2 widget contract is "emit events; never render in OmniPanel". | **ALIGNED** — no closing tranche owed; integration verified at 11.x OmniPanel side. |
| WC-M2.21 | Accessibility: pause / scrub-to-tick affordance for the cymatic surface; deterministic replay from `(audio_octet, nodal_quartet, surface_geometry)` snapshot; no audio output | M2-ARCHITECTURE §8.6 accessibility contract: "The cymatic surface accepts a `pause` (freeze χ field at current snapshot) and `scrub_to_tick(t)` affordance (deterministic replay of the bus state at tick t)" | `renderM2CymaticFrame` is deterministic; pause/scrub controls absent from frontend. | Controls (`CymaticTransport.tsx`) wrap the Layer C renderer; consume the deterministic replay primitive. | **SPEC-AHEAD** — closing 23.16 lands the pause/scrub affordance + visual-regression replay deterministic for tick-quantised states. |
| WC-M2.22 | Cymatic deterministic test: identical `(audio_octet, nodal_quartet, address72)` → identical `wavePoints` (M2-ARCHITECTURE §10 test 6) | Test scaffold: `pnpm --filter @pratibimba/m2-parashakti test:cymatic-determinism` | `buildStandingWavePoints` already deterministic (no `Math.random`, no Date-derived inputs). No test file present at `Body/M/epi-theia/extensions/m2-parashakti/test/`. | The determinism test verifies the deterministic-stylised CPU reference at Tranche 15.12 visual-regression harness. | **SPEC-AHEAD** — closing 23.17 adds the test file + binds to 15.12 visual-regression harness for the cymatic surface. |

---

## Anomalies

### CONTRADICTIONS (downstream → wave-A/19 ratified)

- **DR-WC-M2-1** (downstream of DR-M2-2, ratified at M2-ARCHITECTURE §2.3 / Tranche 3.6-M2): TS-16 `m2.parashakti.correspondenceTree` widget keeps **ONE tree, six-axis filter** (NOT split into six trees). The two sonic overlays (mantra 100, asma 99+1) live as TABS within the tree (per the overlay-not-axis canon). Closing 23.5 implements this resolution directly — no further decision needed; flagged to confirm the Wave-B TS-16 dropdown route lands.
- **DR-WC-M2-2** (downstream of 19.10b): The Vibrational↔Psychoid surface MUST be a view-switcher on the same seven planets (Sun-Saturn for the L0'-aligned psychoid set; the three outer planets render psychoid-pending). Closing 23.6 implements; no new decision.

### CODE-PENDING (frontend gaps with named owners)

- **CP-WC-M2.01** Per-view widget classes for `cymaticEngine` + `correspondenceTree` (closing 23.1).
- **CP-WC-M2.02** `MefGrid72Component` 12×7 grid scaffold (closing 23.2).
- **CP-WC-M2.03** Six Layer B sacred-sonic cards (closing 23.3).
- **CP-WC-M2.04** `CymaticChladniSurface` (plate variant + composition mount-point for K² torus variant; spheres variant deferred) (closing 23.4 + 23.12).
- **CP-WC-M2.05** `CorrespondenceTreeWidget` six-axis filter + sonic-overlay tabs (closing 23.5).
- **CP-WC-M2.06** Vibrational↔Psychoid view-switcher (closing 23.6).
- **CP-WC-M2.07** 72-fold bridge inspector (closing 23.7).
- **CP-WC-M2.08** Epogdoon proof overlay + 9-tick bloom (closing 23.8).
- **CP-WC-M2.10** Outer-planet stubs with pending-dataset badge (closing 23.10).
- **CP-WC-M2.11** Shadow-decan surface (closing 23.11).
- **CP-WC-M2.13** Audio-bus visual representation (no audio out; closing 23.13).
- **CP-WC-M2.14** Per-card inline provenance + readiness taxonomy bindings (closing 23.14).
- **CP-WC-M2.15** Bimba/Pratibimba state persistence M2-side (closing 23.15).
- **CP-WC-M2.16** Cymatic transport pause/scrub (closing 23.16).
- **CP-WC-M2.17** Cymatic determinism test + visual-regression bind (closing 23.17).

### ORPHAN (no current owner — wave-C fills)

- **O-WC-M2.01** Composition mount-point API on M2 side for the integrated-1-2-3 plugin. M2-ARCHITECTURE test 16 names it; no extension surfaces it. Closing 23.12 lands it.
- **O-WC-M2.02** `kernelBridge.m0.psychoidPlanetary()` / `kernelBridge.m0.alchemicalToTattvic()` consumer-side typings (substrate is 19.10 plan; consumer typings live in `@pratibimba/kernel-bridge` and the M2 widget). Closing 23.6 (psychoid) + 23.3 (alchemical-tattvic) wire the consumer.

### ALIGNED (notes, no closing tranche)

- WC-M2.20 OmniPanel-no-M2 verified.
- Cl(4,2) signature colour-binary palette carried by 23.4 + 23.7; no separate widget.

---

## Proposed Cycle-3 Tranches (wave-C M2-frontend domain — id space `23.x`)

> All tranches obey anti-greenfield. Every component first-build is named explicitly because no Theia widget currently renders it; the substrate behind it is landed cycle-2 or cycle-3-substrate (waves A + B); the kernel-bridge boundary is honoured. Tranche file: `23-m2-parashakti-frontend-deep.md` — matches `15-ui-design-foundations.md` format.

### 23.1 — Per-view widget class registration (cymaticEngine + correspondenceTree)

- **Classification:** spec-ahead-integration
- **Owning spec:** M2-ARCHITECTURE §8.1
- **Inheritance:** `m2-parashakti/src/common/index.ts` declares all three view IDs; `frontend-module.ts` registers only one
- **Deliverable:** `M2CymaticEngineWidget` (ID `m2.parashakti.cymaticEngine`) + `M2CorrespondenceTreeWidget` (ID `m2.parashakti.correspondenceTree`) sibling React widgets to `M2ParashaktiWidget`, each subscribing the same `SharedBridgeAdapter` channels.
- **Verification:** `grep -n "M2CymaticEngineWidget\|M2CorrespondenceTreeWidget" Body/M/epi-theia/extensions/m2-parashakti/src/browser/`; widget-registry test asserts all three IDs.

### 23.2 — Layer A: 72-cell MEF matrix grid scaffold (12×7 with 12×6 active overlay)

- **Classification:** spec-ahead-integration
- **Owning spec:** M2-ARCHITECTURE §5.1
- **Inheritance:** `M2_MEF_DESC[72]` decoder lands at Tranche 3.3-M2 via `kernelBridge.m2.decodeAxisAt('mef', address72)`; `profile.lens_mode.{lens,mode}` + `helix_bit` + `resonance72.lensAnchorIndex` on bus
- **Deliverable:** `MefGrid72Component` with row halo from `lens_mode.lens`, column trace from `lens_mode.mode`, helix-bit row halo-colour (warm 0-5 / cool 6-11), tritone-mirror arc connectors (paired-edge SVG between Lens N and Lens N+3 cells), active-cell halo from `audio_octet[0]` magnitude.
- **Verification:** `pnpm --filter @pratibimba/m2-parashakti test:mef-grid`; visual-regression hook in 23.17.

### 23.3 — Layer B: six sacred-sonic cards + alchemical-tattvic surface

- **Classification:** spec-ahead-integration
- **Owning spec:** M2-ARCHITECTURE §5.2
- **Inheritance:** `M2_DECAN_DESC[72]`, `M2_SHEM_DESC[72]`, `M2_MAQAM_DESC[72]`, `M2_MANTRA_LUT[100]`, `M2_ASMA_LUT[100]`, `M2_PLANET_LUT[10]` + 19.10c `ALCHEMICAL_TO_TATTVIC[6]`
- **Deliverable:** `DecanFaceCard`, `ShemPairCard`, `MaqamModeCard`, `MantraCard`, `AsmaCard`, `PlanetaryChakralCard` + `AlchemicalTattvicRow` sub-surface (with prima/ultima Möbius markers on Aether and Salt cells per 19.10c). Each card carries inline `M2ProvenanceHandle` badge.
- **Verification:** `pnpm --filter @pratibimba/m2-parashakti test:sacred-sonic-cards`; six-card render-test fixture.

### 23.4 — Layer C: CymaticChladniSurface (plate variant)

- **Classification:** spec-ahead-integration
- **Owning spec:** M2-ARCHITECTURE §5.3
- **Inheritance:** `buildStandingWavePoints` (deterministic CPU reference at `meaning-packet.ts:251-271`); `renderM2CymaticFrame` already enforces personal-Pratibimba scope-block
- **Deliverable:** `CymaticChladniSurface` SVG/Canvas renderer evaluating `χ(x, y) = Σ a_i sin(m_i π x / L) sin(n_i π y / L) + b_i cos(...) cos(...)` from `audio_octet × nodal_quartet × address72`; colour-binary palette (Akasha=violet / Vayu=cyan / Agni=vermilion / Apas=aquamarine / Prithvi=umber) keyed off `M2_PLANET_LUT[ruling_planet].elem_sig`; 72-cell projection overlay; Klein-flip self-fold 200ms transition driven by `klein_flip.flip_at_this_tick`.
- **Verification:** `pnpm --filter @pratibimba/m2-parashakti test:cymatic-plate`; deterministic-replay snapshot at fixed `(address72, audio_octet, nodal_quartet)`.

### 23.5 — CorrespondenceTreeWidget: six-axis filter + two sonic-overlay tabs

- **Classification:** spec-ahead-integration (resolves DR-WC-M2-1 / TS-16)
- **Owning spec:** M2-ARCHITECTURE §2.3 + DR-M2-2 ratified at Tranche 3.6-M2; TS-16 Wave-B
- **Inheritance:** `M2AddressView` enum (split into `'shem'` + `'asma'` from Tranche 3.6-M2); six axes + two overlay tabs + planetary-keying surface
- **Deliverable:** ONE tree with axis-filter chips: MEF·QL / tattva-phase / decan-face / Shem / maqam / DET-projection + two TABs for mantra (100) + Asma (99+1) sonic overlays + planetary-keying side panel. Honours TS-16 resolution: one tree, axis filter, NOT split.
- **Verification:** `pnpm --filter @pratibimba/m2-parashakti test:correspondence-tree-six-axis`; chip-filter integration test.

### 23.6 — Vibrational↔Psychoid view-switcher (per 19.10b)

- **Classification:** spec-ahead-integration (resolves DR-WC-M2-2 / 19.10b)
- **Owning spec:** 19.10b PSYCHOID_PLANETARY_CORRESPONDENCE[7] + M2-ARCHITECTURE §2.4 PLANET_LUT[10]
- **Inheritance:** Both LUTs land at 19.10 (cycle-3 substrate); kernel-bridge consumers in `@pratibimba/kernel-bridge`
- **Deliverable:** `PlanetaryViewModeSwitch` toggle (Vibrational | Psychoid) on the planetary-chakral card; Vibrational mode reads Cousto Hz + chakra + DR from `M2_PLANET_LUT[10]`; Psychoid mode reads Jung-Pauli archetypal-meaning from `PSYCHOID_PLANETARY_CORRESPONDENCE[7]`. Outer planets (Uranus/Neptune/Pluto) flag `pending-psychoid-outer-planet` in psychoid mode (per 19.10b "Outer planets belong to M2-5 transpersonal extension; not in this LUT").
- **Verification:** `pnpm --filter @pratibimba/m2-parashakti test:planetary-view-switch`; both readings render same seven planets without collapse.

### 23.7 — 72-fold bridge inspector (hexagram → half-decan → decan → planet → chakra → body-zone)

- **Classification:** spec-ahead-integration; cross-link Tracks 03, 05, 19
- **Owning spec:** CLAUDE.md §M2 canon "72-fold bridge canonical Spec 11"; M2-ARCHITECTURE §2.4 + medicine LUT sharing with `nara::medicine`
- **Inheritance:** `parashakti_meaning.routing_trace` from Tranche 3.2-M2 F_routing carrier; medicine LUTs (CHAKRA_BODY_ZONES[8], DECAN_BODY_PARTS[36], PLANET_CHAKRA) per MEMORY note
- **Deliverable:** `SeventyTwoFoldBreadcrumb` component rendering the full chain as a left-to-right glyph breadcrumb with per-step provenance and Cl(4,2) signature colour-binary. Crosses M3 (hexagram side from `mahamaya.m2VibrationIndex`) and M4 (chakra + body-zone via `nara::medicine` LUTs).
- **Verification:** `pnpm --filter @pratibimba/m2-parashakti test:bridge-72-fold`; chain integrity test asserts 6-step breadcrumb for any address72 ∈ [0, 71].

### 23.8 — 9:8 Epogdoon proof overlay + 9-tick bloom

- **Classification:** spec-ahead-integration
- **Owning spec:** M2-ARCHITECTURE §5.4 + §6.6 "The 9:8 epogdoon as a visible event"; the integer-arithmetic 9-cancellation `7/4 = (72−9)/36`
- **Inheritance:** `m2_epogdoon_compress` baked in m2.h; `profile.mahamaya.m2VibrationIndex` on bus; tick counter from kernel-bridge profile subscription
- **Deliverable:** `EpogdoonProofOverlay` toggle (developer/proof mode, parallel pattern to 15.8 raw/DR proof overlay on M1 vortex matrices) rendering `7/4 = (72−9)/36` as integer identity; 9-tick compression-pulse warm-amber bloom on the DET card every `tick_counter % 9 == 0`.
- **Verification:** `pnpm --filter @pratibimba/m2-parashakti test:epogdoon-proof`; bloom timing test asserts 9-tick cadence.

### 23.9 — Cymatic spheres (chakras) variant — deferred named surface

- **Classification:** spec-ahead-integration (deferred to composition closure)
- **Owning spec:** M2-ARCHITECTURE §5.3.2 "Spheres (chakras)"
- **Inheritance:** `M2_CHAKRA_LUT[8]` in m2.h; UX §8.1 solar-system anchor view
- **Deliverable:** `CymaticSpheresSurface` (8 concentric spheres + spherical-harmonic modes) as a composition contribution to the daily-0-1 cosmic-side anchor view. Substrate complete; renderer-side variant of 23.4.
- **Verification:** named integration carrier; not gated on cycle-3 unless promoted (parallel to Tranche 3.7-M2 music-tech deferral).

### 23.10 — Three outer-planet (Uranus/Neptune/Pluto) stubs with pending-dataset badge

- **Classification:** code-pending-closure
- **Owning spec:** M2-ARCHITECTURE §2.4 PLANET_LUT[10] rows 7-9 + dataset gap noted in CLAUDE.md M2 canon
- **Inheritance:** `M2_PLANET_LUT[10]` complete in `.rodata`; parashakti-deep dataset missing graph nodes at #2-5-8/9/10
- **Deliverable:** Outer-planet rendering on the planetary card surfaces Cousto Hz / DR / chakra from `.rodata` directly; flags `s2.outerPlanetGraphNode: 'pending-dataset-2-5-8-9-10'` as a per-card pending badge per 15.6 inline provenance.
- **Verification:** `grep -n "pending-dataset-2-5-8\|outerPlanetGraphNode" Body/M/epi-theia/extensions/m2-parashakti/src/`; outer-planet card test asserts pending-status visible + rodata-rendering present.

### 23.11 — Shadow-decan surface (108 = 36 × 3)

- **Classification:** code-pending-closure
- **Owning spec:** CLAUDE.md M2 canon "Shadow decans: #2-3 is primary source, #3-4 reversedMeaning is tarot expression"; M2-ARCHITECTURE §2.2
- **Inheritance:** `M2_DECAN_DESC[72]` carries 72 faces (36 light + 36 shadow); third (shadow proper) face at #2-3 graph dataset
- **Deliverable:** `ShadowDecanSurface` consumes `M2_DECAN_DESC[72]` (light/shadow face) + S2-graph extension at `coordinate: '#2-3'`; gracefully flags `pending-shadow-decan-graph` if S2 path missing. Reversed-tarot meaning at `coordinate: '#3-4'` is M3'-owned cross-reference.
- **Verification:** `pnpm --filter @pratibimba/m2-parashakti test:shadow-decan`; flag-on-gap test passes.

### 23.12 — Composition mount-point: M2 cymatic on K² torus surface (per 15.4)

- **Classification:** spec-ahead-integration (closes O-WC-M2.01); cross-link Tranches 07, 15.4
- **Owning spec:** 15.4 composition contract + M2-ARCHITECTURE §7.6 "Composition with integrated-1-2-3 cosmic engine"; M2-ARCHITECTURE Test 16 names `composition-mount-point` API
- **Inheritance:** `M2CymaticMiniView` compact export (cycle-2 T0 landed); `m1-paramasiva-played-torus` Bevy/wgpu renderer engine (DR-M1-2)
- **Deliverable:** M2 exposes a typed `compositionMountPoint: M2CymaticTextureContribution` API at `m2-parashakti/src/common/composition.ts` carrying `{ chladniField: number[], colourBinary: ColourBinaryPalette, heatmap72: number[], surfaceVariant: 'torus' }`. Integrated-1-2-3 plugin consumes via `import { M2CymaticTextureContribution } from '@pratibimba/m2-parashakti/common/composition'`. The played-torus engine renders the texture; M2 contributes the data shape only (no Bevy import).
- **Verification:** `grep -n "compositionMountPoint\|cymatic-mount\|M2CymaticTextureContribution" Body/M/epi-theia/extensions/plugin-integrated-1-2-3/src/`; composition-contract preflight test extended to assert M2's mount-point participation.

### 23.13 — Audio-bus visual representation (NO sound output)

- **Classification:** code-pending-closure (deferred audio bridge per 3.7-M2)
- **Owning spec:** M2-ARCHITECTURE §8.6 audio-safety
- **Inheritance:** `audio_octet[8]` on profile bus; deferred MIDI 2.0 / MPE / MTS-ESP adapter (Tranche 3.7-M2)
- **Deliverable:** `AudioBusVisualiser` renders the 8-channel bus as a stacked frequency-bar (Hz numeric + band glyph), 144→432 Hz scale alignment, mantra-Matrika/Malini phase indicator. NO oscillator. NO Web Audio API. NO `<audio>` element. Names the deferred music-tech bridge as the audio surface.
- **Verification:** `! grep -rn "new AudioContext\|<audio\|new Audio(\|new Oscillator\|OscillatorNode\|getUserMedia" Body/M/epi-theia/extensions/m2-parashakti/src/`; visual-only render test.

### 23.14 — Per-card inline provenance + readiness taxonomy bindings (Tranche 15.6 consumer)

- **Classification:** spec-ahead-integration; consumes 15.6 + readiness taxonomy
- **Owning spec:** M2-ARCHITECTURE §8.4 + Tranche 15.6 inline provenance + `07-t0-extension-contract-preflight.json:59-109` readiness taxonomy
- **Inheritance:** `M2ProvenanceHandle` shape; `MExtensionReadinessSnapshot` + 9 readiness ids
- **Deliverable:** Every Layer B card + every breadcrumb-step + every grid-cell surfaces `ProvenanceBadge` (variant per 9-id taxonomy: `ready_public_current` green; `degraded_public_readonly` muted-green; `profile_missing_field`/`s2_graph_blocked`/`s3_subscription_blocked` amber; `m4_privacy_blocked`/`privacy_blocked` blue; `bridge_unavailable`/`s5_review_blocked` red). NO separate "errors" panel.
- **Verification:** `pnpm --filter @pratibimba/m2-parashakti test:provenance-inline`; per-card render-test asserts badge present + variant matches snapshot.

### 23.15 — Bimba/Pratibimba state persistence M2-side (Tranche 15.7 consumer)

- **Classification:** spec-ahead-integration; consumes 15.7
- **Owning spec:** M2-ARCHITECTURE §8.5; Tranche 15.7 `BimbaPratibimbaUiState`
- **Inheritance:** kernel-bridge DI singletons; `pratibimba-layouts` + `omnipanel-runtime`
- **Deliverable:** M2 widget state-extraction selector publishing `(profileGeneration, lens_mode, tick12, position6, address72, klein_flip.surface_valence, layer_a_active_cell, layer_b_card_scroll, layer_c_surface_variant, layer_c_zoom, last_routing_trace)` into the typed `BimbaPratibimbaUiState`. Survives 0/1 + layout toggles per DR-TS-1.
- **Verification:** 11.6 acceptance-harness assertion extended to cover the 11 M2-side state fields; `pnpm --filter @pratibimba/acceptance-harness test:m2-state-persistence`.

### 23.16 — Cymatic transport: pause + scrub-to-tick (accessibility)

- **Classification:** spec-ahead-integration
- **Owning spec:** M2-ARCHITECTURE §8.6 + Tranche 15.6 profile-tick clock
- **Inheritance:** Deterministic `buildStandingWavePoints` (pure function of `(audio_octet, nodal_quartet, address72)`); tick history from kernel-bridge profile subscription
- **Deliverable:** `CymaticTransport` toolbar above `CymaticChladniSurface` with pause + scrub-to-tick + tick-snapshot scrub bar. Replays bus state deterministically at past tick (requires tick-indexed profile snapshot cache from kernel-bridge — closing 23.16 inherits if cache exists, otherwise names the cache as out-of-scope dependency).
- **Verification:** `pnpm --filter @pratibimba/m2-parashakti test:cymatic-transport`; deterministic-scrub test asserts identical wave at tick N before and after pause.

### 23.17 — Cymatic-determinism test + visual-regression harness binding

- **Classification:** spec-ahead-integration
- **Owning spec:** M2-ARCHITECTURE §10 test 6 cymatic-determinism + Tranche 15.12 visual-regression harness
- **Inheritance:** `pnpm --filter @pratibimba/m2-parashakti test:cymatic-determinism` named at M2-ARCHITECTURE Test 6 (file absent); `acceptance-harness/fixtures/visual-regression/` baseline storage per 15.12
- **Deliverable:** `Body/M/epi-theia/extensions/m2-parashakti/test/cymatic-determinism.test.mjs` asserts identical `wavePoints` for identical inputs; baseline image stored at `acceptance-harness/fixtures/visual-regression/m2-cymatic-plate-tick-{0..11}.png`; per-Klein-flip-boundary baseline at `m2-cymatic-klein-flip-boundary.png`.
- **Verification:** `pnpm --filter @pratibimba/m2-parashakti test:cymatic-determinism && pnpm --filter @pratibimba/acceptance-harness test:visual -- --suite m2-parashakti`.

---

## Notes for the controller

- **Anti-greenfield posture is honoured throughout.** Every per-axis decode goes through the kernel-bridge (Tranche 3.3-M2 axis-decoder method). No m2.h LUT data ever reaches the M2 widget via `import`; data crosses through the SharedBridgeAdapter only.
- **Composition contract.** Closing 23.12 lands the typed `M2CymaticTextureContribution` mount-point; the Bevy/wgpu played-torus engine (DR-M1-2; `m1-paramasiva-played-torus`) renders the texture. M2 owns the data, M1' owns the surface, M3 codon-rotation overlays the cells per 15.4 composition-over-juxtaposition.
- **Privacy class is honoured.** `personal-pratibimba` scope blocks on every cymatic render; the M2' extension never renders this register — the M4' Nara extension is the only caller of `renderM2CymaticFrame({ scope: 'protected-m4' })`.
- **OmniPanel has no M2 visualisation** — verified at WC-M2.20; closing 23.14 emits `m2.meaning_packet` + `m2.routing_trace` + `m2.klein_flip` observability events that OmniPanel renders as dispatch-trace entries only.
- **Cross-wave handoffs:** wave-A 3.1 (klein_flip) unblocks Layer A halo + Klein-flip self-fold; wave-A 3.2 (F_routing) unblocks Layer B routing cards + 72-fold bridge inspector; wave-A 3.3 (per-axis decoder) unblocks Layer A LUT-resolved glyphs + correspondence-tree filters; wave-A 3.4 (S2 adapter) unblocks Layer B provenance handles + shadow-decan graph; wave-A 3.5 (DCC-03) ratifies the Earth-as-10th-planet semantics rendered on the planetary card; wave-A 3.6 (six-axes canon) splits `shem-asma` → `shem` + `asma`. Wave-B 11.6 + 15.12 bind the acceptance-harness + visual-regression test surfaces.
- **19.10 cross-link:** 19.10a (`M0_M2_ZODIACAL_BRIDGE[12]`) wires zodiacal sign → first-decan-idx-72 traversal feeding the breadcrumb (23.7); 19.10b (`PSYCHOID_PLANETARY_CORRESPONDENCE[7]`) wires the psychoid view-mode (23.6); 19.10c (`ALCHEMICAL_TO_TATTVIC[6]`) wires the prima/ultima Möbius element-throughline on the decan-face card (23.3).
- **Deferred-named (not greenfield-built):** 23.9 spheres-variant, 23.13 named-but-no-audio-bridge, Tranche 3.7-M2 music-tech bridge.

**End of matrix.** Substrate is largely complete (LUTs, Vimarśa kernel, packet builder, deterministic Chladni reference, scope-block enforcement, contract preflight). The genuine cycle-3 wave-C frontend work is the **three-layer deep-design build** (23.2 + 23.3 + 23.4) + the **correspondence-tree axis filter** (23.5) + the **composition mount-point** for the K² torus (23.12) + the **inline-provenance contract consumer** (23.14). Everything else is bound to wave-A/B substrate landings or wave-19 dataset bridges.
