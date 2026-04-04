#!/usr/bin/env bash
# tools/omx/setup-project.sh
#
# Install oh-my-codex project-scoped from the vendored source at
# vendors/oh-my-codex/, writing runtime state into <target-dir>/.codex/ and
# <target-dir>/.omx/.
#
# Usage (from repo root):
#   bash tools/omx/setup-project.sh
#
# Or with explicit paths (used by smoke tests and CI):
#   bash tools/omx/setup-project.sh --repo-root /path/to/repo --target-dir /path/to/target
#
# The generated .omx/setup-scope.json records the vendored source path so that
# any subsequent re-install can verify provenance without network access.

set -euo pipefail

# ── Argument parsing ──────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="${REPO_ROOT:-$(cd "$SCRIPT_DIR/../.." && pwd)}"
TARGET_DIR="${TARGET_DIR:-$REPO_ROOT}"

while [[ $# -gt 0 ]]; do
    case "$1" in
        --repo-root)  REPO_ROOT="$2";  shift 2 ;;
        --target-dir) TARGET_DIR="$2"; shift 2 ;;
        *) echo "Unknown argument: $1" >&2; exit 1 ;;
    esac
done

OMX_VENDOR="$REPO_ROOT/vendors/oh-my-codex"
OMX_JS="$OMX_VENDOR/dist/cli/omx.js"

# ── Preflight ─────────────────────────────────────────────────────────────────
if [[ ! -f "$OMX_JS" ]]; then
    echo "ERROR: vendored OMX not found at $OMX_JS" >&2
    echo "       Run the vendor script first or check out the submodule." >&2
    exit 1
fi

# ── Directories ───────────────────────────────────────────────────────────────
mkdir -p "$TARGET_DIR/.codex/skills"
mkdir -p "$TARGET_DIR/.codex/agents"
mkdir -p "$TARGET_DIR/.omx"

# ── Write setup-scope.json ────────────────────────────────────────────────────
# Records vendored source path for provenance and reproducibility checks.
SCOPE_FILE="$TARGET_DIR/.omx/setup-scope.json"
cat > "$SCOPE_FILE" <<JSON
{
  "schema": "1",
  "omx_vendor_path": "$OMX_VENDOR",
  "omx_js": "$OMX_JS",
  "target_dir": "$TARGET_DIR",
  "installed_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
JSON

echo "OMX project setup complete."
echo "  vendor:  $OMX_VENDOR"
echo "  target:  $TARGET_DIR"
echo "  scope:   $SCOPE_FILE"
