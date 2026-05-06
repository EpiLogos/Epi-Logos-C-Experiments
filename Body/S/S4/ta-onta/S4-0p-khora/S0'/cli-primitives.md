# Khora CLI Primitive Contract

Khora `S0/cli` is the agent-side capability layer for preferred base command-line tools.

It exists so sessions and extension code can target stable semantic primitives:

- `read`
- `search`
- `listing`
- `tree`
- `navigation`
- `json`
- `select_interactive`
- `git_host`
- `task_runner`

without hardcoding machine-specific binary choices in every script or prompt.

## Contract

1. `S0/tools.json` remains the PI-visible tool registry.
2. `S0/cli` is not a PI-visible tool surface.
3. `preferred-tools.json` is the declarative preference record for agent-facing command preferences.
4. `resolve.sh` is the executable resolution boundary.
5. Thin wrappers may exist only where fallback semantics are honest.

## Current Preferences

| Capability | Preferred | Fallback |
| --- | --- | --- |
| read | `bat` | `cat` |
| search | `rg` | `grep` |
| listing | `eza` | `ls` |
| tree | `eza --tree` | `find` |
| navigation | `zoxide` | none |
| json | `jq` | none |
| select_interactive | `fzf` | none |
| git_host | `gh` | none |
| task_runner | `just` | none |

## Notes

- `bat` should be invoked with plain output defaults for agent consumption; avoid pager-dependent behavior.
- `zoxide` is resolution-oriented here. It can answer "where should I go?" for an agent or hook, but it cannot mutate the parent shell unless sourced by the caller.
- `jq` has no fallback because a weaker replacement would produce misleading behavior for structured selection.
- `fzf` is intentionally interactive-only and should not be assumed safe for unattended execution paths.
- Additional wrappers should stay small and composable. This layer is for primitives, not workflows.
