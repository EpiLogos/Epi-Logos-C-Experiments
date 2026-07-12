/**
 * Coordinate: M4-3 (Nara process — Daily Briefing voice law)
 * Residency: Body/S/S5/plugins/epi-logos/skills/nara-daily-briefing/voice-law.mjs
 * Position (#n): #5 — Integration; executable encoding of the briefing's Voice law
 * Actualises: the VOICE-LAW test named in the 05.18 design-recon Verify line
 *   (Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/
 *    05-m4-nara-reconciliation.md, tranche 5.18) — "no 'today is X phase'-style
 *   templated pattern without an adjacent symbol citation". The rule lives as
 *   prose in SKILL.md §"Voice law"; this module makes it a checkable predicate.
 * Public surface: parseSections, sectionBody, stripVoiceLawSection,
 *   extractVoiceLawSection, hasSymbolCitation, templatedClaimViolations,
 *   registerAdjacencyViolations, TEMPLATED_CLAIM_RE, REGISTER_WORDS,
 *   SYMBOL_CITATION_PATTERNS, EXPECTED_SECTION_TITLES.
 * Does NOT own: the briefing content itself (SKILL.md), the medicine/oracle
 *   substrate (medicine_frame.rs / oracle_engine.rs), inscription (Khora).
 */

/** The five structural sections in inscription order (SKILL.md §"The five sections"). */
export const EXPECTED_SECTION_TITLES = [
  "Klein state",
  "Cross-system bridge",
  "Somatic register",
  "Live spreads",
  "QL Walk",
];

/**
 * The forbidden templated construction: "today is X phase" / "today is a X day".
 * A bare, detached, computed assertion of a phase/day — the pattern the Voice
 * law exists to prohibit. Non-global so `.test()` carries no lastIndex state.
 */
export const TEMPLATED_CLAIM_RE =
  /\btoday is (?:a |an |the )?[A-Za-z][\w'’-]*\s+(?:phase|day)\b/i;

/**
 * Register vocabulary that "must sit beside the symbol that earned it"
 * (SKILL.md §"Voice law"). Any occurrence in composed briefing prose demands
 * an adjacent symbol citation.
 */
export const REGISTER_WORDS = [
  "nigredo", "solutio", "dissolutio", "sublimatio", "calcinatio",
  "coagulatio", "fixatio", "separatio", "conjunctio",
  "concrescent", "prehension", "ingression", "appetition", "Aufhebung",
];

/**
 * A symbol citation is what "earns" a register word or licenses a templated
 * claim: a [[wikilink]], a coordinate (M4-1, L2', P3, C5'), a q_/c_ register
 * key, a named planet, a named zodiac sign, a named element, or an explicit
 * decan/tarot/hexagram reference. Named symbols carry the meaning; the
 * register word is only the light it is read by.
 */
export const SYMBOL_CITATION_PATTERNS = [
  /\[\[[^\]]+\]\]/,                                              // wikilink
  /\b[PSTMLC][0-5](?:['’])?(?:-\d+)?\b/,                    // coordinate: P3, S4, M4-1, L2', C5'
  /\b[qc]_\d/,                                                   // register key q_ / c_
  /\b(?:Sun|Moon|Mercury|Venus|Mars|Jupiter|Saturn|Uranus|Neptune|Pluto|Chiron|Rahu|Ketu|Node)\b/,
  /\b(?:Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces)\b/,
  /\b(?:Fire|Water|Air|Earth|Salt|aether)\b/,                   // elements
  /\b(?:decan|tarot|pip|hexagram|trigram)\b/i,                  // named substrate correspondences
];

/** True when `text` contains at least one symbol citation. */
export function hasSymbolCitation(text) {
  return SYMBOL_CITATION_PATTERNS.some((re) => re.test(String(text ?? "")));
}

/** Parse the ordered `### Section N — <title> (...)` headers into {n, title}. */
export function parseSections(md) {
  const re = /^###\s+Section\s+(\d)\s+—\s+(.+?)\s*(?:\(|$)/gm;
  const out = [];
  for (const m of String(md).matchAll(re)) {
    out.push({ n: Number(m[1]), title: m[2].trim() });
  }
  return out;
}

/**
 * Return the body text of the `## <heading>` section (up to the next `## `
 * heading or EOF). Heading match is exact after the `## ` marker.
 */
export function sectionBody(md, heading) {
  const lines = String(md).split("\n");
  const start = lines.findIndex((l) => l.trim() === `## ${heading}`);
  if (start === -1) return null;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^##\s/.test(lines[i])) { end = i; break; }
  }
  return lines.slice(start + 1, end).join("\n");
}

/** Return only the `## Voice law` section text (the rule definition, not content). */
export function extractVoiceLawSection(md) {
  return sectionBody(md, "Voice law") ?? "";
}

/**
 * The inscribable band: the whole skill MINUS the `## Voice law` section.
 * The Voice-law section quotes the forbidden pattern as prohibition; every
 * OTHER part of the skill (templates, worked examples, section bodies) is
 * inscribable/demonstrative content and must never use the bare construction.
 */
export function stripVoiceLawSection(md) {
  const lines = String(md).split("\n");
  const start = lines.findIndex((l) => l.trim() === "## Voice law");
  if (start === -1) return String(md);
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^##\s/.test(lines[i])) { end = i; break; }
  }
  return [...lines.slice(0, start), ...lines.slice(end)].join("\n");
}

function prevNonEmpty(lines, i) {
  for (let j = i - 1; j >= 0; j--) if (lines[j].trim()) return lines[j];
  return "";
}
function nextNonEmpty(lines, i) {
  for (let j = i + 1; j < lines.length; j++) if (lines[j].trim()) return lines[j];
  return "";
}

/**
 * Find every line bearing the templated "today is X phase/day" claim that has
 * NO symbol citation to earn it. Each such line is a Voice-law violation.
 *
 * The skill's own law is strict: "no symbol citation in the same line, rewrite
 * it" — so `window: 0` (default) requires the citation ON the claim's line.
 * `window: 1` relaxes to "adjacent" — also accepting the nearest non-empty
 * neighbour line above/below.
 */
export function templatedClaimViolations(text, { window = 0 } = {}) {
  const lines = String(text).split("\n");
  const violations = [];
  for (let i = 0; i < lines.length; i++) {
    if (!TEMPLATED_CLAIM_RE.test(lines[i])) continue;
    const scope = [lines[i]];
    if (window >= 1) scope.push(prevNonEmpty(lines, i), nextNonEmpty(lines, i));
    if (!hasSymbolCitation(scope.join("\n"))) {
      violations.push({ lineNo: i + 1, line: lines[i].trim() });
    }
  }
  return violations;
}

/**
 * Find every line where a REGISTER_WORD appears with NO symbol citation on the
 * SAME line — "beside the symbol that earned it ... in the same line". Applied
 * to composed/demonstrative prose, not to the vocabulary glossary that defines
 * the words.
 */
export function registerAdjacencyViolations(text) {
  const wordRe = new RegExp(`\\b(?:${REGISTER_WORDS.join("|")})\\b`, "i");
  const violations = [];
  String(text).split("\n").forEach((line, i) => {
    if (wordRe.test(line) && !hasSymbolCitation(line)) {
      violations.push({ lineNo: i + 1, line: line.trim() });
    }
  });
  return violations;
}
