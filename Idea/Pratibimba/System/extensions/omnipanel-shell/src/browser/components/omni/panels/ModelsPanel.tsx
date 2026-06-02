import { useMemo, useState } from 'react';
import type { ConnectionState } from '../../../stores/epiClawGatewayStore';
import type { ConfigState } from '../../../controllers/epi-claw/controllers';

type ModelsPanelProps = {
  connectionState: ConnectionState;
  config: ConfigState;
  onLoad: () => void;
  onSave: () => void | Promise<void>;
  onApply: () => void | Promise<void>;
  onSetRaw: (value: string) => void;
};

type ParsedConfig = Record<string, unknown>;

const PRIMARY_PATH = 'agents.defaults.model.primary';
const FALLBACKS_PATH = 'agents.defaults.model.fallbacks';
const MODELS_PATH = 'agents.defaults.models';

function parseConfig(raw: string): ParsedConfig | null {
  try {
    const parsed = JSON.parse(raw) as ParsedConfig;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function getByPath(source: ParsedConfig, path: string): unknown {
  return path.split('.').reduce<unknown>((cursor, segment) => {
    if (!cursor || typeof cursor !== 'object') return undefined;
    return (cursor as Record<string, unknown>)[segment];
  }, source);
}

function setByPath(source: ParsedConfig, path: string, value: unknown): ParsedConfig {
  const clone =
    typeof structuredClone === 'function'
      ? structuredClone(source)
      : (JSON.parse(JSON.stringify(source)) as ParsedConfig);
  const parts = path.split('.');
  let cursor: Record<string, unknown> = clone;
  for (let index = 0; index < parts.length - 1; index += 1) {
    const segment = parts[index];
    const next = cursor[segment];
    if (!next || typeof next !== 'object' || Array.isArray(next)) {
      cursor[segment] = {};
    }
    cursor = cursor[segment] as Record<string, unknown>;
  }
  cursor[parts[parts.length - 1]] = value;
  return clone;
}

function removeByPath(source: ParsedConfig, path: string): ParsedConfig {
  const clone =
    typeof structuredClone === 'function'
      ? structuredClone(source)
      : (JSON.parse(JSON.stringify(source)) as ParsedConfig);
  const parts = path.split('.');
  let cursor: Record<string, unknown> = clone;
  for (let index = 0; index < parts.length - 1; index += 1) {
    const segment = parts[index];
    const next = cursor[segment];
    if (!next || typeof next !== 'object' || Array.isArray(next)) {
      return clone;
    }
    cursor = next as Record<string, unknown>;
  }
  delete cursor[parts[parts.length - 1]];
  return clone;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function toRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

function uniq(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out;
}

export function ModelsPanel({ connectionState, config, onLoad, onSave, onApply, onSetRaw }: ModelsPanelProps) {
  const [primaryManual, setPrimaryManual] = useState('');
  const [newModelKey, setNewModelKey] = useState('');
  const [fallbackCandidate, setFallbackCandidate] = useState('');
  const [newFallback, setNewFallback] = useState('');

  const parsedConfig = useMemo(() => parseConfig(config.configRaw), [config.configRaw]);
  const selectedPrimary = useMemo(
    () => (parsedConfig ? String(getByPath(parsedConfig, PRIMARY_PATH) ?? '').trim() : ''),
    [parsedConfig],
  );
  const selectedFallbacks = useMemo(
    () => (parsedConfig ? uniq(toStringArray(getByPath(parsedConfig, FALLBACKS_PATH))) : []),
    [parsedConfig],
  );
  const configuredModelsMap = useMemo(
    () => (parsedConfig ? toRecord(getByPath(parsedConfig, MODELS_PATH)) : {}),
    [parsedConfig],
  );
  const configuredModelKeys = useMemo(
    () =>
      Object.keys(configuredModelsMap)
        .map((key) => key.trim())
        .filter((key) => key.length > 0)
        .sort((a, b) => a.localeCompare(b)),
    [configuredModelsMap],
  );
  const selectableModelKeys = useMemo(
    () => uniq([...configuredModelKeys, selectedPrimary, ...selectedFallbacks]).sort((a, b) => a.localeCompare(b)),
    [configuredModelKeys, selectedFallbacks, selectedPrimary],
  );
  const fallbackOptions = useMemo(
    () =>
      configuredModelKeys.filter(
        (key) => key !== selectedPrimary && !selectedFallbacks.includes(key),
      ),
    [configuredModelKeys, selectedFallbacks, selectedPrimary],
  );

  const updateConfig = (updater: (configObj: ParsedConfig) => ParsedConfig) => {
    if (!parsedConfig) return;
    const next = updater(parsedConfig);
    onSetRaw(`${JSON.stringify(next, null, 2)}\n`);
  };

  const ensureConfiguredModel = (cfg: ParsedConfig, modelKey: string): ParsedConfig => {
    const key = modelKey.trim();
    if (!key) return cfg;
    const map = toRecord(getByPath(cfg, MODELS_PATH));
    if (map[key] !== undefined) return cfg;
    return setByPath(cfg, MODELS_PATH, { ...map, [key]: {} });
  };

  const normalizeFallbacks = (fallbacks: string[], primary: string): string[] =>
    uniq(fallbacks.filter((value) => value !== primary));

  const setPrimaryModel = (modelKey: string) => {
    const primary = modelKey.trim();
    updateConfig((cfg) => {
      let next = primary ? ensureConfiguredModel(cfg, primary) : cfg;
      next = setByPath(next, PRIMARY_PATH, primary);
      const existingFallbacks = uniq(toStringArray(getByPath(next, FALLBACKS_PATH)));
      const normalizedFallbacks = normalizeFallbacks(existingFallbacks, primary);
      return setByPath(next, FALLBACKS_PATH, normalizedFallbacks);
    });
  };

  const setPrimaryModelAndCommit = async (modelKey: string) => {
    setPrimaryModel(modelKey);
    if (connectionState !== 'connected' || config.configSaving) {
      return;
    }
    await onSave();
    await onApply();
  };

  const addConfiguredModel = () => {
    const key = newModelKey.trim();
    if (!key) return;
    updateConfig((cfg) => ensureConfiguredModel(cfg, key));
    setNewModelKey('');
  };

  const removeConfiguredModel = (modelKey: string) => {
    updateConfig((cfg) => {
      const map = { ...toRecord(getByPath(cfg, MODELS_PATH)) };
      if (!(modelKey in map)) return cfg;
      delete map[modelKey];

      let next = cfg;
      next = Object.keys(map).length > 0 ? setByPath(next, MODELS_PATH, map) : removeByPath(next, MODELS_PATH);

      const currentPrimary = String(getByPath(next, PRIMARY_PATH) ?? '').trim();
      if (currentPrimary === modelKey) {
        next = removeByPath(next, PRIMARY_PATH);
      }

      const existingFallbacks = uniq(toStringArray(getByPath(next, FALLBACKS_PATH)));
      const normalizedFallbacks = existingFallbacks.filter((item) => item !== modelKey);
      return setByPath(next, FALLBACKS_PATH, normalizedFallbacks);
    });
  };

  const addFallbackModel = (modelKey: string) => {
    const key = modelKey.trim();
    if (!key) return;
    updateConfig((cfg) => {
      let next = ensureConfiguredModel(cfg, key);
      const primary = String(getByPath(next, PRIMARY_PATH) ?? '').trim();
      const existingFallbacks = uniq(toStringArray(getByPath(next, FALLBACKS_PATH)));
      const normalized = normalizeFallbacks([...existingFallbacks, key], primary);
      next = setByPath(next, FALLBACKS_PATH, normalized);
      return next;
    });
  };

  const addFallback = () => {
    addFallbackModel(newFallback);
    setNewFallback('');
  };

  const removeFallback = (modelKey: string) => {
    updateConfig((cfg) => {
      const existing = uniq(toStringArray(getByPath(cfg, FALLBACKS_PATH)));
      return setByPath(cfg, FALLBACKS_PATH, existing.filter((item) => item !== modelKey));
    });
  };

  const moveFallback = (index: number, direction: -1 | 1) => {
    if (index < 0 || index >= selectedFallbacks.length) return;
    const target = index + direction;
    if (target < 0 || target >= selectedFallbacks.length) return;
    const next = [...selectedFallbacks];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    updateConfig((cfg) => setByPath(cfg, FALLBACKS_PATH, next));
  };

  const configActionButtonClass = (action: 'save' | 'apply') => {
    const isLatest = config.configLastAction === action;
    const status = isLatest ? config.configLastActionStatus : null;
    if (status === 'success') {
      return 'border-emerald-400/60 shadow-[0_0_0_1px_rgba(52,211,153,0.25)] text-emerald-100';
    }
    if (status === 'error') {
      return 'border-red-400/60 shadow-[0_0_0_1px_rgba(248,113,113,0.25)] text-red-100';
    }
    return 'border-[var(--border-subtle)]';
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Models</h3>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-xs rounded border border-[var(--border-subtle)]" onClick={onLoad} disabled={config.configLoading}>
            Reload Config
          </button>
          <button className={`px-3 py-1.5 text-xs rounded border ${configActionButtonClass('save')}`} onClick={onSave} disabled={config.configSaving || connectionState !== 'connected'}>
            Save
          </button>
          <button className={`px-3 py-1.5 text-xs rounded border ${configActionButtonClass('apply')}`} onClick={onApply} disabled={config.configSaving || connectionState !== 'connected'}>
            Apply
          </button>
        </div>
      </div>

      <div className="text-xs text-[var(--text-tertiary)]">
        Directly edits Epi-Claw model routing: <code>{PRIMARY_PATH}</code>, <code>{FALLBACKS_PATH}</code>, and <code>{MODELS_PATH}</code>.
      </div>

      {!parsedConfig ? (
        <div className="text-xs text-red-300">Config JSON is invalid. Fix raw config first.</div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-4">
          <div className="space-y-3 rounded border border-[var(--border-subtle)] bg-transparent p-3">
            <label className="space-y-1 block">
              <span className="text-xs text-[var(--text-tertiary)]">Primary model ({PRIMARY_PATH})</span>
              <select
                value={selectedPrimary}
                onChange={(e) => {
                  void setPrimaryModelAndCommit(e.target.value);
                }}
                className="w-full px-3 py-2 text-xs bg-transparent border border-[var(--border-subtle)] rounded"
              >
                <option value="">(unset)</option>
                {selectableModelKeys.map((modelKey) => (
                  <option key={modelKey} value={modelKey}>
                    {modelKey}
                  </option>
                ))}
              </select>
            </label>

            <div className="space-y-1">
              <span className="text-xs text-[var(--text-tertiary)]">Set primary manually</span>
              <div className="flex gap-2">
                <input
                  value={primaryManual}
                  onChange={(e) => setPrimaryManual(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-transparent border border-[var(--border-subtle)] rounded"
                  placeholder="provider/model or model key"
                />
                <button
                  className="px-3 py-1.5 text-xs rounded border border-[var(--border-subtle)]"
                  onClick={() => {
                    const key = primaryManual.trim();
                    if (!key) return;
                    void setPrimaryModelAndCommit(key);
                    setPrimaryManual('');
                  }}
                  type="button"
                >
                  Set Primary
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-[var(--text-tertiary)]">Fallback models ({FALLBACKS_PATH})</div>
              <div className="flex gap-2">
                <select
                  value={fallbackCandidate}
                  onChange={(e) => setFallbackCandidate(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-transparent border border-[var(--border-subtle)] rounded"
                >
                  <option value="">Select configured model</option>
                  {fallbackOptions.map((modelKey) => (
                    <option key={modelKey} value={modelKey}>
                      {modelKey}
                    </option>
                  ))}
                </select>
                <button
                  className="px-3 py-1.5 text-xs rounded border border-[var(--border-subtle)]"
                  onClick={() => {
                    addFallbackModel(fallbackCandidate);
                    setFallbackCandidate('');
                  }}
                  type="button"
                >
                  Add Selected
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  value={newFallback}
                  onChange={(e) => setNewFallback(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-transparent border border-[var(--border-subtle)] rounded"
                  placeholder="Add fallback manually"
                />
                <button className="px-3 py-1.5 text-xs rounded border border-[var(--border-subtle)]" onClick={addFallback} type="button">
                  Add
                </button>
              </div>
              <div className="space-y-1">
                {selectedFallbacks.length === 0 ? (
                  <div className="text-xs text-[var(--text-tertiary)]">(none)</div>
                ) : (
                  selectedFallbacks.map((fallback, index) => {
                    const upDisabled = index === 0;
                    const downDisabled = index === selectedFallbacks.length - 1;
                    return (
                      <div key={fallback} className="flex items-center justify-between gap-2 rounded border border-[var(--border-subtle)] px-2 py-1">
                        <span className="text-xs">{fallback}</span>
                        <div className="flex gap-1">
                          <button
                            className="text-[10px] px-2 py-0.5 rounded border border-[var(--border-subtle)] disabled:opacity-50"
                            onClick={() => moveFallback(index, -1)}
                            type="button"
                            disabled={upDisabled}
                          >
                            Up
                          </button>
                          <button
                            className="text-[10px] px-2 py-0.5 rounded border border-[var(--border-subtle)] disabled:opacity-50"
                            onClick={() => moveFallback(index, 1)}
                            type="button"
                            disabled={downDisabled}
                          >
                            Down
                          </button>
                          <button className="text-[10px] px-2 py-0.5 rounded border border-[var(--border-subtle)]" onClick={() => removeFallback(fallback)} type="button">
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2 rounded border border-[var(--border-subtle)] bg-transparent p-3">
            <div className="text-xs font-semibold">Configured Models ({MODELS_PATH})</div>
            <div className="flex gap-2">
              <input
                value={newModelKey}
                onChange={(e) => setNewModelKey(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-transparent border border-[var(--border-subtle)] rounded"
                placeholder="Add model key (e.g. claude-opus-4-6)"
              />
              <button
                className="px-3 py-1.5 text-xs rounded border border-[var(--border-subtle)]"
                onClick={addConfiguredModel}
                type="button"
              >
                Add
              </button>
            </div>
            <div className="space-y-1 max-h-[420px] overflow-auto custom-scrollbar pr-1">
              {configuredModelKeys.length === 0 ? (
                <div className="text-xs text-[var(--text-tertiary)]">(none)</div>
              ) : (
                configuredModelKeys.map((modelKey) => {
                  const entry = toRecord(configuredModelsMap[modelKey]);
                  const alias = typeof entry.alias === 'string' ? entry.alias : '';
                  return (
                    <div key={modelKey} className="rounded border border-[var(--border-subtle)] px-2 py-1 space-y-1">
                      <div className="text-xs font-medium">{modelKey}</div>
                      {alias ? <div className="text-[10px] text-[var(--text-tertiary)]">alias: {alias}</div> : null}
                      <div className="flex gap-1">
                        <button
                          className="text-[10px] px-2 py-0.5 rounded border border-[var(--border-subtle)]"
                          onClick={() => {
                            void setPrimaryModelAndCommit(modelKey);
                          }}
                          type="button"
                        >
                          Set Primary
                        </button>
                        <button
                          className="text-[10px] px-2 py-0.5 rounded border border-[var(--border-subtle)]"
                          onClick={() => addFallbackModel(modelKey)}
                          type="button"
                        >
                          Add Fallback
                        </button>
                        <button
                          className="text-[10px] px-2 py-0.5 rounded border border-[var(--border-subtle)]"
                          onClick={() => removeConfiguredModel(modelKey)}
                          type="button"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="text-[10px] text-[var(--text-tertiary)]">
              Source of truth is your configured model set. This panel keeps primary/fallbacks aligned when entries are removed.
            </div>
          </div>
        </div>
      )}

      {config.lastError && <div className="text-xs text-red-300">{config.lastError}</div>}
      {config.configLastAction && config.configLastActionStatus ? (
        <div className={`text-xs ${config.configLastActionStatus === 'success' ? 'text-emerald-200' : 'text-red-200'}`}>
          {config.configLastAction} {config.configLastActionStatus}
        </div>
      ) : null}
      <div className="text-xs text-[var(--text-tertiary)]">
        state: {connectionState} · valid: {String(config.configValid)} · issues: {config.configIssues.length}
      </div>
    </div>
  );
}
