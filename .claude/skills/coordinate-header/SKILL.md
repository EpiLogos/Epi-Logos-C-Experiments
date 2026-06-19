---
name: coordinate-header
description: >
  Author and validate a module's Coordinate Header against the
  43.2 Unified Coordinate Header schema. Run before committing any
  new code unit (header, lib.rs, extension barrel, agent skill,
  CONTRACT.md). Missing fields are ERRORS not warnings.
---

# Coordinate Header: Author & Validate

## Scope

All named code units within:
```
/Users/admin/Documents/Epi-Logos C Experiments/
```

Per the Unified Coordinate Header Convention (`convention:coordinate-header:v1`, `43.T43.2-convention.md`), every `include/*.h`, `src/lib.rs`/`main.rs`, extension barrel (`extensions/*/src/common/index.ts`), agent skill (`skills/*/SKILL.md`), and `CONTRACT.md` SHALL carry a Coordinate Header.

## Schema (43.2)

| Field | Required | Semantics |
|-------|----------|-----------|
| `Coordinate` | **Yes** | Canonical coordinate, e.g. `S0-3-1`, `M'-4-0` |
| `Residency` | **Yes** | Physical filesystem path; flagged when ≠ conceptual coordinate |
| `Position (#n)` | **Yes** | Functional role in the coordinate family, e.g. `#0 — Ontological Foundation` |
| `Actualises` | **Yes** | What spec/design/contract this artifact makes real |
| `Public surface` | **Yes** | Exported symbols, functions, types that external consumers depend on |
| `Does NOT own` | **Yes** | Explicit negative space to prevent scope creep |
| `Contract` | *No* | Link to CONTRACT.md for crates with a real seam |

## Validation Checks

### 1. Presence Check

Every matching file pattern MUST carry a Coordinate Header:

| Pattern | Language | Rendering |
|---------|----------|-----------|
| `include/*.h` | C | `/** ... */` block before `#ifndef` guard |
| `src/lib.rs`, `src/main.rs` | Rust | `//!` module-doc, first lines |
| `extensions/*/src/common/index.ts` | TypeScript | `/** ... */` top JSDoc before imports |
| `extensions/*/src/browser/*.tsx` | TypeScript | `/** ... */` top JSDoc |
| `skills/*/SKILL.md` | Markdown | Frontmatter or top-level YAML |
| `ta-onta/*/CONTRACT.md` | Markdown | Header section |

**Missing header → ERROR.** Not warn. ERROR.

### 2. Schema Completeness

All seven fields must be present (Contract is optional):
- `Coordinate` — MUST parse to a valid coordinate in the canonical system
- `Residency` — MUST match the file's actual path
- `Position (#n)` — MUST include the number and role name
- `Actualises` — MUST reference a real Seeds doc, spec, or CONTRACT.md
- `Public surface` — MUST list actual exported symbols (not generic)
- `Does NOT own` — MUST list real exclusions (not generic "nothing")
- `Contract` — if present, the linked file MUST exist

### 3. Coordinate Validity

The `Coordinate` field must parse to one of:
- `S<n>` or `S<n>-<sub>` — Stack coordinate
- `S<n>'` or `S<n>'-<sub>` — Inverted stack
- `M<n>` or `M<n>-<sub>` — Subsystem coordinate  
- `M<n>'` or `M<n>'-<sub>` — Inverted subsystem
- `P<n>`, `T<n>`, `L<n>`, `C<n>` — Other families

### 4. Residency Match

The `Residency` field must equal the file's true absolute path from repo root.
Flag if conceptual coordinate ≠ physical path (Track 17 substrate-residency note).

### 5. Public Surface Completeness

The `Public surface` must list every exported symbol. For C headers: every function prototype, typedef, and macro. For Rust: every `pub` item. For TS barrels: every `export` statement.

### 6. Negative Space (Does NOT own)

Every Coordinate Header must declare at least one genuine exclusion — something a reader might reasonably expect this module to own that it deliberately does not. Generic exclusions like "nothing else" are INVALID.

### 7. Contract Link Validity

If `Contract` is present, verify the linked file exists on disk. Broken contract links are ERRORS.

## Rendering Templates

### C Header

```c
/**
 * <filename> — <one-line purpose>
 *
 * Coordinate:   S<stack>-<layer>-<pos>   |   <family-indicator>
 * Residency:    Body/S/S<stack>/<path>
 * Position:     #<n> — <role name>
 * Actualises:   <Seeds doc or spec reference>
 * Public surface:
 *   <function/type> — <purpose>
 *   ...
 * Does NOT own:
 *   <exclusion>
 *   ...
 * Contract:     Body/S/S4/ta-onta/<name>/CONTRACT.md   (if seam exists)
 */
```

### Rust //! module-doc

```rust
//! <crate-name> — <one-line purpose>
//!
//! # Coordinate
//!
//! | Field | Value |
//! |-------|-------|
//! | Coordinate | S<stack>-<layer>-<pos> |
//! | Residency  | Body/S/S<stack>/<crate-path> |
//! | Position   | #<n> — <role name> |
//! | Actualises | <Seeds doc or spec reference> |
//!
//! # Public surface
//!
//! * `<function>` — <purpose>
//!
//! # Does NOT own
//!
//! * `<exclusion>`
//!
//! # Contract
//!
//! See [`CONTRACT.md`](Body/S/S4/ta-onta/<name>/CONTRACT.md) for the full seam contract.
```

### TypeScript Top JSDoc

```ts
/**
 * <module-name> — <one-line purpose>
 *
 * @coordinate   S<stack>-<layer>-<pos>  |  <family-indicator>
 * @residency    Body/M/epi-theia/extensions/<path>
 * @position     #<n> — <role name>
 * @actualises   <Seeds doc or spec reference>
 *
 * Public surface:
 *   <Component/function> — <purpose>
 *
 * Does NOT own:
 *   <exclusion>
 *
 * @contract     Body/S/S4/ta-onta/<name>/CONTRACT.md
 */
```

### CONTRACT.md

Follow the ta-onta pattern:

```markdown
# <Name> Contract — <one-line purpose>

**Extension class:** <S4-N' or M-N'> within <parent>
**S-Layer fold:** <layer description>
**Position:** #<n> (<role name> — <semantic expansion>)

---

## Responsibility
...
## PI Hook Seams
...
## Registered Tools
...
## Dependencies
...
## Key Invariants
...
```

## Exemplars (already conformant)

| File | Language | Notes |
|------|----------|-------|
| `include/ontology.h` | C | Canonical C pattern |
| `include/m5.h` | C | Multi-field Public surface with sub-branch expansion |
| `Body/S/S0/epi-spacetime-module/src/lib.rs` | Rust | `//!` module-doc pattern |
| `Body/S/S0/epii-autoresearch-core/src/lib.rs` | Rust | `//!` with CONTRACT.md link |
| `Body/S/S4/ta-onta/S4-3p-chronos/CONTRACT.md` | Markdown | Canonical CONTRACT.md pattern |
| `Body/S/S4/ta-onta/S4-1p-hen/CONTRACT.md` | Markdown | Full seam specification |
| `Body/S/S5/epi-kbase/CONTRACT.md` | Markdown | Knowledge base seam |

## How to Use

Run validation before ANY new code unit creation or edit that changes a module's contract surface.

```
Agent workflow:
1. Identify the code unit (header, lib.rs, barrel, skill, CONTRACT.md)
2. If creating NEW: author a Coordinate Header using the correct template above
3. Run validate checks (all 7 checks)
4. If ERROR → fix before writing
5. Write the file with the header
6. Post-write: verify the header is present and complete
```

### Quick Commands

To check a file against the schema:
```
grep -c 'Coordinate\|Residency\|Position\|Actualises\|Public surface\|Does NOT own' <file>
# Output should be ≥ 6 (Contract is optional)
```

To find files missing headers in a directory:
```
for f in include/*.h; do
  grep -q 'Coordinate:' "$f" || echo "MISSING: $f"
done
```
