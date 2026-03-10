import { useState } from 'react';

export function useParamasiva() {
    const [state] = useState({
        loading: false,
        schemaNodes: [], // Placeholder
        stats: { typeCount: 0, relationCount: 0 }
    });

    const actions = {
        scanSchema: async () => { console.log('Scan Schema'); }
    };

    return { state, actions };
}
