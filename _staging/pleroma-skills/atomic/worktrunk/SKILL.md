---
name: worktrunk
description: "Worktree lifecycle management. Create, verify, and clean up isolated git worktrees for parallel agent work. Fresh design."
port_type: fresh-design
ct: CT2
cp: "4.2"
agent_affinity: eros
requires:
  bins: ["git"]
---

# worktrunk -- Worktree Lifecycle Management

Manage git worktrees for isolated parallel agent work. Each worktree provides a separate working directory on a dedicated branch, preventing conflicts when multiple agents operate on the same repository.

## Purpose

When multiple agents work in parallel (P-Thread, F-Thread), they need isolated filesystem contexts. Git worktrees provide this without full clones:

- Each agent gets its own working directory
- Each worktree operates on its own branch
- No merge conflicts during parallel work
- Clean integration via standard git merge/rebase after completion

## Invocation

```bash
worktrunk <command> [options]
```

### Commands

| Command | Description |
|---------|-------------|
| `create` | Create a new worktree with branch |
| `list` | List all active worktrees |
| `verify` | Check worktree health and status |
| `cleanup` | Remove completed worktrees |
| `integrate` | Merge worktree branch back to parent |

## Create Worktree

```bash
worktrunk create --name <name> --base <base-branch> [--dir <directory>]
```

### Parameters

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `--name` | Yes | -- | Worktree and branch name |
| `--base` | No | `HEAD` | Base branch/commit to fork from |
| `--dir` | No | `.worktrees/<name>` | Directory for the worktree |

### Sequence

1. Verify the base branch exists and is clean
2. Select the target directory (default: `.worktrees/<name>`)
3. Verify target directory does not already exist
4. Create worktree: `git worktree add <dir> -b <name> <base>`
5. Return worktree metadata

### Return Value

```json
{
  "status": "created",
  "name": "eros-verify-auth",
  "branch": "eros-verify-auth",
  "directory": "/path/to/.worktrees/eros-verify-auth",
  "baseBranch": "main",
  "baseCommit": "abc123"
}
```

## Smart Directory Selection

Default worktree location follows the convention:

```
<repo-root>/.worktrees/<name>/
```

If `.worktrees/` does not exist, it is created automatically. If the target directory already exists, creation fails with an error (no silent overwrite).

## List Worktrees

```bash
worktrunk list [--format json|table]
```

Lists all active worktrees with branch, directory, and status:

```json
{
  "worktrees": [
    {
      "name": "eros-verify-auth",
      "branch": "eros-verify-auth",
      "directory": "/path/to/.worktrees/eros-verify-auth",
      "status": "active",
      "uncommittedChanges": 3
    }
  ]
}
```

## Verify Worktree

```bash
worktrunk verify --name <name>
```

Checks:
- Directory exists and is a valid git worktree
- Branch exists and is checked out
- No detached HEAD state
- Reports uncommitted changes count

## Cleanup Worktree

```bash
worktrunk cleanup --name <name> [--force]
```

### Safety Verification

Before removal:
1. Check for uncommitted changes (fail if present, unless `--force`)
2. Check for unpushed commits (warn if present)
3. Remove worktree: `git worktree remove <dir>`
4. Optionally delete the branch: `git branch -d <name>`

### Return Value

```json
{
  "status": "cleaned",
  "name": "eros-verify-auth",
  "branchDeleted": true,
  "hadUncommittedChanges": false
}
```

## Integrate Worktree

```bash
worktrunk integrate --name <name> --into <target-branch> [--strategy merge|rebase]
```

Merges the worktree branch back into the target branch:

1. Verify worktree has no uncommitted changes
2. Switch to target branch in main working directory
3. Merge or rebase the worktree branch
4. Report merge result (success, conflicts, etc.)

## Integration with techne-spawn

When `techne-spawn` creates an agent in a worktree context:

```bash
# 1. Create worktree
result=$(worktrunk create --name "claude-eros-verify" --base main)
dir=$(echo "$result" | jq -r '.directory')

# 2. Spawn agent in worktree directory
techne-spawn --agent claude-code --task "Verify auth module" --cwd "$dir"

# 3. After completion, integrate and cleanup
worktrunk integrate --name "claude-eros-verify" --into main
worktrunk cleanup --name "claude-eros-verify"
```

## Error Handling

| Error | Condition | Action |
|-------|-----------|--------|
| `directory_exists` | Target directory already exists | Fail with error, suggest different name |
| `branch_exists` | Branch name already taken | Fail with error, suggest different name |
| `uncommitted_changes` | Cleanup with dirty worktree | Fail unless `--force` |
| `merge_conflict` | Integration produces conflicts | Report conflicts, do not auto-resolve |
| `not_a_worktree` | Directory is not a git worktree | Fail with error |

## Constraints

- Worktree names must be valid git branch names (no spaces, no special characters)
- Maximum worktree count follows `ALETHEIA_WORKSHOP_MAX_WINDOWS` budget
- Always verify before cleanup -- never silently delete work
- Integration strategy defaults to `merge` for safety
