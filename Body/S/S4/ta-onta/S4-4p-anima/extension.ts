import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { spawnSync, spawn } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import registerAgentTeam from "./S4/agent-team.ts";
import registerAgentChain from "./S4/agent-chain.ts";
import registerSubagentWidget from "./S4/subagent-widget.ts";
import registerPiPi from "./S4/pi-pi.ts";
import { validateDispatchParams } from "./modules/dispatch-validate.ts";
import type { VakAddress } from "../shared/vak_address.ts";

type CS = "CS0" | "CS1" | "CS2" | "CS3" | "CS4" | "CS5";
type CSDirectionality = "day" | "night_prime";

type CSState = {
  value: CS;
  directionality: CSDirectionality;
  cpPosition: "4.0" | "4.1" | "4.2" | "4.3" | "4.4" | "4.5";
};

const sessionCSState = new Map<string, CSState>();

function setCSState(sessionId: string | undefined, nextState: CSState) {
  if (sessionId) {
    sessionCSState.set(sessionId, nextState);
  }
  return nextState;
}

function getCSState(sessionId?: string): CSState {
  return (sessionId && sessionCSState.get(sessionId)) ?? {
    value: "CS0",
    directionality: "day",
    cpPosition: "4.0",
  };
}

function runEpi(args: string[], timeout = 120_000) {
  return spawnSync("epi", args, {
    encoding: "utf8",
    timeout,
    cwd: process.env.EPI_REPO_ROOT || process.cwd(),
  });
}

// Dispatch a single agent task via the native team runtime (epi agent team dispatch).
// Returns a Promise so callers can fan-out concurrently with Promise.all.
// vak_address is REQUIRED — every dispatch must carry its causal address (A5).
// Callers must pre-validate via validateDispatchParams; this function trusts its input.
// The address is forwarded to the child via EPI_SESSION_VAK_ADDRESS so downstream
// tools (Hen template render, future VAK-aware tools) can read it.
function dispatchTeamMember(agentName: string, task: string, vakAddress?: VakAddress): Promise<string> {
  const parentSession = process.env.EPI_PARENT_SESSION || "agent:main:main";
  const args = [
    "--json", "agent", "team", "dispatch",
    "--parent-session", parentSession,
    "--agent", agentName,
    "--task", task,
  ];
  const childEnv: NodeJS.ProcessEnv = { ...process.env };
  if (vakAddress) {
    childEnv.EPI_SESSION_VAK_ADDRESS = JSON.stringify(vakAddress);
  }
  return new Promise((resolve) => {
    const proc = spawn("epi", args, {
      stdio: ["ignore", "pipe", "pipe"],
      env: childEnv,
      cwd: process.env.EPI_REPO_ROOT || process.cwd(),
    });
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (d: Buffer) => { stdout += d.toString(); });
    proc.stderr.on("data", (d: Buffer) => { stderr += d.toString(); });
    proc.on("close", () => { resolve(stdout || stderr); });
    proc.on("error", (err: Error) => { resolve(`Error: ${err.message}`); });
  });
}

function sophiaReview(sessionId: string | undefined, sessionOutput: string) {
  const nightState = setCSState(sessionId, {
    value: "CS5",
    directionality: "night_prime",
    cpPosition: "4.5",
  });
  const prompt = [
    "Review and crystallise this session output.",
    "Emit P5' insight and P0' questions.",
    `CS=${nightState.value}:${nightState.directionality}`,
    sessionOutput,
  ].join("\n\n");
  return runEpi(["agent", "run", "--agent", "sophia", prompt]);
}

export async function animaExtension(api: ExtensionAPI) {
  registerAgentTeam(api);
  registerAgentChain(api);
  registerSubagentWidget(api);
  const animaDefaultTools = [
    "vak_evaluate",
    "goal_prelude",
    "anima_orchestrate",
    "nous_disclose",
    "dispatch_agent",
    "dispatch_parallel_agents",
    "dispatch_fusion_agents",
    "run_chain",
    "subagent_create",
    "subagent_continue",
    "subagent_list",
    "subagent_remove",
    "tilldone",
  ];
  api.on("session_start", async () => {
    api.setActiveTools(animaDefaultTools);
  });
  // Pi-Pi only loads when EPI_AGENT_MODE=pipi (via `epi agent pipi`)
  if (process.env.EPI_AGENT_MODE === "pipi") {
    registerPiPi(api);
  }

  api.registerTool({
    name: "vak_evaluate",
    label: "Vak Evaluate",
    description:
      "Assign 6-layer VAK coordinates (CPF/CT/CP/CF/CFP/CS) to a task. CF code determines constitutional agent routing. CFP determines thread type (CFP0-CFP5).",
    parameters: Type.Object({
      task: Type.String({ description: "Task description to evaluate" }),
      json: Type.Optional(Type.Boolean({ default: false })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const args = ["agent", "vak", "evaluate", params.task];
      if (params.json) {
        args.push("--json");
      }
      const result = runEpi(args);
      return { content: [{ type: "text", text: result.stdout || result.stderr }] };
    },
  });

  api.registerTool({
    name: "goal_prelude",
    label: "Goal Prelude",
    description:
      "Create the first-pass /goal artifact: a dialogical, NOW-bound GoalPrelude markdown file. This does not start a run, create cron, or resolve review.",
    parameters: Type.Object({
      goal: Type.String({ description: "Raw user goal text, 4,000 characters or fewer" }),
      now_path: Type.Optional(Type.String({ description: "Active NOW.md path; defaults to session environment" })),
      session_key: Type.Optional(Type.String({ description: "Gateway session key to resolve NOW when now_path is absent" })),
      session_id: Type.Optional(Type.String({ description: "Session id override for non-canonical NOW paths" })),
      day_id: Type.Optional(Type.String({ description: "Day id override for non-canonical NOW paths" })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const args = ["agent", "goal", "prelude", params.goal, "--json"];
      if (params.now_path) args.push("--now-path", params.now_path);
      if (params.session_key) args.push("--session-key", params.session_key);
      if (params.session_id) args.push("--session-id", params.session_id);
      if (params.day_id) args.push("--day-id", params.day_id);
      const result = runEpi(args, 30_000);
      return {
        content: [{ type: "text", text: result.stdout || result.stderr }],
        isError: result.status !== 0,
      };
    },
  });

  api.registerTool({
    name: "anima_orchestrate",
    label: "Anima Orchestrate",
    description:
      "CF code → constitutional agent routing decision. Maps CF code to the correct constitutional agent (Psyche/Sophia/Nous/Eros/Logos/Mythos).",
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
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const cfToAgent: Record<string, string> = {
        "(0/1)": "logos",
        "(0/1/2)": "eros",
        "(0/1/2/3)": "mythos",
        "(4.0/1-4.4/5)": "anima",
        "(4.5/0)": "psyche",
        "(5/0)": "sophia",
        "(00/00)": "nous",
      };

      if (params.cf_code === "(00/00)") {
        return {
          content: [
            {
              type: "text",
              text:
                `CF (00/00) — CO-ACTION GATE: This task requires collaborative brainstorming with the user before autonomous execution.\n` +
                `Task: ${params.task}\n` +
                "Agent: nous\n" +
                "ACTION REQUIRED: Present the task to the user and brainstorm approach before dispatching.",
            },
          ],
        };
      }

      const agent = cfToAgent[params.cf_code];
      if (!agent) {
        return {
          content: [
            {
              type: "text",
              text: `unknown CF code: ${params.cf_code} — valid codes: ${Object.keys(cfToAgent).join(", ")}`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [{ type: "text", text: `CF ${params.cf_code} → agent: ${agent}\ntask: ${params.task}` }],
      };
    },
  });

  api.registerTool({
    name: "nous_disclose",
    label: "Nous Disclose",
    description:
      "Nous dis-closure: navigate S0'/S1'/S2' data source gradations (CLI/Vault/Graph) to curate a context package for the current task/NOW. Injects curated source listing + context notes as an UPDATE to the existing Khora session notebook.",
    parameters: Type.Object({
      task: Type.String(),
      session_id: Type.String(),
      now_path: Type.Optional(Type.String()),
      source_coordinates: Type.Optional(Type.Array(Type.String())),
      depth: Type.Optional(Type.Union([
        Type.Literal("s0"),
        Type.Literal("s1"),
        Type.Literal("s2"),
        Type.Literal("full"),
      ])),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const depth = params.depth || "full";
      const coords = params.source_coordinates || [];
      const sources: string[] = [];

      if (depth !== "s1") {
        const cliCtx: string[] = [];
        for (const coord of coords) {
          const result = runEpi(["core", "knowing", coord, "--json"], 30_000);
          if (result.stdout) {
            cliCtx.push(`[S0' epi knowing ${coord}]\n${result.stdout.trim()}`);
          }
        }
        if (cliCtx.length) {
          sources.push("## S0' — CLI Context\n" + cliCtx.join("\n\n"));
        }
      }

      if (depth === "s1" || depth === "full") {
        const vaultSearch = spawnSync("obsidian-cli", ["search", "--query", params.task, "--limit", "5", "--json"], {
          encoding: "utf8",
          timeout: 30_000,
          cwd: process.env.EPI_REPO_ROOT || process.cwd(),
        });
        if (vaultSearch.stdout) {
          sources.push(`## S1' — Vault Context\n${vaultSearch.stdout.trim()}`);
        }
      }

      if (depth === "s2" || depth === "full") {
        const graphCtx: string[] = [];
        for (const coord of coords) {
          const result = runEpi(["--json", "graph", "retrieve", coord, "--nested"], 30_000);
          if (result.stdout) {
            graphCtx.push(`[S2' graph ${coord}]\n${result.stdout.trim()}`);
          }
        }
        if (graphCtx.length) {
          sources.push("## S2' — Graph Context\n" + graphCtx.join("\n\n"));
        }
      }

      const notebookUpdate = [
        `## Nous Dis-closure — ${new Date().toISOString()}`,
        `**Task:** ${params.task}`,
        `**Source coordinates:** ${coords.length ? coords.join(", ") : "none specified"}`,
        `**Depth:** ${depth}`,
        "",
        ...sources,
      ].join("\n");

      const { mkdirSync, writeFileSync } = await import("node:fs");
      const notebookName = `khora-session-${params.session_id}`;
      const tmpDir = `/tmp/nous-disclose-${params.session_id}`;
      mkdirSync(tmpDir, { recursive: true });
      const tmpPath = `${tmpDir}/context.md`;
      writeFileSync(tmpPath, notebookUpdate);

      const createNotebook = runEpi(["techne", "gnosis", "notebook", "create", notebookName], 30_000);
      if (createNotebook.status !== 0) {
        return {
          content: [{ type: "text", text: createNotebook.stderr || createNotebook.stdout || "notebook creation failed" }],
          isError: true,
        };
      }

      const ingest = runEpi(
        ["techne", "gnosis", "ingest", tmpPath, "--notebook", notebookName, "--source-type", "SessionContext"],
        30_000,
      );

      return {
        content: [
          {
            type: "text",
            text: ingest.stdout
              ? `nous_disclose: context package injected into session notebook ${params.session_id}\n${ingest.stdout.trim()}`
              : `nous_disclose failed: ${ingest.stderr || ingest.stdout}`,
          },
        ],
        isError: ingest.status !== 0,
      };
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
      })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      // Gate every sub-dispatch before any fire. One bad address aborts the whole CFP1 fan-out
      // (refusing partial-state writes upholds the address-causality invariant).
      const tasks = params.tasks as Array<{ task: string; agent_name: string; vak_address?: VakAddress }>;
      for (const t of tasks) {
        const validation = validateDispatchParams({
          agent_name: t.agent_name,
          task: t.task,
          vak_address: t.vak_address,
        });
        if (!validation.ok) {
          return {
            content: [{ type: "text", text: `dispatch refused (agent=${t.agent_name}): ${validation.error}` }],
            isError: true,
          };
        }
      }
      const results = await Promise.all(
        tasks.map(({ task, agent_name, vak_address }) =>
          dispatchTeamMember(agent_name, task, vak_address).then((out) => `## ${agent_name}\n${out}`)
        )
      );
      return { content: [{ type: "text", text: results.join("\n\n") }] };
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
      // the validator's AGENT_CF check is skipped for the fusion aggregate
      // by passing a synthetic agent_name "_cfp3_fusion" which is not in the roster.
      vak_address: Type.Optional(Type.Any()),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const vakAddress = params.vak_address as VakAddress | undefined;
      const validation = validateDispatchParams({
        agent_name: "_cfp3_fusion",
        task: params.task,
        vak_address: vakAddress,
      });
      if (!validation.ok) {
        return {
          content: [{ type: "text", text: `dispatch refused: ${validation.error}` }],
          isError: true,
        };
      }
      const outputs = await Promise.all(
        params.agents.map((agent: string) =>
          dispatchTeamMember(agent, params.task, vakAddress).then((out) => `### ${agent}\n${out}`)
        )
      );
      return {
        content: [{ type: "text", text: `Agora CFP3 aggregation\n\n${outputs.join("\n\n")}` }],
      };
    },
  });

  api.on("before_agent_start", async () => {
    setCSState(undefined, { value: "CS0", directionality: "day", cpPosition: "4.0" });

    // Inject the full VAK skill stack so Anima has the coordinate reference,
    // the evaluation protocol, and the dispatch table at session start.
    // Order matters: reference first, evaluation second, dispatch third.
    const VAK_SKILLS = ["vak-coordinate-frame", "vak-evaluate", "anima-orchestration"];
    const skillBlocks: string[] = [];
    for (const name of VAK_SKILLS) {
      const skillPath = new URL(`./S4'/skills/${name}/SKILL.md`, import.meta.url).pathname;
      if (!existsSync(skillPath)) continue;
      const raw = readFileSync(skillPath, "utf-8");
      const body = raw.replace(/^---[\s\S]*?---\n/, "").trim();
      skillBlocks.push(`## ${name}\n\n${body}`);
    }
    if (skillBlocks.length === 0) return {};
    return {
      systemPrompt: `\n\n---\n\n## VAK Operative Skills\n\nThese three skills govern your evaluation and dispatch protocol. For every non-trivial task: first run vak-evaluate to get coordinates, then use anima-orchestration to route to the correct agent.\n\n${skillBlocks.join("\n\n---\n\n")}`,
    };
  });

  api.on("agent_end", async () => {
    // Guard: sub-agents (sophia, logos, etc.) must not trigger their own sophia review,
    // or we get an infinite dispatch chain.
    if (process.env.EPI_AGENT_NAME && process.env.EPI_AGENT_NAME !== "anima") return;
    const currentState = getCSState();
    const result = sophiaReview(
      undefined,
      `Session ended from ${currentState.cpPosition} in ${currentState.directionality} mode.`,
    );
    void result;
  });
}

export default async function animaExtensionEntry(api: ExtensionAPI) {
  await animaExtension(api);
}
