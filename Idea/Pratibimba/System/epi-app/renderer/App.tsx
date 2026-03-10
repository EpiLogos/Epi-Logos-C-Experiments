import { Shell } from './components/Shell';
import { useS4WebSocket } from './stores/useS4WebSocket';

export function App() {
  // Initialize S4' WebSocket subscription at app root
  useS4WebSocket();

  return <Shell />;
}
