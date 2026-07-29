#!/usr/bin/env bash
# Offline volume snapshot of the development Neo4j.
#
# There was no backup on 2026-07-28. That, not the test that fired, is why one
# `DETACH DELETE` cost a day and a forensic transaction-log decoder.
#
# Two constraints shape this script:
#   * `neo4j-admin database dump` requires a STOPPED database on Community
#     edition. It will fail against a running container, so this takes a volume
#     tar instead.
#   * The Docker volume lives inside `Docker.raw`, which Time Machine excludes
#     by DEFAULT. A backup written anywhere inside it is not backed up. This
#     writes to a host path outside it, and `--check-tm` verifies that path is
#     not itself excluded.
#
# Usage:
#   neo4j-backup.sh                 take a snapshot, prune to retention
#   neo4j-backup.sh --verify        additionally restore it into a throwaway
#                                   instance and compare counts
#   neo4j-backup.sh --check-tm      report Time Machine exclusion status
#
# A backup that has never been restored is not a backup, so --verify is the
# mode that actually proves anything. Run it at least weekly.

set -euo pipefail

VOLUME="${EPI_NEO4J_VOLUME:-epi-logoscexperiments_neo4j-data}"
CONTAINER="${EPI_NEO4J_CONTAINER:-epi-neo4j}"
BACKUP_DIR="${EPI_NEO4J_BACKUP_DIR:-$HOME/bimba-forensic/backups}"
RETAIN_DAYS="${EPI_NEO4J_BACKUP_RETAIN_DAYS:-14}"
IMAGE="${EPI_NEO4J_IMAGE:-neo4j:5.26.21}"
THROWAWAY_PORT="${EPI_NEO4J_THROWAWAY_PORT:-7688}"

log() { printf '[neo4j-backup] %s\n' "$*"; }
die() { printf '[neo4j-backup] ERROR: %s\n' "$*" >&2; exit 1; }

check_tm() {
  log "Time Machine exclusion check for $BACKUP_DIR"
  if ! command -v tmutil >/dev/null 2>&1; then
    log "tmutil unavailable (not macOS?) — skipping"
    return 0
  fi
  if tmutil isexcluded "$BACKUP_DIR" 2>/dev/null | grep -q '\[Excluded\]'; then
    log "WARNING: $BACKUP_DIR is EXCLUDED from Time Machine."
    log "  Fix with: sudo tmutil removeexclusion \"$BACKUP_DIR\""
    return 1
  fi
  log "OK — $BACKUP_DIR is included in Time Machine"
  return 0
}

take_backup() {
  command -v docker >/dev/null 2>&1 || die "docker not found"
  docker volume inspect "$VOLUME" >/dev/null 2>&1 || die "volume $VOLUME not found"
  mkdir -p "$BACKUP_DIR"

  local stamp archive
  stamp="$(date -u +%Y%m%dT%H%M%SZ)"
  archive="neo4j-data-${stamp}.tar.gz"

  log "snapshotting volume $VOLUME -> $BACKUP_DIR/$archive"
  docker run --rm \
    -v "$VOLUME":/data:ro \
    -v "$BACKUP_DIR":/backup \
    alpine:latest \
    tar czf "/backup/$archive" -C /data . \
    || die "snapshot failed"

  local size
  size="$(du -h "$BACKUP_DIR/$archive" | cut -f1)"
  log "wrote $archive ($size)"
  echo "$BACKUP_DIR/$archive"
}

prune() {
  log "pruning snapshots older than ${RETAIN_DAYS}d in $BACKUP_DIR"
  find "$BACKUP_DIR" -name 'neo4j-data-*.tar.gz' -type f -mtime "+${RETAIN_DAYS}" -print -delete \
    | sed 's/^/[neo4j-backup]   pruned /' || true
}

# Restore into a throwaway on another port and compare against the source.
# NEVER touches the live instance or its port.
verify_restore() {
  local archive="$1"
  local work="${TMPDIR:-/tmp}/epi-neo4j-verify-$$"
  local name="epi-neo4j-verify-$$"

  log "verifying by restoring $archive into a throwaway on port $THROWAWAY_PORT"
  rm -rf "$work"; mkdir -p "$work/data"
  tar xzf "$archive" -C "$work/data" || die "extract failed"

  docker rm -f "$name" >/dev/null 2>&1 || true
  docker run -d --name "$name" \
    -p "${THROWAWAY_PORT}:7687" \
    -v "$work/data":/data \
    -e NEO4J_AUTH=none \
    "$IMAGE" >/dev/null || die "throwaway start failed"

  local tries=0
  until docker exec "$name" cypher-shell "RETURN 1;" >/dev/null 2>&1; do
    tries=$((tries + 1))
    [ "$tries" -gt 60 ] && { docker rm -f "$name" >/dev/null 2>&1; die "throwaway never became ready"; }
    sleep 3
  done

  local restored
  restored="$(docker exec "$name" cypher-shell --format plain \
    'MATCH (n:Bimba) RETURN count(n);' 2>/dev/null | tail -1 | tr -d '[:space:]')"
  local restored_props
  restored_props="$(docker exec "$name" cypher-shell --format plain \
    'MATCH (n:Bimba) RETURN sum(size(keys(n)));' 2>/dev/null | tail -1 | tr -d '[:space:]')"
  local restored_rels
  restored_rels="$(docker exec "$name" cypher-shell --format plain \
    'MATCH ()-[r]->() RETURN count(r);' 2>/dev/null | tail -1 | tr -d '[:space:]')"

  docker rm -f "$name" >/dev/null 2>&1 || true
  rm -rf "$work"

  log "restored: ${restored} :Bimba nodes, ${restored_props} properties, ${restored_rels} relationships"
  [ "${restored:-0}" -gt 0 ] || die "restore produced an empty graph — this backup is NOT usable"

  # Compare against live when it is up. A drift of a few writes is expected.
  if docker exec "$CONTAINER" cypher-shell -u neo4j -p "${NEO4J_PASSWORD:-password}" \
      'RETURN 1;' >/dev/null 2>&1; then
    local live
    live="$(docker exec "$CONTAINER" cypher-shell -u neo4j -p "${NEO4J_PASSWORD:-password}" \
      --format plain 'MATCH (n:Bimba) RETURN count(n);' 2>/dev/null | tail -1 | tr -d '[:space:]')"
    log "live: ${live} :Bimba nodes"
    if [ "${live:-0}" -gt 0 ]; then
      local diff=$(( restored > live ? restored - live : live - restored ))
      local pct=$(( diff * 100 / live ))
      [ "$pct" -le 5 ] \
        && log "PASS — restored graph is within ${pct}% of live" \
        || die "restored graph differs from live by ${pct}% — investigate before trusting this backup"
    fi
  else
    log "live instance unreachable — restore verified standalone"
  fi
}

main() {
  case "${1:-}" in
    --check-tm) check_tm; exit $? ;;
  esac

  check_tm || log "continuing despite Time Machine warning"
  local archive
  archive="$(take_backup | tail -1)"
  prune
  if [ "${1:-}" = "--verify" ]; then
    verify_restore "$archive"
  else
    log "run with --verify to prove the snapshot restores (a backup never restored is not a backup)"
  fi
  log "done"
}

main "$@"
