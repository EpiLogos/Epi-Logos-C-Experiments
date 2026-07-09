// Coordinate Header
// Coordinate: S4-3' / Chronos Aeon scheduling binding
// Residency: Body/S/S4/ta-onta/S4-3p-chronos/modules
// Position (#n): #3 temporal invocation binding
// Actualises: [[S4-3'-SPEC]] scheduler authority for [[Aeon]] CT4b invocation forms
// Public surface: bindAeonCronRegistration, chronos_aeon_fire, chronos_aeon_on_event_fire
// Does NOT own: Aeon template authorship, Anima dispatch implementation, Khora result-drop watching
// Contract: ../CONTRACT.md

import { spawnSync } from "node:child_process";
import { RESULT_ARTIFACT_WAKE, type ResultArtifactWakeEvent } from "../../S4-0p-khora/modules/flow-watcher.ts";
import type { ChronosCronDispatch, ChronosCronWakeMode } from "../extension.ts";
import { dispatchTeamMember } from "../../S4-4p-anima/extension/dispatch.ts";
import { isValidVakAddress, type CpfPolarity, type VakAddress } from "../../shared/vak_address.ts";
import {
  advanceAeonTaskSource,
  aeonTaskSourceBlock,
  type AeonTaskAdvance,
  type AeonTaskSourceRef,
} from "./aeon-task-source.ts";

export type AeonEventTriggerPurpose = ResultArtifactWakeEvent["purpose"];

export interface AeonConsentPosture {
  readonly cpf: CpfPolarity;
  readonly granted: boolean;
  readonly consent_gate?: string;
}

export interface AeonEventTrigger {
  readonly kind: "result-drop";
  readonly purpose: AeonEventTriggerPurpose;
}

export interface AeonInvocationForm {
  readonly aeon_id: string;
  readonly aeon_name: string;
  readonly agent: string;
  readonly task: string;
  readonly vak_address: VakAddress;
  readonly args?: Record<string, unknown>;
  readonly schedule?: string;
  readonly on_event?: AeonEventTrigger;
  readonly consent_posture: AeonConsentPosture;
  readonly session_target?: string;
  readonly wake_mode?: ChronosCronWakeMode;
  /** 47.4: bound structured work-list (Ralph PRD) advanced one tranche per fire. */
  readonly task_source?: AeonTaskSourceRef;
}

export interface AeonFireInput {
  readonly aeon: AeonInvocationForm;
  readonly trigger: "schedule" | "on_event";
  readonly event?: ResultArtifactWakeEvent;
  readonly job_id?: string;
  readonly job_name?: string;
  readonly fired_at_ms?: number;
}

export interface AeonFireResult {
  readonly aeon_id: string;
  readonly aeon_name: string;
  readonly trigger: "schedule" | "on_event";
  readonly agent: string;
  readonly session_target: string;
  readonly wake_mode: ChronosCronWakeMode;
  readonly vak_address: VakAddress;
  readonly dispatch_output: string;
  /** 47.4: present when the Aeon carries a task_source; records this fire's tranche. */
  readonly task_source_advance?: AeonTaskAdvance;
}

export interface AeonCronRegistration {
  readonly name: string;
  readonly description: string;
  readonly schedule: string;
  readonly session_target: string;
  readonly wake_mode: ChronosCronWakeMode;
  readonly payload: Record<string, unknown>;
}

function assertNonEmpty(value: string, field: string) {
  if (!value.trim()) {
    throw new Error(`Aeon ${field} is required`);
  }
}

export function assertAeonInvocationForm(aeon: AeonInvocationForm) {
  assertNonEmpty(aeon.aeon_id, "aeon_id");
  assertNonEmpty(aeon.aeon_name, "aeon_name");
  assertNonEmpty(aeon.agent, "agent");
  assertNonEmpty(aeon.task, "task");
  if (!isValidVakAddress(aeon.vak_address)) {
    throw new Error(`Aeon '${aeon.aeon_id}' has an invalid VAK address`);
  }
  if (!aeon.schedule && !aeon.on_event) {
    throw new Error(`Aeon '${aeon.aeon_id}' requires a schedule or on_event trigger`);
  }
}

export function assertAutonomousAeonConsent(aeon: AeonInvocationForm) {
  if (aeon.consent_posture.cpf !== "(4.0/1-4.4/5)") {
    throw new Error(
      `Aeon '${aeon.aeon_id}' cannot fire autonomously with dialogical CPF ${aeon.consent_posture.cpf}`,
    );
  }
  if (!aeon.consent_posture.granted) {
    throw new Error(
      `Aeon '${aeon.aeon_id}' autonomous fire refused: CPF consent posture has not been granted`,
    );
  }
}

export function aeonDispatchPayload(
  aeon: AeonInvocationForm,
  trigger: AeonFireInput["trigger"],
  event?: ResultArtifactWakeEvent,
): Record<string, unknown> {
  assertAeonInvocationForm(aeon);
  return {
    kind: "aeon.invoke",
    aeon_id: aeon.aeon_id,
    aeon_name: aeon.aeon_name,
    trigger,
    agent: aeon.agent,
    task: aeon.task,
    vak_address: aeon.vak_address,
    args: aeon.args ?? {},
    consent_posture: aeon.consent_posture,
    event: event ?? null,
  };
}

export function bindAeonCronRegistration(aeon: AeonInvocationForm): AeonCronRegistration {
  assertAeonInvocationForm(aeon);
  if (!aeon.schedule) {
    throw new Error(`Aeon '${aeon.aeon_id}' has no schedule to register`);
  }
  assertAutonomousAeonConsent(aeon);
  const wakeMode = aeon.wake_mode ?? "next-heartbeat";
  return {
    name: `aeon-${aeon.aeon_id}`,
    description: `Aeon ${aeon.aeon_name} autonomous schedule`,
    schedule: aeon.schedule,
    session_target: aeon.session_target ?? "main",
    wake_mode: wakeMode,
    payload: aeonDispatchPayload(aeon, "schedule"),
  };
}

function aeonTaskEnvelope(
  input: AeonFireInput,
  wakeMode: ChronosCronWakeMode,
  advance?: AeonTaskAdvance,
): string {
  const { aeon, event } = input;
  return [
    "Chronos invoked an Aeon from its CT4b scheduling binding. Run the reusable loop with the bound VAK args.",
    `aeon_id: ${aeon.aeon_id}`,
    `aeon_name: ${aeon.aeon_name}`,
    `trigger: ${input.trigger}`,
    `session_target: ${aeon.session_target ?? "main"}`,
    `wake_mode: ${wakeMode}`,
    input.job_id ? `job_id: ${input.job_id}` : undefined,
    input.job_name ? `job_name: ${input.job_name}` : undefined,
    typeof input.fired_at_ms === "number" ? `fired_at_ms: ${input.fired_at_ms}` : undefined,
    event ? `result_drop_path: ${event.path}` : undefined,
    "",
    "VAK args:",
    JSON.stringify({ vak_address: aeon.vak_address, args: aeon.args ?? {} }, null, 2),
    advance ? "" : undefined,
    advance ? aeonTaskSourceBlock(advance) : undefined,
    "",
    aeon.task,
  ].filter((line): line is string => line !== undefined).join("\n");
}

export async function chronos_aeon_fire(
  input: AeonFireInput,
  dispatch: ChronosCronDispatch = dispatchTeamMember,
): Promise<AeonFireResult> {
  assertAeonInvocationForm(input.aeon);
  assertAutonomousAeonConsent(input.aeon);
  const wakeMode = input.aeon.wake_mode ?? "next-heartbeat";

  const base = {
    aeon_id: input.aeon.aeon_id,
    aeon_name: input.aeon.aeon_name,
    trigger: input.trigger,
    agent: input.aeon.agent,
    session_target: input.aeon.session_target ?? "main",
    wake_mode: wakeMode,
    vak_address: input.aeon.vak_address,
  };

  // 47.4: a task-source Aeon advances its checkpointed work-list one tranche
  // per fire; an exhausted list refuses dispatch instead of firing an open task.
  let advance: AeonTaskAdvance | undefined;
  if (input.aeon.task_source) {
    advance = advanceAeonTaskSource(input.aeon.task_source, input.fired_at_ms);
    if (advance.exhausted) {
      return {
        ...base,
        dispatch_output: "task-source exhausted; no dispatch",
        task_source_advance: advance,
      };
    }
  }

  const dispatchOutput = await dispatch(
    input.aeon.agent,
    aeonTaskEnvelope(input, wakeMode, advance),
    input.aeon.vak_address,
  );
  return {
    ...base,
    dispatch_output: dispatchOutput,
    ...(advance ? { task_source_advance: advance } : {}),
  };
}

export async function chronos_aeon_on_event_fire(
  aeon: AeonInvocationForm,
  event: ResultArtifactWakeEvent,
  dispatch: ChronosCronDispatch = dispatchTeamMember,
): Promise<AeonFireResult | null> {
  assertAeonInvocationForm(aeon);
  if (!aeon.on_event) {
    return null;
  }
  if (event.kind !== RESULT_ARTIFACT_WAKE || aeon.on_event.kind !== "result-drop") {
    return null;
  }
  if (event.purpose !== aeon.on_event.purpose) {
    return null;
  }
  return chronos_aeon_fire({ aeon, trigger: "on_event", event }, dispatch);
}

export function registerAeonCronWithGateway(aeon: AeonInvocationForm) {
  const registration = bindAeonCronRegistration(aeon);
  const result = spawnSync("epi", [
    "gate", "cron", "add",
    "--name", registration.name,
    "--description", registration.description,
    "--schedule", registration.schedule,
    "--session-target", registration.session_target,
    "--wake-mode", registration.wake_mode,
    "--payload", JSON.stringify(registration.payload),
  ], { encoding: "utf8" });

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `Aeon '${aeon.aeon_id}' cron registration failed`);
  }
  return JSON.parse(result.stdout || "{}");
}
