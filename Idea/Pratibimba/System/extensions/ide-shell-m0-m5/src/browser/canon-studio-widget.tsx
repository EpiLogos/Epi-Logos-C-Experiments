import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    KERNEL_BRIDGE_API,
    type KernelBridgeAPI
} from '@pratibimba/kernel-bridge';
import { IDE_SHELL_WIDGET_IDS, isPrivacySafe } from '../common/contract';
import { decorateCoordinates } from '../common/decorations';
import { VAULT_BRIDGE_WRITE_COMMAND } from '../common/vault-bridge-gate';
import { IdeShellBridgeGate } from './bridge-gate';

/**
 * Result returned by Canon Studio save attempts. Per IOD-19, vault writes are
 * gated by the Hen vault-bridge. Until that extension lands (T4.5 — gated on
 * Track 03 T6.5), Canon Studio saves MUST be rejected with the canonical
 * message "no vault-bridge registered". This file enforces that contract.
 */
export interface CanonStudioSaveResult {
    readonly ok: boolean;
    readonly reason: string;
    readonly routedThrough: 'vault-bridge' | 'rejected';
}
/**
 * Canon Studio — Theia-native markdown editor. Track 05 T4.
 *
 * Surface scope for T4:
 *   - Read markdown files from the vault/repo via Theia filesystem provider.
 *   - Render the markdown source in a textarea with light decoration of
 *     QL coordinates (#0..#5, M0..M5, S0..S5, etc.) and bimba wikilinks.
 *   - Route saves through the vault-bridge extension. When no vault-bridge is
 *     registered (T4.5 has not landed yet), saves are REJECTED with a clean
 *     surfaced error — NEVER silently falling through to Theia FS write.
 *
 * Wikilink autocompletion arrives at T4.5. The editor scaffold here is T4-only.
 *
 * The vault-bridge command id is `vault-bridge.s1prime.vault.write_file`
 * (per ADR 05-010). If `CommandRegistry.getCommand(...)` returns null, the
 * widget surfaces the rejection.
 */
@injectable()
export class CanonStudioWidget extends ReactWidget {
    static readonly ID = IDE_SHELL_WIDGET_IDS.CANON_STUDIO;
    static readonly LABEL = 'Canon Studio';

    /** Vault-bridge write-file command id (T4.5 will register this). */
    static readonly VAULT_BRIDGE_WRITE_COMMAND = VAULT_BRIDGE_WRITE_COMMAND;

    @inject(KERNEL_BRIDGE_API)
    protected readonly bridge!: KernelBridgeAPI;

    protected uri: string | null = null;
    protected content: string = '';
    protected dirty: boolean = false;
    protected lastSaveResult: CanonStudioSaveResult | null = null;
    /** Injected by the contribution at activation time. */
    public vaultBridgeAvailable: () => boolean = () => false;
    public vaultBridgeWrite: (uri: string, content: string) => Promise<void> =
        async () => {
            throw new Error('canon-studio: vault-bridge dispatcher not initialised');
        };

    @postConstruct()
    protected init(): void {
        this.id = CanonStudioWidget.ID;
        this.title.label = CanonStudioWidget.LABEL;
        this.title.caption = CanonStudioWidget.LABEL;
        this.title.closable = true;
        this.addClass('ide-shell-widget');
        this.addClass('ide-shell-canon-studio');
    }

    openFile(uri: string, initialContent: string, privacyClass?: string): void {
        if (!isPrivacySafe(privacyClass)) {
            this.lastSaveResult = {
                ok: false,
                reason: `canon-studio: refused to open file with privacy class "${privacyClass}"`,
                routedThrough: 'rejected'
            };
            this.update();
            return;
        }
        this.uri = uri;
        this.content = initialContent;
        this.dirty = false;
        this.update();
    }

    setContent(content: string): void {
        if (this.content !== content) {
            this.content = content;
            this.dirty = true;
            this.update();
        }
    }

    /**
     * Attempt a save. ALWAYS routes through the vault-bridge command. If the
     * vault-bridge isn't registered (T4.5 not landed), the result is a clean
     * rejection — never a fall-through to Theia FS write.
     */
    async save(): Promise<CanonStudioSaveResult> {
        if (this.uri === null) {
            const result: CanonStudioSaveResult = {
                ok: false,
                reason: 'canon-studio: no file open',
                routedThrough: 'rejected'
            };
            this.lastSaveResult = result;
            this.update();
            return result;
        }
        if (!this.vaultBridgeAvailable()) {
            const result: CanonStudioSaveResult = {
                ok: false,
                reason: 'no vault-bridge registered',
                routedThrough: 'rejected'
            };
            this.lastSaveResult = result;
            this.update();
            return result;
        }
        try {
            await this.vaultBridgeWrite(this.uri, this.content);
            this.dirty = false;
            const result: CanonStudioSaveResult = {
                ok: true,
                reason: 'vault-bridge accepted write',
                routedThrough: 'vault-bridge'
            };
            this.lastSaveResult = result;
            this.update();
            return result;
        } catch (err) {
            const reason = err instanceof Error ? err.message : String(err);
            const result: CanonStudioSaveResult = {
                ok: false,
                reason,
                routedThrough: 'vault-bridge'
            };
            this.lastSaveResult = result;
            this.update();
            return result;
        }
    }

    protected override render(): React.ReactNode {
        return (
            <IdeShellBridgeGate bridge={this.bridge} widgetLabel={CanonStudioWidget.LABEL}>
                {this.renderEditor()}
            </IdeShellBridgeGate>
        );
    }

    protected renderEditor(): React.ReactNode {
        const decorations = decorateCoordinates(this.content);
        return (
            <div className="ide-shell-widget-root" data-test="canon-studio-root">
                <header className="ide-shell-widget-header">
                    <h3>{CanonStudioWidget.LABEL}</h3>
                    <span data-test="canon-studio-uri">{this.uri ?? '(no file open)'}</span>
                    <span data-test="canon-studio-dirty">
                        {this.dirty ? 'dirty' : 'clean'}
                    </span>
                </header>
                <section className="ide-shell-widget-detail">
                    <textarea
                        className="ide-shell-canon-textarea"
                        data-test="canon-studio-textarea"
                        value={this.content}
                        onChange={e => this.setContent(e.target.value)}
                        disabled={this.uri === null}
                        rows={20}
                    />
                    <button
                        type="button"
                        data-test="canon-studio-save-button"
                        onClick={() => void this.save()}
                        disabled={this.uri === null}
                    >
                        Save (route through vault-bridge)
                    </button>
                    {this.lastSaveResult && (
                        <p
                            className={
                                this.lastSaveResult.ok
                                    ? 'ide-shell-save-ok'
                                    : 'ide-shell-save-rejected'
                            }
                            data-test="canon-studio-save-result"
                            data-save-ok={this.lastSaveResult.ok ? 'true' : 'false'}
                            data-routed-through={this.lastSaveResult.routedThrough}
                        >
                            {this.lastSaveResult.reason}
                        </p>
                    )}
                </section>
                <section className="ide-shell-widget-detail">
                    <h4>Decorations (QL coordinates + wikilinks)</h4>
                    <ul data-test="canon-studio-decorations">
                        {decorations.map((d, i) => (
                            <li key={`${d.kind}-${d.match}-${i}`}>
                                <code data-decoration-kind={d.kind}>{d.match}</code>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        );
    }
}
