#!/usr/bin/env node
// project-map-index.mjs — Neo4j→repo *reflection* projector (Track 45).
//
// Emits a pithy, wikilink-open `/map` index whose FOLDER TREE MIRRORS THE CHILDREN RELATION
// (containment), and whose nodes carry real content + a full relation index. Full node detail
// stays in the graph; this is its navigable surface. Idempotent: rebuilds Map/M0..M5/.
//
// Usage:  node project-map-index.mjs [--max-depth N] [--dry]    (alias --max-dashes; default 3)
//
// HIERARCHY = the children relation, not a string guess. Containment relations are detected
// empirically per branch (a relType whose target is a coordinate-descendant of its source —
// catches HAS_INTERNAL_COMPONENT, INITIATES, HAS_ASPECT, CONTAINS_*, … with no hardcoded names).
// parent(c) = nearest containment-ancestor (longest coordinate prefix); string nearest-ancestor
// is only a fallback. tree-depth = hops from the branch root along that parent chain. This places
// e.g. M0-(4.0/1) UNDER M0-4 (per `#0-4 -HAS_INTERNAL_COMPONENT-> #0-4.0/1`), not at the M0 root.
//
// CANONICAL FORM (matches the migrated graph): '#'->'M'; each '-'-segment containing '/' wrapped in
// parens (#0-3-0/1 -> M0-3-(0/1)). '/' is illegal in filenames, so file/wikilink names render it as
// '∕' (U+2215); `coordinate:` + the graph pointer keep the true '/'. Node prose stays verbatim.
//
// NOT canon authoring — projection artifacts (c_4_artifact_role: map-index). Do not hand-edit;
// re-run. Enrichment docs in *-deep/ are canonical overrides ("See also").

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MAP_ROOT = path.resolve(__dirname, "..", ".."); // Idea/Bimba/Map
const DATASETS = path.join(MAP_ROOT, "datasets");
const PROJECTED_AT = "2026-06-17";

const argv = process.argv.slice(2);
const flagVal = (name) =>
  (argv.find((a) => a.startsWith(`${name}=`)) || "").split("=")[1] ||
  (argv.includes(name) ? argv[argv.indexOf(name) + 1] : "");
const MAX_DEPTH = Number(flagVal("--max-depth") || flagVal("--max-dashes") || 3);
const DRY = argv.includes("--dry");

const BRANCHES = [
  { key: "anuttara", n: 0, name: "Anuttara" },
  { key: "paramasiva", n: 1, name: "Paramasiva" },
  { key: "parashakti", n: 2, name: "Parashakti" },
  { key: "mahamaya", n: 3, name: "Mahamaya" },
  { key: "nara", n: 4, name: "Nara" },
  { key: "epii", n: 5, name: "Epii" },
];
const NODE_FILES = ["nodes-full-detail.json", "nodes-full-data.json", "nodes-full-details.json"];

const ENRICH_NODE = { "#2-0": ["fibonacci-60-pisano-integration"], "#3-5": ["fibonacci-60-pisano-integration"] };
const ENRICH_BRANCH = {
  0: ["anuttara-language-map"],
  1: ["Spanda_Genesis_100_Percent", "QL Essay", "Quaternal_Logic_Lived_Topology"],
  4: ["13-03-2026-claude-nara-thinking-marketing"],
};

const yaml = (v) => JSON.stringify(v);

// ---- canonical form + filesystem id ----
// '#'->'M'; a '-'-segment that IS a context frame (contains '/') is parenthesised, but a
// position-N frame keeps its 'N.' OUTSIDE the parens via dot-notation: '4.0/1' -> '4.(0/1)',
// '4.0/1/2/3' -> '4.(0/1/2/3)'. The QL fractal-doubling frame '(4.0/1-4.4/5)' spans a '-' and is
// encoded in the dataset as '4.4.0-4.4/5'; protect it before splitting so it survives intact.
const DOUBLING_RAW = "4.4.0-4.4/5", DOUBLING_TOK = "", DOUBLING_CANON = "4.(4.0/1-4.4/5)";
function frameSeg(s) {
  if (s === DOUBLING_TOK) return DOUBLING_CANON;
  if (!s.includes("/")) return s;
  const m = s.match(/^(\d+)\.(.+)$/); // position-N frame -> keep 'N.' outside the parens
  return m ? `${m[1]}.(${m[2]})` : `(${s.replace(/^\(+|\)+$/g, "")})`;
}
function canonical(coord) {
  if (coord === "#") return "M";
  const body = (coord.startsWith("#") ? coord.slice(1) : coord).split(DOUBLING_RAW).join(DOUBLING_TOK);
  return "M" + body.split("-").map(frameSeg).join("-");
}
const fileId = (canon) => canon.replace(/\//g, "∕"); // '∕' U+2215 — filesystem/wikilink-safe stand-in for '/'
const coordRef = (canon) => `[[${fileId(canon)}]]`;

// ---- # form hierarchy helpers (datasets + relations are in '#' form) ----
const SEP = (ch) => ch === "-" || ch === "." || ch === "/";
function isPrefixAnc(anc, c) {
  return c.length > anc.length && c.startsWith(anc) && SEP(c[anc.length]);
}
function stripRaw(c) {
  // drop the last separator-delimited token (works on bare '#' form, where frames are not parenthesised)
  let last = -1;
  for (let i = 0; i < c.length; i++) if (SEP(c[i])) last = i;
  return last > 0 ? c.slice(0, last) : null;
}

const pithy = (s, max = 240) => {
  const one = String(s || "").replace(/\s+/g, " ").trim();
  return one.length > max ? one.slice(0, max - 1) + "…" : one;
};

function readJson(p) { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return []; } }
// deep files carry a BOM + raw control chars inside string literals (not strict JSON).
function readJsonLenient(p) {
  if (!fs.existsSync(p)) return [];
  const s = fs.readFileSync(p, "utf8").replace(/^﻿/, "");
  let out = "", inStr = false, esc = false;
  for (const ch of s) {
    if (esc) { out += ch; esc = false; continue; }
    if (ch === "\\") { out += ch; esc = true; continue; }
    if (ch === '"') { inStr = !inStr; out += ch; continue; }
    if (inStr) { const c = ch.charCodeAt(0); if (c === 10) { out += "\\n"; continue; } if (c === 13) { out += "\\r"; continue; } if (c === 9) { out += "\\t"; continue; } if (c < 32) { out += " "; continue; } }
    out += ch;
  }
  try { return JSON.parse(out); } catch { return []; }
}
const loadNodes = (branchKey) => {
  for (const f of NODE_FILES) { const p = path.join(DATASETS, `${branchKey}-deep`, f); if (fs.existsSync(p)) { const a = readJsonLenient(p); if (a.length) return a; } }
  return readJson(path.join(DATASETS, "low-detail", `nodes_${branchKey}.json`)); // fallback
};

// ---- live Neo4j q_ register fetch (Track 45 — the psychoid quaternal layer) ----
// The deep JSON snapshots predate the q_{n}_{semantic} enrichment, which lives ONLY in the live
// graph (already in canonical 'M' form, so it joins directly on canonical(coord)). We pull every
// q_-bearing node once at startup into canonicalCoord -> {q_key: value}. Reads the same REST tx
// endpoint fetch_bimba.py uses; offline / no-graph runs degrade gracefully to an empty map (no q_
// section, existing output unchanged). Override host with EPI_NEO4J_URL / -USER / -PASS.
const NEO4J_URL = process.env.EPI_NEO4J_URL || "http://localhost:7474/db/neo4j/tx/commit";
const NEO4J_USER = process.env.EPI_NEO4J_USER || "neo4j";
const NEO4J_PASS = process.env.EPI_NEO4J_PASS || "password";
async function fetchQRegisters() {
  const out = new Map(); // canonical coord -> { q_key: value }
  const cypher =
    "MATCH (n) WHERE n.coordinate IS NOT NULL AND any(k IN keys(n) WHERE k STARTS WITH 'q_') " +
    "RETURN n.coordinate AS coordinate, " +
    "[k IN keys(n) WHERE k STARTS WITH 'q_' | [k, n[k]]] AS qregs";
  try {
    const auth = "Basic " + Buffer.from(`${NEO4J_USER}:${NEO4J_PASS}`).toString("base64");
    const resp = await fetch(NEO4J_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: auth },
      body: JSON.stringify({ statements: [{ statement: cypher }] }),
      signal: AbortSignal.timeout(15000),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = await resp.json();
    if (json.errors && json.errors.length) throw new Error(json.errors[0].message || "neo4j error");
    const data = json.results?.[0]?.data || [];
    for (const { row } of data) {
      const coord = row[0]; // already canonical 'M' form in the live graph
      if (!coord) continue;
      const regs = {};
      for (const [k, v] of row[1] || []) if (v != null && String(v).trim()) regs[k] = v;
      if (Object.keys(regs).length) out.set(coord, regs);
    }
    console.error(`[q_] fetched quaternal registers for ${out.size} coordinate(s) from ${NEO4J_URL}`);
  } catch (e) {
    console.error(`[q_] live Neo4j unavailable (${e.message}) — projecting WITHOUT q_ registers. ` +
      `Set EPI_NEO4J_URL/USER/PASS or start the graph, then re-run to surface them.`);
  }
  return out;
}
const Q_REGISTERS = await fetchQRegisters();

// q-key sort: by position digit (q_0..q_5), then by the full key (groups variant registers per
// position deterministically). Returns the rendered section lines for a canonical coordinate.
const Q_POS = (k) => { const m = /^q_(\d+)_/.exec(k); return m ? Number(m[1]) : 99; };
function renderQuaternal(canon) {
  const regs = Q_REGISTERS.get(canon);
  if (!regs) return [];
  const keys = Object.keys(regs).sort((a, b) => (Q_POS(a) - Q_POS(b)) || (a < b ? -1 : a > b ? 1 : 0));
  if (!keys.length) return [];
  const lines = ["## Quaternal Register",
    "*Psychoid `q_{n}_{semantic}` registers (position-ordered q_0..q_5), projected live from the Bimba graph.*", ""];
  for (const k of keys) lines.push(`- **${k}:** ${fmtVal(regs[k], 1200)}`);
  lines.push("");
  return lines;
}

// ---- node content rendering (rich, but curated + bounded) ----
const CONTENT_FIELDS = [
  ["description", "Description"], ["operationalEssence", "Operational essence"],
  ["operationalSymbolics", "Operational symbolics"], ["symbol", "Symbol"],
  ["completeFormulation", "Complete formulation"], ["formulation", "Formulation"],
  ["formulationBreakdown", "Formulation breakdown"], ["internalStructure", "Internal structure"],
  ["structure", "Structure"], ["consciousnessStructure", "Consciousness structure"],
  ["keyPrinciples", "Key principles"], ["architecturalFunction", "Architectural function"],
  ["philosophicalFoundation", "Philosophical foundation"], ["practicalApplications", "Practical applications"],
  ["resonances", "Resonances"], ["qlCategory", "QL category"], ["qlPosition", "QL position"],
  ["qlOperatorTypes", "QL operator types"], ["contextFrame", "Context frame"],
];
function fmtVal(v, max = 600) {
  if (Array.isArray(v)) v = v.map((x) => (x && typeof x === "object" ? JSON.stringify(x) : String(x))).join("; ");
  else if (v && typeof v === "object") v = JSON.stringify(v);
  else v = String(v);
  v = v.replace(/\s+/g, " ").trim();
  return v.length > max ? v.slice(0, max - 1) + "…" : v;
}
function renderContent(fp, skipKeys) {
  const lines = [];
  for (const [k, label] of CONTENT_FIELDS) {
    if (skipKeys.has(k) || fp[k] == null) continue;
    const val = fmtVal(fp[k]); if (!val) continue;
    lines.push(`- **${label}:** ${val}`);
  }
  return lines;
}

const REL_PROP_PRIORITY = ["relationship", "connection_type", "relationshipType", "type", "resonanceType", "mathematical_basis", "mathematicalEssence", "significance", "insight", "description"];
const REL_PROP_SKIP = new Set(["createdAt"]);
function renderRelProps(props) {
  const keys = Object.keys(props || {}).filter((k) => !REL_PROP_SKIP.has(k) && props[k] != null && String(props[k]).trim());
  keys.sort((a, b) => { const ia = REL_PROP_PRIORITY.indexOf(a), ib = REL_PROP_PRIORITY.indexOf(b); return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib); });
  const shown = keys.slice(0, 8);
  const lines = shown.map((k) => { let v = String(props[k]).replace(/\s+/g, " ").trim(); if (v.length > 200) v = v.slice(0, 197) + "…"; return `  - ${k}: ${v}`; });
  if (keys.length > shown.length) lines.push(`  - *(+${keys.length - shown.length} more props in graph)*`);
  return lines;
}

const summary = [];

for (const br of BRANCHES) {
  const rawNodes = loadNodes(br.key);
  if (!rawNodes.length) { summary.push(`M${br.n} ${br.name}: no nodes file — skipped`); continue; }
  const branchRaw = `#${br.n}`;

  // node index in '#' form -> {coordinate, fp(filteredProps)}
  const nodes = rawNodes
    .map((x) => ({ raw: x.coordinate || (x.filteredProps && x.filteredProps.bimbaCoordinate), fp: x.filteredProps || x }))
    .filter((x) => x.raw);
  const byRaw = new Map(nodes.map((x) => [x.raw, x]));
  const rawSet = new Set(nodes.map((x) => x.raw));

  // relations (rich deep; low-detail fallback), '#' form preserved.
  let rels = readJsonLenient(path.join(DATASETS, `${br.key}-deep`, "relations.json"))
    .map((r) => ({ source: r.source, relType: r.relType || r.type, target: r.target ?? null, props: r.relProperties || {} }));
  if (!rels.length) rels = readJson(path.join(DATASETS, "low-detail", `relations_${br.key}.json`))
    .map((r) => ({ source: r.source, relType: r.type, target: r.target ?? null, props: {} }));
  rels = rels.filter((r) => r.source && r.relType);

  // STRUCTURAL containment only — the children relation. `HAS_INTERNAL_COMPONENT` is the canonical
  // one; the explicit `HAS_*` / `CONTAINS_*` family covers domain groupings (HAS_ASPECT, CONTAINS_TATTVA,
  // HAS_SUB_LENS, HAS_TRIGRAM, …). SEMANTIC verbs (PROVIDES_*, GENERATES, INITIATES, DEVELOPS_INTO, …) are
  // NOT containment even when they connect nested coords — including them over-nests the context frames.
  const isContainType = (ty) => ty === "HAS_INTERNAL_COMPONENT" || /^(HAS_|CONTAINS_)/.test(ty);
  const hicIn = new Map(), otherIn = new Map(); // incoming structural edges, source must be a coord-ancestor
  const containTypesSeen = new Set();
  for (const r of rels) {
    if (!r.target || !isPrefixAnc(r.source, r.target) || !isContainType(r.relType)) continue;
    containTypesSeen.add(r.relType);
    const bucket = r.relType === "HAS_INTERNAL_COMPONENT" ? hicIn : otherIn;
    (bucket.get(r.target) || bucket.set(r.target, []).get(r.target)).push(r.source);
  }

  // parent (raw): closest HAS_INTERNAL_COMPONENT ancestor; else closest other-containment ancestor;
  // else string nearest-ancestor; else branch. "closest" = longest coordinate prefix.
  const parentMemo = new Map();
  function parentRaw(c) {
    if (parentMemo.has(c)) return parentMemo.get(c);
    let p = null;
    for (const m of [hicIn, otherIn]) {
      if (p) break;
      const ins = (m.get(c) || []).filter((s) => rawSet.has(s));
      if (ins.length) p = ins.sort((a, b) => b.length - a.length)[0];
    }
    if (!p) { let a = stripRaw(c); while (a && a !== branchRaw && !rawSet.has(a)) a = stripRaw(a); p = a; }
    if (!p) p = branchRaw;
    parentMemo.set(c, p);
    return p;
  }
  // tree-depth = hops from branch along parent chain (memoised, cycle-guarded).
  const depthMemo = new Map();
  function treeDepth(c) {
    if (c === branchRaw) return 0;
    if (depthMemo.has(c)) return depthMemo.get(c);
    depthMemo.set(c, Infinity); // cycle guard
    const p = parentRaw(c);
    const d = p && p !== c ? treeDepth(p) + 1 : 1;
    depthMemo.set(c, d);
    return d;
  }

  // projected set + child map.
  const project = nodes.map((x) => x.raw).filter((c) => { const d = treeDepth(c); return d >= 1 && d <= MAX_DEPTH; });
  const projectedSet = new Set(project);
  const childrenProjected = new Map(), childrenAll = new Map();
  for (const x of nodes) { const p = parentRaw(x.raw); if (p) (childrenAll.get(p) || childrenAll.set(p, []).get(p)).push(x.raw); }
  for (const c of project) { const p = parentRaw(c); (childrenProjected.get(p) || childrenProjected.set(p, []).get(p)).push(c); }
  const isParent = (c) => (childrenProjected.get(c) || []).length > 0;

  // relation edges by endpoint (raw).
  const relsBySource = new Map(), relsByTarget = new Map();
  for (const r of rels) { (relsBySource.get(r.source) || relsBySource.set(r.source, []).get(r.source)).push(r); if (r.target) (relsByTarget.get(r.target) || relsByTarget.set(r.target, []).get(r.target)).push(r); }

  // file path mirrors the (containment) hierarchy.
  function relPathFor(c) {
    const chain = []; let cur = c;
    while (cur && cur !== branchRaw) { chain.unshift(cur); cur = parentRaw(cur); }
    const dirs = chain.slice(0, -1).map((x) => fileId(canonical(x)));
    const self = fileId(canonical(c));
    const leaf = isParent(c) ? path.join(self, `${self}.md`) : `${self}.md`;
    return path.join(`M${br.n}`, ...dirs, leaf);
  }

  const branchDir = path.join(MAP_ROOT, `M${br.n}`);
  if (!DRY) { fs.rmSync(branchDir, { recursive: true, force: true }); fs.mkdirSync(branchDir, { recursive: true }); }

  let written = 0, frames = 0;
  for (const raw of project) {
    const node = byRaw.get(raw), fp = node.fp;
    const canon = canonical(raw), name = fp.name || canon;
    if (canon.includes("(")) frames++;
    const parent = parentRaw(raw);

    const kids = (childrenProjected.get(raw) || []).map(canonical);
    const kidsDeeper = (childrenAll.get(raw) || []).length - (childrenProjected.get(raw) || []).length;

    const edgeSeen = new Set();
    const edges = [...(relsBySource.get(raw) || []), ...(relsByTarget.get(raw) || [])].filter((e) => { const k = `${e.source}|${e.relType}|${e.target}`; if (edgeSeen.has(k)) return false; edgeSeen.add(k); return true; });

    const relatedUniq = [...new Set([
      ...kids.map(coordRef),
      ...edges.map((e) => (e.source === raw ? e.target : e.source)).filter((c) => c && c !== raw).map((c) => coordRef(canonical(c))),
    ])].slice(0, 24);

    // lead summary + content
    const leadKey = fp.essence ? "essence" : fp.coreNature ? "coreNature" : "description";
    const lead = pithy(fp.essence || fp.coreNature || fp.description || "");
    const content = renderContent(fp, new Set([leadKey, "essence", "coreNature"]));

    const fm = [
      "---",
      `coordinate: ${yaml(canon)}`,
      `c_4_artifact_role: "map-index"`,
      `title: ${yaml(name)}`,
      `c_0_source_coordinates: [${parent && parent !== branchRaw ? yaml(coordRef(canonical(parent))) : yaml(`[[M${br.n}]]`)}]`,
      `c_0_related_coordinates: [${relatedUniq.map(yaml).join(", ")}]`,
      `c_3_projected_from: "Idea/Bimba/Map/datasets/${br.key}-deep"`,
      `c_3_projected_at: "${PROJECTED_AT}"`,
      `c_4_graph_node: ${yaml(`neo4j://Bimba/${canon}`)}`,
      "---",
    ].join("\n");

    const body = [`# ${canon} · ${name}`.trim(), ""];
    if (lead) body.push(`> ${lead}`, "");
    if (content.length) { body.push("## Detail"); body.push(...content); body.push(""); }
    body.push(...renderQuaternal(canon)); // q_ register (live-graph, no-op when absent/offline)
    if (kids.length || kidsDeeper > 0) {
      body.push("## Contains");
      if (kids.length) body.push(kids.map(coordRef).join(" · "));
      if (kidsDeeper > 0) body.push(`*(+${kidsDeeper} deeper ${kidsDeeper === 1 ? "child" : "children"} in Neo4j — beyond projection depth)*`);
      body.push("");
    }
    if (edges.length) {
      body.push(`## Relations (${edges.length})`);
      body.push("*Each line: `[[source]] - [[relation_type]] - [[target]]`; relation types are wikilinks, so their backlinks index every edge of that type across the map.*", "");
      for (const e of edges) {
        const s = coordRef(canonical(e.source)), t = e.target ? coordRef(canonical(e.target)) : null;
        body.push(t ? `- ${s} - [[${e.relType}]] - ${t}` : `- ${s} - [[${e.relType}]]`);
        body.push(...renderRelProps(e.props));
      }
      body.push("");
    }
    const enr = ENRICH_NODE[raw] || [];
    if (enr.length) { body.push("## See also (canonical enrichment — do not overwrite)"); for (const e of enr) body.push(`- [[${e}]]`); body.push(""); }
    body.push("## Full node", `\`graph_context ${canon}\` · backing data: [[${br.key}-deep]]`, "");

    if (!DRY) { const abs = path.join(MAP_ROOT, relPathFor(raw)); fs.mkdirSync(path.dirname(abs), { recursive: true }); fs.writeFileSync(abs, fm + "\n\n" + body.join("\n")); }
    written++;
  }

  // branch AGENTS.md (DOX + OKF index node)
  const branchNode = byRaw.get(branchRaw);
  const depth1 = project.filter((c) => treeDepth(c) === 1).map(canonical);
  const enrBranch = ENRICH_BRANCH[br.n] || [];
  const agents = [
    `# AGENTS.md — Map / M${br.n} ${br.name}`, "",
    "## Purpose",
    `Generated pithy index of the M${br.n} ${br.name} graph branch — a Neo4j→repo *reflection* (Track 45), not crystallised canon.${branchNode ? " " + pithy(branchNode.fp.essence || branchNode.fp.coreNature || branchNode.fp.description) : ""}`,
    `Canon: [[M${br.n}]] (World Form) -> [[M-SYSTEM-INDEX]]; design: [[45-bimba-map-indexing-and-dox-okf-unification]].`, "",
    "## Ownership",
    `- Pithy \`map-index\` nodes for M${br.n} descendants, tree-depth ≤ ${MAX_DEPTH} (${written} nodes). **The folder tree mirrors the children relation** (containment edges, e.g. HAS_INTERNAL_COMPONENT) — a coord with children is a folder + \`{coord}.md\` folder-note. Each node = content detail + \`Contains\` + a full \`Relations\` index + a Neo4j pointer.`,
    `- Context-frame coords (e.g. \`M${br.n}-(0/1)\`) render \`/\` as \`∕\` in file/link names; \`coordinate:\` + the graph pointer keep the true \`/\`. Nest under their containment parent (e.g. \`M0-(4.0/1)\` lives under \`M0-4\`).`,
    `- Does NOT own canon meaning — that is the [[M${br.n}]] Form + its [[Seeds]] specs. Full detail lives in Neo4j + \`datasets/${br.key}-deep/\` (legacy \`#\`-tagged source).`, "",
    "## Local Contracts",
    `- Projector: \`Idea/Bimba/Map/datasets/scripts/project-map-index.mjs\`. Source: \`datasets/${br.key}-deep/\` (nodes + relations). Graph: \`neo4j://Bimba/M${br.n}\`.`, "",
    "## Work Guidance",
    "- Generated — do NOT hand-edit nodes; change the graph/source and re-run the projector.",
    "- `[[wikilink]]` is the navigation contract; every coordinate node is a resolvable page.",
    ...(enrBranch.length ? [`- Canonical enrichment (never overwrite): ${enrBranch.map((e) => `[[${e}]]`).join(", ")}.`] : []), "",
    "## Verification",
    "- `bimba-vault-validate` over this directory (map-index role, Map/** residency).", "",
    "## Child DOX Index (= OKF concept index)",
    depth1.length ? `- Entry coordinates: ${depth1.map(coordRef).join(" · ")}` : `- (flat) — ${written} nodes in this directory.`, "",
  ].join("\n");
  if (!DRY) fs.writeFileSync(path.join(branchDir, "AGENTS.md"), agents);

  summary.push(`M${br.n} ${br.name}: ${written} nodes (tree-depth≤${MAX_DEPTH}, ${frames} context-frame), ${nodes.length} in graph; structural relTypes: ${containTypesSeen.size}`);
}

console.log((DRY ? "[DRY RUN] " : "") + `Projected /map index (max-depth=${MAX_DEPTH}, hierarchy = children relation)`);
for (const s of summary) console.log("  " + s);
