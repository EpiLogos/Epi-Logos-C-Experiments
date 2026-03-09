use super::types::KnowingDossier;

pub fn render_text(dossier: &KnowingDossier) -> String {
    let mut lines = Vec::new();
    lines.push(format!("{} — {}", dossier.coordinate, dossier.title));
    lines.push("Essence:".to_string());
    lines.push(format!("  {}", dossier.essence.text));
    lines.push(format!(
        "  Branch: #{} ({})",
        dossier.essence.branch_id, dossier.essence.branch_name
    ));
    if let Some(phase) = &dossier.essence.phase {
        lines.push(format!("  Phase: {}", phase));
    }

    lines.push("Structural Correspondences:".to_string());
    for item in &dossier.structural_correspondences {
        let marker = if item.is_self { ">" } else { " " };
        lines.push(format!(
            "  {} {:<3} {}",
            marker, item.coordinate, item.label
        ));
    }

    lines.push("Relational Field:".to_string());
    lines.push(format!(
        "  {}",
        dossier
            .relational_field
            .summary
            .as_deref()
            .unwrap_or("Awaiting live graph constellation integration.")
    ));
    if !dossier.relational_field.constellation.is_empty() {
        lines.push("  Constellation:".to_string());
        for item in &dossier.relational_field.constellation {
            lines.push(format!(
                "    {}{}",
                item.label,
                item.detail
                    .as_deref()
                    .map(|detail| format!(" — {}", detail))
                    .unwrap_or_default()
            ));
        }
    }
    if !dossier.relational_field.chain.is_empty() {
        lines.push("  Chain:".to_string());
        for item in &dossier.relational_field.chain {
            lines.push(format!(
                "    {}{}",
                item.label,
                item.detail
                    .as_deref()
                    .map(|detail| format!(" — {}", detail))
                    .unwrap_or_default()
            ));
        }
    }

    lines.push("Vimarsa Field:".to_string());
    lines.push(format!(
        "  {}",
        dossier
            .vimarsa_field
            .summary
            .as_deref()
            .unwrap_or("Awaiting project-scoped file connector integration.")
    ));
    if let Some(project_scope) = &dossier.vimarsa_field.project_scope {
        lines.push(format!("  Project: {}", project_scope));
    }
    for (index, item) in dossier.vimarsa_field.items.iter().enumerate() {
        lines.push(format!(
            "  {}. {}{}",
            index + 1,
            item.label,
            item.detail
                .as_deref()
                .map(|detail| format!(" — {}", detail))
                .unwrap_or_default()
        ));
    }

    lines.push("Notebook Pulse:".to_string());
    lines.push(format!(
        "  {}",
        dossier
            .notebook_pulse
            .text
            .as_deref()
            .unwrap_or("Awaiting notebook pulse integration.")
    ));

    lines.push("Latest Snapshot:".to_string());
    lines.push(format!(
        "  {}",
        dossier
            .latest_snapshot
            .text
            .as_deref()
            .unwrap_or("Awaiting first live snapshot refresh.")
    ));

    lines.push("Actions:".to_string());
    for action in &dossier.actions {
        lines.push(format!("  {}  {}", action.id, action.label));
    }

    lines.join("\n")
}

pub fn render_json(dossier: &KnowingDossier) -> color_eyre::Result<String> {
    Ok(serde_json::to_string_pretty(dossier)?)
}
