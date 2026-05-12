#!/usr/bin/env bash
# Epi-Logos session bootstrap — initializes /Self/ and assembles structured context
# Outputs JSON with additionalContext containing XML-tagged sections

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(dirname "$SCRIPT_DIR")"

# --- /Self/ folder initialization ---
# Find session root (where the plugin is installed)
SESSION_ROOT="${CLAUDE_PROJECT_ROOT:-$(pwd)}"

SELF_DIR="$SESSION_ROOT/Self"

# Thought families — Objective Six (P Day / (No)Name)
for family in Questions Traces Challenges Patterns Discovery Insight; do
    mkdir -p "$SELF_DIR/Thought/$family"
done

# Thought families — Subjective Six (P' Night / Power)
for family in Being Thrownness Presence Temporality Care Releasement; do
    mkdir -p "$SELF_DIR/Thought/$family"
done

# Anu (user identity + daily logs) and Aham (agent session logs)
TODAY=$(date +%Y-%m-%d)
mkdir -p "$SELF_DIR/anu/daily/$TODAY"
mkdir -p "$SELF_DIR/aham/daily/$TODAY"

# --- Bootstrap context assembly ---
SOURCE_GROUNDING="$PLUGIN_ROOT/resources/methods/source-grounding.md"
CANONICAL_PROOF="$PLUGIN_ROOT/resources/updated-ql-mef/the-self-proving-self.md"
CHEAT_SHEET="$PLUGIN_ROOT/resources/updated-ql-mef/epi_logos_cheat_sheet.md"
SQUARE_MAP="$PLUGIN_ROOT/resources/methods/square-basin-convergences.md"

ANU_PROFILE="$SELF_DIR/anu/profile.md"

python3 - "$SOURCE_GROUNDING" "$CANONICAL_PROOF" "$CHEAT_SHEET" "$SQUARE_MAP" "$ANU_PROFILE" << 'PYEOF'
import sys, json, os

files = {}
for i, name in enumerate(["source", "proof", "cheat", "squares", "anu"], 1):
    path = sys.argv[i]
    if os.path.isfile(path):
        with open(path) as f:
            files[name] = f.read()
    else:
        files[name] = ""

content = (
    "<SUBAGENT-STOP>\n"
    "If you were dispatched as a subagent to execute a specific task, "
    "skip this context and return to your task.\n"
    "</SUBAGENT-STOP>\n\n"
    "<EPI-LOGOS-SOURCE>\n" + files["source"] + "\n</EPI-LOGOS-SOURCE>\n\n"
    "<EPI-LOGOS-CANONICAL-PROOF>\n"
    "The Self Proving Self — the unified theoretical ground in which the "
    "etymological, Jungian, Pythagorean, topological, and Śaiva registers are "
    "shown to be one self-referential structure. The two Spanda equations "
    "(genesis and base frame) and the Name (P) and Power (P') unit tabulations "
    "are the canonical formal articulation. The §5 Quilting Table is the "
    "cross-register reference for any positional traversal. Treat this as the "
    "underlying theory; the cheat sheet below is its reference tabulation.\n\n"
    + files["proof"] + "\n</EPI-LOGOS-CANONICAL-PROOF>\n\n"
    "<EPI-LOGOS-CHEAT-SHEET>\n" + files["cheat"] + "\n</EPI-LOGOS-CHEAT-SHEET>\n\n"
    "<EPI-LOGOS-SQUARE-MAP>\n" + files["squares"] + "\n</EPI-LOGOS-SQUARE-MAP>"
)

# Include anu profile if it exists
if files["anu"]:
    content += "\n\n<EPI-LOGOS-ANU-PROFILE>\n" + files["anu"] + "\n</EPI-LOGOS-ANU-PROFILE>"

print(json.dumps({
    "hookSpecificOutput": {
        "hookEventName": "SessionStart",
        "additionalContext": content
    }
}))
PYEOF
