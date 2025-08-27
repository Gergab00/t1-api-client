/**
 * @file src/services/authService.js
 * @description Servicio de autenticación encargado de obtener y almacenar el token de acceso
 * (JWT) para la API T1Comercios a través del flujo Resource Owner Password (grant_type=password)
 * de OpenID Connect. Debe ejecutarse antes de consumir otros servicios protegidos.
 */

// ANCHOR: dependencias
const axios = require('axios'); // Se usa solicitud directa sin reutilizar httpClient (no hay token aún)
const config = require('../config'); // Configuración global (credenciales y almacenamiento de token)
const { AUTH_TOKEN_ENDPOINT } = require('../constants/const'); // Endpoint centralizado OIDC

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
    const token = response.data.access_token; // INFO: Campo estándar dentro de la respuesta OIDC.
    config.accessToken = token; // INFO: Se persiste para inyección automática en httpClient.
    return token; // Éxito: se devuelve el JWT.
  } catch (error) {
    // ANCHOR: manejo-error-auth
    // INFO: Normaliza el mensaje priorizando la descripción específica del servidor.
    const errResp = error.response || {};
    const message = (errResp.data && errResp.data.error_description) || error.message || 'Error de autenticación';
    throw new Error(message);
  }
}

// ANCHOR: exports
/**
 * Exporta la función de autenticación principal.
 * @module authService
 */
module.exports = { login };

// TODO: Añadir soporte para refresh_token si el backend lo expone.
// OPTIMIZE: Implementar control de expiración (exp) para renovar automáticamente antes de 401.
// WARN: Evitar almacenar credenciales planas en repositorios; usar variables de entorno.