/**
 * S5.2' skill search (Agora CF4a: "what already exists?").
 *
 * Searches the kbase skill index before creating new integrations.
 * Wraps kbaseSearch with skill-specific parsing and frontmatter extraction.
 */

import { kbaseSearch, hasHighRelevanceMatch } from "./sem-search.js";
import type { KbaseSearchResult } from "./sem-search.js";

export interface SkillSearchResult {
  name: string;
  sourcePath: string;
  score: number;
  description: string;
  excerpt: string;
  tags?: {
    ct?: string;
    cp?: string;
    cf?: string;
    agentAffinity?: string;
    skillClass?: string;
  };
}

export interface SkillSearchInput {
  query: string;
  topN?: number;
  includeTags?: boolean;
  project?: string;
}

export interface SkillSearchOutput {
  results: SkillSearchResult[];
  query: string;
  count: number;
  available: boolean;
  error?: string;
}

export function parseSkillFrontmatter(
  content: string,
): SkillSearchResult["tags"] {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return undefined;

  const fm = match[1];
  const tags: NonNullable<SkillSearchResult["tags"]> = {};

  const extract = (key: string) => {
    const m = fm.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
    return m ? m[1].trim() : undefined;
  };

  tags.ct = extract("ct");
  tags.cp = extract("cp");
  tags.cf = extract("cf");
  tags.agentAffinity = extract("agent_affinity");
  tags.skillClass = extract("skill_class");

  return Object.keys(tags).length > 0 ? tags : undefined;
}

export function extractExcerpt(content: string): string {
  const body = content.replace(/^---\n[\s\S]*?\n---\n*/, "");
  let excerpt = body.slice(0, 200).replace(/\s+/g, " ").trim();
  if (body.length > 200) excerpt += "...";
  return excerpt;
}

function toSkillResult(raw: KbaseSearchResult): SkillSearchResult {
  const pathMatch = raw.sourcePath.match(/skills\/([^/]+)\/SKILL\.md$/);
  const name = pathMatch
    ? pathMatch[1]
    : raw.sourcePath.split("/").pop() || raw.sourcePath;

  return {
    name,
    sourcePath: raw.sourcePath,
    score: raw.score,
    description: raw.text,
    excerpt: "",
  };
}

export async function skillSearch(
  input: SkillSearchInput,
  readFile?: (path: string) => Promise<string>,
): Promise<SkillSearchOutput> {
  const { query, topN = 10, includeTags = false, project } = input;

  const raw = await kbaseSearch({ query, project, topN });

  if (!raw.available) {
    return {
      results: [],
      query,
      count: 0,
      available: false,
      error: raw.error,
    };
  }

  const results: SkillSearchResult[] = [];
  for (const item of raw.results) {
    const skill = toSkillResult(item);

    if (includeTags && readFile) {
      try {
        const content = await readFile(skill.sourcePath);
        skill.tags = parseSkillFrontmatter(content);
        skill.excerpt = extractExcerpt(content);

        const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (fmMatch) {
          const descMatch = fmMatch[1].match(/^description:\s*(.+)$/m);
          if (descMatch) skill.description = descMatch[1].trim();
        }
      } catch {
        // file unreadable — keep defaults
      }
    }

    results.push(skill);
  }

  return {
    results: results.slice(0, topN),
    query,
    count: results.length,
    available: true,
  };
}

export { hasHighRelevanceMatch };
