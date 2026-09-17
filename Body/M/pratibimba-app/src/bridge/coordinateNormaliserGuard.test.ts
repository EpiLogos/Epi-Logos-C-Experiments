// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findLocalNormaliserViolations, GuardSource } from './coordinateNormaliserGuard';

const SRC_ROOT = dirname(dirname(fileURLToPath(import.meta.url))); // .../src

function collectCarrierSources(dir: string): GuardSource[] {
    const out: GuardSource[] = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
            out.push(...collectCarrierSources(full));
            continue;
        }
        if (!/\.(ts|tsx)$/.test(entry.name)) continue;
        // Test fixtures legitimately name the banned patterns to prove the guard
        // has teeth; the guard governs production render code only.
        if (/\.test\.(ts|tsx)$/.test(entry.name)) continue;
        out.push({ file: relative(SRC_ROOT, full), content: readFileSync(full, 'utf8') });
    }
    return out;
}

describe('coordinate normaliser guard (Track 45.T45.3)', () => {
    it('finds zero local coordinate normalisers under the carrier src tree', () => {
        const sources = collectCarrierSources(SRC_ROOT);
        // sanity: the scan actually walked real files, not an empty set
        expect(sources.length).toBeGreaterThan(20);
        expect(sources.some(s => s.file.endsWith('coordinateRender.ts'))).toBe(true);

        const violations = findLocalNormaliserViolations(sources);
        // A non-empty array here means someone added a sixth local normaliser —
        // coordinates must render through the gateway seam (coordinateRender),
        // never a local `#`→`M` / context-frame / division-slash transform.
        expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
    });

    it('has teeth: it flags a reused normaliser identifier', () => {
        // graph-services / bimba-mcp impl name reused locally — the exact smell.
        const violation = [
            {
                file: 'panes/BadPane.tsx',
                content: 'export function wrapContextFrames(c: string) { return c; }'
            }
        ];
        const found = findLocalNormaliserViolations(violation);
        expect(found.length).toBeGreaterThan(0);
        expect(found[0].rule).toBe('reused-normaliser-identifier');
    });

    it('has teeth: it flags a local hash→M replace', () => {
        const violation = [
            { file: 'panes/BadPane.tsx', content: "const canon = raw.replace('#', 'M');" }
        ];
        const found = findLocalNormaliserViolations(violation);
        expect(found.map(v => v.rule)).toContain('local-hash-to-m-replace');
    });

    it('has teeth: it flags a division-slash substitution', () => {
        const slash = String.fromCharCode(0x2215);
        const violation = [
            { file: 'panes/BadPane.tsx', content: `const name = coord.split('/').join('${slash}');` }
        ];
        const found = findLocalNormaliserViolations(violation);
        expect(found.map(v => v.rule)).toContain('division-slash-substitution');
    });

    it('does not flag legitimate gateway-verbatim rendering', () => {
        const clean = [
            {
                file: 'bridge/coordinateRender.ts',
                content: 'export function renderGatewayCoordinate(v: string) { return v; }'
            },
            {
                file: 'panes/WalkPane.tsx',
                content: 'return <h3>{renderGatewayCoordinate(node.coordinate)}</h3>;'
            }
        ];
        expect(findLocalNormaliserViolations(clean)).toEqual([]);
    });
});
