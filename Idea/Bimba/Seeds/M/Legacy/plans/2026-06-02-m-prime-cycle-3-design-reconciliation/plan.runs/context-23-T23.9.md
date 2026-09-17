# M-Dev Context Pack - 23.T23.9

Generated: 2026-07-19T16:11:19.670Z

## Task

- **ID:** 23.T23.9
- **Title:** Cymatic spheres (chakras) variant — full solar-chakral surface
- **Track:** 23-m2-parashakti-frontend-deep.md
- **Computed status:** waiting
- **Write scopes:** Body/M/pratibimba-app

## Active Development Context

- **Day:** 19-07-2026
- **Session:** 20260719-000500-codex-t225
- **NOW:** Idea/Empty/Present/19-07-2026/20260719-000500-codex-t225/now.md (present)
- **Daily note:** Idea/Empty/Present/19-07-2026/daily-note.md (missing)

## Required Reading

Read these before implementation. Do not rely on the tranche summary alone.

- `Body/M/pratibimba-app`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/11-open-architectural-decisions.md`
- `Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/23-m2-parashakti-frontend-deep.md`

## Dependency Context

- 23.T23.8 - 9:8 Epogdoon proof overlay + 9-tick bloom (23-m2-parashakti-frontend-deep.md)

## Track Source Specs

_No Source Specs section found in the track file. Pause and gather source context manually before implementation._

## Task Body

9. **23.9 — Cymatic spheres (chakras) variant — full solar-chakral surface** *(implementation; consumes M2-ARCHITECTURE §5.3.2 + DR-M2-1/DCC-03)*

   Implement the third Layer C variant, `CymaticSpheresSurface`, in the active `Body/M/pratibimba-app` carrier. It renders **eight concentric chakra spheres** with spherical-harmonic modes per layer as the daily-0-1 cosmic-side solar-system anchor view required by [[M2-ARCHITECTURE]] §5.3.2. The composition places the chakra spheres around the Earth-Sun pair and between Earth and the active planetary-hour ruler from the typed profile/gateway projection.

   The renderer consumes the canonical substrate rather than reproducing it locally: the eight chakra identities arrive from the owning `M2_CHAKRA_LUT[8]` projection, the active planet and Earth-observer semantics arrive from `M2_PLANET_LUT[10]` / [[DR-M2-1]], and the live profile generation remains the only render-update clock. The implementation must add the typed bridge/profile field needed to identify the active planetary-hour ruler if the existing active-carrier envelope does not yet supply it. No browser LUT, fabricated planet, synthetic chakra assignment, static placeholder, or timer is permitted.

   The surface belongs in the active composition geometry, not the frozen `epi-theia` warehouse. It must expose the persisted `layerCSurfaceVariant: 'spheres'` selection through the real M2 surface switcher, retain the existing plate and torus behaviours, and use the repository's established 3D rendering stack for the scene. A unavailable or malformed kernel projection renders an explicit blocked/pending provenance state; it must not silently fall back to the plate.

   Verification: (a) real gateway/profile test proves the active planet, Earth-observer centre, and eight canonical chakra rows reach the renderer through the typed boundary; (b) unit/component tests prove all eight spheres mount, selection persists, profile-generation changes update the surface, and blocked data is honest; (c) Playwright drives the active carrier against a spawned real gateway and asserts the spheres scene is nonblank, correctly framed, responsive to a generation advance, and selects the kernel-routed active planet; (d) visual/screenshot checks cover desktop and mobile without overlap. Update the live-wire projection manifest and gateway-method ratchet for every additive profile field or gateway method.

   **Correction (2026-07-19):** prior execution text that reduced this canonical surface to a `deferred-23.9` pending tile was not supported by [[M2-ARCHITECTURE]] or a user-validated decision. It is superseded by this implementation requirement; the pending tile cannot close this tranche.

## Track Open Decisions

_No track-specific Open Decisions section found._

## Decision Register Excerpt

_No decision register found._

## Execution Guidance

- Default to in-session execution unless the user explicitly requested subagents for this run.
- If subagents are used, give each subagent this context pack plus the exact source files it must read.
- Before editing code, verify the relevant source/spec files above have actually been read or searched for the sections cited in the plan.
- Verification must exercise real functionality; mock-only or placeholder proof does not satisfy the ledger.
