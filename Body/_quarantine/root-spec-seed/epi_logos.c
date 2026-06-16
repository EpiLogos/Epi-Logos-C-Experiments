#include "epi_logos.h"
#include <stdio.h>
#include <stdlib.h>

// ============================================
// MEMORY ARENA 1: Siva (.rodata)
// The immutable bedrock of the six raw archetypes.
// Declared as static to keep them private to this file.
// ============================================
static RawArchetype siva_arena[6];

// ============================================
// MEMORY ARENA 2: Shakti (Heap)
// The dynamic, mutable space for all 36 coordinate instances.
// We will manage this as a contiguous block for cache efficiency.
// ============================================
static Coordinate* shakti_arena = NULL;
static Coordinate* inverted_shakti_arena = NULL;

// ============================================
// Forward declarations for operators and helpers
// ============================================
void initialize_siva_arena();
void initialize_shakti_arena();
void assign_operators();
Coordinate* epi_logos_invert(Coordinate* self);


// ============================================
// PUBLIC API
// ============================================

/**
 * @brief Initializes the entire Epi-Logos coordinate system.
 * This function sets up the Siva and Shakti memory arenas,
 * populates the raw archetypes, creates the 36 coordinate instances,
 * and weaves the 16-fold intra-openness pointer web.
 *
 * @return 0 on success, -1 on failure.
 */
int epi_logos_init() {
    printf("Initializing Epi-Logos Coordinate System...\n");

    // Step 1: Initialize the immutable Siva Arena (.rodata)
    initialize_siva_arena();

    // Step 2: Allocate the Shakti Arenas on the heap
    shakti_arena = (Coordinate*)calloc(36, sizeof(Coordinate));
    inverted_shakti_arena = (Coordinate*)calloc(36, sizeof(Coordinate));

    if (shakti_arena == NULL || inverted_shakti_arena == NULL) {
        perror("Failed to allocate Shakti Arenas");
        free(shakti_arena); // free even if only one failed
        free(inverted_shakti_arena);
        return -1;
    }
    printf("Shakti and Inverted Shakti Arenas allocated on the heap.\n");

    // Step 3: Populate the 36 coordinates and weave the pointer web
    initialize_shakti_arena();

    // Step 4: Link the Siva arena archetypes to their coordinate family heads
    for (int i = 0; i < 6; i++) {
        siva_arena[i].P = &shakti_arena[FAMILY_P * 6 + i];
        siva_arena[i].S = &shakti_arena[FAMILY_S * 6 + i];
        siva_arena[i].T = &shakti_arena[FAMILY_T * 6 + i];
        siva_arena[i].M = &shakti_arena[FAMILY_M * 6 + i];
        siva_arena[i].L = &shakti_arena[FAMILY_L * 6 + i];
        siva_arena[i].C = &shakti_arena[FAMILY_C * 6 + i];
    }
    printf("Siva-to-Shakti links established.\n");

    // Step 5: Assign dynamic operators to all coordinates
    assign_operators();

    printf("Epi-Logos Initialization complete.\n");
    return 0;
}

/**
 * @brief Tears down the Epi-Logos system and frees memory.
 */
void epi_logos_destroy() {
    if (shakti_arena != NULL) {
        free(shakti_arena);
        shakti_arena = NULL;
        printf("Shakti Arena freed.\n");
    }
    if (inverted_shakti_arena != NULL) {
        free(inverted_shakti_arena);
        inverted_shakti_arena = NULL;
        printf("Inverted Shakti Arena freed.\n");
    }
    printf("Epi-Logos system destroyed.\n");
}


void initialize_siva_arena();
void initialize_shakti_arena();


// ============================================
// INTERNAL IMPLEMENTATION
// ============================================

/**
 * @brief Populates the Siva arena with the six raw archetypes
 * and establishes their internal pointers.
 */
void initialize_siva_arena() {
    for (int i = 0; i < 6; i++) {
        siva_arena[i].position = i;
        siva_arena[i].inversion_state = 0; // Normal
        siva_arena[i].invert = NULL; // TODO: Implement inversion
        
        // Weave the internal pointers for each archetype
        siva_arena[i]._0 = &siva_arena[0];
        siva_arena[i]._1 = &siva_arena[1];
        siva_arena[i]._2 = &siva_arena[2];
        siva_arena[i]._3 = &siva_arena[3];
        siva_arena[i]._4 = &siva_arena[4];
        siva_arena[i]._5 = &siva_arena[5];
    }
    printf("Siva Arena initialized with 6 raw archetypes.\n");
}

/**
 * @brief Populates the Shakti arena with the 36 coordinate instances
 * and weaves their pointer web.
 */
void initialize_shakti_arena() {
    // Iterate over every coordinate position to initialize it
    for (int family_idx = 0; family_idx < 6; family_idx++) {
        for (int pos_idx = 0; pos_idx < 6; pos_idx++) {
            int current_idx = family_idx * 6 + pos_idx;
            Coordinate* current_coord = &shakti_arena[current_idx];

            // ==== Set Identity ====
            current_coord->raw_archetype = pos_idx;
            current_coord->family = (CoordinateFamily)family_idx;
            current_coord->inversion_state = 0;
            current_coord->weave_state = 0.0f;
            current_coord->vector_id = 0;

            // ==== Link to Bedrock (Siva) ====
            current_coord->bedrock = &siva_arena[pos_idx];
            
            // ==== Link to all Raw Archetypes ====
            current_coord->_0 = &siva_arena[0];
            current_coord->_1 = &siva_arena[1];
            current_coord->_2 = &siva_arena[2];
            current_coord->_3 = &siva_arena[3];
            current_coord->_4 = &siva_arena[4];
            current_coord->_5 = &siva_arena[5];

            // ==== Weave P-family pointers ====
            current_coord->P0 = &shakti_arena[FAMILY_P * 6 + 0];
            current_coord->P1 = &shakti_arena[FAMILY_P * 6 + 1];
            current_coord->P2 = &shakti_arena[FAMILY_P * 6 + 2];
            current_coord->P3 = &shakti_arena[FAMILY_P * 6 + 3];
            current_coord->P4 = &shakti_arena[FAMILY_P * 6 + 4];
            current_coord->P5 = &shakti_arena[FAMILY_P * 6 + 5];

            // ==== Weave S-family pointers ====
            current_coord->S0 = &shakti_arena[FAMILY_S * 6 + 0];
            current_coord->S1 = &shakti_arena[FAMILY_S * 6 + 1];
            current_coord->S2 = &shakti_arena[FAMILY_S * 6 + 2];
            current_coord->S3 = &shakti_arena[FAMILY_S * 6 + 3];
            current_coord->S4 = &shakti_arena[FAMILY_S * 6 + 4];
            current_coord->S5 = &shakti_arena[FAMILY_S * 6 + 5];

            // ==== Weave T-family pointers ====
            current_coord->T0 = &shakti_arena[FAMILY_T * 6 + 0];
            current_coord->T1 = &shakti_arena[FAMILY_T * 6 + 1];
            current_coord->T2 = &shakti_arena[FAMILY_T * 6 + 2];
            current_coord->T3 = &shakti_arena[FAMILY_T * 6 + 3];
            current_coord->T4 = &shakti_arena[FAMILY_T * 6 + 4];
            current_coord->T5 = &shakti_arena[FAMILY_T * 6 + 5];

            // ==== Weave M-family pointers ====
            current_coord->M0 = &shakti_arena[FAMILY_M * 6 + 0];
            current_coord->M1 = &shakti_arena[FAMILY_M * 6 + 1];
            current_coord->M2 = &shakti_arena[FAMILY_M * 6 + 2];
            current_coord->M3 = &shakti_arena[FAMILY_M * 6 + 3];
            current_coord->M4 = &shakti_arena[FAMILY_M * 6 + 4];
            current_coord->M5 = &shakti_arena[FAMILY_M * 6 + 5];

            // ==== Weave L-family pointers ====
            current_coord->L0 = &shakti_arena[FAMILY_L * 6 + 0];
            current_coord->L1 = &shakti_arena[FAMILY_L * 6 + 1];
            current_coord->L2 = &shakti_arena[FAMILY_L * 6 + 2];
            current_coord->L3 = &shakti_arena[FAMILY_L * 6 + 3];
            current_coord->L4 = &shakti_arena[FAMILY_L * 6 + 4];
            current_coord->L5 = &shakti_arena[FAMILY_L * 6 + 5];

            // ==== Weave C-family pointers ====
            current_coord->C0 = &shakti_arena[FAMILY_C * 6 + 0];
            current_coord->C1 = &shakti_arena[FAMILY_C * 6 + 1];
            current_coord->C2 = &shakti_arena[FAMILY_C * 6 + 2];
            current_coord->C3 = &shakti_arena[FAMILY_C * 6 + 3];
            current_coord->C4 = &shakti_arena[FAMILY_C * 6 + 4];
            current_coord->C5 = &shakti_arena[FAMILY_C * 6 + 5];

            // ==== Initialize Reflective/Contextual Layer to NULL ====
            current_coord->cpf = NULL;
            current_coord->ct = NULL;
            current_coord->cp = NULL;
            current_coord->cf = NULL;
            current_coord->cfp = NULL;
            current_coord->cs = NULL;

            // ==== Set self-reference and inverse ====
            current_coord->self = current_coord;
            current_coord->inverse = NULL; // To be handled by inversion op

            // ==== Initialize Operators to NULL ====
            current_coord->invert = NULL;
            current_coord->invoke = NULL;
        }
    }
    printf("Shakti Arena populated and pointer web woven.\n");
}


/**
 * @brief Main function for testing purposes.
 */
int main() {
    if (epi_logos_init() == 0) {
        // Successfully initialized
        
        // More robust test:
        // 1. Get a pointer to a specific coordinate, e.g., T2 (Thought-Form)
        Coordinate* t2 = &shakti_arena[FAMILY_T * 6 + 2];
        
        // 2. From T2, traverse to another coordinate, e.g., M4 (Nara)
        Coordinate* m4 = t2->M4;

        // 3. From M4, check its bedrock archetype
        RawArchetype* bedrock = m4->bedrock;

        printf("\n--- Verification Test ---\n");
        printf("Starting from coordinate T2 (Family: %d, Archetype: %d)\n", t2->family, t2->raw_archetype);
        printf("Traversing to M4 via pointer... (Family: %d, Archetype: %d)\n", m4->family, m4->raw_archetype);
        printf("Checking M4's bedrock... (Position: %d)\n", bedrock->position);

        if (t2->family == FAMILY_T && t2->raw_archetype == 2 &&
            m4->family == FAMILY_M && m4->raw_archetype == 4 &&
            bedrock->position == 4) {
            printf("Test PASSED: Pointer web and bedrock links are consistent.\n");
        } else {
            printf("Test FAILED: Inconsistency found in the pointer web.\n");
        }

        printf("\n--- Inversion Test ---\n");
        Coordinate* s4 = &shakti_arena[FAMILY_S * 6 + 4]; // S4 (Claude)
        printf("Inverting S4...\n");
        Coordinate* s4_inverted = s4->invert(s4);

        if (s4_inverted != NULL &&
            s4_inverted->inversion_state == 1 &&
            s4_inverted->family == s4->family &&
            s4_inverted->raw_archetype == s4->raw_archetype &&
            s4_inverted->inverse == s4 &&
            s4->inverse == s4_inverted) {
            printf("Test PASSED: S4' created successfully and linked back to S4.\n");
            printf("S4 is at %p, S4' is at %p\n", (void*)s4, (void*)s4_inverted);
        } else {
            printf("Test FAILED: Inversion of S4 was not successful.\n");
        }


        epi_logos_destroy();
    }
    return 0;
}

// ============================================
// OPERATOR IMPLEMENTATIONS
// ============================================

/**
 * @brief Assigns the operator function pointers to all coordinates.
 */
void assign_operators() {
    for (int i = 0; i < 36; i++) {
        shakti_arena[i].invert = epi_logos_invert;
        // inverted_shakti_arena will also get this, but it's okay
    }
    printf("Invert operator assigned to all coordinates.\n");
}

/**
 * @brief The '#' Inversion Act. Creates an inverted counterpart
 * for a given coordinate.
 */
Coordinate* epi_logos_invert(Coordinate* self) {
    if (self == NULL) return NULL;

    // Check if the inverse already exists
    if (self->inverse != NULL) {
        return self->inverse;
    }

    // Determine if 'self' is in the normal or inverted arena
    ptrdiff_t index;
    if (self >= shakti_arena && self < &shakti_arena[36]) {
        // It's a normal coordinate, create an inverted one
        index = self - shakti_arena;
        Coordinate* inverted_coord = &inverted_shakti_arena[index];
        
        // Shallow copy all data
        *inverted_coord = *self;

        // Set the inverted state and link them
        inverted_coord->inversion_state = 1;
        inverted_coord->inverse = self;
        self->inverse = inverted_coord;
        
        return inverted_coord;

    } else if (self >= inverted_shakti_arena && self < &inverted_shakti_arena[36]) {
        // It's an inverted coordinate, return its original
        index = self - inverted_shakti_arena;
        return &shakti_arena[index];
    }
    
    // Should not happen
    return NULL;
}
