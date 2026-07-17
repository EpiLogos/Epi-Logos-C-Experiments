---
name: cmux
description: "Visible, interactive projection for the gateway-governed tmux agent substrate."
port_type: port-and-refine
ct: CT4
cp: "4.4"
agent_affinity: psyche
requires:
  bins: ["cmux", "tmux"]
  os: ["darwin"]
---

# cmux -- Visible Projection of tmux Agent Sessions

cmux is the visible, interactive terminal surface. It does not create or own
agent processes, tmux sessions, task windows, pane identity, or gateway state.
Those are allocated once by `epi agent tmux topology` on tmux's isolated
socket and recorded as the gateway terminal lease.

## Authority

```
Anima dispatch decision
  -> epi agent tmux topology
  -> tmux isolated socket (session / window / pane / process / lease)
  -> optional cmux workspace running `tmux -S <socket> attach-session -t <session>`
```

Opening or closing cmux never starts, stops, duplicates, or changes the tmux
agent session. The same tmux session remains active with no cmux workspace
open, so there is no separate "headless" agent mode.

## Open a Projection

Ask the topology allocator for a visible projection when an operator needs an
interactive surface:

```bash
epi agent tmux topology \
  --session-key agent:anima:main \
  --day-session epi-2026-07-17 \
  --window w-nous \
  --pane p-nous-task-1 \
  --cfp-layout CFP0 \
  --cf '(0000)' \
  --cp 4.0 \
  --visible
```

The command first allocates or reuses the tmux topology and terminal lease.
Only then it invokes the real cmux command:

```bash
cmux new-workspace \
  --name 'epi-2026-07-17-w-nous' \
  --cwd <repo-root> \
  --command 'tmux -S <isolated-socket> attach-session -t epi-2026-07-17'
```

If cmux is not running, the tmux allocation still succeeds and reports the
projection as unavailable. Start cmux later and attach to the same socket;
there is no migration step.

## Inspection

Use the real cmux CLI only for its supported visible-surface operations:

```bash
epi techne cmux list-workspaces --projected
epi techne cmux identify --projected
cmux tree
cmux new-workspace --name <name> --cwd <repo-root> --command 'tmux -S <socket> attach-session -t <session>'
```

Do not use or document invented lifecycle commands such as `session-ensure`,
`surface-create`, `pane-assign`, `layout-set`, `focus`, or `pane-send`.

## Session Shape

| Logical level | Authoritative tmux resource |
|---|---|
| Day | session: `epi-YYYY-MM-DD` |
| Anima dispatch role | window: `w-<role>` |
| Child task | titled pane: `p-<role>-<task>` |
| CFP0 / CFP1 / CFP3 | single / even-horizontal / tiled layout |

The Pleroma tool `techne_tmux_topology_apply` is the PI-facing route. It
passes Anima's typed decision to `epi agent tmux topology`; it does not shell
either multiplexer directly.
