# Unit Tests

This directory contains pure unit tests that execute in complete isolation.

## Architectural Rules
- Do NOT test the database here.
- Do NOT test controllers here.
- DO test Domain Layer logic (Entities, Value Objects).
- DO test Shared Layer utilities.
- Mocks should be extremely limited; prefer testing pure functions.
- Run via `npm run test` using Vitest.
