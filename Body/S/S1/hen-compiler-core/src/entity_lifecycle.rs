//! CCT-14 — the S1' entity-candidate lifecycle law.
//!
//! Pure planning functions: Hen owns the LAW (paths, frontmatter shape,
//! codon derivation, promotion intents); the S0 gate adapter and the CLI
//! own the IO that executes a plan. One derivation path — every plan runs
//! the same [`GraphPromotionIntent::from_markdown`] the gateway promotion
//! uses, so CLI capture and gateway capture produce identical Hen
//! behaviour and identical `:World` graph evidence by construction
//! (DR-S5-ONE-1 + DR-WORLD-1).
//!
//! Lifecycle: dangling wikilinks / loose root notes capture into
//! `Idea/Empty/Present/{day}/entities/` as `entity_candidate` artifacts
//! (provisional birth-codon, CCT-14b) → classify assigns a C-layer →
//! reviewed candidates promote into `World/Types/Coordinates/**`
//! (codon ratifies) → stable definitions graduate flat into
//! `World/{Name}.md` with the type-local file retained as a MOC pointer
//! (codon carried unchanged).

use serde::{Deserialize, Serialize};
use serde_yaml::{Mapping, Value};

use crate::birth_codon::BirthCodonState;
use crate::graph_promotion::{BirthCodonComputation, GraphPromotionIntent};

/// Canonical C-layer folder segments under
/// `Idea/Bimba/World/Types/Coordinates/C/{Cn}/`.
pub const C_LAYER_SEGMENTS: [(&str, &str); 6] = [
    ("C0", "Source-Ground"),
    ("C1", "Forms-And-Templates"),
    ("C2", "Entities-Properties-Tags"),
    ("C3", "Processes-Canvases-Diagrams"),
    ("C4", "Types-Contexts-MOCs"),
    ("C5", "Crystallisations-Pratibimba"),
];

pub fn c_layer_segment(c_layer: &str) -> Option<&'static str> {
    C_LAYER_SEGMENTS
        .iter()
        .find(|(layer, _)| *layer == c_layer)
        .map(|(_, segment)| *segment)
}

/// candidate | promoted | graduated, resolved from residency.
pub fn entity_state_for_path(path: &str) -> Option<&'static str> {
    let normalized = path.replace('\\', "/");
    if normalized.starts_with("Idea/Empty/") {
        Some("candidate")
    } else if normalized.starts_with("Idea/Bimba/World/Types/") {
        Some("promoted")
    } else if normalized.starts_with("Idea/Bimba/World/") {
        Some("graduated")
    } else {
        None
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct EntityCapturePlan {
    pub candidate_path: String,
    pub title: String,
    /// Full candidate file content (frontmatter + body) for the adapter to
    /// write.
    pub markdown: String,
    pub birth_codon: BirthCodonComputation,
    pub intent: GraphPromotionIntent,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct EntityClassifyPlan {
    pub candidate_path: String,
    pub type_coordinate: String,
    pub markdown: String,
    pub birth_codon: BirthCodonComputation,
    pub intent: GraphPromotionIntent,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct EntityPromotionPlan {
    pub from_path: String,
    pub to_path: String,
    /// Content to write at `to_path` (birth codon ratified).
    pub markdown: String,
    pub birth_codon: BirthCodonComputation,
    pub intent: GraphPromotionIntent,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct WorldGraduationPlan {
    pub type_source_path: String,
    pub flat_world_path: String,
    /// Content of the graduated flat `World/{Name}.md`.
    pub flat_markdown: String,
    /// Replacement content for the type-local file, retained as a
    /// MOC/source pointer.
    pub moc_pointer_markdown: String,
    pub birth_codon: BirthCodonComputation,
    pub intent: GraphPromotionIntent,
}

/// Capture a dangling wikilink target or loose root note into the day's
/// candidate pool. `existing_body` carries the loose note's body when the
/// source file exists; a bare wikilink target captures with a stub body.
pub fn plan_entity_capture(
    source: &str,
    day_id: &str,
    creator_identity: Option<&str>,
    existing_body: Option<&str>,
) -> Result<EntityCapturePlan, String> {
    if day_id.is_empty() {
        return Err("entity capture requires a day_id (DD-MM-YYYY)".to_owned());
    }
    let title = entity_title_from_source(source)?;
    let candidate_path = format!("Idea/Empty/Present/{day_id}/entities/{title}.md");

    let body = existing_body
        .map(str::trim)
        .filter(|body| !body.is_empty())
        .map(str::to_owned)
        .unwrap_or_else(|| format!("Captured entity candidate for [[{title}]]."));

    let mut frontmatter = candidate_frontmatter(&title, "C2", creator_identity);
    let markdown = render_markdown(&frontmatter, &body);

    // One derivation path: the same promotion law the gateway runs.
    let intent = GraphPromotionIntent::from_markdown(candidate_path.clone(), &markdown)?;
    let birth_codon = intent
        .birth_codon_computed
        .clone()
        .ok_or_else(|| format!("capture into {candidate_path} must compute a birth codon"))?;
    debug_assert_eq!(birth_codon.state, BirthCodonState::Provisional);

    // Write the derived codon family into the candidate frontmatter so the
    // vault stays readable without Hen.
    merge_birth_codon_properties(&mut frontmatter, &birth_codon);
    let markdown = render_markdown(&frontmatter, &body);

    Ok(EntityCapturePlan {
        candidate_path,
        title,
        markdown,
        birth_codon,
        intent,
    })
}

/// Assign a provisional C-layer to a captured candidate. The provisional
/// birth-codon recomputes from the current body.
pub fn plan_entity_classify(
    candidate_path: &str,
    current_markdown: &str,
    c_layer: Option<&str>,
) -> Result<EntityClassifyPlan, String> {
    if entity_state_for_path(candidate_path) != Some("candidate") {
        return Err(format!(
            "classify targets a candidate under Idea/Empty/, got: {candidate_path}"
        ));
    }
    let (mut frontmatter, body) = split_markdown(current_markdown)?;
    let title = mapping_str(&frontmatter, "title")
        .ok_or_else(|| format!("candidate at {candidate_path} is missing title frontmatter"))?;

    let layer = c_layer.unwrap_or("C2");
    let segment = c_layer_segment(layer)
        .ok_or_else(|| format!("unknown C-layer for entity classification: {layer}"))?;
    insert_str(&mut frontmatter, "coordinate", layer);
    insert_str(&mut frontmatter, "type_family", "C");
    insert_str(&mut frontmatter, "type_coordinate", layer);
    insert_str(
        &mut frontmatter,
        "type_path",
        &format!("Idea/Bimba/World/Types/Coordinates/C/{layer}/{segment}/{title}"),
    );
    insert_str(
        &mut frontmatter,
        "c_layer_path",
        &format!("Idea/Bimba/World/Types/Coordinates/C/{layer}"),
    );

    let markdown = render_markdown(&frontmatter, &body);
    let intent = GraphPromotionIntent::from_markdown(candidate_path.to_owned(), &markdown)?;
    let birth_codon = intent
        .birth_codon_computed
        .clone()
        .ok_or_else(|| format!("classify at {candidate_path} must compute a birth codon"))?;

    let mut frontmatter = frontmatter;
    merge_birth_codon_properties(&mut frontmatter, &birth_codon);
    let markdown = render_markdown(&frontmatter, &body);

    Ok(EntityClassifyPlan {
        candidate_path: candidate_path.to_owned(),
        type_coordinate: layer.to_owned(),
        markdown,
        birth_codon,
        intent,
    })
}

/// Promote a reviewed candidate into `World/Types/Coordinates/**`. The
/// provisional codon ratifies (value preserved; the territory archetype is
/// invariant across the lifecycle).
pub fn plan_entity_promote_to_type(
    candidate_path: &str,
    current_markdown: &str,
) -> Result<EntityPromotionPlan, String> {
    if entity_state_for_path(candidate_path) != Some("candidate") {
        return Err(format!(
            "promotion targets a candidate under Idea/Empty/, got: {candidate_path}"
        ));
    }
    let (frontmatter, body) = split_markdown(current_markdown)?;
    let type_path = mapping_str(&frontmatter, "type_path").ok_or_else(|| {
        format!("candidate at {candidate_path} is missing type_path frontmatter — classify first")
    })?;
    let to_path = format!("{type_path}.md");

    // Compute the intent at the TARGET residency while the frontmatter
    // still says provisional: the ratification transition event fires here.
    let staged = render_markdown(&frontmatter, &body);
    let intent = GraphPromotionIntent::from_markdown(to_path.clone(), &staged)?;
    let birth_codon = intent
        .birth_codon_computed
        .clone()
        .ok_or_else(|| format!("promotion to {to_path} must compute a birth codon"))?;
    debug_assert_eq!(birth_codon.state, BirthCodonState::Ratified);

    let mut frontmatter = frontmatter;
    insert_str(&mut frontmatter, "candidate_state", "promoted");
    merge_birth_codon_properties(&mut frontmatter, &birth_codon);
    let markdown = render_markdown(&frontmatter, &body);

    Ok(EntityPromotionPlan {
        from_path: candidate_path.to_owned(),
        to_path,
        markdown,
        birth_codon,
        intent,
    })
}

/// Graduate a stable type-local definition flat into `World/{Name}.md`,
/// retaining the type-local file as a MOC/source pointer. The ratified
/// codon carries forward unchanged.
pub fn plan_world_graduate(
    type_source_path: &str,
    current_markdown: &str,
) -> Result<WorldGraduationPlan, String> {
    if entity_state_for_path(type_source_path) != Some("promoted") {
        return Err(format!(
            "graduation targets a type-local entity under Idea/Bimba/World/Types/, got: {type_source_path}"
        ));
    }
    let (mut frontmatter, body) = split_markdown(current_markdown)?;
    let title = mapping_str(&frontmatter, "title")
        .ok_or_else(|| format!("entity at {type_source_path} is missing title frontmatter"))?;
    let flat_world_path = format!("Idea/Bimba/World/{title}.md");

    insert_str(
        &mut frontmatter,
        "source_c_authority_path",
        type_source_path,
    );
    insert_str(&mut frontmatter, "flat_world_target", &flat_world_path);
    insert_str(
        &mut frontmatter,
        "crystallisation_state",
        "crystallised_world_form",
    );
    insert_str(&mut frontmatter, "candidate_state", "graduated");

    let flat_markdown = render_markdown(&frontmatter, &body);
    let intent = GraphPromotionIntent::from_markdown(flat_world_path.clone(), &flat_markdown)?;
    let birth_codon = intent
        .birth_codon_computed
        .clone()
        .ok_or_else(|| format!("graduation to {flat_world_path} must compute a birth codon"))?;
    debug_assert_eq!(birth_codon.state, BirthCodonState::Ratified);

    // The type-local file is retained as a MOC/source pointer to the flat
    // World entity.
    let mut pointer_frontmatter = frontmatter.clone();
    insert_str(&mut pointer_frontmatter, "candidate_state", "graduated");
    let moc_pointer_markdown = render_markdown(
        &pointer_frontmatter,
        &format!("Graduated to [[{title}]]. This file is retained as the MOC/source pointer."),
    );

    Ok(WorldGraduationPlan {
        type_source_path: type_source_path.to_owned(),
        flat_world_path,
        flat_markdown,
        moc_pointer_markdown,
        birth_codon,
        intent,
    })
}

/// One review-surface row from an entity file (candidate pool or World).
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct EntityListEntry {
    pub path: String,
    pub title: String,
    pub state: String,
    pub type_coordinate: Option<String>,
    pub birth_codon: Option<u8>,
    pub birth_codon_state: Option<String>,
}

pub fn entity_list_entry(path: &str, markdown: &str) -> Result<EntityListEntry, String> {
    let state = entity_state_for_path(path)
        .ok_or_else(|| format!("not an entity-lifecycle residency: {path}"))?;
    let (frontmatter, _) = split_markdown(markdown)?;
    Ok(EntityListEntry {
        path: path.to_owned(),
        title: mapping_str(&frontmatter, "title").unwrap_or_else(|| {
            path.rsplit('/')
                .next()
                .unwrap_or(path)
                .trim_end_matches(".md")
                .to_owned()
        }),
        state: state.to_owned(),
        type_coordinate: mapping_str(&frontmatter, "type_coordinate"),
        birth_codon: frontmatter
            .get(Value::String("c_5_birth_codon".to_owned()))
            .and_then(Value::as_u64)
            .and_then(|n| u8::try_from(n).ok()),
        birth_codon_state: mapping_str(&frontmatter, "birth_codon_state"),
    })
}

fn entity_title_from_source(source: &str) -> Result<String, String> {
    let normalized = source.replace('\\', "/");
    let stem = normalized
        .rsplit('/')
        .next()
        .unwrap_or(&normalized)
        .trim_end_matches(".md")
        .trim();
    if stem.is_empty() {
        return Err(format!("cannot derive an entity title from: {source}"));
    }
    if stem.contains("[[") || stem.contains("]]") || stem.contains('#') || stem.contains('|') {
        return Err(format!(
            "entity title must be a bare wikilink target without markup: {stem}"
        ));
    }
    Ok(stem.to_owned())
}

fn candidate_frontmatter(title: &str, c_layer: &str, creator_identity: Option<&str>) -> Mapping {
    let segment = c_layer_segment(c_layer).unwrap_or("Entities-Properties-Tags");
    let mut map = Mapping::new();
    insert_str(&mut map, "coordinate", c_layer);
    insert_str(&mut map, "title", title);
    insert_str(&mut map, "type_family", "C");
    insert_str(&mut map, "type_coordinate", c_layer);
    insert_str(
        &mut map,
        "type_path",
        &format!("Idea/Bimba/World/Types/Coordinates/C/{c_layer}/{segment}/{title}"),
    );
    insert_str(
        &mut map,
        "c_layer_path",
        &format!("Idea/Bimba/World/Types/Coordinates/C/{c_layer}"),
    );
    insert_str(&mut map, "semantic_authority", "candidate_pending_review");
    insert_str(&mut map, "crystallisation_state", "entity_candidate");
    insert_str(&mut map, "candidate_state", "candidate");
    if let Some(creator) = creator_identity {
        insert_str(&mut map, "creator_identity", creator);
    }
    map
}

fn merge_birth_codon_properties(frontmatter: &mut Mapping, computation: &BirthCodonComputation) {
    for (key, value) in computation.record.properties(computation.state) {
        let yaml = match value {
            serde_json::Value::Number(number) => {
                if let Some(unsigned) = number.as_u64() {
                    Value::Number(unsigned.into())
                } else if let Some(signed) = number.as_i64() {
                    Value::Number(signed.into())
                } else {
                    continue;
                }
            }
            serde_json::Value::String(text) => Value::String(text),
            _ => continue,
        };
        frontmatter.insert(Value::String(key), yaml);
    }
}

fn split_markdown(markdown: &str) -> Result<(Mapping, String), String> {
    let trimmed = markdown.trim_start();
    if !trimmed.starts_with("---") {
        return Err("entity artifact is missing frontmatter".to_owned());
    }
    let after = &trimmed[3..];
    let end = after
        .find("\n---")
        .ok_or_else(|| "entity artifact frontmatter is unterminated".to_owned())?;
    let yaml_text = &after[..end];
    let rest = &after[end + 4..];
    let body = rest.trim_start_matches(['\r', '\n']).to_owned();
    let value: Value = serde_yaml::from_str(yaml_text)
        .map_err(|err| format!("entity artifact frontmatter is not valid YAML: {err}"))?;
    let mapping = value
        .as_mapping()
        .cloned()
        .ok_or_else(|| "entity artifact frontmatter is not a mapping".to_owned())?;
    Ok((mapping, body))
}

fn render_markdown(frontmatter: &Mapping, body: &str) -> String {
    let yaml = serde_yaml::to_string(&Value::Mapping(frontmatter.clone()))
        .expect("frontmatter mapping serialises");
    format!("---\n{yaml}---\n\n{}\n", body.trim_end())
}

fn mapping_str(map: &Mapping, key: &str) -> Option<String> {
    map.get(Value::String(key.to_owned()))
        .and_then(Value::as_str)
        .map(str::to_owned)
}

fn insert_str(map: &mut Mapping, key: &str, value: &str) {
    map.insert(
        Value::String(key.to_owned()),
        Value::String(value.to_owned()),
    );
}
