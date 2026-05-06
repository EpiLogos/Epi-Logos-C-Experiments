---
name: aletheia-ql-gate
description: "Gate 1: Coordinate frame integrity. Validates that all coordinate references in produced artifacts conform to the canonical QL coordinate system. C-family law, wikilink law, frontmatter key format."
gate: 1
human_in_loop: false
phase: 2
status: stub
---

# aletheia-ql-gate

**Gate 1 — Coordinate Frame Integrity**

> Phase 2+ implementation. Stub only — do not execute.

Validates:
- All frontmatter keys use `{family}_{n}_{semantic}` format
- `c_0_source_coordinates` is always `string[]`
- No forbidden plain-English keys (`artifact_role`, `session_id`, etc.)
- `coordinate` is the only SPECIAL_KEY
- All coordinate references in body text use `[[wikilink]]` syntax
