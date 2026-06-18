import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const repoRoot = "/Users/admin/Documents/Epi-Logos C Experiments";
const validatorPath = join(repoRoot, "Body/M/epi-theia/extensions/scripts/validate-status-bar-discipline.mjs");
const permittedIds = [
  "pratibimba.state-thread.active-coordinate",
  "pratibimba.state-thread.profile-tick",
  "pratibimba.state-thread.profile-generation",
  "pratibimba.state-thread.day-now",
  "pratibimba.state-thread.session-id",
  "pratibimba.state-thread.gateway-readiness"
];

function makeFixture() {
  const root = mkdtempSync(join(tmpdir(), "epi-status-"));
  mkdirSync(join(root, "m-extension-runtime", "src", "browser", "status-bar"), { recursive: true });
  mkdirSync(join(root, "contracts"), { recursive: true });
  writeFileSync(
    join(root, "contracts", "shell-slot-policy.json"),
    JSON.stringify(
      {
        widget: {
          "application-shell-status-bar": {
            stateThreadEntries: { permittedIds }
          }
        }
      },
      null,
      2
    )
  );
  return root;
}

function writeEntries(root, ids = permittedIds) {
  const source = ids
    .map(
      (id, index) => `
export class Entry${index} {
  protected readonly descriptor = {
    id: '${id}',
    alignment: StatusBarAlignment.LEFT,
    priority: ${190 - index}
  };
  toStatusBarEntry() {
    return { alignment: StatusBarAlignment.LEFT, priority: ${190 - index} };
  }
}
`
    )
    .join("\n");
  writeFileSync(join(root, "m-extension-runtime", "src", "browser", "status-bar", "entries.ts"), source);
}

function runValidator(root) {
  return spawnSync(
    process.execPath,
    [
      validatorPath,
      "--extensions-root",
      root,
      "--slot-policy",
      join(root, "contracts", "shell-slot-policy.json")
    ],
    { cwd: repoRoot, encoding: "utf8" }
  );
}

test("status-bar validator accepts exactly six permitted LEFT state-thread entries", () => {
  const root = makeFixture();
  try {
    writeEntries(root);

    const result = runValidator(root);

    assert.equal(result.status, 0, result.stderr || result.stdout);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("status-bar validator rejects a synthetic seventh state-thread entry", () => {
  const root = makeFixture();
  try {
    writeEntries(root, [...permittedIds, "pratibimba.state-thread.extra"]);

    const result = runValidator(root);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /exactly 6/);
    assert.match(result.stderr, /pratibimba\.state-thread\.extra/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("status-bar validator rejects non-LEFT state-thread entries", () => {
  const root = makeFixture();
  try {
    writeEntries(root);
    const entryPath = join(root, "m-extension-runtime", "src", "browser", "status-bar", "entries.ts");
    writeFileSync(
      entryPath,
      [
        "export const broken = {",
        "  id: 'pratibimba.state-thread.active-coordinate',",
        "  alignment: StatusBarAlignment.RIGHT",
        "};",
        ...permittedIds.slice(1).map(id => `export const ok_${id.split('.').pop().replaceAll('-', '_')} = { id: '${id}', alignment: StatusBarAlignment.LEFT };`)
      ].join("\n")
    );

    const result = runValidator(root);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /StatusBarAlignment\.LEFT/);
    assert.match(result.stderr, /active-coordinate/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
