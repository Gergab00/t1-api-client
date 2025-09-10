/**
 * @file src/config/index.js
 * @description Módulo de configuración global del cliente T1Comercios.
 * 1. Carga variables de entorno (.env) usando dotenv.
 * 2. Intenta fusionar un archivo JSON opcional (config.json) para valores por defecto.
 * 3. Expone un objeto mutable (por diseño) donde `accessToken` es rellenado por authService.
 *
 * Orden de precedencia de valores: process.env > config.json > fallback literal.
 * NOTA: La mutabilidad controlada de `accessToken` facilita la inyección en interceptores.
 */

// ANCHOR: dependencias
const fs = require('fs'); // Lectura de archivo config.json opcional
const path = require('path'); // Resolución robusta de ruta
const dotenv = require('dotenv'); // Carga de variables de entorno desde .env

// ANCHOR: carga-dotenv
// INFO: Carga variables de entorno desde un archivo .env si está presente en el root del proyecto.
dotenv.config();

// ANCHOR: carga-json
// SECTION: lectura-config-json
// INFO: Se intenta cargar config.json para proporcionar valores por defecto versionables.
let jsonConfig = {};
const jsonPath = path.resolve(__dirname, '../../config.json');
if (fs.existsSync(jsonPath)) {
  try {
    jsonConfig = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  } catch (err) {
    console.warn('No se pudo parsear config.json, se usará solo .env'); // WARN: Error de parseo no detiene ejecución.
  }
}

// ANCHOR: typedef-config
/**
 * Objeto de configuración global.
 * @typedef {Object} Config
 * @property {string} baseURL URL base de la API T1Comercios.
 * @property {string} clientId Identificador del cliente (client_id OAuth/OIDC).
 * @property {string} username Usuario para autenticación ROPC.
 * @property {string} password Contraseña asociada.
 * @property {string|undefined} accessToken Token JWT vigente (mutado tras login).
 */

// ANCHOR: objeto-config
/**
 * Instancia de configuración (mutable solo en accessToken).
 * Precedencia: env > json > fallback.
 * @type {Config}
 */
const config = {
  baseURL: process.env.T1_BASE_URL || jsonConfig.T1_BASE_URL || 'https://api.t1comercios.com', // NOTE: Fallback a constante literal.
  clientId: process.env.T1_CLIENT_ID || jsonConfig.T1_CLIENT_ID || 'integradores', // INFO: Valor por defecto común.
  username: process.env.T1_USERNAME || jsonConfig.T1_USERNAME || '',
  password: process.env.T1_PASSWORD || jsonConfig.T1_PASSWORD || '',

  // INFO: Se poblará tras autenticación.
  // SECTION: almacenamiento de token en memoria (puede moverse a Redis/FS si se requiere persistencia)
  accessToken: null,
  refreshToken: null,
  expiresAt: 0, // epoch ms

  // SECTION: seguridad/tiempos
  expirySkewSeconds: Number(process.env.T1_EXPIRY_SKEW_SECONDS || 60), // margen de seguridad para renovar antes
  requestTimeoutMs: Number(process.env.T1_HTTP_TIMEOUT_MS || 10000),
};

// ANCHOR: export
/**
 * Exporta la configuración global para ser utilizada por servicios y utilidades.
 */
module.exports = config;

// TODO: Exponer función para recargar config en caliente si se requiere rotación de credenciales.
// OPTIMIZE: Validar tipos y presencia mínima (username/password) y advertir si faltan.