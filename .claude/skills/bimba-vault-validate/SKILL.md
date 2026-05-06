---
name: validate
description: >
  Validate frontmatter, residency, wikilinks, and hierarchy placement
  for any file in the /Idea vault. Run before committing any vault write.
  Unknown frontmatter keys are ERRORS not warnings.
---

# Bimba Vault: Validation

## Scope

All files within:
```
/Users/admin/Documents/Epi-Logos C Experiments/Idea/
```

## Validation Checks

### 1. Frontmatter Key Law

**Format:** `{family}_{n}_{semantic}` or `{family}_{n}_{i}_{semantic}` (inverted) or `{family}_{n}_{sub_n}_{semantic}` (sub-coordinate)

**Approved bare keys:**
- `coordinate` — the ONE key without family prefix

**Approved family prefixes:**
- `c_` (Category), `p_` or `p{n}_` (Position), `s_` (Stack), `t_` (Thought), `m_` (Subsystem), `l_` (Lens)

**Required keys (every file):**
- `coordinate:` — must be present
- `c_4_artifact_role:` — must be set

**Required for temporal files:**
- `c_2_session_id:` — for NOW files
- `c_3_day_id:` — for day-scoped files
- `c_3_created_at:` — ISO timestamp

**Type constraints:**
- `c_0_source_coordinates:` — MUST be `string[]`, never scalar
- `c_5_reflection_complete:` — boolean

**Unknown keys → ERROR.** Not warn. ERROR.

### 2. Residency Check

| `c_4_artifact_role` | Required path |
|---------------------|--------------|
| `form` or `definition` (canonical) | `/Idea/Bimba/World/*.md` (flat) |
| `seed` | `/Idea/Bimba/Seeds/{Family}/` |
| `daily-note` | `/Idea/Empty/Present/{DD-MM-YYYY}/daily-note.md` |
| `now` | `/Idea/Empty/Present/{DD-MM-YYYY}/{sessionId}/now.md` |
| `flow` | `/Idea/Empty/Present/{DD-MM-YYYY}/FLOW.md` or `/Idea/Empty/Present/FLOW-*.md` |
| `thought` | `/Idea/Pratibimba/Self/Thought/T{n}/` or `T{n}'/` |
| `category-mapping` | `/Idea/Bimba/World/` (flat) |

### 3. Hierarchy Check

If file is placed in `Types/Coordinates/`:
- `coordinate:` value must match the path
- A file with `coordinate: "S4"` must be under `Types/Coordinates/S/S4/`
- A file with `coordinate: "S4'"` must be under `Types/Coordinates/S/S'/S4'/`

If file is placed in `Types/Entities/`:
- Must have wikilinks to relevant coordinates in frontmatter or body
- Must be in a concept folder with a MOC canvas

### 4. Wikilink Enforcement

- All entity references MUST use `[[wikilink]]` syntax
- `c_0_source_coordinates:` values should be wikilinks: `["[[S4]]", "[[S4']]"]`
- Warn on bare text references to known coordinate names (S0, M3, CT4b, etc.)

### 5. CTx Validity

`c_1_ct_type:` must be one of: `CT0`, `CT1`, `CT2`, `CT3`, `CT4a`, `CT4b`, `CT5`

### 6. Thought Routing

If `c_4_artifact_role: "thought"`:
- `t_0_thought_type:` must be set (T0-T5)
- File must be in matching directory:
  - `t_0_thought_type: "T0"` → `/Idea/Pratibimba/Self/Thought/T0/`
  - `t_0_thought_type: "T3"` with night mode → `/Idea/Pratibimba/Self/Thought/T3/T3'/`

### 7. Form Uniqueness

If placing a file flat in `/Idea/Bimba/World/`:
- Name must be unique — no existing file with same name
- `/Forms/` subfolder is ERRONEOUS — Forms are flat

## How to Use

Run validation before ANY vault write operation. The other bimba-vault skills
(world, seeds, map) should invoke this skill's checks internally.

```
Agent workflow:
1. Prepare file content + frontmatter
2. Run validate checks
3. If ERROR → fix before writing
4. Write file
5. Run validate again on written file (post-write sanity)
```
