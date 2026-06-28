"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertBlockDocWritablePath = exports.blockDocVaultPath = exports.createBlockDoc = exports.parseBlockDoc = exports.serializeBlockDoc = exports.fromDoc = exports.toDoc = void 0;
const block_contract_1 = require("@pratibimba/m-extension-runtime/lib/common/block-contract");
const registry_1 = require("./registry");
const MARKDOWN_BLOCK_START = '<!-- pratibimba:block-doc:start -->';
const MARKDOWN_BLOCK_END = '<!-- pratibimba:block-doc:end -->';
const PRESENT_DAY_PATH_PATTERN = /^Idea\/Empty\/Present\/\d{2}-\d{2}-\d{4}\/[^/]+\.(md|mdx)$/;
function toDoc(blocks, options) {
    const ctx = options.ctx ?? blocks[0]?.ctx;
    if (!ctx) {
        throw new Error('Block doc requires a CTX context frame');
    }
    const privacyClass = options.privacyClass ?? blocks[0]?.privacyClass;
    if (!privacyClass) {
        throw new Error('Block doc requires a privacyClass');
    }
    return serializeBlockDoc(createBlockDoc(blocks, ctx, privacyClass, options.coordinate, {
        dayId: options.dayId,
        createdAt: options.createdAt,
        artifactRole: options.artifactRole
    }), options.format);
}
exports.toDoc = toDoc;
function fromDoc(source, format) {
    return parseBlockDoc(source, format).blocks;
}
exports.fromDoc = fromDoc;
function serializeBlockDoc(doc, format) {
    assertDocBlocks(doc);
    const frontmatter = [
        '---',
        `coordinate: "${escapeYaml(doc.coordinate)}"`,
        `c_1_ct_type: "${escapeYaml(doc.ct)}"`,
        `c_3_ctx_frame: "${escapeYaml(doc.ctxFrame)}"`,
        `privacyClass: "${doc.privacyClass}"`,
        ...(doc.dayId ? [`c_3_day_id: "${escapeYaml(doc.dayId)}"`] : []),
        ...(doc.createdAt ? [`c_3_created_at: "${escapeYaml(doc.createdAt)}"`] : []),
        ...(doc.artifactRole ? [`c_4_artifact_role: "${escapeYaml(doc.artifactRole)}"`] : []),
        '---',
        ''
    ].join('\n');
    const payload = JSON.stringify(doc.blocks, null, 2);
    if (format === 'markdown') {
        return `${frontmatter}${MARKDOWN_BLOCK_START}\n\`\`\`json block-kit\n${payload}\n\`\`\`\n${MARKDOWN_BLOCK_END}\n`;
    }
    return `${frontmatter}export const blocks = ${payload};\n\n<PratibimbaBlockDoc blocks={blocks} />\n`;
}
exports.serializeBlockDoc = serializeBlockDoc;
function parseBlockDoc(source, format) {
    const { frontmatter, body } = splitFrontmatter(source);
    const coordinate = requiredFrontmatter(frontmatter, 'coordinate');
    const ct = requiredFrontmatter(frontmatter, 'c_1_ct_type');
    const ctxFrame = requiredFrontmatter(frontmatter, 'c_3_ctx_frame');
    const privacyClass = requiredFrontmatter(frontmatter, 'privacyClass');
    if (!(0, block_contract_1.isBlockPrivacyClass)(privacyClass)) {
        throw new Error('Block doc frontmatter privacyClass must match the block privacy vocabulary');
    }
    const resolvedFormat = format ?? detectBlockDocFormat(body);
    const blocks = resolvedFormat === 'markdown'
        ? parseMarkdownBlocks(body)
        : parseMdxBlocks(body);
    const doc = {
        coordinate,
        ct,
        ctxFrame,
        privacyClass,
        dayId: frontmatter.get('c_3_day_id'),
        createdAt: frontmatter.get('c_3_created_at'),
        artifactRole: frontmatter.get('c_4_artifact_role'),
        blocks
    };
    assertDocBlocks(doc);
    return doc;
}
exports.parseBlockDoc = parseBlockDoc;
function createBlockDoc(blocks, ctx, privacyClass, coordinate = blocks[0]?.coordinate ?? 'M5-4', metadata = {}) {
    return {
        coordinate,
        ct: ctx.ct,
        ctxFrame: ctx.cf,
        privacyClass,
        dayId: metadata.dayId,
        createdAt: metadata.createdAt,
        artifactRole: metadata.artifactRole,
        blocks
    };
}
exports.createBlockDoc = createBlockDoc;
function blockDocVaultPath(dayId, filename) {
    if (!/^\d{2}-\d{2}-\d{4}$/.test(dayId)) {
        throw new Error('Block doc dayId must use DD-MM-YYYY');
    }
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]*\.(md|mdx)$/.test(filename)) {
        throw new Error('Block doc filename must be a local .md or .mdx file');
    }
    return `Idea/Empty/Present/${dayId}/${filename}`;
}
exports.blockDocVaultPath = blockDocVaultPath;
function assertBlockDocWritablePath(vaultPath) {
    if (!PRESENT_DAY_PATH_PATTERN.test(vaultPath) || vaultPath.includes('..')) {
        throw new Error('Persisted block-doc writes are restricted to Idea/Empty/Present/{day_id}/');
    }
    return vaultPath;
}
exports.assertBlockDocWritablePath = assertBlockDocWritablePath;
function assertDocBlocks(doc) {
    const registry = (0, registry_1.createDefaultBlockRegistry)();
    for (const block of doc.blocks) {
        const errors = (0, block_contract_1.validateBlockContract)(block);
        if (errors.length > 0) {
            throw new Error(`Invalid block-doc block ${block.id}: ${errors.join('; ')}`);
        }
        registry.assertAccepted(block);
    }
}
function splitFrontmatter(source) {
    if (!source.startsWith('---\n')) {
        throw new Error('Block doc is missing frontmatter');
    }
    const end = source.indexOf('\n---', 4);
    if (end < 0) {
        throw new Error('Block doc frontmatter is unterminated');
    }
    const frontmatter = new Map();
    for (const line of source.slice(4, end).split('\n')) {
        const match = line.match(/^([^:]+):\s*(.*)$/);
        if (!match) {
            continue;
        }
        frontmatter.set(match[1].trim(), unquote(match[2].trim()));
    }
    return { frontmatter, body: source.slice(end + 5) };
}
function requiredFrontmatter(frontmatter, key) {
    const value = frontmatter.get(key);
    if (!value) {
        throw new Error(`Block doc frontmatter missing ${key}`);
    }
    return value;
}
function parseMarkdownBlocks(body) {
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
function parseMdxBlocks(body) {
    const match = body.match(/export const blocks = ([\s\S]*?);\n\n<PratibimbaBlockDoc/);
    if (!match) {
        throw new Error('MDX block doc is missing exported blocks payload');
    }
    return parseBlocksJson(match[1]);
}
function detectBlockDocFormat(body) {
    if (body.includes(MARKDOWN_BLOCK_START)) {
        return 'markdown';
    }
    if (body.includes('export const blocks = ') && body.includes('<PratibimbaBlockDoc')) {
        return 'mdx';
    }
    throw new Error('Block doc format could not be inferred from the body');
}
function parseBlocksJson(source) {
    const parsed = JSON.parse(source);
    if (!Array.isArray(parsed)) {
        throw new Error('Block doc payload must be an array');
    }
    return parsed;
}
function escapeYaml(value) {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}
function unquote(value) {
    if (value.startsWith('"') && value.endsWith('"')) {
        return value.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }
    return value;
}
//# sourceMappingURL=block-doc.js.map
