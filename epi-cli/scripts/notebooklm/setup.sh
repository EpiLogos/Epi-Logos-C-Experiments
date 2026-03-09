#!/bin/bash
# Setup NotebookLM skill venv

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"
VENV_DIR="$SKILL_DIR/.venv"

echo "🐍 Setting up NotebookLM skill environment..."

# Create venv if not exists
if [[ ! -d "$VENV_DIR" ]]; then
    echo "Creating virtual environment..."
    python3 -m venv "$VENV_DIR"
fi

# Activate and install deps
echo "Installing dependencies..."
source "$VENV_DIR/bin/activate"

pip install --quiet --upgrade pip

# Core deps
pip install --quiet thefuzz python-Levenshtein 2>/dev/null || pip install --quiet thefuzz

# NotebookLM unofficial API from GitHub (teng-lin's version)
pip install --quiet git+https://github.com/teng-lin/notebooklm-py.git 2>/dev/null || \
    echo "⚠️  notebooklm-py not found, using mock mode"

echo "✅ NotebookLM skill ready!"
echo ""
echo "Usage:"
echo "  ./skills/notebooklm/scripts/query_notebook.py list"
echo "  ./skills/notebooklm/scripts/query_notebook.py search --query 'AI writing'"
echo "  ./skills/notebooklm/scripts/query_notebook.py query --notebook 'AI writing' --query 'minimal agents' --context skill_building"
