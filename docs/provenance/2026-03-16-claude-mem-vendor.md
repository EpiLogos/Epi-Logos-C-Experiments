# Claude-Mem Vendor Provenance

- Import timestamp (UTC): `2026-03-16T00:00:00Z`
- Upstream source: `https://github.com/thedotmack/claude-mem`
- Upstream commit: `237a4c37f84f9e9893bb92574666cc53a12a2106`
- Upstream discovered version: `10.5.5`
- Snapshot destination: `vendor/claude-mem-v10.5.5`
- Imported subtrees:
  - `plugin/`
  - `openclaw/`
  - `README.md`
  - `LICENSE`
  - `package.json`

## Notes

This snapshot preserves the upstream raw plugin files needed for repo-local validation and agent runtime loading.

The actionable Claude Code bundle lives at `vendor/claude-mem-v10.5.5/plugin`. That path is also the root registered in `plugins/registry.jsonl` so managed PI sessions can load the vendored bundle without depending on a separate global Claude marketplace install.

The `openclaw/` subtree is included as upstream parity reference for the gateway/plugin form and installation contract, but the current repo runtime wiring targets the vendored Claude Code plugin bundle.
