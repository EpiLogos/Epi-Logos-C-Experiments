// 17.10 — the six-tool dispatch family extracted from tools.ts (per
// S4-ARCHITECTURE §5 finding 2): anima_orchestrate, anima_arena_orchestrate,
// dispatch_parallel_agents, dispatch_fusion_agents, dispatch_moirai_night_pass,
// anima_self_invoke, plus the arena runtime/Mercurius helpers they own.
// Registration order is preserved; tools.ts remains the aggregator.

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import {
  validateParallelDispatch,
  validateFusionDispatch,
  dispatchGuardrails,
  CANONICAL_TRIGGERS,
  safeParseVak,
  MOIRAI_HOST_CF,
  agentForCf,
} from "../modules/dispatch-validate.ts";
import { nousRouteStop } from "../modules/nous-clearing.ts";
import {
  planMoiraiNightPass,
  classifyMoiraiOutput,
  buildMoiraiVak,
  defaultM5CoordinateClusters,
} from "../modules/moirai-dispatch.ts";
import { buildAnimaInvokePayload } from "../modules/anima-invoke-payload.ts";
import {
  applyAeonGraduationToForm,
  buildAeonGraduationRecord,
  type AeonGraduationInput,
} from "../../S4-5p-aletheia/modules/aeon-graduation.ts";
import { isValidVakAddress, type VakAddress } from "../../shared/vak_address.ts";
import { suggestedSkillsForVak, validCfCodes } from "./capabilities.ts";
import { dispatchTeamMember } from "./dispatch.ts";
import {
  ArenaOrchestrationRefused,
  loadArenaClassifierConfigFromHome,
  orchestrateArenaScene,
  subscribeMercuriusKairosDelta,
  type ArenaKairosRoutingState,
  type ArenaRuntimeAdapter,
  type MercuriusSubscriptionSource,
} from "../lib/arena-orchestrator.ts";

const arenaKairosStates = new Map<string, ArenaKairosRoutingState>();
const arenaMercuriusSubscriptions = new Map<string, () => void>();

export function registerAnimaDispatchTools(api: ExtensionAPI) {
  api.registerTool({
    name: "anima_orchestrate",
    label: "Anima Orchestrate",
    description:
      "CF code -> constitutional agent routing decision. Maps CF code to the correct constitutional agent (Psyche/Sophia/Nous/Eros/Logos/Mythos).",
    parameters: Type.Object({
      cf_code: Type.Union([
        Type.Literal("(0/1)"),
        Type.Literal("(0/1/2)"),
        Type.Literal("(0/1/2/3)"),
        Type.Literal("(4.0/1-4.4/5)"),
        Type.Literal("(4.5/0)"),
        Type.Literal("(5/0)"),
        Type.Literal("(00/00)"),
      ]),
      task: Type.String(),
      // Optional full VAK address — when present, the pleroma capability matrix
      // is consulted via `findSkillsForVak` to surface auto-loadable skills for
      // the dispatch plan. Validated structurally; opaque to TypeBox.
      vak_address: Type.Optional(Type.Any()),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      // Resolve suggested_skills via matrix query when a full VAK is provided.
      // Falls back to undefined when vak_address is absent / malformed / matrix
      // is unavailable — orchestration is matrix-advisory, never matrix-gated.
      const suggestedSkills = suggestedSkillsForVak(params.vak_address);
      const skillsLine = suggestedSkills
        ? `\nsuggested_skills: ${suggestedSkills.length ? suggestedSkills.join(", ") : "(none match this VAK)"}`
        : "";

      // Nous owns the clearing / dispatch-halt condition for CF ground (00/00).
      const clearing = nousRouteStop({ cf: params.cf_code, cpf: params.cf_code });
      if (clearing.action === "halt") {
        return {
          content: [
            {
              type: "text",
              text:
                `CF (00/00) — CO-ACTION GATE: This task requires collaborative brainstorming with the user before autonomous execution.\n` +
                `Task: ${params.task}\n` +
                "Agent: nous\n" +
                "ACTION REQUIRED: Present the task to the user and brainstorm approach before dispatching." +
                skillsLine,
            },
          ],
          details: { agent: "nous", co_action_gate: true, suggested_skills: suggestedSkills },
        };
      }

      const agent = agentForCf(params.cf_code);
      if (!agent) {
        return {
          content: [
            {
              type: "text",
              text: `unknown CF code: ${params.cf_code} — valid codes: ${validCfCodes.join(", ")}`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [{
          type: "text",
          text: `CF ${params.cf_code} -> agent: ${agent}\ntask: ${params.task}${skillsLine}`,
        }],
        details: { agent, suggested_skills: suggestedSkills },
      };
    },
  });

  api.registerTool({
    name: "anima_arena_orchestrate",
    label: "Anima Arena Orchestrate",
    description:
      "Orchestrate classifier-aware turn routing within an active arena scene. CPF (00/00) gated at scene-setup; CPF (0/1/2) Trika operational during turn loop.",
    parameters: Type.Object({
      scene_key: Type.String({ description: "ArenaScene scene_key, usually arena:{arc_id}" }),
      intent: Type.Optional(Type.String({ description: "Optional turn intent passed into the speaker dispatch plan" })),
      user_input_pending: Type.Optional(Type.Boolean({ default: false })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, ctx?: unknown) {
      const adapter = resolveArenaRuntimeAdapter(ctx);
      if (!adapter) {
        return {
          content: [{
            type: "text",
            text:
              "anima_arena_orchestrate refused: no arena runtime adapter was supplied in tool context. " +
              "Expected ctx.arena or ctx.arena_orchestrator.adapter implementing the ArenaRuntimeAdapter contract.",
          }],
          isError: true,
        };
      }

      try {
        const subscribedAdapter = await bindMercuriusKairosState(ctx, params.scene_key, adapter);
        const config = await loadArenaClassifierConfigFromHome();
        const receipt = await orchestrateArenaScene(
          {
            scene_key: params.scene_key,
            intent: params.intent,
            user_input_pending: params.user_input_pending ?? false,
          },
          { adapter: subscribedAdapter, config },
        );
        return {
          content: [{
            type: "text",
            text:
              `anima_arena_orchestrate: routed ${receipt.observability_event.speaker_kind}` +
              `${receipt.observability_event.speaker_handle ? `:${receipt.observability_event.speaker_handle}` : ""}` +
              ` for ${params.scene_key} via ${receipt.routing.reason}`,
          }],
          details: receipt,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [{ type: "text", text: `anima_arena_orchestrate refused: ${message}` }],
          isError: true,
          details: err instanceof ArenaOrchestrationRefused ? { code: err.code, scene_key: err.scene_key } : undefined,
        };
      }
    },
  });

  api.registerTool({
    name: "dispatch_parallel_agents",
    label: "Dispatch Parallel Agents",
    description: "CFP1 P-Thread dispatch for independent tasks routed to agents in parallel.",
    parameters: Type.Object({
      tasks: Type.Array(Type.Object({
        task: Type.String(),
        agent_name: Type.String(),
        // vak_address opaque to TypeBox — validator is source of truth so error messages
        // are domain-friendly rather than schema-shaped. Required per A5: no fire without address.
        vak_address: Type.Optional(Type.Any()),
        // Optional risk score (0..1) for gate guardrail evaluation. Default 0
        // preserves the pre-D5 surface (existing callers unaffected; only
        // collab-gate consumes risk and only when cpf is dialogical).
        risk: Type.Optional(Type.Number()),
      })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      // Validate every task carries CFP1 + valid VAK before any subprocess fires.
      // One bad address aborts the whole CFP1 fan-out (refusing partial-state writes
      // upholds the address-causality invariant; A6 binds CFP1 across every task).
      const tasks = params.tasks as Array<{ task: string; agent_name: string; vak_address?: VakAddress; risk?: number }>;
      const parallel = validateParallelDispatch({
        tasks: tasks.map((t) => ({
          agent_name: t.agent_name,
          task: t.task,
          vak_address: t.vak_address,
        })),
      });
      if (!parallel.ok) {
        return {
          content: [{ type: "text", text: `dispatch_parallel_agents refused: ${parallel.error}` }],
          isError: true,
        };
      }
      // Per-task gate guardrails (D5). Same dialectic as A5's per-entry
      // mechanistic validation: each task is independently gated against
      // CANONICAL_TRIGGERS. A single blocking gate on any task aborts the
      // whole fan-out, consistent with the no-partial-fanout invariant.
      const prev_vak = safeParseVak(process.env.EPI_SESSION_VAK_ADDRESS);
      const informationalFires: string[] = [];
      for (const t of tasks) {
        if (!t.vak_address) continue; // dialogical task — gates apply to next_vak only when present
        const guardrails = dispatchGuardrails(
          { prev_vak, next_vak: t.vak_address, risk: t.risk ?? 0 },
          CANONICAL_TRIGGERS,
        );
        if (!guardrails.allowed) {
          return {
            content: [{
              type: "text",
              text: `dispatch_parallel_agents refused: dispatch blocked by gates on task for ${t.agent_name}: ${guardrails.gates_fired.join(", ")}`,
            }],
            isError: true,
          };
        }
        if (guardrails.gates_fired.length > 0) {
          informationalFires.push(`${t.agent_name}: ${guardrails.gates_fired.join(", ")}`);
        }
      }
      const results = await Promise.all(
        tasks.map(({ task, agent_name, vak_address }) =>
          dispatchTeamMember(agent_name, task, vak_address).then((out) => `## ${agent_name}\n${out}`)
        )
      );
      const header = informationalFires.length > 0
        ? `[gates fired (informational): ${informationalFires.join("; ")}]\n\n`
        : "";
      return { content: [{ type: "text", text: `${header}${results.join("\n\n")}` }] };
    },
  });

  api.registerTool({
    name: "dispatch_fusion_agents",
    label: "Dispatch Fusion Agents",
    description: "CFP3 F-Thread dispatch: send one task to multiple agents and return Agora-style aggregation.",
    parameters: Type.Object({
      task: Type.String(),
      agents: Type.Array(Type.String()),
      // vak_address opaque to TypeBox — validator gates it. Required per A5.
      // For CFP3 fusion the address describes the joint task, not per-agent CF;
      // `validateFusionDispatch` runs per-entry validation via the documented
      // escape hatch — each agent_name passes through canonical-shape checks
      // without roster cf-binding (since the aggregate isn't a 7-fold member).
      vak_address: Type.Optional(Type.Any()),
      // Optional risk score (0..1) for gate guardrail evaluation. Default 0
      // preserves the pre-D5 surface (existing callers unaffected; only
      // collab-gate consumes risk and only when cpf is dialogical). Mirrors
      // the dispatch_agent / dispatch_parallel_agents schema for symmetry.
      risk: Type.Optional(Type.Number()),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const vakAddress = params.vak_address as VakAddress | undefined;
      const agents = params.agents as string[];
      const dispatches = agents.map((agent_name) => ({ agent_name, vak_address: vakAddress }));
      const validation = validateFusionDispatch({
        task: params.task,
        dispatches,
      });
      if (!validation.ok) {
        return {
          content: [{ type: "text", text: `dispatch refused: ${validation.error}` }],
          isError: true,
        };
      }
      // Per-entry gate guardrails (D5 symmetry). Same dialectic as the
      // per-entry mechanistic validation above: each fusion entry is
      // independently gated against CANONICAL_TRIGGERS. A single blocking
      // gate on any entry aborts the whole fan-out, consistent with the
      // no-partial-fanout invariant. Mirrors dispatch_parallel_agents.
      const prev_vak = safeParseVak(process.env.EPI_SESSION_VAK_ADDRESS);
      const risk = params.risk ?? 0;
      const informationalFires: string[] = [];
      for (const entry of dispatches) {
        if (!entry.vak_address) continue; // dialogical fusion — no next_vak to gate
        const guardrails = dispatchGuardrails(
          { prev_vak, next_vak: entry.vak_address, risk },
          CANONICAL_TRIGGERS,
        );
        if (!guardrails.allowed) {
          return {
            content: [{
              type: "text",
              text: `Fusion dispatch blocked by gates on entry for '${entry.agent_name}': ${guardrails.gates_fired.join(", ")}`,
            }],
            isError: true,
          };
        }
        if (guardrails.gates_fired.length > 0) {
          informationalFires.push(`${entry.agent_name}: ${guardrails.gates_fired.join(", ")}`);
        }
      }
      const outputs = await Promise.all(
        agents.map((agent: string) =>
          dispatchTeamMember(agent, params.task, vakAddress).then((out) => `### ${agent}\n${out}`)
        )
      );
      const header = informationalFires.length > 0
        ? `[gates fired (informational): ${informationalFires.join("; ")}]\n\n`
        : "";
      return {
        content: [{ type: "text", text: `${header}Agora CFP3 aggregation\n\n${outputs.join("\n\n")}` }],
      };
    },
  });

  api.registerTool({
    name: "dispatch_moirai_night_pass",
    label: "Dispatch Moirai Night' Pass",
    description:
      "CFP3 F-Thread Night' rehearing: dispatch Klotho (P1' Traces), Lachesis (P4' Sources), and Atropos (P5' Crystallisations) in parallel-fold to dissect a Sophia disclosure JSONL.",
    parameters: Type.Object({
      session_id: Type.String({ description: "Session id whose Sophia disclosure is being rehearsed" }),
      disclosure_path: Type.String({ description: "Filesystem path to the Sophia disclosure JSONL line / inbox file" }),
      aeon_graduation: Type.Optional(Type.Any({
        description:
          "Optional consent-gated Z-to-Aeon graduation payload. Carries AeonGraduationInput plus optional world_form_path; writes the accrued block only after the Moirai Night' pass fully succeeds.",
      })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const plan = planMoiraiNightPass({
        session_id: params.session_id,
        disclosure_path: params.disclosure_path,
        coordinate_clusters: defaultM5CoordinateClusters(),
      });

      // Build a CFP3/Night' VAK address per Moirai via `buildMoiraiVak`. Each
      // carries the cf of the constitutional agent whose territory it is
      // dissecting (see `MOIRAI_HOST_CF` in dispatch-validate.ts).
      //
      // Aggregate pre-flight: validateFusionDispatch runs per-entry
      // validateDispatchParams via the documented cf-binding escape hatch.
      // Refusing the whole pass on any malformed entry upholds the
      // no-partial-fanout invariant (same dialectic as parallel dispatch).
      const dispatchesWithVak = plan.dispatches.map((d) => ({
        d,
        vak: buildMoiraiVak(MOIRAI_HOST_CF[d.agent]),
      }));
      const sharedTask = `Moirai Night' rehearing pass on ${params.disclosure_path} for session ${params.session_id}`;
      const fusionValidation = validateFusionDispatch({
        task: sharedTask,
        dispatches: dispatchesWithVak.map(({ d, vak }) => ({
          agent_name: d.agent,
          vak_address: vak,
        })),
      });
      if (!fusionValidation.ok) {
        return {
          content: [{ type: "text", text: `dispatch_moirai_night_pass refused: ${fusionValidation.error}` }],
          isError: true,
        };
      }

      // We use Promise.allSettled (semantically equivalent to Promise.all
      // here, since `dispatchTeamMember` resolves — never rejects — even on
      // subprocess error, prefixing the output with "Error:") for clarity:
      // it makes explicit that we expect to classify every result rather
      // than fail the whole tool on the first rejection. Each output is
      // then run through `classifyMoiraiOutput` and the section header
      // surfaces the per-agent status (ok / failed / empty).
      // If any Moirai is non-ok the tool return carries `isError: true`
      // so callers can detect partial failure without parsing the body.
      const settled = await Promise.allSettled(
        dispatchesWithVak.map(async ({ d, vak }) => {
          const out = await dispatchTeamMember(d.agent, d.task, vak);
          return { d, output: out, status: classifyMoiraiOutput(out) };
        }),
      );

      let okCount = 0;
      const sections: string[] = [];
      for (let i = 0; i < settled.length; i++) {
        const r = settled[i];
        const d = plan.dispatches[i];
        if (r.status === "fulfilled") {
          const { output, status } = r.value;
          if (status === "ok") okCount++;
          sections.push(`### ${d.agent} (${status}) [${d.night_position}]\n${output}`);
        } else {
          // Promise.allSettled rejection: the async closure itself threw
          // (not a subprocess "Error:" string). Treat as failed.
          sections.push(
            `### ${d.agent} (failed) [${d.night_position}]\nError: ${String(r.reason)}`,
          );
        }
      }
      const summary = `Moirai Night' pass: ${okCount}/3 succeeded`;
      const anyFailed = okCount !== plan.dispatches.length;
      let graduationText = "";
      let graduationDetails: Record<string, unknown> | undefined;

      if (params.aeon_graduation) {
        if (anyFailed) {
          graduationText = "\nAeon graduation skipped: Moirai Night' pass did not fully succeed.";
        } else {
          try {
            const { world_form_path, ...graduationInput } = params.aeon_graduation as AeonGraduationInput & {
              world_form_path?: string;
            };
            const record = buildAeonGraduationRecord(graduationInput);
            const formPath = world_form_path ?? "Idea/Bimba/World/Aeon.md";
            const current = readFileSync(formPath, "utf8");
            const updated = applyAeonGraduationToForm(current, record);
            writeFileSync(formPath, updated);
            graduationText =
              `\nAeon graduation: wrote ${formPath} for ${record.state.aeon_name} ` +
              `(${record.state.aeon_id}); pass record.state.improvement_proposal to ` +
              "`aletheia_session_promote.q_proposals` to promote the rubric proposal.";
            graduationDetails = {
              world_form_path: formPath,
              aeon_id: record.state.aeon_id,
              aeon_name: record.state.aeon_name,
              improvement_proposal: record.state.improvement_proposal,
            };
          } catch (e) {
            graduationText = `\nAeon graduation failed: ${String(e)}`;
          }
        }
      }

      return {
        content: [
          {
            type: "text",
            text:
              `${summary}\n` +
              `CFP3 F-Thread Night' rehearing — Moirai dispatch\n` +
              `session_id: ${params.session_id}\n` +
              `disclosure: ${params.disclosure_path}\n\n` +
              sections.join("\n\n") +
              graduationText,
          },
        ],
        ...(anyFailed || graduationText.startsWith("\nAeon graduation failed") ? { isError: true } : {}),
        details: {
          plan,
          session_id: params.session_id,
          disclosure_path: params.disclosure_path,
          ok_count: okCount,
          ...(graduationDetails ? { aeon_graduation: graduationDetails } : {}),
        },
      };
    },
  });

  api.registerTool({
    name: "anima_self_invoke",
    label: "Anima Self-Invoke",
    description:
      "Invoke another Anima session via the D2 gateway endpoint (route_anima_invoke). " +
      "Patches the target session's VAK address and queues `task` on its transcript as an " +
      "anima_invoke-tagged message. Use when one user's Anima needs to surface a task into " +
      "another user's Anima session (e.g. cross-user VAK evaluation).",
    parameters: Type.Object({
      target_user: Type.String({ description: "Target user id (becomes agent:anima:<target_user>)" }),
      task: Type.String({ description: "Task to queue on the target session's transcript" }),
      // vak_address opaque to TypeBox — validated structurally below.
      // If absent, falls back to EPI_SESSION_VAK_ADDRESS (C1 propagation), then a
      // compose-default. Keeps the agent surface ergonomic when the current
      // session VAK is the right thing to carry.
      vak_address: Type.Optional(Type.Any()),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      // Resolve vak_address: param > env (C1 propagation) > compose-default.
      let vak: VakAddress | undefined;
      if (params.vak_address) {
        vak = params.vak_address as VakAddress;
      } else if (process.env.EPI_SESSION_VAK_ADDRESS) {
        try {
          const parsed = JSON.parse(process.env.EPI_SESSION_VAK_ADDRESS);
          if (isValidVakAddress(parsed)) vak = parsed;
        } catch {
          // Malformed env — fall through to compose-default.
        }
      }
      if (!vak) {
        // Compose-default: Anima's own constitutional CF.
        vak = {
          cpf: "(4.0/1-4.4/5)",
          ct: ["CT4a"],
          cp: "CP4.4",
          cf: "(4.0/1-4.4/5)",
          cfp: "CFP0",
          cs: { code: "CS0", direction: "Day" },
        };
      }
      if (!isValidVakAddress(vak)) {
        return {
          content: [{ type: "text", text: `anima_self_invoke refused: vak_address failed canonical validation` }],
          isError: true,
        };
      }

      const payload = buildAnimaInvokePayload({
        target_user: params.target_user,
        task: params.task,
        vak_address: vak,
      });

      // D3 follow-up: shell out to `epi gate dispatch anima-invoke` which
      // routes the payload through the gateway's route_anima_invoke endpoint
      // (Body/S/S3/gateway/src/dispatch.rs, gateway commit 89f7943).
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

function resolveArenaRuntimeAdapter(ctx: unknown): ArenaRuntimeAdapter | null {
  const candidate = (
    (ctx as any)?.arena_orchestrator?.adapter ??
    (ctx as any)?.arena?.adapter ??
    (ctx as any)?.arena_runtime ??
    (ctx as any)?.arena
  );
  if (!candidate || typeof candidate !== "object") return null;
  const required: Array<keyof ArenaRuntimeAdapter> = [
    "getArenaScene",
    "listAdmittedVamaShaktis",
    "listArenaTurns",
    "readKairosState",
    "appendArenaTurn",
    "appendArenaDialogueLine",
    "dispatchArenaPlan",
    "emitArenaObservabilityEvent",
  ];
  return required.every((key) => typeof candidate[key] === "function")
    ? candidate as ArenaRuntimeAdapter
    : null;
}

async function bindMercuriusKairosState(
  ctx: unknown,
  scene_key: string,
  adapter: ArenaRuntimeAdapter,
): Promise<ArenaRuntimeAdapter> {
  const mercurius = resolveMercuriusSubscriptionSource(ctx);
  if (!mercurius) return adapter;

  if (!arenaKairosStates.has(scene_key)) {
    arenaKairosStates.set(scene_key, await adapter.readKairosState(scene_key));
  }
  if (!arenaMercuriusSubscriptions.has(scene_key)) {
    const state = arenaKairosStates.get(scene_key)!;
    arenaMercuriusSubscriptions.set(
      scene_key,
      subscribeMercuriusKairosDelta({
        scene_key,
        state,
        subscribe: mercurius.subscribe.bind(mercurius),
      }),
    );
  }

  return new Proxy(adapter, {
    get(target, prop, receiver) {
      if (prop === "readKairosState") {
        return async (key: string) => arenaKairosStates.get(key) ?? target.readKairosState(key);
      }
      const value = Reflect.get(target, prop, receiver);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}

function resolveMercuriusSubscriptionSource(ctx: unknown): MercuriusSubscriptionSource | null {
  const candidate = (
    (ctx as any)?.mercurius ??
    (ctx as any)?.mercurius_relay ??
    (ctx as any)?.subscriptions
  );
  return candidate && typeof candidate.subscribe === "function"
    ? candidate as MercuriusSubscriptionSource
    : null;
}
