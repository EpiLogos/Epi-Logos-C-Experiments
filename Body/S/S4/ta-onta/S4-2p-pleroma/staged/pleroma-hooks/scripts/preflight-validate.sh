#!/usr/bin/env bash
# preflight-validate.sh
# PreToolUse hook: validate plugin and runtime state before agent tool use.
# Reads JSON event from stdin, checks required fields, outputs JSON result to stdout.

set -euo pipefail

# Read JSON event from stdin
INPUT=$(cat)

# Extract tool name (handle missing field gracefully)
TOOL_NAME=$(echo "$INPUT" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('tool_name', data.get('toolName', 'unknown')))
except (json.JSONDecodeError, KeyError):
    print('unknown')
" 2>/dev/null || echo "unknown")

# Extract session ID if present
SESSION_ID=$(echo "$INPUT" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('session_id', data.get('sessionId', '')))
except (json.JSONDecodeError, KeyError):
    print('')
" 2>/dev/null || echo "")

# Validate workshop state if tool involves agent spawning
WORKSHOP_STATUS="not_checked"
if echo "$TOOL_NAME" | grep -qiE "spawn|tmux|mprocs|worktree"; then
    if tmux has-session -t aletheia-workshop 2>/dev/null; then
        WORKSHOP_STATUS="active"
        CURRENT_WINDOWS=$(tmux list-windows -t aletheia-workshop 2>/dev/null | wc -l | tr -d ' ')
        MAX_WINDOWS="${ALETHEIA_WORKSHOP_MAX_WINDOWS:-5}"
        if [ "$CURRENT_WINDOWS" -ge "$MAX_WINDOWS" ]; then
            WORKSHOP_STATUS="budget_ceiling_reached"
        fi
    else
        WORKSHOP_STATUS="not_running"
    fi
fi

# Check CF_IDENTITY if set
CF_IDENTITY="${CF_IDENTITY:-unset}"

# Output validation result as JSON
python3 -c "
import json, sys
result = {
    'hook': 'preflight-validate',
    'event': 'PreToolUse',
    'toolName': '$TOOL_NAME',
    'sessionId': '$SESSION_ID',
    'validation': {
        'workshopStatus': '$WORKSHOP_STATUS',
        'cfIdentity': '$CF_IDENTITY',
        'status': 'pass' if '$WORKSHOP_STATUS' not in ['budget_ceiling_reached'] else 'warn'
    },
    'proceed': True if '$WORKSHOP_STATUS' != 'budget_ceiling_reached' else False
}
json.dump(result, sys.stdout, indent=2)
print()
"
