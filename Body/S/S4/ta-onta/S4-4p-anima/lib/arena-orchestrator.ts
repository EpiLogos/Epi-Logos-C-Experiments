import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import {
  DIALOGUE_EMISSION_PRIMITIVE,
  guardVamaShaktiDispatch,
  type DialogueOnlyCapabilityProfile,
  type VamaShaktiClass,
} from "../../../pi-agent/lib/dispatch-guard.ts";

export type ArenaSpeaker =
  | { kind: "user" }
  | { kind: "constitutional"; agent: string }
  | ArenaVamaShaktiSpeaker;

export interface ArenaVamaShaktiSpeaker {
  readonly kind: "vama_shakti";
  readonly handle: string;
  readonly coordinate?: string;
  readonly vama_shakti_class: VamaShaktiClass;
  readonly capability_profile: DialogueOnlyCapabilityProfile;
}

export interface ArenaSceneRoutingState {
  readonly scene_key: string;
  readonly cpf_brainstorm_confirmation_token?: string;
  readonly admitted_constitutional?: readonly string[];
  readonly scene_close_threshold?: number;
}

export interface ArenaTurnHistoryEntry {
  readonly turn_index: number;
  readonly speaker: ArenaSpeaker;
  readonly cited_coordinates?: readonly string[];
}

export interface ArenaKairosRoutingState {
  delta: number;
  anchor_previous: number;
  anchor_current: number;
}

export interface ArenaClassifierConfig {
  readonly egregore: {
    readonly turn_length_multiplier: number;
  };
  readonly sprite: {
    readonly kairos_burst_threshold_delta: number;
  };
  readonly daemon: {
    readonly maieutic_question_form_bias: number;
  };
  readonly mantra: {
    readonly kairos_threshold_crossing_threshold: number;
  };
}

export const DEFAULT_ARENA_CLASSIFIER_CONFIG: ArenaClassifierConfig = Object.freeze({
  egregore: Object.freeze({
    turn_length_multiplier: 2.5,
  }),
  sprite: Object.freeze({
    kairos_burst_threshold_delta: 0.30,
  }),
  daemon: Object.freeze({
    maieutic_question_form_bias: 0.75,
  }),
  mantra: Object.freeze({
    kairos_threshold_crossing_threshold: 0.50,
  }),
});

export interface ArenaRoutingInput {
  readonly scene: ArenaSceneRoutingState;
  readonly admitted_vama_shaktis: readonly ArenaVamaShaktiSpeaker[];
  readonly turns: readonly ArenaTurnHistoryEntry[];
  readonly kairos: ArenaKairosRoutingState;
  readonly config: ArenaClassifierConfig;
  readonly user_input_pending?: boolean;
}

export interface ArenaTurnBudget {
  readonly turn_length_multiplier: number;
}

export interface ArenaRoutingDecision {
  readonly speaker: ArenaSpeaker;
  readonly reason:
    | "trika-user-input-pending"
    | "daemon-maieutic-post-user"
    | "sprite-kairos-burst"
    | "mantra-kairotic-threshold"
    | "response-to-citation"
    | "sophia-scene-close-synthesis"
    | "vama-round-robin";
  readonly turn_index: number;
  readonly turn_budget: ArenaTurnBudget;
  readonly question_form_bias?: number;
}

export type ArenaOrchestrationRefusalCode =
  | "DR-VAMA-CPF/no-brainstorm-token"
  | "arena/no-admitted-speaker"
  | "arena/runtime-adapter-missing";

export class ArenaOrchestrationRefused extends Error {
  readonly code: ArenaOrchestrationRefusalCode;
  readonly scene_key: string;

  constructor(code: ArenaOrchestrationRefusalCode, scene_key: string, message: string) {
    super(message);
    this.name = "ArenaOrchestrationRefused";
    this.code = code;
    this.scene_key = scene_key;
  }
}

export function enforceArenaCpfGate(scene: Pick<ArenaSceneRoutingState, "scene_key" | "cpf_brainstorm_confirmation_token">): void {
  if (!scene.cpf_brainstorm_confirmation_token?.trim()) {
    throw new ArenaOrchestrationRefused(
      "DR-VAMA-CPF/no-brainstorm-token",
      scene.scene_key,
      `Refused: ArenaScene ${scene.scene_key} has no cpf_brainstorm_confirmation_token; CPF (00/00) scene-setup must be confirmed before Anima arena orchestration.`,
    );
  }
}

export function decideArenaNextSpeaker(input: ArenaRoutingInput): ArenaRoutingDecision {
  enforceArenaCpfGate(input.scene);

  const turn_index = nextTurnIndex(input.turns);
  if (input.user_input_pending) {
    return decision("trika-user-input-pending", { kind: "user" }, turn_index, input.config);
  }

  const previous = previousTurn(input.turns);
  if (previous?.speaker.kind === "user") {
    const daemon = input.admitted_vama_shaktis.find((speaker) => speaker.vama_shakti_class === "daemon");
    if (daemon) {
      return {
        ...decision("daemon-maieutic-post-user", daemon, turn_index, input.config),
        question_form_bias: input.config.daemon.maieutic_question_form_bias,
      };
    }
  }

  const sprite = input.admitted_vama_shaktis.find((speaker) => speaker.vama_shakti_class === "sprite");
  if (sprite && input.kairos.delta > input.config.sprite.kairos_burst_threshold_delta) {
    return decision("sprite-kairos-burst", sprite, turn_index, input.config);
  }

  const mantra = input.admitted_vama_shaktis.find((speaker) => speaker.vama_shakti_class === "mantra");
  const mantraThreshold = input.config.mantra.kairos_threshold_crossing_threshold;
  if (
    mantra &&
    input.kairos.anchor_previous < mantraThreshold &&
    input.kairos.anchor_current >= mantraThreshold
  ) {
    return decision("mantra-kairotic-threshold", mantra, turn_index, input.config);
  }

  const cited = citedUnspokenVama(previous, input.admitted_vama_shaktis, input.turns);
  if (cited) {
    return decision("response-to-citation", cited, turn_index, input.config);
  }

  const sceneCloseThreshold = input.scene.scene_close_threshold ?? Number.POSITIVE_INFINITY;
  if (turn_index >= sceneCloseThreshold && hasConstitutional(input.scene, "Sophia")) {
    return decision("sophia-scene-close-synthesis", { kind: "constitutional", agent: "Sophia" }, turn_index, input.config);
  }

  const roundRobinSpeaker = roundRobinVama(input.admitted_vama_shaktis, input.turns);
  if (!roundRobinSpeaker) {
    throw new ArenaOrchestrationRefused(
      "arena/no-admitted-speaker",
      input.scene.scene_key,
      `Refused: ArenaScene ${input.scene.scene_key} has no user turn, constitutional close route, or admitted Vama Shakti available for routing.`,
    );
  }
  return decision("vama-round-robin", roundRobinSpeaker, turn_index, input.config);
}

export function turnBudgetForSpeaker(speaker: ArenaSpeaker, config: ArenaClassifierConfig): ArenaTurnBudget {
  if (speaker.kind === "vama_shakti" && speaker.vama_shakti_class === "egregore") {
    return { turn_length_multiplier: config.egregore.turn_length_multiplier };
  }
  return { turn_length_multiplier: 1 };
}

export interface MercuriusKairosDelta {
  readonly scene_key?: string;
  readonly kairos_delta?: number;
  readonly delta?: number;
  readonly kairos_anchor?: number;
}

export function applyMercuriusKairosDelta(
  state: ArenaKairosRoutingState,
  payload: MercuriusKairosDelta,
  scene_key: string,
): ArenaKairosRoutingState {
  if (payload.scene_key && payload.scene_key !== scene_key) {
    return state;
  }
  const delta = typeof payload.kairos_delta === "number" ? payload.kairos_delta : payload.delta ?? 0;
  const previous = state.anchor_current;
  state.delta = delta;
  state.anchor_previous = previous;
  state.anchor_current = typeof payload.kairos_anchor === "number"
    ? payload.kairos_anchor
    : previous + delta;
  return state;
}

export interface MercuriusSubscriptionSource {
  subscribe(event: "mercurius.kairos.delta", handler: (payload: MercuriusKairosDelta) => void): () => void;
}

export function subscribeMercuriusKairosDelta(input: {
  readonly scene_key: string;
  readonly state: ArenaKairosRoutingState;
  readonly subscribe: MercuriusSubscriptionSource["subscribe"];
}): () => void {
  return input.subscribe("mercurius.kairos.delta", (payload) => {
    applyMercuriusKairosDelta(input.state, payload, input.scene_key);
  });
}

export interface ArenaDispatchPlanInput {
  readonly scene_key: string;
  readonly speaker: ArenaSpeaker;
  readonly utterance_intent?: string;
  readonly requested_tool_name?: string;
}

export type ArenaDispatchPlan =
  | {
    readonly kind: "user";
    readonly scene_key: string;
    readonly route: "ui-input";
  }
  | {
    readonly kind: "constitutional";
    readonly scene_key: string;
    readonly agent: string;
    readonly route: "standard-anima";
  }
  | {
    readonly kind: "vama_shakti";
    readonly scene_key: string;
    readonly speaker_handle: string;
    readonly speaker_class: VamaShaktiClass;
    readonly tool_name: typeof DIALOGUE_EMISSION_PRIMITIVE;
    readonly guarded_by: "DR-VAMA-5/dispatch-guard";
    readonly utterance_intent?: string;
  };

export function buildArenaDispatchPlan(input: ArenaDispatchPlanInput): ArenaDispatchPlan {
  if (input.speaker.kind === "user") {
    return {
      kind: "user",
      scene_key: input.scene_key,
      route: "ui-input",
    };
  }

  if (input.speaker.kind === "constitutional") {
    return {
      kind: "constitutional",
      scene_key: input.scene_key,
      agent: input.speaker.agent,
      route: "standard-anima",
    };
  }

  const requestedTool = input.requested_tool_name ?? DIALOGUE_EMISSION_PRIMITIVE;
  guardVamaShaktiDispatch({
    identity_handle: input.speaker.handle,
    capability_profile: input.speaker.capability_profile,
    tool_name: requestedTool,
  });

  return {
    kind: "vama_shakti",
    scene_key: input.scene_key,
    speaker_handle: input.speaker.handle,
    speaker_class: input.speaker.vama_shakti_class,
    tool_name: DIALOGUE_EMISSION_PRIMITIVE,
    guarded_by: "DR-VAMA-5/dispatch-guard",
    utterance_intent: input.utterance_intent,
  };
}

export interface ArenaRuntimeAdapter {
  getArenaScene(scene_key: string): Promise<ArenaSceneRoutingState>;
  listAdmittedVamaShaktis(scene_key: string): Promise<readonly ArenaVamaShaktiSpeaker[]>;
  listArenaTurns(scene_key: string): Promise<readonly ArenaTurnHistoryEntry[]>;
  readKairosState(scene_key: string): Promise<ArenaKairosRoutingState>;
  appendArenaTurn(input: {
    scene_key: string;
    turn_index: number;
    speaker: ArenaSpeaker;
    reason: ArenaRoutingDecision["reason"];
    turn_kairos_delta: number;
    turn_budget: ArenaTurnBudget;
  }): Promise<unknown>;
  appendArenaDialogueLine(input: {
    scene_key: string;
    turn_index: number;
    speaker: ArenaSpeaker;
    dispatch_plan: ArenaDispatchPlan;
    cited_coordinates: readonly string[];
  }): Promise<unknown>;
  dispatchArenaPlan(plan: ArenaDispatchPlan): Promise<unknown>;
  emitArenaObservabilityEvent(input: ArenaObservabilityEvent): Promise<void>;
}

export interface ArenaObservabilityEvent {
  readonly event: "m4.arena.turn_routed";
  readonly scene_key: string;
  readonly turn_index: number;
  readonly speaker_kind: ArenaSpeaker["kind"];
  readonly speaker_handle?: string;
  readonly speaker_class?: VamaShaktiClass;
  readonly reason: ArenaRoutingDecision["reason"];
  readonly kairos_delta: number;
  readonly turn_length_multiplier: number;
}

export interface ArenaOrchestrationRequest {
  readonly scene_key: string;
  readonly intent?: string;
  readonly user_input_pending?: boolean;
}

export interface ArenaOrchestrationRuntime {
  readonly adapter: ArenaRuntimeAdapter;
  readonly config?: ArenaClassifierConfig;
}

export async function orchestrateArenaScene(
  request: ArenaOrchestrationRequest,
  runtime: ArenaOrchestrationRuntime,
) {
  const config = runtime.config ?? DEFAULT_ARENA_CLASSIFIER_CONFIG;
  const scene = await runtime.adapter.getArenaScene(request.scene_key);
  const [admitted_vama_shaktis, turns, kairos] = await Promise.all([
    runtime.adapter.listAdmittedVamaShaktis(request.scene_key),
    runtime.adapter.listArenaTurns(request.scene_key),
    runtime.adapter.readKairosState(request.scene_key),
  ]);
  const routing = decideArenaNextSpeaker({
    scene,
    admitted_vama_shaktis,
    turns,
    kairos,
    config,
    user_input_pending: request.user_input_pending,
  });
  const dispatch_plan = buildArenaDispatchPlan({
    scene_key: request.scene_key,
    speaker: routing.speaker,
    utterance_intent: request.intent,
  });

  const dispatch_result = await runtime.adapter.dispatchArenaPlan(dispatch_plan);
  const turn = await runtime.adapter.appendArenaTurn({
    scene_key: request.scene_key,
    turn_index: routing.turn_index,
    speaker: routing.speaker,
    reason: routing.reason,
    turn_kairos_delta: kairos.delta,
    turn_budget: routing.turn_budget,
  });
  const dialogue_line = await runtime.adapter.appendArenaDialogueLine({
    scene_key: request.scene_key,
    turn_index: routing.turn_index,
    speaker: routing.speaker,
    dispatch_plan,
    cited_coordinates: [],
  });

  const event: ArenaObservabilityEvent = {
    event: "m4.arena.turn_routed",
    scene_key: request.scene_key,
    turn_index: routing.turn_index,
    speaker_kind: routing.speaker.kind,
    speaker_handle: routing.speaker.kind === "vama_shakti" ? routing.speaker.handle : undefined,
    speaker_class: routing.speaker.kind === "vama_shakti" ? routing.speaker.vama_shakti_class : undefined,
    reason: routing.reason,
    kairos_delta: kairos.delta,
    turn_length_multiplier: routing.turn_budget.turn_length_multiplier,
  };
  await runtime.adapter.emitArenaObservabilityEvent(event);

  return {
    scene_key: request.scene_key,
    routing,
    dispatch_plan,
    dispatch_result,
    turn,
    dialogue_line,
    observability_event: event,
  };
}

export async function loadArenaClassifierConfigFromHome(
  home = homedir(),
): Promise<ArenaClassifierConfig> {
  const path = join(home, ".epi-logos", "config.toml");
  try {
    return parseArenaClassifierConfigToml(await readFile(path, "utf8"));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return DEFAULT_ARENA_CLASSIFIER_CONFIG;
    }
    throw err;
  }
}

export function parseArenaClassifierConfigToml(
  toml: string,
  base: ArenaClassifierConfig = DEFAULT_ARENA_CLASSIFIER_CONFIG,
): ArenaClassifierConfig {
  const next: ArenaClassifierConfig = {
    egregore: { ...base.egregore },
    sprite: { ...base.sprite },
    daemon: { ...base.daemon },
    mantra: { ...base.mantra },
  };
  let section = "";
  for (const raw of toml.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim();
    if (!line) continue;
    const sectionMatch = line.match(/^\[([^\]]+)\]$/);
    if (sectionMatch) {
      section = sectionMatch[1].trim();
      continue;
    }
    if (!section.startsWith("arena.classifier")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    const value = Number(line.slice(eq + 1).trim());
    if (!Number.isFinite(value)) continue;
    applyClassifierConfigValue(next, section, key, value);
  }
  return next;
}

function applyClassifierConfigValue(
  config: ArenaClassifierConfig,
  section: string,
  key: string,
  value: number,
) {
  const sectionParts = section.split(".");
  const nestedClass = sectionParts.length === 3 ? sectionParts[2] : undefined;
  const keyParts = key.split(".");
  const className = (nestedClass ?? keyParts[0]) as keyof ArenaClassifierConfig;
  const leafKey = nestedClass ? key : keyParts[1];
  if (!leafKey || !(className in config)) return;
  const bucket = config[className] as Record<string, number>;
  if (Object.prototype.hasOwnProperty.call(bucket, leafKey)) {
    bucket[leafKey] = value;
  }
}

function decision(
  reason: ArenaRoutingDecision["reason"],
  speaker: ArenaSpeaker,
  turn_index: number,
  config: ArenaClassifierConfig,
): ArenaRoutingDecision {
  return {
    speaker,
    reason,
    turn_index,
    turn_budget: turnBudgetForSpeaker(speaker, config),
  };
}

function nextTurnIndex(turns: readonly ArenaTurnHistoryEntry[]): number {
  const previous = previousTurn(turns);
  return previous ? previous.turn_index + 1 : 0;
}

function previousTurn(turns: readonly ArenaTurnHistoryEntry[]): ArenaTurnHistoryEntry | undefined {
  return [...turns].sort((a, b) => b.turn_index - a.turn_index)[0];
}

function citedUnspokenVama(
  previous: ArenaTurnHistoryEntry | undefined,
  admitted: readonly ArenaVamaShaktiSpeaker[],
  turns: readonly ArenaTurnHistoryEntry[],
): ArenaVamaShaktiSpeaker | undefined {
  const cited = new Set(previous?.cited_coordinates ?? []);
  if (cited.size === 0) return undefined;
  const spoken = new Set(
    turns
      .map((turn) => turn.speaker)
      .filter((speaker): speaker is ArenaVamaShaktiSpeaker => speaker.kind === "vama_shakti")
      .map((speaker) => speaker.handle),
  );
  return admitted.find((speaker) => {
    if (spoken.has(speaker.handle)) return false;
    return cited.has(speaker.handle) || cited.has(`vama:${speaker.handle}`) || (speaker.coordinate ? cited.has(speaker.coordinate) : false);
  });
}

function hasConstitutional(scene: ArenaSceneRoutingState, agent: string): boolean {
  return Boolean(scene.admitted_constitutional?.some((name) => name.toLowerCase() === agent.toLowerCase()));
}

function roundRobinVama(
  admitted: readonly ArenaVamaShaktiSpeaker[],
  turns: readonly ArenaTurnHistoryEntry[],
): ArenaVamaShaktiSpeaker | undefined {
  if (admitted.length === 0) return undefined;
  const previousVama = [...turns]
    .sort((a, b) => b.turn_index - a.turn_index)
    .map((turn) => turn.speaker)
    .find((speaker): speaker is ArenaVamaShaktiSpeaker => speaker.kind === "vama_shakti");
  if (!previousVama) return admitted[0];
  const index = admitted.findIndex((speaker) => speaker.handle === previousVama.handle);
  return admitted[(index + 1) % admitted.length] ?? admitted[0];
}
