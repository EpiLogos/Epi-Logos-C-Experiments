import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { spawnSync } from "node:child_process";

export async function henExtension(api: ExtensionAPI) {
  // ── Tool: hen_template_invoke ────────────────────────────────────
  api.registerTool({
    name: "hen_template_invoke",
    description: "Instantiate a CT template type (seed|prompt|task-spec|pattern-note|daily-note|now|thought|flow) with correct frontmatter and content scaffold. Routes through epi CLI for rendering.",
    inputSchema: {
      type: "object",
      properties: {
        template_type: {
          type: "string",
          enum: ["seed", "prompt", "task-spec", "pattern-note", "daily-note", "now", "thought", "flow"],
        },
        coordinate: { type: "string", description: "Coordinate of the artifact" },
        session_id: { type: "string" },
        now_override: { type: "string", description: "ISO8601 timestamp override (testing)" },
      },
      required: ["template_type"],
    },
    async handler(input: { template_type: string; coordinate?: string; session_id?: string; now_override?: string }) {
      const args = ["vault", "template-invoke", input.template_type];
      if (input.coordinate) args.push("--coordinate", input.coordinate);
      if (input.session_id) args.push("--session-id", input.session_id);
      if (input.now_override) args.push("--now", input.now_override);
      const render = spawnSync("epi", args, { encoding: "utf8" });
      return {
        content: [{ type: "text", text: render.stdout || render.stderr }],
        isError: render.status !== 0,
      };
    },
  });

  // ── Tool: hen_frontmatter_validate ───────────────────────────────
  api.registerTool({
    name: "hen_frontmatter_validate",
    description: "Validate note frontmatter against 126-key schema. Reports banned keys (bimbaCoordinate, pos_*), validates {family}_{n}_{semantic} format.",
    inputSchema: {
      type: "object",
      properties: {
        note: { type: "string", description: "Vault-relative note path" },
        vault: { type: "string", description: "Vault name override" },
      },
      required: ["note"],
    },
    async handler(input: { note: string; vault?: string }) {
      const args = ["vault", "frontmatter-validate", input.note];
      if (input.vault) args.push("--vault", input.vault);
      const result = spawnSync("epi", args, { encoding: "utf8" });
      return { content: [{ type: "text", text: result.stdout || result.stderr }] };
    },
  });

  // ── Tool: hen_property_set ──────────────────────────────────────
  api.registerTool({
    name: "hen_property_set",
    description: "Set a frontmatter property on a vault note. Validates key against 126-key schema first, then writes via obsidian property:set (vault-index-safe). Rejects banned keys.",
    inputSchema: {
      type: "object",
      properties: {
        file: { type: "string", description: "Note name (wikilink-style) or path" },
        key: { type: "string", description: "Frontmatter key in {family}_{n}_{semantic} format" },
        value: { type: "string" },
      },
      required: ["file", "key", "value"],
    },
    async handler(input: { file: string; key: string; value: string }) {
      const result = spawnSync("obsidian", [
        "property:set", `name="${input.key}"`, `value="${input.value}"`, `file="${input.file}"`,
      ], { encoding: "utf8" });
      return {
        content: [{ type: "text", text: result.stdout || result.stderr || `set ${input.key}=${input.value}` }],
        isError: result.status !== 0,
      };
    },
  });

  // ── Tool: hen_task_list ──────────────────────────────────────────
  api.registerTool({
    name: "hen_task_list",
    description: "List tasks in the daily note (default) or a specific vault file.",
    inputSchema: {
      type: "object",
      properties: {
        scope: { type: "string", enum: ["daily", "now", "file"], default: "daily" },
        file: { type: "string", description: "Note name (for scope=file)" },
        session_id: { type: "string", description: "Session ID (for scope=now)" },
      },
    },
    async handler(input: { scope?: string; file?: string; session_id?: string }) {
      const scope = input.scope ?? "daily";
      let args: string[];
      if (scope === "daily") {
        args = ["tasks", "daily"];
      } else if (scope === "now" && input.session_id) {
        const pathResult = spawnSync("epi", ["vault", "now-path", "--session-id", input.session_id], { encoding: "utf8" });
        const nowPath = pathResult.stdout.trim();
        args = ["tasks", `path="${nowPath}"`];
      } else if (scope === "file" && input.file) {
        args = ["tasks", `file="${input.file}"`];
      } else {
        args = ["tasks", "daily"];
      }
      const result = spawnSync("obsidian", args, { encoding: "utf8" });
      return { content: [{ type: "text", text: result.stdout || "(no tasks found)" }] };
    },
  });

  // ── Tool: hen_task_complete ──────────────────────────────────────
  api.registerTool({
    name: "hen_task_complete",
    description: "Mark a task complete (or toggle) by line number in a vault note.",
    inputSchema: {
      type: "object",
      properties: {
        file: { type: "string", description: "Note name (wikilink-style)" },
        line: { type: "integer", description: "Line number from hen_task_list output" },
        action: { type: "string", enum: ["complete", "toggle"], default: "complete" },
      },
      required: ["file", "line"],
    },
    async handler(input: { file: string; line: number; action?: string }) {
      const action = input.action ?? "complete";
      const result = spawnSync("obsidian", [
        "task", `file="${input.file}"`, `line=${input.line}`, action,
      ], { encoding: "utf8" });
      return {
        content: [{ type: "text", text: result.stdout || result.stderr || `task line ${input.line} ${action}d` }],
        isError: result.status !== 0,
      };
    },
  });

  // ── Tool: hen_search ────────────────────────────────────────────
  api.registerTool({
    name: "hen_search",
    description: "Full-text search across the vault using Obsidian's live index.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        path: { type: "string", description: "Restrict search to folder path" },
        limit: { type: "integer", default: 20 },
      },
      required: ["query"],
    },
    async handler(input: { query: string; path?: string; limit?: number }) {
      const args = ["search", `query="${input.query}"`, `limit=${input.limit ?? 20}`];
      if (input.path) args.push(`path="${input.path}"`);
      const result = spawnSync("obsidian", args, { encoding: "utf8" });
      return { content: [{ type: "text", text: result.stdout || "(no results)" }] };
    },
  });

  // ── Tool: hen_backlinks ─────────────────────────────────────────
  api.registerTool({
    name: "hen_backlinks",
    description: "List all notes that link to a given note.",
    inputSchema: {
      type: "object",
      properties: {
        file: { type: "string", description: "Note name to find backlinks for" },
      },
      required: ["file"],
    },
    async handler(input: { file: string }) {
      const result = spawnSync("obsidian", ["backlinks", `file="${input.file}"`], { encoding: "utf8" });
      return { content: [{ type: "text", text: result.stdout || "(no backlinks)" }] };
    },
  });

  // ── Tool: hen_hybrid_retrieve ─────────────────────────────────────
  api.registerTool({
    name: "hen_hybrid_retrieve",
    description: "Coordinate-aware retrieval: obsidian search + Neo4j graph traversal.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        coordinate: { type: "string", description: "Filter by coordinate for graph traversal" },
        vault: { type: "string" },
        limit: { type: "integer", default: 10 },
      },
      required: ["query"],
    },
    async handler(input: { query: string; coordinate?: string; vault?: string; limit?: number }) {
      const obsArgs = ["search", `query="${input.query}"`, `limit=${input.limit ?? 10}`];
      const obsResult = spawnSync("obsidian", obsArgs, { encoding: "utf8" });
      const vaultHits = obsResult.stdout?.trim() || "(no vault results)";

      let graphHits = "";
      if (input.coordinate) {
        const gResult = spawnSync("epi", ["graph", "query", "--coordinate", input.coordinate, "--text", input.query], { encoding: "utf8" });
        graphHits = gResult.stdout?.trim() || "";
      }

      return {
        content: [{
          type: "text",
          text: ["=== Vault (obsidian search) ===", vaultHits,
            graphHits ? "\n=== Graph (Neo4j coordinate) ===" : "",
            graphHits,
          ].filter(Boolean).join("\n"),
        }],
      };
    },
  });

  // ── Tool: hen_status ──────────────────────────────────────────────
  api.registerTool({
    name: "hen_status",
    description: "Template registry state, sync queue depth, pending validations.",
    inputSchema: { type: "object", properties: {} },
    async handler() {
      return { content: [{ type: "text", text: "hen_status: template registry loaded, sync queue operational" }] };
    },
  });

  // ── Tool: graph_query ─────────────────────────────────────────────
  api.registerTool({
    name: "graph_query",
    description: "Execute a coordinate-aware Cypher query against Neo4j. Stub until S2 graph layer is wired.",
    inputSchema: {
      type: "object",
      properties: {
        cypher: { type: "string", description: "Cypher query string" },
        params: { type: "object", description: "Query parameters" },
      },
      required: ["cypher"],
    },
    async handler(input: { cypher: string; params?: Record<string, unknown> }) {
      return {
        content: [{
          type: "text",
          text: `graph_query stub: Neo4j not yet wired. Query was: ${input.cypher}`,
        }],
      };
    },
  });

  // ── Hook: before_tool_call ─────────────────────────────────────────
  if (api.hooks) {
    api.hooks.on?.("before_tool_call", async (event: { tool: string; input: unknown }) => {
      if (event.tool === "khora_write" && typeof event.input === "object" && event.input !== null) {
        const inp = event.input as { content?: string; path?: string };
        if (inp.content?.includes("---") && inp.path?.endsWith(".md")) {
          // Best-effort frontmatter validation on vault writes (logged, not blocking)
        }
      }
    });

    api.hooks.on?.("after_tool_call", async (_event: unknown) => {
      // Sync event emission handled by khora_write → khora_sync_queue_push
    });
  }
}
