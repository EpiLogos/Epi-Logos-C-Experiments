import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { spawnSync } from "node:child_process";
import { buildTemporalContextEnvelope, adjustKairosThreshold, coordinateMobiusReturn } from "./modules/chronos-integration.ts";
import { buildTemplateInvocation, refreshTopology, validateHenSync } from "./modules/hen-integration.ts";
import { maybeUpdateCoordinateMap } from "./modules/coordinate-loop.ts";
import { aletheiaIngestSophia } from "./modules/sophia-ingest.ts";
// NB: renderThoughtFrontmatter (modules/thought-vak.ts) is intentionally NOT
// imported here. VAK merging now happens Rust-side via the
// --vak-address-json flag on `epi vault thought-route` so the persisted
// artifact has a single ---...--- frontmatter block. The pure renderer is
// kept as a reference implementation of the expected output shape (covered
// by tests/thought_route_vak.test.ts) and may be needed later for non-CLI
// paths.
import { isValidVakAddress } from "../shared/vak_address.ts";

function resolveNotebookName(name: string, scope?: string, sessionId?: string, family?: string) {
  const parts: string[] = [];
  if (scope === "session" && sessionId) {
    parts.push(`session-${sessionId}`);
  }
  if (scope === "persistent" && family) {
    parts.push(`family-${family}`);
  }
  parts.push(name);
  return parts.join("-").replace(/\s+/g, "-");
}

function renderMetadataDocument(title: string, body: string, metadata: Record<string, string | number | undefined>) {
  const metadataLines = Object.entries(metadata)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([key, value]) => `- ${key}: ${value}`);
  return [
    `# ${title}`,
    "",
    metadataLines.length ? "## Metadata" : "",
    metadataLines.join("\n"),
    metadataLines.length ? "" : "",
    body.trim(),
    "",
  ].filter(Boolean).join("\n");
}

function defaultVaultRoot() {
  return process.env.EPILOGOS_VAULT ?? `${process.env.HOME ?? "."}/Documents/Epi-Logos/Idea`;
}

export async function aletheiaExtension(api: ExtensionAPI) {
  // ── Tool: aletheia_session_promote ───────────────────────────────
  api.registerTool({
    name: "aletheia_session_promote",
    label: "Aletheia Session Promote",
    description: "Promote high-signal observations from claude-mem (HOT tier) into Gnosis (3072-dim Neo4j). " +
      "Filters by observation type (decision/bugfix/feature/discovery) to skip low-signal reads. " +
      "Re-embeds at 3072-dim via epi techne gnosis ingest. Stores cross-ref in Redis.",
    parameters: Type.Object({
      session_ids: Type.Array(Type.String(), {
        description: "Session IDs to promote (include parent + all child_session_ids)",
      }),
      day_id: Type.Optional(Type.String({ description: "Day being promoted (DD-MM-YYYY)" })),
      notebook: Type.Optional(Type.String({ description: "Target Gnosis notebook" })),
      promote_types: Type.Optional(Type.Array(
        Type.Union([
          Type.Literal("decision"),
          Type.Literal("bugfix"),
          Type.Literal("feature"),
          Type.Literal("discovery"),
          Type.Literal("change"),
        ]),
        { default: ["decision", "bugfix", "feature", "discovery"] }
      )),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const types = params.promote_types ?? ["decision", "bugfix", "feature", "discovery"];
      const promoted: string[] = [];
      const failed: string[] = [];

      for (const sessionId of params.session_ids) {
        let observations: Array<{
          id: string; type: string; title: string; narrative: string;
          facts: string; concepts: string; tool_name: string;
        }>;
        try {
          const resp = await fetch(
            `http://localhost:37777/api/observations?project=epi-logos&limit=100`,
            { signal: AbortSignal.timeout(5000) }
          );
          const data = await resp.json() as { items: typeof observations };
          observations = (data.items ?? []).filter(
            (o) => types.includes(o.type) && o.title
          );
        } catch {
          failed.push(`${sessionId}: claude-mem worker unreachable`);
          continue;
        }

        let summaryText = "";
        try {
          const sr = await fetch(`http://localhost:37777/api/session/${sessionId}`, { signal: AbortSignal.timeout(3000) });
          if (sr.ok) {
            const sd = await sr.json() as { learned?: string; completed?: string };
            summaryText = [sd.learned, sd.completed].filter(Boolean).join("\n");
          }
        } catch { /* summary optional */ }

        const { writeFileSync, mkdirSync } = await import("node:fs");
        const tmpDir = `/tmp/aletheia-promote-${sessionId}`;
        mkdirSync(tmpDir, { recursive: true });

        for (const obs of observations) {
          const content = renderMetadataDocument(
            obs.title,
            [
              obs.narrative ?? "",
              obs.facts ? `Facts:\n${obs.facts}` : "",
              obs.concepts ? `Concepts:\n${obs.concepts}` : "",
            ].filter(Boolean).join("\n\n"),
            {
              source: `claude-mem:${obs.id}`,
              session_id: sessionId,
              day_id: params.day_id,
              observation_type: obs.type,
              tool_name: obs.tool_name,
            },
          );

          const tmpPath = `${tmpDir}/${obs.id}.md`;
          writeFileSync(tmpPath, content);

          const args = ["techne", "gnosis", "ingest-gnostic", tmpPath];
          if (params.notebook) args.push("--notebook", params.notebook);
          const r = spawnSync("epi", args, { encoding: "utf8", timeout: 60_000 });

          if (r.status === 0) {
            spawnSync("epi", [
              "core", "cache", "set",
              `claude-mem-obs:${obs.id}`, `gnosis:promoted:${sessionId}`,
              "--ttl", "2592000",
            ], { encoding: "utf8" });
            promoted.push(obs.id);
          } else {
            failed.push(`${obs.id}: ${r.stderr?.slice(0, 80)}`);
          }
        }

        if (summaryText) {
          const summaryPath = `${tmpDir}/summary.md`;
          writeFileSync(summaryPath, renderMetadataDocument(
            "Session Summary",
            summaryText,
            {
              source: `claude-mem:summary:${sessionId}`,
              session_id: sessionId,
              day_id: params.day_id,
            },
          ));
          const args = ["techne", "gnosis", "ingest-gnostic", summaryPath];
          if (params.notebook) args.push("--notebook", params.notebook);
          spawnSync("epi", args, { encoding: "utf8", timeout: 60_000 });
        }
      }

      return {
        content: [{
          type: "text",
          text: `Promoted ${promoted.length} observations from ${params.session_ids.length} sessions.\n` +
            (failed.length ? `Failed: ${failed.join(", ")}` : "All succeeded."),
        }],
        isError: failed.length > 0 && promoted.length === 0,
      };
    },
  });

  // ── Tool: aletheia_gnosis_ingest ─────────────────────────────────
  api.registerTool({
    name: "aletheia_gnosis_ingest",
    label: "Aletheia Gnosis Ingest",
    description: "Ingest a document into the Gnosis RAG pipeline (RAG-Anything/LightRAG/MinerU-oriented parse → chunk → 3072-dim embed → Neo4j).",
    parameters: Type.Object({
      path: Type.String({ description: "Filesystem path to document" }),
      notebook: Type.Optional(Type.String({ description: "Target Gnosis notebook name" })),
      coordinate: Type.Optional(Type.String({ description: "Coordinate for RELATES_TO_COORDINATE edge" })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const args = ["techne", "gnosis", "ingest-gnostic", params.path];
      if (params.coordinate) args.push("--coordinate", params.coordinate);
      if (params.notebook) args.push("--notebook", params.notebook);
      const result = spawnSync("epi", args, { encoding: "utf8", timeout: 120_000 });
      if (result.status !== 0) {
        return {
          content: [{ type: "text", text: `gnosis ingest failed: ${result.stderr || result.stdout}` }],
          isError: true,
        };
      }
      return {
        content: [{ type: "text", text: result.stdout || result.stderr }],
      };
    },
  });

  // ── Tool: aletheia_gnosis_query ──────────────────────────────────
  api.registerTool({
    name: "aletheia_gnosis_query",
    label: "Aletheia Gnosis Query",
    description: "Hybrid retrieval from Gnosis (vector + graph + Redis RRF fusion). Returns relevant chunks.",
    parameters: Type.Object({
      query: Type.String(),
      notebook: Type.Optional(Type.String({ description: "Notebook to query" })),
      top_k: Type.Optional(Type.Integer({ default: 5 })),
      coordinate: Type.Optional(Type.String({ description: "Filter by coordinate context" })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      // Coordinate context prepended to question — epi-gnostic query takes (question, --mode)
      const question = params.coordinate
        ? `${params.query} [coordinate context: ${params.coordinate}]`
        : params.query;
      const args = ["techne", "gnosis", "query-gnostic", question, "--mode", "hybrid"];
      const result = spawnSync("epi", args, { encoding: "utf8", timeout: 30_000 });
      if (result.status !== 0) {
        return {
          content: [{ type: "text", text: `gnosis query failed: ${result.stderr || result.stdout}` }],
          isError: true,
        };
      }
      return {
        content: [{ type: "text", text: result.stdout || result.stderr }],
      };
    },
  });

  // ── Tool: aletheia_gnosis_notebook_create ────────────────────────
  api.registerTool({
    name: "aletheia_gnosis_notebook_create",
    label: "Aletheia Gnosis Notebook Create",
    description: "Create a Gnosis:Notebook (session-scoped or persistent family).",
    parameters: Type.Object({
      name: Type.String(),
      scope: Type.Optional(Type.Union([Type.Literal("session"), Type.Literal("persistent")], { default: "session" })),
      session_id: Type.Optional(Type.String()),
      family: Type.Optional(Type.String({ description: "For persistent: C|P|L|S|T|M" })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const notebookName = resolveNotebookName(params.name, params.scope, params.session_id, params.family);
      // Notebook management stays on the local Rust-native gnosis tier (no Python needed)
      const args = ["techne", "gnosis", "notebook", "create", notebookName];
      const result = spawnSync("epi", args, { encoding: "utf8" });
      return {
        content: [{ type: "text", text: result.stdout || result.stderr || `notebook create: ${notebookName}` }],
        isError: result.status !== 0,
      };
    },
  });

  // ── Tool: aletheia_thought_route ─────────────────────────────────
  api.registerTool({
    name: "aletheia_thought_route",
    label: "Aletheia Thought Route",
    description: "Classify thought artifact and route to T{n} bucket in /Pratibimba/Self/Thought/. T0=questions, T1=traces, T2=challenges, T3=patterns, T4=discoveries, T5=insights. When EPI_SESSION_VAK_ADDRESS env is present and validates, the producing VAK address is forwarded to `epi vault thought-route --vak-address-json` and the Rust template renderer inlines the seven canonical VAK keys (cpf/ct/cp/cf/cfp/cs_code/cs_direction) into the SAME ---...--- frontmatter block as the template keys — producing a single, parser-readable block. Dialogical-mode dispatches (no VAK in env) persist without VAK keys.",
    parameters: Type.Object({
      content: Type.String({ description: "Thought content to archive" }),
      position: Type.Integer({ minimum: 0, maximum: 5, description: "T-bucket position (0-5)" }),
      session_id: Type.Optional(Type.String()),
      source_coordinates: Type.Optional(Type.Array(Type.String(), {
        description: "Bimba coordinate refs (e.g. ['M4-3','T3','S1'])",
      })),
      now_path: Type.Optional(Type.String({ description: "Source NOW folder path" })),
      summary: Type.Optional(Type.String({ description: "Short summary for VAK frontmatter (falls back to first line of content)" })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      // VAK-aware path: when EPI_SESSION_VAK_ADDRESS is present and validates,
      // forward the raw JSON verbatim to the Rust CLI as --vak-address-json.
      // The Rust render_template_with_vak inlines the canonical VAK keys
      // into the SAME frontmatter block as the template keys — producing a
      // single, parser-readable ---...--- block at the top of the file.
      //
      // Falls through silently to no-flag (dialogical pass-through) on parse
      // or validation failure — dialogical-mode dispatches have no
      // obligation to carry VAK.
      const args = ["vault", "thought-route", "--position", String(params.position), "--content", params.content];
      if (params.session_id) args.push("--session-id", params.session_id);
      if (params.source_coordinates?.length) {
        for (const coord of params.source_coordinates) {
          args.push("--coordinate", coord);
        }
      }
      const vakJson = process.env.EPI_SESSION_VAK_ADDRESS;
      if (vakJson) {
        try {
          const parsed = JSON.parse(vakJson);
          if (isValidVakAddress(parsed)) {
            // Forward the original env string verbatim — re-stringifying
            // could drop canonical literal markers (the env value is
            // authoritative; we only used parse+validate to gate the flag).
            args.push("--vak-address-json", vakJson);
          }
        } catch {
          // Malformed env — omit the flag (dialogical pass-through).
        }
      }
      const result = spawnSync("epi", args, { encoding: "utf8" });
      if (result.status !== 0) {
        return { content: [{ type: "text", text: `thought-route failed: ${result.stderr}` }], isError: true };
      }
      return { content: [{ type: "text", text: result.stdout }] };
    },
  });

  // ── Tool: aletheia_crystallise ───────────────────────────────────
  api.registerTool({
    name: "aletheia_crystallise",
    label: "Aletheia Crystallise",
    description: "Distill patterns from T-bucket contents into Bimba canonical form.",
    parameters: Type.Object({
      source_bucket: Type.Union([
        Type.Literal("T0"),
        Type.Literal("T1"),
        Type.Literal("T2"),
        Type.Literal("T3"),
        Type.Literal("T4"),
        Type.Literal("T5"),
      ]),
      target_coordinate: Type.Optional(Type.String({ description: "Bimba coordinate to crystallise into" })),
      day_id: Type.Optional(Type.String()),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const syncState = validateHenSync();
      if (!syncState.ok) {
        return {
          content: [{ type: "text", text: `crystallise blocked by Hen sync state: ${syncState.output}` }],
          isError: true,
        };
      }
      return {
        content: [{
          type: "text",
          text: `crystallise unavailable: the current epi CLI does not expose a crystallise command.\nUse aletheia_gnosis_query for retrieval and a constitutional agent run for synthesis from ${params.source_bucket}${params.target_coordinate ? ` into ${params.target_coordinate}` : ""}${params.day_id ? ` on ${params.day_id}` : ""}.`,
        }],
        isError: true,
      };
    },
  });

  // ── Tool: aletheia_seed_refresh ──────────────────────────────────
  api.registerTool({
    name: "aletheia_seed_refresh",
    label: "Aletheia Seed Refresh",
    description: "Generate SEED.md morning-context package from evening crystallisation. Writes to /Idea/Empty/Present/SEED.md.",
    parameters: Type.Object({
      day_id: Type.String({ description: "Day being processed" }),
      insights: Type.Optional(Type.Array(Type.String(), { description: "T5 insights to seed forward" })),
      questions: Type.Optional(Type.Array(Type.String(), { description: "T0 questions to carry forward" })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const templateKey = buildTemplateInvocation("seed");
      const insights = (params.insights || []).map((i: string) => `- ${i}`).join("\n");
      const questions = (params.questions || []).map((q: string) => `- ${q}`).join("\n");
      const seedContent = `---
coordinate: ""
c_4_artifact_role: "seed"
c_1_ct_type: "${templateKey}"
c_3_ctx_frame: "00/00"
c_3_day_id: "${params.day_id}"
c_3_created_at: "${new Date().toISOString()}"
---

# SEED — ${params.day_id}

## #0 — Carried Forward (from yesterday's P5')
${insights || "<!-- No insights carried forward -->"}

## #0 — Questions for Today (from yesterday's P0')
${questions || "<!-- No questions carried forward -->"}
`;
      const { writeFileSync, mkdirSync } = await import("node:fs");
      const seedPath = `${defaultVaultRoot()}/Empty/Present/SEED.md`;
      mkdirSync(`${defaultVaultRoot()}/Empty/Present`, { recursive: true });
      writeFileSync(seedPath, seedContent);

      refreshTopology();

      // Log continuation marker
      const contArgs = ["agent", "session", "continuation", "--summary", `SEED.md refreshed for ${params.day_id}`];
      spawnSync("epi", contArgs, { encoding: "utf8" });

      return {
        content: [{
          type: "text",
          text: `SEED.md written for ${params.day_id}\nInsights: ${params.insights?.length || 0}, Questions: ${params.questions?.length || 0}`,
        }],
      };
    },
  });

  // ── Tool: aletheia_gnosis_enrich ─────────────────────────────────
  api.registerTool({
    name: "aletheia_gnosis_enrich",
    label: "Aletheia Gnosis Enrich",
    description: "Enrich a Gnostic entity node with a direct coordinate assignment (MAPS_TO_COORDINATE) or LLM-classified resonance (RESONATES_WITH).",
    parameters: Type.Object({
      entity_id: Type.String({ description: "Gnostic entity node ID" }),
      coordinate: Type.Optional(Type.String({ description: "Bimba coordinate (direct if known; else LLM-classified)" })),
      family: Type.Optional(Type.String({ description: "Coordinate family: C|P|L|S|T|M" })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const args = ["techne", "gnosis", "enrich", params.entity_id];
      if (params.coordinate) args.push("--coordinate", params.coordinate);
      if (params.family) args.push("--family", params.family);
      const result = spawnSync("epi", args, { encoding: "utf8", timeout: 30_000 });
      return {
        content: [{ type: "text", text: result.stdout || result.stderr || "enriched" }],
        isError: result.status !== 0,
      };
    },
  });

  // ── Tool: aletheia_gnosis_status ─────────────────────────────────
  api.registerTool({
    name: "aletheia_gnosis_status",
    label: "Aletheia Gnosis Status",
    description: "Report status of both Gnosis tiers: local JSON store and Neo4j LightRAG namespace.",
    parameters: Type.Object({}),
    async execute(_id: string, _params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const result = spawnSync("epi", ["techne", "gnosis", "status"], { encoding: "utf8", timeout: 15_000 });
      return {
        content: [{ type: "text", text: result.stdout || result.stderr || "status unavailable" }],
        isError: result.status !== 0,
      };
    },
  });

  // ── Tool: aletheia_episodic_record ───────────────────────────────
  api.registerTool({
    name: "aletheia_episodic_record",
    label: "Aletheia Episodic Record",
    description: "Record a QL-typed episode to the personal episodic graph at #4.4.4.4 (Pratibimba namespace). " +
      "Episodes carry full QL coordinate (position, cpf, cp), astrological stamp (auto from NOW cache), and optional arc attachment.",
    parameters: Type.Object({
      content: Type.String({ description: "Episode text content" }),
      ql_position: Type.String({ description: "QL position: 0–5, 0'–5', 4.2, 4.5.3, 4.0, etc." }),
      cpf: Type.String({ description: "Context frame: (00/00), (0/1), (0/1/2), (0/1/2/3), (4.0/1-4.4/5), (5/0), (4.5/0)" }),
      cp: Type.String({ description: "Positional address e.g. 4.2 or 4.5.0" }),
      source: Type.Optional(Type.Union([Type.Literal("agent"), Type.Literal("user"), Type.Literal("gateway")], { default: "agent" })),
      arc_id: Type.Optional(Type.String({ description: "Attach to open arc (optional)" })),
      arc_type: Type.Optional(Type.String({ description: "Arc type if arc_id provided" })),
      day_id: Type.Optional(Type.String()),
      tick12: Type.Optional(Type.Integer({ minimum: 0, maximum: 11, description: "Spanda position" })),
      group_id: Type.Optional(Type.String({ description: "Quintessence hash — defaults to active identity hash" })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      try {
        const resp = await fetch("http://localhost:37778/episode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
          signal: AbortSignal.timeout(10_000),
        });
        const body = await resp.json() as { status: string; name?: string };
        return {
          content: [{ type: "text", text: body.status === "ok" ? `episode recorded: ${body.name ?? ""}` : JSON.stringify(body) }],
          isError: body.status !== "ok",
        };
      } catch (e) {
        return {
          content: [{ type: "text", text: `graphiti sidecar unreachable: ${e}. Start with: epi gate graphiti start` }],
          isError: true,
        };
      }
    },
  });

  // ── Tool: aletheia_episodic_search ───────────────────────────────
  api.registerTool({
    name: "aletheia_episodic_search",
    label: "Aletheia Episodic Search",
    description: "BFS search from #4.4.4.4 PersonalNexus anchor through the personal episodic graph. " +
      "Optionally filter by QL position prefix, sun decan, or tick12 (spanda position) for structurally harmonic retrieval. " +
      "tick12 filter surfaces episodes from the same spanda position across prior sessions.",
    parameters: Type.Object({
      query: Type.String(),
      ql_position_prefix: Type.Optional(Type.String({ description: "e.g. '4.3' returns all alchemical episodes" })),
      sun_decan_filter: Type.Optional(Type.String({ description: "Filter by astrological decan context" })),
      tick12_filter: Type.Optional(Type.Integer({ minimum: 0, maximum: 11, description: "Spanda position filter — surfaces episodes from same tick12 across prior sessions" })),
      inverted_only: Type.Optional(Type.Boolean({ description: "Return only inverted (primed) episodes — used by Sophia night' pass" })),
      cs_filter: Type.Optional(Type.Union([Type.Literal("day"), Type.Literal("night_prime")], { description: "Temporal cycle filter" })),
      num_results: Type.Optional(Type.Integer({ default: 10 })),
      group_id: Type.Optional(Type.String({ description: "Quintessence hash scope" })),
      use_redis_cache: Type.Optional(Type.Boolean({ default: true })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const graphitiBase = process.env.GRAPHITI_URL ?? "http://localhost:37778";
      const urlParams = new URLSearchParams({ query: params.query });
      if (params.ql_position_prefix) urlParams.set("ql_position_prefix", params.ql_position_prefix);
      if (params.sun_decan_filter) urlParams.set("sun_decan_filter", params.sun_decan_filter);
      if (params.tick12_filter !== undefined) urlParams.set("tick12", String(params.tick12_filter));
      if (params.inverted_only) urlParams.set("inverted_only", "true");
      if (params.cs_filter) urlParams.set("cs_filter", params.cs_filter);
      if (params.num_results) urlParams.set("num_results", String(params.num_results));
      if (params.group_id) urlParams.set("group_id", params.group_id);
      if (params.use_redis_cache === false) urlParams.set("use_redis_cache", "false");
      try {
        const resp = await fetch(`${graphitiBase}/search?${urlParams}`, { signal: AbortSignal.timeout(15_000) });
        const body = await resp.json() as { results: unknown[]; cache?: string };
        return {
          content: [{ type: "text", text: JSON.stringify(body.results, null, 2) }],
        };
      } catch (e) {
        return {
          content: [{ type: "text", text: `graphiti search failed: ${e}` }],
          isError: true,
        };
      }
    },
  });

  // ── Tool: aletheia_episodic_arc_open ─────────────────────────────
  api.registerTool({
    name: "aletheia_episodic_arc_open",
    label: "Aletheia Episodic Arc Open",
    description: "Open a named episode arc (Saga) in the episodic graph. Arcs group related episodes across time.",
    parameters: Type.Object({
      label: Type.String({ description: "Arc ID label e.g. 'graphiti-implementation-2026-04'" }),
      arc_type: Type.Union([
        Type.Literal("feature"),
        Type.Literal("investigation"),
        Type.Literal("identity"),
        Type.Literal("session"),
        Type.Literal("oracle"),
        Type.Literal("logos"),
        Type.Literal("alchemical"),
        Type.Literal("day"),
        Type.Literal("mobius"),
        Type.Literal("ad_hoc"),
      ]),
      opening_episode: Type.Optional(Type.String({ description: "Opening episode text" })),
      group_id: Type.Optional(Type.String()),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      try {
        const resp = await fetch("http://localhost:37778/arc/open", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ arc_id: params.label, arc_type: params.arc_type, opening_episode: params.opening_episode, group_id: params.group_id }),
          signal: AbortSignal.timeout(10_000),
        });
        const body = await resp.json() as { status: string; arc_id?: string };
        return {
          content: [{ type: "text", text: body.status === "ok" ? `arc opened: ${body.arc_id}` : JSON.stringify(body) }],
          isError: body.status !== "ok",
        };
      } catch (e) {
        return { content: [{ type: "text", text: `arc open failed: ${e}` }], isError: true };
      }
    },
  });

  // ── Tool: aletheia_episodic_arc_close ────────────────────────────
  api.registerTool({
    name: "aletheia_episodic_arc_close",
    label: "Aletheia Episodic Arc Close",
    description: "Close an episode arc with a crystallisation episode (integration insight).",
    parameters: Type.Object({
      arc_id: Type.String(),
      synthesis: Type.String({ description: "Crystallised insight to attach as closing episode" }),
      ql_close_position: Type.Optional(Type.String({ default: "5", description: "5 for rubedo close, 5' for implicate close" })),
      group_id: Type.Optional(Type.String()),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      try {
        const resp = await fetch("http://localhost:37778/arc/close", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ arc_id: params.arc_id, crystallisation_text: params.synthesis, ql_close_position: params.ql_close_position ?? "5", group_id: params.group_id }),
          signal: AbortSignal.timeout(10_000),
        });
        const body = await resp.json() as { status: string; arc_id?: string };
        return {
          content: [{ type: "text", text: body.status === "ok" ? `arc closed: ${body.arc_id}` : JSON.stringify(body) }],
          isError: body.status !== "ok",
        };
      } catch (e) {
        return { content: [{ type: "text", text: `arc close failed: ${e}` }], isError: true };
      }
    },
  });

  // ── Tool: aletheia_episodic_arc_status ───────────────────────────
  api.registerTool({
    name: "aletheia_episodic_arc_status",
    label: "Aletheia Episodic Arc Status",
    description: "Return all open arcs + episode counts from the episodic graph. Used by Janus (CF1) for temporal boundary tracking.",
    parameters: Type.Object({
      group_id: Type.Optional(Type.String()),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      try {
        const urlParams = params.group_id ? `?group_id=${params.group_id}` : "";
        const resp = await fetch(`http://localhost:37778/stats${urlParams}`, { signal: AbortSignal.timeout(10_000) });
        const body = await resp.json();
        return { content: [{ type: "text", text: JSON.stringify(body, null, 2) }] };
      } catch (e) {
        return { content: [{ type: "text", text: `arc status failed: ${e}` }], isError: true };
      }
    },
  });

  // ── Tool: aletheia_episodic_oracle_arc ───────────────────────────
  // Phase 5: Oracle cast → 4-face Saga
  api.registerTool({
    name: "aletheia_episodic_oracle_arc",
    label: "Aletheia Episodic Oracle Arc",
    description: "Record an oracle cast as a 4-face Saga in the episodic graph. " +
      "Arc ID: 'oracle:{cast_uuid}:{day}'. Episodes: 0' (implicate question), 2 (operation/hexagram), 3 (pattern/body zone), 5' (integration/reflection). " +
      "Call after epi nara oracle cast with the cast result.",
    parameters: Type.Object({
      cast_uuid: Type.String({ description: "UUID of the oracle cast" }),
      day_id: Type.String({ description: "Day identifier (DD-MM-YYYY)" }),
      question: Type.Optional(Type.String({ description: "The oracle question asked" })),
      hexagram: Type.Optional(Type.Integer({ minimum: 1, maximum: 64, description: "Hexagram number cast" })),
      decan: Type.Optional(Type.String({ description: "Sun decan at time of cast" })),
      // body_zones: array of strings
      body_zones: Type.Optional(Type.Array(Type.String(), { description: "Body zones from oracle resonance" })),
      // oracle_charges: open object (Quaternionic charges pp/nn/np/pn)
      oracle_charges: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
      reflection: Type.Optional(Type.String({ description: "Agent reflection on the cast" })),
      group_id: Type.Optional(Type.String()),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const graphitiBase = process.env.GRAPHITI_URL ?? "http://localhost:37778";
      const arcId = `oracle:${params.cast_uuid}:${params.day_id}`;
      const meta = { hexagram: params.hexagram, decan: params.decan, body_zones: params.body_zones, oracle_charges: params.oracle_charges };

      try {
        // Open oracle arc
        await fetch(`${graphitiBase}/arc/open`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ arc_id: arcId, arc_type: "oracle", ql_position: "ql0", cpf: "(0/1/2/3)", ct: 0, metadata: meta }),
          signal: AbortSignal.timeout(8000),
        });

        // Episode 0' — implicate question
        if (params.question) {
          await fetch(`${graphitiBase}/episode`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: params.question, ql_position: "0'", cpf: "(00/00)", cp: "4.2", arc_id: arcId, day_id: params.day_id }),
            signal: AbortSignal.timeout(8000),
          });
        }

        // Episode 2 — operation/hexagram
        if (params.hexagram) {
          await fetch(`${graphitiBase}/episode`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: `hexagram ${params.hexagram}: ${params.decan ?? ""}`.trim(), ql_position: "2", cpf: "(0/1/2)", cp: "4.2", arc_id: arcId, day_id: params.day_id, oracle_face: `hexagram_${params.hexagram}` }),
            signal: AbortSignal.timeout(8000),
          });
        }

        // Episode 3 — pattern/body zone
        if (params.body_zones?.length) {
          await fetch(`${graphitiBase}/episode`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: `body zones: ${params.body_zones.join(", ")}`, ql_position: "3", cpf: "(0/1/2/3)", cp: "4.3", arc_id: arcId, day_id: params.day_id }),
            signal: AbortSignal.timeout(8000),
          });
        }

        // Close arc with episode 5' — integration/reflection
        const synthesisText = params.reflection || `oracle cast ${params.cast_uuid} — ${params.hexagram ? `hexagram ${params.hexagram}` : "cast"} on ${params.day_id}`;
        await fetch(`${graphitiBase}/arc/close`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ arc_id: arcId, crystallisation_text: synthesisText, ql_close_position: "5'" }),
          signal: AbortSignal.timeout(8000),
        });

        return { content: [{ type: "text", text: `oracle arc recorded: ${arcId}` }] };
      } catch (e) {
        return { content: [{ type: "text", text: `oracle arc failed: ${e}` }], isError: true };
      }
    },
  });

  // ── Tool: aletheia_episodic_logos_stage ───────────────────────────
  // Phase 5: Logos cycle → 6-episode Saga (4.5.0–4.5.5)
  api.registerTool({
    name: "aletheia_episodic_logos_stage",
    label: "Aletheia Episodic Logos Stage",
    description: "Emit a Logos cycle stage episode to the episodic graph. " +
      "Logos arc 'logos:{day_id}' auto-opened on first stage. Stage 5 (An-a-Logos) closes both logos and day Sagas. " +
      "Stage positions: 0=A-Logos, 1=Dia-Logos, 2=An-Logos, 3=Epi-Logos, 4=Dia-a-Logos, 5=An-a-Logos.",
    parameters: Type.Object({
      stage: Type.Integer({ minimum: 0, maximum: 5, description: "Logos stage (0–5)" }),
      day_id: Type.String({ description: "Day identifier (DD-MM-YYYY)" }),
      content: Type.String({ description: "Stage content/insight" }),
      group_id: Type.Optional(Type.String()),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const graphitiBase = process.env.GRAPHITI_URL ?? "http://localhost:37778";
      const arcId = `logos:${params.day_id}`;
      const stageNames = ["A-Logos", "Dia-Logos", "An-Logos", "Epi-Logos", "Dia-a-Logos", "An-a-Logos"];
      const cpfMap = ["(00/00)", "(0/1)", "(0/1/2)", "(0/1/2/3)", "(4.0/1-4.4/5)", "(5/0)"];
      const qlPos = `4.5.${params.stage}`;

      try {
        // Auto-open arc on stage 0
        if (params.stage === 0) {
          await fetch(`${graphitiBase}/arc/open`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ arc_id: arcId, arc_type: "logos", ql_position: "ql0", cpf: "(00/00)", ct: 1, metadata: { day_id: params.day_id } }),
            signal: AbortSignal.timeout(8000),
          });
        }

        // Emit stage episode
        await fetch(`${graphitiBase}/episode`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: `[${stageNames[params.stage]}] ${params.content}`,
            ql_position: qlPos,
            cpf: cpfMap[params.stage],
            cp: "4.5",
            arc_id: arcId,
            day_id: params.day_id,
            source: "agent",
          }),
          signal: AbortSignal.timeout(8000),
        });

        // Stage 5 (An-a-Logos): close logos arc AND day arc
        if (params.stage === 5) {
          await fetch(`${graphitiBase}/arc/close`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ arc_id: arcId, crystallisation_text: params.content, ql_close_position: "5" }),
            signal: AbortSignal.timeout(8000),
          });
          const dayArcId = `day:${params.day_id}`;
          await fetch(`${graphitiBase}/arc/close`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ arc_id: dayArcId, crystallisation_text: params.content, ql_close_position: "5" }),
            signal: AbortSignal.timeout(8000),
          });
        }

        return { content: [{ type: "text", text: `logos stage ${params.stage} (${stageNames[params.stage]}) recorded in ${arcId}` }] };
      } catch (e) {
        return { content: [{ type: "text", text: `logos stage failed: ${e}` }], isError: true };
      }
    },
  });

  // ── Tool: aletheia_episodic_mobius_arc ───────────────────────────
  // Phase 6: Sophia Möbius return → mobius arc open/close
  api.registerTool({
    name: "aletheia_episodic_mobius_arc",
    label: "Aletheia Episodic Mobius Arc",
    description: "Open or close a Möbius return arc ('mobius:{date}:{hash_frag}'). " +
      "Called by Sophia (CF 5/0) when T5 readiness threshold is met. " +
      "The Möbius arc bridges the implicate return: closure of yesterday into the ground of tomorrow.",
    parameters: Type.Object({
      action: Type.Union([Type.Literal("open"), Type.Literal("close")]),
      date: Type.String({ description: "Date string (DD-MM-YYYY)" }),
      hash_frag: Type.Optional(Type.String({ description: "Short fragment of quintessence hash (first 6 chars)" })),
      content: Type.Optional(Type.String({ description: "Möbius synthesis text (required for close)" })),
      group_id: Type.Optional(Type.String()),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const graphitiBase = process.env.GRAPHITI_URL ?? "http://localhost:37778";
      const arcId = `mobius:${params.date}:${params.hash_frag ?? ""}`;

      try {
        if (params.action === "open") {
          const resp = await fetch(`${graphitiBase}/arc/open`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ arc_id: arcId, arc_type: "mobius", ql_position: "ql5", cpf: "(5/0)", ct: 1, metadata: { date: params.date } }),
            signal: AbortSignal.timeout(8000),
          });
          const body = await resp.json() as { status: string };
          return { content: [{ type: "text", text: body.status === "ok" ? `möbius arc opened: ${arcId}` : JSON.stringify(body) }] };
        } else {
          const resp = await fetch(`${graphitiBase}/arc/close`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ arc_id: arcId, crystallisation_text: params.content ?? "möbius return complete", ql_close_position: "0" }),
            signal: AbortSignal.timeout(8000),
          });
          const body = await resp.json() as { status: string };
          return { content: [{ type: "text", text: body.status === "ok" ? `möbius arc closed: ${arcId}` : JSON.stringify(body) }] };
        }
      } catch (e) {
        return { content: [{ type: "text", text: `möbius arc failed: ${e}` }], isError: true };
      }
    },
  });

  // ── Tool: aletheia_episodic_ingest_thoughts ──────────────────────
  // Phase 4: T-bucket ingestion — night' pass
  api.registerTool({
    name: "aletheia_episodic_ingest_thoughts",
    label: "Aletheia Episodic Ingest Thoughts",
    description: "Ingest T-bucket thought artifacts as typed QL episodes into the episodic graph (night' pass). " +
      "T0→ql0 (seed questions), T1→ql1 (traces), T2→ql2 (challenges), T3→ql3 (patterns), T4→ql4 (discoveries), T5→ql5 (insights). " +
      "T5 also checks Möbius readiness threshold.",
    parameters: Type.Object({
      buckets: Type.Optional(Type.Array(
        Type.Union([
          Type.Literal("T0"),
          Type.Literal("T1"),
          Type.Literal("T2"),
          Type.Literal("T3"),
          Type.Literal("T4"),
          Type.Literal("T5"),
        ]),
        { description: "Which T-buckets to ingest. Defaults to all (T0–T5)." }
      )),
      day_id: Type.Optional(Type.String({ description: "Day being processed (DD-MM-YYYY)" })),
      arc_id: Type.Optional(Type.String({ description: "Attach all episodes to this arc ID" })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const { readdirSync, readFileSync } = await import("node:fs");
      const graphitiBase = process.env.GRAPHITI_URL ?? "http://localhost:37778";
      const vaultRoot = defaultVaultRoot();
      const thoughtRoot = `${vaultRoot}/Pratibimba/Self/Thought`;
      const buckets = params.buckets ?? ["T0", "T1", "T2", "T3", "T4", "T5"];
      const qlMap: Record<string, string> = {
        T0: "ql0", T1: "ql1", T2: "ql2", T3: "ql3", T4: "ql4", T5: "ql5",
      };
      const cpfMap: Record<string, string> = {
        T0: "(00/00)", T1: "(0/1)", T2: "(0/1/2)", T3: "(0/1/2/3)", T4: "(4.0/1-4.4/5)", T5: "(5/0)",
      };

      const ingested: string[] = [];
      const failed: string[] = [];
      let t5Count = 0;

      for (const bucket of buckets) {
        const bucketDir = `${thoughtRoot}/${bucket}`;
        let files: string[] = [];
        try {
          files = readdirSync(bucketDir).filter((f: string) => f.endsWith(".md"));
        } catch {
          continue; // bucket dir doesn't exist yet
        }

        for (const file of files) {
          try {
            const content = readFileSync(`${bucketDir}/${file}`, "utf8");
            const resp = await fetch(`${graphitiBase}/episode`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                content,
                ql_position: qlMap[bucket],
                cpf: cpfMap[bucket],
                cp: "4.4",
                source: "agent",
                arc_id: params.arc_id,
                day_id: params.day_id,
                metadata: { thought_bucket: bucket, source_file: file },
              }),
              signal: AbortSignal.timeout(15_000),
            });
            const body = await resp.json() as { status: string };
            if (body.status === "ok") {
              ingested.push(`${bucket}/${file}`);
              if (bucket === "T5") t5Count++;
            } else {
              failed.push(`${bucket}/${file}`);
            }
          } catch (e) {
            failed.push(`${bucket}/${file}: ${e}`);
          }
        }
      }

      // T5 Möbius readiness check
      const mobiusReady = t5Count >= 3;
      const summary = [
        `Ingested ${ingested.length} thought episodes (${buckets.join(", ")})`,
        failed.length ? `Failed: ${failed.join(", ")}` : "",
        buckets.includes("T5") ? `T5 insights: ${t5Count} — Möbius readiness: ${mobiusReady ? "READY" : "not yet (need ≥3 T5 insights)"}` : "",
      ].filter(Boolean).join("\n");

      return { content: [{ type: "text", text: summary }], isError: ingested.length === 0 && failed.length > 0 };
    },
  });

  // ── Tool: aletheia_ingest ────────────────────────────────────────
  // C4 / Möbius seam TS handoff. Reads the Sophia disclosure JSONL written
  // by Khora's session_shutdown (C2), fuses it with optional Moirai outputs
  // (C3), and writes ONE epii_autoresearch_inbox_entry JSONL line to
  // ${EPILOGOS_VAULT}/Pratibimba/Epii/inbox/${session_id}.jsonl. That file
  // is the bridge surface consumed by Epii-autoresearch-core (C5/C6).
  api.registerTool({
    name: "aletheia_ingest",
    label: "Aletheia Ingest",
    description: "C4 Möbius seam TS handoff: ingest the Sophia session-end disclosure for the given session " +
      "and (optionally) the three Moirai summaries, compose the canonical " +
      "epii_autoresearch_inbox_entry payload, and append it as a JSONL line to " +
      "${EPILOGOS_VAULT}/Pratibimba/Epii/inbox/${session_id}.jsonl. That JSONL is what " +
      "Epii-autoresearch-core (C5 InboxStore / C6 recompose_pass) reads.",
    parameters: Type.Object({
      session_id: Type.String({ description: "Session whose Sophia disclosure to ingest" }),
      day_id: Type.String({ description: "Day identifier (DD-MM-YYYY)" }),
      moirai_outputs: Type.Optional(Type.Object({
        klotho: Type.Optional(Type.String({ description: "Klotho (traces) summary" })),
        lachesis: Type.Optional(Type.String({ description: "Lachesis (sources) summary" })),
        atropos: Type.Optional(Type.String({ description: "Atropos (insight) summary" })),
      })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const result = aletheiaIngestSophia({
        session_id: params.session_id,
        day_id: params.day_id,
        moirai_outputs: params.moirai_outputs ?? {},
      });
      if (!result.ok) {
        return {
          content: [{ type: "text", text: `aletheia_ingest failed: ${result.reason}` }],
          isError: true,
        };
      }
      // Compact response: do not echo the full final_vak — callers can read
      // the Epii inbox JSONL directly if they need the full payload.
      const compact = {
        kind: result.payload.kind,
        source: result.payload.source,
        session_id: result.payload.session_id,
        day_id: result.payload.day_id,
        path: result.path,
      };
      return {
        content: [{ type: "text", text: JSON.stringify(compact) }],
      };
    },
  });

  api.on("session_shutdown", async () => {
    // Sophia has already classified thinking/ → thoughts/ before this fires.
    // Aletheia routes thoughts/ → T-buckets via aletheia_thought_route.
    // HOT→COLD promotion happens during night' pass only.
  });

  (api.on as unknown as (event: string, handler: (event: { janus_envelope?: string }) => Promise<void>) => void)(
    "cron_evening",
    async (event: { janus_envelope?: string }) => {
      const envelope = event?.janus_envelope
        ? JSON.parse(event.janus_envelope)
        : null;
      const temporalEnvelope = buildTemporalContextEnvelope(envelope?.day_id, envelope?.session_ids ?? []);
      const threshold = adjustKairosThreshold(0.5, /guarded/i.test(temporalEnvelope.kairos) ? "guarded" : undefined);
      void threshold;

      if (envelope?.session_ids?.length) {
        const allIds: string[] = [...envelope.session_ids];
        if (envelope.child_session_map) {
          for (const children of Object.values(envelope.child_session_map) as string[][]) {
            allIds.push(...children);
          }
        }
        spawnSync("epi", [
          "agent", "run", "--tool", "aletheia_session_promote",
          "--session-ids", allIds.join(","),
          "--day-id", envelope.day_id,
        ], { encoding: "utf8" });
      }

      coordinateMobiusReturn(envelope?.day_id);
      maybeUpdateCoordinateMap({
        coordinatePath: `${process.cwd()}/Idea/Empty/COORDINATE-MAP.md`,
        insight: envelope?.mobius_insight,
        recommendation: envelope?.coordinate_recommendation,
      });

      // Phase 7: Build Graphiti communities nightly (fire-and-forget)
      const graphitiBase = process.env.GRAPHITI_URL ?? "http://localhost:37778";
      fetch(`${graphitiBase}/communities/build`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day_id: envelope?.day_id }),
        signal: AbortSignal.timeout(120_000),
      }).catch(() => {/* non-fatal if sidecar not running */});

      spawnSync("epi", ["gate", "cron", "status"], { encoding: "utf8" });
    },
  );
}
