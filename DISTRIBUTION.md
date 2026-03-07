# Epi-Logos Distribution Strategy

## Package Identity

- **Binary name:** `epi`
- **Crate name:** `epi-logos`
- **Library:** Statically linked C11 core (compiled via `cc` crate at build time)

## Installation Methods

### 1. From Source (Primary)

```bash
git clone https://github.com/user/epi-logos.git
cd epi-logos/epi-cli
cargo install --path .
```

Requires: Rust toolchain (rustup), C compiler (clang or gcc).

### 2. Cargo Install (After crates.io Publish)

```bash
cargo install epi-logos
```

### 3. GitHub Releases (Prebuilt Binaries)

Prebuilt for:
- macOS arm64 (Apple Silicon)
- macOS x86_64
- Linux x86_64 (glibc)
- Linux aarch64

Download from Releases page, place in PATH.

### 4. Homebrew (macOS)

```bash
brew tap epi-logos/tap
brew install epi
```

## Repository Structure

```
epi-logos/
├── include/          # C headers (ontology.h, m0.h-m5.h, etc.)
├── src/              # C sources (pillar I, M0-M5)
├── vendor/blake3/    # Vendored BLAKE3 (portable C)
├── epi-cli/          # Rust CLI + TUI
│   ├── build.rs      # cc crate: compiles C into Rust binary
│   ├── Cargo.toml
│   └── src/
├── docs/             # Specs, plans, dev references
├── Makefile          # C-only development workflow
└── DISTRIBUTION.md   # This file
```

## What Gets Published

The `epi` binary includes:
- All C code (Pillar I + M0-M5 + BLAKE3) statically compiled
- Rust CLI (clap dispatch, 12 command families)
- Rust TUI (ratatui dashboard, walk, families, M5 viewer, agent chat)
- No runtime dependencies on shared libraries

## CI/CD (GitHub Actions)

Future: `.github/workflows/release.yml` will:
1. Build on push to `main` tag
2. Cross-compile for 4 targets
3. Create GitHub Release with artifacts
4. Publish to crates.io
