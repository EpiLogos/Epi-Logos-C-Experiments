import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { planMoiraiNightPass, classifyMoiraiOutput } from "../modules/moirai-dispatch.ts";

describe("Moirai Night' pass plan", () => {
  it("dispatches all three Moirai as CFP3 F-Thread with proper Night' positions", () => {
    const plan = planMoiraiNightPass({
      session_id: "agent:test:main",
      disclosure_path: "/vault/Sophia/inbox/x.jsonl",
    });
    assert.equal(plan.cfp, "CFP3");
    assert.equal(plan.cs_direction, "Night'");
    assert.equal(plan.dispatches.length, 3);
    const names = plan.dispatches.map((d) => d.agent).sort();
    assert.deepEqual(names, ["atropos", "klotho", "lachesis"]);
    const positions = plan.dispatches.map((d) => d.night_position).sort();
    assert.deepEqual(positions, ["P1'", "P4'", "P5'"]);
  });

  it("each task brief references both the disclosure path and session_id", () => {
    const plan = planMoiraiNightPass({
      session_id: "agent:verify:42",
      disclosure_path: "/vault/Sophia/inbox/x.jsonl",
    });
    for (const dispatch of plan.dispatches) {
      assert.ok(
        dispatch.task.includes("/vault/Sophia/inbox/x.jsonl"),
        `${dispatch.agent} task should reference disclosure path`,
      );
      assert.ok(
        dispatch.task.includes("agent:verify:42"),
        `${dispatch.agent} task should reference session_id`,
      );
    }
  });

  it("Klotho is at P1', Lachesis at P4', Atropos at P5' (canonical Moirai mapping)", () => {
    const plan = planMoiraiNightPass({
      session_id: "s1",
      disclosure_path: "/x.jsonl",
    });
    const byAgent = Object.fromEntries(
      plan.dispatches.map((d) => [d.agent, d.night_position]),
    );
    assert.equal(byAgent.klotho, "P1'");
    assert.equal(byAgent.lachesis, "P4'");
    assert.equal(byAgent.atropos, "P5'");
  });
});

describe("classifyMoiraiOutput", () => {
  it("classifies empty output as 'empty'", () => {
    assert.equal(classifyMoiraiOutput(""), "empty");
    assert.equal(classifyMoiraiOutput("   \n  "), "empty");
  });
  it("classifies Error:-prefixed output as 'failed'", () => {
    assert.equal(classifyMoiraiOutput("Error: subprocess crashed"), "failed");
    assert.equal(classifyMoiraiOutput("  Error: something"), "failed");
  });
  it("classifies normal output as 'ok'", () => {
    assert.equal(classifyMoiraiOutput("traces: thread A, thread B"), "ok");
  });
});
