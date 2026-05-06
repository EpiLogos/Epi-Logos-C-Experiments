export type ModelCatalogEntry = {
  id: string;
  label: string;
  provider: 'anthropic' | 'openai' | 'z-ai';
  notes?: string;
};

// Curated model catalog for OmniPanel model routing.
// IDs are kept as provider-native values used in config payloads.
export const MODEL_CATALOG: ModelCatalogEntry[] = [
  {
    id: 'claude-opus-4-6',
    label: 'Claude Opus 4.6',
    provider: 'anthropic',
  },
  {
    id: 'claude-opus-4-20250514',
    label: 'Claude Opus 4',
    provider: 'anthropic',
  },
  {
    id: 'gpt-5.3-codex',
    label: 'GPT-5.3-Codex',
    provider: 'openai',
  },
  {
    id: 'gpt-5.1-codex',
    label: 'GPT-5.1-Codex',
    provider: 'openai',
  },
  {
    id: 'gpt-5-codex',
    label: 'GPT-5-Codex',
    provider: 'openai',
  },
  {
    id: 'glm-5',
    label: 'GLM-5',
    provider: 'z-ai',
    notes: 'Flagship GLM-5 listing in Z.AI developer docs.',
  },
  {
    id: 'glm-4.7',
    label: 'GLM-4.7',
    provider: 'z-ai',
  },
];

export function sortModelCatalog(items: ModelCatalogEntry[] = MODEL_CATALOG): ModelCatalogEntry[] {
  return [...items].sort((a, b) => a.label.localeCompare(b.label));
}
