"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefaultBlockRegistry = exports.renderBlockReadModel = exports.createCoreBlockSpec = exports.createCoreBlockSpecs = exports.BlockRegistry = exports.BLOCK_KIT_SURFACE_REGISTRATIONS = exports.BLOCK_KIT_GATEWAY_METHOD_CONTRACTS = exports.CORE_BLOCK_OWNER_REGISTRATIONS = void 0;
const m_extension_runtime_1 = require("@pratibimba/m-extension-runtime");
exports.CORE_BLOCK_OWNER_REGISTRATIONS = Object.freeze([
    owner('rich-text', 'm5-epii', 'pratibimba.m5-epii:review-narrative', "M5'", 'm-extension', 'm5-epii/src/browser/m5-epii-widget.tsx'),
    owner('callout', 'm-extension-runtime', 'pratibimba.runtime:readiness-banner', "M'", 'runtime', 'm-extension-runtime/src/browser/readiness-banner.tsx'),
    owner('diff', 'canon-studio', 'pratibimba.canon-studio:semantic-diff', "M0'/M5'", 'ide-shell', 'canon-studio/src/browser/canon-studio-widget.tsx'),
    owner('data-model', 'm0-anuttara', 'pratibimba.m0-anuttara:provenance-inspector', "M0'", 'm-extension', 'm0-anuttara/src/browser/m0-anuttara-widget.tsx'),
    owner('file-tree', 'ide-shell-m0-m5', 'pratibimba.ide-shell:backend-studio-file-tree', "M0'/M5'", 'ide-shell', 'ide-shell-m0-m5/src/browser/backend-studio/backend-studio-widget.tsx'),
    owner('annotated-code', 'backend-studio', 'pratibimba.backend-studio:source-annotation', "M0'/M5'", 'ide-shell', 'backend-studio/src/browser/backend-studio-widget.tsx'),
    owner('code', 'canon-studio', 'pratibimba.canon-studio:code-block', "M0'/M5'", 'ide-shell', 'canon-studio/src/browser/canon-studio-widget.tsx'),
    owner('table', 'm0-anuttara', 'pratibimba.m0-anuttara:language-map-table', "M0'", 'm-extension', 'm0-anuttara/src/browser/panels'),
    owner('checklist', 'm4-nara', 'pratibimba.m4-nara:day-container-checklist', "M4'", 'm-extension', 'm4-nara/src/browser/m4-nara-widget.tsx'),
    owner('question-form', 'm5-epii', 'pratibimba.m5-epii:pedagogy-question-form', "M5'", 'm-extension', 'm5-epii/src/browser/m5-epii-widget.tsx'),
    owner('review-item', 'm5-epii', 'pratibimba.m5-epii:review-item', "M5'", 'm-extension', 'm5-epii/src/browser/m5-epii-widget.tsx'),
    owner('evidence', 'ide-shell-m0-m5', 'pratibimba.ide-shell:evidence-pane', "M5'", 'ide-shell', 'ide-shell-m0-m5/src/browser/evidence-pane-widget.tsx'),
    owner('dispatch-genealogy', 'agentic-control-room', 'pratibimba.acr:dispatch-trace', "M5'", 'agentic-control-room', 'agentic-control-room/src/browser/run-flow-widget.tsx'),
    owner('tool-stream-event', 'agentic-control-room', 'pratibimba.acr:tool-stream', "M5'", 'agentic-control-room', 'agentic-control-room/src/browser/run-flow-widget.tsx'),
    owner('pattern-packet', 'm4-nara', 'pratibimba.m4-nara:pattern-packet', "M4'", 'm-extension', 'm4-nara/src/browser'),
    owner('kairos-strip', 'm3-mahamaya', 'pratibimba.m3-mahamaya:kairos-strip', "M3'", 'm-extension', 'm3-mahamaya/src/browser/m3-mahamaya-widget.tsx'),
    owner('resonance-indicator', 'm2-parashakti', 'pratibimba.m2-parashakti:resonance-indicator', "M2'", 'm-extension', 'm2-parashakti/src/browser/m2-cymatic-engine-widget.tsx'),
    owner('wireframe', 'pratibimba-layouts', 'pratibimba.layouts:surface-wireframe', "M'", 'layout', 'pratibimba-layouts/src/common/layout-types.ts'),
    owner('diagram', 'm1-paramasiva', 'pratibimba.m1-paramasiva:relation-diagram', "M1'", 'm-extension', 'm1-paramasiva/src/browser/m1-paramasiva-widget.tsx')
]);
exports.BLOCK_KIT_GATEWAY_METHOD_CONTRACTS = Object.freeze([
    gateway(m_extension_runtime_1.BLOCKS_CATALOG_GATEWAY_METHOD, 'm-extension-runtime', "M'", 'BK-GW-001', 'm-extension-runtime/src/common/block-contract.ts', false, 'blocks.catalog'),
    gateway('blocks.annotate', 'block-kit', "M5'", 'BK-GW-002', 'block-kit/src/common/verdict-loop.ts', true, "s4'.psyche.update"),
    gateway('blocks.verdict', 'block-kit', "M5'", 'BK-GW-003', 'block-kit/src/common/verdict-loop.ts', true, "s4'.psyche.update"),
    gateway('blocks.doc.persist', 'block-kit', "M5'", 'BK-GW-004', 'block-kit/src/common/block-doc.ts', true, "s1'.vault.append_block"),
    gateway('blocks.doc.read', 'block-kit', "M5'", 'BK-GW-005', 'block-kit/src/common/block-doc.ts', false, "s1'.vault.read_file")
]);
exports.BLOCK_KIT_SURFACE_REGISTRATIONS = Object.freeze([
    surface('acr.dispatch-trace', 'agentic-control-room', ['dispatch-genealogy'], 'agentic-control-room/src/browser/run-flow-widget.tsx'),
    surface('acr.tool-stream', 'agentic-control-room', ['tool-stream-event'], 'agentic-control-room/src/browser/run-flow-widget.tsx'),
    surface('ide-shell.evidence-inspector', 'ide-shell-m0-m5', ['evidence', 'dispatch-genealogy', 'tool-stream-event'], 'ide-shell-m0-m5/src/browser/evidence-pane-widget.tsx'),
    surface('m0.data-model', 'm0-anuttara', ['data-model', 'table'], 'm0-anuttara/src/browser/m0-anuttara-widget.tsx'),
    surface('m1.diagram', 'm1-paramasiva', ['diagram'], 'm1-paramasiva/src/browser/m1-paramasiva-widget.tsx'),
    surface('m2.resonance', 'm2-parashakti', ['resonance-indicator'], 'm2-parashakti/src/browser/m2-cymatic-engine-widget.tsx'),
    surface('m3.kairos', 'm3-mahamaya', ['kairos-strip'], 'm3-mahamaya/src/browser/m3-mahamaya-widget.tsx'),
    surface('m4.patterns', 'm4-nara', ['pattern-packet', 'checklist'], 'm4-nara/src/browser'),
    surface('m5.review', 'm5-epii', ['review-item', 'question-form', 'rich-text'], 'm5-epii/src/browser/m5-epii-widget.tsx')
]);
class BlockRegistry {
    constructor(specs = createCoreBlockSpecs(), owners = exports.CORE_BLOCK_OWNER_REGISTRATIONS) {
        this.specs = new Map();
        this.owners = new Map();
        for (const spec of specs) {
            this.register(spec);
        }
        for (const registration of owners) {
            this.registerOwner(registration);
        }
    }
    register(spec) {
        this.specs.set(spec.type, spec);
    }
    registerOwner(registration) {
        this.owners.set(registration.type, registration);
    }
    spec(type) {
        return this.specs.get(type);
    }
    owner(type) {
        return this.owners.get(type);
    }
    catalog(generatedAt = 'static:track-44.10') {
        const entries = [...this.specs.values()].map(specToCatalogEntry);
        return (0, m_extension_runtime_1.createBlocksCatalog)(entries, generatedAt);
    }
    assertAccepted(block) {
        return (0, m_extension_runtime_1.assertBlockAcceptedByCatalog)(block, this.catalog());
    }
    noOrphanErrors() {
        const errors = [];
        for (const type of m_extension_runtime_1.CORE_BLOCK_TYPES) {
            if (!this.specs.has(type)) {
                errors.push(`Core block type "${type}" has no BlockSpec`);
            }
            if (!this.owners.has(type)) {
                errors.push(`Core block type "${type}" has no owning extension registration`);
            }
        }
        for (const registration of this.owners.values()) {
            if (!m_extension_runtime_1.CORE_BLOCK_TYPES.includes(registration.type)) {
                errors.push(`Owner registration ${registration.ownerContributionId} names non-core type "${registration.type}"`);
            }
        }
        return errors;
    }
}
exports.BlockRegistry = BlockRegistry;
function createCoreBlockSpecs() {
    return m_extension_runtime_1.CORE_BLOCK_TYPES.map(type => createCoreBlockSpec(type));
}
exports.createCoreBlockSpecs = createCoreBlockSpecs;
function createCoreBlockSpec(type) {
    return Object.freeze({
        type,
        schema: Object.freeze({
            type: 'object',
            required: ['id', 'type', 'ctx', 'privacyClass', 'data'],
            properties: Object.freeze({
                type: Object.freeze({ const: type }),
                data: Object.freeze({ type: 'object' })
            })
        }),
        Read: ({ block }) => renderBlockReadModel(block),
        editSurface: editSurfaceFor(type),
        privacyGate: Object.freeze({
            requiredPrivacyClass: 'protected-local',
            accepts: (block) => block.privacyClass === 'public'
                || block.privacyClass === 'protected'
                || block.privacyClass === 'protected-local'
        })
    });
}
exports.createCoreBlockSpec = createCoreBlockSpec;
function renderBlockReadModel(block) {
    return Object.freeze({
        id: block.id,
        type: block.type,
        coordinate: block.coordinate ?? null,
        privacyClass: block.privacyClass,
        ctx: block.ctx,
        data: block.data
    });
}
exports.renderBlockReadModel = renderBlockReadModel;
function createDefaultBlockRegistry() {
    return new BlockRegistry();
}
exports.createDefaultBlockRegistry = createDefaultBlockRegistry;
function owner(type, ownerExtensionId, ownerContributionId, ownerCoordinate, ownerKind, sourceAnchor) {
    return Object.freeze({ type, ownerExtensionId, ownerContributionId, ownerCoordinate, ownerKind, sourceAnchor });
}
function gateway(method, ownerExtensionId, ownerCoordinate, contractEntryId, sourceAnchor, humanGateRequired, routesTo) {
    return Object.freeze({ method, ownerExtensionId, ownerCoordinate, contractEntryId, sourceAnchor, humanGateRequired, routesTo });
}
function surface(surfaceId, ownerExtensionId, renderedBlockTypes, sourceAnchor) {
    return Object.freeze({ surfaceId, ownerExtensionId, renderedBlockTypes, sourceAnchor });
}
function editSurfaceFor(type) {
    if (type === 'rich-text' || type === 'checklist' || type === 'question-form' || type === 'review-item') {
        return 'inline';
    }
    if (type === 'wireframe' || type === 'diagram' || type === 'file-tree') {
        return 'container';
    }
    return 'panel';
}
function specToCatalogEntry(spec) {
    return (0, m_extension_runtime_1.createCoreBlockCatalogEntry)(spec.type, {
        schema: spec.schema,
        editSurface: spec.editSurface,
        privacyGate: Object.freeze({
            requiredPrivacyClass: spec.privacyGate.requiredPrivacyClass ?? 'protected-local'
        }),
        iod17Parity: Object.freeze({ inParity: true })
    });
}
//# sourceMappingURL=registry.js.map