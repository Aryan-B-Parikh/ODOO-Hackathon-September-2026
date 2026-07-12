/**
 * AssetFlow ERP
 *
 * Layer:
 * Presentation (Providers)
 *
 * Responsibility:
 * Aggregates all global React Context providers into a single wrapper.
 *
 * Allowed imports:
 * - Individual global providers (Theme, Query)
 * - ErrorBoundary
 */
import { GlobalErrorBoundary } from '@components/ErrorBoundary';
import { ReactNode } from 'react';

import { QueryProvider } from './query-provider';
import { ThemeProvider } from './theme-provider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <GlobalErrorBoundary>
      <ThemeProvider>
        <QueryProvider>
          {children}
        </QueryProvider>
      </ThemeProvider>
    </GlobalErrorBoundary>
  );
}
