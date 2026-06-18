import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { spawnSync } from "node:child_process";
import { PRIMITIVE_REGISTRY, type PrimitiveDef } from "./S2/pleroma-primitives.ts";
import {
  TECHNE_TERMINAL_TOOLS,
  buildTerminalArgv,
  type TerminalToolDef,
} from "./S2/terminal-tools.ts";

export { TECHNE_TERMINAL_CAPABILITY_MATRIX } from "./S2/terminal-tools.ts";

const Type = {
  String: (options: Record<string, unknown> = {}) => ({ type: "string", ...options }),
  Integer: (options: Record<string, unknown> = {}) => ({ type: "integer", ...options }),
  Boolean: (options: Record<string, unknown> = {}) => ({ type: "boolean", ...options }),
  Literal: (value: string | number | boolean, options: Record<string, unknown> = {}) => ({ const: value, ...options }),
  Array: (items: Record<string, unknown>, options: Record<string, unknown> = {}) => ({ type: "array", items, ...options }),
  Object: (properties: Record<string, unknown>, options: Record<string, unknown> = {}) => ({
    type: "object",
    properties,
    required: Object.entries(properties)
      .filter(([, schema]) => !(schema as any).__optional)
      .map(([name]) => name),
    ...options,
  }),
  Optional: (schema: Record<string, unknown>) => ({ ...schema, __optional: true }),
  Union: (schemas: Record<string, unknown>[], options: Record<string, unknown> = {}) => ({ anyOf: schemas, ...options }),
};

export type VamaShaktiClass = "egregore" | "sprite" | "daemon" | "mantra";

export type VamaShaktiSummonRequest = {
  entity_coordinate: string;
  arena_scene_key: string;
  vama_shakti_class: VamaShaktiClass;
  lifecycle_mode?: "ephemeral" | "warm" | "promoted";
  requesting_actor: "anima_scene_setup" | "warm_shakti_admin";
  capability_profile?: unknown;
};

export type GatewayContext = {
  gateway?: {
    resolve?: (method: string, params: Record<string, unknown>) => Promise<unknown>;
  };
};

export const vamaShaktiSummonRequestSchema = Type.Object({
  entity_coordinate: Type.String({
    description: "Required :World entity coordinate, resolved through s5'.gnostic.resolve per DR-WORLD-1.",
  }),
  arena_scene_key: Type.String({
    description: "Arena scene key that will receive the Vama Shakti presence.",
  }),
  vama_shakti_class: Type.Union([
    Type.Literal("egregore"),
    Type.Literal("sprite"),
    Type.Literal("daemon"),
    Type.Literal("mantra"),
  ], { description: "Closed classifier set per DR-VAMA-6." }),
  lifecycle_mode: Type.Optional(Type.Union([
    Type.Literal("ephemeral"),
    Type.Literal("warm"),
    Type.Literal("promoted"),
  ], { default: "ephemeral" })),
  requesting_actor: Type.Union([
    Type.Literal("anima_scene_setup"),
    Type.Literal("warm_shakti_admin"),
  ], { description: "Operator-only: Anima scene setup or user-direct warm-shakti admin path." }),
  capability_profile: Type.Optional(Type.Object({}, {
    description: "Forbidden by DR-VAMA-5; included only so the refusal law can reject override attempts explicitly.",
  })),
}, { additionalProperties: false });

const VAMA_SHAKTI_CLASSES = new Set<VamaShaktiClass>(["egregore", "sprite", "daemon", "mantra"]);

export function vamaShaktiRefusalLaw(req: Partial<VamaShaktiSummonRequest>) {
  if (Object.prototype.hasOwnProperty.call(req, "capability_profile")) {
    return "Refused per DR-VAMA-5: Vama Shaktis carry a frozen dialogue-only capability profile; capability_profile overrides are not accepted.";
  }
  if (!VAMA_SHAKTI_CLASSES.has(req.vama_shakti_class as VamaShaktiClass)) {
    return "Refused per DR-VAMA-6: vama_shakti_class must be one of egregore/sprite/daemon/mantra.";
  }
  if (!resolvesAsWorldCoordinate(req.entity_coordinate)) {
    return "Refused per DR-VAMA-3 + DR-WORLD-1: entity_coordinate must resolve to a :World entity. Promote or propose it through hen_entity_candidate_propose first.";
  }
  return null;
}

export async function pleromaExtension(api: ExtensionAPI) {
  if (shouldRegisterDamageControl()) {
    const { default: registerDamageControl } = await import("./S2/damage-control.ts");
    registerDamageControl(api);
  }
  if (shouldRegisterTilldone()) {
    const { default: registerTilldone } = await import("./S2/tilldone.ts");
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

  // ── Techne terminal tools — bounded S0 CLI over `epi agent tmux` ──
  // These REPLACE the stale, ungoverned direct tmux/cmux execution paths.
  // Every tool requires `session_key`, routes through `epi agent tmux …`,
  // and returns gateway-shaped JSON. `techne_terminal_send` additionally
  // requires an explicit lease and NEVER shells raw tmux keystrokes directly.
  // Authority law (TECHNE_TERMINAL_CAPABILITY_MATRIX): session_state_authority
  // = "gateway", raw_terminal_authority = false.
  for (const tool of TECHNE_TERMINAL_TOOLS) {
    registerTerminalTool(api, tool);
  }

  api.registerTool({
    name: "techne_vama_summon",
    label: "Techne Vama Summon",
    description: "Summon a Vama Shakti — the active animating descent of a /World entity into dialogue — under one of four canonical classifiers (egregore/sprite/daemon/mantra). Operator-only; Anima-dispatched during arena scene-setup OR user-direct via warm-shakti admin path.",
    parameters: vamaShaktiSummonRequestSchema,
    schema: vamaShaktiSummonRequestSchema,
    operatorRole: "psyche-template",
    refusalLaw: vamaShaktiRefusalLaw,
    async execute(_id: string, params: VamaShaktiSummonRequest, _signal?: unknown, _onUpdate?: unknown, ctx?: GatewayContext) {
      const refusal = vamaShaktiRefusalLaw(params);
      if (refusal) {
        return { content: [{ type: "text", text: refusal }], isError: true };
      }
      if (ctx?.gateway?.resolve) {
        const resolved = await ctx.gateway.resolve("s5'.gnostic.resolve", { coordinate: params.entity_coordinate });
        if (!isWorldResolution(resolved)) {
          return {
            content: [{
              type: "text",
              text: "Refused per DR-VAMA-3 + DR-WORLD-1: s5'.gnostic.resolve did not return a :World entity. Promote or propose it through hen_entity_candidate_propose first.",
            }],
            isError: true,
          };
        }
      }
      return {
        content: [{
          type: "text",
          text: "techne_vama_summon preflight accepted; VamaShaktiHandle construction is gated by Tranche 41.3 identity derivation and Tranche 41.4 ad-hoc PI registration.",
        }],
        isError: true,
      };
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
    description: "Assign a pane on a cmux surface by CF identity. Sets CF_IDENTITY env in the pane so spawned agents inherit constitutional type. When session_key is given, the resulting cmux_pane_id is written through gateway SESSION state (sessions.patch, a real session-level cmux field) and the write is proven before success is reported. The legacy ungoverned team-patch path (a CLI surface that never existed) has been removed.",
    parameters: Type.Object({
      surface: Type.String({ description: "Target surface name" }),
      cf: Type.String({ description: "CF identity code (e.g. '(0/1/2)', '(4.0-4.4/5)')" }),
      agent: Type.Optional(Type.String({ description: "Agent type to launch in the pane (e.g. 'claude-code')" })),
      session_key: Type.Optional(Type.String({ description: "Gateway session key to write cmux_pane_id through sessions.patch (optional; required to persist placement)" })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const args = ["pane-assign", "--surface", params.surface, "--cf", params.cf];
      if (params.agent) args.push("--agent", params.agent);
      const result = spawnSync("cmux", args, { encoding: "utf8" });
      if (result.status !== 0) {
        return { content: [{ type: "text", text: result.stderr || result.stdout }], isError: true };
      }
      // Persist cmux_pane_id through GATEWAY SESSION state (not the stale
      // team-patch surface). Prove the write succeeded before reporting OK.
      const paneMatch = result.stdout.match(/pane[_-]?id[:\s]+(\S+)/i);
      if (paneMatch && params.session_key) {
        const patch = spawnSync("epi", ["gate", "sessions", "patch",
          "--session-id", params.session_key, "--cmux-pane-id", paneMatch[1], "--json"], { encoding: "utf8" });
        if (patch.status !== 0) {
          return {
            content: [{ type: "text", text: `pane assigned on surface '${params.surface}' but gateway sessions.patch FAILED — placement not persisted\n${patch.stderr || patch.stdout}` }],
            isError: true,
          };
        }
        return { content: [{ type: "text", text: `pane assigned CF=${params.cf} on surface '${params.surface}', cmux_pane_id=${paneMatch[1]} persisted via sessions.patch\n${patch.stdout}` }] };
      }
      return { content: [{ type: "text", text: `pane assigned CF=${params.cf} on surface '${params.surface}'\n${result.stdout}` }] };
    },
  });

  api.registerTool({
    name: "techne_cmux_layout_set",
    label: "Techne Cmux Layout Set",
    description: "Set the visual layout mode for a cmux surface by CFP thread type. This is a NON-AUTHORITATIVE cmux projection: CFP thread type is ephemeral pane geometry, not gateway session state, so nothing is persisted. (The stale team-patch write — which targeted a CLI surface that does not exist — has been removed; there is no session-level cmux_cfp field to route through. If durable CFP persistence is needed, land `epi agent team patch` with tests.)",
    parameters: Type.Object({
      surface: Type.String({ description: "Target surface name" }),
      cfp: Type.String({ description: "CFP thread type (CFP0–CFP5, e.g. 'CFP1' for P-Thread tiled)" }),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const result = spawnSync("cmux", ["layout-set", "--surface", params.surface, "--cfp", params.cfp], { encoding: "utf8" });
      if (result.status !== 0) {
        return { content: [{ type: "text", text: result.stderr || result.stdout }], isError: true };
      }
      return { content: [{ type: "text", text: `layout set to ${params.cfp} on surface '${params.surface}' (ephemeral cmux projection — not persisted to gateway)\n${result.stdout}` }] };
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

function shouldRegisterDamageControl(): boolean {
  const mode = (process.env.EPI_DAMAGE_CONTROL_MODE ?? "").toLowerCase();
  return !["off", "false", "0", "disabled"].includes(mode);
}

function registerTerminalTool(api: ExtensionAPI, tool: TerminalToolDef) {
  // Build the params schema from the tool's declared param metadata.
  const props: Record<string, any> = {
    session_key: Type.String({ description: "Gateway session key whose terminal binding this tool operates on (required)." }),
  };
  if (tool.subcommand === "capture") {
    props.lines = Type.Optional(Type.Integer({ default: 200, description: "Maximum lines to capture (default 200)." }));
  }
  if (tool.requiresLease) {
    props.lease_id = Type.String({ description: "Explicit terminal lease id authorising the send (required)." });
  }
  if (tool.subcommand === "send") {
    props.text = Type.String({ description: "Literal text to deliver to the pane." });
  }

  api.registerTool({
    name: tool.name,
    label: tool.label,
    description: tool.description,
    parameters: Type.Object(props),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      let argv: string[];
      try {
        // buildTerminalArgv enforces session_key + lease invariants and can only
        // ever emit `agent tmux …` — never a raw tmux/cmux/send-keys command.
        argv = buildTerminalArgv(tool.name, params);
      } catch (err: any) {
        return { content: [{ type: "text", text: String(err?.message ?? err) }], isError: true };
      }
      const result = spawnSync("epi", argv, { encoding: "utf8" });
      return { content: [{ type: "text", text: result.stdout || result.stderr }], isError: result.status !== 0 };
    },
  });
}

function resolvesAsWorldCoordinate(coordinate: unknown): boolean {
  return typeof coordinate === "string" && /^(:World|\/World)(\/|:).+/.test(coordinate);
}

function isWorldResolution(resolved: unknown): boolean {
  if (!resolved || typeof resolved !== "object") {
    return false;
  }
  const record = resolved as Record<string, unknown>;
  const labels = Array.isArray(record.labels) ? record.labels : [];
  return record.label === "World" || record.kind === "World" || labels.includes("World") || labels.includes(":World");
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
