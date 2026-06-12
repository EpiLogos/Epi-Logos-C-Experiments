/**
 * Gemini Embedding Client
 *
 * TypeScript mirror for the S0 Gemini Embedding 2 accessor. It preserves the
 * bimba-mcp graph tool API while adding cloud opt-in gating, read-through cache,
 * matryoshka truncation, and deterministic mock mode.
 */

import { createHash, getHashes } from 'crypto';
import { readFileSync } from 'fs';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { homedir } from 'os';
import { dirname, join } from 'path';

// =============================================================================
// Configuration Types
// =============================================================================

export interface EmbeddingConfig {
  apiKey?: string;
  model: string;
  dimensions: 3072 | 1536 | 768;
  cacheRoot?: string;
  configPath?: string;
  canonicalContextLimitBytes?: number;
  backend?: 'live' | 'mock';
  documentHasher?: (bytes: Uint8Array) => string;
}

export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  multiplier: number;
  jitterRatio: number;
  maxRpm: number;
  maxConcurrent: number;
}

export interface CostInfo {
  totalInputTokens: number;
  totalOutputTokens: number;
  estimatedInputCost: number;
  estimatedOutputCost: number;
  totalCost: number;
  timestamp: string;
}

export interface EmbeddingResponse {
  vector: number[];
  dimensions: 3072 | 1536 | 768;
  model: string;
  documentHash: string;
  cacheHit: boolean;
}

type ConfigValue = string | number | boolean | string[];

// Task types for embeddings (used by graph-search and graph-embed tools)
export type TaskType =
  | 'RETRIEVAL_QUERY'
  | 'RETRIEVAL_DOCUMENT'
  | 'SEMANTIC_SIMILARITY'
  | 'CLASSIFICATION'
  | 'CLUSTERING'
  | 'QUESTION_ANSWERING';

// =============================================================================
// Constants
// =============================================================================

const FULL_RESOLUTION_DIM = 3072;
const SUPPORTED_DIMS = [3072, 1536, 768] as const;

const PRICING = {
  input: 0.02,
  output: 0.02,
};

// =============================================================================
// Gemini Embedding Client
// =============================================================================

export class GeminiEmbeddingClient {
  private config: Required<Omit<EmbeddingConfig, 'apiKey' | 'documentHasher'>> & {
    apiKey?: string;
    documentHasher: (bytes: Uint8Array) => string;
  };
  private retryConfig: RetryConfig;
  private requestStarts: number[] = [];
  private activeRequests = 0;
  private costTracker: CostInfo = {
    totalInputTokens: 0,
    totalOutputTokens: 0,
    estimatedInputCost: 0,
    estimatedOutputCost: 0,
    totalCost: 0,
    timestamp: new Date().toISOString(),
  };

  constructor(config?: Partial<EmbeddingConfig>, retryConfig?: Partial<RetryConfig>) {
    const configPath = config?.configPath ?? process.env['EPI_LOGOS_CONFIG_PATH'] ?? defaultConfigPath();
    const fileConfig = readConfigSyncBestEffort(configPath);
    const geminiConfig = section(fileConfig, 'gemini_embedding');

    const model =
      config?.model ??
      process.env['GEMINI_EMBEDDING_MODEL'] ??
      valueAsString(geminiConfig['model_version']);
    if (!model) {
      throw new Error('Gemini embedding model must be configured via GEMINI_EMBEDDING_MODEL or [gemini_embedding].model_version');
    }

    const dimensions = toSupportedDim(
      config?.dimensions ??
        valueAsNumber(process.env['GEMINI_EMBEDDING_DIMS']) ??
        valueAsNumber(geminiConfig['target_dim']) ??
        FULL_RESOLUTION_DIM
    );

    const apiKey = config?.apiKey ?? process.env['GEMINI_API_KEY'];
    const cacheRoot = config?.cacheRoot ?? valueAsString(geminiConfig['cache_root']) ?? defaultCacheRoot();
    const canonicalContextLimitBytes =
      config?.canonicalContextLimitBytes ?? valueAsNumber(geminiConfig['canonical_context_limit_bytes']);
    if (!canonicalContextLimitBytes || canonicalContextLimitBytes < 1) {
      throw new Error('[gemini_embedding].canonical_context_limit_bytes must be configured and positive');
    }

    const backend =
      config?.backend ?? (process.env['GEMINI_EMBEDDING_BACKEND'] === 'mock' ? 'mock' : 'live');
    const documentHasher = config?.documentHasher ?? createBlake3Hasher();

    this.config = {
      apiKey,
      model,
      dimensions,
      cacheRoot,
      configPath,
      canonicalContextLimitBytes,
      backend,
      documentHasher,
    };
    this.retryConfig = {
      maxRetries: requiredNumber(retryConfig?.maxRetries, geminiConfig['max_retries'], 'max_retries'),
      initialDelayMs: requiredNumber(retryConfig?.initialDelayMs, geminiConfig['backoff_initial_ms'], 'backoff_initial_ms'),
      maxDelayMs: retryConfig?.maxDelayMs ?? valueAsNumber(geminiConfig['backoff_max_ms']) ?? Number.POSITIVE_INFINITY,
      multiplier: requiredNumber(retryConfig?.multiplier, geminiConfig['backoff_factor'], 'backoff_factor'),
      jitterRatio: requiredNumber(retryConfig?.jitterRatio, geminiConfig['jitter_ratio'], 'jitter_ratio'),
      maxRpm: requiredNumber(retryConfig?.maxRpm, geminiConfig['max_rpm'], 'max_rpm'),
      maxConcurrent: requiredNumber(retryConfig?.maxConcurrent, geminiConfig['max_concurrent'], 'max_concurrent'),
    };
  }

  /**
   * Embed a single text string.
   */
  async embedText(
    text: string,
    taskType: TaskType = 'SEMANTIC_SIMILARITY',
    dimensions?: 3072 | 1536 | 768
  ): Promise<number[]> {
    const response = await this.embedDocument(text, taskType, dimensions ?? this.config.dimensions);
    return response.vector;
  }

  /**
   * Embed a single document with metadata.
   */
  async embedDocument(
    text: string,
    taskType: TaskType = 'SEMANTIC_SIMILARITY',
    dimensions?: 3072 | 1536 | 768
  ): Promise<EmbeddingResponse> {
    const targetDim = toSupportedDim(dimensions ?? this.config.dimensions);
    this.requireOptIn(taskType);

    const documentBytes = new TextEncoder().encode(text);
    if (documentBytes.byteLength === 0) {
      throw new Error('Cannot embed empty document');
    }
    const documentHash = this.config.documentHasher(documentBytes);

    const targetCache = await this.readCache(documentHash, targetDim);
    if (targetCache) {
      return {
        vector: targetCache,
        dimensions: targetDim,
        model: this.config.model,
        documentHash,
        cacheHit: true,
      };
    }

    if (targetDim !== FULL_RESOLUTION_DIM) {
      const fullCache = await this.readCache(documentHash, FULL_RESOLUTION_DIM);
      if (fullCache) {
        const vector = fullCache.slice(0, targetDim);
        await this.writeCache(documentHash, targetDim, vector);
        return {
          vector,
          dimensions: targetDim,
          model: this.config.model,
          documentHash,
          cacheHit: true,
        };
      }
    }

    const chunks = chunkDocument(text, this.config.canonicalContextLimitBytes);
    const fullVector =
      this.config.backend === 'mock'
        ? syntheticVector(documentHash, this.config.model, taskType, FULL_RESOLUTION_DIM)
        : await this.callWithRetry(chunks, taskType, FULL_RESOLUTION_DIM, documentHash);
    await this.writeCache(documentHash, FULL_RESOLUTION_DIM, fullVector);

    const vector = fullVector.slice(0, targetDim);
    if (targetDim !== FULL_RESOLUTION_DIM) {
      await this.writeCache(documentHash, targetDim, vector);
    }
    this.updateCostTracking(text);

    return {
      vector,
      dimensions: targetDim,
      model: this.config.model,
      documentHash,
      cacheHit: false,
    };
  }

  /**
   * Embed multiple texts in a batch. Cache semantics are per document.
   */
  async embedBatch(
    texts: string[],
    taskType: TaskType = 'SEMANTIC_SIMILARITY',
    dimensions?: 3072 | 1536 | 768
  ): Promise<number[][]> {
    if (texts.length === 0) {
      throw new Error('Cannot embed empty text array');
    }

    const output: number[][] = [];
    for (const text of texts) {
      output.push(await this.embedText(text, taskType, dimensions));
    }
    return output;
  }

  getCostInfo(): CostInfo {
    return { ...this.costTracker };
  }

  getModelVersion(): string {
    return this.config.model;
  }

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

  private requireOptIn(taskType: TaskType): void {
    const parsed = readConfigSyncBestEffort(this.config.configPath);
    const optIn = section(parsed, 'cloud_opt_in.gemini_embedding');
    const recorded = valueAsBoolean(optIn['recorded']) || valueAsBoolean(optIn['enabled']);
    if (!recorded) {
      throw new Error(
        `cloud opt-in required for gemini_embedding scope ${taskType}; run \`epi settings opt-in gemini_embedding\``
      );
    }
    const scopes = optIn['scopes'];
    if (Array.isArray(scopes) && !scopes.some((scope) => scope === '*' || scope.toUpperCase() === taskType)) {
      throw new Error(`cloud opt-in for gemini_embedding does not include scope ${taskType}`);
    }
  }

  private async callWithRetry(
    chunks: string[],
    taskType: TaskType,
    dimensions: number,
    documentHash: string
  ): Promise<number[]> {
    if (!this.config.apiKey) {
      throw new Error('GEMINI_API_KEY is required for live Gemini embedding calls');
    }

    let delay = this.retryConfig.initialDelayMs;
    let lastError: Error | undefined;
    const attempts = this.retryConfig.maxRetries + 1;

    for (let attempt = 0; attempt < attempts; attempt++) {
      try {
        const vectors: number[][] = [];
        for (const chunk of chunks) {
          await this.acquireRateSlot();
          vectors.push(await this.callGeminiAPI(chunk, taskType, dimensions));
          this.releaseRateSlot();
        }
        return averageVectors(vectors, dimensions);
      } catch (error) {
        this.releaseRateSlot();
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt + 1 >= attempts || isPermanentError(lastError)) {
          throw lastError;
        }
        await sleep(jitter(delay, this.retryConfig.jitterRatio, documentHash, attempt));
        delay = Math.min(delay * this.retryConfig.multiplier, this.retryConfig.maxDelayMs);
      }
    }

    throw lastError ?? new Error('Failed to embed texts');
  }

  private async callGeminiAPI(text: string, taskType: TaskType, dimensions: number): Promise<number[]> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/${modelPath(this.config.model)}:embedContent`;

    const requestBody = {
      model: modelPath(this.config.model),
      content: {
        parts: [{ text }],
      },
      taskType,
      outputDimensionality: dimensions,
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': this.config.apiKey ?? '',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = (errorData as { error?: { message?: string } }).error?.message ?? 'Unknown error';
      throw new Error(`Gemini API error: ${response.status} - ${errorMessage}`);
    }

    const data = await response.json() as {
      embedding?: { values?: number[] };
    };

    if (!Array.isArray(data.embedding?.values)) {
      throw new Error('Invalid Gemini API response: missing embedding.values array');
    }

    return data.embedding.values;
  }

  private async readCache(documentHash: string, dim: number): Promise<number[] | undefined> {
    const path = this.cachePath(documentHash, dim);
    try {
      const raw = await readFile(path, 'utf8');
      const parsed = JSON.parse(raw) as {
        model: string;
        documentHash: string;
        dim: number;
        vector: number[];
      };
      if (
        parsed.model !== this.config.model ||
        parsed.documentHash !== documentHash ||
        parsed.dim !== dim ||
        !Array.isArray(parsed.vector)
      ) {
        return undefined;
      }
      return parsed.vector;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return undefined;
      }
      throw error;
    }
  }

  private async writeCache(documentHash: string, dim: number, vector: number[]): Promise<void> {
    const path = this.cachePath(documentHash, dim);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(
      path,
      JSON.stringify({
        model: this.config.model,
        documentHash,
        dim,
        vector,
      }),
      'utf8'
    );
  }

  private cachePath(documentHash: string, dim: number): string {
    return join(this.config.cacheRoot, this.config.model, `${documentHash}.${dim}`);
  }

  private updateCostTracking(text: string): void {
    const estimatedInputTokens = Math.ceil(text.length / 4);
    const inputCost = (estimatedInputTokens / 1_000_000) * PRICING.input;

    this.costTracker.totalInputTokens += estimatedInputTokens;
    this.costTracker.estimatedInputCost += inputCost;
    this.costTracker.totalCost += inputCost;
    this.costTracker.timestamp = new Date().toISOString();
  }

  private async acquireRateSlot(): Promise<void> {
    while (this.activeRequests >= this.retryConfig.maxConcurrent) {
      await sleep(5);
    }
    const now = Date.now();
    this.requestStarts = this.requestStarts.filter((started) => now - started < 60_000);
    if (this.requestStarts.length >= this.retryConfig.maxRpm) {
      const waitMs = Math.max(1, 60_000 - (now - this.requestStarts[0]!));
      await sleep(waitMs);
    }
    this.activeRequests += 1;
    this.requestStarts.push(Date.now());
  }

  private releaseRateSlot(): void {
    if (this.activeRequests > 0) {
      this.activeRequests -= 1;
    }
  }
}

function createBlake3Hasher(): (bytes: Uint8Array) => string {
  if (!getHashes().includes('blake3')) {
    throw new Error(
      'BLAKE3 document hashing is required. Provide EmbeddingConfig.documentHasher or run on a Node/OpenSSL build with blake3 support.'
    );
  }
  return (bytes: Uint8Array): string => createHash('blake3').update(bytes).digest('hex');
}

function toSupportedDim(value: number): 3072 | 1536 | 768 {
  if (SUPPORTED_DIMS.includes(value as 3072 | 1536 | 768)) {
    return value as 3072 | 1536 | 768;
  }
  throw new Error(`target_dim must be one of ${SUPPORTED_DIMS.join(', ')}`);
}

function chunkDocument(text: string, limitBytes: number): string[] {
  const encoded = new TextEncoder().encode(text);
  if (encoded.byteLength <= limitBytes) {
    return [text];
  }
  const chunks: string[] = [];
  let current = '';
  let currentBytes = 0;
  for (const char of text) {
    const charBytes = new TextEncoder().encode(char).byteLength;
    if (currentBytes + charBytes > limitBytes && current.length > 0) {
      chunks.push(current);
      current = '';
      currentBytes = 0;
    }
    current += char;
    currentBytes += charBytes;
  }
  if (current.length > 0) {
    chunks.push(current);
  }
  return chunks;
}

function syntheticVector(documentHash: string, model: string, taskType: TaskType, dimensions: number): number[] {
  const vector: number[] = [];
  let counter = 0;
  while (vector.length < dimensions) {
    const digest = createHash('sha256')
      .update(documentHash)
      .update(model)
      .update(taskType)
      .update(String(counter))
      .digest();
    for (let index = 0; index < digest.length && vector.length < dimensions; index += 4) {
      const raw = digest.readUInt32LE(index);
      vector.push((raw / 0xffffffff) * 2 - 1);
    }
    counter += 1;
  }
  return vector;
}

function averageVectors(vectors: number[][], dimensions: number): number[] {
  if (vectors.length === 0) {
    throw new Error('Gemini API returned no embeddings');
  }
  const average = new Array<number>(dimensions).fill(0);
  for (const vector of vectors) {
    if (vector.length !== dimensions) {
      throw new Error(`Expected embedding dimension ${dimensions}, got ${vector.length}`);
    }
    for (let index = 0; index < dimensions; index++) {
      average[index] = (average[index] ?? 0) + vector[index]!;
    }
  }
  return average.map((value) => value / vectors.length);
}

function jitter(baseMs: number, ratio: number, documentHash: string, attempt: number): number {
  if (ratio === 0 || baseMs === 0) {
    return baseMs;
  }
  const digest = createHash('sha256').update(documentHash).update(String(attempt)).digest();
  const unit = digest.readUInt32LE(0) / 0xffffffff;
  return Math.max(0, baseMs * (1 - ratio + unit * ratio * 2));
}

function isPermanentError(error: Error): boolean {
  return error.message.includes('API key') || error.message.includes('authentication') || error.message.includes('validation');
}

function modelPath(model: string): string {
  return model.startsWith('models/') ? model : `models/${model}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function defaultConfigPath(): string {
  return join(process.env['EPI_LOGOS_HOME'] ?? join(homedir(), '.epi-logos'), 'config.toml');
}

function defaultCacheRoot(): string {
  return join(process.env['EPI_LOGOS_HOME'] ?? join(homedir(), '.epi-logos'), 'cache', 'embeddings');
}

function requiredNumber(override: number | undefined, value: ConfigValue | undefined, key: string): number {
  const resolved = override ?? valueAsNumber(value);
  if (resolved === undefined || Number.isNaN(resolved) || resolved < 0) {
    throw new Error(`[gemini_embedding].${key} must be configured`);
  }
  return resolved;
}

function valueAsString(value: ConfigValue | string | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function valueAsNumber(value: ConfigValue | string | number | undefined): number | undefined {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function valueAsBoolean(value: ConfigValue | undefined): boolean {
  return value === true;
}

function section(config: Record<string, Record<string, ConfigValue>>, name: string): Record<string, ConfigValue> {
  return config[name] ?? {};
}

function readConfigSyncBestEffort(path: string): Record<string, Record<string, ConfigValue>> {
  try {
    const raw = readFileSync(path, 'utf8');
    return parseTomlSubset(raw);
  } catch {
    return {};
  }
}

function parseTomlSubset(raw: string): Record<string, Record<string, ConfigValue>> {
  const parsed: Record<string, Record<string, ConfigValue>> = {};
  let current = '';
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith('#')) {
      continue;
    }
    const sectionMatch = /^\[([^\]]+)\]$/.exec(trimmed);
    if (sectionMatch) {
      current = sectionMatch[1]!;
      parsed[current] = parsed[current] ?? {};
      continue;
    }
    const assignment = /^([A-Za-z0-9_.-]+)\s*=\s*(.+)$/.exec(trimmed);
    if (!assignment || current.length === 0) {
      continue;
    }
    parsed[current]![assignment[1]!] = parseTomlValue(assignment[2]!);
  }
  return parsed;
}

function parseTomlValue(raw: string): ConfigValue {
  const value = raw.trim();
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1);
  }
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }
  if (value.startsWith('[') && value.endsWith(']')) {
    return value
      .slice(1, -1)
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => part.replace(/^"|"$/g, ''));
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : value;
}
