import { Shell } from './components/Shell';
import { useS3Gateway } from './stores/useS3Gateway';

export function App() {
  // Initialize S3' Gateway WebSocket subscription at app root
  useS3Gateway();

  return <Shell />;
}
