#!/bin/sh
set -eu

script_dir=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
tool=$("$script_dir/resolve.sh" listing)

if [ "$tool" = "eza" ]; then
  exec eza --group-directories-first --icons=never "$@"
fi

exec ls "$@"
