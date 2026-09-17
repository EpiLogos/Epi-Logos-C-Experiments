#!/usr/bin/env node
import {
  collectStringConstants,
  defaultCatalogPath,
  defaultExtensionsRoot,
  extensionIdForPath,
  extractObjectStringProperty,
  isMainModule,
  literalValue,
  parseArgs,
  printResult,
  readJson,
  readSourceFile,
  repoRelative,
  walkFiles
} from "./chrome-validator-utils.mjs";

const ledgerSections = [
  "commands",
  "keybindings",
  "menuItems",
  "preferences",
  "statusBarEntries",
  "intentTargets"
];

function ledgerKey(section, entry) {
  if (section === "commands") {
    return `command:${entry.id}`;
  }
  if (section === "keybindings") {
    return `keybinding:${entry.commandId}:${entry.keybinding}:${entry.when ?? ""}`;
  }
  if (section === "menuItems") {
    return `menu-item:${entry.commandId}`;
  }
  if (section === "preferences") {
    return `preference:${entry.id}`;
  }
  if (section === "statusBarEntries") {
    return `status-bar:${entry.id}`;
  }
  if (section === "intentTargets") {
    return `intent-target:${entry.extensionId}.${entry.requestedContributionId}`;
  }
  throw new Error(`unknown ledger section ${section}`);
}

function addSourceRegistration(registrations, key, detail) {
  if (!key) {
    return;
  }
  if (!registrations.has(key)) {
    registrations.set(key, []);
  }
  registrations.get(key).push(detail);
}

function collectSourceRegistrations(extensionsRoot) {
  const registrations = new Map();

  for (const file of walkFiles(extensionsRoot)) {
    const source = readSourceFile(file);
    const constants = collectStringConstants(source);
    const detail = `${extensionIdForPath(file, extensionsRoot)}:${repoRelative(file)}`;

    const commandPattern = /registerCommand\s*\(\s*(?:\{\s*id\s*:\s*)?(['"`][^'"`]+['"`]|[A-Za-z0-9_]+)/g;
    for (const match of source.matchAll(commandPattern)) {
      const id = literalValue(match[1], constants);
      if (id?.startsWith(".")) {
        continue;
      }
      addSourceRegistration(registrations, id ? `command:${id}` : null, detail);
    }

    const menuPattern = /registerMenuAction\s*\([\s\S]*?\{\s*[\s\S]*?commandId\s*:\s*(['"`][^'"`]+['"`]|[A-Za-z0-9_]+)/g;
    for (const match of source.matchAll(menuPattern)) {
      const commandId = literalValue(match[1], constants);
      addSourceRegistration(registrations, commandId ? `menu-item:${commandId}` : null, detail);
    }

    const keybindingPattern = /registerKeybinding\s*\(\s*\{([\s\S]*?)\}\s*\)/g;
    for (const match of source.matchAll(keybindingPattern)) {
      const objectSource = match[1];
      const commandId = extractObjectStringProperty(objectSource, "command", constants);
      const keybinding = extractObjectStringProperty(objectSource, "keybinding", constants);
      const when = extractObjectStringProperty(objectSource, "when", constants) ?? "";
      addSourceRegistration(
        registrations,
        commandId && keybinding ? `keybinding:${commandId}:${keybinding}:${when}` : null,
        detail
      );
    }

    if (source.includes("PreferenceContribution")) {
      const preferencePattern = /['"`]((?:epi-logos|alpha)[^'"`]+)['"`]\s*:/g;
      for (const match of source.matchAll(preferencePattern)) {
        addSourceRegistration(registrations, `preference:${match[1]}`, detail);
      }
    }

    const statusPattern = /id\s*:\s*['"`](pratibimba\.state-thread\.[^'"`]+)['"`]/g;
    for (const match of source.matchAll(statusPattern)) {
      addSourceRegistration(registrations, `status-bar:${match[1]}`, detail);
    }

    const intentPattern = /registerIntentTarget\s*\(\s*[^,]+,\s*(['"`][^'"`]+['"`]|[A-Za-z0-9_]+)\s*,\s*(['"`][^'"`]+['"`]|[A-Za-z0-9_]+)/g;
    for (const match of source.matchAll(intentPattern)) {
      const extensionId = literalValue(match[1], constants);
      const requestedContributionId = literalValue(match[2], constants);
      addSourceRegistration(
        registrations,
        extensionId && requestedContributionId ? `intent-target:${extensionId}.${requestedContributionId}` : null,
        detail
      );
    }
  }

  return registrations;
}

function collectSourceEvidence(extensionsRoot) {
  const files = walkFiles(extensionsRoot).map((file) => ({
    file,
    extensionId: extensionIdForPath(file, extensionsRoot),
    source: readSourceFile(file)
  }));
  return files;
}

function hasSourceEvidence(files, section, entry) {
  const ownedFiles = files.filter((file) => !entry.owningExtension || file.extensionId === entry.owningExtension);
  const haystack = ownedFiles.map((file) => file.source).join("\n");
  if (section === "commands") {
    if (haystack.includes(entry.id)) {
      return true;
    }
    const [extensionId, suffix] = entry.id.split(/\.(.+)/);
    return Boolean(extensionId && suffix && haystack.includes(extensionId) && haystack.includes(`.${suffix}`));
  }
  if (section === "keybindings") {
    return haystack.includes(entry.commandId) && haystack.includes(entry.keybinding);
  }
  if (section === "menuItems") {
    return ownedFiles.some((file) => file.source.includes("registerMenuAction") && file.source.includes(entry.commandId));
  }
  if (section === "preferences") {
    return haystack.includes(entry.id);
  }
  if (section === "statusBarEntries") {
    return haystack.includes(entry.id);
  }
  if (section === "intentTargets") {
    return haystack.includes(entry.extensionId) && haystack.includes(entry.requestedContributionId);
  }
  return false;
}

function collectLedgerRegistrations(catalog) {
  const registrations = new Map();
  const duplicateErrors = [];

  for (const section of ledgerSections) {
    for (const entry of catalog[section] ?? []) {
      const key = ledgerKey(section, entry);
      if (!registrations.has(key)) {
        registrations.set(key, []);
      }
      registrations.get(key).push({ section, entry });
    }
  }

  for (const [key, entries] of registrations.entries()) {
    if (entries.length > 1) {
      const ids = entries.map(({ entry }) => entry.id).join(", ");
      duplicateErrors.push(`duplicate ledger entry for ${key}: ${ids}`);
    }
  }

  return { registrations, duplicateErrors };
}

export function validateChromeContributionsCatalog({
  extensionsRoot = defaultExtensionsRoot,
  catalogPath = defaultCatalogPath
} = {}) {
  const catalog = readJson(catalogPath);
  const errors = [];
  const sourceRegistrations = collectSourceRegistrations(extensionsRoot);
  const sourceEvidence = collectSourceEvidence(extensionsRoot);
  const { registrations: ledgerRegistrations, duplicateErrors } = collectLedgerRegistrations(catalog);
  errors.push(...duplicateErrors);

  for (const [key, entries] of ledgerRegistrations.entries()) {
    if (!sourceRegistrations.has(key)) {
      if (entries.some(({ section, entry }) => hasSourceEvidence(sourceEvidence, section, entry))) {
        continue;
      }
      const tranches = entries.map(({ entry }) => entry.declaringTranche).filter(Boolean).join(", ") || "unknown tranche";
      errors.push(`${key} missing source registration (ledger tranche ${tranches})`);
    }
  }

  for (const [key, details] of sourceRegistrations.entries()) {
    if (!ledgerRegistrations.has(key)) {
      errors.push(`${key} missing ledger entry (source ${details.join(", ")})`);
    }
  }

  return { name: "validate-chrome-contributions-catalog", errors };
}

export function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv, {
    extensionsRoot: defaultExtensionsRoot,
    catalogPath: defaultCatalogPath
  });
  const result = validateChromeContributionsCatalog(args);
  return printResult({ ...result, json: args.json });
}

if (isMainModule(import.meta.url)) {
  process.exitCode = main();
}
