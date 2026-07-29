#!/usr/bin/env bash
#
# neo4j-volume-backup — scheduled offline volume snapshot of the live Bimba graph.
#
# Coordinate: #0/S0 (ops harness — substrate durability; sibling of target-sweep.sh)
# Residency: .codex/scripts/neo4j-volume-backup.sh
# Position (#n): #0 — Ground; the floor under every later recovery
# Actualises: Track 54 tranche T54.05. The S2 substrate (docker volume
#   `epi-logoscexperiments_neo4j-data`) is the only home of curated graph
#   properties that have no repo-side source. This script gives that substrate
#   a restorable copy OUTSIDE `Docker.raw`.
# Public surface: subcommands `snapshot` (default) | `prune` | `list` | `check`;
#   env config EPI_BACKUP_* (see CONFIG below); exit codes 0/2/3/4/5.
# Does NOT own: the Neo4j connection law (S2 Neo4jConfig::from_env); graph read
#   semantics; the forensic archive at ~/bimba-forensic (hand-curated evidence,
#   deliberately NOT under this script's retention).
# Contract: this script only ever deletes files IT created, matched by its own
#   exact naming pattern, and it refuses to write rather than fill a full disk.
#
# ── WHY THIS EXISTS (2026-07-28 graph-wipe postmortem) ────────────────────────
# On 2026-07-28 an unscoped `cargo test -- --ignored` ran `MATCH (n:Bimba)
# DETACH DELETE n` against the live development Neo4j and destroyed ~2,800
# enriched nodes. BOTH recovery paths were already gone before anyone looked:
#   * the APFS local snapshot was purged when 52 GB was freed on a 97%-full disk;
#   * `Docker.raw` is `[Excluded]` from Time Machine by default, so TM held
#     nothing of the volume.
# There was no backup. That — not the test that fired — is the root cause of the
# severity. This script exists so the next incident is a five-minute restore.
#
# ── WHY A VOLUME TAR AND NOT `neo4j-admin database dump` ──────────────────────
# `neo4j-admin database dump` requires a STOPPED database on Community edition
# and fails outright against a running one ("the database is in use"). Online
# backup (`neo4j-admin database backup`) is Enterprise-only. The file-level
# volume tar is therefore the only mechanism available here. It copies
# `transactions/` as well as `databases/`, so Neo4j replays its own transaction
# log on first start of the restored copy — that recovery pass is what makes a
# HOT snapshot restorable, and the restore proof for T54.05 was taken hot.
# For a guaranteed-quiesced copy, stop the container first (runbook §5).
#
# Usage:
#   .codex/scripts/neo4j-volume-backup.sh              # take a snapshot + prune
#   .codex/scripts/neo4j-volume-backup.sh snapshot --dry-run
#   .codex/scripts/neo4j-volume-backup.sh prune        # enforce retention only
#   .codex/scripts/neo4j-volume-backup.sh list
#   .codex/scripts/neo4j-volume-backup.sh check        # preflight, writes nothing
#
# Exit codes: 0 ok · 2 refused (free space) · 3 refused (lock held)
#             4 refused (docker/volume unavailable) · 5 archive verification failed

set -euo pipefail

# ── CONFIG ───────────────────────────────────────────────────────────────────
VOLUME="${EPI_BACKUP_VOLUME:-epi-logoscexperiments_neo4j-data}"
BACKUP_DIR="${EPI_BACKUP_DIR:-$HOME/epi-backups/neo4j}"
RETAIN_DAYS="${EPI_BACKUP_RETAIN_DAYS:-7}"
MIN_FREE_GIB="${EPI_BACKUP_MIN_FREE_GIB:-5}"
DOCKER_BIN="${EPI_BACKUP_DOCKER:-docker}"
HELPER_IMAGE="${EPI_BACKUP_HELPER_IMAGE:-alpine:3.20}"
LOCK_STALE_MIN="${EPI_BACKUP_LOCK_STALE_MIN:-120}"
# Fallback size estimate (KiB) used only when no prior snapshot exists.
EST_FALLBACK_KIB="${EPI_BACKUP_EST_FALLBACK_KIB:-1048576}"

# The one naming pattern this script owns. Retention NEVER globs wider than this.
PREFIX="epi-neo4j-data-"
SUFFIX=".tar.gz"
GLOB="${PREFIX}????????T??????Z${SUFFIX}"

INCOMING="$BACKUP_DIR/.incoming"
LOCK_DIR="$BACKUP_DIR/.lock"
LOCK_HELD=0

log()  { printf '%s [neo4j-backup] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
warn() { printf '%s [neo4j-backup] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*" >&2; }
die()  { local code="$1"; shift; warn "REFUSED: $*"; exit "$code"; }

# ── LOCK (atomic mkdir; a slow run must never interleave with the next tick) ──
release_lock() {
  if [ "$LOCK_HELD" = "1" ]; then rm -rf "$LOCK_DIR"; LOCK_HELD=0; fi
}
trap release_lock EXIT INT TERM

acquire_lock() {
  mkdir -p "$BACKUP_DIR"
  if mkdir "$LOCK_DIR" 2>/dev/null; then
    echo "$$" > "$LOCK_DIR/pid"; LOCK_HELD=1; return 0
  fi
  # Held. Reclaim ONLY when the owner is provably dead and the lock is stale.
  local owner age_min now mtime
  owner="$(cat "$LOCK_DIR/pid" 2>/dev/null || echo '')"
  now="$(date -u +%s)"
  mtime="$(stat -f %m "$LOCK_DIR" 2>/dev/null || echo "$now")"
  age_min=$(( (now - mtime) / 60 ))
  if [ -n "$owner" ] && kill -0 "$owner" 2>/dev/null; then
    die 3 "another run holds $LOCK_DIR (pid $owner, ${age_min}m old) — this tick is skipped"
  fi
  if [ "$age_min" -lt "$LOCK_STALE_MIN" ]; then
    die 3 "$LOCK_DIR held by pid '${owner:-unknown}' (${age_min}m old, stale threshold ${LOCK_STALE_MIN}m) — this tick is skipped"
  fi
  warn "reclaiming stale lock $LOCK_DIR (pid '${owner:-unknown}' not running, ${age_min}m old)"
  rm -rf "$LOCK_DIR"
  mkdir "$LOCK_DIR" || die 3 "could not acquire $LOCK_DIR after reclaim"
  echo "$$" > "$LOCK_DIR/pid"; LOCK_HELD=1
}

# ── FREE SPACE (the disk is a co-cause of this incident: refuse, never fill) ──
free_kib() { df -Pk "$BACKUP_DIR" | awk 'NR==2 {print $4}'; }

newest_snapshot() {
  find "$BACKUP_DIR" -maxdepth 1 -type f -name "$GLOB" 2>/dev/null | sort | tail -1
}

estimate_kib() {
  local newest
  newest="$(newest_snapshot)"
  if [ -n "$newest" ] && [ -f "$newest" ]; then
    # Twice the last snapshot: headroom for growth plus the .incoming copy.
    echo $(( $(du -k "$newest" | awk '{print $1}') * 2 ))
  else
    echo "$EST_FALLBACK_KIB"
  fi
}

# Refuse when free space is below the floor, OR would fall below it after
# writing. A scheduled job that fills a nearly-full disk CAUSES the next
# incident; it does not prevent one.
assert_free_space() {
  local free min est after
  mkdir -p "$BACKUP_DIR"
  free="$(free_kib)"
  min=$(( MIN_FREE_GIB * 1024 * 1024 ))
  est="$(estimate_kib)"
  after=$(( free - est ))
  log "free space: $(( free / 1024 ))MiB available · floor ${MIN_FREE_GIB}GiB · this snapshot est $(( est / 1024 ))MiB · projected after $(( after / 1024 ))MiB"
  if [ "$free" -lt "$min" ]; then
    die 2 "insufficient free space: $(( free / 1024 ))MiB available is below the ${MIN_FREE_GIB}GiB floor. NO snapshot taken — free disk space, then re-run. (Backups are not worth filling the disk that already cost us one recovery path.)"
  fi
  if [ "$after" -lt "$min" ]; then
    die 2 "insufficient free space: writing an estimated $(( est / 1024 ))MiB would leave $(( after / 1024 ))MiB, below the ${MIN_FREE_GIB}GiB floor. NO snapshot taken."
  fi
}

assert_docker() {
  command -v "$DOCKER_BIN" >/dev/null 2>&1 || die 4 "docker binary '$DOCKER_BIN' not on PATH (launchd PATH is minimal — set EPI_BACKUP_DOCKER to an absolute path)"
  "$DOCKER_BIN" volume inspect "$VOLUME" >/dev/null 2>&1 || die 4 "docker volume '$VOLUME' not found (is Docker Desktop running?)"
}

# ── RETENTION (enforced on EVERY run; scoped to this script's own pattern) ───
prune() {
  local retain newest deleted kept f
  retain="$RETAIN_DAYS"
  newest="$(newest_snapshot)"
  deleted=0; kept=0
  [ -d "$BACKUP_DIR" ] || { log "prune: no backup dir yet"; return 0; }
  while IFS= read -r -d '' f; do
    # The newest snapshot is never pruned, whatever its age: retention must
    # never leave zero backups behind.
    if [ "$f" = "$newest" ]; then
      log "prune: keeping newest $(basename "$f") (age-exempt)"
      kept=$(( kept + 1 )); continue
    fi
    rm -f "$f" "$f.sha256"
    log "prune: deleted $(basename "$f") (older than ${retain}d)"
    deleted=$(( deleted + 1 ))
  done < <(find "$BACKUP_DIR" -maxdepth 1 -type f -name "$GLOB" -mtime +"$retain" -print0 2>/dev/null)
  local total
  total="$(find "$BACKUP_DIR" -maxdepth 1 -type f -name "$GLOB" 2>/dev/null | wc -l | tr -d ' ')"
  log "prune: retention ${retain}d enforced — $deleted deleted, $kept age-exempt, $total snapshot(s) remain"
}

list_snapshots() {
  [ -d "$BACKUP_DIR" ] || { log "no backup dir at $BACKUP_DIR"; return 0; }
  log "snapshots in $BACKUP_DIR (retention ${RETAIN_DAYS}d):"
  find "$BACKUP_DIR" -maxdepth 1 -type f -name "$GLOB" 2>/dev/null | sort |
    while IFS= read -r f; do
      printf '  %8sK  %s\n' "$(du -k "$f" | awk '{print $1}')" "$(basename "$f")"
    done
  log "free on backup filesystem: $(( $(free_kib) / 1024 ))MiB"
}

# ── SNAPSHOT ─────────────────────────────────────────────────────────────────
snapshot() {
  local dry="${1:-}"
  local stamp name partial final
  stamp="$(date -u +%Y%m%dT%H%M%SZ)"
  name="${PREFIX}${stamp}${SUFFIX}"
  partial="$INCOMING/${name}.partial"
  final="$BACKUP_DIR/$name"

  if [ "$dry" = "--dry-run" ]; then
    mkdir -p "$BACKUP_DIR"
    log "DRY RUN — would snapshot volume '$VOLUME' to $final"
    assert_free_space
    local would
    would="$(find "$BACKUP_DIR" -maxdepth 1 -type f -name "$GLOB" -mtime +"$RETAIN_DAYS" 2>/dev/null | wc -l | tr -d ' ')"
    log "DRY RUN — retention ${RETAIN_DAYS}d would consider $would snapshot(s) (newest always exempt); nothing deleted"
    return 0
  fi

  assert_docker
  acquire_lock
  assert_free_space
  mkdir -p "$INCOMING"
  rm -f "$partial"

  log "snapshotting volume '$VOLUME' -> $final"
  # Volume mounted read-only; the archive lands in .incoming and is only
  # renamed into place once it verifies. A half-written file can never be
  # mistaken for a backup.
  "$DOCKER_BIN" run --rm \
    -v "$VOLUME":/data:ro \
    -v "$INCOMING":/out \
    --entrypoint /bin/sh \
    "$HELPER_IMAGE" \
    -c "tar czf /out/$(basename "$partial") -C /data ." \
    || { rm -f "$partial"; die 5 "docker tar failed for volume '$VOLUME'"; }

  [ -s "$partial" ] || { rm -f "$partial"; die 5 "archive is empty"; }

  # Real verification: the archive must be readable AND carry the store dir.
  tar tzf "$partial" >/dev/null 2>&1 || { rm -f "$partial"; die 5 "archive is not a readable gzip tar"; }
  tar tzf "$partial" 2>/dev/null | grep -q '^\./databases/' \
    || { rm -f "$partial"; die 5 "archive has no ./databases/ — wrong volume?"; }

  local size_kib
  size_kib="$(du -k "$partial" | awk '{print $1}')"
  mv "$partial" "$final"
  (cd "$BACKUP_DIR" && shasum -a 256 "$name" > "$name.sha256")
  log "snapshot complete: $name ($(( size_kib / 1024 ))MiB) sha256=$(awk '{print $1}' "$final.sha256")"

  prune
  log "OK"
}

main() {
  local cmd="${1:-snapshot}"
  case "$cmd" in
    --dry-run) snapshot --dry-run ;;
    snapshot) snapshot "${2:-}" ;;
    prune)    acquire_lock; prune ;;
    list)     list_snapshots ;;
    check)
      mkdir -p "$BACKUP_DIR"
      log "config: volume=$VOLUME dir=$BACKUP_DIR retain=${RETAIN_DAYS}d floor=${MIN_FREE_GIB}GiB pattern=$GLOB"
      assert_free_space
      assert_docker
      log "preflight OK"
      ;;
    -h|--help|help)
      sed -n '2,60p' "$0" ;;
    *) die 1 "unknown subcommand '$cmd' (snapshot|prune|list|check)" ;;
  esac
}

main "$@"
