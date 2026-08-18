use serde::{Deserialize, Serialize};

pub const EXPECTED_ABI_VERSION: u32 = 1;

#[repr(C)]
#[derive(Clone, Copy, Debug, Default)]
struct RawKernelTick {
    cycle: u64,
    sub_tick: u8,
    phase: u8,
    element: u8,
    position6: u8,
    harmonic_ratio: f32,
}

extern "C" {
    fn epi_kernel_bridge_abi_version() -> u32;
    fn epi_kernel_tick_wire(cycle: u64, sub_tick: u8, out_tick: *mut RawKernelTick) -> i32;
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EpiLibKernelWitness {
    pub abi_version: u32,
    pub operation: String,
    pub cycle: u64,
    pub sub_tick: u8,
    pub phase: u8,
    pub element: u8,
    pub position6: u8,
    pub harmonic_ratio: f32,
}

pub fn kernel_tick(cycle: u64, sub_tick: u8) -> Result<EpiLibKernelWitness, String> {
    let abi_version = unsafe { epi_kernel_bridge_abi_version() };
    if abi_version != EXPECTED_ABI_VERSION {
        return Err(format!(
            "unsupported epi-lib primitive bridge ABI {abi_version}; expected {EXPECTED_ABI_VERSION}"
        ));
    }

    let mut raw = RawKernelTick::default();
    let ok = unsafe { epi_kernel_tick_wire(cycle, sub_tick, &mut raw) };
    if ok != 1 {
        return Err("epi-lib kernel tick bridge rejected output pointer".to_owned());
    }

    Ok(EpiLibKernelWitness {
        abi_version,
        operation: "epi-lib::kernel_tick_from_epogdoon via epi_kernel_tick_wire".to_owned(),
        cycle: raw.cycle,
        sub_tick: raw.sub_tick,
        phase: raw.phase,
        element: raw.element,
        position6: raw.position6,
        harmonic_ratio: raw.harmonic_ratio,
    })
}
