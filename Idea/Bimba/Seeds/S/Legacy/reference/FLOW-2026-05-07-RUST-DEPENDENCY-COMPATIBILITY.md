---
coordinate: "S0'"
c_4_artifact_role: "flow"
c_1_ct_type: "CT1"
c_0_source_coordinates:
  - "[[S-AD-HOC-ROADMAP]]"
  - "[[FLOW 2026 05 06 SMART ENV HEN LINK CANDIDATE POOL]]"
  - "[[S4-SPEC]]"
  - "[[S5-SPEC]]"
---

# Flow 2026 05 07 Rust Dependency Compatibility

## Outcome

The Rust 1.89 build blocker was traced to a single transitive path:

- `epi-logos`
- `ratatui-image`
- `icy_sixel`
- `quantette`

`quantette 0.5.1` declared `rust-version = 1.90`, which caused Cargo to reject the build before compilation. A vendored compatibility override now lives at:

- `Body/S/S0/epi-cli/vendor/quantette`

and `Body/S/S0/epi-cli/Cargo.toml` patches crates.io to that local copy.

The override is intentionally minimal:

- keep `quantette` at `0.5.1`
- lower only the declared Rust floor to `1.89`
- preserve the existing portal/image dependency graph

## Validation

This was not a speculative metadata hack. The patched dependency was validated by successful workspace builds on Rust 1.89:

- `cargo check -p epi-logos`
- `cargo check -p epi-logos --no-default-features`

That proves the break was the manifest gate, not an actual 1.90-only code dependency in the current `quantette` source.

## Portal Image Optionality

The image-backed portal path is now isolated behind a Cargo feature:

- feature: `portal-images`
- default: enabled

When enabled, the portal can register the `clock.unified` image-backed clock.
When disabled, the portal falls back to `clock.cosmic` and avoids the `ratatui-image` / `icy_sixel` / `quantette` chain entirely.

This gives us two stable modes:

1. full visual portal on current default builds
2. feature-reduced compatibility build where image rendering is not required

## Redis Future-Incompat Fix

`redis 0.25.4` previously triggered Rust future-incompat warnings from `redis::script` because ignored `load_cmd()` results relied on never-type fallback.

That is now patched locally in:

- `Body/S/S0/epi-cli/vendor/redis`

with a crates.io override in:

- `Body/S/S0/epi-cli/Cargo.toml`

The fix is intentionally minimal:

- keep `redis` on `0.25.4`
- change only the two script-loader calls to explicit unit return types
  - `query::<()>(...)`
  - `query_async::<_, ()>(...)`

Fresh `cargo check -p epi-logos` no longer surfaces the original Redis future-incompat warning in the live build output.

## Remaining Dependency Risk

Redis is no longer the immediate future-break threat, but the vendored crate still emits ordinary Rust warnings around lifetime syntax. Those are not current blockers.

The remaining strategic question is whether to:

1. keep the local Redis patch until a broader dependency upgrade cycle
2. or move the workspace to a newer upstream Redis line when S2/S3 API audit bandwidth is available
