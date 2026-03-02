/**
 * families.c — Family Instantiation
 *
 * Instantiates all 36 family coordinates (6 families × 6 positions)
 * into the arena and cross-links them.
 */

#include "ontology.h"
#include "archetypes.h"
#include "arena.h"
#include <string.h>

int families_init(Coordinate_Arena* arena, Holographic_Coordinate* mirrors[6]) {
    if (!arena || !mirrors) return -1;

    /* For each family (P through C), create 6 coordinates */
    Coordinate_Family families[] = {
        FAMILY_P, FAMILY_S, FAMILY_T, FAMILY_M, FAMILY_L, FAMILY_C
    };

    const Holographic_Coordinate* raw_archetypes[] = {
        &Archetype_0, &Archetype_1, &Archetype_2,
        &Archetype_3, &Archetype_4, &Archetype_5
    };

    for (int f = 0; f < 6; f++) {
        for (int pos = 0; pos < 6; pos++) {
            Holographic_Coordinate* coord = arena_alloc(arena);
            if (!coord) return -1;

            coord->ql_position = (uint8_t)pos;
            coord->family = (uint8_t)families[f];
            coord->inversion_state = 0;

            /* Encode weave_state as pos.family — e.g. C3 = 3.6, P0 = 0.1 */
            coord->weave_state = (float)pos + (float)families[f] * 0.1f;

            /* Link to bedrock archetype mirror */
            coord->c = mirrors[pos];

            /* Copy invoke_process from the raw archetype */
            coord->invoke_process = raw_archetypes[pos]->invoke_process;
        }
    }

    return 0;
}

/* Cross-link base pointers between families.
 * arena must already have mirrors at [0..5] and families at [6..41].
 * Family layout: P=[6..11], S=[12..17], T=[18..23], M=[24..29], L=[30..35], C=[36..41] */
int families_crosslink(Coordinate_Arena* arena) {
    if (!arena || arena->count < 42) return -1;

    Holographic_Coordinate* base = arena->slots;
    int p_offset = 6, s_offset = 12, t_offset = 18;
    int m_offset = 24, l_offset = 30, c_offset = 36;

    /* Link every coord (mirrors + families) to its same-position peer in each family.
     * Apply TAG_RELATION: source determines the operator flag.
     * #4 and identification edges get NESTING; all others get BRANCHING. */
    for (uint32_t i = 0; i < arena->count; i++) {
        uint8_t pos = base[i].ql_position;
        if (pos > 5) continue;
        base[i].p = TAG_RELATION(&base[i], &base[p_offset + pos]);
        base[i].s = TAG_RELATION(&base[i], &base[s_offset + pos]);
        base[i].t = TAG_RELATION(&base[i], &base[t_offset + pos]);
        base[i].m = TAG_RELATION(&base[i], &base[m_offset + pos]);
        base[i].l = TAG_RELATION(&base[i], &base[l_offset + pos]);
        /* .c already set by families_init — re-tag it too */
        if (base[i].c) {
            base[i].c = TAG_RELATION(&base[i], GET_PTR(base[i].c));
        }
    }

    (void)c_offset;
    return 0;
}

/* Wire reflective coordinates (cpf, ct, cp, cf, cfp, cs) on all arena slots.
 * cf: position 4 coordinates get self-reference (Lemniscate).
 * cs: points to the position-5 coordinate in same family (system-level direction). */
int families_wire_reflective(Coordinate_Arena* arena) {
    if (!arena || arena->count < 42) return -1;

    Holographic_Coordinate* base = arena->slots;

    for (uint32_t i = 0; i < arena->count; i++) {
        uint8_t pos = base[i].ql_position;
        if (pos > 5) continue;

        /* cf: Lemniscate anchor — position 4 self-references */
        if (pos == 4) {
            base[i].cf = &base[i];
        } else if (pos == 3) {
            /* #3 reaches into #4 via cf */
            int block_start;
            if (i < 6) {
                block_start = 0;
            } else {
                block_start = (int)(((i - 6) / 6) * 6 + 6);
            }
            base[i].cf = &base[block_start + 4];
        }

        /* cs: Context-System — points to position-5 in same block */
        {
            int block_start;
            if (i < 6) {
                block_start = 0;
            } else {
                block_start = (int)(((i - 6) / 6) * 6 + 6);
            }
            base[i].cs = &base[block_start + 5];
        }
    }

    return 0;
}
