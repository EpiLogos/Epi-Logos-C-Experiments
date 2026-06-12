/**
 * m_canonical.h — L2' Canonical Element-ID Harmonisation (cross-M-stack)
 *
 * THE element-bearing lens is L2' (Idea/Bimba/World/L2'.md). Its six inner
 * positions define the ONE authoritative element ordering for the entire
 * Epi-Logos system:
 *
 *   0 = AETHER  (L2-0' — Quintessence / Prima Materia)
 *   1 = EARTH   (L2-1' — Nigredo / Fixed Principle)
 *   2 = WATER   (L2-2' — Solutio / Dissolving)
 *   3 = AIR     (L2-3' — Sublimatio / Volatile)
 *   4 = FIRE    (L2-4' — Calcinatio / Transformative Heat)
 *   5 = SALT    (L2-5' — Sal / Diamond Body)  [Tria Prima body-principle]
 *
 * Indices 1-4 (EARTH, WATER, AIR, FIRE) are the operative quartet — the four
 * classical elements that participate in elemental balance / nucleotide work.
 * AETHER (0) is the pre-elemental ground; SALT (5) is the crystallised return.
 *
 * Historically four distinct legacy orderings accreted across the stack:
 *
 *   - m4.h legacy:        WATER=0, FIRE=1, EARTH=2, AIR=3        (nucleotide order)
 *   - medicine.rs legacy: AKASHA=0, AIR=1, FIRE=2, WATER=3, EARTH=4
 *                         (== m2.h Element_Id; emitted by the kairos python adapter)
 *   - m2-3 Bimba branch:  0=Aether, 1=Fire, 2=Earth, 3=Air, 4=Water, 5=Salt
 *                         (the #2-3-{1..4} triplicity coordinate convention)
 *   - nucleotide:         A, T, C, G  (M3_NUC_*) → element via the throughline
 *
 * This header is the single point of truth that reconciles every one of them
 * to the L2' canonical ordering. Conversions are pure, total mappings; values
 * with no counterpart in a target ordering return M_CANONICAL_ELEMENT_INVALID.
 *
 * Task: 05.T5.16 — L2' canonical element-ID harmonisation across M-stack.
 */

#ifndef M_CANONICAL_H
#define M_CANONICAL_H

#include <stdint.h>
#include <stdbool.h>

/* ===================================================================
 * THE CANONICAL ELEMENT IDS — L2' inner-position ordering
 * =================================================================== */

typedef enum {
    ELEMENT_AETHER = 0,  /* L2-0' — Quintessence / Prima Materia */
    ELEMENT_EARTH  = 1,  /* L2-1' — Nigredo / Fixed Principle    */
    ELEMENT_WATER  = 2,  /* L2-2' — Solutio / Dissolving         */
    ELEMENT_AIR    = 3,  /* L2-3' — Sublimatio / Volatile        */
    ELEMENT_FIRE   = 4,  /* L2-4' — Calcinatio / Transformative  */
    ELEMENT_SALT   = 5   /* L2-5' — Sal / Diamond Body           */
} Canonical_Element;

#define M_CANONICAL_ELEMENT_COUNT   6u

/* Sentinel returned when a value has no counterpart in the target ordering. */
#define M_CANONICAL_ELEMENT_INVALID 0xFFu

/* The operative quartet = bits 1-4 set (EARTH, WATER, AIR, FIRE).
 *   bit ELEMENT_EARTH(1) | ELEMENT_WATER(2) | ELEMENT_AIR(3) | ELEMENT_FIRE(4)
 *   = 0b00011110 = 0x1E. AETHER(0) and SALT(5) are NOT operative. */
#define OPERATIVE_QUARTET_MASK 0x1Eu

/* True when `elem` is one of the four operative classical elements. */
static inline bool m_canonical_is_operative(uint8_t elem) {
    return elem < 8u && ((OPERATIVE_QUARTET_MASK >> elem) & 1u) != 0u;
}

/* ===================================================================
 * NUCLEOTIDE → CANONICAL ELEMENT (the Elemental Throughline)
 *
 * A=Water, T=Fire, C=Earth, G=Air. Nucleotide arg uses M3_NUC_* values
 * (A=0, T=1, C=2, G=3). Implemented as a function-like macro so it yields
 * an integer constant expression — usable inside _Static_assert in m4.h.
 * =================================================================== */

#define m4_nuc_to_elem(nuc) \
    ((nuc) == 0u ? (uint8_t)ELEMENT_WATER : \
     (nuc) == 1u ? (uint8_t)ELEMENT_FIRE  : \
     (nuc) == 2u ? (uint8_t)ELEMENT_EARTH : \
     (nuc) == 3u ? (uint8_t)ELEMENT_AIR   : \
                   (uint8_t)M_CANONICAL_ELEMENT_INVALID)

/* ===================================================================
 * m4.h LEGACY ORDERING  ⇄  CANONICAL
 *   legacy: WATER=0, FIRE=1, EARTH=2, AIR=3
 * =================================================================== */

static inline uint8_t m_canonical_from_m4_h_legacy(uint8_t legacy) {
    switch (legacy) {
        case 0u: return (uint8_t)ELEMENT_WATER;  /* legacy WATER */
        case 1u: return (uint8_t)ELEMENT_FIRE;   /* legacy FIRE  */
        case 2u: return (uint8_t)ELEMENT_EARTH;  /* legacy EARTH */
        case 3u: return (uint8_t)ELEMENT_AIR;    /* legacy AIR   */
        default: return (uint8_t)M_CANONICAL_ELEMENT_INVALID;
    }
}

static inline uint8_t m_canonical_to_m4_h_legacy(uint8_t canonical) {
    switch (canonical) {
        case ELEMENT_WATER: return 0u;
        case ELEMENT_FIRE:  return 1u;
        case ELEMENT_EARTH: return 2u;
        case ELEMENT_AIR:   return 3u;
        default:            return (uint8_t)M_CANONICAL_ELEMENT_INVALID; /* AETHER/SALT */
    }
}

/* ===================================================================
 * medicine.rs LEGACY ORDERING  ⇄  CANONICAL
 *   legacy (== m2.h Element_Id): AKASHA=0, AIR=1, FIRE=2, WATER=3, EARTH=4
 *   (this is the ordering the kairos python adapter emits)
 * =================================================================== */

static inline uint8_t m_canonical_from_medicine_rs_legacy(uint8_t legacy) {
    switch (legacy) {
        case 0u: return (uint8_t)ELEMENT_AETHER; /* AKASHA */
        case 1u: return (uint8_t)ELEMENT_AIR;    /* VAYU   */
        case 2u: return (uint8_t)ELEMENT_FIRE;   /* AGNI   */
        case 3u: return (uint8_t)ELEMENT_WATER;  /* APAS   */
        case 4u: return (uint8_t)ELEMENT_EARTH;  /* PRITHVI */
        default: return (uint8_t)M_CANONICAL_ELEMENT_INVALID;
    }
}

static inline uint8_t m_canonical_to_medicine_rs_legacy(uint8_t canonical) {
    switch (canonical) {
        case ELEMENT_AETHER: return 0u; /* AKASHA */
        case ELEMENT_AIR:    return 1u; /* VAYU   */
        case ELEMENT_FIRE:   return 2u; /* AGNI   */
        case ELEMENT_WATER:  return 3u; /* APAS   */
        case ELEMENT_EARTH:  return 4u; /* PRITHVI */
        default:             return (uint8_t)M_CANONICAL_ELEMENT_INVALID; /* SALT */
    }
}

/* ===================================================================
 * M2-3 BIMBA BRANCH ORDERING  ⇄  CANONICAL
 *   branch: 0=Aether, 1=Fire, 2=Earth, 3=Air, 4=Water, 5=Salt
 *   (the #2-3-{1..4} triplicity coordinate convention — full bijection)
 *
 * NOTE: this maps the *element semantics* of the branch convention; the
 * #2-3-N coordinate strings themselves are graph addresses and are never
 * rewritten by element migration.
 * =================================================================== */

static inline uint8_t m_canonical_from_m2_3_branch(uint8_t branch) {
    switch (branch) {
        case 0u: return (uint8_t)ELEMENT_AETHER;
        case 1u: return (uint8_t)ELEMENT_FIRE;
        case 2u: return (uint8_t)ELEMENT_EARTH;
        case 3u: return (uint8_t)ELEMENT_AIR;
        case 4u: return (uint8_t)ELEMENT_WATER;
        case 5u: return (uint8_t)ELEMENT_SALT;
        default: return (uint8_t)M_CANONICAL_ELEMENT_INVALID;
    }
}

static inline uint8_t m_canonical_to_m2_3_branch(uint8_t canonical) {
    switch (canonical) {
        case ELEMENT_AETHER: return 0u;
        case ELEMENT_FIRE:   return 1u;
        case ELEMENT_EARTH:  return 2u;
        case ELEMENT_AIR:    return 3u;
        case ELEMENT_WATER:  return 4u;
        case ELEMENT_SALT:   return 5u;
        default:             return (uint8_t)M_CANONICAL_ELEMENT_INVALID;
    }
}

#endif /* M_CANONICAL_H */
