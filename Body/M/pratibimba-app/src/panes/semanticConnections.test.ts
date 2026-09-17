import { describe, expect, it } from 'vitest';
import { parseSemanticConnectionsResponse } from './semanticConnections';

describe('parseSemanticConnectionsResponse', () => {
    it('strictly preserves typed evidence, privacy, score, and staleness', () => {
        const parsed = parseSemanticConnectionsResponse({
            seedSources: ['Bimba/Seed.md'],
            candidates: [{
                targetPath: 'Bimba/A.md',
                wikilinkTitle: 'A',
                score: 0.92,
                kind: 'semantic-block',
                evidenceSourcePath: 'Bimba/A.md',
                evidenceLines: [12, 18],
                stale: false,
                privacyClass: 'public'
            }],
            warnings: [],
            staleness: 'current',
            smartEnvIndexPath: '.smart-env/multi/index.ajson'
        });

        expect(parsed.candidates[0]).toMatchObject({
            wikilinkTitle: 'A',
            score: 0.92,
            kind: 'semantic-block',
            evidenceLines: [12, 18],
            privacyClass: 'public'
        });
        expect(parsed.staleness).toBe('current');
    });

    it('fails closed on malformed candidate and staleness contracts', () => {
        const base = {
            seedSources: [],
            candidates: [],
            warnings: [],
            staleness: 'current',
            smartEnvIndexPath: null
        };
        expect(() => parseSemanticConnectionsResponse({ ...base, staleness: 'fresh-ish' }))
            .toThrow(/staleness/);
        expect(() => parseSemanticConnectionsResponse({
            ...base,
            candidates: [{
                targetPath: 'Bimba/A.md',
                wikilinkTitle: 'A',
                score: Number.NaN,
                kind: 'semantic-block',
                evidenceSourcePath: 'Bimba/A.md',
                evidenceLines: null,
                stale: false,
                privacyClass: 'public'
            }]
        })).toThrow(/score/);
    });
});
