/**
 * Coordinate: M' `/` membrane (Gateway tab — inline try-it — Track 27.T27.7)
 * Residency: Body/M/pratibimba-app/src/panes/omni/gateway
 * Position (#n): the per-standard-capability dispatch affordance in a row.
 * Actualises: the spec's `<TryItAffordance />` (27.7) as an INLINE surface
 *   (NOT a modal/dialog — the tab IS the surface, 15.2). A small JSON textarea
 *   for sample params + a run button that dispatches the capability through the
 *   ONE gateway seam `gateway().invoke(capabilityName, params)` and renders the
 *   returned `receipt.artifact` (or the error) inline. It NEVER fabricates a
 *   response — the receipt is shown verbatim, absence/failure is the error.
 *   Rendered ONLY for `standard` capabilities by the list view; the
 *   `aletheia-mode-internal` privacy gate keeps this control off internal tools.
 * Public surface: TryItAffordance.
 * Does NOT own: the privacy gate (CapabilityListView decides who gets one),
 *   the gateway transport (bridge/gatewayHolder), or entitlement (S4).
 */

import { useState } from 'react';
import { gateway } from '../../../bridge/gatewayHolder';

export function TryItAffordance({ capabilityName }: { readonly capabilityName: string }) {
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState('{}');
    const [running, setRunning] = useState(false);
    const [result, setResult] = useState<{ readonly artifact: unknown } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const run = () => {
        let params: Record<string, unknown>;
        try {
            const parsed = draft.trim() === '' ? {} : JSON.parse(draft);
            if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
                setResult(null);
                setError('sample params must be a JSON object');
                return;
            }
            params = parsed as Record<string, unknown>;
        } catch (parseErr) {
            setResult(null);
            setError(`invalid JSON: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`);
            return;
        }
        setError(null);
        setResult(null);
        setRunning(true);
        // Resolve inside the promise chain so a gateway()-not-connected throw
        // lands in .catch as an honest error instead of crashing the render.
        Promise.resolve()
            .then(() => gateway().invoke(capabilityName, params))
            .then(receipt => setResult({ artifact: receipt.artifact }))
            .catch(invokeErr => setError(invokeErr instanceof Error ? invokeErr.message : String(invokeErr)))
            .finally(() => setRunning(false));
    };

    return (
        <span
            className="try-it-affordance"
            data-testid="try-it-affordance"
            data-capability={capabilityName}
            onClick={event => event.stopPropagation()}
        >
            <button
                type="button"
                className={`try-it-toggle${open ? ' active' : ''}`}
                data-testid="try-it-toggle"
                aria-expanded={open}
                onClick={() => setOpen(value => !value)}
            >
                {open ? 'close' : 'try it'}
            </button>
            {open && (
                <span className="try-it-inline" data-testid="try-it-inline">
                    <textarea
                        className="try-it-params"
                        data-testid="try-it-params"
                        aria-label={`sample params for ${capabilityName}`}
                        value={draft}
                        spellCheck={false}
                        onChange={event => setDraft(event.target.value)}
                    />
                    <button
                        type="button"
                        className="try-it-run"
                        data-testid="try-it-run"
                        disabled={running}
                        onClick={run}
                    >
                        {running ? 'running…' : 'run'}
                    </button>
                    {error !== null && (
                        <p className="try-it-error" data-testid="try-it-error" role="alert">
                            {error}
                        </p>
                    )}
                    {result !== null && (
                        <pre className="try-it-result" data-testid="try-it-result">
                            {JSON.stringify(result.artifact, null, 2)}
                        </pre>
                    )}
                </span>
            )}
        </span>
    );
}
