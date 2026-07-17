import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import {
  dispatchZThread,
  getZThreadSnapshot,
  listZThreadSnapshots,
  registerZThreadShape,
  zThreadToolForMove,
  type ZThreadRuntimeAdapter,
} from "../extension/dispatch.ts";
import type {
  VakAddress,
  ZThreadMove,
  ZThreadSnapshot,
} from "../../shared/vak_address.ts";
import type { VerifyEvidence } from "../modules/judge-role.ts";

const zVakAddress: VakAddress & { cfp: "Z" } = {
  cpf: "(4.0/1-4.4/5)",
  ct: ["CT4b"],
  cp: "CP4.2",
  cf: "(0/1/2)",
  cfp: "Z",
  cs: { code: "CS4", direction: "Day" },
};

const fanOutThenChainThenFuse: ZThreadMove[] = [
  { id: "scout", cfp: "CFP1", task: "fan out readers", agents: ["nous", "logos"] },
  { id: "build", cfp: "CFP2", task: "chain the build", chain: "implement" },
  { id: "fuse", cfp: "CFP3", task: "fusion-verify results", agents: ["eros", "sophia"] },
];

const erosJudge = {
  agent: "eros",
  vak_coordinates: "CF3",
  symbolic_coordinate: "M4-2",
};

function clearedEvidence(): VerifyEvidence {
  return { judge: erosJudge, clearance: "cleared", questions: [] };
}

function questionsEvidence(): VerifyEvidence {
  return { judge: erosJudge, clearance: "questions", questions: [] };
}

function adapterStub(verdicts: Array<"cleared" | "questions">): ZThreadRuntimeAdapter & {
  performed: string[];
  verifyCalls: number;
} {
  const stub = {
    performed: [] as string[],
    verifyCalls: 0,
    async perform(move: ZThreadMove, _thread: ZThreadSnapshot) {
      stub.performed.push(`${move.id}:${move.cfp}`);
      return `output for ${move.id}`;
    },
    async verify(_thread: ZThreadSnapshot) {
      const verdict = verdicts[Math.min(stub.verifyCalls, verdicts.length - 1)];
      stub.verifyCalls += 1;
      return verdict === "cleared" ? clearedEvidence() : questionsEvidence();
    },
  };
  return stub;
}

describe("46.1 Z-thread runtime primitive", () => {
  it("refuses a shape whose vak address is not cfp Z", () => {
    assert.throws(
      () =>
        registerZThreadShape({
          id: "z-not-z",
          task: "no",
          vak_address: { ...zVakAddress, cfp: "CFP4" } as never,
          moves: fanOutThenChainThenFuse,
        }),
      /requires vak_address\.cfp === "Z"/,
    );
  });

  it("refuses a shape composing fewer than two distinct CFP moves", () => {
    assert.throws(
      () =>
        registerZThreadShape({
          id: "z-single-move-kind",
          task: "no",
          vak_address: zVakAddress,
          moves: [
            { id: "a", cfp: "CFP4", task: "loop once" },
            { id: "b", cfp: "CFP4", task: "loop twice" },
          ],
        }),
      /at least two distinct CFP moves/,
    );
  });

  it("composes >=2 distinct CFP moves in one autonomous envelope and closes when the Verify gate passes", async () => {
    const adapter = adapterStub(["cleared"]);
    const snapshot = await dispatchZThread({
      id: "z-compose",
      task: "scout, build, fuse",
      vak_address: zVakAddress,
      moves: fanOutThenChainThenFuse,
      adapter,
    });

    assert.equal(snapshot.state, "done");
    assert.deepEqual(snapshot.composes, ["CFP1", "CFP2", "CFP3"]);
    assert.deepEqual(adapter.performed, ["scout:CFP1", "build:CFP2", "fuse:CFP3"]);
    assert.equal(snapshot.verify_gate?.transition, "rehear");
    assert.deepEqual(snapshot.history.slice(0, 5), [
      "queued",
      "composing",
      "performing",
      "verifying",
      "rehearing",
    ]);
    assert.equal(snapshot.history.at(-1), "done");
    assert.equal(snapshot.outputs.length, 3);
    assert.equal(snapshot.outputs[0]?.tool, zThreadToolForMove("CFP1"));
  });

  it("does not rehear before clearance: loops through revision, then fails to human escalation", async () => {
    const adapter = adapterStub(["questions", "questions", "questions"]);
    let rehearCalls = 0;
    let recomposeCalls = 0;
    adapter.rehear = async () => {
      rehearCalls += 1;
    };
    adapter.recompose = async () => {
      recomposeCalls += 1;
    };
    const snapshot = await dispatchZThread({
      id: "z-never-clears",
      task: "loop until escalation",
      vak_address: zVakAddress,
      moves: fanOutThenChainThenFuse,
      adapter,
      max_verify_cycles: 3,
    });

    assert.equal(snapshot.state, "failed");
    assert.equal(snapshot.cycle, 3);
    assert.equal(adapter.verifyCalls, 3);
    assert.equal(snapshot.verify_gate?.transition, "human_escalation");
    assert.equal(rehearCalls, 0);
    assert.equal(recomposeCalls, 0);
    assert.equal(adapter.performed.length, fanOutThenChainThenFuse.length * 3);
    assert.match(snapshot.failure_reason ?? "", /No judge clearance|Verify gate did not clear/);
    assert.notEqual(snapshot.history.at(-1), "done");
  });

  it("clears on a later cycle once the Verify gate passes", async () => {
    const adapter = adapterStub(["questions", "cleared"]);
    const snapshot = await dispatchZThread({
      id: "z-second-cycle",
      task: "revise once then clear",
      vak_address: zVakAddress,
      moves: fanOutThenChainThenFuse,
      adapter,
    });

    assert.equal(snapshot.state, "done");
    assert.equal(snapshot.cycle, 2);
    assert.equal(adapter.verifyCalls, 2);
  });

  it("keeps Z-thread state queryable by Anima", async () => {
    const adapter = adapterStub(["cleared"]);
    await dispatchZThread({
      id: "z-queryable",
      task: "queryable state",
      vak_address: zVakAddress,
      moves: fanOutThenChainThenFuse,
      adapter,
    });

    const snapshot = getZThreadSnapshot("z-queryable");
    assert.ok(snapshot, "snapshot must be queryable by id");
    assert.equal(snapshot?.state, "done");
    assert.ok(
      listZThreadSnapshots().some((entry) => entry.id === "z-queryable"),
      "snapshot must appear in the Anima-queryable list",
    );
  });
});
