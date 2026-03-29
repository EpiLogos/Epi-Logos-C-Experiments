pub mod cache;
pub mod graph;
pub mod notebook;
pub mod render;
pub mod types;
pub mod vimarsa;

use super::{branch_for_family, overlay, FAMILY_LETTERS, FAMILY_NAMES, RELATION_PITHYS};
use chrono::Utc;
use types::{
    EssenceFacet, KnowingAction, KnowingDossier, NotebookPulseFacet, QvFacet, RelationalFieldFacet,
    StructuralCorrespondence, VimarsaFieldFacet,
};

/// Build mode for the dossier: controls which facets are fetched.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum DossierMode {
    /// Default: all facets in parallel (graph + vimarsa + notebook).
    Full,
    /// Quick: only graph; skip vimarsa and notebook.
    Quick,
}

impl Default for DossierMode {
    fn default() -> Self {
        DossierMode::Full
    }
}

/// Maximum age for a cached snapshot to be considered fresh (1 hour).
const CACHE_FRESH_SECS: i64 = 3600;

pub fn build_family_dossier(
    family: u8,
    pos: u8,
    inverted: bool,
    project: Option<&str>,
    limit: usize,
) -> KnowingDossier {
    build_family_dossier_with_mode(family, pos, inverted, project, limit, DossierMode::Full)
}

pub fn build_family_dossier_with_mode(
    family: u8,
    pos: u8,
    inverted: bool,
    project: Option<&str>,
    limit: usize,
    mode: DossierMode,
) -> KnowingDossier {
    let family_letter = FAMILY_LETTERS[family as usize];
    let title = FAMILY_NAMES[family as usize].to_string();
    let inv_suffix = if inverted { "'" } else { "" };
    let coordinate = format!("{}{}{}", family_letter, pos, inv_suffix);
    let pithy = overlay::overlay_pithy(&coordinate).unwrap_or_else(|| {
        let base = RELATION_PITHYS[family as usize][pos as usize];
        if inverted {
            format!("{} (inverted) -- {}", base, title)
        } else {
            format!("{} -- {}", base, title)
        }
    });
    let qv_facet = overlay::overlay_entry(&coordinate)
        .map(|e| QvFacet {
            q_nature: e.q_nature,
            q_essence: e.q_essence,
            q_formulation: e.q_formulation,
            q_structure: e.q_structure,
        })
        .unwrap_or_default();
    let (branch_id, branch_name) = branch_for_family(family, inverted);

    let structural_correspondences = FAMILY_LETTERS
        .iter()
        .enumerate()
        .map(|(index, letter)| StructuralCorrespondence {
            coordinate: format!("{}{}", letter, pos),
            family: FAMILY_NAMES[index].to_string(),
            label: RELATION_PITHYS[index][pos as usize].to_string(),
            is_self: *letter == family_letter,
        })
        .collect();

    // Fetch the three live facets — parallelized when in Full mode.
    let (relational_field, vimarsa_field, notebook_pulse) =
        fetch_live_facets(&coordinate, project, limit, mode);

    let latest_snapshot =
        notebook::synthesize_latest_snapshot(&relational_field, &vimarsa_field, &notebook_pulse);
    let has_vimarsa_items = !vimarsa_field.items.is_empty();

    KnowingDossier {
        coordinate,
        title,
        essence: EssenceFacet {
            text: pithy,
            branch_id: branch_id.to_string(),
            branch_name: branch_name.to_string(),
            phase: inverted.then(|| {
                format!(
                    "' (result of # inversion applied to {}{})",
                    family_letter, pos
                )
            }),
        },
        qv_facet,
        structural_correspondences,
        relational_field,
        vimarsa_field,
        notebook_pulse,
        latest_snapshot,
        actions: vec![
            KnowingAction {
                id: "refresh".to_string(),
                label: "Refresh dossier facets".to_string(),
                enabled: true,
            },
            KnowingAction {
                id: "open".to_string(),
                label: "Open selected Vimarsa item".to_string(),
                enabled: has_vimarsa_items,
            },
            KnowingAction {
                id: "glow".to_string(),
                label: "Preview selected markdown with glow".to_string(),
                enabled: has_vimarsa_items,
            },
        ],
    }
}

/// Fetch graph, vimarsa, and notebook facets.
///
/// In `Full` mode the three calls run on parallel threads.
/// In `Quick` mode only graph is fetched; vimarsa and notebook are stubbed.
fn fetch_live_facets(
    coordinate: &str,
    project: Option<&str>,
    limit: usize,
    mode: DossierMode,
) -> (RelationalFieldFacet, VimarsaFieldFacet, NotebookPulseFacet) {
    match mode {
        DossierMode::Quick => {
            let relational_field = graph::build_relational_field(coordinate);
            let vimarsa_field = VimarsaFieldFacet {
                source: "skipped".to_string(),
                project_scope: project.map(str::to_string),
                summary: Some("Skipped in --quick mode".to_string()),
                items: Vec::new(),
            };
            let notebook_pulse = NotebookPulseFacet {
                source: "skipped".to_string(),
                text: Some("Skipped in --quick mode".to_string()),
            };
            (relational_field, vimarsa_field, notebook_pulse)
        }
        DossierMode::Full => {
            // Run all three facets in parallel using OS threads.
            // graph::build_relational_field internally handles its own tokio runtime,
            // vimarsa and notebook are pure sync (Command::new), so threads are ideal.
            let coord_graph = coordinate.to_owned();
            let coord_vimarsa = coordinate.to_owned();
            let coord_notebook = coordinate.to_owned();
            let project_owned = project.map(str::to_string);
            let project_for_vimarsa = project_owned.clone();

            let graph_handle =
                std::thread::spawn(move || graph::build_relational_field(&coord_graph));
            let vimarsa_handle = std::thread::spawn(move || {
                vimarsa::build_vimarsa_field(&coord_vimarsa, project_for_vimarsa.as_deref(), limit)
            });
            let notebook_handle =
                std::thread::spawn(move || notebook::build_notebook_pulse(&coord_notebook));

            let relational_field = graph_handle
                .join()
                .unwrap_or_else(|_| RelationalFieldFacet {
                    source: "graph-panic".to_string(),
                    summary: Some("Graph facet thread panicked".to_string()),
                    constellation: Vec::new(),
                    chain: Vec::new(),
                    items: Vec::new(),
                });
            let vimarsa_field = vimarsa_handle.join().unwrap_or_else(|_| VimarsaFieldFacet {
                source: "vimarsa-panic".to_string(),
                project_scope: project_owned,
                summary: Some("Vimarsa facet thread panicked".to_string()),
                items: Vec::new(),
            });
            let notebook_pulse = notebook_handle
                .join()
                .unwrap_or_else(|_| NotebookPulseFacet {
                    source: "notebook-panic".to_string(),
                    text: Some("Notebook facet thread panicked".to_string()),
                });

            (relational_field, vimarsa_field, notebook_pulse)
        }
    }
}

/// Check if the cache has a fresh entry (< 1 hour old) for this coordinate.
pub fn cached_snapshot_fresh(coordinate: &str) -> bool {
    let snap = cache::load_snapshot_cache();
    if let Some(entry) = snap.coordinates.get(coordinate) {
        if let Ok(cached_time) = chrono::DateTime::parse_from_rfc3339(&entry.updated_at) {
            let age = Utc::now().signed_duration_since(cached_time);
            return age.num_seconds() < CACHE_FRESH_SECS;
        }
    }
    false
}

pub fn persist_dossier_snapshot(
    dossier: &KnowingDossier,
    project: Option<&str>,
) -> color_eyre::Result<()> {
    let timestamp = Utc::now().to_rfc3339();
    let mut cache = cache::load_snapshot_cache();
    cache.version = 1;
    cache.updated_at = timestamp.clone();
    cache.coordinates.insert(
        dossier.coordinate.clone(),
        cache::SnapshotEntry {
            updated_at: timestamp,
            project_scope: project.map(str::to_string),
            latest_snapshot: dossier.latest_snapshot.text.clone(),
            kbase_hits: dossier
                .vimarsa_field
                .items
                .iter()
                .map(|item| cache::KbaseHit {
                    label: item.label.clone(),
                    location: item.detail.clone(),
                })
                .collect(),
            notebook_pulse: dossier
                .notebook_pulse
                .text
                .clone()
                .map(|text| cache::NotebookPulse { text }),
            relation_hits: dossier
                .relational_field
                .chain
                .iter()
                .map(|item| cache::RelationHit {
                    coordinate: item.label.clone(),
                    relation: item.detail.clone(),
                })
                .collect(),
        },
    );
    cache::save_snapshot_cache(&cache).map_err(|e| color_eyre::eyre::eyre!(e))
}
