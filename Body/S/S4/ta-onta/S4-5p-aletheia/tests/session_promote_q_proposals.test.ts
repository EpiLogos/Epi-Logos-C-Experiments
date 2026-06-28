import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { buildQProposalGraphitiEpisode } from "../modules/q-proposal-candidate.ts";
import {
  applyAeonGraduationToForm,
  buildAeonGraduationRecord,
  type AeonGraduationInput,
} from "../modules/aeon-graduation.ts";

const WITNESS_VAK = {
  cpf: "(4.0/1-4.4/5)" as const,
  ct: ["CT5"] as const,
  cp: "CP4.5" as const,
  cf: "(5/0)" as const,
  cfp: "CFP3" as const,
  cs: { code: "CS0" as const, direction: "Night'" as const },
};

describe("aletheia_session_promote q_proposals", () => {
  it("session_promote carries qm_witness into a Graphiti candidate episode", () => {
    const episode = buildQProposalGraphitiEpisode({
      proposal: {
        target_coordinate: "S3",
        q_key: "q_5_integration_template",
        q_value_candidate: "Like a lock finding its river, S3 gathers crossings into one governed current.",
        qm_witness_session: "agent:q-proposal:main",
        qm_witness_vak: WITNESS_VAK,
        qm_witness_agent: "sophia",
        rationale: "The session exposed integration as governed convergence rather than generic mediation.",
        opens_questions: ["Which S3 crossings still lack a governed return path?"],
        source_artifacts: ["/vault/session/now.md"],
      },
      sessionId: "agent:q-proposal:main",
      dayId: "22-05-2026",
      proposedAt: "2026-06-18T12:00:00.000Z",
    });

    assert.equal(episode.candidate_state, "candidate");
    assert.equal(episode.q_key, "q_5_integration_template");
    assert.equal(episode.qm_witness_session, "agent:q-proposal:main");
    assert.deepEqual(episode.qm_witness_vak, WITNESS_VAK);
    assert.equal(episode.qm_witness_agent, "sophia");
    assert.equal(episode.qm_proposed_at, "2026-06-18T12:00:00.000Z");
    assert.equal(episode.group_id, "q-proposal:S3");
    assert.match(episode.content, /CANDIDATE q_proposal/);
  });

  it("refuses q_proposal promotion without opening questions", () => {
    assert.throws(() => buildQProposalGraphitiEpisode({
      proposal: {
        target_coordinate: "S3",
        q_key: "q_5_integration_template",
        q_value_candidate: "Like a lock finding its river, S3 gathers crossings into one governed current.",
        qm_witness_session: "agent:q-proposal:main",
        qm_witness_vak: WITNESS_VAK,
        qm_witness_agent: "sophia",
        rationale: "The session exposed integration as governed convergence rather than generic mediation.",
        opens_questions: [],
        source_artifacts: ["/vault/session/now.md"],
      },
      sessionId: "agent:q-proposal:main",
      dayId: "22-05-2026",
      proposedAt: "2026-06-18T12:00:00.000Z",
    }), /opens_questions|q_proposal/i);
  });
});

const AEON_TEMPLATE = `---
coordinate: "C1"
c_4_artifact_role: "aeon-template"
c_1_ct_type: "CT4b"
c_3_ctx_frame: "4.0/1-4.4/5"
c_0_source_coordinates:
  - "[[CT4b]]"
---

# [[Aeon]]

## #5 Integration - Syzygy Return

AEON_RETURN: [P5' insight] | [P0' questions]
`;

function graduation(overrides: Partial<AeonGraduationInput> = {}): AeonGraduationInput {
  return {
    aeon_id: "assess-improve",
    aeon_name: "Assess And Improve",
    z_thread_id: "z-thread-1",
    transcript_ref: "~/.epi/gate/transcripts/z-thread-1.jsonl",
    vak_address: WITNESS_VAK,
    vak_args: { coordinate: "S4'", intensity: "normal" },
    cfp_composition: ["compose", "perform", "verify", "rehear", "recompose"],
    rubric: {
      checks: ["real verification", "no placeholder evidence"],
      pass_threshold: 0.9,
    },
    eval_history: [
      {
        eval_id: "eval-1",
        transcript_ref: "~/.epi/gate/transcripts/z-thread-1.jsonl",
        score: 0.93,
        summary: "Verified against real tests.",
      },
    ],
    p5_insight: "The loop stabilises when verification evidence leads the summary.",
    p0_questions: ["Which proof signal should open the next pass?"],
    graduation_consent: {
      cpf: "(00/00)",
      granted: true,
      evidence_ref: "user:approve-graduation",
    },
    improvement_proposal: {
      q_key: "q_aeon_rubric_assess_improve",
      rationale: "The rubric should privilege real verification evidence.",
      opens_questions: ["Which weak evidence classes should be refused?"],
      source_artifacts: ["~/.epi/gate/transcripts/z-thread-1.jsonl"],
    },
    ...overrides,
  };
}

describe("Z-thread to Aeon graduation", () => {
  it("renders a proven Z-thread as a named Aeon block with rubric and eval history", () => {
    const record = buildAeonGraduationRecord(graduation(), "2026-06-28T10:00:00.000Z");
    const updated = applyAeonGraduationToForm(AEON_TEMPLATE, record);

    assert.match(updated, /## Graduation Accrual - Assess And Improve/);
    assert.match(updated, /aeon_id: `assess-improve`/);
    assert.match(updated, /q_aeon_rubric_assess_improve/);
    assert.match(updated, /eval-1/);
    assert.match(updated, /AEON_RETURN: \[The loop stabilises/);
  });

  it("reuses the existing Aeon form and appends a second run with new VAK args", () => {
    const first = applyAeonGraduationToForm(
      AEON_TEMPLATE,
      buildAeonGraduationRecord(graduation(), "2026-06-28T10:00:00.000Z"),
    );
    const second = applyAeonGraduationToForm(
      first,
      buildAeonGraduationRecord(
        graduation({
          z_thread_id: "z-thread-2",
          transcript_ref: "~/.epi/gate/transcripts/z-thread-2.jsonl",
          vak_args: { coordinate: "S4'", intensity: "high" },
          eval_history: [
            {
              eval_id: "eval-2",
              transcript_ref: "~/.epi/gate/transcripts/z-thread-2.jsonl",
              score: 0.96,
              summary: "Second run reused the same Aeon shape.",
            },
          ],
          p5_insight: "Second run confirms the form carries changed VAK arguments.",
        }),
        "2026-06-28T11:00:00.000Z",
      ),
    );

    const state = JSON.parse(
      second.match(/<!-- aeon-graduation-state:start\n([\s\S]*?)\n\s*aeon-graduation-state:end -->/)?.[1] ?? "{}",
    );
    assert.equal(state.version, 2);
    assert.equal(state.run_history.length, 2);
    assert.equal(state.eval_history.length, 2);
    assert.deepEqual(state.run_history[1].vak_args, { coordinate: "S4'", intensity: "high" });
  });

  it("updates the current rubric through an improvement proposal without dropping prior evals", () => {
    const first = applyAeonGraduationToForm(
      AEON_TEMPLATE,
      buildAeonGraduationRecord(graduation(), "2026-06-28T10:00:00.000Z"),
    );
    const improved = applyAeonGraduationToForm(
      first,
      buildAeonGraduationRecord(
        graduation({
          rubric: {
            checks: ["real verification", "no placeholder evidence", "rubric drift noted"],
            pass_threshold: 0.95,
          },
          eval_history: [],
          improvement_proposal: {
            q_key: "q_aeon_rubric_assess_improve",
            rationale: "Aletheia improvement-propose tightened the pass threshold after eval drift.",
            opens_questions: ["When should a stable Aeon relax the threshold again?"],
            source_artifacts: ["~/.epi/gate/transcripts/z-thread-1.jsonl"],
          },
        }),
        "2026-06-28T12:00:00.000Z",
      ),
    );

    const state = JSON.parse(
      improved.match(/<!-- aeon-graduation-state:start\n([\s\S]*?)\n\s*aeon-graduation-state:end -->/)?.[1] ?? "{}",
    );
    assert.equal(state.rubric.pass_threshold, 0.95);
    assert.equal(state.eval_history.length, 1);
    assert.match(improved, /rubric drift noted/);
  });

  it("refuses graduation without dialogical CPF consent", () => {
    assert.throws(
      () => buildAeonGraduationRecord(graduation({
        graduation_consent: {
          cpf: "(4.0/1-4.4/5)",
          granted: true,
          evidence_ref: "autonomous:not-allowed",
        },
      })),
      /CPF \(00\/00\).*consent/,
    );
  });
});
