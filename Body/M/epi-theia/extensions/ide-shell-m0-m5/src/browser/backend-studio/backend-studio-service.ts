import { inject, injectable } from '@theia/core/shared/inversify';
import URI from '@theia/core/lib/common/uri';
import { EditorManager } from '@theia/editor/lib/browser/editor-manager';
import { MonacoLanguages } from '@theia/monaco/lib/browser/monaco-languages';
import {
    KERNEL_BRIDGE_API,
    type KernelBridgeAPI,
    type KernelBridgeCapabilityReceipt
} from '@pratibimba/kernel-bridge';
import { isPrivacySafe } from '../../common/contract';

export const BACKEND_STUDIO_WIDGET_ID = 'pratibimba.ide-shell.backend-studio';
export const BACKEND_STUDIO_LABEL = 'Backend Studio';
export const BACKEND_STUDIO_OPEN_SOURCE_COMMAND = 'backend-studio.openSource';
export const BACKEND_STUDIO_ACTIVITY_BAR_SLOT = 'activity-bar-left';

export interface BackendStudioLanguageServerRegistration {
    readonly id: string;
    readonly languageId: 'rust' | 'cpp' | 'python' | 'typescript';
    readonly command: 'rust-analyzer' | 'clangd' | 'pylsp' | 'typescript-language-server';
    readonly workspaceRoots: readonly string[];
    readonly documentSelector: readonly string[];
}

export interface BackendStudioOpenSourceResult {
    readonly openedUri: string | null;
    readonly blockedReason: string | null;
}

export const BACKEND_STUDIO_LSP_REGISTRATIONS: readonly BackendStudioLanguageServerRegistration[] =
    Object.freeze([
        {
            id: 'backend-studio.rust-analyzer',
            languageId: 'rust',
            command: 'rust-analyzer',
            workspaceRoots: Object.freeze([
                'Body/S/S0/epi-lib',
                'Body/S/S0/portal-core',
                'Body/S/S1/hen-compiler-core',
                'Body/S/S2/graph-schema',
                'Body/S/S2/graph-services'
            ]),
            documentSelector: Object.freeze(['**/*.rs'])
        },
        {
            id: 'backend-studio.clangd',
            languageId: 'cpp',
            command: 'clangd',
            workspaceRoots: Object.freeze(['Body/S/S0/epi-lib/include']),
            documentSelector: Object.freeze(['Body/S/S0/epi-lib/include/*.h'])
        },
        {
            id: 'backend-studio.pylsp',
            languageId: 'python',
            command: 'pylsp',
            workspaceRoots: Object.freeze([
                'Body/S/S5/epi-gnostic',
                'Body/S/S5/epi-kbase'
            ]),
            documentSelector: Object.freeze(['**/*.py'])
        },
        {
            id: 'backend-studio.typescript-language-server',
            languageId: 'typescript',
            command: 'typescript-language-server',
            workspaceRoots: Object.freeze(['Body/M/epi-theia/extensions']),
            documentSelector: Object.freeze(['**/*.ts', '**/*.tsx'])
        }
    ]);

@injectable()
export class BackendStudioService {
    @inject(MonacoLanguages)
    protected readonly monacoLanguages!: MonacoLanguages;

    @inject(EditorManager)
    protected readonly editorManager!: EditorManager;

    @inject(KERNEL_BRIDGE_API)
    protected readonly bridge!: KernelBridgeAPI;

    registerLanguageServers(): readonly BackendStudioLanguageServerRegistration[] {
        for (const registration of BACKEND_STUDIO_LSP_REGISTRATIONS) {
            this.registerMonacoLanguage(registration);
        }
        return BACKEND_STUDIO_LSP_REGISTRATIONS;
    }

    async openSource(coordinate: string, sourceAnchor: string): Promise<BackendStudioOpenSourceResult> {
        const receipt = await this.bridge.invokeCapability({
            method: 'invokeGatewayRpc',
            sessionKey: 'backend-studio-open-source',
            params: { gatewayMethod: 's2.graph.node', coordinate },
            profileGeneration: this.bridge.cachedProfile?.generation ?? null,
            provenanceHandles: [],
            vak: null
        });
        if (!isPrivacySafe(receipt.privacyClass)) {
            return {
                openedUri: null,
                blockedReason: `privacy class refused: ${receipt.privacyClass}`
            };
        }
        const sourceUri = this.resolveSourceAnchor(receipt, sourceAnchor);
        if (sourceUri === null) {
            return {
                openedUri: null,
                blockedReason: `source anchor not found: ${sourceAnchor}`
            };
        }
        const target = stripLineSuffix(sourceUri);
        const line = parseLineSuffix(sourceUri);
        await this.editorManager.open(new URI(target), line === null ? undefined : {
            selection: {
                start: { line, character: 0 },
                end: { line, character: 0 }
            }
        });
        return { openedUri: target, blockedReason: null };
    }

    protected resolveSourceAnchor(
        receipt: KernelBridgeCapabilityReceipt,
        anchor: string
    ): string | null {
        if (anchor.trim().length > 0) {
            return anchor.trim();
        }
        return firstStringField(receipt.artifact, [
            'sourceAnchor',
            'source_anchor',
            'codeAnchor',
            'code_anchor',
            'testAnchor',
            'test_anchor',
            'uri',
            'path'
        ]);
    }

    protected registerMonacoLanguage(registration: BackendStudioLanguageServerRegistration): void {
        const languages = this.monacoLanguages as unknown as {
            register?: (language: {
                id: string;
                aliases?: readonly string[];
                extensions?: readonly string[];
            }) => unknown;
            registerIcon?: (languageId: string, iconClass: string) => unknown;
        };
        languages.register?.({
            id: registration.languageId,
            aliases: Object.freeze([registration.command]),
            extensions: extensionsFor(registration.languageId)
        });
        languages.registerIcon?.(registration.languageId, `backend-studio-${registration.languageId}`);
    }
}

function firstStringField(value: unknown, fields: readonly string[]): string | null {
    if (value === null || typeof value !== 'object') {
        return null;
    }
    const record = value as Record<string, unknown>;
    for (const field of fields) {
        const direct = record[field];
        if (typeof direct === 'string' && direct.trim().length > 0) {
            return direct.trim();
        }
    }
    const node = record.node;
    if (node !== null && typeof node === 'object') {
        return firstStringField(node, fields);
    }
    return null;
}

function extensionsFor(languageId: BackendStudioLanguageServerRegistration['languageId']): readonly string[] {
    switch (languageId) {
        case 'rust':
            return Object.freeze(['.rs']);
        case 'cpp':
            return Object.freeze(['.h', '.hpp', '.c', '.cc', '.cpp']);
        case 'python':
            return Object.freeze(['.py']);
        case 'typescript':
            return Object.freeze(['.ts', '.tsx']);
    }
}

function parseLineSuffix(uri: string): number | null {
    const hash = /#L(\d+)$/.exec(uri);
    if (hash) {
        return Math.max(0, Number(hash[1]) - 1);
    }
    const colon = /:(\d+)$/.exec(uri);
    if (colon && !/^[a-z]+:\/\/[^/]+:\d+$/i.test(uri)) {
        return Math.max(0, Number(colon[1]) - 1);
    }
    return null;
}

function stripLineSuffix(uri: string): string {
    return uri.replace(/#L\d+$/, '').replace(/:(\d+)$/, '');
}
