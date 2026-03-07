CC      = clang
CFLAGS  = -std=c11 -Wall -Wextra -Werror -pedantic -Iinclude -Ivendor/blake3
BLAKE3  = -DBLAKE3_NO_SSE2 -DBLAKE3_NO_SSE41 -DBLAKE3_NO_AVX2 -DBLAKE3_NO_AVX512
LDFLAGS =
SANFLAGS = -fsanitize=address,undefined -g -O0

# Source groups
PILLAR_SRC = src/psychoid_numbers.c src/engine.c src/arena.c src/families.c
M_SRC      = src/m0.c src/m1.c src/m2.c src/m3.c src/m4.c src/m5.c
BLAKE3_SRC = vendor/blake3/blake3.c vendor/blake3/blake3_dispatch.c vendor/blake3/blake3_portable.c
LIB_SRC    = $(PILLAR_SRC) $(M_SRC) $(BLAKE3_SRC)
ALL_SRC    = $(LIB_SRC) src/main.c

BIN = epi-logos

# Test suites
TESTS = test_m0_init test_m0_rfactor test_m1 test_m2 test_m3 test_m4 test_m5 test_pillar1 test_vak

.PHONY: all lib test debug clean $(TESTS)

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

# Individual test targets
test_m0_init: $(LIB_SRC) src/test_m0_init.c
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^ && ./$@

test_m0_rfactor: $(LIB_SRC) src/test_m0_rfactor.c
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^ && ./$@

test_m1: $(LIB_SRC) src/test_m1.c
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^ -lm && ./$@

test_m2: $(LIB_SRC) src/test_m2.c
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^ && ./$@

test_m3: $(LIB_SRC) src/test_m3.c
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^ && ./$@

test_m4: $(LIB_SRC) src/test_m4.c
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^ -lm && ./$@

test_m5: $(LIB_SRC) src/test_m5.c
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^ && ./$@

test_pillar1: $(LIB_SRC) src/test_pillar1_gaps.c
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^ && ./$@

test_vak: $(LIB_SRC) src/test_vak.c
	$(CC) $(CFLAGS) $(BLAKE3) $(SANFLAGS) -o $@ $^ && ./$@

# Run all tests
test: $(TESTS)
	@echo ""
	@echo "=== All test suites passed ==="

clean:
	rm -f $(BIN) libepilogos.a $(TESTS) *.o
