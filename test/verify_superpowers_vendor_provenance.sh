#!/bin/sh
set -eu

snapshot_dir="vendor/obra-superpowers-v4.2.0"
provenance_note="docs/provenance/2026-03-08-obra-superpowers-vendor.md"

[ -d "$snapshot_dir" ]
[ -f "$snapshot_dir/README.md" ]
[ -f "$snapshot_dir/RELEASE-NOTES.md" ]
[ -f "$provenance_note" ]

grep -F "/Users/admin/.codex/superpowers" "$provenance_note" >/dev/null
grep -F "vendor/obra-superpowers-v4.2.0" "$provenance_note" >/dev/null
grep -F "a98c5dfc9de0df5318f4980d91d24780a566ee60" "$provenance_note" >/dev/null
grep -F "v4.2.0" "$provenance_note" >/dev/null
