import * as React from 'react';
import {
    MathemeHarmonicProfileBoundary,
    SharedBridgeAdapter
} from '@pratibimba/m-extension-runtime';
import {
    CompositionProfileTickSubscription,
    openCompositionProfileSubscription
} from '../common/profile-tick-subscription';

export const CompositionProfileContext: React.Context<CompositionProfileTickSubscription | null> =
    React.createContext<CompositionProfileTickSubscription | null>(null);

export const CompositionProfileProvider: React.FC<{
    readonly bridge: SharedBridgeAdapter;
    readonly children: React.ReactNode;
}> = ({ bridge, children }) => {
    const [subscription] = React.useState(() => openCompositionProfileSubscription(bridge));
    React.useEffect(() => () => subscription.dispose(), [subscription]);

    return (
        <CompositionProfileContext.Provider value={subscription}>
            {children}
        </CompositionProfileContext.Provider>
    );
};

export function useCompositionProfile(): {
    profile: MathemeHarmonicProfileBoundary | null;
    generation: number | null;
} {
    const subscription = React.useContext(CompositionProfileContext);
    const [snapshot, setSnapshot] = React.useState(() => readSnapshot(subscription));

    React.useEffect(() => {
        setSnapshot(readSnapshot(subscription));
        if (!subscription) {
            return undefined;
        }
        const disposable = subscription.subscribe(profile => {
            setSnapshot(Object.freeze({
                profile,
                generation: profile.generation
            }));
        });
        return () => disposable.dispose();
    }, [subscription]);

    return snapshot;
}

function readSnapshot(subscription: CompositionProfileTickSubscription | null): {
    profile: MathemeHarmonicProfileBoundary | null;
    generation: number | null;
} {
    return Object.freeze({
        profile: subscription?.currentProfile ?? null,
        generation: subscription?.currentGeneration ?? null
    });
}
