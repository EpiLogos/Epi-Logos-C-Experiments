CC      = clang
CFLAGS  = -std=c11 -Wall -Wextra -Werror -pedantic -I include
LDFLAGS =

SRC     = src/archetypes.c src/arena.c src/engine.c src/families.c src/main.c
OBJ     = $(SRC:.c=.o)
BIN     = epi-logos

TEST_SRC = test/test_struct.c test/test_tagged_ptr.c test/test_archetypes.c \
           test/test_arena.c test/test_engine.c test/test_families.c test/test_all.c
TEST_SUPPORT_SRC = src/archetypes.c src/arena.c src/engine.c src/families.c
TEST_BIN = test_runner

# Debug: AddressSanitizer + UndefinedBehaviorSanitizer
DEBUG_CFLAGS  = -std=c11 -Wall -Wextra -Werror -pedantic -I include \
                -fsanitize=address,undefined -g -O0 -DDEBUG
DEBUG_LDFLAGS = -fsanitize=address,undefined

.PHONY: all test debug clean

all: $(BIN)

$(BIN): $(SRC)
	$(CC) $(CFLAGS) -O2 -o $@ $^ $(LDFLAGS)

test: $(TEST_SRC) $(TEST_SUPPORT_SRC)
	$(CC) $(DEBUG_CFLAGS) -o $(TEST_BIN) $^ $(DEBUG_LDFLAGS)
	./$(TEST_BIN)

debug: $(SRC)
	$(CC) $(DEBUG_CFLAGS) -o $(BIN) $^ $(DEBUG_LDFLAGS)

clean:
	rm -f $(BIN) $(TEST_BIN) $(OBJ)
