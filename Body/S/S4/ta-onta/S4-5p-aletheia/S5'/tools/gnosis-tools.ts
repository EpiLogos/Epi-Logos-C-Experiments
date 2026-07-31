/**
 * Gnosis tools - Aletheia RAG and notebook tool registrations.
 *
 * @coordinate   S4-5'  |  Aletheia carrier / S5' tools
 * @residency    Body/S/S4/ta-onta/S4-5p-aletheia/S5'/tools/gnosis-tools.ts
 * @position     #5 - Epii integration / truth-disclosure
 * @actualises   Body/S/S4/ta-onta/S4-5p-aletheia/CONTRACT.md; [[S4-5'-SPEC]]
 *
 * Public surface:
 *   registerGnosisTools(api) - registers gnosis ingest/query/notebook/enrich/status.
 * Does NOT own:
 *   Gnosis storage engines, agent dispatch routing, or vault writes.
 *
 * @contract     Body/S/S4/ta-onta/S4-5p-aletheia/CONTRACT.md
 */
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { spawnSync } from "node:child_process";

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

export function registerGnosisTools(api: ExtensionAPI) {
  api.registerTool({
    name: "aletheia_gnosis_ingest",
    label: "Aletheia Gnosis Ingest",
    description: "Ingest a document into the Gnosis RAG pipeline (RAG-Anything/LightRAG/MinerU-oriented parse -> chunk -> 3072-dim embed -> Neo4j).",
    parameters: Type.Object({
      path: Type.String({ description: "Filesystem path to document" }),
      notebook: Type.Optional(Type.String({ description: "Target Gnosis notebook name" })),
      // 12.T12.13: the edge the ingest path actually mints is MAPS_TO_COORDINATE
      // (CoordinateEnricher.assign_direct, run over the ingested nodes whenever a
      // coordinate is supplied). RELATES_TO_COORDINATE is prose only.
      coordinate: Type.Optional(Type.String({ description: "Coordinate for the MAPS_TO_COORDINATE edge" })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const args = ["techne", "gnosis", "ingest-gnostic", params.path];
      if (params.coordinate) args.push("--coordinate", params.coordinate);
      if (params.notebook) args.push("--notebook", params.notebook);
      const result = spawnSync("epi", args, { encoding: "utf8", timeout: 120_000 });
      if (result.status !== 0) {
        return {
          // pi requires a details payload; this tool returns none.
          details: undefined,
          content: [{ type: "text", text: `gnosis ingest failed: ${result.stderr || result.stdout}` }],
          isError: true,
        };
      }
      return {
        // pi requires a details payload; this tool returns none.
        details: undefined,
        content: [{ type: "text", text: result.stdout || result.stderr }],
      };
    },
  });

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
      const question = params.coordinate
        ? `${params.query} [coordinate context: ${params.coordinate}]`
        : params.query;
      const args = ["techne", "gnosis", "query-gnostic", question, "--mode", "hybrid"];
      const result = spawnSync("epi", args, { encoding: "utf8", timeout: 30_000 });
      if (result.status !== 0) {
        return {
          // pi requires a details payload; this tool returns none.
          details: undefined,
          content: [{ type: "text", text: `gnosis query failed: ${result.stderr || result.stdout}` }],
          isError: true,
        };
      }
      return {
        // pi requires a details payload; this tool returns none.
        details: undefined,
        content: [{ type: "text", text: result.stdout || result.stderr }],
      };
    },
  });

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
      const args = ["techne", "gnosis", "notebook", "create", notebookName];
      const result = spawnSync("epi", args, { encoding: "utf8" });
      return {
        // pi requires a details payload; this tool returns none.
        details: undefined,
        content: [{ type: "text", text: result.stdout || result.stderr || `notebook create: ${notebookName}` }],
        isError: result.status !== 0,
      };
    },
  });

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
        // pi requires a details payload; this tool returns none.
        details: undefined,
        content: [{ type: "text", text: result.stdout || result.stderr || "enriched" }],
        isError: result.status !== 0,
      };
    },
  });

  api.registerTool({
    name: "aletheia_gnosis_status",
    label: "Aletheia Gnosis Status",
    description: "Report status of both Gnosis tiers: local JSON store and Neo4j LightRAG namespace.",
    parameters: Type.Object({}),
    async execute(_id: string, _params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const result = spawnSync("epi", ["techne", "gnosis", "status"], { encoding: "utf8", timeout: 15_000 });
      return {
        // pi requires a details payload; this tool returns none.
        details: undefined,
        content: [{ type: "text", text: result.stdout || result.stderr || "status unavailable" }],
        isError: result.status !== 0,
      };
    },
  });
}
