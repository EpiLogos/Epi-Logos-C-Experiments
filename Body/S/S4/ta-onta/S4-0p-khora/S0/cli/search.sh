#!/bin/sh
set -eu

script_dir=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
tool=$("$script_dir/resolve.sh" search)

if [ "$tool" = "rg" ]; then
  exec rg "$@"
fi

exec grep -R "$@"
