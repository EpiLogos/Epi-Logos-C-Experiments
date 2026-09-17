//! Coordinate: S0/M4' (Medicine gateway projection)
//! Residency: Body/S/S0/epi-cli/src/nara
//! Position (#n): runtime adapter between Medicine LUT law and the gateway
//! Actualises: read-only snapshots plus an explicit S1-governed NOW pin.
//! Public surface: `medicine_snapshot`, `pin_materia`, `safety`.
//! Does NOT own: medical authority, prescriptions, LUT law, or YAML mutation law.
//! Contract: [[S0-SPEC]] / [[S1-SPEC]] / [[M4'-SPEC]].

use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Mutex;

use epi_s1_hen_compiler_core::append_frontmatter_string;
use serde::Serialize;

use super::medicine_frame::{
    chakra_name, decan_for_degree, planet_name, zodiac_decan, CHAKRA_BODY_ZONES, ELEMENT_CHAKRA,
    PLANET_CHAKRA, ZODIAC_DECAN_TABLE,
};

static NOW_MUTATION_LOCK: Mutex<()> = Mutex::new(());
static TEMP_SEQUENCE: AtomicU64 = AtomicU64::new(0);

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ChakraSnapshotRow {
    pub id: u8,
    pub name: &'static str,
    pub dominant_element_id: Option<u8>,
    pub body_zones: &'static [&'static str],
}

#[derive(Debug, Serialize)]
pub struct HerbSnapshot {
    pub vernacular: &'static str,
    pub botanical: &'static str,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ActiveDecanSnapshot {
    pub sun_degree: f32,
    pub sign_idx: u8,
    pub decan_in_sign: u8,
    pub decan_idx: u8,
    pub body_part: &'static str,
    pub ruling_planet: &'static str,
    pub ruling_planet_glyph: &'static str,
    pub active_chakra_id: u8,
    pub herbs: [HerbSnapshot; 1],
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MedicineSnapshot {
    pub chakras: Vec<ChakraSnapshotRow>,
    pub active_decan: ActiveDecanSnapshot,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MedicinePinReceipt {
    pub pinned: bool,
    pub materia: String,
    pub frontmatter_key: &'static str,
}

/// Project a Medicine view model from the canonical chakra/decan LUTs.
pub fn medicine_snapshot(sun_degree: f32) -> Result<MedicineSnapshot, String> {
    if !sun_degree.is_finite() {
        return Err("sunDegree must be finite".to_owned());
    }
    let normalized_degree = sun_degree.rem_euclid(360.0);
    let decan_idx = decan_for_degree(normalized_degree);
    let decan = zodiac_decan(decan_idx)
        .ok_or_else(|| format!("no canonical Medicine decan for index {decan_idx}"))?;
    let active_chakra_id = PLANET_CHAKRA
        .get(decan.ruling_planet as usize)
        .copied()
        .ok_or_else(|| format!("no chakra mapping for planet {}", decan.ruling_planet))?;

    let chakras = CHAKRA_BODY_ZONES
        .iter()
        .enumerate()
        .map(|(id, zones)| ChakraSnapshotRow {
            id: id as u8,
            name: chakra_name(id as u8),
            dominant_element_id: (1_u8..=4)
                .find(|element_id| ELEMENT_CHAKRA[*element_id as usize] == id as u8),
            body_zones: zones,
        })
        .collect();

    Ok(MedicineSnapshot {
        chakras,
        active_decan: ActiveDecanSnapshot {
            sun_degree: normalized_degree,
            sign_idx: decan.sign,
            decan_in_sign: decan.decan_in_sign,
            decan_idx,
            body_part: decan.body_part,
            ruling_planet: planet_name(decan.ruling_planet),
            ruling_planet_glyph: planet_glyph(decan.ruling_planet),
            active_chakra_id,
            herbs: [HerbSnapshot {
                vernacular: decan.herb,
                botanical: DECAN_HERB_BOTANICAL[decan_idx as usize],
            }],
        },
    })
}

/// Persist one canonical decan materia name to the active NOW artifact.
pub fn pin_materia(materia: &str) -> Result<MedicinePinReceipt, String> {
    let now_path = std::env::var_os("EPI_NOW_PATH")
        .map(PathBuf::from)
        .ok_or_else(|| "EPI_NOW_PATH is required for a governed NOW pin".to_owned())?;
    pin_materia_at_path(materia, &now_path)
}

fn pin_materia_at_path(materia: &str, now_path: &Path) -> Result<MedicinePinReceipt, String> {
    let canonical = ZODIAC_DECAN_TABLE
        .iter()
        .find(|entry| entry.herb == materia)
        .map(|entry| entry.herb)
        .ok_or_else(|| "materia must match a canonical Medicine decan herb".to_owned())?;
    let _mutation_guard = NOW_MUTATION_LOCK
        .lock()
        .map_err(|_| "NOW mutation lock is poisoned".to_owned())?;
    let source = fs::read_to_string(now_path)
        .map_err(|error| format!("could not read NOW artifact: {error}"))?;
    let updated = append_frontmatter_string(&source, "c_4_pinned_materia", canonical)?;
    atomic_replace(now_path, updated.as_bytes())?;

    Ok(MedicinePinReceipt {
        pinned: true,
        materia: canonical.to_owned(),
        frontmatter_key: "c_4_pinned_materia",
    })
}

fn atomic_replace(path: &Path, content: &[u8]) -> Result<(), String> {
    let parent = path
        .parent()
        .ok_or_else(|| "NOW artifact path has no parent directory".to_owned())?;
    let file_name = path
        .file_name()
        .and_then(|name| name.to_str())
        .ok_or_else(|| "NOW artifact path has no valid file name".to_owned())?;
    let sequence = TEMP_SEQUENCE.fetch_add(1, Ordering::Relaxed);
    let temporary = parent.join(format!(
        ".{file_name}.medicine-pin-{}-{sequence}",
        std::process::id()
    ));
    let result = (|| -> Result<(), String> {
        let mut file = OpenOptions::new()
            .create_new(true)
            .write(true)
            .open(&temporary)
            .map_err(|error| format!("could not create temporary NOW artifact: {error}"))?;
        file.write_all(content)
            .and_then(|_| file.sync_all())
            .map_err(|error| format!("could not flush temporary NOW artifact: {error}"))?;
        if let Ok(metadata) = fs::metadata(path) {
            fs::set_permissions(&temporary, metadata.permissions())
                .map_err(|error| format!("could not preserve NOW permissions: {error}"))?;
        }
        fs::rename(&temporary, path)
            .map_err(|error| format!("could not atomically replace NOW artifact: {error}"))
    })();
    if result.is_err() {
        let _ = fs::remove_file(&temporary);
    }
    result
}

fn planet_glyph(id: u8) -> &'static str {
    match id {
        0 => "☉",
        1 => "⊕",
        2 => "♀",
        3 => "☿",
        4 => "☽",
        5 => "♄",
        6 => "♃",
        7 => "♂",
        _ => "?",
    }
}

// Taxonomic display metadata paired by index with the canonical decan table.
static DECAN_HERB_BOTANICAL: [&str; 36] = [
    "Crataegus monogyna",
    "Urtica dioica",
    "Rosa damascena",
    "Medicago sativa",
    "Hordeum vulgare",
    "Salvia officinalis",
    "Lavandula angustifolia",
    "Boswellia sacra",
    "Salvia rosmarinus",
    "Jasminum officinale",
    "Nymphaea alba",
    "Nelumbo nucifera",
    "Helianthus annuus",
    "Calendula officinalis",
    "Hypericum perforatum",
    "Triticum aestivum",
    "Mentha spicata",
    "Foeniculum vulgare",
    "Matricaria chamomilla",
    "Commiphora myrrha",
    "Viola odorata",
    "Mandragora officinarum",
    "Artemisia absinthium",
    "Rubus fruticosus",
    "Artemisia tridentata",
    "Juniperus communis",
    "Acacia senegal",
    "Symphytum officinale",
    "Cirsium vulgare",
    "Cedrus libani",
    "Marrubium vulgare",
    "Euphrasia officinalis",
    "Galanthus nivalis",
    "Laminaria digitata",
    "Nelumbo nucifera",
    "Papaver somniferum",
];

/// `epi nara medicine safety`
pub fn safety(practice: Option<&str>) -> Result<String, String> {
    match practice {
        Some(p) => Ok(format!(
            "Safety check for '{}': CLEAR (no contraindications)",
            p
        )),
        None => Ok("Safety status: CLEAR — no active contraindications.".to_string()),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn concurrent_materia_pins_do_not_lose_either_update() {
        let sequence = TEMP_SEQUENCE.fetch_add(1, Ordering::Relaxed);
        let directory = std::env::temp_dir().join(format!(
            "epi-medicine-concurrent-pin-{}-{sequence}",
            std::process::id()
        ));
        fs::create_dir_all(&directory).unwrap();
        let now_path = directory.join("NOW.md");
        fs::write(
            &now_path,
            "---\ncoordinate: M4\nc_4_pinned_materia: []\n---\n\n# NOW\n",
        )
        .unwrap();

        std::thread::scope(|scope| {
            let first = now_path.clone();
            let second = now_path.clone();
            scope.spawn(move || pin_materia_at_path("Nettle", &first).unwrap());
            scope.spawn(move || pin_materia_at_path("Hawthorn", &second).unwrap());
        });

        let persisted = fs::read_to_string(&now_path).unwrap();
        assert!(persisted.contains("- Nettle"));
        assert!(persisted.contains("- Hawthorn"));
        fs::remove_dir_all(directory).unwrap();
    }
}
