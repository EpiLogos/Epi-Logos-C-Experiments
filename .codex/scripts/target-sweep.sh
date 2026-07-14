#!/bin/sh
# target-sweep — cargo build-artifact hygiene for the multi-workspace repo.
#
# WHY THIS EXISTS (2026-07-14 ENOSPC postmortem): the repo holds 13+
# independent cargo workspaces (epi-cli, graph-services, gateway,
# gateway-contract, the S5 crates, ...). With per-workspace target/ dirs
# and cargo's no-eviction policy this grew to ~80G (epi-cli deps/ alone:
# 35G / 78k files) and filled the disk mid-gate.
#
# Since 2026-07-14 the repo-root `.cargo/config.toml` points EVERY workspace
# at ONE shared pool: REPO_ROOT/target (user-ratified). This script sweeps
# that pool — plus any stray per-crate target/ that predates the switch or
# sneaks back in. Everything under target/ is regenerable; the only cost of
# a sweep is one cold rebuild.
#
# Usage:
#   .codex/scripts/target-sweep.sh            # report sizes only
#   .codex/scripts/target-sweep.sh --clean    # remove every target dir
#   .codex/scripts/target-sweep.sh --clean-over-gb 5   # remove only dirs > 5G
#
# Never sweep mid-verify: check `ls .codex/verify.lock` first.

set -eu
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
MODE="${1:-report}"
THRESHOLD_GB="${2:-0}"

if [ -d "$REPO_ROOT/.codex/verify.lock" ]; then
  echo "[target-sweep] REFUSED: a verify run holds .codex/verify.lock — sweep after it drains" >&2
  exit 1
fi

total_kb=0
find "$REPO_ROOT" -maxdepth 5 -name target -type d -not -path "*/node_modules/*" 2>/dev/null |
  while read -r dir; do
    kb=$(du -sk "$dir" | cut -f1)
    gb=$((kb / 1024 / 1024))
    printf '%8sK  %s\n' "$kb" "$dir"
    case "$MODE" in
      --clean)
        rm -rf "$dir" && echo "          swept"
        ;;
      --clean-over-gb)
        if [ "$gb" -ge "$THRESHOLD_GB" ]; then
          rm -rf "$dir" && echo "          swept (>= ${THRESHOLD_GB}G)"
        fi
        ;;
    esac
  done

df -h /System/Volumes/Data | tail -1
