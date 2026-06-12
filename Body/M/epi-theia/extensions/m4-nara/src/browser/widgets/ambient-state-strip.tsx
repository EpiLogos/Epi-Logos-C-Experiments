import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    CoordinateContext,
    Disposable,
    EMPTY_COORDINATE_CONTEXT,
    MathemeHarmonicProfileBoundary,
    MExtensionReadinessSnapshot,
    PENDING_M_READINESS,
    SharedBridgeAdapter,
    SHARED_BRIDGE_ADAPTER
} from '@pratibimba/m-extension-runtime';
import { EXTENSION_ID } from '../../common';

export const AMBIENT_STATE_STRIP_VIEW_ID = 'm4.nara.ambientStateStrip';
export const AMBIENT_STATE_STRIP_LABEL = 'M4 Ambient State';
export const M4_AMBIENT_STATE_STRIP_EXPORT = 'M4AmbientStateStrip' as const;

/**
 * Minimal harmonic-state cell rendered as a single pill in the strip. The
 * authoritative profile lives in the kernel-bridge; the strip only surfaces
 * payload-shaped scalars it already received, never deriving harmonic law.
 */
export interface AmbientStateCell {
    readonly key: string;
    readonly label: string;
    readonly value: string;
}

export interface M4AmbientStateStripProps {
    readonly cells: readonly AmbientStateCell[];
    readonly generation: number | null;
    readonly connected: boolean;
    readonly readinessState: MExtensionReadinessSnapshot['state'];
}

/**
 * Thin horizontal ambient strip suitable for the daily-0-1 layout top area. It
 * is presentational only — a compact read-out of the current harmonic profile.
 */
export const M4AmbientStateStrip: React.FC<M4AmbientStateStripProps> = props => {
    const { cells, generation, connected, readinessState } = props;
    return (
        <div
            className="m4-ambient-state-strip"
            data-test="m4-ambient-state-strip"
            data-track="TRACK_08"
            data-export={M4_AMBIENT_STATE_STRIP_EXPORT}
            data-connected={connected ? 'true' : 'false'}
            data-readiness={readinessState}
            role="status"
            aria-label="Current harmonic profile state"
        >
            <span
                className="m4-ambient-pulse"
                data-test="m4-ambient-pulse"
                data-connected={connected ? 'true' : 'false'}
                aria-hidden="true"
            />
            <ol className="m4-ambient-cells">
                {cells.map(cell => (
                    <li
                        key={cell.key}
                        className="m4-ambient-cell"
                        data-test="m4-ambient-cell"
                        data-cell={cell.key}
                    >
                        <span className="m4-ambient-cell-label">{cell.label}</span>
                        <span className="m4-ambient-cell-value">{cell.value}</span>
                    </li>
                ))}
            </ol>
            <span className="m4-ambient-meta" data-test="m4-ambient-generation">
                gen {generation ?? '—'}
            </span>
            <span className="m4-ambient-privacy mext-privacy-protected-local">
                protected-local
            </span>
        </div>
    );
};

@injectable()
export class AmbientStateStripWidget extends ReactWidget {
    static readonly ID = AMBIENT_STATE_STRIP_VIEW_ID;
    static readonly LABEL = AMBIENT_STATE_STRIP_LABEL;

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    protected profile: MathemeHarmonicProfileBoundary | null = null;
    protected context: CoordinateContext = EMPTY_COORDINATE_CONTEXT;
    protected readiness: MExtensionReadinessSnapshot = PENDING_M_READINESS;
    protected subscriptions: Disposable[] = [];

    @postConstruct()
    protected init(): void {
        this.id = AmbientStateStripWidget.ID;
        this.title.label = AmbientStateStripWidget.LABEL;
        this.title.caption = AmbientStateStripWidget.LABEL;
        this.title.closable = true;
        this.addClass('mext-widget');
        this.addClass('mext-widget-' + EXTENSION_ID);
        this.addClass('m4-nara-ambient-state-strip');
        this.addClass('mext-privacy-protected-local');

        this.subscriptions.push(
            this.bridge.onProfile(profile => {
                this.profile = profile;
                this.update();
            })
        );
        this.subscriptions.push(
            this.bridge.onCoordinateContext(context => {
                this.context = context;
                this.update();
            })
        );
        this.subscriptions.push(
            this.bridge.onReadiness(snapshot => {
                this.readiness = snapshot;
                this.update();
            })
        );
    }

    override dispose(): void {
        for (const sub of this.subscriptions) {
            try {
                sub.dispose();
            } catch {
                // best-effort
            }
        }
        super.dispose();
    }

    protected override render(): React.ReactNode {
        const cells = ambientStateCells(this.profile);
        const generation = this.profile?.generation ?? this.context.profileGeneration ?? null;
        return (
            <div className="mext-widget-root" data-test="m4-ambient-state-strip-root">
                <M4AmbientStateStrip
                    cells={cells}
                    generation={generation}
                    connected={this.readiness.bridgeReachable}
                    readinessState={this.readiness.state}
                />
            </div>
        );
    }
}

/**
 * The harmonic scalars the ambient strip surfaces, in display order. Each entry
 * is read from the first matching payload field name, mirroring the lookup the
 * shared state-thread status entries use.
 */
const AMBIENT_FIELD_SPECS: readonly { key: string; label: string; names: readonly string[] }[] = Object.freeze([
    { key: 'tick12', label: 'tick', names: ['tick12', 'tick.12', 'tick.twelve'] },
    { key: 'position6', label: 'pos', names: ['position6', 'position.6', 'position.six'] },
    { key: 'operation', label: 'op', names: ['Ananda_Matrix_Op', 'anandaMatrixOp', 'operation'] },
    { key: 'phase', label: 'phase', names: ['phase', 'slerpPhase', 'slerp.phase'] },
    { key: 'resonance', label: 'res', names: ['resonance', 'resonanceScore', 'resonance.score'] }
]);

export function ambientStateCells(profile: MathemeHarmonicProfileBoundary | null): readonly AmbientStateCell[] {
    return AMBIENT_FIELD_SPECS.map(spec =>
        Object.freeze({
            key: spec.key,
            label: spec.label,
            value: profilePayloadField(profile, spec.names) ?? '—'
        })
    );
}

function profilePayloadField(
    profile: MathemeHarmonicProfileBoundary | null,
    dottedNames: readonly string[]
): string | null {
    if (!profile) {
        return null;
    }
    for (const dotted of dottedNames) {
        let current: unknown = profile.payload;
        for (const segment of dotted.split('.')) {
            if (!current || typeof current !== 'object' || Array.isArray(current) || !(segment in current)) {
                current = undefined;
                break;
            }
            current = (current as Record<string, unknown>)[segment];
        }
        if (typeof current === 'string' || typeof current === 'number' || typeof current === 'boolean') {
            return String(current);
        }
    }
    return null;
}
