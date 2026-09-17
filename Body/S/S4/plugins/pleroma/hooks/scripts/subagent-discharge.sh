#!/usr/bin/env bash
# subagent-discharge.sh
# Stop hook: structured discharge on agent stop.
# Emits metadata JSON including session summary, coordinates used, Mobius return signal if applicable.
# Reads JSON event from stdin, writes JSON discharge metadata to stdout.

set -euo pipefail

# Read JSON event from stdin
INPUT=$(cat)

# Extract session and agent metadata
SESSION_ID=$(echo "$INPUT" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('session_id', data.get('sessionId', 'unknown')))
except (json.JSONDecodeError, KeyError):
    print('unknown')
" 2>/dev/null || echo "unknown")

AGENT_TYPE=$(echo "$INPUT" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('agent_type', data.get('agentType', 'unknown')))
except (json.JSONDecodeError, KeyError):
    print('unknown')
" 2>/dev/null || echo "unknown")

CF_IDENTITY="${CF_IDENTITY:-unset}"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Check if a Mobius return signal was emitted during this session
MOBIUS_RETURN="false"
MOBIUS_INSIGHT=""
MOBIUS_QUESTIONS=""

# Look for Mobius return markers in recent output
if [ "$CF_IDENTITY" = "(5/0)" ]; then
    # Sophia agent -- check for Mobius return
    MOBIUS_RETURN="true"
    MOBIUS_INSIGHT="Session completed with Sophia synthesis"
    MOBIUS_QUESTIONS="Review P0 questions from session output"
fi

# Collect coordinates used during session (from environment)
VAK_COORDINATES=$(echo "$INPUT" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    coords = data.get('vak_coordinates', data.get('vakCoordinates', {}))
    json.dump(coords, sys.stdout)
except (json.JSONDecodeError, KeyError):
    json.dump({}, sys.stdout)
" 2>/dev/null || echo "{}")

# Emit structured discharge metadata
python3 -c "
import json, sys

discharge = {
    'hook': 'subagent-discharge',
    'event': 'Stop',
    'timestamp': '$TIMESTAMP',
    'session': {
        'id': '$SESSION_ID',
        'agentType': '$AGENT_TYPE',
        'cfIdentity': '$CF_IDENTITY'
    },
    'summary': {
        'status': 'discharged',
        'coordinatesUsed': $VAK_COORDINATES,
        'completionType': 'graceful'
    },
    'mobiusReturn': {
        'emitted': $MOBIUS_RETURN,
        'insight': '$MOBIUS_INSIGHT' if $MOBIUS_RETURN else None,
        'questions': '$MOBIUS_QUESTIONS' if $MOBIUS_RETURN else None,
        'signal': 'm_5_mobius_return' if $MOBIUS_RETURN else None
    },
    'nightExtraction': {
        'available': True,
        'sessionLog': '~/.onecontext/epi-logos/log.md',
        'commitLog': '~/.onecontext/epi-logos/commit.md'
    }
}

json.dump(discharge, sys.stdout, indent=2)
print()
"
