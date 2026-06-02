# Changelog

All notable changes should be recorded here once the project reaches release-accountable history.

This changelog starts at the minimum evolute baseline: the point after the first M-dev cycles where Epi-Logos becomes accountable as a multi-surface system rather than a collection of research artifacts. Earlier philosophical, architectural, and prototype history remains in the vault and Seed plans; it is not backfilled here as release history.

## [Unreleased] - Minimum Evolute Baseline

### Baseline Scope

- Establishes the repository as a coordinate-governed system spanning C substrate, Rust S0-S5 control plane, graph/gateway/vault/agent services, and M' Theia surface.
- Treats source build as the current supported distribution mode.
- Treats public package channels as planned, not shipped.
- Introduces root documentation requirements for verified state, known blockers, and release readiness.

### Verified

- `make test` passes the C substrate suites across M0-M5, Pillar/VAK/kernel, and pointer-web checks.
- `pnpm --dir Body/M/epi-theia test:contracts` passes the M' Theia contract suite.
- M-dev Cycle 1 close records substantial landed S/S' substrate across S0/S2/S3/S4/S5 and M' acceptance slices.
- M-dev Cycle 2 records M' first-coverage ownership over product surfaces, integrated plugins, constitutional/agentic surfaces, consumed substrate, method routing, and no-orphan release gates.

### Known Open Items

- `make rust-test` does not yet pass the full target at this baseline because one experimental runtime protocol-doc materialization check fails.
- Rust warning debt remains and should be reduced before a clean release claim.
- M-dev Cycle 2 is near closure but not complete: remaining work includes S2 consumed contract closure, relation-inference relay guardrails, method drift, and no-orphan review closure.
- M-dev Cycle 3 design reconciliation has opened but has not yet produced a complete routeable plan set.

### Documentation Changes

- Root README rewritten around current repo residency and verified strata.
- Distribution guidance reset to source-build-first and roadmap-only package channels.
- Contribution guidance updated for production readiness, real tests, coordinate ownership, and stewardship.
- Status ledger added at `docs/STATUS.md`.

### Release Note

No public versioned release is cut by this baseline. The next release-worthy step is to close the Rust docs-materialization blocker, reduce warning debt, complete Cycle 2 no-orphan closure, and decide whether the first public tag should be an alpha source release or an internal developer baseline.
