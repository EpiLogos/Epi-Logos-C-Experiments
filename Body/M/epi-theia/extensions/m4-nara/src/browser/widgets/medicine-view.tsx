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
import { privacyChromeClass, SURFACE_PRIVACY_TOOLTIP } from '../privacy-chrome';

// ---------------------------------------------------------------------------
// medicine-view identity (Tranche 25.10)
// ---------------------------------------------------------------------------

const MEDICINE_VIEW_ID = 'm4.nara.medicine';
const MEDICINE_LABEL = 'M4 Medicine';

/**
 * Snapshot RPC wraps `medicine.rs` LUTs + computations. The widget is a pure
 * CONSUMER (canvas spec §6.4 — "the briefing reads, it does not reinvent"): it
 * NEVER calls the prescribing or balancing routines locally. Every body-zone, decan
 * body-part, ruling-planet and element id arrives through this read.
 */
const SNAPSHOT_METHOD = 'nara.medicine.snapshot';

/**
 * The ONLY mutating RPC this widget is permitted to issue — pins a herb to the
 * day's NOW.md `c_4_pinned_materia` frontmatter array. Per UX §10.4 the body
 * holds veto power: the widget never writes a clinical directive, never mutates
 * Q_identity / Q_activity / M4-0 evidence.
 */
const PIN_METHOD = 'nara.medicine.pin';

/** Cross-link target — 25.15 Kairos display (full mod-10 planet wheel). */
const KAIROS_REVEAL_METHOD = 'nara.kairos.reveal';

/** Canonical mod-10 planet index for the Sun (PlanetState[0]). */
const SUN_INDEX = 0;

/**
 * L2' canonical element ids (post-Tranche 5.16). Earth=1, Water=2, Air=3,
 * Fire=4. Honoured in widget output so the rendered element labels agree with
 * the canonical `ELEMENT_CHAKRA` indices supplied by the gateway snapshot.
 */
export const L2_CANONICAL_ELEMENT_IDS: Readonly<Record<string, number>> = Object.freeze({
    Earth: 1,
    Water: 2,
    Air: 3,
    Fire: 4
});

const L2_ELEMENT_NAME_BY_ID: Readonly<Record<number, string>> = Object.freeze({
    1: 'Earth',
    2: 'Water',
    3: 'Air',
    4: 'Fire'
});

/** Muladhara → Sahasrara fallback ladder (8 rows; snapshot names win). */
const DEFAULT_CHAKRA_NAMES: readonly string[] = Object.freeze([
    'Muladhara',
    'Svadhisthana',
    'Manipura',
    'Anahata',
    'Vishuddha',
    'Ajna',
    'Bindu',
    'Sahasrara'
]);

// ---------------------------------------------------------------------------
// Snapshot shape (the typed mirror of the gateway response)
// ---------------------------------------------------------------------------

export interface ChakraLadderRow {
    /** 0..7, Muladhara (0) → Sahasrara (7). */
    readonly id: number;
    readonly name: string;
    /** L2' canonical element id (1..4) post-5.16; null when unmapped. */
    readonly dominantElementId: number | null;
    /** Body-zone strings sourced from `CHAKRA_BODY_ZONES[8]`. */
    readonly bodyZones: readonly string[];
}

export interface HerbEntry {
    readonly vernacular: string;
    readonly botanical: string;
}

export interface ZodiacalBridgeSign {
    readonly signName: string;
    /** `M0_M2_ZODIACAL_BRIDGE[12].decan_planets[3]` — three decan rulers. */
    readonly decanPlanets: readonly string[];
}

export interface MedicineSnapshot {
    /** `CHAKRA_BODY_ZONES[8]` projected with dominant element from `ELEMENT_CHAKRA`. */
    readonly chakras: readonly ChakraLadderRow[];
    /** `DECAN_BODY_PARTS[36]`. */
    readonly decanBodyParts: readonly string[];
    /** `DECAN_HERBS[36]` — herb list per decan. */
    readonly decanHerbs: readonly (readonly HerbEntry[])[];
    /** `M0_M2_ZODIACAL_BRIDGE[12]` — sign → three decan ruling planets. */
    readonly zodiacalBridge: readonly ZodiacalBridgeSign[];
    /** `PLANET_CHAKRA` — ruling-planet name → chakra id (active-chakra highlight). */
    readonly planetChakra: Readonly<Record<string, number>>;
    /** Glyphs keyed by planet name (display chrome only). */
    readonly planetGlyphs: Readonly<Record<string, string>>;
}

const EMPTY_SNAPSHOT: MedicineSnapshot = Object.freeze({
    chakras: Object.freeze([]) as readonly ChakraLadderRow[],
    decanBodyParts: Object.freeze([]) as readonly string[],
    decanHerbs: Object.freeze([]) as readonly (readonly HerbEntry[])[],
    zodiacalBridge: Object.freeze([]) as readonly ZodiacalBridgeSign[],
    planetChakra: Object.freeze({}) as Readonly<Record<string, number>>,
    planetGlyphs: Object.freeze({}) as Readonly<Record<string, string>>
});

// ---------------------------------------------------------------------------
// Pure decan geometry — index arithmetic only, NOT a medicine computation.
// Exported so the active-decan rotation test can drive it with a synthetic
// `M4_Temporal_Now.planet_degrees[Sun]`.
// ---------------------------------------------------------------------------

export interface ActiveDecan {
    /** Normalised sun longitude 0..359.999. */
    readonly sunDegree: number;
    /** Zodiac sign index 0..11. */
    readonly signIdx: number;
    /** Decan within the sign 0..2. */
    readonly decanInSign: number;
    /** Decan index across the wheel 0..35. */
    readonly decanIdx: number;
}

export function computeActiveDecan(sunDegree: number): ActiveDecan {
    const normalised = normaliseDegree(sunDegree);
    const signIdx = Math.floor(normalised / 30) % 12;
    const decanInSign = Math.floor((normalised % 30) / 10);
    const decanIdx = signIdx * 3 + decanInSign;
    return { sunDegree: normalised, signIdx, decanInSign, decanIdx };
}

function normaliseDegree(value: number): number {
    if (!Number.isFinite(value)) {
        return 0;
    }
    const wrapped = value % 360;
    return wrapped < 0 ? wrapped + 360 : wrapped;
}

/** Reads `M4_Temporal_Now.planet_degrees[Sun]` from the bridge profile payload. */
export function readSunDegree(profile: MathemeHarmonicProfileBoundary | null): number | null {
    if (!profile) {
        return null;
    }
    const temporalNow =
        objectRecord(profile.payload.M4_Temporal_Now) ??
        objectRecord(profile.payload.m4TemporalNow) ??
        objectRecord(profile.payload.temporalNow);
    if (!temporalNow) {
        return null;
    }
    const degrees = temporalNow.planet_degrees ?? temporalNow.planetDegrees;
    if (!Array.isArray(degrees)) {
        return null;
    }
    const sun = degrees[SUN_INDEX];
    return typeof sun === 'number' && Number.isFinite(sun) ? sun : null;
}

// ---------------------------------------------------------------------------
// Briefing — the value-object the card renders. Derived purely by indexing the
// snapshot LUTs with the locally-computed decan index (no reinvention).
// ---------------------------------------------------------------------------

export interface MedicineBriefing {
    readonly active: ActiveDecan;
    readonly bodyPart: string | null;
    readonly rulingPlanet: string | null;
    readonly rulingPlanetGlyph: string | null;
    readonly activeChakraId: number | null;
    readonly herbs: readonly HerbEntry[];
}

export function buildMedicineBriefing(
    snapshot: MedicineSnapshot,
    sunDegree: number | null
): MedicineBriefing | null {
    if (sunDegree === null) {
        return null;
    }
    const active = computeActiveDecan(sunDegree);
    const bodyPart = indexOrNull(snapshot.decanBodyParts, active.decanIdx);
    const sign = snapshot.zodiacalBridge[active.signIdx];
    const rulingPlanet = sign ? indexOrNull(sign.decanPlanets, active.decanInSign) : null;
    const rulingPlanetGlyph =
        rulingPlanet !== null ? snapshot.planetGlyphs[rulingPlanet] ?? null : null;
    const activeChakraId =
        rulingPlanet !== null && rulingPlanet in snapshot.planetChakra
            ? snapshot.planetChakra[rulingPlanet]
            : null;
    const herbs = (snapshot.decanHerbs[active.decanIdx] ?? []) as readonly HerbEntry[];
    return { active, bodyPart, rulingPlanet, rulingPlanetGlyph, activeChakraId, herbs };
}

function indexOrNull<T>(list: readonly T[], index: number): T | null {
    return index >= 0 && index < list.length ? list[index] : null;
}

// ---------------------------------------------------------------------------
// M4MedicineCard — TRACK_08 export. Presentational; receives data + handlers.
// ---------------------------------------------------------------------------

export interface M4MedicineCardProps {
    readonly snapshot: MedicineSnapshot;
    readonly briefing: MedicineBriefing | null;
    readonly pinnedHerbs: ReadonlySet<string>;
    readonly status: 'pending' | 'ready' | 'error';
    readonly onPinHerb: (herb: HerbEntry) => void;
    readonly onRevealKairos: () => void;
}

export const M4MedicineCard: React.FC<M4MedicineCardProps> = props => {
    const { snapshot, briefing, pinnedHerbs, status, onPinHerb, onRevealKairos } = props;
    const [expandedChakras, setExpandedChakras] = React.useState<ReadonlySet<number>>(
        () => new Set<number>()
    );

    const toggleChakra = React.useCallback((chakraId: number) => {
        setExpandedChakras(previous => {
            const next = new Set(previous);
            if (next.has(chakraId)) {
                next.delete(chakraId);
            } else {
                next.add(chakraId);
            }
            return next;
        });
    }, []);

    const chakras = snapshot.chakras.length > 0 ? snapshot.chakras : fallbackChakraRows();
    const activeChakraId = briefing?.activeChakraId ?? null;

    return (
        <div
            className={`m4-medicine-card ${privacyChromeClass('protected_local')}`}
            data-test="m4-medicine-card"
            data-privacy-chrome-class="mext-privacy-protected-local"
            data-status={status}
        >
            {/* Panel A — Chakra ladder */}
            <section className="m4-medicine-panel m4-medicine-chakra-ladder" aria-label="Chakra ladder">
                <h3>Chakra ladder</h3>
                <ol className="m4-medicine-ladder" data-test="m4-medicine-ladder">
                    {chakras.map(row => {
                        const elementName = elementLabel(row.dominantElementId);
                        const isActive = activeChakraId !== null && row.id === activeChakraId;
                        const isExpanded = expandedChakras.has(row.id);
                        return (
                            <li
                                key={row.id}
                                className={chakraRowClass(isActive)}
                                data-test="m4-medicine-chakra-row"
                                data-chakra-id={row.id}
                                data-active={isActive ? 'true' : 'false'}
                            >
                                <button
                                    type="button"
                                    className="m4-medicine-chakra-head"
                                    aria-expanded={isExpanded}
                                    data-test="m4-medicine-chakra-toggle"
                                    onClick={() => toggleChakra(row.id)}
                                >
                                    <span className="m4-medicine-chakra-name">{row.name}</span>
                                    <span
                                        className="m4-medicine-chakra-element"
                                        data-element-id={row.dominantElementId ?? ''}
                                    >
                                        {elementName}
                                    </span>
                                    <span className="m4-medicine-chakra-count">
                                        {row.bodyZones.length} zones
                                    </span>
                                </button>
                                {isExpanded && (
                                    <ul
                                        className="m4-medicine-zone-list"
                                        data-test="m4-medicine-zone-list"
                                    >
                                        {row.bodyZones.map((zone, zoneIdx) => (
                                            <li key={`${row.id}-${zoneIdx}`} data-test="m4-medicine-zone">
                                                {zone}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        );
                    })}
                </ol>
            </section>

            {/* Panel B — Active decan */}
            <section className="m4-medicine-panel m4-medicine-active-decan" aria-label="Active decan">
                <h3>Active decan</h3>
                {briefing ? (
                    <dl data-test="m4-medicine-decan">
                        <dt>Decan</dt>
                        <dd data-test="m4-medicine-decan-index">
                            #{briefing.active.decanIdx} (sign {briefing.active.signIdx}, decan{' '}
                            {briefing.active.decanInSign})
                        </dd>
                        <dt>Body part</dt>
                        <dd data-test="m4-medicine-decan-body-part">{briefing.bodyPart ?? '—'}</dd>
                        <dt>Ruling planet</dt>
                        <dd data-test="m4-medicine-decan-planet">
                            <span className="m4-medicine-planet-glyph" aria-hidden="true">
                                {briefing.rulingPlanetGlyph ?? ''}
                            </span>
                            <span>{briefing.rulingPlanet ?? '—'}</span>
                        </dd>
                    </dl>
                ) : (
                    <p className="mext-widget-empty" data-test="m4-medicine-decan-pending">
                        Awaiting a kairos sun position from the bridge profile.
                    </p>
                )}
                <button
                    type="button"
                    className="m4-medicine-kairos-link"
                    data-test="m4-medicine-kairos-link"
                    onClick={onRevealKairos}
                >
                    Open Kairos wheel →
                </button>
            </section>

            {/* Panel C — Herbalism (evidence, not authority) */}
            <section className="m4-medicine-panel m4-medicine-herbalism" aria-label="Herbalism">
                <h3>Herbalism</h3>
                <p className="m4-medicine-evidence-note" data-test="m4-medicine-evidence-note">
                    Evidence, not authority — the body holds veto power. No clinical directive is written.
                </p>
                {briefing && briefing.herbs.length > 0 ? (
                    <ul className="m4-medicine-herb-list" data-test="m4-medicine-herb-list">
                        {briefing.herbs.map((herb, herbIdx) => {
                            const pinned = pinnedHerbs.has(herbKey(herb));
                            return (
                                <li
                                    key={`${herb.botanical}-${herbIdx}`}
                                    className="m4-medicine-herb"
                                    data-test="m4-medicine-herb"
                                >
                                    <span className="m4-medicine-herb-vernacular">{herb.vernacular}</span>
                                    <em className="m4-medicine-herb-botanical">{herb.botanical}</em>
                                    <button
                                        type="button"
                                        className="m4-medicine-herb-pin"
                                        aria-pressed={pinned}
                                        disabled={pinned}
                                        data-test="m4-medicine-herb-pin"
                                        onClick={() => onPinHerb(herb)}
                                    >
                                        {pinned ? 'Pinned' : 'Pin to NOW'}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className="mext-widget-empty" data-test="m4-medicine-herb-empty">
                        No herbal correspondences for the active decan yet.
                    </p>
                )}
            </section>
        </div>
    );
};

function fallbackChakraRows(): readonly ChakraLadderRow[] {
    return DEFAULT_CHAKRA_NAMES.map((name, id) =>
        Object.freeze({ id, name, dominantElementId: null, bodyZones: [] as readonly string[] })
    );
}

function elementLabel(elementId: number | null): string {
    if (elementId === null) {
        return '—';
    }
    return L2_ELEMENT_NAME_BY_ID[elementId] ?? `element ${elementId}`;
}

function chakraRowClass(active: boolean): string {
    const classes = ['m4-medicine-chakra'];
    if (active) {
        // Gold border for the chakra activated by the current sun → decan → planet.
        classes.push('m4-medicine-chakra-active');
    }
    return classes.join(' ');
}

function herbKey(herb: HerbEntry): string {
    return herb.botanical || herb.vernacular;
}

// ---------------------------------------------------------------------------
// MedicineView — the ReactWidget host. Owns bridge subscriptions, snapshot
// fetch, kairos-delta refresh, and the single allowed pin-materia write.
// ---------------------------------------------------------------------------

@injectable()
export class MedicineView extends ReactWidget {
    static readonly ID = MEDICINE_VIEW_ID;
    static readonly LABEL = MEDICINE_LABEL;

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    protected profile: MathemeHarmonicProfileBoundary | null = null;
    protected context: CoordinateContext = EMPTY_COORDINATE_CONTEXT;
    protected snapshot: MedicineSnapshot = EMPTY_SNAPSHOT;
    protected status: 'pending' | 'ready' | 'error' = 'pending';
    protected pinnedHerbs: Set<string> = new Set<string>();
    protected subscriptions: Disposable[] = [];

    /** Last sun degree a snapshot was fetched for — guards redundant refetches. */
    protected lastFetchedSunDegree: number | null = null;

    @postConstruct()
    protected init(): void {
        this.id = MedicineView.ID;
        this.title.label = MedicineView.LABEL;
        this.title.caption = SURFACE_PRIVACY_TOOLTIP;
        this.title.closable = true;
        this.addClass('mext-widget');
        this.addClass('mext-widget-m4-nara');
        this.addClass('m4-nara-medicine');
        // Privacy chrome — protected-local handle-only surface.
        this.addClass(privacyChromeClass('protected_local'));

        this.subscriptions.push(
            this.bridge.onProfile(profile => {
                this.profile = profile;
                // A Tranche 19.12 kairos delta arrives as a profile update; the
                // active decan re-fires whenever the sun position moves.
                this.refreshSnapshotForKairos();
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
        const sunDegree = readSunDegree(this.profile);
        const briefing = buildMedicineBriefing(this.snapshot, sunDegree);
        return (
            <div
                className={`mext-widget-root ${privacyChromeClass('protected_local')}`}
                data-test="m4-medicine-root"
            >
                <M4MedicineCard
                    snapshot={this.snapshot}
                    briefing={briefing}
                    pinnedHerbs={this.pinnedHerbs}
                    status={this.status}
                    onPinHerb={herb => this.pinHerb(herb)}
                    onRevealKairos={() => this.revealKairos()}
                />
            </div>
        );
    }

    /** Re-fetch the medicine snapshot when the kairos sun position changes. */
    protected refreshSnapshotForKairos(): void {
        const sunDegree = readSunDegree(this.profile);
        if (sunDegree === null) {
            return;
        }
        if (this.status === 'ready' && this.lastFetchedSunDegree === sunDegree) {
            return;
        }
        const active = computeActiveDecan(sunDegree);
        this.lastFetchedSunDegree = sunDegree;
        void this.bridge
            .invokeGatewayRpc(SNAPSHOT_METHOD, {
                sunDegree: active.sunDegree,
                decanIdx: active.decanIdx,
                privacyClass: 'protected_local_handle_only'
            })
            .then(raw => {
                this.snapshot = parseSnapshot(raw);
                this.status = 'ready';
                this.update();
            })
            .catch(() => {
                this.status = 'error';
                this.update();
            });
    }

    /**
     * The single permitted write — pins a herb to today's NOW.md
     * `c_4_pinned_materia` array. Never a clinical directive; never touches
     * Q_identity / Q_activity / M4-0 evidence.
     */
    protected pinHerb(herb: HerbEntry): void {
        const key = herbKey(herb);
        if (this.pinnedHerbs.has(key)) {
            return;
        }
        this.pinnedHerbs.add(key);
        this.update();
        void this.bridge
            .invokeGatewayRpc(PIN_METHOD, {
                dayNowSessionHandle: this.context.dayNowSessionHandle,
                materia: { vernacular: herb.vernacular, botanical: herb.botanical },
                frontmatterKey: 'c_4_pinned_materia',
                privacyClass: 'protected_local_handle_only'
            })
            .catch(() => {
                // Pin stays optimistic locally if the gateway shim is offline.
            });
    }

    /** Cross-link to the 25.15 Kairos display (full mod-10 planet wheel). */
    protected revealKairos(): void {
        void this.bridge
            .invokeGatewayRpc(KAIROS_REVEAL_METHOD, {
                source: 'm4-nara.medicine',
                sunDegree: readSunDegree(this.profile)
            })
            .catch(() => {
                // Navigation is best-effort while 25.15 is spec-ahead.
            });
    }
}

// ---------------------------------------------------------------------------
// Defensive snapshot parsing — the RPC returns `unknown`.
// ---------------------------------------------------------------------------

function parseSnapshot(raw: unknown): MedicineSnapshot {
    const record = objectRecord(raw);
    if (!record) {
        return EMPTY_SNAPSHOT;
    }
    return Object.freeze({
        chakras: parseChakras(record.chakras),
        decanBodyParts: parseStringArray(record.decanBodyParts ?? record.decan_body_parts),
        decanHerbs: parseDecanHerbs(record.decanHerbs ?? record.decan_herbs),
        zodiacalBridge: parseZodiacalBridge(record.zodiacalBridge ?? record.zodiacal_bridge),
        planetChakra: parseNumberMap(record.planetChakra ?? record.planet_chakra),
        planetGlyphs: parseStringMap(record.planetGlyphs ?? record.planet_glyphs)
    });
}

function parseChakras(value: unknown): readonly ChakraLadderRow[] {
    if (!Array.isArray(value)) {
        return EMPTY_SNAPSHOT.chakras;
    }
    const rows: ChakraLadderRow[] = [];
    value.forEach((entry, fallbackId) => {
        const record = objectRecord(entry);
        if (!record) {
            return;
        }
        const id = numberValue(record.id) ?? fallbackId;
        const name = stringValue(record.name) ?? DEFAULT_CHAKRA_NAMES[id] ?? `Chakra ${id}`;
        rows.push(
            Object.freeze({
                id,
                name,
                dominantElementId:
                    numberValue(record.dominantElementId ?? record.dominant_element_id),
                bodyZones: parseStringArray(record.bodyZones ?? record.body_zones)
            })
        );
    });
    return Object.freeze(rows);
}

function parseDecanHerbs(value: unknown): readonly (readonly HerbEntry[])[] {
    if (!Array.isArray(value)) {
        return EMPTY_SNAPSHOT.decanHerbs;
    }
    return Object.freeze(
        value.map(group => {
            if (!Array.isArray(group)) {
                return Object.freeze([] as HerbEntry[]);
            }
            const herbs: HerbEntry[] = [];
            for (const entry of group) {
                const record = objectRecord(entry);
                if (!record) {
                    continue;
                }
                herbs.push(
                    Object.freeze({
                        vernacular: stringValue(record.vernacular) ?? '',
                        botanical: stringValue(record.botanical) ?? ''
                    })
                );
            }
            return Object.freeze(herbs);
        })
    );
}

function parseZodiacalBridge(value: unknown): readonly ZodiacalBridgeSign[] {
    if (!Array.isArray(value)) {
        return EMPTY_SNAPSHOT.zodiacalBridge;
    }
    const signs: ZodiacalBridgeSign[] = [];
    for (const entry of value) {
        const record = objectRecord(entry);
        if (!record) {
            continue;
        }
        signs.push(
            Object.freeze({
                signName: stringValue(record.signName ?? record.sign_name) ?? '',
                decanPlanets: parseStringArray(record.decanPlanets ?? record.decan_planets)
            })
        );
    }
    return Object.freeze(signs);
}

function parseStringArray(value: unknown): readonly string[] {
    if (!Array.isArray(value)) {
        return Object.freeze([] as string[]);
    }
    return Object.freeze(value.filter((entry): entry is string => typeof entry === 'string'));
}

function parseNumberMap(value: unknown): Readonly<Record<string, number>> {
    const record = objectRecord(value);
    if (!record) {
        return EMPTY_SNAPSHOT.planetChakra;
    }
    const out: Record<string, number> = {};
    for (const [key, entry] of Object.entries(record)) {
        const numeric = numberValue(entry);
        if (numeric !== null) {
            out[key] = numeric;
        }
    }
    return Object.freeze(out);
}

function parseStringMap(value: unknown): Readonly<Record<string, string>> {
    const record = objectRecord(value);
    if (!record) {
        return EMPTY_SNAPSHOT.planetGlyphs;
    }
    const out: Record<string, string> = {};
    for (const [key, entry] of Object.entries(record)) {
        const text = stringValue(entry);
        if (text !== null) {
            out[key] = text;
        }
    }
    return Object.freeze(out);
}

function objectRecord(value: unknown): Readonly<Record<string, unknown>> | null {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return null;
    }
    return value as Readonly<Record<string, unknown>>;
}

function numberValue(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function stringValue(value: unknown): string | null {
    return typeof value === 'string' ? value : null;
}
