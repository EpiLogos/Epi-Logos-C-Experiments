#!/usr/bin/env node
/**
 * Coordinate: #5/S0 (canon parity probe — Track 00 hardening T18a / Tracks 09+17, data-spine §5.2)
 * Residency: .codex/scripts/canon-parity-probe.mjs
 * Position (#n): #5 — Integration; the parity law made runnable before it is gateable
 * Actualises: [[00-verification-harness-hardening]] T18 (a) — the law is
 *   `epi canon coord <c> --depth <d>` byte-identical with the bimba-mcp
 *   `spec_retrieve` surface across 6 coords × 3 depths. This probe runs the
 *   CLI half against the gateway's `s2'.coordinate.resolve` (the wire surface
 *   reachable from this repo) and prints the honest diff table. It is NOT
 *   wired into verify-all: parity needs the live MCP surface and is expected
 *   red on the current basis — wiring it red would poison the gate.
 * Public surface: COORDS, DEPTHS, compareShapes, probeParity, main;
 *   CLI: node .codex/scripts/canon-parity-probe.mjs [--port N] [--epi-bin PATH]
 * Does NOT own: the canon ladder law (epi-cli canon), the resolver
 *   (S2 graph-services), gate wiring (verify-all.mjs).
 * Contract: exit 0 = byte-identical everywhere; 1 = divergence (with table);
 *   2 = services unavailable (reported, never faked).
 */

import { execFileSync, spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { connect } from "node:net";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = resolve(SCRIPT_DIR, "..", "..");
const DEFAULT_EPI_BIN =
  process.env.EPI_BIN ??
  join(REPO_ROOT, "Body", "S", "S0", "epi-cli", "target", "debug", "epi");
const DEFAULT_PORT = 18937;
const EXISTING_GATEWAY_PORT = 18794;

/** The 6 coords × 3 depths basis (data-spine §5.2 names the 6×3 shape). */
export const COORDS = ["#0", "#2'", "#5", "M4", "S3'", "C4"];
export const DEPTHS = ["token", "square", "resolve"];

function portOpen(port, timeoutMs = 1500) {
  return new Promise((resolvePort) => {
    const socket = connect({ port, host: "127.0.0.1" }, () => {
      socket.destroy();
      resolvePort(true);
    });
    socket.setTimeout(timeoutMs, () => {
      socket.destroy();
      resolvePort(false);
    });
    socket.on("error", () => {
      socket.destroy();
      resolvePort(false);
    });
  });
}

async function waitForPort(port, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await portOpen(port, 500)) return;
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`port ${port} did not open within ${timeoutMs}ms`);
}

/**
 * Structural comparison of the two JSON payloads: byte identity first (the
 * law), then a top-level key diff so divergence is legible, not just boolean.
 */
export function compareShapes(cliText, gatewayResult) {
  const gatewayText = JSON.stringify(gatewayResult);
  const byteIdentical = cliText === gatewayText;
  let cliKeys = [];
  try {
    cliKeys = Object.keys(JSON.parse(cliText)).sort();
  } catch {
    /* CLI emitted non-JSON — keys stay empty */
  }
  const gwKeys =
    gatewayResult && typeof gatewayResult === "object"
      ? Object.keys(gatewayResult).sort()
      : [];
  return {
    byteIdentical,
    cliOnlyKeys: cliKeys.filter((k) => !gwKeys.includes(k)),
    gatewayOnlyKeys: gwKeys.filter((k) => !cliKeys.includes(k)),
    sharedKeys: cliKeys.filter((k) => gwKeys.includes(k)),
  };
}

/** Run the full 6×3 comparison against a live gateway websocket. */
export async function probeParity({ port, epiBin = DEFAULT_EPI_BIN, perCallTimeoutMs = 4000 } = {}) {
  const ws = new WebSocket(`ws://127.0.0.1:${port}`);
  const pending = new Map();
  let nextId = 1;
  ws.addEventListener("message", (event) => {
    let frame;
    try {
      frame = JSON.parse(String(event.data));
    } catch {
      return;
    }
    if (frame.type === "res" && pending.has(frame.id)) {
      pending.get(frame.id)(frame);
      pending.delete(frame.id);
    }
  });
  const request = (method, params = {}) =>
    new Promise((resolveReq) => {
      const id = nextId++;
      const timer = setTimeout(() => {
        pending.delete(id);
        resolveReq(null);
      }, perCallTimeoutMs);
      pending.set(id, (frame) => {
        clearTimeout(timer);
        resolveReq(frame);
      });
      ws.send(JSON.stringify({ type: "req", id, method, params }));
    });

  await new Promise((resolveOpen, rejectOpen) => {
    ws.addEventListener("open", resolveOpen, { once: true });
    ws.addEventListener("error", () => rejectOpen(new Error(`websocket to :${port} failed`)), { once: true });
  });
  const hello = await request("connect");
  if (!hello || hello.error) {
    ws.close();
    throw new Error(`connect handshake failed: ${JSON.stringify(hello?.error ?? "timeout")}`);
  }

  const rows = [];
  for (const coordinate of COORDS) {
    const gwFrame = await request("s2'.coordinate.resolve", { coordinate });
    const gatewayResult = gwFrame?.error
      ? { error: gwFrame.error }
      : gwFrame?.result ?? null;
    for (const depth of DEPTHS) {
      let cliText;
      try {
        cliText = execFileSync(epiBin, ["canon", "coord", coordinate, "--depth", depth], {
          encoding: "utf8",
        }).trim();
      } catch (err) {
        cliText = `<epi canon coord failed: ${err.message}>`;
      }
      rows.push({ coordinate, depth, ...compareShapes(cliText, gatewayResult) });
    }
  }
  ws.close();
  return rows;
}

export function formatParityTable(rows) {
  const header = ["coord", "depth", "byte-identical", "cli-only keys", "gateway-only keys"];
  const body = rows.map((r) => [
    r.coordinate,
    r.depth,
    r.byteIdentical ? "YES" : "no",
    r.cliOnlyKeys.join(",") || "—",
    r.gatewayOnlyKeys.join(",") || "—",
  ]);
  const all = [header, ...body];
  const widths = header.map((_, c) => Math.max(...all.map((row) => row[c].length)));
  return all
    .map((row) => row.map((cell, c) => cell.padEnd(widths[c])).join("  ·  "))
    .join("\n");
}

function parseArgs(argv) {
  const opts = { port: DEFAULT_PORT, epiBin: DEFAULT_EPI_BIN };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--port") opts.port = Number(argv[(i += 1)]);
    else if (argv[i] === "--epi-bin") opts.epiBin = resolve(argv[(i += 1)]);
    else throw new Error(`unknown argument '${argv[i]}'`);
  }
  return opts;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const neo4jUp = await portOpen(7687);
  console.log(`[canon-parity] neo4j :7687 ${neo4jUp ? "reachable" : "DOWN"} (s2'.coordinate.resolve itself is kernel-side)`);

  let port = null;
  let gateway = null;
  let stateRoot = null;
  if (await portOpen(EXISTING_GATEWAY_PORT)) {
    port = EXISTING_GATEWAY_PORT;
    console.log(`[canon-parity] using already-running gateway on :${port}`);
  } else {
    stateRoot = mkdtempSync(join(tmpdir(), "canon-parity-"));
    gateway = spawn(opts.epiBin, ["gate", "start", "--port", String(opts.port)], {
      env: { ...process.env, EPI_GATE_STATE_ROOT: stateRoot },
      stdio: ["ignore", "pipe", "pipe"],
    });
    try {
      await waitForPort(opts.port, 20000);
    } catch (err) {
      if (gateway.exitCode === null) gateway.kill();
      rmSync(stateRoot, { recursive: true, force: true });
      console.error(`[canon-parity] UNAVAILABLE — could not spawn gateway from ${opts.epiBin}: ${err.message}`);
      process.exit(2);
    }
    port = opts.port;
    console.log(`[canon-parity] spawned throwaway gateway on :${port} (state ${stateRoot})`);
  }

  let rows;
  try {
    rows = await probeParity({ port, epiBin: opts.epiBin });
  } catch (err) {
    console.error(`[canon-parity] UNAVAILABLE — ${err.message}`);
    process.exit(2);
  } finally {
    if (gateway && gateway.exitCode === null) gateway.kill();
    if (stateRoot) rmSync(stateRoot, { recursive: true, force: true });
  }

  console.log(formatParityTable(rows));
  const identical = rows.filter((r) => r.byteIdentical).length;
  const ok = identical === rows.length;
  console.log(
    `[canon-parity] ${identical}/${rows.length} byte-identical — ${ok ? "PARITY HOLDS" : "PARITY DOES NOT HOLD on the current basis"}`,
  );
  process.exit(ok ? 0 : 1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
