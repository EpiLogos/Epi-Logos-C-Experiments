# Epi-Logos Distribution

This document describes the current and planned distribution posture for Epi-Logos.

The short version: source build is the supported path today. Public package channels are planned but should not be treated as shipped until release automation, artifacts, and verification evidence exist.

## Package Identity

| Surface | Identity |
| --- | --- |
| CLI binary | `epi` |
| Rust crate package | `epi-logos` |
| CLI manifest | `Body/S/S0/epi-cli/Cargo.toml` |
| C substrate | `Body/S/S0/epi-lib` |
| Theia workspace | `Body/M/epi-theia` |
| License | MIT OR Apache-2.0 |

## Current Supported Install Path

### Build from source

```bash
git clone <repo-url>
cd <repo>
cargo install --path Body/S/S0/epi-cli
epi core verify
```

Requires:

- Rust toolchain
- C compiler, preferably `clang`
- macOS or Linux development environment

The `epi` binary is built from the Rust CLI manifest and compiles the C substrate through the `cc` build path.

## Current Verification Gates

Before treating a local checkout as healthy, run:

```bash
make test
pnpm --dir Body/M/epi-theia test:contracts
make rust-test
```

Current baseline:

- `make test` passes the C substrate suites.
- `pnpm --dir Body/M/epi-theia test:contracts` passes the M' contract suite.
- `make rust-test` currently exposes one experimental runtime protocol-doc materialization blocker and warning debt. See `docs/STATUS.md`.

## What Is Not Yet a Public Release Channel

The following channels are intended but not yet active public distribution facts:

| Channel | Current state |
| --- | --- |
| crates.io | Planned. Do not use `cargo install epi-logos` as release guidance until publish evidence exists. |
| GitHub Releases | Planned. No prebuilt binary claim should be made until release artifacts exist. |
| Homebrew | Planned. No tap/formula claim should be made until maintained formula evidence exists. |
| Container images | Not established as a supported distribution channel in the current baseline. |

## What a Release Must Include

A release candidate should include:

- Passing C substrate verification: `make test`.
- Passing Theia contract verification: `pnpm --dir Body/M/epi-theia test:contracts`.
- Passing or explicitly waived Rust suite status: `make rust-test`.
- Updated `docs/STATUS.md`.
- Updated `CHANGELOG.md`.
- A clean statement of live-service requirements for graph, gateway, SpaceTimeDB, and Redis-backed paths.
- Artifact checksums for any distributed binaries.
- License files included in source and binary distributions.

## Distribution Philosophy

Epi-Logos is not only a package to consume. It is intended to become infrastructure that communities can steward.

That means distribution must preserve:

- Local-first operation where possible.
- Transparent operator runbooks.
- Clear separation between public-current context and protected-local material.
- Auditable release gates.
- Explicit fallback/degraded states.
- The ability for a community to understand what it is running, why it behaves as it does, and which parts remain experimental.

The distribution story should therefore avoid a platform-consumer model. The right target is a stewarded commons: installable software, readable contracts, verifiable state, and governance hooks that do not hide behind release polish.

## Planned Release Tracks

1. **Source release baseline**
   - Root docs correct.
   - Status/changelog initialized.
   - Local verification commands documented.

2. **Developer release**
   - Source build and contract verification reliable.
   - Known blockers named.
   - No stale path references in root docs.

3. **Binary release**
   - CI builds release artifacts.
   - Checksums and platform matrix published.
   - Operator runbooks aligned with release version.

4. **Package ecosystem release**
   - crates.io publish.
   - Optional Homebrew formula.
   - Release automation proves reproducibility.

5. **Sovereign commons deployment kit**
   - Steward onboarding guide.
   - Local hardware/service topology guide.
   - Governance and privacy checklist.
   - Federation/commons claims only when implemented and verified.
