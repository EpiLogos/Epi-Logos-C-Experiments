import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = "/Users/admin/Documents/Epi-Logos C Experiments";
export const defaultExtensionsRoot = join(repoRoot, "Body/M/epi-theia/extensions");
export const defaultCatalogPath = join(defaultExtensionsRoot, "contracts/chrome-contributions-catalog.json");
export const defaultSlotPolicyPath = join(defaultExtensionsRoot, "contracts/shell-slot-policy.json");

const ignoredDirectories = new Set([
  ".git",
  ".pnpm",
  "coverage",
  "dist",
  "lib",
  "node_modules",
  "out"
]);

export function parseArgs(argv, defaults = {}) {
  const args = { ...defaults };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--extensions-root") {
      args.extensionsRoot = argv[++index];
    } else if (arg === "--catalog") {
      args.catalogPath = argv[++index];
    } else if (arg === "--slot-policy") {
      args.slotPolicyPath = argv[++index];
    } else if (arg === "--json") {
      args.json = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

export function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

export function walkFiles(root, { extensions = [".js", ".mjs", ".ts", ".tsx"], includeTests = false } = {}) {
  if (!existsSync(root)) {
    return [];
  }
  const files = [];
  for (const entry of readdirSync(root)) {
    if (ignoredDirectories.has(entry) || (!includeTests && ["test", "tests", "contracts", "scripts"].includes(entry))) {
      continue;
    }
    const fullPath = join(root, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      files.push(...walkFiles(fullPath, { extensions, includeTests }));
      continue;
    }
    if (extensions.some((extension) => fullPath.endsWith(extension))) {
      files.push(fullPath);
    }
  }
  return files;
}

export function repoRelative(path, root = repoRoot) {
  return relative(root, path).replaceAll("\\", "/");
}

export function extensionIdForPath(path, extensionsRoot) {
  return relative(extensionsRoot, path).split(/[\\/]/)[0];
}

export function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split(/\r?\n/)
    .map((line) => {
      const commentIndex = line.indexOf("//");
      return commentIndex === -1 ? line : line.slice(0, commentIndex);
    })
    .join("\n");
}

export function readSourceFile(path) {
  return stripComments(readFileSync(path, "utf8"));
}

export function literalValue(raw, constants = new Map()) {
  if (!raw) {
    return null;
  }
  const trimmed = raw.trim();
  if (/^['"`]/.test(trimmed)) {
    const value = trimmed.slice(1, -1);
    if (trimmed.startsWith("`") && value.includes("${")) {
      const resolved = value.replace(/\$\{([A-Za-z0-9_]+)\}/g, (_match, name) => constants.get(name) ?? "");
      return resolved.includes("${") || resolved.includes("undefined") ? null : resolved;
    }
    return value.includes("${") ? null : value;
  }
  return constants.get(trimmed) ?? null;
}

export function collectStringConstants(source) {
  const constants = new Map();
  const constPattern = /(?:export\s+)?const\s+([A-Za-z0-9_]+)\s*=\s*['"`]([^'"`]+)['"`]/g;
  for (const match of source.matchAll(constPattern)) {
    constants.set(match[1], match[2]);
  }
  return constants;
}

export function extractObjectStringProperty(objectSource, propertyName, constants = new Map()) {
  const pattern = new RegExp(`\\b${propertyName}\\s*:\\s*(['"\`][^'"\`]+['"\`]|[A-Za-z0-9_]+)`);
  const match = objectSource.match(pattern);
  return literalValue(match?.[1], constants);
}

export function printResult({ name, errors, warnings = [], json = false }) {
  const payload = { name, ok: errors.length === 0, errors, warnings };
  if (json) {
    console.log(JSON.stringify(payload, null, 2));
  } else if (errors.length === 0) {
    console.log(`${name}: ok`);
    for (const warning of warnings) {
      console.warn(`${name}: warning: ${warning}`);
    }
  } else {
    console.error(`${name}: failed with ${errors.length} error(s)`);
    for (const error of errors) {
      console.error(`- ${error}`);
    }
  }
  return errors.length === 0 ? 0 : 1;
}

export function isMainModule(importMetaUrl, argv1 = process.argv[1]) {
  return fileURLToPath(importMetaUrl) === argv1;
}

export function nearestSourceRoot(path) {
  const marker = `${join("src", "browser")}`;
  const markerIndex = path.indexOf(marker);
  return markerIndex === -1 ? dirname(path) : path.slice(0, markerIndex + marker.length);
}
