import { selectExecutionMode, type ExecutionMode, type RiskLevel } from '../../../../shared/capabilities/policy';
import { parseMarkdownDocument } from '../../../../shared/capabilities/textMarkdown';

export interface NaraNote {
  content: string;
  path: string;
}

export interface NaraTodaySnapshot {
  todayNote: {
    content: string;
    path: string;
    frontmatter: Record<string, unknown>;
  } | null;
  entries: string[];
  stats: {
    entryCount: number;
    words: number;
  };
  error: string | null;
}

interface CreateNaraServiceParams {
  getTodayNote: () => Promise<NaraNote | null | undefined>;
}

export function createNaraService(params: CreateNaraServiceParams) {
  async function loadTodaySnapshot(): Promise<NaraTodaySnapshot> {
    const note = await params.getTodayNote();
    if (!note) {
      return {
        todayNote: null,
        entries: [],
        stats: { entryCount: 0, words: 0 },
        error: 'No Daily Note Found',
      };
    }

    const parsed = parseMarkdownDocument(note.content);

    return {
      todayNote: {
        content: note.content,
        path: note.path,
        frontmatter: parsed.frontmatter,
      },
      entries: parsed.headings,
      stats: {
        entryCount: parsed.headings.length,
        words: parsed.wordCount,
      },
      error: null,
    };
  }

  function resolveExecutionMode(capability: string, options: { risk: RiskLevel; exploratory: boolean }): ExecutionMode {
    return selectExecutionMode({
      capability,
      risk: options.risk,
      exploratory: options.exploratory,
    });
  }

  return {
    loadTodaySnapshot,
    resolveExecutionMode,
  };
}
