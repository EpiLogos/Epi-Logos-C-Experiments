import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import {
  evaluateOracleReadingFrame,
  flattenVakAddressForGraphiti,
  type OracleReadingFrameInput,
} from "../modules/reading-frame-evaluator.ts";
import type { VakAddress } from "../../shared/vak_address.ts";

const baseVak: VakAddress = {
  cpf: "(4.0/1-4.4/5)",
  ct: ["CT4b"],
  cp: "CP4.4",
  cf: "(4.5/0)",
  cfp: "CFP0",
  cs: { code: "CS1", direction: "Day" },
};

const psycheHandles = Object.freeze({
  sessionKey: "agent:nara:oracle",
  sessionId: "20260619-120001-oracle",
  dayId: "19-06-2026",
  nowPath: "Idea/Empty/Present/19-06-2026/20260619-120001-oracle/now.md",
  redisLiveContextHandle: "redis://psyche/live/agent:nara:oracle",
  kbaseSourcePoolHandles: Object.freeze(["kbase://source-pool/oracle"]),
});

function frame(input: Partial<OracleReadingFrameInput>): OracleReadingFrameInput {
  return {
    frameId: "oracle-frame-alpha",
    artifactKind: "tarot",
    spreadScale: "single-card",
    vakAddress: baseVak,
    positions: [{ key: "p0", ordinal: 0, cpPositionRef: "CP4.4", label: "card" }],
    psycheHandles,
    ...input,
  };
}

describe("VAK reading-frame evaluator", () => {
  it("uses reading_frame.positions[] as the cardinality authority, not the spread name", () => {
    const result = evaluateOracleReadingFrame(frame({
      spreadScale: "single-card",
      positions: [
        { key: "past", ordinal: 0, cpPositionRef: "CP4.1" },
        { key: "present", ordinal: 1, cpPositionRef: "CP4.4" },
        { key: "future", ordinal: 2, cpPositionRef: "CP4.5" },
      ],
      vakAddress: { ...baseVak, cfp: "CFP1" },
    }));

    assert.equal(result.ok, true);
    assert.equal(result.frameKind, "compressed-triad-cp-set");
    assert.equal(result.positionCount, 3);
    assert.deepEqual(result.activeCpSet, ["CP4.1", "CP4.4", "CP4.5"]);
  });

  it("accepts a Tarot single-card CP point and emits flattened Graphiti attrs plus session vak_address", () => {
    const result = evaluateOracleReadingFrame(frame({
      artifactKind: "tarot",
      positions: [{ key: "card", ordinal: 0, cpPositionRef: "CP4.4", label: "The Star" }],
    }));

    assert.equal(result.ok, true);
    assert.equal(result.frameKind, "single-card-cp-point");
    assert.deepEqual(result.graphitiEpisodeAttrs, {
      cpf: "(4.0/1-4.4/5)",
      ct: ["CT4b"],
      cp: ["CP4.4"],
      cf: "(4.5/0)",
      cfp: "CFP0",
      cs_code: "CS1",
      cs_direction: "Day",
    });
    assert.deepEqual(result.sessionRuntime.vak_address, baseVak);
    assert.equal(result.sessionRuntime.day_id, psycheHandles.dayId);
    assert.equal(result.sessionRuntime.now_path, psycheHandles.nowPath);
    assert.equal(result.sessionRuntime.redis_live_context_handle, psycheHandles.redisLiveContextHandle);
  });

  it("computes complementary pairs only from declared position-pair topology", () => {
    const undeclared = evaluateOracleReadingFrame(frame({
      spreadScale: "sixfold-ql-traverse",
      positions: [
        { key: "p0", ordinal: 0, cpPositionRef: "CP4.0", complementaryKey: "p5" },
        { key: "p1", ordinal: 1, cpPositionRef: "CP4.1", complementaryKey: "p4" },
        { key: "p2", ordinal: 2, cpPositionRef: "CP4.2" },
        { key: "p3", ordinal: 3, cpPositionRef: "CP4.3" },
        { key: "p4", ordinal: 4, cpPositionRef: "CP4.4", complementaryKey: "p1" },
        { key: "p5", ordinal: 5, cpPositionRef: "CP4.5", complementaryKey: "p0" },
      ],
    }));
    assert.equal(undeclared.ok, true);
    assert.deepEqual(undeclared.complementaryPairs, []);

    const declared = evaluateOracleReadingFrame(frame({
      spreadScale: "sixfold-ql-traverse",
      declaredTopology: "position-pairs",
      positions: [
        { key: "p0", ordinal: 0, cpPositionRef: "CP4.0", complementaryKey: "p5" },
        { key: "p1", ordinal: 1, cpPositionRef: "CP4.1", complementaryKey: "p4" },
        { key: "p2", ordinal: 2, cpPositionRef: "CP4.2" },
        { key: "p3", ordinal: 3, cpPositionRef: "CP4.3" },
        { key: "p4", ordinal: 4, cpPositionRef: "CP4.4", complementaryKey: "p1" },
        { key: "p5", ordinal: 5, cpPositionRef: "CP4.5", complementaryKey: "p0" },
      ],
    }));
    assert.equal(declared.ok, true);
    assert.equal(declared.frameKind, "sixfold-ql-traverse");
    assert.deepEqual(declared.complementaryPairs, [["p0", "p5"], ["p1", "p4"]]);
  });

  it("routes I-Ching Night prime inverse passes through CS direction without changing top-level cardinality", () => {
    const result = evaluateOracleReadingFrame(frame({
      artifactKind: "iching",
      spreadScale: "night-inverse-pass",
      declaredTopology: "klein-night",
      vakAddress: {
        ...baseVak,
        cfp: "CFP2",
        cs: { code: "CS4", direction: "Night'" },
      },
      positions: Array.from({ length: 6 }, (_, index) => ({
        key: `line-${index}`,
        ordinal: index,
        cpPositionRef: `CP4.${index}` as const,
      })),
    }));

    assert.equal(result.ok, true);
    assert.equal(result.frameKind, "klein-night-inverse-pass");
    assert.equal(result.positionCount, 6);
    assert.equal(result.graphitiEpisodeAttrs.cs_direction, "Night'");
    assert.equal(result.dispatch.allowed, true);
  });

  it("keeps optional P4 lemniscate sub-readings nested as child CP frames for 4/5 depth passes", () => {
    const result = evaluateOracleReadingFrame(frame({
      artifactKind: "mahamaya",
      spreadScale: "depth-4-5-pass",
      declaredTopology: "depth-4-5",
      vakAddress: { ...baseVak, cfp: "CFP5" },
      positions: [
        { key: "p4", ordinal: 0, cpPositionRef: "CP4.4" },
        { key: "p5", ordinal: 1, cpPositionRef: "CP4.5" },
      ],
      childFrames: [
        {
          frameId: "oracle-frame-alpha/p4-lemniscate",
          artifactKind: "tarot",
          spreadScale: "single-card",
          vakAddress: { ...baseVak, cfp: "CFP5", cp: "CP4.4" },
          positions: [{ key: "p4-child", ordinal: 0, cpPositionRef: "CP4.4" }],
        },
      ],
    }));

    assert.equal(result.ok, true);
    assert.equal(result.frameKind, "depth-4-5-pass");
    assert.equal(result.positionCount, 2);
    assert.deepEqual(result.activeCpSet, ["CP4.4", "CP4.5"]);
    assert.equal(result.childFrames.length, 1);
    assert.equal(result.childFrames[0].positionCount, 1);
    assert.equal(result.childFrames[0].graphitiEpisodeAttrs.cfp, "CFP5");
  });

  it("refuses OracleFrame dispatch without CPF consent state or a CP position set", () => {
    const missingCpf = evaluateOracleReadingFrame(frame({
      vakAddress: { ...baseVak, cpf: "" as any },
    }));
    assert.equal(missingCpf.ok, false);
    assert.match(missingCpf.error!, /CPF consent/i);
    assert.equal(missingCpf.dispatch.allowed, false);

    const missingCpSet = evaluateOracleReadingFrame(frame({
      positions: [],
    }));
    assert.equal(missingCpSet.ok, false);
    assert.match(missingCpSet.error!, /CP position set/i);
    assert.equal(missingCpSet.dispatch.allowed, false);
  });

  it("round-trips flattened VAK fields for Graphiti oracle artifacts", () => {
    const flattened = flattenVakAddressForGraphiti({
      ...baseVak,
      ct: ["CT3", "CT4b"],
      cfp: "CFP3",
      cs: { code: "CS5", direction: "Night'" },
    }, ["CP4.2", "CP4.3"]);
    const roundTrip = JSON.parse(JSON.stringify(flattened));

    assert.deepEqual(roundTrip, {
      cpf: "(4.0/1-4.4/5)",
      ct: ["CT3", "CT4b"],
      cp: ["CP4.2", "CP4.3"],
      cf: "(4.5/0)",
      cfp: "CFP3",
      cs_code: "CS5",
      cs_direction: "Night'",
    });
  });
});
