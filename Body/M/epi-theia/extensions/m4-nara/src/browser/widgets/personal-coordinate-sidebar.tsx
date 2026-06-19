import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { CommandContribution, CommandRegistry } from '@theia/core/lib/common';
import { FrontendApplicationContribution } from '@theia/core/lib/browser';
import { PreferenceService } from '@theia/core/lib/browser/preferences';
import { AbstractViewContribution } from '@theia/core/lib/browser/shell/view-contribution';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    CoordinateContext,
    Disposable,
    EMPTY_COORDINATE_CONTEXT,
    MathemeHarmonicProfileBoundary,
    SharedBridgeAdapter,
    SHARED_BRIDGE_ADAPTER
} from '@pratibimba/m-extension-runtime';
import { EXTENSION_ID } from '../../common';
import type { ConjugateFormCharacter } from '../../common/nara-surface';
import { privacyChromeClass, SURFACE_PRIVACY_TOOLTIP } from '../privacy-chrome';

export const PERSONAL_COORDINATE_VIEW_ID = 'm4.nara.personalCoordinate';
export const PERSONAL_COORDINATE_LABEL = 'Personal Coordinate';
export const M4_PERSONAL_COORDINATE_BADGE_EXPORT = 'M4PersonalCoordinateBadge' as const;
export const PERSONAL_COORDINATE_ACTIVITY_BAR_SLOT = 'widget.application-shell-left';
export const PERSONAL_COORDINATE_OPEN_COMMAND_ID = 'm4.nara.personalCoordinate.open';
export const PERSONAL_COORDINATE_RESONANCE_PROFILE_FIELD = 'MathemeHarmonicProfileBoundary.resonance';
export const PERSONAL_COORDINATE_CONJUGATE_PROFILE_FIELD =
    'MathemeHarmonicProfileBoundary.conjugateFormCharacter';

const ACTIVE_LAYOUT_PREFERENCE = 'epi-logos.layout.active';
const DAILY_LAYOUT = 'daily-0-1';
const IDE_DEEP_LAYOUT = 'ide-deep';

export const PERSONAL_COORDINATE_ACTIVITY_BAR_MODE = Object.freeze({
    id: 'personal-coordinate',
    label: PERSONAL_COORDINATE_LABEL,
    iconClass: 'codicon-person',
    slot: PERSONAL_COORDINATE_ACTIVITY_BAR_SLOT,
    widgetId: PERSONAL_COORDINATE_VIEW_ID,
    availableInLayouts: Object.freeze([DAILY_LAYOUT]),
    hiddenInLayouts: Object.freeze([IDE_DEEP_LAYOUT])
});

export type PersonalCoordinateStatus = 'ready' | 'pending-profile' | 'pending-resonance';
export type PersonalCoordinateElementKey = 'earth' | 'water' | 'air' | 'fire';

export interface PersonalCoordinateElementGlyph {
    readonly key: PersonalCoordinateElementKey;
    readonly canonicalId: number;
    readonly label: 'Earth' | 'Water' | 'Air' | 'Fire';
    readonly glyph: string;
    readonly intensity: number;
}

export interface PersonalCoordinateChakraRef {
    readonly id: number;
    readonly name: string;
}

export interface PersonalCoordinatePlanetRef {
    readonly planetId: number;
    readonly name: string;
    readonly chakra: PersonalCoordinateChakraRef | null;
    readonly source: 'gateway' | 'sun-decan' | 'pending';
}

export interface PersonalCoordinateModel {
    readonly status: PersonalCoordinateStatus;
    readonly generation: number | null;
    readonly resonance: number | null;
    readonly resonanceLabel: string;
    readonly conjugateFormCharacter: ConjugateFormCharacter | null;
    readonly elements: readonly PersonalCoordinateElementGlyph[];
    readonly dominantElement: PersonalCoordinateElementGlyph | null;
    readonly dominantChakra: PersonalCoordinateChakraRef | null;
    readonly sunDegree: number | null;
    readonly sunDecanIndex: number | null;
    readonly sunDecanRulingPlanet: PersonalCoordinatePlanetRef;
    readonly sourceFields: readonly string[];
}

export interface M4PersonalCoordinateBadgeProps {
    readonly model: PersonalCoordinateModel;
}

export const L2_PERSONAL_ELEMENT_ORDER: readonly PersonalCoordinateElementGlyph[] = Object.freeze([
    Object.freeze({ key: 'earth', canonicalId: 1, label: 'Earth', glyph: '□', intensity: 0 }),
    Object.freeze({ key: 'water', canonicalId: 2, label: 'Water', glyph: '▽', intensity: 0 }),
    Object.freeze({ key: 'air', canonicalId: 3, label: 'Air', glyph: '△', intensity: 0 }),
    Object.freeze({ key: 'fire', canonicalId: 4, label: 'Fire', glyph: '▲', intensity: 0 })
]);

const CHAKRA_NAMES: readonly string[] = Object.freeze([
    'Muladhara',
    'Svadhisthana',
    'Manipura',
    'Anahata',
    'Vishuddha',
    'Ajna',
    'Bindu',
    'Sahasrara'
]);

const ELEMENT_CHAKRA_FALLBACK: Readonly<Record<PersonalCoordinateElementKey, number>> = Object.freeze({
    earth: 0,
    water: 1,
    air: 3,
    fire: 2
});

const PLANET_NAMES: readonly string[] = Object.freeze([
    'Sun',
    'Moon',
    'Mercury',
    'Venus',
    'Mars',
    'Jupiter',
    'Saturn',
    'Uranus',
    'Neptune',
    'Pluto'
]);

// Mirrors the current M3 CLOCK_DEGREE_LUT decan_chakra projection for the
// canonical seven decan rulers; transpersonal slots are present for tolerance.
const PLANET_CHAKRA_FALLBACK: readonly number[] = Object.freeze([6, 5, 4, 3, 2, 1, 0, 6, 7, 0]);

// M2'-SPEC/portal-core Chaldean decan ruler sequence, canonical planet ids.
const DECAN_RULERS_36: readonly number[] = Object.freeze([
    4, 0, 5, 0, 5, 4, 5, 4, 0, 3, 2, 6,
    2, 6, 3, 6, 3, 2, 2, 3, 6, 3, 6, 2,
    6, 2, 3, 1, 4, 5, 4, 5, 1, 5, 1, 4
]);

export const M4PersonalCoordinateBadge: React.FC<M4PersonalCoordinateBadgeProps> = ({ model }) => (
    <section
        className={`m4-personal-coordinate-card ${privacyChromeClass('protected_local')}`}
        data-test="M4PersonalCoordinateBadge"
        data-track="TRACK_08"
        data-export={M4_PERSONAL_COORDINATE_BADGE_EXPORT}
        data-view-id={PERSONAL_COORDINATE_VIEW_ID}
        data-status={model.status}
        data-profile-generation={model.generation ?? 'pending'}
        data-source-fields={model.sourceFields.join('|')}
        aria-label="Personal Coordinate"
    >
        <header className="m4-personal-coordinate-header">
            <h3>{PERSONAL_COORDINATE_LABEL}</h3>
            <span className="m4-personal-coordinate-privacy mext-privacy-protected-local">
                protected-local
            </span>
        </header>

        <dl className="m4-personal-coordinate-summary" data-test="m4-personal-coordinate-summary">
            <dt>Resonance</dt>
            <dd
                data-test="m4-personal-coordinate-resonance"
                data-source-field={PERSONAL_COORDINATE_RESONANCE_PROFILE_FIELD}
            >
                {model.resonanceLabel}
            </dd>
            <dt>ConjugateFormCharacter</dt>
            <dd
                data-test="m4-personal-coordinate-conjugate"
                data-source-field={PERSONAL_COORDINATE_CONJUGATE_PROFILE_FIELD}
            >
                {model.conjugateFormCharacter ?? 'pending'}
            </dd>
        </dl>

        <ol
            className="m4-personal-coordinate-elements"
            data-test="m4-personal-coordinate-elements"
            aria-label="Elemental balance"
        >
            {model.elements.map(element => (
                <li
                    key={element.key}
                    className="m4-personal-coordinate-element"
                    data-test="m4-personal-coordinate-element"
                    data-element={element.label}
                    data-element-id={element.canonicalId}
                    data-intensity={element.intensity.toFixed(3)}
                >
                    <span className="m4-personal-coordinate-element-glyph" aria-hidden="true">
                        {element.glyph}
                    </span>
                    <span className="m4-personal-coordinate-element-label">{element.label}</span>
                    <meter min={0} max={1} value={element.intensity}>
                        {formatPercent(element.intensity)}
                    </meter>
                    <span className="m4-personal-coordinate-element-value">
                        {formatPercent(element.intensity)}
                    </span>
                </li>
            ))}
        </ol>

        <dl className="m4-personal-coordinate-chakras" data-test="m4-personal-coordinate-chakras">
            <dt>Dominant chakra</dt>
            <dd
                data-test="m4-personal-coordinate-dominant-chakra"
                data-dominant-element={model.dominantElement?.label ?? 'pending'}
                data-chakra-id={model.dominantChakra?.id ?? 'pending'}
            >
                {model.dominantChakra
                    ? `${model.dominantChakra.name} (${model.dominantElement?.label ?? 'element pending'})`
                    : 'pending'}
            </dd>
            <dt>Sun decan chakra</dt>
            <dd
                data-test="m4-personal-coordinate-sun-decan-chakra"
                data-sun-degree={model.sunDegree ?? 'pending'}
                data-decan-index={model.sunDecanIndex ?? 'pending'}
                data-planet-id={model.sunDecanRulingPlanet.planetId}
                data-chakra-id={model.sunDecanRulingPlanet.chakra?.id ?? 'pending'}
            >
                {formatSunDecanPlanet(model.sunDecanRulingPlanet)}
            </dd>
        </dl>

        {model.status === 'pending-profile' ? (
            <p className="mext-widget-empty" data-test="m4-personal-coordinate-empty">
                Awaiting protected profile tick.
            </p>
        ) : null}
    </section>
);

@injectable()
export class PersonalCoordinateSidebarWidget extends ReactWidget {
    static readonly ID = PERSONAL_COORDINATE_VIEW_ID;
    static readonly LABEL = PERSONAL_COORDINATE_LABEL;

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    @inject(PreferenceService)
    protected readonly preferences!: PreferenceService;

    protected profile: MathemeHarmonicProfileBoundary | null = null;
    protected context: CoordinateContext = EMPTY_COORDINATE_CONTEXT;
    protected layoutMode = DAILY_LAYOUT;
    protected subscriptions: Disposable[] = [];

    @postConstruct()
    protected init(): void {
        this.id = PersonalCoordinateSidebarWidget.ID;
        this.title.label = PersonalCoordinateSidebarWidget.LABEL;
        this.title.caption = SURFACE_PRIVACY_TOOLTIP;
        this.title.iconClass = PERSONAL_COORDINATE_ACTIVITY_BAR_MODE.iconClass;
        this.title.closable = true;
        this.addClass('mext-widget');
        this.addClass('mext-widget-' + EXTENSION_ID);
        this.addClass('m4-nara-personal-coordinate');
        this.addClass(privacyChromeClass('protected_local'));

        this.layoutMode = this.preferences.get<string>(ACTIVE_LAYOUT_PREFERENCE, DAILY_LAYOUT);

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
            this.preferences.onPreferenceChanged(change => {
                if (change.preferenceName === ACTIVE_LAYOUT_PREFERENCE) {
                    this.layoutMode = this.preferences.get<string>(ACTIVE_LAYOUT_PREFERENCE, DAILY_LAYOUT);
                    this.update();
                }
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
        if (!isPersonalCoordinateVisibleInLayout(this.layoutMode)) {
            return (
                <div
                    className={`mext-widget-root ${privacyChromeClass('protected_local')}`}
                    data-test="m4-personal-coordinate-hidden"
                    data-layout-mode={this.layoutMode}
                    hidden
                />
            );
        }
        return (
            <div
                className={`mext-widget-root ${privacyChromeClass('protected_local')}`}
                data-test="m4-personal-coordinate-root"
                data-layout-mode={this.layoutMode}
            >
                <M4PersonalCoordinateBadge model={buildPersonalCoordinateModel(this.profile, this.context)} />
            </div>
        );
    }
}

@injectable()
export class M4PersonalCoordinateContribution
    extends AbstractViewContribution<PersonalCoordinateSidebarWidget>
    implements CommandContribution, FrontendApplicationContribution
{
    @inject(PreferenceService)
    protected readonly preferences!: PreferenceService;

    constructor() {
        super({
            widgetId: PersonalCoordinateSidebarWidget.ID,
            widgetName: PersonalCoordinateSidebarWidget.LABEL,
            defaultWidgetOptions: { area: 'left' },
            toggleCommandId: PERSONAL_COORDINATE_OPEN_COMMAND_ID
        });
    }

    async onStart(): Promise<void> {
        // Registered without auto-opening; the daily-0-1 activity-bar mode opens it.
    }

    override registerCommands(commands: CommandRegistry): void {
        super.registerCommands(commands);
        commands.registerCommand(
            { id: PERSONAL_COORDINATE_OPEN_COMMAND_ID, label: `${EXTENSION_ID}: open personal coordinate` },
            { execute: () => this.openView({ activate: true, reveal: true }) }
        );
    }

    override async openView(
        args?: Parameters<AbstractViewContribution<PersonalCoordinateSidebarWidget>['openView']>[0]
    ): Promise<PersonalCoordinateSidebarWidget> {
        if (!this.isPersonalCoordinateVisible()) {
            throw new Error('Personal Coordinate is visible only when epi-logos.layout.active = daily-0-1');
        }
        return super.openView(args);
    }

    isPersonalCoordinateVisible(): boolean {
        return isPersonalCoordinateVisibleInLayout(
            this.preferences.get<string>(ACTIVE_LAYOUT_PREFERENCE, DAILY_LAYOUT)
        );
    }
}

export function isPersonalCoordinateVisibleInLayout(layout: string): boolean {
    return layout === DAILY_LAYOUT;
}

export function buildPersonalCoordinateModel(
    profile: MathemeHarmonicProfileBoundary | null,
    context: CoordinateContext = EMPTY_COORDINATE_CONTEXT
): PersonalCoordinateModel {
    const resonance = clamp01(readResonance(profile));
    const conjugateFormCharacter = readConjugateFormCharacter(profile);
    const elements = readElementGlyphs(profile);
    const dominantElement = dominantElementFrom(elements);
    const dominantChakra = dominantElement ? chakraFromElement(profile, dominantElement.key) : null;
    const sunDegree = readSunDegree(profile);
    const sunDecanIndex = sunDegree === null ? null : Math.floor(normaliseDegree(sunDegree) / 10);
    const sunPlanetId = readSunDecanRulingPlanetId(profile, sunDecanIndex);
    const sunPlanet = sunPlanetId === null
        ? pendingPlanet()
        : planetRefFromId(profile, sunPlanetId, readPlanetChakraId(profile, sunPlanetId), 'sun-decan');
    const generation = profile?.generation ?? context.profileGeneration ?? null;
    return Object.freeze({
        status: profile
            ? resonance === null || conjugateFormCharacter === null ? 'pending-resonance' : 'ready'
            : 'pending-profile',
        generation,
        resonance,
        resonanceLabel: resonance === null ? 'pending-resonance' : resonance.toFixed(3),
        conjugateFormCharacter,
        elements,
        dominantElement,
        dominantChakra,
        sunDegree,
        sunDecanIndex,
        sunDecanRulingPlanet: sunPlanet,
        sourceFields: Object.freeze([
            PERSONAL_COORDINATE_RESONANCE_PROFILE_FIELD,
            PERSONAL_COORDINATE_CONJUGATE_PROFILE_FIELD,
            'personalPole.elementalBalance',
            'M4_Temporal_Now.planet_degrees[0]'
        ])
    });
}

function readResonance(profile: MathemeHarmonicProfileBoundary | null): number | null {
    const direct = readNumber(profile, ['resonance']);
    if (direct !== null) {
        return direct;
    }
    return readNumber(profile, [
        'resonance.score',
        'resonance.numeric',
        'personalPole.resonance.score',
        'personal_pole.resonance.score',
        'personalPoleResonance.score',
        'MathemeHarmonicProfileBoundary.resonance'
    ]);
}

function readConjugateFormCharacter(profile: MathemeHarmonicProfileBoundary | null): ConjugateFormCharacter | null {
    const value = readNested(profile, [
        'conjugateFormCharacter',
        'conjugate_form_character',
        'resonance.conjugateFormCharacter',
        'resonance.conjugate_form_character',
        'personalPole.resonance.conjugateFormCharacter',
        'personal_pole.resonance.conjugate_form_character',
        'MathemeHarmonicProfileBoundary.conjugateFormCharacter'
    ]);
    return normalizeConjugateFormCharacter(value);
}

function normalizeConjugateFormCharacter(value: unknown): ConjugateFormCharacter | null {
    if (value === 'Major' || value === 'Minor' || value === 'Shadow') {
        return value;
    }
    if (value === 'ShadowInversion' || value === 'shadow-inversion' || value === 'shadow_inversion') {
        return 'Shadow';
    }
    return null;
}

function readElementGlyphs(profile: MathemeHarmonicProfileBoundary | null): readonly PersonalCoordinateElementGlyph[] {
    const balance = readElementBalance(profile);
    return Object.freeze(
        L2_PERSONAL_ELEMENT_ORDER.map(element =>
            Object.freeze({
                ...element,
                intensity: clamp01(balance[element.key]) ?? 0
            })
        )
    );
}

function readElementBalance(
    profile: MathemeHarmonicProfileBoundary | null
): Readonly<Record<PersonalCoordinateElementKey, number | null>> {
    const source = objectRecord(readNested(profile, [
        'personalPole.elementalBalance',
        'personal_pole.elemental_balance',
        'elementalBalance',
        'elemental_balance',
        'ElementalBalance',
        'personalIdentity.elementalBalance',
        'personal_identity.elemental_balance'
    ]));
    return Object.freeze({
        earth: numberFromRecord(source, ['earth', 'Earth', 'prithvi']),
        water: numberFromRecord(source, ['water', 'Water', 'apas']),
        air: numberFromRecord(source, ['air', 'Air', 'vayu']),
        fire: numberFromRecord(source, ['fire', 'Fire', 'agni'])
    });
}

function dominantElementFrom(
    elements: readonly PersonalCoordinateElementGlyph[]
): PersonalCoordinateElementGlyph | null {
    let dominant: PersonalCoordinateElementGlyph | null = null;
    for (const element of elements) {
        if (!dominant || element.intensity > dominant.intensity) {
            dominant = element;
        }
    }
    return dominant && dominant.intensity > 0 ? dominant : null;
}

function chakraFromElement(
    profile: MathemeHarmonicProfileBoundary | null,
    element: PersonalCoordinateElementKey
): PersonalCoordinateChakraRef | null {
    const elementChakra = objectRecord(readNested(profile, [
        'ELEMENT_CHAKRA',
        'elementChakra',
        'element_chakra',
        'personalPole.elementChakra',
        'personal_pole.element_chakra'
    ]));
    const chakraId =
        numberFromRecord(elementChakra, [element, upperFirst(element)]) ??
        ELEMENT_CHAKRA_FALLBACK[element];
    return chakraRef(chakraId);
}

function readSunDegree(profile: MathemeHarmonicProfileBoundary | null): number | null {
    const temporalNow = objectRecord(readNested(profile, ['M4_Temporal_Now', 'm4TemporalNow', 'temporalNow']));
    const degrees = temporalNow ? readLiveKairosDegrees(temporalNow) : readNested(profile, ['planet_degrees', 'planetDegrees']);
    if (!Array.isArray(degrees)) {
        return null;
    }
    const sun = degrees[0];
    return typeof sun === 'number' && Number.isFinite(sun) ? normaliseDegree(sun) : null;
}

function readLiveKairosDegrees(temporalNow: Readonly<Record<string, unknown>>): unknown {
    const kairoticActive =
        temporalNow.kairotic_active === true ||
        temporalNow.kairotic_active === 1 ||
        temporalNow.kairoticActive === true ||
        temporalNow.kairoticActive === 1;
    const kairotic = objectRecord(temporalNow.kairotic);
    if (kairoticActive && kairotic) {
        return kairotic.planet_degrees ?? kairotic.planetDegrees;
    }
    const realtime = objectRecord(temporalNow.realtime) ?? objectRecord(temporalNow.realTime);
    if (realtime) {
        return realtime.planet_degrees ?? realtime.planetDegrees;
    }
    return temporalNow.planet_degrees ?? temporalNow.planetDegrees;
}

function readSunDecanRulingPlanetId(
    profile: MathemeHarmonicProfileBoundary | null,
    decanIndex: number | null
): number | null {
    const explicit = readNumber(profile, [
        'sunDecanRulingPlanetId',
        'sun_decan_ruling_planet_id',
        'M4_Temporal_Now.sun_decan_ruling_planet_id',
        'm4TemporalNow.sunDecanRulingPlanetId',
        'temporalNow.sunDecanRulingPlanetId'
    ]);
    if (explicit !== null) {
        return Math.trunc(explicit);
    }
    if (decanIndex === null || decanIndex < 0 || decanIndex >= DECAN_RULERS_36.length) {
        return null;
    }
    return DECAN_RULERS_36[decanIndex];
}

function readPlanetChakraId(profile: MathemeHarmonicProfileBoundary | null, planetId: number): number | null {
    const planetChakra = objectRecord(readNested(profile, [
        'PLANET_CHAKRA',
        'planetChakra',
        'planet_chakra',
        'personalPole.planetChakra',
        'personal_pole.planet_chakra'
    ]));
    const keyed =
        numberFromRecord(planetChakra, [String(planetId), PLANET_NAMES[planetId] ?? '', (PLANET_NAMES[planetId] ?? '').toLowerCase()]);
    return keyed ?? PLANET_CHAKRA_FALLBACK[planetId] ?? null;
}

function planetRefFromId(
    profile: MathemeHarmonicProfileBoundary | null,
    planetId: number,
    chakraId: number | null,
    source: PersonalCoordinatePlanetRef['source']
): PersonalCoordinatePlanetRef {
    const names = objectRecord(readNested(profile, ['planetNames', 'planet_names']));
    const name =
        stringFromRecord(names, [String(planetId)]) ??
        PLANET_NAMES[planetId] ??
        `planet ${planetId}`;
    return Object.freeze({
        planetId,
        name,
        chakra: chakraId === null ? null : chakraRef(chakraId),
        source
    });
}

function pendingPlanet(): PersonalCoordinatePlanetRef {
    return Object.freeze({
        planetId: -1,
        name: 'pending',
        chakra: null,
        source: 'pending'
    });
}

function chakraRef(id: number): PersonalCoordinateChakraRef {
    return Object.freeze({
        id,
        name: CHAKRA_NAMES[id] ?? `chakra ${id}`
    });
}

function formatSunDecanPlanet(planet: PersonalCoordinatePlanetRef): string {
    if (planet.source === 'pending') {
        return 'pending';
    }
    return planet.chakra ? `${planet.name} -> ${planet.chakra.name}` : `${planet.name} -> pending chakra`;
}

function formatPercent(value: number): string {
    return `${Math.round(value * 100)}%`;
}

function clamp01(value: number | null): number | null {
    if (value === null || !Number.isFinite(value)) {
        return null;
    }
    return Math.max(0, Math.min(1, value));
}

function normaliseDegree(value: number): number {
    const wrapped = value % 360;
    return wrapped < 0 ? wrapped + 360 : wrapped;
}

function readNumber(profile: MathemeHarmonicProfileBoundary | null, names: readonly string[]): number | null {
    const value = readNested(profile, names);
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function readNested(profile: MathemeHarmonicProfileBoundary | null, names: readonly string[]): unknown {
    if (!profile) {
        return undefined;
    }
    for (const dotted of names) {
        let current: unknown = profile.payload;
        for (const segment of dotted.split('.')) {
            if (!current || typeof current !== 'object' || Array.isArray(current) || !(segment in current)) {
                current = undefined;
                break;
            }
            current = (current as Record<string, unknown>)[segment];
        }
        if (current !== undefined && current !== null) {
            return current;
        }
    }
    return undefined;
}

function objectRecord(value: unknown): Readonly<Record<string, unknown>> | null {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value as Readonly<Record<string, unknown>>
        : null;
}

function numberFromRecord(record: Readonly<Record<string, unknown>> | null, names: readonly string[]): number | null {
    if (!record) {
        return null;
    }
    for (const name of names) {
        if (name === '') {
            continue;
        }
        const value = record[name];
        if (typeof value === 'number' && Number.isFinite(value)) {
            return value;
        }
    }
    return null;
}

function stringFromRecord(record: Readonly<Record<string, unknown>> | null, names: readonly string[]): string | null {
    if (!record) {
        return null;
    }
    for (const name of names) {
        if (name === '') {
            continue;
        }
        const value = record[name];
        if (typeof value === 'string' && value.trim() !== '') {
            return value;
        }
    }
    return null;
}

function upperFirst(value: string): string {
    return value.length === 0 ? value : value[0].toUpperCase() + value.slice(1);
}
