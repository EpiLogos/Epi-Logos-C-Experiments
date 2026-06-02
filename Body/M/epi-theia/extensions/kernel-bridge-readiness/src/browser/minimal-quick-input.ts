import { injectable } from '@theia/core/shared/inversify';
import {
    CancellationToken,
    Disposable,
    Emitter,
    Event,
    QuickInputButton,
    QuickInputService,
    QuickPick,
    QuickPickInput,
    QuickPickItem,
    QuickPickItemOrSeparator,
    QuickPickOptions,
    QuickPickSeparator
} from '@theia/core/lib/common';
import {
    QuickAccessProviderDescriptor,
    QuickAccessRegistry
} from '@theia/core/lib/browser/quick-input';

@injectable()
export class MinimalQuickAccessRegistry implements QuickAccessRegistry {
    static readonly SERVICE_ID = QuickAccessRegistry;

    protected readonly providers: QuickAccessProviderDescriptor[] = [];

    registerQuickAccessProvider(provider: QuickAccessProviderDescriptor): Disposable {
        this.providers.push(provider);
        return Disposable.create(() => {
            const index = this.providers.indexOf(provider);
            if (index >= 0) {
                this.providers.splice(index, 1);
            }
        });
    }

    getQuickAccessProviders(): QuickAccessProviderDescriptor[] {
        return [...this.providers];
    }

    getQuickAccessProvider(prefix: string): QuickAccessProviderDescriptor | undefined {
        return this.providers.find(provider => provider.prefix === prefix);
    }

    clear(): void {
        this.providers.length = 0;
    }
}

@injectable()
export class MinimalQuickInputService implements QuickInputService {
    static readonly SERVICE_ID = QuickInputService;

    readonly backButton: QuickInputButton = Object.freeze({
        iconClasses: ['codicon', 'codicon-arrow-left'],
        tooltip: 'Back'
    });

    protected readonly onShowEmitter = new Emitter<void>();
    readonly onShow: Event<void> = this.onShowEmitter.event;

    protected readonly onHideEmitter = new Emitter<void>();
    readonly onHide: Event<void> = this.onHideEmitter.event;

    open(_filter: string): void {
        this.onShowEmitter.fire();
        this.hide();
    }

    createInputBox(): never {
        throw new Error('Quick input boxes are not enabled in the Pratibimba minimal browser shell.');
    }

    async input(_options?: unknown, token?: CancellationToken): Promise<string | undefined> {
        return token?.isCancellationRequested ? undefined : undefined;
    }

    async pick<T extends QuickPickItem>(
        picks: Promise<QuickPickInput<T>[]> | QuickPickInput<T>[],
        options?: any,
        token?: CancellationToken
    ): Promise<any> {
        if (token?.isCancellationRequested) {
            return undefined;
        }
        await Promise.resolve(picks);
        return options?.canPickMany ? [] : undefined;
    }

    async showQuickPick<T extends QuickPickItem>(
        _items: Array<T | QuickPickSeparator>,
        _options?: QuickPickOptions<T>
    ): Promise<T | undefined> {
        return undefined;
    }

    hide(): void {
        this.onHideEmitter.fire();
    }

    createQuickPick<T extends QuickPickItem>(): QuickPick<T> {
        const disposables: Disposable[] = [];
        const quickPick = {
            activeItems: [] as T[],
            buttons: [] as QuickInputButton[],
            busy: false,
            canSelectMany: false,
            enabled: true,
            hide: () => this.hide(),
            ignoreFocusOut: false,
            items: [] as QuickPickItemOrSeparator[],
            matchOnDescription: false,
            matchOnDetail: false,
            onDidAccept: Event.None,
            onDidChangeActive: Event.None,
            onDidChangeSelection: Event.None,
            onDidChangeValue: Event.None,
            onDidHide: this.onHide,
            onDidTriggerButton: Event.None,
            onDidTriggerItemButton: Event.None,
            placeholder: undefined,
            selectedItems: [] as T[],
            show: () => this.onShowEmitter.fire(),
            step: undefined,
            title: undefined,
            totalSteps: undefined,
            value: '',
            dispose: () => {
                for (const disposable of disposables) {
                    disposable.dispose();
                }
            }
        };
        return quickPick as unknown as QuickPick<T>;
    }
}
