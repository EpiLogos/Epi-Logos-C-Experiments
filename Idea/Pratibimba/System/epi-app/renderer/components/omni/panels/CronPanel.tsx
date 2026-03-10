import type { CronState } from '../../../controllers/epi-claw/controllers';
import type { CronJob } from '../../../controllers/epi-claw/types';
import { formatTs } from './panelUtils';

type CronPanelProps = {
  cron: CronState;
  cronName: string;
  cronDescription: string;
  cronAgentId: string;
  cronScheduleKind: 'every' | 'at' | 'cron';
  cronEveryAmount: string;
  cronEveryUnit: 'minutes' | 'hours' | 'days';
  cronAtValue: string;
  cronExpr: string;
  cronTz: string;
  cronSessionTarget: 'main' | 'isolated';
  cronWakeMode: 'next-heartbeat' | 'now';
  cronPayloadKind: 'systemEvent' | 'agentTurn';
  cronPayloadText: string;
  cronDeliver: boolean;
  cronChannel: string;
  cronTo: string;
  cronTimeoutSeconds: string;
  cronPostToMainPrefix: string;
  onSetCronName: (v: string) => void;
  onSetCronDescription: (v: string) => void;
  onSetCronAgentId: (v: string) => void;
  onSetCronScheduleKind: (v: 'every' | 'at' | 'cron') => void;
  onSetCronEveryAmount: (v: string) => void;
  onSetCronEveryUnit: (v: 'minutes' | 'hours' | 'days') => void;
  onSetCronAtValue: (v: string) => void;
  onSetCronExpr: (v: string) => void;
  onSetCronTz: (v: string) => void;
  onSetCronSessionTarget: (v: 'main' | 'isolated') => void;
  onSetCronWakeMode: (v: 'next-heartbeat' | 'now') => void;
  onSetCronPayloadKind: (v: 'systemEvent' | 'agentTurn') => void;
  onSetCronPayloadText: (v: string) => void;
  onSetCronDeliver: (v: boolean) => void;
  onSetCronChannel: (v: string) => void;
  onSetCronTo: (v: string) => void;
  onSetCronTimeoutSeconds: (v: string) => void;
  onSetCronPostToMainPrefix: (v: string) => void;
  onRefresh: () => void;
  onAdd: () => void;
  onToggle: (job: CronJob) => void;
  onRun: (job: CronJob) => void;
  onRuns: (job: CronJob) => void;
  onRemove: (job: CronJob) => void;
};

export function CronPanel(props: CronPanelProps) {
  const {
    cron,
    cronName,
    cronDescription,
    cronAgentId,
    cronScheduleKind,
    cronEveryAmount,
    cronEveryUnit,
    cronAtValue,
    cronExpr,
    cronTz,
    cronSessionTarget,
    cronWakeMode,
    cronPayloadKind,
    cronPayloadText,
    cronDeliver,
    cronChannel,
    cronTo,
    cronTimeoutSeconds,
    cronPostToMainPrefix,
    onSetCronName,
    onSetCronDescription,
    onSetCronAgentId,
    onSetCronScheduleKind,
    onSetCronEveryAmount,
    onSetCronEveryUnit,
    onSetCronAtValue,
    onSetCronExpr,
    onSetCronTz,
    onSetCronSessionTarget,
    onSetCronWakeMode,
    onSetCronPayloadKind,
    onSetCronPayloadText,
    onSetCronDeliver,
    onSetCronChannel,
    onSetCronTo,
    onSetCronTimeoutSeconds,
    onSetCronPostToMainPrefix,
    onRefresh,
    onAdd,
    onToggle,
    onRun,
    onRuns,
    onRemove,
  } = props;

  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Cron Jobs</h3>
        <button className="px-3 py-1.5 text-xs rounded border border-[var(--border-subtle)]" onClick={onRefresh} disabled={cron.cronLoading}>Refresh</button>
      </div>
      {cron.cronError && <div className="text-xs text-red-300">{cron.cronError}</div>}
      <div className="text-xs text-[var(--text-tertiary)]">scheduler enabled: {String(cron.cronStatus?.enabled ?? false)} · jobs: {cron.cronStatus?.jobs ?? cron.cronJobs.length}</div>

      <div className="p-3 rounded border border-[var(--border-subtle)] bg-white/5 space-y-2">
        <div className="text-xs font-semibold">Add Job</div>
        <div className="grid grid-cols-2 gap-2">
          <input value={cronName} onChange={(e) => onSetCronName(e.target.value)} className="px-2 py-1 text-xs bg-black/30 border border-[var(--border-subtle)] rounded" placeholder="Name" />
          <input value={cronDescription} onChange={(e) => onSetCronDescription(e.target.value)} className="px-2 py-1 text-xs bg-black/30 border border-[var(--border-subtle)] rounded" placeholder="Description" />
          <input value={cronAgentId} onChange={(e) => onSetCronAgentId(e.target.value)} className="px-2 py-1 text-xs bg-black/30 border border-[var(--border-subtle)] rounded" placeholder="Agent ID (optional)" />
          <select value={cronScheduleKind} onChange={(e) => onSetCronScheduleKind(e.target.value as 'every' | 'at' | 'cron')} className="px-2 py-1 text-xs bg-black/30 border border-[var(--border-subtle)] rounded">
            <option value="every">Schedule: Every</option>
            <option value="at">Schedule: At</option>
            <option value="cron">Schedule: Cron</option>
          </select>
          {cronScheduleKind === 'every' && (
            <>
              <input value={cronEveryAmount} onChange={(e) => onSetCronEveryAmount(e.target.value)} className="px-2 py-1 text-xs bg-black/30 border border-[var(--border-subtle)] rounded" placeholder="Every amount" />
              <select value={cronEveryUnit} onChange={(e) => onSetCronEveryUnit(e.target.value as 'minutes' | 'hours' | 'days')} className="px-2 py-1 text-xs bg-black/30 border border-[var(--border-subtle)] rounded">
                <option value="minutes">minutes</option>
                <option value="hours">hours</option>
                <option value="days">days</option>
              </select>
            </>
          )}
          {cronScheduleKind === 'at' && (
            <input value={cronAtValue} onChange={(e) => onSetCronAtValue(e.target.value)} className="px-2 py-1 text-xs bg-black/30 border border-[var(--border-subtle)] rounded col-span-2" type="datetime-local" />
          )}
          {cronScheduleKind === 'cron' && (
            <>
              <input value={cronExpr} onChange={(e) => onSetCronExpr(e.target.value)} className="px-2 py-1 text-xs bg-black/30 border border-[var(--border-subtle)] rounded" placeholder="Cron expression" />
              <input value={cronTz} onChange={(e) => onSetCronTz(e.target.value)} className="px-2 py-1 text-xs bg-black/30 border border-[var(--border-subtle)] rounded" placeholder="Timezone (optional)" />
            </>
          )}
          <select value={cronSessionTarget} onChange={(e) => onSetCronSessionTarget(e.target.value as 'main' | 'isolated')} className="px-2 py-1 text-xs bg-black/30 border border-[var(--border-subtle)] rounded">
            <option value="main">Session target: main</option>
            <option value="isolated">Session target: isolated</option>
          </select>
          <select value={cronWakeMode} onChange={(e) => onSetCronWakeMode(e.target.value as 'next-heartbeat' | 'now')} className="px-2 py-1 text-xs bg-black/30 border border-[var(--border-subtle)] rounded">
            <option value="next-heartbeat">Wake: next-heartbeat</option>
            <option value="now">Wake: now</option>
          </select>
          <select value={cronPayloadKind} onChange={(e) => onSetCronPayloadKind(e.target.value as 'systemEvent' | 'agentTurn')} className="px-2 py-1 text-xs bg-black/30 border border-[var(--border-subtle)] rounded col-span-2">
            <option value="agentTurn">Payload: agentTurn</option>
            <option value="systemEvent">Payload: systemEvent</option>
          </select>
          <textarea value={cronPayloadText} onChange={(e) => onSetCronPayloadText(e.target.value)} rows={2} className="px-2 py-1 text-xs bg-black/30 border border-[var(--border-subtle)] rounded col-span-2" placeholder={cronPayloadKind === 'agentTurn' ? 'Agent message' : 'System event text'} />
          {cronPayloadKind === 'agentTurn' && (
            <>
              <label className="text-[10px] flex items-center gap-1">
                <input type="checkbox" checked={cronDeliver} onChange={(e) => onSetCronDeliver(e.target.checked)} />
                deliver
              </label>
              <input value={cronChannel} onChange={(e) => onSetCronChannel(e.target.value)} className="px-2 py-1 text-xs bg-black/30 border border-[var(--border-subtle)] rounded" placeholder="Channel (last/telegram/...)" />
              <input value={cronTo} onChange={(e) => onSetCronTo(e.target.value)} className="px-2 py-1 text-xs bg-black/30 border border-[var(--border-subtle)] rounded" placeholder="To (chat id / phone)" />
              <input value={cronTimeoutSeconds} onChange={(e) => onSetCronTimeoutSeconds(e.target.value)} className="px-2 py-1 text-xs bg-black/30 border border-[var(--border-subtle)] rounded" placeholder="Timeout seconds" />
            </>
          )}
          {cronSessionTarget === 'isolated' && (
            <input value={cronPostToMainPrefix} onChange={(e) => onSetCronPostToMainPrefix(e.target.value)} className="px-2 py-1 text-xs bg-black/30 border border-[var(--border-subtle)] rounded col-span-2" placeholder="Post-to-main prefix (optional)" />
          )}
        </div>
        <button
          className="text-[10px] px-2 py-1 rounded border border-[var(--border-subtle)]"
          disabled={cron.cronBusy || !cronName.trim() || !cronPayloadText.trim()}
          onClick={onAdd}
        >
          Add
        </button>
      </div>

      <div className="space-y-2">
        {cron.cronJobs.length === 0 && <div className="text-xs text-[var(--text-tertiary)] italic">No cron jobs.</div>}
        {cron.cronJobs.map((job) => (
          <div key={job.id} className="p-3 rounded border border-[var(--border-subtle)] bg-white/5 flex items-center justify-between gap-2">
            <div>
              <div className="text-xs font-semibold">{job.name}</div>
              <div className="text-[10px] text-[var(--text-tertiary)]">{job.id} · {job.schedule.kind} · next {formatTs(job.state?.nextRunAtMs ?? null)}</div>
            </div>
            <div className="flex gap-1">
              <button className="text-[10px] px-2 py-1 rounded border border-[var(--border-subtle)]" onClick={() => onToggle(job)} disabled={cron.cronBusy}>
                {job.enabled ? 'Disable' : 'Enable'}
              </button>
              <button className="text-[10px] px-2 py-1 rounded border border-[var(--border-subtle)]" onClick={() => onRun(job)} disabled={cron.cronBusy}>
                Run
              </button>
              <button className="text-[10px] px-2 py-1 rounded border border-[var(--border-subtle)]" onClick={() => onRuns(job)} disabled={cron.cronBusy}>
                Runs
              </button>
              <button
                className="text-[10px] px-2 py-1 rounded border border-red-500/40 text-red-300"
                onClick={() => {
                  if (window.confirm(`Remove cron job ${job.name}?`)) {
                    onRemove(job);
                  }
                }}
                disabled={cron.cronBusy}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      {cron.cronRunsJobId && (
        <div className="p-3 rounded border border-[var(--border-subtle)] bg-white/5">
          <div className="text-xs font-semibold mb-2">Recent Runs for {cron.cronRunsJobId}</div>
          <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
            {cron.cronRuns.length === 0 && <div className="text-[10px] text-[var(--text-tertiary)]">No run entries.</div>}
            {cron.cronRuns.map((entry, idx) => (
              <div key={`${entry.ts}-${idx}`} className="text-[10px] text-[var(--text-tertiary)]">
                {formatTs(entry.ts)} · {entry.status} · {entry.summary ?? entry.error ?? 'n/a'}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
