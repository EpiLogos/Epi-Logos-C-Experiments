import { describe, expect, it } from 'vitest';
import {
    bridgedLayerRoute,
    M0_BRIDGE_ROUTE_SCHEME,
    M0_LAYER_VIEWS
} from './m0Layers';

describe('m0Layers — the six M0-X\' surface contract (M0\'-SPEC §The Six M0-X\' Data Layers)', () => {
    it('enumerates exactly the six spec layers, in position order', () => {
        expect(M0_LAYER_VIEWS.map(v => v.id)).toEqual([
            "M0-0'",
            "M0-1'",
            "M0-2'",
            "M0-3'",
            "M0-4'",
            "M0-5'"
        ]);
        expect(M0_LAYER_VIEWS.map(v => v.key)).toEqual([
            'language',
            'ql-structure',
            'relations',
            'time-community',
            'personal',
            'pedagogy'
        ]);
    });

    it('splits 4 local + 2 bridged and pins mutatesGraphCanon false on every view (DR-M0-1)', () => {
        const local = M0_LAYER_VIEWS.filter(v => v.placement === 'local');
        const bridged = M0_LAYER_VIEWS.filter(v => v.placement === 'bridged');
        expect(local.map(v => v.key)).toEqual([
            'language',
            'ql-structure',
            'relations',
            'time-community'
        ]);
        expect(bridged.map(v => v.bridgeExtensionId)).toEqual(['m4-nara', 'm5-epii']);
        for (const view of M0_LAYER_VIEWS) {
            expect(view.mutatesGraphCanon).toBe(false);
        }
    });

    it('emits the spec deep-link template for bridged layers, scoped to the coordinate', () => {
        const personal = M0_LAYER_VIEWS.find(v => v.key === 'personal')!;
        const pedagogy = M0_LAYER_VIEWS.find(v => v.key === 'pedagogy')!;
        expect(bridgedLayerRoute(personal, 'M4-4-4')).toBe(
            'epi-logos://ide/m4-nara/artifact?coordinate=M4-4-4&source=m0-anuttara'
        );
        expect(bridgedLayerRoute(pedagogy, "M0-2'")).toBe(
            "epi-logos://ide/m5-epii/review?coordinate=M0-2'&source=m0-anuttara"
        );
    });

    it('encodes coordinates and still states its source without one', () => {
        const personal = M0_LAYER_VIEWS.find(v => v.key === 'personal')!;
        expect(bridgedLayerRoute(personal, '#4.4')).toBe(
            'epi-logos://ide/m4-nara/artifact?coordinate=%234.4&source=m0-anuttara'
        );
        expect(bridgedLayerRoute(personal, null)).toBe(
            'epi-logos://ide/m4-nara/artifact?source=m0-anuttara'
        );
    });

    it('returns null for local layers — they render on the M0\' surface, not via routes', () => {
        for (const view of M0_LAYER_VIEWS.filter(v => v.placement === 'local')) {
            expect(bridgedLayerRoute(view, 'M1')).toBeNull();
        }
    });

    it('never doubles the extension id in the emitted route (frozen-carrier regression)', () => {
        for (const view of M0_LAYER_VIEWS.filter(v => v.placement === 'bridged')) {
            const route = bridgedLayerRoute(view, 'M1')!;
            const tail = route.slice(M0_BRIDGE_ROUTE_SCHEME.length + 1).split('?')[0];
            const segments = tail.split('/');
            expect(segments[0]).toBe(view.bridgeExtensionId);
            expect(segments.filter(s => s === view.bridgeExtensionId)).toHaveLength(1);
        }
    });
});
