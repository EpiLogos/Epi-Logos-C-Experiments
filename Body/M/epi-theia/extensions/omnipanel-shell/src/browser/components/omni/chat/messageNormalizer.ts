export type NormalizedToolCall = {
  id: string;
  name: string;
  inputText: string;
  outputText: string;
};

export type NormalizedChatMessage = {
  id: string;
  role: string;
  timestamp: Date;
  text: string;
  thinking: string | null;
  tools: NormalizedToolCall[];
};

type RawBlock = {
  type?: string;
  text?: string;
  thinking?: string;
  toolName?: string;
  tool_name?: string;
  toolCallId?: string;
  tool_call_id?: string;
  args?: unknown;
  input?: unknown;
  output?: unknown;
  result?: unknown;
};

function normalizeEscapes(text: string) {
  return text.replace(/\\n/g, '\n');
}

function toPrettyText(value: unknown): string {
  if (typeof value === 'string') return normalizeEscapes(value);
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function normalizeBlocks(message: unknown): RawBlock[] {
  if (!message || typeof message !== 'object') return [];
  const candidate = message as { content?: unknown };
  if (!Array.isArray(candidate.content)) return [];

  return candidate.content
    .filter((block) => block && typeof block === 'object')
    .map((block) => block as RawBlock);
}

export function normalizeChatMessage(message: unknown, fallbackId: string): NormalizedChatMessage {
  const item = (message ?? {}) as { role?: string; timestamp?: number; content?: unknown; text?: string };
  const role = item.role ?? 'assistant';
  const timestamp = item.timestamp ? new Date(item.timestamp) : new Date();

  const blocks = normalizeBlocks(message);

  const textParts = blocks
    .filter((block) => block.type === 'text' && typeof block.text === 'string' && block.text.trim().length > 0)
    .map((block) => normalizeEscapes(block.text!));

  const thinkingParts = blocks
    .filter((block) => block.type === 'thinking' && typeof block.thinking === 'string' && block.thinking.trim().length > 0)
    .map((block) => normalizeEscapes(block.thinking!));

  const toolCalls = new Map<string, NormalizedToolCall>();
  for (const block of blocks) {
    const rawType = typeof block.type === 'string' ? block.type.toLowerCase() : '';
    const toolId = block.toolCallId ?? block.tool_call_id;

    if ((rawType === 'toolcall' || rawType === 'tool_call') && typeof toolId === 'string' && toolId.length > 0) {
      toolCalls.set(toolId, {
        id: toolId,
        name: block.toolName ?? block.tool_name ?? 'tool',
        inputText: toPrettyText(block.args ?? block.input ?? {}),
        outputText: '',
      });
    }

    if ((rawType === 'toolresult' || rawType === 'tool_result') && typeof toolId === 'string' && toolId.length > 0) {
      const existing = toolCalls.get(toolId);
      if (existing) {
        existing.outputText = toPrettyText(block.output ?? block.result ?? {});
      } else {
        toolCalls.set(toolId, {
          id: toolId,
          name: block.toolName ?? block.tool_name ?? 'tool',
          inputText: toPrettyText(block.input ?? {}),
          outputText: toPrettyText(block.output ?? block.result ?? {}),
        });
      }
    }
  }

  let text = '';
  if (textParts.length > 0) {
    text = textParts.join('\n\n');
  } else if (typeof item.text === 'string' && item.text.trim().length > 0) {
    text = normalizeEscapes(item.text);
  } else if (blocks.length === 0) {
    text = toPrettyText(message);
  }

  return {
    id: fallbackId,
    role,
    timestamp,
    text,
    thinking: thinkingParts.length > 0 ? thinkingParts.join('\n\n') : null,
    tools: Array.from(toolCalls.values()),
  };
}

export function extractMessageText(message: unknown): string {
  return normalizeChatMessage(message, 'legacy').text;
}
