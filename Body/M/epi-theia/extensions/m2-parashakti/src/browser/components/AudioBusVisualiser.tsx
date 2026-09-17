import * as React from 'react';

export const AUDIO_BUS_CHANNEL_COUNT = 8;
export const AUDIO_BUS_MANTRA_MIN_HZ = 144;
export const AUDIO_BUS_MANTRA_MAX_HZ = 432;

const BAND_GLYPHS = Object.freeze(['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8']);

export interface AudioBusActivePlanet {
    readonly name?: string;
    readonly elem_sig?: unknown;
    readonly elemSig?: unknown;
    readonly element?: unknown;
}

export interface AudioBusVisualiserProps {
    readonly audioOctet?: readonly number[];
    readonly profile?: Readonly<Record<string, unknown>> | null;
    readonly activePlanet?: AudioBusActivePlanet | null;
    readonly parashaktiMeaning?: Readonly<Record<string, unknown>> | null;
    readonly className?: string;
}

export interface AudioBusVisualChannel {
    readonly index: number;
    readonly hz: number;
    readonly label: string;
    readonly bandGlyph: string;
    readonly alignment: number;
    readonly barPercent: number;
    readonly elementBadge: string;
}

export interface AudioBusPhaseIndicator {
    readonly kind: 'matrika' | 'malini' | 'pending';
    readonly arc: 'descent' | 'ascent' | 'pending';
    readonly mantraIndex: number | null;
    readonly label: string;
}

export interface AudioBusVisualModel {
    readonly channels: readonly AudioBusVisualChannel[];
    readonly phase: AudioBusPhaseIndicator;
    readonly scale: {
        readonly minHz: typeof AUDIO_BUS_MANTRA_MIN_HZ;
        readonly maxHz: typeof AUDIO_BUS_MANTRA_MAX_HZ;
        readonly role: 'mantra-band';
    };
    readonly elementBadge: string;
    readonly futureAudioSurface: 'Body/S/S0/portal-core/src/music_tech.rs';
    readonly audioOutput: 'none';
}

export function AudioBusVisualiser(props: AudioBusVisualiserProps): React.ReactElement {
    const model = buildAudioBusVisualModel(props);
    const className = ['m2-audio-bus-visualiser', props.className].filter(Boolean).join(' ');

    return (
        <section
            className={className}
            aria-label="Audio bus visual representation"
            data-audio-bus-visualiser
            data-audio-output={model.audioOutput}
            data-scale-role={model.scale.role}
            data-scale-min-hz={model.scale.minHz}
            data-scale-max-hz={model.scale.maxHz}
            data-phase={model.phase.kind}
            data-phase-arc={model.phase.arc}
            data-mantra-index={model.phase.mantraIndex ?? ''}
        >
            <header className="m2-audio-bus-visualiser__header">
                <h4>Audio bus</h4>
                <span className="m2-audio-bus-visualiser__phase" data-phase-indicator>
                    {model.phase.label}
                </span>
            </header>

            <div className="m2-audio-bus-visualiser__scale" aria-label="Mantra band scale">
                <span>{model.scale.minHz} Hz</span>
                <span>mantra band</span>
                <span>{model.scale.maxHz} Hz</span>
            </div>

            <ol className="m2-audio-bus-visualiser__channels">
                {model.channels.map(channel => (
                    <li
                        key={channel.index}
                        className="m2-audio-bus-visualiser__channel"
                        data-audio-channel-row={channel.index}
                        data-channel-index={channel.index}
                        data-hz={channel.hz}
                        data-band-glyph={channel.bandGlyph}
                        data-element-badge={channel.elementBadge}
                    >
                        <span className="m2-audio-bus-visualiser__channel-label">{channel.label}</span>
                        <span className="m2-audio-bus-visualiser__band">{channel.bandGlyph}</span>
                        <span className="m2-audio-bus-visualiser__hz">{channel.hz.toFixed(2)} Hz</span>
                        <span className="m2-audio-bus-visualiser__element">{channel.elementBadge}</span>
                        <span
                            className="m2-audio-bus-visualiser__bar"
                            role="meter"
                            aria-valuemin={model.scale.minHz}
                            aria-valuemax={model.scale.maxHz}
                            aria-valuenow={channel.hz}
                            data-alignment={channel.alignment}
                            data-bar-percent={channel.barPercent}
                            style={{ width: `${channel.barPercent}%` }}
                        />
                    </li>
                ))}
            </ol>

            <footer className="m2-audio-bus-visualiser__footer">
                <span data-visual-only="true">visual representation only</span>
                <span data-audio-bridge-future={model.futureAudioSurface}>
                    future audio surface: {model.futureAudioSurface} (MPE / MTS-ESP)
                </span>
            </footer>
        </section>
    );
}

export function buildAudioBusVisualModel(input: AudioBusVisualiserProps): AudioBusVisualModel {
    const payload = objectRecord(input.profile?.payload) ?? objectRecord(input.profile) ?? undefined;
    const audioOctet = normalizeAudioOctet(input.audioOctet ?? arrayValue(payload?.audioOctet ?? payload?.audio_octet));
    const elementBadge = elementBadgeFromPlanet(input.activePlanet);
    const phase = phaseIndicator(input.parashaktiMeaning ?? objectRecord(payload?.parashakti_meaning ?? payload?.parashaktiMeaning));

    return Object.freeze({
        channels: Object.freeze(
            audioOctet.map((hz, index) => {
                const alignment = mantraBandAlignment(hz);
                return Object.freeze({
                    index,
                    hz,
                    label: `Ch ${index + 1}`,
                    bandGlyph: BAND_GLYPHS[index],
                    alignment,
                    barPercent: Number((alignment * 100).toFixed(2)),
                    elementBadge
                });
            })
        ),
        phase,
        scale: Object.freeze({
            minHz: AUDIO_BUS_MANTRA_MIN_HZ,
            maxHz: AUDIO_BUS_MANTRA_MAX_HZ,
            role: 'mantra-band' as const
        }),
        elementBadge,
        futureAudioSurface: 'Body/S/S0/portal-core/src/music_tech.rs',
        audioOutput: 'none' as const
    });
}

function normalizeAudioOctet(value: readonly unknown[]): readonly number[] {
    const values = value.map(numberValue);
    if (values.length !== AUDIO_BUS_CHANNEL_COUNT || !values.every((entry): entry is number => entry !== null)) {
        throw new Error('AudioBusVisualiser requires audio_octet[8] with finite Hz values');
    }
    return Object.freeze(values);
}

function mantraBandAlignment(hz: number): number {
    const span = AUDIO_BUS_MANTRA_MAX_HZ - AUDIO_BUS_MANTRA_MIN_HZ;
    const raw = (hz - AUDIO_BUS_MANTRA_MIN_HZ) / span;
    return Number(Math.min(1, Math.max(0, raw)).toFixed(6));
}

function elementBadgeFromPlanet(activePlanet: AudioBusActivePlanet | null | undefined): string {
    const sig = activePlanet?.elem_sig ?? activePlanet?.elemSig ?? activePlanet?.element;
    if (typeof sig === 'string' && sig.trim()) {
        return sig.trim().split(/[^A-Za-z0-9]+/).filter(Boolean)[0]?.toUpperCase() ?? 'ELEMENT-PENDING';
    }
    if (typeof sig === 'number' && Number.isFinite(sig)) {
        return `ELEM-${Math.trunc(sig)}`;
    }
    return 'ELEMENT-PENDING';
}

function phaseIndicator(parashaktiMeaning: Readonly<Record<string, unknown>> | null | undefined): AudioBusPhaseIndicator {
    const routingTrace = objectRecord(parashaktiMeaning?.routing_trace ?? parashaktiMeaning?.routingTrace);
    const mantraIndex = numberValue(routingTrace?.mantra_index ?? routingTrace?.mantraIndex);
    if (mantraIndex === null) {
        return Object.freeze({
            kind: 'pending',
            arc: 'pending',
            mantraIndex: null,
            label: 'mantra phase pending'
        });
    }

    const normalized = ((Math.trunc(mantraIndex) % 100) + 100) % 100;
    if (normalized < 50) {
        return Object.freeze({
            kind: 'matrika',
            arc: 'descent',
            mantraIndex: normalized,
            label: `Matrika descent ${normalized}`
        });
    }
    return Object.freeze({
        kind: 'malini',
        arc: 'ascent',
        mantraIndex: normalized,
        label: `Malini ascent ${normalized}`
    });
}

function objectRecord(value: unknown): Readonly<Record<string, unknown>> | undefined {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? (value as Readonly<Record<string, unknown>>)
        : undefined;
}

function arrayValue(value: unknown): readonly unknown[] {
    return Array.isArray(value) ? value : [];
}

function numberValue(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
