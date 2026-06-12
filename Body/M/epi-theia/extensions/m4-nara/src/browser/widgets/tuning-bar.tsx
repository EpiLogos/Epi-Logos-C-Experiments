import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    CoordinateContext,
    Disposable,
    EMPTY_COORDINATE_CONTEXT,
    MathemeHarmonicProfileBoundary,
    SharedBridgeAdapter,
    SHARED_BRIDGE_ADAPTER
} from '@pratibimba/m-extension-runtime';
import { EXTENSION_ID, PRIVACY_CLASS } from '../../common';

export const TUNING_BAR_VIEW_ID = 'm4.nara.tuningBar';
export const TUNING_BAR_LABEL = 'M4 Tuning Bar';
export const M4_TUNING_BAR_EXPORT = 'M4TuningBar' as const;

const TUNING_RESONATE_METHOD = 'nara.tuning.resonate';

export type TuningBarStatus = 'idle' | 'tuning' | 'resonating' | 'resonated' | 'error';

/**
 * A single personal harmonic parameter the tuning bar can adjust. Values are
 * normalised scalars in [0, 1]; the kernel-bridge owns how they recalibrate the
 * authoritative MathemeHarmonicProfile when resonated.
 */
export interface TuningParameter {
    readonly key: string;
    readonly label: string;
    readonly description: string;
    /** Payload field names to seed the initial value from, first match wins. */
    readonly profileFields: readonly string[];
    readonly fallback: number;
}

export const TUNING_PARAMETERS: readonly TuningParameter[] = Object.freeze([
    Object.freeze({
        key: 'oracle',
        label: 'Oracle',
        description: 'Weight given to oracular draws in the harmonic blend.',
        profileFields: ['oracleWeight', 'weights.oracle'],
        fallback: 0.5
    }),
    Object.freeze({
        key: 'medicine',
        label: 'Medicine',
        description: 'Weight given to somatic / medicine resonance.',
        profileFields: ['medicineWeight', 'weights.medicine'],
        fallback: 0.5
    }),
    Object.freeze({
        key: 'lens',
        label: 'Lens',
        description: 'Weight given to lens interpretation overlays.',
        profileFields: ['lensWeight', 'weights.lens'],
        fallback: 0.5
    }),
    Object.freeze({
        key: 'kairos',
        label: 'Kairos',
        description: 'Sensitivity to the live kairotic transit signal.',
        profileFields: ['kairosWeight', 'weights.kairos'],
        fallback: 0.5
    })
]);

export interface M4TuningBarProps {
    readonly parameters: readonly TuningParameter[];
    readonly values: Readonly<Record<string, number>>;
    readonly status: TuningBarStatus;
    readonly dirty: boolean;
    readonly errorMessage?: string | null;
    readonly onChange: (key: string, value: number) => void;
    readonly onResonate: () => void;
    readonly onReset: () => void;
}

/**
 * Interactive control surface for resonating personal harmonic parameters. Each
 * parameter is a normalised slider; "Resonate" commits the blend through the
 * bridge so the kernel can recalibrate the authoritative profile.
 */
export const M4TuningBar: React.FC<M4TuningBarProps> = props => {
    const { parameters, values, status, dirty, errorMessage, onChange, onResonate, onReset } = props;
    const busy = status === 'resonating';

    return (
        <section
            className="m4-tuning-bar"
            data-test="m4-tuning-bar"
            data-track="TRACK_08"
            data-export={M4_TUNING_BAR_EXPORT}
            data-status={status}
        >
            <header className="m4-tuning-header">
                <div>
                    <h3>Tuning Bar</h3>
                    <p data-test="m4-tuning-subtitle">Resonate your personal harmonic parameters.</p>
                </div>
                <span className="m4-tuning-privacy mext-privacy-protected-local">protected-local</span>
            </header>

            <div className="m4-tuning-sliders">
                {parameters.map(parameter => {
                    const value = values[parameter.key] ?? parameter.fallback;
                    return (
                        <label
                            key={parameter.key}
                            className="m4-tuning-slider"
                            data-test="m4-tuning-slider"
                            data-parameter={parameter.key}
                            title={parameter.description}
                        >
                            <span className="m4-tuning-slider-label">{parameter.label}</span>
                            <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.01}
                                value={value}
                                disabled={busy}
                                data-test="m4-tuning-input"
                                aria-label={`${parameter.label} weight`}
                                onChange={event => onChange(parameter.key, Number(event.target.value))}
                            />
                            <span className="m4-tuning-slider-value" data-test="m4-tuning-value">
                                {value.toFixed(2)}
                            </span>
                        </label>
                    );
                })}
            </div>

            <footer className="m4-tuning-controls">
                <button
                    type="button"
                    className="m4-tuning-reset"
                    disabled={busy || !dirty}
                    data-test="m4-tuning-reset"
                    onClick={onReset}
                >
                    Reset
                </button>
                <button
                    type="button"
                    className="m4-tuning-resonate"
                    disabled={busy || !dirty}
                    data-test="m4-tuning-resonate"
                    onClick={onResonate}
                >
                    {busy ? 'Resonating…' : 'Resonate'}
                </button>
            </footer>

            {status === 'resonated' ? (
                <p className="m4-tuning-confirmation" data-test="m4-tuning-confirmation">
                    Harmonic blend resonated.
                </p>
            ) : null}
            {errorMessage ? (
                <aside className="m4-tuning-error" data-test="m4-tuning-error">
                    {errorMessage}
                </aside>
            ) : null}
        </section>
    );
};

@injectable()
export class TuningBarWidget extends ReactWidget {
    static readonly ID = TUNING_BAR_VIEW_ID;
    static readonly LABEL = TUNING_BAR_LABEL;

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    protected profile: MathemeHarmonicProfileBoundary | null = null;
    protected context: CoordinateContext = EMPTY_COORDINATE_CONTEXT;
    protected values: Record<string, number> = seedTuningValues(null);
    protected baseline: Readonly<Record<string, number>> = seedTuningValues(null);
    protected status: TuningBarStatus = 'idle';
    protected errorMessage: string | null = null;
    protected dirty = false;
    protected touched = false;
    protected subscriptions: Disposable[] = [];

    @postConstruct()
    protected init(): void {
        this.id = TuningBarWidget.ID;
        this.title.label = TuningBarWidget.LABEL;
        this.title.caption = TuningBarWidget.LABEL;
        this.title.closable = true;
        this.addClass('mext-widget');
        this.addClass('mext-widget-' + EXTENSION_ID);
        this.addClass('m4-nara-tuning-bar');
        this.addClass('mext-privacy-protected-local');

        this.subscriptions.push(
            this.bridge.onProfile(profile => {
                this.profile = profile;
                // Re-seed from the profile only while the user has not edited.
                if (!this.touched) {
                    this.values = seedTuningValues(profile);
                    this.baseline = Object.freeze({ ...this.values });
                }
                this.update();
            })
        );
        this.subscriptions.push(
            this.bridge.onCoordinateContext(context => {
                this.context = context;
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
        return (
            <div className="mext-widget-root" data-test="m4-tuning-bar-root">
                <M4TuningBar
                    parameters={TUNING_PARAMETERS}
                    values={this.values}
                    status={this.status}
                    dirty={this.dirty}
                    errorMessage={this.errorMessage}
                    onChange={(key, value) => this.handleChange(key, value)}
                    onResonate={() => void this.commitResonate()}
                    onReset={() => this.handleReset()}
                />
            </div>
        );
    }

    protected handleChange(key: string, value: number): void {
        this.touched = true;
        this.values = { ...this.values, [key]: clampUnit(value) };
        this.dirty = isDirty(this.values, this.baseline);
        this.status = this.status === 'error' ? 'idle' : 'tuning';
        this.errorMessage = null;
        this.update();
    }

    protected handleReset(): void {
        this.values = { ...this.baseline };
        this.dirty = false;
        this.touched = false;
        this.status = 'idle';
        this.errorMessage = null;
        this.update();
    }

    protected async commitResonate(): Promise<void> {
        if (!this.dirty) {
            return;
        }
        this.status = 'resonating';
        this.errorMessage = null;
        this.update();
        try {
            await this.bridge.invokeGatewayRpc(TUNING_RESONATE_METHOD, {
                privacyClass: PRIVACY_CLASS,
                pointerAnchor: this.context.pointerAnchor,
                parameters: { ...this.values }
            });
            this.baseline = Object.freeze({ ...this.values });
            this.dirty = false;
            this.touched = false;
            this.status = 'resonated';
            this.errorMessage = null;
        } catch (error) {
            this.status = 'error';
            this.errorMessage = error instanceof Error ? error.message : String(error);
        }
        this.update();
    }
}

export function seedTuningValues(profile: MathemeHarmonicProfileBoundary | null): Record<string, number> {
    const values: Record<string, number> = {};
    for (const parameter of TUNING_PARAMETERS) {
        values[parameter.key] = clampUnit(
            profileNumericField(profile, parameter.profileFields) ?? parameter.fallback
        );
    }
    return values;
}

function isDirty(values: Readonly<Record<string, number>>, baseline: Readonly<Record<string, number>>): boolean {
    return TUNING_PARAMETERS.some(parameter => values[parameter.key] !== baseline[parameter.key]);
}

function clampUnit(value: number): number {
    if (!Number.isFinite(value)) {
        return 0;
    }
    return Math.min(1, Math.max(0, value));
}

function profileNumericField(
    profile: MathemeHarmonicProfileBoundary | null,
    dottedNames: readonly string[]
): number | null {
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
        if (typeof current === 'number' && Number.isFinite(current)) {
            return current;
        }
    }
    return null;
}
