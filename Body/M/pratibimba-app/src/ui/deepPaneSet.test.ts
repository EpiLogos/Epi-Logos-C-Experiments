// @vitest-environment node
/**
 * Coordinate: M' (deep pane-set validator — rerun 52.T4)
 * Residency: Body/M/pratibimba-app/src/ui
 * Actualises: the doc-code gate for the `ide-deep` pane set, the deep-layout
 *   sibling of `src/chromeContract.test.ts`. That validator holds
 *   CHROME-CONTRACT §2 against an AST walk of `App.tsx`; the deep models are
 *   built from a DECLARATION (`ui/deepPaneSet.ts`) rather than from string
 *   literals in the shell, so this file is what keeps the declaration in
 *   lockstep — with the contract, with the real daily registry, and with the
 *   reservations it promises other tranches.
 *
 *   Four claims, all fail-closed:
 *     (a) every MOUNT is a §2 row with status `live`, and the factory can
 *         really render it (its case label exists);
 *     (b) every RESERVATION is a §2 row still carrying its doc-ahead status,
 *         and is genuinely absent from both deep models — mounting one would
 *         steal 28.5 / 28.6 / 28.13's deliverable and trip the §2 validator;
 *     (c) the partition is TOTAL — every daily-model surface is either carried
 *         into depth or explicitly withdrawn with a reason, so a future daily
 *         surface cannot go silently unclassified (the
 *         `ui/dailySurfaceOwnership.ts` discipline);
 *     (d) the two deep models are genuinely DIFFERENT pane sets, per face.
 * Does NOT own: the partition assignments (the contract), the pane bodies, the
 *   daily models (App.tsx), or the reserved bodies (their tranches).
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import {
    DEEP_PANE_RESERVATIONS,
    DEEP_PANE_SET,
    DEEP_PANE_WITHDRAWALS,
    deepLayoutJson,
    deepMainTabsetId,
    deepPaneMounts,
    type DeepPaneModelId
} from './deepPaneSet';

const CONTRACT_PATH = resolve(__dirname, '../../CHROME-CONTRACT.md');
const APP_PATH = resolve(__dirname, '../App.tsx');
const MODELS: readonly DeepPaneModelId[] = ['cosmic', 'personal'];

/** §2 rows, keyed by surface id — the same slice `chromeContract.test.ts` parses. */
function contractRows(): Map<string, { status: string; owner: string; deepMarker: string | null }> {
    const body = readFileSync(CONTRACT_PATH, 'utf8');
    const lines = body.split('\n');
    const start = lines.findIndex(line => line.startsWith('## 2.'));
    let end = lines.length;
    for (let i = start + 1; i < lines.length; i++) {
        if (lines[i].startsWith('## ')) {
            end = i;
            break;
        }
    }
    const rows = new Map<string, { status: string; owner: string; deepMarker: string | null }>();
    for (const line of lines.slice(start, end)) {
        if (!/^\| `[^`]+` \|/.test(line)) {
            continue;
        }
        const cells = line.split('|').map(cell => cell.trim());
        // The Mount cell names DAILY residency; a deep EXCEPTION is appended as
        // `· **deep:** withdrawn` / `· **deep:** reserved — …`. Carried surfaces
        // say nothing (the declaration below is their authority), so the marker
        // is present exactly on the exceptions — which is what makes it checkable.
        const marker = /·\s+\*\*deep:\*\*\s+(withdrawn|reserved)\b/.exec(cells[2]);
        rows.set(cells[1].replace(/`/g, ''), {
            status: cells[4],
            owner: cells[5],
            deepMarker: marker ? marker[1] : null
        });
    }
    return rows;
}

/**
 * The DAILY registry, from the real shell source. The deep models take their
 * component keys from the manifest, so every string-literal `component:` in
 * `App.tsx` is a daily-model (or dynamic `vault.open`) surface — which is
 * exactly the set the withdrawal partition has to cover.
 */
function appRegistry(): { componentKeys: Set<string>; factoryCases: Set<string> } {
    const source = ts.createSourceFile(
        APP_PATH,
        readFileSync(APP_PATH, 'utf8'),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX
    );
    const componentKeys = new Set<string>();
    const factoryCases = new Set<string>();
    const visit = (node: ts.Node, inFactory: boolean) => {
        let nowInFactory = inFactory;
        if (ts.isFunctionDeclaration(node) && node.name?.text === 'factory') {
            nowInFactory = true;
        }
        if (
            ts.isPropertyAssignment(node)
            && ts.isIdentifier(node.name)
            && node.name.text === 'component'
            && ts.isStringLiteral(node.initializer)
        ) {
            componentKeys.add(node.initializer.text);
        }
        if (nowInFactory && ts.isCaseClause(node) && ts.isStringLiteral(node.expression)) {
            factoryCases.add(node.expression.text);
        }
        ts.forEachChild(node, child => visit(child, nowInFactory));
    };
    visit(source, false);
    return { componentKeys, factoryCases };
}

const rows = contractRows();
const { componentKeys, factoryCases } = appRegistry();

/** Every component id a deep model actually mounts (both faces, all slots). */
function deepModelComponents(model: DeepPaneModelId): Set<string> {
    const json = deepLayoutJson(model, { type: 'border', location: 'right', children: [] }) as {
        borders: ReadonlyArray<{ children?: ReadonlyArray<{ component?: string }> }>;
        layout: { children: ReadonlyArray<{ children: ReadonlyArray<{ component?: string }> }> };
    };
    const ids = new Set<string>();
    for (const border of json.borders) {
        for (const child of border.children ?? []) {
            if (child.component) {
                ids.add(child.component);
            }
        }
    }
    for (const tabset of json.layout.children) {
        for (const child of tabset.children) {
            if (child.component) {
                ids.add(child.component);
            }
        }
    }
    return ids;
}

const allDeepComponents = new Set(
    MODELS.flatMap(model => [...deepModelComponents(model)])
);

describe('52.T4 deep pane set — well-formed declaration', () => {
    it('parses a real registry to check against (not an empty walk)', () => {
        expect(rows.size).toBeGreaterThanOrEqual(30);
        expect(factoryCases.size).toBeGreaterThanOrEqual(20);
        expect(componentKeys.has('cosmic')).toBe(true);
    });

    it('declares a non-trivial pane set with unique ids and real labels', () => {
        expect(DEEP_PANE_SET.length).toBeGreaterThanOrEqual(20);
        const ids = DEEP_PANE_SET.map(mount => mount.surfaceId);
        expect(new Set(ids).size, 'a surface is declared once').toBe(ids.length);
        for (const mount of DEEP_PANE_SET) {
            expect(mount.label.length, `${mount.surfaceId} label`).toBeGreaterThan(0);
            expect(mount.why.length, `${mount.surfaceId} rationale`).toBeGreaterThan(20);
        }
    });

    it('the two deep models are different pane sets — per-face, per DR-DEEP-LAYOUT-1', () => {
        const cosmic = deepModelComponents('cosmic');
        const personal = deepModelComponents('personal');
        expect([...cosmic].sort()).not.toEqual([...personal].sort());
        // …and each carries its own main tabset id, so a saved layout or an
        // addNode target can never confuse a deep tabset with its daily twin.
        for (const model of MODELS) {
            const json = deepLayoutJson(model, { type: 'border', location: 'right', children: [] });
            expect(json.layout.children[0].id).toBe(deepMainTabsetId(model));
            expect(json.layout.children[0].id).not.toBe('cosmic-main');
            expect(json.layout.children[0].id).not.toBe('personal-main');
        }
    });
});

describe('52.T4 deep pane set ⇄ CHROME-CONTRACT §2 lockstep', () => {
    it('every mounted surface is a contract row the shell may really render', () => {
        for (const mount of DEEP_PANE_SET) {
            const row = rows.get(mount.surfaceId);
            expect(row, `deep mount \`${mount.surfaceId}\` has a §2 row`).toBeDefined();
            expect(row!.status, `deep mount \`${mount.surfaceId}\` status`).toBe('live');
            expect(
                factoryCases.has(mount.surfaceId),
                `the factory renders deep mount \`${mount.surfaceId}\``
            ).toBe(true);
        }
    });

    it('every reserved seam is still doc-ahead AND genuinely unmounted', () => {
        for (const reservation of DEEP_PANE_RESERVATIONS) {
            const row = rows.get(reservation.surfaceId);
            expect(row, `reservation \`${reservation.surfaceId}\` has a §2 row`).toBeDefined();
            expect(row!.status, `reservation \`${reservation.surfaceId}\` status`).toBe(
                reservation.contractStatus
            );
            expect(
                allDeepComponents.has(reservation.surfaceId),
                `\`${reservation.surfaceId}\` is RESERVED for ${reservation.owner} — mounting it here steals that tranche's deliverable and trips the §2 validator`
            ).toBe(false);
            expect(
                factoryCases.has(reservation.surfaceId),
                `\`${reservation.surfaceId}\` must stay out of the factory while reserved`
            ).toBe(false);
            expect(reservation.owner).toMatch(/^28\.T28\.\d+$/);
        }
    });

    it('the §2 `· **deep:**` markers are exactly the exceptions — both directions', () => {
        // §2's standing rule (the three bullets under the status vocabulary)
        // promises a marker on every withdrawal and every reservation, and
        // silence on everything carried. Prose that promises a marker is worth
        // nothing unless the promise is read back out of the file, so:
        const withdrawn = new Set(DEEP_PANE_WITHDRAWALS.map(entry => entry.surfaceId));
        const reserved = new Set(DEEP_PANE_RESERVATIONS.map(entry => entry.surfaceId));
        const marked = { withdrawn: [] as string[], reserved: [] as string[] };
        for (const [surfaceId, row] of rows) {
            if (row.deepMarker === 'withdrawn') {
                marked.withdrawn.push(surfaceId);
            } else if (row.deepMarker === 'reserved') {
                marked.reserved.push(surfaceId);
            }
        }
        expect(
            marked.withdrawn.sort(),
            'every withdrawal is marked on its row, and nothing else is'
        ).toEqual([...withdrawn].sort());
        expect(
            marked.reserved.sort(),
            'every reservation is marked on its row, and nothing else is'
        ).toEqual([...reserved].sort());
        // …and a carried surface stays silent: `deepPaneSet.ts` is its authority.
        for (const mount of DEEP_PANE_SET) {
            expect(
                rows.get(mount.surfaceId)?.deepMarker,
                `carried surface \`${mount.surfaceId}\` must not claim a deep exception`
            ).toBeNull();
        }
    });

    it('the four designated pending surfaces are all accounted for', () => {
        // Only 28.13 still holds a reserved position. 28.T28.5 and 28.T28.6
        // CONSUMED theirs — `agenticControlRoom` and `coordinateTree` are now
        // `live` §2 rows carried in `DEEP_PANE_SET`, which the assertions below
        // check from the other side so neither move can be half-done. 28.11's
        // `readiness-gate` is a per-binding inline wrapper, not a slot occupant,
        // so it has no pane-set position to reserve — and must not acquire one
        // by accident.
        const reserved = DEEP_PANE_RESERVATIONS.map(entry => entry.surfaceId).sort();
        expect(reserved).toEqual(['backendStudio']);
        expect(rows.get('agenticControlRoom')?.status).toBe('live');
        expect(allDeepComponents.has('agenticControlRoom')).toBe(true);
        expect(rows.get('coordinateTree')?.status).toBe('live');
        expect(allDeepComponents.has('coordinateTree')).toBe(true);
        expect(rows.get('readiness-gate')?.status).toBe('pending');
        expect(allDeepComponents.has('readiness-gate')).toBe(false);
    });

    it('the coordinate tree is carried in BOTH layouts — daily rail and both deep rails', () => {
        // The conjugate of the control room's DEEP-ONLY case. `LEFT_SIDEBAR_MODES`
        // declares `coordinate-tree` available in both layouts AND makes it the
        // cross-layout fallback mode; that is only true if the surface really
        // mounts in the daily registry too. `componentKeys` IS the daily registry.
        expect(componentKeys.has('coordinateTree')).toBe(true);
        expect(factoryCases.has('coordinateTree')).toBe(true);
        expect(deepModelComponents('personal').has('coordinateTree')).toBe(true);
        expect(deepModelComponents('cosmic').has('coordinateTree')).toBe(true);
        // …and it is not the opening tab of the rail it joins.
        const leftRail = DEEP_PANE_SET.filter(mount => mount.slot === 'left');
        expect(leftRail[0]?.surfaceId).not.toBe('coordinateTree');
        // A tree that published on mount would need `mountPublishes`; this one
        // publishes only from a click, so the absence is the claim.
        expect(
            DEEP_PANE_SET.find(mount => mount.surfaceId === 'coordinateTree')?.mountPublishes
        ).toBeUndefined();
    });

    it('the control room is DEEP-ONLY — carried in depth, absent from every daily model', () => {
        // The first surface in this carrier with no daily residency at all
        // (DR-WC-IS-1: the OmniPanel folds carry the always-on abbreviated
        // render, so the governance-primary pane has no reason to exist in the
        // preview layout). `componentKeys` is the DAILY registry, so its absence
        // there is the whole claim.
        expect(componentKeys.has('agenticControlRoom')).toBe(false);
        expect(factoryCases.has('agenticControlRoom')).toBe(true);
        expect(deepModelComponents('personal').has('agenticControlRoom')).toBe(true);
        expect(deepModelComponents('cosmic').has('agenticControlRoom')).toBe(false);
    });
});

describe('52.T4 deep pane set — the daily partition is total', () => {
    /** The `/` membrane is layout-invariant (all folds declare both layouts),
     *  and `editor` is dynamic (`vault.open`), so neither is a pane-set choice. */
    const LAYOUT_INVARIANT = new Set([
        'editor',
        ...[...componentKeys].filter(id => id.startsWith('omni'))
    ]);

    it('every daily surface is either carried into depth or explicitly withdrawn', () => {
        const withdrawn = new Set(DEEP_PANE_WITHDRAWALS.map(entry => entry.surfaceId));
        const carried = new Set(DEEP_PANE_SET.map(mount => mount.surfaceId));
        const unclassified = [...componentKeys].filter(
            id => !LAYOUT_INVARIANT.has(id) && !withdrawn.has(id) && !carried.has(id)
        );
        expect(
            unclassified,
            'a daily surface with no deep disposition — carry it or withdraw it with a reason'
        ).toEqual([]);
    });

    it('no surface is both carried and withdrawn, and every withdrawal is real', () => {
        for (const withdrawal of DEEP_PANE_WITHDRAWALS) {
            expect(
                componentKeys.has(withdrawal.surfaceId),
                `withdrawal \`${withdrawal.surfaceId}\` names a real daily surface`
            ).toBe(true);
            expect(
                allDeepComponents.has(withdrawal.surfaceId),
                `\`${withdrawal.surfaceId}\` is declared withdrawn but the deep model mounts it`
            ).toBe(false);
            expect(withdrawal.why.length, `${withdrawal.surfaceId} rationale`).toBeGreaterThan(20);
        }
    });

    it('withdraws BOTH integrated shell previews — "do not merge them"', () => {
        const withdrawn = DEEP_PANE_WITHDRAWALS.map(entry => entry.surfaceId);
        expect(withdrawn).toContain('cosmic');
        expect(withdrawn).toContain('personalHome');
    });
});

describe('52.T4 deep pane set — every cross-layout receiver stays reachable', () => {
    /**
     * A target that declares `preferredLayout: 'ide-deep'` — or `null`, meaning
     * "preserve whatever layout the user is in" — dispatches into the deep
     * model and `App.tsx::navigate` THROWS when the component is not mounted.
     * So the deep pane set owes those receivers a mount. This is the assertion
     * that would have caught a withdrawal that quietly broke intent carriage.
     */
    it('mounts every receiver an intent can land in the deep layout', async () => {
        const { CROSS_LAYOUT_INTENT_TARGETS } = await import('../commands/crossLayoutIntent');
        const missing = CROSS_LAYOUT_INTENT_TARGETS.filter(
            target =>
                target.preferredLayout !== 'daily-0-1'
                && !target.component.startsWith('omni')
                && !deepModelComponents(target.face === 0 ? 'cosmic' : 'personal').has(target.component)
        ).map(target => `${target.extensionId}/${target.contributionId} → ${target.component}`);
        expect(
            missing,
            'these targets can reach the deep layout but have no receiver mounted there'
        ).toEqual([]);
    });

    it('every deep-promoting target lands on the face whose deep model holds it', async () => {
        const { CROSS_LAYOUT_INTENT_TARGETS, DEPTH_DIFFERENTIATED_COMPONENTS } = await import(
            '../commands/crossLayoutIntent'
        );
        for (const component of DEPTH_DIFFERENTIATED_COMPONENTS) {
            const target = CROSS_LAYOUT_INTENT_TARGETS.find(entry => entry.component === component);
            expect(target, `${component} is a declared target`).toBeDefined();
            expect(
                deepModelComponents(target!.face === 0 ? 'cosmic' : 'personal').has(component),
                `depth-differentiated \`${component}\` is mounted in the deep layout it differentiates for`
            ).toBe(true);
        }
    });
});

describe('52.T4 deep pane set — THE OPENING-TAB LAW', () => {
    /**
     * Both faces' deep models render on layout entry (one `face-active`, one
     * `face-hidden`) and FlexLayout's `tabEnableRenderOnDemand` (default true)
     * mounts exactly the SELECTED tab of each tabset. So the FIRST entry of each
     * (model, slot) mounts with no gesture asking for it — including on the face
     * the user cannot see. A first tab that writes shared singleton state on
     * mount therefore corrupts the shell just by being first.
     *
     * This is not hypothetical. 52.T4 first shipped `m1SurfaceDeep` as the
     * opening personal tab; it embeds `WalkPane`, whose mount effect auto-arrives
     * at seed `M1` and publishes it into the ONE shared coordinate store, so
     * entering the deep layout silently re-pointed every M0'/M1' subscriber and
     * broke a sibling's spec. The behavioural half of the proof only fires when
     * the substrate answers fast enough; THIS gate is deterministic.
     */
    it('no deep tabset opens on a surface that writes shared state on mount', () => {
        for (const model of MODELS) {
            for (const slot of ['left', 'main'] as const) {
                const opening = deepPaneMounts(model, slot)[0];
                expect(opening, `${model}/${slot} has an opening mount`).toBeDefined();
                expect(
                    opening.mountPublishes,
                    `\`${opening.surfaceId}\` opens ${model}/${slot} but writes ${opening.mountPublishes?.store} on mount — both faces mount their first tab on layout entry, so this seizes shared state with no gesture asking for it. Order it later.`
                ).toBeUndefined();
            }
        }
    });

    it('every declared mount-publication chain is still true of the real source', () => {
        const declared = DEEP_PANE_SET.filter(mount => mount.mountPublishes);
        // the flag exists because a real body does this — if none does, the
        // field is dead weight and the law has nothing to protect against
        expect(declared.length, 'at least one mount declares the hazard').toBeGreaterThan(0);
        for (const mount of declared) {
            for (const step of mount.mountPublishes!.chain) {
                const body = readFileSync(resolve(__dirname, '..', step.file), 'utf8');
                expect(
                    body.includes(step.anchor),
                    `\`${mount.surfaceId}\`'s mount-publication anchor is gone from ${step.file}: "${step.anchor}". Either the body was fixed — drop \`mountPublishes\` and the ordering constraint with it — or the anchor drifted.`
                ).toBe(true);
            }
        }
    });
});

describe('52.T4 deep pane set — slot shape', () => {
    it('gives BOTH faces the IDE explorer rail (the first per-layout left slot)', () => {
        // 28.T28.6 added the third tab. Order is the claim, not just membership:
        // the opening tab of a rail mounts on the HIDDEN face too, so the
        // navigation backbone is deliberately last (`deepPaneSet.ts`).
        for (const model of MODELS) {
            expect(deepPaneMounts(model, 'left').map(mount => mount.surfaceId)).toEqual([
                'fileTree',
                'semanticConnections',
                'coordinateTree'
            ]);
        }
    });

    it('splits the depth by face — structural on cosmic, lived/governance on personal', () => {
        const cosmic = deepPaneMounts('cosmic', 'main').map(mount => mount.surfaceId);
        const personal = deepPaneMounts('personal', 'main').map(mount => mount.surfaceId);
        expect(cosmic).toContain('bimbaGraph');
        expect(cosmic).toContain('m3Inspectors');
        expect(cosmic).not.toContain('m1SurfaceDeep');
        expect(personal).toContain('m1SurfaceDeep');
        expect(personal).toContain('canonUpdateLedger');
        expect(personal).not.toContain('bimbaGraph');
    });
});
