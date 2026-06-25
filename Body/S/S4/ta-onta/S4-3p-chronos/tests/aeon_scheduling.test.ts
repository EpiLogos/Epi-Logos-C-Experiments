import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import {
  bindAeonCronRegistration,
  chronos_aeon_fire,
  chronos_aeon_on_event_fire,
  type AeonInvocationForm,
} from "../modules/aeon-scheduling.ts";
import { RESULT_ARTIFACT_WAKE, type ResultArtifactWakeEvent } from "../../S4-0p-khora/modules/flow-watcher.ts";
import type { VakAddress } from "../../shared/vak_address.ts";

const vakAddress: VakAddress = {
  cpf: "(4.0/1-4.4/5)",
  ct: ["CT4b"],
  cp: "CP4.2",
  cf: "(0/1/2)",
  cfp: "Z",
  cs: { code: "CS4", direction: "Day" },
};

const aeon: AeonInvocationForm = {
  aeon_id: "assess-improve",
  aeon_name: "Assess And Improve",
  agent: "eros",
  task: "Run the reusable assess-and-improve loop.",
  schedule: "*/15 * * * *",
  on_event: { kind: "result-drop", purpose: "review" },
  consent_posture: {
    cpf: "(4.0/1-4.4/5)",
    granted: true,
    consent_gate: "cpf:constant-assess-improve",
  },
  vak_address: vakAddress,
  args: {
    coordinate: "C1",
    rubric: "production-readiness",
  },
};

describe("Chronos Aeon scheduling binding", () => {
  it("binds a CT4b Aeon schedule into the gateway cron payload with VAK args", () => {
    const registration = bindAeonCronRegistration(aeon);

    assert.equal(registration.name, "aeon-assess-improve");
    assert.equal(registration.schedule, "*/15 * * * *");
    assert.equal(registration.wake_mode, "next-heartbeat");
    assert.equal(registration.payload.kind, "aeon.invoke");
    assert.equal(registration.payload.aeon_id, "assess-improve");
    assert.deepEqual(registration.payload.vak_address, vakAddress);
    assert.deepEqual(registration.payload.args, aeon.args);
  });

  it("fires a scheduled Aeon with its bound VAK args", async () => {
    let observedTask = "";
    let observedVak: VakAddress | null = null;
    const result = await chronos_aeon_fire(
      { aeon, trigger: "schedule", job_id: "cron-1", fired_at_ms: 1_780_000_000_000 },
      async (agent, task, vak) => {
        assert.equal(agent, "eros");
        observedTask = task;
        observedVak = vak;
        return "aeon loop ran";
      },
    );

    assert.equal(result.dispatch_output, "aeon loop ran");
    assert.equal(result.trigger, "schedule");
    assert.deepEqual(observedVak, vakAddress);
    assert.match(observedTask, /aeon_id: assess-improve/);
    assert.match(observedTask, /"rubric": "production-readiness"/);
  });

  it("fires on result-drop only when the wake purpose matches", async () => {
    const event = resultDrop("review");
    const skipped = await chronos_aeon_on_event_fire(aeon, resultDrop("implement"), async () => {
      throw new Error("non-matching event must not dispatch");
    });
    const fired = await chronos_aeon_on_event_fire(aeon, event, async (agent, task, vak) => {
      assert.equal(agent, "eros");
      assert.deepEqual(vak, vakAddress);
      assert.match(task, /result_drop_path: .*review\.result\.md/);
      return "result-drop aeon loop ran";
    });

    assert.equal(skipped, null);
    assert.equal(fired?.trigger, "on_event");
    assert.equal(fired?.dispatch_output, "result-drop aeon loop ran");
  });

  it("refuses autonomous Aeon fire without a granted CPF consent posture", async () => {
    const ungranted: AeonInvocationForm = {
      ...aeon,
      consent_posture: {
        cpf: "(4.0/1-4.4/5)",
        granted: false,
      },
    };

    await assert.rejects(
      () => chronos_aeon_fire({ aeon: ungranted, trigger: "schedule" }),
      /autonomous fire refused: CPF consent posture has not been granted/,
    );
  });
});

function resultDrop(purpose: ResultArtifactWakeEvent["purpose"]): ResultArtifactWakeEvent {
  return {
    kind: RESULT_ARTIFACT_WAKE,
    session_id: "20260625-120000-parent",
    day_id: "25-06-2026",
    path: `/tmp/${purpose}.result.md`,
    source: "artifact-created",
    detected_at: "2026-06-25T12:00:00.000Z",
    directory_scope: "now",
    purpose,
  };
}
