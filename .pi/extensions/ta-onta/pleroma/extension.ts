import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { spawnSync } from "node:child_process";
import { PRIMITIVE_REGISTRY, type PrimitiveDef } from "./S2/pleroma-primitives.ts";

export async function pleromaExtension(api: ExtensionAPI) {
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
    description: "Start the S3 gateway WebSocket server on port 18794. Idempotent — safe to call if already running.",
    inputSchema: { type: "object", properties: {
      config_path: { type: "string", description: "Optional path to gateway config file" },
    }},
    async handler(input: { config_path?: string }) {
      const args = ["gate", "start"];
      if (input.config_path) args.push("--config", input.config_path);
      const result = spawnSync("epi", args, { encoding: "utf8" });
      return { content: [{ type: "text", text: result.stdout || result.stderr }], isError: result.status !== 0 };
    },
  });

  api.registerTool({
    name: "techne_gateway_stop",
    description: "Stop the S3 gateway WebSocket server gracefully.",
    inputSchema: { type: "object", properties: {} },
    async handler() {
      const result = spawnSync("epi", ["gate", "stop"], { encoding: "utf8" });
      return { content: [{ type: "text", text: result.stdout || result.stderr }], isError: result.status !== 0 };
    },
  });

  api.registerTool({
    name: "techne_gateway_status",
    description: "Get S3 gateway status: running state, port, TLS, active sessions and channel counts.",
    inputSchema: { type: "object", properties: {} },
    async handler() {
      const result = spawnSync("epi", ["gate", "status", "--json"], { encoding: "utf8" });
      return { content: [{ type: "text", text: result.stdout || result.stderr }], isError: result.status !== 0 };
    },
  });

  api.registerTool({
    name: "techne_session_list",
    description: "List active gateway sessions. Each session includes vault_now_path, channel bindings, agent identity.",
    inputSchema: { type: "object", properties: {
      active_minutes: { type: "integer", default: 60 },
      include_global: { type: "boolean", default: true },
    }},
    async handler(input: { active_minutes?: number; include_global?: boolean }) {
      const args = ["gate", "sessions", "list", "--json",
        "--active-minutes", String(input.active_minutes ?? 60)];
      if (input.include_global) args.push("--include-global");
      const result = spawnSync("epi", args, { encoding: "utf8" });
      return { content: [{ type: "text", text: result.stdout || result.stderr }], isError: result.status !== 0 };
    },
  });

  api.registerTool({
    name: "techne_session_patch",
    description: "Update a gateway session's label, thinking level, or verbose level.",
    inputSchema: { type: "object", properties: {
      session_key: { type: "string" },
      label: { type: "string" },
      thinking_level: { type: "string", enum: ["off", "minimal", "low", "medium", "high"] },
    }, required: ["session_key"] },
    async handler(input: { session_key: string; label?: string; thinking_level?: string }) {
      const args = ["gate", "sessions", "patch", input.session_key, "--json"];
      if (input.label) args.push("--label", input.label);
      if (input.thinking_level) args.push("--thinking-level", input.thinking_level);
      const result = spawnSync("epi", args, { encoding: "utf8" });
      return { content: [{ type: "text", text: result.stdout || result.stderr }], isError: result.status !== 0 };
    },
  });

  api.registerTool({
    name: "techne_logs_tail",
    description: "Tail the gateway log stream (last N lines).",
    inputSchema: { type: "object", properties: {
      limit: { type: "integer", default: 100 },
    }},
    async handler(input: { limit?: number }) {
      const result = spawnSync("epi", ["gate", "logs", "--tail", String(input.limit ?? 100)], { encoding: "utf8" });
      return { content: [{ type: "text", text: result.stdout || result.stderr }] };
    },
  });

  api.registerTool({
    name: "techne_debug_status",
    description: "Get gateway debug status summary (health snapshot, method availability).",
    inputSchema: { type: "object", properties: {} },
    async handler() {
      const result = spawnSync("epi", ["gate", "debug", "status", "--json"], { encoding: "utf8" });
      return { content: [{ type: "text", text: result.stdout || result.stderr }] };
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

  api.registerTool({
    name: toolName,
    description: `[${p.executionMode.toUpperCase()}] ${p.description}. Execution mode: ${p.executionMode}. Child extension: ${p.allowChildExtension}.`,
    inputSchema: {
      type: "object",
      properties: {
        command: {
          type: "string",
          description: `Command or arguments to pass to ${p.name}`,
        },
        args: {
          type: "array",
          items: { type: "string" },
          description: "Additional arguments",
        },
      },
      required: ["command"],
    },
    async handler(input: { command: string; args?: string[] }) {
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
      const cmdArgs = [input.command, ...(input.args || [])];
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
