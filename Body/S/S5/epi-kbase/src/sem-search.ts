/**
 * S5.2' kbase semantic search.
 *
 * Wraps bkmr --gemini sem-search with project scoping.
 * Used by agents (via Aletheia/Agora) to query the bounded resource field.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { resolveEffectiveProject } from "./project-scope.js";

const execFileAsync = promisify(execFile);

export interface KbaseSearchResult {
  text: string;
  sourcePath: string;
  score: number;
  provenance?: string;
}

export interface KbaseSearchInput {
  query: string;
  project?: string;
  topN?: number;
}

export interface KbaseSearchOutput {
  results: KbaseSearchResult[];
  query: string;
  project: string;
  count: number;
  available: boolean;
  error?: string;
}

function parseLine(line: string): KbaseSearchResult | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const parts = trimmed.split("|").map((p) => p.trim());
  if (parts.length < 3) return null;

  const score = Number(parts[2]);
  if (Number.isNaN(score)) return null;

  return {
    text: parts[0],
    sourcePath: parts[1],
    score,
    provenance: parts[3] || undefined,
  };
}

export async function kbaseSearch(
  input: KbaseSearchInput,
): Promise<KbaseSearchOutput> {
  const { query, topN = 10 } = input;
  const project = resolveEffectiveProject(input.project);

  const args = [
    "--gemini",
    "sem-search",
    query,
    "--project",
    project,
    "--top",
    String(topN),
  ];

  try {
    let stdout = "";
    try {
      const result = await execFileAsync("bkmr", args);
      stdout = result.stdout;
    } catch (error) {
      const err = error as { stdout?: string; stderr?: string };
      stdout = err.stdout || "";
    }

    if (!stdout.trim()) {
      return { results: [], query, project, count: 0, available: true };
    }

    const results: KbaseSearchResult[] = [];
    for (const line of stdout.split("\n")) {
      const parsed = parseLine(line);
      if (parsed) results.push(parsed);
    }

    return {
      results: results.slice(0, topN),
      query,
      project,
      count: results.length,
      available: true,
    };
  } catch (error) {
    return {
      results: [],
      query,
      project,
      count: 0,
      available: false,
      error: String(error),
    };
  }
}

export function hasHighRelevanceMatch(
  results: KbaseSearchResult[],
  threshold = 0.8,
): boolean {
  return results.some((r) => r.score >= threshold);
}
