import { inject, injectable } from '@theia/core/shared/inversify';
import { MonacoLanguages } from '@theia/monaco/lib/browser/monaco-languages';
import {
    BACKEND_STUDIO_LSP_CONTRIBUTIONS,
    BackendStudioLanguageId,
    BackendStudioLspContribution
} from '../common';

@injectable()
export class BackendStudioLanguageService {
    @inject(MonacoLanguages)
    protected readonly monacoLanguages!: MonacoLanguages;

    registerLanguageContributions(): readonly BackendStudioLspContribution[] {
        for (const contribution of BACKEND_STUDIO_LSP_CONTRIBUTIONS) {
            this.registerMonacoLanguage(contribution);
        }
        return BACKEND_STUDIO_LSP_CONTRIBUTIONS;
    }

    protected registerMonacoLanguage(contribution: BackendStudioLspContribution): void {
        const languages = this.monacoLanguages as unknown as {
            register?: (language: {
                id: string;
                aliases?: readonly string[];
                extensions?: readonly string[];
            }) => unknown;
            registerIcon?: (languageId: string, iconClass: string) => unknown;
        };
        languages.register?.({
            id: contribution.languageId,
            aliases: Object.freeze([contribution.command]),
            extensions: extensionsFor(contribution.languageId)
        });
        languages.registerIcon?.(
            contribution.languageId,
            `backend-studio-${contribution.languageId}`
        );
    }
}

function extensionsFor(languageId: BackendStudioLanguageId): readonly string[] {
    switch (languageId) {
        case 'rust':
            return Object.freeze(['.rs']);
        case 'cpp':
            return Object.freeze(['.h', '.hpp', '.c', '.cc', '.cpp']);
        case 'python':
            return Object.freeze(['.py']);
    }
}
