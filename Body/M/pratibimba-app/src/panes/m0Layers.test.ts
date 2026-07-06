import { describe, expect, it } from 'vitest';
import {
    bridgedLayerRoute,
    m0LayerS2Query,
    M0_BRIDGE_ROUTE_SCHEME,
    M0_LAYER_FIELDS,
    M0_LAYER_ROUTES,
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

    it('routes all six layers with the frozen tab-route law and 1:1 short keys (09.T9.1)', () => {
        expect(M0_LAYER_ROUTES.map(r => r.layer)).toEqual([
            'lang',
            'ql',
            'rel',
            'time',
            'pers',
            'pedag'
        ]);
        expect(M0_LAYER_ROUTES.map(r => r.routePath)).toEqual([
            '/m0-anuttara/coordinate/language',
            '/m0-anuttara/coordinate/ql',
            '/m0-anuttara/coordinate/relations',
            '/m0-anuttara/coordinate/time',
            '/m0-anuttara/coordinate/personal',
            '/m0-anuttara/coordinate/pedagogy'
        ]);
        for (const route of M0_LAYER_ROUTES) {
            expect(route.view.key).toBe(route.layerKey);
            expect(route.commandId).toBe(`m0.layer.${route.layer}`);
        }
    });

    it('shares ONE S2 query path across every local layer; bridged layers never query', () => {
        const localQueries = M0_LAYER_ROUTES.filter(r => r.view.placement === 'local').map(r =>
            m0LayerS2Query(r, 'M0-2')
        );
        expect(localQueries).toHaveLength(4);
        for (const query of localQueries) {
            expect(query).toEqual({ method: 's2.graph.node', params: { coordinate: 'M0-2' } });
        }
        for (const route of M0_LAYER_ROUTES.filter(r => r.view.placement === 'bridged')) {
            expect(m0LayerS2Query(route, 'M0-2')).toBeNull();
            expect(M0_LAYER_FIELDS[route.layer]).toEqual([]);
        }
        // no coordinate selected → no read fires
        expect(m0LayerS2Query(M0_LAYER_ROUTES[0], null)).toBeNull();
    });

    it('names spec projections per local layer so layers discriminate rendering, not reads', () => {
        expect(M0_LAYER_FIELDS.lang).toContain('c_1_complete_formulation');
        expect(M0_LAYER_FIELDS.ql).toContain('gebser_register');
        expect(M0_LAYER_FIELDS.rel).toContain('c_1_relation_family');
        expect(M0_LAYER_FIELDS.time).toContain('active_now_clock');
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
