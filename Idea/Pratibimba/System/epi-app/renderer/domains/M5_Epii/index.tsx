import { useState } from 'react';
import { useEpii } from './core/useEpii';
import { SystemHubView } from './ui/SystemHub';
import { SystemWorkspace } from './ui/SystemWorkspace';
import { MPRIME_DOMAINS } from '../../../shared/types';

export function EpiiDomain() {
    const { state, actions } = useEpii();
    const [view, setView] = useState<'hub' | 'workspace'>('hub');
    const domain = MPRIME_DOMAINS[5];

    return view === 'workspace' ? (
        <SystemWorkspace
            state={state}
            onBack={() => setView('hub')}
        />
    ) : (
        <SystemHubView
            domainId={domain.id}
            domainName="Epii"
            state={state}
            actions={actions}
            onEnterWorkspace={() => setView('workspace')}
        />
    );
}

export default EpiiDomain;
