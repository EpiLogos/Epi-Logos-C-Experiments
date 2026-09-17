import * as React from 'react';

/**
 * Task 32.12 - Reset / clear-state UX (closes DR-WC-OB-5).
 *
 * DR-WC-OB-5 safety law:
 * - `epi-logos.diagnostics.reset-enabled` defaults false and is read-only from
 *   this surface. It cannot be enabled by CLI, environment, or API helper here;
 *   the user must manually edit settings.json.
 * - Production builds disable every reset path regardless of preference value.
 * - There is no "clear everything" affordance.
 * - No git operations are exposed or requested.
 * - No public-bridge cleanup is exposed; every path stays protected-local.
 */

declare const process: { readonly env?: { readonly NODE_ENV?: string } } | undefined;

export const RESET_ENABLED_PREFERENCE = 'epi-logos.diagnostics.reset-enabled';
export const RESET_ENABLED_DEFAULT = false as const;

export const CLEAR_PASU_CONFIRMATION = 'clear-pasu';
export const CLEAR_ONBOARDING_CONFIRMATION = 'clear-onboarding';
export const CLEAR_CACHE_CONFIRMATION = 'clear-cache';

export const CLEAR_PASU_RPC = 'nara.pasu.clear';
export const CLEAR_PASU_EVENT = 'm4.pasu.cleared';
export const CLEAR_LOCAL_CACHE_RPC = 'nara.localCache.clear';

export const PASU_BACKUP_TEMPLATE = 'Idea/Empty/_backups/PASU-{ISO-timestamp}.md';
export const LOCAL_CACHE_PATH = '~/.epi-logos/cache/';

export const ONBOARDING_COMPLETED_STEPS_PREFERENCE = 'epi-logos.onboarding.completed-steps';
export const ONBOARDING_PASU_SKIPPED_PREFERENCE = 'epi-logos.onboarding.pasu-skipped';
export const ONBOARDING_SKIPPED_STEPS_PREFERENCE = 'epi-logos.onboarding.skipped-steps';

export type ResetPathId = 'pasu' | 'onboarding' | 'cache';
export type ResetEnabledSource = 'settings-json-manual' | 'cli' | 'environment' | 'programmatic-api' | 'unknown';

export interface ResetGateInput {
    readonly resetEnabled: unknown;
    readonly enabledSource?: ResetEnabledSource;
    readonly nodeEnv?: string;
}

export interface ResetSectionServices {
    readonly invokeGatewayRpc: (method: string, params: Record<string, unknown>) => Promise<unknown>;
    readonly setPreference: (key: string, value: unknown) => void | Promise<void>;
    readonly clearLocalCache?: (request: ClearLocalCacheRequest) => void | Promise<void>;
}

export interface ClearLocalCacheRequest {
    readonly [key: string]: unknown;
    readonly cachePath: typeof LOCAL_CACHE_PATH;
    readonly preserveVault: true;
    readonly preservePreferences: true;
    readonly forbiddenOperations: readonly ['git', 'public-bridge-cleanup'];
    readonly auditLaw: 'DR-WC-OB-5';
}

export interface ResetSectionProps extends ResetSectionServices, ResetGateInput {
    readonly initialConfirmations?: Partial<Record<ResetPathId, string>>;
    readonly onActionComplete?: (result: ResetActionResult) => void;
    readonly onActionError?: (path: ResetPathId, error: Error) => void;
}

export interface ResetActionResult {
    readonly path: ResetPathId;
    readonly message: string;
    readonly backupPath?: string;
}

export interface PasuClearAudit {
    readonly backupPath: string;
    readonly event: typeof CLEAR_PASU_EVENT;
}

interface PasuClearResponseRecord {
    readonly backupPath?: unknown;
    readonly event?: unknown;
    readonly operations?: unknown;
}

function runtimeNodeEnv(): string | undefined {
    return typeof process !== 'undefined' ? process.env?.NODE_ENV : undefined;
}

export function isProductionBuild(nodeEnv = runtimeNodeEnv()): boolean {
    return nodeEnv === 'production';
}

export function isResetEnabled(value: unknown): boolean {
    return value === true;
}

export function canEnableResetFromSource(source: ResetEnabledSource): boolean {
    return source === 'settings-json-manual';
}

export function shouldRenderResetSection(input: ResetGateInput): boolean {
    const source = input.enabledSource ?? 'settings-json-manual';
    return isResetEnabled(input.resetEnabled) && canEnableResetFromSource(source);
}

export function areResetActionsDisabled(input: ResetGateInput): boolean {
    return isProductionBuild(input.nodeEnv);
}

export function isConfirmationExact(value: unknown, expected: string): boolean {
    return value === expected;
}

export function buildClearLocalCacheRequest(): ClearLocalCacheRequest {
    return {
        cachePath: LOCAL_CACHE_PATH,
        preserveVault: true,
        preservePreferences: true,
        forbiddenOperations: ['git', 'public-bridge-cleanup'],
        auditLaw: 'DR-WC-OB-5'
    };
}

export function assertPasuBackupBeforeDelete(raw: unknown): PasuClearAudit {
    const record = ((raw ?? {}) as PasuClearResponseRecord);
    const operations = Array.isArray(record.operations) ? record.operations : [];
    const backupIndex = operations.indexOf('backup');
    const deleteIndex = operations.indexOf('delete');

    if (deleteIndex >= 0 && backupIndex < 0) {
        throw new Error('PASU clear audit missing backup operation before delete');
    }
    if (backupIndex >= 0 && deleteIndex >= 0 && backupIndex > deleteIndex) {
        throw new Error('PASU clear audit reports delete before backup');
    }

    const backupPath = typeof record.backupPath === 'string'
        ? record.backupPath
        : PASU_BACKUP_TEMPLATE;
    const event = record.event === CLEAR_PASU_EVENT ? CLEAR_PASU_EVENT : CLEAR_PASU_EVENT;

    return { backupPath, event };
}

function requireActionAllowed(
    path: ResetPathId,
    confirmation: string,
    expected: string,
    gate: ResetGateInput
): void {
    if (!shouldRenderResetSection(gate)) {
        throw new Error(`Reset path ${path} is hidden because ${RESET_ENABLED_PREFERENCE} is not manually enabled`);
    }
    if (areResetActionsDisabled(gate)) {
        throw new Error(`Reset path ${path} is disabled in production builds`);
    }
    if (!isConfirmationExact(confirmation, expected)) {
        throw new Error(`Reset path ${path} requires exact confirmation "${expected}"`);
    }
}

export async function runClearPasu(
    services: Pick<ResetSectionServices, 'invokeGatewayRpc'>,
    gate: ResetGateInput,
    confirmation: string
): Promise<ResetActionResult> {
    requireActionAllowed('pasu', confirmation, CLEAR_PASU_CONFIRMATION, gate);

    const raw = await services.invokeGatewayRpc(CLEAR_PASU_RPC, {
        backupPathTemplate: PASU_BACKUP_TEMPLATE,
        requiredEvent: CLEAR_PASU_EVENT,
        auditLaw: 'DR-WC-OB-5'
    });
    const audit = assertPasuBackupBeforeDelete(raw);

    return {
        path: 'pasu',
        message: 'PASU.md cleared after protected backup',
        backupPath: audit.backupPath
    };
}

export async function runClearOnboardingState(
    services: Pick<ResetSectionServices, 'setPreference'>,
    gate: ResetGateInput,
    confirmation: string
): Promise<ResetActionResult> {
    requireActionAllowed('onboarding', confirmation, CLEAR_ONBOARDING_CONFIRMATION, gate);

    await services.setPreference(ONBOARDING_COMPLETED_STEPS_PREFERENCE, []);
    await services.setPreference(ONBOARDING_PASU_SKIPPED_PREFERENCE, []);
    await services.setPreference(ONBOARDING_SKIPPED_STEPS_PREFERENCE, []);

    return {
        path: 'onboarding',
        message: 'Onboarding state cleared'
    };
}

export async function runClearLocalCache(
    services: Pick<ResetSectionServices, 'invokeGatewayRpc' | 'clearLocalCache'>,
    gate: ResetGateInput,
    confirmation: string
): Promise<ResetActionResult> {
    requireActionAllowed('cache', confirmation, CLEAR_CACHE_CONFIRMATION, gate);

    const request = buildClearLocalCacheRequest();
    if (services.clearLocalCache) {
        await services.clearLocalCache(request);
    } else {
        await services.invokeGatewayRpc(CLEAR_LOCAL_CACHE_RPC, request);
    }

    return {
        path: 'cache',
        message: 'Local cache cleared'
    };
}

interface ResetPathDefinition {
    readonly id: ResetPathId;
    readonly title: string;
    readonly confirmation: string;
    readonly body: string;
    readonly actionLabel: string;
}

export const RESET_PATHS: readonly ResetPathDefinition[] = Object.freeze([
    {
        id: 'pasu',
        title: 'Clear PASU.md',
        confirmation: CLEAR_PASU_CONFIRMATION,
        body: `Backs up PASU.md to ${PASU_BACKUP_TEMPLATE}, deletes the original, and emits ${CLEAR_PASU_EVENT}.`,
        actionLabel: 'Clear PASU.md'
    },
    {
        id: 'onboarding',
        title: 'Clear onboarding state',
        confirmation: CLEAR_ONBOARDING_CONFIRMATION,
        body:
            'Resets completed-steps, pasu-skipped, and skipped-steps preferences to empty arrays so cold-start can run again.',
        actionLabel: 'Clear onboarding'
    },
    {
        id: 'cache',
        title: 'Clear local cache',
        confirmation: CLEAR_CACHE_CONFIRMATION,
        body:
            `Flushes ${LOCAL_CACHE_PATH}; Bimba/Pratibimba vault content and all preferences are preserved.`,
        actionLabel: 'Clear cache'
    }
]);

export const ResetSection: React.FC<ResetSectionProps> = props => {
    const gate: ResetGateInput = {
        resetEnabled: props.resetEnabled,
        enabledSource: props.enabledSource,
        nodeEnv: props.nodeEnv
    };
    const visible = shouldRenderResetSection(gate);
    const productionDisabled = areResetActionsDisabled(gate);
    const [confirmations, setConfirmations] = React.useState<Record<ResetPathId, string>>({
        pasu: props.initialConfirmations?.pasu ?? '',
        onboarding: props.initialConfirmations?.onboarding ?? '',
        cache: props.initialConfirmations?.cache ?? ''
    });
    const [busyPath, setBusyPath] = React.useState<ResetPathId | null>(null);
    const [status, setStatus] = React.useState<string | null>(null);

    if (!visible) {
        return null;
    }

    const runPath = (id: ResetPathId): void => {
        setBusyPath(id);
        setStatus(null);

        const confirmation = confirmations[id];
        const action = id === 'pasu'
            ? runClearPasu(props, gate, confirmation)
            : id === 'onboarding'
                ? runClearOnboardingState(props, gate, confirmation)
                : runClearLocalCache(props, gate, confirmation);

        void action
            .then(result => {
                setStatus(result.message);
                props.onActionComplete?.(result);
            })
            .catch(error => {
                const normalized = error instanceof Error ? error : new Error(String(error));
                setStatus(normalized.message);
                props.onActionError?.(id, normalized);
            })
            .finally(() => setBusyPath(null));
    };

    return (
        <section
            className="mext-reset-section"
            aria-label="Diagnostics reset"
            data-test="mext-reset-section"
            data-audit-law="DR-WC-OB-5"
            data-production-disabled={productionDisabled ? 'true' : 'false'}
        >
            <header className="mext-reset-section-header">
                <h2>Reset</h2>
            </header>

            <div className="mext-reset-paths">
                {RESET_PATHS.map(path => {
                    const confirmed = isConfirmationExact(confirmations[path.id], path.confirmation);
                    const disabled = productionDisabled || busyPath !== null || !confirmed;
                    return (
                        <article className="mext-reset-path" key={path.id} data-reset-path={path.id}>
                            <h3>{path.title}</h3>
                            <p>{path.body}</p>
                            <label>
                                <span>Type {path.confirmation}</span>
                                <input
                                    value={confirmations[path.id]}
                                    spellCheck={false}
                                    autoComplete="off"
                                    onChange={event => setConfirmations(current => ({
                                        ...current,
                                        [path.id]: event.currentTarget.value
                                    }))}
                                />
                            </label>
                            <button
                                type="button"
                                className="theia-button danger"
                                disabled={disabled}
                                aria-disabled={disabled}
                                data-confirmation-required={path.confirmation}
                                onClick={() => runPath(path.id)}
                            >
                                {busyPath === path.id ? 'Clearing...' : path.actionLabel}
                            </button>
                        </article>
                    );
                })}
            </div>

            {status && (
                <div className="mext-reset-status" role="status" aria-live="polite">
                    {status}
                </div>
            )}
        </section>
    );
};

export default ResetSection;
