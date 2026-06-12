import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  TECHNE_TERMINAL_TOOLS,
  buildTerminalArgv,
  TECHNE_TERMINAL_CAPABILITY_MATRIX,
} from "../S2/terminal-tools.ts";

const here = dirname(fileURLToPath(import.meta.url));
const EXTENSION_SRC = readFileSync(resolve(here, "../extension.ts"), "utf8");

const EXPECTED_TOOLS = [
  "techne_terminal_status",
  "techne_terminal_inspect",
  "techne_terminal_capture",
  "techne_terminal_send",
  "techne_terminal_abort",
];

describe("Techne terminal tools (12.06)", () => {
  it("registers exactly the five techne_terminal_* tools", () => {
    const names = TECHNE_TERMINAL_TOOLS.map((t) => t.name).sort();
    assert.deepEqual(names, [...EXPECTED_TOOLS].sort());
  });

  it("extension.ts binds the terminal tools to PI tool registration", () => {
    // The extension imports the registry and registers each entry.
    assert.match(EXTENSION_SRC, /from "\.\/S2\/terminal-tools\.ts"/);
    assert.match(EXTENSION_SRC, /TECHNE_TERMINAL_TOOLS/);
    assert.match(EXTENSION_SRC, /registerTerminalTool\(api, tool\)/);
    assert.match(EXTENSION_SRC, /buildTerminalArgv\(tool\.name, params\)/);
  });

  it("every terminal tool requires session_key and invokes `epi agent tmux …`", () => {
    for (const tool of TECHNE_TERMINAL_TOOLS) {
      const params: Record<string, unknown> = { session_key: "agent:anima:main" };
      if (tool.requiresLease) params.lease_id = "lease-123";
      if (tool.subcommand === "send") params.text = "ls\n";

      const argv = buildTerminalArgv(tool.name, params);
      // Always routes through `epi agent tmux <subcommand> --session-key …`.
      assert.deepEqual(argv.slice(0, 3), ["agent", "tmux", tool.subcommand]);
      const keyIdx = argv.indexOf("--session-key");
      assert.ok(keyIdx >= 0, `${tool.name} must pass --session-key`);
      assert.equal(argv[keyIdx + 1], "agent:anima:main");
      // Gateway-shaped JSON projection.
      assert.ok(argv.includes("--json"), `${tool.name} must request --json`);
      // It can NEVER emit a raw multiplexer command.
      assert.ok(!argv.includes("send-keys"), `${tool.name} must not use send-keys`);
      assert.ok(argv[0] !== "tmux" && argv[0] !== "cmux", `${tool.name} must not shell tmux/cmux directly`);
    }
  });

  it("refuses any terminal tool without a session_key", () => {
    for (const tool of TECHNE_TERMINAL_TOOLS) {
      assert.throws(
        () => buildTerminalArgv(tool.name, {}),
        /requires a non-empty session_key/,
        `${tool.name} must refuse missing session_key`,
      );
    }
  });

  it("techne_terminal_send requires an explicit lease and uses --lease-id (never send-keys)", () => {
    // Missing lease → refused.
    assert.throws(
      () => buildTerminalArgv("techne_terminal_send", { session_key: "s", text: "hi" }),
      /requires an explicit lease_id/,
    );
    // With lease → routes through `epi agent tmux send … --lease-id … --text …`.
    const argv = buildTerminalArgv("techne_terminal_send", {
      session_key: "agent:anima:main",
      lease_id: "lease-xyz",
      text: "echo hi",
    });
    assert.deepEqual(argv.slice(0, 3), ["agent", "tmux", "send"]);
    assert.ok(argv.includes("--lease-id"));
    assert.equal(argv[argv.indexOf("--lease-id") + 1], "lease-xyz");
    assert.ok(argv.includes("--text"));
    assert.ok(!argv.join(" ").includes("send-keys"));
  });

  it("techne_terminal_capture passes a bounded --lines window", () => {
    const argv = buildTerminalArgv("techne_terminal_capture", { session_key: "s", lines: 50 });
    assert.ok(argv.includes("--lines"));
    assert.equal(argv[argv.indexOf("--lines") + 1], "50");
    // Defaults when omitted.
    const dflt = buildTerminalArgv("techne_terminal_capture", { session_key: "s" });
    assert.equal(dflt[dflt.indexOf("--lines") + 1], "200");
  });

  it("capability matrix lists terminal tools under Techne/Pleroma with gateway authority", () => {
    assert.equal(TECHNE_TERMINAL_CAPABILITY_MATRIX.owner_agent, "techne");
    assert.equal(TECHNE_TERMINAL_CAPABILITY_MATRIX.carrier, "pleroma");
    assert.equal(TECHNE_TERMINAL_CAPABILITY_MATRIX.session_state_authority, "gateway");
    assert.equal(TECHNE_TERMINAL_CAPABILITY_MATRIX.raw_terminal_authority, false);

    const matrixNames = TECHNE_TERMINAL_CAPABILITY_MATRIX.tools.map((t) => t.name).sort();
    assert.deepEqual(matrixNames, [...EXPECTED_TOOLS].sort());
    for (const t of TECHNE_TERMINAL_CAPABILITY_MATRIX.tools) {
      assert.equal(t.session_state_authority, "gateway");
      assert.equal(t.raw_terminal_authority, false);
      assert.match(t.cli, /^epi agent tmux /);
    }
  });

  it("no stale `gate teams patch` or `tmux send-keys` live path remains in extension.ts", () => {
    // Mirrors: rg -n "gate teams patch|tmux send-keys" extension.ts
    assert.ok(!/gate teams patch/.test(EXTENSION_SRC), "stale `gate teams patch` must be gone");
    assert.ok(!/tmux send-keys/.test(EXTENSION_SRC), "no `tmux send-keys` live path allowed");
    // The repaired pane-assign routes through the real sessions.patch surface.
    assert.match(EXTENSION_SRC, /gate", "sessions", "patch"/);
  });
});
