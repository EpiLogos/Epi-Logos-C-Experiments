use crate::agent::AgentLayout;
use crossterm::event::{self, Event, KeyCode, KeyEventKind, KeyModifiers};
use ratatui::{prelude::*, widgets::*};
use std::io::{BufRead, BufReader, Write};
use std::process::{Command, Stdio};
use std::sync::{Arc, Mutex};
use std::thread;

pub fn run(agent: Option<&str>, initial_prompt: Option<&str>) -> color_eyre::Result<()> {
    let layout = AgentLayout::resolve(agent).map_err(|e| color_eyre::eyre::eyre!(e))?;

    // Check if pi is available
    let pi_check = Command::new("pi").arg("--version").output();
    if pi_check.is_err() {
        return Err(color_eyre::eyre::eyre!(
            "pi is not installed. Install with: npm install -g @mariozechner/pi-coding-agent\n\
             Or use 'epi agent install' to set up the agent environment."
        ));
    }

    let mut child = Command::new("pi")
        .args([
            "--extension",
            &layout.composite_entry_path.display().to_string(),
        ])
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .env("PI_CODING_AGENT_DIR", &layout.agent_dir)
        .env("EPI_AGENT_DIR", &layout.agent_dir)
        .spawn()?;

    let stdout = child.stdout.take().unwrap();
    let mut stdin = child.stdin.take().unwrap();

    // Shared message buffer: (text, is_user_message)
    let messages: Arc<Mutex<Vec<(String, bool)>>> = Arc::new(Mutex::new(Vec::new()));
    let msgs_clone = messages.clone();

    // Reader thread for agent stdout
    thread::spawn(move || {
        let reader = BufReader::new(stdout);
        for line in reader.lines() {
            if let Ok(line) = line {
                msgs_clone.lock().unwrap().push((line, false));
            }
        }
    });

    // Send initial prompt if provided
    if let Some(prompt) = initial_prompt {
        writeln!(stdin, "{}", prompt)?;
        messages
            .lock()
            .unwrap()
            .push((format!("> {}", prompt), true));
    }

    // TUI event loop
    crossterm::terminal::enable_raw_mode()?;
    let mut terminal =
        ratatui::Terminal::new(ratatui::backend::CrosstermBackend::new(std::io::stderr()))?;
    crossterm::execute!(std::io::stderr(), crossterm::terminal::EnterAlternateScreen)?;

    let mut input = String::new();
    let mut scroll: u16 = 0;
    let agent_id = layout.agent_id.clone();

    loop {
        terminal.draw(|f| {
            let chunks = Layout::default()
                .direction(Direction::Vertical)
                .constraints([
                    Constraint::Length(1),
                    Constraint::Min(5),
                    Constraint::Length(3),
                ])
                .split(f.area());

            // Header
            let header = Paragraph::new(format!(" epi agent chat — {} ", agent_id))
                .style(Style::default().bg(Color::DarkGray).fg(Color::White));
            f.render_widget(header, chunks[0]);

            // Messages
            let msgs = messages.lock().unwrap();
            let text: Vec<Line> = msgs
                .iter()
                .map(|(msg, is_user)| {
                    if *is_user {
                        Line::from(Span::styled(msg, Style::default().fg(Color::Green)))
                    } else {
                        Line::from(Span::styled(msg, Style::default().fg(Color::White)))
                    }
                })
                .collect();
            let para = Paragraph::new(text)
                .block(Block::default().borders(Borders::ALL).title("Conversation"))
                .scroll((scroll, 0))
                .wrap(Wrap { trim: false });
            f.render_widget(para, chunks[1]);

            // Input
            let input_widget = Paragraph::new(input.as_str()).block(
                Block::default()
                    .borders(Borders::ALL)
                    .title("Input (Enter to send, Esc to quit)"),
            );
            f.render_widget(input_widget, chunks[2]);
        })?;

        if event::poll(std::time::Duration::from_millis(50))? {
            if let Event::Key(key) = event::read()? {
                if key.kind == KeyEventKind::Press {
                    match key.code {
                        KeyCode::Esc => break,
                        KeyCode::Char('c') if key.modifiers.contains(KeyModifiers::CONTROL) => {
                            break
                        }
                        KeyCode::Enter => {
                            if !input.is_empty() {
                                let msg = input.clone();
                                messages.lock().unwrap().push((format!("> {}", msg), true));
                                let _ = writeln!(stdin, "{}", msg);
                                input.clear();
                            }
                        }
                        KeyCode::Backspace => {
                            input.pop();
                        }
                        KeyCode::Char(c) => input.push(c),
                        KeyCode::PageUp => scroll = scroll.saturating_sub(5),
                        KeyCode::PageDown => scroll = scroll.saturating_add(5),
                        _ => {}
                    }
                }
            }
        }
    }

    // Cleanup
    crossterm::execute!(std::io::stderr(), crossterm::terminal::LeaveAlternateScreen)?;
    crossterm::terminal::disable_raw_mode()?;
    let _ = child.kill();

    Ok(())
}
