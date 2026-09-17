/**
 * Coordinate: M' M2' (element-register canon ↔ code contract — DR-L2-ELEM-2)
 * Actualises: the guarantee that the code mirror does not drift from canon. The
 *   registers and their correspondences are DECLARED at
 *   `Idea/Bimba/Map/datasets/m2-element-registers.json` — with each pairing's
 *   tradition, provenance and partiality — and this file proves the runtime
 *   agrees with that declaration, member for member and pair for pair.
 *
 * The point is direction of authority. Without this test the JSON is a decorative
 * document beside the real table; with it, canon is the source and the code is
 * the mirror, and any edit to either that is not matched by the other fails.
 */

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
    ALCHEMICAL_ELEMENT_NAMES,
    AlchemicalElement,
    alchemicalFromMahabhuta,
    alchemicalFromTriplicityBranch,
    asMahabhuta,
    asTriplicityBranch,
    isOperativeElement,
    MAHABHUTA_NAMES,
    MAHABHUTA_TATTVA_BASE,
    mahabhutaFromAlchemical,
    triplicityBranchOfSign,
    type Alchemical
} from './elementRegisters';

interface Member {
    readonly id: number;
    readonly name: string;
    readonly tattva?: number;
    readonly operative?: boolean;
    readonly signs?: readonly number[];
}
interface Register {
    readonly id: string;
    readonly coordinate: string;
    readonly cardinality: number;
    readonly members: readonly Member[];
}
interface Correspondence {
    readonly id: string;
    readonly from: string;
    readonly to: string;
    readonly pairs: readonly { readonly from: number; readonly to: number }[];
    readonly partial: { readonly unmapped: readonly Member[]; readonly why: string } | null;
}
interface Canon {
    readonly decision: string;
    readonly wireEncoding: { readonly register: string };
    readonly registers: readonly Register[];
    readonly correspondences: readonly Correspondence[];
    readonly bodyOntologies: readonly { readonly id: string; readonly owner: string }[];
}

const CANON_PATH = resolve(
    dirname(fileURLToPath(import.meta.url)),
    '../../../../../Idea/Bimba/Map/datasets/m2-element-registers.json'
);

const canon: Canon = JSON.parse(readFileSync(CANON_PATH, 'utf8'));

const registerById = (id: string): Register => {
    const found = canon.registers.find(r => r.id === id);
    if (!found) throw new Error(`canon declares no register ${id}`);
    return found;
};
const correspondenceById = (id: string): Correspondence => {
    const found = canon.correspondences.find(c => c.id === id);
    if (!found) throw new Error(`canon declares no correspondence ${id}`);
    return found;
};

describe('the canon declaration is reachable and well-formed', () => {
    it('is the DR-L2-ELEM-2 declaration and names the wire encoding', () => {
        expect(canon.decision).toBe('DR-L2-ELEM-2');
        expect(canon.wireEncoding.register).toBe('m2-1-alchemical');
    });

    it('declares each register at its own cardinality', () => {
        for (const register of canon.registers) {
            expect(register.members).toHaveLength(register.cardinality);
            const ids = register.members.map(m => m.id);
            expect(new Set(ids).size).toBe(ids.length);
        }
    });

    it('keeps the two body ontologies distinct and attributed', () => {
        const owners = canon.bodyOntologies.map(b => b.owner);
        expect(canon.bodyOntologies.map(b => b.id)).toEqual(['yogic-body', 'hermetic-body']);
        expect(owners[0]).toContain('M2-2');
        expect(owners[1]).toContain('M2-3');
    });
});

describe('the code mirrors the declared registers', () => {
    it('matches [[M2-2]] Mahabhuta member-for-member, tattva base included', () => {
        const register = registerById('m2-2-mahabhuta');
        expect(register.coordinate).toBe('#2-2');
        expect(MAHABHUTA_NAMES).toEqual(register.members.map(m => m.name));
        for (const member of register.members) {
            expect(member.tattva).toBe(MAHABHUTA_TATTVA_BASE + member.id);
        }
    });

    it('matches [[M2-1]] alchemical member-for-member, including which are operative', () => {
        const register = registerById('m2-1-alchemical');
        expect(register.coordinate).toBe('#2-1');
        expect(ALCHEMICAL_ELEMENT_NAMES).toEqual(register.members.map(m => m.name));
        for (const member of register.members) {
            expect(isOperativeElement(member.id as Alchemical)).toBe(member.operative);
        }
        expect(register.members[AlchemicalElement.SALT].name).toBe('Salt');
    });

    it('matches [[M2-3]] triplicity — every declared sign lands on its branch', () => {
        const register = registerById('m2-3-triplicity-branch');
        expect(register.coordinate).toBe('#2-3');
        for (const member of register.members) {
            for (const sign of member.signs ?? []) {
                expect(triplicityBranchOfSign(sign)).toBe(member.id);
            }
        }
        // Every sign is claimed by exactly one declared triplicity.
        const claimed = register.members.flatMap(m => m.signs ?? []);
        expect(new Set(claimed).size).toBe(12);
    });
});

describe('the code mirrors the declared correspondences', () => {
    it('maps Mahabhuta -> alchemical exactly as canon pairs them', () => {
        const correspondence = correspondenceById('mahabhuta-to-alchemical');
        expect(correspondence.pairs).toHaveLength(5);
        for (const pair of correspondence.pairs) {
            const from = asMahabhuta(pair.from);
            expect(from).not.toBeNull();
            expect(alchemicalFromMahabhuta(from!)).toBe(pair.to);
        }
    });

    it('honours the declared partiality — Salt has no counterpart, and canon says why', () => {
        const correspondence = correspondenceById('mahabhuta-to-alchemical');
        expect(correspondence.partial).not.toBeNull();
        expect(correspondence.partial!.why).toMatch(/Tria Prima|different system/i);
        for (const unmapped of correspondence.partial!.unmapped) {
            expect(mahabhutaFromAlchemical(unmapped.id as Alchemical)).toBeNull();
        }
        // …and everything canon does NOT declare unmapped must map.
        const unmappedIds = new Set(correspondence.partial!.unmapped.map(m => m.id));
        for (const member of registerById('m2-1-alchemical').members) {
            if (unmappedIds.has(member.id)) continue;
            expect(mahabhutaFromAlchemical(member.id as Alchemical)).not.toBeNull();
        }
    });

    it('maps M2-3 branch -> alchemical exactly as canon pairs them, with no partiality', () => {
        const correspondence = correspondenceById('triplicity-branch-to-alchemical');
        expect(correspondence.partial).toBeNull();
        expect(correspondence.pairs).toHaveLength(6);
        for (const pair of correspondence.pairs) {
            const from = asTriplicityBranch(pair.from);
            expect(from).not.toBeNull();
            expect(alchemicalFromTriplicityBranch(from!)).toBe(pair.to);
        }
    });

    it('every correspondence names a real register on both ends', () => {
        for (const correspondence of canon.correspondences) {
            expect(() => registerById(correspondence.from)).not.toThrow();
            expect(() => registerById(correspondence.to)).not.toThrow();
        }
    });
});
