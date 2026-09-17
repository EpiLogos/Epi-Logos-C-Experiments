// Coordinate: S4-0' / S0 canonical highlighted write authority
// Residency: Body/S/S4/ta-onta/S4-0p-khora/modules
// Position (#n): #0 write primitive
// Actualises: [[S0-SPEC]] Khora write authority for [[M4]] agent inscriptions
// Public surface: khora_write_highlighted_inscription, enqueueKhoraSyncEvent
// Does NOT own: highlight interpretation, temporal scheduling, or canvas rendering
// Contract: ../CONTRACT.md

import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

export const AGENT_HIGHLIGHT_CATEGORIES = Object.freeze([
  "recognition",
  "prospective-surfacing",
  "retrospective-surfacing",
  "kairos-touch",
  "somatic-mark",
  "live-spread",
] as const);

export type KhoraAgentHighlightCategory = (typeof AGENT_HIGHLIGHT_CATEGORIES)[number];

export interface KhoraHighlightedInscriptionInput {
  readonly path: string;
  readonly category: KhoraAgentHighlightCategory;
  readonly position?: "top" | "bottom";
  readonly content: string;
  readonly response_token: string;
  readonly coordinate?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replace(/"/g, "&quot;");
}

function highlightedInscriptionBlock(input: KhoraHighlightedInscriptionInput, timestamp: number): string {
  const highlightId = `agent_${input.response_token.replace(/[^a-zA-Z0-9_-]/g, "_")}_${timestamp}`;
  const safeContent = escapeHtml(input.content.trim());
  return [
    `<mark class="m4-nara-highlight m4-nara-highlight-${input.category}" data-highlight-id="${highlightId}" data-category="${input.category}" data-timestamp="${timestamp}" data-original-text="${escapeAttribute(input.content.trim())}" data-highlight-label="${escapeAttribute(input.response_token)}">`,
    safeContent,
    "</mark>",
    "",
  ].join("\n");
}

export async function enqueueKhoraSyncEvent(event: { path: string; coordinate?: string; action: string }): Promise<void> {
  const queuePath = join(process.env.EPI_REPO_ROOT || ".", ".khora-sync-queue.jsonl");
  mkdirSync(dirname(queuePath), { recursive: true });
  appendFileSync(queuePath, `${JSON.stringify({ ...event, ts: new Date().toISOString() })}\n`, "utf8");
}

export async function khora_write_highlighted_inscription(
  input: KhoraHighlightedInscriptionInput,
): Promise<{ path: string; response_token: string; category: KhoraAgentHighlightCategory }> {
  if (!AGENT_HIGHLIGHT_CATEGORIES.includes(input.category)) {
    throw new Error(`Unsupported agent highlight category: ${input.category}`);
  }
  if (!input.path.trim()) throw new Error("path is required");
  if (!input.content.trim()) throw new Error("content is required");
  if (!input.response_token.trim()) throw new Error("response_token is required");

  mkdirSync(dirname(input.path), { recursive: true });
  const existing = existsSync(input.path) ? readFileSync(input.path, "utf8") : "";
  const timestamp = Date.now();
  const block = highlightedInscriptionBlock(input, timestamp);
  const next = input.position === "bottom"
    ? `${existing.trimEnd()}\n\n${block}`
    : `${block}${existing.replace(/^\s*/, "")}`;

  writeFileSync(input.path, next, "utf8");
  await enqueueKhoraSyncEvent({
    path: input.path,
    coordinate: input.coordinate,
    action: "write",
  });
  const eventPath = join(process.env.EPI_REPO_ROOT || ".", ".khora-highlight-events.jsonl");
  mkdirSync(dirname(eventPath), { recursive: true });
  appendFileSync(eventPath, `${JSON.stringify({
    ts: new Date(timestamp).toISOString(),
    written_at_ms: timestamp,
    path: input.path,
    category: input.category,
    response_token: input.response_token,
    body_length_at_write: existing.length,
    source: "khora_write_highlighted_inscription",
  })}\n`, "utf8");

  return { path: input.path, response_token: input.response_token, category: input.category };
}
