//! Structural canonical-framestore engine.
//!
//! Coordinate Header (`convention:coordinate-header:v1`)
//! - Coordinate: S0 (Terminal / CLI / C Ground)
//! - Residency: `Body/S/S0/epi-cli/src/canon/framestore.rs`
//! - Position (#0): membrane surface — deterministic structural record used by
//!   the `canon diff` / `canon search` sibling surfaces.
//! - Actualises: the framestore square/pole model those two commands render.
//! - Public surface: [`canonical_record`], [`square_poles`],
//!   [`CanonCoordinateRecord`], [`CanonFrame`], [`QlText`], [`SquarePole`].
//! - Does NOT own: live graph reads (those belong to `canon/coord.rs`, which
//!   reads the live `:Bimba` graph through the S2 seam), nor coordinate law
//!   (that is graph/spec canon).
//!
//! This module carries the coordinate-token structural model that the
//! `canon diff` and `canon search` surfaces resolve WITHOUT a graph hit. The
//! `canon coord` depth ladder deliberately does NOT use this engine — it reads
//! the live `:Bimba` graph so its output is graph-truth, not a synthetic record.

/// A deterministic structural record for one coordinate token.
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
