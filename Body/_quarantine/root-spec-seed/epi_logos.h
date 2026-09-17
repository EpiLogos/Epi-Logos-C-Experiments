#ifndef EPI_LOGOS_H
#define EPI_LOGOS_H

#include <stdint.h>
#include <stddef.h>

// ============================================
// FORWARD DECLARATIONS & CORE TYPES
// ============================================

// Promise of intra-openness between the core structs
typedef struct RawArchetype RawArchetype;
typedef struct Coordinate Coordinate;

// Enum for the Six Coordinate Families
typedef enum {
    FAMILY_P, // Position
    FAMILY_S, // Stack
    FAMILY_T, // Thought
    FAMILY_M, // Subsystem
    FAMILY_L, // Lens
    FAMILY_C  // Category
} CoordinateFamily;

// The () OPERATOR SIGNATURE — Execution matrix
typedef void (*Context_Execution_Operator)(Coordinate* self_context);

// The # (INVERSION) OPERATOR SIGNATURE
typedef Coordinate* (*Inversion_Operator)(Coordinate* self);


// ============================================
// LAYER 1: RAW ARCHETYPES (#0-#5) — Foundation
// ============================================
struct RawArchetype {
    uint8_t position;           // 0, 1, 2, 3, 4, or 5
    uint8_t inversion_state;    // 0 = normal, 1 = inverted
    float weave_state;          // 0.0, 0.5, 5.0, 5.5

    // Each archetype points to ALL OTHER archetypes
    RawArchetype* _0; RawArchetype* _1; RawArchetype* _2;
    RawArchetype* _3; RawArchetype* _4; RawArchetype* _5;

    // The # (Inversion Act) as function
    Inversion_Operator invert;

    // Connection to coordinate families (Layer 2)
    Coordinate* P; Coordinate* S; Coordinate* T;
    Coordinate* M; Coordinate* L; Coordinate* C;
};


// ============================================
// LAYER 2: COORDINATE FAMILIES — Manifestations
// ============================================
struct Coordinate {
    // Identity
    uint8_t raw_archetype;      // #0, #1, #2, #3, #4, or #5
    CoordinateFamily family;    // P, S, T, M, L, C (enum)
    uint8_t inversion_state;    // 0 = normal, 1 = inverted
    float weave_state;          // Interlaced fraction
    uint32_t vector_id;         // Anchor to Tensor Arena

    // Link to raw archetype (Layer 1)
    RawArchetype* bedrock;

    // ============================================
    // 16-FOLD INTRA-OPENNESS-TO
    // ============================================

    // Raw archetypes
    RawArchetype* _0; RawArchetype* _1; RawArchetype* _2;
    RawArchetype* _3; RawArchetype* _4; RawArchetype* _5;

    // P-family coordinates
    Coordinate* P0; Coordinate* P1; Coordinate* P2;
    Coordinate* P3; Coordinate* P4; Coordinate* P5;

    // S-family coordinates
    Coordinate* S0; Coordinate* S1; Coordinate* S2;
    Coordinate* S3; Coordinate* S4; Coordinate* S5;

    // T-family coordinates
    Coordinate* T0; Coordinate* T1; Coordinate* T2;
    Coordinate* T3; Coordinate* T4; Coordinate* T5;

    // M-family coordinates
    Coordinate* M0; Coordinate* M1; Coordinate* M2;
    Coordinate* M3; Coordinate* M4; Coordinate* M5;

    // L-family coordinates
    Coordinate* L0; Coordinate* L1; Coordinate* L2;
    Coordinate* L3; Coordinate* L4; Coordinate* L5;

    // C-family coordinates (ontological layer)
    Coordinate* C0; Coordinate* C1; Coordinate* C2;
    Coordinate* C3; Coordinate* C4; Coordinate* C5;

    // ============================================
    // LAYER 3: REFLECTIVE/CONTEXTUAL (in ())
    // ============================================
    Coordinate* cpf;  // Category-Position-Frame
    Coordinate* ct;   // Context-Time (spec says Content-Type, clarifying)
    Coordinate* cp;   // Context-Position
    Coordinate* cf;   // Context-Frame (#4 Lemniscate anchor)
    Coordinate* cfp;  // Context-Frame-Position
    Coordinate* cs;   // Context-System

    // Self-reference for recursive closure
    Coordinate* self;
    Coordinate* inverse;  // Result of # operation

    // ============================================
    // OPERATORS
    // ============================================
    Inversion_Operator invert;          // The # operation
    Context_Execution_Operator invoke;  // The () operation

    // Type-specific payload
    union {
        char* meaning_bin;
        void* process_state;
        uint64_t instance_id;
        float* vector_anchor;
    } payload;
};

#endif // EPI_LOGOS_H
