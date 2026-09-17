/**
 * cpf_review_gate.test.ts — agent-decided human-in-loop checkpoints (50.T50.09).
 *
 * The law under test, stated as behaviour:
 *
 *   1. The system NEVER inserts a checkpoint. A dialogical dispatch carrying no
 *      authored checkpoint stays open conversation — that is the Architect's
 *      `(00/00)` law and this tranche must not quietly repeal it.
 *   2. A checkpoint exists because an agent AUTHORED it, for one of exactly three
 *      reasons. A fourth reason is refused rather than accepted as free text.
 *   3. An authored checkpoint HALTS: it cannot reach execution until a human has
 *      answered it. An agent answering its own checkpoint is not an answer.
 *   4. A checkpoint on a mechanistic step is a contradiction — it says "halt" and
 *      "run autonomously" at once — and is refused at declaration time.
 *   5. The checkpoint and the recursive-self-review gate are ONE law: one human
 *      answer satisfies both, and an unsatisfied checkpoint satisfies neither.
 *
 * Everything here runs the real modules; nothing is mocked.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import {
	CHECKPOINT_REASONS,
	checkpointGate,
	validateDispatchParams,
	type CpfCheckpoint,
} from "../modules/dispatch-validate.ts";
import {
	assertChildPiInvariants,
	ChildPiDispatchRefused,
	type ChildPiDispatchRequest,
} from "../lib/child-pi-executor.ts";
import {
	checkpointSatisfiesFinalValidation,
	enforceReviewGate,
} from "../../../pi-agent/lib/review-gate.ts";
import {
	DialogicalHaltRequired,
	defineOrchestration,
	runOrchestration,
	VakEnvelopeError,
} from "../lib/vak-orchestration-surface.ts";
import {
	learnedCheckpointProposals,
	recordCheckpointReview,
} from "../extension/dispatch.ts";
import { saveScore, scoresDir } from "../../S4-1p-hen/modules/score-store.ts";
import type { VakAddress } from "../../shared/vak_address.ts";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * A canonical address at either polarity. `cf` follows the polarity's agent.
 *
 * `cp` is overridable because `runOrchestration` orders a run by CS pass then CP
 * POSITION — so a checkpoint that must land after the work it reviews has to say
 * so with its position, not with its place in the array.
 */
function address(
	polarity: "dialogical" | "mechanistic",
	cp?: VakAddress["cp"],
): VakAddress {
	return polarity === "dialogical"
		? {
				cpf: "(00/00)",
				ct: ["CT2"],
				cp: cp ?? "CP4.0",
				cf: "(00/00)",
				cfp: "CFP0",
				cs: { code: "CS0", direction: "Day" },
			}
		: {
				cpf: "(4.0/1-4.4/5)",
				ct: ["CT2"],
				cp: cp ?? "CP4.2",
				cf: "(0/1)",
				cfp: "CFP2",
				cs: { code: "CS2", direction: "Day" },
			};
}

const AUTHORED: CpfCheckpoint = {
	reason: "implied-by-task",
	note: "the task names a canon write, so a human sees it before it lands",
};

// ── 1. no auto-insertion ──────────────────────────────────────────────────

test("the system never inserts a checkpoint: dialogical alone is open conversation", () => {
	// The Architect's law: "(00/00) CPF is for open convo, no necessary vak
	// scaffolding". A checkpoint is an AUTHORED act, so its absence is not a
	// silent default — it is the answer.
	const gate = checkpointGate({ vak_address: address("dialogical") });
	assert.equal(gate.ok, true);

	// And the pre-existing relaxation still holds end-to-end.
	const relaxed = validateDispatchParams({
		agent_name: "nous",
		task: "think out loud with me",
		vak_address: { cpf: "(00/00)" } as unknown as VakAddress,
	});
	assert.equal(relaxed.ok, true);
});

test("a dispatch with no vak_address at all is untouched by the checkpoint gate", () => {
	assert.equal(checkpointGate({}).ok, true);
	assert.equal(
		validateDispatchParams({ agent_name: "eros", task: "chat" }).ok,
		true,
	);
});

// ── 2. authored, with a reason from the closed set ────────────────────────

test("the three checkpoint reasons are the closed set the brief names", () => {
	assert.deepEqual([...CHECKPOINT_REASONS], [
		"implied-by-task",
		"requested-at-origination",
		"learned-from-review",
	]);
});

test("a checkpoint reason outside the closed set is refused, naming the three", () => {
	const gate = checkpointGate({
		vak_address: address("dialogical"),
		checkpoint: { reason: "seemed-sensible" } as unknown as CpfCheckpoint,
	});
	assert.equal(gate.ok, false);
	for (const reason of CHECKPOINT_REASONS) {
		assert.match(gate.error ?? "", new RegExp(reason));
	}
});

// ── 3. an authored checkpoint halts ───────────────────────────────────────

test("an authored checkpoint halts until a human answers it", async (t) => {
	await t.test("unanswered => refused, and the refusal says it halts", () => {
		const gate = checkpointGate({
			vak_address: address("dialogical"),
			checkpoint: AUTHORED,
		});
		assert.equal(gate.ok, false);
		assert.match(gate.error ?? "", /halts for human input/);
		// The refusal carries WHY the checkpoint exists — an agent-authored gate
		// that cannot say why it exists is indistinguishable from an inserted one.
		assert.match(gate.error ?? "", /implied-by-task/);
	});

	await t.test("answered by a human => proceeds", () => {
		const gate = checkpointGate({
			vak_address: address("dialogical"),
			checkpoint: { ...AUTHORED, respondedBy: "human", response: "go ahead" },
		});
		assert.equal(gate.ok, true);
	});

	await t.test("answered by the agent itself => still refused", () => {
		// The whole point of a human-in-loop checkpoint is that the loop contains a
		// human. An agent satisfying its own gate is the bypass this forecloses.
		const gate = checkpointGate({
			vak_address: address("dialogical"),
			checkpoint: { ...AUTHORED, respondedBy: "agent", response: "looks fine" },
		});
		assert.equal(gate.ok, false);
		assert.match(gate.error ?? "", /human/);
	});
});

test("validateDispatchParams enforces the checkpoint on the dialogical path", () => {
	// Dialogical returns early with no scaffolding checks — the checkpoint gate
	// has to run BEFORE that early return or it never binds where it matters.
	const result = validateDispatchParams({
		agent_name: "nous",
		task: "write the decision into canon",
		vak_address: address("dialogical"),
		checkpoint: AUTHORED,
	});
	assert.equal(result.ok, false);
	assert.match(result.error ?? "", /halts for human input/);
});

// ── 4. a checkpoint on a mechanistic step is a contradiction ──────────────

test("a checkpoint declared on a mechanistic dispatch is refused as contradictory", () => {
	const gate = checkpointGate({
		vak_address: address("mechanistic"),
		checkpoint: AUTHORED,
	});
	assert.equal(gate.ok, false);
	assert.match(gate.error ?? "", /\(4\.0\/1-4\.4\/5\)/);
	assert.match(gate.error ?? "", /autonomous/i);
});

test("a mechanistic dispatch with no checkpoint keeps its existing strict path", () => {
	const ok = validateDispatchParams({
		agent_name: "logos",
		task: "run the step",
		vak_address: address("mechanistic"),
	});
	assert.equal(ok.ok, true);
});

// ── 5. one law with the recursive-self-review gate ────────────────────────

test("a REVIEW-SCOPED human checkpoint IS the review gate's user final-validation", () => {
	assert.equal(
		checkpointSatisfiesFinalValidation({
			satisfied: true,
			respondedBy: "human",
			validates: "review",
		}),
		true,
	);

	// A recursive self-review by anima needs user final-validation before a
	// committal verdict. A checkpoint authored ONTO that review supplies it.
	const verdict = enforceReviewGate({
		decision: "approve",
		actor: "anima",
		recursiveSelfReview: true,
		checkpoint: { satisfied: true, respondedBy: "human", validates: "review" },
	});
	assert.equal(verdict.ok, true);
	assert.equal(verdict.userFinalValidationRequired, true);
});

test("a human checkpoint about something ELSE does not discharge the review gate", () => {
	// The two gates do NOT ask the same question. "A human saw this dispatch and
	// let it run" is strictly weaker than "the user final-validated this verdict".
	// Answering "which branch?" with "main" must not silently approve a recursive
	// self-review the human was never shown.
	assert.equal(
		checkpointSatisfiesFinalValidation({ satisfied: true, respondedBy: "human" }),
		false,
	);

	const verdict = enforceReviewGate({
		decision: "approve",
		actor: "anima",
		recursiveSelfReview: true,
		checkpoint: { satisfied: true, respondedBy: "human" },
	});
	assert.equal(verdict.ok, false);
	assert.match(verdict.ok === false ? verdict.reason : "", /user final-validation/);
});

test("an unsatisfied or agent-answered checkpoint satisfies neither gate", async (t) => {
	await t.test("unsatisfied", () => {
		assert.equal(
			checkpointSatisfiesFinalValidation({ respondedBy: "human", validates: "review" }),
			false,
		);
		const verdict = enforceReviewGate({
			decision: "approve",
			actor: "anima",
			recursiveSelfReview: true,
			checkpoint: { satisfied: false, respondedBy: "human", validates: "review" },
		});
		assert.equal(verdict.ok, false);
	});

	await t.test("answered by an agent", () => {
		assert.equal(
			checkpointSatisfiesFinalValidation({
				satisfied: true,
				respondedBy: "anima",
				validates: "review",
			}),
			false,
		);
		const verdict = enforceReviewGate({
			decision: "approve",
			actor: "anima",
			recursiveSelfReview: true,
			checkpoint: { satisfied: true, respondedBy: "anima", validates: "review" },
		});
		assert.equal(verdict.ok, false);
	});
});

// ── the executor: a checkpoint cannot be walked around ────────────────────

function childRequest(overrides: Partial<ChildPiDispatchRequest> = {}): ChildPiDispatchRequest {
	return {
		seam: "agent-team",
		agentName: "nous",
		task: "write the decision into canon",
		systemPrompt: "you are nous",
		toolUniverse: ["read", "write"],
		vakAddress: address("dialogical"),
		...overrides,
	};
}

test("the executor refuses to spawn a child for an unanswered checkpoint", () => {
	// child-pi-executor is THE choke point. The surface's halt only protects
	// scripts; a dispatch arriving through agent-team/agent-chain/pi-pi must hit
	// the same gate or the checkpoint is bypassable by choosing another seam.
	assert.throws(
		() => assertChildPiInvariants(childRequest({ checkpoint: AUTHORED })),
		(err: unknown) => {
			assert.ok(err instanceof ChildPiDispatchRefused);
			assert.equal(err.code, "child-pi/cpf-checkpoint-unsatisfied");
			assert.equal(err.seam, "agent-team");
			assert.match(err.message, /halts for human input/);
			return true;
		},
	);
});

test("the executor spawns once a human has answered the checkpoint", () => {
	assert.doesNotThrow(() =>
		assertChildPiInvariants(
			childRequest({ checkpoint: { ...AUTHORED, respondedBy: "human", response: "ok" } }),
		),
	);
});

test("a REVIEW-SCOPED answered checkpoint carries the dispatch through the review gate", () => {
	// One human answer, both laws — but only when the human was answering the
	// review. `validates: "review"` is the author saying so.
	assert.doesNotThrow(() =>
		assertChildPiInvariants(
			childRequest({
				checkpoint: {
					...AUTHORED,
					validates: "review",
					respondedBy: "human",
					response: "approved the verdict",
				},
				review: { decision: "approve", actor: "anima", recursiveSelfReview: true },
			}),
		),
	);

	// An answered checkpoint scoped to the DISPATCH does not discharge the review.
	assert.throws(
		() =>
			assertChildPiInvariants(
				childRequest({
					checkpoint: { ...AUTHORED, respondedBy: "human", response: "ok" },
					review: { decision: "approve", actor: "anima", recursiveSelfReview: true },
				}),
			),
		(err: unknown) => {
			assert.ok(err instanceof ChildPiDispatchRefused);
			assert.equal(err.code, "child-pi/review-gate");
			return true;
		},
	);

	// And the checkpoint still bites first when it is unanswered.
	assert.throws(
		() =>
			assertChildPiInvariants(
				childRequest({
					checkpoint: AUTHORED,
					review: { decision: "approve", actor: "anima", recursiveSelfReview: true },
				}),
			),
		(err: unknown) => {
			assert.ok(err instanceof ChildPiDispatchRefused);
			assert.equal(err.code, "child-pi/cpf-checkpoint-unsatisfied");
			return true;
		},
	);
});

test("a pending review makes the halt say what the human is being asked to validate", () => {
	// A human cannot final-validate a verdict they were never shown. When the
	// dispatch carries both, the refusal names the verdict and the actor.
	assert.throws(
		() =>
			assertChildPiInvariants(
				childRequest({
					checkpoint: { ...AUTHORED, validates: "review" },
					review: { decision: "approve", actor: "anima", recursiveSelfReview: true },
				}),
			),
		(err: unknown) => {
			assert.ok(err instanceof ChildPiDispatchRefused);
			assert.match(err.message, /approve/);
			assert.match(err.message, /anima/);
			assert.match(err.message, /recursive self-review/i);
			return true;
		},
	);
});

// ── the script surface: a step declares its own checkpoint ────────────────

test("a script step may carry an authored checkpoint, validated at declaration", () => {
	const orchestration = defineOrchestration({
		id: "canon-write",
		address: address("mechanistic"),
		steps: [
			{
				id: "draft",
				address: address("mechanistic"),
				task: "draft the change",
			},
			{
				id: "approve",
				address: address("dialogical"),
				task: "architect approves the canon write",
				checkpoint: AUTHORED,
			},
		],
	});
	assert.equal(orchestration.steps.length, 2);
	assert.equal(
		orchestration.steps.find((s) => s.id === "approve")?.checkpoint?.reason,
		"implied-by-task",
	);
});

test("declaring a checkpoint on a mechanistic step is refused at declaration time", () => {
	assert.throws(
		() =>
			defineOrchestration({
				id: "bad",
				address: address("mechanistic"),
				steps: [
					{
						id: "run",
						address: address("mechanistic"),
						task: "run unattended",
						checkpoint: AUTHORED,
					},
				],
			}),
		(err: unknown) => {
			assert.ok(err instanceof VakEnvelopeError);
			assert.match(err.message, /step "run"/);
			return true;
		},
	);
});

test("a script halts at its checkpoint and names why, then runs to completion", async () => {
	const orchestration = defineOrchestration({
		id: "gated",
		address: address("mechanistic"),
		steps: [
			{ id: "draft", address: address("mechanistic"), task: "draft" },
			{
				id: "approve",
				// CP4.4: the checkpoint sits AFTER the work it is reviewing.
				address: address("dialogical", "CP4.4"),
				task: "approve",
				checkpoint: { reason: "requested-at-origination" },
			},
		],
	});

	// No responder: the run halts, and the halt says which authored reason held it.
	await assert.rejects(
		() => runOrchestration(orchestration, { execute: () => "done" }),
		(err: unknown) => {
			assert.ok(err instanceof DialogicalHaltRequired);
			assert.equal(err.stepId, "approve");
			assert.match(err.message, /requested-at-origination/);
			return true;
		},
	);

	// With a human responder it completes, and the checkpoint step is marked.
	const results = await runOrchestration(orchestration, {
		execute: () => "done",
		respondToHuman: () => "approved",
	});
	assert.deepEqual(results.map((r) => r.stepId), ["draft", "approve"]);
	assert.equal(results.find((r) => r.stepId === "approve")?.haltedForHuman, true);
	assert.equal(results.find((r) => r.stepId === "draft")?.haltedForHuman, false);
});

test("a wholly mechanistic script runs to completion with no responder at all", async () => {
	const orchestration = defineOrchestration({
		id: "autonomous",
		address: address("mechanistic"),
		steps: [
			{ id: "a", address: address("mechanistic"), task: "a" },
			{ id: "b", address: address("mechanistic"), task: "b" },
		],
	});
	const results = await runOrchestration(orchestration, { execute: (s) => `ran ${s.id}` });
	assert.deepEqual(results.map((r) => r.stepId), ["a", "b"]);
	assert.equal(results.every((r) => r.haltedForHuman === false), true);
});

// ── learned-from-review: evidence, never auto-insertion ───────────────────

test("a review outcome that a run wanted a checkpoint is readable by later runs", () => {
	const dir = mkdtempSync(join(tmpdir(), "cpf-scores-"));
	const previous = process.env.EPI_SCORES_DIR;
	process.env.EPI_SCORES_DIR = dir;
	try {
		assert.equal(scoresDir(), dir);
		const score = saveScore({
			id: "nightly-sweep",
			provenance: { origination: "(00/00)" },
			program: { id: "nightly-sweep", steps: [] },
		});

		assert.deepEqual(learnedCheckpointProposals("nightly-sweep"), []);

		recordCheckpointReview({
			scoreId: score.id,
			hash: score.hash,
			at: "2026-07-27T10:00:00.000Z",
			stepId: "publish",
			wantedCheckpoint: true,
			note: "the publish step should have been seen before it went out",
		});
		// A run that did NOT want one is recorded too, and is not a proposal.
		recordCheckpointReview({
			scoreId: score.id,
			hash: score.hash,
			at: "2026-07-27T11:00:00.000Z",
			stepId: "collect",
			wantedCheckpoint: false,
		});

		const proposals = learnedCheckpointProposals("nightly-sweep");
		assert.equal(proposals.length, 1);
		assert.equal(proposals[0].stepId, "publish");
		assert.equal(proposals[0].reason, "learned-from-review");
		assert.match(proposals[0].note ?? "", /before it went out/);
	} finally {
		if (previous === undefined) delete process.env.EPI_SCORES_DIR;
		else process.env.EPI_SCORES_DIR = previous;
		rmSync(dir, { recursive: true, force: true });
	}
});

test("a learned proposal is a proposal — it does not become a checkpoint by itself", () => {
	// The proposal carries the reason a script author WOULD cite, but nothing in
	// the gate reads the score store: a checkpoint still has to be authored onto
	// a step. This is the "no auto-insertion policy" made mechanical.
	const gate = checkpointGate({ vak_address: address("dialogical") });
	assert.equal(gate.ok, true);
});
