import type { QProposal } from "../../S4-4p-anima/modules/sophia-hook.ts";
import { assertPromotionOpens } from "../../S4-4p-anima/modules/sophia-synthesis.ts";

export interface QProposalGraphitiEpisode {
  content: string;
  ql_position: string;
  cpf: string;
  cp: string;
  source: "agent";
  day_id?: string;
  group_id: string;
  candidate_state: "candidate";
  target_coordinate: string;
  q_key: string;
  q_value_candidate: string;
  qm_witness_session: string;
  qm_witness_vak: QProposal["qm_witness_vak"];
  qm_witness_agent: string;
  qm_proposed_at: string;
  opens_questions: string[];
  source_artifacts: string[];
}

export function buildQProposalGraphitiEpisode(input: {
  proposal: QProposal;
  sessionId: string;
  dayId?: string;
  proposedAt: string;
  groupId?: string;
}): QProposalGraphitiEpisode {
  const opened = assertPromotionOpens({
    label: "aletheia_session_promote q_proposal",
    opens_questions: input.proposal.opens_questions,
  });
  if (!opened.ok) {
    throw new Error(opened.error);
  }

  const group_id = input.groupId ?? `q-proposal:${input.proposal.target_coordinate}`;
  return {
    content: [
      `CANDIDATE q_proposal ${input.proposal.q_key} for ${input.proposal.target_coordinate}`,
      "",
      input.proposal.q_value_candidate,
      "",
      `Rationale: ${input.proposal.rationale}`,
      "",
      "Opens questions:",
      ...input.proposal.opens_questions.map((question) => `- ${question}`),
      "",
      "Source artifacts:",
      ...input.proposal.source_artifacts.map((artifact) => `- ${artifact}`),
    ].join("\n"),
    ql_position: "5",
    cpf: input.proposal.qm_witness_vak.cpf,
    cp: input.proposal.qm_witness_vak.cp.replace(/^CP/, ""),
    source: "agent",
    day_id: input.dayId,
    group_id,
    candidate_state: "candidate",
    target_coordinate: input.proposal.target_coordinate,
    q_key: input.proposal.q_key,
    q_value_candidate: input.proposal.q_value_candidate,
    qm_witness_session: input.proposal.qm_witness_session || input.sessionId,
    qm_witness_vak: input.proposal.qm_witness_vak,
    qm_witness_agent: input.proposal.qm_witness_agent,
    qm_proposed_at: input.proposedAt,
    opens_questions: input.proposal.opens_questions,
    source_artifacts: input.proposal.source_artifacts,
  };
}
