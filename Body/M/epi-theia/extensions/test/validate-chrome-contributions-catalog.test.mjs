import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const repoRoot = "/Users/admin/Documents/Epi-Logos C Experiments";
const validatorPath = join(repoRoot, "Body/M/epi-theia/extensions/scripts/validate-chrome-contributions-catalog.mjs");

function makeFixture() {
  const root = mkdtempSync(join(tmpdir(), "epi-catalog-"));
  mkdirSync(join(root, "alpha", "src", "browser"), { recursive: true });
  mkdirSync(join(root, "contracts"), { recursive: true });
  writeCatalog(root, {});
  writeModule(root, "");
  return root;
}

function writeCatalog(root, overrides) {
  const catalog = {
    commands: [
      {
        id: "alpha.open",
        owningExtension: "alpha",
        type: "command",
        declaringTranche: "31.fixture"
      }
    ],
    keybindings: [
      {
        id: "alpha.open.cmd-shift-a",
        owningExtension: "alpha",
        type: "keybinding",
        commandId: "alpha.open",
        keybinding: "cmd+shift+a",
        declaringTranche: "31.fixture"
      }
    ],
    menuItems: [
      {
        id: "alpha.menu.open",
        owningExtension: "alpha",
        type: "menu-item",
        commandId: "alpha.open",
        declaringTranche: "31.fixture"
      }
    ],
    preferences: [
      {
        id: "alpha.pref",
        owningExtension: "alpha",
        type: "preference",
        declaringTranche: "31.fixture"
      }
    ],
    statusBarEntries: [
      {
        id: "pratibimba.state-thread.active-coordinate",
        owningExtension: "alpha",
        type: "status-bar",
        declaringTranche: "31.fixture"
      }
    ],
    intentTargets: [
      {
        id: "alpha.panel",
        owningExtension: "alpha",
        type: "intent-target",
        extensionId: "alpha",
        requestedContributionId: "panel",
        declaringTranche: "31.fixture"
      }
    ],
    ...overrides
  };
  writeFileSync(join(root, "contracts", "chrome-contributions-catalog.json"), JSON.stringify(catalog, null, 2));
}

function writeModule(root, extraSource) {
  writeFileSync(
    join(root, "alpha", "src", "browser", "frontend-module.ts"),
    [
      "export default new ContainerModule(bind => {",
      "  bind(PreferenceContribution).toService(AlphaPreferenceContribution);",
      "});",
      "export class AlphaContribution {",
      "  registerCommands(commands) {",
      "    commands.registerCommand({ id: 'alpha.open', label: 'Alpha: open' }, { execute: () => undefined });",
      "    registerIntentTarget(commands, 'alpha', 'panel', 'Alpha: panel', () => undefined);",
      "  }",
      "  registerMenus(menus) {",
      "    menus.registerMenuAction(['alpha'], { commandId: 'alpha.open', order: '1' });",
      "  }",
      "  registerKeybindings(keybindings) {",
      "    keybindings.registerKeybinding({ command: 'alpha.open', keybinding: 'cmd+shift+a' });",
      "  }",
      "}",
      "export const schema = { properties: { 'alpha.pref': { type: 'boolean' } } };",
      "export const status = { id: 'pratibimba.state-thread.active-coordinate', alignment: StatusBarAlignment.LEFT };",
      extraSource
    ].join("\n")
  );
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

test("chrome catalog validator accepts matching ledger and source registrations", () => {
  const root = makeFixture();
  try {
    const result = runValidator(root);

    assert.equal(result.status, 0, result.stderr || result.stdout);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("chrome catalog validator rejects source-side registrations missing from the ledger", () => {
  const root = makeFixture();
  try {
    writeModule(root, "commands.registerCommand({ id: 'alpha.unlisted' }, { execute: () => undefined });");

    const result = runValidator(root);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /alpha\.unlisted/);
    assert.match(result.stderr, /missing ledger entry/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("chrome catalog validator rejects ledger entries missing from source", () => {
  const root = makeFixture();
  try {
    writeCatalog(root, {
      commands: [
        {
          id: "alpha.open",
          owningExtension: "alpha",
          type: "command",
          declaringTranche: "31.fixture"
        },
        {
          id: "alpha.missing",
          owningExtension: "alpha",
          type: "command",
          declaringTranche: "31.fixture"
        }
      ]
    });

    const result = runValidator(root);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /alpha\.missing/);
    assert.match(result.stderr, /missing source registration/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("chrome catalog validator rejects duplicate ledger entries", () => {
  const root = makeFixture();
  try {
    writeCatalog(root, {
      commands: [
        {
          id: "alpha.open",
          owningExtension: "alpha",
          type: "command",
          declaringTranche: "31.fixture"
        },
        {
          id: "alpha.open",
          owningExtension: "alpha",
          type: "command",
          declaringTranche: "31.fixture"
        }
      ]
    });

    const result = runValidator(root);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /duplicate ledger entry/);
    assert.match(result.stderr, /alpha\.open/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
