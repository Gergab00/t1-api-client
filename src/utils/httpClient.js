/**
 * @file src/utils/httpClient.js
 * @description Define y exporta una instancia reutilizable de Axios para invocar
 * la API de T1Comercios. El cliente se configura con la URL base proveniente de
 * la configuración global y añade interceptores para:
 *   1. Adjuntar el token JWT en el encabezado Authorization de cada
 *      solicitud cuando está disponible.
 *   2. Centralizar el manejo de respuestas y errores, de modo que los
 *      servicios consuman una interfaz homogénea.
 *
 * Este módulo aplica el patrón de singleton implícito (una sola instancia compartida)
 * que facilita la propagación automática del token sin que cada servicio tenga que
 * volver a configurar Axios. No se aplican side-effects salvo la lectura de config.
 */

// ANCHOR: dependencias
const axios = require('axios'); // Cliente HTTP base
const config = require('../config'); // Configuración centralizada (baseURL, accessToken dinámico)

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
// WARN: Si el token expira y no se gestiona refresh en otra capa, el backend devolverá 401.
httpClient.interceptors.request.use((request) => {
  if (config.accessToken) {
    // INFO: Se añade el esquema Bearer estándar para JWT.
    request.headers.Authorization = `Bearer ${config.accessToken}`;
  }
  return request; // NOTE: Es obligatorio retornar el request para continuar la cadena.
});

// ANCHOR: interceptor-response
// SECTION: normalizacion-response
// INFO: Se normaliza la respuesta devolviendo únicamente `data` para simplificar el consumo en servicios.
// INFO: En caso de error, se rechaza una estructura homogénea con `status` y `message`.
// OPTIMIZE: Podría extenderse para capturar headers específicos (rate limits, correlación) si es necesario.
httpClient.interceptors.response.use(
  (response) => response.data, // Simplifica: los servicios no acceden a `response.data` explícitamente.
  (error) => {
    const errResp = error.response || {};
    return Promise.reject({
      status: errResp.status,
      message: (errResp.data && errResp.data.message) || error.message || 'Error desconocido',
    });
  }
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