/**
 * Contextual Chunking Module
 *
 * Implements Anthropic's Contextual Retrieval strategy:
 * - Markdown-aware splitting preserving header hierarchy
 * - LLM-generated context prepended to each chunk
 * - Support for wikilink extraction
 * - Efficient context generation with prompt caching
 */

import { randomUUID } from 'crypto';
import { invokeLLM, type LLMResponse } from '../llm/invoker.js';

// =============================================================================
// Types and Interfaces
// =============================================================================

export interface ChunkConfig {
  /** Chunk size in tokens (default: 600) */
  chunkSize?: number;
  /** Overlap percentage (default: 0.2 for 20%) */
  overlapPercent?: number;
  /** Whether to prepend context to chunks (default: true) */
  contextualizeChunks?: boolean;
  /** Max tokens for generated context (default: 100) */
  maxContextTokens?: number;
}

export interface ChunkMetadata {
  /** Header hierarchy (h1, h2, h3) */
  h1?: string;
  h2?: string;
  h3?: string;
  /** Programming language for code blocks */
  code_language?: string;
  /** Extracted wikilinks [[link]] */
  wikilinks: string[];
  /** Character position in original document */
  char_offset: number;
}

export interface Chunk {
  /** Unique identifier for this chunk */
  chunk_id: string;
  /** UUID of parent document */
  parent_uuid: string;
  /** Sequence number in document */
  sequence_num: number;
  /** Original raw content */
  raw_content: string;
  /** Content with prepended context (for embedding) */
  contextualized_content: string;
  /** Generated context preamble */
  context?: string;
  /** Metadata about the chunk */
  metadata: ChunkMetadata;
}

export interface ContextualChunkingResult {
  chunks: Chunk[];
  document_uuid: string;
  total_chunks: number;
  total_raw_tokens: number;
  total_contextualized_tokens: number;
  context_generation_cost?: number;
  context_generation_calls: number;
}

// =============================================================================
// Wikilink Extraction
// =============================================================================

/**
 * Extract [[wikilink]] patterns from text
 *
 * @param text - Text to search for wikilinks
 * @returns Array of wikilink targets (without brackets)
 */
export function extractWikilinks(text: string): string[] {
  const wikilinkRegex = /\[\[([^\[\]]+)\]\]/g;
  const wikilinks: string[] = [];

  let match: RegExpExecArray | null;
  // eslint-disable-next-line no-cond-assign
  while ((match = wikilinkRegex.exec(text)) !== null) {
    // match is guaranteed to have group 1 due to regex pattern
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const link = match[1]!;
    if (link) {
      wikilinks.push(link);
    }
  }

  return wikilinks;
}

/**
 * Pre-process document to extract and remove wikilinks
 *
 * Returns the document with wikilinks removed and a map of wikilinks
 *
 * @param content - Document content
 * @returns Tuple of [cleaned content, wikilink map]
 */
function preProcessWikilinks(content: string): [string, Map<number, string[]>] {
  const wikilinkMap = new Map<number, string[]>();
  let currentIndex = 0;
  const cleaned = content.replace(/\[\[([^\[\]]+)\]\]/g, (_match, link: string) => {
    const links = wikilinkMap.get(currentIndex) || [];
    links.push(link);
    wikilinkMap.set(currentIndex, links);
    currentIndex += link.length;
    // Replace with just the link text (without brackets)
    return link;
  });

  return [cleaned, wikilinkMap];
}

// =============================================================================
// Token Estimation
// =============================================================================

/**
 * Rough estimate of tokens in text (1 token ≈ 4 characters)
 *
 * @param text - Text to estimate
 * @returns Estimated token count
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// =============================================================================
// Markdown Splitting
// =============================================================================

/**
 * Split markdown document preserving header hierarchy
 *
 * @param content - Markdown document content
 * @param chunkSize - Target chunk size in tokens (converts to chars using 1 token ≈ 4 chars)
 * @returns Array of text chunks with header metadata
 */
async function splitMarkdown(
  content: string,
  chunkSize: number
): Promise<Array<{ content: string; headers: Map<string, string> }>> {
  // Header-aware markdown split for better control

  const headerRegex = /^(#{1,3})\s+(.+)$/gm;
  const chunks: Array<{ content: string; headers: Map<string, string> }> = [];

  let h1: string | undefined;
  let h2: string | undefined;
  let h3: string | undefined;
  let currentContent = '';
  const charSizeThreshold = chunkSize * 4; // Convert tokens to chars

  let match: RegExpExecArray | null;
  const headerMatches: Array<{ match: RegExpExecArray; index: number }> = [];

  // Find all header positions
  // eslint-disable-next-line no-cond-assign
  while ((match = headerRegex.exec(content)) !== null) {
    headerMatches.push({ match: match, index: match.index });
  }

  // Process content between headers
  for (let i = 0; i < headerMatches.length; i++) {
    const headerMatch = headerMatches[i];
    if (!headerMatch) continue;

    const nextHeaderIndex = i + 1 < headerMatches.length ? headerMatches[i + 1]?.index : content.length;

    const level = headerMatch.match[1]?.length ?? 1;
    const title = headerMatch.match[2];

    // Update header hierarchy
    if (level === 1) {
      h1 = title;
      h2 = undefined;
      h3 = undefined;
    } else if (level === 2) {
      h2 = title;
      h3 = undefined;
    } else if (level === 3) {
      h3 = title;
    }

    // Get content between this header and the next
    const sectionStart = (headerMatch.index ?? 0) + (headerMatch.match[0]?.length ?? 0);
    const sectionContent = content.substring(sectionStart, nextHeaderIndex).trim();

    // Add header line to current content
    if (currentContent.length > 0) {
      currentContent += '\n\n';
    }
    currentContent += (headerMatch.match[0] ?? '') + '\n' + sectionContent;

    // If we've accumulated enough content or it's the last section, emit a chunk
    if (currentContent.length >= charSizeThreshold || i === headerMatches.length - 1) {
      if (currentContent.trim().length > 0) {
        const headers = new Map<string, string>();
        if (h1) headers.set('h1', h1);
        if (h2) headers.set('h2', h2);
        if (h3) headers.set('h3', h3);

        chunks.push({
          content: currentContent.trim(),
          headers,
        });
      }
      currentContent = '';
    }
  }

  // Handle content before first header
  if (headerMatches.length > 0) {
    const firstHeaderIndex = headerMatches[0]?.index ?? 0;
    const preamble = content.substring(0, firstHeaderIndex).trim();

    if (preamble.length > 0 && chunks.length === 0) {
      chunks.push({
        content: preamble,
        headers: new Map(),
      });
    }
  } else {
    // No headers found, return whole document as single chunk
    chunks.push({
      content,
      headers: new Map(),
    });
  }

  return chunks;
}

// =============================================================================
// Context Generation
// =============================================================================

/**
 * Generate contextual preamble for a chunk
 *
 * Uses LLM to understand how this chunk fits in the broader document
 *
 * @param fullDocument - Full document content
 * @param chunk - Chunk content
 * @param metadata - Chunk metadata
 * @param maxTokens - Maximum tokens for context
 * @returns Generated context or undefined if generation fails
 */
async function generateChunkContext(
  fullDocument: string,
  chunk: string,
  metadata: ChunkMetadata,
  maxTokens: number
): Promise<{ context: string; response: LLMResponse } | undefined> {
  // Build a prompt that situates the chunk within the document
  const headerPath = [metadata.h1, metadata.h2, metadata.h3]
    .filter((h) => h !== undefined)
    .join(' > ');

  const prompt = `
You are an expert at providing contextual information about document chunks.
Given a chunk of text and the full document it came from, provide a brief preamble (2-3 sentences, 50-100 tokens) that situates this chunk within the overall document.

The preamble should:
1. Explain what part of the larger document this chunk belongs to
2. Briefly describe the main topic or purpose of this chunk
3. Connect it to the document's overall theme

FULL DOCUMENT:
\`\`\`
${fullDocument.substring(0, 3000)}
\`\`\`

DOCUMENT SECTION: ${headerPath || 'Introduction'}

CHUNK TO CONTEXTUALIZE:
\`\`\`
${chunk}
\`\`\`

Provide ONLY the contextual preamble, nothing else. Be concise and practical.`;

  try {
    // Use Tier 1 (Gemini) with fallback to Tier 2 (glm)
    const response = await invokeLLM(prompt, {
      task: 'chunk_context',
      maxTokens,
      fallbackEnabled: true,
    });

    return {
      context: response.content,
      response,
    };
  } catch (error) {
    console.warn('Failed to generate chunk context:', error instanceof Error ? error.message : String(error));
    return undefined;
  }
}

// =============================================================================
// Main Chunking Function
// =============================================================================

/**
 * Chunk a markdown document with contextual retrieval
 *
 * @param content - Document content
 * @param parentUuid - UUID of parent document
 * @param config - Chunking configuration
 * @returns Chunks with context preambles
 */
export async function chunkDocument(
  content: string,
  parentUuid: string,
  config: ChunkConfig = {}
): Promise<ContextualChunkingResult> {
  const {
    chunkSize = 600,
    contextualizeChunks = true,
    maxContextTokens = 100,
  } = config;
  // Note: overlapPercent is extracted but not currently used in simple header-based splitting

  // Pre-process wikilinks
  const [cleanedContent, _wikilinkMap] = preProcessWikilinks(content);

  // Split on markdown headers
  const mdChunks = await splitMarkdown(cleanedContent, chunkSize);

  // Process each chunk
  const chunks: Chunk[] = [];
  let totalRawTokens = 0;
  let totalContextualizedTokens = 0;
  let contextGenerationCost = 0;
  let contextGenerationCalls = 0;

  for (let i = 0; i < mdChunks.length; i++) {
    const mdChunk = mdChunks[i];
    if (!mdChunk) continue;

    const rawContent = mdChunk.content;
    const rawTokens = estimateTokens(rawContent);
    totalRawTokens += rawTokens;

    // Extract metadata
    const h1 = mdChunk.headers.get('h1');
    const h2 = mdChunk.headers.get('h2');
    const h3 = mdChunk.headers.get('h3');
    const wikilinks = extractWikilinks(rawContent);

    // Find character offset (approximate)
    const charOffset = cleanedContent.indexOf(rawContent);

    const metadata: ChunkMetadata = {
      h1,
      h2,
      h3,
      wikilinks,
      char_offset: charOffset >= 0 ? charOffset : 0,
    };

    // Generate contextual preamble
    let contextualContent = rawContent;
    let contextText: string | undefined;
    let llmResponse: LLMResponse | undefined;

    if (contextualizeChunks) {
      const contextResult = await generateChunkContext(cleanedContent, rawContent, metadata, maxContextTokens);
      if (contextResult) {
        contextText = contextResult.context;
        llmResponse = contextResult.response;
        contextualContent = `${contextText}\n\n${rawContent}`;
        contextGenerationCalls += 1;
        contextGenerationCost += llmResponse.estimatedCost ?? 0;
      }
    }

    const contextualTokens = estimateTokens(contextualContent);
    totalContextualizedTokens += contextualTokens;

    const chunk: Chunk = {
      chunk_id: `chunk-${randomUUID()}`,
      parent_uuid: parentUuid,
      sequence_num: i + 1,
      raw_content: rawContent,
      contextualized_content: contextualContent,
      context: contextText,
      metadata,
    };

    chunks.push(chunk);
  }

  return {
    chunks,
    document_uuid: parentUuid,
    total_chunks: chunks.length,
    total_raw_tokens: totalRawTokens,
    total_contextualized_tokens: totalContextualizedTokens,
    context_generation_cost: contextGenerationCost,
    context_generation_calls: contextGenerationCalls,
  };
}
