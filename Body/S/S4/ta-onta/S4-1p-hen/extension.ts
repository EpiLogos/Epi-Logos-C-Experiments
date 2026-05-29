import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { spawnSync } from "node:child_process";
import { renderTemplateWithVak } from "./modules/template-vak.ts";
import { isValidVakAddress } from "../shared/vak_address.ts";

export async function henExtension(api: ExtensionAPI) {
  // ── Tool: hen_template_invoke ────────────────────────────────────
  api.registerTool({
    name: "hen_template_invoke",
    label: "Hen Template Invoke",
    description: "Render a template into the vault. When EPI_SESSION_VAK_ADDRESS env is present and validates as a VAK address, renders the frontmatter inline with c_4_* coordinate fields injected; otherwise routes through epi CLI for legacy rendering.",
    parameters: Type.Object({
      template_type: Type.Union([
        Type.Literal("seed"),
        Type.Literal("prompt"),
        Type.Literal("task-spec"),
        Type.Literal("pattern-note"),
        Type.Literal("daily-note"),
        Type.Literal("now"),
        Type.Literal("thought"),
        Type.Literal("flow"),
      ]),
      coordinate: Type.Optional(Type.String({ description: "Coordinate of the artifact" })),
      session_id: Type.Optional(Type.String()),
      now_override: Type.Optional(Type.String({ description: "ISO8601 timestamp override (testing)" })),
      day_id: Type.Optional(Type.String({ description: "Day identifier (e.g. 22-05-2026) for daily-note/now" })),
      body: Type.Optional(Type.String({ description: "Optional markdown body appended after frontmatter" })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      // VAK-aware render path: if the session VAK address is in env, inject it
      // into the frontmatter directly rather than delegating to the epi CLI.
      // Falls through silently to the legacy spawn path on any parse/validation
      // failure — the legacy path still works without VAK injection.
      const vakJson = process.env.EPI_SESSION_VAK_ADDRESS;
      if (vakJson) {
        try {
          const parsed = JSON.parse(vakJson);
          if (isValidVakAddress(parsed)) {
            const text = renderTemplateWithVak({
              template_id: params.template_type,
              day_id: params.day_id,
              vak_address: parsed,
              body: params.body,
            });
            return {
              content: [{ type: "text", text }],
              isError: false,
            };
          }
        } catch {
          // Malformed env or non-VAK content — fall through to legacy render path.
        }
      }
      const args = ["vault", "template-invoke", params.template_type];
      if (params.coordinate) args.push("--coordinate", params.coordinate);
      if (params.session_id) args.push("--session-id", params.session_id);
      if (params.now_override) args.push("--now", params.now_override);
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
    label: "Hen Frontmatter Validate",
    description: "Validate note frontmatter against 126-key schema. Reports banned keys (bimbaCoordinate, pos_*), validates {family}_{n}_{semantic} format.",
    parameters: Type.Object({
      note: Type.String({ description: "Vault-relative note path" }),
      vault: Type.Optional(Type.String({ description: "Vault name override" })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const args = ["vault", "frontmatter-validate", params.note];
      if (params.vault) args.push("--vault", params.vault);
      const result = spawnSync("epi", args, { encoding: "utf8" });
      return { content: [{ type: "text", text: result.stdout || result.stderr }] };
    },
  });

  // ── Tool: hen_property_set ──────────────────────────────────────
  api.registerTool({
    name: "hen_property_set",
    label: "Hen Property Set",
    description: "Set a frontmatter property on a vault note. Validates key against 126-key schema first, then writes via obsidian property:set (vault-index-safe). Rejects banned keys.",
    parameters: Type.Object({
      file: Type.String({ description: "Note name (wikilink-style) or path" }),
      key: Type.String({ description: "Frontmatter key in {family}_{n}_{semantic} format" }),
      value: Type.String(),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const result = spawnSync("epi", [
        "vault", "frontmatter-set", params.file, params.key, params.value,
      ], { encoding: "utf8" });
      return {
        content: [{ type: "text", text: result.stdout || result.stderr || `set ${params.key}=${params.value}` }],
        isError: result.status !== 0,
      };
    },
  });

  // ── Tool: hen_task_list ──────────────────────────────────────────
  api.registerTool({
    name: "hen_task_list",
    label: "Hen Task List",
    description: "List tasks in the daily note (default) or a specific vault file.",
    parameters: Type.Object({
      scope: Type.Optional(Type.Union([Type.Literal("daily"), Type.Literal("now"), Type.Literal("file")], { default: "daily" })),
      file: Type.Optional(Type.String({ description: "Note name (for scope=file)" })),
      session_id: Type.Optional(Type.String({ description: "Session ID (for scope=now)" })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const scope = params.scope ?? "daily";
      let args: string[];
      if (scope === "daily") {
        args = ["tasks", "daily"];
      } else if (scope === "now" && params.session_id) {
        const pathResult = spawnSync("epi", ["vault", "now-path", "--session-id", params.session_id], { encoding: "utf8" });
        if (pathResult.status !== 0) {
          return {
            content: [{ type: "text", text: pathResult.stderr || "now-path resolution failed" }],
            isError: true,
          };
        }
        const nowPath = pathResult.stdout.trim();
        args = ["tasks", `path="${nowPath}"`];
      } else if (scope === "file" && params.file) {
        args = ["tasks", `file="${params.file}"`];
      } else {
        args = ["tasks", "daily"];
      }
      const result = spawnSync("obsidian-cli", args, { encoding: "utf8" });
      return { content: [{ type: "text", text: result.stdout || "(no tasks found)" }] };
    },
  });

  // ── Tool: hen_task_complete ──────────────────────────────────────
  api.registerTool({
    name: "hen_task_complete",
    label: "Hen Task Complete",
    description: "Mark a task complete (or toggle) by line number in a vault note.",
    parameters: Type.Object({
      file: Type.String({ description: "Note name (wikilink-style)" }),
      line: Type.Integer({ description: "Line number from hen_task_list output" }),
      action: Type.Optional(Type.Union([Type.Literal("complete"), Type.Literal("toggle")], { default: "complete" })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const action = params.action ?? "complete";
      const result = spawnSync("obsidian-cli", [
        "task", `file="${params.file}"`, `line=${params.line}`, action,
      ], { encoding: "utf8" });
      return {
        content: [{ type: "text", text: result.stdout || result.stderr || `task line ${params.line} ${action}d` }],
        isError: result.status !== 0,
      };
    },
  });

  // ── Tool: hen_search ────────────────────────────────────────────
  api.registerTool({
    name: "hen_search",
    label: "Hen Search",
    description: "Full-text search across the vault using Obsidian's live index.",
    parameters: Type.Object({
      query: Type.String(),
      path: Type.Optional(Type.String({ description: "Restrict search to folder path" })),
      limit: Type.Optional(Type.Integer({ default: 20 })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const args = ["search", `query="${params.query}"`, `limit=${params.limit ?? 20}`];
      if (params.path) args.push(`path="${params.path}"`);
      const result = spawnSync("obsidian-cli", args, { encoding: "utf8" });
      return { content: [{ type: "text", text: result.stdout || "(no results)" }] };
    },
  });

  // ── Tool: hen_link_candidates ────────────────────────────────────
  api.registerTool({
    name: "hen_link_candidates",
    label: "Hen Link Candidates",
    description: "Return ranked existing-note wikilink candidates from Smart Env. Read-only suggestion pool for Hen; does not write links or mutate graph state.",
    parameters: Type.Object({
      note: Type.String({ description: "Vault-relative note path being drafted or repaired" }),
      source_coordinates: Type.Optional(
        Type.Array(Type.String({ description: "Source-coordinate wikilinks such as [[S-SHARDING-TASK-LIST]]" }))
      ),
      limit: Type.Optional(Type.Integer({ default: 10 })),
      include_stale: Type.Optional(Type.Boolean({ default: false })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const args = ["vault", "link-suggest", params.note];
      for (const coord of params.source_coordinates ?? []) {
        args.push("--source-coordinate", coord);
      }
      if (typeof params.limit === "number") {
        args.push("--limit", String(params.limit));
      }
      if (params.include_stale) {
        args.push("--include-stale");
      }
      const result = spawnSync("epi", args, { encoding: "utf8" });
      return {
        content: [{ type: "text", text: result.stdout || result.stderr || "link candidate lookup unavailable" }],
        isError: result.status !== 0,
      };
    },
  });

  // ── Tool: hen_backlinks ─────────────────────────────────────────
  api.registerTool({
    name: "hen_backlinks",
    label: "Hen Backlinks",
    description: "List all notes that link to a given note.",
    parameters: Type.Object({
      file: Type.String({ description: "Note name to find backlinks for" }),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const result = spawnSync("obsidian-cli", ["backlinks", `file="${params.file}"`], { encoding: "utf8" });
      return { content: [{ type: "text", text: result.stdout || "(no backlinks)" }] };
    },
  });

  // ── Tool: hen_hybrid_retrieve ─────────────────────────────────────
  api.registerTool({
    name: "hen_hybrid_retrieve",
    label: "Hen Hybrid Retrieve",
    description: "Coordinate-aware retrieval: obsidian search + Neo4j graph traversal.",
    parameters: Type.Object({
      query: Type.String(),
      coordinate: Type.Optional(Type.String({ description: "Filter by coordinate for graph traversal" })),
      vault: Type.Optional(Type.String()),
      limit: Type.Optional(Type.Integer({ default: 10 })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const obsArgs = ["search", `query="${params.query}"`, `limit=${params.limit ?? 10}`];
      const obsResult = spawnSync("obsidian-cli", obsArgs, { encoding: "utf8" });
      const vaultHits = obsResult.stdout?.trim() || "(no vault results)";

      let graphHits = "";
      if (params.coordinate) {
        const gResult = spawnSync("epi", ["--json", "graph", "retrieve", params.coordinate, "--nested"], { encoding: "utf8" });
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
    label: "Hen Status",
    description: "Template registry state, sync queue depth, pending validations.",
    parameters: Type.Object({}),
    async execute(_id: string, _params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const result = spawnSync("epi", ["--json", "agent", "extensions", "status", "--agent", "main"], { encoding: "utf8" });
      return {
        content: [{ type: "text", text: result.stdout || result.stderr || "extension status unavailable" }],
        isError: result.status !== 0,
      };
    },
  });

  // ── Tool: graph_query ─────────────────────────────────────────────
  api.registerTool({
    name: "graph_query",
    label: "Graph Query",
    description: "Report that arbitrary Cypher execution is not exposed through the current epi CLI contract.",
    parameters: Type.Object({
      cypher: Type.String({ description: "Cypher query string" }),
      // params: open object — Query parameters
      params: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      return {
        content: [{
          type: "text",
          text: `graph_query unavailable: epi does not expose arbitrary Cypher execution.\nRequested query: ${params.cypher}`,
        }],
        isError: true,
      };
    },
  });

  // ── Tool: web_search ─────────────────────────────────────────────
  api.registerTool({
    name: "web_search",
    label: "Web Search",
    description: "Search the web via DuckDuckGo. Returns titles, URLs, and snippets for the top results. Use for research, finding sources, and discovering content.",
    parameters: Type.Object({
      query: Type.String({ description: "Search query" }),
      max_results: Type.Optional(Type.Number({ description: "Max results to return (default 8, max 20)" })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const max = Math.min(params.max_results ?? 8, 20);
      try {
        const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(params.query)}&ia=web`;
        const res = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
          },
        });
        const html = await res.text();

        // Extract result blocks — each has a title anchor, URL, and snippet
        const titleRe = /<a[^>]+class="result__a"[^>]+href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g;
        const snippetRe = /<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;

        const titles = [...html.matchAll(titleRe)];
        const snippets = [...html.matchAll(snippetRe)];

        if (titles.length === 0) {
          return { content: [{ type: "text", text: "No results found (DDG may have changed markup or rate-limited)" }] };
        }

        const results: string[] = [];
        for (let i = 0; i < Math.min(titles.length, max); i++) {
          const rawHref = titles[i][1];
          const titleHtml = titles[i][2];
          const title = titleHtml.replace(/<[^>]+>/g, "").trim();

          // DDG wraps real URLs in /l/?uddg=<encoded-url>&...
          let realUrl = rawHref;
          const uddgMatch = rawHref.match(/[?&]uddg=([^&]+)/);
          if (uddgMatch) {
            try { realUrl = decodeURIComponent(uddgMatch[1]); } catch {}
          }

          const snippetHtml = snippets[i]?.[1] ?? "";
          const snippet = snippetHtml.replace(/<[^>]+>/g, "").trim();

          results.push(`${i + 1}. **${title}**\n   ${realUrl}\n   ${snippet}`);
        }

        return { content: [{ type: "text", text: results.join("\n\n") }] };
      } catch (e) {
        return { content: [{ type: "text", text: `web_search error: ${e}` }], isError: true };
      }
    },
  });

  // ── Tool: web_fetch ───────────────────────────────────────────────
  api.registerTool({
    name: "web_fetch",
    label: "Web Fetch",
    description: "Fetch a URL and return its content as clean readable markdown. Uses Jina Reader (r.jina.ai) — strips nav/ads/boilerplate, returns the actual content. Use after web_search to read a specific page.",
    parameters: Type.Object({
      url: Type.String({ description: "URL to fetch and read" }),
      max_chars: Type.Optional(Type.Number({ description: "Truncate output to this many characters (default 12000)" })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const limit = params.max_chars ?? 12000;
      try {
        const res = await fetch(`https://r.jina.ai/${params.url}`, {
          headers: { "Accept": "text/plain", "X-No-Cache": "true" },
        });
        if (!res.ok) {
          return { content: [{ type: "text", text: `web_fetch: HTTP ${res.status} for ${params.url}` }], isError: true };
        }
        const text = await res.text();
        const out = text.length > limit ? text.slice(0, limit) + `\n\n... [truncated at ${limit} chars]` : text;
        return { content: [{ type: "text", text: out }] };
      } catch (e) {
        return { content: [{ type: "text", text: `web_fetch error: ${e}` }], isError: true };
      }
    },
  });

  api.on("tool_call", async (event) => {
    if (event.toolName === "khora_write" && typeof event.input === "object" && event.input !== null) {
      const inp = event.input as { content?: string; path?: string };
      if (inp.content?.includes("---") && inp.path?.endsWith(".md")) {
        // Best-effort frontmatter validation on vault writes (logged, not blocking)
      }
    }
  });

  api.on("tool_result", async () => {
    // Sync event emission handled by khora_write → khora_sync_queue_push
  });
}
