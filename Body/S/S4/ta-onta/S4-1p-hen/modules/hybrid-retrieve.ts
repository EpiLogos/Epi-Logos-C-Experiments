// Coordinate: S4-1' / S1 content retrieval
// Residency: Body/S/S4/ta-onta/S4-1p-hen/modules
// Position (#n): #1 typed content delta
// Actualises: [[S1-SPEC]] Hen retrieval authority for temporal re-entry
// Public surface: hen_content_delta_since
// Does NOT own: response scheduling, spread interpretation, or vault writes
// Contract: ../CONTRACT.md

import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

export interface HenContentDeltaQuery {
  readonly path: string;
  readonly since?: string;
  readonly response_token?: string;
}

export interface HenContentDelta {
  readonly path: string;
  readonly since: string | null;
  readonly response_token: string | null;
  readonly changed_at: string;
  readonly content: string;
  readonly changed: boolean;
}

interface HighlightWriteEvent {
  readonly ts?: string;
  readonly path?: string;
  readonly response_token?: string;
  readonly body_length_at_write?: number;
}

function latestHighlightEvent(path: string, responseToken: string): HighlightWriteEvent | null {
  const eventPath = join(process.env.EPI_REPO_ROOT || ".", ".khora-highlight-events.jsonl");
  if (!existsSync(eventPath)) return null;
  let latest: HighlightWriteEvent | null = null;
  for (const line of readFileSync(eventPath, "utf8").split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const event = JSON.parse(line) as HighlightWriteEvent;
      if (event.path === path && event.response_token === responseToken) latest = event;
    } catch {
      // Append-only ledgers may end with an interrupted line; earlier valid receipts remain authoritative.
    }
  }
  return latest;
}

function bodyAfterResponse(content: string, responseToken: string): string {
  const tags = content.match(/<mark\b[^>]*>/g) ?? [];
  const tag = tags.find((candidate) => candidate.includes(`data-highlight-label="${responseToken}"`));
  if (!tag) return content;
  const opening = content.indexOf(tag);
  const closing = content.indexOf("</mark>", opening + tag.length);
  return closing < 0 ? content : content.slice(closing + "</mark>".length).replace(/^\s*/, "");
}

export function hen_content_delta_since(query: HenContentDeltaQuery): HenContentDelta {
  if (!query.path.trim()) throw new Error("Hen content delta requires path");
  if (!existsSync(query.path)) throw new Error(`Hen content delta path does not exist: ${query.path}`);
  const stat = statSync(query.path);
  const changedAt = stat.mtime.toISOString();
  const sinceMs = query.since ? Date.parse(query.since) : Number.NaN;
  if (Number.isFinite(sinceMs) && stat.mtimeMs <= sinceMs) {
    return {
      path: query.path,
      since: query.since ?? null,
      response_token: query.response_token ?? null,
      changed_at: changedAt,
      content: "",
      changed: false,
    };
  }

  const content = readFileSync(query.path, "utf8");
  let delta = content;
  if (query.response_token) {
    const body = bodyAfterResponse(content, query.response_token);
    const receipt = latestHighlightEvent(query.path, query.response_token);
    const boundary = receipt?.body_length_at_write;
    delta = typeof boundary === "number" && boundary >= 0 && boundary <= body.length
      ? body.slice(boundary)
      : body;
  }
  delta = delta.trim();
  return {
    path: query.path,
    since: query.since ?? null,
    response_token: query.response_token ?? null,
    changed_at: changedAt,
    content: delta,
    changed: delta.length > 0,
  };
}
