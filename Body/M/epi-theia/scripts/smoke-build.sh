#!/usr/bin/env bash
# Track 05 T1 smoke test — verify the Electron-primary Theia bundle builds
# from a clean checkout. Used by CI and by /m-dev verification. Browser mode is
# the derived gateway/remote target and is verified separately.
#
# Run from the workspace root: ./scripts/smoke-build.sh

set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> pnpm install --frozen-lockfile"
CI=true pnpm install --frozen-lockfile
node scripts/ensure-electron-dist.mjs

echo "==> electron target package parity gate"
node --test extensions/test/electron-target-parity.test.mjs

echo "==> build extensions (TS)"
pnpm --filter @pratibimba/m-extension-runtime build
pnpm --filter @pratibimba/kernel-bridge-readiness build
pnpm --filter @pratibimba/kernel-bridge build
pnpm --filter @pratibimba/pratibimba-layouts build
pnpm --filter @pratibimba/omnipanel-shell build
pnpm --filter @pratibimba/m0-anuttara build
pnpm --filter @pratibimba/m1-paramasiva build
pnpm --filter @pratibimba/m2-parashakti build
pnpm --filter @pratibimba/m3-mahamaya build
pnpm --filter @pratibimba/m4-nara build
pnpm --filter @pratibimba/m5-epii build
pnpm --filter @pratibimba/integrated-composition build
pnpm --filter @pratibimba/plugin-integrated-1-2-3 build
pnpm --filter @pratibimba/plugin-integrated-4-5-0 build
# Track 05 T4 — IDE shell M0/M5 chrome (admin-track05-finishing).
pnpm --filter @pratibimba/ide-shell-m0-m5 build
# Track 05 T8 — Agentic Control Room run flow (admin-track05-finishing).
pnpm --filter @pratibimba/agentic-control-room build
# Track 05 T9 — Acceptance harness (admin-track05-finishing).
pnpm --filter @pratibimba/acceptance-harness build
# Track 09 T9b — /body lite surface (admin-track09-body-surface).
pnpm --filter @pratibimba/body-lite-surface build

echo "==> build electron-app (webpack via @theia/cli)"
EPI_ELECTRON_SMOKE_STUB_NATIVE=1 pnpm --filter @pratibimba/electron-app build

echo "==> verify frontend bundle artifacts"
test -f electron-app/lib/frontend/bundle.js   || { echo "bundle.js missing"; exit 1; }
test -f electron-app/lib/frontend/index.html  || { echo "index.html missing"; exit 1; }

# Every Theia extension package must be present in the emitted frontend bundle.
# Chunk filenames are webpack implementation details; module paths are the
# stable proof that the package was composed into the Electron target.
required_extension_packages=(
    "kernel-bridge-readiness"
    "kernel-bridge"
    "m-extension-runtime"
    "pratibimba-layouts"
    "omnipanel-shell"
    "m0-anuttara"
    "m1-paramasiva"
    "m2-parashakti"
    "m3-mahamaya"
    "m4-nara"
    "m5-epii"
    "integrated-composition"
    "plugin-integrated-1-2-3"
    "plugin-integrated-4-5-0"
    # Track 05 T4 — IDE shell M0/M5 chrome (admin-track05-finishing).
    "ide-shell-m0-m5"
    # Track 05 T8 — Agentic Control Room run flow (admin-track05-finishing).
    "agentic-control-room"
    # Track 05 T9 — Acceptance harness (admin-track05-finishing).
    "acceptance-harness"
    # Track 09 T9b — /body lite surface (admin-track09-body-surface).
    "body-lite-surface"
)
for package_name in "${required_extension_packages[@]}"; do
    if ! rg -q "../extensions/${package_name}/lib/" electron-app/lib/frontend/*.js; then
        echo "missing frontend modules for ${package_name}"
        exit 1
    fi
done

bundle_bytes=$(wc -c < electron-app/lib/frontend/bundle.js | tr -d ' ')
echo "==> ok: bundle.js is $bundle_bytes bytes"
echo "smoke build passed"
