import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import {
  buildChronosCronFireVakAddress,
  chronos_cron_fire,
} from "../modules/cron-fire.ts";
import type { VakAddress } from "../../shared/vak_address.ts";

function captureDispatch() {
  const calls: Array<{ agent: string; task: string; vakAddress?: VakAddress }> = [];
  const dispatch = async (agent: string, task: string, vakAddress?: VakAddress) => {
    calls.push({ agent, task, vakAddress });
    return `dispatched:${agent}`;
  };
  return { calls, dispatch };
}

const basePayload = {
  job_kind: "assess",
  prompt: "Run the nightly assess-and-improve pass.",
};

describe("47.2 chronos cron fire → Anima dispatch", () => {
  it("routes a fired job through the Anima dispatch seam with its VAK address", async () => {
    const { calls, dispatch } = captureDispatch();
    const result = await chronos_cron_fire(
      {
        payload: { ...basePayload, agent: "eros" },
        wake_mode: "now",
        session_target: "main",
        job_id: "cron-42",
        job_name: "nightly-assess",
        fired_at_ms: 1_751_000_000_000,
      },
      dispatch,
    );

    assert.equal(calls.length, 1, "exactly one Anima dispatch per fired job");
    assert.equal(calls[0]?.agent, "eros");
    assert.ok(calls[0]?.vakAddress, "dispatch carries a VAK address");
    assert.deepEqual(calls[0]?.vakAddress, result.vak_address);
    assert.equal(result.agent, "eros");
    assert.equal(result.session_target, "main");
    assert.equal(result.wake_mode, "now");
    assert.equal(result.dispatch_output, "dispatched:eros");

    const envelope = calls[0]?.task ?? "";
    assert.match(envelope, /normal Anima VAK dispatch/);
    assert.match(envelope, /wake_mode: now/);
    assert.match(envelope, /job_id: cron-42/);
    assert.match(envelope, /job_name: nightly-assess/);
    assert.match(envelope, /Run the nightly assess-and-improve pass\./);
  });

  it("honours wake_mode 'now' vs 'next-heartbeat' in the VAK address", () => {
    const nowAddress = buildChronosCronFireVakAddress(
      { payload: {} },
      "eros",
      "now",
    );
    assert.equal(nowAddress.cp, "CP4.2");
    assert.equal(nowAddress.cs.code, "CS2");

    const heartbeatAddress = buildChronosCronFireVakAddress(
      { payload: {} },
      "eros",
      "next-heartbeat",
    );
    assert.equal(heartbeatAddress.cp, "CP4.4");
    assert.equal(heartbeatAddress.cs.code, "CS4");

    for (const address of [nowAddress, heartbeatAddress]) {
      assert.deepEqual(address.ct, ["CT4b"]);
      assert.equal(address.cfp, "CFP0");
      assert.equal(address.cs.direction, "Day");
    }
  });

  it("reads wake_mode from the payload and refuses an invalid one", async () => {
    const { calls, dispatch } = captureDispatch();
    const result = await chronos_cron_fire(
      { payload: { ...basePayload, agent: "sophia", wakeMode: "next-heartbeat" } },
      dispatch,
    );
    assert.equal(result.wake_mode, "next-heartbeat");
    assert.match(calls[0]?.task ?? "", /wake_mode: next-heartbeat/);

    await assert.rejects(
      chronos_cron_fire({ payload: { ...basePayload, agent: "sophia" }, wake_mode: "later" as never }, dispatch),
      /wake_mode must be 'now' or 'next-heartbeat'/,
    );
  });

  it("resolves the agent from nested payload target and refuses a fire without one", async () => {
    const { calls, dispatch } = captureDispatch();
    const result = await chronos_cron_fire(
      { payload: { ...basePayload, target: { agent_name: "mythos" } }, wake_mode: "now" },
      dispatch,
    );
    assert.equal(result.agent, "mythos");
    assert.equal(calls[0]?.agent, "mythos");

    await assert.rejects(
      chronos_cron_fire({ payload: { ...basePayload }, wake_mode: "now" }, dispatch),
      /requires agent/,
    );
  });

  it("passes an explicit canonical vak_address through unchanged and rejects an invalid one", async () => {
    const explicit: VakAddress = {
      cpf: "(4.0/1-4.4/5)",
      ct: ["CT4b"],
      cp: "CP4.3",
      cf: "(0/1/2)",
      cfp: "CFP2",
      cs: { code: "CS1", direction: "Night'" },
    };
    const { calls, dispatch } = captureDispatch();
    const result = await chronos_cron_fire(
      { payload: { ...basePayload, agent: "eros", vak_address: explicit }, wake_mode: "now" },
      dispatch,
    );
    assert.deepEqual(result.vak_address, explicit);
    assert.deepEqual(calls[0]?.vakAddress, explicit);

    await assert.rejects(
      chronos_cron_fire(
        { payload: { ...basePayload, agent: "eros", vak_address: { cp: "nope" } }, wake_mode: "now" },
        dispatch,
      ),
      /failed canonical validation/,
    );
  });
});
