#include "primitive_bridge.h"
#include "kernel.h"

uint32_t epi_kernel_bridge_abi_version(void) {
    return EPI_KERNEL_BRIDGE_ABI_VERSION;
}

int epi_kernel_tick_wire(
    uint64_t cycle,
    uint8_t sub_tick,
    Epi_Kernel_Tick_Wire* out_tick
) {
    if (!out_tick) {
        return 0;
    }

    Kernel_Tick tick = kernel_tick_from_epogdoon(cycle, sub_tick);
    out_tick->cycle = tick.cycle;
    out_tick->sub_tick = tick.sub_tick;
    out_tick->phase = (uint8_t)tick.phase;
    out_tick->element = (uint8_t)tick.element;
    out_tick->position6 = tick.position6;
    out_tick->harmonic_ratio = tick.harmonic_ratio;
    return 1;
}
