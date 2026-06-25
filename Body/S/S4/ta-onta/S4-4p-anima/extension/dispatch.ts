import { spawn, spawnSync } from "node:child_process";
import type {
  CfpMoveLiteral,
  VakAddress,
  ZThreadMove,
  ZThreadShape,
  ZThreadSnapshot,
  ZThreadState,
} from "../../shared/vak_address.ts";
import {
  MAX_VERIFY_CYCLES,
  evaluateVerifyGate,
  type VerifyEvidence,
} from "../modules/judge-role.ts";

export type CS = "CS0" | "CS1" | "CS2" | "CS3" | "CS4" | "CS5";
export type CSDirectionality = "day" | "night_prime";

export type CSState = {
  value: CS;
  directionality: CSDirectionality;
  cpPosition: "4.0" | "4.1" | "4.2" | "4.3" | "4.4" | "4.5";
};

const sessionCSState = new Map<string, CSState>();
const zThreadShapes = new Map<string, ZThreadShape>();
const zThreadSnapshots = new Map<string, ZThreadSnapshot>();

export function setCSState(sessionId: string | undefined, nextState: CSState) {
  if (sessionId) {
    sessionCSState.set(sessionId, nextState);
  }
  return nextState;
}

export function getCSState(sessionId?: string): CSState {
  return (sessionId && sessionCSState.get(sessionId)) ?? {
    value: "CS0",
    directionality: "day",
    cpPosition: "4.0",
  };
}

export type ZThreadToolName =
  | "dispatch_agent"
  | "dispatch_parallel_agents"
  | "run_chain"
  | "dispatch_fusion_agents"
  | "tilldone"
  | "subagent_create";

export interface ZThreadMoveResult {
  move_id: string;
  cfp: CfpMoveLiteral;
  tool: ZThreadToolName;
  output: string;
}

export interface ZThreadRuntimeAdapter {
  perform(move: ZThreadMove, thread: ZThreadSnapshot): Promise<ZThreadMoveResult | string>;
  verify(thread: ZThreadSnapshot): Promise<VerifyEvidence>;
  rehear?(thread: ZThreadSnapshot): Promise<string | void>;
  recompose?(thread: ZThreadSnapshot): Promise<string | void>;
}

export interface RegisterZThreadShapeInput {
  id: string;
  task?: string;
  vak_address: VakAddress;
  moves: ZThreadMove[];
}

export interface DispatchZThreadInput extends RegisterZThreadShapeInput {
  adapter: ZThreadRuntimeAdapter;
  max_verify_cycles?: number;
}

export function zThreadToolForMove(cfp: CfpMoveLiteral): ZThreadToolName {
  switch (cfp) {
    case "CFP0":
      return "dispatch_agent";
    case "CFP1":
      return "dispatch_parallel_agents";
    case "CFP2":
      return "run_chain";
    case "CFP3":
      return "dispatch_fusion_agents";
    case "CFP4":
      return "tilldone";
    case "CFP5":
      return "subagent_create";
  }
  const exhaustive: never = cfp;
  throw new Error(`No Z-thread tool mapping for CFP move '${exhaustive}'`);
}

export function registerZThreadShape(input: RegisterZThreadShapeInput): ZThreadShape {
  if (input.vak_address.cfp !== "Z") {
    throw new Error(`Z-thread '${input.id}' requires vak_address.cfp === "Z"`);
  }
  if (input.moves.length === 0) {
    throw new Error(`Z-thread '${input.id}' requires at least one CFP move`);
  }
  const composes = [...new Set(input.moves.map((move) => move.cfp))];
  if (composes.length < 2) {
    throw new Error(`Z-thread '${input.id}' must compose at least two distinct CFP moves`);
  }
  const shape: ZThreadShape = {
    id: input.id,
    task: input.task,
    vak_address: input.vak_address as VakAddress & { cfp: "Z" },
    moves: input.moves,
    composes,
  };
  zThreadShapes.set(shape.id, shape);
  zThreadSnapshots.set(shape.id, initialZThreadSnapshot(shape));
  return shape;
}

export function getZThreadShape(id: string): ZThreadShape | undefined {
  return zThreadShapes.get(id);
}

export function getZThreadSnapshot(id: string): ZThreadSnapshot | undefined {
  return zThreadSnapshots.get(id);
}

export function listZThreadSnapshots(): ZThreadSnapshot[] {
  return [...zThreadSnapshots.values()];
}

export async function dispatchZThread(input: DispatchZThreadInput): Promise<ZThreadSnapshot> {
  const shape = registerZThreadShape(input);
  const snapshot = initialZThreadSnapshot(shape);
  zThreadSnapshots.set(shape.id, snapshot);

  const maxVerifyCycles = input.max_verify_cycles ?? MAX_VERIFY_CYCLES;
  try {
    while (snapshot.cycle < maxVerifyCycles) {
      snapshot.cycle += 1;
      transitionZThread(snapshot, "composing");
      transitionZThread(snapshot, "performing");
      for (const move of shape.moves) {
        snapshot.outputs.push(normalizeZThreadMoveResult(move, await input.adapter.perform(move, snapshot)));
      }

      transitionZThread(snapshot, "verifying");
      const evidence = await input.adapter.verify(snapshot);
      const verifyGate = evaluateVerifyGate({
        verify_cycles: snapshot.cycle,
        evidence: [evidence],
      });
      snapshot.verify_gate = verifyGate;

      if (verifyGate.transition === "rehear") {
        await rehearAndRecompose(input.adapter, snapshot);
        transitionZThread(snapshot, "done");
        return snapshot;
      }

      if (verifyGate.transition === "human_escalation") {
        snapshot.failure_reason = verifyGate.reason;
        transitionZThread(snapshot, "failed");
        return snapshot;
      }

      await rehearAndRecompose(input.adapter, snapshot);
    }

    snapshot.failure_reason =
      `Verify gate did not clear after ${maxVerifyCycles} cycle${maxVerifyCycles === 1 ? "" : "s"}`;
    transitionZThread(snapshot, "failed");
    return snapshot;
  } catch (error) {
    snapshot.failure_reason = error instanceof Error ? error.message : String(error);
    transitionZThread(snapshot, "failed");
    return snapshot;
  }
}

function initialZThreadSnapshot(shape: ZThreadShape): ZThreadSnapshot {
  return {
    id: shape.id,
    task: shape.task,
    state: "queued",
    vak_address: shape.vak_address,
    composes: shape.composes,
    cycle: 0,
    history: ["queued"],
    outputs: [],
  };
}

function transitionZThread(snapshot: ZThreadSnapshot, state: ZThreadState) {
  snapshot.state = state;
  snapshot.history.push(state);
  zThreadSnapshots.set(snapshot.id, snapshot);
}

async function rehearAndRecompose(adapter: ZThreadRuntimeAdapter, snapshot: ZThreadSnapshot) {
  transitionZThread(snapshot, "rehearing");
  await adapter.rehear?.(snapshot);
  transitionZThread(snapshot, "recomposing");
  await adapter.recompose?.(snapshot);
}

function normalizeZThreadMoveResult(
  move: ZThreadMove,
  result: ZThreadMoveResult | string,
): ZThreadMoveResult {
  if (typeof result !== "string") return result;
  return {
    move_id: move.id,
    cfp: move.cfp,
    tool: zThreadToolForMove(move.cfp),
    output: result,
  };
}

export function runEpi(args: string[], timeout = 120_000) {
  return spawnSync("epi", args, {
    encoding: "utf8",
    timeout,
    cwd: process.env.EPI_REPO_ROOT || process.cwd(),
  });
}

// Dispatch a single agent task via the native team runtime (epi agent team dispatch).
// Returns a Promise so callers can fan-out concurrently with Promise.all.
// vak_address is REQUIRED — every dispatch must carry its causal address (A5).
// Callers must pre-validate via validateDispatchParams; this function trusts its input.
// The address is forwarded to the child via EPI_SESSION_VAK_ADDRESS so downstream
// tools (Hen template render, future VAK-aware tools) can read it.
export function dispatchTeamMember(agentName: string, task: string, vakAddress?: VakAddress): Promise<string> {
  const parentSession = process.env.EPI_PARENT_SESSION || "agent:main:main";
  const args = [
    "--json", "agent", "team", "dispatch",
    "--parent-session", parentSession,
    "--agent", agentName,
    "--task", task,
  ];
  const childEnv: NodeJS.ProcessEnv = { ...process.env };
  if (vakAddress) {
    childEnv.EPI_SESSION_VAK_ADDRESS = JSON.stringify(vakAddress);
  }
  return new Promise((resolve) => {
    const proc = spawn("epi", args, {
      stdio: ["ignore", "pipe", "pipe"],
      env: childEnv,
      cwd: process.env.EPI_REPO_ROOT || process.cwd(),
    });
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (d: Buffer) => { stdout += d.toString(); });
    proc.stderr.on("data", (d: Buffer) => { stderr += d.toString(); });
    proc.on("close", () => { resolve(stdout || stderr); });
    proc.on("error", (err: Error) => { resolve(`Error: ${err.message}`); });
  });
}

export function sophiaReview(sessionId: string | undefined, sessionOutput: string) {
  const nightState = setCSState(sessionId, {
    value: "CS5",
    directionality: "night_prime",
    cpPosition: "4.5",
  });
  const prompt = [
    "Review and crystallise this session output.",
    "Emit P5' insight and P0' questions.",
    `CS=${nightState.value}:${nightState.directionality}`,
    sessionOutput,
  ].join("\n\n");
  return runEpi(["agent", "run", "--agent", "sophia", prompt]);
}
