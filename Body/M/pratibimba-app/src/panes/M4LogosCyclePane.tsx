/**
 * Coordinate: M' M4' (logos-cycle carrier — 25.T25.13)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): protected-local 6-stage progression control surface
 * Actualises: the A-Logos → An-a-Logos progression ring with governed
 *   forward (advance) and backward (regress) transitions, each dispatched to
 *   the real gateway and rendered from its returned cursor. A regress is marked
 *   explicitly so a backward move never reads as forward integration.
 * Public surface: M4LogosCyclePane, M4LogosChip.
 * Does NOT own: the cycle law, stage synthesis, or artifact persistence
 *   (epi-cli nara::logos is the S0 authority; this is a strict consumer).
 * Contract: [[M4'-SPEC]] / [[CHROME-CONTRACT]].
 */

import { useEffect, useState } from 'react';
import { gateway } from '../bridge/gatewayHolder';
import { useProvenanceStore } from '../state/stores';
import { InlineConfirm } from '../ui/InlineConfirm';
import {
    LOGOS_ADVANCE_METHOD,
    LOGOS_REGRESS_METHOD,
    LOGOS_STAGE_NAMES,
    LOGOS_STATUS_METHOD,
    parseLogosCycleReceipt,
    type LogosCycleReceipt
} from './logosCycle';

export interface M4LogosCyclePaneProps {
    readonly readStatus?: () => Promise<LogosCycleReceipt>;
    readonly advanceStage?: () => Promise<LogosCycleReceipt>;
    readonly regressStage?: () => Promise<LogosCycleReceipt>;
}

type StageState = 'completed' | 'active' | 'pending';

function stageStateFor(index: number, receipt: LogosCycleReceipt | null): StageState {
    if (!receipt) return 'pending';
    if (receipt.completedStages.includes(index)) return 'completed';
    if (index === receipt.nextStage) return 'active';
    return 'pending';
}

/** Compact composition-surface chip (the TRACK_08 M4LogosChip export). */
export function M4LogosChip({ receipt }: { readonly receipt: LogosCycleReceipt | null }) {
    const position = receipt ? receipt.nextStage : 0;
    const label =
        receipt && position >= LOGOS_STAGE_NAMES.length
            ? 'cycle complete'
            : LOGOS_STAGE_NAMES[position] ?? LOGOS_STAGE_NAMES[0];
    return (
        <span className="logos-chip" data-testid="m4-logos-chip">
            {label} · {receipt ? receipt.completedStages.length : 0}/{LOGOS_STAGE_NAMES.length}
        </span>
    );
}

export function M4LogosCyclePane({ readStatus, advanceStage, regressStage }: M4LogosCyclePaneProps) {
    const connected = useProvenanceStore(s => s.connection.connected);
    const [receipt, setReceipt] = useState<LogosCycleReceipt | null>(null);
    const [writing, setWriting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // 31.T31.8: regress is confirmed INLINE (CCT-8) — arming renders the
    // question in this pane's own footer; nothing blocks the shell.
    const [regressArmed, setRegressArmed] = useState(false);

    const invokeStatus = async (): Promise<LogosCycleReceipt> => {
        if (readStatus) return readStatus();
        const response = await gateway().invoke(LOGOS_STATUS_METHOD, {});
        return parseLogosCycleReceipt(response.artifact);
    };

    const invokeAdvance = async (): Promise<LogosCycleReceipt> => {
        if (advanceStage) return advanceStage();
        const response = await gateway().invoke(LOGOS_ADVANCE_METHOD, {});
        return parseLogosCycleReceipt(response.artifact);
    };

    const invokeRegress = async (): Promise<LogosCycleReceipt> => {
        if (regressStage) return regressStage();
        const response = await gateway().invoke(LOGOS_REGRESS_METHOD, {});
        return parseLogosCycleReceipt(response.artifact);
    };

    // Read the current cursor once the gateway is connected.
    useEffect(() => {
        if (!connected && !readStatus) return;
        let active = true;
        setError(null);
        void invokeStatus()
            .then(next => {
                if (active) setReceipt(next);
            })
            .catch(cause => {
                if (active) setError(cause instanceof Error ? cause.message : String(cause));
            });
        return () => {
            active = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connected]);

    const run = (operation: () => Promise<LogosCycleReceipt>) => {
        setWriting(true);
        setError(null);
        void operation()
            .then(setReceipt)
            .catch(cause => setError(cause instanceof Error ? cause.message : String(cause)))
            .finally(() => setWriting(false));
    };

    const complete = receipt !== null && receipt.nextStage >= LOGOS_STAGE_NAMES.length;
    const nothingCompleted = receipt === null || receipt.completedStages.length === 0;
    const lastRegressed = receipt?.transition?.regression === true;

    return (
        <section
            className="logos-cycle-pane"
            data-testid="m4-logos-cycle"
            data-view-id="m4.nara.logosCycle"
            data-privacy-class="protected-local"
        >
            <header className="logos-header">
                <div>
                    <strong>Logos cycle</strong>
                    <span>Protected local</span>
                </div>
                <M4LogosChip receipt={receipt} />
            </header>

            <ol className="logos-stage-ring" data-testid="m4-logos-ring">
                {LOGOS_STAGE_NAMES.map((name, index) => {
                    const state = stageStateFor(index, receipt);
                    return (
                        <li
                            key={name}
                            data-testid={`m4-logos-stage-${index}`}
                            data-state={state}
                            aria-current={state === 'active' ? 'step' : undefined}
                        >
                            <span className="logos-stage-index">{index}</span>
                            <strong>{name}</strong>
                        </li>
                    );
                })}
            </ol>

            <footer className="logos-controls">
                <button
                    type="button"
                    data-testid="m4-logos-regress"
                    onClick={() => {
                        if (nothingCompleted) return;
                        setRegressArmed(true);
                    }}
                    aria-expanded={regressArmed}
                    disabled={writing || nothingCompleted}
                >
                    Regress
                </button>
                <span data-testid="m4-logos-position">
                    {receipt ? Math.min(receipt.nextStage, LOGOS_STAGE_NAMES.length) : 0} /{' '}
                    {LOGOS_STAGE_NAMES.length}
                </span>
                <button
                    type="button"
                    data-testid="m4-logos-advance"
                    onClick={() => run(invokeAdvance)}
                    disabled={writing || complete}
                >
                    Advance
                </button>
            </footer>

            {regressArmed ? (
                <InlineConfirm
                    testId="m4-logos-regress-confirm"
                    prompt="Regress to the previous logos stage?"
                    confirmLabel="Regress"
                    onConfirm={() => {
                        setRegressArmed(false);
                        run(invokeRegress);
                    }}
                    onCancel={() => setRegressArmed(false)}
                />
            ) : null}

            {lastRegressed ? (
                <p className="logos-regression" data-testid="m4-logos-regression" role="status">
                    Regressed to stage {receipt?.transition?.stage} — recorded with c_4_regression
                </p>
            ) : null}

            {error ? (
                <p className="logos-error" data-testid="m4-logos-error" role="alert">
                    {error}
                </p>
            ) : null}
        </section>
    );
}
