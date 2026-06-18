// aletheia/modules/moirai-fair-comparison.ts
//
// Moirai — fair-comparison distillation for Mercurius Elo updates.
// Klotho records the candidate trial, Lachesis measures similarity, Atropos
// refuses uncalibrated updates when no comparable prior trial exists.

import type { EloContextTuple, EloRatingIdentity } from "./anansi-elo-index.ts";

export interface MoiraiTrialRecord {
  trial_id: string;
  trial_class: string;
  dispatch: EloRatingIdentity & {
    context_tuple: EloContextTuple;
    tournament: "agent" | "canon";
  };
  completed_at?: string;
}

export interface MoiraiComparisonConfig {
  elo: {
    fair_comparison_similarity_floor: number;
  };
}

export interface MoiraiSimilarityResult {
  guardian: "moirai";
  trial_a: string;
  trial_b: string;
  score: number;
  matched_fields: string[];
  compared_fields: string[];
}

export interface MoiraiComparisonDecision {
  guardian: "moirai";
  trial_id: string;
  comparable: boolean;
  klotho_trial: MoiraiTrialRecord;
  lachesis_best_match?: MoiraiTrialRecord;
  lachesis_similarity?: MoiraiSimilarityResult;
  atropos_decision: "update_allowed" | "uncalibrated_refusal";
  reason?: string;
}

const IDENTITY_FIELDS: ReadonlyArray<keyof EloRatingIdentity> = ["agent", "model", "harness", "skill"];
const CONTEXT_FIELDS: ReadonlyArray<keyof EloContextTuple> = [
  "vak_cp_position",
  "mef_lens",
  "content_class",
  "kairos_window",
  "cfp_thread_type",
  "r_factor_slot",
];

export function moirai_similarity_score(input: {
  trial_a: MoiraiTrialRecord;
  trial_b: MoiraiTrialRecord;
}): MoiraiSimilarityResult {
  const compared_fields = [
    "trial_class",
    "tournament",
    ...IDENTITY_FIELDS.map((field) => `dispatch.${field}`),
    ...CONTEXT_FIELDS.map((field) => `context.${field}`),
  ];
  const matched_fields = compared_fields.filter((field) => fieldValue(input.trial_a, field) === fieldValue(input.trial_b, field));
  return {
    guardian: "moirai",
    trial_a: input.trial_a.trial_id,
    trial_b: input.trial_b.trial_id,
    score: matched_fields.length / compared_fields.length,
    matched_fields,
    compared_fields,
  };
}

export function moirai_distil_comparison(input: {
  trial_id: string;
  trial_history: MoiraiTrialRecord[];
  config: MoiraiComparisonConfig;
}): MoiraiComparisonDecision {
  const klotho_trial = input.trial_history.find((trial) => trial.trial_id === input.trial_id);
  if (!klotho_trial) throw new Error(`Moirai comparison cannot find trial ${input.trial_id}.`);

  const best = input.trial_history
    .filter((trial) => trial.trial_id !== input.trial_id)
    .map((trial) => ({
      trial,
      similarity: moirai_similarity_score({ trial_a: klotho_trial, trial_b: trial }),
    }))
    .sort((a, b) => b.similarity.score - a.similarity.score)
    .shift();

  if (!best || best.similarity.score < input.config.elo.fair_comparison_similarity_floor) {
    return {
      guardian: "moirai",
      trial_id: input.trial_id,
      comparable: false,
      klotho_trial,
      lachesis_best_match: best?.trial,
      lachesis_similarity: best?.similarity,
      atropos_decision: "uncalibrated_refusal",
      reason: "no comparable prior trial met the configured fair-comparison floor",
    };
  }

  return {
    guardian: "moirai",
    trial_id: input.trial_id,
    comparable: true,
    klotho_trial,
    lachesis_best_match: best.trial,
    lachesis_similarity: best.similarity,
    atropos_decision: "update_allowed",
  };
}

function fieldValue(trial: MoiraiTrialRecord, field: string): string {
  if (field === "trial_class") return trial.trial_class;
  if (field === "tournament") return trial.dispatch.tournament;
  const identity = IDENTITY_FIELDS.find((candidate) => field === `dispatch.${candidate}`);
  if (identity) return trial.dispatch[identity];
  const context = CONTEXT_FIELDS.find((candidate) => field === `context.${candidate}`);
  if (context) return trial.dispatch.context_tuple[context];
  return "";
}
