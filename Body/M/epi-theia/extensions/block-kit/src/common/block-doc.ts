import {
    validateBlockContract,
    type Block,
    type BlockContextFrame,
    type BlockPrivacyClass
} from '@pratibimba/m-extension-runtime';
import { createDefaultBlockRegistry } from './registry';

export type BlockDocFormat = 'markdown' | 'mdx';

export interface PersistedBlockDoc {
    readonly coordinate: string;
    readonly ct: string;
    readonly ctxFrame: string;
    readonly privacyClass: BlockPrivacyClass;
    readonly blocks: readonly Block[];
}

const MARKDOWN_BLOCK_START = '<!-- pratibimba:block-doc:start -->';
const MARKDOWN_BLOCK_END = '<!-- pratibimba:block-doc:end -->';

export function serializeBlockDoc(doc: PersistedBlockDoc, format: BlockDocFormat): string {
    assertDocBlocks(doc);
    const frontmatter = [
        '---',
        `coordinate: "${escapeYaml(doc.coordinate)}"`,
        `c_1_ct_type: "${escapeYaml(doc.ct)}"`,
        `c_3_ctx_frame: "${escapeYaml(doc.ctxFrame)}"`,
        `privacyClass: "${doc.privacyClass}"`,
        `block_count: ${doc.blocks.length}`,
        `block_doc_format: "${format}"`,
        '---',
        ''
    ].join('\n');
    const payload = JSON.stringify(doc.blocks, null, 2);
    if (format === 'markdown') {
        return `${frontmatter}${MARKDOWN_BLOCK_START}\n\`\`\`json block-kit\n${payload}\n\`\`\`\n${MARKDOWN_BLOCK_END}\n`;
    }
    return `${frontmatter}export const blocks = ${payload};\n\n<PratibimbaBlockDoc blocks={blocks} />\n`;
}

export function parseBlockDoc(source: string, format: BlockDocFormat): PersistedBlockDoc {
    const { frontmatter, body } = splitFrontmatter(source);
    const coordinate = requiredFrontmatter(frontmatter, 'coordinate');
    const ct = requiredFrontmatter(frontmatter, 'c_1_ct_type');
    const ctxFrame = requiredFrontmatter(frontmatter, 'c_3_ctx_frame');
    const privacyClass = requiredFrontmatter(frontmatter, 'privacyClass') as BlockPrivacyClass;
    const blocks = format === 'markdown'
        ? parseMarkdownBlocks(body)
        : parseMdxBlocks(body);
    const doc: PersistedBlockDoc = { coordinate, ct, ctxFrame, privacyClass, blocks };
    assertDocBlocks(doc);
    return doc;
}

export function createBlockDoc(blocks: readonly Block[], ctx: BlockContextFrame, privacyClass: BlockPrivacyClass): PersistedBlockDoc {
    return {
        coordinate: blocks[0]?.coordinate ?? 'M5-4',
        ct: ctx.ct,
        ctxFrame: ctx.cf,
        privacyClass,
        blocks
    };
}

function assertDocBlocks(doc: PersistedBlockDoc): void {
    const registry = createDefaultBlockRegistry();
    for (const block of doc.blocks) {
        const errors = validateBlockContract(block);
        if (errors.length > 0) {
            throw new Error(`Invalid block-doc block ${block.id}: ${errors.join('; ')}`);
        }
        registry.assertAccepted(block);
    }
}

function splitFrontmatter(source: string): { frontmatter: Map<string, string>; body: string } {
    if (!source.startsWith('---\n')) {
        throw new Error('Block doc is missing frontmatter');
    }
    const end = source.indexOf('\n---', 4);
    if (end < 0) {
        throw new Error('Block doc frontmatter is unterminated');
    }
    const frontmatter = new Map<string, string>();
    for (const line of source.slice(4, end).split('\n')) {
        const match = line.match(/^([^:]+):\s*(.*)$/);
        if (!match) {
            continue;
        }
        frontmatter.set(match[1].trim(), unquote(match[2].trim()));
    }
    return { frontmatter, body: source.slice(end + 5) };
}

function requiredFrontmatter(frontmatter: Map<string, string>, key: string): string {
    const value = frontmatter.get(key);
    if (!value) {
        throw new Error(`Block doc frontmatter missing ${key}`);
    }
    return value;
}

function parseMarkdownBlocks(body: string): readonly Block[] {
    const start = body.indexOf(MARKDOWN_BLOCK_START);
    const end = body.indexOf(MARKDOWN_BLOCK_END);
    if (start < 0 || end < 0 || end <= start) {
        throw new Error('Markdown block doc is missing block-kit markers');
    }
    const fenced = body.slice(start, end);
    const match = fenced.match(/```json block-kit\n([\s\S]*?)\n```/);
    if (!match) {
        throw new Error('Markdown block doc is missing json block-kit fence');
    }
    return parseBlocksJson(match[1]);
}

function parseMdxBlocks(body: string): readonly Block[] {
    const match = body.match(/export const blocks = ([\s\S]*?);\n\n<PratibimbaBlockDoc/);
    if (!match) {
        throw new Error('MDX block doc is missing exported blocks payload');
    }
    return parseBlocksJson(match[1]);
}

function parseBlocksJson(source: string): readonly Block[] {
    const parsed = JSON.parse(source);
    if (!Array.isArray(parsed)) {
        throw new Error('Block doc payload must be an array');
    }
    return parsed as readonly Block[];
}

function escapeYaml(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function unquote(value: string): string {
    if (value.startsWith('"') && value.endsWith('"')) {
        return value.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }
    return value;
}
