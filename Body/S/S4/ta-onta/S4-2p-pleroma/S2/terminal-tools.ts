// Techne terminal/session tools — bounded S0 CLI surfaces over `epi agent tmux`.
//
// These REPLACE direct, ungoverned tmux/cmux execution. Every terminal tool
// routes through the gateway-governed `epi agent tmux` command and carries an
// explicit `session_key`. The authority law (encoded in
// TECHNE_TERMINAL_CAPABILITY_MATRIX) is:
//
//   • session_state_authority: "gateway"  — terminal state is owned by the
//     gateway SessionStore + terminal lease, never by the tool itself.
//   • raw_terminal_authority: false        — no tool may shell `tmux send-keys`,
//     `tmux kill-session`, or any raw multiplexer command directly. `_send`
//     specifically requires an explicit lease and routes through
//     `epi agent tmux send --session-key …`, never `tmux send-keys`.
//
// This module holds the pure registry + argv builder + capability matrix so it
// can be unit-tested without the PI extension runtime (typebox / pi-coding-agent).
// extension.ts imports TECHNE_TERMINAL_TOOLS + buildTerminalArgv and binds each
// entry to a PI tool.

export interface TerminalToolParam {
  /** Parameter key on the tool's params object. */
  name: string;
  /** Whether the parameter must be present (validated in buildTerminalArgv). */
  required: boolean;
  /** Human-facing description surfaced in the PI tool schema. */
  description: string;
}

export interface TerminalToolDef {
  /** PI tool name (always `techne_terminal_*`). */
  name: string;
  /** PI tool label. */
  label: string;
  /** PI tool description. */
  description: string;
  /** `epi agent tmux <subcommand>` this tool drives. */
  subcommand: string;
  /** True only for `_send`: requires an explicit terminal lease. */
  requiresLease: boolean;
  /** Declared params (drives both schema and argv validation). */
  params: TerminalToolParam[];
}

const SESSION_KEY_PARAM: TerminalToolParam = {
  name: "session_key",
  required: true,
  description: "Gateway session key whose terminal binding this tool operates on (required).",
};

/**
 * The five bounded Techne terminal tools. Each requires `session_key` and
 * returns gateway-shaped JSON (the `--json` projection of `epi agent tmux …`).
 */
export const TECHNE_TERMINAL_TOOLS: TerminalToolDef[] = [
  {
    name: "techne_terminal_status",
    label: "Techne Terminal Status",
    description:
      "Report the gateway-governed terminal status for a session (lease state, attach state, pane binding). Routes through `epi agent tmux status --session-key …`; never reads raw tmux.",
    subcommand: "status",
    requiresLease: false,
    params: [SESSION_KEY_PARAM],
  },
  {
    name: "techne_terminal_inspect",
    label: "Techne Terminal Inspect",
    description:
      "Inspect the terminal binding for a session: tmux session name, window/pane id, lease owner and expiry. Routes through `epi agent tmux inspect --session-key …`.",
    subcommand: "inspect",
    requiresLease: false,
    params: [SESSION_KEY_PARAM],
  },
  {
    name: "techne_terminal_capture",
    label: "Techne Terminal Capture",
    description:
      "Capture the last N lines of a session's pane through the gateway capture policy (redacted, transcript-recorded as a capture handle — not raw unbounded output). Routes through `epi agent tmux capture --session-key … --lines N`.",
    subcommand: "capture",
    requiresLease: false,
    params: [
      SESSION_KEY_PARAM,
      { name: "lines", required: false, description: "Maximum lines to capture (default 200)." },
    ],
  },
  {
    name: "techne_terminal_send",
    label: "Techne Terminal Send",
    description:
      "Send literal text to a session's pane. REQUIRES an explicit terminal lease and routes ONLY through `epi agent tmux send --session-key … --lease-id …`; it never shells `tmux send-keys` directly. Refuses when the lease is absent.",
    subcommand: "send",
    requiresLease: true,
    params: [
      SESSION_KEY_PARAM,
      { name: "lease_id", required: true, description: "Explicit terminal lease id authorising the send (required)." },
      { name: "text", required: true, description: "Literal text to deliver to the pane." },
    ],
  },
  {
    name: "techne_terminal_abort",
    label: "Techne Terminal Abort",
    description:
      "Abort/interrupt the running process in a session's pane (interrupt sequence + terminal status patch through the gateway). Routes through `epi agent tmux abort --session-key …`.",
    subcommand: "abort",
    requiresLease: false,
    params: [SESSION_KEY_PARAM],
  },
];

/**
 * Build the `epi agent tmux …` argv for a terminal tool. The returned argv is
 * passed verbatim to `spawnSync("epi", argv)` by extension.ts.
 *
 * Invariants enforced here (so they hold for every caller):
 *   • A non-empty `session_key` is mandatory for every tool.
 *   • `_send` is refused without an explicit non-empty lease — there is no
 *     ungoverned path to deliver keystrokes.
 *   • The command always begins with `agent tmux <subcommand>`; this function
 *     can never emit a raw `tmux`/`cmux`/`send-keys` invocation.
 *
 * Throws (caller maps to an isError tool result) on any violation.
 */
export function buildTerminalArgv(toolName: string, params: Record<string, unknown> | undefined): string[] {
  const def = TECHNE_TERMINAL_TOOLS.find((t) => t.name === toolName);
  if (!def) {
    throw new Error(`unknown Techne terminal tool: ${toolName}`);
  }

  const sessionKey = params?.session_key;
  if (typeof sessionKey !== "string" || sessionKey.trim() === "") {
    throw new Error(`${toolName} requires a non-empty session_key`);
  }

  const argv = ["agent", "tmux", def.subcommand, "--session-key", sessionKey];

  if (def.requiresLease) {
    const lease = params?.lease_id;
    if (typeof lease !== "string" || lease.trim() === "") {
      throw new Error(
        `${toolName} requires an explicit lease_id — refusing ungoverned send (no tmux send-keys path exists)`,
      );
    }
    argv.push("--lease-id", lease);
  }

  if (def.subcommand === "capture") {
    const lines = params?.lines;
    const n = typeof lines === "number" && Number.isFinite(lines) && lines > 0 ? Math.floor(lines) : 200;
    argv.push("--lines", String(n));
  }

  if (def.subcommand === "send") {
    const text = params?.text;
    if (text === undefined || text === null) {
      throw new Error(`${toolName} requires text to send`);
    }
    argv.push("--text", String(text));
  }

  // Every terminal tool returns gateway-shaped JSON.
  argv.push("--json");
  return argv;
}

/**
 * Capability matrix entry for the Techne terminal tools, asserting the
 * authority law to any reviewer/validator. Lists every terminal tool under
 * Techne/Pleroma with `session_state_authority: "gateway"` and
 * `raw_terminal_authority: false`.
 */
export const TECHNE_TERMINAL_CAPABILITY_MATRIX = {
  owner_agent: "techne",
  carrier: "pleroma",
  coordinate: "S4-2'",
  layer: "S4-2'/Pleroma",
  cli_surface: "epi agent tmux",
  session_state_authority: "gateway" as const,
  raw_terminal_authority: false as const,
  tools: TECHNE_TERMINAL_TOOLS.map((t) => ({
    name: t.name,
    cli: `epi agent tmux ${t.subcommand} --session-key …`,
    requires_lease: t.requiresLease,
    session_state_authority: "gateway" as const,
    raw_terminal_authority: false as const,
  })),
};
