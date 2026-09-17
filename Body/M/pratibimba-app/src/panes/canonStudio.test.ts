/**
 * Coordinate: M' M0' (Canon Studio reading model tests — 28.T28.4)
 * Residency: Body/M/pratibimba-app/src/panes/canonStudio.test.ts
 * Actualises: the mark scan, the `[[` completion context, the privacy gate over
 *   S1 candidates, the typology receipt parse, and PASU note identity.
 */

import { describe, expect, it } from 'vitest';
import {
    isPasuNote,
    parseCLayerTypology,
    PASU_NOTE_PATH,
    scanCanonMarks,
    semanticCompletionOptions,
    wikilinkContextAt
} from './canonStudio';
import type { SemanticConnectionsResponse } from './semanticConnections';

const response = (
    candidates: SemanticConnectionsResponse['candidates']
): SemanticConnectionsResponse => ({
    seedSources: [],
    candidates,
    warnings: [],
    staleness: 'current',
    smartEnvIndexPath: '/tmp/.smart-env/multi'
});

const candidate = (
    wikilinkTitle: string,
    score: number,
    privacyClass: 'public' | 'protected' = 'public',
    stale = false
) => ({
    targetPath: `Bimba/World/${wikilinkTitle}.md`,
    wikilinkTitle,
    score,
    kind: 'semantic-source' as const,
    evidenceSourcePath: `Bimba/World/${wikilinkTitle}.md`,
    evidenceLines: null,
    stale,
    privacyClass
});

describe('scanCanonMarks', () => {
    it('marks wikilinks and uppercase coordinates', () => {
        const marks = scanCanonMarks('S1 is served by [[Hen]] and reaches M4-3.');
        expect(marks.map(mark => [mark.kind, mark.text])).toEqual([
            ['ql-coordinate', 'S1'],
            ['bimba-wikilink', '[[Hen]]'],
            ['ql-coordinate', 'M4-3']
        ]);
    });

    it('does not double-mark a coordinate that is itself the wikilink target', () => {
        const marks = scanCanonMarks('see [[S1]] for the container');
        expect(marks).toHaveLength(1);
        expect(marks[0]).toMatchObject({ kind: 'bimba-wikilink', text: '[[S1]]' });
    });

    it('marks inverted and deep coordinates', () => {
        const marks = scanCanonMarks("S4-5' routes to M3-1-0-13 through S2'.");
        expect(marks.map(mark => mark.text)).toEqual(["S4-5'", 'M3-1-0-13', "S2'"]);
    });

    it('leaves lowercase frontmatter-style keys and glued tokens alone', () => {
        expect(scanCanonMarks('p0_grounds: the ground')).toEqual([]);
        expect(scanCanonMarks('TM4x is not a coordinate')).toEqual([]);
    });

    it('rejects a family letter outside the six families', () => {
        expect(scanCanonMarks('X1 and A2 are not coordinates')).toEqual([]);
    });

    it('returns marks sorted by offset so the decoration builder accepts them', () => {
        const marks = scanCanonMarks('[[Hen]] then M0 then [[Bimba]] then C5');
        const offsets = marks.map(mark => mark.from);
        expect(offsets).toEqual([...offsets].sort((a, b) => a - b));
    });
});

describe('wikilinkContextAt', () => {
    it('reads the query inside an unclosed wikilink', () => {
        const text = 'linking to [[Par';
        expect(wikilinkContextAt(text, text.length)).toEqual({
            query: 'Par',
            from: 13,
            to: 16
        });
    });

    it('offers the empty query immediately after the brackets', () => {
        const text = 'open [[';
        expect(wikilinkContextAt(text, text.length)?.query).toBe('');
    });

    it('is null outside a wikilink and after one closes', () => {
        expect(wikilinkContextAt('plain prose', 5)).toBeNull();
        const closed = 'see [[Hen]] now';
        expect(wikilinkContextAt(closed, closed.length)).toBeNull();
    });

    it('does not read across a line break', () => {
        const text = 'open [[\nnext line';
        expect(wikilinkContextAt(text, text.length)).toBeNull();
    });
});

describe('semanticCompletionOptions', () => {
    it('orders by the S1 score and carries it as the boost', () => {
        const options = semanticCompletionOptions(
            response([candidate('Hen', 0.4), candidate('Bimba', 0.9)]),
            ''
        );
        expect(options.map(option => option.label)).toEqual(['Bimba', 'Hen']);
        expect(options[0].boost).toBe(0.9);
    });

    it('never offers a protected candidate', () => {
        const options = semanticCompletionOptions(
            response([candidate('PASU', 0.9, 'protected'), candidate('Hen', 0.2)]),
            ''
        );
        expect(options.map(option => option.label)).toEqual(['Hen']);
    });

    it('filters by the typed query, case-insensitively', () => {
        const options = semanticCompletionOptions(
            response([candidate('Paramasiva', 0.5), candidate('Hen', 0.9)]),
            'param'
        );
        expect(options.map(option => option.label)).toEqual(['Paramasiva']);
    });

    it('discloses staleness in the detail line', () => {
        const options = semanticCompletionOptions(
            response([candidate('Hen', 0.5, 'public', true)]),
            ''
        );
        expect(options[0].detail).toBe('semantic-source · stale');
    });
});

describe('parseCLayerTypology', () => {
    const receipt = {
        sourcePath: 'Bimba/World/Types/Coordinates/S/S1/S1.md',
        typeFamily: 'Coordinates',
        typePath: 'Bimba/World/Types/Coordinates/S/S1',
        typeCoordinate: 'S1',
        semanticAuthority: 'C1',
        crystallisationState: 'crystallised',
        evidenceKind: 'frontmatter',
        classificationSource: 'hen'
    };

    it('parses a full receipt', () => {
        expect(parseCLayerTypology(receipt).typeCoordinate).toBe('S1');
    });

    it('refuses a receipt missing a field rather than rendering a blank', () => {
        expect(() => parseCLayerTypology({ ...receipt, typeCoordinate: '' })).toThrow(
            /typeCoordinate/
        );
        expect(() => parseCLayerTypology(null)).toThrow(/must be an object/);
    });
});

describe('isPasuNote', () => {
    it('recognises the identity note in vault- and repo-relative form', () => {
        expect(isPasuNote(PASU_NOTE_PATH)).toBe(true);
        expect(isPasuNote('Idea/Pratibimba/Self/PASU.md')).toBe(true);
    });

    it('is false for any other note', () => {
        expect(isPasuNote('Pratibimba/Self/Notes.md')).toBe(false);
        expect(isPasuNote('Empty/Present/07-27-2026/daily-note.md')).toBe(false);
    });
});
