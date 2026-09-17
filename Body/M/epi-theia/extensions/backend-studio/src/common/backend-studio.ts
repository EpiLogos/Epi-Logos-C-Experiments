export const EXTENSION_ID = 'backend-studio' as const;
export const BACKEND_STUDIO_WIDGET_ID = 'pratibimba.backend-studio.provenance' as const;
export const BACKEND_STUDIO_OPEN_COMMAND_ID = 'pratibimba.backend-studio.open' as const;

export type BackendStudioLspCommand = 'rust-analyzer' | 'clangd' | 'pylsp';
export type BackendStudioLanguageId = 'rust' | 'cpp' | 'python';
export type BackendStudioCoreId =
    | 'epi-lib'
    | 'portal-core'
    | 'S1'
    | 'S2'
    | 'S3'
    | 'S4'
    | 'S5';

export interface BackendStudioLspContribution {
    readonly id: string;
    readonly languageId: BackendStudioLanguageId;
    readonly command: BackendStudioLspCommand;
    readonly args: readonly string[];
    readonly documentSelector: readonly string[];
    readonly workspaceRoots: readonly string[];
    readonly provenance: string;
}

export interface BackendStudioProvenanceRoot {
    readonly core: BackendStudioCoreId;
    readonly label: string;
    readonly path: string;
    readonly languageId: BackendStudioLanguageId;
    readonly lsp: BackendStudioLspCommand;
    readonly provenance: string;
}

export const BACKEND_STUDIO_LSP_CONTRIBUTIONS: readonly BackendStudioLspContribution[] =
    Object.freeze([
        Object.freeze({
            id: 'backend-studio.rust-analyzer',
            languageId: 'rust',
            command: 'rust-analyzer',
            args: Object.freeze([]),
            documentSelector: Object.freeze(['**/*.rs']),
            workspaceRoots: Object.freeze([
                'Body/S/S0/portal-core',
                'Body/S/S1/hen-compiler-core',
                'Body/S/S2/graph-schema',
                'Body/S/S2/graph-services',
                'Body/S/S3/gateway',
                'Body/S/S5/epii-agent-core',
                'Body/S/S5/epii-autoresearch-core'
            ]),
            provenance: 'system-shape canon §1.2: Rust cores use rust-analyzer'
        }),
        Object.freeze({
            id: 'backend-studio.clangd',
            languageId: 'cpp',
            command: 'clangd',
            args: Object.freeze(['--background-index']),
            documentSelector: Object.freeze(['Body/S/S0/epi-lib/include/*.h', 'Body/S/S0/epi-lib/src/*.c']),
            workspaceRoots: Object.freeze(['Body/S/S0/epi-lib']),
            provenance: 'system-shape canon §1.2: epi-lib C FFI uses clangd'
        }),
        Object.freeze({
            id: 'backend-studio.pylsp',
            languageId: 'python',
            command: 'pylsp',
            args: Object.freeze([]),
            documentSelector: Object.freeze(['Body/S/S5/**/*.py']),
            workspaceRoots: Object.freeze(['Body/S/S5/epi-gnostic', 'Body/S/S5/epi-kbase']),
            provenance: 'system-shape canon §1.2: Python gnosis surfaces use pylsp'
        })
    ]);

export const BACKEND_STUDIO_PROVENANCE_ROOTS: readonly BackendStudioProvenanceRoot[] =
    Object.freeze([
        root('epi-lib', 'epi-lib C FFI', 'Body/S/S0/epi-lib', 'cpp', 'clangd', 'S0 native C kernel and FFI headers'),
        root('portal-core', 'portal-core', 'Body/S/S0/portal-core', 'rust', 'rust-analyzer', 'S0 Rust portal math and profile authority'),
        root('S1', 'S1 Hen compiler core', 'Body/S/S1/hen-compiler-core', 'rust', 'rust-analyzer', 'Hen vault and compiler law'),
        root('S2', 'S2 graph services', 'Body/S/S2/graph-services', 'rust', 'rust-analyzer', 'Graph schema and semantic service substrate'),
        root('S3', 'S3 gateway', 'Body/S/S3/gateway', 'rust', 'rust-analyzer', 'Gateway and session dispatch substrate'),
        root('S4', 'S4 Ta Onta TypeScript adapters', 'Body/S/S4/ta-onta', 'python', 'pylsp', 'Chronos/Kairos adapter boundary surfaced for Python-side process work'),
        root('S5', 'S5 Epii cores', 'Body/S/S5', 'rust', 'rust-analyzer', 'Agent, autoresearch, review, and gnosis cores')
    ]);

export function lspContributionFor(
    command: BackendStudioLspCommand
): BackendStudioLspContribution {
    const contribution = BACKEND_STUDIO_LSP_CONTRIBUTIONS.find(item => item.command === command);
    if (!contribution) {
        throw new Error(`Backend Studio LSP not declared: ${command}`);
    }
    return contribution;
}

export function provenanceRootsForCore(
    core: BackendStudioCoreId
): readonly BackendStudioProvenanceRoot[] {
    return Object.freeze(BACKEND_STUDIO_PROVENANCE_ROOTS.filter(rootItem => rootItem.core === core));
}

function root(
    core: BackendStudioCoreId,
    label: string,
    path: string,
    languageId: BackendStudioLanguageId,
    lsp: BackendStudioLspCommand,
    provenance: string
): BackendStudioProvenanceRoot {
    return Object.freeze({
        core,
        label,
        path,
        languageId,
        lsp,
        provenance
    });
}
