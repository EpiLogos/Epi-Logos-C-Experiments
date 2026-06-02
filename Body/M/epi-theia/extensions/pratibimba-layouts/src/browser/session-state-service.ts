import { injectable } from '@theia/core/shared/inversify';
import { Emitter, Event } from '@theia/core/lib/common/event';
import type { IntentPrivacyClass } from '../common/cross-layout-intent';

/**
 * DI token for the session-state service. Cross-layout state preservation
 * landing-zone — Track 05 T5 verification line: "Preserve pending review
 * notifications, active session, DAY/NOW, bridge generation, and selected
 * coordinate across layout switches."
 */
export const SESSION_STATE_SERVICE = Symbol('PratibimbaSessionStateService');

export interface PratibimbaSessionState {
    /** Current Bimba coordinate the user is anchored at. */
    selectedCoordinate: string | null;
    /** Gateway session key (canonical). */
    sessionKey: string | null;
    /** DAY/NOW context handle from S3 world_clock. */
    dayNow: string | null;
    /** Last observed kernel-bridge profile generation. */
    profileGeneration: number | null;
    /** Active artifact URI (e.g. last-opened Canon Studio file). */
    artifactUri: string | null;
    /** Pending review-notification ids the user has not yet dismissed. */
    pendingReviewIds: string[];
    /** Privacy class of the currently-active context. */
    privacyClass: IntentPrivacyClass | null;
}

const EMPTY_STATE: PratibimbaSessionState = {
    selectedCoordinate: null,
    sessionKey: null,
    dayNow: null,
    profileGeneration: null,
    artifactUri: null,
    pendingReviewIds: [],
    privacyClass: null
};

/**
 * Process-scoped session-state holder. Lives across layout switches so the
 * 0/1 daily layout and the deep IDE layout share the same coordinate /
 * session / DAY-NOW / profile generation / artifact / pending-reviews
 * identity.
 *
 * NOT a Theia preference — these are runtime-ephemeral handles, not user
 * preferences. The kernel-bridge is the canonical source for profileGeneration
 * etc.; this service is the in-memory mirror that consumers read
 * synchronously without re-querying.
 */
@injectable()
export class PratibimbaSessionStateService {
    protected _state: PratibimbaSessionState = { ...EMPTY_STATE, pendingReviewIds: [] };
    protected readonly _onChange = new Emitter<PratibimbaSessionState>();
    readonly onChange: Event<PratibimbaSessionState> = this._onChange.event;

    get state(): PratibimbaSessionState {
        return this._state;
    }

    update(patch: Partial<PratibimbaSessionState>): void {
        const before = this._state;
        const next: PratibimbaSessionState = {
            ...before,
            ...patch,
            pendingReviewIds: patch.pendingReviewIds ?? before.pendingReviewIds
        };
        if (statesEqual(before, next)) {
            return;
        }
        this._state = next;
        this._onChange.fire(next);
    }

    setSelectedCoordinate(coordinate: string | null): void {
        this.update({ selectedCoordinate: coordinate });
    }

    setSessionKey(sessionKey: string | null): void {
        this.update({ sessionKey });
    }

    setDayNow(dayNow: string | null): void {
        this.update({ dayNow });
    }

    setProfileGeneration(generation: number | null): void {
        this.update({ profileGeneration: generation });
    }

    setArtifactUri(uri: string | null): void {
        this.update({ artifactUri: uri });
    }

    setPrivacyClass(cls: IntentPrivacyClass | null): void {
        this.update({ privacyClass: cls });
    }

    pushReview(id: string): void {
        if (this._state.pendingReviewIds.includes(id)) {
            return;
        }
        this.update({ pendingReviewIds: [...this._state.pendingReviewIds, id] });
    }

    dismissReview(id: string): void {
        const next = this._state.pendingReviewIds.filter(x => x !== id);
        if (next.length === this._state.pendingReviewIds.length) {
            return;
        }
        this.update({ pendingReviewIds: next });
    }
}

function statesEqual(a: PratibimbaSessionState, b: PratibimbaSessionState): boolean {
    return (
        a.selectedCoordinate === b.selectedCoordinate &&
        a.sessionKey === b.sessionKey &&
        a.dayNow === b.dayNow &&
        a.profileGeneration === b.profileGeneration &&
        a.artifactUri === b.artifactUri &&
        a.privacyClass === b.privacyClass &&
        a.pendingReviewIds.length === b.pendingReviewIds.length &&
        a.pendingReviewIds.every((id, i) => id === b.pendingReviewIds[i])
    );
}
