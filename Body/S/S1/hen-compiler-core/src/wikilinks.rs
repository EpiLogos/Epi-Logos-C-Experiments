use std::fs;
use std::path::{Path, PathBuf};

#[derive(Clone, Debug, Eq, PartialEq)]
pub enum WikilinkTarget {
    Path(String),
    Heading(String),
    PathHeading { path: String, heading: String },
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Wikilink {
    pub raw: String,
    pub raw_target: String,
    pub target: WikilinkTarget,
    pub alias: Option<String>,
    pub line: usize,
    pub column: usize,
    pub context: String,
}

pub fn parse_wikilinks(markdown: &str) -> Vec<Wikilink> {
    let mut links = Vec::new();
    let mut fence = None;

    for (line_index, line) in markdown.lines().enumerate() {
        if update_fence_state(line, &mut fence) {
            continue;
        }

        if fence.is_some() {
            continue;
        }

        parse_line_wikilinks(line, line_index + 1, &mut links);
    }

    links
}

fn parse_line_wikilinks(line: &str, line_number: usize, links: &mut Vec<Wikilink>) {
    let mut search_from = 0;

    while let Some(relative_start) = line[search_from..].find("[[") {
        let start = search_from + relative_start;
        if is_escaped_link_start(line, start) {
            search_from = start + 2;
            continue;
        }
        let content_start = start + 2;
        let Some(relative_end) = line[content_start..].find("]]") else {
            break;
        };
        let end = content_start + relative_end;
        let raw_inner = &line[content_start..end];

        if !raw_inner.trim().is_empty() {
            if let Some(link) = parse_wikilink(raw_inner, line, line_number, start) {
                links.push(link);
            }
        }

        search_from = end + 2;
    }
}

fn is_escaped_link_start(line: &str, start: usize) -> bool {
    start > 0 && line.as_bytes().get(start - 1) == Some(&b'\\')
}

fn parse_wikilink(
    raw_inner: &str,
    line: &str,
    line_number: usize,
    start: usize,
) -> Option<Wikilink> {
    if raw_inner.contains('\n') {
        return None;
    }

    let (raw_target, alias) = match raw_inner.split_once('|') {
        Some((target, alias)) => (target.trim(), non_empty(alias.trim())),
        None => (raw_inner.trim(), None),
    };

    if raw_target.is_empty() {
        return None;
    }

    Some(Wikilink {
        raw: format!("[[{raw_inner}]]"),
        raw_target: raw_target.to_owned(),
        target: parse_target(raw_target),
        alias: alias.map(str::to_owned),
        line: line_number,
        column: start + 1,
        context: trim_context(line),
    })
}

fn parse_target(raw_target: &str) -> WikilinkTarget {
    if let Some(heading) = raw_target.strip_prefix('#') {
        return WikilinkTarget::Heading(heading.trim().to_owned());
    }

    match raw_target.split_once('#') {
        Some((path, heading)) if !heading.trim().is_empty() => WikilinkTarget::PathHeading {
            path: path.trim().to_owned(),
            heading: heading.trim().to_owned(),
        },
        _ => WikilinkTarget::Path(raw_target.to_owned()),
    }
}

fn non_empty(value: &str) -> Option<&str> {
    if value.is_empty() {
        None
    } else {
        Some(value)
    }
}

fn trim_context(line: &str) -> String {
    const MAX_CONTEXT_CHARS: usize = 240;
    let trimmed = line.trim();
    if trimmed.chars().count() <= MAX_CONTEXT_CHARS {
        return trimmed.to_owned();
    }

    trimmed.chars().take(MAX_CONTEXT_CHARS).collect()
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
struct FenceState {
    marker: char,
    len: usize,
}

fn update_fence_state(line: &str, fence: &mut Option<FenceState>) -> bool {
    let Some(candidate) = fence_marker(line) else {
        return false;
    };

    match fence {
        Some(open) if candidate.marker == open.marker && candidate.len >= open.len => {
            *fence = None;
            true
        }
        None => {
            *fence = Some(candidate);
            true
        }
        Some(_) => false,
    }
}

fn fence_marker(line: &str) -> Option<FenceState> {
    let trimmed = line.trim_start();
    let marker = trimmed.chars().next()?;
    if marker != '`' && marker != '~' {
        return None;
    }

    let len = trimmed.chars().take_while(|ch| *ch == marker).count();
    (len >= 3).then_some(FenceState { marker, len })
}

// ============================================================================
// Rename reconciliation — S1-ARCHITECTURE §5.3 (DR-S1, VALIDATED 2026-06-03)
//
// Hen owns wikilink *integrity* (it parses the link graph via `parse_wikilinks`).
// Per §5.3 the integrity authority IS the mutation authority: the literal-text
// rewrite that rewrites inbound `[[from_title]]` references on a file rename now
// lives here, not in `gate/s1_hen.rs`. The gateway becomes a thin dispatcher
// that maps these typed results onto its `S1VaultRenameReceipt` contract.
//
// This keeps the S1→S3 boundary clean: hen-compiler-core does NOT depend on
// `epi-s3-gateway-contract`, so the receipt/refusal shapes are declared locally
// and translated at the gateway seam. Load-bearing for DR-M1-4.
// ============================================================================

/// A document whose inbound wikilinks were rewritten during a rename.
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ReconciledDoc {
    /// Vault-relative path, forward-slash normalised.
    pub relative_path: String,
    /// Number of `[[from_title]]` occurrences rewritten in this document.
    pub link_count: usize,
}

/// A document that matched the rename but could not be reconciled.
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RenameRefusal {
    /// Vault-relative path, forward-slash normalised.
    pub relative_path: String,
    pub reason: RenameRefusalReason,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub enum RenameRefusalReason {
    /// The rewritten body could not be written back to disk.
    WriteFailed(String),
}

/// Derive a wikilink title from a vault-relative path: the file stem.
///
/// A `[[X]]` target may be a bare title (`Notes`), a relative path
/// (`folder/Notes`), or carry a `.md` extension — the title used for matching
/// is always the final stem.
pub fn wikilink_title_from_path(rel_path: &str) -> String {
    Path::new(rel_path)
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or(rel_path)
        .to_owned()
}

/// Reconcile a rename across the whole vault.
///
/// Walks every `.md` file under `vault_root` (skipping dot-directories such as
/// `.git`, `.obsidian`, `.smart-env`, and any path in `skip`), rewrites every
/// inbound `[[from_title]]` wikilink — including the `|alias`, `#heading`, and
/// `^block` anchor forms — to `[[to_title]]`, and writes changed files back.
///
/// Returns `(reconciled, refusals)`: the documents successfully rewritten with
/// their per-document rewrite counts, plus any documents that matched but failed
/// to write (the rename itself is not rolled back — refusals are advisory so the
/// caller can surface them on the receipt).
///
/// `skip` excludes paths already reconciled out-of-band (e.g. the rename
/// destination, whose own outlinks were rewritten on write); paths are matched
/// by equality against the absolute walked path.
pub fn reconcile_rename(
    vault_root: &Path,
    from_title: &str,
    to_title: &str,
    skip: &[PathBuf],
) -> (Vec<ReconciledDoc>, Vec<RenameRefusal>) {
    let mut reconciled: Vec<ReconciledDoc> = Vec::new();
    let mut refusals: Vec<RenameRefusal> = Vec::new();

    let mut markdown_files: Vec<PathBuf> = Vec::new();
    collect_markdown_files(vault_root, &mut markdown_files);

    for absolute in markdown_files {
        if skip.iter().any(|skipped| *skipped == absolute) {
            continue;
        }
        let rel_str = match absolute.strip_prefix(vault_root) {
            Ok(rel) => rel.to_string_lossy().replace('\\', "/"),
            Err(_) => continue,
        };
        let body = match fs::read_to_string(&absolute) {
            Ok(body) => body,
            Err(_) => continue,
        };
        let (rewritten, link_count) = rewrite_wikilink_titles(&body, from_title, to_title);
        if link_count == 0 {
            continue;
        }
        match fs::write(&absolute, rewritten) {
            Ok(()) => reconciled.push(ReconciledDoc {
                relative_path: rel_str,
                link_count,
            }),
            Err(err) => refusals.push(RenameRefusal {
                relative_path: rel_str,
                reason: RenameRefusalReason::WriteFailed(err.to_string()),
            }),
        }
    }

    (reconciled, refusals)
}

/// Rewrite every `[[from_title]]` occurrence to `[[to_title]]`, returning the
/// rewritten body and the number of occurrences rewritten.
///
/// Anchor and alias forms are preserved verbatim after the title:
/// `[[from_title|alias]]`, `[[from_title#heading]]`, and `[[from_title^block]]`
/// all rewrite the title part while keeping `|alias`, `#heading`, `^block`
/// intact. Only an exact title match (the portion before the first `#`, `^`, or
/// `|`) is rewritten — partial matches are left untouched. UTF-8 bodies are
/// handled char-safely (all slice boundaries fall on ASCII `[[`/`]]` markers).
pub fn rewrite_wikilink_titles(body: &str, from_title: &str, to_title: &str) -> (String, usize) {
    let mut out = String::with_capacity(body.len());
    let mut count = 0usize;
    let mut cursor = 0usize;

    while cursor < body.len() {
        let Some(rel_open) = body[cursor..].find("[[") else {
            out.push_str(&body[cursor..]);
            break;
        };
        let open = cursor + rel_open;
        out.push_str(&body[cursor..open]);

        let inner_start = open + 2;
        let Some(rel_close) = body[inner_start..].find("]]") else {
            // Unterminated `[[` — copy the remainder verbatim.
            out.push_str(&body[open..]);
            break;
        };
        let inner_end = inner_start + rel_close;
        let inner = &body[inner_start..inner_end];

        let (title_part, rest) = match inner.find(['#', '^', '|']) {
            Some(idx) => (&inner[..idx], &inner[idx..]),
            None => (inner, ""),
        };
        if title_part == from_title {
            out.push_str("[[");
            out.push_str(to_title);
            out.push_str(rest);
            out.push_str("]]");
            count += 1;
        } else {
            out.push_str("[[");
            out.push_str(inner);
            out.push_str("]]");
        }
        cursor = inner_end + 2;
    }

    (out, count)
}

/// Recursively collect `.md` files under `dir`, skipping dot-directories
/// (`.git`, `.obsidian`, `.smart-env`, …) which are not vault content.
fn collect_markdown_files(dir: &Path, out: &mut Vec<PathBuf>) {
    let entries = match fs::read_dir(dir) {
        Ok(entries) => entries,
        Err(_) => return,
    };
    for entry in entries.flatten() {
        let path = entry.path();
        if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
            if name.starts_with('.') {
                continue;
            }
        }
        if path.is_dir() {
            collect_markdown_files(&path, out);
        } else if path.extension().and_then(|e| e.to_str()) == Some("md") {
            out.push(path);
        }
    }
}
