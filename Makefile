CC      = clang
S0_ROOT ?= Body/S/S0
EPI_LIB = $(S0_ROOT)/epi-lib
EPI_CLI = $(S0_ROOT)/epi-cli
S0_VENDOR = $(S0_ROOT)/vendor
CFLAGS  = -std=c11 -Wall -Wextra -Werror -pedantic -I$(EPI_LIB)/include -I$(S0_VENDOR)/blake3
# Vendored BLAKE3 in this repo is the portable C subset only, so SIMD backends
# must be disabled explicitly on every architecture, including arm64/NEON.
BLAKE3  = -DBLAKE3_NO_SSE2 -DBLAKE3_NO_SSE41 -DBLAKE3_NO_AVX2 -DBLAKE3_NO_AVX512 -DBLAKE3_USE_NEON=0
LDFLAGS =
SANFLAGS = -fsanitize=address,undefined -g -O0
RUST_MANIFEST = $(EPI_CLI)/Cargo.toml
RUST_TARGET_DIR ?= /tmp/epi-logos-cargo-target
RUST_LEGACY_TARGET_DIR := $(if $(TMPDIR),$(TMPDIR)/epi-logos-cargo-target,)
RUST_TEST_ARGS ?=

# Source groups (Body/S/S0/epi-lib/)
PILLAR_SRC = $(EPI_LIB)/src/psychoid_numbers.c $(EPI_LIB)/src/engine.c $(EPI_LIB)/src/arena.c $(EPI_LIB)/src/families.c
M_SRC      = $(EPI_LIB)/src/m0.c $(EPI_LIB)/src/m1.c $(EPI_LIB)/src/m2.c $(EPI_LIB)/src/m3.c $(EPI_LIB)/src/m3_clock_lut.c $(EPI_LIB)/src/m4.c $(EPI_LIB)/src/m5.c
BLAKE3_SRC = $(S0_VENDOR)/blake3/blake3.c $(S0_VENDOR)/blake3/blake3_dispatch.c $(S0_VENDOR)/blake3/blake3_portable.c
LIB_SRC    = $(PILLAR_SRC) $(M_SRC) $(BLAKE3_SRC)
ALL_SRC    = $(LIB_SRC) $(EPI_LIB)/src/main.c

BIN = epi-logos

# Test suites
TESTS = test_m0_init test_m0_rfactor test_m0_tick12 test_m1 test_m1_ananda test_m2 test_m2_planets test_m2_aspects test_m3 test_m3_clock_lut test_m3_codon_class test_m4 test_m4_hash32 test_m4_oracle_faces test_m5 test_pillar1 test_vak test_engine_walk_mode
TEST_BIN_DIR = $(EPI_LIB)/test/bin

.PHONY: all lib test test-artifact-paths debug clean rust-test rust-clean rust-target-size lut $(TESTS) test_m1_ananda test_m2_planets test_m2_aspects test_m3_codon_class test_m4_hash32 test_m4_oracle_faces test_engine_walk_mode

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

$(TEST_BIN_DIR):
	mkdir -p $@

# Individual test targets (test files in Body/S/S0/epi-lib/test/{module}/)
$(TEST_BIN_DIR)/test_m0_init: $(LIB_SRC) $(EPI_LIB)/test/m0/test_m0_init.c | $(TEST_BIN_DIR)
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^

$(TEST_BIN_DIR)/test_m0_rfactor: $(LIB_SRC) $(EPI_LIB)/test/m0/test_m0_rfactor.c | $(TEST_BIN_DIR)
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^

$(TEST_BIN_DIR)/test_m0_tick12: $(LIB_SRC) $(EPI_LIB)/test/m0/test_m0_tick12.c | $(TEST_BIN_DIR)
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^

$(TEST_BIN_DIR)/test_m1: $(LIB_SRC) $(EPI_LIB)/test/m1/test_m1.c | $(TEST_BIN_DIR)
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^ -lm

$(TEST_BIN_DIR)/test_m1_ananda: $(LIB_SRC) $(EPI_LIB)/test/m1/test_m1_ananda.c | $(TEST_BIN_DIR)
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^ -lm

$(TEST_BIN_DIR)/test_m2: $(LIB_SRC) $(EPI_LIB)/test/m2/test_m2.c | $(TEST_BIN_DIR)
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^

$(TEST_BIN_DIR)/test_m2_planets: $(LIB_SRC) $(EPI_LIB)/test/m2/test_m2_planets.c | $(TEST_BIN_DIR)
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^ -lm

$(TEST_BIN_DIR)/test_m2_aspects: $(LIB_SRC) $(EPI_LIB)/test/m2/test_m2_aspects.c | $(TEST_BIN_DIR)
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^ -lm

$(TEST_BIN_DIR)/test_m3: $(LIB_SRC) $(EPI_LIB)/test/m3/test_m3.c | $(TEST_BIN_DIR)
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^

$(TEST_BIN_DIR)/test_m3_clock_lut: $(LIB_SRC) $(EPI_LIB)/test/m3/test_m3_clock_lut.c | $(TEST_BIN_DIR)
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^

$(TEST_BIN_DIR)/test_m3_codon_class: $(LIB_SRC) $(EPI_LIB)/test/m3/test_m3_codon_class.c | $(TEST_BIN_DIR)
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^

$(TEST_BIN_DIR)/test_m4: $(LIB_SRC) $(EPI_LIB)/test/m4/test_m4.c | $(TEST_BIN_DIR)
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^ -lm

$(TEST_BIN_DIR)/test_m4_hash32: $(LIB_SRC) $(EPI_LIB)/test/m4/test_m4_hash32.c | $(TEST_BIN_DIR)
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^ -lm

$(TEST_BIN_DIR)/test_m4_oracle_faces: $(LIB_SRC) $(EPI_LIB)/test/m4/test_m4_oracle_faces.c | $(TEST_BIN_DIR)
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^ -lm

$(TEST_BIN_DIR)/test_m5: $(LIB_SRC) $(EPI_LIB)/test/m5/test_m5.c | $(TEST_BIN_DIR)
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^

$(TEST_BIN_DIR)/test_pillar1: $(LIB_SRC) $(EPI_LIB)/test/pillar1/test_pillar1_gaps.c | $(TEST_BIN_DIR)
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^

$(TEST_BIN_DIR)/test_engine_walk_mode: $(LIB_SRC) $(EPI_LIB)/test/test_engine_walk_mode.c | $(TEST_BIN_DIR)
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^ -lm

$(TEST_BIN_DIR)/test_vak: $(LIB_SRC) $(EPI_LIB)/test/vak/test_vak.c | $(TEST_BIN_DIR)
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^

test_m0_init: $(TEST_BIN_DIR)/test_m0_init
	./$<

test_m0_rfactor: $(TEST_BIN_DIR)/test_m0_rfactor
	./$<

test_m0_tick12: $(TEST_BIN_DIR)/test_m0_tick12
	./$<

test_m1: $(TEST_BIN_DIR)/test_m1
	./$<

test_m1_ananda: $(TEST_BIN_DIR)/test_m1_ananda
	./$<

test_m2: $(TEST_BIN_DIR)/test_m2
	./$<

test_m2_planets: $(TEST_BIN_DIR)/test_m2_planets
	./$<

test_m2_aspects: $(TEST_BIN_DIR)/test_m2_aspects
	./$<

test_m3: $(TEST_BIN_DIR)/test_m3
	./$<

test_m3_clock_lut: $(TEST_BIN_DIR)/test_m3_clock_lut
	./$<

test_m3_codon_class: $(TEST_BIN_DIR)/test_m3_codon_class
	./$<

test_m4: $(TEST_BIN_DIR)/test_m4
	./$<

test_m4_hash32: $(TEST_BIN_DIR)/test_m4_hash32
	./$<

test_m4_oracle_faces: $(TEST_BIN_DIR)/test_m4_oracle_faces
	./$<

test_m5: $(TEST_BIN_DIR)/test_m5
	./$<

test_pillar1: $(TEST_BIN_DIR)/test_pillar1
	./$<

test_vak: $(TEST_BIN_DIR)/test_vak
	./$<

test_engine_walk_mode: $(TEST_BIN_DIR)/test_engine_walk_mode
	./$<

lut: ## Regenerate CLOCK_DEGREE_LUT from Neo4j dataset (requires NEO4J_URI + NEO4J_PASSWORD)
	python3 tools/build_clock_degree_lut.py > $(EPI_LIB)/src/m3_clock_lut.c

# Run all tests
test-artifact-paths:
	sh $(EPI_LIB)/test/test_artifact_paths.sh

test: $(TESTS) test-artifact-paths
	@echo ""
	@echo "=== All test suites passed ==="

rust-test:
	@echo "Using CARGO_TARGET_DIR=$(RUST_TARGET_DIR)"
	CARGO_TARGET_DIR="$(RUST_TARGET_DIR)" cargo test --manifest-path "$(RUST_MANIFEST)" $(RUST_TEST_ARGS)

rust-clean:
	cargo clean --manifest-path "$(RUST_MANIFEST)" --target-dir "$(RUST_TARGET_DIR)"
	@if [ -n "$(RUST_LEGACY_TARGET_DIR)" ] && [ "$(RUST_LEGACY_TARGET_DIR)" != "$(RUST_TARGET_DIR)" ]; then rm -rf "$(RUST_LEGACY_TARGET_DIR)"; fi
	rm -rf $(EPI_CLI)/target

rust-target-size:
	@du -sh "$(RUST_TARGET_DIR)" "$(RUST_LEGACY_TARGET_DIR)" $(EPI_CLI)/target 2>/dev/null || true

clean:
	rm -f $(BIN) libepilogos.a $(TESTS) *.o
	rm -rf $(addsuffix .dSYM,$(TESTS))
	rm -rf $(TEST_BIN_DIR)
