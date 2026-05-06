#!/bin/sh

set -eu

repo_root=$(CDPATH= cd -- "$(dirname "$0")/../.." && pwd)
artifact_dir="$repo_root/epi-lib/test/bin"
root_binary="$repo_root/test_m1"
root_dsym="$repo_root/test_m1.dSYM"
artifact_binary="$artifact_dir/test_m1"
artifact_dsym="$artifact_dir/test_m1.dSYM"

rm -f "$root_binary"
rm -rf "$root_dsym"
rm -f "$artifact_binary"
rm -rf "$artifact_dsym"

make -C "$repo_root" -B test_m1 >/dev/null

if [ ! -x "$artifact_binary" ]; then
  echo "expected built test binary at $artifact_binary" >&2
  exit 1
fi

if [ -e "$root_binary" ]; then
  echo "unexpected root-level test binary at $root_binary" >&2
  exit 1
fi

if [ -e "$root_dsym" ]; then
  echo "unexpected root-level dSYM bundle at $root_dsym" >&2
  exit 1
fi
