/**
 * AssetFlow ERP
 *
 * Layer:
 * Presentation
 *
 * Responsibility:
 * Application Shell and Global Providers Aggregation
 *
 * Architectural Rules:
 * - Must wrap the Router in global providers.
 * - No UI rendering (delegated to Router and Layouts).
 */
import { AppProviders } from '@providers/index';
import { AppRouter } from '@router/index';

export function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}
