import { z } from "zod";

/**
 * Esquema de variables de entorno esperadas por el cliente.
 * - Solo se definen las que YA tienes en tu backend.
 * - Agregamos defaults seguros donde aplica.
 */
export const EnvSchema = z.object({
  T1_BASE_URL: z.string().url(),
  T1_AUTH_URL: z.string().url(),
  T1_CLIENT_ID: z.string().min(1),
  T1_USERNAME: z.string().min(1),
  T1_PASSWORD: z.string().min(1),
  T1_COMMERCE_ID: z.string().min(1), // lo dejamos string para no forzar casteos
  T1_TIMEOUT_MS: z.coerce.number().int().positive().default(20000),

  // Opcionales recomendadas (si no existen, toma default)
  T1_REFRESH_MARGIN_SEC: z.coerce.number().int().positive().default(30),
  T1_LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  T1_USER_AGENT: z.string().default("t1-api-client/0.0.3")
});

export type EnvConfig = z.infer<typeof EnvSchema>;

/**
 * Lee y valida process.env. No ejecuta side-effects (solo lectura).
 * - No usa dotenv: el host (Nest/Express) debe cargar .env.
 */
export function loadEnvConfig(env: NodeJS.ProcessEnv = process.env): EnvConfig {
  return EnvSchema.parse(env);
}
