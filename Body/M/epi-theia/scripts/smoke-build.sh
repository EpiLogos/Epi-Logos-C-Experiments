#!/usr/bin/env bash
# Track 05 T1 smoke test — verify the Theia browser bundle builds from a clean
# checkout. Used by CI and by /m-dev verification.
#
# Run from the workspace root: ./scripts/smoke-build.sh

set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> pnpm install --frozen-lockfile"
CI=true pnpm install --frozen-lockfile

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

echo "==> build theia-app (webpack via @theia/cli)"
pnpm --filter @pratibimba/theia-app build

echo "==> verify frontend bundle artifacts"
test -f theia-app/lib/frontend/bundle.js   || { echo "bundle.js missing"; exit 1; }
test -f theia-app/lib/frontend/index.html  || { echo "index.html missing"; exit 1; }

# Every Theia extension package must chunk into the frontend bundle.
required_chunk_prefixes=(
    "extensions_kernel-bridge-readiness_"
    "extensions_kernel-bridge_"
    "extensions_m-extension-runtime_"
    "extensions_pratibimba-layouts_"
    "extensions_omnipanel-shell_"
    "extensions_m0-anuttara_"
    "extensions_m1-paramasiva_"
    "extensions_m2-parashakti_"
    "extensions_m3-mahamaya_"
    "extensions_m4-nara_"
    "extensions_m5-epii_"
    "extensions_integrated-composition_"
    "extensions_plugin-integrated-1-2-3_"
    "extensions_plugin-integrated-4-5-0_"
    # Track 05 T4 — IDE shell M0/M5 chrome (admin-track05-finishing).
    "extensions_ide-shell-m0-m5_"
    # Track 05 T8 — Agentic Control Room run flow (admin-track05-finishing).
    "extensions_agentic-control-room_"
    # Track 05 T9 — Acceptance harness (admin-track05-finishing).
    "extensions_acceptance-harness_"
    # Track 09 T9b — /body lite surface (admin-track09-body-surface).
    "extensions_body-lite-surface_"
)
for prefix in "${required_chunk_prefixes[@]}"; do
    if ! ls theia-app/lib/frontend/${prefix}*.js >/dev/null 2>&1; then
        echo "missing frontend chunk for ${prefix}"
        exit 1
    fi
done

bundle_bytes=$(wc -c < theia-app/lib/frontend/bundle.js | tr -d ' ')
echo "==> ok: bundle.js is $bundle_bytes bytes"
echo "smoke build passed"
