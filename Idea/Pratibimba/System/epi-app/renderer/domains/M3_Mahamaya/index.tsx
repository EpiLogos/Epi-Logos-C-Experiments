import { useState } from 'react';
import { useMahamaya } from './core/useMahamaya';
import { AxioLogosHub } from './ui/AxioLogosHub';
import { AuditWorkspace } from './ui/AuditWorkspace';
import { MPRIME_DOMAINS } from '../../../shared/types';

export function MahamayaDomain() {
    const { state, actions } = useMahamaya();
    const [view, setView] = useState<'hub' | 'workspace'>('hub');
    const domain = MPRIME_DOMAINS[3];

    return view === 'workspace' ? (
        <AuditWorkspace onBack={() => setView('hub')} />
    ) : (
        <AxioLogosHub
            domainId={domain.id}
            domainName="Mahamaya"
            onEnterWorkspace={() => setView('workspace')}
        />
    );
}
