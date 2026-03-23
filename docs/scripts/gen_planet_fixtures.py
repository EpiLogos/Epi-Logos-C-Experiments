#!/usr/bin/env python3
"""
gen_planet_fixtures.py — Emit canonical mod-10 planet ordering + EarthBody spec.
Source: 00-canonical-invariants.md §2
"""
import json, os

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

CANONICAL_PLANETS = [
    {"index": 0, "name": "Sun",     "is_transpersonal": False, "note": "stable root/parent — NOT chakra-mapped"},
    {"index": 1, "name": "Moon",    "is_transpersonal": False},
    {"index": 2, "name": "Mercury", "is_transpersonal": False},
    {"index": 3, "name": "Venus",   "is_transpersonal": False},
    {"index": 4, "name": "Mars",    "is_transpersonal": False},
    {"index": 5, "name": "Jupiter", "is_transpersonal": False},
    {"index": 6, "name": "Saturn",  "is_transpersonal": False},
    {"index": 7, "name": "Uranus",  "is_transpersonal": True},
    {"index": 8, "name": "Neptune", "is_transpersonal": True},
    {"index": 9, "name": "Pluto",   "is_transpersonal": True},
]

EARTH_BODY = {
    "name": "Earth",
    "chakra_id": 0,
    "in_planet_array": False,
    "role": "geocentric observer / solar child of Sun / clock center",
    "note": "9:8 epogdoon — EarthBody + 7 chakras = 8 bodily sites vs 9 non-Sun planets"
}

fixture = {
    "canonical_planets": CANONICAL_PLANETS,
    "earth_body": EARTH_BODY,
    "epogdoon": {
        "ratio": "9:8",
        "numerator": "9 non-Sun planets (Moon through Pluto)",
        "denominator": "8 bodily sites (EarthBody + 7 chakras)",
        "note": "this asymmetry IS the interval — do not resolve it"
    }
}

# Assertions
assert len(CANONICAL_PLANETS) == 10
assert CANONICAL_PLANETS[0]["name"] == "Sun"
assert CANONICAL_PLANETS[9]["name"] == "Pluto"
assert CANONICAL_PLANETS[7]["name"] == "Uranus"
transpersonal = [p for p in CANONICAL_PLANETS if p["is_transpersonal"]]
assert len(transpersonal) == 3  # Uranus, Neptune, Pluto
assert EARTH_BODY["chakra_id"] == 0
assert EARTH_BODY["in_planet_array"] == False
print(f"Assertions passed. {len(CANONICAL_PLANETS)} planets + EarthBody.")

FIXTURE_DIR = os.path.join(REPO, "epi-lib", "test", "fixtures", "nara_clock")
os.makedirs(FIXTURE_DIR, exist_ok=True)
path = os.path.join(FIXTURE_DIR, "planet_canonical.json")
with open(path, "w") as f:
    json.dump(fixture, f, indent=2)
print(f"Written: {path}")
