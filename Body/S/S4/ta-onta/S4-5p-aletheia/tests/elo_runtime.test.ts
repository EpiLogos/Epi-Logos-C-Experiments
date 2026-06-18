import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import {
  anansi_index_rating,
  anansi_resolve_context,
  create_anansi_rating_index,
  type EloContextTuple,
} from "../modules/anansi-elo-index.ts";
import { janus_threshold_elo_delta } from "../modules/janus-threshold.ts";
import {
  create_mercurius_elo_store,
  effective_rating,
  mercurius_record_trial,
  mercurius_update_elo,
  parseAletheiaConfigToml,
  type AletheiaEloConfig,
} from "../modules/mercurius-elo.ts";
import { moirai_distil_comparison, moirai_similarity_score } from "../modules/moirai-fair-comparison.ts";

const CONFIG_TEXT = `
[aletheia.elo]
seed_rating = 1500
confidence_penalty_alpha = 2
bootstrap_trials = 5
bootstrap_sigma = 80
k_factor = 32
expected_score_base = 10
expected_score_divisor = 400
outcome_win = 1
outcome_loss = 0
outcome_draw = 0.5
fair_comparison_similarity_floor = 0.8

[aletheia.drift_detection]
delta_elo = 0

[aletheia.drift_detection.trial_class_thresholds]
canon = 4
`;

const CONFIG: AletheiaEloConfig = parseAletheiaConfigToml(CONFIG_TEXT);

const CONTEXT: EloContextTuple = {
  vak_cp_position: "CP4",
  mef_lens: "L5",
  content_class: "implementation",
  kairos_window: "day",
  cfp_thread_type: "CFP3",
  r_factor_slot: "R0",
};

const DISPATCH = {
  agent: "mercurius",
  model: "claude-opus",
  harness: "pi-agent",
  skill: "aletheia-elo-rating",
  context_tuple: CONTEXT,
  tournament: "agent" as const,
};

describe("Aletheia Elo config", () => {
  it("resolves Elo and drift thresholds from TOML sections", () => {
    assert.equal(CONFIG.elo.seed_rating, 1500);
    assert.equal(CONFIG.elo.bootstrap_sigma, 80);
    assert.equal(CONFIG.drift_detection.delta_elo, 0);
    assert.equal(CONFIG.drift_detection.trial_class_thresholds?.canon, 4);
  });
});

describe("Anansi coordinate-conditional index", () => {
  it("indexes ratings by the expanded context tuple including CFP thread and R-factor slot", () => {
    const index = create_anansi_rating_index();
    anansi_index_rating({
      index,
      rating_record: {
        ...DISPATCH,
        channel: "R_verifier",
        rating: 1516,
        sigma: 70,
        trial_count: 1,
      },
    });

    assert.equal(
      anansi_resolve_context({
        index,
        context_query: { vak_cp_position: "CP4", cfp_thread_type: "CFP3", r_factor_slot: "R0" },
      }).entries.length,
      1,
    );
    assert.equal(
      anansi_resolve_context({
        index,
        context_query: { vak_cp_position: "CP4", cfp_thread_type: "CFP1", r_factor_slot: "R0" },
      }).entries.length,
      0,
    );
  });
});

describe("Janus Elo threshold", () => {
  it("uses configured trial-class thresholds before the default drift threshold", () => {
    const miss = janus_threshold_elo_delta({ delta: 3, trial_class: "canon", config: CONFIG });
    const hit = janus_threshold_elo_delta({ delta: 4, trial_class: "canon", config: CONFIG });
    assert.equal(miss.accepted, false);
    assert.equal(hit.accepted, true);
    assert.equal(hit.threshold, 4);
  });
});

describe("Moirai fair comparison", () => {
  it("scores comparable trials from the real dispatch and context fields", () => {
    const first = { trial_id: "trial-a", trial_class: "agent", dispatch: DISPATCH };
    const second = { trial_id: "trial-b", trial_class: "agent", dispatch: DISPATCH };
    const score = moirai_similarity_score({ trial_a: first, trial_b: second });
    assert.equal(score.score, 1);
    assert.ok(score.matched_fields.includes("context.cfp_thread_type"));
    assert.ok(score.matched_fields.includes("context.r_factor_slot"));
  });

  it("refuses an update when no comparable prior trial meets the configured floor", () => {
    const decision = moirai_distil_comparison({
      trial_id: "trial-a",
      trial_history: [{ trial_id: "trial-a", trial_class: "agent", dispatch: DISPATCH }],
      config: CONFIG,
    });
    assert.equal(decision.comparable, false);
    assert.equal(decision.atropos_decision, "uncalibrated_refusal");
  });
});

describe("Mercurius multi-channel Elo bookkeeping", () => {
  it("records dispatch and canon trials in one store, refuses the uncalibrated first update, then updates by channel", () => {
    const store = create_mercurius_elo_store();
    mercurius_record_trial({
      store,
      trial_id: "agent-trial-a",
      dispatch: DISPATCH,
      outcomes: { channels: { R_verifier: { score: CONFIG.elo.outcome_win } } },
    });

    const refused = mercurius_update_elo({ trial_id: "agent-trial-a", store, config: CONFIG });
    assert.equal(refused.comparison.comparable, false);
    assert.equal(refused.events[0].event, "aletheia.elo.uncalibrated-refusal");

    mercurius_record_trial({
      store,
      trial_id: "canon-trial-a",
      dispatch: { ...DISPATCH, tournament: "canon", agent: "research-move" },
      outcomes: { channels: { R_user: { score: CONFIG.elo.outcome_draw } } },
    });
    mercurius_record_trial({
      store,
      trial_id: "agent-trial-b",
      dispatch: DISPATCH,
      outcomes: {
        channels: {
          R_verifier: { score: CONFIG.elo.outcome_win },
          R_lens: { score: CONFIG.elo.outcome_draw },
        },
      },
    });

    const updated = mercurius_update_elo({ trial_id: "agent-trial-b", store, config: CONFIG });
    assert.equal(updated.comparison.comparable, true);
    assert.deepEqual(
      updated.updated_ratings.map((rating) => rating.channel).sort(),
      ["R_lens", "R_verifier"],
    );
    assert.ok(updated.events.some((event) => event.event === "aletheia.elo.rating-updated"));
    assert.equal(store.trial_log.get("canon-trial-a")?.dispatch.tournament, "canon");
    assert.ok(effective_rating(updated.updated_ratings[0], CONFIG) < updated.updated_ratings[0].rating);
  });
});
