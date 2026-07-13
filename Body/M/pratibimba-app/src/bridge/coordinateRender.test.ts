import { describe, expect, it, vi } from 'vitest';
import { renderGatewayCoordinate } from './coordinateRender';
import { GraphClient } from './graphClient';

describe('renderGatewayCoordinate (Track 45.T45.3)', () => {
    it('renders a gateway-canonical context-frame coordinate verbatim', () => {
        // the gateway-side normaliser emits the position-4 dot rule + parens;
        // the carrier must show it unchanged (no local re-wrap).
        expect(renderGatewayCoordinate('M0-4.(0/1)')).toBe('M0-4.(0/1)');
        expect(renderGatewayCoordinate('M0-4.(4.0/1-4.4/5)')).toBe('M0-4.(4.0/1-4.4/5)');
    });

    it('renders a deep dashed coordinate and a primed coordinate verbatim', () => {
        expect(renderGatewayCoordinate('M2-5-0')).toBe('M2-5-0');
        expect(renderGatewayCoordinate("M1'")).toBe("M1'");
    });

    it('does NOT normalise: a raw-archetype #-coordinate stays as the gateway holds it', () => {
        // `#`, `#0`..`#5` are real Bimba nodes (Layer-1 foundation). A local
        // `#`→`M` transform would corrupt them into the wrong node — the exact
        // bug the guard forbids. The seam renders them verbatim.
        expect(renderGatewayCoordinate('#')).toBe('#');
        expect(renderGatewayCoordinate('#0')).toBe('#0');
        expect(renderGatewayCoordinate('#3')).toBe('#3');
    });

    it('renders empty for null/undefined so callers can inline safely', () => {
        expect(renderGatewayCoordinate(null)).toBe('');
        expect(renderGatewayCoordinate(undefined)).toBe('');
    });

    it('renders the coordinate carried on a real s2.graph.node gateway response verbatim', async () => {
        // Fixture the gateway RESPONSE only (render-logic isolation) — the shape
        // matches the live `s2.graph.node` artifact; the canonical value is the
        // one Neo4j actually stores for M0-4's context-frame child.
        const invoke = vi.fn(async () => ({
            artifact: {
                node: { coordinate: 'M0-4', label: 'Context Frame' },
                relations: [
                    { type: 'HAS_INTERNAL_COMPONENT', direction: 'outbound', coordinate: 'M0-4.(0/1)' }
                ]
            }
        }));
        const client = new GraphClient({ invoke } as never);
        const arrived = await client.node('M0-4');

        expect(renderGatewayCoordinate(arrived.node?.coordinate)).toBe('M0-4');
        expect(renderGatewayCoordinate(arrived.relations[0].target)).toBe('M0-4.(0/1)');
    });
});
