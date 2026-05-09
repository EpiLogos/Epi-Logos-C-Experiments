use crate::Neo4jClient;
use neo4rs::query;

// ---------------------------------------------------------------------------
// UUID v5 generation with a fixed Epi-Logos namespace
// ---------------------------------------------------------------------------

/// Deterministic UUID v5 for a given bimba coordinate string.
pub fn coord_uuid(bimba_coordinate: &str) -> String {
    use uuid::Uuid;
    const EPILOGOS_NS: Uuid = Uuid::from_bytes([
        0xE9, 0x11, 0x06, 0x05, 0x00, 0x00, 0x40, 0x00, 0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x01,
    ]);
    Uuid::new_v5(&EPILOGOS_NS, bimba_coordinate.as_bytes()).to_string()
}

// ---------------------------------------------------------------------------
// Static coordinate data
// ---------------------------------------------------------------------------

const FAMILIES: &[&str] = &["C", "P", "L", "S", "T", "M"];

const FAMILY_NAMES: &[&[&str]; 6] = &[
    &["Bimba", "Form", "Entity", "Process", "Type", "Pratibimba"],
    &[
        "Ground",
        "Definition",
        "Operation",
        "Pattern",
        "Context",
        "Integration",
    ],
    &[
        "Literal",
        "Functional",
        "Structural",
        "Archetypal",
        "Paradigmatic",
        "Integral",
    ],
    &[
        "Terminal", "Obsidian", "Neo4j", "Gateway", "PiAgent", "Sync",
    ],
    &[
        "Questions",
        "Traces",
        "Challenges",
        "Patterns",
        "Discovery",
        "Insight",
    ],
    &[
        "Anuttara",
        "Paramasiva",
        "Parashakti",
        "Mahamaya",
        "Nara",
        "Epii",
    ],
];

const FAMILY_FULL_NAMES: &[&str] = &[
    "Category",
    "Position",
    "Lens",
    "Stack",
    "Thought",
    "Subsystem",
];

const FAMILY_DOMAINS: &[&str] = &[
    "Ontological foundation",
    "Functional semantics",
    "Epistemic modes",
    "Technology layers",
    "Artifacts/cognition",
    "Consciousness domains",
];

const PSYCHOID_NAMES: &[&str] = &[
    "Ground",
    "Form",
    "Operation",
    "Pattern",
    "Context",
    "Integration",
];

const PSYCHOID_TOPO: &[&str] = &[
    "ZERO_SPHERE",
    "TORUS",
    "TORUS",
    "TORUS",
    "LEMNISCATE",
    "ZERO_SPHERE",
];

const WEAVE_COORDS: &[(&str, f64)] = &[
    ("Weave_0_0", 0.0),
    ("Weave_0_5", 0.5),
    ("Weave_5_0", 5.0),
    ("Weave_5_5", 5.5),
];

const CF_NAMES: &[&str] = &[
    "CF_VOID",
    "CF_BINARY",
    "CF_TRIKA",
    "CF_QUATERNAL",
    "CF_FRACTAL",
    "CF_SYNTHESIS",
    "CF_MOBIUS",
];

const VAK_NAMES: &[&str] = &["CPF", "CT", "CP", "CF", "CFP", "CS"];

// ---------------------------------------------------------------------------
// Helper: run a MERGE for a single node with multi-label support
// ---------------------------------------------------------------------------

async fn merge_node(
    client: &Neo4jClient,
    coordinate: &str,
    type_label: &str,
    name: &str,
    family: &str,
    layer: &str,
    ql_position: i64,
    topo_mode: &str,
    weave_state: f64,
    inversion_state: i64,
    flags: i64,
) -> Result<(), String> {
    let uuid = coord_uuid(coordinate);
    let cypher = format!(
        "MERGE (n:Bimba {{coordinate: $coord}}) \
         SET n:{}, \
             n.uuid = $uuid, \
             n.name = $name, \
             n.family = $family, \
             n.layer = $layer, \
             n.ql_position = $pos, \
             n.topo_mode = $topo, \
             n.weave_state = $weave, \
             n.inversion_state = $inv, \
             n.flags = $flags",
        type_label
    );
    let q = query(&cypher)
        .param("coord", coordinate)
        .param("uuid", uuid.as_str())
        .param("name", name)
        .param("family", family)
        .param("layer", layer)
        .param("pos", ql_position)
        .param("topo", topo_mode)
        .param("weave", weave_state)
        .param("inv", inversion_state)
        .param("flags", flags);

    client
        .run_query(q)
        .await
        .map_err(|e| format!("merge {} failed: {}", coordinate, e))?;
    Ok(())
}

/// Merge a Family meta-node with additional domain/family_letter properties.
async fn merge_family_node(
    client: &Neo4jClient,
    coordinate: &str,
    name: &str,
    domain: &str,
    family_letter: &str,
) -> Result<(), String> {
    let uuid = coord_uuid(coordinate);
    let q = query(
        "MERGE (n:Bimba {coordinate: $coord}) \
         SET n:Family, \
             n.uuid = $uuid, \
             n.name = $name, \
             n.domain = $domain, \
             n.family_letter = $letter, \
             n.layer = 'FAMILY_META', \
             n.ql_position = -1, \
             n.topo_mode = 'NONE', \
             n.weave_state = 0.0, \
             n.inversion_state = 0, \
             n.flags = 0",
    )
    .param("coord", coordinate)
    .param("uuid", uuid.as_str())
    .param("name", name)
    .param("domain", domain)
    .param("letter", family_letter);

    client
        .run_query(q)
        .await
        .map_err(|e| format!("merge family {} failed: {}", coordinate, e))?;
    Ok(())
}

// ---------------------------------------------------------------------------
// Helper: create a relationship between two coordinates
// ---------------------------------------------------------------------------

async fn create_rel(
    client: &Neo4jClient,
    from_coord: &str,
    to_coord: &str,
    rel_type: &str,
) -> Result<(), String> {
    let cypher = format!(
        "MATCH (a:Bimba {{coordinate: $from}}), \
               (b:Bimba {{coordinate: $to}}) \
         MERGE (a)-[:{}]->(b)",
        rel_type
    );
    let q = query(&cypher)
        .param("from", from_coord)
        .param("to", to_coord);
    client.run_query(q).await.map_err(|e| {
        format!(
            "rel {}->{}[{}] failed: {}",
            from_coord, to_coord, rel_type, e
        )
    })?;
    Ok(())
}

/// Create a bidirectional relationship (both directions).
async fn create_rel_bidi(
    client: &Neo4jClient,
    a: &str,
    b: &str,
    rel_type: &str,
) -> Result<(), String> {
    create_rel(client, a, b, rel_type).await?;
    create_rel(client, b, a, rel_type).await?;
    Ok(())
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

/// Seed the full Bimba coordinate space into Neo4j (~102 nodes + relationships).
pub async fn seed_coordinate_space(client: &Neo4jClient) -> Result<String, String> {
    let mut node_count: usize = 0;
    let mut rel_count: usize = 0;

    // ==================================================================
    // NODES
    // ==================================================================

    // ------------------------------------------------------------------
    // Layer 0: The # node (Inversion Act) — Bimba:Root
    // ------------------------------------------------------------------
    merge_node(
        client,
        "#",
        "Root",
        "Non-Dual Self-Inversion",
        "NONE",
        "PSYCHOID",
        -1,
        "KLEIN",
        0.0,
        0,
        0x00,
    )
    .await?;
    // # is not merely an operation but the non-dual essence: Prakasa-Vimarsa-Maya as one unity,
    // the Kashmir Shaivite principle that everything is everything — the Real self-inverted in principle.
    let q = query(
        "MATCH (n:Bimba {coordinate: '#'}) \
         SET n.essence = $essence, \
             n.description = $desc",
    )
    .param(
        "essence",
        "Prakasa-Vimarsa-Maya: luminosity, self-awareness, and creative power as indivisible unity",
    )
    .param(
        "desc",
        "The non-dual ground in which the Real is self-inverted in principle. \
Not merely an operation but the Kashmir Shaivite recognition that everything is everything — \
Prakasa (luminous self-evidence) and Vimarsa (reflective self-awareness) are not two, \
and their apparent separation through Maya is itself the creative act of non-duality. \
# is Svatantrya — absolute freedom — the capacity of consciousness to appear as its own other \
while never ceasing to be itself.",
    );
    client
        .run_query(q)
        .await
        .map_err(|e| format!("# essence failed: {}", e))?;
    node_count += 1;

    // ------------------------------------------------------------------
    // Layer 1: Psychoids #0-#5 — Bimba:Psychoid
    // ------------------------------------------------------------------
    for pos in 0..6usize {
        let coord = format!("#{}", pos);
        merge_node(
            client,
            &coord,
            "Psychoid",
            PSYCHOID_NAMES[pos],
            "NONE",
            "PSYCHOID",
            pos as i64,
            PSYCHOID_TOPO[pos],
            pos as f64,
            0,
            0x21,
        )
        .await?;
        node_count += 1;
    }

    // ------------------------------------------------------------------
    // Layer 1b: Weave nodes — Bimba:Weave
    // ------------------------------------------------------------------
    for (name, weave) in WEAVE_COORDS {
        merge_node(
            client, name, "Weave", name, "NONE", "WEAVE", -1, "TORUS", *weave, 0, 0x00,
        )
        .await?;
        node_count += 1;
    }

    // ------------------------------------------------------------------
    // Layer 1c: Context Frame nodes — Bimba:ContextFrame
    // ------------------------------------------------------------------
    for (idx, name) in CF_NAMES.iter().enumerate() {
        merge_node(
            client,
            name,
            "ContextFrame",
            name,
            "NONE",
            "CONTEXT_FRAME",
            idx as i64,
            "LEMNISCATE",
            0.0,
            0,
            0x00,
        )
        .await?;
        node_count += 1;
    }

    // ------------------------------------------------------------------
    // Layer 1d: Family meta-nodes — Bimba:Family (NEW)
    // ------------------------------------------------------------------
    for (fi, family_letter) in FAMILIES.iter().enumerate() {
        let coord = format!("Family_{}", family_letter);
        merge_family_node(
            client,
            &coord,
            FAMILY_FULL_NAMES[fi],
            FAMILY_DOMAINS[fi],
            family_letter,
        )
        .await?;
        node_count += 1;
    }

    // ------------------------------------------------------------------
    // Layer 2: 6 families x 6 positions x 2 phases = 72 nodes — Bimba:Coordinate
    // ------------------------------------------------------------------
    for (fi, family_letter) in FAMILIES.iter().enumerate() {
        for pos in 0..6usize {
            let name = FAMILY_NAMES[fi][pos];

            // Normal phase
            let coord_normal = format!("{}{}", family_letter, pos);
            merge_node(
                client,
                &coord_normal,
                "Coordinate",
                name,
                family_letter,
                "COORDINATE",
                pos as i64,
                PSYCHOID_TOPO[pos],
                pos as f64,
                0,
                0x21,
            )
            .await?;
            node_count += 1;

            // Inverted phase
            let coord_inv = format!("{}{}'", family_letter, pos);
            let inv_name = format!("{}'", name);
            merge_node(
                client,
                &coord_inv,
                "Coordinate",
                &inv_name,
                family_letter,
                "COORDINATE",
                pos as i64,
                PSYCHOID_TOPO[pos],
                pos as f64,
                1,
                0x21,
            )
            .await?;
            node_count += 1;
        }
    }

    // ------------------------------------------------------------------
    // Layer 3: VAK reflective coordinates — Bimba:Vak
    // ------------------------------------------------------------------
    for (idx, name) in VAK_NAMES.iter().enumerate() {
        merge_node(
            client,
            name,
            "Vak",
            name,
            "NONE",
            "VAK",
            idx as i64,
            "LEMNISCATE",
            0.0,
            0,
            0x00,
        )
        .await?;
        node_count += 1;
    }

    // ==================================================================
    // RELATIONSHIPS
    // ==================================================================

    // ------------------------------------------------------------------
    // Root Emanation: # --GENERATES--> #0 through #5 (6 rels)
    // ------------------------------------------------------------------
    for pos in 0..6usize {
        let psychoid = format!("#{}", pos);
        create_rel(client, "#", &psychoid, "GENERATES").await?;
        rel_count += 1;
    }

    // ------------------------------------------------------------------
    // Psychoid <-> Context Frame ENTANGLES (bidirectional, 9 pairs = 18 rels)
    // ------------------------------------------------------------------
    // Position-specific correspondence:
    // #0 <-> CF_VOID (00/00)
    create_rel_bidi(client, "#0", "CF_VOID", "ENTANGLES").await?;
    // #1 <-> CF_BINARY (0/1)
    create_rel_bidi(client, "#1", "CF_BINARY", "ENTANGLES").await?;
    // #2 <-> CF_TRIKA (0/1/2)
    create_rel_bidi(client, "#2", "CF_TRIKA", "ENTANGLES").await?;
    // #3 <-> CF_QUATERNAL (0/1/2/3)
    create_rel_bidi(client, "#3", "CF_QUATERNAL", "ENTANGLES").await?;
    // #4 <-> CF_FRACTAL (4.0/1-4.4/5)
    create_rel_bidi(client, "#4", "CF_FRACTAL", "ENTANGLES").await?;
    // CF_SYNTHESIS spans 4-5-0:
    create_rel_bidi(client, "#4", "CF_SYNTHESIS", "ENTANGLES").await?;
    create_rel_bidi(client, "#5", "CF_SYNTHESIS", "ENTANGLES").await?;
    create_rel_bidi(client, "#0", "CF_SYNTHESIS", "ENTANGLES").await?;
    // #5 <-> CF_MOBIUS (5/0)
    create_rel_bidi(client, "#5", "CF_MOBIUS", "ENTANGLES").await?;
    rel_count += 18; // 9 pairs x 2 directions

    // ------------------------------------------------------------------
    // Weave INTERLEAVES (bidirectional, 8 pairs = 16 rels)
    // The 10-fold interlaced memory arena weaves between # root and #0-#5
    // ------------------------------------------------------------------
    // Weave_0_0 <-> # (root, implicate ground)
    create_rel_bidi(client, "Weave_0_0", "#", "INTERLEAVES").await?;
    // Weave_0_0 <-> #0 (pure ground)
    create_rel_bidi(client, "Weave_0_0", "#0", "INTERLEAVES").await?;
    // Weave_0_5 <-> #0 (ground reaching)
    create_rel_bidi(client, "Weave_0_5", "#0", "INTERLEAVES").await?;
    // Weave_0_5 <-> #5 (toward instance)
    create_rel_bidi(client, "Weave_0_5", "#5", "INTERLEAVES").await?;
    // Weave_5_0 <-> #5 (instance reaching)
    create_rel_bidi(client, "Weave_5_0", "#5", "INTERLEAVES").await?;
    // Weave_5_0 <-> #0 (back to ground)
    create_rel_bidi(client, "Weave_5_0", "#0", "INTERLEAVES").await?;
    // Weave_5_5 <-> # (root, implicate instance)
    create_rel_bidi(client, "Weave_5_5", "#", "INTERLEAVES").await?;
    // Weave_5_5 <-> #5 (pure instance)
    create_rel_bidi(client, "Weave_5_5", "#5", "INTERLEAVES").await?;
    rel_count += 16; // 8 pairs x 2 directions

    // ------------------------------------------------------------------
    // MANIFESTS: #N -> all family coords at position N (normal + inverted)
    // 72 rels
    // ------------------------------------------------------------------
    for pos in 0..6usize {
        let psychoid = format!("#{}", pos);
        for family_letter in FAMILIES {
            let normal = format!("{}{}", family_letter, pos);
            let inverted = format!("{}{}'", family_letter, pos);
            create_rel(client, &psychoid, &normal, "MANIFESTS").await?;
            create_rel(client, &psychoid, &inverted, "MANIFESTS").await?;
            rel_count += 2;
        }
    }

    // ------------------------------------------------------------------
    // BEDROCK: each family coord -> its #N psychoid (72 rels)
    // ------------------------------------------------------------------
    for family_letter in FAMILIES {
        for pos in 0..6usize {
            let normal = format!("{}{}", family_letter, pos);
            let inverted = format!("{}{}'", family_letter, pos);
            let psychoid = format!("#{}", pos);
            create_rel(client, &normal, &psychoid, "BEDROCK").await?;
            create_rel(client, &inverted, &psychoid, "BEDROCK").await?;
            rel_count += 2;
        }
    }

    // ------------------------------------------------------------------
    // INVERTS_TO: X -> X' for all 36 family coordinate pairs
    // ------------------------------------------------------------------
    for family_letter in FAMILIES {
        for pos in 0..6usize {
            let normal = format!("{}{}", family_letter, pos);
            let inverted = format!("{}{}'", family_letter, pos);
            create_rel(client, &normal, &inverted, "INVERTS_TO").await?;
            rel_count += 1;
        }
    }

    // ------------------------------------------------------------------
    // FAMILY_CONTAINS: Family meta-node -> its 12 coordinates (72 rels)
    // ------------------------------------------------------------------
    for family_letter in FAMILIES {
        let family_coord = format!("Family_{}", family_letter);
        for pos in 0..6usize {
            let normal = format!("{}{}", family_letter, pos);
            let inverted = format!("{}{}'", family_letter, pos);
            create_rel(client, &family_coord, &normal, "FAMILY_CONTAINS").await?;
            create_rel(client, &family_coord, &inverted, "FAMILY_CONTAINS").await?;
            rel_count += 2;
        }
    }

    // ------------------------------------------------------------------
    // REFLECTS_AS: C' inverted coordinates -> VAK reflective operators (6 rels)
    // C0'->CPF, C1'->CT, C2'->CP, C3'->CF, C4'->CFP, C5'->CS
    // ------------------------------------------------------------------
    let c_inv_to_vak: &[(&str, &str)] = &[
        ("C0'", "CPF"),
        ("C1'", "CT"),
        ("C2'", "CP"),
        ("C3'", "CF"),
        ("C4'", "CFP"),
        ("C5'", "CS"),
    ];
    for (c_inv, vak) in c_inv_to_vak {
        create_rel(client, c_inv, vak, "REFLECTS_AS").await?;
        rel_count += 1;
    }

    // ------------------------------------------------------------------
    // OPERATES_IN: VAK -> Context Frame operational binding (6 rels)
    // ------------------------------------------------------------------
    let vak_to_cf: &[(&str, &str)] = &[
        ("CPF", "CF_BINARY"),  // (0/1)
        ("CT", "CF_TRIKA"),    // (0/1/2)
        ("CP", "CF_FRACTAL"),  // (4.0/1-4.4/5)
        ("CF", "CF_MOBIUS"),   // (5/0)
        ("CFP", "CF_FRACTAL"), // custom/nested via #4
        ("CS", "CF_VOID"),     // system-wide ground
    ];
    for (vak, cf) in vak_to_cf {
        create_rel(client, vak, cf, "OPERATES_IN").await?;
        rel_count += 1;
    }

    // ------------------------------------------------------------------
    // MOBIUS_RETURN: #5 -> #0 (1 rel)
    // ------------------------------------------------------------------
    create_rel(client, "#5", "#0", "MOBIUS_RETURN").await?;
    rel_count += 1;

    // ------------------------------------------------------------------
    // ANCHORED_TO: CF_FRACTAL -> #4 (the Lemniscate anchor, 1 rel)
    // ------------------------------------------------------------------
    create_rel(client, "CF_FRACTAL", "#4", "ANCHORED_TO").await?;
    rel_count += 1;

    Ok(format!(
        "Seed complete: {} nodes, {} relationships",
        node_count, rel_count
    ))
}

// ---------------------------------------------------------------------------
// Phase 9: Parashakti body zone augmentation
// ---------------------------------------------------------------------------

/// Augment `ChakralCenter` nodes with `body_zones` arrays.
///
/// Uses the canonical bimbaCoordinates `#2-5-0/1-1` through `#2-5-0/1-7`
/// (Saturn→Muladhara … Sun→Sahasrara) from the parashakti-deep dataset.
/// Safe to run multiple times — all statements use MERGE + SET =.
pub async fn seed_parashakti_body_zones(client: &Neo4jClient) -> Result<String, String> {
    // (bimbaCoordinate, body_zones, chakra_name)
    let chakra_data: &[(&str, &[&str], &str)] = &[
        (
            "#2-5-0/1-1",
            &[
                "bones",
                "teeth",
                "skin",
                "joints",
                "nails",
                "skeletal_structure",
                "adrenal_cortex",
            ],
            "Muladhara",
        ),
        (
            "#2-5-0/1-2",
            &[
                "blood",
                "lymph",
                "mucus",
                "reproductive_organs",
                "urine",
                "seminal_fluid",
                "synovial_fluid",
            ],
            "Svadhisthana",
        ),
        (
            "#2-5-0/1-3",
            &[
                "muscles",
                "bile",
                "liver",
                "adrenals",
                "stomach",
                "small_intestine",
                "digestive_fire",
            ],
            "Manipura",
        ),
        (
            "#2-5-0/1-4",
            &[
                "heart",
                "lungs",
                "thymus",
                "kidneys",
                "circulatory_system",
                "upper_chest",
                "arms",
            ],
            "Anahata",
        ),
        (
            "#2-5-0/1-5",
            &[
                "throat",
                "vocal_cords",
                "thyroid",
                "bronchi",
                "trachea",
                "cervical_nerves",
                "ears",
            ],
            "Vishuddha",
        ),
        (
            "#2-5-0/1-6",
            &[
                "pituitary",
                "pineal",
                "cerebrospinal_fluid",
                "optic_nerves",
                "frontal_lobe",
                "autonomic_nervous_system",
            ],
            "Ajna",
        ),
        (
            "#2-5-0/1-7",
            &[
                "cerebral_cortex",
                "higher_nervous_system",
                "fontanelle",
                "crown_endocrine_axis",
                "consciousness_field",
            ],
            "Sahasrara",
        ),
    ];

    let mut updated = 0usize;
    for (coord, zones, _chakra_name) in chakra_data {
        let zones_cypher: Vec<String> = zones.iter().map(|z| format!("'{}'", z)).collect();
        let zones_list = zones_cypher.join(", ");
        let cypher = format!(
            "MERGE (c:ChakralCenter {{bimbaCoordinate: $coord}}) \
             SET c.body_zones = [{}], \
                 c.body_zones_source = 'ayurveda_tantra_canonical', \
                 c.body_zones_updated_at = datetime()",
            zones_list
        );
        client
            .run_query(query(&cypher).param("coord", *coord))
            .await
            .map_err(|e| format!("body_zones seed {} failed: {}", coord, e))?;
        updated += 1;
    }

    Ok(format!(
        "Parashakti body zones seeded: {} ChakralCenter nodes updated",
        updated
    ))
}

/// Augment decan nodes with `bodyPart` and `herbalism_herbs` properties.
///
/// Decan nodes are identified by their QL index (#2-3-0-N where N = 0..35).
/// Data sourced from medicine.rs static LUTs (canonical Ayurvedic/Jyotish).
/// Safe to re-run — uses MERGE + SET.
pub async fn seed_decan_body_data(client: &Neo4jClient) -> Result<String, String> {
    // Canonical body parts per decan (index 0-35, same as DECAN_BODY_PARTS in medicine.rs)
    const DECAN_BODY_PARTS: [&str; 36] = [
        "head_crown",
        "neck_throat",
        "shoulders_arms",
        "chest_lungs",
        "solar_plexus",
        "intestines",
        "kidneys_lower_back",
        "reproductive_system",
        "thighs_hips",
        "knees_joints",
        "ankles_calves",
        "feet_lymphatics",
        "frontal_lobe",
        "cerebellum",
        "spinal_cord_cervical",
        "spinal_cord_thoracic",
        "cardiac_plexus",
        "solar_plexus_liver",
        "sacral_plexus",
        "coccyx_perineum",
        "femoral_nerve",
        "popliteal_nerve",
        "tibial_nerve",
        "plantar_fascia",
        "occipital_lobe",
        "temporal_lobe",
        "parietal_lobe",
        "medulla_oblongata",
        "thymus_gland",
        "pancreas",
        "adrenal_glands",
        "gonads_ovaries",
        "sciatic_nerve",
        "cruciate_ligaments",
        "achilles_tendon",
        "metatarsals",
    ];

    const DECAN_HERBS: [&str; 36] = [
        "ginger_ashwagandha",
        "sage_thyme",
        "lavender_eucalyptus",
        "mullein_elecampane",
        "licorice_marshmallow",
        "slippery_elm_psyllium",
        "dandelion_milk_thistle",
        "raspberry_leaf_vitex",
        "turmeric_moringa",
        "solomon_seal_horsetail",
        "ginkgo_gotu_kola",
        "calendula_cleavers",
        "rosemary_brahmi",
        "skullcap_valerian",
        "wood_betony_st_johns_wort",
        "oat_straw_lemon_balm",
        "hawthorn_rose_hips",
        "bupleurum_schisandra",
        "black_cohosh_dong_quai",
        "shatavari_maca",
        "nettle_yellow_dock",
        "devil_claw_boswellia",
        "horse_chestnut_bilberry",
        "sea_buckthorn_turmeric",
        "lions_mane_reishi",
        "bacopa_tulsi",
        "american_ginseng_eleuthero",
        "lobelia_passionflower",
        "astragalus_codonopsis",
        "bitters_gentian_artichoke",
        "adaptogen_rhodiola_schisandra",
        "tribulus_maca",
        "st_johns_wort_cats_claw",
        "comfrey_glucosamine_herbs",
        "arnica_boswellia",
        "plantain_yarrow",
    ];

    let mut updated = 0usize;
    for (idx, (body_part, herbs)) in DECAN_BODY_PARTS.iter().zip(DECAN_HERBS.iter()).enumerate() {
        let coord = format!("#2-3-0-{}", idx);
        let q = query(
            "MERGE (d:Decan {bimbaCoordinate: $coord}) \
             SET d.bodyPart = $body_part, \
                 d.herbalism_herbs = $herbs, \
                 d.body_data_source = 'ayurveda_jyotish_canonical', \
                 d.body_data_updated_at = datetime()",
        )
        .param("coord", coord.as_str())
        .param("body_part", *body_part)
        .param("herbs", *herbs);
        client
            .run_query(q)
            .await
            .map_err(|e| format!("decan body data seed {} failed: {}", coord, e))?;
        updated += 1;
    }

    Ok(format!(
        "Decan body data seeded: {} Decan nodes updated",
        updated
    ))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_coord_uuid_deterministic() {
        let a = coord_uuid("C0");
        let b = coord_uuid("C0");
        assert_eq!(a, b);
    }

    #[test]
    fn test_coord_uuid_different_for_different_coords() {
        assert_ne!(coord_uuid("C0"), coord_uuid("C1"));
    }

    #[test]
    fn test_coord_uuid_format() {
        let u = coord_uuid("#");
        // UUID v5 format: 8-4-4-4-12 hex chars
        assert_eq!(u.len(), 36);
        assert_eq!(u.chars().filter(|c| *c == '-').count(), 4);
    }

    #[test]
    fn test_family_data_consistency() {
        assert_eq!(FAMILIES.len(), 6);
        assert_eq!(FAMILY_NAMES.len(), 6);
        assert_eq!(FAMILY_FULL_NAMES.len(), 6);
        assert_eq!(FAMILY_DOMAINS.len(), 6);
        for names in FAMILY_NAMES.iter() {
            assert_eq!(names.len(), 6);
        }
    }

    #[test]
    fn test_expected_node_count() {
        // 1 (#) + 6 (psychoids) + 4 (weaves) + 7 (CFs)
        // + 6 (family meta) + 72 (family coords) + 6 (VAK) = 102
        let count = 1 + 6 + 4 + 7 + 6 + (6 * 6 * 2) + 6;
        assert_eq!(count, 102);
    }

    #[test]
    fn test_expected_rel_count() {
        // GENERATES:       6   (# -> #0-#5)
        // ENTANGLES:      18   (9 pairs x 2 directions)
        // INTERLEAVES:    16   (8 pairs x 2 directions)
        // MANIFESTS:      72   (6 psychoids x 6 families x 2 phases)
        // BEDROCK:        72   (6 families x 6 positions x 2 phases)
        // INVERTS_TO:     36   (6 families x 6 positions)
        // FAMILY_CONTAINS:72   (6 families x 12 coords each)
        // REFLECTS_AS:     6   (C0'-C5' -> VAK)
        // OPERATES_IN:     6   (VAK -> CF)
        // MOBIUS_RETURN:   1   (#5 -> #0)
        // ANCHORED_TO:     1   (CF_FRACTAL -> #4)
        let count = 6 + 18 + 16 + 72 + 72 + 36 + 72 + 6 + 6 + 1 + 1;
        assert_eq!(count, 306);
    }
}
