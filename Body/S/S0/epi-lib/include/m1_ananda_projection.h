/*
 * m1_ananda_projection.h — typed M1-2 Ananda source projection
 *
 * Wayfinder: Epi-Logos-C-Experiments #32, W1
 * Authority: M1-2-ANANDA-VORTEX-ARCHITECTURE.md + canonical Vortex Modulae CSV.
 *
 * This module sits beside the legacy m1_ananda_get()/m1_ananda_dr_get() API.
 * It keeps the canonical raw 12x12 arithmetic, true DR12 residue and legacy
 * decimal/mod-10 aperture as different mathematical registers.
 */

#ifndef M1_ANANDA_PROJECTION_H
#define M1_ANANDA_PROJECTION_H

#include "m1.h"
#include <stdbool.h>
#include <stdint.h>

#define M1_ANANDA_SOURCE_REF \
    "Idea/Bimba/Map/datasets/(0_1) Vortex Modulae - (0_1) x 12Fold and 8_9fold (mod12 and mod10) Archetypal Number Identities - Sheet1.csv"
#define M1_ANANDA_DERIVATION_REF \
    "Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-EXECUTABLE-SUBSTRATE-CONTRACT.md"

typedef enum {
    M1_ANANDA_DIRECT_PHASE = 0,
    M1_ANANDA_PRIME_PHASE  = 1,
} M1_Ananda_Direct_Prime_Phase;

/*
 * The oscillatory address is supplied by the canonical Spanda/ring state.
 * This module deliberately does not infer the 12-walk ordering from tick12:
 * the active phase, position and conjugate co-state remain first-class input.
 */
typedef struct {
    uint8_t tick12;
    uint8_t position6;
    uint8_t conjugate_position6;
    M1_Ananda_Direct_Prime_Phase phase;
    Spanda_Stage spanda_stage;
} M1_Ananda_Oscillatory_Address;

/*
 * Canonical sixth-family source tuple is {-1, bimba, sum}.  The richer
 * contributor record is retained so no consumer has to reconstruct the
 * source relation from a reduced scalar.
 */
typedef struct {
    int16_t bimba_raw;
    int16_t pratibimba_raw;
    int16_t sum_raw;
    int16_t difference_a_raw;
    int16_t difference_b_raw;

    uint8_t bimba_dr;
    uint8_t pratibimba_dr;
    uint8_t sum_dr;
    uint8_t difference_a_dr;
    uint8_t difference_b_dr;

    bool decimal10_valid;
    uint8_t bimba_decimal10;
    uint8_t pratibimba_decimal10;
    uint8_t sum_decimal10;
    uint8_t difference_a_decimal10;
    uint8_t difference_b_decimal10;
} M1_Ananda_Quintessence_Projection;

typedef struct {
    Ananda_Matrix_Op family;
    uint8_t row12;
    uint8_t col12;

    /* Ordinary families 0..4 have one scalar source value. */
    bool scalar_valid;
    int16_t raw12_value;
    uint8_t digit_root12_value;

    /* Only rows/cols 0..9 belong to the legacy decimal aperture. */
    bool decimal10_valid;
    uint8_t decimal10_value;

    /* Family 5 is rule/tuple-bearing; scalar_valid is false. */
    M1_Ananda_Quintessence_Projection quintessence;

    M1_Ananda_Oscillatory_Address oscillatory;
    const char* source_ref;
    const char* derivation_ref;
} M1_Ananda_Cell_Projection;

/* True recursive digit root for the non-negative raw source register. */
uint8_t m1_ananda_true_digit_root(uint16_t value);

/* Normalised decimal/mod-10 aperture, including signed source values. */
uint8_t m1_ananda_decimal_mod10(int16_t value);

/*
 * Project one canonical 12x12 source cell into its typed runtime views.
 * Returns 1 on success, 0 for invalid family/address/state.
 */
int m1_ananda_project_cell(
        Ananda_Matrix_Op family,
        uint8_t row12,
        uint8_t col12,
        const M1_Ananda_Oscillatory_Address* oscillatory,
        M1_Ananda_Cell_Projection* out);

/*
 * Exhaustive 12x12 parity check between exact source formulae and the
 * existing nibble-packed DR LUTs / implicit difference faces.
 */
int m1_ananda_verify_dr12_luts(void);

#endif /* M1_ANANDA_PROJECTION_H */
