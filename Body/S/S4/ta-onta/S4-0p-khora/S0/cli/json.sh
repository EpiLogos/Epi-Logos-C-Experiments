#!/bin/sh
set -eu

script_dir=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
tool=$("$script_dir/resolve.sh" json)

exec "$tool" "$@"
