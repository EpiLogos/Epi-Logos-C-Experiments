import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { buildQProposalGraphitiEpisode } from "../modules/q-proposal-candidate.ts";

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
