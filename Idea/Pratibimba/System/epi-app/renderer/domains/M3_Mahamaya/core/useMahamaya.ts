import { useState } from 'react';

export function useMahamaya() {
    const [state] = useState({
        axioms: [],
        alignment: 100
    });

    const actions = {
        audit: async () => { console.log('Run Audit'); }
    };

    return { state, actions };
}
