# Obra Superpowers Vendor Provenance

- Import timestamp (UTC): `2026-03-08T00:33:23Z`
- Upstream source path: `/Users/admin/.codex/superpowers`
- Upstream remote: `https://github.com/obra/superpowers.git`
- Upstream commit: `a98c5dfc9de0df5318f4980d91d24780a566ee60`
- Upstream discovered tag: `v4.2.0`
- Upstream local status note: untracked path `skills/sanity-check/`
- Snapshot destination: `vendor/obra-superpowers-v4.2.0`
- Import method: `rsync -a --exclude '.git'` followed by `chmod -R a-w`

## Notes

This snapshot is a read-only vendor copy of the locally installed Superpowers source discovered on disk during Phase 1 of the Pleroma real-port program.

The local git metadata identifies the source as `v4.2.0`. No local `v4.3.0` tag was discoverable in this clone, even though the Pleroma port program names `obra/superpowers v4.3.0` as the intended fork base. That mismatch is intentionally preserved here as provenance ambiguity to resolve before interpretation.

The local source tree is also not perfectly clean: `git status --short` reports an untracked `skills/sanity-check/` path. This vendor snapshot therefore captures the installed working tree as found on disk, not a guaranteed pristine upstream checkout.

The snapshot excludes the upstream `.git/` directory so the vendored tree stays reviewable and inert inside this repository.
