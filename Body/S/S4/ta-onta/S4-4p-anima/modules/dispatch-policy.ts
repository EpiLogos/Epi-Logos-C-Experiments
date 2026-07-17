// Anima MoE dispatch policy.
//
// This module is the inspectable gating function for the coordinate-conditional
// MoE described in [[M'-AGENTIC-RUNTIME-SPEC]] §5. It is pure policy code:
// callers supply candidate triples, Mercurius rating-state, resolved model
// slots, user-context state, and config loaded from ~/.epi-logos/config.toml.
// No threshold, coefficient, retry count, or bootstrap cutoff is pinned here.

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { VakAddress } from "../../shared/vak_address.ts";
import { constitutionalTeamForCf } from "../extension/capabilities.ts";
import type {
  EloChannel,
  EloContextTuple,
  EloRatingRecord,
} from "../../S4-5p-aletheia/modules/anansi-elo-index.ts";
import type { AletheiaEloConfig } from "../../S4-5p-aletheia/modules/mercurius-elo.ts";
import {
  parentSliceChildDispatchCommand,
  redactParentSliceForChild,
  type ConversationSliceHandle,
} from "./parent-slice.ts";

export type DispatchPurpose =
  | "task"
  | "calibration"
  | "aletheia_crystallisation"
  | "verification";

export type HarnessDispatchPurpose = "implement" | "review" | "explore" | "search" | "converse";

export type VerificationTrigger =
  | "emission_type_check"
  | "sophia_disclosure_validation"
  | "hen_promotion_gate"
  | "m5_4_review";

export type ExpertKind = "constitutional" | "aletheia_guardian";
export type SlotResolutionState = "local" | "cloud-opt-in" | "null";

export interface DispatchPolicyConfig {
  aletheia: AletheiaEloConfig;
  anima: {
    dispatch_policy: {
      constitutional_role_fit_weight: number;
      skill_applicability_weight: number;
      model_availability_weight: number;
      coverage_priority_weight: number;
      rating_signal_weight: number;
      heuristic_signal_weight: number;
      fallback_constitutional_role_fit_weight: number;
      fallback_skill_applicability_weight: number;
      fallback_model_availability_weight: number;
      fallback_coverage_priority_weight: number;
      rating_normalization_divisor: number;
      recency_bias_weight: number;
      recency_bias_decay_ms: number;
      untouched_recency_score: number;
      bootstrap_cutoff_trials: number;
      guardian_selection_score_floor: number;
      guardian_max_count: number;
      single_dispatch_count: number;
      neutral_score: number;
      veto_retry_count: number;
      veto_severity_block_weight: number;
      veto_severity_warn_weight: number;
      composite_weight_r_verifier: number;
      composite_weight_r_lens: number;
      composite_weight_r_user: number;
    };
  };
  harness?: HarnessRouterConfig;
}

export interface HarnessRouterConfig {
  subscription: Record<string, string>;
  cost_class: Record<string, string>;
}

export interface HarnessRosterEntry {
  harness_id: string;
  available: boolean;
  authenticated: boolean;
  model_families: string[];
  subscription?: string;
}

export interface HarnessRouterRequest {
  purpose: HarnessDispatchPurpose;
  roster: HarnessRosterEntry[];
  model_slot_by_family: Record<string, string>;
  implementer_model_family?: string;
  parent_session_key?: string;
  parent_slice?: ConversationSliceHandle;
  worktree?: string;
}

export interface HarnessDispatchRequest extends HarnessRouterRequest {
  vak_frame: VakAddress;
  config: HarnessRouterConfig;
}

export interface HarnessDispatch {
  harness_id: string;
  model_family: string;
  model_slot: string;
  purpose: HarnessDispatchPurpose;
  parent_session_key?: string;
  parent_slice?: ConversationSliceHandle;
  worktree?: string;
  vak_address: VakAddress;
  cost_class: string;
  subscription: string;
  selection_rationale: string;
}

export interface CandidateTriple {
  candidate_id: string;
  agent: string;
  model: string;
  skill_set: string[];
  expert_kind: ExpertKind;
  constitutional_role_fit: number;
  skill_applicability: number;
  model_availability: number;
  coverage_priority: number;
  slot_resolution: SlotResolution;
  last_dispatched_at_ms?: number;
  guardian_task_class?: string;
}

export interface SlotResolution {
  slot_name: string;
  state: SlotResolutionState;
  reachable: boolean;
  notice?: string;
}

export interface UserContextState {
  skill_fired: boolean;
  frame_id?: string;
  recognized?: boolean;
}

export interface DispatchPolicyRequest {
  task: string;
  vak_frame: VakAddress;
  target_coord?: string;
  mef_lens: string;
  content_class: string;
  kairos_window: string;
  r_factor_slot: string;
  dispatch_purpose: DispatchPurpose;
  verification_trigger?: VerificationTrigger;
  candidates: CandidateTriple[];
  ratings: EloRatingRecord[];
  user_context?: UserContextState;
  harness_router?: HarnessRouterRequest;
  now_ms: number;
  config: DispatchPolicyConfig;
  override_policy?: DispatchOverridePolicy;
}

export interface DispatchOverridePolicy {
  bypass_elo: true;
  candidate_ids: string[];
  rationale: string;
}

export interface CandidateScore {
  candidate_id: string;
  agent: string;
  model: string;
  skill_set: string[];
  expert_kind: ExpertKind;
  lookup_key: EloContextTuple;
  eligible: boolean;
  ineligible_reason?: string;
  rating_records: Partial<Record<EloChannel, EloRatingRecord>>;
  channel_scores: Partial<Record<EloChannel, number>>;
  composite_rating: number;
  heuristic_score: number;
  bootstrap_blend: number;
  recency_adjustment: number;
  final_score: number;
  rationale: string[];
}

export interface DispatchTrace {
  event: "DispatchTrace";
  monitor_panel: "pi-runtime-monitor.moe-gating-audit";
  dispatch_purpose: DispatchPurpose;
  task: string;
  target_coord?: string;
  candidate_set: Array<Pick<CandidateTriple, "candidate_id" | "agent" | "model" | "skill_set" | "expert_kind">>;
  rating_lookup_key: EloContextTuple;
  user_context?: UserContextState;
  override_applied?: DispatchOverridePolicy;
  fallback_applications: string[];
  scores: CandidateScore[];
  selected_candidate_ids: string[];
  constitutional_team?: string[];
  tmux_topology_decisions: TmuxTopologyDecisionEvent[];
  selection_rationale: string;
  anuttara_verification?: AnuttaraVerificationPlan;
  veto_handling?: VetoHandlingPlan;
  harness_dispatch?: HarnessDispatch;
}

export type CmuxTopologyLayout = "CFP0" | "CFP1" | "CFP3";

export interface CmuxTopologyMap {
  day_session: string;
  anima_dispatch_window: string;
  child_task_pane: string;
  cfp_layout: CmuxTopologyLayout;
  vak_address: VakAddress;
}

export interface TmuxTopologyDecisionEvent {
  event: "tmux_topology_decision";
  topology: CmuxTopologyMap;
  session_key?: string;
  role: string;
  agent: string;
  parent_slice?: ConversationSliceHandle;
  child_dispatch_command?: string;
}

export const ANUTTARA_FULL_LANGUAGE_LAWS = [
  "law-1-void-grammar-root",
  "law-2-first-non-duality",
  "law-3-zero-zero-paramesvara",
  "law-4-archetypal-number-language",
  "law-5-holographic-matrix",
  "law-6-siva-shakti-operator-surface",
  "law-7-coordinate-phase-preservation",
] as const;

export const ANUTTARA_VERIFIER_GATEWAY_METHODS = [
  "s0'.verifier.check_state",
  "s0'.verifier.emit_query",
  "s0'.verifier.validate_membership",
  "s0'.verifier.owl_query",
] as const;

export interface AnuttaraVerificationPlan {
  agent_id: "anuttara_pi";
  slot_name: "anuttara_verifier";
  trigger: VerificationTrigger;
  typed_query_surface: "full-7-laws";
  coordinate_language_laws: readonly string[];
  gateway_methods: readonly string[];
}

export interface VetoHandlingPlan {
  primitive: "aletheia_guardian_veto";
  retry_count: number;
  severity_weights: {
    block: number;
    warn: number;
  };
  selected_guardians: string[];
}

export interface DispatchPolicyDecision {
  selected: CandidateScore[];
  trace: DispatchTrace;
  harness_dispatch?: HarnessDispatch;
}

const CHANNELS: ReadonlyArray<EloChannel> = ["R_verifier", "R_lens", "R_user"];
const REQUIRED_ALETHEIA_ELO_KEYS: ReadonlyArray<keyof DispatchPolicyConfig["aletheia"]["elo"]> = [
  "seed_rating",
  "confidence_penalty_alpha",
  "bootstrap_trials",
  "bootstrap_sigma",
  "k_factor",
  "expected_score_base",
  "expected_score_divisor",
  "outcome_win",
  "outcome_loss",
  "outcome_draw",
  "fair_comparison_similarity_floor",
];
const REQUIRED_ALETHEIA_DRIFT_KEYS: ReadonlyArray<keyof DispatchPolicyConfig["aletheia"]["drift_detection"]> = [
  "delta_elo",
];
const REQUIRED_ANIMA_POLICY_KEYS: ReadonlyArray<keyof DispatchPolicyConfig["anima"]["dispatch_policy"]> = [
  "constitutional_role_fit_weight",
  "skill_applicability_weight",
  "model_availability_weight",
  "coverage_priority_weight",
  "rating_signal_weight",
  "heuristic_signal_weight",
  "fallback_constitutional_role_fit_weight",
  "fallback_skill_applicability_weight",
  "fallback_model_availability_weight",
  "fallback_coverage_priority_weight",
  "rating_normalization_divisor",
  "recency_bias_weight",
  "recency_bias_decay_ms",
  "untouched_recency_score",
  "bootstrap_cutoff_trials",
  "guardian_selection_score_floor",
  "guardian_max_count",
  "single_dispatch_count",
  "neutral_score",
  "veto_retry_count",
  "veto_severity_block_weight",
  "veto_severity_warn_weight",
  "composite_weight_r_verifier",
  "composite_weight_r_lens",
  "composite_weight_r_user",
];

export function resolveAnimaDispatchPolicy(input: DispatchPolicyRequest): DispatchPolicyDecision {
  const lookup_key = ratingLookupKey(input);
  const candidate_set = input.candidates.map(({ candidate_id, agent, model, skill_set, expert_kind }) => ({
    candidate_id,
    agent,
    model,
    skill_set,
    expert_kind,
  }));

  if (input.override_policy) {
    const scores = input.candidates.map((candidate) => scoreCandidate(input, lookup_key, candidate));
    const selected = selectOverrideCandidates(scores, input.override_policy);
    const harness_dispatch = input.harness_router
      ? resolveHarnessDispatch({
        ...input.harness_router,
        vak_frame: input.vak_frame,
        config: input.config.harness ?? { subscription: {}, cost_class: {} },
      })
      : undefined;
    return {
      selected,
      harness_dispatch,
      trace: buildTrace({
        input,
        lookup_key,
        candidate_set,
        scores,
        selected,
        fallback_applications: ["override_policy_bypassed_elo"],
        selection_rationale: input.override_policy.rationale,
        override_applied: input.override_policy,
        harness_dispatch,
      }),
    };
  }

  const scores = input.candidates.map((candidate) => scoreCandidate(input, lookup_key, candidate));
  const eligible = scores.filter((score) => score.eligible);
  const fallback_applications = collectFallbackApplications(scores, input);
  const selected = selectPolicyCandidates(eligible, input);
  const veto_handling = input.dispatch_purpose === "aletheia_crystallisation"
    ? buildVetoHandling(input, selected)
    : undefined;
  const anuttara_verification = isVerificationDispatch(input)
    ? buildAnuttaraVerificationPlan(input)
    : undefined;
  const harness_dispatch = input.harness_router
    ? resolveHarnessDispatch({
      ...input.harness_router,
      vak_frame: input.vak_frame,
      config: input.config.harness ?? { subscription: {}, cost_class: {} },
    })
    : undefined;

  return {
    selected,
    harness_dispatch,
    trace: buildTrace({
      input,
      lookup_key,
      candidate_set,
      scores,
      selected,
      fallback_applications,
      selection_rationale: selectionRationale(input, selected),
      anuttara_verification,
      veto_handling,
      harness_dispatch,
    }),
  };
}

export function resolveHarnessDispatch(input: HarnessDispatchRequest): HarnessDispatch {
  const model_family = selectModelFamily(input);
  const model_slot = input.model_slot_by_family[model_family];
  if (!model_slot) {
    throw new Error(`No resolved model slot for selected model family ${model_family}.`);
  }
  const harness = selectCheapestHarnessForFamily(input.roster, model_family, input.config);
  const cost_class = input.config.cost_class[model_family] ?? "standard";
  const subscription = harness.subscription ?? input.config.subscription[harness.harness_id] ?? "metered-api";
  return {
    harness_id: harness.harness_id,
    model_family,
    model_slot,
    purpose: input.purpose,
    parent_session_key: input.parent_session_key,
    parent_slice: input.parent_slice ? redactParentSliceForChild(input.parent_slice) : undefined,
    worktree: input.worktree,
    vak_address: input.vak_frame,
    cost_class,
    subscription,
    selection_rationale:
      `selected ${model_family} for ${input.purpose} task, then ${harness.harness_id} as cheapest authenticated available harness for that family`,
  };
}

export async function loadDispatchPolicyConfig(input: {
  path?: string;
  homeDir?: string;
  readText?: (path: string) => Promise<string>;
} = {}): Promise<DispatchPolicyConfig> {
  const path = input.path ?? join(input.homeDir ?? process.env.HOME ?? "~", ".epi-logos", "config.toml");
  const readText = input.readText ?? ((target: string) => readFile(target, "utf8"));
  return parseDispatchPolicyConfigToml(await readText(path));
}

export async function loadDispatchOverridePolicy(input: {
  path: string;
  readText?: (path: string) => Promise<string>;
}): Promise<DispatchOverridePolicy> {
  const readText = input.readText ?? ((target: string) => readFile(target, "utf8"));
  const parsed = parseTomlSections(await readText(input.path));
  const section = parsed["anima.dispatch_override"];
  if (!section) throw new Error("Missing [anima.dispatch_override] override-policy section.");
  const candidate_ids = requiredStringList(parsed, "anima.dispatch_override", "candidate_ids");
  const rationale = requiredString(parsed, "anima.dispatch_override", "rationale");
  return { bypass_elo: true, candidate_ids, rationale };
}

export function parseDispatchPolicyConfigToml(text: string): DispatchPolicyConfig {
  const parsed = parseTomlSections(text);
  const elo = Object.fromEntries(
    REQUIRED_ALETHEIA_ELO_KEYS.map((key) => [key, requiredNumber(parsed, "aletheia.elo", key)]),
  ) as DispatchPolicyConfig["aletheia"]["elo"];
  const drift_detection = Object.fromEntries(
    REQUIRED_ALETHEIA_DRIFT_KEYS.map((key) => [key, requiredNumber(parsed, "aletheia.drift_detection", key)]),
  ) as DispatchPolicyConfig["aletheia"]["drift_detection"];
  drift_detection.trial_class_thresholds = collectNestedNumbers(parsed, "aletheia.drift_detection.trial_class_thresholds");
  const dispatch_policy = Object.fromEntries(
    REQUIRED_ANIMA_POLICY_KEYS.map((key) => [key, requiredNumber(parsed, "anima.dispatch_policy", key)]),
  ) as DispatchPolicyConfig["anima"]["dispatch_policy"];
  const harness = {
    subscription: collectStringMap(parsed, "harness.subscription"),
    cost_class: collectStringMap(parsed, "harness.cost_class"),
  };
  return {
    aletheia: { elo, drift_detection },
    anima: { dispatch_policy },
    harness: Object.keys(harness.subscription).length || Object.keys(harness.cost_class).length ? harness : undefined,
  };
}

function scoreCandidate(
  input: DispatchPolicyRequest,
  lookup_key: EloContextTuple,
  candidate: CandidateTriple,
): CandidateScore {
  const eligibility = candidateEligibility(candidate);
  const rating_records = recordsForCandidate(input.ratings, candidate, lookup_key);
  const channel_scores = channelScores(rating_records, input.config);
  const composite_rating = compositeRating(channel_scores, input.config);
  const heuristic_score = heuristicScore(candidate, input.config);
  const bootstrap_blend = bootstrapBlend(rating_records, input.config);
  const recency_adjustment = recencyAdjustment(candidate, input);
  const final_score = finalScore({
    composite_rating,
    heuristic_score,
    bootstrap_blend,
    recency_adjustment,
    config: input.config,
  });
  return {
    candidate_id: candidate.candidate_id,
    agent: candidate.agent,
    model: candidate.model,
    skill_set: candidate.skill_set,
    expert_kind: candidate.expert_kind,
    lookup_key,
    eligible: eligibility.eligible,
    ineligible_reason: eligibility.reason,
    rating_records,
    channel_scores,
    composite_rating,
    heuristic_score,
    bootstrap_blend,
    recency_adjustment,
    final_score,
    rationale: scoreRationale(candidate, rating_records, bootstrap_blend, recency_adjustment, eligibility),
  };
}

function candidateEligibility(candidate: CandidateTriple): { eligible: boolean; reason?: string } {
  if (candidate.slot_resolution.state === "null") {
    return { eligible: false, reason: "slot_resolution_null" };
  }
  if (!candidate.slot_resolution.reachable) {
    return { eligible: false, reason: "model_slot_unreachable" };
  }
  return { eligible: true };
}

function recordsForCandidate(
  records: EloRatingRecord[],
  candidate: CandidateTriple,
  lookup_key: EloContextTuple,
): Partial<Record<EloChannel, EloRatingRecord>> {
  const matched = records.filter((record) => {
    return record.agent === candidate.agent &&
      record.model === candidate.model &&
      candidate.skill_set.includes(record.skill) &&
      contextMatches(record.context_tuple, lookup_key);
  });
  return Object.fromEntries(CHANNELS.flatMap((channel) => {
    const record = matched
      .filter((candidate_record) => candidate_record.channel === channel)
      .sort((a, b) => b.trial_count - a.trial_count)[0];
    return record ? [[channel, record]] : [];
  }));
}

function channelScores(
  records: Partial<Record<EloChannel, EloRatingRecord>>,
  config: DispatchPolicyConfig,
): Partial<Record<EloChannel, number>> {
  return Object.fromEntries(CHANNELS.flatMap((channel) => {
    const record = records[channel];
    if (!record) return [];
    const score =
      (record.rating - config.aletheia.elo.seed_rating - config.aletheia.elo.confidence_penalty_alpha * record.sigma) /
      config.anima.dispatch_policy.rating_normalization_divisor;
    return [[channel, score]];
  }));
}

function compositeRating(
  channel_scores: Partial<Record<EloChannel, number>>,
  config: DispatchPolicyConfig,
): number {
  return (
    (channel_scores.R_verifier ?? config.anima.dispatch_policy.neutral_score) *
      config.anima.dispatch_policy.composite_weight_r_verifier +
    (channel_scores.R_lens ?? config.anima.dispatch_policy.neutral_score) *
      config.anima.dispatch_policy.composite_weight_r_lens +
    (channel_scores.R_user ?? config.anima.dispatch_policy.neutral_score) *
      config.anima.dispatch_policy.composite_weight_r_user
  );
}

function heuristicScore(candidate: CandidateTriple, config: DispatchPolicyConfig): number {
  return (
    candidate.constitutional_role_fit *
      config.anima.dispatch_policy.constitutional_role_fit_weight *
      config.anima.dispatch_policy.fallback_constitutional_role_fit_weight +
    candidate.skill_applicability *
      config.anima.dispatch_policy.skill_applicability_weight *
      config.anima.dispatch_policy.fallback_skill_applicability_weight +
    candidate.model_availability *
      config.anima.dispatch_policy.model_availability_weight *
      config.anima.dispatch_policy.fallback_model_availability_weight +
    candidate.coverage_priority *
      config.anima.dispatch_policy.coverage_priority_weight *
      config.anima.dispatch_policy.fallback_coverage_priority_weight
  );
}

function bootstrapBlend(
  records: Partial<Record<EloChannel, EloRatingRecord>>,
  config: DispatchPolicyConfig,
): number {
  const total_trials = Object.values(records).reduce(
    (sum, record) => sum + (record?.trial_count ?? config.anima.dispatch_policy.neutral_score),
    config.anima.dispatch_policy.neutral_score,
  );
  return total_trials / (total_trials + config.anima.dispatch_policy.bootstrap_cutoff_trials);
}

function recencyAdjustment(candidate: CandidateTriple, input: DispatchPolicyRequest): number {
  if (candidate.last_dispatched_at_ms === undefined) {
    return input.config.anima.dispatch_policy.untouched_recency_score * input.config.anima.dispatch_policy.recency_bias_weight;
  }
  const age = Math.max(
    input.config.anima.dispatch_policy.neutral_score,
    input.now_ms - candidate.last_dispatched_at_ms,
  );
  const decay = Math.exp(-age / input.config.anima.dispatch_policy.recency_bias_decay_ms);
  return (input.config.aletheia.elo.outcome_win - decay) * input.config.anima.dispatch_policy.recency_bias_weight;
}

function finalScore(input: {
  composite_rating: number;
  heuristic_score: number;
  bootstrap_blend: number;
  recency_adjustment: number;
  config: DispatchPolicyConfig;
}): number {
  const rating_signal =
    input.composite_rating *
    input.bootstrap_blend *
    input.config.anima.dispatch_policy.rating_signal_weight;
  const heuristic_signal =
    input.heuristic_score *
    (input.config.aletheia.elo.outcome_win - input.bootstrap_blend) *
    input.config.anima.dispatch_policy.heuristic_signal_weight;
  return rating_signal + heuristic_signal + input.recency_adjustment;
}

function selectPolicyCandidates(
  eligible: CandidateScore[],
  input: DispatchPolicyRequest,
): CandidateScore[] {
  const sorted = [...eligible].sort((a, b) => b.final_score - a.final_score);
  if (isVerificationDispatch(input)) {
    const anuttara = sorted.filter(isAnuttaraPiScore);
    return anuttara.slice(
      input.config.anima.dispatch_policy.neutral_score,
      input.config.anima.dispatch_policy.single_dispatch_count,
    );
  }
  if (input.dispatch_purpose !== "aletheia_crystallisation") {
    return sorted.slice(
      input.config.anima.dispatch_policy.neutral_score,
      input.config.anima.dispatch_policy.single_dispatch_count,
    );
  }
  const guardian_scores = sorted.filter((score) => score.expert_kind === "aletheia_guardian");
  const above_floor = guardian_scores.filter((score) => {
    return score.final_score >= input.config.anima.dispatch_policy.guardian_selection_score_floor;
  });
  const selected = above_floor.length ? above_floor : guardian_scores.slice(
    input.config.anima.dispatch_policy.neutral_score,
    input.config.anima.dispatch_policy.single_dispatch_count,
  );
  return selected.slice(
    input.config.anima.dispatch_policy.neutral_score,
    input.config.anima.dispatch_policy.guardian_max_count,
  );
}

function selectOverrideCandidates(
  scores: CandidateScore[],
  override_policy: DispatchOverridePolicy,
): CandidateScore[] {
  const selected = scores.filter((score) => override_policy.candidate_ids.includes(score.candidate_id));
  if (selected.length !== override_policy.candidate_ids.length) {
    const found = new Set(selected.map((score) => score.candidate_id));
    const missing = override_policy.candidate_ids.filter((candidate_id) => !found.has(candidate_id));
    throw new Error(`Override policy references unknown candidate_id(s): ${missing.join(", ")}`);
  }
  return selected;
}

function buildTrace(input: {
  input: DispatchPolicyRequest;
  lookup_key: EloContextTuple;
  candidate_set: DispatchTrace["candidate_set"];
  scores: CandidateScore[];
  selected: CandidateScore[];
  fallback_applications: string[];
  selection_rationale: string;
  anuttara_verification?: AnuttaraVerificationPlan;
  override_applied?: DispatchOverridePolicy;
  veto_handling?: VetoHandlingPlan;
  harness_dispatch?: HarnessDispatch;
}): DispatchTrace {
  return {
    event: "DispatchTrace",
    monitor_panel: "pi-runtime-monitor.moe-gating-audit",
    dispatch_purpose: input.input.dispatch_purpose,
    task: input.input.task,
    target_coord: input.input.target_coord,
    candidate_set: input.candidate_set,
    rating_lookup_key: input.lookup_key,
    user_context: input.input.user_context,
    override_applied: input.override_applied,
    fallback_applications: input.fallback_applications,
    scores: input.scores,
    selected_candidate_ids: input.selected.map((score) => score.candidate_id),
    constitutional_team: constitutionalTeamForCf(input.input.vak_frame.cf),
    tmux_topology_decisions: buildTmuxTopologyDecisions(input.input, input.selected, input.harness_dispatch),
    selection_rationale: input.selection_rationale,
    anuttara_verification: input.anuttara_verification,
    veto_handling: input.veto_handling,
    harness_dispatch: input.harness_dispatch,
  };
}

function buildTmuxTopologyDecisions(
  input: DispatchPolicyRequest,
  selected: CandidateScore[],
  harness_dispatch?: HarnessDispatch,
): TmuxTopologyDecisionEvent[] {
  if (!isCmuxTopologyLayout(input.vak_frame.cfp)) return [];

  const day = new Date(input.now_ms).toISOString().slice(0, 10);
  return selected.map((candidate) => {
    const role = topologyToken(candidate.agent);
    const task_id = topologyToken(candidate.candidate_id);
    return {
      event: "tmux_topology_decision",
      topology: {
        day_session: `epi-${day}`,
        anima_dispatch_window: `w-${role}`,
        child_task_pane: `p-${role}-${task_id}`,
        cfp_layout: input.vak_frame.cfp,
        vak_address: input.vak_frame,
      },
      session_key: harness_dispatch?.parent_session_key,
      role,
      agent: candidate.agent,
      parent_slice: harness_dispatch?.parent_slice,
      child_dispatch_command: harness_dispatch?.parent_slice
        ? parentSliceChildDispatchCommand({
          target_agent: candidate.agent,
          task_spec: input.task,
          vak_frame: input.vak_frame,
          parent_slice: harness_dispatch.parent_slice,
        })
        : undefined,
    };
  });
}

function isCmuxTopologyLayout(cfp: VakAddress["cfp"]): cfp is CmuxTopologyLayout {
  return cfp === "CFP0" || cfp === "CFP1" || cfp === "CFP3";
}

function topologyToken(value: string): string {
  const normalized = value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return normalized || "unnamed";
}

function selectModelFamily(input: HarnessDispatchRequest): string {
  const routable = routableFamilies(input);
  if (!routable.length) {
    throw new Error("No authenticated available harness can serve any resolved model family.");
  }
  const diverse = input.purpose === "review" && input.implementer_model_family
    ? routable.filter((family) => family !== input.implementer_model_family)
    : routable;
  const candidates = diverse.length ? diverse : routable;
  return [...candidates].sort((a, b) => compareModelFamilies(a, b, input))[0];
}

function routableFamilies(input: HarnessDispatchRequest): string[] {
  const families = new Set<string>();
  for (const harness of input.roster) {
    if (!isHarnessRoutable(harness)) continue;
    for (const family of harness.model_families) {
      if (input.model_slot_by_family[family]) families.add(family);
    }
  }
  return [...families];
}

function compareModelFamilies(left: string, right: string, input: HarnessDispatchRequest): number {
  const left_rank = familyCostRank(input.config.cost_class[left]);
  const right_rank = familyCostRank(input.config.cost_class[right]);
  if (input.purpose === "explore" || input.purpose === "search" || input.purpose === "converse") {
    return left_rank - right_rank || left.localeCompare(right);
  }
  return right_rank - left_rank || left.localeCompare(right);
}

function selectCheapestHarnessForFamily(
  roster: HarnessRosterEntry[],
  model_family: string,
  config: HarnessRouterConfig,
): HarnessRosterEntry {
  const candidates = roster.filter((harness) => {
    return isHarnessRoutable(harness) && harness.model_families.includes(model_family);
  });
  if (!candidates.length) {
    throw new Error(`No authenticated available harness can serve model family ${model_family}.`);
  }
  return [...candidates].sort((left, right) => {
    const left_subscription = left.subscription ?? config.subscription[left.harness_id] ?? "metered-api";
    const right_subscription = right.subscription ?? config.subscription[right.harness_id] ?? "metered-api";
    return subscriptionRank(left_subscription) - subscriptionRank(right_subscription) ||
      left.harness_id.localeCompare(right.harness_id);
  })[0];
}

function isHarnessRoutable(harness: HarnessRosterEntry): boolean {
  return harness.available && harness.authenticated;
}

function familyCostRank(cost_class = "standard"): number {
  const normalized = cost_class.toLowerCase();
  if (normalized.includes("cheap") || normalized.includes("local")) return 0;
  if (normalized.includes("strong") || normalized.includes("premium") || normalized.includes("hard")) return 2;
  return 1;
}

function subscriptionRank(subscription = "metered-api"): number {
  const normalized = subscription.toLowerCase();
  if (normalized.includes("none") || normalized.includes("unauth")) return 100;
  if (normalized.includes("metered") || normalized.includes("api") || normalized.includes("per-token")) return 20;
  return 0;
}

function isVerificationDispatch(input: DispatchPolicyRequest): boolean {
  return input.dispatch_purpose === "verification" || input.verification_trigger !== undefined;
}

function isAnuttaraPiScore(score: CandidateScore): boolean {
  const agent = score.agent.toLowerCase().replace(/[-\s]/g, "_");
  return score.candidate_id === "anuttara_pi" ||
    agent === "anuttara_pi" ||
    agent === "anuttara_verifier" ||
    score.skill_set.includes("language-membership-check") ||
    score.skill_set.includes("typed-query-emission");
}

function buildAnuttaraVerificationPlan(input: DispatchPolicyRequest): AnuttaraVerificationPlan {
  return {
    agent_id: "anuttara_pi",
    slot_name: "anuttara_verifier",
    trigger: input.verification_trigger ?? "emission_type_check",
    typed_query_surface: "full-7-laws",
    coordinate_language_laws: ANUTTARA_FULL_LANGUAGE_LAWS,
    gateway_methods: ANUTTARA_VERIFIER_GATEWAY_METHODS,
  };
}

function buildVetoHandling(
  input: DispatchPolicyRequest,
  selected: CandidateScore[],
): VetoHandlingPlan {
  return {
    primitive: "aletheia_guardian_veto",
    retry_count: input.config.anima.dispatch_policy.veto_retry_count,
    severity_weights: {
      block: input.config.anima.dispatch_policy.veto_severity_block_weight,
      warn: input.config.anima.dispatch_policy.veto_severity_warn_weight,
    },
    selected_guardians: selected.map((score) => score.agent),
  };
}

function ratingLookupKey(input: DispatchPolicyRequest): EloContextTuple {
  return {
    vak_cp_position: input.vak_frame.cp,
    mef_lens: input.mef_lens,
    content_class: input.content_class,
    kairos_window: input.kairos_window,
    cfp_thread_type: input.vak_frame.cfp,
    r_factor_slot: input.r_factor_slot,
  };
}

function collectFallbackApplications(
  scores: CandidateScore[],
  input: DispatchPolicyRequest,
): string[] {
  const applications: string[] = [];
  if (scores.some((score) => Object.keys(score.rating_records).length === input.config.anima.dispatch_policy.neutral_score)) {
    applications.push("uniform_or_missing_rating_used_bootstrap_heuristics");
  }
  if (scores.some((score) => !score.eligible && score.ineligible_reason === "slot_resolution_null")) {
    applications.push("null_model_slot_fail_soft");
  }
  if (input.user_context?.skill_fired) {
    applications.push("user_context_frame_present_at_dispatch");
  }
  if (input.dispatch_purpose === "calibration") {
    applications.push("calibration_dispatch_from_drift_detection_queue");
  }
  if (isVerificationDispatch(input)) {
    applications.push("anuttara_pi_verification_gate");
  }
  if (input.harness_router) {
    applications.push("harness_dispatch_two_axis_router");
  }
  return applications;
}

function scoreRationale(
  candidate: CandidateTriple,
  rating_records: Partial<Record<EloChannel, EloRatingRecord>>,
  bootstrap_blend: number,
  recency_adjustment: number,
  eligibility: { eligible: boolean; reason?: string },
): string[] {
  const parts = [
    `candidate (${candidate.agent}, ${candidate.model}, ${candidate.skill_set.join("+")}) scored as constitutional-role-fit + model-availability + skill-applicability plus Mercurius composite_rating`,
    `bootstrap_blend=${bootstrap_blend}`,
    `recency_adjustment=${recency_adjustment}`,
  ];
  if (!eligibility.eligible && eligibility.reason) parts.push(`ineligible=${eligibility.reason}`);
  for (const channel of CHANNELS) {
    if (!rating_records[channel]) parts.push(`missing_${channel}_rating`);
  }
  return parts;
}

function selectionRationale(input: DispatchPolicyRequest, selected: CandidateScore[]): string {
  if (!selected.length) return "no eligible candidate after slot resolution";
  if (isVerificationDispatch(input)) {
    return "selected Anuttara-PI verification pole with full-7-laws typed-query surface";
  }
  if (input.dispatch_purpose === "aletheia_crystallisation") {
    return "selected Elo-informed Aletheia techne guardian set with veto primitive attached";
  }
  return "selected highest-scoring candidate after composite_rating, bootstrap heuristic blend, and recency gating";
}

function contextMatches(left: EloContextTuple, right: EloContextTuple): boolean {
  return left.vak_cp_position === right.vak_cp_position &&
    left.mef_lens === right.mef_lens &&
    left.content_class === right.content_class &&
    left.kairos_window === right.kairos_window &&
    left.cfp_thread_type === right.cfp_thread_type &&
    left.r_factor_slot === right.r_factor_slot;
}

function parseTomlSections(text: string): Record<string, Record<string, unknown>> {
  const sections: Record<string, Record<string, unknown>> = {};
  let current = "";
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const section = line.match(/^\[(?<section>[^\]]+)\]$/);
    if (section) {
      current = section.groups?.section ?? "";
      sections[current] = sections[current] ?? {};
      continue;
    }
    const keyValue = line.match(/^(?<key>[A-Za-z0-9_.-]+)\s*=\s*(?<value>.+?)\s*(?:#.*)?$/);
    if (keyValue && current) {
      const key = keyValue.groups?.key ?? "";
      const value = (keyValue.groups?.value ?? "").trim();
      sections[current][key] = parseScalar(value);
    }
  }
  return sections;
}

function parseScalar(value: string): unknown {
  const list = value.match(/^\[(?<items>.*)\]$/);
  if (list) {
    const items = list.groups?.items ?? "";
    if (!items.trim()) return [];
    return items.split(",").map((item) => parseScalar(item.trim()));
  }
  const quoted = value.match(/^"(?<quoted>.*)"$/);
  if (quoted) return quoted.groups?.quoted ?? "";
  if (value === "true") return true;
  if (value === "false") return false;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : value;
}

function requiredNumber(
  parsed: Record<string, Record<string, unknown>>,
  section: string,
  key: string,
): number {
  const value = parsed[section]?.[key];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`Missing numeric config key config.${section}.${key}`);
  }
  return value;
}

function requiredString(
  parsed: Record<string, Record<string, unknown>>,
  section: string,
  key: string,
): string {
  const value = parsed[section]?.[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Missing string config key config.${section}.${key}`);
  }
  return value;
}

function requiredStringList(
  parsed: Record<string, Record<string, unknown>>,
  section: string,
  key: string,
): string[] {
  const value = parsed[section]?.[key];
  if (!Array.isArray(value) || !value.every((entry) => typeof entry === "string" && entry.trim())) {
    throw new Error(`Missing string-list config key config.${section}.${key}`);
  }
  return value;
}

function collectNestedNumbers(parsed: Record<string, Record<string, unknown>>, section: string): Record<string, number> {
  const source = parsed[section] ?? {};
  return Object.fromEntries(
    Object.entries(source).filter((entry): entry is [string, number] => {
      const [, value] = entry;
      return typeof value === "number";
    }),
  );
}

function collectStringMap(parsed: Record<string, Record<string, unknown>>, section: string): Record<string, string> {
  const source = parsed[section] ?? {};
  return Object.fromEntries(
    Object.entries(source).filter((entry): entry is [string, string] => {
      const [, value] = entry;
      return typeof value === "string" && value.trim().length > 0;
    }),
  );
}
