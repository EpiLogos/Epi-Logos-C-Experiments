import { spawn, spawnSync } from "node:child_process";
import { isValidVakAddress } from "../../shared/vak_address.ts";
import type {
  CfLiteral,
  CfpLiteral,
  CpLiteral,
  CsDirection,
  CsLiteral,
  CtLiteral,
  CfpMoveLiteral,
  CpfPolarity,
  VakAddress,
  ZThreadMove,
  ZThreadShape,
  ZThreadSnapshot,
  ZThreadState,
} from "../../shared/vak_address.ts";
import { AGENT_CF } from "../modules/dispatch-validate.ts";
import {
  MAX_VERIFY_CYCLES,
  evaluateVerifyGate,
  type VerifyEvidence,
} from "../modules/judge-role.ts";
import {
  parentSliceChildEnvironment,
  type ConversationSliceHandle,
} from "../modules/parent-slice.ts";
import {
  DEFAULT_L_THREAD_MAX_CYCLES,
  TILLDONE_TOOL_BODY,
  TILLDONE_TOOL_NAME,
  TILLDONE_TOOL_REGISTRAR,
  describeLThreadResult,
  runLThread,
  type LThreadResult,
  type TillDoneList,
} from "../S4/tilldone.ts";

export type CS = "CS0" | "CS1" | "CS2" | "CS3" | "CS4" | "CS5";
export type CSDirectionality = "day" | "night_prime";

export interface ParentSliceCompletionEvent {
  readonly agentId: string;
  readonly taskId: string;
  readonly c: 0 | 1;
  readonly evidence: string;
  readonly task_spec: string;
  readonly vak_frame: VakAddress;
  readonly parent_slice: ConversationSliceHandle;
}

type ParentSliceCompletionEmitter = (event: ParentSliceCompletionEvent) => void | Promise<void>;

let parentSliceCompletionEmitter: ParentSliceCompletionEmitter | undefined;

/** Bind the extension event bus once Anima's runtime registration is live. */
export function configureParentSliceCompletionEmitter(emitter: ParentSliceCompletionEmitter | undefined): void {
  parentSliceCompletionEmitter = emitter;
}

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

/**
 * Where a Z-thread tool name actually resolves (50.T50.06).
 *
 * The CFP→tool map used to return a bare string, so `"tilldone"` could name a
 * tool nothing registered and no test would notice. A name is now only sayable
 * if this registry says where its body lives and who registers it, and
 * `tests/tilldone_l_thread.test.ts` asserts every recorded path exists on disk.
 */
export interface ZThreadToolRegistration {
  /** The tool name a CFP move dispatches. */
  readonly tool: ZThreadToolName;
  /** Repo path of the module holding the tool body. */
  readonly body: string;
  /** Repo path of the module that calls `pi.registerTool` for it. */
  readonly registrar: string;
  /**
   * Anima-side executor for moves whose semantics are more than one dispatch.
   * Only CFP4 has one: the completion gate that makes an L-Thread an L-Thread.
   */
  readonly executor?: string;
}

const ANIMA_DISPATCH_TOOLS = "Body/S/S4/ta-onta/S4-4p-anima/extension/dispatch-tools.ts";
const ANIMA_SUBAGENT_WIDGET = "Body/S/S4/ta-onta/S4-4p-anima/S4/subagent-widget.ts";

export const ZTHREAD_TOOL_REGISTRY: Readonly<Record<ZThreadToolName, ZThreadToolRegistration>> =
  Object.freeze({
    dispatch_agent: {
      tool: "dispatch_agent",
      body: "Body/S/S4/ta-onta/S4-4p-anima/S4/agent-team.ts",
      registrar: ANIMA_DISPATCH_TOOLS,
    },
    dispatch_parallel_agents: {
      tool: "dispatch_parallel_agents",
      body: ANIMA_DISPATCH_TOOLS,
      registrar: ANIMA_DISPATCH_TOOLS,
    },
    run_chain: {
      tool: "run_chain",
      body: "Body/S/S4/ta-onta/S4-4p-anima/S4/agent-chain.ts",
      registrar: "Body/S/S4/ta-onta/S4-4p-anima/S4/agent-chain.ts",
    },
    dispatch_fusion_agents: {
      tool: "dispatch_fusion_agents",
      body: ANIMA_DISPATCH_TOOLS,
      registrar: ANIMA_DISPATCH_TOOLS,
    },
    // CFP4 resolves OUT of Anima on purpose: 12.T12.11 confirmed TillDone's
    // residency in Pleroma (bounded execution primitives), so Anima binds the
    // registered tool rather than keeping a second copy of it.
    tilldone: {
      tool: TILLDONE_TOOL_NAME as ZThreadToolName,
      body: TILLDONE_TOOL_BODY,
      registrar: TILLDONE_TOOL_REGISTRAR,
      executor: "Body/S/S4/ta-onta/S4-4p-anima/S4/tilldone.ts",
    },
    subagent_create: {
      tool: "subagent_create",
      body: ANIMA_SUBAGENT_WIDGET,
      registrar: ANIMA_SUBAGENT_WIDGET,
    },
  });

/** Raised when a CFP move names a tool with no registration. */
export class UnregisteredZThreadTool extends Error {
  readonly cfp: CfpMoveLiteral;
  readonly tool: string;

  constructor(cfp: CfpMoveLiteral, tool: string) {
    super(`CFP move '${cfp}' names tool '${tool}', which has no registration`);
    this.name = "UnregisteredZThreadTool";
    this.cfp = cfp;
    this.tool = tool;
  }
}

const CFP_TOOL_NAMES: Readonly<Record<CfpMoveLiteral, ZThreadToolName>> = Object.freeze({
  CFP0: "dispatch_agent",
  CFP1: "dispatch_parallel_agents",
  CFP2: "run_chain",
  CFP3: "dispatch_fusion_agents",
  CFP4: TILLDONE_TOOL_NAME as ZThreadToolName,
  CFP5: "subagent_create",
});

/** Resolve a CFP move to its full registration. Throws if the name dangles. */
export function zThreadToolRegistration(cfp: CfpMoveLiteral): ZThreadToolRegistration {
  const tool = CFP_TOOL_NAMES[cfp];
  if (!tool) {
    throw new Error(`No Z-thread tool mapping for CFP move '${cfp}'`);
  }
  const registration = ZTHREAD_TOOL_REGISTRY[tool];
  if (!registration) {
    throw new UnregisteredZThreadTool(cfp, tool);
  }
  return registration;
}

export interface ZThreadMoveResult {
  move_id: string;
  cfp: CfpMoveLiteral;
  tool: ZThreadToolName;
  output: string;
  /** Present only for a CFP4 move that ran under the completion gate. */
  l_thread?: LThreadResult;
}

export interface ZThreadRuntimeAdapter {
  perform(move: ZThreadMove, thread: ZThreadSnapshot): Promise<ZThreadMoveResult | string>;
  verify(thread: ZThreadSnapshot): Promise<VerifyEvidence>;
  rehear?(thread: ZThreadSnapshot): Promise<string | void>;
  recompose?(thread: ZThreadSnapshot): Promise<string | void>;
  /**
   * Read the CURRENT `tilldone` task list for a CFP4 move (50.T50.06).
   *
   * Supplying this turns CFP4 into the L-Thread its name promises: the move is
   * performed repeatedly until the completion gate says the list is done, and
   * each pass receives the previous verdict so the gate's reason reaches the
   * agent. Omit it and CFP4 keeps the old single-pass behaviour — the gate is
   * opt-in per adapter, never silently assumed.
   */
  readTaskList?(move: ZThreadMove, thread: ZThreadSnapshot): Promise<TillDoneList | undefined> | (TillDoneList | undefined);
  /** Pass bound for a gated CFP4 move. Defaults to `DEFAULT_L_THREAD_MAX_CYCLES`. */
  lThreadMaxCycles?: number;
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

/**
 * The CFP→tool map, now routed through the registry (50.T50.06).
 *
 * Same signature and same answers as the switch it replaces, but a name can no
 * longer be returned unless `ZTHREAD_TOOL_REGISTRY` says where it is registered.
 */
export function zThreadToolForMove(cfp: CfpMoveLiteral): ZThreadToolName {
  return zThreadToolRegistration(cfp).tool;
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
        snapshot.outputs.push(await performZThreadMove(input.adapter, move, snapshot));
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

/**
 * Perform one Z-thread move (50.T50.06).
 *
 * Every move except CFP4 is one pass, exactly as before. CFP4 is the L-Thread:
 * when the adapter can read the `tilldone` task list, the move runs under the
 * completion gate — repeating until the list is done, refusing to report a
 * close it did not earn — and the resulting `LThreadResult` is attached to the
 * move result so the trace records how many passes it actually took.
 */
async function performZThreadMove(
  adapter: ZThreadRuntimeAdapter,
  move: ZThreadMove,
  snapshot: ZThreadSnapshot,
): Promise<ZThreadMoveResult> {
  if (move.cfp !== "CFP4" || !adapter.readTaskList) {
    return normalizeZThreadMoveResult(move, await adapter.perform(move, snapshot));
  }

  const readTaskList = adapter.readTaskList.bind(adapter);
  const result = await runLThread({
    id: move.id,
    maxCycles: adapter.lThreadMaxCycles ?? DEFAULT_L_THREAD_MAX_CYCLES,
    perform: async (_cycle, previous) => {
      // The gate's reason travels with the move so the next pass sees WHY it is
      // still running — the tool's interactive nudge, in orchestration form.
      const nudged: ZThreadMove = previous
        ? { ...move, task: `${move.task}\n\n[tilldone] ${previous.reason}` }
        : move;
      const raw = await adapter.perform(nudged, snapshot);
      return typeof raw === "string" ? raw : raw.output;
    },
    readTaskList: () => readTaskList(move, snapshot),
  });

  return {
    move_id: move.id,
    cfp: move.cfp,
    tool: zThreadToolForMove(move.cfp),
    output: describeLThreadResult(result),
    l_thread: result,
  };
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
  return spawnSync(process.env.EPI_BIN || "epi", args, {
    encoding: "utf8",
    timeout,
    cwd: process.env.EPI_REPO_ROOT || process.cwd(),
  });
}

export interface TeamDispatchVakAddressDefaults {
  readonly agentName: string;
  readonly vakAddress?: unknown;
  readonly cpf?: CpfPolarity;
  readonly ct?: CtLiteral[];
  readonly cp?: CpLiteral;
  readonly cf?: CfLiteral;
  readonly cfp?: CfpLiteral;
  readonly cs?: {
    readonly code?: CsLiteral;
    readonly direction?: CsDirection;
  };
}

export function vakAddressForTeamDispatch(input: TeamDispatchVakAddressDefaults): VakAddress {
  if (input.vakAddress !== undefined) {
    if (!isValidVakAddress(input.vakAddress)) {
      throw new Error("vak_address failed canonical validation");
    }
    return input.vakAddress;
  }

  const normalizedAgent = input.agentName.trim().toLowerCase();
  const cf = input.cf ?? AGENT_CF[normalizedAgent] ?? "(4.0/1-4.4/5)";
  return {
    cpf: input.cpf ?? "(4.0/1-4.4/5)",
    ct: input.ct ?? ["CT4b"],
    cp: input.cp ?? "CP4.2",
    cf,
    cfp: input.cfp ?? "CFP0",
    cs: {
      code: input.cs?.code ?? "CS4",
      direction: input.cs?.direction ?? "Day",
    },
  };
}

// Dispatch a single agent task via the native team runtime (epi agent team dispatch).
// Returns a Promise so callers can fan-out concurrently with Promise.all.
// vak_address is REQUIRED — every dispatch must carry its causal address (A5).
// Callers must pre-validate via validateDispatchParams; this function trusts its input.
// The address is forwarded to the child via EPI_SESSION_VAK_ADDRESS so downstream
// tools (Hen template render, future VAK-aware tools) can read it.
export function dispatchTeamMember(agentName: string, task: string, vakAddress?: VakAddress): Promise<string> {
  return dispatchTeamMemberWithEnvironment(agentName, task, vakAddress);
}

/**
 * Additive 12.T12.31 route: child execution receives a redacted parent slice
 * in its process environment while retaining the same native `epi agent team
 * dispatch` launch path as every ordinary Anima dispatch.
 */
export async function dispatchWithParentSlice(input: {
  readonly target_agent: string;
  readonly task_spec: string;
  readonly vak_frame: VakAddress;
  readonly parent_slice: ConversationSliceHandle;
}): Promise<string> {
  const output = await dispatchTeamMemberWithEnvironment(
    input.target_agent,
    input.task_spec,
    input.vak_frame,
    parentSliceChildEnvironment(input.parent_slice),
  );
  const completion = parentSliceCompletionFromDispatchOutput(input, output);
  if (completion) await publishParentSliceCompletion(completion);
  return output;
}

export async function publishParentSliceCompletion(event: ParentSliceCompletionEvent): Promise<void> {
  if (parentSliceCompletionEmitter) await parentSliceCompletionEmitter(event);
}

/**
 * Native `epi agent team dispatch --json` is the authoritative completion
 * report. A child may set `EPI_SUBGOAL_STATUS={"c":0,"evidence":"..."}`
 * in its final output to continue its micro-history; an ordinary successful
 * process completion is a c=1 fold.
 */
export function parentSliceCompletionFromDispatchOutput(input: {
  readonly target_agent: string;
  readonly task_spec: string;
  readonly vak_frame: VakAddress;
  readonly parent_slice: ConversationSliceHandle;
}, output: string): ParentSliceCompletionEvent | null {
  const report = jsonRecord(output);
  if (!report || report.ok !== true) return null;
  const rawEvidence = typeof report?.output === "string" ? report.output : output;
  const signal = subgoalSignal(rawEvidence);
  return {
    agentId: input.target_agent,
    taskId: stringField(report, "team_id") ?? stringField(report, "teamId")
      ?? `${input.parent_slice.provenance_audit_id}:${input.target_agent}`,
    c: signal?.c ?? 1,
    evidence: signal?.evidence ?? rawEvidence,
    task_spec: input.task_spec,
    vak_frame: input.vak_frame,
    parent_slice: input.parent_slice,
  };
}

function subgoalSignal(output: string): { c: 0 | 1; evidence?: string } | null {
  const line = output.split("\n").find((entry) => entry.startsWith("EPI_SUBGOAL_STATUS="));
  if (!line) return null;
  const parsed = jsonRecord(line.slice("EPI_SUBGOAL_STATUS=".length));
  if (!parsed || (parsed.c !== 0 && parsed.c !== 1)) return null;
  return {
    c: parsed.c,
    evidence: typeof parsed.evidence === "string" ? parsed.evidence : undefined,
  };
}

function jsonRecord(value: string): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : null;
  } catch {
    return null;
  }
}

function stringField(record: Record<string, unknown> | null, key: string): string | null {
  const value = record?.[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function dispatchTeamMemberWithEnvironment(
  agentName: string,
  task: string,
  vakAddress?: VakAddress,
  parentSliceEnvironment?: NodeJS.ProcessEnv,
): Promise<string> {
  const parentSession = process.env.EPI_PARENT_SESSION || "agent:main:main";
  const args = [
    "--json", "agent", "team", "dispatch",
    "--parent-session", parentSession,
    "--agent", agentName,
    "--task", task,
  ];
  const childEnv: NodeJS.ProcessEnv = { ...process.env, ...parentSliceEnvironment };
  const parentSessionForChild = parentSliceEnvironment?.EPI_PARENT_SESSION ?? parentSession;
  args[5] = parentSessionForChild;
  if (vakAddress) {
    childEnv.EPI_SESSION_VAK_ADDRESS = JSON.stringify(vakAddress);
  }
  return new Promise((resolve) => {
    const proc = spawn(process.env.EPI_BIN || "epi", args, {
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
