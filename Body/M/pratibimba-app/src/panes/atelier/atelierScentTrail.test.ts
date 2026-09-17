/**
 * Coordinate: M' M5-5' (Atelier surface-law tests — 28.T28.7)
 * Residency: Body/M/pratibimba-app/src/panes/atelier
 * Actualises: deliverables (c), (d) and (e) as behaviour rather than as prose —
 *   the `etymology://` namespace gate REFUSES a foreign scheme out loud, the
 *   Möbius envelope names Canon Studio and nothing else, and the Aletheia veto
 *   is pinned non-blocking. Plus the binding map: the psychoid stage is the one
 *   stage whose method the stack does not dispatch, and it carries a seam.
 */

import { describe, expect, it } from 'vitest';
import {
    admitProvenanceHandle,
    admitProvenanceHandles,
    ATELIER_LINEAGE_SUBAGENTS,
    ATELIER_MUTATES_GRAPH_CANON,
    ATELIER_STAGE_BINDINGS,
    ATELIER_VETO_BLOCKS_HUMAN_GATE,
    atelierStageBinding,
    MOBIUS_WRITE_BACK_TARGET,
    mobiusWriteBackIntent
} from './atelierScentTrail';
import { parseCrossLayoutIntent, intentTarget } from '../../commands/crossLayoutIntent';

describe('28.T28.7 (b) — the stage binding map is honest about the substrate', () => {
    it('binds all six stages, and marks exactly the psychoid one undispatched', () => {
        expect(ATELIER_STAGE_BINDINGS.map(binding => binding.stage.id)).toEqual([
            'root',
            'cognate',
            'drift',
            'psychoid',
            'pros-hen',
            'mobius-write-back'
        ]);
        const blocked = ATELIER_STAGE_BINDINGS.filter(binding => !binding.dispatched);
        expect(blocked.map(binding => binding.stage.id)).toEqual(['psychoid']);
        // A blocked stage without a disclosure is exactly the fiction the seam
        // register exists to stop.
        expect(blocked[0].seam).not.toBeNull();
        expect(blocked[0].seam!.name).toBe("s0'.anuttara.trace");
        expect(blocked[0].seam!.reason.length).toBeGreaterThan(120);
    });

    it('the local synthesis stage claims no binding key at all', () => {
        const prosHen = atelierStageBinding('pros-hen');
        expect(prosHen.bindingKey).toBeNull();
        // "local" is not "blocked": it is dispatched-by-nothing on purpose.
        expect(prosHen.dispatched).toBe(true);
        expect(prosHen.seam).toBeNull();
    });

    it('no stage binds an `aletheia_*` name (the ratified CORRECTION)', () => {
        for (const binding of ATELIER_STAGE_BINDINGS) {
            expect(binding.bindingKey ?? '').not.toContain('aletheia_');
        }
    });
});

describe('28.T28.7 (c) — etymology:// namespace integrity', () => {
    it('admits a well-formed etymology handle', () => {
        const verdict = admitProvenanceHandle('etymology://root/M5-5');
        expect(verdict.admitted).toBe(true);
        expect(verdict.scheme).toBe('etymology://');
        expect(verdict.reason).toBeNull();
    });

    it('refuses a foreign scheme OUT LOUD, naming the scheme it refused', () => {
        const verdict = admitProvenanceHandle('https://example.org/root');
        expect(verdict.admitted).toBe(false);
        expect(verdict.scheme).toBe('https://');
        expect(verdict.reason).toContain('https://');
        expect(verdict.reason).toContain('etymology://');
    });

    it('refuses a bare reference and an empty handle', () => {
        expect(admitProvenanceHandle('root/M5-5').admitted).toBe(false);
        expect(admitProvenanceHandle('root/M5-5').scheme).toBe('');
        expect(admitProvenanceHandle('etymology://').admitted).toBe(false);
        expect(admitProvenanceHandle('etymology://').reason).toContain('no reference');
    });

    it('returns a verdict PER handle — a refusal is never silently dropped', () => {
        const verdicts = admitProvenanceHandles([
            'etymology://root/M5-5',
            'graphiti://episode/42',
            'etymology://drift/logos'
        ]);
        expect(verdicts).toHaveLength(3);
        expect(verdicts.map(v => v.admitted)).toEqual([true, false, true]);
        expect(verdicts[1].scheme).toBe('graphiti://');
    });
});

describe('28.T28.7 (d) — Möbius write-back routes, never writes', () => {
    it('names Canon Studio as the receiver and pins mutatesGraphCanon false', () => {
        expect(ATELIER_MUTATES_GRAPH_CANON).toBe(false);
        expect(MOBIUS_WRITE_BACK_TARGET).toEqual({
            requestedExtensionId: 'ide-shell-m0-m5',
            requestedContributionId: 'canon-studio'
        });
    });

    it('builds a valid nine-field envelope the real dispatcher can resolve', () => {
        const intent = mobiusWriteBackIntent({
            artifactUri: 'Idea/Empty/Present/11-07-2026/entities/Logos.md',
            coordinate: 'M5-5',
            dayNow: '11-07-2026',
            sessionKey: 'sess-1',
            privacyClass: 'public'
        });
        // The strict parser is the contract; if the envelope is malformed the
        // write-back would throw at the user's gesture instead of here.
        expect(parseCrossLayoutIntent(intent)).toEqual(intent);
        expect(intent.reviewId).toBeNull();
        expect(intent.artifactUri).toBe('Idea/Empty/Present/11-07-2026/entities/Logos.md');
        // …and the target really resolves in the live ledger.
        const target = intentTarget(intent);
        expect(target).not.toBeNull();
        expect(target!.contributionId).toBe('canon-studio');
    });

    it('defaults every optional field to null rather than inventing context', () => {
        const intent = mobiusWriteBackIntent({ artifactUri: 'a.md' });
        expect(intent.coordinate).toBeNull();
        expect(intent.dayNow).toBeNull();
        expect(intent.sessionKey).toBeNull();
        expect(intent.profileGeneration).toBeNull();
        expect(intent.privacyClass).toBeNull();
    });
});

describe('28.T28.7 (e) — Aletheia lineage is evidence, and a veto is advisory', () => {
    it('carries the six subagents as lineage names', () => {
        expect(ATELIER_LINEAGE_SUBAGENTS).toEqual([
            'Anansi',
            'Janus',
            'Moirai',
            'Mercurius',
            'Agora',
            'Zeithoven'
        ]);
    });

    it('pins the veto NON-BLOCKING on the human gate (12.19)', () => {
        expect(ATELIER_VETO_BLOCKS_HUMAN_GATE).toBe(false);
    });
});
