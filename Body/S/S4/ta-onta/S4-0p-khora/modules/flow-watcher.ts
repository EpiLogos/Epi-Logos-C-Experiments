import { existsSync, readFileSync, statSync, watch, watchFile, unwatchFile, type FSWatcher } from "node:fs";
import { basename, join } from "node:path";

export const TRANCHE_COMPLETE_EXPLICIT = "tranche.complete.explicit" as const;
export const TRANCHE_COMPLETE_QUIET = "tranche.complete.quiet" as const;
export const TRANCHE_COMPLETE_RHYTHM = "tranche.complete.rhythm" as const;
export const RESULT_ARTIFACT_WAKE = "khora.result.wake" as const;

export type TrancheCompleteKind =
  | typeof TRANCHE_COMPLETE_EXPLICIT
  | typeof TRANCHE_COMPLETE_QUIET
  | typeof TRANCHE_COMPLETE_RHYTHM;

export interface TrancheCompleteEvent {
  readonly kind: TrancheCompleteKind;
  readonly session_id: string;
  readonly day_id: string;
  readonly path: string;
  readonly source: "content-change" | "quiet-timer" | "file-reentry";
  readonly detected_at: string;
  readonly marker?: string;
  readonly inode?: number | null;
  readonly quiet_duration_ms?: number;
}

export type ResultArtifactPurpose = "implement" | "review" | "explore" | "search" | "converse";
export type ResultDropScope = "now" | "day";

export interface ResultArtifactWakeEvent {
  readonly kind: typeof RESULT_ARTIFACT_WAKE;
  readonly session_id: string;
  readonly day_id: string;
  readonly path: string;
  readonly source: "artifact-created";
  readonly detected_at: string;
  readonly directory_scope: ResultDropScope;
  readonly purpose: ResultArtifactPurpose;
}

export type KhoraFlowEvent = TrancheCompleteEvent | ResultArtifactWakeEvent;

export interface KhoraFlowWatcherConfig {
  readonly sessionId: string;
  readonly dayId: string;
  readonly nowPath?: string | null;
  readonly dailyNotePath?: string | null;
  readonly resultDropNowDir?: string | null;
  readonly resultDropDayDir?: string | null;
  readonly trancheMarker?: string;
  readonly debounceMs?: number;
  readonly quietDurationMs?: number;
  readonly onEvent: (event: KhoraFlowEvent) => void | Promise<void>;
}

export interface KhoraFlowWatcher {
  start(): void;
  stop(): void;
  recordKeystroke(path?: string): void;
  handleFileOpened(path: string): void;
  watchedPaths(): readonly string[];
}

interface WatchedFileState {
  readonly path: string;
  readonly inode: number | null;
  readonly mtimeMs: number | null;
}

const DEFAULT_MARKER = "///";
const DEFAULT_DEBOUNCE_MS = 2_000;
const DEFAULT_QUIET_DURATION_MS = 90 * 60 * 1_000;

export function explicitTrancheMarkerPattern(marker = DEFAULT_MARKER): RegExp {
  const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|\\r?\\n)[\\t ]*${escaped}[\\t ]*(?:\\r?\\n|$)`);
}

export function hasExplicitTrancheMarker(content: string, marker = DEFAULT_MARKER): boolean {
  return explicitTrancheMarkerPattern(marker).test(content);
}

export function parseQuietDurationMs(value: string | null | undefined): number | null {
  if (!value) return null;
  const raw = value.trim();
  const quietValue = raw.startsWith("quiet:") ? raw.slice("quiet:".length) : raw;
  const match = /^(\d+(?:\.\d+)?)(ms|s|m|h)$/i.exec(quietValue);
  if (!match) return null;
  const amount = Number.parseFloat(match[1]);
  const unit = match[2].toLowerCase();
  if (!Number.isFinite(amount) || amount < 0) return null;
  if (unit === "ms") return Math.round(amount);
  if (unit === "s") return Math.round(amount * 1_000);
  if (unit === "m") return Math.round(amount * 60_000);
  return Math.round(amount * 60 * 60_000);
}

export function quietDurationFromFrontmatter(content: string): number | null {
  const match = /^c_3_tranche_mode:\s*["']?([^"'\n]+)["']?/m.exec(content);
  return parseQuietDurationMs(match?.[1]);
}

export function fileState(path: string): WatchedFileState | null {
  if (!existsSync(path)) return null;
  const stat = statSync(path);
  return {
    path,
    inode: typeof stat.ino === "number" ? stat.ino : null,
    mtimeMs: typeof stat.mtimeMs === "number" ? stat.mtimeMs : null,
  };
}

export function createKhoraFlowWatcher(config: KhoraFlowWatcherConfig): KhoraFlowWatcher {
  const marker = config.trancheMarker ?? DEFAULT_MARKER;
  const debounceMs = config.debounceMs ?? DEFAULT_DEBOUNCE_MS;
  let quietDurationMs = config.quietDurationMs ?? DEFAULT_QUIET_DURATION_MS;
  const watched = [config.nowPath, config.dailyNotePath]
    .filter((path): path is string => Boolean(path))
    .filter((path, index, all) => all.indexOf(path) === index);
  const resultDropDirs = [
    { scope: "now" as const, path: config.resultDropNowDir },
    { scope: "day" as const, path: config.resultDropDayDir },
  ]
    .filter((entry): entry is { scope: ResultDropScope; path: string } => Boolean(entry.path))
    .filter((entry, index, all) => all.findIndex((candidate) => candidate.path === entry.path) === index);
  const fsWatchers = new Map<string, FSWatcher>();
  const pollingPaths = new Set<string>();
  const states = new Map<string, WatchedFileState>();
  const observedResultArtifacts = new Set<string>();
  const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();
  let quietTimer: ReturnType<typeof setTimeout> | null = null;
  let lastTouchedPath = watched[0] ?? "";
  let stopped = false;

  const emit = (event: TrancheCompleteEvent) => {
    void Promise.resolve(config.onEvent(event));
  };

  const emitResultWake = (event: ResultArtifactWakeEvent) => {
    void Promise.resolve(config.onEvent(event));
  };

  const buildEvent = (
    kind: TrancheCompleteKind,
    path: string,
    source: TrancheCompleteEvent["source"],
    extra: Partial<TrancheCompleteEvent> = {},
  ): TrancheCompleteEvent => ({
    kind,
    session_id: config.sessionId,
    day_id: config.dayId,
    path,
    source,
    detected_at: new Date().toISOString(),
    ...extra,
  });

  const scanChangedPath = (path: string) => {
    if (stopped || !existsSync(path)) return;
    const state = fileState(path);
    if (state) states.set(path, state);

    const content = readFileSync(path, "utf8");
    quietDurationMs = quietDurationFromFrontmatter(content) ?? quietDurationMs;
    if (hasExplicitTrancheMarker(content, marker)) {
      emit(buildEvent(TRANCHE_COMPLETE_EXPLICIT, path, "content-change", {
        marker,
        inode: state?.inode ?? null,
      }));
    }
    resetQuietTimer(path);
  };

  const scheduleScan = (path: string) => {
    lastTouchedPath = path;
    const existing = debounceTimers.get(path);
    if (existing) clearTimeout(existing);
    debounceTimers.set(path, setTimeout(() => {
      debounceTimers.delete(path);
      scanChangedPath(path);
    }, debounceMs));
  };

  const inspectResultArtifact = (dir: string, scope: ResultDropScope, filename: string) => {
    if (stopped || !filename.endsWith(".result.md")) return;
    const path = join(dir, filename);
    if (observedResultArtifacts.has(path) || !existsSync(path)) return;
    observedResultArtifacts.add(path);
    emitResultWake({
      kind: RESULT_ARTIFACT_WAKE,
      session_id: config.sessionId,
      day_id: config.dayId,
      path,
      source: "artifact-created",
      detected_at: new Date().toISOString(),
      directory_scope: scope,
      purpose: resultArtifactPurpose(path),
    });
  };

  function resetQuietTimer(path = lastTouchedPath) {
    if (quietTimer) clearTimeout(quietTimer);
    if (!path) return;
    quietTimer = setTimeout(() => {
      const state = fileState(path);
      if (state) states.set(path, state);
      emit(buildEvent(TRANCHE_COMPLETE_QUIET, path, "quiet-timer", {
        inode: state?.inode ?? null,
        quiet_duration_ms: quietDurationMs,
      }));
    }, quietDurationMs);
  }

  return {
    start() {
      stopped = false;
      for (const path of watched) {
        const state = fileState(path);
        if (state) states.set(path, state);
        if (!existsSync(path)) continue;
        if (!fsWatchers.has(path)) {
          fsWatchers.set(path, watch(path, { persistent: false }, () => scheduleScan(path)));
        }
        if (!pollingPaths.has(path)) {
          pollingPaths.add(path);
          watchFile(path, { persistent: false, interval: debounceMs }, (current, previous) => {
            if (current.mtimeMs !== previous.mtimeMs || current.ino !== previous.ino) {
              scheduleScan(path);
            }
          });
        }
      }
      for (const entry of resultDropDirs) {
        if (!existsSync(entry.path)) continue;
        const watcherKey = `result:${entry.scope}:${entry.path}`;
        if (fsWatchers.has(watcherKey)) continue;
        fsWatchers.set(watcherKey, watch(entry.path, { persistent: false }, (_event, filename) => {
          if (typeof filename !== "string") return;
          inspectResultArtifact(entry.path, entry.scope, filename);
        }));
      }
      resetQuietTimer(lastTouchedPath);
    },

    stop() {
      stopped = true;
      for (const watcher of fsWatchers.values()) watcher.close();
      fsWatchers.clear();
      for (const path of pollingPaths) unwatchFile(path);
      pollingPaths.clear();
      for (const timer of debounceTimers.values()) clearTimeout(timer);
      debounceTimers.clear();
      if (quietTimer) clearTimeout(quietTimer);
      quietTimer = null;
    },

    recordKeystroke(path = lastTouchedPath) {
      if (!path) return;
      lastTouchedPath = path;
      resetQuietTimer(path);
    },

    handleFileOpened(path: string) {
      const watchedPath = watched.find((candidate) => candidate === path || basename(candidate) === basename(path));
      if (!watchedPath) return;
      const state = fileState(watchedPath);
      const previous = states.get(watchedPath);
      if (state) states.set(watchedPath, state);
      emit(buildEvent(TRANCHE_COMPLETE_RHYTHM, watchedPath, "file-reentry", {
        inode: state?.inode ?? previous?.inode ?? null,
      }));
    },

    watchedPaths() {
      return Object.freeze([...watched, ...resultDropDirs.map((entry) => entry.path)]);
    },
  };
}

function resultArtifactPurpose(path: string): ResultArtifactPurpose {
  const name = basename(path).toLowerCase();
  for (const purpose of ["implement", "review", "explore", "search", "converse"] as const) {
    if (name.startsWith(`${purpose}.`) || name.includes(`.${purpose}.`)) return purpose;
  }
  try {
    const content = readFileSync(path, "utf8");
    const match = /^(?:purpose|c_4_purpose):\s*["']?([a-z-]+)["']?/m.exec(content);
    const value = match?.[1];
    if (value === "implement" || value === "review" || value === "explore" || value === "search" || value === "converse") {
      return value;
    }
  } catch {
    // The artifact may still be settling after the create event; fall back to explore.
  }
  return "explore";
}
