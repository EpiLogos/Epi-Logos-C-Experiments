export interface ParsedMarkdownDocument {
  frontmatter: Record<string, string>;
  content: string;
  headings: string[];
  wikilinks: string[];
  wordCount: number;
}

const FRONTMATTER_PATTERN = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
const HEADING_PATTERN = /^#+\s+(.+)$/gm;
const WIKILINK_PATTERN = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;

export function extractWikilinks(text: string): string[] {
  const matches = text.matchAll(WIKILINK_PATTERN);
  return [...matches].map((m) => m[1].trim());
}

export function parseMarkdownDocument(text: string): ParsedMarkdownDocument {
  const match = text.match(FRONTMATTER_PATTERN);
  const frontmatterBlock = match?.[1] ?? '';
  const content = match?.[2] ?? text;

  const frontmatter = frontmatterBlock
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, line) => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length) {
        acc[key.trim()] = valueParts.join(':').trim();
      }
      return acc;
    }, {});

  const headings = [...content.matchAll(HEADING_PATTERN)].map((m) => m[1].trim());
  const wikilinks = extractWikilinks(content);
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return {
    frontmatter,
    content,
    headings,
    wikilinks,
    wordCount,
  };
}
