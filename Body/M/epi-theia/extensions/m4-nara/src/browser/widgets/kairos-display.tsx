import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    CoordinateContext,
    Disposable,
    EMPTY_COORDINATE_CONTEXT,
    MathemeHarmonicProfileBoundary,
    MObservabilityEvent,
    SharedBridgeAdapter,
    SHARED_BRIDGE_ADAPTER
} from '@pratibimba/m-extension-runtime';
import { EXTENSION_ID } from '../../common';
import { privacyChromeClass, SURFACE_PRIVACY_TOOLTIP } from '../privacy-chrome';

export const KAIROS_WHEEL_VIEW_ID = 'm4.nara.kairosWheel';
export const KAIROS_WHEEL_LABEL = 'M4 Kairos Wheel';
export const M4_KAIROS_WHEEL_EXPORT = 'M4KairosWheel' as const;

const NATAL_POSITIONS_METHOD = 'nara.kairos.natal_positions';
const ORACLE_HISTORY_METHOD = 'nara.oracle.history';
const ORACLE_DECAY_MS = 4 * 60 * 60 * 1000;
const WHEEL_CENTER = 50;

export interface PlanetSpec {
    readonly index: number;
    readonly name: string;
    readonly glyph: string;
}

export const MOD10_PLANETS: readonly PlanetSpec[] = Object.freeze([
    Object.freeze({ index: 0, name: 'Sun', glyph: '☉' }),
    Object.freeze({ index: 1, name: 'Moon', glyph: '☽' }),
    Object.freeze({ index: 2, name: 'Mercury', glyph: '☿' }),
    Object.freeze({ index: 3, name: 'Venus', glyph: '♀' }),
    Object.freeze({ index: 4, name: 'Mars', glyph: '♂' }),
    Object.freeze({ index: 5, name: 'Jupiter', glyph: '♃' }),
    Object.freeze({ index: 6, name: 'Saturn', glyph: '♄' }),
    Object.freeze({ index: 7, name: 'Uranus', glyph: '♅' }),
    Object.freeze({ index: 8, name: 'Neptune', glyph: '♆' }),
    Object.freeze({ index: 9, name: 'Pluto', glyph: '♇' })
]);

export interface SignSpec {
    readonly index: number;
    readonly name: string;
    readonly glyph: string;
    readonly tint: string;
}

export const ZODIAC_SIGNS: readonly SignSpec[] = Object.freeze([
    Object.freeze({ index: 0, name: 'Aries', glyph: '♈', tint: '#d96a4a' }),
    Object.freeze({ index: 1, name: 'Taurus', glyph: '♉', tint: '#7b9d57' }),
    Object.freeze({ index: 2, name: 'Gemini', glyph: '♊', tint: '#c9a74a' }),
    Object.freeze({ index: 3, name: 'Cancer', glyph: '♋', tint: '#70a7bf' }),
    Object.freeze({ index: 4, name: 'Leo', glyph: '♌', tint: '#d18a3d' }),
    Object.freeze({ index: 5, name: 'Virgo', glyph: '♍', tint: '#7f9f82' }),
    Object.freeze({ index: 6, name: 'Libra', glyph: '♎', tint: '#b889bd' }),
    Object.freeze({ index: 7, name: 'Scorpio', glyph: '♏', tint: '#a34e68' }),
    Object.freeze({ index: 8, name: 'Sagittarius', glyph: '♐', tint: '#9b7cc2' }),
    Object.freeze({ index: 9, name: 'Capricorn', glyph: '♑', tint: '#8a8068' }),
    Object.freeze({ index: 10, name: 'Aquarius', glyph: '♒', tint: '#5b9fc8' }),
    Object.freeze({ index: 11, name: 'Pisces', glyph: '♓', tint: '#5d86c7' })
]);

export type KairosRingKind = 'natal' | 'transit' | 'oracle';

export interface KairosRawPosition {
    readonly planet?: string;
    readonly planetIndex?: number;
    readonly degree: number;
    readonly house?: number | null;
}

export interface KairosWheelEntry {
    readonly planet: PlanetSpec;
    readonly degree: number | null;
    readonly degreeText: string;
    readonly sign: SignSpec | null;
    readonly house: number | null;
    readonly x: number;
    readonly y: number;
    readonly angle: number;
    readonly motionDelta: number | null;
    readonly motionArrow: string | null;
}

export interface KairosWheelRing {
    readonly kind: KairosRingKind;
    readonly label: string;
    readonly entries: readonly KairosWheelEntry[];
}

export interface OracleMoment {
    readonly castHandle: string;
    readonly castAt: string;
    readonly expiresAt: string;
    readonly remainingMs: number;
    readonly positions: readonly KairosRawPosition[];
}

export interface KairosWheelModel {
    readonly planets: readonly PlanetSpec[];
    readonly natal: KairosWheelRing;
    readonly transit: KairosWheelRing;
    readonly oracle: KairosWheelRing | null;
    readonly oracleMoment: OracleMoment | null;
    readonly activeDecanLabel: string;
    readonly privacyClass: 'protected_local_handle_only';
}

export interface M4KairosWheelProps {
    readonly model: KairosWheelModel;
}

const RING_RADII: Readonly<Record<KairosRingKind, number>> = Object.freeze({
    natal: 39,
    transit: 31,
    oracle: 23
});

export const M4KairosWheel: React.FC<M4KairosWheelProps> = ({ model }) => (
    <section
        className={`m4-kairos-wheel ${privacyChromeClass('protected_local_handle_only')}`}
        data-test="m4-kairos-wheel"
        data-track="TRACK_08"
        data-export={M4_KAIROS_WHEEL_EXPORT}
        data-view-id={KAIROS_WHEEL_VIEW_ID}
        data-privacy-class={model.privacyClass}
        aria-label="Kairos display wheel"
    >
        <header className="m4-kairos-header">
            <div>
                <h3>Kairos Wheel</h3>
                <p data-test="m4-kairos-active-decan">{model.activeDecanLabel}</p>
            </div>
            <span
                className="m4-kairos-privacy mext-privacy-protected-local-handle-only"
                data-test="m4-kairos-privacy"
            >
                protected_local_handle_only
            </span>
        </header>
        <div className="m4-kairos-body">
            <div className="m4-kairos-disc" role="img" aria-label="10 planet mod-10 wheel">
                <div className="m4-kairos-centre" data-test="m4-kairos-centre">
                    Earth observer centre
                </div>
                {[model.natal, model.transit, model.oracle].filter(isRing).map(ring => (
                    <KairosRing key={ring.kind} ring={ring} />
                ))}
            </div>
            <aside className="m4-kairos-readout" aria-label="Kairos position readout">
                <KairosRingTable ring={model.natal} />
                <KairosRingTable ring={model.transit} />
                {model.oracle ? <KairosRingTable ring={model.oracle} /> : null}
                {model.oracleMoment ? (
                    <div className="m4-kairos-oracle-countdown" data-test="m4-kairos-oracle-countdown">
                        oracle decay {formatCountdown(model.oracleMoment.remainingMs)}
                    </div>
                ) : (
                    <div className="m4-kairos-oracle-countdown" data-test="m4-kairos-oracle-inactive">
                        oracle inactive
                    </div>
                )}
            </aside>
        </div>
    </section>
);

const KairosRing: React.FC<{ readonly ring: KairosWheelRing }> = ({ ring }) => (
    <ol className={`m4-kairos-ring m4-kairos-ring-${ring.kind}`} data-test={`m4-kairos-ring-${ring.kind}`}>
        {ring.entries.map(entry => (
            <li
                key={`${ring.kind}-${entry.planet.index}`}
                className="m4-kairos-planet"
                data-test="m4-kairos-planet"
                data-ring={ring.kind}
                data-planet-index={entry.planet.index}
                data-planet={entry.planet.name}
                data-degree={entry.degree ?? ''}
                data-house={entry.house ?? ''}
                style={{
                    left: `${entry.x}%`,
                    top: `${entry.y}%`
                }}
            >
                <span className="m4-kairos-glyph" title={entry.planet.name} aria-hidden="true">
                    {entry.planet.glyph}
                </span>
                <span className="m4-kairos-degree">{entry.degreeText}</span>
                <span
                    className="m4-kairos-sign"
                    style={entry.sign ? { borderColor: entry.sign.tint } : undefined}
                    data-sign={entry.sign?.name ?? ''}
                >
                    {entry.sign ? `${entry.sign.glyph} ${entry.sign.name}` : '--'}
                </span>
                <span className="m4-kairos-house">H{entry.house ?? '--'}</span>
                {entry.motionArrow ? (
                    <span
                        className="m4-kairos-motion"
                        data-test="m4-kairos-motion"
                        data-motion-delta={entry.motionDelta ?? ''}
                    >
                        {entry.motionArrow}
                    </span>
                ) : null}
            </li>
        ))}
    </ol>
);

const KairosRingTable: React.FC<{ readonly ring: KairosWheelRing }> = ({ ring }) => (
    <section className="m4-kairos-readout-ring" data-test={`m4-kairos-readout-${ring.kind}`}>
        <h4>{ring.label}</h4>
        <ol>
            {ring.entries.map(entry => (
                <li key={`${ring.kind}-row-${entry.planet.index}`}>
                    <span>{entry.planet.glyph}</span>
                    <span>{entry.planet.name}</span>
                    <span>{entry.degreeText}</span>
                    <span>{entry.sign?.glyph ?? '--'}</span>
                    <span>H{entry.house ?? '--'}</span>
                    {entry.motionArrow ? <span>{entry.motionArrow}</span> : null}
                </li>
            ))}
        </ol>
    </section>
);

@injectable()
export class KairosDisplayWidget extends ReactWidget {
    static readonly ID = KAIROS_WHEEL_VIEW_ID;
    static readonly LABEL = KAIROS_WHEEL_LABEL;

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    protected profile: MathemeHarmonicProfileBoundary | null = null;
    protected context: CoordinateContext = EMPTY_COORDINATE_CONTEXT;
    protected natalPositions: readonly KairosRawPosition[] = Object.freeze([]);
    protected oracleHistory: unknown = null;
    protected subscriptions: Disposable[] = [];
    protected natalChartPath: string | null = null;

    @postConstruct()
    protected init(): void {
        this.id = KairosDisplayWidget.ID;
        this.title.label = KairosDisplayWidget.LABEL;
        this.title.caption = SURFACE_PRIVACY_TOOLTIP;
        this.title.closable = true;
        this.addClass('mext-widget');
        this.addClass('mext-widget-' + EXTENSION_ID);
        this.addClass('m4-nara-kairos-wheel');
        this.addClass('mext-privacy-protected-local-handle-only');

        this.subscriptions.push(
            this.bridge.onProfile(profile => {
                this.profile = profile;
                const nextNatalChartPath = readProfileString(profile, [
                    'c_0_natal_chart_path',
                    'PASU.c_0_natal_chart_path',
                    'pasu.c_0_natal_chart_path',
                    'natalChartPath'
                ]);
                if (nextNatalChartPath && nextNatalChartPath !== this.natalChartPath) {
                    this.natalChartPath = nextNatalChartPath;
                    void this.refreshNatalPositions(nextNatalChartPath);
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
        this.subscriptions.push(
            this.bridge.onObservabilityEvent(event => this.handleObservabilityEvent(event))
        );
        void this.refreshOracleHistory();
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
            <div
                className={`mext-widget-root ${privacyChromeClass('protected_local_handle_only')}`}
                data-test="m4-kairos-root"
            >
                <M4KairosWheel model={buildKairosWheelModel({
                    natalPositions: this.natalPositions,
                    transitPositions: readTransitPositions(this.profile),
                    oracleHistory: this.oracleHistory,
                    nowMs: Date.now()
                })} />
            </div>
        );
    }

    protected async refreshNatalPositions(natalChartPath: string): Promise<void> {
        try {
            const raw = await this.bridge.invokeGatewayRpc(NATAL_POSITIONS_METHOD, {
                c_0_natal_chart_path: natalChartPath,
                privacyClass: 'protected_local_handle_only'
            });
            this.natalPositions = parsePositionPayload(raw);
        } catch {
            this.natalPositions = Object.freeze([]);
        }
        this.update();
    }

    protected async refreshOracleHistory(): Promise<void> {
        try {
            this.oracleHistory = await this.bridge.invokeGatewayRpc(ORACLE_HISTORY_METHOD, {
                dayNowSessionHandle: this.context.dayNowSessionHandle,
                privacyClass: 'protected_local_handle_only'
            });
        } catch {
            this.oracleHistory = null;
        }
        this.update();
    }

    protected handleObservabilityEvent(event: MObservabilityEvent): void {
        const kind = typeof event.payload.kind === 'string' ? event.payload.kind : event.type;
        if (event.type === 'mercurius.kairos.delta' || kind === 'mercurius.kairos.delta') {
            const positions = parsePositionPayload(event.payload);
            if (positions.length === MOD10_PLANETS.length) {
                this.profile = mergeTransitPositions(this.profile, positions);
            }
            this.update();
        }
        if (event.type.includes('oracle') || kind.includes('oracle')) {
            this.oracleHistory = event.payload.history ?? event.payload;
            this.update();
        }
    }
}

export function buildKairosWheelModel(input: {
    readonly natalPositions: unknown;
    readonly transitPositions: unknown;
    readonly oracleHistory?: unknown;
    readonly nowMs?: number;
}): KairosWheelModel {
    const nowMs = input.nowMs ?? Date.now();
    const natalPositions = parsePositionPayload(input.natalPositions);
    const transitPositions = parsePositionPayload(input.transitPositions);
    const oracleMoment = activeOracleMoment(input.oracleHistory, nowMs);

    const natal = buildRing('natal', 'Natal', natalPositions, null);
    const transit = buildRing('transit', 'Transit', transitPositions, natal.entries);
    const oracle = oracleMoment
        ? buildRing('oracle', 'Oracle moment', oracleMoment.positions, natal.entries)
        : null;
    const sunDegree = transit.entries[0]?.degree ?? natal.entries[0]?.degree ?? null;

    return Object.freeze({
        planets: MOD10_PLANETS,
        natal,
        transit,
        oracle,
        oracleMoment,
        activeDecanLabel: activeDecanLabel(sunDegree),
        privacyClass: 'protected_local_handle_only' as const
    });
}

export function readTransitPositions(profile: MathemeHarmonicProfileBoundary | null): readonly KairosRawPosition[] {
    if (!profile) {
        return Object.freeze([]);
    }
    const temporalNow =
        objectRecord(profile.payload.M4_Temporal_Now) ??
        objectRecord(profile.payload.m4TemporalNow) ??
        objectRecord(profile.payload.temporalNow);
    if (!temporalNow) {
        return Object.freeze([]);
    }
    return parsePositionPayload(readLiveKairosPayload(temporalNow));
}

export function activeOracleMoment(raw: unknown, nowMs = Date.now()): OracleMoment | null {
    const entries = parseOracleHistoryEntries(raw);
    for (const entry of entries) {
        const castAt = readCastDate(entry);
        if (!castAt) {
            continue;
        }
        const remainingMs = castAt.getTime() + ORACLE_DECAY_MS - nowMs;
        if (remainingMs <= 0) {
            continue;
        }
        const positions = parsePositionPayload(
            readKairoticKairosPayload(entry.kairosSnapshot) ??
            readKairoticKairosPayload(entry.kairos_snapshot) ??
            readKairoticKairosPayload(entry.M4_Temporal_Now) ??
            entry.temporalNow ??
            entry.planet_degrees ??
            entry.planetDegrees
        );
        if (positions.length !== MOD10_PLANETS.length) {
            continue;
        }
        const expiresAt = new Date(castAt.getTime() + ORACLE_DECAY_MS).toISOString();
        return Object.freeze({
            castHandle: stringValue(entry.castHandle ?? entry.handle ?? entry.id, 'oracle://active'),
            castAt: castAt.toISOString(),
            expiresAt,
            remainingMs,
            positions
        });
    }
    return null;
}

export function parsePositionPayload(raw: unknown): readonly KairosRawPosition[] {
    if (Array.isArray(raw)) {
        return positionsFromArray(raw);
    }
    const record = objectRecord(raw);
    if (!record) {
        return Object.freeze([]);
    }
    const nested =
        record.positions ??
        record.planet_positions ??
        record.planetPositions ??
        record.planet_degrees ??
        record.planetDegrees;
    if (Array.isArray(nested)) {
        return positionsFromArray(nested, record);
    }
    const byPlanet: KairosRawPosition[] = [];
    for (const planet of MOD10_PLANETS) {
        const value = record[planet.name] ?? record[planet.name.toLowerCase()];
        const degree = positionDegree(value);
        if (degree !== null) {
            byPlanet.push(Object.freeze({
                planet: planet.name,
                planetIndex: planet.index,
                degree,
                house: positionHouse(value)
            }));
        }
    }
    return Object.freeze(byPlanet.sort((left, right) => planetIndex(left) - planetIndex(right)));
}

function readLiveKairosPayload(temporalNow: Readonly<Record<string, unknown>>): unknown {
    const kairoticActive = temporalNow.kairotic_active === true || temporalNow.kairotic_active === 1 ||
        temporalNow.kairoticActive === true || temporalNow.kairoticActive === 1;
    const kairotic = objectRecord(temporalNow.kairotic);
    if (kairoticActive && kairotic) {
        return kairotic.planet_degrees ?? kairotic.planetDegrees ?? kairotic;
    }
    const realtime = objectRecord(temporalNow.realtime) ?? objectRecord(temporalNow.realTime);
    if (realtime) {
        return realtime.planet_degrees ?? realtime.planetDegrees ?? realtime;
    }
    return temporalNow.planet_degrees ?? temporalNow.planetDegrees ?? temporalNow;
}

function readKairoticKairosPayload(raw: unknown): unknown {
    const record = objectRecord(raw);
    if (!record) {
        return raw;
    }
    const kairotic = objectRecord(record.kairotic);
    if (kairotic) {
        return kairotic.planet_degrees ?? kairotic.planetDegrees ?? kairotic;
    }
    return record.planet_degrees ?? record.planetDegrees ?? record;
}

export function formatDegreeDms(degree: number | null): string {
    if (degree === null || !Number.isFinite(degree)) {
        return '--';
    }
    const totalSeconds = Math.round(normaliseDegree(degree) * 3600);
    const wholeDegrees = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${wholeDegrees}°${String(minutes).padStart(2, '0')}'${String(seconds).padStart(2, '0')}''`;
}

export function motionDelta(transitDegree: number | null, natalDegree: number | null): number | null {
    if (transitDegree === null || natalDegree === null) {
        return null;
    }
    const delta = ((normaliseDegree(transitDegree) - normaliseDegree(natalDegree) + 540) % 360) - 180;
    return Math.round(delta * 1000) / 1000;
}

function buildRing(
    kind: KairosRingKind,
    label: string,
    positions: readonly KairosRawPosition[],
    natalEntries: readonly KairosWheelEntry[] | null
): KairosWheelRing {
    const byIndex = new Map<number, KairosRawPosition>();
    for (const position of positions) {
        const index = planetIndex(position);
        if (index >= 0 && index < MOD10_PLANETS.length) {
            byIndex.set(index, position);
        }
    }
    const entries = MOD10_PLANETS.map(planet => {
        const raw = byIndex.get(planet.index);
        const degree = typeof raw?.degree === 'number' ? normaliseDegree(raw.degree) : null;
        const sign = degree === null ? null : ZODIAC_SIGNS[Math.floor(degree / 30) % 12];
        const house = clampHouse(raw?.house ?? (degree === null ? null : Math.floor(degree / 30) + 1));
        const angle = degree ?? planet.index * 36;
        const radius = RING_RADII[kind];
        const point = polarPoint(angle, radius);
        const natalDegree = natalEntries?.[planet.index]?.degree ?? null;
        const delta = kind === 'natal' ? null : motionDelta(degree, natalDegree);
        return Object.freeze({
            planet,
            degree,
            degreeText: formatDegreeDms(degree),
            sign,
            house,
            x: point.x,
            y: point.y,
            angle,
            motionDelta: delta,
            motionArrow: deltaArrow(delta)
        });
    });
    return Object.freeze({ kind, label, entries });
}

function positionsFromArray(raw: readonly unknown[], parent?: Readonly<Record<string, unknown>>): readonly KairosRawPosition[] {
    const houses = Array.isArray(parent?.houses) ? parent?.houses : [];
    const parsed: KairosRawPosition[] = [];
    raw.forEach((entry, fallbackIndex) => {
        const degree = positionDegree(entry);
        if (degree === null) {
            return;
        }
        const record = objectRecord(entry);
        const planetName = record ? stringValue(record.planet ?? record.name, '') : '';
        const planetIdx = record
            ? integerValue(record.planetIndex ?? record.planet_index ?? record.index) ?? fallbackIndex
            : fallbackIndex;
        parsed.push(Object.freeze({
            planet: planetName || MOD10_PLANETS[planetIdx]?.name,
            planetIndex: planetIdx,
            degree,
            house: positionHouse(entry) ?? integerValue(houses[fallbackIndex])
        }));
    });
    return Object.freeze(
        parsed
            .filter(position => planetIndex(position) >= 0 && planetIndex(position) < MOD10_PLANETS.length)
            .sort((left, right) => planetIndex(left) - planetIndex(right))
    );
}

function parseOracleHistoryEntries(raw: unknown): readonly Readonly<Record<string, unknown>>[] {
    if (Array.isArray(raw)) {
        return raw.map(objectRecord).filter(isRecord);
    }
    const record = objectRecord(raw);
    if (!record) {
        return Object.freeze([]);
    }
    const entries =
        record.activeOracleCast ? [record.activeOracleCast] :
            record.active_cast ? [record.active_cast] :
                record.current ? [record.current] :
                    record.history ?? record.casts ?? record.entries ?? record.items;
    if (Array.isArray(entries)) {
        return entries.map(objectRecord).filter(isRecord);
    }
    const single = objectRecord(entries);
    return single ? Object.freeze([single]) : Object.freeze([]);
}

function readCastDate(entry: Readonly<Record<string, unknown>>): Date | null {
    const value = entry.castAt ?? entry.cast_at ?? entry.createdAt ?? entry.created_at ?? entry.timestamp;
    const iso = stringValue(value, '');
    if (iso === '') {
        return null;
    }
    const parsed = new Date(iso);
    return Number.isFinite(parsed.getTime()) ? parsed : null;
}

function mergeTransitPositions(
    profile: MathemeHarmonicProfileBoundary | null,
    positions: readonly KairosRawPosition[]
): MathemeHarmonicProfileBoundary | null {
    if (!profile) {
        return profile;
    }
    return Object.freeze({
        ...profile,
        payload: Object.freeze({
            ...profile.payload,
            M4_Temporal_Now: Object.freeze({
                ...(objectRecord(profile.payload.M4_Temporal_Now) ?? {}),
                realtime: Object.freeze({
                    ...(objectRecord(objectRecord(profile.payload.M4_Temporal_Now)?.realtime) ?? {}),
                    kind: 'REALTIME',
                    captured_at_ns: Date.now() * 1_000_000,
                    planet_degrees: positions.map(position => position.degree)
                })
            })
        })
    });
}

function activeDecanLabel(sunDegree: number | null): string {
    if (sunDegree === null) {
        return 'Sun decan pending';
    }
    const sign = ZODIAC_SIGNS[Math.floor(normaliseDegree(sunDegree) / 30) % 12];
    const decan = Math.floor((normaliseDegree(sunDegree) % 30) / 10) + 1;
    return `${sign.glyph} ${sign.name} decan ${decan}`;
}

function polarPoint(degree: number, radius: number): { readonly x: number; readonly y: number } {
    const theta = (normaliseDegree(degree) - 90) * Math.PI / 180;
    return Object.freeze({
        x: Math.round((WHEEL_CENTER + Math.cos(theta) * radius) * 1000) / 1000,
        y: Math.round((WHEEL_CENTER + Math.sin(theta) * radius) * 1000) / 1000
    });
}

function positionDegree(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    const record = objectRecord(value);
    if (!record) {
        return null;
    }
    return numberValue(record.degree ?? record.degrees ?? record.longitude ?? record.lon);
}

function positionHouse(value: unknown): number | null {
    const record = objectRecord(value);
    if (!record) {
        return null;
    }
    return clampHouse(integerValue(record.house ?? record.houseNumber ?? record.house_number));
}

function planetIndex(position: KairosRawPosition): number {
    if (typeof position.planetIndex === 'number' && Number.isInteger(position.planetIndex)) {
        return position.planetIndex;
    }
    const name = position.planet ?? '';
    return MOD10_PLANETS.findIndex(planet => planet.name.toLowerCase() === name.toLowerCase());
}

function deltaArrow(delta: number | null): string | null {
    if (delta === null) {
        return null;
    }
    if (Math.abs(delta) < 0.001) {
        return '→';
    }
    return delta > 0 ? '↗' : '↘';
}

function formatCountdown(ms: number): string {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
}

function normaliseDegree(value: number): number {
    const wrapped = value % 360;
    return wrapped < 0 ? wrapped + 360 : wrapped;
}

function clampHouse(value: number | null | undefined): number | null {
    if (typeof value !== 'number' || !Number.isInteger(value)) {
        return null;
    }
    return value >= 1 && value <= 12 ? value : null;
}

function readProfileString(profile: MathemeHarmonicProfileBoundary | null, dottedNames: readonly string[]): string | null {
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
        const value = stringValue(current, '');
        if (value !== '') {
            return value;
        }
    }
    return null;
}

function numberValue(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function integerValue(value: unknown): number | null {
    return typeof value === 'number' && Number.isInteger(value) ? value : null;
}

function stringValue(value: unknown, fallback: string): string {
    return typeof value === 'string' && value.trim() !== '' ? value : fallback;
}

function objectRecord(value: unknown): Readonly<Record<string, unknown>> | null {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
        ? value as Readonly<Record<string, unknown>>
        : null;
}

function isRecord(value: Readonly<Record<string, unknown>> | null): value is Readonly<Record<string, unknown>> {
    return value !== null;
}

function isRing(value: KairosWheelRing | null): value is KairosWheelRing {
    return value !== null;
}
