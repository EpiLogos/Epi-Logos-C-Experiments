# oh-my-codex Vendor Provenance

- Import timestamp (UTC): `2026-04-03T00:00:00Z`
- Upstream source: `vendors/oh-my-codex/`
- Package name: `oh-my-codex`
- Package version: `0.11.12`
- Vendored commit: `ed78b87` (docs: align top collaborators with main-merged commit authors)
- Snapshot destination: `vendors/oh-my-codex/`
- Import method: vendored in-place (full source + dist build artefacts)

## Role in This Repository

`vendors/oh-my-codex/` is the **Codex-facing runtime substrate** for the Pleroma OMX fork.
It is not the semantic authority for Pleroma capabilities — ta-onta specs fill that role.

Authority split: `docs/specs/S/S4/2026-04-03-omx-pleroma-claw-authority-matrix.md`

## What Is Vendored

- `dist/cli/omx.js` — the built OMX CLI entry point used by `epi agent codex install`
- `skills/` — upstream OMX skill templates (read-only reference; Pleroma capabilities live in `plugins/pleroma/skills/`)
- Full source under `src/` and `crates/` for auditability

## What Is NOT Vendored

- `.git/` — excluded to keep the vendor tree inert inside this repo
- OMX-generated project-local runtime state (`.codex/`, `.omx/`) — these are output, not source

## Reproducibility

To re-install project-scoped OMX from this vendor snapshot:

```bash
bash tools/omx/setup-project.sh
```

The wrapper always installs from `vendors/oh-my-codex/`, never from npm or the internet.
Generated runtime state lands in `.codex/` and `.omx/` (both gitignored).

## Note on Upstream Skills

The upstream OMX `skills/` directory contains workflow skills that have OMX-native analogues of
some Pleroma capabilities.  These are **reference material only**.  The canonical authoring surface
for all VAK/ta-onta skills is `plugins/pleroma/skills/`.
