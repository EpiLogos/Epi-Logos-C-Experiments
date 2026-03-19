# Contributing to Epi-Logos

## Getting Started

1. Clone and build:
   ```bash
   git clone https://github.com/user/epi-logos.git
   cd epi-logos/epi-cli
   cargo install --path .
   ```

2. Verify the coordinate system boots:
   ```bash
   epi core verify
   ```

3. Run the C test suites:
   ```bash
   make test    # 9 suites, 2180+ tests
   ```
   Test binaries are emitted under `epi-lib/test/bin/`, not the repo root.

4. If you are working on the graph stack, bootstrap the live local services:
   ```bash
   cd epi-cli
   cargo run -- graph bootstrap-dev
   source ../.env.graph-dev
   epi --json graph doctor
   ```

## Understanding the Codebase

The coordinate system IS the codebase map. Before touching any code:

```bash
epi core knowing M4          # before editing m4.c or m4.h
epi core knowing S2          # before editing graph/ module
epi help architecture        # full architecture overview
epi help coordinates         # coordinate syntax reference
epi core knowing --family M  # list all M-family coordinates
```

Each coordinate has a quintessential self-description, structural correspondences, and relational context. Use `--json` for machine-readable output, `--tui` for an interactive browser.

## Development Workflow

- **C library:** Edit in `include/` and `src/`, build with `make`, test with `make test`
- **Rust CLI:** Edit in `epi-cli/src/`, build with `cargo build`, test with `make rust-test`
- **Graph stack:** Use `cargo run -- graph bootstrap-dev` for local Neo4j + Redis Stack + RedisVL setup, then `epi graph doctor` before claiming the stack is healthy
- **Tests:** Every M-branch has a dedicated test suite (`test_m0_init.c`, `test_m1.c`, etc.)
- **C test artifacts:** `make test` compiles runnable test binaries into `epi-lib/test/bin/`
- **QV data:** Update coordinate descriptions via `epi core knowing <COORD> --update "pithy"` (write-gated), then `epi core knowing --bake` to regenerate `src/qv_data.c`

For Rust artifact hygiene, prefer:

```bash
make rust-test
make rust-target-size
make rust-clean
```

`make rust-test` routes Cargo artifacts into `/tmp/epi-logos-cargo-target` so repeated test runs do not keep inflating `epi-cli/target/` inside the repo.

## Code Standards

- C11 with `-Wall -Wextra -Werror -pedantic`
- HC struct must remain exactly 128 bytes (`_Static_assert` enforced)
- Tagged pointers: `GET_PTR(ptr)` before EVERY dereference — no exceptions
- Floats ONLY in `M4_Jung_Complex.charge/.autonomy` (design rule DR 8)
- Rust: standard `cargo clippy` and `cargo fmt`

## Commit Messages

Follow conventional commits: `feat:`, `fix:`, `build:`, `docs:`, `refactor:`, `test:`

## License

By contributing, you agree to license your contributions under MIT OR Apache-2.0.
