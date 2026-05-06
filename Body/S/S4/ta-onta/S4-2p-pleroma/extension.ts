import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { spawnSync } from "node:child_process";
import { PRIMITIVE_REGISTRY, type PrimitiveDef } from "./S2/pleroma-primitives.ts";
import registerDamageControl from "./S2/damage-control.ts";
import registerTilldone from "./S2/tilldone.ts";

export async function pleromaExtension(api: ExtensionAPI) {
  registerDamageControl(api);
  if (shouldRegisterTilldone()) {
    registerTilldone(api);
  }

  // Register all 7 bounded primitives as PI tools
  for (const primitive of PRIMITIVE_REGISTRY) {
    registerPrimitiveTool(api, primitive);
  }

  // ── Techne subagent — gateway lifecycle and mechanical skills ─────
  // Techne is Pleroma's craft-level execution subagent.
  // It owns: gateway lifecycle, session management, operational introspection,
  // and mechanical skills (tmux, cmux, update, wizard).
  // Chronos owns temporal scheduling SEMANTICS; Techne owns gateway EXECUTION.

  api.registerTool({
    name: "techne_gateway_start",
    label: "Techne Gateway Start",
    description: "Start the S3 gateway WebSocket server on port 18794. Idempotent — safe to call if already running.",
    parameters: Type.Object({
      config_path: Type.Optional(Type.String({ description: "Optional path to gateway config file" })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const args = ["gate", "start"];
      if (params.config_path) args.push("--config", params.config_path);
      const result = spawnSync("epi", args, { encoding: "utf8" });
      return { content: [{ type: "text", text: result.stdout || result.stderr }], isError: result.status !== 0 };
    },
  });

  api.registerTool({
    name: "techne_gateway_stop",
    label: "Techne Gateway Stop",
    description: "Stop the S3 gateway WebSocket server gracefully.",
    parameters: Type.Object({}),
    async execute(_id: string, _params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const result = spawnSync("epi", ["gate", "stop"], { encoding: "utf8" });
      return { content: [{ type: "text", text: result.stdout || result.stderr }], isError: result.status !== 0 };
    },
  });

  api.registerTool({
    name: "techne_gateway_status",
    label: "Techne Gateway Status",
    description: "Get S3 gateway status: running state, port, TLS, active sessions and channel counts.",
    parameters: Type.Object({}),
    async execute(_id: string, _params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const result = spawnSync("epi", ["gate", "status", "--json"], { encoding: "utf8" });
      return { content: [{ type: "text", text: result.stdout || result.stderr }], isError: result.status !== 0 };
    },
  });

  api.registerTool({
    name: "techne_session_list",
    label: "Techne Session List",
    description: "List active gateway sessions. Each session includes vault_now_path, channel bindings, agent identity.",
    parameters: Type.Object({
      active_minutes: Type.Optional(Type.Integer({ default: 60 })),
      include_global: Type.Optional(Type.Boolean({ default: true })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const args = ["gate", "sessions", "list", "--json",
        "--active-minutes", String(params.active_minutes ?? 60)];
      if (params.include_global) args.push("--include-global");
      const result = spawnSync("epi", args, { encoding: "utf8" });
      return { content: [{ type: "text", text: result.stdout || result.stderr }], isError: result.status !== 0 };
    },
  });

  api.registerTool({
    name: "techne_session_patch",
    label: "Techne Session Patch",
    description: "Update a gateway session's label, thinking level, or verbose level.",
    parameters: Type.Object({
      session_key: Type.String(),
      label: Type.Optional(Type.String()),
      thinking_level: Type.Optional(Type.Union([
        Type.Literal("off"),
        Type.Literal("minimal"),
        Type.Literal("low"),
        Type.Literal("medium"),
        Type.Literal("high"),
      ])),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const args = ["gate", "sessions", "patch", params.session_key, "--json"];
      if (params.label) args.push("--label", params.label);
      if (params.thinking_level) args.push("--thinking-level", params.thinking_level);
      const result = spawnSync("epi", args, { encoding: "utf8" });
      return { content: [{ type: "text", text: result.stdout || result.stderr }], isError: result.status !== 0 };
    },
  });

  api.registerTool({
    name: "techne_logs_tail",
    label: "Techne Logs Tail",
    description: "Tail the gateway log stream (last N lines).",
    parameters: Type.Object({
      limit: Type.Optional(Type.Integer({ default: 100 })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const result = spawnSync("epi", ["gate", "logs", "--tail", String(params.limit ?? 100)], { encoding: "utf8" });
      return { content: [{ type: "text", text: result.stdout || result.stderr }] };
    },
  });

  api.registerTool({
    name: "techne_debug_status",
    label: "Techne Debug Status",
    description: "Get gateway debug status summary (health snapshot, method availability).",
    parameters: Type.Object({}),
    async execute(_id: string, _params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const result = spawnSync("epi", ["gate", "debug", "status", "--json"], { encoding: "utf8" });
      return { content: [{ type: "text", text: result.stdout || result.stderr }] };
    },
  });

  api.registerTool({
    name: "techne_cmux_list_workspaces",
    label: "Techne Cmux List Workspaces",
    description:
      "List cmux workspaces as the bounded Techne operator surface for Anima team, chain, and subagent flows.",
    parameters: Type.Object({}),
    async execute(_id: string, _params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const result = spawnSync("epi", ["techne", "cmux", "list-workspaces", "--projected"], { encoding: "utf8" });
      return { content: [{ type: "text", text: result.stdout || result.stderr }], isError: result.status !== 0 };
    },
  });

  api.registerTool({
    name: "techne_cmux_identify",
    label: "Techne Cmux Identify",
    description:
      "Identify the current cmux workspace or pane when available. Visibility helper only; no interactive pane execution.",
    parameters: Type.Object({}),
    async execute(_id: string, _params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const result = spawnSync("epi", ["techne", "cmux", "identify", "--projected"], { encoding: "utf8" });
      return { content: [{ type: "text", text: result.stdout || result.stderr }], isError: result.status !== 0 };
    },
  });

  // ── Techne cmux surface/pane management (VAK-coordinate-aware) ────
  // These augment the cmux SKILL.md command surface with PI tool bindings.
  // Tools that place panes write cmux_workspace/cmux_surface/cmux_pane_id
  // back to the gateway team store so placement survives cmux being closed.

  api.registerTool({
    name: "techne_cmux_surface_create",
    label: "Techne Cmux Surface Create",
    description: "Create a named cmux surface (tmux window) with a CP coordinate tag. Writes cmux_workspace and cmux_surface to the gateway session record.",
    parameters: Type.Object({
      name: Type.String({ description: "Surface name (e.g. 'ground', 'operation')" }),
      cp: Type.String({ description: "Context Position coordinate (e.g. '4.0', '4.2', '4.4')" }),
      session_key: Type.Optional(Type.String({ description: "Gateway session key to update with cmux placement (optional)" })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const result = spawnSync("cmux", ["surface-create", "--name", params.name, "--cp", params.cp], { encoding: "utf8" });
      if (result.status !== 0) {
        return { content: [{ type: "text", text: result.stderr || result.stdout }], isError: true };
      }
      // Write cmux placement back to gateway session record
      if (params.session_key) {
        spawnSync("epi", ["gate", "sessions", "patch", params.session_key,
          "--cmux-workspace", "main", "--cmux-surface", params.name], { encoding: "utf8" });
      }
      return { content: [{ type: "text", text: `surface '${params.name}' created at CP ${params.cp}\n${result.stdout}` }] };
    },
  });

  api.registerTool({
    name: "techne_cmux_pane_assign",
    label: "Techne Cmux Pane Assign",
    description: "Assign a pane on a cmux surface by CF identity. Sets CF_IDENTITY env in the pane so spawned agents inherit constitutional type. Writes cmux_pane_id to gateway team record.",
    parameters: Type.Object({
      surface: Type.String({ description: "Target surface name" }),
      cf: Type.String({ description: "CF identity code (e.g. '(0/1/2)', '(4.0-4.4/5)')" }),
      agent: Type.Optional(Type.String({ description: "Agent type to launch in the pane (e.g. 'claude-code')" })),
      team_id: Type.Optional(Type.String({ description: "Gateway team ID to update with cmux_pane_id (optional)" })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const args = ["pane-assign", "--surface", params.surface, "--cf", params.cf];
      if (params.agent) args.push("--agent", params.agent);
      const result = spawnSync("cmux", args, { encoding: "utf8" });
      if (result.status !== 0) {
        return { content: [{ type: "text", text: result.stderr || result.stdout }], isError: true };
      }
      // Parse pane_id from output and write to gateway team store
      const paneMatch = result.stdout.match(/pane[_-]?id[:\s]+(\S+)/i);
      if (paneMatch && params.team_id) {
        spawnSync("epi", ["gate", "teams", "patch", params.team_id,
          "--cmux-pane-id", paneMatch[1], "--cf-identity", params.cf], { encoding: "utf8" });
      }
      return { content: [{ type: "text", text: `pane assigned CF=${params.cf} on surface '${params.surface}'\n${result.stdout}` }] };
    },
  });

  api.registerTool({
    name: "techne_cmux_layout_set",
    label: "Techne Cmux Layout Set",
    description: "Set the layout mode for a cmux surface by CFP thread type. Records CFP thread type on the gateway team record.",
    parameters: Type.Object({
      surface: Type.String({ description: "Target surface name" }),
      cfp: Type.String({ description: "CFP thread type (CFP0–CFP5, e.g. 'CFP1' for P-Thread tiled)" }),
      team_id: Type.Optional(Type.String({ description: "Gateway team ID to update with cfp_thread (optional)" })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const result = spawnSync("cmux", ["layout-set", "--surface", params.surface, "--cfp", params.cfp], { encoding: "utf8" });
      if (result.status !== 0) {
        return { content: [{ type: "text", text: result.stderr || result.stdout }], isError: true };
      }
      if (params.team_id) {
        spawnSync("epi", ["gate", "teams", "patch", params.team_id, "--cfp-thread", params.cfp], { encoding: "utf8" });
      }
      return { content: [{ type: "text", text: `layout set to ${params.cfp} on surface '${params.surface}'\n${result.stdout}` }] };
    },
  });

  api.registerTool({
    name: "techne_cmux_focus",
    label: "Techne Cmux Focus",
    description: "Route focus to the pane with the given CF identity code. No state write needed — purely navigational.",
    parameters: Type.Object({
      cf: Type.String({ description: "CF identity code of the target pane (e.g. '(0/1/2)')" }),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const result = spawnSync("cmux", ["focus", "--cf", params.cf], { encoding: "utf8" });
      return { content: [{ type: "text", text: result.stdout || result.stderr }], isError: result.status !== 0 };
    },
  });

  api.registerTool({
    name: "techne_cmux_surface_destroy",
    label: "Techne Cmux Surface Destroy",
    description: "Destroy a named cmux surface (closes all panes, removes window). Clears cmux fields on gateway session record.",
    parameters: Type.Object({
      name: Type.String({ description: "Surface name to destroy" }),
      session_key: Type.Optional(Type.String({ description: "Gateway session key to clear cmux fields from (optional)" })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const result = spawnSync("cmux", ["surface-destroy", "--name", params.name], { encoding: "utf8" });
      if (result.status !== 0) {
        return { content: [{ type: "text", text: result.stderr || result.stdout }], isError: true };
      }
      if (params.session_key) {
        spawnSync("epi", ["gate", "sessions", "patch", params.session_key,
          "--clear-cmux"], { encoding: "utf8" });
      }
      return { content: [{ type: "text", text: `surface '${params.name}' destroyed\n${result.stdout}` }] };
    },
  });

  // ── Method name compliance note ──────────────────────────────────
  // Rust gate module method names MUST match what the Electron OmniPanel calls:
  // - "skills.list" (not "skills.status"), "skills.toggle", "skills.saveApiKey"
  // - "config.load" (not "config.get"), "config.save" (not "config.set")
  // - "cron.toggle" (not "cron.update") — OmniPanel uses toggle not update
  // These gaps are tracked in gate/parity.rs and must be resolved before
  // the OmniPanel can fully manage the gateway.
}

function shouldRegisterTilldone(): boolean {
  const mode = (process.env.EPI_TILLDONE_MODE ?? "").toLowerCase();
  if (["off", "false", "0", "disabled"].includes(mode)) {
    return false;
  }
  if (["on", "true", "1", "required"].includes(mode)) {
    return true;
  }

  const agentName = (process.env.EPI_AGENT_NAME ?? "").toLowerCase();
  const agentMode = (process.env.EPI_AGENT_MODE ?? "").toLowerCase();
  return agentName === "anima" || agentMode === "anima" || agentMode === "execution";
}

function registerPrimitiveTool(api: ExtensionAPI, p: PrimitiveDef) {
  // Generate tool name from primitive name
  // REMOVED: mprocs (→ cmux), gitbutler (→ worktrunk), notebooklm (→ aletheia_gnosis_query)
  // PENDING: ralph_tui → tildone (see docs/plans/2026-03-01-tilldone-dispatch-design.md)
  // NEW: epi_cli — pullthrough for all `epi` subcommands
  const toolNames: Record<string, string> = {
    tmux: "tmux_exec",
    cmux: "cmux_exec",
    bkmr_kbase: "bkmr_search",
    onecontext: "onecontext_inject",
    ralph_tui: "tildone_dispatch",   // PENDING: tildone migration
    worktrunk: "worktrunk_exec",
    epi_cli: "epi_run",              // epi CLI pullthrough primitive
  };

  const toolName = toolNames[p.name] || `${p.name}_exec`;
  const toolLabel = toolName.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  api.registerTool({
    name: toolName,
    label: toolLabel,
    description: `[${p.executionMode.toUpperCase()}] ${p.description}. Execution mode: ${p.executionMode}. Child extension: ${p.allowChildExtension}.`,
    parameters: Type.Object({
      command: Type.String({
        description: `Command or arguments to pass to ${p.name}`,
      }),
      args: Type.Optional(Type.Array(Type.String(), {
        description: "Additional arguments",
      })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      // Interactive primitives cannot be invoked via PI tool — require tmux/cmux pane
      if (p.executionMode === "interactive") {
        return {
          content: [{
            type: "text",
            text: `${p.name} is INTERACTIVE mode — cannot be invoked as a bounded tool. Use tmux/cmux pane directly.`,
          }],
          isError: true,
        };
      }

      // For bounded/background: delegate to shell
      const cmdArgs = [params.command, ...(params.args || [])];
      const result = spawnSync(p.name, cmdArgs, {
        encoding: "utf8",
        timeout: 30_000,
      });

      if (result.status !== 0) {
        return {
          content: [{ type: "text", text: `[${p.name}] FAILED (exit ${result.status})\n${result.stderr || result.stdout}` }],
          isError: true,
        };
      }
      if (!result.stdout && !result.stderr) {
        return {
          content: [{ type: "text", text: `[${p.name}] exited 0 but produced no output` }],
          isError: true,
        };
      }
      return {
        content: [{ type: "text", text: `[${p.name}] OK\n${result.stdout || result.stderr}` }],
      };
    },
  });
}
