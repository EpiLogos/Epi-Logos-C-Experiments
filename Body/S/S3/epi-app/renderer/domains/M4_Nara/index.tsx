import { useNara } from './core/useNara';
import { NaraDashboard } from './ui/NaraDashboard';

export function NaraDomain() {
    const { state, actions } = useNara();
    return <NaraDashboard state={state} actions={actions} />;
}

export default NaraDomain;
