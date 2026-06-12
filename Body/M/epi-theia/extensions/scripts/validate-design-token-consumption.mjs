#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { lintDesignTokenConsumptionSource } from './eslint-rules/consume-not-fork-design-tokens.mjs';

const repoRoot = '/Users/admin/Documents/Epi-Logos C Experiments';
const extensionsRoot = join(repoRoot, 'Body/M/epi-theia/extensions');
const explicitPaths = process.argv.slice(2);
const candidateFiles = explicitPaths.length > 0 ? explicitPaths : collectExtensionSourceFiles(extensionsRoot);
const messages = [];

for (const filePath of candidateFiles) {
  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    continue;
  }
  const source = readFileSync(filePath, 'utf8');
  for (const message of lintDesignTokenConsumptionSource(source, { filename: filePath })) {
    messages.push({
      filePath,
      ...message
    });
  }
}

if (messages.length > 0) {
  for (const message of messages) {
    const value = message.value ? ` ${message.value}` : '';
    const tokenPath = message.tokenPath ? ` (${message.tokenPath})` : '';
    const name = message.name ? ` ${message.name}` : '';
    console.error(
      `${relative(repoRoot, message.filePath)}:${message.index}: ${message.messageId}${name}${value}${tokenPath}`
    );
  }
  process.exitCode = 1;
}

function collectExtensionSourceFiles(root) {
  const files = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }
    if (entry.name === 'node_modules' || entry.name === 'test' || entry.name === 'contracts') {
      continue;
    }
    const srcRoot = join(root, entry.name, 'src');
    if (existsSync(srcRoot)) {
      files.push(...walk(srcRoot));
    }
  }
  return files;
}

function walk(root) {
  const files = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'lib') {
      continue;
    }
    const fullPath = join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }
    if (/\.(ts|tsx|css)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}
