import { useState } from 'react';
import { useAnuttara } from './core/useAnuttara';
import { AnuttaraHubView } from './ui/AnuttaraHub';
import { GraphWorkspace } from './ui/GraphWorkspace';
import { MPRIME_DOMAINS } from '../../../shared/types';

export function AnuttaraDomain() {
    const { state, actions } = useAnuttara();
    const [view, setView] = useState<'hub' | 'workspace'>('hub');
    const domain = MPRIME_DOMAINS[0];

    return view === 'workspace' ? (
        <GraphWorkspace
            data={state.graphData}
            onBack={() => setView('hub')}
        />
    ) : (
        <AnuttaraHubView
            domainId={domain.id}
            domainName="Anuttara"
            state={state}
            actions={actions}
            onEnterWorkspace={() => setView('workspace')}
        />
    );
}

export default AnuttaraDomain;
