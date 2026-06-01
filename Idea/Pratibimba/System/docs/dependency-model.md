# Dependency Model

How extensions and integrated plugins depend on each other and on the foundational kernel-bridge.

## Layered model

```
┌──────────────────────────────────────────────────────────────────┐
│ Track 08 — Integrated plugins                                    │
│   @pratibimba/plugin-integrated-1-2-3   (m1+m2+m3 composition)   │
│   @pratibimba/plugin-integrated-4-5-0   (m4+m5+m0 composition)   │
└──────────────────────────────────────────────────────────────────┘
                              ▲
                              │ consumes
                              │
┌──────────────────────────────────────────────────────────────────┐
│ Track 07 — Individual M-extensions                               │
│   @pratibimba/m0-anuttara  @pratibimba/m3-mahamaya               │
│   @pratibimba/m1-paramasiva @pratibimba/m4-nara                  │
│   @pratibimba/m2-parashakti @pratibimba/m5-epii                  │
└──────────────────────────────────────────────────────────────────┘
                              ▲
                              │ consumes
                              │
┌──────────────────────────────────────────────────────────────────┐
│ Track 05 / Track 01 — Foundation                                 │
│   @pratibimba/kernel-bridge-readiness                            │
│   (eventually) @pratibimba/kernel-bridge (Track 01 T5 package)   │
└──────────────────────────────────────────────────────────────────┘
                              ▲
                              │ wraps
                              │
┌──────────────────────────────────────────────────────────────────┐
│ epi gate (S3 gateway) → S0/S2/S3/S5 (Body/)                      │
└──────────────────────────────────────────────────────────────────┘
```

## Rules

1. Every package depends on `@theia/core` and its required Theia siblings (`@theia/editor`, `@theia/filesystem`, etc.).
2. Foundation packages depend on **no other `@pratibimba/*` package**.
3. Individual M-extensions depend on foundation packages and on the eventual `@pratibimba/kernel-bridge` (Track 01 T5). They do NOT depend on each other.
4. Integrated plugins depend on the individual extensions they compose, plus the shared composition contract (`Idea/Pratibimba/System/shared`).
5. No extension depends on another extension's `lib/browser/*` directly; they communicate through shared interfaces in `@pratibimba/shared-*` packages or through the kernel-bridge.

## Theia compatibility

All packages pin the same `@theia/*` minor version. Bumping Theia is a coordinated workspace change. Current pin: **`1.56.0`**.

## Why 1.56

Theia 1.56.x is the most recent line at the time of Track 05 T0 with:

- Stable `@theia/core` `Widget` + `ReactWidget` APIs.
- Inversify 6.x compatibility.
- Node 20 / 22 support without ABI churn.
- Browser-mode default (no Electron preset required), aligning with ADR-05-001's recommended default.

Reassessment cadence: every quarter, or when Theia ships a breaking release that affects a contribution Track 07/08 needs.

## pnpm workspaces

The root `pnpm-workspace.yaml` lists `theia-app` and `extensions/*` as packages. Workspace deps use `workspace:*` syntax so pnpm links rather than fetching from a registry. Lockfile is `pnpm-lock.yaml` at the workspace root; `pnpm install --frozen-lockfile` MUST be reproducible from a clean clone.
