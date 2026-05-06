# _staging — Parked Artefacts

Temporary holding area for skills, hooks, commands, and other artefacts that were created during early prototyping. These need review and reintegration into the proper ta-onta extension structure once the architecture is stable.

## Contents

| Directory | Origin | What It Contains | Disposition |
|-----------|--------|------------------|-------------|
| `pleroma-skills/` | `plugins/pleroma/skills/` | 15 atomic + 6 orchestration SKILL.md files (PI agent + Claude Code) | Review: which are PI skills vs Claude Code skills; reintegrate per extension |
| `pleroma-evals/` | `plugins/pleroma/evals/` | 5 eval suites + fixtures (VAK, Klein, Ouroboros, etc.) | Reintegrate into test/ or ta-onta evals |
| `pleroma-hooks/` | `plugins/pleroma/hooks/` | 4 hook scripts (preflight, postflight, discharge, worktree) | Review: which hooks belong to which extension |
| `root-skills/` | `skills/` | 3 SKILL.md stubs (epi-cli, graph, vault) — likely premature agent skills | Review: may have been autocreated; delete or fold into docs |
| `root-hooks/` | `hooks/` | 4 hooks (pre/post epi-command, pre/post agent-run) | Review: belong in khora (bootstrap) or anima (agent lifecycle) |
| `root-commands/` | `commands/` | 3 command .md files (core-verify, model-status, graph-context) | Review: PI commands? Claude Code commands? Reintegrate accordingly |
| `epi-logos-plugin/` | `epi-logos-plugin/` | QV overlay/schema, install script, coordinate-syntax lib, epi-knowing skill | Review: QV resources may move to epi-cli/resources |
| `settings.json` | `plugins/pleroma/settings.json` | Pleroma plugin settings | Review for ta-onta manifest |
| `plugin.json` | `plugins/pleroma/.claude-plugin/` | Claude plugin manifest | Review for ta-onta manifest |
| `Quaternal-Logic.c` | root | Standalone C file, possibly early prototype | Archive or delete |
| `verify_*.sh` | `test/` | Verification scripts for pleroma analysis docs and vendor provenance | Review: move to CI or delete |

## When to Clear

Once the ta-onta extension structure is populated and the vault is set up, review each item here. Anything with a clear home goes there; anything obsolete gets deleted. Target: clear this directory entirely before v1.0.
