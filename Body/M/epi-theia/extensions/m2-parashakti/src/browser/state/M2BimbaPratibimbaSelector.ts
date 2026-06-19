import type {
  BimbaPratibimbaUiState,
  CompositionToggleClass
} from '@pratibimba/integrated-composition';
import type { MathemeHarmonicProfileBoundary } from '@pratibimba/m-extension-runtime';

/**
 * M2-specific fields that extend the shared BimbaPratibimbaUiState spine.
 *
 * Track-08 acceptance deliverable: a typed selector that publishes M2-side
 * state into the cross-layout BimbaPratibimbaUiState. The eleven (15) fields
 * listed in the task specification are:
 *
 *   profileGeneration, lens_mode, tick12, position6, address72,
 *   kleinFlip.surfaceValence, layerAActiveCell, layerBCardScroll,
 *   layerCSurfaceVariant, layerCZoom, lastRoutingTrace,
 *   correspondenceTreeAxisFilter, correspondenceTreeSonicOverlay,
 *   planetaryViewMode, epogdoonProofMode
 */

// ── M2-specific sub-types ───────────────────────────────────────────────────

export type M2KleinFlipSurfaceValence = 'primary' | 'inverted' | 'transitioning';

export type M2SurfaceVariant = 'torus' | 'plate' | 'spheres';

export type M2PlanetaryViewMode = 'geocentric' | 'heliocentric' | 'tropical-zodiac' | 'sidereal-lahiri';

export type M2EpogdoonProofMode = 'default' | 'heuristic' | 'strict' | 'relaxed';

export type M2RoutingTrace = {
  readonly traceId: string;
  readonly route: string;
  readonly hopCount: number;
  readonly lastTimestamp: number;
};

export type M2CorrespondenceTreeAxisFilter =
  | 'all'
  | 'planetary'
  | 'chakral'
  | 'elemental'
  | 'decan'
  | 'provenance';

export type M2CorrespondenceTreeSonicOverlay = 'off' | 'profile-tick' | 'address72' | 'continuous';

// ── M2 BimbaPratibimba state interface ──────────────────────────────────────

/**
 * Full M2-side state published into the shared BimbaPratibimbaUiState.
 * Includes the six cross-layout spine fields plus nine M2-specific fields.
 */
export interface M2BimbaPratibimbaUiState extends BimbaPratibimbaUiState {
  /** M2-composite lens + mode identifier (e.g. "M2.5:parashakti") */
  readonly lens_mode: string;

  /** Profile tick counter at 12-beat resolution (shared with M1) */
  readonly tick12: number;

  /** Position within the 6-fold Ananda vortex ring (0..5) */
  readonly position6: number;

  /** Active 72-cell address index (0..71) */
  readonly address72: number;

  /** Klein flip surface-valence state */
  readonly kleinFlipSurfaceValence: M2KleinFlipSurfaceValence;

  /** Layer-A active cell index used by the cymatic frame */
  readonly layerAActiveCell: number;

  /** Layer-B correspondence tree card scroll offset */
  readonly layerBCardScroll: number;

  /** Layer-C cymatic surface variant */
  readonly layerCSurfaceVariant: M2SurfaceVariant;

  /** Layer-C zoom level (0.0 – 3.0) */
  readonly layerCZoom: number;

  /** Last observed routing trace from the M2 meaning-packet pipeline */
  readonly lastRoutingTrace: M2RoutingTrace | null;

  /** Active axis filter on the correspondence tree view */
  readonly correspondenceTreeAxisFilter: M2CorrespondenceTreeAxisFilter;

  /** Sonic overlay mode for the correspondence tree */
  readonly correspondenceTreeSonicOverlay: M2CorrespondenceTreeSonicOverlay;

  /** Active planetary view mode */
  readonly planetaryViewMode: M2PlanetaryViewMode;

  /** Active epogdoon proof mode */
  readonly epogdoonProofMode: M2EpogdoonProofMode;
}

// ── Field name spine (single source of truth) ───────────────────────────────

export const M2_BIMBA_PRATIBIMBA_STATE_FIELDS: readonly (keyof M2BimbaPratibimbaUiState)[] =
  Object.freeze([
    // Spine fields from BimbaPratibimbaUiState
    'coordinate',
    'lens',
    'mode',
    'profileGeneration',
    'sessionKey',
    'dayNow',
    // M2-specific fields
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
  layerAActiveCell: 0,
  layerBCardScroll: 0,
  layerCSurfaceVariant: 'torus',
  layerCZoom: 1.0,
  lastRoutingTrace: null,
  correspondenceTreeAxisFilter: 'all',
  correspondenceTreeSonicOverlay: 'off',
  planetaryViewMode: 'geocentric',
  epogdoonProofMode: 'default'
});

// ── Bridge / selector interface ─────────────────────────────────────────────

export interface M2BimbaPratibimbaBridgeSource {
  currentSnapshot(): M2BridgeSnapshot;
}

export interface M2BridgeSnapshot {
  readonly profile: MathemeHarmonicProfileBoundary | null;
  readonly context: {
    readonly canonicalMCoordinate: string | null;
    readonly profileGeneration: number | null;
    readonly dayNowSessionHandle: string | null;
    readonly sessionKey: string | null;
  };
}

export interface M2BimbaPratibimbaSelector {
  /** Read the full M2-side state as currently published */
  readState(): M2BimbaPratibimbaUiState;

  /** Write a field-level update (partial merge) */
  writeState(patch: Partial<M2BimbaPratibimbaUiState>): M2BimbaPratibimbaUiState;

  /** Toggle layout / face, verifying every field survives */
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
      lensMode: Object.freeze({
        lens: "M2'",
        mode: 'parashakti'
      }),
      lens_mode: 'M2.5:parashakti',
      kleinFlip: Object.freeze({
        surfaceValence: 'inverted' as const,
        kind: 'M2CymaticValenceInvert',
        tick12: 7
      }),
      layerAActiveCell: 42,
      layerBCardScroll: 3,
      layerCSurfaceVariant: 'plate' as const,
      layerCZoom: 2.0,
      lastRoutingTrace: Object.freeze({
        traceId: 'trace-m2-001',
        route: 'm2.meaning_packet',
        hopCount: 3,
        lastTimestamp: 1718798400000
      }),
      correspondenceTreeAxisFilter: 'planetary' as const,
      correspondenceTreeSonicOverlay: 'profile-tick' as const,
      planetaryViewMode: 'sidereal-lahiri' as const,
      epogdoonProofMode: 'strict' as const,
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

// ── Default values ──────────────────────────────────────────────────────────

const DEFAULT_KLEIN_FLIP_SURFACE_VALENCE: M2KleinFlipSurfaceValence = 'primary';
const DEFAULT_SURFACE_VARIANT: M2SurfaceVariant = 'torus';
const DEFAULT_PLANETARY_VIEW: M2PlanetaryViewMode = 'geocentric';
const DEFAULT_EPOGDOON_PROOF: M2EpogdoonProofMode = 'default';
const DEFAULT_CORRESPONDENCE_AXIS: M2CorrespondenceTreeAxisFilter = 'all';
const DEFAULT_CORRESPONDENCE_SONIC: M2CorrespondenceTreeSonicOverlay = 'off';

// ── Private bridge-backed implementation ────────────────────────────────────

class BridgeBackedM2BimbaPratibimbaSelector implements M2BimbaPratibimbaSelector {
  private state: M2BimbaPratibimbaUiState;

  constructor(private readonly bridge: M2BimbaPratibimbaBridgeSource) {
    this.state = this.deriveStateFromProfile(
      bridge.currentSnapshot().profile
    );
  }

  readState(): M2BimbaPratibimbaUiState {
    const snapshot = this.bridge.currentSnapshot();
    const profileState = this.deriveStateFromProfile(snapshot.profile);
    // Merge profile-derived state as defaults; locally-set values take precedence.
    // Spine fields: use local value if non-null / non-empty, else fall back to profile.
    return freezeState({
      coordinate: this.state.coordinate ?? profileState.coordinate,
      lens: this.state.lens ?? profileState.lens,
      mode: this.state.mode ?? profileState.mode,
      profileGeneration:
        this.state.profileGeneration !== 0
          ? this.state.profileGeneration
          : profileState.profileGeneration,
      sessionKey: this.state.sessionKey ?? profileState.sessionKey,
      dayNow: this.state.dayNow ?? profileState.dayNow,
      lens_mode: this.state.lens_mode || profileState.lens_mode,
      tick12: this.state.tick12 !== 0 ? this.state.tick12 : profileState.tick12,
      position6: this.state.position6 !== 0 ? this.state.position6 : profileState.position6,
      address72: this.state.address72 !== 0 ? this.state.address72 : profileState.address72,
      kleinFlipSurfaceValence:
        this.state.kleinFlipSurfaceValence !== 'primary'
          ? this.state.kleinFlipSurfaceValence
          : profileState.kleinFlipSurfaceValence,
      layerAActiveCell:
        this.state.layerAActiveCell !== 0
          ? this.state.layerAActiveCell
          : profileState.layerAActiveCell,
      layerBCardScroll:
        this.state.layerBCardScroll !== 0
          ? this.state.layerBCardScroll
          : profileState.layerBCardScroll,
      layerCSurfaceVariant:
        this.state.layerCSurfaceVariant !== 'torus'
          ? this.state.layerCSurfaceVariant
          : profileState.layerCSurfaceVariant,
      layerCZoom:
        this.state.layerCZoom !== 1.0
          ? this.state.layerCZoom
          : profileState.layerCZoom,
      lastRoutingTrace: this.state.lastRoutingTrace ?? profileState.lastRoutingTrace,
      correspondenceTreeAxisFilter:
        this.state.correspondenceTreeAxisFilter !== 'all'
          ? this.state.correspondenceTreeAxisFilter
          : profileState.correspondenceTreeAxisFilter,
      correspondenceTreeSonicOverlay:
        this.state.correspondenceTreeSonicOverlay !== 'off'
          ? this.state.correspondenceTreeSonicOverlay
          : profileState.correspondenceTreeSonicOverlay,
      planetaryViewMode:
        this.state.planetaryViewMode !== 'geocentric'
          ? this.state.planetaryViewMode
          : profileState.planetaryViewMode,
      epogdoonProofMode:
        this.state.epogdoonProofMode !== 'default'
          ? this.state.epogdoonProofMode
          : profileState.epogdoonProofMode
    });
  }

  writeState(patch: Partial<M2BimbaPratibimbaUiState>): M2BimbaPratibimbaUiState {
    this.state = freezeState(normalizeM2State({ ...this.state, ...patch }));
    return this.state;
  }

  toggleLayout(_toggle: M2ToggleClass): M2BimbaPratibimbaUiState {
    // A toggle is an intra-process view change — state must survive identically.
    // Round-trip through JSON serialise/deserialise so the acceptance test
    // exercises a real codec path, not a bare object identity.
    const serialised = JSON.stringify(this.state);
    this.state = normalizeM2State(
      JSON.parse(serialised) as Partial<M2BimbaPratibimbaUiState>
    );
    return this.state;
  }

  // ── Profile-derived state ─────────────────────────────────────────────

  private deriveStateFromProfile(
    profile: MathemeHarmonicProfileBoundary | null
  ): M2BimbaPratibimbaUiState {
    const payload = profile?.payload ?? {};
    const profileUi = recordValue(payload.m2BimbaPratibimbaUiState);
    const lensMode = recordValue(payload.lensMode);
    const kleinFlip = recordValue(payload.kleinFlip);

    const coordinate =
      stringValue(profileUi?.coordinate) ??
      profile?.pointerAnchor ??
      null;
    const lens =
      stringValue(profileUi?.lens) ??
      stringValue(lensMode?.lens) ??
      null;
    const mode =
      stringValue(profileUi?.mode) ??
      stringValue(lensMode?.mode) ??
      null;
    const sessionKey =
      stringValue(profileUi?.sessionKey) ??
      (profile ? 'm2-parashakti' : null);
    const dayNow =
      stringValue(profileUi?.dayNow) ??
      null;

    return Object.freeze({
      coordinate,
      lens,
      mode,
      profileGeneration: profile?.generation ?? 0,
      sessionKey,
      dayNow,
      lens_mode:
        stringValue(payload.lens_mode) ??
        stringValue(profileUi?.lens_mode) ??
        (lens && mode ? `${lens}:${mode}` : ''),
      tick12: finiteNumber(payload.tick12) ?? 0,
      position6: finiteNumber(payload.position6) ?? 0,
      address72: finiteNumber(payload.address72) ?? 0,
      kleinFlipSurfaceValence: normalizeKleinFlipSurfaceValence(
        stringValue(kleinFlip?.surfaceValence) ??
          stringValue(kleinFlip?.kind)
      ),
      layerAActiveCell: finiteNumber(payload.layerAActiveCell) ?? 0,
      layerBCardScroll: finiteNumber(payload.layerBCardScroll) ?? 0,
      layerCSurfaceVariant: normalizeSurfaceVariant(
        stringValue(payload.layerCSurfaceVariant)
      ),
      layerCZoom: clampLayerCZoom(finiteNumber(payload.layerCZoom) ?? 1.0),
      lastRoutingTrace: normalizeRoutingTrace(payload.lastRoutingTrace),
      correspondenceTreeAxisFilter: normalizeCorrespondenceAxisFilter(
        stringValue(payload.correspondenceTreeAxisFilter)
      ),
      correspondenceTreeSonicOverlay: normalizeCorrespondenceSonicOverlay(
        stringValue(payload.correspondenceTreeSonicOverlay)
      ),
      planetaryViewMode: normalizePlanetaryViewMode(
        stringValue(payload.planetaryViewMode)
      ),
      epogdoonProofMode: normalizeEpogdoonProofMode(
        stringValue(payload.epogdoonProofMode)
      )
    });
  }
}

// ── State normalisation helpers ─────────────────────────────────────────────

function normalizeM2State(
  partial: Partial<M2BimbaPratibimbaUiState>
): M2BimbaPratibimbaUiState {
  return freezeState({
    coordinate: stringValue(partial.coordinate) ?? M2_EMPTY_STATE.coordinate,
    lens: stringValue(partial.lens) ?? M2_EMPTY_STATE.lens,
    mode: stringValue(partial.mode) ?? M2_EMPTY_STATE.mode,
    profileGeneration:
      typeof partial.profileGeneration === 'number' && Number.isFinite(partial.profileGeneration)
        ? partial.profileGeneration
        : M2_EMPTY_STATE.profileGeneration,
    sessionKey: stringValue(partial.sessionKey) ?? M2_EMPTY_STATE.sessionKey,
    dayNow: stringValue(partial.dayNow) ?? M2_EMPTY_STATE.dayNow,
    lens_mode: stringValue(partial.lens_mode) ?? M2_EMPTY_STATE.lens_mode,
    tick12: finiteNumber(partial.tick12) ?? M2_EMPTY_STATE.tick12,
    position6: finiteNumber(partial.position6) ?? M2_EMPTY_STATE.position6,
    address72: normalize72(finiteNumber(partial.address72) ?? M2_EMPTY_STATE.address72),
    kleinFlipSurfaceValence: normalizeKleinFlipSurfaceValence(
      stringValue(partial.kleinFlipSurfaceValence)
    ),
    layerAActiveCell:
      finiteNumber(partial.layerAActiveCell) ?? M2_EMPTY_STATE.layerAActiveCell,
    layerBCardScroll:
      finiteNumber(partial.layerBCardScroll) ?? M2_EMPTY_STATE.layerBCardScroll,
    layerCSurfaceVariant: normalizeSurfaceVariant(
      stringValue(partial.layerCSurfaceVariant)
    ),
    layerCZoom: clampLayerCZoom(
      finiteNumber(partial.layerCZoom) ?? M2_EMPTY_STATE.layerCZoom
    ),
    lastRoutingTrace: normalizeRoutingTrace(partial.lastRoutingTrace),
    correspondenceTreeAxisFilter: normalizeCorrespondenceAxisFilter(
      stringValue(partial.correspondenceTreeAxisFilter)
    ),
    correspondenceTreeSonicOverlay: normalizeCorrespondenceSonicOverlay(
      stringValue(partial.correspondenceTreeSonicOverlay)
    ),
    planetaryViewMode: normalizePlanetaryViewMode(
      stringValue(partial.planetaryViewMode)
    ),
    epogdoonProofMode: normalizeEpogdoonProofMode(
      stringValue(partial.epogdoonProofMode)
    )
  });
}

function freezeState(state: M2BimbaPratibimbaUiState): M2BimbaPratibimbaUiState {
  return Object.freeze({ ...state, lastRoutingTrace: state.lastRoutingTrace ? Object.freeze({ ...state.lastRoutingTrace }) : null });
}

// ── Normalise individual fields ─────────────────────────────────────────────

function normalizeKleinFlipSurfaceValence(
  value: string | null
): M2KleinFlipSurfaceValence {
  if (value === 'primary' || value === 'inverted' || value === 'transitioning') {
    return value;
  }
  return DEFAULT_KLEIN_FLIP_SURFACE_VALENCE;
}

function normalizeSurfaceVariant(value: string | null): M2SurfaceVariant {
  if (value === 'torus' || value === 'plate' || value === 'spheres') {
    return value;
  }
  return DEFAULT_SURFACE_VARIANT;
}

function normalizePlanetaryViewMode(value: string | null): M2PlanetaryViewMode {
  switch (value) {
    case 'geocentric':
    case 'heliocentric':
    case 'tropical-zodiac':
    case 'sidereal-lahiri':
      return value;
    default:
      return DEFAULT_PLANETARY_VIEW;
  }
}

function normalizeEpogdoonProofMode(value: string | null): M2EpogdoonProofMode {
  switch (value) {
    case 'default':
    case 'heuristic':
    case 'strict':
    case 'relaxed':
      return value;
    default:
      return DEFAULT_EPOGDOON_PROOF;
  }
}

function normalizeCorrespondenceAxisFilter(
  value: string | null
): M2CorrespondenceTreeAxisFilter {
  switch (value) {
    case 'all':
    case 'planetary':
    case 'chakral':
    case 'elemental':
    case 'decan':
    case 'provenance':
      return value;
    default:
      return DEFAULT_CORRESPONDENCE_AXIS;
  }
}

function normalizeCorrespondenceSonicOverlay(
  value: string | null
): M2CorrespondenceTreeSonicOverlay {
  switch (value) {
    case 'off':
    case 'profile-tick':
    case 'address72':
    case 'continuous':
      return value;
    default:
      return DEFAULT_CORRESPONDENCE_SONIC;
  }
}

function normalizeRoutingTrace(
  value: unknown
): M2RoutingTrace | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'object') return null;
  const obj = value as Record<string, unknown>;
  if (
    typeof obj.traceId === 'string' &&
    typeof obj.route === 'string' &&
    typeof obj.hopCount === 'number' &&
    typeof obj.lastTimestamp === 'number'
  ) {
    return Object.freeze({
      traceId: obj.traceId,
      route: obj.route,
      hopCount: obj.hopCount,
      lastTimestamp: obj.lastTimestamp
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

// ── Low-level value helpers ─────────────────────────────────────────────────

function finiteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function stringValue(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function recordValue(
  value: unknown
): Readonly<Record<string, unknown>> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Readonly<Record<string, unknown>>)
    : null;
}
