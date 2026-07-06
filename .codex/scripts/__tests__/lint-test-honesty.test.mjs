import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  classifyTestBlocks,
  lintEvidenceString,
  lintTestFile,
  lintPlanEvidence,
  lintRustSource,
  lintPythonSource,
  lintCSource,
  collectPolyglotFiles,
  BANNED_EVIDENCE_PATTERNS,
} from "../lint-test-honesty.mjs";

function tmpFile(name, content) {
  const dir = mkdtempSync(join(tmpdir(), "honesty-lint-"));
  const file = join(dir, name);
  writeFileSync(file, content);
  return file;
}

// --- test-file lint ---------------------------------------------------------

test("a source-grep-only test is rejected", () => {
  const file = tmpFile(
    "grep-only.test.ts",
    `import { readFileSync } from 'node:fs';
import { it, expect } from 'vitest';
it('asserts the contract string exists in the source', () => {
  const source = readFileSync('src/widget.ts', 'utf8');
  expect(source).toContain('registerWidget');
});
`,
  );
  const findings = lintTestFile(file);
  assert.equal(findings.length, 1);
  assert.match(findings[0].reason, /source-grep|file-content/i);
});

test("a file-existence-only test is rejected", () => {
  const file = tmpFile(
    "exists-only.test.ts",
    `import { existsSync } from 'node:fs';
import { it, expect } from 'vitest';
it('asserts the module file exists', () => {
  expect(existsSync('src/engine/cymaticField.ts')).toBe(true);
});
`,
  );
  const findings = lintTestFile(file);
  assert.equal(findings.length, 1);
  assert.match(findings[0].reason, /file-existence/i);
});

test("a test-count-only test is rejected", () => {
  const file = tmpFile(
    "count-only.test.ts",
    `import { it, expect } from 'vitest';
import { readdirSync } from 'node:fs';
it('asserts there are 24 test files', () => {
  expect(readdirSync('src').filter(f => f.endsWith('.test.ts')).length).toBe(24);
});
`,
  );
  const findings = lintTestFile(file);
  assert.equal(findings.length, 1);
  assert.match(findings[0].reason, /test-count|file-count/i);
});

test("a behavioral test that also reads a file passes", () => {
  const file = tmpFile(
    "behavioral.test.ts",
    `import { it, expect } from 'vitest';
import { computeCharges } from './charges';
it('computes charge sum over the real kernel table', () => {
  const charges = computeCharges();
  expect(charges.reduce((a, b) => a + b.pp, 0)).toBe(360);
});
`,
  );
  assert.deepEqual(lintTestFile(file), []);
});

test("an allowlisted structural test passes with a justification", () => {
  const file = tmpFile(
    "structural.test.ts",
    `import { readFileSync } from 'node:fs';
import { it, expect } from 'vitest';
it('coordinate header present', () => {
  const source = readFileSync('src/lib.rs', 'utf8');
  expect(source).toContain('Coordinate:');
});
`,
  );
  const allowlist = [
    {
      file,
      test: "coordinate header present",
      justification: "43.2 coordinate-header convention is a genuinely structural contract",
    },
  ];
  assert.deepEqual(lintTestFile(file, { allowlist }), []);
  // allowlist entries without a justification are themselves rejected
  assert.throws(
    () => lintTestFile(file, { allowlist: [{ file, test: "coordinate header present" }] }),
    /justification/i,
  );
});

test("classifyTestBlocks splits vitest and node:test blocks", () => {
  const blocks = classifyTestBlocks(`
it('one', () => { expect(1).toBe(1); });
test("two", () => { assert.equal(2, 2); });
`);
  assert.equal(blocks.length, 2);
  assert.equal(blocks[0].name, "one");
  assert.equal(blocks[1].name, "two");
});

// --- evidence lint ----------------------------------------------------------

test("banned evidence classes are refused", () => {
  for (const evidence of [
    "design only — no code needed",
    "Deferred to a later tranche",
    "direct close per plan",
    "verified: file exists at src/engine/cymaticField.ts",
    "grep shows the string is present in the manifest",
  ]) {
    const verdict = lintEvidenceString(evidence);
    assert.equal(verdict.ok, false, `should refuse: ${evidence}`);
  }
});

test("real behavioral evidence passes", () => {
  const verdict = lintEvidenceString(
    "verify-all table: epi-lib 8451 PASS · portal-core 266 PASS; live-wire PASS 5 profiles 4 chimes strict-parsed; broke test_m_canonical → exit 1, reverted",
  );
  assert.equal(verdict.ok, true);
});

test("lintPlanEvidence flags done tasks whose evidence carries a banned class", () => {
  const dir = mkdtempSync(join(tmpdir(), "honesty-plan-"));
  const statePath = join(dir, "plan.state.json");
  writeFileSync(
    statePath,
    JSON.stringify({
      tasks: {
        "01.T1": { status: "done", evidence: ["design only, no verification needed"] },
        "01.T2": { status: "done", evidence: ["ran cargo test: 246 passed, live gateway frames captured"] },
        "01.T3": { status: "pending", evidence: [] },
      },
    }),
  );
  const findings = lintPlanEvidence(statePath);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].taskId, "01.T1");
});

// --- polyglot lint (hardening T16) -------------------------------------------

test("a planted assert!(true)-only Rust test is rejected", () => {
  const findings = lintRustSource(
    "planted.rs",
    `#[test]
fn kernel_energy_is_canonical() {
    assert!(true);
}
`,
  );
  assert.equal(findings.length, 1);
  assert.match(findings[0].reason, /trivially-true/);
});

test("a self-equal assert_eq! and a blanket #[ignore] are rejected; real asserts pass", () => {
  const findings = lintRustSource(
    "drifted.rs",
    `#[test]
fn suit_integrals() {
    assert_eq!(SUIT_TOTAL, SUIT_TOTAL);
}
#[ignore]
#[test]
fn live_thing() {
    assert_eq!(compute_total(), 360);
}
`,
  );
  assert.equal(findings.length, 2);
  assert.match(findings[0].reason, /self-equal/);
  assert.match(findings[1].reason, /blanket #\[ignore\]/);
  // a reasoned fence and a real assertion produce no findings
  assert.deepEqual(
    lintRustSource(
      "honest.rs",
      `#[ignore = "live-infra: requires running Redis"]
#[test]
fn live_redis_round_trip() {
    assert_eq!(tiered_get("k"), Some("v".into()));
}
`,
    ),
    [],
  );
  // a self-equal CALL is the determinism idiom, not fraud
  assert.deepEqual(
    lintRustSource(
      "determinism.rs",
      `#[test]
fn hashing_is_deterministic() {
    assert_eq!(hash_text("hello"), hash_text("hello"));
}
`,
    ),
    [],
  );
});

test("Python `assert True` and reasonless skip are rejected; reasoned skipif passes", () => {
  const findings = lintPythonSource(
    "planted.py",
    `def test_ingest():
    assert True

@pytest.mark.skip()
def test_query():
    assert run_query("x") == []
`,
  );
  assert.equal(findings.length, 2);
  assert.match(findings[0].reason, /trivially-true/);
  assert.match(findings[1].reason, /skip without a reason/);
  assert.deepEqual(
    lintPythonSource(
      "honest.py",
      `_skip_neo4j = pytest.mark.skipif(_SKIP, reason="SKIP_NEO4J_TESTS is set")
def test_enrich():
    assert enrich("node").coordinate == "#4.4"
`,
    ),
    [],
  );
});

test("a literal-true C assert is rejected; a computed assert passes", () => {
  const findings = lintCSource("planted.c", "void test_m3(void) {\n  assert(1);\n}\n");
  assert.equal(findings.length, 1);
  assert.match(findings[0].reason, /trivially-true/);
  assert.deepEqual(
    lintCSource("honest.c", "void test_m3(void) {\n  assert(m3_suit_integral_sum() == 360);\n}\n"),
    [],
  );
});

test("collectPolyglotFiles walks planted roots and skips vendor/target", () => {
  const root = mkdtempSync(join(tmpdir(), "polyglot-roots-"));
  mkdirSync(join(root, "crate", "tests"), { recursive: true });
  mkdirSync(join(root, "crate", "target"), { recursive: true });
  mkdirSync(join(root, "crate", "vendor"), { recursive: true });
  writeFileSync(join(root, "crate", "tests", "real.rs"), "#[test] fn t() { assert_eq!(f(), 1); }");
  writeFileSync(join(root, "crate", "target", "built.rs"), "#[ignore]");
  writeFileSync(join(root, "crate", "vendor", "dep.rs"), "#[ignore]");
  const files = collectPolyglotFiles({ rust: [root], python: [], c: [] });
  assert.deepEqual(files.rust, [join(root, "crate", "tests", "real.rs")]);
});

test("banned pattern list covers the charter's named classes", () => {
  const banned = BANNED_EVIDENCE_PATTERNS.map((p) => String(p));
  for (const cls of ["design only", "deferred", "direct close"]) {
    assert.ok(
      banned.some((p) => p.toLowerCase().includes(cls.split(" ")[0])),
      `missing banned class ${cls}`,
    );
  }
});
