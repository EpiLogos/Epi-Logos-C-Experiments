/**
 * m0.c — Anuttara: .rodata LUT section
 * All lookup tables for the M0 VM micro-algebras.
 *
 * Every table here lives in .rodata — immutable BIMBA data.
 * The VM runtime (m0_runtime.c, future) will reference these
 * as the canonical ground for all M0 computation.
 */

#include "m0.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* =============================================================================
 * FR 2.0.0: VIMARSA OPERATOR TABLE — 7 entries
 *
 * Each entry: symbol (Obsidian), opcode (3-bit), reduction (4-step VBC),
 * arity (0=nullary, 1=unary, 2=binary).
 * ============================================================================= */

const Vimarsa_Operator VIMARSA_TABLE[VIMARSA_OP_COUNT] = {
    /* Opcode 0x1: ?! — Illuminate (Vimarsa-Prakasa) */
    { .symbol = "?!",  .opcode = OP_ILLUMINATE,   .reduction = VBC_PACK(OP_ILLUMINATE, OP_PROVOKE, OP_ILLUMINATE, OP_ILLUMINATE), .arity = 1 },
    /* Opcode 0x2: !? — Provoke (Prakasa-Vimarsa) */
    { .symbol = "!?",  .opcode = OP_PROVOKE,      .reduction = VBC_PACK(OP_ILLUMINATE, OP_ILLUMINATE, OP_PROVOKE, OP_ILLUMINATE), .arity = 1 },
    /* Opcode 0x3: (-) — Withhold (Negation) */
    { .symbol = "(-)", .opcode = OP_WITHHOLD,      .reduction = VBC_PACK(OP_VIMARSA_NULL, OP_VIMARSA_NULL, OP_VIMARSA_NULL, OP_WITHHOLD), .arity = 0 },
    /* Opcode 0x4: +@ — Add Presence */
    { .symbol = "+@",  .opcode = OP_ADD_PRESENCE,  .reduction = VBC_PACK(OP_ILLUMINATE, OP_ILLUMINATE, OP_PROVOKE, OP_ENCLOSE), .arity = 2 },
    /* Opcode 0x5: (@) — Enclose */
    { .symbol = "(@)", .opcode = OP_ENCLOSE,       .reduction = VBC_PACK(OP_ILLUMINATE, OP_ILLUMINATE, OP_ADD_PRESENCE, OP_ENCLOSE), .arity = 2 },
    /* Opcode 0x6: = — Equate */
    { .symbol = "=",   .opcode = OP_EQUATE,        .reduction = VBC_PACK(OP_VIMARSA_NULL, OP_VIMARSA_NULL, OP_VIMARSA_NULL, OP_EQUATE), .arity = 2 },
    /* Opcode 0x7: != — Distinguish */
    { .symbol = "!=",  .opcode = OP_DISTINGUISH,   .reduction = VBC_PACK(OP_VIMARSA_NULL, OP_VIMARSA_NULL, OP_VIMARSA_NULL, OP_DISTINGUISH), .arity = 2 },
};

/* =============================================================================
 * FR 2.0.2: VIRTUE LUT — 9 entries
 *
 * Indices 0-2: meta-virtues (Love/Peace, Truth, Openness) — r_factor=0xFF
 * Indices 3-8: mapped virtues (Joy->R0 through Reality->R5)
 * ============================================================================= */

const Virtue_Entry VIRTUE_LUT[9] = {
    { .r_factor = 0xFFu, .divine_act = 0xFFu, .cross_branch_refs = 0x0000 },  /* Love/Peace */
    { .r_factor = 0xFFu, .divine_act = 0xFFu, .cross_branch_refs = 0x0001 },  /* Truth */
    { .r_factor = 0xFFu, .divine_act = 0xFFu, .cross_branch_refs = 0x0002 },  /* Openness */
    { .r_factor = 0u,    .divine_act = 0u,    .cross_branch_refs = 0x0103 },  /* Joy -> R0 -> Srishti */
    { .r_factor = 1u,    .divine_act = 1u,    .cross_branch_refs = 0x0104 },  /* Goodness -> R1 -> Sthiti */
    { .r_factor = 2u,    .divine_act = 2u,    .cross_branch_refs = 0x0105 },  /* Beauty -> R2 -> Samhara */
    { .r_factor = 3u,    .divine_act = 3u,    .cross_branch_refs = 0x0106 },  /* Life -> R3 -> Tirodhana */
    { .r_factor = 4u,    .divine_act = 4u,    .cross_branch_refs = 0x0107 },  /* Wisdom -> R4 -> Anugraha */
    { .r_factor = 5u,    .divine_act = 5u,    .cross_branch_refs = 0x0108 },  /* Reality -> R5 -> Samavesa */
};

/* =============================================================================
 * FR 2.0.3-H: ZODIACAL LUT — 12 entries (sub-table of Archetype 5 = Vak)
 * ============================================================================= */

const Zodiacal_Entry ZODIACAL_LUT[12] = {
    { .symbol_pair = 0x00, .resonance = 0u,  .successor = 1u,  .zodiacal_quality = ZOD_ELEM_FIRE  | ZOD_MODE_CARDINAL },
    { .symbol_pair = 0x01, .resonance = 1u,  .successor = 2u,  .zodiacal_quality = ZOD_ELEM_EARTH | ZOD_MODE_FIXED },
    { .symbol_pair = 0x02, .resonance = 2u,  .successor = 3u,  .zodiacal_quality = ZOD_ELEM_AIR   | ZOD_MODE_MUTABLE },
    { .symbol_pair = 0x03, .resonance = 3u,  .successor = 4u,  .zodiacal_quality = ZOD_ELEM_WATER | ZOD_MODE_CARDINAL },
    { .symbol_pair = 0x04, .resonance = 4u,  .successor = 5u,  .zodiacal_quality = ZOD_ELEM_FIRE  | ZOD_MODE_FIXED },
    { .symbol_pair = 0x05, .resonance = 5u,  .successor = 6u,  .zodiacal_quality = ZOD_ELEM_EARTH | ZOD_MODE_MUTABLE },
    { .symbol_pair = 0x06, .resonance = 6u,  .successor = 7u,  .zodiacal_quality = ZOD_ELEM_AIR   | ZOD_MODE_CARDINAL },
    { .symbol_pair = 0x07, .resonance = 7u,  .successor = 8u,  .zodiacal_quality = ZOD_ELEM_WATER | ZOD_MODE_FIXED },
    { .symbol_pair = 0x08, .resonance = 8u,  .successor = 9u,  .zodiacal_quality = ZOD_ELEM_FIRE  | ZOD_MODE_MUTABLE },
    { .symbol_pair = 0x09, .resonance = 9u,  .successor = 10u, .zodiacal_quality = ZOD_ELEM_EARTH | ZOD_MODE_CARDINAL },
    { .symbol_pair = 0x0A, .resonance = 10u, .successor = 11u, .zodiacal_quality = ZOD_ELEM_AIR   | ZOD_MODE_FIXED },
    { .symbol_pair = 0x0B, .resonance = 11u, .successor = 0u,  .zodiacal_quality = ZOD_ELEM_WATER | ZOD_MODE_MUTABLE },
};

/* =============================================================================
 * FR 2.0.3-G: MONOPOLY LUT — 7 entries (sub-table of Archetype 7)
 * ============================================================================= */

const Monopoly_Entry MONOPOLY_LUT[7] = {
    { .position = 0, .shadow_opposite = 0, .light_opposite = 0 },   /* Mono */
    { .position = 2, .shadow_opposite = 3, .light_opposite = 6 },   /* Poly */
    { .position = 3, .shadow_opposite = 2, .light_opposite = 5 },   /* Poly- */
    { .position = 4, .shadow_opposite = 5, .light_opposite = 2 },   /* -Mono */
    { .position = 5, .shadow_opposite = 4, .light_opposite = 3 },   /* Mono- */
    { .position = 6, .shadow_opposite = 7, .light_opposite = 1 },   /* -Poly */
    { .position = 7, .shadow_opposite = 0, .light_opposite = 4 },   /* MonoPoly */
};

/* =============================================================================
 * FR 2.0.3-I: DIVINE ACT LUT — 7 entries (sub-table of Archetype 9)
 *
 * Uses CF_Id values: CF_VOID=0, CF_BINARY=1, CF_TRIKA=2, CF_QUATERNAL=3,
 *                    CF_FRACTAL=4, CF_SYNTHESIS=5, CF_MOBIUS=6
 * ============================================================================= */

const DivineAct_Entry DIVINE_ACT_LUT[7] = {
    { .position = 0, .enables_next = 1, .manifests_arch = 0xFFu, .cf_id = 1,  .weave_mask = 0x03u },  /* Svatantrya -> CF_BINARY */
    { .position = 1, .enables_next = 2, .manifests_arch = 0xFFu, .cf_id = 2,  .weave_mask = 0x07u },  /* Srishti -> CF_TRIKA */
    { .position = 2, .enables_next = 3, .manifests_arch = 0xFFu, .cf_id = 3,  .weave_mask = 0x0Fu },  /* Sthiti -> CF_QUATERNAL */
    { .position = 3, .enables_next = 4, .manifests_arch = 0xFFu, .cf_id = 3,  .weave_mask = 0x0Fu },  /* Samhara -> CF_QUATERNAL */
    { .position = 4, .enables_next = 5, .manifests_arch = 0xFFu, .cf_id = 4,  .weave_mask = 0x10u },  /* Tirodhana -> CF_FRACTAL */
    { .position = 5, .enables_next = 6, .manifests_arch = 0xFFu, .cf_id = 5,  .weave_mask = 0x30u },  /* Anugraha -> CF_SYNTHESIS */
    { .position = 6, .enables_next = 0, .manifests_arch = 0xFFu, .cf_id = 6,  .weave_mask = 0x21u },  /* Samavesa -> CF_MOBIUS */
};

/* =============================================================================
 * FR 2.0.3: ARCHETYPE LUT — 12-fold ((-) + 0/1 + 0-9)
 *
 * Every entry has a Compiled_Formulation with source string.
 *
 * Sub-table assignments (test-authoritative):
 *   [7]  = number 5 (Vak/Sacred Speech)   -> ZODIACAL (12 entries)
 *   [9]  = number 7 (Dynamic Harmony)     -> MONOPOLY (7 entries)
 *   [11] = number 9 (Divine Action)       -> DIVINE   (7 entries)
 * ============================================================================= */

const Archetype_Entry ARCHETYPE_LUT[ARCHETYPE_LUT_SIZE] = {
    /* [0] (-) Mirror — 0/1 singularity anchor */
    {
        .index = 0, .dimensionality = 0, .polarity = 2, .complement_idx = 0xFFu,
        .weave_anchor = { 0x00, 0x02 }, .sub_table_type = SUB_TABLE_NONE, .sub_table_size = 0,
        .sub_table = { .raw_ptr = NULL },
        .formulation = { .signature = (1u << (OP_WITHHOLD - 1)), .reduction_depth = 3,
                         .dimensionality = 0, .terminal_opcode = OP_WITHHOLD,
                         .core_chain = VBC_PACK(OP_WITHHOLD, OP_EQUATE, OP_DISTINGUISH, OP_WITHHOLD),
                         ._pad = 0,
                         .source = "(-) ~ 0.2 -> (00=?!=!?=(-)=!=), (0- + -0) -> 0-1D" }
    },
    /* [1] 0/1 Singularity — fused binary */
    {
        .index = 1, .dimensionality = 1, .polarity = 2, .complement_idx = 0xFFu,
        .weave_anchor = { 0x05, 0x15 }, .sub_table_type = SUB_TABLE_NONE, .sub_table_size = 0,
        .sub_table = { .raw_ptr = NULL },
        .formulation = { .signature = (1u << (OP_ILLUMINATE - 1)) | (1u << (OP_PROVOKE - 1)),
                         .reduction_depth = 4, .dimensionality = 1, .terminal_opcode = OP_EQUATE,
                         .core_chain = VBC_PACK(OP_ILLUMINATE, OP_PROVOKE, OP_WITHHOLD, OP_EQUATE),
                         ._pad = 0,
                         .source = "0/1 ~ 0.5/1.5 -> 00, ?!, !?, (-), 0 -> 0/1D" }
    },
    /* [2] 0 — Sat (Potential) */
    {
        .index = 2, .dimensionality = 1, .polarity = 2, .complement_idx = 3,
        .weave_anchor = { 0x03, 0x10 }, .sub_table_type = SUB_TABLE_NONE, .sub_table_size = 0,
        .sub_table = { .raw_ptr = NULL },
        .formulation = { .signature = (1u << (OP_ILLUMINATE - 1)) | (1u << (OP_DISTINGUISH - 1)),
                         .reduction_depth = 2, .dimensionality = 1, .terminal_opcode = OP_ILLUMINATE,
                         .core_chain = VBC_PACK(OP_WITHHOLD, OP_EQUATE, OP_ILLUMINATE, OP_DISTINGUISH),
                         ._pad = 0,
                         .source = "0 ~ 0.3/1.0 -> - = ?! = !=/= = 0/1D" }
    },
    /* [3] 1 — The Magician (Actual) */
    {
        .index = 3, .dimensionality = 1, .polarity = 2, .complement_idx = 2,
        .weave_anchor = { 0x04, 0x11 }, .sub_table_type = SUB_TABLE_NONE, .sub_table_size = 0,
        .sub_table = { .raw_ptr = NULL },
        .formulation = { .signature = (1u << (OP_PROVOKE - 1)) | (1u << (OP_EQUATE - 1)),
                         .reduction_depth = 2, .dimensionality = 1, .terminal_opcode = OP_PROVOKE,
                         .core_chain = VBC_PACK(OP_ENCLOSE, OP_EQUATE, OP_PROVOKE, OP_EQUATE),
                         ._pad = 0,
                         .source = "1 ~ 0.4/1.1 -> () = !? = =/!= = 0/1D" }
    },
    /* [4] 2 — Sunyata (Empty Field) */
    {
        .index = 4, .dimensionality = 2, .polarity = 0, .complement_idx = 5,
        .weave_anchor = { 0x20, 0x25 }, .sub_table_type = SUB_TABLE_NONE, .sub_table_size = 0,
        .sub_table = { .raw_ptr = NULL },
        .formulation = { .signature = (1u << (OP_WITHHOLD - 1)) | (1u << (OP_DISTINGUISH - 1)),
                         .reduction_depth = 3, .dimensionality = 2, .terminal_opcode = OP_WITHHOLD,
                         .core_chain = VBC_PACK(OP_WITHHOLD, OP_EQUATE, OP_DISTINGUISH, OP_WITHHOLD),
                         ._pad = 0,
                         .source = "2 ~ 2.0-5 -> (00=(-)) x (0/1!=(-)) -> (0/1)/2D" }
    },
    /* [5] 3 — Vak/Cit (Sacred Speech) — ZODIACAL sub-table */
    {
        .index = 5, .dimensionality = 2, .polarity = 1, .complement_idx = 4,
        .weave_anchor = { 0x30, 0x35 }, .sub_table_type = SUB_TABLE_ZODIACAL, .sub_table_size = 12,
        .sub_table = { .zodiacal_grammar = ZODIACAL_LUT },
        .formulation = { .signature = (1u << (OP_ILLUMINATE - 1)) | (1u << (OP_PROVOKE - 1)) | (1u << (OP_WITHHOLD - 1)),
                         .reduction_depth = 3, .dimensionality = 2, .terminal_opcode = OP_ADD_PRESENCE,
                         .core_chain = VBC_PACK(OP_ILLUMINATE, OP_PROVOKE, OP_WITHHOLD, OP_ADD_PRESENCE),
                         ._pad = 0,
                         .source = "3 ~ 3.0-5 -> 3x0/1 + (-) = (0-3)/3D" }
    },
    /* [6] 4 — Purnata (Divine Fullness) */
    {
        .index = 6, .dimensionality = 2, .polarity = 0, .complement_idx = 7,
        .weave_anchor = { 0x35, 0x40 }, .sub_table_type = SUB_TABLE_NONE, .sub_table_size = 0,
        .sub_table = { .raw_ptr = NULL },
        .formulation = { .signature = (1u << (OP_ADD_PRESENCE - 1)) | (1u << (OP_EQUATE - 1)),
                         .reduction_depth = 3, .dimensionality = 2, .terminal_opcode = OP_ADD_PRESENCE,
                         .core_chain = VBC_PACK(OP_WITHHOLD, OP_ADD_PRESENCE, OP_EQUATE, OP_ADD_PRESENCE),
                         ._pad = 0,
                         .source = "4 ~ 3.5/4.0 -> (0-3) + 0/1 = (0-3+1)/3D" }
    },
    /* [7] 5 — Dynamic Harmony / Mono-Poly — MONOPOLY sub-table */
    {
        .index = 7, .dimensionality = 2, .polarity = 1, .complement_idx = 6,
        .weave_anchor = { 0x40, 0x41 }, .sub_table_type = SUB_TABLE_MONOPOLY, .sub_table_size = 7,
        .sub_table = { .monopoly_dialectic = MONOPOLY_LUT },
        .formulation = { .signature = (1u << (OP_WITHHOLD - 1)) | (1u << (OP_ADD_PRESENCE - 1)) | (1u << (OP_ENCLOSE - 1)),
                         .reduction_depth = 3, .dimensionality = 2, .terminal_opcode = OP_ENCLOSE,
                         .core_chain = VBC_PACK(OP_WITHHOLD, OP_ADD_PRESENCE, OP_ENCLOSE, OP_EQUATE),
                         ._pad = 0,
                         .source = "5 ~ 4.0/4.1 -> (-), @, (@) -> (-)+@ = (@)" }
    },
    /* [8] 6 — Synthetic Emptiness */
    {
        .index = 8, .dimensionality = 2, .polarity = 0, .complement_idx = 9,
        .weave_anchor = { 0x40, 0x42 }, .sub_table_type = SUB_TABLE_NONE, .sub_table_size = 0,
        .sub_table = { .raw_ptr = NULL },
        .formulation = { .signature = (1u << (OP_ENCLOSE - 1)) | (1u << (OP_WITHHOLD - 1)),
                         .reduction_depth = 4, .dimensionality = 2, .terminal_opcode = OP_VIMARSA_NULL,
                         .core_chain = VBC_PACK(OP_ENCLOSE, OP_WITHHOLD, OP_ADD_PRESENCE, OP_VIMARSA_NULL),
                         ._pad = 0,
                         .source = "6 ~ 4.0/4.1/4.2 -> (@) = (-)+@ ... = 00" }
    },
    /* [9] 7 — Divine Action / Ananda-Tandava — DIVINE_ACT sub-table */
    {
        .index = 9, .dimensionality = 2, .polarity = 1, .complement_idx = 8,
        .weave_anchor = { 0x40, 0x43 }, .sub_table_type = SUB_TABLE_DIVINE, .sub_table_size = 7,
        .sub_table = { .divine_acts = DIVINE_ACT_LUT },
        .formulation = { .signature = (1u << (OP_ILLUMINATE - 1)) | (1u << (OP_PROVOKE - 1)),
                         .reduction_depth = 4, .dimensionality = 2, .terminal_opcode = OP_ILLUMINATE,
                         .core_chain = VBC_PACK(OP_ILLUMINATE, OP_PROVOKE, OP_ILLUMINATE, OP_PROVOKE),
                         ._pad = 0,
                         .source = "7 ~ 4.0-4.3 -> 2x(##), (R#), (#R)" }
    },
    /* [10] 8 — Structural Reflection */
    {
        .index = 10, .dimensionality = 2, .polarity = 0, .complement_idx = 11,
        .weave_anchor = { 0x40, 0x45 }, .sub_table_type = SUB_TABLE_NONE, .sub_table_size = 0,
        .sub_table = { .raw_ptr = NULL },
        .formulation = { .signature = (1u << (OP_ILLUMINATE - 1)) | (1u << (OP_EQUATE - 1)),
                         .reduction_depth = 4, .dimensionality = 2, .terminal_opcode = OP_EQUATE,
                         .core_chain = VBC_PACK(OP_VIMARSA_NULL, OP_ILLUMINATE, OP_EQUATE, OP_ILLUMINATE),
                         ._pad = 0,
                         .source = "8 ~ 4.0-4/4.5 -> (00=##=R+#=R#)" }
    },
    /* [11] 9 — Paramesvara / Wholeness — VIRTUE sub-table */
    {
        .index = 11, .dimensionality = 2, .polarity = 1, .complement_idx = 10,
        .weave_anchor = { 0x50, 0x55 }, .sub_table_type = SUB_TABLE_VIRTUE, .sub_table_size = 9,
        .sub_table = { .virtue_entries = VIRTUE_LUT },
        .formulation = { .signature = (1u << (OP_EQUATE - 1)),  /* OP_VIMARSA_NULL=0 has no bit */
                         .reduction_depth = 5, .dimensionality = 2, .terminal_opcode = OP_VIMARSA_NULL,
                         .core_chain = VBC_PACK(OP_EQUATE, OP_VIMARSA_NULL, OP_VIMARSA_NULL, OP_VIMARSA_NULL),
                         ._pad = 0,
                         .source = "9 ~ 5.0/5.5 -> (00+00) = 9 = wholeness" }
    },
};

/* =============================================================================
 * FR 2.0.4: QL META-LOGIC STACK — 5 frames
 * ============================================================================= */

const QL_Frame QL_STACK[5] = {
    { .frame_id = 0, .designation = "O#",
      .torus_next = { 1, 2, 3, 4, 5, 0 }, .generates = 1,
      .formulation = { .signature = 0x01, .reduction_depth = 2, .dimensionality = 0,
                        .terminal_opcode = OP_VIMARSA_NULL, .core_chain = 0, ._pad = 0,
                        .source = "O# -> Zero Logic -> X#" } },
    { .frame_id = 1, .designation = "X#",
      .torus_next = { 1, 2, 3, 4, 5, 0 }, .generates = 2,
      .formulation = { .signature = 0x02, .reduction_depth = 3, .dimensionality = 1,
                        .terminal_opcode = OP_ILLUMINATE, .core_chain = 0, ._pad = 0,
                        .source = "X# -> Parashakti Logic -> N#" } },
    { .frame_id = 2, .designation = "N#",
      .torus_next = { 1, 2, 3, 4, 5, 0 }, .generates = 3,
      .formulation = { .signature = 0x04, .reduction_depth = 4, .dimensionality = 1,
                        .terminal_opcode = OP_PROVOKE, .core_chain = 0, ._pad = 0,
                        .source = "N# -> Spanda Logic -> M#" } },
    { .frame_id = 3, .designation = "M#",
      .torus_next = { 1, 2, 3, 4, 5, 0 }, .generates = 4,
      .formulation = { .signature = 0x08, .reduction_depth = 5, .dimensionality = 2,
                        .terminal_opcode = OP_WITHHOLD, .core_chain = 0, ._pad = 0,
                        .source = "M# -> Mahamaya -> #" } },
    { .frame_id = 4, .designation = "#",
      .torus_next = { 1, 2, 3, 4, 5, 0 }, .generates = 0xFFu,
      .formulation = { .signature = 0x10, .reduction_depth = 6, .dimensionality = 2,
                        .terminal_opcode = OP_ADD_PRESENCE, .core_chain = 0, ._pad = 0,
                        .source = "# -> Nara Base -> terminal" } },
};

/* =============================================================================
 * FR 2.0.4-H: NARA BRIDGE — 5 entries
 * ============================================================================= */

const Nara_Entry NARA_MSHARP_LUT[5] = {
    { .frame_position = 0, .polarity = NARA_POLARITY_BOTH, .dominant_val = 0, .archetype_role = 0 },
    { .frame_position = 1, .polarity = NARA_POLARITY_YIN,  .dominant_val = 1, .archetype_role = 1 },
    { .frame_position = 2, .polarity = NARA_POLARITY_YANG, .dominant_val = 2, .archetype_role = 2 },
    { .frame_position = 3, .polarity = NARA_POLARITY_YANG, .dominant_val = 3, .archetype_role = 3 },
    { .frame_position = 4, .polarity = NARA_POLARITY_YIN,  .dominant_val = 4, .archetype_role = 4 },
};

/* =============================================================================
 * FR 2.0.5: SIVA-SHAKTI TABLE — 6 operator entries
 * ============================================================================= */

/* Siva operator stubs — signatures match Siva_Operator typedef */
static void siva_op_impressure(struct Holographic_Coordinate* self, void* op)  { (void)self; (void)op; }
static void siva_op_negation(struct Holographic_Coordinate* self, void* op)    { (void)self; (void)op; }
static void siva_op_affirmation(struct Holographic_Coordinate* self, void* op) { (void)self; (void)op; }
static void siva_op_dialogic(struct Holographic_Coordinate* self, void* op)    { (void)self; (void)op; }
static void siva_op_dialectic(struct Holographic_Coordinate* self, void* op)   { (void)self; (void)op; }
static void siva_op_expression(struct Holographic_Coordinate* self, void* op)  { (void)self; (void)op; }

const Siva_Entry SIVA_TABLE[6] = {
    { .symbol = "(0)", .execute = siva_op_impressure,  .cross_logical = 0u, .cross_archetype = 0u },
    { .symbol = "(1)", .execute = siva_op_negation,    .cross_logical = 1u, .cross_archetype = 1u },
    { .symbol = "(2)", .execute = siva_op_affirmation, .cross_logical = 2u, .cross_archetype = 2u },
    { .symbol = "(3)", .execute = siva_op_dialogic,    .cross_logical = 3u, .cross_archetype = 3u },
    { .symbol = "(4)", .execute = siva_op_dialectic,   .cross_logical = 4u, .cross_archetype = 4u },
    { .symbol = "(5)", .execute = siva_op_expression,  .cross_logical = 5u, .cross_archetype = 5u },
};

/* =============================================================================
 * FR 2.0.6: R-FACTOR ROUTE TABLE — 7 route words
 * ============================================================================= */

const R_Factor_Route R_FACTOR_ROUTE_TABLE[R_FACTOR_ROUTE_COUNT] = {
    ROUTE_O_SHARP, ROUTE_X_SHARP, ROUTE_N_SHARP, ROUTE_M_SHARP,
    ROUTE_NARA, ROUTE_SIVA, ROUTE_SHAKTI
};

/* =============================================================================
 * FR 2.0.X: CROSS-BRANCH EDGE REGISTRY + GOVERNING CF
 * ============================================================================= */

const uint8_t M0_GOVERNING_CF[6] = {
    0, /* CF_VOID for #0-0 */
    1, /* CF_BINARY for #0-1 */
    2, /* CF_TRIKA for #0-2 */
    3, /* CF_QUATERNAL for #0-3 */
    4, /* CF_FRACTAL for #0-4 */
    6, /* CF_MOBIUS for #0-5 */
};

const Cross_Branch_Edge M0_CROSS_BRANCH_REGISTRY[M0_CROSS_BRANCH_COUNT] = {
    { .m0_sub_branch = 0, .macro_m_branch = 0, .relation_type = HOLOGRAPHIC_MICRO_IMAGE_REL, .cf_id = 0 },
    { .m0_sub_branch = 1, .macro_m_branch = 1, .relation_type = HOLOGRAPHIC_MICRO_IMAGE_REL, .cf_id = 1 },
    { .m0_sub_branch = 2, .macro_m_branch = 2, .relation_type = HOLOGRAPHIC_MICRO_IMAGE_REL, .cf_id = 2 },
    { .m0_sub_branch = 3, .macro_m_branch = 3, .relation_type = HOLOGRAPHIC_MICRO_IMAGE_REL, .cf_id = 3 },
    { .m0_sub_branch = 4, .macro_m_branch = 4, .relation_type = HOLOGRAPHIC_MICRO_IMAGE_REL, .cf_id = 4 },
    { .m0_sub_branch = 5, .macro_m_branch = 5, .relation_type = HOLOGRAPHIC_MICRO_IMAGE_REL, .cf_id = 6 },
    { .m0_sub_branch = 5, .macro_m_branch = 5, .relation_type = VEILED_BY_SKIN_REL,          .cf_id = 6 },
};

/* =============================================================================
 * M0 INIT / TEARDOWN
 * ============================================================================= */

/* VAK semantic handlers for M0 — implementations below */
static int m0_vak_cpf(Holographic_Coordinate* s, VAK_Instruction i);
static int m0_vak_ct(Holographic_Coordinate* s, VAK_Instruction i);
static int m0_vak_cp(Holographic_Coordinate* s, VAK_Instruction i);
static int m0_vak_cf(Holographic_Coordinate* s, VAK_Instruction i);
static int m0_vak_cfp(Holographic_Coordinate* s, VAK_Instruction i);
static int m0_vak_cs(Holographic_Coordinate* s, VAK_Instruction i);

M0_Root* m0_init(Coordinate_Arena* arena, Holographic_Coordinate* hc) {
    if (!arena || !hc) return NULL;
    if (hc->ql_position != 0) return NULL;  /* M0 anchors to #0 */

    M0_Root* root = (M0_Root*)malloc(sizeof(M0_Root));
    if (!root) return NULL;

    HC_LINK(hc, root);
    root->active_cf = cf_get(CF_VOID);
    root->spanda_state.raw = 0;
    root->active_void_ops = 0;
    root->logos_state = m0_compute_logos_state(0);

    /* Register VAK semantic handlers */
    vak_register_handler(VAK_FAMILY_CPF, m0_vak_cpf);
    vak_register_handler(VAK_FAMILY_CT,  m0_vak_ct);
    vak_register_handler(VAK_FAMILY_CP,  m0_vak_cp);
    vak_register_handler(VAK_FAMILY_CF,  m0_vak_cf);
    vak_register_handler(VAK_FAMILY_CFP, m0_vak_cfp);
    vak_register_handler(VAK_FAMILY_CS,  m0_vak_cs);

    return root;
}

void m0_teardown(M0_Root* root) {
    if (!root) return;
    if (root->hc) HC_UNLINK(root->hc);
    free(root);
}

bool m0_verify_holographic_registry(void) {
    for (uint8_t i = 0; i < 6u; i++) {
        if (M0_GOVERNING_CF[M0_CROSS_BRANCH_REGISTRY[i].m0_sub_branch]
                != M0_CROSS_BRANCH_REGISTRY[i].cf_id) {
            return false;
        }
    }
    return true;
}

/* =============================================================================
 * VAK SEMANTIC HANDLERS — M0's definition of what each family does
 *
 * These implement FR 2.0.13: the Anuttara VM layer interpretation
 * of each reflective coordinate operation.
 * ============================================================================= */

/* CPF: #0-1 layer — set discrimination/inversion */
static int m0_vak_cpf(Holographic_Coordinate* s, VAK_Instruction i) {
    Spanda_Discriminator disc;
    disc.bits.spanda = i.is_inverted ? SPANDA_OR : SPANDA_AND;
    disc.bits.op_masks = i.vak_index & 0x7Fu;
    s->inversion_state = disc.raw;
    return VAK_SUCCESS;
}

/* CT: #0-4 layer — select QL frame */
static int m0_vak_ct(Holographic_Coordinate* s, VAK_Instruction i) {
    if (i.vak_index >= 5) return VAK_ERR_INDEX;
    (void)s; /* frame selection recorded in session context */
    return VAK_SUCCESS;
}

/* CP: #0-2 layer — anchor to void arithmetic position */
static int m0_vak_cp(Holographic_Coordinate* s, VAK_Instruction i) {
    s->weave_state = (float)i.target_pos;
    return VAK_SUCCESS;
}

/* CF: #0-0 layer — invoke Vimarsa operator */
static int m0_vak_cf(Holographic_Coordinate* s, VAK_Instruction i) {
    if (i.vak_index >= VIMARSA_OP_COUNT) return VAK_ERR_INDEX;
    uint8_t siva_idx = i.vak_index % 6u;
    if (SIVA_TABLE[siva_idx].execute) {
        SIVA_TABLE[siva_idx].execute(s, NULL);
    }
    return VAK_SUCCESS;
}

/* CFP: R-factor layer — trace R-factor thread */
static int m0_vak_cfp(Holographic_Coordinate* s, VAK_Instruction i) {
    (void)s;
    if (i.vak_index > 11) return VAK_ERR_INDEX;
    Unified_Logos_State state = m0_compute_logos_state(i.vak_index);
    m0_execute_r_factor_weave(&state);
    return VAK_SUCCESS;
}

/* CS: #0-5/M5 layer — advance Logos pipeline */
static int m0_vak_cs(Holographic_Coordinate* s, VAK_Instruction i) {
    (void)i;
    (void)s;
    /* M5 integration point — stub until M5 is implemented */
    return VAK_SUCCESS;
}

/* =============================================================================
 * FR 2.0.11: R-FACTOR WEAVE DISPATCHER
 * ============================================================================= */

void m0_execute_r_factor_weave(Unified_Logos_State* state) {
    if (!state) return;
    uint8_t r_idx = state->active_r_factor;

    for (uint8_t frame = 0; frame < R_FACTOR_ROUTE_COUNT; frame++) {
        uint8_t pos = GET_R_POS(R_FACTOR_ROUTE_TABLE[frame], r_idx);
        if (pos == 7u) continue;  /* absent from this frame */
        /* Dispatch point: frame + pos + direction available.
         * Full M-branch dispatch deferred until M1-M5 exist.
         * For now, record that the position was touched. */
    }
}

/* =============================================================================
 * CLI DISPATCH
 * ============================================================================= */

int m0_cli_dispatch(int argc, char** argv, M0_Root* root) {
    if (argc < 2 || !root) return -1;

    if (strcmp(argv[1], "info") == 0) {
        printf("[M0 Anuttara] HC position=%u, family=%u, CF=VOID\n",
               root->hc->ql_position, root->hc->family);
        printf("  Spanda state: 0x%02x\n", root->spanda_state.raw);
        printf("  Logos tick: %u (stage=%u, %s)\n",
               root->logos_state.pipeline_tick,
               root->logos_state.current_stage,
               root->logos_state.is_implicate ? "implicate" : "explicate");
        printf("  Vimarsa operators: %d\n", VIMARSA_OP_COUNT);
        printf("  Archetypes: %d (12-fold)\n", ARCHETYPE_LUT_SIZE);
        printf("  QL frames: 5 (O#, X#, N#, M#, #)\n");
        printf("  Siva operators: 6\n");
        printf("  R-factor routes: %d\n", R_FACTOR_ROUTE_COUNT);
        return 0;
    }

    if (strcmp(argv[1], "clock") == 0) {
        uint16_t degree = (argc > 2) ? (uint16_t)atoi(argv[2]) : 0;
        Unified_Clock_State c = m0_read_cosmic_clock(degree);
        printf("[M0 Clock] degree=%u\n", degree);
        printf("  M1 Torus stage: %u\n", c.m1_torus_stage);
        printf("  M2 Decan phase: %u\n", c.m2_decan_phase);
        printf("  M3 Hexagram ID: %u\n", c.m3_hexagram_id);
        printf("  Phase: %s\n", c.is_implicate_phase ? "Implicate" : "Explicate");
        return 0;
    }

    if (strcmp(argv[1], "logos") == 0) {
        uint8_t tick = (argc > 2) ? (uint8_t)atoi(argv[2]) : 0;
        if (tick > 11) tick = 11;
        Unified_Logos_State s = m0_compute_logos_state(tick);
        static const char* act_names[] = {
            "Srishti", "Sthiti", "Samhara",
            "Tirodhana", "Anugraha", "Samavesa"
        };
        printf("[M0 Logos] tick=%u\n", s.pipeline_tick);
        printf("  Stage: %u\n", s.current_stage);
        printf("  Divine Act: %s (R%u)\n", act_names[s.active_divine_act], s.active_r_factor);
        printf("  Phase: %s\n", s.is_implicate ? "Implicate (descending)" : "Explicate (ascending)");
        return 0;
    }

    if (strcmp(argv[1], "vimarsa") == 0) {
        printf("[M0 Vimarsa ISA] 7 operators:\n");
        for (int i = 0; i < VIMARSA_OP_COUNT; i++) {
            printf("  0x%x %s (arity %u)\n",
                   VIMARSA_TABLE[i].opcode,
                   VIMARSA_TABLE[i].symbol,
                   VIMARSA_TABLE[i].arity);
        }
        return 0;
    }

    if (strcmp(argv[1], "archetypes") == 0) {
        printf("[M0 Archetypal Number Language] 12-fold:\n");
        for (int i = 0; i < ARCHETYPE_LUT_SIZE; i++) {
            printf("  [%2d] dim=%uD sub=%u depth=%u src=%s\n",
                   ARCHETYPE_LUT[i].index,
                   ARCHETYPE_LUT[i].dimensionality,
                   ARCHETYPE_LUT[i].sub_table_type,
                   ARCHETYPE_LUT[i].formulation.reduction_depth,
                   ARCHETYPE_LUT[i].formulation.source ? "yes" : "no");
        }
        return 0;
    }

    fprintf(stderr, "[M0] Unknown command: %s\n", argv[1]);
    fprintf(stderr, "Usage: epi-logos m0 {info|clock [deg]|logos [tick]|vimarsa|archetypes}\n");
    return -1;
}
