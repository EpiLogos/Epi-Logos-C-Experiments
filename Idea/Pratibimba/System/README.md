# Pratibimba System

This directory is the vault-side M' residency plane: the reflected system image, subsystem specs, operator notes, and future portal-domain seeds. It is not the active source-code home for runtime packages.

Executable code belongs in `Body/`. This vault tree holds the meaning and design homes that let the code stay coordinate-native.

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
