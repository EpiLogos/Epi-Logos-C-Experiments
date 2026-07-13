/**
 * Coordinate: M' M4' (dialogical arena pure-law tests — Tranche 41.7 rerun)
 * Actualises: the model-side verification legs — CPF (00/00) gate law,
 *   classifier glyph map, scene-open plan against the REAL wire shape,
 *   normalizers over the contract handles, privacy manifest invariants.
 */

import { describe, expect, it } from 'vitest';
import {
    ARENA_PRIVACY_MANIFEST,
    ARENA_SUMMON_RPC,
    CLASSIFIER_GLYPHS,
    VAMA_SHAKTI_CLASSES,
    assertSummonGate,
    buildSceneOpenPlan,
    classDistribution,
    classifyWireError,
    evaluateSceneSetupGate,
    glyphForClass,
    initialSceneSetupState,
    normalizeSceneHandle,
    normalizeSceneHandleList,
    normalizeVamaShaktiHandle,
    normalizeWarmRows,
    suggestVamaShaktiClass,
    turnEntryFromReceipt
} from './m4DialogicalArena';

describe('CPF (00/00) scene-setup gate', () => {
    it('walks wizard-inactive → brainstorm-required → coordinate-required → ready', () => {
        let state = initialSceneSetupState();
        expect(evaluateSceneSetupGate(state)).toEqual({ canOpen: false, reason: 'wizard-inactive' });
        state = { ...state, active: true };
        expect(evaluateSceneSetupGate(state)).toEqual({ canOpen: false, reason: 'cpf-brainstorm-required' });
        state = { ...state, brainstormConfirmed: true };
        expect(evaluateSceneSetupGate(state)).toEqual({ canOpen: false, reason: 'pinned-coordinate-required' });
        state = { ...state, pinnedCoordinate: 'M4-3' };
        expect(evaluateSceneSetupGate(state)).toEqual({ canOpen: true, reason: 'ready' });
    });

    it('buildSceneOpenPlan refuses every ungated state and assertSummonGate throws', () => {
        const ungated = { ...initialSceneSetupState(), active: true, pinnedCoordinate: 'C5' };
        expect(() => buildSceneOpenPlan(ungated, 'arena:c5')).toThrow(/cpf-brainstorm-required/);
        expect(() => assertSummonGate(ungated)).toThrow(/CPF \(00\/00\)/);
    });

    it('emits the real wire plan: scene_open payload + one summon per admission', () => {
        const state = {
            ...initialSceneSetupState(),
            active: true,
            brainstormConfirmed: true,
            pinnedCoordinate: 'C5',
            constitutionalParticipation: ['sophia'],
            admissions: [
                {
                    identityHandle: 'w1',
                    name: 'Plotinus One',
                    entityCoordinate: 'C0.plotinus-one',
                    vamaShaktiClass: 'daemon' as const,
                    classOverridden: false
                },
                {
                    identityHandle: 'w2',
                    name: 'Aum',
                    entityCoordinate: 'T5.aum',
                    vamaShaktiClass: 'mantra' as const,
                    classOverridden: true
                }
            ]
        };
        const plan = buildSceneOpenPlan(state, 'arena:c5');
        expect(plan.open).toEqual({
            sceneKey: 'arena:c5',
            pinnedCoordinate: 'C5',
            lifecycleModeDefault: 'ephemeral',
            admittedConstitutional: ['sophia'],
            cpfBrainstormConfirmationToken: 'cpf-00-00:brainstorm-confirmed:C5'
        });
        expect(plan.summons).toHaveLength(2);
        expect(plan.summons[0]).toEqual({
            sceneKey: 'arena:c5',
            entityCoordinate: 'C0.plotinus-one',
            vamaShaktiClass: 'daemon',
            lifecycleModeOverride: null
        });
        expect(ARENA_SUMMON_RPC).toBe('m4.arena.summon');
    });
});

describe('classifier vocabulary', () => {
    it('carries the four spec glyphs and a neutral fallback', () => {
        expect(CLASSIFIER_GLYPHS).toEqual({ egregore: '◍', sprite: '✦', daemon: '◐', mantra: '〰' });
        for (const cls of VAMA_SHAKTI_CLASSES) {
            expect(glyphForClass(cls)).toBe(CLASSIFIER_GLYPHS[cls]);
        }
        expect(glyphForClass('chorus')).toBe('○');
    });

    it('suggests classifier from the coordinate family (user override preserved downstream)', () => {
        expect(suggestVamaShaktiClass('M4-3')).toBe('egregore');
        expect(suggestVamaShaktiClass('T5')).toBe('mantra');
        expect(suggestVamaShaktiClass('S0')).toBe('daemon');
        expect(suggestVamaShaktiClass('C5')).toBe('sprite');
        expect(suggestVamaShaktiClass(null)).toBe('sprite');
    });
});

describe('normalizers over the contract handles', () => {
    it('normalizes ArenaSceneHandle (camelCase wire) and snake_case fallback', () => {
        const camel = normalizeSceneHandle({
            sceneKey: 'arena:c5',
            pinnedCoordinate: 'C5',
            lifecycleModeDefault: 'ephemeral',
            admittedConstitutional: ['Sophia'],
            status: 'open',
            openedAtMs: 1000,
            closedAtMs: null,
            admittedVamaShaktiCount: 3,
            turnCount: 5,
            cpfBrainstormConfirmationToken: 'cpf-00-00:brainstorm-confirmed:C5',
            privacyClass: 'protected_local_handle_only'
        });
        expect(camel.sceneKey).toBe('arena:c5');
        expect(camel.vamaShaktiCount).toBe(3);
        expect(camel.turnCount).toBe(5);
        expect(camel.admittedConstitutional).toEqual(['Sophia']);

        const snake = normalizeSceneHandle({
            scene_key: 'arena:x',
            pinned_coordinate: 'M4',
            status: 'closed',
            admitted_vama_shakti_count: 1,
            turn_count: 2
        });
        expect(snake.sceneKey).toBe('arena:x');
        expect(snake.status).toBe('closed');
        expect(normalizeSceneHandleList([{ sceneKey: 'a' }, { sceneKey: 'b' }])).toHaveLength(2);
    });

    it('normalizes VamaShaktiHandle and WarmVamaShaktiHandle rows', () => {
        const vama = normalizeVamaShaktiHandle({
            sceneKey: 'arena:c5',
            identityHandle: 'blake3:abc',
            entityCoordinate: 'C0.plotinus-one',
            vamaShaktiClass: 'daemon',
            lifecycleMode: 'ephemeral',
            vamaShaktiClockPosition: 42.0,
            psycheTemplateRevisionDrift: false,
            admittedAtMs: 1000
        });
        expect(vama.key).toBe('blake3:abc');
        expect(vama.vamaShaktiClass).toBe('daemon');

        const warm = normalizeWarmRows([
            {
                identityHandle: 'blake3:w',
                coordinateLabel: 'M4.sprite-field',
                vamaShaktiClass: 'sprite',
                turnsParticipatedCount: 8,
                warmedAtMs: 1,
                lastSeenAtMs: 2
            }
        ]);
        expect(warm[0].coordinateLabel).toBe('M4.sprite-field');
        expect(warm[0].turnsParticipatedCount).toBe(8);
    });

    it('folds TurnReceipt into scrollback keeping non-user bodies opaque', () => {
        const user = turnEntryFromReceipt(
            { sceneKey: 'arena:c5', turnId: 1, turnIndex: 0, speakerHandle: 'user', speakerClass: null, lineId: 1 },
            'hello field'
        );
        expect(user.speakerKind).toBe('user');
        expect(user.line).toBe('hello field');

        const vama = turnEntryFromReceipt(
            { sceneKey: 'arena:c5', turnIndex: 1, speakerHandle: 'blake3:abc', speakerClass: 'mantra', lineId: 2 },
            null
        );
        expect(vama.speakerKind).toBe('vama_shakti');
        expect(vama.vamaShaktiClass).toBe('mantra');
        expect(vama.line).toBeNull();
    });
});

describe('privacy + wire-state law', () => {
    it('pins the protected-local manifest', () => {
        expect(ARENA_PRIVACY_MANIFEST.privacyClass).toBe('protected_local_handle_only');
        expect(ARENA_PRIVACY_MANIFEST.protectedBodiesProjected).toBe(false);
    });

    it('classifies unimplemented as pending-wire, disconnection and others honestly', () => {
        expect(classifyWireError(new Error('gateway error: unimplemented'))).toBe('pending-wire');
        expect(classifyWireError(new Error('gateway: cannot invoke "x" — not connected'))).toBe('disconnected');
        expect(classifyWireError(new Error('boom'))).toBe('error');
    });

    it('counts class distribution for the roster chips', () => {
        const distribution = classDistribution([
            { key: 'a', name: 'A', vamaShaktiClass: 'sprite', vakAddress: null },
            { key: 'b', name: 'B', vamaShaktiClass: 'daemon', vakAddress: null },
            { key: 'c', name: 'C', vamaShaktiClass: 'daemon', vakAddress: null }
        ]);
        expect(distribution).toEqual({ egregore: 0, sprite: 1, daemon: 2, mantra: 0 });
    });
});
