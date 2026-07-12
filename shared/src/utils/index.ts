/**
 * @module @shared/utils
 * 
 * WHY THIS LAYER EXISTS:
 * This directory contains ONLY framework-independent utility functions.
 * 
 * Allowed:
 * - Pagination helpers
 * - Date formatting
 * - String formatting
 * - ID formatting
 * - Generic object helpers
 * 
 * Forbidden:
 * - Business logic (belongs in domain layer)
 * - Database logic (belongs in infrastructure layer)
 * - HTTP logic (belongs in presentation layer)
 * - Authentication logic
 * - Express utilities
 * - React utilities
 * 
 * Goal: Keep the shared utility layer pure, deterministic, and independently testable without mocking frameworks.
 */

// Export utility functions here
// export * from './date-formatter';
// export * from './pagination-helper';
export {};
