export type RiskLevel = 'low' | 'medium' | 'high';
export type ExecutionMode = 'deterministic' | 'llm-led';

export interface ExecutionPolicyInput {
  capability: string;
  risk: RiskLevel;
  exploratory: boolean;
}

export function selectExecutionMode(input: ExecutionPolicyInput): ExecutionMode {
  if (input.risk === 'high') {
    return 'deterministic';
  }

  if (input.exploratory) {
    return 'llm-led';
  }

  if (input.capability.startsWith('nara.agent.')) {
    return 'llm-led';
  }

  return 'deterministic';
}
