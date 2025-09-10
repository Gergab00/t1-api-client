/**
 * @file src/utils/httpClient.js
 * @description Instancia Axios singleton utilizada por los servicios para
 * comunicarse con la API de T1. Contiene interceptores que:
 *   - Inyectan automáticamente el token de acceso válido en `Authorization`.
 *   - Normalizan las respuestas devolviendo solo `response.data`.
 *   - Gestionan reintentos controlados ante 401 trasladando la responsabilidad de
 *     la renovación del token a `tokenManager` (single-flight).
 *
 * Reglas aplicadas:
 *  - No modifica la lógica de petición/respuesta; solo documenta y ancla secciones.
 *  - Todas las secciones críticas están anotadas con Comment Anchors para facilitar
 *    la navegación en el código.
 */

// ANCHOR: dependencias
const axios = require('axios'); // Cliente HTTP base
const config = require('../config'); // Configuración centralizada (baseURL, accessToken dinámico)
const { ensureValidAccessToken } = require('./tokenManager'); // Gestor de token con renovación automática

// ANCHOR: instancia-http
// SECTION: creacion-instancia
// INFO: Se crea una única instancia de Axios con parámetros base. El timeout evita esperar indefinidamente.
/**
 * Instancia HTTP preconfigurada para consumir la API T1.
 * @type {import('axios').AxiosInstance}
 * @property {string} defaults.baseURL URL base tomada de la configuración global.
 * @property {number} defaults.timeout Tiempo máximo en ms para cada solicitud.
 * @example
 * const client = require('../utils/httpClient');
 * const productos = await client.get('/products');
 */
const httpClient = axios.create({ baseURL: config.baseURL, timeout: 10000 });

// ANCHOR: interceptor-request
// SECTION: tokenizacion-request
// INFO: Antes de cada solicitud se inyecta (si existe) el token de acceso en Authorization.
// NOTE: `ensureValidAccessToken` implementa single-flight para evitar múltiples refresh simultáneos.
// WARN: Si el token expira y no se gestiona refresh en otra capa, el backend devolverá 401.
/**
 * Interceptor de request.
 * @param {import('axios').AxiosRequestConfig} request Configuración de la petición Axios.
 * @returns {Promise<import('axios').AxiosRequestConfig>} La misma request con cabecera Authorization si aplica.
 */
httpClient.interceptors.request.use(async (request) => {
  // INFO: Garantiza token válido antes de enviar
  const token = await ensureValidAccessToken();
  // INFO: Aseguramos que headers exista y asignamos Authorization de forma explícita
  request.headers = request.headers || {};
  request.headers.Authorization = `Bearer ${token}`;
  return request;
});

// ANCHOR: interceptor-response
// SECTION: normalizacion-response
// INFO: Se normaliza la respuesta devolviendo únicamente `data` para simplificar el consumo en servicios.
// INFO: En caso de error, se rechaza una estructura homogénea con `status` y `message`.
// OPTIMIZE: Podría extenderse para capturar headers específicos (rate limits, correlación) si es necesario.
/**
 * Interceptor de response que normaliza respuestas y maneja 401 reintentando
 * con un token renovado (solo 1 reintento para evitar bucles).
 * @returns {any} `response.data` en caso de éxito, o una promesa rechazada con `{status, message}`.
 */
httpClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const { config: reqCfg, response } = error;
    const originalRequest = reqCfg || {};

    // INFO: Si no hay respuesta (ej. network error) o no es 401, propaga error normalizado
    if (!response || response.status !== 401) {
      const errResp = response || {};
      return Promise.reject({
        status: errResp.status,
        message: (errResp.data && errResp.data.message) || error.message || 'Error desconocido',
      });
    }

    // SECTION: manejo-401
    // WARN: Evitar bucle infinito de reintentos — sólo permitimos un reintento por request
    if (originalRequest._retry) {
      return Promise.reject({
        status: 401,
        message: 'No autorizado (reintento fallido).',
      });
    }
    originalRequest._retry = true;

    try {
      // INFO: INTENTA refrescar (o login fallback dentro de ensureValidAccessToken)
      const token = await ensureValidAccessToken();
      // INFO: Reconstituimos headers y aseguramos Authorization actualizado
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${token}`;
      // Reintentamos una sola vez con el nuevo token
      const retryResp = await httpClient(originalRequest);
      return retryResp;
    } catch (e) {
      // SECTION: fallo-refresh
      // Falló refresh/login → propaga 401 con mensaje consistente
      return Promise.reject({
        status: 401,
        message: 'No autorizado (no se pudo renovar el token).',
      });
    }
  },
);

// ANCHOR: export
/**
 * Exporta la instancia HTTP configurada.
 * @returns {import('axios').AxiosInstance} Cliente Axios singleton para la API.
 */
module.exports = httpClient;

// NOTE: Si la API requiere reintentos exponenciales, se podría añadir un interceptor adicional.
// TODO: Implementar mecanismo de refresh de token automático (si el backend lo soporta) en un futuro interceptor.
// OPTIMIZE: Considerar configuración dinámica de timeout por operación crítica.
