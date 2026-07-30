// @vitest-environment node
/**
 * Coordinate: M' shell chrome (type-voice base reset — 30.T30.1, guarded 28.T28.5)
 * Residency: Body/M/pratibimba-app/src/ui
 * Actualises: the DETERMINISTIC half of the one-type-voice invariant. The live
 *   half is `tests/e2e/type-voice.spec.ts`, which sweeps every rendered element
 *   in a real browser — but it can only catch an element that happens to be ON
 *   SCREEN when it runs, and a form control rendered inside a boot race is on
 *   screen roughly half the time. That is exactly how this defect survived:
 *   `button` was missing from the base-voice `font: inherit` reset in
 *   `styles.css`, a form control does not inherit type from the cascade, and
 *   `32.T32.7`'s standalone `DiagnosticsDeepLink` (default class
 *   `diagnostics-deep-link`, gated on `integratedReadiness.state ===
 *   'profile_missing_field'`) therefore rendered at Chromium's UA 13.33px —
 *   failing the e2e on about every other run and passing on the rest. Twenty-nine
 *   button classes in this stylesheet carry their own `font: inherit`, which is
 *   the same repair written twenty-nine times; a class that never received it
 *   was one render away from red.
 *
 *   So this file asserts the reset from the source, where no race can hide it:
 *   every UA-defaulted form control the carrier actually renders must be in the
 *   base reset. A regression fails here in milliseconds instead of intermittently
 *   in a six-minute browser suite.
 * Does NOT own: the scale itself (`:root --type-*`), the live sweep
 *   (`tests/e2e/type-voice.spec.ts`), or any per-class typography.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = resolve(__dirname, '..');
/** Comments stripped: a class NAMED in a rationale is not a rule about it, and
 *  the first cut of this file matched its own documentation. */
const STYLES = readFileSync(join(SRC, 'styles.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

/**
 * The base-voice reset block: the element-specificity (0-0-1) selector list
 * whose body is `font: inherit`. Read as a block so the assertion is about the
 * REAL rule and not about a substring that could appear anywhere in 8k lines.
 */
function baseVoiceResetSelectors(): readonly string[] {
    const match = /(^|\n)((?:[a-z]+,\s*\n)*[a-z]+)\s*\{\s*\n\s*font:\s*inherit;\s*\n\s*\}/m.exec(
        STYLES
    );
    expect(match, 'the base-voice `font: inherit` element reset must exist in styles.css').not.toBeNull();
    return (match as RegExpExecArray)[2]
        .split(',')
        .map(selector => selector.trim())
        .filter(Boolean);
}

/** Every form-control tag the carrier really authors in JSX. */
function renderedFormControlTags(): ReadonlySet<string> {
    const tags = new Set<string>();
    const walk = (dir: string) => {
        for (const entry of readdirSync(dir)) {
            const path = join(dir, entry);
            if (statSync(path).isDirectory()) {
                walk(path);
                continue;
            }
            if (!entry.endsWith('.tsx') || entry.includes('.test.')) {
                continue;
            }
            const body = readFileSync(path, 'utf8');
            for (const tag of ['button', 'input', 'select', 'textarea']) {
                if (new RegExp(`<${tag}[\\s/>]`).test(body)) {
                    tags.add(tag);
                }
            }
        }
    };
    walk(SRC);
    return tags;
}

describe('30.T30.1 base voice — the form-control reset (guarded by 28.T28.5)', () => {
    it('resets every UA-defaulted form control the carrier renders', () => {
        const reset = new Set(baseVoiceResetSelectors());
        const rendered = renderedFormControlTags();
        // sanity: the sweep read a real tree, not an empty one
        expect(rendered.size, 'the carrier renders form controls').toBeGreaterThanOrEqual(4);
        for (const tag of rendered) {
            expect(
                reset.has(tag),
                `<${tag}> is rendered by this carrier but is NOT in the base-voice \`font: inherit\` reset. `
                    + 'A form control does not inherit type from the cascade, so every unclassed one renders at '
                    + "the UA default (13.33px) and falls outside the --type-* scale. tests/e2e/type-voice.spec.ts "
                    + 'catches that only when such an element happens to be on screen during the sweep.'
            ).toBe(true);
        }
    });

    it('covers `button` by name — the omission this guard was written for', () => {
        expect(baseVoiceResetSelectors()).toContain('button');
    });

    it('the affordance that exposed it has no rule of its own — the reset is its only cover', () => {
        // `.diagnostics-deep-link` is styled by NOTHING; it rides the element
        // reset. If a future recurrence is "fixed" by styling that one class
        // instead of the element, this fails and points back at the reset.
        expect(STYLES).not.toContain('.diagnostics-deep-link');
    });
});
