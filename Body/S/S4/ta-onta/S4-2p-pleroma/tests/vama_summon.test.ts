import { describe, it, before } from "node:test";
import { strict as assert } from "node:assert";
import { pleromaExtension } from "../extension.ts";

type RegisteredTool = {
  name: string;
  execute?: (_id: string, params: Record<string, unknown>) => Promise<any>;
  [key: string]: unknown;
};

let tool: RegisteredTool | undefined;

before(async () => {
  const priorTilldoneMode = process.env.EPI_TILLDONE_MODE;
  const priorDamageControlMode = process.env.EPI_DAMAGE_CONTROL_MODE;
  process.env.EPI_TILLDONE_MODE = "off";
  process.env.EPI_DAMAGE_CONTROL_MODE = "off";
  const tools: RegisteredTool[] = [];
  await pleromaExtension({
    registerTool(registered: RegisteredTool) {
      tools.push(registered);
    },
  } as any);
  if (priorTilldoneMode === undefined) {
    delete process.env.EPI_TILLDONE_MODE;
  } else {
    process.env.EPI_TILLDONE_MODE = priorTilldoneMode;
  }
  if (priorDamageControlMode === undefined) {
    delete process.env.EPI_DAMAGE_CONTROL_MODE;
  } else {
    process.env.EPI_DAMAGE_CONTROL_MODE = priorDamageControlMode;
  }
  tool = tools.find((registered) => registered.name === "techne_vama_summon");
});

async function invoke(params: Record<string, unknown>) {
  assert.ok(tool, "techne_vama_summon must be registered");
  assert.equal(typeof tool.execute, "function");
  return tool.execute!("test-call", params);
}

function responseText(result: any): string {
  return String(result?.content?.[0]?.text ?? "");
}

describe("techne_vama_summon registration and refusal law", () => {
  it("registers with Psyche template authority metadata", () => {
    assert.ok(tool, "techne_vama_summon must be registered");
    assert.equal(tool.operatorRole, "psyche-template");
    assert.equal(tool.schema, tool.parameters);
    assert.equal(typeof tool.refusalLaw, "function");
  });

  it("refuses coordinates that do not resolve to a :World entity", async () => {
    const result = await invoke({
      entity_coordinate: "M2",
      arena_scene_key: "scene-alpha",
      vama_shakti_class: "egregore",
      lifecycle_mode: "ephemeral",
      requesting_actor: "anima_scene_setup",
    });

    assert.equal(result.isError, true);
    assert.match(responseText(result), /DR-VAMA-3/);
    assert.match(responseText(result), /hen_entity_candidate_propose/);
  });

  it("refuses unrecognized Vama Shakti classifiers", async () => {
    const result = await invoke({
      entity_coordinate: ":World/M2",
      arena_scene_key: "scene-alpha",
      vama_shakti_class: "tulpa",
      lifecycle_mode: "ephemeral",
      requesting_actor: "anima_scene_setup",
    });

    assert.equal(result.isError, true);
    assert.match(responseText(result), /DR-VAMA-6/);
    assert.match(responseText(result), /egregore\/sprite\/daemon\/mantra/);
  });

  it("refuses capability_profile overrides", async () => {
    const result = await invoke({
      entity_coordinate: ":World/M2",
      arena_scene_key: "scene-alpha",
      vama_shakti_class: "sprite",
      lifecycle_mode: "ephemeral",
      requesting_actor: "anima_scene_setup",
      capability_profile: { dialogue_only: false },
    });

    assert.equal(result.isError, true);
    assert.match(responseText(result), /DR-VAMA-5/);
    assert.match(responseText(result), /dialogue-only/);
  });
});
