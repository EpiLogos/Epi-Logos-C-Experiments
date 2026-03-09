use clap::Subcommand;
use std::process::Command;

const BOOKOKRAT: &str = "/opt/homebrew/bin/bookokrat";
const BOOKS_DIR: &str = concat!(env!("HOME"), "/Documents/books");

#[derive(Subcommand)]
pub enum BookCmd {
    /// Launch bookokrat TUI in the books directory
    Open {
        /// Specific .epub file to open (optional — opens TUI browser if omitted)
        file: Option<String>,
    },
    /// Launch in zen reading mode
    Zen {
        /// .epub file
        file: String,
    },
}

/// Default open behavior when no subcommand provided
pub fn open_default(file: Option<String>) {
    let status = {
        let mut c = Command::new(BOOKOKRAT);
        c.current_dir(BOOKS_DIR);
        if let Some(f) = file {
            c.arg(f);
        }
        c.status()
    };

    match status {
        Ok(s) if !s.success() => std::process::exit(s.code().unwrap_or(1)),
        Err(e) => {
            eprintln!("epi book: failed to run bookokrat: {}", e);
            eprintln!("  expected: {}", BOOKOKRAT);
            eprintln!("  books dir: {}", BOOKS_DIR);
            std::process::exit(1);
        }
        _ => {}
    }
}

pub fn dispatch(cmd: &BookCmd) {
    let status = match cmd {
        BookCmd::Open { file } => {
            let mut c = Command::new(BOOKOKRAT);
            c.current_dir(BOOKS_DIR);
            if let Some(f) = file {
                c.arg(f);
            }
            c.status()
        }
        BookCmd::Zen { file } => Command::new(BOOKOKRAT)
            .current_dir(BOOKS_DIR)
            .args(["--zen-mode", file])
            .status(),
    };

    match status {
        Ok(s) if !s.success() => std::process::exit(s.code().unwrap_or(1)),
        Err(e) => {
            eprintln!("epi book: failed to run bookokrat: {}", e);
            eprintln!("  expected: {}", BOOKOKRAT);
            eprintln!("  books dir: {}", BOOKS_DIR);
            std::process::exit(1);
        }
        _ => {}
    }
}
