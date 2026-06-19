import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
    MExtensionMiniMode,
    SharedBridgeAdapter,
    SHARED_BRIDGE_ADAPTER
} from '@pratibimba/m-extension-runtime';
import { EXTENSION_ID } from '../../common';
import { privacyChromeClass, SURFACE_PRIVACY_TOOLTIP } from '../privacy-chrome';
import {
    IChingCastResult,
    M4IChingCastPanel,
    QUERY_ICHING_READING_METHOD,
    buildIChingCastResult,
    castIChingWithThreeCoins,
    hexagramPairLabel,
    normalizeIChingReading
} from './oracle/iching';
import {
    DRAW_TAROT_CARD_METHOD,
    M4TarotDrawPanel,
    Q_FRAMESTORE_POSITION_SEMANTICS_METHOD,
    TarotDrawResult,
    normalizeTarotDrawResult,
    withPositionSemantics
} from './oracle/tarot';
import {
    IChingCastHistory,
    IChingCastHistoryEntry,
    TarotDrawHistory,
    TarotDrawHistoryEntry,
    capHistory
} from './oracle/history';

export const ORACLE_CAST_VIEW_ID = 'm4.nara.oracleCast';
export const ORACLE_CAST_LABEL = 'M4 Oracle Cast';
export const M4_ORACLE_CAST_BADGE_EXPORT = 'M4OracleCastBadge' as const;
export const COMPOSITE_ORACLE_READING_METHOD = 'composite_oracle_reading';

export type OracleCastMode = 'iching' | 'tarot';
export type OracleActionStatus = 'idle' | 'casting-iching' | 'drawing-tarot' | 'reading-position' | 'composing' | 'error';

export interface CompositeOracleReading {
    readonly iChing: IChingCastResult;
    readonly tarot: TarotDrawResult;
    readonly compositeResonance: number;
    readonly compositeText: string;
}

export interface OracleCastModel {
    readonly activeMode: OracleCastMode;
    readonly iChing: IChingCastResult | null;
    readonly tarot: TarotDrawResult | null;
    readonly composite: CompositeOracleReading | null;
    readonly iChingHistory: IChingCastHistory;
    readonly tarotHistory: TarotDrawHistory;
    readonly status: OracleActionStatus;
    readonly errorMessage: string | null;
    readonly tarotPositionExpanded: boolean;
    readonly privacyClass: 'protected_local';
}

export interface M4OracleCastBadgeProps {
    readonly model: OracleCastModel;
    readonly mode?: MExtensionMiniMode;
    readonly onModeChange: (mode: OracleCastMode) => void;
    readonly onCastIChing: () => void;
    readonly onDrawTarot: () => void;
    readonly onReadTarotPosition: () => void;
    readonly onCastComposite: () => void;
}

interface GatewayBridge {
    invokeGatewayRpc(method: string, params: Record<string, unknown>): Promise<unknown>;
}

export const M4OracleCastBadge: React.FC<M4OracleCastBadgeProps> = ({
    model,
    mode = 'compact-card',
    onModeChange,
    onCastIChing,
    onDrawTarot,
    onReadTarotPosition,
    onCastComposite
}) => {
    const compositeReady = Boolean(model.iChing && model.tarot);
    return (
        <section
            className={`m4-oracle-cast ${privacyChromeClass('protected_local')}`}
            data-test="m4-oracle-cast"
            data-track="TRACK_08"
            data-export={M4_ORACLE_CAST_BADGE_EXPORT}
            data-view-id={ORACLE_CAST_VIEW_ID}
            data-mode={mode}
            data-active-mode={model.activeMode}
            data-composite-ready={compositeReady ? 'true' : 'false'}
            data-privacy-class={model.privacyClass}
            aria-label="Composite oracle cast"
        >
            <header className="m4-oracle-header">
                <h3>Oracle Cast</h3>
                <span className="m4-oracle-privacy mext-privacy-protected-local" data-test="m4-oracle-privacy">
                    protected-local
                </span>
            </header>
            <div className="m4-oracle-tabs" role="tablist" aria-label="Oracle modes">
                <button
                    type="button"
                    role="tab"
                    aria-selected={model.activeMode === 'iching'}
                    data-test="m4-oracle-tab"
                    data-mode="iching"
                    onClick={() => onModeChange('iching')}
                >
                    I-Ching
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={model.activeMode === 'tarot'}
                    data-test="m4-oracle-tab"
                    data-mode="tarot"
                    onClick={() => onModeChange('tarot')}
                >
                    Tarot
                </button>
            </div>
            {model.activeMode === 'iching' ? (
                <M4IChingCastPanel
                    result={model.iChing}
                    history={model.iChingHistory}
                    mode={mode}
                    busy={model.status === 'casting-iching'}
                    onCast={onCastIChing}
                />
            ) : (
                <M4TarotDrawPanel
                    result={model.tarot}
                    history={model.tarotHistory}
                    mode={mode}
                    busy={model.status === 'drawing-tarot'}
                    readingPosition={model.status === 'reading-position'}
                    expanded={model.tarotPositionExpanded}
                    onDraw={onDrawTarot}
                    onTogglePosition={onReadTarotPosition}
                />
            )}
            <footer className="m4-oracle-composite">
                <button
                    type="button"
                    data-test="m4-oracle-cast-composite"
                    disabled={!compositeReady || model.status === 'composing'}
                    onClick={onCastComposite}
                >
                    {model.status === 'composing' ? 'Composing' : 'Cast composite'}
                </button>
                {model.composite ? (
                    <article data-test="m4-oracle-composite-result" data-composite-resonance={model.composite.compositeResonance}>
                        <strong>Resonance {model.composite.compositeResonance.toFixed(3)}</strong>
                        <p>{model.composite.compositeText}</p>
                    </article>
                ) : null}
                {model.errorMessage ? (
                    <p className="m4-oracle-error" data-test="m4-oracle-error">{model.errorMessage}</p>
                ) : null}
            </footer>
        </section>
    );
};

@injectable()
export class OracleCastWidget extends ReactWidget {
    static readonly ID = ORACLE_CAST_VIEW_ID;
    static readonly LABEL = ORACLE_CAST_LABEL;

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    protected activeMode: OracleCastMode = 'iching';
    protected iChing: IChingCastResult | null = null;
    protected tarot: TarotDrawResult | null = null;
    protected composite: CompositeOracleReading | null = null;
    protected iChingHistory: IChingCastHistory = Object.freeze([]);
    protected tarotHistory: TarotDrawHistory = Object.freeze([]);
    protected status: OracleActionStatus = 'idle';
    protected errorMessage: string | null = null;
    protected tarotPositionExpanded = false;

    @postConstruct()
    public init(): void {
        this.id = OracleCastWidget.ID;
        this.title.label = OracleCastWidget.LABEL;
        this.title.caption = SURFACE_PRIVACY_TOOLTIP;
        this.title.closable = true;
        this.addClass('mext-widget');
        this.addClass('mext-widget-' + EXTENSION_ID);
        this.addClass('m4-nara-oracle-cast');
        this.addClass(privacyChromeClass('protected_local'));
    }

    setMode(mode: OracleCastMode): void {
        this.activeMode = mode;
        this.update();
    }

    async castIChing(): Promise<void> {
        this.status = 'casting-iching';
        this.errorMessage = null;
        const cast = castIChingWithThreeCoins();
        this.iChing = cast;
        this.activeMode = 'iching';
        this.update();
        try {
            const reading = await this.bridge.invokeGatewayRpc(QUERY_ICHING_READING_METHOD, {
                hexagramNumber: cast.hexagramNumber
            });
            this.iChing = buildIChingCastResult(cast.lines, normalizeIChingReading(reading));
        } catch (error) {
            this.errorMessage = errorMessage(error);
        }
        this.iChingHistory = pushIChingHistory(this.iChing ?? cast, this.iChingHistory);
        this.status = this.errorMessage ? 'error' : 'idle';
        this.update();
    }

    async drawTarot(): Promise<void> {
        this.status = 'drawing-tarot';
        this.errorMessage = null;
        this.activeMode = 'tarot';
        this.tarotPositionExpanded = false;
        this.update();
        try {
            const raw = await this.bridge.invokeGatewayRpc(DRAW_TAROT_CARD_METHOD, {
                spreadType: 'single-card',
                positionFamily: 'quaternal'
            });
            this.tarot = normalizeTarotDrawResult(raw);
            this.tarotHistory = pushTarotHistory(this.tarot, this.tarotHistory);
            this.status = 'idle';
        } catch (error) {
            this.errorMessage = errorMessage(error);
            this.status = 'error';
        }
        this.update();
    }

    async readTarotPosition(): Promise<void> {
        if (!this.tarot) {
            return;
        }
        if (this.tarotPositionExpanded && this.tarot.semantics) {
            this.tarotPositionExpanded = false;
            this.update();
            return;
        }
        this.status = 'reading-position';
        this.errorMessage = null;
        this.tarotPositionExpanded = true;
        this.update();
        try {
            const raw = await this.bridge.invokeGatewayRpc(Q_FRAMESTORE_POSITION_SEMANTICS_METHOD, {
                position: this.tarot.position,
                frame: 'quaternal'
            });
            this.tarot = withPositionSemantics(this.tarot, raw);
            this.status = 'idle';
        } catch (error) {
            this.errorMessage = errorMessage(error);
            this.status = 'error';
        }
        this.update();
    }

    async castComposite(): Promise<void> {
        if (!this.iChing || !this.tarot) {
            return;
        }
        this.status = 'composing';
        this.errorMessage = null;
        this.update();
        try {
            this.composite = await compositeOracleReading(this.bridge, this.iChing, this.tarot);
            this.status = 'idle';
        } catch (error) {
            this.errorMessage = errorMessage(error);
            this.status = 'error';
        }
        this.update();
    }

    protected override render(): React.ReactNode {
        return (
            <div
                className={`mext-widget-root ${privacyChromeClass('protected_local')}`}
                data-test="m4-oracle-cast-root"
            >
                <M4OracleCastBadge
                    model={this.model()}
                    mode="inspector"
                    onModeChange={mode => this.setMode(mode)}
                    onCastIChing={() => void this.castIChing()}
                    onDrawTarot={() => void this.drawTarot()}
                    onReadTarotPosition={() => void this.readTarotPosition()}
                    onCastComposite={() => void this.castComposite()}
                />
            </div>
        );
    }

    protected model(): OracleCastModel {
        return Object.freeze({
            activeMode: this.activeMode,
            iChing: this.iChing,
            tarot: this.tarot,
            composite: this.composite,
            iChingHistory: this.iChingHistory,
            tarotHistory: this.tarotHistory,
            status: this.status,
            errorMessage: this.errorMessage,
            tarotPositionExpanded: this.tarotPositionExpanded,
            privacyClass: 'protected_local' as const
        });
    }
}

export async function compositeOracleReading(
    bridge: GatewayBridge,
    iChing: IChingCastResult,
    tarot: TarotDrawResult
): Promise<CompositeOracleReading> {
    const raw = await bridge.invokeGatewayRpc(COMPOSITE_ORACLE_READING_METHOD, {
        iChing,
        tarot
    });
    return normalizeCompositeOracleReading(raw, iChing, tarot);
}

export function normalizeCompositeOracleReading(
    value: unknown,
    iChing: IChingCastResult,
    tarot: TarotDrawResult
): CompositeOracleReading {
    const record = objectValue(value);
    const resonance = numberValue(record?.compositeResonance ?? record?.resonance);
    return Object.freeze({
        iChing,
        tarot,
        compositeResonance: resonance,
        compositeText: stringValue(record?.compositeText ?? record?.text)
    });
}

export function pushIChingHistory(
    result: IChingCastResult,
    history: IChingCastHistory,
    timestamp = new Date().toISOString()
): IChingCastHistory {
    const entry: IChingCastHistoryEntry = Object.freeze({
        timestamp,
        hexagramPair: hexagramPairLabel(result)
    });
    return capHistory([entry, ...history]);
}

export function pushTarotHistory(
    result: TarotDrawResult,
    history: TarotDrawHistory,
    timestamp = new Date().toISOString()
): TarotDrawHistory {
    const entry: TarotDrawHistoryEntry = Object.freeze({
        timestamp,
        cardName: result.cardName,
        position: result.position,
        reversed: result.reversed
    });
    return capHistory([entry, ...history]);
}

function objectValue(value: unknown): Readonly<Record<string, unknown>> | undefined {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value as Readonly<Record<string, unknown>>
        : undefined;
}

function stringValue(value: unknown): string {
    return typeof value === 'string' ? value : '';
}

function numberValue(value: unknown): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}
