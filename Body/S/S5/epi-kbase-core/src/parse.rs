/// Extract a file-path candidate from a bkmr search result line.
pub fn extract_path_candidate(line: &str) -> Option<String> {
    line.split_whitespace()
        .map(|token| token.trim_matches(|c| matches!(c, '"' | '\'' | ',' | ';' | '(' | ')')))
        .find(|token| {
            token.starts_with('/')
                || token.ends_with(".md")
                || token.ends_with(".markdown")
                || token.ends_with(".txt")
        })
        .map(str::to_string)
}
