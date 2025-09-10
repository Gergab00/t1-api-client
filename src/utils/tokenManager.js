// RUTA: /src/utils/tokenManager.js
/**
 * @file src/utils/tokenManager.js
 * @description Gestor central de tokens para el cliente T1.
 * Proporciona utilidades para garantizar que siempre se disponga de un
 * access_token válido antes de realizar peticiones protegidas. Implementa:
 *  - ensureValidAccessToken(): devuelve un access_token válido (renueva si es necesario).
 *  - isTokenValid(): validador rápido en memoria.
 *  - runSingleFlight(): patrón single-flight para serializar renovaciones concurrentes.
 *
 * Principio: este módulo no realiza llamadas HTTP por sí mismo; delega en
 * `authService` para login/refresh y persiste resultados en `config`.
 *
 * Consideraciones:
 *  - Mantener la lógica de single-flight para evitar ráfagas de refresh en escenarios concurrentes.
 *  - Si la aplicación se escala en múltiples procesos, mover persistencia a un store compartido (Redis).
 */

// ANCHOR: dependencias
const config = require('../config');
const { login, refresh } = require('../services/authService');

// ANCHOR: estado-interno
let refreshInFlight = null; // Promise en curso de refresh/login

// ANCHOR: helpers
/**
 * Comprueba rápidamente si el token en `config` parece vigente.
 * @returns {boolean} true si existe `accessToken` y no ha pasado `expiresAt`.
 * @note Esta comprobación es local (no valida con el servidor). Se basa en timestamps calculados por `setTokens`.
 */
function isTokenValid() {
  return Boolean(config.accessToken) && Date.now() < (config.expiresAt || 0);
}

/**
 * Ejecuta una función asíncrona (normalmente `refresh` o `login`) asegurando single-flight.
 * Si ya existe una renovación en curso, devuelve la promesa en curso en lugar de iniciar una nueva.
 * Esto evita que múltiples peticiones concurrentes disparen varios refresh/login simultáneos.
 *
 * @param {() => Promise<string>} fn Función que realiza la renovación y devuelve un token.
 * @returns {Promise<string>} Promesa que resuelve con el token devuelto por `fn`.
 */
async function runSingleFlight(fn) {
  if (refreshInFlight) {
    // INFO: Ya hay un refresh en proceso: espera el resultado compartido
    return refreshInFlight;
  }
  refreshInFlight = (async () => {
    try {
      const token = await fn();
      return token;
    } finally {
      // INFO: Siempre limpiar el flag para permitir próximos intentos, incluso si `fn` lanzó.
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

// ANCHOR: ensureValidAccessToken
/**
 * Retorna un access_token válido garantizando renovación cuando es necesario.
 * Flujo:
 * 1. Si el token local es válido, devolverlo.
 * 2. Si existe `refreshToken`, intentar `refresh()` (single-flight).
 * 3. Si refresh falla o no hay refreshToken, ejecutar `login()` como fallback (single-flight).
 *
 * @returns {Promise<string>} Promesa que resuelve con un access_token válido.
 * @remarks
 * - En escenarios con múltiples procesos, este single-flight evita duplicidad solo por proceso; para cluster usar un lock distribuido.
 */
async function ensureValidAccessToken() {
  if (isTokenValid()) {
    return config.accessToken;
  }

  // Primero intenta refresh si hay refresh_token
  if (config.refreshToken) {
    try {
      return await runSingleFlight(() => refresh());
    } catch {
      // INFO: Si refresh falla, caemos a login como fallback.
    }
  }

  // Fallback: login ROPC
  return runSingleFlight(() => login());
}

// ANCHOR: exports
/**
 * API pública del token manager.
 * - ensureValidAccessToken(): obtiene/renueva token si es necesario.
 * - isTokenValid(): chequeo local rápido de validez.
 */
module.exports = { ensureValidAccessToken, isTokenValid };

// TODO: (opt) Implementar lock distribuido si la app corre en múltiples instancias.
// TODO: Exponer hook/evts para instrumentación (retries, 401s, renovaciones).
