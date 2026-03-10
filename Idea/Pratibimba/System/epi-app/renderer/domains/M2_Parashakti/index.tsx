import { useState } from 'react';
import { useParashakti } from './core/useParashakti';
import { CoLogosHub } from './ui/CoLogosHub';
import { CollabWorkspace } from './ui/CollabWorkspace';
import { MPRIME_DOMAINS } from '../../../shared/types';

export function ParashaktiDomain() {
    const { state, actions } = useParashakti();
    const [view, setView] = useState<'hub' | 'workspace'>('hub');
    const domain = MPRIME_DOMAINS[2];

    return view === 'workspace' ? (
        <CollabWorkspace onBack={() => setView('hub')} />
    ) : (
        <CoLogosHub
            domainId={domain.id}
            domainName="Parashakti"
            onEnterWorkspace={() => setView('workspace')}
        />
    );
}
