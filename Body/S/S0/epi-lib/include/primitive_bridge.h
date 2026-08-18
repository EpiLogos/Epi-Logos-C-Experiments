/**
 * primitive_bridge.h — stable C ABI for the Epi Pratibimba primitive bridge.
 *
 * This is deliberately smaller than the full epi-lib ontology. It exposes
 * existing kernel computation in an FFI-safe shape so consumers can prove they
 * are calling the real C kernel without copying its rules into another runtime.
 */
#ifndef EPI_PRIMITIVE_BRIDGE_H
#define EPI_PRIMITIVE_BRIDGE_H

#include <stdint.h>

#define EPI_KERNEL_BRIDGE_ABI_VERSION 1u

typedef struct {
    uint64_t cycle;
    uint8_t sub_tick;
    uint8_t phase;
    uint8_t element;
    uint8_t position6;
    float harmonic_ratio;
} Epi_Kernel_Tick_Wire;

uint32_t epi_kernel_bridge_abi_version(void);
int epi_kernel_tick_wire(
    uint64_t cycle,
    uint8_t sub_tick,
    Epi_Kernel_Tick_Wire* out_tick
);

#endif /* EPI_PRIMITIVE_BRIDGE_H */
