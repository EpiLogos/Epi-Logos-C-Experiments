/**
 * Coordinate: M' `/` membrane (slash grammar law tests — Tranche 27.T27.1)
 * Actualises: the grammar verification — verbs/targets/args parse, ordinary
 *   prose and bare `/` return null, the translate triple decomposes, the
 *   DR-B-3 guard rejects EVERY Aletheia subagent on direct /dispatch, and
 *   the completion provider filters the spec-named local fallback registry.
 */

import { describe, expect, it } from 'vitest';
import {
    ALETHEIA_SUBAGENTS,
    LOCAL_CAPABILITY_FALLBACK,
    completionsFor,
    dispatchGuard,
    isSlashCommandLine,
    parseSlashCommand,
    parseTranslateForms
} from './slashCommand';

describe('slash-command grammar (27.1)', () => {
    it('parses verb/target/args and passes ordinary prose through as null', () => {
        expect(parseSlashCommand('/dispatch nous walk the graph')).toEqual({
            verb: 'dispatch',
            target: 'nous',
            args: ['walk', 'the', 'graph'],
            raw: '/dispatch nous walk the graph'
        });
        expect(parseSlashCommand('speak to me of the One')).toBeNull();
        expect(parseSlashCommand('/')).toBeNull();
        expect(parseSlashCommand('  /session resume sess-9 ')?.target).toBe('resume');
        expect(isSlashCommandLine('  /skills list')).toBe(true);
        expect(isSlashCommandLine('no slash')).toBe(false);
    });

    it('decomposes the translate triple across all arrow spellings', () => {
        for (const arrow of ['→', '->', '=>']) {
            const cmd = parseSlashCommand(`/translate philosophical-english ${arrow} owl the One precedes number`);
            expect(cmd).not.toBeNull();
            expect(parseTranslateForms(cmd!)).toEqual({
                from: 'philosophical-english',
                to: 'owl',
                text: 'the One precedes number'
            });
        }
        expect(parseTranslateForms(parseSlashCommand('/translate owl')!)).toBeNull();
    });

    it('DR-B-3: rejects direct /dispatch of every Aletheia subagent with the crystallise hint', () => {
        for (const subagent of ALETHEIA_SUBAGENTS) {
            const guard = dispatchGuard(parseSlashCommand(`/dispatch ${subagent} do a thing`)!);
            expect(guard.rejected).toBe(true);
            expect(guard.message).toMatch(/crystallisation-mode/);
        }
        expect(dispatchGuard(parseSlashCommand('/dispatch nous explore')!).rejected).toBe(false);
        expect(dispatchGuard(parseSlashCommand('/aletheia crystallise insight')!).rejected).toBe(false);
    });

    it('completion provider surfaces the full fallback on bare slash and narrows by prefix', () => {
        expect(completionsFor('/')).toHaveLength(LOCAL_CAPABILITY_FALLBACK.length);
        const session = completionsFor('/ses');
        expect(session.length).toBe(2);
        expect(session.every(entry => entry.command.startsWith('/session'))).toBe(true);
        expect(completionsFor('ordinary prose')).toHaveLength(0);
    });
});
