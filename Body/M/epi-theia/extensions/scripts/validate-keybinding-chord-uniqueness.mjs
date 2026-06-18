#!/usr/bin/env node
import {
  collectStringConstants,
  defaultCatalogPath,
  defaultExtensionsRoot,
  extractObjectStringProperty,
  isMainModule,
  parseArgs,
  printResult,
  readJson,
  readSourceFile,
  repoRelative,
  walkFiles
} from "./chrome-validator-utils.mjs";

function normalizeWhen(when) {
  return when ?? "";
}

function readCatalogIndex(catalogPath) {
  const catalog = readJson(catalogPath);
  const index = new Map();
  for (const entry of catalog.keybindings ?? []) {
    const key = `${entry.commandId}|${entry.keybinding}|${normalizeWhen(entry.when)}`;
    if (!index.has(key)) {
      index.set(key, []);
    }
    index.get(key).push(entry);
  }
  return index;
}

export function collectKeybindings({ extensionsRoot = defaultExtensionsRoot } = {}) {
  const contributions = [];
  for (const file of walkFiles(extensionsRoot)) {
    const source = readSourceFile(file);
    if (!source.includes("registerKeybinding")) {
      continue;
    }
    const constants = collectStringConstants(source);
    const registerPattern = /registerKeybinding\s*\(\s*\{([\s\S]*?)\}\s*\)/g;
    for (const match of source.matchAll(registerPattern)) {
      const objectSource = match[1];
      const commandId = extractObjectStringProperty(objectSource, "command", constants);
      const keybinding = extractObjectStringProperty(objectSource, "keybinding", constants);
      if (!commandId || !keybinding) {
        continue;
      }
      contributions.push({
        commandId,
        keybinding,
        when: extractObjectStringProperty(objectSource, "when", constants),
        path: file
      });
    }
  }
  return contributions;
}

export function validateKeybindingChordUniqueness({
  extensionsRoot = defaultExtensionsRoot,
  catalogPath = defaultCatalogPath
} = {}) {
  const errors = [];
  const byChordAndWhen = new Map();
  const catalogIndex = readCatalogIndex(catalogPath);

  for (const contribution of collectKeybindings({ extensionsRoot })) {
    const key = `${contribution.keybinding}|${normalizeWhen(contribution.when)}`;
    if (!byChordAndWhen.has(key)) {
      byChordAndWhen.set(key, []);
    }
    byChordAndWhen.get(key).push(contribution);
  }

  for (const [key, contributors] of byChordAndWhen.entries()) {
    if (contributors.length <= 1) {
      continue;
    }
    const [chord, when] = key.split("|");
    const details = contributors.map((contributor) => {
      const catalogEntries = catalogIndex.get(
        `${contributor.commandId}|${contributor.keybinding}|${normalizeWhen(contributor.when)}`
      ) ?? [];
      const tranches = catalogEntries.map((entry) => entry.declaringTranche).filter(Boolean).join(", ") || "unlisted";
      return `${contributor.commandId} (${repoRelative(contributor.path)}, tranche ${tranches})`;
    });
    errors.push(`duplicate keybinding chord ${chord} when "${when}": ${details.join("; ")}`);
  }

  return { name: "validate-keybinding-chord-uniqueness", errors };
}

export function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv, {
    extensionsRoot: defaultExtensionsRoot,
    catalogPath: defaultCatalogPath
  });
  const result = validateKeybindingChordUniqueness(args);
  return printResult({ ...result, json: args.json });
}

if (isMainModule(import.meta.url)) {
  process.exitCode = main();
}
