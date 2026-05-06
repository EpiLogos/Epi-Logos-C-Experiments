#!/usr/bin/env python3
"""
build_clock_degree_lut.py — Generate CLOCK_DEGREE_LUT[360] C source.

Outputs all 27 fields of Clock_Degree_Entry matching the expanded struct in m3.h.
Queries Neo4j for real hexagram assignments when available; falls back to computed.

Usage:
    python3 tools/build_clock_degree_lut.py > Body/S/S0/epi-lib/src/m3_clock_lut.c
    # or with Neo4j:
    NEO4J_URI=bolt://localhost:7687 NEO4J_PASSWORD=secret \\
        python3 tools/build_clock_degree_lut.py > Body/S/S0/epi-lib/src/m3_clock_lut.c

Dataset coordinates (canonical, from 00-canonical-invariants.md):
    Hexagrams: #3-1-0-{0..63}
    Decans: #2-3 (36 nodes, primary + shadow)
    Spanda stages: #1-3-{0..5}

385-node structure: 360 degree nodes + 24 backbone (palindromic anchors at d%15==0) + 1 Axis Mundi
Structural law: 360 + 24 == 64 * 6 (clock topology = I-Ching LINE_CHANGE count)
"""
import os
import sys

# ── Canonical static data ────────────────────────────────────────────────────

# Chaldean decan rulers — canonical mod-10 indices (Sun=0..Saturn=6, see oracle.rs)
# [Aries d0, Aries d1, Aries d2, Taurus d0, ...]
DECAN_RULER_TABLE = [
    4, 0, 3,  # Aries:        Mars, Sun, Venus
    2, 1, 6,  # Taurus:       Mercury, Moon, Saturn
    5, 4, 0,  # Gemini:       Jupiter, Mars, Sun
    3, 2, 1,  # Cancer:       Venus, Mercury, Moon
    6, 5, 4,  # Leo:          Saturn, Jupiter, Mars
    0, 3, 2,  # Virgo:        Sun, Venus, Mercury
    1, 6, 5,  # Libra:        Moon, Saturn, Jupiter
    4, 0, 3,  # Scorpio:      Mars, Sun, Venus
    2, 1, 6,  # Sagittarius:  Mercury, Moon, Saturn
    5, 4, 0,  # Capricorn:    Jupiter, Mars, Sun
    3, 2, 1,  # Aquarius:     Venus, Mercury, Moon
    6, 5, 4,  # Pisces:       Saturn, Jupiter, Mars
]

# Planet → Chakra (canonical mod-10: Sun=0..Pluto=9)
# From medicine.rs PLANET_CHAKRA / PLANET_RESONANCE dataset
# Root=0, Sacral=1, SolarPlexus=2, Heart=3, Throat=4, ThirdEye=5, Crown=6, Transpersonal=7
PLANET_CHAKRA = [
    6,  # Sun(0)     → Crown (Sahasrara)
    5,  # Moon(1)    → Third Eye (Ajna)
    4,  # Mercury(2) → Throat (Vishuddha)
    3,  # Venus(3)   → Heart (Anahata)
    2,  # Mars(4)    → Solar Plexus (Manipura)
    1,  # Jupiter(5) → Sacral (Svadhisthana)
    0,  # Saturn(6)  → Root (Muladhara)
    7,  # Uranus(7)  → Transpersonal
    7,  # Neptune(8) → Transpersonal
    0,  # Pluto(9)   → Root (deep transformation)
]

# Zodiac sign element: Fire=0, Earth=1, Air=2, Water=3
# Aries(0)=Fire, Taurus(1)=Earth, Gemini(2)=Air, Cancer(3)=Water, Leo(4)=Fire, ...
ZODIAC_ELEMENT = [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3]

def digit_root(n):
    """Digital root of n (1-9 for n>0, 0 for n==0)."""
    if n == 0:
        return 0
    return 1 + (n - 1) % 9

def compute_lut_row(degree, neo4j_hexes=None):
    """Compute all 26 Clock_Degree_Entry fields for a given degree (0-359)."""
    # ── Identity ────────────────────────────────────────────────────────────
    degree_node_360  = degree
    exact_degree_720 = degree * 2.0

    # ── Ring membership ─────────────────────────────────────────────────────
    zodiac_sign    = degree // 30          # 0-11
    zodiac_degree  = degree % 30           # 0-29
    decan_idx      = degree // 10          # 0-35
    decan_position = degree % 10           # 0-9
    # 24 palindromic backbone anchors at every 15° (360/15 = 24)
    is_backbone_node = 1 if (degree % 15 == 0) else 0

    # ── M3 symbolic layer ───────────────────────────────────────────────────
    # Hexagram: use Neo4j data if available, else linear approximation
    # 384 LUT slots = 64 hexagrams × 6 lines; each degree maps to one slot
    lut_slot      = (degree * 384) // 360   # 0-383
    hexagram_id   = lut_slot // 6           # 0-63  which hexagram
    hexagram_line_active = lut_slot % 6     # 0-5   which line within hexagram

    if neo4j_hexes and degree in neo4j_hexes:
        hexagram_id = neo4j_hexes[degree]
        # Recompute line from Neo4j hex: use degree position within decan
        hexagram_line_active = (degree % 6)

    # Codon nucleotide pairs: derived from hexagram binary encoding
    # Upper trigram = bits 5-3, lower trigram = bits 2-0 of hexagram_id
    # Each trigram nucleotide pair: approximate from hexagram structure
    # (full dataset sourced values from #3-2 codon nodes when available)
    codon_upper_pair = (hexagram_id >> 3) & 0x03   # bits 4-3 of hexagram
    codon_lower_pair = hexagram_id & 0x03           # bits 1-0 of hexagram

    # 3-tier codon classification: algorithmic from nucleotide positions
    # n1=outer, n2=middle (from hexagram line), n3=inner
    n1 = codon_upper_pair
    n3 = codon_lower_pair
    n2 = (hexagram_id >> 2) & 0x03  # middle nucleotide from hexagram bits 3-2
    if n1 == n3:
        if n1 == n2:
            codon_class = 0  # CODON_PERFECT_PALINDROMIC
        else:
            codon_class = 1  # CODON_IMPERFECT_PALINDROMIC
    elif n1 == n2 or n2 == n3:
        codon_class = 2      # CODON_NON_PALINDROMIC_NONDUAL
    else:
        codon_class = 3      # CODON_DUAL

    # Non-dual: all non-dual codons (40 total), not just backbone
    is_non_dual_codon = 1 if codon_class < 3 else 0

    # Tarot card: unavailable without decan→tarot dataset (#2-3 → #3-4 relations)
    tarot_card_id = 0

    # ── M2 vibrational layer ─────────────────────────────────────────────────
    decan_planet  = DECAN_RULER_TABLE[decan_idx]    # canonical mod-10
    decan_element = ZODIAC_ELEMENT[zodiac_sign]      # Fire/Earth/Air/Water
    decan_chakra  = PLANET_CHAKRA[decan_planet]

    # ── M1 mathematical layer ─────────────────────────────────────────────────
    # tick12: canonical spanda stage (0-11), one per 30° zodiac sign
    tick12 = zodiac_sign  # 0-11, equivalent to zodiac sign for static computation

    # strand: 0=Strand-A/explicate (0-179°), 1=Strand-B/implicate (180-359°)
    strand = 1 if degree >= 180 else 0

    # dr_ring: digit root classification
    # 0=Mahamaya ring {1,2,4,8,7,5}, 1=Parashakti ring {3,6,9}
    dr = digit_root(degree)
    dr_ring = 1 if dr in (3, 6, 9) else 0

    # m1_ananda_value: harmonic value from M1 Paramasiva dataset (unavailable here)
    m1_ananda_value = 0

    # ── M0 archetypal layer ──────────────────────────────────────────────────
    # 0=unavailable without M0 dataset correlation
    m0_archetype = 0

    # ── SU(2) double-cover shadow identity ──────────────────────────────────
    shadow_degree  = degree + 360              # always in [360, 719]
    polar_opposite = (degree + 180) % 360      # antipodal point

    # ── Enneadic chamber ────────────────────────────────────────────────────
    enneadic_chamber = degree // 40            # 0-8 (9 chambers of 40° each)
    # Day half = first 20° of chamber, Night half = second 20°
    chamber_day_night = 0 if (degree % 40) < 20 else 1

    return {
        'degree_node_360':   degree_node_360,
        'exact_degree_720':  exact_degree_720,
        'zodiac_sign':       zodiac_sign,
        'zodiac_degree':     zodiac_degree,
        'decan_idx':         decan_idx,
        'decan_position':    decan_position,
        'is_backbone_node':  is_backbone_node,
        'hexagram_id':       hexagram_id,
        'hexagram_line_active': hexagram_line_active,
        'is_non_dual_codon': is_non_dual_codon,
        'codon_class':       codon_class,
        'codon_upper_pair':  codon_upper_pair,
        'codon_lower_pair':  codon_lower_pair,
        'tarot_card_id':     tarot_card_id,
        'decan_planet':      decan_planet,
        'decan_element':     decan_element,
        'decan_chakra':      decan_chakra,
        'tick12':            tick12,
        'strand':            strand,
        'dr_ring':           dr_ring,
        'm1_ananda_value':   m1_ananda_value,
        'm0_archetype':      m0_archetype,
        'shadow_degree':     shadow_degree,
        'polar_opposite':    polar_opposite,
        'enneadic_chamber':  enneadic_chamber,
        'chamber_day_night': chamber_day_night,
    }

def try_neo4j_query():
    """Try to query Neo4j for real hexagram assignments. Returns dict{degree: hex_id} or None."""
    uri = os.environ.get('NEO4J_URI')
    password = os.environ.get('NEO4J_PASSWORD', 'password')
    if not uri:
        return None
    try:
        from neo4j import GraphDatabase
        driver = GraphDatabase.driver(uri, auth=('neo4j', password))
        # Dataset coordinates: hexagrams at #3-1-0-{0..63}
        # Degree nodes in M3 dataset at degree-level
        query = """
        MATCH (d:DegreeNode)-[:HAS_HEXAGRAM]->(h:Hexagram)
        RETURN d.degree AS degree, h.hexagram_id AS hex_id
        ORDER BY d.degree
        """
        hex_by_degree = {}
        with driver.session() as session:
            for record in session.run(query):
                hex_by_degree[int(record['degree'])] = int(record['hex_id'])
        driver.close()
        return hex_by_degree if hex_by_degree else None
    except Exception as e:
        print(f"// Neo4j query failed: {e}", file=sys.stderr)
        return None

def format_entry(e):
    """Format a single Clock_Degree_Entry initializer (all 26 fields in struct order)."""
    d = e['degree_node_360']
    return (
        f"    /* deg={d:3d} decan={e['decan_idx']:2d} sign={e['zodiac_sign']:2d}"
        f" {'BB' if e['is_backbone_node'] else '  '}"
        f" hex={e['hexagram_id']:2d}L{e['hexagram_line_active']}"
        f" planet={e['decan_planet']} chakra={e['decan_chakra']} */\n"
        f"    {{"
        f" {d:3d}U, {e['exact_degree_720']:.1f}f,"
        f" {e['zodiac_sign']:2d},{e['zodiac_degree']:2d},"
        f" {e['decan_idx']:2d},{e['decan_position']:2d},"
        f" {e['is_backbone_node']},"
        f" {e['hexagram_id']:2d},{e['hexagram_line_active']},"
        f" {e['is_non_dual_codon']},{e['codon_class']},"
        f" {e['codon_upper_pair']},{e['codon_lower_pair']},"
        f" {e['tarot_card_id']},"
        f" {e['decan_planet']},{e['decan_element']},{e['decan_chakra']},"
        f" {e['tick12']:2d},{e['strand']},{e['dr_ring']},"
        f" {e['m1_ananda_value']},{e['m0_archetype']},"
        f" {e['shadow_degree']:3d}U,{e['polar_opposite']:3d}U,"
        f" {e['enneadic_chamber']},{e['chamber_day_night']}"
        f" }},"
    )

def generate_c_source(entries):
    lines = [
        '/* m3_clock_lut.c — CLOCK_DEGREE_LUT[360]',
        ' *',
        ' * AUTO-GENERATED by tools/build_clock_degree_lut.py',
        ' * Do not edit by hand. Run:',
        ' *   python3 tools/build_clock_degree_lut.py > Body/S/S0/epi-lib/src/m3_clock_lut.c',
        ' *',
        ' * 385-node structure: 360 degree nodes + 24 backbone (d%15==0) + 1 Axis Mundi',
        ' * Structural law: 360+24 == 64*6 (clock topology = I-Ching LINE_CHANGE count)',
        ' *',
        ' * Field order matches Clock_Degree_Entry in m3.h (27 fields):',
        ' *   degree_node_360, exact_degree_720,',
        ' *   zodiac_sign, zodiac_degree, decan_idx, decan_position, is_backbone_node,',
        ' *   hexagram_id, hexagram_line_active, is_non_dual_codon, codon_class,',
        ' *   codon_upper_pair, codon_lower_pair, tarot_card_id,',
        ' *   decan_planet, decan_element, decan_chakra,',
        ' *   tick12, strand, dr_ring, m1_ananda_value, m0_archetype,',
        ' *   shadow_degree, polar_opposite, enneadic_chamber, chamber_day_night',
        ' *',
        ' * Source: docs/plans/CLOCK-AND-NARA-SPECS/09-cosmic-clock-plugin-tui-spec.md',
        ' *         docs/specs/M/2026-03-12-cosmic-clock-full-architecture.md',
        ' */',
        '',
        '#include "m3.h"',
        '',
        'const Clock_Degree_Entry CLOCK_DEGREE_LUT[360] = {',
    ]
    for e in entries:
        lines.append(format_entry(e))
    lines.append('};')
    return '\n'.join(lines) + '\n'

def main():
    neo4j_hexes = try_neo4j_query()
    if neo4j_hexes:
        print(f"// Using Neo4j hexagram data for {len(neo4j_hexes)} degrees", file=sys.stderr)
    else:
        print("// Using computed hexagram approximation (no Neo4j)", file=sys.stderr)

    entries = []
    backbone_count = 0
    for degree in range(360):
        e = compute_lut_row(degree, neo4j_hexes)
        if e['is_backbone_node']:
            backbone_count += 1
        entries.append(e)

    assert backbone_count == 24, f"Expected 24 backbone nodes, got {backbone_count}"
    print(f"// backbone_count={backbone_count} (expect 24)", file=sys.stderr)

    print(generate_c_source(entries))

if __name__ == '__main__':
    main()
