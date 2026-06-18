#!/usr/bin/env bash
# postflight-verify.sh
# PostToolUse hook: verify work completeness after agent tool use.
# Reads JSON event from stdin, checks completeness indicators, outputs JSON result to stdout.

set -euo pipefail

# Read JSON event from stdin
INPUT=$(cat)

# Extract tool name and result status
TOOL_NAME=$(echo "$INPUT" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('tool_name', data.get('toolName', 'unknown')))
except (json.JSONDecodeError, KeyError):
    print('unknown')
" 2>/dev/null || echo "unknown")

TOOL_RESULT=$(echo "$INPUT" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    result = data.get('result', data.get('output', {}))
    if isinstance(result, dict):
        print(result.get('status', 'unknown'))
    else:
        print('completed')
except (json.JSONDecodeError, KeyError):
    print('unknown')
" 2>/dev/null || echo "unknown")

# Check for completeness indicators
COMPLETENESS="unknown"
WARNINGS=""

# If tool was a file write, verify file exists
if echo "$TOOL_NAME" | grep -qiE "write|edit|create"; then
    FILE_PATH=$(echo "$INPUT" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    params = data.get('parameters', data.get('params', {}))
    print(params.get('file_path', params.get('filePath', '')))
except (json.JSONDecodeError, KeyError):
    print('')
" 2>/dev/null || echo "")

    if [ -n "$FILE_PATH" ] && [ -f "$FILE_PATH" ]; then
        COMPLETENESS="verified"
    elif [ -n "$FILE_PATH" ]; then
        COMPLETENESS="file_missing"
        WARNINGS="Expected file not found: $FILE_PATH"
    fi
else
    COMPLETENESS="assumed"
fi

# Output verification result as JSON
python3 -c "
import json, sys
result = {
    'hook': 'postflight-verify',
    'event': 'PostToolUse',
    'toolName': '$TOOL_NAME',
    'toolResult': '$TOOL_RESULT',
    'verification': {
        'completeness': '$COMPLETENESS',
        'warnings': '$WARNINGS' if '$WARNINGS' else None,
        'status': 'pass' if '$COMPLETENESS' != 'file_missing' else 'warn'
    }
}
json.dump(result, sys.stdout, indent=2)
print()
"
