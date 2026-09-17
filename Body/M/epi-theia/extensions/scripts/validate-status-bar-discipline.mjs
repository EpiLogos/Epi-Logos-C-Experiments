#!/usr/bin/env node
import {
  defaultExtensionsRoot,
  defaultSlotPolicyPath,
  isMainModule,
  parseArgs,
  printResult,
  readJson,
  readSourceFile,
  repoRelative,
  walkFiles
} from "./chrome-validator-utils.mjs";
import { existsSync } from "node:fs";

const stateThreadPrefix = "pratibimba.state-thread.";

function readPermittedIds(slotPolicyPath) {
  if (!existsSync(slotPolicyPath)) {
    throw new Error(`missing shell-slot-policy.json at ${slotPolicyPath}`);
  }
  const policy = readJson(slotPolicyPath);
  const permitted =
    policy?.widget?.["application-shell-status-bar"]?.stateThreadEntries?.permittedIds ??
    policy?.["widget.application-shell-status-bar"]?.stateThreadEntries?.permittedIds;
  if (!Array.isArray(permitted)) {
    throw new Error("shell-slot-policy.json missing widget.application-shell-status-bar.stateThreadEntries.permittedIds");
  }
  return permitted;
}

export function collectStateThreadStatusEntries({ extensionsRoot = defaultExtensionsRoot } = {}) {
  const entries = [];
  const idPattern = /id\s*:\s*['"`](pratibimba\.state-thread\.[^'"`]+)['"`]/g;

  for (const file of walkFiles(extensionsRoot)) {
    const source = readSourceFile(file);
    if (!source.includes(stateThreadPrefix)) {
      continue;
    }
    for (const match of source.matchAll(idPattern)) {
      const nearbySource = source.slice(match.index, match.index + 600);
      const alignmentMatch = nearbySource.match(/alignment\s*:\s*StatusBarAlignment\.([A-Z]+)/);
      entries.push({
        id: match[1],
        alignment: alignmentMatch?.[1] ?? null,
        path: file
      });
    }
  }

  const deduped = new Map();
  for (const entry of entries) {
    if (!deduped.has(entry.id)) {
      deduped.set(entry.id, entry);
    }
  }
  return Array.from(deduped.values());
}

export function validateStatusBarDiscipline({
  extensionsRoot = defaultExtensionsRoot,
  slotPolicyPath = defaultSlotPolicyPath
} = {}) {
  const errors = [];
  let permittedIds = [];
  try {
    permittedIds = readPermittedIds(slotPolicyPath);
  } catch (error) {
    errors.push(error.message);
  }

  const entries = collectStateThreadStatusEntries({ extensionsRoot });
  if (entries.length !== 6) {
    errors.push(`expected exactly 6 state-thread status-bar entries, found ${entries.length}: ${entries.map((entry) => entry.id).join(", ")}`);
  }

  const permitted = new Set(permittedIds);
  for (const entry of entries) {
    if (!entry.id.startsWith(stateThreadPrefix)) {
      errors.push(`${repoRelative(entry.path)} status entry ${entry.id} does not use ${stateThreadPrefix}`);
    }
    if (entry.alignment !== "LEFT") {
      errors.push(`${repoRelative(entry.path)} ${entry.id} must use StatusBarAlignment.LEFT, found ${entry.alignment ?? "none"}`);
    }
    if (permittedIds.length > 0 && !permitted.has(entry.id)) {
      errors.push(`${repoRelative(entry.path)} ${entry.id} is not permitted by shell-slot-policy.json`);
    }
  }

  for (const id of permittedIds) {
    if (!entries.some((entry) => entry.id === id)) {
      errors.push(`permitted state-thread id ${id} has no source-side status-bar entry`);
    }
  }

  return { name: "validate-status-bar-discipline", errors };
}

export function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv, {
    extensionsRoot: defaultExtensionsRoot,
    slotPolicyPath: defaultSlotPolicyPath
  });
  const result = validateStatusBarDiscipline(args);
  return printResult({ ...result, json: args.json });
}

if (isMainModule(import.meta.url)) {
  process.exitCode = main();
}
