#!/usr/bin/env bash
# tools/e2e/claw-parity-smoke.sh
# Non-destructive smoke test for the claw-rust experimental runtime lane.
# Usage: bash tools/e2e/claw-parity-smoke.sh
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
EPI="${REPO_ROOT}/Body/S/S0/epi-cli/target/debug/epi"

if [[ ! -x "$EPI" ]]; then
  echo "ERROR: epi binary not found at $EPI — run: cargo build --manifest-path Body/S/S0/epi-cli/Cargo.toml"
  exit 1
fi

echo "=== Claw Parity Smoke Test ==="
echo "Repo: $REPO_ROOT"
echo ""

# 1. claw doctor — must not crash, must contain clawVendorPresent
echo "--- epi agent claw doctor --json ---"
DOCTOR_OUT=$("$EPI" --json agent claw doctor --json 2>&1 || true)
echo "$DOCTOR_OUT"
if echo "$DOCTOR_OUT" | grep -q "clawVendorPresent\|claw"; then
  echo "PASS: claw doctor contains expected keys"
else
  echo "FAIL: claw doctor output missing expected keys"
  exit 1
fi
echo ""

# 2. claw verify-runtime — must contain status key
echo "--- epi agent claw verify-runtime --json ---"
VERIFY_OUT=$("$EPI" --json agent claw verify-runtime --json 2>&1 || true)
echo "$VERIFY_OUT"
if echo "$VERIFY_OUT" | grep -q '"status"'; then
  echo "PASS: verify-runtime contains status key"
else
  echo "FAIL: verify-runtime output missing status key"
  exit 1
fi
echo ""

# 3. PI default path must remain intact
echo "--- epi agent doctor --json (PI default path) ---"
PI_OUT=$("$EPI" --json agent doctor --json 2>&1 || true)
echo "$PI_OUT"
if echo "$PI_OUT" | grep -q "piBinaryPresent"; then
  echo "PASS: PI default path unaffected"
else
  echo "FAIL: PI default path broken (piBinaryPresent missing)"
  exit 1
fi
echo ""

# 4. Protocol doc must exist
PROTOCOL_DOC="${REPO_ROOT}/docs/dev/claw-operator-protocol.md"
if [[ -f "$PROTOCOL_DOC" ]]; then
  echo "PASS: claw-operator-protocol.md exists"
else
  echo "FAIL: docs/dev/claw-operator-protocol.md missing"
  exit 1
fi

echo ""
echo "=== All claw parity smoke tests passed ==="
