import * as React from 'react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { CommandService } from '@theia/core/lib/common/command';
import {
    BODY_DEEP_LINK_COMMAND_IDS,
    BODY_LITE_WIDGET_IDS,
    type ReviewAlertSnapshot
} from '../common';
import { BodyLiteRuntimeService } from './body-lite-runtime-service';

/**
 * Review-Alert Badge Widget — Track 09 T9b.
 *
 * Renders in the 0/1 daily layout ONLY. Shows pending S5 review counts,
 * the most-recent candidate's truncated title (safe-handle, never raw
 * body), and tap-to-deeplink into the deep IDE Agentic Control Room.
 */
@injectable()
export class ReviewAlertBadgeWidget extends ReactWidget {
    static readonly ID = BODY_LITE_WIDGET_IDS.REVIEW_ALERT_BADGE;
    static readonly LABEL = 'Review Alerts';

    @inject(BodyLiteRuntimeService)
    protected readonly runtime!: BodyLiteRuntimeService;

    @inject(CommandService)
    protected readonly commands!: CommandService;

    protected snapshot: ReviewAlertSnapshot;

    constructor() {
        super();
        this.snapshot = {
            pendingCount: 0,
            latest: null,
            recent: [],
            snapshotAtMs: 0
        };
    }

    @postConstruct()
    protected init(): void {
        this.id = ReviewAlertBadgeWidget.ID;
        this.title.label = ReviewAlertBadgeWidget.LABEL;
        this.title.caption = ReviewAlertBadgeWidget.LABEL;
        this.title.closable = false;
        this.addClass('body-lite-widget');
        this.addClass('body-lite-review-alert');
        this.runtime.onChange(state => {
            this.snapshot = state.reviewAlerts;
            this.update();
        });
    }

    protected handleOpenReview = async (
        candidateId: string,
        reviewId: string | null,
        coordinate: string | null,
        humanRequired: boolean
    ): Promise<void> => {
        await this.commands.executeCommand(
            BODY_DEEP_LINK_COMMAND_IDS.OPEN_REVIEW_ITEM,
            {
                candidateId,
                reviewId,
                coordinate,
                humanRequired,
                sessionKey: null,
                dayNow: null,
                profileGeneration: null,
                improvementId: null,
                artifactUri: null,
                privacyClass: 'public'
            }
        );
    };

    protected handleOpenControlRoom = async (): Promise<void> => {
        await this.commands.executeCommand(BODY_DEEP_LINK_COMMAND_IDS.OPEN_CONTROL_ROOM, {
            focusCandidateId: this.snapshot.latest?.candidateId ?? null,
            focusRunId: null,
            coordinate: this.snapshot.latest?.coordinate ?? null,
            reviewId: this.snapshot.latest?.reviewId ?? null,
            improvementId: null,
            artifactUri: null,
            sessionKey: null,
            dayNow: null,
            profileGeneration: null,
            privacyClass: 'public'
        });
    };

    protected override render(): React.ReactNode {
        const count = this.snapshot.pendingCount;
        const latest = this.snapshot.latest;
        return (
            <div className="body-lite-card">
                <header>
                    <span className="body-lite-badge-count" aria-label="pending reviews">
                        {count}
                    </span>
                    <span className="body-lite-title">Review Alerts</span>
                </header>
                {latest ? (
                    <button
                        type="button"
                        className="body-lite-latest"
                        onClick={() =>
                            this.handleOpenReview(
                                latest.candidateId,
                                latest.reviewId,
                                latest.coordinate,
                                latest.humanRequired
                            )
                        }
                        title={
                            latest.humanRequired
                                ? 'Human-required — only defer is allowed for agents'
                                : 'Open review'
                        }
                    >
                        <span className="body-lite-latest-title">{latest.truncatedTitle}</span>
                        {latest.humanRequired ? (
                            <span className="body-lite-human-required">human-required</span>
                        ) : null}
                    </button>
                ) : (
                    <p className="body-lite-empty">No pending reviews.</p>
                )}
                <button
                    type="button"
                    className="body-lite-cta"
                    onClick={this.handleOpenControlRoom}
                >
                    Open Control Room
                </button>
            </div>
        );
    }
}
