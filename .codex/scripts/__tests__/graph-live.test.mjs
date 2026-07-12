import assert from "node:assert/strict";
import test from "node:test";

import {
  neo4jEnv,
  parseBoltHostPort,
  resolveEpiPrefix,
  assertNodeRead,
  assertPropertyRead,
  REQUIRED_COORDINATE,
  REQUIRED_PROPERTY,
  VALUE_MARKERS,
} from "../graph-live.mjs";

// The env contract must match graph-services Neo4jConfig::from_env exactly —
// same var names, same defaults (uri bolt://localhost:7687, user neo4j, pw "").
test("neo4jEnv mirrors Neo4jConfig::from_env var names and defaults", () => {
  assert.deepEqual(neo4jEnv({}), {
    uri: "bolt://localhost:7687",
    user: "neo4j",
    password: "",
  });
  const custom = neo4jEnv({
    EPILOGOS_NEO4J_URI: "bolt://db.internal:7688",
    EPILOGOS_NEO4J_USER: "graph",
    EPILOGOS_NEO4J_PASSWORD: "s3cret",
  });
  assert.equal(custom.uri, "bolt://db.internal:7688");
  assert.equal(custom.user, "graph");
  assert.equal(custom.password, "s3cret");
});

test("parseBoltHostPort handles bolt/neo4j URIs, ports, auth, and IPv6", () => {
  assert.deepEqual(parseBoltHostPort("bolt://localhost:7687"), { host: "localhost", port: 7687 });
  assert.deepEqual(parseBoltHostPort("bolt://127.0.0.1:7687"), { host: "127.0.0.1", port: 7687 });
  assert.deepEqual(parseBoltHostPort("neo4j+s://graph.example.com"), {
    host: "graph.example.com",
    port: 7687,
  });
  assert.deepEqual(parseBoltHostPort("bolt://user:pw@db:7690/neo4j"), { host: "db", port: 7690 });
  assert.deepEqual(parseBoltHostPort("bolt://[::1]:7699"), { host: "::1", port: 7699 });
});

test("resolveEpiPrefix prefers the built debug binary, falls back to cargo run", () => {
  const withBin = resolveEpiPrefix("/repo", () => true);
  assert.equal(withBin.length, 1);
  assert.match(withBin[0], /target\/debug\/epi$/);
  const withoutBin = resolveEpiPrefix("/repo", () => false);
  assert.equal(withoutBin[0], "cargo");
  assert.ok(withoutBin.includes("run"));
  assert.ok(withoutBin.includes("--manifest-path"));
});

// Real captured output of `epi --json graph query M2-3` against live Neo4j.
const LIVE_NODE_OUTPUT = JSON.stringify({
  depth: 1,
  detected_coordinates: ["M2-3"],
  query: "M2-3",
  requested_level: 1,
  results: [
    {
      coordinate: "M2-3",
      disclosure_level: 2,
      family: "M",
      layer: "COORDINATE",
      name: "Decans System",
      ql_position: 2,
      s0_pithy: "",
      uuid: "39bada97-7c53-598d-a422-6fadb7085eb1",
      vault_path: "",
    },
  ],
});

test("assertNodeRead accepts a real live coordinate node read", () => {
  const node = assertNodeRead(LIVE_NODE_OUTPUT);
  assert.equal(node.coordinate, "M2-3");
  assert.equal(node.name, "Decans System");
  assert.equal(node.uuid, "39bada97-7c53-598d-a422-6fadb7085eb1");
});

test("assertNodeRead rejects an empty-graph read (coordinate not resolved)", () => {
  const empty = JSON.stringify({ detected_coordinates: [], results: [] });
  assert.throws(() => assertNodeRead(empty), /did not detect M2-3/);
});

test("assertNodeRead rejects a node stripped of its graph-only identity", () => {
  const nameless = JSON.stringify({
    detected_coordinates: ["M2-3"],
    results: [{ coordinate: "M2-3", name: "", uuid: "x" }],
  });
  assert.throws(() => assertNodeRead(nameless), /has no name/);
  const uuidless = JSON.stringify({
    detected_coordinates: ["M2-3"],
    results: [{ coordinate: "M2-3", name: "Decans System", uuid: "" }],
  });
  assert.throws(() => assertNodeRead(uuidless), /has no uuid/);
});

test("assertNodeRead rejects non-JSON output", () => {
  assert.throws(() => assertNodeRead("connect failed: refused"), /was not JSON/);
});

// Real captured output of `epi --json graph cypher …` against live Neo4j —
// the q_3 register value carries the Fire/Quintessence branch naming.
const LIVE_PROP_OUTPUT = JSON.stringify({
  mode: "read",
  guard: "allowed-read",
  row_count: 1,
  truncated: false,
  rows: [
    'Row { attributes: BoltMap { value: {BoltString { value: "q3" }: String(BoltString { value: ' +
      '"Structurally M2-3 is a strict nested product: five elemental domains (Fire #2-3-1, Earth ' +
      "#2-3-2, Air #2-3-3, Water #2-3-4, Quintessence #2-3-5/0), each holding three zodiacal signs" +
      '…" }), BoltString { value: "coord" }: String(BoltString { value: "M2-3" })} } }',
  ],
});

test("assertPropertyRead accepts a real live q_3 register read", () => {
  const result = assertPropertyRead(LIVE_PROP_OUTPUT);
  assert.equal(result.rowCount, 1);
  assert.deepEqual(result.markers, VALUE_MARKERS);
});

test("assertPropertyRead rejects a zero-row (empty graph) result", () => {
  const zero = JSON.stringify({ mode: "read", guard: "allowed-read", row_count: 0, rows: [] });
  assert.throws(() => assertPropertyRead(zero), /matched 0 rows/);
});

test("assertPropertyRead rejects a row missing the live branch naming (fixture/static serve)", () => {
  const stale = JSON.stringify({
    mode: "read",
    guard: "allowed-read",
    row_count: 1,
    rows: ['Row { q3: "some placeholder text without the real register value", coord: "M2-3" }'],
  });
  assert.throws(() => assertPropertyRead(stale), /missing live branch naming/);
});

test("assertPropertyRead rejects a non-read (unconstrained) path", () => {
  const write = JSON.stringify({ mode: "write", guard: "allowed-write", row_count: 1, rows: [] });
  assert.throws(() => assertPropertyRead(write), /constrained read path/);
});

test("the pinned coordinate + property are the live-graph contract", () => {
  assert.equal(REQUIRED_COORDINATE, "M2-3");
  assert.equal(REQUIRED_PROPERTY, "q_3_four_three_three_two_nesting");
  assert.ok(VALUE_MARKERS.includes("Fire #2-3-1"));
  assert.ok(VALUE_MARKERS.includes("Quintessence"));
});
