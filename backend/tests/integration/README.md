# Integration Tests

This directory contains integration tests that wire together multiple layers (Application + Infrastructure).

## Architectural Rules
- Use these tests to verify Repositories interacting with MongoDB.
- Use these tests to verify Use Cases orchestrating Repositories.
- Mongoose should connect to a test database (e.g., via MongoDB Memory Server).
- Controller (HTTP) integration tests may be placed here using Supertest.
- Run via Vitest.
