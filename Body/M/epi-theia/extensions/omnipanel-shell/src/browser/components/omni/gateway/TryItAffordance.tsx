import { useMemo, useState } from 'react';
import {
  canTryCapability,
  createDefaultTryItDraft,
  submitTryItCapability,
  type GatewayCapability
} from './gatewayModel';

export interface TryItAffordanceProps {
  readonly capability: GatewayCapability;
  readonly draft?: string;
  readonly onDraftChange?: (capabilityName: string, draft: string) => void;
  readonly onInvokeGatewayRpc: (method: string, params: Record<string, unknown>) => Promise<unknown>;
}

export function TryItAffordance({
  capability,
  draft,
  onDraftChange,
  onInvokeGatewayRpc
}: TryItAffordanceProps) {
  const allowed = canTryCapability(capability);
  const defaultDraft = useMemo(() => createDefaultTryItDraft(capability), [capability]);
  const [localDraft, setLocalDraft] = useState(draft ?? defaultDraft);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const currentDraft = draft ?? localDraft;

  const setDraft = (next: string) => {
    setLocalDraft(next);
    onDraftChange?.(capability.name, next);
  };

  const submit = async () => {
    setBusy(true);
    setError(null);
    setResponse(null);
    try {
      setResponse(await submitTryItCapability(capability, currentDraft, onInvokeGatewayRpc));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  if (!allowed) {
    return (
      <span
        className="text-[10px] text-[var(--text-tertiary)]"
        data-test={`try-it-blocked-${capability.name}`}
      >
        gated
      </span>
    );
  }

  return (
    <div className="space-y-2" data-test={`try-it-${capability.name}`}>
      <button
        type="button"
        className="px-2 py-1 text-[10px] rounded border border-[var(--border-subtle)]"
        onClick={() => setOpen(!open)}
        data-test={`try-it-toggle-${capability.name}`}
      >
        Try it
      </button>
      {open ? (
        <div className="space-y-2 rounded border border-[var(--border-subtle)] bg-black/25 p-2" data-test={`try-it-panel-${capability.name}`}>
          <textarea
            value={currentDraft}
            onChange={(event) => setDraft(event.target.value)}
            rows={5}
            className="w-full rounded border border-[var(--border-subtle)] bg-black/30 px-2 py-1 text-[10px] font-mono"
            data-test={`try-it-payload-${capability.name}`}
          />
          <button
            type="button"
            className="px-2 py-1 text-[10px] rounded border border-[var(--border-subtle)]"
            onClick={() => void submit()}
            disabled={busy}
            data-test={`try-it-submit-${capability.name}`}
          >
            {busy ? 'Running' : 'Submit'}
          </button>
          {error ? <div className="text-[10px] text-red-300" data-test={`try-it-error-${capability.name}`}>{error}</div> : null}
          {response ? (
            <pre className="max-h-40 overflow-auto rounded bg-black/30 p-2 text-[10px]" data-test={`try-it-response-${capability.name}`}>
              {response}
            </pre>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
