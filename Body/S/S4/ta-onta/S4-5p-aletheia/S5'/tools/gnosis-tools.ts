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
import {
  parseResonance72,
  conditionQuestionOnResonance72,
  type Resonance72Projection,
} from "../../modules/resonance72-retrieval.ts";

/**
 * 12.T12.13 clause (c): read the live 72-fold address off the kernel profile.
 *
 * `epi profile show` is the existing S0 surface for the current
 * `MathemeHarmonicProfile`; this is the same `spawnSync("epi", ...)` idiom every
 * tool in this file already uses. A failed spawn, non-zero exit, or unparseable
 * payload yields `null` and the retrieval goes out unconditioned — the address
 * is a kernel derivation, never something this layer may guess.
 */
function readLiveResonance72(): Resonance72Projection | null {
  const probe = spawnSync("epi", ["profile", "show"], { encoding: "utf8", timeout: 10_000 });
  if (probe.status !== 0 || !probe.stdout) return null;
  try {
    return parseResonance72(JSON.parse(probe.stdout));
  } catch {
    return null;
  }
}

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
      // 12.T12.13 finding D3: this pushed `--notebook` at a CLI arm that did not
      // accept the flag, so clap refused the invocation and the ingest FAILED
      // whenever it was set. The arm accepts it now and records the document
      // against the notebook registry — an association, not retrieval scoping.
      notebook: Type.Optional(Type.String({ description: "Record the document against this Gnosis notebook" })),
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
    description:
      "Retrieval from Gnosis. Without `notebook`: hybrid RAG over the LightRAG/Neo4j gnostic store " +
      "(vector + graph + RRF). With `notebook`: scoped retrieval over that notebook's source pool in " +
      "the local gnosis store — where session pools written by nous_disclose live.",
    parameters: Type.Object({
      query: Type.String(),
      // 12.T12.13 finding D3, CORRECTED 2026-08-01.
      //
      // `notebook` was declared here and dropped on the floor. The first fix
      // REMOVED it on the false premise that "notebooks are a registry, not a
      // retrieval partition". That was wrong: notebooks are runtime SOURCE
      // POOLS, session-rooted, operated via psyche -> nous. `nous_disclose`
      // creates `khora-session-<session_id>` and ingests the curated context
      // package into it (`--source-type SessionContext`), and `query_local`
      // filters retrieval by notebook (`SourceSelection.notebook`,
      // `GnosisQueryHit.notebook`). Retrieval over a notebook is very much a
      // thing — it is THE thing session pools exist for.
      //
      // What is true is narrower: the two stores are not the same store.
      // Notebook scoping is implemented in the LOCAL gnosis store, and is not
      // wired through the LightRAG/Neo4j path that `query-gnostic` uses. So a
      // notebook query routes to the store that actually implements it.
      notebook: Type.Optional(
        Type.String({ description: "Scope retrieval to this notebook's source pool (local gnosis store)" }),
      ),
      top_k: Type.Optional(
        Type.Integer({ description: "Bound how many retrieved items the mode considers", minimum: 1 }),
      ),
      coordinate: Type.Optional(Type.String({ description: "Filter by coordinate context" })),
      // 12.T12.13 clause (c): condition retrieval on the live 72-fold harmonic
      // address. Defaults ON so the seam is live rather than opt-in-and-unused,
      // which is precisely how resonance72 came to have a producer and no
      // consumer in the first place.
      resonance72: Type.Optional(
        Type.Boolean({
          default: true,
          description: "Condition retrieval on the live MathemeHarmonicProfile.resonance72 address",
        }),
      ),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const coordinateScoped = params.coordinate
        ? `${params.query} [coordinate context: ${params.coordinate}]`
        : params.query;
      const projection = params.resonance72 === false ? null : readLiveResonance72();
      const question = conditionQuestionOnResonance72(coordinateScoped, projection);

      // A notebook names a source pool in the LOCAL gnosis store, so route
      // there — that is the store whose retrieval actually filters by notebook.
      // Sending it to `query-gnostic` would search a corpus the notebook does
      // not partition, which is how the parameter came to do nothing.
      const args = params.notebook
        ? ["techne", "gnosis", "query", question, "--notebook", String(params.notebook)]
        : ["techne", "gnosis", "query-gnostic", question, "--mode", "hybrid"];
      // 12.T12.13 finding D3: `top_k` is carried on both routes — LightRAG's
      // QueryParam on the gnostic path, the local scorer's bound on the other —
      // instead of being declared and discarded.
      if (params.top_k !== undefined && params.top_k !== null) {
        args.push("--top-k", String(params.top_k));
      }
      const result = spawnSync("epi", args, { encoding: "utf8", timeout: 30_000 });
      if (result.status !== 0) {
        return {
          // pi requires a details payload; this tool returns none.
          details: undefined,
          content: [{ type: "text", text: `gnosis query failed: ${result.stderr || result.stdout}` }],
          isError: true,
        };
      }
      // Say plainly whether the address reached the retrieval. An unconditioned
      // run is honest; an unconditioned run reported as conditioned is not.
      const provenance = projection
        ? `[resonance72 applied: anchor ${projection.lensAnchorIndex}/72]`
        : `[resonance72 not applied: no live address]`;
      return {
        // pi requires a details payload; this tool returns none.
        details: undefined,
        content: [{ type: "text", text: `${result.stdout || result.stderr}\n${provenance}` }],
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
