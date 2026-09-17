// Generated from contracts/07-t0-extension-contract-preflight.json. Do not hand-edit.
import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { CommandService } from '@theia/core/lib/common';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { PreferenceService } from '@theia/core/lib/browser/preferences';
import {
    SharedBridgeAdapter,
    MExtensionReadinessSnapshot,
    PENDING_M_READINESS,
    MathemeHarmonicProfileBoundary,
    CoordinateContext,
    EMPTY_COORDINATE_CONTEXT,
    Disposable,
    ReadinessBanner,
    SHARED_BRIDGE_ADAPTER
} from '@pratibimba/m-extension-runtime';
import {
    EXTENSION_ID,
    PRIMARY_VIEW_ID,
    DECLARED_BLOCKERS,
    PRIVACY_CLASS
} from '../common';
import { M1AudioBusInspectorView } from './m1-audio-bus-inspector-view';
import { M1ParamasivaExtensionBody } from './m1-paramasiva-extension-body';

const ACTIVE_LAYOUT_PREFERENCE = 'epi-logos.layout.active';
const DEVELOPER_MODE_PREFERENCE = 'epi-logos.ui.developerMode';
type M1ParamasivaActiveView = 'clockInstrument' | 'audioBusInspector';

@injectable()
export class M1ParamasivaWidget extends ReactWidget {
    static readonly ID = PRIMARY_VIEW_ID;
    static readonly LABEL = 'M1 — Paramasiva';

    @inject(SHARED_BRIDGE_ADAPTER)
    protected readonly bridge!: SharedBridgeAdapter;

    @inject(PreferenceService)
    protected readonly preferences!: PreferenceService;

    @inject(CommandService)
    protected readonly commands!: CommandService;

    protected readiness: MExtensionReadinessSnapshot = PENDING_M_READINESS;
    protected profile: MathemeHarmonicProfileBoundary | null = null;
    protected context: CoordinateContext = EMPTY_COORDINATE_CONTEXT;
    protected layoutMode = 'daily-0-1';
    protected developerMode = false;
    protected activeView: M1ParamasivaActiveView = 'clockInstrument';
    protected subscriptions: Disposable[] = [];

    @postConstruct()
    protected init(): void {
        this.id = M1ParamasivaWidget.ID;
        this.title.label = M1ParamasivaWidget.LABEL;
        this.title.caption = M1ParamasivaWidget.LABEL;
        this.title.closable = true;
        this.addClass('mext-widget');
        this.addClass('mext-widget-' + EXTENSION_ID);
        this.refreshUiPreferences();

        this.subscriptions.push(
            this.bridge.onReadiness(snapshot => {
                this.readiness = snapshot;
                this.update();
            })
        );
        this.subscriptions.push(
            this.bridge.onProfile(profile => {
                this.profile = profile;
                this.update();
            })
        );
        this.subscriptions.push(
            this.bridge.onCoordinateContext(context => {
                this.context = context;
                this.update();
            })
        );
        this.subscriptions.push(
            this.preferences.onPreferenceChanged(change => {
                if (
                    change.preferenceName === ACTIVE_LAYOUT_PREFERENCE ||
                    change.preferenceName === DEVELOPER_MODE_PREFERENCE
                ) {
                    this.refreshUiPreferences();
                    this.update();
                }
            })
        );
    }

    override dispose(): void {
        for (const sub of this.subscriptions) {
            try {
                sub.dispose();
            } catch {
                // best-effort
            }
        }
        super.dispose();
    }

    protected override render(): React.ReactNode {
        const provenance = `privacy=${PRIVACY_CLASS} | generation=${this.context.profileGeneration ?? '—'} | pointer=${this.context.pointerAnchor ?? '—'}`;
        const body =
            this.activeView === 'audioBusInspector' ? (
                <M1AudioBusInspectorView
                    profile={this.profile}
                    readiness={this.readiness}
                    context={this.context}
                />
            ) : (
                <M1ParamasivaExtensionBody
                    profile={this.profile}
                    readiness={this.readiness}
                    context={this.context}
                    layoutMode={this.layoutMode}
                    developerMode={this.developerMode}
                    observabilityBridge={this.bridge}
                    onObservabilityEvent={event => this.bridge.publish(event)}
                    commands={this.commands}
                />
            );
        return (
            <div className="mext-widget-root">
                <ReadinessBanner
                    extensionId={EXTENSION_ID}
                    extensionLabel={M1ParamasivaWidget.LABEL}
                    snapshot={this.readiness}
                    declaredBlockers={DECLARED_BLOCKERS}
                    provenance={provenance}
                />
                {body}
            </div>
        );
    }

    setActiveView(view: M1ParamasivaActiveView): void {
        this.activeView = view;
        this.update();
    }

    protected refreshUiPreferences(): void {
        this.layoutMode = this.preferences.get<string>(ACTIVE_LAYOUT_PREFERENCE, 'daily-0-1');
        this.developerMode = this.preferences.get<boolean>(DEVELOPER_MODE_PREFERENCE, false);
    }
}
