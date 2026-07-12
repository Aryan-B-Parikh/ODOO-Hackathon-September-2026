/**
 * AssetFlow ERP
 *
 * Layer:
 * Presentation (Components)
 *
 * Responsibility:
 * Full-screen loading indicator for initial app boot or heavy lazy loads.
 */

export function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}
