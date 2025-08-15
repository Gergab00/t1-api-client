/**
 * @file src/config/index.js
 * @description Carga y expone la configuración global del cliente T1Comercios.
 * Lee las variables de entorno definidas en un archivo `.env` o en el entorno
 * de ejecución. También permite la carga desde un archivo JSON opcional
 * (config.json). La configuración incluye la URL base del API y las
 * credenciales necesarias para obtener un token de autenticación.
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Cargar variables de entorno desde .env si existe.
dotenv.config();

// Intentar cargar configuración JSON opcional (config.json)
let jsonConfig = {};
const jsonPath = path.resolve(__dirname, '../../config.json');
if (fs.existsSync(jsonPath)) {
  try {
    jsonConfig = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  } catch (err) {
    console.warn('No se pudo parsear config.json, se usará solo .env');
  }
}

/**
 * Objeto de configuración que centraliza valores sensibles y parámetros
 * utilizados por el cliente.
 *
 * @typedef {Object} Config
 * @property {string} baseURL URL base de la API T1Comercios.
 * @property {string} clientId Identificador de cliente usado para autenticar.
 * @property {string} username Usuario de acceso.
 * @property {string} password Contraseña de acceso.
 * @property {string|undefined} accessToken Token JWT asignado al autenticarse.
 */

const config = {
  baseURL: process.env.T1_BASE_URL || jsonConfig.T1_BASE_URL || 'https://api.t1comercios.com',
  clientId: process.env.T1_CLIENT_ID || jsonConfig.T1_CLIENT_ID || 'integradores',
  username: process.env.T1_USERNAME || jsonConfig.T1_USERNAME || '',
  password: process.env.T1_PASSWORD || jsonConfig.T1_PASSWORD || '',
  accessToken: undefined,
};

module.exports = config;