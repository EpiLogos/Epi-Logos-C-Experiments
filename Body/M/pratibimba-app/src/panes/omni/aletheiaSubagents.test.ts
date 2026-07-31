// @vitest-environment node
/**
 * Coordinate: M' M5' / `/` membrane (Aletheia surfacing register held against the stack — 26.T26.9)
 * Residency: Body/M/pratibimba-app/src/panes/omni
 * Actualises: the promise `aletheiaSubagents.ts` makes in its own header. Four
 *   claims, none of which a jsdom render can make:
 *
 *     (a) THE REGISTER IS THE SUBSTRATE'S. Every row's id, label and CF binding
 *         is held against `Body/S/S3/gateway-contract/src/aletheia.rs::FacetId`
 *         — its `label()` and `cf_label()` match arms are the source. A guardian
 *         added, renamed, or re-bound to a different CF in the contract reds
 *         this file instead of drifting past six carrier surfaces.
 *
 *     (b) THE SEAM REGISTER IS HONEST IN BOTH DIRECTIONS, and both directions
 *         are load-bearing. A disclosure that outlives its gap tells a reader a
 *         feed is missing after the substrate grew one. So availability is
 *         DERIVED from the real sources and compared with the declared row: the
 *         `facet-return-feed` row must stay `available: false` exactly while no
 *         Body/S source outside `aletheia.rs` (and its own tests) constructs a
 *         `FacetReturn` and while `vetoReason` / `veto_reason` occur nowhere in
 *         Body/S; the `veto-log-persistence` row exactly while
 *         `publish_aletheia_veto` has no caller outside its definition, the
 *         gateway's presence client, and that client's own contract test.
 *
 *     (c) THE LIVE PROJECTION IS LIVE. `aletheiaLineageFromGenealogy` answers
 *         `observed` from real folded records — including the end-to-end path
 *         from a gateway-shaped `agent:anima:subagent:janus` session key through
 *         `dispatchGenealogyFromSessions`, so the claim covers the producer the
 *         panes actually mount, not a hand-built record.
 *
 *     (d) THE ROSTERS AGREE. The dispatch-target roster
 *         (`omnipanelCapabilities.ts`), the fold's recognition set, and this
 *         register name the same six.
 * Does NOT own: the substrate contract, the dispatch tables, or any render
 *   (`AletheiaSubagentTrace.test.tsx`, `VetoBanner.test.tsx`).
 * Contract: [[DR-M5-1]] · 12.T12.19 · rerun tranche [[26.T26.9]].
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
    ALETHEIA_ABSENT_FEED_SEAMS,
    ALETHEIA_FACET_CONTRACT_SOURCE,
    ALETHEIA_SUBAGENT_IDS,
    ALETHEIA_SUBAGENT_TRACES,
    ALETHEIA_SURFACING_SEAMS,
    ALETHEIA_VETO_BLOCKS_HUMAN_GATE,
    JANUS_CANVAS_SPEC_SOURCE,
    aletheiaLineageFromGenealogy,
    aletheiaSubagentTrace,
    aletheiaSurfacingSeam,
    vetoBannerText
} from './aletheiaSubagents';
import { dispatchGenealogyFromSessions } from './dispatchGenealogyFromSessions';
import { ALETHEIA_TECHNE_GUARDIANS } from './omnipanelCapabilities';
import type { DispatchGenealogyRecord } from './dispatchGenealogy';
import type { SessionRecord } from '../../bridge/sessionClient';

const REPO_ROOT = resolve(__dirname, '../../../../../..');

/** The 12.19 contract module — the declaration this register is measured by. */
const FACET_CONTRACT = readFileSync(join(REPO_ROOT, ALETHEIA_FACET_CONTRACT_SOURCE), 'utf8');

/** Executable substrate. A name in prose is a claim; a name in code is an arm. */
const CODE_FILE = /\.(rs|ts|tsx|mjs|js|py)$/;

/**
 * Every place the stack turns a method NAME into a call — the same union
 * `atelierSeams.test.ts` holds its claims against (Track 53 moved the handlers
 * to their coordinates, so "is it dispatched?" is the union of the S-root port
 * tables plus the S0 gate host's own match block).
 */
const DISPATCH_SOURCES: readonly string[] = Object.freeze([
    'Body/S/S0/epi-cli/src/gate/server/dispatch.rs',
    'Body/S/S1/hen-compiler-core/src/s1_handlers.rs',
    'Body/S/S2/graph-services/src/s2_handlers.rs',
    'Body/S/S3/gateway/src/s3_handlers.rs',
    'Body/S/S5/epii-review-core/src/s5_handlers.rs'
]);

/**
 * `git grep -l` over the real substrate. The FROZEN `Body/M/epi-theia` tree is
 * out of scope everywhere in this suite — it is dead plumbing, and a name that
 * survives only there proves nothing about the wire.
 */
function substrateFilesMentioning(needle: string): readonly string[] {
    try {
        const out = execFileSync(
            'git',
            ['grep', '-l', '--fixed-strings', needle, '--', 'Body/S'],
            { cwd: REPO_ROOT, encoding: 'utf8' }
        );
        return out.trim().length === 0 ? [] : out.trim().split('\n');
    } catch {
        // `git grep` exits 1 on no match.
        return [];
    }
}

function record(over: Partial<DispatchGenealogyRecord> & { id: string }): DispatchGenealogyRecord {
    return {
        parentId: null,
        actor: { actor: 'anima', role: 'anima' },
        route: { method: "s4'.mediation.route", capability: null },
        status: 'succeeded',
        startedAtMs: 0,
        endedAtMs: 1,
        gate: { capability: null, allowed: true },
        evidenceRef: null,
        sourceRef: null,
        ...over
    };
}

describe('(a) the register is the substrate contract, not a carrier opinion', () => {
    it('names exactly the six FacetId variants the contract declares', () => {
        const declared = [...FACET_CONTRACT.matchAll(/Self::(\w+) => "(\w+)",/g)]
            .filter(match => /^[A-Z]/.test(match[1]) && match[1] === match[2])
            .map(match => match[2].toLowerCase());
        // `label()` returns the capitalised variant name for each of the six.
        expect(new Set(declared)).toEqual(new Set(ALETHEIA_SUBAGENT_IDS));
        expect(ALETHEIA_SUBAGENT_TRACES).toHaveLength(6);
    });

    it('binds each subagent to the CF the contract`s cf_label() gives it', () => {
        const cfArms = new Map(
            [...FACET_CONTRACT.matchAll(/Self::(\w+) => "(CF\d)",/g)].map(match => [
                match[1].toLowerCase(),
                match[2]
            ])
        );
        expect(cfArms.size).toBe(6);
        for (const trace of ALETHEIA_SUBAGENT_TRACES) {
            expect(cfArms.get(trace.id)).toBe(trace.cf);
        }
    });

    it('carries a label matching the contract`s label() arm for each id', () => {
        // Read the `label()` body specifically — `cf_label()` matches the same
        // arm shape and would silently satisfy a looser regex with "CF0".
        const labelBody = /fn label\(&self\) -> &'static str \{[\s\S]*?\n    \}/.exec(
            FACET_CONTRACT
        );
        expect(labelBody).not.toBeNull();
        const labelArms = new Map(
            [...labelBody![0].matchAll(/Self::(\w+) => "(\w+)",/g)].map(match => [
                match[1].toLowerCase(),
                match[2]
            ])
        );
        expect(labelArms.size).toBe(6);
        for (const trace of ALETHEIA_SUBAGENT_TRACES) {
            expect(labelArms.get(trace.id)).toBe(trace.label);
        }
    });

    it('gives each subagent a DISTINCT trace kind — six angles, not six labels', () => {
        const kinds = ALETHEIA_SUBAGENT_TRACES.map(trace => trace.traceKind);
        expect(new Set(kinds).size).toBe(6);
        for (const kind of kinds) {
            expect(kind.length).toBeGreaterThan(20);
        }
    });

    it("routes the Janus trace to the M4' canvas spec the tranche names, and that spec really carries §4", () => {
        const janus = aletheiaSubagentTrace('janus');
        expect(janus.canonRef).toContain(JANUS_CANVAS_SPEC_SOURCE);
        const spec = join(REPO_ROOT, JANUS_CANVAS_SPEC_SOURCE);
        expect(existsSync(spec)).toBe(true);
        const body = readFileSync(spec, 'utf8');
        expect(body).toContain('## 4. Janus Operating the Klein');
        expect(body).toContain('janus_evaluate_aliveness');
        expect(body).toContain('klein_weighting');
    });

    it('refuses an id that is not one of the six', () => {
        expect(() => aletheiaSubagentTrace('techne' as never)).toThrow(/unknown Aletheia subagent/);
        expect(() => aletheiaSurfacingSeam('nope')).toThrow(/unknown Aletheia surfacing seam/);
    });
});

describe('(b) the surfacing seams are honest in both directions', () => {
    it('declares the facet-return feed ABSENT exactly while no Body/S CODE produces one', () => {
        // A prose mention is not a producer. The orchestration SKILL.md carries
        // the 12.19 §5.5 contract text and must not be read as an arm.
        const producers = substrateFilesMentioning('FacetReturn').filter(
            path => path !== ALETHEIA_FACET_CONTRACT_SOURCE && CODE_FILE.test(path)
        );
        const vetoFieldNames = [
            ...substrateFilesMentioning('vetoReason'),
            ...substrateFilesMentioning('veto_reason')
        ].filter(path => CODE_FILE.test(path));
        const reallyAvailable = producers.length > 0 || vetoFieldNames.length > 0;
        expect(aletheiaSurfacingSeam('facet-return-feed').available).toBe(reallyAvailable);
        // The current, disclosed state — stated so the flip is visible in the
        // diff the day a producer lands rather than buried in a boolean.
        expect(producers).toEqual([]);
        expect(vetoFieldNames).toEqual([]);
    });

    it('the 12.19 orchestration contract exists in prose while its code producer does not', () => {
        // The gap is precisely here: the protocol is WRITTEN (12.19 §5.5 asked
        // for the orchestration contract update and it landed) and the type is
        // declared, but nothing between them emits a return.
        expect(substrateFilesMentioning('FacetReturn')).toContain(
            'Body/S/S5/plugins/epi-logos/skills/aletheia-orchestration/SKILL.md'
        );
    });

    it('declares the veto log ABSENT exactly while the reducer has no non-test caller', () => {
        const callers = substrateFilesMentioning('publish_aletheia_veto');
        const known = new Set([
            'Body/S/S3/epi-spacetime-module/src/lib.rs',
            'Body/S/S3/gateway/src/spacetime/presence.rs',
            'Body/S/S3/gateway/tests/aletheia_veto_contract.rs'
        ]);
        const unexpected = callers.filter(path => !known.has(path));
        expect(aletheiaSurfacingSeam('veto-log-persistence').available).toBe(
            unexpected.length > 0
        );
        expect(unexpected).toEqual([]);
        // The reducer + its client really do exist — the gap is the CALLER, not
        // the capability, and a seam that mis-states which would be useless.
        expect(callers).toContain('Body/S/S3/epi-spacetime-module/src/lib.rs');
        expect(callers).toContain('Body/S/S3/gateway/src/spacetime/presence.rs');
    });

    it('declares the crystallisation intent ABSENT exactly while the field name is nowhere in Body/S', () => {
        const mentions = [
            ...substrateFilesMentioning('crystallisationIntent'),
            ...substrateFilesMentioning('crystallisation_intent')
        ];
        expect(aletheiaSurfacingSeam('crystallisation-intent').available).toBe(mentions.length > 0);
        expect(mentions).toEqual([]);
    });

    it('keeps every unavailable seam explaining itself and every seam naming its contract', () => {
        expect(ALETHEIA_ABSENT_FEED_SEAMS.length).toBe(ALETHEIA_SURFACING_SEAMS.length);
        for (const seam of ALETHEIA_SURFACING_SEAMS) {
            expect(seam.contract.length).toBeGreaterThan(0);
            expect(seam.reason.length).toBeGreaterThan(40);
            expect(seam.deliverable).toContain('26.9');
        }
    });

    it('states the invocation NEGATIVE: an aletheia_* name is a TOOL, never a dispatch arm', () => {
        const seam = aletheiaSurfacingSeam('aletheia-tool-invocation');
        expect(seam.available).toBe(false);
        expect(seam.reason).toContain("s4'.mediation.route");
        // Both halves matter. The names DO live in the S4 agent-tool registry —
        // that is what makes them reachable by Anima at all — and they appear in
        // NO gateway dispatch table, which is what makes them unreachable from a
        // pane. A test asserting only the second half would pass just as well if
        // the tools had been deleted.
        expect(substrateFilesMentioning('aletheia_crystallise')).toContain(
            "Body/S/S4/ta-onta/S4-5p-aletheia/S5'/tools/seed-tools.ts"
        );
        const dispatchBodies = DISPATCH_SOURCES.map(relative =>
            readFileSync(join(REPO_ROOT, relative), 'utf8')
        );
        for (const tool of [
            'aletheia_crystallise',
            'aletheia_gnosis_query',
            'aletheia_thought_route'
        ]) {
            for (const body of dispatchBodies) {
                expect(body).not.toContain(tool);
            }
        }
    });
});

describe('(c) the lineage projection reads the live fold, not the register', () => {
    it('reports every subagent unobserved when the genealogy carries none', () => {
        const lineage = aletheiaLineageFromGenealogy([]);
        expect(lineage).toHaveLength(6);
        expect(lineage.every(row => row.observed === false)).toBe(true);
        expect(lineage.every(row => row.dispatchCount === 0)).toBe(true);
    });

    it('marks ONLY the subagents the records really carry, and counts them', () => {
        const lineage = aletheiaLineageFromGenealogy([
            record({ id: 'n1', aletheiaSubagent: 'anansi' }),
            record({ id: 'n2', aletheiaSubagent: 'anansi' }),
            record({ id: 'n3', aletheiaSubagent: 'zeithoven' })
        ]);
        const byId = new Map(lineage.map(row => [row.trace.id, row]));
        expect(byId.get('anansi')!.dispatchCount).toBe(2);
        expect(byId.get('zeithoven')!.observed).toBe(true);
        expect(byId.get('janus')!.observed).toBe(false);
        expect(byId.get('moirai')!.dispatchCount).toBe(0);
    });

    it('attaches a veto to the facet that cast it, and to no other', () => {
        const lineage = aletheiaLineageFromGenealogy([
            record({
                id: 'n1',
                aletheiaSubagent: 'janus',
                aletheiaFacetReturn: {
                    kind: 'veto',
                    facet: 'janus',
                    reason: 'the retrospective face is ignored',
                    whatIsMissed: 'what has gathered'
                }
            }),
            record({
                id: 'n2',
                aletheiaSubagent: 'agora',
                aletheiaFacetReturn: {
                    kind: 'disclosure',
                    facet: 'agora',
                    angle: 'the dispatchees converge',
                    evidenceRefs: []
                }
            })
        ]);
        const byId = new Map(lineage.map(row => [row.trace.id, row]));
        expect(byId.get('janus')!.vetoes).toEqual([
            {
                nodeId: 'n1',
                facet: 'janus',
                reason: 'the retrospective face is ignored',
                whatIsMissed: 'what has gathered'
            }
        ]);
        // A disclosure is not a veto — the ordinary return must not colour the
        // trail red (12.19 §5.5).
        expect(byId.get('agora')!.observed).toBe(true);
        expect(byId.get('agora')!.vetoes).toEqual([]);
    });

    it('observes a subagent through the REAL session fold, from a gateway-shaped key', () => {
        const sessions: SessionRecord[] = [
            { sessionKey: 'agent:anima', spawnedBy: null } as unknown as SessionRecord,
            {
                sessionKey: 'agent:anima:subagent:janus',
                spawnedBy: 'agent:anima'
            } as unknown as SessionRecord
        ];
        const lineage = aletheiaLineageFromGenealogy(dispatchGenealogyFromSessions(sessions));
        const byId = new Map(lineage.map(row => [row.trace.id, row]));
        expect(byId.get('janus')!.observed).toBe(true);
        expect(byId.get('janus')!.dispatchCount).toBe(1);
        expect(byId.get('anansi')!.observed).toBe(false);
    });

    it('refuses to mint an anonymous veto: a non-subagent session with a veto field yields none', () => {
        const sessions: SessionRecord[] = [
            {
                sessionKey: 'agent:anima',
                spawnedBy: null,
                vetoReason: 'stray field'
            } as unknown as SessionRecord
        ];
        const records = dispatchGenealogyFromSessions(sessions);
        expect(records[0].aletheiaFacetReturn).toBeUndefined();
    });
});

describe('(d) one roster, one veto law', () => {
    it('agrees with the dispatch-target guardian roster', () => {
        expect(new Set(ALETHEIA_TECHNE_GUARDIANS)).toEqual(new Set(ALETHEIA_SUBAGENT_IDS));
    });

    it('pins the veto NON-BLOCKING on the human gate (12.19)', () => {
        expect(ALETHEIA_VETO_BLOCKS_HUMAN_GATE).toBe(false);
    });

    it("renders 26.9's verbatim banner line from the facet id", () => {
        expect(vetoBannerText('moirai', 'cast anchor is stale')).toBe(
            'Aletheia subagent Moirai veto — cast anchor is stale'
        );
    });
});
