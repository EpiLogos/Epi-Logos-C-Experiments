/**
 * Coordinate: M' `/` membrane (profile-tick subscription state — Track 27.T27.8)
 * Residency: Body/M/pratibimba-app/src/panes/omni/diagnostics
 * Position (#n): the Diagnostics fold's subscriber-state readout (27.8).
 * Actualises: the spec's <ProfileTickSubscriptionState /> — the number of
 *   active profile-tick subscribers. The carrier exposes NO runtime-snapshot
 *   store: `KernelBridgeRuntimeSnapshot.subscriberCount` is a wire type with no
 *   feed mounted in the app. Inventing a count would be fabrication, so this
 *   renders the honest s3_subscription_blocked banner naming the absent feed,
 *   and surfaces only the real datum it does have — the last observed tick
 *   generation (15.6 clock).
 * Public surface: ProfileTickSubscriptionState.
 * Does NOT own: the (unmounted) runtime-snapshot feed, the tick store law
 *   (state/stores), the readiness banner grammar (ui/ReadinessBanner).
 */

import { useTickStore } from '../../../state/stores';
import { ReadinessBanner } from '../../../ui/ReadinessBanner';

export function ProfileTickSubscriptionState() {
    const generation = useTickStore(s => s.generation);

    return (
        <section className="profile-tick-subscription-state" data-testid="profile-tick-subscription-state">
            <h4 className="diagnostics-section-title">Profile-tick subscription</h4>
            <ReadinessBanner
                state="s3_subscription_blocked"
                reason="no subscriber-count feed on the wire — KernelBridgeRuntimeSnapshot.subscriberCount is unbound in this carrier"
                testId="profile-tick-subscription-pending"
            />
            <p className="profile-tick-last-processed" data-testid="profile-tick-last-processed">
                last tick processed: {generation === null ? 'none yet' : `#${generation}`}
            </p>
        </section>
    );
}
