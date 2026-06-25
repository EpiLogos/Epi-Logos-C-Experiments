import type {
  BimbaPratibimbaUiState,
  CompositionToggleClass
} from '@pratibimba/integrated-composition';
import type { MathemeHarmonicProfileBoundary } from '@pratibimba/m-extension-runtime';
import type { PlanetaryViewMode } from '../../common/planetary-lut';

/**
 * 23.15 — Bimba/Pratibimba state persistence, M2 side.
 *
 * A typed selector that publishes the M2-side state slice into the shared
 * `BimbaPratibimbaUiState` typed object owned by the kernel-bridge DI
 * singleton. Every M2-side field listed below must survive BOTH the
 * `daily-0-1` <-> `ide-deep` layout toggle AND the `0/1` cosmic/personal
 * face-switch — a toggle is an intra-process view change and never transforms
 * persisted state.
 *
 * The eleven-field persistence contract (spec §23.15), with the later 23.6 /
 * 23.8 view-mode additions appended:
 *
 *   1. the six core profile coordinates —
 *      profileGeneration, lens_mode, tick12, position6, address72,
 *      kleinFlip.surfaceValence
 *   2. layerAActiveCell        { lens; position }   — Layer A grid active-cell
 *   3. layerBCardScroll        number               — Layer B card-scroll
 *   4. layerCSurfaceVariant    plate|torus|spheres  — Layer C surface choice
 *   5. layerCZoom              number               — Layer C zoom level
 *   6. lastRoutingTrace        FRoutingTraceHandle? — last F_routing trace
 *   7. correspondenceTreeAxisFilter   AxisName[]    — active axis-filter chips
 *   8. correspondenceTreeSonicOverlay none|mantra|asma — active sonic tab
 *   9. planetaryViewMode       vibrational|psychoid — view-mode (23.6)
 *  10. epogdoonProofMode       boolean              — dev proof overlay (23.8)
 */

// ── M2-specific sub-types ───────────────────────────────────────────────────

export type M2KleinFlipSurfaceValence = 'primary' | 'inverted' | 'transitioning';

export type M2SurfaceVariant = 'plate' | 'torus' | 'spheres';

export type M2CorrespondenceTreeSonicOverlay = 'none' | 'mantra' | 'asma';

/**
 * Correspondence-tree axis name — the M2 address-view vocabulary
 * (`M2AddressView['name']`). The axis-filter chips select any subset of these.
 */
export type AxisName =
  | 'mef'
  | 'tattva-phase'
  | 'decan-face'
  | 'shem'
  | 'asma'
  | 'maqam'
  | 'det-projection';

export const AXIS_NAMES: readonly AxisName[] = Object.freeze([
  'mef',
  'tattva-phase',
  'decan-face',
  'shem',
  'asma',
  'maqam',
  'det-projection'
]);

/** Layer-A grid active-cell coordinate (lens column, position row). */
export interface M2LayerAActiveCell {
  readonly lens: number;
  readonly position: number;
}

/** Opaque handle to the last F_routing trace observed on the M2 pipeline. */
export interface FRoutingTraceHandle {
  readonly traceId: string;
  readonly route: string;
  readonly address72: number;
  readonly hopCount: number;
  readonly capturedAtTick12: number;
}

// ── M2 BimbaPratibimba state interface ──────────────────────────────────────

/**
 * Full M2-side state published into the shared BimbaPratibimbaUiState. Extends
 * the six cross-layout spine fields with the M2-specific persistence slice.
 */
export interface M2BimbaPratibimbaUiState extends BimbaPratibimbaUiState {
  /** M2-composite lens + mode identifier (e.g. "M2':parashakti"). */
  readonly lens_mode: string;

  /** Profile tick counter at 12-beat resolution (shared with M1). */
  readonly tick12: number;

  /** Position within the 6-fold Ananda vortex ring (0..5). */
  readonly position6: number;

  /** Active 72-cell address index (0..71). */
  readonly address72: number;

  /** Klein flip surface-valence state. */
  readonly kleinFlipSurfaceValence: M2KleinFlipSurfaceValence;

  /** Layer-A grid active cell. */
  readonly layerAActiveCell: M2LayerAActiveCell;

  /** Layer-B correspondence card scroll offset. */
  readonly layerBCardScroll: number;

  /** Layer-C cymatic surface variant. */
  readonly layerCSurfaceVariant: M2SurfaceVariant;

  /** Layer-C zoom level (0.0 – 3.0). */
  readonly layerCZoom: number;

  /** Last observed F_routing trace from the M2 meaning-packet pipeline. */
  readonly lastRoutingTrace: FRoutingTraceHandle | null;

  /** Active axis-filter chips on the correspondence tree view. */
  readonly correspondenceTreeAxisFilter: readonly AxisName[];

  /** Active sonic-overlay tab on the correspondence tree. */
  readonly correspondenceTreeSonicOverlay: M2CorrespondenceTreeSonicOverlay;

  /** Active planetary view-mode (23.6). */
  readonly planetaryViewMode: PlanetaryViewMode;

  /** Dev-mode epogdoon proof overlay (23.8). */
  readonly epogdoonProofMode: boolean;
}

// ── Field-name spines (single source of truth) ──────────────────────────────

/**
 * The M2-specific fields beyond the shared spine. These are the M2-side state
 * fields that the kernel-bridge DI singleton contract must preserve across both
 * toggle classes (the six core profile coordinates plus the layer/view fields).
 */
export const M2_SIDE_STATE_FIELDS: readonly (keyof M2BimbaPratibimbaUiState)[] =
  Object.freeze([
    'lens_mode',
    'tick12',
    'position6',
    'address72',
    'kleinFlipSurfaceValence',
    'layerAActiveCell',
    'layerBCardScroll',
    'layerCSurfaceVariant',
    'layerCZoom',
    'lastRoutingTrace',
    'correspondenceTreeAxisFilter',
    'correspondenceTreeSonicOverlay',
    'planetaryViewMode',
    'epogdoonProofMode'
  ]);

/** Every persisted field: the cross-layout spine plus the M2-side slice. */
export const M2_BIMBA_PRATIBIMBA_STATE_FIELDS: readonly (keyof M2BimbaPratibimbaUiState)[] =
  Object.freeze([
    // Cross-layout spine (BimbaPratibimbaUiState)
    'coordinate',
    'lens',
    'mode',
    'profileGeneration',
    'sessionKey',
    'dayNow',
    // M2-side slice
    ...M2_SIDE_STATE_FIELDS
  ]);

// ── Toggle classes ──────────────────────────────────────────────────────────

export const M2_TOGGLE_CLASSES = Object.freeze([
  'layout:daily-0-1<->ide-deep',
  'face:cosmic<->personal-0/1'
] as const);

export type M2ToggleClass = Extract<
  CompositionToggleClass,
  typeof M2_TOGGLE_CLASSES[number]
>;

// ── Default / empty state ───────────────────────────────────────────────────

export const M2_EMPTY_STATE: M2BimbaPratibimbaUiState = Object.freeze({
  coordinate: null,
  lens: null,
  mode: null,
  profileGeneration: 0,
  sessionKey: null,
  dayNow: null,
  lens_mode: '',
  tick12: 0,
  position6: 0,
  address72: 0,
  kleinFlipSurfaceValence: 'primary',
  layerAActiveCell: Object.freeze({ lens: 0, position: 0 }),
  layerBCardScroll: 0,
  layerCSurfaceVariant: 'torus',
  layerCZoom: 1.0,
  lastRoutingTrace: null,
  correspondenceTreeAxisFilter: Object.freeze([] as AxisName[]),
  correspondenceTreeSonicOverlay: 'none',
  planetaryViewMode: 'vibrational',
  epogdoonProofMode: false
});

// ── Bridge / selector interface ─────────────────────────────────────────────

export interface M2BridgeSnapshot {
  readonly profile: MathemeHarmonicProfileBoundary | null;
  readonly context: {
    readonly canonicalMCoordinate: string | null;
    readonly profileGeneration: number | null;
    readonly dayNowSessionHandle: string | null;
    readonly sessionKey: string | null;
  };
}

export interface M2BimbaPratibimbaBridgeSource {
  currentSnapshot(): M2BridgeSnapshot;
}

export interface M2BimbaPratibimbaSelector {
  /** Read the full M2-side state as currently published. */
  readState(): M2BimbaPratibimbaUiState;

  /** Write a field-level update (normalised partial merge). */
  writeState(patch: Partial<M2BimbaPratibimbaUiState>): M2BimbaPratibimbaUiState;

  /** Apply a layout/face toggle, preserving every field identically. */
  toggleLayout(toggle: M2ToggleClass): M2BimbaPratibimbaUiState;
}

// ── Factory ─────────────────────────────────────────────────────────────────

export function createM2BimbaPratibimbaSelector(
  bridge: M2BimbaPratibimbaBridgeSource
): M2BimbaPratibimbaSelector {
  return new BridgeBackedM2BimbaPratibimbaSelector(bridge);
}

// ── Stable mock profile for acceptance tests ────────────────────────────────

export function createM2StableMockProfile(): MathemeHarmonicProfileBoundary {
  return Object.freeze({
    generation: 528,
    pointerAnchor: 'M2.5/Parashakti',
    capabilities: Object.freeze([
      'm2.bimbaPratibimbaState',
      'm2.meaningPacket',
      'm2.cymaticEngine',
      'm2.correspondenceTree'
    ]),
    payload: Object.freeze({
      tick12: 7,
      position6: 4,
      address72: 42,
      lens_mode: "M2':parashakti",
      lensMode: Object.freeze({ lens: "M2'", mode: 'parashakti' }),
      kleinFlip: Object.freeze({
        surfaceValence: 'inverted' as const,
        kind: 'M2CymaticValenceInvert',
        tick12: 7
      }),
      layerAActiveCell: Object.freeze({ lens: 2, position: 4 }),
      layerBCardScroll: 3,
      layerCSurfaceVariant: 'plate' as const,
      layerCZoom: 2.0,
      lastRoutingTrace: Object.freeze({
        traceId: 'trace-m2-001',
        route: 'm2.meaning_packet',
        address72: 42,
        hopCount: 3,
        capturedAtTick12: 7
      }),
      correspondenceTreeAxisFilter: Object.freeze(['decan-face', 'asma'] as AxisName[]),
      correspondenceTreeSonicOverlay: 'mantra' as const,
      planetaryViewMode: 'psychoid' as const,
      epogdoonProofMode: true,
      m2BimbaPratibimbaUiState: Object.freeze({
        coordinate: 'M2.5',
        lens: "M2'",
        mode: 'parashakti',
        sessionKey: 'acceptance:m2-parashakti',
        dayNow: '2026-06-19'
      })
    })
  });
}

// ── Private bridge-backed implementation ────────────────────────────────────

class BridgeBackedM2BimbaPratibimbaSelector implements M2BimbaPratibimbaSelector {
  private state: M2BimbaPratibimbaUiState;

  constructor(bridge: M2BimbaPratibimbaBridgeSource) {
    this.state = this.deriveStateFromProfile(bridge.currentSnapshot());
  }

  readState(): M2BimbaPratibimbaUiState {
    return this.state;
  }

  writeState(patch: Partial<M2BimbaPratibimbaUiState>): M2BimbaPratibimbaUiState {
    this.state = normalizeM2State({ ...this.state, ...patch });
    return this.state;
  }

  toggleLayout(toggle: M2ToggleClass): M2BimbaPratibimbaUiState {
    if (!M2_TOGGLE_CLASSES.includes(toggle)) {
      throw new Error(`unsupported M2 toggle class: ${String(toggle)}`);
    }
    // A toggle is an intra-process view change — state must survive identically.
    // Round-trip through the serialise/deserialise codec so the assertion
    // exercises a real persistence path, not a bare object reference.
    this.state = deserializeM2State(serializeM2State(this.state));
    return this.state;
  }

  // ── Profile-derived initial state ─────────────────────────────────────────

  private deriveStateFromProfile(snapshot: M2BridgeSnapshot): M2BimbaPratibimbaUiState {
    const profile = snapshot.profile;
    const payload = profile?.payload ?? {};
    const profileUi = recordValue(payload.m2BimbaPratibimbaUiState);
    const lensMode = recordValue(payload.lensMode);
    const kleinFlip = recordValue(payload.kleinFlip);

    const coordinate =
      stringValue(profileUi?.coordinate) ??
      snapshot.context.canonicalMCoordinate ??
      profile?.pointerAnchor ??
      null;
    const lens = stringValue(profileUi?.lens) ?? stringValue(lensMode?.lens) ?? null;
    const mode = stringValue(profileUi?.mode) ?? stringValue(lensMode?.mode) ?? null;

    return normalizeM2State({
      coordinate,
      lens,
      mode,
      profileGeneration:
        snapshot.context.profileGeneration ?? profile?.generation ?? 0,
      sessionKey:
        stringValue(profileUi?.sessionKey) ??
        snapshot.context.sessionKey ??
        (profile ? 'm2-parashakti' : null),
      dayNow:
        stringValue(profileUi?.dayNow) ??
        snapshot.context.dayNowSessionHandle ??
        null,
      lens_mode:
        stringValue(payload.lens_mode) ??
        (lens && mode ? `${lens}:${mode}` : M2_EMPTY_STATE.lens_mode),
      tick12: finiteNumber(payload.tick12) ?? M2_EMPTY_STATE.tick12,
      position6: finiteNumber(payload.position6) ?? M2_EMPTY_STATE.position6,
      address72: finiteNumber(payload.address72) ?? M2_EMPTY_STATE.address72,
      kleinFlipSurfaceValence: normalizeKleinFlipSurfaceValence(
        stringValue(kleinFlip?.surfaceValence)
      ),
      layerAActiveCell: normalizeLayerAActiveCell(payload.layerAActiveCell),
      layerBCardScroll: finiteNumber(payload.layerBCardScroll) ?? M2_EMPTY_STATE.layerBCardScroll,
      layerCSurfaceVariant: normalizeSurfaceVariant(stringValue(payload.layerCSurfaceVariant)),
      layerCZoom: finiteNumber(payload.layerCZoom) ?? M2_EMPTY_STATE.layerCZoom,
      lastRoutingTrace: normalizeRoutingTrace(payload.lastRoutingTrace),
      correspondenceTreeAxisFilter: normalizeAxisFilter(payload.correspondenceTreeAxisFilter),
      correspondenceTreeSonicOverlay: normalizeSonicOverlay(
        stringValue(payload.correspondenceTreeSonicOverlay)
      ),
      planetaryViewMode: normalizePlanetaryViewMode(stringValue(payload.planetaryViewMode)),
      epogdoonProofMode: payload.epogdoonProofMode === true
    });
  }
}

// ── Serialisation codec ─────────────────────────────────────────────────────

export function serializeM2State(state: M2BimbaPratibimbaUiState): string {
  return JSON.stringify(state);
}

export function deserializeM2State(raw: string): M2BimbaPratibimbaUiState {
  return normalizeM2State(JSON.parse(raw) as Partial<M2BimbaPratibimbaUiState>);
}

// ── State normalisation ─────────────────────────────────────────────────────

export function normalizeM2State(
  partial: Partial<M2BimbaPratibimbaUiState>
): M2BimbaPratibimbaUiState {
  return Object.freeze({
    coordinate: stringValue(partial.coordinate) ?? M2_EMPTY_STATE.coordinate,
    lens: stringValue(partial.lens) ?? M2_EMPTY_STATE.lens,
    mode: stringValue(partial.mode) ?? M2_EMPTY_STATE.mode,
    profileGeneration: finiteNumber(partial.profileGeneration) ?? M2_EMPTY_STATE.profileGeneration,
    sessionKey: stringValue(partial.sessionKey) ?? M2_EMPTY_STATE.sessionKey,
    dayNow: stringValue(partial.dayNow) ?? M2_EMPTY_STATE.dayNow,
    lens_mode: typeof partial.lens_mode === 'string' ? partial.lens_mode : M2_EMPTY_STATE.lens_mode,
    tick12: finiteNumber(partial.tick12) ?? M2_EMPTY_STATE.tick12,
    position6: finiteNumber(partial.position6) ?? M2_EMPTY_STATE.position6,
    address72: normalize72(finiteNumber(partial.address72) ?? M2_EMPTY_STATE.address72),
    kleinFlipSurfaceValence: normalizeKleinFlipSurfaceValence(
      stringValue(partial.kleinFlipSurfaceValence)
    ),
    layerAActiveCell: normalizeLayerAActiveCell(partial.layerAActiveCell),
    layerBCardScroll: finiteNumber(partial.layerBCardScroll) ?? M2_EMPTY_STATE.layerBCardScroll,
    layerCSurfaceVariant: normalizeSurfaceVariant(stringValue(partial.layerCSurfaceVariant)),
    layerCZoom: clampLayerCZoom(finiteNumber(partial.layerCZoom) ?? M2_EMPTY_STATE.layerCZoom),
    lastRoutingTrace: normalizeRoutingTrace(partial.lastRoutingTrace),
    correspondenceTreeAxisFilter: normalizeAxisFilter(partial.correspondenceTreeAxisFilter),
    correspondenceTreeSonicOverlay: normalizeSonicOverlay(
      stringValue(partial.correspondenceTreeSonicOverlay)
    ),
    planetaryViewMode: normalizePlanetaryViewMode(stringValue(partial.planetaryViewMode)),
    epogdoonProofMode: partial.epogdoonProofMode === true
  });
}

// ── Per-field normalisers ───────────────────────────────────────────────────

function normalizeKleinFlipSurfaceValence(value: string | null): M2KleinFlipSurfaceValence {
  return value === 'primary' || value === 'inverted' || value === 'transitioning'
    ? value
    : M2_EMPTY_STATE.kleinFlipSurfaceValence;
}

function normalizeSurfaceVariant(value: string | null): M2SurfaceVariant {
  return value === 'plate' || value === 'torus' || value === 'spheres'
    ? value
    : M2_EMPTY_STATE.layerCSurfaceVariant;
}

function normalizeSonicOverlay(value: string | null): M2CorrespondenceTreeSonicOverlay {
  return value === 'none' || value === 'mantra' || value === 'asma'
    ? value
    : M2_EMPTY_STATE.correspondenceTreeSonicOverlay;
}

function normalizePlanetaryViewMode(value: string | null): PlanetaryViewMode {
  return value === 'vibrational' || value === 'psychoid'
    ? value
    : M2_EMPTY_STATE.planetaryViewMode;
}

function isAxisName(value: unknown): value is AxisName {
  return typeof value === 'string' && (AXIS_NAMES as readonly string[]).includes(value);
}

function normalizeAxisFilter(value: unknown): readonly AxisName[] {
  if (!Array.isArray(value)) {
    return M2_EMPTY_STATE.correspondenceTreeAxisFilter;
  }
  const seen = new Set<AxisName>();
  for (const entry of value) {
    if (isAxisName(entry)) {
      seen.add(entry);
    }
  }
  // Canonical chip order so persistence is deterministic across toggles.
  return Object.freeze(AXIS_NAMES.filter(name => seen.has(name)));
}

function normalizeLayerAActiveCell(value: unknown): M2LayerAActiveCell {
  const record = recordValue(value);
  if (!record) {
    return M2_EMPTY_STATE.layerAActiveCell;
  }
  return Object.freeze({
    lens: nonNegativeInteger(finiteNumber(record.lens) ?? 0),
    position: nonNegativeInteger(finiteNumber(record.position) ?? 0)
  });
}

function normalizeRoutingTrace(value: unknown): FRoutingTraceHandle | null {
  const record = recordValue(value);
  if (!record) {
    return null;
  }
  if (
    typeof record.traceId === 'string' &&
    typeof record.route === 'string' &&
    typeof record.address72 === 'number' &&
    typeof record.hopCount === 'number' &&
    typeof record.capturedAtTick12 === 'number'
  ) {
    return Object.freeze({
      traceId: record.traceId,
      route: record.route,
      address72: record.address72,
      hopCount: record.hopCount,
      capturedAtTick12: record.capturedAtTick12
    });
  }
  return null;
}

function clampLayerCZoom(value: number): number {
  return Math.min(3.0, Math.max(0.0, value));
}

function normalize72(value: number): number {
  const rounded = Math.trunc(value);
  return ((rounded % 72) + 72) % 72;
}

function nonNegativeInteger(value: number): number {
  const truncated = Math.trunc(value);
  return truncated < 0 ? 0 : truncated;
}

// ── Low-level value helpers ─────────────────────────────────────────────────

function finiteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function stringValue(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function recordValue(value: unknown): Readonly<Record<string, unknown>> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Readonly<Record<string, unknown>>)
    : null;
}
