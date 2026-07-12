/**
 * AssetFlow ERP
 *
 * Layer:
 * Config
 *
 * Responsibility:
 * Centralized, strongly-typed environment configuration.
 * Parses process.env at startup and freezes it as an immutable singleton.
 *
 * Architectural Rules:
 * - Must be validated with Zod.
 * - No process.env usage allowed outside this file.
 * - Must crash on invalid startup.
 */
import dotenv from 'dotenv';
import { z } from 'zod';

// Load variables from .env if present
dotenv.config();

const envSchema = z.object({
  PORT: z.string().transform(Number).default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URI: z.string().url(),
  JWT_SECRET: z.string().min(10),
  JWT_EXPIRES_IN: z.string().default('24h'),
  CORS_ORIGIN: z.string().url().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

// Export as immutable singleton
export const Config = Object.freeze(parsed.data);
