/**
 * Coordinate: M' M3' (inspectors pane body — Tracks 04.T4.2 + 24.T24.1/2/20)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): active-carrier M3 inspector composition surface.
 * Actualises: the `m3.mahamaya.inspectors` surface — the cosmic wheel as the
 *   alive default dominant zone (M3CosmicWheelRenderService, mode="full"),
 *   six SUMMONABLE inspectors (toggle chips; none open by default) + the
 *   four-mode cosmic-clock depth switch and authority-backed active-lens
 *   transcription engine, every value verbatim from the bridge or view
 *   model's bus windows (m3Inspectors.ts). Pending chips are rendered, never hidden.
 * Public surface: M3InspectorsPane.
 * Does NOT own: inspector law (m3Inspectors.ts), wheel rendering law
 *   (components/M3CosmicWheelRenderService.tsx), service transport
 *   (services/m3), the profile cache, or flexlayout.
 */

import { useEffect, useMemo, useState } from 'react';
import { gateway } from '../bridge/gatewayHolder';
import {
    LensCodonBinaryProjection,
    parseLensCodonBinaryProjection
} from '../bridge/types';
import {
    M3CosmicWheelRenderService
} from '../components/M3CosmicWheelRenderService';
import { M3PentadicRelationInspector } from '../components/M3PentadicRelationInspector';
import {
    M3TarotWheel,
    minorRefFromCardId,
    suitColour,
    suitElementName,
    tarotCardKeyString,
    type M3ArcanaState,
    type TarotCardKey
} from '../components/M3TarotWheel';
import { M3TranscriptionEngine } from '../components/M3TranscriptionEngine';
import { buildCouplingFlowOverlay } from '../engine/couplingFlowOverlay';
import { M3HexagramBrowser } from './M3HexagramBrowser';
import { M3IChingCastRibbon, parseIChingCastRibbonReceipt, type IChingCastRibbonReceipt } from './m3IChingCastRibbon';
import { M3ThirdSpandaPanel } from './M3ThirdSpandaPanel';
import { M3WalkNavigator } from './M3WalkNavigator';
import { useProvenanceStore } from '../state/stores';
import { MExtensionEmptyState } from '../ui/mExtensionEmptyStates';
import {
    M3ProfileTickProvider,
    M3ReadinessBoundary,
    M3ReadinessProvider,
    useM3ProfileTick,
    type M3ReadinessBindings
} from './m3SurfaceContext';
import {
    buildM3InspectorsView,
    M3_DEPTH_VIEW_ORDER,
    M3_INSPECTOR_ORDER,
    M3DepthView,
    M3InspectorId,
    SUIT_INTEGRAL_CITATION
} from './m3Inspectors';
import {
    createM3ServiceRegistry,
    type M3GatewayPort
} from '../services/m3';

const INSPECTOR_LABELS: Record<M3InspectorId, string> = {
    'dinucleotide-matrix': 'Dinucleotide matrix',
    'charge-quaternion': 'Charge quaternion',
    'spoke-ring-buffer': '24-spoke · ring buffer',
    'major-arcana': 'Major Arcana / chromosome',
    'dna-rna-phase': 'DNA/RNA phase',
    'suit-integral': 'Per-suit integral'
};

const FUNCTIONAL_LENS_METHOD = 'kernelBridge.m3.lensCodonBinary(lensId)';
const STATIC_LENS_NAMES = [
    'Microscopic', 'Binary', 'Quaternary', 'Octagonal', 'Enneadic', 'Decan',
    'Pleromatic', 'Hourly', 'Expanded Hours', 'Solar Month', 'Decadic',
    'Greater Chamber', 'Octant', 'Quadrant', 'Hemisphere', 'Unity'
] as const;

export function M3InspectorsPane() {
    return (
        <M3ProfileTickProvider>
            <M3InspectorsSurface />
        </M3ProfileTickProvider>
    );
}

function M3InspectorsSurface() {
    const tick = useM3ProfileTick();
    const cached = tick.cachedProfile;
    const connected = useProvenanceStore(s => s.connection.connected);
    const [open, setOpen] = useState<ReadonlySet<M3InspectorId>>(new Set());
    const [depthView, setDepthView] = useState<M3DepthView>('flat-clock-debug');
    const [selectedLensId, setSelectedLensId] = useState(16);
    const [showThirdSpanda, setShowThirdSpanda] = useState(false);
    const [showHexagramBrowser, setShowHexagramBrowser] = useState(false);
    const [showTarotWheel, setShowTarotWheel] = useState(false);
    const [tarotTurn, setTarotTurn] = useState<TarotTurnState | null>(null);
    const [functionalLens, setFunctionalLens] = useState<LensCodonBinaryProjection | null>(null);
    const [functionalLensError, setFunctionalLensError] = useState<string | null>(null);
    const [ichingReceipt, setIChingReceipt] = useState<IChingCastRibbonReceipt | null>(null);
    const [ichingPending, setIChingPending] = useState(false);
    const [ichingError, setIChingError] = useState<string | null>(null);
    const servicePort = useMemo<M3GatewayPort>(
        () => ({
            invoke: (method, params = {}) => gateway().invoke(method, params)
        }),
        []
    );
    const services = useMemo(
        () => createM3ServiceRegistry(servicePort),
        [servicePort]
    );

    useEffect(() => {
        if (!connected) {
            setFunctionalLens(null);
            return;
        }
        let active = true;
        setFunctionalLens(null);
        setFunctionalLensError(null);
        void servicePort.invoke(FUNCTIONAL_LENS_METHOD, { lensId: selectedLensId })
            .then(receipt => {
                if (active) setFunctionalLens(parseLensCodonBinaryProjection(receipt.artifact));
            })
            .catch(cause => {
                if (active) setFunctionalLensError(cause instanceof Error ? cause.message : String(cause));
            });
        return () => {
            active = false;
        };
    }, [connected, selectedLensId, servicePort]);

    const view = useMemo(() => {
        if (!cached) {
            return null;
        }
        return buildM3InspectorsView({
            payload: (cached.profile as Record<string, unknown> | null) ?? {},
            generation: cached.generation
        });
    }, [cached]);

    // 24.T24.1: the wheel is the alive default (dominant zone); the six
    // inspectors below stay summonable. Same payload, separate pure builder.
    const wheelSurface = useMemo(
        () =>
            services.cosmicClock.render({
                payload: (cached?.profile as Record<string, unknown> | null) ?? {},
                generation: cached?.generation ?? 0
            }),
        [cached, services]
    );
    const couplingFlow = useMemo(
        () => buildCouplingFlowOverlay((cached?.profile as Record<string, unknown> | null) ?? {}),
        [cached]
    );

    const toggle = (id: M3InspectorId) => {
        setOpen(previous => {
            const next = new Set(previous);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    // 24.T24.8 — the body-dynamics read, handed to the hexagram browser so the
    // browser stays a surface and the pane keeps owning the service registry.
    const lookupHexagramBody = useMemo(
        () => (hexagramId: number) => services.hexagramBodyDynamics.lookup(hexagramId),
        [services]
    );
    // The silhouette's halo is the ACTIVE CODON's suit element — now a bussed
    // fact (24.T24.6) rather than a renderer guess. No minor card, no halo.
    const bodyHalo = useMemo(
        () => haloFromMinorArcana(wheelSurface.minorArcana),
        [wheelSurface.minorArcana]
    );

    // 24.T24.6 — "turning the card IS changing the mode": every turn goes out
    // over `s2.codon.scalar_ref.read`. The gateway's tarot arm currently answers
    // an explicit `resolved: false` naming its owning tranche; that answer is
    // rendered verbatim rather than dressed up as a resolution or swallowed.
    const turnTarotCard = (card: TarotCardKey) => {
        const scalarRef = tarotCardKeyString(card);
        setTarotTurn({ card, status: 'pending', detail: `reading ${scalarRef}` });
        void services.tarotDecan
            .resolve(scalarRef)
            .then(receipt => setTarotTurn(readTarotTurn(card, receipt.artifact)))
            .catch(cause =>
                setTarotTurn({
                    card,
                    status: 'error',
                    detail: cause instanceof Error ? cause.message : String(cause)
                })
            );
    };

    const castIChing = () => {
        setIChingPending(true);
        setIChingError(null);
        void services.oracleCast.castIChing()
            .then(receipt => setIChingReceipt(parseIChingCastRibbonReceipt(receipt.artifact)))
            .catch(cause => setIChingError(cause instanceof Error ? cause.message : String(cause)))
            .finally(() => setIChingPending(false));
    };

    const m = view?.mahamaya ?? null;
    const pentadicView = services.pentadicTrace.render({
        payload: (cached?.profile as Record<string, unknown> | null) ?? {},
        generation: cached?.generation ?? 0
    });
    const pentadicTrace = pentadicView.trace;
    const readinessBindings: M3ReadinessBindings = {
        'm3.inspectors': view
            ? { state: 'ready', reason: 'profile-current' }
            : { state: 'pending', reason: 'pending-mahamaya' },
        'm3.cosmic-wheel': wheelSurface.activeProjection === null
            ? { state: 'pending', reason: wheelSurface.readiness.reason ?? 'pending-codon-rotation-projection' }
            : wheelSurface.readiness.surfaceReady
              ? { state: 'ready', reason: 'profile-current' }
              : { state: 'blocked', reason: wheelSurface.readiness.reason ?? 'wheel-authority-blocked' },
        'm3.quintessence': wheelSurface.quintessenceState === 'ready'
            ? { state: 'ready', reason: 'charge-quaternion-current' }
            : wheelSurface.quintessenceState === 'authority_payload_missing' ||
                wheelSurface.quintessenceState === 'authority_payload_invariant_violation'
              ? { state: 'blocked', reason: wheelSurface.quintessenceState }
              : { state: 'pending', reason: 'pending-charge-quaternion' },
        'm3.iching-cast': ichingError
            ? { state: 'blocked', reason: ichingError }
            : ichingPending
              ? { state: 'pending', reason: 'cast-pending' }
              : connected
                ? { state: 'ready', reason: ichingReceipt ? 'receipt-current' : 'cast-ready' }
                : { state: 'blocked', reason: 'gateway-disconnected' },
        'm3.third-spanda': pentadicTrace
            ? { state: 'ready', reason: 'profile-current' }
            : { state: 'pending', reason: 'pending-anuttara-pentadic-trace' },
        'm3.hexagram-browser': m?.hexagramId !== null && m?.hexagramId !== undefined
            ? { state: 'ready', reason: 'profile-current' }
            : { state: 'pending', reason: 'pending-mahamaya' },
        'm3.functional-lens': functionalLensError
            ? { state: 'blocked', reason: functionalLensError }
            : functionalLens
              ? { state: 'ready', reason: 'projection-current' }
              : connected
                ? { state: 'pending', reason: 'loading-lens-projection' }
                : { state: 'blocked', reason: 'gateway-disconnected' }
    };

    return (
        <M3ReadinessProvider bindings={readinessBindings}>
        <M3ReadinessBoundary
            bindingKey="m3.inspectors"
            fallback={{ state: 'pending', reason: 'pending-mahamaya' }}
        >
        <section
            className="mext-widget-detail"
            data-testid="m3-inspectors"
            data-state={view?.state ?? 'pending-mahamaya'}
            data-depth-view={depthView}
        >
            <h3>M3′ inspectors</h3>

            <M3CosmicWheelRenderService
                mode="full"
                surface={wheelSurface}
                clockMode={depthView}
            />
            <M3PentadicRelationInspector mode="full" view={pentadicView} />
            <M3IChingCastRibbon receipt={ichingReceipt} pending={ichingPending} error={ichingError} onCast={castIChing} />
            <M3WalkNavigator
                onAdvance={(walkId, direction) => services.walkNavigation.advance(walkId, direction)}
            />

            <div className="m3-inspector-summons" data-testid="m3-inspector-summons">
                {M3_INSPECTOR_ORDER.map(id => (
                    <button
                        key={id}
                        type="button"
                        className="instrument-toggle"
                        data-testid={`m3-summon-${id}`}
                        aria-pressed={open.has(id)}
                        onClick={() => toggle(id)}
                    >
                        {INSPECTOR_LABELS[id]}
                    </button>
                ))}
            </div>

            <div className="m3-depth-views" data-testid="m3-depth-views">
                {M3_DEPTH_VIEW_ORDER.map(mode => (
                    <button
                        key={mode}
                        type="button"
                        className="instrument-toggle"
                        data-testid={`m3-depth-${mode}`}
                        aria-pressed={depthView === mode}
                        onClick={() => setDepthView(mode)}
                    >
                        {mode}
                    </button>
                ))}
            </div>

            <div className="m3-surface-summons" data-testid="m3-surface-summons">
                <button
                    type="button"
                    className="instrument-toggle"
                    data-testid="m3-summon-third-spanda"
                    aria-pressed={showThirdSpanda}
                    onClick={() => setShowThirdSpanda(v => !v)}
                >
                    Third-Spanda runtime
                </button>
                <button
                    type="button"
                    className="instrument-toggle"
                    data-testid="m3-summon-hexagram-browser"
                    aria-pressed={showHexagramBrowser}
                    onClick={() => setShowHexagramBrowser(v => !v)}
                >
                    64-hexagram browser
                </button>
                <button
                    type="button"
                    className="instrument-toggle"
                    data-testid="m3-summon-tarot-wheel"
                    aria-pressed={showTarotWheel}
                    onClick={() => setShowTarotWheel(v => !v)}
                >
                    Tarot wheel 22+56
                </button>
            </div>

            {showThirdSpanda ? (
                <M3ThirdSpandaPanel
                    couplingFlow={couplingFlow}
                    trace={pentadicTrace ?? undefined}
                />
            ) : null}
            {showHexagramBrowser ? (
                <M3HexagramBrowser
                    lookupBody={lookupHexagramBody}
                    bodyHalo={bodyHalo}
                />
            ) : null}
            {showTarotWheel ? (
                <M3TarotWheel
                    majorArcana={wheelSurface.majorArcana}
                    minorArcana={wheelSurface.minorArcana}
                    onTurn={turnTarotCard}
                    turnState={tarotTurn}
                />
            ) : null}

            <M3ReadinessBoundary
                bindingKey="m3.functional-lens"
                fallback={{ state: 'pending', reason: 'loading-lens-projection' }}
            >
            <div className="m3-functional-lens" data-testid="m3-functional-lens">
                <label>
                    Functional lens
                    <select
                        data-testid="m3-functional-lens-select"
                        value={selectedLensId}
                        onChange={event => setSelectedLensId(Number(event.currentTarget.value))}
                    >
                        <option value={16}>Fibonacci Ground · primary</option>
                        {STATIC_LENS_NAMES.map((name, lensId) => (
                            <option key={name} value={lensId}>{name}</option>
                        ))}
                    </select>
                </label>
                <p data-testid="m3-functional-lens-readout">
                    {functionalLens
                        ? functionalLens.lensRole === 'primary-ground'
                            ? `Fibonacci Ground · primary · ${functionalLens.perDegree.length} positions · ${groundAddress(functionalLens)}`
                            : `${STATIC_LENS_NAMES[functionalLens.lensId]} · derived through Ground ${functionalLens.groundingLensId} · ${functionalLens.perDegree.length} boundaries · ${groundAddress(functionalLens)}`
                        : functionalLensError ?? (connected ? 'loading lens projection' : 'gateway disconnected')}
                </p>
            </div>
            <M3TranscriptionEngine
                activeLensId={selectedLensId}
                profileTick12={wheelSurface.tick12}
                projection={functionalLens}
            />
            </M3ReadinessBoundary>

            {view && m ? (
                <dl>
                    {open.has('dinucleotide-matrix') ? (
                        <>
                            <dt>Dinucleotide matrix</dt>
                            <dd data-testid="m3-dinucleotide">
                                codon {m.codon ?? m.codonId} · bits [{m.nucleotideBits.join(',')}] ·
                                trigrams {m.upperTrigram}/{m.lowerTrigram} · hexagram {m.hexagramId} ·
                                <em> full 16×16 labels: kernel-owned (pending)</em>
                            </dd>
                        </>
                    ) : null}
                    {open.has('charge-quaternion') ? (
                        <>
                            <dt>Charge quaternion</dt>
                            <dd data-testid="m3-charge-quaternion">
                                q_cosmic [{view.qCosmic ? view.qCosmic.map(v => v.toFixed(3)).join(', ') : '—'}]
                                · 4X audit: {view.fourXAudit}
                            </dd>
                        </>
                    ) : null}
                    {open.has('spoke-ring-buffer') ? (
                        <>
                            <dt>24-spoke · 12-deep ring</dt>
                            <dd data-testid="m3-spoke-ring">
                                spoke {view.activeSpoke ?? '—'}/24 · depth {view.ringDepth ?? '—'}/12 ·
                                history: {view.ringHistory}
                            </dd>
                        </>
                    ) : null}
                    {open.has('major-arcana') ? (
                        <>
                            <dt>Major Arcana / chromosome</dt>
                            <dd data-testid="m3-major-arcana">{view.majorArcana}</dd>
                        </>
                    ) : null}
                    {open.has('dna-rna-phase') ? (
                        <>
                            <dt>DNA/RNA phase</dt>
                            <dd data-testid="m3-dna-rna">
                                phase {m.dnaRnaPhase} · codon {m.codon ?? '—'} · line {m.lineIndex} ·
                                line-op {m.lineChangeOperatorAddress}
                                {m.roundTripLoss ? ' · non-exact round trip' : ' · round-trip anchor'}
                            </dd>
                        </>
                    ) : null}
                    {open.has('suit-integral') ? (
                        <>
                            <dt>Per-suit integral</dt>
                            <dd data-testid="m3-suit-integral">
                                {SUIT_INTEGRAL_CITATION.label} · active suit {view.suitIndex ?? '—'}
                                <small> · {SUIT_INTEGRAL_CITATION.provenance}</small>
                            </dd>
                        </>
                    ) : null}

                    <dt>Depth view</dt>
                    <dd data-testid="m3-depth-readout">
                        {depthView === 'flat-clock-debug'
                            ? `spoke ${view.activeSpoke ?? '—'} · tick12 ${view.ringDepth ?? '—'} · lut ${m.datasetLutState ?? '—'}`
                            : depthView === 'lens-annulus'
                              ? view.lensMode
                                  ? `lens ${view.lensMode.lens} · mode ${view.lensMode.mode} · 472:${view.lensMode.surfaceIndex}`
                                  : 'pending-codon-rotation-projection'
                              : depthView === 'toroidal-world'
                                ? view.toroidal
                                    ? `degree720 ${view.toroidal.degree720} · sheet ${view.toroidal.helixSheet}`
                                    : 'pending-clock'
                                : view.toroidal
                                  ? `SU(2) sheet ${view.toroidal.helixSheet} — identity returns at 720°`
                                  : 'pending-clock'}
                    </dd>
                </dl>
            ) : (
                // 32.T32.6 — pending-mahamaya, said through the registered M3
                // empty state: the same refusal to invent local codon/hexagram/
                // tarot tables, now naming which contributor is absent and who
                // owns it.
                <MExtensionEmptyState extensionId="m3-mahamaya" viewId="wheel" />
            )}
        </section>
        </M3ReadinessBoundary>
        </M3ReadinessProvider>
    );
}

/**
 * The body viewer's halo is the active codon's suit element. When the codon
 * falls outside the 56-card cover there IS no suit, so there is no halo —
 * absence, not a default colour standing in for one.
 */
function haloFromMinorArcana(
    state: M3ArcanaState
): { readonly element: string; readonly colour: string } | null {
    if (state.kind !== 'card') {
        return null;
    }
    const ref = minorRefFromCardId(state.cardId);
    return ref === null
        ? null
        : { element: suitElementName(ref.suit), colour: suitColour(ref.suit) };
}

interface TarotTurnState {
    readonly card: TarotCardKey;
    readonly status: 'pending' | 'resolved' | 'unresolved' | 'error';
    readonly detail: string;
}

/**
 * Read a `s2.codon.scalar_ref.read` artifact into the turn readout.
 *
 * The method answers one of two honest shapes: `resolved: true` with an entry,
 * or `resolved: false` with a `reason` and the `ownerTranche` that owes the
 * producer. Both are rendered as themselves — an unresolved turn is a real
 * answer about the substrate, and flattening it into a generic error would hide
 * which tranche owns the gap.
 */
function readTarotTurn(card: TarotCardKey, artifact: unknown): TarotTurnState {
    const record =
        artifact !== null && typeof artifact === 'object' && !Array.isArray(artifact)
            ? (artifact as Record<string, unknown>)
            : null;
    const inner =
        record?.detail !== null && typeof record?.detail === 'object' && !Array.isArray(record.detail)
            ? (record.detail as Record<string, unknown>)
            : record;
    // `resolved` lives on the OUTER record (24.T24.6 tarot arm: the card facts
    // nest under `detail`, the resolution verdict does not travel down with
    // them); older pending replies carry it flat. Check both homes.
    if (record?.resolved === true || inner?.resolved === true) {
        const kindValue = record?.kind ?? inner?.kind;
        const kind = typeof kindValue === 'string' ? kindValue : null;
        return { card, status: 'resolved', detail: kind ? `resolved (${kind})` : 'resolved' };
    }
    const reason = typeof inner?.reason === 'string' ? inner.reason : 'unresolved';
    const owner = typeof inner?.ownerTranche === 'string' ? ` (owner ${inner.ownerTranche})` : '';
    return { card, status: 'unresolved', detail: `${reason}${owner}` };
}

function groundAddress(projection: LensCodonBinaryProjection): string {
    const ground = projection.perDegree[0];
    return ground ? `fib ${ground.fibonacciPosition} · digit ${ground.fibonacciDigit}` : 'ground unavailable';
}
