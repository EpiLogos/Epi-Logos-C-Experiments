#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const validators = [
  "validate-chrome-contributions-catalog.mjs",
  "validate-no-modal-discipline.mjs",
  "validate-status-bar-discipline.mjs",
  "validate-keybinding-chord-uniqueness.mjs"
];

let failed = false;
for (const validator of validators) {
  const result = spawnSync(process.execPath, [join(scriptsDir, validator)], {
    stdio: "inherit",
    cwd: process.cwd()
  });
  if (result.status !== 0) {
    failed = true;
  }
}

process.exitCode = failed ? 1 : 0;
