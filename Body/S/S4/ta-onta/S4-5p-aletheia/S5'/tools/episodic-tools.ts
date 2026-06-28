/**
 * Episodic tools - Aletheia personal graph, arc, and Moirai arena registrations.
 *
 * @coordinate   S4-5'  |  Aletheia carrier / S5' tools
 * @residency    Body/S/S4/ta-onta/S4-5p-aletheia/S5'/tools/episodic-tools.ts
 * @position     #5 - Epii integration / truth-disclosure
 * @actualises   Body/S/S4/ta-onta/S4-5p-aletheia/CONTRACT.md; [[S4-5'-SPEC]]
 *
 * Public surface:
 *   registerEpisodicTools(api) - registers Moirai arena and episodic graph tools.
 * Does NOT own:
 *   Graphiti sidecar internals, Anima dispatch routing, or Chronos scheduling.
 *
 * @contract     Body/S/S4/ta-onta/S4-5p-aletheia/CONTRACT.md
 */
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { spawnSync } from "node:child_process";

function defaultVaultRoot() {
  return process.env.EPILOGOS_VAULT ?? `${process.env.HOME ?? "."}/Documents/Epi-Logos/Idea`;
}

function gnosticPythonPath() {
  const sourcePath = process.env.EPI_GNOSTIC_SOURCE_PATH ?? `${process.cwd()}/Body/S/S5/epi-gnostic`;
  const existing = process.env.PYTHONPATH;
  return existing ? `${sourcePath}:${existing}` : sourcePath;
}

export function registerEpisodicTools(api: ExtensionAPI) {
  api.registerTool({
    name: "moirai_arena_distill",
    label: "Moirai Arena Distill",
    description: "Closure-distill an arena scene to Graphiti episodes + classifier-modulated graph edges. Jungian amplification routed back to canon. Anima-dispatched at scene_close during Aletheia-crystallisation-mode.",
    parameters: Type.Object({
      scene_key: Type.String({ description: "ArenaScene scene_key closed by m4.arena.scene_close" }),
    }),
    async execute(_id: string, params: { scene_key: string }, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const python = process.env.EPI_ARENA_DISTILL_PYTHON
        ?? process.env.EPI_GNOSTIC_PYTHON
        ?? "python3";
      const result = spawnSync(
        python,
        ["-m", "epi_gnostic.arena_distillation", params.scene_key],
        {
          encoding: "utf8",
          timeout: 120_000,
          env: {
            ...process.env,
            PYTHONPATH: gnosticPythonPath(),
          },
        },
      );
      if (result.status !== 0) {
        return {
          content: [{
            type: "text",
            text: `moirai_arena_distill failed: ${result.stderr || result.stdout || "non-zero exit"}`,
          }],
          isError: true,
        };
      }
      let receipt: unknown;
      try {
        receipt = JSON.parse(result.stdout);
      } catch {
        return {
          content: [{ type: "text", text: `moirai_arena_distill returned non-JSON: ${result.stdout}` }],
          isError: true,
        };
      }
      return {
        content: [{ type: "text", text: JSON.stringify(receipt, null, 2) }],
        details: receipt,
      };
    },
  });

  api.registerTool({
    name: "aletheia_episodic_record",
    label: "Aletheia Episodic Record",
    description: "Record a QL-typed episode to the personal episodic graph at #4.4.4.4 (Pratibimba namespace). " +
      "Episodes carry full QL coordinate (position, cpf, cp), astrological stamp (auto from NOW cache), and optional arc attachment.",
    parameters: Type.Object({
      content: Type.String({ description: "Episode text content" }),
      ql_position: Type.String({ description: "QL position: 0-5, 0'-5', 4.2, 4.5.3, 4.0, etc." }),
      cpf: Type.String({ description: "Context frame: (00/00), (0/1), (0/1/2), (0/1/2/3), (4.0/1-4.4/5), (5/0), (4.5/0)" }),
      cp: Type.String({ description: "Positional address e.g. 4.2 or 4.5.0" }),
      source: Type.Optional(Type.Union([Type.Literal("agent"), Type.Literal("user"), Type.Literal("gateway")], { default: "agent" })),
      arc_id: Type.Optional(Type.String({ description: "Attach to open arc (optional)" })),
      arc_type: Type.Optional(Type.String({ description: "Arc type if arc_id provided" })),
      day_id: Type.Optional(Type.String()),
      tick12: Type.Optional(Type.Integer({ minimum: 0, maximum: 11, description: "Spanda position" })),
      group_id: Type.Optional(Type.String({ description: "Quintessence hash - defaults to active identity hash" })),
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
      tick12_filter: Type.Optional(Type.Integer({ minimum: 0, maximum: 11, description: "Spanda position filter - surfaces episodes from same tick12 across prior sessions" })),
      inverted_only: Type.Optional(Type.Boolean({ description: "Return only inverted (primed) episodes - used by Sophia night' pass" })),
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
      body_zones: Type.Optional(Type.Array(Type.String(), { description: "Body zones from oracle resonance" })),
      oracle_charges: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
      reflection: Type.Optional(Type.String({ description: "Agent reflection on the cast" })),
      group_id: Type.Optional(Type.String()),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const graphitiBase = process.env.GRAPHITI_URL ?? "http://localhost:37778";
      const arcId = `oracle:${params.cast_uuid}:${params.day_id}`;
      const meta = { hexagram: params.hexagram, decan: params.decan, body_zones: params.body_zones, oracle_charges: params.oracle_charges };

      try {
        await fetch(`${graphitiBase}/arc/open`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ arc_id: arcId, arc_type: "oracle", ql_position: "ql0", cpf: "(0/1/2/3)", ct: 0, metadata: meta }),
          signal: AbortSignal.timeout(8000),
        });

        if (params.question) {
          await fetch(`${graphitiBase}/episode`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: params.question, ql_position: "0'", cpf: "(00/00)", cp: "4.2", arc_id: arcId, day_id: params.day_id }),
            signal: AbortSignal.timeout(8000),
          });
        }

        if (params.hexagram) {
          await fetch(`${graphitiBase}/episode`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: `hexagram ${params.hexagram}: ${params.decan ?? ""}`.trim(), ql_position: "2", cpf: "(0/1/2)", cp: "4.2", arc_id: arcId, day_id: params.day_id, oracle_face: `hexagram_${params.hexagram}` }),
            signal: AbortSignal.timeout(8000),
          });
        }

        if (params.body_zones?.length) {
          await fetch(`${graphitiBase}/episode`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: `body zones: ${params.body_zones.join(", ")}`, ql_position: "3", cpf: "(0/1/2/3)", cp: "4.3", arc_id: arcId, day_id: params.day_id }),
            signal: AbortSignal.timeout(8000),
          });
        }

        const synthesisText = params.reflection || `oracle cast ${params.cast_uuid} - ${params.hexagram ? `hexagram ${params.hexagram}` : "cast"} on ${params.day_id}`;
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

  api.registerTool({
    name: "aletheia_episodic_logos_stage",
    label: "Aletheia Episodic Logos Stage",
    description: "Emit a Logos cycle stage episode to the episodic graph. " +
      "Logos arc 'logos:{day_id}' auto-opened on first stage. Stage 5 (An-a-Logos) closes both logos and day Sagas. " +
      "Stage positions: 0=A-Logos, 1=Dia-Logos, 2=An-Logos, 3=Epi-Logos, 4=Dia-a-Logos, 5=An-a-Logos.",
    parameters: Type.Object({
      stage: Type.Integer({ minimum: 0, maximum: 5, description: "Logos stage (0-5)" }),
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
        if (params.stage === 0) {
          await fetch(`${graphitiBase}/arc/open`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ arc_id: arcId, arc_type: "logos", ql_position: "ql0", cpf: "(00/00)", ct: 1, metadata: { day_id: params.day_id } }),
            signal: AbortSignal.timeout(8000),
          });
        }

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

  api.registerTool({
    name: "aletheia_episodic_ingest_thoughts",
    label: "Aletheia Episodic Ingest Thoughts",
    description: "Ingest T-bucket thought artifacts as typed QL episodes into the episodic graph (night' pass). " +
      "T0->ql0 (seed questions), T1->ql1 (traces), T2->ql2 (challenges), T3->ql3 (patterns), T4->ql4 (discoveries), T5->ql5 (insights). " +
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
        { description: "Which T-buckets to ingest. Defaults to all (T0-T5)." }
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
          continue;
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

      const mobiusReady = t5Count >= 3;
      const summary = [
        `Ingested ${ingested.length} thought episodes (${buckets.join(", ")})`,
        failed.length ? `Failed: ${failed.join(", ")}` : "",
        buckets.includes("T5") ? `T5 insights: ${t5Count} - Möbius readiness: ${mobiusReady ? "READY" : "not yet (need >=3 T5 insights)"}` : "",
      ].filter(Boolean).join("\n");

      return { content: [{ type: "text", text: summary }], isError: ingested.length === 0 && failed.length > 0 };
    },
  });
}
