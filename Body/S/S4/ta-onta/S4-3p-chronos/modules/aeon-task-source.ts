// Coordinate Header
// Coordinate: S4-3' / Chronos Aeon task-source binding
// Residency: Body/S/S4/ta-onta/S4-3p-chronos/modules
// Position (#n): #3 temporal invocation binding (work-list cursor)
// Actualises: [[S4-3'-SPEC]] scheduler authority; Track 47.4 task-source binding for [[Aeon]] fires
// Public surface: parseRalphPrdTranches, advanceAeonTaskSource, loadAeonTaskCheckpoint, aeonTaskSourceBlock
// Does NOT own: PRD authorship (ralph-tui skill), Aeon dispatch (aeon-scheduling.ts), Anima dispatch implementation
// Contract: ../CONTRACT.md
//
// 47.4 — Aeon task-source binding.
// An Aeon may reference a structured task-source as its iteration work-list —
// a Ralph PRD (markdown checkboxes under ./plans/) — so a scheduled Aeon
// advances a concrete, checkpointed task list per fire rather than an open
// objective. The checkpoint is a JSON file beside the run: completed tranche
// ids + fire history persist across fires (and across process restarts).

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export type AeonTaskSourceKind = "ralph-prd";

export interface AeonTaskSourceRef {
  readonly kind: AeonTaskSourceKind;
  /** Markdown PRD path (ralph-tui `./plans/{date}-{slug}.md` shape). */
  readonly prd_path: string;
  /** JSON checkpoint persisted across fires. */
  readonly checkpoint_path: string;
}

export interface AeonTaskTranche {
  readonly id: string;
  readonly title: string;
  /** Checked in the PRD itself (`- [x]`). */
  readonly done_in_source: boolean;
}

export interface AeonTaskSourceCheckpoint {
  prd_path: string;
  completed: string[];
  fires: Array<{ fired_at_ms: number | null; tranche_id: string }>;
}

export interface AeonTaskAdvance {
  readonly exhausted: boolean;
  readonly tranche: AeonTaskTranche | null;
  readonly completed_count: number;
  readonly remaining_count: number;
  readonly checkpoint_path: string;
}

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64) || "tranche";
}

/** Parse Ralph PRD markdown checkboxes (`- [ ]` / `- [x]`) into ordered tranches. */
export function parseRalphPrdTranches(markdown: string): AeonTaskTranche[] {
  const tranches: AeonTaskTranche[] = [];
  const seen = new Map<string, number>();
  for (const line of markdown.split(/\r?\n/)) {
    const match = /^\s*[-*]\s+\[( |x|X)\]\s+(.+?)\s*$/.exec(line);
    if (!match) continue;
    const title = match[2] ?? "";
    const base = slugify(title);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    tranches.push({
      id: count === 0 ? base : `${base}-${count + 1}`,
      title,
      done_in_source: match[1] !== " ",
    });
  }
  return tranches;
}

export function loadAeonTaskCheckpoint(ref: AeonTaskSourceRef): AeonTaskSourceCheckpoint {
  if (!existsSync(ref.checkpoint_path)) {
    return { prd_path: ref.prd_path, completed: [], fires: [] };
  }
  const parsed = JSON.parse(readFileSync(ref.checkpoint_path, "utf8")) as AeonTaskSourceCheckpoint;
  if (!Array.isArray(parsed.completed) || !Array.isArray(parsed.fires)) {
    throw new Error(`Aeon task checkpoint at ${ref.checkpoint_path} is malformed`);
  }
  return parsed;
}

function persistAeonTaskCheckpoint(ref: AeonTaskSourceRef, checkpoint: AeonTaskSourceCheckpoint) {
  mkdirSync(dirname(ref.checkpoint_path), { recursive: true });
  writeFileSync(ref.checkpoint_path, `${JSON.stringify(checkpoint, null, 2)}\n`);
}

/**
 * Advance the work-list one tranche for this fire: pick the first tranche
 * neither checked in the PRD nor completed in the checkpoint, record it as
 * completed + append the fire record, persist, and return it. An exhausted
 * list returns `{ exhausted: true }` without mutating the checkpoint.
 */
export function advanceAeonTaskSource(
  ref: AeonTaskSourceRef,
  fired_at_ms?: number,
): AeonTaskAdvance {
  if (ref.kind !== "ralph-prd") {
    throw new Error(`unsupported Aeon task-source kind '${(ref as { kind: string }).kind}'`);
  }
  if (!existsSync(ref.prd_path)) {
    throw new Error(`Aeon task-source PRD not found at ${ref.prd_path}`);
  }
  const tranches = parseRalphPrdTranches(readFileSync(ref.prd_path, "utf8"));
  if (tranches.length === 0) {
    throw new Error(`Aeon task-source PRD at ${ref.prd_path} contains no checkbox tranches`);
  }
  const checkpoint = loadAeonTaskCheckpoint(ref);
  const completed = new Set(checkpoint.completed);
  const open = tranches.filter((t) => !t.done_in_source && !completed.has(t.id));

  if (open.length === 0) {
    return {
      exhausted: true,
      tranche: null,
      completed_count: tranches.length,
      remaining_count: 0,
      checkpoint_path: ref.checkpoint_path,
    };
  }

  const tranche = open[0]!;
  checkpoint.prd_path = ref.prd_path;
  checkpoint.completed.push(tranche.id);
  checkpoint.fires.push({ fired_at_ms: fired_at_ms ?? null, tranche_id: tranche.id });
  persistAeonTaskCheckpoint(ref, checkpoint);

  return {
    exhausted: false,
    tranche,
    completed_count: tranches.length - open.length + 1,
    remaining_count: open.length - 1,
    checkpoint_path: ref.checkpoint_path,
  };
}

/** The per-fire task block appended to the Aeon dispatch envelope. */
export function aeonTaskSourceBlock(advance: AeonTaskAdvance): string {
  if (advance.exhausted || !advance.tranche) {
    return "Task-source: EXHAUSTED — all tranches complete; do not begin new work.";
  }
  return [
    "Task-source tranche for this fire:",
    `tranche_id: ${advance.tranche.id}`,
    `tranche: ${advance.tranche.title}`,
    `progress: ${advance.completed_count} advanced, ${advance.remaining_count} remaining`,
    `checkpoint: ${advance.checkpoint_path}`,
  ].join("\n");
}
