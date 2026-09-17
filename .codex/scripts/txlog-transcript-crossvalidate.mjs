#!/usr/bin/env node
/**
 * Coordinate: #5/S0 (forensic cross-validation stage — Track 54 Tranche T54.04)
 * Residency: .codex/scripts/txlog-transcript-crossvalidate.mjs
 * Position (#n): #5 — Integration; the SECOND, independent witness to the wipe
 * Actualises: [[54-bimba-graph-enrichment-recovery]] T54.04 — "Session-log
 *   cross-validation, independent of the log parser". T54.01/T54.02 recover the
 *   destroyed `:Bimba` enrichment by decoding and replaying Neo4j's transaction
 *   log. This stage recovers the SAME state from a source that shares none of
 *   that parser's failure modes: bimba-mcp calls and their `tool_result`
 *   read-backs, recorded verbatim in Claude and Codex session transcripts. Two
 *   independent witnesses mean a parser bug cannot silently corrupt both.
 * Public surface: unescapeOnce, looksLikeGraphPayload, isBimbaPropertyKey,
 *   propertyFamily, FAMILIES, isCoordinateShaped, scanSerialisedNodes,
 *   harvestPayloadText, harvestStructured, harvestClaudeLine, harvestCodexLine,
 *   RecordStore, parseReconstructionCypher, parseReconstructionAudit,
 *   diffAgainstReconstruction, collect, main;
 *   CLI: node .codex/scripts/txlog-transcript-crossvalidate.mjs [--json]
 * Does NOT own: the transaction-log decoder (T54.01, Body/S/S2/graph-services/
 *   src/txlog_forensics/), the replay/reconstruction (T54.02), the live-graph
 *   apply (T54.03), or the Neo4j connection law (graph-services Neo4jConfig).
 *   This stage NEVER writes to a graph and NEVER writes into Body/S/S2.
 * Contract: read-only over transcripts. Three defects already caused silent
 *   data loss in first-pass scripts and are pinned by name in the tests:
 *     (a) NEVER re-serialise a record before unescaping — JSON.stringify
 *         re-escapes exactly what the unescape pass is stripping. The parsed
 *         path and the text path are disjoint here and never cross.
 *     (b) NEVER pre-filter on the literal `"coordinate"` — an escaped payload
 *         spells it \"coordinate\", so every gate below is a BARE-WORD probe.
 *     (c) The property window is BIDIRECTIONAL — a serialised node map does not
 *         always place `coordinate` first (M2-3's q_3 sits before its anchor),
 *         so the scanner collects a whole object frame and anchors afterwards.
 */

import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve, basename } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = resolve(SCRIPT_DIR, "..", "..");

export const PLAN_RUNS = join(
  REPO_ROOT,
  "Idea", "Bimba", "Seeds", "M", "Legacy", "plans",
  "2026-07-03-m-prime-cycle-3-full-rerun", "plan.runs",
);

/** T54.02's emitted reconstruction (its own artifact — read-only here). */
export const RECON_CYPHER = join(
  REPO_ROOT, "Idea", "Bimba", "Map", "datasets", "recovery",
  "recovered-bimba-properties.cypher",
);
export const RECON_AUDIT = join(
  REPO_ROOT, "Idea", "Bimba", "Map", "datasets", "recovery",
  "recovered-bimba-properties.audit.json",
);

/** The floor the first-pass scratchpad scripts reached. Beating it is the bar. */
export const FIRST_PASS_FLOOR = { properties: 855, coordinates: 74, qRegisters: 316 };

export const MAP_ROOT = join(REPO_ROOT, "Idea", "Bimba", "Map");

/**
 * The 996 `Idea/Bimba/Map` coordinates — the track's independent coverage
 * reference (gotcha 5: the Map VERIFIES coverage, it is never bulk-merged).
 * Context-frame coordinates render `/` as `∕` (U+2215) in file names; the true
 * coordinate restores the solidus.
 */
export function loadMapCoordinates(root = MAP_ROOT) {
  const out = new Set();
  for (const branch of ["M0", "M1", "M2", "M3", "M4", "M5"]) {
    for (const p of walkFiles(join(root, branch), (n) => n.endsWith(".md") && n !== "AGENTS.md")) {
      out.add(basename(p, ".md").replace(/∕/g, "/"));
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Property / coordinate law
// ---------------------------------------------------------------------------

/**
 * A Bimba property key is `{family}_{position}{sub?}_{semantic}` — the
 * frontmatter key law (`q_3_…`, `qm_2_…`, `c_0_source_coordinates`,
 * `t_0_thought_type`, `q_2b_ethical_interiorisation`).
 */
export const BIMBA_KEY_RE = /^(qm|q|c|l|m|p|s|t)_(\d+)([a-z]*)_([a-z0-9][a-z0-9_]*)$/;

export const FAMILIES = ["q_*", "qm_*", "c_*", "l_*", "m_*", "p_*", "s_*", "t_*"];

export function isBimbaPropertyKey(key) {
  return typeof key === "string" && key.length <= 160 && BIMBA_KEY_RE.test(key);
}

export function propertyFamily(key) {
  const m = BIMBA_KEY_RE.exec(String(key ?? ""));
  return m ? `${m[1]}_*` : null;
}

/** q-register = the q_* and qm_* families together (the track's headline count). */
export function isQRegister(key) {
  const f = propertyFamily(key);
  return f === "q_*" || f === "qm_*";
}

/** The Layer-3 reflective coordinates — the only lowercase coordinate names. */
export const REFLECTIVE_COORDINATES = new Set(["cpf", "ct", "cp", "cf", "cfp", "cs"]);

/**
 * A Bimba coordinate: `#`, `#0`–`#5`, family letters (`L`, `C0`, `M5`), the
 * dashed/parenthesised forms (`M0-5-(5/0)-0`, `S4-5'`, `M2-3`), and the six
 * lowercase reflective coordinates.
 *
 * The no-lowercase rule is load-bearing: without it a session-cache key such as
 * `S2.kernel.resonance.agent-main.1779000001234.31` passes every other check
 * and enters the recovered dataset as a fabricated coordinate. Verified against
 * both references — 0 of the 996 `Idea/Bimba/Map` coordinates and 0 live
 * `:Bimba` coordinates in this charset carry a lowercase letter.
 */
export function isCoordinateShaped(value) {
  if (typeof value !== "string") return false;
  const s = value.trim();
  if (!s || s.length > 64) return false;
  if (REFLECTIVE_COORDINATES.has(s.replace(/'$/, ""))) return true;
  if (/[a-z]/.test(s)) return false;
  if (!/^[#A-Z]/.test(s)) return false;
  if (!/^[A-Z0-9#'()/.\-]+$/.test(s)) return false;
  if (s === "#") return true;
  if (/^[#A-Z][A-Z0-9]{0,3}'?$/.test(s)) return true; // bare family / archetype
  return /[0-9]/.test(s); // every deeper coordinate carries a position digit
}

// ---------------------------------------------------------------------------
// (b) BARE-WORD gates. Never quote `coordinate` in a filter.
// ---------------------------------------------------------------------------

const BIMBA_KEY_PROBE = /(?:^|[^a-z0-9_])(?:qm|q|c|l|m|p|s|t)_\d+[a-z]*_[a-z0-9_]{2,}/;

/**
 * BUG-B GUARD. The probe below matches the bare word `coord`, never the quoted
 * literal `"coordinate"`. An escaped payload spells the key \"coordinate\" and
 * a quoted gate drops the entire record before it is ever scanned.
 */
export function looksLikeGraphPayload(text) {
  if (typeof text !== "string" || text.length < 12) return false;
  if (text.indexOf("coord") === -1) return false;
  if (text.indexOf("{") === -1) return false;
  return BIMBA_KEY_PROBE.test(text);
}

// ---------------------------------------------------------------------------
// (a) Unescaping. Single left-to-right pass — one level, never two.
// ---------------------------------------------------------------------------

const ESCAPE_MAP = { n: "\n", t: "\t", r: "\r", b: "\b", f: "\f", '"': '"', "\\": "\\", "/": "/" };

/**
 * BUG-A GUARD. This takes the RAW payload text as it sits in the transcript and
 * strips exactly one level of JSON escaping. It must never be handed the output
 * of `JSON.stringify` — stringify re-escapes the very sequences this strips, so
 * a stringify-then-unescape round trip silently converts real newlines and
 * quotes back into literal `\n` / `\"` and the values are lost.
 */
export function unescapeOnce(text) {
  if (typeof text !== "string") return "";
  return text.replace(/\\(u[0-9a-fA-F]{4}|.)/g, (whole, tail) => {
    if (tail[0] === "u") return String.fromCharCode(parseInt(tail.slice(1), 16));
    return Object.prototype.hasOwnProperty.call(ESCAPE_MAP, tail) ? ESCAPE_MAP[tail] : whole;
  });
}

// ---------------------------------------------------------------------------
// (c) Bidirectional frame scanner
// ---------------------------------------------------------------------------

const ANCHOR_KEYS = new Set(["coordinate", "coord"]);
/** Child objects whose scalars belong to the parent node (`{"properties":{…}}`). */
const MERGE_UP_KEYS = new Set(["properties", "props", "set", "node", "n", "data", "values"]);

/**
 * Walk a (already unescaped) JSON-ish text and emit every object frame that
 * carries a coordinate anchor, together with EVERY scalar key in that frame.
 *
 * BUG-C GUARD. The whole frame is collected before the anchor is looked for, so
 * key order is irrelevant: a property serialised BEFORE `coordinate` (M2-3's
 * `q_3_…` does exactly this) is recovered identically to one serialised after.
 * There is no "window after the anchor" anywhere in this function.
 *
 * Tolerant of truncation: frames still open at EOF are emitted as `truncated`.
 */
export function scanSerialisedNodes(text, opts = {}) {
  const depth = opts._depth ?? 0;
  const maxDepth = opts.maxNestDepth ?? 3;
  const out = [];
  if (typeof text !== "string" || !text.length) return out;

  const n = text.length;
  const stack = [];
  let i = 0;

  const emit = (frame, truncated) => {
    let anchor = null;
    let anchorKey = null;
    for (const k of ANCHOR_KEYS) {
      if (frame.props.has(k) && isCoordinateShaped(frame.props.get(k))) {
        anchor = String(frame.props.get(k)).trim();
        anchorKey = k;
        break;
      }
    }
    if (anchor === null) return false;
    const properties = {};
    for (const [k, v] of frame.props) {
      if (!isBimbaPropertyKey(k)) continue;
      if (v === null || v === undefined) continue;
      properties[k] = v;
    }
    out.push({ coordinate: anchor, anchorKey, properties, truncated: Boolean(truncated) });
    return true;
  };

  const readString = () => {
    // i points at the opening quote
    let j = i + 1;
    let buf = "";
    while (j < n) {
      const c = text[j];
      if (c === "\\") {
        const nx = text[j + 1];
        if (nx === undefined) { j++; break; }
        if (nx === "u") {
          const hex = text.slice(j + 2, j + 6);
          if (/^[0-9a-fA-F]{4}$/.test(hex)) { buf += String.fromCharCode(parseInt(hex, 16)); j += 6; continue; }
          buf += nx; j += 2; continue;
        }
        buf += Object.prototype.hasOwnProperty.call(ESCAPE_MAP, nx) ? ESCAPE_MAP[nx] : nx;
        j += 2;
        continue;
      }
      if (c === '"') { i = j + 1; return { value: buf, closed: true }; }
      buf += c;
      j++;
    }
    i = n;
    return { value: buf, closed: false };
  };

  const skipWs = () => { while (i < n && /\s/.test(text[i])) i++; };

  while (i < n) {
    const c = text[i];
    if (c === "{") {
      stack.push({ props: new Map(), enteredUnder: stack.length ? stack[stack.length - 1]._pendingKey : null });
      i++;
      continue;
    }
    if (c === "}") {
      const frame = stack.pop();
      i++;
      if (!frame) continue;
      const emitted = emit(frame, false);
      const parent = stack[stack.length - 1];
      if (!emitted && parent && frame.enteredUnder && MERGE_UP_KEYS.has(frame.enteredUnder)) {
        for (const [k, v] of frame.props) if (!parent.props.has(k)) parent.props.set(k, v);
      }
      continue;
    }
    if (c === "[" || c === "]") { i++; continue; }
    if (c === '"') {
      const start = i;
      const { value } = readString();
      const save = i;
      skipWs();
      if (text[i] === ":") {
        i++;
        const frame = stack[stack.length - 1];
        if (frame) frame._pendingKey = value;
        skipWs();
        // read the value
        if (text[i] === '"') {
          const v = readString();
          if (frame) {
            frame.props.set(value, v.value);
            if (!v.closed) frame._truncatedAt = value;
          }
          // A string value may itself be a nested, separately-escaped payload.
          if (depth < maxDepth && looksLikeGraphPayload(v.value)) {
            for (const nested of harvestPayloadText(v.value, { _depth: depth + 1, maxNestDepth: maxDepth }).nodes) {
              out.push(nested);
            }
          }
        } else if (text[i] === "[") {
          // A scalar array (`c_0_source_coordinates` is ALWAYS string[]). If the
          // array turns out to hold objects, bail and let the main loop walk it.
          const open = i;
          i++;
          const arr = [];
          let scalarOnly = true;
          while (i < n) {
            skipWs();
            const ch = text[i];
            if (ch === "]") { i++; break; }
            if (ch === ",") { i++; continue; }
            if (ch === '"') { arr.push(readString().value); continue; }
            if (ch === "{" || ch === "[") { scalarOnly = false; break; }
            if (/[-0-9tfn]/.test(ch ?? "")) {
              let j = i;
              while (j < n && /[-+0-9.eEtruefalsnl]/.test(text[j])) j++;
              const raw = text.slice(i, j);
              arr.push(raw === "true" ? true : raw === "false" ? false : raw === "null" ? null : Number(raw));
              i = j;
              continue;
            }
            if (ch === undefined) break;
            i++;
          }
          if (scalarOnly) { if (frame && arr.length) frame.props.set(value, arr); }
          else i = open + 1; // rewind so the main loop sees the nested structure
        } else if (/[-0-9tfn]/.test(text[i] ?? "")) {
          let j = i;
          while (j < n && /[-+0-9.eEtruefalsnl]/.test(text[j])) j++;
          const raw = text.slice(i, j);
          if (frame) {
            if (raw === "true") frame.props.set(value, true);
            else if (raw === "false") frame.props.set(value, false);
            else if (raw === "null") frame.props.set(value, null);
            else if (/^-?\d/.test(raw)) frame.props.set(value, Number(raw));
          }
          i = j;
        }
        continue;
      }
      i = save;
      // bare string value (array element etc.) — nothing to record
      if (i === start) i++;
      continue;
    }
    i++;
  }

  // truncation: anything still open at EOF
  while (stack.length) {
    const frame = stack.pop();
    const emitted = emit(frame, true);
    const parent = stack[stack.length - 1];
    if (!emitted && parent && frame.enteredUnder && MERGE_UP_KEYS.has(frame.enteredUnder)) {
      for (const [k, v] of frame.props) if (!parent.props.has(k)) parent.props.set(k, v);
    }
  }

  return out;
}

/**
 * Scan a payload, auto-detecting how many levels of JSON escaping wrap it.
 * A successful scan is NEVER re-unescaped (that is bug (a) in the other
 * direction — it would corrupt values that legitimately contain `\n`).
 */
export function harvestPayloadText(text, opts = {}) {
  let cur = typeof text === "string" ? text : "";
  for (let escapeDepth = 0; escapeDepth <= 4; escapeDepth++) {
    // A payload that is itself a JSON literal is unwrapped by JSON.parse — the
    // exact inverse of the serialisation, so no escape level is ever guessed.
    const trimmed = cur.trim();
    if (trimmed && (trimmed[0] === '"' || trimmed[0] === "{" || trimmed[0] === "[")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed === "string") cur = parsed;
        else if (parsed && typeof parsed === "object") {
          const nodes = harvestStructured(parsed);
          if (nodes.length) return { nodes, escapeDepth };
        }
      } catch { /* truncated or not a literal — the tolerant scanner handles it */ }
    }
    const nodes = scanSerialisedNodes(cur, opts);
    if (nodes.length) return { nodes, escapeDepth };
    if (!/\\+"/.test(cur)) break;
    cur = unescapeOnce(cur);
  }
  return { nodes: [], escapeDepth: 0 };
}

/**
 * Structural harvest over an ALREADY-PARSED value.
 *
 * BUG-A GUARD. This path never stringifies and never unescapes — a parsed
 * object is already unescaped exactly once by `JSON.parse`, and re-serialising
 * it to run the text scanner would put every escape back. The parsed path and
 * the text path are disjoint by construction.
 */
export function harvestStructured(value, out = [], depth = 0) {
  if (depth > 12 || value === null || typeof value !== "object") return out;
  if (Array.isArray(value)) {
    for (const v of value) harvestStructured(v, out, depth + 1);
    return out;
  }
  let anchor = null;
  let anchorKey = null;
  for (const k of ANCHOR_KEYS) {
    if (isCoordinateShaped(value[k])) { anchor = String(value[k]).trim(); anchorKey = k; break; }
  }
  if (anchor !== null) {
    const properties = {};
    const absorb = (obj) => {
      for (const [k, v] of Object.entries(obj)) {
        if (!isBimbaPropertyKey(k) || v === null || v === undefined) continue;
        if (typeof v !== "object") properties[k] = v;
        // Scalar arrays are real Bimba values (`c_0_source_coordinates` is
        // ALWAYS string[]); dropping them loses ~5% of the property surface.
        else if (Array.isArray(v) && v.length && v.every((x) => x === null || typeof x !== "object")) properties[k] = v;
      }
    };
    absorb(value);
    for (const k of MERGE_UP_KEYS) {
      if (value[k] && typeof value[k] === "object" && !Array.isArray(value[k])) absorb(value[k]);
    }
    out.push({ coordinate: anchor, anchorKey, properties, truncated: false });
  }
  for (const v of Object.values(value)) {
    if (v && typeof v === "object") harvestStructured(v, out, depth + 1);
    else if (typeof v === "string" && looksLikeGraphPayload(v)) {
      for (const nested of harvestPayloadText(v).nodes) out.push(nested);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Harness readers
// ---------------------------------------------------------------------------

const GRAPH_TOOL_RE = /(?:^|__)graph_[a-z_]+$/;
const WRITE_TOOLS = /graph_(?:set_property|upsert_node|sync)$/;

/**
 * A Claude transcript line. Returns { records, graphToolIds, overflowPaths }.
 * `graphToolIds` correlates a later `tool_result` back to the bimba-mcp call
 * that produced it — the only rigorous way to tell a graph read-back from a
 * source file that merely contains the word "coordinate".
 */
export function harvestClaudeLine(line, ctx = {}) {
  const records = [];
  const graphToolIds = new Map();
  const overflowPaths = [];
  let obj;
  try { obj = JSON.parse(line); } catch { return { records, graphToolIds, overflowPaths, parsed: false }; }
  const at = obj.timestamp ?? null;
  const content = obj?.message?.content;
  const push = (nodes, tier) => { for (const nd of nodes) records.push({ ...nd, tier, at }); };

  if (Array.isArray(content)) {
    for (const block of content) {
      if (block?.type === "tool_use" && GRAPH_TOOL_RE.test(String(block.name ?? ""))) {
        graphToolIds.set(block.id, block.name);
        const input = block.input ?? {};
        const coordinate = input?.locator?.coordinate ?? input?.coordinate ?? input?.locator?.coord ?? null;
        const setMap = input.set ?? input.properties ?? null;
        if (isCoordinateShaped(coordinate) && setMap && typeof setMap === "object") {
          const properties = {};
          for (const [k, v] of Object.entries(setMap)) {
            if (isBimbaPropertyKey(k) && v !== null && typeof v !== "object") properties[k] = v;
          }
          records.push({
            coordinate: String(coordinate).trim(), anchorKey: "locator", properties,
            truncated: false, tier: WRITE_TOOLS.test(String(block.name)) ? "mcp-write" : "mcp-call", at,
          });
        } else {
          push(harvestStructured(input), "mcp-call");
        }
      }
      if (block?.type === "tool_result") {
        const known = ctx.graphToolIds?.has(block.tool_use_id);
        const parts = Array.isArray(block.content)
          ? block.content
          : [{ type: "text", text: typeof block.content === "string" ? block.content : "" }];
        for (const part of parts) {
          const text = part?.type === "text" ? part.text : null;
          if (typeof text !== "string" || !text) continue;
          const spill = /Output has been saved to (\S+?\.txt)/.exec(text);
          if (spill) overflowPaths.push(spill[1]);
          if (!known && !looksLikeGraphPayload(text)) continue;
          let parsedOk = false;
          try {
            const parsed = JSON.parse(text);
            push(harvestStructured(parsed), known ? "mcp-readback" : "loose-readback");
            parsedOk = true;
          } catch { /* truncated or non-JSON — fall through to the text scanner */ }
          if (!parsedOk) push(harvestPayloadText(text).nodes, known ? "mcp-readback-text" : "loose-text");
        }
      }
    }
  }
  if (obj.toolUseResult && typeof obj.toolUseResult === "object") {
    push(harvestStructured(obj.toolUseResult), "tool-use-result");
  }
  return { records, graphToolIds, overflowPaths, parsed: true };
}

/** A Codex rollout line. Codex embeds tool payloads as escaped JSON strings. */
export function harvestCodexLine(line) {
  const records = [];
  let obj;
  try { obj = JSON.parse(line); } catch {
    if (looksLikeGraphPayload(line)) {
      for (const nd of harvestPayloadText(line).nodes) records.push({ ...nd, tier: "codex-text", at: null });
    }
    return { records, parsed: false };
  }
  const at = obj.timestamp ?? null;
  for (const nd of harvestStructured(obj)) records.push({ ...nd, tier: "codex", at });
  const args = obj?.payload?.arguments ?? obj?.arguments ?? obj?.payload?.output ?? obj?.output;
  if (typeof args === "string" && looksLikeGraphPayload(args)) {
    for (const nd of harvestPayloadText(args).nodes) records.push({ ...nd, tier: "codex-call", at });
  }
  return { records, parsed: true };
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export class RecordStore {
  constructor() {
    /** coordinate -> property -> { value, tier, at, truncated, variants: Map } */
    this.byCoordinate = new Map();
    this.rejectedCoordinates = new Map();
    this.tierCounts = new Map();
  }

  add(record) {
    const coord = record.coordinate;
    if (!isCoordinateShaped(coord)) {
      this.rejectedCoordinates.set(coord, (this.rejectedCoordinates.get(coord) ?? 0) + 1);
      return;
    }
    const keys = Object.keys(record.properties ?? {});
    if (!keys.length) return;
    this.tierCounts.set(record.tier, (this.tierCounts.get(record.tier) ?? 0) + 1);
    let node = this.byCoordinate.get(coord);
    if (!node) { node = new Map(); this.byCoordinate.set(coord, node); }
    for (const k of keys) {
      const value = record.properties[k];
      const str = typeof value === "string" ? value : JSON.stringify(value);
      let slot = node.get(k);
      if (!slot) {
        slot = {
          value, tier: record.tier, at: record.at, truncated: record.truncated,
          source: record.source ?? null, variants: new Map(),
        };
        node.set(k, slot);
      }
      slot.variants.set(str, (slot.variants.get(str) ?? 0) + 1);
      // Prefer the longest untruncated observation, then the latest timestamp.
      const curStr = typeof slot.value === "string" ? slot.value : JSON.stringify(slot.value);
      const better = (!record.truncated && slot.truncated)
        || (record.truncated === slot.truncated && str.length > curStr.length)
        || (record.truncated === slot.truncated && str.length === curStr.length
            && record.at && slot.at && record.at > slot.at);
      if (better) {
        slot.value = value; slot.tier = record.tier; slot.at = record.at;
        slot.truncated = record.truncated; slot.source = record.source ?? slot.source;
      }
    }
  }

  totals() {
    const byFamily = Object.fromEntries(FAMILIES.map((f) => [f, 0]));
    let properties = 0;
    let qRegisters = 0;
    for (const props of this.byCoordinate.values()) {
      for (const k of props.keys()) {
        properties++;
        const f = propertyFamily(k);
        if (f && f in byFamily) byFamily[f]++;
        if (isQRegister(k)) qRegisters++;
      }
    }
    return { coordinates: this.byCoordinate.size, properties, qRegisters, byFamily };
  }
}

// ---------------------------------------------------------------------------
// Collection
// ---------------------------------------------------------------------------

function* walkFiles(dir, filter) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walkFiles(p, filter);
    else if (filter(e.name, p)) yield p;
  }
}

export function collect(opts = {}) {
  const claudeRoot = opts.claudeRoot ?? join(homedir(), ".claude", "projects");
  const codexRoot = opts.codexRoot ?? join(homedir(), ".codex", "sessions");
  const store = new RecordStore();
  const stats = {
    claudeFiles: 0, claudeLines: 0, codexFiles: 0, codexLines: 0,
    overflowFiles: 0, overflowBytes: 0, graphToolCalls: new Map(), rawRecords: 0,
  };
  const overflowSeen = new Set();

  for (const file of walkFiles(claudeRoot, (n) => n.endsWith(".jsonl"))) {
    let text;
    try { text = readFileSync(file, "utf8"); } catch { continue; }
    stats.claudeFiles++;
    const ctx = { graphToolIds: new Map() };
    const lines = text.split("\n");
    // Pass 1: build the tool_use_id -> graph tool name map for this session.
    for (const line of lines) {
      if (!line || line.indexOf("graph_") === -1) continue;
      const { graphToolIds } = harvestClaudeLine(line, {});
      for (const [id, name] of graphToolIds) {
        ctx.graphToolIds.set(id, name);
        stats.graphToolCalls.set(name, (stats.graphToolCalls.get(name) ?? 0) + 1);
      }
    }
    // Pass 2: harvest.
    for (const line of lines) {
      if (!line) continue;
      stats.claudeLines++;
      const cheap = line.indexOf("coord") !== -1 || line.indexOf("graph_") !== -1;
      if (!cheap) continue;
      const { records, overflowPaths } = harvestClaudeLine(line, ctx);
      stats.rawRecords += records.length;
      for (const r of records) store.add({ ...r, source: file });
      for (const p of overflowPaths) overflowSeen.add(p);
    }
    // Spilled oversized results live beside the transcript.
    const spillDir = join(dirname(file), basename(file, ".jsonl"), "tool-results");
    for (const p of walkFiles(spillDir, (n) => n.endsWith(".txt"))) overflowSeen.add(p);
  }

  for (const p of overflowSeen) {
    let text;
    try { text = readFileSync(p, "utf8"); } catch { continue; }
    // A `tool-results/` directory also holds spills from Read/Bash/etc. Only a
    // bimba-mcp spill, or a payload that independently passes the graph gate,
    // is allowed to contribute — a source file that merely contains the word
    // "coordinate" must never enter the recovered dataset.
    const graphNamed = /mcp-bimba-mcp-/.test(basename(p));
    if (!graphNamed && !looksLikeGraphPayload(text)) continue;
    stats.overflowFiles++;
    stats.overflowBytes += text.length;
    const tier = graphNamed ? "overflow" : "overflow-loose";
    let parsedOk = false;
    try {
      const nodes = harvestStructured(JSON.parse(text));
      for (const nd of nodes) store.add({ ...nd, tier, at: null, source: p });
      stats.rawRecords += nodes.length;
      parsedOk = true;
    } catch { /* fall through */ }
    if (!parsedOk) {
      const nodes = harvestPayloadText(text).nodes;
      for (const nd of nodes) store.add({ ...nd, tier: `${tier}-text`, at: null, source: p });
      stats.rawRecords += nodes.length;
    }
  }

  for (const file of walkFiles(codexRoot, (n) => n.endsWith(".jsonl"))) {
    let text;
    try { text = readFileSync(file, "utf8"); } catch { continue; }
    stats.codexFiles++;
    for (const line of text.split("\n")) {
      if (!line) continue;
      stats.codexLines++;
      if (line.indexOf("coord") === -1) continue;
      const { records } = harvestCodexLine(line);
      stats.rawRecords += records.length;
      for (const r of records) store.add({ ...r, source: file });
    }
  }

  return { store, stats };
}

// ---------------------------------------------------------------------------
// T54.02 reconstruction readers + diff
// ---------------------------------------------------------------------------


/** Undo Cypher single-quoted escaping. `\n` is a NEWLINE, not the letter n.
 *  Stripping the backslash blindly corrupts every multi-line value and shows
 *  up as a false value-disagreement (found 2026-08-01 on M1-4.s_5_agent_prompt,
 *  where the live graph matched the transcript exactly at 4923 chars). */
function unescapeCypher(str) {
  return str.replace(/\\(.)/g, (_, c) =>
    c === "n" ? "\n" : c === "t" ? "\t" : c === "r" ? "\r" : c);
}

/** Parse T54.02's `MATCH (n:Bimba {coordinate: '…'}) SET n += { `k`: '…' };` form. */
export function parseReconstructionCypher(text) {
  const out = new Map();
  const blockRe = /MATCH\s*\(n:Bimba\s*\{coordinate:\s*'((?:\\.|[^'\\])*)'\}\)\s*SET\s+n\s*\+=\s*\{([\s\S]*?)\n\};/g;
  let m;
  while ((m = blockRe.exec(text)) !== null) {
    const coordinate = unescapeCypher(m[1]);
    const body = m[2];
    const props = out.get(coordinate) ?? new Map();
    const pairRe = /`([^`]+)`\s*:\s*(?:\[([\s\S]*?)\]|'((?:\\.|[^'\\])*)'|(-?\d+(?:\.\d+)?)|(true|false|null))/g;
    let p;
    while ((p = pairRe.exec(body)) !== null) {
      const key = p[1];
      let value;
      if (p[2] !== undefined) {
        value = [];
        const elemRe = /'((?:\\.|[^'\\])*)'|(-?\d+(?:\.\d+)?)|(true|false|null)/g;
        let e;
        while ((e = elemRe.exec(p[2])) !== null) {
          if (e[1] !== undefined) value.push(unescapeCypher(e[1]));
          else if (e[2] !== undefined) value.push(Number(e[2]));
          else value.push(e[3] === "true" ? true : e[3] === "false" ? false : null);
        }
      } else if (p[3] !== undefined) value = unescapeCypher(p[3]);
      else if (p[4] !== undefined) value = Number(p[4]);
      else value = p[5] === "true" ? true : p[5] === "false" ? false : null;
      props.set(key, value);
    }
    out.set(coordinate, props);
  }
  return out;
}

/** Parse T54.02's audit JSON — the (coordinate, property, tx) presence set. */
export function parseReconstructionAudit(text) {
  const rows = JSON.parse(text);
  const out = new Map();
  for (const r of rows) {
    if (!r || typeof r.coordinate !== "string" || typeof r.property !== "string") continue;
    let s = out.get(r.coordinate);
    if (!s) { s = new Map(); out.set(r.coordinate, s); }
    s.set(r.property, r.tx ?? null);
  }
  return out;
}

const norm = (v) => {
  if (Array.isArray(v)) return JSON.stringify(v.map((x) => (typeof x === "string" ? x.trim() : x)));
  if (typeof v === "string") return v.trim();
  return v === null || v === undefined ? "" : String(v);
};

/**
 * Enumerate EVERY disagreement between the two independent recoveries.
 * Nothing here is summarised away — the summary is derived from the list.
 */
export function diffAgainstReconstruction(store, recon, reconValues = null) {
  const rows = [];
  const coords = new Set([...store.byCoordinate.keys(), ...recon.keys()]);
  for (const coordinate of coords) {
    const mine = store.byCoordinate.get(coordinate) ?? new Map();
    const theirs = recon.get(coordinate) ?? new Map();
    const keys = new Set([...mine.keys(), ...theirs.keys()]);
    for (const property of keys) {
      const hasMine = mine.has(property);
      const hasTheirs = theirs.has(property);
      const family = propertyFamily(property) ?? "other";
      if (hasMine && !hasTheirs) {
        rows.push({ coordinate, property, family, verdict: "only-transcript" });
        continue;
      }
      if (!hasMine && hasTheirs) {
        rows.push({ coordinate, property, family, verdict: "only-reconstruction" });
        continue;
      }
      const slot = mine.get(property);
      const a = norm(slot.value);
      const bRaw = reconValues ? reconValues.get(coordinate)?.get(property) : undefined;
      if (bRaw === undefined) { rows.push({ coordinate, property, family, verdict: "agree-presence" }); continue; }
      const b = norm(bRaw);
      if (a === b) rows.push({ coordinate, property, family, verdict: "agree" });
      else if (slot.truncated && b.startsWith(a) && a.length > 0) {
        rows.push({ coordinate, property, family, verdict: "agree-prefix", transcriptLength: a.length, reconstructionLength: b.length });
      } else {
        rows.push({
          coordinate, property, family, verdict: "value-disagree",
          transcript: a.length > 300 ? `${a.slice(0, 300)}…` : a,
          reconstruction: b.length > 300 ? `${b.slice(0, 300)}…` : b,
          transcriptLength: a.length, reconstructionLength: b.length,
          transcriptTruncated: Boolean(slot.truncated), transcriptTier: slot.tier,
          transcriptSource: slot.source ?? null,
          reconstructionEmpty: b.length === 0,
        });
      }
    }
  }
  const byFamily = {};
  for (const r of rows) {
    const f = r.family;
    byFamily[f] ??= { agree: 0, "agree-prefix": 0, "agree-presence": 0, "value-disagree": 0, "only-transcript": 0, "only-reconstruction": 0, total: 0 };
    byFamily[f][r.verdict] = (byFamily[f][r.verdict] ?? 0) + 1;
    byFamily[f].total++;
  }
  for (const f of Object.values(byFamily)) {
    const agreeing = f.agree + f["agree-prefix"] + f["agree-presence"];
    f.agreementRate = f.total ? Number((agreeing / f.total).toFixed(4)) : 0;
  }
  // The load-bearing split inside `value-disagree`: a reconstruction value that
  // is the EMPTY STRING is a lost value, not a rival reading. It means the
  // replay recovered the property KEY but not its content — a different defect
  // class from two sources genuinely reporting different text.
  const disagreements = rows.filter((r) => r.verdict === "value-disagree");
  const summary = {
    valueDisagreements: disagreements.length,
    reconstructionEmpty: disagreements.filter((r) => r.reconstructionEmpty).length,
    genuineTextConflict: disagreements.filter((r) => !r.reconstructionEmpty).length,
  };
  return { rows, byFamily, summary };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function sha256(file) {
  try { return createHash("sha256").update(readFileSync(file)).digest("hex").slice(0, 16); }
  catch { return null; }
}

export function main(argv = process.argv.slice(2)) {
  const asJson = argv.includes("--json");
  const started = Date.now();
  const { store, stats } = collect();
  const totals = store.totals();

  const floorOk = totals.properties >= FIRST_PASS_FLOOR.properties
    && totals.coordinates >= FIRST_PASS_FLOOR.coordinates
    && totals.qRegisters >= FIRST_PASS_FLOOR.qRegisters;

  const dataset = {
    generatedAt: new Date().toISOString(),
    tranche: "54.T54.04",
    sourceLaw: "bimba-mcp tool_use inputs + tool_result read-backs in Claude/Codex transcripts — independent of the T54.01 transaction-log parser",
    stats: {
      ...stats,
      graphToolCalls: Object.fromEntries([...stats.graphToolCalls.entries()].sort((a, b) => b[1] - a[1])),
      tierCounts: Object.fromEntries([...store.tierCounts.entries()].sort((a, b) => b[1] - a[1])),
      rejectedCoordinateSamples: [...store.rejectedCoordinates.entries()].slice(0, 25),
    },
    firstPassFloor: FIRST_PASS_FLOOR,
    totals,
    floorBeaten: floorOk,
    coordinates: Object.fromEntries(
      [...store.byCoordinate.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([coord, props]) => [
        coord,
        Object.fromEntries([...props.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([k, s]) => [k, {
          value: s.value, tier: s.tier, at: s.at, truncated: s.truncated,
          source: s.source, variants: s.variants.size,
        }])),
      ]),
    ),
  };

  // Independent coverage reference: are the recovered coordinates REAL? Every
  // M-family coordinate the extractor claims must exist in the Map projection.
  const mapCoords = loadMapCoordinates();
  const mine = [...store.byCoordinate.keys()];
  const mFamily = mine.filter((c) => /^M[0-5]/.test(c));
  const absent = { branchRoot: [], mPrime: [], belowMapDepth: [], unexplained: [] };
  for (const c of mFamily) {
    if (mapCoords.has(c)) continue;
    if (/^M[0-5]$/.test(c)) { absent.branchRoot.push(c); continue; }
    if (c.includes("'")) { absent.mPrime.push(c); continue; }
    // The Map projects tree-depth ≤ 3. A deeper descendant of a mapped
    // coordinate is outside the projection, not an invented coordinate.
    let parent = c;
    let mapped = false;
    while (parent.length > 2) {
      parent = parent.replace(/[-.][^-.]*$/, "");
      if (parent === c) break;
      if (mapCoords.has(parent)) { mapped = true; break; }
    }
    (mapped ? absent.belowMapDepth : absent.unexplained).push(c);
  }
  dataset.mapCoverage = {
    mapCoordinates: mapCoords.size,
    recoveredCoordinates: mine.length,
    mFamilyRecovered: mFamily.length,
    mFamilyPresentInMap: mFamily.length - Object.values(absent).reduce((a, v) => a + v.length, 0),
    absentFromMap: {
      branchRoot: absent.branchRoot.sort(),
      mPrime: absent.mPrime.sort(),
      belowMapDepth: absent.belowMapDepth.sort(),
      unexplained: absent.unexplained.sort(),
    },
    nonMFamilyRecovered: mine.filter((c) => !/^M[0-5]/.test(c)).sort(),
    note: "The Map projects M0–M5 at tree-depth ≤ 3; branch roots, M-prime coordinates, deeper descendants, and the #/C*/L*/P*/S*/T* families are legitimately outside it. Only `unexplained` would indicate a fabricated coordinate.",
  };

  let diff = null;
  const reconAvailable = existsSync(RECON_AUDIT) && existsSync(RECON_CYPHER);
  if (reconAvailable) {
    const audit = parseReconstructionAudit(readFileSync(RECON_AUDIT, "utf8"));
    const values = parseReconstructionCypher(readFileSync(RECON_CYPHER, "utf8"));
    diff = diffAgainstReconstruction(store, audit, values);
    diff.reconstruction = {
      auditPath: RECON_AUDIT, cypherPath: RECON_CYPHER,
      auditSha256: sha256(RECON_AUDIT), cypherSha256: sha256(RECON_CYPHER),
      auditMtime: statSync(RECON_AUDIT).mtime.toISOString(),
      coordinates: audit.size,
      properties: [...audit.values()].reduce((a, m) => a + m.size, 0),
    };
  }
  dataset.diff = diff
    ? {
        available: true, byFamily: diff.byFamily, summary: diff.summary,
        reconstruction: diff.reconstruction, rowCount: diff.rows.length,
        // COMPLETE pair-level enumeration — every row, no class omitted. Full
        // detail is carried for `value-disagree` (both readings side by side);
        // the other classes carry the pair identity, because their values
        // already live in `coordinates` (transcript side) and in T54.02's own
        // artifact (reconstruction side). Nothing is summarised away.
        rows: diff.rows.map((r) => (r.verdict === "value-disagree"
          ? r
          : { coordinate: r.coordinate, property: r.property, family: r.family, verdict: r.verdict })),
      }
    : { available: false, reason: "T54.02 has not emitted recovered-bimba-properties.{cypher,audit.json}" };

  if (!existsSync(PLAN_RUNS)) mkdirSync(PLAN_RUNS, { recursive: true });
  const outJson = join(PLAN_RUNS, "54.T54.04-recovered-properties.json");
  writeFileSync(outJson, `${JSON.stringify(dataset, null, 2)}\n`);

  let outMd = null;
  if (diff) {
    outMd = join(PLAN_RUNS, "54.T54.04-crossvalidation-disagreements.md");
    writeFileSync(outMd, renderDisagreements(dataset, diff));
  }

  const report = {
    ok: floorOk,
    elapsedMs: Date.now() - started,
    totals,
    floor: FIRST_PASS_FLOOR,
    floorBeaten: floorOk,
    stats: dataset.stats,
    mapCoverage: dataset.mapCoverage,
    // The console report carries the diff SUMMARY; the complete pair-level
    // enumeration is written to the JSON artifact, not streamed to stdout.
    diff: { ...dataset.diff, rows: undefined },
    artifacts: [outJson, outMd].filter(Boolean),
  };
  if (asJson) console.log(JSON.stringify(report, null, 2));
  else {
    console.log(`transcript cross-validation — ${totals.coordinates} coordinates / ${totals.properties} properties / ${totals.qRegisters} q-registers`);
    console.log(`floor 855/74/316 beaten: ${floorOk}`);
    console.log(`by family: ${JSON.stringify(totals.byFamily)}`);
    console.log(`sources: ${stats.claudeFiles} claude jsonl, ${stats.codexFiles} codex jsonl, ${stats.overflowFiles} spilled tool-results (${stats.overflowBytes} bytes)`);
    console.log(`graph tool calls: ${JSON.stringify(dataset.stats.graphToolCalls)}`);
    const mc = dataset.mapCoverage;
    const a = mc.absentFromMap;
    console.log(`Map coverage: ${mc.mFamilyPresentInMap}/${mc.mFamilyRecovered} recovered M-family coordinates in the ${mc.mapCoordinates}-coordinate Map; outside it — ${a.branchRoot.length} branch roots, ${a.mPrime.length} M-prime, ${a.belowMapDepth.length} below the depth-3 projection, ${a.unexplained.length} UNEXPLAINED${a.unexplained.length ? ` (${a.unexplained.join(", ")})` : ""}`);
    if (diff) {
      console.log(`diff vs T54.02: ${diff.rows.length} pairs; ${diff.summary.valueDisagreements} value-disagreements of which ${diff.summary.reconstructionEmpty} are an EMPTY reconstruction value and ${diff.summary.genuineTextConflict} are a genuine text conflict`);
      for (const [f, v] of Object.entries(diff.byFamily)) {
        console.log(`  ${f}: total=${v.total} agree=${v.agree} agree-prefix=${v["agree-prefix"]} agree-presence=${v["agree-presence"]} value-disagree=${v["value-disagree"]} only-transcript=${v["only-transcript"]} only-recon=${v["only-reconstruction"]} rate=${v.agreementRate}`);
      }
    } else console.log("diff vs T54.02: UNAVAILABLE (reconstruction not emitted)");
    console.log(`artifacts: ${report.artifacts.join(", ")}`);
  }
  return report;
}

function renderDisagreements(dataset, diff) {
  const L = [];
  L.push("# 54.T54.04 — transcript cross-validation vs T54.02 reconstruction");
  L.push("");
  L.push(`Generated ${dataset.generatedAt}. Every disagreement is enumerated below — none are summarised away.`);
  L.push("");
  L.push(`Reconstruction under diff: \`${diff.reconstruction.auditPath}\` (sha256/16 \`${diff.reconstruction.auditSha256}\`, mtime ${diff.reconstruction.auditMtime}, ${diff.reconstruction.coordinates} coordinates / ${diff.reconstruction.properties} properties).`);
  L.push("");
  const mc = dataset.mapCoverage;
  L.push("## Coordinate reality check — `Idea/Bimba/Map` coverage");
  L.push("");
  L.push(`${mc.mFamilyPresentInMap} of ${mc.mFamilyRecovered} recovered M-family coordinates are present in the ${mc.mapCoordinates}-coordinate Map projection. ${mc.note}`);
  L.push("");
  L.push("| outside the Map because | count | coordinates |");
  L.push("|---|---|---|");
  for (const [k, v] of Object.entries(mc.absentFromMap)) {
    L.push(`| \`${k}\` | ${v.length} | ${v.length ? `\`${v.join("`, `")}\`` : "_none_"} |`);
  }
  L.push("");
  L.push(`Non-M-family coordinates recovered: \`${mc.nonMFamilyRecovered.join("`, `")}\`.`);
  L.push("");
  L.push("## Agreement rate per property family");
  L.push("");
  L.push("`only-reconstruction` counts the properties T54.02's replay holds that the transcripts never observed — the transcripts are a SAMPLE of graph traffic, the log is the complete record, so a large figure here is expected and is not a defect in either source. The load-bearing column is `value-disagree`: the same (coordinate, property) carrying two different values. The `other` family is the 24 legacy graph keys (`sync_status`, `coordinate_axis`, …) that fall outside the `{family}_{n}_{semantic}` key law this extractor harvests, so they are reported as out-of-scope, not as misses.");
  L.push("");
  L.push("| family | total | agree | agree-prefix | agree-presence | value-disagree | only-transcript | only-reconstruction | rate |");
  L.push("|---|---|---|---|---|---|---|---|---|");
  for (const [f, v] of Object.entries(diff.byFamily).sort()) {
    L.push(`| \`${f}\` | ${v.total} | ${v.agree} | ${v["agree-prefix"]} | ${v["agree-presence"]} | ${v["value-disagree"]} | ${v["only-transcript"]} | ${v["only-reconstruction"]} | ${v.agreementRate} |`);
  }
  L.push("");
  L.push("## Headline finding");
  L.push("");
  L.push(`Of ${diff.summary.valueDisagreements} value disagreements, **${diff.summary.reconstructionEmpty}** are cases where the reconstruction carries the property KEY but an EMPTY value while the transcripts hold real content, and ${diff.summary.genuineTextConflict} are genuine text conflicts. Every row below names the transcript file the value was read from, so each can be adjudicated against the transaction log directly.`);
  L.push("");
  const onlyRecon = diff.rows.filter((r) => r.verdict === "only-reconstruction");
  const byCoord = new Map();
  for (const r of onlyRecon) byCoord.set(r.coordinate, (byCoord.get(r.coordinate) ?? 0) + 1);
  for (const verdict of ["value-disagree", "only-transcript"]) {
    const rows = diff.rows.filter((r) => r.verdict === verdict);
    L.push(`## ${verdict} — ${rows.length}`);
    L.push("");
    if (!rows.length) { L.push("_none_"); L.push(""); continue; }
    if (verdict === "value-disagree") {
      L.push("| coordinate | property | transcript len | recon len | transcript tier | transcript source | transcript (truncated to 300) | reconstruction (truncated to 300) |");
      L.push("|---|---|---|---|---|---|---|---|");
      for (const r of rows.sort((a, b) => a.coordinate.localeCompare(b.coordinate) || a.property.localeCompare(b.property))) {
        const esc = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
        L.push(`| \`${r.coordinate}\` | \`${r.property}\` | ${r.transcriptLength} | ${r.reconstructionLength} | ${r.transcriptTier} | \`${esc(r.transcriptSource ?? "?")}\` | ${esc(r.transcript)} | ${esc(r.reconstruction)} |`);
      }
    } else {
      L.push("| coordinate | property | family |");
      L.push("|---|---|---|");
      for (const r of rows.sort((a, b) => a.coordinate.localeCompare(b.coordinate) || a.property.localeCompare(b.property))) {
        L.push(`| \`${r.coordinate}\` | \`${r.property}\` | \`${r.family}\` |`);
      }
    }
    L.push("");
  }
  L.push(`## only-reconstruction — ${onlyRecon.length}`);
  L.push("");
  L.push("Properties T54.02's replay holds that the transcripts never observed. This is the expected direction: the transcripts sample graph traffic, the transaction log is the complete record. Counted per coordinate below; the complete pair-level list is in the companion `54.T54.04-recovered-properties.json` under `diff.rows`, where no class is omitted.");
  L.push("");
  L.push("| coordinate | properties only in the reconstruction |");
  L.push("|---|---|");
  for (const [c, n] of [...byCoord.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) {
    L.push(`| \`${c}\` | ${n} |`);
  }
  L.push("");
  return `${L.join("\n")}\n`;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = main();
  // `process.exit()` discards pending async stdout writes and truncated the
  // --json report; set the code and let the runtime flush and exit cleanly.
  process.exitCode = r.ok ? 0 : 1;
}
