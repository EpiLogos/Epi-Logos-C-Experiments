import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { join } from "node:path";
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

type PluginRuntimeIndex = {
  plugins?: PluginRuntimeEntry[];
};

type PluginRuntimeEntry = {
  name: string;
  version: string;
  root: string;
};

type HookConfig = {
  type: string;
  command?: string;
  timeout?: number;
};

type HookMatcherGroup = {
  matcher?: string;
  hooks?: HookConfig[];
};

type HooksDocument = {
  hooks?: Record<string, HookMatcherGroup[]>;
};

type BridgeEventName =
  | "Setup"
  | "SessionStart"
  | "UserPromptSubmit"
  | "PostToolUse"
  | "PreCompact"
  | "Stop"
  | "SessionEnd";

declare global {
  var __epiPluginRuntimeBridgeRegistered: boolean | undefined;
}

function runtimePath() {
  return process.env.EPI_AGENT_PLUGIN_RUNTIME_PATH;
}

function bridgeLogPath() {
  const agentDir = process.env.EPI_AGENT_DIR || process.env.PI_CODING_AGENT_DIR;
  return agentDir ? join(agentDir, "plugin-runtime-events.jsonl") : undefined;
}

function logBridgeEvent(event: Record<string, unknown>) {
  const logPath = bridgeLogPath();
  if (!logPath) {
    return;
  }
  appendFileSync(logPath, `${JSON.stringify({ ts: new Date().toISOString(), ...event })}\n`, "utf8");
}

function loadRuntimePlugins(): PluginRuntimeEntry[] {
  const path = runtimePath();
  if (!path || !existsSync(path)) {
    return [];
  }
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as PluginRuntimeIndex;
    return parsed.plugins ?? [];
  } catch (error) {
    logBridgeEvent({
      phase: "runtime-load-error",
      path,
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}

function loadHooks(pluginRoot: string): HooksDocument {
  const path = join(pluginRoot, "hooks", "hooks.json");
  if (!existsSync(path)) {
    return {};
  }
  try {
    return JSON.parse(readFileSync(path, "utf8")) as HooksDocument;
  } catch (error) {
    logBridgeEvent({
      phase: "hooks-load-error",
      pluginRoot,
      path,
      error: error instanceof Error ? error.message : String(error),
    });
    return {};
  }
}

function matches(group: HookMatcherGroup, target?: string) {
  const matcher = group.matcher?.trim();
  if (!matcher || matcher === "*") {
    return true;
  }
  if (!target) {
    return false;
  }
  return matcher.split("|").some((part) => part.trim() === target);
}

function executeShellCommand(command: string, pluginRoot: string, stdinPayload: string, timeoutSeconds = 60) {
  return new Promise<{ exitCode: number | null; stdout: string; stderr: string; timedOut: boolean }>((resolve) => {
    const shell = process.platform === "win32" ? "cmd.exe" : "sh";
    const shellArgs = process.platform === "win32" ? ["/d", "/s", "/c", command] : ["-lc", command];
    const child = spawn(shell, shellArgs, {
      cwd: pluginRoot,
      env: {
        ...process.env,
        CLAUDE_PLUGIN_ROOT: pluginRoot,
      },
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) {
        return;
      }
      child.kill("SIGTERM");
      settled = true;
      resolve({ exitCode: null, stdout, stderr, timedOut: true });
    }, timeoutSeconds * 1000);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.stdin.on("error", () => {
      // Hooks can exit before reading stdin. Treat that as hook-level failure,
      // not a bridge crash, and let the close handler record the exit code.
    });
    child.on("error", (error) => {
      if (settled) {
        return;
      }
      clearTimeout(timer);
      settled = true;
      resolve({
        exitCode: 1,
        stdout,
        stderr: `${stderr}${error instanceof Error ? error.message : String(error)}`,
        timedOut: false,
      });
    });
    child.on("close", (exitCode) => {
      if (settled) {
        return;
      }
      clearTimeout(timer);
      settled = true;
      resolve({ exitCode, stdout, stderr, timedOut: false });
    });

    try {
      child.stdin.write(stdinPayload);
      child.stdin.end();
    } catch {
      child.stdin.end();
    }
  });
}

async function runHookEvent(eventName: BridgeEventName, payload: Record<string, unknown>, matcherTarget?: string) {
  const stdinPayload = JSON.stringify(payload);
  for (const plugin of loadRuntimePlugins()) {
    const groups = loadHooks(plugin.root).hooks?.[eventName] ?? [];
    for (const group of groups) {
      if (!matches(group, matcherTarget)) {
        continue;
      }
      for (const hook of group.hooks ?? []) {
        if (hook.type !== "command" || !hook.command) {
          continue;
        }
        const result = await executeShellCommand(hook.command, plugin.root, stdinPayload, hook.timeout ?? 60);
        logBridgeEvent({
          phase: "hook-executed",
          eventName,
          matcherTarget,
          plugin: plugin.name,
          version: plugin.version,
          command: hook.command,
          exitCode: result.exitCode,
          timedOut: result.timedOut,
          stdout: result.stdout.trim(),
          stderr: result.stderr.trim(),
        });
      }
    }
  }
}

export async function main(api: ExtensionAPI) {
  if (globalThis.__epiPluginRuntimeBridgeRegistered) {
    return;
  }
  globalThis.__epiPluginRuntimeBridgeRegistered = true;

  api.on("session_start", async (_event, ctx) => {
    await runHookEvent("Setup", { source: "pi", event: "session_start", cwd: ctx.cwd });
    await runHookEvent("SessionStart", { source: "pi", event: "session_start", cwd: ctx.cwd }, "startup");
  });

  api.on("before_agent_start", async (event, ctx) => {
    await runHookEvent("UserPromptSubmit", {
      source: "pi",
      event: "before_agent_start",
      cwd: ctx.cwd,
      prompt: event.prompt,
      systemPrompt: event.systemPrompt,
    });
  });

  api.on("tool_result", async (event, ctx) => {
    await runHookEvent("PostToolUse", {
      source: "pi",
      event: "tool_result",
      cwd: ctx.cwd,
      toolName: event.toolName,
      input: event.input,
      content: event.content,
      isError: event.isError,
    }, "*");
  });

  api.on("session_before_compact", async (event, ctx) => {
    await runHookEvent("PreCompact", {
      source: "pi",
      event: "session_before_compact",
      cwd: ctx.cwd,
      branchEntryCount: event.branchEntries.length,
      hasCustomInstructions: Boolean(event.customInstructions),
    });
  });

  api.on("agent_end", async (event, ctx) => {
    const summary = event.messages
      .filter((message) => message.role === "assistant")
      .map((message) => String(message.content ?? ""))
      .join("\n\n");
    await runHookEvent("Stop", {
      source: "pi",
      event: "agent_end",
      cwd: ctx.cwd,
      summary,
    });
  });

  api.on("session_shutdown", async (_event, ctx) => {
    await runHookEvent("SessionEnd", {
      source: "pi",
      event: "session_shutdown",
      cwd: ctx.cwd,
    });
  });
}

export default async function pluginRuntimeBridge(api: ExtensionAPI) {
  await main(api);
}
