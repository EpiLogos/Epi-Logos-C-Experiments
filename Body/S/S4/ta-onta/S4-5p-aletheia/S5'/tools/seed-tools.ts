/**
 * Seed tools - Aletheia crystallisation, SEED refresh, and Epii bridge tools.
 *
 * @coordinate   S4-5'  |  Aletheia carrier / S5' tools
 * @residency    Body/S/S4/ta-onta/S4-5p-aletheia/S5'/tools/seed-tools.ts
 * @position     #5 - Epii integration / truth-disclosure
 * @actualises   Body/S/S4/ta-onta/S4-5p-aletheia/CONTRACT.md; [[S4-5'-SPEC]]
 *
 * Public surface:
 *   registerSeedTools(api) - registers crystallise, seed refresh, ingest, and Epii invoke tools.
 * Does NOT own:
 *   Hen vault sync, Epii autoresearch internals, or Anima dispatch implementation.
 *
 * @contract     Body/S/S4/ta-onta/S4-5p-aletheia/CONTRACT.md
 */
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { spawnSync } from "node:child_process";
import { buildTemplateInvocation, refreshTopology, validateHenSync } from "../../modules/hen-integration.ts";
import { aletheiaIngestSophia } from "../../modules/sophia-ingest.ts";
import { buildAnimaInvokePayload } from "../../../S4-4p-anima/modules/anima-invoke-payload.ts";
import { isValidVakAddress, type VakAddress } from "../../../shared/vak_address.ts";

function defaultVaultRoot() {
  return process.env.EPILOGOS_VAULT ?? `${process.env.HOME ?? "."}/Documents/Epi-Logos/Idea`;
}

export function registerSeedTools(api: ExtensionAPI) {
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

# SEED - ${params.day_id}

## #0 - Carried Forward (from yesterday's P5')
${insights || "<!-- No insights carried forward -->"}

## #0 - Questions for Today (from yesterday's P0')
${questions || "<!-- No questions carried forward -->"}
`;
      const { writeFileSync, mkdirSync } = await import("node:fs");
      const seedPath = `${defaultVaultRoot()}/Empty/Present/SEED.md`;
      mkdirSync(`${defaultVaultRoot()}/Empty/Present`, { recursive: true });
      writeFileSync(seedPath, seedContent);

      refreshTopology();

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

  api.registerTool({
    name: "aletheia_ingest",
    label: "Aletheia Ingest",
    description: "C4 Möbius seam TS handoff: ingest the Sophia session-end disclosure for the given session " +
      "and (optionally) the three Moirai summaries, compose the canonical " +
      "epii_autoresearch_inbox_entry payload, and append it as a JSONL line to " +
      "${EPILOGOS_VAULT}/Empty/Present/{day_id}/{session_id}.jsonl. That JSONL is what " +
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

  api.registerTool({
    name: "epii_invoke_anima",
    label: "Epii Invoke Anima",
    description:
      "Invoke an Anima session from Epii's autoresearch flow via the D2 gateway " +
      "endpoint (route_anima_invoke). Used when Epii's recompose pass surfaces a " +
      "question that needs Anima's full VAK evaluation. Closes the user's Concern 2 " +
      "(Epii <-> Anima bidirectional cross-invoke). Shares the canonical payload " +
      "builder with anima_self_invoke.",
    parameters: Type.Object({
      target_user: Type.String({ description: "Target user id (becomes agent:anima:<target_user>)" }),
      task: Type.String({ description: "Task to surface into the target Anima session" }),
      vak_address: Type.Optional(Type.Any()),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      let vak: VakAddress | undefined;
      if (params.vak_address) {
        vak = params.vak_address as VakAddress;
      } else if (process.env.EPI_SESSION_VAK_ADDRESS) {
        try {
          const parsed = JSON.parse(process.env.EPI_SESSION_VAK_ADDRESS);
          if (isValidVakAddress(parsed)) vak = parsed;
        } catch {
          // Malformed env - fall through to default.
        }
      }
      if (!vak) {
        vak = {
          cpf: "(4.0/1-4.4/5)",
          ct: ["CT5"],
          cp: "CP4.5",
          cf: "(5/0)",
          cfp: "CFP0",
          cs: { code: "CS0", direction: "Night'" },
        };
      }
      if (!isValidVakAddress(vak)) {
        return {
          content: [{ type: "text", text: `epii_invoke_anima refused: vak_address failed canonical validation` }],
          isError: true,
        };
      }

      const payload = buildAnimaInvokePayload({
        target_user: params.target_user,
        task: params.task,
        vak_address: vak,
      });

      const result = spawnSync(
        "epi",
        ["gate", "dispatch", "anima-invoke", "--payload-json", JSON.stringify(payload)],
        { encoding: "utf8" },
      );

      if (result.status !== 0) {
        return {
          content: [{
            type: "text",
            text: `gateway anima-invoke failed: ${result.stderr || "non-zero exit"}`,
          }],
          isError: true,
        };
      }

      let parsedResponse: { dispatched_to: string; task_queued: boolean } | undefined;
      try {
        parsedResponse = JSON.parse(result.stdout);
      } catch {
        return {
          content: [{
            type: "text",
            text: `gateway returned non-JSON: ${result.stdout}`,
          }],
          isError: true,
        };
      }

      return {
        content: [{
          type: "text",
          text: `Anima invoke dispatched: ${parsedResponse?.dispatched_to ?? "<unknown>"} (queued=${parsedResponse?.task_queued ?? false})`,
        }],
        details: { payload, response: parsedResponse },
      };
    },
  });
}
