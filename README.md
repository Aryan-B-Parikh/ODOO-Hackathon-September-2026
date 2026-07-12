# AssetFlow ERP

AssetFlow is a production-grade Domain-Driven Design ERP system built with the MERN stack.

## Architecture
- **Backend:** Node.js, Express, Mongoose, Zod, Pino. Layered Architecture.
- **Frontend:** React, Vite, Tailwind CSS, shadcn/ui. Feature-Sliced Design.
- **Shared:** Unified DTOs, schemas, and types.

## Prerequisites
- Node.js >= 22.0.0
- NPM >= 10.0.0
- **Docker Desktop** (Required for local MongoDB infrastructure)

## Getting Started

### 1. Database Infrastructure (Docker)
The backend requires a local MongoDB instance. We use Docker to spin up a pre-configured database isolated from your system.

First, navigate to the `docker` directory and set up your environment variables:
```bash
cd docker
cp .env.example .env
```

**How to start MongoDB:**
Run the following command to boot MongoDB in detached mode. Success means the container starts and the healthcheck reports `healthy`.
```bash
docker compose up -d
```

**How to verify it is running:**
Use this command to see the container status. Success looks like `assetflow-mongodb` being `Up (healthy)`.
```bash
docker compose ps
```

**How to inspect logs:**
If the database fails to boot, inspect the logs with:
```bash
docker logs assetflow-mongodb
```

**How to connect directly via CLI:**
To enter the Mongo shell directly and inspect the database:
```bash
docker exec -it assetflow-mongodb mongosh
```

**How to stop MongoDB:**
This stops the container but preserves your data in the named volume.
```bash
docker compose down
```

**How to completely remove and wipe MongoDB (Destructive):**
If you want to start fresh and destroy the `mongodb_data` volume containing your data:
```bash
docker compose down -v
```

### 2. Application Setup
Once MongoDB is `healthy`, set up the main application:
1. Run `npm install` from the root.
2. Copy `backend/.env.example` to `backend/.env` (ensure `MONGODB_URI` points to `mongodb://admin:secret@localhost:27017/assetflow?authSource=admin`).
3. Run `npm run dev` to boot both backend and frontend servers concurrently.
