#!/bin/sh
set -eu

brief="docs/specs/S/S4/2026-03-08-pleroma-canonical-brief.md"
inventory="docs/specs/S/S4/2026-03-08-superpowers-pleroma-source-inventory.md"
matrix="docs/specs/S/S4/S4i-PLEROMA-PORT-MATRIX.md"

[ -f "$brief" ]
[ -f "$inventory" ]
[ -f "$matrix" ]

grep -F "newer runtime docs are implementation-grounding, not telos-grounding" "$brief" >/dev/null
grep -F "atomic vs VAK skill taxonomy" "$brief" >/dev/null
grep -F "constitutional progeny principle" "$brief" >/dev/null

grep -F "vendor/obra-superpowers-v4.2.0/lib/skills-core.js" "$inventory" >/dev/null
grep -F "extensions/pleroma/index.ts" "$inventory" >/dev/null
grep -F "specific prompting approach" "$inventory" >/dev/null
grep -F "parity function" "$inventory" >/dev/null

grep -F "fresh-design" "$matrix" >/dev/null
grep -F "technē-spawn" "$matrix" >/dev/null
grep -F "vak-evaluate" "$matrix" >/dev/null
