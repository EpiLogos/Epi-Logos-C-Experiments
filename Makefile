CC      = clang
CFLAGS  = -std=c11 -Wall -Wextra -Werror -pedantic -Iepi-lib/include -Ivendor/blake3
BLAKE3  = -DBLAKE3_NO_SSE2 -DBLAKE3_NO_SSE41 -DBLAKE3_NO_AVX2 -DBLAKE3_NO_AVX512
LDFLAGS =
SANFLAGS = -fsanitize=address,undefined -g -O0
RUST_MANIFEST = epi-cli/Cargo.toml
RUST_TARGET_DIR ?= /tmp/epi-logos-cargo-target
RUST_LEGACY_TARGET_DIR := $(if $(TMPDIR),$(TMPDIR)/epi-logos-cargo-target,)
RUST_TEST_ARGS ?=

# Source groups (epi-lib/)
PILLAR_SRC = epi-lib/src/psychoid_numbers.c epi-lib/src/engine.c epi-lib/src/arena.c epi-lib/src/families.c
M_SRC      = epi-lib/src/m0.c epi-lib/src/m1.c epi-lib/src/m2.c epi-lib/src/m3.c epi-lib/src/m4.c epi-lib/src/m5.c
BLAKE3_SRC = vendor/blake3/blake3.c vendor/blake3/blake3_dispatch.c vendor/blake3/blake3_portable.c
LIB_SRC    = $(PILLAR_SRC) $(M_SRC) $(BLAKE3_SRC)
ALL_SRC    = $(LIB_SRC) epi-lib/src/main.c

BIN = epi-logos

# Test suites
TESTS = test_m0_init test_m0_rfactor test_m1 test_m2 test_m3 test_m4 test_m5 test_pillar1 test_vak

.PHONY: all lib test debug clean rust-test rust-clean rust-target-size $(TESTS)

all: $(BIN)

$(BIN): $(ALL_SRC)
	$(CC) $(CFLAGS) $(BLAKE3) -O2 -o $@ $^ $(LDFLAGS)

lib: libepilogos.a

libepilogos.a: $(LIB_SRC)
	$(CC) $(CFLAGS) $(BLAKE3) -O2 -c $(PILLAR_SRC) $(M_SRC)
	$(CC) $(CFLAGS) $(BLAKE3) -O2 -c $(BLAKE3_SRC)
	ar rcs $@ *.o
	rm -f *.o

debug: $(ALL_SRC)
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $(BIN) $^ $(LDFLAGS)

# Individual test targets (test files in epi-lib/test/{module}/)
test_m0_init: $(LIB_SRC) epi-lib/test/m0/test_m0_init.c
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^ && ./$@

test_m0_rfactor: $(LIB_SRC) epi-lib/test/m0/test_m0_rfactor.c
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^ && ./$@

test_m1: $(LIB_SRC) epi-lib/test/m1/test_m1.c
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^ -lm && ./$@

test_m2: $(LIB_SRC) epi-lib/test/m2/test_m2.c
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^ && ./$@

test_m3: $(LIB_SRC) epi-lib/test/m3/test_m3.c
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^ && ./$@

test_m4: $(LIB_SRC) epi-lib/test/m4/test_m4.c
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^ -lm && ./$@

test_m5: $(LIB_SRC) epi-lib/test/m5/test_m5.c
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^ && ./$@

test_pillar1: $(LIB_SRC) epi-lib/test/pillar1/test_pillar1_gaps.c
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^ && ./$@

test_vak: $(LIB_SRC) epi-lib/test/vak/test_vak.c
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^ && ./$@

# Run all tests
test: $(TESTS)
	@echo ""
	@echo "=== All test suites passed ==="

rust-test:
	@echo "Using CARGO_TARGET_DIR=$(RUST_TARGET_DIR)"
	CARGO_TARGET_DIR="$(RUST_TARGET_DIR)" cargo test --manifest-path "$(RUST_MANIFEST)" $(RUST_TEST_ARGS)

rust-clean:
	cargo clean --manifest-path "$(RUST_MANIFEST)" --target-dir "$(RUST_TARGET_DIR)"
	@if [ -n "$(RUST_LEGACY_TARGET_DIR)" ] && [ "$(RUST_LEGACY_TARGET_DIR)" != "$(RUST_TARGET_DIR)" ]; then rm -rf "$(RUST_LEGACY_TARGET_DIR)"; fi
	rm -rf epi-cli/target

rust-target-size:
	@du -sh "$(RUST_TARGET_DIR)" "$(RUST_LEGACY_TARGET_DIR)" epi-cli/target 2>/dev/null || true

clean:
	rm -f $(BIN) libepilogos.a $(TESTS) *.o
	rm -rf $(addsuffix .dSYM,$(TESTS))
