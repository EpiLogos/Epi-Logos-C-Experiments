import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const repoRoot = "/Users/admin/Documents/Epi-Logos C Experiments";
const validatorPath = join(repoRoot, "Body/M/epi-theia/extensions/scripts/validate-no-modal-discipline.mjs");

function makeFixture() {
  const root = mkdtempSync(join(tmpdir(), "epi-no-modal-"));
  mkdirSync(join(root, "review", "src"), { recursive: true });
  mkdirSync(join(root, "normal", "src"), { recursive: true });
  return root;
}

function runValidator(root) {
  return spawnSync(process.execPath, [validatorPath, "--extensions-root", root], {
    cwd: repoRoot,
    encoding: "utf8"
  });
}

test("no-modal validator accepts inline review surfaces without forbidden dialogs", () => {
  const root = makeFixture();
  try {
    writeFileSync(
      join(root, "review", "src", "panel.ts"),
      [
        "// @epi-logos:context=review",
        "export function renderReview() {",
        "  return 'inline evidence panel';",
        "}"
      ].join("\n")
    );

    const result = runValidator(root);

    assert.equal(result.status, 0, result.stderr || result.stdout);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("no-modal validator rejects MessageBox.show in review code paths", () => {
  const root = makeFixture();
  try {
    writeFileSync(
      join(root, "review", "src", "panel.ts"),
      [
        "import { MessageBox } from '@theia/core/lib/browser';",
        "export function renderReview() {",
        "  MessageBox.show('blocked modal');",
        "}"
      ].join("\n")
    );

    const result = runValidator(root);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /MessageBox\.show/);
    assert.match(result.stderr, /review\/src\/panel\.ts/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("no-modal validator ignores modal-looking calls outside governed paths", () => {
  const root = makeFixture();
  try {
    writeFileSync(
      join(root, "normal", "src", "diagnostic.ts"),
      "export const sample = () => window.alert('not in governed context');\n"
    );

    const result = runValidator(root);

    assert.equal(result.status, 0, result.stderr || result.stdout);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
