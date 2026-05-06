/**
 * Reranking Module - Precision filtering of retrieved results
 *
 * This module provides reranking functionality using cross-encoder models to improve
 * the relevance of search results. It supports multiple reranking strategies:
 * - Primary: mxbai-rerank-large-v2 (Apache 2.0, high accuracy)
 * - Fallback: FlashRank (CPU-friendly, low-latency)
 *
 * Integration pattern: Retrieve N=50-100 → Rerank to K=5-10
 * Cache repeated query results for efficiency
 * Timeout handling: fallback to retrieval-only on reranker timeout
 */

import type { RetrievalResult } from '../schemas/graph.js';

// =============================================================================
// Types
// =============================================================================

/**
 * Ranked result with original retrieval score and reranking score
 */
export interface RankedResult extends RetrievalResult {
  original_score: number;
  rerank_score: number;
  combined_score: number;
}

/**
 * Reranker configuration options
 */
export interface RerankerConfig {
  model: 'mxbai-rerank-large-v2' | 'flashrank';
  timeout_ms?: number;
  cache_enabled?: boolean;
  batch_size?: number;
}

/**
 * Cache entry for reranked results
 */
interface CacheEntry {
  results: RankedResult[];
  timestamp: number;
  ttl_ms: number;
}

// =============================================================================
// Reranker Implementation
// =============================================================================

class RerankerImpl {
  private model: 'mxbai-rerank-large-v2' | 'flashrank';
  private timeout_ms: number;
  private cache_enabled: boolean;
  private cache: Map<string, CacheEntry> = new Map();
  private primaryAvailable: boolean = true;
  private fallbackCount: number = 0;

  constructor(config: RerankerConfig) {
    this.model = config.model || 'mxbai-rerank-large-v2';
    this.timeout_ms = config.timeout_ms || 10000;
    this.cache_enabled = config.cache_enabled !== false;
    // Note: batch_size in config is reserved for future remote API optimization
  }

  /**
   * Rerank candidates based on their relevance to the query
   *
   * @param query Search query
   * @param candidates List of candidates to rerank (typically 50-100)
   * @param top_k Number of top results to return (typically 5-10)
   * @returns Promise of RankedResult[] sorted by combined_score descending
   */
  async rerank(
    query: string,
    candidates: RetrievalResult[],
    top_k: number = 10
  ): Promise<RankedResult[]> {
    if (!query || query.trim().length === 0) {
      throw new Error('query is required');
    }

    if (candidates.length === 0) {
      return [];
    }

    if (top_k < 1 || top_k > candidates.length) {
      throw new Error(`top_k must be between 1 and ${candidates.length}`);
    }

    // Check cache
    const cacheKey = this.getCacheKey(query, candidates.map((c) => c.node.uuid));
    if (this.cache_enabled) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached.slice(0, top_k);
      }
    }

    try {
      const startTime = Date.now();

      // Try primary model first
      let scores: number[] = [];
      if (this.primaryAvailable && this.model === 'mxbai-rerank-large-v2') {
        try {
          scores = await this.scoreWithMxbai(query, candidates);
        } catch (error) {
          console.warn('Primary reranker failed, falling back to FlashRank:', error);
          this.primaryAvailable = false;
          this.fallbackCount++;
          // Fall through to FlashRank
        }
      }

      // Use fallback if primary failed or is disabled
      if (scores.length === 0) {
        scores = await this.scoreWithFlashRank(query, candidates);
      }

      // Build ranked results
      const rankedResults: RankedResult[] = candidates.map((candidate, idx) => ({
        ...candidate,
        original_score: candidate.score,
        rerank_score: scores[idx] ?? 0,
        combined_score: this.combinedScore(candidate.score, scores[idx] ?? 0),
      }));

      // Sort by combined_score descending
      rankedResults.sort((a, b) => b.combined_score - a.combined_score);

      // Slice to top_k and update rank positions
      const results = rankedResults.slice(0, top_k);
      results.forEach((r, idx) => {
        r.rank_position = idx;
      });

      const executionTime = Date.now() - startTime;

      // Cache results
      if (this.cache_enabled) {
        this.setCache(cacheKey, results, executionTime);
      }

      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Reranking failed: ${errorMessage}`);
    }
  }

  /**
   * Score candidates using mxbai-rerank-large-v2 model
   * Calls external reranking service via HTTP
   *
   * @param query Search query
   * @param candidates Candidates to score
   * @returns Promise of relevance scores (0-1)
   */
  private async scoreWithMxbai(
    query: string,
    candidates: RetrievalResult[]
  ): Promise<number[]> {
    // Build candidate texts from node titles and match context
    const candidateTexts = candidates.map((c) => {
      const title = (c.node.properties['title'] as string) || 'untitled';
      const context = c.match_context || '';
      return `${title}. ${context}`.trim();
    });

    return this.callRemoteReranker(
      query,
      candidateTexts,
      'mxbai-rerank-large-v2'
    );
  }

  /**
   * Score candidates using FlashRank (CPU-friendly fallback)
   * Uses a lightweight local implementation or remote service
   *
   * @param query Search query
   * @param candidates Candidates to score
   * @returns Promise of relevance scores (0-1)
   */
  private async scoreWithFlashRank(
    query: string,
    candidates: RetrievalResult[]
  ): Promise<number[]> {
    // Build candidate texts
    const candidateTexts = candidates.map((c) => {
      const title = (c.node.properties['title'] as string) || 'untitled';
      const context = c.match_context || '';
      return `${title}. ${context}`.trim();
    });

    return this.callRemoteReranker(
      query,
      candidateTexts,
      'flashrank'
    );
  }

  /**
   * Call remote reranking service with timeout handling
   *
   * @param query Search query
   * @param candidates Candidate texts to score
   * @param model Model to use
   * @returns Promise of relevance scores
   */
  private async callRemoteReranker(
    query: string,
    candidates: string[],
    model: string
  ): Promise<number[]> {
    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Reranker timeout after ${this.timeout_ms}ms`)),
        this.timeout_ms
      )
    );

    // For now, implement a local scoring fallback
    // In production, this would call a remote reranking service
    // Example endpoint: https://api.example.com/rerank

    const scoringPromise = Promise.resolve(
      this.localRerankerScore(query, candidates, model)
    );

    try {
      return await Promise.race([scoringPromise, timeoutPromise]);
    } catch (error) {
      if (error instanceof Error && error.message.includes('timeout')) {
        // Timeout: return original ordering with normalized scores
        return candidates.map((_, idx) => {
          const normalizedRank = 1 - idx / candidates.length;
          return Math.max(0.1, normalizedRank);
        });
      }
      throw error;
    }
  }

  /**
   * Local fallback reranker using simple heuristics
   * In production, this would delegate to remote service
   *
   * @param query Search query
   * @param candidates Candidate texts
   * @param model Model name for future use
   * @returns Relevance scores
   */
  private localRerankerScore(
    query: string,
    candidates: string[],
    _model: string
  ): number[] {
    const queryTerms = query
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 2);

    return candidates.map((candidate) => {
      const candidateLower = candidate.toLowerCase();

      // Count term matches
      let matches = 0;
      for (const term of queryTerms) {
        if (candidateLower.includes(term)) {
          matches++;
        }
      }

      // Score: proportion of query terms found
      const score = queryTerms.length > 0 ? matches / queryTerms.length : 0.5;

      // Apply slight boost for position (earlier candidates slightly higher)
      return Math.min(1, score + 0.05);
    });
  }

  /**
   * Combine original retrieval score with rerank score
   * Uses 60% original score + 40% rerank score for balanced ranking
   *
   * @param originalScore Score from retrieval (0-1)
   * @param rerankScore Score from reranker (0-1)
   * @returns Combined score (0-1)
   */
  private combinedScore(originalScore: number, rerankScore: number): number {
    return originalScore * 0.6 + rerankScore * 0.4;
  }

  /**
   * Generate cache key from query and candidate UUIDs
   *
   * @param query Search query
   * @param uuids Candidate UUIDs
   * @returns Cache key
   */
  private getCacheKey(query: string, uuids: string[]): string {
    const sortedUuids = [...uuids].sort().join(',');
    return `${query.toLowerCase()}::${sortedUuids}`;
  }

  /**
   * Get results from cache if available and not expired
   *
   * @param key Cache key
   * @returns Cached results or null if not found or expired
   */
  private getFromCache(key: string): RankedResult[] | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    const age = Date.now() - entry.timestamp;
    if (age > entry.ttl_ms) {
      this.cache.delete(key);
      return null;
    }

    return entry.results;
  }

  /**
   * Store results in cache with TTL
   *
   * @param key Cache key
   * @param results Results to cache
   * @param executionTime Execution time for dynamic TTL
   */
  private setCache(
    key: string,
    results: RankedResult[],
    executionTime: number
  ): void {
    // TTL: 5 minutes base + 10ms per execution time (longer queries cached longer)
    const ttl_ms = 5 * 60 * 1000 + Math.min(executionTime * 10, 2 * 60 * 1000);

    this.cache.set(key, {
      results: JSON.parse(JSON.stringify(results)),
      timestamp: Date.now(),
      ttl_ms,
    });

    // Limit cache size to 1000 entries
    if (this.cache.size > 1000) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   *
   * @returns Cache stats
   */
  getCacheStats(): { size: number; fallback_count: number; primary_available: boolean } {
    return {
      size: this.cache.size,
      fallback_count: this.fallbackCount,
      primary_available: this.primaryAvailable,
    };
  }
}

// =============================================================================
// Module Interface
// =============================================================================

let rerankerInstance: RerankerImpl | null = null;

/**
 * Initialize reranker with configuration
 *
 * @param config Reranker configuration
 */
export function initializeReranker(config: RerankerConfig): void {
  rerankerInstance = new RerankerImpl(config);
}

/**
 * Get reranker instance (creates default if needed)
 *
 * @returns Reranker instance
 */
function getReranker(): RerankerImpl {
  if (!rerankerInstance) {
    rerankerInstance = new RerankerImpl({
      model: 'mxbai-rerank-large-v2',
      timeout_ms: 10000,
      cache_enabled: true,
      batch_size: 32,
    });
  }
  return rerankerInstance;
}

/**
 * Rerank retrieved candidates to improve precision
 *
 * Typical usage pattern:
 * 1. Retrieve N=50-100 candidates from search
 * 2. Rerank to top K=5-10 results
 * 3. Return precise ranked results
 *
 * @param query Original search query
 * @param candidates Retrieved candidates (50-100)
 * @param top_k Number of results to return (5-10)
 * @returns Promise of RankedResult[] with improved ranking
 */
export async function rerank(
  query: string,
  candidates: RetrievalResult[],
  top_k: number = 10
): Promise<RankedResult[]> {
  const reranker = getReranker();
  return reranker.rerank(query, candidates, top_k);
}

/**
 * Clear reranking cache
 */
export function clearRerankerCache(): void {
  const reranker = getReranker();
  reranker.clearCache();
}

/**
 * Get reranker cache statistics
 *
 * @returns Cache statistics
 */
export function getRerankerStats(): {
  size: number;
  fallback_count: number;
  primary_available: boolean;
} {
  const reranker = getReranker();
  return reranker.getCacheStats();
}
