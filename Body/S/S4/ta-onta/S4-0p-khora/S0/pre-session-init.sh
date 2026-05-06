#!/usr/bin/env bash
# Khora pre-session-init hook
# Load base.env if present
[ -f "$HOME/.epi-logos/env/base.env" ] && source "$HOME/.epi-logos/env/base.env"
# Attempt varlock inject (non-fatal if unavailable)
command -v varlock >/dev/null 2>&1 && varlock inject || true
