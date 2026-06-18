import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const repoRoot = "/Users/admin/Documents/Epi-Logos C Experiments";
const validatorPath = join(repoRoot, "Body/M/epi-theia/extensions/scripts/validate-keybinding-chord-uniqueness.mjs");

function makeFixture() {
  const root = mkdtempSync(join(tmpdir(), "epi-keybindings-"));
  mkdirSync(join(root, "alpha", "src", "browser"), { recursive: true });
  mkdirSync(join(root, "beta", "src", "browser"), { recursive: true });
  mkdirSync(join(root, "contracts"), { recursive: true });
  writeFileSync(
    join(root, "contracts", "chrome-contributions-catalog.json"),
    JSON.stringify(
      {
        keybindings: [
          {
            id: "alpha.open.cmd-shift-d",
            commandId: "alpha.open",
            keybinding: "cmd+shift+d",
            declaringTranche: "31.fixture"
          },
          {
            id: "beta.open.cmd-shift-d",
            commandId: "beta.open",
            keybinding: "cmd+shift+d",
            when: "betaFocus",
            declaringTranche: "31.fixture"
          }
        ]
      },
      null,
      2
    )
  );
  return root;
}

function writeModule(root, extension, source) {
  writeFileSync(join(root, extension, "src", "browser", "frontend-module.ts"), source);
}

function runValidator(root) {
  return spawnSync(
    process.execPath,
    [
      validatorPath,
      "--extensions-root",
      root,
      "--catalog",
      join(root, "contracts", "chrome-contributions-catalog.json")
    ],
    { cwd: repoRoot, encoding: "utf8" }
  );
}

test("keybinding validator accepts duplicate chords under different when clauses", () => {
  const root = makeFixture();
  try {
    writeModule(
      root,
      "alpha",
      "registerKeybindings(keybindings) { keybindings.registerKeybinding({ command: 'alpha.open', keybinding: 'cmd+shift+d' }); }"
    );
    writeModule(
      root,
      "beta",
      "registerKeybindings(keybindings) { keybindings.registerKeybinding({ command: 'beta.open', keybinding: 'cmd+shift+d', when: 'betaFocus' }); }"
    );

    const result = runValidator(root);

    assert.equal(result.status, 0, result.stderr || result.stdout);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("keybinding validator rejects duplicate chord and when pairs", () => {
  const root = makeFixture();
  try {
    writeModule(
      root,
      "alpha",
      "registerKeybindings(keybindings) { keybindings.registerKeybinding({ command: 'alpha.open', keybinding: 'cmd+shift+d' }); }"
    );
    writeModule(
      root,
      "beta",
      "registerKeybindings(keybindings) { keybindings.registerKeybinding({ command: 'beta.open', keybinding: 'cmd+shift+d' }); }"
    );

    const result = runValidator(root);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /cmd\+shift\+d/);
    assert.match(result.stderr, /alpha\.open/);
    assert.match(result.stderr, /beta\.open/);
    assert.match(result.stderr, /31\.fixture/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
