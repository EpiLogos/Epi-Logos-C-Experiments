use ratatui::prelude::*;
use ratatui::widgets::*;
use ratatui_hypertile::{EventOutcome, HypertileEvent, KeyCode};
use ratatui_hypertile_extras::HypertilePlugin;

use crate::gate::{epii, system};
use crate::portal::runtime_state::PortalRuntimeState;
use crate::portal::surfaces::{
    portal_surfaces, readiness_report_from_health_and_agent_status, PortalReadinessReport,
};
use crate::portal::topology::coordinate_catalog;
use crate::sesh::session::repo_root_from_env;

pub struct CommandCenterPlugin {
    selected_surface: usize,
    runtime_state: Option<PortalRuntimeState>,
    readiness_report: Option<PortalReadinessReport>,
}

impl CommandCenterPlugin {
    pub fn new() -> Self {
        Self {
            selected_surface: 0,
            runtime_state: None,
            readiness_report: load_default_readiness_report(),
        }
    }

    pub fn new_with_runtime(runtime_state: PortalRuntimeState) -> Self {
        Self {
            selected_surface: 0,
            runtime_state: Some(runtime_state),
            readiness_report: load_default_readiness_report(),
        }
    }
}

impl HypertilePlugin for CommandCenterPlugin {
    fn render(&self, area: Rect, buf: &mut Buffer, is_focused: bool) {
        let border_color = if is_focused {
            Color::Cyan
        } else {
            Color::DarkGray
        };
        let surfaces = portal_surfaces();
        let selected = surfaces.get(self.selected_surface);
        let catalog = coordinate_catalog();

        let mut lines = Vec::new();
        lines.push(Line::from(vec![
            Span::styled("/ ", Style::default().fg(Color::Yellow)),
            Span::styled(
                "S0' Command / Config Centre",
                Style::default()
                    .fg(Color::Cyan)
                    .add_modifier(Modifier::BOLD),
            ),
        ]));

        if let Some(runtime_state) = &self.runtime_state {
            push_temporal_surface_lines(&mut lines, runtime_state);
        }

        lines.push(Line::from(""));
        lines.push(Line::from("Surfaces"));
        for (idx, surface) in surfaces.iter().enumerate() {
            let marker = if idx == self.selected_surface {
                ">"
            } else {
                " "
            };
            lines.push(Line::from(format!(
                "{marker} {} [{}] {}",
                surface.id, surface.coordinate, surface.command_hint
            )));
        }

        if let Some(surface) = selected {
            lines.push(Line::from(""));
            lines.push(Line::from(format!("Selected: {}", surface.label)));
            lines.push(Line::from(format!(
                "{:?} / {:?}",
                surface.kind, surface.source
            )));
            lines.push(Line::from(format!(
                "raw health: {}  agent access: {}",
                surface.proves_raw_service_health, surface.proves_agent_access_separately
            )));
            lines.push(Line::from(""));
            lines.push(Line::from("Actions"));
            for action in &surface.actions {
                let command = action.command.join(" ");
                lines.push(Line::from(format!(
                    "- {} [{:?}] {}",
                    action.label, action.kind, command
                )));
            }
            if !surface.config_fields.is_empty() {
                lines.push(Line::from(""));
                lines.push(Line::from("Editable Fields"));
                for field in &surface.config_fields {
                    let command = field.apply_command.join(" ");
                    lines.push(Line::from(format!(
                        "- {} [{}] apply: {}",
                        field.key, field.coordinate, command
                    )));
                }
            }
        }

        lines.push(Line::from(""));
        lines.push(Line::from(format!(
            "S/S': {}",
            catalog
                .s_layers
                .iter()
                .map(|coord| coord.id)
                .collect::<Vec<_>>()
                .join(" ")
        )));
        lines.push(Line::from(format!(
            "M/M': {}",
            catalog
                .m_layers
                .iter()
                .map(|coord| coord.id)
                .collect::<Vec<_>>()
                .join(" ")
        )));

        if let Some(report) = &self.readiness_report {
            lines.push(Line::from(""));
            lines.push(Line::from("Readiness Result State"));
            lines.push(Line::from("Raw Services"));
            for result in &report.raw_service_results {
                lines.push(Line::from(format!(
                    "- {} [{}] {} :: {}",
                    result.id, result.coordinate, result.status, result.detail
                )));
            }
            lines.push(Line::from("Agent Access"));
            for result in &report.agent_access_results {
                lines.push(Line::from(format!(
                    "- {} [{}] {} :: {}",
                    result.id, result.coordinate, result.status, result.detail
                )));
            }
        }

        let block = Block::default()
            .title(" / Command ")
            .borders(Borders::ALL)
            .border_style(Style::default().fg(border_color));
        let paragraph = Paragraph::new(lines)
            .block(block)
            .wrap(Wrap { trim: false });
        Widget::render(paragraph, area, buf);
    }

    fn on_event(&mut self, event: &HypertileEvent) -> EventOutcome {
        if let HypertileEvent::Key(chord) = event {
            let surfaces = portal_surfaces();
            match chord.code {
                KeyCode::Down | KeyCode::Char('j') => {
                    if !surfaces.is_empty() {
                        self.selected_surface = (self.selected_surface + 1) % surfaces.len();
                    }
                    return EventOutcome::Consumed;
                }
                KeyCode::Up | KeyCode::Char('k') => {
                    if !surfaces.is_empty() {
                        self.selected_surface = if self.selected_surface == 0 {
                            surfaces.len() - 1
                        } else {
                            self.selected_surface - 1
                        };
                    }
                    return EventOutcome::Consumed;
                }
                _ => {}
            }
        }
        EventOutcome::Ignored
    }
}

fn load_default_readiness_report() -> Option<PortalReadinessReport> {
    let repo_root = repo_root_from_env();
    let state_root = repo_root.join(".epi").join("gate");
    let health = system::health_snapshot(&state_root).ok()?;
    let agent_status = load_epii_status(&state_root);
    Some(readiness_report_from_health_and_agent_status(
        &health,
        agent_status.as_ref(),
    ))
}

fn push_temporal_surface_lines(lines: &mut Vec<Line<'static>>, runtime_state: &PortalRuntimeState) {
    let temporal = runtime_state.temporal();
    let temporal = temporal.lock().unwrap();
    lines.push(Line::from(""));
    lines.push(Line::from("Temporal Surface"));
    lines.push(Line::from(format!(
        "{} -> {}  source: {:?}",
        temporal.coordinate_owner, temporal.agent_access_owner, temporal.source
    )));
    lines.push(Line::from(format!(
        "DAY: {}  NOW: {}",
        temporal.day_id.as_deref().unwrap_or("unbound"),
        temporal
            .now_wikilink
            .as_deref()
            .or_else(|| temporal.now_path.as_ref().and_then(|path| path.to_str()))
            .unwrap_or("unbound")
    )));
    lines.push(Line::from(format!(
        "Kairos: {} fresh={} gen={}  Pratibimba: {}",
        temporal.kairos_valid,
        temporal.kairos_fresh,
        temporal.generation,
        temporal
            .pratibimba_anchor_id
            .as_deref()
            .unwrap_or("unbound")
    )));
    lines.push(Line::from(format!(
        "Redis: {} {}  SpaceTimeDB: {} {}/{}/{}",
        temporal.redis_hydrated,
        temporal
            .redis_session_now_key
            .as_deref()
            .unwrap_or("unbound"),
        temporal
            .spacetimedb_projection_source
            .as_deref()
            .unwrap_or("unbound"),
        temporal
            .spacetimedb_projection_table
            .as_deref()
            .unwrap_or("unbound"),
        temporal
            .spacetimedb_kairos_projection_table
            .as_deref()
            .unwrap_or("unbound"),
        temporal
            .spacetimedb_global_projection_table
            .as_deref()
            .unwrap_or("unbound")
    )));
}

fn load_epii_status(state_root: &std::path::Path) -> Option<serde_json::Value> {
    let runtime = tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
        .ok()?;
    runtime.block_on(epii::status(state_root)).ok()
}
