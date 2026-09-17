/**
 * Coordinate: M' shell-0 (highlight category register acceptance — 30.T30.7)
 * Residency: Body/M/pratibimba-app/src/ui
 * Actualises: the 30.7 verification — export integrity over all ten entries,
 *   consumer-collapse (no surface keeps a private copy of the vocabulary),
 *   FloatingMenu eligibility (user-side in, agent-side out), the 19.11
 *   orbit alignment, and CROSS-STACK PARITY: the S4 Khora and Chronos sources
 *   are READ (never imported — M -> S is forbidden) and must agree with the
 *   register, so the two stacks cannot drift apart in silence.
 */

// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { cleanup, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
    HIGHLIGHT_CATEGORY_IDS,
    agentHighlightCategories,
    categoryForOrbit,
    highlightCategory,
    isHighlightCategory,
    userHighlightCategories
} from './highlightCategoryRegistry';
import {
    AGENT_HIGHLIGHT_CATEGORIES,
    HIGHLIGHT_VISUAL_REGISTERS,
    USER_HIGHLIGHT_CATEGORIES,
    createHighlightEditor
} from '../panes/m4NaraHighlightMark';
import { NaraFloatingMenu } from '../panes/NaraFloatingMenu';

const APP_ROOT = process.cwd();
const REPO_ROOT = resolve(APP_ROOT, '..', '..', '..');
const TA_ONTA = join(REPO_ROOT, 'Body', 'S', 'S4', 'ta-onta');

describe('30.T30.7 highlight category register — export integrity', () => {
    it('carries exactly the ten categories, four user and six agent', () => {
        expect(HIGHLIGHT_CATEGORY_IDS).toHaveLength(10);
        expect(userHighlightCategories).toEqual(['daily-note', 'oracle', 'dream', 'expand']);
        expect(agentHighlightCategories).toEqual([
            'recognition',
            'prospective-surfacing',
            'retrospective-surfacing',
            'kairos-touch',
            'somatic-mark',
            'live-spread'
        ]);
    });

    it('every entry carries every required field, with no empty prose', () => {
        for (const id of HIGHLIGHT_CATEGORY_IDS) {
            const entry = highlightCategory(id);
            expect(entry.id).toBe(id);
            expect(['user', 'agent']).toContain(entry.side);
            expect(entry.colourToken).toBe(`epilogos.colour.highlight-category.${id}`);
            expect(entry.cssVariable.startsWith('--nara-highlight-')).toBe(true);
            // a semantic meaning that says nothing is the same as none
            expect(entry.semanticMeaning.trim().length).toBeGreaterThan(20);
            expect(entry.allowedSourceExtensions.length).toBeGreaterThan(0);
            expect(typeof entry.floatingMenuEligible).toBe('boolean');
            expect(entry.visualRegister.trim()).not.toBe('');
        }
    });

    it('the runtime side agrees with the compile-time partition', () => {
        for (const id of userHighlightCategories) {
            expect(highlightCategory(id).side).toBe('user');
        }
        for (const id of agentHighlightCategories) {
            expect(highlightCategory(id).side).toBe('agent');
        }
    });

    it('isHighlightCategory admits the ten and refuses anything else', () => {
        for (const id of HIGHLIGHT_CATEGORY_IDS) {
            expect(isHighlightCategory(id)).toBe(true);
        }
        for (const bogus of ['', 'Daily-Note', 'recognition ', 'insight', null, 7, {}]) {
            expect(isHighlightCategory(bogus)).toBe(false);
        }
    });
});

describe('30.T30.7 FloatingMenu eligibility', () => {
    it('user-side categories are eligible and agent-side categories are NOT', () => {
        for (const id of userHighlightCategories) {
            expect(highlightCategory(id).floatingMenuEligible).toBe(true);
        }
        for (const id of agentHighlightCategories) {
            expect(highlightCategory(id).floatingMenuEligible).toBe(false);
        }
    });

    it('only m4-nara may originate a user category; agent categories are S4-sourced', () => {
        for (const id of userHighlightCategories) {
            expect(highlightCategory(id).allowedSourceExtensions).toEqual(['m4-nara']);
        }
        for (const id of agentHighlightCategories) {
            const sources = highlightCategory(id).allowedSourceExtensions;
            expect(sources).toContain('s4-0p-khora');
            expect(sources).toContain('s4-3p-chronos');
            expect(sources).not.toContain('m4-nara');
        }
    });

    it('the rendered FloatingMenu offers exactly the eligible set — no agent category reaches it', () => {
        const editor = { state: { selection: { to: 0 } } } as never;
        const service = { recordHighlights: () => {} } as never;
        const { container } = render(
            NaraFloatingMenu({
                editor,
                state: { isOpen: true, selectedText: 'a passage' },
                service,
                onClose: () => {},
                onAgentAction: () => {}
            }) as never
        );

        const offered = [...container.querySelectorAll('[data-highlight-category]')].map(node =>
            node.getAttribute('data-highlight-category')
        );
        expect(offered).toEqual([...userHighlightCategories]);
        for (const id of agentHighlightCategories) {
            expect(offered).not.toContain(id);
            expect(highlightCategory(id).floatingMenuEligible).toBe(false);
        }
        cleanup();
    });
});

describe('30.T30.7 the 19.11 orbit alignment is structural', () => {
    it('an orbit maps to the category it inscribes', () => {
        expect(categoryForOrbit('immediate')).toBe('recognition');
        expect(categoryForOrbit('next-morning')).toBe('retrospective-surfacing');
        expect(categoryForOrbit('saturnine')).toBe('prospective-surfacing');
    });

    it('every declared orbit is claimed by exactly one category', () => {
        const orbits = HIGHLIGHT_CATEGORY_IDS.map(id => highlightCategory(id).responseOrbit).filter(
            (orbit): orbit is NonNullable<typeof orbit> => orbit !== undefined
        );
        expect(new Set(orbits).size).toBe(orbits.length);
    });

    it('a category with no fixed orbit says so rather than defaulting to one', () => {
        for (const id of ['kairos-touch', 'somatic-mark', 'live-spread'] as const) {
            expect(highlightCategory(id).responseOrbit).toBeUndefined();
        }
    });
});

describe('30.T30.7 consumer collapse — one vocabulary, no private copies', () => {
    it('the m4-nara mark derives its lists from the register instead of declaring them', () => {
        expect(USER_HIGHLIGHT_CATEGORIES).toBe(userHighlightCategories);
        expect(AGENT_HIGHLIGHT_CATEGORIES).toBe(agentHighlightCategories);

        const mark = readFileSync(join(APP_ROOT, 'src', 'panes', 'm4NaraHighlightMark.ts'), 'utf8');
        expect(mark).toContain("from '../ui/highlightCategoryRegistry'");

        // The local enum is gone. Nine of the ten ids are not spelled here at
        // all; `daily-note` survives only as a PARSE FALLBACK (the Tiptap
        // attribute default and the extraction default), never as part of a
        // declared vocabulary — so each surviving line must be a fallback.
        for (const id of HIGHLIGHT_CATEGORY_IDS) {
            const lines = mark
                .split('\n')
                .filter(line => line.includes(`'${id}'`));
            if (id === 'daily-note') {
                expect(lines.length).toBeGreaterThan(0);
                for (const line of lines) {
                    expect(line, `daily-note must appear only as a fallback: ${line.trim()}`).toMatch(
                        /default:|\?\?/
                    );
                }
            } else {
                expect(lines, `${id} must not be spelled in the mark`).toEqual([]);
            }
        }
        // and no re-declared list of ids remains
        expect(mark).not.toMatch(/Object\.freeze\(\[\s*'daily-note'/);
    });

    it('the visual registers project from the register, covering all ten', () => {
        expect(Object.keys(HIGHLIGHT_VISUAL_REGISTERS)).toHaveLength(10);
        for (const id of HIGHLIGHT_CATEGORY_IDS) {
            expect(HIGHLIGHT_VISUAL_REGISTERS[id]).toEqual({
                cssVariable: highlightCategory(id).cssVariable,
                register: highlightCategory(id).visualRegister
            });
        }
    });

    it('a rendered mark carries its register-declared visual register and category', () => {
        // Behavioural: drive the real Tiptap mark through a real document and
        // read what actually reaches the DOM, rather than grepping the source.
        for (const id of HIGHLIGHT_CATEGORY_IDS) {
            const editor = createHighlightEditor(
                `<mark data-highlight-id="h1" data-category="${id}" data-timestamp="1" data-original-text="x">x</mark>`
            );
            const html = editor.getHTML();
            expect(html).toContain(`data-category="${id}"`);
            expect(html).toContain(`data-visual-register="${highlightCategory(id).visualRegister}"`);
            expect(html).toContain(`m4-nara-highlight-${id}`);
            editor.destroy();
        }
    });

    it('every cssVariable the register names is really defined by the stylesheet', () => {
        // Applied to a real element through a real stylesheet: an undefined
        // custom property resolves to empty, so this fails when styles.css and
        // the register disagree — no source grep involved.
        const style = document.createElement('style');
        style.textContent = readFileSync(join(APP_ROOT, 'src', 'styles.css'), 'utf8');
        document.head.appendChild(style);
        const probe = document.createElement('div');
        document.body.appendChild(probe);

        for (const id of HIGHLIGHT_CATEGORY_IDS) {
            const value = getComputedStyle(document.documentElement)
                .getPropertyValue(highlightCategory(id).cssVariable)
                .trim();
            expect(value, `${highlightCategory(id).cssVariable} is undefined`).not.toBe('');
            expect(value).toMatch(/^#[0-9a-fA-F]{3,8}$/);
        }

        probe.remove();
        style.remove();
    });
});

describe('30.T30.7 cross-stack parity — read, never import (M -> S is forbidden)', () => {
    it('Khora agrees with the register on the six agent categories', () => {
        const khora = readFileSync(
            join(TA_ONTA, 'S4-0p-khora', 'modules', 'highlighted-inscription.ts'),
            'utf8'
        );
        const declared = /AGENT_HIGHLIGHT_CATEGORIES\s*=\s*Object\.freeze\(\[([^\]]*)\]/.exec(khora);
        expect(declared).not.toBeNull();
        const ids = [...(declared?.[1] ?? '').matchAll(/"([a-z-]+)"/g)].map(match => match[1]);
        expect(ids).toEqual([...agentHighlightCategories]);
    });

    it('Chronos agrees with the register on the fixed response orbits', () => {
        const chronos = readFileSync(
            join(TA_ONTA, 'S4-3p-chronos', 'modules', 'temporal-control-plane.ts'),
            'utf8'
        );
        for (const orbit of ['immediate', 'next-morning', 'saturnine'] as const) {
            expect(chronos).toContain(`"${orbit}"`);
            // and the register must claim it, or the alignment has drifted
            expect(categoryForOrbit(orbit)).not.toBeNull();
        }
    });
});
