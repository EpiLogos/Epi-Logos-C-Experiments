#!/usr/bin/env node
import { accessSync, constants, existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "../../..");
const manifestPath = join(here, "10-t0-local-harness-topology.json");
const adrPath = join(here, "10-t0-integration-decision-gate-adr-bundle.md");
const topologyDocPath = join(here, "10-t0-local-harness-topology.md");
const checklistPath = join(here, "10-t0-milestone-checklist-template.md");

const requiredAdrIds = [
  "ADR-T10-PRD-01",
  "ADR-T10-PRD-02",
  "ADR-T10-PRD-03",
  "ADR-T10-IOD-01",
  "ADR-T10-IOD-02",
  "ADR-T10-IOD-04",
  "ADR-T10-IOD-05",
  "ADR-T10-IOD-09"
];

const requiredAdrFields = [
  "Owner track",
  "Blocked tracks",
  "Prototype command",
  "Pass criterion",
  "Fallback policy"
];

const requiredChecklistFields = [
  "Source spec anchors",
  "Consumed ADRs",
  "Harness services",
  "Mock-free proof",
  "Privacy audit",
  "Degraded behavior",
  "Next unblocked tranche"
];

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function readText(path) {
  return readFileSync(path, "utf8");
}

function pathExists(relativePath) {
  return existsSync(join(repoRoot, relativePath));
}

function resolveCommand(command) {
  const pathValue = process.env.PATH ?? "";
  for (const directory of pathValue.split(":")) {
    if (!directory) {
      continue;
    }
    const candidate = join(directory, command);
    try {
      accessSync(candidate, constants.X_OK);
      return candidate;
    } catch {
      continue;
    }
  }
  return null;
}

function commandCheck(command, args = []) {
  const resolvedCommand = resolveCommand(command);
  if (!resolvedCommand) {
    return { ok: false, detail: `${command} is not on PATH` };
  }

  if (args.length === 0) {
    return { ok: true, detail: `${command} available at ${resolvedCommand}` };
  }

  const result = spawnSync(command, args, { cwd: repoRoot, encoding: "utf8" });
  if (result.status === 0) {
    return { ok: true, detail: result.stdout.trim() || result.stderr.trim() || `${command} available` };
  }
  return {
    ok: false,
    detail: result.error ? result.error.message : (result.stderr || result.stdout || `${command} exited ${result.status}`).trim()
  };
}

function validateArtifacts() {
  const manifest = readJson(manifestPath);
  const adr = readText(adrPath);
  const topologyDoc = readText(topologyDocPath);
  const checklist = readText(checklistPath);
  const errors = [];

  for (const id of requiredAdrIds) {
    if (!adr.includes(id)) {
      errors.push(`ADR bundle missing ${id}`);
    }
  }

  for (const field of requiredAdrFields) {
    if (!adr.includes(field)) {
      errors.push(`ADR bundle missing field label: ${field}`);
    }
  }

  for (const field of requiredChecklistFields) {
    if (!checklist.includes(field)) {
      errors.push(`Checklist template missing field: ${field}`);
    }
  }

  if (!Array.isArray(manifest.services) || manifest.services.length < 7) {
    errors.push("Harness manifest must define all seven T0 services");
  }

  if (!Array.isArray(manifest.sharedIdentifiers) || manifest.sharedIdentifiers.length !== 9) {
    errors.push("Harness manifest must define the nine shared identifiers");
  }

  for (const service of manifest.services ?? []) {
    for (const field of ["id", "ownerTrack", "blockedTracks", "root", "requiredPaths", "startCommand", "testCommands", "readiness"]) {
      if (!(field in service)) {
        errors.push(`Service ${service.id ?? "<unknown>"} missing ${field}`);
      }
    }
    for (const requiredPath of service.requiredPaths ?? []) {
      const combined = service.root === "." ? requiredPath : join(service.root, requiredPath);
      if (!pathExists(combined)) {
        errors.push(`Service ${service.id} required path missing: ${combined}`);
      }
    }
  }

  for (const id of manifest.sharedIdentifiers ?? []) {
    if (!topologyDoc.includes(`\`${id.name}\``)) {
      errors.push(`Topology doc missing shared identifier ${id.name}`);
    }
  }

  return { ok: errors.length === 0, errors };
}

function readinessReport() {
  const manifest = readJson(manifestPath);
  const services = manifest.services.map((service) => {
    const envKey = `${manifest.serviceSkipEnvironmentPrefix}${service.id.toUpperCase()}`;
    const skipReason = process.env[envKey];
    const missingPaths = (service.requiredPaths ?? [])
      .map((requiredPath) => service.root === "." ? requiredPath : join(service.root, requiredPath))
      .filter((requiredPath) => !pathExists(requiredPath));

    if (skipReason) {
      return { id: service.id, status: "skipped", reason: skipReason, envKey };
    }

    if (missingPaths.length > 0) {
      return { id: service.id, status: "missing-path", missingPaths };
    }

    if (service.readiness.mode === "decision-gated") {
      return {
        id: service.id,
        status: "not-configured",
        decisionId: service.readiness.decisionId,
        next: "Resolve or explicitly defer the decision ADR before claiming production readiness."
      };
    }

    if (service.readiness.command) {
      const command = commandCheck(service.readiness.command, service.readiness.args);
      if (!command.ok) {
        return { id: service.id, status: "missing-command", command: service.readiness.command, detail: command.detail };
      }
      return { id: service.id, status: "ready", detail: command.detail };
    }

    try {
      accessSync(join(repoRoot, service.root), constants.R_OK);
      return { id: service.id, status: "ready", detail: "required paths are readable" };
    } catch (error) {
      return { id: service.id, status: "missing-path", detail: error.message };
    }
  });

  return {
    version: manifest.version,
    track: manifest.track,
    generatedAt: new Date().toISOString(),
    services
  };
}

function main() {
  const readiness = process.argv.includes("--readiness");
  const validation = validateArtifacts();

  if (readiness) {
    console.log(JSON.stringify({ artifacts: validation, readiness: readinessReport() }, null, 2));
  } else {
    console.log(JSON.stringify(validation, null, 2));
  }

  if (!validation.ok) {
    process.exitCode = 1;
  }
}

main();
