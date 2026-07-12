# Observability Extension

This directory is reserved for future integration with OpenTelemetry and distributed tracing tools (Prometheus, Jaeger, Grafana).

## Rules
- Currently, tracing relies on Pino request IDs and correlation IDs in `logger.ts`.
- When implementing full OpenTelemetry spans (e.g., tracing a request through the Application layer down to MongoDB), all configuration and tracer singletons will live in this folder.
- Do NOT scatter tracing setup logic across controllers or repositories.
