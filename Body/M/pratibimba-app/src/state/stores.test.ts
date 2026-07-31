import { beforeEach, describe, expect, it } from 'vitest';
import { useCoordinateStore, useProvenanceStore, useSessionStore, useTickStore } from './stores';
import { resetProfileTicks } from '../composition/profileTickSubscription';

function profileWithGeneration(generation: number) {
    return {
        generation,
        cachedAtMs: 1,
        stale: false,
        stalenessMs: 0,
        privacyClass: 'safe-public-current-kernel-tick',
        profile: { generation }
    };
}

describe('stores', () => {
    beforeEach(() => {
        resetProfileTicks();
        useCoordinateStore.setState({ selected: null });
        useSessionStore.setState({ sessionKey: null, dayNow: null, privacyClass: null });
    });

    it('tick generation is monotonic — stale generations are ignored', () => {
        useTickStore.getState().setProfile(profileWithGeneration(5));
        useTickStore.getState().setProfile(profileWithGeneration(3));
        expect(useTickStore.getState().generation).toBe(5);
        useTickStore.getState().setProfile(profileWithGeneration(6));
        expect(useTickStore.getState().generation).toBe(6);
    });

    it('32.T32.9: observedTicks counts ACCEPTED advances, and resets with the clock', () => {
        expect(useTickStore.getState().observedTicks).toBe(0);
        useTickStore.getState().setProfile(profileWithGeneration(5));
        expect(useTickStore.getState().observedTicks).toBe(1);

        // refused frames are not ticks: a stale generation and a repeat of the
        // current one both leave the count exactly where it was
        useTickStore.getState().setProfile(profileWithGeneration(3));
        useTickStore.getState().setProfile(profileWithGeneration(5));
        expect(useTickStore.getState().observedTicks).toBe(1);

        useTickStore.getState().setProfile(profileWithGeneration(6));
        expect(useTickStore.getState().observedTicks).toBe(2);

        // and a gap in the wire is still ONE advance — the count is of frames
        // this shell accepted, never of kernel generations that elapsed
        useTickStore.getState().setProfile(profileWithGeneration(90));
        expect(useTickStore.getState().observedTicks).toBe(3);
        expect(useTickStore.getState().generation).toBe(90);

        resetProfileTicks();
        expect(useTickStore.getState().observedTicks).toBe(0);
    });

    it('session store patches without clobbering unset fields', () => {
        useSessionStore.getState().setSession({ dayNow: '02-07-2026' });
        useSessionStore.getState().setSession({ sessionKey: 'sess-1' });
        expect(useSessionStore.getState().dayNow).toBe('02-07-2026');
        expect(useSessionStore.getState().sessionKey).toBe('sess-1');
    });

    it('provenance store carries connection and supervisor threads independently', () => {
        useProvenanceStore.getState().setSupervisor({ state: 'supervised', port: 18794, pid: 7, detail: 'ok' });
        expect(useProvenanceStore.getState().supervisor.state).toBe('supervised');
        expect(useProvenanceStore.getState().connection.state).toBe('disconnected');
    });
});
