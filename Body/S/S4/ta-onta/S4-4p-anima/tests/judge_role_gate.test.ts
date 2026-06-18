import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import {
  JUDGE_ROLE_MATRIX,
  MAX_VERIFY_CYCLES,
  buildJudgeQuestion,
  evaluateVerifyGate,
  resolveJudgeRole,
  type TaskClass,
} from "../modules/judge-role.ts";

const EXPECTED_TASK_CLASSES: TaskClass[] = [
  "code",
  "design_semantic",
  "invariant_canonical_coherence",
  "multi_agent_aggregation",
  "pattern_structural",
  "gap_completeness",
  "temporal_kairos",
  "cross_domain_translation",
  "knowledge_graph_distillation",
  "process_cadence",
];

describe("judge role dispatch", () => {
  it("enumerates every 12.35 task class with primary and secondary judges", () => {
    assert.deepEqual(
      Object.keys(JUDGE_ROLE_MATRIX).sort(),
      [...EXPECTED_TASK_CLASSES].sort(),
    );

    for (const taskClass of EXPECTED_TASK_CLASSES) {
      const role = resolveJudgeRole({ task_class: taskClass });
      assert.equal(role.task_class, taskClass);
      assert.ok(role.primary_judge.agent.length > 0);
      assert.ok(role.secondary_judge.agent.length > 0);
      assert.notEqual(role.primary_judge.agent, role.secondary_judge.agent);
      assert.match(role.primary_judge.symbolic_coordinate, /CPF=.*;CT=.*;CF=.*;judge=/);
    }
  });

  it("covers all constitutional roles, all Aletheia guardians, and Anuttara Verifier", () => {
    const judgeAgents = new Set(
      Object.values(JUDGE_ROLE_MATRIX).flatMap((entry) => [
        entry.primary_judge.agent,
        entry.secondary_judge.agent,
      ]),
    );
    const constitutionalRoles = new Set(
      Object.values(JUDGE_ROLE_MATRIX).flatMap((entry) => entry.constitutional_roles),
    );

    for (const agent of ["Nous", "Logos", "Eros", "Mythos", "Psyche", "Sophia"]) {
      assert.ok(constitutionalRoles.has(agent), `${agent} should appear in judge matrix`);
    }
    for (const guardian of ["Anansi", "Moirai", "Janus", "Mercurius", "Agora", "Zeithoven"]) {
      assert.ok(judgeAgents.has(guardian), `${guardian} should appear in judge matrix`);
    }
    assert.ok(judgeAgents.has("Anuttara Verifier"));
  });

  it("selects a different judge model when slots provide one", () => {
    const role = resolveJudgeRole({
      task_class: "code",
      builder_model: "codex-builder",
      slots: {
        Eros: ["codex-builder", "claude-judge"],
      },
    });

    assert.equal(role.primary_judge.agent, "Eros");
    assert.equal(role.primary_judge.model_slot, "claude-judge");
  });
});

describe("verify phase adversarial gate", () => {
  it("asks structured symbolic-coordinate questions instead of pass/fail booleans", () => {
    const judge = resolveJudgeRole({ task_class: "code" }).primary_judge;
    const question = buildJudgeQuestion({
      judge,
      cycle: 1,
      goal_condition: "cargo test -p epi-portal-core passes",
      evidence_ref: "terminal:cargo-test",
    });

    assert.equal(question.kind, "structured-question");
    assert.equal(question.cycle, 1);
    assert.equal(question.symbolic_coordinate, judge.symbolic_coordinate);
    assert.match(question.question, /What evidence demonstrates/);
    assert.ok(!("passed" in question));
    assert.ok(!("failed" in question));
  });

  it("requires at least one judge clearance before the run can be marked done", () => {
    const pending = evaluateVerifyGate({
      verify_cycles: 1,
      evidence: [
        {
          judge: resolveJudgeRole({ task_class: "code" }).primary_judge,
          questions: [],
          clearance: "questions",
        },
      ],
    });

    assert.equal(pending.transition, "revise");

    const cleared = evaluateVerifyGate({
      verify_cycles: 1,
      evidence: [
        {
          judge: resolveJudgeRole({ task_class: "code" }).primary_judge,
          questions: [],
          clearance: "cleared",
        },
      ],
    });

    assert.equal(cleared.transition, "rehear");
  });

  it("escalates to a human after the third uncleared verify cycle", () => {
    const result = evaluateVerifyGate({
      verify_cycles: MAX_VERIFY_CYCLES,
      evidence: [
        {
          judge: resolveJudgeRole({ task_class: "design_semantic" }).primary_judge,
          questions: [],
          clearance: "questions",
        },
      ],
    });

    assert.equal(result.transition, "human_escalation");
    assert.match(result.reason, /3 verify cycles/i);
  });
});
