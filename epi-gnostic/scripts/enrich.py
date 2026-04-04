#!/usr/bin/env python3
# epi-gnostic/scripts/enrich.py
"""
Computed enrichment for BimbaNode records.
Accepts a coordinate string, returns ONLY purely mechanical fields
derivable from the coordinate string itself — no inference, no architecture.

Usage (from agent via Bash tool):
    python3 enrich.py "#3-1-0-0"
    → prints JSON: {"c_2_uuid": "...", "c_4_family": "M", "c_4_ql_position": 3}
"""
from __future__ import annotations
import json
import re
import sys
import uuid

_UUID_NS = uuid.UUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')


def enrich(coordinate: str) -> dict:
    stripped = coordinate.lstrip('#')
    parts = [p for p in stripped.split('-') if p] if stripped else []

    ql_pos = None
    if parts and re.match(r'^\d+$', parts[0]):
        ql_pos = int(parts[0])

    return {
        'c_2_uuid':        str(uuid.uuid5(_UUID_NS, coordinate)),
        'c_4_family':      'M',
        'c_4_ql_position': ql_pos,
    }


if __name__ == '__main__':
    coord = sys.argv[1] if len(sys.argv) > 1 else '#'
    print(json.dumps(enrich(coord)))
