/**
 * Coordinate: M4' personal identity (PASU identity-setup wizard — 25.T25.4)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): #4 — the first-run identity capture surface
 * Actualises: the six-step PASU identity wizard. Reads the current handle-only
 *   record via `nara.pasu.show`, walks the six editable identity scalars
 *   (birth-date/-location, natal-chart PATH, jungian, gene-keys, human-design)
 *   with back/next + skip, and writes each via the canonical `nara.pasu.set`
 *   RPC (DR-WC-M4-3) — NEVER the `epi vault pasu set` CLI. Draft state is
 *   session-scope and survives back/next. Natal chart is a PATH string only
 *   (handle-only, protected-local); the raw chart body never crosses the bus.
 * Public surface: PasuWizardPane, PASU_WIZARD_STEPS, PASU_SHOW_RPC, PASU_SET_RPC,
 *   PasuWizardGateway.
 * Does NOT own: the PASU write law (S0 pasu.rs `pasu_set_key`), the cold-start
 *   routing that mounts this wizard (32.T32.2 pasuOnboarding.ts), or Kairos.
 * Contract: [[M4'-SPEC]] + rerun tranche [[25.T25.4]] (DR-WC-M4-3).
 */

import { privacyChrome } from '../ui/privacyChrome';
import { useCallback, useEffect, useMemo, useState } from 'react';

export const PASU_SHOW_RPC = 'nara.pasu.show';
export const PASU_SET_RPC = 'nara.pasu.set';

export interface PasuWizardStepDef {
    /** The PASU.md frontmatter key `nara.pasu.set` writes. */
    readonly key: string;
    readonly label: string;
    readonly hint: string;
    /** The onboarding-completion ledger step id (32.13). */
    readonly ledgerStep: string;
}

/** The six editable identity scalars, in wizard order (DR-WC-M4-3). */
export const PASU_WIZARD_STEPS: readonly PasuWizardStepDef[] = [
    { key: 'c_0_birth_date', label: 'Birth date', hint: 'YYYY-MM-DD', ledgerStep: 'identity.pasu-birth-date' },
    { key: 'c_0_birth_location', label: 'Birth location', hint: 'City, Country', ledgerStep: 'identity.pasu-birth-location' },
    { key: 'c_0_natal_chart_path', label: 'Natal chart', hint: 'path to your natal-chart file (handle-only)', ledgerStep: 'identity.pasu-natal-chart' },
    { key: 'c_2_jungian', label: 'Jungian type', hint: 'e.g. INFJ', ledgerStep: 'identity.pasu-jungian' },
    { key: 'c_3_gene_keys', label: 'Gene Keys', hint: 'e.g. 25.2 / 46.1', ledgerStep: 'identity.pasu-gene-keys' },
    { key: 'c_4_human_design', label: 'Human Design', hint: 'e.g. Generator 2/4', ledgerStep: 'identity.pasu-human-design' }
];

export interface PasuWizardGateway {
    invoke(method: string, params: Record<string, unknown>): Promise<unknown>;
}

export interface PasuWizardProps {
    readonly gateway: PasuWizardGateway;
    /** Record a completed identity step (32.13 ledger). */
    readonly onStepComplete?: (ledgerStep: string) => void;
    /** All steps resolved (saved or skipped) — cold-start proceeds to kairos. */
    readonly onComplete?: () => void;
    /** Whole-wizard skip — persists the `pasu-skipped: ['wizard']` flag upstream. */
    readonly onSkipWizard?: () => void;
}

function readRecordField(record: unknown, key: string): string {
    if (!record || typeof record !== 'object') {
        return '';
    }
    const value = (record as Record<string, unknown>)[key];
    return typeof value === 'string' ? value : '';
}

export function PasuWizardPane({ gateway, onStepComplete, onComplete, onSkipWizard }: PasuWizardProps) {
    const [index, setIndex] = useState(0);
    // Draft holds every field so back/next never loses an edit (session-scope).
    const [draft, setDraft] = useState<Record<string, string>>({});
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    // Seed the draft from the existing handle-only record on mount.
    useEffect(() => {
        let live = true;
        void (async () => {
            try {
                const record = await gateway.invoke(PASU_SHOW_RPC, {});
                if (!live) return;
                const seeded: Record<string, string> = {};
                for (const step of PASU_WIZARD_STEPS) {
                    seeded[step.key] = readRecordField(record, step.key);
                }
                setDraft(seeded);
            } catch {
                // no PASU.md yet — start from empty drafts (first-run)
            }
        })();
        return () => {
            live = false;
        };
    }, [gateway]);

    const step = PASU_WIZARD_STEPS[index];
    const value = draft[step.key] ?? '';
    const isLast = index === PASU_WIZARD_STEPS.length - 1;

    const setValue = useCallback(
        (next: string) => setDraft(current => ({ ...current, [step.key]: next })),
        [step.key]
    );

    const advance = useCallback(() => {
        setError(null);
        if (isLast) {
            onComplete?.();
        } else {
            setIndex(i => i + 1);
        }
    }, [isLast, onComplete]);

    const saveAndNext = useCallback(async () => {
        const trimmed = value.trim();
        if (trimmed.length === 0) {
            // nothing to write — treat as skip-of-this-step
            advance();
            return;
        }
        setBusy(true);
        setError(null);
        try {
            await gateway.invoke(PASU_SET_RPC, { key: step.key, value: trimmed });
            onStepComplete?.(step.ledgerStep);
            advance();
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setBusy(false);
        }
    }, [advance, gateway, onStepComplete, step.key, step.ledgerStep, value]);

    const back = useCallback(() => {
        setError(null);
        setIndex(i => Math.max(0, i - 1));
    }, []);

    const progress = useMemo(() => `${index + 1} / ${PASU_WIZARD_STEPS.length}`, [index]);

    return (
        <section
            className={`pasu-wizard ${privacyChrome('protected_local').className}`}
            title={privacyChrome('protected_local').title}
            data-testid="pasu-wizard"
            data-step-key={step.key}
            data-step-index={index}
            aria-label="PASU identity setup"
        >
            <header className="pasu-wizard-header">
                <span data-testid="pasu-wizard-progress">{progress}</span>
                <button type="button" data-testid="pasu-wizard-skip-all" onClick={() => onSkipWizard?.()}>
                    Skip for now
                </button>
            </header>
            <label className="pasu-wizard-field">
                <span data-testid="pasu-wizard-label">{step.label}</span>
                <input
                    type="text"
                    data-testid="pasu-wizard-input"
                    value={value}
                    placeholder={step.hint}
                    onChange={event => setValue(event.target.value)}
                    disabled={busy}
                />
            </label>
            {error ? (
                <p className="pasu-wizard-error" data-testid="pasu-wizard-error" role="alert">
                    {error}
                </p>
            ) : null}
            <footer className="pasu-wizard-footer">
                <button type="button" data-testid="pasu-wizard-back" onClick={back} disabled={index === 0 || busy}>
                    Back
                </button>
                <button type="button" data-testid="pasu-wizard-skip-step" onClick={advance} disabled={busy}>
                    Skip
                </button>
                <button type="button" data-testid="pasu-wizard-next" onClick={() => void saveAndNext()} disabled={busy}>
                    {isLast ? 'Finish' : 'Next'}
                </button>
            </footer>
        </section>
    );
}
