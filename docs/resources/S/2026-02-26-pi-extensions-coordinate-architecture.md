# PI Extensions Coordinate Architecture

**Date**: 2026-02-26
**Status**: Architectural Specification

---

## Overview

This document maps the coordinate system (S / S') to PI extensions, establishing the constitutional relationship between:
- **PI Agent Layer** (`.pi/extensions/`)
- **Epi-Claw Layer** (`extensions/ta-onta/`)
- **Ta-Onta Plugin Layer** (`extensions/ta-onta/domains/`)

---

## Paradigmatic Nature of S and S'

Both **S** and **S'** are **paradigmatic extensions** — they define the structural patterns that organize all capabilities within the system.

| Aspect | S (Unprimed) | S' (Primed) |
|--------|-------------|-------------|
| **Level** | Explicit | Implicate |
| **Nature** | Objective technologies | Philosophically augmented specifications |
| **What it provides** | Raw technical capabilities | QL/coordinate-aligned interpretations |
| **Relationship** | The base stack layers | The paradigm OVER the base |

**S** makes available the explicit technologies — the tools as they are.
**S'** provides the implicate framework — the technologies as they mean within our paradigm.

Together they form a **paradigmatic pair**: S is the explicit ground, S' is the implicate interpretation.

---

## The Three Runtime Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   PI AGENT LAYER       →  .pi/extensions/                       │
│   EPI-CLAW LAYER       →  extensions/ta-onta/                   │
│   TA-ONTA PLUGIN LAYER →  extensions/ta-onta/domains/           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Naming Convention

| Type | Convention | Example |
|------|------------|---------|
| **S parent** | `s/index.ts` | Parent of S0-S5 |
| **Sx parent** | `s/modules/{name}/index.ts` | `s/modules/terminal/index.ts` |
| **Sx module** | `s/modules/{name}/modules/{file}.ts` | `s/modules/terminal/modules/cli_tools.ts` |
| **S' parent** | `s_i/index.ts` | Parent of S0'-S5' |
| **Sx' parent** | `s_i/modules/{name}/index.ts` | `s_i/modules/ql_types/index.ts` |
| **Sx' module** | `s_i/modules/{name}/modules/{file}.ts` | `s_i/modules/ql_types/modules/coordinate_validator.ts` |

The `'i'` suffix denotes **inversion** — primed coordinates carry philosophical augmentation OVER the base technology.

---

## S / S' Extension Mapping

### S Layer (Unprimed) — Raw Technical Capabilities

| Coordinate | Parent Dir | Purpose |
|------------|------------|---------|
| **S0** | `s/modules/terminal/` | Additional CLI/TUI tools as primitives |
| **S1** | `s/modules/obsidian/` | Obsidian CLI as shared service + native developments |
| **S2** | `s/modules/graphdb/` | Neo4j + Redis as shared service |
| **S3** | `s/modules/harness/` | PI agent harness primitives (hooks, PAI guidance, learning pipeline) |
| **S4** | `s/modules/gateway/` | Epi-claw gateway/runtime, subagents, agent-teams, agent-chains |
| **S5** | `s/modules/external/` | Notion/external integrations (n8n, workflow builders) |

### S' Layer (Primed) — QL/Coordinate-Augmented

| Coordinate | Parent Dir | Purpose |
|------------|------------|---------|
| **S0'** | `s_i/modules/ql_types/` | QL types / coordinate validation |
| **S1'** | `s_i/modules/ql_obsidian/` | QL-aligned Obsidian: types, filesystem ops, frontmatter schema, canvas MOC dynamics, Bimba-Pratibimba S1'Cx forms, plugin handling, day/now handling |
| **S2'** | `s_i/modules/ql_graph/` | Neo4j schema for QL coordinates, Redis caching specifics, now dynamics |
| **S3'** | `s_i/modules/ta_onta/` | Ta-onta plugin loader (svabhāva — self-nature) |
| **S4'** | `s_i/modules/vak_system/` | VAK system dynamics, context frame invocation process |
| **S5'** | `s_i/modules/automations/` | Extensions running extended action/automation/integration, APIs going various directions |

---

## File Structure

```
.pi/extensions/                       (PI Agent Runtime Layer)
│
├── s/                                (S parent extension)
│   ├── index.ts
│   └── modules/
│       ├── terminal/                (S0)
│       │   ├── index.ts
│       │   └── modules/
│       │       └── cli_tools.ts
│       ├── obsidian/                (S1)
│       │   ├── index.ts
│       │   └── modules/
│       │       └── obsidian_cli.ts
│       ├── graphdb/                 (S2)
│       │   ├── index.ts
│       │   └── modules/
│       │       └── neo4j_redis.ts
│       ├── harness/                 (S3)
│       │   ├── index.ts
│       │   └── modules/
│       │       └── pi_harness.ts
│       ├── gateway/                 (S4)
│       │   ├── index.ts
│       │   └── modules/
│       │       └── epiclw_runtime.ts
│       └── external/                (S5)
│           ├── index.ts
│           └── modules/
│               └── external_apis.ts
│
├── s_i/                              (S' parent extension)
│   ├── index.ts
│   └── modules/
│       ├── ql_types/                (S0')
│       │   ├── index.ts
│       │   └── modules/
│       │       ├── coordinate_validator.ts
│       │       └── type_definitions.ts
│       ├── ql_obsidian/             (S1')
│       │   ├── index.ts
│       │   └── modules/
│       │       ├── ql_types.ts
│       │       ├── filesystem_ops.ts
│       │       ├── frontmatter_schema.ts
│       │       ├── canvas_moc.ts
│       │       ├── bimba_pratibimba_forms.ts
│       │       ├── plugin_handling.ts
│       │       └── day_now.ts
│       ├── ql_graph/                (S2')
│       │   ├── index.ts
│       │   └── modules/
│       │       ├── ql_schema.ts
│       │       ├── redis_cache.ts
│       │       └── now_dynamics.ts
│       ├── ta_onta/                 (S3')
│       │   ├── index.ts             (loads Ta-onta plugin ↓)
│       │   └── modules/
│       │       └── plugin_loader.ts
│       ├── vak_system/              (S4')
│       │   ├── index.ts
│       │   └── modules/
│       │       ├── vak_orchestration.ts
│       │       └── context_frames.ts
│       └── automations/             (S5')
│           ├── index.ts
│           └── modules/
│               ├── automation_rules.ts
│               └── api_integrations.ts
│
└── (existing non-coordinated extensions)
    ├── diff.ts
    ├── files.ts
    ├── obsidian.ts
    └── ...
│
extensions/ta-onta/                   (Epi-Claw Plugin Layer)
│
└── domains/                          (Ta-onta Plugin Layer — S3' svabhāva)
    ├── khora/                        (S3-0') Foundation
    ├── hen/                          (S3-1') GraphRAG
    ├── pleroma/                      (S3-2') Pattern orchestration
    ├── chronos/                      (S3-3') Time/sessions
    ├── anima/                        (S3-4') Holographic UI
    └── aletheia/                     (S3-5') Learning/feedback
```

---

## Dependency Flow

```
s_i/modules/ta_onta/index.ts (Ta-onta loader)
    │
    ├── loads from s_i/modules/ql_types/ (coordinate validation)
    ├── loads from s_i/modules/ql_obsidian/ (Obsidian operations)
    ├── loads from s_i/modules/ql_graph/ (QL graph schema)
    ├── loads from s_i/modules/vak_system/ (VAK/context frames)
    └── instantiates domains: khora, hen, pleroma, chronos, anima, aletheia
```

---

## Ta-Onta Domain Modules (S3-X')

| Domain | Coordinate | Purpose |
|--------|------------|---------|
| Khora | S3-0' | Foundation (workspace, config) |
| Hen | S3-1' | GraphRAG (Neo4j + retrieval) |
| Pleroma | S3-2' | Fullness (pattern orchestration) |
| Chronos | S3-3' | Time (session management) |
| Anima | S3-4' | Soul (holographic UI) |
| Aletheia | S3-5' | Truth (learning/feedback) |

---

## Summary Matrix

| Layer | Location | What |
|-------|----------|------|
| **S parent** | `.pi/extensions/s/` | Raw technical capabilities parent |
| **Sx parents** | `.pi/extensions/s/modules/{name}/` | S0-S5 individual parent dirs |
| **S' parent** | `.pi/extensions/s_i/` | QL-augmented capabilities parent |
| **Sx' parents** | `.pi/extensions/s_i/modules/{name}/` | S0'-S5' individual parent dirs |
| **Ta-onta plugin** | `extensions/ta-onta/` | Epi-claw plugin (S3' = svabhāva) |
| **Ta-onta domains** | `extensions/ta-onta/domains/*` | S3-0' through S3-5' modules |
