/**
 * LLM Invocation Module
 *
 * Provides automatic tier selection and fallback chain for invoking different LLMs
 * based on task complexity and cost constraints.
 *
 * Tier Hierarchy:
 * 1. Tier 1 (FREE): Gemini 3.0 Flash via gemini-cli
 * 2. Tier 2 (CHEAP): Claude via glm (glm key)
 * 3. Tier 3 (FULL): Claude Sonnet/Opus via direct API
 */

// =============================================================================
// Types and Interfaces
// =============================================================================

export type LLMTier = 1 | 2 | 3;

export type TaskType =
  | 'chunk_context'
  | 'classification'
  | 'extraction'
  | 'reasoning'
  | 'analysis'
  | 'orchestration'
  | 'user_response';

export interface InvokeLLMOptions {
  tier?: LLMTier;
  maxTokens?: number;
  temperature?: number;
  task?: TaskType;
  fallbackEnabled?: boolean;
}

export interface LLMResponse {
  content: string;
  tier: LLMTier;
  tokensUsed?: number;
  estimatedCost?: number;
  model?: string;
  timestamp: string;
}

export interface CostTracking {
  tier1Calls: number;
  tier2Calls: number;
  tier3Calls: number;
  tier1Cost: number;
  tier2Cost: number;
  tier3Cost: number;
  totalCost: number;
  totalCalls: number;
}

// =============================================================================
// Configuration and Constants
// =============================================================================

const TASK_TO_TIER_MAP: Record<TaskType, LLMTier> = {
  chunk_context: 1,
  classification: 1,
  extraction: 1,
  reasoning: 2,
  analysis: 2,
  orchestration: 3,
  user_response: 3,
};

// Rough cost estimates per 1M tokens (2024 pricing)
const TIER_PRICING = {
  1: { input: 0, output: 0 }, // Gemini Flash is free
  2: { input: 0.01, output: 0.03 }, // Claude 3.5 Haiku via glm (cheap)
  3: { input: 0.003, output: 0.015 }, // Claude 3.5 Sonnet (expensive)
};

const TIER_NAMES: Record<LLMTier, string> = {
  1: 'Gemini 3.0 Flash (FREE)',
  2: 'Claude via glm (CHEAP)',
  3: 'Claude Sonnet/Opus (FULL)',
};

// =============================================================================
// Global State
// =============================================================================

let costTracker: CostTracking = {
  tier1Calls: 0,
  tier2Calls: 0,
  tier3Calls: 0,
  tier1Cost: 0,
  tier2Cost: 0,
  tier3Cost: 0,
  totalCost: 0,
  totalCalls: 0,
};

// =============================================================================
// Public API
// =============================================================================

/**
 * Invoke an LLM with automatic tier selection based on task complexity.
 *
 * @param prompt - The prompt to send to the LLM
 * @param options - Configuration options including tier, task type, and parameters
 * @returns LLM response with tier information and cost tracking
 *
 * Tier selection rules:
 * - If tier specified, use that tier directly
 * - If task specified, map task to default tier
 * - Default to Tier 1 (FREE) for bulk operations
 *
 * Fallback chain (if enabled):
 * - Tier 1 fails → try Tier 2
 * - Tier 2 fails → try Tier 3
 * - Tier 3 fails → throw error
 */
export async function invokeLLM(
  prompt: string,
  options: InvokeLLMOptions = {}
): Promise<LLMResponse> {
  const { tier, task, fallbackEnabled = true, maxTokens, temperature } = options;

  // Determine target tier
  let targetTier: LLMTier;
  if (tier !== undefined) {
    targetTier = tier;
  } else if (task !== undefined) {
    targetTier = TASK_TO_TIER_MAP[task];
  } else {
    targetTier = 1; // Default to free tier
  }

  const maxRetries = fallbackEnabled ? 3 : 1;
  let lastError: Error | null = null;

  // Try to invoke starting from target tier
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const currentTier = (targetTier + attempt) as LLMTier;

    // Clamp to valid tier range
    if (currentTier > 3) {
      break;
    }

    try {
      const response = await invokeByTier(currentTier, prompt, { maxTokens, temperature });
      logInvocation(currentTier, response);
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on auth/config errors
      if (
        lastError.message.includes('API key') ||
        lastError.message.includes('authentication') ||
        lastError.message.includes('configuration') ||
        !fallbackEnabled
      ) {
        throw lastError;
      }

      // Log fallback attempt
      if (attempt < maxRetries - 1 && currentTier < 3) {
        const nextTier = (currentTier + 1) as LLMTier;
        console.warn(
          `Tier ${currentTier} (${TIER_NAMES[currentTier]}) failed, falling back to Tier ${nextTier} (${TIER_NAMES[nextTier]}): ${lastError.message}`
        );
      }
    }
  }

  throw lastError ?? new Error('All LLM tiers failed');
}

/**
 * Invoke Gemini 3.0 Flash directly (Tier 1 - FREE)
 */
export async function invokeGemini(
  prompt: string,
  options?: { maxTokens?: number; temperature?: number }
): Promise<LLMResponse> {
  return invokeByTier(1, prompt, options);
}

/**
 * Invoke Claude via glm (Tier 2 - CHEAP)
 */
export async function invokeGLM(
  prompt: string,
  options?: { maxTokens?: number; temperature?: number }
): Promise<LLMResponse> {
  return invokeByTier(2, prompt, options);
}

/**
 * Invoke Claude Sonnet/Opus (Tier 3 - FULL)
 */
export async function invokeClaude(
  prompt: string,
  options?: { maxTokens?: number; temperature?: number }
): Promise<LLMResponse> {
  return invokeByTier(3, prompt, options);
}

/**
 * Get current cost tracking information
 */
export function getCostTracking(): CostTracking {
  return { ...costTracker };
}

/**
 * Reset cost tracking
 */
export function resetCostTracking(): void {
  costTracker = {
    tier1Calls: 0,
    tier2Calls: 0,
    tier3Calls: 0,
    tier1Cost: 0,
    tier2Cost: 0,
    tier3Cost: 0,
    totalCost: 0,
    totalCalls: 0,
  };
}

// =============================================================================
// Private Helpers
// =============================================================================

/**
 * Invoke the appropriate LLM based on tier
 */
async function invokeByTier(
  tier: LLMTier,
  prompt: string,
  options?: { maxTokens?: number; temperature?: number }
): Promise<LLMResponse> {
  switch (tier) {
    case 1:
      return invokeGeminiImpl(prompt, options);
    case 2:
      return invokeGLMImpl(prompt, options);
    case 3:
      return invokeClaudeImpl(prompt, options);
    default:
      throw new Error(`Invalid tier: ${tier}`);
  }
}

/**
 * Invoke Gemini 3.0 Flash via gemini-cli (FREE)
 */
async function invokeGeminiImpl(
  prompt: string,
  options?: { maxTokens?: number; temperature?: number }
): Promise<LLMResponse> {
  const { execSync } = await import('child_process');

  // Build gemini-cli command
  const args = ['gemini-cli'];

  if (options?.maxTokens) {
    args.push(`--max-tokens=${options.maxTokens}`);
  }

  if (options?.temperature !== undefined) {
    args.push(`--temperature=${options.temperature}`);
  }

  args.push(`"${escapeShellArg(prompt)}"`);

  const command = args.join(' ');

  try {
    const output = execSync(command, {
      encoding: 'utf-8',
      timeout: 30000, // 30 second timeout
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // Estimate tokens: roughly 100 tokens per request for chunk context
    const estimatedTokens = Math.ceil(prompt.length / 4);

    return {
      content: output.trim(),
      tier: 1,
      tokensUsed: estimatedTokens,
      estimatedCost: 0, // Gemini Flash is free
      model: 'gemini-3.0-flash-preview',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Gemini invocation failed: ${message}`);
  }
}

/**
 * Invoke Claude via glm (CHEAP)
 */
async function invokeGLMImpl(
  prompt: string,
  options?: { maxTokens?: number; temperature?: number }
): Promise<LLMResponse> {
  const apiKey = process.env['GLM_API_KEY'];

  if (!apiKey) {
    throw new Error('GLM_API_KEY environment variable is required for Tier 2 (glm) invocations');
  }

  // Use direct fetch to invoke glm API
  const response = await fetch('https://api.glm.run/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: options?.maxTokens ?? 1024,
      temperature: options?.temperature ?? 0.7,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = (errorData as { error?: { message?: string } }).error?.message ?? 'Unknown error';
    throw new Error(`GLM API error (${response.status}): ${errorMessage}`);
  }

  const data = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('GLM API returned empty response');
  }

  const inputTokens = data.usage?.prompt_tokens ?? Math.ceil(prompt.length / 4);
  const outputTokens = data.usage?.completion_tokens ?? Math.ceil(content.length / 4);
  const totalTokens = inputTokens + outputTokens;

  const inputCost = (inputTokens / 1_000_000) * TIER_PRICING[2].input;
  const outputCost = (outputTokens / 1_000_000) * TIER_PRICING[2].output;
  const totalCost = inputCost + outputCost;

  return {
    content,
    tier: 2,
    tokensUsed: totalTokens,
    estimatedCost: totalCost,
    model: 'claude-3-5-haiku',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Invoke Claude Sonnet/Opus (FULL)
 */
async function invokeClaudeImpl(
  prompt: string,
  options?: { maxTokens?: number; temperature?: number }
): Promise<LLMResponse> {
  const apiKey = process.env['ANTHROPIC_API_KEY'];

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is required for Tier 3 (Claude) invocations');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: options?.maxTokens ?? 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: options?.temperature ?? 0.7,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = (errorData as { error?: { message?: string } }).error?.message ?? 'Unknown error';
    throw new Error(`Claude API error (${response.status}): ${errorMessage}`);
  }

  const data = await response.json() as {
    content?: Array<{ text?: string }>;
    usage?: { input_tokens?: number; output_tokens?: number };
  };

  const content = data.content?.[0]?.text;
  if (!content) {
    throw new Error('Claude API returned empty response');
  }

  const inputTokens = data.usage?.input_tokens ?? Math.ceil(prompt.length / 4);
  const outputTokens = data.usage?.output_tokens ?? Math.ceil(content.length / 4);
  const totalTokens = inputTokens + outputTokens;

  const inputCost = (inputTokens / 1_000_000) * TIER_PRICING[3].input;
  const outputCost = (outputTokens / 1_000_000) * TIER_PRICING[3].output;
  const totalCost = inputCost + outputCost;

  return {
    content,
    tier: 3,
    tokensUsed: totalTokens,
    estimatedCost: totalCost,
    model: 'claude-3-5-sonnet-20241022',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Log LLM invocation to cost tracker
 */
function logInvocation(tier: LLMTier, response: LLMResponse): void {
  costTracker.totalCalls += 1;

  if (tier === 1) {
    costTracker.tier1Calls += 1;
    costTracker.tier1Cost += response.estimatedCost ?? 0;
  } else if (tier === 2) {
    costTracker.tier2Calls += 1;
    costTracker.tier2Cost += response.estimatedCost ?? 0;
  } else if (tier === 3) {
    costTracker.tier3Calls += 1;
    costTracker.tier3Cost += response.estimatedCost ?? 0;
  }

  costTracker.totalCost += response.estimatedCost ?? 0;

  // Log to console if verbose
  if (process.env['LLM_INVOKER_VERBOSE']) {
    console.log(`[LLM-${tier}] ${TIER_NAMES[tier]} | Tokens: ${response.tokensUsed} | Cost: $${(response.estimatedCost ?? 0).toFixed(6)}`);
  }
}

/**
 * Escape shell argument for safe command execution
 */
function escapeShellArg(arg: string): string {
  // Simple escaping - surround with single quotes and escape inner single quotes
  return `'${arg.replace(/'/g, "'\\''")}'`;
}
