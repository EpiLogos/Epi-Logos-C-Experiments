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
