# Pratibimba System

This directory holds **two distinct things** after Track 05 T1:

1. **The Theia IDE surface** (`theia-app/` + `extensions/` + `shared/` + `docs/` + `scripts/`) — the in-tree `/pratibimba/system` M5-3 IDE host. Real Theia 1.56 browser-mode application with the foundational `kernel-bridge-readiness` extension. See [`docs/`](./docs/) for naming, dependency, and publishing model. Run `./scripts/smoke-build.sh` to verify the browser bundle builds.
2. **The M' subsystem residency plane** (`Subsystems/`) — vault-side reflected system image, subsystem specs, operator notes, and portal-domain seeds. Below.

The IDE surface is the active executable home for M5-3; the residency plane below is the meaning-side reflected image. They coexist because `/pratibimba/system` is canonically *both* the deep IDE shell AND the reflected vault — the C5 (Pratibimba) coordinate is necessarily a doubled surface.

## M' Subsystem Homes

The active M' domains are staged under `Subsystems/`:

| M' home | Subsystem | Runtime expression |
|---|---|---|
| `Subsystems/Paramasiva` | mathematical generativity, tick, quaternionic kernel | `Body/S/S0/epi-lib`, `Body/S/S0/portal-core` |
| `Subsystems/Parashakti` | 72-fold resonance, graph/lens training substrate | `Body/S/S2/graph-*`, future kernel resonance ingestion |
| `Subsystems/Mahamaya` | 64-fold codon/clock/transcription expression | `Body/S/S0/epi-lib`, `Body/S/S0/portal-core`, future Tauri visual engine |
| `Subsystems/Nara` | personal/user traversal voice and M4' modalities | `Body/S/S0/epi-cli/src/nara`, future `Body/M/epi-tauri` |
| `Subsystems/epii` | Epii return, review, autoresearch, epi-logos plugin | `Body/S/S5/*` |
| `Subsystems/Anuttara` | verifier, constraints, symbolic coordinate diagnostics | `Body/S/S0/epi-lib`, `Body/S/S2/graph-services`, future verifier crate |

The Epi-Logos kernel belongs to the QL/MEF meta-layer that runs through these domains. Its first executable body is the C/Rust kernel math in `Body/S/S0`, while this M' tree records how that computation becomes subsystem face, breath, rhythm, and interface.

## Copy Policy

- Do not copy legacy `node_modules`, `dist`, `coverage`, `test-results`, or legacy test suites into this repo.
- Install dependencies fresh inside each package when working in this checkout.
- Keep runtime path resolution repo-local or environment-driven. Do not reintroduce hard-coded legacy absolute paths.
- Keep this tree mostly markdown/spec/reflection. Source packages, generated bundles, and executable subsystem code belong under `Body/`.
