use clap::{Args, ValueEnum};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

#[derive(Args, Debug, Clone)]
pub struct CoordArgs {
    /// Coordinate id to resolve. Defaults to the root token for piping.
    pub coordinate_id: Option<String>,
    /// Depth rung to render.
    #[arg(long, value_enum, default_value_t = CanonDepth::Token)]
    pub depth: CanonDepth,
    /// Emit multi-line JSON for humans.
    #[arg(long)]
    pub pretty: bool,
    /// Keep JSON output explicit for shell pipelines. JSON is the default.
    #[arg(long)]
    pub json: bool,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, ValueEnum, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum CanonDepth {
    Token,
    Frame,
    Square,
    Resolve,
    Identity,
    Surface,
}

impl CanonDepth {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Token => "token",
            Self::Frame => "frame",
            Self::Square => "square",
            Self::Resolve => "resolve",
            Self::Identity => "identity",
            Self::Surface => "surface",
        }
    }
}

#[derive(Debug, Clone)]
pub struct CanonCoordinateRecord {
    pub coordinate: String,
    pub q_identity_id: String,
    pub family: String,
    pub p_position: u8,
    pub l_position: u8,
    pub frame: CanonFrame,
    pub q_text: QlText,
    pub source_refs: Vec<String>,
}

#[derive(Debug, Clone)]
pub struct CanonFrame {
    pub cf: &'static str,
    pub ct: &'static str,
    pub cp: &'static str,
    pub cs: &'static str,
}

#[derive(Debug, Clone)]
pub struct QlText {
    pub l1: String,
    pub l1_prime: String,
    pub l4: String,
    pub l4_prime: String,
}

#[derive(Debug, Clone)]
pub struct SquarePole {
    pub pole: &'static str,
    pub ql_text: String,
    pub refractions: QlText,
}

pub fn run(args: &CoordArgs) -> Result<Value, String> {
    let coordinate = args.coordinate_id.as_deref().unwrap_or("#");
    resolve_coordinate(coordinate, args.depth)
}

pub fn resolve_coordinate(coordinate: &str, depth: CanonDepth) -> Result<Value, String> {
    let record = canonical_record(coordinate)?;
    let mut payload = token_payload(&record, depth);

    if matches!(
        depth,
        CanonDepth::Frame
            | CanonDepth::Square
            | CanonDepth::Resolve
            | CanonDepth::Identity
            | CanonDepth::Surface
    ) {
        add_frame(&mut payload, &record);
    }
    if matches!(
        depth,
        CanonDepth::Square | CanonDepth::Resolve | CanonDepth::Identity | CanonDepth::Surface
    ) {
        add_square(&mut payload, &record);
    }
    if matches!(
        depth,
        CanonDepth::Resolve | CanonDepth::Identity | CanonDepth::Surface
    ) {
        add_resolve(&mut payload, &record);
    }
    if matches!(depth, CanonDepth::Identity | CanonDepth::Surface) {
        add_identity(&mut payload, &record);
    }
    if matches!(depth, CanonDepth::Surface) {
        add_surface(&mut payload, &record);
    }

    Ok(payload)
}

pub fn canonical_record(input: &str) -> Result<CanonCoordinateRecord, String> {
    let coordinate = normalize_coordinate(input);
    if coordinate.is_empty() {
        return Err("coordinate id must not be empty".to_owned());
    }
    let family = coordinate
        .chars()
        .find(|ch| ch.is_ascii_alphabetic())
        .map(|ch| ch.to_ascii_uppercase().to_string())
        .unwrap_or_else(|| "R".to_owned());
    let p_position = parse_position_after(&coordinate, 'P').unwrap_or_else(|| {
        coordinate
            .bytes()
            .find(u8::is_ascii_digit)
            .map(|digit| (digit - b'0') % 6)
            .unwrap_or(0)
    });
    let l_position = parse_position_after(&coordinate, 'L')
        .or_else(|| parse_position_after(&coordinate, 'M'))
        .unwrap_or(p_position);
    let frame = frame_for_position(p_position);
    let q_identity_id = format!("q_{}", coordinate.replace(['-', '\'', '/', '.'], "_"));
    let q_text = ql_text_for(&coordinate, p_position, l_position);
    let source_refs = vec![
        "s5'.gnostic.resolve_coordinate".to_owned(),
        "bimba.subgraph.anchor".to_owned(),
        "hen.artifact.trace".to_owned(),
    ];

    Ok(CanonCoordinateRecord {
        coordinate,
        q_identity_id,
        family,
        p_position,
        l_position,
        frame,
        q_text,
        source_refs,
    })
}

pub fn square_poles(record: &CanonCoordinateRecord) -> Vec<SquarePole> {
    let base = [
        ("L1", &record.q_text.l1),
        ("L1'", &record.q_text.l1_prime),
        ("L4", &record.q_text.l4),
        ("L4'", &record.q_text.l4_prime),
    ];
    base.into_iter()
        .enumerate()
        .map(|(idx, (pole, text))| {
            let shifted = (record.p_position + idx as u8) % 6;
            SquarePole {
                pole,
                ql_text: text.clone(),
                refractions: QlText {
                    l1: format!("{} | {} refraction at P{}", text, "L1", shifted),
                    l1_prime: format!("{} | {} refraction at P{}", text, "L1'", shifted),
                    l4: format!("{} | {} refraction at P{}", text, "L4", shifted),
                    l4_prime: format!("{} | {} refraction at P{}", text, "L4'", shifted),
                },
            }
        })
        .collect()
}

fn token_payload(record: &CanonCoordinateRecord, depth: CanonDepth) -> Value {
    json!({
        "depth": depth.as_str(),
        "coordinate": record.coordinate,
        "q_identity": {
            "id": record.q_identity_id,
            "vector": q_vector(&record.coordinate),
        }
    })
}

fn add_frame(payload: &mut Value, record: &CanonCoordinateRecord) {
    payload["frame"] = json!({
        "cf": record.frame.cf,
        "ct": record.frame.ct,
        "cp": record.frame.cp,
        "cs": record.frame.cs,
    });
    payload["primary_classification"] = json!({
        "family": record.family,
        "p_position": record.p_position,
        "l_position": record.l_position,
        "coordinate_class": if record.coordinate.contains("-M") { "personal-coordinate" } else { "coordinate-token" },
    });
}

fn add_square(payload: &mut Value, record: &CanonCoordinateRecord) {
    let poles: Vec<Value> = square_poles(record)
        .into_iter()
        .map(|pole| {
            json!({
                "pole": pole.pole,
                "ql_text": pole.ql_text,
                "refractions": {
                    "l1": pole.refractions.l1,
                    "l1_prime": pole.refractions.l1_prime,
                    "l4": pole.refractions.l4,
                    "l4_prime": pole.refractions.l4_prime,
                }
            })
        })
        .collect();
    payload["square"] = json!({
        "mode": "operative-ql-square",
        "p_position": record.p_position,
        "aggregate": record.coordinate.contains("P0/P"),
        "poles": poles,
    });
}

fn add_resolve(payload: &mut Value, record: &CanonCoordinateRecord) {
    let resonance = resonance_score(&record.coordinate);
    payload["bimba_subgraph"] = json!({
        "anchor": record.coordinate,
        "nodes": [
            {"coordinate": record.coordinate, "role": "anchor"},
            {"coordinate": format!("{}::q", record.coordinate), "role": "q_identity"},
            {"coordinate": format!("{}::square", record.coordinate), "role": "ql_square"}
        ],
        "edges": [
            {"from": record.coordinate, "to": format!("{}::q", record.coordinate), "type": "HAS_Q_IDENTITY"},
            {"from": record.coordinate, "to": format!("{}::square", record.coordinate), "type": "RESOLVES_AS_SQUARE"}
        ]
    });
    payload["hen_artifact_trace"] = json!([
        {"artifact": format!("{}.frame", record.coordinate), "carrier": "hen", "status": "canonical"},
        {"artifact": format!("{}.q", record.coordinate), "carrier": "hen", "status": "canonical"}
    ]);
    payload["resonance_indicator"] = json!({
        "source": "kernel-0-personal-identity",
        "score": resonance,
        "delta": ((resonance - 0.5) * 1000.0).round() / 1000.0,
    });
    payload["source_refs"] = json!(record.source_refs);
}

fn add_identity(payload: &mut Value, record: &CanonCoordinateRecord) {
    payload["canonical_identity"] = json!({
        "q_personal": q_vector(&format!("{}:personal", record.coordinate)),
        "q_cosmic": q_vector(&format!("{}:cosmic", record.coordinate)),
        "conjugate_form_character": conjugate_form_character(record.p_position),
        "elemental_balance": elemental_balance(&record.coordinate),
        "s0_kernel_primitives": {
            "coordinate_token": record.coordinate,
            "p_position": record.p_position,
            "l_position": record.l_position,
            "kernel_family": record.family,
        }
    });
}

fn add_surface(payload: &mut Value, record: &CanonCoordinateRecord) {
    let balance = elemental_balance(&record.coordinate);
    payload["resonance"] = json!(resonance_score(&record.coordinate));
    payload["conjugate_form_character"] = json!(conjugate_form_character(record.p_position));
    payload["elemental_glyphs"] = json!(["fire", "water", "air", "earth"]);
    payload["dominant_chakra"] = json!(dominant_chakra(record.p_position));
    payload["sun_decan_ruling_planet"] = json!(sun_decan_ruling_planet(record.p_position));
    payload["matheme_harmonic_profile"] = json!({
        "profile_id": format!("matheme-harmonic-{}", record.coordinate),
        "harmonics": q_vector(&format!("{}:matheme", record.coordinate)),
        "elemental_balance": balance,
    });
}

fn normalize_coordinate(input: &str) -> String {
    let trimmed = input.trim();
    if trimmed.is_empty() {
        "#".to_owned()
    } else {
        trimmed.to_owned()
    }
}

fn parse_position_after(input: &str, marker: char) -> Option<u8> {
    let upper = input.to_ascii_uppercase();
    let marker_index = upper.find(marker)?;
    upper[marker_index + marker.len_utf8()..]
        .chars()
        .find(|ch| ch.is_ascii_digit())
        .and_then(|ch| ch.to_digit(10))
        .map(|digit| (digit as u8) % 6)
}

fn frame_for_position(position: u8) -> CanonFrame {
    match position % 6 {
        0 => CanonFrame {
            cf: "(0000)",
            ct: "CT0",
            cp: "4.0",
            cs: "ground",
        },
        1 => CanonFrame {
            cf: "(0/1)",
            ct: "CT1",
            cp: "4.1",
            cs: "definition",
        },
        2 => CanonFrame {
            cf: "(0/1/2)",
            ct: "CT2",
            cp: "4.2",
            cs: "operation",
        },
        3 => CanonFrame {
            cf: "(0/1/2/3)",
            ct: "CT3",
            cp: "4.3",
            cs: "pattern",
        },
        4 => CanonFrame {
            cf: "(4.5/0)",
            ct: "CT4",
            cp: "4.4",
            cs: "context",
        },
        _ => CanonFrame {
            cf: "(5/0)",
            ct: "CT5",
            cp: "4.5",
            cs: "integration",
        },
    }
}

fn ql_text_for(coordinate: &str, p_position: u8, l_position: u8) -> QlText {
    QlText {
        l1: format!("{coordinate} L1 defines P{p_position} as the explicit coordinate token."),
        l1_prime: format!("{coordinate} L1' returns P{p_position} through its pratibimba trace."),
        l4: format!("{coordinate} L4 holds the operative frame for L{l_position}."),
        l4_prime: format!(
            "{coordinate} L4' measures kernel resonance through the personal return."
        ),
    }
}

fn q_vector(seed: &str) -> [f64; 4] {
    let hash = blake3::hash(seed.as_bytes());
    let bytes = hash.as_bytes();
    [
        rounded_unit(bytes[0]),
        rounded_unit(bytes[1]),
        rounded_unit(bytes[2]),
        rounded_unit(bytes[3]),
    ]
}

fn rounded_unit(byte: u8) -> f64 {
    ((byte as f64 / 255.0) * 1000.0).round() / 1000.0
}

fn resonance_score(seed: &str) -> f64 {
    let vector = q_vector(seed);
    ((vector.iter().sum::<f64>() / vector.len() as f64) * 1000.0).round() / 1000.0
}

fn elemental_balance(seed: &str) -> Value {
    let q = q_vector(&format!("{seed}:elements"));
    json!({
        "fire": q[0],
        "water": q[1],
        "air": q[2],
        "earth": q[3],
    })
}

fn conjugate_form_character(position: u8) -> &'static str {
    match position % 3 {
        0 => "Ground",
        1 => "Major",
        _ => "Minor",
    }
}

fn dominant_chakra(position: u8) -> &'static str {
    match position % 6 {
        0 => "root",
        1 => "sacral",
        2 => "solar-plexus",
        3 => "heart",
        4 => "throat",
        _ => "crown",
    }
}

fn sun_decan_ruling_planet(position: u8) -> &'static str {
    match position % 6 {
        0 => "Mars",
        1 => "Sun",
        2 => "Venus",
        3 => "Mercury",
        4 => "Moon",
        _ => "Saturn",
    }
}
