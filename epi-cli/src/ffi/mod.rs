//! FFI bindings to libepilogos — statically linked C library

pub mod m1;
pub mod m2;
pub mod nara;
pub mod tagged;

use libc::c_void;

/// Mirror of C Holographic_Coordinate — 128 bytes, repr(C)
#[repr(C)]
#[derive(Debug)]
pub struct HolographicCoordinate {
    // Identity (8 bytes)
    pub ql_position: u8,
    pub family: u8,
    pub inversion_state: u8,
    pub flags: u8,
    pub weave_state: f32,

    // Tensor Anchor (8 bytes)
    pub semantic_embedding: *mut f32,

    // Intra-Openness: 6 Base + 6 Reflective (96 bytes)
    pub c: *mut HolographicCoordinate,
    pub p: *mut HolographicCoordinate,
    pub l: *mut HolographicCoordinate,
    pub s: *mut HolographicCoordinate,
    pub t: *mut HolographicCoordinate,
    pub m: *mut HolographicCoordinate,
    pub cpf: *mut HolographicCoordinate,
    pub ct: *mut HolographicCoordinate,
    pub cp: *mut HolographicCoordinate,
    pub cf: *mut HolographicCoordinate,
    pub cfp: *mut HolographicCoordinate,
    pub cs: *mut HolographicCoordinate,

    // Execution (8 bytes)
    pub invoke_process: Option<unsafe extern "C" fn(*mut HolographicCoordinate, *mut c_void)>,

    // Payload (8 bytes) — treat as opaque
    pub payload: u64,
}

/// Mirror of C Coordinate_Arena
#[repr(C)]
pub struct CoordinateArena {
    pub slots: *mut HolographicCoordinate,
    pub capacity: u32,
    pub count: u32,
}

/// Mirror of C Walk_Context
#[repr(C)]
#[derive(Debug, Default, Clone)]
pub struct WalkContext {
    pub current_position: u8,
    pub covering: u8,
    pub step_count: u32,
    pub cycle_count: u32,
    pub accumulator: *mut c_void,
}

impl serde::Serialize for WalkContext {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        use serde::ser::SerializeStruct;
        let mut state = serializer.serialize_struct("WalkContext", 4)?;
        state.serialize_field("current_position", &self.current_position)?;
        state.serialize_field("covering", &self.covering)?;
        state.serialize_field("step_count", &self.step_count)?;
        state.serialize_field("cycle_count", &self.cycle_count)?;
        state.end()
    }
}

// Walk_Context contains a raw pointer, but we only use it from the main thread
unsafe impl Send for WalkContext {}

/// Family enum values — mirrors C Coordinate_Family
#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Serialize)]
#[repr(u8)]
pub enum CoordinateFamily {
    C = 0,    // Category  — #0
    P = 1,    // Position  — #1
    L = 2,    // Lens      — #2
    S = 3,    // Stack     — #3
    T = 4,    // Thought   — #4
    M = 5,    // Map (Bimba) — #5
    None = 7, // Raw psychoid — pre-categorical
}

impl CoordinateFamily {
    pub fn from_u8(v: u8) -> Self {
        match v {
            0 => Self::C,
            1 => Self::P,
            2 => Self::L,
            3 => Self::S,
            4 => Self::T,
            5 => Self::M,
            7 => Self::None,
            _ => Self::None,
        }
    }

    pub fn name(&self) -> &'static str {
        match self {
            Self::C => "C (Category)",
            Self::P => "P (Position)",
            Self::L => "L (Lens)",
            Self::S => "S (Stack)",
            Self::T => "T (Thought)",
            Self::M => "M (Map/Bimba)",
            Self::None => "None (Raw Psychoid)",
        }
    }

    pub fn letter(&self) -> &'static str {
        match self {
            Self::C => "C",
            Self::P => "P",
            Self::L => "L",
            Self::S => "S",
            Self::T => "T",
            Self::M => "M",
            Self::None => "#",
        }
    }
}

// ─── Static extern C declarations ───────────────────────────────────────────

extern "C" {
    // .rodata psychoids
    pub static Psychoid_0: HolographicCoordinate;
    pub static Psychoid_1: HolographicCoordinate;
    pub static Psychoid_2: HolographicCoordinate;
    pub static Psychoid_3: HolographicCoordinate;
    pub static Psychoid_4: HolographicCoordinate;
    pub static Psychoid_5: HolographicCoordinate;
    pub static Psychoid_Hash: HolographicCoordinate;
    // .rodata weaves
    pub static Weave_0_0: HolographicCoordinate;
    pub static Weave_0_5: HolographicCoordinate;
    pub static Weave_5_0: HolographicCoordinate;
    pub static Weave_5_5: HolographicCoordinate;
    // .rodata CF roots
    pub static CF_0000: HolographicCoordinate;
    pub static CF_01: HolographicCoordinate;
    pub static CF_012: HolographicCoordinate;
    pub static CF_0123: HolographicCoordinate;
    pub static CF_4x: HolographicCoordinate;
    pub static CF_450: HolographicCoordinate;
    pub static CF_50: HolographicCoordinate;

    // Pillar I functions
    pub fn arena_init(arena: *mut CoordinateArena, cap: u32) -> i32;
    pub fn arena_alloc(arena: *mut CoordinateArena) -> *mut HolographicCoordinate;
    pub fn arena_destroy(arena: *mut CoordinateArena);
    pub fn families_init(
        arena: *mut CoordinateArena,
        mirrors: *mut *mut HolographicCoordinate,
    ) -> i32;
    pub fn families_crosslink(arena: *mut CoordinateArena) -> i32;
    pub fn families_wire_reflective(arena: *mut CoordinateArena) -> i32;
    pub fn engine_torus_walk(start: *const HolographicCoordinate, ctx: *mut c_void, steps: u32);
    pub fn engine_double_covering(start: *const HolographicCoordinate, ctx: *mut c_void);
    pub fn Execute_Hash(hc: *mut HolographicCoordinate, target: *mut c_void);

    // M5 API
    pub fn m5_init(arena: *mut CoordinateArena, hc: *mut HolographicCoordinate) -> *mut c_void;
    pub fn m5_advance_logos(root: *mut c_void) -> M5LogosState;
    pub fn m5_lookup(root: *const c_void, coord_id: u16, granularity: u8) -> *const libc::c_char;
    pub fn m5_teardown(root: *mut c_void);
    pub fn m5_verify() -> bool;

    // M5 Logos stage names
    pub static M5_LOGOS_STAGE_NAMES: [*const libc::c_char; 6];
}

/// Mirror of C Unified_Logos_State
#[repr(C)]
#[derive(Debug, Clone, Copy)]
pub struct M5LogosState {
    pub pipeline_tick: u8,
    pub current_stage: u8,
    pub active_divine_act: u8,
    pub is_implicate: bool,
    pub active_r_factor: u8,
}

/// Zero-cost wrapper — provides safe access to statically linked C symbols
pub struct EpiLib {
    // Accessors as public fields for backwards compat with call sites
    pub psychoid_0: *const HolographicCoordinate,
    pub psychoid_1: *const HolographicCoordinate,
    pub psychoid_2: *const HolographicCoordinate,
    pub psychoid_3: *const HolographicCoordinate,
    pub psychoid_4: *const HolographicCoordinate,
    pub psychoid_5: *const HolographicCoordinate,
    pub psychoid_hash: *const HolographicCoordinate,
    pub weave_0_0: *const HolographicCoordinate,
    pub weave_0_5: *const HolographicCoordinate,
    pub weave_5_0: *const HolographicCoordinate,
    pub weave_5_5: *const HolographicCoordinate,
    pub cf_0000: *const HolographicCoordinate,
    pub cf_01: *const HolographicCoordinate,
    pub cf_012: *const HolographicCoordinate,
    pub cf_0123: *const HolographicCoordinate,
    pub cf_4x: *const HolographicCoordinate,
    pub cf_450: *const HolographicCoordinate,
    pub cf_50: *const HolographicCoordinate,
}

impl EpiLib {
    pub fn new() -> Self {
        unsafe {
            EpiLib {
                psychoid_0: &Psychoid_0,
                psychoid_1: &Psychoid_1,
                psychoid_2: &Psychoid_2,
                psychoid_3: &Psychoid_3,
                psychoid_4: &Psychoid_4,
                psychoid_5: &Psychoid_5,
                psychoid_hash: &Psychoid_Hash,
                weave_0_0: &Weave_0_0,
                weave_0_5: &Weave_0_5,
                weave_5_0: &Weave_5_0,
                weave_5_5: &Weave_5_5,
                cf_0000: &CF_0000,
                cf_01: &CF_01,
                cf_012: &CF_012,
                cf_0123: &CF_0123,
                cf_4x: &CF_4x,
                cf_450: &CF_450,
                cf_50: &CF_50,
            }
        }
    }

    /// Get all 18 BIMBA entities as (name, pointer) pairs
    pub fn all_bimba(&self) -> Vec<(&'static str, *const HolographicCoordinate)> {
        unsafe {
            vec![
                ("#0 Ground", &Psychoid_0),
                ("#1 Form", &Psychoid_1),
                ("#2 Operation", &Psychoid_2),
                ("#3 Pattern", &Psychoid_3),
                ("#4 Context", &Psychoid_4),
                ("#5 Integration", &Psychoid_5),
                ("# Hash", &Psychoid_Hash),
                ("Weave 0.0", &Weave_0_0),
                ("Weave 0.5", &Weave_0_5),
                ("Weave 5.0", &Weave_5_0),
                ("Weave 5.5", &Weave_5_5),
                ("CF(0000)", &CF_0000),
                ("CF(01)", &CF_01),
                ("CF(012)", &CF_012),
                ("CF(0123)", &CF_0123),
                ("CF(4x)", &CF_4x),
                ("CF(450)", &CF_450),
                ("CF(50)", &CF_50),
            ]
        }
    }

    /// Get psychoid by position (0-5), or Hash (0xFF)
    pub fn psychoid(&self, pos: u8) -> Option<*const HolographicCoordinate> {
        unsafe {
            match pos {
                0 => Some(&Psychoid_0),
                1 => Some(&Psychoid_1),
                2 => Some(&Psychoid_2),
                3 => Some(&Psychoid_3),
                4 => Some(&Psychoid_4),
                5 => Some(&Psychoid_5),
                0xFF => Some(&Psychoid_Hash),
                _ => None,
            }
        }
    }

    // Safe wrappers for C functions

    pub fn arena_init(&self, arena: &mut CoordinateArena, capacity: u32) -> i32 {
        unsafe { crate::ffi::arena_init(arena as *mut _, capacity) }
    }

    pub fn arena_alloc(&self, arena: &mut CoordinateArena) -> *mut HolographicCoordinate {
        unsafe { crate::ffi::arena_alloc(arena as *mut _) }
    }

    pub fn arena_destroy(&self, arena: &mut CoordinateArena) {
        unsafe { crate::ffi::arena_destroy(arena as *mut _) }
    }

    pub fn families_init(
        &self,
        arena: &mut CoordinateArena,
        mirrors: &mut [*mut HolographicCoordinate; 6],
    ) -> i32 {
        unsafe { crate::ffi::families_init(arena as *mut _, mirrors.as_mut_ptr()) }
    }

    pub fn families_crosslink(&self, arena: &mut CoordinateArena) -> i32 {
        unsafe { crate::ffi::families_crosslink(arena as *mut _) }
    }

    pub fn families_wire_reflective(&self, arena: &mut CoordinateArena) -> i32 {
        unsafe { crate::ffi::families_wire_reflective(arena as *mut _) }
    }

    pub fn torus_walk(
        &self,
        start: *const HolographicCoordinate,
        ctx: &mut WalkContext,
        steps: u32,
    ) {
        unsafe { engine_torus_walk(start, ctx as *mut WalkContext as *mut c_void, steps) }
    }

    pub fn double_covering(&self, start: *const HolographicCoordinate, ctx: &mut WalkContext) {
        unsafe { engine_double_covering(start, ctx as *mut WalkContext as *mut c_void) }
    }

    pub fn execute_hash(&self, target: &mut HolographicCoordinate) {
        unsafe {
            Execute_Hash(
                &Psychoid_Hash as *const _ as *mut HolographicCoordinate,
                target as *mut HolographicCoordinate as *mut c_void,
            )
        }
    }
}

/// Read a coordinate's fields safely
pub fn read_coord(ptr: *const HolographicCoordinate) -> Option<CoordSnapshot> {
    if ptr.is_null() {
        return None;
    }
    unsafe {
        let hc = &*ptr;
        Some(CoordSnapshot {
            ql_position: hc.ql_position,
            family: CoordinateFamily::from_u8(hc.family),
            inversion_state: hc.inversion_state,
            flags: hc.flags,
            weave_state: hc.weave_state,
            has_invoke: hc.invoke_process.is_some(),
            // Pointer web
            c: ptr_info(hc.c),
            p: ptr_info(hc.p),
            l: ptr_info(hc.l),
            s: ptr_info(hc.s),
            t: ptr_info(hc.t),
            m: ptr_info(hc.m),
            cpf: ptr_info(hc.cpf),
            ct: ptr_info(hc.ct),
            cp: ptr_info(hc.cp),
            cf: ptr_info(hc.cf),
            cfp: ptr_info(hc.cfp),
            cs: ptr_info(hc.cs),
        })
    }
}

fn ptr_info(ptr: *mut HolographicCoordinate) -> PtrInfo {
    if ptr.is_null() {
        PtrInfo {
            is_null: true,
            tags: tagged::TagInfo {
                inverted: false,
                nesting: false,
                branching: false,
                executing: false,
                family_bits: 0,
                arch_bits: 0,
            },
            target_position: 0,
            target_family: 0,
        }
    } else {
        let tags = tagged::decode_tags(ptr as *const _);
        let clean = tagged::get_ptr(ptr as *const _);
        let (tp, tf) = if !clean.is_null() {
            unsafe { ((*clean).ql_position, (*clean).family) }
        } else {
            (0, 0)
        };
        PtrInfo {
            is_null: false,
            tags,
            target_position: tp,
            target_family: tf,
        }
    }
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct CoordSnapshot {
    pub ql_position: u8,
    pub family: CoordinateFamily,
    pub inversion_state: u8,
    pub flags: u8,
    pub weave_state: f32,
    pub has_invoke: bool,
    pub c: PtrInfo,
    pub p: PtrInfo,
    pub l: PtrInfo,
    pub s: PtrInfo,
    pub t: PtrInfo,
    pub m: PtrInfo,
    pub cpf: PtrInfo,
    pub ct: PtrInfo,
    pub cp: PtrInfo,
    pub cf: PtrInfo,
    pub cfp: PtrInfo,
    pub cs: PtrInfo,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct PtrInfo {
    pub is_null: bool,
    pub tags: tagged::TagInfo,
    pub target_position: u8,
    pub target_family: u8,
}

impl PtrInfo {
    pub fn display(&self) -> String {
        if self.is_null {
            "(null)".to_string()
        } else {
            let family = CoordinateFamily::from_u8(self.target_family);
            let op = tagged::operator_symbol(&self.tags);
            let pos = if self.target_position == 0xFF {
                "#".to_string()
            } else {
                format!("{}", self.target_position)
            };
            format!(
                "{}{} [{}]",
                family.letter(),
                pos,
                if op.is_empty() { "direct" } else { op }
            )
        }
    }
}
