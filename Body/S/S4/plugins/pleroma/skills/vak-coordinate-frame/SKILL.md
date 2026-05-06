---
name: vak-coordinate-frame
description: Normalize coordinate evidence for VAK dispatch, including S/S' and M/M' branch distinctions.
---

# VAK Coordinate Frame

Use this skill when a task needs coordinate framing before evaluation or dispatch.

## Contract

- Preserve `S/S'` as the system/build coordinate branch.
- Preserve `M/M'` as the embodied/user and Bimba-coordinate branch.
- Treat old `#` / `#n` Bimba coordinate syntax as compatibility evidence for the M branch, not as an error.
- Produce wikilink-ready coordinate names for any spec or source file references.

## Output Shape

```json
{
  "primary_coordinate": "S4'",
  "secondary_coordinates": ["S1'", "S5'"],
  "legacy_coordinate_evidence": ["#4"],
  "wikilinks": ["[[S4']]", "[[Anima]]", "[[Pleroma]]"]
}
```
