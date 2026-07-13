/**
 * Coordinate: M' M4' (dialogical arena — pure model + CPF gate law)
 * Residency: Body/M/pratibimba-app/src/panes
 * Actualises: Tranche 41.7 (rerun) — the M4' Dia-logical Arena surface law:
 *   classifier vocabulary + glyphs, the CPF (00/00) scene-setup gate, the
 *   privacy manifest, and normalizers over the REAL `m4.arena.*` contract
 *   handles (epi-s3-gateway-contract lib.rs — camelCase wire, snake_case
 *   accepted defensively).
 * Provenance: ported 2026-07-13 from the frozen
 *   Body/M/epi-theia/extensions/m4-nara/src/browser/widgets/dialogical-arena.tsx
 *   (Theia wrappers shed), then CORRECTED against the live surface: the frozen
 *   widget invoked `m4.arena.admit` / `m4.arena.release` / `m4.arena.utter`,
 *   which do not exist — the landed family is the eight routes pinned in
 *   gateway-contract lib.rs:161-168 (utterances ride `turn_advance`, warm
 *   admission rides `summon` behind the CPF gate, release rides
 *   `vama_release_warm`).
 * Does NOT own: arena runtime state (Body/S/S3/gateway/src/m4_arena.rs),
 *   identity derivation (portal-core vama_shakti.rs), the ws dispatch seam
 *   (the live gateway answers `unimplemented` for this family today — the
 *   pane renders that honestly; see ARENA_WIRE_PENDING_NOTE).
 */

export const DIALOGICAL_ARENA_VIEW_ID = 'm4.nara.dialogicalArena';
export const DIALOGICAL_ARENA_LABEL = 'M4 Dialogical Arena';

/* ------------------------------------------------------------------ *
 * Gateway RPC surface — the REAL eight-route family (41.6).
 * ------------------------------------------------------------------ */

export const ARENA_LIST_RPC = 'm4.arena.list';
export const ARENA_WARM_LIST_RPC = 'm4.arena.vama_list_warm';
export const ARENA_SCENE_OPEN_RPC = 'm4.arena.scene_open';
export const ARENA_TURN_ADVANCE_RPC = 'm4.arena.turn_advance';
export const ARENA_SCENE_CLOSE_RPC = 'm4.arena.scene_close';
export const ARENA_WARM_RELEASE_RPC = 'm4.arena.vama_release_warm';
export const ARENA_SUBSCRIBE_RPC = 'm4.arena.subscribe';

/**
 * Anti-leak invariant (41.7 spec). The summon RPC mints/admits a Vama Shakti
 * and MUST NEVER be invoked outside the scene-setup wizard's Anima brainstorm
 * at CPF (00/00). Exported so the contract test can pin the invariant; see
 * {@link assertSummonGate}.
 */
export const ARENA_SUMMON_RPC = 'm4.arena.summon';

/**
 * The live gateway currently answers `unimplemented` for the whole
 * `m4.arena.*` family: the runtime is CLI/in-process substrate by ratified
 * shape (epi-cli gate/parity.rs — "lives outside METHOD_NAMES"). The pane
 * declares its RPC seam against the real method names and renders this
 * pending state honestly instead of fabricating scenes.
 */
export const ARENA_WIRE_PENDING_NOTE =
    'm4.arena.* wire dispatch pending — the arena runtime lives CLI-side (41.6); this pane goes live when the ws seam lands';

export type ArenaWireState = 'live' | 'pending-wire' | 'disconnected' | 'error';

/** Classify an invoke failure: `unimplemented` means the seam is not wired yet. */
export function classifyWireError(err: unknown): ArenaWireState {
    const message = err instanceof Error ? err.message : String(err);
    if (/unimplemented|unknown method|not implemented/i.test(message)) {
        return 'pending-wire';
    }
    if (/not connected/i.test(message)) {
        return 'disconnected';
    }
    return 'error';
}

/* ------------------------------------------------------------------ *
 * Classifier vocabulary (Vama Shakti classes + glyphs).
 * ------------------------------------------------------------------ */

export type VamaShaktiClass = 'egregore' | 'sprite' | 'daemon' | 'mantra';

export const VAMA_SHAKTI_CLASSES = Object.freeze([
    'egregore',
    'sprite',
    'daemon',
    'mantra'
]) as readonly VamaShaktiClass[];

/**
 * Classifier glyphs per the 41.7 spec (provisional pending 41.1 finalisation;
 * centralised so the final marks swap in one place):
 * egregore = ◍ chorus · sprite = ✦ spark · daemon = ◐ half-circle · mantra = 〰 wave.
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

export function glyphForClass(value: unknown): string {
    return isVamaShaktiClass(value) ? CLASSIFIER_GLYPHS[value] : UNKNOWN_GLYPH;
}

/**
 * Default classifier suggested from a Form's coordinate-family hint (wizard
 * pre-selects; user overrides per admission). Provisional mapping per 41.7.
 */
export function suggestVamaShaktiClass(coordinateFamily: string | null | undefined): VamaShaktiClass {
    switch ((coordinateFamily ?? '').trim().charAt(0).toUpperCase()) {
        case 'M':
            return 'egregore';
        case 'T':
            return 'mantra';
        case 'S':
            return 'daemon';
        default:
            return 'sprite';
    }
}

/* ------------------------------------------------------------------ *
 * Privacy manifest.
 * ------------------------------------------------------------------ */

/**
 * The arena is protected-local handle-only. `protectedBodiesProjected: false`
 * is the load-bearing invariant (DR-VAMA-4/5): dialogue bodies and identity
 * internals never cross the privacy-filtered projection into chrome/stores.
 */
export const ARENA_PRIVACY_MANIFEST = Object.freeze({
    privacyClass: 'protected_local_handle_only' as const,
    protectedBodiesProjected: false as const
});

/* ------------------------------------------------------------------ *
 * Data model (normalised over the contract handles).
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

export interface ArenaTurnEntry {
    readonly key: string;
    readonly speakerKind: ArenaSpeakerKind;
    readonly speakerName: string;
    readonly vamaShaktiClass: VamaShaktiClass | null;
    readonly vakAddress: string | null;
    readonly kairosDelta: string | null;
    /**
     * Dialogue text where locally known (the user's own utterances). Non-user
     * bodies stay behind the opaque `dialogue_body_handle` per the 41.1
     * contract — `null` renders as the handle-only placeholder, never a
     * fabricated line.
     */
    readonly line: string | null;
}

/** Scene summary from the REAL `ArenaSceneHandle` (counts, not rosters). */
export interface ArenaSceneSummary {
    readonly sceneKey: string;
    readonly status: ArenaSceneStatus;
    readonly pinnedCoordinate: string | null;
    readonly admittedConstitutional: readonly string[];
    readonly vamaShaktiCount: number;
    readonly turnCount: number;
}

export interface WarmVamaShaktiRow {
    readonly identityHandle: string;
    readonly coordinateLabel: string;
    readonly vamaShaktiClass: VamaShaktiClass;
    readonly turnsParticipatedCount: number;
}

export type ClassDistribution = Readonly<Record<VamaShaktiClass, number>>;

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
    readonly identityHandle: string;
    readonly name: string;
    readonly entityCoordinate: string;
    readonly vamaShaktiClass: VamaShaktiClass;
    readonly classOverridden: boolean;
}

export interface SceneSetupState {
    readonly active: boolean;
    /** Anima CPF (00/00) brainstorm completion — the non-bypassable gate. */
    readonly brainstormConfirmed: boolean;
    readonly pinnedCoordinate: string | null;
    readonly admissions: readonly SceneSetupAdmission[];
    readonly constitutionalParticipation: readonly string[];
    readonly lifecycleModeDefault: 'ephemeral' | 'warm';
}

export function initialSceneSetupState(): SceneSetupState {
    return Object.freeze({
        active: false,
        brainstormConfirmed: false,
        pinnedCoordinate: null,
        admissions: Object.freeze([]),
        constitutionalParticipation: Object.freeze([]),
        lifecycleModeDefault: 'ephemeral' as const
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
 * CPF (00/00) gate. A scene only opens after the Anima brainstorm is confirmed
 * and a coordinate is pinned — the single choke-point every summon passes.
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

/** Wire payload for `m4.arena.scene_open` (contract camelCase). */
export interface SceneOpenWireRequest {
    readonly sceneKey: string;
    readonly pinnedCoordinate: string;
    readonly lifecycleModeDefault: string;
    readonly admittedConstitutional: readonly string[];
    readonly cpfBrainstormConfirmationToken: string;
}

/** Wire payload for each follow-up `m4.arena.summon` (contract camelCase). */
export interface SummonWireRequest {
    readonly sceneKey: string;
    readonly entityCoordinate: string;
    readonly vamaShaktiClass: VamaShaktiClass;
    readonly lifecycleModeOverride: string | null;
}

export interface SceneOpenPlan {
    readonly open: SceneOpenWireRequest;
    readonly summons: readonly SummonWireRequest[];
}

/**
 * Build the scene-open plan: one `scene_open` followed by one `summon` per
 * admission (the real wire has no bulk-admission parameter). Throws when the
 * CPF gate has not cleared — defence-in-depth so no caller can assemble a
 * scene-open (and its summons) that bypasses the brainstorm.
 */
export function buildSceneOpenPlan(state: SceneSetupState, sceneKey: string): SceneOpenPlan {
    const gate = evaluateSceneSetupGate(state);
    if (!gate.canOpen || !state.pinnedCoordinate) {
        throw new Error(`m4-arena: scene_open refused — ${gate.reason}`);
    }
    const token = `cpf-00-00:brainstorm-confirmed:${state.pinnedCoordinate}`;
    return Object.freeze({
        open: Object.freeze({
            sceneKey,
            pinnedCoordinate: state.pinnedCoordinate,
            lifecycleModeDefault: state.lifecycleModeDefault,
            admittedConstitutional: state.constitutionalParticipation,
            cpfBrainstormConfirmationToken: token
        }),
        summons: Object.freeze(
            state.admissions.map(a =>
                Object.freeze({
                    sceneKey,
                    entityCoordinate: a.entityCoordinate,
                    vamaShaktiClass: a.vamaShaktiClass,
                    lifecycleModeOverride: null
                })
            )
        )
    });
}

/**
 * Anti-leak guard: any path that would summon must first pass the CPF gate;
 * throws otherwise. Exists so the contract test can pin the invariant.
 */
export function assertSummonGate(state: SceneSetupState): void {
    if (!evaluateSceneSetupGate(state).canOpen) {
        throw new Error('m4-arena: summon refused — CPF (00/00) brainstorm gate not cleared');
    }
}

/* ------------------------------------------------------------------ *
 * Normalisers over the contract handles (camelCase wire; snake accepted).
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

function numberValue(value: unknown): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function normalizeStatus(raw: unknown): ArenaSceneStatus {
    const value = stringValue(raw, 'open').toLowerCase();
    return value === 'closed' ? 'closed' : value === 'archived' ? 'archived' : 'open';
}

/** Normalise one `ArenaSceneHandle` (counts + constitutional roster only). */
export function normalizeSceneHandle(raw: unknown): ArenaSceneSummary {
    const record = objectRecord(raw) ?? EMPTY_RECORD;
    const payload = objectRecord(record.payload) ?? record;
    return Object.freeze({
        sceneKey: stringValue(payload.sceneKey ?? payload.scene_key, 'scene'),
        status: normalizeStatus(payload.status),
        pinnedCoordinate: stringValue(payload.pinnedCoordinate ?? payload.pinned_coordinate, null),
        admittedConstitutional: Object.freeze(
            arrayValue(payload.admittedConstitutional ?? payload.admitted_constitutional)
                .map(item => stringValue(item, null))
                .filter((item): item is string => item !== null)
        ),
        vamaShaktiCount: numberValue(
            payload.admittedVamaShaktiCount ?? payload.admitted_vama_shakti_count
        ),
        turnCount: numberValue(payload.turnCount ?? payload.turn_count)
    });
}

export function normalizeSceneHandleList(raw: unknown): readonly ArenaSceneSummary[] {
    const record = objectRecord(raw);
    const rows = arrayValue(Array.isArray(raw) ? raw : record?.scenes ?? record?.items ?? record?.payload);
    return Object.freeze(rows.map(normalizeSceneHandle));
}

/** Normalise a summon `VamaShaktiHandle` into a roster chip. */
export function normalizeVamaShaktiHandle(raw: unknown): ArenaVamaShakti {
    const record = objectRecord(raw) ?? EMPTY_RECORD;
    const payload = objectRecord(record.payload) ?? record;
    const rawClass = payload.vamaShaktiClass ?? payload.vama_shakti_class;
    const coordinate = stringValue(payload.entityCoordinate ?? payload.entity_coordinate, null);
    return Object.freeze({
        key: stringValue(payload.identityHandle ?? payload.identity_handle, coordinate ?? 'vama'),
        name: coordinate ?? 'Vama Shakti',
        vamaShaktiClass: isVamaShaktiClass(rawClass) ? rawClass : 'sprite',
        vakAddress: coordinate
    });
}

/** Normalise a `WarmVamaShaktiHandle` inventory row. */
export function normalizeWarmRows(raw: unknown): readonly WarmVamaShaktiRow[] {
    const record = objectRecord(raw);
    const rows = arrayValue(
        Array.isArray(raw) ? raw : record?.warm ?? record?.items ?? record?.payload ?? record?.rows
    );
    return Object.freeze(
        rows.map((item, index) => {
            const entry = objectRecord(item) ?? EMPTY_RECORD;
            const rawClass = entry.vamaShaktiClass ?? entry.vama_shakti_class;
            return Object.freeze({
                identityHandle: stringValue(entry.identityHandle ?? entry.identity_handle, `warm:${index}`),
                coordinateLabel: stringValue(
                    entry.coordinateLabel ?? entry.coordinate_label,
                    `Vama Shakti ${index + 1}`
                ),
                vamaShaktiClass: isVamaShaktiClass(rawClass) ? rawClass : 'sprite',
                turnsParticipatedCount: numberValue(
                    entry.turnsParticipatedCount ?? entry.turns_participated_count
                )
            });
        })
    );
}

/** Fold a `TurnReceipt` into a scrollback entry (dialogue body stays opaque). */
export function turnEntryFromReceipt(raw: unknown, localLine: string | null): ArenaTurnEntry {
    const record = objectRecord(raw) ?? EMPTY_RECORD;
    const payload = objectRecord(record.payload) ?? record;
    const speakerHandle = stringValue(payload.speakerHandle ?? payload.speaker_handle, 'speaker');
    const rawClass = payload.speakerClass ?? payload.speaker_class;
    const kind: ArenaSpeakerKind = speakerHandle === 'user'
        ? 'user'
        : speakerHandle.startsWith('constitutional:')
            ? 'constitutional'
            : 'vama_shakti';
    const vak = objectRecord(payload.vakAddress ?? payload.vak_address);
    return Object.freeze({
        key: `turn:${numberValue(payload.turnIndex ?? payload.turn_index)}:${stringValue(payload.lineId ?? payload.line_id, '0')}`,
        speakerKind: kind,
        speakerName: kind === 'user'
            ? 'You'
            : kind === 'constitutional'
                ? speakerHandle.slice('constitutional:'.length) || speakerHandle
                : speakerHandle,
        vamaShaktiClass: isVamaShaktiClass(rawClass) ? rawClass : null,
        vakAddress: vak ? stringValue(vak.cp ?? vak.cpf, null) : null,
        kairosDelta: null,
        line: localLine
    });
}

/* ------------------------------------------------------------------ *
 * Summaries.
 * ------------------------------------------------------------------ */

export function classDistribution(vamaShaktis: readonly ArenaVamaShakti[]): ClassDistribution {
    const counts: Record<VamaShaktiClass, number> = { egregore: 0, sprite: 0, daemon: 0, mantra: 0 };
    for (const vama of vamaShaktis) {
        counts[vama.vamaShaktiClass] += 1;
    }
    return Object.freeze(counts);
}

export function activeSceneCount(scenes: readonly ArenaSceneSummary[]): number {
    return scenes.filter(scene => scene.status === 'open').length;
}
