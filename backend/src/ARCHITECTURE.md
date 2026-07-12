# Backend Clean Architecture

This directory follows a strict Layered Architecture based on Domain-Driven Design principles.

## The Dependency Rule
Dependencies must ALWAYS point inward toward the Domain. 
**Presentation → Application → Domain ← Infrastructure**

### 1. Presentation Layer (`presentation/`)
- **What it is:** HTTP routes, Controllers, Express middleware.
- **Allowed:** Calls the Application Layer.
- **Forbidden:** Never imports from the Infrastructure Layer. Never contains business logic.

### 2. Application Layer (`application/`)
- **What it is:** Use Cases and Command Handlers. Orchestrates the flow of data to and from Domain entities.
- **Allowed:** Calls Domain logic and Repository Interfaces.
- **Forbidden:** Never imports from the Presentation or Infrastructure Layers.

### 3. Domain Layer (`domain/`)
- **What it is:** Pure business logic. Entities, Value Objects, Domain Events.
- **Allowed:** Uses pure TypeScript.
- **Forbidden:** No database libraries, no Express, no external framework imports.

### 4. Infrastructure Layer (`infrastructure/`)
- **What it is:** External concerns. Database (MongoDB schemas), external APIs (Email, Storage).
- **Allowed:** Implements interfaces defined in the Domain or Application layers.
- **Forbidden:** Does not call the Presentation layer.
