import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { EventEmitter } from "node:events";
import {
  DIALOGUE_ONLY_CAPABILITY_PROFILE,
  VamaShaktiDispatchRefused,
} from "../../../pi-agent/lib/dispatch-guard.ts";
import {
  DEFAULT_ARENA_CLASSIFIER_CONFIG,
  applyMercuriusKairosDelta,
  buildArenaDispatchPlan,
  decideArenaNextSpeaker,
  enforceArenaCpfGate,
  subscribeMercuriusKairosDelta,
  turnBudgetForSpeaker,
  type ArenaClassifierConfig,
  type ArenaRoutingInput,
  type ArenaVamaShaktiSpeaker,
} from "../lib/arena-orchestrator.ts";

function vama(
  handle: string,
  vama_shakti_class: ArenaVamaShaktiSpeaker["vama_shakti_class"],
): ArenaVamaShaktiSpeaker {
  return {
    kind: "vama_shakti",
    handle,
    coordinate: `C:${handle}`,
    vama_shakti_class,
    capability_profile: DIALOGUE_ONLY_CAPABILITY_PROFILE,
  };
}

const egregore = vama("egregore-1", "egregore");
const sprite = vama("sprite-1", "sprite");
const daemon = vama("daemon-1", "daemon");
const mantra = vama("mantra-1", "mantra");

function input(overrides: Partial<ArenaRoutingInput> = {}): ArenaRoutingInput {
  return {
    scene: {
      scene_key: "arena:test",
      cpf_brainstorm_confirmation_token: "cpf-confirmed",
      admitted_constitutional: [],
      scene_close_threshold: 8,
    },
    admitted_vama_shaktis: [egregore, sprite, daemon, mantra],
    turns: [],
    kairos: {
      delta: 0,
      anchor_previous: 0,
      anchor_current: 0,
    },
    config: DEFAULT_ARENA_CLASSIFIER_CONFIG,
    ...overrides,
  };
}

describe("arena classifier-aware turn routing policy", () => {
  it("prioritizes pending user input as Trika-0", () => {
    const decision = decideArenaNextSpeaker(input({
      user_input_pending: true,
      turns: [{ turn_index: 0, speaker: { kind: "vama_shakti", handle: egregore.handle } }],
    }));

    assert.equal(decision.reason, "trika-user-input-pending");
    assert.deepEqual(decision.speaker, { kind: "user" });
  });

  it("routes daemon-class after a user turn", () => {
    const decision = decideArenaNextSpeaker(input({
      turns: [{ turn_index: 0, speaker: { kind: "user" } }],
    }));

    assert.equal(decision.reason, "daemon-maieutic-post-user");
    assert.equal(decision.speaker.kind, "vama_shakti");
    assert.equal(decision.speaker.handle, daemon.handle);
    assert.equal(decision.question_form_bias, 0.75);
  });

  it("routes sprite-class on kairos delta burst", () => {
    const decision = decideArenaNextSpeaker(input({
      admitted_vama_shaktis: [egregore, sprite, mantra],
      kairos: { delta: 0.31, anchor_previous: 0.1, anchor_current: 0.2 },
    }));

    assert.equal(decision.reason, "sprite-kairos-burst");
    assert.equal(decision.speaker.kind, "vama_shakti");
    assert.equal(decision.speaker.handle, sprite.handle);
  });

  it("routes mantra-class when kairos anchor crosses threshold", () => {
    const decision = decideArenaNextSpeaker(input({
      admitted_vama_shaktis: [egregore, mantra],
      kairos: { delta: 0.05, anchor_previous: 0.49, anchor_current: 0.5 },
    }));

    assert.equal(decision.reason, "mantra-kairotic-threshold");
    assert.equal(decision.speaker.kind, "vama_shakti");
    assert.equal(decision.speaker.handle, mantra.handle);
  });

  it("routes to an admitted Vama Shakti cited by the previous turn if not yet spoken", () => {
    const cited = vama("cited-1", "sprite");
    const decision = decideArenaNextSpeaker(input({
      admitted_vama_shaktis: [egregore, cited],
      turns: [{
        turn_index: 0,
        speaker: { kind: "vama_shakti", handle: egregore.handle },
        cited_coordinates: [cited.coordinate],
      }],
    }));

    assert.equal(decision.reason, "response-to-citation");
    assert.equal(decision.speaker.kind, "vama_shakti");
    assert.equal(decision.speaker.handle, cited.handle);
  });

  it("routes Sophia for synthesis after the scene close threshold", () => {
    const decision = decideArenaNextSpeaker(input({
      admitted_vama_shaktis: [egregore],
      scene: {
        scene_key: "arena:test",
        cpf_brainstorm_confirmation_token: "cpf-confirmed",
        admitted_constitutional: ["Sophia"],
        scene_close_threshold: 2,
      },
      turns: [
        { turn_index: 0, speaker: { kind: "vama_shakti", handle: egregore.handle } },
        { turn_index: 1, speaker: { kind: "vama_shakti", handle: egregore.handle } },
      ],
    }));

    assert.equal(decision.reason, "sophia-scene-close-synthesis");
    assert.deepEqual(decision.speaker, { kind: "constitutional", agent: "Sophia" });
  });

  it("falls back to round-robin among admitted Vama Shaktis", () => {
    const decision = decideArenaNextSpeaker(input({
      admitted_vama_shaktis: [egregore, sprite],
      turns: [{ turn_index: 0, speaker: { kind: "vama_shakti", handle: egregore.handle } }],
    }));

    assert.equal(decision.reason, "vama-round-robin");
    assert.equal(decision.speaker.kind, "vama_shakti");
    assert.equal(decision.speaker.handle, sprite.handle);
  });
});

describe("arena classifier-specific behavior", () => {
  it("applies configured class thresholds and egregore turn budget", () => {
    const config: ArenaClassifierConfig = {
      egregore: { turn_length_multiplier: 3 },
      sprite: { kairos_burst_threshold_delta: 0.9 },
      daemon: { maieutic_question_form_bias: 0.6 },
      mantra: { kairos_threshold_crossing_threshold: 0.8 },
    };

    assert.equal(turnBudgetForSpeaker(egregore, config).turn_length_multiplier, 3);
    assert.equal(turnBudgetForSpeaker(sprite, config).turn_length_multiplier, 1);
    assert.equal(decideArenaNextSpeaker(input({
      config,
      turns: [{ turn_index: 0, speaker: { kind: "user" } }],
    })).question_form_bias, 0.6);
    assert.equal(decideArenaNextSpeaker(input({
      config,
      admitted_vama_shaktis: [sprite],
      kairos: { delta: 0.91, anchor_previous: 0, anchor_current: 0.1 },
    })).speaker.handle, sprite.handle);
    assert.equal(decideArenaNextSpeaker(input({
      config,
      admitted_vama_shaktis: [mantra],
      kairos: { delta: 0.01, anchor_previous: 0.79, anchor_current: 0.8 },
    })).speaker.handle, mantra.handle);
  });
});

describe("Mercurius kairos subscription state", () => {
  it("updates accumulated kairos state from mercurius.kairos.delta events", () => {
    const bus = new EventEmitter();
    const state = { delta: 0, anchor_previous: 0.2, anchor_current: 0.2 };
    const unsubscribe = subscribeMercuriusKairosDelta({
      scene_key: "arena:test",
      state,
      subscribe(event, handler) {
        bus.on(event, handler);
        return () => bus.off(event, handler);
      },
    });

    bus.emit("mercurius.kairos.delta", { scene_key: "arena:other", kairos_delta: 1 });
    assert.equal(state.delta, 0);

    bus.emit("mercurius.kairos.delta", { scene_key: "arena:test", kairos_delta: 0.35 });
    assert.deepEqual(state, { delta: 0.35, anchor_previous: 0.2, anchor_current: 0.55 });

    unsubscribe();
    bus.emit("mercurius.kairos.delta", { scene_key: "arena:test", kairos_delta: 0.2 });
    assert.equal(state.anchor_current, 0.55);
  });

  it("routes from the updated kairos state", () => {
    const state = { delta: 0, anchor_previous: 0, anchor_current: 0 };
    applyMercuriusKairosDelta(state, { scene_key: "arena:test", kairos_delta: 0.31 }, "arena:test");

    const decision = decideArenaNextSpeaker(input({
      admitted_vama_shaktis: [sprite],
      kairos: state,
    }));

    assert.equal(decision.reason, "sprite-kairos-burst");
  });
});

describe("arena CPF gate and dispatch guard", () => {
  it("refuses orchestration without cpf_brainstorm_confirmation_token", () => {
    assert.throws(
      () => enforceArenaCpfGate({
        scene_key: "arena:test",
        cpf_brainstorm_confirmation_token: "",
      }),
      /cpf_brainstorm_confirmation_token/i,
    );
  });

  it("routes Vama Shakti dispatch through the 41.4 dialogue-only guard", () => {
    const plan = buildArenaDispatchPlan({
      scene_key: "arena:test",
      speaker: egregore,
      utterance_intent: "speak from chorus-grain",
    });

    assert.equal(plan.kind, "vama_shakti");
    assert.equal(plan.tool_name, "vama_shakti_dialogue_emit");
    assert.equal(plan.guarded_by, "DR-VAMA-5/dispatch-guard");

    assert.throws(
      () => buildArenaDispatchPlan({
        scene_key: "arena:test",
        speaker: egregore,
        utterance_intent: "try a tool",
        requested_tool_name: "khora_write",
      }),
      VamaShaktiDispatchRefused,
    );
  });
});
