#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$SCRIPT_DIR/.venv"
REQS_FILE="$SCRIPT_DIR/requirements.txt"

if [[ ! -d "$VENV_DIR" ]]; then
  python3 -m venv "$VENV_DIR"
fi

source "$VENV_DIR/bin/activate"
python3 -m pip install --upgrade pip
python3 -m pip install -r "$REQS_FILE"

echo "redisvl cache service environment ready"
echo "  venv: $VENV_DIR"
echo "  python: $(command -v python3)"
echo "  requirements: $REQS_FILE"
