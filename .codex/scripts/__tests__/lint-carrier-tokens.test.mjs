import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { scanSource, scanTree, stripComments } from "../lint-carrier-tokens.mjs";

// Behavioral: real planted fixture trees, no mocks.
function plantCarrier() {
  const root = mkdtempSync(join(tmpdir(), "carrier-tokens-"));
  mkdirSync(join(root, "components"), { recursive: true });
  mkdirSync(join(root, "ui"), { recursive: true });
  writeFileSync(
    join(root, "styles.css"),
    ":root { --accent: #ebdca0; --pulse: 200ms; font-size: 13px; }\n",
  );
  writeFileSync(
    join(root, "ui", "tokens.ts"),
    "export const ringLit = '#ebdca0';\nexport const pulseMs = '200ms';\n",
  );
  return root;
}

test("a planted raw-hex fixture outside the token source FAILS the scan", () => {
  const root = plantCarrier();
  writeFileSync(
    join(root, "components", "Bad.tsx"),
    "export const bad = { color: '#ebdca0' };\n",
  );
  const findings = scanTree(root);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].kind, "raw-hex-color");
  assert.equal(findings[0].file, join("components", "Bad.tsx"));
  assert.equal(findings[0].line, 1);
});

test("the token sources (styles.css + ui/tokens.ts) are the permitted definition sites", () => {
  const root = plantCarrier();
  writeFileSync(
    join(root, "components", "Clean.tsx"),
    "export const clean = { color: 'var(--accent)' };\n",
  );
  // plantCarrier already writes raw values into BOTH token sources — neither
  // may produce a finding; everything else stays clean.
  assert.deepEqual(scanTree(root), []);
});

test("test files are exempt — tests assert values, they don't render", () => {
  const root = plantCarrier();
  writeFileSync(
    join(root, "components", "Bad.test.tsx"),
    "expect(colour).toBe('#8f6fd8'); expect(msg).toContain('1500ms');\n",
  );
  writeFileSync(
    join(root, "components", "bad.spec.ts"),
    "expect(css).toBe('#9b7a4b');\n",
  );
  assert.deepEqual(scanTree(root), []);
  // ...but a non-test neighbour with the same content IS a finding
  writeFileSync(
    join(root, "components", "BadForReal.tsx"),
    "export const c = '#8f6fd8';\n",
  );
  assert.equal(scanTree(root).length, 1);
});

test("raw font-size px and raw ms durations are findings in any src file", () => {
  const cssish = ".x { font-size: 12px; transition: opacity 150ms; }";
  const kinds = scanSource(cssish, "panes/x.css").map((f) => f.kind).sort();
  assert.deepEqual(kinds, ["raw-font-size-px", "raw-ms-duration"]);
  // React inline style: string px and implicit-px numeric both count
  const jsx = "const s = { fontSize: '11px' }; const t = { fontSize: 14 };";
  assert.deepEqual(
    scanSource(jsx, "components/y.tsx").map((f) => f.kind),
    ["raw-font-size-px", "raw-font-size-px"],
  );
});

test("comments are stripped (prose about a value is not consumption), strings are not", () => {
  const text = [
    "// legacy accent was #ff00ff and folds took 300ms",
    "/* font-size: 99px */",
    "const consumed = '#ff00ff';",
  ].join("\n");
  const findings = scanSource(text, "engine/z.ts");
  assert.equal(findings.length, 1);
  assert.deepEqual(
    { line: findings[0].line, kind: findings[0].kind },
    { line: 3, kind: "raw-hex-color" },
  );
  // stripComments keeps line structure so findings stay line-accurate
  assert.equal(stripComments(text).split("\n").length, 3);
  // protocol separators are not line comments
  assert.match(stripComments("const u = 'http://x/#abc';"), /#abc/);
});
