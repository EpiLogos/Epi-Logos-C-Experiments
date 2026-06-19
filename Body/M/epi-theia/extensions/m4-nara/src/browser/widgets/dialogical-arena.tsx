import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    CoordinateContext,
    Disposable,
    EMPTY_COORDINATE_CONTEXT,
    MExtensionMiniMode,
    MExtensionReadinessSnapshot,
    MObservabilityEvent,
    PENDING_M_READINESS,
    SharedBridgeAdapter,
    SHARED_BRIDGE_ADAPTER
} from '@pratibimba/m-extension-runtime';
import { EXTENSION_ID } from '../../common';
import { privacyChromeClass, SURFACE_PRIVACY_TOOLTIP } from '../privacy-chrome';
import {
    M4MercuriusRelayChip,
    MercuriusRelayState,
    applyMercuriusDelta,
    initialRelayState,
    setKairosEnabled
} from './mercurius-relay-indicator';

export const DIALOGICAL_ARENA_VIEW_ID = 'm4.nara.dialogicalArena';
export const DIALOGICAL_ARENA_LABEL = 'M4 Dialogical Arena';

/**
 * Track 08 compact export name. Composition (Track 08) places this card into the
 * `plugin-integrated-4-5-0` composition per Tranche 15.4 with three mini-modes:
 * `badge` (active-scene count), `compact-card` (current-scene summary with a
 * class-distribution chip) and `inspector` (the full arena widget).
 */
export const M4_DIALOGICAL_ARENA_CARD_EXPORT = 'M4DialogicalArenaCard' as const;

/* ------------------------------------------------------------------ *
 * Gateway RPC surface (Track 03 protected-local Nara service path).
 * ------------------------------------------------------------------ */

/** List open arena scenes — invoked with `{ status: 'open' }`. */
export const ARENA_LIST_RPC = 'm4.arena.list';
/** Warm Vama Shakti inventory for the right-rail admission strip. */
export const ARENA_WARM_LIST_RPC = 'm4.arena.vama_list_warm';
/** Open a new scene — invoked ONLY from the scene-setup wizard's CPF gate. */
export const ARENA_SCENE_OPEN_RPC = 'm4.arena.scene_open';
/** Admit a warm Vama Shakti into the active scene. */
export const ARENA_ADMIT_RPC = 'm4.arena.admit';
/** Release an admitted Vama Shakti back to the warm inventory. */
export const ARENA_RELEASE_RPC = 'm4.arena.release';
/** Append a Trika-0 (user) utterance to the active scene. */
export const ARENA_UTTERANCE_RPC = 'm4.arena.utter';
/** Observability `type`/`kind` carried by the arena scene-state stream. */
export const ARENA_SUBSCRIBE_KIND = 'm4.arena.subscribe';
/** Mercurius kairos delta `kind` reused for the live kairos ring (25.16). */
export const ARENA_KAIROS_DELTA_KIND = 'mercurius.kairos.delta';

/**
 * Anti-leak invariant. The summon RPC mints a *new* Vama Shakti and MUST NEVER
 * be invoked directly by this widget — every summon must flow through the
 * scene-setup wizard's Anima brainstorm at CPF (00/00). The constant is exported
 * only so the contract test can assert the widget never calls it outside the
 * gate; see {@link assertSummonGate}.
 */
export const ARENA_SUMMON_RPC = 'm4.arena.summon';

/* ------------------------------------------------------------------ *
 * Classifier vocabulary (Vama Shakti classes + glyphs).
 *
 * Glyphs are provisional pending the 41.1 contract finalisation; they are
 * centralised here so the final marks swap in one place.
 * ------------------------------------------------------------------ */

export type VamaShaktiClass = 'egregore' | 'sprite' | 'daemon' | 'mantra';

export const VAMA_SHAKTI_CLASSES = Object.freeze([
    'egregore',
    'sprite',
    'daemon',
    'mantra'
]) as readonly VamaShaktiClass[];

/** Classes that may be summoned/admitted as individuated voices (non-chorus). */
export const NON_EGREGORE_CLASSES = Object.freeze([
    'sprite',
    'daemon',
    'mantra'
]) as readonly VamaShaktiClass[];

/**
 * Classifier glyphs (provisional, 41.1 TBD):
 * - egregore = ◍ chorus mark
 * - sprite   = ✦ spark mark
 * - daemon   = ◐ half-circle inscribed
 * - mantra   = 〰 wave mark
 */
export const CLASSIFIER_GLYPHS = Object.freeze({
    egregore: '◍',
    sprite: '✦',
    daemon: '◐',
    mantra: '〰'
} satisfies Readonly<Record<VamaShaktiClass, string>>);

const UNKNOWN_GLYPH = '○';

export function isVamaShaktiClass(value: unknown): value is VamaShaktiClass {
    return typeof value === 'string' && (VAMA_SHAKTI_CLASSES as readonly string[]).includes(value);
}

/** Resolve the classifier glyph for a class, falling back to a neutral mark. */
export function glyphForClass(value: unknown): string {
    return isVamaShaktiClass(value) ? CLASSIFIER_GLYPHS[value] : UNKNOWN_GLYPH;
}

/**
 * Default classifier suggested from a Form's coordinate-family hint (the wizard
 * pre-selects this; the user may override per admission). Provisional mapping
 * pending 41.1; documented so the override path is always honoured.
 */
export function suggestVamaShaktiClass(coordinateFamily: string | null | undefined): VamaShaktiClass {
    switch ((coordinateFamily ?? '').trim().charAt(0).toUpperCase()) {
        case 'M': // Subsystem / consciousness domain → collective chorus
            return 'egregore';
        case 'T': // Thought / artifact → spoken mantra
            return 'mantra';
        case 'S': // Stack / technology → daemon process
            return 'daemon';
        case 'P': // Position / functional → individuated spark
        case 'C': // Category / ontological → individuated spark
        case 'L': // Lens / epistemic → individuated spark
        default:
            return 'sprite';
    }
}

/* ------------------------------------------------------------------ *
 * Privacy manifest.
 * ------------------------------------------------------------------ */

/**
 * The arena is protected-local handle-only. `protectedBodiesProjected: false` is
 * the load-bearing invariant: medicine/body-zone projections never cross the
 * privacy-filtered bridge into the dialogical surface.
 */
export const ARENA_PRIVACY_MANIFEST = Object.freeze({
    privacyClass: 'protected_local_handle_only' as const,
    protectedBodiesProjected: false as const
});

/* ------------------------------------------------------------------ *
 * Data model.
 * ------------------------------------------------------------------ */

export type ArenaSceneStatus = 'open' | 'closed' | 'archived';

export type ArenaSpeakerKind = 'vama_shakti' | 'constitutional' | 'user';

export interface ArenaVamaShakti {
    readonly key: string;
    readonly name: string;
    readonly vamaShaktiClass: VamaShaktiClass;
    readonly vakAddress: string | null;
}

export interface ArenaConstitutional {
    readonly key: string;
    readonly name: string;
}

export interface ArenaTurn {
    readonly key: string;
    readonly speakerKind: ArenaSpeakerKind;
    readonly speakerName: string;
    readonly vamaShaktiClass: VamaShaktiClass | null;
    readonly vakAddress: string | null;
    readonly kairosDelta: string | null;
    readonly line: string;
}

export interface ArenaScene {
    readonly sceneKey: string;
    readonly status: ArenaSceneStatus;
    readonly title: string;
    readonly pinnedCoordinate: string | null;
    readonly admittedVamaShaktis: readonly ArenaVamaShakti[];
    readonly admittedConstitutionals: readonly ArenaConstitutional[];
    readonly userTrika0Present: boolean;
    readonly turns: readonly ArenaTurn[];
    readonly privacyClass: 'protected_local_handle_only';
}

export interface WarmVamaShakti {
    readonly key: string;
    readonly name: string;
    readonly vamaShaktiClass: VamaShaktiClass;
    readonly suggestedFromForm: boolean;
}

export type ClassDistribution = Readonly<Record<VamaShaktiClass, number>>;

export interface ArenaSceneSummary {
    readonly sceneKey: string;
    readonly status: ArenaSceneStatus;
    readonly title: string;
    readonly pinnedCoordinate: string | null;
    readonly vamaShaktiCount: number;
    readonly turnCount: number;
    readonly classDistribution: ClassDistribution;
}

/** Constitutional agent roster (Anima root + six children) per S4' canon. */
export const CONSTITUTIONAL_AGENTS = Object.freeze([
    { key: 'anima', name: 'Anima' },
    { key: 'nous', name: 'Nous' },
    { key: 'logos', name: 'Logos' },
    { key: 'eros', name: 'Eros' },
    { key: 'mythos', name: 'Mythos' },
    { key: 'psyche', name: 'Psyche' },
    { key: 'sophia', name: 'Sophia' }
]) as readonly ArenaConstitutional[];

/* ------------------------------------------------------------------ *
 * Scene-setup wizard state + CPF (00/00) brainstorm gate.
 * ------------------------------------------------------------------ */

export interface SceneSetupAdmission {
    readonly vamaShaktiKey: string;
    readonly name: string;
    readonly vamaShaktiClass: VamaShaktiClass;
    readonly classOverridden: boolean;
}

export interface SceneSetupLifecycle {
    readonly autoArchiveOnClose: boolean;
    readonly kairosLinked: boolean;
}

export const DEFAULT_SCENE_LIFECYCLE: SceneSetupLifecycle = Object.freeze({
    autoArchiveOnClose: true,
    kairosLinked: false
});

export interface SceneSetupState {
    readonly active: boolean;
    /** Anima CPF (00/00) brainstorm completion — the non-bypassable gate. */
    readonly brainstormConfirmed: boolean;
    readonly pinnedCoordinate: string | null;
    readonly admissions: readonly SceneSetupAdmission[];
    readonly constitutionalParticipation: readonly string[];
    readonly lifecycle: SceneSetupLifecycle;
}

export function initialSceneSetupState(): SceneSetupState {
    return Object.freeze({
        active: false,
        brainstormConfirmed: false,
        pinnedCoordinate: null,
        admissions: Object.freeze([]),
        constitutionalParticipation: Object.freeze([]),
        lifecycle: DEFAULT_SCENE_LIFECYCLE
    });
}

export type SceneSetupGateReason =
    | 'ready'
    | 'wizard-inactive'
    | 'cpf-brainstorm-required'
    | 'pinned-coordinate-required';

export interface SceneSetupGateResult {
    readonly canOpen: boolean;
    readonly reason: SceneSetupGateReason;
}

/**
 * CPF (00/00) gate. A scene can only open after the user has completed the Anima
 * brainstorm (`brainstormConfirmed`) and pinned a coordinate. This is the single
 * choke-point through which every summon/admission must pass — the widget never
 * opens a scene without a `canOpen: true` verdict here.
 */
export function evaluateSceneSetupGate(state: SceneSetupState): SceneSetupGateResult {
    if (!state.active) {
        return Object.freeze({ canOpen: false, reason: 'wizard-inactive' as const });
    }
    if (!state.brainstormConfirmed) {
        return Object.freeze({ canOpen: false, reason: 'cpf-brainstorm-required' as const });
    }
    if (!state.pinnedCoordinate) {
        return Object.freeze({ canOpen: false, reason: 'pinned-coordinate-required' as const });
    }
    return Object.freeze({ canOpen: true, reason: 'ready' as const });
}

export interface SceneOpenRequest {
    readonly pinnedCoordinate: string;
    readonly admissions: readonly SceneSetupAdmission[];
    readonly constitutionalParticipation: readonly string[];
    readonly lifecycle: SceneSetupLifecycle;
    readonly brainstormConfirmed: true;
    readonly privacyClass: 'protected_local_handle_only';
}

/**
 * Build the `m4.arena.scene_open` request payload. Throws when the CPF gate is
 * not satisfied — defence-in-depth so no caller can assemble a scene-open (and
 * its implicit summons) that bypasses the brainstorm.
 */
export function buildSceneOpenRequest(state: SceneSetupState): SceneOpenRequest {
    const gate = evaluateSceneSetupGate(state);
    if (!gate.canOpen || !state.pinnedCoordinate) {
        throw new Error(`m4-nara dialogical-arena: scene_open refused — ${gate.reason}`);
    }
    return Object.freeze({
        pinnedCoordinate: state.pinnedCoordinate,
        admissions: state.admissions,
        constitutionalParticipation: state.constitutionalParticipation,
        lifecycle: state.lifecycle,
        brainstormConfirmed: true as const,
        privacyClass: 'protected_local_handle_only' as const
    });
}

/**
 * Anti-leak guard. Any code path that would summon a new Vama Shakti must first
 * pass the CPF gate; this throws otherwise. The widget itself never summons —
 * the guard exists so the contract test can pin the invariant.
 */
export function assertSummonGate(state: SceneSetupState): void {
    if (!evaluateSceneSetupGate(state).canOpen) {
        throw new Error('m4-nara dialogical-arena: summon refused — CPF (00/00) brainstorm gate not cleared');
    }
}

/* ------------------------------------------------------------------ *
 * Normalisers (defensive against partial gateway payloads).
 * ------------------------------------------------------------------ */

export function normalizeArenaScene(raw: unknown): ArenaScene {
    const record = objectRecord(raw) ?? EMPTY_RECORD;
    const payload = objectRecord(record.payload) ?? record;
    const sceneKey = stringValue(
        payload.scene_key ?? payload.sceneKey ?? payload.id ?? payload.key,
        'scene'
    );
    return Object.freeze({
        sceneKey,
        status: normalizeStatus(payload.status),
        title: stringValue(payload.title ?? payload.name, sceneKey),
        pinnedCoordinate: stringValue(
            payload.pinned_coordinate ?? payload.pinnedCoordinate ?? payload.coordinate,
            null
        ),
        admittedVamaShaktis: normalizeVamaShaktis(
            payload.admitted_vama_shaktis ??
            payload.admittedVamaShaktis ??
            payload.vama_shaktis ??
            payload.vamaShaktis
        ),
        admittedConstitutionals: normalizeConstitutionals(
            payload.admitted_constitutionals ??
            payload.admittedConstitutionals ??
            payload.constitutionals
        ),
        userTrika0Present: booleanValue(
            payload.user_trika0_present ?? payload.userTrika0Present ?? payload.user_present
        ) ?? true,
        turns: normalizeTurns(payload.turns ?? payload.dialogue ?? payload.scrollback),
        privacyClass: 'protected_local_handle_only' as const
    });
}

export function normalizeArenaSceneList(raw: unknown): readonly ArenaScene[] {
    const record = objectRecord(raw);
    const rows = arrayValue(
        Array.isArray(raw) ? raw : record?.scenes ?? record?.items ?? record?.payload
    );
    return Object.freeze(rows.map(normalizeArenaScene));
}

export function normalizeWarmVamaShaktis(raw: unknown): readonly WarmVamaShakti[] {
    const record = objectRecord(raw);
    const rows = arrayValue(
        Array.isArray(raw) ? raw : record?.warm ?? record?.items ?? record?.payload ?? record?.vama_shaktis
    );
    return Object.freeze(
        rows.map((item, index) => {
            const entry = objectRecord(item) ?? EMPTY_RECORD;
            const rawClass = entry.vama_shakti_class ?? entry.vamaShaktiClass ?? entry.class ?? entry.classifier;
            return Object.freeze({
                key: stringValue(entry.key ?? entry.id ?? entry.vama_shakti_key ?? entry.vamaShaktiKey, `warm:${index}`),
                name: stringValue(entry.name ?? entry.label, `Vama Shakti ${index + 1}`),
                vamaShaktiClass: isVamaShaktiClass(rawClass) ? rawClass : 'sprite',
                suggestedFromForm: booleanValue(entry.suggested_from_form ?? entry.suggestedFromForm) ?? false
            });
        })
    );
}

function normalizeVamaShaktis(raw: unknown): readonly ArenaVamaShakti[] {
    return Object.freeze(
        arrayValue(raw).map((item, index) => {
            const entry = objectRecord(item) ?? EMPTY_RECORD;
            const rawClass = entry.vama_shakti_class ?? entry.vamaShaktiClass ?? entry.class ?? entry.classifier;
            return Object.freeze({
                key: stringValue(entry.key ?? entry.id ?? entry.vama_shakti_key ?? entry.vamaShaktiKey, `vama:${index}`),
                name: stringValue(entry.name ?? entry.label, `Vama Shakti ${index + 1}`),
                vamaShaktiClass: isVamaShaktiClass(rawClass) ? rawClass : 'sprite',
                vakAddress: stringValue(entry.vak_address ?? entry.vakAddress ?? entry.vak, null)
            });
        })
    );
}

function normalizeConstitutionals(raw: unknown): readonly ArenaConstitutional[] {
    return Object.freeze(
        arrayValue(raw).map((item, index) => {
            if (typeof item === 'string') {
                return Object.freeze({ key: item.toLowerCase(), name: item });
            }
            const entry = objectRecord(item) ?? EMPTY_RECORD;
            const name = stringValue(entry.name ?? entry.label ?? entry.agent, `Agent ${index + 1}`);
            return Object.freeze({
                key: stringValue(entry.key ?? entry.id ?? entry.agent, name.toLowerCase()),
                name
            });
        })
    );
}

function normalizeTurns(raw: unknown): readonly ArenaTurn[] {
    return Object.freeze(
        arrayValue(raw).map((item, index) => {
            const entry = objectRecord(item) ?? EMPTY_RECORD;
            const speakerKind = normalizeSpeakerKind(entry.speaker_kind ?? entry.speakerKind ?? entry.kind);
            const rawClass = entry.vama_shakti_class ?? entry.vamaShaktiClass ?? entry.class;
            return Object.freeze({
                key: stringValue(entry.key ?? entry.id ?? entry.turn_id ?? entry.turnId, `turn:${index}`),
                speakerKind,
                speakerName: stringValue(
                    entry.speaker_name ?? entry.speakerName ?? entry.speaker ?? entry.name,
                    speakerKind === 'user' ? 'You' : `Speaker ${index + 1}`
                ),
                vamaShaktiClass: isVamaShaktiClass(rawClass) ? rawClass : null,
                vakAddress: stringValue(entry.vak_address ?? entry.vakAddress ?? entry.vak, null),
                kairosDelta: normalizeKairosDelta(entry.kairos_delta ?? entry.kairosDelta ?? entry.delta),
                line: stringValue(entry.line ?? entry.text ?? entry.utterance ?? entry.content, '')
            });
        })
    );
}

function normalizeStatus(raw: unknown): ArenaSceneStatus {
    const value = stringValue(raw, 'open').toLowerCase();
    if (value === 'closed') {
        return 'closed';
    }
    if (value === 'archived') {
        return 'archived';
    }
    return 'open';
}

function normalizeSpeakerKind(raw: unknown): ArenaSpeakerKind {
    const value = stringValue(raw, '').toLowerCase().replace(/[^a-z]/g, '');
    if (value === 'user' || value === 'trika0' || value === 'self') {
        return 'user';
    }
    if (value === 'constitutional' || value === 'agent' || value === 'anima') {
        return 'constitutional';
    }
    return 'vama_shakti';
}

function normalizeKairosDelta(raw: unknown): string | null {
    if (typeof raw === 'number' && Number.isFinite(raw)) {
        const sign = raw > 0 ? '+' : '';
        return `Δ ${sign}${raw}`;
    }
    const text = stringValue(raw, null);
    if (!text) {
        return null;
    }
    return text.startsWith('Δ') ? text : `Δ ${text}`;
}

/* ------------------------------------------------------------------ *
 * Summaries for mini-modes.
 * ------------------------------------------------------------------ */

export function classDistribution(vamaShaktis: readonly ArenaVamaShakti[]): ClassDistribution {
    const counts: Record<VamaShaktiClass, number> = { egregore: 0, sprite: 0, daemon: 0, mantra: 0 };
    for (const vama of vamaShaktis) {
        counts[vama.vamaShaktiClass] += 1;
    }
    return Object.freeze(counts);
}

export function summarizeScene(scene: ArenaScene): ArenaSceneSummary {
    return Object.freeze({
        sceneKey: scene.sceneKey,
        status: scene.status,
        title: scene.title,
        pinnedCoordinate: scene.pinnedCoordinate,
        vamaShaktiCount: scene.admittedVamaShaktis.length,
        turnCount: scene.turns.length,
        classDistribution: classDistribution(scene.admittedVamaShaktis)
    });
}

export function activeSceneCount(scenes: readonly ArenaSceneSummary[]): number {
    return scenes.filter(scene => scene.status === 'open').length;
}

/* ------------------------------------------------------------------ *
 * Presentational card (Track 08 export).
 * ------------------------------------------------------------------ */

export interface M4DialogicalArenaCardProps {
    readonly mode?: MExtensionMiniMode;
    readonly scenes: readonly ArenaSceneSummary[];
    readonly activeScene: ArenaScene | null;
    readonly warmInventory?: readonly WarmVamaShakti[];
    readonly warmFilter?: VamaShaktiClass | 'all';
    readonly relay?: {
        readonly kairosEnabled: boolean;
        readonly lastRefreshIso: string | null;
        readonly deltaCount: number;
        readonly pulseToken: number;
        readonly connected: boolean;
    };
    readonly onSelectScene?: (sceneKey: string) => void;
    readonly onAdmitWarm?: (vamaShaktiKey: string) => void;
    readonly onReleaseWarm?: (vamaShaktiKey: string) => void;
    readonly onWarmFilterChange?: (filter: VamaShaktiClass | 'all') => void;
    readonly onSubmitUtterance?: (line: string) => void;
}

const ARENA_PRIVACY_CHROME = privacyChromeClass('protected_local_handle_only');

export const M4DialogicalArenaCard: React.FC<M4DialogicalArenaCardProps> = props => {
    const mode = props.mode ?? 'inspector';
    if (mode === 'badge') {
        return <ArenaBadge scenes={props.scenes} />;
    }
    if (mode === 'compact-card') {
        return <ArenaCompactCard scenes={props.scenes} activeScene={props.activeScene} />;
    }
    return <ArenaInspector {...props} />;
};

const ArenaBadge: React.FC<{ readonly scenes: readonly ArenaSceneSummary[] }> = ({ scenes }) => {
    const count = activeSceneCount(scenes);
    return (
        <span
            className={`m4-arena-badge ${ARENA_PRIVACY_CHROME}`}
            data-test="m4-arena-badge"
            data-track="TRACK_08"
            data-export={M4_DIALOGICAL_ARENA_CARD_EXPORT}
            data-view-id={DIALOGICAL_ARENA_VIEW_ID}
            data-mini-mode="badge"
            data-active-scenes={count}
            data-protected-bodies-projected="false"
            role="status"
            aria-label={`${count} open arena scenes`}
        >
            <span className="m4-arena-badge-glyph" aria-hidden="true">◍</span>
            <span className="m4-arena-badge-count">{count}</span>
        </span>
    );
};

const ArenaCompactCard: React.FC<{
    readonly scenes: readonly ArenaSceneSummary[];
    readonly activeScene: ArenaScene | null;
}> = ({ scenes, activeScene }) => {
    const summary = activeScene ? summarizeScene(activeScene) : scenes.find(scene => scene.status === 'open') ?? null;
    return (
        <section
            className={`m4-arena-compact ${ARENA_PRIVACY_CHROME}`}
            data-test="m4-arena-compact-card"
            data-track="TRACK_08"
            data-export={M4_DIALOGICAL_ARENA_CARD_EXPORT}
            data-view-id={DIALOGICAL_ARENA_VIEW_ID}
            data-mini-mode="compact-card"
            data-protected-bodies-projected="false"
            aria-label="Dialogical arena current scene"
        >
            <header className="m4-arena-compact-header">
                <span className="m4-arena-compact-glyph" aria-hidden="true">◍</span>
                <strong data-test="m4-arena-compact-title">{summary ? summary.title : 'No open scene'}</strong>
            </header>
            {summary ? (
                <React.Fragment>
                    {summary.pinnedCoordinate ? (
                        <PinnedCoordinateChip coordinate={summary.pinnedCoordinate} />
                    ) : null}
                    <ClassDistributionChip distribution={summary.classDistribution} />
                    <span className="m4-arena-compact-turns" data-test="m4-arena-compact-turns">
                        {summary.turnCount} turns
                    </span>
                </React.Fragment>
            ) : null}
        </section>
    );
};

const ArenaInspector: React.FC<M4DialogicalArenaCardProps> = props => {
    const { scenes, activeScene, warmInventory, warmFilter, relay } = props;
    const filter = warmFilter ?? 'all';
    const visibleWarm = (warmInventory ?? []).filter(
        item => filter === 'all' || item.vamaShaktiClass === filter
    );
    return (
        <section
            className={`m4-arena-inspector ${ARENA_PRIVACY_CHROME}`}
            data-test="m4-arena-inspector"
            data-track="TRACK_08"
            data-export={M4_DIALOGICAL_ARENA_CARD_EXPORT}
            data-view-id={DIALOGICAL_ARENA_VIEW_ID}
            data-mini-mode="inspector"
            data-privacy-class={ARENA_PRIVACY_MANIFEST.privacyClass}
            data-protected-bodies-projected={ARENA_PRIVACY_MANIFEST.protectedBodiesProjected ? 'true' : 'false'}
            aria-label="Dialogical arena"
        >
            <SceneListStrip
                scenes={scenes}
                activeSceneKey={activeScene?.sceneKey ?? null}
                onSelectScene={props.onSelectScene}
            />
            <div className="m4-arena-body">
                <SceneDetailPane
                    scene={activeScene}
                    relay={relay}
                    onSubmitUtterance={props.onSubmitUtterance}
                />
                <WarmVamaShaktiStrip
                    inventory={visibleWarm}
                    filter={filter}
                    onAdmit={props.onAdmitWarm}
                    onRelease={props.onReleaseWarm}
                    onFilterChange={props.onWarmFilterChange}
                />
            </div>
        </section>
    );
};

const SceneListStrip: React.FC<{
    readonly scenes: readonly ArenaSceneSummary[];
    readonly activeSceneKey: string | null;
    readonly onSelectScene?: (sceneKey: string) => void;
}> = ({ scenes, activeSceneKey, onSelectScene }) => (
    <nav className="m4-arena-scene-strip" data-test="m4-arena-scene-strip" aria-label="Open arena scenes">
        {scenes.length === 0 ? (
            <span className="m4-arena-scene-strip-empty" data-test="m4-arena-scene-strip-empty">
                No open scenes
            </span>
        ) : (
            scenes.map(scene => (
                <button
                    key={scene.sceneKey}
                    type="button"
                    className="m4-arena-scene-tab"
                    data-test="m4-arena-scene-tab"
                    data-scene-key={scene.sceneKey}
                    data-active={scene.sceneKey === activeSceneKey ? 'true' : 'false'}
                    aria-pressed={scene.sceneKey === activeSceneKey}
                    onClick={onSelectScene ? () => onSelectScene(scene.sceneKey) : undefined}
                >
                    <span className="m4-arena-scene-tab-title">{scene.title}</span>
                    <span className="m4-arena-scene-tab-count">{scene.vamaShaktiCount}</span>
                </button>
            ))
        )}
    </nav>
);

const SceneDetailPane: React.FC<{
    readonly scene: ArenaScene | null;
    readonly relay?: M4DialogicalArenaCardProps['relay'];
    readonly onSubmitUtterance?: (line: string) => void;
}> = ({ scene, relay, onSubmitUtterance }) => {
    if (!scene) {
        return (
            <div className="m4-arena-detail m4-arena-detail-empty" data-test="m4-arena-detail-empty">
                <p>Select an open scene, or set up a new one through the Anima brainstorm.</p>
            </div>
        );
    }
    return (
        <div className="m4-arena-detail" data-test="m4-arena-detail" data-scene-key={scene.sceneKey}>
            <header className="m4-arena-detail-header">
                {scene.pinnedCoordinate ? (
                    <PinnedCoordinateChip coordinate={scene.pinnedCoordinate} />
                ) : (
                    <span className="m4-arena-unpinned" data-test="m4-arena-unpinned">unpinned</span>
                )}
                {relay ? (
                    <span className="m4-arena-kairos-ring" data-test="m4-arena-kairos-ring">
                        <M4MercuriusRelayChip
                            kairosEnabled={relay.kairosEnabled}
                            lastRefreshIso={relay.lastRefreshIso}
                            deltaCount={relay.deltaCount}
                            pulseToken={relay.pulseToken}
                            connected={relay.connected}
                        />
                    </span>
                ) : null}
            </header>

            <div className="m4-arena-roster" data-test="m4-arena-roster">
                {scene.userTrika0Present ? (
                    <span
                        className="m4-arena-chip m4-arena-trika0"
                        data-test="m4-arena-trika0"
                        title="User · Trika position 0"
                    >
                        <span className="m4-arena-chip-glyph" aria-hidden="true">◉</span>
                        <span className="m4-arena-chip-name">You</span>
                        <span className="m4-arena-trika0-tag">Trika-0</span>
                    </span>
                ) : null}
                {scene.admittedVamaShaktis.map(vama => (
                    <VamaShaktiChip key={vama.key} vama={vama} />
                ))}
                {scene.admittedConstitutionals.map(agent => (
                    <span
                        key={agent.key}
                        className="m4-arena-chip m4-arena-constitutional-chip"
                        data-test="m4-arena-constitutional-chip"
                        data-agent-key={agent.key}
                    >
                        <span className="m4-arena-chip-glyph" aria-hidden="true">✶</span>
                        <span className="m4-arena-chip-name">{agent.name}</span>
                    </span>
                ))}
            </div>

            <ol className="m4-arena-scrollback" data-test="m4-arena-scrollback">
                {scene.turns.map(turn => (
                    <DialogueTurn key={turn.key} turn={turn} />
                ))}
            </ol>

            <UtteranceInput onSubmitUtterance={onSubmitUtterance} />
        </div>
    );
};

const VamaShaktiChip: React.FC<{ readonly vama: ArenaVamaShakti }> = ({ vama }) => (
    <span
        className={`m4-arena-chip m4-arena-vama-chip m4-arena-vama-${vama.vamaShaktiClass}`}
        data-test="m4-arena-vama-chip"
        data-vama-shakti-class={vama.vamaShaktiClass}
        data-glyph={glyphForClass(vama.vamaShaktiClass)}
        data-vama-key={vama.key}
        title={`${vama.name} · ${vama.vamaShaktiClass}`}
    >
        <span className="m4-arena-chip-glyph" data-test="m4-arena-classifier-glyph" aria-hidden="true">
            {glyphForClass(vama.vamaShaktiClass)}
        </span>
        <span className="m4-arena-chip-name">{vama.name}</span>
        {vama.vakAddress ? (
            <span className="m4-arena-vak" data-test="m4-arena-chip-vak">{vama.vakAddress}</span>
        ) : null}
    </span>
);

const DialogueTurn: React.FC<{ readonly turn: ArenaTurn }> = ({ turn }) => (
    <li
        className={`m4-arena-turn m4-arena-turn-${turn.speakerKind}`}
        data-test="m4-arena-turn"
        data-speaker-kind={turn.speakerKind}
        data-vama-shakti-class={turn.vamaShaktiClass ?? ''}
    >
        <span className="m4-arena-turn-speaker" data-test="m4-arena-turn-speaker">
            <span className="m4-arena-chip-glyph" aria-hidden="true">
                {turn.speakerKind === 'vama_shakti'
                    ? glyphForClass(turn.vamaShaktiClass)
                    : turn.speakerKind === 'user'
                        ? '◉'
                        : '✶'}
            </span>
            <span className="m4-arena-turn-name">{turn.speakerName}</span>
        </span>
        {turn.vakAddress ? (
            <span className="m4-arena-turn-vak" data-test="m4-arena-turn-vak">{turn.vakAddress}</span>
        ) : null}
        {turn.kairosDelta ? (
            <span className="m4-arena-turn-kairos" data-test="m4-arena-turn-kairos">{turn.kairosDelta}</span>
        ) : null}
        <span className="m4-arena-turn-line" data-test="m4-arena-turn-line">{turn.line}</span>
    </li>
);

const UtteranceInput: React.FC<{ readonly onSubmitUtterance?: (line: string) => void }> = ({ onSubmitUtterance }) => {
    const [draft, setDraft] = React.useState('');
    const submit = (): void => {
        const trimmed = draft.trim();
        if (!trimmed) {
            return;
        }
        onSubmitUtterance?.(trimmed);
        setDraft('');
    };
    return (
        <form
            className="m4-arena-input"
            data-test="m4-arena-input"
            onSubmit={event => {
                event.preventDefault();
                submit();
            }}
        >
            <textarea
                className="m4-arena-input-field"
                data-test="m4-arena-input-field"
                placeholder="Speak as Trika-0…"
                value={draft}
                rows={2}
                onChange={event => setDraft(event.currentTarget.value)}
            />
            <button type="submit" className="m4-arena-input-send" data-test="m4-arena-input-send">
                Speak
            </button>
        </form>
    );
};

const WarmVamaShaktiStrip: React.FC<{
    readonly inventory: readonly WarmVamaShakti[];
    readonly filter: VamaShaktiClass | 'all';
    readonly onAdmit?: (vamaShaktiKey: string) => void;
    readonly onRelease?: (vamaShaktiKey: string) => void;
    readonly onFilterChange?: (filter: VamaShaktiClass | 'all') => void;
}> = ({ inventory, filter, onAdmit, onRelease, onFilterChange }) => (
    <aside className="m4-arena-warm-strip" data-test="m4-arena-warm-strip" aria-label="Warm Vama Shakti inventory">
        <header className="m4-arena-warm-header">
            <h4>Warm Vama Shakti</h4>
            <select
                className="m4-arena-warm-filter"
                data-test="m4-arena-warm-filter"
                value={filter}
                onChange={onFilterChange ? event => onFilterChange(event.currentTarget.value as VamaShaktiClass | 'all') : undefined}
                aria-label="Filter warm inventory by classifier"
            >
                <option value="all">All classes</option>
                {VAMA_SHAKTI_CLASSES.map(cls => (
                    <option key={cls} value={cls}>
                        {CLASSIFIER_GLYPHS[cls]} {cls}
                    </option>
                ))}
            </select>
        </header>
        <ul className="m4-arena-warm-list" data-test="m4-arena-warm-list">
            {inventory.length === 0 ? (
                <li className="m4-arena-warm-empty" data-test="m4-arena-warm-empty">No warm voices</li>
            ) : (
                inventory.map(item => (
                    <li
                        key={item.key}
                        className={`m4-arena-warm-item m4-arena-vama-${item.vamaShaktiClass}`}
                        data-test="m4-arena-warm-item"
                        data-vama-shakti-class={item.vamaShaktiClass}
                        data-glyph={glyphForClass(item.vamaShaktiClass)}
                        data-vama-key={item.key}
                    >
                        <span className="m4-arena-chip-glyph" aria-hidden="true">{glyphForClass(item.vamaShaktiClass)}</span>
                        <span className="m4-arena-chip-name">{item.name}</span>
                        <span className="m4-arena-warm-actions">
                            <button
                                type="button"
                                className="m4-arena-warm-admit"
                                data-test="m4-arena-warm-admit"
                                onClick={onAdmit ? () => onAdmit(item.key) : undefined}
                            >
                                Admit
                            </button>
                            <button
                                type="button"
                                className="m4-arena-warm-release"
                                data-test="m4-arena-warm-release"
                                onClick={onRelease ? () => onRelease(item.key) : undefined}
                            >
                                Release
                            </button>
                        </span>
                    </li>
                ))
            )}
        </ul>
    </aside>
);

const PinnedCoordinateChip: React.FC<{ readonly coordinate: string }> = ({ coordinate }) => (
    <span className="m4-arena-pinned" data-test="m4-arena-pinned" data-coordinate={coordinate}>
        <span className="m4-arena-pinned-glyph" aria-hidden="true">📌</span>
        {coordinate}
    </span>
);

const ClassDistributionChip: React.FC<{ readonly distribution: ClassDistribution }> = ({ distribution }) => (
    <span className="m4-arena-class-distribution" data-test="m4-arena-class-distribution">
        {VAMA_SHAKTI_CLASSES.filter(cls => distribution[cls] > 0).map(cls => (
            <span
                key={cls}
                className={`m4-arena-class-count m4-arena-vama-${cls}`}
                data-test="m4-arena-class-count"
                data-vama-shakti-class={cls}
            >
                {CLASSIFIER_GLYPHS[cls]} {distribution[cls]}
            </span>
        ))}
    </span>
);

/* ------------------------------------------------------------------ *
 * Scene-setup wizard (non-modal, inline — Tranche 32.3 no-modal invariant).
 * ------------------------------------------------------------------ */

export interface SceneSetupWizardProps {
    readonly state: SceneSetupState;
    readonly coordinateFamilyHint: string | null;
    readonly warmInventory: readonly WarmVamaShakti[];
    readonly onConfirmBrainstorm: () => void;
    readonly onPinCoordinate: (coordinate: string) => void;
    readonly onToggleAdmission: (warm: WarmVamaShakti) => void;
    readonly onOverrideClass: (vamaShaktiKey: string, cls: VamaShaktiClass) => void;
    readonly onToggleConstitutional: (agentKey: string) => void;
    readonly onOpenScene: () => void;
    readonly onCancel: () => void;
}

export const SceneSetupWizard: React.FC<SceneSetupWizardProps> = props => {
    const { state } = props;
    const gate = evaluateSceneSetupGate(state);
    const admittedKeys = new Set(state.admissions.map(a => a.vamaShaktiKey));
    return (
        <section
            className={`m4-arena-wizard ${ARENA_PRIVACY_CHROME}`}
            data-test="m4-arena-wizard"
            data-context="cpf-00-00"
            data-brainstorm-confirmed={state.brainstormConfirmed ? 'true' : 'false'}
            data-can-open={gate.canOpen ? 'true' : 'false'}
            aria-label="Arena scene setup"
        >
            <header className="m4-arena-wizard-header">
                <h3>Set up a dialogical scene</h3>
                <p className="m4-arena-wizard-cpf">Anima brainstorm · CPF (00/00)</p>
            </header>

            <ol className="m4-arena-wizard-steps">
                <li className="m4-arena-wizard-step" data-test="m4-arena-wizard-brainstorm">
                    <h4>1 · Brainstorm with Anima</h4>
                    <p>Every scene begins by brainstorming intent with Anima at CPF (00/00). No voice is
                        summoned and no scene opens until this is confirmed.</p>
                    <button
                        type="button"
                        className="m4-arena-wizard-confirm"
                        data-test="m4-arena-wizard-confirm-brainstorm"
                        data-confirmed={state.brainstormConfirmed ? 'true' : 'false'}
                        onClick={props.onConfirmBrainstorm}
                    >
                        {state.brainstormConfirmed ? 'Brainstorm confirmed ✓' : 'Confirm brainstorm with Anima'}
                    </button>
                </li>

                <li className="m4-arena-wizard-step" data-test="m4-arena-wizard-pin">
                    <h4>2 · Pin a coordinate</h4>
                    <input
                        type="text"
                        className="m4-arena-wizard-coordinate"
                        data-test="m4-arena-wizard-coordinate"
                        placeholder="e.g. M4-3"
                        defaultValue={state.pinnedCoordinate ?? ''}
                        onChange={event => props.onPinCoordinate(event.currentTarget.value)}
                    />
                </li>

                <li className="m4-arena-wizard-step" data-test="m4-arena-wizard-admissions">
                    <h4>3 · Admit Vama Shaktis</h4>
                    <p className="m4-arena-wizard-hint">
                        Suggested classifier from coordinate family
                        {props.coordinateFamilyHint ? ` (${props.coordinateFamilyHint})` : ''}:
                        {' '}
                        {CLASSIFIER_GLYPHS[suggestVamaShaktiClass(props.coordinateFamilyHint)]}
                        {' '}
                        {suggestVamaShaktiClass(props.coordinateFamilyHint)} — override per voice.
                    </p>
                    <ul className="m4-arena-wizard-warm">
                        {props.warmInventory.map(warm => {
                            const admission = state.admissions.find(a => a.vamaShaktiKey === warm.key);
                            const admitted = admittedKeys.has(warm.key);
                            return (
                                <li
                                    key={warm.key}
                                    className="m4-arena-wizard-warm-item"
                                    data-test="m4-arena-wizard-warm-item"
                                    data-admitted={admitted ? 'true' : 'false'}
                                >
                                    <label>
                                        <input
                                            type="checkbox"
                                            data-test="m4-arena-wizard-admit"
                                            checked={admitted}
                                            onChange={() => props.onToggleAdmission(warm)}
                                        />
                                        <span className="m4-arena-chip-glyph" aria-hidden="true">
                                            {glyphForClass((admission ?? warm).vamaShaktiClass)}
                                        </span>
                                        {warm.name}
                                    </label>
                                    {admitted ? (
                                        <select
                                            className="m4-arena-wizard-class"
                                            data-test="m4-arena-wizard-class"
                                            value={admission?.vamaShaktiClass ?? warm.vamaShaktiClass}
                                            onChange={event =>
                                                props.onOverrideClass(warm.key, event.currentTarget.value as VamaShaktiClass)
                                            }
                                        >
                                            {VAMA_SHAKTI_CLASSES.map(cls => (
                                                <option key={cls} value={cls}>
                                                    {CLASSIFIER_GLYPHS[cls]} {cls}
                                                </option>
                                            ))}
                                        </select>
                                    ) : null}
                                </li>
                            );
                        })}
                    </ul>
                </li>

                <li className="m4-arena-wizard-step" data-test="m4-arena-wizard-constitutional">
                    <h4>4 · Constitutional participation</h4>
                    <ul className="m4-arena-wizard-agents">
                        {CONSTITUTIONAL_AGENTS.map(agent => (
                            <li key={agent.key}>
                                <label>
                                    <input
                                        type="checkbox"
                                        data-test="m4-arena-wizard-agent"
                                        data-agent-key={agent.key}
                                        checked={state.constitutionalParticipation.includes(agent.key)}
                                        onChange={() => props.onToggleConstitutional(agent.key)}
                                    />
                                    {agent.name}
                                </label>
                            </li>
                        ))}
                    </ul>
                </li>
            </ol>

            <footer className="m4-arena-wizard-footer">
                <button
                    type="button"
                    className="m4-arena-wizard-cancel"
                    data-test="m4-arena-wizard-cancel"
                    onClick={props.onCancel}
                >
                    Cancel
                </button>
                <button
                    type="button"
                    className="m4-arena-wizard-open"
                    data-test="m4-arena-wizard-open"
                    disabled={!gate.canOpen}
                    data-gate-reason={gate.reason}
                    onClick={gate.canOpen ? props.onOpenScene : undefined}
                >
                    Open scene
                </button>
            </footer>
        </section>
    );
};

/* ------------------------------------------------------------------ *
 * Widget.
 * ------------------------------------------------------------------ */

@injectable()
export class DialogicalArenaWidget extends ReactWidget {
    static readonly ID = DIALOGICAL_ARENA_VIEW_ID;
    static readonly LABEL = DIALOGICAL_ARENA_LABEL;

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    protected scenes: readonly ArenaSceneSummary[] = Object.freeze([]);
    protected activeScene: ArenaScene | null = null;
    protected activeSceneKey: string | null = null;
    protected warmInventory: readonly WarmVamaShakti[] = Object.freeze([]);
    protected warmFilter: VamaShaktiClass | 'all' = 'all';
    protected setup: SceneSetupState = initialSceneSetupState();
    protected relay: MercuriusRelayState = initialRelayState();
    protected context: CoordinateContext = EMPTY_COORDINATE_CONTEXT;
    protected readiness: MExtensionReadinessSnapshot = PENDING_M_READINESS;
    protected subscriptions: Disposable[] = [];

    @postConstruct()
    protected init(): void {
        this.id = DialogicalArenaWidget.ID;
        this.title.label = DialogicalArenaWidget.LABEL;
        this.title.caption = SURFACE_PRIVACY_TOOLTIP;
        this.title.closable = true;
        this.addClass('mext-widget');
        this.addClass('mext-widget-' + EXTENSION_ID);
        this.addClass('m4-nara-dialogical-arena');
        this.addClass(privacyChromeClass('protected_local_handle_only'));

        this.subscriptions.push(
            this.bridge.onObservabilityEvent(event => this.handleObservabilityEvent(event))
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

        void this.refreshScenes();
        void this.refreshWarmInventory();
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

    protected handleObservabilityEvent(event: MObservabilityEvent): void {
        if (event.type === ARENA_KAIROS_DELTA_KIND || (event.payload as { kind?: string })?.kind === ARENA_KAIROS_DELTA_KIND) {
            const next = applyMercuriusDelta(this.relay, event);
            if (next !== this.relay) {
                this.relay = next;
                this.update();
            }
        }
        if (event.type === ARENA_SUBSCRIBE_KIND || (event.payload as { kind?: string })?.kind === ARENA_SUBSCRIBE_KIND) {
            void this.refreshScenes();
            if (this.activeSceneKey) {
                void this.refreshActiveScene(this.activeSceneKey);
            }
        }
    }

    /** Push the FR-3 kairos-enabled preference into the live ring. */
    setKairosEnabled(enabled: boolean): void {
        const next = setKairosEnabled(this.relay, enabled);
        if (next !== this.relay) {
            this.relay = next;
            this.update();
        }
    }

    protected async refreshScenes(): Promise<void> {
        try {
            const raw = await this.bridge.invokeGatewayRpc(ARENA_LIST_RPC, { status: 'open' });
            const scenes = normalizeArenaSceneList(raw);
            this.scenes = Object.freeze(scenes.map(summarizeScene));
            if (!this.activeSceneKey && scenes.length > 0) {
                this.activeScene = scenes[0];
                this.activeSceneKey = scenes[0].sceneKey;
            } else if (this.activeSceneKey) {
                const match = scenes.find(scene => scene.sceneKey === this.activeSceneKey);
                if (match) {
                    this.activeScene = match;
                }
            }
        } catch {
            this.scenes = Object.freeze([]);
        }
        this.update();
    }

    protected async refreshActiveScene(sceneKey: string): Promise<void> {
        try {
            const raw = await this.bridge.invokeGatewayRpc(ARENA_LIST_RPC, { status: 'open', scene_key: sceneKey });
            const scenes = normalizeArenaSceneList(raw);
            const match = scenes.find(scene => scene.sceneKey === sceneKey) ?? scenes[0] ?? null;
            if (match) {
                this.activeScene = match;
                this.update();
            }
        } catch {
            // keep last-good scene
        }
    }

    protected async refreshWarmInventory(): Promise<void> {
        try {
            const raw = await this.bridge.invokeGatewayRpc(ARENA_WARM_LIST_RPC, {});
            this.warmInventory = normalizeWarmVamaShaktis(raw);
        } catch {
            this.warmInventory = Object.freeze([]);
        }
        this.update();
    }

    protected selectScene(sceneKey: string): void {
        this.activeSceneKey = sceneKey;
        const summary = this.scenes.find(scene => scene.sceneKey === sceneKey);
        if (summary) {
            void this.refreshActiveScene(sceneKey);
        }
        this.update();
    }

    protected setWarmFilter(filter: VamaShaktiClass | 'all'): void {
        this.warmFilter = filter;
        this.update();
    }

    protected async admitWarm(vamaShaktiKey: string): Promise<void> {
        if (!this.activeSceneKey) {
            return;
        }
        try {
            await this.bridge.invokeGatewayRpc(ARENA_ADMIT_RPC, {
                scene_key: this.activeSceneKey,
                vama_shakti_key: vamaShaktiKey
            });
            await this.refreshActiveScene(this.activeSceneKey);
        } catch {
            // surfaced through the scene stream on retry
        }
    }

    protected async releaseWarm(vamaShaktiKey: string): Promise<void> {
        if (!this.activeSceneKey) {
            return;
        }
        try {
            await this.bridge.invokeGatewayRpc(ARENA_RELEASE_RPC, {
                scene_key: this.activeSceneKey,
                vama_shakti_key: vamaShaktiKey
            });
            await this.refreshActiveScene(this.activeSceneKey);
        } catch {
            // surfaced through the scene stream on retry
        }
    }

    protected async submitUtterance(line: string): Promise<void> {
        if (!this.activeSceneKey) {
            return;
        }
        try {
            await this.bridge.invokeGatewayRpc(ARENA_UTTERANCE_RPC, {
                scene_key: this.activeSceneKey,
                line
            });
            await this.refreshActiveScene(this.activeSceneKey);
        } catch {
            // surfaced through the scene stream on retry
        }
    }

    /* ----- scene-setup wizard handlers (CPF (00/00) gated) ----- */

    startSceneSetup(): void {
        this.setup = Object.freeze({ ...initialSceneSetupState(), active: true });
        this.update();
    }

    protected confirmBrainstorm(): void {
        this.setup = Object.freeze({ ...this.setup, brainstormConfirmed: true });
        this.update();
    }

    protected pinCoordinate(coordinate: string): void {
        const trimmed = coordinate.trim();
        this.setup = Object.freeze({ ...this.setup, pinnedCoordinate: trimmed ? trimmed : null });
        this.update();
    }

    protected toggleAdmission(warm: WarmVamaShakti): void {
        const exists = this.setup.admissions.some(a => a.vamaShaktiKey === warm.key);
        const admissions = exists
            ? this.setup.admissions.filter(a => a.vamaShaktiKey !== warm.key)
            : [
                ...this.setup.admissions,
                Object.freeze({
                    vamaShaktiKey: warm.key,
                    name: warm.name,
                    vamaShaktiClass: warm.suggestedFromForm
                        ? suggestVamaShaktiClass(this.coordinateFamilyHint())
                        : warm.vamaShaktiClass,
                    classOverridden: false
                })
            ];
        this.setup = Object.freeze({ ...this.setup, admissions: Object.freeze(admissions) });
        this.update();
    }

    protected overrideClass(vamaShaktiKey: string, cls: VamaShaktiClass): void {
        const admissions = this.setup.admissions.map(a =>
            a.vamaShaktiKey === vamaShaktiKey
                ? Object.freeze({ ...a, vamaShaktiClass: cls, classOverridden: true })
                : a
        );
        this.setup = Object.freeze({ ...this.setup, admissions: Object.freeze(admissions) });
        this.update();
    }

    protected toggleConstitutional(agentKey: string): void {
        const exists = this.setup.constitutionalParticipation.includes(agentKey);
        const participation = exists
            ? this.setup.constitutionalParticipation.filter(key => key !== agentKey)
            : [...this.setup.constitutionalParticipation, agentKey];
        this.setup = Object.freeze({ ...this.setup, constitutionalParticipation: Object.freeze(participation) });
        this.update();
    }

    protected cancelSceneSetup(): void {
        this.setup = initialSceneSetupState();
        this.update();
    }

    /**
     * Open a scene. Routes ONLY through {@link buildSceneOpenRequest}, which
     * throws unless the CPF (00/00) gate has cleared — the widget never invokes
     * `m4.arena.scene_open` (and therefore never summons) outside this path.
     */
    protected async openScene(): Promise<void> {
        let request: SceneOpenRequest;
        try {
            request = buildSceneOpenRequest(this.setup);
        } catch {
            // Gate not cleared — keep the wizard open; the disabled button and
            // gate-reason already communicate why.
            this.update();
            return;
        }
        try {
            const raw = await this.bridge.invokeGatewayRpc(ARENA_SCENE_OPEN_RPC, {
                pinned_coordinate: request.pinnedCoordinate,
                admissions: request.admissions.map(a => ({
                    vama_shakti_key: a.vamaShaktiKey,
                    vama_shakti_class: a.vamaShaktiClass
                })),
                constitutional_participation: request.constitutionalParticipation,
                lifecycle: request.lifecycle,
                brainstorm_confirmed: true
            });
            const scene = normalizeArenaScene(raw);
            this.activeScene = scene;
            this.activeSceneKey = scene.sceneKey;
            this.setup = initialSceneSetupState();
            await this.refreshScenes();
        } catch {
            // keep wizard state for retry
            this.update();
        }
    }

    protected coordinateFamilyHint(): string | null {
        return (
            this.setup.pinnedCoordinate ??
            this.context.canonicalMCoordinate ??
            this.context.selectedCoordinate
        );
    }

    protected override render(): React.ReactNode {
        return (
            <div
                className={`mext-widget-root m4-arena-root ${privacyChromeClass('protected_local_handle_only')}`}
                data-test="m4-arena-root"
                data-protected-bodies-projected={ARENA_PRIVACY_MANIFEST.protectedBodiesProjected ? 'true' : 'false'}
            >
                <div className="m4-arena-toolbar" data-test="m4-arena-toolbar">
                    <button
                        type="button"
                        className="m4-arena-new-scene"
                        data-test="m4-arena-new-scene"
                        onClick={() => this.startSceneSetup()}
                    >
                        New scene…
                    </button>
                </div>
                {this.setup.active ? (
                    <SceneSetupWizard
                        state={this.setup}
                        coordinateFamilyHint={this.coordinateFamilyHint()}
                        warmInventory={this.warmInventory}
                        onConfirmBrainstorm={() => this.confirmBrainstorm()}
                        onPinCoordinate={coordinate => this.pinCoordinate(coordinate)}
                        onToggleAdmission={warm => this.toggleAdmission(warm)}
                        onOverrideClass={(key, cls) => this.overrideClass(key, cls)}
                        onToggleConstitutional={agentKey => this.toggleConstitutional(agentKey)}
                        onOpenScene={() => void this.openScene()}
                        onCancel={() => this.cancelSceneSetup()}
                    />
                ) : null}
                <M4DialogicalArenaCard
                    mode="inspector"
                    scenes={this.scenes}
                    activeScene={this.activeScene}
                    warmInventory={this.warmInventory}
                    warmFilter={this.warmFilter}
                    relay={{
                        kairosEnabled: this.relay.kairosEnabled,
                        lastRefreshIso: this.relay.lastRefreshIso,
                        deltaCount: this.relay.deltaCount,
                        pulseToken: this.relay.pulseToken,
                        connected: this.readiness.bridgeReachable
                    }}
                    onSelectScene={sceneKey => this.selectScene(sceneKey)}
                    onAdmitWarm={key => void this.admitWarm(key)}
                    onReleaseWarm={key => void this.releaseWarm(key)}
                    onWarmFilterChange={filter => this.setWarmFilter(filter)}
                    onSubmitUtterance={line => void this.submitUtterance(line)}
                />
            </div>
        );
    }
}

/* ------------------------------------------------------------------ *
 * Local helpers (defensive payload reading).
 * ------------------------------------------------------------------ */

const EMPTY_RECORD = Object.freeze({}) as Readonly<Record<string, unknown>>;

function arrayValue(value: unknown): readonly unknown[] {
    return Array.isArray(value) ? value : Object.freeze([]);
}

function objectRecord(value: unknown): Readonly<Record<string, unknown>> | undefined {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return undefined;
    }
    return value as Readonly<Record<string, unknown>>;
}

function stringValue(value: unknown, fallback: string): string;
function stringValue(value: unknown, fallback: null): string | null;
function stringValue(value: unknown, fallback: string | null): string | null {
    return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function booleanValue(value: unknown): boolean | null {
    return typeof value === 'boolean' ? value : null;
}
