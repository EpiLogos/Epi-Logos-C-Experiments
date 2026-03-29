use crate::core::knowing::types::{FacetItem, KnowingDossier};
use crate::core::knowing::{build_family_dossier, persist_dossier_snapshot};
use crossterm::{
    event::{self, Event, KeyCode, KeyEventKind},
    terminal::{disable_raw_mode, enable_raw_mode, EnterAlternateScreen, LeaveAlternateScreen},
    ExecutableCommand,
};
use ratatui::{prelude::*, widgets::*};
use std::io::stdout;
use std::process::Command;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum FacetTab {
    Essence,
    Structural,
    Relational,
    Vimarsa,
    Notebook,
    Snapshot,
    Actions,
}

impl FacetTab {
    fn all() -> [FacetTab; 7] {
        [
            FacetTab::Essence,
            FacetTab::Structural,
            FacetTab::Relational,
            FacetTab::Vimarsa,
            FacetTab::Notebook,
            FacetTab::Snapshot,
            FacetTab::Actions,
        ]
    }

    fn title(self) -> &'static str {
        match self {
            FacetTab::Essence => "Essence",
            FacetTab::Structural => "Structural",
            FacetTab::Relational => "Relations",
            FacetTab::Vimarsa => "Vimarsa",
            FacetTab::Notebook => "Notebook",
            FacetTab::Snapshot => "Snapshot",
            FacetTab::Actions => "Actions",
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct FamilyRefreshSpec {
    family: u8,
    pos: u8,
    inverted: bool,
    project: Option<String>,
    limit: usize,
}

impl FamilyRefreshSpec {
    pub fn new(family: u8, pos: u8, inverted: bool, project: Option<String>, limit: usize) -> Self {
        Self {
            family,
            pos,
            inverted,
            project,
            limit,
        }
    }
}

pub struct KnowingTuiState {
    pub dossier: KnowingDossier,
    pub active_facet: FacetTab,
    pub selected_vimarsa_index: usize,
    pub selected_action_index: usize,
    pub should_quit: bool,
    pub status_message: String,
    refresh_spec: Option<FamilyRefreshSpec>,
}

impl KnowingTuiState {
    pub fn new(dossier: KnowingDossier) -> Self {
        Self {
            dossier,
            active_facet: FacetTab::Essence,
            selected_vimarsa_index: 0,
            selected_action_index: 0,
            should_quit: false,
            status_message: "Tab through facets, Enter executes selected action.".to_string(),
            refresh_spec: None,
        }
    }

    pub fn with_refresh_spec(dossier: KnowingDossier, refresh_spec: FamilyRefreshSpec) -> Self {
        let mut state = Self::new(dossier);
        state.refresh_spec = Some(refresh_spec);
        state
    }

    fn next_tab(&mut self) {
        let tabs = FacetTab::all();
        let index = tabs
            .iter()
            .position(|tab| *tab == self.active_facet)
            .unwrap_or(0);
        self.active_facet = tabs[(index + 1) % tabs.len()];
    }

    fn previous_tab(&mut self) {
        let tabs = FacetTab::all();
        let index = tabs
            .iter()
            .position(|tab| *tab == self.active_facet)
            .unwrap_or(0);
        self.active_facet = tabs[(index + tabs.len() - 1) % tabs.len()];
    }

    fn move_selection_up(&mut self) {
        match self.active_facet {
            FacetTab::Vimarsa => {
                self.selected_vimarsa_index = self.selected_vimarsa_index.saturating_sub(1);
            }
            FacetTab::Actions => {
                self.selected_action_index = self.selected_action_index.saturating_sub(1);
            }
            _ => {}
        }
    }

    fn move_selection_down(&mut self) {
        match self.active_facet {
            FacetTab::Vimarsa => {
                if self.selected_vimarsa_index + 1 < self.dossier.vimarsa_field.items.len() {
                    self.selected_vimarsa_index += 1;
                }
            }
            FacetTab::Actions => {
                if self.selected_action_index + 1 < self.dossier.actions.len() {
                    self.selected_action_index += 1;
                }
            }
            _ => {}
        }
    }

    pub fn refresh_family_dossier(
        &mut self,
        family: u8,
        pos: u8,
        inverted: bool,
        project: Option<&str>,
        limit: usize,
    ) -> color_eyre::Result<()> {
        self.dossier = build_family_dossier(family, pos, inverted, project, limit);
        persist_dossier_snapshot(&self.dossier, project)?;
        if self.selected_vimarsa_index >= self.dossier.vimarsa_field.items.len() {
            self.selected_vimarsa_index = self.dossier.vimarsa_field.items.len().saturating_sub(1);
        }
        if self.selected_action_index >= self.dossier.actions.len() {
            self.selected_action_index = self.dossier.actions.len().saturating_sub(1);
        }
        self.status_message = format!("Refreshed {}.", self.dossier.coordinate);
        Ok(())
    }

    fn refresh_from_spec(&mut self) -> color_eyre::Result<()> {
        let spec = self
            .refresh_spec
            .clone()
            .ok_or_else(|| color_eyre::eyre::eyre!("Refresh context unavailable"))?;
        self.refresh_family_dossier(
            spec.family,
            spec.pos,
            spec.inverted,
            spec.project.as_deref(),
            spec.limit,
        )
    }
}

pub fn run_knowing(
    dossier: KnowingDossier,
    refresh_spec: FamilyRefreshSpec,
) -> color_eyre::Result<()> {
    enter_terminal()?;
    let mut terminal = Terminal::new(CrosstermBackend::new(stdout()))?;
    let mut state = KnowingTuiState::with_refresh_spec(dossier, refresh_spec);

    while !state.should_quit {
        terminal.draw(|frame| draw(frame, &state))?;

        if event::poll(std::time::Duration::from_millis(50))? {
            if let Event::Key(key) = event::read()? {
                if key.kind == KeyEventKind::Press {
                    match key.code {
                        KeyCode::Char('q') | KeyCode::Esc => state.should_quit = true,
                        KeyCode::Left | KeyCode::Char('h') => state.previous_tab(),
                        KeyCode::Right | KeyCode::Char('l') => state.next_tab(),
                        KeyCode::Up | KeyCode::Char('k') => state.move_selection_up(),
                        KeyCode::Down | KeyCode::Char('j') => state.move_selection_down(),
                        KeyCode::Enter => {
                            if let Err(error) = execute_selected_action(&mut terminal, &mut state) {
                                state.status_message = error.to_string();
                            }
                        }
                        _ => {}
                    }
                }
            }
        }
    }

    exit_terminal()?;
    Ok(())
}

fn draw(frame: &mut Frame, state: &KnowingTuiState) {
    let layout = Layout::default()
        .direction(Direction::Vertical)
        .constraints([
            Constraint::Length(3),
            Constraint::Length(3),
            Constraint::Min(10),
            Constraint::Length(3),
        ])
        .split(frame.area());

    let header = Paragraph::new(format!(
        " {} — {}  |  Branch #{} ({}) ",
        state.dossier.coordinate,
        state.dossier.title,
        state.dossier.essence.branch_id,
        state.dossier.essence.branch_name
    ))
    .block(
        Block::default()
            .borders(Borders::ALL)
            .border_style(Style::default().fg(Color::Cyan)),
    );
    frame.render_widget(header, layout[0]);

    let tabs = Tabs::new(
        FacetTab::all()
            .iter()
            .map(|tab| Line::from(tab.title()))
            .collect::<Vec<_>>(),
    )
    .select(
        FacetTab::all()
            .iter()
            .position(|tab| *tab == state.active_facet)
            .unwrap_or(0),
    )
    .block(Block::default().borders(Borders::ALL).title(" Facets "))
    .highlight_style(Style::default().fg(Color::Black).bg(Color::Green));
    frame.render_widget(tabs, layout[1]);

    let main = Layout::default()
        .direction(Direction::Horizontal)
        .constraints([Constraint::Percentage(42), Constraint::Percentage(58)])
        .split(layout[2]);

    draw_left_panel(frame, main[0], state);
    draw_right_panel(frame, main[1], state);

    let footer = Paragraph::new(state.status_message.as_str()).block(
        Block::default()
            .borders(Borders::ALL)
            .title(" Status ")
            .border_style(Style::default().fg(Color::DarkGray)),
    );
    frame.render_widget(footer, layout[3]);
}

fn draw_left_panel(frame: &mut Frame, area: Rect, state: &KnowingTuiState) {
    let mut lines = vec![
        Line::from(format!("Essence: {}", state.dossier.essence.text)),
        Line::from(""),
        Line::from("Structural Correspondences:"),
    ];
    lines.extend(state.dossier.structural_correspondences.iter().map(|item| {
        let marker = if item.is_self { ">" } else { " " };
        Line::from(format!(" {} {} {}", marker, item.coordinate, item.label))
    }));

    let panel = Paragraph::new(lines)
        .block(Block::default().borders(Borders::ALL).title(" Identity "))
        .wrap(Wrap { trim: false });
    frame.render_widget(panel, area);
}

fn draw_right_panel(frame: &mut Frame, area: Rect, state: &KnowingTuiState) {
    match state.active_facet {
        FacetTab::Essence => draw_text_panel(
            frame,
            area,
            "Essence",
            vec![
                Line::from(state.dossier.essence.text.clone()),
                Line::from(format!(
                    "Branch #{} ({})",
                    state.dossier.essence.branch_id, state.dossier.essence.branch_name
                )),
            ],
        ),
        FacetTab::Structural => draw_text_panel(
            frame,
            area,
            "Structural",
            state
                .dossier
                .structural_correspondences
                .iter()
                .map(|item| {
                    Line::from(format!(
                        "{} {} — {}",
                        if item.is_self { ">" } else { " " },
                        item.coordinate,
                        item.label
                    ))
                })
                .collect(),
        ),
        FacetTab::Relational => draw_relation_panel(frame, area, state),
        FacetTab::Vimarsa => draw_vimarsa_panel(frame, area, state),
        FacetTab::Notebook => draw_text_panel(
            frame,
            area,
            "Notebook Pulse",
            vec![Line::from(
                state
                    .dossier
                    .notebook_pulse
                    .text
                    .clone()
                    .unwrap_or_else(|| "No notebook pulse available.".to_string()),
            )],
        ),
        FacetTab::Snapshot => draw_text_panel(
            frame,
            area,
            "Latest Snapshot",
            vec![Line::from(
                state
                    .dossier
                    .latest_snapshot
                    .text
                    .clone()
                    .unwrap_or_else(|| "No snapshot available.".to_string()),
            )],
        ),
        FacetTab::Actions => draw_actions_panel(frame, area, state),
    }
}

fn draw_text_panel(frame: &mut Frame, area: Rect, title: &str, lines: Vec<Line>) {
    let panel = Paragraph::new(lines)
        .block(
            Block::default()
                .borders(Borders::ALL)
                .title(format!(" {} ", title)),
        )
        .wrap(Wrap { trim: false });
    frame.render_widget(panel, area);
}

fn draw_relation_panel(frame: &mut Frame, area: Rect, state: &KnowingTuiState) {
    let mut lines = Vec::new();
    lines.push(Line::from(
        state
            .dossier
            .relational_field
            .summary
            .clone()
            .unwrap_or_else(|| "No relational summary.".to_string()),
    ));
    lines.push(Line::from(""));
    lines.push(Line::from("Constellation:"));
    for item in &state.dossier.relational_field.constellation {
        lines.push(detail_line(item));
    }
    lines.push(Line::from(""));
    lines.push(Line::from("Chain:"));
    for item in &state.dossier.relational_field.chain {
        lines.push(detail_line(item));
    }
    draw_text_panel(frame, area, "Relational Field", lines);
}

fn draw_vimarsa_panel(frame: &mut Frame, area: Rect, state: &KnowingTuiState) {
    let items = if state.dossier.vimarsa_field.items.is_empty() {
        vec![ListItem::new(" No Vimarsa hits available ")]
    } else {
        state
            .dossier
            .vimarsa_field
            .items
            .iter()
            .enumerate()
            .map(|(index, item)| {
                let style = if index == state.selected_vimarsa_index {
                    Style::default().fg(Color::Black).bg(Color::Yellow)
                } else {
                    Style::default()
                };
                ListItem::new(format!(
                    " {}. {}{}",
                    index + 1,
                    item.label,
                    item.detail
                        .as_deref()
                        .map(|detail| format!(" — {}", detail))
                        .unwrap_or_default()
                ))
                .style(style)
            })
            .collect()
    };

    let list = List::new(items).block(Block::default().borders(Borders::ALL).title(format!(
                " Vimarsa Field {} ",
                state
                    .dossier
                    .vimarsa_field
                    .project_scope
                    .as_deref()
                    .map(|project| format!("[{}]", project))
                    .unwrap_or_default()
            )));
    frame.render_widget(list, area);
}

fn draw_actions_panel(frame: &mut Frame, area: Rect, state: &KnowingTuiState) {
    let items: Vec<ListItem> = state
        .dossier
        .actions
        .iter()
        .enumerate()
        .map(|(index, action)| {
            let style = if index == state.selected_action_index {
                Style::default().fg(Color::Black).bg(Color::Green)
            } else if action.enabled {
                Style::default().fg(Color::White)
            } else {
                Style::default().fg(Color::DarkGray)
            };
            ListItem::new(format!(" {} {}", action.id, action.label)).style(style)
        })
        .collect();

    let panel = List::new(items).block(Block::default().borders(Borders::ALL).title(" Actions "));
    frame.render_widget(panel, area);
}

fn detail_line(item: &FacetItem) -> Line<'static> {
    Line::from(format!(
        "{}{}",
        item.label,
        item.detail
            .as_deref()
            .map(|detail| format!(" — {}", detail))
            .unwrap_or_default()
    ))
}

fn execute_selected_action(
    terminal: &mut Terminal<CrosstermBackend<std::io::Stdout>>,
    state: &mut KnowingTuiState,
) -> color_eyre::Result<()> {
    if state.active_facet != FacetTab::Actions {
        state.status_message = "Move to the Actions tab to execute commands.".to_string();
        return Ok(());
    }

    let action = state
        .dossier
        .actions
        .get(state.selected_action_index)
        .ok_or_else(|| color_eyre::eyre::eyre!("No action selected"))?;

    if !action.enabled {
        state.status_message = format!("Action '{}' is currently disabled.", action.id);
        return Ok(());
    }

    match action.id.as_str() {
        "refresh" => {
            state.refresh_from_spec()?;
        }
        "open" => {
            let path = selected_vimarsa_path(state)?;
            run_external_command(terminal, "open", &[path])?;
            state.status_message = format!("Opened {}", path);
        }
        "glow" => {
            let path = selected_vimarsa_path(state)?;
            if !(path.ends_with(".md") || path.ends_with(".markdown")) {
                state.status_message = format!("Selected Vimarsa item is not markdown: {}", path);
                return Ok(());
            }
            run_external_command(terminal, "glow", &[path])?;
            state.status_message = format!("Previewed {}", path);
        }
        other => {
            state.status_message = format!("Action '{}' is not implemented.", other);
        }
    }

    Ok(())
}

fn selected_vimarsa_path(state: &KnowingTuiState) -> color_eyre::Result<&str> {
    state
        .dossier
        .vimarsa_field
        .items
        .get(state.selected_vimarsa_index)
        .and_then(|item| item.detail.as_deref())
        .ok_or_else(|| color_eyre::eyre::eyre!("No Vimarsa path selected"))
}

fn run_external_command(
    terminal: &mut Terminal<CrosstermBackend<std::io::Stdout>>,
    program: &str,
    args: &[&str],
) -> color_eyre::Result<()> {
    let _ = terminal;
    exit_terminal()?;
    let status = Command::new(program)
        .args(args)
        .status()
        .map_err(|e| color_eyre::eyre::eyre!("Failed to run {}: {}", program, e))?;
    enter_terminal()?;
    if !status.success() {
        return Err(color_eyre::eyre::eyre!(
            "{} exited with status {:?}",
            program,
            status.code()
        ));
    }
    Ok(())
}

fn enter_terminal() -> color_eyre::Result<()> {
    enable_raw_mode()?;
    stdout().execute(EnterAlternateScreen)?;
    Ok(())
}

fn exit_terminal() -> color_eyre::Result<()> {
    disable_raw_mode()?;
    stdout().execute(LeaveAlternateScreen)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::core::knowing::types::{
        EssenceFacet, KnowingAction, LatestSnapshotFacet, NotebookPulseFacet, RelationalFieldFacet,
        StructuralCorrespondence, VimarsaFieldFacet,
    };
    use std::collections::BTreeMap;
    use std::path::PathBuf;
    use std::sync::{Mutex, OnceLock};

    #[test]
    fn knowing_tui_state_tracks_selected_vimarsa_hit_and_active_facet() {
        let state = KnowingTuiState::new(sample_dossier());
        assert_eq!(state.active_facet, FacetTab::Essence);
        assert_eq!(state.selected_vimarsa_index, 0);
        assert_eq!(state.selected_action_index, 0);
    }

    #[test]
    fn refresh_rebuilds_dossier_from_overlay_and_persists_snapshot_cache() {
        let _guard = env_lock().lock().unwrap();
        let temp_dir = std::env::temp_dir().join(format!(
            "epi-knowing-tui-refresh-{}-{}",
            std::process::id(),
            std::thread::current().name().unwrap_or("unnamed")
        ));
        std::fs::create_dir_all(&temp_dir).unwrap();
        std::env::set_var("EPI_KNOWING_DIR", &temp_dir);

        write_overlay(&temp_dir, "Form -- first cut");
        let dossier = crate::core::knowing::build_family_dossier(0, 1, false, Some("proj"), 5);
        let mut state = KnowingTuiState::new(dossier);

        write_overlay(&temp_dir, "Form -- refreshed from overlay");
        state
            .refresh_family_dossier(0, 1, false, Some("proj"), 5)
            .unwrap();

        assert_eq!(state.dossier.essence.text, "Form -- refreshed from overlay");

        let cache_path = temp_dir.join("snapshot-cache.json");
        assert!(
            cache_path.exists(),
            "expected snapshot cache at {:?}",
            cache_path
        );

        let cache: crate::core::knowing::cache::SnapshotCache =
            serde_json::from_str(&std::fs::read_to_string(&cache_path).unwrap()).unwrap();
        let entry = cache.coordinates.get("C1").expect("C1 cache entry");
        assert_eq!(entry.project_scope.as_deref(), Some("proj"));
        assert_eq!(
            entry.latest_snapshot.as_deref(),
            state.dossier.latest_snapshot.text.as_deref()
        );

        std::env::remove_var("EPI_KNOWING_DIR");
        std::fs::remove_dir_all(&temp_dir).ok();
    }

    fn env_lock() -> &'static Mutex<()> {
        static LOCK: OnceLock<Mutex<()>> = OnceLock::new();
        LOCK.get_or_init(|| Mutex::new(()))
    }

    fn write_overlay(base: &PathBuf, essence: &str) {
        let overlay = crate::core::overlay::QvOverlay {
            version: 1,
            updated_at: "2026-03-08T00:00:00Z".to_string(),
            coordinates: BTreeMap::from([(
                "C1".to_string(),
                crate::core::overlay::QvEntry {
                    essence: Some(essence.to_string()),
                    q_nature: None,
                    q_essence: None,
                    q_formulation: None,
                    q_structure: None,
                },
            )]),
        };
        std::fs::write(
            base.join("overlay.json"),
            serde_json::to_string_pretty(&overlay).unwrap(),
        )
        .unwrap();
    }

    fn sample_dossier() -> KnowingDossier {
        KnowingDossier {
            coordinate: "C1".to_string(),
            title: "Category".to_string(),
            essence: EssenceFacet {
                text: "Form -- essential nature".to_string(),
                branch_id: "5-5".to_string(),
                branch_name: "T+C+T'+C' Logos cycle".to_string(),
                phase: None,
            },
            qv_facet: Default::default(),
            structural_correspondences: vec![StructuralCorrespondence {
                coordinate: "C1".to_string(),
                family: "Category".to_string(),
                label: "Form".to_string(),
                is_self: true,
            }],
            relational_field: RelationalFieldFacet {
                source: "graph".to_string(),
                summary: Some("Graph connected".to_string()),
                constellation: vec![FacetItem {
                    label: "P1".to_string(),
                    detail: Some("Definition".to_string()),
                }],
                chain: vec![FacetItem {
                    label: "#1".to_string(),
                    detail: Some("BEDROCK".to_string()),
                }],
                items: vec![],
            },
            vimarsa_field: VimarsaFieldFacet {
                source: "vimarsa".to_string(),
                project_scope: Some("early-epi".to_string()),
                summary: Some("1 hit".to_string()),
                items: vec![FacetItem {
                    label: "note".to_string(),
                    detail: Some("/tmp/test.md".to_string()),
                }],
            },
            notebook_pulse: NotebookPulseFacet {
                source: "notebook".to_string(),
                text: Some("Pulse".to_string()),
            },
            latest_snapshot: LatestSnapshotFacet {
                source: "synthesized".to_string(),
                text: Some("Snapshot".to_string()),
            },
            actions: vec![KnowingAction {
                id: "refresh".to_string(),
                label: "Refresh dossier facets".to_string(),
                enabled: true,
            }],
        }
    }
}
