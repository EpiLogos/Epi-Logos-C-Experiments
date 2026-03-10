import { useMemo } from 'react';
import type { SkillsState } from '../../../controllers/epi-claw/controllers';

type SkillsPanelProps = {
  skills: SkillsState;
  filter: string;
  onRefresh: () => void;
  onFilterChange: (value: string) => void;
  onToggle: (skillKey: string, enabled: boolean) => void;
  onSetEdit: (skillKey: string, value: string) => void;
  onSaveKey: (skillKey: string) => void;
  onInstall: (skillKey: string, name: string, installId: string) => void;
};

export function SkillsPanel({
  skills,
  filter,
  onRefresh,
  onFilterChange,
  onToggle,
  onSetEdit,
  onSaveKey,
  onInstall,
}: SkillsPanelProps) {
  const entries = useMemo(() => skills.skillsReport?.skills ?? [], [skills.skillsReport]);

  const filteredEntries = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return entries;
    return entries.filter((skill) =>
      [skill.name, skill.description, skill.source, skill.skillKey]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [entries, filter]);

  const enabledCount = entries.filter((skill) => !skill.disabled).length;
  const disabledCount = entries.length - enabledCount;

  const renderChip = (label: string, tone: 'ok' | 'warn' | 'muted' = 'muted') => {
    const toneClass =
      tone === 'ok'
        ? 'border-green-500/40 text-green-300'
        : tone === 'warn'
          ? 'border-amber-500/40 text-amber-200'
          : 'border-[var(--border-subtle)] text-[var(--text-tertiary)]';
    return <span className={`px-1.5 py-0.5 rounded border text-[10px] ${toneClass}`}>{label}</span>;
  };

  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Skills</h3>
        <button className="px-3 py-1.5 text-xs rounded border border-[var(--border-subtle)]" onClick={onRefresh} disabled={skills.skillsLoading}>Refresh</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 items-end">
        <label className="space-y-1">
          <div className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)]">Filter</div>
          <input
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            placeholder="Search skills"
            className="w-full px-2 py-1.5 text-xs bg-black/30 border border-[var(--border-subtle)] rounded"
          />
        </label>
        <div className="text-[10px] text-[var(--text-tertiary)]">
          shown: {filteredEntries.length} · enabled: {enabledCount} · disabled: {disabledCount}
        </div>
      </div>
      {skills.skillsError && <div className="text-xs text-red-300">{skills.skillsError}</div>}
      <div className="space-y-2">
        {filteredEntries.length === 0 && <div className="text-xs text-[var(--text-tertiary)] italic">No skills found.</div>}
        {filteredEntries.map((skill) => {
          const busy = skills.skillsBusyKey === skill.skillKey;
          const canInstall = (skill.install?.length ?? 0) > 0 && (skill.missing?.bins?.length ?? 0) > 0;
          const reasonBits: string[] = [];
          if (skill.disabled) reasonBits.push('disabled');
          if (skill.blockedByAllowlist) reasonBits.push('blocked by allowlist');

          return (
          <div key={skill.skillKey} className="p-3 rounded border border-[var(--border-subtle)] bg-white/5 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-xs font-semibold">{skill.name}</div>
                <div className="text-[10px] text-[var(--text-tertiary)]">{skill.skillKey} · {skill.description}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {renderChip(skill.source)}
                  {renderChip(`Status: ${skill.disabled ? 'Disabled' : 'Enabled'}`, skill.disabled ? 'warn' : 'ok')}
                  {renderChip(skill.eligible ? 'eligible' : 'blocked', skill.eligible ? 'ok' : 'warn')}
                  {skill.blockedByAllowlist ? renderChip('blocked by allowlist', 'warn') : null}
                </div>
              </div>
              <button
                className="text-[10px] px-2 py-1 rounded border border-[var(--border-subtle)]"
                onClick={() => onToggle(skill.skillKey, skill.disabled)}
                disabled={busy}
              >
                {skill.disabled ? 'Enable' : 'Disable'}
              </button>
            </div>

            {skill.missing && (
              <div className="text-[10px] text-[var(--text-tertiary)]">
                Missing:{' '}
                {[
                  ...(skill.missing.bins ?? []).map((item) => `bin:${item}`),
                  ...(skill.missing.env ?? []).map((item) => `env:${item}`),
                  ...(skill.missing.config ?? []).map((item) => `config:${item}`),
                  ...(skill.missing.os ?? []).map((item) => `os:${item}`),
                ].join(', ') || 'none'}
              </div>
            )}

            {reasonBits.length > 0 ? (
              <div className="text-[10px] text-[var(--text-tertiary)]">Reason: {reasonBits.join(', ')}</div>
            ) : null}

            {skill.primaryEnv ? (
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="password"
                  value={skills.skillEdits[skill.skillKey] ?? ''}
                  onChange={(e) => onSetEdit(skill.skillKey, e.target.value)}
                  className="col-span-2 px-2 py-1 text-[10px] bg-black/30 border border-[var(--border-subtle)] rounded"
                  placeholder={`API key (${skill.primaryEnv})`}
                />
                <button
                  className="text-[10px] px-2 py-1 rounded border border-[var(--border-subtle)]"
                  onClick={() => onSaveKey(skill.skillKey)}
                  disabled={busy}
                >
                  Save key
                </button>
              </div>
            ) : null}

            {canInstall && (
              <div className="flex flex-wrap gap-1">
                {(skill.install ?? []).map((opt) => (
                  <button
                    key={opt.id}
                    className="text-[10px] px-2 py-1 rounded border border-[var(--border-subtle)]"
                    onClick={() => onInstall(skill.skillKey, skill.name, opt.id)}
                    disabled={busy}
                  >
                    {busy ? 'Installing…' : opt.label}
                  </button>
                ))}
              </div>
            )}

            {skills.skillMessages[skill.skillKey] && (
              <div
                className={`text-[10px] ${
                  skills.skillMessages[skill.skillKey]?.kind === 'error' ? 'text-red-300' : 'text-green-300'
                }`}
              >
                {skills.skillMessages[skill.skillKey]?.message}
              </div>
            )}
          </div>
        )})}
      </div>
    </div>
  );
}
