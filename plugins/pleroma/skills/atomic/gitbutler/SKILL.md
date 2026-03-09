---
name: gitbutler
description: "Virtual branch management via GitButler CLI. Branch creation, lane management, virtual branch operations, integration with worktree isolation. Port-and-refine from upstream."
port_type: port-and-refine
ct: CT2
cp: "4.2"
agent_affinity: eros
---

# gitbutler -- Virtual Branch Management

Centralized GitButler orchestration lane for session execution. Use when session work requires deterministic stack lineage and centralized VCS control.

## When to Use

- Treat GitButler as the primary execution surface when available
- Preferred command surface: `but` (or configured `vcs.command`)
- Preferred control mode: GitButler MCP when available

## Branch Lineage

Always preserve parent/child lineage in branch planning:

- `parentSessionId` is the stack anchor context
- `childSessionId` is the virtual-branch execution unit
- `linearIdentifier` is the ticket identity anchor

## Metadata Protocol

Emit and consume metadata as persistent context anchors:

| Key | Description |
|-----|-------------|
| `vcsStrategy` | Always `gitbutler` |
| `gitbutlerBranchRef` | Virtual branch reference |
| `gitbutlerStackRoot` | Stack root commit |
| `gitbutlerProjectPath` | Project directory path |
| `redisNamespace` | Redis cache namespace for session |

## Commands

### Create Virtual Branch

```bash
but branch create --name "<name>" [--stack "<stack-name>"]
```

Creates a new virtual branch in the GitButler workspace. If `--stack` is provided, the branch is created within the named stack.

### List Branches

```bash
but branch list [--format json|table]
```

Lists all virtual branches with their status, file count, and stack membership.

### Apply Branch

```bash
but branch apply --name "<name>"
```

Applies a virtual branch to the workspace, making its changes visible.

### Unapply Branch

```bash
but branch unapply --name "<name>"
```

Removes a virtual branch from the workspace without deleting it.

### Commit on Branch

```bash
but commit --branch "<name>" --message "<message>"
```

Creates a commit on the specified virtual branch.

### Push Branch

```bash
but push --branch "<name>"
```

Pushes the virtual branch to the remote.

## Lane Management

Virtual branches operate as lanes in the GitButler workspace:

```
Workspace
  |
  +-- Lane: feature-auth     (active, 3 files)
  +-- Lane: bugfix-cache     (active, 1 file)
  +-- Lane: refactor-types   (unapplied)
```

Each lane is independent -- changes in one lane do not affect others until integration.

## Integration with Worktree Isolation

When using worktrunk for parallel agent work:

```bash
# Create worktree for isolated work
worktrunk create --name "gitbutler-session" --base main

# In the worktree, use GitButler for virtual branches
cd .worktrees/gitbutler-session
but branch create --name "agent-work"
```

## Cleanup Protocol

Keep cleanup deterministic:

1. Use GitButler teardown action first for the project path
2. Keep worktree removal as fallback, not primary
3. Do not bypass this lane with ad-hoc raw git operations unless fallback mode is explicitly required

## Error Handling

| Error | Condition | Action |
|-------|-----------|--------|
| `gitbutler_not_installed` | `but` command not found | Fall back to raw git operations |
| `project_not_initialized` | GitButler not initialized in project | Run `but project init` |
| `branch_conflict` | Virtual branch name already exists | Suggest alternative name |
| `stack_not_found` | Named stack does not exist | List available stacks |
