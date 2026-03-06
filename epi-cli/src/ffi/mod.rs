//! FFI bindings to libepilogos.so — the C shared library

pub mod tagged;

use libc::c_void;
use libloading::{Library, Symbol};
use std::path::Path;

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
    pub p: *mut HolographicCoordinate,
    pub s: *mut HolographicCoordinate,
    pub t: *mut HolographicCoordinate,
    pub m: *mut HolographicCoordinate,
    pub l: *mut HolographicCoordinate,
    pub c: *mut HolographicCoordinate,
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
    None = 0,
    P = 1, // Position
    S = 2, // Stack
    T = 3, // Thought
    M = 4, // Map (Bimba)
    L = 5, // Lens
    C = 6, // Category
}

impl CoordinateFamily {
    pub fn from_u8(v: u8) -> Self {
        match v {
            0 => Self::None,
            1 => Self::P,
            2 => Self::S,
            3 => Self::T,
            4 => Self::M,
            5 => Self::L,
            6 => Self::C,
            _ => Self::None,
        }
    }

    pub fn name(&self) -> &'static str {
        match self {
            Self::None => "None (Raw Psychoid)",
            Self::P => "P (Position)",
            Self::S => "S (Stack)",
            Self::T => "T (Thought)",
            Self::M => "M (Map/Bimba)",
            Self::L => "L (Lens)",
            Self::C => "C (Category)",
        }
    }

    pub fn letter(&self) -> &'static str {
        match self {
            Self::None => "#",
            Self::P => "P",
            Self::S => "S",
            Self::T => "T",
            Self::M => "M",
            Self::L => "L",
            Self::C => "C",
        }
    }
}

/// Safe wrapper around the loaded C library
pub struct EpiLib {
    _lib: Library,
    // .rodata pointers (static lifetime from the shared lib)
    pub psychoid_0: *const HolographicCoordinate,
    pub psychoid_1: *const HolographicCoordinate,
    pub psychoid_2: *const HolographicCoordinate,
    pub psychoid_3: *const HolographicCoordinate,
    pub psychoid_4: *const HolographicCoordinate,
    pub psychoid_5: *const HolographicCoordinate,
    pub psychoid_hash: *const HolographicCoordinate,
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
    // Function pointers
    arena_init_fn: unsafe extern "C" fn(*mut CoordinateArena, u32) -> i32,
    arena_alloc_fn: unsafe extern "C" fn(*mut CoordinateArena) -> *mut HolographicCoordinate,
    arena_destroy_fn: unsafe extern "C" fn(*mut CoordinateArena),
    families_init_fn:
        unsafe extern "C" fn(*mut CoordinateArena, *mut *mut HolographicCoordinate) -> i32,
    families_crosslink_fn: unsafe extern "C" fn(*mut CoordinateArena) -> i32,
    families_wire_reflective_fn: unsafe extern "C" fn(*mut CoordinateArena) -> i32,
    engine_torus_walk_fn: unsafe extern "C" fn(*const HolographicCoordinate, *mut c_void, u32),
    engine_double_covering_fn: unsafe extern "C" fn(*const HolographicCoordinate, *mut c_void),
    execute_hash_fn: unsafe extern "C" fn(*mut HolographicCoordinate, *mut c_void),
}

impl EpiLib {
    /// Load libepilogos.so and resolve all symbols
    pub fn load(lib_path: &Path) -> color_eyre::Result<Self> {
        unsafe {
            let lib = Library::new(lib_path)?;

            // Resolve .rodata symbols
            let psychoid_0: Symbol<*const HolographicCoordinate> = lib.get(b"Psychoid_0")?;
            let psychoid_1: Symbol<*const HolographicCoordinate> = lib.get(b"Psychoid_1")?;
            let psychoid_2: Symbol<*const HolographicCoordinate> = lib.get(b"Psychoid_2")?;
            let psychoid_3: Symbol<*const HolographicCoordinate> = lib.get(b"Psychoid_3")?;
            let psychoid_4: Symbol<*const HolographicCoordinate> = lib.get(b"Psychoid_4")?;
            let psychoid_5: Symbol<*const HolographicCoordinate> = lib.get(b"Psychoid_5")?;
            let psychoid_hash: Symbol<*const HolographicCoordinate> = lib.get(b"Psychoid_Hash")?;
            let weave_0_5: Symbol<*const HolographicCoordinate> = lib.get(b"Weave_0_5")?;
            let weave_5_0: Symbol<*const HolographicCoordinate> = lib.get(b"Weave_5_0")?;
            let weave_5_5: Symbol<*const HolographicCoordinate> = lib.get(b"Weave_5_5")?;
            let cf_0000: Symbol<*const HolographicCoordinate> = lib.get(b"CF_0000")?;
            let cf_01: Symbol<*const HolographicCoordinate> = lib.get(b"CF_01")?;
            let cf_012: Symbol<*const HolographicCoordinate> = lib.get(b"CF_012")?;
            let cf_0123: Symbol<*const HolographicCoordinate> = lib.get(b"CF_0123")?;
            let cf_4x: Symbol<*const HolographicCoordinate> = lib.get(b"CF_4x")?;
            let cf_450: Symbol<*const HolographicCoordinate> = lib.get(b"CF_450")?;
            let cf_50: Symbol<*const HolographicCoordinate> = lib.get(b"CF_50")?;

            // Resolve function symbols
            let arena_init_fn: Symbol<unsafe extern "C" fn(*mut CoordinateArena, u32) -> i32> =
                lib.get(b"arena_init")?;
            let arena_alloc_fn: Symbol<
                unsafe extern "C" fn(*mut CoordinateArena) -> *mut HolographicCoordinate,
            > = lib.get(b"arena_alloc")?;
            let arena_destroy_fn: Symbol<unsafe extern "C" fn(*mut CoordinateArena)> =
                lib.get(b"arena_destroy")?;
            let families_init_fn: Symbol<
                unsafe extern "C" fn(*mut CoordinateArena, *mut *mut HolographicCoordinate) -> i32,
            > = lib.get(b"families_init")?;
            let families_crosslink_fn: Symbol<unsafe extern "C" fn(*mut CoordinateArena) -> i32> =
                lib.get(b"families_crosslink")?;
            let families_wire_reflective_fn: Symbol<
                unsafe extern "C" fn(*mut CoordinateArena) -> i32,
            > = lib.get(b"families_wire_reflective")?;
            let engine_torus_walk_fn: Symbol<
                unsafe extern "C" fn(*const HolographicCoordinate, *mut c_void, u32),
            > = lib.get(b"engine_torus_walk")?;
            let engine_double_covering_fn: Symbol<
                unsafe extern "C" fn(*const HolographicCoordinate, *mut c_void),
            > = lib.get(b"engine_double_covering")?;
            let execute_hash_fn: Symbol<
                unsafe extern "C" fn(*mut HolographicCoordinate, *mut c_void),
            > = lib.get(b"Execute_Hash")?;

            Ok(Self {
                psychoid_0: *psychoid_0,
                psychoid_1: *psychoid_1,
                psychoid_2: *psychoid_2,
                psychoid_3: *psychoid_3,
                psychoid_4: *psychoid_4,
                psychoid_5: *psychoid_5,
                psychoid_hash: *psychoid_hash,
                weave_0_5: *weave_0_5,
                weave_5_0: *weave_5_0,
                weave_5_5: *weave_5_5,
                cf_0000: *cf_0000,
                cf_01: *cf_01,
                cf_012: *cf_012,
                cf_0123: *cf_0123,
                cf_4x: *cf_4x,
                cf_450: *cf_450,
                cf_50: *cf_50,
                arena_init_fn: *arena_init_fn,
                arena_alloc_fn: *arena_alloc_fn,
                arena_destroy_fn: *arena_destroy_fn,
                families_init_fn: *families_init_fn,
                families_crosslink_fn: *families_crosslink_fn,
                families_wire_reflective_fn: *families_wire_reflective_fn,
                engine_torus_walk_fn: *engine_torus_walk_fn,
                engine_double_covering_fn: *engine_double_covering_fn,
                execute_hash_fn: *execute_hash_fn,
                _lib: lib,
            })
        }
    }

    /// Get all 17 BIMBA entities as (name, pointer) pairs
    pub fn all_bimba(&self) -> Vec<(&'static str, *const HolographicCoordinate)> {
        vec![
            ("#0 Ground", self.psychoid_0),
            ("#1 Form", self.psychoid_1),
            ("#2 Operation", self.psychoid_2),
            ("#3 Pattern", self.psychoid_3),
            ("#4 Context", self.psychoid_4),
            ("#5 Integration", self.psychoid_5),
            ("# Hash", self.psychoid_hash),
            ("Weave 0.5", self.weave_0_5),
            ("Weave 5.0", self.weave_5_0),
            ("Weave 5.5", self.weave_5_5),
            ("CF(0000)", self.cf_0000),
            ("CF(01)", self.cf_01),
            ("CF(012)", self.cf_012),
            ("CF(0123)", self.cf_0123),
            ("CF(4x)", self.cf_4x),
            ("CF(450)", self.cf_450),
            ("CF(50)", self.cf_50),
        ]
    }

    /// Get psychoid by position (0-5), or Hash (0xFF)
    pub fn psychoid(&self, pos: u8) -> Option<*const HolographicCoordinate> {
        match pos {
            0 => Some(self.psychoid_0),
            1 => Some(self.psychoid_1),
            2 => Some(self.psychoid_2),
            3 => Some(self.psychoid_3),
            4 => Some(self.psychoid_4),
            5 => Some(self.psychoid_5),
            0xFF => Some(self.psychoid_hash),
            _ => None,
        }
    }

    // Safe wrappers for C functions

    pub fn arena_init(&self, arena: &mut CoordinateArena, capacity: u32) -> i32 {
        unsafe { (self.arena_init_fn)(arena as *mut _, capacity) }
    }

    pub fn arena_alloc(&self, arena: &mut CoordinateArena) -> *mut HolographicCoordinate {
        unsafe { (self.arena_alloc_fn)(arena as *mut _) }
    }

    pub fn arena_destroy(&self, arena: &mut CoordinateArena) {
        unsafe { (self.arena_destroy_fn)(arena as *mut _) }
    }

    pub fn families_init(
        &self,
        arena: &mut CoordinateArena,
        mirrors: &mut [*mut HolographicCoordinate; 6],
    ) -> i32 {
        unsafe { (self.families_init_fn)(arena as *mut _, mirrors.as_mut_ptr()) }
    }

    pub fn families_crosslink(&self, arena: &mut CoordinateArena) -> i32 {
        unsafe { (self.families_crosslink_fn)(arena as *mut _) }
    }

    pub fn families_wire_reflective(&self, arena: &mut CoordinateArena) -> i32 {
        unsafe { (self.families_wire_reflective_fn)(arena as *mut _) }
    }

    pub fn torus_walk(
        &self,
        start: *const HolographicCoordinate,
        ctx: &mut WalkContext,
        steps: u32,
    ) {
        unsafe { (self.engine_torus_walk_fn)(start, ctx as *mut WalkContext as *mut c_void, steps) }
    }

    pub fn double_covering(&self, start: *const HolographicCoordinate, ctx: &mut WalkContext) {
        unsafe { (self.engine_double_covering_fn)(start, ctx as *mut WalkContext as *mut c_void) }
    }

    pub fn execute_hash(&self, target: &mut HolographicCoordinate) {
        unsafe {
            (self.execute_hash_fn)(
                self.psychoid_hash as *mut HolographicCoordinate,
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
            p: ptr_info(hc.p),
            s: ptr_info(hc.s),
            t: ptr_info(hc.t),
            m: ptr_info(hc.m),
            l: ptr_info(hc.l),
            c: ptr_info(hc.c),
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
    pub p: PtrInfo,
    pub s: PtrInfo,
    pub t: PtrInfo,
    pub m: PtrInfo,
    pub l: PtrInfo,
    pub c: PtrInfo,
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
