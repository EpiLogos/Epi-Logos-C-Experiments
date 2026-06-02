# M2 Parashakti: Divine Vibrational Web

**Source dataset:** `Idea/Bimba/Map/datasets/parashakti-deep/nodes-full-detail.json` (595 nodes, UTF-8 BOM)
**Scope:** Coordinates #2-4.0 through #2-4.3 — the four inner branches of the Vibrational Arena (#2-4)
**Date extracted:** 2026-03-12
**Header cross-referenced:** `epi-lib/include/m2.h`

---

## Overview

`#2-4` is named **Parashakti: Vibrational Arena of Archetypal Powers**. It is the contextual (#4
lemniscate) branch within M2, operating as a nested QL cycle from .0 to .5:

| Sub-branch | Coordinate | Name | Count | QL Role |
|---|---|---|---|---|
| #2-4.0 | Asma ul-Husna | 99+1 Divine Names | 100 nodes | Implicit potential — unmanifest field |
| #2-4.1 | 100 Shaivite Mantras | Matrika (50) + Malini (50) | 100 nodes | Material cause — sonic substance |
| #2-4.2 | 24 Spiritual Maqamat | 8 stations × 3 levels | 24 nodes | Efficient cause — processual path |
| #2-4.3 | 72 Musical Maqamat | 9 families × ~8 variants | 72 nodes | Formal mediation — modal framework |
| #2-4.5 | 72 Names of God (Shem) | — | 72 nodes | Quintessential synthesis |

The `#2-4.3` count of 72 directly mirrors the `M2_Vibrational_72_Space` union and the `M2_MAQAM_DESC[72]` table in `m2.h`. The 99+1 Asma structure maps to `M2_ASMA_LUT[100]` (with index 99 = `ASMA_HIDDEN_INDEX` = Al-Ism al-A'zham).

---

## 1. 99 Names (Asma ul-Husna) — Structure and Abjad Web

### 1.1 Structural Architecture

Al-Buni's 10×10 magic square: every segment totals **3394** (digital root **19**).

| Group | Index Range | Name | Quality | C Struct Field |
|---|---|---|---|---|
| `#2-4.0-0/1` | index 99 | Al-Ism al-A'zham (Hidden) | 0/1 non-dual totality | `M2_ASMA_LUT[99]` (`ASMA_HIDDEN_INDEX`) |
| `#2-4.0-0/1-0-*` | 0–32 | **Jalal** (Majesty) | Transcendence, sovereignty, power | `Asma_Name_Desc.group = 0` (Jalal) |
| `#2-4.0-0/1-1-*` | 33–65 | **Jalal** (foundational attributes) | Life, knowledge, will, unity | `Asma_Name_Desc.group = 1` |
| `#2-4.0-0/1-2-*` | 66–98 | **Kamal** (Perfection/Jamal) | Mercy, beauty, forgiveness | `Asma_Name_Desc.group = 2` (Jamal) |

The dataset coordinate schema maps: group 0 = Jalal/Majesty (positions 0–32), group 1 = Jalal/Foundational (33–65), group 2 = Kamal-Jamal (66–98). The structural order in `#2-4.0` is: Jalal (0–32) → Kamal (33–65) → Jamal (66–98).

### 1.2 Digital Root Distribution

The `Asma_Name_Desc.digital_root` field encodes the digital root of each name's abjad value. Distribution across the 99 names:

| DR | Count | Representative names |
|---|---|---|
| 1 | 15 | Al-Maalik (91), Al-Awwal (37), Al-Mujib (55), Al-Mumin (136) |
| 2 | 17 | Al-Khaliq (731), Al-Muntaqim (623), Al-Ali (110), Ar-Rahman (398) |
| 3 | 8 | Al-A'la (111), Al-Musawwir (336), Al-Qayyum (156), Al-Majid (57) |
| 4 | 12 | Al-Mumit (490), Al-Khafidh (1084), Al-Muqaddim (184), Al-Aziz (94) |
| 5 | 11 | Al-Matin (500), Al-Hakam (68), Al-Muhyi (68), Al-Baqi (113) |
| 6 | 8 | Al-Hakeem (78), Ar-Raqib (312), Al-Mudhill (78), Al-Bari (213) |
| 7 | 5 | Al-Kabir (232), Al-Ghani (1060), Ar-Rahim (358), Al-Haleem (88) |
| 8 | 10 | Al-Hasib (80), Al-Quddus (170), Al-Jabbar (206), Al-Qawi (116) |
| 9 | 13 | Al-Malik (90), An-Nasir (351), Al-Mu'izz (117), Al-Basit (72) |

`ASMA_GET_DR(desc)` macro reads `desc->digital_root`. The routing masks `ASMA_36_INTERNAL_MASK` and `ASMA_64_PROJECTIVE_MASK` provide O(1) lookup into the internal (36) vs projective (64) partition.

### 1.3 Ummahat al-Asma — Seven Mother Names

The dataset marks seven names with `ummahatAlAsma: true` — the foundational sub-set from which all 99 derive. These correspond to the seven classical divine attributes (sifat dhatiyya):

| Order | Coordinate | Name | Arabic | Abjad | DR | Attribute |
|---|---|---|---|---|---|---|
| 1 | `#2-4.0-0/1-1-0` | Al-Hayy | الحي | 18 | 9 | Life |
| 2 | `#2-4.0-0/1-1-1` | Al-Qayyum | القيوم | 156 | 3 | Self-Sustenance |
| 3 | `#2-4.0-0/1-1-2` | Al-Aleem | العليم | 150 | 6 | Knowledge |
| 4 | `#2-4.0-0/1-1-4` | Al-Mureed | المريد | 254 | 2 | Will |
| 5 | `#2-4.0-0/1-1-5` | As-Samee | السميع | 180 | 9 | Hearing |
| 6 | `#2-4.0-0/1-1-6` | Al-Baseer | البصير | 302 | 5 | Sight |
| 7 | `#2-4.0-0/1-1-7` | Al-Mutakallim | المتكلم | 631 | 1 | Speech |

These seven align with the seven `Planet_Operator` entries (Sun through Mars) at the count level — both form a 7-fold functional scaffold within an 8-fold (or 100-fold) container. No direct planet↔name mapping is encoded in the dataset fields; the correspondence is archetypal and indirect (see §2).

### 1.4 Mirror Symmetry

The 99 names form **49 mirror pairs** equidistant from center position 49.5 (Al-Azeem, abjad=1020, DR=3, `#2-4.0-0/1-1-16`). The 100th hidden name is the mirror principle itself. In `Asma_Name_Desc`: `mirror_idx` field (0xFF = no mirror). The `ASMA_HAS_MIRROR(desc)` macro checks this.

---

## 2. Planet ↔ Divine Name Correspondences

The dataset does not store explicit `planet_id` fields on individual Asma nodes. The correspondence is encoded through the **maqam family** layer (#2-4.3), where each family carries `spiritualCorrespondences` linking specific divine names to tonal-emotional qualities that align with planets:

### 2.1 Maqam-mediated Planet ↔ Divine Name Bridge

| Planet (`Planet_Id`) | Maqam Family | Divine Names Referenced | Interval | Planetary Mode |
|---|---|---|---|---|
| `PLANET_SUN` (0) | Rast (#2-4.3-1) | Al-Malik (sovereignty), al-Jalil (majesty), an-Nur (light) | Major 2nd (9:8) | Dorian |
| `PLANET_VENUS` (2) | Bayati (#2-4.3-2) | Al-Jamil (beauty), ar-Rahman (mercy), al-Wadud (love) | Major 2nd (9:8) | Hypolydian |
| `PLANET_MERCURY` (3) | Sikah (#2-4.3-3) | Al-Batin (hidden), al-Hakim (wise), mystical unveiling | Major 3rd (5:4) | Hypophrygian |
| `PLANET_MOON` (4) | Hijaz (#2-4.3-4) | Al-Ali (transcendence), pilgrimage, sacred presence | Perfect 4th (4:3) | Hypodorian |
| `PLANET_SATURN` (5) | Kurd (#2-4.3-7) | Al-Batin (hiddenness), inner journey, contemplative wisdom | Perfect 5th (3:2) | Mixolydian |
| `PLANET_JUPITER` (6) | Ajam (#2-4.3-6) | Al-Mubin (clarity), manifest beauty, childlike wonder | Major 6th (5:3) | Lydian |
| `PLANET_MARS` (7) | Nawa Athar (#2-4.3-9) | Al-Wahid (uniqueness), transformative power | Major 7th (15:8) | Phrygian |

**Note:** The planet-mode mapping above derives from the dataset's `planetaryMode` field on each `#2-5-X` node and the `spiritualCorrespondences` on each `#2-4.3-X` family node. It represents the dataset's encoded correspondence, not a direct struct field.

### 2.2 Planet Bija Mantras (Kashmir Shaivism)

Each planet node carries a `kashimirBijaMantra` field, giving its seed-syllable in the Shaiva system:

| Planet (`Planet_Id`) | Bija Mantra | Principle |
|---|---|---|
| Sun (`PLANET_SUN`, 0) | Hrīṃ | Prakasha — self-luminous awareness |
| Venus (`PLANET_VENUS`, 2) | Klīṃ | Kāmakalā — desire as creative power |
| Mercury (`PLANET_MERCURY`, 3) | Aiṃ | Vāgbhava — articulated awareness (Sarasvatī) |
| Moon (`PLANET_MOON`, 4) | Sauḥ | Soma — ānanda and amṛta of consciousness |
| Saturn (`PLANET_SATURN`, 5) | Hlīṃ | Stambhana — apparent limitation for consciousness play |
| Jupiter (`PLANET_JUPITER`, 6) | Strīṃ | Expansion śakti — pervading and encompassing |
| Mars (`PLANET_MARS`, 7) | Krīṃ | Kālī — cutting through obstacles |

These bija syllables bridge to the Mantra system (#2-4.1): they are consonant-vowel combinations whose articulation points and tattva correspondences are encoded in `M2_MANTRA_LUT[100]` and `Mantra_Entry_Desc.element_id`.

### 2.3 Planet Scalar Position and Epogdoon

The planetary scale is not metaphorical — the dataset explicitly states *"the planets ARE the musical scale itself"* (Venus node). The `M2_MAQAM_RATIOS[10]` table in `m2.h` encodes the Pythagorean ratios:

| Scalar Degree | Planet | Interval | Ratio | C Struct Ref |
|---|---|---|---|---|
| 1/8 (tonic/octave) | Sun | Unison/Octave | 1:1 / 2:1 | `PLANET_SUN` (0) |
| 2 | Venus | Major 2nd | 9:8 | `PLANET_VENUS` (2) |
| 3 | Mercury | Major 3rd | 5:4 | `PLANET_MERCURY` (3) |
| 4 | Moon | Perfect 4th | 4:3 | `PLANET_MOON` (4) |
| 5 | Saturn | Perfect 5th | 3:2 | `PLANET_SATURN` (5) |
| 6 | Jupiter | Major 6th | 5:3 | `PLANET_JUPITER` (6) |
| 7 | Mars | Major 7th | 15:8 | `PLANET_MARS` (7) |

Venus at degree 2 (9:8 interval) is the **epogdoon carrier** — it literally encodes the 72→64 compression ratio (`m2_epogdoon_compress()` in `m2.h`). This is the M2→M3 bridge via `M2_TO_M3_CYMATIC_PROJECTION[72]`.

---

## 3. Tattva ↔ Mantra Table

### 3.1 Shiva Vowels (16) — Pure Consciousness Tier

The 16 Shiva vowels form the first 16 entries of the Matrika system (`#2-4.1-0-0-0` through `#2-4.1-0-0-15`). Each carries a `tattvaCorrespondence` (index into `M2_TATTVA_DESC[36]`), `chakraAssociation`, and `elementalCorrespondence`. These map directly onto `Mantra_Entry_Desc.element_id` and `Tattva_Entry_Desc.element_id`:

| # | Mantra | Tattva(s) | Chakra | Element | Freq | Principle |
|---|---|---|---|---|---|---|
| 0 | A-KĀRA | [1] Śiva tattva | ANAHATA | AKASHA | 256 Hz | Pure awareness |
| 1 | Ā-KĀRA | [2] Śakti tattva | ANAHATA_VISTAR | AKASHA | 256 Hz | Creative expansion |
| 2 | I-KĀRA | [3] Sadāśiva tattva | SOLAR_PLEXUS | FIRE | 320 Hz | Śiva-Śakti balanced |
| 3 | Ī-KĀRA | [4] Īśvara tattva | THROAT_COMMAND | FIRE | 320 Hz | Lordship |
| 4 | U-KĀRA | [5] Suddhavidyā tattva | THIRD_EYE | WATER | 256 Hz | Knowledge |
| 5 | Ū-KĀRA | [5] Suddhavidyā (action) | SACRAL | WATER_FLOW | 256 Hz | Action |
| 6 | Ṛ-KĀRA | [6] Māyā tattva | VISHUDDHA | FIRE_KNOWLEDGE | 341 Hz | Non-binary |
| 7 | Ṝ-KĀRA | [6] Māyā (extended) | VISHUDDHA_DEPTH | FIRE_WISDOM_EXT | 341 Hz | Sustained |
| 8 | Ḷ-KĀRA | [36] Pṛthivī (liquid) | MULADHARA↔VISHUDDHA | EARTH_LIQUID | 194 Hz | Grounding |
| 9 | Ḹ-KĀRA | [36] Pṛthivī (complete) | MULADHARA_COMPLETE | EARTH_COMPLETE | 194 Hz | Architectural completion |
| 10 | E-KĀRA | [1, 3] compound | ANAHATA↔MANIPURA | SPACE+FIRE | 288 Hz | Śiva compound |
| 11 | AI-KĀRA | [2, 3] compound | ANAHATA↔MANIPURA_EXT | SPACE+FIRE_EXT | 288 Hz | Extended compound |
| 12 | O-KĀRA | [1, 5] compound | ANAHATA↔AJNA | SPACE+WATER | 256 Hz | Creative compound |
| 13 | AU-KĀRA | [2, 5] compound | ANAHATA↔AJNA_SUPREME | SPACE+WATER_SUP | 256 Hz | Supreme compound |
| 14 | ANUSVĀRA | [0] Anuttara | SAHASRARA_ENTRY | SPACE_RETURN | 432 Hz | Return to source |
| 15 | VISARGA | [2] Śakti emission | ANAHATA_EMISSION | SPACE_CREATIVE | 432 Hz | Creative emission |

**C struct alignment:** `Mantra_Entry_Desc.element_id` uses `Element_Id` enum (AKASHA=0, VAYU=1, AGNI=2, APAS=3, PRITHVI=4). Tattva index goes into the `tattva_idx` field of `Chakra_Descriptor`. The frequency range 144–432 Hz matches `M2_MANTRA_FREQ_MIN`/`M2_MANTRA_FREQ_MAX` macros. The 256 Hz base aligns with `M2_MANTRA_FREQ_BASE`.

### 3.2 Shakti Consonants (34) — Five Articulation Groups

The 34 Shakti consonants are organized into articulation groups, each corresponding to an element. This maps to `Mantra_Entry_Desc.matrika_group` (field `matrika_group`, 0–7):

| Group | Coord | Name | Articulation Point | Element | Element_Id | Creative Function |
|---|---|---|---|---|---|---|
| 0/1 | `#2-4.1-0-1-0/1` | Guttural Group | Throat/Velum | AKASHA (Space) | 0 | Spatial foundation |
| 1 | `#2-4.1-0-1-1` | Palatal Group | Palate | AGNI (Fire) | 2 | Transformative bridge |
| 2 | `#2-4.1-0-1-2` | Cerebral Group | Retroflex | AGNI_JNANA (Fire/Knowledge) | 2 | Specialized transformation |
| 3 | `#2-4.1-0-1-3` | Dental Group | Teeth | APAS (Water) | 3 | Purification flow |
| 4 | `#2-4.1-0-1-4` | Labial Group | Lips | PRITHVI (Earth) | 4 | Material manifestation |
| 5 | `#2-4.1-0-1-5` | Semivowel Group | Multiple | ALL_ELEMENTS | — | Elemental bridge |
| 6 | `#2-4.1-0-1-6` | Sibilant Group | Breath-integrating | ALL_ELEMENTS_BREATH | — | Breath-consciousness |
| 7 | `#2-4.1-0-1-7` | Special Compound | Compound | ALL_ELEMENTS_COMPOUND | — | System integration |

**C struct alignment:** `Mantra_Entry_Desc.matrika_group` (uint8_t, 0–7) indexes these groups. `Mantra_Entry_Desc.phase` (0=Bimba/Descent = Shiva vowels, 1=Pratibimba/Ascent = Shakti consonants). The 50+50 Bimba/Pratibimba split aligns with `tattvas[36][2]` in the 72-Space union, where `[2]` = the two phases.

### 3.3 Tattva Division Cross-Reference

The three tattva divisions from `m2.h` align with the mantra tier structure:

| `Tattva_Division` | Indices | Mantra Tier | Description |
|---|---|---|---|
| `TATTVA_SHUDDHA` (0) | 0–4 | Vowels A, Ā, I, Ī, U (pure Śiva tier) | Pure tattvas — consciousness-only |
| `TATTVA_SHUDDHASHUDDHA` (1) | 5–11 | Vowels Ū through compound diphthongs | Mixed — kanchuka-bound |
| `TATTVA_ASHUDDHA` (2) | 12–35 | Consonant groups (Shakti tier) | Impure tattvas — matter and form |

`Tattva_Entry_Desc.kanchuka_mask` encodes which of the five kanchukas (limiting sheaths) apply for the mixed tattvas.

---

## 4. Maqam ↔ Element / Planet Table

### 4.1 24 Spiritual Maqamat (Sufi Stations)

The 8 stations × 3 levels = 24 coordinates. Each station specifies a maqam family for musical accompaniment, establishing the element/planet inheritance through the family assignment:

| Station | Coord | Name | Musical Family | Family Element | Planet Resonance | Levels |
|---|---|---|---|---|---|---|
| 0 (meta) | `#2-4.2-0` | La Maqam | Free improvisation (taqsim) | Beyond elements | Transcendent | Malamatiyya / Dhatiyyun / Muhaqqiqun |
| 1 | `#2-4.2-1` | Tawba (Repentance) | Rast family | Solar/Air | Sun | Awam / Khawas / Khawas al-Khawas |
| 2 | `#2-4.2-2` | Wara' (Scrupulosity) | Bayati family | Venus/Water | Venus | Awam / Khawas / Khawas al-Khawas |
| 3 | `#2-4.2-3` | Zuhd (Renunciation) | Kurd family | Saturn/Earth | Saturn | Awam / Khawas / Khawas al-Khawas |
| 4 | `#2-4.2-4` | Faqr (Poverty) | Saba family | Moon/Water | Moon | Awam / Khawas / Khawas al-Khawas |
| 5 | `#2-4.2-5` | Sabr (Patience) | Huseyni/Buselik | Mercury | Mercury | Awam / Khawas / Khawas al-Khawas |
| 6 | `#2-4.2-6` | Tawakkul (Trust) | Hijaz family | Moon/Mars | Mars | Awam / Khawas / Khawas al-Khawas |
| 7 | `#2-4.2-7` | Rida (Contentment) | Rast + Ajam | Sun/Jupiter | Jupiter | Awam / Khawas / Khawas al-Khawas |

**C struct alignment:** `Maqam_Spiritual_Desc.station` (0=La Maqam, 1–7=classical), `.level` (0=Awam, 1=Khawas, 2=Khawas al-Khawas). The 8×3=24 arrangement fits `M2_MAQAM_SPIRITUAL[8][3]`.

### 4.2 72 Musical Maqamat — Nine Families

The nine ajnas (scale fragment families) generate the 72 modes. The `Maqam_Musical_Desc.planet_ruler` field in `m2.h` links each maqam to a `Planet_Id`. The dataset provides `spiritualCorrespondences` and `intervalStructure` per family:

| Family | Coord | Name | Interval Structure | Divine Names | Emotional Signature | Time |
|---|---|---|---|---|---|---|
| 0 | `#2-4.3-0` | Independent Maqams | Various (10 modes) | — | Varied | Any |
| 1 | `#2-4.3-1` | Rast | Neutral 3rd pentachord | al-Malik, al-Jalil, an-Nur | Pride, sovereignty, clarity | Dawn |
| 2 | `#2-4.3-2` | Bayati | Neutral 2nd tetrachord | al-Jamil, ar-Rahman, al-Wadud | Tender love, emotional depth | Dawn |
| 3 | `#2-4.3-3` | Sikah | Quarter-tone (E♭½) | al-Batin, al-Hakim | Mystical love, ancient wisdom | Pre-dawn |
| 4 | `#2-4.3-4` | Hijaz | Aug. 2nd tetrachord | al-Ali, pilgrimage presence | Mystical yearning, solitude | Afternoon |
| 5 | `#2-4.3-5` | Nahawand | Natural minor | Human-divine relation | Drama, melancholic beauty | Evening |
| 6 | `#2-4.3-6` | Ajam | Major scale | al-Mubin, childlike wonder | Joy, clarity, celebration | Daytime |
| 7 | `#2-4.3-7` | Kurd | Minor 2nd tetrachord | al-Batin, inner journey | Deep contemplation, monastic | Late night |
| 8 | `#2-4.3-8` | Saba | Complex lowered degrees | Mercy through tribulation | Sacred sadness, purifying grief | Times of loss |
| 9 | `#2-4.3-9` | Nawa Athar | Harmonic minor + raised 4th | al-Wahid, uniqueness | Exotic mystery, transformation | Transitional |

The 9 families × 8 variants = 72 aligns with `M2_MAQAM_DESC[72]` and the `Maqam_Musical_Desc.family` (0–9) and `.mode_in_family` fields. The `intervals[7]` field stores the 7-interval pattern in 24-TET (quarter-tone) units.

### 4.3 Family-Planet Affinity Matrix

Synthesized from dataset `spiritualCorrespondences`, planetary `planetaryMode`, and Sufi station assignments:

| Maqam Family | Primary Planet | Secondary | Element Affinity | Chakra (from `PLANET_CHAKRA`) |
|---|---|---|---|---|
| Rast | Sun | Jupiter | Air/Space | Sahasrara / Ajna |
| Bayati | Venus | Moon | Water | Svadhisthana / Anahata |
| Sikah | Mercury | — | Fire-Knowledge | Vishuddha (Ajna) |
| Hijaz | Moon | Mars | Water | Ajna / Sahasrara (transcendent) |
| Nahawand | Moon | — | Water/Earth blend | Svadhisthana |
| Ajam | Sun | Jupiter | Fire/Air | Manipura / Sahasrara |
| Kurd | Saturn | — | Earth | Muladhara |
| Saba | Moon | Saturn | Water | Svadhisthana (grief/purification) |
| Nawa Athar | Mars | — | Fire | Manipura (transformation) |

---

## 5. C Struct Alignment Notes

### 5.1 `M2_ASMA_LUT[100]` — `Asma_Name_Desc`

| Dataset Field | Struct Field | Notes |
|---|---|---|
| `abjadValue` | `abjad_value` (uint16_t) | Max observed: 1289. Fits uint16_t (max 65535). |
| `digitalRoot` | `digital_root` (uint8_t) | Range 1–9, verified across all 99 names. |
| Node index in group | `group` (uint8_t) | 0=Jalal, 1=Jalal-foundational, 2=Kamal/Jamal |
| Position within group | `index_in_group` (uint8_t) | 0–32 per group |
| Mirror pair | `mirror_idx` (uint8_t) | 0xFF = none; 49 mirror pairs total |
| `element` (not present in dataset) | `element_id` (uint8_t) | Not directly encoded; derive from DR or chakra |
| `name_idx` (flat 0–99) | `name_idx` (uint8_t) | Must compute: group×33 + position_in_group |
| — | `meaning_id` (uint16_t) | Neo4j node identity ID for lookup |

`_Static_assert(sizeof(Asma_Name_Desc) == 12)` passes. Dataset confirms 103 total nodes (99 names + hidden + 3 group headers).

The routing masks `ASMA_36_INTERNAL_MASK` / `ASMA_64_PROJECTIVE_MASK` partition the 100 names into internal (36, Jalal-core) and projective (64, outward-facing). This 36:64 split mirrors the `Tattva_Entry tattvas[36][2]` in the 72-Space union — the same 36-base constant (`M2_36_BASE`).

### 5.2 `M2_MANTRA_LUT[100]` — `Mantra_Entry_Desc`

| Dataset Field | Struct Field | Notes |
|---|---|---|
| `fundamentalFrequency` | `fundamental_frequency` (uint16_t) | Range 194–432 Hz. All within `M2_MANTRA_FREQ_MIN`/`MAX`. |
| `elementalCorrespondence` | `element_id` (uint8_t) | Maps to `Element_Id` enum. |
| `tattvaCorrespondence[0]` | `matrika_group` (uint8_t) | Primary tattva index used as group marker. |
| Vowel (0–15) vs consonant | `phase` (uint8_t) | 0=Bimba (vowels/Shiva), 1=Pratibimba (consonants/Shakti). |
| `mantra_idx` | `mantra_idx` (uint8_t) | 0–99 flat index. |
| `meaning_id` | `meaning_id` (uint16_t) | Neo4j node identity. |

`_Static_assert(sizeof(Mantra_Entry_Desc) == 8)` confirmed. The 16 Shiva vowels have `phase=0`, the 34 Shakti consonant groups have `phase=1`. The Malini system (#2-4.1-1) provides the remaining 50 consciousness-mantras (indices 50–99).

### 5.3 `M2_MAQAM_DESC[72]` — `Maqam_Musical_Desc`

| Dataset Field | Struct Field | Notes |
|---|---|---|
| Family index (0–9) | `family` (uint8_t) | 9 ajnas. Index 0 = independent maqams. |
| Variant within family | `mode_in_family` (uint8_t) | Up to ~10 variants per family. |
| Scale steps | `intervals[7]` (uint8_t[7]) | 24-TET quarter-tone units. |
| Planet resonance | `planet_ruler` (uint8_t) | `Planet_Id` — derive from family-planet affinity (§4.3). |
| `meaning_id` | `meaning_id` (uint16_t) | Neo4j node identity. |

72 modal entries confirmed in dataset (`#2-4.3` branch). The `M2_MAQAM_RATIOS[10]` table stores the 10 Pythagorean ratios underlying the nine families plus the hidden/independent group.

### 5.4 `M2_MAQAM_SPIRITUAL[8][3]` — `Maqam_Spiritual_Desc`

| Dataset Field | Struct Field | Notes |
|---|---|---|
| Station (0=La Maqam, 1–7) | `station` (uint8_t) | La Maqam (station 0) is the meta-station beyond all. |
| Level (Awam/Khawas/KhK) | `level` (uint8_t) | 0=Awam, 1=Khawas, 2=Khawas al-Khawas. |
| `meaning_id` | `meaning_id` (uint16_t) | Neo4j node identity. |

8×3=24 entries. Mathematical coherence: 24 spiritual maqamat × 3 (levels) = 72 — mirroring the 72 musical maqamat, confirming the dataset comment: *"24×3=72 sonic-spiritual correspondences"*.

### 5.5 `M2_PLANET_LUT[10]` — `Planet_Operator`

The dataset provides all fields needed to populate `Planet_Operator` for the 7 active planets (Sun, Venus, Mercury, Moon, Saturn, Jupiter, Mars). Earth (#2-5-0/1-0) and the transpersonal pair (Neptune/Pluto, `MEANING_ID_PREEMPTED`) complete the 10-entry LUT.

| Planet | `id` | `group_type` | `prime` | Cousto Hz | `digital_root` | Kashmir Bija |
|---|---|---|---|---|---|---|
| Sun | 0 | 0 (identity) | — | 126 | 9 | Hrīṃ |
| Earth | 1 | 0 (identity) | — | 136 | 1 | — |
| Venus | 2 | 2 (SU(3)) | — | 221 | 5 | Klīṃ |
| Mercury | 3 | 1 (SU(2)) | — | 141 | 6 | Aiṃ |
| Moon | 4 | 3 (U(1)) | — | 210 | 3 | Sauḥ |
| Saturn | 5 | 4 (catalytic) | 43 | 148 | 4 | Hlīṃ |
| Jupiter | 6 | 4 (catalytic) | 41 | 184 | 4 | Strīṃ |
| Mars | 7 | 4 (catalytic) | — | 145 | 1 | Krīṃ |
| Neptune | 8 | 5 (transpersonal) | — | 211 | 4 | — |
| Pluto | 9 | 5 (transpersonal) | — | 140 | 5 | — |

`elem_sig` values (from `m2.h` `ELEM_SIG_PACK` macro): must be populated from the chakra assignments in `#2-5-0/1-0` through `#2-5-0/1-7` (the chakra nodes), which provide the primary element and chakra ID for each body. The dataset's chakra nodes at `#2-5-0/1-1` through `#2-5-0/1-7` give `elementalCorrespondence` + `mantraSignature` for Muladhara (Earth/LAM) through Sahasrara (Silence).

### 5.6 `M2_TATTVA_DESC[36]` — `Tattva_Entry_Desc`

The vowel tattva indices [1], [2], [3], [4], [5], [6], [36] from the Matrika dataset correspond to the Shaiva cosmological sequence: Śiva (1), Śakti (2), Sadāśiva (3), Īśvara (4), Suddhavidyā (5), Māyā (6), Pṛthivī (36). This covers indices 0–4 (Shuddha), 5–11 (Shuddhashuddha), and 12–35 (Ashuddha). The compound vowels [1,3], [2,3], [1,5], [2,5] indicate kanchuka-masked mixed tattvas (`Tattva_Division.TATTVA_SHUDDHASHUDDHA`).

### 5.7 `M2_Vibrational_72_Space` Union

All four branch counts confirm the 72-invariant:

| Interpretation | Count | Union View |
|---|---|---|
| 72 Musical Maqamat (`#2-4.3`) | 72 | `mef_lenses[12][6]` |
| 72 Shem HaMephorash (`#2-4.5`) | 72 | `shem_names[8][9]` |
| 72 Decans × 2 faces (`#2-2` branch) | 72 | `decans[4][3][3][2]` |
| 36 Tattvas × 2 phases (`#2-2` branch) | 72 | `tattvas[36][2]` |

All four views are the same 72 bytes — the vibrational ground of M2.

---

## Key Findings Summary

1. **No direct planet field on Asma nodes.** Planet ↔ divine name correspondence is encoded *structurally* via the Maqam bridge (family → planet affinity → divine names in `spiritualCorrespondences`). Implementation should populate `Shem_Name_Desc.planet_link` and `Asma_Name_Desc.element_id` via the maqam-family affinity table in §4.3.

2. **Epogdoon = Venus.** The 9:8 ratio (Venus, scale degree 2) is the exact M2→M3 compression (`m2_epogdoon_compress(72)=64`). `Maqam_Musical_Desc.family=1` (Rast, containing Mahur/Suznak/Nairuz variants) is the primary epogdoon carrier family.

3. **Vowel frequencies align with LUT bounds.** All 16 Shiva vowel frequencies (194–432 Hz) fall within `M2_MANTRA_FREQ_MIN=144` / `M2_MANTRA_FREQ_MAX=432`. The 256 Hz base (`M2_MANTRA_FREQ_BASE`) corresponds to vowels A, Ā, U, Ū, O, AU (the foundational Akasha and Water vowels).

4. **Ummahat al-Asma are 7, not 9.** Despite the Shem system using 8×9=72, the Mother Names are seven (matching planetary count). The 8th Asma position (Al-Waahid, essential unity) extends toward the solar identity, while the 9th (`ANGEL_SERAPHIM` row in Shem) connects to the hidden 100th name.

5. **Saba family = Saturn/Moon grief axis.** This is the most important therapeutic pairing: Saba maqam (#2-4.3-8) carries purifying grief, linking Moon (U(1) phase, `PLANET_MOON`) and Saturn (`PLANET_SATURN`, prime 43). In `M2_CAUSAL_RESONANCE_MASKS[36]`, the bit patterns for Moon and Saturn decans should show high resonance.

6. **Rast = Solar sovereignty cluster.** Rast family (#2-4.3-1) references al-Malik, al-Jalil, an-Nur — all sovereign/light names from the Jalal group (DR=9, DR=9, DR=4 respectively). The Rast tonic (D-D octave, Dorian mode) directly maps to `PLANET_SUN` and `CHAKRA_SAHASRARA`.
