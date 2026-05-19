import assert from "node:assert/strict";
import { test } from "node:test";

import {
  assignmentsForRegion,
  blockForNode,
  buildRegionalOutputs,
  cypherLiteral,
  cypherString,
  mCoordinate,
  mappings,
  registeredTargets,
} from "./generate-deep-regional-cypher.mjs";

test("mCoordinate converts hashtag coordinates into canonical M coordinates", () => {
  assert.equal(mCoordinate("#"), "M");
  assert.equal(mCoordinate("#3-2"), "M3-2");
  assert.equal(mCoordinate("M4-1"), "M4-1");
});

test("cypherString escapes values that would corrupt Cypher string literals", () => {
  assert.equal(
    cypherString("line 1\nline 2\r\npath\\branch\tit's"),
    "'line 1\\nline 2\\r\\npath\\\\branch\\tit\\'s'",
  );
});

test("cypherLiteral emits string-list targets as Cypher lists", () => {
  assert.equal(cypherLiteral("alpha, beta,, gamma", "c_5_resonances"), "['alpha', 'beta', 'gamma']");
  assert.equal(cypherLiteral(["alpha", "beta"], "s_5_tool_affinity"), "['alpha', 'beta']");
});

test("blockForNode matches existing Bimba nodes instead of creating new nodes", () => {
  const block = blockForNode("M3", "m3", [
    { sourceKey: "name", target: "c_1_name", literal: cypherString("Mahamaya") },
  ]);

  assert.match(block, /MATCH \(n:Bimba \{ coordinate: 'M3' \}\)/);
  assert.doesNotMatch(block, /MERGE \(n:Bimba/);
});

test("blockForNode keeps unregistered targets out of executable SET blocks", () => {
  const block = blockForNode("M5", "m5", [
    { sourceKey: "name", target: "c_1_name", literal: cypherString("Epii") },
    { sourceKey: "positionId", target: "p_1_position_id", literal: cypherString("stage-1") },
  ]);

  const setBlock = block.slice(block.indexOf("SET n +="), block.indexOf("// PROPOSED_REVIEW"));
  assert.match(setBlock, /c_1_name: 'Epii'/);
  assert.doesNotMatch(setBlock, /p_1_position_id/);
  assert.match(block, /PROPOSED_REVIEW p_1_position_id: 'stage-1' \/\/ from positionId/);
});

test("blockForNode emits proposed-only review blocks without executable graph writes", () => {
  const block = blockForNode("M5", "m5", [
    { sourceKey: "positionId", target: "p_1_position_id", literal: cypherString("stage-1") },
  ]);

  assert.doesNotMatch(block, /MATCH \(n:Bimba/);
  assert.doesNotMatch(block, /SET n \+=/);
  assert.match(block, /PROPOSED_REVIEW p_1_position_id: 'stage-1' \/\/ from positionId/);
});

test("P-region review targets are not silently executable before registry approval", () => {
  assert.equal(registeredTargets.has("p_1_variant"), false);
  assert.equal(registeredTargets.has("p_1_position_id"), false);
  assert.equal(registeredTargets.has("p_3_sequence"), false);
});

test("positional source keys route to P-region proposals, not C-region drift", () => {
  assert.equal(mappings.p.qlVariant, "p_1_variant");
  assert.equal(mappings.p.qlPositionWeave, "p_1_weave");
  assert.equal(mappings.p.positionId, "p_1_position_id");
  assert.equal(mappings.p.stageId, "p_1_stage_id");
  assert.equal(mappings.p.sequence, "p_3_sequence");
  assert.equal(Object.hasOwn(mappings.c, "qlVariant"), false);
  assert.equal(Object.hasOwn(mappings.c, "positionId"), false);
});

test("duplicate source aliases collapse to one target assignment", () => {
  const assignments = assignmentsForRegion(
    {
      lastUpdated: "2026-05-18T01:00:00Z",
      updatedAt: "2026-05-18T02:00:00Z",
      updated_at: "2026-05-18T03:00:00Z",
    },
    mappings.c,
  );

  assert.deepEqual(assignments, [
    {
      sourceKey: "lastUpdated",
      target: "c_3_updated_at",
      literal: "'2026-05-18T01:00:00Z'",
    },
  ]);
});

test("buildRegionalOutputs reads real deep datasets without writing generated files", () => {
  const { outputs, summary } = buildRegionalOutputs();

  assert.ok(summary.some((line) => line.startsWith("m0:")));
  assert.ok(summary.some((line) => line.startsWith("m5:")));
  assert.ok(outputs.get("c").length > 0);
  assert.ok(outputs.get("p").some((block) => block.includes("PROPOSED_REVIEW p_")));
  assert.ok(outputs.get("m_prime").some((block) => block.includes("PROPOSED_REVIEW")));
});
