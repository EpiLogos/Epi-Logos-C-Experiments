# Khora S0 CLI Primitives

This directory defines Khora's `agent-facing` command preferences for terminal work inside `S0`.

These files are not PI-visible tool registrations. They are the runtime substrate that lets agents ask for a capability such as "search" or "json" and get the preferred concrete binary for the current machine.

## Files

- `preferred-tools.json` - canonical capability policy and fallback order
- `resolve.sh` - resolve a capability name to an installed executable
- `read.sh` - inspect files with `bat` first, then `cat`
- `search.sh` - run recursive text/file search with `rg` first, then `grep`
- `list.sh` - run directory listing with `eza` first, then `ls`
- `nav.sh` - resolve a likely directory target via `zoxide query`
- `json.sh` - run JSON parsing/querying with `jq`

## Design Rules

1. Keep this layer capability-oriented, not product-oriented.
2. Reserve `S0/tools.json` for PI-visible tools such as `epi vault`.
3. Add wrappers only when the capability semantics are stable across fallback binaries.
4. Do not fake feature parity. If no honest fallback exists, fail loudly.

## Usage

Use `resolve.sh <capability>` to discover the current preferred binary:

```sh
.pi/extensions/ta-onta/khora/S0/cli/resolve.sh read
.pi/extensions/ta-onta/khora/S0/cli/resolve.sh search
.pi/extensions/ta-onta/khora/S0/cli/resolve.sh listing
.pi/extensions/ta-onta/khora/S0/cli/resolve.sh navigation
```

Use wrappers when a stable invocation surface is useful:

```sh
.pi/extensions/ta-onta/khora/S0/cli/read.sh README.md
.pi/extensions/ta-onta/khora/S0/cli/search.sh "session_id"
.pi/extensions/ta-onta/khora/S0/cli/list.sh -la
.pi/extensions/ta-onta/khora/S0/cli/nav.sh khora
.pi/extensions/ta-onta/khora/S0/cli/json.sh '.tools[].name' tools.json
```

## Current Preference Set

- `read` -> `bat`, fallback `cat`
- `search` -> `rg`, fallback `grep`
- `listing` / `tree` -> `eza`, fallback `ls` / `find`
- `navigation` -> `zoxide`
- `json` -> `jq`
- `select_interactive` -> `fzf` (interactive-only)
- `git_host` -> `gh`
- `task_runner` -> `just`
