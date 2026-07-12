# AssetFlow Shared Workspace

The `@shared` workspace acts as the definitive communication contract between the AssetFlow backend and frontend.

## Architecture Rules
1. **Framework Independence**: This package MUST NOT depend on React, Express, MongoDB, Node APIs, or Browser APIs.
2. **Pure Data**: It contains ONLY Data Transfer Objects (DTOs), Contracts (Interfaces), Enums, Constants, Types, Zod Schemas, and Pure Utilities.
3. **Single Source of Truth**: All domain communication between client and server MUST use these definitions.

## Exports
Package exports are explicitly defined. Developers should import from the top-level barrel aliases (which will be mapped in the consumer TSConfigs):
- `@shared/contracts`
- `@shared/dto`
- `@shared/schemas`
- `@shared/types`
- `@shared/constants`
- `@shared/enums`
- `@shared/utils`
