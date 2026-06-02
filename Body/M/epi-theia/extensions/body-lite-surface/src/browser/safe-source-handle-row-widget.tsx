import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { CommandService } from '@theia/core/lib/common/command';
import {
    BODY_DEEP_LINK_COMMAND_IDS,
    BODY_LITE_WIDGET_IDS,
    type SafeSourceHandle
} from '../common';
import { BodyLiteRuntimeService } from './body-lite-runtime-service';

/**
 * Safe-Source-Handle Row Widget — Track 09 T9b.
 *
 * Renders in the 0/1 daily layout ONLY. Last N items the user touched
 * (S2 graph nodes, S5 review candidates, Canon Studio files, Atelier
 * entries). Handle-only — NEVER raw body or protected payload. Tap deep-
 * links to the appropriate deep IDE surface.
 */
@injectable()
export class SafeSourceHandleRowWidget extends ReactWidget {
    static readonly ID = BODY_LITE_WIDGET_IDS.SAFE_SOURCE_HANDLE_ROW;
    static readonly LABEL = 'Recent Items';

    @inject(BodyLiteRuntimeService)
    protected readonly runtime!: BodyLiteRuntimeService;

    @inject(CommandService)
    protected readonly commands!: CommandService;

    protected handles: ReadonlyArray<SafeSourceHandle> = [];

    @postConstruct()
    protected init(): void {
        this.id = SafeSourceHandleRowWidget.ID;
        this.title.label = SafeSourceHandleRowWidget.LABEL;
        this.title.caption = SafeSourceHandleRowWidget.LABEL;
        this.title.closable = false;
        this.addClass('body-lite-widget');
        this.addClass('body-lite-handle-row');
        this.runtime.onChange(state => {
            this.handles = state.safeHandles;
            this.update();
        });
    }

    protected handleTap = async (handle: SafeSourceHandle): Promise<void> => {
        // Route by kind — each kind has a typed deep-link command.
        switch (handle.kind) {
            case 'graph-node':
                await this.commands.executeCommand(BODY_DEEP_LINK_COMMAND_IDS.OPEN_GRAPH_NODE, {
                    nodeId: handle.handleId,
                    coordinate: handle.coordinate,
                    artifactUri: handle.artifactUri,
                    reviewId: handle.reviewId,
                    improvementId: handle.improvementId,
                    sessionKey: null,
                    dayNow: null,
                    profileGeneration: null,
                    privacyClass: 'public'
                });
                break;
            case 'review-candidate':
                await this.commands.executeCommand(BODY_DEEP_LINK_COMMAND_IDS.OPEN_REVIEW_ITEM, {
                    candidateId: handle.handleId,
                    humanRequired: false,
                    coordinate: handle.coordinate,
                    artifactUri: handle.artifactUri,
                    reviewId: handle.reviewId,
                    improvementId: handle.improvementId,
                    sessionKey: null,
                    dayNow: null,
                    profileGeneration: null,
                    privacyClass: 'public'
                });
                break;
            case 'canon-file':
            case 'atelier-entry':
                // Both routes pass through the open-control-room intent since
                // they target the deep IDE workbench panes (Canon Studio +
                // Logos Atelier) which the control-room shell owns.
                await this.commands.executeCommand(BODY_DEEP_LINK_COMMAND_IDS.OPEN_CONTROL_ROOM, {
                    focusCandidateId: null,
                    focusRunId: null,
                    coordinate: handle.coordinate,
                    reviewId: handle.reviewId,
                    improvementId: handle.improvementId,
                    artifactUri: handle.artifactUri,
                    sessionKey: null,
                    dayNow: null,
                    profileGeneration: null,
                    privacyClass: 'public'
                });
                break;
        }
    };

    protected override render(): React.ReactNode {
        return (
            <div className="body-lite-card">
                <header>
                    <span className="body-lite-title">Recent Items</span>
                </header>
                {this.handles.length === 0 ? (
                    <p className="body-lite-empty">No recent items.</p>
                ) : (
                    <ul className="body-lite-handle-list">
                        {this.handles.map(h => (
                            <li key={h.handleId}>
                                <button
                                    type="button"
                                    className="body-lite-handle"
                                    onClick={() => this.handleTap(h)}
                                    title={`${h.kind}: ${h.coordinate ?? 'no coordinate'}`}
                                >
                                    <span className="body-lite-handle-kind">{h.kind}</span>
                                    <span className="body-lite-handle-label">{h.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    }
}
