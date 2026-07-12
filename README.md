# AssetFlow ERP

AssetFlow is a production-grade Domain-Driven Design ERP system built with the MERN stack.

## Architecture
- **Backend:** Node.js, Express, Mongoose, Zod, Pino. Layered Architecture.
- **Frontend:** React, Vite, Tailwind CSS, shadcn/ui. Feature-Sliced Design.
- **Shared:** Unified DTOs, schemas, and types.

## Prerequisites
- Node.js >= 22.0.0
- NPM >= 10.0.0
- MongoDB >= 7.0

## Getting Started
1. Run `npm install` from the root.
2. Copy `.env.example` to `.env` and configure your local settings.
3. Run `npm run dev` to boot both backend and frontend servers concurrently.
