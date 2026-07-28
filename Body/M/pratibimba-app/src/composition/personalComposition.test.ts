/**
 * 29.T29.3 — the personal 4-5-0 composition declares its slot ownership, and
 * the M4 protected-local boundary finally runs on the path it was written for.
 *
 * The gap this closes, precisely: the five forbidden handle classes
 * (`raw-quaternion`, `raw-audio-octet`, `plaintext-journal`,
 * `graphiti-episode-body`, `raw-natal-chart`) are all PERSONAL material. The
 * cosmic declaration (29.2) gave `compositionLoad()` a production caller, but no
 * cosmic contributor would ever declare a journal body or a natal chart — so
 * the boundary's reason for existing stayed unexercised in production, and
 * `PERSONAL_GEOMETRIC_SLOTS` was referenced by exactly one file in the
 * repository: its own test.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
    FORBIDDEN_HANDLE_CLASSES_ON_GEOMETRIC,
    PERSONAL_GEOMETRIC_SLOTS,
    ownerOfSlot,
    type CompositionContributor,
    type GeometricHandleClass,
    type IntegratedGeometricSlot
} from './geometricSlotEnforcement';
import {
    blockedPersonalSlots,
    describePersonalCompositionLoad,
    loadPersonalComposition,
    PERSONAL_COMPOSITION_CONTRIBUTORS,
    PERSONAL_SLOT_BLOCKERS,
    PERSONAL_SLOT_CARRIERS,
    type PersonalGeometricSlotName
} from './personalComposition';

const ALL_PERSONAL_SLOTS: readonly PersonalGeometricSlotName[] = [
    'left-composition',
    'center-composition',
    'right-composition',
    'grounding',
    'composition-ambient',
    'composition-status'
];

describe('personal composition slot ownership (29.T29.3 / DR-WC-IP-3)', () => {
    it('mounts with one named owner per personal slot', () => {
        const result = loadPersonalComposition();
        expect(result.mounted).toBe(true);
        expect(ownerOfSlot(result, 'left-composition')).toBe('m4-nara');
        expect(ownerOfSlot(result, 'center-composition')).toBe('m4-nara');
        expect(ownerOfSlot(result, 'right-composition')).toBe('m5-epii');
        expect(ownerOfSlot(result, 'grounding')).toBe('m0-anuttara');
        expect(ownerOfSlot(result, 'composition-ambient')).toBe('m4-nara');
        expect(ownerOfSlot(result, 'composition-status')).toBe('m4-nara');
    });

    it('claims every registered personal slot, and only personal slots', () => {
        const claimed = PERSONAL_COMPOSITION_CONTRIBUTORS.map(c => c.geometricClaim?.geometricSlot);
        for (const slot of claimed) {
            expect(slot).toBeDefined();
            expect(PERSONAL_GEOMETRIC_SLOTS).toContain(slot as never);
        }
        // No cosmic slot leaks into the personal declaration, and none of the
        // six personal slots is silently left out.
        expect([...claimed].sort()).toEqual([...ALL_PERSONAL_SLOTS].sort());
    });

    it('describes a mounted composition by its owners and its blocked slot', () => {
        const text = describePersonalCompositionLoad(loadPersonalComposition());
        expect(text).toContain('left-composition=m4-nara');
        expect(text).toContain('right-composition=m5-epii');
        expect(text).toContain('grounding=m0-anuttara');
        expect(text).toContain('blocked: center-composition:pending-psychoid-cymatic-renderer');
    });

    // ── the protected-local boundary, now reachable in production ─────────

    it('REFUSES every raw-body handle class on every personal slot, naming the contributor', () => {
        // This is the guard 29.13 wrote and nothing production could reach. It
        // runs here through `loadPersonalComposition` — the same call the
        // engine root makes — not through the enforcement module directly.
        expect(FORBIDDEN_HANDLE_CLASSES_ON_GEOMETRIC).toHaveLength(5);
        for (const handleClass of FORBIDDEN_HANDLE_CLASSES_ON_GEOMETRIC) {
            for (const geometricSlot of ALL_PERSONAL_SLOTS) {
                const leak: CompositionContributor = {
                    extensionId: 'm4-nara-leak',
                    geometricClaim: {
                        extensionId: 'm4-nara-leak',
                        geometricSlot: geometricSlot as IntegratedGeometricSlot,
                        priority: 9,
                        handleClass: handleClass as GeometricHandleClass
                    }
                };
                const result = loadPersonalComposition([leak]);
                expect(
                    result.mounted,
                    `${handleClass} was granted on '${geometricSlot}'`
                ).toBe(false);
                if (!result.mounted) {
                    expect(result.rejection.reason).toBe(
                        'contribution-declares-raw-body-on-geometric-slot'
                    );
                    expect(result.rejection.contributorId).toBe('m4-nara-leak');
                }
            }
        }
    });

    it('refuses the plaintext-journal shortcut on the slot most tempted by it', () => {
        // The left slot mounts the day canvas. Handing the composition the
        // journal TEXT instead of the vault path is the shortcut this boundary
        // exists to stop, and it is the one a future contributor is likeliest
        // to reach for. The whole composition hard-fails, not just the slot.
        const withLeak = PERSONAL_COMPOSITION_CONTRIBUTORS.map(contributor =>
            contributor.geometricClaim?.geometricSlot === 'left-composition'
                ? {
                      ...contributor,
                      geometricClaim: {
                          ...contributor.geometricClaim,
                          handleClass: 'plaintext-journal' as GeometricHandleClass
                      }
                  }
                : contributor
        );
        const result = loadPersonalComposition(withLeak);
        expect(result.mounted).toBe(false);
        const text = describePersonalCompositionLoad(result);
        expect(text).toContain('composition refused');
        expect(text).toContain('contribution-declares-raw-body-on-geometric-slot');
        expect(text).toContain('m4-nara');
        // A refused composition must be distinguishable from an unclaimed slot.
        expect(ownerOfSlot(result, 'right-composition')).toBe('unmounted');
    });

    it('declares only non-forbidden handle classes itself', () => {
        for (const contributor of PERSONAL_COMPOSITION_CONTRIBUTORS) {
            expect(FORBIDDEN_HANDLE_CLASSES_ON_GEOMETRIC).not.toContain(
                contributor.geometricClaim?.handleClass as never
            );
        }
    });

    // ── the contested-slot law reaches the personal face too ──────────────

    it('REFUSES a second claimant on an occupied personal slot, naming it', () => {
        const intruder: CompositionContributor = {
            extensionId: 'm5-epii-overlay',
            geometricClaim: {
                extensionId: 'm5-epii-overlay',
                geometricSlot: 'left-composition',
                priority: 9,
                handleClass: 'opaque-handle'
            }
        };
        const result = loadPersonalComposition([...PERSONAL_COMPOSITION_CONTRIBUTORS, intruder]);
        expect(result.mounted).toBe(false);
        if (!result.mounted) {
            expect(result.rejection.reason).toBe('contested-geometric-slot');
            // The SECOND claimant is named; the first is the incumbent.
            expect(result.rejection.contributorId).toBe('m5-epii-overlay');
        }
    });

    // ── the declaration must describe what actually renders ───────────────

    it('every declared slot maps to a carrier symbol the app really renders', () => {
        // The declaration is not allowed to describe a composition that is not
        // on screen. If a carrier is renamed or dropped, this fails.
        for (const [slot, carrier] of Object.entries(PERSONAL_SLOT_CARRIERS)) {
            const source = readFileSync(join(__dirname, '..', carrier.file), 'utf8');
            expect(
                source.includes(carrier.symbol),
                `slot '${slot}' declares '${carrier.symbol}' in ${carrier.file}, which that file does not render`
            ).toBe(true);
        }
    });

    it('the personalHome case mounts the engine and its ambient control together', () => {
        // The ambient slot renders OUTSIDE the engine, in the case that wraps
        // it. That is a layout fact the parity map states, so it is asserted
        // rather than left to a reader to notice.
        const app = readFileSync(join(__dirname, '..', 'App.tsx'), 'utf8');
        const personalHome = app.slice(app.indexOf("case 'personalHome':"));
        // …up to the NEXT case label, not this one (index 0).
        const body = personalHome.slice(0, personalHome.indexOf('case ', 1));
        expect(body).toContain('TimeAxisSwitcher');
        expect(body).toContain('PersonalRecognitionEngine');
    });

    it('blocks exactly the slots that have no carrier, and names why', () => {
        // A slot is either rendered or blocked — never quietly absent. This
        // fails the moment 25.T25.6 lands a center renderer without the
        // blocker being retired, and equally if a blocker outlives its gap.
        const carriedSlots = new Set(Object.keys(PERSONAL_SLOT_CARRIERS));
        const blockedSlots = new Set(Object.keys(PERSONAL_SLOT_BLOCKERS));
        for (const slot of ALL_PERSONAL_SLOTS) {
            expect(
                carriedSlots.has(slot) !== blockedSlots.has(slot),
                `slot '${slot}' must be either carried or blocked, not both and not neither`
            ).toBe(true);
        }
        expect(blockedPersonalSlots()).toEqual([
            'center-composition:pending-psychoid-cymatic-renderer'
        ]);
    });
});
