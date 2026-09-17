#!/usr/bin/env node
/**
 * Coordinate: #5/S0 (verification harness — Track 00 live-graph stage, harness-g-class)
 * Residency: .codex/scripts/graph-live.mjs
 * Position (#n): #5 — Integration; the live-graph gate the K/W/UF/D classes never had
 * Actualises: ARCHITECT LAW (2026-07-12) — the live Neo4j Bimba graph is the
 *   baseline ontology and the epi CLI is THE integrated surface. This stage
 *   proves CLI -> graph-services -> live Neo4j in one pass:
 *     (1) a bolt connectivity probe against the SAME env contract the CLI uses
 *         (Neo4jConfig::from_env — EPILOGOS_NEO4J_URI/USER/PASSWORD);
 *     (2) an end-to-end coordinate node read (`epi --json graph query M2-3`)
 *         asserting the live node projection (name + uuid are graph-only data);
 *     (3) an end-to-end property read (`epi --json graph cypher …`) asserting
 *         the live node carries the real `q_3_four_three_three_two_nesting`
 *         register — its Fire #2-3-1 … Quintessence branch naming lives ONLY in
 *         the graph, so a fixture/static-JSON serve can never satisfy it.
 *   Track 00 law: a live-graph suite that cannot reach Neo4j FAILS loud — it is
 *   never a silent skip. Registered in verify-all as the `graph-live` suite and
 *   unioned into class-G tranche gates by verify-tranche.mjs.
 * Public surface: neo4jEnv, parseBoltHostPort, resolveEpiPrefix, assertNodeRead,
 *   assertPropertyRead, REQUIRED_COORDINATE, REQUIRED_PROPERTY, VALUE_MARKERS,
 *   tcpProbe, runEpiJson, run, main;
 *   CLI: node .codex/scripts/graph-live.mjs
 * Does NOT own: the Neo4j connection law (Neo4jConfig::from_env, S2); the graph
 *   read semantics (graph-services); the class registry (verification-classes.json).
 * Contract: every check is a REAL read of live data — a run that would pass with
 *   Neo4j absent is the exact graph-bypass cheat this stage exists to refuse.
 */

import { spawn } from "node:child_process";
import net from "node:net";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = resolve(SCRIPT_DIR, "..", "..");

/** The live coordinate + register the controller confirmed populated. */
export const REQUIRED_COORDINATE = "M2-3";
export const REQUIRED_PROPERTY = "q_3_four_three_three_two_nesting";
/** Branch naming that lives ONLY inside the q_3 property value (data-only). */
export const VALUE_MARKERS = ["Fire #2-3-1", "Quintessence"];

const EPI_DEBUG_BIN = join(REPO_ROOT, "Body", "S", "S0", "epi-cli", "target", "debug", "epi");
const EPI_MANIFEST = join(REPO_ROOT, "Body", "S", "S0", "epi-cli", "Cargo.toml");
const TCP_TIMEOUT_MS = Number(process.env.GRAPH_LIVE_TCP_TIMEOUT_MS ?? 4000);
const EPI_TIMEOUT_MS = Number(process.env.GRAPH_LIVE_EPI_TIMEOUT_MS ?? 120_000);

/**
 * The Neo4j connection contract, byte-identical to graph-services
 * Neo4jConfig::from_env (Body/S/S2/graph-services/src/lib.rs) — same env var
 * names, same defaults. The stage reads what the CLI reads; nothing invented.
 */
export function neo4jEnv(env = process.env) {
  return {
    uri: env.EPILOGOS_NEO4J_URI || "bolt://localhost:7687",
    user: env.EPILOGOS_NEO4J_USER || "neo4j",
    password: env.EPILOGOS_NEO4J_PASSWORD ?? "",
  };
}

/** Parse host + port from a bolt/neo4j URI (default port 7687). */
export function parseBoltHostPort(uri) {
  const stripped = String(uri).replace(/^[a-zA-Z0-9+]+:\/\//, "");
  const authless = stripped.includes("@") ? stripped.slice(stripped.indexOf("@") + 1) : stripped;
  const hostPort = authless.split("/")[0];
  let host = hostPort;
  let port = 7687;
  if (hostPort.startsWith("[")) {
    // bracketed IPv6, optional :port after the closing bracket
    const close = hostPort.indexOf("]");
    host = hostPort.slice(1, close);
    const rest = hostPort.slice(close + 1);
    if (rest.startsWith(":")) port = Number(rest.slice(1));
  } else if (hostPort.includes(":")) {
    const idx = hostPort.lastIndexOf(":");
    host = hostPort.slice(0, idx);
    port = Number(hostPort.slice(idx + 1));
  }
  if (!host) host = "localhost";
  if (!Number.isFinite(port) || port <= 0) port = 7687;
  return { host, port };
}

/** epi invocation prefix: prefer the built debug binary, else `cargo run`. */
export function resolveEpiPrefix(repoRoot = REPO_ROOT, exists = existsSync) {
  const bin = join(repoRoot, "Body", "S", "S0", "epi-cli", "target", "debug", "epi");
  if (exists(bin)) return [bin];
  return ["cargo", "run", "--quiet", "--manifest-path", EPI_MANIFEST, "--"];
}

/**
 * Validate `epi --json graph query <coord>` output — the coordinate node read.
 * The live node's `name` and `uuid` are graph-only data; an empty/absent graph
 * cannot produce them. Returns { coordinate, name, uuid } or throws.
 */
export function assertNodeRead(jsonText, coordinate = REQUIRED_COORDINATE) {
  let payload;
  try {
    payload = JSON.parse(jsonText);
  } catch (err) {
    throw new Error(`graph query output was not JSON (${err.message}): ${clip(jsonText)}`);
  }
  const detected = Array.isArray(payload.detected_coordinates) ? payload.detected_coordinates : [];
  if (!detected.includes(coordinate)) {
    throw new Error(
      `graph query did not detect ${coordinate} (detected: ${JSON.stringify(detected)}) — the live graph did not resolve the coordinate`,
    );
  }
  const results = Array.isArray(payload.results) ? payload.results : [];
  const node = results.find((r) => r && r.coordinate === coordinate);
  if (!node) {
    throw new Error(
      `graph query returned no result row for ${coordinate} (rows: ${results.length}) — coordinate absent from live Neo4j`,
    );
  }
  if (typeof node.name !== "string" || node.name.trim() === "") {
    throw new Error(
      `${coordinate} live node has no name — a real Bimba node carries one (got ${JSON.stringify(node.name)})`,
    );
  }
  if (typeof node.uuid !== "string" || node.uuid.trim() === "") {
    throw new Error(
      `${coordinate} live node has no uuid — the graph-only identity field is missing (got ${JSON.stringify(node.uuid)})`,
    );
  }
  return { coordinate, name: node.name, uuid: node.uuid };
}

/**
 * Validate `epi --json graph cypher …` output — the property read. Asserts the
 * constrained read path ran, exactly one row matched the live coordinate, and
 * the q_3 register value carries its data-only branch naming. The markers are
 * NOT present in the query string, so finding them proves live-graph content,
 * not query echo. Returns { rowCount, markers } or throws.
 */
export function assertPropertyRead(jsonText, { markers = VALUE_MARKERS } = {}) {
  let payload;
  try {
    payload = JSON.parse(jsonText);
  } catch (err) {
    throw new Error(`graph cypher output was not JSON (${err.message}): ${clip(jsonText)}`);
  }
  if (payload.mode !== "read" || payload.guard !== "allowed-read") {
    throw new Error(
      `graph cypher did not run the constrained read path (mode=${payload.mode}, guard=${payload.guard})`,
    );
  }
  if (payload.row_count !== 1) {
    throw new Error(
      `graph cypher matched ${payload.row_count} rows for ${REQUIRED_COORDINATE}, expected exactly 1 — live node missing or duplicated`,
    );
  }
  const rowsText = Array.isArray(payload.rows) ? payload.rows.join("\n") : JSON.stringify(payload.rows);
  const missing = markers.filter((m) => !rowsText.includes(m));
  if (missing.length > 0) {
    throw new Error(
      `${REQUIRED_COORDINATE}.${REQUIRED_PROPERTY} value is missing live branch naming ${JSON.stringify(missing)} — the property is not carrying real graph data (fixture/static serve would fail here)`,
    );
  }
  return { rowCount: payload.row_count, markers };
}

function clip(text, max = 400) {
  const s = String(text);
  return s.length <= max ? s : `${s.slice(0, max)}… [${s.length} bytes]`;
}

/** Raw TCP reachability probe against the bolt host:port. Resolves boolean. */
export function tcpProbe(host, port, timeout = TCP_TIMEOUT_MS) {
  return new Promise((resolveProbe) => {
    const socket = net.connect({ host, port });
    let settled = false;
    const done = (ok) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolveProbe(ok);
    };
    socket.setTimeout(timeout);
    socket.once("connect", () => done(true));
    socket.once("timeout", () => done(false));
    socket.once("error", () => done(false));
  });
}

/** Spawn epi with the given args; resolve { code, stdout, stderr }. */
export function runEpiJson(argv, { cwd = REPO_ROOT, env = process.env } = {}) {
  return new Promise((resolveRun) => {
    const [bin, ...args] = argv;
    const child = spawn(bin, args, { cwd, env, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    let settled = false;
    const finish = (code, note) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolveRun({ code, stdout, stderr: note ? `${stderr}\n${note}` : stderr });
    };
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      finish(1, `[graph-live] timed out after ${EPI_TIMEOUT_MS}ms`);
    }, EPI_TIMEOUT_MS);
    child.stdout.on("data", (c) => (stdout += String(c)));
    child.stderr.on("data", (c) => (stderr += String(c)));
    child.on("error", (err) => finish(1, `[graph-live] failed to spawn ${bin}: ${err.message}`));
    child.on("close", (code) => finish(code ?? 1));
  });
}

/**
 * The live stage: connectivity probe → coordinate node read → property read.
 * Throws with an actionable message on any failure. Returns a summary object.
 */
export async function run({ env = process.env, log = console.log } = {}) {
  const conn = neo4jEnv(env);
  const { host, port } = parseBoltHostPort(conn.uri);

  log(`[graph-live] bolt connectivity probe → ${host}:${port} (from EPILOGOS_NEO4J_URI=${conn.uri})`);
  const reachable = await tcpProbe(host, port);
  if (!reachable) {
    throw new Error(
      `Neo4j unreachable at ${conn.uri} (${host}:${port}) — the graph-live stage cannot verify live-graph alignment. ` +
        `Bring up the S2 substrate: docker compose -f docker-compose.epi-s2.yml up -d. ` +
        `(Track 00 law: a live-graph suite that cannot reach the graph is a FAIL, never a silent skip.)`,
    );
  }
  log(`[graph-live] bolt port reachable`);

  const prefix = resolveEpiPrefix(REPO_ROOT);
  log(`[graph-live] epi surface: ${prefix[0] === "cargo" ? "cargo run (debug binary absent)" : prefix[0]}`);

  // (2) coordinate node read — CLI -> graph-services -> live Neo4j
  const nodeArgv = [...prefix, "--json", "graph", "query", REQUIRED_COORDINATE];
  const nodeRes = await runEpiJson(nodeArgv, { env });
  if (nodeRes.code !== 0) {
    throw new Error(
      `\`epi graph query ${REQUIRED_COORDINATE}\` exited ${nodeRes.code} — CLI could not read the live graph.\n${clip(nodeRes.stderr, 1200)}`,
    );
  }
  const node = assertNodeRead(nodeRes.stdout);
  log(`[graph-live] node read OK — ${node.coordinate} "${node.name}" (uuid ${node.uuid})`);

  // (3) property read — the live node must carry the real q_3 register
  const cypher =
    `MATCH (n) WHERE n.coordinate = '${REQUIRED_COORDINATE}' ` +
    `RETURN n.coordinate AS coord, n.${REQUIRED_PROPERTY} AS q3, size(keys(n)) AS keycount LIMIT 1`;
  const propArgv = [...prefix, "--json", "graph", "cypher", cypher];
  const propRes = await runEpiJson(propArgv, { env });
  if (propRes.code !== 0) {
    throw new Error(
      `\`epi graph cypher\` exited ${propRes.code} — CLI could not read ${REQUIRED_PROPERTY} from live Neo4j.\n${clip(propRes.stderr, 1200)}`,
    );
  }
  const prop = assertPropertyRead(propRes.stdout);
  log(
    `[graph-live] property read OK — ${REQUIRED_COORDINATE}.${REQUIRED_PROPERTY} carries live branch naming [${prop.markers.join(", ")}]`,
  );

  return { node, property: prop, host, port };
}

async function main() {
  try {
    await run();
    console.log("[graph-live] PASS — CLI -> graph-services -> live Neo4j verified (M2-3 real property read)");
    process.exit(0);
  } catch (err) {
    console.error(`[graph-live] FAIL: ${err.message}`);
    process.exit(1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
