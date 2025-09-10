/**
 * @file src/services/authService.js
 * @description Servicio de autenticación responsable de obtener, persistir y renovar tokens
 * JWT mediante el endpoint OpenID Connect de T1. Implementa funciones de login y refresh
 * (grant_type=password / refresh_token). Este módulo almacena los tokens en memoria
 * dentro del objeto `config` para que `httpClient` los inyecte en las peticiones.
 *
 * Requisitos operativos:
 * - Llamar a `login()` al inicio para obtener `accessToken` (si no hay token válido).
 * - Llamar a `refresh()` cuando se detecte expiración o al interceptar un 401.
 *
 * Seguridad: evitar exponer `username`/`password` en repositorios y preferir un gestor de secretos.
 */

// ANCHOR: dependencias
const axios = require('axios'); // Se usa solicitud directa sin reutilizar httpClient (no hay token aún)
const config = require('../config'); // Configuración global (credenciales y almacenamiento de token)
const { AUTH_TOKEN_ENDPOINT } = require('../constants/const'); // Endpoint centralizado OIDC

// ANCHOR: util-setTokens
/**
 * Persiste tokens en `config` y calcula el timestamp de expiración ajustado (skew).
 * @param {{ access_token: string, refresh_token?: string, expires_in?: number }} payload
 * @description
 *  - `access_token`: token a usar en Authorization.
 *  - `refresh_token`: opcional, usado para renovaciones.
 *  - `expires_in`: duración en segundos proporcionada por el servidor.
 *
 * Nota: La persistencia actual es en memoria (objeto `config`). Si la aplicación
 * requiere escalabilidad o reinicios, mover a almacenamiento compartido (Redis, DB).
 */
function setTokens(payload) {
  const nowMs = Date.now();
  // INFO: Se resta un margen (skew) para renovar el token antes de que expire realmente.
  const skewMs = (config.expirySkewSeconds || 60) * 1000;
  const expiresAt = nowMs + Math.max(0, (payload.expires_in || 0) * 1000 - skewMs);

  // INFO: Persistimos en memoria (puedes cambiar a Redis/archivo si necesitas persistencia fuera del proceso)
  config.accessToken = payload.access_token;
  if (payload.refresh_token) {
    config.refreshToken = payload.refresh_token;
  }
  config.expiresAt = expiresAt; // timestamp (ms) estimado de expiración ajustada
}

// ANCHOR: login-funcion
/**
 * Realiza la autenticación contra el servidor OpenID Connect de T1 y persiste el token.
 * Construye un cuerpo x-www-form-urlencoded con las credenciales y obtiene un JWT de acceso.
 * @returns {Promise<string>} Promesa que resuelve con el token JWT de acceso.
 * @throws {Error} Si la autenticación falla (mensaje priorizando error_description del servidor).
 * @example
 * const token = await login();
 */
async function login() {
  const params = new URLSearchParams(); // INFO: Se usa URLSearchParams para codificar el form.
  params.append('client_id', config.clientId); // INFO: Identificador del cliente registrado.
  params.append('grant_type', 'password'); // WARN: Flujo ROPC (password) requiere manejo seguro de credenciales.
  params.append('username', config.username); // NOTE: Usuario provisto en config externa.
  params.append('password', config.password); // NOTE: Contraseña almacenada en config; considerar cifrado en repos.

  try {
    const response = await axios.post(
      AUTH_TOKEN_ENDPOINT, // NOTE: Uso de constante centralizada (ver constants/const.ts)
      params,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    // INFO: Guardamos access, refresh y expiración
    const { access_token, refresh_token, expires_in } = response.data || {};
    setTokens({ access_token, refresh_token, expires_in });
    return access_token; // Éxito: se devuelve el JWT.
  } catch (error) {
    // ANCHOR: manejo-error-auth
    // INFO: Normaliza el mensaje priorizando la descripción específica del servidor.
    const errResp = error.response || {};
    const message = (errResp.data && errResp.data.error_description) || error.message || 'Error de autenticación';
    throw new Error(message);
  }
}

// ANCHOR: refresh-funcion
/**
 * Intenta renovar usando `grant_type=refresh_token`.
 * @returns {Promise<string>} nuevo access_token
 */
async function refresh() {
  if (!config.refreshToken) {
    throw new Error('No hay refresh_token disponible');
  }

  const params = new URLSearchParams();
  params.append('client_id', config.clientId);
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', config.refreshToken);

  try {
    const response = await axios.post(
      AUTH_TOKEN_ENDPOINT,
      params,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { access_token, refresh_token, expires_in } = response.data || {};
    if (!access_token) throw new Error('No se obtuvo access_token en refresh');

    setTokens({ access_token, refresh_token, expires_in });
    return access_token;
  } catch (error) {
    const errResp = error.response || {};
    const message = (errResp.data && errResp.data.error_description) || error.message || 'Error en refresh_token';
    throw new Error(message);
  }
}

// ANCHOR: exports
/**
 * Exporta las funciones públicas del servicio de autenticación.
 * - login(): obtiene tokens por ROPC y los persiste.
 * - refresh(): renueva usando refresh_token.
 * - setTokens(): utilidad para persistir tokens (útil en tests).
 * @module authService
 */
module.exports = { login, refresh, setTokens };

// TODO: Añadir soporte para refresh_token si el backend lo expone (si no lo hace, documentar).
// OPTIMIZE: Implementar renovación automática y bloqueo para evitar múltiples refresh concurrentes.
// WARN: Evitar almacenar credenciales planas en repositorios; usar variables de entorno o gestor de secretos.