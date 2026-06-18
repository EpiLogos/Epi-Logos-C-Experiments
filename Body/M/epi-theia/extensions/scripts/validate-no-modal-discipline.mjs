#!/usr/bin/env node
import {
  defaultExtensionsRoot,
  isMainModule,
  parseArgs,
  printResult,
  readSourceFile,
  repoRelative,
  walkFiles
} from "./chrome-validator-utils.mjs";

const governedPathPattern = /(^|\/)(review|reviews|evidence|gate-landing|human-gate)(\/|$)/;
const contextMarkerPattern = /@epi-logos:context\s*=\s*(review|evidence|gate-landing|human-gate)\b/;
const forbiddenCalls = [
  "MessageBox.show",
  "OpenDialog.show",
  "ConfirmDialog.show",
  "Dialog.show",
  "window.alert",
  "window.confirm",
  "window.prompt"
];

function isGovernedSource(path, rawSource) {
  const normalized = path.replaceAll("\\", "/");
  return governedPathPattern.test(normalized) || contextMarkerPattern.test(rawSource);
}

export function validateNoModalDiscipline({ extensionsRoot = defaultExtensionsRoot } = {}) {
  const errors = [];
  const files = walkFiles(extensionsRoot, { includeTests: true });

  for (const file of files) {
    const rawSource = readSourceFile(file);
    if (!isGovernedSource(file, rawSource)) {
      continue;
    }
    const lines = rawSource.split(/\r?\n/);
    for (const [lineIndex, line] of lines.entries()) {
      for (const call of forbiddenCalls) {
        const escapedCall = call.replaceAll(".", "\\.");
        if (new RegExp(`\\b${escapedCall}\\s*\\(`).test(line)) {
          errors.push(`${repoRelative(file)}:${lineIndex + 1} forbidden modal call ${call}`);
        }
      }
    }
  }

  return { name: "validate-no-modal-discipline", errors };
}

export function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv, { extensionsRoot: defaultExtensionsRoot });
  const result = validateNoModalDiscipline(args);
  return printResult({ ...result, json: args.json });
}

if (isMainModule(import.meta.url)) {
  process.exitCode = main();
}
