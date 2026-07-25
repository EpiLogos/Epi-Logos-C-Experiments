/**
 * thread-shape.ts — CFP is a SHAPE; tools are CAPABILITIES.
 *
 * ── The category error this replaces ──────────────────────────────────────
 * `zThreadToolForMove` used to be a total function `CfpMoveLiteral -> tool`,
 * asserting a bijection between thread types and tools. That is not what the
 * language says.
 *
 * CANON (`[[S4-4'-SPEC]]`, `Idea/Bimba/Seeds/S/S4/S4'/S4-4'-SPEC.md`) lists the
 * PI tools as ONE FLAT registered set — `vak_evaluate`, `goal_prelude`,
 * `anima_orchestrate`, `nous_disclose`, `dispatch_*`, `run_chain`,
 * `subagent_*`, `tilldone` — with no pairing to any coordinate, and states the
 * VAK envelope as six fields. `[[S4'-SPEC]]`'s Reading-Frame Law says only that
 * "CFP declares thread/spread topology, including nested/meta sub-readings".
 * Nothing in canon binds a coordinate to a tool.
 *
 * The teaching table in `S4'/skills/vak-coordinate-frame/SKILL.md` — agent
 * tooling, not canon — likewise maps a CFP to a SKILL or PATTERN, not a tool:
 *   CFP1 -> `dispatching-parallel-agents`, CFP2 -> `subagent-driven-development`,
 *   CFP4 -> `executing-plans`, CFP5 -> "Meta-nested dispatch"
 * — and writes CFP3 as "**Mode of `dispatching-parallel-agents`**", i.e. an
 * explicitly many-to-one relation. Even the teaching material never claimed the
 * bijection the code asserted.
 *
 * The bijection also failed on its own terms: CFP4 dangled, naming a tool
 * nothing registered. Not because a registration was missing, but because
 * "Long" is a duration/autonomy property and there is no "long" dispatch
 * primitive to point at. The dangling name WAS the model breaking.
 *
 * Two further tells: `tilldone` is entitled to `anuttara`
 * (`pi-agent/agents/anuttara.md`), an agent with no CFP4 relationship — so it is
 * plainly a general capacity; and `subagent_create` is one of a lifecycle family
 * (`create`/`continue`/`list`/`remove`) whose other members no CFP claims.
 *
 * ── The delineation ──────────────────────────────────────────────────────
 * **Threads are shapes.** A CFP says how execution is STRUCTURED: how wide it
 * fans out, how results come back together, whether it recurses, how autonomous
 * it runs, and what has to be true before it may close.
 *
 * **Tools are capabilities.** Entitlement-gated, agent-scoped, shape-agnostic.
 * A tool does not belong to a thread type. Several shapes may use one tool; one
 * shape may use several; an agent may hold a tool and never use that shape.
 *
 * The relation between them is many-to-many and ADVISORY. `capabilitiesFor()`
 * answers "which entitled tools could realise this shape", never "which tool IS
 * this thread".
 *
 * Canon: [[S4'-SPEC]] (the six-field dispatch grammar + Reading-Frame Law) ->
 * [[S4-4'-SPEC]] (S4.4' VAK and Psyche Law, the CFP owner). World authority for
 * the S4'Cx projection: `Idea/Bimba/World/Types/Coordinates/S/S'/S4'/S4'.md`,
 * where CFP is "Context Frame Pattern — nesting algebra". The full six are
 * documented at the type definition, `ta-onta/shared/vak_address.ts`.
 * DR-VAK-3 (VAK is the operational language, not metadata over labels).
 */

import type { CfpMoveLiteral } from "../../shared/vak_address.ts";

// ── Threads are shapes ────────────────────────────────────────────────────

/** How wide the thread runs. */
export type ThreadFanOut = "one" | "many";
/** How results come back together. */
export type ThreadAggregation = "none" | "sequential" | "fused";
/** Whether the thread opens threads of its own. */
export type ThreadNesting = "flat" | "recursive";
/** How much it runs without a human. */
export type ThreadAutonomy = "checkpointed" | "long-running";
/**
 * What has to hold before the thread may close.
 *
 * `review` — the ordinary verify/review gate closes it.
 * `till-done` — it closes only when its own declared work is complete. This is
 * a property of the SHAPE, which is why the completion gate is reachable from
 * any thread that declares it rather than owned by one CFP.
 */
export type ThreadCompletion = "review" | "till-done";

export interface ThreadShape {
	readonly cfp: CfpMoveLiteral;
	/** The thread name, as `[[S4'-SPEC]]` and the teaching table both give it. */
	readonly thread: string;
	readonly fanOut: ThreadFanOut;
	readonly aggregation: ThreadAggregation;
	readonly nesting: ThreadNesting;
	readonly autonomy: ThreadAutonomy;
	readonly completion: ThreadCompletion;
	/** The skill/pattern this CFP is taught against — the "Maps To" column. */
	readonly mapsTo: string;
}

const THREAD_SHAPES: Readonly<Record<CfpMoveLiteral, ThreadShape>> = Object.freeze({
	CFP0: {
		cfp: "CFP0",
		thread: "Base",
		fanOut: "one",
		aggregation: "none",
		nesting: "flat",
		autonomy: "checkpointed",
		completion: "review",
		mapsTo: "Direct execution",
	},
	CFP1: {
		cfp: "CFP1",
		thread: "P-Thread (Parallel)",
		fanOut: "many",
		aggregation: "none",
		nesting: "flat",
		autonomy: "checkpointed",
		completion: "review",
		mapsTo: "dispatching-parallel-agents",
	},
	CFP2: {
		cfp: "CFP2",
		thread: "C-Thread (Chained)",
		fanOut: "many",
		aggregation: "sequential",
		nesting: "flat",
		autonomy: "checkpointed",
		completion: "review",
		mapsTo: "subagent-driven-development",
	},
	CFP3: {
		// Canon writes this one as "Mode of dispatching-parallel-agents" — the
		// same skill as CFP1, differing only in how results come back. That is
		// exactly why a shape, not a tool, is the right unit.
		cfp: "CFP3",
		thread: "F-Thread (Fusion)",
		fanOut: "many",
		aggregation: "fused",
		nesting: "flat",
		autonomy: "checkpointed",
		completion: "review",
		mapsTo: "Mode of dispatching-parallel-agents",
	},
	CFP4: {
		// "High-autonomy, long-duration with self-validation." Nothing here is a
		// topology — which is why no dispatch primitive ever fitted it.
		cfp: "CFP4",
		thread: "L-Thread (Long)",
		fanOut: "one",
		aggregation: "none",
		nesting: "flat",
		autonomy: "long-running",
		completion: "till-done",
		mapsTo: "executing-plans",
	},
	CFP5: {
		cfp: "CFP5",
		thread: "B-Thread (Big)",
		fanOut: "many",
		aggregation: "none",
		nesting: "recursive",
		autonomy: "long-running",
		completion: "review",
		mapsTo: "Meta-nested dispatch",
	},
});

/** The shape a CFP move denotes. */
export function shapeOf(cfp: CfpMoveLiteral): ThreadShape {
	const shape = THREAD_SHAPES[cfp];
	if (!shape) throw new Error(`No thread shape for CFP move '${cfp}'`);
	return shape;
}

/** Every declared shape, in CFP order. */
export function allThreadShapes(): ThreadShape[] {
	return Object.values(THREAD_SHAPES);
}

// ── Tools are capabilities ────────────────────────────────────────────────

export type ZThreadToolName =
	| "dispatch_agent"
	| "dispatch_parallel_agents"
	| "run_chain"
	| "dispatch_fusion_agents"
	| "tilldone"
	| "subagent_create";

/**
 * What a tool can DO. Deliberately not "which CFP it belongs to" — a capability
 * is a property of the tool, and shapes are matched against it.
 */
export type CapabilityKind =
	| "dispatch-one"
	| "dispatch-many"
	| "sequence"
	| "fuse"
	| "nest"
	| "completion-gate";

export interface ToolCapability {
	readonly tool: ZThreadToolName;
	/** Repo path of the module holding the tool body. */
	readonly body: string;
	/** Repo path of the module that calls `pi.registerTool` for it. */
	readonly registrar: string;
	/** Anima-side executor, where the tool needs orchestration logic of its own. */
	readonly executor?: string;
	/** What this tool can realise. A tool may realise several things. */
	readonly realizes: readonly CapabilityKind[];
}

const ANIMA_DISPATCH_TOOLS = "Body/S/S4/ta-onta/S4-4p-anima/extension/dispatch-tools.ts";
const ANIMA_SUBAGENT_WIDGET = "Body/S/S4/ta-onta/S4-4p-anima/S4/subagent-widget.ts";

/**
 * The capability registry, keyed by TOOL.
 *
 * Keyed by tool on purpose: the old registry was keyed by CFP, which encoded the
 * bijection into its very shape. Residency stays recorded here because it is
 * genuinely useful — a test walks every entry and asserts the paths exist, so a
 * tool name can never dangle again — but residency is a fact about the tool, not
 * about any thread.
 */
export const TOOL_CAPABILITIES: Readonly<Record<ZThreadToolName, ToolCapability>> = Object.freeze({
	dispatch_agent: {
		tool: "dispatch_agent",
		body: "Body/S/S4/ta-onta/S4-4p-anima/S4/agent-team.ts",
		registrar: ANIMA_DISPATCH_TOOLS,
		realizes: ["dispatch-one"],
	},
	dispatch_parallel_agents: {
		tool: "dispatch_parallel_agents",
		body: ANIMA_DISPATCH_TOOLS,
		registrar: ANIMA_DISPATCH_TOOLS,
		realizes: ["dispatch-many"],
	},
	run_chain: {
		tool: "run_chain",
		body: "Body/S/S4/ta-onta/S4-4p-anima/S4/agent-chain.ts",
		registrar: "Body/S/S4/ta-onta/S4-4p-anima/S4/agent-chain.ts",
		realizes: ["dispatch-many", "sequence"],
	},
	dispatch_fusion_agents: {
		tool: "dispatch_fusion_agents",
		body: ANIMA_DISPATCH_TOOLS,
		registrar: ANIMA_DISPATCH_TOOLS,
		realizes: ["dispatch-many", "fuse"],
	},
	tilldone: {
		// A completion DISCIPLINE, not a dispatch primitive — which is why it
		// realises no dispatch capability at all, and why any shape declaring
		// `completion: "till-done"` can reach it. Residency is Pleroma (bounded
		// execution primitives, 12.T12.11); Anima owns only the executor that
		// decides when a run may close.
		tool: "tilldone",
		body: "Body/S/S4/ta-onta/S4-2p-pleroma/S2/tilldone.ts",
		registrar: "Body/S/S4/ta-onta/S4-2p-pleroma/extension.ts",
		executor: "Body/S/S4/ta-onta/S4-4p-anima/S4/tilldone.ts",
		realizes: ["completion-gate"],
	},
	subagent_create: {
		// One member of a lifecycle family (create/continue/list/remove). No CFP
		// owns it; a recursive shape is simply the one that most often needs it.
		tool: "subagent_create",
		body: ANIMA_SUBAGENT_WIDGET,
		registrar: ANIMA_SUBAGENT_WIDGET,
		realizes: ["dispatch-one", "nest"],
	},
});

/** The capabilities a shape needs in order to be realised. */
export function capabilityKindsFor(shape: ThreadShape): CapabilityKind[] {
	const kinds: CapabilityKind[] = [shape.fanOut === "many" ? "dispatch-many" : "dispatch-one"];
	if (shape.aggregation === "sequential") kinds.push("sequence");
	if (shape.aggregation === "fused") kinds.push("fuse");
	if (shape.nesting === "recursive") kinds.push("nest");
	if (shape.completion === "till-done") kinds.push("completion-gate");
	return kinds;
}

/**
 * Which tools could realise this shape — ADVISORY, and many-to-many.
 *
 * `entitled` narrows the answer to what the acting agent may actually call, so
 * the entitlement gate stays the authority on reachability and this function
 * stays a suggestion. Returns every tool realising at least one capability the
 * shape needs; it never claims a tool IS the thread.
 */
export function capabilitiesFor(
	shape: ThreadShape,
	entitled?: readonly string[],
): ToolCapability[] {
	const needed = new Set(capabilityKindsFor(shape));
	return Object.values(TOOL_CAPABILITIES).filter((capability) => {
		if (entitled && !entitled.includes(capability.tool)) return false;
		return capability.realizes.some((kind) => needed.has(kind));
	});
}

/**
 * The tool a shape CONVENTIONALLY starts from, or `null` when no single tool
 * carries it.
 *
 * `null` for CFP4 is the honest answer, not a gap: an L-Thread is a duration and
 * completion property laid over whatever dispatch it wraps, so naming one tool
 * for it would re-assert the bijection this module exists to remove. Callers
 * that want the completion gate should read `shape.completion`.
 */
export function conventionalToolFor(cfp: CfpMoveLiteral): ZThreadToolName | null {
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
			return null;
		case "CFP5":
			return "subagent_create";
	}
	const exhaustive: never = cfp;
	throw new Error(`No thread shape for CFP move '${exhaustive}'`);
}

/** Does this shape close only when its own declared work is done? */
export function requiresCompletionGate(shape: ThreadShape): boolean {
	return shape.completion === "till-done";
}
