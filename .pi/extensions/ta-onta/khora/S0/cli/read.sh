#!/bin/sh
set -eu

script_dir=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
tool=$("$script_dir/resolve.sh" read)

if [ "$tool" = "bat" ]; then
  exec bat --style=plain --paging=never "$@"
fi

exec cat "$@"
