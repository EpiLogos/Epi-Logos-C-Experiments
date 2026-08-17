import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod4';
import {
  BimbaAuthorizationError,
  BimbaRequestError,
  type BimbaAuthority,
  type BimbaResult,
} from '../application/contracts.js';
import { BimbaApplicationService } from '../application/service.js';

export type AuthorityProvider = () => BimbaAuthority;

function resultContent(result: BimbaResult<unknown>): {
  content: Array<{ type: 'text'; text: string }>;
} {
  return {
    content: [{ type: 'text', text: JSON.stringify(result) }],
  };
}

function safeFailure(error: unknown): {
  content: Array<{ type: 'text'; text: string }>;
  isError: true;
} {
  if (error instanceof BimbaAuthorizationError || error instanceof BimbaRequestError) {
    return {
      content: [{ type: 'text', text: error.message }],
      isError: true,
    };
  }

  return {
    content: [{ type: 'text', text: 'Bimba operation failed' }],
    isError: true,
  };
}

/**
 * Curated MCP 2026-07-28 projection over the canonical Bimba application seam.
 *
 * No internal operation is exposed merely because it exists. In particular,
 * graph administration, sync/chunk implementation details and Telegram are
 * legacy/provider concerns rather than canonical Bimba tools here.
 */
export function createModernBimbaServer(
  service: BimbaApplicationService,
  authorityProvider: AuthorityProvider
): McpServer {
  const server = new McpServer({
    name: 'bimba-mcp',
    version: '0.2.0',
  });

  server.registerTool(
    'bimba_get',
    {
      description: 'Read Bimba material by canonical coordinate.',
      inputSchema: z.object({
        coordinate: z.string().min(1),
        include_nested: z.boolean().optional(),
        limit: z.number().int().min(1).max(1000).optional(),
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ coordinate, include_nested, limit }) => {
      try {
        return resultContent(await service.get(
          { kind: 'coordinate', value: coordinate },
          {
            ...(include_nested !== undefined ? { includeNested: include_nested } : {}),
            ...(limit !== undefined ? { limit } : {}),
          },
          authorityProvider()
        ));
      } catch (error) {
        return safeFailure(error);
      }
    }
  );

  server.registerTool(
    'bimba_search',
    {
      description: 'Search Bimba through the canonical application service.',
      inputSchema: z.object({
        query: z.string().min(1),
        top_k: z.number().int().min(1).max(100).optional(),
        mode: z.enum(['vector_only', 'graph_only', 'hybrid_rrf', 'hybrid_weighted']).optional(),
        search_chunks: z.boolean().optional(),
        expand_to_parent: z.boolean().optional(),
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ query, top_k, mode, search_chunks, expand_to_parent }) => {
      try {
        return resultContent(await service.search(
          query,
          {
            ...(top_k !== undefined ? { topK: top_k } : {}),
            ...(mode !== undefined ? { mode } : {}),
            ...(search_chunks !== undefined ? { searchChunks: search_chunks } : {}),
            ...(expand_to_parent !== undefined ? { expandToParent: expand_to_parent } : {}),
          },
          authorityProvider()
        ));
      } catch (error) {
        return safeFailure(error);
      }
    }
  );

  server.registerTool(
    'bimba_store_embedding',
    {
      description: 'Authorised Bimba mutation: generate and store an embedding on an existing Bimba entity.',
      inputSchema: z.object({
        uuid: z.string().min(1),
        text: z.string().min(1),
        task_type: z.string().min(1).optional(),
        dimensions: z.union([z.literal(768), z.literal(1536), z.literal(3072)]).optional(),
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async ({ uuid, text, task_type, dimensions }) => {
      try {
        return resultContent(await service.storeEmbedding(
          {
            ref: { kind: 'uuid', value: uuid },
            text,
            ...(task_type !== undefined ? { taskType: task_type } : {}),
            ...(dimensions !== undefined ? { dimensions } : {}),
          },
          authorityProvider()
        ));
      } catch (error) {
        return safeFailure(error);
      }
    }
  );

  return server;
}
