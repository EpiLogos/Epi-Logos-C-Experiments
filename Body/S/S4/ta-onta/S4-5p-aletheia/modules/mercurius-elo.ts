// aletheia/modules/mercurius-elo.ts
//
// Mercurius — multi-channel Elo bookkeeper for the Aletheia autoresearch loop.
// Thresholds, seed ratings, bootstrap sigma, and Elo hyperparameters are loaded
// from ~/.epi-logos/config.toml sections, never pinned in this module.

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  anansi_index_rating,
  anansi_resolve_context,
  anansi_rating_record_key,
  create_anansi_rating_index,
  type AnansiRatingIndex,
  type ContextQuery,
  type EloChannel,
  type EloContextTuple,
  type EloRatingIdentity,
  type EloRatingRecord,
} from "./anansi-elo-index.ts";
import { janus_threshold_elo_delta, type JanusThresholdDecision } from "./janus-threshold.ts";
import { moirai_distil_comparison, type MoiraiComparisonDecision, type MoiraiTrialRecord } from "./moirai-fair-comparison.ts";

export interface AletheiaEloConfig {
  elo: {
    seed_rating: number;
    confidence_penalty_alpha: number;
    bootstrap_trials: number;
    bootstrap_sigma: number;
    k_factor: number;
    expected_score_base: number;
    expected_score_divisor: number;
    outcome_win: number;
    outcome_loss: number;
    outcome_draw: number;
    fair_comparison_similarity_floor: number;
  };
  drift_detection: {
    delta_elo: number;
    trial_class_thresholds?: Record<string, number>;
  };
}

export interface MercuriusTrialDispatch extends EloRatingIdentity {
  context_tuple: EloContextTuple;
  tournament: "agent" | "canon";
}

export interface MercuriusTrialOutcomes {
  channels: Partial<Record<EloChannel, { score: number; opponent_rating?: number }>>;
}

export interface MercuriusTrialRecord extends MoiraiTrialRecord {
  guardian: "mercurius";
  outcomes: MercuriusTrialOutcomes;
}

export interface MercuriusObservabilityEvent {
  event: "aletheia.elo.rating-updated" | "aletheia.elo.threshold-miss" | "aletheia.elo.uncalibrated-refusal";
  trial_id: string;
  channel?: EloChannel;
  detail: string;
}

export interface MercuriusEloStore {
  ratings: Map<string, EloRatingRecord>;
  trial_log: Map<string, MercuriusTrialRecord>;
  index: AnansiRatingIndex;
  events: MercuriusObservabilityEvent[];
}

export interface MercuriusUpdateResult {
  trial_id: string;
  comparison: MoiraiComparisonDecision;
  threshold_decisions: JanusThresholdDecision[];
  updated_ratings: EloRatingRecord[];
  events: MercuriusObservabilityEvent[];
}

const CHANNELS: ReadonlyArray<EloChannel> = ["R_verifier", "R_lens", "R_user"];
const REQUIRED_ELO_KEYS: ReadonlyArray<keyof AletheiaEloConfig["elo"]> = [
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
const REQUIRED_DRIFT_KEYS: ReadonlyArray<keyof AletheiaEloConfig["drift_detection"]> = ["delta_elo"];
const EMPTY_TRIAL_HISTORY: ReadonlyArray<unknown> = [];

export function create_mercurius_elo_store(): MercuriusEloStore {
  return {
    ratings: new Map(),
    trial_log: new Map(),
    index: create_anansi_rating_index(),
    events: [],
  };
}

export function mercurius_record_trial(input: {
  trial_id: string;
  dispatch: MercuriusTrialDispatch;
  outcomes: MercuriusTrialOutcomes;
  trial_class?: string;
  completed_at?: string;
  store?: MercuriusEloStore;
}): MercuriusTrialRecord {
  const record: MercuriusTrialRecord = {
    guardian: "mercurius",
    trial_id: required(input.trial_id, "trial_id"),
    trial_class: input.trial_class ?? input.dispatch.tournament,
    dispatch: input.dispatch,
    outcomes: input.outcomes,
    completed_at: input.completed_at,
  };
  input.store?.trial_log.set(record.trial_id, record);
  return record;
}

export function mercurius_query_ratings(input: {
  agent?: string;
  context_tuple?: Partial<EloContextTuple>;
  channel?: EloChannel;
  store: MercuriusEloStore;
  config: AletheiaEloConfig;
}): EloRatingRecord[] {
  const context_query: ContextQuery = {
    ...(input.context_tuple ?? {}),
    agent: input.agent,
    channel: input.channel,
  };
  const resolved = anansi_resolve_context({ context_query, index: input.store.index });
  if (resolved.entries.length) return resolved.entries.map((entry) => entry.rating_record);
  if (!input.agent || !input.context_tuple || !input.channel) return [];
  return [
    bootstrap_rating({
      identity: {
        agent: input.agent,
        model: "config-unresolved",
        harness: "config-unresolved",
        skill: "config-unresolved",
      },
      context_tuple: input.context_tuple as EloContextTuple,
      channel: input.channel,
      config: input.config,
    }),
  ];
}

export function mercurius_update_elo(input: {
  trial_id: string;
  store: MercuriusEloStore;
  config: AletheiaEloConfig;
}): MercuriusUpdateResult {
  const trial = input.store.trial_log.get(input.trial_id);
  if (!trial) throw new Error(`Mercurius cannot update missing trial ${input.trial_id}.`);

  const comparison = moirai_distil_comparison({
    trial_id: input.trial_id,
    trial_history: [...input.store.trial_log.values()],
    config: input.config,
  });

  if (!comparison.comparable) {
    const event = {
      event: "aletheia.elo.uncalibrated-refusal" as const,
      trial_id: input.trial_id,
      detail: comparison.reason ?? "Moirai refused update without comparable prior trial.",
    };
    input.store.events.push(event);
    return { trial_id: input.trial_id, comparison, threshold_decisions: [], updated_ratings: [], events: [event] };
  }

  const updated_ratings: EloRatingRecord[] = [];
  const threshold_decisions: JanusThresholdDecision[] = [];
  const events: MercuriusObservabilityEvent[] = [];

  for (const channel of CHANNELS) {
    const outcome = trial.outcomes.channels[channel];
    if (!outcome) continue;
    const current = currentRating(input.store, trial.dispatch, trial.dispatch.context_tuple, channel, input.config);
    const opponent_rating = outcome.opponent_rating ?? comparisonOpponentRating(input.store, comparison, channel, input.config);
    const next = updateRating(current, outcome.score, opponent_rating, input.config);
    const delta = next.rating - current.rating;
    const threshold = janus_threshold_elo_delta({ delta, trial_class: trial.trial_class, config: input.config });
    threshold_decisions.push(threshold);
    if (!threshold.accepted) {
      const event = {
        event: "aletheia.elo.threshold-miss" as const,
        trial_id: input.trial_id,
        channel,
        detail: threshold.event,
      };
      input.store.events.push(event);
      events.push(event);
      continue;
    }
    input.store.ratings.set(anansi_rating_record_key(next), next);
    anansi_index_rating({ rating_record: next, index: input.store.index });
    updated_ratings.push(next);
    const event = {
      event: "aletheia.elo.rating-updated" as const,
      trial_id: input.trial_id,
      channel,
      detail: "Mercurius persisted a channel-specific rating update.",
    };
    input.store.events.push(event);
    events.push(event);
  }

  return { trial_id: input.trial_id, comparison, threshold_decisions, updated_ratings, events };
}

export function effective_rating(record: EloRatingRecord, config: AletheiaEloConfig): number {
  return record.rating - config.elo.confidence_penalty_alpha * record.sigma;
}

export function parseAletheiaConfigToml(text: string): AletheiaEloConfig {
  const parsed = parseTomlSections(text);
  const elo = Object.fromEntries(
    REQUIRED_ELO_KEYS.map((key) => [key, requiredNumber(parsed, "aletheia.elo", key)]),
  ) as AletheiaEloConfig["elo"];
  const drift_detection = Object.fromEntries(
    REQUIRED_DRIFT_KEYS.map((key) => [key, requiredNumber(parsed, "aletheia.drift_detection", key)]),
    // Index-signature -> declared shape: REQUIRED_DRIFT_KEYS is what makes
    // this sound, and TS cannot see that.
  ) as unknown as AletheiaEloConfig["drift_detection"];
  drift_detection.trial_class_thresholds = collectNestedNumbers(parsed, "aletheia.drift_detection.trial_class_thresholds");
  return { elo, drift_detection };
}

export async function loadAletheiaEloConfig(input: {
  path?: string;
  homeDir?: string;
  readText?: (path: string) => Promise<string>;
} = {}): Promise<AletheiaEloConfig> {
  const path = input.path ?? join(input.homeDir ?? process.env.HOME ?? "~", ".epi-logos", "config.toml");
  const readText = input.readText ?? ((target: string) => readFile(target, "utf8"));
  return parseAletheiaConfigToml(await readText(path));
}

function currentRating(
  store: MercuriusEloStore,
  identity: EloRatingIdentity,
  context_tuple: EloContextTuple,
  channel: EloChannel,
  config: AletheiaEloConfig,
): EloRatingRecord {
  const probe = { ...identity, context_tuple, channel, rating: config.elo.seed_rating, sigma: config.elo.bootstrap_sigma, trial_count: EMPTY_TRIAL_HISTORY.length };
  return store.ratings.get(anansi_rating_record_key(probe)) ?? bootstrap_rating({ identity, context_tuple, channel, config });
}

function bootstrap_rating(input: {
  identity: EloRatingIdentity;
  context_tuple: EloContextTuple;
  channel: EloChannel;
  config: AletheiaEloConfig;
}): EloRatingRecord {
  return {
    ...input.identity,
    context_tuple: input.context_tuple,
    channel: input.channel,
    rating: input.config.elo.seed_rating,
    sigma: input.config.elo.bootstrap_sigma,
    trial_count: EMPTY_TRIAL_HISTORY.length,
  };
}

function comparisonOpponentRating(
  store: MercuriusEloStore,
  comparison: MoiraiComparisonDecision,
  channel: EloChannel,
  config: AletheiaEloConfig,
): number {
  const prior = comparison.lachesis_best_match;
  if (!prior) return config.elo.seed_rating;
  return currentRating(store, prior.dispatch, prior.dispatch.context_tuple, channel, config).rating;
}

function updateRating(
  current: EloRatingRecord,
  outcome_score: number,
  opponent_rating: number,
  config: AletheiaEloConfig,
): EloRatingRecord {
  const expected =
    config.elo.outcome_win /
    (config.elo.outcome_win +
      Math.pow(config.elo.expected_score_base, (opponent_rating - current.rating) / config.elo.expected_score_divisor));
  return {
    ...current,
    rating: current.rating + config.elo.k_factor * (outcome_score - expected),
    trial_count: current.trial_count + config.elo.outcome_win,
    updated_at: new Date().toISOString(),
  };
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

function collectNestedNumbers(parsed: Record<string, Record<string, unknown>>, section: string): Record<string, number> {
  const source = parsed[section] ?? {};
  return Object.fromEntries(
    Object.entries(source).filter((entry): entry is [string, number] => {
      const [, value] = entry;
      return typeof value === "number";
    }),
  );
}

function required(value: string, field: string): string {
  const trimmed = value?.trim();
  if (!trimmed) throw new Error(`Mercurius Elo requires ${field}.`);
  return trimmed;
}
