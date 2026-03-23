/**
 * test_m2_planets.c — Canonical Planet Order + EarthBodyState Verification
 *
 * Verifies:
 *   1. PLANET_SUN == 0  (canonical mod-10 root)
 *   2. PLANET_PLUTO == 9  (canonical mod-10 terminus)
 *   3. PLANET_URANUS == 7  (canonical mod-10 transpersonal slot)
 *   4. planet_degrees array in M4_Temporal_Now == 10 slots
 *   5. EarthBodyState exists with chakra_id field
 *   6. CHAKRA_EARTH == 0  (geocentric ground anchor)
 *
 * Source: 00-canonical-invariants.md §2, §5; MEMORY.md (2026-03-16)
 */

#include "m2.h"
#include "m4.h"
#include <stdio.h>
#include <assert.h>

static int tp = 0, tr = 0;
#define TEST(n) do { tr++; printf("  [%d] %s... ", tr, #n);
#define PASS tp++; printf("OK\n"); } while(0)

int main(void) {
    printf("=== M2 Planet Canonical Order + EarthBodyState Tests ===\n");

    /* T1: PLANET_SUN is the canonical root (mod-10 index 0) */
    TEST(planet_sun_is_zero) {
        assert(PLANET_SUN == 0);
    } PASS;

    /* T2: PLANET_PLUTO is the canonical terminus (mod-10 index 9) */
    TEST(planet_pluto_is_nine) {
        assert(PLANET_PLUTO == 9);
    } PASS;

    /* T3: PLANET_URANUS occupies canonical transpersonal slot 7
     * NOTE: Until full LUT reorder (deferred per 00-canonical-invariants §2 migration note),
     * PLANET_URANUS aliases PLANET_MARS (both value 7). */
    TEST(planet_uranus_is_seven) {
        assert(PLANET_URANUS == 7);
    } PASS;

    /* T4: M4_Temporal_Now.planet_degrees holds exactly 10 slots (mod-10 planet array) */
    TEST(temporal_now_planet_degrees_is_ten) {
        M4_Temporal_Now now = m4_snapshot_now(0, 0);
        assert(sizeof(now.planet_degrees) == 10 * sizeof(now.planet_degrees[0]));
        assert(sizeof(now.planet_degrees) / sizeof(now.planet_degrees[0]) == 10);
    } PASS;

    /* T5: EarthBodyState exists and has a chakra_id field */
    TEST(earth_body_state_exists) {
        EarthBodyState earth;
        earth.chakra_id  = (uint8_t)CHAKRA_EARTH;
        earth.activation = 1.0f;
        earth.reserved   = 0;
        assert(earth.chakra_id == 0);
        assert(earth.activation == 1.0f);
    } PASS;

    /* T6: CHAKRA_EARTH == 0 (geocentric ground anchor, same as Muladhara base) */
    TEST(chakra_earth_is_zero) {
        assert((int)CHAKRA_EARTH == 0);
    } PASS;

    /* T7: M2_PLANET_COUNT matches expected 10 */
    TEST(planet_count_is_ten) {
        assert(M2_PLANET_COUNT == 10u);
    } PASS;

    printf("\n=== Planet Canonical Tests: %d/%d passed ===\n", tp, tr);
    return (tp == tr) ? 0 : 1;
}
