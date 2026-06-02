import { useEffect, useMemo } from 'react';
import type { ConnectionState } from '../../../stores/epiClawGatewayStore';
import type { ConfigState } from '../../../controllers/epi-claw/controllers';
import { shortJson } from './panelUtils';
import {
  collectEntries,
  computeConfigDiff,
  parseConfigRaw,
  resolveActiveSection,
  resolveSections,
  resolveSubsections,
  setValueAtPath,
  type ConfigPanelMode,
} from '../../../domain/configPanelDomain';

type ConfigPanelProps = {
  connectionState: ConnectionState;
  config: ConfigState;
  mode: ConfigPanelMode;
  searchQuery: string;
  activeSection: string | null;
  activeSubsection: string | null;
  onLoad: () => void;
  onSchema: () => void;
  onSave: () => void;
  onApply: () => void;
  onUpdate: () => void;
  onSetApplySessionKey: (value: string) => void;
  onSetRaw: (value: string) => void;
  onSetMode: (mode: ConfigPanelMode) => void;
  onSetSearchQuery: (query: string) => void;
  onSetActiveSection: (section: string | null) => void;
  onSetActiveSubsection: (subsection: string | null) => void;
};

export function ConfigPanel({
  connectionState,
  config,
  mode,
  searchQuery,
  activeSection,
  activeSubsection,
  onLoad,
  onSchema,
  onSave,
  onApply,
  onUpdate,
  onSetApplySessionKey,
  onSetRaw,
  onSetMode,
  onSetSearchQuery,
  onSetActiveSection,
  onSetActiveSubsection,
}: ConfigPanelProps) {
  const configActionButtonClass = (action: 'save' | 'apply' | 'update') => {
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

  const parsedConfig = useMemo(() => parseConfigRaw(config.configRaw), [config.configRaw]);

  const sections = useMemo(
    () =>
      resolveSections({
        parsedConfig,
        schema: config.configSchema,
        uiHints: config.configUiHints,
      }),
    [config.configSchema, config.configUiHints, parsedConfig],
  );

  useEffect(() => {
    const next = resolveActiveSection(activeSection, sections);
    if (next !== activeSection) {
      onSetActiveSection(next);
      onSetActiveSubsection(null);
      return;
    }
    if (mode !== 'form') {
      return;
    }
    const subsections = resolveSubsections(parsedConfig, config.configSchema, config.configUiHints, activeSection);
    if (subsections.length === 0) {
      if (activeSubsection !== null) onSetActiveSubsection(null);
      return;
    }
    if (activeSubsection && !subsections.some((subsection) => subsection.key === activeSubsection)) {
      onSetActiveSubsection(subsections[0]?.key ?? null);
    }
  }, [
    activeSection,
    activeSubsection,
    config.configSchema,
    config.configUiHints,
    mode,
    onSetActiveSection,
    onSetActiveSubsection,
    parsedConfig,
    sections,
  ]);

  const subsections = useMemo(
    () => (mode === 'form' ? resolveSubsections(parsedConfig, config.configSchema, config.configUiHints, activeSection) : []),
    [activeSection, config.configSchema, config.configUiHints, mode, parsedConfig],
  );

  const entries = useMemo(
    () =>
      collectEntries({
        parsedConfig,
        schema: config.configSchema,
        uiHints: config.configUiHints,
        activeSection,
        activeSubsection: mode === 'form' ? activeSubsection : null,
        searchQuery,
      }),
    [activeSection, activeSubsection, config.configSchema, config.configUiHints, mode, parsedConfig, searchQuery],
  );

  const parsedOriginalConfig = useMemo(() => parseConfigRaw(config.configRawOriginal), [config.configRawOriginal]);
  const diff = useMemo(
    () => (mode === 'form' ? computeConfigDiff(parsedOriginalConfig ?? {}, parsedConfig ?? {}) : []),
    [mode, parsedConfig, parsedOriginalConfig],
  );
  const hasRawChanges = mode === 'raw' && config.configRaw !== config.configRawOriginal;
  const hasChanges = mode === 'form' ? diff.length > 0 : hasRawChanges;
  const canSaveForm = Boolean(parsedConfig) && Boolean(config.configSchema) && !config.configLoading;
  const canSave = connectionState === 'connected' && !config.configSaving && hasChanges && (mode === 'raw' ? true : canSaveForm);
  const canApply = connectionState === 'connected' && !config.configSaving && hasChanges && (mode === 'raw' ? true : canSaveForm);
  const canUpdate = connectionState === 'connected' && !config.configSaving;

  const setValueByPath = (path: string | Array<string | number>, value: unknown) => {
    if (!parsedConfig) return;
    const next = setValueAtPath(parsedConfig, path, value);
    onSetRaw(`${JSON.stringify(next, null, 2)}\n`);
  };

  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Config</h3>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-xs rounded border border-[var(--border-subtle)]" onClick={onLoad} disabled={config.configLoading}>Load</button>
          <button className="px-3 py-1.5 text-xs rounded border border-[var(--border-subtle)]" onClick={onSchema}>Schema</button>
          <button className={`px-3 py-1.5 text-xs rounded border ${configActionButtonClass('save')}`} onClick={onSave} disabled={!canSave}>Save</button>
          <button className={`px-3 py-1.5 text-xs rounded border ${configActionButtonClass('apply')}`} onClick={onApply} disabled={!canApply}>Apply</button>
          <button className={`px-3 py-1.5 text-xs rounded border ${configActionButtonClass('update')}`} onClick={onUpdate} disabled={!canUpdate}>Update</button>
        </div>
      </div>
      {config.lastError && <div className="text-xs text-red-300">{config.lastError}</div>}
      <div className="text-xs text-[var(--text-tertiary)]">valid: {String(config.configValid)} · schema: {config.configSchemaVersion ?? 'n/a'} · issues: {config.configIssues.length}</div>
      <div className="text-xs text-[var(--text-tertiary)]">
        {hasChanges ? (mode === 'raw' ? 'Unsaved changes' : `${diff.length} unsaved change${diff.length === 1 ? '' : 's'}`) : 'No changes'}
      </div>
      {config.configLastAction && config.configLastActionStatus ? (
        <div className={`text-xs ${config.configLastActionStatus === 'success' ? 'text-emerald-200' : 'text-red-200'}`}>
          {config.configLastAction} {config.configLastActionStatus}
        </div>
      ) : null}
      <div className="flex items-center gap-2">
        <button
          className={`px-3 py-1.5 text-xs rounded border ${mode === 'form' ? 'border-[var(--color-m5)]/50 text-[var(--text-primary)]' : 'border-[var(--border-subtle)]'}`}
          onClick={() => onSetMode('form')}
          disabled={config.configSchema == null}
          type="button"
        >
          Form
        </button>
        <button
          className={`px-3 py-1.5 text-xs rounded border ${mode === 'raw' ? 'border-[var(--color-m5)]/50 text-[var(--text-primary)]' : 'border-[var(--border-subtle)]'}`}
          onClick={() => onSetMode('raw')}
          type="button"
        >
          Raw
        </button>
      </div>
      <label className="text-xs text-[var(--text-tertiary)] space-y-1 block">
        <span>Apply/Update Session Key</span>
        <input
          value={config.applySessionKey}
          onChange={(e) => onSetApplySessionKey(e.target.value)}
          className="w-full px-3 py-2 text-xs bg-transparent border border-[var(--border-subtle)] rounded"
          placeholder="main"
        />
      </label>
      {mode === 'raw' ? (
        <textarea
          value={config.configRaw}
          onChange={(e) => onSetRaw(e.target.value)}
          rows={18}
          className="w-full px-3 py-2 text-xs font-mono bg-transparent border border-[var(--border-subtle)] rounded resize-y"
        />
      ) : (
        <div className="grid grid-cols-[200px_1fr] gap-3 min-h-[420px]">
          <div className="space-y-2">
            <input
              value={searchQuery}
              onChange={(e) => onSetSearchQuery(e.target.value)}
              placeholder="Search config keys..."
              className="w-full px-2.5 py-1.5 text-xs bg-transparent border border-[var(--border-subtle)] rounded"
            />
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  onSetActiveSection(null);
                  onSetActiveSubsection(null);
                }}
                className={`w-full text-left px-2 py-1.5 text-xs rounded border ${activeSection === null ? 'border-[var(--color-m5)]/50 text-[var(--text-primary)]' : 'border-[var(--border-subtle)]'}`}
              >
                <div>All Settings</div>
              </button>
              {sections.map((section) => (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => {
                    onSetActiveSection(section.key);
                    onSetActiveSubsection(null);
                  }}
                  className={`w-full text-left px-2 py-1.5 text-xs rounded border ${activeSection === section.key ? 'border-[var(--color-m5)]/50 text-[var(--text-primary)]' : 'border-[var(--border-subtle)]'}`}
                >
                  <div>{section.label}</div>
                  {section.description ? <div className="text-[10px] text-[var(--text-tertiary)]">{section.description}</div> : null}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded border border-[var(--border-subtle)] p-3 space-y-2 overflow-auto">
            {subsections.length > 0 && (
              <div className="flex flex-wrap gap-1 pb-1">
                {subsections.map((subsection) => (
                  <button
                    key={subsection.key}
                    type="button"
                    onClick={() => onSetActiveSubsection(subsection.key)}
                    className={`px-2 py-1 text-[10px] rounded border ${activeSubsection === subsection.key ? 'border-[var(--color-m5)]/50 text-[var(--text-primary)]' : 'border-[var(--border-subtle)]'}`}
                  >
                    {subsection.label}
                  </button>
                ))}
              </div>
            )}
            {entries.length === 0 ? (
              <div className="text-xs text-[var(--text-tertiary)]">No editable keys in this section.</div>
            ) : (
              entries.map((entry) => (
                <div key={entry.path} className="space-y-1">
                  <label className="text-[11px] text-[var(--text-tertiary)]" htmlFor={entry.path}>
                    {entry.label}
                    <span className="ml-1 text-[10px] opacity-70">({entry.path})</span>
                  </label>
                  {entry.help ? <div className="text-[10px] text-[var(--text-tertiary)]">{entry.help}</div> : null}
                  <div className="flex flex-wrap gap-1">
                    {entry.advanced ? <span className="px-1.5 py-0.5 rounded border border-amber-500/40 text-[10px] text-amber-200">advanced</span> : null}
                    {entry.sensitive ? <span className="px-1.5 py-0.5 rounded border border-red-500/40 text-[10px] text-red-200">sensitive</span> : null}
                  </div>
                  {entry.kind === 'boolean' ? (
                    <input
                      id={entry.path}
                      type="checkbox"
                      checked={Boolean(entry.value)}
                      onChange={(e) => setValueByPath(entry.segments, e.target.checked)}
                    />
                  ) : entry.enumOptions && entry.enumOptions.length > 0 ? (
                    <select
                      id={entry.path}
                      value={String(Math.max(0, entry.enumOptions.findIndex((option) => Object.is(option, entry.value))))}
                      onChange={(e) => {
                        const index = Number.parseInt(e.target.value, 10);
                        const selected = Number.isNaN(index) ? entry.enumOptions[0] : entry.enumOptions[index];
                        setValueByPath(entry.segments, selected);
                      }}
                      className="w-full px-2 py-1 text-xs bg-transparent border border-[var(--border-subtle)] rounded"
                    >
                      {entry.enumOptions.map((option, index) => (
                        <option key={`${entry.path}-enum-${index}`} value={index}>
                          {String(option)}
                        </option>
                      ))}
                    </select>
                  ) : entry.kind === 'number' ? (
                    <input
                      id={entry.path}
                      type="number"
                      value={typeof entry.value === 'number' ? String(entry.value) : ''}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw.trim() === '') {
                          setValueByPath(entry.segments, undefined);
                          return;
                        }
                        const parsed = Number.parseFloat(raw);
                        setValueByPath(entry.segments, Number.isNaN(parsed) ? raw : parsed);
                      }}
                      className="w-full px-2 py-1 text-xs bg-transparent border border-[var(--border-subtle)] rounded"
                      placeholder={entry.placeholder}
                    />
                  ) : entry.kind === 'string' ? (
                    <input
                      id={entry.path}
                      type={entry.sensitive ? 'password' : 'text'}
                      value={typeof entry.value === 'string' ? entry.value : ''}
                      onChange={(e) => setValueByPath(entry.segments, e.target.value)}
                      className="w-full px-2 py-1 text-xs bg-transparent border border-[var(--border-subtle)] rounded"
                      placeholder={entry.placeholder}
                    />
                  ) : (
                    <textarea
                      id={entry.path}
                      rows={Math.max(3, Math.min(8, JSON.stringify(entry.value ?? '', null, 2).split('\n').length))}
                      defaultValue={shortJson(entry.value)}
                      onBlur={(e) => {
                        const raw = e.target.value.trim();
                        if (!raw) {
                          setValueByPath(entry.segments, undefined);
                          return;
                        }
                        try {
                          setValueByPath(entry.segments, JSON.parse(raw));
                        } catch {
                          e.target.value = shortJson(entry.value);
                        }
                      }}
                      className="w-full px-2 py-1 text-xs font-mono bg-transparent border border-[var(--border-subtle)] rounded resize-y"
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {mode === 'form' && diff.length > 0 && (
        <details className="rounded border border-[var(--border-subtle)] p-3">
          <summary className="text-xs cursor-pointer">View {diff.length} pending change{diff.length === 1 ? '' : 's'}</summary>
          <div className="mt-2 space-y-1 text-[10px]">
            {diff.map((entry) => (
              <div key={entry.path || '__root__'} className="rounded border border-[var(--border-subtle)] p-2">
                <div className="font-semibold">{entry.path || '(root)'}</div>
                <div className="text-[var(--text-tertiary)]">from: {shortJson(entry.from)}</div>
                <div className="text-[var(--text-tertiary)]">to: {shortJson(entry.to)}</div>
              </div>
            ))}
          </div>
        </details>
      )}
      {config.configIssues.length > 0 && (
        <pre className="text-[10px] p-3 rounded border border-[var(--border-subtle)] bg-transparent overflow-x-auto">{shortJson(config.configIssues)}</pre>
      )}
    </div>
  );
}
