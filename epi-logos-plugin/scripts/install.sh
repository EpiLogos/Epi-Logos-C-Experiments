#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLUGIN_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== Epi-Logos Plugin Installer ==="

# 1. Copy skills to ~/.claude/skills/
SKILLS_DIR="$HOME/.claude/skills"
mkdir -p "$SKILLS_DIR"
cp "$PLUGIN_DIR/skills/"*.md "$SKILLS_DIR/"
echo "Skills installed to $SKILLS_DIR"

# 2. Copy default overlay if none exists
QV_DIR="$HOME/.epi-logos/qv"
mkdir -p "$QV_DIR"
if [ -f "$PLUGIN_DIR/resources/qv/overlay.json" ] && [ ! -f "$QV_DIR/overlay.json" ]; then
    cp "$PLUGIN_DIR/resources/qv/overlay.json" "$QV_DIR/"
    echo "Default overlay installed to $QV_DIR"
else
    echo "Overlay already exists at $QV_DIR/overlay.json -- skipping"
fi

# 3. Check if epi CLI is installed
if command -v epi &>/dev/null; then
    echo "epi CLI found: $(which epi)"
    epi core knowing --coverage
else
    echo "epi CLI not found. Install with: cargo install --path epi-cli/"
fi

echo "=== Done ==="
