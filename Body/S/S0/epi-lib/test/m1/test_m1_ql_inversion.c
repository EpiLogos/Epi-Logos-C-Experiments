#include "m1.h"
#include <ql/primitive.h>

#include <assert.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>

int main(void) {
    assert(strcmp(ql_c_api_version(), "0.1.0") == 0);

    for (uint8_t stage = 0u; stage < 6u; stage++) {
        uint8_t native_inverse = ql_position_invert(stage);
        assert(native_inverse == QL_INVERT[stage]);
        assert(native_inverse == QL_FLOWERING[stage].inverse);
        assert(ql_position_invert(native_inverse) == stage);
    }

    assert(ql_position_invert(6u) == QL_INVALID_U8);
    assert(ql_position_invert(QL_INVALID_U8) == QL_INVALID_U8);

    printf("M1 #1-4.2 -> ql_position_invert parity: PASS (all six + involution + boundaries)\n");
    return 0;
}
