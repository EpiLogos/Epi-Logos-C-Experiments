#!/bin/sh
set -eu

exec rustup run 1.93.0 rustc "$@"
