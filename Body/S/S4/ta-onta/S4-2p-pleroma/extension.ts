import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { spawnSync } from "node:child_process";
import { PRIMITIVE_REGISTRY, type PrimitiveDef } from "./S2/pleroma-primitives.ts";
import {
  TECHNE_TERMINAL_TOOLS,
  buildTerminalArgv,
  type TerminalToolDef,
} from "./S2/terminal-tools.ts";
import { isValidVakAddress, type VakAddress } from "../shared/vak_address.ts";

export { TECHNE_TERMINAL_CAPABILITY_MATRIX } from "./S2/terminal-tools.ts";

function epiBinary(): string {
  return process.env.EPI_BIN || "epi";
}

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

// ── Tranche 12.30 — tmux topology mirrors Anima dispatch decisions ───
// The tmux topology is NOT declared statically in YAML; it is the runtime
// reflection of Anima's per-CF dispatch decisions (wave-2 scout 6:
// "nesting is genuinely in execution"). Anima reads VAK state at dispatch
// time, computes a (team, guardian-subset), and emits a
// `tmux_topology_decision` event (Tranche 12.23, dispatch-policy.ts) carrying
// a tmux topology map. Pleroma is the consuming seat: it allocates the
// session/window/pane/layout that mirrors that decision.
//
// Level mapping (per scout 6 + user direction):
//   tmux session  → one per DAY            (`epi-{day-date}`)
//   tmux window   → one per Anima dispatch (`w-{role}` / `w-aletheia-{CF}`)
//   tmux pane     → one per child task     (`p-{role}-{task_id}`)
//   tmux layout   → follows CFP nesting    (CFP0 single | CFP1 split-h | CFP3 grid)
//
// Because Pleroma only ever allocates what Anima emits, the topology is
// observably LEARNED: as Mercurius Elo (Tranche 12.20) shifts dispatch
// policy, the same task-class yields a different window/pane shape over
// months — e.g. a deweighted `(eros, CF2, …)` simply produces no
// `tmux_topology_decision` for eros, so no `w-eros` window is ever opened.

export type CfpLayout = "CFP0" | "CFP1" | "CFP3";

export interface CmuxTopologyMap {
  day_session: string;            // tmux session: "epi-2026-06-15"
  anima_dispatch_window: string;  // tmux window: "w-nous" | "w-aletheia-CF2" | …
  child_task_pane: string;        // tmux pane: "p-{role}-{task_id}"
  cfp_layout: CfpLayout;          // CFP0 single | CFP1 split-h | CFP3 grid
  vak_address: VakAddress;        // full VAK context for the dispatch
}

// Envelope Anima emits at dispatch time and Pleroma consumes here. The
// `child_dispatch_command` + identity fields carry the same persistence
// surface as `agent --persist` (Tranche 12.03), so the spawned pane inherits
// gateway session + Khora write authority (DR-S5-ONE-1).
export interface TmuxTopologyDecisionEvent {
  event: "tmux_topology_decision";
  topology: CmuxTopologyMap;
  session_key?: string;            // gateway session key → EPI_GATE_SESSION_KEY
  role?: string;                   // constitutional / guardian role → EPI_AGENT_NAME
  agent?: string;                  // agent runtime to launch in the pane
  child_dispatch_command?: string; // Pi child-dispatch command injected into the pane
}

const CFP_LAYOUT_MODES: Record<CfpLayout, string> = {
  CFP0: "single",   // single pane, full window
  CFP1: "split-h",  // split-horizontal — parallel agents
  CFP3: "grid",     // grid/tiled — fusion of N child tasks
};

export function cfpLayoutMode(cfp: string): string | null {
  return Object.prototype.hasOwnProperty.call(CFP_LAYOUT_MODES, cfp)
    ? CFP_LAYOUT_MODES[cfp as CfpLayout]
    : null;
}

// `[pleroma.tmux_topology] keep_window_for_session_lifetime` (default true):
// panes are NEVER auto-destroyed on dispatch completion so the trace stays
// observable; a window may close only when its last pane completes AND keep
// is disabled. Pleroma's topology_apply only ALLOCATES, so the default keep
// behaviour is satisfied structurally — this reader exposes the override.
export function tmuxTopologyKeepWindow(): boolean {
  const mode = (process.env.EPI_PLEROMA_TMUX_KEEP_WINDOW ?? "").toLowerCase();
  if (["off", "false", "0", "disabled"].includes(mode)) return false;
  return true; // default: keep window for session lifetime so trace remains visible
}

// The S0 CLI is the only process authority. Pleroma sends the typed decision
// across that membrane; it never shells tmux or cmux itself.
export function topologyCommandArgs(
  decision: TmuxTopologyDecisionEvent,
  openVisibleProjection: boolean,
): string[] {
  const { topology } = decision;
  if (!decision.session_key?.trim()) {
    throw new Error("tmux_topology_decision requires session_key so the pane receives a gateway terminal lease");
  }
  const args = [
    "agent", "tmux", "topology",
    "--session-key", decision.session_key,
    "--day-session", topology.day_session,
    "--window", topology.anima_dispatch_window,
    "--pane", topology.child_task_pane,
    "--cfp-layout", topology.cfp_layout,
    "--cf", topology.vak_address.cf,
    "--cp", topology.vak_address.cp,
  ];
  if (decision.role) args.push("--role", decision.role);
  if (decision.agent) args.push("--agent", decision.agent);
  if (decision.child_dispatch_command) args.push("--child-dispatch-command", decision.child_dispatch_command);
  if (openVisibleProjection) args.push("--visible");
  args.push("--json");
  return args;
}

// Accept either a bare tmux topology map or a full tmux_topology_decision
// envelope; normalise to the envelope shape. Returns a refusal string when
// the map / VAK frame is malformed (so the tool can fail loud, not silent).
export function normalizeTopologyDecision(input: unknown): TmuxTopologyDecisionEvent | string {
  if (!input || typeof input !== "object") {
    return "Refused: tmux_topology_decision payload must be an object carrying a tmux topology map.";
  }
  const record = input as Record<string, unknown>;
  const topology = (record.event === "tmux_topology_decision" ? record.topology : record) as
    | Record<string, unknown>
    | undefined;
  if (!topology || typeof topology !== "object") {
    return "Refused: tmux topology map missing from tmux_topology_decision payload.";
  }
  for (const key of ["day_session", "anima_dispatch_window", "child_task_pane", "cfp_layout"]) {
    if (typeof topology[key] !== "string" || !(topology[key] as string).trim()) {
      return `Refused: tmux topology map.${key} must be a non-empty string mirroring the Anima dispatch decision.`;
    }
  }
  if (!cfpLayoutMode(topology.cfp_layout as string)) {
    return `Refused: tmux topology map.cfp_layout must be one of CFP0/CFP1/CFP3 (single/split-h/grid); got '${String(topology.cfp_layout)}'.`;
  }
  if (!isValidVakAddress(topology.vak_address)) {
    return "Refused: tmux topology map.vak_address must be a valid VakAddress (the dispatch's full VAK context).";
  }
  const envelope = record.event === "tmux_topology_decision" ? record : {};
  return {
    event: "tmux_topology_decision",
    topology: topology as unknown as CmuxTopologyMap,
    session_key: typeof envelope.session_key === "string" ? envelope.session_key : undefined,
    role: typeof envelope.role === "string" ? envelope.role : undefined,
    agent: typeof envelope.agent === "string" ? envelope.agent : undefined,
    child_dispatch_command:
      typeof envelope.child_dispatch_command === "string" ? envelope.child_dispatch_command : undefined,
  };
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

  // Register every bounded primitive as a PI tool.
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

  // ── Tranche 12.30 — topology apply (consumes tmux_topology_decision) ──
  // The single Pleroma entry point where an Anima decision crosses into the
  // gateway-governed S0 tmux allocator. cmux is deliberately absent from the
  // lifecycle: an optional visible projection merely attaches cmux to the
  // same tmux socket after the lease-backed pane already exists.
  api.registerTool({
    name: "techne_tmux_topology_apply",
    label: "Techne Tmux Topology Apply",
    description: "Consume one Anima `tmux_topology_decision` through `epi agent tmux topology`. tmux owns the durable day session, role window, child pane, layout, gateway terminal lease, and child command. `open_visible_projection` only opens cmux as an interactive attachment to that same tmux session; it never creates a second session or a headless/visible branch.",
    parameters: Type.Object({
      decision: Type.Object({
        event: Type.Optional(Type.Literal("tmux_topology_decision")),
        topology: Type.Optional(Type.Object({
          day_session: Type.String({ description: "Per-day tmux session 'epi-{day-date}'" }),
          anima_dispatch_window: Type.String({ description: "One per Anima dispatch decision: 'w-nous' | 'w-aletheia-CF2' | …" }),
          child_task_pane: Type.String({ description: "One per child task: 'p-{role}-{task_id}'" }),
          cfp_layout: Type.Union([Type.Literal("CFP0"), Type.Literal("CFP1"), Type.Literal("CFP3")], {
            description: "CFP0 single | CFP1 split-h (parallel) | CFP3 grid (fusion)",
          }),
          vak_address: Type.Object({}, { additionalProperties: true, description: "Full VAK context for the dispatch" }),
        }, { additionalProperties: true })),
      }, {
        additionalProperties: true,
        description: "A tmux_topology_decision envelope, or a bare tmux topology map, mirroring one Anima dispatch decision.",
      }),
      session_key: Type.String({ description: "Gateway session key required for the tmux terminal lease and EPI_GATE_SESSION_KEY in the pane." }),
      role: Type.Optional(Type.String({ description: "Constitutional/guardian role → EPI_AGENT_NAME (overrides any role on the envelope)" })),
      agent: Type.Optional(Type.String({ description: "Agent runtime to launch in the pane (e.g. 'claude-code')" })),
      child_dispatch_command: Type.Optional(Type.String({ description: "Pi child-dispatch command injected into the pane after allocation" })),
      open_visible_projection: Type.Optional(Type.Boolean({ default: false, description: "Open cmux as an interactive attachment to the already-live tmux session. This does not change process lifecycle." })),
    }),
    async execute(_id: string, params: any, _signal?: unknown, _onUpdate?: unknown, _ctx?: unknown) {
      const envelope = {
        ...(params.decision && params.decision.event === "tmux_topology_decision"
          ? params.decision
          : { event: "tmux_topology_decision", topology: params.decision?.topology ?? params.decision }),
      };
      // Top-level params override envelope identity/dispatch fields.
      if (params.session_key !== undefined) envelope.session_key = params.session_key;
      if (params.role !== undefined) envelope.role = params.role;
      if (params.agent !== undefined) envelope.agent = params.agent;
      if (params.child_dispatch_command !== undefined) envelope.child_dispatch_command = params.child_dispatch_command;

      const normalized = normalizeTopologyDecision(envelope);
      if (typeof normalized === "string") {
        return { content: [{ type: "text", text: normalized }], isError: true };
      }
      try {
        const command = topologyCommandArgs(normalized, params.open_visible_projection === true);
        const result = spawnSync(epiBinary(), command, { encoding: "utf8" });
        const text = result.stdout || result.stderr || "epi agent tmux topology returned no output";
        return { content: [{ type: "text", text }], isError: result.status !== 0 };
      } catch (error) {
        return { content: [{ type: "text", text: error instanceof Error ? error.message : String(error) }], isError: true };
      }
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
