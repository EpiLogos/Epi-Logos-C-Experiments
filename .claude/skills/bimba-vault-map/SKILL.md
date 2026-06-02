---
name: map
description: >
  Manage the M-coordinate philosophical map in /Idea/Bimba/Map/.
  This is the ~2000 node Neo4j ontological map (M0-M5 branches).
  Includes bimba-populate integration for loading datasets into Neo4j.
---

# Bimba Vault: Map Management

## Scope

All operations within:
```
/Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Map/
```

## What This Is

The Bimba Map is the full M-coordinate philosophical ontology — approximately
2000 nodes in Neo4j covering:

- **M0 Anuttara** — proto-logical ground, archetypal number language
- **M1 Paramasiva** — spanda stages, Clifford signatures, definition engine
- **M2 Parashakti** — chakras, decans, planets, epogdoon, vibrational template
- **M3 Mahamaya** — hexagrams, codons, tarot, pairing matrices, symbolic transcription
- **M4 Nara** — personal interface, identity, oracle, medicine, transform, lenses
- **M5 Epii** — synthesis orchestration, logos FSM, integration

## Bimba-Populate Integration

This skill delegates to the existing `bimba-populate` skill for Neo4j operations:

```
/Users/admin/Documents/Epi-Logos C Experiments/plugins/pleroma/skills/bimba-populate/SKILL.md
```

That skill handles:
1. Reading JSON datasets from `Idea/Bimba/Map/datasets/`
2. Semantic apportionment to `{family}_{n}[_{sub_n}]*_{semantic}` properties
3. Generating Cypher files to `epi-gnostic/cypher/generated/`
4. Human-reviewed execution against Neo4j via `cypher-shell`

## Map-Specific Operations

### 1. Map Status

Check which M-branches are populated in Neo4j vs which have pending datasets.

### 2. Map → Seeds Flow

When Map data reveals detailed coordinate content, create/update the corresponding
seed files in `/Idea/Bimba/Seeds/M/`.

### 3. Map → World Flow

When Map content crystallises into synthesised Forms, create/update Forms in
`/Idea/Bimba/World/` (e.g., `M3.md` as the crystallised synthesis of the
Mahamaya subsystem).

### 4. Cross-Reference Validation

Verify that Map nodes in Neo4j correspond to seed files in Seeds/M/ and
Forms in World/. Flag gaps where Neo4j has nodes with no vault representation.

## Dataset Locations

```
/Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Map/datasets/nodes_hash.json
/Users/admin/Documents/Epi-Logos C Experiments/Idea/Bimba/Map/datasets/relations_hash.json
```

## M-Coordinate Mapping Skill

Also available for deeper architectural analysis:
```
/Users/admin/Documents/Epi-Logos C Experiments/.claude/skills/m-coordinate-mapping.md
```

This translates Neo4j Bimba ontology into C memory architecture sub-FRs.
