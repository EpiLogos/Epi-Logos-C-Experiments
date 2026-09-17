/**
 * Coordinate: M' shell (foundation-principle parity — Track 15.T15.1)
 * Actualises: the adherence validator — the app's nine named principles are
 *   IN PARITY with the frozen contract registry (same numbered rows, same
 *   names), so contract drift breaks the build. Same cross-file parity
 *   pattern as portal-core's kernel-bridge interface tests.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
    UI_FOUNDATION_PRINCIPLE_ADHERENCE,
    UI_FOUNDATION_PRINCIPLES
} from './foundationPrinciples';

const REGISTRY = resolve(
    __dirname,
    '../../../epi-theia/extensions/contracts/ui-foundation-principles.md'
);

describe('ui foundation principles (15.T15.1 / G7)', () => {
    it('the carrier declares adherence and names exactly nine principles', () => {
        expect(UI_FOUNDATION_PRINCIPLE_ADHERENCE).toBe(true);
        expect(UI_FOUNDATION_PRINCIPLES).toHaveLength(9);
    });

    it('the nine names are in PARITY with the frozen contract registry rows', () => {
        const registry = readFileSync(REGISTRY, 'utf8');
        const rows = registry
            .split('\n')
            .map(line => /^\| (\d)\. ([^|]+) \|/.exec(line))
            .filter((m): m is RegExpExecArray => m !== null);
        expect(rows).toHaveLength(9);
        for (const match of rows) {
            const index = Number(match[1]) - 1;
            expect(UI_FOUNDATION_PRINCIPLES[index]).toBe(match[2].trim());
        }
    });
});
