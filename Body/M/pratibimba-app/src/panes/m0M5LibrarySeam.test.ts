import { describe, expect, it } from 'vitest';
import { buildM0M5LibrarySeam } from './m0M5LibrarySeam';

describe("M0' graph to M5-0' Library Klein seam (09.T9.9)", () => {
    it('projects direct coordinate tags and resonance-linked entries without bodies', () => {
        const projection = buildM0M5LibrarySeam({
            status: 'ok',
            coordinate: 'M1',
            count: 2,
            cluster: {
                anchors: [
                    {
                        entity_id: 'library-direct-1',
                        entity_name: 'Direct note',
                        assignment_method: 'direct',
                        content: 'private body must not surface'
                    }
                ],
                resonant: [
                    {
                        entity_id: 'library-resonant-1',
                        entity_name: 'Resonant note',
                        home_coordinate: 'M5-0',
                        confidence: 0.82,
                        body: 'private body must not surface'
                    }
                ]
            }
        });

        expect(projection.state).toBe('derived');
        expect(projection.coordinate).toBe('M1');
        expect(projection.entries).toEqual([
            {
                kind: 'bimba_coordinate',
                entityId: 'library-direct-1',
                entityName: 'Direct note',
                assignmentMethod: 'direct',
                homeCoordinate: 'M1',
                confidence: null
            },
            {
                kind: 'bimba_resonances',
                entityId: 'library-resonant-1',
                entityName: 'Resonant note',
                assignmentMethod: null,
                homeCoordinate: 'M5-0',
                confidence: 0.82
            }
        ]);
        expect(JSON.stringify(projection)).not.toContain('private body');
    });

    it('renders a successful empty cluster as canonical absence', () => {
        const projection = buildM0M5LibrarySeam({
            status: 'ok',
            coordinate: 'M3',
            count: 0,
            cluster: { anchors: [], resonant: [] }
        });
        expect(projection.state).toBe('canonical_absent');
        expect(projection.entries).toEqual([]);
    });

    it('blocks malformed and failed responses instead of fabricating a shelf', () => {
        expect(buildM0M5LibrarySeam(null).state).toBe('blocked');
        expect(buildM0M5LibrarySeam({ status: 'error', message: 'Neo4j unavailable' })).toEqual({
            coordinate: null,
            entries: [],
            reason: 'Neo4j unavailable',
            state: 'blocked'
        });
    });
});
