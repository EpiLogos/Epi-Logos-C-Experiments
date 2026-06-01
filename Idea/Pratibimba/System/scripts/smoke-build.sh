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
pnpm --filter @pratibimba/m0-anuttara build
pnpm --filter @pratibimba/m1-paramasiva build
pnpm --filter @pratibimba/m2-parashakti build
pnpm --filter @pratibimba/m3-mahamaya build
pnpm --filter @pratibimba/m4-nara build
pnpm --filter @pratibimba/m5-epii build
pnpm --filter @pratibimba/integrated-composition build
pnpm --filter @pratibimba/plugin-integrated-1-2-3 build
pnpm --filter @pratibimba/plugin-integrated-4-5-0 build

echo "==> build theia-app (webpack via @theia/cli)"
pnpm --filter @pratibimba/theia-app build

echo "==> verify frontend bundle artifacts"
test -f theia-app/lib/frontend/bundle.js   || { echo "bundle.js missing"; exit 1; }
test -f theia-app/lib/frontend/index.html  || { echo "index.html missing"; exit 1; }

# Every Theia extension package must chunk into the frontend bundle.
required_chunk_prefixes=(
    "extensions_kernel-bridge-readiness_"
    "extensions_m-extension-runtime_"
    "extensions_m0-anuttara_"
    "extensions_m1-paramasiva_"
    "extensions_m2-parashakti_"
    "extensions_m3-mahamaya_"
    "extensions_m4-nara_"
    "extensions_m5-epii_"
    "extensions_integrated-composition_"
    "extensions_plugin-integrated-1-2-3_"
    "extensions_plugin-integrated-4-5-0_"
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
