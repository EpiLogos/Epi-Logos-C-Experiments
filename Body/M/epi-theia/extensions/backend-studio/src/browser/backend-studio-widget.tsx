import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { Message } from '@theia/core/lib/browser/widgets/widget';
import {
    BACKEND_STUDIO_LSP_CONTRIBUTIONS,
    BACKEND_STUDIO_PROVENANCE_ROOTS,
    BACKEND_STUDIO_WIDGET_ID,
    EXTENSION_ID
} from '../common';
import { BackendStudioLanguageService } from './backend-studio-language-service';

@injectable()
export class BackendStudioWidget extends ReactWidget {
    static readonly ID = BACKEND_STUDIO_WIDGET_ID;
    static readonly LABEL = 'Backend Studio';

    @inject(BackendStudioLanguageService)
    protected readonly languages!: BackendStudioLanguageService;

    protected registered = false;

    @postConstruct()
    protected init(): void {
        this.id = BackendStudioWidget.ID;
        this.title.label = BackendStudioWidget.LABEL;
        this.title.caption = 'LSP provenance for epi-lib, portal-core, and S1-S5 cores';
        this.title.closable = true;
        this.addClass('backend-studio-widget');
    }

    protected override onActivateRequest(msg: Message): void {
        super.onActivateRequest(msg);
        if (!this.registered) {
            this.languages.registerLanguageContributions();
            this.registered = true;
            this.update();
        }
    }

    protected override render(): React.ReactNode {
        return (
            <div className="backend-studio-root" data-extension-id={EXTENSION_ID}>
                <section className="backend-studio-panel">
                    <h3>LSP Contributions</h3>
                    <ul>
                        {BACKEND_STUDIO_LSP_CONTRIBUTIONS.map(contribution => (
                            <li key={contribution.id}>
                                <strong>{contribution.command}</strong>
                                <span>{contribution.languageId}</span>
                                <small>{contribution.provenance}</small>
                            </li>
                        ))}
                    </ul>
                </section>
                <section className="backend-studio-panel">
                    <h3>Core Provenance</h3>
                    <ul>
                        {BACKEND_STUDIO_PROVENANCE_ROOTS.map(root => (
                            <li key={`${root.core}-${root.path}`}>
                                <strong>{root.label}</strong>
                                <code>{root.path}</code>
                                <span>{root.lsp}</span>
                                <small>{root.provenance}</small>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        );
    }
}
