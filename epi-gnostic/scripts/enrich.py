#!/usr/bin/env python3
# epi-gnostic/scripts/enrich.py
"""
Computed enrichment for BimbaNode records.
Accepts a coordinate string, returns a dict of purely computable fields.
No LLM involvement — these are deterministic.

Usage (from agent via Bash tool):
    python enrich.py "#3-1-0-0"
    → prints JSON: {"c_2_uuid": "...", "c_4_family": "M", "c_4_ql_position": 3,
                    "c_4_layer": "COORDINATE", "c_4_topo_mode": "LEMNISCATE"}
"""
from __future__ import annotations
import json
import re
import sys
import uuid

_UUID_NS = uuid.UUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')

_TOPO_MODE = {0: 'ZERO_SPHERE', 1: 'TORUS', 2: 'TORUS',
              3: 'LEMNISCATE', 4: 'LEMNISCATE', 5: 'KLEIN'}

_LAYER_BY_DEPTH = {0: 'PSYCHOID', 1: 'PSYCHOID', 2: 'COORDINATE',
                   3: 'COORDINATE', 4: 'COORDINATE', 5: 'COORDINATE'}


def enrich(coordinate: str) -> dict:
    stripped = coordinate.lstrip('#')
    parts = [p for p in stripped.split('-') if p] if stripped else []
    depth = len(parts)

    ql_pos = None
    if parts and re.match(r'^\d+$', parts[0]):
        ql_pos = int(parts[0])

    is_cf  = '/' in stripped or stripped.startswith('CF_')
    is_vak = stripped in ('cpf', 'ct', 'cp', 'cf', 'cfp', 'cs')

    if is_cf:
        layer = 'CONTEXT_FRAME'
    elif is_vak:
        layer = 'VAK'
    else:
        layer = _LAYER_BY_DEPTH.get(depth, 'COORDINATE')

    topo = _TOPO_MODE.get(ql_pos, 'ZERO_SPHERE') if ql_pos is not None else 'ZERO_SPHERE'

    return {
        'c_2_uuid':        str(uuid.uuid5(_UUID_NS, coordinate)),
        'c_4_family':      'M',
        'c_4_ql_position': ql_pos,
        'c_4_layer':       layer,
        'c_4_topo_mode':   topo,
    }


if __name__ == '__main__':
    coord = sys.argv[1] if len(sys.argv) > 1 else '#'
    print(json.dumps(enrich(coord)))
