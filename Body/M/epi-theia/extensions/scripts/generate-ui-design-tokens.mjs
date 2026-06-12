#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const extensionsRoot = dirname(scriptDir);
const contractsRoot = join(extensionsRoot, 'contracts');

const citations = Object.freeze({
  system: "Idea/Bimba/Seeds/M/M'-SYSTEM-SPEC.md three-layer coordinate architecture",
  ananda: "Idea/Bimba/Seeds/M/M1'/M1-2-ANANDA-VORTEX-ARCHITECTURE.md §§5-6",
  alpha: "Idea/Bimba/Seeds/M/M3'/alpha_rasa_bridge_ql.md alpha/16:9/4pi proof overlay",
  track30:
    'Idea/Bimba/Seeds/M/Legacy/plans/2026-06-02-m-prime-cycle-3-design-reconciliation/30-design-language-layer.md §30.11'
});

const themes = ['dark', 'light', 'glass'];

function description(meaning, citation) {
  return `${meaning} Derivation: ${citation}.`;
}

function colour(value, meaning, citation = citations.track30) {
  return {
    $value: typeof value === 'string' ? themed(value) : value,
    $type: 'color',
    $description: description(meaning, citation)
  };
}

function dimension(value, meaning, citation = citations.track30) {
  return {
    $value: value,
    $type: 'dimension',
    $description: description(meaning, citation)
  };
}

function duration(value, meaning, citation = citations.track30) {
  return {
    $value: value,
    $type: 'duration',
    $description: description(meaning, citation)
  };
}

function cubicBezier(value, meaning, citation = citations.ananda) {
  return {
    $value: value,
    $type: 'cubicBezier',
    $description: description(meaning, citation)
  };
}

function themed(hex) {
  return Object.fromEntries(themes.map(theme => [theme, hex]));
}

function familyTokens() {
  const families = {
    p: ['#6EA8FE', '#5C95EA', '#4A82D6', '#386FC2', '#265CAE', '#14499A'],
    s: ['#C59BFF', '#B387F0', '#A173E1', '#8F5FD2', '#7D4BC3', '#6B37B4'],
    t: ['#66D9E8', '#53C6D5', '#40B3C2', '#2DA0AF', '#1A8D9C', '#077A89'],
    m: ['#F6C177', '#E9AE60', '#DC9B49', '#CF8832', '#C2751B', '#B56204'],
    l: ['#80D98B', '#6BC878', '#56B765', '#41A652', '#2C953F', '#17842C'],
    c: ['#FF8AA2', '#F17691', '#E36280', '#D54E6F', '#C73A5E', '#B9264D']
  };
  return Object.fromEntries(
    Object.entries(families).map(([family, values]) => [
      family,
      Object.fromEntries(
        values.map((value, index) => [
          String(index),
          colour(
            value,
            `Family ${family.toUpperCase()} archetype tier ${index} tint for coordinate-bearing surfaces.`,
            citations.system
          )
        ])
      )
    ])
  );
}

function namedColours(entries, citation = citations.track30) {
  return Object.fromEntries(
    entries.map(([name, value, meaning]) => [name, colour(value, meaning, citation)])
  );
}

const tokens = {
  epilogos: {
    colour: {
      family: familyTokens(),
      element: namedColours(
        [
          ['aether', '#D7C7FF', 'Prima-materia element tint for framing and threshold states.'],
          ['earth', '#8BCB88', 'Earth element tint for grounding, materiality, and stable quartet positions.'],
          ['water', '#62B6FF', 'Water element tint for flow, receptivity, and reflective quartet positions.'],
          ['air', '#F4D35E', 'Air element tint for motion, relation, and communicative quartet positions.'],
          ['fire', '#FF7A59', 'Fire element tint for ignition, discernment, and transformative quartet positions.'],
          ['salt', '#E8E1CF', 'Salt element tint for ultima-materia crystallisation and completion.']
        ],
        citations.system
      ),
      flow: namedColours(
        [
          ['mahamaya-gold', '#D8A534', 'Mahamaya directed-response flow streamline.'],
          ['parashakti-emerald', '#2DBE7E', 'Parashakti integrative flow streamline.']
        ],
        citations.ananda
      ),
      'psyche-facet': namedColours(
        [
          ['anima', '#FF9F7A', 'Anima dispatch and lemniscate recognition facet.'],
          ['eros', '#FF6F91', 'Eros operative exchange and verification facet.'],
          ['logos', '#6EA8FE', 'Logos form-giving and scoping facet.'],
          ['mythos', '#9B8CFF', 'Mythos pattern and strange-attractor facet.'],
          ['nous', '#BFD7EA', 'Nous epistemic clearing facet.'],
          ['psyche', '#7BDCB5', 'Psyche household coordination facet.'],
          ['sophia', '#FFD166', 'Sophia integrative pulse and return facet.']
        ],
        citations.system
      ),
      signal: namedColours([
        ['info', '#6EA8FE', 'Informational signal for neutral guidance.'],
        ['success', '#59D98E', 'Success signal for completed or ready affordances.'],
        ['warning', '#F6C177', 'Warning signal for cautions that do not block action.'],
        ['danger', '#FF6B6B', 'Danger signal for blocked or destructive states.']
      ]),
      readiness: {
        severity: namedColours([
          ['ready', '#59D98E', 'Ready bridge or substrate state.'],
          ['degraded', '#F6C177', 'Degraded but usable bridge or substrate state.'],
          ['blocked', '#FF6B6B', 'Blocked bridge or substrate state.']
        ]),
        id: namedColours([
          ['bridge-unavailable', '#FF6B6B', 'Bridge unavailable readiness state.'],
          ['profile-missing-field', '#F6C177', 'Profile field missing readiness state.'],
          ['s2-graph-blocked', '#FF7A59', 'S2 graph blocked readiness state.'],
          ['s3-subscription-blocked', '#FF8AA2', 'S3 subscription blocked readiness state.'],
          ['s5-review-blocked', '#D54E6F', 'S5 review blocked readiness state.'],
          ['authority-payload-missing', '#F4D35E', 'Authority payload missing readiness state.'],
          ['privacy-blocked', '#C59BFF', 'Privacy blocked readiness state.'],
          ['degraded-but-readable', '#F6C177', 'Readable degraded readiness state.'],
          ['ready-public-current', '#59D98E', 'Current public ready readiness state.']
        ])
      },
      privacy: namedColours([
        ['protected-local', '#C59BFF', 'Protected-local privacy chrome.'],
        ['handle-only', '#66D9E8', 'Handle-only privacy chrome.'],
        ['opt-in', '#80D98B', 'Opt-in public privacy chrome.']
      ]),
      'chroma-depth': namedColours([
        ['shallow', '#A7C7E7', 'Shallow chroma for low-emphasis coordinate support.'],
        ['middle', '#6EA8FE', 'Middle chroma for active coordinate support.'],
        ['deep', '#265CAE', 'Deep chroma for high-emphasis coordinate support.']
      ]),
      capacity: namedColours([
        ['open', '#59D98E', 'Capacity available state.'],
        ['near-limit', '#F6C177', 'Capacity near-limit state.'],
        ['closed', '#FF6B6B', 'Capacity closed state.']
      ]),
      bridge: namedColours([
        ['connected', '#59D98E', 'Connected bridge status.'],
        ['degraded', '#F6C177', 'Degraded bridge status.'],
        ['disconnected', '#FF6B6B', 'Disconnected bridge status.']
      ]),
      surface: namedColours([
        ['base', '#151821', 'Base shell surface.'],
        ['raised', '#202433', 'Raised composition surface.'],
        ['inset', '#0F121A', 'Inset data surface.']
      ]),
      layout: namedColours([
        ['focus', '#6EA8FE', 'Focused layout channel.'],
        ['split', '#66D9E8', 'Split layout channel.'],
        ['composite', '#9B8CFF', 'Composite layout channel.']
      ]),
      insight: namedColours([
        ['dormant', '#778190', 'Dormant insight state.'],
        ['active', '#FFD166', 'Active insight state.'],
        ['confirmed', '#59D98E', 'Confirmed insight state.']
      ]),
      skeleton: namedColours([
        ['base', '#2B3040', 'Skeleton placeholder base.'],
        ['shimmer', '#3A4154', 'Skeleton placeholder shimmer.']
      ]),
      signature: namedColours(
        [
          ['cool', '#6EA8FE', 'Cool Cl(4,2) signature pole.'],
          ['warm', '#F6C177', 'Warm Cl(4,2) signature pole.']
        ],
        citations.ananda
      )
    },
    typography: {
      mono: {
        coordinate: dimension(
          '13px',
          'Monospace size for wikilink coordinate strings.',
          citations.system
        ),
        label: dimension('12px', 'Monospace size for compact coordinate labels.', citations.system)
      },
      prose: {
        body: dimension('14px', 'Default prose body size for Theia content surfaces.'),
        canon: dimension('16px', 'Canon text size for source excerpts and proof prose.'),
        legal: dimension('12px', 'Legal and policy copy size for compact disclosures.')
      },
      ui: {
        micro: dimension('11px', 'Microcopy size for asides and metadata.'),
        chip: dimension('12px', 'Chip label size for compact status affordances.'),
        tooltip: dimension('12px', 'Tooltip text size for hover disclosures.'),
        'status-bar': dimension('12px', 'Status-bar label size aligned to Theia chrome.')
      }
    },
    motion: {
      tick: duration('120ms', 'Profile-tick visual acknowledgement duration.', citations.ananda),
      toggle: duration('160ms', 'Binary control toggle duration.'),
      reveal: duration('220ms', 'Progressive disclosure reveal duration.'),
      slerp: cubicBezier([0.32, 0.72, 0.18, 1], 'Slerp choreography easing.'),
      bloom: duration('280ms', 'Recognition bloom duration for insight activation.', citations.alpha),
      settle: duration('180ms', 'Settle duration after bridge or layout state change.'),
      lemniscate: cubicBezier([0.38, 0, 0.2, 1], 'Lemniscate transition easing.', citations.ananda)
    },
    spacing: {
      tight: dimension('4px', 'Tight spacing for dense coordinate annotations.'),
      compact: dimension('8px', 'Compact spacing for chips and toolbar groups.'),
      standard: dimension('12px', 'Standard spacing for extension control rows.'),
      generous: dimension('16px', 'Generous spacing for composition panes.'),
      section: dimension('24px', 'Section spacing for major content transitions.')
    },
    depth: {
      surface: dimension('0px', 'Base surface elevation.'),
      overlay: dimension('8px', 'Overlay elevation depth.'),
      tooltip: dimension('12px', 'Tooltip elevation depth.'),
      modal: dimension('24px', 'Modal elevation depth.'),
      notification: dimension('16px', 'Notification elevation depth.')
    }
  }
};

const topLevelNames = Object.keys(tokens.epilogos);

const tsSource = `export type UiDesignTokenType = 'color' | 'dimension' | 'duration' | 'cubicBezier';

export interface UiDesignToken {
    readonly $value: string | readonly number[] | Readonly<Record<string, string>>;
    readonly $type: UiDesignTokenType;
    readonly $description: string;
}

export type UiDesignTokenGroup = {
    readonly [key: string]: UiDesignToken | UiDesignTokenGroup;
};

export type UiDesignTokenTopLevelName = ${topLevelNames.map(name => `'${name}'`).join(' | ')};

export const UI_DESIGN_TOKEN_TOP_LEVEL_NAMES = Object.freeze(${JSON.stringify(topLevelNames)}) as readonly UiDesignTokenTopLevelName[];

export const UI_DESIGN_TOKENS = ${JSON.stringify(tokens, null, 4)} as const;

export type UiDesignTokenPath = string;

export function getUiDesignToken(path: UiDesignTokenPath): UiDesignToken {
    const token = path.split('.').reduce<unknown>((cursor, segment) => {
        if (!cursor || typeof cursor !== 'object') {
            return undefined;
        }
        return (cursor as Record<string, unknown>)[segment];
    }, UI_DESIGN_TOKENS);

    if (!isUiDesignToken(token)) {
        throw new Error(\`Unknown UI design token: \${path}\`);
    }

    return token;
}

export function flattenUiDesignTokens(
    node: UiDesignTokenGroup = UI_DESIGN_TOKENS,
    prefix = ''
): Readonly<Record<string, UiDesignToken>> {
    const entries: Array<[string, UiDesignToken]> = [];
    for (const [key, value] of Object.entries(node)) {
        const path = prefix ? \`\${prefix}.\${key}\` : key;
        if (isUiDesignToken(value)) {
            entries.push([path, value]);
            continue;
        }
        entries.push(...Object.entries(flattenUiDesignTokens(value as UiDesignTokenGroup, path)));
    }
    return Object.freeze(Object.fromEntries(entries));
}

function isUiDesignToken(value: unknown): value is UiDesignToken {
    return Boolean(
        value &&
            typeof value === 'object' &&
            Object.hasOwn(value, '$value') &&
            Object.hasOwn(value, '$type') &&
            Object.hasOwn(value, '$description')
    );
}
`;

const mdSource = `# Epi-Logos UI Design Tokens

This is the canonical Epi-Logos design token bundle for the M' Theia shell. The JSON file uses the W3C Design Tokens Community Group draft object shape: every token carries \`$value\`, \`$type\`, and \`$description\`.

## Namespace

- \`epilogos.colour.*\`: family, element, flow, psyche-facet, signal, readiness, privacy, chroma-depth, capacity, bridge, surface, layout, insight, skeleton, signature.
- \`epilogos.typography.*\`: mono.coordinate, mono.label, prose.body, prose.canon, prose.legal, ui.micro, ui.chip, ui.tooltip, ui.status-bar.
- \`epilogos.motion.*\`: tick, toggle, reveal, slerp, bloom, settle, lemniscate.
- \`epilogos.spacing.*\`: tight, compact, standard, generous, section.
- \`epilogos.depth.*\`: surface, overlay, tooltip, modal, notification.

Canonical examples include \`epilogos.colour.family.m.3\`, \`epilogos.colour.signature.cool\`, \`epilogos.typography.mono.coordinate\`, \`epilogos.motion.lemniscate\`, \`epilogos.spacing.standard\`, and \`epilogos.depth.modal\`.

## Consumption

Consume-not-fork is binding: extension code imports shared design primitives and design tokens instead of re-authoring primitive components, hex colours, spacing dimensions, or motion durations. The lint rule at \`scripts/eslint-rules/consume-not-fork-design-tokens.mjs\` rejects design-primitive consumers that locally redefine canonical primitives or hardcode token-equivalent values.

## Derivation

Token descriptions cite their derivation surface inline. The main sources are \`${citations.system}\`, \`${citations.ananda}\`, \`${citations.alpha}\`, and \`${citations.track30}\`.
`;

mkdirSync(contractsRoot, { recursive: true });
writeFileSync(join(contractsRoot, 'ui-design-tokens.json'), `${JSON.stringify(tokens, null, 2)}\n`);
writeFileSync(join(contractsRoot, 'ui-design-tokens.ts'), tsSource);
writeFileSync(join(contractsRoot, 'ui-design-tokens.md'), mdSource);
