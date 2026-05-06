import { useState } from 'react';
import { useParamasiva } from './core/useParamasiva';
import { ParamasivaHub } from './ui/ParamasivaHub';
import { SchemaWorkspace } from './ui/SchemaWorkspace';
import { MPRIME_DOMAINS } from '../../../shared/types';

export function ParamasivaDomain() {
    const { state, actions } = useParamasiva();
    const [view, setView] = useState<'hub' | 'workspace'>('hub');
    const domain = MPRIME_DOMAINS[1];

    return view === 'workspace' ? (
        <SchemaWorkspace onBack={() => setView('hub')} />
    ) : (
        <ParamasivaHub
            domainId={domain.id}
            domainName="Paramasiva"
            onEnterWorkspace={() => setView('workspace')}
        />
    );
}
