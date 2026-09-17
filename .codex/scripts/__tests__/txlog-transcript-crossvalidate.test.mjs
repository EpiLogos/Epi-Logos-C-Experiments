import assert from "node:assert/strict";
import test from "node:test";

import {
  unescapeOnce,
  looksLikeGraphPayload,
  isBimbaPropertyKey,
  propertyFamily,
  isQRegister,
  isCoordinateShaped,
  scanSerialisedNodes,
  harvestPayloadText,
  harvestStructured,
  harvestClaudeLine,
  harvestCodexLine,
  RecordStore,
  parseReconstructionCypher,
  parseReconstructionAudit,
  diffAgainstReconstruction,
  loadMapCoordinates,
} from "../txlog-transcript-crossvalidate.mjs";

// ---------------------------------------------------------------------------
// BUG (a) — never re-serialise a record before unescaping.
// A first-pass script did `json.dumps(record)` and then stripped escapes; the
// dump had already re-escaped exactly what the strip was looking for, so every
// multi-line q-register value came back as a literal `\n` soup or was dropped.
// ---------------------------------------------------------------------------

const RAW_ESCAPED_PAYLOAD =
  '{\\"coordinate\\":\\"M2-3\\",\\"q_2b_ethical_interiorisation\\":\\"Picatrix line one.\\\\nFicino said \\\\\\"decan\\\\\\" here.\\"}';

test("BUG-A: unescaping the raw payload yields real newlines and real quotes", () => {
  const { nodes } = harvestPayloadText(RAW_ESCAPED_PAYLOAD);
  assert.equal(nodes.length, 1);
  const v = nodes[0].properties.q_2b_ethical_interiorisation;
  assert.ok(v.includes("Picatrix"), "Picatrix must survive");
  assert.ok(v.includes("Ficino"), "Ficino must survive");
  assert.ok(v.includes("\n"), "a REAL newline, not the two characters backslash+n");
  assert.ok(!v.includes("\\n"), "a literal \\n proves a re-escaping round trip happened");
  assert.ok(v.includes('"decan"'), "a REAL quote pair around decan");
});

test("BUG-A: stringify-before-unescape is provably lossy — the regression this pins", () => {
  // The defective first-pass pipeline: unescape EXACTLY once, then scan.
  const singlePass = (payload) => scanSerialisedNodes(unescapeOnce(payload));

  // Fed the raw transcript payload it works, which is why the bug hid.
  assert.equal(singlePass(RAW_ESCAPED_PAYLOAD).length, 1);

  // Fed the same record re-serialised first (python `json.dumps(record)`), the
  // dump re-escapes exactly what the unescape pass strips, so the single pass
  // only undoes the dump and the payload is still escaped. Nothing is found.
  const reSerialised = JSON.stringify(RAW_ESCAPED_PAYLOAD);
  assert.equal(singlePass(reSerialised).length, 0, "this is the silent data loss");

  // The extractor recovers from BOTH forms, and to the identical value.
  const fromRaw = harvestPayloadText(RAW_ESCAPED_PAYLOAD).nodes;
  const fromDumped = harvestPayloadText(reSerialised).nodes;
  assert.equal(fromDumped.length, 1);
  assert.deepEqual(fromDumped[0].properties, fromRaw[0].properties);
  assert.ok(fromDumped[0].properties.q_2b_ethical_interiorisation.includes("Picatrix"));

  // And the parsed path never routes through a re-serialisation at all.
  const parsedPath = harvestStructured(JSON.parse(unescapeOnce(RAW_ESCAPED_PAYLOAD)));
  assert.equal(
    parsedPath[0].properties.q_2b_ethical_interiorisation,
    fromRaw[0].properties.q_2b_ethical_interiorisation,
  );
});

test("BUG-A: unescapeOnce strips exactly one level, never two", () => {
  // `\\n` (escaped backslash + n) must become `\n` the two characters, NOT a newline.
  assert.equal(unescapeOnce(String.raw`a\\nb`), String.raw`a\nb`);
  assert.equal(unescapeOnce(String.raw`a\nb`), "a\nb");
  assert.equal(unescapeOnce(String.raw`A`), "A");
});

// ---------------------------------------------------------------------------
// BUG (b) — never pre-filter on the literal `"coordinate"`.
// Escaped payloads spell it \"coordinate\"; a quoted gate silently discarded
// every nested read-back before it was ever scanned.
// ---------------------------------------------------------------------------

test("BUG-B: the gate admits a payload whose anchor is only ever escaped", () => {
  assert.equal(RAW_ESCAPED_PAYLOAD.includes('"coordinate"'), false,
    "fixture must NOT contain the bare literal — otherwise the test proves nothing");
  assert.ok(RAW_ESCAPED_PAYLOAD.includes('\\"coordinate\\"'));
  assert.equal(looksLikeGraphPayload(RAW_ESCAPED_PAYLOAD), true);
  assert.equal(harvestPayloadText(RAW_ESCAPED_PAYLOAD).nodes.length, 1);
});

test("BUG-B: a doubly-escaped anchor is still recovered", () => {
  const doubled = JSON.stringify(RAW_ESCAPED_PAYLOAD);
  assert.equal(doubled.includes('"coordinate"'), false);
  const { nodes, escapeDepth } = harvestPayloadText(doubled);
  assert.equal(nodes.length, 1);
  assert.equal(nodes[0].coordinate, "M2-3");
  assert.ok(escapeDepth >= 1, "the scanner must have unescaped to find it");
});

test("BUG-B: an unescaped payload is recovered at depth 0 without being mangled", () => {
  const plain = '{"coordinate":"M2-3","q_3_x":"has a real\nnewline"}';
  const { nodes, escapeDepth } = harvestPayloadText(plain);
  assert.equal(escapeDepth, 0);
  assert.equal(nodes[0].properties.q_3_x, "has a real\nnewline");
});

// ---------------------------------------------------------------------------
// BUG (c) — the property window must be bidirectional.
// M2-3's q_3 register is serialised BEFORE its `coordinate` anchor; a
// forward-only window after the anchor lost it and every sibling like it.
// ---------------------------------------------------------------------------

test("BUG-C: a property serialised BEFORE the coordinate anchor is recovered", () => {
  const before = '{"q_3_four_three_three_two_nesting":"Fire #2-3-1 … Quintessence","coordinate":"M2-3","q_4_after":"tail"}';
  const nodes = scanSerialisedNodes(before);
  assert.equal(nodes.length, 1);
  assert.equal(nodes[0].coordinate, "M2-3");
  assert.ok("q_3_four_three_three_two_nesting" in nodes[0].properties, "the PRE-anchor key must survive");
  assert.ok("q_4_after" in nodes[0].properties, "the post-anchor key must survive too");
  assert.equal(Object.keys(nodes[0].properties).length, 2);
});

test("BUG-C: order-independence holds — both serialisations give the same map", () => {
  const a = scanSerialisedNodes('{"q_1_a":"A","coordinate":"M1-4","q_2_b":"B"}')[0].properties;
  const b = scanSerialisedNodes('{"coordinate":"M1-4","q_1_a":"A","q_2_b":"B"}')[0].properties;
  assert.deepEqual(a, b);
});

test("BUG-C: sibling records in one array do not bleed properties across anchors", () => {
  const rows = '{"rows":[{"q_0_x":"one","coordinate":"M0-1"},{"coordinate":"M0-2","q_0_y":"two"}]}';
  const nodes = scanSerialisedNodes(rows);
  assert.equal(nodes.length, 2);
  const byCoord = Object.fromEntries(nodes.map((n) => [n.coordinate, n.properties]));
  assert.deepEqual(byCoord["M0-1"], { q_0_x: "one" });
  assert.deepEqual(byCoord["M0-2"], { q_0_y: "two" });
});

// ---------------------------------------------------------------------------
// Key / coordinate law
// ---------------------------------------------------------------------------

test("property key law admits every real family and rejects code tokens", () => {
  for (const k of ["q_3_x_y", "qm_2_mirror", "c_0_source_coordinates", "t_0_thought_type",
    "l_4_lens", "m_1_processual_topology", "p_5_integration", "s_2_substrate", "q_2b_ethical_interiorisation"]) {
    assert.equal(isBimbaPropertyKey(k), true, `${k} must be admitted`);
  }
  for (const k of ["coordinate", "graphNodeId", "q_x_y", "createGraphNode", "q3_x", "Q_3_X", ""]) {
    assert.equal(isBimbaPropertyKey(k), false, `${k} must be rejected`);
  }
  assert.equal(propertyFamily("qm_2_mirror"), "qm_*");
  assert.equal(propertyFamily("q_2b_ethical_interiorisation"), "q_*");
  assert.equal(isQRegister("qm_2_mirror"), true);
  assert.equal(isQRegister("c_0_x"), false);
});

test("coordinate shape law admits the real forms and rejects prose", () => {
  for (const c of ["#", "#0", "#5", "M2-3", "M0-5-(5/0)", "M0-5-(5/0)-0", "S4-5'", "C0", "L", "M1-4",
    "M1-3-4.(4.0/1-4.4/5)", "M'", "CFP", "cpf", "cfp", "cs"]) {
    assert.equal(isCoordinateShaped(c), true, `${c} must be admitted`);
  }
  for (const c of ["", "a sentence with spaces", "12345", "-M2", "x".repeat(80), 42, null,
    "Family_C", "Weave_0_0"]) {
    assert.equal(isCoordinateShaped(c), false, `${JSON.stringify(c)} must be rejected`);
  }
});

test("a session-cache key is NOT admitted as a coordinate — the fabrication guard", () => {
  // This exact string reached the recovered dataset before the no-lowercase
  // rule: it starts with a family letter, carries digits, and uses only
  // otherwise-legal characters. It is a Redis key, not a coordinate.
  assert.equal(isCoordinateShaped("S2.kernel.resonance.agent-main.1779000001234.31"), false);
  assert.equal(isCoordinateShaped("S2"), true, "the real S2 coordinate must still pass");
  const store = new RecordStore();
  store.add({ coordinate: "S2.kernel.resonance.agent-main.1779000001234.31", properties: { q_1_a: "x" }, truncated: false, tier: "t", at: null });
  assert.equal(store.byCoordinate.size, 0);
  assert.equal(store.rejectedCoordinates.size, 1, "and it must be RECORDED as rejected, not silently dropped");
});

// ---------------------------------------------------------------------------
// Truncation tolerance — the harness cuts long read-backs mid-object
// ---------------------------------------------------------------------------

test("a read-back truncated mid-object still yields its recovered properties", () => {
  const cut = '{"node":{"coordinate":"M2-3","q_1_a":"complete","q_2_b":"this value was cut off mid-str';
  const nodes = scanSerialisedNodes(cut);
  assert.equal(nodes.length, 1);
  assert.equal(nodes[0].truncated, true);
  assert.equal(nodes[0].properties.q_1_a, "complete");
  assert.ok(nodes[0].properties.q_2_b.startsWith("this value was cut off"));
});

test("a `properties` child map is merged up onto its anchored parent", () => {
  const nested = '{"coordinate":"M3-2","properties":{"q_0_g":"ground","c_4_layer":"COORDINATE"}}';
  const nodes = scanSerialisedNodes(nested);
  assert.equal(nodes.length, 1);
  assert.deepEqual(nodes[0].properties, { q_0_g: "ground", c_4_layer: "COORDINATE" });
});

// ---------------------------------------------------------------------------
// Scalar arrays — `c_0_source_coordinates` is ALWAYS string[], and ~5% of the
// reconstruction's property surface is list-valued. Dropping them would both
// lose real data and falsify the diff as "only-reconstruction".
// ---------------------------------------------------------------------------

test("a scalar array property is recovered, in both the text and parsed paths", () => {
  const payload = '{"coordinate":"M2-1","c_0_source_coordinates":["M2-1-2-5","M2-1-5-5"],"m_2_1_p":["P","P\'"]}';
  const scanned = scanSerialisedNodes(payload)[0].properties;
  assert.deepEqual(scanned.c_0_source_coordinates, ["M2-1-2-5", "M2-1-5-5"]);
  assert.deepEqual(scanned.m_2_1_p, ["P", "P'"]);
  const structured = harvestStructured(JSON.parse(payload))[0].properties;
  assert.deepEqual(structured, scanned);
});

test("an array of objects is NOT mistaken for a scalar array", () => {
  const payload = '{"coordinate":"M2-2","c_0_x":[{"coordinate":"M2-2-1","q_0_inner":"child"}]}';
  const nodes = scanSerialisedNodes(payload);
  const parent = nodes.find((n) => n.coordinate === "M2-2");
  assert.equal("c_0_x" in parent.properties, false, "an object list must not be stored as a scalar array");
  assert.ok(nodes.find((n) => n.coordinate === "M2-2-1"), "the nested node must still be walked");
});

test("the reconstruction reader parses list values with escaped quotes", () => {
  const m = parseReconstructionCypher(
    "MATCH (n:Bimba {coordinate: 'M1-2'}) SET n += {\n"
    + "  `m_2_1_position_field_lens_hinge`: ['L0', 'L0\\''],\n"
    + "  `c_4_subsystem`: 1\n};\n",
  );
  assert.deepEqual(m.get("M1-2").get("m_2_1_position_field_lens_hinge"), ["L0", "L0'"]);
  assert.equal(m.get("M1-2").get("c_4_subsystem"), 1);
});

test("array values compare element-wise in the diff, not by identity", () => {
  const store = new RecordStore();
  store.add({ coordinate: "M2-1", properties: { c_0_source_coordinates: ["A", "B"], c_1_x: ["A"] }, truncated: false, tier: "t", at: null });
  const audit = new Map([["M2-1", new Map([["c_0_source_coordinates", 1], ["c_1_x", 2]])]]);
  const values = new Map([["M2-1", new Map([["c_0_source_coordinates", ["A", "B"]], ["c_1_x", ["B"]]])]]);
  const { rows } = diffAgainstReconstruction(store, audit, values);
  const v = Object.fromEntries(rows.map((r) => [r.property, r.verdict]));
  assert.equal(v.c_0_source_coordinates, "agree");
  assert.equal(v.c_1_x, "value-disagree");
});

// ---------------------------------------------------------------------------
// Harness readers
// ---------------------------------------------------------------------------

test("a Claude graph_set_property tool_use is harvested as an authoritative write", () => {
  const line = JSON.stringify({
    timestamp: "2026-06-20T10:00:00.000Z",
    message: { content: [{
      type: "tool_use", id: "toolu_1", name: "mcp__bimba-mcp__graph_set_property",
      input: { locator: { coordinate: "#0" }, set: { q_0_implicate_ground: "the void-pole", notAKey: "ignored" } },
    }] },
  });
  const { records, graphToolIds } = harvestClaudeLine(line, {});
  assert.equal(graphToolIds.get("toolu_1"), "mcp__bimba-mcp__graph_set_property");
  assert.equal(records.length, 1);
  assert.equal(records[0].tier, "mcp-write");
  assert.equal(records[0].coordinate, "#0");
  assert.deepEqual(records[0].properties, { q_0_implicate_ground: "the void-pole" });
});

test("a tool_result is only trusted as a read-back when its tool_use_id is a graph call", () => {
  const payload = JSON.stringify({ node: { coordinate: "M1-4", q_5_synthesis: "map compass lens" } });
  const line = JSON.stringify({
    timestamp: "2026-06-20T10:00:01.000Z",
    message: { content: [{ type: "tool_result", tool_use_id: "toolu_1", content: [{ type: "text", text: payload }] }] },
  });
  const correlated = harvestClaudeLine(line, { graphToolIds: new Map([["toolu_1", "mcp__bimba-mcp__graph_cypher"]]) });
  assert.equal(correlated.records.length, 1);
  assert.equal(correlated.records[0].tier, "mcp-readback");
  // Uncorrelated: it still passes the strict opportunistic gate, but is tiered as loose.
  const loose = harvestClaudeLine(line, { graphToolIds: new Map() });
  assert.ok(loose.records.every((r) => r.tier.startsWith("loose")));
});

test("an oversized tool_result declares its spill path so the real payload is followed", () => {
  const line = JSON.stringify({
    message: { content: [{
      type: "tool_result", tool_use_id: "toolu_9",
      content: [{ type: "text", text: "Error: result (350,819 characters) exceeds maximum allowed tokens. Output has been saved to /tmp/x/tool-results/mcp-bimba-mcp-graph_query-1.txt.\nFormat: Plain text" }],
    }] },
  });
  const { overflowPaths } = harvestClaudeLine(line, { graphToolIds: new Map([["toolu_9", "mcp__bimba-mcp__graph_query"]]) });
  assert.deepEqual(overflowPaths, ["/tmp/x/tool-results/mcp-bimba-mcp-graph_query-1.txt"],
    "the trailing sentence period must not be glued onto the path");
});

test("a Codex rollout line with an escaped tool payload is harvested", () => {
  const inner = JSON.stringify({ coordinate: "M5-4", q_4_kernel: "matheme" });
  const line = JSON.stringify({ timestamp: "2026-03-10T00:00:00Z", type: "response_item", payload: { name: "graph_cypher", arguments: inner } });
  const { records } = harvestCodexLine(line);
  assert.ok(records.length >= 1);
  assert.equal(records[0].coordinate, "M5-4");
  assert.equal(records[0].properties.q_4_kernel, "matheme");
});

// ---------------------------------------------------------------------------
// Store merge law
// ---------------------------------------------------------------------------

test("the store prefers a complete observation over a truncated one and counts variants", () => {
  const s = new RecordStore();
  s.add({ coordinate: "M2-3", properties: { q_1_a: "short" }, truncated: true, tier: "mcp-readback-text", at: "2026-06-01T00:00:00Z" });
  s.add({ coordinate: "M2-3", properties: { q_1_a: "the full value" }, truncated: false, tier: "mcp-readback", at: "2026-05-01T00:00:00Z" });
  const slot = s.byCoordinate.get("M2-3").get("q_1_a");
  assert.equal(slot.value, "the full value");
  assert.equal(slot.truncated, false);
  assert.equal(slot.variants.size, 2);
});

test("a record whose coordinate fails the shape law is recorded as rejected, never silently dropped", () => {
  const s = new RecordStore();
  s.add({ coordinate: "not a coordinate at all", properties: { q_1_a: "x" }, truncated: false, tier: "loose", at: null });
  assert.equal(s.byCoordinate.size, 0);
  assert.equal(s.rejectedCoordinates.get("not a coordinate at all"), 1);
});

test("totals split q_* and qm_* into the reported families", () => {
  const s = new RecordStore();
  s.add({ coordinate: "M1-1", properties: { q_0_a: "1", qm_0_b: "2", c_4_layer: "3", t_0_thought_type: "4" }, truncated: false, tier: "t", at: null });
  const t = s.totals();
  assert.equal(t.coordinates, 1);
  assert.equal(t.properties, 4);
  assert.equal(t.qRegisters, 2);
  assert.equal(t.byFamily["q_*"], 1);
  assert.equal(t.byFamily["qm_*"], 1);
  assert.equal(t.byFamily["c_*"], 1);
  assert.equal(t.byFamily["t_*"], 1);
});

// ---------------------------------------------------------------------------
// Reconstruction readers + diff
// ---------------------------------------------------------------------------

const RECON_SAMPLE = `// header
MATCH (n:Bimba {coordinate: 'M0-5-(5/0)'}) SET n += {
  \`c_0_quality\`: 'Manas/Psyche - Techne',
  \`c_4_subsystem\`: 0,
  \`q_1_x\`: 'it\\'s quoted'
};

MATCH (n:Bimba {coordinate: 'M2-3'}) SET n += {
  \`q_1_a\`: 'reconstruction value'
};
`;

test("the T54.02 cypher reader recovers coordinates, escaped quotes and numbers", () => {
  const m = parseReconstructionCypher(RECON_SAMPLE);
  assert.equal(m.size, 2);
  assert.equal(m.get("M0-5-(5/0)").get("c_0_quality"), "Manas/Psyche - Techne");
  assert.equal(m.get("M0-5-(5/0)").get("c_4_subsystem"), 0);
  assert.equal(m.get("M0-5-(5/0)").get("q_1_x"), "it's quoted");
  assert.equal(m.get("M2-3").get("q_1_a"), "reconstruction value");
});

test("the T54.02 audit reader builds the presence set", () => {
  const audit = parseReconstructionAudit(JSON.stringify([
    { coordinate: "M2-3", property: "q_1_a", tx: 59199 },
    { coordinate: "M2-3", property: "q_2_b", tx: 37498 },
  ]));
  assert.equal(audit.get("M2-3").size, 2);
  assert.equal(audit.get("M2-3").get("q_1_a"), 59199);
});

test("the Map projection loads as the independent coordinate-coverage reference", () => {
  const coords = loadMapCoordinates();
  // The track states the Map carries 996 coordinates; the base restore was
  // verified at 996/996 present. That figure is the reference, so pin it.
  assert.equal(coords.size, 996);
  assert.ok(coords.has("M2-3"));
  assert.ok(coords.has("M0-1-(0/1)"), "the U+2215 file-name solidus must be restored to a real '/'");
  assert.equal(coords.has("AGENTS"), false, "DOX files are not coordinates");
});

test("the diff enumerates every disagreement class and rates agreement per family", () => {
  const store = new RecordStore();
  store.add({ coordinate: "M2-3", properties: { q_1_a: "reconstruction value" }, truncated: false, tier: "mcp-readback", at: null });
  store.add({ coordinate: "M2-3", properties: { q_9_only_mine: "x" }, truncated: false, tier: "mcp-readback", at: null });
  store.add({ coordinate: "M2-3", properties: { c_0_diverges: "transcript says A" }, truncated: false, tier: "mcp-readback", at: null });
  store.add({ coordinate: "M2-3", properties: { q_5_cut: "the beginning" }, truncated: true, tier: "mcp-readback-text", at: null });

  const audit = new Map([["M2-3", new Map([
    ["q_1_a", 1], ["c_0_diverges", 2], ["q_5_cut", 3], ["t_0_only_theirs", 4],
  ])]]);
  const values = new Map([["M2-3", new Map([
    ["q_1_a", "reconstruction value"],
    ["c_0_diverges", "reconstruction says B"],
    ["q_5_cut", "the beginning and the rest of it"],
    ["t_0_only_theirs", "theirs"],
  ])]]);

  const { rows, byFamily } = diffAgainstReconstruction(store, audit, values);
  const verdicts = Object.fromEntries(rows.map((r) => [r.property, r.verdict]));
  assert.equal(verdicts.q_1_a, "agree");
  assert.equal(verdicts.q_9_only_mine, "only-transcript");
  assert.equal(verdicts.t_0_only_theirs, "only-reconstruction");
  assert.equal(verdicts.c_0_diverges, "value-disagree");
  assert.equal(verdicts.q_5_cut, "agree-prefix");
  assert.equal(rows.length, 5);

  // Every value-disagree row carries BOTH sides so the artifact enumerates, not summarises.
  const dis = rows.find((r) => r.verdict === "value-disagree");
  assert.equal(dis.transcript, "transcript says A");
  assert.equal(dis.reconstruction, "reconstruction says B");

  assert.equal(byFamily["q_*"].total, 3);

  // A reconstruction value that is present-but-empty is a LOST value, a
  // different defect class from two sources reporting rival text.
  const store2 = new RecordStore();
  store2.add({ coordinate: "M0-0-0", properties: { c_0_quality: "Pure Transcendence" }, truncated: false, tier: "overflow", at: null, source: "/x/spill.txt" });
  const d2 = diffAgainstReconstruction(
    store2,
    new Map([["M0-0-0", new Map([["c_0_quality", 1]])]]),
    new Map([["M0-0-0", new Map([["c_0_quality", ""]])]]),
  );
  assert.equal(d2.summary.valueDisagreements, 1);
  assert.equal(d2.summary.reconstructionEmpty, 1);
  assert.equal(d2.summary.genuineTextConflict, 0);
  assert.equal(d2.rows[0].transcriptSource, "/x/spill.txt", "provenance must reach the diff row");
  assert.equal(byFamily["q_*"].agreementRate, Number((2 / 3).toFixed(4)));
  assert.equal(byFamily["c_*"].agreementRate, 0);
  assert.equal(byFamily["t_*"].agreementRate, 0);
});
