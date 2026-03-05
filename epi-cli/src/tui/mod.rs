use crate::ffi::{self, EpiLib};
use crate::ffi::tagged;
use crossterm::{
    event::{self, Event, KeyCode, KeyEventKind},
    terminal::{disable_raw_mode, enable_raw_mode, EnterAlternateScreen, LeaveAlternateScreen},
    ExecutableCommand,
};
use ratatui::{
    prelude::*,
    widgets::*,
};
use std::io::stdout;

// ─── Dashboard App ───

struct App<'a> {
    epi: &'a EpiLib,
    selected: usize,
    entries: Vec<(&'static str, *const ffi::HolographicCoordinate)>,
    should_quit: bool,
}

impl<'a> App<'a> {
    fn new(epi: &'a EpiLib) -> Self {
        Self {
            entries: epi.all_bimba(),
            epi,
            selected: 0,
            should_quit: false,
        }
    }

    fn selected_snapshot(&self) -> Option<ffi::CoordSnapshot> {
        self.entries.get(self.selected).and_then(|(_, ptr)| ffi::read_coord(*ptr))
    }
}

pub fn run_dashboard(epi: &EpiLib) -> color_eyre::Result<()> {
    enable_raw_mode()?;
    stdout().execute(EnterAlternateScreen)?;
    let mut terminal = Terminal::new(CrosstermBackend::new(stdout()))?;

    let mut app = App::new(epi);

    while !app.should_quit {
        terminal.draw(|frame| draw(frame, &app))?;

        if event::poll(std::time::Duration::from_millis(50))? {
            if let Event::Key(key) = event::read()? {
                if key.kind == KeyEventKind::Press {
                    match key.code {
                        KeyCode::Char('q') | KeyCode::Esc => app.should_quit = true,
                        KeyCode::Up | KeyCode::Char('k') => {
                            if app.selected > 0 { app.selected -= 1; }
                        }
                        KeyCode::Down | KeyCode::Char('j') => {
                            if app.selected + 1 < app.entries.len() { app.selected += 1; }
                        }
                        _ => {}
                    }
                }
            }
        }
    }

    disable_raw_mode()?;
    stdout().execute(LeaveAlternateScreen)?;
    Ok(())
}

fn draw(frame: &mut Frame, app: &App) {
    let outer = Layout::default()
        .direction(Direction::Vertical)
        .constraints([
            Constraint::Min(10),
            Constraint::Length(5),
            Constraint::Length(3),
        ])
        .split(frame.area());

    let main_area = Layout::default()
        .direction(Direction::Horizontal)
        .constraints([
            Constraint::Percentage(35),
            Constraint::Percentage(65),
        ])
        .split(outer[0]);

    // Left panel: entity list
    draw_entity_list(frame, main_area[0], app);

    // Right panel: detail
    draw_detail(frame, main_area[1], app);

    // Bottom: torus strip
    draw_torus_strip(frame, outer[1]);

    // Footer: key hints
    draw_footer(frame, outer[2]);
}

fn draw_entity_list(frame: &mut Frame, area: Rect, app: &App) {
    let items: Vec<ListItem> = app.entries.iter().enumerate().map(|(i, (name, ptr))| {
        let snap = ffi::read_coord(*ptr);
        let inv = snap.as_ref().map(|s| if s.inversion_state != 0 { "'" } else { " " }).unwrap_or(" ");
        let weave = snap.as_ref().map(|s| format!("{:.1}", s.weave_state)).unwrap_or_default();
        let line = format!(" {} {:>5}  {}", inv, weave, name);
        let style = if i == app.selected {
            Style::default().fg(Color::Black).bg(Color::Cyan)
        } else if name.starts_with("CF") {
            Style::default().fg(Color::Yellow)
        } else if name.starts_with("Weave") {
            Style::default().fg(Color::Magenta)
        } else if name.starts_with("#") {
            Style::default().fg(Color::Green)
        } else {
            Style::default()
        };
        ListItem::new(line).style(style)
    }).collect();

    let list = List::new(items)
        .block(Block::default()
            .title(" Psychoid Numbers & CF Roots ")
            .borders(Borders::ALL)
            .border_style(Style::default().fg(Color::Cyan)));
    frame.render_widget(list, area);
}

fn draw_detail(frame: &mut Frame, area: Rect, app: &App) {
    let snap = app.selected_snapshot();
    let name = app.entries.get(app.selected).map(|(n, _)| *n).unwrap_or("?");

    let text = if let Some(s) = snap {
        let family = s.family.name();
        let flags_desc = tagged::flags_description(s.flags);

        let lines = vec![
            Line::from(vec![
                Span::styled("ql_position:  ", Style::default().fg(Color::DarkGray)),
                Span::styled(format!("0x{:02X}", s.ql_position), Style::default().fg(Color::White).add_modifier(Modifier::BOLD)),
                Span::raw(format!(" ({})", crate::core::position_name(s.ql_position))),
            ]),
            Line::from(vec![
                Span::styled("family:       ", Style::default().fg(Color::DarkGray)),
                Span::raw(family),
            ]),
            Line::from(vec![
                Span::styled("inversion:    ", Style::default().fg(Color::DarkGray)),
                Span::styled(
                    if s.inversion_state == 0 { "normal" } else { "inverted (')" },
                    if s.inversion_state != 0 { Style::default().fg(Color::Red) } else { Style::default() }
                ),
            ]),
            Line::from(vec![
                Span::styled("flags:        ", Style::default().fg(Color::DarkGray)),
                Span::raw(format!("0x{:02X} [{}]", s.flags, flags_desc)),
            ]),
            Line::from(vec![
                Span::styled("weave_state:  ", Style::default().fg(Color::DarkGray)),
                Span::raw(format!("{:.2}", s.weave_state)),
            ]),
            Line::from(vec![
                Span::styled("invoke:       ", Style::default().fg(Color::DarkGray)),
                Span::raw(if s.has_invoke { "yes" } else { "none" }),
            ]),
            Line::from(""),
            Line::from(Span::styled("── Base Pointers ──", Style::default().fg(Color::Cyan))),
            ptr_line(".p  ", &s.p),
            ptr_line(".s  ", &s.s),
            ptr_line(".t  ", &s.t),
            ptr_line(".m  ", &s.m),
            ptr_line(".l  ", &s.l),
            ptr_line(".c  ", &s.c),
            Line::from(""),
            Line::from(Span::styled("── Reflective ──", Style::default().fg(Color::Yellow))),
            ptr_line(".cpf", &s.cpf),
            ptr_line(".ct ", &s.ct),
            ptr_line(".cp ", &s.cp),
            ptr_line(".cf ", &s.cf),
            ptr_line(".cfp", &s.cfp),
            ptr_line(".cs ", &s.cs),
        ];

        lines
    } else {
        vec![Line::from("No data")]
    };

    let para = Paragraph::new(text)
        .block(Block::default()
            .title(format!(" {} ", name))
            .borders(Borders::ALL)
            .border_style(Style::default().fg(Color::Green)));
    frame.render_widget(para, area);
}

fn ptr_line<'a>(label: &'a str, info: &ffi::PtrInfo) -> Line<'a> {
    let display = info.display();
    let color = if info.is_null {
        Color::DarkGray
    } else if info.tags.nesting {
        Color::Cyan
    } else if info.tags.branching {
        Color::Yellow
    } else {
        Color::White
    };

    Line::from(vec![
        Span::styled(format!("  {}  ", label), Style::default().fg(Color::DarkGray)),
        Span::styled(display, Style::default().fg(color)),
    ])
}

fn draw_torus_strip(frame: &mut Frame, area: Rect) {
    let text = vec![
        Line::from(vec![
            Span::styled(" #0", Style::default().fg(Color::Green)),
            Span::raw(" → "),
            Span::styled("#1", Style::default().fg(Color::White)),
            Span::raw(" → "),
            Span::styled("#2", Style::default().fg(Color::White)),
            Span::raw(" → "),
            Span::styled("#3", Style::default().fg(Color::White)),
            Span::raw(" → "),
            Span::styled("#4", Style::default().fg(Color::Cyan)),
            Span::styled(" ⊸ cf", Style::default().fg(Color::Cyan)),
            Span::raw(" → "),
            Span::styled("#5", Style::default().fg(Color::Magenta)),
            Span::raw(" → "),
            Span::styled("#0", Style::default().fg(Color::Green)),
            Span::styled(" (Möbius) ↻", Style::default().fg(Color::Green)),
        ]),
        Line::from(""),
        Line::from(Span::styled(
            " Operators:  # inversion  . nesting  - branching  () invocation  ' phase  / path",
            Style::default().fg(Color::DarkGray),
        )),
    ];

    let para = Paragraph::new(text)
        .block(Block::default()
            .title(" Torus Cycle ")
            .borders(Borders::ALL)
            .border_style(Style::default().fg(Color::Magenta)));
    frame.render_widget(para, area);
}

fn draw_footer(frame: &mut Frame, area: Rect) {
    let text = Line::from(vec![
        Span::styled(" [↑↓]", Style::default().fg(Color::Cyan).add_modifier(Modifier::BOLD)),
        Span::raw(" navigate  "),
        Span::styled("[q]", Style::default().fg(Color::Cyan).add_modifier(Modifier::BOLD)),
        Span::raw(" quit  "),
    ]);

    let para = Paragraph::new(text)
        .block(Block::default().borders(Borders::ALL).border_style(Style::default().fg(Color::DarkGray)));
    frame.render_widget(para, area);
}

// ─── Interactive Torus Walk TUI ───

struct WalkApp<'a> {
    epi: &'a EpiLib,
    ctx: ffi::WalkContext,
    history: Vec<(u8, u8)>, // (position, covering) at each step
    should_quit: bool,
}

impl<'a> WalkApp<'a> {
    fn new(epi: &'a EpiLib) -> Self {
        Self {
            epi,
            ctx: ffi::WalkContext::default(),
            history: vec![(0, 0)], // start at #0, normal covering
            should_quit: false,
        }
    }

    fn step(&mut self) {
        self.epi.torus_walk(self.epi.psychoid_0, &mut self.ctx, 1);
        self.history.push((self.ctx.current_position, self.ctx.covering));
    }

    fn reset(&mut self) {
        self.ctx = ffi::WalkContext::default();
        self.history = vec![(0, 0)];
    }

    fn double_cover(&mut self) {
        self.epi.double_covering(self.epi.psychoid_0, &mut self.ctx);
        self.history.push((self.ctx.current_position, self.ctx.covering));
    }
}

pub fn run_walk(epi: &EpiLib) -> color_eyre::Result<()> {
    enable_raw_mode()?;
    stdout().execute(EnterAlternateScreen)?;
    let mut terminal = Terminal::new(CrosstermBackend::new(stdout()))?;

    let mut app = WalkApp::new(epi);

    while !app.should_quit {
        terminal.draw(|frame| draw_walk(frame, &app))?;

        if event::poll(std::time::Duration::from_millis(50))? {
            if let Event::Key(key) = event::read()? {
                if key.kind == KeyEventKind::Press {
                    match key.code {
                        KeyCode::Char('q') | KeyCode::Esc => app.should_quit = true,
                        KeyCode::Char(' ') => app.step(),
                        KeyCode::Char('r') => app.reset(),
                        KeyCode::Char('c') => app.double_cover(),
                        _ => {}
                    }
                }
            }
        }
    }

    disable_raw_mode()?;
    stdout().execute(LeaveAlternateScreen)?;
    Ok(())
}

fn draw_walk(frame: &mut Frame, app: &WalkApp) {
    let outer = Layout::default()
        .direction(Direction::Vertical)
        .constraints([
            Constraint::Length(5),
            Constraint::Min(8),
            Constraint::Length(3),
        ])
        .split(frame.area());

    // Top: animated torus cycle with position highlight
    draw_walk_torus(frame, outer[0], app);

    // Middle: walk state + history
    let mid = Layout::default()
        .direction(Direction::Horizontal)
        .constraints([
            Constraint::Percentage(40),
            Constraint::Percentage(60),
        ])
        .split(outer[1]);

    draw_walk_state(frame, mid[0], app);
    draw_walk_history(frame, mid[1], app);

    // Footer
    let text = Line::from(vec![
        Span::styled(" [space]", Style::default().fg(Color::Cyan).add_modifier(Modifier::BOLD)),
        Span::raw(" step  "),
        Span::styled("[c]", Style::default().fg(Color::Yellow).add_modifier(Modifier::BOLD)),
        Span::raw(" double-cover  "),
        Span::styled("[r]", Style::default().fg(Color::Red).add_modifier(Modifier::BOLD)),
        Span::raw(" reset  "),
        Span::styled("[q]", Style::default().fg(Color::DarkGray).add_modifier(Modifier::BOLD)),
        Span::raw(" quit"),
    ]);
    let footer = Paragraph::new(text)
        .block(Block::default().borders(Borders::ALL).border_style(Style::default().fg(Color::DarkGray)));
    frame.render_widget(footer, outer[2]);
}

fn draw_walk_torus(frame: &mut Frame, area: Rect, app: &WalkApp) {
    let pos = app.ctx.current_position;
    let inv = app.ctx.covering != 0;

    let positions: Vec<(u8, &str)> = vec![
        (0, "#0"), (1, "#1"), (2, "#2"), (3, "#3"), (4, "#4"), (5, "#5"),
    ];

    let mut spans: Vec<Span> = vec![Span::raw("  ")];
    for (i, (p, label)) in positions.iter().enumerate() {
        let active = pos == *p;
        let style = if active && inv {
            Style::default().fg(Color::Black).bg(Color::Red).add_modifier(Modifier::BOLD)
        } else if active {
            Style::default().fg(Color::Black).bg(Color::Green).add_modifier(Modifier::BOLD)
        } else if *p == 4 {
            Style::default().fg(Color::Cyan)
        } else {
            Style::default().fg(Color::White)
        };
        spans.push(Span::styled(format!(" {} ", label), style));
        if i < 5 {
            let arrow = if *p == 4 { " ⊸ " } else { " → " };
            spans.push(Span::styled(arrow, Style::default().fg(Color::DarkGray)));
        }
    }
    spans.push(Span::styled(" → ", Style::default().fg(Color::DarkGray)));
    spans.push(Span::styled("#0", Style::default().fg(Color::Green)));
    spans.push(Span::styled(" ↻", Style::default().fg(Color::Green)));

    let covering_label = if inv { "INVERTED (')" } else { "NORMAL" };
    let covering_style = if inv {
        Style::default().fg(Color::Red).add_modifier(Modifier::BOLD)
    } else {
        Style::default().fg(Color::Green)
    };

    let text = vec![
        Line::from(spans),
        Line::from(""),
        Line::from(vec![
            Span::styled("  Covering: ", Style::default().fg(Color::DarkGray)),
            Span::styled(covering_label, covering_style),
        ]),
    ];

    let para = Paragraph::new(text)
        .block(Block::default()
            .title(" Torus Walk — Interactive ")
            .borders(Borders::ALL)
            .border_style(Style::default().fg(Color::Magenta)));
    frame.render_widget(para, area);
}

fn draw_walk_state(frame: &mut Frame, area: Rect, app: &WalkApp) {
    let pos_name = crate::core::position_name(app.ctx.current_position);
    let text = vec![
        Line::from(vec![
            Span::styled("  Position:  ", Style::default().fg(Color::DarkGray)),
            Span::styled(format!("#{} ({})", app.ctx.current_position, pos_name),
                Style::default().fg(Color::White).add_modifier(Modifier::BOLD)),
        ]),
        Line::from(vec![
            Span::styled("  Steps:     ", Style::default().fg(Color::DarkGray)),
            Span::raw(format!("{}", app.ctx.step_count)),
        ]),
        Line::from(vec![
            Span::styled("  Cycles:    ", Style::default().fg(Color::DarkGray)),
            Span::raw(format!("{}", app.ctx.cycle_count)),
        ]),
        Line::from(vec![
            Span::styled("  Covering:  ", Style::default().fg(Color::DarkGray)),
            Span::raw(if app.ctx.covering == 0 { "Normal" } else { "Inverted" }),
        ]),
    ];
    let para = Paragraph::new(text)
        .block(Block::default()
            .title(" State ")
            .borders(Borders::ALL)
            .border_style(Style::default().fg(Color::Green)));
    frame.render_widget(para, area);
}

fn draw_walk_history(frame: &mut Frame, area: Rect, app: &WalkApp) {
    // Show last N history entries that fit
    let max_lines = area.height.saturating_sub(2) as usize;
    let start = if app.history.len() > max_lines {
        app.history.len() - max_lines
    } else {
        0
    };

    let lines: Vec<Line> = app.history[start..].iter().enumerate().map(|(i, (pos, cov))| {
        let step_num = start + i;
        let inv_marker = if *cov != 0 { "'" } else { " " };
        let color = match pos {
            0 => Color::Green,
            4 => Color::Cyan,
            5 => Color::Magenta,
            _ => Color::White,
        };
        Line::from(vec![
            Span::styled(format!("  {:>3}  ", step_num), Style::default().fg(Color::DarkGray)),
            Span::styled(format!("#{}{}", pos, inv_marker), Style::default().fg(color)),
            Span::styled(
                format!("  {}", crate::core::position_name(*pos)),
                Style::default().fg(Color::DarkGray),
            ),
        ])
    }).collect();

    let para = Paragraph::new(lines)
        .block(Block::default()
            .title(" Walk History ")
            .borders(Borders::ALL)
            .border_style(Style::default().fg(Color::Yellow)));
    frame.render_widget(para, area);
}

// ─── Family Explorer TUI ───

struct FamilyApp<'a> {
    epi: &'a EpiLib,
    arena: ffi::CoordinateArena,
    family_coords: Vec<(String, ffi::CoordSnapshot)>,
    selected: usize,
    should_quit: bool,
}

impl<'a> FamilyApp<'a> {
    fn new(epi: &'a EpiLib) -> Self {
        let mut arena = ffi::CoordinateArena {
            slots: std::ptr::null_mut(),
            capacity: 0,
            count: 0,
        };
        epi.arena_init(&mut arena, 64);

        let mut mirrors: [*mut ffi::HolographicCoordinate; 6] = [std::ptr::null_mut(); 6];
        epi.families_init(&mut arena, &mut mirrors);
        epi.families_crosslink(&mut arena);
        epi.families_wire_reflective(&mut arena);

        // Read all allocated coordinates
        let families = ["P", "S", "T", "M", "L", "C"];
        let positions = ["0", "1", "2", "3", "4", "5"];
        let mut family_coords = Vec::new();

        for slot_idx in 0..arena.count {
            let ptr = unsafe { arena.slots.add(slot_idx as usize) };
            if let Some(snap) = ffi::read_coord(ptr) {
                let fam_idx = snap.family as u8;
                let fam_letter = if (fam_idx as usize) >= 1 && (fam_idx as usize) <= 6 {
                    families[fam_idx as usize - 1]
                } else {
                    "?"
                };
                let pos_label = if (snap.ql_position as usize) < 6 {
                    positions[snap.ql_position as usize]
                } else {
                    "?"
                };
                let name = format!("{}{}", fam_letter, pos_label);
                family_coords.push((name, snap));
            }
        }

        Self {
            epi,
            arena,
            family_coords,
            selected: 0,
            should_quit: false,
        }
    }
}

impl<'a> Drop for FamilyApp<'a> {
    fn drop(&mut self) {
        self.epi.arena_destroy(&mut self.arena);
    }
}

pub fn run_families(epi: &EpiLib) -> color_eyre::Result<()> {
    enable_raw_mode()?;
    stdout().execute(EnterAlternateScreen)?;
    let mut terminal = Terminal::new(CrosstermBackend::new(stdout()))?;

    let mut app = FamilyApp::new(epi);

    while !app.should_quit {
        terminal.draw(|frame| draw_families(frame, &app))?;

        if event::poll(std::time::Duration::from_millis(50))? {
            if let Event::Key(key) = event::read()? {
                if key.kind == KeyEventKind::Press {
                    match key.code {
                        KeyCode::Char('q') | KeyCode::Esc => app.should_quit = true,
                        KeyCode::Up | KeyCode::Char('k') => {
                            if app.selected > 0 { app.selected -= 1; }
                        }
                        KeyCode::Down | KeyCode::Char('j') => {
                            if app.selected + 1 < app.family_coords.len() {
                                app.selected += 1;
                            }
                        }
                        _ => {}
                    }
                }
            }
        }
    }

    disable_raw_mode()?;
    stdout().execute(LeaveAlternateScreen)?;
    Ok(())
}

fn draw_families(frame: &mut Frame, app: &FamilyApp) {
    let outer = Layout::default()
        .direction(Direction::Horizontal)
        .constraints([
            Constraint::Percentage(30),
            Constraint::Percentage(70),
        ])
        .split(frame.area());

    // Left: family coordinate list (6×6 = 36 coords)
    let items: Vec<ListItem> = app.family_coords.iter().enumerate().map(|(i, (name, snap))| {
        let inv = if snap.inversion_state != 0 { "'" } else { " " };
        let line = format!(" {}{}  pos={}", name, inv, snap.ql_position);
        let style = if i == app.selected {
            Style::default().fg(Color::Black).bg(Color::Cyan)
        } else {
            let family_color = match snap.family {
                ffi::CoordinateFamily::P => Color::Green,
                ffi::CoordinateFamily::S => Color::Blue,
                ffi::CoordinateFamily::T => Color::Yellow,
                ffi::CoordinateFamily::M => Color::Red,
                ffi::CoordinateFamily::L => Color::Magenta,
                ffi::CoordinateFamily::C => Color::Cyan,
                _ => Color::White,
            };
            Style::default().fg(family_color)
        };
        ListItem::new(line).style(style)
    }).collect();

    let list = List::new(items)
        .block(Block::default()
            .title(" 36 Family Coordinates ")
            .borders(Borders::ALL)
            .border_style(Style::default().fg(Color::Cyan)));
    frame.render_widget(list, outer[0]);

    // Right: detail for selected
    if let Some((name, snap)) = app.family_coords.get(app.selected) {
        let flags_desc = tagged::flags_description(snap.flags);
        let lines = vec![
            Line::from(vec![
                Span::styled("name:         ", Style::default().fg(Color::DarkGray)),
                Span::styled(name.clone(), Style::default().fg(Color::White).add_modifier(Modifier::BOLD)),
            ]),
            Line::from(vec![
                Span::styled("family:       ", Style::default().fg(Color::DarkGray)),
                Span::raw(snap.family.name()),
            ]),
            Line::from(vec![
                Span::styled("ql_position:  ", Style::default().fg(Color::DarkGray)),
                Span::raw(format!("0x{:02X} ({})", snap.ql_position, crate::core::position_name(snap.ql_position))),
            ]),
            Line::from(vec![
                Span::styled("flags:        ", Style::default().fg(Color::DarkGray)),
                Span::raw(format!("0x{:02X} [{}]", snap.flags, flags_desc)),
            ]),
            Line::from(vec![
                Span::styled("weave_state:  ", Style::default().fg(Color::DarkGray)),
                Span::raw(format!("{:.2}", snap.weave_state)),
            ]),
            Line::from(vec![
                Span::styled("inversion:    ", Style::default().fg(Color::DarkGray)),
                Span::styled(
                    if snap.inversion_state == 0 { "normal" } else { "inverted (')" },
                    if snap.inversion_state != 0 { Style::default().fg(Color::Red) } else { Style::default() }
                ),
            ]),
            Line::from(""),
            Line::from(Span::styled("── Base Pointers ──", Style::default().fg(Color::Cyan))),
            ptr_line(".p  ", &snap.p),
            ptr_line(".s  ", &snap.s),
            ptr_line(".t  ", &snap.t),
            ptr_line(".m  ", &snap.m),
            ptr_line(".l  ", &snap.l),
            ptr_line(".c  ", &snap.c),
            Line::from(""),
            Line::from(Span::styled("── Reflective ──", Style::default().fg(Color::Yellow))),
            ptr_line(".cpf", &snap.cpf),
            ptr_line(".ct ", &snap.ct),
            ptr_line(".cp ", &snap.cp),
            ptr_line(".cf ", &snap.cf),
            ptr_line(".cfp", &snap.cfp),
            ptr_line(".cs ", &snap.cs),
        ];

        let para = Paragraph::new(lines)
            .block(Block::default()
                .title(format!(" {} — Detail ", name))
                .borders(Borders::ALL)
                .border_style(Style::default().fg(Color::Green)));
        frame.render_widget(para, outer[1]);
    }
}

