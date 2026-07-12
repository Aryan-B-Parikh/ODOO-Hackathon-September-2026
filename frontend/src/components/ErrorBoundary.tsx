/**
 * AssetFlow ERP
 *
 * Layer:
 * Presentation (Components)
 *
 * Responsibility:
 * Catches unhandled React rendering errors to prevent entire app crashes.
 */
import { Component, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm max-w-full overflow-auto">
            {this.state.error?.message}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}
