use crate::techne::gnosis::{config::GnosisConfig, ingest, query, query::QueryOptions};
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
    /// Ingest a book file into gnosis
    Ingest { source: String },
    /// Ask a question across ingested books
    Ask {
        question: String,
        #[arg(long)]
        book: Option<String>,
    },
    /// List ingested books
    List,
    /// Show local book ingestion status
    Status,
}

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
    match cmd {
        BookCmd::Open { file } => open_default(file.clone()),
        BookCmd::Zen { file } => run_bookokrat(["--zen-mode", file]),
        BookCmd::Ingest { source } => {
            match ingest::ingest_path(&GnosisConfig::from_env(), source, None, "Books") {
                Ok(record) => println!(
                    "stored {} chunks for {} in Books",
                    record.chunks.len(),
                    record.title
                ),
                Err(err) => {
                    eprintln!("epi book ingest: {err}");
                    std::process::exit(1);
                }
            }
        }
        BookCmd::Ask { question, book } => match query::query_local(
            &GnosisConfig::from_env(),
            question,
            QueryOptions {
                notebook: None,
                source_type: Some("Books"),
                title: book.as_deref(),
                top_k: 3,
            },
        ) {
            Ok(matches) => {
                if matches.is_empty() {
                    println!("no matches");
                } else {
                    for (document, score, text, heading) in matches {
                        println!(
                            "- [{}] {} score={} {}",
                            document.title,
                            heading.unwrap_or_else(|| "No heading".to_string()),
                            score,
                            text
                        );
                    }
                }
            }
            Err(err) => {
                eprintln!("epi book ask: {err}");
                std::process::exit(1);
            }
        },
        BookCmd::List => match ingest::list_documents(&GnosisConfig::from_env()) {
            Ok(records) => {
                for record in records
                    .into_iter()
                    .filter(|record| record.source_type == "Books")
                {
                    println!("- {}", record.title);
                }
            }
            Err(err) => {
                eprintln!("epi book list: {err}");
                std::process::exit(1);
            }
        },
        BookCmd::Status => match ingest::list_documents(&GnosisConfig::from_env()) {
            Ok(records) => {
                let books = records
                    .into_iter()
                    .filter(|record| record.source_type == "Books")
                    .count();
                println!("books: {books}");
            }
            Err(err) => {
                eprintln!("epi book status: {err}");
                std::process::exit(1);
            }
        },
    }
}

fn run_bookokrat(args: [&str; 2]) {
    let status = Command::new(BOOKOKRAT)
        .current_dir(BOOKS_DIR)
        .args(args)
        .status();

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
