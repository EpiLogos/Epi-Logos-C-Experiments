/**
 * Thought tools - Aletheia T-bucket routing and session-promotion registrations.
 *
 * @coordinate   S4-5'  |  Aletheia carrier / S5' tools
 * @residency    Body/S/S4/ta-onta/S4-5p-aletheia/S5'/tools/thought-tools.ts
 * @position     #5 - Epii integration / truth-disclosure
 * @actualises   Body/S/S4/ta-onta/S4-5p-aletheia/CONTRACT.md; [[S4-5'-SPEC]]
 *
 * Public surface:
 *   registerThoughtTools(api) - registers session promotion and thought-route tools.
 * Does NOT own:
 *   Hen vault CRUD, Gnosis storage engines, or the Rust thought frontmatter renderer.
 *
 * @contract     Body/S/S4/ta-onta/S4-5p-aletheia/CONTRACT.md
 */
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { spawnSync } from "node:child_process";
import { buildQProposalGraphitiEpisode } from "../../modules/q-proposal-candidate.ts";
import {
  buildTranscriptPromotionEpisode,
  readGatewayTranscript,
  summariseTranscript,
} from "../../modules/transcript-summariser.ts";
import { isValidVakAddress } from "../../../shared/vak_address.ts";
import type { QProposal } from "../../../S4-4p-anima/modules/sophia-hook.ts";

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

export function registerThoughtTools(api: ExtensionAPI) {
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
      q_proposals: Type.Optional(Type.Array(Type.Object({
        target_coordinate: Type.String(),
        q_key: Type.String(),
        q_value_candidate: Type.String(),
        qm_witness_session: Type.String(),
        qm_witness_vak: Type.Any(),
        qm_witness_agent: Type.String(),
        rationale: Type.String(),
        opens_questions: Type.Array(Type.String()),
        source_artifacts: Type.Array(Type.String()),
      }), { description: "Sophia/pair-development q_ proposal candidates to promote as Graphiti candidate episodes." })),
      group_id: Type.Optional(Type.String({ description: "Graphiti group_id filter for q_proposal candidate episodes." })),
      transcript_paths: Type.Optional(Type.Record(Type.String(), Type.String(), {
        description: "42.9: per-session paths to the gateway's harness-neutral transcript jsonl " +
          "({gate_state_root}/transcripts/{slug}.jsonl). When present, the session is promoted " +
          "from the transcript (one reader, all harnesses); claude-mem stays an optional HOT-tier source.",
      })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const types = params.promote_types ?? ["decision", "bugfix", "feature", "discovery"];
      const qProposals = (params.q_proposals ?? []) as QProposal[];
      const promoted: string[] = [];
      const failed: string[] = [];

      for (const sessionId of params.session_ids) {
        for (const proposal of qProposals) {
          let episode;
          try {
            episode = buildQProposalGraphitiEpisode({
              proposal,
              sessionId,
              dayId: params.day_id,
              proposedAt: new Date().toISOString(),
              groupId: params.group_id,
            });
          } catch (e) {
            failed.push(`${proposal.q_key}: ${e}`);
            continue;
          }
          try {
            const graphitiBase = process.env.GRAPHITI_URL ?? "http://localhost:37778";
            const resp = await fetch(`${graphitiBase}/episode`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(episode),
              signal: AbortSignal.timeout(10_000),
            });
            if (!resp.ok) {
              failed.push(`${proposal.q_key}: graphiti candidate episode rejected (${resp.status})`);
              continue;
            }
            spawnSync("epi", [
              "core", "cache", "set",
              `qm-proposal:${sessionId}:${proposal.target_coordinate}:${proposal.q_key}`,
              JSON.stringify({
                promoted_ref: `graphiti:candidate:${sessionId}`,
                qm_proposed_at: episode.qm_proposed_at,
              }),
              "--ttl", "2592000",
            ], { encoding: "utf8" });
            promoted.push(`q_proposal:${proposal.target_coordinate}:${proposal.q_key}`);
          } catch (e) {
            failed.push(`${proposal.q_key}: graphiti sidecar unreachable (${e})`);
          }
        }

        // 42.9: promote from the harness-neutral gateway transcript when a
        // path is supplied — the one reader/one summariser path, harness-blind.
        const transcriptPath = (params.transcript_paths ?? {})[sessionId];
        if (transcriptPath) {
          try {
            const entries = readGatewayTranscript(transcriptPath);
            const summary = summariseTranscript({
              entries,
              sessionKey: sessionId,
              dayId: params.day_id ?? "",
            });
            const graphitiBase = process.env.GRAPHITI_URL ?? "http://localhost:37778";
            const resp = await fetch(`${graphitiBase}/episode`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(buildTranscriptPromotionEpisode(summary)),
              signal: AbortSignal.timeout(10_000),
            });
            if (resp.ok) {
              promoted.push(`transcript:${sessionId}:${summary.group_id}`);
            } else {
              failed.push(`${sessionId}: transcript episode rejected (${resp.status})`);
            }
          } catch (e) {
            failed.push(`${sessionId}: transcript promotion failed (${e})`);
          }
        }

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
        // pi requires a details payload; this tool returns none.
        details: undefined,
        content: [{
          type: "text",
          text: `Promoted ${promoted.length} observations from ${params.session_ids.length} sessions.\n` +
            (failed.length ? `Failed: ${failed.join(", ")}` : "All succeeded."),
        }],
        isError: failed.length > 0 && promoted.length === 0,
      };
    },
  });

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
      const args = ["vault", "thought-route", "--position", String(params.position), "--content", params.content];
      if (params.session_id) args.push("--session-id", params.session_id);
      if (params.source_coordinates?.length) {
        for (const coord of params.source_coordinates) {
          args.push("--coordinate", coord);
        }
      }
      const summary = (typeof params.summary === "string" && params.summary.length > 0)
        ? params.summary
        : (typeof params.content === "string" ? params.content.split("\n")[0]?.slice(0, 200) ?? "" : "");
      if (summary) {
        args.push("--summary", summary);
      }
      const vakJson = process.env.EPI_SESSION_VAK_ADDRESS;
      if (vakJson) {
        try {
          const parsed = JSON.parse(vakJson);
          if (isValidVakAddress(parsed)) {
            args.push("--vak-address-json", vakJson);
          }
        } catch {
          // Malformed env - omit the flag (dialogical pass-through).
        }
      }
      const result = spawnSync("epi", args, { encoding: "utf8" });
      if (result.status !== 0) {
        return {
          // pi requires a details payload; this tool returns none.
          details: undefined, content: [{ type: "text", text: `thought-route failed: ${result.stderr}` }], isError: true };
      }
      return {
        // pi requires a details payload; this tool returns none.
        details: undefined, content: [{ type: "text", text: result.stdout }] };
    },
  });
}
