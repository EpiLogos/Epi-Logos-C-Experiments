---
name: cmux
description: "Claude-managed terminal multiplexer. Extends tmux with semantic window naming, automatic layout, and coordinate-aware pane assignment. Fresh design."
port_type: fresh-design
ct: CT2, CT4
cp: "4.4"
agent_affinity: psyche
requires:
  bins: ["tmux"]
  os: ["darwin", "linux"]
---

# cmux -- Claude-Managed Terminal Multiplexer

Extends the base tmux skill with semantic awareness: windows are named by coordinate, panes are assigned by CF identity, and layouts adapt to the current work topology.

## Purpose

While tmux provides raw session management, cmux adds a semantic layer:

- **Coordinate-aware naming**: windows are named by their VAK coordinate context, not arbitrary slugs
- **Automatic layout**: pane arrangements adapt to the thread type (P-Thread, F-Thread, etc.)
- **Focus routing**: the active pane follows the current CF dispatch target
- **Surface management**: named surfaces group related panes into logical workspaces

## Workspace Topology

A cmux workspace maps directly to the VAK coordinate space:

```
aletheia-workshop (tmux session)
  |
  +-- surface:ground    (CP 4.0 context)
  |     +-- pane:nous     CF (0000)
  |     +-- pane:logos    CF (0/1)
  |
  +-- surface:operation (CP 4.2 context)
  |     +-- pane:eros     CF (0/1/2)
  |     +-- pane:mythos   CF (0/1/2/3)
  |
  +-- surface:context   (CP 4.4 context)
  |     +-- pane:psyche   CF (4.0-4.4/5)
  |
  +-- surface:synthesis (CP 4.5 context)
        +-- pane:sophia   CF (5/0)
```

## Surface Management

### Create Surface

```bash
cmux surface-create --name <surface-name> --cp <context-position>
```

Creates a new tmux window named `s:{surface-name}` with the CP coordinate tag stored as a tmux environment variable.

### List Surfaces

```bash
cmux surface-list
```

Returns all surfaces with their CP assignment, pane count, and active status.

### Destroy Surface

```bash
cmux surface-destroy --name <surface-name>
```

Closes all panes on the surface and removes the window. Captures final state before destruction.

## Pane Assignment

### Assign Pane by CF

```bash
cmux pane-assign --surface <surface-name> --cf <cf-code> --agent <agent-type>
```

Creates a new pane on the named surface, sets `CF_IDENTITY` in the pane environment, and optionally launches the specified agent.

### Layout Modes

| CFP Thread | Layout | Description |
|------------|--------|-------------|
| CFP0 Base | single | One pane, full surface |
| CFP1 P-Thread | tiled | N panes tiled evenly |
| CFP2 C-Thread | stacked | Panes stacked vertically, one active at a time |
| CFP3 F-Thread | columns | N panes in equal columns for comparison |
| CFP4 L-Thread | single | One pane, full surface (long-running) |
| CFP5 B-Thread | nested | Main pane large, sub-panes in sidebar |

```bash
cmux layout-set --surface <surface-name> --cfp <thread-type>
```

## Focus Routing

When a CF dispatch occurs via anima-orchestration, cmux can automatically route focus to the target pane:

```bash
cmux focus --cf <cf-code>
```

This finds the pane with matching `CF_IDENTITY` and selects it, bringing the correct surface and pane into view.

## Coordinate Tag Protocol

Every cmux window and pane carries coordinate metadata in tmux environment variables:

| Variable | Scope | Description |
|----------|-------|-------------|
| `CMUX_CP` | window | Context Position (4.0-4.5) |
| `CMUX_CF` | pane | Context Frame code |
| `CMUX_CFP` | window | Thread type for layout |
| `CMUX_SURFACE` | window | Surface name |
| `CF_IDENTITY` | pane | Constitutional agent identity |

## Integration with tmux Skill

cmux builds on top of the base tmux skill. All raw tmux commands remain available. cmux adds:

1. Semantic naming layer (surfaces, coordinate tags)
2. Automatic layout management
3. Focus routing by CF code
4. Coordinate-aware pane environment setup

Use tmux directly for raw session management. Use cmux when coordinate-aware workspace topology is needed.

## Example: Set Up P-Thread Workspace

```bash
# Create a surface for parallel work
cmux surface-create --name parallel-tasks --cp 4.2

# Set tiled layout for P-Thread
cmux layout-set --surface parallel-tasks --cfp CFP1

# Assign agent panes
cmux pane-assign --surface parallel-tasks --cf "(0/1/2)" --agent claude-code
cmux pane-assign --surface parallel-tasks --cf "(0/1/2/3)" --agent gemini-cli
cmux pane-assign --surface parallel-tasks --cf "(0/1)" --agent codex

# Focus on Eros pane
cmux focus --cf "(0/1/2)"
```
