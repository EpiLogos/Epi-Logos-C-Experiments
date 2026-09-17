/**
 * Coordinate: M' M0' (Canon Studio editor-extension tests — 28.T28.4)
 * Residency: Body/M/pratibimba-app/src/panes/canonEditorExtensions.test.ts
 * Actualises: proof that the decoration builder accepts real canonical text and
 *   places the two mark classes, and that the Smart-Connections completion
 *   source only fires inside `[[`, rides the live S1 method, gates on privacy,
 *   and refuses honestly when the gateway is down or S1 errors.
 */

import { EditorState } from '@codemirror/state';
import { CompletionContext } from '@codemirror/autocomplete';
import { describe, expect, it, vi } from 'vitest';
import { buildCanonDecorations, createSemanticCompletionSource } from './canonEditorExtensions';
import { SEMANTIC_CONNECTIONS_METHOD } from './semanticConnections';

function classesFor(doc: string): Array<{ from: number; to: number; cls: string }> {
    const set = buildCanonDecorations(doc);
    const found: Array<{ from: number; to: number; cls: string }> = [];
    const cursor = set.iter();
    while (cursor.value) {
        found.push({
            from: cursor.from,
            to: cursor.to,
            cls: (cursor.value.spec as { class: string }).class
        });
        cursor.next();
    }
    return found;
}

function contextAt(doc: string, pos: number, explicit = true): CompletionContext {
    return new CompletionContext(EditorState.create({ doc }), pos, explicit);
}

const artifact = (candidates: unknown[]) => ({
    artifact: {
        seedSources: [],
        candidates,
        warnings: [],
        staleness: 'current',
        smartEnvIndexPath: '/tmp/.smart-env/multi'
    }
});

const candidate = (wikilinkTitle: string, privacyClass: 'public' | 'protected' = 'public') => ({
    targetPath: `Bimba/World/${wikilinkTitle}.md`,
    wikilinkTitle,
    score: 0.7,
    kind: 'semantic-source',
    evidenceSourcePath: `Bimba/World/${wikilinkTitle}.md`,
    evidenceLines: null,
    stale: false,
    privacyClass
});

describe('buildCanonDecorations', () => {
    it('places both mark classes over real canonical prose', () => {
        expect(classesFor('S1 is served by [[Hen]].')).toEqual([
            { from: 0, to: 2, cls: 'ql-coordinate' },
            { from: 16, to: 23, cls: 'bimba-wikilink' }
        ]);
    });

    it('accepts a document whose marks interleave without overlapping', () => {
        // RangeSetBuilder throws on unsorted or overlapping input — that this
        // returns at all is the ordering proof.
        const doc = '[[Bimba]] M0 [[Hen]] S4-5\' C5 [[S1]]';
        expect(classesFor(doc).map(range => range.cls)).toEqual([
            'bimba-wikilink',
            'ql-coordinate',
            'bimba-wikilink',
            'ql-coordinate',
            'ql-coordinate',
            'bimba-wikilink'
        ]);
    });

    it('decorates nothing in plain prose', () => {
        expect(classesFor('an ordinary sentence with no coordinates')).toEqual([]);
    });
});

describe('createSemanticCompletionSource', () => {
    const deps = (overrides: Partial<Parameters<typeof createSemanticCompletionSource>[0]> = {}) => ({
        notePath: 'Bimba/World/Types/Coordinates/S/S1/S1.md',
        ready: () => true,
        invoke: vi.fn().mockResolvedValue(artifact([candidate('Hen')])),
        ...overrides
    });

    it('does not fire outside a wikilink', async () => {
        const config = deps();
        const source = createSemanticCompletionSource(config);
        expect(await source(contextAt('plain prose here', 5))).toBeNull();
        expect(config.invoke).not.toHaveBeenCalled();
    });

    it('asks the live S1 method, note-scoped, and offers the candidates', async () => {
        const config = deps();
        const source = createSemanticCompletionSource(config);
        const doc = 'linking [[H';
        const result = await source(contextAt(doc, doc.length));
        expect(config.invoke).toHaveBeenCalledWith(SEMANTIC_CONNECTIONS_METHOD, {
            notePath: config.notePath,
            includeStale: true,
            limit: 20
        });
        expect(result?.options.map(option => option.label)).toEqual(['Hen']);
        // Replacement spans exactly the typed query, not the brackets.
        expect(result?.from).toBe(doc.length - 1);
        expect(result?.to).toBe(doc.length);
    });

    it('never offers a protected candidate', async () => {
        const config = deps({
            invoke: vi.fn().mockResolvedValue(artifact([candidate('PASU', 'protected')]))
        });
        const source = createSemanticCompletionSource(config);
        const doc = 'see [[P';
        expect(await source(contextAt(doc, doc.length))).toBeNull();
    });

    it('reports the index state through the disclosure seam', async () => {
        const states: unknown[] = [];
        const source = createSemanticCompletionSource(deps({ onState: state => states.push(state) }));
        const doc = 'see [[';
        await source(contextAt(doc, doc.length));
        expect(states).toEqual([{ kind: 'ok', staleness: 'current', count: 1 }]);
    });

    it('refuses honestly when the gateway is disconnected — no throw, no suggestions', async () => {
        const states: unknown[] = [];
        const config = deps({ ready: () => false, onState: state => states.push(state) });
        const source = createSemanticCompletionSource(config);
        const doc = 'see [[';
        expect(await source(contextAt(doc, doc.length))).toBeNull();
        expect(config.invoke).not.toHaveBeenCalled();
        expect(states).toEqual([{ kind: 'unavailable', reason: 'gateway disconnected' }]);
    });

    it('carries an S1 error into the disclosure rather than breaking the editor', async () => {
        const states: Array<{ kind: string; reason?: string }> = [];
        const source = createSemanticCompletionSource(
            deps({
                invoke: vi.fn().mockRejectedValue(new Error('vault root missing')),
                onState: state => states.push(state)
            })
        );
        const doc = 'see [[';
        expect(await source(contextAt(doc, doc.length))).toBeNull();
        expect(states[0]).toEqual({ kind: 'unavailable', reason: 'vault root missing' });
    });
});
