/**
 * AssetFlow ERP
 *
 * Layer:
 * Core
 *
 * Responsibility:
 * The Dependency Injection Container.
 * Wires Repositories -> Application Use Cases -> Controllers.
 *
 * Architectural Rules:
 * - This is the ONLY place where Repositories are instantiated.
 * - This container is loaded during the Application Startup Lifecycle by the Composition Root (server.ts).
 */

export const Container = {
  // Reserved for future dependency bindings.
  // Example:
  // repositories: { ... },
  // useCases: { ... },
  // controllers: { ... }
};
