// Coordinate Header
// Coordinate: S4-5' / Aletheia Aeon graduation
// Residency: Body/S/S4/ta-onta/S4-5p-aletheia/modules
// Position (#n): #5 truth-disclosure / Mobius return
// Actualises: [[S4-5'-SPEC]] crystallisation seam for [[Aeon]] CT4b forms
// Public surface: buildAeonGraduationRecord, applyAeonGraduationToForm
// Does NOT own: Anima dispatch, Chronos scheduling, or Hen graph promotion
// Contract: ../CONTRACT.md

import type { VakAddress, CpfPolarity } from "../../shared/vak_address.ts";

export interface AeonGraduationConsent {
  readonly cpf: CpfPolarity;
  readonly granted: boolean;
  readonly evidence_ref: string;
}

export interface AeonEvalEntry {
  readonly eval_id: string;
  readonly transcript_ref: string;
  readonly score?: number;
  readonly summary: string;
}

export interface AeonImprovementProposalInput {
  readonly q_key: string;
  readonly rationale: string;
  readonly opens_questions: string[];
  readonly source_artifacts: string[];
}

export interface AeonGraduationInput {
  readonly aeon_id: string;
  readonly aeon_name: string;
  readonly z_thread_id: string;
  readonly transcript_ref: string;
  readonly vak_address: VakAddress;
  readonly vak_args?: Record<string, unknown>;
  readonly cfp_composition: string[];
  readonly rubric: Record<string, unknown>;
  readonly eval_history: AeonEvalEntry[];
  readonly p5_insight: string;
  readonly p0_questions: string[];
  readonly graduation_consent: AeonGraduationConsent;
  readonly improvement_proposal: AeonImprovementProposalInput;
}

export interface AeonImprovementProposal {
  readonly target_coordinate: "C1";
  readonly q_key: string;
  readonly q_value_candidate: string;
  readonly qm_witness_session: string;
  readonly qm_witness_vak: VakAddress;
  readonly qm_witness_agent: "sophia";
  readonly rationale: string;
  readonly opens_questions: string[];
  readonly source_artifacts: string[];
}

export interface AeonRunHistoryEntry {
  readonly z_thread_id: string;
  readonly transcript_ref: string;
  readonly graduated_at: string;
  readonly vak_address: VakAddress;
  readonly vak_args: Record<string, unknown>;
  readonly p5_insight: string;
  readonly p0_questions: string[];
}

export interface AeonGraduationState {
  readonly aeon_id: string;
  readonly aeon_name: string;
  readonly version: number;
  readonly cfp_composition: string[];
  readonly rubric: Record<string, unknown>;
  readonly eval_history: AeonEvalEntry[];
  readonly run_history: AeonRunHistoryEntry[];
  readonly improvement_proposal: AeonImprovementProposal;
  readonly graduation_consent: AeonGraduationConsent;
}

export interface AeonGraduationRecord {
  readonly state: AeonGraduationState;
}

export function buildAeonGraduationRecord(
  input: AeonGraduationInput,
  graduatedAt = new Date().toISOString(),
): AeonGraduationRecord {
  assertDialogicalConsent(input.graduation_consent);
  assertNonEmpty(input.aeon_id, "aeon_id");
  assertNonEmpty(input.aeon_name, "aeon_name");
  assertNonEmpty(input.z_thread_id, "z_thread_id");
  assertNonEmpty(input.transcript_ref, "transcript_ref");
  assertNonEmpty(input.p5_insight, "p5_insight");
  if (input.p0_questions.length === 0) {
    throw new Error("Aeon graduation requires at least one P0' reopening question");
  }
  if (input.cfp_composition.length === 0) {
    throw new Error("Aeon graduation requires the loop CFP composition");
  }
  if (input.improvement_proposal.opens_questions.length === 0) {
    throw new Error("Aeon graduation improvement proposal requires opens_questions");
  }

  const improvementProposal: AeonImprovementProposal = {
    target_coordinate: "C1",
    q_key: input.improvement_proposal.q_key,
    q_value_candidate: JSON.stringify(input.rubric),
    qm_witness_session: input.z_thread_id,
    qm_witness_vak: input.vak_address,
    qm_witness_agent: "sophia",
    rationale: input.improvement_proposal.rationale,
    opens_questions: input.improvement_proposal.opens_questions,
    source_artifacts: uniqueStrings([
      input.transcript_ref,
      ...input.improvement_proposal.source_artifacts,
    ]),
  };

  return {
    state: {
      aeon_id: input.aeon_id,
      aeon_name: input.aeon_name,
      version: 1,
      cfp_composition: [...input.cfp_composition],
      rubric: input.rubric,
      eval_history: dedupeEvalHistory(input.eval_history),
      run_history: [{
        z_thread_id: input.z_thread_id,
        transcript_ref: input.transcript_ref,
        graduated_at: graduatedAt,
        vak_address: input.vak_address,
        vak_args: input.vak_args ?? {},
        p5_insight: input.p5_insight,
        p0_questions: [...input.p0_questions],
      }],
      improvement_proposal: improvementProposal,
      graduation_consent: input.graduation_consent,
    },
  };
}

export function applyAeonGraduationToForm(formText: string, record: AeonGraduationRecord): string {
  const existing = readExistingState(formText, record.state.aeon_id);
  const state = existing ? mergeGraduationStates(existing, record.state) : record.state;
  const rendered = renderGraduationBlock(state);
  const marker = blockPattern(state.aeon_id);
  if (marker.test(formText)) {
    return formText.replace(marker, rendered);
  }
  const trimmed = formText.endsWith("\n") ? formText.trimEnd() : formText;
  return `${trimmed}\n\n${rendered}\n`;
}

function mergeGraduationStates(
  existing: AeonGraduationState,
  incoming: AeonGraduationState,
): AeonGraduationState {
  return {
    ...incoming,
    version: existing.version + 1,
    eval_history: dedupeEvalHistory([...existing.eval_history, ...incoming.eval_history]),
    run_history: [...existing.run_history, ...incoming.run_history],
  };
}

function renderGraduationBlock(state: AeonGraduationState): string {
  const latestRun = state.run_history[state.run_history.length - 1];
  const p0Questions = latestRun.p0_questions.join("; ");
  const p5Insight = latestRun.p5_insight;
  return [
    `<!-- aeon-graduation:start:${state.aeon_id} -->`,
    `## Graduation Accrual - ${state.aeon_name}`,
    "",
    `- aeon_id: \`${state.aeon_id}\``,
    `- version: \`${state.version}\``,
    `- source_z_thread: \`${latestRun.z_thread_id}\``,
    `- transcript_ref: \`${latestRun.transcript_ref}\``,
    `- consent_gate: \`${state.graduation_consent.evidence_ref}\``,
    "",
    "### CFP Composition",
    "",
    renderJson(state.cfp_composition),
    "",
    "### Current Rubric",
    "",
    renderJson(state.rubric),
    "",
    "### Eval History",
    "",
    renderJson(state.eval_history),
    "",
    "### Run History",
    "",
    renderJson(state.run_history),
    "",
    "### Aletheia Improvement Proposal",
    "",
    renderJson(state.improvement_proposal),
    "",
    `AEON_RETURN: [${p5Insight}] | [${p0Questions}]`,
    "",
    "<!-- aeon-graduation-state:start",
    JSON.stringify(state, null, 2),
    "aeon-graduation-state:end -->",
    `<!-- aeon-graduation:end:${state.aeon_id} -->`,
  ].join("\n");
}

function renderJson(value: unknown): string {
  return ["```json", JSON.stringify(value, null, 2), "```"].join("\n");
}

function readExistingState(formText: string, aeonId: string): AeonGraduationState | null {
  const block = formText.match(blockPattern(aeonId))?.[0];
  if (!block) return null;
  const rawState = block.match(/<!-- aeon-graduation-state:start\n([\s\S]*?)\naeon-graduation-state:end -->/)?.[1];
  if (!rawState) return null;
  try {
    return JSON.parse(rawState) as AeonGraduationState;
  } catch {
    return null;
  }
}

function blockPattern(aeonId: string): RegExp {
  const escaped = aeonId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`<!-- aeon-graduation:start:${escaped} -->[\\s\\S]*?<!-- aeon-graduation:end:${escaped} -->`);
}

function assertDialogicalConsent(consent: AeonGraduationConsent) {
  if (consent.cpf !== "(00/00)" || !consent.granted || !consent.evidence_ref.trim()) {
    throw new Error("Aeon graduation requires granted CPF (00/00) dialogical consent");
  }
}

function assertNonEmpty(value: string, field: string) {
  if (!value.trim()) {
    throw new Error(`Aeon graduation ${field} is required`);
  }
}

function dedupeEvalHistory(entries: readonly AeonEvalEntry[]): AeonEvalEntry[] {
  const byId = new Map<string, AeonEvalEntry>();
  for (const entry of entries) {
    byId.set(entry.eval_id, entry);
  }
  return [...byId.values()];
}

function uniqueStrings(values: readonly string[]): string[] {
  return [...new Set(values.filter((value) => value.trim().length > 0))];
}
