# `m1-paramasiva-played-torus` — Extension Architecture

**Status:** scaffold (DR-M1-2 ratified 2026-06-02; build pending under Tranche 02.6)
**Renderer:** Bevy + wgpu (3D)
**Companion 2D extension:** `Body/M/epi-theia/extensions/m1-paramasiva/` (clock-instrument; this extension is the 3D play surface, distinct)

This is the IDE-side mirror of the canonical M1-2 architecture document at [`Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md`](../../../../../Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md). The full substrate map, profile-bus contract, visual rendering contract, tick choreography, and anti-greenfield audit live there. This file states the extension's IDE-specific obligations: package shape, contract version, contributions, integration with the kernel-bridge readiness ledger, and the acceptance criteria the build will be verified against.

## Contract Version

`2026-06-02.15-M1-2-vortex` — paired with cycle-3 tranches 02.6, 10.10, 15.4, 15.8, 15.9.

## Package Shape (expected)

```
Body/M/epi-theia/extensions/m1-paramasiva-played-torus/
├── ARCHITECTURE.md             # this file
├── package.json                # @pratibimba/m1-paramasiva-played-torus, Bevy/wgpu toolchain
├── README.md                   # brief; points at ARCHITECTURE.md
├── src/
│   ├── common/
│   │   ├── played-torus-surface.ts    # extension surface contract (TS)
│   │   ├── vortex-renderer-handle.ts  # opaque handle into the wgpu renderer
│   │   └── index.ts
│   └── browser/
│       ├── played-torus-widget.tsx    # widget host; embeds the wgpu canvas
│       └── played-torus-frontend-module.ts
├── wgpu/
│   ├── Cargo.toml              # Rust crate for the Bevy/wgpu renderer
│   ├── src/
│   │   ├── lib.rs              # entrypoint, profile-tick subscriber
│   │   ├── k2_mesh.rs          # K² mesh + texture parameterisation
│   │   ├── ananda_heatmap.rs   # the 12×12 cell heatmap on the torus surface
│   │   ├── dr_streamlines.rs   # gold/emerald flow-streamlines
│   │   ├── cl42_colour.rs      # Cl(4,2) signature → colour mapping
│   │   ├── hopf_shadow.rs      # the 30% opacity concentric shadow torus
│   │   ├── diamond_centre.rs   # the octahedron at the torus centre
│   │   └── tick_choreography.rs # quat_slerp + boundary events
│   └── shaders/
│       ├── k2_surface.wgsl
│       ├── ananda_heatmap.wgsl
│       ├── streamlines.wgsl
│       └── cl42_halo.wgsl
└── style/
    └── played-torus.css
```

## Contributions

- **Widget:** `pratibimba.m1.paramasiva.played-torus` — editor-area widget hostable in `daily-0-1` cosmic-side composition (Tranche 07) and `ide-deep` `m1-paramasiva` view (Tranche 02.6)
- **Profile subscriber:** subscribes to `kernel-bridge` profile-tick events; consumes `MathemeHarmonicProfile.ananda_vortex` (Tranche 10.10 field)
- **Capability:** `KernelBridgeAPI` capability `m1.paramasiva.playedTorus.read` (per `contracts/07-t0-extension-contract-preflight.json`)
- **Forbidden-direct-imports:** the standard 10-entry list per `07-t0`

## Profile-Field Consumption

| Field | Source | Use |
|---|---|---|
| `MathemeHarmonicProfile.ananda_vortex.active_matrix_op` | Tranche 10.10 | Drives perspex cross-fade across six matrices |
| `.active_cell` | Tranche 10.10 | Drives luminous cell jump |
| `.dr_ring_phase` | Tranche 10.10 | Drives gold/emerald streamline advance |
| `.cl42_signature_at_position` | Tranche 10.10 | Drives halo colour-binary |
| `.ring_quaternion` | Tranche 10.10 | Source for `quat_slerp` K² orientation |
| `.helix_sheet` | Tranche 10.10 | Hopf shadow sheet toggle |
| `.klein_flip_at_this_tick` | Tranche 10.10 | Triggers self-interpenetration animation |
| `MathemeHarmonicProfile.audio_octet[8]` | Vimarśa (M2-1') | 8 particle emitters around diamond — **window contract** |
| `MathemeHarmonicProfile.nodal_quartet[4]` | Vimarśa (M2-1') | 4 S² satellite glyphs orbiting diamond — **window contract** |
| `MathemeHarmonicProfile.lens_mode` | kernel.rs:363 | Chromatic-substrate hue retune on change |

## Readiness Behaviour (Tranche 15.6 inline provenance)

When `ananda_vortex` is missing (pre-Tranche 10.10) or pending:

- K² mesh renders
- Six perspex matrix layers render as blocked-overlay (translucent grey, no heatmap)
- Streamlines do not render
- Halo colours render at neutral
- `pending-ananda-vortex` provenance badge visible in widget chrome with reason
- No silent degradation; no animation fallback to local LUT lookup

When `audio_octet` is missing:

- Particle emitters render as ghost outlines with `pending-audio-octet` badge

When `klein_flip_state` is missing (pre-Tranche 02.2 / 10.2):

- Klein-flip self-interpenetration does not fire at tick 5→6
- `pending-klein-flip` badge visible

## State Persistence (Tranche 15.7)

Survives `daily-0-1` ↔ `ide-deep` toggle and 0/1 cosmic/personal switch:

- `(tick12, position6, lens_mode, active_matrix_op)`
- K² orientation (resumes mid-slerp at the same `degree720`)
- Session key + day-now anchor
- Profile generation

Per the kernel-bridge DI singleton contract at `pratibimba-layouts/src/common/layout-types.ts:7-12`.

## Acceptance Tests

12 acceptance tests per the architecture doc §10. Verification commands:

```bash
# Extension presence
test -d Body/M/epi-theia/extensions/m1-paramasiva-played-torus
test -f Body/M/epi-theia/extensions/m1-paramasiva-played-torus/package.json
test -f Body/M/epi-theia/extensions/m1-paramasiva-played-torus/ARCHITECTURE.md

# Toolchain declaration
grep -nE '"bevy"|"wgpu"' Body/M/epi-theia/extensions/m1-paramasiva-played-torus/wgpu/Cargo.toml

# Boundary audit (no T²_Mahāmāya)
! grep -rn 'T2_Mahamaya\|double_torus\|T2_Mahamāyā\|m3_torus_outer' \
    Body/M/epi-theia/extensions/m1-paramasiva-played-torus/wgpu/src/ \
    Body/M/epi-theia/extensions/m1-paramasiva-played-torus/src/

# Vimarśa-window audit (no local pitch synthesis)
! grep -rn 'synthesise\|local_pitch\|computeHz\|deriveOctet' \
    Body/M/epi-theia/extensions/m1-paramasiva-played-torus/

# Substrate-derivation audit (no local LUT forks)
! grep -rn 'RING_QUATERNION_LUT\s*=\|CL42_BASIS\s*=\|DR_RING_MAHAMAYA\s*=' \
    Body/M/epi-theia/extensions/m1-paramasiva-played-torus/wgpu/src/ \
    Body/M/epi-theia/extensions/m1-paramasiva-played-torus/src/

# Tests
cd Body/M/epi-theia/extensions/m1-paramasiva-played-torus/wgpu \
  && cargo check && cargo test --test render_acceptance
pnpm --filter @pratibimba/m1-paramasiva-played-torus test
```

## Composition with the Integrated 1-2-3 Plugin (Tranche 07)

- **The played-torus is the M1 pole** of the cosmic-1-2-3 editor-area composition
- M2 (cymatic engine) renders frequencies **on the K² surface** — not in a separate pane
- M3 (codon-rotation) lights cells **on the lens-ring** of the K² torus — not in a separate pane
- The composition contract at `Body/M/epi-theia/extensions/integrated-composition/src/common/composition-pattern.md` (Tranche 15.4) governs how the three poles merge geometrically; this extension exposes a `composition-mount-point` API for the integrated plugin to attach M2/M3 contributions.

## OmniPanel (`/` operator membrane)

The played-torus does NOT appear in the OmniPanel right-sidebar. The OmniPanel hosts Pi/Anima/subagent surfaces; the played-torus is an editor-area widget. Pi monitoring of the played-torus runtime (subscription latency, slerp drift, profile-field consumption) renders as dispatch-trace entries in the OmniPanel, not as a played-torus visual.

## Build Order (subordinate to cycle-3 m-dev sequence)

1. Tranche 10.10 lands `ananda_vortex` on `MathemeHarmonicProfile` (kernel-side)
2. Tranche 02.6 creates this directory + `package.json` + Bevy/wgpu toolchain
3. Tranche 15.8 implements the visual rendering contract (K² + heatmap + streamlines + Cl(4,2) + Hopf shadow + diamond)
4. Tranche 15.9 implements the tick choreography (`quat_slerp` + boundary events)
5. Tranche 07.3 integrates M2/M3 mount-points via integrated-composition contract
6. Tranche 15.12 produces frame-by-frame visual-regression baselines

## Authority

This file is the IDE-side contract; the M1-2 architecture document at `Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md` is the substrate-side authority. Where they disagree, the architecture document is authoritative for substrate consumption; this file is authoritative for Theia extension shape and contribution semantics.
