/**
 * Zod schemas for reranking module
 *
 * Schemas for cross-encoder reranking of retrieval results
 * to improve precision of top-K results.
 */

import { z } from 'zod';
import { RetrievalResultSchema } from './graph.js';

// =============================================================================
// Reranking Schemas
// =============================================================================

/**
 * Input schema for graph_rerank tool
 *
 * Takes a query and list of candidates (retrieved results) and reranks them
 * using cross-encoder models for improved precision.
 */
export const GraphRerankInputSchema = z.object({
  query: z.string()
    .min(1)
    .max(1000)
    .describe('Search query to use for reranking'),
  candidates: z.array(RetrievalResultSchema)
    .min(1)
    .max(100)
    .describe('List of retrieved candidates to rerank (typically 50-100)'),
  top_k: z.number()
    .int()
    .min(1)
    .max(100)
    .default(10)
    .describe('Number of top results to return (typically 5-10)'),
  model: z.enum(['mxbai-rerank-large-v2', 'flashrank'])
    .default('mxbai-rerank-large-v2')
    .describe('Reranking model to use (mxbai-rerank-large-v2 recommended)'),
  use_cache: z.boolean()
    .default(true)
    .describe('Whether to use cached rerank results for repeated queries'),
});

export type GraphRerankInput = z.infer<typeof GraphRerankInputSchema>;

/**
 * Ranked result with original and reranked scores
 */
export const RankedResultSchema = RetrievalResultSchema.extend({
  original_score: z.number()
    .min(0)
    .max(1)
    .describe('Original retrieval score (0-1)'),
  rerank_score: z.number()
    .min(0)
    .max(1)
    .describe('Cross-encoder reranking score (0-1)'),
  combined_score: z.number()
    .min(0)
    .max(1)
    .describe('Combined score: 60% original + 40% rerank (0-1)'),
});

export type RankedResult = z.infer<typeof RankedResultSchema>;

/**
 * Output schema for graph_rerank tool
 *
 * Returns reranked list of results with improved precision,
 * sorted by combined_score descending
 */
export const GraphRerankOutputSchema = z.object({
  results: z.array(RankedResultSchema)
    .describe('Reranked list of results (top_k), sorted by combined_score descending'),
  total_results: z.number()
    .int()
    .nonnegative()
    .describe('Total number of results returned'),
  model_used: z.enum(['mxbai-rerank-large-v2', 'flashrank'])
    .describe('Reranking model actually used (may differ if primary unavailable)'),
  cache_hit: z.boolean()
    .describe('Whether result came from cache'),
  execution_time_ms: z.number()
    .int()
    .nonnegative()
    .describe('Execution time in milliseconds'),
});

export type GraphRerankOutput = z.infer<typeof GraphRerankOutputSchema>;

/**
 * Reranker statistics output
 */
export const RerankStatsSchema = z.object({
  cache_size: z.number()
    .int()
    .nonnegative()
    .describe('Number of cached rerank results'),
  fallback_count: z.number()
    .int()
    .nonnegative()
    .describe('Number of times primary model fell back to secondary'),
  primary_available: z.boolean()
    .describe('Whether primary reranking model is currently available'),
});

export type RerankStats = z.infer<typeof RerankStatsSchema>;
