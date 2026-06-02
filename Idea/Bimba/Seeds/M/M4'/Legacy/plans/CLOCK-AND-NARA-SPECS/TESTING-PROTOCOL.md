# NARA + COSMIC CLOCK — TESTING PROTOCOL

**Branch:** `claude/nara-clock-impl`
**Binary:** `epi-cli/target/debug/epi`
**Last updated:** 2026-03-30

---

## HOW TO GET INTO IT

### Build the binary

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments/epi-cli"
cargo build
```

Binary lives at: `epi-cli/target/debug/epi`

> `/usr/local/bin/epi` is an older shadow binary — always use the full path or add
> `epi-cli/target/debug` to the front of your `PATH`:
> ```bash
> export PATH="/Users/admin/Documents/Epi-Logos C Experiments/epi-cli/target/debug:$PATH"
> ```

### Launch the TUI portal

```bash
epi portal
```

- Tab 1 = **Personal** (M4'–M5') — oracle, identity, spine, mini-clock
- Tab 2 = **Structural** (M0'–M3') — cosmic clock, vibrational matrix, knowing dossier
- Switch tabs: `Tab` key
- Quit: `q`
- Navigate panes: arrow keys / `hjkl`

Launch directly into a tab:

```bash
epi portal --tab personal
epi portal --tab structural
epi portal --reset       # factory-default layout
```

---

## SECTION 1 — IDENTITY + WIND

### 1.1 Wind from scratch (first boot)

```bash
epi nara wind \
  --birth-date 1990-06-15 \
  --birth-time 14:30 \
  --birth-lat 51.5 \
  --birth-lon -0.1
```

Expected: `Nara wound. 2 layer(s) present. Hash: xxxxxxxx`

Check what was written:

```bash
epi nara identity show
epi nara identity layers
cat ~/.epi-logos/nara/identity/profile.json
cat ~/.epi-logos/nara/identity/quintessence.bin | xxd | head -4
```

The quintessence.bin must be exactly 32 bytes. Hash preview in profile must be the first 8 hex chars of the 64-char BLAKE3 hash.

### 1.2 Re-wind guard

```bash
epi nara wind --birth-date 1990-06-15
```

Expected error: `Already wound today. Use --force to override.`

```bash
epi nara wind --birth-date 1990-06-15 --force
```

Expected: succeeds and updates `last_wound` timestamp.

### 1.3 Identity set (individual layers)

```bash
epi nara identity set birth-date 1990-06-15
epi nara identity set jungian INFJ
epi nara identity set gene-keys 42
epi nara identity set human-design Generator
```

After each `set`, verify that `profile.json` has the `elemental_profile` field populated on the updated layer:

```bash
cat ~/.epi-logos/nara/identity/profile.json | python3 -m json.tool | grep -A5 elemental_profile
```

Each layer should have `"elemental_profile": [f32, f32, f32, f32]` — NOT null.

### 1.4 Quintessence hash check

```bash
epi nara identity compute
```

Expected: 64-char hex string. Must match first 8 chars of `hash_preview` in `profile.json`.

```bash
epi nara identity show --json | python3 -m json.tool
```

---

## SECTION 2 — KAIROS

### 2.1 Kairos sync (requires Python + kerykeion)

```bash
pip3 install kerykeion   # if not already installed
epi nara kairos sync
```

Expected: writes `~/.epi-logos/nara/kairos/current.json` in `KerykeionResult` format.

```bash
epi nara kairos show
epi nara kairos status
```

`status` should show freshness (minutes since last sync).

### 2.2 Kairos without Python (graceful degradation)

Temporarily rename Python or unset PATH, then:

```bash
epi nara kairos sync
```

Expected: warning printed, no crash, `epi nara clock` still works with zeroed planet degrees.

---

## SECTION 3 — CLOCK

### 3.1 Clock state

```bash
epi nara clock
epi nara clock --json
```

JSON output must include:
- `tick12` — u8 0–11
- `current_degree` — u16 0–359
- `session_hash` — 64 hex chars (NOT all zeros)
- `quintessence_quaternion` — 4 floats, NOT all zeros if identity is wound

### 3.2 Decan and resonance

```bash
epi nara decan
epi nara resonance
epi nara status
```

`status` shows a composite of identity + kairos + clock in one view.

---

## SECTION 4 — ORACLE (CLI)

### 4.1 I-Ching cast

```bash
epi nara oracle cast \
  --system iching \
  --question "What is the quality of this moment?" \
  -y
```

Expected output includes:
- `I-Ching Cast #N`
- Primary hexagram (1–64)
- Relating / Nuclear hexagram
- 6 line values with young/old yin/yang labels
- `Degree: N.N°`
- `Body:` line with dynamics and chakra numbers
- `Zones:` line with anatomical zones

### 4.2 Tarot cast

```bash
epi nara oracle cast \
  --system thoth \
  --question "What element is present?" \
  -y
```

Expected output:
- `Tarot Draw #N (thoth)`
- 3 cards with position, card ID, reversed flag, and `[ELEMENT]` label
- `Degree:` line
- `Charges — pp:N nn:N pn:N np:N` line
- `Body:` and `Zones:` from hexagram body map

Try other systems:

```bash
epi nara oracle cast --system rws --question "test" -y
epi nara oracle cast --system marseille --question "test" -y
```

### 4.3 Oracle payload

```bash
epi nara oracle payload
```

Expected: structured JSON or display showing all 4 faces (degree, deficient_degree, implicate_720, temporal_hex) and pp/nn/pn/np charges.

### 4.4 Oracle hygiene + history

```bash
epi nara oracle hygiene
epi nara oracle history
```

Hygiene should warn if a cast was done within the last 10 minutes.
History shows the last 10 casts in reverse order.

### 4.5 Consent gate

```bash
epi nara oracle cast --system iching --question "test"
```

Without `-y`, should print: `Cast oracle? This is a sacred portal. [y/N]:`
Type `n` — should print `oracle: cast cancelled` with no error code.

---

## SECTION 5 — MEDICINE

```bash
epi nara medicine balance
epi nara medicine chakra
epi nara medicine prescribe
epi nara medicine materia
```

`prescribe` integrates oracle degree → decan → planet → chakra → body zones.
Verify the chain by checking that the decan shown in `epi nara decan` corresponds to the body zones in `prescribe`.

---

## SECTION 6 — PORTAL TUI PLUGINS

### 6.1 Enter the portal

```bash
epi portal
```

### 6.2 Tab 1 — Personal (M4'–M5')

| Plugin | Test |
|--------|------|
| **M4 Identity** | Shows hash preview, layer count, wound timestamp. Press `r` to refresh after `epi nara identity set`. |
| **M4 Oracle** | Press `c` to initiate cast. Consent prompt appears. Press `y`. Cast completes; display shows hexagram + lines. Press `c` again — hygiene warning if too soon. |
| **M4 Spine** | Shows 8 chakras with decay indicators. Should update after oracle cast. |
| **Mini Clock** | 12-tick spanda wheel. Tick position should update when oracle cast changes clock state. |

### 6.3 Tab 2 — Structural (M0'–M3')

| Plugin | Test |
|--------|------|
| **Cosmic Clock** | Full 360-degree ring display. After an oracle cast in Tab 1, switch to Tab 2 and verify `current_degree` marker moved. |
| **M2 Vibrational Matrix** | 72-fold epogdoon display. Should reflect current spanda state. |
| **M3 Knowing Dossier** | Press `a` (auto-suggest) — should propose a dossier concept based on current tick12. |

### 6.4 SharedClockState propagation test

1. Note the `current_degree` shown in Cosmic Clock (Tab 2).
2. Switch to Tab 1 and cast an I-Ching (`c` → `y`).
3. Switch back to Tab 2.
4. `current_degree` in Cosmic Clock should have updated.
5. `tick12` in Mini Clock should have updated.

This verifies the `Arc<Mutex<PortalClockState>>` SharedClockState chain is live.

---

## SECTION 7 — TRANSFORM + LENS + LOGOS

```bash
epi nara transform status
epi nara transform recipe

epi nara lens list
epi nara lens jungian
epi nara lens trika
epi nara lens synthesize

epi nara logos status
epi nara logos stage --json
```

---

## SECTION 8 — JSON OUTPUT MODE

Every command supports `--json`. Spot-check these:

```bash
epi nara clock --json
epi nara oracle cast --system iching --question "json test" -y --json
epi nara identity show --json
epi nara medicine prescribe --json
epi nara status --json
```

All should emit valid JSON with no extra text. Pipe to `python3 -m json.tool` to verify.

---

## SECTION 9 — SPACETIMEDB DISPATCH (stub verification)

The SpacetimeDB bridge is wired but uses a stub client (no live server required).
Verify dispatch fires without error:

```bash
epi nara oracle cast --system iching --question "spacetime test" -y 2>&1
```

Should NOT see `spacetime: error` in stderr. The stub logs intent silently.

```bash
epi nara kairos sync 2>&1
```

Same — no spacetime error.

---

## SECTION 10 — C LIBRARY

```bash
cd "/Users/admin/Documents/Epi-Logos C Experiments"
make test
```

Expected: `=== All test suites passed ===` with `110/110` C tests and `5/5` VAK tests.

Specifically verify `engine_spanda_walk` is exercised:

```bash
grep -n "spanda" epi-lib/test/test_engine.c
```

---

## WHAT TO WATCH FOR (Known Edge Cases)

| Situation | Expected behaviour |
|-----------|-------------------|
| No kerykeion installed | `epi nara kairos sync` warns and exits gracefully; clock still shows tick12=0, degree=0 |
| No profile wound | `epi nara wind` without `--birth-date` returns error; `epi portal` loads with zeroed quintessence_quaternion |
| Reversed tarot card | Element label in output shows element name with implicit negation (charge contribution is negative) |
| kairos_degree=0.0 in tarot CLI cast | Expected — CLI doesn't have live clock degree; portal plugin does |
| `--force` wind re-derives BLAKE3 | quintessence.bin bytes should differ if new birth data is different |
| Session hash in clock --json | 64 hex chars, NOT all zeros (requires profile to be wound first) |
