use std::fs;
use std::path::{Component, Path, PathBuf};

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum BaseScope {
    Ctx,
    Zone,
    Moc,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct BaseSortSpec {
    pub property: String,
    pub direction: String,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct BaseViewSpec {
    pub view_type: String,
    pub name: String,
    pub filters: Vec<String>,
    pub group_by: Option<String>,
    pub order: Vec<String>,
    pub sort: Vec<BaseSortSpec>,
    pub image: Option<String>,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct BaseSchema {
    pub ct_type: Option<String>,
    pub filter: String,
    pub columns: Vec<String>,
    pub group_by: Option<String>,
    pub sort: Vec<BaseSortSpec>,
    pub views: Vec<BaseViewSpec>,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct BaseEnsureParams {
    pub coordinate: String,
    pub ct_type: Option<String>,
    pub scope: BaseScope,
    pub residency: PathBuf,
    pub views: Option<Vec<BaseViewSpec>>,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct BaseEnsureResult {
    pub path: PathBuf,
    pub derived_columns: Vec<String>,
    pub ok: bool,
    pub existed: bool,
    pub changed: bool,
}

pub fn ensure_base_view(params: &BaseEnsureParams) -> Result<BaseEnsureResult, String> {
    if params.coordinate.trim().is_empty() {
        return Err("coordinate must be non-empty".to_owned());
    }
    validate_reflection_residency(&params.residency)?;

    let mut schema = match &params.ct_type {
        Some(ct_type) => derive_base_schema_from_ct_contract(ct_type)?,
        None => derive_coordinate_base_schema(&params.coordinate, params.scope),
    };
    if let Some(views) = &params.views {
        schema.views = views.clone();
    }

    fs::create_dir_all(&params.residency).map_err(|error| {
        format!(
            "failed to create base-view residency '{}': {error}",
            params.residency.display()
        )
    })?;

    let path = params.residency.join(format!(
        "{}.base-view.md",
        artifact_file_stem(&params.coordinate)
    ));
    let rendered = render_base_view_note(params, &schema);
    let previous = fs::read_to_string(&path).ok();
    let existed = previous.is_some();
    let changed = previous.as_deref() != Some(rendered.as_str());
    if changed {
        fs::write(&path, rendered)
            .map_err(|error| format!("failed to write base-view '{}': {error}", path.display()))?;
    }

    Ok(BaseEnsureResult {
        path,
        derived_columns: schema.columns,
        ok: true,
        existed,
        changed,
    })
}

pub fn derive_base_schema_from_ct_contract(ct_type: &str) -> Result<BaseSchema, String> {
    let columns = ct_contract_columns(ct_type)
        .ok_or_else(|| format!("unsupported CTx contract: {ct_type}"))?
        .iter()
        .map(|column| (*column).to_owned())
        .collect::<Vec<_>>();
    let group_by = match ct_type {
        "CT4b" => Some("c_3_day_id".to_owned()),
        "CT5" => Some("t_0_thought_type".to_owned()),
        _ => Some("c_4_artifact_role".to_owned()),
    };
    let sort = if columns.iter().any(|column| column == "c_3_created_at") {
        vec![BaseSortSpec {
            property: "c_3_created_at".to_owned(),
            direction: "DESC".to_owned(),
        }]
    } else {
        vec![BaseSortSpec {
            property: "coordinate".to_owned(),
            direction: "ASC".to_owned(),
        }]
    };
    let filter = format!(r#"c_1_ct_type == "{ct_type}""#);
    let view = BaseViewSpec {
        view_type: "table".to_owned(),
        name: format!("{ct_type} contract reflection"),
        filters: vec![filter.clone()],
        group_by: group_by.clone(),
        order: columns.clone(),
        sort: sort.clone(),
        image: None,
    };

    Ok(BaseSchema {
        ct_type: Some(ct_type.to_owned()),
        filter,
        columns,
        group_by,
        sort,
        views: vec![view],
    })
}

fn derive_coordinate_base_schema(coordinate: &str, scope: BaseScope) -> BaseSchema {
    let filter = match scope {
        BaseScope::Ctx => format!(r#"coordinate == "{coordinate}""#),
        BaseScope::Zone | BaseScope::Moc => format!(r#"coordinate.startsWith("{coordinate}")"#),
    };
    let columns = vec![
        "coordinate".to_owned(),
        "title".to_owned(),
        "c_4_artifact_role".to_owned(),
        "c_0_source_coordinates".to_owned(),
        "c_5_reflection_complete".to_owned(),
    ];
    let sort = vec![BaseSortSpec {
        property: "coordinate".to_owned(),
        direction: "ASC".to_owned(),
    }];

    BaseSchema {
        ct_type: None,
        filter: filter.clone(),
        columns: columns.clone(),
        group_by: Some("c_4_artifact_role".to_owned()),
        sort: sort.clone(),
        views: vec![BaseViewSpec {
            view_type: "table".to_owned(),
            name: format!("{coordinate} coordinate reflection"),
            filters: vec![filter],
            group_by: Some("c_4_artifact_role".to_owned()),
            order: columns,
            sort,
            image: None,
        }],
    }
}

fn ct_contract_columns(ct_type: &str) -> Option<&'static [&'static str]> {
    match ct_type {
        "CT0" => Some(&[
            "coordinate",
            "c_4_artifact_role",
            "c_3_ctx_frame",
            "c_3_created_at",
            "c_0_source_coordinates",
            "p0_grounds",
            "p1_definitions",
        ]),
        "CT1" => Some(&[
            "coordinate",
            "c_4_artifact_role",
            "c_3_ctx_frame",
            "c_3_created_at",
            "c_3_updated_at",
            "c_5_crystallisation_state",
            "c_0_source_coordinates",
            "p0_grounds",
            "p1_definitions",
        ]),
        "CT2" => Some(&[
            "coordinate",
            "title",
            "c_4_artifact_role",
            "c_3_ctx_frame",
            "c_3_created_at",
            "c_0_source_coordinates",
            "p0_grounds",
            "p1_definitions",
            "p2_operations",
        ]),
        "CT3" => Some(&[
            "coordinate",
            "title",
            "c_4_artifact_role",
            "c_3_ctx_frame",
            "c_3_created_at",
            "c_0_source_coordinates",
            "p0_grounds",
            "p1_definitions",
            "p2_operations",
            "p3_patterns",
        ]),
        "CT4a" => Some(&[
            "coordinate",
            "title",
            "c_4_artifact_role",
            "c_3_ctx_frame",
            "c_3_created_at",
            "c_0_source_coordinates",
            "p0_grounds",
            "p1_definitions",
            "p2_operations",
            "p3_patterns",
            "p4_context",
        ]),
        "CT4b" => Some(&[
            "coordinate",
            "c_4_artifact_role",
            "c_2_session_id",
            "session_id",
            "c_3_day_id",
            "day_id",
            "c_3_ctx_frame",
            "c_3_created_at",
            "c_3_tranche_mode",
            "c_3_response_orbit",
            "c_3_klein_weighting",
            "c_4_cf_code",
            "c_4_cp_position",
            "c_4_cs_depth",
            "c_5_reflection_complete",
            "p0_grounds",
            "p0_adjacencies",
            "p1_tasks_defined",
            "p1_intentions",
            "p2_sessions",
            "p2_operations",
            "p2_outputs",
            "p2_manual_activity",
            "p3_patterns",
            "p3_observations",
            "p3_connections",
            "p3_decisions",
            "p4_temporals",
            "p4_files_touched",
            "p4_people_mentioned",
            "p4_concepts_engaged",
            "p5_learnings",
            "p5_synthesis",
            "p5_tomorrow_focus",
        ]),
        "CT5" => Some(&[
            "coordinate",
            "title",
            "c_4_artifact_role",
            "t_0_thought_type",
            "ql_position",
            "c_3_created_at",
            "c_5_crystallisation_state",
            "c_5_reflection_complete",
            "c_0_source_coordinates",
            "p0_grounds",
            "p1_definitions",
            "p2_operations",
            "p3_patterns",
            "p4_concepts_engaged",
            "p5_integrations",
            "p5_synthesis",
        ]),
        _ => None,
    }
}

fn validate_reflection_residency(path: &Path) -> Result<(), String> {
    let segments = path_segments(path);
    let allowed = starts_with_slice(&segments, &["Empty", "Present"])
        || starts_with_slice(&segments, &["Map"])
        || starts_with_slice(&segments, &["Seeds"])
        || starts_with_slice(&segments, &["World", "Types", "Coordinates"])
        || contains_slice(&segments, &["Idea", "Empty", "Present"])
        || contains_slice(&segments, &["Idea", "Bimba", "Map"])
        || contains_slice(&segments, &["Idea", "Bimba", "Seeds"])
        || contains_slice(
            &segments,
            &["Idea", "Bimba", "World", "Types", "Coordinates"],
        );

    if allowed {
        return Ok(());
    }

    Err(format!(
        "base-view residency '{}' is reflection-only; refusing canon residency",
        path.display()
    ))
}

fn render_base_view_note(params: &BaseEnsureParams, schema: &BaseSchema) -> String {
    let mut output = String::new();
    output.push_str("---\n");
    output.push_str(&format!(
        "coordinate: \"{}\"\n",
        yaml_double(&params.coordinate)
    ));
    output.push_str("c_4_artifact_role: \"base-view\"\n");
    if let Some(ct_type) = &schema.ct_type {
        output.push_str(&format!("c_1_ct_type: \"{}\"\n", yaml_double(ct_type)));
    }
    output.push_str(&format!(
        "c_5_reflects: \"[[{}]]\"\n",
        yaml_double(&params.coordinate)
    ));
    output.push_str("c_3_projected_from: \"s1'.base.ensure\"\n");
    output.push_str("c_0_source_coordinates:\n");
    output.push_str(&format!(
        "  - \"[[{}]]\"\n",
        yaml_double(&params.coordinate)
    ));
    if let Some(ct_type) = &schema.ct_type {
        if ct_type != &params.coordinate {
            output.push_str(&format!("  - \"[[{}]]\"\n", yaml_double(ct_type)));
        }
        output.push_str("  - \"[[CT]]\"\n");
    }
    output.push_str("---\n");
    output.push_str("```base\n");
    output.push_str("filters:\n");
    output.push_str("  and:\n");
    output.push_str(&format!("    - '{}'\n", schema.filter));
    output.push_str("views:\n");
    for view in &schema.views {
        render_view(&mut output, view);
    }
    output.push_str("```\n");
    output
}

fn render_view(output: &mut String, view: &BaseViewSpec) {
    output.push_str(&format!("  - type: {}\n", view.view_type));
    output.push_str(&format!("    name: \"{}\"\n", yaml_double(&view.name)));
    if !view.filters.is_empty() {
        output.push_str("    filters:\n");
        output.push_str("      and:\n");
        for filter in &view.filters {
            output.push_str(&format!("        - '{}'\n", filter));
        }
    }
    if let Some(group_by) = &view.group_by {
        output.push_str(&format!("    group_by: {group_by}\n"));
    }
    if let Some(image) = &view.image {
        output.push_str(&format!("    image: {image}\n"));
    }
    output.push_str("    order:\n");
    for column in &view.order {
        output.push_str(&format!("      - {column}\n"));
    }
    if !view.sort.is_empty() {
        output.push_str("    sort:\n");
        for sort in &view.sort {
            output.push_str(&format!(
                "      - {{ property: {}, direction: {} }}\n",
                sort.property, sort.direction
            ));
        }
    }
}

fn artifact_file_stem(coordinate: &str) -> String {
    coordinate
        .chars()
        .map(|ch| match ch {
            '\'' => "prime".to_owned(),
            '/' | '\\' | ':' | '*' | '?' | '"' | '<' | '>' | '|' => "-".to_owned(),
            ch if ch.is_ascii_whitespace() => "_".to_owned(),
            ch => ch.to_string(),
        })
        .collect()
}

fn path_segments(path: &Path) -> Vec<String> {
    path.components()
        .filter_map(|component| match component {
            Component::Normal(value) => value.to_str().map(|value| value.to_owned()),
            _ => None,
        })
        .collect()
}

fn starts_with_slice(segments: &[String], needle: &[&str]) -> bool {
    segments
        .iter()
        .map(String::as_str)
        .zip(needle.iter().copied())
        .all(|(left, right)| left == right)
        && segments.len() >= needle.len()
}

fn contains_slice(segments: &[String], needle: &[&str]) -> bool {
    segments
        .windows(needle.len())
        .any(|window| window.iter().map(String::as_str).eq(needle.iter().copied()))
}

fn yaml_double(value: &str) -> String {
    value.replace('\\', "\\\\").replace('"', "\\\"")
}
