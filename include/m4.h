/**
 * m4.h — Nara: The Personal Dialogical Interface (Subsystem #4)
 *
 * Implements: M4 (#4) = personal oracle interface, Lemniscate anchor.
 * Context frame: (4.0/1-4.4/5) — CF_FRACTAL (Fractal Doubling)
 * Anchored to: Psychoid_4 in psychoid_numbers.c (Layer 1 .rodata)
 * Builds on:  ontology.h, psychoid_numbers.h, arena.h, m0.h, m2.h, m3.h
 * Feeds into: M5 (Logos FSM, Mobius write-back)
 *
 * Architecture: Vtable dispatch (not bitwise). 6-lens registry indexed.
 * All personal/mutable state = heap (PCO). Identity computed once.
 * Floats ONLY in M4_Jung_Complex (charge, autonomy).
 *
 * FR Coverage: 2.4.0 – 2.4.13 (M4-nara-personal-interface.md)
 *
 * ARCHITECTURE RULE: M4_Root has Holographic_Coordinate* hc
 * as its first field. Bind with HC_LINK(). Never access without GET_PTR().
 *
 * Public interface — all consumers need only:
 *   m4_init(arena, hc)              — allocate and HC-link M4 root
 *   m4_identity_compute(id, input)  — compute-once Symbol DNA + BLAKE3
 *   m4_snapshot_now(degree, epoch)  — create M4_Temporal_Now
 *   m4_advance_transformation(eng)  — modulo cascade cycle engine
 *   m4_teardown(root)               — release heap state
 *   m4_cli_dispatch(argc, argv, rt) — CLI entry point
 */

#ifndef M4_H
#define M4_H

#include "ontology.h"
#include "psychoid_numbers.h"
#include "arena.h"
#include "m0.h"
#include "m2.h"
#include "m3.h"
#include <stdbool.h>
#include <stdint.h>


/* ===================================================================
 * FR 2.4.7: ELEMENTAL THROUGHLINE CONSTANTS
 *
 * The four-element backbone linking M2 (vibration), M3 (codons), M4 (identity).
 * A=Water=Cups=Feeling, T=Fire=Wands=Intuition,
 * C=Earth=Pentacles=Sensation, G=Air=Swords=Thinking.
 * =================================================================== */

#define M4_ELEM_WATER   0   /* Adenine  — Cups — Feeling     (Yin)  */
#define M4_ELEM_FIRE    1   /* Thymine  — Wands — Intuition  (Yang) */
#define M4_ELEM_EARTH   2   /* Cytosine — Pentacles — Sensation (Yin) */
#define M4_ELEM_AIR     3   /* Guanine  — Swords — Thinking  (Yang) */

/* Nucleotide-to-element consistency check */
_Static_assert(M3_NUC_A == M4_ELEM_WATER,  "Elemental Throughline: A must be Water(0)");
_Static_assert(M3_NUC_T == M4_ELEM_FIRE,   "Elemental Throughline: T must be Fire(1)");
_Static_assert(M3_NUC_C == M4_ELEM_EARTH,  "Elemental Throughline: C must be Earth(2)");
_Static_assert(M3_NUC_G == M4_ELEM_AIR,    "Elemental Throughline: G must be Air(3)");


/* ===================================================================
 * FR 2.4.0: M4_Symbol_DNA_Profile — The Symbol DNA Blueprint
 *
 * The user's personal coordinates within M3's universal address space.
 * gene_keys_activation is a mask over M3's 64-bitboard.
 * nucleotide_balance translates Jungian type into elemental throughline.
 * =================================================================== */

typedef struct {
    uint64_t gene_keys_activation;  /* M3_Matrix_Word — M3 bitboard mask */

    struct {
        uint8_t adenine_water;      /* Cups / Feeling (Fi/Fe) */
        uint8_t thymine_fire;       /* Wands / Intuition (Ni/Ne) */
        uint8_t cytosine_earth;     /* Pentacles / Sensation (Si/Se) */
        uint8_t guanine_air;        /* Swords / Thinking (Ti/Te) */
    } nucleotide_balance;

    uint16_t sun_degree_anchor;     /* 0-719: natal sun position on 720 clock */
    uint16_t moon_degree_anchor;    /* 0-719: natal moon position */
} M4_Symbol_DNA_Profile;


/* ===================================================================
 * FR 2.4.1: M4_Input_Data + M4_Identity_Matrix
 *
 * Input is transient: zeroed immediately after compute.
 * Identity is compute-once, then effectively const.
 * =================================================================== */

typedef struct {
    uint32_t birth_year;
    uint8_t  birth_month;
    uint8_t  birth_day;
    uint8_t  birth_hour;
    uint8_t  birth_minute;
    float    birth_latitude;
    float    birth_longitude;
    uint8_t  mbti_raw;              /* Raw MBTI code before translation */
    uint8_t  _pad[3];
} M4_Input_Data;

typedef struct {
    M4_Symbol_DNA_Profile dna_profile;
    uint32_t numerological_key;     /* #4.0-0: birthdate encoding */
    uint64_t quintessence_hash;     /* #4.0-5: BLAKE3 truncated to 64 bits */
    uint8_t  jung_type;             /* #4.0-2: 4-bit MBTI composite */
    bool     computed;              /* Compute-once guard */
} M4_Identity_Matrix;

static inline bool m4_identity_ready(const M4_Identity_Matrix* id) {
    return id->computed;
}


/* ===================================================================
 * FR 2.4.11: M4_Temporal_Now — The Lived Moment
 *
 * Composes M1/M2/M3 clock with planetary preemption slots.
 * Works at 0 planets (stub mode) through 7 planets (full).
 * =================================================================== */

typedef struct {
    Unified_Clock_State clock;          /* M1/M2/M3 concentric state */
    uint16_t            degree;         /* 0-719 (SU(2) double cover) */
    uint32_t            chronos_epoch;  /* Unix seconds */

    uint16_t planet_degrees[7];         /* Sun/Moon/Merc/Venus/Mars/Jup/Sat */
    uint8_t  planet_valid;              /* Bitmask: which planets have data */
} M4_Temporal_Now;

static inline M4_Temporal_Now m4_snapshot_now(uint16_t degree, uint32_t epoch) {
    M4_Temporal_Now now;
    now.clock = m0_read_cosmic_clock(degree);
    now.degree = degree;
    now.chronos_epoch = epoch;
    for (int i = 0; i < 7; i++) now.planet_degrees[i] = 0;
    now.planet_valid = 0x00;
    return now;
}


/* ===================================================================
 * FR 2.4.13: ORACLE PRIMITIVES — Sacred Random + Casting Results
 *
 * True random via arc4random_buf(). Consent-gated per invocation.
 * =================================================================== */

typedef struct {
    bool     consent_granted;       /* User MUST consent per invocation */
    uint64_t session_nonce;         /* Unique per-session */
} M4_Sacred_Random;

typedef struct {
    uint8_t  lines[6];              /* Line values (6/7/8/9), bottom to top */
    uint8_t  hexagram_id;           /* 6-bit: resulting hexagram (0-63) */
    uint8_t  changing_mask;         /* 6-bit: which lines are changing */
    uint8_t  result_hexagram;       /* Hexagram after changes applied */
    uint16_t cast_degree;           /* Kairos moment degree */
} M4_IChing_Cast;

typedef struct {
    uint8_t  cards[78];             /* Full deck (Fisher-Yates shuffled) */
    uint8_t  drawn[12];             /* Drawn cards (max spread size) */
    uint8_t  draw_count;            /* How many drawn */
    uint8_t  spread_type;           /* Spread ID */
    uint16_t cast_degree;           /* Kairos moment */
} M4_Tarot_Draw;

/* Universal emission format — bridges oracle -> medicine -> transformation */
typedef struct {
    uint16_t tag_id;                /* Universal symbol identifier */
    uint8_t  tradition;             /* 0=Tarot, 1=I-Ching, 2=custom */
    uint8_t  nucleotide;            /* A/T/C/G via Elemental Throughline */
    uint8_t  element;               /* Fire/Earth/Air/Water/Akasha */
    uint16_t degree;                /* Position on M3 wheel (0-719) */
} M4_Canonical_Tag;


/* ===================================================================
 * FR 2.4.3: DIVINATION VTABLE + MAGIC-NUMBER TYPE SAFETY
 * =================================================================== */

#define M4_MAGIC_TAROT  0x5441524Fu     /* 'TARO' */
#define M4_MAGIC_ICHING 0x49434847u     /* 'ICHG' */

typedef struct {
    uint32_t magic;                 /* M4_MAGIC_TAROT — MUST be first */
    uint8_t  deck_id;
    uint8_t  spread_type;
    uint8_t  _pad[2];
} M4_Tarot_State;

typedef struct {
    uint32_t magic;                 /* M4_MAGIC_ICHING — MUST be first */
    uint8_t  casting_method;
    uint8_t  _pad[3];
    uint64_t hexagram_result;
} M4_IChing_State;

typedef struct {
    const char* tradition_name;
    int (*cast)(void* state, const void* query, void* result);
    int (*interpret)(const void* cast_result, const void* context,
                     char* output, size_t len);
    int (*validate)(const void* cast_result);
} Divination_Vtable;


/* ===================================================================
 * FR 2.4.1: M4_Sympathetic_Medicine — Elemental balance + safety
 * =================================================================== */

typedef struct {
    uint8_t fire;
    uint8_t earth;
    uint8_t air;
    uint8_t water;
    uint8_t quintessence;
} M4_Elemental_Balance;

typedef struct {
    uint8_t id;
    uint8_t activation;
    uint8_t blockage;
} M4_Chakra_State;

typedef int (*Alchemical_Op)(void* state, const void* reagent);

typedef struct {
    M4_Elemental_Balance elements;      /* #4.1-0 */
    M4_Chakra_State chakras[7];         /* #4.1-1 */
    void* pharmacopeia;                 /* #4.1-2 */
    Alchemical_Op ops[7];               /* #4.1-3: 7 canonical verbs */
    uint8_t  planetary_hour;            /* #4.1-4 */
    uint16_t current_degree;            /* Degree in M3 wheel (0-719) */
    uint8_t  lunar_phase;               /* Moon phase (0-27 sidereal) */
    uint8_t  safety_level;              /* #4.1-5: 0=blocked, 255=clear */
    bool     contraindicated;           /* Emergency brake */
} M4_Sympathetic_Medicine;

static inline bool m4_medicine_safe(const M4_Sympathetic_Medicine* med) {
    return !med->contraindicated && med->safety_level > 0;
}


/* ===================================================================
 * FR 2.4.4: M4_Decan_Recipe_Card + M4_Cycle_Engine
 *
 * 12x3 = 36 recipe cards in .rodata. Modulo cascade advance.
 * =================================================================== */

typedef struct {
    uint8_t  storey;                /* 0-11 (mod-12) */
    uint8_t  decan;                 /* 0-2 (trinitarian sub-position) */
    uint8_t  op_count;
    uint8_t  ops[7];                /* Indices into 7 canonical verbs */
    uint16_t optimal_degree;        /* M3 wheel position (0-719) */
    uint8_t  planetary_hour;
    uint8_t  element_focus;
    uint8_t  chakra_focus;
    uint8_t  _pad;
} M4_Decan_Recipe_Card;

typedef struct {
    uint8_t current_storey;         /* 0-11 */
    uint8_t current_decan;          /* 0-2 */
    uint8_t current_stroke;         /* 0-23 */
    const M4_Decan_Recipe_Card* active_recipe;
    uint8_t arousal_level;          /* 0-255 */
    uint8_t safety_threshold;       /* If arousal > threshold -> halt */
    bool    poison_cure_toggle;     /* Paracelsian dose toggle */
} M4_Cycle_Engine;

/* FR 2.4.4: Modulo cascade — no nested if/else */
static inline void m4_advance_transformation(M4_Cycle_Engine* engine) {
    engine->current_stroke = (uint8_t)((engine->current_stroke + 1) % 24);
    if (engine->current_stroke % 2 == 0) {
        engine->current_storey = (uint8_t)((engine->current_storey + 1) % 12);
        if (engine->current_storey % 4 == 0) {
            engine->current_decan = (uint8_t)((engine->current_decan + 1) % 3);
        }
    }
}

static inline bool m4_transformation_safe(const M4_Cycle_Engine* engine) {
    return engine->arousal_level <= engine->safety_threshold;
}


/* ===================================================================
 * FR 2.4.9: SAFETY GOVERNOR
 * =================================================================== */

typedef enum {
    STALL_NONE          = 0,
    STALL_AROUSAL       = 1,        /* Arousal exceeds threshold */
    STALL_CONTRAINDICATED = 2,      /* Medical safety brake */
    STALL_CONSENT       = 3,        /* Oracle consent not granted */
    STALL_MEF_LOW       = 4         /* MEF below lens threshold */
} M4_Stall_Type;

typedef struct {
    M4_Stall_Type type;
    uint8_t       severity;         /* 0-255 */
    uint8_t       hysteresis;       /* Band width before re-clear */
    uint8_t       _pad;
} M4_Safety_Governor;

static inline M4_Safety_Governor m4_safety_check(
    const M4_Cycle_Engine* engine,
    const M4_Sympathetic_Medicine* med,
    const M4_Sacred_Random* rng)
{
    M4_Safety_Governor gov = {STALL_NONE, 0, 10, 0};
    if (med->contraindicated) {
        gov.type = STALL_CONTRAINDICATED;
        gov.severity = 255;
        return gov;
    }
    if (!m4_transformation_safe(engine)) {
        gov.type = STALL_AROUSAL;
        gov.severity = (uint8_t)(engine->arousal_level - engine->safety_threshold);
        return gov;
    }
    if (rng && !rng->consent_granted) {
        gov.type = STALL_CONSENT;
        gov.severity = 128;
        return gov;
    }
    return gov;
}


/* ===================================================================
 * FR 2.4.8: CONTAINER LUT — Dialogical inquiry containers
 * =================================================================== */

typedef struct {
    uint8_t container_type;         /* 0=circle, 1=temenos, 2=vessel */
    uint8_t capacity;               /* Max participants */
    uint8_t _pad[2];
} M4_Container_Entry;

_Static_assert(sizeof(M4_Container_Entry) == 4,
    "M4_Container_Entry must be 4 bytes");

#define M4_CONTAINER_COUNT 3


/* ===================================================================
 * FR 2.4.5: M4_Jung_Complex — THE ONLY FLOATS IN M4
 *
 * Floats permitted ONLY in charge and autonomy.
 * Never for array indices. Threshold checks and Pi Agent reporting only.
 * =================================================================== */

typedef struct {
    uint8_t archetype_id;
    float   charge;                 /* Emotional intensity */
    float   autonomy;               /* Autonomous operation (0.0-1.0) */
    bool    conscious;              /* Made conscious? */
} M4_Jung_Complex;

/* Jungian type: 4 functions + 2 attitudes in 6 bits */
typedef uint8_t M4_Jung_Type;
#define JUNG_INTROVERT  0x00
#define JUNG_EXTRAVERT  0x20
#define JUNG_THINKING   0x02        /* -> Guanine/Air */
#define JUNG_FEELING    0x04        /* -> Adenine/Water */
#define JUNG_SENSATION  0x08        /* -> Cytosine/Earth */
#define JUNG_INTUITION  0x10        /* -> Thymine/Fire */

/* Alchemical stage state machine */
typedef enum {
    ALCH_PRIMA_MATERIA = 0,
    ALCH_NIGREDO       = 1,
    ALCH_ALBEDO        = 2,
    ALCH_CITRINITAS    = 3,
    ALCH_RUBEDO        = 4,
    ALCH_TRANSCENDENT  = 5
} M4_Alchemical_Stage;

static inline bool m4_alchemy_can_advance(M4_Alchemical_Stage current,
                                           M4_Alchemical_Stage target) {
    return target == (M4_Alchemical_Stage)(current + 1) || target == ALCH_PRIMA_MATERIA;
}


/* ===================================================================
 * FR 2.4.4: M4_Lens_Vtable + M4_Personal_Pratibimba + M4_Context_Lenses
 * =================================================================== */

typedef struct {
    const char* lens_name;
    int (*translate)(uint8_t lens_id, const char* input,
                     const char* context, char* output, size_t len);
    int (*activate)(uint8_t lens_id, void* phenom_state);
    int (*deactivate)(uint8_t lens_id, void* phenom_state);
    int (*annotate)(uint8_t lens_id, const void* experience,
                    char* annotation, size_t len);
} M4_Lens_Vtable;

typedef struct {
    const M4_Symbol_DNA_Profile* user_dna;
    M4_Sympathetic_Medicine* current_body_state;
    MEF_Condition* active_epistemic_lens;   /* -> M2 .rodata */
    M4_Jung_Complex active_complexes[6];
    bool    identity_manifested;
    bool    telemetry_active;
    uint32_t pattern_count;
    uint64_t synthesized_signature;         /* quintessence in action */
} M4_Personal_Pratibimba;

typedef struct {
    const M4_Lens_Vtable* registry;         /* -> M4_LENS_REGISTRY[6] */
    uint8_t active_lens;                    /* Currently selected (0-5) */
    uint8_t lens_stack[6];                  /* Lens priority stack */
    M4_Jung_Complex* complexes;             /* Dynamic array */
    uint8_t complex_count;
    M4_Alchemical_Stage alch_stage;
    M4_Jung_Type jung_type;
    M4_Personal_Pratibimba pratibimba;
    uint8_t phenom_layer;                   /* 0-5 */
    uint8_t mobius_count;
} M4_Context_Lenses;


/* ===================================================================
 * FR 2.4.10: M4_Voice_Config + Transparency + Logos Cycle
 * =================================================================== */

typedef struct {
    uint8_t formality;              /* 0=casual, 255=formal */
    uint8_t warmth;                 /* 0=clinical, 255=warm */
    uint8_t directness;             /* 0=indirect, 255=direct */
    uint8_t depth;                  /* 0=surface, 255=deep */
    uint8_t metaphor_density;       /* 0=literal, 255=symbolic */
    uint8_t humor;                  /* 0=none, 255=playful */
    uint8_t challenge;              /* 0=supportive, 255=challenging */
    uint8_t _pad;
} M4_Voice_Config;

_Static_assert(sizeof(M4_Voice_Config) == 8, "M4_Voice_Config must be 8 bytes");

typedef struct {
    uint32_t timestamp;
    uint8_t  storey;
    uint8_t  decan;
    uint8_t  stroke;
    uint8_t  operation;
    uint8_t  outcome;
    uint8_t  _pad[3];
} M4_Transparency_Record;

typedef struct {
    uint8_t position;               /* 0-5 (current QL position) */
    uint8_t cycle_count;            /* Complete cycles this session */
    bool    complete;               /* Has this episode finished? */
} M4_Logos_Cycle_State;


/* ===================================================================
 * FR 2.4.5: M4_Epii_Integration + Mobius return
 * =================================================================== */

typedef struct {
    void* curriculum;                       /* #4.5-0 */
    const M4_Voice_Config* voice_config;    /* #4.5-1: .rodata */
    void* transparency_log;                 /* #4.5-2 */
    void* integration_state;                /* #4.5-3 */
    uint8_t readiness_level;                /* #4.5-4 */
    M4_Logos_Cycle_State logos;             /* #4.5-5 */
    uint64_t wisdom_delta;
    bool     return_ready;
} M4_Epii_Integration;

static inline void m4_mobius_return(M4_Epii_Integration* epii,
                                     M4_Identity_Matrix* identity) {
    identity->quintessence_hash ^= epii->wisdom_delta;
    identity->computed = false;     /* RESEEDS_IDENTITY */
    epii->return_ready = false;
    epii->logos.position = 0;
    epii->logos.cycle_count++;
}


/* ===================================================================
 * PCO: M4_PersonalContextOverlay — The complete heap struct
 * =================================================================== */

typedef struct {
    M4_Identity_Matrix identity;
    M4_Sympathetic_Medicine medicine;
    M4_Cycle_Engine cycle;
    M4_Context_Lenses lenses;
    M4_Epii_Integration epii;

    struct {
        M4_Transparency_Record* records;
        uint32_t count;
        uint32_t capacity;
    } phase_history;

    M4_Sacred_Random rng;
    M4_Temporal_Now last_now;
} M4_PersonalContextOverlay;


/* ===================================================================
 * M4 ROOT STRUCT — HC-anchored module state
 * =================================================================== */

typedef struct {
    Holographic_Coordinate*       hc;           /* FIRST FIELD — HC_LINK'd */
    const Holographic_Coordinate* active_cf;    /* CF_TABLE[CF_FRACTAL] */
    M4_PersonalContextOverlay     pco;          /* All mutable personal state */
} M4_Root;


/* ===================================================================
 * .RODATA EXTERN PROMISES — verification-visible LUT data
 * =================================================================== */

extern const M4_Lens_Vtable      M4_LENS_REGISTRY[6];
extern const M4_Decan_Recipe_Card M4_PROTOCOL_LIBRARY[12][3];
extern const Alchemical_Op       M4_ALCHEMY_OPS[7];
extern const uint8_t             M4_LENS_MEF_THRESHOLD[6];
extern const M4_Voice_Config     M4_VOICE_CONFIG;
extern const M4_Container_Entry  M4_CONTAINER_LUT[M4_CONTAINER_COUNT];


/* ===================================================================
 * PUBLIC API
 * =================================================================== */

/* Allocate and HC-link M4_Root; hc must be Psychoid_4's mutable mirror */
M4_Root* m4_init(Coordinate_Arena* arena, Holographic_Coordinate* hc);

/* Compute-once identity: derives Symbol DNA, BLAKE3 quintessence.
 * Zeroes input immediately after compute. */
void m4_identity_compute(M4_Identity_Matrix* id, M4_Input_Data* input);

/* Release M4_Root heap state (not the HC itself) */
void m4_teardown(M4_Root* root);

/* Boot-time .rodata verification */
bool m4_verify(void);

/* CLI dispatch entry point: argv[0] = "m4" */
int m4_cli_dispatch(int argc, char** argv, M4_Root* root);

/* Oracle casting functions */
int m4_cast_iching(M4_Sacred_Random* rng, uint16_t cast_degree,
                   M4_IChing_Cast* out);
int m4_draw_tarot(M4_Sacred_Random* rng, uint8_t count, uint16_t cast_degree,
                  M4_Tarot_Draw* out);

/* Consent-gated true random */
bool m4_sacred_random(M4_Sacred_Random* rng, uint8_t* buf, size_t len);


#endif /* M4_H */
