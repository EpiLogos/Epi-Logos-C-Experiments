export const MAX_VERIFY_CYCLES = 3;

export type TaskClass =
  | "code"
  | "design_semantic"
  | "invariant_canonical_coherence"
  | "multi_agent_aggregation"
  | "pattern_structural"
  | "gap_completeness"
  | "temporal_kairos"
  | "cross_domain_translation"
  | "knowledge_graph_distillation"
  | "process_cadence";

export type JudgeClearance = "questions" | "cleared";

export interface JudgeProfile {
  agent: string;
  vak_coordinates: string;
  symbolic_coordinate: string;
  model_slot?: string;
}

export interface JudgeRoleMapping {
  task_class: TaskClass;
  primary_judge: JudgeProfile;
  secondary_judge: JudgeProfile;
  constitutional_roles: string[];
  rationale: string;
}

export interface VerifyQuestion {
  kind: "structured-question";
  cycle: number;
  symbolic_coordinate: string;
  question: string;
  evidence_ref?: string;
}

export interface VerifyEvidence {
  judge: JudgeProfile;
  questions: VerifyQuestion[];
  clearance: JudgeClearance;
}

export interface VerifyGateInput {
  verify_cycles: number;
  evidence: VerifyEvidence[];
}

export type VerifyGateTransition = "verify" | "revise" | "rehear" | "human_escalation";

export interface VerifyGateResult {
  transition: VerifyGateTransition;
  reason: string;
}

type SlotConfig = Record<string, string[]>;

function judge(
  agent: string,
  vakCoordinates: string,
  symbolicCoordinate: string,
): JudgeProfile {
  return {
    agent,
    vak_coordinates: vakCoordinates,
    symbolic_coordinate: symbolicCoordinate,
  };
}

function symbolicCoordinate(input: {
  cpf: string;
  ct: string;
  cf: string;
  judge: string;
}): string {
  return `CPF=${input.cpf};CT=${input.ct};CF=${input.cf};judge=${input.judge}`;
}

const MECHANISTIC_CPF = "(4.0/1-4.4/5)";
const DIALOGICAL_CPF = "(00/00)";

export const JUDGE_ROLE_MATRIX: Record<TaskClass, JudgeRoleMapping> = {
  code: {
    task_class: "code",
    primary_judge: judge(
      "Eros",
      "CT2, CF (0/1/2), CPF mechanistic",
      symbolicCoordinate({ cpf: MECHANISTIC_CPF, ct: "CT2", cf: "(0/1/2)", judge: "Eros" }),
    ),
    secondary_judge: judge(
      "Anuttara Verifier",
      "M0' 0', canonical verifier",
      symbolicCoordinate({ cpf: MECHANISTIC_CPF, ct: "CT0", cf: "(0000)", judge: "Anuttara Verifier" }),
    ),
    constitutional_roles: ["Eros", "Logos"],
    rationale: "Deterministic work is judged against real test, compilation, and contract evidence.",
  },
  design_semantic: {
    task_class: "design_semantic",
    primary_judge: judge(
      "Sophia",
      "CT5, CF (5/0), CPF dialogical",
      symbolicCoordinate({ cpf: DIALOGICAL_CPF, ct: "CT5", cf: "(5/0)", judge: "Sophia" }),
    ),
    secondary_judge: judge(
      "Agora",
      "CF4b, multi-channel evidence",
      symbolicCoordinate({ cpf: DIALOGICAL_CPF, ct: "CT4b", cf: "(4.0/1-4.4/5)", judge: "Agora" }),
    ),
    constitutional_roles: ["Sophia"],
    rationale: "Semantic quality is judged by post-execution synthesis and gathered evidence.",
  },
  invariant_canonical_coherence: {
    task_class: "invariant_canonical_coherence",
    primary_judge: judge(
      "Anuttara Verifier",
      "CT0, CF (0000), CPF (00/00)",
      symbolicCoordinate({ cpf: DIALOGICAL_CPF, ct: "CT0", cf: "(0000)", judge: "Anuttara Verifier" }),
    ),
    secondary_judge: judge(
      "Eros",
      "CT2, CF (0/1/2)",
      symbolicCoordinate({ cpf: MECHANISTIC_CPF, ct: "CT2", cf: "(0/1/2)", judge: "Eros" }),
    ),
    constitutional_roles: ["Nous", "Eros"],
    rationale: "Foundational coherence is judged at the verifier layer, then checked operationally.",
  },
  multi_agent_aggregation: {
    task_class: "multi_agent_aggregation",
    primary_judge: judge(
      "Agora",
      "CT4, CF (4.5/0)+(4.0/1-4.4/5)",
      symbolicCoordinate({ cpf: MECHANISTIC_CPF, ct: "CT4b", cf: "(4.5/0)", judge: "Agora" }),
    ),
    secondary_judge: judge(
      "Sophia",
      "CT5, CF (5/0)",
      symbolicCoordinate({ cpf: MECHANISTIC_CPF, ct: "CT5", cf: "(5/0)", judge: "Sophia" }),
    ),
    constitutional_roles: ["Psyche", "Sophia"],
    rationale: "Parallel outputs are merged by Agora and then synthesized by Sophia.",
  },
  pattern_structural: {
    task_class: "pattern_structural",
    primary_judge: judge(
      "Mythos",
      "CT3, CF (0/1/2/3)",
      symbolicCoordinate({ cpf: MECHANISTIC_CPF, ct: "CT3", cf: "(0/1/2/3)", judge: "Mythos" }),
    ),
    secondary_judge: judge(
      "Anansi",
      "CF0, topology gap mapping",
      symbolicCoordinate({ cpf: DIALOGICAL_CPF, ct: "CT0", cf: "(0000)", judge: "Anansi" }),
    ),
    constitutional_roles: ["Mythos"],
    rationale: "Structural recurrence is judged as pattern first, then placed topologically.",
  },
  gap_completeness: {
    task_class: "gap_completeness",
    primary_judge: judge(
      "Anansi",
      "CT0, CF (0000)",
      symbolicCoordinate({ cpf: DIALOGICAL_CPF, ct: "CT0", cf: "(0000)", judge: "Anansi" }),
    ),
    secondary_judge: judge(
      "Anuttara Verifier",
      "M0' 0', missing-coordinate verifier",
      symbolicCoordinate({ cpf: DIALOGICAL_CPF, ct: "CT0", cf: "(0000)", judge: "Anuttara Verifier" }),
    ),
    constitutional_roles: ["Nous"],
    rationale: "Completeness is judged by gap orientation and canonical missing-entry checks.",
  },
  temporal_kairos: {
    task_class: "temporal_kairos",
    primary_judge: judge(
      "Janus",
      "CT4, CF (0/1)",
      symbolicCoordinate({ cpf: MECHANISTIC_CPF, ct: "CT4a", cf: "(0/1)", judge: "Janus" }),
    ),
    secondary_judge: judge(
      "Mercurius",
      "CF3, kairos carrier",
      symbolicCoordinate({ cpf: MECHANISTIC_CPF, ct: "CT3", cf: "(0/1/2/3)", judge: "Mercurius" }),
    ),
    constitutional_roles: ["Psyche", "Logos"],
    rationale: "Temporal thresholds are judged by Janus and carried across families by Mercurius.",
  },
  cross_domain_translation: {
    task_class: "cross_domain_translation",
    primary_judge: judge(
      "Mercurius",
      "CT3, CF (0/1/2/3)",
      symbolicCoordinate({ cpf: MECHANISTIC_CPF, ct: "CT3", cf: "(0/1/2/3)", judge: "Mercurius" }),
    ),
    secondary_judge: judge(
      "Anansi",
      "CF0, coordinate placement",
      symbolicCoordinate({ cpf: DIALOGICAL_CPF, ct: "CT0", cf: "(0000)", judge: "Anansi" }),
    ),
    constitutional_roles: ["Mythos"],
    rationale: "Translation is judged by cross-family transmission and coordinate placement.",
  },
  knowledge_graph_distillation: {
    task_class: "knowledge_graph_distillation",
    primary_judge: judge(
      "Moirai",
      "CT2, CF (0/1/2)",
      symbolicCoordinate({ cpf: MECHANISTIC_CPF, ct: "CT2", cf: "(0/1/2)", judge: "Moirai" }),
    ),
    secondary_judge: judge(
      "Sophia",
      "CT5, CF (5/0)",
      symbolicCoordinate({ cpf: MECHANISTIC_CPF, ct: "CT5", cf: "(5/0)", judge: "Sophia" }),
    ),
    constitutional_roles: ["Eros", "Sophia"],
    rationale: "Distillation is judged by Moirai's sequence and Sophia's synthesis quality.",
  },
  process_cadence: {
    task_class: "process_cadence",
    primary_judge: judge(
      "Zeithoven",
      "CT5, CF (5/0)",
      symbolicCoordinate({ cpf: MECHANISTIC_CPF, ct: "CT5", cf: "(5/0)", judge: "Zeithoven" }),
    ),
    secondary_judge: judge(
      "Janus",
      "CF1, temporal consistency",
      symbolicCoordinate({ cpf: MECHANISTIC_CPF, ct: "CT4a", cf: "(0/1)", judge: "Janus" }),
    ),
    constitutional_roles: ["Sophia"],
    rationale: "Cadence is judged by rhythmic scheduling and temporal consistency.",
  },
};

function chooseJudgeModel(
  agent: string,
  builderModel: string | undefined,
  slots: SlotConfig | undefined,
): string | undefined {
  const candidates = slots?.[agent];
  if (!candidates || candidates.length === 0) return undefined;
  return candidates.find((candidate) => candidate !== builderModel) ?? candidates[0];
}

export function resolveJudgeRole(input: {
  task_class: TaskClass;
  builder_model?: string;
  slots?: SlotConfig;
}): JudgeRoleMapping {
  const mapping = JUDGE_ROLE_MATRIX[input.task_class];
  return {
    ...mapping,
    primary_judge: {
      ...mapping.primary_judge,
      model_slot: chooseJudgeModel(mapping.primary_judge.agent, input.builder_model, input.slots),
    },
    secondary_judge: {
      ...mapping.secondary_judge,
      model_slot: chooseJudgeModel(mapping.secondary_judge.agent, input.builder_model, input.slots),
    },
  };
}

export function buildJudgeQuestion(input: {
  judge: JudgeProfile;
  cycle: number;
  goal_condition: string;
  evidence_ref?: string;
}): VerifyQuestion {
  return {
    kind: "structured-question",
    cycle: input.cycle,
    symbolic_coordinate: input.judge.symbolic_coordinate,
    question: `What evidence demonstrates the actual goal condition: ${input.goal_condition}?`,
    evidence_ref: input.evidence_ref,
  };
}

export function evaluateVerifyGate(input: VerifyGateInput): VerifyGateResult {
  if (input.evidence.some((entry) => entry.clearance === "cleared")) {
    return {
      transition: "rehear",
      reason: "At least one judge cleared the Verify phase; transition to Rehear.",
    };
  }

  if (input.verify_cycles >= MAX_VERIFY_CYCLES) {
    return {
      transition: "human_escalation",
      reason: "No judge clearance after 3 verify cycles; escalate to human.",
    };
  }

  if (input.verify_cycles > 0 || input.evidence.length > 0) {
    return {
      transition: "revise",
      reason: "Judge questions remain open; builder must revise before another Verify cycle.",
    };
  }

  return {
    transition: "verify",
    reason: "No Verify evidence has been recorded; dispatch a judge before completion.",
  };
}
