/**
 * Coordinate: M' M4' (Medicine pane - 25.T25.10)
 * Residency: Body/M/pratibimba-app/src/panes
 * Position (#n): protected-local three-panel correspondence surface
 * Actualises: chakra ladder, active decan, herb evidence, governed NOW pin.
 * Public surface: MedicineViewPane.
 * Does NOT own: medical authority, prescriptions, Medicine LUTs, or clocks.
 * Contract: [[M4'-SPEC]] / [[CHROME-CONTRACT]].
 */

import { privacyChrome } from '../ui/privacyChrome';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { gateway, gatewayReady } from '../bridge/gatewayHolder';
import { commands } from '../commands/registry';
import { CROSS_LAYOUT_INTENT_COMMAND } from '../commands/crossLayoutIntent';
import { useSessionStore, useTickStore } from '../state/stores';
import {
    MEDICINE_PIN_METHOD,
    MEDICINE_SNAPSHOT_METHOD,
    MedicineHerb,
    MedicineSnapshot,
    medicineSunDegree,
    parseMedicineSnapshot
} from './medicineView';

// CANONICAL-B ([[L2']]) ids — `dominantElementId` crosses the M2↔M3 boundary and
// the substrate normalises it (`canonical_from_m2_tattva`), so these are the
// canonical names, NOT the tattva ones used on the planet/chakra scene path.
// Only the operative quartet appears: a chakra's dominant element is never Aether
// or Salt. See `engine/elementRegisters.ts` + DR-L2-ASPECT-1.
const ELEMENT_NAMES: Record<number, string> = { 1: 'Earth', 2: 'Water', 3: 'Air', 4: 'Fire' };

export interface MedicineViewPaneProps {
    readonly fixture?: MedicineSnapshot;
    readonly loadSnapshot?: (sunDegree: number) => Promise<MedicineSnapshot>;
    readonly pinMateria?: (materia: string) => Promise<void>;
    readonly onOpenKairos?: () => void;
}

export function MedicineViewPane({ fixture, loadSnapshot, pinMateria, onOpenKairos }: MedicineViewPaneProps) {
    const cached = useTickStore(state => state.profile);
    const generation = useTickStore(state => state.generation);
    const dayNow = useSessionStore(state => state.dayNow);
    const sessionKey = useSessionStore(state => state.sessionKey);
    const [snapshot, setSnapshot] = useState<MedicineSnapshot | null>(fixture ?? null);
    const [expanded, setExpanded] = useState<ReadonlySet<number>>(() => new Set());
    const [pinned, setPinned] = useState<ReadonlySet<string>>(() => new Set());
    const [pinning, setPinning] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const sunDegree = useMemo(() => medicineSunDegree(cached?.profile ?? null), [cached]);

    const refresh = useCallback(() => {
        if (fixture) return;
        if (sunDegree === null) {
            setError('Live Sun degree is not projected by the current profile.');
            return;
        }
        if (!loadSnapshot && !gatewayReady()) {
            setError('Gateway disconnected. Medicine evidence was not loaded.');
            return;
        }
        const load = loadSnapshot
            ? loadSnapshot(sunDegree)
            : gateway().invoke(MEDICINE_SNAPSHOT_METHOD, { sunDegree })
                .then(receipt => parseMedicineSnapshot(receipt.artifact));
        load
            .then(next => {
                setSnapshot(next);
                setError(null);
            })
            .catch(cause => setError(cause instanceof Error ? cause.message : String(cause)));
    }, [fixture, loadSnapshot, sunDegree]);

    useEffect(refresh, [refresh, generation]);

    const toggleZones = (id: number) => {
        setExpanded(current => {
            const next = new Set(current);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const pin = (herb: MedicineHerb) => {
        if (pinned.has(herb.vernacular) || pinning) return;
        setPinning(herb.vernacular);
        setError(null);
        const persist = pinMateria
            ? pinMateria(herb.vernacular)
            : gateway().invoke(MEDICINE_PIN_METHOD, { materia: herb.vernacular }).then(() => undefined);
        void persist
            .then(() => setPinned(current => new Set([...current, herb.vernacular])))
            .catch(cause => setError(cause instanceof Error ? cause.message : String(cause)))
            .finally(() => setPinning(null));
    };

    const openKairos = () => {
        if (onOpenKairos) {
            onOpenKairos();
            return;
        }
        void commands.execute(CROSS_LAYOUT_INTENT_COMMAND, {
            coordinate: 'M4',
            artifactUri: null,
            reviewId: null,
            dayNow,
            sessionKey,
            profileGeneration: generation,
            privacyClass: 'protected',
            requestedExtensionId: 'm4-nara',
            requestedContributionId: 'kairos'
        });
    };

    const active = snapshot?.activeDecan ?? null;
    return (
        <section className={`medicine-pane ${privacyChrome('protected_local').className}`}
            title={privacyChrome('protected_local').title} data-testid="medicine-pane">
            <header className="medicine-header">
                <div>
                    <strong>Medicine correspondences</strong>
                    <span>Protected local view · profile generation {generation ?? 'pending'}</span>
                </div>
                <p>Correspondence evidence, not medical authority. Never a prescription.</p>
            </header>

            {error ? <p className="medicine-error" data-testid="medicine-error">{error}</p> : null}

            <div className="medicine-panels">
                <section
                    className="medicine-panel medicine-chakras"
                    aria-label="Chakra ladder — the yogic body"
                    data-body-ontology="yogic"
                    data-owner-coordinate="M2-2"
                >
                    <h2>Chakra ladder</h2>
                    <p className="medicine-ontology-note">
                        Yogic body · tattva ladder (M2-2)
                    </p>
                    <ol>
                        {snapshot?.chakras.map(chakra => {
                            const isActive = chakra.id === active?.activeChakraId;
                            const isExpanded = expanded.has(chakra.id);
                            return (
                                // `isActive` is the decan→element→chakra
                                // CORRESPONDENCE reaching across from the
                                // Hermetic body, not a fact of the yogic one.
                                <li
                                    key={chakra.id}
                                    data-active={isActive}
                                    data-corresponded-from={isActive ? 'm2-3-decan' : undefined}
                                    title={
                                        isActive
                                            ? 'Corresponded from the active decan through the shared element — a claim between two body ontologies, not an identity'
                                            : undefined
                                    }
                                >
                                    <button
                                        type="button"
                                        className="medicine-chakra-toggle"
                                        onClick={() => toggleZones(chakra.id)}
                                        aria-expanded={isExpanded}
                                    >
                                        <span>{chakra.id}</span>
                                        <strong>{chakra.name}</strong>
                                        <small>{chakra.dominantElementId ? ELEMENT_NAMES[chakra.dominantElementId] : 'Trans-elemental'}</small>
                                    </button>
                                    {isExpanded ? (
                                        <ul className="medicine-zone-list">
                                            {chakra.bodyZones.map(zone => <li key={zone}>{zone.replaceAll('_', ' ')}</li>)}
                                        </ul>
                                    ) : null}
                                </li>
                            );
                        })}
                    </ol>
                </section>

                <section
                    className="medicine-panel medicine-decan"
                    aria-label="Active decan — the Hermetic body"
                    data-body-ontology="hermetic"
                    data-owner-coordinate="M2-3"
                >
                    <h2>Active decan</h2>
                    <p className="medicine-ontology-note">
                        Hermetic body · decan/zodiac (M2-3) — a different body from the ladder
                    </p>
                    {active ? (
                        <div className="medicine-decan-reading" data-testid="medicine-active-decan">
                            <span className="medicine-decan-index">Decan {active.decanIdx + 1} · {active.sunDegree.toFixed(2)}°</span>
                            <strong>{active.bodyPart}</strong>
                            <span className="medicine-planet"><b>{active.rulingPlanetGlyph}</b>{active.rulingPlanet}</span>
                            <button type="button" onClick={openKairos}>Open Kairos</button>
                        </div>
                    ) : <p className="pane-message">Awaiting live Medicine snapshot.</p>}
                </section>

                <section className="medicine-panel medicine-herbs" aria-label="Herbal evidence">
                    <h2>Herbal evidence</h2>
                    {active?.herbs.map(herb => {
                        const isPinned = pinned.has(herb.vernacular);
                        return (
                            <article key={herb.vernacular} className="medicine-herb" data-testid="medicine-herb">
                                <div>
                                    <strong>{herb.vernacular}</strong>
                                    <em>{herb.botanical}</em>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => pin(herb)}
                                    disabled={isPinned || pinning === herb.vernacular}
                                >
                                    {isPinned ? 'Pinned to NOW' : pinning === herb.vernacular ? 'Pinning…' : 'Pin to NOW'}
                                </button>
                            </article>
                        );
                    }) ?? <p className="pane-message">No active materia projected.</p>}
                    <p className="medicine-evidence-note">Names are correspondence evidence only. Verify identity, interactions, and suitability with a qualified professional.</p>
                </section>
            </div>
        </section>
    );
}
