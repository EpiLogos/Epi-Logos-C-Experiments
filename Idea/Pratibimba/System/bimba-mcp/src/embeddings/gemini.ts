/**
 * Gemini Embedding Client
 *
 * Provides TypeScript wrapper for Google Gemini embedding API with support for
 * graph-search and graph-embed tools. Includes retry logic, cost tracking, and
 * support for all TaskType values.
 */

// =============================================================================
// Configuration Types
// =============================================================================

export interface EmbeddingConfig {
  apiKey: string;
  model: string;
  dimensions: number;
}

export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  multiplier: number;
}

export interface CostInfo {
  totalInputTokens: number;
  totalOutputTokens: number;
  estimatedInputCost: number;
  estimatedOutputCost: number;
  totalCost: number;
  timestamp: string;
}

// Task types for embeddings (used by graph-search and graph-embed tools)
export type TaskType =
  | 'RETRIEVAL_QUERY'
  | 'RETRIEVAL_DOCUMENT'
  | 'SEMANTIC_SIMILARITY'
  | 'CLASSIFICATION'
  | 'CLUSTERING'
  | 'QUESTION_ANSWERING';

// =============================================================================
// Default Configuration
// =============================================================================

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 100,
  maxDelayMs: 5000,
  multiplier: 2,
};

// Pricing per 1M tokens (as of knowledge cutoff)
const PRICING = {
  input: 0.02,      // $0.02 per 1M input tokens
  output: 0.02,     // $0.02 per 1M output tokens
};

// =============================================================================
// Gemini Embedding Client
// =============================================================================

export class GeminiEmbeddingClient {
  private config: EmbeddingConfig;
  private retryConfig: RetryConfig;
  private costTracker: CostInfo = {
    totalInputTokens: 0,
    totalOutputTokens: 0,
    estimatedInputCost: 0,
    estimatedOutputCost: 0,
    totalCost: 0,
    timestamp: new Date().toISOString(),
  };

  constructor(config?: Partial<EmbeddingConfig>, retryConfig?: Partial<RetryConfig>) {
    const apiKey = config?.apiKey ?? process.env['GEMINI_API_KEY'];
    const model = config?.model ?? process.env['GEMINI_EMBEDDING_MODEL'] ?? 'models/text-embedding-004';
    const dimensionsStr = config?.dimensions ?? process.env['GEMINI_EMBEDDING_DIMS'];

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }

    const dimensions = typeof dimensionsStr === 'string' ? parseInt(dimensionsStr, 10) : (dimensionsStr ?? 768);

    if (isNaN(dimensions) || dimensions < 1) {
      throw new Error('GEMINI_EMBEDDING_DIMS must be a positive number');
    }

    this.config = { apiKey, model, dimensions };
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  }

  /**
   * Embed a single text string
   *
   * @param text - Text to embed
   * @param taskType - Type of task for optimization (RETRIEVAL_QUERY, RETRIEVAL_DOCUMENT, etc.)
   * @param dimensions - Optional override for output dimensions
   * @returns Vector embedding of specified dimensions
   */
  async embedText(
    text: string,
    taskType: TaskType = 'SEMANTIC_SIMILARITY',
    dimensions?: number
  ): Promise<number[]> {
    const texts = [text];
    const results = await this.embedBatch(texts, taskType, dimensions);
    // results is guaranteed to have at least 1 element since we passed 1 text
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return results[0]!;
  }

  /**
   * Embed multiple texts in a batch
   *
   * @param texts - Array of texts to embed
   * @param taskType - Type of task for optimization
   * @param dimensions - Optional override for output dimensions
   * @returns Array of vector embeddings
   */
  async embedBatch(
    texts: string[],
    taskType: TaskType = 'SEMANTIC_SIMILARITY',
    dimensions?: number
  ): Promise<number[][]> {
    if (texts.length === 0) {
      throw new Error('Cannot embed empty text array');
    }

    const outputDimensions = dimensions ?? this.config.dimensions;

    // Validate dimensions
    if (outputDimensions < 1) {
      throw new Error('Dimensions must be at least 1');
    }

    let lastError: Error | null = null;
    let delay = this.retryConfig.initialDelayMs;

    for (let attempt = 0; attempt < this.retryConfig.maxRetries; attempt++) {
      try {
        const embeddings = await this.callGeminiAPI(texts, taskType, outputDimensions);
        this.updateCostTracking(texts.length);
        return embeddings;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on authentication or validation errors
        if (
          lastError.message.includes('API key') ||
          lastError.message.includes('authentication') ||
          lastError.message.includes('validation') ||
          attempt === this.retryConfig.maxRetries - 1
        ) {
          throw lastError;
        }

        // Exponential backoff
        await this.sleep(delay);
        delay = Math.min(delay * this.retryConfig.multiplier, this.retryConfig.maxDelayMs);
      }
    }

    throw lastError ?? new Error('Failed to embed texts');
  }

  /**
   * Get current cost tracking information
   */
  getCostInfo(): CostInfo {
    return { ...this.costTracker };
  }

  /**
   * Reset cost tracking
   */
  resetCostTracking(): void {
    this.costTracker = {
      totalInputTokens: 0,
      totalOutputTokens: 0,
      estimatedInputCost: 0,
      estimatedOutputCost: 0,
      totalCost: 0,
      timestamp: new Date().toISOString(),
    };
  }

  // ---------------------------------------------------------------------------
  // Private Methods
  // ---------------------------------------------------------------------------

  /**
   * Call the actual Gemini API to generate embeddings
   *
   * This is the actual API integration point.
   */
  private async callGeminiAPI(
    texts: string[],
    taskType: TaskType,
    dimensions: number
  ): Promise<number[][]> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:embedContent`;

    const requestBody = {
      requests: texts.map((text) => ({
        model: this.config.model,
        content: {
          parts: [{ text }],
        },
        taskType: taskType,
        outputDimensionality: dimensions,
      })),
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': this.config.apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = (errorData as { error?: { message?: string } }).error?.message ?? 'Unknown error';
      throw new Error(`Gemini API error: ${response.status} - ${errorMessage}`);
    }

    const data = await response.json() as {
      embeddings?: Array<{ values: number[] }>;
    };

    if (!data.embeddings || !Array.isArray(data.embeddings)) {
      throw new Error('Invalid Gemini API response: missing embeddings array');
    }

    const embeddings = data.embeddings as Array<{ values: number[] }>;

    if (embeddings.length !== texts.length) {
      throw new Error(`Expected ${texts.length} embeddings, got ${embeddings.length}`);
    }

    return embeddings.map((e) => {
      if (!e.values || !Array.isArray(e.values)) {
        throw new Error('Invalid embedding response: missing or invalid values array');
      }
      return e.values;
    });
  }

  /**
   * Update cost tracking based on token estimates
   *
   * For Gemini embeddings, we estimate tokens as roughly 1 token per 4 characters
   */
  private updateCostTracking(batchSize: number): void {
    // Rough estimate: 1 token per 4 characters for input, no output tokens for embeddings
    const estimatedInputTokens = Math.ceil(batchSize * 100); // Average estimate

    const inputCost = (estimatedInputTokens / 1_000_000) * PRICING.input;

    this.costTracker.totalInputTokens += estimatedInputTokens;
    this.costTracker.estimatedInputCost += inputCost;
    this.costTracker.totalCost += inputCost;
    this.costTracker.timestamp = new Date().toISOString();
  }

  /**
   * Sleep for a given number of milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
