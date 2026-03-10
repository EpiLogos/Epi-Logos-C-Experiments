#!/usr/bin/env bash
# Khora post-session-close hook — signal archive readiness
echo "session closed: $(date -u +%Y%m%dT%H%M%SZ)"
