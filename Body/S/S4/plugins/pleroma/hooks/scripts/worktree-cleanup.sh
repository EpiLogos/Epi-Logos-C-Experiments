#!/usr/bin/env bash
# worktree-cleanup.sh
# Stop hook: clean up worktrees and workshop windows on agent stop.
# Reads JSON event from stdin, checks for orphaned worktrees,
# cleans up workshop windows, outputs cleanup result JSON to stdout.

set -euo pipefail

# Read JSON event from stdin
INPUT=$(cat)

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
CLEANED_WORKTREES=0
CLEANED_WINDOWS=0
WARNINGS=""

# Extract session metadata
SESSION_ID=$(echo "$INPUT" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('session_id', data.get('sessionId', 'unknown')))
except (json.JSONDecodeError, KeyError):
    print('unknown')
" 2>/dev/null || echo "unknown")

WINDOW_NAME=$(echo "$INPUT" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('window_name', data.get('windowName', '')))
except (json.JSONDecodeError, KeyError):
    print('')
" 2>/dev/null || echo "")

# Check for orphaned workshop windows (windows with dead processes)
if tmux has-session -t aletheia-workshop 2>/dev/null; then
    # Find windows with dead panes
    DEAD_WINDOWS=$(tmux list-windows -t aletheia-workshop -F "#{window_name} #{pane_dead}" 2>/dev/null | grep " 1$" | awk '{print $1}' || true)

    for win in $DEAD_WINDOWS; do
        # Only clean up if this is our session's window or explicitly orphaned
        if [ -n "$WINDOW_NAME" ] && [ "$win" = "$WINDOW_NAME" ]; then
            tmux kill-window -t "aletheia-workshop:$win" 2>/dev/null && CLEANED_WINDOWS=$((CLEANED_WINDOWS + 1)) || true
        fi
    done
fi

# Check for orphaned worktrees (worktrees with missing branches)
if git rev-parse --git-dir >/dev/null 2>&1; then
    WORKTREE_LIST=$(git worktree list --porcelain 2>/dev/null || true)

    # Count worktrees that reference missing branches
    ORPHANED=$(echo "$WORKTREE_LIST" | grep -c "prunable" 2>/dev/null || echo "0")

    if [ "$ORPHANED" -gt 0 ]; then
        # Prune stale worktree references (safe operation)
        git worktree prune 2>/dev/null && CLEANED_WORKTREES=$ORPHANED || WARNINGS="Failed to prune worktrees"
    fi
fi

# Clean up shared file directories for closed windows
if [ -n "$WINDOW_NAME" ] && [ -d "/tmp/aletheia-workshop/$WINDOW_NAME" ]; then
    # Keep files for 24 hours, then clean
    find "/tmp/aletheia-workshop/$WINDOW_NAME" -mtime +1 -delete 2>/dev/null || true
fi

# Output cleanup result as JSON
python3 -c "
import json, sys

result = {
    'hook': 'worktree-cleanup',
    'event': 'Stop',
    'timestamp': '$TIMESTAMP',
    'sessionId': '$SESSION_ID',
    'cleanup': {
        'worktreesPruned': $CLEANED_WORKTREES,
        'windowsClosed': $CLEANED_WINDOWS,
        'warnings': '$WARNINGS' if '$WARNINGS' else None,
        'status': 'clean'
    }
}

json.dump(result, sys.stdout, indent=2)
print()
"
