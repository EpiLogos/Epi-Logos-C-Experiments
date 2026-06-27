use std::fs;
use std::path::{Path, PathBuf};

use crate::artifact_evidence::collect_artifact_evidence;

#[derive(Clone, Debug, Eq, PartialEq)]
pub enum WikilinkTarget {
    Path(String),
    Heading(String),
    PathHeading {
        path: String,
        heading: String,
    },
    PathBlock {
        path: String,
        block_id: String,
    },
    PathHeadingBlock {
        path: String,
        heading: String,
        block_id: String,
    },
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

    if let Some((path, heading_anchor)) = raw_target.split_once('#') {
        let path = path.trim();
        let (heading, block) = match heading_anchor.split_once('^') {
            Some((heading, block)) => (heading.trim(), non_empty(block.trim())),
            None => (heading_anchor.trim(), None),
        };

        if !path.is_empty() && !heading.is_empty() {
            if let Some(block) = block {
                return WikilinkTarget::PathHeadingBlock {
                    path: path.to_owned(),
                    heading: heading.to_owned(),
                    block_id: block.to_owned(),
                };
            }

            return WikilinkTarget::PathHeading {
                path: path.to_owned(),
                heading: heading.to_owned(),
            };
        }
    }

    if let Some((path, block)) = raw_target.split_once('^') {
        let path = path.trim();
        let block = block.trim();
        if !path.is_empty() && !block.is_empty() {
            return WikilinkTarget::PathBlock {
                path: path.to_owned(),
                block_id: block.to_owned(),
            };
        }
    }

    WikilinkTarget::Path(raw_target.to_owned())
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
    pub detail: String,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub enum RenameRefusalReason {
    /// The rewritten body could not be written back to disk.
    WriteFailed(String),
    /// The destination path implies a coordinate residency that disagrees with
    /// the moved file's `coordinate:` frontmatter.
    CoordinateResidencyMismatch {
        expected_coordinate: String,
        actual_coordinate: String,
    },
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
                detail: format!("failed to write rewritten wikilinks: {err}"),
                reason: RenameRefusalReason::WriteFailed(err.to_string()),
            }),
        }
    }

    (reconciled, refusals)
}

/// Return a typed refusal when `rel_path` implies a coordinate residency and
/// the markdown's `coordinate:` frontmatter disagrees with that residency.
///
/// This is intentionally refusal-only: Hen does not silently repair
/// coordinates on move. Auto-update belongs behind a future explicit
/// capability, not the default vault mutation path.
pub fn coordinate_residency_refusal(rel_path: &str, markdown: &str) -> Option<RenameRefusal> {
    let expected_coordinate = coordinate_for_residency(rel_path)?;
    let evidence = collect_artifact_evidence(rel_path, markdown).ok()?;
    let actual_coordinate = evidence.coordinate?;
    if actual_coordinate == expected_coordinate {
        return None;
    }

    Some(RenameRefusal {
        relative_path: rel_path.replace('\\', "/").trim_start_matches('/').to_owned(),
        detail: format!(
            "coordinate `{actual_coordinate}` does not match destination residency `{expected_coordinate}`"
        ),
        reason: RenameRefusalReason::CoordinateResidencyMismatch {
            expected_coordinate,
            actual_coordinate,
        },
    })
}

/// Infer the coordinate implied by a vault-relative residency path.
///
/// The mapping is deliberately conservative: it returns `None` when a path
/// does not carry a stable coordinate implication, so ordinary files are not
/// accidentally refused.
pub fn coordinate_for_residency(rel_path: &str) -> Option<String> {
    let normalised = rel_path.replace('\\', "/");
    let trimmed = normalised.trim_start_matches('/');
    let segments: Vec<&str> = trimmed
        .split('/')
        .filter(|segment| !segment.is_empty())
        .collect();

    coordinate_from_seed_path(&segments)
        .or_else(|| coordinate_from_world_types_path(&segments))
        .or_else(|| coordinate_from_thought_path(&segments))
}

fn coordinate_from_seed_path(segments: &[&str]) -> Option<String> {
    let seeds = segments
        .windows(3)
        .position(|window| window == ["Idea", "Bimba", "Seeds"])
        .map(|idx| idx + 3)
        .or_else(|| {
            segments
                .iter()
                .position(|segment| *segment == "Seeds")
                .map(|idx| idx + 1)
        })?;
    let family = *segments.get(seeds)?;
    let layer = *segments.get(seeds + 1)?;
    let filename = *segments.last()?;
    let stem = filename.strip_suffix(".md").unwrap_or(filename);

    if stem == format!("{layer}-SPEC") || stem == format!("{layer}-ARCHITECTURE") {
        return Some(layer.to_owned());
    }

    if !layer.starts_with(family) {
        return None;
    }
    coordinate_from_shard_stem(stem)
}

fn coordinate_from_shard_stem(stem: &str) -> Option<String> {
    let (head, rest) = stem.split_once('-')?;
    let position = rest
        .strip_suffix("-SPEC")
        .or_else(|| rest.strip_suffix("-ARCHITECTURE"))
        .unwrap_or(rest);
    if head.is_empty() || position.is_empty() {
        return None;
    }
    let base_position = position.strip_suffix('\'').unwrap_or(position);
    if !base_position.parse::<u8>().is_ok_and(|n| n <= 5) {
        return None;
    }
    Some(format!("{head}.{position}"))
}

fn coordinate_from_world_types_path(segments: &[&str]) -> Option<String> {
    let coordinates = segments
        .windows(3)
        .position(|window| window == ["World", "Types", "Coordinates"])
        .map(|idx| idx + 3)
        .or_else(|| {
            segments
                .windows(2)
                .position(|window| window == ["Types", "Coordinates"])
                .map(|idx| idx + 2)
        })?;
    let family = *segments.get(coordinates)?;
    let stem = segments
        .last()?
        .strip_suffix(".md")
        .unwrap_or(segments.last()?);
    if stem.starts_with(family) && looks_like_coordinate(stem) {
        Some(stem.to_owned())
    } else {
        None
    }
}

fn coordinate_from_thought_path(segments: &[&str]) -> Option<String> {
    let thought_t = segments
        .windows(4)
        .position(|window| window == ["Pratibimba", "Self", "Thought", "T"])
        .map(|idx| idx + 4)
        .or_else(|| {
            segments
                .windows(2)
                .position(|window| window == ["Thought", "T"])
                .map(|idx| idx + 2)
        })?;
    let lane = *segments.get(thought_t)?;
    if matches!(lane, "T0" | "T1" | "T2" | "T3" | "T4" | "T5") {
        Some(lane.to_owned())
    } else {
        None
    }
}

fn looks_like_coordinate(value: &str) -> bool {
    let base = value.strip_suffix('\'').unwrap_or(value);
    let mut chars = base.chars();
    let Some(family) = chars.next() else {
        return false;
    };
    if !matches!(family, 'C' | 'P' | 'L' | 'S' | 'T' | 'M') {
        return false;
    }
    chars.any(|ch| ch.is_ascii_digit())
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
