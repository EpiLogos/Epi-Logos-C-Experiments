/**
 * Coordinate: M' M4' (Personal Coordinate sidebar — Track 25.T25.7)
 * Actualises: the LIVE Q_personal current-state sidebar (complement of 5.1's
 *   per-artifact render — SAME profile binding, different consumption
 *   pattern): (a) resonance score 0.000–1.000 + (b) ConjugateFormCharacter
 *   via the ONE `resonanceIndicatorFromProfile` law; (c) the four operative
 *   element glyphs in L2' canonical order sized by the pole balance, honest-
 *   pending while the public tick withholds the pole by privacy law; (d) the
 *   dominant chakra + sun-decan ruling planet off the LIVE
 *   `nara.medicine.snapshot` chain. Lean per UX §6.5 — no quaternion dump,
 *   ever. Re-renders on every profile tick (15-foundation principle 2).
 */

import { useEffect, useState } from 'react';
import './m4PersonalCoordinate.css';
import { gateway, gatewayReady } from '../bridge/gatewayHolder';
import { useTickStore } from '../state/stores';
import { privacyChrome } from '../ui/privacyChrome';
import { resonanceIndicatorFromProfile } from './m4NaraResonance';
import {
    MEDICINE_SNAPSHOT_METHOD,
    medicineSunDegree,
    parseMedicineSnapshot,
    type MedicineSnapshot
} from './medicineView';
import { readElementalGlyphs } from './m4PersonalCoordinate';

type MedicineRead =
    | { readonly state: 'pending'; readonly reason: string }
    | { readonly state: 'read'; readonly snapshot: MedicineSnapshot };

function artifactOf(receipt: unknown): unknown {
    if (receipt && typeof receipt === 'object' && 'artifact' in (receipt as object)) {
        return (receipt as { artifact?: unknown }).artifact;
    }
    return receipt;
}

export function M4PersonalCoordinatePane() {
    const cached = useTickStore(state => state.profile);
    const [medicine, setMedicine] = useState<MedicineRead>({
        state: 'pending',
        reason: 'awaiting the live medicine chain'
    });

    const payload = cached?.profile ?? null;
    const resonance = resonanceIndicatorFromProfile(payload);
    const elements = readElementalGlyphs(payload);
    const liveSunDegree = medicineSunDegree(payload);
    // Whole-degree dep: the decan chain cannot change inside a degree, and a
    // fractional dep would refire this effect on EVERY tick — under a slow
    // first boot each refire used to cancel the in-flight snapshot before it
    // landed, and the row could stay pending for as long as the ticks kept
    // coming (observed under the laned suite; solo runs never hit it).
    const sunDegree = liveSunDegree === null ? null : Math.floor(liveSunDegree);

    useEffect(() => {
        let superseded = false;
        if (sunDegree === null) {
            setMedicine({ state: 'pending', reason: 'no live sun degree on this generation yet' });
            return;
        }
        if (!gatewayReady()) {
            setMedicine({ state: 'pending', reason: `${MEDICINE_SNAPSHOT_METHOD}: gateway not connected` });
            return;
        }
        gateway()
            .invoke(MEDICINE_SNAPSHOT_METHOD, { sunDegree })
            .then(receipt => {
                // Latest-wins, never cancel-and-drop: a superseded reply is
                // stale by at most one whole degree; the newer request will
                // overwrite it when it lands.
                if (!superseded) {
                    setMedicine({ state: 'read', snapshot: parseMedicineSnapshot(artifactOf(receipt)) });
                }
            })
            .catch((error: unknown) => {
                if (!superseded) {
                    setMedicine({
                        state: 'pending',
                        reason: error instanceof Error ? error.message : String(error)
                    });
                }
            });
        return () => {
            superseded = true;
        };
    }, [sunDegree]);

    const chrome = privacyChrome('protected_local');
    const dominantChakra =
        medicine.state === 'read'
            ? medicine.snapshot.chakras.find(c => c.id === medicine.snapshot.activeDecan.activeChakraId) ?? null
            : null;

    return (
        <div
            className={`m4-personal-coordinate ${chrome.className}`}
            title={chrome.title}
            data-testid="m4-personal-coordinate"
            data-view-id="m4.nara.personalCoordinate"
            data-generation={cached?.generation ?? ''}
            data-resonance-state={resonance.state === 'resolved' ? 'resolved' : 'pending'}
        >
            <header className="m4-pc-head">
                <span className="m4-pc-coordinate">M4′ · Q_personal</span>
                <span className="m4-pc-title">Personal Coordinate</span>
            </header>

            {/* (a) + (b) — the ONE resonance binding, sidebar consumption */}
            <section className="m4-pc-row" data-testid="m4-pc-resonance">
                {resonance.state === 'resolved' &&
                resonance.numeric !== null &&
                resonance.conjugateFormCharacter !== null ? (
                    <>
                        <span className="m4-pc-score" data-testid="m4-pc-resonance-score">
                            {resonance.numeric.toFixed(3)}
                        </span>
                        <span
                            className={`m4-pc-character m4-pc-character-${resonance.conjugateFormCharacter.toLowerCase()}`}
                            data-testid="m4-pc-character"
                        >
                            {resonance.conjugateFormCharacter}
                        </span>
                    </>
                ) : (
                    <span className="pane-message" data-testid="m4-pc-resonance-pending">
                        resonance pending — the personal pole rides a protected read, not the public tick
                    </span>
                )}
            </section>

            {/* (c) — four operative glyphs, L2' order, sized by the pole balance */}
            <section className="m4-pc-row" data-testid="m4-pc-elements" data-state={elements.state}>
                {elements.state === 'resolved' ? (
                    elements.glyphs.map(({ element, intensity }) => (
                        <span
                            key={element.elementId}
                            className="m4-pc-element"
                            data-testid={`m4-pc-element-${element.name.toLowerCase()}`}
                            data-element-id={element.elementId}
                            data-intensity={intensity.toFixed(3)}
                            title={`${element.name} · ${intensity.toFixed(3)}`}
                            style={{ ['--m4-pc-glyph-scale' as string]: String(0.75 + intensity) }}
                        >
                            {element.glyph}
                        </span>
                    ))
                ) : (
                    <span className="pane-message" data-testid="m4-pc-elements-pending">
                        {elements.reason}
                    </span>
                )}
            </section>

            {/* (d) — dominant chakra + sun-decan ruling planet, LIVE chain */}
            <section className="m4-pc-row" data-testid="m4-pc-medicine" data-state={medicine.state}>
                {medicine.state === 'read' ? (
                    <>
                        <span data-testid="m4-pc-chakra">
                            {dominantChakra ? dominantChakra.name : `chakra #${medicine.snapshot.activeDecan.activeChakraId}`}
                        </span>
                        <span data-testid="m4-pc-planet" title="sun-decan ruling planet">
                            {medicine.snapshot.activeDecan.rulingPlanetGlyph}{' '}
                            {medicine.snapshot.activeDecan.rulingPlanet}
                        </span>
                    </>
                ) : (
                    <span className="pane-message" data-testid="m4-pc-medicine-pending">
                        {medicine.reason}
                    </span>
                )}
            </section>
        </div>
    );
}
