import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { spawnSync } from "node:child_process";

type CS = "CS0" | "CS1" | "CS2" | "CS3" | "CS4" | "CS5";
type CSDirectionality = "day" | "night_prime";

type CSState = {
  value: CS;
  directionality: CSDirectionality;
  cpPosition: "4.0" | "4.1" | "4.2" | "4.3" | "4.4" | "4.5";
};

interface S4Frame {
  // Canonical C' ordering: C0'=cpf, C1'=ct, C2'=cp, C3'=cf, C4'=cfp, C5'=cs.
  cpf: string;
  ct: string[];
  cp: string;
  cf: string;
  cfp: string;
  cs: CSState;
}

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
  return spawnSync("epi", ["agent", "run", "--agent", "sophia", prompt], {
    encoding: "utf8",
    timeout: 120_000,
  });
}

export async function animaExtension(api: ExtensionAPI) {
  // ── Tool: vak_evaluate ───────────────────────────────────────────
  api.registerTool({
    name: "vak_evaluate",
    description: "Assign 6-layer VAK coordinates (CPF/CT/CP/CF/CFP/CS) to a task. CF code determines constitutional agent routing. CFP determines thread type (CFP0-CFP5).",
    inputSchema: {
      type: "object",
      properties: {
        task: { type: "string", description: "Task description to evaluate" },
        json: { type: "boolean", default: false },
      },
      required: ["task"],
    },
    async handler(input: { task: string; json?: boolean }) {
      const args = ["agent", "vak", "evaluate", input.task];
      if (input.json) args.push("--json");
      const result = spawnSync("epi", args, { encoding: "utf8" });
      return { content: [{ type: "text", text: result.stdout || result.stderr }] };
    },
  });

  // ── Tool: anima_orchestrate ──────────────────────────────────────
  api.registerTool({
    name: "anima_orchestrate",
    description: "CF code → constitutional agent routing decision. Maps CF code to the correct constitutional agent (Psyche/Sophia/Nous/Eros/Logos/Mythos).",
    inputSchema: {
      type: "object",
      properties: {
        cf_code: {
          type: "string",
          enum: ["(0/1)", "(0/1/2)", "(0/1/2/3)", "(4.0/1-4.4/5)", "(4/5/0)", "(5/0)", "(00/00)"],
        },
        task: { type: "string" },
      },
      required: ["cf_code", "task"],
    },
    async handler(input: { cf_code: string; task: string }) {
      const CF_TO_AGENT: Record<string, string> = {
        "(0/1)": "logos",
        "(0/1/2)": "eros",
        "(0/1/2/3)": "mythos",
        // Intentional self-routing: Anima owns the lemniscate frame as the dispatch
        // function itself, so this route documents meta-dispatch rather than a gap.
        "(4.0/1-4.4/5)": "anima",
        "(4/5/0)": "psyche",
        "(4.5/0)": "psyche",
        "(5/0)": "sophia",
        "(00/00)": "nous",
      };

      // CPF (00/00) CO-ACTION GATE: Receptive Dynamism — ALWAYS brainstorm with user first
      if (input.cf_code === "(00/00)") {
        return {
          content: [{
            type: "text",
            text: `CF (00/00) — CO-ACTION GATE: This task requires collaborative brainstorming with the user before autonomous execution.\n` +
              `Task: ${input.task}\n` +
              `Agent: nous\n` +
              `ACTION REQUIRED: Present the task to the user and brainstorm approach before dispatching.`,
          }],
        };
      }

      const agent = CF_TO_AGENT[input.cf_code];
      if (!agent) {
        return {
          content: [{ type: "text", text: `unknown CF code: ${input.cf_code} — valid codes: ${Object.keys(CF_TO_AGENT).join(", ")}` }],
          isError: true,
        };
      }
      return {
        content: [{
          type: "text",
          text: `CF ${input.cf_code} → agent: ${agent}\ntask: ${input.task}`,
        }],
      };
    },
  });

  // ── Tool: nous_disclose ──────────────────────────────────────────
  api.registerTool({
    name: "nous_disclose",
    description: "Nous dis-closure: navigate S0'/S1'/S2' data source gradations (CLI/Vault/Graph) to curate a context package for the current task/NOW. Injects curated source listing + context notes as an UPDATE to the existing Khora session notebook.",
    inputSchema: {
      type: "object",
      properties: {
        task: { type: "string", description: "Task description — Nous uses this to select relevant sources" },
        session_id: { type: "string", description: "Session ID — identifies which Khora notebook to update" },
        now_path: { type: "string", description: "Current NOW folder path" },
        source_coordinates: {
          type: "array",
          items: { type: "string" },
          description: "Known coordinate refs for this task (e.g. ['S1','M4','T2'])",
        },
        depth: {
          type: "string",
          enum: ["s0", "s1", "s2", "full"],
          default: "full",
          description: "Data source depth: s0=CLI only, s1=CLI+Vault, s2=CLI+Graph, full=all three",
        },
      },
      required: ["task", "session_id"],
    },
    async handler(input: {
      task: string;
      session_id: string;
      now_path?: string;
      source_coordinates?: string[];
      depth?: string;
    }) {
      const depth = input.depth || "full";
      const coords = input.source_coordinates || [];
      const sources: string[] = [];

      // S0' — CLI: fast structural queries
      if (depth !== "s1") {
        const cliCtx: string[] = [];
        for (const coord of coords) {
          const r = spawnSync("epi", ["core", "knowing", coord, "--json"], { encoding: "utf8" });
          if (r.stdout) cliCtx.push(`[S0' epi knowing ${coord}]\n${r.stdout.trim()}`);
        }
        if (cliCtx.length) sources.push("## S0' — CLI Context\n" + cliCtx.join("\n\n"));
      }

      // S1' — Vault: Obsidian content search
      if (depth === "s1" || depth === "full") {
        const vaultSearch = spawnSync("obsidian", ["search", "--query", input.task, "--limit", "5", "--json"], { encoding: "utf8" });
        if (vaultSearch.stdout) {
          sources.push(`## S1' — Vault Context\n${vaultSearch.stdout.trim()}`);
        }
      }

      // S2' — Graph: Neo4j semantic depth
      if (depth === "s2" || depth === "full") {
        const graphCtx: string[] = [];
        for (const coord of coords) {
          const r = spawnSync("epi", ["graph", "query", "--coordinate", coord, "--json"], { encoding: "utf8" });
          if (r.stdout) graphCtx.push(`[S2' graph ${coord}]\n${r.stdout.trim()}`);
        }
        if (graphCtx.length) sources.push("## S2' — Graph Context\n" + graphCtx.join("\n\n"));
      }

      // Inject curated source listing into existing session notebook
      const notebookUpdate = [
        `## Nous Dis-closure — ${new Date().toISOString()}`,
        `**Task:** ${input.task}`,
        `**Source coordinates:** ${coords.length ? coords.join(", ") : "none specified"}`,
        `**Depth:** ${depth}`,
        "",
        ...sources,
      ].join("\n");

      const ingestArgs = [
        "techne", "gnosis", "notebook",
        "--session-id", input.session_id,
        "--update",
        "--content", notebookUpdate,
      ];
      const ingest = spawnSync("epi", ingestArgs, { encoding: "utf8", timeout: 30_000 });

      return {
        content: [{
          type: "text",
          text: ingest.stdout
            ? `nous_disclose: context package injected into session notebook ${input.session_id}\n${ingest.stdout.trim()}`
            : `nous_disclose failed: ${ingest.stderr || ingest.stdout}`,
        }],
        isError: ingest.status !== 0,
      };
    },
  });

  // ── Tool: dispatch_agent ─────────────────────────────────────────
  api.registerTool({
    name: "dispatch_agent",
    description: "Spawn a single constitutional agent for CFP0/base execution.",
    inputSchema: {
      type: "object",
      properties: {
        agent_name: { type: "string", description: "Constitutional agent name (psyche|sophia|nous|eros|logos|mythos)" },
        task: { type: "string" },
        session_id: { type: "string" },
      },
      required: ["agent_name", "task"],
    },
    async handler(input: { agent_name: string; task: string; session_id?: string }) {
      const args = ["agent", "run", "--agent", input.agent_name, input.task];
      const result = spawnSync("epi", args, { encoding: "utf8", timeout: 120_000 });
      return { content: [{ type: "text", text: result.stdout || result.stderr }] };
    },
  });

  // ── Tool: run_chain ──────────────────────────────────────────────
  api.registerTool({
    name: "run_chain",
    description: "Execute sequential agent pipeline (CFP2 C-Thread). Agents execute in order, each receiving the previous agent's output.",
    inputSchema: {
      type: "object",
      properties: {
        chain_name: { type: "string" },
        task: { type: "string" },
        agents: {
          type: "array",
          items: { type: "string" },
          description: "Ordered list of agent names",
        },
      },
      required: ["task"],
    },
    async handler(input: { chain_name?: string; task: string; agents?: string[] }) {
      const agents = input.agents || ["nous", "psyche", "sophia"];
      let context = input.task;
      for (const agent of agents) {
        const result = spawnSync("epi", ["agent", "run", "--agent", agent, context], { encoding: "utf8", timeout: 120_000 });
        if (result.status !== 0) {
          return {
            content: [{ type: "text", text: `run_chain: agent '${agent}' failed in chain [${agents.join(" → ")}]\n${result.stderr}` }],
            isError: true,
          };
        }
        context = result.stdout || context;
      }
      return {
        content: [{ type: "text", text: `run_chain: completed [${agents.join(" → ")}]\n${context}` }],
      };
    },
  });

  api.registerTool({
    name: "dispatch_parallel_agents",
    description: "CFP1 P-Thread dispatch for independent tasks routed to agents in parallel.",
    inputSchema: {
      type: "object",
      properties: {
        tasks: {
          type: "array",
          items: {
            type: "object",
            properties: {
              task: { type: "string" },
              agent_name: { type: "string" },
            },
            required: ["task", "agent_name"],
          },
        },
      },
      required: ["tasks"],
    },
    async handler(input: { tasks: Array<{ task: string; agent_name: string }> }) {
      const results = input.tasks.map(({ task, agent_name }) => {
        const result = spawnSync("epi", ["agent", "run", "--agent", agent_name, task], {
          encoding: "utf8",
          timeout: 120_000,
        });
        return `## ${agent_name}\n${result.stdout || result.stderr}`;
      });
      return { content: [{ type: "text", text: results.join("\n\n") }] };
    },
  });

  api.registerTool({
    name: "dispatch_fusion_agents",
    description: "CFP3 F-Thread dispatch: send one task to multiple agents and return Agora-style aggregation.",
    inputSchema: {
      type: "object",
      properties: {
        task: { type: "string" },
        agents: { type: "array", items: { type: "string" } },
      },
      required: ["task", "agents"],
    },
    async handler(input: { task: string; agents: string[] }) {
      const outputs = input.agents.map((agent) => {
        const result = spawnSync("epi", ["agent", "run", "--agent", agent, input.task], {
          encoding: "utf8",
          timeout: 120_000,
        });
        return `### ${agent}\n${result.stdout || result.stderr}`;
      });
      return {
        content: [{
          type: "text",
          text: `Agora CFP3 aggregation\n\n${outputs.join("\n\n")}`,
        }],
      };
    },
  });

  // ── Tools: subagent lifecycle ────────────────────────────────────
  api.registerTool({
    name: "subagent_create",
    description: "Spawn a background subagent (CFP4 L-Thread). Returns subagent ID for continuation.",
    inputSchema: {
      type: "object",
      properties: {
        agent_name: { type: "string" },
        task: { type: "string" },
        background: { type: "boolean", default: true },
      },
      required: ["agent_name", "task"],
    },
    async handler(input: { agent_name: string; task: string }) {
      const result = spawnSync("epi", ["agent", "spawn", "--agent", input.agent_name], { encoding: "utf8" });
      return { content: [{ type: "text", text: result.stdout || result.stderr }] };
    },
  });

  api.registerTool({
    name: "subagent_list",
    description: "List active background subagents.",
    inputSchema: { type: "object", properties: {} },
    async handler() {
      const result = spawnSync("epi", ["agent", "spawn", "--list"], { encoding: "utf8" });
      if (result.status !== 0) {
        return { content: [{ type: "text", text: `subagent_list failed: ${result.stderr}` }], isError: true };
      }
      return { content: [{ type: "text", text: result.stdout }] };
    },
  });

  api.registerTool({
    name: "subagent_continue",
    description: "Resume a background subagent by ID.",
    inputSchema: {
      type: "object",
      properties: { subagent_id: { type: "string" } },
      required: ["subagent_id"],
    },
    async handler(input: { subagent_id: string }) {
      const result = spawnSync("epi", ["agent", "spawn", "--continue", input.subagent_id], { encoding: "utf8", timeout: 120_000 });
      if (result.status !== 0) {
        return { content: [{ type: "text", text: `subagent_continue ${input.subagent_id} failed: ${result.stderr}` }], isError: true };
      }
      return { content: [{ type: "text", text: result.stdout }] };
    },
  });

  api.registerTool({
    name: "subagent_remove",
    description: "Terminate and clean up a background subagent.",
    inputSchema: {
      type: "object",
      properties: { subagent_id: { type: "string" } },
      required: ["subagent_id"],
    },
    async handler(input: { subagent_id: string }) {
      const result = spawnSync("epi", ["agent", "spawn", "--remove", input.subagent_id], { encoding: "utf8" });
      if (result.status !== 0) {
        return { content: [{ type: "text", text: `subagent_remove ${input.subagent_id} failed: ${result.stderr}` }], isError: true };
      }
      return { content: [{ type: "text", text: result.stdout || `subagent ${input.subagent_id} removed` }] };
    },
  });

  api.on("before_agent_start", async () => {
    setCSState(undefined, { value: "CS0", directionality: "day", cpPosition: "4.0" });
  });

  api.on("agent_end", async () => {
    const currentState = getCSState();
    const result = sophiaReview(
      undefined,
      `Session ended from ${currentState.cpPosition} in ${currentState.directionality} mode.`,
    );
    void result;
  });
}
