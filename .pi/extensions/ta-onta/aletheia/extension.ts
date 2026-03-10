import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { spawnSync } from "node:child_process";

export async function aletheiaExtension(api: ExtensionAPI) {
  // ── Tool: aletheia_session_promote ───────────────────────────────
  api.registerTool({
    name: "aletheia_session_promote",
    description: "Promote high-signal observations from claude-mem (HOT tier) into Gnosis (3072-dim Neo4j). " +
      "Filters by observation type (decision/bugfix/feature/discovery) to skip low-signal reads. " +
      "Re-embeds at 3072-dim via epi techne gnosis ingest. Stores cross-ref in Redis.",
    inputSchema: {
      type: "object",
      properties: {
        session_ids: {
          type: "array",
          items: { type: "string" },
          description: "Session IDs to promote (include parent + all child_session_ids)",
        },
        day_id: { type: "string", description: "Day being promoted (DD-MM-YYYY)" },
        notebook: { type: "string", description: "Target Gnosis notebook" },
        promote_types: {
          type: "array",
          items: { type: "string", enum: ["decision", "bugfix", "feature", "discovery", "change"] },
          default: ["decision", "bugfix", "feature", "discovery"],
        },
      },
      required: ["session_ids"],
    },
    async handler(input: { session_ids: string[]; day_id?: string; notebook?: string; promote_types?: string[] }) {
      const types = input.promote_types ?? ["decision", "bugfix", "feature", "discovery"];
      const promoted: string[] = [];
      const failed: string[] = [];

      for (const sessionId of input.session_ids) {
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
          const content = [
            `# ${obs.title}`,
            obs.narrative ?? "",
            obs.facts ? `\nFacts:\n${obs.facts}` : "",
            obs.concepts ? `\nConcepts:\n${obs.concepts}` : "",
          ].join("\n").trim();

          const tmpPath = `${tmpDir}/${obs.id}.md`;
          writeFileSync(tmpPath, content);

          const args = ["techne", "gnosis", "ingest", tmpPath, "--source", `claude-mem:${obs.id}`];
          if (input.notebook) args.push("--notebook", input.notebook);
          if (input.day_id) args.push("--coordinate", `session:${input.day_id}`);
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
          writeFileSync(summaryPath, `# Session Summary\n${summaryText}`);
          const args = ["techne", "gnosis", "ingest", summaryPath, "--source", `claude-mem:summary:${sessionId}`];
          if (input.notebook) args.push("--notebook", input.notebook);
          spawnSync("epi", args, { encoding: "utf8", timeout: 60_000 });
        }
      }

      return {
        content: [{
          type: "text",
          text: `Promoted ${promoted.length} observations from ${input.session_ids.length} sessions.\n` +
            (failed.length ? `Failed: ${failed.join(", ")}` : "All succeeded."),
        }],
        isError: failed.length > 0 && promoted.length === 0,
      };
    },
  });

  // ── Tool: aletheia_gnosis_ingest ─────────────────────────────────
  api.registerTool({
    name: "aletheia_gnosis_ingest",
    description: "Ingest a document into Gnosis RAG pipeline (Docling parse → chunk → 3072-dim embed → Neo4j). Requires Docling Serve on port 5001.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Filesystem path to document" },
        notebook: { type: "string", description: "Target Gnosis notebook name" },
        coordinate: { type: "string", description: "Coordinate for RELATES_TO_COORDINATE edge" },
      },
      required: ["path"],
    },
    async handler(input: { path: string; notebook?: string; coordinate?: string }) {
      const args = ["techne", "gnosis", "ingest", input.path];
      if (input.notebook) args.push("--notebook", input.notebook);
      if (input.coordinate) args.push("--coordinate", input.coordinate);
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
    description: "Hybrid retrieval from Gnosis (vector + graph + Redis RRF fusion). Returns relevant chunks.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        notebook: { type: "string", description: "Notebook to query" },
        top_k: { type: "integer", default: 5 },
        coordinate: { type: "string", description: "Filter by coordinate context" },
      },
      required: ["query"],
    },
    async handler(input: { query: string; notebook?: string; top_k?: number; coordinate?: string }) {
      const args = ["techne", "gnosis", "query", input.query];
      if (input.notebook) args.push("--notebook", input.notebook);
      if (input.top_k) args.push("--top-k", String(input.top_k));
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
    description: "Create a Gnosis:Notebook (session-scoped or persistent family).",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        scope: { type: "string", enum: ["session", "persistent"], default: "session" },
        session_id: { type: "string" },
        family: { type: "string", description: "For persistent: C|P|L|S|T|M" },
      },
      required: ["name"],
    },
    async handler(input: { name: string; scope?: string; session_id?: string; family?: string }) {
      const args = ["techne", "gnosis", "notebook", "create", input.name];
      if (input.scope) args.push("--scope", input.scope);
      if (input.session_id) args.push("--session-id", input.session_id);
      if (input.family) args.push("--family", input.family);
      const result = spawnSync("epi", args, { encoding: "utf8" });
      return {
        content: [{ type: "text", text: result.stdout || result.stderr || `notebook create: ${input.name}` }],
        isError: result.status !== 0,
      };
    },
  });

  // ── Tool: aletheia_thought_route ─────────────────────────────────
  api.registerTool({
    name: "aletheia_thought_route",
    description: "Classify thought artifact and route to T{n} bucket in /Pratibimba/Self/Thought/. T0=questions, T1=traces, T2=challenges, T3=patterns, T4=discoveries, T5=insights.",
    inputSchema: {
      type: "object",
      properties: {
        content: { type: "string", description: "Thought content to archive" },
        position: { type: "integer", minimum: 0, maximum: 5, description: "T-bucket position (0-5)" },
        session_id: { type: "string" },
        source_coordinates: {
          type: "array",
          items: { type: "string" },
          description: "Bimba coordinate refs (e.g. ['M4-3','T3','S1'])",
        },
        now_path: { type: "string", description: "Source NOW folder path" },
      },
      required: ["content", "position"],
    },
    async handler(input: { content: string; position: number; session_id?: string; source_coordinates?: string[] }) {
      const args = ["vault", "thought-route", "--position", String(input.position), "--content", input.content];
      if (input.session_id) args.push("--session-id", input.session_id);
      if (input.source_coordinates?.length) {
        for (const coord of input.source_coordinates) {
          args.push("--coordinate", coord);
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
    description: "Distill patterns from T-bucket contents into Bimba canonical form.",
    inputSchema: {
      type: "object",
      properties: {
        source_bucket: { type: "string", enum: ["T0", "T1", "T2", "T3", "T4", "T5"] },
        target_coordinate: { type: "string", description: "Bimba coordinate to crystallise into" },
        day_id: { type: "string" },
      },
      required: ["source_bucket"],
    },
    async handler(input: { source_bucket: string; target_coordinate?: string; day_id?: string }) {
      const args = ["techne", "gnosis", "crystallise", "--bucket", input.source_bucket];
      if (input.target_coordinate) args.push("--coordinate", input.target_coordinate);
      if (input.day_id) args.push("--day", input.day_id);
      const result = spawnSync("epi", args, { encoding: "utf8", timeout: 120_000 });
      return {
        content: [{ type: "text", text: result.status !== 0
          ? `crystallise failed: ${result.stderr || result.stdout}`
          : (result.stdout || result.stderr) }],
        isError: result.status !== 0,
      };
    },
  });

  // ── Tool: aletheia_seed_refresh ──────────────────────────────────
  api.registerTool({
    name: "aletheia_seed_refresh",
    description: "Generate SEED.md morning-context package from evening crystallisation. Writes to /Idea/Empty/Present/SEED.md.",
    inputSchema: {
      type: "object",
      properties: {
        day_id: { type: "string", description: "Day being processed" },
        insights: { type: "array", items: { type: "string" }, description: "T5 insights to seed forward" },
        questions: { type: "array", items: { type: "string" }, description: "T0 questions to carry forward" },
      },
      required: ["day_id"],
    },
    async handler(input: { day_id: string; insights?: string[]; questions?: string[] }) {
      const insights = (input.insights || []).map(i => `- ${i}`).join("\n");
      const questions = (input.questions || []).map(q => `- ${q}`).join("\n");
      const seedContent = `---
coordinate: ""
c_4_artifact_role: "seed"
c_1_ct_type: "CT0"
c_3_ctx_frame: "00/00"
c_3_day_id: "${input.day_id}"
c_3_created_at: "${new Date().toISOString()}"
---

# SEED — ${input.day_id}

## #0 — Carried Forward (from yesterday's P5')
${insights || "<!-- No insights carried forward -->"}

## #0 — Questions for Today (from yesterday's P0')
${questions || "<!-- No questions carried forward -->"}
`;
      // Write SEED.md to vault via obsidian CLI (vault write routing law)
      const { writeFileSync, mkdirSync } = await import("node:fs");
      const tmpPath = `/tmp/aletheia-seed-${input.day_id}.md`;
      writeFileSync(tmpPath, seedContent);

      // Use obsidian CLI to write into vault — preserves wikilink integrity
      const write = spawnSync("obsidian", [
        "create", `path="Empty/Present/SEED.md"`, `--content-file=${tmpPath}`, "--overwrite",
      ], { encoding: "utf8" });
      if (write.status !== 0) {
        return {
          content: [{ type: "text", text: `seed_refresh: failed to write SEED.md: ${write.stderr}` }],
          isError: true,
        };
      }

      // Log continuation marker
      const contArgs = ["agent", "session", "continuation", "--summary", `SEED.md refreshed for ${input.day_id}`];
      spawnSync("epi", contArgs, { encoding: "utf8" });

      return {
        content: [{
          type: "text",
          text: `SEED.md written for ${input.day_id}\nInsights: ${input.insights?.length || 0}, Questions: ${input.questions?.length || 0}`,
        }],
      };
    },
  });

  // ── Hook: session_end ────────────────────────────────────────────
  if (api.hooks) {
    api.hooks.on?.("session_end", async (_event: { session_id?: string }) => {
      // Sophia has already classified thinking/ → thoughts/ before this fires.
      // Aletheia routes thoughts/ → T-buckets via aletheia_thought_route.
      // HOT→COLD promotion happens during night' pass only.
    });

    api.hooks.on?.("cron_evening", async (event: { janus_envelope?: string }) => {
      // Night' Möbius engine. gate/cron.rs IS wired.
      const envelope = event?.janus_envelope
        ? JSON.parse(event.janus_envelope)
        : null;

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

      spawnSync("epi", ["gate", "cron", "status"], { encoding: "utf8" });
    });
  }
}
