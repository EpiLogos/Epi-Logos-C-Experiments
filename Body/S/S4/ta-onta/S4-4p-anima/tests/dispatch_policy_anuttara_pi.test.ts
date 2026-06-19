import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import {
  ANUTTARA_FULL_LANGUAGE_LAWS,
  resolveAnimaDispatchPolicy,
  type CandidateTriple,
  type DispatchPolicyConfig,
} from "../modules/dispatch-policy.ts";
import type { VakAddress } from "../../shared/vak_address.ts";

const config: DispatchPolicyConfig = {
  aletheia: {
    elo: {
      seed_rating: 1500,
      confidence_penalty_alpha: 0,
      bootstrap_trials: 10,
      bootstrap_sigma: 100,
      k_factor: 24,
      expected_score_base: 10,
      expected_score_divisor: 400,
      outcome_win: 1,
      outcome_loss: 0,
      outcome_draw: 0.5,
      fair_comparison_similarity_floor: 0.8,
    },
    drift_detection: {
      delta_elo: 40,
      trial_class_thresholds: {},
    },
  },
  anima: {
    dispatch_policy: {
      constitutional_role_fit_weight: 1,
      skill_applicability_weight: 1,
      model_availability_weight: 1,
      coverage_priority_weight: 1,
      rating_signal_weight: 1,
      heuristic_signal_weight: 1,
      fallback_constitutional_role_fit_weight: 1,
      fallback_skill_applicability_weight: 1,
      fallback_model_availability_weight: 1,
      fallback_coverage_priority_weight: 1,
      rating_normalization_divisor: 100,
      recency_bias_weight: 0,
      recency_bias_decay_ms: 60_000,
      untouched_recency_score: 0,
      bootstrap_cutoff_trials: 10,
      guardian_selection_score_floor: 0.1,
      guardian_max_count: 3,
      single_dispatch_count: 1,
      neutral_score: 0,
      veto_retry_count: 2,
      veto_severity_block_weight: 1,
      veto_severity_warn_weight: 0.5,
      composite_weight_r_verifier: 1,
      composite_weight_r_lens: 1,
      composite_weight_r_user: 1,
    },
  },
};

const vak: VakAddress = {
  cpf: "(4.0/1-4.4/5)",
  ct: ["CT5"],
  cp: "CP4.5",
  cf: "(5/0)",
  cfp: "CFP3",
  cs: { code: "CS0", direction: "Night'" },
};

function candidate(overrides: Partial<CandidateTriple>): CandidateTriple {
  return {
    candidate_id: "candidate",
    agent: "candidate",
    model: "local",
    skill_set: [],
    expert_kind: "constitutional",
    constitutional_role_fit: 0.5,
    skill_applicability: 0.5,
    model_availability: 1,
    coverage_priority: 0.5,
    slot_resolution: {
      slot_name: "slot",
      state: "local",
      reachable: true,
    },
    ...overrides,
  };
}

describe("Anima dispatch policy Anuttara-PI verification gate", () => {
  it("routes Sophia disclosure validation to Anuttara-PI with the full-7-laws query surface", () => {
    const decision = resolveAnimaDispatchPolicy({
      task: "Sophia disclosure validation before Aletheia ingest",
      vak_frame: vak,
      target_coord: "M5-4",
      mef_lens: "L5",
      content_class: "sophia_disclosure",
      kairos_window: "session-close",
      r_factor_slot: "R_verifier",
      dispatch_purpose: "verification",
      verification_trigger: "sophia_disclosure_validation",
      candidates: [
        candidate({
          candidate_id: "nara_pi",
          agent: "Nara-PI",
          skill_set: ["language-parse"],
          constitutional_role_fit: 1,
          skill_applicability: 1,
          coverage_priority: 1,
          slot_resolution: { slot_name: "nara_parser", state: "local", reachable: true },
        }),
        candidate({
          candidate_id: "epii_pi",
          agent: "Epii-PI",
          skill_set: ["energy-score"],
          constitutional_role_fit: 1,
          skill_applicability: 1,
          coverage_priority: 1,
          slot_resolution: { slot_name: "epii_judge", state: "cloud-opt-in", reachable: true },
        }),
        candidate({
          candidate_id: "anuttara_pi",
          agent: "Anuttara-PI",
          skill_set: ["language-membership-check", "typed-query-emission"],
          constitutional_role_fit: 0.1,
          skill_applicability: 0.1,
          coverage_priority: 0.1,
          slot_resolution: { slot_name: "anuttara_verifier", state: "local", reachable: true },
        }),
      ],
      ratings: [],
      now_ms: 10_000,
      config,
    });

    assert.deepEqual(decision.selected.map((score) => score.candidate_id), ["anuttara_pi"]);
    assert.equal(decision.trace.anuttara_verification?.agent_id, "anuttara_pi");
    assert.equal(decision.trace.anuttara_verification?.trigger, "sophia_disclosure_validation");
    assert.equal(decision.trace.anuttara_verification?.typed_query_surface, "full-7-laws");
    assert.deepEqual(decision.trace.anuttara_verification?.coordinate_language_laws, ANUTTARA_FULL_LANGUAGE_LAWS);
    assert.ok(decision.trace.anuttara_verification?.gateway_methods.includes("s0'.verifier.emit_query"));
    assert.ok(!decision.trace.anuttara_verification?.coordinate_language_laws.includes("law-6-minimal-only"));
    assert.match(decision.trace.selection_rationale, /Anuttara-PI/i);
  });
});
