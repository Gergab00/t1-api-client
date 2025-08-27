/**
 * @file src/services/authService.js
 * @description Servicio de autenticación encargado de obtener y
 * almacenar el token de acceso a la API T1Comercios. Utiliza
 * el endpoint de OpenID Connect para obtener un token JWT. Este
 * módulo expone la función `login` que debe invocarse al iniciar
 * la aplicación para obtener y guardar el token en la configuración.
 */

const axios = require('axios');
const config = require('../config');

/**
 * Obtiene un token de acceso desde el servidor de autenticación de T1.
 * El token obtenido se guarda en la propiedad `config.accessToken` para
 * que pueda ser utilizado automáticamente por el cliente HTTP.
 *
 * @returns {Promise<string>} Token JWT de acceso.
 * @throws {Error} Si la autenticación falla o el servidor devuelve un error.
 */
async function login() {
  const params = new URLSearchParams();
  params.append('client_id', config.clientId);
  params.append('grant_type', 'password');
  params.append('username', config.username);
  params.append('password', config.password);

  try {
    const response = await axios.post(
      'https://loginclaro.com/auth/realms/plataforma-claro/protocol/openid-connect/token',
      params,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );
    const token = response.data.access_token;
    config.accessToken = token;
    return token;
  } catch (error) {
    // Propagar error de forma consistente
    const errResp = error.response || {};
    const message =
      (errResp.data && errResp.data.error_description) || error.message || 'Error de autenticación';
    throw new Error(message);
  }
}

module.exports = { login };