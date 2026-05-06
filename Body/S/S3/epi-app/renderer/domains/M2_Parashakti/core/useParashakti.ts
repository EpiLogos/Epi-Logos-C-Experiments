import { useState } from 'react';

export function useParashakti() {
    const [state] = useState({
        activePeers: 0,
        streams: []
    });

    const actions = {
        connect: async () => { console.log('Connect Peer'); }
    };

    return { state, actions };
}
