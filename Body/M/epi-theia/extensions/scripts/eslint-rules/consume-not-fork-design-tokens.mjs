import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ruleDir = dirname(fileURLToPath(import.meta.url));
const extensionsRoot = normalize(join(ruleDir, '../..'));
const tokenBundlePath = join(extensionsRoot, 'contracts/ui-design-tokens.json');

const DESIGN_PRIMITIVE_CONSUMPTION =
  /(?:from\s*['"]@pratibimba\/integrated-composition\/design-primitives['"]|import\s*\(\s*['"]@pratibimba\/integrated-composition\/design-primitives['"]\s*\))/;

const DESIGN_PRIMITIVE_NAMES = Object.freeze([
  'CoordinateString',
  'CodonString',
  'HexagramString',
  'SymbolicCoordinateString',
  'ProvenanceBorder',
  'PendingBadge',
  'BlockedOverlay',
  'ReadinessIndicator',
  'EmptyState',
  'LoadingPulse',
  'LemniscateTransition',
  'SlerpChoreographyClock'
]);

const CANONICAL_PRIMITIVE_DECLARATION = new RegExp(
  `\\b(?:export\\s+)?(?:const|let|var|function|class)\\s+(${DESIGN_PRIMITIVE_NAMES.join('|')})\\b`,
  'g'
);

const CANONICAL_PRIMITIVE_REEXPORT = new RegExp(
  `\\bexport\\s*\\{[^}]*\\b(${DESIGN_PRIMITIVE_NAMES.join('|')})\\b[^}]*\\}\\s*from\\s*['"]@pratibimba\\/integrated-composition\\/design-primitives['"]`,
  'g'
);

export const consumeNotForkDesignTokensRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require M-extension design-primitive consumers to consume canonical design tokens instead of forking primitive implementations or token values.'
    },
    schema: [],
    messages: {
      localPrimitiveFork:
        'Design primitive consumer locally defines or re-exports "{{name}}"; import and consume the canonical primitive instead.',
      tokenLiteralFork:
        'Design primitive consumer hardcodes "{{value}}", which duplicates {{tokenPath}}; consume the design token instead.'
    }
  },
  create(context) {
    return {
      'Program:exit'() {
        const sourceCode = context.getSourceCode();
        const messages = lintDesignTokenConsumptionSource(sourceCode.text, {
          filename: context.getFilename()
        });

        for (const message of messages) {
          context.report({
            loc: sourceCode.getLocFromIndex(message.index),
            messageId: message.messageId,
            data: {
              name: message.name ?? '',
              value: message.value ?? '',
              tokenPath: message.tokenPath ?? ''
            }
          });
        }
      }
    };
  }
};

export default consumeNotForkDesignTokensRule;

export function lintDesignTokenConsumptionSource(source, options = {}) {
  const filename = normalize(options.filename ?? '<input>');
  if (isAllowedFile(filename) || !DESIGN_PRIMITIVE_CONSUMPTION.test(source)) {
    return [];
  }

  return [
    ...findLocalPrimitiveForks(source),
    ...findTokenLiteralForks(source, collectDesignTokenLiteralValues())
  ].sort((left, right) => left.index - right.index);
}

export function collectDesignTokenLiteralValues() {
  if (!existsSync(tokenBundlePath)) {
    return new Map();
  }

  const tokens = JSON.parse(readFileSync(tokenBundlePath, 'utf8'));
  const values = new Map();
  for (const [path, token] of collectTokens(tokens)) {
    for (const value of collectScalarValues(token.$value)) {
      if (typeof value === 'string') {
        values.set(value.toLowerCase(), path);
      }
    }
  }
  return values;
}

function findLocalPrimitiveForks(source) {
  const messages = [];
  for (const match of source.matchAll(CANONICAL_PRIMITIVE_DECLARATION)) {
    messages.push({
      messageId: 'localPrimitiveFork',
      index: match.index ?? 0,
      name: match[1]
    });
  }
  for (const match of source.matchAll(CANONICAL_PRIMITIVE_REEXPORT)) {
    messages.push({
      messageId: 'localPrimitiveFork',
      index: match.index ?? 0,
      name: match[1]
    });
  }
  return messages;
}

function findTokenLiteralForks(source, tokenValues) {
  const literalPattern = /#[0-9a-fA-F]{6}\b|\b\d+(?:\.\d+)?(?:px|rem|em|ms|s)\b/g;
  const messages = [];
  for (const match of source.matchAll(literalPattern)) {
    const value = match[0];
    const tokenPath = tokenValues.get(value.toLowerCase());
    if (!tokenPath) {
      continue;
    }
    messages.push({
      messageId: 'tokenLiteralFork',
      index: match.index ?? 0,
      value,
      tokenPath
    });
  }
  return messages;
}

function collectTokens(node, prefix = '') {
  if (!node || typeof node !== 'object') {
    return [];
  }
  if (Object.hasOwn(node, '$value')) {
    return [[prefix, node]];
  }
  return Object.entries(node).flatMap(([key, value]) =>
    collectTokens(value, prefix ? `${prefix}.${key}` : key)
  );
}

function collectScalarValues(value) {
  if (typeof value === 'string') {
    return [value];
  }
  if (Array.isArray(value)) {
    return [];
  }
  if (value && typeof value === 'object') {
    return Object.values(value).flatMap(collectScalarValues);
  }
  return [];
}

function isAllowedFile(filename) {
  const normalized = normalize(filename);
  return (
    normalized.includes('/contracts/ui-design-tokens.') ||
    normalized.includes('/scripts/eslint-rules/consume-not-fork-design-tokens.mjs') ||
    normalized.includes('/integrated-composition/src/browser/design-primitives/')
  );
}
